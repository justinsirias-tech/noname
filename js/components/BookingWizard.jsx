import React, { useState, useEffect } from 'react';
import { Icon } from './Icons.jsx';
import { BANGKOK_DISTRICTS, TIME_SLOTS } from '../data/servicesData.js';
import { TermsModal } from './TermsModal.jsx';
import { getLineOaMessageUrl, getLineOaAddFriendUrl, getLineQrCodeUrl, laundryStore } from '../store.js';

export function BookingWizard({ services, initialServiceId, initialWeight, onBookingSuccess, onViewFullTerms }) {
  const [serviceId, setServiceId] = useState(initialServiceId || services[0]?.id || 'wash_fold');
  const [estimatedWeightKg, setEstimatedWeightKg] = useState(initialWeight || 4.0);
  
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

  // Update selected service if props change
  useEffect(() => {
    if (initialServiceId) setServiceId(initialServiceId);
    if (initialWeight) setEstimatedWeightKg(initialWeight);
  }, [initialServiceId, initialWeight]);

  const currentService = services.find(s => s.id === serviceId) || services[0];
  const minWeight = Number(currentService?.minWeightKg || 3);
  const priceRate = Number(currentService?.pricePerKg || 65);
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
      district,
      condoName: condoName.trim(),
      roomNumber: roomNumber.trim(),
      leaveWithJuristic,
      estimatedWeightKg: Number(estimatedWeightKg),
      pickupDate,
      pickupTime,
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
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-7 h-7 rounded-full bg-sky-600 text-white font-bold text-xs flex items-center justify-center">1</span>
            <h2 className="text-lg font-bold text-slate-900">Service & Weight Estimation</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            {services.map((srv) => (
              <div
                key={srv.id}
                onClick={() => setServiceId(srv.id)}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition ${
                  serviceId === srv.id
                    ? 'border-sky-600 bg-sky-50/60 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="font-extrabold text-sm text-slate-900">{srv.name}</div>
                  {serviceId === srv.id && (
                    <div className="w-5 h-5 rounded-full bg-sky-600 text-white flex items-center justify-center">
                      <Icon name="check" className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
                <div className="text-xs text-sky-700 font-semibold mt-1">
                  ฿{srv.pricePerKg} / KG
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  Min weight: {srv.minWeightKg} KG
                </div>
              </div>
            ))}
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

            <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
              <span>Selected: <strong>{estimatedWeightKg} KG</strong></span>
              <span>Min Billed: <strong>{minWeight} KG</strong></span>
              <span>Rate: <strong>฿{priceRate}/KG</strong></span>
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
              <span className="font-semibold text-slate-700">Estimated Total:</span>
              <span className="text-xl font-extrabold text-sky-600">
                ฿{estimatedTotal} THB
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              * Official weight is verified on certified scales at our central Bangkok facility.
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
                <input
                  type="text"
                  required
                  placeholder={contactChannel === 'whatsapp' ? '+66 81 234 5678' : contactChannel === 'line' ? '@yourlineid or 0812345678' : 'user@example.com'}
                  value={contactValue}
                  onChange={(e) => setContactValue(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-sm"
                />
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
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Condominium / Building / House Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ideo Q Sukhumvit 36 / Rhythm Sathorn"
                  value={condoName}
                  onChange={(e) => setCondoName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-sm"
                />
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
