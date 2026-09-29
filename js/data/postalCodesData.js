// Bangkok & Pattaya Sub-districts, Zones, and Delivery Fee Configuration
// Supports sub-district level delivery fees for Bangkok and a dedicated set for Pattaya

export const SERVICE_CITIES = ['Bangkok', 'Pattaya'];

// ============================================================================
// 1. BANGKOK SUB-DISTRICTS & DELIVERY RATES
// ============================================================================
export const DEFAULT_BANGKOK_SUBDISTRICTS = [
  // --- Watthana (10110) ---
  {
    id: 'bkk-watthana-khlong-toei-nuea',
    city: 'Bangkok',
    district: 'Watthana',
    districtTh: 'วัฒนา',
    subdistrict: 'Khlong Toei Nuea',
    subdistrictTh: 'คลองเตยเหนือ',
    code: '10110',
    areas: 'Asoke, Sukhumvit 21–39, Srinakharinwirot (Prasanmit), Sinharat',
    fee: 50,
    isActive: true,
    freeDeliveryAbove: 600
  },
  {
    id: 'bkk-watthana-khlong-tan-nuea',
    city: 'Bangkok',
    district: 'Watthana',
    districtTh: 'วัฒนา',
    subdistrict: 'Khlong Tan Nuea',
    subdistrictTh: 'คลองตันเหนือ',
    code: '10110',
    areas: 'Thonglor (Sukhumvit 55), Phrom Phong, Ekkamai (Sukhumvit 63, odd side)',
    fee: 50,
    isActive: true,
    freeDeliveryAbove: 600
  },
  {
    id: 'bkk-watthana-phra-khanong-nuea',
    city: 'Bangkok',
    district: 'Watthana',
    districtTh: 'วัฒนา',
    subdistrict: 'Phra Khanong Nuea',
    subdistrictTh: 'พระโขนงเหนือ',
    code: '10110',
    areas: 'Sukhumvit 65–71, Pridi Banomyong, Phra Khanong BTS (North)',
    fee: 50,
    isActive: true,
    freeDeliveryAbove: 600
  },

  // --- Khlong Toei (10110) ---
  {
    id: 'bkk-khlong-toei-khlong-toei',
    city: 'Bangkok',
    district: 'Khlong Toei',
    districtTh: 'คลองเตย',
    subdistrict: 'Khlong Toei',
    subdistrictTh: 'คลองเตย',
    code: '10110',
    areas: 'Rama 4, Queen Sirikit Centre (QSNCC), Khlong Toei Market, Port Authority',
    fee: 50,
    isActive: true,
    freeDeliveryAbove: 600
  },
  {
    id: 'bkk-khlong-toei-khlong-tan',
    city: 'Bangkok',
    district: 'Khlong Toei',
    districtTh: 'คลองเตย',
    subdistrict: 'Khlong Tan',
    subdistrictTh: 'คลองตัน',
    code: '10110',
    areas: 'Sukhumvit 22–38, Sukhumvit 24/26 (EmQuartier area), Rama 4 South',
    fee: 50,
    isActive: true,
    freeDeliveryAbove: 600
  },
  {
    id: 'bkk-khlong-toei-phra-khanong',
    city: 'Bangkok',
    district: 'Khlong Toei',
    districtTh: 'คลองเตย',
    subdistrict: 'Phra Khanong',
    subdistrictTh: 'พระโขนง',
    code: '10110',
    areas: 'Sukhumvit 40–50, Kluaynamthai, Bangkok University City Campus',
    fee: 50,
    isActive: true,
    freeDeliveryAbove: 600
  },

  // --- Bang Rak (10500) ---
  {
    id: 'bkk-bang-rak-si-lom',
    city: 'Bangkok',
    district: 'Bang Rak',
    districtTh: 'บางรัก',
    subdistrict: 'Si Lom',
    subdistrictTh: 'สีลม',
    code: '10500',
    areas: 'Silom Road, Sala Daeng, Convent Road, Chong Nonsi (Silom side), Patpong',
    fee: 50,
    isActive: true,
    freeDeliveryAbove: 600
  },
  {
    id: 'bkk-bang-rak-suriyawong',
    city: 'Bangkok',
    district: 'Bang Rak',
    districtTh: 'บางรัก',
    subdistrict: 'Suriyawong',
    subdistrictTh: 'สุริยวงศ์',
    code: '10500',
    areas: 'Surawong Road, Thaniya, Maha Nakhon area, Decho Road',
    fee: 50,
    isActive: true,
    freeDeliveryAbove: 600
  },
  {
    id: 'bkk-bang-rak-si-phraya',
    city: 'Bangkok',
    district: 'Bang Rak',
    districtTh: 'บางรัก',
    subdistrict: 'Si Phraya',
    subdistrictTh: 'สี่พระยา',
    code: '10500',
    areas: 'Si Phraya Road, Samyan Mitrtown perimeter, Naret Road',
    fee: 50,
    isActive: true,
    freeDeliveryAbove: 600
  },
  {
    id: 'bkk-bang-rak-maha-phruettharam',
    city: 'Bangkok',
    district: 'Bang Rak',
    districtTh: 'บางรัก',
    subdistrict: 'Maha Phruettharam',
    subdistrictTh: 'มหาพฤฒาราม',
    code: '10500',
    areas: 'Hua Lamphong area, Rama 4 West, Wat Maha Phruettharam',
    fee: 50,
    isActive: true,
    freeDeliveryAbove: 600
  },
  {
    id: 'bkk-bang-rak-bang-rak',
    city: 'Bangkok',
    district: 'Bang Rak',
    districtTh: 'บางรัก',
    subdistrict: 'Bang Rak',
    subdistrictTh: 'บางรัก',
    code: '10500',
    areas: 'Charoen Krung (Soi 32–50), Mandarin Oriental, French Embassy, Riverside',
    fee: 50,
    isActive: true,
    freeDeliveryAbove: 600
  },

  // --- Sathon (10120) ---
  {
    id: 'bkk-sathon-thung-maha-mek',
    city: 'Bangkok',
    district: 'Sathon',
    districtTh: 'สาทร',
    subdistrict: 'Thung Maha Mek',
    subdistrictTh: 'ทุ่งมหาเมฆ',
    code: '10120',
    areas: 'South Sathorn Road, Suan Phlu, Nang Linchi, Yen Akat, Technic Krungthep',
    fee: 50,
    isActive: true,
    freeDeliveryAbove: 600
  },
  {
    id: 'bkk-sathon-yan-nawa',
    city: 'Bangkok',
    district: 'Sathon',
    districtTh: 'สาทร',
    subdistrict: 'Yan Nawa',
    subdistrictTh: 'ยานนาวา',
    code: '10120',
    areas: 'Sathorn Bridge, Surasak BTS, Saint Louis (Sathorn Soi 11), Charoen Rat',
    fee: 50,
    isActive: true,
    freeDeliveryAbove: 600
  },
  {
    id: 'bkk-sathon-thung-wat-don',
    city: 'Bangkok',
    district: 'Sathon',
    districtTh: 'สาทร',
    subdistrict: 'Thung Wat Don',
    subdistrictTh: 'ทุ่งวัดดอน',
    code: '10120',
    areas: 'Chan Road, Soi Saint Louis 3, Naradhiwas Soi 6-10',
    fee: 50,
    isActive: true,
    freeDeliveryAbove: 600
  },

  // --- Pathum Wan (10330) ---
  {
    id: 'bkk-pathum-wan-lumphini',
    city: 'Bangkok',
    district: 'Pathum Wan',
    districtTh: 'ปทุมวัน',
    subdistrict: 'Lumphini',
    subdistrictTh: 'ลุมพินี',
    code: '10330',
    areas: 'Wireless Road (Witthayu), Ploenchit, Langsuan, Chidlom, Ruamrudee, Lumphini Park',
    fee: 50,
    isActive: true,
    freeDeliveryAbove: 600
  },
  {
    id: 'bkk-pathum-wan-pathum-wan',
    city: 'Bangkok',
    district: 'Pathum Wan',
    districtTh: 'ปทุมวัน',
    subdistrict: 'Pathum Wan',
    subdistrictTh: 'ปทุมวัน',
    code: '10330',
    areas: 'Siam Square, Siam Paragon, CentralWorld, Ratchadamri, Erawan',
    fee: 50,
    isActive: true,
    freeDeliveryAbove: 600
  },
  {
    id: 'bkk-pathum-wan-wang-mai',
    city: 'Bangkok',
    district: 'Pathum Wan',
    districtTh: 'ปทุมวัน',
    subdistrict: 'Wang Mai',
    subdistrictTh: 'วังใหม่',
    code: '10330',
    areas: 'MBK Center, National Stadium, Chulalongkorn University, Banthat Thong Road',
    fee: 50,
    isActive: true,
    freeDeliveryAbove: 600
  },
  {
    id: 'bkk-pathum-wan-rong-mueang',
    city: 'Bangkok',
    district: 'Pathum Wan',
    districtTh: 'ปทุมวัน',
    subdistrict: 'Rong Mueang',
    subdistrictTh: 'รองเมือง',
    code: '10330',
    areas: 'Rong Mueang Road, Rama 1 West, Charoen Mueang',
    fee: 50,
    isActive: true,
    freeDeliveryAbove: 600
  },

  // --- Phaya Thai & Ratchathewi (10400) ---
  {
    id: 'bkk-phaya-thai-sam-sen-nai',
    city: 'Bangkok',
    district: 'Phaya Thai',
    districtTh: 'พญาไท',
    subdistrict: 'Sam Sen Nai',
    subdistrictTh: 'สามเสนใน',
    code: '10400',
    areas: 'Ari (Phahonyothin Soi 7), Sanam Pao, Saphan Khwai, Phahonyothin Road',
    fee: 50,
    isActive: true,
    freeDeliveryAbove: 600
  },
  {
    id: 'bkk-phaya-thai-phaya-thai',
    city: 'Bangkok',
    district: 'Phaya Thai',
    districtTh: 'พญาไท',
    subdistrict: 'Phaya Thai',
    subdistrictTh: 'พญาไท',
    code: '10400',
    areas: 'Victory Monument (North), Rama 6 Road, Ministry of Finance',
    fee: 50,
    isActive: true,
    freeDeliveryAbove: 600
  },
  {
    id: 'bkk-ratchathewi-thung-phaya-thai',
    city: 'Bangkok',
    district: 'Ratchathewi',
    districtTh: 'ราชเทวี',
    subdistrict: 'Thung Phaya Thai',
    subdistrictTh: 'ทุ่งพญาไท',
    code: '10400',
    areas: 'Phayathai BTS/Airport Link, Rangnam Road, King Power Complex, Victory Monument',
    fee: 50,
    isActive: true,
    freeDeliveryAbove: 600
  },
  {
    id: 'bkk-ratchathewi-thanon-phetchaburi',
    city: 'Bangkok',
    district: 'Ratchathewi',
    districtTh: 'ราชเทวี',
    subdistrict: 'Thanon Phetchaburi',
    subdistrictTh: 'ถนนเพชรบุรี',
    code: '10400',
    areas: 'Pratunam Market, Platinum Mall, Phetchaburi Soi 5-19, Pantip area',
    fee: 50,
    isActive: true,
    freeDeliveryAbove: 600
  },
  {
    id: 'bkk-ratchathewi-makkasan',
    city: 'Bangkok',
    district: 'Ratchathewi',
    districtTh: 'ราชเทวี',
    subdistrict: 'Makkasan',
    subdistrictTh: 'มักกะสัน',
    code: '10400',
    areas: 'Makkasan Station, Phetchaburi MRT, Asoke-Dindaeng junction',
    fee: 50,
    isActive: true,
    freeDeliveryAbove: 600
  },

  // --- Din Daeng (10400) ---
  {
    id: 'bkk-din-daeng-din-daeng',
    city: 'Bangkok',
    district: 'Din Daeng',
    districtTh: 'ดินแดง',
    subdistrict: 'Din Daeng',
    subdistrictTh: 'ดินแดง',
    code: '10400',
    areas: 'Pracha Songkhro, Din Daeng Flat, Bangkok Youth Centre (Thai-Japan)',
    fee: 50,
    isActive: true,
    freeDeliveryAbove: 600
  },
  {
    id: 'bkk-din-daeng-ratchadaphisek',
    city: 'Bangkok',
    district: 'Din Daeng',
    districtTh: 'ดินแดง',
    subdistrict: 'Ratchadaphisek',
    subdistrictTh: 'รัชดาภิเษก',
    code: '10400',
    areas: 'Ratchadapisek Road (Fortune Town, The Street Ratchada, Esplanade)',
    fee: 50,
    isActive: true,
    freeDeliveryAbove: 600
  },

  // --- Huai Khwang (10310) ---
  {
    id: 'bkk-huai-khwang-huai-khwang',
    city: 'Bangkok',
    district: 'Huai Khwang',
    districtTh: 'ห้วยขวาง',
    subdistrict: 'Huai Khwang',
    subdistrictTh: 'ห้วยขวาง',
    code: '10310',
    areas: 'Huai Khwang Market, Pracharat Bamphen, MRT Huai Khwang, Swissotel area',
    fee: 60,
    isActive: true,
    freeDeliveryAbove: 600
  },
  {
    id: 'bkk-huai-khwang-bang-kapi',
    city: 'Bangkok',
    district: 'Huai Khwang',
    districtTh: 'ห้วยขวาง',
    subdistrict: 'Bang Kapi',
    subdistrictTh: 'บางกะปิ',
    code: '10310',
    areas: 'Rama 9 (Central Rama 9, Belle Grand, G Tower), RCA, Asoke-Phetchaburi',
    fee: 60,
    isActive: true,
    freeDeliveryAbove: 600
  },
  {
    id: 'bkk-huai-khwang-sam-sen-nok',
    city: 'Bangkok',
    district: 'Huai Khwang',
    districtTh: 'ห้วยขวาง',
    subdistrict: 'Sam Sen Nok',
    subdistrictTh: 'สามเสนนอก',
    code: '10310',
    areas: 'Sutthisan (East), Meng Jai intersection, Pracha Uthit Road (Huai Khwang)',
    fee: 60,
    isActive: true,
    freeDeliveryAbove: 600
  },

  // --- Yan Nawa & Bang Kho Laem (10120) ---
  {
    id: 'bkk-yan-nawa-chong-nonsi',
    city: 'Bangkok',
    district: 'Yan Nawa',
    districtTh: 'ยานนาวา',
    subdistrict: 'Chong Nonsi',
    subdistrictTh: 'ช่องนนทรี',
    code: '10120',
    areas: 'Rama 3 (Central Rama 3), Naradhiwas Rajanagarindra, BRT Thanon Chan',
    fee: 50,
    isActive: true,
    freeDeliveryAbove: 600
  },
  {
    id: 'bkk-yan-nawa-bang-phongphang',
    city: 'Bangkok',
    district: 'Yan Nawa',
    districtTh: 'ยานนาวา',
    subdistrict: 'Bang Phongphang',
    subdistrictTh: 'บางโพงพาง',
    code: '10120',
    areas: 'Rama 3 Riverside, Bhumibol Bridges, Sathu Pradit Road',
    fee: 50,
    isActive: true,
    freeDeliveryAbove: 600
  },
  {
    id: 'bkk-bang-kho-laem-bang-kho-laem',
    city: 'Bangkok',
    district: 'Bang Kho Laem',
    districtTh: 'บางคอแหลม',
    subdistrict: 'Bang Kho Laem',
    subdistrictTh: 'บางคอแหลม',
    code: '10120',
    areas: 'Charoen Krung (South), Asiatique The Riverfront, Rama 3 Bridge',
    fee: 50,
    isActive: true,
    freeDeliveryAbove: 600
  },
  {
    id: 'bkk-bang-kho-laem-wat-phraya-krai',
    city: 'Bangkok',
    district: 'Bang Kho Laem',
    districtTh: 'บางคอแหลม',
    subdistrict: 'Wat Phraya Krai',
    subdistrictTh: 'วัดพระยาไกร',
    code: '10120',
    areas: 'Charoen Krung Soi 72–107, Mahaisawan, Montien Riverside area',
    fee: 50,
    isActive: true,
    freeDeliveryAbove: 600
  },
  {
    id: 'bkk-bang-kho-laem-bang-khlo',
    city: 'Bangkok',
    district: 'Bang Kho Laem',
    districtTh: 'บางคอแหลม',
    subdistrict: 'Bang Khlo',
    subdistrictTh: 'บางโคล่',
    code: '10120',
    areas: 'Sathu Pradit, Chan Road (West), Rama 3 junction',
    fee: 50,
    isActive: true,
    freeDeliveryAbove: 600
  },

  // --- Bang Na & Phra Khanong (10260) ---
  {
    id: 'bkk-bang-na-bang-na-nuea',
    city: 'Bangkok',
    district: 'Bang Na',
    districtTh: 'บางนา',
    subdistrict: 'Bang Na Nuea',
    subdistrictTh: 'บางนาเหนือ',
    code: '10260',
    areas: 'Udom Suk (Sukhumvit 103), Bang Na BTS, Central Bangna, Bangna-Trad Km 1-5',
    fee: 60,
    isActive: true,
    freeDeliveryAbove: 600
  },
  {
    id: 'bkk-bang-na-bang-na-tai',
    city: 'Bangkok',
    district: 'Bang Na',
    districtTh: 'บางนา',
    subdistrict: 'Bang Na Tai',
    subdistrictTh: 'บางนาใต้',
    code: '10260',
    areas: 'Bearing (Sukhumvit 107), Lasalle (Sukhumvit 105), BITEC Bangna',
    fee: 60,
    isActive: true,
    freeDeliveryAbove: 600
  },
  {
    id: 'bkk-phra-khanong-bang-chak',
    city: 'Bangkok',
    district: 'Phra Khanong',
    districtTh: 'พระโขนง',
    subdistrict: 'Bang Chak',
    subdistrictTh: 'บางจาก',
    code: '10260',
    areas: 'Bang Chak BTS, Punnawithi (Sukhumvit 101), True Digital Park, Sukhumvit 93-101/1',
    fee: 60,
    isActive: true,
    freeDeliveryAbove: 600
  },

  // --- Chatuchak (10900) ---
  {
    id: 'bkk-chatuchak-chomphon',
    city: 'Bangkok',
    district: 'Chatuchak',
    districtTh: 'จตุจักร',
    subdistrict: 'Chomphon',
    subdistrictTh: 'จอมพล',
    code: '10900',
    areas: 'Central Ladprao, Union Mall, Phahonyothin MRT, Ha Yaek Lat Phrao',
    fee: 60,
    isActive: true,
    freeDeliveryAbove: 600
  },
  {
    id: 'bkk-chatuchak-chatuchak',
    city: 'Bangkok',
    district: 'Chatuchak',
    districtTh: 'จตุจักร',
    subdistrict: 'Chatuchak',
    subdistrictTh: 'จตุจักร',
    code: '10900',
    areas: 'Mo Chit, Chatuchak Weekend Market, JJ Mall, Or Tor Kor Market',
    fee: 60,
    isActive: true,
    freeDeliveryAbove: 600
  },
  {
    id: 'bkk-chatuchak-chan-kasem',
    city: 'Bangkok',
    district: 'Chatuchak',
    districtTh: 'จตุจักร',
    subdistrict: 'Chan Kasem',
    subdistrictTh: 'จันทรเกษม',
    code: '10900',
    areas: 'Ratchadaphisek (Criminal Court), Chandrakasem Rajabhat, Soi Sena',
    fee: 60,
    isActive: true,
    freeDeliveryAbove: 600
  },
  {
    id: 'bkk-chatuchak-lat-yao',
    city: 'Bangkok',
    district: 'Chatuchak',
    districtTh: 'จตุจักร',
    subdistrict: 'Lat Yao',
    subdistrictTh: 'ลาดยาว',
    code: '10900',
    areas: 'Kasetsart University, Ngamwongwan, Vibhavadi Rangsit Hospital area',
    fee: 60,
    isActive: true,
    freeDeliveryAbove: 600
  },
  {
    id: 'bkk-chatuchak-sena-nikhom',
    city: 'Bangkok',
    district: 'Chatuchak',
    districtTh: 'จตุจักร',
    subdistrict: 'Sena Nikhom',
    subdistrictTh: 'เสนานิคม',
    code: '10900',
    areas: 'Sena Nikhom 1, Wang Hin Road, Phahonyothin Soi 32',
    fee: 60,
    isActive: true,
    freeDeliveryAbove: 600
  },

  // --- Bang Sue (10800) ---
  {
    id: 'bkk-bang-sue-bang-sue',
    city: 'Bangkok',
    district: 'Bang Sue',
    districtTh: 'บางซื่อ',
    subdistrict: 'Bang Sue',
    subdistrictTh: 'บางซื่อ',
    code: '10800',
    areas: 'Krung Thep Aphiwat Central Terminal, Tao Poon Interchange, Pracha Chuen',
    fee: 70,
    isActive: true,
    freeDeliveryAbove: 700
  },
  {
    id: 'bkk-bang-sue-wong-sawang',
    city: 'Bangkok',
    district: 'Bang Sue',
    districtTh: 'บางซื่อ',
    subdistrict: 'Wong Sawang',
    subdistrictTh: 'วงศ์สว่าง',
    code: '10800',
    areas: 'Wong Sawang MRT, Rama 7 Bridge, KMUTNB area',
    fee: 70,
    isActive: true,
    freeDeliveryAbove: 700
  },

  // --- Dusit & Phra Nakhon (10300 & 10200) ---
  {
    id: 'bkk-dusit-dusit',
    city: 'Bangkok',
    district: 'Dusit',
    districtTh: 'ดุสิต',
    subdistrict: 'Dusit / Wachira',
    subdistrictTh: 'ดุสิต / วชิรพยาบาล',
    code: '10300',
    areas: 'Dusit Palace, Samsen, Ratchawat, Sri Yan, Government House',
    fee: 60,
    isActive: true,
    freeDeliveryAbove: 600
  },
  {
    id: 'bkk-phra-nakhon-phra-nakhon',
    city: 'Bangkok',
    district: 'Phra Nakhon',
    districtTh: 'พระนคร',
    subdistrict: 'Phra Nakhon Central',
    subdistrictTh: 'พระนคร',
    code: '10200',
    areas: 'Rattanakosin, Grand Palace, Khao San Road, Sanam Luang, Giant Swing, Banglamphu',
    fee: 60,
    isActive: true,
    freeDeliveryAbove: 600
  },

  // --- Chinatown (Pom Prap & Samphanthawong 10100) ---
  {
    id: 'bkk-chinatown-yaowarat',
    city: 'Bangkok',
    district: 'Samphanthawong',
    districtTh: 'สัมพันธวงศ์',
    subdistrict: 'Samphanthawong / Yaowarat',
    subdistrictTh: 'สัมพันธวงศ์ / เยาวราช',
    code: '10100',
    areas: 'Yaowarat Chinatown, Sampheng, Wat Mangkon, Song Wat Road, Talat Noi',
    fee: 50,
    isActive: true,
    freeDeliveryAbove: 600
  },
  {
    id: 'bkk-pom-prap-pom-prap',
    city: 'Bangkok',
    district: 'Pom Prap Sattru Phai',
    districtTh: 'ป้อมปราบศัตรูพ่าย',
    subdistrict: 'Pom Prap / Khlong Mahanak',
    subdistrictTh: 'ป้อมปราบ / คลองมหานาค',
    code: '10100',
    areas: 'Khlong Thom, Bobae Market, Wat Saket (Golden Mount), Ban Bat',
    fee: 50,
    isActive: true,
    freeDeliveryAbove: 600
  },

  // --- Thonburi Riverside & Khlong San (10600) ---
  {
    id: 'bkk-khlong-san-khlong-ton-sai',
    city: 'Bangkok',
    district: 'Khlong San',
    districtTh: 'คลองสาน',
    subdistrict: 'Khlong Ton Sai / Khlong San',
    subdistrictTh: 'คลองต้นไทร / คลองสาน',
    code: '10600',
    areas: 'ICONSIAM, Krung Thonburi BTS, Charoen Nakhon Road, Millennium Hilton',
    fee: 60,
    isActive: true,
    freeDeliveryAbove: 600
  },
  {
    id: 'bkk-thon-buri-talat-phlu',
    city: 'Bangkok',
    district: 'Thon Buri',
    districtTh: 'ธนบุรี',
    subdistrict: 'Talat Phlu / Wongwian Yai',
    subdistrictTh: 'ตลาดพลู / วงเวียนใหญ่',
    code: '10600',
    areas: 'Wongwian Yai, Talat Phlu Food Market, Somdet Phra Chao Taksin Monument, Pho Nimit',
    fee: 60,
    isActive: true,
    freeDeliveryAbove: 600
  },
  {
    id: 'bkk-bangkok-yai-wat-arun',
    city: 'Bangkok',
    district: 'Bangkok Yai',
    districtTh: 'บางกอกใหญ่',
    subdistrict: 'Wat Arun / Tha Phra',
    subdistrictTh: 'วัดอรุณ / ท่าพระ',
    code: '10600',
    areas: 'Wat Arun, Tha Phra MRT Interchange, Itsaraphap Road',
    fee: 60,
    isActive: true,
    freeDeliveryAbove: 600
  },

  // --- Bangkok Noi & Bang Phlat (10700) ---
  {
    id: 'bkk-bangkok-noi-siri-rat',
    city: 'Bangkok',
    district: 'Bangkok Noi',
    districtTh: 'บางกอกน้อย',
    subdistrict: 'Siri Rat / Pinklao',
    subdistrictTh: 'ศิริราช / ปิ่นเกล้า',
    code: '10700',
    areas: 'Siriraj Hospital, Wang Lang, Central Pinklao, Phran Nok Road',
    fee: 70,
    isActive: true,
    freeDeliveryAbove: 700
  },
  {
    id: 'bkk-bang-phlat-bang-phlat',
    city: 'Bangkok',
    district: 'Bang Phlat',
    districtTh: 'บางพลัด',
    subdistrict: 'Bang Phlat / Bang O',
    subdistrictTh: 'บางพลัด / บางอ้อ',
    code: '10700',
    areas: 'Charan Sanitwong, Rama 8 Bridge (West), Bang Phlat MRT, Yanhee Hospital',
    fee: 70,
    isActive: true,
    freeDeliveryAbove: 700
  },

  // --- Suan Luang & Prawet (10250) ---
  {
    id: 'bkk-suan-luang-on-nut',
    city: 'Bangkok',
    district: 'Suan Luang',
    districtTh: 'สวนหลวง',
    subdistrict: 'On Nut / Phatthanakan',
    subdistrictTh: 'อ่อนนุช / พัฒนาการ',
    code: '10250',
    areas: 'On Nut (Sukhumvit 77), Phatthanakan Road, Srinakarin, Airport Rail Link Huamark',
    fee: 70,
    isActive: true,
    freeDeliveryAbove: 700
  },
  {
    id: 'bkk-prawet-nong-bon',
    city: 'Bangkok',
    district: 'Prawet',
    districtTh: 'ประเวศ',
    subdistrict: 'Prawet / Nong Bon',
    subdistrictTh: 'ประเวศ / หนองบอน',
    code: '10250',
    areas: 'Seacon Square, Paradise Park, Suan Luang Rama IX, Chaloem Phrakiat R.9',
    fee: 70,
    isActive: true,
    freeDeliveryAbove: 700
  },

  // --- Wang Thonglang & Lat Phrao (10310 & 10230) ---
  {
    id: 'bkk-wang-thonglang-phlabphla',
    city: 'Bangkok',
    district: 'Wang Thonglang',
    districtTh: 'วังทองหลาง',
    subdistrict: 'Phlabphla / Town in Town',
    subdistrictTh: 'พลับพลา / ทาวน์อินทาวน์',
    code: '10310',
    areas: 'Town in Town, Pradit Manutham (Chalong Rat Expressway), Bodindecha',
    fee: 60,
    isActive: true,
    freeDeliveryAbove: 600
  },
  {
    id: 'bkk-lat-phrao-lat-phrao',
    city: 'Bangkok',
    district: 'Lat Phrao',
    districtTh: 'ลาดพร้าว',
    subdistrict: 'Lat Phrao / Chok Chai 4',
    subdistrictTh: 'ลาดพร้าว / โชคชัย 4',
    code: '10230',
    areas: 'Chok Chai 4, Nak Niwat, Sukhonthasawat, Central Eastville area',
    fee: 70,
    isActive: true,
    freeDeliveryAbove: 700
  },

  // --- Bang Kapi & Bueng Kum (10240) ---
  {
    id: 'bkk-bang-kapi-hua-mak',
    city: 'Bangkok',
    district: 'Bang Kapi',
    districtTh: 'บางกะปิ',
    subdistrict: 'Hua Mak / Khlong Chan',
    subdistrictTh: 'หัวหมาก / คลองจั่น',
    code: '10240',
    areas: 'Ramkhamhaeng University, Rajamangala Stadium, The Mall Bangkapi, Nawamin',
    fee: 70,
    isActive: true,
    freeDeliveryAbove: 700
  },
  {
    id: 'bkk-bueng-kum-khlong-kum',
    city: 'Bangkok',
    district: 'Bueng Kum',
    districtTh: 'บึงกุ่ม',
    subdistrict: 'Khlong Kum / Nawamin',
    subdistrictTh: 'คลองกุ่ม / นวมินทร์',
    code: '10240',
    areas: 'Nawamin, Seri Thai, Nuan Chan, Prasert-Manukitch Road',
    fee: 70,
    isActive: true,
    freeDeliveryAbove: 700
  },

  // --- Don Mueang & Lak Si (10210) ---
  {
    id: 'bkk-don-mueang-sanambin',
    city: 'Bangkok',
    district: 'Don Mueang',
    districtTh: 'ดอนเมือง',
    subdistrict: 'Sanambin / Song Prapha',
    subdistrictTh: 'สนามบิน / สรงประภา',
    code: '10210',
    areas: 'Don Mueang Airport, Song Prapha Road, Saranakhom, Kosum Ruam Chai',
    fee: 80,
    isActive: true,
    freeDeliveryAbove: 700
  },
  {
    id: 'bkk-lak-si-thung-song-hong',
    city: 'Bangkok',
    district: 'Lak Si',
    districtTh: 'หลักสี่',
    subdistrict: 'Thung Song Hong / Chaeng Watthana',
    subdistrictTh: 'ทุ่งสองห้อง / แจ้งวัฒนะ',
    code: '10210',
    areas: 'Chaeng Watthana Government Complex, IT Square, Vibhavadi 60–64',
    fee: 80,
    isActive: true,
    freeDeliveryAbove: 700
  },

  // --- Bang Khen & Sai Mai (10220) ---
  {
    id: 'bkk-bang-khen-anusawari',
    city: 'Bangkok',
    district: 'Bang Khen',
    districtTh: 'บางเขน',
    subdistrict: 'Anusawari / Ram Inthra',
    subdistrictTh: 'อนุสาวรีย์ / รามอินทรา',
    code: '10220',
    areas: 'Ram Inthra Km 1-4, Central Ramindra, Wat Phra Si Mahathat, Phahonyothin',
    fee: 80,
    isActive: true,
    freeDeliveryAbove: 700
  },
  {
    id: 'bkk-sai-mai-sai-mai',
    city: 'Bangkok',
    district: 'Sai Mai',
    districtTh: 'สายไหม',
    subdistrict: 'Sai Mai / O Ngoen',
    subdistrictTh: 'สายไหม / ออเงิน',
    code: '10220',
    areas: 'Sai Mai Road, Sukhaphiban 5, Watcharaphon, Khlong Thanon',
    fee: 80,
    isActive: true,
    freeDeliveryAbove: 700
  },

  // --- Western Bangkok (Phasi Charoen, Bang Khae, Nong Khaem 10160) ---
  {
    id: 'bkk-phasi-charoen-bang-wa',
    city: 'Bangkok',
    district: 'Phasi Charoen',
    districtTh: 'ภาษีเจริญ',
    subdistrict: 'Bang Wa / Khlong Khwang',
    subdistrictTh: 'บางหว้า / คลองขวาง',
    code: '10160',
    areas: 'Bang Wa Interchange BTS/MRT, Phetkasem Road, Seacon Bangkae, Phutthamonthon Sai 1',
    fee: 80,
    isActive: true,
    freeDeliveryAbove: 700
  },
  {
    id: 'bkk-bang-khae-bang-khae',
    city: 'Bangkok',
    district: 'Bang Khae',
    districtTh: 'บางแค',
    subdistrict: 'Bang Khae / Lak Song',
    subdistrictTh: 'บางแค / หลักสอง',
    code: '10160',
    areas: 'The Mall Bangkhae, Kanchanaphisek Road, Lak Song MRT',
    fee: 80,
    isActive: true,
    freeDeliveryAbove: 700
  },

  // --- Taling Chan & Thawi Watthana (10170) ---
  {
    id: 'bkk-taling-chan-khlong-chak-phra',
    city: 'Bangkok',
    district: 'Taling Chan',
    districtTh: 'ตลิ่งชัน',
    subdistrict: 'Taling Chan / Chimphli',
    subdistrictTh: 'ตลิ่งชัน / ฉิมพลี',
    code: '10170',
    areas: 'Ratchaphruek (North), Borommaratchachonnani, Taling Chan Floating Market',
    fee: 80,
    isActive: true,
    freeDeliveryAbove: 700
  },

  // --- Rama 2 & Southwest (Chom Thong, Bang Khun Thian, Bang Bon 10150) ---
  {
    id: 'bkk-chom-thong-bang-mod',
    city: 'Bangkok',
    district: 'Chom Thong',
    districtTh: 'จอมทอง',
    subdistrict: 'Chom Thong / Bang Mod',
    subdistrictTh: 'จอมทอง / บางมด',
    code: '10150',
    areas: 'Rama 2 (Km 1-5), Dao Khanong, Chom Thong Road, Wat Sai',
    fee: 80,
    isActive: true,
    freeDeliveryAbove: 700
  },
  {
    id: 'bkk-bang-khun-thian-samae-dam',
    city: 'Bangkok',
    district: 'Bang Khun Thian',
    districtTh: 'บางขุนเทียน',
    subdistrict: 'Tha Kham / Samae Dam',
    subdistrictTh: 'ท่าข้าม / แสมดำ',
    code: '10150',
    areas: 'Central Rama 2, Tha Kham, Bang Khun Thian-Chai Thale Road',
    fee: 80,
    isActive: true,
    freeDeliveryAbove: 700
  },

  // --- Rat Burana & Thung Khru (10140) ---
  {
    id: 'bkk-rat-burana-bang-pakok',
    city: 'Bangkok',
    district: 'Rat Burana',
    districtTh: 'ราษฎร์บูรณะ',
    subdistrict: 'Rat Burana / Bang Pakok',
    subdistrictTh: 'ราษฎร์บูรณะ / บางปะกอก',
    code: '10140',
    areas: 'Suksawat Road, Bang Pakok, Kasikornbank Head Office Rat Burana',
    fee: 70,
    isActive: true,
    freeDeliveryAbove: 700
  },
  {
    id: 'bkk-thung-khru-bang-mod',
    city: 'Bangkok',
    district: 'Thung Khru',
    districtTh: 'ทุ่งครุ',
    subdistrict: 'Thung Khru / Bang Mod',
    subdistrictTh: 'ทุ่งครุ / บางมด',
    code: '10140',
    areas: 'Pracha Uthit Road (Thonburi), KMUTT (King Mongkut University Bang Mod)',
    fee: 70,
    isActive: true,
    freeDeliveryAbove: 700
  },

  // --- Eastern Suburbs (Min Buri, Lat Krabang, Khlong Sam Wa 10510 & 10520) ---
  {
    id: 'bkk-min-buri-min-buri',
    city: 'Bangkok',
    district: 'Min Buri',
    districtTh: 'มีนบุรี',
    subdistrict: 'Min Buri / Saen Saep',
    subdistrictTh: 'มีนบุรี / แสนแสบ',
    code: '10510',
    areas: 'Min Buri Market, Sihaburanukit, Suwinthawong, Ramkhamhaeng (End)',
    fee: 90,
    isActive: true,
    freeDeliveryAbove: 800
  },
  {
    id: 'bkk-lat-krabang-lat-krabang',
    city: 'Bangkok',
    district: 'Lat Krabang',
    districtTh: 'ลาดกระบัง',
    subdistrict: 'Lat Krabang / Khlong Sam Prawet',
    subdistrictTh: 'ลาดกระบัง / คลองสามประเวศ',
    code: '10520',
    areas: 'Suvarnabhumi Airport Area, KMITL, Rom Klao, Chalong Krung Road',
    fee: 90,
    isActive: true,
    freeDeliveryAbove: 800
  }
];

// ============================================================================
// 2. PATTAYA SUB-DISTRICTS & DELIVERY RATES
// ============================================================================
export const DEFAULT_PATTAYA_SUBDISTRICTS = [
  {
    id: 'pty-nong-prue-central-pattaya',
    city: 'Pattaya',
    district: 'Bang Lamung',
    districtTh: 'บางละมุง',
    subdistrict: 'Central Pattaya / Nong Prue',
    subdistrictTh: 'พัทยากลาง / หนองปรือ',
    code: '20150',
    areas: 'Beach Road, Second Road, Third Road, Soi Buakhao, Walking Street, Central Festival Pattaya',
    fee: 50,
    isActive: true,
    freeDeliveryAbove: 600
  },
  {
    id: 'pty-na-kluea-north-pattaya-wongamat',
    city: 'Pattaya',
    district: 'Bang Lamung',
    districtTh: 'บางละมุง',
    subdistrict: 'North Pattaya & Wongamat / Na Kluea',
    subdistrictTh: 'พัทยาเหนือ & หาดวงศ์อมาตย์ / นาเกลือ',
    code: '20150',
    areas: 'Naklua Road, Wongamat Beach, Terminal 21 Pattaya, Sanctuary of Truth, Soi 12–18',
    fee: 50,
    isActive: true,
    freeDeliveryAbove: 600
  },
  {
    id: 'pty-pratumnak-south-pattaya',
    city: 'Pattaya',
    district: 'Bang Lamung',
    districtTh: 'บางละมุง',
    subdistrict: 'South Pattaya & Pratumnak Hill',
    subdistrictTh: 'พัทยาใต้ & เขาพระตำหนัก',
    code: '20150',
    areas: 'Pratumnak Soi 1–6, Big Buddha Hill, Cosy Beach, Thappraya Road, South Pattaya Rd',
    fee: 50,
    isActive: true,
    freeDeliveryAbove: 600
  },
  {
    id: 'pty-jomtien-beach-dongtan',
    city: 'Pattaya',
    district: 'Bang Lamung',
    districtTh: 'บางละมุง',
    subdistrict: 'Jomtien Beach / Dongtan Beach',
    subdistrictTh: 'หาดจอมเทียน / หาดดงตาล',
    code: '20150',
    areas: 'Jomtien Beach Road, Second Road Jomtien, Soi Welcome, Chaiyapruek, Dongtan Beach',
    fee: 60,
    isActive: true,
    freeDeliveryAbove: 600
  },
  {
    id: 'pty-na-jomtien-sattahip',
    city: 'Pattaya',
    district: 'Sattahip (Na Jomtien)',
    districtTh: 'สัตหีบ (นาจอมเทียน)',
    subdistrict: 'Na Jomtien / Baan Amphur',
    subdistrictTh: 'นาจอมเทียน / บ้านอำเภอ',
    code: '20250',
    areas: 'Ocean Marina Yacht Club, Baan Amphur Beach, Columbia Pictures Aquaverse, Sukhumvit South',
    fee: 70,
    isActive: true,
    freeDeliveryAbove: 700
  },
  {
    id: 'pty-east-pattaya-darkside',
    city: 'Pattaya',
    district: 'Bang Lamung',
    districtTh: 'บางละมุง',
    subdistrict: 'East Pattaya / Darkside (Nong Prue East)',
    subdistrictTh: 'พัทยาตะวันออก / ฝั่งรถไฟ-เนินพลับหวาน',
    code: '20150',
    areas: 'Soi Nernplabwan, Soi Khao Noi, Soi Khao Talo, Soi Siam Country Club (Lower)',
    fee: 60,
    isActive: true,
    freeDeliveryAbove: 600
  },
  {
    id: 'pty-bang-lamung-rong-po',
    city: 'Pattaya',
    district: 'Bang Lamung',
    districtTh: 'บางละมุง',
    subdistrict: 'Bang Lamung / Rong Po',
    subdistrictTh: 'บางละมุง / ตลาดโรงโป๊ะ',
    code: '20150',
    areas: 'Rong Po Market, Sukhumvit Highway Km 130–140, North of Naklua, Laem Chabang border',
    fee: 70,
    isActive: true,
    freeDeliveryAbove: 700
  },
  {
    id: 'pty-huai-yai',
    city: 'Pattaya',
    district: 'Bang Lamung',
    districtTh: 'บางละมุง',
    subdistrict: 'Huai Yai',
    subdistrictTh: 'ห้วยใหญ่',
    code: '20150',
    areas: 'Wat Huai Yai, Phoenix Gold Golf Club, French International School area, Chak Ngaeo',
    fee: 80,
    isActive: true,
    freeDeliveryAbove: 800
  },
  {
    id: 'pty-nong-pla-lai',
    city: 'Pattaya',
    district: 'Bang Lamung',
    districtTh: 'บางละมุง',
    subdistrict: 'Nong Pla Lai',
    subdistrictTh: 'หนองปลาไหล',
    code: '20150',
    areas: 'Highway 36, Motorway 7 junction, Regency International School area',
    fee: 80,
    isActive: true,
    freeDeliveryAbove: 800
  },
  {
    id: 'pty-pong-mabprachan',
    city: 'Pattaya',
    district: 'Bang Lamung',
    districtTh: 'บางละมุง',
    subdistrict: 'Pong / Lake Mabprachan',
    subdistrictTh: 'โป่ง / อ่างเก็บน้ำมาบประชัน',
    code: '20150',
    areas: 'Lake Mabprachan Reservoir, Horseshoe Point, Siam Country Club Old Course / Plantation',
    fee: 80,
    isActive: true,
    freeDeliveryAbove: 800
  },
  {
    id: 'pty-takhian-tia',
    city: 'Pattaya',
    district: 'Bang Lamung',
    districtTh: 'บางละมุง',
    subdistrict: 'Takhian Tia',
    subdistrictTh: 'ตะเคียนเตี้ย',
    code: '20150',
    areas: 'Takhian Tia Community, Coconut Plantations, North-East Bang Lamung',
    fee: 80,
    isActive: true,
    freeDeliveryAbove: 800
  },
  {
    id: 'pty-khao-mai-kaeo',
    city: 'Pattaya',
    district: 'Bang Lamung',
    districtTh: 'บางละมุง',
    subdistrict: 'Khao Mai Kaeo',
    subdistrictTh: 'เขาไม้แก้ว',
    code: '20150',
    areas: 'Highway 331 junction, Bira Circuit area, Eastern boundary zone',
    fee: 90,
    isActive: true,
    freeDeliveryAbove: 800
  },
  {
    id: 'pty-koh-lan-island',
    city: 'Pattaya',
    district: 'Bang Lamung',
    districtTh: 'บางละมุง',
    subdistrict: 'Koh Lan (Island Ferry Service)',
    subdistrictTh: 'เกาะล้าน (เรือรับ-ส่งท่าหน้าบ้าน)',
    code: '20150',
    areas: 'Bali Hai Pier connection, Na Baan Pier, Tawaen Beach, Samae Beach',
    fee: 150,
    isActive: true,
    freeDeliveryAbove: 1200
  }
];

// ============================================================================
// 3. COMBINED INITIAL DELIVERY ZONES & BACKWARD COMPATIBILITY
// ============================================================================
export const DEFAULT_ALL_DELIVERY_ZONES = [
  ...DEFAULT_BANGKOK_SUBDISTRICTS,
  ...DEFAULT_PATTAYA_SUBDISTRICTS
];

// Alias for backwards compatibility with existing components
export const DEFAULT_BANGKOK_POSTAL_CODES = DEFAULT_ALL_DELIVERY_ZONES;

export const DEFAULT_DELIVERY_CONFIG = {
  defaultFallbackFee: 70,
  freeDeliveryEnabled: true,
  storeWideFreeDeliveryThreshold: 600,
  noticeTh: 'ค่าบริการรับ-ส่งตามแขวงในกรุงเทพฯ และพัทยา (ส่งฟรีเมื่อสั่งครบ ฿600)',
  noticeEn: 'Pickup & delivery fee charged by sub-district in Bangkok and Pattaya (Free delivery on orders ฿600+)'
};

// ============================================================================
// 4. DISTRICT TO SUB-DISTRICT LOOKUP DICTIONARY
// ============================================================================
export const BANGKOK_DISTRICTS_TO_SUBDISTRICTS = {
  'Watthana (Thonglor, Ekkamai, Phrom Phong)': [
    { name: 'Khlong Toei Nuea', nameTh: 'คลองเตยเหนือ', code: '10110', fee: 50 },
    { name: 'Khlong Tan Nuea', nameTh: 'คลองตันเหนือ', code: '10110', fee: 50 },
    { name: 'Phra Khanong Nuea', nameTh: 'พระโขนงเหนือ', code: '10110', fee: 50 }
  ],
  'Khlong Toei (Phra Khanong, Asok)': [
    { name: 'Khlong Toei', nameTh: 'คลองเตย', code: '10110', fee: 50 },
    { name: 'Khlong Tan', nameTh: 'คลองตัน', code: '10110', fee: 50 },
    { name: 'Phra Khanong', nameTh: 'พระโขนง', code: '10110', fee: 50 }
  ],
  'Bang Rak (Silom, Surawong)': [
    { name: 'Si Lom', nameTh: 'สีลม', code: '10500', fee: 50 },
    { name: 'Suriyawong', nameTh: 'สุริยวงศ์', code: '10500', fee: 50 },
    { name: 'Si Phraya', nameTh: 'สี่พระยา', code: '10500', fee: 50 },
    { name: 'Maha Phruettharam', nameTh: 'มหาพฤฒาราม', code: '10500', fee: 50 },
    { name: 'Bang Rak', nameTh: 'บางรัก', code: '10500', fee: 50 }
  ],
  'Sathon (Sathorn, Chong Nonsi)': [
    { name: 'Thung Maha Mek', nameTh: 'ทุ่งมหาเมฆ', code: '10120', fee: 50 },
    { name: 'Yan Nawa', nameTh: 'ยานนาวา', code: '10120', fee: 50 },
    { name: 'Thung Wat Don', nameTh: 'ทุ่งวัดดอน', code: '10120', fee: 50 }
  ],
  'Pathum Wan (Siam, Chidlom, Ploenchit)': [
    { name: 'Lumphini', nameTh: 'ลุมพินี', code: '10330', fee: 50 },
    { name: 'Pathum Wan', nameTh: 'ปทุมวัน', code: '10330', fee: 50 },
    { name: 'Wang Mai', nameTh: 'วังใหม่', code: '10330', fee: 50 },
    { name: 'Rong Mueang', nameTh: 'รองเมือง', code: '10330', fee: 50 }
  ],
  'Phaya Thai (Ari, Sanam Pao)': [
    { name: 'Sam Sen Nai', nameTh: 'สามเสนใน', code: '10400', fee: 50 },
    { name: 'Phaya Thai', nameTh: 'พญาไท', code: '10400', fee: 50 }
  ],
  'Ratchathewi': [
    { name: 'Thung Phaya Thai', nameTh: 'ทุ่งพญาไท', code: '10400', fee: 50 },
    { name: 'Thanon Phetchaburi', nameTh: 'ถนนเพชรบุรี', code: '10400', fee: 50 },
    { name: 'Makkasan', nameTh: 'มักกะสัน', code: '10400', fee: 50 }
  ],
  'Huai Khwang (Ratchada, Rama 9)': [
    { name: 'Huai Khwang', nameTh: 'ห้วยขวาง', code: '10310', fee: 60 },
    { name: 'Bang Kapi', nameTh: 'บางกะปิ', code: '10310', fee: 60 },
    { name: 'Sam Sen Nok', nameTh: 'สามเสนนอก', code: '10310', fee: 60 }
  ],
  'Din Daeng': [
    { name: 'Din Daeng', nameTh: 'ดินแดง', code: '10400', fee: 50 },
    { name: 'Ratchadaphisek', nameTh: 'รัชดาภิเษก', code: '10400', fee: 50 }
  ],
  'Yan Nawa (Rama 3)': [
    { name: 'Chong Nonsi', nameTh: 'ช่องนนทรี', code: '10120', fee: 50 },
    { name: 'Bang Phongphang', nameTh: 'บางโพงพาง', code: '10120', fee: 50 }
  ],
  'Bang Kho Laem': [
    { name: 'Bang Kho Laem', nameTh: 'บางคอแหลม', code: '10120', fee: 50 },
    { name: 'Wat Phraya Krai', nameTh: 'วัดพระยาไกร', code: '10120', fee: 50 },
    { name: 'Bang Khlo', nameTh: 'บางโคล่', code: '10120', fee: 50 }
  ],
  'Bang Na': [
    { name: 'Bang Na Nuea', nameTh: 'บางนาเหนือ', code: '10260', fee: 60 },
    { name: 'Bang Na Tai', nameTh: 'บางนาใต้', code: '10260', fee: 60 }
  ],
  'Phra Khanong': [
    { name: 'Bang Chak', nameTh: 'บางจาก', code: '10260', fee: 60 }
  ],
  'Chatuchak (Mo Chit, Lat Phrao)': [
    { name: 'Chomphon', nameTh: 'จอมพล', code: '10900', fee: 60 },
    { name: 'Chatuchak', nameTh: 'จตุจักร', code: '10900', fee: 60 },
    { name: 'Chan Kasem', nameTh: 'จันทรเกษม', code: '10900', fee: 60 },
    { name: 'Lat Yao', nameTh: 'ลาดยาว', code: '10900', fee: 60 },
    { name: 'Sena Nikhom', nameTh: 'เสนานิคม', code: '10900', fee: 60 }
  ],
  'Bang Sue': [
    { name: 'Bang Sue', nameTh: 'บางซื่อ', code: '10800', fee: 70 },
    { name: 'Wong Sawang', nameTh: 'วงศ์สว่าง', code: '10800', fee: 70 }
  ],
  'Dusit': [
    { name: 'Dusit / Wachira', nameTh: 'ดุสิต / วชิรพยาบาล', code: '10300', fee: 60 }
  ],
  'Phra Nakhon': [
    { name: 'Phra Nakhon Central', nameTh: 'พระนคร', code: '10200', fee: 60 }
  ],
  'Samphanthawong': [
    { name: 'Samphanthawong / Yaowarat', nameTh: 'สัมพันธวงศ์ / เยาวราช', code: '10100', fee: 50 }
  ],
  'Pom Prap Sattru Phai': [
    { name: 'Pom Prap / Khlong Mahanak', nameTh: 'ป้อมปราบ / คลองมหานาค', code: '10100', fee: 50 }
  ],
  'Khlong San': [
    { name: 'Khlong Ton Sai / Khlong San', nameTh: 'คลองต้นไทร / คลองสาน', code: '10600', fee: 60 }
  ],
  'Thon Buri': [
    { name: 'Talat Phlu / Wongwian Yai', nameTh: 'ตลาดพลู / วงเวียนใหญ่', code: '10600', fee: 60 }
  ],
  'Bangkok Yai': [
    { name: 'Wat Arun / Tha Phra', nameTh: 'วัดอรุณ / ท่าพระ', code: '10600', fee: 60 }
  ],
  'Bangkok Noi': [
    { name: 'Siri Rat / Pinklao', nameTh: 'ศิริราช / ปิ่นเกล้า', code: '10700', fee: 70 }
  ],
  'Bang Phlat': [
    { name: 'Bang Phlat / Bang O', nameTh: 'บางพลัด / บางอ้อ', code: '10700', fee: 70 }
  ],
  'Suan Luang': [
    { name: 'On Nut / Phatthanakan', nameTh: 'อ่อนนุช / พัฒนาการ', code: '10250', fee: 70 }
  ],
  'Prawet': [
    { name: 'Prawet / Nong Bon', nameTh: 'ประเวศ / หนองบอน', code: '10250', fee: 70 }
  ],
  'Wang Thonglang': [
    { name: 'Phlabphla / Town in Town', nameTh: 'พลับพลา / ทาวน์อินทาวน์', code: '10310', fee: 60 }
  ],
  'Lat Phrao': [
    { name: 'Lat Phrao / Chok Chai 4', nameTh: 'ลาดพร้าว / โชคชัย 4', code: '10230', fee: 70 }
  ],
  'Bang Kapi': [
    { name: 'Hua Mak / Khlong Chan', nameTh: 'หัวหมาก / คลองจั่น', code: '10240', fee: 70 }
  ],
  'Bueng Kum': [
    { name: 'Khlong Kum / Nawamin', nameTh: 'คลองกุ่ม / นวมินทร์', code: '10240', fee: 70 }
  ],
  'Don Mueang': [
    { name: 'Sanambin / Song Prapha', nameTh: 'สนามบิน / สรงประภา', code: '10210', fee: 80 }
  ],
  'Lak Si': [
    { name: 'Thung Song Hong / Chaeng Watthana', nameTh: 'ทุ่งสองห้อง / แจ้งวัฒนะ', code: '10210', fee: 80 }
  ],
  'Bang Khen': [
    { name: 'Anusawari / Ram Inthra', nameTh: 'อนุสาวรีย์ / รามอินทรา', code: '10220', fee: 80 }
  ],
  'Sai Mai': [
    { name: 'Sai Mai / O Ngoen', nameTh: 'สายไหม / ออเงิน', code: '10220', fee: 80 }
  ],
  'Phasi Charoen': [
    { name: 'Bang Wa / Khlong Khwang', nameTh: 'บางหว้า / คลองขวาง', code: '10160', fee: 80 }
  ],
  'Bang Khae': [
    { name: 'Bang Khae / Lak Song', nameTh: 'บางแค / หลักสอง', code: '10160', fee: 80 }
  ],
  'Taling Chan': [
    { name: 'Taling Chan / Chimphli', nameTh: 'ตลิ่งชัน / ฉิมพลี', code: '10170', fee: 80 }
  ],
  'Chom Thong': [
    { name: 'Chom Thong / Bang Mod', nameTh: 'จอมทอง / บางมด', code: '10150', fee: 80 }
  ],
  'Bang Khun Thian': [
    { name: 'Tha Kham / Samae Dam', nameTh: 'ท่าข้าม / แสมดำ', code: '10150', fee: 80 }
  ],
  'Rat Burana': [
    { name: 'Rat Burana / Bang Pakok', nameTh: 'ราษฎร์บูรณะ / บางปะกอก', code: '10140', fee: 70 }
  ],
  'Thung Khru': [
    { name: 'Thung Khru / Bang Mod', nameTh: 'ทุ่งครุ / บางมด', code: '10140', fee: 70 }
  ],
  'Min Buri': [
    { name: 'Min Buri / Saen Saep', nameTh: 'มีนบุรี / แสนแสบ', code: '10510', fee: 90 }
  ],
  'Lat Krabang': [
    { name: 'Lat Krabang / Khlong Sam Prawet', nameTh: 'ลาดกระบัง / คลองสามประเวศ', code: '10520', fee: 90 }
  ],
  'Other Bangkok Central Area': [
    { name: 'Bangkok Central', nameTh: 'กรุงเทพฯ ชั้นใน', code: '10110', fee: 50 }
  ]
};

// Pattaya Sub-districts array for direct selection
export const PATTAYA_SUBDISTRICTS_LIST = DEFAULT_PATTAYA_SUBDISTRICTS.map(z => ({
  id: z.id,
  name: z.subdistrict,
  nameTh: z.subdistrictTh,
  district: z.district,
  code: z.code,
  fee: z.fee,
  areas: z.areas
}));

// Quick fallback District to Postal Code
export const DISTRICT_TO_POSTAL_CODE = {
  // Bangkok Common
  'Watthana (Thonglor, Ekkamai, Phrom Phong)': '10110',
  'Khlong Toei (Phra Khanong, Asok)': '10110',
  'Bang Rak (Silom, Surawong)': '10500',
  'Sathon (Sathorn, Chong Nonsi)': '10120',
  'Pathum Wan (Siam, Chidlom, Ploenchit)': '10330',
  'Phaya Thai (Ari, Sanam Pao)': '10400',
  'Ratchathewi': '10400',
  'Huai Khwang (Ratchada, Rama 9)': '10310',
  'Chatuchak (Mo Chit, Lat Phrao)': '10900',
  'Din Daeng': '10400',
  'Yan Nawa (Rama 3)': '10120',
  'Bang Kho Laem': '10120',
  'Bang Na': '10260',
  'Phra Khanong': '10260',
  'Bang Sue': '10800',
  'Dusit': '10300',
  'Phra Nakhon': '10200',
  'Samphanthawong': '10100',
  'Pom Prap Sattru Phai': '10100',
  'Khlong San': '10600',
  'Thon Buri': '10600',
  'Bangkok Yai': '10600',
  'Bangkok Noi': '10700',
  'Bang Phlat': '10700',
  'Suan Luang': '10250',
  'Prawet': '10250',
  'Wang Thonglang': '10310',
  'Lat Phrao': '10230',
  'Bang Kapi': '10240',
  'Bueng Kum': '10240',
  'Don Mueang': '10210',
  'Lak Si': '10210',
  'Bang Khen': '10220',
  'Sai Mai': '10220',
  'Phasi Charoen': '10160',
  'Bang Khae': '10160',
  'Taling Chan': '10170',
  'Chom Thong': '10150',
  'Bang Khun Thian': '10150',
  'Rat Burana': '10140',
  'Thung Khru': '10140',
  'Min Buri': '10510',
  'Lat Krabang': '10520',
  'Other Bangkok Central Area': '10110',

  // Pattaya Districts
  'Bang Lamung': '20150',
  'Bang Lamung (Pattaya)': '20150',
  'Sattahip (Na Jomtien)': '20250'
};

// ============================================================================
// 5. INTELLIGENT DELIVERY FEE CALCULATOR
// ============================================================================
export function calculateDeliveryFee(
  locationInput,
  subtotal = 0,
  zonesList = DEFAULT_ALL_DELIVERY_ZONES,
  deliveryConfig = DEFAULT_DELIVERY_CONFIG
) {
  const zones = Array.isArray(zonesList) && zonesList.length > 0 ? zonesList : DEFAULT_ALL_DELIVERY_ZONES;
  const config = deliveryConfig || DEFAULT_DELIVERY_CONFIG;
  const fallbackFee = config.defaultFallbackFee !== undefined ? Number(config.defaultFallbackFee) : 60;
  const isFreeDeliveryEnabled = config.freeDeliveryEnabled !== false;

  let queryCity = '';
  let queryDistrict = '';
  let querySubdistrict = '';
  let queryPostal = '';
  let queryId = '';

  if (typeof locationInput === 'string') {
    const trimmed = locationInput.trim();
    if (/^\d{5}$/.test(trimmed)) {
      queryPostal = trimmed;
    } else {
      querySubdistrict = trimmed;
    }
  } else if (locationInput && typeof locationInput === 'object') {
    queryCity = (locationInput.city || '').trim().toLowerCase();
    queryDistrict = (locationInput.district || '').trim().toLowerCase();
    querySubdistrict = (locationInput.subdistrict || '').trim().toLowerCase();
    queryPostal = (locationInput.postalCode || locationInput.code || '').trim();
    queryId = (locationInput.id || locationInput.zoneId || '').trim().toLowerCase();
  }

  // 1. Direct ID match
  let matched = null;
  if (queryId) {
    matched = zones.find(z => (z.id || '').toLowerCase() === queryId);
  }

  // 2. City + Subdistrict match
  if (!matched && querySubdistrict) {
    matched = zones.find(z => {
      const zCity = (z.city || '').toLowerCase();
      const zSub = (z.subdistrict || '').toLowerCase();
      const zSubTh = (z.subdistrictTh || '').toLowerCase();
      
      const cityMatches = !queryCity || zCity === queryCity;
      const subMatches = zSub === querySubdistrict || 
                         zSubTh === querySubdistrict ||
                         querySubdistrict.includes(zSub) || 
                         zSub.includes(querySubdistrict);

      return cityMatches && subMatches;
    });
  }

  // 3. District + Postal match
  if (!matched && queryDistrict && queryPostal) {
    matched = zones.find(z => {
      const zDist = (z.district || '').toLowerCase();
      return (zDist.includes(queryDistrict) || queryDistrict.includes(zDist)) && z.code === queryPostal;
    });
  }

  // 4. City + Postal Code match
  if (!matched && queryPostal) {
    matched = zones.find(z => {
      const cityMatches = !queryCity || (z.city || '').toLowerCase() === queryCity;
      return cityMatches && z.code === queryPostal;
    });
    // Fallback to any postal match if city-constrained didn't find one
    if (!matched) {
      matched = zones.find(z => z.code === queryPostal);
    }
  }

  // 5. Check if zone is deactivated
  if (matched && matched.isActive === false) {
    return {
      fee: 0,
      isAvailable: false,
      reason: `Zone ${matched.subdistrict || matched.district} (${matched.city}) is currently outside our service coverage.`,
      zoneName: `${matched.city} - ${matched.subdistrict || matched.district}`,
      city: matched.city,
      district: matched.district,
      subdistrict: matched.subdistrict,
      postalCode: matched.code
    };
  }

  let fee = matched ? Number(matched.fee) : fallbackFee;
  let isFree = false;
  let reason = '';
  const threshold = matched?.freeDeliveryAbove || config.storeWideFreeDeliveryThreshold || 600;

  if (isFreeDeliveryEnabled && Number(subtotal) >= Number(threshold)) {
    isFree = true;
    fee = 0;
    reason = `Free pickup & delivery promo applied (Orders ฿${threshold}+ in ${matched?.city || 'service'} zone)`;
  } else if (matched) {
    reason = `Fixed delivery fee of ฿${fee} for ${matched.city} · ${matched.subdistrict} (${matched.code})`;
  } else {
    reason = `Standard delivery fee of ฿${fee} applied`;
  }

  return {
    fee,
    isFree,
    isAvailable: true,
    zoneName: matched ? `${matched.city} · ${matched.subdistrict || matched.district}` : 'Standard Area',
    city: matched?.city || (queryCity ? queryCity.charAt(0).toUpperCase() + queryCity.slice(1) : (queryPostal?.startsWith('20') ? 'Pattaya' : 'Bangkok')),
    district: matched?.district || queryDistrict || 'Central',
    subdistrict: matched?.subdistrict || querySubdistrict || '',
    postalCode: matched?.code || queryPostal || '10110',
    reason,
    freeDeliveryAbove: threshold
  };
}
