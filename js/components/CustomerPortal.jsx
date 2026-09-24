import React, { useState, useEffect } from 'react';
import { Icon } from './Icons.jsx';
import { laundryStore, getLineOaMessageUrl, CONTACT_CHANNELS } from '../store.js';
import { LocationPicker } from './LocationPicker.jsx';

export function CustomerPortal({
  customer,
  orders = [],
  onNavigateToBook,
  onNavigateToTrack,
  onLogout,
  onNavigateHome
}) {
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

    fetch(`/api/customers/${encodeURIComponent(customer.id)}/orders`)
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

      setSaveSuccessMsg('บันทึกข้อมูลที่อยู่และโปรไฟล์เรียบร้อยแล้ว!');
      setTimeout(() => setSaveSuccessMsg(''), 4000);
    } catch (err) {
      alert('บันทึกข้อมูลไม่สำเร็จ: ' + err.message);
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
      setPinErrorMsg('รหัส PIN ปัจจุบันไม่ถูกต้อง');
      return;
    }
    if (!/^\d{6}$/.test(newPinInput)) {
      setPinErrorMsg('รหัส PIN ใหม่ต้องเป็นตัวเลข 6 หลักเท่านั้น');
      return;
    }
    if (newPinInput !== confirmPinInput) {
      setPinErrorMsg('รหัส PIN ใหม่และยืนยันรหัส PIN ไม่ตรงกัน');
      return;
    }

    try {
      laundryStore.updateCustomer(customer.id, { pinCode: newPinInput });
      customer.pinCode = newPinInput;
      setPinSuccessMsg('เปลี่ยนรหัส PIN 6 หลักสำเร็จแล้ว! โปรดจำรหัสใหม่สำหรับการเข้าสู่ระบบครั้งถัดไป');
      setCurrentPinInput('');
      setNewPinInput('');
      setConfirmPinInput('');
      setTimeout(() => setPinSuccessMsg(''), 5000);
    } catch (err) {
      setPinErrorMsg('เกิดข้อผิดพลาดในการเปลี่ยนรหัส PIN: ' + err.message);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'BOOKING_REQUESTED':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">⏳ รอเข้ารับผ้า (Pending Pickup)</span>;
      case 'PICKUP_SCHEDULED':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-sky-100 text-sky-800 border border-sky-200">🛵 กำลังไปรับผ้า (Driver En Route)</span>;
      case 'PICKED_UP':
      case 'WEIGHED_INSPECTED':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">🧺 รับผ้าแล้ว / ชั่งน้ำหนัก</span>;
      case 'IN_WASH':
      case 'IRON_FOLD':
      case 'READY_FOR_DELIVERY':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-teal-100 text-teal-800 border border-teal-200">✨ กำลังซักอบรีด (In Facility)</span>;
      case 'OUT_FOR_DELIVERY':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-purple-100 text-purple-800 border border-purple-200">🚚 กำลังจัดส่งคืน (Out for Delivery)</span>;
      case 'DELIVERED':
      case 'COMPLETED':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">✅ ส่งคืนเรียบร้อย (Delivered)</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-800 border border-slate-200">{status}</span>;
    }
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
                title="คัดลอก Customer ID"
              >
                <span>ID: {customer.id}</span>
                <span>{copiedId ? '✓ Copied' : '📋'}</span>
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
              <span>🧺 จองส่งซักผ้าใหม่</span>
              <Icon name="chevronRight" className="w-4 h-4 text-slate-950" />
            </button>

            <button
              type="button"
              onClick={onLogout}
              className="py-3 px-4 rounded-2xl bg-slate-800/80 hover:bg-rose-950/40 border border-slate-700 hover:border-rose-800 text-slate-300 hover:text-rose-300 text-xs font-bold transition flex items-center gap-1.5"
            >
              <span>🚪 ออกจากระบบ</span>
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
          <span>รายการคำสั่งซื้อ ({customerOrders.length})</span>
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
          <span>ที่อยู่คอนโด & หมุด Google Maps</span>
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
          <span>ความปลอดภัย & รหัส PIN</span>
        </button>
      </div>

      {/* TAB 1: ORDERS & TRACKING */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold text-slate-900">
              ประวัติการส่งซักและติดตามสถานะผ้า (Order History)
            </h2>
            <button
              type="button"
              onClick={() => onNavigateToBook(customer)}
              className="text-xs font-bold text-sky-600 hover:text-sky-700 underline"
            >
              + สั่งซักผ้าออเดอร์ใหม่
            </button>
          </div>

          {isLoadingOrders ? (
            <div className="p-12 text-center text-slate-400 bg-white rounded-3xl border border-slate-200">
              <svg className="animate-spin w-6 h-6 text-sky-600 mx-auto mb-2" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>กำลังดึงข้อมูลคำสั่งซื้อ...</span>
            </div>
          ) : customerOrders.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-4 shadow-sm">
              <div className="w-16 h-16 rounded-full bg-sky-50 text-sky-600 text-3xl flex items-center justify-center mx-auto">
                🧺
              </div>
              <div className="space-y-1">
                <h3 className="font-extrabold text-slate-800 text-base">ยังไม่มีประวัติการส่งซักผ้า</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  เริ่มต้นส่งซักรอบแรกกับ NoName Laundry เรามีบริการรับ-ส่งถึงล็อบบี้คอนโดทั่วกรุงเทพฯ
                </p>
              </div>
              <button
                type="button"
                onClick={() => onNavigateToBook(customer)}
                className="py-3 px-6 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-md shadow-sky-600/20 transition"
              >
                จองรอบเข้ารับผ้าตอนนี้
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
                        สร้างเมื่อ: {new Date(order.createdAt).toLocaleDateString('th-TH', { dateStyle: 'medium' })}
                      </p>
                    </div>

                    <div>
                      {getStatusBadge(order.status)}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 p-3 rounded-2xl bg-slate-50 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px]">วันรับผ้า (Pickup)</span>
                      <span className="font-bold text-slate-800">{order.pickupDate}</span>
                      <span className="text-[10px] text-slate-500 block truncate">{order.pickupTime}</span>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[10px]">ยอดชำระเงิน</span>
                      <span className="font-black text-emerald-700 text-sm">
                        ฿{order.totalPrice || order.estimatedPrice || '456'}
                      </span>
                      <span className="text-[10px] text-slate-500 block">
                        {order.paymentStatus === 'PAID' ? '✅ ชำระแล้ว' : '⏳ รอชำระเงิน'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-slate-500 truncate max-w-[200px]">
                      📍 {order.condoName} {order.roomNumber ? `(${order.roomNumber})` : ''}
                    </span>

                    <button
                      type="button"
                      onClick={() => onNavigateToTrack(order.id)}
                      className="px-3.5 py-1.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 text-xs font-bold border border-sky-200 transition flex items-center gap-1 shadow-2xs"
                    >
                      <span>🔍 ติดตามผ้า</span>
                    </button>
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
              ข้อมูลที่อยู่คอนโด & หมุด Google Maps
            </h2>
            <p className="text-xs text-slate-500">
              พนักงานขับรถจะไปรับ-ส่งผ้าตามพิกัดและข้อมูลที่ท่านระบุไว้
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
                  ชื่อคอนโด / อาคารที่พัก <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={condoName}
                  onChange={(e) => setCondoName(e.target.value)}
                  placeholder="เช่น The Estelle Phrom Phong, Ashton Silom"
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-sky-500 outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  ตึก / ชั้น / เลขห้อง (Tower / Floor / Room Number)
                </label>
                <input
                  type="text"
                  value={roomNumber}
                  onChange={(e) => setRoomNumber(e.target.value)}
                  placeholder="เช่น Tower A, ชั้น 18, ห้อง 1804"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-sky-500 outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  ชื่อเล่น (Nick Name)
                </label>
                <input
                  type="text"
                  value={nickName}
                  onChange={(e) => setNickName(e.target.value)}
                  placeholder="เช่น Som, Alex, Nok"
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
                label="ปักหมุดตำแหน่งคอนโดบน Google Maps หรือแชร์พิกัด GPS"
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
                    อนุญาตให้รับ-ส่งผ้าที่นิติบุคคล / ล็อบบี้คอนโด (Juristic / Lobby Drop-off)
                  </span>
                  <span className="text-[11px] text-slate-600 block mt-0.5">
                    คนขับสามารถฝากหรือรับถุงผ้าที่เคาน์เตอร์นิติบุคคลได้โดยไม่ต้องรบกวนเวลาส่วนตัวของท่าน
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
                {isSaving ? 'กำลังบันทึก...' : '✓ บันทึกการเปลี่ยนแปลงที่อยู่'}
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
              ความปลอดภัย & เปลี่ยนรหัส PIN 6 หลัก
            </h2>
            <p className="text-xs text-slate-500">
              รหัส PIN ใช้สำหรับเข้าสู่ระบบของท่านอย่างรวดเร็วและปลอดภัย
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
                รหัส PIN ปัจจุบัน (Current PIN) <span className="text-rose-500">*</span>
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
                รหัส PIN ใหม่ 6 หลัก (New 6-digit PIN) <span className="text-rose-500">*</span>
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
                ยืนยันรหัส PIN ใหม่ (Confirm New PIN) <span className="text-rose-500">*</span>
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
                บันทึกรหัส PIN ใหม่
              </button>
            </div>
          </form>

          {/* Support notice */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600 flex items-start gap-2.5">
            <span className="text-base">💡</span>
            <div>
              <span className="font-bold text-slate-800 block">ต้องการความช่วยเหลือหรือเปลี่ยนเบอร์โทรศัพท์?</span>
              <span>
                สามารถติดต่อเจ้าหน้าที่ฝ่ายบริการลูกค้าได้ตลอด 24 ชม. ผ่านทาง LINE Official:{' '}
                <a href={CONTACT_CHANNELS.line.url} target="_blank" rel="noreferrer" className="text-emerald-600 font-bold underline">
                  @nonamelaundry
                </a>{' '}
                หรือ WhatsApp
              </span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
