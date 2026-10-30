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
    description: 'Everyday casual wear washed with premium detergent and neatly folded.',
    descriptionTh: 'ซัก อบ พับ เสื้อผ้าทั่วไป ชุดลำลอง เสื้อยืด กางเกงออกกำลังกาย ถุงเท้า และผ้าขนหนู ซักด้วยน้ำยาเกรดพรีเมียม อบแห้ง และพับแยกประเภทอย่างเป็นระเบียบ',
    unit: 'KG',
    pricingType: 'weight',
    pricePerKg: 70,
    standardPricePerKg: 70,
    nextDayPricePerKg: 100,
    sameDayPricePerKg: 200,
    sameDayAvailable: true,
    minWeightKg: 5.0,
    turnaroundHours: 24,
    popular: true,
    features: [
      'Eco-friendly detergent',
      'Gentle tumble drying',
      'Neat compact folding',
      'Moisture-proof dust bags'
    ],
    featuresTh: [
      'น้ำยาซักผ้าและปรับผ้านุ่มสูตรรักษ์โลก',
      'อบแห้งด้วยอุณหภูมิที่เหมาะสมถนอมใยผ้า',
      'พับแยกประเภทเสื้อผ้าอย่างเป็นระเบียบ',
      'บรรจุในถุงกันฝุ่นและกันความชื้นอย่างดี'
    ]
  },
  {
    id: 'wash_iron_fold',
    categoryId: 'laundry_by_weight',
    name: 'Wash / Iron / Fold',
    nameTh: 'ซัก อบ รีด พับ',
    description: 'Crisp steam ironing and folded packaging.',
    descriptionTh: 'เหมาะสำหรับชุดทำงาน เสื้อเชิ้ตผ้าฝ้าย กางเกงชิโน่ และชุดเดรส ที่ต้องการการรีดไอน้ำให้เรียบคมและพับบรรจุอย่างประณีต',
    unit: 'KG',
    pricingType: 'weight',
    pricePerKg: 130,
    standardPricePerKg: 130,
    nextDayPricePerKg: 150,
    sameDayPricePerKg: 300,
    sameDayAvailable: true,
    minWeightKg: 5.0,
    turnaroundHours: 36,
    popular: false,
    features: [
      'Stain pre-treatment',
      'Fabric conditioning',
      'Steam ironing',
      'Clear protective packaging'
    ],
    featuresTh: [
      'ตรวจเช็คและขจัดคราบเฉพาะจุดก่อนซัก',
      'ซักและบำรุงเนื้อผ้าด้วยผลิตภัณฑ์เกรดพรีเมียม',
      'รีดไอน้ำด้วยมือให้เรียบคมทุกตัว',
      'บรรจุในถุงใสกันฝุ่นพร้อมจัดส่ง'
    ]
  },
  {
    id: 'wash_iron_hang',
    categoryId: 'laundry_by_weight',
    name: 'Wash / Iron / Hang',
    nameTh: 'ซัก อบ รีด แขวน',
    description: 'Perfect for business suits, formal button-downs, evening dresses, and delicate linen blouses returned wrinkle-free on high-grade hangers.',
    descriptionTh: 'เหมาะสำหรับชุดสูท เสื้อเชิ้ตทางการ ชุดราตรี และเสื้อผ้าลินินเนื้อบาง ส่งคืนไร้รอยยับพร้อมไม้แขวนคุณภาพสูงและถุงคลุมกันฝุ่น',
    unit: 'KG',
    pricingType: 'weight',
    pricePerKg: 150,
    standardPricePerKg: 150,
    nextDayPricePerKg: 170,
    sameDayPricePerKg: 340,
    sameDayAvailable: true,
    minWeightKg: 5.0,
    turnaroundHours: 48,
    popular: false,
    features: [
      'Delicate temperature-controlled wash',
      'Hand steam pressing',
      'Heavy-duty hangers included',
      'Breathable garment cover'
    ],
    featuresTh: [
      'ซักด้วยระบบควบคุมอุณหภูมิถนอมผ้าพิเศษ',
      'รีดไอน้ำอย่างละเอียดไร้รอยยับทุกจุด',
      'ฟรีไม้แขวนเสื้อคุณภาพสูงแข็งแรงพิเศษ',
      'ถุงคลุมเสื้อผ้าแบบยาวระบายอากาศได้ดี'
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
