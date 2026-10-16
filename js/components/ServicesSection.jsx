import React, { useState, useMemo, useEffect } from 'react';
import { Icon } from './Icons.jsx';
import { useTranslation } from '../i18n.jsx';
import { INITIAL_CATEGORIES, BANGKOK_DISTRICTS, TIME_SLOTS } from '../data/servicesData.js';
import { laundryStore } from '../store.js';

export function ServicesSection({
  services = [],
  categories = [],
  onSelectServiceForBooking,
  onBookingSuccess
}) {
  const { t, language } = useTranslation();

  // Use provided categories or fallback to defaults
  const activeCategories = useMemo(() => {
    if (Array.isArray(categories) && categories.length > 0) {
      return [...categories].sort((a, b) => (a.displayOrder || 99) - (b.displayOrder || 99));
    }
    return INITIAL_CATEGORIES;
  }, [categories]);

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileCalcOpen, setIsMobileCalcOpen] = useState(false);

  // Selected services start EMPTY! Customer adds the services they need.
  // { [serviceId]: { weightKg: number, quantity: number } }
  const [selectedServicesMap, setSelectedServicesMap] = useState({});

  // Turnaround Speed: 'standard_48h' (Standard 2 Days), 'next_day_24h' (Next Day), 'same_day' (Same Day)
  const [turnaroundSpeed, setTurnaroundSpeed] = useState('standard_48h');

  // Inline Quick Booking Form State (so the right-side panel is a booking section right away)
  const tomorrow = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  }, []);

  const [customerName, setCustomerName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [email, setEmail] = useState('');
  const [contactChannel, setContactChannel] = useState('whatsapp');
  const [condoName, setCondoName] = useState('');
  const [roomNumber, setRoomNumber] = useState('');
  const [district, setDistrict] = useState(BANGKOK_DISTRICTS[0] || 'Watthana');
  const [pickupDate, setPickupDate] = useState(tomorrow);
  const [pickupTime, setPickupTime] = useState(TIME_SLOTS[0] || '10:30 - 12:30 (Morning)');
  const [leaveWithJuristic, setLeaveWithJuristic] = useState(true);
  const [bookingError, setBookingError] = useState('');
  const [quickBookedOrder, setQuickBookedOrder] = useState(null);
  const [isPickupDetailsOpen, setIsPickupDetailsOpen] = useState(false);
  const [stickyTop, setStickyTop] = useState(140);

  useEffect(() => {
    const updateStickyOffsets = () => {
      const header = document.querySelector('header');
      if (header) {
        const headerRect = header.getBoundingClientRect();
        const h = Math.round(headerRect.height || header.offsetHeight || 132);
        setStickyTop(h + 10);
      } else {
        setStickyTop(140);
      }
    };

    updateStickyOffsets();
    window.addEventListener('resize', updateStickyOffsets);
    const timer = setTimeout(updateStickyOffsets, 400);

    return () => {
      window.removeEventListener('resize', updateStickyOffsets);
      clearTimeout(timer);
    };
  }, []);

  const handleToggleService = (srv) => {
    if (!srv || !srv.id) return;
    setSelectedServicesMap(prev => {
      const isSelected = Boolean(prev[srv.id]);
      if (isSelected) {
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
    setBookingError('');
  };

  const handleAddServiceById = (srvId) => {
    if (!srvId) return;
    const srv = services.find(s => s.id === srvId);
    if (!srv) return;
    const isPiece = srv.pricingType === 'piece' || srv.unit === 'piece';
    setSelectedServicesMap(prev => ({
      ...prev,
      [srv.id]: prev[srv.id] || {
        weightKg: isPiece ? 1.0 : (Number(srv.minWeightKg) || 4.0),
        quantity: 1
      }
    }));
    setBookingError('');
  };

  const handleUpdateWeight = (srvId, newWeight) => {
    setSelectedServicesMap(prev => ({
      ...prev,
      [srvId]: {
        ...(prev[srvId] || { quantity: 1 }),
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
          ...(prev[srvId] || { weightKg: 1.0 }),
          quantity: nextQty
        }
      };
    });
  };

  const handleRemoveService = (srvId) => {
    setSelectedServicesMap(prev => {
      const next = { ...prev };
      delete next[srvId];
      return next;
    });
  };

  const handleClearAllServices = () => {
    setSelectedServicesMap({});
  };

  // Calculated entries for all selected services using active turnaroundSpeed
  const selectedEntries = useMemo(() => {
    return Object.keys(selectedServicesMap).map(id => {
      const srv = services.find(s => s.id === id);
      if (!srv) return null;
      const isPiece = srv.pricingType === 'piece' || srv.unit === 'piece';
      const unitLabel = isPiece ? (srv.unit || 'piece') : 'KG';
      const stdRate = Number(srv.standardPricePerKg || srv.pricePerKg || 70);
      const nextRate = Number(srv.nextDayPricePerKg || Math.round(stdRate * 1.3));
      const sameRate = Number(srv.sameDayPricePerKg || Math.round(stdRate * 1.75));

      let rate = stdRate;
      if (turnaroundSpeed === 'next_day_24h') rate = nextRate;
      else if (turnaroundSpeed === 'same_day') rate = sameRate;

      const minWeight = Number(srv.minWeightKg || (isPiece ? 1.0 : 4.0));
      const qty = selectedServicesMap[id]?.quantity || 1;
      const weight = selectedServicesMap[id]?.weightKg || minWeight;
      const billable = isPiece ? qty : Math.max(weight, minWeight);
      const subtotal = Math.round(billable * rate);
      return {
        ...srv,
        isPiece,
        unitLabel,
        stdRate,
        nextRate,
        sameRate,
        rate,
        minWeight,
        qty,
        weight,
        billable,
        subtotal
      };
    }).filter(Boolean);
  }, [selectedServicesMap, services, turnaroundSpeed]);

  const servicesSubtotal = useMemo(
    () => selectedEntries.reduce((sum, item) => sum + item.subtotal, 0),
    [selectedEntries]
  );

  const isFreeDelivery = true;
  const deliveryFee = 0;
  const totalEstimatedCost = servicesSubtotal;

  const totalWeightKg = useMemo(
    () => selectedEntries.filter(i => !i.isPiece).reduce((sum, i) => sum + i.billable, 0),
    [selectedEntries]
  );
  const totalPieces = useMemo(
    () => selectedEntries.filter(i => i.isPiece).reduce((sum, i) => sum + i.qty, 0),
    [selectedEntries]
  );

  // Quick instant booking submission from the right-side Booking Section
  const handleQuickBookSubmit = (e) => {
    if (e) e.preventDefault();
    setBookingError('');

    if (selectedEntries.length === 0) {
      setBookingError(language === 'th' ? 'กรุณาเพิ่มบริการอย่างน้อย 1 รายการก่อนทำการจอง' : 'Please add at least 1 service before booking.');
      return;
    }

    // If customer hasn't filled inline contact/address fields yet, take them to the full booking wizard with their selected services & turnaround speed
    if (!customerName.trim() && !mobileNumber.trim() && !condoName.trim()) {
      setIsMobileCalcOpen(false);
      onSelectServiceForBooking(
        selectedEntries[0]?.id,
        selectedEntries[0]?.weight,
        selectedEntries,
        turnaroundSpeed
      );
      return;
    }

    if (!customerName.trim()) {
      setIsPickupDetailsOpen(true);
      setBookingError(language === 'th' ? 'กรุณากรอกชื่อ-นามสกุลของคุณ' : 'Please enter your name.');
      return;
    }
    const cleanPhone = (mobileNumber || '').replace(/\D/g, '');
    if (cleanPhone.length < 8) {
      setIsPickupDetailsOpen(true);
      setBookingError(language === 'th' ? 'กรุณากรอกเบอร์โทรศัพท์ที่ถูกต้อง' : 'Please enter a valid phone / WhatsApp number.');
      return;
    }
    if (!condoName.trim()) {
      setIsPickupDetailsOpen(true);
      setBookingError(language === 'th' ? 'กรุณาระบุชื่อคอนโด อาคาร หรือที่อยู่รับ-ส่งผ้า' : 'Please enter your condo, building, or pickup address.');
      return;
    }

    const primaryService = selectedEntries[0];
    const itemsPayload = selectedEntries.map(item => ({
      serviceId: item.id,
      serviceName: item.name,
      name: item.name,
      pricingType: item.isPiece ? 'piece' : 'weight',
      unit: item.unitLabel,
      rate: item.rate,
      pricePerKg: item.rate,
      quantity: item.qty,
      estimatedWeightKg: item.isPiece ? null : item.weight,
      billableAmount: item.billable,
      subtotal: item.subtotal
    }));

    const nameParts = customerName.trim().split(' ');
    const firstName = nameParts[0] || customerName.trim();
    const lastName = nameParts.slice(1).join(' ') || '';

    const newOrder = laundryStore.createOrder({
      firstName,
      lastName,
      customerName: customerName.trim(),
      mobileNumber: mobileNumber.trim(),
      contactChannel,
      contactValue: mobileNumber.trim(),
      email: email.trim() || 'customer@nonamelaundry.com',
      serviceId: primaryService.id,
      serviceName: selectedEntries.map(i => i.name).join(' + '),
      items: itemsPayload,
      turnaroundSpeed,
      district,
      condoName: condoName.trim(),
      roomNumber: roomNumber.trim(),
      leaveWithJuristic,
      estimatedWeightKg: totalWeightKg > 0 ? totalWeightKg : null,
      quantity: totalPieces > 0 ? totalPieces : (totalWeightKg || 1),
      unit: selectedEntries.length === 1 ? primaryService.unitLabel : 'bundle',
      categoryId: primaryService.categoryId || 'laundry_by_weight',
      pricePerKg: primaryService.rate,
      serviceSubtotal: servicesSubtotal,
      deliveryFee,
      totalPrice: totalEstimatedCost,
      pickupDate,
      pickupTime
    });

    setQuickBookedOrder(newOrder);
    setIsMobileCalcOpen(false);
    if (onBookingSuccess) {
      onBookingSuccess(newOrder);
    }
  };

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

  // Shared Booking Section UI block (used in Desktop Sticky Right Sidebar & Mobile Slide-Up Sheet)
  const renderBookingSectionBody = (isMobileDrawer = false) => (
    <>
      {/* Scrollable Booking Body */}
      <div className="px-3.5 py-3 sm:px-4 sm:py-3.5 space-y-3 overflow-y-auto flex-1 min-h-0">
        
        {/* 1. SELECTED SERVICES (Starts Empty until customer adds services) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <label className="text-xs font-extrabold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
              <span>1. {language === 'th' ? 'บริการที่เลือก' : 'Selected Services'}</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                selectedEntries.length > 0
                  ? 'text-sky-700 bg-sky-100'
                  : 'text-slate-500 bg-slate-100'
              }`}>
                {selectedEntries.length} {language === 'th' ? 'รายการ' : 'Selected'}
              </span>
            </label>
            {selectedEntries.length > 0 && (
              <button
                type="button"
                onClick={handleClearAllServices}
                className="text-[11px] font-bold text-rose-600 hover:text-rose-700 cursor-pointer"
              >
                {language === 'th' ? 'ล้างทั้งหมด' : 'Clear all'}
              </button>
            )}
          </div>

          {selectedEntries.length === 0 ? (
            /* Empty State — Customer needs to add the service they need */
            <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/70 p-3.5 text-center space-y-2">
              <div className="w-8 h-8 rounded-full bg-sky-100/80 text-sky-600 flex items-center justify-center mx-auto text-base">
                🧺
              </div>
              <div>
                <div className="text-xs font-extrabold text-slate-800">
                  {language === 'th' ? 'ยังไม่มีบริการที่เลือก' : 'No services added yet'}
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                  {language === 'th'
                    ? 'กดปุ่ม "+ เพิ่มในรายการจอง" จากการ์ดบริการด้านซ้าย หรือเลือกเพิ่มด่วนด้านล่าง'
                    : 'Click "+ Add to Booking" on any service card on the left, or select below.'}
                </p>
              </div>

              {/* Quick Add Service Dropdown */}
              <div className="pt-0.5">
                <select
                  value=""
                  onChange={(e) => {
                    if (e.target.value) handleAddServiceById(e.target.value);
                  }}
                  className="w-full px-2.5 py-1.5 rounded-xl border border-sky-300 bg-white text-xs font-bold text-sky-800 focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer shadow-2xs"
                >
                  <option value="">
                    {language === 'th' ? '+ เลือกเพิ่มบริการที่ต้องการ...' : '+ Quick add a service you need...'}
                  </option>
                  {services.map(srv => {
                    const isPiece = srv.pricingType === 'piece' || srv.unit === 'piece';
                    const unitLabel = isPiece ? (language === 'th' ? 'ชิ้น' : (srv.unit || 'piece')) : (language === 'th' ? 'กก.' : 'KG');
                    const stdPrice = srv.standardPricePerKg || srv.pricePerKg || 70;
                    const displayName = (language === 'th' && srv.nameTh) ? srv.nameTh : srv.name;
                    return (
                      <option key={srv.id} value={srv.id}>
                        {displayName} — ฿{stdPrice}/{unitLabel}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>
          ) : (
            /* Added Services List with Quantity / Weight Steppers */
            <div className="space-y-1.5 max-h-56 sm:max-h-64 overflow-y-auto pr-0.5">
              {selectedEntries.map((item) => {
                const displayName = (language === 'th' && item.nameTh) ? item.nameTh : item.name;
                const displayUnit = item.isPiece ? (language === 'th' ? 'ชิ้น' : item.unitLabel) : (language === 'th' ? 'กก.' : 'KG');
                return (
                <div key={item.id} className="bg-slate-50/90 p-2.5 rounded-xl border border-slate-200/90 shadow-2xs space-y-1.5">
                  <div className="flex items-center justify-between gap-1.5">
                    <div className="min-w-0 flex items-center gap-1.5 flex-wrap flex-1">
                      <span className="font-extrabold text-xs text-slate-900 truncate">{displayName}</span>
                      <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded shrink-0 ${
                        item.isPiece ? 'bg-amber-100 text-amber-800' : 'bg-sky-100 text-sky-800'
                      }`}>
                        {item.isPiece ? (language === 'th' ? 'ชิ้น' : 'Piece') : (language === 'th' ? 'กก.' : 'KG')}
                      </span>
                      <span className="text-[10px] text-slate-500 font-medium tabular-nums">
                        (฿{item.rate}/{displayUnit})
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-xs font-black text-sky-700 tabular-nums">฿{item.subtotal}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveService(item.id)}
                        className="text-slate-400 hover:text-rose-600 p-0.5 rounded hover:bg-rose-50 transition cursor-pointer"
                        title="Remove service"
                      >
                        <Icon name="x" className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {item.isPiece ? (
                    /* Piece Quantity Counter */
                    <div className="flex items-center justify-between pt-0.5">
                      <span className="text-[10px] font-semibold text-slate-500">
                        {language === 'th' ? 'จำนวน' : 'Quantity'}:
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleUpdateQuantity(item.id, -1)}
                          className="w-6 h-6 rounded-md border border-slate-200 bg-white hover:bg-slate-100 active:bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-xs cursor-pointer shadow-2xs"
                        >
                          -
                        </button>
                        <span className="min-w-[48px] px-1 text-center font-extrabold text-xs text-slate-900 tabular-nums">
                          {item.qty} {displayUnit}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleUpdateQuantity(item.id, 1)}
                          className="w-6 h-6 rounded-md border border-slate-200 bg-white hover:bg-slate-100 active:bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-xs cursor-pointer shadow-2xs"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Weight Stepper & Slider */
                    <div className="space-y-1 pt-0.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-semibold text-slate-500">
                          {language === 'th' ? 'น้ำหนักประเมิน' : 'Est. Weight'}:
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleUpdateWeight(item.id, Math.max(1, (item.weight - 0.5).toFixed(1)))}
                            className="w-6 h-6 rounded-md border border-slate-200 bg-white hover:bg-slate-100 active:bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-xs cursor-pointer shadow-2xs"
                          >
                            -
                          </button>
                          <span className="min-w-[58px] text-center font-black text-xs text-sky-700 bg-white px-1.5 py-0.5 rounded border border-sky-200 tabular-nums">
                            {item.weight} {language === 'th' ? 'กก.' : 'KG'}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleUpdateWeight(item.id, (item.weight + 0.5).toFixed(1))}
                            className="w-6 h-6 rounded-md border border-slate-200 bg-white hover:bg-slate-100 active:bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-xs cursor-pointer shadow-2xs"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      <input
                        type="range"
                        min="1.0"
                        max="20.0"
                        step="0.5"
                        value={item.weight}
                        onChange={(e) => handleUpdateWeight(item.id, e.target.value)}
                        className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-600"
                      />
                      {Number(item.weight) < Number(item.minWeight) && (
                        <div className="text-[9px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                          {language === 'th' ? `คิดน้ำหนักขั้นต่ำ ${item.minWeight} กก. (฿${item.subtotal} บาท)` : `Min ${item.minWeight} KG applied (฿${item.subtotal} THB)`}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
              })}

              {/* Add Another Service Dropdown */}
              <select
                value=""
                onChange={(e) => {
                  if (e.target.value) handleAddServiceById(e.target.value);
                }}
                className="w-full px-2.5 py-1.5 rounded-xl border border-dashed border-sky-300 bg-sky-50/50 hover:bg-sky-50 text-xs font-bold text-sky-700 focus:outline-none cursor-pointer"
              >
                <option value="">
                  {language === 'th' ? '+ เพิ่มบริการอื่นเพิ่มเติม...' : '+ Add another service...'}
                </option>
                {services.filter(s => !selectedServicesMap[s.id]).map(srv => {
                  const isPiece = srv.pricingType === 'piece' || srv.unit === 'piece';
                  const unitLabel = isPiece ? (language === 'th' ? 'ชิ้น' : (srv.unit || 'piece')) : (language === 'th' ? 'กก.' : 'KG');
                  const stdPrice = srv.standardPricePerKg || srv.pricePerKg || 70;
                  const displayName = (language === 'th' && srv.nameTh) ? srv.nameTh : srv.name;
                  return (
                    <option key={srv.id} value={srv.id}>
                      {displayName} — ฿{stdPrice}/{unitLabel}
                    </option>
                  );
                })}
              </select>
            </div>
          )}
        </div>

        {/* 2. TURNAROUND SPEED (Standard 2 Days, Next Day, Same Day) */}
        <div className="space-y-1.5 pt-1 border-t border-slate-100">
          <label className="text-xs font-extrabold text-slate-800 uppercase tracking-wide block">
            2. {language === 'th' ? 'เลือกระยะเวลารับ-ส่งผ้า' : 'Turnaround Speed'}
          </label>
          <div className="grid grid-cols-3 gap-1.5">
            <button
              type="button"
              onClick={() => setTurnaroundSpeed('standard_48h')}
              className={`p-1.5 rounded-xl border text-center transition cursor-pointer ${
                turnaroundSpeed === 'standard_48h'
                  ? 'border-slate-900 bg-slate-900 text-white shadow-2xs'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              <div className="text-[10px] font-extrabold leading-tight">
                🕒 {language === 'th' ? 'มาตรฐาน' : 'Standard'}
              </div>
              <div className={`text-[9px] font-semibold mt-0.5 ${
                turnaroundSpeed === 'standard_48h' ? 'text-slate-300' : 'text-slate-500'
              }`}>
                {language === 'th' ? '2 วัน' : '2 Days'}
              </div>
            </button>

            <button
              type="button"
              onClick={() => setTurnaroundSpeed('next_day_24h')}
              className={`p-1.5 rounded-xl border text-center transition cursor-pointer ${
                turnaroundSpeed === 'next_day_24h'
                  ? 'border-sky-600 bg-sky-600 text-white shadow-2xs'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              <div className="text-[10px] font-extrabold leading-tight">
                ⚡ {language === 'th' ? 'วันถัดไป' : 'Next Day'}
              </div>
              <div className={`text-[9px] font-semibold mt-0.5 ${
                turnaroundSpeed === 'next_day_24h' ? 'text-sky-100' : 'text-sky-600'
              }`}>
                {language === 'th' ? 'วันถัดไป' : 'Next Day'}
              </div>
            </button>

            <button
              type="button"
              onClick={() => setTurnaroundSpeed('same_day')}
              className={`p-1.5 rounded-xl border text-center transition cursor-pointer ${
                turnaroundSpeed === 'same_day'
                  ? 'border-amber-500 bg-amber-500 text-white shadow-2xs'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              <div className="text-[10px] font-extrabold leading-tight">
                🚀 {language === 'th' ? 'วันเดียว' : 'Same Day'}
              </div>
              <div className={`text-[9px] font-semibold mt-0.5 ${
                turnaroundSpeed === 'same_day' ? 'text-amber-100' : 'text-amber-600'
              }`}>
                {language === 'th' ? 'วันเดียว' : 'Same Day'}
              </div>
            </button>
          </div>
        </div>

        {/* 3. QUICK PICKUP & CONTACT DETAILS (Collapsible Accordion for Optimal Space) */}
        <div className="pt-1.5 border-t border-slate-100 space-y-1.5">
          <button
            type="button"
            onClick={() => setIsPickupDetailsOpen(!isPickupDetailsOpen)}
            className="w-full flex items-center justify-between p-2 rounded-xl bg-slate-50 hover:bg-slate-100/90 border border-slate-200 transition text-left cursor-pointer"
          >
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wide truncate">
                3. {language === 'th' ? 'ข้อมูลนัดรับผ้า (จองทันที)' : 'Pickup Details'}
              </span>
              {condoName.trim() && customerName.trim() ? (
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 shrink-0">
                  ✓ {language === 'th' ? 'กรอกแล้ว' : 'Ready'}
                </span>
              ) : (
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-sky-100 text-sky-800 shrink-0">
                  {language === 'th' ? 'แตะเพื่อกรอก' : 'Tap to fill'}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1 text-[11px] font-bold text-sky-600 shrink-0">
              <span>{isPickupDetailsOpen ? (language === 'th' ? 'ย่อ' : 'Close') : (language === 'th' ? 'ระบุข้อมูล' : 'Open')}</span>
              <Icon name="chevronDown" className={`w-3.5 h-3.5 transition-transform duration-200 ${isPickupDetailsOpen ? 'rotate-180' : ''}`} />
            </div>
          </button>

          {/* Quick 1-line Summary when collapsed */}
          {!isPickupDetailsOpen && (condoName.trim() || customerName.trim() || mobileNumber.trim()) && (
            <div className="px-2.5 py-1 rounded-lg bg-sky-50/70 border border-sky-100 text-[10px] text-slate-600 flex items-center justify-between gap-1">
              <span className="truncate">
                📍 {condoName || 'Condo'} {roomNumber ? `(#${roomNumber})` : ''} • 👤 {customerName || 'Customer'}
              </span>
              <button
                type="button"
                onClick={() => setIsPickupDetailsOpen(true)}
                className="text-sky-600 font-bold hover:underline shrink-0"
              >
                {language === 'th' ? 'แก้ไข' : 'Edit'}
              </button>
            </div>
          )}

          {/* Expanded Form Fields */}
          {isPickupDetailsOpen && (
            <div className="space-y-2 p-2.5 rounded-xl border border-slate-200 bg-slate-50/60 mt-1">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 mb-0.5">
                    {language === 'th' ? 'วันที่รับผ้า' : 'Pickup Date'}
                  </label>
                  <input
                    type="date"
                    value={pickupDate}
                    onChange={(e) => setPickupDate(e.target.value)}
                    className="w-full px-2 py-1 rounded-lg border border-slate-200 text-xs font-semibold text-slate-800 bg-white focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 mb-0.5">
                    {language === 'th' ? 'ช่วงเวลารับผ้า' : 'Time Window'}
                  </label>
                  <select
                    value={pickupTime}
                    onChange={(e) => setPickupTime(e.target.value)}
                    className="w-full px-2 py-1 rounded-lg border border-slate-200 text-xs font-semibold text-slate-800 bg-white focus:outline-none focus:border-sky-500"
                  >
                    {TIME_SLOTS.map((slot, idx) => (
                      <option key={idx} value={slot}>{slot}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <input
                    type="text"
                    value={condoName}
                    onChange={(e) => setCondoName(e.target.value)}
                    placeholder={language === 'th' ? 'ชื่อคอนโด / โรงแรม *' : 'Condo / Hotel *'}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-800 placeholder-slate-400 bg-white focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    value={roomNumber}
                    onChange={(e) => setRoomNumber(e.target.value)}
                    placeholder={language === 'th' ? 'เลขห้อง' : 'Room #'}
                    className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-800 placeholder-slate-400 bg-white focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder={language === 'th' ? 'ชื่อ-นามสกุลของคุณ *' : 'Your Full Name *'}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-800 placeholder-slate-400 bg-white focus:outline-none focus:border-sky-500"
                />
                <input
                  type="tel"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  placeholder={language === 'th' ? 'เบอร์โทร / WhatsApp *' : 'Phone / WhatsApp *'}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-800 placeholder-slate-400 bg-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <label className="flex items-center gap-2 text-[10px] text-slate-600 cursor-pointer select-none pt-0.5">
                <input
                  type="checkbox"
                  checked={leaveWithJuristic}
                  onChange={(e) => setLeaveWithJuristic(e.target.checked)}
                  className="w-3.5 h-3.5 rounded text-sky-600 focus:ring-sky-500"
                />
                <span>
                  {language === 'th'
                    ? '🏢 ฝาก-รับถุงผ้าที่นิติบุคคลคอนโด / ล็อบบี้'
                    : '🏢 Leave & collect at Condo Juristic / Lobby'}
                </span>
              </label>
            </div>
          )}

          {bookingError && (
            <div className="p-2 rounded-xl bg-rose-50 border border-rose-200 text-[11px] font-bold text-rose-700">
              {bookingError}
            </div>
          )}
        </div>

      </div>

      {/* Pinned ESTIMATED TOTAL Dark Card */}
      <div className="p-3 sm:p-4 bg-white border-t border-slate-100 shrink-0">
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-3 rounded-2xl flex flex-col justify-between shadow-lg space-y-2">
          <div>
            <div className="flex items-center justify-between">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                {language === 'th' ? 'ยอดประเมินรวม (Estimated Total)' : 'Estimated Total'}
              </div>
              <span className="text-[9px] bg-sky-500/20 text-sky-300 px-2 py-0.2 rounded-full font-bold border border-sky-400/30">
                {selectedEntries.length} {selectedEntries.length === 1 ? 'Service' : 'Services'}
              </span>
            </div>

            <div className="mt-0.5 flex items-baseline justify-between gap-2 tabular-nums">
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl sm:text-3xl font-black text-sky-400 tracking-tight">
                  ฿{totalEstimatedCost}
                </span>
                <span className="text-[10px] text-slate-300 font-bold">THB</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold text-slate-300 block">
                  {turnaroundSpeed === 'same_day'
                    ? '🚀 Same Day'
                    : turnaroundSpeed === 'next_day_24h'
                      ? '⚡ Next Day'
                      : '🕒 Standard (2 Days)'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-0.5">
            {isMobileDrawer && (
              <button
                type="button"
                onClick={() => setIsMobileCalcOpen(false)}
                className="px-3 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold text-xs transition cursor-pointer shrink-0"
              >
                {language === 'th' ? 'ดูบริการต่อ' : 'Add Services'}
              </button>
            )}
            <button
              type="button"
              disabled={selectedEntries.length === 0}
              onClick={handleQuickBookSubmit}
              className={`flex-1 inline-flex items-center justify-center gap-1.5 font-bold text-xs sm:text-sm py-2 sm:py-2.5 px-3 rounded-xl transition shadow-md ${
                selectedEntries.length === 0
                  ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                  : 'bg-sky-500 hover:bg-sky-400 text-white shadow-sky-950/40 cursor-pointer'
              }`}
            >
              <span>
                {selectedEntries.length === 0
                  ? (language === 'th' ? 'เลือกบริการเพื่อทำการจอง' : 'Add Services to Book')
                  : (customerName.trim() || mobileNumber.trim() || condoName.trim())
                    ? (language === 'th' ? `ยืนยันการจอง (฿${totalEstimatedCost})` : `Confirm Booking (฿${totalEstimatedCost})`)
                    : (language === 'th' ? 'ดำเนินการจองบริการที่เลือก' : 'Book Selected Services')}
              </span>
              <Icon name="chevronRight" className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <section id="services" className="py-8 sm:py-16 pb-28 lg:pb-16 bg-slate-50/60 relative">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-6 sm:mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-100 text-sky-800 text-xs font-bold uppercase tracking-wider mb-3 shadow-2xs">
            <Icon name="layers" className="w-3.5 h-3.5" />
            <span>
              {language === 'th'
                ? 'รายการบริการ & จองรถรับ-ส่งผ้า'
                : 'Services & Instant Booking'}
            </span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
            {t('servicesTitle')}
          </h2>
          <p className="mt-2 text-xs sm:text-base text-slate-600 leading-relaxed">
            {language === 'th'
              ? 'เลือกเพิ่มบริการที่คุณต้องการลงในกล่องจองด้านขวา ระบบจะคำนวณราคารวมและสามารถทำการจองได้ทันที'
              : 'Add the services you need to your booking panel on the right to see your live estimated total and book instantly.'}
          </p>
        </div>

        {/* Instant Booking Confirmation Modal if booked directly from the right-side Booking Section */}
        {quickBookedOrder && (
          <div
            className="fixed inset-0 z-50 bg-slate-900/75 backdrop-blur-xs flex items-center justify-center p-4"
            onClick={() => setQuickBookedOrder(null)}
          >
            <div
              className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 text-center space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <Icon name="check" className="w-7 h-7" />
              </div>
              <div>
                <span className="px-3 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                  {language === 'th' ? '✓ ยืนยันการจองเรียบร้อยแล้ว' : 'Booking Confirmed'}
                </span>
                <h3 className="text-xl font-black text-slate-900 mt-1">
                  {language === 'th' ? `หมายเลขคำสั่งซื้อ #${quickBookedOrder.id}` : `Order #${quickBookedOrder.id}`}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  {language === 'th'
                    ? `ขอบคุณคุณ ${quickBookedOrder.customerName}! เราได้บันทึกการนัดรับผ้าในวันที่ ${quickBookedOrder.pickupDate} (${quickBookedOrder.pickupTime}) เรียบร้อยแล้ว`
                    : `Thank you, ${quickBookedOrder.customerName}! Your pickup is scheduled for ${quickBookedOrder.pickupDate} (${quickBookedOrder.pickupTime}).`}
                </p>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-left text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">{language === 'th' ? 'บริการที่เลือก:' : 'Services:'}</span>
                  <span className="font-bold text-slate-900">{quickBookedOrder.serviceName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">{language === 'th' ? 'ระยะเวลาส่งคืน:' : 'Turnaround:'}</span>
                  <span className="font-bold text-sky-700">
                    {quickBookedOrder.turnaroundSpeed === 'same_day'
                      ? (language === 'th' ? 'วันเดียว (Same Day)' : 'Same Day')
                      : quickBookedOrder.turnaroundSpeed === 'next_day_24h'
                        ? (language === 'th' ? 'วันถัดไป (Next Day)' : 'Next Day')
                        : (language === 'th' ? 'มาตรฐาน (2 วัน)' : 'Standard (2 Days)')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">{language === 'th' ? 'ค่าจัดส่ง:' : 'Delivery Fee:'}</span>
                  <span className="font-bold text-emerald-600">
                    {Number(quickBookedOrder.deliveryFee) === 0 ? (language === 'th' ? 'ฟรี (฿0)' : 'FREE (฿0)') : `฿${quickBookedOrder.deliveryFee}`}
                  </span>
                </div>
                <div className="flex justify-between pt-1 border-t border-slate-200 text-sm font-black text-slate-900">
                  <span>{language === 'th' ? 'ยอดประเมินรวม:' : 'Estimated Total:'}</span>
                  <span className="text-sky-600">฿{quickBookedOrder.totalPrice} THB</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setQuickBookedOrder(null)}
                className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs cursor-pointer"
              >
                {language === 'th' ? 'เสร็จสิ้น' : 'Done'}
              </button>
            </div>
          </div>
        )}

        {/* Mobile Quick Booking Summary Banner (Visible on phones & tablets < lg) */}
        <div className="lg:hidden mb-5 bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-2xl p-4 shadow-lg border border-slate-700/80 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] uppercase tracking-wider font-extrabold text-sky-400">
                {language === 'th' ? 'รายการจองของคุณ' : 'Your Booking'}
              </span>
              <span className="text-[10px] bg-sky-500/20 text-sky-300 px-2 py-0.5 rounded-full font-bold border border-sky-400/30">
                {selectedEntries.length} {selectedEntries.length === 1 ? 'Service' : 'Services'}
              </span>
            </div>
            <div className="flex items-baseline gap-1.5 mt-0.5 tabular-nums">
              <span className="text-2xl font-black text-white">฿{totalEstimatedCost}</span>
              <span className="text-xs text-slate-300 font-bold">THB</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsMobileCalcOpen(true)}
            className="inline-flex items-center gap-1.5 bg-sky-500 hover:bg-sky-400 active:bg-sky-600 text-white font-bold text-xs px-3.5 py-2.5 rounded-xl shadow-md transition shrink-0 cursor-pointer"
          >
            <Icon name="layers" className="w-3.5 h-3.5" />
            <span>{language === 'th' ? 'เปิดหน้าจองบริการ' : 'Open Booking'}</span>
          </button>
        </div>

        {/* Two-Column Layout: Left = Main Services Catalog, Right = Sticky Booking Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT COLUMN: Main Services Provided */}
          <div className="lg:col-span-7 xl:col-span-8 min-w-0 space-y-6 sm:space-y-8">
            
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

              {/* Category Filter Pills (Responsive Wrapping, Zero Awkward Scrollbars) */}
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
                    
                    // Short, crisp localized labels for clean presentation
                    let shortLabel = cat.name;
                    if (language === 'th') {
                      if (cat.id === 'laundry_by_weight') shortLabel = 'ซักตามน้ำหนัก (กก.)';
                      else if (cat.id === 'bedding_linens') shortLabel = 'เครื่องนอน & ผ้านวม';
                      else if (cat.id === 'household_curtains') shortLabel = 'ผ้าม่าน & ของใช้';
                      else if (cat.id === 'delicate_dryclean') shortLabel = 'ผ้าไหม & ชุดพิเศษ';
                      else shortLabel = cat.nameTh || cat.name;
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

            {/* Categorized Services Groups */}
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
                    <div key={cat.id} className="space-y-4 sm:space-y-5">
                      
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

                            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
                              {(language === 'th' && cat.descriptionTh) ? cat.descriptionTh : cat.description}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Services Grid for This Category (2 columns alongside the right Booking Section) */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
                        {cat.services.map((service) => {
                          const isPopular = Boolean(service.popular);
                          const isSelectedInCalc = Boolean(selectedServicesMap[service.id]);
                          const selectedEntry = selectedEntries.find(e => e.id === service.id);
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
                                isSelectedInCalc
                                   ? 'border-2 border-sky-500 ring-2 ring-sky-500/15 shadow-lg shadow-sky-500/10'
                                   : isPopular
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

                              {/* Interactive Booking Toggle + Inline Quantity/Weight Control */}
                              <div className="mt-5 pt-4 border-t border-slate-100 space-y-2.5">
                                
                                {/* When added to booking, show convenient inline -/+ adjuster right on the card */}
                                {isSelectedInCalc && selectedEntry && (
                                  <div className="flex items-center justify-between bg-sky-50/80 border border-sky-200 rounded-xl px-3 py-2">
                                    <span className="text-[11px] font-bold text-sky-900">
                                      {serviceIsPiece
                                        ? (language === 'th' ? 'จำนวนชิ้น:' : 'Quantity:')
                                        : (language === 'th' ? 'น้ำหนักประเมิน:' : 'Est. Weight:')}
                                    </span>
                                    <div className="flex items-center gap-1.5">
                                      <button
                                        type="button"
                                        onClick={() => serviceIsPiece
                                          ? handleUpdateQuantity(service.id, -1)
                                          : handleUpdateWeight(service.id, Math.max(1, (selectedEntry.weight - 0.5).toFixed(1)))
                                        }
                                        className="w-7 h-7 rounded-lg bg-white border border-sky-200 text-sky-900 font-bold flex items-center justify-center text-sm shadow-2xs active:bg-sky-100 cursor-pointer"
                                      >
                                        -
                                      </button>
                                      <span className="min-w-[60px] text-center font-extrabold text-xs text-sky-950 tabular-nums">
                                        {serviceIsPiece ? `${selectedEntry.qty} ${unitDisplay}` : `${selectedEntry.weight} KG`}
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() => serviceIsPiece
                                          ? handleUpdateQuantity(service.id, 1)
                                          : handleUpdateWeight(service.id, (selectedEntry.weight + 0.5).toFixed(1))
                                        }
                                        className="w-7 h-7 rounded-lg bg-white border border-sky-200 text-sky-900 font-bold flex items-center justify-center text-sm shadow-2xs active:bg-sky-100 cursor-pointer"
                                      >
                                        +
                                      </button>
                                    </div>
                                  </div>
                                )}

                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => handleToggleService(service)}
                                    className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs transition flex items-center justify-center gap-1.5 border cursor-pointer ${
                                      isSelectedInCalc
                                        ? 'bg-sky-600 border-sky-600 text-white shadow-xs'
                                        : 'bg-slate-900 border-slate-900 text-white hover:bg-slate-800'
                                    }`}
                                  >
                                    <div className={`w-4 h-4 rounded flex items-center justify-center shrink-0 ${
                                      isSelectedInCalc ? 'bg-white text-sky-600' : 'bg-white/20 text-white'
                                    }`}>
                                      {isSelectedInCalc ? <Icon name="check" className="w-3 h-3" /> : <span className="text-xs leading-none">+</span>}
                                    </div>
                                    <span className="tabular-nums">
                                      {isSelectedInCalc
                                        ? (language === 'th' ? `เพิ่มในรายการจองแล้ว (฿${selectedEntry?.subtotal})` : `Added to Booking (฿${selectedEntry?.subtotal})`)
                                        : (language === 'th' ? 'เพิ่มบริการนี้ในรายการจอง' : 'Add to Booking')}
                                    </span>
                                  </button>
                                </div>
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

          {/* RIGHT COLUMN: Sticky Instant Booking Section (Follows user while scrolling down) */}
          <div className="lg:col-span-5 xl:col-span-4 relative">
            <div
              className="lg:sticky z-20 bg-white rounded-3xl shadow-xl shadow-slate-200/70 border border-slate-200/90 overflow-hidden flex flex-col transition-[top,max-height] duration-75"
              style={{
                top: `${stickyTop}px`,
                maxHeight: `calc(100dvh - ${stickyTop + 14}px)`
              }}
            >
              
              {/* Booking Section Header */}
              <div className="px-3.5 py-2.5 sm:px-4 sm:py-3 border-b border-slate-100 bg-white shrink-0">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] uppercase tracking-wider font-extrabold text-sky-600 flex items-center gap-1.5">
                    <Icon name="truck" className="w-3.5 h-3.5 shrink-0" />
                    <span>{language === 'th' ? 'จองบริการรับ-ส่งผ้า' : 'Instant Booking'}</span>
                  </span>
                </div>
                <h3 className="text-sm sm:text-base font-extrabold text-slate-900 mt-0.5 leading-snug">
                  {language === 'th' ? 'รายการจองและคำนวณราคา' : 'Your Booking & Estimated Total'}
                </h3>
              </div>

              {renderBookingSectionBody(false)}

            </div>
          </div>

        </div>

      </div>

      {/* MOBILE STICKY BOTTOM BOOKING BAR (Always follows mobile user while scrolling on screens < lg) */}
      <div className="fixed bottom-0 inset-x-0 z-40 lg:hidden bg-slate-900/95 backdrop-blur-md border-t border-slate-700/80 px-4 py-3 shadow-2xl">
        <div className="max-w-lg mx-auto flex items-center justify-between gap-3">
          {/* Tap Left Area to Open Full Mobile Booking Sheet */}
          <button
            type="button"
            onClick={() => setIsMobileCalcOpen(true)}
            className="flex-1 text-left min-w-0 cursor-pointer group"
          >
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300">
                {language === 'th' ? 'ยอดประเมินรวม' : 'Estimated Total'}
              </span>
              <span className="text-[10px] bg-sky-500/25 text-sky-300 px-2 py-0.5 rounded-full font-bold border border-sky-400/30">
                {selectedEntries.length} {selectedEntries.length === 1 ? 'Service' : 'Services'}
              </span>
              <span className="text-[10px] text-sky-400 font-bold underline ml-1">
                {language === 'th' ? 'เปิดดู ▲' : 'Open ▲'}
              </span>
            </div>
            <div className="flex items-baseline gap-1.5 mt-0.5 tabular-nums">
              <span className="text-2xl font-black text-sky-400 leading-none">
                ฿{totalEstimatedCost}
              </span>
              <span className="text-[11px] text-slate-300 font-bold">THB</span>
            </div>
          </button>

          {/* Direct Open / Book Button on Mobile Bottom Bar */}
          <button
            type="button"
            onClick={() => setIsMobileCalcOpen(true)}
            className="inline-flex items-center justify-center gap-1.5 bg-sky-500 hover:bg-sky-400 active:bg-sky-600 text-white font-bold text-xs sm:text-sm px-4 py-3 rounded-xl shadow-lg shadow-sky-950/50 transition shrink-0 cursor-pointer"
          >
            <span>
              {selectedEntries.length === 0
                ? (language === 'th' ? 'เลือกบริการ' : 'Book Now')
                : (language === 'th' ? `จองเลย (${selectedEntries.length})` : `Book (${selectedEntries.length})`)}
            </span>
            <Icon name="chevronRight" className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* MOBILE SLIDE-UP BOOKING DRAWER (Modal Sheet on < lg) */}
      {isMobileCalcOpen && (
        <div
          className="fixed inset-0 z-50 lg:hidden bg-slate-950/60 backdrop-blur-xs flex flex-col justify-end"
          onClick={() => setIsMobileCalcOpen(false)}
        >
          <div
            className="bg-white w-full max-h-[88vh] rounded-t-3xl shadow-2xl border-t border-slate-200 flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Mobile Sheet Header */}
            <div className="px-4 py-3.5 border-b border-slate-100 flex items-center justify-between gap-3 bg-white shrink-0">
              <div>
                <span className="text-[10px] uppercase tracking-wider font-extrabold text-sky-600 flex items-center gap-1">
                  <Icon name="truck" className="w-3 h-3" />
                  <span>{language === 'th' ? 'จองบริการรับ-ส่งผ้าออนไลน์' : 'Instant Booking'}</span>
                </span>
                <h3 className="text-base font-extrabold text-slate-900">
                  {language === 'th' ? 'รายการจองและประเมินราคาของคุณ' : 'Your Booking & Estimated Total'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsMobileCalcOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer shrink-0"
                aria-label="Close booking panel"
              >
                <Icon name="x" className="w-4 h-4" />
              </button>
            </div>

            {renderBookingSectionBody(true)}
          </div>
        </div>
      )}

    </section>
  );
}
