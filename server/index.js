require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const { query } = require('./db');
const { hashPassword, verifyPassword, createSession, getSession, deleteSession, requireAdminAuth } = require('./auth');
const { createTlsProxyRouter, callTlsApi, TLS_API_URL, TLS_BRAND } = require('./tlsProxy');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// TLS Multi-Brand Cloud Proxy Router (Server Test & Production)
app.use('/api/external', createTlsProxyRouter());
app.use('/api/tls', createTlsProxyRouter());

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
    const initialServices = [
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
      }
    ];

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

      if (!currentSettings.postalCodeRates || currentSettings.postalCodeRates.length === 0) {
        currentSettings.postalCodeRates = [
          { code: '10100', district: 'Pom Prap Sattru Phai / Samphanthawong', districtTh: 'ป้อมปราบศัตรูพ่าย / สัมพันธวงศ์', areas: 'Chinatown, Yaowarat, Khlong Thom, Sampheng, Wat Mangkon, Pom Prap', fee: 50, isActive: true, freeDeliveryAbove: 600 },
          { code: '10110', district: 'Watthana / Khlong Toei', districtTh: 'วัฒนา / คลองเตย', areas: 'Sukhumvit (Soi 1–71), Thonglor, Ekkamai, Phrom Phong, Asoke, Nana, Phra Khanong', fee: 50, isActive: true, freeDeliveryAbove: 600 },
          { code: '10120', district: 'Bang Kho Laem / Yannawa / Sathon', districtTh: 'บางคอแหลม / ยานนาวา / สาทร', areas: 'Sathorn, Chong Nonsi, Rama 3, Chan Road, Suan Phlu, Charoen Krung (South), Asiatique', fee: 50, isActive: true, freeDeliveryAbove: 600 },
          { code: '10140', district: 'Rat Burana / Thung Khru', districtTh: 'ราษฎร์บูรณะ / ทุ่งครุ', areas: 'Pracha Uthit, Rat Burana, Bang Mod, KMUTT, Suksawat Road', fee: 70, isActive: true, freeDeliveryAbove: 700 },
          { code: '10150', district: 'Bang Bon / Bang Khun Thian / Chom Thong', districtTh: 'บางบอน / บางขุนเทียน / จอมทอง', areas: 'Rama 2, Dao Khanong, Chom Thong, Bang Khun Thian, Central Rama 2, Bang Bon', fee: 80, isActive: true, freeDeliveryAbove: 700 },
          { code: '10160', district: 'Bang Khae / Nong Khaem / Phasi Charoen', districtTh: 'บางแค / หนองแขม / ภาษีเจริญ', areas: 'Phetkasem, Bang Wa Interchange, The Mall Bang Khae, Nong Khaem, Phutthamonthon Sai 1', fee: 80, isActive: true, freeDeliveryAbove: 700 },
          { code: '10170', district: 'Taling Chan / Thawi Watthana', districtTh: 'ตลิ่งชัน / ทวีวัฒนา', areas: 'Borommaratchachonnani, Phutthamonthon Sai 2–3, Taling Chan Floating Market, Ratchaphruek (West)', fee: 80, isActive: true, freeDeliveryAbove: 700 },
          { code: '10200', district: 'Phra Nakhon', districtTh: 'พระนคร', areas: 'Rattanakosin Island, Banglamphu, Sanam Luang, Khao San Road, Giant Swing, Grand Palace', fee: 60, isActive: true, freeDeliveryAbove: 600 },
          { code: '10210', district: 'Don Mueang / Lak Si', districtTh: 'ดอนเมือง / หลักสี่', areas: 'Don Mueang Airport, Chaeng Watthana, Lak Si, Song Prapha, Government Complex', fee: 80, isActive: true, freeDeliveryAbove: 700 },
          { code: '10220', district: 'Bang Khen / Sai Mai', districtTh: 'บางเขน / สายไหม', areas: 'Anusawari, Ram Inthra, Sai Mai, Sukhaphiban 5, Watcharaphon, Phahonyothin (Km 21+)', fee: 80, isActive: true, freeDeliveryAbove: 700 },
          { code: '10230', district: 'Khan Na Yao / Lat Phrao', districtTh: 'คันนายาว / ลาดพร้าว', areas: 'Lat Phrao, Chok Chai 4, Sena Nikhom, Khan Na Yao, Ram Inthra (Lower), Fashion Island', fee: 70, isActive: true, freeDeliveryAbove: 700 },
          { code: '10240', district: 'Bang Kapi / Bueng Kum / Saphan Sung', districtTh: 'บางกะปิ / บึงกุ่ม / สะพานสูง', areas: 'Ramkhamhaeng, Hua Mak, Nawamin, Seri Thai, Saphan Sung, The Mall Bangkapi', fee: 70, isActive: true, freeDeliveryAbove: 700 },
          { code: '10250', district: 'Prawet / Suan Luang', districtTh: 'ประเวศ / สวนหลวง', areas: 'Phatthanakan, On Nut (Outer), Srinakarin, Suan Luang Rama IX, Seacon Square', fee: 70, isActive: true, freeDeliveryAbove: 700 },
          { code: '10260', district: 'Bang Na / Phra Khanong', districtTh: 'บางนา / พระโขนง', areas: 'Udom Suk, Bang Na-Trat, Bearing, BITEC, Central Bangna, Bang Chak, Sukhumvit 101–107', fee: 60, isActive: true, freeDeliveryAbove: 600 },
          { code: '10300', district: 'Dusit', districtTh: 'ดุสิต', areas: 'Dusit Palace, Chitralada, Ratchawat, Sri Yan, Government House, Samsen', fee: 60, isActive: true, freeDeliveryAbove: 600 },
          { code: '10310', district: 'Wang Thonglang / Huai Khwang', districtTh: 'วังทองหลาง / ห้วยขวาง', areas: 'Rama 9, Ratchadaphisek, Meng Jai, Town in Town, Pracha Uthit, Thailand Cultural Centre', fee: 60, isActive: true, freeDeliveryAbove: 600 },
          { code: '10330', district: 'Pathum Wan', districtTh: 'ปทุมวัน', areas: 'Siam, Chidlom, Ploenchit, Wireless Road (Witthayu), Langsuan, Ratchadamri, MBK, CentralWorld', fee: 50, isActive: true, freeDeliveryAbove: 600 },
          { code: '10400', district: 'Din Daeng / Phaya Thai / Ratchathewi', districtTh: 'ดินแดง / พญาไท / ราชเทวี', areas: 'Ari, Sanam Pao, Victory Monument, Pratunam, Rangnam, Phayathai BTS, Din Daeng Flat', fee: 50, isActive: true, freeDeliveryAbove: 600 },
          { code: '10500', district: 'Bang Rak', districtTh: 'บางรัก', areas: 'Silom, Surawong, Si Phraya, Charoen Krung (North), Samyan, Mahanakhon', fee: 50, isActive: true, freeDeliveryAbove: 600 },
          { code: '10510', district: 'Khlong Sam Wa / Min Buri', districtTh: 'คลองสามวา / มีนบุรี', areas: 'Min Buri, Sam Wa East/West, Suwinthawong, Nimit Mai, Hatairath, Safari World', fee: 90, isActive: true, freeDeliveryAbove: 800 },
          { code: '10520', district: 'Lat Krabang', districtTh: 'ลาดกระบัง', areas: 'Suvarnabhumi Airport Area, KMITL, Chalong Krung, Rom Klao, King Kaew Junction', fee: 90, isActive: true, freeDeliveryAbove: 800 },
          { code: '10530', district: 'Nong Chok', districtTh: 'หนองจอก', areas: 'Nong Chok, Lam Phak Chi, Khu Khwang, Eastern Bangkok Green Zone', fee: 90, isActive: true, freeDeliveryAbove: 800 },
          { code: '10600', district: 'Bang Phlat / Bangkok Noi / Bangkok Yai / Khlong San / Thon Buri', districtTh: 'บางพลัด / บางกอกน้อย / บางกอกใหญ่ / คลองสาน / ธนบุรี', areas: 'Wongwian Yai, Khlong San, Charan Sanitwong, Siriraj Hospital, Pin Klao, Itsaraphap', fee: 60, isActive: true, freeDeliveryAbove: 600 },
          { code: '10700', district: 'Bangkok Noi / Bang Phlat', districtTh: 'บางกอกน้อย / บางพลัด', areas: 'Arun Amarin, Bang Khun Non, Phran Nok, Rama 8 Bridge, Bang Bamru', fee: 60, isActive: true, freeDeliveryAbove: 600 },
          { code: '10800', district: 'Bang Sue', districtTh: 'บางซื่อ', areas: 'Bang Sue Grand Station, Tao Poon, Pracha Chuen, Wongsawang, Rama 7 Bridge', fee: 60, isActive: true, freeDeliveryAbove: 600 },
          { code: '10900', district: 'Chatuchak', districtTh: 'จตุจักร', areas: 'Mo Chit, Chatuchak Weekend Market, Lat Phrao Intersection, Kasetsart University, Ratchayothin, Sena', fee: 60, isActive: true, freeDeliveryAbove: 600 }
        ];
        needsSettingsUpdate = true;
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
app.get('/api/orders', async (req, res) => {
  try {
    const result = await query('SELECT * FROM orders ORDER BY created_at DESC');
    res.json(result.rows.map(mapOrder));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/orders/:id', async (req, res) => {
  try {
    const result = await query('SELECT * FROM orders WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json(mapOrder(result.rows[0]));
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
      now,
      o.postalCode || '10110',
      Number(o.deliveryFee) || 0,
      o.quantity !== undefined && o.quantity !== null ? Number(o.quantity) : (Number(o.actualWeightKg) || Number(o.estimatedWeightKg) || 1),
      o.unit || 'KG',
      o.categoryId || 'laundry_by_weight',
      JSON.stringify(o.items || [])
    ]);

    res.status(201).json(mapOrder(result.rows[0]));
  } catch (err) {
    console.error('Error inserting order:', err);
    res.status(500).json({ error: err.message });
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

    const existingRes = await query('SELECT * FROM orders WHERE id = $1', [id]);
    if (existingRes.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const currentOrder = existingRes.rows[0];
    const now = new Date();
    const timestampStr = now.toISOString().replace('T', ' ').substring(0, 16);

    const sUpdates = serviceUpdates || {};
    const targetStatus = newStatus || status || currentOrder.status;
    const targetServiceId = serviceId || sUpdates.serviceId || currentOrder.service_id;
    const targetServiceName = serviceName || sUpdates.serviceName || currentOrder.service_name;
    const targetTurnaround = turnaroundSpeed || sUpdates.turnaroundSpeed || currentOrder.turnaround_speed;
    const targetPricePerKg = (pricePerKg !== undefined && pricePerKg !== null) ? Number(pricePerKg) : (sUpdates.pricePerKg !== undefined ? Number(sUpdates.pricePerKg) : Number(currentOrder.price_per_kg));
    const targetMinWeight = (minWeightAppliedKg !== undefined && minWeightAppliedKg !== null) ? Number(minWeightAppliedKg) : (sUpdates.minWeightAppliedKg !== undefined ? Number(sUpdates.minWeightAppliedKg) : Number(currentOrder.min_weight_applied_kg || 4.0));
    const targetQuantity = (req.body.quantity !== undefined && req.body.quantity !== null) ? Number(req.body.quantity) : currentOrder.quantity;
    const targetUnit = req.body.unit || sUpdates.unit || currentOrder.unit || 'KG';
    const targetCategoryId = req.body.categoryId || sUpdates.categoryId || currentOrder.category_id || 'laundry_by_weight';

    let updatedActualKg = currentOrder.actual_weight_kg;
    if (actualWeightKg !== undefined && actualWeightKg !== null && actualWeightKg !== '') {
      updatedActualKg = Number(actualWeightKg);
    } else if (sUpdates.actualWeightKg !== undefined && sUpdates.actualWeightKg !== null && sUpdates.actualWeightKg !== '') {
      updatedActualKg = Number(sUpdates.actualWeightKg);
    }

    const effectiveKg = updatedActualKg !== null ? updatedActualKg : Number(currentOrder.estimated_weight_kg || 4.0);
    const billableKg = Math.max(effectiveKg, targetMinWeight);
    const calculatedTotal = targetUnit === 'piece' 
      ? Math.round((Number(targetQuantity) || 1) * targetPricePerKg)
      : Math.round(billableKg * targetPricePerKg);
    const finalTotalPrice = (totalPrice !== undefined && totalPrice !== null) ? Number(totalPrice) : (sUpdates.totalPrice !== undefined ? Number(sUpdates.totalPrice) : calculatedTotal);

    const updatedTagNumber = (tagNumber && tagNumber.trim()) ? tagNumber.trim() : ((sUpdates.tagNumber && sUpdates.tagNumber.trim()) ? sUpdates.tagNumber.trim() : currentOrder.tag_number);
    const targetDeliveryDate = deliveryDate || sUpdates.deliveryDate || currentOrder.delivery_date;
    const targetDeliveryTime = deliveryTime || sUpdates.deliveryTime || currentOrder.delivery_time;

    const currentTimeline = Array.isArray(currentOrder.timeline) ? currentOrder.timeline : [];
    const newTimelineEvent = {
      status: targetStatus,
      timestamp: timestampStr,
      note: note || (`Order updated to ${targetStatus.replace(/_/g, ' ')}.`)
    };
    const updatedTimeline = [...currentTimeline, newTimelineEvent];

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

    res.json(mapOrder(result.rows[0]));
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

    const existingRes = await query('SELECT * FROM orders WHERE id = $1', [id]);
    if (existingRes.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const currentOrder = existingRes.rows[0];
    const now = new Date();
    const timestampStr = now.toISOString().replace('T', ' ').substring(0, 16);
    const ref = paymentRef || transactionRef || ('TXN-' + Math.floor(100000 + Math.random() * 900000));

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