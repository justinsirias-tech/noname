const crypto = require('crypto');
const { Pool, Client } = require('pg');
const { TLS_BRAND } = require('./tlsProxy');

const isProductionEnv =
  process.env.NODE_ENV === 'production' ||
  Boolean(process.env.K_SERVICE) ||
  Boolean(process.env.DATABASE_URL && process.env.DATABASE_URL.includes('34.10.25.133'));

const TLS_CLOUD_DB_URL =
  process.env.TLS_CLOUD_DB_URL ||
  (isProductionEnv
    ? 'postgresql://postgres:%40K0tApq9R%40(CEQk%22@34.10.25.133:5432/postgres'
    : 'postgresql://postgres:%40K0tApq9R%40(CEQk%22@34.10.25.133:5432/tls_test');

const TLS_ENV_LABEL = TLS_CLOUD_DB_URL.endsWith('/postgres') ? 'TLS_DB_PROD (/postgres)' : 'TLS_DB_TEST (/tls_test)';

const PG_CHANNEL = 'tls_realtime_events';
const INSTANCE_ID = 'noname-web-' + crypto.randomUUID().slice(0, 6);

const tlsPool = new Pool({
  connectionString: TLS_CLOUD_DB_URL,
  ssl: { rejectUnauthorized: false },
  max: 6,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000
});

tlsPool.on('error', (err) => {
  console.warn('[TLS-SYNC] Pool background error:', err.message);
});

// Track recent outbound sync timestamps to prevent echo loops from PG LISTEN
const recentOutboundJobSyncs = new Map(); // jobId -> epoch ms
const recentOutboundCustSyncs = new Map(); // customerId -> epoch ms

function markOutboundJobSync(jobId) {
  if (!jobId) return;
  recentOutboundJobSyncs.set(jobId, Date.now());
  if (recentOutboundJobSyncs.size > 500) {
    const cutoff = Date.now() - 30000;
    for (const [k, ts] of recentOutboundJobSyncs.entries()) {
      if (ts < cutoff) recentOutboundJobSyncs.delete(k);
    }
  }
}

function markOutboundCustSync(custId) {
  if (!custId) return;
  recentOutboundCustSyncs.set(custId, Date.now());
  if (recentOutboundCustSyncs.size > 500) {
    const cutoff = Date.now() - 30000;
    for (const [k, ts] of recentOutboundCustSyncs.entries()) {
      if (ts < cutoff) recentOutboundCustSyncs.delete(k);
    }
  }
}

/**
 * Hash a customer password/PIN using PBKDF2 compatible with TLS_POS external-api-auth.ts
 */
function hashTlsCustomerPassword(password) {
  const clean = String(password || '123456').trim() || '123456';
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(clean, salt, 10000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

/**
 * Emit PG NOTIFY on tls_realtime_events so TLS_POS All Jobs & CRM UI update in real time
 */
async function notifyTlsRealtime(payload) {
  try {
    const now = new Date();
    const event = {
      eventId: crypto.randomUUID(),
      revision: now.getTime(),
      updatedAt: now.toISOString(),
      brand: TLS_BRAND || 'noname_laundry',
      instanceId: INSTANCE_ID,
      ...payload
    };
    await tlsPool.query(`SELECT pg_notify($1, $2)`, [PG_CHANNEL, JSON.stringify(event)]);
  } catch (err) {
    console.warn('[TLS-SYNC] pg_notify warning:', err.message);
  }
}

/**
 * Map Noname Order Status -> TLS All Jobs (status, subStatus, kanbanStage)
 */
function mapNonameToTlsStatus(nonameStatus) {
  const s = String(nonameStatus || 'TBA').toUpperCase().trim();
  switch (s) {
    case 'TBA':
    case 'BOOKING_REQUESTED':
    case 'PENDING':
    case 'PENDING_CONFIRMATION':
      return { status: 'tba', subStatus: null, kanbanStage: null };
    case 'SCHEDULED':
    case 'PICKUP_SCHEDULED':
      return { status: 'pending', subStatus: null, kanbanStage: null };
    case 'PICKED_UP':
      return { status: 'pickup', subStatus: null, kanbanStage: null };
    case 'BILLING':
    case 'BILLING_PENDING':
    case 'AWAITING_PAYMENT':
    case 'WEIGHED_INSPECTED':
      return { status: 'billing', subStatus: 'billing', kanbanStage: 'billing' };
    case 'IN_PROCESS':
    case 'IN_WASH':
    case 'IRON_FOLD':
    case 'PROCESSING':
      return { status: 'billing', subStatus: 'wash', kanbanStage: 'process' };
    case 'READY_FOR_DELIVERY':
    case 'OUT_FOR_DELIVERY':
      return { status: 'delivery', subStatus: 'ready', kanbanStage: null };
    case 'DELIVERED':
    case 'COMPLETED':
      return { status: 'completed', subStatus: 'ready', kanbanStage: 'completed' };
    case 'CANCELLED':
    case 'CANCEL':
      return { status: 'cancel', subStatus: null, kanbanStage: null };
    default:
      return { status: 'tba', subStatus: null, kanbanStage: null };
  }
}

/**
 * Map TLS All Jobs (status, subStatus, adminNotesJson) -> Noname Order Status
 */
function mapTlsToNonameStatus(tlsStatus, subStatus, adminNotesObj) {
  const st = String(tlsStatus || 'tba').toLowerCase().trim();
  const sub = String(subStatus || '').toLowerCase().trim();
  const stage = adminNotesObj?.kanbanStage ? String(adminNotesObj.kanbanStage).toLowerCase().trim() : null;

  if (st === 'tba') return 'TBA';
  if (st === 'pending' || st === 'assigned') return 'SCHEDULED';
  if (st === 'pickup' || st === 'picked_up') return 'PICKED_UP';
  if (st === 'billing') {
    if (stage === 'process') return 'IN_PROCESS';
    if (stage === 'billing') return 'BILLING';
    if (['wash', 'dry', 'iron', 'ready', 'process'].includes(sub)) return 'IN_PROCESS';
    return 'BILLING';
  }
  if (st === 'process' || st === 'in_process') return 'IN_PROCESS';
  if (st === 'delivery' || st === 'out_for_delivery') return 'READY_FOR_DELIVERY';
  if (st === 'completed') return 'DELIVERED';
  if (st === 'cancel' || st === 'cancelled') return 'CANCELLED';
  return 'TBA';
}

/**
 * Parse Scheduled Date and TimeSlot in Thailand timezone (UTC+7)
 */
function parseBangkokScheduledDate(scheduledDate, timeSlot) {
  if (!scheduledDate) return new Date();
  const match = String(scheduledDate).match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) {
    const parsed = new Date(scheduledDate);
    return isNaN(parsed.getTime()) ? new Date() : parsed;
  }
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  let hour = 10;
  let minute = 0;
  if (timeSlot && typeof timeSlot === 'string') {
    const tMatch = timeSlot.match(/(\d{1,2})(?::(\d{2}))?/);
    if (tMatch) {
      hour = Math.min(23, Math.max(0, parseInt(tMatch[1], 10)));
      if (tMatch[2]) minute = Math.min(59, Math.max(0, parseInt(tMatch[2], 10)));
    }
  }
  const BANGKOK_OFFSET_MS = 7 * 60 * 60 * 1000;
  return new Date(Date.UTC(year, month - 1, day, hour, minute, 0, 0) - BANGKOK_OFFSET_MS);
}

/**
 * 1. Sync Customer from Noname -> TLS Cloud ("Customer" & "CustomerAddress")
 */
async function syncCustomerToTlsCloud(cust, localQuery = null) {
  if (!cust) return null;
  try {
    const brand = TLS_BRAND || 'noname_laundry';
    const fullName = String(
      cust.fullName ||
      cust.name ||
      `${cust.firstName || ''} ${cust.lastName || ''}`.trim() ||
      'Online Customer'
    ).trim().toUpperCase();

    const rawPhone = String(cust.mobileNumber || cust.phone || cust.contactValue || '').trim();
    const cleanDigits = rawPhone.replace(/\D/g, '');
    const phoneSuffix = cleanDigits.length >= 8 ? cleanDigits.slice(-8) : cleanDigits;
    const cleanPhone = cleanDigits || rawPhone;
    const cleanEmail = cust.email ? String(cust.email).trim().toLowerCase() : null;

    if (!cleanPhone && !cleanEmail && !cust.id) return null;

    // 1. Find existing customer in TLS Cloud strictly for brand = 'noname_laundry'
    //    If a customer with the same phone exists in TLS under 'that_laundry_shop' (not 'noname_laundry'),
    //    we do NOT use or overwrite the TLS customer — we create a separate 'noname_laundry' customer record in TLS.
    let existingTlsCust = null;
    if (cust.id) {
      const byId = await tlsPool.query(
        'SELECT * FROM "Customer" WHERE id = $1 AND brand = $2 LIMIT 1',
        [cust.id, brand]
      );
      if (byId.rows.length > 0) existingTlsCust = byId.rows[0];
    }

    if (!existingTlsCust && phoneSuffix && phoneSuffix.length >= 8) {
      const byPhone = await tlsPool.query(
        `SELECT * FROM "Customer"
         WHERE brand = $1
           AND (phone = $2 OR regexp_replace(COALESCE(phone, ''), '[^0-9]', '', 'g') LIKE '%' || $3)
         ORDER BY "updatedAt" DESC LIMIT 1`,
        [brand, cleanPhone, phoneSuffix]
      );
      if (byPhone.rows.length > 0) existingTlsCust = byPhone.rows[0];
    }

    if (!existingTlsCust && cleanEmail && !cleanEmail.includes('@customer.local')) {
      const byEmail = await tlsPool.query(
        `SELECT * FROM "Customer"
         WHERE brand = $1 AND LOWER(email) = LOWER($2)
         ORDER BY "updatedAt" DESC LIMIT 1`,
        [brand, cleanEmail]
      );
      if (byEmail.rows.length > 0) existingTlsCust = byEmail.rows[0];
    }

    const addresses = Array.isArray(cust.addresses) ? cust.addresses : [];
    const primaryAddr = addresses.find(a => a && a.isPrimary) || addresses[0] || (cust.condoName || cust.district ? {
      label: cust.condoName || 'Home Condo',
      placeName: cust.condoName || '',
      address: `${cust.condoName || ''}, ${cust.district || 'Bangkok'}`.replace(/^,\s*/, ''),
      district: cust.district || 'Bangkok',
      subDistrict: cust.subdistrict || '',
      postalCode: cust.postalCode || '10110',
      roomNumber: cust.roomNumber || '',
      leaveWithJuristic: cust.leaveWithJuristic !== false,
      isPrimary: true
    } : null);

    const companyTax = cust.companyTax && typeof cust.companyTax === 'object' ? cust.companyTax : {};
    const taxId = companyTax.taxId || cust.taxId || null;
    const companyName = companyTax.companyName || cust.companyName || null;
    const nickName = (cust.nickName || cust.firstName || fullName.split(' ')[0] || '').trim() || null;
    const gender = cust.gender || 'Rather not say';
    const dob = cust.dateOfBirth || cust.dob || null;
    const secondaryPhone = cust.secondaryMobile || cust.secondaryPhone || null;
    const lineId = cust.lineId || null;
    const tier = cust.tier || 'Regular';
    const notes = cust.notes !== undefined ? cust.notes : (cust.remark || null);

    let targetCustId = existingTlsCust ? existingTlsCust.id : (cust.id || crypto.randomUUID());
    if (!existingTlsCust && cust.id) {
      // Ensure cust.id doesn't collide with a primary key of a different brand in TLS
      const idCollision = await tlsPool.query(
        'SELECT id FROM "Customer" WHERE id = $1 AND brand <> $2 LIMIT 1',
        [cust.id, brand]
      );
      if (idCollision.rows.length > 0) {
        targetCustId = `NNL-${cust.id}`;
      }
    }
    markOutboundCustSync(targetCustId);

    if (existingTlsCust) {
      await tlsPool.query(
        `UPDATE "Customer" SET
          name = COALESCE($1, name),
          "nickName" = COALESCE($2, "nickName"),
          phone = COALESCE($3, phone),
          "secondaryPhone" = COALESCE($4, "secondaryPhone"),
          email = COALESCE($5, email),
          "lineId" = COALESCE($6, "lineId"),
          gender = COALESCE($7, gender),
          dob = COALESCE($8, dob),
          tier = COALESCE($9, tier),
          remark = COALESCE($10, remark),
          "taxId" = COALESCE($11, "taxId"),
          "companyName" = COALESCE($12, "companyName"),
          "defaultAddress" = COALESCE($13, "defaultAddress"),
          "roomNo" = COALESCE($14, "roomNo"),
          "updatedAt" = NOW()
        WHERE id = $15`,
        [
          fullName || null,
          nickName,
          cleanPhone || null,
          secondaryPhone,
          cleanEmail,
          lineId,
          gender,
          dob,
          tier,
          notes,
          taxId,
          companyName,
          primaryAddr ? (primaryAddr.address || primaryAddr.label || null) : null,
          primaryAddr ? (primaryAddr.roomNumber || null) : null,
          targetCustId
        ]
      );
    } else {
      const passwordHash = hashTlsCustomerPassword(cust.pinCode || cust.password || '123456');
      await tlsPool.query(
        `INSERT INTO "Customer" (
          id, name, "nickName", phone, "secondaryPhone", email, "lineId",
          "passwordHash", gender, dob, brand, "sourceSystem",
          "isVerified", tier, "defaultAddress", "roomNo", "secondaryAddress",
          remark, "taxId", "companyName", "isWhatsapp", "isSecondaryWhatsapp",
          "createdAt", "updatedAt"
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7,
          $8, $9, $10, $11, 'web_booking',
          $12, $13, $14, $15, $16,
          $17, $18, $19, $20, $21,
          NOW(), NOW()
        ) ON CONFLICT (id) DO NOTHING`,
        [
          targetCustId,
          fullName,
          nickName,
          cleanPhone || '',
          secondaryPhone,
          cleanEmail,
          lineId,
          passwordHash,
          gender,
          dob,
          brand,
          Boolean(cust.isVerified),
          tier,
          primaryAddr ? (primaryAddr.address || primaryAddr.label || null) : null,
          primaryAddr ? (primaryAddr.roomNumber || null) : null,
          primaryAddr?.roomNumber ? `Room ${primaryAddr.roomNumber}` : null,
          notes,
          taxId,
          companyName,
          cust.isWhatsApp !== false,
          Boolean(cust.isSecondaryWhatsApp)
        ]
      );
    }

    // Sync Primary Address to "CustomerAddress"
    if (primaryAddr && (primaryAddr.address || primaryAddr.label || primaryAddr.placeName)) {
      const existingAddrs = await tlsPool.query(
        'SELECT id FROM "CustomerAddress" WHERE "customerId" = $1 ORDER BY "isPrimary" DESC, "createdAt" DESC LIMIT 1',
        [targetCustId]
      );
      const addrLabel = primaryAddr.label || primaryAddr.placeName || 'Home Condo';
      const addrText = primaryAddr.address || primaryAddr.placeName || addrLabel;
      const addrRoom = primaryAddr.roomNumber || null;
      const addrSub = primaryAddr.subDistrict || primaryAddr.subdistrict || null;
      const addrDist = primaryAddr.district || 'Bangkok';
      const addrPostal = primaryAddr.postalCode || null;
      const addrLat = primaryAddr.latitude ? parseFloat(primaryAddr.latitude) : null;
      const addrLng = primaryAddr.longitude ? parseFloat(primaryAddr.longitude) : null;
      const addrMaps = primaryAddr.googleMapsUrl || null;
      const addrJuristic = primaryAddr.leaveWithJuristic !== false;

      if (existingAddrs.rows.length > 0) {
        await tlsPool.query(
          `UPDATE "CustomerAddress" SET
            label = $1,
            "placeName" = $2,
            address = $3,
            "roomNumber" = $4,
            "subDistrict" = COALESCE($5, "subDistrict"),
            district = COALESCE($6, district),
            "postalCode" = COALESCE($7, "postalCode"),
            latitude = COALESCE($8, latitude),
            longitude = COALESCE($9, longitude),
            "googleMapsUrl" = COALESCE($10, "googleMapsUrl"),
            "contactName" = $11,
            "contactPhone" = $12,
            "leaveWithJuristic" = $13,
            "updatedAt" = NOW()
          WHERE id = $14`,
          [
            addrLabel,
            primaryAddr.placeName || addrLabel,
            addrText,
            addrRoom,
            addrSub,
            addrDist,
            addrPostal,
            addrLat,
            addrLng,
            addrMaps,
            fullName,
            cleanPhone,
            addrJuristic,
            existingAddrs.rows[0].id
          ]
        );
      } else {
        await tlsPool.query(
          `INSERT INTO "CustomerAddress" (
            id, "customerId", label, "placeName", address, "roomNumber",
            "subDistrict", district, province, "postalCode",
            latitude, longitude, "googleMapsUrl",
            "contactName", "contactPhone", "leaveWithJuristic", "isPrimary",
            "createdAt", "updatedAt"
          ) VALUES (
            $1, $2, $3, $4, $5, $6,
            $7, $8, 'Bangkok', $9,
            $10, $11, $12,
            $13, $14, $15, TRUE,
            NOW(), NOW()
          )`,
          [
            crypto.randomUUID(),
            targetCustId,
            addrLabel,
            primaryAddr.placeName || addrLabel,
            addrText,
            addrRoom,
            addrSub,
            addrDist,
            addrPostal,
            addrLat,
            addrLng,
            addrMaps,
            fullName,
            cleanPhone,
            addrJuristic
          ]
        );
      }
    }

    await notifyTlsRealtime({
      type: 'customer.updated',
      customerId: targetCustId,
      action: 'noname_crm_sync',
      actorName: 'NoName CRM'
    });

    return targetCustId;
  } catch (err) {
    console.warn('[TLS-SYNC] syncCustomerToTlsCloud warning:', err.message);
    return cust?.id || null;
  }
}

/**
 * Delete Customer from TLS Cloud when deleted in Noname CRM
 */
async function deleteCustomerFromTlsCloud(customerId) {
  if (!customerId) return;
  try {
    const brand = TLS_BRAND || 'noname_laundry';
    await tlsPool.query('DELETE FROM "CustomerAddress" WHERE "customerId" = $1', [customerId]);
    await tlsPool.query('DELETE FROM "Customer" WHERE id = $1 AND brand = $2', [customerId, brand]);
    await notifyTlsRealtime({
      type: 'customer.updated',
      customerId,
      action: 'noname_crm_delete',
      actorName: 'NoName CRM'
    });
  } catch (err) {
    console.warn('[TLS-SYNC] deleteCustomerFromTlsCloud warning:', err.message);
  }
}

const orderSyncChains = new Map(); // orderId -> Promise
const resolvedTlsCustomerIds = new Map(); // nonameCustomerId or phone -> tlsCustomerId

/**
 * 2. Sync Order from Noname -> TLS Cloud ("Job" in All Jobs)
 */
async function syncOrderToTlsCloud(o) {
  if (!o || !o.id) return null;
  const prev = orderSyncChains.get(o.id) || Promise.resolve();
  const next = prev
    .catch(() => {})
    .then(() => _syncOrderToTlsCloudImpl(o));
  orderSyncChains.set(o.id, next);
  try {
    return await next;
  } finally {
    if (orderSyncChains.get(o.id) === next) {
      orderSyncChains.delete(o.id);
    }
  }
}

async function _syncOrderToTlsCloudImpl(o) {
  if (!o || !o.id) return null;
  try {
    const brand = TLS_BRAND || 'noname_laundry';
    const cleanPhone = String(o.contactValue || o.phone || o.mobileNumber || '').replace(/[^0-9]/g, '');

    // Ensure customer is synced in TLS Cloud CRM first (use cache on rapid status updates)
    const custCacheKey = o.customerId || cleanPhone;
    let tlsCustomerId = (custCacheKey && resolvedTlsCustomerIds.get(custCacheKey)) || null;
    if (!tlsCustomerId) {
      const syncedCustId = await syncCustomerToTlsCloud({
        id: o.customerId,
        firstName: o.firstName,
        lastName: o.lastName,
        fullName: o.customerName,
        mobileNumber: cleanPhone || o.contactValue,
        email: o.email,
        condoName: o.condoName,
        roomNumber: o.roomNumber,
        district: o.district,
        subdistrict: o.subdistrict,
        postalCode: o.postalCode,
        leaveWithJuristic: o.leaveWithJuristic
      });
      if (syncedCustId) {
        tlsCustomerId = syncedCustId;
        if (o.customerId) resolvedTlsCustomerIds.set(o.customerId, syncedCustId);
        if (cleanPhone) resolvedTlsCustomerIds.set(cleanPhone, syncedCustId);
      }
    }

    const { status: tlsStatus, subStatus: tlsSubStatus, kanbanStage } = mapNonameToTlsStatus(o.status);

    // Note: Service prices, item subtotals, and delivery fees are intentionally NOT synced
    // between NoName Laundry and TLS POS because each system uses its own pricing & delivery fee structure.
    const isPaid = String(o.paymentStatus || '').toUpperCase() === 'PAID';
    const scheduledTime = parseBangkokScheduledDate(o.pickupDate, o.pickupTime);
    const branchId = (String(o.city || '').toLowerCase().includes('pattaya') || String(o.id).endsWith('-PT'))
      ? 'SHOP-MOLCJ2X8'
      : 'shop-head';

    const pickupLocParts = [
      o.condoName,
      o.roomNumber ? `Room ${o.roomNumber}` : '',
      o.subdistrict,
      o.district || 'Bangkok'
    ].filter(Boolean);
    const fullPickupLocation = pickupLocParts.join(', ') || 'Bangkok';

    const remarkParts = [
      `[Noname Web Booking: ${o.id}]`,
      o.condoName ? `Condo: ${o.condoName}` : '',
      o.roomNumber ? `Room: ${o.roomNumber}` : '',
      `TimeSlot: ${o.pickupTime || 'Anytime'}`,
      o.serviceName ? `Services: ${o.serviceName}` : '',
      o.leaveWithJuristic ? 'อนุญาตให้ฝากนิติบุคคลได้' : '',
      o.tagNumber && o.tagNumber !== 'TAG-PENDING' ? `Tag: ${o.tagNumber}` : '',
      o.specialInstructions ? `Note: ${o.specialInstructions}` : ''
    ].filter(Boolean).join(' | ');

    // Check if Job already exists in TLS Cloud (by id, or by nonameOrderId in remark/adminNotesJson)
    const existingRes = await tlsPool.query(
      `SELECT id, "adminNotesJson", status, "subStatus", "branchId", "completedAt", "shopPaidAt"
       FROM "Job"
       WHERE id = $1
          OR (brand = $2 AND remark LIKE $3)
       ORDER BY CASE WHEN id = $1 THEN 0 ELSE 1 END, "createdAt" DESC
       LIMIT 1`,
      [o.id, brand, `%[Noname Web Booking: ${o.id}]%`]
    );

    const existingJob = existingRes.rows[0] || null;
    const targetJobId = existingJob ? existingJob.id : o.id;
    markOutboundJobSync(targetJobId);
    markOutboundJobSync(o.id);

    // Merge adminNotesJson preserving existing TLS metadata
    let adminNotes = {};
    if (existingJob?.adminNotesJson) {
      try {
        const parsed = JSON.parse(existingJob.adminNotesJson);
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
          adminNotes = { ...parsed };
        }
      } catch (e) {}
    }

    adminNotes.nonameOrderId = o.id;
    adminNotes.kanbanStage = kanbanStage;
    if (o.billingSentAt) {
      adminNotes.isBillSent = true;
      adminNotes.billSentAt = o.billingSentAt;
    }
    if (o.actualWeightKg !== null && o.actualWeightKg !== undefined) {
      adminNotes.actualWeightKg = Number(o.actualWeightKg);
    }
    if (o.tagNumber && o.tagNumber !== 'TAG-PENDING') {
      adminNotes.tagNumber = o.tagNumber;
    }
    if (o.contactChannel) {
      const ch = String(o.contactChannel).toLowerCase();
      if (ch.includes('line')) adminNotes.contactChannel = 'line';
      else if (ch.includes('whatsapp')) adminNotes.contactChannel = 'whatsapp';
      else adminNotes.contactChannel = 'phone';
    }
    if (tlsStatus === 'completed') {
      adminNotes.isRiderDelivered = true;
      adminNotes.deliveredAt = existingJob?.completedAt || new Date().toISOString();
    }

    const adminNotesJsonStr = JSON.stringify(adminNotes);
    const completedAtVal = tlsStatus === 'completed' ? (existingJob?.completedAt || new Date()) : null;
    const shopPaidAtVal = isPaid ? (existingJob?.shopPaidAt || new Date()) : null;

    if (existingJob) {
      await tlsPool.query(
        `UPDATE "Job" SET
          "customerId" = COALESCE($1, "customerId"),
          "customerName" = COALESCE($2, "customerName"),
          "customerPhone" = COALESCE($3, "customerPhone"),
          "pickupLocation" = $4,
          status = $5,
          "subStatus" = $6,
          "serviceType" = $7,
          "laundryTypes" = $8,
          "scheduledAt" = $9,
          "pickupScheduledAt" = $9,
          remark = $10,
          "adminNotesJson" = $11,
          "isPaid" = $12,
          "isShopPaid" = $12,
          "shopPaidAt" = COALESCE($13, "shopPaidAt"),
          "paymentMethod" = COALESCE($14, "paymentMethod"),
          "paymentChannel" = COALESCE($14, "paymentChannel"),
          "completedAt" = COALESCE($15, "completedAt"),
          "branchId" = COALESCE("branchId", $16),
          "updatedAt" = NOW()
        WHERE id = $17`,
        [
          tlsCustomerId,
          (o.customerName || 'Online Customer').toUpperCase(),
          cleanPhone || o.contactValue || '',
          fullPickupLocation,
          tlsStatus,
          tlsSubStatus,
          o.serviceId || 'wash_fold',
          o.serviceName || 'Wash / Fold',
          scheduledTime,
          remarkParts,
          adminNotesJsonStr,
          isPaid,
          shopPaidAtVal,
          o.paymentMethod || null,
          completedAtVal,
          branchId,
          targetJobId
        ]
      );

      await notifyTlsRealtime({
        type: 'job.updated',
        jobId: targetJobId,
        customerId: tlsCustomerId,
        branchId: existingJob.branchId || branchId,
        status: tlsStatus,
        subStatus: tlsSubStatus,
        isPaid,
        isShopPaid: isPaid,
        action: 'noname_order_update',
        actorName: 'NoName Order Process'
      });
      console.log(`[TLS-SYNC] Updated job in TLS Cloud All Jobs: ${targetJobId} -> status=${tlsStatus} (price/fee excluded)`);
    } else {
      await tlsPool.query(
        `INSERT INTO "Job" (
          id, type, "customerId", "customerName", "customerPhone",
          "pickupLocation", "pickupLat", "pickupLng",
          "dropoffLocation", "dropoffLat", "dropoffLng",
          distance, fee, status, "subStatus", "serviceType", "laundryTypes",
          brand, source, "branchId", "scheduledAt", "pickupScheduledAt",
          remark, "totalAmount", "itemsJson", "adminNotesJson",
          "isPaid", "isShopPaid", "shopPaidAt", "paymentMethod", "paymentChannel",
          "completedAt", "createdAt", "updatedAt"
        ) VALUES (
          $1, 'pickup', $2, $3, $4,
          $5, 13.736717, 100.560632,
          'That Laundry Shop (Central)', 13.736717, 100.560632,
          3.5, 0, $6, $7, $8, $9,
          $10, 'app', $11, $12, $12,
          $13, 0, NULL, $14,
          $15, $15, $16, $17, $17,
          $18, NOW(), NOW()
        ) ON CONFLICT (id) DO NOTHING`,
        [
          o.id,
          tlsCustomerId,
          (o.customerName || 'Online Customer').toUpperCase(),
          cleanPhone || o.contactValue || '',
          fullPickupLocation,
          tlsStatus,
          tlsSubStatus,
          o.serviceId || 'wash_fold',
          o.serviceName || 'Wash / Fold',
          brand,
          branchId,
          scheduledTime,
          remarkParts,
          adminNotesJsonStr,
          isPaid,
          shopPaidAtVal,
          o.paymentMethod || null,
          completedAtVal
        ]
      );

      await notifyTlsRealtime({
        type: 'job.created',
        jobId: o.id,
        customerId: tlsCustomerId,
        branchId,
        status: tlsStatus,
        subStatus: tlsSubStatus,
        isPaid,
        isShopPaid: isPaid,
        action: 'noname_booking_created',
        actorName: o.customerName || 'NoName Booking'
      });
      console.log(`[TLS-SYNC] Created job in TLS Cloud All Jobs: ${o.id} -> status=${tlsStatus}`);
    }

    return targetJobId;
  } catch (err) {
    console.warn('[TLS-SYNC] syncOrderToTlsCloud warning:', err.message);
    return null;
  }
}

/**
 * Delete or Cancel Job in TLS Cloud when deleted in Noname Order Process
 */
async function deleteOrderFromTlsCloud(orderId) {
  if (!orderId) return;
  try {
    const brand = TLS_BRAND || 'noname_laundry';
    markOutboundJobSync(orderId);
    const delRes = await tlsPool.query(
      `DELETE FROM "Job"
       WHERE brand = $1 AND (id = $2 OR remark LIKE $3)
       RETURNING id`,
      [brand, orderId, `%[Noname Web Booking: ${orderId}]%`]
    );
    for (const row of delRes.rows) {
      await notifyTlsRealtime({
        type: 'job.updated',
        jobId: row.id,
        status: 'cancel',
        action: 'noname_order_deleted',
        actorName: 'NoName Order Process'
      });
    }
  } catch (err) {
    console.warn('[TLS-SYNC] deleteOrderFromTlsCloud warning:', err.message);
  }
}

/**
 * 3. Pull Customers from TLS Cloud ("Customer" where brand='noname_laundry') -> Noname CRM ("customers")
 */
let isPullingCustomers = false;
let lastCustomersPullAt = 0;

async function pullTlsCustomersToNoname(localQuery, mapCustomerFn, onCustomersUpdated, force = false) {
  if (isPullingCustomers) return;
  if (!force && Date.now() - lastCustomersPullAt < 4000) return;
  isPullingCustomers = true;
  lastCustomersPullAt = Date.now();

  try {
    const brand = TLS_BRAND || 'noname_laundry';
    const tlsCustRes = await tlsPool.query(
      `SELECT c.*,
              (EXTRACT(EPOCH FROM c."updatedAt" AT TIME ZONE 'UTC') * 1000)::bigint AS "tlsUpdatedMs",
              COALESCE(
                json_agg(a.* ORDER BY a."isPrimary" DESC, a."createdAt" DESC)
                FILTER (WHERE a.id IS NOT NULL),
                '[]'::json
              ) AS addresses_json
       FROM "Customer" c
       LEFT JOIN "CustomerAddress" a ON a."customerId" = c.id
       WHERE c.brand = $1
       GROUP BY c.id
       ORDER BY c."updatedAt" DESC`,
      [brand]
    );

    if (tlsCustRes.rows.length === 0) return;

    const localRes = await localQuery('SELECT * FROM customers');
    const localById = new Map();
    const localByPhoneSuffix = new Map();

    for (const row of localRes.rows) {
      localById.set(row.id, row);
      const digits = String(row.mobile_number || '').replace(/\D/g, '');
      if (digits.length >= 8) {
        localByPhoneSuffix.set(digits.slice(-8), row);
      }
    }

    let anyChanged = false;
    for (const tc of tlsCustRes.rows) {
      if (recentOutboundCustSyncs.has(tc.id) && Date.now() - recentOutboundCustSyncs.get(tc.id) < 4000) {
        continue;
      }

      const tcDigits = String(tc.phone || '').replace(/\D/g, '');
      const tcSuffix = tcDigits.length >= 8 ? tcDigits.slice(-8) : '';
      const matchedLocal = localById.get(tc.id) || (tcSuffix ? localByPhoneSuffix.get(tcSuffix) : null);

      const tlsUpdatedMs = Number(tc.tlsUpdatedMs) || (tc.updatedAt ? new Date(tc.updatedAt).getTime() : 0);
      const localUpdatedMs = matchedLocal?.updated_at ? new Date(matchedLocal.updated_at).getTime() : 0;

      const tierDiffers = matchedLocal && tc.tier && String(matchedLocal.tier || '') !== String(tc.tier);
      const notesDiffers = matchedLocal && tc.remark !== undefined && tc.remark !== null && String(matchedLocal.notes || '') !== String(tc.remark);
      const nameDiffers = matchedLocal && tc.name && String(matchedLocal.full_name || '').toUpperCase() !== String(tc.name).toUpperCase();
      const fieldDiffers = Boolean(tierDiffers || notesDiffers || nameDiffers);

      // Only pull if missing locally, or a field differs, or TLS Cloud record is newer by > 1.5s
      if (matchedLocal && !fieldDiffers && tlsUpdatedMs <= localUpdatedMs + 1500) {
        continue;
      }

      const fullName = String(tc.name || 'Customer').trim();
      const nameParts = fullName.split(/\s+/);
      const fName = nameParts[0] || fullName;
      const lName = nameParts.slice(1).join(' ') || '';

      const rawAddrs = Array.isArray(tc.addresses_json) ? tc.addresses_json : [];
      const mappedAddrs = rawAddrs.map(a => ({
        id: a.id,
        label: a.label || a.placeName || 'Home',
        placeName: a.placeName || '',
        address: a.address || a.placeName || '',
        district: a.district || 'Bangkok',
        subdistrict: a.subDistrict || '',
        postalCode: a.postalCode || '10110',
        roomNumber: a.roomNumber || '',
        latitude: a.latitude,
        longitude: a.longitude,
        googleMapsUrl: a.googleMapsUrl || '',
        leaveWithJuristic: a.leaveWithJuristic !== false,
        isPrimary: Boolean(a.isPrimary)
      }));

      if (mappedAddrs.length === 0 && tc.defaultAddress) {
        mappedAddrs.push({
          id: 'ADDR-' + tc.id.slice(0, 6),
          label: tc.defaultAddress,
          address: tc.defaultAddress,
          district: 'Bangkok',
          roomNumber: tc.roomNo || '',
          leaveWithJuristic: true,
          isPrimary: true
        });
      }

      const targetId = matchedLocal ? matchedLocal.id : tc.id;
      const companyTax = {
        companyName: tc.companyName || matchedLocal?.company_tax?.companyName || '',
        taxId: tc.taxId || matchedLocal?.company_tax?.taxId || ''
      };

      await localQuery(
        `INSERT INTO customers (
          id, first_name, last_name, full_name, nick_name, gender, date_of_birth,
          mobile_number, is_whatsapp, secondary_mobile, is_secondary_whatsapp,
          email, line_id, pin_code, is_verified, verified_via, tier,
          notes, company_tax, addresses, created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7,
          $8, $9, $10, $11,
          $12, $13, '123456', $14, $15, $16,
          $17, $18, $19, $20, $21
        )
        ON CONFLICT (id) DO UPDATE SET
          first_name = EXCLUDED.first_name,
          last_name = EXCLUDED.last_name,
          full_name = EXCLUDED.full_name,
          nick_name = COALESCE(EXCLUDED.nick_name, customers.nick_name),
          gender = COALESCE(EXCLUDED.gender, customers.gender),
          date_of_birth = COALESCE(EXCLUDED.date_of_birth, customers.date_of_birth),
          mobile_number = EXCLUDED.mobile_number,
          secondary_mobile = COALESCE(EXCLUDED.secondary_mobile, customers.secondary_mobile),
          email = COALESCE(NULLIF(EXCLUDED.email, ''), customers.email),
          line_id = COALESCE(NULLIF(EXCLUDED.line_id, ''), customers.line_id),
          tier = COALESCE(EXCLUDED.tier, customers.tier),
          notes = COALESCE(EXCLUDED.notes, customers.notes),
          company_tax = EXCLUDED.company_tax,
          addresses = CASE WHEN jsonb_array_length(EXCLUDED.addresses) > 0 THEN EXCLUDED.addresses ELSE customers.addresses END,
          updated_at = EXCLUDED.updated_at`,
        [
          targetId,
          fName,
          lName,
          fullName,
          tc.nickName || fName,
          tc.gender || 'Rather not say',
          tc.dob || null,
          tc.phone || '',
          tc.isWhatsapp !== false,
          tc.secondaryPhone || '',
          Boolean(tc.isSecondaryWhatsapp),
          tc.email || '',
          tc.lineId || '',
          Boolean(tc.isVerified),
          tc.verifiedVia || null,
          tc.tier || 'Regular',
          tc.remark || '',
          JSON.stringify(companyTax),
          JSON.stringify(mappedAddrs),
          tc.createdAt || new Date(),
          new Date()
        ]
      );
      anyChanged = true;
    }

    if (anyChanged && typeof onCustomersUpdated === 'function') {
      const updatedRows = await localQuery('SELECT * FROM customers ORDER BY created_at DESC');
      onCustomersUpdated(updatedRows.rows.map(mapCustomerFn));
    }
  } catch (err) {
    console.warn('[TLS-SYNC] pullTlsCustomersToNoname warning:', err.message);
  } finally {
    isPullingCustomers = false;
  }
}

/**
 * 4. Pull Jobs from TLS Cloud ("Job" where brand='noname_laundry') -> Noname Order Process ("orders")
 */
let isPullingJobs = false;
let lastJobsPullAt = 0;

async function pullTlsJobsToNoname(localQuery, mapOrderFn, onOrdersUpdated, force = false) {
  if (isPullingJobs) return;
  if (!force && Date.now() - lastJobsPullAt < 3500) return;
  isPullingJobs = true;
  lastJobsPullAt = Date.now();

  try {
    const brand = TLS_BRAND || 'noname_laundry';
    const tlsJobsRes = await tlsPool.query(
      `SELECT *,
              (EXTRACT(EPOCH FROM "updatedAt" AT TIME ZONE 'UTC') * 1000)::bigint AS "tlsUpdatedMs"
       FROM "Job"
       WHERE brand = $1
       ORDER BY "createdAt" DESC
       LIMIT 200`,
      [brand]
    );

    if (tlsJobsRes.rows.length === 0) return;

    const localOrdersRes = await localQuery('SELECT * FROM orders');
    const localOrdersById = new Map();
    for (const row of localOrdersRes.rows) {
      localOrdersById.set(row.id, row);
    }

    // Group TLS jobs by resolved Noname Order ID (prefer direct id match or newest updatedAt)
    let anyChanged = false;
    const processedOrderIds = new Set();

    for (const job of tlsJobsRes.rows) {
      let adminNotes = {};
      if (job.adminNotesJson) {
        try {
          const parsed = JSON.parse(job.adminNotesJson);
          if (parsed && typeof parsed === 'object') adminNotes = parsed;
        } catch (e) {}
      }

      // Extract Noname Order ID if linked in adminNotesJson or remark
      let nonameId = job.id;
      if (adminNotes.nonameOrderId) {
        nonameId = adminNotes.nonameOrderId;
      } else if (job.remark) {
        const match = String(job.remark).match(/\[Noname Web Booking:\s*([A-Za-z0-9-]+)\]/i);
        if (match && match[1]) nonameId = match[1];
      }

      // Skip unlinked legacy UUID test jobs if they don't correspond to a real order id and have 0 amount in tba
      const isUuidJob = /^[0-9a-f]{8}-[0-9a-f]{4}-/i.test(nonameId);
      if (isUuidJob && !localOrdersById.has(nonameId) && job.status === 'tba' && (!job.totalAmount || Number(job.totalAmount) === 0)) {
        continue;
      }

      if (processedOrderIds.has(nonameId)) continue;
      processedOrderIds.add(nonameId);

      // Avoid echoing our own outbound update within 4 seconds
      if (
        (recentOutboundJobSyncs.has(job.id) && Date.now() - recentOutboundJobSyncs.get(job.id) < 4000) ||
        (recentOutboundJobSyncs.has(nonameId) && Date.now() - recentOutboundJobSyncs.get(nonameId) < 4000)
      ) {
        continue;
      }

      const existingLocal = localOrdersById.get(nonameId);
      const tlsUpdatedMs = job.tlsUpdatedMs ? Number(job.tlsUpdatedMs) : (job.updatedAt ? new Date(job.updatedAt).getTime() : 0);
      const localUpdatedMs = existingLocal?.updated_at ? new Date(existingLocal.updated_at).getTime() : 0;

      const mappedStatus = mapTlsToNonameStatus(job.status, job.subStatus, adminNotes);
      const localCanonicalStatus = existingLocal
        ? mapTlsToNonameStatus(
            mapNonameToTlsStatus(existingLocal.status).status,
            mapNonameToTlsStatus(existingLocal.status).subStatus,
            { kanbanStage: mapNonameToTlsStatus(existingLocal.status).kanbanStage }
          )
        : null;

      const mappedPaymentStatus = (job.isPaid || job.isShopPaid) ? 'PAID' : 'PENDING';
      const localPaymentStatus = existingLocal ? String(existingLocal.payment_status || 'PENDING').toUpperCase() : 'PENDING';

      const statusDiffers = existingLocal && localCanonicalStatus !== mappedStatus;
      const paymentDiffers = existingLocal && localPaymentStatus !== mappedPaymentStatus;

      // Only update local if missing, or if status / payment status changed in TLS All Jobs
      // (Prices and delivery fees are intentionally NOT synced between TLS and NoName)
      if (existingLocal && (!statusDiffers && !paymentDiffers)) {
        continue;
      }

      let actualWeightKg = existingLocal?.actual_weight_kg !== undefined && existingLocal?.actual_weight_kg !== null
        ? Number(existingLocal.actual_weight_kg)
        : null;
      if (adminNotes.actualWeightKg !== undefined && adminNotes.actualWeightKg !== null) {
        actualWeightKg = Number(adminNotes.actualWeightKg);
      }

      const billingSentAt = adminNotes.billSentAt || existingLocal?.billing_sent_at || null;

      if (existingLocal) {
        const currentTimeline = Array.isArray(existingLocal.timeline) ? existingLocal.timeline : [];
        let updatedTimeline = currentTimeline;
        if (statusDiffers) {
          const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16);
          updatedTimeline = [
            ...currentTimeline,
            {
              status: mappedStatus,
              timestamp: nowStr,
              note: `Synced from TLS All Jobs (Status: ${job.status}${job.subStatus ? '/' + job.subStatus : ''}).`
            }
          ];
        }

        await localQuery(
          `UPDATE orders SET
            status = $1,
            payment_status = $2,
            payment_method = COALESCE($3, payment_method),
            actual_weight_kg = COALESCE($4, actual_weight_kg),
            billing_sent_at = COALESCE($5, billing_sent_at),
            customer_id = COALESCE($6, customer_id),
            timeline = $7,
            updated_at = $8
          WHERE id = $9`,
          [
            mappedStatus,
            mappedPaymentStatus,
            job.paymentChannel || job.paymentMethod || null,
            actualWeightKg,
            billingSentAt,
            job.customerId || null,
            JSON.stringify(updatedTimeline),
            new Date(),
            nonameId
          ]
        );
        anyChanged = true;
        console.log(`[TLS-SYNC] Pulled job update from TLS All Jobs -> Noname Order ${nonameId}: status=${mappedStatus}, paid=${mappedPaymentStatus} (price/fee excluded)`);
      } else {
        // Order created directly inside TLS_POS with brand='noname_laundry' -> Insert into Noname orders (using Noname default base rates, not TLS price/fee)
        const schedDate = job.scheduledAt ? new Date(job.scheduledAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
        const newTimeline = [{
          status: mappedStatus,
          timestamp: new Date(job.createdAt || Date.now()).toISOString().replace('T', ' ').substring(0, 16),
          note: 'Order created in TLS POS (All Jobs) and synced to NoName Laundry.'
        }];

        await localQuery(
          `INSERT INTO orders (
            id, customer_id, customer_name, contact_channel, contact_value,
            service_id, service_name, city, district, condo_name,
            leave_with_juristic, estimated_weight_kg, actual_weight_kg,
            min_weight_applied_kg, price_per_kg, total_price, delivery_fee,
            status, payment_status, payment_method, pickup_date, pickup_time,
            special_instructions, items, timeline, billing_sent_at, created_at, updated_at
          ) VALUES (
            $1, $2, $3, 'online', $4,
            $5, $6, 'Bangkok', 'Watthana', $7,
            TRUE, 5.0, $8,
            5.0, 70, 350, 0,
            $9, $10, $11, $12, '10:00 - 12:00',
            $13, '[]'::jsonb, $14, $15, $16, $17
          ) ON CONFLICT (id) DO NOTHING`,
          [
            nonameId,
            job.customerId || null,
            job.customerName || 'TLS Customer',
            job.customerPhone || '',
            job.serviceType || 'wash_fold',
            job.laundryTypes || 'Wash / Fold',
            job.pickupLocation || '',
            actualWeightKg,
            mappedStatus,
            mappedPaymentStatus,
            job.paymentChannel || job.paymentMethod || null,
            schedDate,
            job.remark || '',
            JSON.stringify(newTimeline),
            billingSentAt,
            job.createdAt || new Date(),
            job.updatedAt || new Date()
          ]
        );
        anyChanged = true;
        console.log(`[TLS-SYNC] Pulled new noname_laundry job from TLS All Jobs -> Noname Order ${nonameId}`);
      }
    }

    if (anyChanged && typeof onOrdersUpdated === 'function') {
      const updatedRows = await localQuery('SELECT * FROM orders ORDER BY created_at DESC');
      onOrdersUpdated(updatedRows.rows.map(mapOrderFn));
    }
  } catch (err) {
    console.warn('[TLS-SYNC] pullTlsJobsToNoname warning:', err.message);
  } finally {
    isPullingJobs = false;
  }
}

/**
 * 5. Push any existing Noname Orders & Customers that are missing or outdated in TLS Cloud
 */
async function pushExistingNonameDataToTlsCloud(localQuery, mapCustomerFn, mapOrderFn) {
  try {
    const brand = TLS_BRAND || 'noname_laundry';
    // Check existing TLS customers and jobs with their UTC updatedAt timestamps
    const tlsCustRes = await tlsPool.query(
      `SELECT id, phone, (EXTRACT(EPOCH FROM "updatedAt" AT TIME ZONE 'UTC') * 1000)::bigint AS "tlsUpdatedMs"
       FROM "Customer" WHERE brand = $1`,
      [brand]
    );
    const tlsCustMap = new Map();
    for (const c of tlsCustRes.rows) {
      tlsCustMap.set(c.id, Number(c.tlsUpdatedMs) || 0);
      if (c.phone) tlsCustMap.set(normalizePhone(c.phone), Number(c.tlsUpdatedMs) || 0);
    }

    // 1. Push Noname customers that are missing or newer than TLS Cloud
    const custRes = await localQuery('SELECT * FROM customers ORDER BY created_at ASC');
    for (const row of custRes.rows) {
      const mappedCust = mapCustomerFn(row);
      const localUpdatedMs = row.updated_at ? new Date(row.updated_at).getTime() : 0;
      const phoneKey = normalizePhone(mappedCust.mobileNumber || mappedCust.phone);
      const tlsMs = Math.max(tlsCustMap.get(mappedCust.id) || 0, tlsCustMap.get(phoneKey) || 0);
      if (!tlsMs || localUpdatedMs > tlsMs + 1000) {
        await syncCustomerToTlsCloud(mappedCust, localQuery);
      }
    }

    const tlsJobRes = await tlsPool.query(
      `SELECT id, "adminNotesJson", (EXTRACT(EPOCH FROM "updatedAt" AT TIME ZONE 'UTC') * 1000)::bigint AS "tlsUpdatedMs"
       FROM "Job" WHERE brand = $1`,
      [brand]
    );
    const tlsJobMap = new Map();
    for (const j of tlsJobRes.rows) {
      const ms = Number(j.tlsUpdatedMs) || 0;
      tlsJobMap.set(j.id, ms);
      if (j.adminNotesJson) {
        try {
          const parsed = JSON.parse(j.adminNotesJson);
          if (parsed?.nonameOrderId) tlsJobMap.set(parsed.nonameOrderId, ms);
        } catch (e) {}
      }
    }

    // 2. Push Noname orders that are missing or newer than TLS Cloud
    const ordRes = await localQuery('SELECT * FROM orders ORDER BY created_at ASC');
    for (const row of ordRes.rows) {
      const mappedOrd = mapOrderFn(row);
      const localUpdatedMs = row.updated_at ? new Date(row.updated_at).getTime() : 0;
      const tlsMs = tlsJobMap.get(mappedOrd.id) || 0;
      if (!tlsMs || localUpdatedMs > tlsMs + 1000) {
        await syncOrderToTlsCloud(mappedOrd);
      }
    }
    console.log(`[TLS-SYNC] Initial two-way sync completed (${custRes.rows.length} customers, ${ordRes.rows.length} orders verified with TLS Cloud).`);
  } catch (err) {
    console.warn('[TLS-SYNC] pushExistingNonameDataToTlsCloud warning:', err.message);
  }
}

/**
 * 6. Real-time PG Listener on TLS Cloud (LISTEN tls_realtime_events)
 */
let listenerClient = null;
let listenerReconnectTimer = null;
let listenerKeepaliveTimer = null;

function startTlsCloudRealtimeListener({ localQuery, mapCustomerFn, mapOrderFn, onCustomersUpdated, onOrdersUpdated }) {
  async function connectListener() {
    if (listenerClient) return;
    try {
      const client = new Client({
        connectionString: TLS_CLOUD_DB_URL,
        ssl: { rejectUnauthorized: false },
        keepAlive: true,
        connectionTimeoutMillis: 10000
      });

      client.on('notification', (msg) => {
        if (msg.channel !== PG_CHANNEL || !msg.payload) return;
        try {
          const event = JSON.parse(msg.payload);
          if (!event || event.instanceId === INSTANCE_ID) return;
          if (event.brand && event.brand !== (TLS_BRAND || 'noname_laundry') && event.type !== 'customer.updated') {
            return;
          }
          if (event.type === 'job.created' || event.type === 'job.updated') {
            pullTlsJobsToNoname(localQuery, mapOrderFn, onOrdersUpdated, true).catch(() => {});
          } else if (event.type === 'customer.updated') {
            pullTlsCustomersToNoname(localQuery, mapCustomerFn, onCustomersUpdated, true).catch(() => {});
          }
        } catch (e) {}
      });

      client.on('error', (err) => {
        console.warn('[TLS-SYNC] Realtime listener error, reconnecting:', err.message);
        cleanupListener();
        scheduleReconnect();
      });

      client.on('end', () => {
        cleanupListener();
        scheduleReconnect();
      });

      await client.connect();
      await client.query(`LISTEN ${PG_CHANNEL}`);
      listenerClient = client;
      console.log(`[TLS-SYNC] Listening for real-time All Jobs & CRM events on ${TLS_ENV_LABEL} (${PG_CHANNEL})`);

      if (listenerKeepaliveTimer) clearInterval(listenerKeepaliveTimer);
      listenerKeepaliveTimer = setInterval(() => {
        if (listenerClient) {
          listenerClient.query('SELECT 1').catch(() => {
            cleanupListener();
            scheduleReconnect();
          });
        }
      }, 25000);
    } catch (err) {
      console.warn('[TLS-SYNC] Could not connect realtime listener, retrying:', err.message);
      cleanupListener();
      scheduleReconnect();
    }
  }

  function cleanupListener() {
    if (listenerKeepaliveTimer) {
      clearInterval(listenerKeepaliveTimer);
      listenerKeepaliveTimer = null;
    }
    if (listenerClient) {
      const c = listenerClient;
      listenerClient = null;
      c.removeAllListeners();
      c.end().catch(() => {});
    }
  }

  function scheduleReconnect() {
    if (listenerReconnectTimer) return;
    listenerReconnectTimer = setTimeout(() => {
      listenerReconnectTimer = null;
      connectListener();
    }, 4000);
  }

  connectListener();

  // Periodic background reconciliation every 15 seconds in case any direct DB change occurred without pg_notify
  setInterval(() => {
    pullTlsJobsToNoname(localQuery, mapOrderFn, onOrdersUpdated, false).catch(() => {});
    pullTlsCustomersToNoname(localQuery, mapCustomerFn, onCustomersUpdated, false).catch(() => {});
  }, 15000);

  // Run initial two-way sync 2 seconds after server boot
  setTimeout(async () => {
    await pullTlsCustomersToNoname(localQuery, mapCustomerFn, onCustomersUpdated, true);
    await pullTlsJobsToNoname(localQuery, mapOrderFn, onOrdersUpdated, true);
    await pushExistingNonameDataToTlsCloud(localQuery, mapCustomerFn, mapOrderFn);
  }, 2000);
}

module.exports = {
  tlsPool,
  mapNonameToTlsStatus,
  mapTlsToNonameStatus,
  syncCustomerToTlsCloud,
  deleteCustomerFromTlsCloud,
  syncOrderToTlsCloud,
  deleteOrderFromTlsCloud,
  pullTlsCustomersToNoname,
  pullTlsJobsToNoname,
  pushExistingNonameDataToTlsCloud,
  startTlsCloudRealtimeListener
};
