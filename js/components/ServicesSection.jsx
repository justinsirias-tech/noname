import React, { useState, useMemo } from 'react';
import { Icon } from './Icons.jsx';
import { useTranslation } from '../i18n.jsx';
import { INITIAL_CATEGORIES } from '../data/servicesData.js';
import { laundryStore } from '../store.js';

export function ServicesSection({
  services = [],
  categories = [],
  onSelectServiceForBooking
}) {
  const { t, language } = useTranslation();

  // Use provided categories or fallback to defaults
  const activeCategories = useMemo(() => {
    if (Array.isArray(categories) && categories.length > 0) {
      return [...categories].sort((a, b) => (a.displayOrder || 99) - (b.displayOrder || 99));
    }
    const storeCats = laundryStore.getCategories ? laundryStore.getCategories() : [];
    if (Array.isArray(storeCats) && storeCats.length > 0) {
      return [...storeCats].sort((a, b) => (a.displayOrder || 99) - (b.displayOrder || 99));
    }
    return INITIAL_CATEGORIES;
  }, [categories]);

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Group services by categoryId
  const categoryServicesMap = useMemo(() => {
    const map = new Map();
    activeCategories.forEach(cat => map.set(cat.id, []));

    services.forEach(srv => {
      let catId = srv.categoryId;
      // Exclude services whose category was deleted or is not active
      if (!catId || !activeCategories.some(c => c.id === catId)) {
        return;
      }
      // Guarantee piece-based items never appear under laundry by weight
      if (catId === 'laundry_by_weight' && (srv.pricingType === 'piece' || srv.unit === 'piece')) {
        return;
      }
      if (!map.has(catId)) {
        map.set(catId, []);
      }
      map.get(catId).push(srv);
    });

    return map;
  }, [activeCategories, services]);

  // Filter services by search query
  const matchesSearch = (srv) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    const nameMatch = srv.name && srv.name.toLowerCase().includes(q);
    const nameThMatch = srv.nameTh && srv.nameTh.toLowerCase().includes(q);
    const descMatch = srv.description && srv.description.toLowerCase().includes(q);
    const descThMatch = srv.descriptionTh && srv.descriptionTh.toLowerCase().includes(q);
    const featureMatch = Array.isArray(srv.features) && srv.features.some(f => f.toLowerCase().includes(q));
    const featureThMatch = Array.isArray(srv.featuresTh) && srv.featuresTh.some(f => f.toLowerCase().includes(q));
    return nameMatch || nameThMatch || descMatch || descThMatch || featureMatch || featureThMatch;
  };

  // Category Theme Helper
  const getCategoryTheme = (catId) => {
    switch (catId) {
      case 'laundry_by_weight':
        return {
          color: 'sky',
          emoji: '🧺',
          border: 'border-sky-300',
          bgLight: 'bg-sky-50/80',
          accent: 'text-sky-700',
          badgeBg: 'bg-sky-100 text-sky-800 border-sky-200',
          gradient: 'from-sky-600 to-cyan-500'
        };
      case 'bedding_linens':
        return {
          color: 'indigo',
          emoji: '🛏️',
          border: 'border-indigo-300',
          bgLight: 'bg-indigo-50/80',
          accent: 'text-indigo-700',
          badgeBg: 'bg-indigo-100 text-indigo-800 border-indigo-200',
          gradient: 'from-indigo-600 to-blue-500'
        };
      case 'household_curtains':
        return {
          color: 'emerald',
          emoji: '🛋️',
          border: 'border-emerald-300',
          bgLight: 'bg-emerald-50/80',
          accent: 'text-emerald-700',
          badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-200',
          gradient: 'from-emerald-600 to-teal-500'
        };
      case 'delicate_dryclean':
        return {
          color: 'purple',
          emoji: '✨',
          border: 'border-purple-300',
          bgLight: 'bg-purple-50/80',
          accent: 'text-purple-700',
          badgeBg: 'bg-purple-100 text-purple-800 border-purple-200',
          gradient: 'from-purple-600 to-pink-500'
        };
      default:
        return {
          color: 'sky',
          emoji: '🧺',
          border: 'border-slate-300',
          bgLight: 'bg-slate-50',
          accent: 'text-slate-700',
          badgeBg: 'bg-slate-100 text-slate-800 border-slate-200',
          gradient: 'from-slate-700 to-slate-900'
        };
    }
  };

  // Filtered categories to display
  const categoriesToRender = useMemo(() => {
    return activeCategories
      .filter(cat => selectedCategory === 'all' || cat.id === selectedCategory)
      .map(cat => {
        const allInCat = categoryServicesMap.get(cat.id) || [];
        const filtered = allInCat.filter(matchesSearch);
        return {
          ...cat,
          services: filtered,
          totalInCat: allInCat.length
        };
      })
      .filter(cat => cat.services.length > 0);
  }, [activeCategories, categoryServicesMap, searchQuery, selectedCategory]);

  const totalFilteredCount = useMemo(() => {
    return categoriesToRender.reduce((sum, c) => sum + c.services.length, 0);
  }, [categoriesToRender]);

  const handleBookService = (service) => {
    const isPiece = service.pricingType === 'piece' || service.unit === 'piece';
    const minWeight = Number(service.minWeightKg) || (isPiece ? 1.0 : 4.0);
    if (onSelectServiceForBooking) {
      onSelectServiceForBooking(service.id, minWeight, null, 'standard_48h');
    } else {
      window.location.hash = '#book';
    }
  };

  return (
    <section id="services" className="py-8 sm:py-16 pb-16 bg-slate-50/60 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-sky-100 text-sky-800 text-xs font-bold uppercase tracking-wider mb-3 shadow-2xs">
            <Icon name="layers" className="w-3.5 h-3.5" />
            <span>
              {language === 'th'
                ? 'บริการและราคามาตรฐาน'
                : 'Services & Transparent Pricing'}
            </span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
            {t('servicesTitle')}
          </h2>
          <p className="mt-2 text-xs sm:text-base text-slate-600 leading-relaxed">
            {language === 'th'
              ? 'อัตราค่าบริการซักอบรีดมาตรฐาน ชั่งน้ำหนักจริงด้วยเครื่องชั่งดิจิทัล ตรวจสอบได้ทุกขั้นตอน'
              : 'Transparent per-KG and per-piece rates. Certified digital scale weigh-in with photo proof.'}
          </p>
        </div>

        {/* Elevated Category Filter & Live Search Card */}
        <div className="bg-white rounded-3xl p-4 sm:p-6 border border-slate-200/90 shadow-sm space-y-4">
          
          {/* Top Row: Search Input + Live Match Counter + Reset Option */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div className="relative flex-1 max-w-xl">
              <Icon name="search" className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={language === 'th' ? 'ค้นหาบริการ เช่น ซักอบพับ, ผ้านวม, สูท, ม่าน...' : 'Quick search services (e.g. wash & fold, duvet, suits)...'}
                className="w-full pl-9 pr-9 py-2.5 rounded-2xl border border-slate-200 text-xs sm:text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 bg-slate-50/70 transition"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-200 transition"
                  title="Clear search"
                >
                  <Icon name="x" className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center justify-between md:justify-end gap-2 text-xs">
              {(selectedCategory !== 'all' || searchQuery) && (
                <button
                  type="button"
                  onClick={() => { setSelectedCategory('all'); setSearchQuery(''); }}
                  className="text-xs font-bold text-sky-600 hover:text-sky-800 px-2.5 py-1 rounded-lg hover:bg-sky-50 transition cursor-pointer"
                >
                  {language === 'th' ? '↺ แสดงทั้งหมด' : '↺ Show All'}
                </button>
              )}

              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold tabular-nums">
                <span className="text-[11px] text-slate-500">{language === 'th' ? 'บริการที่แสดง:' : 'Available:'}</span>
                <span className="text-slate-900 font-extrabold">{totalFilteredCount}</span>
              </div>
            </div>
          </div>

          {/* Category Filter Pills (Responsive Wrapping Grid, Zero Awkward Scrollbars) */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <span>🏷️</span>
                <span>{language === 'th' ? 'เลือกหมวดหมู่บริการ' : 'Select Service Category'}</span>
              </span>
              <span className="text-[10px] text-slate-400 font-medium">
                {language === 'th' ? 'แตะหมวดหมู่เพื่อดูบริการ' : 'Tap to filter category'}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
              {/* All Categories Option */}
              <button
                type="button"
                onClick={() => setSelectedCategory('all')}
                className={`px-3.5 py-2 rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer border ${
                  selectedCategory === 'all'
                    ? 'bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-slate-900/10'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50 shadow-2xs'
                }`}
              >
                <span className="text-base">🧺</span>
                <span>{language === 'th' ? 'ทุกบริการ' : 'All Categories'}</span>
                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full tabular-nums ${
                  selectedCategory === 'all'
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-100 text-slate-700 border border-slate-200'
                }`}>
                  {services.length}
                </span>
              </button>

              {/* Active Categories */}
              {activeCategories.map(cat => {
                const theme = getCategoryTheme(cat.id);
                const isCatActive = selectedCategory === cat.id;
                const catServicesCount = categoryServicesMap.get(cat.id)?.length || 0;
                
                let shortLabel = (language === 'th' && cat.nameTh) ? cat.nameTh : cat.name;
                if (language === 'th') {
                  if (cat.id === 'laundry_by_weight') shortLabel = 'ซักตามน้ำหนัก (กก.)';
                  else if (cat.id === 'bedding_linens') shortLabel = 'เครื่องนอน & ผ้านวม';
                  else if (cat.id === 'household_curtains') shortLabel = 'ผ้าม่าน & ของใช้';
                  else if (cat.id === 'delicate_dryclean') shortLabel = 'ผ้าไหม & ชุดพิเศษ';
                } else {
                  if (cat.id === 'laundry_by_weight') shortLabel = 'Laundry by Weight (KG)';
                  else if (cat.id === 'bedding_linens') shortLabel = 'Bedding & Comforters';
                  else if (cat.id === 'household_curtains') shortLabel = 'Curtains & Household';
                  else if (cat.id === 'delicate_dryclean') shortLabel = 'Delicates & Special Care';
                }

                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3.5 py-2 rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer border ${
                      isCatActive
                        ? 'bg-sky-600 text-white border-sky-600 shadow-md shadow-sky-600/25 ring-2 ring-sky-500/20'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50 shadow-2xs'
                    }`}
                  >
                    <span className="text-base">{theme.emoji}</span>
                    <span>{shortLabel}</span>
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full tabular-nums ${
                      isCatActive
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-100 text-slate-700 border border-slate-200'
                    }`}>
                      {catServicesCount}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* Categorized Services Groups (Full-Width Responsive 3-Column Grid) */}
        {categoriesToRender.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 sm:p-12 text-center border border-slate-200 shadow-sm max-w-lg mx-auto">
            <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto text-2xl mb-4">
              🔍
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              {language === 'th' ? 'ไม่พบรายการบริการที่ค้นหา' : 'No services found'}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {language === 'th'
                ? `ไม่พบบริการที่ตรงกับคำค้นหา "${searchQuery}"`
                : `No services match your search query "${searchQuery}"`}
            </p>
            <button
              type="button"
              onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
              className="mt-4 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-sm transition cursor-pointer"
            >
              {language === 'th' ? 'ล้างการค้นหา' : 'Clear Search'}
            </button>
          </div>
        ) : (
          <div className="space-y-10 sm:space-y-12">
            {categoriesToRender.map((cat) => {
              if (cat.services.length === 0 && searchQuery) return null;
              const theme = getCategoryTheme(cat.id);
              const displayName = language === 'th' && cat.nameTh ? cat.nameTh : cat.name;
              const isPiece = cat.pricingType === 'piece';

              return (
                <div key={cat.id} className="space-y-5">
                  
                  {/* Category Header Banner with Number of Services */}
                  <div className={`p-4 sm:p-6 rounded-3xl border ${theme.border} ${theme.bgLight} shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4`}>
                    <div className="flex items-start gap-3 sm:gap-3.5">
                      <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-white shadow-xs flex items-center justify-center text-2xl shrink-0 border border-slate-200/80">
                        {theme.emoji}
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight">
                            {displayName}
                          </h3>
                          
                          {/* Number of Service Badge in Category Header */}
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-black border tabular-nums ${theme.badgeBg}`}>
                            {cat.services.length} {language === 'th' ? 'รายการบริการ' : (cat.services.length === 1 ? 'Service' : 'Services')}
                          </span>

                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-white text-slate-700 border border-slate-200 shadow-2xs">
                            {isPiece
                              ? (language === 'th' ? '🛏️ คิดราคาเป็นชิ้น' : '🛏️ Billed per Piece / Item')
                              : (language === 'th' ? '🧺 คิดตามน้ำหนัก (กิโลกรัม)' : '🧺 Billed by Weight (KG)')
                            }
                          </span>
                        </div>

                        <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-3xl leading-relaxed">
                          {(language === 'th' && cat.descriptionTh) ? cat.descriptionTh : cat.description}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Services Grid for This Category (Spacious 3-Column Grid) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {cat.services.map((service) => {
                      const isPopular = Boolean(service.popular);
                      const serviceIsPiece = service.pricingType === 'piece' || service.unit === 'piece';
                      const unitDisplay = serviceIsPiece ? (language === 'th' ? 'ชิ้น' : 'piece') : (language === 'th' ? 'กก.' : 'KG');
                      const stdPrice = service.standardPricePerKg || service.pricePerKg || (service.id === 'wash_fold' ? 70 : 70);
                      const nextPrice = service.nextDayPricePerKg || Math.round(stdPrice * 1.3);
                      const samePrice = service.sameDayPricePerKg || Math.round(stdPrice * 1.75);
                      const minWeight = Number(service.minWeightKg) || (serviceIsPiece ? 1.0 : 4.0);
                      const srvName = (language === 'th' && service.nameTh) ? service.nameTh : service.name;
                      const srvDesc = (language === 'th' && service.descriptionTh) ? service.descriptionTh : service.description;

                      return (
                        <div
                          key={service.id}
                          className={`relative rounded-3xl p-5 sm:p-6 flex flex-col justify-between transition-all duration-200 bg-white border ${
                            isPopular
                              ? 'border-2 border-sky-400 shadow-md hover:shadow-xl hover:border-sky-500'
                              : 'border-slate-200/90 shadow-sm hover:border-slate-300 hover:shadow-md'
                          }`}
                        >
                          {/* Popular Choice Ribbon */}
                          {isPopular && (
                            <div className="absolute -top-3.5 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-sky-600 to-teal-500 text-white text-[11px] font-black px-4 py-1 rounded-full shadow-md uppercase tracking-wide whitespace-nowrap">
                              ⭐ {language === 'th' ? 'บริการยอดนิยม' : 'Most Popular Choice'}
                            </div>
                          )}

                          <div>
                            {/* Service Title & Icon Header */}
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <h4 className="text-base sm:text-lg font-extrabold text-slate-900 leading-snug">
                                  {srvName}
                                </h4>
                                {service.nameTh && language !== 'th' && (
                                  <div className="text-xs text-sky-600 font-bold mt-0.5">
                                    {service.nameTh}
                                  </div>
                                )}
                              </div>
                              <span className="w-10 h-10 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-lg shrink-0 border border-slate-200/60 shadow-2xs">
                                {theme.emoji}
                              </span>
                            </div>

                            {/* Service Description */}
                            <p className="mt-2.5 text-xs text-slate-600 leading-relaxed min-h-[36px]">
                              {srvDesc}
                            </p>

                            {/* 3-Tier Turnaround Pricing Badges (Standard 2 Days, Next Day, Same Day) */}
                            <div className="mt-4 p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-2.5">
                              <div className="grid grid-cols-3 gap-2">
                                
                                {/* Tier 1: Standard (2 Days) */}
                                <div className="p-2 rounded-xl bg-white border border-slate-200 shadow-2xs text-center">
                                  <div className="text-[9px] uppercase font-bold text-slate-500">
                                    {language === 'th' ? 'มาตรฐาน (2 วัน)' : '2 Days'}
                                  </div>
                                  <div className="mt-0.5 tabular-nums">
                                    <span className="text-base font-black text-slate-900">
                                      ฿{stdPrice}
                                    </span>
                                    <span className="text-[9px] text-slate-500 block font-semibold uppercase">
                                      /{unitDisplay}
                                    </span>
                                  </div>
                                </div>

                                {/* Tier 2: Next Day */}
                                <div className="p-2 rounded-xl bg-sky-50/70 border border-sky-200 shadow-2xs text-center">
                                  <div className="text-[9px] uppercase font-bold text-sky-700">
                                    ⚡ {language === 'th' ? 'วันถัดไป' : 'Next Day'}
                                  </div>
                                  <div className="mt-0.5 tabular-nums">
                                    <span className="text-base font-black text-sky-950">
                                      ฿{nextPrice}
                                    </span>
                                    <span className="text-[9px] text-sky-700/70 block font-semibold uppercase">
                                      /{unitDisplay}
                                    </span>
                                  </div>
                                </div>

                                {/* Tier 3: Same Day */}
                                <div className="p-2 rounded-xl bg-amber-50/80 border border-amber-200 shadow-2xs text-center">
                                  <div className="text-[9px] uppercase font-bold text-amber-800">
                                    🚀 {language === 'th' ? 'วันเดียว' : 'Same Day'}
                                  </div>
                                  <div className="mt-0.5 tabular-nums">
                                    {service.sameDayAvailable !== false ? (
                                      <>
                                        <span className="text-base font-black text-amber-950">
                                          ฿{samePrice}
                                        </span>
                                        <span className="text-[9px] text-amber-800/70 block font-semibold uppercase">
                                          /{unitDisplay}
                                        </span>
                                      </>
                                    ) : (
                                      <span className="text-[10px] font-bold text-slate-400 block py-1">
                                        N/A
                                      </span>
                                    )}
                                  </div>
                                </div>

                              </div>

                              {/* Minimum Threshold Row */}
                              <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-200/70">
                                <span className="text-slate-500 font-medium">
                                  {language === 'th' ? 'เกณฑ์ขั้นต่ำ:' : 'Minimum Order:'}
                                </span>
                                <span className="font-extrabold text-slate-800 bg-white px-2 py-0.5 rounded-md border border-slate-200 text-[11px]">
                                  {serviceIsPiece
                                    ? `${minWeight} ${language === 'th' ? 'ชิ้นขึ้นไป' : 'Piece min.'}`
                                    : `${minWeight} KG (${language === 'th' ? 'แยกถังซัก' : 'Dedicated Drum'})`
                                  }
                                </span>
                              </div>
                            </div>

                            {/* Feature Checklist */}
                            <div className="mt-4 space-y-1.5">
                              <div className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                                {language === 'th' ? 'สิ่งที่รวมในบริการ:' : 'Included in Service:'}
                              </div>
                              {(service.features || []).map((feat, fIdx) => {
                                const featDisplay = (language === 'th' && service.featuresTh && service.featuresTh[fIdx])
                                  ? service.featuresTh[fIdx]
                                  : feat;
                                return (
                                  <div key={fIdx} className="flex items-start gap-2 text-xs text-slate-700">
                                    <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                                      <Icon name="check" className="w-2.5 h-2.5" />
                                    </div>
                                    <span className="leading-tight">{featDisplay}</span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          {/* Direct Booking CTA Button */}
                          <div className="mt-5 pt-4 border-t border-slate-100">
                            <button
                              type="button"
                              onClick={() => handleBookService(service)}
                              className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-sky-600 to-teal-600 hover:from-sky-500 hover:to-teal-500 text-white font-bold text-xs sm:text-sm shadow-md shadow-sky-600/20 transition flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
                            >
                              <Icon name="truck" className="w-4 h-4" />
                              <span>{language === 'th' ? 'จองบริการนี้' : 'Book This Service'}</span>
                              <Icon name="chevronRight" className="w-3.5 h-3.5" />
                            </button>
                          </div>

                        </div>
                      );
                    })}
                  </div>

                </div>
              );
            })}
          </div>
        )}

        {/* Bangkok & Pattaya Delivery Note Footer */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center text-xl shrink-0">
              🏢
            </div>
            <div>
              <strong className="text-slate-900 block font-bold text-sm">
                {language === 'th' ? 'สะดวกสำหรับชาวคอนโดและที่พักอาศัย' : 'Condominium & Residence Friendly'}
              </strong>
              <p className="text-slate-500 mt-0.5">
                {language === 'th'
                  ? 'สามารถฝากถุงผ้าไว้กับนิติบุคคลหรือเคาน์เตอร์ต้อนรับ คนขับรถของเราจะติดแท็กบาร์โค้ดและส่งรูปยืนยันให้ท่านทันทีผ่าน LINE OA / WhatsApp'
                  : 'Leave bags with your building juristic office or reception desk. Couriers tag and verify weight with digital scale receipts sent via WhatsApp & LINE.'}
              </p>
            </div>
          </div>
          <span className="font-bold text-sky-700 whitespace-nowrap bg-sky-50 px-3 py-1.5 rounded-xl border border-sky-200">
            {language === 'th' ? 'ให้บริการครอบคลุมทั่วกรุงเทพฯ และพัทยา' : 'Bangkok (All 50 Districts) & Pattaya'}
          </span>
        </div>

      </div>
    </section>
  );
}
