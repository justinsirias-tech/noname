import React, { useState } from 'react';
import { Icon } from './Icons.jsx';
import { CONTACT_CHANNELS } from '../store.js';

export function Navbar({ currentView, setView, onOpenContactModal }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { id: 'home', label: 'Home' },
    { id: 'services', label: 'Pricing & Services' },
    { id: 'how-it-works', label: 'How It Works' },
    { id: 'track', label: 'Track Order' },
    { id: 'terms', label: 'Terms & Conditions' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 transition-all shadow-sm">
      {/* Top Banner: Strictly Online Support Notice */}
      <div className="bg-slate-900 text-slate-200 text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-sky-500/20 text-sky-300 border border-sky-500/30">
              Bangkok Digital Service
            </span>
            <span className="hidden sm:inline text-slate-400">|</span>
            <span className="flex items-center gap-1.5 text-amber-300 font-medium">
              <Icon name="phoneOff" className="w-3.5 h-3.5 text-amber-400" />
              <span>100% Online Support Only (No Phone Calls)</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-slate-400 hidden md:inline text-[11px]">Instant Help via:</span>
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
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Brand Logo */}
          <div 
            onClick={() => setView('home')} 
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-tr from-sky-600 via-sky-500 to-teal-400 flex items-center justify-center text-white shadow-md shadow-sky-500/20 group-hover:scale-105 transition-transform">
              <span className="text-xl sm:text-2xl">🧺</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xl sm:text-2xl tracking-tight text-slate-900">
                  NoName
                </span>
                <span className="text-sky-600 font-extrabold text-xl sm:text-2xl">Laundry</span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium tracking-wide uppercase">
                Bangkok Door-to-Door By KG
              </p>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => setView(link.id)}
                className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors ${
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
          <div className="hidden sm:flex items-center gap-2.5">
            <button
              onClick={() => setView('crm')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition border ${
                currentView === 'crm'
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                  : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border-indigo-200'
              }`}
              title="Open Enterprise Customer CRM Portal"
            >
              <Icon name="users" className="w-3.5 h-3.5" />
              <span>CRM Portal</span>
            </button>

            <button
              onClick={() => setView('admin')}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition border ${
                currentView === 'admin'
                  ? 'bg-slate-900 text-white border-slate-800'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-300'
              }`}
              title="Admin Back-Office Settings & Pricing"
            >
              <Icon name="settings" className="w-3.5 h-3.5" />
              <span>Admin</span>
            </button>

            <button
              onClick={() => setView('book')}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-sky-600 to-sky-500 hover:from-sky-500 hover:to-sky-400 text-white font-bold text-sm px-5 py-2.5 rounded-xl shadow-md shadow-sky-600/25 hover:shadow-lg hover:shadow-sky-600/30 transition transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <span>Book Pickup</span>
              <Icon name="chevronRight" className="w-4 h-4" />
            </button>
          </div>

          {/* Mobile menu hamburger button */}
          <div className="flex items-center gap-2 sm:hidden">
            <button
              onClick={() => setView('book')}
              className="bg-sky-600 text-white font-bold text-xs px-3 py-1.5 rounded-lg shadow-sm"
            >
              Book
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? (
                <Icon name="x" className="w-6 h-6" />
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 mb-3">
            <div className="flex items-start gap-2 text-amber-900 text-xs font-medium">
              <Icon name="phoneOff" className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <span>
                <strong>Digital Service Only:</strong> No storefront. All support, queries & incidents handled strictly via WhatsApp, LINE, or Email.
              </span>
            </div>
          </div>

          {navLinks.map((link) => (
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
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  setView('crm');
                  setMobileMenuOpen(false);
                }}
                className="w-full text-center bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold py-2 rounded-xl border border-indigo-200 text-xs flex items-center justify-center gap-1.5"
              >
                <Icon name="users" className="w-3.5 h-3.5" />
                <span>CRM Portal</span>
              </button>
              <button
                onClick={() => {
                  setView('admin');
                  setMobileMenuOpen(false);
                }}
                className="w-full text-center bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2 rounded-xl border border-slate-300 text-xs flex items-center justify-center gap-1.5"
              >
                <Icon name="settings" className="w-3.5 h-3.5" />
                <span>Admin</span>
              </button>
            </div>

            <button
              onClick={() => {
                setView('book');
                setMobileMenuOpen(false);
              }}
              className="w-full text-center bg-sky-600 hover:bg-sky-500 text-white font-bold py-3 rounded-xl shadow-md"
            >
              Book Pickup Now
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
