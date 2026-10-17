import React, { useState, useEffect } from 'react';
import { Icon } from './Icons.jsx';
import { laundryStore, getLineOaMessageUrl, CONTACT_CHANNELS } from '../store.js';
import { getTrackingStage } from '../data/servicesData.js';
import { LocationPicker } from './LocationPicker.jsx';
import { useTranslation } from '../i18n.jsx';

export function CustomerPortal({
  customer,
  orders = [],
  onNavigateToBook,
  onNavigateToTrack,
  onLogout,
  onNavigateHome
}) {
  const { language } = useTranslation();
  const isTh = language === 'th';

  const [activeTab, setActiveTab] = useState('orders'); // 'orders', 'address', 'security'
  const [customerOrders, setCustomerOrders] = useState([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);

  // Editable Profile States
  const [nickName, setNickName] = useState(customer?.nickName || '');
  const [secondaryMobile, setSecondaryMobile] = useState(customer?.secondaryMobile || '');
  const [lineId, setLineId] = useState(customer?.lineId || '');
  
  // Address States
  const primaryAddr = customer?.addresses?.[0] || {};
  const [condoName, setCondoName] = useState(primaryAddr.label || primaryAddr.address || '');
  const [district, setDistrict] = useState(primaryAddr.district || 'Watthana (Thonglor, Ekkamai, Phrom Phong)');
  const [roomNumber, setRoomNumber] = useState(primaryAddr.roomNumber || '');
  const [googleMapsUrl, setGoogleMapsUrl] = useState(primaryAddr.googleMapsUrl || '');
  const [leaveWithJuristic, setLeaveWithJuristic] = useState(primaryAddr.leaveWithJuristic !== undefined ? primaryAddr.leaveWithJuristic : true);
  
  // PIN Change States
  const [currentPinInput, setCurrentPinInput] = useState('');
  const [newPinInput, setNewPinInput] = useState('');
  const [confirmPinInput, setConfirmPinInput] = useState('');
  const [pinSuccessMsg, setPinSuccessMsg] = useState('');
  const [pinErrorMsg, setPinErrorMsg] = useState('');
  
  // General feedback
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [copiedId, setCopiedId] = useState(false);

  // Fetch or filter orders for this customer
  useEffect(() => {
    if (!customer?.id) return;
    setIsLoadingOrders(true);

    const token = laundryStore.getCustomerToken();
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

    fetch(`/api/customers/${encodeURIComponent(customer.id)}/orders`, { headers })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setCustomerOrders(data);
        } else {
          // fallback to local store orders
          filterLocalOrders();
        }
      })
      .catch(() => {
        filterLocalOrders();
      })
      .finally(() => {
        setIsLoadingOrders(false);
      });

    function filterLocalOrders() {
      const allOrders = laundryStore.orders || [];
      const filtered = allOrders.filter(o => 
        o.customerId === customer.id ||
        (o.customerName && o.customerName.toLowerCase() === (customer.fullName || '').toLowerCase()) ||
        o.contactValue === customer.mobileNumber
      );
      setCustomerOrders(filtered);
    }
  }, [customer]);

  const handleCopyId = () => {
    if (customer?.id) {
      navigator.clipboard?.writeText(customer.id);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  // Save updated address
  const handleSaveAddress = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccessMsg('');

    try {
      const updatedAddresses = [
        {
          id: primaryAddr.id || ('ADDR-' + Math.floor(100 + Math.random() * 900)),
          label: condoName.trim() || 'Home',
          address: `${condoName.trim()}, ${district}, Bangkok`,
          district: district,
          roomNumber: roomNumber.trim(),
          googleMapsUrl: googleMapsUrl.trim(),
          leaveWithJuristic: Boolean(leaveWithJuristic),
          isPrimary: true
        }
      ];

      laundryStore.updateCustomer(customer.id, {
        nickName: nickName.trim(),
        secondaryMobile: secondaryMobile.trim(),
        lineId: lineId.trim(),
        addresses: updatedAddresses
      });

      const token = laundryStore.getCustomerToken();
      if (token) {
        fetch('/api/external/profile', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            nickName: nickName.trim(),
            secondaryPhone: secondaryMobile.trim()
          })
        }).catch(err => console.warn('TLS profile sync notice:', err));
      }

      setSaveSuccessMsg(isTh ? 'บันทึกข้อมูลที่อยู่และโปรไฟล์เรียบร้อยแล้ว!' : 'Address and profile updated successfully!');
      setTimeout(() => setSaveSuccessMsg(''), 4000);
    } catch (err) {
      alert((isTh ? 'บันทึกข้อมูลไม่สำเร็จ: ' : 'Failed to save changes: ') + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Change PIN Code
  const handleChangePin = (e) => {
    e.preventDefault();
    setPinErrorMsg('');
    setPinSuccessMsg('');

    if (currentPinInput !== customer.pinCode) {
      setPinErrorMsg(isTh ? 'รหัส PIN ปัจจุบันไม่ถูกต้อง' : 'Current PIN is incorrect.');
      return;
    }
    if (!/^\d{6}$/.test(newPinInput)) {
      setPinErrorMsg(isTh ? 'รหัส PIN ใหม่ต้องเป็นตัวเลข 6 หลักเท่านั้น' : 'New PIN must be a 6-digit number.');
      return;
    }
    if (newPinInput !== confirmPinInput) {
      setPinErrorMsg(isTh ? 'รหัส PIN ใหม่และยืนยันรหัส PIN ไม่ตรงกัน' : 'New PIN and confirmation do not match.');
      return;
    }

    try {
      laundryStore.updateCustomer(customer.id, { pinCode: newPinInput });
      customer.pinCode = newPinInput;
      setPinSuccessMsg(isTh ? 'เปลี่ยนรหัส PIN 6 หลักสำเร็จแล้ว! โปรดจำรหัสใหม่สำหรับการเข้าสู่ระบบครั้งถัดไป' : 'Your 6-digit PIN has been updated! Please use your new PIN on your next login.');
      setCurrentPinInput('');
      setNewPinInput('');
      setConfirmPinInput('');
      setTimeout(() => setPinSuccessMsg(''), 5000);
    } catch (err) {
      setPinErrorMsg((isTh ? 'เกิดข้อผิดพลาดในการเปลี่ยนรหัส PIN: ' : 'Failed to update PIN: ') + err.message);
    }
  };

  const getStatusBadge = (status) => {
    const stage = getTrackingStage(status);
    if (stage.key === 'delivered') {
      return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">{isTh ? '✅ ส่งคืนแล้ว (Delivered)' : '✅ Delivered'}</span>;
    }
    if (stage.key === 'in_process') {
      return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300">{isTh ? '⚙️ กำลังดำเนินการ (In Process)' : '⚙️ In Process'}</span>;
    }
    return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-sky-100 text-sky-800 border border-sky-300">{isTh ? '📅 นัดหมายแล้ว (Scheduled)' : '📅 Scheduled'}</span>;
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      
      {/* Digital Member Hero Card */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 text-white rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden border border-slate-800">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <span className="text-9xl">🧺</span>
        </div>

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-md">
                <span>⭐</span>
                <span>{customer.tier || 'Member'}</span>
              </span>

              <button
                type="button"
                onClick={handleCopyId}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-slate-800/80 border border-slate-700 text-slate-200 hover:bg-slate-700 transition"
                title={isTh ? 'คัดลอก Customer ID' : 'Copy Customer ID'}
              >
                <span>ID: {customer.id}</span>
                <span>{copiedId ? (isTh ? '✓ คัดลอกแล้ว' : '✓ Copied') : '📋'}</span>
              </button>
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2">
                <span>{customer.fullName}</span>
                {customer.nickName && (
                  <span className="text-sky-400 text-lg font-bold">({customer.nickName})</span>
                )}
              </h1>
              <p className="text-xs text-slate-400 mt-1 flex flex-wrap items-center gap-3">
                <span>📞 {customer.mobileNumber}</span>
                <span>•</span>
                <span>🏢 {primaryAddr.label || primaryAddr.address || 'Bangkok Residence'}</span>
              </p>
            </div>
          </div>

          {/* Quick Action CTAs */}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <button
              type="button"
              onClick={() => onNavigateToBook(customer)}
              className="flex-1 md:flex-none py-3.5 px-6 rounded-2xl bg-gradient-to-r from-sky-500 to-teal-400 hover:from-sky-400 hover:to-teal-300 text-slate-950 font-black text-sm shadow-xl shadow-sky-500/20 active:scale-[0.99] transition flex items-center justify-center gap-2"
            >
              <span>{isTh ? '🧺 จองส่งซักผ้าใหม่' : '🧺 Book New Order'}</span>
              <Icon name="chevronRight" className="w-4 h-4 text-slate-950" />
            </button>

            <button
              type="button"
              onClick={onLogout}
              className="py-3 px-4 rounded-2xl bg-slate-800/80 hover:bg-rose-950/40 border border-slate-700 hover:border-rose-800 text-slate-300 hover:text-rose-300 text-xs font-bold transition flex items-center gap-1.5"
            >
              <span>{isTh ? '🚪 ออกจากระบบ' : '🚪 Sign Out'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-px">
        <button
          type="button"
          onClick={() => setActiveTab('orders')}
          className={`py-3 px-5 font-bold text-sm rounded-t-2xl transition border-b-2 flex items-center gap-2 ${
            activeTab === 'orders'
              ? 'border-sky-600 text-sky-600 bg-sky-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <span>📦</span>
          <span>{isTh ? `รายการคำสั่งซื้อ (${customerOrders.length})` : `My Orders (${customerOrders.length})`}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('address')}
          className={`py-3 px-5 font-bold text-sm rounded-t-2xl transition border-b-2 flex items-center gap-2 ${
            activeTab === 'address'
              ? 'border-sky-600 text-sky-600 bg-sky-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <span>🏢</span>
          <span>{isTh ? 'ที่อยู่คอนโด & หมุด Google Maps' : 'Condo Address & Google Maps Pin'}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('security')}
          className={`py-3 px-5 font-bold text-sm rounded-t-2xl transition border-b-2 flex items-center gap-2 ${
            activeTab === 'security'
              ? 'border-sky-600 text-sky-600 bg-sky-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <span>🔒</span>
          <span>{isTh ? 'ความปลอดภัย & รหัส PIN' : 'Security & PIN Code'}</span>
        </button>
      </div>

      {/* TAB 1: ORDERS & TRACKING */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold text-slate-900">
              {isTh ? 'ประวัติการส่งซักและติดตามสถานะผ้า' : 'Order History & Live Status'}
            </h2>
            <button
              type="button"
              onClick={() => onNavigateToBook(customer)}
              className="text-xs font-bold text-sky-600 hover:text-sky-700 underline"
            >
              {isTh ? '+ สั่งซักผ้าออเดอร์ใหม่' : '+ Book New Order'}
            </button>
          </div>

          {isLoadingOrders ? (
            <div className="p-12 text-center text-slate-400 bg-white rounded-3xl border border-slate-200">
              <svg className="animate-spin w-6 h-6 text-sky-600 mx-auto mb-2" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>{isTh ? 'กำลังดึงข้อมูลคำสั่งซื้อ...' : 'Loading your orders...'}</span>
            </div>
          ) : customerOrders.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-4 shadow-sm">
              <div className="w-16 h-16 rounded-full bg-sky-50 text-sky-600 text-3xl flex items-center justify-center mx-auto">
                🧺
              </div>
              <div className="space-y-1">
                <h3 className="font-extrabold text-slate-800 text-base">
                  {isTh ? 'ยังไม่มีประวัติการส่งซักผ้า' : 'No Laundry Orders Yet'}
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  {isTh
                    ? 'เริ่มต้นส่งซักรอบแรกกับ NoName Laundry เรามีบริการรับ-ส่งถึงล็อบบี้คอนโดทั่วกรุงเทพฯ และพัทยา'
                    : 'Schedule your first laundry pickup with NoName Laundry. We offer door-to-door condo & juristic collection across Bangkok & Pattaya.'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onNavigateToBook(customer)}
                className="py-3 px-6 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-md shadow-sky-600/20 transition"
              >
                {isTh ? 'จองรอบเข้ารับผ้าตอนนี้' : 'Schedule Pickup Now'}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {customerOrders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200/90 hover:border-sky-300 transition space-y-4"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-slate-900 font-mono tracking-tight">
                          {order.id}
                        </span>
                        <span className="text-[10px] font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md border border-sky-100">
                          {order.serviceName || 'Wash & Fold'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {isTh ? 'สร้างเมื่อ: ' : 'Created: '}
                        {new Date(order.createdAt).toLocaleDateString(isTh ? 'th-TH' : 'en-GB', { dateStyle: 'medium' })}
                      </p>
                    </div>

                    <div>
                      {getStatusBadge(order.status)}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 p-3 rounded-2xl bg-slate-50 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px]">{isTh ? 'วันรับผ้า (Pickup)' : 'Pickup Date'}</span>
                      <span className="font-bold text-slate-800">{order.pickupDate}</span>
                      <span className="text-[10px] text-slate-500 block truncate">{order.pickupTime}</span>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[10px]">{isTh ? 'ยอดชำระเงิน' : 'Total Amount'}</span>
                      <span className="font-black text-emerald-700 text-sm">
                        ฿{order.totalPrice || order.estimatedPrice || '350'}
                      </span>
                      <span className="text-[10px] text-slate-500 block">
                        {order.paymentStatus === 'PAID'
                          ? (isTh ? '✅ ชำระแล้ว' : '✅ Paid')
                          : (isTh ? '⏳ รอชำระเงิน' : '⏳ Pending Payment')}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-slate-500 truncate max-w-[200px]">
                      📍 {order.condoName} {order.roomNumber ? `(${order.roomNumber})` : ''}
                    </span>

                    <a
                      href={CONTACT_CHANNELS.line.url}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200 transition flex items-center gap-1.5 shadow-2xs"
                      title={isTh ? 'สอบถามสถานะออเดอร์กับฝ่ายบริการลูกค้าทาง LINE' : 'Contact support on LINE regarding this order'}
                    >
                      <Icon name="line" className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{isTh ? 'สอบถามสถานะ (LINE)' : 'Inquire via LINE'}</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: ADDRESS & GOOGLE MAPS */}
      {activeTab === 'address' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/90 space-y-6">
          <div>
            <h2 className="text-base font-extrabold text-slate-900">
              {isTh ? 'ข้อมูลที่อยู่คอนโด & หมุด Google Maps' : 'Condo Address & Google Maps Pin'}
            </h2>
            <p className="text-xs text-slate-500">
              {isTh
                ? 'พนักงานขับรถจะไปรับ-ส่งผ้าตามพิกัดและข้อมูลที่ท่านระบุไว้'
                : 'Our couriers collect and deliver your laundry according to the saved building and GPS coordinates below.'}
            </p>
          </div>

          {saveSuccessMsg && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold animate-fadeIn">
              ✓ {saveSuccessMsg}
            </div>
          )}

          <form onSubmit={handleSaveAddress} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {isTh ? 'ชื่อคอนโด / อาคารที่พัก' : 'Condominium / Residence Building Name'} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={condoName}
                  onChange={(e) => setCondoName(e.target.value)}
                  placeholder={isTh ? 'เช่น The Estelle Phrom Phong, Ashton Silom' : 'e.g. The Estelle Phrom Phong, Ashton Silom'}
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-sky-500 outline-none transition"
                />
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
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-sky-500 outline-none transition"
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
                  placeholder={isTh ? 'เช่น Som, Alex, Nok' : 'e.g. Alex, Som, Nok'}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-sky-500 outline-none transition"
                />
              </div>
            </div>

            {/* Google Maps Location Picker */}
            <div className="pt-2">
              <LocationPicker
                value={googleMapsUrl}
                onChange={(url) => setGoogleMapsUrl(url)}
                onLocationSelect={({ googleMapsUrl: newUrl, district: detectedDistrict }) => {
                  setGoogleMapsUrl(newUrl);
                  if (detectedDistrict) setDistrict(detectedDistrict);
                }}
                initialDistrict={district}
                label={isTh ? 'ปักหมุดตำแหน่งคอนโดบน Google Maps หรือแชร์พิกัด GPS' : 'Pin Condo Location on Google Maps or Share GPS'}
              />
            </div>

            {/* Condo Juristic Dropoff Authorization */}
            <div className="p-4 bg-sky-50/70 border border-sky-100 rounded-2xl">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={leaveWithJuristic}
                  onChange={(e) => setLeaveWithJuristic(e.target.checked)}
                  className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500 border-slate-300 mt-0.5"
                />
                <div>
                  <span className="text-xs font-bold text-sky-950 block">
                    {isTh
                      ? 'อนุญาตให้รับ-ส่งผ้าที่นิติบุคคล / ล็อบบี้คอนโด'
                      : 'Authorize Condominium Juristic / Front Lobby Drop-off & Pickup'}
                  </span>
                  <span className="text-[11px] text-slate-600 block mt-0.5">
                    {isTh
                      ? 'คนขับสามารถฝากหรือรับถุงผ้าที่เคาน์เตอร์นิติบุคคลได้โดยไม่ต้องรบกวนเวลาส่วนตัวของท่าน'
                      : 'Our driver can collect and return your laundry bag directly at the juristic office or front desk without disturbing your schedule.'}
                  </span>
                </div>
              </label>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isSaving}
                className="py-3 px-6 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-md shadow-sky-600/25 transition active:scale-[0.99] disabled:opacity-60"
              >
                {isSaving
                  ? (isTh ? 'กำลังบันทึก...' : 'Saving...')
                  : (isTh ? '✓ บันทึกการเปลี่ยนแปลงที่อยู่' : '✓ Save Address Changes')}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 3: SECURITY & PIN MANAGEMENT */}
      {activeTab === 'security' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/90 space-y-6">
          <div>
            <h2 className="text-base font-extrabold text-slate-900">
              {isTh ? 'ความปลอดภัย & เปลี่ยนรหัส PIN 6 หลัก' : 'Security & Change 6-Digit PIN'}
            </h2>
            <p className="text-xs text-slate-500">
              {isTh
                ? 'รหัส PIN ใช้สำหรับเข้าสู่ระบบของท่านอย่างรวดเร็วและปลอดภัย'
                : 'Your 6-digit PIN is used for fast and secure access to your member account.'}
            </p>
          </div>

          {pinSuccessMsg && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold animate-fadeIn">
              ✓ {pinSuccessMsg}
            </div>
          )}

          {pinErrorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs font-bold animate-fadeIn">
              ⚠️ {pinErrorMsg}
            </div>
          )}

          <form onSubmit={handleChangePin} className="max-w-md space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {isTh ? 'รหัส PIN ปัจจุบัน' : 'Current 6-Digit PIN'} <span className="text-rose-500">*</span>
              </label>
              <input
                type="password"
                inputMode="numeric"
                maxLength={6}
                value={currentPinInput}
                onChange={(e) => setCurrentPinInput(e.target.value.replace(/\D/g, ''))}
                placeholder="••••••"
                required
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 font-mono tracking-widest text-sm focus:ring-2 focus:ring-sky-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {isTh ? 'รหัส PIN ใหม่ 6 หลัก' : 'New 6-Digit PIN'} <span className="text-rose-500">*</span>
              </label>
              <input
                type="password"
                inputMode="numeric"
                maxLength={6}
                value={newPinInput}
                onChange={(e) => setNewPinInput(e.target.value.replace(/\D/g, ''))}
                placeholder="••••••"
                required
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 font-mono tracking-widest text-sm focus:ring-2 focus:ring-sky-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {isTh ? 'ยืนยันรหัส PIN ใหม่' : 'Confirm New 6-Digit PIN'} <span className="text-rose-500">*</span>
              </label>
              <input
                type="password"
                inputMode="numeric"
                maxLength={6}
                value={confirmPinInput}
                onChange={(e) => setConfirmPinInput(e.target.value.replace(/\D/g, ''))}
                placeholder="••••••"
                required
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 font-mono tracking-widest text-sm focus:ring-2 focus:ring-sky-500 outline-none"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="py-3 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition"
              >
                {isTh ? 'บันทึกรหัส PIN ใหม่' : 'Update PIN Code'}
              </button>
            </div>
          </form>

          {/* Support notice */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600 flex items-start gap-2.5">
            <span className="text-base">💡</span>
            <div>
              <span className="font-bold text-slate-800 block">
                {isTh ? 'ต้องการความช่วยเหลือหรือเปลี่ยนเบอร์โทรศัพท์?' : 'Need assistance or want to update your primary phone number?'}
              </span>
              <span>
                {isTh ? (
                  <>
                    สามารถติดต่อเจ้าหน้าที่ฝ่ายบริการลูกค้าได้ผ่านทาง LINE Official:{' '}
                    <a href={CONTACT_CHANNELS.line.url} target="_blank" rel="noreferrer" className="text-emerald-600 font-bold underline">
                      @nonamelaundry
                    </a>{' '}
                    หรือ WhatsApp (+66 80 888 9885)
                  </>
                ) : (
                  <>
                    Contact our customer support team anytime via LINE Official:{' '}
                    <a href={CONTACT_CHANNELS.line.url} target="_blank" rel="noreferrer" className="text-emerald-600 font-bold underline">
                      @nonamelaundry
                    </a>{' '}
                    or WhatsApp (+66 80 888 9885).
                  </>
                )}
              </span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
