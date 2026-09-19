// Initial FAQ Dataset for NoName Laundry Bangkok
// Specifically tailored to the purely digital, door-to-door, by-KG laundry model.

export const INITIAL_FAQS = [
  {
    id: 'FAQ-1',
    category: 'Pricing & Weight Verification',
    question: 'How does pricing by weight (KG) work, and how is it verified?',
    answer: 'All services are charged per Kilogram (KG) with a standard minimum of 4.0 KG. When our logistics team collects your laundry bag, it is brought to our central Bangkok facility and weighed on certified digital scales before washing. We record the exact digital weight, update your online order profile with the verified scale intake, and notify you instantly via WhatsApp or LINE with the final balance before washing begins.',
    order: 1,
    isPublished: true
  },
  {
    id: 'FAQ-2',
    category: 'Pickup, Delivery & Condo Juristic',
    question: 'Do I have to be at home when the driver arrives, or can I leave laundry with condo reception / juristic?',
    answer: 'You do NOT need to wait at home! Over 80% of our Bangkok customers use Condo Juristic or Reception drop-off. Simply leave your laundry bag with your condominium juristic office or front desk labeled with your name or Booking ID. Our driver will collect it during your scheduled time window, and deliver your clean, sealed garments back to your juristic office upon completion.',
    order: 2,
    isPublished: true
  },
  {
    id: 'FAQ-3',
    category: 'Digital Communication & Policy',
    question: 'Why does NoName Laundry operate with a "Zero Storefront & 100% Online Support" policy?',
    answer: 'By eliminating expensive commercial retail storefronts and telephone switchboards, we pass direct savings to our customers with lower per-KG rates and invest in hospital-grade washing machinery. All communication, order confirmations, scale weigh-in receipts, and customer inquiries are handled digitally via WhatsApp, LINE Official Account, and Email with permanent chat histories.',
    order: 3,
    isPublished: true
  },
  {
    id: 'FAQ-4',
    category: 'Turnaround & Scheduling',
    question: 'What turnaround speeds are available (48h Standard, Next Day 24h, Same Day)?',
    answer: 'We offer three distinct turnaround speeds: 1) Standard Service (48 Hours / ~2 Days) for economical relaxed turnaround; 2) Next Day Delivery (24 Hours) for fast next-day returns; and 3) Same Day Express for priority morning pickups delivered anytime before 18:00 hrs on the same day. You can select your preferred turnaround speed directly during booking with dynamic per-KG pricing.',
    order: 4,
    isPublished: true
  },
  {
    id: 'FAQ-5',
    category: 'Payment, PromptPay & Tax Invoices',
    question: 'What payment methods are accepted, and can I get a company tax invoice?',
    answer: 'We operate a 100% cashless system. You can pay via Thai QR PromptPay (compatible with any Thai mobile banking app like KBank, SCB, Bangkok Bank) or international credit/debit cards (Visa, Mastercard, JCB). If your company requires a Thai tax invoice (ใบกำกับภาษีเต็มรูปแบบ / e-Tax), simply enter your 13-digit Tax ID and Company Name during booking or in your Customer Profile.',
    order: 5,
    isPublished: true
  },
  {
    id: 'FAQ-6',
    category: 'Laundry Care & Hygiene',
    question: 'Are my clothes washed together with other customers?',
    answer: 'Absolutely NOT. We strictly enforce a single-batch policy: each customer\'s laundry is weighed, tagged, washed, and dried in dedicated private commercial washers. We never mix garments from different households under any circumstances. We use hypoallergenic commercial detergents and fabric softeners suited for tropical climates.',
    order: 6,
    isPublished: true
  },
  {
    id: 'FAQ-7',
    category: 'Pricing & Weight Verification',
    question: 'What happens if my laundry weighs less than the 4 KG minimum?',
    answer: 'You are welcome to send any amount of laundry! If your verified scale weight is under 4.0 KG (e.g. 2.5 KG), the minimum billing baseline of 4.0 KG is applied. For example, Wash & Fold at ฿75/KG with a 4 KG minimum is ฿300 THB.',
    order: 7,
    isPublished: true
  },
  {
    id: 'FAQ-8',
    category: 'Pickup, Delivery & Condo Juristic',
    question: 'Which areas in Bangkok do you cover?',
    answer: 'We provide door-to-door collection across all major Bangkok central districts, including Watthana (Thonglor, Ekkamai, Phrom Phong), Khlong Toei (Asok, Phra Khanong), Bang Rak (Silom, Surawong), Sathon, Pathum Wan (Siam, Chidlom), Phaya Thai (Ari), and Huai Khwang (Rama 9).',
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
