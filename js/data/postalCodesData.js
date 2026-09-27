// Bangkok Postal Codes & Fixed Delivery Fee Configuration
// Manages fixed pickup & delivery charges based on Bangkok postal code

export const DEFAULT_BANGKOK_POSTAL_CODES = [
  {
    code: '10110',
    district: 'Watthana / Khlong Toei',
    areas: 'Sukhumvit, Thonglor, Ekkamai, Phrom Phong, Asoke, Phra Khanong',
    fee: 50,
    isActive: true,
    freeDeliveryAbove: 600
  },
  {
    code: '10120',
    district: 'Sathon / Yan Nawa / Bang Kho Laem',
    areas: 'Sathorn, Chong Nonsi, Rama 3, Chan Road, Suan Phlu, Charoen Krung (South)',
    fee: 50,
    isActive: true,
    freeDeliveryAbove: 600
  },
  {
    code: '10500',
    district: 'Bang Rak / Samphanthawong',
    areas: 'Silom, Surawong, Si Phraya, Charoen Krung, Samyan, Chinatown',
    fee: 50,
    isActive: true,
    freeDeliveryAbove: 600
  },
  {
    code: '10330',
    district: 'Pathum Wan',
    areas: 'Siam, Chidlom, Ploenchit, Wireless Road (Witthayu), Langsuan, Ratchadamri',
    fee: 50,
    isActive: true,
    freeDeliveryAbove: 600
  },
  {
    code: '10400',
    district: 'Phaya Thai / Din Daeng / Ratchathewi',
    areas: 'Ari, Sanam Pao, Victory Monument, Pratunam, Rangnam, Phayathai BTS',
    fee: 60,
    isActive: true,
    freeDeliveryAbove: 600
  },
  {
    code: '10310',
    district: 'Huai Khwang / Wang Thonglang',
    areas: 'Rama 9, Ratchadaphisek, Meng Jai, Thailand Cultural Centre, Pracha Uthit',
    fee: 60,
    isActive: true,
    freeDeliveryAbove: 600
  },
  {
    code: '10900',
    district: 'Chatuchak',
    areas: 'Mo Chit, Lat Phrao, Vibhavadi, Kaset, Chatuchak Weekend Market',
    fee: 70,
    isActive: true,
    freeDeliveryAbove: 700
  },
  {
    code: '10200',
    district: 'Phra Nakhon / Pom Prap / Dusit',
    areas: 'Rattanakosin Island, Banglamphu, Khao San Road, Dusit Palace, Thewet',
    fee: 70,
    isActive: true,
    freeDeliveryAbove: 700
  },
  {
    code: '10260',
    district: 'Bang Na / Phra Khanong Tai',
    areas: 'Udom Suk, Bang Na-Trat, Bearing, Central Bangna',
    fee: 80,
    isActive: true,
    freeDeliveryAbove: 700
  },
  {
    code: '10250',
    district: 'Suan Luang / Prawet',
    areas: 'Phatthanakan, On Nut (Outer), Srinakarin, Rama 9 (East)',
    fee: 80,
    isActive: true,
    freeDeliveryAbove: 700
  },
  {
    code: '10600',
    district: 'Khlong San / Thon Buri',
    areas: 'Wongwian Yai, Krung Thonburi, ICONSIAM, Charoen Nakhon',
    fee: 70,
    isActive: true,
    freeDeliveryAbove: 700
  },
  {
    code: '10160',
    district: 'Bang Khae / Phasi Charoen',
    areas: 'Phetkasem, Bang Wa Interchange, Phutthamonthon Sai 1',
    fee: 90,
    isActive: true,
    freeDeliveryAbove: 800
  }
];

export const DEFAULT_DELIVERY_CONFIG = {
  defaultFallbackFee: 80, // Default fee for unlisted Bangkok postal codes
  freeDeliveryEnabled: true,
  storeWideFreeDeliveryThreshold: 600, // Free delivery for orders >= 600 THB if qualified
  noticeTh: 'ค่าบริการรับ-ส่งตามรหัสไปรษณีย์ในกรุงเทพฯ (ส่งฟรีเมื่อสั่งครบ ฿600)',
  noticeEn: 'Fixed pickup & delivery fee by Bangkok postal code (Free delivery on orders ฿600+)'
};

// District name to default postal code mapping
export const DISTRICT_TO_POSTAL_CODE = {
  'Watthana (Thonglor, Ekkamai, Phrom Phong)': '10110',
  'Khlong Toei (Phra Khanong, Asok)': '10110',
  'Bang Rak (Silom, Surawong)': '10500',
  'Sathon (Sathorn, Chong Nonsi)': '10120',
  'Pathum Wan (Siam, Chidlom, Ploenchit)': '10330',
  'Phaya Thai (Ari, Sanam Pao)': '10400',
  'Huai Khwang (Ratchada, Rama 9)': '10310',
  'Chatuchak (Mo Chit, Lat Phrao)': '10900',
  'Din Daeng': '10400',
  'Yan Nawa (Rama 3)': '10120',
  'Phra Nakhon': '10200',
  'Other Bangkok Central Area': '10110'
};

// Calculate delivery fee given postal code and order subtotal
export function calculateDeliveryFee(postalCode, subtotal = 0, postalRates = DEFAULT_BANGKOK_POSTAL_CODES, deliveryConfig = DEFAULT_DELIVERY_CONFIG) {
  const cleanCode = (postalCode || '').trim();
  const matched = (postalRates || []).find(r => r.code === cleanCode);

  const fallbackFee = deliveryConfig?.defaultFallbackFee !== undefined ? Number(deliveryConfig.defaultFallbackFee) : 80;
  const isFreeDeliveryEnabled = deliveryConfig?.freeDeliveryEnabled !== false;

  let fee = matched ? Number(matched.fee) : fallbackFee;
  let isFree = false;
  let reason = '';

  if (matched && matched.isActive === false) {
    return {
      fee: 0,
      isAvailable: false,
      reason: `Postal code ${cleanCode} is currently outside our active pickup zone.`
    };
  }

  // Check postal-code specific free delivery threshold
  if (isFreeDeliveryEnabled && matched && matched.freeDeliveryAbove && Number(subtotal) >= Number(matched.freeDeliveryAbove)) {
    isFree = true;
    fee = 0;
    reason = `Free delivery applied (Order over ฿${matched.freeDeliveryAbove})`;
  } 
  // Or store-wide threshold
  else if (isFreeDeliveryEnabled && deliveryConfig?.storeWideFreeDeliveryThreshold && Number(subtotal) >= Number(deliveryConfig.storeWideFreeDeliveryThreshold)) {
    isFree = true;
    fee = 0;
    reason = `Free delivery applied (Order over ฿${deliveryConfig.storeWideFreeDeliveryThreshold})`;
  }

  return {
    fee,
    isFree,
    standardFee: matched ? Number(matched.fee) : fallbackFee,
    postalCode: cleanCode || '10110',
    district: matched ? matched.district : 'Bangkok Central',
    areas: matched ? matched.areas : '',
    reason,
    isAvailable: true
  };
}
