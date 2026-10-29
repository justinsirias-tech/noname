// Initial FAQ Dataset for NoName Laundry Bangkok & Pattaya
// Specifically tailored to the purely digital, door-to-door, by-KG laundry model.

export const INITIAL_FAQS = [
  {
    id: 'FAQ-1',
    category: 'Pricing & Weight Verification',
    categoryTh: 'ราคาและการชั่งน้ำหนักยืนยัน',
    question: 'How does pricing by weight (KG) work, and how is it verified?',
    questionTh: 'การคิดราคาตามน้ำหนัก (กก.) ทำงานอย่างไร และตรวจสอบน้ำหนักอย่างไร?',
    answer: 'All services are charged per Kilogram (KG) with a standard minimum of 4.0 KG. When our logistics team collects your laundry bag, it is brought to our central Bangkok facility and weighed on certified digital scales before washing. We record the exact digital weight, update your online order profile with the verified scale intake, and notify you instantly via WhatsApp or LINE with the final balance before washing begins.',
    answerTh: 'บริการคิดราคาตามน้ำหนักจริงเป็นกิโลกรัม (กก.) โดยมีน้ำหนักขั้นต่ำ 4.0 กก. เมื่อพนักงานเข้ารับถุงผ้า ผ้าจะถูกนำเข้าสู่ศูนย์ซักและชั่งด้วยเครื่องชั่งดิจิทัลที่ได้มาตรฐาน เราจะบันทึกน้ำหนักจริง อัปเดตในระบบ และส่งรูปถ่ายหน้าจอเครื่องชั่งพร้อมยอดชำระให้ลูกค้าทาง WhatsApp หรือ LINE ทันที',
    order: 1,
    isPublished: true
  },
  {
    id: 'FAQ-2',
    category: 'Pickup, Delivery & Condo Juristic',
    categoryTh: 'การรับ-ส่งผ้าและนิติบุคคลคอนโด',
    question: 'Do I have to be at home when the driver arrives, or can I leave laundry with condo reception / juristic?',
    questionTh: 'ต้องอยู่รอรับคนขับหรือไม่ หรือสามารถฝากไว้กับนิติบุคคล / แผนกต้อนรับคอนโดได้ไหม?',
    answer: 'You do NOT need to wait at home! Over 80% of our Bangkok customers use Condo Juristic or Reception drop-off. Simply leave your laundry bag with your condominium juristic office or front desk labeled with your name or Booking ID. Our driver will collect it during your scheduled time window, and deliver your clean, sealed garments back to your juristic office upon completion.',
    answerTh: 'คุณไม่จำเป็นต้องอยู่รอที่ห้อง! ลูกค้ากว่า 80% ของเราเลือกใช้บริการฝากที่นิติบุคคลหรือเคาน์เตอร์ต้อนรับคอนโด เพียงฝากถุงผ้าพร้อมเขียนชื่อหรือรหัสการจอง พนักงานขับรถจะเข้ารับตามรอบเวลาที่กำหนด และนำส่งคืนถุงผ้าสะอาดที่ซีลเรียบร้อยไว้ที่นิติบุคคลเช่นเดียวกัน',
    order: 2,
    isPublished: true
  },
  {
    id: 'FAQ-3',
    category: 'Digital Communication & Policy',
    categoryTh: 'ช่องทางการติดต่อและนโยบายดิจิทัล',
    question: 'How does NoName Laundry provide customer support and pickup delivery?',
    questionTh: 'NoName Laundry ให้บริการลูกค้าและประสานงานรับ-ส่งผ้าอย่างไร?',
    answer: 'By operating an efficient pickup-and-delivery model without expensive retail storefront overhead, we pass direct savings to our customers with lower per-KG rates and invest in hospital-grade washing machinery. Our customer support team assists you directly via Phone Call & WhatsApp (+66 80 888 9885), LINE Official Account, and Email.',
    answerTh: 'ด้วยโมเดลการรับ-ส่งผ้าถึงที่ที่มีประสิทธิภาพโดยไม่มีต้นทุนหน้าร้านราคาแพง เราจึงนำเสนอค่าบริการต่อ กก. ที่คุ้มค่า พร้อมลงทุนในเครื่องจักรอุตสาหกรรมระดับมาตรฐานสุขอนามัย ทีมบริการลูกค้าพร้อมดูแลคุณโดยตรงผ่านโทรศัพท์และ WhatsApp (+66 80 888 9885), LINE Official (@nonamelaundry) และอีเมล',
    order: 3,
    isPublished: true
  },
  {
    id: 'FAQ-4',
    category: 'Turnaround & Scheduling',
    categoryTh: 'ความเร็วบริการและเวลารับ-ส่ง',
    question: 'What turnaround speeds are available (Standard 2 Days, Next Day, Same Day)?',
    questionTh: 'มีบริการความเร็วกี่ระดับ (มาตรฐาน 2 วัน, วันถัดไป, ส่งด่วนวันเดียว)?',
    answer: 'We offer three distinct turnaround speeds: 1) Standard Service (2 Days) for economical relaxed turnaround; 2) Next Day for fast next-day returns; and 3) Same Day for priority morning pickups delivered before 18:00 hrs on the same day. You can select your preferred turnaround speed directly during booking with dynamic pricing.',
    answerTh: 'เรามีบริการ 3 ระดับความเร็ว: 1) บริการมาตรฐาน (2 วัน) ราคาประหยัดสุดคุ้ม; 2) ส่งวันถัดไป (24 ชม.) สำหรับผู้ที่ต้องการผ้าด่วน; และ 3) ส่งด่วนวันเดียว (Same Day) รับผ้าช่วงเช้า ส่งคืนก่อน 18:00 น. ในวันเดียวกัน เลือกระดับความเร็วได้ในขั้นตอนการจอง',
    order: 4,
    isPublished: true
  },
  {
    id: 'FAQ-5',
    category: 'Payment, PromptPay & Tax Invoices',
    categoryTh: 'การชำระเงิน พร้อมเพย์ และใบกำกับภาษี',
    question: 'What payment methods are accepted, and can I get a company tax invoice?',
    questionTh: 'รับชำระเงินช่องทางใดบ้าง และสามารถขอใบกำกับภาษีในนามบริษัทได้หรือไม่?',
    answer: 'We operate a 100% cashless system. You can pay via Thai QR PromptPay (compatible with any Thai mobile banking app like KBank, SCB, Bangkok Bank) or international credit/debit cards (Visa, Mastercard, JCB). If your company requires a Thai tax invoice (ใบกำกับภาษีเต็มรูปแบบ / e-Tax), simply enter your 13-digit Tax ID and Company Name during booking or in your Customer Profile.',
    answerTh: 'เราใช้ระบบไร้เงินสด 100% รองรับ Thai QR พร้อมเพย์ (สแกนได้จากทุกธนาคาร เช่น กสิกรไทย, ไทยพาณิชย์, กรุงเทพ ฯลฯ) รวมถึงบัตรเครดิต/เดบิตสากล หากต้องการใบกำกับภาษีเต็มรูปแบบ เพียงกรอกเลขผู้เสียภาษี 13 หลักและชื่อบริษัทในขั้นตอนการจอง',
    order: 5,
    isPublished: true
  },
  {
    id: 'FAQ-6',
    category: 'Laundry Care & Hygiene',
    categoryTh: 'การดูแลผ้าและสุขอนามัย',
    question: 'Are my clothes washed together with other customers?',
    questionTh: 'เสื้อผ้าของฉันจะถูกซักรวมกับของลูกค้าท่านอื่นหรือไม่?',
    answer: 'Absolutely NOT. We strictly enforce a single-batch policy: each customer\'s laundry is weighed, tagged, washed, and dried in dedicated private commercial washers. We never mix garments from different households under any circumstances. We use hypoallergenic commercial detergents and fabric softeners suited for tropical climates.',
    answerTh: 'ไม่ซักรวมอย่างแน่นอน! เราใช้นโยบาย 1 ถุงต่อ 1 เครื่อง (Single-Batch) ผ้าของลูกค้าแต่ละท่านจะถูกซักและอบในเครื่องแยกเฉพาะ ไม่ปะปนกับผ้าของผู้อื่นเด็ดขาด พร้อมใช้น้ำยาซักผ้าและปรับผ้านุ่มสูตรอ่อนโยน ไม่ระคายเคืองผิว',
    order: 6,
    isPublished: true
  },
  {
    id: 'FAQ-7',
    category: 'Pricing & Weight Verification',
    categoryTh: 'ราคาและการชั่งน้ำหนักยืนยัน',
    question: 'What happens if my laundry weighs less than the 4 KG minimum?',
    questionTh: 'ถ้าผ้าของฉันมีน้ำหนักน้อยกว่าขั้นต่ำ 4 กิโลกรัม จะคิดราคาอย่างไร?',
    answer: 'You are welcome to send any amount of laundry! If your verified scale weight is under 4.0 KG (e.g. 2.5 KG), the minimum billing baseline of 4.0 KG is applied. For example, Wash & Fold at ฿70/KG with a 4 KG minimum is ฿280 THB.',
    answerTh: 'คุณสามารถส่งผ้ากี่ชิ้นหรือกี่กิโลกรัมก็ได้! หากน้ำหนักชั่งจริงน้อยกว่า 4.0 กก. (เช่น 2.5 กก.) ระบบจะคิดราคาตามเกณฑ์ขั้นต่ำ 4.0 กก. ตัวอย่างเช่น ซักพับ กก. ละ 70 บาท ขั้นต่ำ 4 กก. คิดเป็น 280 บาท',
    order: 7,
    isPublished: true
  },
  {
    id: 'FAQ-8',
    category: 'Pickup, Delivery & Condo Juristic',
    categoryTh: 'การรับ-ส่งผ้าและนิติบุคคลคอนโด',
    question: 'Which areas in Bangkok and Pattaya do you cover?',
    questionTh: 'พื้นที่ให้บริการในกรุงเทพฯ และพัทยาครอบคลุมบริเวณใดบ้าง?',
    answer: 'We provide door-to-door collection across all 50 Bangkok districts (including Sukhumvit, Silom, Sathorn, Ari, Rama 9) and all Pattaya zones (Central Pattaya, North Pattaya, Naklua, Pratumnak, Jomtien). Delivery fees are calculated by sub-district zone.',
    answerTh: 'เราให้บริการรับ-ส่งครอบคลุมครบทั้ง 50 เขตในกรุงเทพมหานคร (สุขุมวิท, สีลม, สาทร, อารีย์, พระราม 9 ฯลฯ) และทุกโซนในพัทยา (พัทยากลาง, พัทยาเหนือ, นาเกลือ, เขาพระตำหนัก, จอมเทียน) โดยคิดค่าจัดส่งตามโซนแขวง/ตำบลอย่างโปร่งใส',
    order: 8,
    isPublished: true
  }
];

export const FAQ_CATEGORIES = [
  'ALL',
  'Pricing & Weight Verification',
  'Pickup, Delivery & Condo Juristic',
  'Digital Communication & Policy',
  'Turnaround & Scheduling',
  'Payment, PromptPay & Tax Invoices',
  'Laundry Care & Hygiene'
];
