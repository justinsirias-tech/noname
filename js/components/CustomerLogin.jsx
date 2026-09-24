import React, { useState } from 'react';
import { Icon } from './Icons.jsx';
import { laundryStore, CONTACT_CHANNELS } from '../store.js';

export function CustomerLogin({ onLoginSuccess, onNavigateToRegister, onNavigateHome }) {
  const [identifier, setIdentifier] = useState('');
  const [pinCode, setPinCode] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!identifier.trim()) {
      setErrorMessage('กรุณากรอกเบอร์โทรศัพท์ อีเมล หรือรหัสลูกค้า (Customer ID)');
      return;
    }
    if (!pinCode.trim() || pinCode.trim().length < 4) {
      setErrorMessage('กรุณากรอกรหัส PIN 6 หลัก');
      return;
    }

    setIsLoading(true);
    try {
      const data = await laundryStore.loginCustomer(identifier.trim(), pinCode.trim());
      if (onLoginSuccess) {
        onLoginSuccess(data.customer || data);
      }
    } catch (err) {
      setErrorMessage(err.message || 'เข้าสู่ระบบไม่สำเร็จ กรุณาตรวจสอบข้อมูล');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFillDemo = (demoPhone, demoPin) => {
    setIdentifier(demoPhone);
    setPinCode(demoPin);
    setErrorMessage('');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50/50">
      <div className="max-w-md w-full space-y-6">
        
        {/* Top Header */}
        <div className="text-center space-y-2">
          <div 
            onClick={onNavigateHome}
            className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-600 via-sky-500 to-teal-400 text-white shadow-lg shadow-sky-500/25 cursor-pointer transform hover:scale-105 transition mb-2"
          >
            <span className="text-2xl">🧺</span>
          </div>
          <span className="text-xs font-extrabold uppercase tracking-widest text-sky-600 bg-sky-50 border border-sky-100 px-3 py-1 rounded-full inline-block">
            Customer Member Portal
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            เข้าสู่ระบบลูกค้า (Customer Login)
          </h2>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            เข้าถึงข้อมูลสมาชิก ที่อยู่คอนโด ประวัติการส่งซักผ้า และจองรอบรับผ้าได้ทันที
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200/80 space-y-5">
          
          {/* Error Message Alert */}
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5 animate-fadeIn">
              <span className="text-base shrink-0">⚠️</span>
              <div className="font-semibold leading-relaxed">{errorMessage}</div>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            
            {/* Identifier Input */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                เบอร์โทรศัพท์ / Customer ID / อีเมล <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="เช่น 082-455-9182 หรือ CUST-8491"
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition"
                />
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* PIN Code Input */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  รหัส PIN 6 หลัก (Security PIN) <span className="text-rose-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="text-[11px] font-semibold text-sky-600 hover:text-sky-700 underline"
                >
                  {showPin ? 'ซ่อนรหัส' : 'แสดงรหัส'}
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPin ? 'text' : 'password'}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  value={pinCode}
                  onChange={(e) => setPinCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="•••••• (รหัส 6 หลัก)"
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 text-base font-mono tracking-widest focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition"
                />
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-sky-600 via-sky-500 to-teal-500 hover:from-sky-500 hover:to-teal-400 text-white font-extrabold rounded-xl shadow-lg shadow-sky-600/25 active:scale-[0.99] transition flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin w-4 h-4 text-white" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>กำลังตรวจสอบข้อมูล...</span>
                </>
              ) : (
                <>
                  <span>เข้าสู่ระบบ (Sign In)</span>
                  <Icon name="chevronRight" className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Test Accounts Box */}
          <div className="pt-2 border-t border-slate-100 space-y-2">
            <span className="block text-[11px] font-bold text-slate-500 text-center">
              🧪 บัญชีทดสอบด่วน (Click to Auto-fill Demo):
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => handleFillDemo('+66 82 455 9182', '123456')}
                className="p-2 rounded-xl bg-slate-50 hover:bg-sky-50 border border-slate-200 text-left transition group"
              >
                <div className="text-[11px] font-bold text-slate-800 group-hover:text-sky-700 flex items-center justify-between">
                  <span>Alex (VIP)</span>
                  <span className="text-[9px] bg-amber-100 text-amber-800 px-1 rounded font-bold">VIP</span>
                </div>
                <div className="text-[10px] text-slate-500">PIN: 123456</div>
              </button>

              <button
                type="button"
                onClick={() => handleFillDemo('+66 89 712 3456', '654321')}
                className="p-2 rounded-xl bg-slate-50 hover:bg-sky-50 border border-slate-200 text-left transition group"
              >
                <div className="text-[11px] font-bold text-slate-800 group-hover:text-sky-700 flex items-center justify-between">
                  <span>Khun Som</span>
                  <span className="text-[9px] bg-yellow-100 text-yellow-800 px-1 rounded font-bold">Gold</span>
                </div>
                <div className="text-[10px] text-slate-500">PIN: 654321</div>
              </button>
            </div>
          </div>

          {/* Footer Action Links */}
          <div className="pt-2 text-center space-y-2 text-xs">
            <p className="text-slate-600">
              ยังไม่มีบัญชีสมาชิก?{' '}
              <button
                type="button"
                onClick={onNavigateToRegister}
                className="font-bold text-sky-600 hover:text-sky-700 underline"
              >
                สมัครสมาชิกใหม่ (Register)
              </button>
            </p>
            <p className="text-[11px] text-slate-500">
              ลืมรหัส PIN?{' '}
              <a
                href={CONTACT_CHANNELS.line.url}
                target="_blank"
                rel="noreferrer"
                className="text-emerald-600 hover:underline font-semibold"
              >
                แจ้งรีเซ็ตรหัสผ่าน LINE: @nonamelaundry
              </a>
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}
