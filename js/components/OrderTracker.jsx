import React, { useState, useEffect } from 'react';
import { Icon } from './Icons.jsx';
import { ORDER_STATUSES } from '../data/servicesData.js';
import { CONTACT_CHANNELS, getLineOaMessageUrl, getLineOaAddFriendUrl, getLineQrCodeUrl, generatePromptPayQrUrl, laundryStore } from '../store.js';

export function OrderTracker({ orders, initialTrackingId, onReportIncident }) {
  const [searchQuery, setSearchQuery] = useState(initialTrackingId || '');
  const [selectedOrderId, setSelectedOrderId] = useState(initialTrackingId || orders[0]?.id || '');
  
  // Incident Form State
  const [showIncidentForm, setShowIncidentForm] = useState(false);
  const [incidentSubject, setIncidentSubject] = useState('');
  const [incidentMessage, setIncidentMessage] = useState('');
  const [incidentSubmitted, setIncidentSubmitted] = useState(false);

  // LINE OA Desktop QR Code toggle
  const [showLineQr, setShowLineQr] = useState(false);

  // Cashless Payment Gateway Modal State
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // ESC key listener to close payment modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' || e.key === 'Esc') {
        if (showPaymentModal) {
          setShowPaymentModal(false);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showPaymentModal]);

  const [paymentTab, setPaymentTab] = useState('promptpay'); // 'promptpay', 'card'
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardName, setCardName] = useState('');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const lineOaId = laundryStore.settings?.lineOaId || '@nonamelaundry';
  const gatewayInfo = laundryStore.settings?.paymentGateway || {
    provider: 'Omise / Opn Payments (Thailand)',
    merchantName: 'NoName Laundry Bangkok Co., Ltd.'
  };

  const activeOrder = orders.find(o => 
    o.id.toLowerCase() === (selectedOrderId || searchQuery).trim().toLowerCase()
  ) || orders.find(o => 
    o.customerName.toLowerCase().includes(searchQuery.trim().toLowerCase()) ||
    o.contactValue.toLowerCase().includes(searchQuery.trim().toLowerCase())
  );

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const found = orders.find(o => 
      o.id.toLowerCase() === searchQuery.trim().toLowerCase() ||
      o.customerName.toLowerCase().includes(searchQuery.trim().toLowerCase()) ||
      o.contactValue.toLowerCase().includes(searchQuery.trim().toLowerCase())
    );
    if (found) {
      setSelectedOrderId(found.id);
    }
  };

  const handleIncidentSubmit = (e) => {
    e.preventDefault();
    if (!incidentSubject.trim() || !incidentMessage.trim() || !activeOrder) return;

    onReportIncident({
      orderId: activeOrder.id,
      customerName: activeOrder.customerName,
      channel: activeOrder.contactChannel,
      contact: activeOrder.contactValue,
      subject: incidentSubject.trim(),
      message: incidentMessage.trim()
    });

    setIncidentSubmitted(true);
    setIncidentSubject('');
    setIncidentMessage('');
    setTimeout(() => {
      setShowIncidentForm(false);
      setIncidentSubmitted(false);
    }, 3000);
  };

  const handleSimulatePayment = (methodName) => {
    if (!activeOrder) return;
    setIsProcessingPayment(true);
    setTimeout(() => {
      laundryStore.markOrderPaid(activeOrder.id, methodName);
      setIsProcessingPayment(false);
      setShowPaymentModal(false);
    }, 800);
  };

  const statusMeta = ORDER_STATUSES[activeOrder?.status] || {
    label: activeOrder?.status || 'Unknown',
    color: 'bg-slate-100 text-slate-700 border-slate-300',
    step: 1
  };

  const progressSteps = [
    { key: 'BOOKING_REQUESTED', label: 'Requested' },
    { key: 'PICKED_UP', label: 'Picked Up' },
    { key: 'WEIGHED_INSPECTED', label: 'Weighed' },
    { key: 'IN_WASH', label: 'In Wash' },
    { key: 'IRON_FOLD', label: 'Iron/Finishing' },
    { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery' },
    { key: 'DELIVERED', label: 'Delivered' },
  ];

  const currentStepNumber = statusMeta.step;

  const lineMessage = activeOrder
    ? `Hi NoName Laundry, I am following up on Order ${activeOrder.id} (${activeOrder.customerName}).`
    : `Hi NoName Laundry, I have a tracking question.`;

  const lineDeepLink = getLineOaMessageUrl(lineMessage, lineOaId);
  const lineQrUrl = getLineQrCodeUrl(lineOaId);
  const isPaid = activeOrder?.paymentStatus === 'PAID';

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* 3RD-PARTY CASHLESS PAYMENT GATEWAY MODAL */}
      {showPaymentModal && activeOrder && (
        <div 
          className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setShowPaymentModal(false)}
        >
          <div 
            className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-xs uppercase font-bold text-emerald-600 tracking-wider">
                  100% Cashless Gateway
                </span>
                <h3 className="text-lg font-black text-slate-900 mt-0.5">
                  Secure Online Payment
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowPaymentModal(false)}
                className="p-1 text-slate-400 hover:text-slate-800 flex items-center gap-1"
                title="Close (Esc)"
              >
                <span className="hidden sm:inline text-[10px] font-mono font-bold px-1 rounded bg-slate-100 text-slate-500 border border-slate-200">ESC</span>
                <Icon name="x" className="w-5 h-5" />
              </button>
            </div>

            {/* Merchant info & Total */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <div className="font-extrabold text-slate-900 text-xs">{gatewayInfo.merchantName}</div>
                <div className="text-[11px] text-slate-500">Order: <strong>{activeOrder.id}</strong> • {gatewayInfo.provider}</div>
              </div>
              <div className="text-right">
                <div className="text-xs text-slate-500 font-bold">Total Due</div>
                <div className="text-xl font-black text-emerald-600">฿{activeOrder.totalPrice} THB</div>
              </div>
            </div>

            {/* Payment Method Selector Tabs */}
            <div className="flex rounded-xl bg-slate-100 p-1 text-xs font-bold">
              <button
                type="button"
                onClick={() => setPaymentTab('promptpay')}
                className={`flex-1 py-2 rounded-lg transition ${
                  paymentTab === 'promptpay' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                PromptPay QR (Mobile Scan)
              </button>
              <button
                type="button"
                onClick={() => setPaymentTab('card')}
                className={`flex-1 py-2 rounded-lg transition ${
                  paymentTab === 'card' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Credit / Debit Card
              </button>
            </div>

            {paymentTab === 'promptpay' ? (
              <div className="text-center space-y-3 py-2 animate-fadeIn">
                <div className="bg-sky-50 border border-sky-200 p-2 rounded-xl inline-block shadow-sm">
                  <img
                    src={generatePromptPayQrUrl(activeOrder.totalPrice)}
                    alt="PromptPay QR Code"
                    className="w-48 h-48 mx-auto rounded-lg"
                  />
                </div>
                <div className="text-xs text-slate-600 space-y-1">
                  <div className="font-bold text-slate-900">Scan with any Thai Mobile Banking App</div>
                  <div className="text-[11px] text-slate-500">K PLUS, SCB EASY, Krungthai NEXT, Bangkok Bank, etc.</div>
                </div>

                <button
                  type="button"
                  disabled={isProcessingPayment}
                  onClick={() => handleSimulatePayment('PromptPay QR')}
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2"
                >
                  <Icon name="check" className="w-4 h-4" />
                  <span>{isProcessingPayment ? 'Verifying Gateway Webhook...' : 'Confirm PromptPay Payment'}</span>
                </button>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSimulatePayment('Credit Card (Visa/Mastercard)');
                }}
                className="space-y-3 text-xs animate-fadeIn"
              >
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Cardholder Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Name on card"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Card Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="4111 2222 3333 4444"
                    maxLength="19"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 font-mono"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Expiry Date *</label>
                    <input
                      type="text"
                      required
                      placeholder="MM/YY"
                      maxLength="5"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">CVV / CVC *</label>
                    <input
                      type="password"
                      required
                      placeholder="123"
                      maxLength="4"
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 font-mono"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isProcessingPayment}
                  className="w-full py-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2 mt-2"
                >
                  <Icon name="check" className="w-4 h-4" />
                  <span>{isProcessingPayment ? 'Securing 3D-Secure Transaction...' : `Pay ฿${activeOrder.totalPrice} THB via Gateway`}</span>
                </button>
              </form>
            )}

            <div className="text-[10px] text-center text-slate-400">
              🔒 Encrypted via 256-bit SSL • 100% Cashless System Powered by 3rd-Party Gateway
            </div>
          </div>
        </div>
      )}

      {/* Tracker Header & Search */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-100 text-sky-800 text-xs font-bold mb-2">
          <span>Bangkok Live Order Status</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Track Your Laundry Order
        </h1>
        <p className="text-sm text-slate-600 mt-2">
          Enter your Tracking ID (e.g. <code>NNL-8491-BK</code>) or search by phone/LINE.
        </p>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="mt-6 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Icon name="search" className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by Tracking ID (e.g. NNL-8491-BK) or Name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-300 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-sm font-semibold"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-3.5 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-sm shadow-md transition"
          >
            Track Order
          </button>
        </form>

        {/* Quick Sample Selector */}
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500">
          <span>Quick Sample Orders:</span>
          {orders.slice(0, 3).map((o) => (
            <button
              key={o.id}
              onClick={() => {
                setSearchQuery(o.id);
                setSelectedOrderId(o.id);
              }}
              className={`px-2.5 py-1 rounded-lg border font-mono transition ${
                activeOrder?.id === o.id
                  ? 'bg-sky-50 text-sky-700 border-sky-300 font-bold'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {o.id} ({o.customerName})
            </button>
          ))}
        </div>
      </div>

      {!activeOrder ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm">
          <div className="w-16 h-16 rounded-3xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-4">
            <Icon name="search" className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">Order Not Found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Please verify your tracking code or contact our online support via WhatsApp or LINE for immediate assistance.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          
          {/* Main Status Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200">
            
            {/* Top Bar with Tracking ID and Status Pill */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-3">
                  <span className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
                    {activeOrder.id}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${statusMeta.color}`}>
                    {statusMeta.label}
                  </span>
                </div>
                <div className="text-xs text-slate-500 mt-1 flex items-center gap-2 flex-wrap">
                  <span>Service: <strong>{activeOrder.serviceName}</strong></span>
                  {activeOrder.turnaroundSpeed === 'same_day' ? (
                    <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 font-extrabold text-[10px]">
                      ⚡ Same Day Express
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 font-semibold text-[10px]">
                      🕒 Next Day
                    </span>
                  )}
                  <span>• Tag: <code>{activeOrder.tagNumber}</code></span>
                </div>
              </div>

              {/* Digital Support Quick Buttons */}
              <div className="flex items-center gap-2">
                <a
                  href={`${CONTACT_CHANNELS.whatsapp.url}Hi,%20inquiring%20about%20Order%20${activeOrder.id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold transition inline-flex items-center gap-1.5"
                  title="WhatsApp Support for this order"
                >
                  <Icon name="whatsapp" className="w-4 h-4 text-emerald-600" />
                  <span>WhatsApp</span>
                </a>

                <a
                  href={lineDeepLink}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3.5 py-2 rounded-xl bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 text-xs font-bold transition inline-flex items-center gap-1.5"
                  title="Connect on LINE OA"
                >
                  <Icon name="line" className="w-4 h-4 text-green-600" />
                  <span>LINE OA</span>
                </a>
              </div>
            </div>

            {/* Dedicated LINE OA Connection Callout Banner */}
            <div className="my-6 p-4 rounded-2xl bg-gradient-to-r from-green-50 via-emerald-50 to-green-50 border border-green-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-green-500 text-white flex items-center justify-center font-bold shrink-0 mt-0.5">
                  <Icon name="line" className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-extrabold text-xs sm:text-sm text-green-950 flex items-center gap-2">
                    <span>Connect with our LINE OA: {lineOaId}</span>
                    <span className="text-[10px] bg-green-200 text-green-900 px-1.5 py-0.5 rounded font-bold">Recommended</span>
                  </div>
                  <p className="text-xs text-green-900/80 mt-0.5 leading-relaxed">
                    Under LINE OA rules, we cannot initiate direct chats. Tap below to send Order <strong>#{activeOrder.id}</strong> to our LINE OA so our team can send your scale weight photos and live courier ETA!
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                <a
                  href={lineDeepLink}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-green-600 hover:bg-green-500 text-white font-bold text-xs shadow-md transition text-center inline-flex items-center justify-center gap-1.5"
                >
                  <Icon name="line" className="w-4 h-4" />
                  <span>Add & Chat on LINE</span>
                </a>
                <button
                  type="button"
                  onClick={() => setShowLineQr(!showLineQr)}
                  className="px-3 py-2.5 rounded-xl bg-white text-green-800 border border-green-300 text-xs font-bold hover:bg-green-50"
                  title="Scan QR Code"
                >
                  QR Code
                </button>
              </div>
            </div>

            {showLineQr && (
              <div className="mb-6 p-4 bg-white rounded-2xl border border-green-200 text-center animate-fadeIn">
                <img
                  src={lineQrUrl}
                  alt="Scan to Add LINE OA @nonamelaundry"
                  className="w-40 h-40 mx-auto rounded-lg shadow-sm"
                />
                <p className="text-xs text-slate-600 mt-2 font-medium">
                  Scan with your smartphone camera to add <strong>{lineOaId}</strong> on LINE
                </p>
              </div>
            )}

            {/* Stepper Progress Bar */}
            <div className="py-6">
              <div className="hidden sm:grid grid-cols-7 gap-2 relative">
                {progressSteps.map((step, idx) => {
                  const isDone = currentStepNumber >= (idx + 1);
                  const isCurrent = currentStepNumber === (idx + 1);
                  return (
                    <div key={step.key} className="flex flex-col items-center text-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                        isDone
                          ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30'
                          : 'bg-slate-100 text-slate-400'
                      } ${isCurrent ? 'ring-4 ring-sky-100' : ''}`}>
                        {isDone ? <Icon name="check" className="w-4 h-4" /> : (idx + 1)}
                      </div>
                      <span className={`text-[11px] font-bold mt-2 ${
                        isCurrent ? 'text-sky-600' : isDone ? 'text-slate-800' : 'text-slate-400'
                      }`}>
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="sm:hidden p-3 bg-sky-50 rounded-xl border border-sky-200 text-xs text-sky-900 flex items-center justify-between">
                <span>Current Stage:</span>
                <span className="font-extrabold">{statusMeta.label}</span>
              </div>
            </div>

            {/* Weight Audit Box */}
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/80 mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Icon name="scale" className="w-4 h-4 text-sky-600" />
                <h4 className="text-xs font-extrabold uppercase tracking-wide text-slate-700">
                  Digital Scale Weight Audit (Min 4.0 KG)
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                <div className="bg-white p-3.5 rounded-xl border border-slate-200">
                  <div className="text-[11px] text-slate-500 font-medium">Customer Estimated</div>
                  <div className="text-lg font-black text-slate-800 mt-0.5">
                    {activeOrder.estimatedWeightKg} KG
                  </div>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-slate-200">
                  <div className="text-[11px] text-slate-500 font-medium">Facility Scale Weighed</div>
                  <div className="text-lg font-black text-sky-600 mt-0.5">
                    {activeOrder.actualWeightKg ? `${activeOrder.actualWeightKg} KG` : 'Pending Scale Intake'}
                  </div>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-slate-200">
                  <div className="text-[11px] text-slate-500 font-medium">Final Invoice Total</div>
                  <div className="text-lg font-black text-emerald-600 mt-0.5">
                    ฿{activeOrder.totalPrice} THB
                  </div>
                </div>
              </div>

              <div className="mt-3 text-[11px] text-slate-500 flex items-center justify-between">
                <span>Rate: ฿{activeOrder.pricePerKg}/KG (Min {activeOrder.minWeightAppliedKg || 4.0} KG applied)</span>
                {activeOrder.actualWeightKg && (
                  <span className="text-emerald-700 font-semibold">
                    ✓ Verified on Certified Digital Scales
                  </span>
                )}
              </div>
            </div>

            {/* 100% Cashless Payment Gateway Card */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 to-sky-950 text-white mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                    100% Cashless Service
                  </span>
                  <span className="text-xs text-slate-400">• {gatewayInfo.provider}</span>
                </div>
                <div className="text-lg font-black text-white mt-1">
                  Invoice Status:{' '}
                  {isPaid ? (
                    <span className="text-emerald-400">PAID</span>
                  ) : (
                    <span className="text-amber-400">PENDING PAYMENT</span>
                  )}
                </div>
                <div className="text-xs text-slate-300 mt-0.5">
                  {isPaid ? (
                    <span>Payment verified via {activeOrder.paymentMethod || '3rd-Party Gateway'} (Ref: {activeOrder.paymentRef || 'TXN-089123'})</span>
                  ) : (
                    <span>No cash handled by couriers. Please pay securely online via PromptPay QR or Credit Card.</span>
                  )}
                </div>
              </div>

              <div className="shrink-0 w-full sm:w-auto">
                {isPaid ? (
                  <div className="px-4 py-2.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center gap-2">
                    <Icon name="check" className="w-4 h-4 text-emerald-400" />
                    <span>Payment Complete</span>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowPaymentModal(true)}
                    className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-extrabold text-xs shadow-lg shadow-emerald-500/30 transition flex items-center justify-center gap-2"
                  >
                    <Icon name="receipt" className="w-4 h-4" />
                    <span>Pay ฿{activeOrder.totalPrice} THB (PromptPay / Card)</span>
                  </button>
                )}
              </div>
            </div>

            {/* Delivery & Condo Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="text-slate-400 uppercase font-bold text-[10px] tracking-wider mb-1">
                  Bangkok Pickup Location
                </div>
                <div className="font-extrabold text-slate-900 text-sm">{activeOrder.condoName}</div>
                <div className="text-slate-600">{activeOrder.roomNumber || 'Condo Lobby / Juristic'}</div>
                <div className="text-slate-500 mt-0.5">{activeOrder.district}</div>
                {activeOrder.leaveWithJuristic && (
                  <span className="inline-block mt-2 px-2 py-0.5 rounded bg-sky-100 text-sky-800 text-[10px] font-bold">
                    Juristic Reception Drop-Off Authorized
                  </span>
                )}
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="text-slate-400 uppercase font-bold text-[10px] tracking-wider mb-1">
                  Schedule & Digital Contact
                </div>
                <div>Customer: <strong>{activeOrder.customerName}</strong></div>
                <div>Channel: <strong className="uppercase">{activeOrder.contactChannel}</strong> ({activeOrder.contactValue})</div>
                <div>Pickup Window: <strong>{activeOrder.pickupDate} ({activeOrder.pickupTime})</strong></div>
                {activeOrder.specialInstructions && (
                  <div className="mt-2 text-slate-600 italic bg-white p-2 rounded border border-slate-200">
                    "{activeOrder.specialInstructions}"
                  </div>
                )}
              </div>
            </div>

            {/* Timeline Audit Log */}
            <div className="mt-8 pt-6 border-t border-slate-100">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-4">
                Live Tracking Activity Log
              </h4>

              <div className="space-y-4">
                {(activeOrder.timeline || []).map((t, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-sky-500 mt-1.5 shrink-0" />
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs">
                        <span className="font-bold text-slate-900">
                          {ORDER_STATUSES[t.status]?.label || t.status}
                        </span>
                        <span className="text-slate-400 font-mono text-[11px]">{t.timestamp}</span>
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{t.note}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Online Incident / Help Box (No Phone Calls Policy) */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <Icon name="phoneOff" className="w-4 h-4 text-amber-600" />
                  <h4 className="text-sm font-extrabold text-slate-900">
                    Need Support or Have an Incident with this Order?
                  </h4>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  We do not take phone calls. Submit a ticket online or message us instantly via WhatsApp or LINE.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowIncidentForm(!showIncidentForm)}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition"
                >
                  {showIncidentForm ? 'Close Ticket Form' : 'Open Support Ticket'}
                </button>
              </div>
            </div>

            {/* Incident Ticket Form */}
            {showIncidentForm && (
              <form onSubmit={handleIncidentSubmit} className="mt-6 pt-6 border-t border-slate-100 space-y-4">
                {incidentSubmitted ? (
                  <div className="p-4 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center gap-2">
                    <Icon name="check" className="w-4 h-4 text-emerald-600" />
                    <span>Ticket submitted successfully! Our digital support team will reply via {activeOrder.contactChannel.toUpperCase()} within 15 minutes.</span>
                  </div>
                ) : (
                  <>
                    <div className="text-xs font-bold text-slate-700">
                      Reporting regarding Order: <span className="font-mono text-sky-600">{activeOrder.id}</span>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Topic / Subject <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Question about weighed KG / Special iron request / Delivery update"
                        value={incidentSubject}
                        onChange={(e) => setIncidentSubject(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Detailed Message <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        rows="3"
                        required
                        placeholder="Describe your question or incident in detail..."
                        value={incidentMessage}
                        onChange={(e) => setIncidentMessage(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs"
                      />
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <span className="text-[11px] text-slate-400">
                        Response sent strictly via online chat / email (No phone calls).
                      </span>
                      <button
                        type="submit"
                        className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-md transition inline-flex items-center gap-1.5"
                      >
                        <Icon name="send" className="w-3.5 h-3.5" />
                        <span>Submit Online Ticket</span>
                      </button>
                    </div>
                  </>
                )}
              </form>
            )}
          </div>

        </div>
      )}

    </div>
  );
}
