import React, { useState, useEffect } from 'react';
import { Icon } from './Icons.jsx';
import { BANGKOK_DISTRICTS, TIME_SLOTS } from '../data/servicesData.js';
import { DISTRICT_TO_POSTAL_CODE } from '../data/postalCodesData.js';
import { TermsModal } from './TermsModal.jsx';
import { getLineOaMessageUrl, getLineOaAddFriendUrl, getLineQrCodeUrl, laundryStore } from '../store.js';
import { CountryPhoneInput } from './CountryPhoneInput.jsx';
import GoogleMapsCondoAutocomplete from './GoogleMapsCondoAutocomplete.jsx';

export function BookingWizard({ services, initialServiceId, initialWeight, onBookingSuccess, onViewFullTerms }) {
  const [serviceId, setServiceId] = useState(initialServiceId || services[0]?.id || 'wash_fold');
  const [activeCategory, setActiveCategory] = useState('all');
  const [estimatedWeightKg, setEstimatedWeightKg] = useState(initialWeight || 4.0);
  const [pieceQuantity, setPieceQuantity] = useState(1);
  const [turnaroundSpeed, setTurnaroundSpeed] = useState('standard_48h'); // 'standard_48h', 'next_day_24h', 'same_day'
  
  // Customer Info
  const [customerName, setCustomerName] = useState('');
  const [nickName, setNickName] = useState('');
  const [contactChannel, setContactChannel] = useState('line'); // default to line since very popular in Bangkok
  const [contactValue, setContactValue] = useState('');
  const [email, setEmail] = useState('');

  // Thai Company Tax Info
  const [isCompanyTax, setIsCompanyTax] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [companyTaxId, setCompanyTaxId] = useState('');
  const [companyBranch, setCompanyBranch] = useState('Head Office (สำนักงานใหญ่)');

  // Bangkok Address Info
  const [district, setDistrict] = useState(BANGKOK_DISTRICTS[0]);
  const [postalCode, setPostalCode] = useState(DISTRICT_TO_POSTAL_CODE[BANGKOK_DISTRICTS[0]] || '10110');
  const [condoName, setCondoName] = useState('');
  const [roomNumber, setRoomNumber] = useState('');
  const [leaveWithJuristic, setLeaveWithJuristic] = useState(true);

  // Schedule Info
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  const [pickupDate, setPickupDate] = useState(tomorrowStr);
  const [pickupTime, setPickupTime] = useState(TIME_SLOTS[0]);
  const [specialInstructions, setSpecialInstructions] = useState('');

  // Terms & Conditions States
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
  const [hasReviewedSummary, setHasReviewedSummary] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  
  // Validation Error State
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Completed Order Modal for LINE OA Connect
  const [completedOrder, setCompletedOrder] = useState(null);
  const [showQrCode, setShowQrCode] = useState(false);

  const lineOaId = laundryStore.settings?.lineOaId || '@nonamelaundry';
  const categories = laundryStore.getCategories ? laundryStore.getCategories() : [];

  // Update selected service if props change
  useEffect(() => {
    if (initialServiceId) setServiceId(initialServiceId);
    if (initialWeight) setEstimatedWeightKg(initialWeight);
  }, [initialServiceId, initialWeight]);

  const currentService = services.find(s => s.id === serviceId) || services[0];
  const isPiece = currentService?.pricingType === 'piece' || currentService?.unit === 'piece';
  const isSameDayAvailable = currentService?.sameDayAvailable !== false;
  const minWeight = Number(currentService?.minWeightKg || (isPiece ? 1.0 : 4.0));
  const standardRate = Number(currentService?.standardPricePerKg || currentService?.pricePerKg || 65);
  const nextDayRate = Number(currentService?.nextDayPricePerKg || Math.round(standardRate * 1.3));
  const sameDayRate = Number(currentService?.sameDayPricePerKg || Math.round(standardRate * 1.75));

  let activeSpeed = turnaroundSpeed;
  if (activeSpeed === 'same_day' && !isSameDayAvailable) {
    activeSpeed = 'standard_48h';
  }
  if (!['standard_48h', 'next_day_24h', 'same_day'].includes(activeSpeed)) {
    if (activeSpeed === 'next_day') activeSpeed = 'next_day_24h';
    else if (activeSpeed === 'standard') activeSpeed = 'standard_48h';
    else activeSpeed = 'standard_48h';
  }

  let priceRate = standardRate;
  if (activeSpeed === 'same_day') priceRate = sameDayRate;
  else if (activeSpeed === 'next_day_24h') priceRate = nextDayRate;
  else priceRate = standardRate;

  const billableAmount = isPiece
    ? Math.max(1, Number(pieceQuantity))
    : Math.max(Number(estimatedWeightKg), minWeight);
  const estimatedTotal = Math.round(billableAmount * priceRate);
  const deliveryInfo = laundryStore.calculateDeliveryFee(postalCode, estimatedTotal);
  const grandEstimatedTotal = estimatedTotal + deliveryInfo.fee;

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!customerName.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }

    if (!contactValue.trim()) {
      setErrorMessage(`Please enter your ${contactChannel.toUpperCase()} contact handle or number.`);
      return;
    }

    if (!condoName.trim()) {
      setErrorMessage('Please enter your Bangkok Condominium or building name.');
      return;
    }

    // Strict requirement: User must agree to Terms & Conditions
    if (!agreedToTerms) {
      setErrorMessage('You must review and check the box agreeing to the Terms and Conditions (including the Online-Only Support policy) before submitting.');
      return;
    }

    setIsSubmitting(true);

    const bookingPayload = {
      customerName: customerName.trim(),
      nickName: nickName.trim(),
      contactChannel,
      contactValue: contactValue.trim(),
      email: email.trim() || `${customerName.toLowerCase().replace(/\s+/g, '')}@customer.local`,
      serviceId,
      turnaroundSpeed: activeSpeed,
      district,
      postalCode,
      condoName: condoName.trim(),
      roomNumber: roomNumber.trim(),
      leaveWithJuristic,
      estimatedWeightKg: isPiece ? null : Number(estimatedWeightKg),
      quantity: isPiece ? pieceQuantity : Number(estimatedWeightKg),
      unit: isPiece ? (currentService.unit || 'piece') : 'KG',
      categoryId: currentService.categoryId || 'laundry_by_weight',
      pricePerKg: priceRate,
      serviceSubtotal: estimatedTotal,
      deliveryFee: deliveryInfo.fee,
      totalPrice: grandEstimatedTotal,
      pickupDate,
      pickupTime,
      deliveryDate: activeSpeed === 'same_day' 
        ? `${pickupDate} (Same Day Before 18:00)` 
        : activeSpeed === 'next_day_24h' 
        ? 'Scheduled Next Day (~24 Hours)' 
        : 'Scheduled in 48 Hours (~2 Days)',
      deliveryTime: activeSpeed === 'same_day' 
        ? 'Anytime before 18:00 hrs' 
        : activeSpeed === 'next_day_24h' 
        ? '18:00 - 20:30 (Evening Rush)' 
        : '16:00 - 18:00 (Early Evening)',
      specialInstructions: specialInstructions.trim(),
      companyTax: isCompanyTax ? {
        required: true,
        companyName: companyName.trim(),
        taxId: companyTaxId.trim(),
        branch: companyBranch.trim(),
        companyAddress: `${condoName.trim()}, ${district}, Bangkok`
      } : { required: false }
    };

    setTimeout(() => {
      // Save order in store
      const order = laundryStore.createOrder(bookingPayload);
      setCompletedOrder(order);
      setIsSubmitting(false);
    }, 400);
  };

  const lineMessageText = completedOrder 
    ? `Hi NoName Laundry, I just booked order ${completedOrder.id} (${completedOrder.customerName}) for ${completedOrder.serviceName}. Please link my order for updates!`
    : `Hi NoName Laundry, I want to link my booking.`;

  const lineDeepLink = getLineOaMessageUrl(lineMessageText, lineOaId);
  const lineAddFriendLink = getLineOaAddFriendUrl(lineOaId);
  const lineQrCodeUrl = getLineQrCodeUrl(lineOaId);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Terms Summary Review Modal */}
      <TermsModal
        isOpen={isTermsModalOpen}
        onClose={() => setIsTermsModalOpen(false)}
        onAcknowledge={() => {
          setHasReviewedSummary(true);
          setAgreedToTerms(true);
        }}
        onViewFullTerms={onViewFullTerms}
      />

      {/* POST-BOOKING MODAL: LINE OA ADD FRIEND & ORDER LINKING */}
      {completedOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-6 text-center">
            
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
              <Icon name="check" className="w-8 h-8" />
            </div>

            <div>
              <span className="text-xs uppercase font-bold text-emerald-600 tracking-wider">
                Booking Successfully Received
              </span>
              <h3 className="text-2xl font-black text-slate-900 mt-1">
                Tracking ID: <span className="font-mono text-sky-600">{completedOrder.id}</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Estimated: {completedOrder.estimatedWeightKg} KG • ฿{completedOrder.totalPrice} THB • {completedOrder.condoName}
              </p>
            </div>

            {/* Crucial LINE OA Privacy Explanation & 1-Click Action */}
            <div className="bg-green-50/80 rounded-2xl p-5 border-2 border-green-500/40 text-left space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-green-500 text-white flex items-center justify-center font-bold shrink-0">
                  <Icon name="line" className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-green-950">
                    Important Step: Connect on LINE Official Account
                  </h4>
                  <span className="text-[11px] text-green-700 font-semibold font-mono">
                    {lineOaId}
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-700 leading-relaxed">
                Due to LINE Official Account privacy regulations in Thailand, <strong>our business cannot initiate a message or add your personal LINE account directly</strong>.
              </p>
              
              <div className="p-3 bg-white rounded-xl border border-green-200 text-xs text-slate-800 font-medium space-y-1">
                <div>👉 <strong>Step 1:</strong> Tap the button below to open our LINE OA chat.</div>
                <div>👉 <strong>Step 2:</strong> Tap <strong>"Send"</strong> on the pre-filled message with your Booking ID.</div>
                <div>👉 <strong>Result:</strong> Our team can immediately send your scale photos, pickup ETA, and invoices!</div>
              </div>

              {/* 1-Click Mobile Button */}
              <a
                href={lineDeepLink}
                target="_blank"
                rel="noreferrer"
                className="w-full py-3.5 px-4 rounded-xl bg-green-600 hover:bg-green-500 text-white font-extrabold text-xs sm:text-sm shadow-lg shadow-green-600/30 transition flex items-center justify-center gap-2"
              >
                <Icon name="line" className="w-5 h-5" />
                <span>Open LINE App & Send Order #{completedOrder.id}</span>
              </a>

              {/* QR Code Toggle for Desktop Users */}
              <div className="pt-1 text-center">
                <button
                  type="button"
                  onClick={() => setShowQrCode(!showQrCode)}
                  className="text-xs text-green-800 hover:text-green-950 font-bold inline-flex items-center gap-1 underline underline-offset-2"
                >
                  <span>{showQrCode ? 'Hide QR Code' : 'On Desktop? Scan QR Code with Phone Camera'}</span>
                  <Icon name="chevronRight" className="w-3.5 h-3.5" />
                </button>

                {showQrCode && (
                  <div className="mt-4 p-4 bg-white rounded-2xl border border-green-300 inline-block shadow-md">
                    <img
                      src={lineQrCodeUrl}
                      alt="Scan to Add LINE OA @nonamelaundry"
                      className="w-48 h-48 mx-auto rounded-lg"
                    />
                    <p className="text-[11px] text-slate-500 mt-2 font-mono">
                      Scan to add <strong>{lineOaId}</strong>
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Navigation to Tracker */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <span className="text-xs text-slate-400">
                You can also track your order anytime online.
              </span>
              <button
                onClick={() => onBookingSuccess(completedOrder)}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-1.5"
              >
                <span>Go to Live Order Tracker</span>
                <Icon name="chevronRight" className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Header Banner */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-100 text-sky-800 text-xs font-bold mb-2">
          <span>Bangkok Purely Digital Laundry Service</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Schedule Your Laundry Pickup
        </h1>
        <p className="text-sm text-slate-600 mt-2">
          No storefront visit needed. Door-to-door collection across Bangkok condos and residences. Support exclusively via WhatsApp, LINE, and Email.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Step 1: Select Service & Weight / Quantity */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-6">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-full bg-sky-600 text-white font-bold text-xs flex items-center justify-center">1</span>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Service, Linens & Turnaround Speed</h2>
              <p className="text-xs text-slate-500">Select laundry by weight or specialty linens, comforters, and curtains billed per piece.</p>
            </div>
          </div>

          {/* Category Tabs Filter */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            <button
              type="button"
              onClick={() => setActiveCategory('all')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition shrink-0 flex items-center gap-1.5 border ${
                activeCategory === 'all'
                  ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <span>All Services</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${activeCategory === 'all' ? 'bg-slate-700 text-white' : 'bg-slate-200 text-slate-700'}`}>
                {services.length}
              </span>
            </button>
            {categories.map((cat) => {
              const count = services.filter(s => s.categoryId === cat.id).length;
              const isCatActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    setActiveCategory(cat.id);
                    const firstInCat = services.find(s => s.categoryId === cat.id);
                    if (firstInCat && currentService.categoryId !== cat.id) {
                      setServiceId(firstInCat.id);
                    }
                  }}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition shrink-0 flex items-center gap-1.5 border ${
                    isCatActive
                      ? 'bg-sky-600 text-white border-sky-600 shadow-sm'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <Icon name={cat.icon || 'folder'} className="w-3.5 h-3.5" />
                  <span>{cat.name}</span>
                  {count > 0 && (
                    <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${isCatActive ? 'bg-sky-700 text-white' : 'bg-slate-200 text-slate-700'}`}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Service Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {(activeCategory === 'all' ? services : services.filter(s => s.categoryId === activeCategory)).map((srv) => {
              const srvStd = srv.standardPricePerKg || srv.pricePerKg || 65;
              const srvNext = srv.nextDayPricePerKg || Math.round(srvStd * 1.3);
              const srvSame = srv.sameDayPricePerKg || Math.round(srvStd * 1.75);
              const isSelected = serviceId === srv.id;
              const srvIsPiece = srv.pricingType === 'piece' || srv.unit === 'piece';
              const unitLabel = srvIsPiece ? (srv.unit || 'piece') : 'KG';

              return (
                <div
                  key={srv.id}
                  onClick={() => {
                    setServiceId(srv.id);
                    if (srv.sameDayAvailable === false && turnaroundSpeed === 'same_day') {
                      setTurnaroundSpeed('standard_48h');
                    }
                  }}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition flex flex-col justify-between ${
                    isSelected
                      ? 'border-sky-600 bg-sky-50/60 shadow-sm ring-1 ring-sky-500'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div>
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-extrabold text-sm text-slate-900">{srv.name}</span>
                          <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                            srvIsPiece ? 'bg-amber-100 text-amber-800' : 'bg-sky-100 text-sky-800'
                          }`}>
                            {srvIsPiece ? '🛏️ Per Piece' : '🧺 By Weight'}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 font-medium">{srv.nameTh}</div>
                      </div>
                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-sky-600 text-white flex items-center justify-center shrink-0">
                          <Icon name="check" className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>

                    <p className="text-[11px] text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                      {srv.description}
                    </p>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-200/70 space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-600 font-medium">Standard (48h):</span>
                      <span className="font-extrabold text-slate-800">฿{srvStd} / {unitLabel}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-sky-700 font-medium">Next Day (24h):</span>
                      <span className="font-extrabold text-sky-700">฿{srvNext} / {unitLabel}</span>
                    </div>
                    {srv.sameDayAvailable !== false ? (
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-amber-800 font-medium flex items-center gap-0.5">
                          <span>🚀 Same Day (&lt;18h):</span>
                        </span>
                        <span className="font-extrabold text-amber-700">฿{srvSame} / {unitLabel}</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span>🚀 Same Day:</span>
                        <span>N/A</span>
                      </div>
                    )}

                    <div className="text-[10px] text-slate-400 pt-1 font-mono">
                      {srvIsPiece ? `Min quantity: ${srv.minWeightKg || 1} ${unitLabel}` : `Min billable: ${srv.minWeightKg || 4.0} KG`}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Turnaround Speed Selection (3-Tier Options) */}
          <div className="space-y-2.5 pt-1">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
              Select Turnaround Speed *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              {/* Option 1: Standard 48 Hours */}
              <div
                onClick={() => setTurnaroundSpeed('standard_48h')}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition flex items-start gap-3 ${
                  activeSpeed === 'standard_48h'
                    ? 'border-slate-800 bg-slate-100/70 shadow-sm ring-1 ring-slate-800'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                  activeSpeed === 'standard_48h' ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-400'
                }`}>
                  {activeSpeed === 'standard_48h' && <Icon name="check" className="w-3.5 h-3.5" />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 flex-wrap">
                    <span className="font-extrabold text-slate-900 text-xs sm:text-sm">
                      🕒 Standard 48h
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-800 font-bold text-xs">
                      ฿{standardRate} / {isPiece ? (currentService.unit || 'pc') : 'KG'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                    Economical standard service. Picked up on schedule, returned within 48 hours (~2 days).
                  </p>
                  <div className="mt-2 text-[10px] text-slate-600 font-semibold flex items-center gap-1">
                    <Icon name="clock" className="w-3 h-3" />
                    <span>~48 Hours Turnaround</span>
                  </div>
                </div>
              </div>

              {/* Option 2: Next Day 24 Hours */}
              <div
                onClick={() => setTurnaroundSpeed('next_day_24h')}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition flex items-start gap-3 ${
                  activeSpeed === 'next_day_24h'
                    ? 'border-sky-600 bg-sky-50/70 shadow-sm ring-1 ring-sky-500'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                  activeSpeed === 'next_day_24h' ? 'border-sky-600 bg-sky-600 text-white' : 'border-slate-400'
                }`}>
                  {activeSpeed === 'next_day_24h' && <Icon name="check" className="w-3.5 h-3.5" />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 flex-wrap">
                    <span className="font-extrabold text-slate-900 text-xs sm:text-sm">
                      ⚡ Next Day 24h
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 font-bold text-xs">
                      ฿{nextDayRate} / {isPiece ? (currentService.unit || 'pc') : 'KG'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                    Fast 24-hour turnaround. Picked up tomorrow morning, returned clean next day evening.
                  </p>
                  <div className="mt-2 text-[10px] text-sky-700 font-semibold flex items-center gap-1">
                    <Icon name="clock" className="w-3 h-3" />
                    <span>~24 Hours Turnaround</span>
                  </div>
                </div>
              </div>

              {/* Option 3: Same Day Express */}
              <div
                onClick={() => {
                  if (isSameDayAvailable) setTurnaroundSpeed('same_day');
                }}
                className={`p-4 rounded-2xl border-2 transition flex items-start gap-3 relative ${
                  !isSameDayAvailable
                    ? 'opacity-50 border-slate-200 bg-slate-50 cursor-not-allowed'
                    : activeSpeed === 'same_day'
                    ? 'border-amber-500 bg-amber-50/80 shadow-sm ring-1 ring-amber-500 cursor-pointer'
                    : 'border-slate-200 hover:border-amber-300 bg-white cursor-pointer'
                }`}
              >
                <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                  activeSpeed === 'same_day' ? 'border-amber-500 bg-amber-500 text-white' : 'border-slate-400'
                }`}>
                  {activeSpeed === 'same_day' && <Icon name="check" className="w-3.5 h-3.5" />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 flex-wrap">
                    <span className="font-extrabold text-slate-900 text-xs sm:text-sm flex items-center gap-1">
                      <span>🚀 Same Day</span>
                      <span className="text-[9px] uppercase font-bold bg-amber-200 text-amber-900 px-1 py-0.2 rounded">&lt;18:00</span>
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold text-xs">
                      ฿{sameDayRate} / {isPiece ? (currentService.unit || 'pc') : 'KG'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                    Morning pickup, delivered anytime before 18:00 hrs today!
                  </p>
                  <div className="mt-2 text-[10px] text-amber-800 font-semibold flex items-center gap-1">
                    <Icon name="clock" className="w-3 h-3" />
                    <span>Before 18:00 hrs Today</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Pricing Controls: Quantity Counter for Piece Items vs Weight Slider for KG Items */}
          {isPiece ? (
            <div className="bg-gradient-to-r from-sky-50 to-indigo-50/60 p-5 rounded-2xl border border-sky-200/80 space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <label className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                    <Icon name="bed" className="w-4 h-4 text-sky-600" />
                    <span>Item Quantity ({currentService.unit || 'Piece'})</span>
                  </label>
                  <p className="text-[11px] text-slate-500">
                    Select the number of {currentService.name.toLowerCase()} items to process
                  </p>
                </div>

                {/* Quantity Counter */}
                <div className="flex items-center gap-3 bg-white px-3 py-1.5 rounded-xl border border-slate-300 shadow-2xs">
                  <button
                    type="button"
                    onClick={() => setPieceQuantity(prev => Math.max(1, prev - 1))}
                    className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-base flex items-center justify-center transition active:scale-95"
                  >
                    -
                  </button>
                  <span className="w-12 text-center text-lg font-black text-slate-900 font-mono">
                    {pieceQuantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setPieceQuantity(prev => Math.min(50, prev + 1))}
                    className="w-8 h-8 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold text-base flex items-center justify-center transition active:scale-95"
                  >
                    +
                  </button>
                  <span className="text-xs font-bold text-slate-600 pr-1">
                    {currentService.unit || 'pc'}
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-sky-200/60 flex items-center justify-between text-sm">
                <div>
                  <span className="font-semibold text-slate-700 block">Service Subtotal:</span>
                  <span className="text-[11px] text-slate-500">
                    {pieceQuantity} {currentService.unit || 'pieces'} × ฿{priceRate} / {currentService.unit || 'pc'} ({activeSpeed === 'same_day' ? 'Same Day' : activeSpeed === 'next_day_24h' ? 'Next Day' : 'Standard 48h'})
                  </span>
                </div>
                <span className={`text-2xl font-black ${activeSpeed === 'same_day' ? 'text-amber-600' : 'text-sky-600'}`}>
                  ฿{estimatedTotal} THB
                </span>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                  Estimated Laundry Weight (KG)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    max="30"
                    step="0.5"
                    value={estimatedWeightKg}
                    onChange={(e) => setEstimatedWeightKg(parseFloat(e.target.value) || 1)}
                    className="w-20 px-2 py-1 bg-white border border-slate-300 rounded-lg text-sm font-bold text-center text-slate-900"
                  />
                  <span className="text-xs font-bold text-slate-600">KG</span>
                </div>
              </div>

              <input
                type="range"
                min="1.0"
                max="20.0"
                step="0.5"
                value={estimatedWeightKg}
                onChange={(e) => setEstimatedWeightKg(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-600"
              />

              <div className="flex items-center justify-between text-xs text-slate-500 pt-1 flex-wrap gap-2">
                <span>Selected: <strong>{estimatedWeightKg} KG</strong></span>
                <span>Min Billed: <strong>{minWeight} KG</strong></span>
                <span>
                  Active Rate: <strong className={activeSpeed === 'same_day' ? 'text-amber-800' : 'text-sky-700'}>
                    ฿{priceRate}/KG ({activeSpeed === 'same_day' ? '⚡ Same Day' : '🕒 Next Day'})
                  </strong>
                </span>
              </div>

              {Number(estimatedWeightKg) < minWeight && (
                <p className="text-xs text-amber-800 bg-amber-50 p-2.5 rounded-xl border border-amber-200 flex items-center gap-2">
                  <Icon name="shieldAlert" className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>
                    The minimum weight for <strong>{currentService.name}</strong> is {minWeight} KG. Your order will be billed for at least {minWeight} KG (฿{minWeight * priceRate} THB).
                  </span>
                </p>
              )}

              <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-sm">
                <div>
                  <span className="font-semibold text-slate-700 block">Estimated Total:</span>
                  <span className="text-[11px] text-slate-400">
                    {billableAmount} KG × ฿{priceRate}/KG ({activeSpeed === 'same_day' ? 'Same Day' : 'Next Day'})
                  </span>
                </div>
                <span className={`text-2xl font-black ${activeSpeed === 'same_day' ? 'text-amber-600' : 'text-sky-600'}`}>
                  ฿{estimatedTotal} THB
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                * Official weight is verified on certified digital scales at our central Bangkok facility.
              </p>
            </div>
          )}
        </div>

        {/* Step 2: Digital Contact Information (WhatsApp / LINE / Email) */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-7 h-7 rounded-full bg-sky-600 text-white font-bold text-xs flex items-center justify-center">2</span>
            <h2 className="text-lg font-bold text-slate-900">Digital Contact Channel</h2>
          </div>
          <p className="text-xs text-slate-500 mb-6">
            We send pickup alerts, scale weigh-in confirmations, and invoices digitally. No telephone calls.
          </p>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex Thorne / Somchai Prasert"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nickname / Preferred Name (ชื่อเล่น)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Alex / Som"
                  value={nickName}
                  onChange={(e) => setNickName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Preferred Online Channel <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'line', label: 'LINE OA', icon: 'line', color: 'green' },
                  { id: 'whatsapp', label: 'WhatsApp', icon: 'whatsapp', color: 'emerald' },
                  { id: 'email', label: 'Email', icon: 'mail', color: 'sky' }
                ].map((ch) => (
                  <button
                    key={ch.id}
                    type="button"
                    onClick={() => setContactChannel(ch.id)}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition ${
                      contactChannel === ch.id
                        ? 'border-green-600 bg-green-50 text-green-950 shadow-sm ring-1 ring-green-500'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Icon name={ch.icon} className="w-4 h-4" />
                    <span>{ch.label}</span>
                  </button>
                ))}
              </div>

              {contactChannel === 'line' && (
                <div className="mt-3 p-3 bg-green-50/70 border border-green-200 rounded-xl text-xs text-green-900 flex items-start gap-2">
                  <Icon name="line" className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>LINE OA Notice:</strong> Businesses cannot add private LINE users directly. After submitting this booking, you will be prompted with a 1-click button to add <strong>{lineOaId}</strong> and send your Booking ID.
                  </span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {contactChannel === 'whatsapp' ? 'WhatsApp Phone Number' : contactChannel === 'line' ? 'Your LINE ID or Phone Number' : 'Email Address'} <span className="text-red-500">*</span>
                </label>
                {contactChannel === 'whatsapp' ? (
                  <CountryPhoneInput
                    defaultCountryCode="TH"
                    value={contactValue}
                    onChange={(val) => setContactValue(val)}
                    placeholder="08x-xxx-xxxx"
                    required
                  />
                ) : (
                  <input
                    type="text"
                    required
                    placeholder={contactChannel === 'line' ? '@yourlineid or 0812345678' : 'user@example.com'}
                    value={contactValue}
                    onChange={(e) => setContactValue(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-sm"
                  />
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Email (Optional for e-Receipt)
                </label>
                <input
                  type="email"
                  placeholder="receipt@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-sm"
                />
              </div>
            </div>

            {/* Thai Company Tax Invoice Section */}
            <div className="pt-3 border-t border-slate-100">
              <label className="flex items-center gap-2.5 cursor-pointer text-xs font-bold text-slate-800">
                <input
                  type="checkbox"
                  checked={isCompanyTax}
                  onChange={(e) => setIsCompanyTax(e.target.checked)}
                  className="w-4 h-4 text-sky-600 rounded border-slate-300 focus:ring-sky-500"
                />
                <span className="flex items-center gap-1.5">
                  <Icon name="building2" className="w-3.5 h-3.5 text-slate-500" />
                  <span>Request Thai Corporate Tax Receipt (ขอใบกำกับภาษีเต็มรูปแบบ)</span>
                </span>
              </label>

              {isCompanyTax && (
                <div className="mt-3 p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                  <p className="text-[11px] text-slate-500">
                    Official tax deduction receipt will be issued and synced into your customer profile.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Company Name (ชื่อนิติบุคคล) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required={isCompanyTax}
                        placeholder="e.g. Siam Hospitality Co., Ltd."
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        13-Digit Tax ID (เลขประจำตัวผู้เสียภาษี) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required={isCompanyTax}
                        maxLength="13"
                        placeholder="e.g. 0105558123456"
                        value={companyTaxId}
                        onChange={(e) => setCompanyTaxId(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono bg-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Branch / Office (สำนักงานใหญ่ / เลขที่สาขา)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Head Office (สำนักงานใหญ่)"
                      value={companyBranch}
                      onChange={(e) => setCompanyBranch(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Step 3: Bangkok Address & Condo Info */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200">
          <div className="flex items-center gap-2.5 mb-2">
            <span className="w-7 h-7 rounded-full bg-sky-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">3</span>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Bangkok Location & Schedule</h2>
              <p className="text-xs text-slate-500">
                Specify your Bangkok residence details and preferred pickup schedule.
              </p>
            </div>
          </div>

          <div className="mt-5 space-y-4">
            {/* Section 1: Location & Residence Details Card */}
            <div className="bg-slate-50/80 border border-slate-200/90 rounded-2xl p-4 sm:p-5 space-y-4 shadow-2xs">
              <div className="flex items-center justify-between pb-2.5 border-b border-slate-200/80">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-sky-100 text-sky-600 flex items-center justify-center text-xs font-bold">
                    📍
                  </span>
                  <span className="text-xs font-black uppercase tracking-wider text-slate-800">
                    Pickup Location & Residence
                  </span>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white border border-slate-200 text-[11px] font-semibold text-slate-600 shadow-2xs">
                  <span className="font-bold text-xs">
                    <span className="text-blue-500">G</span>
                    <span className="text-red-500">o</span>
                    <span className="text-yellow-500">o</span>
                    <span className="text-blue-500">g</span>
                    <span className="text-green-500">l</span>
                    <span className="text-red-500">e</span>
                  </span>
                  <span className="text-[10px] text-slate-400">Maps Powered</span>
                </div>
              </div>

              {/* Primary Search: Condominium / Building / House */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Condominium / Building / House Name <span className="text-red-500">*</span>
                </label>
                <GoogleMapsCondoAutocomplete
                  value={condoName}
                  onChange={(val) => setCondoName(val)}
                  district={district}
                  onDistrictChange={(newDist) => {
                    setDistrict(newDist);
                    if (DISTRICT_TO_POSTAL_CODE[newDist]) {
                      setPostalCode(DISTRICT_TO_POSTAL_CODE[newDist]);
                    }
                  }}
                  onSelectPlace={(place) => {
                    if (place.district) {
                      setDistrict(place.district);
                      if (DISTRICT_TO_POSTAL_CODE[place.district]) {
                        setPostalCode(DISTRICT_TO_POSTAL_CODE[place.district]);
                      }
                    }
                    if (place.zipcode) {
                      setPostalCode(place.zipcode);
                    }
                  }}
                  apiKey={laundryStore.settings?.googleMapsApiKey || ''}
                  placeholder="Search condo name, e.g. Ideo Q Sukhumvit 36 / Rhythm Sathorn..."
                  required
                />
              </div>

              {/* 3-Column Responsive Grid: Bangkok District, Postal Code & Unit */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-slate-700">
                      Bangkok District <span className="text-red-500">*</span>
                    </label>
                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/60">
                      Auto-synced
                    </span>
                  </div>
                  <select
                    value={district}
                    onChange={(e) => {
                      const newDist = e.target.value;
                      setDistrict(newDist);
                      if (DISTRICT_TO_POSTAL_CODE[newDist]) {
                        setPostalCode(DISTRICT_TO_POSTAL_CODE[newDist]);
                      }
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-xs sm:text-sm bg-white font-medium text-slate-800 shadow-2xs"
                  >
                    {BANGKOK_DISTRICTS.map((d, i) => (
                      <option key={i} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-slate-700">
                      Postal Code <span className="text-red-500">*</span>
                    </label>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                      deliveryInfo.isFree 
                        ? 'text-emerald-700 bg-emerald-50 border-emerald-200' 
                        : 'text-sky-700 bg-sky-50 border-sky-200'
                    }`}>
                      {deliveryInfo.isFree ? 'FREE' : `฿${deliveryInfo.fee}`} Fee
                    </span>
                  </div>
                  <input
                    type="text"
                    required
                    pattern="[0-9]{5}"
                    placeholder="e.g. 10110"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value.replace(/[^0-9]/g, ''))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-xs sm:text-sm bg-white font-mono font-bold text-slate-900 shadow-2xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Tower / Floor / Unit
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Tower B, Rm 1402"
                    value={roomNumber}
                    onChange={(e) => setRoomNumber(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-xs sm:text-sm bg-white shadow-2xs"
                  />
                </div>
              </div>

              {/* Delivery Fee Notice Banner */}
              <div className="p-3 rounded-xl bg-white border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 text-xs shadow-2xs">
                <div className="flex items-center gap-2.5">
                  <span className="w-8 h-8 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-sm shrink-0">
                    🚚
                  </span>
                  <div>
                    <span className="font-bold text-slate-900 block">
                      Pickup & Delivery: {deliveryInfo.isFree ? (
                        <span className="text-emerald-600 font-black">FREE (฿0)</span>
                      ) : (
                        <span className="text-sky-600 font-black">฿{deliveryInfo.fee} THB</span>
                      )}
                    </span>
                    <span className="text-[11px] text-slate-500 block">
                      Bangkok Postal Code {postalCode} · {deliveryInfo.district} ({deliveryInfo.reason || 'Fixed zone rate'})
                    </span>
                  </div>
                </div>
                {deliveryInfo.isFree ? (
                  <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[11px] border border-emerald-200">
                    Free Delivery Qualified
                  </span>
                ) : (
                  <span className="text-[11px] text-slate-400 font-medium">
                    Added to order total
                  </span>
                )}
              </div>

              {/* Condo Juristic Dropoff Card */}
              <div 
                onClick={() => setLeaveWithJuristic(!leaveWithJuristic)}
                className={`p-3.5 rounded-xl border transition cursor-pointer flex items-start gap-3 select-none ${
                  leaveWithJuristic 
                    ? 'bg-sky-50/80 border-sky-300 shadow-2xs' 
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="mt-0.5">
                  <input
                    type="checkbox"
                    checked={leaveWithJuristic}
                    onChange={(e) => setLeaveWithJuristic(e.target.checked)}
                    onClick={(e) => e.stopPropagation()}
                    className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500 border-slate-300 cursor-pointer"
                  />
                </div>
                <div className="flex-1 text-xs">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-slate-900">
                      Drop-off / Collect at Condo Juristic Office or Front Lobby
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 border border-sky-200">
                      Recommended
                    </span>
                  </div>
                  <p className="text-slate-600 mt-1 leading-relaxed text-[11px]">
                    Driver collects & returns directly at your building's reception or juristic desk without disturbing you. Tag your laundry bag with your name.
                  </p>
                </div>
              </div>
            </div>

            {/* Section 2: Pickup Schedule & Turnaround Card */}
            <div className="bg-slate-50/80 border border-slate-200/90 rounded-2xl p-4 sm:p-5 space-y-4 shadow-2xs">
              <div className="flex items-center justify-between pb-2.5 border-b border-slate-200/80">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold">
                    🕒
                  </span>
                  <span className="text-xs font-black uppercase tracking-wider text-slate-800">
                    Pickup Schedule & Turnaround Speed
                  </span>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  activeSpeed === 'same_day' 
                    ? 'bg-amber-100 text-amber-900 border border-amber-300' 
                    : activeSpeed === 'next_day_24h'
                    ? 'bg-sky-100 text-sky-900 border border-sky-300'
                    : 'bg-slate-200 text-slate-800 border border-slate-300'
                }`}>
                  {activeSpeed === 'same_day' ? '🚀 Same-Day Express' : activeSpeed === 'next_day_24h' ? '⚡ Next-Day 24H' : 'Standard 48H'}
                </span>
              </div>

              {/* 3-Tier Turnaround Schedule Banner */}
              {activeSpeed === 'same_day' ? (
                <div className="p-3 bg-amber-50/90 border border-amber-200 rounded-xl flex items-start gap-2.5">
                  <span className="text-base">🚀</span>
                  <div className="text-xs text-amber-950">
                    <span className="font-bold block">Same Day Express: Return scheduled before 18:00 hrs today</span>
                    <span className="text-[11px] text-amber-900/80 mt-0.5 block leading-relaxed">
                      Pickup during your morning window. Your freshly washed and processed laundry will be returned to your condo <strong>before 18:00 hrs today</strong>.
                    </span>
                  </div>
                </div>
              ) : activeSpeed === 'next_day_24h' ? (
                <div className="p-3 bg-sky-50/90 border border-sky-200 rounded-xl flex items-start gap-2.5">
                  <span className="text-base">⚡</span>
                  <div className="text-xs text-sky-950">
                    <span className="font-bold block">Next Day Return: Delivered in ~24 hours</span>
                    <span className="text-[11px] text-sky-900/80 mt-0.5 block leading-relaxed">
                      Pickup on your scheduled date and returned fresh, sealed, and packaged within 24 hours.
                    </span>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-white border border-slate-200 rounded-xl flex items-start gap-2.5">
                  <span className="text-base">🕒</span>
                  <div className="text-xs text-slate-800">
                    <span className="font-bold block">Standard Turnaround: Return in ~48 hours (2 Days)</span>
                    <span className="text-[11px] text-slate-500 mt-0.5 block leading-relaxed">
                      Pickup on your scheduled date and delivery returned fresh and sealed in 48 hours (~2 days).
                    </span>
                  </div>
                </div>
              )}

              {/* Date & Time Picker (2-Columns) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Pickup Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={pickupDate}
                    onChange={(e) => setPickupDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-xs sm:text-sm bg-white font-medium shadow-2xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Preferred Pickup Window <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={pickupTime}
                    onChange={(e) => setPickupTime(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-xs sm:text-sm bg-white font-medium text-slate-800 shadow-2xs"
                  >
                    {TIME_SLOTS.map((slot, i) => (
                      <option key={i} value={slot}>{slot}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Special Notes */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Special Care or Delivery Notes (Optional)
                  </label>
                  <span className="text-[10px] text-slate-400">Juristic staff name, fabric care</span>
                </div>
                <textarea
                  rows="2"
                  placeholder="e.g. Leave with K. Somchai at front desk. Please avoid high-heat tumble dry for gym shirts."
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-xs sm:text-sm bg-white placeholder:text-slate-400 shadow-2xs"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Step 4: Terms & Conditions Review and Mandatory Checkbox */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border-2 border-slate-300 space-y-4">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center">4</span>
            <h2 className="text-lg font-bold text-slate-900">Terms & Conditions Review</h2>
          </div>

          {/* Prompt to read summary */}
          <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <Icon name="phoneOff" className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-900">
                <span className="font-bold block text-sm">Key Operating Notice: Online-Only Support</span>
                All support, questions, and incident claims are handled via WhatsApp, LINE, or Email. No phone calls are handled.
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsTermsModalOpen(true)}
              className="w-full sm:w-auto shrink-0 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-sm transition flex items-center justify-center gap-1.5"
            >
              <Icon name="fileText" className="w-4 h-4" />
              <span>{hasReviewedSummary ? 'Review Summary Again' : 'Read Summary of Terms'}</span>
            </button>
          </div>

          {/* Mandatory Agreement Checkbox */}
          <div className={`p-4 rounded-2xl border-2 transition ${
            agreedToTerms ? 'border-emerald-500 bg-emerald-50/40' : 'border-slate-300 bg-slate-50'
          }`}>
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                required
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="mt-1 w-5 h-5 rounded text-sky-600 focus:ring-sky-500 border-slate-400 cursor-pointer"
              />
              <div className="text-xs text-slate-800 leading-relaxed">
                <strong className="text-slate-900 block font-bold text-sm mb-1">
                  I Agree to the Terms and Conditions <span className="text-red-600">*</span>
                </strong>
                I have read, understood, and agreed to the{' '}
                <button
                  type="button"
                  onClick={() => setIsTermsModalOpen(true)}
                  className="text-sky-600 font-bold underline hover:text-sky-800"
                >
                  Important Terms & Conditions
                </button>
                , including the policy that <strong>all customer support, status tracking, and incident claims are conducted strictly online (WhatsApp, LINE, or Email) with NO telephone call service</strong>, and that final billing is subject to central facility digital scale weigh-in.
              </div>
            </label>
          </div>

          {/* Error Message Box */}
          {errorMessage && (
            <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-800 font-semibold flex items-center gap-2">
              <Icon name="alertTriangle" className="w-4 h-4 text-red-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Order Pricing Breakdown with Postal Code Delivery Fee */}
          <div className="p-4 bg-slate-50/90 rounded-2xl border border-slate-200 text-xs space-y-2">
            <div className="font-bold text-slate-800 text-[11px] uppercase tracking-wider flex items-center justify-between">
              <span>Order Estimated Breakdown</span>
              <span className="text-slate-400 font-mono font-normal">Bangkok Postal Code: {postalCode}</span>
            </div>
            <div className="flex items-center justify-between text-slate-600">
              <span>{currentService.name} ({isPiece ? `${billableAmount} ${currentService.unit || 'pieces'} × ฿${priceRate}/${currentService.unit || 'pc'}` : `${billableAmount} KG × ฿${priceRate}/KG`}):</span>
              <span className="font-semibold text-slate-800">฿{estimatedTotal} THB</span>
            </div>
            <div className="flex items-center justify-between text-slate-600">
              <span className="flex items-center gap-1.5">
                <span>Fixed Pickup & Delivery ({deliveryInfo.district} - {postalCode}):</span>
                {deliveryInfo.isFree && (
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                    Free Promo
                  </span>
                )}
              </span>
              <span className={`font-semibold ${deliveryInfo.isFree ? 'text-emerald-600 font-bold' : 'text-slate-800'}`}>
                {deliveryInfo.isFree ? 'FREE (฿0)' : `฿${deliveryInfo.fee} THB`}
              </span>
            </div>
            <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-sm font-black text-slate-900">
              <span>Total Estimated Booking:</span>
              <span className="text-sky-600 text-base">฿{grandEstimatedTotal} THB</span>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || !agreedToTerms}
            className={`w-full py-4 px-6 rounded-2xl font-black text-base transition shadow-xl flex items-center justify-center gap-2 ${
              agreedToTerms
                ? 'bg-gradient-to-r from-sky-600 to-teal-600 hover:from-sky-500 hover:to-teal-500 text-white shadow-sky-600/30 cursor-pointer'
                : 'bg-slate-300 text-slate-500 cursor-not-allowed'
            }`}
          >
            {isSubmitting ? (
              <span>Generating Bangkok Order...</span>
            ) : (
              <>
                <Icon name="check" className="w-5 h-5" />
                <span>Confirm & Submit Booking (Est. ฿{grandEstimatedTotal} THB)</span>
              </>
            )}
          </button>

          <p className="text-[11px] text-center text-slate-400">
            You will receive a unique tracking ID and 1-click button to connect with our LINE Official Account immediately.
          </p>

        </div>

      </form>
    </div>
  );
}
