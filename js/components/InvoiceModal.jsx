import React, { useState, useEffect } from 'react';
import { Icon } from './Icons.jsx';
import { generatePromptPayQrUrl, laundryStore } from '../store.js';

export function InvoiceModal({ order, onClose, onMarkPaid, onInvoiceSent }) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedText, setCopiedText] = useState(false);
  const [sentToast, setSentToast] = useState('');

  // ESC key listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' || e.key === 'Esc') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!order) return null;

  const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
  const paymentUrl = `${origin}/?track=${encodeURIComponent(order.id)}&pay=1`;
  const isPaid = order.paymentStatus === 'PAID';

  const speedLabel = order.turnaroundSpeed === 'same_day'
    ? 'Same Day Express (<18:00)'
    : (order.turnaroundSpeed?.includes('next_day') ? 'Next Day (24h)' : 'Standard (48h)');

  const certifiedWeight = order.actualWeightKg !== null && order.actualWeightKg !== undefined
    ? Number(order.actualWeightKg)
    : Number(order.estimatedWeightKg || 4.0);

  const minWeight = Number(order.minWeightAppliedKg || 4.0);
  const billableWeight = Math.max(certifiedWeight, minWeight);
  const unitRate = Number(order.pricePerKg || 65);
  const totalPrice = Number(order.totalPrice || Math.round(billableWeight * unitRate));

  const subtotalExclTax = Math.round(totalPrice / 1.07);
  const vatAmount = totalPrice - subtotalExclTax;

  const invoiceNumber = `INV-${order.id}`;
  const issueDate = order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : new Date().toLocaleDateString('en-GB');

  // Text message for WhatsApp, LINE & Email
  const getInvoiceTextSummary = () => {
    return `🧺 *NONAME LAUNDRY BANGKOK - OFFICIAL TAX INVOICE*
━━━━━━━━━━━━━━━━━━━━━━━━━━
📄 *Invoice:* ${invoiceNumber}
🔖 *Order Tracking ID:* #${order.id}
🏷️ *Bag Tag:* ${order.tagNumber || 'TAG-PENDING'}
📅 *Date:* ${issueDate}
━━━━━━━━━━━━━━━━━━━━━━━━━━
👤 *Billed To:*
Customer: *${order.customerName}*
Residence: *${order.condoName || 'Bangkok Condominium'}* (Unit ${order.roomNumber || 'Lobby'})
District: *${order.district || 'Bangkok'}*
Contact: *${order.contactChannel.toUpperCase()}: ${order.contactValue}*
${order.specialInstructions ? `Note: "${order.specialInstructions}"\n` : ''}━━━━━━━━━━━━━━━━━━━━━━━━━━
🧼 *Service & Scale Weigh-in Breakdown:*
• Service Plan: *${order.serviceName}*
• Turnaround Speed: *${speedLabel}*
• Intake Weight: *${certifiedWeight} KG* (Min ${minWeight} KG applied -> *${billableWeight} KG*)
• Rate per KG: *฿${unitRate} THB / KG*
• Pickup Window: *${order.pickupDate || 'Scheduled'} (${order.pickupTime || ''})*
• Estimated Delivery: *${order.deliveryDate || 'Scheduled'} (${order.deliveryTime || ''})*
━━━━━━━━━━━━━━━━━━━━━━━━━━
💵 *TOTAL AMOUNT DUE:* *฿${totalPrice} THB*
💳 *Status:* ${isPaid ? '✅ PAID IN FULL via ' + (order.paymentMethod || 'Online Gateway') : '⏳ PENDING PAYMENT (100% Cashless)'}
━━━━━━━━━━━━━━━━━━━━━━━━━━
${!isPaid ? `👉 *CLICK HERE TO PAY ONLINE VIA LOCAL BANK / GATEWAY:*
${paymentUrl}

🏦 *Local Bank Payment Methods Supported:*
• PromptPay QR Code (Any Thai Banking App: K PLUS, SCB EASY, Krungthai NEXT, Bangkok Bank, TTB)
• Credit / Debit Card (Visa, Mastercard, JCB with 3D-Secure)

⚠️ *Cashless Notice:* Couriers do not handle cash. Please complete payment securely online before courier hand-off.` : '✨ Payment verified! Your laundry order is being processed for delivery.'}

NoName Laundry Bangkok Co., Ltd.
LINE OA: @nonamelaundry • support@nonamelaundry.com`;
  };

  // WhatsApp Action
  const handleSendWhatsApp = () => {
    const rawNumber = (order.contactValue || '').replace(/[^0-9]/g, '');
    let formattedPhone = rawNumber;
    if (formattedPhone.startsWith('0')) {
      formattedPhone = '66' + formattedPhone.substring(1);
    }
    const text = encodeURIComponent(getInvoiceTextSummary());
    const waUrl = formattedPhone.length >= 9
      ? `https://wa.me/${formattedPhone}?text=${text}`
      : `https://wa.me/?text=${text}`;

    window.open(waUrl, '_blank');
    recordDispatch('WHATSAPP');
  };

  // LINE Action
  const handleSendLine = () => {
    const lineId = laundryStore.settings?.lineOaId || '@nonamelaundry';
    const text = getInvoiceTextSummary();

    // Copy formatted text to clipboard so staff can paste into LINE OA chat
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 3000);
    }

    // Open LINE OA or app
    const lineUrl = `https://line.me/R/ti/p/${encodeURIComponent(lineId)}`;
    window.open(lineUrl, '_blank');
    recordDispatch('LINE');
  };

  // Email Action
  const handleSendEmail = () => {
    const subject = encodeURIComponent(`Tax Invoice ${invoiceNumber} - NoName Laundry Bangkok (฿${totalPrice} THB)`);
    const body = encodeURIComponent(getInvoiceTextSummary());
    const mailtoUrl = `mailto:${order.email || ''}?subject=${subject}&body=${body}`;
    window.location.href = mailtoUrl;
    recordDispatch('EMAIL');
  };

  // Copy Link Action
  const handleCopyPaymentLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(paymentUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  // Print Action
  const handlePrint = () => {
    window.print();
  };

  // Record audit trail event
  const recordDispatch = (channelName) => {
    const note = `Official Tax Invoice (${invoiceNumber}) & Payment Link generated and sent to customer via ${channelName}. Total: ฿${totalPrice} THB.`;
    if (onInvoiceSent) {
      onInvoiceSent(order.id, note);
    } else {
      laundryStore.updateOrderStatus(order.id, order.status, note);
    }
    setSentToast(`Invoice & Payment Link dispatched via ${channelName}!`);
    setTimeout(() => setSentToast(''), 4000);
  };

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="bg-slate-100 rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[95vh]"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Top Control Bar (Hidden when Printing) */}
        <div className="px-6 py-4 bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 shrink-0 print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold">
              <Icon name="fileText" className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm sm:text-base font-black text-sky-400">
                  {invoiceNumber}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                  isPaid ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                }`}>
                  {isPaid ? 'PAID' : 'PAYMENT DUE'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Order #{order.id} • {order.customerName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center gap-1.5 border border-slate-700"
              title="Print or Save PDF"
            >
              <Icon name="printer" className="w-3.5 h-3.5 text-slate-300" />
              <span>Print / PDF</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition flex items-center gap-1"
              title="Close (Esc)"
            >
              <span className="hidden sm:inline text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">ESC</span>
              <Icon name="x" className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Action Dispatch Toolbar (Hidden when Printing) */}
        <div className="px-6 py-3 bg-white border-b border-slate-200 flex items-center justify-between gap-3 flex-wrap shrink-0 print:hidden">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-bold text-slate-500 mr-1 flex items-center gap-1">
              <Icon name="send" className="w-3.5 h-3.5 text-sky-600" />
              <span>Send Invoice via:</span>
            </span>

            {/* WhatsApp */}
            <button
              type="button"
              onClick={handleSendWhatsApp}
              className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold transition flex items-center gap-1.5 shadow-2xs"
            >
              <Icon name="whatsapp" className="w-3.5 h-3.5 text-emerald-600" />
              <span>WhatsApp</span>
            </button>

            {/* LINE */}
            <button
              type="button"
              onClick={handleSendLine}
              className="px-3 py-1.5 rounded-xl bg-green-50 hover:bg-green-100 text-green-800 border border-green-300 text-xs font-bold transition flex items-center gap-1.5 shadow-2xs"
            >
              <Icon name="line" className="w-3.5 h-3.5 text-green-600" />
              <span>LINE OA {copiedText && <span className="text-[10px] text-green-700 font-extrabold">(Copied!)</span>}</span>
            </button>

            {/* Email */}
            <button
              type="button"
              onClick={handleSendEmail}
              className="px-3 py-1.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-300 text-xs font-bold transition flex items-center gap-1.5 shadow-2xs"
            >
              <Icon name="mail" className="w-3.5 h-3.5 text-sky-600" />
              <span>Email</span>
            </button>
          </div>

          {/* Copy Direct Payment Link */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyPaymentLink}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border ${
                copiedLink
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                  : 'bg-slate-900 hover:bg-slate-800 text-white border-slate-900 shadow-sm'
              }`}
            >
              <Icon name={copiedLink ? 'check' : 'copy'} className="w-3.5 h-3.5" />
              <span>{copiedLink ? 'Payment Link Copied!' : 'Copy Payment Link'}</span>
            </button>
          </div>
        </div>

        {/* Toast Feedback */}
        {sentToast && (
          <div className="bg-emerald-600 text-white text-xs font-bold px-6 py-2 flex items-center justify-between animate-fadeIn print:hidden">
            <div className="flex items-center gap-2">
              <Icon name="check" className="w-4 h-4 text-emerald-200" />
              <span>{sentToast}</span>
            </div>
            <button type="button" onClick={() => setSentToast('')} className="text-emerald-200 hover:text-white">
              <Icon name="x" className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* PRINTABLE INVOICE SHEET (A4 Aspect Ratio Container) */}
        <div className="p-4 sm:p-8 overflow-y-auto flex-1 bg-slate-100 print:p-0 print:bg-white print:overflow-visible">
          <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-md border border-slate-200 p-6 sm:p-8 text-slate-800 print:shadow-none print:border-none print:p-0 print:max-w-full">
            
            {/* INVOICE HEADER */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-slate-200">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-sky-600 text-white flex items-center justify-center font-black text-sm">
                    NL
                  </div>
                  <div>
                    <h2 className="text-base font-black text-slate-900 tracking-tight leading-tight">
                      NoName Laundry Bangkok
                    </h2>
                    <span className="text-[10px] text-slate-500 font-semibold block">
                      บริษัท โนเนม ลอนดรี้ แบงค็อก จำกัด
                    </span>
                  </div>
                </div>

                <div className="text-[11px] text-slate-500 mt-2 space-y-0.5 leading-relaxed">
                  <div>Watthana / Khlong Toei, Sukhumvit, Bangkok 10110</div>
                  <div>Tax ID: 0105567089123 • Commercial Garment Care</div>
                  <div>LINE OA: <strong>@nonamelaundry</strong> • WhatsApp: <strong>+66 89 123 4567</strong></div>
                  <div>Email: support@nonamelaundry.com • 100% Cashless Facility</div>
                </div>
              </div>

              <div className="text-left sm:text-right space-y-1">
                <div className="inline-block px-3 py-1 rounded-xl font-extrabold text-xs tracking-wider uppercase border text-right">
                  {isPaid ? (
                    <span className="text-emerald-700 bg-emerald-50 border-emerald-300">
                      TAX INVOICE / RECEIPT (PAID)
                    </span>
                  ) : (
                    <span className="text-amber-800 bg-amber-50 border-amber-300">
                      TAX INVOICE / PAYMENT DUE
                    </span>
                  )}
                </div>

                <div className="font-mono text-base font-black text-slate-900">
                  {invoiceNumber}
                </div>
                <div className="text-xs text-slate-600">
                  Issue Date: <strong>{issueDate}</strong>
                </div>
                <div className="text-xs text-slate-600">
                  Order Ref: <strong className="font-mono">{order.id}</strong>
                </div>
                {order.tagNumber && order.tagNumber !== 'TAG-PENDING' && (
                  <div className="text-xs text-slate-600">
                    Bag Tag: <strong className="font-mono">{order.tagNumber}</strong>
                  </div>
                )}
              </div>
            </div>

            {/* CUSTOMER & DELIVERY SCHEDULE DETAILS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-5 border-b border-slate-200 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-400 uppercase font-bold text-[10px] tracking-wider block mb-1">
                  Billed To / Customer Information
                </span>
                <div className="font-extrabold text-slate-900 text-sm">{order.customerName}</div>
                <div className="text-slate-700 font-semibold mt-0.5">{order.condoName || 'Bangkok Residence'}</div>
                <div className="text-slate-600">Unit / Room: {order.roomNumber || 'Lobby Reception'}</div>
                <div className="text-slate-500">{order.district || 'Bangkok'}</div>
                <div className="mt-1 pt-1 border-t border-slate-200 text-[11px] text-slate-600">
                  Contact: <strong className="uppercase">{order.contactChannel}</strong> ({order.contactValue})
                  {order.email && <div className="text-slate-500">{order.email}</div>}
                </div>
                {order.leaveWithJuristic && (
                  <div className="mt-1.5 inline-block px-2 py-0.5 rounded bg-sky-100 text-sky-800 font-bold text-[10px]">
                    ✓ Juristic Reception Drop-Off Authorized
                  </div>
                )}
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
                <div>
                  <span className="text-slate-400 uppercase font-bold text-[10px] tracking-wider block mb-1">
                    Pickup & Delivery Timetable
                  </span>
                  <div className="space-y-1">
                    <div>
                      <span className="text-slate-500 font-medium">Pickup Window:</span>
                      <div className="font-bold text-slate-900">{order.pickupDate} • {order.pickupTime}</div>
                    </div>
                    <div className="mt-1.5">
                      <span className="text-slate-500 font-medium">Scheduled Delivery:</span>
                      <div className="font-extrabold text-sky-700">{order.deliveryDate} • {order.deliveryTime}</div>
                    </div>
                  </div>
                </div>

                {order.specialInstructions && (
                  <div className="mt-2 text-[11px] text-slate-600 italic bg-white p-2 rounded border border-slate-200">
                    "{order.specialInstructions}"
                  </div>
                )}
              </div>
            </div>

            {/* ITEMIZED SERVICE TABLE */}
            <div className="py-5 border-b border-slate-200">
              <span className="text-slate-400 uppercase font-bold text-[10px] tracking-wider block mb-2">
                Certified Service Specifications & Certified Weight
              </span>

              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase">
                    <th className="py-2 pr-2">Item Description</th>
                    <th className="py-2 px-2 text-center">Scale Weight</th>
                    <th className="py-2 px-2 text-center">Billable Weight</th>
                    <th className="py-2 px-2 text-right">Unit Rate</th>
                    <th className="py-2 pl-2 text-right">Amount (THB)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="py-3 pr-2">
                      <div className="font-extrabold text-slate-900">{order.serviceName}</div>
                      <div className="text-[11px] text-slate-500">
                        Turnaround: <span className="font-bold text-sky-700">{speedLabel}</span>
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Certified facility wash, tumble dry & packaging
                      </div>
                    </td>
                    <td className="py-3 px-2 text-center font-mono font-bold text-slate-700">
                      {certifiedWeight} KG
                    </td>
                    <td className="py-3 px-2 text-center font-mono font-bold text-slate-900">
                      {billableWeight} KG
                      {billableWeight > certifiedWeight && (
                        <span className="block text-[9px] text-amber-700 font-normal">
                          (Min {minWeight} KG applied)
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-2 text-right font-mono text-slate-700">
                      ฿{unitRate} / KG
                    </td>
                    <td className="py-3 pl-2 text-right font-mono font-extrabold text-slate-900">
                      ฿{totalPrice}
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* FINANCIAL TOTALS */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col items-end text-xs space-y-1">
                <div className="flex justify-between w-64 text-slate-500">
                  <span>Subtotal (Excl. VAT):</span>
                  <span className="font-mono">฿{subtotalExclTax} THB</span>
                </div>
                <div className="flex justify-between w-64 text-slate-500">
                  <span>VAT 7% (Included):</span>
                  <span className="font-mono">฿{vatAmount} THB</span>
                </div>
                <div className="flex justify-between w-64 pt-2 border-t border-slate-200 text-sm font-black text-slate-900">
                  <span>Total Amount Due:</span>
                  <span className="font-mono text-base text-emerald-600">฿{totalPrice} THB</span>
                </div>
              </div>
            </div>

            {/* 100% CASHLESS PAYMENT GATEWAY & LOCAL BANK SECTION */}
            <div className="py-5 border-b border-slate-200">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-sky-950 text-white space-y-3 shadow-sm print:bg-none print:text-slate-900 print:border print:border-slate-300">
                <div className="flex items-center justify-between border-b border-white/10 pb-2.5 print:border-slate-300">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                      100% Cashless Gateway
                    </span>
                    <span className="text-xs text-slate-300 font-semibold print:text-slate-700">
                      Local Bank Integration (Omise / Opn Thailand)
                    </span>
                  </div>
                  <span className={`text-xs font-black uppercase ${isPaid ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {isPaid ? '✓ Status: Paid' : '⏳ Status: Unpaid'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                  
                  {/* PromptPay QR Code preview */}
                  <div className="sm:col-span-4 text-center">
                    <div className="bg-white p-2.5 rounded-xl inline-block shadow-md">
                      <img
                        src={generatePromptPayQrUrl(totalPrice)}
                        alt="Scan to Pay via Thai Mobile Banking"
                        className="w-32 h-32 mx-auto rounded"
                      />
                    </div>
                    <span className="block text-[10px] text-slate-300 mt-1 font-semibold print:text-slate-600">
                      Scan with any Thai Mobile Banking App
                    </span>
                  </div>

                  {/* Payment Methods & Direct Link */}
                  <div className="sm:col-span-8 space-y-2.5 text-xs">
                    <div className="text-slate-200 print:text-slate-800 leading-relaxed">
                      <strong>Choose Your Preferred Payment Method Online:</strong>
                      <ul className="list-disc list-inside text-[11px] text-slate-300 print:text-slate-600 mt-1 space-y-0.5">
                        <li><strong>PromptPay QR Code:</strong> K PLUS, SCB EASY, Krungthai NEXT, Bangkok Bank, TTB</li>
                        <li><strong>Credit / Debit Card:</strong> Visa, Mastercard, JCB (Encrypted with 3D-Secure)</li>
                      </ul>
                    </div>

                    {/* Clickable Payment Gateway Link */}
                    <div className="p-3 rounded-xl bg-white/10 border border-white/15 print:bg-slate-100 print:border-slate-300 print:text-slate-900 space-y-1">
                      <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider print:text-slate-500">
                        Direct Online Payment Link (Customer Checkout):
                      </div>
                      <a
                        href={paymentUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="font-mono text-xs text-sky-300 hover:text-sky-200 underline break-all font-bold block print:text-sky-800"
                      >
                        {paymentUrl}
                      </a>
                    </div>
                  </div>

                </div>

              </div>
            </div>

            {/* INVOICE FOOTER & TERMS */}
            <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[10px] text-slate-400">
              <div>
                <div>• This is an official computer-generated tax invoice. No signature required.</div>
                <div>• Couriers are strictly cashless and do not collect cash upon delivery.</div>
              </div>
              <div className="text-left sm:text-right font-medium">
                <div>NoName Laundry Bangkok Co., Ltd.</div>
                <div>Questions? Visit nonamelaundry.com</div>
              </div>
            </div>

          </div>
        </div>

        {/* Modal Bottom Bar (Hidden when Printing) */}
        <div className="px-6 py-4 bg-white border-t border-slate-200 flex items-center justify-between shrink-0 print:hidden">
          <div className="text-xs text-slate-500">
            Total: <strong className="text-slate-900 font-bold">฿{totalPrice} THB</strong> • {isPaid ? 'Payment Verified' : 'Awaiting Online Settlement'}
          </div>

          <div className="flex items-center gap-2">
            {!isPaid && onMarkPaid && (
              <button
                type="button"
                onClick={() => {
                  onMarkPaid(order.id, 'PromptPay QR (Direct Gateway)');
                  onClose();
                }}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm transition"
              >
                Mark as Paid
              </button>
            )}

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
    </div>
  );
}
