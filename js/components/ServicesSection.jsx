import React, { useState, useMemo } from 'react';
import { Icon } from './Icons.jsx';
import { useTranslation } from '../i18n.jsx';
import { INITIAL_CATEGORIES } from '../data/servicesData.js';

export function ServicesSection({
  services = [],
  categories = [],
  onSelectServiceForBooking
}) {
  const { t, language } = useTranslation();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Use provided categories or fallback to defaults
  const activeCategories = useMemo(() => {
    if (Array.isArray(categories) && categories.length > 0) {
      return [...categories].sort((a, b) => (a.displayOrder || 99) - (b.displayOrder || 99));
    }
    return INITIAL_CATEGORIES;
  }, [categories]);

  // Group services by categoryId
  const categoryServicesMap = useMemo(() => {
    const map = new Map();
    activeCategories.forEach(cat => map.set(cat.id, []));

    services.forEach(srv => {
      const isPiece = srv.pricingType === 'piece' || srv.unit === 'piece';
      const catId = srv.categoryId || (isPiece ? 'bedding_linens' : 'laundry_by_weight');
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
    const query = searchQuery.trim().toLowerCase();
    const nameMatch = srv.name && srv.name.toLowerCase().includes(query);
    const nameThMatch = srv.nameTh && srv.nameTh.toLowerCase().includes(query);
    const descMatch = srv.description && srv.description.toLowerCase().includes(query);
    const featMatch = Array.isArray(srv.features) && srv.features.some(f => f.toLowerCase().includes(query));
    return nameMatch || nameThMatch || descMatch || featMatch;
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
          color: 'slate',
          emoji: '🏷️',
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
    let cats = activeCategories;
    if (selectedCategory !== 'all') {
      cats = cats.filter(c => c.id === selectedCategory);
    }
    // Only return categories that have services matching the search
    return cats.map(cat => {
      const allInCat = categoryServicesMap.get(cat.id) || [];
      const filtered = allInCat.filter(matchesSearch);
      return {
        ...cat,
        services: filtered,
        totalInCat: allInCat.length
      };
    });
  }, [activeCategories, selectedCategory, categoryServicesMap, searchQuery]);

  const totalFilteredCount = useMemo(() => {
    return categoriesToRender.reduce((sum, c) => sum + c.services.length, 0);
  }, [categoriesToRender]);

  return (
    <section id="services" className="py-16 sm:py-24 bg-slate-50/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-100 text-sky-800 text-xs font-bold uppercase tracking-wider mb-3 shadow-2xs">
            <Icon name="layers" className="w-3.5 h-3.5" />
            <span>{language === 'th' ? 'แยกตามหมวดหมู่บริการ' : 'Categorized Service Catalog'}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            {t('servicesTitle')}
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed">
            {language === 'th'
              ? 'แยกตามหมวดหมู่อย่างชัดเจน ทั้งซักตามน้ำหนักจริงบนตาชั่งดิจิทัล และบริการซักเครื่องนอน ผ้าม่าน และชุดพิเศษคิดเป็นชิ้น'
              : 'Separated clearly by category: everyday laundry billed by certified digital scale weight, plus per-piece specialized care for comforters, linens, curtains, and delicate garments.'}
          </p>
        </div>

        {/* Search & Category Filter Navigation Bar */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/90 shadow-sm mb-10 space-y-4">
          
          {/* Top row: Live Search Input + Quick info */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:max-w-md">
              <Icon name="search" className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={language === 'th' ? 'ค้นหาบริการ เช่น ซักอบพับ, ผ้านวม, สูท, ม่าน...' : 'Search services (e.g. wash & fold, duvet, suits, curtains)...'}
                className="w-full pl-9 pr-9 py-2.5 rounded-2xl border border-slate-200 text-xs sm:text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 bg-slate-50/50"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                  title="Clear search"
                >
                  <Icon name="x" className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-500 self-end sm:self-center">
              <span className="font-semibold">
                {language === 'th' ? 'พบทั้งหมด:' : 'Showing:'}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 font-mono font-bold border border-slate-200">
                {totalFilteredCount} {language === 'th' ? 'รายการ' : (totalFilteredCount === 1 ? 'Service' : 'Services')}
              </span>
            </div>
          </div>

          {/* Bottom row: Category Pills with Number of Services */}
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Icon name="filter" className="w-3 h-3 text-slate-400" />
              <span>{language === 'th' ? 'เลือกหมวดหมู่บริการ:' : 'Select Category:'}</span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              
              {/* All Services Pill */}
              <button
                type="button"
                onClick={() => setSelectedCategory('all')}
                className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition flex items-center gap-2 border cursor-pointer ${
                  selectedCategory === 'all'
                    ? 'bg-slate-900 text-white border-slate-900 shadow-md shadow-slate-900/20'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Icon name="grid" className={`w-4 h-4 ${selectedCategory === 'all' ? 'text-white' : 'text-slate-500'}`} />
                <span>{language === 'th' ? 'ทุกหมวดหมู่' : 'All Categories'}</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-mono font-black ${
                  selectedCategory === 'all' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-800'
                }`}>
                  {services.length}
                </span>
              </button>

              {/* Individual Category Pills */}
              {activeCategories.map((cat) => {
                const count = (categoryServicesMap.get(cat.id) || []).length;
                const isActive = selectedCategory === cat.id;
                const theme = getCategoryTheme(cat.id);
                const displayName = language === 'th' && cat.nameTh ? cat.nameTh : cat.name;

                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3.5 py-2 rounded-2xl text-xs sm:text-sm font-bold transition flex items-center gap-2 border cursor-pointer ${
                      isActive
                        ? `bg-gradient-to-r ${theme.gradient} text-white border-transparent shadow-md shadow-${theme.color}-500/20`
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                    }`}
                  >
                    <span className="text-base">{theme.emoji}</span>
                    <span className="truncate max-w-[180px] sm:max-w-none">{displayName}</span>
                    
                    {/* Number of Services Badge */}
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-mono font-black ${
                      isActive ? 'bg-white/25 text-white' : `${theme.badgeBg} border`
                    }`}>
                      {count} {language === 'th' ? 'รายการ' : (count === 1 ? 'Service' : 'Services')}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* Categorized Services Groups */}
        {categoriesToRender.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm max-w-lg mx-auto">
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
              className="mt-4 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-sm transition"
            >
              {language === 'th' ? 'ดูบริการทั้งหมด' : 'Show All Services'}
            </button>
          </div>
        ) : (
          <div className="space-y-16">
            {categoriesToRender.map((cat) => {
              if (cat.services.length === 0 && searchQuery) return null;
              const theme = getCategoryTheme(cat.id);
              const displayName = language === 'th' && cat.nameTh ? cat.nameTh : cat.name;
              const isPiece = cat.pricingType === 'piece';

              return (
                <div key={cat.id} className="space-y-6">
                  
                  {/* Category Header Banner with Number of Services */}
                  <div className={`p-5 sm:p-6 rounded-3xl border ${theme.border} ${theme.bgLight} shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4`}>
                    
                    <div className="flex items-start gap-3.5">
                      <div className="w-12 h-12 rounded-2xl bg-white shadow-xs flex items-center justify-center text-2xl shrink-0 border border-slate-200/80">
                        {theme.emoji}
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                            {displayName}
                          </h3>
                          
                          {/* Number of Service Badge in Category Header */}
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-black border ${theme.badgeBg}`}>
                            {cat.services.length} {language === 'th' ? 'รายการบริการ' : (cat.services.length === 1 ? 'Service' : 'Services')}
                          </span>

                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-white text-slate-700 border border-slate-200 shadow-2xs">
                            {isPiece
                              ? (language === 'th' ? '🛏️ คิดราคาเป็นชิ้น' : '🛏️ Billed per Piece / Item')
                              : (language === 'th' ? '🧺 คิดตามน้ำหนัก (กิโลกรัม)' : '🧺 Billed by Weight (KG)')
                            }
                          </span>
                        </div>

                        <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
                          {cat.description}
                        </p>
                      </div>
                    </div>

                    {/* Quick filter shortcut if in 'all' mode */}
                    {selectedCategory === 'all' && (
                      <button
                        type="button"
                        onClick={() => setSelectedCategory(cat.id)}
                        className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200 shadow-2xs transition flex items-center gap-1.5 self-start md:self-center shrink-0 cursor-pointer"
                        title="Filter exclusively to this category"
                      >
                        <span>{language === 'th' ? 'ดูเฉพาะหมวดนี้' : 'View Only This Category'}</span>
                        <Icon name="chevronRight" className="w-3.5 h-3.5 text-slate-400" />
                      </button>
                    )}
                  </div>

                  {/* Services Grid for This Category */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
                    {cat.services.map((service) => {
                      const isPopular = Boolean(service.popular);
                      const unitLabel = service.unit || (service.pricingType === 'piece' ? 'piece' : 'KG');
                      const unitDisplay = isPiece ? (language === 'th' ? 'ชิ้น' : 'piece') : (language === 'th' ? 'กก.' : 'KG');
                      const stdPrice = service.standardPricePerKg || service.pricePerKg || 65;
                      const nextPrice = service.nextDayPricePerKg || Math.round(stdPrice * 1.3);
                      const samePrice = service.sameDayPricePerKg || Math.round(stdPrice * 1.75);
                      const minWeight = Number(service.minWeightKg) || (isPiece ? 1.0 : 4.0);

                      return (
                        <div
                          key={service.id}
                          className={`relative rounded-3xl p-6 sm:p-7 flex flex-col justify-between transition-all duration-200 bg-white border ${
                            isPopular
                              ? 'border-2 border-sky-500 shadow-xl shadow-sky-500/10 hover:shadow-2xl hover:border-sky-600'
                              : 'border-slate-200/90 shadow-sm hover:border-slate-300 hover:shadow-md'
                          }`}
                        >
                          {/* Popular Choice Ribbon */}
                          {isPopular && (
                            <div className="absolute -top-3.5 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-sky-600 to-teal-500 text-white text-[11px] font-black px-4 py-1 rounded-full shadow-md uppercase tracking-wide">
                              ⭐ {language === 'th' ? 'บริการยอดนิยม' : 'Most Popular Choice'}
                            </div>
                          )}

                          <div>
                            {/* Service Title & Icon Header */}
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <h4 className="text-lg sm:text-xl font-extrabold text-slate-900 leading-snug">
                                  {service.name}
                                </h4>
                                {service.nameTh && (
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
                            <p className="mt-3 text-xs text-slate-600 leading-relaxed min-h-[42px]">
                              {service.description}
                            </p>

                            {/* 3-Tier Turnaround Pricing Badges */}
                            <div className="mt-5 p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
                              
                              <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                                
                                {/* Tier 1: Standard 48h */}
                                <div className="p-2 sm:p-2.5 rounded-xl bg-white border border-slate-200 shadow-2xs text-center">
                                  <div className="text-[9px] uppercase font-bold text-slate-500 flex items-center justify-center gap-0.5">
                                    <span>🕒 48h</span>
                                  </div>
                                  <div className="flex items-baseline justify-center gap-0.5 mt-0.5">
                                    <span className="text-base sm:text-lg font-black text-slate-900">
                                      ฿{stdPrice}
                                    </span>
                                  </div>
                                  <div className="text-[9px] text-slate-400 font-semibold uppercase">
                                    /{unitDisplay}
                                  </div>
                                  <div className="text-[9px] text-slate-500 font-medium mt-0.5 hidden sm:block">
                                    {language === 'th' ? 'มาตรฐาน' : 'Standard'}
                                  </div>
                                </div>

                                {/* Tier 2: Next Day 24h */}
                                <div className="p-2 sm:p-2.5 rounded-xl bg-sky-50/70 border border-sky-200 shadow-2xs text-center">
                                  <div className="text-[9px] uppercase font-bold text-sky-700 flex items-center justify-center gap-0.5">
                                    <span>⚡ 24h</span>
                                  </div>
                                  <div className="flex items-baseline justify-center gap-0.5 mt-0.5">
                                    <span className="text-base sm:text-lg font-black text-sky-950">
                                      ฿{nextPrice}
                                    </span>
                                  </div>
                                  <div className="text-[9px] text-sky-700/70 font-semibold uppercase">
                                    /{unitDisplay}
                                  </div>
                                  <div className="text-[9px] text-sky-700 font-medium mt-0.5 hidden sm:block">
                                    {language === 'th' ? 'ด่วน 1 วัน' : 'Next Day'}
                                  </div>
                                </div>

                                {/* Tier 3: Same Day */}
                                <div className="p-2 sm:p-2.5 rounded-xl bg-amber-50/70 border border-amber-200 shadow-2xs text-center">
                                  <div className="text-[9px] uppercase font-bold text-amber-800 flex items-center justify-center gap-0.5">
                                    <span>🚀 Express</span>
                                  </div>
                                  <div className="flex items-baseline justify-center gap-0.5 mt-0.5">
                                    {service.sameDayAvailable !== false ? (
                                      <span className="text-base sm:text-lg font-black text-amber-950">
                                        ฿{samePrice}
                                      </span>
                                    ) : (
                                      <span className="text-xs font-bold text-slate-400 mt-1 block">N/A</span>
                                    )}
                                  </div>
                                  <div className="text-[9px] text-amber-800/70 font-semibold uppercase">
                                    {service.sameDayAvailable !== false ? `/${unitDisplay}` : '-'}
                                  </div>
                                  <div className="text-[9px] text-amber-800/80 font-medium mt-0.5 hidden sm:block">
                                    {service.sameDayAvailable !== false ? (language === 'th' ? 'วันเดียว' : '<18h Today') : 'N/A'}
                                  </div>
                                </div>

                              </div>

                              {/* Minimum Threshold Row */}
                              <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-200/70">
                                <span className="text-slate-500 font-medium">
                                  {language === 'th' ? 'เกณฑ์ขั้นต่ำ:' : 'Minimum Order:'}
                                </span>
                                <span className="font-extrabold text-slate-800 bg-white px-2 py-0.5 rounded-md border border-slate-200 text-[11px]">
                                  {isPiece
                                    ? `${minWeight} ${language === 'th' ? 'ชิ้นขึ้นไป' : 'Piece min.'}`
                                    : `${minWeight} KG (${language === 'th' ? 'แยกถังซักเฉพาะคุณ' : 'Dedicated Drum'})`
                                  }
                                </span>
                              </div>

                            </div>

                            {/* Feature Checklist */}
                            <div className="mt-5 space-y-2">
                              <div className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">
                                {language === 'th' ? 'สิ่งที่รวมในบริการ:' : 'Included in Service:'}
                              </div>
                              {(service.features || []).map((feat, fIdx) => (
                                <div key={fIdx} className="flex items-start gap-2 text-xs text-slate-700">
                                  <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                                    <Icon name="check" className="w-2.5 h-2.5" />
                                  </div>
                                  <span className="leading-tight">{feat}</span>
                                </div>
                              ))}
                            </div>

                          </div>

                          {/* Booking Action Button */}
                          <div className="mt-7 pt-4 border-t border-slate-100">
                            <button
                              type="button"
                              onClick={() => onSelectServiceForBooking(service.id, minWeight)}
                              className={`w-full py-3 px-4 rounded-xl font-bold text-xs sm:text-sm transition flex items-center justify-center gap-2 shadow-sm cursor-pointer ${
                                isPopular
                                  ? 'bg-sky-600 hover:bg-sky-500 text-white shadow-sky-600/25'
                                  : 'bg-slate-900 hover:bg-slate-800 text-white'
                              }`}
                            >
                              <span>{language === 'th' ? `จอง ${service.name}` : `Book ${service.name}`}</span>
                              <Icon name="chevronRight" className="w-4 h-4" />
                            </button>
                            <p className="text-[11px] text-center text-slate-400 mt-2 font-mono">
                              {language === 'th'
                                ? `เริ่มต้นประมาณ ฿${Math.round(stdPrice * minWeight)} THB`
                                : `Min. order ~฿${Math.round(stdPrice * minWeight)} THB`}
                            </p>
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
        <div className="mt-14 bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-700">
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
