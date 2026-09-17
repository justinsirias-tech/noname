import React from 'react';
import { Icon } from './Icons.jsx';
import { TERMS_SUMMARY_POINTS } from '../data/termsData.js';

export function TermsModal({ isOpen, onClose, onAcknowledge, onViewFullTerms }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
      <div 
        className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-100 overflow-hidden transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Modal Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-sky-900 to-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold">
              <Icon name="shieldAlert" className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-white">
                Important Terms & Conditions Summary
              </h3>
              <p className="text-xs text-slate-300">
                Please review our digital operating policies before completing your booking
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
          >
            <Icon name="x" className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-4 text-slate-700 text-sm">
          
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
            <Icon name="phoneOff" className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-900 leading-relaxed">
              <strong className="font-bold block text-sm mb-1 text-amber-950">
                Important: Zero Phone Call Policy
              </strong>
              NoName Laundry does not provide telephone call support. Inquiries, driver coordination, status questions, and all incident reports are strictly conducted via <strong>WhatsApp, LINE, or Email</strong>.
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {TERMS_SUMMARY_POINTS.map((pt) => (
              <div 
                key={pt.id} 
                className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-3"
              >
                <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center shrink-0 mt-0.5">
                  <Icon name={pt.id === 'digital_only' ? 'phoneOff' : pt.id === 'weight_billing' ? 'scale' : pt.id === 'condo_juristic' ? 'building' : pt.id === 'turnaround' ? 'clock' : 'shieldAlert'} className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-slate-900 text-xs sm:text-sm">
                    {pt.title}
                  </div>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    {pt.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 text-center">
            <button
              onClick={onViewFullTerms}
              className="text-xs text-sky-600 hover:text-sky-700 font-semibold inline-flex items-center gap-1 underline underline-offset-4"
            >
              <span>Read Full Legal Terms & Conditions Page</span>
              <Icon name="externalLink" className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <span className="text-xs text-slate-500 text-center sm:text-left">
            By acknowledging, you confirm reading these policies.
          </span>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200 transition"
            >
              Close
            </button>
            <button
              onClick={() => {
                onAcknowledge();
                onClose();
              }}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-500 text-white shadow-md transition flex items-center justify-center gap-1.5"
            >
              <Icon name="check" className="w-4 h-4" />
              <span>I Understand & Acknowledge Terms</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
