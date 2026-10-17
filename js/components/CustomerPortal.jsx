import React, { useState, useEffect } from 'react';
import { Icon } from './Icons.jsx';
import { laundryStore, CONTACT_CHANNELS } from '../store.js';
import { getTrackingStage, TRACKING_STAGES, BANGKOK_DISTRICTS } from '../data/servicesData.js';
import {
  BANGKOK_DISTRICTS_TO_SUBDISTRICTS,
  PATTAYA_SUBDISTRICTS_LIST,
  DISTRICT_TO_POSTAL_CODE
} from '../data/postalCodesData.js';
import GoogleMapsCondoAutocomplete from './GoogleMapsCondoAutocomplete.jsx';
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
  const [orderFilter, setOrderFilter] = useState('all'); // 'all', 'active', 'past'
  const [expandedOrderIds, setExpandedOrderIds] = useState({});
  const [remoteOrders, setRemoteOrders] = useState([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);

  // Sync addresses from customer prop & store
  const getInitialAddresses = (cust) => {
    const raw = Array.isArray(cust?.addresses) ? cust.addresses : [];
    if (raw.length === 0) return [];
    return raw.map((a, idx) => ({
      id: a.id || `ADDR-${100 + idx}`,
      label: a.label || a.condoName || 'Home Condo',
      addressType: a.addressType || 'both', // 'both' | 'pickup' | 'delivery'
      city: a.city || ((a.postalCode && String(a.postalCode).startsWith('20')) ? 'Pattaya' : 'Bangkok'),
      condoName: a.condoName || a.label || a.address || '',
      address: a.address || `${a.label || ''}, ${a.district || 'Bangkok'}`,
      district: a.district || 'Watthana',
      subdistrict: a.subdistrict || '',
      postalCode: a.postalCode || '',
      roomNumber: a.roomNumber || '',
      googleMapsUrl: a.googleMapsUrl || '',
      leaveWithJuristic: a.leaveWithJuristic !== undefined ? Boolean(a.leaveWithJuristic) : true,
      isPrimary: idx === 0 ? true : Boolean(a.isPrimary)
    }));
  };

  const [addresses, setAddresses] = useState(() => getInitialAddresses(customer));

  // Add / Edit Address Form State
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [addrLabel, setAddrLabel] = useState('Home Condo');
  const [addrType, setAddrType] = useState('both'); // 'both' | 'pickup' | 'delivery'
  const [addrCity, setAddrCity] = useState('Bangkok');
  const [addrCondoName, setAddrCondoName] = useState('');
  const [addrDistrict, setAddrDistrict] = useState(BANGKOK_DISTRICTS[0] || 'Watthana');
  const [addrSubdistrict, setAddrSubdistrict] = useState(
    BANGKOK_DISTRICTS_TO_SUBDISTRICTS[BANGKOK_DISTRICTS[0]]?.[0]?.name || 'Khlong Toei Nuea'
  );
  const [addrPostalCode, setAddrPostalCode] = useState(
    BANGKOK_DISTRICTS_TO_SUBDISTRICTS[BANGKOK_DISTRICTS[0]]?.[0]?.code || '10110'
  );
  const [addrRoomNumber, setAddrRoomNumber] = useState('');
  const [addrGoogleMapsUrl, setAddrGoogleMapsUrl] = useState('');
  const [addrLeaveWithJuristic, setAddrLeaveWithJuristic] = useState(true);
  const [addrIsPrimary, setAddrIsPrimary] = useState(false);

  // Editable Personal CRM Profile States
  const [nickName, setNickName] = useState(customer?.nickName || '');
  const [secondaryMobile, setSecondaryMobile] = useState(customer?.secondaryMobile || '');
  const [lineId, setLineId] = useState(customer?.lineId || '');

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

  useEffect(() => {
    setAddresses(getInitialAddresses(customer));
    setNickName(customer?.nickName || '');
    setSecondaryMobile(customer?.secondaryMobile || '');
    setLineId(customer?.lineId || '');
  }, [customer?.id]);

  // Fetch orders from backend API & combine with live store orders
  useEffect(() => {
    if (!customer?.id) return;
    setIsLoadingOrders(true);

    const token = laundryStore.getCustomerToken();
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

    fetch(`/api/customers/${encodeURIComponent(customer.id)}/orders`, { headers })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setRemoteOrders(data);
        }
      })
      .catch(() => {})
      .finally(() => {
        setIsLoadingOrders(false);
      });
  }, [customer?.id]);

  // Combine remoteOrders + prop orders + laundryStore.orders matching this registered customer
  const customerOrders = React.useMemo(() => {
    if (!customer) return [];
    const orderMap = new Map();
    const custPhoneDigits = (customer.mobileNumber || '').replace(/\D/g, '');
    const custPhoneSuffix = custPhoneDigits.length >= 8 ? custPhoneDigits.slice(-8) : '';
    const secPhoneDigits = (customer.secondaryMobile || '').replace(/\D/g, '');
    const secPhoneSuffix = secPhoneDigits.length >= 8 ? secPhoneDigits.slice(-8) : '';

    const matchesCustomer = (o) => {
      if (!o || !o.id) return false;
      if (o.customerId && o.customerId === customer.id) return true;
      if (o.customerName && customer.fullName && o.customerName.trim().toLowerCase() === customer.fullName.trim().toLowerCase()) return true;
      if (o.email && customer.email && o.email.trim().toLowerCase() === customer.email.trim().toLowerCase()) return true;
      const oDigits = (o.contactValue || o.mobileNumber || '').replace(/\D/g, '');
      if (custPhoneSuffix && oDigits.length >= 8 && oDigits.endsWith(custPhoneSuffix)) return true;
      if (secPhoneSuffix && oDigits.length >= 8 && oDigits.endsWith(secPhoneSuffix)) return true;
      return false;
    };

    for (const ro of remoteOrders) {
      if (ro && ro.id) orderMap.set(ro.id, ro);
    }
    for (const so of (orders || [])) {
      if (matchesCustomer(so)) {
        orderMap.set(so.id, { ...(orderMap.get(so.id) || {}), ...so });
      }
    }
    for (const lo of (laundryStore.orders || [])) {
      if (matchesCustomer(lo)) {
        orderMap.set(lo.id, { ...(orderMap.get(lo.id) || {}), ...lo });
      }
    }

    return Array.from(orderMap.values()).sort(
      (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    );
  }, [customer, remoteOrders, orders]);

  // Split into Current Active Orders and Past Orders
  const activeOrders = customerOrders.filter(
    o => o.status !== 'DELIVERED' && o.status !== 'CANCELLED'
  );
  const pastOrders = customerOrders.filter(
    o => o.status === 'DELIVERED' || o.status === 'CANCELLED'
  );

  const primaryAddr = addresses.find(a => a.isPrimary) || addresses[0] || {};

  const handleCopyId = () => {
    if (customer?.id) {
      navigator.clipboard?.writeText(customer.id);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  const toggleExpandTimeline = (orderId) => {
    setExpandedOrderIds(prev => ({
      ...prev,
      [orderId]: !prev[orderId]
    }));
  };

  // Auto-update City, District, Sub-district, Postal Code when Condo is chosen in Address Form
  const applyAddressLocationUpdate = (loc) => {
    if (!loc) return;
    let targetCity = loc.city;
    if (!targetCity) {
      if ((loc.postalCode && String(loc.postalCode).startsWith('20')) || (loc.zipcode && String(loc.zipcode).startsWith('20'))) {
        targetCity = 'Pattaya';
      } else {
        targetCity = 'Bangkok';
      }
    }
    setAddrCity(targetCity);

    if (targetCity === 'Pattaya') {
      let ptySub = null;
      if (loc.subdistrict) {
        const cleanSub = loc.subdistrict.toLowerCase();
        ptySub = PATTAYA_SUBDISTRICTS_LIST.find(s =>
          s.name.toLowerCase() === cleanSub ||
          (s.nameTh && s.nameTh.toLowerCase() === cleanSub) ||
          cleanSub.includes(s.name.toLowerCase()) ||
          s.name.toLowerCase().includes(cleanSub)
        );
      }
      if (!ptySub && (loc.postalCode || loc.zipcode)) {
        const pCode = loc.postalCode || loc.zipcode;
        ptySub = PATTAYA_SUBDISTRICTS_LIST.find(s => s.code === pCode);
      }
      if (!ptySub) ptySub = PATTAYA_SUBDISTRICTS_LIST[0];
      if (ptySub) {
        setAddrDistrict(ptySub.district);
        setAddrSubdistrict(ptySub.name);
        setAddrPostalCode(ptySub.code);
      }
    } else {
      let matchedDist = loc.district ? loc.district.split(' (')[0].trim() : (addrDistrict || 'Watthana');
      if (!BANGKOK_DISTRICTS.includes(matchedDist)) {
        const found = BANGKOK_DISTRICTS.find(d =>
          d.toLowerCase() === matchedDist.toLowerCase() ||
          matchedDist.toLowerCase().includes(d.toLowerCase()) ||
          d.toLowerCase().includes(matchedDist.toLowerCase())
        );
        matchedDist = found || 'Watthana';
      }
      const subList = BANGKOK_DISTRICTS_TO_SUBDISTRICTS[matchedDist] || [];
      setAddrDistrict(matchedDist);
      if (subList.length > 0) {
        setAddrSubdistrict(loc.subdistrict || subList[0].name);
        setAddrPostalCode(loc.postalCode || loc.zipcode || subList[0].code || DISTRICT_TO_POSTAL_CODE[matchedDist] || '10110');
      } else {
        setAddrPostalCode(loc.postalCode || loc.zipcode || DISTRICT_TO_POSTAL_CODE[matchedDist] || '10110');
      }
    }
  };

  const handleOpenAddAddress = () => {
    setEditingAddressId(null);
    setAddrLabel(addresses.length === 0 ? 'Home Condo' : 'Office / Second Condo');
    setAddrType('both');
    setAddrCity('Bangkok');
    setAddrCondoName('');
    const defDist = BANGKOK_DISTRICTS[0] || 'Watthana';
    const defSub = BANGKOK_DISTRICTS_TO_SUBDISTRICTS[defDist]?.[0];
    setAddrDistrict(defDist);
    setAddrSubdistrict(defSub?.name || 'Khlong Toei Nuea');
    setAddrPostalCode(defSub?.code || '10110');
    setAddrRoomNumber('');
    setAddrGoogleMapsUrl('');
    setAddrLeaveWithJuristic(true);
    setAddrIsPrimary(addresses.length === 0);
    setShowAddressForm(true);
  };

  const handleOpenEditAddress = (addr) => {
    setEditingAddressId(addr.id);
    setAddrLabel(addr.label || 'Home Condo');
    setAddrType(addr.addressType || 'both');
    const isPty = addr.city === 'Pattaya' || (addr.postalCode && String(addr.postalCode).startsWith('20'));
    setAddrCity(isPty ? 'Pattaya' : 'Bangkok');
    setAddrCondoName(addr.condoName || addr.label || addr.address || '');
    const cleanDist = (addr.district || '').split(' (')[0].trim();
    const matchedDist = isPty
      ? (addr.district || 'Bang Lamung')
      : (BANGKOK_DISTRICTS.find(d => d.toLowerCase() === cleanDist.toLowerCase()) || BANGKOK_DISTRICTS[0] || 'Watthana');
    setAddrDistrict(matchedDist);
    setAddrSubdistrict(
      addr.subdistrict ||
      (isPty ? PATTAYA_SUBDISTRICTS_LIST[0]?.name : BANGKOK_DISTRICTS_TO_SUBDISTRICTS[matchedDist]?.[0]?.name) ||
      ''
    );
    setAddrPostalCode(
      addr.postalCode ||
      (isPty ? '20150' : (BANGKOK_DISTRICTS_TO_SUBDISTRICTS[matchedDist]?.[0]?.code || DISTRICT_TO_POSTAL_CODE[matchedDist] || '10110'))
    );
    setAddrRoomNumber(addr.roomNumber || '');
    setAddrGoogleMapsUrl(addr.googleMapsUrl || '');
    setAddrLeaveWithJuristic(addr.leaveWithJuristic !== false);
    setAddrIsPrimary(Boolean(addr.isPrimary));
    setShowAddressForm(true);
  };

  const handleSaveAddressForm = (e) => {
    e.preventDefault();
    if (!addrCondoName.trim()) return;

    const formattedAddress = `${addrCondoName.trim()}${addrSubdistrict ? `, ${addrSubdistrict}` : ''}, ${addrDistrict}, ${addrCity} ${addrPostalCode}`.trim();
    const mapUrl = addrGoogleMapsUrl.trim() || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${addrCondoName.trim()} ${addrDistrict} ${addrCity}`)}`;

    const addressPayload = {
      id: editingAddressId || ('ADDR-' + Math.floor(100 + Math.random() * 900)),
      label: addrLabel.trim() || addrCondoName.trim(),
      addressType: addrType,
      city: addrCity,
      condoName: addrCondoName.trim(),
      address: formattedAddress,
      district: addrDistrict,
      subdistrict: addrSubdistrict,
      postalCode: addrPostalCode,
      roomNumber: addrRoomNumber.trim(),
      googleMapsUrl: mapUrl,
      leaveWithJuristic: Boolean(addrLeaveWithJuristic),
      isPrimary: Boolean(addrIsPrimary) || addresses.length === 0
    };

    let nextAddresses;
    if (editingAddressId) {
      nextAddresses = addresses.map(a => {
        if (a.id === editingAddressId) return addressPayload;
        return addressPayload.isPrimary ? { ...a, isPrimary: false } : a;
      });
    } else {
      const existingList = addressPayload.isPrimary
        ? addresses.map(a => ({ ...a, isPrimary: false }))
        : [...addresses];
      nextAddresses = [...existingList, addressPayload];
    }

    if (nextAddresses.length > 0 && !nextAddresses.some(a => a.isPrimary)) {
      nextAddresses[0] = { ...nextAddresses[0], isPrimary: true };
    }

    setAddresses(nextAddresses);
    laundryStore.updateCustomer(customer.id, { addresses: nextAddresses });
    setShowAddressForm(false);
    setEditingAddressId(null);
    setSaveSuccessMsg(
      isTh
        ? 'บันทึกที่อยู่สำหรับรับ-ส่งผ้าเรียบร้อยแล้ว!'
        : 'Pickup & delivery address saved to your profile!'
    );
    setTimeout(() => setSaveSuccessMsg(''), 4000);
  };

  const handleSetPrimaryAddress = (addrId) => {
    const nextAddresses = addresses.map(a => ({
      ...a,
      isPrimary: a.id === addrId
    }));
    setAddresses(nextAddresses);
    laundryStore.updateCustomer(customer.id, { addresses: nextAddresses });
    setSaveSuccessMsg(isTh ? 'ตั้งเป็นที่อยู่หลักเรียบร้อยแล้ว' : 'Default primary address updated!');
    setTimeout(() => setSaveSuccessMsg(''), 3500);
  };

  const handleDeleteAddress = (addrId) => {
    if (addresses.length <= 1) {
      alert(isTh ? 'ต้องมีที่อยู่อย่างน้อย 1 รายการในโปรไฟล์' : 'You must keep at least one saved address in your profile.');
      return;
    }
    const nextAddresses = addresses.filter(a => a.id !== addrId);
    if (nextAddresses.length > 0 && !nextAddresses.some(a => a.isPrimary)) {
      nextAddresses[0] = { ...nextAddresses[0], isPrimary: true };
    }
    setAddresses(nextAddresses);
    laundryStore.updateCustomer(customer.id, { addresses: nextAddresses });
    setSaveSuccessMsg(isTh ? 'ลบที่อยู่เรียบร้อยแล้ว' : 'Address removed from your profile.');
    setTimeout(() => setSaveSuccessMsg(''), 3500);
  };

  const handleSaveProfileDetails = (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccessMsg('');
    try {
      laundryStore.updateCustomer(customer.id, {
        nickName: nickName.trim(),
        secondaryMobile: secondaryMobile.trim(),
        lineId: lineId.trim(),
        addresses
      });
      setSaveSuccessMsg(isTh ? 'บันทึกข้อมูลโปรไฟล์เรียบร้อยแล้ว!' : 'Profile contact details updated successfully!');
      setTimeout(() => setSaveSuccessMsg(''), 4000);
    } catch (err) {
      alert((isTh ? 'บันทึกข้อมูลไม่สำเร็จ: ' : 'Failed to save profile: ') + err.message);
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
      laundryStore.setCustomerPin(customer.id, newPinInput);
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

  const getGranularStatusLabel = (status) => {
    const map = {
      BOOKING_REQUESTED: {
        en: '📋 Booking Requested (Awaiting Dispatch)',
        th: '📋 ส่งคำสั่งจองแล้ว (รอจัดคิวคนขับ)',
        cls: 'bg-amber-100 text-amber-900 border-amber-300'
      },
      PICKUP_SCHEDULED: {
        en: '🛵 Rider Assigned for Pickup',
        th: '🛵 จัดคนขับเข้ารับผ้าแล้ว',
        cls: 'bg-sky-100 text-sky-900 border-sky-300'
      },
      PICKED_UP: {
        en: '📦 Laundry Picked Up (In Transit to Facility)',
        th: '📦 รับผ้าแล้ว (กำลังนำเข้าโรงซัก)',
        cls: 'bg-blue-100 text-blue-900 border-blue-300'
      },
      WEIGHED_INSPECTED: {
        en: '⚖️ Weighed on Digital Scale & Inspected',
        th: '⚖️ ชั่งน้ำหนักดิจิทัลและตรวจสอบผ้าแล้ว',
        cls: 'bg-purple-100 text-purple-900 border-purple-300'
      },
      IN_WASH: {
        en: '🫧 In Wash & Gentle Tumble Dry',
        th: '🫧 กำลังซักและอบแห้ง',
        cls: 'bg-indigo-100 text-indigo-900 border-indigo-300'
      },
      IRON_FOLD: {
        en: '✨ Steam Ironing & Neat Folding',
        th: '✨ กำลังรีดไอน้ำและพับแพ็ค',
        cls: 'bg-fuchsia-100 text-fuchsia-900 border-fuchsia-300'
      },
      READY_FOR_DELIVERY: {
        en: '✅ QC Passed — Ready for Return Delivery',
        th: '✅ ผ่าน QC พร้อมจัดส่งคืน',
        cls: 'bg-teal-100 text-teal-900 border-teal-300'
      },
      OUT_FOR_DELIVERY: {
        en: '🚚 Out for Delivery to Your Address',
        th: '🚚 คนขับกำลังนำผ้าไปส่งคืน',
        cls: 'bg-emerald-100 text-emerald-900 border-emerald-300'
      },
      DELIVERED: {
        en: '🎉 Delivered & Completed',
        th: '🎉 จัดส่งคืนสำเร็จเรียบร้อย',
        cls: 'bg-emerald-100 text-emerald-900 border-emerald-300'
      },
      CANCELLED: {
        en: '❌ Cancelled',
        th: '❌ ยกเลิกรายการ',
        cls: 'bg-rose-100 text-rose-900 border-rose-300'
      }
    };
    const item = map[status] || map.BOOKING_REQUESTED;
    return (
      <span className={`px-3 py-1 rounded-full text-[11px] font-extrabold border ${item.cls}`}>
        {isTh ? item.th : item.en}
      </span>
    );
  };

  const getAddressTypeBadge = (type) => {
    if (type === 'pickup') {
      return (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
          {isTh ? '📥 จุดรับผ้า (Pickup Only)' : '📥 Pickup Address'}
        </span>
      );
    }
    if (type === 'delivery') {
      return (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 text-teal-800 border border-teal-200">
          {isTh ? '📤 จุดส่งผ้าคืน (Delivery Only)' : '📤 Delivery Address'}
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
        {isTh ? '🔄 รับและส่งคืน (Pickup & Delivery)' : '🔄 Pickup & Delivery'}
      </span>
    );
  };

  const renderOrderCard = (order, isActiveOrder) => {
    const stage = getTrackingStage(order.status);
    const currentStepNumber = stage.step || 1;
    const isExpanded = Boolean(expandedOrderIds[order.id]);
    const timeline = Array.isArray(order.timeline) ? order.timeline : [];

    return (
      <div
        key={order.id}
        className={`bg-white rounded-3xl p-5 sm:p-6 shadow-sm border transition space-y-4 ${
          isActiveOrder
            ? 'border-sky-300 ring-1 ring-sky-500/15 hover:border-sky-400'
            : 'border-slate-200/90 hover:border-slate-300'
        }`}
      >
        {/* Top Row: Order ID, Service, Status Badge */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              {isActiveOrder && (
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping-subtle shrink-0" title="Live Active Order" />
              )}
              <span className="text-base font-black text-slate-900 font-mono tracking-tight">
                {order.id}
              </span>
              <span className="text-xs font-extrabold text-sky-800 bg-sky-50 px-2.5 py-0.5 rounded-lg border border-sky-200">
                {order.serviceName || 'Wash / Fold'}
              </span>
              {order.tagNumber && order.tagNumber !== 'TAG-PENDING' && (
                <span className="text-[11px] font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                  🏷️ {order.tagNumber}
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              {isTh ? 'วันที่สั่งซัก: ' : 'Booked on: '}
              {order.createdAt ? new Date(order.createdAt).toLocaleDateString(isTh ? 'th-TH' : 'en-GB', { dateStyle: 'medium' }) : order.pickupDate}
              {order.turnaroundSpeed && (
                <span className="ml-2 font-semibold text-slate-600">
                  • {order.turnaroundSpeed === 'same_day' ? (isTh ? '🚀 ซักด่วนวันเดียว' : '🚀 Same Day') : order.turnaroundSpeed === 'next_day_24h' ? (isTh ? '⚡ ด่วน 24 ชม.' : '⚡ Next Day 24h') : (isTh ? '🕒 มาตรฐาน 48 ชม.' : '🕒 Standard 48h')}
                </span>
              )}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {getGranularStatusLabel(order.status)}
          </div>
        </div>

        {/* Live 6-Stage Laundry Process Tracker Bar */}
        {order.status !== 'CANCELLED' && (
          <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50/90 border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-extrabold text-slate-800 flex items-center gap-1.5">
                <span>🧺</span>
                <span>{isTh ? 'สถานะกระบวนการซักอบรีด (Live Laundry Process)' : 'Live Laundry Process Tracker'}</span>
              </span>
              <span className="text-[11px] font-bold text-sky-700">
                {isTh ? `ขั้นตอนที่ ${currentStepNumber} จาก ${TRACKING_STAGES.length}` : `Stage ${currentStepNumber} of ${TRACKING_STAGES.length}`}
              </span>
            </div>

            <div className="overflow-x-auto pb-1">
              <div className="min-w-[480px] grid grid-cols-6 gap-1.5 relative pt-1">
                <div className="absolute top-4 left-[8%] right-[8%] h-1 bg-slate-200 z-0">
                  <div
                    className="h-full bg-gradient-to-r from-sky-500 to-emerald-500 transition-all duration-500"
                    style={{
                      width: `${Math.max(0, Math.min(100, ((currentStepNumber - 1) / (TRACKING_STAGES.length - 1)) * 100))}%`
                    }}
                  />
                </div>

                {TRACKING_STAGES.map((st, idx) => {
                  const isDone = currentStepNumber >= (idx + 1);
                  const isCurrent = currentStepNumber === (idx + 1);
                  return (
                    <div key={st.key} className="flex flex-col items-center text-center z-10 px-0.5">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center font-extrabold text-[11px] transition-all ${
                          isDone
                            ? 'bg-sky-600 text-white shadow-sm'
                            : 'bg-white text-slate-400 border-2 border-slate-300'
                        } ${isCurrent ? 'ring-4 ring-sky-200 bg-emerald-600' : ''}`}
                      >
                        {isDone ? '✓' : idx + 1}
                      </div>
                      <span
                        className={`text-[10px] font-bold mt-1.5 leading-tight ${
                          isCurrent ? 'text-sky-700 font-black' : isDone ? 'text-slate-800' : 'text-slate-400'
                        }`}
                      >
                        {st.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Order Specs Grid: Pickup, Delivery, Weight/Qty, Total */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3.5 rounded-2xl bg-slate-50 text-xs border border-slate-100">
          <div>
            <span className="text-slate-400 block text-[10px] font-semibold">
              {isTh ? '📥 วันรับผ้า (Pickup)' : '📥 Pickup Schedule'}
            </span>
            <span className="font-bold text-slate-800 block mt-0.5">{order.pickupDate || '—'}</span>
            <span className="text-[10px] text-slate-500 block truncate">{order.pickupTime || ''}</span>
          </div>

          <div>
            <span className="text-slate-400 block text-[10px] font-semibold">
              {isTh ? '📤 วันส่งคืน (Delivery)' : '📤 Return Delivery'}
            </span>
            <span className="font-bold text-slate-800 block mt-0.5">{order.deliveryDate || (isTh ? 'ตามรอบบริการ' : 'Scheduled')}</span>
            <span className="text-[10px] text-slate-500 block truncate">{order.deliveryTime || ''}</span>
          </div>

          <div>
            <span className="text-slate-400 block text-[10px] font-semibold">
              {isTh ? '⚖️ น้ำหนัก / จำนวนผ้า' : '⚖️ Scale Weight / Qty'}
            </span>
            <span className="font-bold text-sky-700 block mt-0.5">
              {order.actualWeightKg
                ? `${order.actualWeightKg} KG (${isTh ? 'ชั่งจริง' : 'Verified'})`
                : order.estimatedWeightKg
                  ? `~${order.estimatedWeightKg} KG (${isTh ? 'ประมาณการ' : 'Est.'})`
                  : `${order.quantity || 1} ${order.unit || 'items'}`}
            </span>
            <span className="text-[10px] text-slate-500 block">
              {order.assignedRider
                ? (isTh ? `🛵 คนขับ: ${order.assignedRider}` : `🛵 Rider: ${order.assignedRider}`)
                : (isTh ? 'ชั่งด้วยตาชั่งดิจิทัล' : 'Digital scale audit')}
            </span>
          </div>

          <div>
            <span className="text-slate-400 block text-[10px] font-semibold">
              {isTh ? '💳 ยอดชำระเงิน' : '💳 Total Amount'}
            </span>
            <span className="font-black text-emerald-700 text-sm block mt-0.5">
              ฿{order.totalPrice || order.estimatedPrice || '350'} THB
            </span>
            <span className="text-[10px] font-semibold block">
              {order.paymentStatus === 'PAID'
                ? <span className="text-emerald-700">{isTh ? '✅ ชำระเงินแล้ว' : '✅ Paid'}</span>
                : <span className="text-amber-700">{isTh ? '⏳ รอชำระเงิน' : '⏳ Pending Payment'}</span>}
            </span>
          </div>
        </div>

        {/* Pickup & Delivery Locations */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-600 bg-slate-50/60 px-3.5 py-2.5 rounded-xl border border-slate-100">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <span>
              <strong className="text-slate-800">{isTh ? '📥 รับผ้า:' : '📥 Pickup:'}</strong>{' '}
              {order.pickupAddress || `${order.condoName || ''}${order.roomNumber ? ` (${order.roomNumber})` : ''}${order.district ? `, ${order.district}` : ''}`}
            </span>
            {order.deliveryAddress && order.deliveryAddress !== order.pickupAddress && (
              <span>
                <strong className="text-slate-800">{isTh ? '📤 ส่งคืน:' : '📤 Delivery:'}</strong>{' '}
                {order.deliveryAddress}
              </span>
            )}
          </div>
          <span className="text-[11px] font-semibold text-sky-700 shrink-0">
            {order.leaveWithJuristic !== false
              ? (isTh ? '🏢 ฝากนิติบุคคล / ล็อบบี้' : '🏢 Juristic / Lobby Drop-off')
              : (isTh ? '🤝 รับ-ส่งกับคนขับโดยตรง' : '🤝 Meet Rider in Person')}
          </span>
        </div>

        {/* Collapsible Step-by-Step Timeline */}
        {timeline.length > 0 && isExpanded && (
          <div className="p-4 rounded-2xl bg-slate-900 text-slate-100 space-y-2.5 text-xs animate-fadeIn">
            <div className="font-bold text-sky-300 uppercase tracking-wider text-[11px] flex items-center justify-between">
              <span>{isTh ? 'ประวัติการทำงานและสถานะผ้า (Activity Log)' : 'Facility & Courier Activity Timeline'}</span>
              <span>{timeline.length} {isTh ? 'รายการ' : 'updates'}</span>
            </div>
            <div className="space-y-2 border-l-2 border-sky-500/40 pl-3 ml-1">
              {timeline.map((entry, idx) => (
                <div key={idx} className="relative">
                  <div className="text-[11px] font-mono text-sky-300 font-bold">
                    {entry.timestamp} — <span className="text-white">{entry.status?.replace(/_/g, ' ')}</span>
                  </div>
                  <div className="text-xs text-slate-300 mt-0.5">{entry.note}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons Row */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => onNavigateToTrack && onNavigateToTrack(order.id)}
              className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-extrabold transition flex items-center gap-1.5 shadow-sm"
            >
              <Icon name="search" className="w-3.5 h-3.5 text-white" />
              <span>{isTh ? 'ติดตามกระบวนการซักแบบละเอียด' : 'Track Live Laundry Process'}</span>
            </button>

            {timeline.length > 0 && (
              <button
                type="button"
                onClick={() => toggleExpandTimeline(order.id)}
                className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition"
              >
                {isExpanded
                  ? (isTh ? 'ซ่อนไทม์ไลน์ ▲' : 'Hide Timeline ▲')
                  : (isTh ? `ดูไทม์ไลน์ (${timeline.length}) ▼` : `Activity Log (${timeline.length}) ▼`)}
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {!isActiveOrder && (
              <button
                type="button"
                onClick={() => onNavigateToBook(customer)}
                className="px-3 py-1.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 text-xs font-bold border border-sky-200 transition"
              >
                {isTh ? '🔄 สั่งซักซ้ำ' : '🔄 Book Again'}
              </button>
            )}

            <a
              href={CONTACT_CHANNELS.line.url}
              target="_blank"
              rel="noreferrer"
              className="px-3.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200 transition flex items-center gap-1.5"
              title={isTh ? 'สอบถามสถานะออเดอร์กับฝ่ายบริการลูกค้าทาง LINE' : 'Contact support on LINE regarding this order'}
            >
              <Icon name="line" className="w-3.5 h-3.5 text-emerald-600" />
              <span>{isTh ? 'LINE ซัพพอร์ต' : 'LINE Support'}</span>
            </a>
          </div>
        </div>
      </div>
    );
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
                <span>{customer.tier || 'Registered Member'}</span>
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

              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <span>✓</span>
                <span>{isTh ? 'สมาชิกที่ลงทะเบียน (ติดตามสถานะผ้าสดได้)' : 'Registered Member • Live Tracking Enabled'}</span>
              </span>
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2">
                <span>{customer.fullName}</span>
                {nickName && (
                  <span className="text-sky-400 text-lg font-bold">({nickName})</span>
                )}
              </h1>
              <p className="text-xs text-slate-300 mt-1 flex flex-wrap items-center gap-3">
                <span>📞 {customer.mobileNumber}</span>
                {customer.email && (
                  <>
                    <span>•</span>
                    <span>✉️ {customer.email}</span>
                  </>
                )}
                <span>•</span>
                <span>📍 {addresses.length} {isTh ? 'ที่อยู่รับ-ส่งผ้าที่บันทึกไว้' : `Saved Address${addresses.length === 1 ? '' : 'es'}`} ({primaryAddr.label || primaryAddr.condoName || 'Bangkok'})</span>
              </p>
            </div>
          </div>

          {/* Quick Action CTAs */}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <button
              type="button"
              onClick={() => onNavigateToBook({ ...customer, addresses })}
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
          className={`py-3 px-5 font-bold text-sm rounded-t-2xl transition border-b-2 flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'orders'
              ? 'border-sky-600 text-sky-600 bg-sky-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <span>📦</span>
          <span>
            {isTh
              ? `คำสั่งซื้อ & ติดตามสถานะผ้า (${customerOrders.length})`
              : `My Orders & Live Tracking (${customerOrders.length})`}
          </span>
          {activeOrders.length > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500 text-white">
              {activeOrders.length} {isTh ? 'กำลังซัก' : 'Active'}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('address')}
          className={`py-3 px-5 font-bold text-sm rounded-t-2xl transition border-b-2 flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'address'
              ? 'border-sky-600 text-sky-600 bg-sky-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <span>📍</span>
          <span>
            {isTh
              ? `ที่อยู่รับ-ส่งผ้า (${addresses.length})`
              : `Pickup & Delivery Addresses (${addresses.length})`}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('security')}
          className={`py-3 px-5 font-bold text-sm rounded-t-2xl transition border-b-2 flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'security'
              ? 'border-sky-600 text-sky-600 bg-sky-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <span>🔒</span>
          <span>{isTh ? 'ความปลอดภัย & รหัส PIN' : 'Security & PIN Code'}</span>
        </button>
      </div>

      {/* TAB 1: CURRENT & PAST ORDERS + LIVE LAUNDRY TRACKING */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          {/* KPI Summary & Filter Bar */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-extrabold text-slate-900">
                {isTh ? 'ติดตามสถานะผ้าปัจจุบัน & ประวัติการส่งซักทั้งหมด' : 'Current Laundry Tracking & Past Order History'}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {isTh
                  ? 'สิทธิพิเศษเฉพาะสมาชิกที่ลงทะเบียน: ติดตามทุกขั้นตอนตั้งแต่รับผ้า ชั่งน้ำหนัก ซัก อบ รีด จนถึงจัดส่งคืน'
                  : 'Exclusive for registered members: Track every stage of your laundry from pickup & scale weighing to washing, ironing, and delivery.'}
              </p>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl border border-slate-200 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setOrderFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  orderFilter === 'all' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {isTh ? `ทั้งหมด (${customerOrders.length})` : `All (${customerOrders.length})`}
              </button>
              <button
                type="button"
                onClick={() => setOrderFilter('active')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  orderFilter === 'active' ? 'bg-white text-sky-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>{isTh ? `กำลังดำเนินการ (${activeOrders.length})` : `Current (${activeOrders.length})`}</span>
              </button>
              <button
                type="button"
                onClick={() => setOrderFilter('past')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  orderFilter === 'past' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {isTh ? `ประวัติย้อนหลัง (${pastOrders.length})` : `Past Orders (${pastOrders.length})`}
              </button>
            </div>
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
                onClick={() => onNavigateToBook({ ...customer, addresses })}
                className="py-3 px-6 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-md shadow-sky-600/20 transition"
              >
                {isTh ? 'จองรอบเข้ารับผ้าตอนนี้' : 'Schedule Pickup Now'}
              </button>
            </div>
          ) : (
            <div className="space-y-8">
              {/* SECTION 1: CURRENT ACTIVE ORDERS */}
              {(orderFilter === 'all' || orderFilter === 'active') && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span>
                        {isTh
                          ? `ออเดอร์ปัจจุบันที่กำลังดำเนินการ (${activeOrders.length})`
                          : `Current Active Orders (${activeOrders.length})`}
                      </span>
                    </h3>
                    <button
                      type="button"
                      onClick={() => onNavigateToBook({ ...customer, addresses })}
                      className="text-xs font-bold text-sky-600 hover:text-sky-700 underline"
                    >
                      {isTh ? '+ จองส่งซักผ้าเพิ่ม' : '+ Book New Order'}
                    </button>
                  </div>

                  {activeOrders.length === 0 ? (
                    <div className="p-6 rounded-3xl bg-white border border-slate-200 text-center text-xs text-slate-500">
                      {isTh
                        ? 'ขณะนี้ไม่มีรายการซักผ้าที่กำลังดำเนินการ'
                        : 'You have no active orders in progress right now.'}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-4">
                      {activeOrders.map(order => renderOrderCard(order, true))}
                    </div>
                  )}
                </div>
              )}

              {/* SECTION 2: PAST COMPLETED ORDERS */}
              {(orderFilter === 'all' || orderFilter === 'past') && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-black uppercase tracking-wider text-slate-700 flex items-center gap-2">
                      <span>🕓</span>
                      <span>
                        {isTh
                          ? `ประวัติคำสั่งซื้อที่ผ่านมา (${pastOrders.length})`
                          : `Past Completed Orders (${pastOrders.length})`}
                      </span>
                    </h3>
                  </div>

                  {pastOrders.length === 0 ? (
                    <div className="p-6 rounded-3xl bg-white border border-slate-200 text-center text-xs text-slate-500">
                      {isTh
                        ? 'ยังไม่มีประวัติคำสั่งซื้อที่เสร็จสิ้นแล้ว'
                        : 'No completed past orders yet.'}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-4">
                      {pastOrders.map(order => renderOrderCard(order, false))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: MULTIPLE PICKUP & DELIVERY ADDRESSES + PROFILE */}
      {activeTab === 'address' && (
        <div className="space-y-6">
          {/* Multiple Addresses Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/90 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-base sm:text-lg font-extrabold text-slate-900 flex items-center gap-2">
                  <span>📍</span>
                  <span>
                    {isTh
                      ? `ที่อยู่สำหรับรับผ้าและส่งผ้าคืน (${addresses.length} แห่ง)`
                      : `Saved Pickup & Delivery Addresses (${addresses.length})`}
                  </span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {isTh
                    ? 'คุณสามารถเพิ่มที่อยู่ได้หลายแห่ง (เช่น คอนโดที่พัก, ที่ทำงาน, หรือคอนโดพัทยา) เพื่อเลือกเป็นจุดรับผ้าหรือจุดส่งผ้าคืนเมื่อสั่งซัก'
                    : 'Create and manage multiple addresses (e.g., Home Condo, Office, Partner’s Residence, Pattaya Condo) to use for laundry pickup and delivery.'}
                </p>
              </div>

              <button
                type="button"
                onClick={handleOpenAddAddress}
                className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-md shadow-sky-600/20 flex items-center gap-1.5 transition shrink-0 self-start sm:self-auto"
              >
                <Icon name="plus" className="w-4 h-4 text-white" />
                <span>{isTh ? '+ เพิ่มที่อยู่รับ/ส่งผ้าใหม่' : '+ Add New Address'}</span>
              </button>
            </div>

            {saveSuccessMsg && (
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold animate-fadeIn">
                ✓ {saveSuccessMsg}
              </div>
            )}

            {/* ADD / EDIT ADDRESS MODAL OR INLINE FORM */}
            {showAddressForm && (
              <form
                onSubmit={handleSaveAddressForm}
                className="p-5 sm:p-6 rounded-3xl bg-sky-50/60 border-2 border-sky-200 space-y-4 animate-fadeIn"
              >
                <div className="flex items-center justify-between pb-3 border-b border-sky-200/70">
                  <h3 className="text-sm font-black text-sky-950 flex items-center gap-2">
                    <span>{editingAddressId ? '✏️' : '➕'}</span>
                    <span>
                      {editingAddressId
                        ? (isTh ? 'แก้ไขที่อยู่รับ-ส่งผ้า' : 'Edit Saved Address')
                        : (isTh ? 'เพิ่มที่อยู่รับ-ส่งผ้าใหม่ในโปรไฟล์' : 'Add New Pickup / Delivery Address')}
                    </span>
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddressForm(false);
                      setEditingAddressId(null);
                    }}
                    className="text-xs font-bold text-slate-500 hover:text-slate-800 px-2 py-1 rounded-lg bg-white border border-slate-200"
                  >
                    {isTh ? '✕ ปิด' : '✕ Cancel'}
                  </button>
                </div>

                {/* Quick Label Presets & Label Input */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      {isTh ? 'ชื่อเรียกสถานที่ (Address Label)' : 'Address Label / Nickname'} <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={addrLabel}
                      onChange={(e) => setAddrLabel(e.target.value)}
                      placeholder={isTh ? 'เช่น คอนโดบ้าน, ที่ทำงาน, คอนโดพัทยา' : 'e.g. Home Condo, Office, Weekend Condo'}
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs sm:text-sm font-semibold focus:ring-2 focus:ring-sky-500 outline-none"
                    />
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {[
                        { label: isTh ? '🏠 คอนโดที่พัก' : '🏠 Home Condo', val: 'Home Condo' },
                        { label: isTh ? '💼 ที่ทำงาน / ออฟฟิศ' : '💼 Office / Work', val: 'Office / Work' },
                        { label: isTh ? '🏢 คอนโดสำรอง' : '🏢 Second Condo', val: 'Second Condo' },
                        { label: isTh ? '🏖️ ที่พักพัทยา' : '🏖️ Pattaya Residence', val: 'Pattaya Residence' }
                      ].map((preset, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setAddrLabel(preset.val)}
                          className="text-[10px] font-bold px-2 py-1 rounded-lg bg-white hover:bg-sky-100 text-slate-700 border border-slate-200 transition"
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Address Purpose: Both vs Pickup Only vs Delivery Only */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      {isTh ? 'ประเภทการใช้งานที่อยู่' : 'Address Usage Type'} <span className="text-rose-500">*</span>
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'both', label: isTh ? '🔄 รับและส่งคืน' : '🔄 Both', sub: isTh ? 'ใช้ทั้งรับ-ส่งผ้า' : 'Pickup & Delivery' },
                        { id: 'pickup', label: isTh ? '📥 จุดรับผ้า' : '📥 Pickup', sub: isTh ? 'ใช้รับผ้าอย่างเดียว' : 'Pickup Only' },
                        { id: 'delivery', label: isTh ? '📤 จุดส่งผ้าคืน' : '📤 Delivery', sub: isTh ? 'ใช้ส่งคืนอย่างเดียว' : 'Delivery Only' }
                      ].map(opt => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setAddrType(opt.id)}
                          className={`p-2.5 rounded-xl border text-left transition ${
                            addrType === opt.id
                              ? 'border-sky-600 bg-white ring-2 ring-sky-500/20 shadow-2xs'
                              : 'border-slate-200 bg-white/70 hover:bg-white'
                          }`}
                        >
                          <div className="text-xs font-extrabold text-slate-900">{opt.label}</div>
                          <div className="text-[10px] text-slate-500 mt-0.5">{opt.sub}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* City Selector: Bangkok vs Pattaya */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    {isTh ? 'เมืองที่ให้บริการ' : 'Service City'}
                  </label>
                  <div className="grid grid-cols-2 gap-2.5 max-w-md">
                    <button
                      type="button"
                      onClick={() => {
                        setAddrCity('Bangkok');
                        const defDist = BANGKOK_DISTRICTS[0];
                        const defSub = BANGKOK_DISTRICTS_TO_SUBDISTRICTS[defDist]?.[0];
                        setAddrDistrict(defDist);
                        setAddrSubdistrict(defSub?.name || '');
                        setAddrPostalCode(defSub?.code || '10110');
                      }}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                        addrCity === 'Bangkok'
                          ? 'border-sky-600 bg-sky-600 text-white shadow-xs'
                          : 'border-slate-300 bg-white text-slate-700'
                      }`}
                    >
                      <span>🏙️</span>
                      <span>{isTh ? 'กรุงเทพฯ (Bangkok)' : 'Bangkok'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAddrCity('Pattaya');
                        const firstPty = PATTAYA_SUBDISTRICTS_LIST[0];
                        if (firstPty) {
                          setAddrDistrict(firstPty.district);
                          setAddrSubdistrict(firstPty.name);
                          setAddrPostalCode(firstPty.code);
                        }
                      }}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                        addrCity === 'Pattaya'
                          ? 'border-sky-600 bg-sky-600 text-white shadow-xs'
                          : 'border-slate-300 bg-white text-slate-700'
                      }`}
                    >
                      <span>🏖️</span>
                      <span>{isTh ? 'พัทยา (Pattaya)' : 'Pattaya'}</span>
                    </button>
                  </div>
                </div>

                {/* Building / Condo Name with Autocomplete */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      {isTh ? 'ชื่อคอนโด / อาคาร / หมู่บ้าน / โรงแรม' : 'Condominium / Building / Hotel / Village Name'} <span className="text-rose-500">*</span>
                    </label>
                    <GoogleMapsCondoAutocomplete
                      value={addrCondoName}
                      city={addrCity}
                      onChange={(val, autoMatch) => {
                        setAddrCondoName(val);
                        if (autoMatch) applyAddressLocationUpdate(autoMatch);
                      }}
                      onSelectPlace={(place) => applyAddressLocationUpdate(place)}
                      apiKey={laundryStore.settings?.googleMapsApiKey || ''}
                      placeholder={isTh ? 'พิมพ์ชื่อคอนโด อาคาร หรือที่อยู่...' : 'Search condo, building, hotel or street address...'}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      {isTh ? 'ตึก / ชั้น / เลขห้อง' : 'Tower / Floor / Room No.'}
                    </label>
                    <input
                      type="text"
                      value={addrRoomNumber}
                      onChange={(e) => setAddrRoomNumber(e.target.value)}
                      placeholder={isTh ? 'เช่น Tower A, ห้อง 1804' : 'e.g. Tower A, Rm 1804'}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs sm:text-sm focus:ring-2 focus:ring-sky-500 outline-none"
                    />
                  </div>
                </div>

                {/* District / Subdistrict / Postal Code */}
                {addrCity === 'Bangkok' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        {isTh ? 'เขต (District)' : 'District (Khet)'}
                      </label>
                      <select
                        value={addrDistrict}
                        onChange={(e) => {
                          const d = e.target.value;
                          setAddrDistrict(d);
                          const subs = BANGKOK_DISTRICTS_TO_SUBDISTRICTS[d] || [];
                          if (subs.length > 0) {
                            setAddrSubdistrict(subs[0].name);
                            setAddrPostalCode(subs[0].code);
                          }
                        }}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-medium"
                      >
                        {BANGKOK_DISTRICTS.map(d => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        {isTh ? 'แขวง (Sub-district)' : 'Sub-district (Khwaeng)'}
                      </label>
                      <select
                        value={addrSubdistrict}
                        onChange={(e) => {
                          const s = e.target.value;
                          setAddrSubdistrict(s);
                          const found = (BANGKOK_DISTRICTS_TO_SUBDISTRICTS[addrDistrict] || []).find(item => item.name === s);
                          if (found) setAddrPostalCode(found.code);
                        }}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-medium"
                      >
                        {(BANGKOK_DISTRICTS_TO_SUBDISTRICTS[addrDistrict] || [{ name: addrSubdistrict || 'Central', code: addrPostalCode }]).map((s, i) => (
                          <option key={i} value={s.name}>{s.name} ({s.code})</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        {isTh ? 'รหัสไปรษณีย์' : 'Postal Code'}
                      </label>
                      <input
                        type="text"
                        value={addrPostalCode}
                        onChange={(e) => setAddrPostalCode(e.target.value.replace(/\D/g, ''))}
                        maxLength={5}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-mono font-bold"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        {isTh ? 'โซนพื้นที่พัทยา' : 'Pattaya Sub-district / Zone'}
                      </label>
                      <select
                        value={addrSubdistrict}
                        onChange={(e) => {
                          const s = e.target.value;
                          setAddrSubdistrict(s);
                          const found = PATTAYA_SUBDISTRICTS_LIST.find(p => p.name === s);
                          if (found) {
                            setAddrDistrict(found.district);
                            setAddrPostalCode(found.code);
                          }
                        }}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-medium"
                      >
                        {PATTAYA_SUBDISTRICTS_LIST.map((z, i) => (
                          <option key={i} value={z.name}>{z.name} ({z.code})</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        {isTh ? 'รหัสไปรษณีย์' : 'Postal Code'}
                      </label>
                      <input
                        type="text"
                        value={addrPostalCode}
                        onChange={(e) => setAddrPostalCode(e.target.value.replace(/\D/g, ''))}
                        maxLength={5}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-mono font-bold"
                      />
                    </div>
                  </div>
                )}

                {/* Google Maps Pin Picker */}
                <div className="bg-white p-3.5 rounded-2xl border border-slate-200">
                  <LocationPicker
                    value={addrGoogleMapsUrl}
                    onChange={(url) => setAddrGoogleMapsUrl(url)}
                    onLocationSelect={({ googleMapsUrl: newUrl, district: detectedDistrict }) => {
                      setAddrGoogleMapsUrl(newUrl);
                      if (detectedDistrict) setAddrDistrict(detectedDistrict);
                    }}
                    initialDistrict={addrDistrict}
                    label={isTh ? 'ปักหมุดตำแหน่งบน Google Maps หรือแชร์พิกัด GPS' : 'Pin Exact Location on Google Maps or Share GPS'}
                  />
                </div>

                {/* Juristic Dropoff & Primary Checkboxes */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-800">
                      <input
                        type="checkbox"
                        checked={addrLeaveWithJuristic}
                        onChange={(e) => setAddrLeaveWithJuristic(e.target.checked)}
                        className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500"
                      />
                      <span>
                        {isTh ? '🏢 อนุญาตให้ฝาก-รับผ้าที่นิติบุคคล / ล็อบบี้' : '🏢 Authorize Condo Juristic / Lobby Drop-off'}
                      </span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-800">
                      <input
                        type="checkbox"
                        checked={addrIsPrimary}
                        onChange={(e) => setAddrIsPrimary(e.target.checked)}
                        className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500"
                      />
                      <span>
                        {isTh ? '⭐ ตั้งเป็นที่อยู่หลัก (Default)' : '⭐ Set as Default Primary Address'}
                      </span>
                    </label>
                  </div>

                  <button
                    type="submit"
                    className="py-2.5 px-6 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-xs shadow-md transition"
                  >
                    {editingAddressId
                      ? (isTh ? '✓ บันทึกการแก้ไขที่อยู่' : '✓ Update Saved Address')
                      : (isTh ? '✓ บันทึกที่อยู่ใหม่' : '✓ Save Address to Profile')}
                  </button>
                </div>
              </form>
            )}

            {/* SAVED ADDRESSES LIST */}
            {addresses.length === 0 ? (
              <div className="p-8 text-center rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <p className="text-xs text-slate-500">
                  {isTh ? 'ยังไม่มีที่อยู่ที่บันทึกไว้ กรุณาเพิ่มที่อยู่สำหรับรับและส่งผ้า' : 'No saved addresses yet. Add your first pickup & delivery address.'}
                </p>
                <button
                  type="button"
                  onClick={handleOpenAddAddress}
                  className="px-4 py-2 rounded-xl bg-sky-600 text-white text-xs font-bold"
                >
                  {isTh ? '+ เพิ่มที่อยู่แรกของคุณ' : '+ Add Your First Address'}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {addresses.map((addr) => (
                  <div
                    key={addr.id}
                    className={`p-5 rounded-2xl border transition flex flex-col justify-between gap-4 ${
                      addr.isPrimary
                        ? 'bg-sky-50/50 border-sky-300 ring-1 ring-sky-400/30 shadow-xs'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="font-extrabold text-slate-900 text-sm">
                            {addr.label || addr.condoName || 'Saved Address'}
                          </span>
                          {addr.isPrimary && (
                            <span className="px-2 py-0.5 rounded-full bg-sky-600 text-white font-black text-[10px]">
                              {isTh ? '⭐ ที่อยู่หลัก' : '⭐ Default'}
                            </span>
                          )}
                          {getAddressTypeBadge(addr.addressType)}
                        </div>

                        <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-lg shrink-0">
                          {addr.city === 'Pattaya' ? '🏖️ Pattaya' : '🏙️ Bangkok'}
                        </span>
                      </div>

                      <div className="text-xs text-slate-700 font-semibold leading-relaxed">
                        🏢 {addr.condoName || addr.address}
                      </div>

                      <div className="text-[11px] text-slate-500 flex flex-wrap items-center gap-x-3 gap-y-1">
                        {addr.roomNumber && (
                          <span>
                            <strong>{isTh ? 'ห้อง/ชั้น:' : 'Unit:'}</strong> {addr.roomNumber}
                          </span>
                        )}
                        {addr.subdistrict && (
                          <span>• {addr.subdistrict}</span>
                        )}
                        {addr.district && (
                          <span>• {addr.district}</span>
                        )}
                        {addr.postalCode && (
                          <span className="font-mono font-bold text-slate-700">📮 {addr.postalCode}</span>
                        )}
                      </div>

                      <div className="pt-1 flex items-center justify-between text-[11px]">
                        <span className={addr.leaveWithJuristic !== false ? 'text-emerald-700 font-bold' : 'text-amber-700 font-bold'}>
                          {addr.leaveWithJuristic !== false
                            ? (isTh ? '✓ ฝากนิติบุคคล / ล็อบบี้คอนโด' : '✓ Juristic / Lobby Drop-off')
                            : (isTh ? '🤝 ส่งมอบกับคนขับโดยตรง' : '🤝 Meet Rider in Person')}
                        </span>

                        {addr.googleMapsUrl && (
                          <a
                            href={addr.googleMapsUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-sky-600 hover:text-sky-800 font-bold underline flex items-center gap-1"
                          >
                            <span>📍 Google Maps ↗</span>
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Card Actions */}
                    <div className="pt-3 border-t border-slate-200/70 flex items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleOpenEditAddress(addr)}
                          className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-bold border border-slate-200 transition"
                        >
                          {isTh ? '✏️ แก้ไข' : '✏️ Edit'}
                        </button>
                        {!addr.isPrimary && (
                          <button
                            type="button"
                            onClick={() => handleSetPrimaryAddress(addr.id)}
                            className="px-3 py-1.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 font-bold border border-sky-200 transition"
                          >
                            {isTh ? 'ตั้งเป็นค่าเริ่มต้น' : 'Set as Default'}
                          </button>
                        )}
                      </div>

                      {addresses.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleDeleteAddress(addr.id)}
                          className="px-2.5 py-1.5 rounded-xl text-rose-600 hover:bg-rose-50 font-bold transition"
                        >
                          {isTh ? '🗑️ ลบ' : '🗑️ Delete'}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Personal Contact & CRM Details Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/90 space-y-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                {isTh ? 'ข้อมูลการติดต่อเพิ่มเติม (CRM Profile)' : 'Personal Contact Preferences'}
              </h3>
              <p className="text-xs text-slate-500">
                {isTh ? 'อัปเดตชื่อเล่น เบอร์ติดต่อสำรอง และ LINE ID สำหรับการแจ้งเตือนสถานะผ้า' : 'Update your preferred nickname, secondary WhatsApp number, and LINE ID.'}
              </p>
            </div>

            <form onSubmit={handleSaveProfileDetails} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {isTh ? 'ชื่อเล่น (Nickname)' : 'Nickname / Preferred Name'}
                </label>
                <input
                  type="text"
                  value={nickName}
                  onChange={(e) => setNickName(e.target.value)}
                  placeholder={isTh ? 'เช่น Alex, Som' : 'e.g. Alex, Som'}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-sky-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {isTh ? 'เบอร์โทรศัพท์สำรอง / WhatsApp' : 'Secondary Phone / WhatsApp'}
                </label>
                <input
                  type="text"
                  value={secondaryMobile}
                  onChange={(e) => setSecondaryMobile(e.target.value)}
                  placeholder="+66 / +1 / +44..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-sky-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  LINE ID
                </label>
                <input
                  type="text"
                  value={lineId}
                  onChange={(e) => setLineId(e.target.value)}
                  placeholder="@line_id"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-sky-500 outline-none"
                />
              </div>

              <div className="sm:col-span-3 flex justify-end">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="py-2.5 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-sm transition"
                >
                  {isSaving
                    ? (isTh ? 'กำลังบันทึก...' : 'Saving...')
                    : (isTh ? '✓ บันทึกข้อมูลโปรไฟล์' : '✓ Save Profile Info')}
                </button>
              </div>
            </form>
          </div>
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
