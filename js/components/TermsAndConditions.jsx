import React from 'react';
import { Icon } from './Icons.jsx';
import { FULL_TERMS_SECTIONS, TERMS_SUMMARY_POINTS } from '../data/termsData.js';
import { CONTACT_CHANNELS } from '../store.js';

export function TermsAndConditions({ setView }) {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      
      {/* Page Header */}
      <div className="mb-10 text-center">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-900 text-white text-xs font-bold mb-3">
          <Icon name="shieldAlert" className="w-3.5 h-3.5 text-amber-400" />
          <span>Official Service Agreement • Bangkok Operations</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Terms & Conditions of Service
        </h1>
        <p className="text-sm text-slate-600 mt-2 max-w-xl mx-auto">
          Clear, transparent rules governing our 100% digital laundry service, central facility scale weighing, and customer communications.
        </p>
      </div>

      {/* Critical Highlight Notice: Strictly No Phone Calls */}
      <div className="mb-10 bg-gradient-to-r from-amber-500/10 via-amber-50 to-orange-500/10 border-2 border-amber-300 rounded-3xl p-6 sm:p-8">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-md">
            <Icon name="phoneOff" className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black text-amber-950">
              Mandatory Notice: Purely Digital Communication Protocol
            </h3>
            <p className="text-xs sm:text-sm text-amber-900 mt-2 leading-relaxed">
              NoName Laundry does <strong>not operate a physical storefront or an incoming phone call center</strong>. All customer communications, queries, address updates, driver coordination, and incident or damage claims are processed exclusively through our official online channels:
            </p>
            <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold">
              <span className="bg-white px-3 py-1.5 rounded-xl border border-amber-300 text-emerald-800 flex items-center gap-1.5 shadow-sm">
                <Icon name="whatsapp" className="w-3.5 h-3.5 text-emerald-600" /> WhatsApp: {CONTACT_CHANNELS.whatsapp.handle}
              </span>
              <span className="bg-white px-3 py-1.5 rounded-xl border border-amber-300 text-green-800 flex items-center gap-1.5 shadow-sm">
                <Icon name="line" className="w-3.5 h-3.5 text-green-600" /> LINE: {CONTACT_CHANNELS.line.handle}
              </span>
              <span className="bg-white px-3 py-1.5 rounded-xl border border-amber-300 text-sky-800 flex items-center gap-1.5 shadow-sm">
                <Icon name="mail" className="w-3.5 h-3.5 text-sky-600" /> Email: {CONTACT_CHANNELS.email.handle}
              </span>
            </div>
            <p className="text-[11px] text-amber-800 mt-2 italic font-medium">
              * Any voice telephone calls made to our administrative numbers will not be answered. All incident claims must be submitted in writing with photographic documentation.
            </p>
          </div>
        </div>
      </div>

      {/* Quick Summary Grid */}
      <div className="mb-12">
        <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-4">
          Key Terms at a Glance
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {TERMS_SUMMARY_POINTS.map((item) => (
            <div key={item.id} className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
              <div className="font-bold text-slate-900 text-xs sm:text-sm flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-sky-500" />
                {item.title}
              </div>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Full Detailed Legal Sections */}
      <div className="space-y-6">
        <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
          Full Operational & Legal Agreement
        </h2>

        {FULL_TERMS_SECTIONS.map((section, idx) => (
          <div
            key={idx}
            className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-3"
          >
            <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
              {section.title}
            </h3>
            <div className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
              {section.content}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom CTA to Book */}
      <div className="mt-12 bg-sky-50 rounded-3xl p-8 border border-sky-200 text-center">
        <h3 className="text-xl font-extrabold text-slate-900">
          Ready to Experience Bangkok's Digital Laundry?
        </h3>
        <p className="text-xs text-slate-600 mt-2 max-w-md mx-auto">
          Book online in under 60 seconds. Transparent weight billing, high-standard washing, and zero storefront hassle.
        </p>
        <button
          onClick={() => setView('book')}
          className="mt-5 px-8 py-3 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-sm shadow-lg shadow-sky-600/25 transition inline-flex items-center gap-2"
        >
          <span>Proceed to Booking Wizard</span>
          <Icon name="chevronRight" className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
}
