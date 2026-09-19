import React from 'react';
import { Icon } from './Icons.jsx';

export function ServicesSection({ services, onSelectServiceForBooking }) {
  return (
    <section id="services" className="py-16 sm:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-100 text-sky-800 text-xs font-bold uppercase tracking-wider mb-3">
            <Icon name="scale" className="w-3.5 h-3.5" />
            <span>Strictly By Weight (KG)</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Transparent Laundry Pricing
          </h2>
          <p className="mt-3 text-base text-slate-600">
            No complicated item counts. We bill purely by weight in Kilograms with minimum weight thresholds set for optimal machine batching and garment hygiene.
          </p>
        </div>

        {/* 3 Core Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {services.map((service, index) => {
            const isPopular = service.popular;
            return (
              <div
                key={service.id}
                className={`relative rounded-3xl p-7 flex flex-col justify-between transition duration-300 ${
                  isPopular
                    ? 'bg-gradient-to-b from-sky-50/90 to-white border-2 border-sky-500 shadow-xl shadow-sky-500/10'
                    : 'bg-white border border-slate-200 hover:border-slate-300 shadow-md hover:shadow-lg'
                }`}
              >
                {/* Popular Pill */}
                {isPopular && (
                  <div className="absolute -top-3.5 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-sky-600 to-teal-500 text-white text-xs font-bold px-4 py-1 rounded-full shadow-md">
                    Most Popular Choice
                  </div>
                )}

                <div>
                  {/* Service Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-xl font-extrabold text-slate-900">
                        {service.name}
                      </h3>
                      <div className="text-xs text-sky-600 font-medium mt-0.5">
                        {service.nameTh}
                      </div>
                    </div>
                    <span className="w-10 h-10 rounded-2xl bg-sky-100/80 text-sky-600 flex items-center justify-center font-bold text-lg">
                      {index === 0 ? '🧺' : index === 1 ? '👔' : '✨'}
                    </span>
                  </div>

                  <p className="mt-4 text-xs text-slate-600 leading-relaxed min-h-[48px]">
                    {service.description}
                  </p>

                  {/* Price & Min Weight */}
                  <div className="mt-6 p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
                    {/* Dual Pricing Badges */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-2.5 rounded-xl bg-white border border-sky-200 shadow-2xs">
                        <div className="text-[10px] uppercase font-bold text-sky-700 flex items-center gap-1">
                          <span>🕒 Next Day</span>
                        </div>
                        <div className="flex items-baseline gap-0.5 mt-0.5">
                          <span className="text-xl sm:text-2xl font-black text-slate-900">
                            ฿{service.nextDayPricePerKg || service.pricePerKg}
                          </span>
                          <span className="text-[10px] text-slate-400 font-bold uppercase">/KG</span>
                        </div>
                        <div className="text-[10px] text-slate-500 font-medium mt-0.5">~24h Standard</div>
                      </div>

                      <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200 shadow-2xs">
                        <div className="text-[10px] uppercase font-bold text-amber-800 flex items-center gap-1">
                          <span>⚡ Same Day</span>
                        </div>
                        <div className="flex items-baseline gap-0.5 mt-0.5">
                          {service.sameDayAvailable !== false ? (
                            <>
                              <span className="text-xl sm:text-2xl font-black text-amber-950">
                                ฿{service.sameDayPricePerKg || Math.round((service.pricePerKg || 65) * 1.45)}
                              </span>
                              <span className="text-[10px] text-amber-700/70 font-bold uppercase">/KG</span>
                            </>
                          ) : (
                            <span className="text-xs font-bold text-slate-400 mt-1 block">N/A</span>
                          )}
                        </div>
                        <div className="text-[10px] text-amber-800/80 font-medium mt-0.5">
                          {service.sameDayAvailable !== false ? 'Rush (~8-12h)' : 'Next Day only'}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-200/60">
                      <span className="text-slate-500 font-medium">Minimum Threshold:</span>
                      <span className="font-extrabold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200">
                        {service.minWeightKg} KG
                      </span>
                    </div>
                  </div>

                  {/* Feature Checklist */}
                  <div className="mt-6 space-y-2.5">
                    <div className="text-xs font-bold uppercase text-slate-400 tracking-wider">
                      Included in service:
                    </div>
                    {(service.features || []).map((feat, fIdx) => (
                      <div key={fIdx} className="flex items-start gap-2.5 text-xs text-slate-700">
                        <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                          <Icon name="check" className="w-2.5 h-2.5" />
                        </div>
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Booking Button */}
                <div className="mt-8 pt-4 border-t border-slate-100">
                  <button
                    onClick={() => onSelectServiceForBooking(service.id, service.minWeightKg)}
                    className={`w-full py-3 px-4 rounded-xl font-bold text-sm transition flex items-center justify-center gap-2 shadow-sm ${
                      isPopular
                        ? 'bg-sky-600 hover:bg-sky-500 text-white shadow-sky-600/25'
                        : 'bg-slate-900 hover:bg-slate-800 text-white'
                    }`}
                  >
                    <span>Book {service.name}</span>
                    <Icon name="chevronRight" className="w-4 h-4" />
                  </button>
                  <p className="text-[11px] text-center text-slate-400 mt-2">
                    Min order ฿{Math.round(service.pricePerKg * service.minWeightKg)} THB
                  </p>
                </div>

              </div>
            );
          })}
        </div>

        {/* Bangkok Delivery Note */}
        <div className="mt-12 bg-sky-50/70 rounded-2xl p-4 border border-sky-200/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-sky-900">
          <div className="flex items-center gap-2.5">
            <Icon name="building" className="w-5 h-5 text-sky-600 shrink-0" />
            <span>
              <strong>Bangkok Condo Friendly:</strong> Leave bags with your building juristic office or reception desk. Drivers tag and collect without requiring you to wait at home.
            </span>
          </div>
          <span className="font-semibold text-sky-700 whitespace-nowrap">
            Available across 12+ central Bangkok districts
          </span>
        </div>

      </div>
    </section>
  );
}
