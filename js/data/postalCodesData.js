// Bangkok & Pattaya Sub-districts, Zones, and Delivery Fee Configuration
// Complete coverage of all 50 Bangkok Districts and 180 Sub-districts (Khwaeng)
// Plus dedicated coverage for Pattaya Zones

export const SERVICE_CITIES = ['Bangkok', 'Pattaya'];

// ============================================================================
// 1. ALL 180 BANGKOK SUB-DISTRICTS & DELIVERY RATES
// ============================================================================
export const DEFAULT_BANGKOK_SUBDISTRICTS = [
  {
    "id": "bkk-watthana-khlong-toei-nuea",
    "city": "Bangkok",
    "district": "Watthana",
    "districtTh": "วัฒนา",
    "subdistrict": "Khlong Toei Nuea",
    "subdistrictTh": "คลองเตยเหนือ",
    "code": "10110",
    "areas": "Sukhumvit 1–39, Asoke (Sukhumvit 21), BTS Asok, MRT Sukhumvit, Prasanmit",
    "fee": 50,
    "isActive": true,
    "freeDeliveryAbove": 600
  },
  {
    "id": "bkk-watthana-khlong-tan-nuea",
    "city": "Bangkok",
    "district": "Watthana",
    "districtTh": "วัฒนา",
    "subdistrict": "Khlong Tan Nuea",
    "subdistrictTh": "คลองตันเหนือ",
    "code": "10110",
    "areas": "Thonglor (Sukhumvit 55), Phrom Phong (Sukhumvit 39–49), Ekkamai (Sukhumvit 63)",
    "fee": 50,
    "isActive": true,
    "freeDeliveryAbove": 600
  },
  {
    "id": "bkk-watthana-phra-khanong-nuea",
    "city": "Bangkok",
    "district": "Watthana",
    "districtTh": "วัฒนา",
    "subdistrict": "Phra Khanong Nuea",
    "subdistrictTh": "พระโขนงเหนือ",
    "code": "10110",
    "areas": "Sukhumvit 65–71, Pridi Banomyong, BTS Phra Khanong",
    "fee": 50,
    "isActive": true,
    "freeDeliveryAbove": 600
  },
  {
    "id": "bkk-khlong-toei-khlong-toei",
    "city": "Bangkok",
    "district": "Khlong Toei",
    "districtTh": "คลองเตย",
    "subdistrict": "Khlong Toei",
    "subdistrictTh": "คลองเตย",
    "code": "10110",
    "areas": "Rama 4 Road, Khlong Toei Market, Port of Bangkok, MedPark Hospital, Queen Sirikit Center",
    "fee": 50,
    "isActive": true,
    "freeDeliveryAbove": 600
  },
  {
    "id": "bkk-khlong-toei-khlong-tan",
    "city": "Bangkok",
    "district": "Khlong Toei",
    "districtTh": "คลองเตย",
    "subdistrict": "Khlong Tan",
    "subdistrictTh": "คลองตัน",
    "code": "10110",
    "areas": "Sukhumvit 22–36, Phrom Phong (South), Soi Ari, Suan Phlu links",
    "fee": 50,
    "isActive": true,
    "freeDeliveryAbove": 600
  },
  {
    "id": "bkk-khlong-toei-phra-khanong",
    "city": "Bangkok",
    "district": "Khlong Toei",
    "districtTh": "คลองเตย",
    "subdistrict": "Phra Khanong",
    "subdistrictTh": "พระโขนง",
    "code": "10110",
    "areas": "Sukhumvit 40–50, Kluai Nam Thai, Bangkok University (Kluai Nam Thai)",
    "fee": 50,
    "isActive": true,
    "freeDeliveryAbove": 600
  },
  {
    "id": "bkk-bang-rak-maha-phruettharam",
    "city": "Bangkok",
    "district": "Bang Rak",
    "districtTh": "บางรัก",
    "subdistrict": "Maha Phruettharam",
    "subdistrictTh": "มหาพฤฒาราม",
    "code": "10500",
    "areas": "Hua Lamphong border, Rama 4, Mahanakhon bypass, Wat Maha Phruettharam",
    "fee": 50,
    "isActive": true,
    "freeDeliveryAbove": 600
  },
  {
    "id": "bkk-bang-rak-si-phraya",
    "city": "Bangkok",
    "district": "Bang Rak",
    "districtTh": "บางรัก",
    "subdistrict": "Si Phraya",
    "subdistrictTh": "สี่พระยา",
    "code": "10500",
    "areas": "Si Phraya Pier, Charoen Krung, Captain Bush Lane, River City border",
    "fee": 50,
    "isActive": true,
    "freeDeliveryAbove": 600
  },
  {
    "id": "bkk-bang-rak-si-lom",
    "city": "Bangkok",
    "district": "Bang Rak",
    "districtTh": "บางรัก",
    "subdistrict": "Si Lom",
    "subdistrictTh": "สีลม",
    "code": "10500",
    "areas": "BTS Sala Daeng, MRT Silom, Convent Rd, Patpong, Silom Complex",
    "fee": 50,
    "isActive": true,
    "freeDeliveryAbove": 600
  },
  {
    "id": "bkk-bang-rak-suriyawong",
    "city": "Bangkok",
    "district": "Bang Rak",
    "districtTh": "บางรัก",
    "subdistrict": "Suriyawong",
    "subdistrictTh": "สุริยวงศ์",
    "code": "10500",
    "areas": "Surawong Road, Thaniya, Decho Road, Neilson Hays Library",
    "fee": 50,
    "isActive": true,
    "freeDeliveryAbove": 600
  },
  {
    "id": "bkk-bang-rak-bang-rak",
    "city": "Bangkok",
    "district": "Bang Rak",
    "districtTh": "บางรัก",
    "subdistrict": "Bang Rak",
    "subdistrictTh": "บางรัก",
    "code": "10500",
    "areas": "BTS Saphan Taksin, Robinson Bangrak, Oriental Pier, Mandarin Oriental",
    "fee": 50,
    "isActive": true,
    "freeDeliveryAbove": 600
  },
  {
    "id": "bkk-sathon-thung-maha-mek",
    "city": "Bangkok",
    "district": "Sathon",
    "districtTh": "สาทร",
    "subdistrict": "Thung Maha Mek",
    "subdistrictTh": "ทุ่งมหาเมฆ",
    "code": "10120",
    "areas": "Sathorn Road (North/South), Suan Phlu, Yen Akat, Nang Linchi, Australian Embassy",
    "fee": 50,
    "isActive": true,
    "freeDeliveryAbove": 600
  },
  {
    "id": "bkk-sathon-yan-nawa",
    "city": "Bangkok",
    "district": "Sathon",
    "districtTh": "สาทร",
    "subdistrict": "Yan Nawa",
    "subdistrictTh": "ยานนาวา",
    "code": "10120",
    "areas": "Saint Louis, Chan Road, Surasak BTS, Sathorn Soi 11, Assumption College",
    "fee": 50,
    "isActive": true,
    "freeDeliveryAbove": 600
  },
  {
    "id": "bkk-sathon-thung-wat-don",
    "city": "Bangkok",
    "district": "Sathon",
    "districtTh": "สาทร",
    "subdistrict": "Thung Wat Don",
    "subdistrictTh": "ทุ่งวัดดอน",
    "code": "10120",
    "areas": "Charoen Rat, Chan Road (Lower), Wat Don, expressway junction",
    "fee": 50,
    "isActive": true,
    "freeDeliveryAbove": 600
  },
  {
    "id": "bkk-pathum-wan-rong-mueang",
    "city": "Bangkok",
    "district": "Pathum Wan",
    "districtTh": "ปทุมวัน",
    "subdistrict": "Rong Mueang",
    "subdistrictTh": "รองเมือง",
    "code": "10330",
    "areas": "Ban That Thong culinary street, Charoen Mueang, Rama 6 link",
    "fee": 50,
    "isActive": true,
    "freeDeliveryAbove": 600
  },
  {
    "id": "bkk-pathum-wan-wang-mai",
    "city": "Bangkok",
    "district": "Pathum Wan",
    "districtTh": "ปทุมวัน",
    "subdistrict": "Wang Mai",
    "subdistrictTh": "วังใหม่",
    "code": "10330",
    "areas": "MBK Center, National Stadium, Chulalongkorn University, Stadium One",
    "fee": 50,
    "isActive": true,
    "freeDeliveryAbove": 600
  },
  {
    "id": "bkk-pathum-wan-pathum-wan",
    "city": "Bangkok",
    "district": "Pathum Wan",
    "districtTh": "ปทุมวัน",
    "subdistrict": "Pathum Wan",
    "subdistrictTh": "ปทุมวัน",
    "code": "10330",
    "areas": "Siam Paragon, Siam Square, CentralWorld, Siam Discovery, Erawan",
    "fee": 50,
    "isActive": true,
    "freeDeliveryAbove": 600
  },
  {
    "id": "bkk-pathum-wan-lumphini",
    "city": "Bangkok",
    "district": "Pathum Wan",
    "districtTh": "ปทุมวัน",
    "subdistrict": "Lumphini",
    "subdistrictTh": "ลุมพินี",
    "code": "10330",
    "areas": "Lumphini Park, Wireless Road (Witthayu), Langsuan, Ploenchit, Sindhorn Village",
    "fee": 50,
    "isActive": true,
    "freeDeliveryAbove": 600
  },
  {
    "id": "bkk-phaya-thai-sam-sen-nai",
    "city": "Bangkok",
    "district": "Phaya Thai",
    "districtTh": "พญาไท",
    "subdistrict": "Sam Sen Nai",
    "subdistrictTh": "สามเสนใน",
    "code": "10400",
    "areas": "BTS Ari, Sanam Pao, Phahonyothin Road, Soi Aree 1–7, La Villa Ari",
    "fee": 50,
    "isActive": true,
    "freeDeliveryAbove": 600
  },
  {
    "id": "bkk-phaya-thai-phaya-thai",
    "city": "Bangkok",
    "district": "Phaya Thai",
    "districtTh": "พญาไท",
    "subdistrict": "Phaya Thai",
    "subdistrictTh": "พญาไท",
    "code": "10400",
    "areas": "Pradipat Road, Rama VI road, Saphan Khwai border, Government Savings Bank HQ",
    "fee": 50,
    "isActive": true,
    "freeDeliveryAbove": 600
  },
  {
    "id": "bkk-huai-khwang-huai-khwang",
    "city": "Bangkok",
    "district": "Huai Khwang",
    "districtTh": "ห้วยขวาง",
    "subdistrict": "Huai Khwang",
    "subdistrictTh": "ห้วยขวาง",
    "code": "10310",
    "areas": "Huai Khwang Night Market, Pracha Songkhro, MRT Huai Khwang, Ganesha Shrine",
    "fee": 60,
    "isActive": true,
    "freeDeliveryAbove": 600
  },
  {
    "id": "bkk-huai-khwang-bang-kapi",
    "city": "Bangkok",
    "district": "Huai Khwang",
    "districtTh": "ห้วยขวาง",
    "subdistrict": "Bang Kapi",
    "subdistrictTh": "บางกะปิ",
    "code": "10310",
    "areas": "Rama 9, RCA, Asoke-Din Daeng, Central Rama 9, Fortune Town, Show DC",
    "fee": 60,
    "isActive": true,
    "freeDeliveryAbove": 600
  },
  {
    "id": "bkk-huai-khwang-sam-sen-nok",
    "city": "Bangkok",
    "district": "Huai Khwang",
    "districtTh": "ห้วยขวาง",
    "subdistrict": "Sam Sen Nok",
    "subdistrictTh": "สามเสนนอก",
    "code": "10310",
    "areas": "MRT Sutthisan, Meng Jai, Pracha Uthit Road, CyberWorld, The Street Ratchada",
    "fee": 60,
    "isActive": true,
    "freeDeliveryAbove": 600
  },
  {
    "id": "bkk-chatuchak-lat-yao",
    "city": "Bangkok",
    "district": "Chatuchak",
    "districtTh": "จตุจักร",
    "subdistrict": "Lat Yao",
    "subdistrictTh": "ลาดยาว",
    "code": "10900",
    "areas": "Kasetsart University, Ngamwongwan, Vibhavadi Rangsit, SCB Park Plaza",
    "fee": 60,
    "isActive": true,
    "freeDeliveryAbove": 600
  },
  {
    "id": "bkk-chatuchak-sena-nikhom",
    "city": "Bangkok",
    "district": "Chatuchak",
    "districtTh": "จตุจักร",
    "subdistrict": "Sena Nikhom",
    "subdistrictTh": "เสนานิคม",
    "code": "10900",
    "areas": "Sena Nikhom 1, Phahonyothin 32, Wang Hin, Mayo Hospital area",
    "fee": 60,
    "isActive": true,
    "freeDeliveryAbove": 600
  },
  {
    "id": "bkk-chatuchak-chan-kasem",
    "city": "Bangkok",
    "district": "Chatuchak",
    "districtTh": "จตุจักร",
    "subdistrict": "Chan Kasem",
    "subdistrictTh": "จันทรเกษม",
    "code": "10900",
    "areas": "Ratchadaphisek Court, Chandrakasem Rajabhat University, Ratchada 32–36",
    "fee": 60,
    "isActive": true,
    "freeDeliveryAbove": 600
  },
  {
    "id": "bkk-chatuchak-chomphon",
    "city": "Bangkok",
    "district": "Chatuchak",
    "districtTh": "จตุจักร",
    "subdistrict": "Chomphon",
    "subdistrictTh": "จอมพล",
    "code": "10900",
    "areas": "Central Ladprao, Union Mall, Phahonyothin MRT, Ha Yaek Lat Phrao",
    "fee": 60,
    "isActive": true,
    "freeDeliveryAbove": 600
  },
  {
    "id": "bkk-chatuchak-chatuchak",
    "city": "Bangkok",
    "district": "Chatuchak",
    "districtTh": "จตุจักร",
    "subdistrict": "Chatuchak",
    "subdistrictTh": "จตุจักร",
    "code": "10900",
    "areas": "Chatuchak Weekend Market, BTS Mo Chit, Chatuchak Park, JJ Mall",
    "fee": 60,
    "isActive": true,
    "freeDeliveryAbove": 600
  },
  {
    "id": "bkk-din-daeng-din-daeng",
    "city": "Bangkok",
    "district": "Din Daeng",
    "districtTh": "ดินแดง",
    "subdistrict": "Din Daeng",
    "subdistrictTh": "ดินแดง",
    "code": "10400",
    "areas": "Din Daeng Flat, Thai-Japan Youth Center, Mit Maitri, Bangkok City Hall 2",
    "fee": 60,
    "isActive": true,
    "freeDeliveryAbove": 600
  },
  {
    "id": "bkk-din-daeng-ratchadaphisek",
    "city": "Bangkok",
    "district": "Din Daeng",
    "districtTh": "ดินแดง",
    "subdistrict": "Ratchadaphisek",
    "subdistrictTh": "รัชดาภิเษก",
    "code": "10400",
    "areas": "The Esplanade, The One Ratchada, MRT Thailand Cultural Centre, AIA Capital",
    "fee": 60,
    "isActive": true,
    "freeDeliveryAbove": 600
  },
  {
    "id": "bkk-yan-nawa-chong-nonsi",
    "city": "Bangkok",
    "district": "Yan Nawa",
    "districtTh": "ยานนาวา",
    "subdistrict": "Chong Nonsi",
    "subdistrictTh": "ช่องนนทรี",
    "code": "10120",
    "areas": "Rama 3, BRT Chong Nonsi, Central Rama 3, Naradhiwas, SV City",
    "fee": 60,
    "isActive": true,
    "freeDeliveryAbove": 600
  },
  {
    "id": "bkk-yan-nawa-bang-phongphang",
    "city": "Bangkok",
    "district": "Yan Nawa",
    "districtTh": "ยานนาวา",
    "subdistrict": "Bang Phongphang",
    "subdistrictTh": "บางโพงพาง",
    "code": "10120",
    "areas": "Sathu Pradit, Bhumibol Bridge, Industrial Ring Road, Krungsri Riverside HQ",
    "fee": 60,
    "isActive": true,
    "freeDeliveryAbove": 600
  },
  {
    "id": "bkk-phra-nakhon-phra-borom-maha-ratchawang",
    "city": "Bangkok",
    "district": "Phra Nakhon",
    "districtTh": "พระนคร",
    "subdistrict": "Phra Borom Maha Ratchawang",
    "subdistrictTh": "พระบรมมหาราชวัง",
    "code": "10200",
    "areas": "Grand Palace, Sanam Luang, Wat Phra Kaew, Tha Chang Pier",
    "fee": 60,
    "isActive": true,
    "freeDeliveryAbove": 600
  },
  {
    "id": "bkk-phra-nakhon-wang-burapha-phirom",
    "city": "Bangkok",
    "district": "Phra Nakhon",
    "districtTh": "พระนคร",
    "subdistrict": "Wang Burapha Phirom",
    "subdistrictTh": "วังบูรพาภิรมย์",
    "code": "10200",
    "areas": "Wang Burapha, Phahurat (Little India), Mega Plaza, The Old Siam",
    "fee": 60,
    "isActive": true,
    "freeDeliveryAbove": 600
  },
  {
    "id": "bkk-phra-nakhon-wat-ratchabophit",
    "city": "Bangkok",
    "district": "Phra Nakhon",
    "districtTh": "พระนคร",
    "subdistrict": "Wat Ratchabophit",
    "subdistrictTh": "วัดราชบพิธ",
    "code": "10200",
    "areas": "Wat Ratchabophit, Ministry of Interior, Atsadang Road",
    "fee": 60,
    "isActive": true,
    "freeDeliveryAbove": 600
  },
  {
    "id": "bkk-phra-nakhon-samran-rat",
    "city": "Bangkok",
    "district": "Phra Nakhon",
    "districtTh": "พระนคร",
    "subdistrict": "Samran Rat",
    "subdistrictTh": "สำราญราษฎร์",
    "code": "10200",
    "areas": "Pratu Phi, Jay Fai, Thip Samai Pad Thai, Mahachai Road",
    "fee": 60,
    "isActive": true,
    "freeDeliveryAbove": 600
  },
  {
    "id": "bkk-phra-nakhon-san-chao-pho-suea",
    "city": "Bangkok",
    "district": "Phra Nakhon",
    "districtTh": "พระนคร",
    "subdistrict": "San Chao Pho Suea",
    "subdistrictTh": "ศาลเจ้าพ่อเสือ",
    "code": "10200",
    "areas": "Tiger God Shrine, Tanao Road, Bamrung Mueang",
    "fee": 60,
    "isActive": true,
    "freeDeliveryAbove": 600
  },
  {
    "id": "bkk-phra-nakhon-sao-chingcha",
    "city": "Bangkok",
    "district": "Phra Nakhon",
    "districtTh": "พระนคร",
    "subdistrict": "Sao Chingcha",
    "subdistrictTh": "เสาชิงช้า",
    "code": "10200",
    "areas": "Giant Swing, Bangkok City Hall, Wat Suthat",
    "fee": 60,
    "isActive": true,
    "freeDeliveryAbove": 600
  },
  {
    "id": "bkk-phra-nakhon-bowon-niwet",
    "city": "Bangkok",
    "district": "Phra Nakhon",
    "districtTh": "พระนคร",
    "subdistrict": "Bowon Niwet",
    "subdistrictTh": "บวรนิเวศ",
    "code": "10200",
    "areas": "Wat Bowonniwet, Phra Sumen Road, Sip Sam Hang",
    "fee": 60,
    "isActive": true,
    "freeDeliveryAbove": 600
  },
  {
    "id": "bkk-phra-nakhon-talat-yot",
    "city": "Bangkok",
    "district": "Phra Nakhon",
    "districtTh": "พระนคร",
    "subdistrict": "Talat Yot",
    "subdistrictTh": "ตลาดยอด",
    "code": "10200",
    "areas": "Khao San Road, Bang Lamphu, Rambuttri",
    "fee": 60,
    "isActive": true,
    "freeDeliveryAbove": 600
  },
  {
    "id": "bkk-phra-nakhon-chana-songkhram",
    "city": "Bangkok",
    "district": "Phra Nakhon",
    "districtTh": "พระนคร",
    "subdistrict": "Chana Songkhram",
    "subdistrictTh": "ชนะสงคราม",
    "code": "10200",
    "areas": "Wat Chana Songkhram, Phra Athit Road, Phra Sumen Fort, Santichaiprakarn",
    "fee": 60,
    "isActive": true,
    "freeDeliveryAbove": 600
  },
  {
    "id": "bkk-phra-nakhon-ban-phan-thom",
    "city": "Bangkok",
    "district": "Phra Nakhon",
    "districtTh": "พระนคร",
    "subdistrict": "Ban Phan Thom",
    "subdistrictTh": "บ้านพานถม",
    "code": "10200",
    "areas": "Wisut Kasat Road, Prachathipatai, Phan Thom",
    "fee": 60,
    "isActive": true,
    "freeDeliveryAbove": 600
  },
  {
    "id": "bkk-phra-nakhon-bang-khun-phrom",
    "city": "Bangkok",
    "district": "Phra Nakhon",
    "districtTh": "พระนคร",
    "subdistrict": "Bang Khun Phrom",
    "subdistrictTh": "บางขุนพรหม",
    "code": "10200",
    "areas": "Bank of Thailand, Bang Khun Phrom Palace, Samsen Road",
    "fee": 60,
    "isActive": true,
    "freeDeliveryAbove": 600
  },
  {
    "id": "bkk-phra-nakhon-wat-sam-phraya",
    "city": "Bangkok",
    "district": "Phra Nakhon",
    "districtTh": "พระนคร",
    "subdistrict": "Wat Sam Phraya",
    "subdistrictTh": "วัดสามพระยา",
    "code": "10200",
    "areas": "Wat Sam Phraya, Chao Phraya Pier, Samsen Soi 3–5",
    "fee": 60,
    "isActive": true,
    "freeDeliveryAbove": 600
  },
  {
    "id": "bkk-dusit-dusit",
    "city": "Bangkok",
    "district": "Dusit",
    "districtTh": "ดุสิต",
    "subdistrict": "Dusit",
    "subdistrictTh": "ดุสิต",
    "code": "10300",
    "areas": "Dusit Palace, Rama V Monument, Sukhothai Road",
    "fee": 60,
    "isActive": true,
    "freeDeliveryAbove": 600
  },
  {
    "id": "bkk-dusit-wachiraphayaban",
    "city": "Bangkok",
    "district": "Dusit",
    "districtTh": "ดุสิต",
    "subdistrict": "Wachiraphayaban",
    "subdistrictTh": "วชิรพยาบาล",
    "code": "10300",
    "areas": "Vajira Hospital, Samsen Road, Krung Kasem",
    "fee": 60,
    "isActive": true,
    "freeDeliveryAbove": 600
  },
  {
    "id": "bkk-dusit-suan-chitlada",
    "city": "Bangkok",
    "district": "Dusit",
    "districtTh": "ดุสิต",
    "subdistrict": "Suan Chitlada",
    "subdistrictTh": "สวนจิตรลดา",
    "code": "10300",
    "areas": "Chitralada Royal Villa, Royal Turf Club, Rama VI Road",
    "fee": 60,
    "isActive": true,
    "freeDeliveryAbove": 600
  },
  {
    "id": "bkk-dusit-si-yaek-mahanak",
    "city": "Bangkok",
    "district": "Dusit",
    "districtTh": "ดุสิต",
    "subdistrict": "Si Yaek Mahanak",
    "subdistrictTh": "สี่แยกมหานาค",
    "code": "10300",
    "areas": "Mahanak Intersection, Phitsanulok Road, Government House",
    "fee": 60,
    "isActive": true,
    "freeDeliveryAbove": 600
  },
  {
    "id": "bkk-dusit-thanon-nakhon-chai-si",
    "city": "Bangkok",
    "district": "Dusit",
    "districtTh": "ดุสิต",
    "subdistrict": "Thanon Nakhon Chai Si",
    "subdistrictTh": "ถนนนครไชยศรี",
    "code": "10300",
    "areas": "Ratchawat Market, Sri Yan Market, Nakhon Chai Si Road",
    "fee": 60,
    "isActive": true,
    "freeDeliveryAbove": 600
  },
  {
    "id": "bkk-samphanthawong-chakkrawat",
    "city": "Bangkok",
    "district": "Samphanthawong",
    "districtTh": "สัมพันธวงศ์",
    "subdistrict": "Chakkrawat",
    "subdistrictTh": "จักรวรรดิ",
    "code": "10100",
    "areas": "Sampheng Wholesale Market, Chakkrawat, Phahurat Eastern Border",
    "fee": 50,
    "isActive": true,
    "freeDeliveryAbove": 600
  },
  {
    "id": "bkk-samphanthawong-samphanthawong",
    "city": "Bangkok",
    "district": "Samphanthawong",
    "districtTh": "สัมพันธวงศ์",
    "subdistrict": "Samphanthawong",
    "subdistrictTh": "สัมพันธวงศ์",
    "code": "10100",
    "areas": "Yaowarat Road, Chinatown Heart, Wat Traimit (Golden Buddha)",
    "fee": 50,
    "isActive": true,
    "freeDeliveryAbove": 600
  },
  {
    "id": "bkk-samphanthawong-talat-noi",
    "city": "Bangkok",
    "district": "Samphanthawong",
    "districtTh": "สัมพันธวงศ์",
    "subdistrict": "Talat Noi",
    "subdistrictTh": "ตลาดน้อย",
    "code": "10100",
    "areas": "Talat Noi Art Street, River City, Soi Wanit 2, Holy Rosary Church",
    "fee": 50,
    "isActive": true,
    "freeDeliveryAbove": 600
  },
  {
    "id": "bkk-pom-prap-sattru-phai-pom-prap",
    "city": "Bangkok",
    "district": "Pom Prap Sattru Phai",
    "districtTh": "ป้อมปราบศัตรูพ่าย",
    "subdistrict": "Pom Prap",
    "subdistrictTh": "ป้อมปราบ",
    "code": "10100",
    "areas": "Luang Road, Krung Kasem Canal, Worachak",
    "fee": 50,
    "isActive": true,
    "freeDeliveryAbove": 600
  },
  {
    "id": "bkk-pom-prap-sattru-phai-wat-sommanat",
    "city": "Bangkok",
    "district": "Pom Prap Sattru Phai",
    "districtTh": "ป้อมปราบศัตรูพ่าย",
    "subdistrict": "Wat Sommanat",
    "subdistrictTh": "วัดโสมนัส",
    "code": "10100",
    "areas": "Wat Sommanas, Ratchadamnoen Nok, Nang Loeng Racecourse border",
    "fee": 50,
    "isActive": true,
    "freeDeliveryAbove": 600
  },
  {
    "id": "bkk-pom-prap-sattru-phai-khlong-mahanak",
    "city": "Bangkok",
    "district": "Pom Prap Sattru Phai",
    "districtTh": "ป้อมปราบศัตรูพ่าย",
    "subdistrict": "Khlong Mahanak",
    "subdistrictTh": "คลองมหานาค",
    "code": "10100",
    "areas": "Bobae Market, Mahanak Canal Garment Stalls, Krung Kasem",
    "fee": 50,
    "isActive": true,
    "freeDeliveryAbove": 600
  },
  {
    "id": "bkk-pom-prap-sattru-phai-ban-bat",
    "city": "Bangkok",
    "district": "Pom Prap Sattru Phai",
    "districtTh": "ป้อมปราบศัตรูพ่าย",
    "subdistrict": "Ban Bat",
    "subdistrictTh": "บ้านบาตร",
    "code": "10100",
    "areas": "Handmade Monk Bowl Community, Bamrung Mueang, Soi Bat",
    "fee": 50,
    "isActive": true,
    "freeDeliveryAbove": 600
  },
  {
    "id": "bkk-pom-prap-sattru-phai-wat-thepsirin",
    "city": "Bangkok",
    "district": "Pom Prap Sattru Phai",
    "districtTh": "ป้อมปราบศัตรูพ่าย",
    "subdistrict": "Wat Thepsirin",
    "subdistrictTh": "วัดเทพศิรินทร์",
    "code": "10100",
    "areas": "Wat Thepsirin, Nopphawong, Yotse Culinary Street",
    "fee": 50,
    "isActive": true,
    "freeDeliveryAbove": 600
  },
  {
    "id": "bkk-bang-kho-laem-bang-kho-laem",
    "city": "Bangkok",
    "district": "Bang Kho Laem",
    "districtTh": "บางคอแหลม",
    "subdistrict": "Bang Kho Laem",
    "subdistrictTh": "บางคอแหลม",
    "code": "10120",
    "areas": "Charoen Krung Road End, Rama 3 Junction, Asiatique Area",
    "fee": 60,
    "isActive": true,
    "freeDeliveryAbove": 600
  },
  {
    "id": "bkk-bang-kho-laem-wat-phraya-krai",
    "city": "Bangkok",
    "district": "Bang Kho Laem",
    "districtTh": "บางคอแหลม",
    "subdistrict": "Wat Phraya Krai",
    "subdistrictTh": "วัดพระยาไกร",
    "code": "10120",
    "areas": "Asiatique The Riverfront, Charoen Krung 72–99, Shrewsbury Int School",
    "fee": 60,
    "isActive": true,
    "freeDeliveryAbove": 600
  },
  {
    "id": "bkk-bang-kho-laem-bang-khlo",
    "city": "Bangkok",
    "district": "Bang Kho Laem",
    "districtTh": "บางคอแหลม",
    "subdistrict": "Bang Khlo",
    "subdistrictTh": "บางโคล่",
    "code": "10120",
    "areas": "Rama 3 Riverside, Sathu Pradit Junction, Montien Riverside",
    "fee": 60,
    "isActive": true,
    "freeDeliveryAbove": 600
  },
  {
    "id": "bkk-bang-sue-bang-sue",
    "city": "Bangkok",
    "district": "Bang Sue",
    "districtTh": "บางซื่อ",
    "subdistrict": "Bang Sue",
    "subdistrictTh": "บางซื่อ",
    "code": "10800",
    "areas": "Bang Sue Grand Station (Krung Thep Aphiwat), Tao Poon MRT, SCG HQ",
    "fee": 60,
    "isActive": true,
    "freeDeliveryAbove": 600
  },
  {
    "id": "bkk-bang-sue-wong-sawang",
    "city": "Bangkok",
    "district": "Bang Sue",
    "districtTh": "บางซื่อ",
    "subdistrict": "Wong Sawang",
    "subdistrictTh": "วงศ์สว่าง",
    "code": "10800",
    "areas": "MRT Wong Sawang, Pracha Chuen, Wongsawang Junction, Big C",
    "fee": 60,
    "isActive": true,
    "freeDeliveryAbove": 600
  },
  {
    "id": "bkk-phra-khanong-bang-chak",
    "city": "Bangkok",
    "district": "Phra Khanong",
    "districtTh": "พระโขนง",
    "subdistrict": "Bang Chak",
    "subdistrictTh": "บางจาก",
    "code": "10260",
    "areas": "Sukhumvit 93–99, BTS Bang Chak, Bang Chak Refinery, Sukhumvit 97/1",
    "fee": 60,
    "isActive": true,
    "freeDeliveryAbove": 600
  },
  {
    "id": "bkk-phra-khanong-phra-khanong-tai",
    "city": "Bangkok",
    "district": "Phra Khanong",
    "districtTh": "พระโขนง",
    "subdistrict": "Phra Khanong Tai",
    "subdistrictTh": "พระโขนงใต้",
    "code": "10260",
    "areas": "Sukhumvit 101 (Punnavithi), True Digital Park, Whizdom 101",
    "fee": 60,
    "isActive": true,
    "freeDeliveryAbove": 600
  },
  {
    "id": "bkk-bang-na-bang-na-nuea",
    "city": "Bangkok",
    "district": "Bang Na",
    "districtTh": "บางนา",
    "subdistrict": "Bang Na Nuea",
    "subdistrictTh": "บางนาเหนือ",
    "code": "10260",
    "areas": "Central Bangna, Bang Na-Trat (Even side), Udom Suk (Even side), Big C Bangna",
    "fee": 60,
    "isActive": true,
    "freeDeliveryAbove": 600
  },
  {
    "id": "bkk-bang-na-bang-na-tai",
    "city": "Bangkok",
    "district": "Bang Na",
    "districtTh": "บางนา",
    "subdistrict": "Bang Na Tai",
    "subdistrictTh": "บางนาใต้",
    "code": "10260",
    "areas": "BITEC Bangna, Lasalle (Sukhumvit 105), Bearing border, BTS Bang Na",
    "fee": 60,
    "isActive": true,
    "freeDeliveryAbove": 600
  },
  {
    "id": "bkk-suan-luang-suan-luang",
    "city": "Bangkok",
    "district": "Suan Luang",
    "districtTh": "สวนหลวง",
    "subdistrict": "Suan Luang",
    "subdistrictTh": "สวนหลวง",
    "code": "10250",
    "areas": "Phatthanakan Road (Upper), Ramkhamhaeng 24 link, Hua Mak border",
    "fee": 60,
    "isActive": true,
    "freeDeliveryAbove": 600
  },
  {
    "id": "bkk-suan-luang-on-nut",
    "city": "Bangkok",
    "district": "Suan Luang",
    "districtTh": "สวนหลวง",
    "subdistrict": "On Nut",
    "subdistrictTh": "อ่อนนุช",
    "code": "10250",
    "areas": "Sukhumvit 77 (On Nut 17–60), People Park, Habito Mall, T77 Community",
    "fee": 60,
    "isActive": true,
    "freeDeliveryAbove": 600
  },
  {
    "id": "bkk-suan-luang-phatthanakan",
    "city": "Bangkok",
    "district": "Suan Luang",
    "districtTh": "สวนหลวง",
    "subdistrict": "Phatthanakan",
    "subdistrictTh": "พัฒนาการ",
    "code": "10250",
    "areas": "Phatthanakan 20–53, Srinakarin Junction, Airport Link Hua Mak",
    "fee": 60,
    "isActive": true,
    "freeDeliveryAbove": 600
  },
  {
    "id": "bkk-ratchathewi-thung-phaya-thai",
    "city": "Bangkok",
    "district": "Ratchathewi",
    "districtTh": "ราชเทวี",
    "subdistrict": "Thung Phaya Thai",
    "subdistrictTh": "ทุ่งพญาไท",
    "code": "10400",
    "areas": "Victory Monument, Rajavithi Hospital, Phayathai BTS, Center One",
    "fee": 50,
    "isActive": true,
    "freeDeliveryAbove": 600
  },
  {
    "id": "bkk-ratchathewi-thanon-phaya-thai",
    "city": "Bangkok",
    "district": "Ratchathewi",
    "districtTh": "ราชเทวี",
    "subdistrict": "Thanon Phaya Thai",
    "subdistrictTh": "ถนนพญาไท",
    "code": "10400",
    "areas": "Phayathai Road, BTS Ratchathewi, Airport Rail Link Phayathai, Co-Co Walk",
    "fee": 50,
    "isActive": true,
    "freeDeliveryAbove": 600
  },
  {
    "id": "bkk-ratchathewi-thanon-phetchaburi",
    "city": "Bangkok",
    "district": "Ratchathewi",
    "districtTh": "ราชเทวี",
    "subdistrict": "Thanon Phetchaburi",
    "subdistrictTh": "ถนนเพชรบุรี",
    "code": "10400",
    "areas": "Pratunam Market, Platinum Fashion Mall, Phetchaburi Road, Shibuya 19",
    "fee": 50,
    "isActive": true,
    "freeDeliveryAbove": 600
  },
  {
    "id": "bkk-ratchathewi-makkasan",
    "city": "Bangkok",
    "district": "Ratchathewi",
    "districtTh": "ราชเทวี",
    "subdistrict": "Makkasan",
    "subdistrictTh": "มักกะสัน",
    "code": "10400",
    "areas": "ARL Makkasan, Asoke-Dindaeng, Rama 9 MRT, Makkasan Depot",
    "fee": 50,
    "isActive": true,
    "freeDeliveryAbove": 600
  },
  {
    "id": "bkk-thon-buri-wat-kanlaya",
    "city": "Bangkok",
    "district": "Thon Buri",
    "districtTh": "ธนบุรี",
    "subdistrict": "Wat Kanlaya",
    "subdistrictTh": "วัดกัลยาณ์",
    "code": "10600",
    "areas": "Wat Kalayanamit, Santa Cruz Church, Kudi Chin Heritage Community",
    "fee": 60,
    "isActive": true,
    "freeDeliveryAbove": 600
  },
  {
    "id": "bkk-thon-buri-hiran-ruchi",
    "city": "Bangkok",
    "district": "Thon Buri",
    "districtTh": "ธนบุรี",
    "subdistrict": "Hiran Ruchi",
    "subdistrictTh": "หิรัญรูจี",
    "code": "10600",
    "areas": "Wongwian Yai, Prajadhipok Road, King Taksin Monument",
    "fee": 60,
    "isActive": true,
    "freeDeliveryAbove": 600
  },
  {
    "id": "bkk-thon-buri-bang-yi-ruea",
    "city": "Bangkok",
    "district": "Thon Buri",
    "districtTh": "ธนบุรี",
    "subdistrict": "Bang Yi Ruea",
    "subdistrictTh": "บางยี่เรือ",
    "code": "10600",
    "areas": "Intharaphithak, Bang Yi Ruea, Wat Intharam, Somdet Phra Chao Taksin",
    "fee": 60,
    "isActive": true,
    "freeDeliveryAbove": 600
  },
  {
    "id": "bkk-thon-buri-bukkhalo",
    "city": "Bangkok",
    "district": "Thon Buri",
    "districtTh": "ธนบุรี",
    "subdistrict": "Bukkhalo",
    "subdistrictTh": "บุคคโล",
    "code": "10600",
    "areas": "Mahaisawan, Charoen Nakhon End, Rama 3 Bridge, Riverside Plaza",
    "fee": 60,
    "isActive": true,
    "freeDeliveryAbove": 600
  },
  {
    "id": "bkk-thon-buri-talat-phlu",
    "city": "Bangkok",
    "district": "Thon Buri",
    "districtTh": "ธนบุรี",
    "subdistrict": "Talat Phlu",
    "subdistrictTh": "ตลาดพลู",
    "code": "10600",
    "areas": "Talat Phlu Street Food, BTS Talat Phlu, Thoet Thai Road, Wat Paknam link",
    "fee": 60,
    "isActive": true,
    "freeDeliveryAbove": 600
  },
  {
    "id": "bkk-thon-buri-dao-khanong",
    "city": "Bangkok",
    "district": "Thon Buri",
    "districtTh": "ธนบุรี",
    "subdistrict": "Dao Khanong",
    "subdistrictTh": "ดาวคะนอง",
    "code": "10600",
    "areas": "Dao Khanong Market, Somdet Phra Chao Tak Sin Road, Big C Dao Khanong",
    "fee": 60,
    "isActive": true,
    "freeDeliveryAbove": 600
  },
  {
    "id": "bkk-thon-buri-samre",
    "city": "Bangkok",
    "district": "Thon Buri",
    "districtTh": "ธนบุรี",
    "subdistrict": "Samre",
    "subdistrictTh": "สำเหร่",
    "code": "10600",
    "areas": "Samitivej Thonburi Hospital, Tak Sin Road, Samre Pier",
    "fee": 60,
    "isActive": true,
    "freeDeliveryAbove": 600
  },
  {
    "id": "bkk-bangkok-yai-wat-arun",
    "city": "Bangkok",
    "district": "Bangkok Yai",
    "districtTh": "บางกอกใหญ่",
    "subdistrict": "Wat Arun",
    "subdistrictTh": "วัดอรุณ",
    "code": "10600",
    "areas": "Temple of Dawn (Wat Arun), Wang Doem Road, Royal Thai Navy HQ",
    "fee": 60,
    "isActive": true,
    "freeDeliveryAbove": 600
  },
  {
    "id": "bkk-bangkok-yai-wat-tha-phra",
    "city": "Bangkok",
    "district": "Bangkok Yai",
    "districtTh": "บางกอกใหญ่",
    "subdistrict": "Wat Tha Phra",
    "subdistrictTh": "วัดท่าพระ",
    "code": "10600",
    "areas": "MRT Tha Phra Interchange, Phetkasem, Charan Sanitwong",
    "fee": 60,
    "isActive": true,
    "freeDeliveryAbove": 600
  },
  {
    "id": "bkk-khlong-san-somdet-chao-phraya",
    "city": "Bangkok",
    "district": "Khlong San",
    "districtTh": "คลองสาน",
    "subdistrict": "Somdet Chao Phraya",
    "subdistrictTh": "สมเด็จเจ้าพระยา",
    "code": "10600",
    "areas": "Somdet Chao Phraya Road, Tha Din Daeng Pier, Princess Mother Memorial Park",
    "fee": 60,
    "isActive": true,
    "freeDeliveryAbove": 600
  },
  {
    "id": "bkk-khlong-san-khlong-san",
    "city": "Bangkok",
    "district": "Khlong San",
    "districtTh": "คลองสาน",
    "subdistrict": "Khlong San",
    "subdistrictTh": "คลองสาน",
    "code": "10600",
    "areas": "ICONSIAM, Gold Line Charoen Nakhon, Khlong San Plaza, Millennium Hilton",
    "fee": 60,
    "isActive": true,
    "freeDeliveryAbove": 600
  },
  {
    "id": "bkk-khlong-san-khlong-ton-sai",
    "city": "Bangkok",
    "district": "Khlong San",
    "districtTh": "คลองสาน",
    "subdistrict": "Khlong Ton Sai",
    "subdistrictTh": "คลองต้นไทร",
    "code": "10600",
    "areas": "BTS Krung Thon Buri, Sena Fest, Charoen Nakhon Road",
    "fee": 60,
    "isActive": true,
    "freeDeliveryAbove": 600
  },
  {
    "id": "bkk-khlong-san-bang-lamphu-lang",
    "city": "Bangkok",
    "district": "Khlong San",
    "districtTh": "คลองสาน",
    "subdistrict": "Bang Lamphu Lang",
    "subdistrictTh": "บางลำภูล่าง",
    "code": "10600",
    "areas": "Charoen Nakhon South, Krung Thon Buri Soi 4, Chao Phraya Riverfront",
    "fee": 60,
    "isActive": true,
    "freeDeliveryAbove": 600
  },
  {
    "id": "bkk-bangkok-noi-siri-rat",
    "city": "Bangkok",
    "district": "Bangkok Noi",
    "districtTh": "บางกอกน้อย",
    "subdistrict": "Siri Rat",
    "subdistrictTh": "ศิริราช",
    "code": "10700",
    "areas": "Siriraj Hospital, Wang Lang Market, Wang Lang Pier, Wat Rakhang",
    "fee": 60,
    "isActive": true,
    "freeDeliveryAbove": 600
  },
  {
    "id": "bkk-bangkok-noi-ban-chang-lo",
    "city": "Bangkok",
    "district": "Bangkok Noi",
    "districtTh": "บางกอกน้อย",
    "subdistrict": "Ban Chang Lo",
    "subdistrictTh": "บ้านช่างหล่อ",
    "code": "10700",
    "areas": "Phran Nok Road, Itsaraphap, Ban Chang Lo Buddha Foundry",
    "fee": 60,
    "isActive": true,
    "freeDeliveryAbove": 600
  },
  {
    "id": "bkk-bangkok-noi-bang-khun-non",
    "city": "Bangkok",
    "district": "Bangkok Noi",
    "districtTh": "บางกอกน้อย",
    "subdistrict": "Bang Khun Non",
    "subdistrictTh": "บางขุนนนท์",
    "code": "10700",
    "areas": "Bang Khun Non Culinary Street, Charan Sanitwong, MRT Bang Khun Non",
    "fee": 60,
    "isActive": true,
    "freeDeliveryAbove": 600
  },
  {
    "id": "bkk-bangkok-noi-bang-khun-si",
    "city": "Bangkok",
    "district": "Bangkok Noi",
    "districtTh": "บางกอกน้อย",
    "subdistrict": "Bang Khun Si",
    "subdistrictTh": "บางขุนศรี",
    "code": "10700",
    "areas": "Makro Charan, Bang Khun Si Market, Charan 35, Fai Chai Junction",
    "fee": 60,
    "isActive": true,
    "freeDeliveryAbove": 600
  },
  {
    "id": "bkk-bangkok-noi-arun-amarin",
    "city": "Bangkok",
    "district": "Bangkok Noi",
    "districtTh": "บางกอกน้อย",
    "subdistrict": "Arun Amarin",
    "subdistrictTh": "อรุณอมรินทร์",
    "code": "10700",
    "areas": "Pin Klao, Central Pin Klao, Rama 8 Bridge Thonburi Side, Royal Barge Museum",
    "fee": 60,
    "isActive": true,
    "freeDeliveryAbove": 600
  },
  {
    "id": "bkk-bang-phlat-bang-phlat",
    "city": "Bangkok",
    "district": "Bang Phlat",
    "districtTh": "บางพลัด",
    "subdistrict": "Bang Phlat",
    "subdistrictTh": "บางพลัด",
    "code": "10700",
    "areas": "Charan Sanitwong 75–89, Bang Phlat MRT, Krung Thon Bridge (Sang Hi)",
    "fee": 60,
    "isActive": true,
    "freeDeliveryAbove": 600
  },
  {
    "id": "bkk-bang-phlat-bang-o",
    "city": "Bangkok",
    "district": "Bang Phlat",
    "districtTh": "บางพลัด",
    "subdistrict": "Bang O",
    "subdistrictTh": "บางอ้อ",
    "code": "10700",
    "areas": "Yanhee Hospital, MRT Bang O, Rama 7 Bridge South",
    "fee": 60,
    "isActive": true,
    "freeDeliveryAbove": 600
  },
  {
    "id": "bkk-bang-phlat-bang-bamru",
    "city": "Bangkok",
    "district": "Bang Phlat",
    "districtTh": "บางพลัด",
    "subdistrict": "Bang Bamru",
    "subdistrictTh": "บางบำหรุ",
    "code": "10700",
    "areas": "Sirindhorn Road, Chang Chui Creative Park, SRT Bang Bamru",
    "fee": 60,
    "isActive": true,
    "freeDeliveryAbove": 600
  },
  {
    "id": "bkk-bang-phlat-bang-yi-khan",
    "city": "Bangkok",
    "district": "Bang Phlat",
    "districtTh": "บางพลัด",
    "subdistrict": "Bang Yi Khan",
    "subdistrictTh": "บางยี่ขัน",
    "code": "10700",
    "areas": "MRT Bang Yi Khan, Rama 8 Bridge, Arun Amarin, Life Pinklao",
    "fee": 60,
    "isActive": true,
    "freeDeliveryAbove": 600
  },
  {
    "id": "bkk-bang-kapi-khlong-chan",
    "city": "Bangkok",
    "district": "Bang Kapi",
    "districtTh": "บางกะปิ",
    "subdistrict": "Khlong Chan",
    "subdistrictTh": "คลองจั่น",
    "code": "10240",
    "areas": "Nawamin, Seri Thai, NIDA, The Mall Bangkapi, Happy Land",
    "fee": 70,
    "isActive": true,
    "freeDeliveryAbove": 700
  },
  {
    "id": "bkk-bang-kapi-hua-mak",
    "city": "Bangkok",
    "district": "Bang Kapi",
    "districtTh": "บางกะปิ",
    "subdistrict": "Hua Mak",
    "subdistrictTh": "หัวหมาก",
    "code": "10240",
    "areas": "Ramkhamhaeng University, Rajamangala National Stadium, ABAC, MRT Lam Sali",
    "fee": 70,
    "isActive": true,
    "freeDeliveryAbove": 700
  },
  {
    "id": "bkk-wang-thonglang-wang-thonglang",
    "city": "Bangkok",
    "district": "Wang Thonglang",
    "districtTh": "วังทองหลาง",
    "subdistrict": "Wang Thonglang",
    "subdistrictTh": "วังทองหลาง",
    "code": "10310",
    "areas": "Lat Phrao 64–80, Chok Chai 4 Southern Link, Imperial World Lat Phrao",
    "fee": 70,
    "isActive": true,
    "freeDeliveryAbove": 700
  },
  {
    "id": "bkk-wang-thonglang-saphan-song",
    "city": "Bangkok",
    "district": "Wang Thonglang",
    "districtTh": "วังทองหลาง",
    "subdistrict": "Saphan Song",
    "subdistrictTh": "สะพานสอง",
    "code": "10310",
    "areas": "Lat Phrao 82–100, Saphan Song Market, Yellow Line Chok Chai 4",
    "fee": 70,
    "isActive": true,
    "freeDeliveryAbove": 700
  },
  {
    "id": "bkk-wang-thonglang-khlong-chaokhunsing",
    "city": "Bangkok",
    "district": "Wang Thonglang",
    "districtTh": "วังทองหลาง",
    "subdistrict": "Khlong Chaokhunsing",
    "subdistrictTh": "คลองเจ้าคุณสิงห์",
    "code": "10310",
    "areas": "Lat Phrao 102–120, Bodindecha School Area, Pradit Manutham Link",
    "fee": 70,
    "isActive": true,
    "freeDeliveryAbove": 700
  },
  {
    "id": "bkk-wang-thonglang-phlabphla",
    "city": "Bangkok",
    "district": "Wang Thonglang",
    "districtTh": "วังทองหลาง",
    "subdistrict": "Phlabphla",
    "subdistrictTh": "พลับพลา",
    "code": "10310",
    "areas": "Town in Town, Ramkhamhaeng 39, Pracha Uthit Road, SC Park Hotel",
    "fee": 70,
    "isActive": true,
    "freeDeliveryAbove": 700
  },
  {
    "id": "bkk-lat-phrao-lat-phrao",
    "city": "Bangkok",
    "district": "Lat Phrao",
    "districtTh": "ลาดพร้าว",
    "subdistrict": "Lat Phrao",
    "subdistrictTh": "ลาดพร้าว",
    "code": "10230",
    "areas": "Chok Chai 4, Lat Phrao Wang Hin, Nak Niwat Road, Central Eastville",
    "fee": 70,
    "isActive": true,
    "freeDeliveryAbove": 700
  },
  {
    "id": "bkk-lat-phrao-chorakhe-bua",
    "city": "Bangkok",
    "district": "Lat Phrao",
    "districtTh": "ลาดพร้าว",
    "subdistrict": "Chorakhe Bua",
    "subdistrictTh": "จรเข้บัว",
    "code": "10230",
    "areas": "Prasert-Manukitch (Kaset-Nawamin), Sena Nikhom Link, The Walk Kaset",
    "fee": 70,
    "isActive": true,
    "freeDeliveryAbove": 700
  },
  {
    "id": "bkk-bueng-kum-khlong-kum",
    "city": "Bangkok",
    "district": "Bueng Kum",
    "districtTh": "บึงกุ่ม",
    "subdistrict": "Khlong Kum",
    "subdistrictTh": "คลองกุ่ม",
    "code": "10240",
    "areas": "Seri Thai, Navatanee Golf Course, Bueng Kum District Office",
    "fee": 70,
    "isActive": true,
    "freeDeliveryAbove": 700
  },
  {
    "id": "bkk-bueng-kum-nawamin",
    "city": "Bangkok",
    "district": "Bueng Kum",
    "districtTh": "บึงกุ่ม",
    "subdistrict": "Nawamin",
    "subdistrictTh": "นวมินทร์",
    "code": "10240",
    "areas": "Nawamin Road, Sukhaphiban 1, Post Office Bueng Kum, Phayathai Nawamin",
    "fee": 70,
    "isActive": true,
    "freeDeliveryAbove": 700
  },
  {
    "id": "bkk-bueng-kum-nuan-chan",
    "city": "Bangkok",
    "district": "Bueng Kum",
    "districtTh": "บึงกุ่ม",
    "subdistrict": "Nuan Chan",
    "subdistrictTh": "นวลจันทร์",
    "code": "10240",
    "areas": "Nuan Chan Road, Ram Inthra Soi 40, Prasert-Manukitch, Wat Nuan Chan",
    "fee": 70,
    "isActive": true,
    "freeDeliveryAbove": 700
  },
  {
    "id": "bkk-saphan-sung-saphan-sung",
    "city": "Bangkok",
    "district": "Saphan Sung",
    "districtTh": "สะพานสูง",
    "subdistrict": "Saphan Sung",
    "subdistrictTh": "สะพานสูง",
    "code": "10240",
    "areas": "Ramkhamhaeng 118–150, Sammakorn Village, Paseo Town Ramkhamhaeng",
    "fee": 70,
    "isActive": true,
    "freeDeliveryAbove": 700
  },
  {
    "id": "bkk-saphan-sung-rat-phatthana",
    "city": "Bangkok",
    "district": "Saphan Sung",
    "districtTh": "สะพานสูง",
    "subdistrict": "Rat Phatthana",
    "subdistrictTh": "ราษฎร์พัฒนา",
    "code": "10240",
    "areas": "Soi Mistine, Rat Phatthana Road, Kanchanaphisek Eastern Link",
    "fee": 70,
    "isActive": true,
    "freeDeliveryAbove": 700
  },
  {
    "id": "bkk-saphan-sung-thap-chang",
    "city": "Bangkok",
    "district": "Saphan Sung",
    "districtTh": "สะพานสูง",
    "subdistrict": "Thap Chang",
    "subdistrictTh": "ทับช้าง",
    "code": "10240",
    "areas": "Krungthep Kreetha Road, Motorway 7 Border, Wellington College, Brighton College",
    "fee": 70,
    "isActive": true,
    "freeDeliveryAbove": 700
  },
  {
    "id": "bkk-prawet-prawet",
    "city": "Bangkok",
    "district": "Prawet",
    "districtTh": "ประเวศ",
    "subdistrict": "Prawet",
    "subdistrictTh": "ประเวศ",
    "code": "10250",
    "areas": "Prawet Junction, On Nut-Lat Krabang, Chaloem Phra Kiat R.9, Sukhaphiban 2",
    "fee": 70,
    "isActive": true,
    "freeDeliveryAbove": 700
  },
  {
    "id": "bkk-prawet-nong-bon",
    "city": "Bangkok",
    "district": "Prawet",
    "districtTh": "ประเวศ",
    "subdistrict": "Nong Bon",
    "subdistrictTh": "หนองบอน",
    "code": "10250",
    "areas": "Suan Luang Rama IX Park, Nong Bon Water Sports Center, Paradise Park",
    "fee": 70,
    "isActive": true,
    "freeDeliveryAbove": 700
  },
  {
    "id": "bkk-prawet-dokmai",
    "city": "Bangkok",
    "district": "Prawet",
    "districtTh": "ประเวศ",
    "subdistrict": "Dokmai",
    "subdistrictTh": "ดอกไม้",
    "code": "10250",
    "areas": "Ramkhamhaeng 2, Bang Na-Trat Km 8, Gemopolis Industrial Estate, Mega Bangna border",
    "fee": 70,
    "isActive": true,
    "freeDeliveryAbove": 700
  },
  {
    "id": "bkk-chom-thong-bang-khun-thian",
    "city": "Bangkok",
    "district": "Chom Thong",
    "districtTh": "จอมทอง",
    "subdistrict": "Bang Khun Thian",
    "subdistrictTh": "บางขุนเทียน",
    "code": "10150",
    "areas": "Chom Thong, Rama 2 Border, Wat Sai Floating Market, Ekkachai Link",
    "fee": 70,
    "isActive": true,
    "freeDeliveryAbove": 700
  },
  {
    "id": "bkk-chom-thong-bang-kho",
    "city": "Bangkok",
    "district": "Chom Thong",
    "districtTh": "จอมทอง",
    "subdistrict": "Bang Kho",
    "subdistrictTh": "บางค้อ",
    "code": "10150",
    "areas": "Wutthakat Road, BTS Wutthakat, Wat Nang, Ratchaphruek Link",
    "fee": 70,
    "isActive": true,
    "freeDeliveryAbove": 700
  },
  {
    "id": "bkk-chom-thong-bang-mot",
    "city": "Bangkok",
    "district": "Chom Thong",
    "districtTh": "จอมทอง",
    "subdistrict": "Bang Mot",
    "subdistrictTh": "บางมด",
    "code": "10150",
    "areas": "Phuttha Bucha Road, Bang Mot Tangerine Orchards Area, Wat Luang Pho O-Pasi",
    "fee": 70,
    "isActive": true,
    "freeDeliveryAbove": 700
  },
  {
    "id": "bkk-chom-thong-chom-thong",
    "city": "Bangkok",
    "district": "Chom Thong",
    "districtTh": "จอมทอง",
    "subdistrict": "Chom Thong",
    "subdistrictTh": "จอมทอง",
    "code": "10150",
    "areas": "Chom Thong Road, Dao Khanong Link, Ekkachai Link, Wat Ratcha-orot",
    "fee": 70,
    "isActive": true,
    "freeDeliveryAbove": 700
  },
  {
    "id": "bkk-phasi-charoen-bang-wa",
    "city": "Bangkok",
    "district": "Phasi Charoen",
    "districtTh": "ภาษีเจริญ",
    "subdistrict": "Bang Wa",
    "subdistrictTh": "บางหว้า",
    "code": "10160",
    "areas": "BTS/MRT Bang Wa Interchange, Ratchaphruek, Phetkasem Road, Siam University",
    "fee": 70,
    "isActive": true,
    "freeDeliveryAbove": 700
  },
  {
    "id": "bkk-phasi-charoen-bang-duan",
    "city": "Bangkok",
    "district": "Phasi Charoen",
    "districtTh": "ภาษีเจริญ",
    "subdistrict": "Bang Duan",
    "subdistrictTh": "บางด้วน",
    "code": "10160",
    "areas": "Phasi Charoen Canal, Phetkasem 39, Bang Duan, Seacon Bangkae border",
    "fee": 70,
    "isActive": true,
    "freeDeliveryAbove": 700
  },
  {
    "id": "bkk-phasi-charoen-bang-chak",
    "city": "Bangkok",
    "district": "Phasi Charoen",
    "districtTh": "ภาษีเจริญ",
    "subdistrict": "Bang Chak",
    "subdistrictTh": "บางจาก",
    "code": "10160",
    "areas": "Ratchaphruek, Phetkasem 48, Bang Chak Canal, Wat Chan Pradittharam",
    "fee": 70,
    "isActive": true,
    "freeDeliveryAbove": 700
  },
  {
    "id": "bkk-phasi-charoen-bang-waek",
    "city": "Bangkok",
    "district": "Phasi Charoen",
    "districtTh": "ภาษีเจริญ",
    "subdistrict": "Bang Waek",
    "subdistrictTh": "บางแวก",
    "code": "10160",
    "areas": "Bang Waek Road, Phutthamonthon Sai 1 Link, Ratchaphruek Western Link",
    "fee": 70,
    "isActive": true,
    "freeDeliveryAbove": 700
  },
  {
    "id": "bkk-phasi-charoen-khlong-khwang",
    "city": "Bangkok",
    "district": "Phasi Charoen",
    "districtTh": "ภาษีเจริญ",
    "subdistrict": "Khlong Khwang",
    "subdistrictTh": "คลองขวาง",
    "code": "10160",
    "areas": "Khlong Khwang, Phetkasem 54–58, Phasi Charoen Pier",
    "fee": 70,
    "isActive": true,
    "freeDeliveryAbove": 700
  },
  {
    "id": "bkk-phasi-charoen-pak-khlong-phasi-charoen",
    "city": "Bangkok",
    "district": "Phasi Charoen",
    "districtTh": "ภาษีเจริญ",
    "subdistrict": "Pak Khlong Phasi Charoen",
    "subdistrictTh": "ปากคลองภาษีเจริญ",
    "code": "10160",
    "areas": "Wat Paknam Bhasicharoen (Great Buddha), Khlong Dan, Wat Absorn Sawan",
    "fee": 70,
    "isActive": true,
    "freeDeliveryAbove": 700
  },
  {
    "id": "bkk-phasi-charoen-khuha-sawan",
    "city": "Bangkok",
    "district": "Phasi Charoen",
    "districtTh": "ภาษีเจริญ",
    "subdistrict": "Khuha Sawan",
    "subdistrictTh": "คูหาสวรรค์",
    "code": "10160",
    "areas": "Khlong Bang Luang Artist Village, Wat Khuha Sawan, Riverside Wooden Walkway",
    "fee": 70,
    "isActive": true,
    "freeDeliveryAbove": 700
  },
  {
    "id": "bkk-rat-burana-rat-burana",
    "city": "Bangkok",
    "district": "Rat Burana",
    "districtTh": "ราษฎร์บูรณะ",
    "subdistrict": "Rat Burana",
    "subdistrictTh": "ราษฎร์บูรณะ",
    "code": "10140",
    "areas": "Rat Burana Road, Kasikornbank Head Office, Big C Rat Burana",
    "fee": 70,
    "isActive": true,
    "freeDeliveryAbove": 700
  },
  {
    "id": "bkk-rat-burana-bang-pakok",
    "city": "Bangkok",
    "district": "Rat Burana",
    "districtTh": "ราษฎร์บูรณะ",
    "subdistrict": "Bang Pakok",
    "subdistrictTh": "บางปะกอก",
    "code": "10140",
    "areas": "Suksawat Road, Bang Pakok 1 Hospital, Rama 9 Expressway Bridge (Chaloem Maha Nakhon)",
    "fee": 70,
    "isActive": true,
    "freeDeliveryAbove": 700
  },
  {
    "id": "bkk-thung-khru-bang-mot",
    "city": "Bangkok",
    "district": "Thung Khru",
    "districtTh": "ทุ่งครุ",
    "subdistrict": "Bang Mot",
    "subdistrictTh": "บางมด",
    "code": "10140",
    "areas": "KMUTT (King Mongkut University Thonburi), Pracha Uthit 33–69, Thonburirom Park",
    "fee": 70,
    "isActive": true,
    "freeDeliveryAbove": 700
  },
  {
    "id": "bkk-thung-khru-thung-khru",
    "city": "Bangkok",
    "district": "Thung Khru",
    "districtTh": "ทุ่งครุ",
    "subdistrict": "Thung Khru",
    "subdistrictTh": "ทุ่งครุ",
    "code": "10140",
    "areas": "Pracha Uthit 70–131, Thung Khru Market, Khlong Suan Link, Bang Khun Thian border",
    "fee": 70,
    "isActive": true,
    "freeDeliveryAbove": 700
  },
  {
    "id": "bkk-bang-khen-anusawari",
    "city": "Bangkok",
    "district": "Bang Khen",
    "districtTh": "บางเขน",
    "subdistrict": "Anusawari",
    "subdistrictTh": "อนุสาวรีย์",
    "code": "10220",
    "areas": "Lak Si Monument, Phahonyothin Road, Ram Inthra Km 1–3, Central General Hospital",
    "fee": 80,
    "isActive": true,
    "freeDeliveryAbove": 700
  },
  {
    "id": "bkk-bang-khen-tha-raeng",
    "city": "Bangkok",
    "district": "Bang Khen",
    "districtTh": "บางเขน",
    "subdistrict": "Tha Raeng",
    "subdistrictTh": "ท่าแร้ง",
    "code": "10220",
    "areas": "Sukhaphiban 5, Watcharaphon, Ram Inthra Km 4–8, Plearnary Mall",
    "fee": 80,
    "isActive": true,
    "freeDeliveryAbove": 700
  },
  {
    "id": "bkk-sai-mai-sai-mai",
    "city": "Bangkok",
    "district": "Sai Mai",
    "districtTh": "สายไหม",
    "subdistrict": "Sai Mai",
    "subdistrictTh": "สายไหม",
    "code": "10220",
    "areas": "Sai Mai Road, Soi Sai Mai 1–86, Khlong Sam Wa Border, Wongsakorn Market",
    "fee": 80,
    "isActive": true,
    "freeDeliveryAbove": 700
  },
  {
    "id": "bkk-sai-mai-o-ngoen",
    "city": "Bangkok",
    "district": "Sai Mai",
    "districtTh": "สายไหม",
    "subdistrict": "O Ngoen",
    "subdistrictTh": "ออเงิน",
    "code": "10220",
    "areas": "Sukhaphiban 5, O Ngoen Market, Chalong Rat Expressway, Sai Mai District Office",
    "fee": 80,
    "isActive": true,
    "freeDeliveryAbove": 700
  },
  {
    "id": "bkk-sai-mai-khlong-thanon",
    "city": "Bangkok",
    "district": "Sai Mai",
    "districtTh": "สายไหม",
    "subdistrict": "Khlong Thanon",
    "subdistrictTh": "คลองถนน",
    "code": "10220",
    "areas": "Phahonyothin 52–54, Saphan Mai Market Border, BTS Saphan Mai",
    "fee": 80,
    "isActive": true,
    "freeDeliveryAbove": 700
  },
  {
    "id": "bkk-don-mueang-si-kan",
    "city": "Bangkok",
    "district": "Don Mueang",
    "districtTh": "ดอนเมือง",
    "subdistrict": "Si Kan",
    "subdistrictTh": "สีกัน",
    "code": "10210",
    "areas": "Song Prapha Road, Don Mueang Technical College, Wat Si Kan, Happy Avenue",
    "fee": 80,
    "isActive": true,
    "freeDeliveryAbove": 700
  },
  {
    "id": "bkk-don-mueang-don-mueang",
    "city": "Bangkok",
    "district": "Don Mueang",
    "districtTh": "ดอนเมือง",
    "subdistrict": "Don Mueang",
    "subdistrictTh": "ดอนเมือง",
    "code": "10210",
    "areas": "Don Mueang International Airport, Vibhavadi Rangsit Road, SRT Dark Red Line",
    "fee": 80,
    "isActive": true,
    "freeDeliveryAbove": 700
  },
  {
    "id": "bkk-don-mueang-sanam-bin",
    "city": "Bangkok",
    "district": "Don Mueang",
    "districtTh": "ดอนเมือง",
    "subdistrict": "Sanam Bin",
    "subdistrictTh": "สนามบิน",
    "code": "10210",
    "areas": "Royal Thai Air Force Base, Phahonyothin Km 24–26, Wing 6, Air Force Museum",
    "fee": 80,
    "isActive": true,
    "freeDeliveryAbove": 700
  },
  {
    "id": "bkk-lak-si-thung-song-hong",
    "city": "Bangkok",
    "district": "Lak Si",
    "districtTh": "หลักสี่",
    "subdistrict": "Thung Song Hong",
    "subdistrictTh": "ทุ่งสองห้อง",
    "code": "10210",
    "areas": "Government Complex Chaeng Watthana, Vibhavadi 60–64, Miracle Grand Convention",
    "fee": 80,
    "isActive": true,
    "freeDeliveryAbove": 700
  },
  {
    "id": "bkk-lak-si-talat-bang-khen",
    "city": "Bangkok",
    "district": "Lak Si",
    "districtTh": "หลักสี่",
    "subdistrict": "Talat Bang Khen",
    "subdistrictTh": "ตลาดบางเขน",
    "code": "10210",
    "areas": "Lak Si IT Square, Chaeng Watthana 1–10, Phahonyothin, Chulabhorn Research Institute",
    "fee": 80,
    "isActive": true,
    "freeDeliveryAbove": 700
  },
  {
    "id": "bkk-khan-na-yao-khan-na-yao",
    "city": "Bangkok",
    "district": "Khan Na Yao",
    "districtTh": "คันนายาว",
    "subdistrict": "Khan Na Yao",
    "subdistrictTh": "คันนายาว",
    "code": "10230",
    "areas": "Fashion Island, The Promenade, Ram Inthra Km 9–11, Pink Line Fashion Island",
    "fee": 80,
    "isActive": true,
    "freeDeliveryAbove": 700
  },
  {
    "id": "bkk-khan-na-yao-ram-inthra",
    "city": "Bangkok",
    "district": "Khan Na Yao",
    "districtTh": "คันนายาว",
    "subdistrict": "Ram Inthra",
    "subdistrictTh": "รามอินทรา",
    "code": "10230",
    "areas": "Siam Amazing Park (Siam Park City), Suan Sayam Road, Seri Thai Link",
    "fee": 80,
    "isActive": true,
    "freeDeliveryAbove": 700
  },
  {
    "id": "bkk-taling-chan-khlong-chak-phra",
    "city": "Bangkok",
    "district": "Taling Chan",
    "districtTh": "ตลิ่งชัน",
    "subdistrict": "Khlong Chak Phra",
    "subdistrictTh": "คลองชักพระ",
    "code": "10170",
    "areas": "Taling Chan District Office, Chak Phra Canal, Wat Nang Chi",
    "fee": 80,
    "isActive": true,
    "freeDeliveryAbove": 700
  },
  {
    "id": "bkk-taling-chan-taling-chan",
    "city": "Bangkok",
    "district": "Taling Chan",
    "districtTh": "ตลิ่งชัน",
    "subdistrict": "Taling Chan",
    "subdistrictTh": "ตลิ่งชัน",
    "code": "10170",
    "areas": "Taling Chan Floating Market, Borommaratchachonnani, Ratchaphruek Link",
    "fee": 80,
    "isActive": true,
    "freeDeliveryAbove": 700
  },
  {
    "id": "bkk-taling-chan-chimphli",
    "city": "Bangkok",
    "district": "Taling Chan",
    "districtTh": "ตลิ่งชัน",
    "subdistrict": "Chimphli",
    "subdistrictTh": "ฉิมพลี",
    "code": "10170",
    "areas": "Chimphli Road, Southern Railway Line, Suan Phak, Phutthamonthon Sai 1",
    "fee": 80,
    "isActive": true,
    "freeDeliveryAbove": 700
  },
  {
    "id": "bkk-taling-chan-bang-phrom",
    "city": "Bangkok",
    "district": "Taling Chan",
    "districtTh": "ตลิ่งชัน",
    "subdistrict": "Bang Phrom",
    "subdistrictTh": "บางพรม",
    "code": "10170",
    "areas": "Bang Phrom Road, Ratchaphruek Connection, The Circle Ratchapruk border",
    "fee": 80,
    "isActive": true,
    "freeDeliveryAbove": 700
  },
  {
    "id": "bkk-taling-chan-bang-ramat",
    "city": "Bangkok",
    "district": "Taling Chan",
    "districtTh": "ตลิ่งชัน",
    "subdistrict": "Bang Ramat",
    "subdistrictTh": "บางระมาด",
    "code": "10170",
    "areas": "Khlong Lat Mayom Floating Market, Bang Ramat Canal, Phutthamonthon Sai 1",
    "fee": 80,
    "isActive": true,
    "freeDeliveryAbove": 700
  },
  {
    "id": "bkk-taling-chan-bang-chueak-nang",
    "city": "Bangkok",
    "district": "Taling Chan",
    "districtTh": "ตลิ่งชัน",
    "subdistrict": "Bang Chueak Nang",
    "subdistrictTh": "บางเชือกหนัง",
    "code": "10170",
    "areas": "Phutthamonthon Sai 1, Bang Chueak Nang Canal, Kanchanaphisek Link",
    "fee": 80,
    "isActive": true,
    "freeDeliveryAbove": 700
  },
  {
    "id": "bkk-thawi-watthana-thawi-watthana",
    "city": "Bangkok",
    "district": "Thawi Watthana",
    "districtTh": "ทวีวัฒนา",
    "subdistrict": "Thawi Watthana",
    "subdistrictTh": "ทวีวัฒนา",
    "code": "10170",
    "areas": "Thawi Watthana Road, Utthayan Road (Avenue), Phutthamonthon Sai 3 Link",
    "fee": 80,
    "isActive": true,
    "freeDeliveryAbove": 700
  },
  {
    "id": "bkk-thawi-watthana-sala-thammasop",
    "city": "Bangkok",
    "district": "Thawi Watthana",
    "districtTh": "ทวีวัฒนา",
    "subdistrict": "Sala Thammasop",
    "subdistrictTh": "ศาลาธรรมสพน์",
    "code": "10170",
    "areas": "Phutthamonthon Sai 2–4, Borommaratchachonnani, Mahidol Salaya Border",
    "fee": 80,
    "isActive": true,
    "freeDeliveryAbove": 700
  },
  {
    "id": "bkk-bang-khae-bang-khae",
    "city": "Bangkok",
    "district": "Bang Khae",
    "districtTh": "บางแค",
    "subdistrict": "Bang Khae",
    "subdistrictTh": "บางแค",
    "code": "10160",
    "areas": "Phetkasem Road, The Mall Bang Khae, MRT Lak Song, Bang Khae Market",
    "fee": 80,
    "isActive": true,
    "freeDeliveryAbove": 700
  },
  {
    "id": "bkk-bang-khae-bang-khae-nuea",
    "city": "Bangkok",
    "district": "Bang Khae",
    "districtTh": "บางแค",
    "subdistrict": "Bang Khae Nuea",
    "subdistrictTh": "บางแคเหนือ",
    "code": "10160",
    "areas": "Phutthamonthon Sai 2, Kanlapaphruek Link, Phetkasem 53–61",
    "fee": 80,
    "isActive": true,
    "freeDeliveryAbove": 700
  },
  {
    "id": "bkk-bang-khae-bang-phai",
    "city": "Bangkok",
    "district": "Bang Khae",
    "districtTh": "บางแค",
    "subdistrict": "Bang Phai",
    "subdistrictTh": "บางไผ่",
    "code": "10160",
    "areas": "Bang Phai Canal, Phetkasem 69 Link, Bang Chueak Nang, Kanchanaphisek",
    "fee": 80,
    "isActive": true,
    "freeDeliveryAbove": 700
  },
  {
    "id": "bkk-bang-khae-lak-song",
    "city": "Bangkok",
    "district": "Bang Khae",
    "districtTh": "บางแค",
    "subdistrict": "Lak Song",
    "subdistrictTh": "หลักสอง",
    "code": "10160",
    "areas": "Kanchanaphisek Road, Phetkasem 63–65, Lak Song Plaza, Victoria Gardens",
    "fee": 80,
    "isActive": true,
    "freeDeliveryAbove": 700
  },
  {
    "id": "bkk-nong-khaem-nong-khaem",
    "city": "Bangkok",
    "district": "Nong Khaem",
    "districtTh": "หนองแขม",
    "subdistrict": "Nong Khaem",
    "subdistrictTh": "หนองแขม",
    "code": "10160",
    "areas": "Phetkasem 77–81, Nong Khaem Market, Ma Charoen Road",
    "fee": 80,
    "isActive": true,
    "freeDeliveryAbove": 700
  },
  {
    "id": "bkk-nong-khaem-nong-khang-phlu",
    "city": "Bangkok",
    "district": "Nong Khaem",
    "districtTh": "หนองแขม",
    "subdistrict": "Nong Khang Phlu",
    "subdistrictTh": "หนองค้างพลู",
    "code": "10160",
    "areas": "Phetkasem 110, Southeast Asia University, Thonburi University",
    "fee": 80,
    "isActive": true,
    "freeDeliveryAbove": 700
  },
  {
    "id": "bkk-bang-bon-bang-bon-nuea",
    "city": "Bangkok",
    "district": "Bang Bon",
    "districtTh": "บางบอน",
    "subdistrict": "Bang Bon Nuea",
    "subdistrictTh": "บางบอนเหนือ",
    "code": "10150",
    "areas": "Ekkachai 100–140, Bang Bon 3–5, Kanchanaphisek Western Ring Road",
    "fee": 80,
    "isActive": true,
    "freeDeliveryAbove": 700
  },
  {
    "id": "bkk-bang-bon-bang-bon-tai",
    "city": "Bangkok",
    "district": "Bang Bon",
    "districtTh": "บางบอน",
    "subdistrict": "Bang Bon Tai",
    "subdistrictTh": "บางบอนใต้",
    "code": "10150",
    "areas": "Bang Bon 1, Rama 2 Link, Ekkachai-Bang Bon Junction",
    "fee": 80,
    "isActive": true,
    "freeDeliveryAbove": 700
  },
  {
    "id": "bkk-bang-bon-khlong-bang-phran",
    "city": "Bangkok",
    "district": "Bang Bon",
    "districtTh": "บางบอน",
    "subdistrict": "Khlong Bang Phran",
    "subdistrictTh": "คลองบางพราน",
    "code": "10150",
    "areas": "Ekkachai 60–90, Bang Khun Thian Railway Station Border",
    "fee": 80,
    "isActive": true,
    "freeDeliveryAbove": 700
  },
  {
    "id": "bkk-bang-bon-khlong-bang-bon",
    "city": "Bangkok",
    "district": "Bang Bon",
    "districtTh": "บางบอน",
    "subdistrict": "Khlong Bang Bon",
    "subdistrictTh": "คลองบางบอน",
    "code": "10150",
    "areas": "Bang Bon Canal, Ekkachai 40–59, Chom Thong Border",
    "fee": 80,
    "isActive": true,
    "freeDeliveryAbove": 700
  },
  {
    "id": "bkk-bang-khun-thian-tha-kham",
    "city": "Bangkok",
    "district": "Bang Khun Thian",
    "districtTh": "บางขุนเทียน",
    "subdistrict": "Tha Kham",
    "subdistrictTh": "ท่าข้าม",
    "code": "10150",
    "areas": "Central Rama 2, Rama 2 Soi 47, Tha Kham Road, Bang Khun Thian District Office",
    "fee": 80,
    "isActive": true,
    "freeDeliveryAbove": 700
  },
  {
    "id": "bkk-bang-khun-thian-samae-dam",
    "city": "Bangkok",
    "district": "Bang Khun Thian",
    "districtTh": "บางขุนเทียน",
    "subdistrict": "Samae Dam",
    "subdistrictTh": "แสมดำ",
    "code": "10150",
    "areas": "Bang Khun Thian Coastline, Bang Kradi, Samae Dam Industrial, Rama 2 Km 10–18",
    "fee": 80,
    "isActive": true,
    "freeDeliveryAbove": 700
  },
  {
    "id": "bkk-min-buri-min-buri",
    "city": "Bangkok",
    "district": "Min Buri",
    "districtTh": "มีนบุรี",
    "subdistrict": "Min Buri",
    "subdistrictTh": "มีนบุรี",
    "code": "10510",
    "areas": "Min Buri Market, Sihaburanukit Road, Ram Inthra End, Pink Line Min Buri Station",
    "fee": 90,
    "isActive": true,
    "freeDeliveryAbove": 800
  },
  {
    "id": "bkk-min-buri-saen-saep",
    "city": "Bangkok",
    "district": "Min Buri",
    "districtTh": "มีนบุรี",
    "subdistrict": "Saen Saep",
    "subdistrictTh": "แสนแสบ",
    "code": "10510",
    "areas": "Suwinthawong Road, Saen Saep Canal, Nimit Mai, Ramkhamhaeng Junction",
    "fee": 90,
    "isActive": true,
    "freeDeliveryAbove": 800
  },
  {
    "id": "bkk-khlong-sam-wa-sam-wa-tawan-tok",
    "city": "Bangkok",
    "district": "Khlong Sam Wa",
    "districtTh": "คลองสามวา",
    "subdistrict": "Sam Wa Tawan Tok",
    "subdistrictTh": "สามวาตะวันตก",
    "code": "10510",
    "areas": "Khlong Sam Wa Road, Safari World, Panya Indra, Wat Phraya Suren",
    "fee": 90,
    "isActive": true,
    "freeDeliveryAbove": 800
  },
  {
    "id": "bkk-khlong-sam-wa-sam-wa-tawan-ok",
    "city": "Bangkok",
    "district": "Khlong Sam Wa",
    "districtTh": "คลองสามวา",
    "subdistrict": "Sam Wa Tawan Ok",
    "subdistrictTh": "สามวาตะวันออก",
    "code": "10510",
    "areas": "Nimit Mai Road, Sam Wa Canal, Agricultural Green Zone",
    "fee": 90,
    "isActive": true,
    "freeDeliveryAbove": 800
  },
  {
    "id": "bkk-khlong-sam-wa-bang-chan",
    "city": "Bangkok",
    "district": "Khlong Sam Wa",
    "districtTh": "คลองสามวา",
    "subdistrict": "Bang Chan",
    "subdistrictTh": "บางชัน",
    "code": "10510",
    "areas": "Phraya Suren Road, Ram Inthra 109, Bang Chan Canal Industrial Link",
    "fee": 90,
    "isActive": true,
    "freeDeliveryAbove": 800
  },
  {
    "id": "bkk-khlong-sam-wa-sai-kong-din",
    "city": "Bangkok",
    "district": "Khlong Sam Wa",
    "districtTh": "คลองสามวา",
    "subdistrict": "Sai Kong Din",
    "subdistrictTh": "ทรายกองดิน",
    "code": "10510",
    "areas": "Hatairath Road, Sai Kong Din Community, Khlong Sam Wa Central",
    "fee": 90,
    "isActive": true,
    "freeDeliveryAbove": 800
  },
  {
    "id": "bkk-khlong-sam-wa-sai-kong-din-tai",
    "city": "Bangkok",
    "district": "Khlong Sam Wa",
    "districtTh": "คลองสามวา",
    "subdistrict": "Sai Kong Din Tai",
    "subdistrictTh": "ทรายกองดินใต้",
    "code": "10510",
    "areas": "Mit Maitri Link, Suwinthawong Border, Khlong Sam Wa South",
    "fee": 90,
    "isActive": true,
    "freeDeliveryAbove": 800
  },
  {
    "id": "bkk-lat-krabang-lat-krabang",
    "city": "Bangkok",
    "district": "Lat Krabang",
    "districtTh": "ลาดกระบัง",
    "subdistrict": "Lat Krabang",
    "subdistrictTh": "ลาดกระบัง",
    "code": "10520",
    "areas": "Lat Krabang Road, KMITL, Airport Rail Link Lat Krabang, Paseo Lat Krabang",
    "fee": 90,
    "isActive": true,
    "freeDeliveryAbove": 800
  },
  {
    "id": "bkk-lat-krabang-khlong-song-ton-nun",
    "city": "Bangkok",
    "district": "Lat Krabang",
    "districtTh": "ลาดกระบัง",
    "subdistrict": "Khlong Song Ton Nun",
    "subdistrictTh": "คลองสองต้นนุ่น",
    "code": "10520",
    "areas": "Rom Klao Road, Motorway 7 Junction, ICD Lat Krabang Container Yard",
    "fee": 90,
    "isActive": true,
    "freeDeliveryAbove": 800
  },
  {
    "id": "bkk-lat-krabang-khlong-sam-prawet",
    "city": "Bangkok",
    "district": "Lat Krabang",
    "districtTh": "ลาดกระบัง",
    "subdistrict": "Khlong Sam Prawet",
    "subdistrictTh": "คลองสามประเวศ",
    "code": "10520",
    "areas": "Chalong Krung Road, Khlong Sam Prawet, Suvarnabhumi Cargo District",
    "fee": 90,
    "isActive": true,
    "freeDeliveryAbove": 800
  },
  {
    "id": "bkk-lat-krabang-lam-pla-thio",
    "city": "Bangkok",
    "district": "Lat Krabang",
    "districtTh": "ลาดกระบัง",
    "subdistrict": "Lam Pla Thio",
    "subdistrictTh": "ลำปลาทิว",
    "code": "10520",
    "areas": "Lat Krabang Industrial Estate, Chalong Krung 31, Honda Factory area",
    "fee": 90,
    "isActive": true,
    "freeDeliveryAbove": 800
  },
  {
    "id": "bkk-lat-krabang-thap-yao",
    "city": "Bangkok",
    "district": "Lat Krabang",
    "districtTh": "ลาดกระบัง",
    "subdistrict": "Thap Yao",
    "subdistrictTh": "ทับยาว",
    "code": "10520",
    "areas": "Luang Phaeng Road, Siam Premium Outlets Bangkok Area",
    "fee": 90,
    "isActive": true,
    "freeDeliveryAbove": 800
  },
  {
    "id": "bkk-lat-krabang-khum-thong",
    "city": "Bangkok",
    "district": "Lat Krabang",
    "districtTh": "ลาดกระบัง",
    "subdistrict": "Khum Thong",
    "subdistrictTh": "ขุมทอง",
    "code": "10520",
    "areas": "Eastern Bangkok Canal Boundary, Luang Phaeng Road End, Chachoengsao border",
    "fee": 90,
    "isActive": true,
    "freeDeliveryAbove": 800
  },
  {
    "id": "bkk-nong-chok-krathum-rai",
    "city": "Bangkok",
    "district": "Nong Chok",
    "districtTh": "หนองจอก",
    "subdistrict": "Krathum Rai",
    "subdistrictTh": "กระทุ่มราย",
    "code": "10530",
    "areas": "Mahanakorn University of Technology, Liab Wari Road, Suwinthawong",
    "fee": 90,
    "isActive": true,
    "freeDeliveryAbove": 800
  },
  {
    "id": "bkk-nong-chok-nong-chok",
    "city": "Bangkok",
    "district": "Nong Chok",
    "districtTh": "หนองจอก",
    "subdistrict": "Nong Chok",
    "subdistrictTh": "หนองจอก",
    "code": "10530",
    "areas": "Nong Chok Market, Nong Chok Public Park, Chueam Samphan Road",
    "fee": 90,
    "isActive": true,
    "freeDeliveryAbove": 800
  },
  {
    "id": "bkk-nong-chok-khlong-sip",
    "city": "Bangkok",
    "district": "Nong Chok",
    "districtTh": "หนองจอก",
    "subdistrict": "Khlong Sip",
    "subdistrictTh": "คลองสิบ",
    "code": "10530",
    "areas": "Khlong Sip, Pracha Ruam Chai, Agricultural Zone",
    "fee": 90,
    "isActive": true,
    "freeDeliveryAbove": 800
  },
  {
    "id": "bkk-nong-chok-khlong-sip-song",
    "city": "Bangkok",
    "district": "Nong Chok",
    "districtTh": "หนองจอก",
    "subdistrict": "Khlong Sip Song",
    "subdistrictTh": "คลองสิบสอง",
    "code": "10530",
    "areas": "Khlong Sip Song, Eastern Boundary, Lam Sai, Lam Luk Ka border",
    "fee": 90,
    "isActive": true,
    "freeDeliveryAbove": 800
  },
  {
    "id": "bkk-nong-chok-khok-faet",
    "city": "Bangkok",
    "district": "Nong Chok",
    "districtTh": "หนองจอก",
    "subdistrict": "Khok Faet",
    "subdistrictTh": "โคกแฝด",
    "code": "10530",
    "areas": "Mit Maitri Road, Khok Faet, Lam Hin, Nong Chok Sports Complex",
    "fee": 90,
    "isActive": true,
    "freeDeliveryAbove": 800
  },
  {
    "id": "bkk-nong-chok-khu-fang-nuea",
    "city": "Bangkok",
    "district": "Nong Chok",
    "districtTh": "หนองจอก",
    "subdistrict": "Khu Fang Nuea",
    "subdistrictTh": "คู้ฝั่งเหนือ",
    "code": "10530",
    "areas": "Khu Khwang, Pracha Ruam Chai, Ecological Green Area",
    "fee": 90,
    "isActive": true,
    "freeDeliveryAbove": 800
  },
  {
    "id": "bkk-nong-chok-lam-phak-chi",
    "city": "Bangkok",
    "district": "Nong Chok",
    "districtTh": "หนองจอก",
    "subdistrict": "Lam Phak Chi",
    "subdistrictTh": "ลำผักชี",
    "code": "10530",
    "areas": "Suwinthawong Road, Chalong Krung Junction, Lam Phak Chi Community",
    "fee": 90,
    "isActive": true,
    "freeDeliveryAbove": 800
  },
  {
    "id": "bkk-nong-chok-lam-toiting",
    "city": "Bangkok",
    "district": "Nong Chok",
    "districtTh": "หนองจอก",
    "subdistrict": "Lam Toiting",
    "subdistrictTh": "ลำต้อยติ่ง",
    "code": "10530",
    "areas": "Lam Toiting Canal, Easternmost Bangkok Border with Chachoengsao",
    "fee": 90,
    "isActive": true,
    "freeDeliveryAbove": 800
  }
];

// ============================================================================
// 2. PATTAYA SUB-DISTRICTS & DELIVERY ZONES (13 ZONES)
// ============================================================================
export const DEFAULT_PATTAYA_SUBDISTRICTS = [
  {
    "id": "pty-central-pattaya",
    "city": "Pattaya",
    "district": "Central Pattaya",
    "districtTh": "พัทยากลาง",
    "subdistrict": "Nong Prue (Central Pattaya)",
    "subdistrictTh": "หนองปรือ (พัทยากลาง)",
    "code": "20150",
    "areas": "Beach Road, Second Road, Central Festival, Soi Buakhao, Walking Street",
    "fee": 50,
    "isActive": true,
    "freeDeliveryAbove": 600
  },
  {
    "id": "pty-north-wongamat",
    "city": "Pattaya",
    "district": "North Pattaya",
    "districtTh": "พัทยาเหนือ",
    "subdistrict": "Wongamat Beach (Naklua)",
    "subdistrictTh": "หาดวงศ์อมาตย์ (นาเกลือ)",
    "code": "20150",
    "areas": "Wongamat Beach, Soi Naklua 12–18, Terminal 21 Pattaya, Dusit Thani",
    "fee": 50,
    "isActive": true,
    "freeDeliveryAbove": 600
  },
  {
    "id": "pty-naklua-old-town",
    "city": "Pattaya",
    "district": "North Pattaya",
    "districtTh": "พัทยาเหนือ",
    "subdistrict": "Naklua Old Town",
    "subdistrictTh": "นาเกลือเก่า",
    "code": "20150",
    "areas": "Lan Pho Naklua Market, Sanctuary of Truth, Naklua Road Soi 1–33",
    "fee": 60,
    "isActive": true,
    "freeDeliveryAbove": 600
  },
  {
    "id": "pty-pratumnak-hill",
    "city": "Pattaya",
    "district": "South Pattaya",
    "districtTh": "พัทยาใต้",
    "subdistrict": "Pratumnak Hill (Cosy Beach)",
    "subdistrictTh": "เขาพระตำหนัก (หาดโคซี่)",
    "code": "20150",
    "areas": "Pratumnak Soi 1–6, Cosy Beach, Big Buddha Temple, Royal Cliff, Khao Phra Bat",
    "fee": 50,
    "isActive": true,
    "freeDeliveryAbove": 600
  },
  {
    "id": "pty-south-pattaya",
    "city": "Pattaya",
    "district": "South Pattaya",
    "districtTh": "พัทยาใต้",
    "subdistrict": "South Pattaya (Third Road)",
    "subdistrictTh": "พัทยาใต้ (สาย 3)",
    "code": "20150",
    "areas": "South Pattaya Road, Bali Hai Pier, Third Road, Chaloem Phra Kiat",
    "fee": 50,
    "isActive": true,
    "freeDeliveryAbove": 600
  },
  {
    "id": "pty-jomtien-beach-main",
    "city": "Pattaya",
    "district": "Jomtien",
    "districtTh": "จอมเทียน",
    "subdistrict": "Jomtien Beach (Main)",
    "subdistrictTh": "หาดจอมเทียน (ช่วงต้น–กลาง)",
    "code": "20150",
    "areas": "Jomtien Beach Road Soi 1–19, Dongtan Beach, Jomtien Night Market",
    "fee": 50,
    "isActive": true,
    "freeDeliveryAbove": 600
  },
  {
    "id": "pty-jomtien-second-road",
    "city": "Pattaya",
    "district": "Jomtien",
    "districtTh": "จอมเทียน",
    "subdistrict": "Jomtien Second Road",
    "subdistrictTh": "สาย 2 จอมเทียน",
    "code": "20150",
    "areas": "Jomtien Second Road, Riviera Jomtien, Copacabana, Boon Kanchana",
    "fee": 50,
    "isActive": true,
    "freeDeliveryAbove": 600
  },
  {
    "id": "pty-south-jomtien",
    "city": "Pattaya",
    "district": "Jomtien",
    "districtTh": "จอมเทียน",
    "subdistrict": "South Jomtien (Chaiyaphruek)",
    "subdistrictTh": "จอมเทียนใต้ (ชัยพฤกษ์)",
    "code": "20150",
    "areas": "Chaiyaphruek 1 & 2, Jomtien Beach Road Soi 20+, Chonburi Ring Road",
    "fee": 60,
    "isActive": true,
    "freeDeliveryAbove": 600
  },
  {
    "id": "pty-na-jomtien-north",
    "city": "Pattaya",
    "district": "Na Jomtien",
    "districtTh": "นาจอมเทียน",
    "subdistrict": "Na Jomtien (Beachfront)",
    "subdistrictTh": "นาจอมเทียน (เลียบหาด)",
    "code": "20250",
    "areas": "Mövenpick, Mason Pattaya, The Glass House, Cave Beach Club",
    "fee": 70,
    "isActive": true,
    "freeDeliveryAbove": 700
  },
  {
    "id": "pty-na-jomtien-marina",
    "city": "Pattaya",
    "district": "Na Jomtien",
    "districtTh": "นาจอมเทียน",
    "subdistrict": "Na Jomtien (Ocean Marina & Sukhumvit)",
    "subdistrictTh": "นาจอมเทียน (โอเชี่ยนมารีน่า & สุขุมวิท)",
    "code": "20250",
    "areas": "Ocean Marina Yacht Club, Sukhumvit Road Km 150–157, Ban Amphur Beach",
    "fee": 80,
    "isActive": true,
    "freeDeliveryAbove": 700
  },
  {
    "id": "pty-darkside-khao-noi",
    "city": "Pattaya",
    "district": "East Pattaya",
    "districtTh": "พัทยาตะวันออก",
    "subdistrict": "East Pattaya (Soi Khao Noi / Khao Talo)",
    "subdistrictTh": "หนองปรือฝั่งตะวันออก (ซอยเขาน้อย / เขาตาโล)",
    "code": "20150",
    "areas": "Soi Khao Noi, Soi Khao Talo, Wat Boon Sampan, Darkside Expat Villas",
    "fee": 60,
    "isActive": true,
    "freeDeliveryAbove": 600
  },
  {
    "id": "pty-darkside-mapbrachan",
    "city": "Pattaya",
    "district": "East Pattaya",
    "districtTh": "พัทยาตะวันออก",
    "subdistrict": "Mabprachan Lake (Pong)",
    "subdistrictTh": "อ่างเก็บน้ำมาบประชัน (โป่ง)",
    "code": "20150",
    "areas": "Lake Mabprachan, Siam Country Club, Pong, Motorway 7 Junction, Rugby School link",
    "fee": 80,
    "isActive": true,
    "freeDeliveryAbove": 700
  },
  {
    "id": "pty-huai-yai",
    "city": "Pattaya",
    "district": "Huai Yai",
    "districtTh": "ห้วยใหญ่",
    "subdistrict": "Huai Yai Sub-district",
    "subdistrictTh": "ตำบลห้วยใหญ่",
    "code": "20150",
    "areas": "Huai Yai Road, Phoenix Gold Golf, French International School area, Motorway 7 extension",
    "fee": 80,
    "isActive": true,
    "freeDeliveryAbove": 700
  }
];

// ============================================================================
// 3. COMBINED INITIAL DELIVERY ZONES (193 ZONES TOTAL)
// ============================================================================
export const DEFAULT_ALL_DELIVERY_ZONES = [
  ...DEFAULT_BANGKOK_SUBDISTRICTS,
  ...DEFAULT_PATTAYA_SUBDISTRICTS
];

// Fallback legacy Bangkok postal codes list
export const DEFAULT_BANGKOK_POSTAL_CODES = DEFAULT_BANGKOK_SUBDISTRICTS;

// ============================================================================
// 4. DELIVERY SYSTEM CONFIGURATION
// ============================================================================
export const DEFAULT_DELIVERY_CONFIG = {
  baseDeliveryFee: 50,
  standardLeadTimeHours: 48,
  expressLeadTimeHours: 24,
  sameDayCutoffHour: 11,
  storeWideFreeDeliveryThreshold: 600,
  enableDynamicZonePricing: true,
  allowSelfDropOff: true,
  cashlessPolicyNotice: '100% Cashless System (PromptPay / QR / Cards / Online Invoicing)'
};

// ============================================================================
// 5. BANGKOK DISTRICTS TO SUB-DISTRICTS LOOKUP (50 DISTRICTS, 180 SUB-DISTRICTS)
// ============================================================================
export const BANGKOK_DISTRICTS_TO_SUBDISTRICTS = {
  "Watthana": [
    {
      "name": "Khlong Toei Nuea",
      "nameTh": "คลองเตยเหนือ",
      "code": "10110",
      "fee": 50,
      "freeDeliveryAbove": 600
    },
    {
      "name": "Khlong Tan Nuea",
      "nameTh": "คลองตันเหนือ",
      "code": "10110",
      "fee": 50,
      "freeDeliveryAbove": 600
    },
    {
      "name": "Phra Khanong Nuea",
      "nameTh": "พระโขนงเหนือ",
      "code": "10110",
      "fee": 50,
      "freeDeliveryAbove": 600
    }
  ],
  "Khlong Toei": [
    {
      "name": "Khlong Toei",
      "nameTh": "คลองเตย",
      "code": "10110",
      "fee": 50,
      "freeDeliveryAbove": 600
    },
    {
      "name": "Khlong Tan",
      "nameTh": "คลองตัน",
      "code": "10110",
      "fee": 50,
      "freeDeliveryAbove": 600
    },
    {
      "name": "Phra Khanong",
      "nameTh": "พระโขนง",
      "code": "10110",
      "fee": 50,
      "freeDeliveryAbove": 600
    }
  ],
  "Bang Rak": [
    {
      "name": "Maha Phruettharam",
      "nameTh": "มหาพฤฒาราม",
      "code": "10500",
      "fee": 50,
      "freeDeliveryAbove": 600
    },
    {
      "name": "Si Phraya",
      "nameTh": "สี่พระยา",
      "code": "10500",
      "fee": 50,
      "freeDeliveryAbove": 600
    },
    {
      "name": "Si Lom",
      "nameTh": "สีลม",
      "code": "10500",
      "fee": 50,
      "freeDeliveryAbove": 600
    },
    {
      "name": "Suriyawong",
      "nameTh": "สุริยวงศ์",
      "code": "10500",
      "fee": 50,
      "freeDeliveryAbove": 600
    },
    {
      "name": "Bang Rak",
      "nameTh": "บางรัก",
      "code": "10500",
      "fee": 50,
      "freeDeliveryAbove": 600
    }
  ],
  "Sathon": [
    {
      "name": "Thung Maha Mek",
      "nameTh": "ทุ่งมหาเมฆ",
      "code": "10120",
      "fee": 50,
      "freeDeliveryAbove": 600
    },
    {
      "name": "Yan Nawa",
      "nameTh": "ยานนาวา",
      "code": "10120",
      "fee": 50,
      "freeDeliveryAbove": 600
    },
    {
      "name": "Thung Wat Don",
      "nameTh": "ทุ่งวัดดอน",
      "code": "10120",
      "fee": 50,
      "freeDeliveryAbove": 600
    }
  ],
  "Pathum Wan": [
    {
      "name": "Rong Mueang",
      "nameTh": "รองเมือง",
      "code": "10330",
      "fee": 50,
      "freeDeliveryAbove": 600
    },
    {
      "name": "Wang Mai",
      "nameTh": "วังใหม่",
      "code": "10330",
      "fee": 50,
      "freeDeliveryAbove": 600
    },
    {
      "name": "Pathum Wan",
      "nameTh": "ปทุมวัน",
      "code": "10330",
      "fee": 50,
      "freeDeliveryAbove": 600
    },
    {
      "name": "Lumphini",
      "nameTh": "ลุมพินี",
      "code": "10330",
      "fee": 50,
      "freeDeliveryAbove": 600
    }
  ],
  "Phaya Thai": [
    {
      "name": "Sam Sen Nai",
      "nameTh": "สามเสนใน",
      "code": "10400",
      "fee": 50,
      "freeDeliveryAbove": 600
    },
    {
      "name": "Phaya Thai",
      "nameTh": "พญาไท",
      "code": "10400",
      "fee": 50,
      "freeDeliveryAbove": 600
    }
  ],
  "Huai Khwang": [
    {
      "name": "Huai Khwang",
      "nameTh": "ห้วยขวาง",
      "code": "10310",
      "fee": 60,
      "freeDeliveryAbove": 600
    },
    {
      "name": "Bang Kapi",
      "nameTh": "บางกะปิ",
      "code": "10310",
      "fee": 60,
      "freeDeliveryAbove": 600
    },
    {
      "name": "Sam Sen Nok",
      "nameTh": "สามเสนนอก",
      "code": "10310",
      "fee": 60,
      "freeDeliveryAbove": 600
    }
  ],
  "Chatuchak": [
    {
      "name": "Lat Yao",
      "nameTh": "ลาดยาว",
      "code": "10900",
      "fee": 60,
      "freeDeliveryAbove": 600
    },
    {
      "name": "Sena Nikhom",
      "nameTh": "เสนานิคม",
      "code": "10900",
      "fee": 60,
      "freeDeliveryAbove": 600
    },
    {
      "name": "Chan Kasem",
      "nameTh": "จันทรเกษม",
      "code": "10900",
      "fee": 60,
      "freeDeliveryAbove": 600
    },
    {
      "name": "Chomphon",
      "nameTh": "จอมพล",
      "code": "10900",
      "fee": 60,
      "freeDeliveryAbove": 600
    },
    {
      "name": "Chatuchak",
      "nameTh": "จตุจักร",
      "code": "10900",
      "fee": 60,
      "freeDeliveryAbove": 600
    }
  ],
  "Din Daeng": [
    {
      "name": "Din Daeng",
      "nameTh": "ดินแดง",
      "code": "10400",
      "fee": 60,
      "freeDeliveryAbove": 600
    },
    {
      "name": "Ratchadaphisek",
      "nameTh": "รัชดาภิเษก",
      "code": "10400",
      "fee": 60,
      "freeDeliveryAbove": 600
    }
  ],
  "Yan Nawa": [
    {
      "name": "Chong Nonsi",
      "nameTh": "ช่องนนทรี",
      "code": "10120",
      "fee": 60,
      "freeDeliveryAbove": 600
    },
    {
      "name": "Bang Phongphang",
      "nameTh": "บางโพงพาง",
      "code": "10120",
      "fee": 60,
      "freeDeliveryAbove": 600
    }
  ],
  "Phra Nakhon": [
    {
      "name": "Phra Borom Maha Ratchawang",
      "nameTh": "พระบรมมหาราชวัง",
      "code": "10200",
      "fee": 60,
      "freeDeliveryAbove": 600
    },
    {
      "name": "Wang Burapha Phirom",
      "nameTh": "วังบูรพาภิรมย์",
      "code": "10200",
      "fee": 60,
      "freeDeliveryAbove": 600
    },
    {
      "name": "Wat Ratchabophit",
      "nameTh": "วัดราชบพิธ",
      "code": "10200",
      "fee": 60,
      "freeDeliveryAbove": 600
    },
    {
      "name": "Samran Rat",
      "nameTh": "สำราญราษฎร์",
      "code": "10200",
      "fee": 60,
      "freeDeliveryAbove": 600
    },
    {
      "name": "San Chao Pho Suea",
      "nameTh": "ศาลเจ้าพ่อเสือ",
      "code": "10200",
      "fee": 60,
      "freeDeliveryAbove": 600
    },
    {
      "name": "Sao Chingcha",
      "nameTh": "เสาชิงช้า",
      "code": "10200",
      "fee": 60,
      "freeDeliveryAbove": 600
    },
    {
      "name": "Bowon Niwet",
      "nameTh": "บวรนิเวศ",
      "code": "10200",
      "fee": 60,
      "freeDeliveryAbove": 600
    },
    {
      "name": "Talat Yot",
      "nameTh": "ตลาดยอด",
      "code": "10200",
      "fee": 60,
      "freeDeliveryAbove": 600
    },
    {
      "name": "Chana Songkhram",
      "nameTh": "ชนะสงคราม",
      "code": "10200",
      "fee": 60,
      "freeDeliveryAbove": 600
    },
    {
      "name": "Ban Phan Thom",
      "nameTh": "บ้านพานถม",
      "code": "10200",
      "fee": 60,
      "freeDeliveryAbove": 600
    },
    {
      "name": "Bang Khun Phrom",
      "nameTh": "บางขุนพรหม",
      "code": "10200",
      "fee": 60,
      "freeDeliveryAbove": 600
    },
    {
      "name": "Wat Sam Phraya",
      "nameTh": "วัดสามพระยา",
      "code": "10200",
      "fee": 60,
      "freeDeliveryAbove": 600
    }
  ],
  "Dusit": [
    {
      "name": "Dusit",
      "nameTh": "ดุสิต",
      "code": "10300",
      "fee": 60,
      "freeDeliveryAbove": 600
    },
    {
      "name": "Wachiraphayaban",
      "nameTh": "วชิรพยาบาล",
      "code": "10300",
      "fee": 60,
      "freeDeliveryAbove": 600
    },
    {
      "name": "Suan Chitlada",
      "nameTh": "สวนจิตรลดา",
      "code": "10300",
      "fee": 60,
      "freeDeliveryAbove": 600
    },
    {
      "name": "Si Yaek Mahanak",
      "nameTh": "สี่แยกมหานาค",
      "code": "10300",
      "fee": 60,
      "freeDeliveryAbove": 600
    },
    {
      "name": "Thanon Nakhon Chai Si",
      "nameTh": "ถนนนครไชยศรี",
      "code": "10300",
      "fee": 60,
      "freeDeliveryAbove": 600
    }
  ],
  "Samphanthawong": [
    {
      "name": "Chakkrawat",
      "nameTh": "จักรวรรดิ",
      "code": "10100",
      "fee": 50,
      "freeDeliveryAbove": 600
    },
    {
      "name": "Samphanthawong",
      "nameTh": "สัมพันธวงศ์",
      "code": "10100",
      "fee": 50,
      "freeDeliveryAbove": 600
    },
    {
      "name": "Talat Noi",
      "nameTh": "ตลาดน้อย",
      "code": "10100",
      "fee": 50,
      "freeDeliveryAbove": 600
    }
  ],
  "Pom Prap Sattru Phai": [
    {
      "name": "Pom Prap",
      "nameTh": "ป้อมปราบ",
      "code": "10100",
      "fee": 50,
      "freeDeliveryAbove": 600
    },
    {
      "name": "Wat Sommanat",
      "nameTh": "วัดโสมนัส",
      "code": "10100",
      "fee": 50,
      "freeDeliveryAbove": 600
    },
    {
      "name": "Khlong Mahanak",
      "nameTh": "คลองมหานาค",
      "code": "10100",
      "fee": 50,
      "freeDeliveryAbove": 600
    },
    {
      "name": "Ban Bat",
      "nameTh": "บ้านบาตร",
      "code": "10100",
      "fee": 50,
      "freeDeliveryAbove": 600
    },
    {
      "name": "Wat Thepsirin",
      "nameTh": "วัดเทพศิรินทร์",
      "code": "10100",
      "fee": 50,
      "freeDeliveryAbove": 600
    }
  ],
  "Bang Kho Laem": [
    {
      "name": "Bang Kho Laem",
      "nameTh": "บางคอแหลม",
      "code": "10120",
      "fee": 60,
      "freeDeliveryAbove": 600
    },
    {
      "name": "Wat Phraya Krai",
      "nameTh": "วัดพระยาไกร",
      "code": "10120",
      "fee": 60,
      "freeDeliveryAbove": 600
    },
    {
      "name": "Bang Khlo",
      "nameTh": "บางโคล่",
      "code": "10120",
      "fee": 60,
      "freeDeliveryAbove": 600
    }
  ],
  "Bang Sue": [
    {
      "name": "Bang Sue",
      "nameTh": "บางซื่อ",
      "code": "10800",
      "fee": 60,
      "freeDeliveryAbove": 600
    },
    {
      "name": "Wong Sawang",
      "nameTh": "วงศ์สว่าง",
      "code": "10800",
      "fee": 60,
      "freeDeliveryAbove": 600
    }
  ],
  "Phra Khanong": [
    {
      "name": "Bang Chak",
      "nameTh": "บางจาก",
      "code": "10260",
      "fee": 60,
      "freeDeliveryAbove": 600
    },
    {
      "name": "Phra Khanong Tai",
      "nameTh": "พระโขนงใต้",
      "code": "10260",
      "fee": 60,
      "freeDeliveryAbove": 600
    }
  ],
  "Bang Na": [
    {
      "name": "Bang Na Nuea",
      "nameTh": "บางนาเหนือ",
      "code": "10260",
      "fee": 60,
      "freeDeliveryAbove": 600
    },
    {
      "name": "Bang Na Tai",
      "nameTh": "บางนาใต้",
      "code": "10260",
      "fee": 60,
      "freeDeliveryAbove": 600
    }
  ],
  "Suan Luang": [
    {
      "name": "Suan Luang",
      "nameTh": "สวนหลวง",
      "code": "10250",
      "fee": 60,
      "freeDeliveryAbove": 600
    },
    {
      "name": "On Nut",
      "nameTh": "อ่อนนุช",
      "code": "10250",
      "fee": 60,
      "freeDeliveryAbove": 600
    },
    {
      "name": "Phatthanakan",
      "nameTh": "พัฒนาการ",
      "code": "10250",
      "fee": 60,
      "freeDeliveryAbove": 600
    }
  ],
  "Ratchathewi": [
    {
      "name": "Thung Phaya Thai",
      "nameTh": "ทุ่งพญาไท",
      "code": "10400",
      "fee": 50,
      "freeDeliveryAbove": 600
    },
    {
      "name": "Thanon Phaya Thai",
      "nameTh": "ถนนพญาไท",
      "code": "10400",
      "fee": 50,
      "freeDeliveryAbove": 600
    },
    {
      "name": "Thanon Phetchaburi",
      "nameTh": "ถนนเพชรบุรี",
      "code": "10400",
      "fee": 50,
      "freeDeliveryAbove": 600
    },
    {
      "name": "Makkasan",
      "nameTh": "มักกะสัน",
      "code": "10400",
      "fee": 50,
      "freeDeliveryAbove": 600
    }
  ],
  "Thon Buri": [
    {
      "name": "Wat Kanlaya",
      "nameTh": "วัดกัลยาณ์",
      "code": "10600",
      "fee": 60,
      "freeDeliveryAbove": 600
    },
    {
      "name": "Hiran Ruchi",
      "nameTh": "หิรัญรูจี",
      "code": "10600",
      "fee": 60,
      "freeDeliveryAbove": 600
    },
    {
      "name": "Bang Yi Ruea",
      "nameTh": "บางยี่เรือ",
      "code": "10600",
      "fee": 60,
      "freeDeliveryAbove": 600
    },
    {
      "name": "Bukkhalo",
      "nameTh": "บุคคโล",
      "code": "10600",
      "fee": 60,
      "freeDeliveryAbove": 600
    },
    {
      "name": "Talat Phlu",
      "nameTh": "ตลาดพลู",
      "code": "10600",
      "fee": 60,
      "freeDeliveryAbove": 600
    },
    {
      "name": "Dao Khanong",
      "nameTh": "ดาวคะนอง",
      "code": "10600",
      "fee": 60,
      "freeDeliveryAbove": 600
    },
    {
      "name": "Samre",
      "nameTh": "สำเหร่",
      "code": "10600",
      "fee": 60,
      "freeDeliveryAbove": 600
    }
  ],
  "Bangkok Yai": [
    {
      "name": "Wat Arun",
      "nameTh": "วัดอรุณ",
      "code": "10600",
      "fee": 60,
      "freeDeliveryAbove": 600
    },
    {
      "name": "Wat Tha Phra",
      "nameTh": "วัดท่าพระ",
      "code": "10600",
      "fee": 60,
      "freeDeliveryAbove": 600
    }
  ],
  "Khlong San": [
    {
      "name": "Somdet Chao Phraya",
      "nameTh": "สมเด็จเจ้าพระยา",
      "code": "10600",
      "fee": 60,
      "freeDeliveryAbove": 600
    },
    {
      "name": "Khlong San",
      "nameTh": "คลองสาน",
      "code": "10600",
      "fee": 60,
      "freeDeliveryAbove": 600
    },
    {
      "name": "Khlong Ton Sai",
      "nameTh": "คลองต้นไทร",
      "code": "10600",
      "fee": 60,
      "freeDeliveryAbove": 600
    },
    {
      "name": "Bang Lamphu Lang",
      "nameTh": "บางลำภูล่าง",
      "code": "10600",
      "fee": 60,
      "freeDeliveryAbove": 600
    }
  ],
  "Bangkok Noi": [
    {
      "name": "Siri Rat",
      "nameTh": "ศิริราช",
      "code": "10700",
      "fee": 60,
      "freeDeliveryAbove": 600
    },
    {
      "name": "Ban Chang Lo",
      "nameTh": "บ้านช่างหล่อ",
      "code": "10700",
      "fee": 60,
      "freeDeliveryAbove": 600
    },
    {
      "name": "Bang Khun Non",
      "nameTh": "บางขุนนนท์",
      "code": "10700",
      "fee": 60,
      "freeDeliveryAbove": 600
    },
    {
      "name": "Bang Khun Si",
      "nameTh": "บางขุนศรี",
      "code": "10700",
      "fee": 60,
      "freeDeliveryAbove": 600
    },
    {
      "name": "Arun Amarin",
      "nameTh": "อรุณอมรินทร์",
      "code": "10700",
      "fee": 60,
      "freeDeliveryAbove": 600
    }
  ],
  "Bang Phlat": [
    {
      "name": "Bang Phlat",
      "nameTh": "บางพลัด",
      "code": "10700",
      "fee": 60,
      "freeDeliveryAbove": 600
    },
    {
      "name": "Bang O",
      "nameTh": "บางอ้อ",
      "code": "10700",
      "fee": 60,
      "freeDeliveryAbove": 600
    },
    {
      "name": "Bang Bamru",
      "nameTh": "บางบำหรุ",
      "code": "10700",
      "fee": 60,
      "freeDeliveryAbove": 600
    },
    {
      "name": "Bang Yi Khan",
      "nameTh": "บางยี่ขัน",
      "code": "10700",
      "fee": 60,
      "freeDeliveryAbove": 600
    }
  ],
  "Bang Kapi": [
    {
      "name": "Khlong Chan",
      "nameTh": "คลองจั่น",
      "code": "10240",
      "fee": 70,
      "freeDeliveryAbove": 700
    },
    {
      "name": "Hua Mak",
      "nameTh": "หัวหมาก",
      "code": "10240",
      "fee": 70,
      "freeDeliveryAbove": 700
    }
  ],
  "Wang Thonglang": [
    {
      "name": "Wang Thonglang",
      "nameTh": "วังทองหลาง",
      "code": "10310",
      "fee": 70,
      "freeDeliveryAbove": 700
    },
    {
      "name": "Saphan Song",
      "nameTh": "สะพานสอง",
      "code": "10310",
      "fee": 70,
      "freeDeliveryAbove": 700
    },
    {
      "name": "Khlong Chaokhunsing",
      "nameTh": "คลองเจ้าคุณสิงห์",
      "code": "10310",
      "fee": 70,
      "freeDeliveryAbove": 700
    },
    {
      "name": "Phlabphla",
      "nameTh": "พลับพลา",
      "code": "10310",
      "fee": 70,
      "freeDeliveryAbove": 700
    }
  ],
  "Lat Phrao": [
    {
      "name": "Lat Phrao",
      "nameTh": "ลาดพร้าว",
      "code": "10230",
      "fee": 70,
      "freeDeliveryAbove": 700
    },
    {
      "name": "Chorakhe Bua",
      "nameTh": "จรเข้บัว",
      "code": "10230",
      "fee": 70,
      "freeDeliveryAbove": 700
    }
  ],
  "Bueng Kum": [
    {
      "name": "Khlong Kum",
      "nameTh": "คลองกุ่ม",
      "code": "10240",
      "fee": 70,
      "freeDeliveryAbove": 700
    },
    {
      "name": "Nawamin",
      "nameTh": "นวมินทร์",
      "code": "10240",
      "fee": 70,
      "freeDeliveryAbove": 700
    },
    {
      "name": "Nuan Chan",
      "nameTh": "นวลจันทร์",
      "code": "10240",
      "fee": 70,
      "freeDeliveryAbove": 700
    }
  ],
  "Saphan Sung": [
    {
      "name": "Saphan Sung",
      "nameTh": "สะพานสูง",
      "code": "10240",
      "fee": 70,
      "freeDeliveryAbove": 700
    },
    {
      "name": "Rat Phatthana",
      "nameTh": "ราษฎร์พัฒนา",
      "code": "10240",
      "fee": 70,
      "freeDeliveryAbove": 700
    },
    {
      "name": "Thap Chang",
      "nameTh": "ทับช้าง",
      "code": "10240",
      "fee": 70,
      "freeDeliveryAbove": 700
    }
  ],
  "Prawet": [
    {
      "name": "Prawet",
      "nameTh": "ประเวศ",
      "code": "10250",
      "fee": 70,
      "freeDeliveryAbove": 700
    },
    {
      "name": "Nong Bon",
      "nameTh": "หนองบอน",
      "code": "10250",
      "fee": 70,
      "freeDeliveryAbove": 700
    },
    {
      "name": "Dokmai",
      "nameTh": "ดอกไม้",
      "code": "10250",
      "fee": 70,
      "freeDeliveryAbove": 700
    }
  ],
  "Chom Thong": [
    {
      "name": "Bang Khun Thian",
      "nameTh": "บางขุนเทียน",
      "code": "10150",
      "fee": 70,
      "freeDeliveryAbove": 700
    },
    {
      "name": "Bang Kho",
      "nameTh": "บางค้อ",
      "code": "10150",
      "fee": 70,
      "freeDeliveryAbove": 700
    },
    {
      "name": "Bang Mot",
      "nameTh": "บางมด",
      "code": "10150",
      "fee": 70,
      "freeDeliveryAbove": 700
    },
    {
      "name": "Chom Thong",
      "nameTh": "จอมทอง",
      "code": "10150",
      "fee": 70,
      "freeDeliveryAbove": 700
    }
  ],
  "Phasi Charoen": [
    {
      "name": "Bang Wa",
      "nameTh": "บางหว้า",
      "code": "10160",
      "fee": 70,
      "freeDeliveryAbove": 700
    },
    {
      "name": "Bang Duan",
      "nameTh": "บางด้วน",
      "code": "10160",
      "fee": 70,
      "freeDeliveryAbove": 700
    },
    {
      "name": "Bang Chak",
      "nameTh": "บางจาก",
      "code": "10160",
      "fee": 70,
      "freeDeliveryAbove": 700
    },
    {
      "name": "Bang Waek",
      "nameTh": "บางแวก",
      "code": "10160",
      "fee": 70,
      "freeDeliveryAbove": 700
    },
    {
      "name": "Khlong Khwang",
      "nameTh": "คลองขวาง",
      "code": "10160",
      "fee": 70,
      "freeDeliveryAbove": 700
    },
    {
      "name": "Pak Khlong Phasi Charoen",
      "nameTh": "ปากคลองภาษีเจริญ",
      "code": "10160",
      "fee": 70,
      "freeDeliveryAbove": 700
    },
    {
      "name": "Khuha Sawan",
      "nameTh": "คูหาสวรรค์",
      "code": "10160",
      "fee": 70,
      "freeDeliveryAbove": 700
    }
  ],
  "Rat Burana": [
    {
      "name": "Rat Burana",
      "nameTh": "ราษฎร์บูรณะ",
      "code": "10140",
      "fee": 70,
      "freeDeliveryAbove": 700
    },
    {
      "name": "Bang Pakok",
      "nameTh": "บางปะกอก",
      "code": "10140",
      "fee": 70,
      "freeDeliveryAbove": 700
    }
  ],
  "Thung Khru": [
    {
      "name": "Bang Mot",
      "nameTh": "บางมด",
      "code": "10140",
      "fee": 70,
      "freeDeliveryAbove": 700
    },
    {
      "name": "Thung Khru",
      "nameTh": "ทุ่งครุ",
      "code": "10140",
      "fee": 70,
      "freeDeliveryAbove": 700
    }
  ],
  "Bang Khen": [
    {
      "name": "Anusawari",
      "nameTh": "อนุสาวรีย์",
      "code": "10220",
      "fee": 80,
      "freeDeliveryAbove": 700
    },
    {
      "name": "Tha Raeng",
      "nameTh": "ท่าแร้ง",
      "code": "10220",
      "fee": 80,
      "freeDeliveryAbove": 700
    }
  ],
  "Sai Mai": [
    {
      "name": "Sai Mai",
      "nameTh": "สายไหม",
      "code": "10220",
      "fee": 80,
      "freeDeliveryAbove": 700
    },
    {
      "name": "O Ngoen",
      "nameTh": "ออเงิน",
      "code": "10220",
      "fee": 80,
      "freeDeliveryAbove": 700
    },
    {
      "name": "Khlong Thanon",
      "nameTh": "คลองถนน",
      "code": "10220",
      "fee": 80,
      "freeDeliveryAbove": 700
    }
  ],
  "Don Mueang": [
    {
      "name": "Si Kan",
      "nameTh": "สีกัน",
      "code": "10210",
      "fee": 80,
      "freeDeliveryAbove": 700
    },
    {
      "name": "Don Mueang",
      "nameTh": "ดอนเมือง",
      "code": "10210",
      "fee": 80,
      "freeDeliveryAbove": 700
    },
    {
      "name": "Sanam Bin",
      "nameTh": "สนามบิน",
      "code": "10210",
      "fee": 80,
      "freeDeliveryAbove": 700
    }
  ],
  "Lak Si": [
    {
      "name": "Thung Song Hong",
      "nameTh": "ทุ่งสองห้อง",
      "code": "10210",
      "fee": 80,
      "freeDeliveryAbove": 700
    },
    {
      "name": "Talat Bang Khen",
      "nameTh": "ตลาดบางเขน",
      "code": "10210",
      "fee": 80,
      "freeDeliveryAbove": 700
    }
  ],
  "Khan Na Yao": [
    {
      "name": "Khan Na Yao",
      "nameTh": "คันนายาว",
      "code": "10230",
      "fee": 80,
      "freeDeliveryAbove": 700
    },
    {
      "name": "Ram Inthra",
      "nameTh": "รามอินทรา",
      "code": "10230",
      "fee": 80,
      "freeDeliveryAbove": 700
    }
  ],
  "Taling Chan": [
    {
      "name": "Khlong Chak Phra",
      "nameTh": "คลองชักพระ",
      "code": "10170",
      "fee": 80,
      "freeDeliveryAbove": 700
    },
    {
      "name": "Taling Chan",
      "nameTh": "ตลิ่งชัน",
      "code": "10170",
      "fee": 80,
      "freeDeliveryAbove": 700
    },
    {
      "name": "Chimphli",
      "nameTh": "ฉิมพลี",
      "code": "10170",
      "fee": 80,
      "freeDeliveryAbove": 700
    },
    {
      "name": "Bang Phrom",
      "nameTh": "บางพรม",
      "code": "10170",
      "fee": 80,
      "freeDeliveryAbove": 700
    },
    {
      "name": "Bang Ramat",
      "nameTh": "บางระมาด",
      "code": "10170",
      "fee": 80,
      "freeDeliveryAbove": 700
    },
    {
      "name": "Bang Chueak Nang",
      "nameTh": "บางเชือกหนัง",
      "code": "10170",
      "fee": 80,
      "freeDeliveryAbove": 700
    }
  ],
  "Thawi Watthana": [
    {
      "name": "Thawi Watthana",
      "nameTh": "ทวีวัฒนา",
      "code": "10170",
      "fee": 80,
      "freeDeliveryAbove": 700
    },
    {
      "name": "Sala Thammasop",
      "nameTh": "ศาลาธรรมสพน์",
      "code": "10170",
      "fee": 80,
      "freeDeliveryAbove": 700
    }
  ],
  "Bang Khae": [
    {
      "name": "Bang Khae",
      "nameTh": "บางแค",
      "code": "10160",
      "fee": 80,
      "freeDeliveryAbove": 700
    },
    {
      "name": "Bang Khae Nuea",
      "nameTh": "บางแคเหนือ",
      "code": "10160",
      "fee": 80,
      "freeDeliveryAbove": 700
    },
    {
      "name": "Bang Phai",
      "nameTh": "บางไผ่",
      "code": "10160",
      "fee": 80,
      "freeDeliveryAbove": 700
    },
    {
      "name": "Lak Song",
      "nameTh": "หลักสอง",
      "code": "10160",
      "fee": 80,
      "freeDeliveryAbove": 700
    }
  ],
  "Nong Khaem": [
    {
      "name": "Nong Khaem",
      "nameTh": "หนองแขม",
      "code": "10160",
      "fee": 80,
      "freeDeliveryAbove": 700
    },
    {
      "name": "Nong Khang Phlu",
      "nameTh": "หนองค้างพลู",
      "code": "10160",
      "fee": 80,
      "freeDeliveryAbove": 700
    }
  ],
  "Bang Bon": [
    {
      "name": "Bang Bon Nuea",
      "nameTh": "บางบอนเหนือ",
      "code": "10150",
      "fee": 80,
      "freeDeliveryAbove": 700
    },
    {
      "name": "Bang Bon Tai",
      "nameTh": "บางบอนใต้",
      "code": "10150",
      "fee": 80,
      "freeDeliveryAbove": 700
    },
    {
      "name": "Khlong Bang Phran",
      "nameTh": "คลองบางพราน",
      "code": "10150",
      "fee": 80,
      "freeDeliveryAbove": 700
    },
    {
      "name": "Khlong Bang Bon",
      "nameTh": "คลองบางบอน",
      "code": "10150",
      "fee": 80,
      "freeDeliveryAbove": 700
    }
  ],
  "Bang Khun Thian": [
    {
      "name": "Tha Kham",
      "nameTh": "ท่าข้าม",
      "code": "10150",
      "fee": 80,
      "freeDeliveryAbove": 700
    },
    {
      "name": "Samae Dam",
      "nameTh": "แสมดำ",
      "code": "10150",
      "fee": 80,
      "freeDeliveryAbove": 700
    }
  ],
  "Min Buri": [
    {
      "name": "Min Buri",
      "nameTh": "มีนบุรี",
      "code": "10510",
      "fee": 90,
      "freeDeliveryAbove": 800
    },
    {
      "name": "Saen Saep",
      "nameTh": "แสนแสบ",
      "code": "10510",
      "fee": 90,
      "freeDeliveryAbove": 800
    }
  ],
  "Khlong Sam Wa": [
    {
      "name": "Sam Wa Tawan Tok",
      "nameTh": "สามวาตะวันตก",
      "code": "10510",
      "fee": 90,
      "freeDeliveryAbove": 800
    },
    {
      "name": "Sam Wa Tawan Ok",
      "nameTh": "สามวาตะวันออก",
      "code": "10510",
      "fee": 90,
      "freeDeliveryAbove": 800
    },
    {
      "name": "Bang Chan",
      "nameTh": "บางชัน",
      "code": "10510",
      "fee": 90,
      "freeDeliveryAbove": 800
    },
    {
      "name": "Sai Kong Din",
      "nameTh": "ทรายกองดิน",
      "code": "10510",
      "fee": 90,
      "freeDeliveryAbove": 800
    },
    {
      "name": "Sai Kong Din Tai",
      "nameTh": "ทรายกองดินใต้",
      "code": "10510",
      "fee": 90,
      "freeDeliveryAbove": 800
    }
  ],
  "Lat Krabang": [
    {
      "name": "Lat Krabang",
      "nameTh": "ลาดกระบัง",
      "code": "10520",
      "fee": 90,
      "freeDeliveryAbove": 800
    },
    {
      "name": "Khlong Song Ton Nun",
      "nameTh": "คลองสองต้นนุ่น",
      "code": "10520",
      "fee": 90,
      "freeDeliveryAbove": 800
    },
    {
      "name": "Khlong Sam Prawet",
      "nameTh": "คลองสามประเวศ",
      "code": "10520",
      "fee": 90,
      "freeDeliveryAbove": 800
    },
    {
      "name": "Lam Pla Thio",
      "nameTh": "ลำปลาทิว",
      "code": "10520",
      "fee": 90,
      "freeDeliveryAbove": 800
    },
    {
      "name": "Thap Yao",
      "nameTh": "ทับยาว",
      "code": "10520",
      "fee": 90,
      "freeDeliveryAbove": 800
    },
    {
      "name": "Khum Thong",
      "nameTh": "ขุมทอง",
      "code": "10520",
      "fee": 90,
      "freeDeliveryAbove": 800
    }
  ],
  "Nong Chok": [
    {
      "name": "Krathum Rai",
      "nameTh": "กระทุ่มราย",
      "code": "10530",
      "fee": 90,
      "freeDeliveryAbove": 800
    },
    {
      "name": "Nong Chok",
      "nameTh": "หนองจอก",
      "code": "10530",
      "fee": 90,
      "freeDeliveryAbove": 800
    },
    {
      "name": "Khlong Sip",
      "nameTh": "คลองสิบ",
      "code": "10530",
      "fee": 90,
      "freeDeliveryAbove": 800
    },
    {
      "name": "Khlong Sip Song",
      "nameTh": "คลองสิบสอง",
      "code": "10530",
      "fee": 90,
      "freeDeliveryAbove": 800
    },
    {
      "name": "Khok Faet",
      "nameTh": "โคกแฝด",
      "code": "10530",
      "fee": 90,
      "freeDeliveryAbove": 800
    },
    {
      "name": "Khu Fang Nuea",
      "nameTh": "คู้ฝั่งเหนือ",
      "code": "10530",
      "fee": 90,
      "freeDeliveryAbove": 800
    },
    {
      "name": "Lam Phak Chi",
      "nameTh": "ลำผักชี",
      "code": "10530",
      "fee": 90,
      "freeDeliveryAbove": 800
    },
    {
      "name": "Lam Toiting",
      "nameTh": "ลำต้อยติ่ง",
      "code": "10530",
      "fee": 90,
      "freeDeliveryAbove": 800
    }
  ]
};

// ============================================================================
// 6. PATTAYA SUB-DISTRICTS & POPULAR AREAS LIST
// ============================================================================
export const PATTAYA_SUBDISTRICTS_LIST = DEFAULT_PATTAYA_SUBDISTRICTS.map(z => ({
  name: z.subdistrict,
  nameTh: z.subdistrictTh,
  district: z.district,
  districtTh: z.districtTh,
  code: z.code,
  fee: z.fee,
  freeDeliveryAbove: z.freeDeliveryAbove,
  areas: z.areas
}));

// ============================================================================
// 7. DISTRICT TO DEFAULT POSTAL CODE MAPPING
// ============================================================================
export const DISTRICT_TO_POSTAL_CODE = {
  "Watthana": "10110",
  "Khlong Toei": "10110",
  "Bang Rak": "10500",
  "Sathon": "10120",
  "Pathum Wan": "10330",
  "Phaya Thai": "10400",
  "Huai Khwang": "10310",
  "Chatuchak": "10900",
  "Din Daeng": "10400",
  "Yan Nawa": "10120",
  "Phra Nakhon": "10200",
  "Dusit": "10300",
  "Samphanthawong": "10100",
  "Pom Prap Sattru Phai": "10100",
  "Bang Kho Laem": "10120",
  "Bang Sue": "10800",
  "Phra Khanong": "10260",
  "Bang Na": "10260",
  "Suan Luang": "10250",
  "Ratchathewi": "10400",
  "Thon Buri": "10600",
  "Bangkok Yai": "10600",
  "Khlong San": "10600",
  "Bangkok Noi": "10700",
  "Bang Phlat": "10700",
  "Bang Kapi": "10240",
  "Wang Thonglang": "10310",
  "Lat Phrao": "10230",
  "Bueng Kum": "10240",
  "Saphan Sung": "10240",
  "Prawet": "10250",
  "Chom Thong": "10150",
  "Phasi Charoen": "10160",
  "Rat Burana": "10140",
  "Thung Khru": "10140",
  "Bang Khen": "10220",
  "Sai Mai": "10220",
  "Don Mueang": "10210",
  "Lak Si": "10210",
  "Khan Na Yao": "10230",
  "Taling Chan": "10170",
  "Thawi Watthana": "10170",
  "Bang Khae": "10160",
  "Nong Khaem": "10160",
  "Bang Bon": "10150",
  "Bang Khun Thian": "10150",
  "Min Buri": "10510",
  "Khlong Sam Wa": "10510",
  "Lat Krabang": "10520",
  "Nong Chok": "10530"
};

// ============================================================================
// 8. UNIFIED REAL-TIME DELIVERY FEE CALCULATOR
// ============================================================================
export function calculateDeliveryFee(locationInput, subtotal = 0, customZonesList = null, customConfig = null) {
  const zones = Array.isArray(customZonesList) && customZonesList.length > 0 
    ? customZonesList 
    : DEFAULT_ALL_DELIVERY_ZONES;
    
  const config = customConfig || DEFAULT_DELIVERY_CONFIG;
  const fallbackFee = config.baseDeliveryFee || 50;
  const isFreeDeliveryEnabled = config.storeWideFreeDeliveryThreshold !== null && config.storeWideFreeDeliveryThreshold !== undefined;

  let queryCity = '';
  let queryDistrict = '';
  let querySubdistrict = '';
  let queryPostal = '';
  let queryId = '';

  if (typeof locationInput === 'string') {
    const cleaned = locationInput.trim();
    if (/^\d{5}$/.test(cleaned)) {
      queryPostal = cleaned;
    } else {
      querySubdistrict = cleaned.toLowerCase();
    }
  } else if (locationInput && typeof locationInput === 'object') {
    queryCity = (locationInput.city || '').trim().toLowerCase();
    queryDistrict = (locationInput.district || '').trim().toLowerCase();
    querySubdistrict = (locationInput.subdistrict || '').trim().toLowerCase();
    queryPostal = (locationInput.postalCode || locationInput.code || '').trim();
    queryId = (locationInput.id || '').trim();
  }

  let matched = null;

  // 1. Exact ID match
  if (queryId) {
    matched = zones.find(z => z.id === queryId);
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
