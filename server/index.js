require('dotenv').config();
const fs = require('fs');
const path = require('path');
const express = require('express');
const cors = require('cors');
const { query } = require('./db');
const { hashPassword, verifyPassword, createSession, getSession, deleteSession, requireAdminAuth } = require('./auth');
const { createTlsProxyRouter, callTlsApi, TLS_API_URL, TLS_BRAND } = require('./tlsProxy');
const { sendBookingNotificationEmail } = require('./mailer');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// TLS Multi-Brand Cloud Proxy Router (Server Test & Production)
app.use('/api/external', createTlsProxyRouter());
app.use('/api/tls', createTlsProxyRouter());

// Shared initial default services
let initialServices = [
  {
    id: 'wash_fold',
    categoryId: 'laundry_by_weight',
    name: 'Wash / Fold',
    nameTh: 'ซัก อบ พับ',
    description: 'Everyday casual wear, t-shirts, gym shorts, socks, towels, and clothing washed with premium detergent, tumble dried, and neatly folded.',
    unit: 'KG',
    pricingType: 'weight',
    stdPrice: 65,
    nextPrice: 85,
    samePrice: 115,
    sameAvail: true,
    minWeight: 4.0,
    turnaround: 48,
    popular: true,
    features: ['Eco-friendly detergent & fabric softener', 'Gentle tumble drying', 'Neat, compact folding by apparel type', 'Sealed in moisture-proof dust bags', 'Pickup & delivery across Bangkok']
  },
  {
    id: 'wash_iron_fold',
    categoryId: 'laundry_by_weight',
    name: 'Wash / Iron / Fold',
    nameTh: 'ซัก อบ รีด พับ',
    description: 'Ideal for workwear, cotton shirts, chinos, and dresses that require crisp steam ironing and tidy folded packaging.',
    unit: 'KG',
    pricingType: 'weight',
    stdPrice: 95,
    nextPrice: 130,
    samePrice: 175,
    sameAvail: true,
    minWeight: 4.0,
    turnaround: 48,
    popular: false,
    features: ['Stain inspection pre-treatment', 'Premium fabric wash & conditioning', 'Hand steam ironing for crisp look', 'Expert folding with tissue inserts if needed', 'Clear protective garment packaging']
  },
  {
    id: 'wash_iron_hang',
    categoryId: 'laundry_by_weight',
    name: 'Wash / Iron / Hang',
    nameTh: 'ซัก อบ รีด แขวน',
    description: 'Perfect for business suits, formal button-downs, evening dresses, and delicate linen blouses returned wrinkle-free on high-grade hangers.',
    unit: 'KG',
    pricingType: 'weight',
    stdPrice: 120,
    nextPrice: 160,
    samePrice: 210,
    sameAvail: true,
    minWeight: 4.0,
    turnaround: 48,
    popular: false,
    features: ['Delicate temperature-controlled wash', 'Detailed wrinkle-free steam pressing', 'Heavy-duty hangers included at no extra cost', 'Full-length breathable garment cover', 'Direct-to-wardrobe ready on delivery']
  },
  {
    id: 'comforter_duvet',
    categoryId: 'bedding_linens',
    name: 'Duvet / Comforter / Blanket',
    nameTh: 'ผ้านวม / ไส้ผ้านวม / ผ้าห่มหนา',
    description: 'Bulky King/Queen comforters and thick winter blankets washed in high-capacity drums with anti-dust mite heat sanitization and fluffy loft restoration.',
    unit: 'piece',
    pricingType: 'piece',
    stdPrice: 220,
    nextPrice: 280,
    samePrice: 350,
    sameAvail: true,
    minWeight: 1.0,
    turnaround: 48,
    popular: true,
    features: ['High-capacity commercial drum washer', 'Anti-dust mite thermal sanitization', 'Gentle tumble dry for loft restoration', 'Breathable zipper storage bag included']
  },
  {
    id: 'bedsheet_set',
    categoryId: 'bedding_linens',
    name: 'Bed Sheet / Fitted Sheet',
    nameTh: 'ผ้าปูที่นอน (King / Queen / Single)',
    description: 'Deep-cleaned bed sheets with fabric softening conditioner and hotel-grade flatwork steam ironing for an ultra-smooth bedtime feel.',
    unit: 'piece',
    pricingType: 'piece',
    stdPrice: 80,
    nextPrice: 110,
    samePrice: 150,
    sameAvail: true,
    minWeight: 1.0,
    turnaround: 48,
    popular: true,
    features: ['Deep dirt and sweat extraction', 'Gentle fabric conditioning for silky touch', 'Steam ironed for smooth hotel-finish crispness', 'Individual moisture-proof protective packaging']
  },
  {
    id: 'duvet_cover',
    categoryId: 'bedding_linens',
    name: 'Duvet Cover',
    nameTh: 'ปลอกผ้านวม',
    description: 'Premium washing and professional steam ironing for duvet covers of all fabric blends and thread counts.',
    unit: 'piece',
    pricingType: 'piece',
    stdPrice: 90,
    nextPrice: 120,
    samePrice: 160,
    sameAvail: true,
    minWeight: 1.0,
    turnaround: 48,
    popular: false,
    features: ['Color-safe detergent formula', 'Steam press finish for smooth texture', 'Wrinkle-resistant folding']
  },
  {
    id: 'pillowcase',
    categoryId: 'bedding_linens',
    name: 'Pillowcase / Bolster Case',
    nameTh: 'ปลอกหมอนหนุน / หมอนข้าง',
    description: 'High-temperature hygienic wash and flatwork pressing for pillowcases and bolster cases.',
    unit: 'piece',
    pricingType: 'piece',
    stdPrice: 30,
    nextPrice: 45,
    samePrice: 60,
    sameAvail: true,
    minWeight: 1.0,
    turnaround: 48,
    popular: false,
    features: ['Antibacterial hot wash', 'Crisp ironed & sanitized', 'Hypoallergenic fabric conditioner']
  },
  {
    id: 'mattress_topper',
    categoryId: 'bedding_linens',
    name: 'Mattress Protector / Topper',
    nameTh: 'ผ้ารองกันเปื้อน / ท็อปเปอร์',
    description: 'Deep-cycle washing for fitted mattress protectors, quilted pads, and thin toppers.',
    unit: 'piece',
    pricingType: 'piece',
    stdPrice: 180,
    nextPrice: 240,
    samePrice: 300,
    sameAvail: true,
    minWeight: 1.0,
    turnaround: 48,
    popular: false,
    features: ['Deep extraction cleaning', 'Low-temp tumble drying to protect elastic corners', 'Sanitized packaging']
  },
  {
    id: 'bath_towel',
    categoryId: 'household_curtains',
    name: 'Bath Towel (Large)',
    nameTh: 'ผ้าเช็ดตัวผืนใหญ่',
    description: 'Hotel-quality wash and high-loft fluff tumble dry for plush, ultra-absorbent bath towels.',
    unit: 'piece',
    pricingType: 'piece',
    stdPrice: 45,
    nextPrice: 65,
    samePrice: 85,
    sameAvail: true,
    minWeight: 1.0,
    turnaround: 48,
    popular: false,
    features: ['High-absorbency residue-free wash', 'Fluffy tumble dry', 'Neat hotel-style tri-fold']
  },
  {
    id: 'curtains_drapes',
    categoryId: 'household_curtains',
    name: 'Curtains & Drapes (per panel)',
    nameTh: 'ผ้าม่าน (ต่อผืน)',
    description: 'Specialized fabric care for sheer, blackout, or heavy cotton window curtains with delicate steam pressing.',
    unit: 'piece',
    pricingType: 'piece',
    stdPrice: 160,
    nextPrice: 210,
    samePrice: 280,
    sameAvail: true,
    minWeight: 1.0,
    turnaround: 48,
    popular: false,
    features: ['Dust & allergen removal', 'Pleat preservation steam pressing', 'Individual hanger or protective fold']
  },
  {
    id: 'blazer_jacket',
    categoryId: 'delicate_dryclean',
    name: 'Suit Jacket / Blazer',
    nameTh: 'สูทและเสื้อเบลเซอร์',
    description: 'Expert fabric-safe gentle cleansing, collar shaping, and vertical steam pressing on contoured suit hangers.',
    unit: 'piece',
    pricingType: 'piece',
    stdPrice: 190,
    nextPrice: 250,
    samePrice: 330,
    sameAvail: true,
    minWeight: 1.0,
    turnaround: 48,
    popular: false,
    features: ['Gentle fiber-safe fabric treatment', 'Shoulder and lapel steam shaping', 'Contoured suit hanger included', 'Full-length breathable garment bag']
  },
  {
    id: 'formal_dress',
    categoryId: 'delicate_dryclean',
    name: 'Evening Dress / Silk Gown',
    nameTh: 'ชุดราตรีและผ้าไหมพิเศษ',
    description: 'Specialty care for evening silk dresses, sequin gowns, pleated skirts, and delicate luxury fabrics.',
    unit: 'piece',
    pricingType: 'piece',
    stdPrice: 240,
    nextPrice: 310,
    samePrice: 400,
    sameAvail: true,
    minWeight: 1.0,
    turnaround: 48,
    popular: false,
    features: ['Delicate fabric pre-inspection', 'Silk & fine embellishment protection', 'Hand-finished steam pressing', 'Sealed protective hanging cover']
  }
];

// Ensure PostgreSQL schema has reconciliation columns, categories and linens
async function ensureDatabaseSchema() {
  try {
    await query(`
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS reconciliation_status VARCHAR(64) DEFAULT 'UNRECONCILED';
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS reconciled_at TIMESTAMPTZ;
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS reconciled_by VARCHAR(128);
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS reconciliation_notes TEXT;
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS bank_account_ref VARCHAR(128);
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_id VARCHAR(64);
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS postal_code VARCHAR(16) DEFAULT '10110';
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_fee NUMERIC DEFAULT 0;
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS quantity NUMERIC DEFAULT 1;
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS unit VARCHAR(32) DEFAULT 'KG';
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS category_id VARCHAR(64) DEFAULT 'laundry_by_weight';
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS items JSONB DEFAULT '[]'::jsonb;
      ALTER TABLE services ADD COLUMN IF NOT EXISTS category_id VARCHAR(64) DEFAULT 'laundry_by_weight';
      ALTER TABLE services ADD COLUMN IF NOT EXISTS pricing_type VARCHAR(32) DEFAULT 'weight';
    `);
    console.log('[POSTGRES] Orders reconciliation, delivery fee, categories, linens and multi-items schema verified.');

    // Seed missing default services
    const existingServices = await query('SELECT id FROM services');
    const existingIds = new Set(existingServices.rows.map(r => r.id));

    for (const s of initialServices) {
      if (!existingIds.has(s.id)) {
        await query(`
          INSERT INTO services (id, name, name_th, description, unit, price_per_kg, standard_price_per_kg, next_day_price_per_kg, same_day_price_per_kg, same_day_available, min_weight_kg, turnaround_hours, popular, features, category_id, pricing_type)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
        `, [
          s.id, s.name, s.nameTh, s.description, s.unit, s.stdPrice, s.stdPrice, s.nextPrice, s.samePrice, s.sameAvail, s.minWeight, s.turnaround, s.popular, JSON.stringify(s.features), s.categoryId, s.pricingType
        ]);
        console.log(`[POSTGRES] Seeded missing service: ${s.id} (${s.name})`);
      }
    }

    // Seed default categories, postal codes and delivery config into settings if not present
    const settingsRes = await query("SELECT value FROM settings WHERE key = 'app_config'");
    if (settingsRes.rows.length > 0) {
      const currentSettings = settingsRes.rows[0].value || {};
      let needsSettingsUpdate = false;

      if (!currentSettings.categories || currentSettings.categories.length === 0) {
        currentSettings.categories = [
          {
            id: 'laundry_by_weight',
            name: 'Laundry by Weight (KG)',
            nameTh: 'ซัก อบ รีด ตามน้ำหนัก (กิโลกรัม)',
            icon: 'scale',
            badge: '🧺 By Weight (KG)',
            pricingType: 'weight',
            description: 'Everyday casual clothes, gym wear, shirts, socks, and garments billed transparently by digital certified scale weight.',
            displayOrder: 1
          },
          {
            id: 'bedding_linens',
            name: 'Bedding, Linens & Comforters',
            nameTh: 'เครื่องนอนและผ้านวม (คิดเป็นชิ้น)',
            icon: 'bed',
            badge: '🛏️ Per Piece / Item',
            pricingType: 'piece',
            description: 'Bulky bedsheets, duvet covers, comforters, pillowcases, and blankets washed in heavy-duty commercial machines with hypoallergenic sanitization.',
            displayOrder: 2
          },
          {
            id: 'household_curtains',
            name: 'Curtains & Household Items',
            nameTh: 'ผ้าม่านและของใช้ในบ้าน',
            icon: 'home',
            badge: '🛋️ Per Piece / Set',
            pricingType: 'piece',
            description: 'Window drapes, curtains, sofa covers, bath towels, and decorative textiles refreshed and steam-pressed.',
            displayOrder: 3
          },
          {
            id: 'delicate_dryclean',
            name: 'Delicates & Special Care',
            nameTh: 'ผ้าไหมและชุดพิเศษ',
            icon: 'sparkles',
            badge: '✨ Specialty Care',
            pricingType: 'piece',
            description: 'Formal blazers, evening silk dresses, wool suits, and luxury garments requiring gentle care.',
            displayOrder: 4
          }
        ];
        needsSettingsUpdate = true;
      }

      if (!currentSettings.postalCodeRates || !Array.isArray(currentSettings.postalCodeRates) || currentSettings.postalCodeRates.length === 0) {
        currentSettings.postalCodeRates = defaultDeliveryZones.length > 0 ? defaultDeliveryZones : [];
        needsSettingsUpdate = true;
      } else if (defaultDeliveryZones.length > 0) {
        // Clean out any legacy district-level postal entries that lack a subdistrict or id
        const cleanExisting = currentSettings.postalCodeRates.filter(r => r.subdistrict && (r.id || r.subdistrictTh));
        if (cleanExisting.length !== currentSettings.postalCodeRates.length) {
          currentSettings.postalCodeRates = cleanExisting;
          needsSettingsUpdate = true;
        }

        // Ensure all 180 Bangkok sub-districts and Pattaya zones exist
        const existingIds = new Set(currentSettings.postalCodeRates.map(r => r.id || `${r.city || 'Bangkok'}-${r.subdistrict || r.district}-${r.code}`));
        const missingZones = defaultDeliveryZones.filter(dz => !existingIds.has(dz.id || `${dz.city}-${dz.subdistrict}-${dz.code}`));
        if (missingZones.length > 0) {
          currentSettings.postalCodeRates = [...currentSettings.postalCodeRates, ...missingZones];
          needsSettingsUpdate = true;
        }
      }

      if (!currentSettings.deliveryConfig) {
        currentSettings.deliveryConfig = {
          freeThreshold: 600,
          defaultRate: 80,
          promoEnabled: true,
          note: 'Free pickup and delivery for orders over ฿600 across Bangkok'
        };
        needsSettingsUpdate = true;
      }

      if (needsSettingsUpdate) {
        await query("UPDATE settings SET value = $1, updated_at = NOW() WHERE key = 'app_config'", [JSON.stringify(currentSettings)]);
        console.log('[POSTGRES] Default categories, 26 postal code rates, and deliveryConfig synced to app_config.');
      }
    }
  } catch (err) {
    console.warn('[POSTGRES WARNING] Could not verify schema / seed initial services:', err.message);
  }
}
ensureDatabaseSchema();

// Helper row mappers
function mapService(row) {
  if (!row) return null;
  const stdPrice = Number(row.standard_price_per_kg || row.price_per_kg || 65);
  const nextPrice = Number(row.next_day_price_per_kg || Math.round(stdPrice * 1.3));
  const samePrice = Number(row.same_day_price_per_kg || Math.round(stdPrice * 1.75));
  return {
    id: row.id,
    categoryId: row.category_id || 'laundry_by_weight',
    pricingType: row.pricing_type || (row.unit === 'piece' ? 'piece' : 'weight'),
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
    city: row.city || 'Bangkok',
    district: row.district,
    subdistrict: row.subdistrict || '',
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
    reconciliationStatus: row.reconciliation_status || 'UNRECONCILED',
    reconciledAt: row.reconciled_at ? new Date(row.reconciled_at).toISOString() : null,
    reconciledBy: row.reconciled_by || null,
    reconciliationNotes: row.reconciliation_notes || '',
    customerId: row.customer_id || null,
    bankAccountRef: row.bank_account_ref || '',
    postalCode: row.postal_code || '10110',
    deliveryFee: row.delivery_fee !== null ? Number(row.delivery_fee) : 0,
    quantity: row.quantity !== null && row.quantity !== undefined ? Number(row.quantity) : (row.actual_weight_kg || row.estimated_weight_kg || 1),
    unit: row.unit || 'KG',
    categoryId: row.category_id || 'laundry_by_weight',
    items: row.items && Array.isArray(row.items) ? row.items : (typeof row.items === 'string' ? JSON.parse(row.items) : (row.items || [])),
    timeline: Array.isArray(row.timeline) ? row.timeline : [],
    createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString()
  };
}


function mapCustomer(row) {
  if (!row) return null;
  return {
    id: row.id,
    fullName: row.full_name,
    nickName: row.nick_name || '',
    gender: row.gender || 'Rather not say',
    dateOfBirth: row.date_of_birth || '',
    mobileNumber: row.mobile_number,
    isWhatsApp: Boolean(row.is_whatsapp),
    secondaryMobile: row.secondary_mobile || '',
    isSecondaryWhatsApp: Boolean(row.is_secondary_whatsapp),
    email: row.email || '',
    lineId: row.line_id || '',
    pinCode: row.pin_code || '123456',
    isVerified: Boolean(row.is_verified),
    verifiedVia: row.verified_via || null,
    tier: row.tier || 'Regular',
    notes: row.notes || '',
    companyTax: typeof row.company_tax === 'string' ? JSON.parse(row.company_tax) : (row.company_tax || {}),
    addresses: typeof row.addresses === 'string' ? JSON.parse(row.addresses) : (Array.isArray(row.addresses) ? row.addresses : []),
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

// --- Staff & Admin Users Local Persistence & Fallback ---
const ADMIN_USERS_FILE = path.join(__dirname, 'admin_users_local.json');
const ADMIN_ROLES_FILE = path.join(__dirname, 'admin_roles_local.json');

const ALL_BACKOFFICE_FEATURES = [
  'orders',
  'sales-reconciliation',
  'users',
  'crm',
  'faq',
  'services-pricing',
  'postal-rates',
  'gateway',
  'line-oa',
  'incidents',
  'new-pos'
];

const DEFAULT_ADMIN_ROLES = [
  {
    id: 'super_admin',
    name: 'Super Administrator',
    nameTh: 'ผู้ดูแลระบบสูงสุด',
    description: 'Unrestricted full access to all back-office features, system settings, financial data, and security controls.',
    descriptionTh: 'เข้าถึงฟังก์ชันและตั้งค่าระบบทั้งหมดโดยไม่มีข้อจำกัด รวมถึงการเงินและความปลอดภัย',
    isSystem: true,
    color: 'purple',
    permissions: [...ALL_BACKOFFICE_FEATURES]
  },
  {
    id: 'manager',
    name: 'Store / Branch Manager',
    nameTh: 'ผู้จัดการสาขา',
    description: 'Supervises branch operations, pricing catalog, sales reconciliation, customer CRM, and online support.',
    descriptionTh: 'ดูแลภาพรวมสาขา บริหารออเดอร์ ปรับปรุงราคา ยอดขาย ระบบลูกค้าสัมพันธ์ และบริการลูกค้า',
    isSystem: false,
    color: 'sky',
    permissions: [
      'orders',
      'sales-reconciliation',
      'crm',
      'faq',
      'services-pricing',
      'postal-rates',
      'incidents',
      'new-pos'
    ]
  },
  {
    id: 'staff',
    name: 'Operations / Cashier',
    nameTh: 'พนักงานหน้าร้าน / แคชเชียร์',
    description: 'Front-desk walk-in order intake, laundry weighing, order tracking, and basic customer lookup.',
    descriptionTh: 'รับผ้าหน้าร้าน ชั่งน้ำหนักผ้า ติดตามสถานะออเดอร์ และค้นหาข้อมูลลูกค้า',
    isSystem: false,
    color: 'teal',
    permissions: [
      'orders',
      'crm',
      'new-pos',
      'incidents'
    ]
  },
  {
    id: 'rider',
    name: 'Express Delivery Rider',
    nameTh: 'พนักงานจัดส่ง / ไรเดอร์',
    description: 'Pickup and drop-off delivery logistics, route monitoring, and order delivery status updates.',
    descriptionTh: 'ดูรายการรับ-ส่งผ้า ติดตามสถานะการจัดส่ง และยืนยันการส่งผ้าสำเร็จ',
    isSystem: false,
    color: 'amber',
    permissions: [
      'orders'
    ]
  }
];

function loadLocalRoles() {
  try {
    if (fs.existsSync(ADMIN_ROLES_FILE)) {
      const raw = fs.readFileSync(ADMIN_ROLES_FILE, 'utf8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Could not read admin_roles_local.json:', err.message);
  }
  return DEFAULT_ADMIN_ROLES;
}

function saveLocalRoles(roles) {
  try {
    fs.writeFileSync(ADMIN_ROLES_FILE, JSON.stringify(roles, null, 2), 'utf8');
  } catch (err) {
    console.warn('Could not write admin_roles_local.json:', err.message);
  }
}

let localAdminRoles = loadLocalRoles();

function resolveUserPermissions(user, rolesList = localAdminRoles) {
  if (!user) return ['orders'];
  if (user.role === 'super_admin' || user.role === 'admin') {
    return ALL_BACKOFFICE_FEATURES;
  }
  if (Array.isArray(user.permissions) && user.permissions.length > 0) {
    return user.permissions;
  }
  const foundRole = rolesList.find(r => r.id === user.role);
  if (foundRole && Array.isArray(foundRole.permissions)) {
    return foundRole.permissions;
  }
  return ['orders'];
}

const defaultAdminPass = process.env.ADMIN_PASSWORD || 'admin1234';
const defaultAdminHash = hashPassword(defaultAdminPass);

const DEFAULT_LOCAL_ADMIN_USERS = [
  {
    id: 1,
    username: process.env.ADMIN_USERNAME || 'admin',
    email: 'admin@nonamelaundry.com',
    fullName: 'Master Administrator',
    phone: '+66 81 234 5678',
    role: 'super_admin',
    status: 'active',
    permissions: [...ALL_BACKOFFICE_FEATURES],
    password_hash: defaultAdminHash.hash,
    salt: defaultAdminHash.salt,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 2,
    username: 'sukhumvit_mgr',
    email: 'manager.sukhumvit@nonamelaundry.com',
    fullName: 'Somchai Prasert (Sukhumvit Branch Manager)',
    phone: '+66 89 876 5432',
    role: 'manager',
    status: 'active',
    permissions: [
      'orders', 'sales-reconciliation', 'crm', 'faq',
      'services-pricing', 'postal-rates', 'incidents', 'new-pos'
    ],
    password_hash: defaultAdminHash.hash,
    salt: defaultAdminHash.salt,
    createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 7).toISOString()
  },
  {
    id: 3,
    username: 'pos_operator1',
    email: 'staff.asoke@nonamelaundry.com',
    fullName: 'Anong Srisawat (POS Cashier & Intake)',
    phone: '+66 82 345 6789',
    role: 'staff',
    status: 'active',
    permissions: ['orders', 'crm', 'new-pos', 'incidents'],
    password_hash: defaultAdminHash.hash,
    salt: defaultAdminHash.salt,
    createdAt: new Date(Date.now() - 86400000 * 14).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 14).toISOString()
  },
  {
    id: 4,
    username: 'rider_sompong',
    email: 'rider.bkk@nonamelaundry.com',
    fullName: 'Sompong Jaidee (Bangkok Express Rider)',
    phone: '+66 91 123 4567',
    role: 'rider',
    status: 'active',
    permissions: ['orders'],
    password_hash: defaultAdminHash.hash,
    salt: defaultAdminHash.salt,
    createdAt: new Date(Date.now() - 86400000 * 20).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 20).toISOString()
  }
];

function loadLocalAdminUsers() {
  try {
    if (fs.existsSync(ADMIN_USERS_FILE)) {
      const raw = fs.readFileSync(ADMIN_USERS_FILE, 'utf8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Could not read admin_users_local.json:', err.message);
  }
  return DEFAULT_LOCAL_ADMIN_USERS;
}

function saveLocalAdminUsers(users) {
  try {
    fs.writeFileSync(ADMIN_USERS_FILE, JSON.stringify(users, null, 2), 'utf8');
  } catch (err) {
    console.warn('Could not write admin_users_local.json:', err.message);
  }
}

let localAdminUsers = loadLocalAdminUsers();

// --- Orders Local Persistence & Fallback ---
const ORDERS_FILE = path.join(__dirname, 'orders_local.json');

const DEFAULT_LOCAL_ORDERS = [
  {
    id: 'NNL-7124-BK',
    customerName: 'Krit Panich',
    contactChannel: 'line',
    contactValue: '@krit_panich',
    email: 'krit.panich@gmail.com',
    serviceId: 'wash_fold',
    serviceName: 'Wash / Fold',
    district: 'Watthana',
    condoName: 'Noble Ploenchit',
    roomNumber: 'Tower B, 1402',
    leaveWithJuristic: true,
    estimatedWeightKg: 4.5,
    actualWeightKg: null,
    minWeightAppliedKg: 4.0,
    pricePerKg: 65,
    totalPrice: 343,
    turnaroundSpeed: 'standard_48h',
    status: 'BOOKING_REQUESTED',
    paymentStatus: 'PENDING',
    paymentMethod: null,
    paymentRef: null,
    tagNumber: 'TAG-PENDING',
    pickupDate: new Date().toISOString().split('T')[0],
    pickupTime: '09:00 - 11:00 (Morning)',
    deliveryDate: 'Scheduled in 48 Hours (~2 Days)',
    deliveryTime: '16:00 - 18:00 (Early Evening)',
    specialInstructions: 'Please collect from juristic lobby. Leave tag photo via LINE.',
    agreedTerms: true,
    cashlessPolicyAcknowledged: true,
    createdAt: new Date().toISOString(),
    timeline: [
      {
        status: 'BOOKING_REQUESTED',
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
        note: 'Customer placed booking online via LINE. Pick-up requested at Noble Ploenchit.'
      }
    ]
  },
  {
    id: 'NNL-8491-BK',
    customerName: 'Alex Thorne',
    contactChannel: 'whatsapp',
    contactValue: '+66 82 455 9182',
    email: 'alex.thorne@gmail.com',
    serviceId: 'wash_iron_fold',
    serviceName: 'Wash / Iron / Fold',
    district: 'Watthana (Thonglor, Ekkamai, Phrom Phong)',
    condoName: 'The Estelle Phrom Phong',
    roomNumber: 'Tower A, 1804',
    leaveWithJuristic: true,
    estimatedWeightKg: 4.5,
    actualWeightKg: 4.8,
    minWeightAppliedKg: 3.0,
    pricePerKg: 95,
    totalPrice: 456,
    turnaroundSpeed: 'standard_48h',
    status: 'IN_WASH',
    tagNumber: 'TAG-BKK-092',
    pickupDate: '2026-09-16',
    pickupTime: '09:00 - 11:00 (Morning)',
    deliveryDate: '2026-09-17',
    deliveryTime: '16:00 - 18:00 (Early Evening)',
    specialInstructions: 'Please leave at Juristic Office counter with K. Somchai. Extra care for white collared shirts.',
    createdAt: '2026-09-16T08:15:00Z',
    timeline: [
      { status: 'BOOKING_REQUESTED', timestamp: '2026-09-16 08:15', note: 'Customer placed booking online.' },
      { status: 'PICKUP_SCHEDULED', timestamp: '2026-09-16 08:40', note: 'Driver Somkit assigned for pickup.' },
      { status: 'PICKED_UP', timestamp: '2026-09-16 09:45', note: 'Collected from The Estelle Juristic Office. Bag Tag #TAG-BKK-092 attached.' },
      { status: 'WEIGHED_INSPECTED', timestamp: '2026-09-16 10:30', note: 'Weighed on certified digital scale: 4.80 KG. All items passed intake inspection.' },
      { status: 'IN_WASH', timestamp: '2026-09-16 11:10', note: 'Machine wash & drying cycle started with gentle hypoallergenic conditioner.' }
    ]
  },
  {
    id: 'NNL-3920-BK',
    customerName: 'Siriporn Tanaka',
    contactChannel: 'line',
    contactValue: '@siriporn_bkk',
    email: 'siriporn.t@yahoo.co.th',
    serviceId: 'wash_fold',
    serviceName: 'Wash / Fold',
    district: 'Bang Rak (Silom, Surawong)',
    condoName: 'Ashton Silom',
    roomNumber: 'Floor 22, Room 2209',
    leaveWithJuristic: false,
    estimatedWeightKg: 3.0,
    actualWeightKg: 3.2,
    minWeightAppliedKg: 3.0,
    pricePerKg: 65,
    totalPrice: 208,
    turnaroundSpeed: 'standard_48h',
    status: 'OUT_FOR_DELIVERY',
    tagNumber: 'TAG-BKK-084',
    pickupDate: '2026-09-15',
    pickupTime: '14:00 - 16:00 (Afternoon)',
    deliveryDate: '2026-09-16',
    deliveryTime: '18:00 - 20:30 (Evening Rush)',
    specialInstructions: 'Call via LINE before arriving. Ring room doorbell.',
    createdAt: '2026-09-15T11:20:00Z',
    timeline: [
      { status: 'BOOKING_REQUESTED', timestamp: '2026-09-15 11:20', note: 'Booking confirmed.' },
      { status: 'PICKUP_SCHEDULED', timestamp: '2026-09-15 12:00', note: 'Driver Narong dispatched.' },
      { status: 'PICKED_UP', timestamp: '2026-09-15 14:30', note: 'Bag collected directly from customer.' },
      { status: 'WEIGHED_INSPECTED', timestamp: '2026-09-15 15:45', note: 'Scale weight logged: 3.20 KG.' },
      { status: 'IN_WASH', timestamp: '2026-09-15 16:30', note: 'Wash & dry cycle completed.' },
      { status: 'IRON_FOLD', timestamp: '2026-09-16 09:00', note: 'Folded & packed in sealed eco-bags.' },
      { status: 'READY_FOR_DELIVERY', timestamp: '2026-09-16 14:00', note: 'Checked by QC supervisor.' },
      { status: 'OUT_FOR_DELIVERY', timestamp: '2026-09-16 17:30', note: 'Driver Narong is out for delivery. ETA ~18:15.' }
    ]
  }
];

function loadLocalOrders() {
  try {
    if (fs.existsSync(ORDERS_FILE)) {
      const raw = fs.readFileSync(ORDERS_FILE, 'utf8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Could not read orders_local.json:', err.message);
  }
  return DEFAULT_LOCAL_ORDERS;
}

function saveLocalOrders(orders) {
  try {
    fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2), 'utf8');
  } catch (err) {
    console.warn('Could not write orders_local.json:', err.message);
  }
}

let localOrders = loadLocalOrders();
if (!fs.existsSync(ORDERS_FILE)) {
  saveLocalOrders(localOrders);
}

// Admin Authentication Routes
app.post('/api/admin/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const trimmedUser = username.trim().toLowerCase();
    let user = null;

    // 1. Try finding user in database first
    try {
      const result = await query(
        'SELECT * FROM admin_users WHERE LOWER(username) = LOWER($1) OR LOWER(email) = LOWER($1) LIMIT 1',
        [trimmedUser]
      );
      if (result.rows && result.rows.length > 0) {
        user = result.rows[0];
      }
    } catch (dbErr) {
      console.warn('[AUTH] PostgreSQL query failed during admin login, falling back to local users:', dbErr.message);
    }

    // 2. If not found in DB or DB offline, look up in localAdminUsers
    if (!user) {
      const foundLocal = localAdminUsers.find(u => 
        (u.username && u.username.toLowerCase() === trimmedUser) ||
        (u.email && u.email.toLowerCase() === trimmedUser)
      );
      if (foundLocal) {
        user = foundLocal;
      }
    }

    if (!user) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    // Check account status
    if (user.status === 'suspended') {
      return res.status(403).json({ error: 'This account has been suspended. Please contact your administrator.' });
    }

    // Verify password against hash
    let isValid = false;
    if (user.password_hash && user.salt) {
      isValid = verifyPassword(password, user.password_hash, user.salt);
    } else if (password === 'admin1234') {
      isValid = true;
    }

    if (!isValid) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const resolvedPermissions = resolveUserPermissions(user, localAdminRoles);
    const session = createSession({
      ...user,
      permissions: resolvedPermissions
    });

    res.json({
      success: true,
      token: session.token,
      expiresAt: session.expiresAt,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.full_name || user.fullName || user.username,
        role: user.role || 'staff',
        permissions: resolvedPermissions,
        status: user.status || 'active'
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

  const user = localAdminUsers.find(u => u.id === session.id || (session.username && u.username.toLowerCase() === session.username.toLowerCase()));
  const resolvedPermissions = user ? resolveUserPermissions(user, localAdminRoles) : (session.permissions || resolveUserPermissions({ role: session.role || 'staff' }, localAdminRoles));

  res.json({
    authenticated: true,
    user: {
      id: session.id,
      username: session.username,
      role: session.role || (user ? user.role : 'staff'),
      permissions: resolvedPermissions,
      fullName: user ? (user.fullName || user.full_name) : session.username
    }
  });
});

app.post('/api/admin/logout', (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;
  if (token) {
    deleteSession(token);
  }
  res.json({ success: true });
});

// --- Custom Roles CRUD Endpoints ---
app.get('/api/admin/roles', requireAdminAuth, (req, res) => {
  const rolesWithCount = localAdminRoles.map(role => ({
    ...role,
    userCount: localAdminUsers.filter(u => u.role === role.id).length
  }));
  res.json({
    success: true,
    roles: rolesWithCount,
    features: ALL_BACKOFFICE_FEATURES
  });
});

app.post('/api/admin/roles', requireAdminAuth, (req, res) => {
  try {
    const { id, name, nameTh, description, descriptionTh, permissions, color } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Role name is required' });
    }

    const roleId = (id || name)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9_]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '');

    if (!roleId) {
      return res.status(400).json({ error: 'A valid role identifier is required' });
    }

    if (localAdminRoles.some(r => r.id === roleId)) {
      return res.status(400).json({ error: `A role with identifier "${roleId}" already exists.` });
    }

    const validatedPermissions = Array.isArray(permissions)
      ? permissions.filter(p => ALL_BACKOFFICE_FEATURES.includes(p))
      : ['orders'];

    const newRole = {
      id: roleId,
      name: name.trim(),
      nameTh: (nameTh || name).trim(),
      description: (description || '').trim(),
      descriptionTh: (descriptionTh || description || '').trim(),
      isSystem: false,
      color: color || 'indigo',
      permissions: validatedPermissions,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    localAdminRoles.push(newRole);
    saveLocalRoles(localAdminRoles);

    res.json({
      success: true,
      role: {
        ...newRole,
        userCount: 0
      }
    });
  } catch (err) {
    console.error('Error creating custom role:', err);
    res.status(500).json({ error: err.message || 'Failed to create role' });
  }
});

app.put('/api/admin/roles/:id', requireAdminAuth, (req, res) => {
  try {
    const roleId = req.params.id;
    const { name, nameTh, description, descriptionTh, permissions, color } = req.body;

    const roleIndex = localAdminRoles.findIndex(r => r.id === roleId);
    if (roleIndex === -1) {
      return res.status(404).json({ error: 'Role not found' });
    }

    const existing = localAdminRoles[roleIndex];
    const isSystemRole = existing.isSystem || roleId === 'super_admin';

    const validatedPermissions = Array.isArray(permissions)
      ? permissions.filter(p => ALL_BACKOFFICE_FEATURES.includes(p))
      : existing.permissions;

    const updatedRole = {
      ...existing,
      name: name !== undefined ? name.trim() : existing.name,
      nameTh: nameTh !== undefined ? nameTh.trim() : existing.nameTh,
      description: description !== undefined ? description.trim() : existing.description,
      descriptionTh: descriptionTh !== undefined ? descriptionTh.trim() : existing.descriptionTh,
      // Super admin always retains all permissions
      permissions: isSystemRole && roleId === 'super_admin' ? [...ALL_BACKOFFICE_FEATURES] : validatedPermissions,
      color: color || existing.color || 'indigo',
      updatedAt: new Date().toISOString()
    };

    localAdminRoles[roleIndex] = updatedRole;
    saveLocalRoles(localAdminRoles);

    res.json({
      success: true,
      role: {
        ...updatedRole,
        userCount: localAdminUsers.filter(u => u.role === roleId).length
      }
    });
  } catch (err) {
    console.error('Error updating role:', err);
    res.status(500).json({ error: err.message || 'Failed to update role' });
  }
});

app.delete('/api/admin/roles/:id', requireAdminAuth, (req, res) => {
  try {
    const roleId = req.params.id;
    const existing = localAdminRoles.find(r => r.id === roleId);
    if (!existing) {
      return res.status(404).json({ error: 'Role not found' });
    }

    if (existing.isSystem || roleId === 'super_admin') {
      return res.status(400).json({ error: 'System roles cannot be deleted.' });
    }

    const assignedCount = localAdminUsers.filter(u => u.role === roleId).length;
    if (assignedCount > 0) {
      return res.status(400).json({
        error: `Cannot delete this role because ${assignedCount} user(s) are currently assigned to it. Please reassign those users first.`
      });
    }

    localAdminRoles = localAdminRoles.filter(r => r.id !== roleId);
    saveLocalRoles(localAdminRoles);

    res.json({ success: true, message: 'Role deleted successfully' });
  } catch (err) {
    console.error('Error deleting role:', err);
    res.status(500).json({ error: err.message || 'Failed to delete role' });
  }
});

app.post('/api/admin/change-password', requireAdminAuth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters long' });
    }

    let user = null;
    try {
      const result = await query('SELECT * FROM admin_users WHERE id = $1', [req.adminUser.id]);
      if (result.rows && result.rows.length > 0) {
        user = result.rows[0];
      }
    } catch (dbErr) {
      console.warn('[AUTH] DB error in change-password, falling back to local users:', dbErr.message);
    }

    const localIdx = localAdminUsers.findIndex(u => u.id === req.adminUser.id || u.username === req.adminUser.username);
    if (!user && localIdx !== -1) {
      user = localAdminUsers[localIdx];
    }

    if (!user) {
      return res.status(404).json({ error: 'Admin account not found' });
    }

    let isValid = false;
    if (user.password_hash && user.salt) {
      isValid = verifyPassword(currentPassword, user.password_hash, user.salt);
    } else if (currentPassword === 'admin1234') {
      isValid = true;
    }

    if (!isValid) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    const { hash, salt } = hashPassword(newPassword);

    try {
      await query(
        'UPDATE admin_users SET password_hash = $1, salt = $2, updated_at = NOW() WHERE id = $3',
        [hash, salt, user.id]
      );
    } catch (dbErr) {
      console.warn('[AUTH] DB update error in change-password:', dbErr.message);
    }

    if (localIdx !== -1) {
      localAdminUsers[localIdx] = {
        ...localAdminUsers[localIdx],
        password_hash: hash,
        salt: salt,
        updatedAt: new Date().toISOString()
      };
      saveLocalAdminUsers(localAdminUsers);
    }

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (err) {
    console.error('Change password error:', err);
    res.status(500).json({ error: 'Failed to update password' });
  }
});

// --- Staff & Admin User Management CRUD Endpoints ---
app.get('/api/admin/users', requireAdminAuth, async (req, res) => {
  try {
    const result = await query(
      'SELECT id, username, email, full_name, phone, role, status, created_at, updated_at FROM admin_users ORDER BY id ASC'
    );
    if (result.rows && result.rows.length > 0) {
      return res.json({
        success: true,
        users: result.rows.map(u => {
          const localMatch = localAdminUsers.find(lu => lu.id === u.id || lu.username === u.username);
          const perms = localMatch && Array.isArray(localMatch.permissions) && localMatch.permissions.length > 0
            ? localMatch.permissions
            : resolveUserPermissions(u, localAdminRoles);
          return {
            id: u.id,
            username: u.username,
            email: u.email,
            fullName: u.full_name || u.username,
            phone: u.phone || '',
            role: u.role || 'staff',
            status: u.status || 'active',
            permissions: perms,
            hasCustomPermissions: localMatch && Array.isArray(localMatch.permissions) && localMatch.permissions.length > 0,
            createdAt: u.created_at,
            updatedAt: u.updated_at
          };
        })
      });
    }
  } catch (err) {
    console.warn('[SERVER] PostgreSQL query fallback for /api/admin/users:', err.message);
  }

  // Return users without exposing password_hash or salt
  res.json({
    success: true,
    users: localAdminUsers.map(u => ({
      id: u.id,
      username: u.username,
      email: u.email,
      fullName: u.fullName || u.username,
      phone: u.phone || '',
      role: u.role || 'staff',
      status: u.status || 'active',
      permissions: Array.isArray(u.permissions) && u.permissions.length > 0
        ? u.permissions
        : resolveUserPermissions(u, localAdminRoles),
      hasCustomPermissions: Array.isArray(u.permissions) && u.permissions.length > 0,
      createdAt: u.createdAt,
      updatedAt: u.updatedAt
    }))
  });
});

app.post('/api/admin/users', requireAdminAuth, async (req, res) => {
  try {
    const { username, email, fullName, phone, role, status, password, permissions } = req.body;
    if (!username || !username.trim()) {
      return res.status(400).json({ error: 'Username is required' });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const cleanUsername = username.trim().toLowerCase();
    const cleanRole = role || 'staff';
    const cleanStatus = status || 'active';
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanFullName = (fullName || cleanUsername).trim();
    const cleanPhone = (phone || '').trim();

    if (localAdminUsers.some(u => u.username.toLowerCase() === cleanUsername)) {
      return res.status(400).json({ error: `Username "${cleanUsername}" is already taken` });
    }

    const { hash, salt } = hashPassword(password);
    let newId = localAdminUsers.length > 0 ? Math.max(...localAdminUsers.map(u => u.id)) + 1 : 1;

    try {
      const dbRes = await query(
        `INSERT INTO admin_users (username, email, full_name, phone, role, status, password_hash, salt, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
         RETURNING id, username, email, full_name, phone, role, status, created_at, updated_at`,
        [cleanUsername, cleanEmail, cleanFullName, cleanPhone, cleanRole, cleanStatus, hash, salt]
      );
      if (dbRes.rows && dbRes.rows.length > 0) {
        newId = dbRes.rows[0].id;
      }
    } catch (dbErr) {
      console.warn('[SERVER] PostgreSQL insert fallback for /api/admin/users:', dbErr.message);
    }

    const customPerms = Array.isArray(permissions) && permissions.length > 0
      ? permissions.filter(p => ALL_BACKOFFICE_FEATURES.includes(p))
      : null;

    const newUser = {
      id: newId,
      username: cleanUsername,
      email: cleanEmail,
      fullName: cleanFullName,
      phone: cleanPhone,
      role: cleanRole,
      status: cleanStatus,
      permissions: customPerms,
      password_hash: hash,
      salt: salt,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    localAdminUsers.push(newUser);
    saveLocalAdminUsers(localAdminUsers);

    res.json({
      success: true,
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        fullName: newUser.fullName,
        phone: newUser.phone,
        role: newUser.role,
        status: newUser.status,
        permissions: customPerms || resolveUserPermissions(newUser, localAdminRoles),
        hasCustomPermissions: !!customPerms,
        createdAt: newUser.createdAt,
        updatedAt: newUser.updatedAt
      }
    });
  } catch (err) {
    console.error('Error creating admin user:', err);
    res.status(500).json({ error: err.message || 'Failed to create user' });
  }
});

app.put('/api/admin/users/:id', requireAdminAuth, async (req, res) => {
  try {
    const userId = parseInt(req.params.id, 10);
    const { username, email, fullName, phone, role, status, password, permissions } = req.body;

    const userIdx = localAdminUsers.findIndex(u => u.id === userId);
    const existing = userIdx !== -1 ? localAdminUsers[userIdx] : null;

    const cleanUsername = username ? username.trim().toLowerCase() : (existing?.username || '');
    const cleanEmail = email !== undefined ? email.trim().toLowerCase() : (existing?.email || '');
    const cleanFullName = fullName !== undefined ? fullName.trim() : (existing?.fullName || '');
    const cleanPhone = phone !== undefined ? phone.trim() : (existing?.phone || '');
    const cleanRole = role || (existing?.role || 'staff');
    const cleanStatus = status || (existing?.status || 'active');

    let updatedHash = existing?.password_hash;
    let updatedSalt = existing?.salt;

    if (password && password.length >= 6) {
      const { hash, salt } = hashPassword(password);
      updatedHash = hash;
      updatedSalt = salt;
    }

    let updatedPermissions = existing?.permissions;
    if (permissions !== undefined) {
      if (Array.isArray(permissions) && permissions.length > 0) {
        updatedPermissions = permissions.filter(p => ALL_BACKOFFICE_FEATURES.includes(p));
      } else {
        updatedPermissions = null; // null indicates inherit from role
      }
    }

    try {
      if (password && password.length >= 6) {
        await query(
          `UPDATE admin_users SET username = $1, email = $2, full_name = $3, phone = $4, role = $5, status = $6, password_hash = $7, salt = $8, updated_at = NOW() WHERE id = $9`,
          [cleanUsername, cleanEmail, cleanFullName, cleanPhone, cleanRole, cleanStatus, updatedHash, updatedSalt, userId]
        );
      } else {
        await query(
          `UPDATE admin_users SET username = $1, email = $2, full_name = $3, phone = $4, role = $5, status = $6, updated_at = NOW() WHERE id = $7`,
          [cleanUsername, cleanEmail, cleanFullName, cleanPhone, cleanRole, cleanStatus, userId]
        );
      }
    } catch (dbErr) {
      console.warn('[SERVER] PostgreSQL update fallback for /api/admin/users/:id:', dbErr.message);
    }

    const updatedUser = {
      id: userId,
      username: cleanUsername,
      email: cleanEmail,
      fullName: cleanFullName,
      phone: cleanPhone,
      role: cleanRole,
      status: cleanStatus,
      permissions: updatedPermissions,
      password_hash: updatedHash,
      salt: updatedSalt,
      createdAt: existing?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (userIdx !== -1) {
      localAdminUsers[userIdx] = updatedUser;
    } else {
      localAdminUsers.push(updatedUser);
    }
    saveLocalAdminUsers(localAdminUsers);

    res.json({
      success: true,
      user: {
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        fullName: updatedUser.fullName,
        phone: updatedUser.phone,
        role: updatedUser.role,
        status: updatedUser.status,
        permissions: updatedPermissions || resolveUserPermissions(updatedUser, localAdminRoles),
        hasCustomPermissions: Array.isArray(updatedPermissions) && updatedPermissions.length > 0,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt
      }
    });
  } catch (err) {
    console.error('Error updating admin user:', err);
    res.status(500).json({ error: err.message || 'Failed to update user' });
  }
});

app.delete('/api/admin/users/:id', requireAdminAuth, async (req, res) => {
  try {
    const userId = parseInt(req.params.id, 10);
    if (req.adminUser && req.adminUser.id === userId) {
      return res.status(400).json({ error: 'You cannot delete your own currently logged-in account' });
    }

    try {
      await query('DELETE FROM admin_users WHERE id = $1', [userId]);
    } catch (dbErr) {
      console.warn('[SERVER] PostgreSQL delete fallback for /api/admin/users/:id:', dbErr.message);
    }

    localAdminUsers = localAdminUsers.filter(u => u.id !== userId);
    saveLocalAdminUsers(localAdminUsers);
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (err) {
    console.error('Error deleting admin user:', err);
    res.status(500).json({ error: err.message || 'Failed to delete user' });
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
    console.warn('[SERVER] PostgreSQL query fallback for /api/state:', err.message);
    // Return resilient fallback state so the React layout renders immediately
    res.json({
      services: initialServices.map(s => ({
        id: s.id,
        categoryId: s.categoryId,
        pricingType: s.pricingType,
        name: s.name,
        nameTh: s.nameTh,
        description: s.description,
        unit: s.unit,
        pricePerKg: s.stdPrice,
        standardPricePerKg: s.stdPrice,
        nextDayPricePerKg: s.nextPrice,
        sameDayPricePerKg: s.samePrice,
        sameDayAvailable: s.sameAvail,
        minWeightKg: s.minWeight,
        turnaroundHours: s.turnaround,
        popular: s.popular,
        features: s.features
      })),
      orders: localOrders,
      incidents: [],
      settings: {
        categories: [
          { id: 'laundry_by_weight', name: 'Laundry by Weight (KG)', nameTh: 'ซัก อบ รีด ตามน้ำหนัก (กิโลกรัม)', icon: 'scale', badge: '🧺 By Weight (KG)', pricingType: 'weight', description: 'Everyday casual clothes billed by weight.', displayOrder: 1 },
          { id: 'bedding_linens', name: 'Bedding, Linens & Comforters', nameTh: 'เครื่องนอนและผ้านวม (คิดเป็นชิ้น)', icon: 'bed', badge: '🛏️ Per Piece / Item', pricingType: 'piece', description: 'Bulky bedsheets and blankets.', displayOrder: 2 },
          { id: 'household_curtains', name: 'Curtains & Household Items', nameTh: 'ผ้าม่านและของใช้ในบ้าน', icon: 'home', badge: '🛋️ Per Piece / Set', pricingType: 'piece', description: 'Curtains and towels.', displayOrder: 3 },
          { id: 'delicate_dryclean', name: 'Delicates & Special Care', nameTh: 'ผ้าไหมและชุดพิเศษ', icon: 'sparkles', badge: '✨ Specialty Care', pricingType: 'piece', description: 'Specialty care garments.', displayOrder: 4 }
        ],
        lineOaId: '@nonamelaundry',
        whatsappNumber: '+66 94 882 1920',
        supportEmail: 'support@nonamelaundry.com'
      }
    });
  }
});

// 3. Services API
app.get('/api/services', async (req, res) => {
  try {
    const result = await query('SELECT * FROM services ORDER BY price_per_kg ASC');
    res.json(result.rows.map(mapService));
  } catch (err) {
    console.warn('[SERVER] PostgreSQL query fallback for /api/services:', err.message);
    res.json(initialServices.map(s => ({
      id: s.id,
      categoryId: s.categoryId,
      pricingType: s.pricingType,
      name: s.name,
      nameTh: s.nameTh,
      description: s.description,
      unit: s.unit,
      pricePerKg: s.stdPrice,
      standardPricePerKg: s.stdPrice,
      nextDayPricePerKg: s.nextPrice,
      sameDayPricePerKg: s.samePrice,
      sameDayAvailable: s.sameAvail,
      minWeightKg: s.minWeight,
      turnaroundHours: s.turnaround,
      popular: s.popular,
      features: s.features
    })));
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
    const categoryId = s.categoryId || s.category || 'laundry_by_weight';
    const pricingType = s.pricingType || (s.unit === 'piece' ? 'piece' : 'weight');
    const unit = s.unit || (pricingType === 'piece' ? 'piece' : 'KG');

    const result = await query(`
      INSERT INTO services (id, name, name_th, description, unit, price_per_kg, standard_price_per_kg, next_day_price_per_kg, same_day_price_per_kg, same_day_available, min_weight_kg, turnaround_hours, popular, features, category_id, pricing_type)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      RETURNING *
    `, [
      id,
      s.name.trim(),
      s.nameTh ? s.nameTh.trim() : s.name.trim(),
      s.description || '',
      unit,
      stdPrice,
      stdPrice,
      nextPrice,
      samePrice,
      sameAvail,
      Number(s.minWeightKg) || 1.0,
      Number(s.turnaroundHours) || 48,
      Boolean(s.popular),
      JSON.stringify(Array.isArray(s.features) ? s.features : []),
      categoryId,
      pricingType
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
      const catId = s.categoryId || s.category || null;
      const pType = s.pricingType || (s.unit === 'piece' ? 'piece' : (s.unit === 'KG' ? 'weight' : null));

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
            category_id = COALESCE($12, category_id),
            pricing_type = COALESCE($13, pricing_type),
            unit = COALESCE($14, unit),
            updated_at = NOW()
        WHERE id = $15
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
        catId,
        pType,
        s.unit || null,
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
    const categoryId = s.categoryId || s.category || null;
    const pricingType = s.pricingType || (s.unit === 'piece' ? 'piece' : (s.pricingType ? s.pricingType : null));
    const unit = s.unit || (pricingType === 'piece' ? 'piece' : (s.unit ? s.unit : null));

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
          category_id = COALESCE($12, category_id),
          pricing_type = COALESCE($13, pricing_type),
          unit = COALESCE($14, unit),
          updated_at = NOW()
      WHERE id = $15
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
      categoryId,
      pricingType,
      unit,
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
let lastOrdersDbWarn = 0;
app.get('/api/orders', async (req, res) => {
  try {
    const result = await query('SELECT * FROM orders ORDER BY created_at DESC');
    const dbOrders = result.rows.map(mapOrder);
    if (dbOrders.length > 0) {
      return res.json(dbOrders);
    }
    res.json(localOrders);
  } catch (err) {
    if (Date.now() - lastOrdersDbWarn > 60000) {
      console.warn('[SERVER] PostgreSQL query fallback for /api/orders (throttled):', err.message);
      lastOrdersDbWarn = Date.now();
    }
    res.json(localOrders);
  }
});

app.get('/api/orders/:id', async (req, res) => {
  try {
    const result = await query('SELECT * FROM orders WHERE id = $1', [req.params.id]);
    if (result.rows.length > 0) {
      return res.json(mapOrder(result.rows[0]));
    }
    const found = localOrders.find(o => o.id === req.params.id);
    if (found) return res.json(found);
    return res.status(404).json({ error: 'Order not found' });
  } catch (err) {
    console.warn('[SERVER] PostgreSQL query fallback for /api/orders/:id:', err.message);
    const found = localOrders.find(o => o.id === req.params.id);
    if (found) return res.json(found);
    res.status(404).json({ error: 'Order not found' });
  }
});

app.post('/api/orders', async (req, res) => {
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

  const localOrderObj = {
    id: trackingNumber,
    customerName: o.customerName || 'Online Customer',
    contactChannel: o.contactChannel || 'online',
    contactValue: o.contactValue || '',
    email: o.email || '',
    serviceId: o.serviceId || 'wash_fold',
    serviceName: o.serviceName || 'Wash / Fold',
    district: o.district || 'Watthana',
    condoName: o.condoName || '',
    roomNumber: o.roomNumber || '',
    leaveWithJuristic: Boolean(o.leaveWithJuristic),
    estimatedWeightKg: o.estimatedWeightKg !== undefined ? Number(o.estimatedWeightKg) : 4.0,
    actualWeightKg: o.actualWeightKg !== undefined && o.actualWeightKg !== null ? Number(o.actualWeightKg) : null,
    minWeightAppliedKg: Number(o.minWeightAppliedKg) || 4.0,
    pricePerKg: Number(o.pricePerKg) || 65,
    totalPrice: Number(o.totalPrice) || 260,
    turnaroundSpeed: o.turnaroundSpeed || 'standard_48h',
    status: o.status || 'BOOKING_REQUESTED',
    paymentStatus: o.paymentStatus || 'PENDING',
    paymentMethod: o.paymentMethod || null,
    paymentRef: o.paymentRef || null,
    tagNumber: o.tagNumber || 'TAG-PENDING',
    pickupDate: o.pickupDate || now.toISOString().split('T')[0],
    pickupTime: o.pickupTime || '09:00 - 11:00 (Morning)',
    deliveryDate: o.deliveryDate || 'Scheduled in 48 Hours (~2 Days)',
    deliveryTime: o.deliveryTime || '16:00 - 18:00 (Early Evening)',
    specialInstructions: o.specialInstructions || '',
    agreedTerms: Boolean(o.agreedTerms),
    cashlessPolicyAcknowledged: Boolean(o.cashlessPolicyAcknowledged),
    timeline: initialTimeline,
    createdAt: now.toISOString(),
    postalCode: o.postalCode || '10110',
    deliveryFee: Number(o.deliveryFee) || 0,
    quantity: o.quantity !== undefined && o.quantity !== null ? Number(o.quantity) : 1,
    unit: o.unit || 'KG',
    categoryId: o.categoryId || 'laundry_by_weight',
    items: o.items || []
  };

  try {
    const result = await query(`
      INSERT INTO orders (
        id, customer_name, contact_channel, contact_value, email,
        service_id, service_name, district, condo_name, room_number,
        leave_with_juristic, estimated_weight_kg, actual_weight_kg,
        min_weight_applied_kg, price_per_kg, total_price, turnaround_speed, status,
        payment_status, payment_method, payment_ref, tag_number,
        pickup_date, pickup_time, delivery_date, delivery_time,
        special_instructions, agreed_terms, cashless_policy_acknowledged,
        timeline, created_at, postal_code, delivery_fee,
        quantity, unit, category_id, items
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
        $11, $12, $13, $14, $15, $16, $17, $18, $19, $20,
        $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33,
        $34, $35, $36, $37
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
      o.turnaroundSpeed || 'standard_48h',
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
      now,
      o.postalCode || '10110',
      Number(o.deliveryFee) || 0,
      o.quantity !== undefined && o.quantity !== null ? Number(o.quantity) : (Number(o.actualWeightKg) || Number(o.estimatedWeightKg) || 1),
      o.unit || 'KG',
      o.categoryId || 'laundry_by_weight',
      JSON.stringify(o.items || [])
    ]);

    const createdOrder = mapOrder(result.rows[0]);
    localOrders = [createdOrder, ...localOrders.filter(x => x.id !== createdOrder.id)];
    saveLocalOrders(localOrders);

    // Asynchronously dispatch email notification to business inbox (non-blocking)
    sendBookingNotificationEmail(createdOrder).catch(mailErr => {
      console.error('[MAILER] Background notification error:', mailErr);
    });

    res.status(201).json(createdOrder);
  } catch (err) {
    console.warn('[SERVER] PostgreSQL query fallback for /api/orders (persisting locally):', err.message);
    localOrders = [localOrderObj, ...localOrders.filter(x => x.id !== localOrderObj.id)];
    saveLocalOrders(localOrders);

    sendBookingNotificationEmail(localOrderObj).catch(mailErr => {
      console.error('[MAILER] Background notification error:', mailErr);
    });

    res.status(201).json(localOrderObj);
  }
});

const handleOrderStatusUpdate = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      newStatus,
      status,
      note,
      actualWeightKg,
      tagNumber,
      serviceId,
      serviceName,
      turnaroundSpeed,
      pricePerKg,
      minWeightAppliedKg,
      totalPrice,
      deliveryDate,
      deliveryTime,
      serviceUpdates
    } = req.body;

    let currentOrder = null;
    let fromDb = false;

    try {
      const existingRes = await query('SELECT * FROM orders WHERE id = $1', [id]);
      if (existingRes.rows.length > 0) {
        currentOrder = existingRes.rows[0];
        fromDb = true;
      }
    } catch (dbErr) {
      console.warn('[SERVER] PostgreSQL query fallback for handleOrderStatusUpdate:', dbErr.message);
    }

    if (!currentOrder) {
      const found = localOrders.find(o => o.id === id);
      if (found) {
        currentOrder = found;
      }
    }

    if (!currentOrder) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const now = new Date();
    const timestampStr = now.toISOString().replace('T', ' ').substring(0, 16);

    const sUpdates = serviceUpdates || {};
    const targetStatus = newStatus || status || currentOrder.status;
    const targetServiceId = serviceId || sUpdates.serviceId || currentOrder.service_id || currentOrder.serviceId;
    const targetServiceName = serviceName || sUpdates.serviceName || currentOrder.service_name || currentOrder.serviceName;
    const targetTurnaround = turnaroundSpeed || sUpdates.turnaroundSpeed || currentOrder.turnaround_speed || currentOrder.turnaroundSpeed;
    const targetPricePerKg = (pricePerKg !== undefined && pricePerKg !== null) ? Number(pricePerKg) : (sUpdates.pricePerKg !== undefined ? Number(sUpdates.pricePerKg) : Number(currentOrder.price_per_kg || currentOrder.pricePerKg || 65));
    const targetMinWeight = (minWeightAppliedKg !== undefined && minWeightAppliedKg !== null) ? Number(minWeightAppliedKg) : (sUpdates.minWeightAppliedKg !== undefined ? Number(sUpdates.minWeightAppliedKg) : Number(currentOrder.min_weight_applied_kg || currentOrder.minWeightAppliedKg || 4.0));
    const targetQuantity = (req.body.quantity !== undefined && req.body.quantity !== null) ? Number(req.body.quantity) : (currentOrder.quantity || 1);
    const targetUnit = req.body.unit || sUpdates.unit || currentOrder.unit || 'KG';
    const targetCategoryId = req.body.categoryId || sUpdates.categoryId || currentOrder.category_id || currentOrder.categoryId || 'laundry_by_weight';

    let updatedActualKg = currentOrder.actual_weight_kg !== undefined ? currentOrder.actual_weight_kg : currentOrder.actualWeightKg;
    if (actualWeightKg !== undefined && actualWeightKg !== null && actualWeightKg !== '') {
      updatedActualKg = Number(actualWeightKg);
    } else if (sUpdates.actualWeightKg !== undefined && sUpdates.actualWeightKg !== null && sUpdates.actualWeightKg !== '') {
      updatedActualKg = Number(sUpdates.actualWeightKg);
    }

    const effectiveKg = (updatedActualKg !== null && updatedActualKg !== undefined) ? updatedActualKg : Number(currentOrder.estimated_weight_kg || currentOrder.estimatedWeightKg || 4.0);
    const billableKg = Math.max(effectiveKg, targetMinWeight);
    const calculatedTotal = targetUnit === 'piece' 
      ? Math.round((Number(targetQuantity) || 1) * targetPricePerKg)
      : Math.round(billableKg * targetPricePerKg);
    const finalTotalPrice = (totalPrice !== undefined && totalPrice !== null) ? Number(totalPrice) : (sUpdates.totalPrice !== undefined ? Number(sUpdates.totalPrice) : calculatedTotal);

    const updatedTagNumber = (tagNumber && tagNumber.trim()) ? tagNumber.trim() : ((sUpdates.tagNumber && sUpdates.tagNumber.trim()) ? sUpdates.tagNumber.trim() : (currentOrder.tag_number || currentOrder.tagNumber));
    const targetDeliveryDate = deliveryDate || sUpdates.deliveryDate || currentOrder.delivery_date || currentOrder.deliveryDate;
    const targetDeliveryTime = deliveryTime || sUpdates.deliveryTime || currentOrder.delivery_time || currentOrder.deliveryTime;

    const currentTimeline = Array.isArray(currentOrder.timeline) ? currentOrder.timeline : [];
    const newTimelineEvent = {
      status: targetStatus,
      timestamp: timestampStr,
      note: note || (`Order updated to ${targetStatus.replace(/_/g, ' ')}.`)
    };
    const updatedTimeline = [...currentTimeline, newTimelineEvent];

    if (fromDb) {
      try {
        const result = await query(`
          UPDATE orders
          SET status = $1,
              actual_weight_kg = $2,
              total_price = $3,
              tag_number = $4,
              service_id = $5,
              service_name = $6,
              turnaround_speed = $7,
              price_per_kg = $8,
              min_weight_applied_kg = $9,
              delivery_date = $10,
              delivery_time = $11,
              timeline = $12,
              quantity = $13,
              unit = $14,
              category_id = $15,
              updated_at = NOW()
          WHERE id = $16
          RETURNING *
        `, [
          targetStatus,
          updatedActualKg,
          finalTotalPrice,
          updatedTagNumber,
          targetServiceId,
          targetServiceName,
          targetTurnaround,
          targetPricePerKg,
          targetMinWeight,
          targetDeliveryDate,
          targetDeliveryTime,
          JSON.stringify(updatedTimeline),
          targetQuantity,
          targetUnit,
          targetCategoryId,
          id
        ]);

        const mapped = mapOrder(result.rows[0]);
        const locIdx = localOrders.findIndex(o => o.id === id);
        if (locIdx !== -1) localOrders[locIdx] = mapped;
        else localOrders.unshift(mapped);
        saveLocalOrders(localOrders);

        return res.json(mapped);
      } catch (dbUpdateErr) {
        console.warn('[SERVER] PostgreSQL update failed in handleOrderStatusUpdate, falling back to local:', dbUpdateErr.message);
      }
    }

    const updatedLocalOrder = {
      ...currentOrder,
      status: targetStatus,
      actualWeightKg: updatedActualKg,
      totalPrice: finalTotalPrice,
      tagNumber: updatedTagNumber,
      serviceId: targetServiceId,
      serviceName: targetServiceName,
      turnaroundSpeed: targetTurnaround,
      pricePerKg: targetPricePerKg,
      minWeightAppliedKg: targetMinWeight,
      deliveryDate: targetDeliveryDate,
      deliveryTime: targetDeliveryTime,
      timeline: updatedTimeline,
      quantity: targetQuantity,
      unit: targetUnit,
      categoryId: targetCategoryId,
      updatedAt: now.toISOString()
    };

    const locIdx = localOrders.findIndex(o => o.id === id);
    if (locIdx !== -1) {
      localOrders[locIdx] = updatedLocalOrder;
    } else {
      localOrders.unshift(updatedLocalOrder);
    }
    saveLocalOrders(localOrders);

    res.json(updatedLocalOrder);
  } catch (err) {
    console.error('Error updating order status:', err);
    res.status(500).json({ error: err.message });
  }
};

app.patch('/api/orders/:id/status', handleOrderStatusUpdate);
app.put('/api/orders/:id/status', handleOrderStatusUpdate);

const handleOrderPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentMethod = 'PromptPay QR', transactionRef = '', paymentRef = '' } = req.body;

    let currentOrder = null;
    let fromDb = false;

    try {
      const existingRes = await query('SELECT * FROM orders WHERE id = $1', [id]);
      if (existingRes.rows.length > 0) {
        currentOrder = existingRes.rows[0];
        fromDb = true;
      }
    } catch (dbErr) {
      console.warn('[SERVER] PostgreSQL query fallback for handleOrderPayment:', dbErr.message);
    }

    if (!currentOrder) {
      const found = localOrders.find(o => o.id === id);
      if (found) currentOrder = found;
    }

    if (!currentOrder) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const now = new Date();
    const timestampStr = now.toISOString().replace('T', ' ').substring(0, 16);
    const ref = paymentRef || transactionRef || ('TXN-' + Math.floor(100000 + Math.random() * 900000));

    const currentTimeline = Array.isArray(currentOrder.timeline) ? currentOrder.timeline : [];
    const newTimelineEvent = {
      status: 'PAID',
      timestamp: timestampStr,
      note: `Cashless payment verified via 3rd-Party Gateway (${paymentMethod}). Ref: ${ref}. Amount: ฿${currentOrder.total_price || currentOrder.totalPrice} THB.`
    };
    const updatedTimeline = [...currentTimeline, newTimelineEvent];

    if (fromDb) {
      try {
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
          JSON.stringify(updatedTimeline),
          id
        ]);

        const mapped = mapOrder(result.rows[0]);
        const locIdx = localOrders.findIndex(o => o.id === id);
        if (locIdx !== -1) localOrders[locIdx] = mapped;
        else localOrders.unshift(mapped);
        saveLocalOrders(localOrders);

        return res.json(mapped);
      } catch (dbErr) {
        console.warn('[SERVER] PostgreSQL update failed for payment, fallback to local:', dbErr.message);
      }
    }

    const updatedLocal = {
      ...currentOrder,
      paymentStatus: 'PAID',
      paymentMethod,
      paymentRef: ref,
      timeline: updatedTimeline,
      updatedAt: now.toISOString()
    };
    const locIdx = localOrders.findIndex(o => o.id === id);
    if (locIdx !== -1) localOrders[locIdx] = updatedLocal;
    else localOrders.unshift(updatedLocal);
    saveLocalOrders(localOrders);

    res.json(updatedLocal);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

app.patch('/api/orders/:id/pay', handleOrderPayment);
app.put('/api/orders/:id/pay', handleOrderPayment);
app.put('/api/orders/:id/paid', handleOrderPayment);

// Single Order Reconciliation
app.patch('/api/orders/:id/reconcile', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      reconciliationStatus = 'RECONCILED',
      reconciliationNotes = '',
      bankAccountRef = '',
      reconciledBy = 'admin'
    } = req.body;

    const existingRes = await query('SELECT * FROM orders WHERE id = $1', [id]);
    if (existingRes.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const currentOrder = existingRes.rows[0];
    const now = new Date();
    const timestampStr = now.toISOString().replace('T', ' ').substring(0, 16);

    const currentTimeline = Array.isArray(currentOrder.timeline) ? currentOrder.timeline : [];
    const newTimelineEvent = {
      status: `RECON_${reconciliationStatus}`,
      timestamp: timestampStr,
      note: `Transaction marked as ${reconciliationStatus} by ${reconciledBy}.${bankAccountRef ? ` Bank/Batch Ref: ${bankAccountRef}.` : ''}${reconciliationNotes ? ` Notes: ${reconciliationNotes}` : ''}`
    };

    const isReconciled = reconciliationStatus === 'RECONCILED';
    const reconciledAtVal = isReconciled ? now : (reconciliationStatus === 'UNRECONCILED' ? null : currentOrder.reconciled_at);

    const result = await query(`
      UPDATE orders
      SET reconciliation_status = $1,
          reconciled_at = $2,
          reconciled_by = $3,
          reconciliation_notes = $4,
          bank_account_ref = $5,
          timeline = $6,
          updated_at = NOW()
      WHERE id = $7
      RETURNING *
    `, [
      reconciliationStatus,
      reconciledAtVal,
      reconciledBy,
      reconciliationNotes,
      bankAccountRef,
      JSON.stringify([...currentTimeline, newTimelineEvent]),
      id
    ]);

    res.json(mapOrder(result.rows[0]));
  } catch (err) {
    console.error('Error reconciling order:', err);
    res.status(500).json({ error: err.message });
  }
});

// Batch Order Reconciliation
app.post('/api/orders/batch-reconcile', async (req, res) => {
  try {
    const {
      orderIds = [],
      reconciliationStatus = 'RECONCILED',
      bankAccountRef = '',
      notes = '',
      reconciledBy = 'admin'
    } = req.body;

    if (!Array.isArray(orderIds) || orderIds.length === 0) {
      return res.status(400).json({ error: 'orderIds array is required' });
    }

    const now = new Date();
    const timestampStr = now.toISOString().replace('T', ' ').substring(0, 16);
    const isReconciled = reconciliationStatus === 'RECONCILED';
    const reconciledAtVal = isReconciled ? now : null;

    const updatedOrders = [];

    for (const orderId of orderIds) {
      const existingRes = await query('SELECT * FROM orders WHERE id = $1', [orderId]);
      if (existingRes.rows.length === 0) continue;

      const currentOrder = existingRes.rows[0];
      const currentTimeline = Array.isArray(currentOrder.timeline) ? currentOrder.timeline : [];
      const newTimelineEvent = {
        status: `RECON_${reconciliationStatus}`,
        timestamp: timestampStr,
        note: `Batch ${reconciliationStatus} by ${reconciledBy}.${bankAccountRef ? ` Batch Ref: ${bankAccountRef}.` : ''}${notes ? ` Notes: ${notes}` : ''}`
      };

      const result = await query(`
        UPDATE orders
        SET reconciliation_status = $1,
            reconciled_at = $2,
            reconciled_by = $3,
            reconciliation_notes = COALESCE($4, reconciliation_notes),
            bank_account_ref = COALESCE($5, bank_account_ref),
            timeline = $6,
            updated_at = NOW()
        WHERE id = $7
        RETURNING *
      `, [
        reconciliationStatus,
        reconciledAtVal,
        reconciledBy,
        notes || currentOrder.reconciliation_notes,
        bankAccountRef || currentOrder.bank_account_ref,
        JSON.stringify([...currentTimeline, newTimelineEvent]),
        orderId
      ]);

      if (result.rows.length > 0) {
        updatedOrders.push(mapOrder(result.rows[0]));
      }
    }

    res.json({ success: true, count: updatedOrders.length, orders: updatedOrders });
  } catch (err) {
    console.error('Error batch reconciling orders:', err);
    res.status(500).json({ error: err.message });
  }
});

// Sales & Reconciliation Summary Report API
app.get('/api/reports/sales-reconciliation', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let sql = 'SELECT * FROM orders WHERE 1=1';
    const params = [];

    if (startDate) {
      params.push(startDate);
      sql += ` AND created_at >= $${params.length}`;
    }
    if (endDate) {
      params.push(endDate);
      sql += ` AND created_at <= $${params.length}`;
    }

    sql += ' ORDER BY created_at DESC';
    const result = await query(sql, params);
    const orders = result.rows.map(mapOrder);

    let grossRevenue = 0;
    let collectedRevenue = 0;
    let pendingReceivables = 0;
    let reconciledTotal = 0;
    let unreconciledTotal = 0;
    let discrepancyCount = 0;

    const breakdownByMethod = {};
    const breakdownByService = {};

    for (const o of orders) {
      const price = Number(o.totalPrice) || 0;
      grossRevenue += price;

      if (o.paymentStatus === 'PAID') {
        collectedRevenue += price;
        const method = o.paymentMethod || 'PromptPay QR';
        breakdownByMethod[method] = (breakdownByMethod[method] || 0) + price;

        if (o.reconciliationStatus === 'RECONCILED') {
          reconciledTotal += price;
        } else {
          unreconciledTotal += price;
        }
      } else {
        pendingReceivables += price;
      }

      if (o.reconciliationStatus === 'DISCREPANCY') {
        discrepancyCount++;
      }

      const srv = o.serviceName || 'Wash / Fold';
      breakdownByService[srv] = (breakdownByService[srv] || 0) + price;
    }

    res.json({
      summary: {
        totalOrders: orders.length,
        grossRevenue,
        collectedRevenue,
        pendingReceivables,
        reconciledTotal,
        unreconciledTotal,
        reconciledPercent: collectedRevenue > 0 ? Math.round((reconciledTotal / collectedRevenue) * 100) : 0,
        discrepancyCount
      },
      breakdownByMethod,
      breakdownByService,
      orders
    });
  } catch (err) {
    console.error('Error generating sales report:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/orders/:id/invoice/send', async (req, res) => {
  try {
    const { id } = req.params;
    const { channel = 'email', recipient = '', note = '' } = req.body;

    const existingRes = await query('SELECT * FROM orders WHERE id = $1', [id]);
    if (existingRes.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const currentOrder = existingRes.rows[0];
    const now = new Date();
    const timestampStr = now.toISOString().replace('T', ' ').substring(0, 16);
    const auditNote = note || `Official Tax Invoice (INV-${id}) & Cashless Payment Link dispatched via ${channel.toUpperCase()}${recipient ? ' (' + recipient + ')' : ''}. Total: ฿${currentOrder.total_price} THB.`;

    const currentTimeline = Array.isArray(currentOrder.timeline) ? currentOrder.timeline : [];
    const newTimelineEvent = {
      status: currentOrder.status,
      timestamp: timestampStr,
      note: auditNote
    };

    const result = await query(`
      UPDATE orders
      SET timeline = $1,
          updated_at = NOW()
      WHERE id = $2
      RETURNING *
    `, [JSON.stringify([...currentTimeline, newTimelineEvent]), id]);

    res.json({
      success: true,
      message: `Invoice dispatched via ${channel.toUpperCase()}`,
      order: mapOrder(result.rows[0])
    });
  } catch (err) {
    console.error('Error logging invoice dispatch:', err);
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

// 7. Customers API
app.get('/api/customers', async (req, res) => {
  try {
    const result = await query('SELECT * FROM customers ORDER BY created_at DESC');
    res.json(result.rows.map(mapCustomer));
  } catch (err) {
    console.error('Error fetching customers:', err);
    res.status(500).json({ error: err.message });
  }
});

// Customer Authentication (Login via TLS Cloud Backend or Local DB Fallback)
app.post('/api/customers/login', async (req, res) => {
  try {
    const { identifier, pinCode, password } = req.body;
    const authSecret = (password || pinCode || '').trim();

    if (!identifier || !authSecret) {
      return res.status(400).json({ error: 'กรุณากรอกเบอร์มือถือ (หรือ Customer ID) และรหัสผ่าน/PIN' });
    }

    const cleanInput = identifier.trim();

    // 1. Prioritize TLS Cloud Backend (Test Server or Production Server via TLS_API_URL)
    try {
      const tlsLoginRes = await callTlsApi('/api/v1/external/auth/login', {
        method: 'POST',
        body: {
          identifier: cleanInput,
          phone: cleanInput,
          email: cleanInput,
          password: authSecret,
          brand: TLS_BRAND
        }
      });

      if (tlsLoginRes.ok && tlsLoginRes.data?.success && tlsLoginRes.data?.customer) {
        console.log(`[AUTH] Successfully logged in via TLS Cloud (${TLS_API_URL}):`, tlsLoginRes.data.customer.name);
        const tlsCust = tlsLoginRes.data.customer;
        const token = tlsLoginRes.data.token;

        // Fetch customer's orders from TLS Cloud
        let orders = [];
        try {
          const tlsOrdersRes = await callTlsApi('/api/v1/external/orders', {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (tlsOrdersRes.ok && Array.isArray(tlsOrdersRes.data)) {
            orders = tlsOrdersRes.data;
          }
        } catch (oErr) {
          console.warn('[AUTH] Error fetching TLS orders:', oErr.message);
        }

        // Normalize TLS Customer to NoName Frontend format
        const normalizedCustomer = {
          id: tlsCust.id,
          fullName: tlsCust.name || tlsCust.fullName || cleanInput,
          name: tlsCust.name,
          nickName: tlsCust.nickName || '',
          gender: tlsCust.gender || 'Rather not say',
          mobileNumber: tlsCust.phone || cleanInput,
          phone: tlsCust.phone || cleanInput,
          email: tlsCust.email || '',
          lineId: tlsCust.lineId || '',
          tier: tlsCust.tier || 'Regular',
          isVIP: Boolean(tlsCust.isVIP),
          creditBalance: tlsCust.creditBalance || 0,
          addresses: Array.isArray(tlsCust.addresses) ? tlsCust.addresses.map(a => ({
            id: a.id,
            label: a.label || a.placeName || 'Home',
            placeName: a.placeName || '',
            address: a.address || '',
            district: a.district || '',
            roomNumber: a.roomNumber || '',
            latitude: a.latitude,
            longitude: a.longitude,
            googleMapsUrl: a.googleMapsUrl || (a.latitude && a.longitude ? `https://maps.google.com/?q=${a.latitude},${a.longitude}` : ''),
            leaveWithJuristic: a.leaveWithJuristic !== false,
            isPrimary: Boolean(a.isPrimary)
          })) : []
        };

        // Cache/upsert into local customers table for offline/POS availability
        try {
          await query(`
            INSERT INTO customers (
              id, full_name, nick_name, gender, mobile_number, email, tier, addresses, updated_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
            ON CONFLICT (id) DO UPDATE SET
              full_name = EXCLUDED.full_name,
              nick_name = EXCLUDED.nick_name,
              mobile_number = EXCLUDED.mobile_number,
              email = EXCLUDED.email,
              tier = EXCLUDED.tier,
              addresses = EXCLUDED.addresses,
              updated_at = NOW()
          `, [
            normalizedCustomer.id,
            normalizedCustomer.fullName,
            normalizedCustomer.nickName,
            normalizedCustomer.gender,
            normalizedCustomer.mobileNumber,
            normalizedCustomer.email,
            normalizedCustomer.tier,
            JSON.stringify(normalizedCustomer.addresses)
          ]);
        } catch (syncErr) {
          console.warn('[AUTH] Local DB customer sync notice:', syncErr.message);
        }

        return res.json({
          success: true,
          source: 'tls_cloud',
          token,
          customer: normalizedCustomer,
          orders
        });
      }
    } catch (tlsErr) {
      console.warn('[AUTH] TLS Cloud login attempt failed, trying local DB fallback:', tlsErr.message);
    }

    // 2. Fallback to Local PostgreSQL database check
    const digitsOnly = cleanInput.replace(/\D/g, '');
    const last8Digits = digitsOnly.length >= 8 ? digitsOnly.slice(-8) : digitsOnly;

    const custRes = await query(`
      SELECT * FROM customers 
      WHERE LOWER(id) = LOWER($1)
         OR LOWER(email) = LOWER($1)
         OR LOWER(mobile_number) = LOWER($1)
         OR ($2 <> '' AND regexp_replace(mobile_number, '[^0-9]', '', 'g') LIKE '%' || $2)
      LIMIT 1
    `, [cleanInput, last8Digits]);

    if (custRes.rows.length === 0) {
      return res.status(401).json({ error: 'ไม่พบบัญชีลูกค้า กรุณาตรวจสอบเบอร์มือถือหรือลงทะเบียนใหม่' });
    }

    const row = custRes.rows[0];
    const customerPin = (row.pin_code || '123456').trim();
    if (customerPin !== authSecret) {
      return res.status(401).json({ error: 'รหัสผ่าน หรือ PIN ไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง' });
    }

    const customer = mapCustomer(row);

    // Fetch this customer's laundry orders from local DB
    const ordersRes = await query(`
      SELECT * FROM orders 
      WHERE customer_id = $1 
         OR LOWER(customer_name) = LOWER($2)
         OR contact_value = $3
      ORDER BY created_at DESC
    `, [customer.id, customer.fullName, customer.mobileNumber]);

    const orders = ordersRes.rows.map(mapOrder);
    const token = 'cust_session_' + Buffer.from(`${customer.id}:${Date.now()}`).toString('base64');

    res.json({
      success: true,
      source: 'local_db',
      token,
      customer,
      orders
    });
  } catch (err) {
    console.error('Customer login error:', err);
    res.status(500).json({ error: 'Internal server error during login' });
  }
});

// Get Customer Orders (from TLS Cloud if token exists, or Local DB)
app.get('/api/customers/:id/orders', async (req, res) => {
  try {
    const { id } = req.params;
    const authHeader = req.headers.authorization;

    // If request contains JWT token from TLS, fetch from TLS Cloud API
    if (authHeader && authHeader.startsWith('Bearer eyJ')) {
      const tlsOrdersRes = await callTlsApi('/api/v1/external/orders', {
        method: 'GET',
        headers: { 'Authorization': authHeader }
      });
      if (tlsOrdersRes.ok && Array.isArray(tlsOrdersRes.data)) {
        return res.json(tlsOrdersRes.data);
      }
    }

    const custRes = await query('SELECT * FROM customers WHERE id = $1', [id]);
    if (custRes.rows.length === 0) {
      return res.json([]);
    }
    const customer = mapCustomer(custRes.rows[0]);

    const ordersRes = await query(`
      SELECT * FROM orders 
      WHERE customer_id = $1 
         OR LOWER(customer_name) = LOWER($2)
         OR contact_value = $3
      ORDER BY created_at DESC
    `, [customer.id, customer.fullName, customer.mobileNumber]);

    res.json(ordersRes.rows.map(mapOrder));
  } catch (err) {
    console.error('Error fetching customer orders:', err);
    res.status(500).json({ error: err.message });
  }
});

// Public Customer Registration (Syncs to TLS Cloud + Local DB)
app.post('/api/customers/register', async (req, res) => {
  try {
    const data = req.body;
    if (!data.fullName || !data.mobileNumber) {
      return res.status(400).json({ error: 'Full name and mobile number are required.' });
    }

    let addresses = Array.isArray(data.addresses) ? data.addresses : [];
    if (addresses.length === 0 && (data.condoName || data.address || data.district)) {
      addresses = [{
        id: 'ADDR-' + Math.floor(100 + Math.random() * 900),
        label: (data.condoName || data.addressLabel || 'Home').trim(),
        address: data.address ? data.address.trim() : `${(data.condoName || '').trim()}, ${data.district || 'Bangkok'}`,
        district: data.district || 'Watthana (Thonglor, Ekkamai, Phrom Phong)',
        roomNumber: (data.roomNumber || '').trim(),
        googleMapsUrl: (data.googleMapsUrl || '').trim() || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(((data.condoName || data.address || '') + ' ' + (data.district || 'Bangkok')).trim())}`,
        leaveWithJuristic: data.leaveWithJuristic !== undefined ? Boolean(data.leaveWithJuristic) : true,
        isPrimary: true
      }];
    }

    const primaryAddress = addresses.find(a => a.isPrimary) || addresses[0];

    // 1. Register to TLS Cloud Backend
    let tlsToken = null;
    let registeredCustId = data.id || ('CUST-' + Math.floor(1000 + Math.random() * 9000));
    try {
      const cleanPhone = (data.mobileNumber || '').replace(/[^0-9]/g, '');
      const tlsPayload = {
        name: data.fullName.trim(),
        phone: cleanPhone,
        password: data.pinCode || '123456',
        email: data.email ? data.email.trim().toLowerCase() : undefined,
        nickName: (data.nickName || '').trim() || undefined,
        gender: data.gender || 'Rather not say',
        address: primaryAddress ? {
          label: primaryAddress.label || 'Home',
          placeName: primaryAddress.label || undefined,
          latitude: primaryAddress.latitude ? parseFloat(primaryAddress.latitude) : undefined,
          longitude: primaryAddress.longitude ? parseFloat(primaryAddress.longitude) : undefined,
          googleMapsUrl: primaryAddress.googleMapsUrl || undefined,
          address: primaryAddress.address,
          roomNumber: primaryAddress.roomNumber || undefined,
          district: primaryAddress.district || undefined,
          leaveWithJuristic: primaryAddress.leaveWithJuristic !== false,
          isPrimary: true
        } : undefined
      };

      const tlsRegisterRes = await callTlsApi('/api/v1/external/auth/register', {
        method: 'POST',
        body: tlsPayload
      });

      if (tlsRegisterRes.ok && tlsRegisterRes.data?.customer) {
        console.log('[REGISTRATION] Successfully registered on TLS Cloud:', tlsRegisterRes.data.customer.id);
        registeredCustId = tlsRegisterRes.data.customer.id;
        tlsToken = tlsRegisterRes.data.token;
      } else {
        console.warn('[REGISTRATION] TLS Cloud register note:', tlsRegisterRes.data);
      }
    } catch (tlsErr) {
      console.warn('[REGISTRATION] TLS Cloud register attempt failed:', tlsErr.message);
    }

    // 2. Persist to local PostgreSQL DB
    const now = new Date();
    const result = await query(`
      INSERT INTO customers (
        id, full_name, nick_name, gender, date_of_birth,
        mobile_number, is_whatsapp, secondary_mobile, is_secondary_whatsapp,
        email, line_id, pin_code, is_verified, verified_via, tier,
        notes, company_tax, addresses, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5,
        $6, $7, $8, $9,
        $10, $11, $12, $13, $14, $15,
        $16, $17, $18, $19, $19
      )
      ON CONFLICT (id) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        addresses = EXCLUDED.addresses,
        updated_at = NOW()
      RETURNING *
    `, [
      registeredCustId,
      data.fullName.trim(),
      (data.nickName || '').trim(),
      data.gender || 'Rather not say',
      data.dateOfBirth || null,
      data.mobileNumber.trim(),
      data.isWhatsApp !== undefined ? Boolean(data.isWhatsApp) : true,
      (data.secondaryMobile || '').trim(),
      Boolean(data.isSecondaryWhatsApp),
      (data.email || '').trim().toLowerCase(),
      (data.lineId || '').trim(),
      data.pinCode || '123456',
      Boolean(data.isVerified),
      data.verifiedVia || null,
      data.tier || 'New',
      data.notes || '',
      JSON.stringify(data.companyTax || {}),
      JSON.stringify(addresses),
      now
    ]);

    const mapped = mapCustomer(result.rows[0]);
    console.log(`[CUSTOMER REGISTERED] ID: ${mapped.id}, Name: ${mapped.fullName}, Mobile: ${mapped.mobileNumber}`);
    res.status(201).json({
      success: true,
      token: tlsToken || ('cust_session_' + Buffer.from(`${mapped.id}:${Date.now()}`).toString('base64')),
      customer: mapped
    });
  } catch (err) {
    console.error('Error registering customer:', err);
    res.status(500).json({ error: err.message });
  }
});

// Admin / Store Sync Customer
app.post('/api/customers', async (req, res) => {
  try {
    const data = req.body;
    if (!data.fullName) {
      return res.status(400).json({ error: 'Customer full name is required.' });
    }

    const id = data.id || ('CUST-' + Math.floor(1000 + Math.random() * 9000));
    const now = new Date();

    let addresses = Array.isArray(data.addresses) ? data.addresses : [];
    if (addresses.length === 0 && (data.condoName || data.address || data.district)) {
      addresses = [{
        id: 'ADDR-' + Math.floor(100 + Math.random() * 900),
        label: (data.condoName || data.addressLabel || 'Home').trim(),
        address: data.address ? data.address.trim() : `${(data.condoName || '').trim()}, ${data.district || 'Bangkok'}`,
        district: data.district || 'Watthana (Thonglor, Ekkamai, Phrom Phong)',
        roomNumber: (data.roomNumber || '').trim(),
        googleMapsUrl: (data.googleMapsUrl || '').trim() || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(((data.condoName || data.address || '') + ' ' + (data.district || 'Bangkok')).trim())}`,
        leaveWithJuristic: data.leaveWithJuristic !== undefined ? Boolean(data.leaveWithJuristic) : true,
        isPrimary: true
      }];
    }

    const result = await query(`
      INSERT INTO customers (
        id, full_name, nick_name, gender, date_of_birth,
        mobile_number, is_whatsapp, secondary_mobile, is_secondary_whatsapp,
        email, line_id, pin_code, is_verified, verified_via, tier,
        notes, company_tax, addresses, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5,
        $6, $7, $8, $9,
        $10, $11, $12, $13, $14, $15,
        $16, $17, $18, $19, $19
      )
      ON CONFLICT (id) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        nick_name = EXCLUDED.nick_name,
        gender = EXCLUDED.gender,
        date_of_birth = EXCLUDED.date_of_birth,
        mobile_number = EXCLUDED.mobile_number,
        is_whatsapp = EXCLUDED.is_whatsapp,
        secondary_mobile = EXCLUDED.secondary_mobile,
        is_secondary_whatsapp = EXCLUDED.is_secondary_whatsapp,
        email = EXCLUDED.email,
        line_id = EXCLUDED.line_id,
        pin_code = EXCLUDED.pin_code,
        is_verified = EXCLUDED.is_verified,
        verified_via = EXCLUDED.verified_via,
        tier = EXCLUDED.tier,
        notes = EXCLUDED.notes,
        company_tax = EXCLUDED.company_tax,
        addresses = EXCLUDED.addresses,
        updated_at = NOW()
      RETURNING *
    `, [
      id,
      data.fullName.trim(),
      (data.nickName || '').trim(),
      data.gender || 'Rather not say',
      data.dateOfBirth || null,
      data.mobileNumber ? data.mobileNumber.trim() : '',
      data.isWhatsApp !== undefined ? Boolean(data.isWhatsApp) : true,
      (data.secondaryMobile || '').trim(),
      Boolean(data.isSecondaryWhatsApp),
      (data.email || '').trim().toLowerCase(),
      (data.lineId || '').trim(),
      data.pinCode || '123456',
      Boolean(data.isVerified),
      data.verifiedVia || null,
      data.tier || 'Regular',
      data.notes || '',
      JSON.stringify(data.companyTax || {}),
      JSON.stringify(addresses),
      now
    ]);

    res.status(201).json(mapCustomer(result.rows[0]));
  } catch (err) {
    console.error('Error saving customer:', err);
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/customers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    const result = await query(`
      UPDATE customers SET
        full_name = COALESCE($1, full_name),
        nick_name = COALESCE($2, nick_name),
        gender = COALESCE($3, gender),
        date_of_birth = COALESCE($4, date_of_birth),
        mobile_number = COALESCE($5, mobile_number),
        is_whatsapp = COALESCE($6, is_whatsapp),
        secondary_mobile = COALESCE($7, secondary_mobile),
        is_secondary_whatsapp = COALESCE($8, is_secondary_whatsapp),
        email = COALESCE($9, email),
        line_id = COALESCE($10, line_id),
        pin_code = COALESCE($11, pin_code),
        tier = COALESCE($12, tier),
        notes = COALESCE($13, notes),
        company_tax = COALESCE($14::jsonb, company_tax),
        addresses = COALESCE($15::jsonb, addresses),
        updated_at = NOW()
      WHERE id = $16
      RETURNING *
    `, [
      data.fullName ? data.fullName.trim() : null,
      data.nickName ? data.nickName.trim() : null,
      data.gender || null,
      data.dateOfBirth || null,
      data.mobileNumber ? data.mobileNumber.trim() : null,
      data.isWhatsApp !== undefined ? Boolean(data.isWhatsApp) : null,
      data.secondaryMobile ? data.secondaryMobile.trim() : null,
      data.isSecondaryWhatsApp !== undefined ? Boolean(data.isSecondaryWhatsApp) : null,
      data.email ? data.email.trim().toLowerCase() : null,
      data.lineId ? data.lineId.trim() : null,
      data.pinCode || null,
      data.tier || null,
      data.notes || null,
      data.companyTax ? JSON.stringify(data.companyTax) : null,
      data.addresses ? JSON.stringify(data.addresses) : null,
      id
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    res.json(mapCustomer(result.rows[0]));
  } catch (err) {
    console.error('Error updating customer:', err);
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/customers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await query('DELETE FROM customers WHERE id = $1', [id]);
    res.json({ success: true, deletedId: id });
  } catch (err) {
    console.error('Error deleting customer:', err);
    res.status(500).json({ error: err.message });
  }
});


// Static assets serving
const publicDir = path.join(__dirname, '..');
app.use(express.static(publicDir, {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('app.js') || filePath.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
    }
  }
}));

// Explicit SEO & Crawler Endpoints
app.get('/robots.txt', (req, res) => {
  res.type('text/plain');
  res.sendFile(path.join(publicDir, 'robots.txt'));
});

app.get('/sitemap.xml', (req, res) => {
  res.type('application/xml');
  res.sendFile(path.join(publicDir, 'sitemap.xml'));
});

app.get('/manifest.json', (req, res) => {
  res.type('application/json');
  res.sendFile(path.join(publicDir, 'manifest.json'));
});

// Dedicated Localized Subfolder Landing Pages
app.get(['/bangkok', '/bangkok/'], (req, res) => {
  res.sendFile(path.join(publicDir, 'bangkok', 'index.html'));
});

app.get(['/pattaya', '/pattaya/'], (req, res) => {
  res.sendFile(path.join(publicDir, 'pattaya', 'index.html'));
});

// Fallback for SPA routing
app.get('*', (req, res) => {
  res.sendFile(path.join(publicDir, 'index.html'));
});

if (!process.env.VERCEL) {
  function startServer(portToTry) {
    const server = app.listen(portToTry, () => {
      console.log(`====================================================`);
      console.log(` NoName Laundry Bangkok Server running on port ${portToTry}`);
      console.log(` Connected to Google Cloud SQL (PostgreSQL)`);
      console.log(` Local URL: http://localhost:${portToTry}`);
      console.log(`====================================================`);
    });

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        const nextPort = Number(portToTry) + 1;
        console.warn(`[SERVER WARNING] Port ${portToTry} is in use. Falling back to port ${nextPort}...`);
        startServer(nextPort);
      } else {
        console.error('[SERVER ERROR]', err);
      }
    });
  }

  startServer(PORT);
}

module.exports = app;