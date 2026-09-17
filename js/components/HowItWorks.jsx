import React from 'react';
import { Icon } from './Icons.jsx';

export function HowItWorks({ setView }) {
  const steps = [
    {
      step: '01',
      title: 'Book Digital Pickup',
      desc: 'Select your service, estimated KG, and choose your Bangkok condo/district. Select whether to receive updates via LINE, WhatsApp, or Email.',
      icon: 'receipt',
      badge: 'Zero Phone Calls'
    },
    {
      step: '02',
      title: 'Bag Tagging & Collection',
      desc: 'Leave your laundry bag with your condo juristic office or hand directly to our courier. A unique physical barcode tag is attached on-site.',
      icon: 'package',
      badge: 'Lobby Drop-Off OK'
    },
    {
      step: '03',
      title: 'Facility Digital Scale Weigh-In',
      desc: 'Upon arrival at our Bangkok laundry hub, your bag is weighed on precision digital scales. We log the actual KG and update your online invoice.',
      icon: 'scale',
      badge: 'Transparent Weight'
    },
    {
      step: '04',
      title: 'Fresh Doorstep Return',
      desc: 'Garments are returned clean, folded or hung in sealed protective dust covers within 24–48 hours. Real-time delivery notification sent online.',
      icon: 'truck',
      badge: 'Prompt Delivery'
    }
  ];

  return (
    <section id="how-it-works" className="py-16 sm:py-24 bg-slate-50 border-t border-slate-200/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-sky-600 bg-sky-100 px-3 py-1 rounded-full">
            Effortless Workflow
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-3">
            How NoName Cloud Laundry Works
          </h2>
          <p className="mt-3 text-base text-slate-600">
            Engineered for busy Bangkok residents, expat professionals, and modern condo living.
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
