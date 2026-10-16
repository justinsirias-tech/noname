import React, { useState, useMemo } from 'react';
import { Icon } from './Icons.jsx';
import { useTranslation } from '../i18n.jsx';
import { BANGKOK_DISTRICTS } from '../data/servicesData.js';

// Detailed sub-district and landmark mapping for Bangkok & Pattaya
export const COVERAGE_DATA = {
  bangkok: [
    {
      district: 'Watthana',
      thaiName: 'วัฒนา',
      popularSubDistricts: ['Thonglor (ทองหล่อ)', 'Ekkamai (เอกมัย)', 'Phrom Phong (พร้อมพงษ์)', 'Khlong Tan Nuea', 'Phra Khanong Nuea', 'Khlong Toei Nuea'],
      popularCondos: ['The Estelle Phrom Phong', 'Rhythm Ekkamai', 'HQ by Sansiri', 'Ashton Morph 38', 'Noble Remix', 'Tela Thonglor'],
      status: 'Daily Doorstep & Juristic Pickup (10:30 - 20:30)'
    },
    {
      district: 'Khlong Toei',
      thaiName: 'คลองเตย',
      popularSubDistricts: ['Asoke (อโศก)', 'Khlong Tan (คลองตัน)', 'Khlong Toei', 'Phra Khanong (พระโขนง)'],
      popularCondos: ['Ashton Asoke', 'Edge Sukhumvit 23', 'The Esse at Singha Complex', 'FYI Center', 'Q House Asoke'],
      status: 'Daily Doorstep & Juristic Pickup (10:30 - 20:30)'
    },
    {
      district: 'Bang Rak',
      thaiName: 'บางรัก',
      popularSubDistricts: ['Silom (สีลม)', 'Suriyawong (สุริยวงศ์)', 'Si Phraya (สี่พระยา)', 'Maha Phruettharam (มหาพฤฒาราม)'],
      popularCondos: ['Silom Grand Terrace', 'The Ritz-Carlton Residences Mahanakhon', 'Ideo Q Chula-Samyan', 'Ashton Chula-Silom'],
      status: 'Daily Doorstep & Juristic Pickup (10:30 - 20:30)'
    },
    {
      district: 'Sathon',
      thaiName: 'สาทร',
      popularSubDistricts: ['Sathorn (สาทร)', 'Chong Nonsi (ช่องนนทรี)', 'Thung Maha Mek (ทุ่งมหาเมฆ)', 'Thung Wat Don (ทุ่งวัดดอน)'],
      popularCondos: ['The Met Sathorn', 'Supalai Elite Sathorn', 'KnightsBridge Prime Sathorn', 'The Sukhothai Residences'],
      status: 'Daily Doorstep & Juristic Pickup (10:30 - 20:30)'
    },
    {
      district: 'Pathum Wan',
      thaiName: 'ปทุมวัน',
      popularSubDistricts: ['Lumphini (ลุมพินี)', 'Ploenchit (เพลินจิต)', 'Chidlom (ชิดลม)', 'Siam (สยาม)', 'Rong Mueang', 'Wang Mai'],
      popularCondos: ['Magnolias Ratchadamri', 'Sindhorn Residences', 'Q Langsuan', 'Wish Signature Midtown Siam'],
      status: 'Daily Doorstep & Juristic Pickup (10:30 - 20:30)'
    },
    {
      district: 'Phaya Thai',
      thaiName: 'พญาไท',
      popularSubDistricts: ['Ari (อารีย์)', 'Sanam Pao (สนามเป้า)', 'Sam Sen Nai (สามเสนใน)', 'Saphan Khwai (สะพานควาย)'],
      popularCondos: ['Centric Ari Station', 'Rhythm Phahon-Ari', 'The Monument Thong Lo / Ari', 'Noble Around Ari'],
      status: 'Daily Doorstep & Juristic Pickup (10:30 - 20:30)'
    },
    {
      district: 'Huai Khwang & Din Daeng',
      thaiName: 'ห้วยขวาง & ดินแดง',
      popularSubDistricts: ['Rama 9 (พระราม 9)', 'Ratchada (รัชดา)', 'Sam Sen Nok', 'Huai Khwang', 'Din Daeng'],
      popularCondos: ['Ideo Rama 9 Asoke', 'Belle Grand Rama 9', 'Rhythm Asoke', 'Life Asoke Hype'],
      status: 'Daily Doorstep & Juristic Pickup (10:30 - 20:30)'
    },
    {
      district: 'Chatuchak',
      thaiName: 'จตุจักร',
      popularSubDistricts: ['Mo Chit (หมอชิต)', 'Lat Yao (ลาดยาว)', 'Sena Nikhom', 'Chomphon', 'Chan Kasem'],
      popularCondos: ['The Line Jatujak-Mochit', 'M Ladprao', 'Equinox Phahol-Vibha', 'Life Ladprao Valley'],
      status: 'Daily Doorstep & Juristic Pickup (10:30 - 20:30)'
    },
    {
      district: 'Phra Khanong & Bang Na',
      thaiName: 'พระโขนง & บางนา',
      popularSubDistricts: ['On Nut (อ่อนนุช)', 'Udom Suk (อุดมสุข)', 'Bang Chak (บางจาก)', 'Bang Na Nuea', 'Bang Na Tai'],
      popularCondos: ['The Base Sukhumvit 77', 'Ideo Mobi Sukhumvit 66', 'Whizdom Essence', 'The Sky Sukhumvit'],
      status: 'Daily Doorstep & Juristic Pickup (10:30 - 20:30)'
    },
    {
      district: 'Khlong San & Thon Buri',
      thaiName: 'คลองสาน & ธนบุรี',
      popularSubDistricts: ['Iconsiam Area (เจริญนคร)', 'Wongwian Yai (วงเวียนใหญ่)', 'Khlong San', 'Bang Lamphu Lang'],
      popularCondos: ['Magnolias Waterfront ICONSIAM', 'Banyan Tree Residences', 'The River Charoen Nakhon', 'Ideo Sathorn-Wongwian Yai'],
      status: 'Daily Doorstep & Juristic Pickup (10:30 - 20:30)'
    }
  ],
  pattaya: [
    {
      district: 'Central Pattaya (พัทยากลาง)',
      thaiName: 'พัทยากลาง',
      popularSubDistricts: ['Pattaya Beach Rd (สาย 1)', 'Pattaya 2nd Rd (สาย 2)', 'Pattaya 3rd Rd', 'Soi Buakhao', 'Central Festival Area'],
      popularCondos: ['The Base Central Pattaya', 'Centric Sea Pattaya', 'City Center Residence', 'Grand Avenue Residence'],
      status: 'Daily Doorstep, Hotel & Juristic Pickup (10:30 - 20:30)'
    },
    {
      district: 'North Pattaya & Naklua (พัทยาเหนือ / นาเกลือ)',
      thaiName: 'นาเกลือ / พัทยาเหนือ',
      popularSubDistricts: ['Wongamat Beach (หาดวงศ์อมาตย์)', 'Naklua Sub-district', 'Terminal 21 Pattaya Area', 'North Pattaya Rd'],
      popularCondos: ['The Riviera Wongamat', 'Zire Wongamat', 'Lumpini Ville Naklua', 'Ananya Beachfront'],
      status: 'Daily Doorstep, Hotel & Juristic Pickup (10:30 - 20:30)'
    },
    {
      district: 'South Pattaya & Pratumnak Hill (พัทยาใต้ / เขาพระตำหนัก)',
      thaiName: 'เขาพระตำหนัก / พัทยาใต้',
      popularSubDistricts: ['Pratumnak Soi 1-6', 'Cosy Beach Area', 'Walking Street Area', 'Thappraya Rd', 'Phra Tamnak Sub-district'],
      popularCondos: ['Unixx South Pattaya', 'The Cloud Pratumnak', 'Amari Residences Pattaya', 'City Garden Tropicana'],
      status: 'Daily Doorstep, Hotel & Juristic Pickup (10:30 - 20:30)'
    },
    {
      district: 'Jomtien & Na Jomtien (หาดจอมเทียน / นาจอมเทียน)',
      thaiName: 'จอมเทียน / นาจอมเทียน',
      popularSubDistricts: ['Jomtien Beach Rd', 'Jomtien 2nd Rd', 'Dongtan Beach', 'Chaiyapruek', 'Na Jomtien Sub-district'],
      popularCondos: ['The Riviera Jomtien', 'Lumpini Park Beach Jomtien', 'Atlantis Condo Resort', 'Copacabana Beach Jomtien'],
      status: 'Daily Doorstep, Hotel & Juristic Pickup (10:30 - 20:30)'
    },
    {
      district: 'East Pattaya & Nong Prue (พัทยาตะวันออก / หนองปรือ)',
      thaiName: 'หนองปรือ / พัทยาฝั่งม้า / ทะเลสาบมาบประชัน',
      popularSubDistricts: ['Nong Prue Sub-district', 'Huay Yai', 'Mabprachan Lake', 'Siam Country Club Rd', 'Soi Nern Plab Wan'],
      popularCondos: ['Private Pool Villas', 'Chockchai Village', 'Baan Dusit Pattaya', 'Silk Road Place'],
      status: 'Daily Doorstep, Villa & Juristic Pickup (10:30 - 20:30)'
    }
  ]
};

export function CoverageSection({ setView, city = 'Bangkok', onSwitchCity }) {
  const { language } = useTranslation();
  const [activeCityTab, setActiveCityTab] = useState(city === 'Pattaya' ? 'pattaya' : 'bangkok');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAllDistricts, setShowAllDistricts] = useState(false);

  // Sync tab with external city prop
  useMemo(() => {
    if (city === 'Pattaya') setActiveCityTab('pattaya');
    else setActiveCityTab('bangkok');
  }, [city]);

  const currentList = COVERAGE_DATA[activeCityTab] || COVERAGE_DATA.bangkok;

  // Filter based on district, sub-district, or condo keyword
  const filteredList = useMemo(() => {
    if (!searchQuery.trim()) return currentList;
    const q = searchQuery.toLowerCase().trim();
    return currentList.filter(item => {
      const matchDistrict = item.district.toLowerCase().includes(q) || item.thaiName.toLowerCase().includes(q);
      const matchSub = item.popularSubDistricts.some(sub => sub.toLowerCase().includes(q));
      const matchCondo = item.popularCondos.some(condo => condo.toLowerCase().includes(q));
      return matchDistrict || matchSub || matchCondo;
    });
  }, [currentList, searchQuery]);

  return (
    <section id="coverage" className="py-16 sm:py-24 bg-white border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-3 border border-emerald-200 shadow-2xs">
            <Icon name="mapPin" className="w-3.5 h-3.5 text-emerald-600" />
            <span>
              {language === 'th' ? 'ครอบคลุมทุกพื้นที่ตามแขวงและตำบล' : 'Full City Coverage by Sub-District'}
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            {language === 'th' ? 'รับ-ส่งผ้าครอบคลุมทั่วกรุงเทพฯ และพัทยา' : 'We Pick Up Across the Whole of Bangkok & Pattaya'}
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl mx-auto">
            {language === 'th'
              ? 'ไม่ว่าคุณจะอยู่ที่คอนโด โรงแรม วิลล่า หรือบ้านเดี่ยวในกรุงเทพฯ (ครบทั้ง 50 เขต 180 แขวง) หรือพัทยา (ทุกหาด ทุกโซน) พนักงานขับรถของเราพร้อมเข้ารับและส่งมอบถึงที่ทุกวัน'
              : 'Whether you reside in a high-rise condominium, serviced apartment, hotel, or private villa, our dedicated courier fleet services all 50 Bangkok districts (180+ sub-districts) and all Pattaya beachfront zones daily.'}
          </p>

          {/* City Switcher Buttons */}
          <div className="mt-6 inline-flex p-1 rounded-2xl bg-slate-100 border border-slate-200/80 shadow-inner">
            <button
              type="button"
              onClick={() => {
                setActiveCityTab('bangkok');
                if (onSwitchCity) onSwitchCity('Bangkok');
              }}
              className={`px-5 py-2.5 rounded-xl font-extrabold text-xs sm:text-sm transition cursor-pointer flex items-center gap-2 ${
                activeCityTab === 'bangkok'
                  ? 'bg-white text-sky-800 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>{language === 'th' ? '🏙️ กรุงเทพฯ (ครบทั้ง 50 เขต)' : '🏙️ Bangkok (All 50 Districts)'}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveCityTab('pattaya');
                if (onSwitchCity) onSwitchCity('Pattaya');
              }}
              className={`px-5 py-2.5 rounded-xl font-extrabold text-xs sm:text-sm transition cursor-pointer flex items-center gap-2 ${
                activeCityTab === 'pattaya'
                  ? 'bg-white text-sky-800 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>{language === 'th' ? '🏖️ พัทยา (ทุกหาด ทุกโซน)' : '🏖️ Pattaya (All Zones)'}</span>
            </button>
          </div>
        </div>

        {/* Live Sub-district & Condo Search Checker */}
        <div className="max-w-2xl mx-auto mb-10">
          <div className="relative">
            <Icon name="search" className="w-5 h-5 text-sky-500 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                activeCityTab === 'bangkok'
                  ? (language === 'th' ? 'พิมพ์ค้นหาชื่อแขวง เขต หรือชื่อคอนโดของคุณ (เช่น ทองหล่อ, สาทร, อารีย์, Ashton...)' : 'Type your sub-district, district, BTS station, or condo (e.g. Thonglor, Silom, Ari, Ashton)...')
                  : (language === 'th' ? 'พิมพ์ค้นหาชื่อตำบล โซน หรือคอนโดในพัทยา (เช่น จอมเทียน, วงศ์อมาตย์, เขาพระตำหนัก, Unixx...)' : 'Type your Pattaya area, beach, or condo (e.g. Jomtien, Wongamat, Pratumnak, Unixx)...')
              }
              className="w-full pl-12 pr-10 py-3.5 rounded-2xl border-2 border-sky-100 focus:border-sky-500 focus:ring-4 focus:ring-sky-100 text-xs sm:text-sm font-semibold text-slate-800 placeholder-slate-400 bg-slate-50/70 shadow-sm transition outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                title="Clear"
              >
                <Icon name="x" className="w-4 h-4" />
              </button>
            )}
          </div>

          {searchQuery && (
            <div className="mt-2.5 px-4 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Icon name="check" className="w-4 h-4 text-emerald-600" />
                <span>
                  {filteredList.length > 0 
                    ? (language === 'th' ? `พบ ${filteredList.length} โซนพื้นที่ • รับประกันบริการรับ-ส่งทุกวัน 100%!` : `${filteredList.length} area zone(s) matched • 100% Daily Pickup & Delivery Guaranteed!`)
                    : (language === 'th' ? `เราให้บริการครอบคลุมทุกพื้นที่ใน${activeCityTab === 'bangkok' ? 'กรุงเทพฯ' : 'พัทยา'}! หากไม่พบในรายการโปรดติดต่อเรา` : `We cover all areas in ${activeCityTab === 'bangkok' ? 'Bangkok' : 'Pattaya'}! Contact our team if not listed.`)}
                </span>
              </span>
              <span className="text-[10px] text-emerald-600 uppercase tracking-wide">
                {language === 'th' ? 'รอบรับผ้า 10:30+' : 'Daily 10:30+'}
              </span>
            </div>
          )}
        </div>

        {/* Coverage Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {filteredList.map((item, idx) => (
            <div
              key={idx}
              className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-sm hover:shadow-md transition flex flex-col justify-between group hover:border-sky-300"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-slate-900 group-hover:text-sky-700 transition">
                      {language === 'th' && item.thaiName ? item.thaiName : item.district}
                    </h3>
                    <span className="text-xs font-semibold text-slate-400 block mt-0.5">
                      {language === 'th' ? item.district : item.thaiName}
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold shrink-0 border border-emerald-200">
                    {language === 'th' ? 'เปิดบริการทุกวัน' : 'Active Daily'}
                  </span>
                </div>

                {/* Sub-Districts Chips */}
                <div className="mb-4">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1.5">
                    {language === 'th' ? 'แขวง / ตำบลยอดนิยม:' : 'Key Sub-Districts Covered:'}
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {item.popularSubDistricts.map((sub, sIdx) => (
                      <span
                        key={sIdx}
                        className="px-2.5 py-1 rounded-lg bg-sky-50 text-sky-800 text-[11px] font-bold border border-sky-100"
                      >
                        {sub}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Condos Landmark */}
                <div className="pt-3 border-t border-slate-100">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1.5">
                    {language === 'th' ? 'ตัวอย่างคอนโด & ที่พักอาศัย:' : 'Condos & Residence Hubs:'}
                  </span>
                  <p className="text-xs text-slate-600 font-medium leading-relaxed">
                    {item.popularCondos.join(' • ')}
                  </p>
                </div>
              </div>

              {/* Status footer */}
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span className="flex items-center gap-1 font-semibold text-emerald-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping-subtle" />
                  {language === 'th' ? 'รับ-ส่งถึงหน้าประตูและนิติบุคคลทุกวัน (10:30 - 20:30)' : item.status}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* All 50 Bangkok Districts Complete List Pill Drawer */}
        {activeCityTab === 'bangkok' && (
          <div className="mt-10 bg-slate-50/80 rounded-3xl p-5 sm:p-6 border border-slate-200/80 text-center">
            <div className="flex items-center justify-between flex-wrap gap-3 mb-3">
              <div className="text-left">
                <h4 className="text-sm font-extrabold text-slate-900">
                  {language === 'th' ? 'ให้บริการครอบคลุมครบทุก 50 เขตกรุงเทพมหานคร' : 'Complete 50 Bangkok Districts Directory'}
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  {language === 'th' ? 'รถรับ-ส่งผ้าของเราวิ่งให้บริการทุกวัน ทุกเขต' : 'Our courier van and scooter fleet operates 7 days a week across all 50 districts.'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAllDistricts(!showAllDistricts)}
                className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-sky-700 hover:bg-sky-50 shadow-2xs transition cursor-pointer"
              >
                {showAllDistricts 
                  ? (language === 'th' ? 'ซ่อนรายชื่อ 50 เขต' : 'Hide 50 Districts') 
                  : (language === 'th' ? 'แสดงรายชื่อทั้ง 50 เขต' : 'Show All 50 Districts')}
              </button>
            </div>

            {showAllDistricts && (
              <div className="pt-4 border-t border-slate-200 flex flex-wrap gap-2 text-left justify-center">
                {BANGKOK_DISTRICTS.map((d, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-[11px] font-bold text-slate-700 shadow-2xs"
                  >
                    ✓ {d}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Condo Juristic Feature Banner */}
        <div className="mt-8 bg-gradient-to-br from-slate-900 via-slate-800 to-sky-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-sky-500/20 text-sky-300 flex items-center justify-center text-2xl shrink-0 border border-sky-400/30">
              🏢
            </div>
            <div>
              <h4 className="text-lg sm:text-xl font-black text-white">
                {language === 'th' ? 'สะดวกสบายสำหรับชาวคอนโดมิเนียม' : '100% Condominium Juristic & Reception Friendly'}
              </h4>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
                {language === 'th'
                  ? 'ไม่ต้องอยู่รอคนขับ! เพียงฝากถุงผ้าไว้กับนิติบุคคลหรือเคาน์เตอร์ต้อนรับคอนโดของคุณ พนักงานขับรถจะติดแท็กบาร์โค้ด ชั่งน้ำหนัก และส่งใบเสร็จดิจิทัลพร้อมรูปภาพยืนยันผ่าน LINE / WhatsApp ทันที'
                  : 'No need to wait at home! Leave your laundry bag with your condo juristic office or lobby counter before leaving for work. Our drivers tag, weigh, and send digital scale photo receipts straight to your WhatsApp or LINE.'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              if (setView) setView('services');
            }}
            className="px-6 py-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-extrabold text-xs sm:text-sm shadow-lg shadow-sky-900/50 transition shrink-0 cursor-pointer flex items-center gap-2"
          >
            <span>{language === 'th' ? 'ดูบริการและจองทันที' : 'Book Pickup in Your Area'}</span>
            <Icon name="chevronRight" className="w-4 h-4" />
          </button>
        </div>

      </div>
    </section>
  );
}
