import React, { useState, useEffect } from 'react';
import { Icon } from './Icons.jsx';
import { ORDER_STATUSES, INITIAL_SERVICES } from '../data/servicesData.js';
import { getLineOaAddFriendUrl, laundryStore } from '../store.js';

export function OrderDetailsModal({
  order,
  services = [],
  onClose,
  onUpdateOrder,
  onMarkPaid
}) {
  if (!order) return null;

  // ESC key listener to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' || e.key === 'Esc') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Available services list
  const allServices = (services && services.length > 0) ? services : (laundryStore.services || INITIAL_SERVICES);

  // Helper to get default rate for a given service and turnaround speed
  const getRateForSpeed = (srv, speed) => {
    if (!srv) return 65;
    if (speed === 'same_day') {
      return srv.sameDayPricePerKg !== undefined ? Number(srv.sameDayPricePerKg) : Math.round((srv.standardPricePerKg || srv.pricePerKg || 65) * 1.75);
    }
    if (speed === 'next_day_24h' || speed === 'next_day') {
      return srv.nextDayPricePerKg !== undefined ? Number(srv.nextDayPricePerKg) : Math.round((srv.standardPricePerKg || srv.pricePerKg || 65) * 1.3);
    }
    return Number(srv.standardPricePerKg !== undefined ? srv.standardPricePerKg : (srv.pricePerKg || 65));
  };

  const formatSpeedLabel = (speed) => {
    if (speed === 'same_day') return 'Same Day (<18:00)';
    if (speed === 'next_day_24h' || speed === 'next_day') return 'Next Day (24h)';
    return 'Standard (48h)';
  };

  // Find initial matching service
  const initialSrv = allServices.find(s => 
    s.id === order.serviceId || 
    (s.name && order.serviceName && s.name.toLowerCase() === order.serviceName.toLowerCase())
  ) || allServices[0];

  const [editStatus, setEditStatus] = useState(order.status || 'BOOKING_REQUESTED');
  const [editWeight, setEditWeight] = useState(order.actualWeightKg !== null && order.actualWeightKg !== undefined ? order.actualWeightKg : (order.estimatedWeightKg || 4.0));
  const [editTag, setEditTag] = useState(order.tagNumber === 'TAG-PENDING' ? '' : (order.tagNumber || ''));
  const [editNote, setEditNote] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [copiedId, setCopiedId] = useState(false);

  // Flexible Service & Turnaround Speed State
  const [editServiceId, setEditServiceId] = useState(initialSrv?.id || 'wash_fold');
  const [editTurnaroundSpeed, setEditTurnaroundSpeed] = useState(order.turnaroundSpeed || 'standard_48h');
  const [editCustomRate, setEditCustomRate] = useState(order.pricePerKg || getRateForSpeed(initialSrv, order.turnaroundSpeed || 'standard_48h'));
  const [isEditingService, setIsEditingService] = useState(false);
  const [editDeliveryDate, setEditDeliveryDate] = useState(order.deliveryDate || '');
  const [editDeliveryTime, setEditDeliveryTime] = useState(order.deliveryTime || '');

  const activeSrv = allServices.find(s => s.id === editServiceId) || initialSrv || allServices[0];
  const activeMinWeight = activeSrv?.minWeightKg || order.minWeightAppliedKg || 4.0;
  const currentRate = (editCustomRate !== '' && editCustomRate !== undefined && editCustomRate !== null)
    ? Number(editCustomRate)
    : getRateForSpeed(activeSrv, editTurnaroundSpeed);

  // Recalculated price estimate based on modal inputs
  const previewWeight = parseFloat(editWeight) || order.estimatedWeightKg || 4.0;
  const billableKg = Math.max(previewWeight, activeMinWeight);
  const previewPrice = Math.round(billableKg * currentRate);

  const meta = ORDER_STATUSES[editStatus] || { label: editStatus, color: 'bg-slate-100 text-slate-800' };
  const isPaid = order.paymentStatus === 'PAID';

  const calculateSuggestedDelivery = (speed) => {
    if (!order.pickupDate) return { date: order.deliveryDate || '', time: order.deliveryTime || '' };
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
      console.warn('Error calculating delivery date:', e);
    }
    return { date: order.deliveryDate || '', time: order.deliveryTime || '' };
  };

  const handleServiceChange = (newSrvId) => {
    const target = allServices.find(s => s.id === newSrvId);
    if (!target) return;
    setEditServiceId(newSrvId);
    let newSpeed = editTurnaroundSpeed;
    if (target.sameDayAvailable === false && newSpeed === 'same_day') {
      newSpeed = 'next_day_24h';
      setEditTurnaroundSpeed('next_day_24h');
    }
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

  // Direct customer contact URLs
  const getCustomerChatUrl = () => {
    if (order.contactChannel === 'whatsapp') {
      const cleanPhone = (order.contactValue || '').replace(/[^0-9]/g, '');
      const text = encodeURIComponent(`Hello ${order.customerName}, this is NoName Laundry Bangkok regarding your order #${order.id}.`);
      return `https://wa.me/${cleanPhone}?text=${text}`;
    }
    if (order.contactChannel === 'line') {
      return getLineOaAddFriendUrl(order.contactValue);
    }
    if (order.contactChannel === 'email') {
      const subject = encodeURIComponent(`NoName Laundry Bangkok - Order #${order.id}`);
      return `mailto:${order.email || order.contactValue}?subject=${subject}`;
    }
    return '#';
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
        defaultNote = `Stage moved to ${ORDER_STATUSES[editStatus]?.label || editStatus}. Service adjusted to ${activeSrv.name} (${formatSpeedLabel(editTurnaroundSpeed)}) at ฿${currentRate}/KG. Total: ฿${previewPrice} THB.`;
      } else if (isServiceChanged) {
        defaultNote = `Service adjusted to ${activeSrv.name} (${formatSpeedLabel(editTurnaroundSpeed)}) at ฿${currentRate}/KG. Billable: ${billableKg} KG = ฿${previewPrice} THB.`;
      } else if (editStatus !== order.status) {
        defaultNote = `Status updated to ${ORDER_STATUSES[editStatus]?.label || editStatus} by staff.`;
      } else {
        defaultNote = 'Order details updated by staff.';
      }

      const finalNote = editNote.trim() || defaultNote;

      const serviceUpdates = {
        serviceId: activeSrv.id,
        serviceName: activeSrv.name,
        turnaroundSpeed: editTurnaroundSpeed,
        pricePerKg: currentRate,
        minWeightAppliedKg: activeMinWeight,
        totalPrice: previewPrice,
        deliveryDate: editDeliveryDate || order.deliveryDate,
        deliveryTime: editDeliveryTime || order.deliveryTime
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
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-400 text-amber-950 border border-amber-300">
                🚀 SAME DAY (&lt;18H)
              </span>
            ) : (editTurnaroundSpeed === 'next_day_24h' || editTurnaroundSpeed === 'next_day') ? (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-500 text-white border border-sky-400">
                ⚡ NEXT DAY (24H)
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-800 text-slate-300 border border-slate-700">
                🕒 STANDARD (48H)
              </span>
            )}

            {order.tagNumber && order.tagNumber !== 'TAG-PENDING' && (
              <span className="font-mono text-xs font-semibold px-2.5 py-0.5 rounded-lg bg-sky-950 text-sky-300 border border-sky-800">
                🏷️ {order.tagNumber}
              </span>
            )}
          </div>

          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition flex items-center gap-1.5"
            title="Close Order Details (Esc)"
          >
            <span className="hidden sm:inline text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">ESC</span>
            <Icon name="x" className="w-5 h-5" />
          </button>
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

                {/* Direct Customer Action Link */}
                <div className="pt-2 border-t border-slate-200/80 flex items-center gap-2">
                  <a
                    href={getCustomerChatUrl()}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-sm transition"
                  >
                    <Icon name={order.contactChannel === 'whatsapp' ? 'whatsapp' : (order.contactChannel === 'line' ? 'line' : 'mail')} className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Open Customer Chat ({order.contactChannel.toUpperCase()})</span>
                    <Icon name="externalLink" className="w-3 h-3 text-slate-400" />
                  </a>
                </div>
              </div>

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
                    {order.leaveWithJuristic ? '✓ Juristic Drop-Off' : 'Door / Counter Handover'}
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
                    <span className="text-slate-400 block text-[11px] font-semibold">District Service Area</span>
                    <span className="font-medium text-slate-800">{order.district || 'Bangkok Central Area'}</span>
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
                      ฿{currentRate} / KG
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
                        {/* Standard 48H */}
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
                            <span>🕒 Standard (48h)</span>
                          </div>
                          <div className="text-[10px] opacity-80 mt-0.5">
                            ฿{activeSrv?.standardPricePerKg || activeSrv?.pricePerKg || 65} / KG • Regular queue
                          </div>
                        </button>

                        {/* Next Day 24H */}
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
                            <span>⚡ Next Day (24h)</span>
                          </div>
                          <div className="text-[10px] opacity-80 mt-0.5">
                            ฿{activeSrv?.nextDayPricePerKg || Math.round((activeSrv?.pricePerKg || 65) * 1.3)} / KG • Fast Track
                          </div>
                        </button>

                        {/* Same Day Express */}
                        <button
                          type="button"
                          disabled={activeSrv?.sameDayAvailable === false}
                          onClick={() => handleTurnaroundChange('same_day')}
                          className={`p-2.5 rounded-xl border text-left transition ${
                            activeSrv?.sameDayAvailable === false
                              ? 'opacity-40 cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400'
                              : (editTurnaroundSpeed === 'same_day')
                              ? 'border-amber-500 bg-amber-400 text-amber-950 font-black shadow-xs'
                              : 'border-amber-200 hover:border-amber-300 bg-amber-50/60 text-amber-900'
                          }`}
                        >
                          <div className="font-bold text-xs flex items-center gap-1">
                            <span>🚀 Same Day (&lt;18h)</span>
                          </div>
                          <div className="text-[10px] opacity-80 mt-0.5">
                            {activeSrv?.sameDayAvailable === false
                              ? 'Not available for this service'
                              : `฿${activeSrv?.sameDayPricePerKg || Math.round((activeSrv?.pricePerKg || 65) * 1.75)} / KG • Before 18:00`}
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
                    <span className="font-bold text-slate-900">{activeSrv.name}</span>
                    {activeSrv.id !== (order.serviceId || initialSrv?.id) && (
                      <span className="inline-block mt-0.5 px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-bold text-[9px]">Modified</span>
                    )}
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-sky-100">
                    <span className="text-slate-400 block text-[10px] font-semibold uppercase">Turnaround Speed</span>
                    {editTurnaroundSpeed === 'same_day' ? (
                      <span className="font-bold text-amber-800 flex items-center gap-0.5">🚀 Same Day (&lt;18:00)</span>
                    ) : (editTurnaroundSpeed === 'next_day_24h' || editTurnaroundSpeed === 'next_day') ? (
                      <span className="font-bold text-sky-700 flex items-center gap-0.5">⚡ Next Day (24h)</span>
                    ) : (
                      <span className="font-bold text-slate-700 flex items-center gap-0.5">🕒 Standard (48h)</span>
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
                      Total Billable (Min {activeMinWeight} KG applied):
                    </span>
                    <span className="text-2xl font-black text-slate-900">
                      ฿{previewPrice} <span className="text-xs text-slate-500 font-normal">THB (Cashless)</span>
                    </span>
                    {previewPrice !== Number(order.totalPrice) && (
                      <span className="text-[10px] text-amber-700 block font-bold mt-0.5">
                        (Was ฿{order.totalPrice} THB before modification)
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {isPaid ? (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-300">
                        <Icon name="check" className="w-3.5 h-3.5 text-emerald-600" />
                        <span>PAID via {order.paymentMethod || 'PromptPay QR'}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-xl bg-amber-100 text-amber-800 text-xs font-bold border border-amber-300">
                          Awaiting Pay
                        </span>
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
                      <span className="text-[10px] font-mono font-bold text-sky-700">฿{currentRate}/KG</span>
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
                          <option value="standard_48h">🕒 Standard (48h)</option>
                          <option value="next_day_24h">⚡ Next Day (24h)</option>
                          {activeSrv?.sameDayAvailable !== false && (
                            <option value="same_day">🚀 Same Day (&lt;18:00)</option>
                          )}
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
                      {Object.keys(ORDER_STATUSES).map((key) => (
                        <option key={key} value={key}>
                          {ORDER_STATUSES[key].label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
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
                        Bag Tag #
                      </label>
                      <input
                        type="text"
                        placeholder="TAG-BKK-XXX"
                        value={editTag}
                        onChange={(e) => setEditTag(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-300 font-mono font-bold bg-white text-slate-900"
                      />
                    </div>
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
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] text-slate-600 font-semibold block">Recalculated Total:</span>
                      <span className="text-[10px] text-slate-400 font-mono">({billableKg} KG × ฿{currentRate}/KG)</span>
                    </div>
                    <span className="text-base font-black text-slate-900">฿{previewPrice} THB</span>
                  </div>

                  <button
                    type="submit"
                    disabled={isSaving}
                    className="w-full py-2.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2"
                  >
                    <Icon name="check" className="w-4 h-4" />
                    <span>{isSaving ? 'Saving to Database...' : 'Save & Update Stage & Service'}</span>
                  </button>
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
    </div>
  );
}
