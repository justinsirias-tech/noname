import React, { useState, useEffect } from 'react';
import { Icon } from './Icons.jsx';
import { BANGKOK_DISTRICTS, TIME_SLOTS } from '../data/servicesData.js';
import { TermsModal } from './TermsModal.jsx';
import { getLineOaMessageUrl, getLineOaAddFriendUrl, getLineQrCodeUrl, laundryStore } from '../store.js';
import { CountryPhoneInput } from './CountryPhoneInput.jsx';
import { GooglePlaceAutocompleteInput } from './GooglePlaceAutocompleteInput.jsx';
import { LocationPicker } from './LocationPicker.jsx';

export function BookingWizard({ services, initialServiceId, initialWeight, initialCustomer, onBookingSuccess, onViewFullTerms }) {
  const [serviceId, setServiceId] = useState(initialServiceId || services[0]?.id || 'wash_fold');
  const [estimatedWeightKg, setEstimatedWeightKg] = useState(initialWeight || 4.0);
  const [turnaroundSpeed, setTurnaroundSpeed] = useState('standard_48h'); // 'standard_48h', 'next_day_24h', 'same_day'
  
  // Customer Info (prefilled from initialCustomer if available)
  const [customerName, setCustomerName] = useState(initialCustomer?.fullName || '');
  const [nickName, setNickName] = useState(initialCustomer?.nickName || '');
  const [contactChannel, setContactChannel] = useState(
    initialCustomer?.lineId ? 'line' : (initialCustomer?.mobileNumber ? 'whatsapp' : 'line')
  );
  const [contactValue, setContactValue] = useState(
    initialCustomer?.lineId || initialCustomer?.mobileNumber || ''
  );
  const [email, setEmail] = useState(initialCustomer?.email || '');

  // Thai Company Tax Info
  const [isCompanyTax, setIsCompanyTax] = useState(Boolean(initialCustomer?.companyTax?.required));
  const [companyName, setCompanyName] = useState(initialCustomer?.companyTax?.companyName || '');
  const [companyTaxId, setCompanyTaxId] = useState(initialCustomer?.companyTax?.taxId || '');
  const [companyBranch, setCompanyBranch] = useState(initialCustomer?.companyTax?.branch || 'Head Office (สำนักงานใหญ่)');

  // Bangkok Address Info
  const primaryAddr = initialCustomer?.addresses?.[0];
  const [district, setDistrict] = useState(primaryAddr?.district || BANGKOK_DISTRICTS[0]);
  const [condoName, setCondoName] = useState(primaryAddr?.label || primaryAddr?.address || '');
  const [roomNumber, setRoomNumber] = useState(primaryAddr?.roomNumber || '');
  const [googleMapsUrl, setGoogleMapsUrl] = useState(primaryAddr?.googleMapsUrl || '');
  const [leaveWithJuristic, setLeaveWithJuristic] = useState(primaryAddr?.leaveWithJuristic !== undefined ? primaryAddr.leaveWithJuristic : true);

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

  // Update selected service if props change
  useEffect(() => {
    if (initialServiceId) setServiceId(initialServiceId);
    if (initialWeight) setEstimatedWeightKg(initialWeight);
  }, [initialServiceId, initialWeight]);

  const currentService = services.find(s => s.id === serviceId) || services[0];
  const isSameDayAvailable = currentService?.sameDayAvailable !== false;
  const minWeight = Number(currentService?.minWeightKg || 4.0);
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

  const billableWeight = Math.max(Number(estimatedWeightKg), minWeight);
  const estimatedTotal = Math.round(billableWeight * priceRate);

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
      condoName: condoName.trim(),
      roomNumber: roomNumber.trim(),
      googleMapsUrl: googleMapsUrl ? googleMapsUrl.trim() : '',
      leaveWithJuristic,
      estimatedWeightKg: Number(estimatedWeightKg),
      pricePerKg: priceRate,
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
        
        {/* Step 1: Select Service & Weight */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-6">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-full bg-sky-600 text-white font-bold text-xs flex items-center justify-center">1</span>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Service & Turnaround Speed</h2>
              <p className="text-xs text-slate-500">Select your laundry service and preferred turnaround speed. All billing is strictly by weight (KG).</p>
            </div>
          </div>

          {/* Service Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {services.map((srv) => {
              const srvStd = srv.standardPricePerKg || srv.pricePerKg || 65;
              const srvNext = srv.nextDayPricePerKg || Math.round(srvStd * 1.3);
              const srvSame = srv.sameDayPricePerKg || Math.round(srvStd * 1.75);
              const isSelected = serviceId === srv.id;

              return (
                <div
                  key={srv.id}
                  onClick={() => {
                    setServiceId(srv.id);
                    if (srv.sameDayAvailable === false && turnaroundSpeed === 'same_day') {
                      setTurnaroundSpeed('standard_48h');
                    }
                  }}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition ${
                    isSelected
                      ? 'border-sky-600 bg-sky-50/60 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-extrabold text-sm text-slate-900">{srv.name}</div>
                      <div className="text-[11px] text-slate-500 font-medium">{srv.nameTh}</div>
                    </div>
                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-sky-600 text-white flex items-center justify-center shrink-0">
                        <Icon name="check" className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-200/70 space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-600 font-medium">Standard (48h):</span>
                      <span className="font-extrabold text-slate-800">฿{srvStd} / KG</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-sky-700 font-medium">Next Day (24h):</span>
                      <span className="font-extrabold text-sky-700">฿{srvNext} / KG</span>
                    </div>
                    {srv.sameDayAvailable !== false ? (
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-amber-800 font-medium flex items-center gap-0.5">
                          <span>🚀 Same Day (&lt;18h):</span>
                        </span>
                        <span className="font-extrabold text-amber-700">฿{srvSame} / KG</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span>🚀 Same Day:</span>
                        <span>N/A</span>
                      </div>
                    )}
                  </div>

                  <div className="text-[11px] text-slate-400 mt-2 font-mono">
                    Min weight: {srv.minWeightKg || 4.0} KG
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
                      ฿{standardRate}/KG
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
                      ฿{nextDayRate}/KG
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
                      ฿{sameDayRate}/KG
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

          {/* Weight Slider */}
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
                  {billableWeight} KG × ฿{priceRate}/KG ({activeSpeed === 'same_day' ? 'Same Day' : 'Next Day'})
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
          <div className="flex items-center gap-2 mb-2">
            <span className="w-7 h-7 rounded-full bg-sky-600 text-white font-bold text-xs flex items-center justify-center">3</span>
            <h2 className="text-lg font-bold text-slate-900">Bangkok Location & Schedule</h2>
          </div>
          <p className="text-xs text-slate-500 mb-6">
            Specify your Bangkok district and condo details for easy pickup.
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Bangkok District <span className="text-red-500">*</span>
              </label>
              <select
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-sm bg-white"
              >
                {BANGKOK_DISTRICTS.map((d, i) => (
                  <option key={i} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                  <span>Condominium / Building / House Name <span className="text-red-500">*</span></span>
                  <span className="text-[10px] text-sky-600 font-semibold">Auto-detects District</span>
                </label>
                <GooglePlaceAutocompleteInput
                  value={condoName}
                  onChange={(e) => setCondoName(e.target.value)}
                  onPlaceSelect={(place) => {
                    setCondoName(place.condoName);
                    if (place.district) setDistrict(place.district);
                    if (place.googleMapsUrl) setGoogleMapsUrl(place.googleMapsUrl);
                  }}
                  placeholder="e.g. Ideo Q Sukhumvit 36 / Rhythm Sathorn"
                  required
                />
                {googleMapsUrl && (
                  <div className="mt-1">
                    <a
                      href={googleMapsUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] text-sky-600 hover:text-sky-700 underline font-medium"
                    >
                      <span>📍 View confirmed location on Google Maps</span>
                    </a>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tower / Floor / Room Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. Tower B, Floor 14, Room 1402"
                  value={roomNumber}
                  onChange={(e) => setRoomNumber(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-sm"
                />
              </div>
            </div>

            {/* Interactive Location Picker: Share GPS or Pin on Map */}
            <LocationPicker
              value={googleMapsUrl}
              onChange={(url) => setGoogleMapsUrl(url)}
              onLocationSelect={({ lat, lng, googleMapsUrl: newUrl, district: detectedDistrict, condoName: detectedCondo }) => {
                setGoogleMapsUrl(newUrl);
                if (detectedDistrict) {
                  setDistrict(detectedDistrict);
                }
                if (detectedCondo && (!condoName || condoName.trim() === '')) {
                  setCondoName(detectedCondo);
                }
              }}
              initialDistrict={district}
              label="Google Maps Location & Condo Pin (ตำแหน่งคอนโด หรือแชร์พิกัด GPS)"
            />

            {/* Condo Juristic Dropoff Checkbox */}
            <div className="p-4 bg-sky-50/60 rounded-2xl border border-sky-200/80">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={leaveWithJuristic}
                  onChange={(e) => setLeaveWithJuristic(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded text-sky-600 focus:ring-sky-500 border-slate-300"
                />
                <div className="text-xs">
                  <span className="font-bold text-slate-900 block">
                    Drop-off / Collect at Condo Juristic Office or Front Lobby
                  </span>
                  <span className="text-slate-600">
                    Recommended: Driver collects directly from reception without disturbing you. Please tag your bag with your Name.
                  </span>
                </div>
              </label>
            </div>

            {/* 3-Tier Turnaround Schedule Banner */}
            {activeSpeed === 'same_day' ? (
              <div className="p-4 bg-amber-50 border border-amber-300 rounded-2xl flex items-start gap-3">
                <span className="text-xl">🚀</span>
                <div className="text-xs text-amber-950">
                  <span className="font-extrabold block text-sm">Same Day Express Delivery Active (Delivered Before 18:00 hrs)</span>
                  <span className="mt-0.5 block leading-relaxed">
                    Pickup is scheduled for your morning window. Your freshly washed and processed laundry will be returned to your condo front desk/Juristic <strong>anytime before 18:00 hrs today</strong>.
                  </span>
                </div>
              </div>
            ) : activeSpeed === 'next_day_24h' ? (
              <div className="p-4 bg-sky-50 border border-sky-200 rounded-2xl flex items-start gap-3">
                <span className="text-xl">⚡</span>
                <div className="text-xs text-sky-950">
                  <span className="font-extrabold block text-sm">Next Day Delivery Active (~24 Hours)</span>
                  <span className="mt-0.5 block leading-relaxed">
                    Pickup on your scheduled date and delivery completed the next day fresh and sealed to your condo within ~24 hours.
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-slate-50 border border-slate-300 rounded-2xl flex items-start gap-3">
                <span className="text-xl">🕒</span>
                <div className="text-xs text-slate-800">
                  <span className="font-extrabold block text-sm">Standard Service Turnaround (~48 Hours / 2 Days)</span>
                  <span className="mt-0.5 block leading-relaxed">
                    Pickup on your scheduled date and delivery returned fresh and sealed in 48 hours (~2 days) during afternoon or evening delivery.
                  </span>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Pickup Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={pickupDate}
                  onChange={(e) => setPickupDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Preferred Pickup Window <span className="text-red-500">*</span>
                </label>
                <select
                  value={pickupTime}
                  onChange={(e) => setPickupTime(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-sm bg-white"
                >
                  {TIME_SLOTS.map((slot, i) => (
                    <option key={i} value={slot}>{slot}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Special Care or Delivery Notes (Optional)
              </label>
              <textarea
                rows="2"
                placeholder="e.g. Leave with K. Somchai at front desk. Please avoid high-heat tumble dry for gym shirts."
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-sm"
              />
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
                <span>Confirm & Submit Booking (Est. ฿{estimatedTotal} THB)</span>
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
