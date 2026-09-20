require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const { query } = require('./db');
const { hashPassword, verifyPassword, createSession, getSession, deleteSession, requireAdminAuth } = require('./auth');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Helper row mappers
function mapService(row) {
  if (!row) return null;
  const stdPrice = Number(row.standard_price_per_kg || row.price_per_kg || 65);
  const nextPrice = Number(row.next_day_price_per_kg || Math.round(stdPrice * 1.3));
  const samePrice = Number(row.same_day_price_per_kg || Math.round(stdPrice * 1.75));
  return {
    id: row.id,
    name: row.name,
    nameTh: row.name_th,
    description: row.description,
    unit: row.unit || 'KG',
    pricePerKg: stdPrice,
    standardPricePerKg: stdPrice,
    nextDayPricePerKg: nextPrice,
    sameDayPricePerKg: samePrice,
    sameDayAvailable: row.same_day_available !== undefined && row.same_day_available !== null ? Boolean(row.same_day_available) : true,
    minWeightKg: Number(row.min_weight_kg),
    turnaroundHours: Number(row.turnaround_hours || 48),
    popular: Boolean(row.popular),
    features: Array.isArray(row.features) ? row.features : []
  };
}

function mapOrder(row) {
  if (!row) return null;
  return {
    id: row.id,
    customerName: row.customer_name,
    contactChannel: row.contact_channel,
    contactValue: row.contact_value,
    email: row.email,
    serviceId: row.service_id,
    serviceName: row.service_name,
    district: row.district,
    condoName: row.condo_name,
    roomNumber: row.room_number,
    leaveWithJuristic: Boolean(row.leave_with_juristic),
    estimatedWeightKg: row.estimated_weight_kg !== null ? Number(row.estimated_weight_kg) : null,
    actualWeightKg: row.actual_weight_kg !== null ? Number(row.actual_weight_kg) : null,
    minWeightAppliedKg: Number(row.min_weight_applied_kg || 4.0),
    pricePerKg: Number(row.price_per_kg),
    totalPrice: Number(row.total_price),
    turnaroundSpeed: row.turnaround_speed || 'standard_48h',
    status: row.status,
    paymentStatus: row.payment_status,
    paymentMethod: row.payment_method,
    paymentRef: row.payment_ref,
    tagNumber: row.tag_number,
    pickupDate: row.pickup_date,
    pickupTime: row.pickup_time,
    deliveryDate: row.delivery_date,
    deliveryTime: row.delivery_time,
    specialInstructions: row.special_instructions,
    agreedTerms: Boolean(row.agreed_terms),
    cashlessPolicyAcknowledged: Boolean(row.cashless_policy_acknowledged),
    timeline: Array.isArray(row.timeline) ? row.timeline : [],
    createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString()
  };
}

function mapIncident(row) {
  if (!row) return null;
  return {
    id: row.id,
    orderId: row.order_id,
    customerName: row.customer_name,
    channel: row.channel,
    contact: row.contact,
    subject: row.subject,
    message: row.message,
    category: row.category || 'General Inquiry',
    severity: row.severity || 'normal',
    affectedItem: row.affected_item || '',
    imageUrl: row.image_url || null,
    status: row.status,
    response: row.response,
    createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString()
  };
}

// 1. Health check
app.get('/api/health', async (req, res) => {
  try {
    const dbRes = await query('SELECT NOW() as db_time, current_database() as db_name');
    res.json({
      status: 'ok',
      db: 'connected',
      database: dbRes.rows[0].db_name,
      dbTime: dbRes.rows[0].db_time,
      cloudProvider: 'Google Cloud SQL (PostgreSQL)'
    });
  } catch (err) {
    res.status(500).json({ status: 'error', db: 'disconnected', error: err.message });
  }
});

// Admin Authentication Routes
app.post('/api/admin/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const trimmedUser = username.trim();
    const result = await query(
      'SELECT * FROM admin_users WHERE LOWER(username) = LOWER($1) OR LOWER(email) = LOWER($1) LIMIT 1',
      [trimmedUser]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const user = result.rows[0];
    const isValid = verifyPassword(password, user.password_hash, user.salt);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const session = createSession(user);
    res.json({
      success: true,
      token: session.token,
      expiresAt: session.expiresAt,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error('Admin login error:', err);
    res.status(500).json({ error: 'Internal server error during login' });
  }
});

app.get('/api/admin/verify', (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;
  const session = getSession(token);
  if (!session) {
    return res.status(401).json({ authenticated: false });
  }
  res.json({ authenticated: true, user: session });
});

app.post('/api/admin/logout', (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;
  if (token) {
    deleteSession(token);
  }
  res.json({ success: true });
});

app.post('/api/admin/change-password', requireAdminAuth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters long' });
    }

    const result = await query('SELECT * FROM admin_users WHERE id = $1', [req.adminUser.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Admin account not found' });
    }

    const user = result.rows[0];
    const isValid = verifyPassword(currentPassword, user.password_hash, user.salt);
    if (!isValid) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    const { hash, salt } = hashPassword(newPassword);
    await query(
      'UPDATE admin_users SET password_hash = $1, salt = $2, updated_at = NOW() WHERE id = $3',
      [hash, salt, user.id]
    );

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (err) {
    console.error('Change password error:', err);
    res.status(500).json({ error: 'Failed to update password' });
  }
});

// 2. Full State for instant hydration
app.get('/api/state', async (req, res) => {
  try {
    const [servicesRes, ordersRes, incidentsRes, settingsRes] = await Promise.all([
      query('SELECT * FROM services ORDER BY price_per_kg ASC'),
      query('SELECT * FROM orders ORDER BY created_at DESC'),
      query('SELECT * FROM incidents ORDER BY created_at DESC'),
      query("SELECT value FROM settings WHERE key = 'app_config'")
    ]);

    const services = servicesRes.rows.map(mapService);
    const orders = ordersRes.rows.map(mapOrder);
    const incidents = incidentsRes.rows.map(mapIncident);
    const settings = settingsRes.rows.length > 0 ? settingsRes.rows[0].value : null;

    res.json({
      services,
      orders,
      incidents,
      settings
    });
  } catch (err) {
    console.error('Error fetching /api/state:', err);
    res.status(500).json({ error: 'Failed to fetch state from PostgreSQL' });
  }
});

// 3. Services API
app.get('/api/services', async (req, res) => {
  try {
    const result = await query('SELECT * FROM services ORDER BY price_per_kg ASC');
    res.json(result.rows.map(mapService));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/services', requireAdminAuth, async (req, res) => {
  try {
    const s = req.body;
    const id = s.id || (s.name.toLowerCase().replace(/[^a-z0-9]/g, '_') + '_' + Math.floor(Math.random() * 1000));
    const stdPrice = Number(s.standardPricePerKg || s.pricePerKg) || 65;
    const nextPrice = Number(s.nextDayPricePerKg) || Math.round(stdPrice * 1.3);
    const samePrice = Number(s.sameDayPricePerKg) || Math.round(stdPrice * 1.75);
    const sameAvail = s.sameDayAvailable !== undefined ? Boolean(s.sameDayAvailable) : true;

    const result = await query(`
      INSERT INTO services (id, name, name_th, description, unit, price_per_kg, standard_price_per_kg, next_day_price_per_kg, same_day_price_per_kg, same_day_available, min_weight_kg, turnaround_hours, popular, features)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING *
    `, [
      id,
      s.name.trim(),
      s.nameTh ? s.nameTh.trim() : s.name.trim(),
      s.description || '',
      s.unit || 'KG',
      stdPrice,
      stdPrice,
      nextPrice,
      samePrice,
      sameAvail,
      Number(s.minWeightKg) || 4.0,
      Number(s.turnaroundHours) || 48,
      Boolean(s.popular),
      JSON.stringify(Array.isArray(s.features) ? s.features : [])
    ]);
    res.status(201).json(mapService(result.rows[0]));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Batch update services
app.put('/api/services', requireAdminAuth, async (req, res) => {
  try {
    const servicesList = req.body;
    if (!Array.isArray(servicesList)) {
      return res.status(400).json({ error: 'Expected an array of services' });
    }

    for (const s of servicesList) {
      if (!s || !s.id) continue;
      const stdPrice = s.standardPricePerKg !== undefined ? Number(s.standardPricePerKg) : (s.pricePerKg !== undefined ? Number(s.pricePerKg) : null);
      const nextPrice = s.nextDayPricePerKg !== undefined ? Number(s.nextDayPricePerKg) : null;
      const samePrice = s.sameDayPricePerKg !== undefined ? Number(s.sameDayPricePerKg) : null;
      const sameAvail = s.sameDayAvailable !== undefined ? Boolean(s.sameDayAvailable) : null;

      await query(`
        UPDATE services
        SET name = COALESCE($1, name),
            name_th = COALESCE($2, name_th),
            description = COALESCE($3, description),
            price_per_kg = COALESCE($4, price_per_kg),
            standard_price_per_kg = COALESCE($4, standard_price_per_kg),
            next_day_price_per_kg = COALESCE($5, next_day_price_per_kg),
            same_day_price_per_kg = COALESCE($6, same_day_price_per_kg),
            same_day_available = COALESCE($7, same_day_available),
            min_weight_kg = COALESCE($8, min_weight_kg),
            turnaround_hours = COALESCE($9, turnaround_hours),
            popular = COALESCE($10, popular),
            features = COALESCE($11::jsonb, features),
            updated_at = NOW()
        WHERE id = $12
      `, [
        s.name !== undefined ? s.name.trim() : null,
        s.nameTh !== undefined ? s.nameTh.trim() : null,
        s.description !== undefined ? s.description.trim() : null,
        stdPrice,
        nextPrice,
        samePrice,
        sameAvail,
        s.minWeightKg !== undefined ? Math.max(1, Number(s.minWeightKg)) : null,
        s.turnaroundHours !== undefined ? Number(s.turnaroundHours) : null,
        s.popular !== undefined ? Boolean(s.popular) : null,
        s.features !== undefined ? JSON.stringify(s.features) : null,
        s.id
      ]);
    }

    const updated = await query('SELECT * FROM services ORDER BY price_per_kg ASC');
    console.log(`[POSTGRES] Batch updated ${servicesList.length} services successfully.`);
    res.json(updated.rows.map(mapService));
  } catch (err) {
    console.error('[POSTGRES ERROR] Batch services update failed:', err);
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/services/:id', requireAdminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const s = req.body;
    const stdPrice = s.standardPricePerKg !== undefined ? Number(s.standardPricePerKg) : (s.pricePerKg !== undefined ? Number(s.pricePerKg) : null);
    const nextPrice = s.nextDayPricePerKg !== undefined ? Number(s.nextDayPricePerKg) : null;
    const samePrice = s.sameDayPricePerKg !== undefined ? Number(s.sameDayPricePerKg) : null;
    const sameAvail = s.sameDayAvailable !== undefined ? Boolean(s.sameDayAvailable) : null;

    const result = await query(`
      UPDATE services
      SET name = COALESCE($1, name),
          name_th = COALESCE($2, name_th),
          description = COALESCE($3, description),
          price_per_kg = COALESCE($4, price_per_kg),
          standard_price_per_kg = COALESCE($4, standard_price_per_kg),
          next_day_price_per_kg = COALESCE($5, next_day_price_per_kg),
          same_day_price_per_kg = COALESCE($6, same_day_price_per_kg),
          same_day_available = COALESCE($7, same_day_available),
          min_weight_kg = COALESCE($8, min_weight_kg),
          turnaround_hours = COALESCE($9, turnaround_hours),
          popular = COALESCE($10, popular),
          features = COALESCE($11::jsonb, features),
          updated_at = NOW()
      WHERE id = $12
      RETURNING *
    `, [
      s.name !== undefined ? s.name.trim() : null,
      s.nameTh !== undefined ? s.nameTh.trim() : null,
      s.description !== undefined ? s.description.trim() : null,
      stdPrice,
      nextPrice,
      samePrice,
      sameAvail,
      s.minWeightKg !== undefined ? Math.max(1, Number(s.minWeightKg)) : null,
      s.turnaroundHours !== undefined ? Number(s.turnaroundHours) : null,
      s.popular !== undefined ? Boolean(s.popular) : null,
      s.features !== undefined ? JSON.stringify(s.features) : null,
      id
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Service not found' });
    }
    console.log(`[POSTGRES] Service '${id}' updated: std=${stdPrice}, next=${nextPrice}, same=${samePrice}`);
    res.json(mapService(result.rows[0]));
  } catch (err) {
    console.error(`[POSTGRES ERROR] Updating service '${req.params.id}':`, err);
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/services/:id', requireAdminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    await query('DELETE FROM services WHERE id = $1', [id]);
    res.json({ success: true, id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Orders API
app.get('/api/orders', async (req, res) => {
  try {
    const result = await query('SELECT * FROM orders ORDER BY created_at DESC');
    res.json(result.rows.map(mapOrder));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/orders', async (req, res) => {
  try {
    const o = req.body;
    const trackingNumber = o.id || ('NNL-' + Math.floor(1000 + Math.random() * 9000) + '-BK');
    const now = new Date();
    const timestampStr = now.toISOString().replace('T', ' ').substring(0, 16);

    const initialTimeline = o.timeline && o.timeline.length > 0 ? o.timeline : [
      {
        status: 'BOOKING_REQUESTED',
        timestamp: timestampStr,
        note: `Booking created online via ${(o.contactChannel || 'online').toUpperCase()}. Pick-up requested at ${o.condoName || o.district || 'Bangkok'}.`
      }
    ];

    const result = await query(`
      INSERT INTO orders (
        id, customer_name, contact_channel, contact_value, email,
        service_id, service_name, district, condo_name, room_number,
        leave_with_juristic, estimated_weight_kg, actual_weight_kg,
        min_weight_applied_kg, price_per_kg, total_price, turnaround_speed, status,
        payment_status, payment_method, payment_ref, tag_number,
        pickup_date, pickup_time, delivery_date, delivery_time,
        special_instructions, agreed_terms, cashless_policy_acknowledged,
        timeline, created_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
        $11, $12, $13, $14, $15, $16, $17, $18, $19, $20,
        $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31
      )
      RETURNING *
    `, [
      trackingNumber,
      o.customerName,
      o.contactChannel,
      o.contactValue,
      o.email || null,
      o.serviceId || null,
      o.serviceName || 'Wash / Fold',
      o.district || null,
      o.condoName || null,
      o.roomNumber || null,
      Boolean(o.leaveWithJuristic),
      Number(o.estimatedWeightKg) || 0,
      o.actualWeightKg !== undefined && o.actualWeightKg !== null ? Number(o.actualWeightKg) : null,
      Number(o.minWeightAppliedKg) || 4.0,
      Number(o.pricePerKg) || 65,
      Number(o.totalPrice) || 0,
      o.turnaroundSpeed || 'next_day',
      o.status || 'BOOKING_REQUESTED',
      o.paymentStatus || 'PENDING',
      o.paymentMethod || null,
      o.paymentRef || null,
      o.tagNumber || 'TAG-PENDING',
      o.pickupDate || null,
      o.pickupTime || null,
      o.deliveryDate || 'Scheduled (24-48h)',
      o.deliveryTime || 'TBD',
      o.specialInstructions || '',
      Boolean(o.agreedTerms),
      Boolean(o.cashlessPolicyAcknowledged),
      JSON.stringify(initialTimeline),
      now
    ]);

    res.status(201).json(mapOrder(result.rows[0]));
  } catch (err) {
    console.error('Error inserting order:', err);
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/orders/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { newStatus, note, actualWeightKg, tagNumber } = req.body;

    const existingRes = await query('SELECT * FROM orders WHERE id = $1', [id]);
    if (existingRes.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const currentOrder = existingRes.rows[0];
    const now = new Date();
    const timestampStr = now.toISOString().replace('T', ' ').substring(0, 16);

    let updatedActualKg = currentOrder.actual_weight_kg;
    let updatedTotal = currentOrder.total_price;
    if (actualWeightKg !== undefined && actualWeightKg !== null && actualWeightKg !== '') {
      updatedActualKg = Number(actualWeightKg);
      const billableKg = Math.max(updatedActualKg, Number(currentOrder.min_weight_applied_kg || 4.0));
      updatedTotal = Math.round(billableKg * Number(currentOrder.price_per_kg));
    }

    const updatedTagNumber = (tagNumber && tagNumber.trim()) ? tagNumber.trim() : currentOrder.tag_number;
    const currentTimeline = Array.isArray(currentOrder.timeline) ? currentOrder.timeline : [];
    const newTimelineEvent = {
      status: newStatus,
      timestamp: timestampStr,
      note: note || (`Status updated to ${newStatus.replace(/_/g, ' ')}.`)
    };
    const updatedTimeline = [...currentTimeline, newTimelineEvent];

    const result = await query(`
      UPDATE orders
      SET status = $1,
          actual_weight_kg = $2,
          total_price = $3,
          tag_number = $4,
          timeline = $5,
          updated_at = NOW()
      WHERE id = $6
      RETURNING *
    `, [
      newStatus,
      updatedActualKg,
      updatedTotal,
      updatedTagNumber,
      JSON.stringify(updatedTimeline),
      id
    ]);

    res.json(mapOrder(result.rows[0]));
  } catch (err) {
    console.error('Error updating order status:', err);
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/orders/:id/pay', async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentMethod = 'PromptPay QR', transactionRef = '' } = req.body;

    const existingRes = await query('SELECT * FROM orders WHERE id = $1', [id]);
    if (existingRes.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const currentOrder = existingRes.rows[0];
    const now = new Date();
    const timestampStr = now.toISOString().replace('T', ' ').substring(0, 16);
    const ref = transactionRef || ('TXN-' + Math.floor(100000 + Math.random() * 900000));

    const currentTimeline = Array.isArray(currentOrder.timeline) ? currentOrder.timeline : [];
    const newTimelineEvent = {
      status: 'PAID',
      timestamp: timestampStr,
      note: `Cashless payment verified via 3rd-Party Gateway (${paymentMethod}). Ref: ${ref}. Amount: ฿${currentOrder.total_price} THB.`
    };

    const result = await query(`
      UPDATE orders
      SET payment_status = 'PAID',
          payment_method = $1,
          payment_ref = $2,
          timeline = $3,
          updated_at = NOW()
      WHERE id = $4
      RETURNING *
    `, [
      paymentMethod,
      ref,
      JSON.stringify([...currentTimeline, newTimelineEvent]),
      id
    ]);

    res.json(mapOrder(result.rows[0]));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Incidents API
app.get('/api/incidents', async (req, res) => {
  try {
    const result = await query('SELECT * FROM incidents ORDER BY created_at DESC');
    res.json(result.rows.map(mapIncident));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/incidents', async (req, res) => {
  try {
    const inc = req.body;
    const id = inc.id || ('INC-' + Math.floor(100 + Math.random() * 900));
    const result = await query(`
      INSERT INTO incidents (id, order_id, customer_name, channel, contact, subject, message, category, severity, affected_item, image_url, status, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'pending', NOW())
      RETURNING *
    `, [
      id,
      inc.orderId || null,
      inc.customerName || '',
      inc.channel || 'online',
      inc.contact || '',
      inc.subject || '',
      inc.message || '',
      inc.category || 'General Inquiry',
      inc.severity || 'normal',
      inc.affectedItem || '',
      inc.imageUrl || null
    ]);
    res.status(201).json(mapIncident(result.rows[0]));
  } catch (err) {
    console.error('Error creating incident:', err);
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/incidents/:id/resolve', requireAdminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { responseText } = req.body;
    const result = await query(`
      UPDATE incidents
      SET status = 'resolved',
          response = $1,
          updated_at = NOW()
      WHERE id = $2
      RETURNING *
    `, [responseText, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Incident not found' });
    }
    res.json(mapIncident(result.rows[0]));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/incidents/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await query('DELETE FROM incidents WHERE id = $1', [id]);
    res.json({ success: true, deletedId: id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 6. Settings API
app.get('/api/settings', async (req, res) => {
  try {
    const result = await query("SELECT value FROM settings WHERE key = 'app_config'");
    if (result.rows.length === 0) {
      return res.json({});
    }
    res.json(result.rows[0].value);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/settings', requireAdminAuth, async (req, res) => {
  try {
    const updatedSettings = req.body;
    await query(`
      INSERT INTO settings (key, value, updated_at)
      VALUES ('app_config', $1, NOW())
      ON CONFLICT (key)
      DO UPDATE SET value = $1, updated_at = NOW()
    `, [JSON.stringify(updatedSettings)]);
    console.log('[POSTGRES] Settings updated successfully:', Object.keys(updatedSettings));
    res.json({ success: true, settings: updatedSettings });
  } catch (err) {
    console.error('[POSTGRES ERROR] Updating settings:', err);
    res.status(500).json({ error: err.message });
  }
});

// Static assets serving
const publicDir = path.join(__dirname, '..');
app.use(express.static(publicDir));

// Fallback for SPA routing
app.get('*', (req, res) => {
  res.sendFile(path.join(publicDir, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(` NoName Laundry Bangkok Server running on port ${PORT}`);
  console.log(` Connected to Google Cloud SQL (PostgreSQL)`);
  console.log(` Local URL: http://localhost:${PORT}`);
  console.log(`====================================================`);
});
