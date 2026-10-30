import React from 'react';
import { Icon } from './Icons.jsx';
import { FULL_TERMS_SECTIONS, TERMS_SUMMARY_POINTS } from '../data/termsData.js';
import { CONTACT_CHANNELS } from '../store.js';
import { useTranslation } from '../i18n.jsx';

export function TermsAndConditions({ setView }) {
  const { language } = useTranslation();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      
      {/* Page Header */}
      <div className="mb-10 text-center">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-900 text-white text-xs font-bold mb-3">
          <Icon name="shieldAlert" className="w-3.5 h-3.5 text-amber-400" />
          <span>{language === 'th' ? 'ข้อตกลงการให้บริการอย่างเป็นทางการ • กรุงเทพฯ และพัทยา' : 'Official Service Agreement • Bangkok Operations'}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          {language === 'th' ? 'ข้อกำหนดและเงื่อนไขการให้บริการ' : 'Terms & Conditions of Service'}
        </h1>
        <p className="text-sm text-slate-600 mt-2 max-w-xl mx-auto">
          {language === 'th' 
            ? 'ข้อกำหนดที่ชัดเจนและโปร่งใสสำหรับการบริการซักอบรีดดิจิทัล การชั่งน้ำหนักที่ศูนย์ซัก และการสื่อสารดูแลลูกค้า' 
            : 'Clear, transparent rules governing our 100% digital laundry service, central facility scale weighing, and customer communications.'}
        </p>
      </div>

      {/* Customer Contact & Support Protocol */}
      <div className="mb-10 bg-gradient-to-r from-sky-500/10 via-sky-50 to-emerald-500/10 border-2 border-sky-300 rounded-3xl p-6 sm:p-8">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-sky-600 text-white flex items-center justify-center shrink-0 shadow-md">
            <Icon name="phone" className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black text-slate-900">
              {language === 'th' ? 'ช่องทางการติดต่อและประสานงานลูกค้า' : 'Customer Contact & Communication Protocol'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-700 mt-2 leading-relaxed">
              {language === 'th'
                ? 'NoName Laundry มีทีมงานพร้อมดูแลลูกค้าและประสานงานคนขับผ่านช่องทางทางการต่อไปนี้:'
                : 'NoName Laundry provides dedicated customer support and driver coordination through our authorized mobile, chat, and email channels:'}
            </p>
            <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold">
              <a href="tel:+66808889885" className="bg-white px-3 py-1.5 rounded-xl border border-sky-300 text-amber-900 flex items-center gap-1.5 shadow-sm hover:bg-slate-50 transition">
                <Icon name="phone" className="w-3.5 h-3.5 text-amber-600" /> {language === 'th' ? 'โทรศัพท์:' : 'Phone:'} +66 80 888 9885
              </a>
              <a href="https://wa.me/66808889885" target="_blank" rel="noreferrer" className="bg-white px-3 py-1.5 rounded-xl border border-sky-300 text-emerald-800 flex items-center gap-1.5 shadow-sm hover:bg-slate-50 transition">
                <Icon name="whatsapp" className="w-3.5 h-3.5 text-emerald-600" /> WhatsApp: +66 80 888 9885
              </a>
              <a href={CONTACT_CHANNELS.line.url} target="_blank" rel="noreferrer" className="bg-white px-3 py-1.5 rounded-xl border border-sky-300 text-green-800 flex items-center gap-1.5 shadow-sm hover:bg-slate-50 transition">
                <Icon name="line" className="w-3.5 h-3.5 text-green-600" /> LINE: {CONTACT_CHANNELS.line.handle}
              </a>
              <a href="mailto:nonamelaundrybooking@gmail.com" className="bg-white px-3 py-1.5 rounded-xl border border-sky-300 text-sky-800 flex items-center gap-1.5 shadow-sm hover:bg-slate-50 transition">
                <Icon name="mail" className="w-3.5 h-3.5 text-sky-600" /> {language === 'th' ? 'อีเมล:' : 'Email:'} {CONTACT_CHANNELS.email.handle}
              </a>
            </div>
            <p className="text-[11px] text-slate-500 mt-2 italic font-medium">
              {language === 'th'
                ? '* เพื่อการตรวจสอบที่แม่นยำและการดูแลกรณีผ้าชำรุดเสียหาย โปรดแนบภาพถ่ายหลักฐานส่งเข้ามาทาง WhatsApp, LINE หรืออีเมล'
                : '* For quality assurance and damage claims, photographic documentation is requested in writing via WhatsApp, LINE, or Email.'}
            </p>
          </div>
        </div>
      </div>

      {/* Quick Summary Grid */}
      <div className="mb-12">
        <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-4">
          {language === 'th' ? 'สาระสำคัญโดยสังเขป' : 'Key Terms at a Glance'}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {TERMS_SUMMARY_POINTS.map((item) => (
            <div key={item.id} className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
              <div className="font-bold text-slate-900 text-xs sm:text-sm flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-sky-500" />
                {language === 'th' && item.titleTh ? item.titleTh : item.title}
              </div>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                {language === 'th' && item.descTh ? item.descTh : item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Full Detailed Legal Sections */}
      <div className="space-y-6">
        <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
          {language === 'th' ? 'ข้อกำหนดและสัญญาการให้บริการฉบับสมบูรณ์' : 'Full Operational & Legal Agreement'}
        </h2>

        {FULL_TERMS_SECTIONS.map((section, idx) => (
          <div
            key={idx}
            className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-3"
          >
            <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
              {language === 'th' && section.titleTh ? section.titleTh : section.title}
            </h3>
            <div className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
              {language === 'th' && section.contentTh ? section.contentTh : section.content}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom CTA to Book */}
      <div className="mt-12 bg-sky-50 rounded-3xl p-8 border border-sky-200 text-center">
        <h3 className="text-xl font-extrabold text-slate-900">
          {language === 'th' ? 'พร้อมสัมผัสประสบการณ์ซักอบรีดส่งถึงที่แล้วหรือยัง?' : "Ready to Experience Bangkok's Digital Laundry?"}
        </h3>
        <p className="text-xs text-slate-600 mt-2 max-w-md mx-auto">
          {language === 'th'
            ? 'จองรับผ้าออนไลน์ในไม่ถึง 60 วินาที คิดราคาตามน้ำหนักจริง มาตรฐานสะอาดระดับสากล ไม่ต้องเสียเวลาเดินทาง'
            : 'Book online in under 60 seconds. Transparent weight billing, high-standard washing, and zero storefront hassle.'}
        </p>
        <button
          onClick={() => setView('book')}
          className="mt-5 px-8 py-3 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-sm shadow-lg shadow-sky-600/25 transition inline-flex items-center gap-2"
        >
          <span>{language === 'th' ? 'ไปที่หน้าจองรับผ้า' : 'Proceed to Booking Wizard'}</span>
          <Icon name="chevronRight" className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
}
