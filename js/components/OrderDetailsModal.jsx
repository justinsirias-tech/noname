import React, { useState, useEffect } from 'react';
import { Icon } from './Icons.jsx';
import { ORDER_STATUSES, INITIAL_SERVICES, AVAILABLE_DELIVERY_RIDERS } from '../data/servicesData.js';
import { getLineOaAddFriendUrl, laundryStore } from '../store.js';
import { InvoiceModal } from './InvoiceModal.jsx';

export function OrderDetailsModal({
  order,
  services = [],
  onClose,
  onUpdateOrder,
  onMarkPaid
}) {
  if (!order) return null;

  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  // ESC key listener to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' || e.key === 'Esc') {
        if (showInvoiceModal) {
          setShowInvoiceModal(false);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showInvoiceModal, onClose]);

  // Available services list
  const allServices = (services && services.length > 0) ? services : (laundryStore.services || INITIAL_SERVICES);

  // Helper to get default rate for a given service and turnaround speed
  const getRateForSpeed = (srv, speed) => {
    if (!srv) return 70;
    const fallbackStd = (srv.id === 'wash_fold' || !srv.id) ? 70 : (srv.standardPricePerKg || srv.pricePerKg || 70);
    const stdPrice = Number(srv.standardPricePerKg !== undefined ? srv.standardPricePerKg : (srv.pricePerKg || fallbackStd));
    if (speed === 'same_day') {
      return srv.sameDayPricePerKg !== undefined ? Number(srv.sameDayPricePerKg) : Math.round(stdPrice * 1.75);
    }
    if (speed === 'next_day_24h' || speed === 'next_day') {
      return srv.nextDayPricePerKg !== undefined ? Number(srv.nextDayPricePerKg) : Math.round(stdPrice * 1.3);
    }
    return stdPrice;
  };

  const formatSpeedLabel = (speed) => {
    if (speed === 'same_day') return 'Same Day';
    if (speed === 'next_day_24h' || speed === 'next_day') return 'Next Day';
    return 'Standard (2 Days)';
  };

  // Find initial matching service
  const initialSrv = allServices.find(s => 
    s.id === order.serviceId || 
    (s.name && order.serviceName && s.name.toLowerCase() === order.serviceName.toLowerCase())
  ) || allServices[0];

  const [editStatus, setEditStatus] = useState(order.status || 'TBA');
  const [editAssignedRider, setEditAssignedRider] = useState(order.assignedRider || '');
  const [editWeight, setEditWeight] = useState(order.actualWeightKg !== null && order.actualWeightKg !== undefined ? order.actualWeightKg : (order.estimatedWeightKg || 4.0));
  const [editTag, setEditTag] = useState(order.tagNumber === 'TAG-PENDING' ? '' : (order.tagNumber || ''));
  const [editNote, setEditNote] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const [copiedCustomerMsg, setCopiedCustomerMsg] = useState(false);
  const [sendingBillingEmail, setSendingBillingEmail] = useState(false);
  const [billingEmailSentToast, setBillingEmailSentToast] = useState('');

  // Flexible Service & Turnaround Speed State
  const [editServiceId, setEditServiceId] = useState(initialSrv?.id || 'wash_fold');
  const [editTurnaroundSpeed, setEditTurnaroundSpeed] = useState(order.turnaroundSpeed || 'standard_48h');
  
  const menuRate = getRateForSpeed(initialSrv, order.turnaroundSpeed || 'standard_48h');
  const initialRate = (order.pricePerKg && Number(order.pricePerKg) !== 65) 
    ? Number(order.pricePerKg) 
    : menuRate;
  const [editCustomRate, setEditCustomRate] = useState(initialRate);

  const [isEditingService, setIsEditingService] = useState(false);
  const [editDeliveryDate, setEditDeliveryDate] = useState(order.deliveryDate || '');
  const [editDeliveryTime, setEditDeliveryTime] = useState(order.deliveryTime || '');

  const activeSrv = allServices.find(s => s.id === editServiceId) || initialSrv || allServices[0];
  const activeMinWeight = activeSrv?.minWeightKg || order.minWeightAppliedKg || 4.0;
  const currentRate = (editCustomRate !== '' && editCustomRate !== undefined && editCustomRate !== null)
    ? Number(editCustomRate)
    : getRateForSpeed(activeSrv, editTurnaroundSpeed);

  // Recalculated price estimate based on modal inputs and scale weight
  const previewWeight = parseFloat(editWeight) || order.estimatedWeightKg || 4.0;
  const billableKg = Math.max(previewWeight, activeMinWeight);

  const orderItems = Array.isArray(order.items) && order.items.length > 0 ? order.items : null;
  const isMultiItem = Boolean(orderItems && orderItems.length > 1);
  const isSinglePiece = !isMultiItem && (order.unit === 'piece' || activeSrv.pricingType === 'piece' || activeSrv.unit === 'piece');

  // Compute live items breakdown reflecting editTurnaroundSpeed and editWeight
  const computedItems = orderItems ? orderItems.map(item => {
    const srv = allServices.find(s => s.id === item.serviceId || (s.name && (item.name || item.serviceName) && s.name.toLowerCase() === (item.name || item.serviceName).toLowerCase())) || {};
    const isPieceItem = item.pricingType === 'piece' || item.unit === 'piece' || srv.pricingType === 'piece' || srv.unit === 'piece';
    
    // Determine rate from current service menu definition or active speed
    const srvMenuRate = getRateForSpeed(srv, editTurnaroundSpeed);
    let rate = srvMenuRate;
    if (editTurnaroundSpeed === order.turnaroundSpeed) {
      const existingRate = Number(item.rate || item.pricePerKg || 0);
      if (existingRate && existingRate !== 65) {
        rate = existingRate;
      }
    }
    
    let billable = Number(item.billableAmount || item.quantity || 1);
    let weight = item.estimatedWeightKg !== undefined ? item.estimatedWeightKg : null;
    
    if (!isPieceItem) {
      const weightItems = orderItems.filter(i => i.pricingType !== 'piece' && i.unit !== 'piece');
      if (weightItems.length === 1 && editWeight !== '' && editWeight !== null && editWeight !== undefined) {
        weight = parseFloat(editWeight);
      } else {
        weight = parseFloat(item.actualWeightKg) || parseFloat(item.estimatedWeightKg) || 4.0;
      }
      const minW = srv.minWeightKg || 4.0;
      billable = Math.max(weight, minW);
    }
    
    const subtotal = Math.round(billable * rate);
    return {
      ...item,
      name: item.name || item.serviceName || srv.name || 'Service',
      serviceName: item.serviceName || item.name || srv.name || 'Service',
      pricingType: isPieceItem ? 'piece' : 'weight',
      unit: isPieceItem ? 'piece' : 'KG',
      rate,
      pricePerKg: rate,
      estimatedWeightKg: isPieceItem ? null : (item.estimatedWeightKg !== undefined ? item.estimatedWeightKg : weight),
      actualWeightKg: isPieceItem ? null : (editWeight && orderItems.filter(i => i.pricingType !== 'piece' && i.unit !== 'piece').length === 1 ? parseFloat(editWeight) : item.actualWeightKg),
      billableAmount: billable,
      quantity: isPieceItem ? billable : (item.quantity || 1),
      subtotal
    };
  }) : [
    {
      serviceId: activeSrv.id,
      name: activeSrv.name,
      serviceName: activeSrv.name,
      pricingType: isSinglePiece ? 'piece' : 'weight',
      unit: isSinglePiece ? 'piece' : 'KG',
      rate: currentRate,
      pricePerKg: currentRate,
      estimatedWeightKg: isSinglePiece ? null : (order.estimatedWeightKg || 4.0),
      actualWeightKg: isSinglePiece ? null : (editWeight !== '' ? parseFloat(editWeight) : order.actualWeightKg),
      billableAmount: isSinglePiece ? (Number(order.quantity) || 1) : billableKg,
      quantity: isSinglePiece ? (Number(order.quantity) || 1) : 1,
      subtotal: Math.round((isSinglePiece ? (Number(order.quantity) || 1) : billableKg) * currentRate)
    }
  ];

  const previewServiceSubtotal = computedItems
    ? computedItems.reduce((acc, it) => acc + (Number(it.subtotal) || 0), 0)
    : (isSinglePiece
        ? Math.round((Number(order.quantity) || 1) * currentRate)
        : Math.round(billableKg * currentRate));

  const deliveryFee = Number(order.deliveryFee !== undefined && order.deliveryFee !== null ? order.deliveryFee : 0);
  const previewPrice = previewServiceSubtotal + deliveryFee;

  const meta = ORDER_STATUSES[editStatus] || { label: editStatus, color: 'bg-slate-100 text-slate-800' };
  const isPaid = order.paymentStatus === 'PAID';

  // Live order snapshot for invoice generation
  const activeOrderForInvoice = {
    ...order,
    serviceId: activeSrv?.id || order.serviceId,
    serviceName: isMultiItem ? order.serviceName : (activeSrv?.name || order.serviceName),
    items: computedItems || order.items || [],
    turnaroundSpeed: editTurnaroundSpeed,
    actualWeightKg: editWeight !== '' && editWeight !== null && editWeight !== undefined ? Number(editWeight) : order.actualWeightKg,
    pricePerKg: currentRate,
    minWeightAppliedKg: activeMinWeight,
    serviceSubtotal: previewServiceSubtotal,
    deliveryFee: deliveryFee,
    postalCode: order.postalCode || '10110',
    totalPrice: previewPrice,
    deliveryDate: editDeliveryDate || order.deliveryDate,
    deliveryTime: editDeliveryTime || order.deliveryTime,
    tagNumber: editTag || order.tagNumber
  };

  const calculateSuggestedDelivery = (speed) => {
    if (!order.pickupDate) return { date: order.deliveryDate || '', time: order.deliveryTime || '' };
    try {
      const parts = order.pickupDate.split('-');
      if (parts.length === 3) {
        const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
        if (speed === 'same_day') {
          const yyyy = d.getFullYear();
          const mm = String(d.getMonth() + 1).padStart(2, '0');
          const dd = String(d.getDate()).padStart(2, '0');
          return { date: `${yyyy}-${mm}-${dd}`, time: 'Delivered before 18:00 (Same Day)' };
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
          return { date: `${yyyy}-${mm}-${dd}`, time: order.pickupTime || '14:00 - 16:00 (Standard 2 Days)' };
        }
      }
    } catch (e) {
      console.warn('Error calculating delivery date:', e);
    }
    return { date: order.deliveryDate || '', time: order.deliveryTime || '' };
  };

  const handleServiceChange = (newSrvId) => {
    const target = allServices.find(s => s.id === newSrvId);
    if (!target) return;
    setEditServiceId(newSrvId);
    const newSpeed = editTurnaroundSpeed;
    const autoRate = getRateForSpeed(target, newSpeed);
    setEditCustomRate(autoRate);
    const suggested = calculateSuggestedDelivery(newSpeed);
    setEditDeliveryDate(suggested.date);
    setEditDeliveryTime(suggested.time);
  };

  const handleTurnaroundChange = (newSpeed) => {
    setEditTurnaroundSpeed(newSpeed);
    const autoRate = getRateForSpeed(activeSrv, newSpeed);
    setEditCustomRate(autoRate);
    const suggested = calculateSuggestedDelivery(newSpeed);
    setEditDeliveryDate(suggested.date);
    setEditDeliveryTime(suggested.time);
  };

  const handleCopyId = () => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(order.id);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  // Generates clean, friendly confirmed billing text with direct payment link
  const getCustomerMessageText = () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
    const gatewayUrl = `${origin}/?track=${encodeURIComponent(order.id)}&pay=1`;
    const speed = order.turnaroundSpeed === 'same_day' ? 'Same Day' : (order.turnaroundSpeed?.includes('next_day') ? 'Next Day' : 'Standard (2 Days)');
    const isPaid = order.paymentStatus === 'PAID';
    const finalWeight = editWeight !== '' ? parseFloat(editWeight) : (order.actualWeightKg || order.estimatedWeightKg || 4.0);

    return `🧺 NoName Laundry Bangkok
Confirmed Billing & Cashless Payment Request

Order #${order.id}
Customer: ${order.customerName}

We have completed intake weighing for your laundry:
• Service: ${activeSrv?.name || order.serviceName} (${speed})
• Verified Weight: ${finalWeight} KG
• Confirmed Total: ฿${previewPrice || order.totalPrice || 0} THB
• Payment: ${isPaid ? 'PAID ✅' : 'Pending Payment (100% Cashless)'}

👉 Cashless Payment Link:
${gatewayUrl}

(PromptPay QR Code from any Thai bank & Credit/Debit Cards accepted)

Need assistance? Phone / WhatsApp: +66 80 888 9885
LINE: @nonamelaundry`;
  };

  const formatDispatchTime = (isoString) => {
    if (!isoString) return '';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) + ' at ' + d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return isoString;
    }
  };

  const handleSendBillingEmail = async () => {
    if (!order) return;
    setSendingBillingEmail(true);
    setBillingEmailSentToast('');
    try {
      const finalWeight = editWeight !== '' ? parseFloat(editWeight) : order.actualWeightKg;
      const res = await fetch(`/api/orders/${encodeURIComponent(order.id)}/send-billing`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientEmail: order.email,
          actualWeightKg: finalWeight,
          totalPrice: previewPrice,
          serviceName: activeSrv?.name || order.serviceName,
          items: computedItems || order.items
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        const sentAt = data.billingSentAt || new Date().toISOString();
        order.billingSentAt = sentAt;
        order.billingChannel = 'EMAIL';
        setBillingEmailSentToast(`✓ Tax invoice & cashless payment link sent automatically to ${order.email || 'customer'}!`);
        if (onUpdateOrder) {
          onUpdateOrder(order.id, order.status, `Official Tax Invoice sent via Email to ${order.email || order.contactValue}`, finalWeight, order.tagNumber, {
            billingSentAt: sentAt,
            billingChannel: 'EMAIL'
          });
        }
      } else {
        const errMsg = data.error || data.reason || 'Email delivery failed';
        setBillingEmailSentToast(`⚠️ Failed to send email: ${errMsg}`);
      }
      setTimeout(() => setBillingEmailSentToast(''), 7000);
    } catch (err) {
      console.warn('Send billing error:', err);
      setBillingEmailSentToast(`⚠ Network error sending email: ${err.message}`);
      setTimeout(() => setBillingEmailSentToast(''), 5000);
    } finally {
      setSendingBillingEmail(false);
    }
  };

  const handleOpenWhatsApp = async () => {
    const url = getCustomerChatUrl();
    if (url && url !== '#') {
      window.open(url, '_blank');
    }
    const nowIso = new Date().toISOString();
    order.billingSentAt = nowIso;
    order.billingChannel = 'WHATSAPP';
    setBillingEmailSentToast(`✓ Invoice dispatched to customer via WhatsApp!`);
    setTimeout(() => setBillingEmailSentToast(''), 5000);
    try {
      await fetch(`/api/orders/${encodeURIComponent(order.id)}/record-invoice-sent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channel: 'WHATSAPP' })
      });
    } catch (e) {
      console.warn('Failed to record whatsapp invoice sent:', e);
    }
    if (onUpdateOrder) {
      onUpdateOrder(order.id, order.status, `Official Tax Invoice dispatched to customer via WhatsApp`, order.actualWeightKg, order.tagNumber, {
        billingSentAt: nowIso,
        billingChannel: 'WHATSAPP'
      });
    }
  };

  const handleOpenLine = async () => {
    const lineUrl = getLineOaAddFriendUrl(order.contactValue);
    if (lineUrl) window.open(lineUrl, '_blank');
    const nowIso = new Date().toISOString();
    order.billingSentAt = nowIso;
    order.billingChannel = 'LINE';
    setBillingEmailSentToast(`✓ Invoice dispatched to customer via LINE OA!`);
    setTimeout(() => setBillingEmailSentToast(''), 5000);
    try {
      await fetch(`/api/orders/${encodeURIComponent(order.id)}/record-invoice-sent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channel: 'LINE' })
      });
    } catch (e) {
      console.warn('Failed to record line invoice sent:', e);
    }
    if (onUpdateOrder) {
      onUpdateOrder(order.id, order.status, `Official Tax Invoice dispatched to customer via LINE`, order.actualWeightKg, order.tagNumber, {
        billingSentAt: nowIso,
        billingChannel: 'LINE'
      });
    }
  };

  // Direct customer contact URLs with nicely formatted message & gateway link
  const getCustomerChatUrl = () => {
    const msg = getCustomerMessageText();
    if (order.contactChannel === 'whatsapp') {
      const cleanPhone = (order.contactValue || '').replace(/[^0-9]/g, '');
      let formattedPhone = cleanPhone;
      if (formattedPhone.startsWith('0')) formattedPhone = '66' + formattedPhone.substring(1);
      return formattedPhone.length >= 9
        ? `https://wa.me/${formattedPhone}?text=${encodeURIComponent(msg)}`
        : `https://wa.me/?text=${encodeURIComponent(msg)}`;
    }
    if (order.contactChannel === 'line') {
      return getLineOaAddFriendUrl(order.contactValue);
    }
    return '#';
  };

  const handleCopyCustomerMessage = () => {
    const text = getCustomerMessageText();
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text);
      setCopiedCustomerMsg(true);
      setTimeout(() => setCopiedCustomerMsg(false), 2500);
    }
  };

  const handleSaveUpdate = async (e) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    try {
      const finalWeight = editWeight !== '' ? parseFloat(editWeight) : null;
      const finalTag = editTag.trim() || order.tagNumber;

      const isServiceChanged = editServiceId !== (order.serviceId || initialSrv?.id) ||
        editTurnaroundSpeed !== (order.turnaroundSpeed || 'standard_48h') ||
        currentRate !== Number(order.pricePerKg);

      let defaultNote = '';
      if (editStatus !== order.status && isServiceChanged) {
        defaultNote = `Stage moved to ${ORDER_STATUSES[editStatus]?.label || editStatus}. Service adjusted to ${isMultiItem ? order.serviceName : activeSrv.name} (${formatSpeedLabel(editTurnaroundSpeed)}). Total: ฿${previewPrice} THB.`;
      } else if (isServiceChanged) {
        defaultNote = `Service adjusted to ${isMultiItem ? order.serviceName : activeSrv.name} (${formatSpeedLabel(editTurnaroundSpeed)}). Total: ฿${previewPrice} THB.`;
      } else if (editStatus !== order.status) {
        defaultNote = `Status updated to ${ORDER_STATUSES[editStatus]?.label || editStatus} by staff.`;
      } else {
        defaultNote = 'Order details updated by staff.';
      }

      const finalNote = editNote.trim() || defaultNote;

      const serviceUpdates = {
        serviceId: activeSrv.id,
        serviceName: isMultiItem ? order.serviceName : activeSrv.name,
        turnaroundSpeed: editTurnaroundSpeed,
        items: computedItems || order.items || [],
        pricePerKg: currentRate,
        minWeightAppliedKg: activeMinWeight,
        serviceSubtotal: previewServiceSubtotal,
        deliveryFee: deliveryFee,
        totalPrice: previewPrice,
        deliveryDate: editDeliveryDate || order.deliveryDate,
        deliveryTime: editDeliveryTime || order.deliveryTime,
        assignedRider: editAssignedRider || null
      };

      if (onUpdateOrder) {
        await onUpdateOrder(order.id, editStatus, finalNote, finalWeight, finalTag, serviceUpdates);
      }
      setEditNote('');
      onClose();
    } catch (err) {
      console.error('Error updating order:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Top Header */}
        <div className="px-6 py-5 bg-slate-900 text-white flex items-center justify-between gap-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="font-mono text-lg sm:text-xl font-black text-sky-400 tracking-wider">
                {order.id}
              </span>
              <button
                type="button"
                onClick={handleCopyId}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-xs transition"
                title="Copy Order Tracking ID"
              >
                {copiedId ? (
                  <span className="text-emerald-400 text-[11px] font-bold">Copied!</span>
                ) : (
                  <Icon name="fileText" className="w-4 h-4" />
                )}
              </button>
            </div>

            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${meta.color}`}>
              {meta.label}
            </span>

            {editTurnaroundSpeed === 'same_day' ? (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500 text-white border border-amber-400">
                🚀 SAME DAY
              </span>
            ) : (editTurnaroundSpeed === 'next_day_24h' || editTurnaroundSpeed === 'next_day') ? (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-500 text-white border border-sky-400">
                ⚡ NEXT DAY
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-800 text-slate-300 border border-slate-700">
                🕒 STANDARD (2 DAYS)
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowInvoiceModal(true)}
              className="px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
              title="Create & Send Tax Invoice / Payment Link"
            >
              <Icon name="fileText" className="w-3.5 h-3.5" />
              <span>Invoice & Pay Link</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition flex items-center gap-1.5"
              title="Close Order Details (Esc)"
            >
              <span className="hidden sm:inline text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">ESC</span>
              <Icon name="x" className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-800 flex-1">
          
          {/* Grid Layout: Left Column (Details) / Right Column (Actions & Timeline) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

            {/* Left 7 Columns: Full Customer, Address, Service & Financial Information */}
            <div className="lg:col-span-7 space-y-5">
              
              {/* Customer & Direct Contact */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
                  <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                    <Icon name="user" className="w-4 h-4 text-sky-600" />
                    <span>Customer & Contact</span>
                  </div>
                  <span className="text-[11px] text-slate-500 font-medium">
                    Channel: <strong className="uppercase text-slate-800 font-bold">{order.contactChannel}</strong>
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px] font-semibold">Full Name</span>
                    <span className="font-bold text-slate-900 text-sm">{order.customerName}</span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[11px] font-semibold">Contact Handle / Number</span>
                    <span className="font-mono font-bold text-slate-900">{order.contactValue}</span>
                  </div>

                  {order.email && (
                    <div className="sm:col-span-2">
                      <span className="text-slate-400 block text-[11px] font-semibold">Email</span>
                      <span className="font-mono text-slate-700">{order.email}</span>
                    </div>
                  )}
                </div>

                {/* INVOICE DISPATCH STATUS REMINDER BANNER */}
                <div className="pt-2">
                  {order.billingSentAt ? (
                    <div className="p-3 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-300 text-xs shadow-2xs flex items-center justify-between gap-3 animate-fadeIn">
                      <div className="flex items-center gap-2.5">
                        <span className="flex h-3 w-3 relative shrink-0">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-600"></span>
                        </span>
                        <div>
                          <div className="font-black text-emerald-950 flex items-center gap-1.5">
                            <Icon name="checkCircle" className="w-4 h-4 text-emerald-600" />
                            <span>Tax Invoice & Payment Link Dispatched</span>
                          </div>
                          <div className="text-[11px] text-emerald-800 mt-0.5 font-medium">
                            Sent via <strong className="uppercase font-bold text-emerald-900">{order.billingChannel || 'Email'}</strong> • {formatDispatchTime(order.billingSentAt)}
                          </div>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded-xl bg-emerald-200/90 text-emerald-950 text-[10px] font-black uppercase tracking-wider shrink-0 border border-emerald-300 shadow-2xs">
                        INVOICE SENT ✓
                      </span>
                    </div>
                  ) : (
                    <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-xs flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shrink-0"></span>
                        <span className="font-bold text-amber-900">
                          Invoice Not Sent Yet
                        </span>
                      </div>
                      <span className="text-[10px] text-amber-700 font-semibold">
                        Reminder: Send via Email or WhatsApp below
                      </span>
                    </div>
                  )}
                </div>

                {/* Direct Customer Action Link */}
                <div className="pt-2 border-t border-slate-200/80 flex items-center gap-2 flex-wrap">
                  {order.contactChannel === 'whatsapp' ? (
                    <button
                      type="button"
                      onClick={handleOpenWhatsApp}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-sm transition"
                      title="Open WhatsApp Chat with customer & record invoice dispatched"
                    >
                      <Icon name="whatsapp" className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Open Customer Chat (WHATSAPP)</span>
                      <Icon name="externalLink" className="w-3 h-3 text-slate-400" />
                    </button>
                  ) : order.contactChannel === 'line' ? (
                    <button
                      type="button"
                      onClick={handleOpenLine}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-sm transition"
                      title="Open LINE Official Chat & record invoice dispatched"
                    >
                      <Icon name="line" className="w-3.5 h-3.5 text-green-400" />
                      <span>Open Customer Chat (LINE)</span>
                      <Icon name="externalLink" className="w-3 h-3 text-slate-400" />
                    </button>
                  ) : order.contactChannel === 'email' ? (
                    <button
                      type="button"
                      onClick={handleSendBillingEmail}
                      disabled={sendingBillingEmail}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-bold shadow-sm transition"
                      title="Send Invoice & Payment Link directly to customer's email"
                    >
                      <Icon name="mail" className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{sendingBillingEmail ? 'Sending Email...' : (order.billingSentAt ? '✓ Invoice Sent (Resend)' : 'Send Invoice Email')}</span>
                    </button>
                  ) : null}

                  <button
                    type="button"
                    onClick={handleCopyCustomerMessage}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold border border-slate-300 transition"
                    title="Copy formatted customer update message with cashless gateway link"
                  >
                    <Icon name="copy" className="w-3.5 h-3.5 text-slate-600" />
                    <span>{copiedCustomerMsg ? 'Copied Message & Link! ✓' : 'Copy Confirmed Billing'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSendBillingEmail}
                    disabled={sendingBillingEmail}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-white text-xs font-bold shadow-sm transition ${
                      order.billingSentAt && order.billingChannel === 'EMAIL'
                        ? 'bg-emerald-700 hover:bg-emerald-600'
                        : 'bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50'
                    }`}
                    title="Send Confirmed Billing & Cashless Payment Link via Email"
                  >
                    <Icon name={order.billingSentAt && order.billingChannel === 'EMAIL' ? 'check' : 'mail'} className="w-3.5 h-3.5" />
                    <span>{sendingBillingEmail ? 'Sending...' : (order.billingSentAt && order.billingChannel === 'EMAIL' ? '✓ Invoice Sent (Resend?)' : 'Send Invoice Email')}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowInvoiceModal(true)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-sm transition"
                    title="Generate & View Official Tax Invoice"
                  >
                    <Icon name="fileText" className="w-3.5 h-3.5" />
                    <span>Invoice / Pay Link</span>
                  </button>
                </div>
              </div>

              {billingEmailSentToast && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 font-bold text-xs flex items-center justify-between animate-fadeIn">
                  <span>{billingEmailSentToast}</span>
                  <button type="button" onClick={() => setBillingEmailSentToast('')} className="text-emerald-600 hover:text-emerald-900 font-bold">✕</button>
                </div>
              )}

              {/* Delivery & Juristic Location */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
                  <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                    <Icon name="building" className="w-4 h-4 text-sky-600" />
                    <span>Bangkok Condominium & Juristic</span>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    order.leaveWithJuristic
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-amber-100 text-amber-800 border border-amber-300'
                  }`}>
                    {order.leaveWithJuristic ? '✓ Juristic Drop-Off' : '🤝 Meet In Person (Subject to Rider)'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px] font-semibold">Condominium / Residence</span>
                    <span className="font-bold text-slate-900">{order.condoName || 'Bangkok Condo'}</span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[11px] font-semibold">Unit / Room #</span>
                    <span className="font-bold text-slate-900">{order.roomNumber || 'Lobby Juristic'}</span>
                  </div>

                  <div className="sm:col-span-2">
                    <span className="text-slate-400 block text-[11px] font-semibold">Destination & Sub-district</span>
                    <span className="font-medium text-slate-800">
                      {order.subdistrict ? `${order.subdistrict}, ` : ''}{order.district ? `${order.district}, ` : ''}{order.city || 'Bangkok'} {order.postalCode ? `(📮 ${order.postalCode})` : ''}
                    </span>
                  </div>
                </div>

                {order.specialInstructions && (
                  <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900">
                    <strong className="block text-amber-950 font-bold mb-0.5">Special Instructions:</strong>
                    <span>"{order.specialInstructions}"</span>
                  </div>
                )}
              </div>

              {/* Service, Weights & Cashless Billing */}
              <div className="p-5 rounded-2xl bg-sky-50/60 border border-sky-200 space-y-3.5">
                <div className="flex items-center justify-between border-b border-sky-200/80 pb-2.5 flex-wrap gap-2">
                  <div className="flex items-center gap-2 font-bold text-sky-950 text-sm">
                    <Icon name="scale" className="w-4 h-4 text-sky-600" />
                    <span>Laundry Service & Certified Weight</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-sky-700 bg-white px-2 py-0.5 rounded-lg border border-sky-200">
                      {isMultiItem
                        ? `Multi-Service (${computedItems.length} items)`
                        : (isSinglePiece
                            ? `฿${currentRate} / piece`
                            : `฿${currentRate} / KG`)}
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsEditingService(!isEditingService)}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-2xs ${
                        isEditingService
                          ? 'bg-slate-900 text-white hover:bg-slate-800'
                          : 'bg-sky-600 text-white hover:bg-sky-500'
                      }`}
                    >
                      <Icon name={isEditingService ? 'check' : 'edit'} className="w-3.5 h-3.5" />
                      <span>{isEditingService ? 'Done Adjusting' : 'Change Service / Speed'}</span>
                    </button>
                  </div>
                </div>

                {/* Inline Service & Turnaround Speed Editor (Expands on Click) */}
                {isEditingService && (
                  <div className="p-4 bg-white rounded-2xl border-2 border-sky-300 shadow-sm space-y-3.5 animate-fadeIn">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                      <span className="flex items-center gap-1.5 text-sky-800">
                        <Icon name="tag" className="w-3.5 h-3.5 text-sky-600" />
                        <span>Change Laundry Service & Turnaround (Last-Minute Adjustment)</span>
                      </span>
                      <span className="text-[10px] text-slate-400 font-normal">Pricing & delivery recalculate automatically</span>
                    </div>

                    {/* 1. Laundry Service Options */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1.5 uppercase tracking-wide">
                        Choose Laundry Service
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        {allServices.map(srv => {
                          const isSelected = editServiceId === srv.id;
                          return (
                            <button
                              key={srv.id}
                              type="button"
                              onClick={() => handleServiceChange(srv.id)}
                              className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                                isSelected
                                  ? 'border-sky-500 bg-sky-50/90 ring-2 ring-sky-200 shadow-xs'
                                  : 'border-slate-200 hover:border-sky-300 bg-slate-50/60'
                              }`}
                            >
                              <div>
                                <div className="font-bold text-slate-900 text-xs flex items-center justify-between">
                                  <span>{srv.name}</span>
                                  {isSelected && <Icon name="check" className="w-3.5 h-3.5 text-sky-600" />}
                                </div>
                                <div className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">{srv.nameTh}</div>
                              </div>
                              <div className="mt-2 text-[11px] font-mono font-bold text-sky-700">
                                ฿{srv.standardPricePerKg || srv.pricePerKg} / KG
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* 2. Turnaround Delivery Speed Options */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1.5 uppercase tracking-wide">
                        Choose Turnaround Speed
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        {/* Standard (2 Days) */}
                        <button
                          type="button"
                          onClick={() => handleTurnaroundChange('standard_48h')}
                          className={`p-2.5 rounded-xl border text-left transition ${
                            editTurnaroundSpeed === 'standard_48h' || editTurnaroundSpeed === 'standard'
                              ? 'border-slate-800 bg-slate-900 text-white shadow-xs'
                              : 'border-slate-200 hover:border-slate-300 bg-slate-50 text-slate-700'
                          }`}
                        >
                          <div className="font-bold text-xs flex items-center gap-1">
                            <span>🕒 Standard (2 Days)</span>
                          </div>
                          <div className="text-[10px] opacity-80 mt-0.5">
                            ฿{getRateForSpeed(activeSrv, 'standard_48h')} / KG • Regular queue
                          </div>
                        </button>

                        {/* Next Day */}
                        <button
                          type="button"
                          onClick={() => handleTurnaroundChange('next_day_24h')}
                          className={`p-2.5 rounded-xl border text-left transition ${
                            editTurnaroundSpeed === 'next_day_24h' || editTurnaroundSpeed === 'next_day'
                              ? 'border-sky-600 bg-sky-600 text-white shadow-xs'
                              : 'border-sky-200 hover:border-sky-300 bg-sky-50/50 text-sky-800'
                          }`}
                        >
                          <div className="font-bold text-xs flex items-center gap-1">
                            <span>⚡ Next Day</span>
                          </div>
                          <div className="text-[10px] opacity-80 mt-0.5">
                            ฿{getRateForSpeed(activeSrv, 'next_day_24h')} / KG • Next Day
                          </div>
                        </button>

                        {/* Same Day */}
                        <button
                          type="button"
                          onClick={() => handleTurnaroundChange('same_day')}
                          className={`p-2.5 rounded-xl border text-left transition ${
                            editTurnaroundSpeed === 'same_day'
                              ? 'border-amber-500 bg-amber-500 text-white shadow-xs'
                              : 'border-amber-200 hover:border-amber-300 bg-amber-50/50 text-amber-800'
                          }`}
                        >
                          <div className="font-bold text-xs flex items-center gap-1">
                            <span>🚀 Same Day</span>
                          </div>
                          <div className="text-[10px] opacity-80 mt-0.5">
                            ฿{getRateForSpeed(activeSrv, 'same_day')} / KG • Same Day
                          </div>
                        </button>
                      </div>
                    </div>

                    {/* 3. Custom Rate Override & Schedule Tweaks */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                          Billing Rate per KG
                        </label>
                        <div className="flex items-center gap-2">
                          <div className="relative flex-1">
                            <span className="absolute left-3 top-2 text-slate-400 text-xs font-bold">฿</span>
                            <input
                              type="number"
                              step="1"
                              min="1"
                              value={editCustomRate}
                              onChange={(e) => setEditCustomRate(Number(e.target.value))}
                              className="w-full pl-7 pr-3 py-1.5 rounded-xl border border-slate-300 text-xs font-bold font-mono bg-white"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => setEditCustomRate(getRateForSpeed(activeSrv, editTurnaroundSpeed))}
                            className="text-[10px] text-sky-600 hover:text-sky-800 font-bold underline whitespace-nowrap"
                            title="Reset to default rate for selected service and speed"
                          >
                            Reset Default
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                          Delivery Window Override
                        </label>
                        <input
                          type="text"
                          value={`${editDeliveryDate} • ${editDeliveryTime}`}
                          onChange={(e) => {
                            const val = e.target.value;
                            const parts = val.split('•');
                            if (parts[0]) setEditDeliveryDate(parts[0].trim());
                            if (parts[1]) setEditDeliveryTime(parts[1].trim());
                          }}
                          placeholder="YYYY-MM-DD • Window"
                          className="w-full px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-semibold bg-white"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* 4 Summary Metric Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 bg-white rounded-xl border border-sky-100">
                    <span className="text-slate-400 block text-[10px] font-semibold uppercase">Service</span>
                    <span className="font-bold text-slate-900 line-clamp-2" title={isMultiItem ? (order.serviceName || 'Multi-Service Order') : activeSrv.name}>
                      {isMultiItem ? (order.serviceName || 'Multi-Service Order') : activeSrv.name}
                    </span>
                    {activeSrv.id !== (order.serviceId || initialSrv?.id) && (
                      <span className="inline-block mt-0.5 px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-bold text-[9px]">Modified</span>
                    )}
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-sky-100">
                    <span className="text-slate-400 block text-[10px] font-semibold uppercase">Turnaround Speed</span>
                    {editTurnaroundSpeed === 'same_day' ? (
                      <span className="font-bold text-amber-700 flex items-center gap-0.5">🚀 Same Day</span>
                    ) : (editTurnaroundSpeed === 'next_day_24h' || editTurnaroundSpeed === 'next_day') ? (
                      <span className="font-bold text-sky-700 flex items-center gap-0.5">⚡ Next Day</span>
                    ) : (
                      <span className="font-bold text-slate-700 flex items-center gap-0.5">🕒 Standard (2 Days)</span>
                    )}
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-sky-100">
                    <span className="text-slate-400 block text-[10px] font-semibold uppercase">Est. Customer Weight</span>
                    <span className="font-bold text-slate-700">{order.estimatedWeightKg} KG</span>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-sky-100">
                    <span className="text-slate-400 block text-[10px] font-semibold uppercase">Facility Scale Weight</span>
                    {editWeight ? (
                      <span className="font-black text-sky-700">{editWeight} KG</span>
                    ) : (
                      <span className="font-bold text-amber-600">Pending</span>
                    )}
                  </div>
                </div>

                {/* Itemized Services Breakdown Table */}
                {computedItems && computedItems.length > 0 && (
                  <div className="bg-white rounded-xl border border-sky-200 p-3.5 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-800 border-b border-slate-100 pb-2">
                      <span className="flex items-center gap-1.5 text-sky-900">
                        <Icon name="checkCircle" className="w-3.5 h-3.5 text-sky-600" />
                        <span>Itemized Services Breakdown ({computedItems.length} {computedItems.length === 1 ? 'service' : 'services'})</span>
                      </span>
                      <span className="text-[10px] text-slate-400 font-normal">Prices as set on website</span>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="text-[10px] text-slate-400 uppercase font-semibold border-b border-slate-100">
                            <th className="pb-1.5 font-bold">Service / Item</th>
                            <th className="pb-1.5 font-bold text-center">Pricing Type</th>
                            <th className="pb-1.5 font-bold text-right">Unit Rate</th>
                            <th className="pb-1.5 font-bold text-right">Qty / Weight</th>
                            <th className="pb-1.5 font-bold text-right">Subtotal</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 text-slate-700">
                          {computedItems.map((item, idx) => {
                            const isPiece = item.pricingType === 'piece' || item.unit === 'piece';
                            return (
                              <tr key={idx} className="hover:bg-slate-50/50">
                                <td className="py-2 font-semibold text-slate-900">
                                  {item.name || item.serviceName}
                                </td>
                                <td className="py-2 text-center">
                                  <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                    isPiece ? 'bg-purple-100 text-purple-800' : 'bg-sky-100 text-sky-800'
                                  }`}>
                                    {isPiece ? 'Per Piece' : 'By Weight'}
                                  </span>
                                </td>
                                <td className="py-2 text-right font-mono">
                                  ฿{item.rate} {isPiece ? '/ pc' : '/ KG'}
                                </td>
                                <td className="py-2 text-right font-mono font-medium">
                                  {isPiece ? `${item.quantity || 1} pcs` : `${item.billableAmount} KG`}
                                </td>
                                <td className="py-2 text-right font-mono font-bold text-slate-900">
                                  ฿{item.subtotal} THB
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                        <tfoot>
                          <tr className="border-t border-slate-200 text-xs font-bold text-slate-900">
                            <td colSpan="4" className="pt-2 text-right">Services Subtotal:</td>
                            <td className="pt-2 text-right font-mono text-sky-900">฿{previewServiceSubtotal} THB</td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                )}

                {/* Change Notice */}
                {(editServiceId !== (order.serviceId || initialSrv?.id) || editTurnaroundSpeed !== (order.turnaroundSpeed || 'standard_48h') || currentRate !== Number(order.pricePerKg)) && (
                  <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs flex items-center justify-between">
                    <span className="flex items-center gap-1.5 font-bold">
                      <Icon name="alertCircle" className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span>Pending Change: {activeSrv.name} • {formatSpeedLabel(editTurnaroundSpeed)} (฿{currentRate}/KG)</span>
                    </span>
                    <span className="text-[10px] text-amber-700 italic">Click "Save & Update Stage" on right to persist</span>
                  </div>
                )}

                {/* Total Cashless Price Breakdown */}
                <div className="p-4 bg-white rounded-xl border border-sky-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-[11px] text-slate-500 block">
                      {isMultiItem
                        ? `Multi-Service Total (${computedItems.length} items):`
                        : (isSinglePiece
                            ? `Total Billable (${order.quantity || 1} pcs):`
                            : `Total Billable (Min ${activeMinWeight} KG applied):`)}
                    </span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-black text-slate-900">
                        ฿{previewPrice} <span className="text-xs text-slate-500 font-normal">THB (Cashless)</span>
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      <span>Service: ฿{previewServiceSubtotal}</span>
                      {deliveryFee > 0 ? (
                        <span className="ml-1 text-slate-700 font-medium">+ Fixed Delivery: ฿{deliveryFee} ({order.city || 'Bangkok'} · {order.subdistrict || order.district || order.postalCode})</span>
                      ) : (
                        <span className="ml-1 text-emerald-600 font-bold">✓ Free Delivery Promo</span>
                      )}
                    </div>
                    {previewPrice !== Number(order.totalPrice) && (
                      <span className="text-[10px] text-amber-700 block font-bold mt-0.5">
                        (Was ฿{order.totalPrice} THB before modification)
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => setShowInvoiceModal(true)}
                      className="px-3 py-1.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-300 text-xs font-bold shadow-2xs transition flex items-center gap-1.5"
                      title="Generate Tax Invoice & Cashless Payment Request"
                    >
                      <Icon name="fileText" className="w-3.5 h-3.5 text-sky-600" />
                      <span>Invoice / Pay Link</span>
                    </button>

                    {isPaid ? (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-300">
                        <Icon name="check" className="w-3.5 h-3.5 text-emerald-600" />
                        <span>PAID via {order.paymentMethod || 'PromptPay QR'}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2.5 py-1 rounded-xl bg-amber-100 text-amber-800 text-xs font-bold border border-amber-300">
                          Awaiting Pay
                        </span>
                        {order.billingSentAt ? (
                          <span className="px-2 py-1 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-300 flex items-center gap-1" title={`Invoice dispatched via ${order.billingChannel || 'Email'}`}>
                            <Icon name="checkCircle" className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Invoice Sent ({order.billingChannel || 'Email'})</span>
                          </span>
                        ) : (
                          <span className="px-2 py-1 rounded-xl bg-slate-100 text-slate-600 text-xs font-medium border border-slate-200">
                            Invoice Not Sent
                          </span>
                        )}
                        {onMarkPaid && (
                          <button
                            type="button"
                            onClick={() => onMarkPaid(order.id, 'PromptPay QR (Gateway Test)')}
                            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm transition"
                          >
                            Mark Paid
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Accounting & Reconciliation Audit Status Bar */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-slate-500 uppercase">Audit Status:</span>
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black border ${
                      order.reconciliationStatus === 'RECONCILED'
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        : order.reconciliationStatus === 'DISCREPANCY'
                        ? 'bg-rose-100 text-rose-800 border-rose-300'
                        : 'bg-amber-100 text-amber-800 border-amber-300'
                    }`}>
                      <Icon name={order.reconciliationStatus === 'RECONCILED' ? 'checkCircle2' : (order.reconciliationStatus === 'DISCREPANCY' ? 'alertTriangle' : 'clock')} className="w-3 h-3" />
                      <span>{order.reconciliationStatus || 'UNRECONCILED'}</span>
                    </span>
                    {order.bankAccountRef && (
                      <span className="font-mono text-[11px] text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                        Ref: {order.bankAccountRef}
                      </span>
                    )}
                  </div>
                  {order.reconciliationNotes && (
                    <div className="text-[10px] text-slate-500 italic">
                      "{order.reconciliationNotes}"
                    </div>
                  )}
                </div>

                {/* Pickup & Delivery Windows */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-sky-100">
                    <Icon name="calendar" className="w-4 h-4 text-sky-500 shrink-0" />
                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold">PICKUP WINDOW</span>
                      <span className="font-bold text-slate-800">{order.pickupDate} • {order.pickupTime}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-sky-100">
                    <Icon name="clock" className="w-4 h-4 text-emerald-500 shrink-0" />
                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold">DELIVERY WINDOW</span>
                      <span className="font-bold text-slate-800">{editDeliveryDate || order.deliveryDate} • {editDeliveryTime || order.deliveryTime}</span>
                    </div>
                  </div>
                </div>

              </div>

            </div>

            {/* Right 5 Columns: Stage Controls & Full Activity Timeline */}
            <div className="lg:col-span-5 space-y-5">
              
              {/* Operator Stage Controls Card */}
              <form onSubmit={handleSaveUpdate} className="p-5 rounded-2xl bg-white border border-slate-300 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                    <Icon name="settings" className="w-4 h-4 text-sky-600" />
                    <span>Change Stage & Weights</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-semibold">Staff POS Control</span>
                </div>

                <div className="space-y-3 text-xs">
                  {/* Service & Turnaround Quick Selector in POS Control */}
                  <div className="p-3 bg-sky-50/70 rounded-xl border border-sky-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="font-bold text-sky-950 text-xs flex items-center gap-1.5">
                        <Icon name="tag" className="w-3.5 h-3.5 text-sky-600" />
                        <span>Service & Turnaround Time</span>
                      </label>
                      <span className="text-[10px] font-mono font-bold text-sky-700">
                        {isMultiItem
                          ? `${computedItems.length} Services`
                          : (isSinglePiece ? `฿${currentRate}/pc` : `฿${currentRate}/KG`)}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Service</label>
                        <select
                          value={editServiceId}
                          onChange={(e) => handleServiceChange(e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-bold text-xs"
                        >
                          {allServices.map(srv => (
                            <option key={srv.id} value={srv.id}>
                              {srv.name} (฿{srv.standardPricePerKg || srv.pricePerKg}/kg)
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Turnaround Speed</label>
                        <select
                          value={editTurnaroundSpeed}
                          onChange={(e) => handleTurnaroundChange(e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-bold text-xs"
                        >
                          <option value="standard_48h">🕒 Standard (2 Days)</option>
                          <option value="next_day_24h">⚡ Next Day</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Target Lifecycle Stage
                    </label>
                    <select
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-bold text-slate-900"
                    >
                      <option value="TBA">1. 💬 TBA (Confirm Details with Customer)</option>
                      <option value="SCHEDULED">2. 📅 Scheduled</option>
                      <option value="BILLING">3. 📄 Billing (Awaiting Payment / Send Invoice)</option>
                      <option value="IN_PROCESS">4. ⚙️ In Process (Laundry Care & Wash)</option>
                      <option value="READY_FOR_DELIVERY">5. 🛵 Ready For Delivery (Assign Rider)</option>
                      <option value="DELIVERED">6. ✅ Delivered</option>
                      <option value="CANCELLED">❌ Cancelled</option>
                    </select>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block font-bold text-slate-700">
                        Assign Delivery Rider
                      </label>
                      {editAssignedRider && (
                        <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                          🛵 Assigned
                        </span>
                      )}
                    </div>
                    <select
                      value={editAssignedRider}
                      onChange={(e) => setEditAssignedRider(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-semibold text-slate-900 text-xs"
                    >
                      <option value="">Select Rider / Courier...</option>
                      {AVAILABLE_DELIVERY_RIDERS.map((r, i) => (
                        <option key={i} value={r}>{r}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Scale Weight (KG)
                    </label>
                    <input
                      type="number"
                      step="0.05"
                      min="0"
                      placeholder="e.g. 4.80"
                      value={editWeight}
                      onChange={(e) => setEditWeight(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 font-bold bg-white text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Timeline Note (Visible in customer tracker)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Weighed on scale: 4.80 KG. Wash cycle started."
                      value={editNote}
                      onChange={(e) => setEditNote(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs"
                    />
                  </div>

                  {/* Dynamic Recalculated Total Preview */}
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[11px] text-slate-600 font-semibold block">Recalculated Total:</span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {isMultiItem
                            ? `(Subtotal ฿${previewServiceSubtotal} + ฿${deliveryFee} Deliv)`
                            : (isSinglePiece
                                ? `(${order.quantity || 1} pcs × ฿${currentRate} + ฿${deliveryFee} Deliv)`
                                : `(${billableKg} KG × ฿${currentRate}/KG + ฿${deliveryFee} Deliv)`)}
                        </span>
                      </div>
                      <span className="text-base font-black text-slate-900">฿{previewPrice} THB</span>
                    </div>

                    <div className="pt-1.5 border-t border-slate-200/80 flex items-center justify-between text-[11px]">
                      <span className="text-slate-500 font-semibold">Invoice Status:</span>
                      {order.billingSentAt ? (
                        <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-lg border border-emerald-300">
                          <Icon name="checkCircle" className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Sent via {order.billingChannel || 'Email'} ({formatDispatchTime(order.billingSentAt)})</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 font-semibold text-amber-700 bg-amber-100/70 px-2 py-0.5 rounded-lg border border-amber-300">
                          <Icon name="clock" className="w-3.5 h-3.5 text-amber-500" />
                          <span>Not Sent Yet</span>
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold text-xs shadow-sm transition flex items-center justify-center gap-1.5"
                    >
                      <Icon name="check" className="w-4 h-4" />
                      <span>{isSaving ? 'Saving...' : 'Save Stage & Weights'}</span>
                    </button>

                    <button
                      type="button"
                      disabled={sendingBillingEmail}
                      onClick={handleSendBillingEmail}
                      className={`py-2.5 px-3 rounded-xl text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-1.5 ${
                        order.billingSentAt && order.billingChannel === 'EMAIL'
                          ? 'bg-emerald-700 hover:bg-emerald-600'
                          : 'bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50'
                      }`}
                      title="Send Confirmed Billing & Cashless Payment Link to customer via Email"
                    >
                      <Icon name={order.billingSentAt && order.billingChannel === 'EMAIL' ? 'check' : 'mail'} className="w-4 h-4" />
                      <span>{sendingBillingEmail ? 'Sending...' : (order.billingSentAt && order.billingChannel === 'EMAIL' ? '✓ Invoice Sent (Resend)' : 'Send Invoice Email')}</span>
                    </button>
                  </div>
                </div>
              </form>

              {/* Chronological Audit Timeline */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <div className="flex items-center gap-2 font-bold text-slate-900 text-xs uppercase tracking-wider">
                    <Icon name="clock" className="w-3.5 h-3.5 text-slate-500" />
                    <span>Activity Audit Trail</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {order.timeline?.length || 0} events
                  </span>
                </div>

                <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                  {(order.timeline || []).map((t, idx) => {
                    const statusMeta = ORDER_STATUSES[t.status] || { label: t.status, color: 'bg-slate-200 text-slate-800' };
                    return (
                      <div key={idx} className="flex items-start gap-2.5 text-xs">
                        <div className="w-2 h-2 rounded-full bg-sky-500 mt-1.5 shrink-0" />
                        <div className="flex-1 bg-white p-2.5 rounded-xl border border-slate-200/80 shadow-2xs">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-bold text-slate-800 text-[11px]">
                              {statusMeta.label}
                            </span>
                            <span className="font-mono text-[10px] text-slate-400">
                              {t.timestamp}
                            </span>
                          </div>
                          <p className="text-slate-600 text-[11px] mt-0.5 leading-relaxed">
                            {t.note}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-500">
            Order created on: <span className="font-mono text-slate-700 font-medium">{order.createdAt ? new Date(order.createdAt).toLocaleString() : 'Recent'}</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold transition"
          >
            Close
          </button>
        </div>

      </div>

      {/* Official Tax Invoice & Cashless Payment Modal */}
      {showInvoiceModal && (
        <InvoiceModal
          order={activeOrderForInvoice}
          onClose={() => setShowInvoiceModal(false)}
          onMarkPaid={onMarkPaid}
        />
      )}
    </div>
  );
}
