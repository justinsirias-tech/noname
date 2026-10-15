import React, { createContext, useContext } from 'react';

// Bilingual dictionary for NoName Laundry (English & Thai)

export const translations = {
  en: {
    // Top banner
    cityBannerBangkok: '🏙️ Bangkok Digital Service',
    cityBannerPattaya: '🏖️ Pattaya Digital Service',
    onlineOnlyBanner: 'Phone & WhatsApp Support: +66 80 888 9885',
    instantHelpVia: 'Instant Help via:',
    adminBtn: '⚙️ Admin',

    // Brand & Logo
    brandSubtitleBangkok: 'Bangkok Door-to-Door By KG',
    brandSubtitlePattaya: 'Pattaya Door-to-Door By KG',

    // City switcher
    switchBangkok: 'Bangkok',
    switchPattaya: 'Pattaya',

    // Navigation
    navHome: 'Home',
    navServices: 'Pricing & Services',
    navHowItWorks: 'How It Works',
    navCoverage: 'Coverage Areas',
    navReviews: 'Customer Reviews',
    navFaq: 'FAQ',
    navTrack: 'Track Order',
    navTerms: 'Terms & Conditions',
    navAccount: 'My Account',
    navLogin: 'Login',
    navRegister: 'Register',
    navBookPickup: 'Book Pickup',

    // Hero Section
    heroBadgeBangkok: '🏙️ Bangkok Digital Laundry • Door-to-Door',
    heroBadgePattaya: '🏖️ Pattaya Digital Laundry • Door-to-Door',
    heroBadgeOnlineOnly: 'Call & WhatsApp: +66 80 888 9885 • LINE',
    heroBadgeCashless: '100% Cashless (PromptPay / Cards)',
    heroTitlePrefix: 'Fresh Laundry By The KG',
    heroTitleCityBangkok: 'In Bangkok.',
    heroTitleCityPattaya: 'In Pattaya.',
    heroTitleSuffix: 'Zero Storefront.',
    heroDescBangkok: 'NoName Laundry brings high-standard garment care directly to your Bangkok condominium or home across all 50 districts and 180 sub-districts. Transparent by-the-KG pricing, digital scale audit, and responsive communication via Phone, WhatsApp (+66 80 888 9885), LINE, and Email.',
    heroDescPattaya: 'NoName Laundry brings high-standard garment care directly to your Pattaya condominium, private pool villa, or hotel (Central Pattaya, Wongamat, Pratumnak, Jomtien, Na Jomtien & East Pattaya). Transparent by-the-KG pricing, digital scale audit, and responsive communication via Phone, WhatsApp (+66 80 888 9885), LINE, and Email.',
    heroCtaBook: 'Book Digital Pickup',
    heroCtaSupport: 'Contact Customer Service',
    heroTrustScales: 'Certified digital scale receipt',
    heroTrustCashless: 'No cash handlers on-site',
    heroTrustJuristic: 'Condo lobby juristic pickup OK',

    // Quick Calculator
    calcTitle: 'Quick Price Estimator',
    calcSubtitle: 'Select services & estimate your total in seconds',
    calcCategoryAll: 'All Services',
    calcAddService: '+ Add Another Service',
    calcEstWeight: 'Estimated Weight',
    calcEstPieces: 'Pieces / Quantity',
    calcMinWeightNotice: 'Min. weight applied for hygiene and batching efficiency',
    calcSpeedStandard: 'Standard (2 Days)',
    calcSpeedNextDay: 'Next Day',
    calcSpeedSameDay: 'Same Day',
    calcTotalEstimate: 'Estimated Total:',
    calcDeliveryFeeNote: 'Delivery calculated by distance and postal code with transparent pricing',
    calcBookThisNow: 'Proceed to Booking with this Estimate →',

    // Services Section
    servicesTag: 'Strictly By Weight (KG)',
    servicesTitle: 'Transparent Laundry Pricing',
    servicesSubtitle: 'No complicated item counts. We bill purely by weight in Kilograms with minimum weight thresholds set for optimal machine batching and garment hygiene.',
    servicePopularBadge: 'Most Popular Choice',
    servicePerKg: '/ KG',
    serviceMinBatch: 'Min. batch',
    serviceSelectBtn: 'Select & Book Pickup',

    // How It Works Section
    hiwTag: 'Effortless Workflow',
    hiwTitle: 'How NoName Cloud Laundry Works',
    hiwSubtitle: 'Engineered for busy residents, expat professionals, and modern condo living.',
    hiwStep1Title: 'Book Digital Pickup',
    hiwStep1Desc: 'Select your service, estimated KG, and choose your condo/district. Select whether to receive updates via LINE, WhatsApp, or Email.',
    hiwStep1Badge: 'Fast Booking',
    hiwStep2Title: 'Condo Handover & Collection',
    hiwStep2Desc: 'Leave your laundry bag with your condo juristic office or hand directly to our courier. Your order is safely tracked directly to our laundry facility.',
    hiwStep2Badge: 'Lobby Drop-Off OK',
    hiwStep3Title: 'Facility Digital Scale Weigh-In',
    hiwStep3Desc: 'Upon arrival at our laundry hub, your bag is weighed on precision digital scales. We log the actual KG and update your online invoice.',
    hiwStep3Badge: 'Transparent Weight',
    hiwStep4Title: 'Fresh Doorstep Return',
    hiwStep4Desc: 'Garments are returned clean, folded or hung in sealed protective dust covers within 2 days (Standard), Next Day, or Same Day. Real-time delivery notification sent online.',
    hiwStep4Badge: 'Prompt Delivery',

    // Digital Support Banner
    dsbTitle: 'Responsive Customer Care & Phone Support',
    dsbDesc: 'NoName Laundry provides attentive customer support across Phone Call & WhatsApp (+66 80 888 9885), LINE Official (@nonamelaundry), and Email. We are here to assist with pickup scheduling, special laundry instructions, and order tracking.',
    dsbReason1Title: 'Photo & Text Audit Trail',
    dsbReason1Desc: 'Every instruction, gate pass, and condo juristic dropoff note is documented in writing and photo-verified.',
    dsbReason2Title: 'Direct Voice & Chat Support',
    dsbReason2Desc: 'Speak directly with our team or get instant updates on WhatsApp and LINE OA without hold queues.',
    dsbReason3Title: 'Clear Digital Pricing',
    dsbReason3Desc: 'Digital scale photos and automated QR PromptPay / credit card invoices prevent billing surprises.',

    // FAQ Section
    faqTag: '❓ Got Questions? We Have Answers',
    faqTitle: 'Frequently Asked Questions',
    faqSubtitle: 'Everything you need to know about our purely digital door-to-door laundry service — from certified digital scale weigh-ins to condo juristic drop-offs.',
    faqSearchPlaceholder: 'Search questions (e.g. juristic, payment, delivery)...',

    // Booking Wizard
    bwTitle: 'Schedule Your Laundry Pickup',
    bwSubtitle: 'Door-to-door pickup & delivery with digital scale audit',
    bwStep1: '1. Select Services',
    bwStep2: '2. Pickup & Address',
    bwStep3: '3. Contact & Confirm',
    bwCustomerName: 'Full Name',
    bwCustomerNamePlaceholder: 'e.g. John Doe',
    bwNickName: 'Nickname (Optional)',
    bwContactChannel: 'Preferred Contact Method',
    bwContactChannelHint: 'We will send all pickup alerts, digital scale receipts, and delivery updates here.',
    bwMobileNumber: 'Phone / WhatsApp Number',
    bwLineId: 'LINE ID',
    bwEmail: 'Email Address',
    bwEmailHint: 'All booking confirmations are automatically forwarded to our dispatch team.',
    bwCondoName: 'Condo / Building / Hotel Name',
    bwCondoPlaceholder: 'e.g. The Base Sukhumvit 77',
    bwRoomNumber: 'Room / Unit Number',
    bwRoomPlaceholder: 'e.g. 1802 / Tower A',
    bwDistrict: 'District',
    bwSubdistrict: 'Subdistrict',
    bwPostalCode: 'Postal Code',
    bwJuristicCheckbox: 'I will leave my laundry bag with the Condo Juristic Office / Concierge desk.',
    bwPickupDate: 'Pickup Date',
    bwPickupTime: 'Pickup Time Window',
    bwSpecialInstructions: 'Special Instructions / Access Codes',
    bwSpecialPlaceholder: 'e.g. Tell security room 1802. Please separate whites.',
    bwSummaryTitle: 'Order Summary',
    bwBtnNext: 'Next Step →',
    bwBtnBack: '← Back',
    bwBtnConfirm: 'Confirm Booking (Cashless) 🚀',
    bwTermsAgree: 'I agree to the Terms of Service & 100% Cashless payment policy.',

    // Footer
    footerBrandDesc: 'Purely digital laundry service by KG. Professional wash, steam iron, and fold/hang delivered directly to your condominium or house.',
    footerZeroPhone: 'Customer Support: Call or WhatsApp us at +66 80 888 9885, or contact us via LINE & Email.',
    footerServicesHeader: 'Services by Weight',
    footerAreasHeader: 'Coverage Areas',
    footerSupportHeader: 'Digital Support & Hours',
    footerHoursText: 'Monday – Sunday: 08:00 – 21:00',
    footerCopyright: 'NoName Laundry. All rights reserved. Registered Digital Laundry Service.'
  },

  th: {
    // Top banner
    cityBannerBangkok: '🏙️ บริการซักอบรีด กรุงเทพฯ',
    cityBannerPattaya: '🏖️ บริการซักอบรีด พัทยา',
    onlineOnlyBanner: 'ฝ่ายบริการลูกค้า: โทร & WhatsApp: +66 80 888 9885 • LINE: @nonamelaundry',
    instantHelpVia: 'ติดต่อทันทีผ่าน:',
    adminBtn: '⚙️ ระบบแอดมิน',

    // Brand & Logo
    brandSubtitleBangkok: 'บริการรับ-ส่งถึงที่ คิดตามน้ำหนัก (กิโลกรัม) ในกรุงเทพฯ',
    brandSubtitlePattaya: 'บริการรับ-ส่งถึงที่ คิดตามน้ำหนัก (กิโลกรัม) ในพัทยา',

    // City switcher
    switchBangkok: 'กรุงเทพฯ',
    switchPattaya: 'พัทยา',

    // Navigation
    navHome: 'หน้าแรก',
    navServices: 'บริการและราคา',
    navHowItWorks: 'ขั้นตอนการใช้บริการ',
    navCoverage: 'พื้นที่ให้บริการ',
    navReviews: 'รีวิวจากลูกค้า',
    navFaq: 'คำถามที่พบบ่อย',
    navTrack: 'ติดตามสถานะผ้า',
    navTerms: 'เงื่อนไขและข้อตกลง',
    navAccount: 'บัญชีของฉัน',
    navLogin: 'เข้าสู่ระบบ',
    navRegister: 'ลงทะเบียน',
    navBookPickup: 'เรียกรถรับผ้า',

    // Hero Section
    heroBadgeBangkok: '🏙️ บริการซักอบรีด กรุงเทพฯ • รับส่งถึงที่',
    heroBadgePattaya: '🏖️ บริการซักอบรีด พัทยา • รับส่งถึงที่',
    heroBadgeOnlineOnly: 'โทร & WhatsApp: +66 80 888 9885 • LINE',
    heroBadgeCashless: 'ไร้เงินสด 100% (PromptPay / บัตร)',
    heroTitlePrefix: 'บริการซักอบรีด คิดตามกิโลกรัม',
    heroTitleCityBangkok: 'ในกรุงเทพมหานคร',
    heroTitleCityPattaya: 'ในพัทยาและชลบุรี',
    heroTitleSuffix: 'ไม่มีหน้าร้าน สะดวก รวดเร็ว',
    heroDescBangkok: 'โนเนม ลอนดรี้ (NoName Laundry) ให้บริการดูแลเสื้อผ้ามาตรฐานสูง จัดส่งตรงถึงคอนโดมิเนียมและบ้านของคุณ ครอบคลุม 50 เขตทั่วกรุงเทพฯ ราคาโปร่งใสชั่งตามน้ำหนักจริง มีรูปถ่ายตาชั่งดิจิทัลยืนยัน สื่อสารสะดวกรวดเร็วผ่านโทรศัพท์, WhatsApp (+66 80 888 9885), LINE และ Email',
    heroDescPattaya: 'โนเนม ลอนดรี้ (NoName Laundry) พร้อมดูแลเสื้อผ้าส่งตรงถึงคอนโด พูลวิลล่า และโรงแรมในพัทยา (พัทยากลาง วงศ์อมาตย์ พระตำหนัก จอมเทียน นาจอมเทียน และพัทยาตะวันออก) คิดราคาตามกิโลกรัมชัดเจน พร้อมระบบตรวจสอบน้ำหนักดิจิทัล และดูแลผ่านโทรศัพท์, WhatsApp (+66 80 888 9885), LINE และ Email',
    heroCtaBook: 'เรียกรถรับผ้าออนไลน์',
    heroCtaSupport: 'ติดต่อฝ่ายบริการลูกค้า',
    heroTrustScales: 'มีรูปถ่ายตาชั่งดิจิทัลยืนยันน้ำหนัก',
    heroTrustCashless: 'ปลอดภัย ไร้เงินสด ไม่ต้องพกเงินทอน',
    heroTrustJuristic: 'ฝาก-รับผ้าที่นิติบุคคลคอนโดได้สะดวก',

    // Quick Calculator
    calcTitle: 'คำนวณราคาเบื้องต้น',
    calcSubtitle: 'เลือกบริการและประเมินราคาทันทีในไม่กี่วินาที',
    calcCategoryAll: 'บริการทั้งหมด',
    calcAddService: '+ เพิ่มบริการอื่น',
    calcEstWeight: 'น้ำหนักผ้าโดยประมาณ',
    calcEstPieces: 'จำนวนชิ้น / ปริมาณ',
    calcMinWeightNotice: 'คิดน้ำหนักขั้นต่ำเพื่อสุขอนามัยและการแยกถังซักเฉพาะบุคคล',
    calcSpeedStandard: 'มาตรฐาน (2 วัน)',
    calcSpeedNextDay: 'ส่งวันถัดไป (Next Day)',
    calcSpeedSameDay: 'ส่งในวันเดียว (Same Day)',
    calcTotalEstimate: 'ยอดรวมประมาณการ:',
    calcDeliveryFeeNote: 'ค่าจัดส่งคำนวณตามรหัสไปรษณีย์และระยะทางอย่างโปร่งใส',
    calcBookThisNow: 'ไปที่หน้าจองพร้อมราคานี้ →',

    // Services Section
    servicesTag: 'คิดราคาตามน้ำหนัก (กิโลกรัม) ชัดเจน',
    servicesTitle: 'อัตราค่าบริการที่โปร่งใส',
    servicesSubtitle: 'ไม่ต้องนับชิ้นผ้าให้ยุ่งยาก คิดราคาตามน้ำหนักจริงบนตาชั่งดิจิทัล พร้อมกำหนดน้ำหนักขั้นต่ำเพื่อมาตรฐานความสะอาดสูงสุด',
    servicePopularBadge: 'บริการยอดนิยม',
    servicePerKg: '/ กก.',
    serviceMinBatch: 'น้ำหนักขั้นต่ำ',
    serviceSelectBtn: 'เลือกและเรียกรถรับผ้า',

    // How It Works Section
    hiwTag: 'ขั้นตอนที่ง่ายและสะดวก',
    hiwTitle: 'ขั้นตอนการใช้บริการ NoName Laundry',
    hiwSubtitle: 'ออกแบบมาเพื่อชีวิตคนเมือง ชาวคอนโด และชาวต่างชาติที่ต้องการความสะดวกรวดเร็ว',
    hiwStep1Title: '1. เรียกรถรับผ้าผ่านเว็บ',
    hiwStep1Desc: 'เลือกบริการ ระบุน้ำหนักโดยประมาณ และคอนโด/ที่อยู่ของคุณ เลือกว่าต้องการรับการแจ้งเตือนผ่าน LINE, WhatsApp หรือ Email',
    hiwStep1Badge: 'จองง่ายรวดเร็ว',
    hiwStep2Title: '2. ติดแท็กบาร์โค้ดและรับผ้า',
    hiwStep2Desc: 'ฝากถุงผ้าไว้กับนิติบุคคลคอนโด หรือส่งให้คนขับของเราโดยตรง เราจะติดแท็กบาร์โค้ดประจำตัวถุงผ้าทันที',
    hiwStep2Badge: 'ฝากนิติบุคคลได้',
    hiwStep3Title: '3. ชั่งน้ำหนักจริงที่ศูนย์ซัก',
    hiwStep3Desc: 'เมื่อผ้าถึงศูนย์ซัก จะถูกชั่งด้วยตาชั่งดิจิทัลมาตรฐาน บันทึกน้ำหนักจริงและอัปเดตใบแจ้งยอดออนไลน์ของคุณ',
    hiwStep3Badge: 'น้ำหนักตรงไปตรงมา',
    hiwStep4Title: '4. จัดส่งผ้าสะอาดคืนถึงหน้าห้อง',
    hiwStep4Desc: 'เสื้อผ้าถูกซัก อบ พับ หรือแขวนในถุงกันฝุ่นอย่างดี ส่งคืนภายใน 2 วัน (มาตรฐาน), วันถัดไป (Next Day) หรือส่งด่วนในวันเดียว (Same Day) พร้อมแจ้งเตือนออนไลน์เมื่อส่งถึง',
    hiwStep4Badge: 'ส่งตรงเวลา',

    // Digital Support Banner
    dsbTitle: 'พร้อมดูแลและบริการลูกค้าอย่างใส่ใจ',
    dsbDesc: 'NoName Laundry พร้อมช่วยเหลือและตอบทุกข้อสงสัยผ่านทางโทรศัพท์ & WhatsApp (+66 80 888 9885), LINE Official (@nonamelaundry) และ Email ติดต่อเราได้ทันทีเพื่อสอบถามสถานะผ้าหรือนัดหมายการรับส่ง',
    dsbReason1Title: 'มีบันทึกและรูปถ่ายเป็นหลักฐาน',
    dsbReason1Desc: 'ทุกคำสั่ง รายละเอียดการฝากนิติบุคคล และรหัสห้องพัก มีบันทึกชัดเจน ตรวจสอบย้อนหลังได้ตลอดเวลา',
    dsbReason2Title: 'พูดคุยและแชทกับทีมงานโดยตรง',
    dsbReason2Desc: 'โทรศัพท์พูดคุยกับทีมงานได้โดยตรง หรือติดต่อผ่าน WhatsApp และ LINE OA ได้อย่างสะดวกรวดเร็ว',
    dsbReason3Title: 'ราคาและสลิปชัดเจน ตรวจสอบได้',
    dsbReason3Desc: 'แสดงภาพตาชั่งและใบเสร็จดิจิทัล พร้อมระบบชำระเงิน QR PromptPay และบัตรเครดิต ปลอดภัย 100%',

    // FAQ Section
    faqTag: '❓ มีข้อสงสัย? เรามีคำตอบ',
    faqTitle: 'คำถามที่พบบ่อย',
    faqSubtitle: 'ทุกเรื่องที่คุณควรรู้เกี่ยวกับบริการซักอบรีดดิจิทัลรับส่งถึงที่ ตั้งแต่การชั่งน้ำหนักไปจนถึงการฝากผ้านิติบุคคล',
    faqSearchPlaceholder: 'ค้นหาคำถาม (เช่น นิติบุคคล, การชำระเงิน, ค่าจัดส่ง)...',

    // Booking Wizard
    bwTitle: 'นัดหมายเรียกรถรับผ้า',
    bwSubtitle: 'บริการรับ-ส่งถึงคอนโด พร้อมรูปถ่ายตาชั่งดิจิทัลยืนยันน้ำหนัก',
    bwStep1: '1. เลือกบริการ',
    bwStep2: '2. ที่อยู่และเวลารับผ้า',
    bwStep3: '3. ช่องทางติดต่อและยืนยัน',
    bwCustomerName: 'ชื่อ-นามสกุล',
    bwCustomerNamePlaceholder: 'เช่น สมชาย ใจดี / John Doe',
    bwNickName: 'ชื่อเล่น (ถ้ามี)',
    bwContactChannel: 'ช่องทางติดต่อที่สะดวก',
    bwContactChannelHint: 'เราจะส่งแจ้งเตือนการเข้ารับ รูปตาชั่งดิจิทัล และสถานะการจัดส่งไปยังช่องทางนี้',
    bwMobileNumber: 'เบอร์โทรศัพท์ / WhatsApp',
    bwLineId: 'LINE ID',
    bwEmail: 'อีเมล',
    bwEmailHint: 'ข้อมูลการจองจะถูกส่งต่อเข้าทีมงานทันทีโดยอัตโนมัติ',
    bwCondoName: 'ชื่อคอนโด / อาคาร / โรงแรม',
    bwCondoPlaceholder: 'เช่น The Base Sukhumvit 77',
    bwRoomNumber: 'เลขที่ห้อง / อาคาร',
    bwRoomPlaceholder: 'เช่น 1802 / อาคาร A',
    bwDistrict: 'เขต / อำเภอ',
    bwSubdistrict: 'แขวง / ตำบล',
    bwPostalCode: 'รหัสไปรษณีย์',
    bwJuristicCheckbox: 'ฉันจะฝากถุงผ้าไว้กับนิติบุคคลคอนโด / เคาน์เตอร์ต้อนรับ',
    bwPickupDate: 'วันที่ต้องการให้เข้ารับผ้า',
    bwPickupTime: 'ช่วงเวลาเข้ารับ',
    bwSpecialInstructions: 'คำแนะนำพิเศษ / ข้อความถึงคนขับ',
    bwSpecialPlaceholder: 'เช่น แจ้งรปภ.ว่าห้อง 1802, กรุณาแยกผ้าขาว',
    bwSummaryTitle: 'สรุปรายการคำสั่งซื้อ',
    bwBtnNext: 'ขั้นตอนถัดไป →',
    bwBtnBack: '← ย้อนกลับ',
    bwBtnConfirm: 'ยืนยันการนัดหมาย (ระบบไร้เงินสด) 🚀',
    bwTermsAgree: 'ฉันยอมรับเงื่อนไขการให้บริการ และนโยบายชำระเงินไร้เงินสด 100%',

    // Footer
    footerBrandDesc: 'บริการซักอบรีดดิจิทัล คิดราคาตามกิโลกรัม บริการซัก อบ รีด พับ และแขวน ส่งตรงถึงคอนโดหรือบ้านของคุณอย่างมืออาชีพ',
    footerZeroPhone: 'ฝ่ายบริการลูกค้า: ติดต่อเราได้ทางโทรศัพท์และ WhatsApp: +66 80 888 9885 หรือ LINE และ Email',
    footerServicesHeader: 'บริการตามน้ำหนัก',
    footerAreasHeader: 'พื้นที่ให้บริการ',
    footerSupportHeader: 'การดูแลลูกค้าและเวลาทำการ',
    footerHoursText: 'จันทร์ – อาทิตย์: 08:00 – 21:00 น.',
    footerCopyright: 'NoName Laundry สงวนลิขสิทธิ์ทั้งหมด บริการซักอบรีดดิจิทัลมาตรฐานสากล'
  }
};

export const LanguageContext = React.createContext({
  language: 'en',
  setLanguage: () => {},
  t: (key) => key
});

export function useTranslation() {
  const context = React.useContext(LanguageContext);
  return context;
}
