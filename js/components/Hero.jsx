import React, { useState } from 'react';
import { Icon } from './Icons.jsx';
import { CONTACT_CHANNELS, laundryStore } from '../store.js';
import { useTranslation } from '../i18n.jsx';

export function Hero({ services, setView, onSelectServiceForBooking, city = 'Bangkok', onSwitchCity, onOpenContactModal }) {
  const { t, language } = useTranslation();
  const categories = laundryStore.getCategories ? laundryStore.getCategories() : [];
  const [calcCategory, setCalcCategory] = useState('all');

  // Multi-service selection map: { [serviceId]: { weightKg: number, quantity: number } }
  const [selectedServicesMap, setSelectedServicesMap] = useState(() => {
    const initialId = services[0]?.id || 'wash_fold';
    const initSrv = services[0];
    const isPiece = initSrv?.pricingType === 'piece' || initSrv?.unit === 'piece';
    return {
      [initialId]: {
        weightKg: isPiece ? 1.0 : (Number(initSrv?.minWeightKg) || 4.0),
        quantity: 1
      }
    };
  });

  const handleToggleService = (srv) => {
    setSelectedServicesMap(prev => {
      const isSelected = Boolean(prev[srv.id]);
      if (isSelected) {
        if (Object.keys(prev).length <= 1) return prev; // Keep at least one
        const next = { ...prev };
        delete next[srv.id];
        return next;
      } else {
        const isPiece = srv.pricingType === 'piece' || srv.unit === 'piece';
        return {
          ...prev,
          [srv.id]: {
            weightKg: isPiece ? 1.0 : (Number(srv.minWeightKg) || 4.0),
            quantity: 1
          }
        };
      }
    });
  };

  const handleUpdateWeight = (srvId, newWeight) => {
    setSelectedServicesMap(prev => ({
      ...prev,
      [srvId]: {
        ...(prev[srvId] || {}),
        weightKg: Math.max(1, parseFloat(newWeight) || 4.0)
      }
    }));
  };

  const handleUpdateQuantity = (srvId, delta) => {
    setSelectedServicesMap(prev => {
      const current = prev[srvId]?.quantity || 1;
      const nextQty = Math.max(1, current + delta);
      return {
        ...prev,
        [srvId]: {
          ...(prev[srvId] || {}),
          quantity: nextQty
        }
      };
    });
  };

  const handleRemoveService = (srvId) => {
    setSelectedServicesMap(prev => {
      if (Object.keys(prev).length <= 1) return prev;
      const next = { ...prev };
      delete next[srvId];
      return next;
    });
  };

  // Calculated entries for all selected services
  const selectedEntries = Object.keys(selectedServicesMap).map(id => {
    const srv = services.find(s => s.id === id);
    if (!srv) return null;
    const isPiece = srv.pricingType === 'piece' || srv.unit === 'piece';
    const unitLabel = isPiece ? (srv.unit || 'piece') : 'KG';
    const rate = Number(srv.standardPricePerKg || srv.pricePerKg || 65);
    const minWeight = Number(srv.minWeightKg || (isPiece ? 1.0 : 4.0));
    const qty = selectedServicesMap[id]?.quantity || 1;
    const weight = selectedServicesMap[id]?.weightKg || minWeight;
    const billable = isPiece ? qty : Math.max(weight, minWeight);
    const subtotal = Math.round(billable * rate);
    return {
      ...srv,
      isPiece,
      unitLabel,
      rate,
      minWeight,
      qty,
      weight,
      billable,
      subtotal
    };
  }).filter(Boolean);

  const totalEstimatedCost = selectedEntries.reduce((sum, item) => sum + item.subtotal, 0);
  const totalWeightKg = selectedEntries.filter(i => !i.isPiece).reduce((sum, i) => sum + i.billable, 0);
  const totalPieces = selectedEntries.filter(i => i.isPiece).reduce((sum, i) => sum + i.qty, 0);

  // Filtered catalog by category tab
  const filteredServices = calcCategory === 'all'
    ? services
    : services.filter(s => (s.categoryId || (s.pricingType === 'piece' ? 'bedding_linens' : 'laundry_by_weight')) === calcCategory);

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
            <span>
              {city === 'Pattaya' 
                ? t('heroBadgePattaya')
                : t('heroBadgeBangkok')}
            </span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-xs font-semibold text-amber-800">
            <Icon name="phoneOff" className="w-3.5 h-3.5 text-amber-600" />
            <span>{t('heroBadgeOnlineOnly')}</span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800">
            <Icon name="receipt" className="w-3.5 h-3.5 text-emerald-600" />
            <span>{t('heroBadgeCashless')}</span>
          </div>
        </div>

        {/* Main Hero Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15] break-words">
            {t('heroTitlePrefix')} {city === 'Pattaya' ? t('heroTitleCityPattaya') : t('heroTitleCityBangkok')}{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-600 via-sky-500 to-teal-500">
              {t('heroTitleSuffix')}
            </span>
          </h1>

          <p className="mt-5 text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
            {city === 'Pattaya' ? t('heroDescPattaya') : t('heroDescBangkok')}
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <button
              onClick={() => setView('book')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-sky-600 hover:bg-sky-500 text-white font-bold text-base px-8 py-3.5 rounded-xl shadow-lg shadow-sky-600/30 hover:shadow-sky-600/40 transition transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <Icon name="truck" className="w-5 h-5" />
              <span>{t('heroCtaBook')}</span>
            </button>

            <button
              onClick={() => onOpenContactModal && onOpenContactModal()}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-800 font-bold text-base px-6 py-3.5 rounded-xl border border-slate-200 shadow-sm transition"
            >
              <div className="flex -space-x-1">
                <Icon name="whatsapp" className="w-4 h-4 text-emerald-600" />
                <Icon name="line" className="w-4 h-4 text-emerald-500" />
              </div>
              <span>{t('heroCtaSupport')}</span>
            </button>
          </div>

          <div className="mt-4 flex items-center justify-center gap-4 text-xs text-slate-500 flex-wrap">
            <span className="flex items-center gap-1">
              <Icon name="check" className="w-4 h-4 text-emerald-600" /> {t('heroTrustScales')}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Icon name="check" className="w-4 h-4 text-emerald-600" /> {t('heroTrustJuristic')}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Icon name="check" className="w-4 h-4 text-emerald-600" /> {t('heroTrustCashless')}
            </span>
          </div>
        </div>

        {/* Interactive Multi-Service Quick Estimate Card */}
        <div className="w-full max-w-5xl mx-auto bg-white rounded-3xl p-4 sm:p-8 shadow-xl shadow-slate-200/50 border border-slate-100 min-w-0 overflow-hidden">
          <div className="border-b border-slate-100 pb-5 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs uppercase tracking-wider font-bold text-sky-600 flex items-center gap-1.5">
                <Icon name="layers" className="w-3.5 h-3.5" />
                <span>Instant Multi-Service Price Calculator</span>
              </span>
              <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 mt-0.5">
                Estimate Your Laundry &amp; Linens Cost
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Select one or multiple services to bundle your estimate. Quantities and totals adjust in real time.
              </p>
            </div>
            <div className="text-xs text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg inline-flex items-center gap-1.5 self-start sm:self-auto">
              <Icon name="scale" className="w-4 h-4 text-slate-600" />
              <span>Final billing verified on central facility scale</span>
            </div>
          </div>

          {/* Category Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-3 mb-4 scrollbar-none w-full max-w-full min-w-0">
            <button
              type="button"
              onClick={() => setCalcCategory('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ${
                calcCategory === 'all'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Services ({services.length})
            </button>
            {categories.map((cat) => {
              const count = services.filter(s => (s.categoryId || (s.pricingType === 'piece' ? 'bedding_linens' : 'laundry_by_weight')) === cat.id).length;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCalcCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 flex items-center gap-1.5 ${
                    calcCategory === cat.id
                      ? 'bg-sky-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <Icon name={cat.icon || 'layers'} className="w-3 h-3" />
                  <span>{cat.name}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    calcCategory === cat.id ? 'bg-white/20' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start min-w-0">
            
            {/* Step 1: Select Service Tiers (Multi-Select) */}
            <div className="lg:col-span-5 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
                  <span>1. Choose Services</span>
                  <span className="text-[10px] font-bold text-sky-700 bg-sky-100 px-2 py-0.5 rounded-full">
                    {selectedEntries.length} selected
                  </span>
                </label>
                <span className="text-[11px] text-slate-400">Click to add/remove</span>
              </div>

              <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                {filteredServices.map(srv => {
                  const isSelected = Boolean(selectedServicesMap[srv.id]);
                  const isPiece = srv.pricingType === 'piece' || srv.unit === 'piece';
                  const unitLabel = isPiece ? (srv.unit || 'piece') : 'KG';
                  const minLimit = srv.minWeightKg || (isPiece ? 1 : 4.0);

                  return (
                    <div
                      key={srv.id}
                      onClick={() => handleToggleService(srv)}
                      className={`w-full text-left p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        isSelected
                          ? 'border-sky-500 bg-sky-50/70 text-sky-950 ring-1 ring-sky-500 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white hover:bg-slate-50/50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className={`w-5 h-5 rounded-md flex items-center justify-center transition shrink-0 ${
                          isSelected
                            ? 'bg-sky-600 text-white'
                            : 'border-2 border-slate-300 bg-white'
                        }`}>
                          {isSelected && <Icon name="check" className="w-3.5 h-3.5" />}
                        </div>

                        <div className="min-w-0">
                          <div className="font-bold text-xs sm:text-sm truncate flex items-center gap-1.5">
                            <span className="truncate">{srv.name}</span>
                            <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded shrink-0 ${
                              isPiece ? 'bg-amber-100 text-amber-800' : 'bg-sky-100 text-sky-800'
                            }`}>
                              {isPiece ? '🛏️ Piece' : '🧺 Weight'}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            ฿{srv.pricePerKg}/{unitLabel} (Min {minLimit} {unitLabel})
                          </div>
                        </div>
                      </div>

                      {isSelected && (
                        <span className="text-[10px] font-bold text-sky-700 bg-sky-100/80 px-2 py-0.5 rounded-full shrink-0">
                          Active
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Configure Weights & Quantities */}
            <div className="lg:col-span-4 space-y-3 bg-slate-50/80 p-4 rounded-2xl border border-slate-200/70 max-h-[420px] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-slate-200/70 pb-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                  2. Quantities &amp; Weights
                </label>
                <span className="text-[11px] text-slate-500 font-semibold">
                  {selectedEntries.length} {selectedEntries.length === 1 ? 'service' : 'services'}
                </span>
              </div>

              <div className="space-y-3">
                {selectedEntries.map((item) => (
                  <div key={item.id} className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="font-bold text-xs text-slate-800 truncate">
                        {item.name}
                      </div>
                      {selectedEntries.length > 1 && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveService(item.id);
                          }}
                          className="text-slate-400 hover:text-red-600 p-0.5 rounded"
                          title="Remove service"
                        >
                          <Icon name="x" className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {item.isPiece ? (
                      /* Piece Quantity Counter */
                      <div className="flex items-center justify-between pt-1">
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleUpdateQuantity(item.id, -1)}
                            className="w-7 h-7 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-sm"
                          >
                            -
                          </button>
                          <span className="w-12 text-center font-extrabold text-sm text-slate-900 font-mono">
                            {item.qty} {item.unitLabel}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleUpdateQuantity(item.id, 1)}
                            className="w-7 h-7 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-sm"
                          >
                            +
                          </button>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-bold text-sky-700">฿{item.subtotal}</span>
                          <span className="text-[10px] text-slate-400 block">฿{item.rate}/{item.unitLabel}</span>
                        </div>
                      </div>
                    ) : (
                      /* Weight Stepper & Slider */
                      <div className="space-y-1.5 pt-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleUpdateWeight(item.id, Math.max(1, (item.weight - 0.5).toFixed(1)))}
                              className="w-7 h-7 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-sm"
                            >
                              -
                            </button>
                            <span className="w-16 text-center font-extrabold text-xs text-sky-700 bg-sky-50 px-2 py-1 rounded border border-sky-200">
                              {item.weight} KG
                            </span>
                            <button
                              type="button"
                              onClick={() => handleUpdateWeight(item.id, (item.weight + 0.5).toFixed(1))}
                              className="w-7 h-7 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-sm"
                            >
                              +
                            </button>
                          </div>
                          <div className="text-right">
                            <span className="text-xs font-bold text-sky-700">฿{item.subtotal}</span>
                            <span className="text-[10px] text-slate-400 block">฿{item.rate}/KG</span>
                          </div>
                        </div>

                        <input
                          type="range"
                          min="1.0"
                          max="20.0"
                          step="0.5"
                          value={item.weight}
                          onChange={(e) => handleUpdateWeight(item.id, e.target.value)}
                          className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-600"
                        />
                        {Number(item.weight) < Number(item.minWeight) && (
                          <div className="text-[10px] text-amber-700 bg-amber-50 p-1.5 rounded border border-amber-200 flex items-center gap-1">
                            <span>Min {item.minWeight} KG applied (฿{item.subtotal} THB)</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Step 3: Estimated Total & Quick Book */}
            <div className="lg:col-span-3 bg-gradient-to-br from-slate-900 to-slate-800 text-white p-5 rounded-2xl flex flex-col justify-between shadow-lg space-y-4">
              <div>
                <div className="flex items-center justify-between">
                  <div className="text-xs font-medium text-slate-400 uppercase tracking-wide">
                    Estimated Total
                  </div>
                  <span className="text-[10px] bg-sky-500/20 text-sky-300 px-2 py-0.5 rounded-full font-bold border border-sky-400/30">
                    {selectedEntries.length} Items
                  </span>
                </div>

                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-3xl sm:text-4xl font-black text-sky-400 font-mono">
                    ฿{totalEstimatedCost}
                  </span>
                  <span className="text-xs text-slate-300 font-bold">THB</span>
                </div>

                {/* Itemized Mini Summary */}
                <div className="mt-3 pt-3 border-t border-slate-700/80 space-y-1.5 text-xs text-slate-300 max-h-40 overflow-y-auto">
                  {selectedEntries.map((item) => (
                    <div key={item.id} className="flex items-center justify-between text-[11px]">
                      <span className="truncate pr-2 text-slate-300">
                        {item.name} ({item.isPiece ? `${item.qty} ${item.unitLabel}` : `${item.billable} KG`})
                      </span>
                      <span className="font-bold text-white font-mono shrink-0">
                        ฿{item.subtotal}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="text-[11px] text-slate-400 mt-3 pt-2 border-t border-slate-700/50 space-y-0.5">
                  {totalWeightKg > 0 && <div>• Total Laundry Weight: {totalWeightKg.toFixed(1)} KG</div>}
                  {totalPieces > 0 && <div>• Total Specialty Linens: {totalPieces} items</div>}
                  <div>• Standard 48h Turnaround</div>
                </div>
              </div>

              <button
                onClick={() => onSelectServiceForBooking(selectedEntries[0]?.id, selectedEntries[0]?.weight, selectedEntries)}
                className="w-full inline-flex items-center justify-center gap-2 bg-sky-500 hover:bg-sky-400 text-white font-bold text-sm py-3 px-4 rounded-xl transition shadow-md shadow-sky-950/40"
              >
                <span>Book Selected Services</span>
                <Icon name="chevronRight" className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
