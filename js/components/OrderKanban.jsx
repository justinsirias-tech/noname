import React, { useState } from 'react';
import { Icon } from './Icons.jsx';
import { ORDER_STATUSES } from '../data/servicesData.js';

// Order Kanban Columns in workflow progression
const KANBAN_STAGES = [
  { id: 'BOOKING_REQUESTED', label: 'Booking Requested', icon: 'package', badgeColor: 'bg-amber-100 text-amber-800 border-amber-300' },
  { id: 'PICKUP_SCHEDULED', label: 'Pickup Scheduled', icon: 'truck', badgeColor: 'bg-blue-100 text-blue-800 border-blue-300' },
  { id: 'PICKED_UP', label: 'Bag Collected', icon: 'building', badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-300' },
  { id: 'WEIGHED_INSPECTED', label: 'Weighed & Checked', icon: 'scale', badgeColor: 'bg-purple-100 text-purple-800 border-purple-300' },
  { id: 'IN_WASH', label: 'Washing & Drying', icon: 'sparkles', badgeColor: 'bg-cyan-100 text-cyan-800 border-cyan-300' },
  { id: 'IRON_FOLD', label: 'Iron & Folding', icon: 'checkCircle', badgeColor: 'bg-teal-100 text-teal-800 border-teal-300' },
  { id: 'READY_FOR_DELIVERY', label: 'Ready for Dispatch', icon: 'package', badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
  { id: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', icon: 'truck', badgeColor: 'bg-orange-100 text-orange-800 border-orange-300' },
  { id: 'DELIVERED', label: 'Delivered', icon: 'check', badgeColor: 'bg-green-100 text-green-800 border-green-300' },
  { id: 'CANCELLED', label: 'Cancelled', icon: 'x', badgeColor: 'bg-red-100 text-red-800 border-red-300' }
];

export function OrderKanban({
  orders = [],
  onSelectOrder,
  onUpdateOrderStatus,
  onMarkPaid
}) {
  const [draggingOrderId, setDraggingOrderId] = useState(null);
  const [dragOverColKey, setDragOverColKey] = useState(null);

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

  return (
    <div className="w-full">
      
      {/* Kanban Board Container (Horizontal scrolling) */}
      <div className="flex gap-4 overflow-x-auto pb-6 pt-1 snap-x scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent">
        {KANBAN_STAGES.map((stage) => {
          const columnOrders = orders.filter(o => o.status === stage.id);
          const isOver = dragOverColKey === stage.id;
          const stageMeta = ORDER_STATUSES[stage.id] || { label: stage.label, color: 'bg-slate-100 text-slate-800' };

          return (
            <div
              key={stage.id}
              onDragOver={(e) => handleDragOver(e, stage.id)}
              onDragLeave={(e) => handleDragLeave(e, stage.id)}
              onDrop={(e) => handleDrop(e, stage.id)}
              className={`flex-shrink-0 w-80 rounded-3xl p-3.5 flex flex-col transition-all duration-200 snap-start select-none ${
                isOver
                  ? 'bg-sky-50 border-2 border-dashed border-sky-400 shadow-lg ring-4 ring-sky-100'
                  : 'bg-slate-100/90 border border-slate-200/90 shadow-2xs hover:border-slate-300'
              }`}
            >
              
              {/* Column Header */}
              <div className="flex items-center justify-between gap-2 px-1.5 py-1 mb-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-white shadow-2xs flex items-center justify-center text-slate-700">
                    <Icon name={stage.icon} className="w-3.5 h-3.5" />
                  </div>
                  <h4 className="font-bold text-slate-900 text-xs truncate max-w-[150px]" title={stage.label}>
                    {stage.label}
                  </h4>
                </div>

                <span className={`px-2 py-0.5 rounded-full text-[11px] font-mono font-black shadow-2xs ${
                  columnOrders.length > 0 ? 'bg-white text-slate-900 border border-slate-200' : 'bg-slate-200/70 text-slate-500'
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
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-xs font-black text-slate-900 group-hover:text-sky-600 transition">
                              {order.id}
                            </span>
                            {order.tagNumber && order.tagNumber !== 'TAG-PENDING' && (
                              <span className="text-[10px] font-mono font-bold text-sky-700 bg-sky-50 px-1.5 py-0.2 rounded border border-sky-200">
                                {order.tagNumber}
                              </span>
                            )}
                          </div>

                          <div 
                            className="text-slate-300 group-hover:text-slate-500 p-0.5 transition cursor-grab"
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
                          <span className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 font-semibold truncate max-w-[140px]">
                            {order.serviceName}
                          </span>

                          {order.actualWeightKg ? (
                            <span className="font-bold text-sky-700 bg-sky-50 px-1.5 py-0.5 rounded border border-sky-200 whitespace-nowrap">
                              Scale: {order.actualWeightKg} KG
                            </span>
                          ) : (
                            <span className="text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 whitespace-nowrap font-medium">
                              Est: {order.estimatedWeightKg} KG
                            </span>
                          )}
                        </div>

                        {/* Card Bottom: Price, Cashless Paid Status & Click hint */}
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                          <span className="font-black text-slate-900 text-sm">
                            ฿{order.totalPrice}
                          </span>

                          <div className="flex items-center gap-1.5">
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

                        {/* Hover hint */}
                        <div className="mt-2 pt-1 border-t border-dashed border-slate-100 flex items-center justify-between text-[10px] text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                          <span>🔍 Click to inspect details</span>
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
