import React, { useState } from 'react';
import { Icon } from './Icons.jsx';
import { ORDER_STATUSES } from '../data/servicesData.js';
import { getLineOaAddFriendUrl } from '../store.js';

export function OrderDetailsModal({
  order,
  onClose,
  onUpdateOrder,
  onMarkPaid
}) {
  if (!order) return null;

  const [editStatus, setEditStatus] = useState(order.status || 'BOOKING_REQUESTED');
  const [editWeight, setEditWeight] = useState(order.actualWeightKg !== null && order.actualWeightKg !== undefined ? order.actualWeightKg : (order.estimatedWeightKg || 4.0));
  const [editTag, setEditTag] = useState(order.tagNumber === 'TAG-PENDING' ? '' : (order.tagNumber || ''));
  const [editNote, setEditNote] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [copiedId, setCopiedId] = useState(false);

  const meta = ORDER_STATUSES[order.status] || { label: order.status, color: 'bg-slate-100 text-slate-800' };
  const isPaid = order.paymentStatus === 'PAID';

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
      const defaultNote = editStatus !== order.status
        ? `Status updated to ${ORDER_STATUSES[editStatus]?.label || editStatus} by staff.`
        : 'Order details updated by staff.';
      const finalNote = editNote.trim() || defaultNote;

      if (onUpdateOrder) {
        await onUpdateOrder(order.id, editStatus, finalNote, finalWeight, finalTag);
      }
      setEditNote('');
      onClose();
    } catch (err) {
      console.error('Error updating order:', err);
    } finally {
      setIsSaving(false);
    }
  };

  // Recalculated price estimate based on modal weight input
  const previewWeight = parseFloat(editWeight) || order.estimatedWeightKg || 4.0;
  const billableKg = Math.max(previewWeight, order.minWeightAppliedKg || 4.0);
  const previewPrice = Math.round(billableKg * (order.pricePerKg || 75));

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
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

            {order.tagNumber && order.tagNumber !== 'TAG-PENDING' && (
              <span className="font-mono text-xs font-semibold px-2.5 py-0.5 rounded-lg bg-sky-950 text-sky-300 border border-sky-800">
                🏷️ {order.tagNumber}
              </span>
            )}
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
            title="Close Order Details"
          >
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
              <div className="p-5 rounded-2xl bg-sky-50/60 border border-sky-200 space-y-3">
                <div className="flex items-center justify-between border-b border-sky-200/80 pb-2.5">
                  <div className="flex items-center gap-2 font-bold text-sky-950 text-sm">
                    <Icon name="scale" className="w-4 h-4 text-sky-600" />
                    <span>Laundry Service & Certified Weight</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-sky-700">
                    ฿{order.pricePerKg} / KG
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 bg-white rounded-xl border border-sky-100">
                    <span className="text-slate-400 block text-[10px] font-semibold uppercase">Service</span>
                    <span className="font-bold text-slate-900">{order.serviceName}</span>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-sky-100">
                    <span className="text-slate-400 block text-[10px] font-semibold uppercase">Est. Customer Weight</span>
                    <span className="font-bold text-slate-700">{order.estimatedWeightKg} KG</span>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-sky-100">
                    <span className="text-slate-400 block text-[10px] font-semibold uppercase">Facility Scale Weight</span>
                    {order.actualWeightKg ? (
                      <span className="font-black text-sky-700">{order.actualWeightKg} KG</span>
                    ) : (
                      <span className="font-bold text-amber-600">Pending</span>
                    )}
                  </div>
                </div>

                {/* Total Cashless Price Breakdown */}
                <div className="p-4 bg-white rounded-xl border border-sky-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-[11px] text-slate-500 block">
                      Total Billable (Min {order.minWeightAppliedKg || 4.0} KG applied):
                    </span>
                    <span className="text-2xl font-black text-slate-900">
                      ฿{order.totalPrice} <span className="text-xs text-slate-500 font-normal">THB (Cashless)</span>
                    </span>
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
                      <span className="font-bold text-slate-800">{order.deliveryDate} • {order.deliveryTime}</span>
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
                    <span className="text-[11px] text-slate-600 font-semibold">Recalculated Total:</span>
                    <span className="font-bold text-slate-900">฿{previewPrice} THB</span>
                  </div>

                  <button
                    type="submit"
                    disabled={isSaving}
                    className="w-full py-2.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2"
                  >
                    <Icon name="check" className="w-4 h-4" />
                    <span>{isSaving ? 'Saving to Database...' : 'Save & Update Stage'}</span>
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
