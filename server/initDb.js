const { query, pool } = require('./db');
const { hashPassword } = require('./auth');

const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS services (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  name_th VARCHAR(255),
  description TEXT,
  unit VARCHAR(32) DEFAULT 'KG',
  price_per_kg NUMERIC NOT NULL,
  standard_price_per_kg NUMERIC,
  next_day_price_per_kg NUMERIC,
  same_day_price_per_kg NUMERIC,
  same_day_available BOOLEAN DEFAULT TRUE,
  min_weight_kg NUMERIC NOT NULL DEFAULT 4.0,
  turnaround_hours INTEGER DEFAULT 48,
  popular BOOLEAN DEFAULT FALSE,
  features JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS orders (
  id VARCHAR(64) PRIMARY KEY,
  customer_name VARCHAR(255) NOT NULL,
  contact_channel VARCHAR(64) NOT NULL,
  contact_value VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  service_id VARCHAR(64) REFERENCES services(id) ON DELETE SET NULL,
  service_name VARCHAR(255),
  city VARCHAR(64) DEFAULT 'Bangkok',
  district VARCHAR(255),
  subdistrict VARCHAR(255),
  condo_name VARCHAR(255),
  room_number VARCHAR(255),
  leave_with_juristic BOOLEAN DEFAULT TRUE,
  estimated_weight_kg NUMERIC,
  actual_weight_kg NUMERIC,
  min_weight_applied_kg NUMERIC DEFAULT 4.0,
  price_per_kg NUMERIC,
  total_price NUMERIC,
  turnaround_speed VARCHAR(32) DEFAULT 'next_day',
  status VARCHAR(64) NOT NULL DEFAULT 'BOOKING_REQUESTED',
  payment_status VARCHAR(64) NOT NULL DEFAULT 'PENDING',
  payment_method VARCHAR(128),
  payment_ref VARCHAR(128),
  tag_number VARCHAR(128) DEFAULT 'TAG-PENDING',
  pickup_date VARCHAR(64),
  pickup_time VARCHAR(128),
  delivery_date VARCHAR(64),
  delivery_time VARCHAR(128),
  special_instructions TEXT,
  agreed_terms BOOLEAN DEFAULT TRUE,
  cashless_policy_acknowledged BOOLEAN DEFAULT TRUE,
  reconciliation_status VARCHAR(64) DEFAULT 'UNRECONCILED',
  reconciled_at TIMESTAMPTZ,
  reconciled_by VARCHAR(128),
  reconciliation_notes TEXT,
  bank_account_ref VARCHAR(128),
  timeline JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS incidents (
  id VARCHAR(64) PRIMARY KEY,
  order_id VARCHAR(64),
  customer_name VARCHAR(255),
  channel VARCHAR(64),
  contact VARCHAR(255),
  subject VARCHAR(255),
  message TEXT,
  status VARCHAR(64) DEFAULT 'pending',
  response TEXT,
  category VARCHAR(128) DEFAULT 'General Inquiry',
  severity VARCHAR(64) DEFAULT 'normal',
  affected_item VARCHAR(255),
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS settings (
  key VARCHAR(64) PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS admin_users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(64) UNIQUE NOT NULL,
  email VARCHAR(255),
  password_hash VARCHAR(255) NOT NULL,
  salt VARCHAR(64) NOT NULL,
  role VARCHAR(32) DEFAULT 'admin',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS customers (
  id VARCHAR(64) PRIMARY KEY,
  full_name VARCHAR(255) NOT NULL,
  nick_name VARCHAR(128),
  gender VARCHAR(32) DEFAULT 'Rather not say',
  date_of_birth VARCHAR(64),
  mobile_number VARCHAR(64) NOT NULL,
  is_whatsapp BOOLEAN DEFAULT TRUE,
  secondary_mobile VARCHAR(64),
  is_secondary_whatsapp BOOLEAN DEFAULT FALSE,
  email VARCHAR(255),
  line_id VARCHAR(128),
  pin_code VARCHAR(16) DEFAULT '123456',
  is_verified BOOLEAN DEFAULT FALSE,
  verified_via VARCHAR(32),
  tier VARCHAR(32) DEFAULT 'Regular',
  notes TEXT,
  company_tax JSONB DEFAULT '{}'::jsonb,
  addresses JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_name);
CREATE INDEX IF NOT EXISTS idx_orders_contact ON orders(contact_value);
CREATE INDEX IF NOT EXISTS idx_customers_mobile ON customers(mobile_number);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
`;

const INITIAL_SERVICES = [
  {
    id: 'wash_fold',
    name: 'Wash / Fold',
    nameTh: 'ซัก อบ พับ',
    description: 'Everyday casual wear, t-shirts, gym shorts, socks, towels, and bed linens washed with premium detergent, tumble dried, and neatly folded.',
    unit: 'KG',
    pricePerKg: 70,
    minWeightKg: 4.0,
    turnaroundHours: 24,
    popular: true,
    features: [
      'Eco-friendly detergent & fabric softener',
      'Gentle tumble drying',
      'Neat, compact folding by apparel type',
      'Sealed in moisture-proof dust bags',
      'Pickup & delivery across Bangkok'
    ]
  },
  {
    id: 'wash_iron_fold',
    name: 'Wash / Iron / Fold',
    nameTh: 'ซัก อบ รีด พับ',
    description: 'Ideal for workwear, cotton shirts, chinos, and dresses that require crisp steam ironing and tidy folded packaging.',
    unit: 'KG',
    pricePerKg: 95,
    minWeightKg: 4.0,
    turnaroundHours: 36,
    popular: false,
    features: [
      'Stain inspection pre-treatment',
      'Premium fabric wash & conditioning',
      'Hand steam ironing for crisp look',
      'Expert folding with tissue inserts if needed',
      'Clear protective garment packaging'
    ]
  },
  {
    id: 'wash_iron_hang',
    name: 'Wash / Iron / Hang',
    nameTh: 'ซัก อบ รีด แขวน',
    description: 'Perfect for business suits, formal button-downs, evening dresses, and delicate linen blouses returned wrinkle-free on high-grade hangers.',
    unit: 'KG',
    pricePerKg: 120,
    minWeightKg: 4.0,
    turnaroundHours: 48,
    popular: false,
    features: [
      'Delicate temperature-controlled wash',
      'Detailed wrinkle-free steam pressing',
      'Heavy-duty hangers included at no extra cost',
      'Full-length breathable garment cover',
      'Direct-to-wardrobe ready on delivery'
    ]
  }
];

const INITIAL_ORDERS = [];

const INITIAL_INCIDENTS = [];

const DEFAULT_SETTINGS = {
  storeName: 'NoName Laundry',
  city: 'Bangkok, Thailand',
  turnaroundStd: '24–48 Hours',
  currency: 'THB',
  lineOaId: '@nonamelaundry',
  whatsappNumber: '@nonamelaundry',
  supportEmail: 'support@nonamelaundry.com',
  paymentGateway: {
    provider: 'Omise / Opn Payments (Thailand)',
    merchantName: 'NoName Laundry Bangkok Co., Ltd.',
    promptpayEnabled: true,
    creditCardEnabled: true,
    trueMoneyEnabled: true,
    testMode: true,
    modeNotice: '100% Cashless System via 3rd-Party Gateway'
  }
};

async function initDatabase() {
  console.log('--- Initializing Google Cloud PostgreSQL Database ---');
  try {
    // 1. Create Schema
    await query(SCHEMA_SQL);
    await query(`
      ALTER TABLE services ADD COLUMN IF NOT EXISTS standard_price_per_kg NUMERIC;
      ALTER TABLE services ADD COLUMN IF NOT EXISTS next_day_price_per_kg NUMERIC;
      ALTER TABLE services ADD COLUMN IF NOT EXISTS same_day_price_per_kg NUMERIC;
      ALTER TABLE services ADD COLUMN IF NOT EXISTS same_day_available BOOLEAN DEFAULT TRUE;
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS turnaround_speed VARCHAR(32) DEFAULT 'standard_48h';
      ALTER TABLE admin_users ADD COLUMN IF NOT EXISTS full_name VARCHAR(255);
      ALTER TABLE admin_users ADD COLUMN IF NOT EXISTS phone VARCHAR(64);
      ALTER TABLE admin_users ADD COLUMN IF NOT EXISTS status VARCHAR(32) DEFAULT 'active';
      UPDATE services SET standard_price_per_kg = price_per_kg WHERE standard_price_per_kg IS NULL;
      UPDATE services SET next_day_price_per_kg = ROUND(price_per_kg * 1.3) WHERE next_day_price_per_kg IS NULL OR next_day_price_per_kg = price_per_kg;
      UPDATE services SET same_day_price_per_kg = ROUND(price_per_kg * 1.75) WHERE same_day_price_per_kg IS NULL;
      UPDATE services SET same_day_available = TRUE WHERE same_day_available IS NULL;
      UPDATE services SET turnaround_hours = 48 WHERE turnaround_hours IS NULL OR turnaround_hours < 48;
    `).catch(err => console.warn('Column migration note:', err.message));
    console.log('✅ Tables created or verified (services, orders, incidents, settings).');

    // 2. Seed Services if empty
    const servicesCountRes = await query('SELECT count(*) FROM services');
    if (parseInt(servicesCountRes.rows[0].count, 10) === 0) {
      console.log('Seeding initial laundry services...');
      for (const s of INITIAL_SERVICES) {
        await query(`
          INSERT INTO services (id, name, name_th, description, unit, price_per_kg, min_weight_kg, turnaround_hours, popular, features)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        `, [
          s.id,
          s.name,
          s.nameTh,
          s.description,
          s.unit,
          s.pricePerKg,
          s.minWeightKg,
          s.turnaroundHours,
          s.popular,
          JSON.stringify(s.features)
        ]);
      }
      console.log(`✅ Seeded ${INITIAL_SERVICES.length} services.`);
    } else {
      console.log(`ℹ️ Services table already contains ${servicesCountRes.rows[0].count} entries.`);
    }

    // 3. Seed Orders if empty
    const ordersCountRes = await query('SELECT count(*) FROM orders');
    if (parseInt(ordersCountRes.rows[0].count, 10) === 0) {
      console.log('Seeding initial demo orders...');
      for (const o of INITIAL_ORDERS) {
        await query(`
          INSERT INTO orders (
            id, customer_name, contact_channel, contact_value, email,
            service_id, service_name, district, condo_name, room_number,
            leave_with_juristic, estimated_weight_kg, actual_weight_kg,
            min_weight_applied_kg, price_per_kg, total_price, status,
            payment_status, payment_method, payment_ref, tag_number,
            pickup_date, pickup_time, delivery_date, delivery_time,
            special_instructions, agreed_terms, cashless_policy_acknowledged,
            timeline, created_at
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
            $11, $12, $13, $14, $15, $16, $17, $18, $19, $20,
            $21, $22, $23, $24, $25, $26, $27, $28, $29, $30
          )
        `, [
          o.id, o.customerName, o.contactChannel, o.contactValue, o.email,
          o.serviceId, o.serviceName, o.district, o.condoName, o.roomNumber,
          o.leaveWithJuristic, o.estimatedWeightKg, o.actualWeightKg,
          o.minWeightAppliedKg, o.pricePerKg, o.totalPrice, o.status,
          o.paymentStatus, o.paymentMethod, o.paymentRef, o.tagNumber,
          o.pickupDate, o.pickupTime, o.deliveryDate, o.deliveryTime,
          o.specialInstructions, o.agreedTerms, o.cashlessPolicyAcknowledged,
          JSON.stringify(o.timeline), o.createdAt
        ]);
      }
      console.log(`✅ Seeded ${INITIAL_ORDERS.length} sample orders.`);
    } else {
      console.log(`ℹ️ Orders table already contains ${ordersCountRes.rows[0].count} entries.`);
    }

    // 4. Seed Incidents if empty
    const incidentsCountRes = await query('SELECT count(*) FROM incidents');
    if (parseInt(incidentsCountRes.rows[0].count, 10) === 0) {
      console.log('Seeding initial incidents...');
      for (const inc of INITIAL_INCIDENTS) {
        await query(`
          INSERT INTO incidents (id, order_id, customer_name, channel, contact, subject, message, status, response, created_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        `, [
          inc.id, inc.orderId, inc.customerName, inc.channel, inc.contact,
          inc.subject, inc.message, inc.status, inc.response, inc.createdAt
        ]);
      }
      console.log(`✅ Seeded ${INITIAL_INCIDENTS.length} sample incident.`);
    } else {
      console.log(`ℹ️ Incidents table already contains ${incidentsCountRes.rows[0].count} entries.`);
    }

    // 5. Seed Settings if empty
    const settingsCountRes = await query("SELECT count(*) FROM settings WHERE key = 'app_config'");
    if (parseInt(settingsCountRes.rows[0].count, 10) === 0) {
      console.log('Seeding default store settings...');
      await query(`
        INSERT INTO settings (key, value) VALUES ('app_config', $1)
      `, [JSON.stringify(DEFAULT_SETTINGS)]);
      console.log('✅ Default settings saved to PostgreSQL.');
    } else {
      console.log('ℹ️ Store settings already configured.');
    }

    // 6. Seed Admin User if empty
    const adminCountRes = await query('SELECT count(*) FROM admin_users');
    if (parseInt(adminCountRes.rows[0].count, 10) === 0) {
      console.log('Seeding initial administrator account...');
      const defaultPassword = process.env.ADMIN_PASSWORD || 'admin1234';
      const defaultUsername = process.env.ADMIN_USERNAME || 'admin';
      const { hash, salt } = hashPassword(defaultPassword);
      await query(`
        INSERT INTO admin_users (username, email, password_hash, salt, role)
        VALUES ($1, $2, $3, $4, 'admin')
      `, [defaultUsername, 'admin@nonamelaundry.com', hash, salt]);
      console.log(`✅ Default administrator created: Username="${defaultUsername}", Password="${defaultPassword}"`);
    } else {
      console.log('ℹ️ Admin user account already exists.');
    }

    console.log('--- Google Cloud PostgreSQL Database Ready! ---');
  } catch (err) {
    console.error('❌ Error initializing database:', err);
    throw err;
  } finally {
    await pool.end();
  }
}

if (require.main === module) {
  initDatabase().then(() => process.exit(0)).catch(() => process.exit(1));
}

module.exports = { initDatabase };
