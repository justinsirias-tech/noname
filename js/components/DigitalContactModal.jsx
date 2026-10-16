import React, { useState, useEffect } from 'react';
import { Icon } from './Icons.jsx';
import { CONTACT_CHANNELS, getLineOaAddFriendUrl, getLineQrCodeUrl, laundryStore } from '../store.js';
import { useTranslation } from '../i18n.jsx';

export function DigitalContactModal({ isOpen, onClose }) {
  const { language } = useTranslation();
  const isTh = language === 'th';
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
                {isTh ? 'ช่องทางติดต่อออนไลน์อย่างเป็นทางการ' : 'Official Digital Contact Channels'}
              </h3>
              <p className="text-xs text-slate-500">
                {isTh ? 'ให้บริการรับ-ส่งถึงคอนโดผ่านระบบออนไลน์ในกรุงเทพฯ และพัทยา' : 'No storefront • Operating exclusively online across Bangkok & Pattaya'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 flex items-center gap-1"
            title={isTh ? 'ปิดหน้าต่าง (Esc)' : 'Close (Esc)'}
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
            {isTh ? 'ช่องทางแชทและโทรศัพท์' : 'Chat Channels'}
          </button>
          <button
            onClick={() => setActiveTab('line-qr')}
            className={`flex-1 py-1.5 rounded-lg transition flex items-center justify-center gap-1.5 ${
              activeTab === 'line-qr' ? 'bg-white text-green-700 shadow-sm' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Icon name="line" className="w-3.5 h-3.5 text-green-600" />
            <span>{isTh ? 'สแกน LINE QR' : 'Scan LINE QR'}</span>
          </button>
        </div>

        {/* Contact Info Header */}
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-emerald-950">
            <Icon name="phone" className="w-4 h-4 text-emerald-700" />
            <span>{isTh ? 'ฝ่ายบริการลูกค้าและช่วยเหลือโดยตรง' : 'Customer Service & Direct Assistance'}</span>
          </div>
          <p className="text-slate-700 leading-relaxed">
            {isTh ? (
              <>ติดต่อทีมงานได้โดยตรงทางโทรศัพท์หรือ WhatsApp ที่เบอร์ <strong className="text-slate-900">+66 80 888 9885</strong> หรือทักแชทผ่าน LINE Official และอีเมล</>
            ) : (
              <>Reach our service team via direct mobile call or WhatsApp at <strong className="text-slate-900">+66 80 888 9885</strong>, or message us on LINE Official and Email.</>
            )}
          </p>
        </div>

        {activeTab === 'channels' ? (
          <div className="space-y-3">
            {/* Direct Mobile Call */}
            <a
              href="tel:+66808889885"
              className="p-4 rounded-2xl border border-amber-200 bg-amber-50/50 hover:bg-amber-50 flex items-center justify-between transition group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-md">
                  <Icon name="phone" className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-xs sm:text-sm text-slate-900">{isTh ? 'โทรศัพท์ติดต่อโดยตรง' : 'Direct Mobile Call'}</div>
                  <div className="text-xs text-slate-600 font-mono">+66 80 888 9885</div>
                </div>
              </div>
              <span className="text-xs text-amber-700 font-bold group-hover:translate-x-0.5 transition flex items-center gap-1">
                <span>{isTh ? 'โทรเลย' : 'Call Now'}</span>
                <Icon name="phone" className="w-3.5 h-3.5" />
              </span>
            </a>

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
                  <div className="font-bold text-xs sm:text-sm text-green-950">{isTh ? 'LINE Official Account (แนะนำ)' : 'LINE Official Account (Recommended)'}</div>
                  <div className="text-xs text-green-700 font-mono">{lineOaId}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">{isTh ? 'แตะเพื่อเพิ่มเพื่อนและเริ่มแชท' : 'Tap to Add Friend & start chat'}</div>
                </div>
              </div>
              <span className="text-xs text-green-700 font-bold group-hover:translate-x-0.5 transition flex items-center gap-1">
                <span>{isTh ? 'เพิ่มเพื่อน' : 'Add Friend'}</span>
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
                  <div className="font-bold text-xs sm:text-sm text-slate-900">{isTh ? 'แชทผ่าน WhatsApp' : 'WhatsApp Support'}</div>
                  <div className="text-xs text-slate-500">{CONTACT_CHANNELS.whatsapp.handle}</div>
                </div>
              </div>
              <span className="text-xs text-emerald-700 font-bold group-hover:translate-x-0.5 transition flex items-center gap-1">
                <span>{isTh ? 'เปิดแชท' : 'Open Chat'}</span>
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
                  <div className="font-bold text-xs sm:text-sm text-slate-900">{isTh ? 'ติดต่อทางอีเมล' : 'Email Support'}</div>
                  <div className="text-xs text-slate-500">{CONTACT_CHANNELS.email.handle}</div>
                </div>
              </div>
              <span className="text-xs text-sky-700 font-bold group-hover:translate-x-0.5 transition flex items-center gap-1">
                <span>{isTh ? 'ส่งอีเมล' : 'Send Mail'}</span>
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
                {isTh ? 'สแกนด้วยแอปพลิเคชัน LINE' : 'Scan with your LINE App'}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {isTh ? (
                  <>เปิดแอป LINE &gt; แตะ เพิ่มเพื่อน &gt; แตะ คิวอาร์โค้ด &gt; สแกนโค้ดนี้เพื่อเพิ่มเพื่อน <strong>{lineOaId}</strong></>
                ) : (
                  <>Open LINE &gt; Tap Add Friend &gt; Tap QR Code &gt; Scan this code to add <strong>{lineOaId}</strong></>
                )}
              </p>
            </div>
          </div>
        )}

        <div className="text-center pt-2">
          <button
            onClick={onClose}
            className="text-xs font-semibold text-slate-500 hover:text-slate-800"
          >
            {isTh ? 'ปิดหน้าต่าง' : 'Close Window'}
          </button>
        </div>

      </div>
    </div>
  );
}
