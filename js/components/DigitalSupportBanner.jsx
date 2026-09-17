import React from 'react';
import { Icon } from './Icons.jsx';
import { CONTACT_CHANNELS } from '../store.js';

export function DigitalSupportBanner({ onOpenContactModal }) {
  return (
    <section className="bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 text-white py-12 px-4 sm:px-6 lg:px-8 border-y border-sky-900/50">
      <div className="max-w-7xl mx-auto">
        <div className="bg-slate-800/80 rounded-3xl p-6 sm:p-10 border border-slate-700/80 shadow-2xl relative overflow-hidden">
          
          {/* Subtle Accent Light */}
          <div className="absolute -top-12 -right-12 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
            
            {/* Left Content */}
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold mb-4">
                <Icon name="phoneOff" className="w-4 h-4 text-amber-400" />
                <span>Zero Storefront • Zero Phone Calls Policy</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Purely Digital Support & Incident Resolution
              </h2>

              <p className="mt-3 text-sm sm:text-base text-slate-300 leading-relaxed">
                To guarantee full accountability, digital photographic audit, and lightning-fast response times, <strong>NoName Laundry operates entirely without telephone call centers</strong>. All inquiries, pickup instructions, status requests, and incident reports are handled strictly through our official online chat and email channels.
              </p>

              <div className="mt-4 flex flex-wrap gap-4 text-xs text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Icon name="check" className="w-4 h-4 text-sky-400" />
                  Written record of all instructions
                </span>
                <span className="flex items-center gap-1.5">
                  <Icon name="check" className="w-4 h-4 text-sky-400" />
                  Direct photo sharing for garment inspection
                </span>
                <span className="flex items-center gap-1.5">
                  <Icon name="check" className="w-4 h-4 text-sky-400" />
                  Fast average response in &lt; 5 minutes
                </span>
              </div>
            </div>

            {/* Right: The 3 Authorized Channels */}
            <div className="w-full lg:w-auto flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
              
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
                    <div className="font-bold text-sm text-emerald-300">WhatsApp Official</div>
                    <div className="text-xs text-slate-300">{CONTACT_CHANNELS.whatsapp.handle}</div>
                  </div>
                </div>
                <span className="text-[11px] font-semibold bg-emerald-500/30 text-emerald-200 px-2 py-0.5 rounded-md">
                  Active
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
                    <div className="font-bold text-sm text-green-300">LINE Official Account</div>
                    <div className="text-xs text-slate-300">{CONTACT_CHANNELS.line.handle}</div>
                  </div>
                </div>
                <span className="text-[11px] font-semibold bg-green-500/30 text-green-200 px-2 py-0.5 rounded-md">
                  Active
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
                    <div className="font-bold text-sm text-sky-300">Email Support</div>
                    <div className="text-xs text-slate-300">{CONTACT_CHANNELS.email.handle}</div>
                  </div>
                </div>
                <span className="text-[11px] font-semibold bg-sky-500/30 text-sky-200 px-2 py-0.5 rounded-md">
                  Inquiries
                </span>
              </a>

            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
