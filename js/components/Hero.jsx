import React, { useState } from 'react';
import { Icon } from './Icons.jsx';
import { CONTACT_CHANNELS } from '../store.js';

export function Hero({ services, setView, onSelectServiceForBooking }) {
  const [estimatedKg, setEstimatedKg] = useState(4.0);
  const [selectedServiceId, setSelectedServiceId] = useState(services[0]?.id || 'wash_fold');

  const selectedService = services.find(s => s.id === selectedServiceId) || services[0];
  const billableKg = Math.max(Number(estimatedKg), Number(selectedService.minWeightKg));
  const estimatedCost = Math.round(billableKg * Number(selectedService.pricePerKg));

  return (
    <section className="relative overflow-hidden pt-8 pb-16 lg:pt-16 lg:pb-24 bg-gradient-to-b from-sky-50/60 via-white to-slate-50">
      {/* Subtle Background Glows */}
      <div className="absolute top-0 right-0 -mr-24 -mt-24 w-96 h-96 rounded-full bg-sky-200/40 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-24 -mb-24 w-96 h-96 rounded-full bg-teal-200/30 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Strictly Digital & No Call Badge */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-sky-200 shadow-sm text-xs font-semibold text-sky-800">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Bangkok Cloud Laundry • Purely Digital Door-to-Door</span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-xs font-semibold text-amber-800">
            <Icon name="phoneOff" className="w-3.5 h-3.5 text-amber-600" />
            <span>Online Support Only (WhatsApp / LINE / Email)</span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800">
            <Icon name="receipt" className="w-3.5 h-3.5 text-emerald-600" />
            <span>100% Cashless System (PromptPay / Card)</span>
          </div>
        </div>

        {/* Main Hero Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
            Fresh Laundry By The KG.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-600 via-sky-500 to-teal-500">
              Zero Storefront.
            </span>
          </h1>

          <p className="mt-5 text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
            <strong>NoName Laundry</strong> brings high-standard garment care directly to your Bangkok condominium or home. Transparent by-the-KG pricing, digital scale audit, and smooth communication exclusively via <strong>WhatsApp, LINE, and Email</strong>.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <button
              onClick={() => setView('book')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-sky-600 hover:bg-sky-500 text-white font-bold text-base px-8 py-3.5 rounded-xl shadow-lg shadow-sky-600/30 hover:shadow-sky-600/40 transition transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <Icon name="truck" className="w-5 h-5" />
              <span>Schedule Bangkok Pickup</span>
            </button>

            <button
              onClick={() => setView('track')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-800 font-bold text-base px-6 py-3.5 rounded-xl border border-slate-200 shadow-sm transition"
            >
              <Icon name="search" className="w-5 h-5 text-slate-500" />
              <span>Track Active Order</span>
            </button>
          </div>

          <div className="mt-3 flex items-center justify-center gap-1.5 text-xs text-slate-500">
            <span>New customer?</span>
            <button
              onClick={() => setView('register')}
              className="font-bold text-sky-600 hover:text-sky-700 underline decoration-sky-300 underline-offset-2 transition"
            >
              Register member profile for 1-click pickup &rarr;
            </button>
          </div>

          <div className="mt-4 flex items-center justify-center gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <Icon name="check" className="w-4 h-4 text-emerald-600" /> 48h Standard (24h &amp; Same Day Available)
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Icon name="check" className="w-4 h-4 text-emerald-600" /> Condo Juristic Drop-Off
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Icon name="check" className="w-4 h-4 text-emerald-600" /> Transparent Scale Weight
            </span>
          </div>
        </div>

        {/* Interactive Quick Estimate Card */}
        <div className="max-w-4xl mx-auto bg-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/50 border border-slate-100">
          <div className="border-b border-slate-100 pb-5 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs uppercase tracking-wider font-bold text-sky-600">
                Instant Price Calculator
              </span>
              <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 mt-0.5">
                Estimate Your Laundry Cost by Weight
              </h3>
            </div>
            <div className="text-xs text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg inline-flex items-center gap-1.5 self-start sm:self-auto">
              <Icon name="scale" className="w-4 h-4 text-slate-600" />
              <span>Final billing verified on central facility scale</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            
            {/* Step 1: Select Service */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                1. Select Service Tier
              </label>
              <div className="space-y-2">
                {services.map(srv => (
                  <button
                    key={srv.id}
                    onClick={() => setSelectedServiceId(srv.id)}
                    className={`w-full text-left p-3 rounded-xl border transition flex items-center justify-between ${
                      selectedServiceId === srv.id
                        ? 'border-sky-500 bg-sky-50/70 text-sky-900 ring-1 ring-sky-500'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-sm">{srv.name}</div>
                      <div className="text-xs text-slate-500">
                        ฿{srv.pricePerKg}/KG (Min {srv.minWeightKg} KG)
                      </div>
                    </div>
                    {selectedServiceId === srv.id && (
                      <div className="w-5 h-5 rounded-full bg-sky-600 text-white flex items-center justify-center">
                        <Icon name="check" className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Step 2: Weight Slider */}
            <div className="space-y-3 bg-slate-50/80 p-4 rounded-2xl border border-slate-200/70">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                  2. Estimated Weight
                </label>
                <span className="text-lg font-extrabold text-sky-600 bg-white px-2.5 py-0.5 rounded-lg border border-slate-200 shadow-sm">
                  {estimatedKg} KG
                </span>
              </div>

              <input
                type="range"
                min="1.0"
                max="15.0"
                step="0.5"
                value={estimatedKg}
                onChange={(e) => setEstimatedKg(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-600"
              />

              <div className="flex justify-between text-[11px] text-slate-500">
                <span>1.0 KG (~5 shirts)</span>
                <span>5.0 KG (Weekly laundry)</span>
                <span>15 KG</span>
              </div>

              {Number(estimatedKg) < Number(selectedService.minWeightKg) && (
                <div className="text-[11px] text-amber-700 bg-amber-50 p-2 rounded-lg border border-amber-200/70 flex items-center gap-1.5">
                  <Icon name="shieldAlert" className="w-4 h-4 shrink-0 text-amber-600" />
                  <span>
                    Service min weight is {selectedService.minWeightKg} KG (billed for min {selectedService.minWeightKg} KG).
                  </span>
                </div>
              )}
            </div>

            {/* Step 3: Estimated Total & Quick Book */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-5 rounded-2xl flex flex-col justify-between h-full shadow-lg">
              <div>
                <div className="text-xs font-medium text-slate-400">Estimated Total</div>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-3xl sm:text-4xl font-black text-sky-400">
                    ฿{estimatedCost}
                  </span>
                  <span className="text-xs text-slate-300">THB</span>
                </div>
                <div className="text-xs text-slate-400 mt-2 space-y-1">
                  <div>• Billed Weight: {billableKg.toFixed(1)} KG</div>
                  <div>• Rate: ฿{selectedService.pricePerKg} / KG</div>
                  <div>• Turnaround: ~{selectedService.turnaroundHours}h</div>
                </div>
              </div>

              <button
                onClick={() => onSelectServiceForBooking(selectedServiceId, estimatedKg)}
                className="mt-5 w-full inline-flex items-center justify-center gap-2 bg-sky-500 hover:bg-sky-400 text-white font-bold text-sm py-2.5 px-4 rounded-xl transition shadow-md"
              >
                <span>Book This Service</span>
                <Icon name="chevronRight" className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
