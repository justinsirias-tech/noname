// Services and Initial Configuration for NoName Laundry Bangkok

export const BANGKOK_DISTRICTS = [
  "Watthana",
  "Khlong Toei",
  "Bang Rak",
  "Sathon",
  "Pathum Wan",
  "Phaya Thai",
  "Huai Khwang",
  "Chatuchak",
  "Din Daeng",
  "Yan Nawa",
  "Phra Nakhon",
  "Dusit",
  "Samphanthawong",
  "Pom Prap Sattru Phai",
  "Bang Kho Laem",
  "Bang Sue",
  "Phra Khanong",
  "Bang Na",
  "Suan Luang",
  "Ratchathewi",
  "Thon Buri",
  "Bangkok Yai",
  "Khlong San",
  "Bangkok Noi",
  "Bang Phlat",
  "Bang Kapi",
  "Wang Thonglang",
  "Lat Phrao",
  "Bueng Kum",
  "Saphan Sung",
  "Prawet",
  "Chom Thong",
  "Phasi Charoen",
  "Rat Burana",
  "Thung Khru",
  "Bang Khen",
  "Sai Mai",
  "Don Mueang",
  "Lak Si",
  "Khan Na Yao",
  "Taling Chan",
  "Thawi Watthana",
  "Bang Khae",
  "Nong Khaem",
  "Bang Bon",
  "Bang Khun Thian",
  "Min Buri",
  "Khlong Sam Wa",
  "Lat Krabang",
  "Nong Chok"
];

export const TIME_SLOTS = [
  '10:30 - 12:30 (Morning)',
  '12:30 - 14:30 (Midday)',
  '14:30 - 16:30 (Afternoon)',
  '16:30 - 18:30 (Early Evening)',
  '18:30 - 20:30 (Evening Rush)'
];

export const INITIAL_CATEGORIES = [
  {
    id: 'laundry_by_weight',
    name: 'Laundry by Weight (KG)',
    nameTh: 'ซัก อบ รีด ตามน้ำหนัก (กิโลกรัม)',
    icon: 'scale',
    badge: '🧺 By Weight (KG)',
    pricingType: 'weight',
    description: 'Everyday casual clothes, gym wear, shirts, socks, and garments billed transparently by digital certified scale weight.',
    descriptionTh: 'เสื้อผ้าทั่วไป ชุดลำลอง เสื้อยืด กางเกง ถุงเท้า คิดราคาโปร่งใสตามน้ำหนักจริงบนตาชั่งดิจิทัล',
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
    descriptionTh: 'ผ้าปูที่นอน ปลอกผ้านวม ผ้านวม ปลอกหมอน และผ้าห่มหนา ซักด้วยเครื่องซักผ้าขนาดใหญ่มาตรฐานสากล พร้อมอบฆ่าเชื้อ',
    displayOrder: 2
  }
];

export const INITIAL_SERVICES = [
  {
    id: 'wash_fold',
    categoryId: 'laundry_by_weight',
    name: 'Wash / Fold',
    nameTh: 'ซัก อบ พับ',
    description: 'Everyday casual wear, t-shirts, gym shorts, socks, towels, and clothing washed with premium detergent, tumble dried, and neatly folded.',
    descriptionTh: 'เสื้อผ้าทั่วไป เสื้อยืด ชุดออกกำลังกาย กางเกงขาสั้น ถุงเท้า ผ้าเช็ดตัว ซักด้วยน้ำยาคุณภาพ อบแห้ง และพับจัดระเบียบอย่างประณีต',
    unit: 'KG',
    pricingType: 'weight',
    pricePerKg: 70,
    standardPricePerKg: 70,
    nextDayPricePerKg: 129,
    sameDayPricePerKg: 259,
    sameDayAvailable: true,
    minWeightKg: 4.0,
    turnaroundHours: 48,
    popular: true,
    features: [
      'Eco-friendly detergent & fabric softener',
      'Gentle tumble drying',
      'Neat, compact folding by apparel type',
      'Sealed in moisture-proof dust bags',
      'Pickup & delivery across Bangkok'
    ],
    featuresTh: [
      'น้ำยาซักผ้าและปรับผ้านุ่มสูตรอ่อนโยน',
      'อบผ้าด้วยอุณหภูมิที่ถนอมเนื้อผ้า',
      'พับแยกตามประเภทชุดอย่างเรียบร้อย',
      'บรรจุในถุงกันฝุ่นและกันความชื้น',
      'บริการรับ-ส่งตรงถึงคอนโดและที่พัก'
    ]
  },
  {
    id: 'wash_iron_fold',
    categoryId: 'laundry_by_weight',
    name: 'Wash / Iron / Fold',
    nameTh: 'ซัก อบ รีด พับ',
    description: 'Ideal for workwear, cotton shirts, chinos, and dresses that require crisp steam ironing and tidy folded packaging.',
    descriptionTh: 'เหมาะสำหรับชุดทำงาน เสื้อเชิ้ต กางเกงสแล็ค และเดรส ที่ต้องการการรีดไอน้ำเรียบกริบ พร้อมพับจัดเก็บอย่างเรียบร้อย',
    unit: 'KG',
    pricingType: 'weight',
    pricePerKg: 95,
    standardPricePerKg: 95,
    nextDayPricePerKg: 130,
    sameDayPricePerKg: 175,
    sameDayAvailable: true,
    minWeightKg: 4.0,
    turnaroundHours: 48,
    popular: false,
    features: [
      'Stain inspection pre-treatment',
      'Premium fabric wash & conditioning',
      'Hand steam ironing for crisp look',
      'Expert folding with tissue inserts if needed',
      'Clear protective garment packaging'
    ],
    featuresTh: [
      'ตรวจสอบและป้ายขจัดคราบก่อนซัก',
      'ซักและปรับสภาพเส้นใยผ้าเกรดพรีเมียม',
      'รีดไอน้ำด้วยมือเพื่อความเรียบเนียน',
      'พับอย่างประณีตพร้อมกระดาษรองทรง',
      'บรรจุในซองป้องกันฝุ่นอย่างดี'
    ]
  },
  {
    id: 'wash_iron_hang',
    categoryId: 'laundry_by_weight',
    name: 'Wash / Iron / Hang',
    nameTh: 'ซัก อบ รีด แขวน',
    description: 'Perfect for business suits, formal button-downs, evening dresses, and delicate linen blouses returned wrinkle-free on high-grade hangers.',
    descriptionTh: 'เหมาะสำหรับเสื้อเชิ้ตทางการ ชุดสูท เดรสออกงาน และเสื้อผ้าลินิน คืนผ้าเรียบไร้รอยยับพร้อมไม้แขวนคุณภาพสูง',
    unit: 'KG',
    pricingType: 'weight',
    pricePerKg: 120,
    standardPricePerKg: 120,
    nextDayPricePerKg: 160,
    sameDayPricePerKg: 210,
    sameDayAvailable: true,
    minWeightKg: 4.0,
    turnaroundHours: 48,
    popular: false,
    features: [
      'Delicate temperature-controlled wash',
      'Detailed wrinkle-free steam pressing',
      'Heavy-duty hangers included at no extra cost',
      'Full-length breathable garment cover',
      'Direct-to-wardrobe ready on delivery'
    ],
    featuresTh: [
      'ซักด้วยระบบควบคุมอุณหภูมิถนอมเนื้อผ้า',
      'รีดไอน้ำละเอียดระดับมืออาชีพ ไร้รอยยับ',
      'พร้อมไม้แขวนเสื้อคุณภาพดีฟรี',
      'คลุมด้วยถุงคลุมเสื้อผ้าแบบระบายอากาศ',
      'ส่งถึงที่พร้อมแขวนเข้าตู้เสื้อผ้าทันที'
    ]
  },
  {
    id: 'comforter_duvet',
    categoryId: 'bedding_linens',
    name: 'Duvet / Comforter / Blanket',
    nameTh: 'ผ้านวม / ไส้ผ้านวม / ผ้าห่มหนา',
    description: 'Bulky King/Queen comforters and thick winter blankets washed in high-capacity drums with anti-dust mite heat sanitization and fluffy loft restoration.',
    descriptionTh: 'ผ้านวมขนาด King/Queen และผ้าห่มหนา ซักด้วยเครื่องซักผ้าขนาดใหญ่ ฆ่าเชื้อไรฝุ่นด้วยความร้อน พร้อมอบฟูนุ่ม',
    unit: 'piece',
    pricingType: 'piece',
    pricePerKg: 220,
    standardPricePerKg: 220,
    nextDayPricePerKg: 280,
    sameDayPricePerKg: 350,
    sameDayAvailable: true,
    minWeightKg: 1.0,
    turnaroundHours: 48,
    popular: true,
    features: [
      'High-capacity commercial drum washer',
      'Anti-dust mite thermal sanitization',
      'Gentle tumble dry for loft restoration',
      'Breathable zipper storage bag included'
    ],
    featuresTh: [
      'ซักด้วยเครื่องซักความจุสูงมาตรฐานสากล',
      'ฆ่าเชื้อและกำจัดไรฝุ่นด้วยความร้อน',
      'อบแห้งถนอมเนื้อผ้า คืนความฟู นุ่มนวล',
      'บรรจุในถุงซิปอย่างดี สะอาดหมดจด'
    ]
  },
  {
    id: 'bedsheet_set',
    categoryId: 'bedding_linens',
    name: 'Bed Sheet / Fitted Sheet',
    nameTh: 'ผ้าปูที่นอน (King / Queen / Single)',
    description: 'Deep-cleaned bed sheets with fabric softening conditioner and hotel-grade flatwork steam ironing for an ultra-smooth bedtime feel.',
    descriptionTh: 'ทำความสะอาดล้ำลึกสำหรับผ้าปูที่นอน พร้อมน้ำยาปรับผ้านุ่ม และรีดไอน้ำแบบเรียบเนียนมาตรฐานโรงแรม',
    unit: 'piece',
    pricingType: 'piece',
    pricePerKg: 80,
    standardPricePerKg: 80,
    nextDayPricePerKg: 110,
    sameDayPricePerKg: 150,
    sameDayAvailable: true,
    minWeightKg: 1.0,
    turnaroundHours: 48,
    popular: true,
    features: [
      'Deep dirt and sweat extraction',
      'Gentle fabric conditioning for silky touch',
      'Steam ironed for smooth hotel-finish crispness',
      'Individual moisture-proof protective packaging'
    ],
    featuresTh: [
      'ขจัดคราบเหงื่อไคลและสิ่งสกปรกฝังลึก',
      'ปรับผ้านุ่มเพื่อสัมผัสที่นุ่มสบายผิว',
      'รีดเรียบมาตรฐานโรงแรมระดับห้าดาว',
      'บรรจุในถุงป้องกันความชื้นเฉพาะชิ้น'
    ]
  },
  {
    id: 'duvet_cover',
    categoryId: 'bedding_linens',
    name: 'Duvet Cover',
    nameTh: 'ปลอกผ้านวม',
    description: 'Premium washing and professional steam ironing for duvet covers of all fabric blends and thread counts.',
    descriptionTh: 'ซักทำความสะอาดและรีดไอน้ำระดับมืออาชีพสำหรับปลอกผ้านวมทุกเนื้อผ้า',
    unit: 'piece',
    pricingType: 'piece',
    pricePerKg: 90,
    standardPricePerKg: 90,
    nextDayPricePerKg: 120,
    sameDayPricePerKg: 160,
    sameDayAvailable: true,
    minWeightKg: 1.0,
    turnaroundHours: 48,
    popular: false,
    features: [
      'Color-safe fabric brightening detergent',
      'Anti-static soft finish',
      'Crisp steam pressing',
      'Tidy compact folding'
    ],
    featuresTh: [
      'น้ำยาถนอมสีผ้าให้สดใส',
      'ป้องกันไฟฟ้าสถิต ผิวสัมผัสนุ่ม',
      'รีดไอน้ำเรียบเนียน',
      'พับเก็บกะทัดรัด สะดวกต่อการใช้งาน'
    ]
  },
  {
    id: 'pillowcase',
    categoryId: 'bedding_linens',
    name: 'Pillowcase / Bolstercase',
    nameTh: 'ปลอกหมอน / ปลอกหมอนข้าง',
    description: 'Sanitized hot wash treatment to remove facial oils and allergens, finished with steam pressing.',
    descriptionTh: 'ซักฆ่าเชื้อด้วยความร้อนเพื่อขจัดความมันบนใบหน้าและสารก่อภูมิแพ้ พร้อมรีดเรียบ',
    unit: 'piece',
    pricingType: 'piece',
    pricePerKg: 30,
    standardPricePerKg: 30,
    nextDayPricePerKg: 45,
    sameDayPricePerKg: 60,
    sameDayAvailable: true,
    minWeightKg: 1.0,
    turnaroundHours: 48,
    popular: false,
    features: [
      'Hypoallergenic sanitizing cycle',
      'Gentle skin-friendly conditioner',
      'Hand-finished steam ironed'
    ],
    featuresTh: [
      'โปรแกรมซักฆ่าเชื้อลดสารก่อภูมิแพ้',
      'ปรับผ้านุ่มสูตรอ่อนโยน ไม่ระคายเคืองผิว',
      'รีดไอน้ำด้วยมือเรียบร้อย'
    ]
  },
  {
    id: 'mattress_topper',
    categoryId: 'bedding_linens',
    name: 'Mattress Protector / Topper',
    nameTh: 'ผ้ารองกันเปื้อนที่นอน / ท็อปเปอร์',
    description: 'Deep stain extraction and sanitized drying for quilted mattress protectors, toppers, and waterproof pads.',
    descriptionTh: 'ขจัดคราบฝังลึกและอบฆ่าเชื้อสำหรับผ้ารองกันเปื้อน ท็อปเปอร์ และแผ่นรองกันน้ำ',
    unit: 'piece',
    pricingType: 'piece',
    pricePerKg: 180,
    standardPricePerKg: 180,
    nextDayPricePerKg: 240,
    sameDayPricePerKg: 320,
    sameDayAvailable: true,
    minWeightKg: 1.0,
    turnaroundHours: 48,
    popular: false,
    features: [
      'Deep stain lifting pre-treatment',
      'Multi-layer moisture extraction',
      'Low-heat protective drying'
    ],
    featuresTh: [
      'ขจัดคราบเฉพาะจุดก่อนเข้าเครื่องซัก',
      'ปั่นดึงความชื้นหลายชั้นอย่างหมดจด',
      'อบแห้งด้วยความร้อนพอเหมาะถนอมแผ่นใย'
    ]
  }
];

export const TRACKING_STAGES = [
  { key: 'tba', label: '1. TBA (Confirm Details)', step: 1, color: 'bg-purple-100 text-purple-800 border-purple-300', dotColor: 'bg-purple-500', desc: 'Confirming order details with customer' },
  { key: 'scheduled', label: '2. Scheduled', step: 2, color: 'bg-sky-100 text-sky-800 border-sky-300', dotColor: 'bg-sky-500', desc: 'Pickup scheduled with rider' },
  { key: 'billing', label: '3. Billing', step: 3, color: 'bg-blue-100 text-blue-800 border-blue-300', dotColor: 'bg-blue-500', desc: 'Weight verified & invoice issued' },
  { key: 'in_process', label: '4. In Process', step: 4, color: 'bg-amber-100 text-amber-800 border-amber-300', dotColor: 'bg-amber-500', desc: 'Laundry care, wash & press in progress' },
  { key: 'ready_for_delivery', label: '5. Ready For Delivery', step: 5, color: 'bg-indigo-100 text-indigo-800 border-indigo-300', dotColor: 'bg-indigo-500', desc: 'Packed clean laundry & rider assigned' },
  { key: 'delivered', label: '6. Delivered', step: 6, color: 'bg-emerald-100 text-emerald-800 border-emerald-300', dotColor: 'bg-emerald-500', desc: 'Clean laundry delivered safely' }
];

export function getTrackingStage(status) {
  const s = String(status || '').toLowerCase().trim();
  if (s === 'delivered' || s === 'completed') {
    return TRACKING_STAGES[5];
  }
  if (s === 'ready_for_delivery' || s === 'ready for delivery' || s === 'out_for_delivery') {
    return TRACKING_STAGES[4];
  }
  if (s === 'in_process' || s === 'in process' || s === 'processing' || s === 'in_wash' || s === 'iron_fold') {
    return TRACKING_STAGES[3];
  }
  if (s === 'billing' || s === 'billing_pending' || s === 'awaiting_payment' || s === 'weighed_inspected') {
    return TRACKING_STAGES[2];
  }
  if (s === 'scheduled' || s === 'pickup_scheduled' || s === 'picked_up') {
    return TRACKING_STAGES[1];
  }
  return TRACKING_STAGES[0];
}

export const ORDER_STATUSES = {
  TBA: { label: '1. TBA (Confirm Details)', color: 'bg-purple-100 text-purple-800 border-purple-300', step: 1 },
  SCHEDULED: { label: '2. Scheduled', color: 'bg-sky-100 text-sky-800 border-sky-300', step: 2 },
  BILLING: { label: '3. Billing', color: 'bg-blue-100 text-blue-800 border-blue-300', step: 3 },
  IN_PROCESS: { label: '4. In Process', color: 'bg-amber-100 text-amber-800 border-amber-300', step: 4 },
  READY_FOR_DELIVERY: { label: '5. Ready For Delivery', color: 'bg-indigo-100 text-indigo-800 border-indigo-300', step: 5 },
  DELIVERED: { label: '6. Delivered', color: 'bg-emerald-100 text-emerald-800 border-emerald-300', step: 6 },
  CANCELLED: { label: 'Cancelled', color: 'bg-red-100 text-red-800 border-red-300', step: 0 },
  // Backward compatibility mappings
  BOOKING_REQUESTED: { label: '1. TBA (Confirm Details)', color: 'bg-purple-100 text-purple-800 border-purple-300', step: 1 },
  PENDING: { label: '1. TBA (Confirm Details)', color: 'bg-purple-100 text-purple-800 border-purple-300', step: 1 },
  PENDING_CONFIRMATION: { label: '1. TBA (Confirm Details)', color: 'bg-purple-100 text-purple-800 border-purple-300', step: 1 },
  PICKUP_SCHEDULED: { label: '2. Scheduled', color: 'bg-sky-100 text-sky-800 border-sky-300', step: 2 },
  PICKED_UP: { label: '2. Scheduled', color: 'bg-sky-100 text-sky-800 border-sky-300', step: 2 },
  BILLING_PENDING: { label: '3. Billing', color: 'bg-blue-100 text-blue-800 border-blue-300', step: 3 },
  AWAITING_PAYMENT: { label: '3. Billing', color: 'bg-blue-100 text-blue-800 border-blue-300', step: 3 },
  WEIGHED_INSPECTED: { label: '3. Billing', color: 'bg-blue-100 text-blue-800 border-blue-300', step: 3 },
  IN_WASH: { label: '4. In Process', color: 'bg-amber-100 text-amber-800 border-amber-300', step: 4 },
  IRON_FOLD: { label: '4. In Process', color: 'bg-amber-100 text-amber-800 border-amber-300', step: 4 },
  PROCESSING: { label: '4. In Process', color: 'bg-amber-100 text-amber-800 border-amber-300', step: 4 },
  OUT_FOR_DELIVERY: { label: '5. Ready For Delivery', color: 'bg-indigo-100 text-indigo-800 border-indigo-300', step: 5 },
  COMPLETED: { label: '6. Delivered', color: 'bg-emerald-100 text-emerald-800 border-emerald-300', step: 6 }
};

export const AVAILABLE_DELIVERY_RIDERS = [
  'Sompong Jaidee (Bangkok Express Rider)',
  'Somchai (Rider #1 - Sukhumvit / Watthana)',
  'Lek (Rider #2 - Silom / Sathon)',
  'GrabExpress On-Demand Rider',
  'Lalamove Express Delivery'
];

export const INITIAL_ORDERS = [];

export const INITIAL_INCIDENTS = [];

export const INCIDENT_CATEGORIES = [
  { id: 'stain_treatment', label: 'Stain / Soil Spot Treatment', icon: 'sparkles', badgeColor: 'bg-purple-100 text-purple-800 border-purple-200' },
  { id: 'garment_damage', label: 'Garment Damage / Torn / Missing Button', icon: 'alertCircle', badgeColor: 'bg-rose-100 text-rose-800 border-rose-200' },
  { id: 'delivery_schedule', label: 'Delivery Timing / Condo Drop-off', icon: 'truck', badgeColor: 'bg-blue-100 text-blue-800 border-blue-200' },
  { id: 'weight_billing', label: 'Scale Weight / Pricing Inquiry', icon: 'scale', badgeColor: 'bg-amber-100 text-amber-800 border-amber-200' },
  { id: 'special_care', label: 'Special Laundry / Ironing Request', icon: 'checkCircle', badgeColor: 'bg-teal-100 text-teal-800 border-teal-200' },
  { id: 'general_inquiry', label: 'General Inquiry / Other', icon: 'helpCircle', badgeColor: 'bg-slate-100 text-slate-800 border-slate-200' }
];

export const INCIDENT_SEVERITIES = {
  normal: { label: 'Normal Priority', color: 'bg-sky-100 text-sky-800 border-sky-200' },
  urgent: { label: 'Urgent (In-Progress)', color: 'bg-amber-100 text-amber-800 border-amber-200' },
  critical: { label: 'Critical (Damaged / Missing)', color: 'bg-rose-100 text-rose-800 border-rose-200' }
};

export const GENDER_OPTIONS = ['Male', 'Female', 'Rather not say'];

export const CUSTOMER_TIERS = {
  VIP: { label: 'VIP Customer', color: 'bg-purple-100 text-purple-800 border-purple-200' },
  Regular: { label: 'Regular Member', color: 'bg-sky-100 text-sky-800 border-sky-200' },
  New: { label: 'New Customer', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  Corporate: { label: 'Corporate Account', color: 'bg-amber-100 text-amber-800 border-amber-200' }
};

export const INITIAL_CUSTOMERS = [];
