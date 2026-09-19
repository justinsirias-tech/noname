// Services and Initial Configuration for NoName Laundry Bangkok

export const BANGKOK_DISTRICTS = [
  'Watthana (Thonglor, Ekkamai, Phrom Phong)',
  'Khlong Toei (Phra Khanong, Asok)',
  'Bang Rak (Silom, Surawong)',
  'Sathon (Sathorn, Chong Nonsi)',
  'Pathum Wan (Siam, Chidlom, Ploenchit)',
  'Phaya Thai (Ari, Sanam Pao)',
  'Huai Khwang (Ratchada, Rama 9)',
  'Chatuchak (Mo Chit, Lat Phrao)',
  'Din Daeng',
  'Yan Nawa (Rama 3)',
  'Phra Nakhon',
  'Other Bangkok Central Area'
];

export const TIME_SLOTS = [
  '09:00 - 11:00 (Morning)',
  '11:00 - 13:00 (Midday)',
  '14:00 - 16:00 (Afternoon)',
  '16:00 - 18:00 (Early Evening)',
  '18:00 - 20:30 (Evening Rush)'
];

export const INITIAL_SERVICES = [
  {
    id: 'wash_fold',
    name: 'Wash / Fold',
    nameTh: 'ซัก อบ พับ',
    description: 'Everyday casual wear, t-shirts, gym shorts, socks, towels, and bed linens washed with premium detergent, tumble dried, and neatly folded.',
    unit: 'KG',
    pricePerKg: 65,
    nextDayPricePerKg: 65,
    sameDayPricePerKg: 95,
    sameDayAvailable: true,
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
    nextDayPricePerKg: 95,
    sameDayPricePerKg: 145,
    sameDayAvailable: true,
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
    nextDayPricePerKg: 120,
    sameDayPricePerKg: 175,
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
    ]
  }
];

export const ORDER_STATUSES = {
  BOOKING_REQUESTED: { label: 'Booking Requested', color: 'bg-amber-100 text-amber-800 border-amber-300', step: 1 },
  PICKUP_SCHEDULED: { label: 'Pickup Scheduled', color: 'bg-blue-100 text-blue-800 border-blue-300', step: 2 },
  PICKED_UP: { label: 'Bag Collected', color: 'bg-indigo-100 text-indigo-800 border-indigo-300', step: 3 },
  WEIGHED_INSPECTED: { label: 'Weighed & Inspected', color: 'bg-purple-100 text-purple-800 border-purple-300', step: 4 },
  IN_WASH: { label: 'Washing & Drying', color: 'bg-cyan-100 text-cyan-800 border-cyan-300', step: 5 },
  IRON_FOLD: { label: 'Ironing & Finishing', color: 'bg-teal-100 text-teal-800 border-teal-300', step: 6 },
  READY_FOR_DELIVERY: { label: 'Ready for Dispatch', color: 'bg-emerald-100 text-emerald-800 border-emerald-300', step: 7 },
  OUT_FOR_DELIVERY: { label: 'Out for Delivery', color: 'bg-orange-100 text-orange-800 border-orange-300', step: 8 },
  DELIVERED: { label: 'Delivered & Complete', color: 'bg-green-100 text-green-800 border-green-300', step: 9 },
  CANCELLED: { label: 'Cancelled', color: 'bg-red-100 text-red-800 border-red-300', step: 0 }
};

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
    estimatedWeightKg: 3.0,
    actualWeightKg: 3.2,
    minWeightAppliedKg: 3.0,
    pricePerKg: 65,
    totalPrice: 208,
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
    subject: 'Special instruction: Extra starch on blue shirt',
    message: 'Hi NoName team, could you ensure light starch on the blue button-down shirt included in the bag? Thanks!',
    status: 'resolved',
    createdAt: '2026-09-16T09:50:00Z',
    response: 'Noted with thanks! Our finishing team has applied light starch to your blue shirt.'
  }
];

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
