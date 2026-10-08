import React, { useState } from 'react';
import { Icon } from './Icons.jsx';
import { CONTACT_CHANNELS } from '../store.js';
import { useTranslation } from '../i18n.jsx';

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

  const desktopNavLinks = [
    { id: 'services', label: t('navServices') },
    { id: 'how-it-works', label: t('navHowItWorks') },
    { id: 'faq', label: t('navFaq') },
  ];

  const allNavLinks = [
    { id: 'home', label: t('navHome') },
    { id: 'services', label: t('navServices') },
    { id: 'how-it-works', label: t('navHowItWorks') },
    { id: 'faq', label: t('navFaq') },
    { id: 'terms', label: t('navTerms') },
    ...(customer 
      ? [{ id: 'portal', label: t('navAccount') }] 
      : [{ id: 'register', label: t('navRegister') }]
    ),
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 transition-all shadow-sm">
      {/* Top Banner: Strictly Online Support Notice */}
      <div className="bg-slate-900 text-slate-200 text-xs py-1.5 px-3 sm:px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] sm:text-[11px] font-semibold bg-sky-500/20 text-sky-300 border border-sky-500/30 shrink-0">
              {currentCity === 'Pattaya' ? (t('cityBannerPattaya') || '🏖️ Pattaya Digital Service') : (t('cityBannerBangkok') || '🏙️ Bangkok Digital Service')}
            </span>
            <span className="hidden sm:inline text-slate-400">|</span>
            <span className="flex items-center gap-1.5 text-amber-300 font-medium text-[10px] sm:text-xs min-w-0">
              <Icon name="phoneOff" className="w-3 h-3 text-amber-400 shrink-0" />
              <span className="truncate lg:overflow-visible lg:whitespace-nowrap">{t('onlineOnlyBanner') || '100% Online Support Only (No Phone Calls)'}</span>
            </span>
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
            <span className="text-slate-400 hidden md:inline text-[11px]">{t('instantHelpVia') || 'Instant Help via:'}</span>
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
              className="inline-flex items-center gap-1 text-sky-300 hover:text-sky-200 font-medium transition"
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
        <div className="flex items-center justify-between h-16 sm:h-20 gap-2">
          
          {/* Brand Logo */}
          <div 
            onClick={() => setView('home')} 
            className="flex items-center gap-3 cursor-pointer group shrink-0"
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-tr from-sky-600 via-sky-500 to-teal-400 flex items-center justify-center text-white shadow-md shadow-sky-500/20 group-hover:scale-105 transition-transform shrink-0">
              <span className="text-xl sm:text-2xl">🧺</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xl sm:text-2xl tracking-tight text-slate-900">
                  NoName
                </span>
                <span className="text-sky-600 font-extrabold text-xl sm:text-2xl">Laundry</span>
              </div>
              <p className="hidden sm:block text-[11px] text-slate-500 font-medium tracking-wide uppercase">
                {currentCity === 'Pattaya' ? (t('brandSubtitlePattaya') || 'Pattaya Door-to-Door By KG') : (t('brandSubtitleBangkok') || 'Bangkok Door-to-Door By KG')}
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
                className={`px-2 py-1 rounded-lg transition text-xs ${
                  language === 'en'
                    ? 'bg-white text-sky-800 shadow-2xs font-extrabold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Switch to English"
              >
                🇬🇧 EN
              </button>
              <button
                type="button"
                onClick={() => onSwitchLanguage && onSwitchLanguage('th')}
                className={`px-2 py-1 rounded-lg transition text-xs ${
                  language === 'th'
                    ? 'bg-white text-sky-800 shadow-2xs font-extrabold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="เปลี่ยนเป็นภาษาไทย"
              >
                🇹🇭 ไทย
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
                <span className="truncate max-w-[100px]">คุณ {customer.nickName || (customer.fullName || '').split(' ')[0]}</span>
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
              className="px-2.5 py-1.5 rounded-lg bg-slate-100 text-xs font-bold border border-slate-200 flex items-center gap-1 text-slate-700 md:hidden"
              title="Toggle Language"
            >
              <span>{language === 'en' ? '🇹🇭 ไทย' : '🇬🇧 EN'}</span>
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
              className={`flex-1 py-1.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition ${
                language === 'en'
                  ? 'bg-white text-sky-800 shadow-xs'
                  : 'text-slate-600'
              }`}
            >
              <span>🇬🇧 English</span>
            </button>
            <button
              type="button"
              onClick={() => {
                onSwitchLanguage && onSwitchLanguage('th');
              }}
              className={`flex-1 py-1.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition ${
                language === 'th'
                  ? 'bg-white text-sky-800 shadow-xs'
                  : 'text-slate-600'
              }`}
            >
              <span>🇹🇭 ภาษาไทย</span>
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

          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 mb-3">
            <div className="flex items-start gap-2 text-amber-900 text-xs font-medium">
              <Icon name="phoneOff" className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <span>
                <strong>Digital Service Only:</strong> No storefront. All support, queries & incidents handled strictly via WhatsApp, LINE, or Email.
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
