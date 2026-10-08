import React from 'react';
import { Icon } from './Icons.jsx';
import { useTranslation } from '../i18n.jsx';

export function HowItWorks({ setView }) {
  const { t } = useTranslation();
  const steps = [
    {
      step: '01',
      title: t('hiwStep1Title'),
      desc: t('hiwStep1Desc'),
      icon: 'receipt',
      badge: t('hiwStep1Badge')
    },
    {
      step: '02',
      title: t('hiwStep2Title'),
      desc: t('hiwStep2Desc'),
      icon: 'package',
      badge: t('hiwStep2Badge')
    },
    {
      step: '03',
      title: t('hiwStep3Title'),
      desc: t('hiwStep3Desc'),
      icon: 'scale',
      badge: t('hiwStep3Badge')
    },
    {
      step: '04',
      title: t('hiwStep4Title'),
      desc: t('hiwStep4Desc'),
      icon: 'truck',
      badge: t('hiwStep4Badge')
    }
  ];

  return (
    <section id="how-it-works" className="py-16 sm:py-24 bg-slate-50 border-t border-slate-200/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-sky-600 bg-sky-100 px-3 py-1 rounded-full">
            {t('hiwTag')}
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-3">
            {t('hiwTitle')}
          </h2>
          <p className="mt-3 text-base text-slate-600">
            {t('hiwSubtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((item, idx) => (
            <div
              key={idx}
              className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition relative flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl font-black text-sky-600/30">
                    {item.step}
                  </span>
                  <span className="text-[11px] font-bold text-sky-700 bg-sky-50 border border-sky-200/60 px-2 py-0.5 rounded-md">
                    {item.badge}
                  </span>
                </div>

                <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center mb-4">
                  <Icon name={item.icon} className="w-6 h-6" />
                </div>

                <h3 className="text-base font-extrabold text-slate-900 mb-2">
                  {item.title}
                </h3>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {item.desc}
                </p>
              </div>

              <div className="mt-6 pt-3 border-t border-slate-100 text-[11px] text-slate-400 font-medium">
                Step {idx + 1} of 4
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <button
            onClick={() => setView('book')}
            className="inline-flex items-center gap-2 bg-sky-600 hover:bg-sky-500 text-white font-bold text-sm px-6 py-3 rounded-xl shadow-md transition"
          >
            <span>Ready? Schedule Pickup Now</span>
            <Icon name="chevronRight" className="w-4 h-4" />
          </button>
        </div>

      </div>
    </section>
  );
}
