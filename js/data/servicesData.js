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

export const INITIAL_ORDERS = [
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
    estimatedWeightKg: 4.0,
    actualWeightKg: 4.0,
    minWeightAppliedKg: 4.0,
    pricePerKg: 70,
    totalPrice: 280,
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
  },
  {
    id: 'NNL-7741-BK',
    customerName: 'Marcus Dupont',
    contactChannel: 'email',
    contactValue: 'm.dupont@bangkokexpats.org',
    email: 'm.dupont@bangkokexpats.org',
    serviceId: 'wash_iron_hang',
    serviceName: 'Wash / Iron / Hang',
    district: 'Sathon (Sathorn, Chong Nonsi)',
    condoName: 'The Sukhothai Residences',
    roomNumber: 'Penthouse B, 31st Fl',
    leaveWithJuristic: true,
    estimatedWeightKg: 5.0,
    actualWeightKg: 5.4,
    minWeightAppliedKg: 4.0,
    pricePerKg: 120,
    totalPrice: 648,
    status: 'DELIVERED',
    tagNumber: 'TAG-BKK-067',
    pickupDate: '2026-09-14',
    pickupTime: '11:00 - 13:00 (Midday)',
    deliveryDate: '2026-09-16',
    deliveryTime: '11:00 - 13:00 (Midday)',
    specialInstructions: 'Return on wooden hangers in garment bag. Leave at concierge desk.',
    createdAt: '2026-09-14T09:00:00Z',
    timeline: [
      { status: 'BOOKING_REQUESTED', timestamp: '2026-09-14 09:00', note: 'Online booking submitted.' },
      { status: 'PICKED_UP', timestamp: '2026-09-14 11:30', note: 'Collected from concierge desk.' },
      { status: 'WEIGHED_INSPECTED', timestamp: '2026-09-14 13:10', note: 'Scale weight: 5.40 KG.' },
      { status: 'IN_WASH', timestamp: '2026-09-14 15:00', note: 'Delicate wash completed.' },
      { status: 'IRON_FOLD', timestamp: '2026-09-15 10:00', note: 'Hand steam pressed & hung.' },
      { status: 'DELIVERED', timestamp: '2026-09-16 11:45', note: 'Successfully delivered to concierge desk.' }
    ]
  }
];

export const INITIAL_INCIDENTS = [
  {
    id: 'INC-101',
    orderId: 'NNL-8491-BK',
    customerName: 'Alex Thorne',
    channel: 'whatsapp',
    contact: '+66 82 455 9182',
    category: 'Special Laundry Request',
    severity: 'normal',
    affectedItem: 'Blue button-down shirt',
    imageUrl: null,
    subject: 'Special instruction: Extra starch on blue shirt',
    message: 'Hi NoName team, could you ensure light starch on the blue button-down shirt included in the bag? Thanks!',
    status: 'resolved',
    createdAt: '2026-09-16T09:50:00Z',
    response: 'Noted with thanks! Our finishing team has applied light starch to your blue shirt.'
  }
];

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

export const INITIAL_CUSTOMERS = [
  {
    id: 'CUST-8491',
    firstName: 'Alex',
    lastName: 'Thorne',
    fullName: 'Alex Thorne',
    nickName: 'Alex',
    gender: 'Male',
    dateOfBirth: '1990-05-14',
    mobileNumber: '+66 82 455 9182',
    isWhatsApp: false,
    secondaryMobile: '+1 (415) 890-1234',
    isSecondaryWhatsApp: true,
    email: 'alex.thorne@gmail.com',
    lineId: 'alex_bkk',
    pinCode: '123456',
    isVerified: true,
    verifiedVia: 'whatsapp',
    companyTax: {
      required: true,
      companyName: 'Thorne Design & Living (Thailand) Co., Ltd.',
      taxId: '0105562019284',
      branch: 'Head Office (สำนักงานใหญ่)',
      companyAddress: '8 Sukhumvit 26, Khlong Tan, Khlong Toei, Bangkok 10110'
    },
    addresses: [
      {
        id: 'ADDR-101',
        label: 'Home (The Estelle)',
        address: 'The Estelle Phrom Phong, 8 Sukhumvit 26, Khlong Tan',
        district: 'Watthana (Thonglor, Ekkamai, Phrom Phong)',
        roomNumber: 'Tower A, Room 1804',
        googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=The+Estelle+Phrom+Phong+Sukhumvit+26+Bangkok',
        leaveWithJuristic: true,
        isPrimary: true
      },
      {
        id: 'ADDR-102',
        label: 'Design Studio / Office',
        address: 'Thorne Studio, EmQuartier Building Fl 12, Sukhumvit Rd',
        district: 'Watthana (Thonglor, Ekkamai, Phrom Phong)',
        roomNumber: 'Unit 1204',
        googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=EmQuartier+Building+Sukhumvit+Bangkok',
        leaveWithJuristic: false,
        isPrimary: false
      }
    ],
    tier: 'VIP',
    notes: 'Prefers eco-friendly detergent. Leave bag with Juristic office K. Somchai. Light starch on button-down shirts.',
    createdAt: '2026-08-10T10:00:00Z'
  },
  {
    id: 'CUST-3920',
    firstName: 'Siriporn',
    lastName: 'Tanaka',
    fullName: 'Siriporn Tanaka',
    nickName: 'Som',
    gender: 'Female',
    dateOfBirth: '1993-11-28',
    mobileNumber: '+66 89 712 3456',
    isWhatsApp: true,
    secondaryMobile: '+81 90 1234 5678',
    isSecondaryWhatsApp: false,
    email: 'siriporn.t@yahoo.co.th',
    lineId: '@siriporn_bkk',
    pinCode: '654321',
    isVerified: true,
    verifiedVia: 'sms',
    companyTax: {
      required: false,
      companyName: '',
      taxId: '',
      branch: '',
      companyAddress: ''
    },
    addresses: [
      {
        id: 'ADDR-201',
        label: 'Condo (Ashton Silom)',
        address: 'Ashton Silom, 162 Silom Rd, Suriya Wong, Bang Rak',
        district: 'Bang Rak (Silom, Surawong)',
        roomNumber: 'Floor 22, Room 2209',
        googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=Ashton+Silom+162+Silom+Rd+Bangkok',
        leaveWithJuristic: false,
        isPrimary: true
      }
    ],
    tier: 'Regular',
    notes: 'Please message via LINE before arriving. Ring room doorbell.',
    createdAt: '2026-08-22T14:30:00Z'
  },
  {
    id: 'CUST-7741',
    firstName: 'Marcus',
    lastName: 'Dupont',
    fullName: 'Marcus Dupont',
    nickName: 'Marc',
    gender: 'Male',
    dateOfBirth: '1985-03-02',
    mobileNumber: '+66 92 334 8812',
    isWhatsApp: false,
    secondaryMobile: '+33 6 12 34 56 78',
    isSecondaryWhatsApp: true,
    email: 'm.dupont@bangkokexpats.org',
    lineId: 'm_dupont_bkk',
    pinCode: '778899',
    isVerified: true,
    verifiedVia: 'email',
    companyTax: {
      required: true,
      companyName: 'Bangkok Expat Cultural Services Co., Ltd.',
      taxId: '0105559041289',
      branch: 'Head Office',
      companyAddress: 'Sathorn Road, Thung Maha Mek, Sathon, Bangkok 10120'
    },
    addresses: [
      {
        id: 'ADDR-301',
        label: 'Residence (The Sukhothai)',
        address: 'The Sukhothai Residences, 3 Sathon 1 Alley, Thung Maha Mek',
        district: 'Sathon (Sathorn, Chong Nonsi)',
        roomNumber: 'Penthouse B, 31st Fl',
        googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=The+Sukhothai+Residences+Sathon+Bangkok',
        leaveWithJuristic: true,
        isPrimary: true
      }
    ],
    tier: 'Regular',
    notes: 'Always return on high-grade wooden hangers in breathable garment bag. Concierge desk accepts drop-offs.',
    createdAt: '2026-07-15T09:15:00Z'
  },
  {
    id: 'CUST-5510',
    fullName: 'Chutima Wongsuwan',
    nickName: 'Nok',
    gender: 'Female',
    dateOfBirth: '1998-09-19',
    mobileNumber: '+66 81 223 9988',
    isWhatsApp: true,
    secondaryMobile: '',
    isSecondaryWhatsApp: false,
    email: 'chutima.nok@outlook.co.th',
    lineId: 'nok_wongsuwan',
    pinCode: '112233',
    isVerified: false,
    verifiedVia: null,
    companyTax: {
      required: false,
      companyName: '',
      taxId: '',
      branch: '',
      companyAddress: ''
    },
    addresses: [
      {
        id: 'ADDR-401',
        label: 'Home Condo',
        address: 'Rhythm Sathorn, 27 Sathon Nuea Rd, Silom',
        district: 'Bang Rak (Silom, Surawong)',
        roomNumber: 'Tower South, Room 1408',
        googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=Rhythm+Sathorn+Bangkok',
        leaveWithJuristic: true,
        isPrimary: true
      }
    ],
    tier: 'New',
    notes: 'Inquired via LINE OA about comforter and curtain dry cleaning.',
    createdAt: '2026-09-18T16:40:00Z'
  }
];
