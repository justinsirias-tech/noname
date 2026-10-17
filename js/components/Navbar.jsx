import React, { useState } from 'react';
import { Icon } from './Icons.jsx';
import { CONTACT_CHANNELS } from '../store.js';
import { useTranslation } from '../i18n.jsx';

function BritishFlag({ className = "w-4 h-3" }) {
  return (
    <svg
      viewBox="0 0 60 40"
      className={`${className} rounded-[2px] overflow-hidden shadow-2xs shrink-0 inline-block border border-slate-200/60`}
      aria-hidden="true"
    >
      <rect width="60" height="40" fill="#012169" />
      <path d="M0,0 L60,40 M60,0 L0,40" stroke="#FFFFFF" strokeWidth="8" />
      <path d="M0,0 L60,40 M60,0 L0,40" stroke="#C8102E" strokeWidth="4.5" />
      <path d="M30,0 V40 M0,20 H60" stroke="#FFFFFF" strokeWidth="13" />
      <path d="M30,0 V40 M0,20 H60" stroke="#C8102E" strokeWidth="8" />
    </svg>
  );
}

function ThaiFlag({ className = "w-4 h-3" }) {
  return (
    <svg
      viewBox="0 0 60 40"
      className={`${className} rounded-[2px] overflow-hidden shadow-2xs shrink-0 inline-block border border-slate-200/60`}
      aria-hidden="true"
    >
      <rect width="60" height="40" fill="#A51931" />
      <rect y="6.67" width="60" height="26.67" fill="#F4F5F8" />
      <rect y="13.33" width="60" height="13.33" fill="#2D2A4A" />
    </svg>
  );
}

export function Navbar({ 
  currentView, 
  setView, 
  onOpenContactModal, 
  customer, 
  currentCity = 'Bangkok', 
  onSwitchCity,
  language = 'en',
  onSwitchLanguage
}) {
  const { t } = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [logoError, setLogoError] = useState(false);

  const desktopNavLinks = [
    { id: 'services', label: t('navServices') },
    { id: 'how-it-works', label: t('navHowItWorks') },
    { id: 'coverage', label: t('navCoverage') || 'Coverage' },
    { id: 'reviews', label: t('navReviews') || 'Reviews' },
    { id: 'faq', label: t('navFaq') },
  ];

  const allNavLinks = [
    { id: 'home', label: t('navHome') },
    { id: 'services', label: t('navServices') },
    { id: 'how-it-works', label: t('navHowItWorks') },
    { id: 'coverage', label: t('navCoverage') || 'Coverage' },
    { id: 'reviews', label: t('navReviews') || 'Reviews' },
    { id: 'faq', label: t('navFaq') },
    { id: 'terms', label: t('navTerms') },
    ...(customer 
      ? [{ id: 'portal', label: t('navAccount') }] 
      : [{ id: 'register', label: t('navRegister') }]
    ),
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 transition-all shadow-sm">
      {/* Top Banner: Phone & Online Support Notice */}
      <div className="bg-slate-900 text-slate-200 text-xs py-1.5 px-3 sm:px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] sm:text-[11px] font-semibold bg-sky-500/20 text-sky-300 border border-sky-500/30 shrink-0">
              {currentCity === 'Pattaya' ? (t('cityBannerPattaya') || '🏖️ Pattaya Digital Service') : (t('cityBannerBangkok') || '🏙️ Bangkok Digital Service')}
            </span>
            <span className="hidden sm:inline text-slate-400">|</span>
            <a 
              href="tel:+66808889885"
              className="flex items-center gap-1.5 text-emerald-300 hover:text-emerald-200 font-medium text-[10px] sm:text-xs min-w-0 transition"
              title="Call Customer Support"
            >
              <Icon name="phone" className="w-3 h-3 text-emerald-400 shrink-0" />
              <span className="truncate lg:overflow-visible lg:whitespace-nowrap">{t('onlineOnlyBanner') || 'Phone & WhatsApp Support: +66 80 888 9885'}</span>
            </a>
          </div>

          {/* Admin shortcut for tablet */}
          <button
            onClick={() => setView('admin')}
            className={`hidden sm:inline-flex lg:hidden items-center gap-1 font-semibold text-[11px] px-2 py-0.5 rounded transition shrink-0 ${
              currentView === 'admin'
                ? 'bg-sky-500 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
            title="Staff & Operations Admin Back-Office"
          >
            <span>⚙️ Admin</span>
          </button>

          <div className="hidden lg:flex items-center gap-3 shrink-0">
            <span className="text-slate-400 hidden md:inline text-[11px]">{t('instantHelpVia') || 'Assistance & Support:'}</span>
            <a
              href="tel:+66808889885"
              className="inline-flex items-center gap-1 text-sky-300 hover:text-sky-200 font-medium transition"
              title="Call Phone Support"
            >
              <Icon name="phone" className="w-3.5 h-3.5 text-sky-400" />
              <span>+66 80 888 9885</span>
            </a>
            <span className="text-slate-600">/</span>
            <a
              href={`${CONTACT_CHANNELS.whatsapp.url}Hi%20NoName%20Laundry,%20I%20have%20a%20question`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-medium transition"
              title="Chat on WhatsApp"
            >
              <Icon name="whatsapp" className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </a>
            <span className="text-slate-600">/</span>
            <a
              href={CONTACT_CHANNELS.line.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-emerald-300 hover:text-emerald-200 font-medium transition"
              title="Add LINE Official"
            >
              <Icon name="line" className="w-3.5 h-3.5" />
              <span>LINE: @nonamelaundry</span>
            </a>
            <span className="text-slate-600">/</span>
            <a
              href="mailto:support@nonamelaundry.com?subject=Inquiry:%20NoName%20Laundry%20Bangkok"
              className="inline-flex items-center gap-1 text-slate-300 hover:text-slate-200 font-medium transition"
              title="Email Support"
            >
              <Icon name="mail" className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Email</span>
            </a>
            <span className="text-slate-600">|</span>
            <button
              onClick={() => setView('admin')}
              className={`inline-flex items-center gap-1 font-semibold text-[11px] px-2 py-0.5 rounded transition ${
                currentView === 'admin'
                  ? 'bg-sky-500 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
              title="Staff & Operations Admin Back-Office"
            >
              <span>⚙️ Admin</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between min-h-[4.5rem] sm:min-h-[5.5rem] py-2 gap-3">
          
          {/* Brand Logo */}
          <div 
            onClick={() => setView('home')} 
            className="flex items-center gap-3 cursor-pointer group shrink-0"
          >
            {logoError ? (
              <div className="flex items-center gap-2 py-1">
                <span className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-600 to-cyan-500 text-white flex items-center justify-center font-black text-base shadow-sm">
                  🧺
                </span>
                <span className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  NoName <span className="text-sky-600">Laundry</span>
                </span>
              </div>
            ) : (
              <img 
                src="/images/logo.png" 
                alt="NoName Laundry" 
                onError={(e) => {
                  if (!e.target.dataset.tried) {
                    e.target.dataset.tried = '1';
                    e.target.src = '/public/images/logo.png';
                  } else if (e.target.dataset.tried === '1') {
                    e.target.dataset.tried = '2';
                    e.target.src = '/images/logo_cropped.png';
                  } else {
                    setLogoError(true);
                  }
                }}
                className="h-14 sm:h-16 md:h-20 w-auto object-contain group-hover:scale-105 transition-transform"
              />
            )}
            <div className="hidden lg:block border-l-2 border-slate-200 pl-3.5 py-1">
              <p className="text-xs text-slate-600 font-extrabold tracking-wider uppercase">
                {currentCity === 'Pattaya' ? (t('brandSubtitlePattaya') || 'Pattaya Door-to-Door By KG') : (t('brandSubtitleBangkok') || 'Bangkok Door-to-Door By KG')}
              </p>
              <p className="text-[10px] text-sky-600 font-bold">
                {language === 'th' ? 'ชำระเงินไร้เงินสด 100% • บริการซักอบรีดดิจิทัล' : '100% Cashless • Digital Laundry'}
              </p>
            </div>
          </div>

          {/* City Localization Switcher */}
          <div className="hidden xl:flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 shadow-2xs shrink-0">
            <button
              type="button"
              onClick={() => onSwitchCity && onSwitchCity('Bangkok')}
              className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
                currentCity === 'Bangkok'
                  ? 'bg-white text-sky-800 shadow-xs border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Switch to Bangkok Service"
            >
              <span>🏙️</span>
              <span>{t('switchBangkok') || 'Bangkok'}</span>
            </button>
            <button
              type="button"
              onClick={() => onSwitchCity && onSwitchCity('Pattaya')}
              className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
                currentCity === 'Pattaya'
                  ? 'bg-white text-sky-800 shadow-xs border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Switch to Pattaya Service"
            >
              <span>🏖️</span>
              <span>{t('switchPattaya') || 'Pattaya'}</span>
            </button>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-0.5 xl:gap-1 shrink-0">
            {desktopNavLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => setView(link.id)}
                className={`px-3 py-2 rounded-lg text-xs xl:text-sm font-semibold whitespace-nowrap transition-colors ${
                  currentView === link.id
                    ? 'text-sky-600 bg-sky-50'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden md:flex items-center gap-2 shrink-0">
            {/* Language Switcher Pill */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200 text-xs font-bold">
              <button
                type="button"
                onClick={() => onSwitchLanguage && onSwitchLanguage('en')}
                className={`px-2.5 py-1 rounded-lg transition text-xs inline-flex items-center gap-1.5 ${
                  language === 'en'
                    ? 'bg-white text-sky-800 shadow-2xs font-extrabold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Switch to English"
              >
                <BritishFlag className="w-4 h-3" />
                <span>EN</span>
              </button>
              <button
                type="button"
                onClick={() => onSwitchLanguage && onSwitchLanguage('th')}
                className={`px-2.5 py-1 rounded-lg transition text-xs inline-flex items-center gap-1.5 ${
                  language === 'th'
                    ? 'bg-white text-sky-800 shadow-2xs font-extrabold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="เปลี่ยนเป็นภาษาไทย"
              >
                <ThaiFlag className="w-4 h-3" />
                <span>ไทย</span>
              </button>
            </div>

            {customer ? (
              <button
                onClick={() => setView('portal')}
                className={`inline-flex items-center gap-1.5 font-bold text-xs px-3 py-2 rounded-xl transition border shadow-xs ${
                  currentView === 'portal'
                    ? 'bg-sky-50 text-sky-800 border-sky-300 ring-2 ring-sky-500/20'
                    : 'text-slate-800 bg-white hover:bg-slate-50 border-slate-200'
                }`}
                title="ไปยังหน้าโปรไฟล์และคำสั่งซื้อของฉัน"
              >
                <div className="w-5 h-5 rounded-full bg-sky-600 text-white flex items-center justify-center text-[10px]">
                  👤
                </div>
                <span className="truncate max-w-[100px]">{language === 'th' ? 'คุณ ' : ''}{customer.nickName || (customer.fullName || '').split(' ')[0]}</span>
              </button>
            ) : (
              <button
                onClick={() => setView('login')}
                className={`inline-flex items-center gap-1 font-bold text-xs px-3 py-2 rounded-xl transition border shadow-xs whitespace-nowrap ${
                  currentView === 'login'
                    ? 'bg-sky-50 text-sky-700 border-sky-300'
                    : 'text-slate-700 bg-white hover:bg-slate-50 border-slate-200'
                }`}
              >
                <span>{t('navLogin')}</span>
              </button>
            )}

            <button
              onClick={() => setView('book')}
              className="inline-flex items-center gap-1.5 bg-gradient-to-r from-sky-600 to-sky-500 hover:from-sky-500 hover:to-sky-400 text-white font-bold text-xs sm:text-sm px-4 py-2 sm:py-2.5 rounded-xl shadow-md shadow-sky-600/25 hover:shadow-lg transition transform hover:-translate-y-0.5 active:translate-y-0 whitespace-nowrap"
            >
              <span>{t('navBookPickup')}</span>
              <Icon name="chevronRight" className="w-4 h-4" />
            </button>
          </div>

          {/* Mobile menu hamburger button (visible on screens smaller than lg) */}
          <div className="flex items-center gap-1.5 sm:gap-2 lg:hidden">
            {/* Mobile Language Switcher button */}
            <button
              type="button"
              onClick={() => onSwitchLanguage && onSwitchLanguage(language === 'en' ? 'th' : 'en')}
              className="px-2.5 py-1.5 rounded-lg bg-slate-100 text-xs font-bold border border-slate-200 flex items-center gap-1.5 text-slate-700 md:hidden"
              title="Toggle Language"
            >
              {language === 'en' ? (
                <>
                  <ThaiFlag className="w-4 h-3" />
                  <span>ไทย</span>
                </>
              ) : (
                <>
                  <BritishFlag className="w-4 h-3" />
                  <span>EN</span>
                </>
              )}
            </button>

            <button
              onClick={() => setView('book')}
              className="hidden sm:inline-flex bg-gradient-to-r from-sky-600 to-sky-500 text-white font-bold text-xs px-3 py-1.5 rounded-lg shadow-2xs whitespace-nowrap"
            >
              {t('navBookPickup')}
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? (
                <Icon name="x" className="w-5 h-5 sm:w-6 sm:h-6" />
              ) : (
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile dropdown menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-6 space-y-2 shadow-xl">
          {/* Mobile Language Switcher */}
          <div className="flex items-center gap-2 p-1.5 bg-slate-100 rounded-2xl mb-2">
            <button
              type="button"
              onClick={() => {
                onSwitchLanguage && onSwitchLanguage('en');
              }}
              className={`flex-1 py-1.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                language === 'en'
                  ? 'bg-white text-sky-800 shadow-xs'
                  : 'text-slate-600'
              }`}
            >
              <BritishFlag className="w-4 h-3" />
              <span>English</span>
            </button>
            <button
              type="button"
              onClick={() => {
                onSwitchLanguage && onSwitchLanguage('th');
              }}
              className={`flex-1 py-1.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                language === 'th'
                  ? 'bg-white text-sky-800 shadow-xs'
                  : 'text-slate-600'
              }`}
            >
              <ThaiFlag className="w-4 h-3" />
              <span>ภาษาไทย</span>
            </button>
          </div>

          {/* Mobile City Switcher */}
          <div className="flex items-center gap-2 p-1.5 bg-slate-100 rounded-2xl mb-3">
            <button
              type="button"
              onClick={() => {
                onSwitchCity && onSwitchCity('Bangkok');
                setMobileMenuOpen(false);
              }}
              className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                currentCity === 'Bangkok'
                  ? 'bg-white text-sky-800 shadow-xs'
                  : 'text-slate-600'
              }`}
            >
              <span>🏙️ {t('switchBangkok')}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                onSwitchCity && onSwitchCity('Pattaya');
                setMobileMenuOpen(false);
              }}
              className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                currentCity === 'Pattaya'
                  ? 'bg-white text-sky-800 shadow-xs'
                  : 'text-slate-600'
              }`}
            >
              <span>🏖️ {t('switchPattaya')}</span>
            </button>
          </div>

          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 mb-3">
            <div className="flex items-start gap-2 text-emerald-950 text-xs font-medium">
              <Icon name="phone" className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
              <span>
                {language === 'th' ? (
                  <><strong>ฝ่ายบริการลูกค้า:</strong> โทรหรือทัก WhatsApp ที่ <a href="tel:+66808889885" className="font-bold underline text-emerald-800">+66 80 888 9885</a> หรือติดต่อผ่าน LINE Official</>
                ) : (
                  <><strong>Phone & Online Support:</strong> Call or WhatsApp our team at <a href="tel:+66808889885" className="font-bold underline text-emerald-800">+66 80 888 9885</a>, or connect via LINE Official.</>
                )}
              </span>
            </div>
          </div>

          {allNavLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => {
                setView(link.id);
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-semibold transition ${
                currentView === link.id
                  ? 'bg-sky-50 text-sky-600'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              {link.label}
            </button>
          ))}

          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
            <button
              onClick={() => {
                setView('book');
                setMobileMenuOpen(false);
              }}
              className="w-full text-center bg-gradient-to-r from-sky-600 to-sky-500 hover:from-sky-500 hover:to-sky-400 text-white font-bold py-3 rounded-xl shadow-md"
            >
              {t('navBookPickup')}
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
