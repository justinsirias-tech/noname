import React, { useState, useMemo } from 'react';
import { Icon } from './Icons.jsx';
import { useTranslation } from '../i18n.jsx';

export function HowItWorks({ setView }) {
  const { t, language } = useTranslation();
  const [activeStep, setActiveStep] = useState(0);

  const steps = useMemo(() => [
    {
      num: '01',
      title: t('hiwStep1Title'),
      tag: t('hiwStep1Tag'),
      badge: t('hiwStep1Badge'),
      headline: t('hiwStep1Headline'),
      description: t('hiwStep1Desc'),
      details: Array.isArray(t('hiwStep1Details')) ? t('hiwStep1Details') : [
        'Instant confirmation via WhatsApp, LINE, or Email',
        'Specify any special fabric care or separation instructions',
        'No cash required — fully cashless & transparent'
      ],
      image: '/images/step1_book_online.jpg',
      icon: 'receipt',
      color: 'sky'
    },
    {
      num: '02',
      title: t('hiwStep2Title'),
      tag: t('hiwStep2Tag'),
      badge: t('hiwStep2Badge'),
      headline: t('hiwStep2Headline'),
      description: t('hiwStep2Desc'),
      details: Array.isArray(t('hiwStep2Details')) ? t('hiwStep2Details') : [
        'Door-to-door direct collection or condo juristic desk pickup',
        'Serialized barcode tracking attached immediately to your bag',
        'Real-time courier pickup alert sent to your phone'
      ],
      image: '/images/step2_condo_pickup.jpg',
      icon: 'package',
      color: 'teal'
    },
    {
      num: '03',
      title: t('hiwStep3Title'),
      tag: t('hiwStep3Tag'),
      badge: t('hiwStep3Badge'),
      headline: t('hiwStep3Headline'),
      description: t('hiwStep3Desc'),
      details: Array.isArray(t('hiwStep3Details')) ? t('hiwStep3Details') : [
        'Certified digital scale weigh-in with photographic proof',
        'Strict individual machine batching — zero clothes mixing',
        'Hypoallergenic eco-detergents & gentle steam-ironing'
      ],
      image: '/images/step3_digital_scale.jpg',
      icon: 'scale',
      color: 'indigo'
    },
    {
      num: '04',
      title: t('hiwStep4Title'),
      tag: t('hiwStep4Tag'),
      badge: t('hiwStep4Badge'),
      headline: t('hiwStep4Headline'),
      description: t('hiwStep4Desc'),
      details: Array.isArray(t('hiwStep4Details')) ? t('hiwStep4Details') : [
        'Protected in sealed water-resistant & dust-proof garment bags',
        'Delivered back to your door or left safely with your juristic desk',
        'Digital QR PromptPay or Credit Card invoice generated automatically'
      ],
      image: '/images/step4_clean_delivery.jpg',
      icon: 'truck',
      color: 'emerald'
    }
  ], [t, language]);

  return (
    <section id="how-it-works" className="py-16 sm:py-24 bg-white border-t border-slate-200/80 scroll-mt-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 border border-sky-200 text-xs font-bold text-sky-700 uppercase tracking-wider mb-3">
            <Icon name="sparkles" className="w-3.5 h-3.5 text-sky-600" />
            <span>{t('hiwTag')}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight">
            {t('hiwTitle')}
          </h2>
          <p className="mt-3 text-base sm:text-lg text-slate-600 leading-relaxed">
            {t('hiwSubtitle')} {t('hiwSubtitleSuffix')}
          </p>
        </div>

        {/* 4 Steps Visual Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {steps.map((step, idx) => (
            <div
              key={idx}
              onClick={() => setActiveStep(idx)}
              className={`group rounded-3xl border transition-all duration-300 flex flex-col justify-between overflow-hidden cursor-pointer ${
                activeStep === idx
                  ? 'border-sky-500 shadow-xl shadow-sky-500/10 ring-2 ring-sky-500/20 bg-white'
                  : 'border-slate-200 bg-slate-50/70 hover:bg-white hover:border-slate-300 hover:shadow-md'
              }`}
            >
              {/* Image Header with Step Badge */}
              <div className="relative h-44 w-full overflow-hidden bg-slate-100">
                <img
                  src={step.image}
                  alt={step.title}
                  width="360"
                  height="269"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                  decoding="async"
                  onError={(e) => {
                    if (!e.target.dataset.tried) {
                      e.target.dataset.tried = '1';
                      e.target.src = '/public' + step.image;
                    }
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent" />
                
                {/* Step Number Badge */}
                <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm text-slate-900 font-extrabold text-xs px-2.5 py-1 rounded-xl shadow-sm flex items-center gap-1.5 border border-white/50">
                  <span className="w-2 h-2 rounded-full bg-sky-500" />
                  <span>{language === 'th' ? `ขั้นตอน ${step.num}` : `Step ${step.num}`}</span>
                </div>

                {/* Key feature chip */}
                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-sky-300 bg-slate-950/60 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10">
                    {step.badge}
                  </span>
                </div>
              </div>

              {/* Text Body */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-sky-600 transition mb-2">
                    {step.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                    {step.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-sky-600 font-semibold flex items-center gap-1">
                    <span>{t('hiwExploreDetails')}</span>
                    <Icon name="chevronRight" className="w-3.5 h-3.5" />
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium">
                    {step.tag.split('•')[1] || `0${idx + 1}`}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Detailed Spotlight of the Active Step */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-sky-950 rounded-3xl p-6 sm:p-10 text-white shadow-2xl relative overflow-hidden">
          <div className="absolute -right-20 -bottom-20 w-80 h-80 rounded-full bg-sky-500/20 blur-3xl pointer-events-none" />
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            {/* Left: Step Description */}
            <div className="lg:col-span-7">
              <div className="flex items-center gap-2 mb-3">
                <span className="px-3 py-1 rounded-full bg-sky-500/20 border border-sky-400/30 text-sky-300 text-xs font-bold uppercase tracking-wider">
                  {language === 'th' ? `ขั้นตอนที่ ${steps[activeStep].num}` : `Step ${steps[activeStep].num} ${t('hiwSpotlight')}`}
                </span>
                <span className="text-slate-400 text-xs">
                  • {steps[activeStep].badge}
                </span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-3">
                {steps[activeStep].title}
              </h3>

              <p className="text-sm sm:text-base text-slate-300 leading-relaxed mb-6">
                {steps[activeStep].description}
              </p>

              {/* 3 bullet perks */}
              <div className="space-y-2.5 mb-8">
                {steps[activeStep].details.map((detail, dIdx) => (
                  <div key={dIdx} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                      <Icon name="check" className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs sm:text-sm text-slate-200 font-medium">
                      {detail}
                    </span>
                  </div>
                ))}
              </div>

              {/* Quick switcher buttons */}
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/10">
                <span className="text-xs text-slate-400 mr-2">{t('hiwJumpToStep')}</span>
                {steps.map((st, sIdx) => (
                  <button
                    key={sIdx}
                    onClick={() => setActiveStep(sIdx)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                      activeStep === sIdx
                        ? 'bg-sky-500 text-white shadow-md'
                        : 'bg-white/10 hover:bg-white/20 text-slate-300'
                    }`}
                  >
                    {language === 'th' ? `ขั้นตอน ${st.num}` : `Step ${st.num}`}
                  </button>
                ))}
              </div>
            </div>

            {/* Right: Step Visual Card with Interactive Badges */}
            <div className="lg:col-span-5">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/15 bg-slate-900 group">
                <img
                  src={steps[activeStep].image}
                  alt={steps[activeStep].title}
                  width="540"
                  height="403"
                  loading="lazy"
                  decoding="async"
                  className="w-full h-72 sm:h-80 object-cover object-center group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                
                <div className="absolute bottom-5 left-5 right-5">
                  <div className="bg-slate-900/90 backdrop-blur-md p-4 rounded-xl border border-white/15">
                    <div className="flex items-center justify-between text-xs text-sky-300 font-bold mb-1">
                      <span>{t('hiwVerifiedWorkflow')}</span>
                      <span>{t('hiwVerifiedHours')}</span>
                    </div>
                    <p className="text-xs text-slate-200">
                      {t('hiwCondoNotice')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons to Services & Booking */}
        <div className="mt-12 text-center flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => setView('book')}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-sky-600 hover:bg-sky-500 text-white font-bold text-sm sm:text-base px-8 py-3.5 rounded-xl shadow-lg shadow-sky-600/25 transition transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
          >
            <Icon name="truck" className="w-4 h-4" />
            <span>{t('hiwScheduleBtn')}</span>
          </button>

          <button
            onClick={() => setView('services')}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm sm:text-base px-6 py-3.5 rounded-xl border border-slate-200 transition cursor-pointer"
          >
            <span>{t('hiwPricingBtn')}</span>
            <Icon name="chevronRight" className="w-4 h-4" />
          </button>
        </div>

      </div>
    </section>
  );
}
