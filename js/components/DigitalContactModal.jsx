import React, { useState, useEffect } from 'react';
import { Icon } from './Icons.jsx';
import { CONTACT_CHANNELS, getLineOaAddFriendUrl, getLineQrCodeUrl, laundryStore } from '../store.js';

export function DigitalContactModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('channels'); // 'channels', 'line-qr'

  // ESC key listener to close modal
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' || e.key === 'Esc') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const lineOaId = laundryStore.settings?.lineOaId || '@nonamelaundry';
  const lineAddUrl = getLineOaAddFriendUrl(lineOaId);
  const lineQrUrl = getLineQrCodeUrl(lineOaId);

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center">
              <Icon name="messageSquare" className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900">
                Official Digital Contact Channels
              </h3>
              <p className="text-xs text-slate-500">
                No storefront • Operating exclusively online across Bangkok
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 flex items-center gap-1"
            title="Close (Esc)"
          >
            <span className="hidden sm:inline text-[10px] font-mono font-bold px-1 rounded bg-slate-100 text-slate-500 border border-slate-200">ESC</span>
            <Icon name="x" className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex rounded-xl bg-slate-100 p-1 text-xs font-bold">
          <button
            onClick={() => setActiveTab('channels')}
            className={`flex-1 py-1.5 rounded-lg transition ${
              activeTab === 'channels' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Chat Channels
          </button>
          <button
            onClick={() => setActiveTab('line-qr')}
            className={`flex-1 py-1.5 rounded-lg transition flex items-center justify-center gap-1.5 ${
              activeTab === 'line-qr' ? 'bg-white text-green-700 shadow-sm' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Icon name="line" className="w-3.5 h-3.5 text-green-600" />
            <span>Scan LINE QR</span>
          </button>
        </div>

        {/* Highlighted Strictly Online Rule */}
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-amber-950">
            <Icon name="phoneOff" className="w-4 h-4 text-amber-700" />
            <span>Strict Zero Phone Call Support Policy</span>
          </div>
          <p className="text-slate-700 leading-relaxed">
            All customer inquiries, pickup instructions, status checks, and incident reports are handled solely via written online chat and email. Phone calls are not answered.
          </p>
        </div>

        {activeTab === 'channels' ? (
          <div className="space-y-3">
            {/* LINE OA Button */}
            <a
              href={lineAddUrl}
              target="_blank"
              rel="noreferrer"
              className="p-4 rounded-2xl border-2 border-green-500/40 bg-green-50/50 hover:bg-green-50 flex items-center justify-between transition group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-green-500 text-white flex items-center justify-center shadow-md">
                  <Icon name="line" className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-xs sm:text-sm text-green-950">LINE Official Account (Recommended)</div>
                  <div className="text-xs text-green-700 font-mono">{lineOaId}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Tap to Add Friend & start chat</div>
                </div>
              </div>
              <span className="text-xs text-green-700 font-bold group-hover:translate-x-0.5 transition flex items-center gap-1">
                <span>Add Friend</span>
                <Icon name="externalLink" className="w-3.5 h-3.5" />
              </span>
            </a>

            {/* WhatsApp */}
            <a
              href={`${CONTACT_CHANNELS.whatsapp.url}Hi%20NoName%20Laundry,%20I%20need%20assistance`}
              target="_blank"
              rel="noreferrer"
              className="p-4 rounded-2xl border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-50 flex items-center justify-between transition group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-md">
                  <Icon name="whatsapp" className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-xs sm:text-sm text-slate-900">WhatsApp Support</div>
                  <div className="text-xs text-slate-500">{CONTACT_CHANNELS.whatsapp.handle}</div>
                </div>
              </div>
              <span className="text-xs text-emerald-700 font-bold group-hover:translate-x-0.5 transition flex items-center gap-1">
                <span>Open Chat</span>
                <Icon name="externalLink" className="w-3.5 h-3.5" />
              </span>
            </a>

            {/* Email */}
            <a
              href="mailto:support@nonamelaundry.com?subject=NoName%20Laundry%20Inquiry"
              className="p-4 rounded-2xl border border-sky-200 bg-sky-50/50 hover:bg-sky-50 flex items-center justify-between transition group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sky-500 text-white flex items-center justify-center shadow-md">
                  <Icon name="mail" className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-xs sm:text-sm text-slate-900">Email Support</div>
                  <div className="text-xs text-slate-500">{CONTACT_CHANNELS.email.handle}</div>
                </div>
              </div>
              <span className="text-xs text-sky-700 font-bold group-hover:translate-x-0.5 transition flex items-center gap-1">
                <span>Send Mail</span>
                <Icon name="externalLink" className="w-3.5 h-3.5" />
              </span>
            </a>
          </div>
        ) : (
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center space-y-3 animate-fadeIn">
            <img
              src={lineQrUrl}
              alt="Scan to Add LINE OA @nonamelaundry"
              className="w-52 h-52 mx-auto rounded-xl shadow-md border-2 border-white"
            />
            <div>
              <div className="font-extrabold text-sm text-slate-900">
                Scan with your LINE App
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Open LINE &gt; Tap Add Friend &gt; Tap QR Code &gt; Scan this code to add <strong>{lineOaId}</strong>
              </p>
            </div>
          </div>
        )}

        <div className="text-center pt-2">
          <button
            onClick={onClose}
            className="text-xs font-semibold text-slate-500 hover:text-slate-800"
          >
            Close Window
          </button>
        </div>

      </div>
    </div>
  );
}
