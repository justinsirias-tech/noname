import React, { useState } from 'react';
import { Icon } from './Icons.jsx';
import { BANGKOK_DISTRICTS } from '../data/servicesData.js';
import { CountryPhoneInput } from './CountryPhoneInput.jsx';
import { GooglePlaceAutocompleteInput } from './GooglePlaceAutocompleteInput.jsx';
import { LocationPicker } from './LocationPicker.jsx';
import { laundryStore, getLineOaAddFriendUrl, getLineOaMessageUrl } from '../store.js';
import { useTranslation } from '../i18n.jsx';

export function CustomerRegister({ onRegisterSuccess, onNavigateToBook, onNavigateHome }) {
  const { language } = useTranslation();
  const isTh = language === 'th';

  // Form States - Personal Info (First & Last Name required)
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [nickName, setNickName] = useState('');
  const [gender, setGender] = useState('Rather not say');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [pinCode, setPinCode] = useState('123456');

  // Form States - Digital Contact
  const [mobileNumber, setMobileNumber] = useState('+66 ');
  const [isWhatsApp, setIsWhatsApp] = useState(true);
  const [secondaryMobile, setSecondaryMobile] = useState('');
  const [isSecondaryWhatsApp, setIsSecondaryWhatsApp] = useState(false);
  const [email, setEmail] = useState('');
  const [lineId, setLineId] = useState('');

  // Duplicate Mobile Real-Time Validation
  const [mobileError, setMobileError] = useState('');
  const [existingCustFound, setExistingCustFound] = useState(null);
  const [isCheckingMobile, setIsCheckingMobile] = useState(false);

  // Form States - Address Info
  const [condoName, setCondoName] = useState('');
  const [district, setDistrict] = useState(BANGKOK_DISTRICTS[0]);
  const [roomNumber, setRoomNumber] = useState('');
  const [googleMapsUrl, setGoogleMapsUrl] = useState('');
  const [leaveWithJuristic, setLeaveWithJuristic] = useState(true);

  // Form States - Company Tax Info
  const [requireTax, setRequireTax] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [taxId, setTaxId] = useState('');
  const [branch, setBranch] = useState('Head Office');
  const [companyAddress, setCompanyAddress] = useState('');

  // Terms Agreement
  const [agreedTerms, setAgreedTerms] = useState(false);

  // UI States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [registeredCustomer, setRegisteredCustomer] = useState(null);

  const lineOaId = laundryStore.settings?.lineOaId || '@nonamelaundry';

  // Automatically check for duplicate mobile number while filling up details
  React.useEffect(() => {
    const cleanDigits = (mobileNumber || '').replace(/\D/g, '');
    if (cleanDigits.length < 8) {
      setMobileError('');
      setExistingCustFound(null);
      return;
    }

    // 1. Instant check in client-side laundryStore
    const localMatch = laundryStore.findCustomerByPhone ? laundryStore.findCustomerByPhone(mobileNumber) : null;
    if (localMatch) {
      setMobileError(isTh ? 'เบอร์โทรศัพท์นี้ถูกลงทะเบียนในระบบแล้ว' : 'This mobile number is already registered in our system.');
      setExistingCustFound(localMatch);
      return;
    }

    // 2. Debounced API check against PostgreSQL database
    setIsCheckingMobile(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/customers/check-mobile?phone=${encodeURIComponent(mobileNumber)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.exists && data.customer) {
            setMobileError(isTh ? 'เบอร์โทรศัพท์นี้ถูกลงทะเบียนในระบบแล้ว' : 'This mobile number is already registered in our system.');
            setExistingCustFound(data.customer);
          } else {
            setMobileError('');
            setExistingCustFound(null);
          }
        }
      } catch (err) {
        console.warn('Mobile availability check error:', err);
      } finally {
        setIsCheckingMobile(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [mobileNumber, isTh]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    // Validation
    if (!firstName.trim()) {
      setErrorMessage(isTh ? 'กรุณากรอกชื่อจริง' : 'Please enter your First Name.');
      return;
    }
    if (!lastName.trim()) {
      setErrorMessage(isTh ? 'กรุณากรอกนามสกุล' : 'Please enter your Last Name.');
      return;
    }
    const cleanMobile = mobileNumber.replace(/[^0-9]/g, '');
    if (cleanMobile.length < 8) {
      setErrorMessage(isTh ? 'กรุณากรอกเบอร์โทรศัพท์ที่ถูกต้อง' : 'Please enter a valid primary mobile number.');
      return;
    }
    if (mobileError || existingCustFound) {
      setErrorMessage(
        isTh
          ? 'เบอร์โทรศัพท์นี้ถูกลงทะเบียนแล้ว กรุณาเข้าสู่ระบบหรือใช้เบอร์โทรศัพท์อื่น'
          : 'This mobile number is already registered. Please log in or use a different phone number.'
      );
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMessage(
        isTh
          ? 'กรุณาระบุอีเมลที่ถูกต้องสำหรับรับใบแจ้งหนี้และการแจ้งเตือนสถานะ'
          : 'Email address is required for sending invoices, booking confirmations, and delivery updates.'
      );
      return;
    }
    if (!condoName.trim()) {
      setErrorMessage(
        isTh
          ? 'กรุณาระบุชื่อคอนโดมิเนียมหรืออาคารที่พักอาศัย'
          : 'Please specify your condominium or residence building name.'
      );
      return;
    }
    if (!agreedTerms) {
      setErrorMessage(
        isTh
          ? 'กรุณายอมรับเงื่อนไขการให้บริการ'
          : 'Please accept the service terms and conditions.'
      );
      return;
    }
    if (requireTax && (!companyName.trim() || !taxId.trim())) {
      setErrorMessage(
        isTh
          ? 'กรุณากรอกชื่อบริษัทและเลขประจำตัวผู้เสียภาษีสำหรับออกใบกำกับภาษี'
          : 'Please provide Company Name and Tax ID for your Tax Invoice.'
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const combinedFullName = `${firstName.trim()} ${lastName.trim()}`;
      const customerPayload = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        fullName: combinedFullName,
        nickName: (nickName || firstName).trim(),
        gender,
        dateOfBirth,
        mobileNumber: mobileNumber.trim(),
        isWhatsApp: Boolean(isWhatsApp),
        secondaryMobile: secondaryMobile.trim(),
        isSecondaryWhatsApp: Boolean(isSecondaryWhatsApp),
        email: email.trim().toLowerCase(),
        lineId: lineId.trim(),
        pinCode: pinCode.trim() || '123456',
        tier: 'New',
        isVerified: false,
        addresses: [
          {
            id: 'ADDR-' + Math.floor(100 + Math.random() * 900),
            label: condoName.trim() || 'Home',
            address: `${condoName.trim()}, ${district}, Bangkok`,
            district,
            roomNumber: roomNumber.trim(),
            googleMapsUrl: googleMapsUrl.trim() || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(condoName.trim() + ' ' + district + ' Bangkok')}`,
            leaveWithJuristic: Boolean(leaveWithJuristic),
            isPrimary: true
          }
        ],
        companyTax: {
          required: Boolean(requireTax),
          companyName: companyName.trim(),
          taxId: taxId.trim(),
          branch: branch.trim(),
          companyAddress: companyAddress.trim() || `${condoName.trim()}, ${district}, Bangkok`
        }
      };

      // Save to laundryStore (which will also call /api/customers/register or /api/customers)
      const created = laundryStore.createCustomer(customerPayload);
      
      // Also invoke API endpoint directly for real-time backend persistence
      const registerRes = await fetch('/api/customers/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customerPayload)
      });

      if (!registerRes.ok && registerRes.status === 409) {
        const errData = await registerRes.json();
        setErrorMessage(errData.error || (isTh ? 'เบอร์โทรศัพท์นี้ถูกลงทะเบียนในระบบแล้ว' : 'This mobile number is already registered in our system.'));
        setIsSubmitting(false);
        return;
      }

      setRegisteredCustomer(created);
      if (onRegisterSuccess) {
        onRegisterSuccess(created);
      }
    } catch (err) {
      console.error('Registration failed:', err);
      setErrorMessage(isTh ? 'การลงทะเบียนไม่สำเร็จ กรุณาลองใหม่อีกครั้ง' : 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // SUCCESS SCREEN
  if (registeredCustomer) {
    const lineLink = getLineOaAddFriendUrl(lineOaId);

    return (
      <div className="max-w-2xl mx-auto px-4 py-16">
        <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-2xl border border-slate-100 text-center space-y-6 animate-fadeIn">
          
          <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
            <Icon name="check" className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <span className="text-xs uppercase font-extrabold text-emerald-600 tracking-wider bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              {isTh ? 'ลงทะเบียนสำเร็จ' : 'Registration Successful'}
            </span>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              {isTh
                ? `ยินดีต้อนรับสู่ NoName Laundry, คุณ ${registeredCustomer.nickName || registeredCustomer.fullName}!`
                : `Welcome to NoName Laundry, ${registeredCustomer.nickName || registeredCustomer.fullName}!`}
            </h1>
            <p className="text-sm text-slate-500 max-w-md mx-auto">
              {isTh
                ? 'โปรไฟล์สมาชิกซักอบรีดดิจิทัลของท่านได้รับการลงทะเบียนในระบบรับ-ส่งถึงคอนโดเรียบร้อยแล้ว'
                : 'Your digital laundry member profile has been registered in our door-to-door system.'}
            </p>
          </div>

          {/* Customer ID Card */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white rounded-2xl p-6 text-left shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <span className="text-8xl">🧺</span>
            </div>
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[11px] font-bold text-sky-400 uppercase tracking-widest">Customer ID</span>
                <div className="text-2xl font-black tracking-wider text-white mt-0.5">{registeredCustomer.id}</div>
              </div>
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-sky-500/20 text-sky-300 border border-sky-400/30">
                {registeredCustomer.tier} Member
              </span>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">{isTh ? 'ชื่อ-นามสกุล' : 'Full Name'}</span>
                <span className="font-bold text-slate-100">{registeredCustomer.fullName}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">{isTh ? 'เบอร์โทรศัพท์' : 'Mobile'}</span>
                <span className="font-bold text-slate-100">{registeredCustomer.mobileNumber}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">{isTh ? 'คอนโด / ที่พัก' : 'Condo / Residence'}</span>
                <span className="font-bold text-slate-100 truncate block">
                  {registeredCustomer.addresses?.[0]?.label || condoName}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">{isTh ? 'รหัส PIN' : 'PIN Code'}</span>
                <span className="font-bold text-slate-100 font-mono tracking-widest">{registeredCustomer.pinCode}</span>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="pt-2 space-y-3">
            <button
              onClick={() => {
                if (onNavigateToBook) onNavigateToBook(registeredCustomer);
              }}
              className="w-full py-4 px-6 bg-gradient-to-r from-sky-600 via-sky-500 to-teal-500 hover:from-sky-500 hover:to-teal-400 text-white font-extrabold rounded-2xl shadow-xl shadow-sky-600/30 hover:shadow-2xl transition transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2"
            >
              <span>{isTh ? 'จองรอบเข้ารับผ้าครั้งแรกทันที' : 'Book Your First Laundry Pickup Now'}</span>
              <Icon name="chevronRight" className="w-5 h-5" />
            </button>

            <a
              href={lineLink}
              target="_blank"
              rel="noreferrer"
              className="w-full py-3.5 px-6 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl shadow-md transition flex items-center justify-center gap-2"
            >
              <Icon name="line" className="w-5 h-5" />
              <span>{isTh ? `เชื่อมต่อ LINE Official (@${lineOaId.replace('@', '')})` : `Connect with LINE Official (@${lineOaId.replace('@', '')})`}</span>
            </a>

            <button
              onClick={() => {
                if (onNavigateHome) onNavigateHome();
              }}
              className="text-xs font-bold text-slate-400 hover:text-slate-600 transition"
            >
              {isTh ? 'กลับสู่หน้าแรก' : 'Back to Home'}
            </button>
          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      {/* Header Banner */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 border border-sky-200 text-xs font-bold text-sky-800 mb-3 shadow-sm">
          <span>{isTh ? '🧺 บริการซักอบรีดดิจิทัล รับ-ส่งถึงคอนโด' : '🧺 Door-to-Door Digital Laundry'}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          {isTh ? 'สมัครสมาชิกใหม่' : 'Customer Membership Registration'}
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          {isTh
            ? 'ลงทะเบียนเพียงครั้งเดียวเพื่อจองรับผ้าในคลิกเดียว ตรวจสอบน้ำหนักเครื่องชั่งดิจิทัล ออกใบแจ้งหนี้อัตโนมัติ และติดตามสถานะแบบเรียลไทม์'
            : 'Sign up once for 1-click condominium pickup, digital scale weight auditing, automated invoice generation, and real-time tracking updates.'}
        </p>
      </div>

      {/* Main Registration Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 sm:p-10 shadow-xl border border-slate-200/80 space-y-10">
        
        {/* Error Notification */}
        {errorMessage && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs font-bold flex items-center gap-3">
            <span className="text-lg">⚠️</span>
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Section 1: Profile & Identity */}
        <div>
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-6">
            <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-sm">
              1
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900">
                {isTh ? 'ข้อมูลส่วนตัว' : 'Personal Information'}
              </h2>
              <p className="text-xs text-slate-400">
                {isTh ? 'รายละเอียดโปรไฟล์พื้นฐานและรหัสเข้าใช้งาน' : 'Basic profile and authentication details'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {isTh ? 'ชื่อจริง' : 'First Name'} <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder={isTh ? 'เช่น กิตติพัฒน์' : 'e.g. Alex'}
                required
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {isTh ? 'นามสกุล' : 'Last Name'} <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder={isTh ? 'เช่น วงศ์สุวรรณ' : 'e.g. Thorne'}
                required
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {isTh ? 'ชื่อเล่น' : 'Nickname / Preferred Name'}
              </label>
              <input
                type="text"
                value={nickName}
                onChange={(e) => setNickName(e.target.value)}
                placeholder={isTh ? 'เช่น บอย' : 'e.g. Alex'}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {isTh ? 'เพศ' : 'Gender'}
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none bg-white transition"
              >
                <option value="Rather not say">{isTh ? 'ไม่ระบุ' : 'Rather not say'}</option>
                <option value="Male">{isTh ? 'ชาย' : 'Male'}</option>
                <option value="Female">{isTh ? 'หญิง' : 'Female'}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {isTh ? 'วันเกิด' : 'Date of Birth'}
              </label>
              <input
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {isTh ? 'รหัส PIN 6 หลัก' : 'Security PIN Code (6 Digits)'}
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  maxLength={6}
                  value={pinCode}
                  onChange={(e) => setPinCode(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="123456"
                  className="w-36 px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-mono tracking-widest text-center font-bold focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition"
                />
                <span className="text-[11px] text-slate-400">
                  {isTh ? 'ใช้สำหรับเข้าสู่ระบบและตรวจสอบบัญชีอย่างรวดเร็ว' : 'Used for account verification and quick login.'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Online Communications */}
        <div>
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-6">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm">
              2
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900">
                {isTh ? 'ช่องทางติดต่อออนไลน์' : 'Digital Communications'}
              </h2>
              <p className="text-xs text-slate-400">
                {isTh
                  ? 'ดูแลลูกค้าผ่านทางโทรศัพท์และ WhatsApp (+66 80 888 9885), LINE และอีเมล'
                  : 'Support via Phone & WhatsApp (+66 80 888 9885), LINE & Email'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                <span>{isTh ? 'เบอร์โทรศัพท์หลัก' : 'Primary Mobile Number'} <span className="text-rose-500">*</span></span>
                {isCheckingMobile && (
                  <span className="text-[10px] text-sky-600 font-semibold animate-pulse">
                    {isTh ? 'กำลังตรวจสอบเบอร์...' : 'Checking number...'}
                  </span>
                )}
              </label>
              <CountryPhoneInput
                value={mobileNumber}
                onChange={setMobileNumber}
                defaultCountryCode="TH"
                placeholder="e.g. 082 455 9182"
                required
              />

              {/* Automatic Duplicate Mobile Detection Alert */}
              {existingCustFound && (
                <div className="mt-2.5 p-3 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs animate-fadeIn">
                  <div className="flex items-center gap-1.5 font-bold text-amber-800">
                    <Icon name="alertCircle" className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>{isTh ? 'เบอร์โทรศัพท์นี้ถูกลงทะเบียนแล้ว' : 'Mobile Number Already Registered'}</span>
                  </div>
                  <p className="mt-1 text-[11px] text-amber-700 leading-relaxed">
                    {isTh ? (
                      <>เบอร์โทรศัพท์นี้ถูกลงทะเบียนภายใต้ชื่อ <strong>{existingCustFound.fullName || `${existingCustFound.firstName || ''} ${existingCustFound.lastName || ''}`.trim()}</strong> แล้ว</>
                    ) : (
                      <>This phone number is already registered under <strong>{existingCustFound.fullName || `${existingCustFound.firstName || ''} ${existingCustFound.lastName || ''}`.trim()}</strong>. Each mobile number can only be registered once.</>
                    )}
                  </p>
                  <div className="mt-2.5 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onNavigateToBook && onNavigateToBook(existingCustFound)}
                      className="px-3 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-[11px] transition shadow-xs"
                    >
                      {isTh ? 'จองด้วยโปรไฟล์นี้ →' : 'Book With This Profile →'}
                    </button>
                  </div>
                </div>
              )}

              <label className="mt-2.5 inline-flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isWhatsApp}
                  onChange={(e) => setIsWhatsApp(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
                />
                <span className="text-xs text-slate-600 font-medium flex items-center gap-1">
                  <Icon name="whatsapp" className="w-3.5 h-3.5 text-emerald-600" />
                  {isTh ? 'เบอร์นี้เชื่อมต่อกับ WhatsApp' : 'This number is registered on WhatsApp'}
                </span>
              </label>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {isTh ? 'อีเมล' : 'Email Address'} <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Icon name="mail" className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. alex.thorne@gmail.com"
                  required
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition"
                />
              </div>
              <p className="text-[11px] text-sky-700 font-semibold mt-1">
                {isTh
                  ? 'จำเป็นสำหรับส่งใบแจ้งหนี้ ยืนยันการจอง และอัปเดตสถานะจัดส่ง'
                  : 'Required for sending invoices, booking confirmations, and delivery updates.'}
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {isTh ? 'LINE ID (สำหรับรับแจ้งเตือน)' : 'LINE ID (Optional)'}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-emerald-600">
                  <Icon name="line" className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={lineId}
                  onChange={(e) => setLineId(e.target.value)}
                  placeholder="e.g. alex_bkk"
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                {isTh ? 'เราส่งการแจ้งเตือนสถานะคำสั่งซื้อไปยัง LINE ของท่าน' : 'We send order milestone updates directly to your LINE.'}
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {isTh ? 'เบอร์โทรศัพท์สำรอง / ต่างประเทศ' : 'Secondary / International Mobile'}
              </label>
              <input
                type="text"
                value={secondaryMobile}
                onChange={(e) => setSecondaryMobile(e.target.value)}
                placeholder="e.g. +1 (415) 890-1234"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition"
              />
              <label className="mt-2.5 inline-flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isSecondaryWhatsApp}
                  onChange={(e) => setIsSecondaryWhatsApp(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
                />
                <span className="text-xs text-slate-600 font-medium">
                  {isTh ? 'เบอร์สำรองเชื่อมต่อกับ WhatsApp' : 'Secondary number has WhatsApp'}
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Section 3: Condominium & Residence Address */}
        <div>
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-6">
            <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-sm">
              3
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900">
                {isTh ? 'คอนโดมิเนียม & ที่อยู่รับ-ส่งผ้า' : 'Condominium & Residence Address'}
              </h2>
              <p className="text-xs text-slate-400">
                {isTh ? 'บริการรับ-ส่งถึงล็อบบี้และนิติบุคคลคอนโด' : 'Door-to-door condominium collection & return'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                <span>{isTh ? 'ชื่อคอนโด / อาคารที่พัก' : 'Condominium / Building Name'} <span className="text-rose-500">*</span></span>
                <span className="text-[11px] text-sky-600 font-semibold flex items-center gap-1">
                  <span>{isTh ? 'ตรวจจับเขตและแผนที่อัตโนมัติ' : 'Auto-detects District & Google Map'}</span>
                </span>
              </label>
              <GooglePlaceAutocompleteInput
                value={condoName}
                onChange={(e) => setCondoName(e.target.value)}
                onPlaceSelect={(place) => {
                  setCondoName(place.condoName);
                  if (place.district) {
                    setDistrict(place.district);
                  }
                  if (place.googleMapsUrl) {
                    setGoogleMapsUrl(place.googleMapsUrl);
                  }
                }}
                placeholder={isTh ? 'พิมพ์ชื่อคอนโด (เช่น The Estelle, Ashton Silom, Rhythm Ekkamai)' : 'Type condo name (e.g. The Estelle, Ashton Silom, Rhythm Ekkamai)'}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {isTh ? 'เขตในกรุงเทพฯ' : 'Bangkok District'} <span className="text-rose-500">*</span>
              </label>
              <select
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none bg-white transition"
              >
                {BANGKOK_DISTRICTS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {isTh ? 'ตึก / ชั้น / เลขห้อง' : 'Tower / Floor / Room Number'}
              </label>
              <input
                type="text"
                value={roomNumber}
                onChange={(e) => setRoomNumber(e.target.value)}
                placeholder={isTh ? 'เช่น Tower A, ชั้น 18, ห้อง 1804' : 'e.g. Tower A, Fl 18, Room 1804'}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition"
              />
            </div>

            <div className="sm:col-span-2">
              <LocationPicker
                value={googleMapsUrl}
                onChange={(url) => setGoogleMapsUrl(url)}
                onLocationSelect={({ lat, lng, googleMapsUrl: newUrl, district: detectedDistrict, condoName: detectedCondo }) => {
                  setGoogleMapsUrl(newUrl);
                  if (detectedDistrict) {
                    setDistrict(detectedDistrict);
                  }
                  if (detectedCondo && (!condoName || condoName.trim() === '')) {
                    setCondoName(detectedCondo);
                  }
                }}
                initialDistrict={district}
                label={isTh ? 'ปักหมุดตำแหน่งคอนโดบน Google Maps หรือแชร์พิกัด GPS' : 'Google Maps Location & Condo Pin'}
              />
            </div>

            {/* Condo Juristic Protocol Banner */}
            <div className="sm:col-span-2 p-4 bg-sky-50/70 border border-sky-100 rounded-2xl">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={leaveWithJuristic}
                  onChange={(e) => setLeaveWithJuristic(e.target.checked)}
                  className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500 border-slate-300 mt-0.5"
                />
                <div>
                  <span className="text-xs font-bold text-sky-900 block">
                    {isTh
                      ? 'อนุญาตให้ฝากรับ-ส่งผ้าที่นิติบุคคล / ล็อบบี้คอนโด'
                      : 'Condominium Juristic Office / Front Desk Drop-off Authorized'}
                  </span>
                  <span className="text-[11px] text-sky-700/80 leading-relaxed block mt-0.5">
                    {isTh
                      ? 'แนะนำสำหรับผู้พักอาศัยคอนโด พนักงานขับรถสามารถรับและส่งคืนถุงผ้าที่เคาน์เตอร์นิติบุคคลได้โดยไม่ต้องรอรับด้วยตนเอง'
                      : "Recommended for condo residents & busy professionals. Driver collects and delivers directly to your building's juristic/mail counter without requiring you to wait at home."}
                  </span>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Section 4: Corporate Tax Invoice (Optional) */}
        <div>
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-sm">
                4
              </div>
              <div>
                <h2 className="text-base font-extrabold text-slate-900">
                  {isTh ? 'ใบกำกับภาษีในนามบริษัท (ไม่บังคับ)' : 'Company Tax Invoice (Optional)'}
                </h2>
                <p className="text-xs text-slate-400">
                  {isTh ? 'ขอใบกำกับภาษีเต็มรูปแบบในนามนิติบุคคล' : 'Request official tax invoice in your company name'}
                </p>
              </div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
              <input
                type="checkbox"
                checked={requireTax}
                onChange={(e) => setRequireTax(e.target.checked)}
                className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 border-slate-300"
              />
              <span className="text-xs font-bold text-slate-700">{isTh ? 'ต้องการใบกำกับภาษี' : 'Need Tax Invoice'}</span>
            </label>
          </div>

          {requireTax && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 p-5 bg-amber-50/50 rounded-2xl border border-amber-100 animate-fadeIn">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {isTh ? 'ชื่อบริษัท / นิติบุคคล' : 'Company Name'} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. Acme Innovations (Thailand) Co., Ltd."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none bg-white transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {isTh ? 'เลขประจำตัวผู้เสียภาษี 13 หลัก' : 'Tax ID (13 Digits)'} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  maxLength={13}
                  value={taxId}
                  onChange={(e) => setTaxId(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="e.g. 0105562019284"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-mono focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none bg-white transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {isTh ? 'สาขา' : 'Branch'}
                </label>
                <input
                  type="text"
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  placeholder={isTh ? 'สำนักงานใหญ่' : 'Head Office'}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none bg-white transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {isTh ? 'ที่อยู่จดทะเบียนบริษัท' : 'Company Registered Address'}
                </label>
                <input
                  type="text"
                  value={companyAddress}
                  onChange={(e) => setCompanyAddress(e.target.value)}
                  placeholder={isTh ? 'อาคาร ถนน แขวง เขต กรุงเทพฯ' : 'Building, Road, Sub-district, District, Bangkok'}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none bg-white transition"
                />
              </div>
            </div>
          )}
        </div>

        {/* Section 5: Terms Agreement & Submission */}
        <div className="pt-2 border-t border-slate-100 space-y-6">
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={agreedTerms}
                onChange={(e) => setAgreedTerms(e.target.checked)}
                required
                className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500 border-slate-300 mt-0.5"
              />
              <span className="text-xs text-slate-700 leading-relaxed font-medium">
                {isTh ? (
                  <>
                    ข้าพเจ้ายอมรับ <strong>ข้อกำหนดและเงื่อนไขการให้บริการ</strong> และรับทราบว่า NoName Laundry ให้บริการดูแลลูกค้าและประสานงานคนขับผ่านทาง{' '}
                    <strong>โทรศัพท์ (+66 80 888 9885), WhatsApp, LINE และอีเมล</strong>
                  </>
                ) : (
                  <>
                    I agree to the <strong>Terms & Conditions</strong> and acknowledge that NoName Laundry provides customer support and driver coordination via{' '}
                    <strong>Phone (+66 80 888 9885), WhatsApp, LINE, and Email</strong>.
                  </>
                )}
              </span>
            </label>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !agreedTerms || Boolean(existingCustFound) || Boolean(mobileError)}
            className={`w-full py-4 px-6 text-white font-extrabold rounded-2xl shadow-xl transition transform active:scale-[0.99] flex items-center justify-center gap-2 ${
              isSubmitting || !agreedTerms || Boolean(existingCustFound) || Boolean(mobileError)
                ? 'bg-slate-300 cursor-not-allowed shadow-none'
                : 'bg-gradient-to-r from-sky-600 via-sky-500 to-teal-500 hover:from-sky-500 hover:to-teal-400 shadow-sky-600/25 hover:shadow-2xl'
            }`}
          >
            {isSubmitting ? (
              <span className="inline-flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>{isTh ? 'กำลังลงทะเบียนโปรไฟล์สมาชิก...' : 'Registering Member Profile...'}</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-2 text-base">
                <span>{isTh ? 'ยืนยันการสมัครสมาชิก' : 'Complete Customer Registration'}</span>
                <Icon name="chevronRight" className="w-5 h-5" />
              </span>
            )}
          </button>
        </div>

      </form>
    </div>
  );
}
