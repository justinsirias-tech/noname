import React, { useState, useEffect } from 'react';
import { Icon } from './Icons.jsx';
import { ORDER_STATUSES, TRACKING_STAGES, getTrackingStage, INCIDENT_CATEGORIES, INCIDENT_SEVERITIES, INITIAL_SERVICES } from '../data/servicesData.js';
import { CONTACT_CHANNELS, getLineOaMessageUrl, getLineOaAddFriendUrl, getLineQrCodeUrl, generatePromptPayQrUrl, laundryStore } from '../store.js';
import { ImageUploadZone } from './IncidentImageAttachment.jsx';

export function OrderTracker({ orders, customer, initialTrackingId, initialOpenPayment = false, onReportIncident, onBackToPortal }) {
  // Filter orders belonging to the registered customer
  const customerOrders = React.useMemo(() => {
    if (!customer) return [];
    const normPhone = (customer.phone || '').replace(/[^0-9]/g, '').slice(-8);
    const matched = orders.filter((o) => {
      if (o.customerId && o.customerId === customer.id) return true;
      if (customer.fullName && o.customerName && o.customerName.toLowerCase() === customer.fullName.toLowerCase()) return true;
      if (customer.email && o.contactValue && o.contactValue.toLowerCase() === customer.email.toLowerCase()) return true;
      if (normPhone && normPhone.length >= 7 && o.contactValue && o.contactValue.replace(/[^0-9]/g, '').includes(normPhone)) return true;
      return false;
    });
    const apiOrders = Array.isArray(customer.orders) ? customer.orders : [];
    const map = new Map();
    [...matched, ...apiOrders].forEach((o) => {
      if (o && o.id) map.set(o.id, o);
    });
    return Array.from(map.values()).sort(
      (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    );
  }, [orders, customer]);

  const defaultOrderId = initialTrackingId || customerOrders[0]?.id || '';
  const [searchQuery, setSearchQuery] = useState(defaultOrderId);
  const [selectedOrderId, setSelectedOrderId] = useState(defaultOrderId);
  
  // Incident Form State
  const [showIncidentForm, setShowIncidentForm] = useState(false);
  const [incidentCategory, setIncidentCategory] = useState(INCIDENT_CATEGORIES[0]);
  const [incidentSeverity, setIncidentSeverity] = useState('normal');
  const [incidentAffectedItem, setIncidentAffectedItem] = useState('');
  const [incidentImageData, setIncidentImageData] = useState(null);
  const [incidentSubject, setIncidentSubject] = useState('');
  const [incidentMessage, setIncidentMessage] = useState('');
  const [incidentSubmitted, setIncidentSubmitted] = useState(false);

  // Customer Service & Turnaround Change Modal State
  const [showServiceChangeModal, setShowServiceChangeModal] = useState(false);
  const [trackerServiceId, setTrackerServiceId] = useState('');
  const [trackerTurnaroundSpeed, setTrackerTurnaroundSpeed] = useState('');
  const [trackerUpdating, setTrackerUpdating] = useState(false);
  const [trackerSuccessMsg, setTrackerSuccessMsg] = useState('');

  // LINE OA Desktop QR Code toggle
  const [showLineQr, setShowLineQr] = useState(false);

  // Cashless Payment Gateway Modal State
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [checkingBeamStatus, setCheckingBeamStatus] = useState(false);

  useEffect(() => {
    if (initialTrackingId) {
      setSearchQuery(initialTrackingId);
      setSelectedOrderId(initialTrackingId);
    } else if (!selectedOrderId && customerOrders.length > 0) {
      setSearchQuery(customerOrders[0].id);
      setSelectedOrderId(customerOrders[0].id);
    }
  }, [initialTrackingId, customerOrders]);

  // ESC key listener to close modals
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' || e.key === 'Esc') {
        if (showServiceChangeModal) {
          setShowServiceChangeModal(false);
        } else if (showPaymentModal) {
          setShowPaymentModal(false);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showServiceChangeModal, showPaymentModal]);

  const [paymentTab, setPaymentTab] = useState('promptpay'); // 'promptpay', 'card'
  const [beamCheckoutLoading, setBeamCheckoutLoading] = useState(false);
  const [beamCheckoutError, setBeamCheckoutError] = useState('');
  const [beamQrImage, setBeamQrImage] = useState('');
  const [beamQrChargeId, setBeamQrChargeId] = useState('');
  const [beamQrExpiry, setBeamQrExpiry] = useState('');
  const [beamQrLoading, setBeamQrLoading] = useState(false);

  const lineOaId = laundryStore.settings?.lineOaId || '@nonamelaundry';
  const gatewayInfo = laundryStore.settings?.paymentGateway || {
    provider: 'Beam Checkout (Thailand)',
    merchantName: 'NoName Laundry Bangkok Co., Ltd.'
  };

  const searchablePool = customerOrders.length > 0 ? customerOrders : orders;
  const [fetchedOrder, setFetchedOrder] = useState(null);

  const localMatchedOrder = searchablePool.find(o => 
    o.id.toLowerCase() === (selectedOrderId || searchQuery).trim().toLowerCase()
  ) || orders.find(o => 
    o.id.toLowerCase() === (selectedOrderId || searchQuery).trim().toLowerCase()
  );

  const activeOrder = localMatchedOrder || (
    fetchedOrder && fetchedOrder.id?.toLowerCase() === (selectedOrderId || searchQuery).trim().toLowerCase()
      ? fetchedOrder
      : null
  );

  useEffect(() => {
    const targetId = (selectedOrderId || searchQuery || '').trim();
    if (!targetId) return;
    let cancelled = false;
    fetch(`/api/orders/${encodeURIComponent(targetId)}`)
      .then(res => (res.ok ? res.json() : null))
      .then(data => {
        if (!cancelled && data && data.id) {
          setFetchedOrder(data);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [selectedOrderId, searchQuery]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const found = searchablePool.find(o => 
      o.id.toLowerCase() === searchQuery.trim().toLowerCase() ||
      (o.customerName && o.customerName.toLowerCase().includes(searchQuery.trim().toLowerCase())) ||
      (o.contactValue && o.contactValue.toLowerCase().includes(searchQuery.trim().toLowerCase()))
    ) || orders.find(o => o.id.toLowerCase() === searchQuery.trim().toLowerCase());
    if (found) {
      setSelectedOrderId(found.id);
    } else {
      setSelectedOrderId(searchQuery.trim().toUpperCase());
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
      category: incidentCategory,
      severity: incidentSeverity,
      affectedItem: incidentAffectedItem.trim(),
      imageUrl: incidentImageData,
      subject: incidentSubject.trim(),
      message: incidentMessage.trim()
    });

    setIncidentSubmitted(true);
    setIncidentSubject('');
    setIncidentMessage('');
    setIncidentCategory(INCIDENT_CATEGORIES[0]);
    setIncidentSeverity('normal');
    setIncidentAffectedItem('');
    setIncidentImageData(null);
    setTimeout(() => {
      setShowIncidentForm(false);
      setIncidentSubmitted(false);
    }, 3000);
  };

  const getRateForSpeed = (srv, speed) => {
    if (!srv) return 70;
    const baseStd = Number(srv.standardPricePerKg !== undefined ? srv.standardPricePerKg : (srv.pricePerKg || (srv.id === 'wash_fold' ? 70 : 70)));
    if (speed === 'same_day') {
      return srv.sameDayPricePerKg !== undefined ? Number(srv.sameDayPricePerKg) : Math.round(baseStd * 1.75);
    }
    if (speed === 'next_day_24h' || speed === 'next_day') {
      return srv.nextDayPricePerKg !== undefined ? Number(srv.nextDayPricePerKg) : Math.round(baseStd * 1.3);
    }
    return baseStd;
  };

  const calculateSuggestedDelivery = (order, speed) => {
    if (!order?.pickupDate) return { date: order?.deliveryDate || '', time: order?.deliveryTime || '' };
    try {
      const parts = order.pickupDate.split('-');
      if (parts.length === 3) {
        const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
        if (speed === 'same_day') {
          return { date: order.pickupDate, time: 'Before 18:00 (Same Day Express)' };
        } else if (speed === 'next_day_24h' || speed === 'next_day') {
          d.setDate(d.getDate() + 1);
          const yyyy = d.getFullYear();
          const mm = String(d.getMonth() + 1).padStart(2, '0');
          const dd = String(d.getDate()).padStart(2, '0');
          return { date: `${yyyy}-${mm}-${dd}`, time: order.pickupTime || '14:00 - 16:00 (Next Day)' };
        } else {
          d.setDate(d.getDate() + 2);
          const yyyy = d.getFullYear();
          const mm = String(d.getMonth() + 1).padStart(2, '0');
          const dd = String(d.getDate()).padStart(2, '0');
          return { date: `${yyyy}-${mm}-${dd}`, time: order.pickupTime || '14:00 - 16:00 (Standard 48h)' };
        }
      }
    } catch (e) {
      // fallback
    }
    return { date: order?.deliveryDate || '', time: order?.deliveryTime || '' };
  };

  const handleConfirmCustomerServiceChange = async () => {
    if (!activeOrder) return;
    const allServices = laundryStore.services?.length ? laundryStore.services : INITIAL_SERVICES;
    const srv = allServices.find(s => s.id === trackerServiceId) || allServices[0];
    const newSpeed = trackerTurnaroundSpeed || activeOrder.turnaroundSpeed || 'standard_48h';
    const rate = getRateForSpeed(srv, newSpeed);
    const isPiece = srv.pricingType === 'piece' || srv.unit === 'piece';
    const minWeight = srv.minWeightKg || (isPiece ? 1.0 : 5.0);
    const weight = activeOrder.actualWeightKg !== null && activeOrder.actualWeightKg !== undefined
      ? activeOrder.actualWeightKg
      : (activeOrder.quantity || activeOrder.estimatedWeightKg || (isPiece ? 1 : 5.0));
    const billableAmount = isPiece ? (activeOrder.quantity || 1) : Math.max(weight, minWeight);
    const newServiceSubtotal = Math.round(billableAmount * rate);
    const deliveryFee = Number(activeOrder.deliveryFee || 0);
    const newTotal = newServiceSubtotal + deliveryFee;
    const delivery = calculateSuggestedDelivery(activeOrder, newSpeed);

    setTrackerUpdating(true);
    const speedLabel = newSpeed === 'same_day' ? 'Same Day Express (<18:00)' : (newSpeed === 'next_day_24h' || newSpeed === 'next_day') ? 'Next Day (24h)' : 'Standard (48h)';
    const note = `Customer modified service to "${srv.name}" (${speedLabel}) online before payment. Rate: ฿${rate}/${isPiece ? (srv.unit || 'piece') : 'kg'}, Total: ฿${newTotal} THB.`;
    
    const serviceUpdates = {
      serviceId: srv.id,
      serviceName: srv.name,
      pricingType: srv.pricingType || (isPiece ? 'piece' : 'weight'),
      unit: srv.unit || (isPiece ? 'piece' : 'KG'),
      turnaroundSpeed: newSpeed,
      pricePerKg: rate,
      minWeightAppliedKg: minWeight,
      deliveryDate: delivery.date,
      deliveryTime: delivery.time,
      serviceSubtotal: newServiceSubtotal,
      totalPrice: newTotal
    };

    laundryStore.updateOrderStatus(activeOrder.id, activeOrder.status, note, null, null, serviceUpdates);
    setTrackerUpdating(false);
    setShowServiceChangeModal(false);
    setTrackerSuccessMsg(`Service updated to ${srv.name} (${speedLabel})! Your invoice total has been updated to ฿${newTotal} THB.`);
    setTimeout(() => setTrackerSuccessMsg(''), 6000);
  };

  const loadBeamPromptPayQr = async (forceNew = false) => {
    if (!activeOrder?.id || activeOrder.paymentStatus === 'PAID' || !activeOrder.billingSentAt) return;
    setBeamQrLoading(true);
    setBeamCheckoutError('');
    try {
      const res = await fetch('/api/payments/beam/create-qr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: activeOrder.id,
          originUrl: window.location.origin,
          forceNew
        })
      });
      const data = await res.json();
      if (res.ok && data.qrImageDataUrl) {
        setBeamQrImage(data.qrImageDataUrl);
        setBeamQrChargeId(data.chargeId || '');
        setBeamQrExpiry(data.expiry || '');
      } else {
        setBeamCheckoutError(data.error || 'Could not generate Beam PromptPay QR code.');
      }
    } catch (err) {
      setBeamCheckoutError(`Failed to load Beam PromptPay QR: ${err.message}`);
    } finally {
      setBeamQrLoading(false);
    }
  };

  useEffect(() => {
    if (activeOrder?.paymentStatus === 'PAID') {
      setBeamQrImage('');
      setBeamQrChargeId('');
      setBeamQrExpiry('');
      setShowPaymentModal(false);
      return;
    }
    if (showPaymentModal && activeOrder?.id && activeOrder.paymentStatus !== 'PAID' && activeOrder.billingSentAt) {
      loadBeamPromptPayQr(false);
    }
  }, [showPaymentModal, activeOrder?.id, activeOrder?.totalPrice, activeOrder?.billingSentAt, activeOrder?.paymentStatus]);

  const isBeamPollInFlightRef = React.useRef(false);

  const handleCheckBeamPaymentStatus = async (silent = false) => {
    const targetId = (activeOrder?.id || selectedOrderId || searchQuery || '').trim();
    if (!targetId) return;
    if (silent && isBeamPollInFlightRef.current) return;
    isBeamPollInFlightRef.current = true;
    if (!silent) setCheckingBeamStatus(true);
    try {
      const querySuffix = beamQrChargeId ? `?chargeId=${encodeURIComponent(beamQrChargeId)}` : '';
      const res = await fetch(`/api/payments/beam/verify/${encodeURIComponent(targetId)}${querySuffix}`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.order) {
          setFetchedOrder(data.order);
          if (Array.isArray(laundryStore.orders)) {
            laundryStore.mergeOrders([data.order]);
          }
          if (data.paid) {
            setShowPaymentModal(false);
            setShowReceiptModal(true);
            setTrackerSuccessMsg(`Payment verified via Beam Checkout! Order status updated & Official Receipt #RCP-${targetId} issued.`);
          } else if (!silent) {
            setBeamCheckoutError(`Payment status is currently ${data.beamStatus || 'PENDING'}. As soon as you complete the scan in your banking app, your receipt will issue automatically.`);
          }
        }
      }
    } catch (e) {
      // ignore silent poll error
    } finally {
      isBeamPollInFlightRef.current = false;
      if (!silent) setCheckingBeamStatus(false);
    }
  };

  const handleBeamCheckout = async () => {
    if (!activeOrder) return;
    setBeamCheckoutLoading(true);
    setBeamCheckoutError('');
    try {
      const res = await fetch('/api/payments/beam/create-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: activeOrder.id,
          originUrl: window.location.origin
        })
      });
      const data = await res.json();
      if (!res.ok || !data.url) {
        setBeamCheckoutError(data.error || 'Unable to generate Beam Checkout link. Please use the QR / Card form below or check Beam API keys in Admin settings.');
        setBeamCheckoutLoading(false);
        return;
      }
      window.location.href = data.url;
    } catch (err) {
      setBeamCheckoutError(`Beam Checkout connection error: ${err.message}`);
      setBeamCheckoutLoading(false);
    }
  };

  // Auto-verify Beam Checkout payment on return (?beam_status=success or ?receipt=1) and poll while awaiting payment
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const beamStatus = params.get('beam_status');
    const openReceipt = params.get('receipt');
    const targetId = (selectedOrderId || searchQuery || params.get('track') || '').trim();
    if (openReceipt === '1') {
      setShowReceiptModal(true);
    }
    if (beamStatus === 'success' && targetId) {
      handleCheckBeamPaymentStatus(true);
    }
  }, [selectedOrderId, searchQuery]);

  // Live high-speed poll (1.5s when payment modal is open, 3.5s when viewing billing order) + instant check on window focus / tab return
  useEffect(() => {
    if (!activeOrder || activeOrder.paymentStatus === 'PAID') return;
    if (!activeOrder.billingSentAt && !showPaymentModal) return;

    const pollIntervalMs = showPaymentModal ? 1500 : 3500;
    const interval = setInterval(() => {
      handleCheckBeamPaymentStatus(true);
    }, pollIntervalMs);

    const handleInstantFocusCheck = () => {
      if (!document.hidden) {
        handleCheckBeamPaymentStatus(true);
      }
    };
    window.addEventListener('focus', handleInstantFocusCheck);
    document.addEventListener('visibilitychange', handleInstantFocusCheck);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleInstantFocusCheck);
      document.removeEventListener('visibilitychange', handleInstantFocusCheck);
    };
  }, [activeOrder?.id, activeOrder?.paymentStatus, activeOrder?.billingSentAt, showPaymentModal, beamQrChargeId]);

  const currentStage = getTrackingStage(activeOrder?.status);
  const statusMeta = {
    label: currentStage.label,
    color: currentStage.color,
    step: currentStage.step
  };

  const progressSteps = TRACKING_STAGES;
  const currentStepNumber = currentStage.step;

  const lineMessage = activeOrder
    ? `Hi NoName Laundry, I am following up on Order ${activeOrder.id} (${activeOrder.customerName}).`
    : `Hi NoName Laundry, I have a tracking question.`;

  const lineDeepLink = getLineOaMessageUrl(lineMessage, lineOaId);
  const lineQrUrl = getLineQrCodeUrl(lineOaId);
  const isPaid = activeOrder?.paymentStatus === 'PAID';
  const isInBillingOrLater = currentStepNumber >= 3;
  const isAdminBillReleased = Boolean(activeOrder?.billingSentAt);
  const isPaymentAllowed = !isPaid && isInBillingOrLater && isAdminBillReleased;

  useEffect(() => {
    if (initialOpenPayment && isPaymentAllowed) {
      setShowPaymentModal(true);
    } else if (!isPaymentAllowed) {
      setShowPaymentModal(false);
    }
  }, [initialOpenPayment, isPaymentAllowed]);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* CUSTOMER SERVICE & TURNAROUND SPEED CHANGE MODAL */}
      {showServiceChangeModal && activeOrder && (() => {
        const allServices = laundryStore.services?.length ? laundryStore.services : INITIAL_SERVICES;
        const selectedSrv = allServices.find(s => s.id === trackerServiceId) || allServices[0];
        const selectedSpeed = trackerTurnaroundSpeed || activeOrder.turnaroundSpeed || 'standard_48h';
        const effectiveRate = getRateForSpeed(selectedSrv, selectedSpeed);
        const isPiece = selectedSrv?.pricingType === 'piece' || selectedSrv?.unit === 'piece';
        const weight = activeOrder.actualWeightKg !== null && activeOrder.actualWeightKg !== undefined
          ? activeOrder.actualWeightKg
          : (activeOrder.quantity || activeOrder.estimatedWeightKg || (isPiece ? 1 : 5.0));
        const minWeight = selectedSrv?.minWeightKg || (isPiece ? 1.0 : 5.0);
        const billableAmount = isPiece ? (activeOrder.quantity || 1) : Math.max(weight, minWeight);
        const newServiceSubtotal = Math.round(billableAmount * effectiveRate);
        const newTotal = newServiceSubtotal + Number(activeOrder.deliveryFee || 0);
        const priceDiff = newTotal - (activeOrder.totalPrice || 0);
        const estDelivery = calculateSuggestedDelivery(activeOrder, selectedSpeed);
        const isSameDaySupported = selectedSrv.sameDayAvailable !== false && selectedSrv.turnaroundRates?.same_day?.available !== false;

        return (
          <div 
            className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn"
            onClick={() => setShowServiceChangeModal(false)}
          >
            <div 
              className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-5"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs uppercase font-extrabold text-amber-600 tracking-wider">
                      Flexible Service Adjustments
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                      Pre-Payment
                    </span>
                  </div>
                  <h3 className="text-lg font-black text-slate-900 mt-0.5">
                    Change Service or Turnaround Speed
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Order <strong>#{activeOrder.id}</strong> • Update your order specs before completing cashless checkout
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowServiceChangeModal(false)}
                  className="p-1 text-slate-400 hover:text-slate-800 flex items-center gap-1"
                  title="Close (Esc)"
                >
                  <span className="hidden sm:inline text-[10px] font-mono font-bold px-1 rounded bg-slate-100 text-slate-500 border border-slate-200">ESC</span>
                  <Icon name="x" className="w-5 h-5" />
                </button>
              </div>

              {/* Step 1: Select Service */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700">
                  1. Choose Laundry Service Plan
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {allServices.map(srv => {
                    const isSelected = (srv.id === trackerServiceId);
                    const srvRate = getRateForSpeed(srv, selectedSpeed);
                    return (
                      <button
                        key={srv.id}
                        type="button"
                        onClick={() => {
                          setTrackerServiceId(srv.id);
                          if (srv.sameDayAvailable === false && selectedSpeed === 'same_day') {
                            setTrackerTurnaroundSpeed('next_day_24h');
                          }
                        }}
                        className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between ${
                          isSelected
                            ? 'border-sky-500 bg-sky-50/80 ring-2 ring-sky-500/20 shadow-xs'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-extrabold text-slate-900">{srv.name}</span>
                            {isSelected && <Icon name="check" className="w-4 h-4 text-sky-600 shrink-0" />}
                          </div>
                          {srv.nameTh && <div className="text-[10px] text-slate-400">{srv.nameTh}</div>}
                          <div className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-tight">
                            {srv.description}
                          </div>
                        </div>
                        <div className="mt-2.5 pt-2 border-t border-slate-100 text-xs font-bold text-sky-700">
                          ฿{srvRate}/kg
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Step 2: Choose Turnaround Speed */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700">
                  2. Choose Turnaround Delivery Speed
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {/* Standard 48h */}
                  <button
                    type="button"
                    onClick={() => setTrackerTurnaroundSpeed('standard_48h')}
                    className={`p-3 rounded-2xl border text-left transition ${
                      selectedSpeed === 'standard_48h'
                        ? 'border-sky-500 bg-sky-50/80 ring-2 ring-sky-500/20 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-slate-900">Standard</span>
                      {selectedSpeed === 'standard_48h' && <Icon name="check" className="w-4 h-4 text-sky-600" />}
                    </div>
                    <div className="text-[11px] text-slate-500 font-semibold mt-0.5">48 Hours</div>
                    <div className="text-[11px] font-bold text-sky-700 mt-2">
                      ฿{getRateForSpeed(selectedSrv, 'standard_48h')}/kg
                    </div>
                  </button>

                  {/* Next Day 24h */}
                  <button
                    type="button"
                    onClick={() => setTrackerTurnaroundSpeed('next_day_24h')}
                    className={`p-3 rounded-2xl border text-left transition ${
                      selectedSpeed === 'next_day_24h' || selectedSpeed === 'next_day'
                        ? 'border-sky-500 bg-sky-50/80 ring-2 ring-sky-500/20 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-slate-900">Next Day</span>
                      {(selectedSpeed === 'next_day_24h' || selectedSpeed === 'next_day') && (
                        <Icon name="check" className="w-4 h-4 text-sky-600" />
                      )}
                    </div>
                    <div className="text-[11px] text-amber-600 font-bold mt-0.5">⚡ 24 Hours</div>
                    <div className="text-[11px] font-bold text-sky-700 mt-2">
                      ฿{getRateForSpeed(selectedSrv, 'next_day_24h')}/kg
                    </div>
                  </button>

                  {/* Same Day */}
                  <button
                    type="button"
                    disabled={!isSameDaySupported}
                    onClick={() => isSameDaySupported && setTrackerTurnaroundSpeed('same_day')}
                    className={`p-3 rounded-2xl border text-left transition ${
                      !isSameDaySupported
                        ? 'opacity-40 cursor-not-allowed bg-slate-50 border-slate-200'
                        : selectedSpeed === 'same_day'
                        ? 'border-sky-500 bg-sky-50/80 ring-2 ring-sky-500/20 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-slate-900">Same Day</span>
                      {selectedSpeed === 'same_day' && <Icon name="check" className="w-4 h-4 text-sky-600" />}
                    </div>
                    <div className="text-[11px] text-red-600 font-extrabold mt-0.5">
                      {isSameDaySupported ? '🚀 Before 18:00' : 'Not Available'}
                    </div>
                    <div className="text-[11px] font-bold text-sky-700 mt-2">
                      {isSameDaySupported ? `฿${getRateForSpeed(selectedSrv, 'same_day')}/kg` : '—'}
                    </div>
                  </button>
                </div>
              </div>

              {/* Price & Schedule Comparison Summary */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Certified / Intake Weight:</span>
                  <span className="font-bold text-slate-800">
                    {weight} KG (Billable: {billableKg} KG with Min {minWeight} KG)
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Updated Unit Rate:</span>
                  <span className="font-bold text-slate-800">฿{effectiveRate} THB / KG</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Estimated Delivery:</span>
                  <span className="font-bold text-sky-700">{estDelivery.date} ({estDelivery.time})</span>
                </div>

                <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                  <div>
                    <div className="text-[11px] text-slate-500 font-semibold">New Total Invoice</div>
                    {priceDiff !== 0 && (
                      <div className={`text-[10px] font-bold ${priceDiff > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                        {priceDiff > 0 ? `+฿${priceDiff} THB from previous` : `-฿${Math.abs(priceDiff)} THB from previous`}
                      </div>
                    )}
                  </div>
                  <div className="text-2xl font-black text-slate-900">
                    ฿{newTotal} <span className="text-xs font-bold text-slate-500">THB</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowServiceChangeModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={trackerUpdating}
                  onClick={handleConfirmCustomerServiceChange}
                  className="px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-extrabold shadow-md transition flex items-center gap-2"
                >
                  <Icon name="check" className="w-4 h-4" />
                  <span>{trackerUpdating ? 'Updating Order...' : `Confirm & Update Invoice (฿${newTotal} THB)`}</span>
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* 3RD-PARTY CASHLESS PAYMENT GATEWAY MODAL */}
      {showPaymentModal && activeOrder && isPaymentAllowed && (
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
                <div className="text-[11px] text-slate-500">Order: <strong>{activeOrder.id}</strong> • {gatewayInfo.provider || 'Beam Checkout (Thailand)'}</div>
              </div>
              <div className="text-right">
                <div className="text-xs text-slate-500 font-bold">Total Due</div>
                <div className="text-xl font-black text-emerald-600">฿{activeOrder.totalPrice} THB</div>
              </div>
            </div>

            {/* Official Beam Checkout Hosted Payment Button */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-sky-900 to-slate-900 text-white space-y-2.5 shadow-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-sky-500 text-white text-[10px] font-black uppercase tracking-wider">
                    BEAM CHECKOUT
                  </span>
                  <span className="text-xs font-bold text-sky-200">
                    Official Hosted Checkout (PromptPay QR & Card)
                  </span>
                </div>
                <Icon name="shield" className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Pay securely via Beam Checkout Thailand with instant Thai PromptPay QR or 3D-Secure Credit/Debit Card.
              </p>
              {beamCheckoutError && (
                <div className="p-2.5 rounded-xl bg-amber-500/20 border border-amber-400/40 text-amber-200 text-[11px] font-semibold">
                  {beamCheckoutError}
                </div>
              )}
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  type="button"
                  disabled={beamCheckoutLoading}
                  onClick={handleBeamCheckout}
                  className="flex-1 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 text-slate-950 font-black text-xs shadow-lg transition flex items-center justify-center gap-2"
                >
                  <Icon name="credit-card" className="w-4 h-4" />
                  <span>
                    {beamCheckoutLoading
                      ? 'Connecting to Beam Checkout...'
                      : `Pay ฿${activeOrder.totalPrice} THB via Beam Checkout`}
                  </span>
                </button>
                <button
                  type="button"
                  disabled={checkingBeamStatus}
                  onClick={() => handleCheckBeamPaymentStatus(false)}
                  className="px-3.5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition flex items-center justify-center gap-1.5"
                  title="Check if your Beam Checkout payment has completed"
                >
                  <Icon name="check" className="w-4 h-4 text-emerald-400" />
                  <span>{checkingBeamStatus ? 'Checking...' : 'Check Status'}</span>
                </button>
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
                <div className="bg-sky-50 border border-sky-200 p-3 rounded-2xl inline-block shadow-sm">
                  {beamQrLoading ? (
                    <div className="w-52 h-52 flex flex-col items-center justify-center text-xs font-bold text-sky-700 gap-2">
                      <div className="w-8 h-8 rounded-full border-3 border-sky-600 border-t-transparent animate-spin" />
                      <span>Generating Official Beam PromptPay QR...</span>
                    </div>
                  ) : beamQrImage ? (
                    <img
                      src={beamQrImage}
                      alt="Beam Checkout Thai PromptPay QR Code"
                      className="w-52 h-52 mx-auto rounded-lg bg-white p-2"
                    />
                  ) : (
                    <div className="w-52 h-52 flex flex-col items-center justify-center text-xs text-slate-500 p-4 gap-2">
                      <span>Could not load live QR image.</span>
                      <button
                        type="button"
                        onClick={() => loadBeamPromptPayQr(true)}
                        className="px-3 py-1.5 rounded-lg bg-sky-600 text-white font-bold text-xs"
                      >
                        Retry QR Generation
                      </button>
                    </div>
                  )}
                </div>
                <div className="text-xs text-slate-600 space-y-1">
                  <div className="font-bold text-slate-900">Scan with any Thai Mobile Banking App</div>
                  <div className="text-[11px] text-slate-500">
                    K PLUS, SCB EASY, Krungthai NEXT, Bangkok Bank, TTB • Exact Amount: <strong>฿{activeOrder.totalPrice}.00 THB</strong>
                  </div>
                  {beamQrChargeId && (
                    <div className="text-[10px] font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-2.5 py-1 inline-block">
                      ✓ Live Beam PromptPay Ref: {beamQrChargeId} (Auto-detecting payment...)
                    </div>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-2 pt-1">
                  <button
                    type="button"
                    disabled={checkingBeamStatus}
                    onClick={() => handleCheckBeamPaymentStatus(false)}
                    className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2"
                  >
                    <Icon name="check" className="w-4 h-4" />
                    <span>{checkingBeamStatus ? 'Verifying with Beam Checkout...' : "I've Scanned & Paid — Verify Now"}</span>
                  </button>
                  <button
                    type="button"
                    disabled={beamQrLoading}
                    onClick={() => loadBeamPromptPayQr(true)}
                    className="px-4 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition"
                    title="Generate a fresh PromptPay QR code"
                  >
                    Refresh QR
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4 py-3 text-center animate-fadeIn">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center mx-auto">
                    <Icon name="credit-card" className="w-6 h-6" />
                  </div>
                  <div className="font-extrabold text-slate-900 text-sm">
                    3D-Secure Credit / Debit Card Checkout
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
                    For PCI-DSS security, card payments (Visa, Mastercard, JCB) are processed directly on the encrypted <strong>Beam Checkout</strong> page.
                  </p>
                </div>

                <button
                  type="button"
                  disabled={beamCheckoutLoading}
                  onClick={handleBeamCheckout}
                  className="w-full py-3.5 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:opacity-60 text-white font-black text-xs shadow-md transition flex items-center justify-center gap-2"
                >
                  <Icon name="credit-card" className="w-4 h-4" />
                  <span>
                    {beamCheckoutLoading
                      ? 'Opening Beam Card Checkout...'
                      : `Pay ฿${activeOrder.totalPrice} THB by Card via Beam Checkout`}
                  </span>
                </button>
              </div>
            )}

            <div className="text-[10px] text-center text-slate-400">
              🔒 Encrypted via 256-bit SSL • 100% Cashless System Powered by 3rd-Party Gateway
            </div>
          </div>
        </div>
      )}

      {/* OFFICIAL TAX RECEIPT MODAL (PAID) */}
      {showReceiptModal && activeOrder && isPaid && (() => {
        const receiptNo = `RCP-${activeOrder.id}`;
        const invoiceNo = `INV-${activeOrder.id}`;
        const total = Number(activeOrder.totalPrice || 0);
        const subtotalExclVat = Math.round(total / 1.07);
        const vatAmt = total - subtotalExclVat;
        const isPiece = activeOrder.unit === 'piece' || activeOrder.pricingType === 'piece';
        const unitLbl = isPiece ? (activeOrder.unit || 'pc') : 'KG';
        const scaleW = activeOrder.actualWeightKg !== null && activeOrder.actualWeightKg !== undefined
          ? Number(activeOrder.actualWeightKg)
          : Number(activeOrder.estimatedWeightKg || 5);
        const minW = Number(activeOrder.minWeightAppliedKg || (isPiece ? 1 : 5));
        const billableW = isPiece ? scaleW : Math.max(scaleW, minW);
        const delivFee = Number(activeOrder.deliveryFee || 0);
        const srvSub = Number(activeOrder.serviceSubtotal || (total - delivFee));

        return (
          <div
            className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/75 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn"
            onClick={() => setShowReceiptModal(false)}
          >
            <div
              className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-5"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-200">
                <div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 text-[11px] font-extrabold uppercase tracking-wider">
                    ✓ Official Tax Receipt • PAID
                  </span>
                  <h3 className="text-xl font-black text-slate-900 mt-2">
                    NoName Laundry Bangkok Co., Ltd.
                  </h3>
                  <p className="text-xs text-slate-500">
                    บริษัท โนเนม ลอนดรี้ แบงค็อก จำกัด • Tax ID: 0105567089123 • nonamelaundrybooking@gmail.com
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-black text-slate-900 font-mono">{receiptNo}</div>
                  <div className="text-[11px] text-slate-500">Invoice Ref: <strong>{invoiceNo}</strong></div>
                  <div className="text-[11px] text-emerald-700 font-mono font-bold">
                    Ref: {activeOrder.paymentRef || `BEAM-${activeOrder.id}`}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div>
                  <div className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider mb-1">
                    Received From / Customer
                  </div>
                  <div className="font-black text-slate-900 text-sm">{activeOrder.customerName}</div>
                  <div className="text-slate-600">{activeOrder.pickupAddress || activeOrder.condoName}</div>
                  <div className="text-slate-500">Room: {activeOrder.roomNumber || 'Lobby / Juristic'}</div>
                </div>
                <div>
                  <div className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider mb-1">
                    Payment Verification
                  </div>
                  <div>Status: <strong className="text-emerald-600">PAID IN FULL</strong></div>
                  <div>Method: <strong>{activeOrder.paymentMethod || 'Beam Checkout (PromptPay / Card)'}</strong></div>
                  <div>Gateway Ref: <strong className="font-mono">{activeOrder.paymentRef || 'Verified'}</strong></div>
                  <div>Order Status: <strong className="text-sky-700">{(activeOrder.status || 'WASHING').replace(/_/g, ' ')}</strong></div>
                </div>
              </div>

              <div className="border border-slate-200 rounded-2xl overflow-hidden text-xs">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-600 text-[10px] font-extrabold uppercase">
                      <th className="py-2.5 px-4">Service Description</th>
                      <th className="py-2.5 px-3 text-center">Scale Weight</th>
                      <th className="py-2.5 px-3 text-center">Billable</th>
                      <th className="py-2.5 px-4 text-right">Amount (THB)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="py-3 px-4">
                        <div className="font-extrabold text-slate-900">{activeOrder.serviceName}</div>
                        <div className="text-[11px] text-slate-500"> Rate: ฿{activeOrder.pricePerKg || 70}/{unitLbl}</div>
                      </td>
                      <td className="py-3 px-3 text-center font-bold">{scaleW} {unitLbl}</td>
                      <td className="py-3 px-3 text-center font-extrabold">{billableW} {unitLbl}</td>
                      <td className="py-3 px-4 text-right font-extrabold">฿{srvSub.toLocaleString()}</td>
                    </tr>
                    <tr>
                      <td colSpan={3} className="py-2.5 px-4 font-bold text-slate-700">
                        🚚 Two-Way Pickup &amp; Return Delivery ({activeOrder.city || 'Bangkok'})
                      </td>
                      <td className="py-2.5 px-4 text-right font-extrabold">
                        {delivFee > 0 ? `฿${delivFee}` : <span className="text-emerald-600">FREE</span>}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2 border-t border-slate-200">
                <div className="text-xs text-slate-500 space-y-0.5">
                  <div>Subtotal (Excl. VAT 7%): <strong className="font-mono">฿{subtotalExclVat.toLocaleString()} THB</strong></div>
                  <div>VAT 7% (Included): <strong className="font-mono">฿{vatAmt.toLocaleString()} THB</strong></div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-slate-500">Total Amount Paid</div>
                  <div className="text-2xl font-black text-emerald-600">฿{total.toLocaleString()} THB</div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-extrabold shadow-sm transition flex items-center gap-2"
                >
                  <Icon name="receipt" className="w-4 h-4" />
                  <span>Print / Save Official Receipt PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowReceiptModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-bold transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Tracker Header & Search */}
      <div className="mb-8">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-100 text-sky-800 text-xs font-bold">
            <span>✓ Live Laundry Order Status</span>
          </div>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Live Laundry Process Tracking
        </h1>
        <p className="text-sm text-slate-600 mt-2">
          Enter your Tracking ID (e.g. <code>NNL-8491-BK</code>) to view live order progress and complete cashless payment.
        </p>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="mt-6 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Icon name="search" className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search your order by Tracking ID (e.g. NNL-8491-BK)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value.toUpperCase())}
              className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-300 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-sm font-semibold uppercase placeholder:normal-case"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-3.5 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-sm shadow-md transition"
          >
            Track Order
          </button>
        </form>
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

          {/* Active Current Orders & Live Laundry Process Summary Card */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-extrabold text-slate-900 uppercase tracking-wide text-xs flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-500 animate-pulse" />
                <span>ACTIVE CURRENT ORDERS &amp; LIVE LAUNDRY PROCESS (1)</span>
              </h4>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl border-2 border-sky-300 bg-sky-50/40 space-y-3 shadow-xs">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-sky-700 text-sm">{activeOrder.id}</span>
                  <span className="font-bold text-slate-900 text-sm">• {activeOrder.serviceName}</span>
                </div>
                <span className="px-3 py-1 rounded-full bg-sky-600 text-white font-bold text-[11px]">
                  Stage {currentStage.step}/6: {currentStage.label} ({(activeOrder.status || 'TBA').replace(/_/g, ' ')})
                </span>
              </div>

              {/* 6-Stage Laundry Process Mini Stepper */}
              <div className="grid grid-cols-6 gap-1.5 pt-1">
                {progressSteps.map((st, idx) => {
                  const done = currentStage.step >= (idx + 1);
                  const current = currentStage.step === (idx + 1);
                  return (
                    <div key={st.key} className="text-center">
                      <div className={`h-1.5 rounded-full ${done ? 'bg-sky-600' : 'bg-slate-200'}`} />
                      <div className={`text-[9px] sm:text-[10px] mt-1 font-bold truncate ${current ? 'text-sky-700 font-extrabold' : done ? 'text-slate-700' : 'text-slate-400'}`}>
                        {st.label}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs pt-1 text-slate-700">
                <div>Est Weight: <strong>{activeOrder.estimatedWeightKg || 5} KG</strong></div>
                <div>Actual Scale: <strong>{activeOrder.actualWeightKg !== null && activeOrder.actualWeightKg !== undefined ? `${activeOrder.actualWeightKg} KG` : 'Pending weigh-in'}</strong></div>
                <div>Amount: <strong>฿{activeOrder.totalPrice} THB</strong></div>
                <div>Speed: <span className="font-semibold text-sky-800">{(activeOrder.turnaroundSpeed || 'standard_48h').replace(/_/g, ' ')}</span></div>
              </div>

              <div className="text-xs text-slate-500 pt-2 border-t border-sky-200/60 flex items-center justify-between flex-wrap gap-2">
                <span>Pickup: {activeOrder.pickupDate} ({activeOrder.pickupTime})</span>
                <span>📦 {activeOrder.pickupAddress || activeOrder.condoName || activeOrder.district}</span>
              </div>
            </div>
          </div>
          
          {/* Pre-Payment Update Success Notification Toast */}
          {trackerSuccessMsg && (
            <div className="p-4 rounded-2xl bg-emerald-600 text-white text-xs font-bold shadow-md flex items-center justify-between gap-3 animate-fadeIn">
              <div className="flex items-center gap-2.5">
                <Icon name="check" className="w-5 h-5 text-emerald-200 shrink-0" />
                <span>{trackerSuccessMsg}</span>
              </div>
              <button
                type="button"
                onClick={() => setTrackerSuccessMsg('')}
                className="p-1 hover:bg-emerald-700 rounded-lg text-emerald-100 transition"
              >
                <Icon name="x" className="w-4 h-4" />
              </button>
            </div>
          )}

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
                      🚀 Same Day Express (&lt;18:00)
                    </span>
                  ) : (activeOrder.turnaroundSpeed === 'next_day_24h' || activeOrder.turnaroundSpeed === 'next_day') ? (
                    <span className="px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 border border-sky-300 font-bold text-[10px]">
                      ⚡ Next Day (24h)
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 font-semibold text-[10px]">
                      🕒 Standard (48h)
                    </span>
                  )}
                  {!isPaid && (
                    <button
                      type="button"
                      onClick={() => {
                        setTrackerServiceId(activeOrder.serviceId || 'wash_fold');
                        setTrackerTurnaroundSpeed(activeOrder.turnaroundSpeed || 'standard_48h');
                        setShowServiceChangeModal(true);
                      }}
                      className="px-2.5 py-0.5 rounded-full bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 font-extrabold text-[10px] transition inline-flex items-center gap-1 shadow-xs"
                      title="Flexible pre-payment plan revision"
                    >
                      <Icon name="clock" className="w-3 h-3 text-amber-600" />
                      <span>Change Service / Speed</span>
                    </button>
                  )}
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

            {/* 6-Stage Progress Stepper: TBA, Scheduled, Billing, In Process, Ready for Delivery, Delivered */}
            <div className="py-6 overflow-x-auto">
              <div className="min-w-[620px] grid grid-cols-6 gap-2 relative">
                {/* Connecting Line between steps */}
                <div className="absolute top-4 left-[8%] right-[8%] h-1 bg-slate-200 -z-0">
                  <div 
                    className="h-full bg-sky-600 transition-all duration-500"
                    style={{
                      width: `${Math.max(0, Math.min(100, ((currentStepNumber - 1) / (progressSteps.length - 1)) * 100))}%`
                    }}
                  />
                </div>

                {progressSteps.map((step, idx) => {
                  const isDone = currentStepNumber >= (idx + 1);
                  const isCurrent = currentStepNumber === (idx + 1);
                  return (
                    <div key={step.key} className="flex flex-col items-center text-center z-10 px-1">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center font-extrabold text-xs transition-all ${
                        isDone
                          ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30'
                          : 'bg-white text-slate-400 border-2 border-slate-300'
                      } ${isCurrent ? 'ring-4 ring-sky-100 ring-offset-2' : ''}`}>
                        {isDone ? <Icon name="check" className="w-5 h-5" /> : (idx + 1)}
                      </div>
                      <span className={`text-[11px] font-black mt-2 leading-tight ${
                        isCurrent ? 'text-sky-600' : isDone ? 'text-slate-900' : 'text-slate-400'
                      }`}>
                        {step.label}
                      </span>
                      <span className="text-[9px] text-slate-500 hidden sm:block mt-0.5 leading-snug">
                        {step.desc}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Delivery Rider Dispatch Alert */}
            {activeOrder.assignedRider && (
              <div className="mb-6 p-4 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shrink-0">
                    <Icon name="truck" className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-extrabold text-indigo-950 block">Express Delivery Courier Assigned</span>
                    <span className="text-indigo-800/80 font-medium">
                      Rider: <strong>{activeOrder.assignedRider}</strong>
                    </span>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-indigo-100 border border-indigo-300 text-indigo-900 font-extrabold text-[10px]">
                  🛵 On Dispatch Duty
                </span>
              </div>
            )}

            {/* Weight / Quantity Audit Box */}
            {(() => {
              const hasMultiItems = Array.isArray(activeOrder.items) && activeOrder.items.length > 0;
              const isPiece = !hasMultiItems && (activeOrder.unit === 'piece' || activeOrder.pricingType === 'piece' || (activeOrder.quantity !== null && activeOrder.quantity !== undefined && activeOrder.quantity > 0));
              const unitLbl = isPiece ? (activeOrder.unit || 'Piece') : 'KG';
              const intakeQty = isPiece ? (activeOrder.quantity || activeOrder.estimatedWeightKg || 1) : activeOrder.estimatedWeightKg;
              const actualQty = isPiece ? (activeOrder.quantity || activeOrder.actualWeightKg || activeOrder.estimatedWeightKg || 1) : activeOrder.actualWeightKg;

              return (
                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/80 mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Icon name={hasMultiItems ? 'layers' : isPiece ? 'layers' : 'scale'} className="w-4 h-4 text-sky-600" />
                    <h4 className="text-xs font-extrabold uppercase tracking-wide text-slate-700">
                      {hasMultiItems ? `Multi-Service Intake & Order Audit (${activeOrder.items.length} Items)` : isPiece ? 'Item Quantity & Facility Intake Audit' : `Digital Scale Weight Audit (Min ${activeOrder.minWeightAppliedKg || 5.0} KG)`}
                    </h4>
                  </div>

                  {hasMultiItems ? (
                    <div className="space-y-2 mb-4">
                      {activeOrder.items.map((it, idx) => {
                        const itIsPiece = it.pricingType === 'piece' || it.unit === 'piece';
                        const itUnit = it.unit || (itIsPiece ? 'pc' : 'KG');
                        const itQty = itIsPiece ? it.quantity : (it.estimatedWeightKg || it.billableAmount || 1);
                        return (
                          <div key={idx} className="bg-white p-3 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900">{it.serviceName}</span>
                              <span className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                                {itQty} {itUnit} @ ฿{it.pricePerKg}/{itUnit}
                              </span>
                            </div>
                            <span className="font-extrabold text-slate-800 font-mono">฿{it.subtotal} THB</span>
                          </div>
                        );
                      })}
                    </div>
                  ) : null}

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                    <div className="bg-white p-3.5 rounded-xl border border-slate-200">
                      <div className="text-[11px] text-slate-500 font-medium">{hasMultiItems ? 'Selected Services' : isPiece ? 'Customer Order Count' : 'Customer Estimated'}</div>
                      <div className="text-lg font-black text-slate-800 mt-0.5">
                        {hasMultiItems ? `${activeOrder.items.length} Services` : `${intakeQty} ${unitLbl}${isPiece && intakeQty > 1 ? 's' : ''}`}
                      </div>
                    </div>

                    <div className="bg-white p-3.5 rounded-xl border border-slate-200">
                      <div className="text-[11px] text-slate-500 font-medium">{hasMultiItems ? 'Facility Verification' : isPiece ? 'Facility Intake Count' : 'Facility Scale Weighed'}</div>
                      <div className="text-lg font-black text-sky-600 mt-0.5">
                        {hasMultiItems ? 'Verified Intake' : isPiece ? `${actualQty} ${unitLbl}${actualQty > 1 ? 's' : ''} Verified` : (activeOrder.actualWeightKg ? `${activeOrder.actualWeightKg} KG` : 'Pending Scale Intake')}
                      </div>
                    </div>

                    <div className="bg-white p-3.5 rounded-xl border border-slate-200">
                      <div className="text-[11px] text-slate-500 font-medium">
                        {isPaid || isPaymentAllowed ? 'Final Invoice Total' : 'Estimated Amount (Pre-Weigh)'}
                      </div>
                      <div className={`text-lg font-black mt-0.5 ${isPaid || isPaymentAllowed ? 'text-emerald-600' : 'text-slate-700'}`}>
                        {isPaid || isPaymentAllowed ? `฿${activeOrder.totalPrice} THB` : `~฿${activeOrder.totalPrice} THB`}
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 text-[11px] text-slate-500 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      {!hasMultiItems && <span>Rate: ฿{activeOrder.pricePerKg} / {unitLbl} {!isPiece && `(Min ${activeOrder.minWeightAppliedKg || 5.0} KG applied)`}</span>}
                      {Number(activeOrder.deliveryFee) > 0 ? (
                        <span className="font-semibold text-slate-700">• Fixed Delivery: ฿{activeOrder.deliveryFee} THB ({activeOrder.city || 'Bangkok'} · {activeOrder.subdistrict || activeOrder.district || activeOrder.postalCode})</span>
                      ) : (
                        <span className="font-semibold text-emerald-600">• FREE {activeOrder.city || 'Bangkok'} Delivery Promo</span>
                      )}
                    </div>
                    <span className="text-emerald-700 font-semibold">
                      ✓ Verified by Bangkok Care Team &amp; Digital Scales
                    </span>
                  </div>
                </div>
              );
            })()}

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
                  ) : isPaymentAllowed ? (
                    <span className="text-amber-400">PENDING PAYMENT</span>
                  ) : (
                    <span className="text-sky-300">AWAITING WEIGH-IN &amp; BILL GENERATION</span>
                  )}
                </div>
                <div className="text-xs text-slate-300 mt-0.5 leading-relaxed max-w-xl">
                  {isPaid ? (
                    <span>
                      Payment verified via {activeOrder.paymentMethod || 'Beam Checkout'} (Ref: {activeOrder.paymentRef || 'TXN-089123'}) •{' '}
                      <strong className="text-emerald-300">Official Receipt #RCP-{activeOrder.id} Issued</strong>
                    </span>
                  ) : isPaymentAllowed ? (
                    <span>No cash handled by couriers. Official bill generated after facility weigh-in — please pay securely online via PromptPay QR or Credit Card.</span>
                  ) : (
                    <span>Payment is not available yet. Our team must first bring back your laundry, weigh it on our certified digital scale, and generate your official bill in <strong>Stage 3 (Billing)</strong> before online payment is unlocked by our admin.</span>
                  )}
                </div>
              </div>

              <div className="shrink-0 w-full sm:w-auto">
                {isPaid ? (
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                    <div className="px-4 py-2.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center justify-center gap-2">
                      <Icon name="check" className="w-4 h-4 text-emerald-400" />
                      <span>Payment Complete</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowReceiptModal(true)}
                      className="px-4 py-2.5 rounded-xl bg-white text-slate-900 hover:bg-emerald-50 font-extrabold text-xs shadow-md transition flex items-center justify-center gap-2"
                    >
                      <Icon name="receipt" className="w-4 h-4 text-emerald-600" />
                      <span>Official Receipt (#RCP-{activeOrder.id})</span>
                    </button>
                  </div>
                ) : isPaymentAllowed ? (
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => {
                        setTrackerServiceId(activeOrder.serviceId || 'wash_fold');
                        setTrackerTurnaroundSpeed(activeOrder.turnaroundSpeed || 'standard_48h');
                        setShowServiceChangeModal(true);
                      }}
                      className="px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition flex items-center justify-center gap-2"
                      title="Adjust service plan or turnaround speed before payment"
                    >
                      <Icon name="clock" className="w-4 h-4 text-amber-400" />
                      <span>Change Service / Speed</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowPaymentModal(true)}
                      className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-extrabold text-xs shadow-lg shadow-emerald-500/30 transition flex items-center justify-center gap-2"
                    >
                      <Icon name="receipt" className="w-4 h-4" />
                      <span>Pay ฿{activeOrder.totalPrice} THB (PromptPay / Card)</span>
                    </button>
                  </div>
                ) : (
                  <div className="px-4 py-3 rounded-xl bg-slate-800/90 text-slate-300 border border-slate-700 text-xs font-bold flex items-center justify-center gap-2">
                    <span>🔒</span>
                    <span>Payment Locked Until Weighed &amp; Billed (Stage 3)</span>
                  </div>
                )}
              </div>
            </div>

            {/* Delivery & Condo Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div>
                  <div className="text-slate-400 uppercase font-bold text-[10px] tracking-wider mb-1">
                    📦 {activeOrder.city || 'Bangkok'} Pickup Location
                  </div>
                  <div className="font-extrabold text-slate-900 text-sm">
                    {activeOrder.pickupAddress || activeOrder.condoName}
                  </div>
                  <div className="text-slate-600">{activeOrder.roomNumber || 'Condo Lobby / Juristic'}</div>
                  <div className="text-slate-500 mt-0.5">
                    {activeOrder.subdistrict ? `${activeOrder.subdistrict}, ` : ''}{activeOrder.district ? `${activeOrder.district}, ` : ''}{activeOrder.city || 'Bangkok'}{activeOrder.postalCode ? ` (📮 ${activeOrder.postalCode})` : ''}
                  </div>
                </div>
                {activeOrder.deliveryAddress && activeOrder.deliveryAddress !== activeOrder.pickupAddress && (
                  <div className="pt-2 border-t border-slate-200">
                    <div className="text-emerald-700 uppercase font-bold text-[10px] tracking-wider mb-0.5">
                      🚚 Return Delivery Location
                    </div>
                    <div className="font-extrabold text-slate-900 text-xs">
                      {activeOrder.deliveryAddress}
                    </div>
                  </div>
                )}
                {activeOrder.leaveWithJuristic !== false ? (
                  <span className="inline-block mt-1 px-2 py-0.5 rounded bg-sky-100 text-sky-800 text-[10px] font-bold">
                    🏢 Juristic Reception Drop-Off Authorized
                  </span>
                ) : (
                  <span className="inline-block mt-1 px-2 py-0.5 rounded bg-amber-100 text-amber-900 text-[10px] font-bold border border-amber-200">
                    🤝 Meet Up in Person (Subject to Rider Availability)
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
                {activeOrder.deliveryDate && (
                  <div>Est. Return Delivery: <strong>{activeOrder.deliveryDate} {activeOrder.deliveryTime ? `(${activeOrder.deliveryTime})` : ''}</strong></div>
                )}
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
                  <Icon name="phone" className="w-4 h-4 text-emerald-600" />
                  <h4 className="text-sm font-extrabold text-slate-900">
                    Need Support or Have a Question about this Order?
                  </h4>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Call or WhatsApp us at +66 80 888 9885, or submit a support ticket below.
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
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-bold text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200">
                      <div>
                        Reporting regarding Order: <span className="font-mono text-sky-600">{activeOrder.id}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 font-normal">
                        Customer: <strong>{activeOrder.customerName}</strong> ({activeOrder.contactChannel.toUpperCase()})
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Issue Category */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Issue Category / Type <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={incidentCategory}
                          onChange={(e) => setIncidentCategory(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-sky-500 font-semibold text-slate-800"
                        >
                          {INCIDENT_CATEGORIES.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </div>

                      {/* Severity / Urgency Level */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Urgency Level
                        </label>
                        <div className="grid grid-cols-3 gap-1.5">
                          {INCIDENT_SEVERITIES.map(sev => (
                            <button
                              key={sev.key}
                              type="button"
                              onClick={() => setIncidentSeverity(sev.key)}
                              className={`py-2 px-2 rounded-xl text-xs font-bold transition border text-center ${
                                incidentSeverity === sev.key
                                  ? sev.badgeClass + ' ring-2 ring-offset-1 ring-slate-400 font-extrabold shadow-xs'
                                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                              }`}
                            >
                              {sev.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Affected Garment / Item Description */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Affected Garment / Item Description
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. White silk button shirt, Navy linen trousers, King-size duvet cover"
                        value={incidentAffectedItem}
                        onChange={(e) => setIncidentAffectedItem(e.target.value.toUpperCase())}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-sky-500 uppercase placeholder:normal-case"
                      />
                    </div>

                    {/* Subject */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Topic / Subject <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Coffee stain treatment on collar / Urgent delivery schedule inquiry"
                        value={incidentSubject}
                        onChange={(e) => setIncidentSubject(e.target.value.toUpperCase())}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-sky-500 uppercase placeholder:normal-case"
                      />
                    </div>

                    {/* Detailed Message */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Detailed Explanation / Instructions <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        rows="3"
                        required
                        placeholder="Please describe the issue in detail. For stain treatment, specify what caused it if known (coffee, oil, wine)..."
                        value={incidentMessage}
                        onChange={(e) => setIncidentMessage(e.target.value.toUpperCase())}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-sky-500 uppercase placeholder:normal-case"
                      />
                    </div>

                    {/* Image Attachment Dropzone */}
                    <div className="pt-1">
                      <ImageUploadZone
                        imageData={incidentImageData}
                        onImageSelected={(dataUrl) => setIncidentImageData(dataUrl)}
                        onImageRemoved={() => setIncidentImageData(null)}
                        label="Attach Photo Evidence / Garment Image"
                        hint="Upload a clear photo of the garment, stain spot, care label, or packaging."
                      />
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <span className="text-[11px] text-slate-400">
                        Response sent via WhatsApp, Phone call, or Email.
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
