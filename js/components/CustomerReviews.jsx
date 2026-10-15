import React, { useState } from 'react';
import { Icon } from './Icons.jsx';
import { useTranslation } from '../i18n.jsx';

export const REVIEWS_DATA = [
  {
    id: 1,
    name: 'Mark Rutherford',
    role: 'Expat Resident • 3 Years in Bangkok',
    condo: 'Ashton Asoke, Sukhumvit 21',
    district: 'Watthana / Khlong Toei',
    rating: 5,
    date: 'October 10, 2026',
    service: '🧺 Wash / Fold (7.2 KG)',
    turnaround: 'Standard (2 Days)',
    avatar: 'MR',
    avatarBg: 'bg-gradient-to-tr from-sky-600 to-blue-600',
    title: 'Flawless condo lobby pickup & digital scale accuracy',
    content: 'Living in a high-rise without a dryer was a hassle until I started using NoName Laundry. I simply drop the bag with the Ashton reception desk before work. Driver Somkit sends a scale photo on WhatsApp, and 2 days later it is delivered back in sealed dust-proof bags smelling crisp and fresh. Remarkable service.',
    verified: true
  },
  {
    id: 2,
    name: 'Ploy Kittisuk',
    role: 'Corporate Management Consultant',
    condo: 'The Estelle Phrom Phong, Sukhumvit 26',
    district: 'Watthana (Phrom Phong)',
    rating: 5,
    date: 'October 8, 2026',
    service: '👔 Wash / Iron / Hang (4.5 KG)',
    turnaround: 'Next Day',
    avatar: 'PK',
    avatarBg: 'bg-gradient-to-tr from-indigo-600 to-purple-600',
    title: 'Crisp executive ironing & punctual morning courier',
    content: 'The steam ironing on my work blouses and formal shirts is top notch. Their driver arrives right on time in the morning slot. No cash hassle either—just quick PromptPay QR scan upon scale confirmation. Highly recommended for busy Bangkok professionals.',
    verified: true
  },
  {
    id: 3,
    name: 'David Miller',
    role: 'Digital Nomad & Long-Stay Traveler',
    condo: 'Unixx South Pattaya, Pratumnak',
    district: 'South Pattaya / Pratumnak',
    rating: 5,
    date: 'October 4, 2026',
    service: '🚀 Same Day Express (5.0 KG)',
    turnaround: 'Same Day',
    avatar: 'DM',
    avatarBg: 'bg-gradient-to-tr from-amber-500 to-orange-600',
    title: 'Same day service in Pattaya saved my trip',
    content: 'Needed my clothes and linens washed urgently before a weekend trip. Driver collected from the Unixx lobby counter at 11:00 AM and brought everything back neatly folded and smelling like fresh lavender by 7:30 PM. Transparent pricing by the KG, no tourist rip-offs.',
    verified: true
  },
  {
    id: 4,
    name: 'Sarah Lin',
    role: 'Architect & Interior Designer',
    condo: 'Rhythm Ekkamai, Sukhumvit 63',
    district: 'Watthana (Ekkamai)',
    rating: 5,
    date: 'September 28, 2026',
    service: '🛏️ King Duvet & Bedding Set',
    turnaround: 'Standard (2 Days)',
    avatar: 'SL',
    avatarBg: 'bg-gradient-to-tr from-emerald-600 to-teal-600',
    title: 'Heavy king-size duvets cleaned to perfection',
    content: 'King size duvets never fit properly in compact condo washing machines. NoName took our heavy winter duvet, bedsheets, and plush towels. They returned sanitized, super fluffy, and sealed in waterproof bags with zero harsh chemical odor. Absolutely 5 stars.',
    verified: true
  },
  {
    id: 5,
    name: 'Thomas Becker',
    role: 'Finance Director',
    condo: 'Silom Grand Terrace, Saladaeng',
    district: 'Bang Rak (Silom)',
    rating: 5,
    date: 'September 22, 2026',
    service: '🧺 Wash / Fold (Weekly Subscription)',
    turnaround: 'Standard (2 Days)',
    avatar: 'TB',
    avatarBg: 'bg-gradient-to-tr from-cyan-600 to-sky-600',
    title: 'Best digital laundry service in Bangkok by a mile',
    content: 'The digital scale weight receipt sent to my LINE gives complete peace of mind. Other laundries guess the weight or overcharge, but NoName sends a certified photo showing the digital scale reading. Transparent, fast, and polite drivers.',
    verified: true
  },
  {
    id: 6,
    name: 'Dr. Siriporn Thanakit',
    role: 'Medical Practitioner',
    condo: 'Centric Ari Station, Soi Ari 1',
    district: 'Phaya Thai (Ari)',
    rating: 5,
    date: 'September 17, 2026',
    service: '🧺 Wash / Iron / Fold (5.8 KG)',
    turnaround: 'Next Day',
    avatar: 'ST',
    avatarBg: 'bg-gradient-to-tr from-rose-500 to-pink-600',
    title: 'Hassle-free juristic office drop-off in Ari',
    content: 'I leave the laundry bag with our juristic office on my way to the hospital, which means I never have to wait at home for a courier. The clothes are returned folded with extreme care. The online tracking link keeps me updated at every stage.',
    verified: true
  }
];

export function CustomerReviews({ setView }) {
  const { language } = useTranslation();
  const [activeCategory, setActiveCategory] = useState('all');

  const categories = [
    { id: 'all', label: language === 'th' ? 'รีวิวทั้งหมด (1,280+)' : 'All Reviews (1,280+)' },
    { id: 'condo', label: language === 'th' ? 'ชาวคอนโดมิเนียม' : 'Condo Residents' },
    { id: 'express', label: language === 'th' ? 'บริการด่วน (Next / Same Day)' : 'Express & Same Day' },
    { id: 'bedding', label: language === 'th' ? 'ผ้านวม & เครื่องนอน' : 'Bedding & Linens' }
  ];

  const filteredReviews = REVIEWS_DATA.filter(r => {
    if (activeCategory === 'condo') return r.condo.includes('Ashton') || r.condo.includes('Estelle') || r.condo.includes('Rhythm');
    if (activeCategory === 'express') return r.turnaround.includes('Next Day') || r.turnaround.includes('Same Day');
    if (activeCategory === 'bedding') return r.service.includes('Duvet') || r.service.includes('Bedding');
    return true;
  });

  return (
    <section id="reviews" className="py-16 sm:py-24 bg-slate-50 border-t border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-bold uppercase tracking-wider mb-3 border border-amber-200 shadow-2xs">
            <span>⭐⭐⭐⭐⭐</span>
            <span>{language === 'th' ? 'คะแนนความพึงพอใจ 4.9/5.0' : 'Rated 4.9 / 5.0 by 1,280+ Customers'}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            {language === 'th' ? 'เสียงตอบรับจากลูกค้าในกรุงเทพฯ และพัทยา' : 'Loved by Condo Residents, Expats & Travelers'}
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl mx-auto">
            {language === 'th'
              ? 'อ่านความประทับใจจริงจากลูกค้าที่ไว้วางใจให้ NoName Laundry ดูแลเสื้อผ้าและเครื่องนอนเป็นประจำทุกสัปดาห์'
              : 'Discover why thousands of condominium residents and busy professionals trust NoName Laundry for punctual door-to-door fabric care.'}
          </p>

          {/* Trust Highlights Stats Bar */}
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl mx-auto">
            <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/90 shadow-2xs text-center">
              <div className="text-2xl sm:text-3xl font-black text-sky-600">4.9 / 5.0</div>
              <div className="text-[11px] font-bold text-slate-500 mt-0.5">Average Customer Rating</div>
            </div>
            <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/90 shadow-2xs text-center">
              <div className="text-2xl sm:text-3xl font-black text-emerald-600">99.4%</div>
              <div className="text-[11px] font-bold text-slate-500 mt-0.5">On-Time Delivery Rate</div>
            </div>
            <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/90 shadow-2xs text-center">
              <div className="text-2xl sm:text-3xl font-black text-indigo-600">15,000+</div>
              <div className="text-[11px] font-bold text-slate-500 mt-0.5">Laundry Bags Cleaned</div>
            </div>
            <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/90 shadow-2xs text-center">
              <div className="text-2xl sm:text-3xl font-black text-amber-500">100%</div>
              <div className="text-[11px] font-bold text-slate-500 mt-0.5">Digital Scale Verified</div>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="mt-8 flex items-center justify-center gap-2 flex-wrap">
            {categories.map(cat => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold transition cursor-pointer ${
                  activeCategory === cat.id
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredReviews.map((rev) => (
            <div
              key={rev.id}
              className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm hover:shadow-md transition flex flex-col justify-between group"
            >
              <div>
                {/* Header: Avatar, Name, Rating */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full ${rev.avatarBg} text-white font-extrabold flex items-center justify-center text-sm shadow-2xs shrink-0`}>
                      {rev.avatar}
                    </div>
                    <div>
                      <div className="font-extrabold text-sm text-slate-900 flex items-center gap-1.5">
                        <span>{rev.name}</span>
                        {rev.verified && (
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded-full border border-emerald-200 inline-flex items-center gap-0.5" title="Verified Order">
                            <Icon name="check" className="w-2.5 h-2.5" /> Verified
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 font-medium truncate max-w-[200px]">
                        {rev.role}
                      </div>
                    </div>
                  </div>

                  {/* 5 Stars */}
                  <div className="text-amber-400 text-xs shrink-0 tracking-wider">
                    {'★'.repeat(rev.rating)}
                  </div>
                </div>

                {/* Condo & Service Tags */}
                <div className="flex flex-wrap items-center gap-1.5 mb-3.5">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                    📍 {rev.condo}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-sky-50 text-sky-800 border border-sky-100">
                    {rev.service}
                  </span>
                </div>

                {/* Review Title */}
                <h4 className="font-extrabold text-sm text-slate-900 mb-2 leading-snug">
                  "{rev.title}"
                </h4>

                {/* Content */}
                <p className="text-xs text-slate-600 leading-relaxed">
                  {rev.content}
                </p>
              </div>

              {/* Review Footer */}
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span>{rev.date}</span>
                <span className="text-sky-600 font-bold">{rev.turnaround}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA to Book */}
        <div className="mt-12 text-center">
          <button
            type="button"
            onClick={() => {
              if (setView) setView('services');
            }}
            className="inline-flex items-center gap-2 bg-sky-600 hover:bg-sky-500 text-white font-extrabold text-sm sm:text-base px-8 py-3.5 rounded-xl shadow-lg shadow-sky-600/30 transition transform hover:-translate-y-0.5 cursor-pointer"
          >
            <span>{language === 'th' ? 'เลือกดูบริการและจองรับผ้าออนไลน์' : 'View Services & Schedule Your Pickup'}</span>
            <Icon name="chevronRight" className="w-5 h-5" />
          </button>
        </div>

      </div>
    </section>
  );
}
