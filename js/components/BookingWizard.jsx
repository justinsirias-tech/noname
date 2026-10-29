import React, { useState, useEffect } from 'react';
import { Icon } from './Icons.jsx';
import { BANGKOK_DISTRICTS, TIME_SLOTS, INITIAL_CATEGORIES } from '../data/servicesData.js';
import { 
  DISTRICT_TO_POSTAL_CODE, 
  BANGKOK_DISTRICTS_TO_SUBDISTRICTS, 
  PATTAYA_SUBDISTRICTS_LIST,
  SERVICE_CITIES,
  calculateDeliveryFee as calcDeliveryFeeDirect,
  DEFAULT_ALL_DELIVERY_ZONES
} from '../data/postalCodesData.js';
import { TermsModal } from './TermsModal.jsx';
import { getLineOaMessageUrl, getLineOaAddFriendUrl, getLineQrCodeUrl, laundryStore } from '../store.js';
import { CountryPhoneInput } from './CountryPhoneInput.jsx';
import GoogleMapsCondoAutocomplete from './GoogleMapsCondoAutocomplete.jsx';
import { useTranslation } from '../i18n.jsx';

export function BookingWizard({ services, categories: propCategories, initialServiceId, initialWeight, initialSelectedItems, initialTurnaroundSpeed, initialCustomer, initialCity, onBookingSuccess, onViewFullTerms }) {
  const { t, language } = useTranslation();
  // Support multi-service selection map: { [serviceId]: { weightKg, quantity } }
  // Starts empty unless pre-filled by customer selection
  const [selectedServicesMap, setSelectedServicesMap] = useState(() => {
    if (Array.isArray(initialSelectedItems) && initialSelectedItems.length > 0) {
      const map = {};
      initialSelectedItems.forEach(it => {
        if (it && it.id) {
          map[it.id] = {
            weightKg: Number(it.weight || it.estimatedWeightKg || it.minWeight || 4.0),
            quantity: Number(it.qty || it.quantity || 1)
          };
        }
      });
      if (Object.keys(map).length > 0) return map;
    }
    if (initialServiceId) {
      const defaultSrv = services.find(s => s.id === initialServiceId);
      const isPc = defaultSrv?.pricingType === 'piece' || defaultSrv?.unit === 'piece';
      return {
        [initialServiceId]: {
          weightKg: initialWeight || (isPc ? 1.0 : Number(defaultSrv?.minWeightKg || 4.0)),
          quantity: 1
        }
      };
    }
    return {};
  });

  const [activeCategory, setActiveCategory] = useState(() => {
    const cats = laundryStore.getCategories ? laundryStore.getCategories() : [];
    return cats[0]?.id || 'laundry_by_weight';
  });
  const [turnaroundSpeed, setTurnaroundSpeed] = useState(initialTurnaroundSpeed || 'standard_48h'); // 'standard_48h', 'next_day_24h', 'same_day'
  
  // Customer Info (First Name & Last Name required)
  const primaryAddr = initialCustomer?.addresses?.[0];
  const initFirst = initialCustomer?.firstName || (initialCustomer?.fullName ? initialCustomer.fullName.trim().split(' ')[0] : '');
  const initLast = initialCustomer?.lastName || (initialCustomer?.fullName ? initialCustomer.fullName.trim().split(' ').slice(1).join(' ') : '');
  const [firstName, setFirstName] = useState(initFirst);
  const [lastName, setLastName] = useState(initLast);
  const [customerName, setCustomerName] = useState(initialCustomer?.fullName || `${initFirst} ${initLast}`.trim());
  const [nickName, setNickName] = useState(initialCustomer?.nickName || '');
  const [mobileNumber, setMobileNumber] = useState(initialCustomer?.mobileNumber || '+66 ');
  const [contactChannel, setContactChannel] = useState(initialCustomer?.lineId ? 'line' : 'whatsapp');
  const [contactValue, setContactValue] = useState(initialCustomer?.lineId || initialCustomer?.mobileNumber || '+66 ');
  const [email, setEmail] = useState(initialCustomer?.email || '');

  // Real-time Mobile Number Check & Profile Autocomplete
  const [detectedCustomer, setDetectedCustomer] = useState(initialCustomer || null);
  const [isCheckingPhone, setIsCheckingPhone] = useState(false);

  // Automatically check mobile number against CRM while customer is filling details
  React.useEffect(() => {
    const cleanDigits = (mobileNumber || '').replace(/\D/g, '');
    if (cleanDigits.length < 8) {
      if (!initialCustomer) setDetectedCustomer(null);
      return;
    }

    // 1. Instant check in client-side laundryStore
    const localMatch = laundryStore.findCustomerByPhone ? laundryStore.findCustomerByPhone(mobileNumber) : null;
    if (localMatch) {
      setDetectedCustomer(localMatch);
      if (!firstName && localMatch.firstName) setFirstName(localMatch.firstName);
      if (!lastName && localMatch.lastName) setLastName(localMatch.lastName);
      if (!email && localMatch.email && !localMatch.email.includes('@customer.local')) setEmail(localMatch.email);
      if (!condoName && localMatch.addresses?.[0]?.label) {
        setCondoName(localMatch.addresses[0].label);
        if (localMatch.addresses[0].roomNumber) setRoomNumber(localMatch.addresses[0].roomNumber);
      }
      return;
    }

    // 2. Debounced API check against backend database
    setIsCheckingPhone(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/customers/check-mobile?phone=${encodeURIComponent(mobileNumber)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.exists && data.customer) {
            setDetectedCustomer(data.customer);
            if (!firstName && data.customer.firstName) setFirstName(data.customer.firstName);
            if (!lastName && data.customer.lastName) setLastName(data.customer.lastName);
            if (!email && data.customer.email && !data.customer.email.includes('@customer.local')) setEmail(data.customer.email);
            if (!condoName && data.customer.condoName) {
              setCondoName(data.customer.condoName);
              if (data.customer.roomNumber) setRoomNumber(data.customer.roomNumber);
            }
          } else {
            if (!initialCustomer) setDetectedCustomer(null);
          }
        }
      } catch (err) {
        console.warn('BookingWizard phone check error:', err);
      } finally {
        setIsCheckingPhone(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [mobileNumber]);

  // Thai Company Tax Info
  const [isCompanyTax, setIsCompanyTax] = useState(Boolean(initialCustomer?.companyTax?.required));
  const [companyName, setCompanyName] = useState(initialCustomer?.companyTax?.companyName || '');
  const [companyTaxId, setCompanyTaxId] = useState(initialCustomer?.companyTax?.taxId || '');
  const [companyBranch, setCompanyBranch] = useState(initialCustomer?.companyTax?.branch || 'Head Office (สำนักงานใหญ่)');

  // Service City & Address Info (Bangkok & Pattaya)
  const isPattayaInit = (initialCity === 'Pattaya') || (primaryAddr?.city === 'Pattaya');
  const [serviceCity, setServiceCity] = useState(isPattayaInit ? 'Pattaya' : 'Bangkok'); // 'Bangkok' | 'Pattaya'
  const [district, setDistrict] = useState(
    isPattayaInit ? (PATTAYA_SUBDISTRICTS_LIST[0]?.district || 'Bang Lamung') : BANGKOK_DISTRICTS[0]
  );
  const [subdistrict, setSubdistrict] = useState(
    isPattayaInit
      ? (PATTAYA_SUBDISTRICTS_LIST[0]?.name || 'Central Pattaya / Beach Rd')
      : (BANGKOK_DISTRICTS_TO_SUBDISTRICTS[BANGKOK_DISTRICTS[0]]?.[0]?.name || 'Khlong Toei Nuea')
  );
  const [postalCode, setPostalCode] = useState(
    isPattayaInit
      ? (PATTAYA_SUBDISTRICTS_LIST[0]?.code || '20150')
      : (BANGKOK_DISTRICTS_TO_SUBDISTRICTS[BANGKOK_DISTRICTS[0]]?.[0]?.code || '10110')
  );
  const [condoName, setCondoName] = useState(primaryAddr?.condoName || primaryAddr?.label || primaryAddr?.placeName || primaryAddr?.address || '');
  const [roomNumber, setRoomNumber] = useState(primaryAddr?.roomNumber || '');
  const [leaveWithJuristic, setLeaveWithJuristic] = useState(primaryAddr?.leaveWithJuristic !== false);
  const [selectedPickupAddressId, setSelectedPickupAddressId] = useState(primaryAddr?.id || '');
  const [selectedDeliveryAddressId, setSelectedDeliveryAddressId] = useState('SAME_AS_PICKUP');

  const savedCustomerAddresses = React.useMemo(() => {
    const raw = detectedCustomer?.addresses || initialCustomer?.addresses || [];
    return Array.isArray(raw) ? raw : [];
  }, [detectedCustomer, initialCustomer]);

  const applySavedPickupAddress = (addr) => {
    if (!addr) return;
    setSelectedPickupAddressId(addr.id || '');
    const isPty = addr.city === 'Pattaya' || (addr.postalCode && String(addr.postalCode).startsWith('20'));
    setServiceCity(isPty ? 'Pattaya' : 'Bangkok');
    setCondoName(addr.condoName || addr.label || addr.address || '');
    setRoomNumber(addr.roomNumber || '');
    setLeaveWithJuristic(addr.leaveWithJuristic !== false);
    const cleanDist = (addr.district || '').split(' (')[0].trim();
    if (isPty) {
      setDistrict(addr.district || 'Bang Lamung');
      setSubdistrict(addr.subdistrict || PATTAYA_SUBDISTRICTS_LIST[0]?.name || '');
      setPostalCode(addr.postalCode || '20150');
    } else {
      const matchedDist = BANGKOK_DISTRICTS.find(d => d.toLowerCase() === cleanDist.toLowerCase()) || BANGKOK_DISTRICTS[0] || 'Watthana';
      const subList = BANGKOK_DISTRICTS_TO_SUBDISTRICTS[matchedDist] || [];
      setDistrict(matchedDist);
      setSubdistrict(addr.subdistrict || subList[0]?.name || '');
      setPostalCode(addr.postalCode || subList[0]?.code || DISTRICT_TO_POSTAL_CODE[matchedDist] || '10110');
    }
  };

  // Automatically update City, District, Sub-district, Postal Code, and Delivery Fee when a location/building/house is entered
  const applyLocationUpdate = (loc) => {
    if (!loc) return;

    // 1. Detect and set City
    let targetCity = loc.city;
    if (!targetCity) {
      if ((loc.postalCode && loc.postalCode.startsWith('20')) || (loc.zipcode && loc.zipcode.startsWith('20'))) {
        targetCity = 'Pattaya';
      } else {
        targetCity = 'Bangkok';
      }
    }
    setServiceCity(targetCity);

    // 2. Set District, Sub-district, Postal Code based on City
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
      if (!ptySub) {
        ptySub = PATTAYA_SUBDISTRICTS_LIST[0];
      }
      if (ptySub) {
        setDistrict(ptySub.district);
        setSubdistrict(ptySub.name);
        setPostalCode(ptySub.code);
      }
    } else {
      // Bangkok
      let matchedDist = loc.district ? loc.district.split(' (')[0].trim() : '';
      if (!matchedDist && (loc.postalCode || loc.zipcode)) {
        const pCode = loc.postalCode || loc.zipcode;
        for (const [dName, subs] of Object.entries(BANGKOK_DISTRICTS_TO_SUBDISTRICTS)) {
          if (subs.some(s => s.code === pCode)) {
            matchedDist = dName;
            break;
          }
        }
      }
      if (!matchedDist) {
        matchedDist = district || 'Watthana';
      }
      if (!BANGKOK_DISTRICTS.includes(matchedDist)) {
        const found = BANGKOK_DISTRICTS.find(d => 
          d.toLowerCase() === matchedDist.toLowerCase() ||
          matchedDist.toLowerCase().includes(d.toLowerCase()) ||
          d.toLowerCase().includes(matchedDist.toLowerCase())
        );
        if (found) matchedDist = found;
        else matchedDist = 'Watthana';
      }

      let subList = BANGKOK_DISTRICTS_TO_SUBDISTRICTS[matchedDist] || [];
      let matchedSub = null;

      if (loc.subdistrict) {
        const cleanSub = loc.subdistrict.toLowerCase().replace(/^(khwaeng|tambon|subdistrict)\s+/i, '').trim();
        matchedSub = subList.find(s => {
          const sName = s.name.toLowerCase();
          const sNameTh = (s.nameTh || '').toLowerCase();
          return sName === cleanSub || sNameTh === cleanSub ||
                 cleanSub.includes(sName) || sName.includes(cleanSub);
        });

        // Cross-district subdistrict fallback
        if (!matchedSub) {
          for (const [dName, subs] of Object.entries(BANGKOK_DISTRICTS_TO_SUBDISTRICTS)) {
            const foundSub = subs.find(s => {
              const sName = s.name.toLowerCase();
              const sNameTh = (s.nameTh || '').toLowerCase();
              return sName === cleanSub || sNameTh === cleanSub ||
                     cleanSub.includes(sName) || sName.includes(cleanSub);
            });
            if (foundSub) {
              matchedDist = dName;
              subList = subs;
              matchedSub = foundSub;
              break;
            }
          }
        }
      }

      setDistrict(matchedDist);

      if (matchedSub) {
        setSubdistrict(matchedSub.name);
        setPostalCode(loc.postalCode || loc.zipcode || matchedSub.code);
      } else if (subList.length > 0) {
        setSubdistrict(subList[0].name);
        setPostalCode(loc.postalCode || loc.zipcode || subList[0].code || DISTRICT_TO_POSTAL_CODE[matchedDist] || '10110');
      } else {
        setPostalCode(loc.postalCode || loc.zipcode || DISTRICT_TO_POSTAL_CODE[matchedDist] || '10110');
      }
    }
  };

  // Schedule Info
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  const [pickupDate, setPickupDate] = useState(tomorrowStr);
  const [pickupTime, setPickupTime] = useState(TIME_SLOTS[0]);
  const [specialInstructions, setSpecialInstructions] = useState('');

  // Terms & Conditions States
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
  const [hasReviewedSummary, setHasReviewedSummary] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  
  // Validation Error State
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Completed Order Modal for LINE OA Connect & Booking Summary Receipt
  const [completedOrder, setCompletedOrder] = useState(null);
  const [showQrCode, setShowQrCode] = useState(false);
  const [copiedOrderId, setCopiedOrderId] = useState(false);
  const [copiedSummaryText, setCopiedSummaryText] = useState(false);

  const lineOaId = laundryStore.settings?.lineOaId || '@nonamelaundry';
  const safeServices = (Array.isArray(services) && services.length > 0) ? services : (laundryStore.services || []);
  const storeCategories = (Array.isArray(propCategories) && propCategories.length > 0)
    ? propCategories
    : (laundryStore.getCategories ? laundryStore.getCategories() : []);
  const categories = (Array.isArray(storeCategories) && storeCategories.length > 0) ? storeCategories : INITIAL_CATEGORIES;
  const currentCategory = (activeCategory && activeCategory !== 'all' && categories.some(c => c.id === activeCategory))
    ? activeCategory
    : (categories[0]?.id || 'laundry_by_weight');

  // Update selected services if initialSelectedItems or initialServiceId changes
  useEffect(() => {
    if (Array.isArray(initialSelectedItems) && initialSelectedItems.length > 0) {
      const map = {};
      initialSelectedItems.forEach(it => {
        if (it && it.id) {
          map[it.id] = {
            weightKg: Number(it.weight || it.estimatedWeightKg || it.minWeight || 4.0),
            quantity: Number(it.qty || it.quantity || 1)
          };
        }
      });
      if (Object.keys(map).length > 0) {
        setSelectedServicesMap(map);
        return;
      }
    }
    if (initialServiceId) {
      const srv = safeServices.find(s => s && s.id === initialServiceId);
      const isPc = srv?.pricingType === 'piece' || srv?.unit === 'piece';
      setSelectedServicesMap({
        [initialServiceId]: {
          weightKg: initialWeight || (isPc ? 1.0 : Number(srv?.minWeightKg || 4.0)),
          quantity: 1
        }
      });
    }
  }, [initialSelectedItems, initialServiceId, initialWeight]);

  useEffect(() => {
    if (initialCity === 'Pattaya') {
      setServiceCity('Pattaya');
      const firstPty = PATTAYA_SUBDISTRICTS_LIST[0];
      if (firstPty) {
        setDistrict(firstPty.district);
        setSubdistrict(firstPty.name);
        setPostalCode(firstPty.code);
      }
    } else if (initialCity === 'Bangkok') {
      setServiceCity('Bangkok');
      const defaultBkkDist = BANGKOK_DISTRICTS[0];
      const subList = BANGKOK_DISTRICTS_TO_SUBDISTRICTS[defaultBkkDist] || [];
      const defaultSub = subList[0];
      setDistrict(defaultBkkDist);
      setSubdistrict(defaultSub ? defaultSub.name : 'Khlong Toei Nuea');
      setPostalCode(defaultSub ? defaultSub.code : (DISTRICT_TO_POSTAL_CODE[defaultBkkDist] || '10110'));
    }
  }, [initialCity]);

  const handleToggleService = (srvId) => {
    const srv = services.find(s => s.id === srvId);
    if (!srv) return;
    const isPiece = srv.pricingType === 'piece' || srv.unit === 'piece';
    const defaultMin = Number(srv.minWeightKg || (isPiece ? 1.0 : 4.0));

    setSelectedServicesMap(prev => {
      if (prev[srvId]) {
        const next = { ...prev };
        delete next[srvId];
        return next;
      } else {
        return {
          ...prev,
          [srvId]: {
            weightKg: isPiece ? 1.0 : defaultMin,
            quantity: 1
          }
        };
      }
    });
  };

  const handleUpdateWeight = (srvId, newWeight) => {
    setSelectedServicesMap(prev => ({
      ...prev,
      [srvId]: {
        ...(prev[srvId] || {}),
        weightKg: Math.max(1, parseFloat(newWeight) || 1)
      }
    }));
  };

  const handleUpdateQuantity = (srvId, delta) => {
    setSelectedServicesMap(prev => {
      const current = prev[srvId]?.quantity || 1;
      const nextQty = Math.max(1, current + delta);
      return {
        ...prev,
        [srvId]: {
          ...(prev[srvId] || {}),
          quantity: nextQty
        }
      };
    });
  };

  const handleRemoveService = (srvId) => {
    setSelectedServicesMap(prev => {
      const next = { ...prev };
      delete next[srvId];
      return next;
    });
  };

  // Turnaround speed: Standard (2 Days), Next Day, or Same Day
  let activeSpeed = turnaroundSpeed;
  if (!['standard_48h', 'next_day_24h', 'same_day'].includes(activeSpeed)) {
    if (activeSpeed === 'next_day') activeSpeed = 'next_day_24h';
    else activeSpeed = 'standard_48h';
  }

  // Calculate detailed entries for all selected services
  const selectedEntries = Object.keys(selectedServicesMap).map(id => {
    const srv = safeServices.find(s => s && s.id === id);
    if (!srv) return null;
    const isPiece = srv.pricingType === 'piece' || srv.unit === 'piece';
    const unitLabel = isPiece ? (srv.unit || 'piece') : 'KG';
    const minWeight = Number(srv.minWeightKg || (isPiece ? 1.0 : 4.0));
    const stdRate = Number(srv.standardPricePerKg || srv.pricePerKg || (srv.id === 'wash_fold' ? 70 : 70));
    const nextRate = Number(srv.nextDayPricePerKg || Math.round(stdRate * 1.3));
    const sameRate = Number(srv.sameDayPricePerKg || Math.round(stdRate * 1.75));

    let itemRate = stdRate;
    if (activeSpeed === 'same_day') itemRate = sameRate;
    else if (activeSpeed === 'next_day_24h') itemRate = nextRate;

    const qty = selectedServicesMap[id]?.quantity || 1;
    const weight = selectedServicesMap[id]?.weightKg || minWeight;
    const billable = isPiece ? qty : Math.max(weight, minWeight);
    const subtotal = Math.round(billable * itemRate);

    return {
      ...srv,
      isPiece,
      unitLabel,
      minWeight,
      stdRate,
      nextRate,
      sameRate,
      rate: itemRate,
      qty,
      weight,
      billable,
      subtotal
    };
  }).filter(Boolean);

  const primaryService = selectedEntries[0] || safeServices[0] || { id: 'wash_fold', name: 'Wash / Fold', unitLabel: 'KG', rate: 70 };
  const estimatedTotal = selectedEntries.reduce((sum, item) => sum + item.subtotal, 0);
  const totalWeightKg = selectedEntries.filter(i => !i.isPiece).reduce((sum, i) => sum + i.billable, 0);
  const totalPieces = selectedEntries.filter(i => i.isPiece).reduce((sum, i) => sum + i.qty, 0);
  const activeZonesList = (laundryStore.postalCodeRates && laundryStore.postalCodeRates.length > 0)
    ? laundryStore.postalCodeRates
    : DEFAULT_ALL_DELIVERY_ZONES;
  const rawDeliveryInfo = calcDeliveryFeeDirect({
    city: serviceCity,
    district,
    subdistrict,
    postalCode
  }, estimatedTotal, activeZonesList, laundryStore.deliveryConfig);
  const deliveryInfo = selectedEntries.length === 0
    ? { ...rawDeliveryInfo, fee: 0, isFree: false }
    : rawDeliveryInfo;
  const grandEstimatedTotal = estimatedTotal + deliveryInfo.fee;

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (selectedEntries.length === 0) {
      setErrorMessage(language === 'th' ? 'กรุณาเลือกบริการอย่างน้อย 1 รายการ' : 'Please select at least one service to book.');
      return;
    }

    if (!firstName.trim()) {
      setErrorMessage(language === 'th' ? 'กรุณากรอกชื่อจริง' : 'Please enter your First Name.');
      return;
    }

    if (!lastName.trim()) {
      setErrorMessage(language === 'th' ? 'กรุณากรอกนามสกุล' : 'Please enter your Last Name.');
      return;
    }

    const cleanMobile = (mobileNumber || '').replace(/[^0-9]/g, '');
    if (cleanMobile.length < 8) {
      setErrorMessage(language === 'th' ? 'กรุณากรอกเบอร์โทรศัพท์ที่ถูกต้อง' : 'Please enter a valid primary mobile number.');
      return;
    }

    if (!email.trim() || !email.includes('@')) {
      setErrorMessage(language === 'th' ? 'กรุณากรอกอีเมลที่ถูกต้องสำหรับรับใบแจ้งหนี้และอัปเดตสถานะ' : 'A valid email address is required for sending invoices, booking confirmations, and delivery updates.');
      return;
    }

    if (!contactValue.trim()) {
      setErrorMessage(`Please enter your ${contactChannel.toUpperCase()} contact handle or number.`);
      return;
    }

    if (!condoName.trim()) {
      setErrorMessage(`Please enter your ${serviceCity} condominium, hotel, building, or villa name.`);
      return;
    }

    // Strict requirement: User must agree to Terms & Conditions
    if (!agreedToTerms) {
      setErrorMessage('You must review and check the box agreeing to the Terms and Conditions (including the Online-Only Support policy) before submitting.');
      return;
    }

    setIsSubmitting(true);

    const items = selectedEntries.map(item => ({
      serviceId: item.id,
      serviceName: item.name,
      pricingType: item.isPiece ? 'piece' : 'weight',
      unit: item.unitLabel,
      pricePerKg: item.rate,
      quantity: item.qty,
      estimatedWeightKg: item.isPiece ? null : item.weight,
      billableAmount: item.billable,
      subtotal: item.subtotal
    }));

    const combinedCustomerName = `${firstName.trim()} ${lastName.trim()}`.trim();
    const effectiveContactValue = contactChannel === 'whatsapp' ? (contactValue.trim() || mobileNumber.trim()) : contactValue.trim();

    const formattedPickupAddr = `${condoName.trim()}${roomNumber.trim() ? ` (${roomNumber.trim()})` : ''}, ${subdistrict ? `${subdistrict}, ` : ''}${district}, ${serviceCity} ${postalCode}`.trim();
    const matchedDeliveryObj = selectedDeliveryAddressId !== 'SAME_AS_PICKUP'
      ? savedCustomerAddresses.find(a => a.id === selectedDeliveryAddressId)
      : null;
    const formattedDeliveryAddr = matchedDeliveryObj
      ? `${matchedDeliveryObj.condoName || matchedDeliveryObj.label || matchedDeliveryObj.address}${matchedDeliveryObj.roomNumber ? ` (${matchedDeliveryObj.roomNumber})` : ''}, ${matchedDeliveryObj.district || serviceCity}`
      : formattedPickupAddr;

    const bookingPayload = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      customerName: combinedCustomerName,
      customerId: detectedCustomer?.id || initialCustomer?.id || null,
      nickName: (nickName || firstName).trim(),
      mobileNumber: mobileNumber.trim(),
      contactChannel,
      contactValue: effectiveContactValue,
      email: email.trim().toLowerCase(),
      serviceId: primaryService.id,
      serviceName: selectedEntries.map(i => i.name).join(' + '),
      items,
      turnaroundSpeed: activeSpeed,
      city: serviceCity,
      district,
      subdistrict,
      postalCode,
      condoName: condoName.trim(),
      roomNumber: roomNumber.trim(),
      pickupAddress: formattedPickupAddr,
      deliveryAddress: formattedDeliveryAddr,
      leaveWithJuristic,
      handoverMethod: leaveWithJuristic ? 'juristic' : 'in_person',
      estimatedWeightKg: totalWeightKg > 0 ? totalWeightKg : null,
      quantity: totalPieces > 0 ? totalPieces : (totalWeightKg || 1),
      unit: selectedEntries.length === 1 ? primaryService.unitLabel : 'bundle',
      categoryId: primaryService.categoryId || 'laundry_by_weight',
      pricePerKg: primaryService.rate,
      serviceSubtotal: estimatedTotal,
      deliveryFee: deliveryInfo.fee,
      totalPrice: grandEstimatedTotal,
      pickupDate,
      pickupTime,
      deliveryDate: activeSpeed === 'same_day'
        ? 'Same Day (Delivered before 18:00)'
        : activeSpeed === 'next_day_24h' 
          ? 'Scheduled Next Day' 
          : 'Scheduled in 2 Days (Standard)',
      deliveryTime: activeSpeed === 'same_day'
        ? 'Before 18:00 hrs'
        : activeSpeed === 'next_day_24h' 
          ? '18:00 - 20:30 (Evening Rush)' 
          : '16:00 - 18:00 (Early Evening)',
      specialInstructions: specialInstructions.trim(),
      companyTax: isCompanyTax ? {
        required: true,
        companyName: companyName.trim(),
        taxId: companyTaxId.trim(),
        branch: companyBranch.trim(),
        companyAddress: `${condoName.trim()}, ${district}, Bangkok`
      } : { required: false }
    };

    setTimeout(() => {
      // Save order in store
      const order = laundryStore.createOrder(bookingPayload);
      setCompletedOrder(order);
      setIsSubmitting(false);
    }, 400);
  };

  const lineMessageText = completedOrder 
    ? `Hi NoName Laundry, I just booked order ${completedOrder.id} (${completedOrder.customerName}) for ${completedOrder.serviceName}. Please link my order for updates!`
    : `Hi NoName Laundry, I want to link my booking.`;

  const lineDeepLink = getLineOaAddFriendUrl(lineOaId);
  const lineAddFriendLink = getLineOaAddFriendUrl(lineOaId);
  const lineQrCodeUrl = getLineQrCodeUrl(lineOaId);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Terms Summary Review Modal */}
      <TermsModal
        isOpen={isTermsModalOpen}
        onClose={() => setIsTermsModalOpen(false)}
        onAcknowledge={() => {
          setHasReviewedSummary(true);
          setAgreedToTerms(true);
        }}
        onViewFullTerms={onViewFullTerms}
      />

      {/* POST-BOOKING COMPREHENSIVE SUMMARY RECEIPT MODAL */}
      {completedOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-5 sm:p-8 shadow-2xl border border-slate-100 space-y-6 text-slate-800 max-h-[92vh] overflow-y-auto">
            
            {/* Header with Success Badge & Tracking ID */}
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                <Icon name="check" className="w-7 h-7" />
              </div>

              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                  <span>{language === 'th' ? 'ยืนยันการจองเรียบร้อย • กำหนดเวลารับผ้าแล้ว' : 'Booking Confirmed • Pick-up Scheduled'}</span>
                </span>
                <h3 className="text-2xl font-black text-slate-900 mt-1">
                  {language === 'th' ? `ขอบคุณ คุณ ${completedOrder.customerName || 'ลูกค้า'}!` : `Thank You, ${completedOrder.customerName || 'Customer'}!`}
                </h3>
                <p className="text-xs text-slate-500">
                  {language === 'th' ? 'รายการจองรับผ้าของคุณถูกส่งต่อไปยังทีมงานเรียบร้อยแล้ว' : 'Your laundry pickup request has been dispatched to our operations team.'}
                </p>
              </div>

              {/* Order Tracking Reference Card with Copy */}
              <div className="p-3 bg-sky-50 rounded-2xl border border-sky-200 flex flex-wrap items-center justify-between gap-3 text-left">
                <div>
                  <span className="text-[10px] text-sky-800 uppercase font-bold tracking-wider block">
                    {language === 'th' ? 'รหัสอ้างอิงการจอง & ติดตามสถานะสด' : 'Booking Reference & Live Tracking ID'}
                  </span>
                  <span className="text-lg font-black font-mono text-sky-950">{completedOrder.id}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (navigator?.clipboard?.writeText) {
                        navigator.clipboard.writeText(completedOrder.id);
                        setCopiedOrderId(true);
                        setTimeout(() => setCopiedOrderId(false), 2000);
                      }
                    }}
                    className="px-3 py-1.5 rounded-xl bg-white border border-sky-300 text-sky-800 hover:bg-sky-100 text-xs font-bold shadow-2xs transition flex items-center gap-1.5"
                  >
                    <Icon name={copiedOrderId ? "check" : "copy"} className="w-3.5 h-3.5" />
                    <span>{copiedOrderId ? (language === 'th' ? 'คัดลอกรหัสแล้ว!' : 'Copied ID!') : (language === 'th' ? 'คัดลอกรหัส' : 'Copy ID')}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="px-3 py-1.5 rounded-xl bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-bold shadow-2xs transition flex items-center gap-1.5"
                    title={language === 'th' ? 'พิมพ์หรือบันทึกเป็น PDF' : 'Print or Save Summary as PDF'}
                  >
                    <Icon name="fileText" className="w-3.5 h-3.5" />
                    <span>{language === 'th' ? 'พิมพ์ / บันทึก' : 'Print / Save'}</span>
                  </button>
                </div>
              </div>

              {completedOrder.email && (
                <div className="p-2.5 rounded-xl bg-blue-50/70 border border-blue-200 text-left text-xs text-blue-900 flex items-center gap-2">
                  <Icon name="mail" className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>
                    {language === 'th' ? (
                      <>ใบเสร็จยืนยันและรายละเอียดรายการได้ถูกส่งไปยังอีเมล <strong>{completedOrder.email}</strong> เรียบร้อยแล้ว</>
                    ) : (
                      <>A detailed confirmation receipt and itemized breakdown has been emailed to <strong>{completedOrder.email}</strong>.</>
                    )}
                  </span>
                </div>
              )}
            </div>

            {/* 1. Itemized Booking Summary Table */}
            <div className="rounded-2xl border border-slate-200 overflow-hidden bg-slate-50/50">
              <div className="bg-slate-100/80 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Icon name="package" className="w-3.5 h-3.5 text-sky-600" />
                  <span>{language === 'th' ? 'สรุปรายการคำสั่งซื้อ' : 'Itemized Booking Summary'}</span>
                </span>
                <span className="text-[10px] text-slate-500 font-semibold">
                  {language === 'th' ? 'ราคาตามที่ระบุบนเว็บไซต์' : 'Prices as set on website'}
                </span>
              </div>

              <div className="p-4 space-y-3">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="text-[10px] text-slate-400 uppercase font-semibold border-b border-slate-200">
                      <th className="pb-2 font-bold">{language === 'th' ? 'บริการ / รายการ' : 'Service / Item'}</th>
                      <th className="pb-2 font-bold text-center">{language === 'th' ? 'การคิดราคา' : 'Pricing'}</th>
                      <th className="pb-2 font-bold text-right">{language === 'th' ? 'อัตราต่อหน่วย' : 'Unit Rate'}</th>
                      <th className="pb-2 font-bold text-right">{language === 'th' ? 'ประมาณการ' : 'Est. Qty / Wt'}</th>
                      <th className="pb-2 font-bold text-right">{language === 'th' ? 'ยอดรวม' : 'Subtotal'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {Array.isArray(completedOrder.items) && completedOrder.items.length > 0 ? (
                      completedOrder.items.map((it, idx) => {
                        const isPiece = it.pricingType === 'piece' || it.unit === 'piece';
                        const itName = (language === 'th' && (it.nameTh || it.serviceNameTh)) ? (it.nameTh || it.serviceNameTh) : (it.name || it.serviceName);
                        return (
                          <tr key={idx} className="hover:bg-white/60">
                            <td className="py-2 font-semibold text-slate-900">
                              {itName}
                            </td>
                            <td className="py-2 text-center">
                              <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold ${
                                isPiece ? 'bg-purple-100 text-purple-800' : 'bg-sky-100 text-sky-800'
                              }`}>
                                {isPiece ? (language === 'th' ? 'คิดเป็นชิ้น' : 'Per Piece') : (language === 'th' ? 'คิดตามน้ำหนัก' : 'By Weight')}
                              </span>
                            </td>
                            <td className="py-2 text-right font-mono text-slate-600">
                              ฿{it.rate || it.pricePerKg} {isPiece ? (language === 'th' ? '/ ชิ้น' : '/ pc') : (language === 'th' ? '/ กก.' : '/ KG')}
                            </td>
                            <td className="py-2 text-right font-mono text-slate-600">
                              {isPiece ? `${it.quantity || 1} ${language === 'th' ? 'ชิ้น' : 'pcs'}` : `${it.estimatedWeightKg || it.billableAmount} ${language === 'th' ? 'กก.' : 'KG'}`}
                            </td>
                            <td className="py-2 text-right font-mono font-bold text-slate-900">
                              ฿{it.subtotal || Math.round((it.quantity || it.billableAmount || 1) * (it.rate || it.pricePerKg))} THB
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td className="py-2 font-semibold text-slate-900">{completedOrder.serviceName}</td>
                        <td className="py-2 text-center">
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-sky-100 text-sky-800">
                            {language === 'th' ? 'คิดตามน้ำหนัก' : 'By Weight'}
                          </span>
                        </td>
                        <td className="py-2 text-right font-mono text-slate-600">฿{completedOrder.pricePerKg} / {language === 'th' ? 'กก.' : 'KG'}</td>
                        <td className="py-2 text-right font-mono text-slate-600">{completedOrder.estimatedWeightKg} {language === 'th' ? 'กก.' : 'KG'}</td>
                        <td className="py-2 text-right font-mono font-bold text-slate-900">฿{completedOrder.serviceSubtotal} THB</td>
                      </tr>
                    )}
                  </tbody>
                  <tfoot>
                    <tr className="border-t border-slate-200 text-xs">
                      <td colSpan="4" className="pt-2 text-right text-slate-500 font-medium">
                        {language === 'th' ? 'ยอดรวมค่าบริการ:' : 'Services Subtotal:'}
                      </td>
                      <td className="pt-2 text-right font-mono font-bold text-slate-900">฿{completedOrder.serviceSubtotal} THB</td>
                    </tr>
                    <tr className="text-xs">
                      <td colSpan="4" className="py-1 text-right text-slate-500 font-medium">
                        {language === 'th' ? 'ค่าจัดส่ง' : 'Delivery'} ({completedOrder.city === 'Pattaya' ? (language === 'th' ? 'พัทยา' : 'Pattaya') : (language === 'th' ? 'กรุงเทพฯ' : 'Bangkok')} · {completedOrder.subdistrict || completedOrder.district}):
                      </td>
                      <td className="py-1 text-right font-mono font-bold text-slate-900">
                        {Number(completedOrder.deliveryFee) > 0 ? `฿${completedOrder.deliveryFee} THB` : <span className="text-emerald-600">{language === 'th' ? 'ฟรี' : 'FREE'}</span>}
                      </td>
                    </tr>
                    <tr className="border-t border-slate-300 text-sm font-black text-slate-900">
                      <td colSpan="4" className="pt-2.5 text-right">
                        {language === 'th' ? 'ยอดประเมินรวมทั้งสิ้น:' : 'Grand Estimated Total:'}
                      </td>
                      <td className="pt-2.5 text-right font-mono text-sky-900 text-base">฿{completedOrder.totalPrice} THB</td>
                    </tr>
                  </tfoot>
                </table>
                <p className="text-[10px] text-slate-400 italic">
                  {language === 'th'
                    ? '* หมายเหตุ: สำหรับบริการซักตามน้ำหนัก ยอดรวมสุดท้ายจะคำนวณตามน้ำหนักจริงจากเครื่องชั่งดิจิทัลที่ผ่านการสอบเทียบ ณ ศูนย์ซัก และออกใบแจ้งหนี้ก่อนนำส่งคืน'
                    : '* Note: For weight-based laundry, final bill is verified on our calibrated digital scale upon intake. Cashless invoice is issued before return delivery.'}
                </p>
              </div>
            </div>

            {/* 2. Schedule, Address & Handover Logistics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-left">
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                  {language === 'th' ? 'ข้อมูลการรับ-ส่งผ้า' : 'Pickup & Delivery Logistics'}
                </span>
                <div>
                  <strong className="text-slate-900 block font-bold">
                    {language === 'th' ? '📅 รอบเวลารับผ้า:' : '📅 Pickup Window:'}
                  </strong>
                  <span className="text-slate-700">{completedOrder.pickupDate} • {completedOrder.pickupTime}</span>
                </div>
                <div>
                  <strong className="text-slate-900 block font-bold">
                    {language === 'th' ? '🕒 ความเร็วบริการ:' : '🕒 Target Turnaround:'}
                  </strong>
                  <span className="text-slate-700">
                    {completedOrder.turnaroundSpeed === 'same_day'
                      ? (language === 'th' ? 'ส่งด่วนวันเดียว' : 'Same Day Turnaround')
                      : (completedOrder.turnaroundSpeed === 'next_day_24h' || completedOrder.turnaroundSpeed === 'next_day')
                        ? (language === 'th' ? 'วันถัดไป (24 ชม.)' : 'Next Day Turnaround') 
                        : (language === 'th' ? 'มาตรฐาน (2 วัน)' : 'Standard Turnaround (2 Days)')}
                  </span>
                  <span className="text-[11px] text-slate-500 block">
                    {completedOrder.deliveryDate} • {completedOrder.deliveryTime}
                  </span>
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                  {language === 'th' ? 'ที่อยู่และรูปแบบการส่งมอบผ้า' : 'Address & Handover Method'}
                </span>
                <div>
                  <strong className="text-slate-900 block font-bold">
                    {language === 'th' ? '📍 สถานที่:' : '📍 Location:'}
                  </strong>
                  <span className="text-slate-700 block">
                    {completedOrder.condoName}{completedOrder.roomNumber ? `, ${language === 'th' ? 'ห้อง' : 'Room'} ${completedOrder.roomNumber}` : ''}
                  </span>
                  <span className="text-[11px] text-slate-500 block">
                    {completedOrder.subdistrict || completedOrder.district}, {completedOrder.district}, {completedOrder.city === 'Pattaya' ? (language === 'th' ? 'พัทยา' : 'Pattaya') : (language === 'th' ? 'กรุงเทพฯ' : 'Bangkok')} {completedOrder.postalCode}
                  </span>
                </div>
                <div>
                  <strong className="text-slate-900 block font-bold">
                    {language === 'th' ? '🤝 การส่งมอบผ้า:' : '🤝 Handover Preference:'}
                  </strong>
                  <span className="text-slate-700">
                    {completedOrder.leaveWithJuristic 
                      ? (language === 'th' ? '🏢 ฝากที่นิติบุคคล / ล็อบบี้คอนโด' : '🏢 Leave with Juristic / Condo Front Desk') 
                      : (language === 'th' ? '🤝 ส่งมอบกับคนขับโดยตรง (ขึ้นอยู่กับคิวคนขับ)' : '🤝 Meet in person (Subject to rider availability)')}
                  </span>
                </div>
              </div>
            </div>

            {/* 3. Official LINE OA & Support Channels */}
            <div className="bg-green-50/80 rounded-2xl p-4 sm:p-5 border-2 border-green-500/40 text-left space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-green-500 text-white flex items-center justify-center font-bold shrink-0">
                  <Icon name="line" className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-green-950">
                    {language === 'th'
                      ? 'เชื่อมต่อ LINE Official เพื่อรับภาพถ่ายเครื่องชั่งน้ำหนักและอัปเดตสถานะ'
                      : 'Connect on LINE Official Account for Live Photo Updates'}
                  </h4>
                  <span className="text-[11px] text-green-700 font-semibold font-mono">
                    {lineOaId}
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-700 leading-relaxed">
                {language === 'th'
                  ? 'เนื่องจากนโยบายความเป็นส่วนตัวของ LINE ในประเทศไทย ร้านค้าไม่สามารถทักหาลูกค้าก่อนได้ แตะปุ่มด้านล่างเพื่อส่งรหัสการจองไปยัง LINE OA ของเรา เพื่อให้เราสามารถส่งรูปถ่ายเครื่องชั่งดิจิทัลและแจ้งเวลาจัดส่งให้คุณได้ทันที!'
                  : 'Due to LINE privacy regulations in Thailand, businesses cannot initiate messages directly. Tap below to send your Booking ID to our LINE OA so we can send your digital scale photos and delivery ETA!'}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <a
                  href={lineDeepLink}
                  target="_blank"
                  rel="noreferrer"
                  className="py-3 px-4 rounded-xl bg-green-600 hover:bg-green-500 text-white font-extrabold text-xs shadow-md transition flex items-center justify-center gap-2 text-center"
                >
                  <Icon name="line" className="w-4 h-4" />
                  <span>{language === 'th' ? `เพิ่มเพื่อน LINE OA (${lineOaId})` : `Add LINE OA (${lineOaId})`}</span>
                </a>

                <a
                  href={`https://wa.me/66808889885?text=${encodeURIComponent(
`🧺 NoName Laundry Bangkok
Booking Confirmation #${completedOrder.id}

Hello, I have submitted booking #${completedOrder.id} for ${completedOrder.customerName}.
• Service: ${completedOrder.serviceName}
• Pickup: ${completedOrder.pickupDate} (${completedOrder.pickupTime})
• Address: ${completedOrder.condoName || ''}${completedOrder.roomNumber ? `, Room ${completedOrder.roomNumber}` : ''}

Please confirm our pickup schedule. Thank you!`
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-md transition flex items-center justify-center gap-2 text-center"
                >
                  <Icon name="messageCircle" className="w-4 h-4" />
                  <span>WhatsApp (+66 80 888 9885)</span>
                </a>
              </div>

              {/* Copy Booking Summary Button */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => {
                    const text = `🧺 NoName Laundry Bangkok\nBooking Confirmation #${completedOrder.id}\n\nHello ${completedOrder.customerName},\nYour laundry pickup has been scheduled!\n\n• Order ID: #${completedOrder.id}\n• Service: ${completedOrder.serviceName}\n• Pickup Schedule: ${completedOrder.pickupDate} (${completedOrder.pickupTime})\n• Address: ${completedOrder.condoName || ''}${completedOrder.roomNumber ? `, Room ${completedOrder.roomNumber}` : ''}\n• Handover: ${completedOrder.leaveWithJuristic ? 'Leave with Juristic' : 'Meet in Person'}\n\nOur rider will collect your laundry bag as scheduled. Once weighed on our digital scale at our facility, we will send your confirmed billing & cashless payment link.\n\nNeed assistance? Phone / WhatsApp: +66 80 888 9885 • LINE: @nonamelaundry`;
                    if (navigator?.clipboard?.writeText) {
                      navigator.clipboard.writeText(text);
                      setCopiedSummaryText(true);
                      setTimeout(() => setCopiedSummaryText(false), 2500);
                    }
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 font-bold text-xs shadow-2xs transition flex items-center justify-center gap-2 text-center"
                >
                  <Icon name="copy" className="w-4 h-4 text-slate-500" />
                  <span>
                    {copiedSummaryText 
                      ? (language === 'th' ? 'คัดลอกสรุปรายการแล้ว! ✓' : 'Copied Booking Summary! ✓') 
                      : (language === 'th' ? '📋 คัดลอกสรุปข้อมูลการจอง' : '📋 Copy Booking Summary')}
                  </span>
                </button>
              </div>

              {/* QR Code Toggle for Desktop Users */}
              <div className="pt-1 text-center">
                <button
                  type="button"
                  onClick={() => setShowQrCode(!showQrCode)}
                  className="text-xs text-green-800 hover:text-green-950 font-bold inline-flex items-center gap-1 underline underline-offset-2"
                >
                  <span>
                    {showQrCode 
                      ? (language === 'th' ? 'ซ่อน QR Code' : 'Hide QR Code') 
                      : (language === 'th' ? 'อยู่บนคอมพิวเตอร์? สแกน QR Code ด้วยมือถือ' : 'On Desktop? Scan QR Code with Phone Camera')}
                  </span>
                  <Icon name="chevronRight" className="w-3.5 h-3.5" />
                </button>

                {showQrCode && (
                  <div className="mt-4 p-4 bg-white rounded-2xl border border-green-300 inline-block shadow-md">
                    <img
                      src={lineQrCodeUrl}
                      alt="Scan to Add LINE OA @nonamelaundry"
                      className="w-44 h-44 mx-auto rounded-lg"
                    />
                    <p className="text-[11px] text-slate-500 mt-2 font-mono">
                      {language === 'th' ? 'สแกนเพื่อเพิ่มเพื่อน' : 'Scan to add'} <strong>{lineOaId}</strong>
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Direct Phone Support Notice */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="text-slate-600">
                {language === 'th'
                  ? 'ต้องการความช่วยเหลือด่วน หรือเปลี่ยนเวลารับผ้า? โทรหาเรา:'
                  : 'Need urgent assistance or change pickup time? Call Phone Support:'}
              </span>
              <a
                href="tel:+66808889885"
                className="font-bold text-sky-700 hover:text-sky-900 inline-flex items-center gap-1"
              >
                <Icon name="phone" className="w-3.5 h-3.5 text-sky-600" />
                <span>+66 80 888 9885</span>
              </a>
            </div>

            {/* Bottom Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => onBookingSuccess(completedOrder)}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-1.5 whitespace-nowrap"
              >
                <span>{language === 'th' ? 'เสร็จสิ้น • กลับสู่หน้าหลัก' : 'Done • Return to Home'}</span>
                <Icon name="chevronRight" className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Header Banner */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-100 text-sky-800 text-xs font-bold mb-2">
          <span>{serviceCity === 'Pattaya' ? '🏖️ Pattaya Digital Laundry' : '🏙️ Bangkok Digital Laundry'}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          {t('bwTitle')}
        </h1>
        <p className="text-sm text-slate-600 mt-2">
          {t('bwSubtitle')}
        </p>
        <div className="mt-4 p-3.5 sm:p-4 rounded-2xl bg-amber-50 border-2 border-amber-300 text-amber-950 flex items-center gap-3 shadow-xs">
          <span className="w-8 h-8 rounded-xl bg-amber-500 text-white font-black text-sm flex items-center justify-center shrink-0 shadow-2xs">
            4KG
          </span>
          <p className="text-xs sm:text-sm font-extrabold tracking-tight">
            {language === 'th'
              ? 'กรุณาอ่านก่อนทำการจอง: บริการซักผ้าทุกรายการคิดค่าบริการขั้นต่ำที่ 4 กิโลกรัม (4KG)'
              : 'Please note before booking: All laundry services have a minimum charge of 4KG.'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Step 1: Select Service & Weight / Quantity */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-sky-600 text-white font-bold text-xs flex items-center justify-center">1</span>
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  {language === 'th' ? 'เลือกบริการและความเร็วการจัดส่ง' : 'Choose Services & Turnaround'}
                </h2>
                <p className="text-xs text-slate-500">
                  {language === 'th' ? 'เลือกระดับความเร็ว จากนั้นแตะเลือกบริการที่ต้องการ (บริการซักผ้าทุกรายการมีขั้นต่ำ 4KG)' : 'Pick turnaround speed, then tap the services you need. All laundry services have a minimum charge of 4KG.'}
                </p>
              </div>
            </div>
            {selectedEntries.length > 0 && (
              <span className="px-3 py-1 rounded-full bg-sky-100 text-sky-800 text-xs font-bold">
                {selectedEntries.length} {language === 'th' ? 'รายการในคำสั่งซื้อ' : (selectedEntries.length === 1 ? 'item' : 'items')} • ฿{estimatedTotal}
              </span>
            )}
          </div>

          {/* 1. Turnaround Speed Segment Bar */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
              {language === 'th' ? 'ระดับความเร็วบริการ *' : 'Turnaround Speed *'}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {[
                { 
                  id: 'standard_48h', 
                  label: language === 'th' ? '🕒 มาตรฐาน (2 วัน)' : '🕒 Standard (2 Days)', 
                  tag: language === 'th' ? 'ราคาปกติ' : 'Base Rate', 
                  desc: language === 'th' ? 'จัดส่งคืนภายใน 2 วัน' : 'Returned clean in 2 days' 
                },
                { 
                  id: 'next_day_24h', 
                  label: language === 'th' ? '⚡ วันถัดไป (24 ชม.)' : '⚡ Next Day', 
                  tag: language === 'th' ? 'ด่วนพิเศษ' : 'Fast Express', 
                  desc: language === 'th' ? 'จัดส่งคืนสะอาดในวันรุ่งขึ้น' : 'Returned clean the next day' 
                },
                { 
                  id: 'same_day', 
                  label: language === 'th' ? '🚀 ส่งด่วนวันเดียว' : '🚀 Same Day', 
                  tag: language === 'th' ? 'เร่งด่วน' : 'Priority', 
                  desc: language === 'th' ? 'รับผ้าช่วงเช้า ส่งคืนภายในวันเดียวกัน' : 'Morning pickup, delivered today' 
                }
              ].map((sp) => (
                <button
                  key={sp.id}
                  type="button"
                  onClick={() => setTurnaroundSpeed(sp.id)}
                  className={`p-3 rounded-2xl border-2 text-left transition cursor-pointer ${
                    activeSpeed === sp.id
                      ? 'border-sky-600 bg-sky-50/80 shadow-xs ring-2 ring-sky-500/20'
                      : 'border-slate-200 bg-white hover:border-slate-300 text-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-sm text-slate-900">{sp.label}</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      activeSpeed === sp.id ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {sp.tag}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">{sp.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* 2. Category Filter Pills */}
          <div className="space-y-2 pt-1">
            <div className="flex flex-wrap items-center gap-2 pb-2 border-b border-slate-100">
              {[
                { id: 'all', label: language === 'th' ? 'ทุกบริการ' : 'All Services', icon: '🧺' },
                ...categories.map(c => {
                  let icon = '🧺';
                  if (c.id === 'bedding_linens' || c.icon === 'bed') icon = '🛏️';
                  else if (c.id === 'household_curtains' || c.icon === 'home') icon = '🛋️';
                  else if (c.id === 'delicate_dryclean' || c.icon === 'sparkles') icon = '✨';
                  else if (c.icon === 'scale') icon = '🧺';
                  else if (c.badge) icon = c.badge.split(' ')[0] || '🧺';

                  const label = language === 'th' && c.nameTh ? c.nameTh : c.name;
                  return { id: c.id, label, icon };
                })
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveCategory(tab.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 border ${
                    activeCategory === tab.id
                      ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-transparent'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 3. Streamlined Service Cards with Direct Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {safeServices
              .filter(s => {
                if (!s) return false;
                // Only allow services that belong to an active category
                if (!s.categoryId || !categories.some(c => c.id === s.categoryId)) return false;
                // Guarantee piece-based items never appear under laundry by weight
                if (s.categoryId === 'laundry_by_weight' && (s.pricingType === 'piece' || s.unit === 'piece')) return false;
                if (activeCategory === 'all') return true;
                return s.categoryId === activeCategory;
              })
              .map((srv) => {
                const isSelected = Boolean(selectedServicesMap[srv.id]);
                const isPiece = srv.pricingType === 'piece' || srv.unit === 'piece';
                const unitLabel = isPiece ? (srv.unit || 'piece') : 'KG';
                const stdPrice = Number(srv.standardPricePerKg || srv.pricePerKg || (srv.id === 'wash_fold' ? 70 : 70));
                const nextPrice = Number(srv.nextDayPricePerKg || Math.round(stdPrice * 1.3));
                const samePrice = Number(srv.sameDayPricePerKg || Math.round(stdPrice * 1.75));
                
                let activePrice = stdPrice;
                if (activeSpeed === 'same_day') activePrice = samePrice;
                else if (activeSpeed === 'next_day_24h') activePrice = nextPrice;

                const currentWeight = selectedServicesMap[srv.id]?.weightKg || Number(srv.minWeightKg || (isPiece ? 1.0 : 4.0));
                const currentQty = selectedServicesMap[srv.id]?.quantity || 1;
                const billable = isPiece ? currentQty : Math.max(currentWeight, Number(srv.minWeightKg || 4.0));
                const cardSubtotal = Math.round(billable * activePrice);

                const srvName = (language === 'th' && srv.nameTh) ? srv.nameTh : srv.name;
                const srvSubname = (language === 'th') ? srv.name : srv.nameTh;
                const srvDesc = (language === 'th' && srv.descriptionTh) ? srv.descriptionTh : srv.description;
                const unitDisplay = isPiece ? (language === 'th' ? 'ชิ้น' : unitLabel) : (language === 'th' ? 'กก.' : 'KG');

                return (
                  <div
                    key={srv.id}
                    className={`rounded-2xl border-2 transition p-4 flex flex-col justify-between ${
                      isSelected
                        ? 'border-sky-500 bg-sky-50/60 shadow-sm ring-1 ring-sky-500/20'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div>
                      {/* Card Header */}
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h3 className="font-extrabold text-sm text-slate-900">{srvName}</h3>
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                              isPiece ? 'bg-amber-100 text-amber-800' : 'bg-sky-100 text-sky-800'
                            }`}>
                              {isPiece ? (language === 'th' ? '🛏️ คิดเป็นชิ้น' : '🛏️ Per Piece') : (language === 'th' ? '🧺 คิดตามน้ำหนัก' : '🧺 By Weight')}
                            </span>
                          </div>
                          {srvSubname && (
                            <div className="text-[11px] text-slate-400 font-medium">{srvSubname}</div>
                          )}
                        </div>

                        {isSelected && (
                          <button
                            type="button"
                            onClick={() => handleRemoveService(srv.id)}
                            className="text-slate-400 hover:text-red-500 text-xs font-bold p-1 transition cursor-pointer"
                            title="Remove"
                          >
                            ✕
                          </button>
                        )}
                      </div>

                      {/* Description */}
                      <p className="text-[11px] text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">
                        {srvDesc}
                      </p>

                      {/* Single Clear Rate Display */}
                      <div className="mt-3 flex items-baseline gap-1">
                        <span className="text-xl font-black text-slate-900 font-mono">฿{activePrice}</span>
                        <span className="text-xs text-slate-500 font-semibold">/ {unitDisplay}</span>
                        <span className="text-[10px] text-slate-400 ml-auto">
                          {isPiece 
                            ? (language === 'th' ? `ขั้นต่ำ 1 ชิ้น` : `Min 1 ${unitLabel}`) 
                            : (language === 'th' ? `ขั้นต่ำ ${srv.minWeightKg || 4} กก.` : `Min ${srv.minWeightKg || 4} KG`)}
                        </span>
                      </div>
                    </div>

                    {/* Direct Interactive Controls */}
                    <div className="mt-3 pt-3 border-t border-slate-200/80">
                      {!isSelected ? (
                        <button
                          type="button"
                          onClick={() => handleToggleService(srv.id)}
                          className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-98 cursor-pointer shadow-2xs"
                        >
                          <span>{language === 'th' ? '+ เพิ่มในรายการจอง' : '+ Add to Booking'}</span>
                        </button>
                      ) : (
                        <div className="space-y-2.5">
                          {isPiece ? (
                            /* Piece Stepper */
                            <div className="flex items-center justify-between bg-white px-3 py-1.5 rounded-xl border border-sky-300">
                              <span className="text-xs font-bold text-slate-700">
                                {language === 'th' ? 'จำนวน:' : 'Quantity:'}
                              </span>
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleUpdateQuantity(srv.id, -1)}
                                  className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm flex items-center justify-center transition active:scale-95 cursor-pointer"
                                >
                                  -
                                </button>
                                <span className="w-8 text-center text-sm font-black text-slate-900 font-mono">
                                  {currentQty}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleUpdateQuantity(srv.id, 1)}
                                  className="w-7 h-7 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold text-sm flex items-center justify-center transition active:scale-95 cursor-pointer"
                                >
                                  +
                                </button>
                              </div>
                            </div>
                          ) : (
                            /* Weight Stepper & Quick Presets */
                            <div className="space-y-2">
                              <div className="flex items-center justify-between bg-white px-3 py-1.5 rounded-xl border border-sky-300">
                                <span className="text-xs font-bold text-slate-700">
                                  {language === 'th' ? 'น้ำหนัก:' : 'Weight:'}
                                </span>
                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateWeight(srv.id, Math.max(1, currentWeight - 0.5))}
                                    className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm flex items-center justify-center transition active:scale-95 cursor-pointer"
                                  >
                                    -
                                  </button>
                                  <span className="w-14 text-center text-sm font-black text-slate-900 font-mono">
                                    {currentWeight} {language === 'th' ? 'กก.' : 'KG'}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateWeight(srv.id, currentWeight + 0.5)}
                                    className="w-7 h-7 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold text-sm flex items-center justify-center transition active:scale-95 cursor-pointer"
                                  >
                                    +
                                  </button>
                                </div>
                              </div>

                              {/* Quick Presets */}
                              <div className="grid grid-cols-4 gap-1">
                                {[4, 6, 8, 10].map((presetKg) => (
                                  <button
                                    key={presetKg}
                                    type="button"
                                    onClick={() => handleUpdateWeight(srv.id, presetKg)}
                                    className={`py-1 rounded-lg text-[10px] font-bold border transition cursor-pointer ${
                                      currentWeight === presetKg
                                        ? 'bg-sky-600 text-white border-sky-600'
                                        : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                                    }`}
                                  >
                                    {presetKg} {language === 'th' ? 'กก.' : 'KG'}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Item Subtotal */}
                          <div className="flex items-center justify-between pt-1 text-xs">
                            <span className="text-slate-500 font-medium">
                              {language === 'th' ? 'ยอดรวม:' : 'Subtotal:'}
                            </span>
                            <span className="font-black text-sky-700 font-mono">฿{cardSubtotal} THB</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>

          {/* 4. Streamlined Order Summary Bar */}
          {selectedEntries.length > 0 ? (
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-slate-900 to-sky-950 text-white shadow-md">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-sky-300 uppercase tracking-wider">
                      {language === 'th' ? 'รายการที่เลือก:' : 'Selected Items:'}
                    </span>
                    {selectedEntries.map((it) => {
                      const itName = (language === 'th' && (it.nameTh || it.serviceNameTh)) ? (it.nameTh || it.serviceNameTh) : (it.name || it.serviceName);
                      return (
                        <span key={it.id} className="text-xs bg-white/10 px-2.5 py-0.5 rounded-lg text-slate-200 font-medium">
                          {itName} ({it.isPiece ? `${it.qty} ${language === 'th' ? 'ชิ้น' : 'pc'}` : `${it.weight} ${language === 'th' ? 'กก.' : 'KG'}`})
                        </span>
                      );
                    })}
                  </div>
                  <p className="text-xs text-slate-400">
                    {language === 'th' ? (
                      <>ความเร็ว: <strong className="text-white">{activeSpeed === 'same_day' ? '🚀 ส่งด่วนวันเดียว' : activeSpeed === 'next_day_24h' ? '⚡ วันถัดไป' : '🕒 มาตรฐาน (2 วัน)'}</strong> • ค่าจัดส่งคำนวณในขั้นตอนที่ 3</>
                    ) : (
                      <>Speed: <strong className="text-white">{activeSpeed === 'same_day' ? '🚀 Same Day' : activeSpeed === 'next_day_24h' ? '⚡ Next Day' : '🕒 Standard (2 Days)'}</strong> • Delivery calculated in Step 3</>
                    )}
                  </p>
                </div>

                <div className="flex items-center sm:flex-col sm:items-end justify-between gap-1 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/10">
                  <span className="text-[10px] uppercase font-bold text-slate-400">
                    {language === 'th' ? 'ยอดรวมประเมิน' : 'Estimated Subtotal'}
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl sm:text-3xl font-black text-sky-400 font-mono">฿{estimatedTotal}</span>
                    <span className="text-xs text-slate-300 font-bold">{language === 'th' ? 'บาท' : 'THB'}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 text-center">
              <p className="text-xs text-slate-500">
                {language === 'th' 
                  ? '👉 กรุณากด "+ เพิ่มในรายการจอง" อย่างน้อย 1 บริการเพื่อดำเนินการต่อ' 
                  : '👉 Please tap + Add to Booking on at least one service above to proceed.'}
              </p>
            </div>
          )}
        </div>

        {/* Step 2: Digital Contact Information (WhatsApp / LINE / Email) */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-7 h-7 rounded-full bg-sky-600 text-white font-bold text-xs flex items-center justify-center">2</span>
            <h2 className="text-lg font-bold text-slate-900">
              {language === 'th' ? 'ช่องทางการติดต่อดิจิทัล' : 'Digital Contact Channel'}
            </h2>
          </div>
          <p className="text-xs text-slate-500 mb-6">
            {language === 'th'
              ? 'เราจะส่งการแจ้งเตือนเข้ารับผ้า ภาพถ่ายยืนยันการชั่งน้ำหนัก และใบแจ้งหนี้ผ่านช่องทางออนไลน์ สามารถติดต่อเราได้เสมอผ่านโทรศัพท์และ WhatsApp (+66 80 888 9885)'
              : 'We send pickup alerts, scale weigh-in confirmations, and invoices digitally. Reach us anytime via Mobile Call & WhatsApp (+66 80 888 9885).'}
          </p>

          <div className="space-y-4">
            {/* First Name & Last Name (Strictly Required) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {language === 'th' ? 'ชื่อจริง' : 'First Name (ชื่อจริง)'} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder={language === 'th' ? 'เช่น กิตติพัฒน์ / Alex' : 'e.g. Alex / กิตติพัฒน์'}
                  value={firstName}
                  onChange={(e) => {
                    setFirstName(e.target.value);
                    setCustomerName(`${e.target.value.trim()} ${lastName.trim()}`.trim());
                  }}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {language === 'th' ? 'นามสกุล' : 'Last Name (นามสกุล)'} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder={language === 'th' ? 'เช่น วงศ์สุวรรณ / Thorne' : 'e.g. Thorne / วงศ์สุวรรณ'}
                  value={lastName}
                  onChange={(e) => {
                    setLastName(e.target.value);
                    setCustomerName(`${firstName.trim()} ${e.target.value.trim()}`.trim());
                  }}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-sm"
                />
              </div>
            </div>

            {/* Nickname & Required Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {language === 'th' ? 'ชื่อเล่น / ชื่อที่สะดวกให้เรียก' : 'Nickname / Preferred Name (ชื่อเล่น)'}
                </label>
                <input
                  type="text"
                  placeholder={language === 'th' ? 'เช่น บอย / Alex' : 'e.g. Alex / บอย'}
                  value={nickName}
                  onChange={(e) => setNickName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {language === 'th' ? 'ที่อยู่อีเมล' : 'Email Address (อีเมล)'} <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="alex.thorne@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-sm"
                />
                <p className="text-[10px] text-sky-700 font-semibold mt-1">
                  {language === 'th'
                    ? '* จำเป็นสำหรับรับใบแจ้งหนี้ ยืนยันการจอง และอัปเดตสถานะจัดส่ง'
                    : '* Required for sending invoices, booking confirmations, and delivery updates.'}
                </p>
              </div>
            </div>

            {/* Primary Mobile Number with Live CRM Detection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                <span>{language === 'th' ? 'เบอร์โทรศัพท์หลัก' : 'Primary Mobile Number (เบอร์โทรศัพท์หลัก)'} <span className="text-red-500">*</span></span>
                {isCheckingPhone && (
                  <span className="text-[10px] text-sky-600 font-semibold animate-pulse">
                    {language === 'th' ? 'กำลังตรวจสอบข้อมูลในระบบ CRM...' : 'Checking CRM profile...'}
                  </span>
                )}
              </label>
              <CountryPhoneInput
                defaultCountryCode="TH"
                value={mobileNumber}
                onChange={(val) => {
                  setMobileNumber(val);
                  if (contactChannel === 'whatsapp' || !contactValue || contactValue === mobileNumber) {
                    setContactValue(val);
                  }
                }}
                placeholder="08x-xxx-xxxx"
                required
              />

              {detectedCustomer ? (
                <div className="mt-2.5 p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-950 text-xs flex items-center justify-between animate-fadeIn">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">👋</span>
                    <div>
                      <span className="font-extrabold text-emerald-900">
                        {language === 'th' 
                          ? `ยินดีต้อนรับกลับมา, คุณ ${detectedCustomer.firstName || detectedCustomer.fullName}!` 
                          : `Welcome back, ${detectedCustomer.firstName || detectedCustomer.fullName}!`}
                      </span>
                      <span className="block text-[11px] text-emerald-700">
                        {language === 'th'
                          ? 'พบข้อมูลสมาชิกในระบบ CRM ดึงข้อมูลและที่อยู่คอนโดหลักให้อัตโนมัติ'
                          : 'Existing CRM member profile found. Details and primary condo address loaded automatically.'}
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] uppercase font-mono font-bold bg-emerald-200/70 text-emerald-800 px-2 py-0.5 rounded-md border border-emerald-400">
                    {detectedCustomer.id}
                  </span>
                </div>
              ) : (
                <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1.5">
                  <span>✨</span>
                  <span>
                    {language === 'th'
                      ? 'ข้อมูลลูกค้าใหม่จะถูกบันทึกในระบบ CRM อัตโนมัติเมื่อทำการจอง'
                      : 'New customer profile will be automatically saved to our CRM upon booking.'}
                  </span>
                </p>
              )}
            </div>

            {/* Preferred Online Communication Channel */}
            <div className="pt-2">
              <label className="block text-xs font-bold text-slate-700 mb-2">
                {language === 'th' ? 'ช่องทางแจ้งเตือนออนไลน์ที่ต้องการ' : 'Preferred Online Notification Channel'} <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'whatsapp', label: 'WhatsApp', icon: 'whatsapp', color: 'emerald' },
                  { id: 'line', label: 'LINE OA', icon: 'line', color: 'green' },
                  { id: 'email', label: language === 'th' ? 'อีเมล' : 'Email', icon: 'mail', color: 'sky' }
                ].map((ch) => (
                  <button
                    key={ch.id}
                    type="button"
                    onClick={() => {
                      setContactChannel(ch.id);
                      if (ch.id === 'whatsapp') {
                        setContactValue(mobileNumber);
                      } else if (ch.id === 'email') {
                        setContactValue(email);
                      }
                    }}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition ${
                      contactChannel === ch.id
                        ? 'border-green-600 bg-green-50 text-green-950 shadow-sm ring-1 ring-green-500'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Icon name={ch.icon} className="w-4 h-4" />
                    <span>{ch.label}</span>
                  </button>
                ))}
              </div>

              {contactChannel === 'line' && (
                <div className="mt-3 p-3 bg-green-50/70 border border-green-200 rounded-xl text-xs text-green-900 space-y-2">
                  <div className="flex items-start gap-2">
                    <Icon name="line" className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                    <span>
                      {language === 'th' ? (
                        <><strong>คำแนะนำ LINE OA:</strong> หลังจองเสร็จ คุณสามารถเพิ่มเพื่อน <strong>{lineOaId}</strong> ใน 1 คลิกเพื่อรับการแจ้งเตือนจากคนขับได้ทันที</>
                      ) : (
                        <><strong>LINE OA Notice:</strong> After booking, you can add <strong>{lineOaId}</strong> in 1 click to receive immediate driver alerts.</>
                      )}
                    </span>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-green-950 mb-1">
                      {language === 'th' ? 'LINE ID ของคุณ (ระบุหรือไม่ก็ได้)' : 'Your LINE ID (Optional)'}
                    </label>
                    <input
                      type="text"
                      placeholder="@yourlineid"
                      value={contactValue && contactValue !== mobileNumber ? contactValue : ''}
                      onChange={(e) => setContactValue(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg border border-green-300 bg-white text-xs outline-none focus:ring-1 focus:ring-green-500"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Thai Company Tax Invoice Section */}
            <div className="pt-3 border-t border-slate-100">
              <label className="flex items-center gap-2.5 cursor-pointer text-xs font-bold text-slate-800">
                <input
                  type="checkbox"
                  checked={isCompanyTax}
                  onChange={(e) => setIsCompanyTax(e.target.checked)}
                  className="w-4 h-4 text-sky-600 rounded border-slate-300 focus:ring-sky-500"
                />
                <span className="flex items-center gap-1.5">
                  <Icon name="building2" className="w-3.5 h-3.5 text-slate-500" />
                  <span>{language === 'th' ? 'ขอใบกำกับภาษีเต็มรูปแบบในนามนิติบุคคล' : 'Request Thai Corporate Tax Receipt (ขอใบกำกับภาษีเต็มรูปแบบ)'}</span>
                </span>
              </label>

              {isCompanyTax && (
                <div className="mt-3 p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                  <p className="text-[11px] text-slate-500">
                    {language === 'th'
                      ? 'ใบกำกับภาษีจะถูกออกให้และบันทึกในระบบสำหรับใช้ลดหย่อนภาษี'
                      : 'Official tax deduction receipt will be issued and synced into your customer profile.'}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        {language === 'th' ? 'ชื่อนิติบุคคล / บริษัท' : 'Company Name (ชื่อนิติบุคคล)'} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required={isCompanyTax}
                        placeholder={language === 'th' ? 'เช่น บริษัท สยาม ฮอสพิทาลิตี้ จำกัด' : 'e.g. Siam Hospitality Co., Ltd.'}
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        {language === 'th' ? 'เลขประจำตัวผู้เสียภาษี 13 หลัก' : '13-Digit Tax ID (เลขประจำตัวผู้เสียภาษี)'} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required={isCompanyTax}
                        maxLength="13"
                        placeholder="e.g. 0105558123456"
                        value={companyTaxId}
                        onChange={(e) => setCompanyTaxId(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono bg-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      {language === 'th' ? 'สำนักงานใหญ่ / เลขที่สาขา' : 'Branch / Office (สำนักงานใหญ่ / เลขที่สาขา)'}
                    </label>
                    <input
                      type="text"
                      placeholder={language === 'th' ? 'เช่น สำนักงานใหญ่ หรือ สาขา 00001' : 'e.g. Head Office (สำนักงานใหญ่)'}
                      value={companyBranch}
                      onChange={(e) => setCompanyBranch(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Step 3: Bangkok / Pattaya Address & Condo Info */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200">
          <div className="flex items-center gap-2.5 mb-2">
            <span className="w-7 h-7 rounded-full bg-sky-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">3</span>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {language === 'th'
                  ? `${serviceCity === 'Pattaya' ? 'พัทยา' : 'กรุงเทพฯ'}: สถานที่รับผ้าและเวลานัดหมาย`
                  : `${serviceCity === 'Pattaya' ? 'Pattaya' : 'Bangkok'} Location & Schedule`}
              </h2>
              <p className="text-xs text-slate-500">
                {language === 'th'
                  ? 'ระบุข้อมูลที่พักอาศัยและเลือกวันเวลารับผ้าที่คุณสะดวก'
                  : 'Specify your residence details and preferred pickup schedule.'}
              </p>
            </div>
          </div>

          <div className="mt-5 space-y-4">
            {/* Section 1: Location & Residence Details Card */}
            <div className="bg-slate-50/80 border border-slate-200/90 rounded-2xl p-4 sm:p-5 space-y-4 shadow-2xs">
              <div className="flex items-center justify-between pb-2.5 border-b border-slate-200/80">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-sky-100 text-sky-600 flex items-center justify-center text-xs font-bold">
                    📍
                  </span>
                  <span className="text-xs font-black uppercase tracking-wider text-slate-800">
                    {language === 'th' ? 'สถานที่รับผ้าและข้อมูลที่พักอาศัย' : 'Pickup Location & Residence'}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white border border-slate-200 text-[11px] font-semibold text-slate-600 shadow-2xs">
                  <span className="font-bold text-xs">
                    <span className="text-blue-500">G</span>
                    <span className="text-red-500">o</span>
                    <span className="text-yellow-500">o</span>
                    <span className="text-blue-500">g</span>
                    <span className="text-green-500">l</span>
                    <span className="text-red-500">e</span>
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {language === 'th' ? 'ระบบแผนที่' : 'Maps Powered'}
                  </span>
                </div>
              </div>

              {/* Saved Customer Pickup & Delivery Addresses Selector */}
              {savedCustomerAddresses.length > 0 && (
                <div className="p-4 rounded-2xl bg-sky-50/80 border border-sky-200 space-y-3">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <Icon name="mapPin" className="w-4 h-4 text-sky-600" />
                      <span className="text-xs font-extrabold text-sky-900">
                        {language === 'th'
                          ? 'เลือกที่อยู่รับ-ส่งผ้าที่บันทึกไว้ของคุณ'
                          : 'Choose from Your Saved Pickup & Delivery Addresses'}
                      </span>
                    </div>
                  </div>

                  {/* Pickup Address Selector */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                      {language === 'th' ? '📦 เลือกที่อยู่สำหรับรับผ้า (Pickup Address)' : '📦 Select Pickup Address'}
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {savedCustomerAddresses
                        .filter(a => !a.addressType || a.addressType === 'both' || a.addressType === 'pickup')
                        .map((addr) => {
                          const isSelected = selectedPickupAddressId === addr.id;
                          return (
                            <button
                              key={addr.id}
                              type="button"
                              onClick={() => applySavedPickupAddress(addr)}
                              className={`p-3 rounded-xl border text-left transition ${
                                isSelected
                                  ? 'border-sky-600 bg-white ring-2 ring-sky-500/20 shadow-xs'
                                  : 'border-slate-200 bg-white/70 hover:bg-white'
                              }`}
                            >
                              <div className="flex items-center justify-between gap-1.5">
                                <span className="text-xs font-extrabold text-slate-900 truncate">
                                  {addr.label || 'Residence'}
                                </span>
                                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-sky-100 text-sky-800">
                                  {addr.addressType === 'pickup'
                                    ? (language === 'th' ? 'รับผ้า' : 'Pickup')
                                    : (language === 'th' ? 'รับ & ส่ง' : 'Pickup & Delivery')}
                                </span>
                              </div>
                              <div className="text-[11px] text-slate-600 font-semibold mt-0.5 truncate">
                                {addr.condoName || addr.streetAddress}
                                {addr.roomNumber ? ` (${addr.roomNumber})` : ''}
                              </div>
                              <div className="text-[10px] text-slate-400 truncate">
                                {addr.district}{addr.postalCode ? ` ${addr.postalCode}` : ''}
                              </div>
                            </button>
                          );
                        })}
                    </div>
                  </div>

                  {/* Return Delivery Address Selector (if customer has multiple or delivery-specific addresses) */}
                  {savedCustomerAddresses.length > 1 && (
                    <div className="pt-2 border-t border-sky-200/70">
                      <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                        {language === 'th'
                          ? '🚚 เลือกที่อยู่สำหรับส่งผ้าคืน (Return Delivery Address)'
                          : '🚚 Select Return Delivery Address'}
                      </label>
                      <select
                        value={selectedDeliveryAddressId}
                        onChange={(e) => setSelectedDeliveryAddressId(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-sky-200 bg-white text-xs font-bold text-slate-800 focus:ring-2 focus:ring-sky-500"
                      >
                        {savedCustomerAddresses
                          .filter(a => !a.addressType || a.addressType === 'both' || a.addressType === 'delivery')
                          .map((addr) => (
                            <option key={addr.id} value={addr.id}>
                              {addr.label || 'Address'} — {addr.condoName || addr.streetAddress}
                              {addr.roomNumber ? ` (${addr.roomNumber})` : ''} [{addr.district}]
                            </option>
                          ))}
                      </select>
                    </div>
                  )}
                </div>
              )}

              {/* Service City Selector: Bangkok vs Pattaya */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {language === 'th' ? 'พื้นที่ให้บริการ / ปลายทาง' : 'Service City / Destination'} <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      setServiceCity('Bangkok');
                      const defaultBkkDist = BANGKOK_DISTRICTS[0];
                      const subList = BANGKOK_DISTRICTS_TO_SUBDISTRICTS[defaultBkkDist] || [];
                      const defaultSub = subList[0];
                      setDistrict(defaultBkkDist);
                      setSubdistrict(defaultSub ? defaultSub.name : '');
                      setPostalCode(defaultSub ? defaultSub.code : (DISTRICT_TO_POSTAL_CODE[defaultBkkDist] || '10110'));
                    }}
                    className={`p-3 rounded-2xl border-2 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition ${
                      serviceCity === 'Bangkok'
                        ? 'border-sky-500 bg-sky-50/80 text-sky-900 shadow-sm'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <span className="text-base">🏙️</span>
                    <div className="text-left">
                      <div className="leading-tight">{language === 'th' ? 'กรุงเทพฯ' : 'Bangkok'}</div>
                      <div className="text-[10px] font-medium opacity-75">
                        {language === 'th' ? 'กรุงเทพฯ (ตามอัตราเขต/แขวง)' : 'All 50 Districts (Khwaeng rates)'}
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setServiceCity('Pattaya');
                      const firstPty = PATTAYA_SUBDISTRICTS_LIST[0];
                      setDistrict(firstPty.district);
                      setSubdistrict(firstPty.name);
                      setPostalCode(firstPty.code);
                    }}
                    className={`p-3 rounded-2xl border-2 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition ${
                      serviceCity === 'Pattaya'
                        ? 'border-sky-500 bg-sky-50/80 text-sky-900 shadow-sm'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <span className="text-base">🏖️</span>
                    <div className="text-left">
                      <div className="leading-tight">{language === 'th' ? 'พัทยา' : 'Pattaya'}</div>
                      <div className="text-[10px] font-medium opacity-75">
                        {language === 'th' ? 'พัทยา / บางละมุง / สัตหีบ' : 'Pattaya / Bang Lamung / Sattahip'}
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Primary Search: Condominium / Hotel / Building / House */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {serviceCity === 'Pattaya'
                    ? (language === 'th' ? 'โรงแรม / คอนโด / วิลล่า / บ้าน / ที่อยู่' : 'Hotel / Condominium / Villa / House / Address')
                    : (language === 'th' ? 'อาคาร / คอนโดมิเนียม / บ้าน / ที่อยู่' : 'Building / Condominium / House / Address')} <span className="text-red-500">*</span>
                </label>
                <GoogleMapsCondoAutocomplete
                  value={condoName}
                  city={serviceCity}
                  onChange={(val, autoMatch) => {
                    setCondoName(val);
                    if (autoMatch) {
                      applyLocationUpdate(autoMatch);
                    }
                  }}
                  onSelectPlace={(place) => {
                    applyLocationUpdate(place);
                  }}
                  apiKey={laundryStore.settings?.googleMapsApiKey || ''}
                  placeholder={
                    serviceCity === 'Pattaya'
                      ? (language === 'th' ? 'ค้นหาโรงแรม คอนโด วิลล่า บ้าน หรือที่อยู่ (เช่น Riviera / Unixx / จอมเทียน)...' : 'Search hotel, condo, villa, house or address (e.g. Riviera / Unixx / Jomtien)...')
                      : (language === 'th' ? 'ค้นหาอาคาร คอนโด บ้าน วิลล่า โรงแรม หรือที่อยู่ (เช่น Centro พระราม 9 / Ideo / Baan Sansiri)...' : 'Search building, condo, house, villa, hotel or address (e.g. Centro Rama 9 / Ideo / Baan Sansiri)...')
                  }
                  required
                />

                {/* Real-time Sub-district & Fee Auto-Change Confirmation Badge */}
                {condoName && (
                  <div className="mt-2 px-3 py-1.5 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/90 rounded-xl flex items-center justify-between text-xs text-emerald-900 animate-fadeIn shadow-2xs">
                    <div className="flex items-center gap-2 truncate">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 animate-pulse"></span>
                      <span className="truncate font-semibold text-[11px] sm:text-xs">
                        {serviceCity === 'Pattaya' 
                          ? (language === 'th' ? `📍 ตำแหน่ง: ${subdistrict}, ${district} (${postalCode})` : `📍 Location: ${subdistrict}, ${district} (${postalCode})`)
                          : (language === 'th' ? `📍 ตำแหน่ง: แขวง${subdistrict}, เขต${district} (📮 ${postalCode})` : `📍 Location: Khwaeng ${subdistrict}, Khet ${district} (📮 ${postalCode})`)}
                      </span>
                    </div>
                    <span className="shrink-0 font-bold px-2 py-0.5 bg-white rounded-md text-[10px] sm:text-[11px] text-emerald-800 border border-emerald-300 shadow-2xs">
                      {language === 'th' ? 'ค่าจัดส่ง: ' : 'Delivery: '}
                      {deliveryInfo.isFree ? (language === 'th' ? 'ฟรี (฿0)' : 'FREE (฿0)') : `฿${deliveryInfo.fee}`}
                    </span>
                  </div>
                )}
              </div>

              {/* Responsive Location Grid for Bangkok vs Pattaya */}
              {serviceCity === 'Bangkok' ? (
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  {/* Bangkok District */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      {language === 'th' ? 'เขต' : 'District (Khet)'} <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={district}
                      onChange={(e) => {
                        const newDist = e.target.value;
                        setDistrict(newDist);
                        const subList = BANGKOK_DISTRICTS_TO_SUBDISTRICTS[newDist] || [];
                        if (subList.length > 0) {
                          setSubdistrict(subList[0].name);
                          setPostalCode(subList[0].code);
                        } else if (DISTRICT_TO_POSTAL_CODE[newDist]) {
                          setPostalCode(DISTRICT_TO_POSTAL_CODE[newDist]);
                        }
                      }}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-xs bg-white font-medium text-slate-800 shadow-2xs"
                    >
                      {BANGKOK_DISTRICTS.map((d, i) => (
                        <option key={i} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>

                  {/* Bangkok Sub-district (Khwaeng) */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-bold text-slate-700">
                        {language === 'th' ? 'แขวง' : 'Sub-district (Khwaeng)'} <span className="text-red-500">*</span>
                      </label>
                      <span className="text-[9px] font-bold text-sky-700 bg-sky-50 px-1 py-0.5 rounded">
                        {language === 'th' ? 'อัตราค่าส่ง' : 'Fee rate'}
                      </span>
                    </div>
                    <select
                      value={subdistrict}
                      onChange={(e) => {
                        const chosenSub = e.target.value;
                        setSubdistrict(chosenSub);
                        const subList = BANGKOK_DISTRICTS_TO_SUBDISTRICTS[district] || [];
                        const found = subList.find(s => s.name === chosenSub);
                        if (found) {
                          setPostalCode(found.code);
                        }
                      }}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-xs bg-white font-semibold text-slate-900 shadow-2xs"
                    >
                      {(BANGKOK_DISTRICTS_TO_SUBDISTRICTS[district] || [
                        { name: subdistrict || 'Central', nameTh: 'ชั้นใน', code: postalCode, fee: 50 }
                      ]).map((sub, idx) => (
                        <option key={idx} value={sub.name}>
                          {language === 'th' && sub.nameTh ? `${sub.nameTh} (${sub.name})` : sub.name} {sub.nameTh && language !== 'th' ? `(${sub.nameTh})` : ''} — ฿{sub.fee || 50}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Postal Code */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-bold text-slate-700">
                        {language === 'th' ? 'รหัสไปรษณีย์' : 'Postal Code'} <span className="text-red-500">*</span>
                      </label>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${
                        deliveryInfo.isFree 
                          ? 'text-emerald-700 bg-emerald-50 border-emerald-200' 
                          : 'text-sky-700 bg-sky-50 border-sky-200'
                      }`}>
                        {deliveryInfo.isFree ? (language === 'th' ? 'ฟรี' : 'FREE') : `฿${deliveryInfo.fee}`}
                      </span>
                    </div>
                    <input
                      type="text"
                      required
                      pattern="[0-9]{5}"
                      placeholder="10110"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value.replace(/[^0-9]/g, ''))}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-xs bg-white font-mono font-bold text-slate-900 shadow-2xs"
                    />
                  </div>

                  {/* Room / Unit */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      {language === 'th' ? 'อาคาร / ชั้น / ห้อง' : 'Tower / Unit'}
                    </label>
                    <input
                      type="text"
                      placeholder={language === 'th' ? 'เช่น ตึก B ห้อง 1402' : 'Tower B, Rm 1402'}
                      value={roomNumber}
                      onChange={(e) => setRoomNumber(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-xs bg-white shadow-2xs"
                    />
                  </div>
                </div>
              ) : (
                /* Pattaya Grid */
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Pattaya Sub-district / Zone */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-bold text-slate-700">
                        {language === 'th' ? 'ตำบล / โซนในพัทยา' : 'Pattaya Sub-district / Area'} <span className="text-red-500">*</span>
                      </label>
                      <span className="text-[9px] font-bold text-sky-700 bg-sky-50 px-1 py-0.5 rounded">
                        {language === 'th' ? 'ค่าส่งตามโซน' : 'Zone fee'}
                      </span>
                    </div>
                    <select
                      value={subdistrict}
                      onChange={(e) => {
                        const chosenName = e.target.value;
                        setSubdistrict(chosenName);
                        const found = PATTAYA_SUBDISTRICTS_LIST.find(p => p.name === chosenName);
                        if (found) {
                          setDistrict(found.district);
                          setPostalCode(found.code);
                        }
                      }}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-xs bg-white font-semibold text-slate-900 shadow-2xs"
                    >
                      {PATTAYA_SUBDISTRICTS_LIST.map((zone, idx) => (
                        <option key={idx} value={zone.name}>
                          {language === 'th' ? `${zone.nameTh} (${zone.name})` : `${zone.name} (${zone.nameTh})`} — ฿{zone.fee}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Postal Code */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-bold text-slate-700">
                        {language === 'th' ? 'รหัสไปรษณีย์' : 'Postal Code'} <span className="text-red-500">*</span>
                      </label>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${
                        deliveryInfo.isFree 
                          ? 'text-emerald-700 bg-emerald-50 border-emerald-200' 
                          : 'text-sky-700 bg-sky-50 border-sky-200'
                      }`}>
                        {deliveryInfo.isFree ? (language === 'th' ? 'ฟรี' : 'FREE') : `฿${deliveryInfo.fee}`}
                      </span>
                    </div>
                    <input
                      type="text"
                      required
                      pattern="[0-9]{5}"
                      placeholder="20150"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value.replace(/[^0-9]/g, ''))}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-xs bg-white font-mono font-bold text-slate-900 shadow-2xs"
                    />
                  </div>

                  {/* Room / Suite / Villa */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      {language === 'th' ? 'ห้อง / วิลล่า / ชั้น' : 'Room / Villa / Floor'}
                    </label>
                    <input
                      type="text"
                      placeholder={language === 'th' ? 'เช่น วิลล่า 4 / ห้อง 801' : 'e.g. Villa 4 / Rm 801'}
                      value={roomNumber}
                      onChange={(e) => setRoomNumber(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-xs bg-white shadow-2xs"
                    />
                  </div>
                </div>
              )}

              {/* Delivery Fee Notice Banner */}
              <div className="p-3.5 rounded-xl bg-white border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 text-xs shadow-2xs">
                <div className="flex items-center gap-2.5">
                  <span className="w-8 h-8 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-sm shrink-0">
                    🚚
                  </span>
                  <div>
                    <span className="font-bold text-slate-900 block">
                      {language === 'th' ? 'ค่าบริการรับและส่งผ้า: ' : 'Pickup & Delivery: '}
                      <span className="text-sky-600 font-black">
                        {deliveryInfo.isFree ? (language === 'th' ? 'ฟรี (฿0 บาท)' : 'FREE (฿0)') : `฿${deliveryInfo.fee} THB`}
                      </span>
                    </span>
                    <span className="text-[11px] text-slate-500 block">
                      {serviceCity} · {deliveryInfo.subdistrict || subdistrict || deliveryInfo.district} (📮 {postalCode}) · {language === 'th' ? (deliveryInfo.reason || 'คิดอัตราตามโซนพื้นที่') : (deliveryInfo.reason || 'Fixed sub-district zone rate')}
                    </span>
                  </div>
                </div>
                <span className="text-[11px] text-slate-500 font-medium bg-slate-100 px-2.5 py-1 rounded-full">
                  {language === 'th' ? 'รวมในยอดสรุปแล้ว' : 'Added to order total'}
                </span>
              </div>

              {/* Handover Preference Selection */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-800">
                    {language === 'th' ? 'วิธีส่งมอบผ้า' : 'Laundry Handover Method'} <span className="text-red-500">*</span>
                  </label>
                  <span className="text-[11px] text-slate-500">
                    {language === 'th' ? 'เลือกรูปแบบการรับและส่งผ้าที่คุณสะดวก' : 'Choose how our rider collects & delivers'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Option 1: Condo Juristic Dropoff Card */}
                  <div 
                    onClick={() => setLeaveWithJuristic(true)}
                    className={`p-3.5 rounded-xl border-2 transition cursor-pointer flex flex-col justify-between gap-2.5 select-none relative ${
                      leaveWithJuristic 
                        ? 'bg-sky-50/90 border-sky-500 shadow-sm ring-1 ring-sky-500/30' 
                        : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                    }`}
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-base">🏢</span>
                          <span className="font-bold text-slate-900 text-xs">
                            {language === 'th' ? 'ฝากที่นิติบุคคล / ล็อบบี้คอนโด' : 'Condo Juristic / Front Lobby'}
                          </span>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 shrink-0">
                          {language === 'th' ? 'แนะนำ สะดวกที่สุด' : 'Recommended'}
                        </span>
                      </div>
                      <p className="text-slate-600 leading-relaxed text-[11px]">
                        {language === 'th'
                          ? 'คนขับจะเข้ารับและส่งผ้าคืนที่ล็อบบี้หรือเคาน์เตอร์นิติบุคคลโดยตรง ไม่รบกวนเวลาส่วนตัวของคุณ เพียงติดป้ายชื่อและเลขห้องที่ถุงผ้า'
                          : "Driver collects & returns directly at your building's reception or juristic desk without disturbing you. Tag your laundry bag with your name & unit."}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-slate-200/60 text-xs mt-1">
                      <input
                        type="radio"
                        name="handoverSelection"
                        checked={leaveWithJuristic}
                        onChange={() => setLeaveWithJuristic(true)}
                        onClick={(e) => e.stopPropagation()}
                        className="w-4 h-4 text-sky-600 focus:ring-sky-500 border-slate-300 cursor-pointer"
                      />
                      <span className={`text-[11px] font-bold ${leaveWithJuristic ? 'text-sky-700' : 'text-slate-500'}`}>
                        {leaveWithJuristic
                          ? (language === 'th' ? '✓ เลือกฝากนิติบุคคล / ล็อบบี้' : '✓ Juristic Drop-Off Selected')
                          : (language === 'th' ? 'เลือกฝากนิติบุคคล / ล็อบบี้' : 'Select Juristic Drop-Off')}
                      </span>
                    </div>
                  </div>

                  {/* Option 2: Meet Up in Person Card */}
                  <div 
                    onClick={() => setLeaveWithJuristic(false)}
                    className={`p-3.5 rounded-xl border-2 transition cursor-pointer flex flex-col justify-between gap-2.5 select-none relative ${
                      !leaveWithJuristic 
                        ? 'bg-amber-50/90 border-amber-500 shadow-sm ring-1 ring-amber-500/30' 
                        : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                    }`}
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-base">🤝</span>
                          <span className="font-bold text-slate-900 text-xs">
                            {language === 'th' ? 'ส่งมอบกับคนขับโดยตรง' : 'Meet Up in Person with Rider'}
                          </span>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 shrink-0">
                          {language === 'th' ? 'ขึ้นอยู่กับคิวคนขับ' : 'Subject to Rider Availability'}
                        </span>
                      </div>
                      <p className="text-slate-600 leading-relaxed text-[11px]">
                        {language === 'th' ? (
                          <>พบคนขับที่ล็อบบี้หรือหน้าทางเข้าอาคาร <strong className="text-amber-900">โปรดทราบว่าการส่งมอบกับคนขับโดยตรงขึ้นอยู่กับคิวและเวลาของคนขับในแต่ละช่วง</strong> คนขับจะโทรหรือทัก WhatsApp / LINE ก่อนถึง</>
                        ) : (
                          <>Meet our rider in person at your lobby or entrance. <strong className="text-amber-900">Kindly note that in-person meet up is subjected to the availability of the riders.</strong> Rider coordinates via Mobile / WhatsApp upon arrival.</>
                        )}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-slate-200/60 text-xs mt-1">
                      <input
                        type="radio"
                        name="handoverSelection"
                        checked={!leaveWithJuristic}
                        onChange={() => setLeaveWithJuristic(false)}
                        onClick={(e) => e.stopPropagation()}
                        className="w-4 h-4 text-amber-600 focus:ring-amber-500 border-slate-300 cursor-pointer"
                      />
                      <span className={`text-[11px] font-bold ${!leaveWithJuristic ? 'text-amber-900' : 'text-slate-500'}`}>
                        {!leaveWithJuristic
                          ? (language === 'th' ? '✓ เลือกส่งมอบกับคนขับโดยตรง' : '✓ Meet Up in Person Selected')
                          : (language === 'th' ? 'เลือกส่งมอบกับคนขับโดยตรง' : 'Select Meet Up in Person')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Pickup Schedule & Turnaround Card */}
            <div className="bg-slate-50/80 border border-slate-200/90 rounded-2xl p-4 sm:p-5 space-y-4 shadow-2xs">
              <div className="flex items-center justify-between pb-2.5 border-b border-slate-200/80">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold">
                    🕒
                  </span>
                  <span className="text-xs font-black uppercase tracking-wider text-slate-800">
                    {language === 'th' ? 'เวลานัดหมายและระยะเวลาซักอบ' : 'Pickup Schedule & Turnaround Speed'}
                  </span>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  activeSpeed === 'same_day'
                    ? 'bg-amber-100 text-amber-900 border border-amber-300'
                    : activeSpeed === 'next_day_24h'
                      ? 'bg-sky-100 text-sky-900 border border-sky-300'
                      : 'bg-slate-200 text-slate-800 border border-slate-300'
                }`}>
                  {activeSpeed === 'same_day'
                    ? (language === 'th' ? '🚀 ซักด่วนวันเดียว (Same Day)' : '🚀 Same Day')
                    : activeSpeed === 'next_day_24h'
                      ? (language === 'th' ? '⚡ ด่วนวันถัดไป (Next Day)' : '⚡ Next Day')
                      : (language === 'th' ? '🕒 ซักมาตรฐาน 2 วัน (Standard)' : '🕒 Standard (2 Days)')}
                </span>
              </div>

              {/* 3-Tier Turnaround Schedule Banner */}
              {activeSpeed === 'same_day' ? (
                <div className="p-3 bg-amber-50/90 border border-amber-200 rounded-xl flex items-start gap-2.5">
                  <span className="text-base">🚀</span>
                  <div className="text-xs text-amber-950">
                    <span className="font-bold block">
                      {language === 'th' ? 'จัดส่งคืนภายในวันเดียวกัน: ส่งคืนก่อน 18:00 น.' : 'Same Day Return: Delivered before 18:00 hrs'}
                    </span>
                    <span className="text-[11px] text-amber-900/80 mt-0.5 block leading-relaxed">
                      {language === 'th'
                        ? 'รับผ้าช่วงเช้า ส่งคืนสะอาด หอมสดชื่น บรรจุถุงอย่างดีก่อน 18:00 น. ในวันเดียวกัน'
                        : 'Morning pickup returned fresh, sealed, and packaged before 18:00 hrs on the same day.'}
                    </span>
                  </div>
                </div>
              ) : activeSpeed === 'next_day_24h' ? (
                <div className="p-3 bg-sky-50/90 border border-sky-200 rounded-xl flex items-start gap-2.5">
                  <span className="text-base">⚡</span>
                  <div className="text-xs text-sky-950">
                    <span className="font-bold block">
                      {language === 'th' ? 'จัดส่งคืนวันถัดไป: ส่งคืนในวันถัดไป' : 'Next Day Return: Delivered the next day'}
                    </span>
                    <span className="text-[11px] text-sky-900/80 mt-0.5 block leading-relaxed">
                      {language === 'th'
                        ? 'รับผ้าตามวันที่นัดหมาย ส่งคืนสะอาดเรียบร้อยในวันรุ่งขึ้น'
                        : 'Pickup on your scheduled date and returned fresh, sealed, and packaged the next day.'}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-white border border-slate-200 rounded-xl flex items-start gap-2.5">
                  <span className="text-base">🕒</span>
                  <div className="text-xs text-slate-800">
                    <span className="font-bold block">
                      {language === 'th' ? 'ระยะเวลามาตรฐาน: ส่งคืนภายใน 2 วัน' : 'Standard Turnaround: Return in 2 Days'}
                    </span>
                    <span className="text-[11px] text-slate-500 mt-0.5 block leading-relaxed">
                      {language === 'th'
                        ? 'รับผ้าตามวันนัดหมายและส่งคืนสะอาด หอม บรรจุถุงมิดชิดภายใน 2 วัน'
                        : 'Pickup on your scheduled date and delivery returned fresh and sealed within 2 days.'}
                    </span>
                  </div>
                </div>
              )}

              {/* Date & Time Picker (2-Columns) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    {language === 'th' ? 'วันที่ต้องการให้เข้ารับผ้า' : 'Pickup Date'} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={pickupDate}
                    onChange={(e) => setPickupDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-xs sm:text-sm bg-white font-medium shadow-2xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    {language === 'th' ? 'ช่วงเวลาเข้ารับผ้า' : 'Preferred Pickup Window'} <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={pickupTime}
                    onChange={(e) => setPickupTime(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-xs sm:text-sm bg-white font-medium text-slate-800 shadow-2xs"
                  >
                    {TIME_SLOTS.map((slot, i) => (
                      <option key={i} value={slot}>{slot}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Special Notes */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    {language === 'th' ? 'หมายเหตุพิเศษหรือคำแนะนำถึงคนขับ (ไม่บังคับ)' : 'Special Care or Delivery Notes (Optional)'}
                  </label>
                  <span className="text-[10px] text-slate-400">
                    {language === 'th' ? 'ชื่อเจ้าหน้าที่นิติ, ข้อควรระวังเนื้อผ้า' : 'Juristic staff name, fabric care'}
                  </span>
                </div>
                <textarea
                  rows="2"
                  placeholder={
                    language === 'th'
                      ? 'เช่น ฝากไว้กับคุณสมชายที่เคาน์เตอร์ หรือกรุณาอย่าอบแห้งด้วยความร้อนสูงสำหรับชุดออกกำลังกาย'
                      : 'e.g. Leave with K. Somchai at front desk. Please avoid high-heat tumble dry for gym shirts.'
                  }
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-xs sm:text-sm bg-white placeholder:text-slate-400 shadow-2xs"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Step 4: Terms & Conditions Review and Mandatory Checkbox */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border-2 border-slate-300 space-y-4">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center">4</span>
            <h2 className="text-lg font-bold text-slate-900">
              {language === 'th' ? 'ตรวจสอบข้อกำหนดและเงื่อนไข' : 'Terms & Conditions Review'}
            </h2>
          </div>

          {/* Prompt to read summary */}
          <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <Icon name="phone" className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
              <div className="text-xs text-emerald-950">
                <span className="font-bold block text-sm">
                  {language === 'th' ? 'ฝ่ายบริการลูกค้าและการดูแล' : 'Customer Support & Assistance'}
                </span>
                {language === 'th'
                  ? 'มีข้อสงสัยหรือคำขอพิเศษ? ติดต่อทีมงานของเราได้ทางโทรศัพท์และ WhatsApp (+66 80 888 9885), LINE Official หรืออีเมล'
                  : 'Questions or special requests? Reach our team via Mobile Call & WhatsApp (+66 80 888 9885), LINE Official, or Email.'}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsTermsModalOpen(true)}
              className="w-full sm:w-auto shrink-0 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition flex items-center justify-center gap-1.5"
            >
              <Icon name="fileText" className="w-4 h-4" />
              <span>
                {hasReviewedSummary 
                  ? (language === 'th' ? 'ดูสรุปเงื่อนไขอีกครั้ง' : 'Review Summary Again') 
                  : (language === 'th' ? 'อ่านสรุปข้อกำหนด' : 'Read Summary of Terms')}
              </span>
            </button>
          </div>

          {/* Mandatory Agreement Checkbox */}
          <div className={`p-4 rounded-2xl border-2 transition ${
            agreedToTerms ? 'border-emerald-500 bg-emerald-50/40' : 'border-slate-300 bg-slate-50'
          }`}>
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                required
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="mt-1 w-5 h-5 rounded text-sky-600 focus:ring-sky-500 border-slate-400 cursor-pointer"
              />
              <div className="text-xs text-slate-800 leading-relaxed">
                <strong className="text-slate-900 block font-bold text-sm mb-1">
                  {language === 'th' ? 'ข้าพเจ้ายอมรับข้อกำหนดและเงื่อนไขการบริการ' : 'I Agree to the Terms and Conditions'} <span className="text-red-600">*</span>
                </strong>
                {language === 'th' ? (
                  <>
                    ข้าพเจ้าได้อ่าน เข้าใจ และยอมรับ{' '}
                    <button
                      type="button"
                      onClick={() => setIsTermsModalOpen(true)}
                      className="text-sky-600 font-bold underline hover:text-sky-800"
                    >
                      ข้อกำหนดและเงื่อนไขสำคัญ
                    </button>
                    {' '}รวมถึงนโยบายที่ว่า <strong>การติดต่อฝ่ายบริการลูกค้า การติดตามสถานะ และการเคลมประกัน จะประสานงานผ่านเบอร์โทรศัพท์ (+66 80 888 9885), WhatsApp, LINE หรืออีเมล</strong> และยอดชำระเงินสุทธิจะคำนวณตามน้ำหนักจริงจากเครื่องชั่งดิจิทัล ณ ศูนย์บริการส่วนกลาง
                  </>
                ) : (
                  <>
                    I have read, understood, and agreed to the{' '}
                    <button
                      type="button"
                      onClick={() => setIsTermsModalOpen(true)}
                      className="text-sky-600 font-bold underline hover:text-sky-800"
                    >
                      Important Terms & Conditions
                    </button>
                    , including the policy that <strong>customer support, status tracking, and incident claims are coordinated via Mobile (+66 80 888 9885), WhatsApp, LINE, or Email</strong>, and that final billing is subject to central facility digital scale weigh-in.
                  </>
                )}
              </div>
            </label>
          </div>

          {/* Error Message Box */}
          {errorMessage && (
            <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-800 font-semibold flex items-center gap-2">
              <Icon name="alertTriangle" className="w-4 h-4 text-red-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Order Pricing Breakdown with Postal Code Delivery Fee */}
          <div className="p-4 bg-slate-50/90 rounded-2xl border border-slate-200 text-xs space-y-2">
            <div className="font-bold text-slate-800 text-[11px] uppercase tracking-wider flex items-center justify-between pb-1 border-b border-slate-200/80">
              <span className="flex items-center gap-1.5">
                <span>{language === 'th' ? 'สรุปรายการประมาณการ' : 'Order Estimated Breakdown'}</span>
                <span className="text-[10px] bg-sky-100 text-sky-800 font-bold px-1.5 py-0.2 rounded">
                  {selectedEntries.length} {language === 'th' ? 'รายการ' : (selectedEntries.length === 1 ? 'Item' : 'Items')}
                </span>
              </span>
              <span className="text-slate-400 font-mono font-normal">
                {serviceCity} {language === 'th' ? 'รหัสไปรษณีย์' : 'Postal Code'}: {postalCode}
              </span>
            </div>

            {selectedEntries.map((item) => {
              const itName = language === 'th' && item.nameTh ? item.nameTh : item.name;
              const unitStr = language === 'th' ? (item.unit === 'pair' ? 'คู่' : item.unit === 'set' ? 'ชุด' : 'ชิ้น') : item.unitLabel;
              return (
                <div key={item.id} className="flex items-center justify-between text-slate-600 text-xs">
                  <span className="truncate pr-2">
                    <strong className="text-slate-800">{itName}</strong> ({item.isPiece ? `${item.qty} ${unitStr} × ฿${item.rate}/${unitStr}` : `${item.billable} ${language === 'th' ? 'กก.' : 'KG'} × ฿${item.rate}/${language === 'th' ? 'กก.' : 'KG'}`}):
                  </span>
                  <span className="font-bold text-slate-800 shrink-0 font-mono">฿{item.subtotal} THB</span>
                </div>
              );
            })}

            <div className="flex items-center justify-between text-slate-600 pt-1 border-t border-slate-200/60">
              <span className="flex items-center gap-1.5">
                <span>
                  {language === 'th'
                    ? `ค่าบริการรับและส่งผ้า (${deliveryInfo.subdistrict || deliveryInfo.district} - ${postalCode}):`
                    : `Fixed Pickup & Delivery (${deliveryInfo.subdistrict || deliveryInfo.district} - ${postalCode}):`}
                </span>
                {deliveryInfo.isFree && (
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                    {language === 'th' ? 'โปรโมชั่นฟรี' : 'Free Promo'}
                  </span>
                )}
              </span>
              <span className={`font-semibold ${deliveryInfo.isFree ? 'text-emerald-600 font-bold' : 'text-slate-800'}`}>
                {deliveryInfo.isFree ? (language === 'th' ? 'ฟรี (฿0)' : 'FREE (฿0)') : `฿${deliveryInfo.fee} THB`}
              </span>
            </div>

            <div className="flex items-center justify-between text-slate-600 pt-1 border-t border-slate-200/60">
              <span className="flex items-center gap-1.5">
                <span>{language === 'th' ? 'วิธีส่งมอบผ้า:' : 'Handover Preference:'}</span>
              </span>
              <span className={`font-bold ${leaveWithJuristic ? 'text-sky-700' : 'text-amber-800'}`}>
                {leaveWithJuristic
                  ? (language === 'th' ? '🏢 ฝากที่นิติบุคคล / ล็อบบี้คอนโด' : '🏢 Condo Juristic / Front Lobby')
                  : (language === 'th' ? '🤝 ส่งมอบกับคนขับโดยตรง (ขึ้นอยู่กับคิวคนขับ)' : '🤝 Meet Up in Person (Subject to Rider Availability)')}
              </span>
            </div>

            <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-sm font-black text-slate-900">
              <span>{language === 'th' ? 'ยอดรวมประมาณการทั้งหมด:' : 'Total Estimated Booking:'}</span>
              <span className="text-sky-600 text-base font-mono">฿{grandEstimatedTotal} THB</span>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || !agreedToTerms}
            className={`w-full py-4 px-6 rounded-2xl font-black text-base transition shadow-xl flex items-center justify-center gap-2 ${
              agreedToTerms
                ? 'bg-gradient-to-r from-sky-600 to-teal-600 hover:from-sky-500 hover:to-teal-500 text-white shadow-sky-600/30 cursor-pointer'
                : 'bg-slate-300 text-slate-500 cursor-not-allowed'
            }`}
          >
            {isSubmitting ? (
              <span>{language === 'th' ? 'กำลังบันทึกข้อมูลการจอง...' : 'Generating Booking Order...'}</span>
            ) : (
              <>
                <Icon name="check" className="w-5 h-5" />
                <span>
                  {language === 'th'
                    ? `ยืนยันและส่งการจอง (ประมาณ ฿${grandEstimatedTotal} บาท)`
                    : `Confirm & Submit Booking (Est. ฿${grandEstimatedTotal} THB)`}
                </span>
              </>
            )}
          </button>

          <p className="text-[11px] text-center text-slate-400">
            {language === 'th'
              ? 'คุณจะได้รับรหัสติดตามสถานะคำสั่งซื้อ พร้อมปุ่มกดเชื่อมต่อ LINE Official Account และ WhatsApp ได้ทันที'
              : 'You will receive a unique tracking ID and 1-click button to connect with our LINE Official Account immediately.'}
          </p>

        </div>

      </form>
    </div>
  );
}