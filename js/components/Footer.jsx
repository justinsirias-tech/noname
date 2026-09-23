import React from 'react';
import { Icon } from './Icons.jsx';
import { CONTACT_CHANNELS } from '../store.js';

export function Footer({ setView }) {
  return (
    <footer className="bg-slate-900 text-slate-400 text-xs border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          
          {/* Col 1: Brand & Digital Policy */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-600 to-teal-400 flex items-center justify-center text-white font-bold text-lg">
                🧺
              </div>
              <span className="text-xl font-black tracking-tight text-white">
                NoName<span className="text-sky-500">Laundry</span>
              </span>
            </div>

            <p className="text-slate-400 text-xs leading-relaxed">
              Bangkok's purely digital laundry service by KG. Professional wash, steam iron, and fold/hang delivered directly to your condominium or house.
            </p>

            <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/80 text-[11px] text-amber-300 flex items-start gap-2">
              <Icon name="phoneOff" className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>
                <strong>Zero Phone Calls Policy:</strong> All support, updates, and claims are handled exclusively via WhatsApp, LINE, or Email.
              </span>
            </div>
          </div>

          {/* Col 2: Services by KG */}
          <div className="space-y-3">
            <h4 className="text-white font-extrabold text-xs uppercase tracking-wider">
              Services by Weight
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => setView('services')} className="hover:text-white transition">
                  Wash / Fold (Everyday Wear)
                </button>
              </li>
              <li>
                <button onClick={() => setView('services')} className="hover:text-white transition">
                  Wash / Iron / Fold (Crisp Steam Iron)
                </button>
              </li>
              <li>
                <button onClick={() => setView('services')} className="hover:text-white transition">
                  Wash / Iron / Hang (Wardrobe Ready)
                </button>
              </li>
              <li>
                <button onClick={() => setView('book')} className="hover:text-white transition text-sky-400">
                  Instant Price Calculator
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Bangkok Coverage & Protocol */}
          <div className="space-y-3">
            <h4 className="text-white font-extrabold text-xs uppercase tracking-wider">
              Bangkok Coverage
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-400">
              <li>• Watthana (Thonglor, Ekkamai, Phrom Phong)</li>
              <li>• Khlong Toei (Phra Khanong, Asok)</li>
              <li>• Bang Rak (Silom, Surawong) & Sathon</li>
              <li>• Pathum Wan, Phaya Thai (Ari), Huai Khwang</li>
              <li>• Condo Juristic drop-off supported</li>
            </ul>
          </div>

          {/* Col 4: Digital Support Channels */}
          <div className="space-y-3">
            <h4 className="text-white font-extrabold text-xs uppercase tracking-wider">
              Digital Communication Only
            </h4>
            <div className="space-y-2">
              <a
                href={`${CONTACT_CHANNELS.whatsapp.url}Hi%20NoName%20Laundry%20Bangkok`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 text-emerald-400 hover:text-emerald-300 transition"
              >
                <Icon name="whatsapp" className="w-4 h-4" />
                <span>WhatsApp: {CONTACT_CHANNELS.whatsapp.handle}</span>
              </a>

              <a
                href={CONTACT_CHANNELS.line.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 text-green-400 hover:text-green-300 transition"
              >
                <Icon name="line" className="w-4 h-4" />
                <span>LINE: {CONTACT_CHANNELS.line.handle}</span>
              </a>

              <a
                href="mailto:support@nonamelaundry.com"
                className="flex items-center gap-2 text-sky-400 hover:text-sky-300 transition"
              >
                <Icon name="mail" className="w-4 h-4" />
                <span>Email: {CONTACT_CHANNELS.email.handle}</span>
              </a>
            </div>

            <div className="pt-2 flex flex-col gap-1.5 items-start">
              <button
                onClick={() => setView('faq')}
                className="text-xs text-sky-400 hover:text-sky-300 font-bold underline underline-offset-4"
              >
                ❓ Frequently Asked Questions (FAQ)
              </button>
              <button
                onClick={() => setView('terms')}
                className="text-xs text-slate-300 hover:text-white underline underline-offset-4"
              >
                Terms & Conditions of Service
              </button>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500 text-[11px]">
          <div>
            © {new Date().getFullYear()} NoName Laundry (Bangkok, Thailand). All rights reserved. Purely digital door-to-door service.
          </div>

          <div className="flex items-center gap-4 flex-wrap">
            <button onClick={() => setView('faq')} className="hover:text-slate-300 font-bold text-slate-300">
              FAQ
            </button>
            <span>•</span>
            <button onClick={() => setView('terms')} className="hover:text-slate-300">
              Terms of Service
            </button>
            <span>•</span>
            <button onClick={() => setView('track')} className="hover:text-slate-300">
              Order Tracker
            </button>
            <span>•</span>
            <button onClick={() => setView('admin')} className="hover:text-slate-300 font-semibold text-sky-400">
              ⚙️ Staff Admin
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
}
