import React, { useState } from 'react';
import { Icon } from './Icons.jsx';
import { ORDER_STATUSES, AVAILABLE_DELIVERY_RIDERS } from '../data/servicesData.js';
import { laundryStore } from '../store.js';

// Order Kanban Columns: TBA, Scheduled, Billing, In Process, Ready for Delivery, Delivered (plus Cancelled)
const KANBAN_STAGES = [
  { id: 'TBA', label: '1. TBA (Confirm Details)', icon: 'phoneCall', badgeColor: 'bg-purple-100 text-purple-800 border-purple-300', matches: ['TBA', 'BOOKING_REQUESTED', 'PENDING', 'PENDING_CONFIRMATION'] },
  { id: 'SCHEDULED', label: '2. Scheduled', icon: 'package', badgeColor: 'bg-sky-100 text-sky-800 border-sky-300', matches: ['SCHEDULED', 'PICKUP_SCHEDULED', 'PICKED_UP'] },
  { id: 'BILLING', label: '3. Billing', icon: 'receipt', badgeColor: 'bg-blue-100 text-blue-800 border-blue-300', matches: ['BILLING', 'BILLING_PENDING', 'AWAITING_PAYMENT', 'WEIGHED_INSPECTED'] },
  { id: 'IN_PROCESS', label: '4. In Process', icon: 'sparkles', badgeColor: 'bg-amber-100 text-amber-800 border-amber-300', matches: ['IN_PROCESS', 'IN_WASH', 'IRON_FOLD', 'PROCESSING'] },
  { id: 'READY_FOR_DELIVERY', label: '5. Ready For Delivery', icon: 'truck', badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-300', matches: ['READY_FOR_DELIVERY', 'OUT_FOR_DELIVERY'] },
  { id: 'DELIVERED', label: '6. Delivered', icon: 'check', badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300', matches: ['DELIVERED', 'COMPLETED'] },
  { id: 'CANCELLED', label: 'Cancelled', icon: 'x', badgeColor: 'bg-red-100 text-red-800 border-red-300', matches: ['CANCELLED'] }
];

const WORKFLOW_PHASES = [
  { id: 'all', label: 'All Stages', icon: 'grid', stageIds: null },
  { id: 'tba', label: '1. TBA', icon: 'phoneCall', stageIds: ['TBA', 'BOOKING_REQUESTED', 'PENDING', 'PENDING_CONFIRMATION'] },
  { id: 'scheduled', label: '2. Scheduled', icon: 'package', stageIds: ['SCHEDULED', 'PICKUP_SCHEDULED', 'PICKED_UP'] },
  { id: 'billing', label: '3. Billing', icon: 'receipt', stageIds: ['BILLING', 'BILLING_PENDING', 'AWAITING_PAYMENT', 'WEIGHED_INSPECTED'] },
  { id: 'in_process', label: '4. In Process', icon: 'sparkles', stageIds: ['IN_PROCESS', 'IN_WASH', 'IRON_FOLD', 'PROCESSING'] },
  { id: 'ready_for_delivery', label: '5. Ready Delivery', icon: 'truck', stageIds: ['READY_FOR_DELIVERY', 'OUT_FOR_DELIVERY'] },
  { id: 'delivered', label: '6. Delivered', icon: 'check', stageIds: ['DELIVERED', 'COMPLETED'] },
  { id: 'cancelled', label: 'Cancelled', icon: 'x', stageIds: ['CANCELLED'] }
];

export function OrderKanban({
  orders = [],
  onSelectOrder,
  onOpenInvoice,
  onUpdateOrderStatus,
  onMarkPaid
}) {
  const [draggingOrderId, setDraggingOrderId] = useState(null);
  const [dragOverColKey, setDragOverColKey] = useState(null);
  const [layoutMode, setLayoutMode] = useState('fit'); // 'fit' (screen-fit responsive grid, default) or 'scroll' (horizontal scroll)
  const [selectedPhase, setSelectedPhase] = useState('all');

  const handleDragStart = (e, orderId) => {
    e.dataTransfer.setData('text/plain', orderId);
    e.dataTransfer.effectAllowed = 'move';
    setDraggingOrderId(orderId);
  };

  const handleDragEnd = () => {
    setDraggingOrderId(null);
    setDragOverColKey(null);
  };

  const handleDragOver = (e, stageId) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverColKey !== stageId) {
      setDragOverColKey(stageId);
    }
  };

  const handleDragLeave = (e, stageId) => {
    // Only clear if leaving the column element itself
    if (e.currentTarget.contains(e.relatedTarget)) return;
    if (dragOverColKey === stageId) {
      setDragOverColKey(null);
    }
  };

  const handleDrop = (e, targetStatus) => {
    e.preventDefault();
    const orderId = e.dataTransfer.getData('text/plain') || draggingOrderId;
    setDragOverColKey(null);
    setDraggingOrderId(null);

    if (!orderId) return;

    const order = orders.find(o => o.id === orderId);
    if (!order || order.status === targetStatus) return;

    const stageMeta = ORDER_STATUSES[targetStatus] || { label: targetStatus };
    const note = `Moved to ${stageMeta.label} via Kanban drag & drop.`;

    if (onUpdateOrderStatus) {
      onUpdateOrderStatus(order.id, targetStatus, note, order.actualWeightKg, order.tagNumber);
    }
  };

  const getPhaseCount = (phase) => {
    if (!phase.stageIds) return orders.length;
    return orders.filter(o => phase.stageIds.includes((o.status || '').toUpperCase().trim())).length;
  };

  const displayedStages = selectedPhase === 'all'
    ? KANBAN_STAGES
    : KANBAN_STAGES.filter(stage => {
        const phase = WORKFLOW_PHASES.find(p => p.id === selectedPhase);
        return phase && phase.stageIds ? phase.stageIds.includes(stage.id) : true;
      });

  // Calculate container classes based on layout mode and selected phase
  const getContainerClassName = () => {
    if (layoutMode === 'scroll') {
      return 'flex gap-3.5 overflow-x-auto pb-4 pt-1 snap-x scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent';
    }
    // Fit mode: responsive CSS grid that fits 100% within the screen width without horizontal scrollbars
    if (selectedPhase !== 'all') {
      if (displayedStages.length === 1) {
        return 'grid grid-cols-1 max-w-md w-full gap-4 pt-1';
      }
      return 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 w-full pt-1';
    }
    return 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-3.5 w-full pt-1';
  };

  return (
    <div className="w-full">
      
      {/* Workflow Phase Filter & Screen Fit Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1 hidden sm:inline">
            Workflow:
          </span>
          {WORKFLOW_PHASES.map((phase) => {
            const count = getPhaseCount(phase);
            const isActive = selectedPhase === phase.id;
            return (
              <button
                key={phase.id}
                type="button"
                onClick={() => setSelectedPhase(phase.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border ${
                  isActive
                    ? 'bg-sky-600 text-white border-sky-600 shadow-sm'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Icon name={phase.icon} className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                <span>{phase.label}</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-black ${
                  isActive ? 'bg-white/25 text-white' : 'bg-slate-200 text-slate-700'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* View Mode Toggle: Screen Fit vs Wide Scroll */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            type="button"
            onClick={() => setLayoutMode('fit')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              layoutMode === 'fit'
                ? 'bg-white text-sky-700 shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
            title="Fit completely into screen without scrolling left or right"
          >
            <Icon name="grid" className="w-3.5 h-3.5" />
            <span>Fit Screen</span>
          </button>
          <button
            type="button"
            onClick={() => setLayoutMode('scroll')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              layoutMode === 'scroll'
                ? 'bg-white text-sky-700 shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
            title="Traditional wide horizontal scrolling board"
          >
            <Icon name="columns" className="w-3.5 h-3.5" />
            <span>Wide Scroll</span>
          </button>
        </div>
      </div>

      {/* Kanban Board Container */}
      <div className={getContainerClassName()}>
        {displayedStages.map((stage) => {
          const columnOrders = orders.filter(o => 
            stage.matches 
              ? stage.matches.includes((o.status || '').toUpperCase().trim()) 
              : (o.status || '').toUpperCase().trim() === stage.id
          );
          const isOver = dragOverColKey === stage.id;
          const stageTheme = {
            TBA: { headerBg: 'bg-purple-600 text-white', colBg: 'bg-purple-50/60 border-purple-200' },
            SCHEDULED: { headerBg: 'bg-sky-600 text-white', colBg: 'bg-sky-50/60 border-sky-200' },
            BILLING: { headerBg: 'bg-blue-600 text-white', colBg: 'bg-blue-50/60 border-blue-200' },
            IN_PROCESS: { headerBg: 'bg-amber-600 text-white', colBg: 'bg-amber-50/60 border-amber-200' },
            READY_FOR_DELIVERY: { headerBg: 'bg-indigo-600 text-white', colBg: 'bg-indigo-50/60 border-indigo-200' },
            DELIVERED: { headerBg: 'bg-emerald-600 text-white', colBg: 'bg-emerald-50/60 border-emerald-200' },
            CANCELLED: { headerBg: 'bg-rose-600 text-white', colBg: 'bg-rose-50/60 border-rose-200' }
          }[stage.id] || { headerBg: 'bg-slate-700 text-white', colBg: 'bg-slate-100/90 border-slate-200' };

          return (
            <div
              key={stage.id}
              onDragOver={(e) => handleDragOver(e, stage.id)}
              onDragLeave={(e) => handleDragLeave(e, stage.id)}
              onDrop={(e) => handleDrop(e, stage.id)}
              className={`rounded-2xl p-3 flex flex-col transition-all duration-200 select-none ${
                layoutMode === 'scroll' ? 'flex-shrink-0 w-72 sm:w-80 snap-start' : 'w-full min-w-0'
              } ${
                isOver
                  ? 'bg-sky-50 border-2 border-dashed border-sky-400 shadow-lg ring-4 ring-sky-100'
                  : columnOrders.length > 0
                  ? `${stageTheme.colBg} border shadow-xs hover:border-slate-300`
                  : 'bg-slate-100/90 border border-slate-200 shadow-2xs hover:border-slate-300'
              }`}
            >
              
              {/* Column Header */}
              <div className="flex items-center justify-between gap-1.5 px-1 py-1 mb-2.5">
                <div className="flex items-center gap-1.5 min-w-0">
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 shadow-2xs ${
                    columnOrders.length > 0 ? stageTheme.headerBg : 'bg-white text-slate-700'
                  }`}>
                    <Icon name={stage.icon} className="w-3.5 h-3.5" />
                  </div>
                  <h4 className="font-bold text-slate-900 text-xs truncate" title={stage.label}>
                    {stage.label}
                  </h4>
                </div>

                <span className={`px-2 py-0.5 rounded-full text-[11px] font-mono font-black shrink-0 shadow-2xs ${
                  columnOrders.length > 0
                    ? `${stageTheme.headerBg}`
                    : 'bg-slate-200/70 text-slate-500'
                }`}>
                  {columnOrders.length}
                </span>
              </div>

              {/* Drop Target Indicator when Dragging Over */}
              {isOver && (
                <div className="mb-2 p-2.5 rounded-2xl bg-sky-100/80 border border-sky-300 text-sky-800 text-[11px] font-bold flex items-center justify-center gap-1.5 animate-pulse">
                  <Icon name="plus" className="w-3.5 h-3.5 text-sky-600" />
                  <span>Drop here to set "{stage.label}"</span>
                </div>
              )}

              {/* Column Cards Container */}
              <div className="space-y-2.5 overflow-y-auto max-h-[calc(100vh-280px)] min-h-[140px] pr-0.5">
                {columnOrders.length === 0 ? (
                  <div className="h-28 rounded-2xl border-2 border-dashed border-slate-200/70 flex flex-col items-center justify-center text-slate-400 text-xs">
                    <span className="text-[11px] font-medium">No orders in this stage</span>
                    <span className="text-[10px] text-slate-300 mt-0.5">Drag orders here</span>
                  </div>
                ) : (
                  columnOrders.map((order) => {
                    const isPaid = order.paymentStatus === 'PAID';
                    const isDraggingThis = draggingOrderId === order.id;
                    const cleanPhone = (order.contactValue || order.mobileNumber || '').replace(/[^\d+]/g, '');
                    const digitsOnly = cleanPhone.replace(/\D/g, '');

                    // Pre-filled social channel message
                    const socialMessage = `Hi ${order.customerName}, this is NoName Laundry Bangkok regarding your order ${order.id}. Let's confirm your pickup details: ${order.condoName || order.district || 'Bangkok'}.`;
                    const waUrl = digitsOnly.length >= 8
                      ? `https://wa.me/${digitsOnly}?text=${encodeURIComponent(socialMessage)}`
                      : `https://wa.me/66948821920?text=${encodeURIComponent(socialMessage)}`;
                    const lineUrl = 'https://line.me/R/ti/p/@nonamelaundry';
                    const telUrl = cleanPhone ? `tel:${cleanPhone}` : null;

                    return (
                      <div
                        key={order.id}
                        draggable={true}
                        onDragStart={(e) => handleDragStart(e, order.id)}
                        onDragEnd={handleDragEnd}
                        onClick={() => onSelectOrder && onSelectOrder(order)}
                        className={`group p-3.5 rounded-2xl bg-white border shadow-xs transition-all duration-150 cursor-grab active:cursor-grabbing hover:shadow-md hover:border-sky-300 relative ${
                          isDraggingThis
                            ? 'opacity-40 scale-95 border-sky-400 shadow-none'
                            : 'border-slate-200/90 hover:-translate-y-0.5'
                        }`}
                      >
                        {/* Top: Tracking ID + Tag # + Drag Handle */}
                        <div className="flex items-center justify-between gap-1 mb-1.5">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className="font-mono text-xs font-black text-slate-900 group-hover:text-sky-600 transition truncate">
                              {order.id}
                            </span>
                          </div>

                          <div 
                            className="text-slate-300 group-hover:text-slate-500 p-0.5 transition cursor-grab shrink-0"
                            title="Drag to change status"
                          >
                            <Icon name="gripVertical" className="w-3.5 h-3.5" />
                          </div>
                        </div>

                        {/* Customer & Condo */}
                        <div className="mb-2">
                          <div className="font-bold text-slate-900 text-xs truncate">
                            {order.customerName}
                          </div>
                          <div className="text-[11px] text-slate-500 truncate flex items-center gap-1 mt-0.5">
                            <Icon name="building" className="w-3 h-3 text-slate-400 shrink-0" />
                            <span>{order.condoName || order.district || 'Bangkok'}</span>
                          </div>
                        </div>

                        {/* Service & Weight Pill */}
                        <div className="flex items-center justify-between gap-1.5 mb-2.5 text-[10px]">
                          <div className="flex items-center gap-1 min-w-0">
                            {order.turnaroundSpeed === 'same_day' ? (
                              <span className="px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-300 font-extrabold text-[9px] shrink-0">
                                🚀 Same Day
                              </span>
                            ) : (order.turnaroundSpeed === 'next_day_24h' || order.turnaroundSpeed === 'next_day') ? (
                              <span className="px-1.5 py-0.5 rounded-md bg-sky-100 text-sky-800 border border-sky-300 font-bold text-[9px] shrink-0">
                                ⚡ Next Day
                              </span>
                            ) : null}
                            <span className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 font-semibold truncate">
                              {order.serviceName}
                            </span>
                          </div>

                          {order.actualWeightKg ? (
                            <span className="font-bold text-sky-700 bg-sky-50 px-1.5 py-0.5 rounded border border-sky-200 whitespace-nowrap">
                              {order.actualWeightKg} KG
                            </span>
                          ) : (
                            <span className="text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 whitespace-nowrap font-medium">
                              Est: {order.estimatedWeightKg} KG
                            </span>
                          )}
                        </div>

                        {/* Card Mid: Price, Cashless Paid Status & Invoice */}
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                          <span className="font-black text-slate-900 text-sm">
                            ฿{order.totalPrice}
                          </span>

                          <div className="flex items-center gap-1.5">
                            {onOpenInvoice && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onOpenInvoice(order);
                                }}
                                className="p-1 rounded-md text-slate-400 hover:text-sky-700 hover:bg-sky-50 transition"
                                title="Generate & Send Tax Invoice / Payment Link"
                              >
                                <Icon name="fileText" className="w-3.5 h-3.5" />
                              </button>
                            )}
                            {isPaid ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                                <Icon name="check" className="w-2.5 h-2.5" /> PAID
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                                Awaiting Pay
                              </span>
                            )}
                          </div>
                        </div>

                        {/* STAGE 1: TBA -> SOCIAL CHANNELS & CONFIRM DETAILS */}
                        {stage.id === 'TBA' && (
                          <div className="mt-2.5 pt-2 border-t border-purple-200/80 bg-purple-50/70 -mx-3.5 -mb-1 px-3 py-2 rounded-b-xl space-y-2" onClick={e => e.stopPropagation()}>
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-extrabold text-purple-900 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-ping"></span>
                                Confirm via Social:
                              </span>
                              <div className="flex items-center gap-1">
                                <a
                                  href={waUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="p-1 rounded-md bg-emerald-500 hover:bg-emerald-600 text-white transition shadow-2xs"
                                  title="Chat via WhatsApp"
                                >
                                  <Icon name="whatsapp" className="w-3 h-3" />
                                </a>
                                <a
                                  href={lineUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="p-1 rounded-md bg-green-500 hover:bg-green-600 text-white transition shadow-2xs"
                                  title="Chat via LINE OA"
                                >
                                  <Icon name="line" className="w-3 h-3" />
                                </a>
                                {telUrl && (
                                  <a
                                    href={telUrl}
                                    className="p-1 rounded-md bg-slate-700 hover:bg-slate-800 text-white transition shadow-2xs"
                                    title="Call Customer"
                                  >
                                    <Icon name="phone" className="w-3 h-3" />
                                  </a>
                                )}
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => {
                                if (onUpdateOrderStatus) {
                                  onUpdateOrderStatus(
                                    order.id,
                                    'SCHEDULED',
                                    'Details confirmed with customer via social channel. Moved to Scheduled.',
                                    order.actualWeightKg,
                                    order.tagNumber
                                  );
                                }
                              }}
                              className="w-full py-1.5 px-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-[10px] font-extrabold shadow-2xs transition flex items-center justify-center gap-1 cursor-pointer"
                              title="Confirm details & move to Scheduled"
                            >
                              <Icon name="check" className="w-3 h-3" />
                              <span>Confirm Details & Schedule ➔</span>
                            </button>
                          </div>
                        )}

                        {/* STAGE 2: SCHEDULED -> QUICK ACTION TO ISSUE BILLING */}
                        {stage.id === 'SCHEDULED' && (
                          <div className="mt-2.5 pt-2 border-t border-sky-200/80 bg-sky-50/70 -mx-3.5 -mb-1 px-3 py-1.5 rounded-b-xl flex items-center justify-between" onClick={e => e.stopPropagation()}>
                            <span className="text-[10px] font-bold text-sky-800">
                              Pickup Booked
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                if (onUpdateOrderStatus) {
                                  onUpdateOrderStatus(
                                    order.id,
                                    'BILLING',
                                    'Pickup complete. Moved to Billing station.',
                                    order.actualWeightKg,
                                    order.tagNumber
                                  );
                                }
                              }}
                              className="px-2.5 py-1 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-[10px] font-extrabold shadow-2xs transition flex items-center gap-1 cursor-pointer"
                              title="Move order to Billing"
                            >
                              <span>Issue Billing ➔</span>
                            </button>
                          </div>
                        )}

                        {/* STAGE 3: BILLING -> MONITOR STATUS & SEND BILLING / START PROCESS */}
                        {stage.id === 'BILLING' && (
                          <div className="mt-2.5 pt-2 border-t border-blue-200/80 bg-blue-50/70 -mx-3.5 -mb-1 px-3 py-2 rounded-b-xl space-y-2" onClick={e => e.stopPropagation()}>
                            <div className="flex items-center justify-between text-[10px]">
                              <span className="font-bold text-blue-900">Billing Status:</span>
                              {isPaid ? (
                                <span className="font-extrabold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded">
                                  ✓ PAID
                                </span>
                              ) : order.billingSentAt ? (
                                <span className="font-bold text-blue-700 bg-blue-100 px-1.5 py-0.2 rounded" title={`Sent: ${new Date(order.billingSentAt).toLocaleTimeString()}`}>
                                  ✓ Sent • Awaiting Pay
                                </span>
                              ) : (
                                <span className="font-extrabold text-amber-800 bg-amber-100 border border-amber-300 px-1.5 py-0.2 rounded animate-pulse">
                                  ⚠️ Unbilled
                                </span>
                              )}
                            </div>

                            <div className="grid grid-cols-2 gap-1.5">
                              <button
                                type="button"
                                onClick={async () => {
                                  if (laundryStore && laundryStore.sendBilling) {
                                    await laundryStore.sendBilling(order.id, {
                                      totalPrice: order.totalPrice,
                                      actualWeightKg: order.actualWeightKg
                                    });
                                  }
                                  if (onOpenInvoice) {
                                    onOpenInvoice(order);
                                  }
                                }}
                                className="py-1 px-1.5 rounded-lg border border-blue-300 bg-white hover:bg-blue-50 text-blue-800 text-[10px] font-bold shadow-2xs transition flex items-center justify-center gap-1"
                                title="Send billing & cashless link to customer"
                              >
                                <Icon name="fileText" className="w-2.5 h-2.5" />
                                <span>{order.billingSentAt ? 'Resend Bill' : 'Send Bill'}</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  if (onUpdateOrderStatus) {
                                    onUpdateOrderStatus(
                                      order.id,
                                      'IN_PROCESS',
                                      'Billing confirmed & sent. Order moved to In Process.',
                                      order.actualWeightKg,
                                      order.tagNumber
                                    );
                                  }
                                }}
                                className="py-1 px-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-extrabold shadow-2xs transition flex items-center justify-center gap-1 cursor-pointer"
                                title="Move to In Process"
                              >
                                <span>Process ➔</span>
                              </button>
                            </div>
                          </div>
                        )}

                        {/* STAGE 4: IN_PROCESS -> QUICK ACTION TO READY FOR DELIVERY */}
                        {stage.id === 'IN_PROCESS' && (
                          <div className="mt-2.5 pt-2 border-t border-amber-200/80 bg-amber-50/70 -mx-3.5 -mb-1 px-3 py-1.5 rounded-b-xl flex items-center justify-between" onClick={e => e.stopPropagation()}>
                            <span className="text-[10px] font-bold text-amber-900 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                              In Facility
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                if (onUpdateOrderStatus) {
                                  onUpdateOrderStatus(
                                    order.id,
                                    'READY_FOR_DELIVERY',
                                    'Laundry care complete. Packed & ready for delivery.',
                                    order.actualWeightKg,
                                    order.tagNumber
                                  );
                                }
                              }}
                              className="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-[10px] font-extrabold shadow-2xs transition flex items-center gap-1 cursor-pointer"
                              title="Mark ready for delivery and assign rider"
                            >
                              <Icon name="truck" className="w-3 h-3 text-white" />
                              <span>Ready Delivery ➔</span>
                            </button>
                          </div>
                        )}

                        {/* STAGE 5: READY_FOR_DELIVERY -> ASSIGN RIDER & MARK DELIVERED */}
                        {stage.id === 'READY_FOR_DELIVERY' && (
                          <div className="mt-2.5 pt-2 border-t border-indigo-200/80 bg-indigo-50/70 -mx-3.5 -mb-1 px-3 py-2 rounded-b-xl space-y-2" onClick={e => e.stopPropagation()}>
                            <div className="space-y-1">
                              <div className="flex items-center justify-between text-[10px] font-bold text-indigo-950">
                                <span className="flex items-center gap-1">
                                  <Icon name="truck" className="w-3 h-3 text-indigo-600" />
                                  <span>Assign Rider:</span>
                                </span>
                                {order.assignedRider && (
                                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-indigo-200/80 text-indigo-900 font-extrabold truncate max-w-[110px]" title={order.assignedRider}>
                                    {order.assignedRider.split(' ')[0]}
                                  </span>
                                )}
                              </div>
                              <select
                                value={order.assignedRider || ''}
                                onChange={(e) => {
                                  const rName = e.target.value;
                                  if (laundryStore && laundryStore.assignRider) {
                                    laundryStore.assignRider(order.id, rName);
                                  }
                                }}
                                className="w-full px-2 py-1 rounded-lg border border-indigo-300 bg-white font-bold text-[10px] text-slate-800 focus:ring-1 focus:ring-indigo-400"
                              >
                                <option value="">⚠️ Select Delivery Rider...</option>
                                {AVAILABLE_DELIVERY_RIDERS.map((r, i) => (
                                  <option key={i} value={r}>{r}</option>
                                ))}
                              </select>
                            </div>

                            <button
                              type="button"
                              onClick={() => {
                                if (onUpdateOrderStatus) {
                                  onUpdateOrderStatus(
                                    order.id,
                                    'DELIVERED',
                                    `Clean laundry delivered safely by ${order.assignedRider || 'rider'}.`,
                                    order.actualWeightKg,
                                    order.tagNumber
                                  );
                                }
                              }}
                              className="w-full py-1.5 px-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-extrabold shadow-2xs transition flex items-center justify-center gap-1 cursor-pointer"
                              title="Confirm delivery complete"
                            >
                              <Icon name="check" className="w-3 h-3" />
                              <span>Mark Delivered ➔</span>
                            </button>
                          </div>
                        )}

                        {/* Hover hint */}
                        <div className="mt-2 pt-1 border-t border-dashed border-slate-100 flex items-center justify-between text-[10px] text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                          <span>🔍 Click to inspect</span>
                          <span className="font-mono text-[9px]">{order.pickupDate}</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}
