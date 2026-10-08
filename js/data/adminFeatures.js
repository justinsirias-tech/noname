// Back-Office Feature Access & Permissions Definitions for NoName Laundry Bangkok

export const BACKOFFICE_FEATURES = [
  {
    id: 'orders',
    label: 'Order Processing & Tracking',
    labelTh: 'จัดการและติดตามคำสั่งซัก',
    category: 'Operations',
    categoryTh: 'งานปฏิบัติการ',
    icon: 'package',
    color: 'sky',
    description: 'Process active laundry orders, update statuses (Received, Washing, Drying, Out for Delivery, Delivered), scale weigh-in, and print receipts.',
    descriptionTh: 'จัดการออเดอร์งานซัก อัปเดตสถานะ (รับผ้า ชั่งน้ำหนัก ซัก อบ จัดส่ง ส่งสำเร็จ) และพิมพ์ใบเสร็จ'
  },
  {
    id: 'new-pos',
    label: 'Manual POS Order Intake',
    labelTh: 'สร้างออเดอร์หน้าร้าน (POS)',
    category: 'Operations',
    categoryTh: 'งานปฏิบัติการ',
    icon: 'send',
    color: 'teal',
    description: 'Direct walk-in front counter intake, rapid scale weighing, instant barcode tagging, and custom customer order creation.',
    descriptionTh: 'รับผ้าหน้าร้าน คีย์ออเดอร์ด่วน ชั่งน้ำหนัก พิมพ์แท็กบาร์โค้ด และออกบิลให้ลูกค้า'
  },
  {
    id: 'sales-reconciliation',
    label: 'Sales & Financial Reconciliation',
    labelTh: 'ยอดขายและการกระทบยอดเงิน',
    category: 'Finance',
    categoryTh: 'การเงินและบัญชี',
    icon: 'calculator',
    color: 'emerald',
    description: 'Track daily/monthly revenue, reconcile PromptPay and bank transfer slips, manage refund audits, and view cash drawer balances.',
    descriptionTh: 'ดูสรุปรายได้รายวัน/เดือน ตรวจสอบสลิปโอนเงินพร้อมเพย์ กระทบยอดบัญชี และตรวจสอบเงินสด'
  },
  {
    id: 'crm',
    label: 'Customer CRM & Member Profiles',
    labelTh: 'ระบบลูกค้าสัมพันธ์ (CRM)',
    category: 'Customer Care',
    categoryTh: 'การดูแลลูกค้า',
    icon: 'users',
    color: 'indigo',
    description: 'View customer directory, contact numbers, condo addresses, lifetime laundry spend, VIP loyalty tiers, and order history.',
    descriptionTh: 'ดูรายชื่อลูกค้า เบอร์ติดต่อ ที่อยู่คอนโด ยอดใช้จ่ายสะสม ระดับสมาชิก VIP และประวัติการซักผ้า'
  },
  {
    id: 'incidents',
    label: 'Online Support & Incident Tickets',
    labelTh: 'แจ้งปัญหาและงานบริการลูกค้า',
    category: 'Customer Care',
    categoryTh: 'การดูแลลูกค้า',
    icon: 'messageSquare',
    color: 'purple',
    description: 'Review customer claims, garment inspection photos, stain/damage reports, compensation decisions, and live chat queries.',
    descriptionTh: 'ตรวจสอบเคสแจ้งปัญหาจากลูกค้า ภาพถ่ายผ้าก่อน-หลังซัก รายงานผ้าเสียหาย และประสานงานเคลม'
  },
  {
    id: 'users',
    label: 'User & Role Management',
    labelTh: 'จัดการผู้ใช้และบทบาทสิทธิ์',
    category: 'Administration',
    categoryTh: 'การบริหารระบบ',
    icon: 'shield',
    color: 'rose',
    description: 'Create back-office staff accounts, design custom roles, customize per-user feature permissions, and manage password security.',
    descriptionTh: 'เพิ่มบัญชีพนักงาน ออกแบบบทบาทหน้าที่ (Roles) กำหนดสิทธิ์การเข้าถึงแต่ละฟังก์ชัน และตั้งรหัสผ่าน'
  },
  {
    id: 'services-pricing',
    label: 'Services & Pricing Menu Catalog',
    labelTh: 'เมนูบริการและอัตราค่าบริการ',
    category: 'Administration',
    categoryTh: 'การบริหารระบบ',
    icon: 'layers',
    color: 'blue',
    description: 'Edit wash & fold kg rates, dry cleaning piece prices, bedding items, minimum load weights, and express turnaround surcharges.',
    descriptionTh: 'ปรับราคาซักอบพับรายกิโลกรัม ซักแห้งรายชิ้น ผ้านวม กำหนดน้ำหนักขั้นต่ำ และค่าบริการด่วน'
  },
  {
    id: 'postal-rates',
    label: 'Delivery Zones & Postal Rates',
    labelTh: 'โซนจัดส่งและอัตราค่าส่ง',
    category: 'Administration',
    categoryTh: 'การบริหารระบบ',
    icon: 'truck',
    color: 'amber',
    description: 'Configure Bangkok postal code delivery zones, standard courier fees, and minimum order values for free doorstep delivery.',
    descriptionTh: 'ตั้งค่ารหัสไปรษณีย์ในกรุงเทพฯ โซนจัดส่ง ค่าส่งตามระยะทาง และยอดสั่งขั้นต่ำสำหรับส่งฟรี'
  },
  {
    id: 'gateway',
    label: 'Cashless Payment Gateway Settings',
    labelTh: 'การตั้งค่าระบบชำระเงินดิจิทัล',
    category: 'Administration',
    categoryTh: 'การบริหารระบบ',
    icon: 'receipt',
    color: 'cyan',
    description: 'Manage PromptPay merchant proxy ID, Thai QR payment instructions, bank account details, and auto-settlement switches.',
    descriptionTh: 'ตั้งค่ารหัสพร้อมเพย์ บัญชีธนาคารรับเงิน แสดงคิวอาร์โค้ด และเงื่อนไขการชำระเงิน'
  },
  {
    id: 'line-oa',
    label: 'LINE OA & Contact Channels',
    labelTh: 'ช่องทางติดต่อและ LINE OA',
    category: 'Administration',
    categoryTh: 'การบริหารระบบ',
    icon: 'line',
    color: 'emerald',
    description: 'Configure official LINE Official Account link/ID (@nonamelaundry), WhatsApp hotline, support email, and contact widgets.',
    descriptionTh: 'ตั้งค่าลิงก์ LINE Official Account (@nonamelaundry) เบอร์ WhatsApp อีเมลฝ่ายบริการ และช่องทางติดต่อ'
  },
  {
    id: 'faq',
    label: 'FAQ Knowledgebase Manager',
    labelTh: 'จัดการคำถามที่พบบ่อย (FAQ)',
    category: 'Administration',
    categoryTh: 'การบริหารระบบ',
    icon: 'helpCircle',
    color: 'violet',
    description: 'Create, translate, reorder, and update customer-facing frequently asked questions in English and Thai.',
    descriptionTh: 'เพิ่ม แก้ไข ลำดับ และแปลคำถามคำตอบที่พบบ่อย (FAQ) ภาษาไทยและอังกฤษ'
  }
];

export const ALL_FEATURE_IDS = BACKOFFICE_FEATURES.map(f => f.id);

export const DEFAULT_SYSTEM_ROLES = [
  {
    id: 'super_admin',
    name: 'Super Administrator',
    nameTh: 'ผู้ดูแลระบบสูงสุด',
    description: 'Complete unrestricted access to all back-office features, system settings, financial data, and security controls.',
    descriptionTh: 'เข้าถึงฟังก์ชันและตั้งค่าระบบทั้งหมดโดยไม่มีข้อจำกัด รวมถึงการเงินและความปลอดภัย',
    isSystem: true,
    color: 'purple',
    permissions: [...ALL_FEATURE_IDS]
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

/**
 * Checks whether an admin user is allowed to access a specific feature
 * @param {Object} adminUser - currently logged in user
 * @param {string} featureId - back-office tab/feature ID
 * @returns {boolean}
 */
export function canUserAccessFeature(adminUser, featureId) {
  if (!adminUser) return false;
  if (adminUser.role === 'super_admin' || adminUser.role === 'admin') {
    return true;
  }
  if (Array.isArray(adminUser.permissions) && adminUser.permissions.length > 0) {
    return adminUser.permissions.includes(featureId);
  }
  // Fallback to role defaults
  const matchedRole = DEFAULT_SYSTEM_ROLES.find(r => r.id === adminUser.role);
  if (matchedRole && Array.isArray(matchedRole.permissions)) {
    return matchedRole.permissions.includes(featureId);
  }
  return featureId === 'orders';
}

/**
 * Returns the list of feature IDs accessible by the user
 */
export function getUserAllowedFeatures(adminUser) {
  if (!adminUser) return [];
  if (adminUser.role === 'super_admin' || adminUser.role === 'admin') {
    return ALL_FEATURE_IDS;
  }
  if (Array.isArray(adminUser.permissions) && adminUser.permissions.length > 0) {
    return adminUser.permissions;
  }
  const matchedRole = DEFAULT_SYSTEM_ROLES.find(r => r.id === adminUser.role);
  if (matchedRole && Array.isArray(matchedRole.permissions)) {
    return matchedRole.permissions;
  }
  return ['orders'];
}
