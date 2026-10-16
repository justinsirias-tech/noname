import React from 'react';
import { Icon } from './Icons.jsx';
import { CONTACT_CHANNELS } from '../store.js';
import { useTranslation } from '../i18n.jsx';

export function DigitalSupportBanner({ onOpenContactModal }) {
  const { t, language } = useTranslation();
  return (
    <section className="bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 text-white py-12 px-4 sm:px-6 lg:px-8 border-y border-sky-900/50">
      <div className="max-w-7xl mx-auto">
        <div className="bg-slate-800/80 rounded-3xl p-6 sm:p-10 border border-slate-700/80 shadow-2xl relative overflow-hidden">
          
          {/* Subtle Accent Light */}
          <div className="absolute -top-12 -right-12 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
            
            {/* Left Content */}
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold mb-4">
                <Icon name="phone" className="w-4 h-4 text-emerald-400" />
                <span>{language === 'th' ? 'ติดต่อโทร & WhatsApp: +66 80 888 9885 • LINE • อีเมล' : 'Call & WhatsApp: +66 80 888 9885 • LINE • Email'}</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {t('dsbTitle')}
              </h2>

              <p className="mt-3 text-sm sm:text-base text-slate-300 leading-relaxed">
                {t('dsbDesc')}
              </p>

              <div className="mt-4 flex flex-wrap gap-4 text-xs text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Icon name="check" className="w-4 h-4 text-sky-400" />
                  {t('dsbReason1Title')}
                </span>
                <span className="flex items-center gap-1.5">
                  <Icon name="check" className="w-4 h-4 text-sky-400" />
                  {t('dsbReason2Title')}
                </span>
                <span className="flex items-center gap-1.5">
                  <Icon name="check" className="w-4 h-4 text-sky-400" />
                  {t('dsbReason3Title')}
                </span>
              </div>
            </div>

            {/* Right: The Authorized Channels */}
            <div className="w-full lg:w-auto flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
              
              {/* Direct Phone Call Button */}
              <a
                href="tel:+66808889885"
                className="flex items-center justify-between gap-4 p-3.5 rounded-2xl bg-amber-600/20 hover:bg-amber-600/30 border border-amber-500/40 text-white transition group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-white shadow-md shadow-amber-500/30 group-hover:scale-105 transition">
                    <Icon name="phone" className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-sm text-amber-300">
                      {language === 'th' ? 'โทรศัพท์สายตรง' : 'Direct Mobile Call'}
                    </div>
                    <div className="text-xs text-slate-300">+66 80 888 9885</div>
                  </div>
                </div>
                <span className="text-[11px] font-semibold bg-amber-500/30 text-amber-200 px-2 py-0.5 rounded-md">
                  {language === 'th' ? 'โทรเลย' : 'Call Now'}
                </span>
              </a>
              
              {/* WhatsApp Button */}
              <a
                href={`${CONTACT_CHANNELS.whatsapp.url}Hello%20NoName%20Laundry%20Bangkok,%20I%20would%20like%20assistance`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between gap-4 p-3.5 rounded-2xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-white transition group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/30 group-hover:scale-105 transition">
                    <Icon name="whatsapp" className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-sm text-emerald-300">
                      {language === 'th' ? 'WhatsApp ทางการ' : 'WhatsApp Official'}
                    </div>
                    <div className="text-xs text-slate-300">{CONTACT_CHANNELS.whatsapp.handle}</div>
                  </div>
                </div>
                <span className="text-[11px] font-semibold bg-emerald-500/30 text-emerald-200 px-2 py-0.5 rounded-md">
                  {language === 'th' ? 'พร้อมให้บริการ' : 'Active'}
                </span>
              </a>

              {/* LINE Button */}
              <a
                href={CONTACT_CHANNELS.line.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between gap-4 p-3.5 rounded-2xl bg-green-600/20 hover:bg-green-600/30 border border-green-500/40 text-white transition group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-green-500 flex items-center justify-center text-white shadow-md shadow-green-500/30 group-hover:scale-105 transition">
                    <Icon name="line" className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-sm text-green-300">
                      {language === 'th' ? 'LINE บัญชีทางการ' : 'LINE Official Account'}
                    </div>
                    <div className="text-xs text-slate-300">{CONTACT_CHANNELS.line.handle}</div>
                  </div>
                </div>
                <span className="text-[11px] font-semibold bg-green-500/30 text-green-200 px-2 py-0.5 rounded-md">
                  {language === 'th' ? 'พร้อมให้บริการ' : 'Active'}
                </span>
              </a>

              {/* Email Support */}
              <a
                href="mailto:support@nonamelaundry.com?subject=NoName%20Laundry%20Support%20Request"
                className="flex items-center justify-between gap-4 p-3.5 rounded-2xl bg-sky-600/20 hover:bg-sky-600/30 border border-sky-500/40 text-white transition group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-sky-500 flex items-center justify-center text-white shadow-md shadow-sky-500/30 group-hover:scale-105 transition">
                    <Icon name="mail" className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-sm text-sky-300">
                      {language === 'th' ? 'ฝ่ายบริการทางอีเมล' : 'Email Support'}
                    </div>
                    <div className="text-xs text-slate-300">{CONTACT_CHANNELS.email.handle}</div>
                  </div>
                </div>
                <span className="text-[11px] font-semibold bg-sky-500/30 text-sky-200 px-2 py-0.5 rounded-md">
                  {language === 'th' ? 'สอบถามข้อมูล' : 'Inquiries'}
                </span>
              </a>

            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
