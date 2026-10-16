import React from 'react';
import { Icon } from './Icons.jsx';
import { CONTACT_CHANNELS } from '../store.js';
import { useTranslation } from '../i18n.jsx';

export function Footer({ setView }) {
  const { t, language } = useTranslation();
  return (
    <footer className="bg-slate-900 text-slate-400 text-xs border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          
          {/* Col 1: Brand & Digital Policy */}
          <div className="space-y-4 md:col-span-1">
            <div className="bg-white p-3 rounded-2xl inline-block shadow-md border border-slate-700">
              <img 
                src="/images/logo.png" 
                alt="NoName Laundry" 
                onError={(e) => {
                  if (!e.target.dataset.tried) {
                    e.target.dataset.tried = '1';
                    e.target.src = '/public/images/logo.png';
                  } else if (e.target.dataset.tried === '1') {
                    e.target.dataset.tried = '2';
                    e.target.src = '/images/logo_cropped.png';
                  }
                }}
                className="h-12 sm:h-14 w-auto object-contain" 
              />
            </div>

            <p className="text-slate-400 text-xs leading-relaxed">
              {t('footerBrandDesc')}
            </p>

            <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/80 text-[11px] text-emerald-300 flex items-start gap-2">
              <Icon name="phone" className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                {t('footerZeroPhone')}
              </span>
            </div>
          </div>

          {/* Col 2: Services by KG */}
          <div className="space-y-3">
            <h4 className="text-white font-extrabold text-xs uppercase tracking-wider">
              {language === 'th' ? 'บริการคิดตามน้ำหนัก (กก.)' : 'Services by Weight'}
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => setView('services')} className="hover:text-white transition">
                  {language === 'th' ? 'ซัก + พับ (เสื้อผ้าประจำวัน)' : 'Wash / Fold (Everyday Wear)'}
                </button>
              </li>
              <li>
                <button onClick={() => setView('services')} className="hover:text-white transition">
                  {language === 'th' ? 'ซัก + รีดไอน้ำ + พับ' : 'Wash / Iron / Fold (Crisp Steam Iron)'}
                </button>
              </li>
              <li>
                <button onClick={() => setView('services')} className="hover:text-white transition">
                  {language === 'th' ? 'ซัก + รีดไอน้ำ + แขวนไม้' : 'Wash / Iron / Hang (Wardrobe Ready)'}
                </button>
              </li>
              <li>
                <button onClick={() => setView('book')} className="hover:text-white transition text-sky-400 font-bold">
                  {language === 'th' ? 'คำนวณราคาและจองทันที' : 'Instant Price Calculator'}
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Bangkok Coverage & Protocol */}
          <div className="space-y-3">
            <h4 className="text-white font-extrabold text-xs uppercase tracking-wider">
              {language === 'th' ? 'พื้นที่ให้บริการ' : 'Coverage & Logistics'}
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-400">
              <li>{language === 'th' ? '• วัฒนา (ทองหล่อ, เอกมัย, พร้อมพงษ์)' : '• Watthana (Thonglor, Ekkamai, Phrom Phong)'}</li>
              <li>{language === 'th' ? '• คลองเตย (พระโขนง, อโศก)' : '• Khlong Toei (Phra Khanong, Asok)'}</li>
              <li>{language === 'th' ? '• บางรัก (สีลม, สุริยวงศ์) & สาทร' : '• Bang Rak (Silom, Surawong) & Sathon'}</li>
              <li>{language === 'th' ? '• ปทุมวัน, พญาไท (อารีย์), พระราม 9' : '• Pathum Wan, Phaya Thai (Ari), Rama 9'}</li>
              <li>{language === 'th' ? '• พัทยา (ทุกหาด ทุกโซน นาเกลือ จอมเทียน)' : '• Pattaya (All Zones, Jomtien, Naklua)'}</li>
              <li>{language === 'th' ? '• รองรับการฝากรับ-ส่งผ่านนิติบุคคลคอนโด' : '• Condo Juristic drop-off supported'}</li>
            </ul>
          </div>

          {/* Col 4: Customer Support Channels */}
          <div className="space-y-3">
            <h4 className="text-white font-extrabold text-xs uppercase tracking-wider">
              {language === 'th' ? 'ฝ่ายบริการลูกค้า' : 'Customer Support'}
            </h4>
            <div className="space-y-2">
              <a
                href="tel:+66808889885"
                className="flex items-center gap-2 text-amber-300 hover:text-amber-200 transition"
              >
                <Icon name="phone" className="w-4 h-4" />
                <span>{language === 'th' ? 'โทร:' : 'Call:'} +66 80 888 9885</span>
              </a>

              <a
                href={`${CONTACT_CHANNELS.whatsapp.url}Hi%20NoName%20Laundry%20Bangkok`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 text-emerald-400 hover:text-emerald-300 transition"
              >
                <Icon name="whatsapp" className="w-4 h-4" />
                <span>WhatsApp: {CONTACT_CHANNELS.whatsapp.handle}</span>
              </a>

              <a
                href={CONTACT_CHANNELS.line.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 text-green-400 hover:text-green-300 transition"
              >
                <Icon name="line" className="w-4 h-4" />
                <span>LINE: {CONTACT_CHANNELS.line.handle}</span>
              </a>

              <a
                href="mailto:support@nonamelaundry.com"
                className="flex items-center gap-2 text-sky-400 hover:text-sky-300 transition"
              >
                <Icon name="mail" className="w-4 h-4" />
                <span>{language === 'th' ? 'อีเมล:' : 'Email:'} {CONTACT_CHANNELS.email.handle}</span>
              </a>
            </div>

            <div className="pt-2 flex flex-col gap-1.5 items-start">
              <button
                onClick={() => setView('faq')}
                className="text-xs text-sky-400 hover:text-sky-300 font-bold underline underline-offset-4"
              >
                {language === 'th' ? '❓ คำถามที่พบบ่อย (FAQ)' : '❓ Frequently Asked Questions (FAQ)'}
              </button>
              <button
                onClick={() => setView('terms')}
                className="text-xs text-slate-300 hover:text-white underline underline-offset-4"
              >
                {language === 'th' ? 'ข้อกำหนดและเงื่อนไขการให้บริการ' : 'Terms & Conditions of Service'}
              </button>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500 text-[11px]">
          <div>
            {language === 'th'
              ? `© ${new Date().getFullYear()} NoName Laundry (กรุงเทพฯ และพัทยา ประเทศไทย) สงวนลิขสิทธิ์ • บริการซักอบรีดส่งถึงที่แบบดิจิทัล 100%`
              : `© ${new Date().getFullYear()} NoName Laundry (Bangkok, Thailand). All rights reserved. Purely digital door-to-door service.`}
          </div>

          <div className="flex items-center gap-4 flex-wrap">
            <button onClick={() => setView('faq')} className="hover:text-slate-300 font-bold text-slate-300">
              {language === 'th' ? 'คำถามที่พบบ่อย' : 'FAQ'}
            </button>
            <span>•</span>
            <button onClick={() => setView('terms')} className="hover:text-slate-300">
              {language === 'th' ? 'ข้อกำหนดบริการ' : 'Terms of Service'}
            </button>
            <span>•</span>
            <button onClick={() => setView('admin')} className="hover:text-slate-300 font-semibold text-sky-400">
              ⚙️ Staff Admin
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
}
