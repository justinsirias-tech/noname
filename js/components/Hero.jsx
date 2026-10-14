import React from 'react';
import { Icon } from './Icons.jsx';
import { useTranslation } from '../i18n.jsx';

export function Hero({ services, setView, onSelectServiceForBooking, city = 'Bangkok', onSwitchCity, onOpenContactModal }) {
  const { t } = useTranslation();

  return (
    <section className="relative overflow-hidden pt-8 pb-10 lg:pt-14 lg:pb-12 bg-gradient-to-b from-sky-50/60 via-white to-slate-50/60">
      {/* Subtle Background Glows */}
      <div className="absolute top-0 right-0 -mr-24 -mt-24 w-96 h-96 rounded-full bg-sky-200/40 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-24 -mb-24 w-96 h-96 rounded-full bg-teal-200/30 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Strictly Digital & Support Badges */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-sky-200 shadow-sm text-xs font-semibold text-sky-800">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>
              {city === 'Pattaya' 
                ? t('heroBadgePattaya')
                : t('heroBadgeBangkok')}
            </span>
          </div>

          <a
            href="tel:+66808889885"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 hover:bg-emerald-100 transition"
          >
            <Icon name="phone" className="w-3.5 h-3.5 text-emerald-600" />
            <span>{t('heroBadgeOnlineOnly')}</span>
          </a>

          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800">
            <Icon name="receipt" className="w-3.5 h-3.5 text-emerald-600" />
            <span>{t('heroBadgeCashless')}</span>
          </div>
        </div>

        {/* Main Hero Header */}
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15] break-words">
            {t('heroTitlePrefix')} {city === 'Pattaya' ? t('heroTitleCityPattaya') : t('heroTitleCityBangkok')}{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-600 via-sky-500 to-teal-500">
              {t('heroTitleSuffix')}
            </span>
          </h1>

          <p className="mt-5 text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
            {city === 'Pattaya' ? t('heroDescPattaya') : t('heroDescBangkok')}
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <button
              onClick={() => setView('book')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-sky-600 hover:bg-sky-500 text-white font-bold text-base px-8 py-3.5 rounded-xl shadow-lg shadow-sky-600/30 hover:shadow-sky-600/40 transition transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
            >
              <Icon name="truck" className="w-5 h-5" />
              <span>{t('heroCtaBook')}</span>
            </button>

            <button
              onClick={() => onOpenContactModal && onOpenContactModal()}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-800 font-bold text-base px-6 py-3.5 rounded-xl border border-slate-200 shadow-sm transition cursor-pointer"
            >
              <div className="flex -space-x-1">
                <Icon name="whatsapp" className="w-4 h-4 text-emerald-600" />
                <Icon name="line" className="w-4 h-4 text-emerald-500" />
              </div>
              <span>{t('heroCtaSupport')}</span>
            </button>
          </div>

          <div className="mt-4 flex items-center justify-center gap-4 text-xs text-slate-500 flex-wrap">
            <span className="flex items-center gap-1">
              <Icon name="check" className="w-4 h-4 text-emerald-600" /> {t('heroTrustScales')}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Icon name="check" className="w-4 h-4 text-emerald-600" /> {t('heroTrustJuristic')}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Icon name="check" className="w-4 h-4 text-emerald-600" /> {t('heroTrustCashless')}
            </span>
          </div>
        </div>

      </div>
    </section>
  );
}
