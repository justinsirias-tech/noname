import React, { useState, useMemo } from 'react';
import { Icon } from './Icons.jsx';
import { CONTACT_CHANNELS, laundryStore } from '../store.js';
import { FAQ_CATEGORIES } from '../data/faqData.js';

export function FaqSection({ setView }) {
  const [faqs, setFaqs] = useState(() => laundryStore.getPublishedFaqs());
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState('FAQ-1'); // Expand first item by default

  // Subscribe to store updates (so if admin adds or edits FAQs, it updates live!)
  React.useEffect(() => {
    const unsub = laundryStore.subscribe(() => {
      setFaqs(laundryStore.getPublishedFaqs());
    });
    return unsub;
  }, []);

  // Compute available categories dynamically from existing published faqs
  const availableCategories = useMemo(() => {
    const catSet = new Set(['ALL']);
    faqs.forEach(f => {
      if (f.category) catSet.add(f.category);
    });
    return Array.from(catSet);
  }, [faqs]);

  // Filter FAQs based on active category and search term
  const filteredFaqs = useMemo(() => {
    return faqs.filter(faq => {
      const matchCat = activeCategory === 'ALL' || faq.category === activeCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch = !q || 
        faq.question.toLowerCase().includes(q) || 
        faq.answer.toLowerCase().includes(q) ||
        (faq.category && faq.category.toLowerCase().includes(q));
      return matchCat && matchSearch;
    });
  }, [faqs, activeCategory, searchQuery]);

  const toggleAccordion = (id) => {
    setExpandedId(prev => prev === id ? null : id);
  };

  return (
    <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      
      {/* Section Header */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 text-sky-700 text-xs font-bold mb-3 border border-sky-200 shadow-sm">
          <span>❓ Got Questions? We Have Answers</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Frequently Asked Questions
        </h2>
        <p className="text-sm text-slate-600 mt-3 leading-relaxed">
          Everything you need to know about Bangkok's purely digital door-to-door laundry service — from certified digital scale weigh-ins to condo juristic drop-offs.
        </p>
      </div>

      {/* Search Input */}
      <div className="relative max-w-xl mx-auto mb-8">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
          <Icon name="search" className="w-4 h-4" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search question or topic (e.g. scale weight, condo drop-off, payment)..."
          className="w-full pl-11 pr-10 py-3 rounded-2xl border border-slate-200 bg-white shadow-sm text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 text-xs"
          >
            ✕
          </button>
        )}
      </div>

      {/* Category Pills */}
      <div className="flex items-center justify-center gap-1.5 flex-wrap mb-10">
        {availableCategories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
              activeCategory === cat
                ? 'bg-slate-900 text-white shadow-md'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* FAQs Accordion List */}
      <div className="space-y-3">
        {filteredFaqs.length > 0 ? (
          filteredFaqs.map((faq) => {
            const isExpanded = expandedId === faq.id;
            return (
              <div
                key={faq.id}
                className={`rounded-2xl border transition overflow-hidden ${
                  isExpanded 
                    ? 'border-sky-400 bg-white shadow-md ring-1 ring-sky-300/40' 
                    : 'border-slate-200 bg-white hover:border-slate-300 shadow-sm'
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleAccordion(faq.id)}
                  className="w-full text-left p-4 sm:p-5 flex items-start justify-between gap-4 focus:outline-none"
                >
                  <div className="flex-1">
                    {faq.category && (
                      <span className="inline-block px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-semibold text-[10px] uppercase tracking-wider mb-1.5">
                        {faq.category}
                      </span>
                    )}
                    <h3 className={`font-extrabold text-sm sm:text-base tracking-tight transition ${
                      isExpanded ? 'text-sky-700' : 'text-slate-900'
                    }`}>
                      {faq.question}
                    </h3>
                  </div>

                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-transform ${
                    isExpanded ? 'bg-sky-100 text-sky-700 rotate-180' : 'bg-slate-100 text-slate-500'
                  }`}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-4 pb-5 sm:px-5 sm:pb-6 pt-1 text-slate-600 text-xs sm:text-sm leading-relaxed border-t border-slate-100 animate-fadeIn">
                    <p className="whitespace-pre-line">{faq.answer}</p>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto text-xl">
              🔍
            </div>
            <h4 className="font-bold text-slate-800 text-sm">No matching questions found</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              We couldn't find any questions matching "{searchQuery}". Try a different keyword or contact our support team.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setActiveCategory('ALL');
              }}
              className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Support Callout Card */}
      <div className="mt-12 bg-gradient-to-r from-sky-50 via-teal-50 to-emerald-50 rounded-3xl p-6 sm:p-8 border border-sky-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-1 text-center sm:text-left">
          <h4 className="font-black text-slate-900 text-base">Still have questions?</h4>
          <p className="text-xs text-slate-600 max-w-md">
            Our team is available exclusively online via WhatsApp and LINE Official Account to help you with special care requests, condominium juristic logistics, or same-day pickups.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap shrink-0">
          <a
            href={`${CONTACT_CHANNELS.whatsapp.url}Hi%20NoName%20Laundry,%20I%20have%20a%20question%20about%20your%20service`}
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition"
          >
            <Icon name="whatsapp" className="w-4 h-4 text-white" />
            <span>Chat on WhatsApp</span>
          </a>

          <a
            href={CONTACT_CHANNELS.line.url}
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2.5 rounded-xl bg-green-600 hover:bg-green-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-green-600/20 transition"
          >
            <Icon name="line" className="w-4 h-4 text-white" />
            <span>LINE Official</span>
          </a>
        </div>
      </div>

    </section>
  );
}
