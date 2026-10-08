import { BANGKOK_DISTRICTS_TO_SUBDISTRICTS, PATTAYA_SUBDISTRICTS_LIST, DISTRICT_TO_POSTAL_CODE } from './postalCodesData.js';
import { BANGKOK_DISTRICTS } from './servicesData.js';

// Bangkok & Pattaya Residences, Condominiums, Houses, and Landmarks Database with Google Maps Coordinates
// Used by GoogleMapsCondoAutocomplete to power address and residence location selection
export const BANGKOK_CONDO_DATABASE = [
  // --- Watthana (Thonglor, Ekkamai, Phrom Phong) ---
  {
    id: 'bkk-wth-001',
    name: 'Ideo Q Sukhumvit 36',
    thaiName: 'ไอดีโอ คิว สุขุมวิท 36',
    aliases: ['Ideo Sukhumvit 36', 'Ideo Q 36'],
    district: 'Watthana (Thonglor, Ekkamai, Phrom Phong)',
    subdistrict: 'Khlong Tan',
    road: 'Sukhumvit Soi 36',
    zipcode: '10110',
    lat: 13.7214,
    lng: 100.5759,
    type: 'Luxury Condominium'
  },
  {
    id: 'bkk-wth-002',
    name: 'Beatniq Sukhumvit 32',
    thaiName: 'บีทนิค สุขุมวิท 32',
    aliases: ['Beatniq Condo', 'Beatniq 32'],
    district: 'Watthana (Thonglor, Ekkamai, Phrom Phong)',
    subdistrict: 'Khlong Tan',
    road: 'Sukhumvit Soi 32',
    zipcode: '10110',
    lat: 13.7258,
    lng: 100.5731,
    type: 'Super Luxury Residence'
  },
  {
    id: 'bkk-wth-003',
    name: 'The Esse Sukhumvit 36',
    thaiName: 'ดิ เอส สุขุมวิท 36',
    aliases: ['Esse 36', 'The Esse 36'],
    district: 'Watthana (Thonglor, Ekkamai, Phrom Phong)',
    subdistrict: 'Khlong Tan',
    road: 'Sukhumvit Soi 36',
    zipcode: '10110',
    lat: 13.7226,
    lng: 100.5768,
    type: 'Luxury Condominium'
  },
  {
    id: 'bkk-wth-004',
    name: 'HQ by Sansiri (Thonglor)',
    thaiName: 'เอช คิว บาย แสนสิริ ทองหล่อ',
    aliases: ['HQ Thonglor', 'HQ Sansiri'],
    district: 'Watthana (Thonglor, Ekkamai, Phrom Phong)',
    subdistrict: 'Khlong Tan Nuea',
    road: 'Thonglor Soi 6 (Sukhumvit 55)',
    zipcode: '10110',
    lat: 13.7312,
    lng: 100.5824,
    type: 'High-End Condominium'
  },
  {
    id: 'bkk-wth-005',
    name: 'Tela Thonglor',
    thaiName: 'เทลล่า ทองหล่อ',
    aliases: ['Tela Thonglor 13', 'Tela Condo'],
    district: 'Watthana (Thonglor, Ekkamai, Phrom Phong)',
    subdistrict: 'Khlong Tan Nuea',
    road: 'Thonglor Soi 13',
    zipcode: '10110',
    lat: 13.7347,
    lng: 100.5843,
    type: 'Ultra Luxury Residence'
  },
  {
    id: 'bkk-wth-006',
    name: 'Khun by Yoo (Thonglor 12)',
    thaiName: 'คุณ บาย ยู ทองหล่อ 12',
    aliases: ['Khun by Yoo Inspired by Starck', 'Khun Thonglor'],
    district: 'Watthana (Thonglor, Ekkamai, Phrom Phong)',
    subdistrict: 'Khlong Tan Nuea',
    road: 'Thonglor Soi 12',
    zipcode: '10110',
    lat: 13.7335,
    lng: 100.5836,
    type: 'Super Luxury Residence'
  },
  {
    id: 'bkk-wth-007',
    name: 'The Monument Thong Lo',
    thaiName: 'เดอะ โมนูเมนต์ ทองหล่อ',
    aliases: ['Monument Thonglor'],
    district: 'Watthana (Thonglor, Ekkamai, Phrom Phong)',
    subdistrict: 'Khlong Tan Nuea',
    road: 'Sukhumvit 55 (North Thonglor)',
    zipcode: '10110',
    lat: 13.7431,
    lng: 100.5878,
    type: 'Ultra Luxury Condominium'
  },
  {
    id: 'bkk-wth-008',
    name: 'The Estelle Phrom Phong',
    thaiName: 'ดิ เอสเทลล์ พร้อมพงษ์',
    aliases: ['Estelle Sukhumvit 26', 'The Estelle 26'],
    district: 'Watthana (Thonglor, Ekkamai, Phrom Phong)',
    subdistrict: 'Khlong Tan Nuea',
    road: 'Sukhumvit Soi 26',
    zipcode: '10110',
    lat: 13.7291,
    lng: 100.5694,
    type: 'Super Luxury Residence'
  },
  {
    id: 'bkk-wth-009',
    name: 'The Diplomat 39',
    thaiName: 'เดอะ ดิโพลแมท 39',
    aliases: ['Diplomat 39', 'Diplomat Sukhumvit 39'],
    district: 'Watthana (Thonglor, Ekkamai, Phrom Phong)',
    subdistrict: 'Khlong Tan Nuea',
    road: 'Sukhumvit Soi 39',
    zipcode: '10110',
    lat: 13.7329,
    lng: 100.5707,
    type: 'Ultra Luxury Residence'
  },
  {
    id: 'bkk-wth-010',
    name: 'Vittorio Sukhumvit 39',
    thaiName: 'วิตโตริโอ สุขุมวิท 39',
    aliases: ['Vittorio 39'],
    district: 'Watthana (Thonglor, Ekkamai, Phrom Phong)',
    subdistrict: 'Khlong Tan Nuea',
    road: 'Sukhumvit Soi 39',
    zipcode: '10110',
    lat: 13.7318,
    lng: 100.5701,
    type: 'Masterpiece Residence'
  },
  {
    id: 'bkk-wth-011',
    name: 'XT Ekkamai',
    thaiName: 'เอ็กซ์ที เอกมัย',
    aliases: ['XT Condo Ekkamai', 'XT Sukhumvit 63'],
    district: 'Watthana (Thonglor, Ekkamai, Phrom Phong)',
    subdistrict: 'Khlong Tan Nuea',
    road: 'Sukhumvit Soi 63 (Ekkamai)',
    zipcode: '10110',
    lat: 13.7368,
    lng: 100.5892,
    type: 'Modern High-Rise'
  },
  {
    id: 'bkk-wth-012',
    name: 'Rhythm Ekkamai Estate',
    thaiName: 'ริทึ่ม เอกมัย เอสเตท',
    aliases: ['Rhythm Ekkamai', 'Rhythm Sukhumvit 63'],
    district: 'Watthana (Thonglor, Ekkamai, Phrom Phong)',
    subdistrict: 'Khlong Tan Nuea',
    road: 'Sukhumvit Soi 63',
    zipcode: '10110',
    lat: 13.7322,
    lng: 100.5872,
    type: 'High-Rise Condominium'
  },
  {
    id: 'bkk-wth-013',
    name: 'Ashton Asoke',
    thaiName: 'แอชตัน อโศก',
    aliases: ['Ashton Asok', 'Ashton Sukhumvit 21'],
    district: 'Watthana (Thonglor, Ekkamai, Phrom Phong)',
    subdistrict: 'Khlong Toei Nuea',
    road: 'Asoke Montri (Sukhumvit 21)',
    zipcode: '10110',
    lat: 13.7374,
    lng: 100.5613,
    type: 'Iconic Skyscraper Condo'
  },
  {
    id: 'bkk-wth-014',
    name: 'The Esse at Singha Complex',
    thaiName: 'ดิ เอส แอท สิงห์ คอมเพล็กซ์',
    aliases: ['Esse Singha Complex', 'The Esse Asoke'],
    district: 'Watthana (Thonglor, Ekkamai, Phrom Phong)',
    subdistrict: 'Khlong Toei Nuea',
    road: 'Asoke Montri / Phetchaburi',
    zipcode: '10110',
    lat: 13.7485,
    lng: 100.5638,
    type: 'Mixed-Use Luxury Condo'
  },
  {
    id: 'bkk-wth-015',
    name: 'Hyde Sukhumvit 11',
    thaiName: 'ไฮด์ สุขุมวิท 11',
    aliases: ['Hyde 11'],
    district: 'Watthana (Thonglor, Ekkamai, Phrom Phong)',
    subdistrict: 'Khlong Toei Nuea',
    road: 'Sukhumvit Soi 11',
    zipcode: '10110',
    lat: 13.7454,
    lng: 100.5562,
    type: 'High-Rise Luxury Condo'
  },
  {
    id: 'bkk-wth-016',
    name: 'Noble Remix (Thonglor)',
    thaiName: 'โนเบิล รีมิกซ์ ทองหล่อ',
    aliases: ['Noble Remix Sukhumvit 36'],
    district: 'Watthana (Thonglor, Ekkamai, Phrom Phong)',
    subdistrict: 'Khlong Tan',
    road: 'Sukhumvit Soi 36 (BTS Thong Lo)',
    zipcode: '10110',
    lat: 13.7241,
    lng: 100.5786,
    type: 'High-Rise Condominium'
  },

  // --- Khlong Toei (Phra Khanong, Asok) ---
  {
    id: 'bkk-klt-001',
    name: 'Millennium Residence (Sukhumvit 20)',
    thaiName: 'มิลเลนเนียม เรสซิเดนส์ สุขุมวิท 20',
    aliases: ['Millennium Residence Bangkok', 'Millennium Towers'],
    district: 'Khlong Toei (Phra Khanong, Asok)',
    subdistrict: 'Khlong Toei',
    road: 'Sukhumvit Soi 20',
    zipcode: '10110',
    lat: 13.7314,
    lng: 100.5627,
    type: 'Luxury Condominium Towers'
  },
  {
    id: 'bkk-klt-002',
    name: 'Park Origin Phrom Phong (Sukhumvit 24)',
    thaiName: 'พาร์ค ออริจิ้น พร้อมพงษ์ สุขุมวิท 24',
    aliases: ['Park 24', 'Origin Phrom Phong'],
    district: 'Khlong Toei (Phra Khanong, Asok)',
    subdistrict: 'Khlong Toei',
    road: 'Sukhumvit Soi 24',
    zipcode: '10110',
    lat: 13.7251,
    lng: 100.5678,
    type: 'High-Rise Urban Oasis'
  },
  {
    id: 'bkk-klt-003',
    name: 'The Emporio Place (Sukhumvit 24)',
    thaiName: 'ดิ เอ็มโพริโอ เพลส สุขุมวิท 24',
    aliases: ['Emporio Place 24'],
    district: 'Khlong Toei (Phra Khanong, Asok)',
    subdistrict: 'Khlong Toei',
    road: 'Sukhumvit Soi 24',
    zipcode: '10110',
    lat: 13.7225,
    lng: 100.5671,
    type: 'Luxury Condominium'
  },
  {
    id: 'bkk-klt-004',
    name: 'The Lumpini 24',
    thaiName: 'เดอะ ลุมพินี 24',
    aliases: ['Lumpini 24'],
    district: 'Khlong Toei (Phra Khanong, Asok)',
    subdistrict: 'Khlong Toei',
    road: 'Sukhumvit Soi 24',
    zipcode: '10110',
    lat: 13.7208,
    lng: 100.5663,
    type: 'High-Rise Condominium'
  },
  {
    id: 'bkk-klt-005',
    name: 'Rhythm Sukhumvit 36-38',
    thaiName: 'ริทึ่ม สุขุมวิท 36-38',
    aliases: ['Rhythm 36-38'],
    district: 'Khlong Toei (Phra Khanong, Asok)',
    subdistrict: 'Phra Khanong',
    road: 'Sukhumvit Soi 36',
    zipcode: '10110',
    lat: 13.7219,
    lng: 100.5772,
    type: 'Modern Condominium'
  },
  {
    id: 'bkk-klt-006',
    name: 'Rhythm Sukhumvit 42',
    thaiName: 'ริทึ่ม สุขุมวิท 42',
    aliases: ['Rhythm 42 Gateway'],
    district: 'Khlong Toei (Phra Khanong, Asok)',
    subdistrict: 'Phra Khanong',
    road: 'Sukhumvit Soi 42 (Gateway Ekkamai)',
    zipcode: '10110',
    lat: 13.7188,
    lng: 100.5847,
    type: 'High-Rise Residence'
  },
  {
    id: 'bkk-klt-007',
    name: 'WYNE by Sansiri (Phra Khanong)',
    thaiName: 'วายน์ บาย แสนสิริ พระโขนง',
    aliases: ['WYNE Sukhumvit', 'Wyne Phra Khanong'],
    district: 'Khlong Toei (Phra Khanong, Asok)',
    subdistrict: 'Phra Khanong',
    road: 'Sukhumvit Road (BTS Phra Khanong)',
    zipcode: '10110',
    lat: 13.7142,
    lng: 100.5925,
    type: 'Condominium'
  },
  {
    id: 'bkk-klt-008',
    name: 'Life Sukhumvit 48',
    thaiName: 'ไลฟ์ สุขุมวิท 48',
    aliases: ['Life 48'],
    district: 'Khlong Toei (Phra Khanong, Asok)',
    subdistrict: 'Phra Khanong',
    road: 'Sukhumvit Soi 48',
    zipcode: '10110',
    lat: 13.7107,
    lng: 100.5954,
    type: 'High-Rise Residence'
  },
  {
    id: 'bkk-klt-009',
    name: 'OKA Haus Sukhumvit 36',
    thaiName: 'โอกะ เฮ้าส์ สุขุมวิท 36',
    aliases: ['OKA Haus Sansiri'],
    district: 'Khlong Toei (Phra Khanong, Asok)',
    subdistrict: 'Khlong Toei',
    road: 'Rama 4 / Sukhumvit 36',
    zipcode: '10110',
    lat: 13.7161,
    lng: 100.5752,
    type: 'Resort Condominium'
  },
  {
    id: 'bkk-klt-010',
    name: 'The Room Sukhumvit 69',
    thaiName: 'เดอะ รูม สุขุมวิท 69',
    aliases: ['The Room 69'],
    district: 'Khlong Toei (Phra Khanong, Asok)',
    subdistrict: 'Phra Khanong',
    road: 'Sukhumvit Soi 69',
    zipcode: '10110',
    lat: 13.7145,
    lng: 100.5938,
    type: 'Luxury Condominium'
  },

  // --- Sathon (Sathorn, Chong Nonsi) ---
  {
    id: 'bkk-sth-001',
    name: 'Rhythm Sathorn',
    thaiName: 'ริทึ่ม สาทร',
    aliases: ['Rhythm Sathorn 21', 'Rhythm Taksin'],
    district: 'Sathon (Sathorn, Chong Nonsi)',
    subdistrict: 'Yan Nawa (Sathon)',
    road: 'Sathorn Soi 21 (Near BTS Saphan Taksin)',
    zipcode: '10120',
    lat: 13.7196,
    lng: 100.5183,
    type: 'Riverfront High-Rise'
  },
  {
    id: 'bkk-sth-002',
    name: 'Rhythm Sathorn-Narathiwas',
    thaiName: 'ริทึ่ม สาทร-นราธิวาส',
    aliases: ['Rhythm Naradhiwas'],
    district: 'Sathon (Sathorn, Chong Nonsi)',
    subdistrict: 'Thung Maha Mek',
    road: 'Naradhiwas Rajanagarindra Rd',
    zipcode: '10120',
    lat: 13.7198,
    lng: 100.5332,
    type: 'High-Rise Condominium'
  },
  {
    id: 'bkk-sth-003',
    name: 'The Met Sathorn',
    thaiName: 'เดอะ เม็ท สาทร',
    aliases: ['The Met South Sathorn'],
    district: 'Sathon (Sathorn, Chong Nonsi)',
    subdistrict: 'Thung Maha Mek',
    road: 'South Sathorn Road',
    zipcode: '10120',
    lat: 13.7223,
    lng: 100.5367,
    type: 'Iconic Skyscraper Residence'
  },
  {
    id: 'bkk-sth-004',
    name: 'The Sukhothai Residences',
    thaiName: 'เดอะ สุโขทัย เรสซิเด้นซ์',
    aliases: ['Sukhothai Residences Sathorn'],
    district: 'Sathon (Sathorn, Chong Nonsi)',
    subdistrict: 'Thung Maha Mek',
    road: 'South Sathorn Soi 3 (Suan Phlu)',
    zipcode: '10120',
    lat: 13.7235,
    lng: 100.5398,
    type: 'Super Luxury Landmark'
  },
  {
    id: 'bkk-sth-005',
    name: 'The Bangkok Sathon',
    thaiName: 'เดอะ แบงค็อค สาทร',
    aliases: ['The Bangkok Sathorn Surasak'],
    district: 'Sathon (Sathorn, Chong Nonsi)',
    subdistrict: 'Yan Nawa (Sathon)',
    road: 'South Sathorn Road (BTS Surasak)',
    zipcode: '10120',
    lat: 13.7191,
    lng: 100.5218,
    type: 'Luxury Condominium'
  },
  {
    id: 'bkk-sth-006',
    name: 'The Ritz-Carlton Residences (MahaNakhon)',
    thaiName: 'เดอะ ริทซ์-คาร์ลตัน เรสซิเดนเซส มหานคร',
    aliases: ['MahaNakhon Residences', 'King Power MahaNakhon'],
    district: 'Sathon (Sathorn, Chong Nonsi)',
    subdistrict: 'Silom / Chong Nonsi',
    road: 'Naradhiwas Rajanagarindra (BTS Chong Nonsi)',
    zipcode: '10500',
    lat: 13.7233,
    lng: 100.5283,
    type: 'World-Class Landmark'
  },
  {
    id: 'bkk-sth-007',
    name: 'Windshell Naradhiwas',
    thaiName: 'วินด์เชลล์ นราธิวาส',
    aliases: ['Windshell Sathorn'],
    district: 'Sathon (Sathorn, Chong Nonsi)',
    subdistrict: 'Chong Nonsi',
    road: 'Naradhiwas Rajanagarindra Rd',
    zipcode: '10120',
    lat: 13.7102,
    lng: 100.5385,
    type: 'Ultra Luxury Penthouse Villa'
  },
  {
    id: 'bkk-sth-008',
    name: 'Tait 12 Sathorn',
    thaiName: 'เทตต์ ทเวลฟ์ สาทร',
    aliases: ['Tait 12', 'Tait Sathorn 12'],
    district: 'Sathon (Sathorn, Chong Nonsi)',
    subdistrict: 'Silom',
    road: 'Sathorn Soi 12',
    zipcode: '10500',
    lat: 13.7217,
    lng: 100.5264,
    type: 'Luxury Modern High-Rise'
  },
  {
    id: 'bkk-sth-009',
    name: 'KnightsBridge Prime Sathorn',
    thaiName: 'ไนท์บริดจ์ ไพร์ม สาทร',
    aliases: ['Knightsbridge Sathorn'],
    district: 'Sathon (Sathorn, Chong Nonsi)',
    subdistrict: 'Thung Maha Mek',
    road: 'Naradhiwas Rajanagarindra Rd',
    zipcode: '10120',
    lat: 13.7176,
    lng: 100.5348,
    type: 'High-Rise Residence'
  },

  // --- Bang Rak (Silom, Surawong) ---
  {
    id: 'bkk-brk-001',
    name: 'Ashton Silom',
    thaiName: 'แอชตัน สีลม',
    aliases: ['Ashton Silom Soi 12'],
    district: 'Bang Rak (Silom, Surawong)',
    subdistrict: 'Suriyawong',
    road: 'Silom Road (Near Chong Nonsi)',
    zipcode: '10500',
    lat: 13.7262,
    lng: 100.5268,
    type: 'Super Luxury High-Rise'
  },
  {
    id: 'bkk-brk-002',
    name: 'Saladaeng One',
    thaiName: 'ศาลาแดง วัน',
    aliases: ['Saladaeng 1 Lumpini'],
    district: 'Bang Rak (Silom, Surawong)',
    subdistrict: 'Silom',
    road: 'Saladaeng Soi 1 (Rama 4)',
    zipcode: '10500',
    lat: 13.7268,
    lng: 100.5392,
    type: 'Super Luxury Lumpini Park'
  },
  {
    id: 'bkk-brk-003',
    name: 'Ideo Q Chula-Samyan',
    thaiName: 'ไอดีโอ คิว จุฬา-สามย่าน',
    aliases: ['Ideo Samyan', 'Ideo Chula'],
    district: 'Bang Rak (Silom, Surawong)',
    subdistrict: 'Maha Phruttharam',
    road: 'Rama 4 Road (MRT Sam Yan)',
    zipcode: '10500',
    lat: 13.7317,
    lng: 100.5288,
    type: 'High-Rise Condominium'
  },
  {
    id: 'bkk-brk-004',
    name: 'Triple Y Residence (Samyan Mitrtown)',
    thaiName: 'ทริปเปิ้ล วาย เรสซิเด้นซ์ สามย่านมิตรทาวน์',
    aliases: ['Triple Y Samyan', 'Samyan Mitrtown Residence'],
    district: 'Bang Rak (Silom, Surawong)',
    subdistrict: 'Wang Mai',
    road: 'Rama 4 / Phaya Thai Rd',
    zipcode: '10500',
    lat: 13.7338,
    lng: 100.5292,
    type: 'Modern Mixed-Use Residence'
  },
  {
    id: 'bkk-brk-005',
    name: 'Chapter Chula-Samyan',
    thaiName: 'แชปเตอร์ จุฬา-สามย่าน',
    aliases: ['Chapter Samyan'],
    district: 'Bang Rak (Silom, Surawong)',
    subdistrict: 'Si Phraya',
    road: 'Si Phraya Road',
    zipcode: '10500',
    lat: 13.7315,
    lng: 100.5246,
    type: 'Modern Condominium'
  },

  // --- Pathum Wan (Siam, Chidlom, Ploenchit) ---
  {
    id: 'bkk-ptw-001',
    name: '28 Chidlom',
    thaiName: 'ทเวนตี้เอต ชิดลม',
    aliases: ['28 Chidlom SC Asset', '28 Chitlom'],
    district: 'Pathum Wan (Siam, Chidlom, Ploenchit)',
    subdistrict: 'Lumphini',
    road: 'Chidlom Road',
    zipcode: '10330',
    lat: 13.7467,
    lng: 100.5435,
    type: 'Super Luxury Condominium'
  },
  {
    id: 'bkk-ptw-002',
    name: 'Q Chidlom-Phetchaburi',
    thaiName: 'คิว ชิดลม-เพชรบุรี',
    aliases: ['Q Chidlom', 'Q Chitlom'],
    district: 'Pathum Wan (Siam, Chidlom, Ploenchit)',
    subdistrict: 'Lumphini',
    road: 'Phetchaburi / Chidlom Rd',
    zipcode: '10330',
    lat: 13.7495,
    lng: 100.5448,
    type: 'High-Rise Residence'
  },
  {
    id: 'bkk-ptw-003',
    name: 'Noble Ploenchit',
    thaiName: 'โนเบิล เพลินจิต',
    aliases: ['Noble Ploenchit BTS', 'Noble Phloen Chit'],
    district: 'Pathum Wan (Siam, Chidlom, Ploenchit)',
    subdistrict: 'Lumphini',
    road: 'Ploenchit Road',
    zipcode: '10330',
    lat: 13.7433,
    lng: 100.5471,
    type: 'Direct BTS Skywalk Residence'
  },
  {
    id: 'bkk-ptw-004',
    name: '98 Wireless',
    thaiName: '๙๘ ไวร์เลส',
    aliases: ['98 Wireless Sansiri', '98 Witthayu'],
    district: 'Pathum Wan (Siam, Chidlom, Ploenchit)',
    subdistrict: 'Lumphini',
    road: 'Wireless Road (Witthayu)',
    zipcode: '10330',
    lat: 13.7412,
    lng: 100.5463,
    type: 'Thailand Flagship Flagship Luxury'
  },
  {
    id: 'bkk-ptw-005',
    name: 'Sindhorn Village / Sindhorn Tonson',
    thaiName: 'สินธร วิลเลจ / สินธร ต้นสน',
    aliases: ['Sindhorn Residence Langsuan', 'Sindhorn Tonson'],
    district: 'Pathum Wan (Siam, Chidlom, Ploenchit)',
    subdistrict: 'Lumphini',
    road: 'Langsuan / Soi Tonson',
    zipcode: '10330',
    lat: 13.7368,
    lng: 100.5428,
    type: 'Luxury Parkside Enclave'
  },
  {
    id: 'bkk-ptw-006',
    name: 'Life One Wireless',
    thaiName: 'ไลฟ์ วัน ไวร์เลส',
    aliases: ['Life Wireless', 'Life One Witthayu'],
    district: 'Pathum Wan (Siam, Chidlom, Ploenchit)',
    subdistrict: 'Lumphini',
    road: 'Wireless Road',
    zipcode: '10330',
    lat: 13.7478,
    lng: 100.5492,
    type: 'High-Rise Residence'
  },
  {
    id: 'bkk-ptw-007',
    name: 'Wish Signature Midtown Siam',
    thaiName: 'วิช ซิกเนเจอร์ มิดทาวน์ สยาม',
    aliases: ['Wish Signature Siam'],
    district: 'Pathum Wan (Siam, Chidlom, Ploenchit)',
    subdistrict: 'Thanon Phetchaburi',
    road: 'Phetchaburi Soi 20 (Near Siam Paragon)',
    zipcode: '10400',
    lat: 13.7516,
    lng: 100.5342,
    type: 'High-Rise Condominium'
  },

  // --- Phaya Thai (Ari, Sanam Pao) ---
  {
    id: 'bkk-pyt-001',
    name: 'The Monument Sanam Pao',
    thaiName: 'เดอะ โมนูเมนต์ สนามเป้า',
    aliases: ['Monument Sanampao', 'Monument BTS Sanam Pao'],
    district: 'Phaya Thai (Ari, Sanam Pao)',
    subdistrict: 'Samsen Nai',
    road: 'Phaholyothin Road',
    zipcode: '10400',
    lat: 13.7718,
    lng: 100.5414,
    type: 'Super Luxury Residence'
  },
  {
    id: 'bkk-pyt-002',
    name: 'Rhythm Phahon-Ari',
    thaiName: 'ริทึ่ม พหล-อารีย์',
    aliases: ['Rhythm Ari', 'Rhythm Phaholyothin'],
    district: 'Phaya Thai (Ari, Sanam Pao)',
    subdistrict: 'Samsen Nai',
    road: 'Phaholyothin Road (Near BTS Saphan Khwai)',
    zipcode: '10400',
    lat: 13.7885,
    lng: 100.5489,
    type: 'High-Rise Condominium'
  },
  {
    id: 'bkk-pyt-003',
    name: 'Noble Around Ari',
    thaiName: 'โนเบิล อราวน์ อารีย์',
    aliases: ['Noble Ari BTS', 'Around Ari'],
    district: 'Phaya Thai (Ari, Sanam Pao)',
    subdistrict: 'Samsen Nai',
    road: 'Phaholyothin Soi 7 (Ari)',
    zipcode: '10400',
    lat: 13.7797,
    lng: 100.5448,
    type: 'Modern High-Rise'
  },
  {
    id: 'bkk-pyt-004',
    name: 'Noble Reform (Ari)',
    thaiName: 'โนเบิล รีฟอร์ม อารีย์',
    aliases: ['Noble Reform Soi Ari'],
    district: 'Phaya Thai (Ari, Sanam Pao)',
    subdistrict: 'Samsen Nai',
    road: 'Phaholyothin Soi 7',
    zipcode: '10400',
    lat: 13.7803,
    lng: 100.5441,
    type: 'High-End Condominium'
  },
  {
    id: 'bkk-pyt-005',
    name: 'Centric Ari Station',
    thaiName: 'เซ็นทริค อารีย์ สเตชั่น',
    aliases: ['Centric Ari'],
    district: 'Phaya Thai (Ari, Sanam Pao)',
    subdistrict: 'Samsen Nai',
    road: 'Soi Ari 1 (Phaholyothin)',
    zipcode: '10400',
    lat: 13.7788,
    lng: 100.5427,
    type: 'High-Rise Condominium'
  },

  // --- Huai Khwang (Ratchada, Rama 9) ---
  {
    id: 'bkk-hkw-001',
    name: 'Life Asoke-Rama 9',
    thaiName: 'ไลฟ์ อโศก-พระราม 9',
    aliases: ['Life Asoke Rama 9', 'Life Rama 9'],
    district: 'Huai Khwang (Ratchada, Rama 9)',
    subdistrict: 'Bangkapi / Huai Khwang',
    road: 'Asoke-Din Daeng / Rama 9',
    zipcode: '10310',
    lat: 13.7547,
    lng: 100.5645,
    type: 'High-Rise Urban Residence'
  },
  {
    id: 'bkk-hkw-002',
    name: 'Ideo Rama 9 - Asoke',
    thaiName: 'ไอดีโอ พระราม 9 - อโศก',
    aliases: ['Ideo Rama 9', 'Ideo New Rama 9'],
    district: 'Huai Khwang (Ratchada, Rama 9)',
    subdistrict: 'Huai Khwang',
    road: 'Rama 9 Road (Near MRT Phra Ram 9)',
    zipcode: '10310',
    lat: 13.7562,
    lng: 100.5692,
    type: 'High-Rise Residence'
  },
  {
    id: 'bkk-hkw-003',
    name: 'Belle Grand Rama 9',
    thaiName: 'เบลล์ แกรนด์ พระราม 9',
    aliases: ['The Shoppes at Belle', 'Belle Rama 9 Towers'],
    district: 'Huai Khwang (Ratchada, Rama 9)',
    subdistrict: 'Huai Khwang',
    road: 'Rama 9 Soi 7 (Behind Central Rama 9)',
    zipcode: '10310',
    lat: 13.7601,
    lng: 100.5708,
    type: 'Large Condominium Complex'
  },
  {
    id: 'bkk-hkw-004',
    name: 'Ashton Asoke-Rama 9',
    thaiName: 'แอชตัน อโศก-พระราม 9',
    aliases: ['Ashton Rama 9', 'Ashton Corner Rama 9'],
    district: 'Huai Khwang (Ratchada, Rama 9)',
    subdistrict: 'Huai Khwang',
    road: 'Corner of Asoke-Din Daeng and Ratchada',
    zipcode: '10310',
    lat: 13.7554,
    lng: 100.5658,
    type: 'Super Luxury Skyscraper'
  },
  {
    id: 'bkk-hkw-005',
    name: 'Noble Revolve Ratchada',
    thaiName: 'โนเบิล รีวอลฟ์ รัชดา',
    aliases: ['Noble Revolve 1 & 2', 'Revolve Ratchada'],
    district: 'Huai Khwang (Ratchada, Rama 9)',
    subdistrict: 'Huai Khwang',
    road: 'Ratchadaphisek Soi 6 (MRT Thailand Cultural Centre)',
    zipcode: '10310',
    lat: 13.7654,
    lng: 100.5701,
    type: 'High-Rise Condominium'
  },
  {
    id: 'bkk-hkw-006',
    name: 'One9Five Asoke-Rama 9',
    thaiName: 'วันไนน์ไฟว์ อโศก-พระราม 9',
    aliases: ['One 9 Five', 'TC Green Rama 9'],
    district: 'Huai Khwang (Ratchada, Rama 9)',
    subdistrict: 'Huai Khwang',
    road: 'Rama 9 Soi 5',
    zipcode: '10310',
    lat: 13.7569,
    lng: 100.5721,
    type: 'Luxury Twin Towers'
  },

  // --- Chatuchak (Mo Chit, Lat Phrao) ---
  {
    id: 'bkk-ctc-001',
    name: 'The Line Jatujak-Mochit',
    thaiName: 'เดอะ ไลน์ จตุจักร-หมอชิต',
    aliases: ['The Line Mochit', 'The Line Chatuchak'],
    district: 'Chatuchak (Mo Chit, Lat Phrao)',
    subdistrict: 'Chatuchak',
    road: 'Phaholyothin Road (Opposite Chatuchak Park)',
    zipcode: '10900',
    lat: 13.8048,
    lng: 100.5552,
    type: 'High-Rise Park View'
  },
  {
    id: 'bkk-ctc-002',
    name: 'Life Ladprao',
    thaiName: 'ไลฟ์ ลาดพร้าว',
    aliases: ['Life Lat Phrao', 'Life Opposite Central Ladprao'],
    district: 'Chatuchak (Mo Chit, Lat Phrao)',
    subdistrict: 'Chomphon',
    road: 'Phaholyothin Road (Opposite Central Plaza Ladprao)',
    zipcode: '10900',
    lat: 13.8172,
    lng: 100.5604,
    type: 'High-Rise Condominium'
  },
  {
    id: 'bkk-ctc-003',
    name: 'Life Ladprao Valley',
    thaiName: 'ไลฟ์ ลาดพร้าว แวลลีย์',
    aliases: ['Ladprao Valley'],
    district: 'Chatuchak (Mo Chit, Lat Phrao)',
    subdistrict: 'Chomphon',
    road: 'Phaholyothin Road (BTS Ha Yaek Lat Phrao)',
    zipcode: '10900',
    lat: 13.8184,
    lng: 100.5611,
    type: 'Resort High-Rise'
  },
  {
    id: 'bkk-ctc-004',
    name: 'Equinox Phahol-Vibha',
    thaiName: 'อีควิน็อกซ์ พหล-วิภา',
    aliases: ['Equinox Phaholyothin'],
    district: 'Chatuchak (Mo Chit, Lat Phrao)',
    subdistrict: 'Chomphon',
    road: 'Vibhavadi Rangsit / Phaholyothin',
    zipcode: '10900',
    lat: 13.8089,
    lng: 100.5583,
    type: 'Mixed-Use Residence'
  },
  {
    id: 'bkk-ctc-005',
    name: 'M Jatujak',
    thaiName: 'เอ็ม จตุจักร',
    aliases: ['M Chatuchak'],
    district: 'Chatuchak (Mo Chit, Lat Phrao)',
    subdistrict: 'Chomphon',
    road: 'Phaholyothin Soi 18',
    zipcode: '10900',
    lat: 13.7997,
    lng: 100.5524,
    type: 'Pet-Friendly Residence'
  },

  // --- Din Daeng ---
  {
    id: 'bkk-ddg-001',
    name: 'Rhythm Rangnam',
    thaiName: 'ริทึ่ม รางน้ำ',
    aliases: ['Rhythm Rang Nam BTS Victory Monument'],
    district: 'Din Daeng',
    subdistrict: 'Thanon Phaya Thai / Din Daeng',
    road: 'Soi Rangnam',
    zipcode: '10400',
    lat: 13.7607,
    lng: 100.5388,
    type: 'High-Rise Condominium'
  },
  {
    id: 'bkk-ddg-002',
    name: 'Ideo Q Victory',
    thaiName: 'ไอดีโอ คิว วิคตอรี',
    aliases: ['Ideo Victory Monument'],
    district: 'Din Daeng',
    subdistrict: 'Thanon Phaya Thai',
    road: 'Phaholyothin Road (BTS Victory Monument)',
    zipcode: '10400',
    lat: 13.7634,
    lng: 100.5375,
    type: 'Modern Skyscraper'
  },
  {
    id: 'bkk-ddg-003',
    name: 'Maestro 03 Ratchada-Rama 9',
    thaiName: 'มาเอสโตร 03 รัชดา-พระราม 9',
    aliases: ['Maestro 03'],
    district: 'Din Daeng',
    subdistrict: 'Din Daeng',
    road: 'Ratchadaphisek Soi 3',
    zipcode: '10400',
    lat: 13.7638,
    lng: 100.5661,
    type: 'Low-Rise European Style'
  },

  // --- Yan Nawa (Rama 3) ---
  {
    id: 'bkk-ynw-001',
    name: 'Canapaya Residences (Rama 3)',
    thaiName: 'คณาพญา เรสซิเดนซ์ พระราม 3',
    aliases: ['Canapaya Rama 3 Riverfront', 'Canapaya'],
    district: 'Yan Nawa (Rama 3)',
    subdistrict: 'Bang Khlo',
    road: 'Rama 3 Road',
    zipcode: '10120',
    lat: 13.6891,
    lng: 100.5134,
    type: 'Super Luxury Riverfront'
  },
  {
    id: 'bkk-ynw-002',
    name: 'Star View Rama 3',
    thaiName: 'สตาร์ วิว พระราม 3',
    aliases: ['StarView Rama 3'],
    district: 'Yan Nawa (Rama 3)',
    subdistrict: 'Bang Khlo',
    road: 'Rama 3 Road (Chao Phraya Riverfront)',
    zipcode: '10120',
    lat: 13.6882,
    lng: 100.5186,
    type: 'Twin Skywalk River Residences'
  },
  {
    id: 'bkk-ynw-003',
    name: 'The Pano Rama 3',
    thaiName: 'เดอะ พาโน พระราม 3',
    aliases: ['The Pano Riverside'],
    district: 'Yan Nawa (Rama 3)',
    subdistrict: 'Bang Phongphang',
    road: 'Rama 3 Road',
    zipcode: '10120',
    lat: 13.6784,
    lng: 100.5361,
    type: 'High-Rise Riverfront'
  },
  {
    id: 'bkk-ynw-004',
    name: 'Lumpini Park Riverside Rama 3',
    thaiName: 'ลุมพินี พาร์ค ริเวอร์ไซด์ พระราม 3',
    aliases: ['LPN Riverside Rama 3'],
    district: 'Yan Nawa (Rama 3)',
    subdistrict: 'Bang Phongphang',
    road: 'Rama 3 Road',
    zipcode: '10120',
    lat: 13.6805,
    lng: 100.5338,
    type: 'Riverside Community'
  },

  // --- Phra Nakhon ---
  {
    id: 'bkk-pnk-001',
    name: 'The Raweekanlaya Bangkok',
    thaiName: 'เดอะ ระวิกัลยา แบงค็อก',
    aliases: ['Raweekanlaya Residence', 'Historic Residence Dusit'],
    district: 'Phra Nakhon',
    subdistrict: 'Wat Sommanat / Dusit',
    road: 'Krung Kasem Road',
    zipcode: '10200',
    lat: 13.7645,
    lng: 100.5058,
    type: 'Heritage Landmark Residence'
  },
  {
    id: 'bkk-pnk-002',
    name: 'Chakrabongse Villas',
    thaiName: 'จักรพงษ์ วิลล่า',
    aliases: ['Chakrabongse Palace Villas'],
    district: 'Phra Nakhon',
    subdistrict: 'Phra Borom Maha Ratchawang',
    road: 'Maha Rat Road (Wat Pho Riverfront)',
    zipcode: '10200',
    lat: 13.7441,
    lng: 100.4934,
    type: 'Chao Phraya Historic Villas'
  },
  // --- Housing Estates, Moobans & Villas (Bangkok) ---
  {
    id: 'bkk-hse-001',
    name: 'Baan Sansiri Sukhumvit 67',
    thaiName: 'บ้าน แสนสิริ สุขุมวิท 67',
    aliases: ['Baan Sansiri 67', 'Sansiri 67 Villa'],
    district: 'Watthana (Thonglor, Ekkamai, Phrom Phong)',
    subdistrict: 'Phra Khanong Nuea',
    road: 'Sukhumvit Soi 67',
    zipcode: '10110',
    lat: 13.7198,
    lng: 100.5912,
    type: 'Luxury House / Villa Estate'
  },
  {
    id: 'bkk-hse-002',
    name: 'Setthasiri Krungthep Kreetha',
    thaiName: 'เศรษฐสิริ กรุงเทพกรีฑา',
    aliases: ['Setthasiri Kreetha', 'Setthasiri House'],
    district: 'Bang Kapi',
    subdistrict: 'Hua Mak',
    road: 'Krungthep Kreetha Road',
    zipcode: '10240',
    lat: 13.7485,
    lng: 100.6723,
    type: 'Single Detached House Estate'
  },
  {
    id: 'bkk-hse-003',
    name: 'Narasiri Pattanakarn',
    thaiName: 'นาราสิริ พัฒนาการ',
    aliases: ['Narasiri House', 'Narasiri Residence'],
    district: 'Suan Luang',
    subdistrict: 'Suan Luang',
    road: 'Pattanakarn Soi 78',
    zipcode: '10250',
    lat: 13.7265,
    lng: 100.6482,
    type: 'Super Luxury Housing Estate'
  },
  {
    id: 'bkk-hse-004',
    name: 'The City Sukhumvit 67',
    thaiName: 'เดอะ ซิตี้ สุขุมวิท 67',
    aliases: ['The City 67', 'The City Ekkamai'],
    district: 'Watthana (Thonglor, Ekkamai, Phrom Phong)',
    subdistrict: 'Phra Khanong Nuea',
    road: 'Sukhumvit Soi 67',
    zipcode: '10110',
    lat: 13.7202,
    lng: 100.5925,
    type: 'Luxury Residence Villa'
  },
  {
    id: 'bkk-hse-005',
    name: 'Baan Siri Silom',
    thaiName: 'บ้าน สิริ สีลม',
    aliases: ['Baan Siri Condo', 'Siri Silom'],
    district: 'Bang Rak (Silom, Surawong)',
    subdistrict: 'Si Lom',
    road: 'Silom Soi 3 (Soi Phiphat)',
    zipcode: '10500',
    lat: 13.7251,
    lng: 100.5312,
    type: 'Prime Residence'
  },
  {
    id: 'bkk-hse-006',
    name: 'Baan Siri Sathorn',
    thaiName: 'บ้าน สิริ สาทร',
    aliases: ['Baan Siri Sathorn Soi 1', 'Siri Sathorn'],
    district: 'Sathon (Sathorn, Chong Nonsi)',
    subdistrict: 'Thung Maha Mek',
    road: 'Sathorn Soi 1 (Soi Attakarn Prasit)',
    zipcode: '10120',
    lat: 13.7218,
    lng: 100.5421,
    type: 'Boutique Residence'
  },
  {
    id: 'bkk-hse-007',
    name: 'Sindhorn Residence',
    thaiName: 'สินธร เรสซิเดนซ์',
    aliases: ['Sindhorn Village', 'Sindhorn Kempinski Area'],
    district: 'Pathum Wan (Siam, Chidlom, Ploenchit)',
    subdistrict: 'Lumphini',
    road: 'Soi Tonson, Ploenchit Road',
    zipcode: '10330',
    lat: 13.7378,
    lng: 100.5432,
    type: 'Super Luxury Residence'
  },
  {
    id: 'bkk-hse-008',
    name: 'Grand Crystal Ekkamai-Ramintra',
    thaiName: 'แกรนด์ คริสตัล เอกมัย-รามอินทรา',
    aliases: ['Grand Crystal House', 'Crystal Park Residence'],
    district: 'Lat Phrao',
    subdistrict: 'Lat Phrao',
    road: 'Pradit Manutham Road',
    zipcode: '10230',
    lat: 13.8055,
    lng: 100.6288,
    type: 'Ultra Luxury Mooban Estate'
  },
  // --- Pattaya Condominiums, Hotels & Residences ---
  {
    id: 'pty-res-001',
    name: 'The Riviera Wongamat Beach',
    thaiName: 'เดอะ ริเวียร่า วงศ์อมาตย์',
    aliases: ['Riviera Wongamat', 'Riviera Pattaya'],
    district: 'Bang Lamung',
    subdistrict: 'Wongamat Beach',
    road: 'Naklua Soi 16',
    zipcode: '20150',
    lat: 12.9642,
    lng: 100.8845,
    type: 'Luxury Beachfront Condominium',
    city: 'Pattaya'
  },
  {
    id: 'pty-res-002',
    name: 'The Riviera Jomtien',
    thaiName: 'เดอะ ริเวียร่า จอมเทียน',
    aliases: ['Riviera Jomtien', 'Riviera Beach Jomtien'],
    district: 'Bang Lamung',
    subdistrict: 'Jomtien Beach',
    road: 'Jomtien 2nd Road',
    zipcode: '20150',
    lat: 12.8872,
    lng: 100.8812,
    type: 'Luxury High-Rise Residence',
    city: 'Pattaya'
  },
  {
    id: 'pty-res-003',
    name: 'Unixx South Pattaya',
    thaiName: 'ยูนิกซ์ พัทยาใต้',
    aliases: ['Unixx Condo', 'Unixx Pratumnak'],
    district: 'Bang Lamung',
    subdistrict: 'South Pattaya / Walking St',
    road: 'Pratumnak Road (Khao Phra Tamnak)',
    zipcode: '20150',
    lat: 12.9218,
    lng: 100.8695,
    type: 'Modern High-Rise Condominium',
    city: 'Pattaya'
  },
  {
    id: 'pty-res-004',
    name: 'Copacabana Beach Jomtien',
    thaiName: 'โคปาคาบาน่า บีช จอมเทียน',
    aliases: ['Copacabana Jomtien', 'Copacabana Condo'],
    district: 'Bang Lamung',
    subdistrict: 'Jomtien Beach',
    road: 'Jomtien Beach Road',
    zipcode: '20150',
    lat: 12.8945,
    lng: 100.8762,
    type: 'Beachfront High-Rise Resort',
    city: 'Pattaya'
  },
  {
    id: 'pty-res-005',
    name: 'Grande Centre Point Pattaya',
    thaiName: 'แกรนด์ เซนเตอร์ พอยต์ พัทยา',
    aliases: ['Grande Centre Point Terminal 21 Pattaya', 'Terminal 21 Hotel Pattaya'],
    district: 'Bang Lamung',
    subdistrict: 'Central Pattaya / Beach Rd',
    road: 'North Pattaya Road (Terminal 21)',
    zipcode: '20150',
    lat: 12.9501,
    lng: 100.8905,
    type: 'Luxury Hotel & Landmark Residence',
    city: 'Pattaya'
  },
  {
    id: 'pty-res-006',
    name: 'Centara Grand Mirage Beach Resort',
    thaiName: 'เซ็นทารา แกรนด์ มิราจ บีช รีสอร์ท',
    aliases: ['Centara Mirage Pattaya', 'Centara Grand Pattaya'],
    district: 'Bang Lamung',
    subdistrict: 'Wongamat Beach',
    road: 'Naklua Soi 18',
    zipcode: '20150',
    lat: 12.9592,
    lng: 100.8841,
    type: '5-Star Beach Resort',
    city: 'Pattaya'
  },
  {
    id: 'pty-res-007',
    name: 'Andromeda Condominium Pattaya',
    thaiName: 'แอนโดรเมดา คอนโดมิเนียม พัทยา',
    aliases: ['Andromeda Pratumnak', 'Andromeda Condo'],
    district: 'Bang Lamung',
    subdistrict: 'Pratumnak Hill',
    road: 'Kasetsin Soi 9, Cozy Beach',
    zipcode: '20150',
    lat: 12.9195,
    lng: 100.8612,
    type: 'Super Luxury Condominium',
    city: 'Pattaya'
  },
  // --- Popular Single Detached Houses, Moobans & Housing Estates ---
  {
    id: 'bkk-hse-009',
    name: 'Centro Rama 9 - Motorway',
    thaiName: 'เซนโทร พระราม 9 - มอเตอร์เวย์',
    aliases: ['Centro Rama 9', 'Centro Motorway', 'Centro Rama IX', 'Centro พระราม 9'],
    district: 'Lat Krabang',
    subdistrict: 'Khlong Song Ton Nun',
    road: 'Phatthana Chonnabot 4 Road',
    zipcode: '10520',
    lat: 13.7382,
    lng: 100.7210,
    type: 'Single Detached House Estate'
  },
  {
    id: 'bkk-hse-010',
    name: 'Centro Rama 9',
    thaiName: 'เซนโทร พระราม 9',
    aliases: ['Centro Rama 9 House', 'Centro Rama IX', 'Centro พระราม 9'],
    district: 'Lat Krabang',
    subdistrict: 'Khlong Song Ton Nun',
    road: 'Phatthana Chonnabot 4 Road',
    zipcode: '10520',
    lat: 13.7382,
    lng: 100.7210,
    type: 'Single Detached House Estate'
  },
  {
    id: 'bkk-hse-010-b',
    name: 'Centro Rama 9 - Krungthep Kreetha',
    thaiName: 'เซนโทร พระราม 9 - กรุงเทพกรีฑา',
    aliases: ['Centro Krungthep Kreetha', 'Centro กรุงเทพกรีฑา'],
    district: 'Saphan Sung',
    subdistrict: 'Saphan Sung',
    road: 'Krungthep Kreetha Road',
    zipcode: '10240',
    lat: 13.7450,
    lng: 100.6850,
    type: 'Single Detached House Estate'
  },
  {
    id: 'bkk-hse-011',
    name: 'The City Rama 9 - Ramkhamhaeng',
    thaiName: 'เดอะ ซิตี้ พระราม 9 - รามคำแหง',
    aliases: ['The City Rama 9', 'The City Ramkhamhaeng', 'The City พระราม 9'],
    district: 'Bang Kapi',
    subdistrict: 'Hua Mak',
    road: 'Ramkhamhaeng - Rama 9 Road',
    zipcode: '10240',
    lat: 13.7550,
    lng: 100.6210,
    type: 'Luxury House Estate'
  },
  {
    id: 'bkk-hse-012',
    name: 'Centro Bangna',
    thaiName: 'เซนโทร บางนา',
    aliases: ['Centro Bangna-KM7'],
    district: 'Bang Na',
    subdistrict: 'Bang Na',
    road: 'Bangna-Trat Road',
    zipcode: '10260',
    lat: 13.6520,
    lng: 100.6720,
    type: 'Single Detached House Estate'
  },
  {
    id: 'bkk-hse-013',
    name: 'Centro Ratchapruek',
    thaiName: 'เซนโทร ราชพฤกษ์',
    aliases: ['Centro Ratchaphruek'],
    district: 'Taling Chan',
    subdistrict: 'Taling Chan',
    road: 'Ratchapruek Road',
    zipcode: '10170',
    lat: 13.7820,
    lng: 100.4510,
    type: 'Single Detached House Estate'
  },
  {
    id: 'bkk-hse-014',
    name: 'Bangkok Boulevard Rama 9',
    thaiName: 'บางกอก บูเลอวาร์ด พระราม 9',
    aliases: ['Bangkok Boulevard Rama IX', 'SC Asset Rama 9'],
    district: 'Saphan Sung',
    subdistrict: 'Saphan Sung',
    road: 'Krungthep Kreetha Road',
    zipcode: '10240',
    lat: 13.7480,
    lng: 100.6880,
    type: 'Luxury Housing Estate'
  },
  {
    id: 'bkk-hse-015',
    name: 'Nantawan Rama 9',
    thaiName: 'นันทวัน พระราม 9',
    aliases: ['Nantawan Rama IX', 'LH Rama 9', 'Nantawan Krungthep Kreetha'],
    district: 'Saphan Sung',
    subdistrict: 'Saphan Sung',
    road: 'Krungthep Kreetha Road',
    zipcode: '10240',
    lat: 13.7490,
    lng: 100.6890,
    type: 'Ultra Luxury Single House'
  },
  {
    id: 'bkk-hse-016',
    name: 'Setthasiri Rama 9',
    thaiName: 'เศรษฐสิริ พระราม 9',
    aliases: ['Setthasiri Rama IX', 'Setthasiri Srinakarin', 'Setthasiri Krungthep Kreetha'],
    district: 'Saphan Sung',
    subdistrict: 'Saphan Sung',
    road: 'Krungthep Kreetha Road',
    zipcode: '10240',
    lat: 13.7475,
    lng: 100.6865,
    type: 'Luxury Single House Estate'
  },
  {
    id: 'bkk-com-001',
    name: 'CentralPlaza Grand Rama 9',
    thaiName: 'เซ็นทรัลพลาซา แกรนด์ พระราม 9',
    aliases: ['Central Rama 9', 'Central พระราม 9'],
    district: 'Huai Khwang (Ratchada, Rama 9)',
    subdistrict: 'Huai Khwang',
    road: 'Ratchadaphisek / Rama 9 Road',
    zipcode: '10310',
    lat: 13.7583,
    lng: 100.5664,
    type: 'Shopping Complex & Landmark'
  }
];

// Map any free-form query or address string to the correct BANGKOK_DISTRICTS item
export function matchDistrictFromText(text) {
  if (!text || typeof text !== 'string') return null;
  const q = text.toLowerCase();

  // Priority 1: Outer & Eastern districts that use "Rama 9" in estate marketing names
  if (q.includes('lat krabang') || q.includes('ลาดกระบัง') || q.includes('motorway') || q.includes('มอเตอร์เวย์') || 
      q.includes('chonnabot') || q.includes('พัฒนาชนบท') || q.includes('suvarnabhumi') || q.includes('สุวรรณภูมิ') ||
      q.includes('centro rama 9') || q.includes('centro rama ix') || q.includes('klong song ton nun') ||
      q.includes('khlong song ton nun') || q.includes('lam pla thio') || q.includes('thap yao') || q.includes('khum thong')) {
    return 'Lat Krabang';
  }
  if (q.includes('saphan sung') || q.includes('สะพานสูง') || q.includes('krungthep kreetha') || q.includes('กรุงเทพกรีฑา') ||
      q.includes('bangkok boulevard rama 9') || q.includes('nantawan rama 9') || q.includes('setthasiri rama 9')) {
    return 'Saphan Sung';
  }
  if (q.includes('bang kapi') || q.includes('bangkapi') || q.includes('บางกะปิ') || q.includes('ramkhamhaeng') || 
      q.includes('รามคำแหง') || q.includes('hua mak') || q.includes('หัวหมาก') || q.includes('the city rama 9')) {
    return 'Bang Kapi';
  }
  if (q.includes('suan luang') || q.includes('suanluang') || q.includes('สวนหลวง') || q.includes('pattanakarn') || 
      q.includes('พัฒนาการ') || q.includes('on nut 17') || q.includes('on nut 39') || q.includes('rama 9 - srinakarin') || 
      q.includes('srinakarin - rama 9')) {
    return 'Suan Luang';
  }
  if (q.includes('prawet') || q.includes('ประเวศ') || q.includes('srinakarin') || q.includes('dokmai') || q.includes('nong bon')) {
    return 'Prawet';
  }

  // Core Bangkok Districts
  if (q.includes('watthana') || q.includes('vadhana') || q.includes('วัฒนา') || q.includes('thonglor') || q.includes('thong lo') || 
      q.includes('ทองหล่อ') || q.includes('ekkamai') || q.includes('ekamai') || q.includes('เอกมัย') || 
      q.includes('phrom phong') || q.includes('promphong') || q.includes('พร้อมพงษ์') ||
      q.includes('sukhumvit 39') || q.includes('sukhumvit 55') || q.includes('sukhumvit 63')) {
    return 'Watthana';
  }
  if (q.includes('khlong toei') || q.includes('klong toey') || q.includes('klongtoey') || q.includes('คลองเตย') ||
      q.includes('phra khanong') || q.includes('prakhanong') || q.includes('asok') || q.includes('asoke') || q.includes('อโศก') ||
      q.includes('sukhumvit 20') || q.includes('sukhumvit 22') || q.includes('sukhumvit 24') || 
      q.includes('sukhumvit 42') || q.includes('sukhumvit 48')) {
    return 'Khlong Toei';
  }
  if (q.includes('bang rak') || q.includes('bangrak') || q.includes('บางรัก') || q.includes('silom') || q.includes('สีลม') || 
      q.includes('surawong') || q.includes('สุรวงศ์') || q.includes('samyan') || q.includes('sam yan') || q.includes('สามย่าน') || q.includes('chula')) {
    return 'Bang Rak';
  }
  if (q.includes('sathon') || q.includes('sathorn') || q.includes('สาทร') || q.includes('chong nonsi') || q.includes('chongnonsi') || 
      q.includes('naradhiwas') || q.includes('suanphlu') || q.includes('suan plue') || q.includes('taksin')) {
    return 'Sathon';
  }
  if (q.includes('pathum wan') || q.includes('pathumwan') || q.includes('ปทุมวัน') || q.includes('siam') || q.includes('สยาม') || 
      q.includes('chidlom') || q.includes('chit lom') || q.includes('ชิดลม') || q.includes('ploenchit') || q.includes('ploen chit') || 
      q.includes('wireless') || q.includes('witthayu') || q.includes('langsuan') || q.includes('lang suan') || q.includes('หลังสวน')) {
    return 'Pathum Wan';
  }
  if (q.includes('phaya thai') || q.includes('phayathai') || q.includes('พญาไท') || q.includes('ari') || q.includes('aree') || 
      q.includes('อารีย์') || q.includes('sanam pao') || q.includes('sanampao') || q.includes('saphan khwai') || q.includes('สะพานควาย')) {
    return 'Phaya Thai';
  }
  if (q.includes('huai khwang') || q.includes('huaikhwang') || q.includes('ห้วยขวาง') || q.includes('ratchada') || 
      q.includes('ratchadaphisek') || q.includes('รัชดา') || q.includes('rama 9') || q.includes('rama ix') || q.includes('phra ram 9') ||
      q.includes('pracha uthit') || q.includes('tian ruam mit') || q.includes('meng jai') || q.includes('fortune') || 
      q.includes('central rama 9') || q.includes('mrt rama 9') || q.includes('belle grand rama 9')) {
    return 'Huai Khwang';
  }
  if (q.includes('chatuchak') || q.includes('jatujak') || q.includes('จตุจักร') || q.includes('mo chit') || q.includes('mochit') || 
      q.includes('lat phrao') || q.includes('ladprao') || q.includes('kaset') || q.includes('vibhavadi')) {
    return 'Chatuchak';
  }
  if (q.includes('din daeng') || q.includes('dindaeng') || q.includes('ดินแดง') || q.includes('rangnam') || q.includes('rang nam') || 
      q.includes('victory monument') || q.includes('prachasongkhro')) {
    return 'Din Daeng';
  }
  if (q.includes('yan nawa') || q.includes('yannawa') || q.includes('ยานนาวา') || q.includes('rama 3') || q.includes('rama iii') || 
      q.includes('bang khlo') || q.includes('bang phongphang') || q.includes('sathu prantit')) {
    return 'Yan Nawa';
  }
  if (q.includes('bang na') || q.includes('bangna') || q.includes('บางนา') || q.includes('bearing') || q.includes('lasalle') || q.includes('sanphawut')) {
    return 'Bang Na';
  }
  if (q.includes('ratchathewi') || q.includes('ราชเทวี') || q.includes('pratunam') || q.includes('ประตูน้ำ') || q.includes('ratchaprarop')) {
    return 'Ratchathewi';
  }
  if (q.includes('wang thonglang') || q.includes('วังทองหลาง') || q.includes('chalong krung')) {
    return 'Wang Thonglang';
  }
  if (q.includes('khlong san') || q.includes('คลองสาน') || q.includes('iconsiam') || q.includes('charoen nakhon')) {
    return 'Khlong San';
  }
  if (q.includes('thon buri') || q.includes('ธนบุรี') || q.includes('wongwian yai') || q.includes('talat phlu')) {
    return 'Thon Buri';
  }
  if (q.includes('bang sue') || q.includes('bangsue') || q.includes('บางซื่อ') || q.includes('tao poon') || q.includes('wongsawang')) {
    return 'Bang Sue';
  }
  if (q.includes('dusit') || q.includes('ดุสิต') || q.includes('samsen') || q.includes('sam sen')) {
    return 'Dusit';
  }
  if (q.includes('phra nakhon') || q.includes('phranakhon') || q.includes('พระนคร') || q.includes('khao san') || 
      q.includes('rattanakosin') || q.includes('sanctuary')) {
    return 'Phra Nakhon';
  }
  if (q.includes('don mueang') || q.includes('donmuang') || q.includes('ดอนเมือง') || q.includes('song prapha')) {
    return 'Don Mueang';
  }
  if (q.includes('lak si') || q.includes('หลักสี่') || q.includes('chaeng watthana') || q.includes('chaengwattana')) {
    return 'Lak Si';
  }
  if (q.includes('bang khen') || q.includes('บางเขน') || q.includes('ramintra') || q.includes('anusaowari')) {
    return 'Bang Khen';
  }
  if (q.includes('sai mai') || q.includes('สายไหม') || q.includes('sukhaphiban 5')) {
    return 'Sai Mai';
  }
  if (q.includes('min buri') || q.includes('มีนบุรี') || q.includes('suwinthawong') || q.includes('nimit mai')) {
    return 'Min Buri';
  }
  if (q.includes('khlong sam wa') || q.includes('คลองสามวา') || q.includes('sam wa')) {
    return 'Khlong Sam Wa';
  }
  if (q.includes('nong chok') || q.includes('หนองจอก')) {
    return 'Nong Chok';
  }

  return null;
}

// Haversine formula to compute distance in km
export function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Find closest condo from GPS coordinates
export function findNearestBangkokCondo(lat, lng) {
  let minDistance = Infinity;
  let nearest = null;
  for (const condo of BANGKOK_CONDO_DATABASE) {
    const d = calculateDistanceKm(lat, lng, condo.lat, condo.lng);
    if (d < minDistance) {
      minDistance = d;
      nearest = { ...condo, distanceKm: Math.round(d * 10) / 10 };
    }
  }
  return nearest;
}

// Search Bangkok & Pattaya Condos, Houses & Buildings by query string
export function searchBangkokCondos(query, currentCity = '') {
  if (!query || !query.trim()) {
    // If in Pattaya, return top Pattaya properties, else Bangkok
    if (currentCity === 'Pattaya') {
      const ptyList = BANGKOK_CONDO_DATABASE.filter(c => c.city === 'Pattaya' || c.zipcode?.startsWith('20'));
      if (ptyList.length > 0) return ptyList.slice(0, 8).map(c => formatCondoResult(c));
    }
    return BANGKOK_CONDO_DATABASE.slice(0, 8).map(c => formatCondoResult(c));
  }

  const clean = query.trim().toLowerCase();
  const tokens = clean.split(/\s+/).filter(Boolean);

  const scored = BANGKOK_CONDO_DATABASE.map(condo => {
    let score = 0;
    const nameLow = condo.name.toLowerCase();
    const thaiLow = condo.thaiName ? condo.thaiName.toLowerCase() : '';
    const districtLow = condo.district.toLowerCase();
    const roadLow = condo.road.toLowerCase();
    const subLow = (condo.subdistrict || '').toLowerCase();
    const aliasesLow = (condo.aliases || []).join(' ').toLowerCase();

    // City preference bonus
    if (currentCity && (condo.city === currentCity || (currentCity === 'Pattaya' && condo.zipcode?.startsWith('20')))) {
      score += 15;
    }

    // Exact name match
    if (nameLow === clean) score += 100;
    // Prefix match
    else if (nameLow.startsWith(clean)) score += 60;
    // Includes match
    else if (nameLow.includes(clean)) score += 40;

    // Alias matches
    if (aliasesLow.includes(clean)) score += 35;
    if (thaiLow.includes(clean)) score += 40;

    // Sub-district match
    if (subLow.includes(clean)) score += 30;

    // Token matches across attributes
    let allTokensFound = true;
    for (const token of tokens) {
      const foundInName = nameLow.includes(token);
      const foundInAlias = aliasesLow.includes(token);
      const foundInRoad = roadLow.includes(token);
      const foundInDistrict = districtLow.includes(token);
      const foundInSub = subLow.includes(token);
      const foundInThai = thaiLow.includes(token);

      if (foundInName) score += 20;
      else if (foundInAlias) score += 15;
      else if (foundInRoad) score += 10;
      else if (foundInSub) score += 12;
      else if (foundInDistrict) score += 5;
      else if (foundInThai) score += 15;
      else allTokensFound = false;
    }

    if (allTokensFound && tokens.length > 1) score += 25;

    return { condo, score };
  })
  .filter(item => item.score > 0)
  .sort((a, b) => b.score - a.score)
  .slice(0, 8);

  return scored.map(item => formatCondoResult(item.condo));
}

function formatCondoResult(condo) {
  const isPty = condo.city === 'Pattaya' || condo.zipcode?.startsWith('20');
  const cityName = isPty ? 'Pattaya' : 'Bangkok';
  const cleanDistrict = condo.district.split(' (')[0];
  const address = `${condo.road}, ${condo.subdistrict}, ${cleanDistrict}, ${cityName} ${condo.zipcode}`;
  const encodedQuery = encodeURIComponent(`${condo.name} ${cityName}`);
  return {
    id: condo.id,
    name: condo.name,
    thaiName: condo.thaiName,
    city: cityName,
    district: cleanDistrict,
    subdistrict: condo.subdistrict,
    road: condo.road,
    zipcode: condo.zipcode,
    postalCode: condo.zipcode,
    lat: condo.lat,
    lng: condo.lng,
    type: condo.type,
    formattedAddress: address,
    googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodedQuery}`,
    embedUrl: `https://www.google.com/maps?q=${encodedQuery}&output=embed`
  };
}

/**
 * Parses Google Maps Places API address_components into clean fields
 */
export function parseGooglePlaceComponents(addressComponents) {
  let postalCode = '';
  let subdistrict = '';
  let district = '';
  let province = '';
  let country = '';
  let streetNumber = '';
  let route = '';

  if (Array.isArray(addressComponents)) {
    // 1. Pass 1: Explicit level checks
    for (const comp of addressComponents) {
      const types = comp.types || [];
      const val = comp.long_name || comp.short_name || '';

      if (types.includes('postal_code')) {
        postalCode = val;
      }
      // Sub-district (Khwaeng / Tambon) in Thailand
      if (
        types.includes('sublocality_level_2') || 
        types.includes('sublocality_level_3') || 
        types.includes('administrative_area_level_3')
      ) {
        if (!subdistrict) subdistrict = val;
      }
      // District (Khet / Amphoe) in Thailand
      if (
        types.includes('sublocality_level_1') || 
        types.includes('administrative_area_level_2')
      ) {
        if (!district) district = val;
      }
      if (types.includes('administrative_area_level_1')) {
        province = val;
      }
      if (types.includes('country')) {
        country = comp.short_name || val;
      }
      if (types.includes('street_number')) {
        streetNumber = val;
      }
      if (types.includes('route')) {
        route = val;
      }
    }

    // 2. Pass 2: Fallback for single sublocality or provincial locality
    for (const comp of addressComponents) {
      const types = comp.types || [];
      const val = comp.long_name || comp.short_name || '';

      if (types.includes('sublocality') && !types.includes('sublocality_level_2') && !types.includes('sublocality_level_1')) {
        if (!district) district = val;
        else if (!subdistrict) subdistrict = val;
      }
      if (types.includes('locality')) {
        const low = val.toLowerCase();
        if (!district && low !== 'bangkok' && !val.includes('กรุงเทพ')) {
          district = val;
        }
      }
    }
  }

  // Clean administrative prefixes ('Khet Lat Krabang' -> 'Lat Krabang', 'Khwaeng Khlong Song Ton Nun' -> 'Khlong Song Ton Nun')
  const cleanPrefix = (str) => (str || '')
    .replace(/^(khet|khwaeng|amphoe|tambon|district|subdistrict|เขต|แขวง|อำเภอ|ตำบล)\s+/i, '')
    .trim();

  return { 
    postalCode: (postalCode || '').trim(), 
    subdistrict: cleanPrefix(subdistrict), 
    district: cleanPrefix(district), 
    province, 
    country, 
    streetNumber, 
    route 
  };
}

/**
 * Parses free-form Google Maps address text, street address or establishment name into clean Thai location components
 */
export function parseAddressText(addressText) {
  if (!addressText || typeof addressText !== 'string') return {};
  const cleanText = addressText.toLowerCase();

  // 1. Postal code (5 digits: 10xxx Bangkok or 20xxx Pattaya/Chonburi)
  const zipMatch = addressText.match(/\b(10\d{3}|20\d{3})\b/);
  const postalCode = zipMatch ? zipMatch[1] : '';

  // 2. City detection
  const isPty = postalCode.startsWith('20') || 
                cleanText.includes('pattaya') || 
                cleanText.includes('chon buri') || 
                cleanText.includes('chonburi') || 
                cleanText.includes('jomtien') || 
                cleanText.includes('bang lamung') || 
                cleanText.includes('naklua') || 
                cleanText.includes('wongamat');
  const city = isPty ? 'Pattaya' : 'Bangkok';

  // 3. Pattaya Sub-district / District
  if (isPty) {
    for (const sub of PATTAYA_SUBDISTRICTS_LIST) {
      if (cleanText.includes(sub.name.toLowerCase()) || (sub.nameTh && cleanText.includes(sub.nameTh.toLowerCase()))) {
        return {
          city: 'Pattaya',
          district: sub.district || 'Bang Lamung',
          subdistrict: sub.name,
          postalCode: sub.code || postalCode || '20150'
        };
      }
    }
    return {
      city: 'Pattaya',
      district: 'Bang Lamung',
      subdistrict: PATTAYA_SUBDISTRICTS_LIST[0].name,
      postalCode: postalCode || '20150'
    };
  }

  // 4. Bangkok District - Check specific landmarks/roads first
  let matchedDist = null;
  if (cleanText.includes('lat krabang') || cleanText.includes('ลาดกระบัง') || cleanText.includes('motorway') || cleanText.includes('chonnabot') || cleanText.includes('suvarnabhumi')) {
    matchedDist = 'Lat Krabang';
  } else if (cleanText.includes('saphan sung') || cleanText.includes('สะพานสูง') || cleanText.includes('krungthep kreetha')) {
    matchedDist = 'Saphan Sung';
  } else if (cleanText.includes('bang kapi') || cleanText.includes('บางกะปิ') || cleanText.includes('ramkhamhaeng') || cleanText.includes('hua mak')) {
    matchedDist = 'Bang Kapi';
  } else if (cleanText.includes('huai khwang') || cleanText.includes('ห้วยขวาง') || cleanText.includes('ratchada') || cleanText.includes('asoke-rama 9') || cleanText.includes('central rama 9')) {
    matchedDist = 'Huai Khwang';
  } else {
    for (const d of BANGKOK_DISTRICTS) {
      if (cleanText.includes(d.toLowerCase())) {
        matchedDist = d;
        break;
      }
    }
  }

  // 5. Bangkok Sub-district
  let matchedSub = null;
  if (matchedDist) {
    const subs = BANGKOK_DISTRICTS_TO_SUBDISTRICTS[matchedDist] || [];
    // Priority: subdistricts whose name differs from the district name
    for (const s of subs) {
      if (s.name.toLowerCase() !== matchedDist.toLowerCase()) {
        if (cleanText.includes(s.name.toLowerCase()) || (s.nameTh && cleanText.includes(s.nameTh.toLowerCase()))) {
          matchedSub = s.name;
          break;
        }
      }
    }
    if (!matchedSub) {
      for (const s of subs) {
        if (cleanText.includes(s.name.toLowerCase()) || (s.nameTh && cleanText.includes(s.nameTh.toLowerCase()))) {
          matchedSub = s.name;
          break;
        }
      }
    }
  }

  // Cross-district subdistrict fallback
  if (!matchedSub) {
    for (const [dName, subs] of Object.entries(BANGKOK_DISTRICTS_TO_SUBDISTRICTS)) {
      for (const s of subs) {
        if (s.name.toLowerCase() !== dName.toLowerCase()) {
          if (cleanText.includes(s.name.toLowerCase()) || (s.nameTh && cleanText.includes(s.nameTh.toLowerCase()))) {
            matchedDist = dName;
            matchedSub = s.name;
            break;
          }
        }
      }
      if (matchedSub) break;
    }
  }

  return {
    city: 'Bangkok',
    district: matchedDist || '',
    subdistrict: matchedSub || '',
    postalCode: postalCode || ''
  };
}

/**
 * Matches location fields against Bangkok (50 districts, 180 Khwaeng) and Pattaya zones
 */
export function matchLocationDetails(input = {}) {
  const {
    subdistrict = '',
    district = '',
    postalCode = '',
    formattedAddress = '',
    city = '',
    name = ''
  } = input;

  const clean = (s) => (s || '').toLowerCase()
    .replace(/^(khwaeng|tambon|subdistrict|khet|amphoe|district|province|changwat|city)\s+/i, '')
    .trim();

  // Cross-parse formattedAddress and name text
  const addrParsed = parseAddressText(`${name} ${formattedAddress}`);

  const rawSub = subdistrict || addrParsed.subdistrict || '';
  const rawDist = district || addrParsed.district || '';
  const rawZip = postalCode || addrParsed.postalCode || '';

  const cSub = clean(rawSub);
  const cDist = clean(rawDist);
  const combinedText = `${name} ${formattedAddress} ${rawDist} ${rawSub}`.toLowerCase();

  // 1. Resolve City (Bangkok vs Pattaya)
  let resolvedCity = city || addrParsed.city;
  const isPtySignal = rawZip.startsWith('20') || 
                      combinedText.includes('chon buri') || 
                      combinedText.includes('chonburi') || 
                      combinedText.includes('pattaya') || 
                      combinedText.includes('jomtien') || 
                      combinedText.includes('naklua') || 
                      combinedText.includes('wongamat') || 
                      combinedText.includes('bang lamung') || 
                      combinedText.includes('sattahip');

  const isBkkSignal = rawZip.startsWith('10') || 
                      combinedText.includes('bangkok') || 
                      combinedText.includes('sukhumvit') || 
                      combinedText.includes('lat krabang') ||
                      combinedText.includes('saphan sung') ||
                      combinedText.includes('huai khwang') || 
                      combinedText.includes('ratchada') || 
                      combinedText.includes('sathorn') || 
                      combinedText.includes('silom') || 
                      combinedText.includes('thonglor') || 
                      combinedText.includes('ekkamai');

  if (isPtySignal && !isBkkSignal) {
    resolvedCity = 'Pattaya';
  } else if (isBkkSignal && !isPtySignal) {
    resolvedCity = 'Bangkok';
  } else if (!resolvedCity) {
    resolvedCity = isPtySignal ? 'Pattaya' : 'Bangkok';
  }

  // 2. Handle Pattaya
  if (resolvedCity === 'Pattaya') {
    let ptySub = PATTAYA_SUBDISTRICTS_LIST.find(s => {
      const sName = clean(s.name);
      const sNameTh = clean(s.nameTh);
      return (cSub && (sName === cSub || sName.includes(cSub) || cSub.includes(sName) || sNameTh.includes(cSub))) ||
             (combinedText && (combinedText.includes(sName.split('/')[0].trim()) || (sNameTh && combinedText.includes(sNameTh))));
    });

    if (!ptySub && rawZip) {
      ptySub = PATTAYA_SUBDISTRICTS_LIST.find(s => s.code === rawZip);
    }
    if (!ptySub) {
      ptySub = PATTAYA_SUBDISTRICTS_LIST[0];
    }

    return {
      city: 'Pattaya',
      district: ptySub.district || 'Bang Lamung',
      subdistrict: ptySub.name,
      postalCode: ptySub.code || '20150'
    };
  }

  // 3. Handle Bangkok
  let matchedDist = null;
  if (cDist) {
    matchedDist = BANGKOK_DISTRICTS.find(d => clean(d) === cDist || clean(d).includes(cDist) || cDist.includes(clean(d)));
  }

  // Match district from postal code if not matched
  if (!matchedDist && rawZip) {
    for (const [dName, subs] of Object.entries(BANGKOK_DISTRICTS_TO_SUBDISTRICTS)) {
      if (subs.some(s => s.code === rawZip)) {
        matchedDist = dName;
        break;
      }
    }
  }

  if (!matchedDist && combinedText) {
    const detected = matchDistrictFromText(combinedText);
    if (detected) {
      matchedDist = detected.split(' (')[0];
    }
    if (!matchedDist) {
      matchedDist = BANGKOK_DISTRICTS.find(d => combinedText.includes(clean(d)));
    }
  }
  if (!matchedDist) {
    matchedDist = 'Watthana';
  }

  const districtSubs = BANGKOK_DISTRICTS_TO_SUBDISTRICTS[matchedDist] || [];
  let matchedSub = districtSubs.find(s => {
    const sName = clean(s.name);
    const sNameTh = clean(s.nameTh);
    return cSub && (sName === cSub || sName.includes(cSub) || cSub.includes(sName) || sNameTh.includes(cSub));
  });

  if (!matchedSub && combinedText) {
    matchedSub = districtSubs.find(s => {
      const sName = clean(s.name);
      return combinedText.includes(sName);
    });
  }

  // Cross-district subdistrict search if not found in matched district
  if (!matchedSub) {
    for (const [dName, subs] of Object.entries(BANGKOK_DISTRICTS_TO_SUBDISTRICTS)) {
      const found = subs.find(s => {
        const sName = clean(s.name);
        const sNameTh = clean(s.nameTh);
        return (cSub && (sName === cSub || sName.includes(cSub) || cSub.includes(sName) || sNameTh.includes(cSub))) ||
               (combinedText && (combinedText.includes(sName) || (sNameTh && combinedText.includes(sNameTh))));
      });
      if (found) {
        matchedDist = dName;
        matchedSub = found;
        break;
      }
    }
  }

  const finalSub = matchedSub ? matchedSub.name : (districtSubs[0]?.name || 'Khlong Toei Nuea');
  const finalCode = rawZip || matchedSub?.code || districtSubs[0]?.code || DISTRICT_TO_POSTAL_CODE[matchedDist] || '10110';

  return {
    city: 'Bangkok',
    district: matchedDist,
    subdistrict: finalSub,
    postalCode: finalCode
  };
}

/**
 * Analyzes typed text / house / building name and resolves the best matching location
 */
export function findBestLocationMatch(query, currentCity = '') {
  if (!query || typeof query !== 'string' || query.trim().length < 2) return null;
  const cleanQ = query.trim().toLowerCase();

  // 1. Direct search in database
  const suggestions = searchBangkokCondos(query, currentCity);
  if (suggestions && suggestions.length > 0) {
    const top = suggestions[0];
    const topNameLow = top.name.toLowerCase();
    const thaiLow = (top.thaiName || '').toLowerCase();
    const aliases = (top.aliases || []).map(a => a.toLowerCase());

    const isMatch = topNameLow.startsWith(cleanQ) || 
                    cleanQ.startsWith(topNameLow) || 
                    topNameLow.includes(cleanQ) || 
                    cleanQ.includes(topNameLow) ||
                    aliases.some(a => a.includes(cleanQ) || cleanQ.includes(a)) ||
                    (thaiLow && (thaiLow.includes(cleanQ) || cleanQ.includes(thaiLow)));

    if (isMatch) {
      return {
        name: top.name,
        city: top.city || (top.zipcode?.startsWith('20') ? 'Pattaya' : 'Bangkok'),
        district: top.district,
        subdistrict: top.subdistrict,
        postalCode: top.zipcode || top.postalCode,
        road: top.road,
        type: top.type,
        lat: top.lat,
        lng: top.lng,
        isDatabaseMatch: true
      };
    }
  }

  // 2. Keyword & Area analysis
  const matched = matchLocationDetails({
    formattedAddress: query,
    name: query,
    city: currentCity
  });

  const hasAreaClue = matchDistrictFromText(query) || 
    cleanQ.includes('jomtien') || cleanQ.includes('pattaya') || cleanQ.includes('naklua') || 
    cleanQ.includes('wongamat') || cleanQ.includes('bang lamung') ||
    /\b(10\d{3}|20\d{3})\b/.test(cleanQ);

  if (hasAreaClue && matched) {
    return {
      name: query,
      city: matched.city,
      district: matched.district,
      subdistrict: matched.subdistrict,
      postalCode: matched.postalCode,
      isKeywordMatch: true
    };
  }

  return null;
}
