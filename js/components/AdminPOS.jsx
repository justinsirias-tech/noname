import React, { useState, useEffect } from 'react';
import { Icon } from './Icons.jsx';
import { ORDER_STATUSES, BANGKOK_DISTRICTS, TIME_SLOTS } from '../data/servicesData.js';
import { CONTACT_CHANNELS, getLineOaAddFriendUrl, getLineQrCodeUrl, generatePromptPayQrUrl, laundryStore } from '../store.js';
import { OrderKanban } from './OrderKanban.jsx';
import { OrderDetailsModal } from './OrderDetailsModal.jsx';
import { InvoiceModal } from './InvoiceModal.jsx';
import { CustomerCRM } from './CustomerCRM.jsx';
import { UserManagement } from './UserManagement.jsx';
import { FaqManager } from './FaqManager.jsx';
import { IncidentImageLightbox } from './IncidentImageAttachment.jsx';
import { SalesReconciliation } from './SalesReconciliation.jsx';
import { PostalCodeManager } from './PostalCodeManager.jsx';
import GoogleMapsCondoAutocomplete from './GoogleMapsCondoAutocomplete.jsx';
import { 
  DISTRICT_TO_POSTAL_CODE,
  BANGKOK_DISTRICTS_TO_SUBDISTRICTS,
  PATTAYA_SUBDISTRICTS_LIST 
} from '../data/postalCodesData.js';
import {
  canUserAccessFeature,
  getUserAllowedFeatures,
  BACKOFFICE_FEATURES
} from '../data/adminFeatures.js';

export function AdminPOS({
  adminUser,
  onLogout,
  onViewStorefront,
  services,
  orders,
  incidents,
  settings,
  onUpdateServicePricing,
  onUpdateService,
  onUpdateOrderStatus,
  onCreateManualOrder,
  onResolveIncident,
  onResetData
}) {
  const [activeTab, setActiveTab] = useState('orders'); // 'orders', 'services-pricing', 'gateway', 'line-oa', 'incidents', 'new-pos'
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchFilter, setSearchFilter] = useState('');
  const [ordersViewMode, setOrdersViewMode] = useState('kanban'); // 'kanban' or 'table'
  const [inspectingOrderId, setInspectingOrderId] = useState(null);
  const inspectingOrder = orders.find(o => o.id === inspectingOrderId) || null;
  const [invoiceModalOrder, setInvoiceModalOrder] = useState(null);

  // Service Full Drafts State (Pricing, Min Weight, Description, Features Sublist)
  // Categories from Store
  const categories = laundryStore.getCategories ? laundryStore.getCategories() : [];
  const [selectedCategoryTab, setSelectedCategoryTab] = useState('ALL');
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [catFormName, setCatFormName] = useState('');
  const [catFormNameTh, setCatFormNameTh] = useState('');
  const [catFormPricingType, setCatFormPricingType] = useState('piece');
  const [catFormDesc, setCatFormDesc] = useState('');
  const [catFormIcon, setCatFormIcon] = useState('bed');

  // Service Full Drafts State (Pricing, Min Weight, Description, Features Sublist, Category, Unit, PricingType)
  const buildInitialDrafts = (srvList) =>
    (srvList || []).reduce((acc, s) => {
      const isPiece = s.pricingType === 'piece' || s.unit === 'piece';
      const stdPrice = s.standardPricePerKg !== undefined ? s.standardPricePerKg : (s.pricePerKg !== undefined ? s.pricePerKg : 65);
      const nextPrice = s.nextDayPricePerKg !== undefined ? s.nextDayPricePerKg : Math.round(stdPrice * 1.3);
      const samePrice = s.sameDayPricePerKg !== undefined ? s.sameDayPricePerKg : Math.round(stdPrice * 1.75);
      acc[s.id] = {
        name: s.name || '',
        nameTh: s.nameTh || '',
        categoryId: s.categoryId || (isPiece ? 'bedding_linens' : 'laundry_by_weight'),
        pricingType: s.pricingType || (isPiece ? 'piece' : 'weight'),
        unit: s.unit || (isPiece ? 'piece' : 'KG'),
        pricePerKg: stdPrice,
        standardPricePerKg: stdPrice,
        nextDayPricePerKg: nextPrice,
        sameDayPricePerKg: samePrice,
        sameDayAvailable: s.sameDayAvailable !== undefined ? Boolean(s.sameDayAvailable) : true,
        minWeightKg: s.minWeightKg !== undefined ? s.minWeightKg : (isPiece ? 1.0 : 4.0),
        turnaroundHours: s.turnaroundHours !== undefined ? s.turnaroundHours : 48,
        description: s.description || '',
        popular: Boolean(s.popular),
        features: Array.isArray(s.features) ? [...s.features] : []
      };
      return acc;
    }, {});

  const [serviceDrafts, setServiceDrafts] = useState(() => buildInitialDrafts(services));
  const [pricingSuccessMsg, setPricingSuccessMsg] = useState('');
  const [pricingErrorMsg, setPricingErrorMsg] = useState('');
  const [pricingSaving, setPricingSaving] = useState(false);

  // Sync service drafts whenever services prop updates
  useEffect(() => {
    setServiceDrafts(buildInitialDrafts(services));
  }, [services]);

  // Add New Service Modal State
  const [showAddServiceModal, setShowAddServiceModal] = useState(false);
  const [newServiceName, setNewServiceName] = useState('');
  const [newServiceNameTh, setNewServiceNameTh] = useState('');
  const [newServiceCategoryId, setNewServiceCategoryId] = useState('bedding_linens');
  const [newServicePricingType, setNewServicePricingType] = useState('piece');
  const [newServiceUnit, setNewServiceUnit] = useState('piece');
  const [newServicePrice, setNewServicePrice] = useState('80'); // Standard 48h price
  const [newServiceNextDayPrice, setNewServiceNextDayPrice] = useState('110'); // Next Day 24h price
  const [newServiceSameDayPrice, setNewServiceSameDayPrice] = useState('150'); // Same Day <18:00 price
  const [newServiceSameDayAvailable, setNewServiceSameDayAvailable] = useState(true);
  const [newServiceMinWeight, setNewServiceMinWeight] = useState('1.0');
  const [newServiceTurnaround, setNewServiceTurnaround] = useState('48');
  const [newServiceDesc, setNewServiceDesc] = useState('');
  const [newServicePopular, setNewServicePopular] = useState(false);
  const [newServiceFeatures, setNewServiceFeatures] = useState([
    'High-grade commercial sanitization wash',
    'Care label inspection & sorting',
    'Sealed protective packaging',
    'Door-to-door Bangkok courier delivery'
  ]);

  // 3rd-Party Cashless Gateway State
  const [gatewayProvider, setGatewayProvider] = useState(laundryStore.settings?.paymentGateway?.provider || 'Omise / Opn Payments (Thailand)');
  const [merchantName, setMerchantName] = useState(laundryStore.settings?.paymentGateway?.merchantName || 'NoName Laundry Bangkok Co., Ltd.');
  const [promptpayEnabled, setPromptpayEnabled] = useState(laundryStore.settings?.paymentGateway?.promptpayEnabled ?? true);
  const [cardEnabled, setCardEnabled] = useState(laundryStore.settings?.paymentGateway?.creditCardEnabled ?? true);
  const [gatewayTestMode, setGatewayTestMode] = useState(laundryStore.settings?.paymentGateway?.testMode ?? true);
  const [gatewaySuccessMsg, setGatewaySuccessMsg] = useState('');
  const [gatewayErrorMsg, setGatewayErrorMsg] = useState('');
  const [gatewaySaving, setGatewaySaving] = useState(false);

  // LINE OA & Contact Channels State
  const [adminLineOa, setAdminLineOa] = useState(laundryStore.settings?.lineOaId || '@nonamelaundry');
  const [adminWhatsapp, setAdminWhatsapp] = useState(laundryStore.settings?.whatsappNumber || '+66 94 882 1920');
  const [adminEmail, setAdminEmail] = useState(laundryStore.settings?.supportEmail || 'support@nonamelaundry.com');
  const [channelSuccessMsg, setChannelSuccessMsg] = useState('');
  const [channelErrorMsg, setChannelErrorMsg] = useState('');
  const [channelSaving, setChannelSaving] = useState(false);

  // Google Maps State
  const [googleMapsApiKey, setGoogleMapsApiKey] = useState(laundryStore.settings?.googleMapsApiKey || '');
  const [mapsSaving, setMapsSaving] = useState(false);
  const [mapsSuccessMsg, setMapsSuccessMsg] = useState('');
  const [mapsErrorMsg, setMapsErrorMsg] = useState('');

  // Automatically synchronize settings form fields whenever remote settings change
  useEffect(() => {
    if (settings) {
      if (settings.paymentGateway) {
        if (settings.paymentGateway.provider !== undefined) setGatewayProvider(settings.paymentGateway.provider);
        if (settings.paymentGateway.merchantName !== undefined) setMerchantName(settings.paymentGateway.merchantName);
        if (settings.paymentGateway.promptpayEnabled !== undefined) setPromptpayEnabled(Boolean(settings.paymentGateway.promptpayEnabled));
        if (settings.paymentGateway.creditCardEnabled !== undefined) setCardEnabled(Boolean(settings.paymentGateway.creditCardEnabled));
        if (settings.paymentGateway.testMode !== undefined) setGatewayTestMode(Boolean(settings.paymentGateway.testMode));
      }
      if (settings.lineOaId) setAdminLineOa(settings.lineOaId);
      if (settings.whatsappNumber) setAdminWhatsapp(settings.whatsappNumber);
      if (settings.supportEmail) setAdminEmail(settings.supportEmail);
      if (settings.googleMapsApiKey !== undefined) setGoogleMapsApiKey(settings.googleMapsApiKey);
    }
  }, [settings]);

  const handleSaveGoogleMapsSettings = async (e) => {
    e.preventDefault();
    setMapsSaving(true);
    setMapsSuccessMsg('');
    setMapsErrorMsg('');
    try {
      await laundryStore.updateGoogleMapsSettings(googleMapsApiKey.trim());
      setMapsSuccessMsg('Google Maps API settings saved successfully!');
      setTimeout(() => setMapsSuccessMsg(''), 4000);
    } catch (err) {
      console.error('Error saving Google Maps settings:', err);
      setMapsErrorMsg(`Failed to save Google Maps settings: ${err.message}`);
    } finally {
      setMapsSaving(false);
    }
  };

  // Admin Password Management State
  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdSuccessMsg, setPwdSuccessMsg] = useState('');
  const [pwdErrorMsg, setPwdErrorMsg] = useState('');

  const handleAdminChangePassword = async (e) => {
    e.preventDefault();
    setPwdSuccessMsg('');
    setPwdErrorMsg('');

    if (newPwd !== confirmPwd) {
      setPwdErrorMsg('New passwords do not match.');
      return;
    }

    if (newPwd.length < 6) {
      setPwdErrorMsg('New password must be at least 6 characters.');
      return;
    }

    setPwdLoading(true);
    try {
      const headers = laundryStore.getAdminAuthHeaders();
      const res = await fetch('/api/admin/change-password', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          currentPassword: currentPwd,
          newPassword: newPwd
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to update password');
      }

      setPwdSuccessMsg('Password updated successfully! Next login will require your new password.');
      setCurrentPwd('');
      setNewPwd('');
      setConfirmPwd('');
      setTimeout(() => setPwdSuccessMsg(''), 5000);
    } catch (err) {
      setPwdErrorMsg(err.message || 'Error updating password');
    } finally {
      setPwdLoading(false);
    }
  };

  // Manual POS Order Form State
  const [manualName, setManualName] = useState('');
  const [manualChannel, setManualChannel] = useState('line');
  const [manualContact, setManualContact] = useState('');
  const [manualServiceId, setManualServiceId] = useState(services[0]?.id || 'wash_fold');
  const [manualCity, setManualCity] = useState('Bangkok');
  const [manualDistrict, setManualDistrict] = useState(BANGKOK_DISTRICTS[0]);
  const [manualSubdistrict, setManualSubdistrict] = useState(
    BANGKOK_DISTRICTS_TO_SUBDISTRICTS[BANGKOK_DISTRICTS[0]]?.[0]?.name || 'Khlong Toei Nuea'
  );
  const [manualPostalCode, setManualPostalCode] = useState(
    BANGKOK_DISTRICTS_TO_SUBDISTRICTS[BANGKOK_DISTRICTS[0]]?.[0]?.code || '10110'
  );
  const [manualCondo, setManualCondo] = useState('');
  const [manualWeight, setManualWeight] = useState('4.0');
  const [manualSpeed, setManualSpeed] = useState('standard_48h');
  const [manualSuccessMsg, setManualSuccessMsg] = useState('');

  const applyManualLocationUpdate = (loc) => {
    if (!loc) return;
    let targetCity = loc.city;
    if (!targetCity) {
      if ((loc.postalCode && loc.postalCode.startsWith('20')) || (loc.zipcode && loc.zipcode.startsWith('20'))) {
        targetCity = 'Pattaya';
      } else {
        targetCity = 'Bangkok';
      }
    }
    setManualCity(targetCity);

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
        setManualDistrict(ptySub.district);
        setManualSubdistrict(ptySub.name);
        setManualPostalCode(ptySub.code);
      }
    } else {
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
        matchedDist = manualDistrict || 'Watthana';
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

      setManualDistrict(matchedDist);

      if (matchedSub) {
        setManualSubdistrict(matchedSub.name);
        setManualPostalCode(loc.postalCode || loc.zipcode || matchedSub.code);
      } else if (subList.length > 0) {
        setManualSubdistrict(subList[0].name);
        setManualPostalCode(loc.postalCode || loc.zipcode || subList[0].code || DISTRICT_TO_POSTAL_CODE[matchedDist] || '10110');
      } else {
        setManualPostalCode(loc.postalCode || loc.zipcode || DISTRICT_TO_POSTAL_CODE[matchedDist] || '10110');
      }
    }
  };

  // Manual Order Live Calculation
  const selManualSrv = services.find(s => s.id === manualServiceId) || services[0];
  const isManualPiece = selManualSrv?.pricingType === 'piece' || selManualSrv?.unit === 'piece';
  const manualEstQty = parseFloat(manualWeight) || (isManualPiece ? 1 : 4.0);
  const manualRate = manualSpeed === 'same_day'
    ? (selManualSrv?.sameDayPricePerKg || Math.round((selManualSrv?.standardPricePerKg || 65) * 1.75))
    : (manualSpeed === 'next_day_24h'
      ? (selManualSrv?.nextDayPricePerKg || Math.round((selManualSrv?.standardPricePerKg || 65) * 1.3))
      : (selManualSrv?.standardPricePerKg || selManualSrv?.pricePerKg || 65));
  const manualSubtotal = isManualPiece
    ? Math.round(manualEstQty * manualRate)
    : Math.round(Math.max(manualEstQty, selManualSrv?.minWeightKg || 4.0) * manualRate);
  const manualDeliveryFeeResult = laundryStore.calculateDeliveryFee ? laundryStore.calculateDeliveryFee({
    city: manualCity,
    district: manualDistrict,
    subdistrict: manualSubdistrict,
    postalCode: manualPostalCode
  }, manualSubtotal) : { fee: 50, zoneName: manualCity };
  const manualGrandTotal = manualSubtotal + manualDeliveryFeeResult.fee;

  // Stats Calculations
  const totalOrdersCount = orders.length;
  const activeOrdersCount = orders.filter(o => o.status !== 'DELIVERED' && o.status !== 'CANCELLED').length;
  const pendingWeighCount = orders.filter(o => o.status === 'PICKED_UP' || (o.status !== 'DELIVERED' && !o.actualWeightKg)).length;
  const totalRevenue = orders.reduce((sum, o) => sum + (Number(o.totalPrice) || 0), 0);
  const pendingIncidentsCount = incidents.filter(i => i.status === 'pending').length;
  const unreconciledPaidCount = orders.filter(o => o.paymentStatus === 'PAID' && o.reconciliationStatus !== 'RECONCILED').length;

  // Back-Office Feature Navigation Definition & Permission Resolution
  const allNavTabs = [
    { id: 'orders', label: 'Order Processing & Tracking', icon: 'package', count: orders.length },
    { id: 'sales-reconciliation', label: 'Sales & Reconciliation', icon: 'calculator', count: unreconciledPaidCount },
    { id: 'users', label: 'User Management', icon: 'shield' },
    { id: 'crm', label: 'Customer CRM', icon: 'users', count: laundryStore.customers ? laundryStore.customers.length : 0 },
    { id: 'faq', label: 'FAQ Manager', icon: 'helpCircle', count: laundryStore.faqs ? laundryStore.faqs.length : 0 },
    { id: 'services-pricing', label: 'Services & Menu Catalog', icon: 'layers', count: services.length },
    { id: 'postal-rates', label: 'Delivery Zones & Rates', icon: 'truck', count: laundryStore.getPostalCodeRates ? laundryStore.getPostalCodeRates().length : 0 },
    { id: 'gateway', label: 'Cashless Payment Gateway', icon: 'receipt' },
    { id: 'line-oa', label: 'LINE OA & Contact Channels', icon: 'line' },
    { id: 'incidents', label: 'Online Support & Tickets', icon: 'messageSquare', count: pendingIncidentsCount },
    { id: 'new-pos', label: 'Manual POS Order', icon: 'send' }
  ];

  const accessibleTabs = allNavTabs.filter(tab => canUserAccessFeature(adminUser, tab.id));
  const isCurrentTabAllowed = canUserAccessFeature(adminUser, activeTab);

  // Auto-redirect to first accessible module if user lands on an unauthorized tab
  useEffect(() => {
    if (accessibleTabs.length > 0 && !canUserAccessFeature(adminUser, activeTab)) {
      setActiveTab(accessibleTabs[0].id);
    }
  }, [adminUser, activeTab, accessibleTabs]);

  const handleOpenOrderModal = (order) => {
    setInspectingOrderId(order.id);
  };

  // Service Draft & Feature List Handlers
  const handleDraftFieldChange = (serviceId, field, value) => {
    setServiceDrafts(prev => ({
      ...prev,
      [serviceId]: {
        ...prev[serviceId],
        [field]: value
      }
    }));
  };

  const handleFeatureChange = (serviceId, featIdx, value) => {
    setServiceDrafts(prev => {
      const srv = prev[serviceId];
      if (!srv) return prev;
      const nextFeats = [...(srv.features || [])];
      nextFeats[featIdx] = value;
      return {
        ...prev,
        [serviceId]: {
          ...srv,
          features: nextFeats
        }
      };
    });
  };

  const handleAddFeature = (serviceId) => {
    setServiceDrafts(prev => {
      const srv = prev[serviceId];
      if (!srv) return prev;
      const nextFeats = [...(srv.features || []), ''];
      return {
        ...prev,
        [serviceId]: {
          ...srv,
          features: nextFeats
        }
      };
    });
  };

  const handleRemoveFeature = (serviceId, featIdx) => {
    setServiceDrafts(prev => {
      const srv = prev[serviceId];
      if (!srv) return prev;
      const nextFeats = (srv.features || []).filter((_, idx) => idx !== featIdx);
      return {
        ...prev,
        [serviceId]: {
          ...srv,
          features: nextFeats
        }
      };
    });
  };

  // Category Management Handlers
  const handleOpenCategoryModal = (catToEdit = null) => {
    if (catToEdit) {
      setEditingCategory(catToEdit);
      setCatFormName(catToEdit.name || '');
      setCatFormNameTh(catToEdit.nameTh || '');
      setCatFormPricingType(catToEdit.pricingType || 'piece');
      setCatFormDesc(catToEdit.description || '');
      setCatFormIcon(catToEdit.icon || 'bed');
    } else {
      setEditingCategory(null);
      setCatFormName('');
      setCatFormNameTh('');
      setCatFormPricingType('piece');
      setCatFormDesc('');
      setCatFormIcon('bed');
    }
    setShowCategoryModal(true);
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    if (!catFormName.trim()) return;

    if (editingCategory) {
      await laundryStore.updateCategory(editingCategory.id, {
        name: catFormName.trim(),
        nameTh: catFormNameTh.trim(),
        pricingType: catFormPricingType,
        description: catFormDesc.trim(),
        icon: catFormIcon
      });
      setPricingSuccessMsg(`Category "${catFormName}" updated successfully!`);
    } else {
      const added = await laundryStore.addCategory({
        name: catFormName.trim(),
        nameTh: catFormNameTh.trim(),
        pricingType: catFormPricingType,
        description: catFormDesc.trim(),
        icon: catFormIcon
      });
      setPricingSuccessMsg(`Category "${added.name}" created successfully!`);
    }
    setShowCategoryModal(false);
    setTimeout(() => setPricingSuccessMsg(''), 4000);
  };

  const handleDeleteCategory = async (catId, catName) => {
    if (confirm(`Are you sure you want to delete category "${catName}"? Any services inside will be reassigned to Laundry by Weight.`)) {
      await laundryStore.deleteCategory(catId);
      setPricingSuccessMsg(`Category "${catName}" deleted.`);
      setTimeout(() => setPricingSuccessMsg(''), 3000);
    }
  };

  const handleSaveSingleService = async (serviceId) => {
    const draft = serviceDrafts[serviceId];
    if (!draft) return;
    setPricingSaving(true);
    setPricingSuccessMsg('');
    setPricingErrorMsg('');
    try {
      const isPiece = draft.pricingType === 'piece' || draft.unit === 'piece';
      const cleanFeatures = (draft.features || []).map(f => typeof f === 'string' ? f.trim() : '').filter(Boolean);
      const stdPrice = parseFloat(draft.standardPricePerKg || draft.pricePerKg) || 65;
      const nextPrice = parseFloat(draft.nextDayPricePerKg) || Math.round(stdPrice * 1.3);
      const samePrice = parseFloat(draft.sameDayPricePerKg) || Math.round(stdPrice * 1.75);
      const payload = {
        name: draft.name,
        nameTh: draft.nameTh,
        categoryId: draft.categoryId || (isPiece ? 'bedding_linens' : 'laundry_by_weight'),
        pricingType: draft.pricingType || (isPiece ? 'piece' : 'weight'),
        unit: draft.unit || (isPiece ? 'piece' : 'KG'),
        pricePerKg: stdPrice,
        standardPricePerKg: stdPrice,
        nextDayPricePerKg: nextPrice,
        sameDayPricePerKg: samePrice,
        sameDayAvailable: Boolean(draft.sameDayAvailable !== false),
        minWeightKg: isPiece ? (parseFloat(draft.minWeightKg) || 1.0) : Math.max(1, parseFloat(draft.minWeightKg) || 4.0),
        turnaroundHours: parseInt(draft.turnaroundHours) || 48,
        description: draft.description,
        popular: Boolean(draft.popular),
        features: cleanFeatures
      };

      await laundryStore.updateServiceFull(serviceId, payload);
      setPricingSuccessMsg(`Service "${draft.name}" saved to Google Cloud database successfully!`);
      setTimeout(() => setPricingSuccessMsg(''), 4000);
    } catch (err) {
      console.error('Error saving single service:', err);
      setPricingErrorMsg(`Failed to save "${draft.name}": ${err.message}`);
    } finally {
      setPricingSaving(false);
    }
  };

  const handleSavePricing = async (e) => {
    if (e) e.preventDefault();
    setPricingSaving(true);
    setPricingSuccessMsg('');
    setPricingErrorMsg('');
    try {
      const payloadList = Object.keys(serviceDrafts).map((srvId) => {
        const draft = serviceDrafts[srvId];
        const isPiece = draft.pricingType === 'piece' || draft.unit === 'piece';
        const cleanFeatures = (draft.features || []).map(f => typeof f === 'string' ? f.trim() : '').filter(Boolean);
        const stdPrice = parseFloat(draft.standardPricePerKg || draft.pricePerKg) || 65;
        const nextPrice = parseFloat(draft.nextDayPricePerKg) || Math.round(stdPrice * 1.3);
        const samePrice = parseFloat(draft.sameDayPricePerKg) || Math.round(stdPrice * 1.75);
        return {
          id: srvId,
          name: draft.name,
          nameTh: draft.nameTh,
          categoryId: draft.categoryId || (isPiece ? 'bedding_linens' : 'laundry_by_weight'),
          pricingType: draft.pricingType || (isPiece ? 'piece' : 'weight'),
          unit: draft.unit || (isPiece ? 'piece' : 'KG'),
          pricePerKg: stdPrice,
          standardPricePerKg: stdPrice,
          nextDayPricePerKg: nextPrice,
          sameDayPricePerKg: samePrice,
          sameDayAvailable: Boolean(draft.sameDayAvailable !== false),
          minWeightKg: isPiece ? (parseFloat(draft.minWeightKg) || 1.0) : Math.max(1, parseFloat(draft.minWeightKg) || 4.0),
          turnaroundHours: parseInt(draft.turnaroundHours) || 48,
          description: draft.description,
          popular: Boolean(draft.popular),
          features: cleanFeatures
        };
      });

      await laundryStore.updateAllServices(payloadList);
      setPricingSuccessMsg('All service pricing, minimum weights & bullet sublists saved to Google Cloud PostgreSQL successfully!');
      setTimeout(() => setPricingSuccessMsg(''), 4000);
    } catch (err) {
      console.error('Error batch saving pricing:', err);
      setPricingErrorMsg(`Failed to save pricing: ${err.message}`);
    } finally {
      setPricingSaving(false);
    }
  };

  // Handlers for Add New Service Modal Bullet Points
  const handleNewServiceFeatureChange = (idx, val) => {
    setNewServiceFeatures(prev => {
      const next = [...prev];
      next[idx] = val;
      return next;
    });
  };

  const handleAddNewServiceFeature = () => {
    setNewServiceFeatures(prev => [...prev, '']);
  };

  const handleRemoveNewServiceFeature = (idx) => {
    setNewServiceFeatures(prev => prev.filter((_, i) => i !== idx));
  };

  const handleAddNewService = (e) => {
    e.preventDefault();
    if (!newServiceName.trim() || !newServicePrice) return;

    const isPiece = newServicePricingType === 'piece';
    const cleanFeatures = newServiceFeatures.map(f => typeof f === 'string' ? f.trim() : '').filter(Boolean);
    const stdPrice = parseFloat(newServicePrice) || 65;
    const nextPrice = parseFloat(newServiceNextDayPrice) || Math.round(stdPrice * 1.3);
    const samePrice = parseFloat(newServiceSameDayPrice) || Math.round(stdPrice * 1.75);

    const added = laundryStore.addService({
      name: newServiceName.trim(),
      nameTh: newServiceNameTh.trim() || newServiceName.trim(),
      categoryId: newServiceCategoryId || (isPiece ? 'bedding_linens' : 'laundry_by_weight'),
      pricingType: newServicePricingType,
      unit: newServiceUnit || (isPiece ? 'piece' : 'KG'),
      pricePerKg: stdPrice,
      standardPricePerKg: stdPrice,
      nextDayPricePerKg: nextPrice,
      sameDayPricePerKg: samePrice,
      sameDayAvailable: Boolean(newServiceSameDayAvailable),
      minWeightKg: isPiece ? (parseFloat(newServiceMinWeight) || 1.0) : (parseFloat(newServiceMinWeight) || 4.0),
      turnaroundHours: parseInt(newServiceTurnaround) || 48,
      description: newServiceDesc.trim() || 'Professional laundry and linen processing service across Bangkok.',
      popular: newServicePopular,
      features: cleanFeatures.length > 0 ? cleanFeatures : [
        'Premium wash & conditioning',
        'Fabric care & sanitization',
        'Dust-free protective packaging',
        'Direct Bangkok condo delivery'
      ]
    });

    setShowAddServiceModal(false);
    setNewServiceName('');
    setNewServiceNameTh('');
    setNewServicePrice('80');
    setNewServiceNextDayPrice('110');
    setNewServiceSameDayPrice('150');
    setNewServiceSameDayAvailable(true);
    setNewServiceMinWeight('1.0');
    setNewServiceTurnaround('48');
    setNewServiceDesc('');
    setNewServiceFeatures([
      'High-grade commercial sanitization wash',
      'Care label inspection & sorting',
      'Sealed protective packaging',
      'Door-to-door Bangkok courier delivery'
    ]);
    setPricingSuccessMsg(`New service "${added.name}" created in category "${categories.find(c => c.id === added.categoryId)?.name || 'Custom'}"! Live on menu.`);
    setTimeout(() => setPricingSuccessMsg(''), 4000);
  };

  const handleDeleteService = (serviceId, serviceName) => {
    if (confirm(`Are you sure you want to remove the service "${serviceName}"?`)) {
      laundryStore.deleteService(serviceId);
      setPricingSuccessMsg(`Service "${serviceName}" removed.`);
      setTimeout(() => setPricingSuccessMsg(''), 3000);
    }
  };

  const handleSaveGatewaySettings = async (e) => {
    e.preventDefault();
    setGatewaySaving(true);
    setGatewaySuccessMsg('');
    setGatewayErrorMsg('');
    try {
      await laundryStore.updatePaymentGatewaySettings({
        provider: gatewayProvider,
        merchantName: merchantName.trim(),
        promptpayEnabled,
        creditCardEnabled: cardEnabled,
        testMode: gatewayTestMode
      });
      setGatewaySuccessMsg('Cashless payment gateway settings saved to Google Cloud PostgreSQL successfully!');
      setTimeout(() => setGatewaySuccessMsg(''), 4000);
    } catch (err) {
      console.error('Error saving gateway settings:', err);
      setGatewayErrorMsg(`Failed to save gateway settings: ${err.message}`);
    } finally {
      setGatewaySaving(false);
    }
  };

  const handleCreateManualOrder = (e) => {
    e.preventDefault();
    if (!manualName.trim() || !manualContact.trim() || !manualCondo.trim()) return;

    onCreateManualOrder({
      customerName: manualName.trim(),
      contactChannel: manualChannel,
      contactValue: manualContact.trim(),
      email: `${manualName.toLowerCase().replace(/\s+/g, '')}@chat.local`,
      serviceId: manualServiceId,
      city: manualCity,
      district: manualDistrict,
      subdistrict: manualSubdistrict,
      postalCode: manualPostalCode,
      deliveryFee: manualDeliveryFeeResult.fee,
      condoName: manualCondo.trim(),
      roomNumber: 'Lobby Juristic',
      leaveWithJuristic: true,
      quantity: isManualPiece ? (parseInt(manualWeight) || 1) : null,
      unit: isManualPiece ? (selManualSrv?.unit || 'piece') : 'KG',
      estimatedWeightKg: isManualPiece ? (parseInt(manualWeight) || 1) : (parseFloat(manualWeight) || 4.0),
      turnaroundSpeed: manualSpeed,
      pickupDate: new Date().toISOString().split('T')[0],
      pickupTime: TIME_SLOTS[0],
      specialInstructions: 'Staff entered from direct chat inquiry.'
    });

    setManualSuccessMsg('Order logged successfully into POS!');
    setManualName('');
    setManualContact('');
    setManualCondo('');
    setTimeout(() => setManualSuccessMsg(''), 3000);
  };

  const filteredOrders = orders.filter(order => {
    if (!order) return false;
    const orderStatusNorm = (order.status || '').toUpperCase().trim();
    const filterStatusNorm = (statusFilter || '').toUpperCase().trim();
    const matchesStatus = filterStatusNorm === 'ALL' || orderStatusNorm === filterStatusNorm;
    const search = searchFilter.trim().toLowerCase();
    const matchesSearch = !search ||
      (order.id && order.id.toLowerCase().includes(search)) ||
      (order.customerName && order.customerName.toLowerCase().includes(search)) ||
      (order.condoName && order.condoName.toLowerCase().includes(search)) ||
      (order.district && order.district.toLowerCase().includes(search)) ||
      (order.tagNumber && order.tagNumber.toLowerCase().includes(search));
    return matchesStatus && matchesSearch;
  });

  // Incident Photo Evidence Lightbox State
  const [incidentLightboxImg, setIncidentLightboxImg] = useState(null);
  const [incidentLightboxTitle, setIncidentLightboxTitle] = useState('Incident Photo Evidence');

  // ESC key listener to close modals
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' || e.key === 'Esc') {
        if (invoiceModalOrder) {
          setInvoiceModalOrder(null);
        } else if (incidentLightboxImg) {
          setIncidentLightboxImg(null);
        } else if (showAddServiceModal) {
          setShowAddServiceModal(false);
        } else if (inspectingOrderId) {
          setInspectingOrderId(null);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [invoiceModalOrder, incidentLightboxImg, showAddServiceModal, inspectingOrderId]);

  return (
    <div className="mx-auto px-3 sm:px-6 lg:px-8 py-6 transition-all max-w-[1750px] w-full">
      
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200 print:hidden">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-lg bg-slate-900 text-white font-mono text-xs font-bold">
              ADMIN CONTROL CENTER
            </span>
            <span className="text-xs text-emerald-600 font-bold flex items-center gap-1 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Bangkok Operations Active
            </span>
            <span className="text-xs text-sky-700 font-bold bg-sky-50 px-2.5 py-1 rounded-lg border border-sky-200">
              100% Cashless System
            </span>
            <span className="text-xs text-indigo-700 font-bold bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-200 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Google Cloud PostgreSQL (noname_web)
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
            NoName Laundry Admin Back-Office
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Configure minimum weights (default 4.0 KG), service prices, 3rd-party payment gateway, add new services, and manage job lifecycles.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {adminUser && (
            <div className="px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span><strong>{adminUser.fullName || adminUser.username}</strong></span>
              <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                adminUser.role === 'super_admin' ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                adminUser.role === 'manager' ? 'bg-indigo-100 text-indigo-800 border border-indigo-300' :
                adminUser.role === 'rider' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                'bg-sky-100 text-sky-800 border border-sky-300'
              }`}>
                {adminUser.role === 'super_admin' ? '👑 Super Admin' : adminUser.role === 'manager' ? '🏬 Store Manager' : adminUser.role === 'rider' ? '🛵 Rider' : (adminUser.roleName || '👔 ' + adminUser.role)}
              </span>
              <span className="text-[10px] text-slate-400 font-mono hidden sm:inline" title="Accessible back-office modules">
                ({accessibleTabs.length}/11)
              </span>
            </div>
          )}

          {onViewStorefront && (
            <button
              onClick={onViewStorefront}
              className="px-3 py-1.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-xs font-semibold text-slate-700 flex items-center gap-1.5 transition shadow-2xs"
              title="Return to customer public website"
            >
              <Icon name="externalLink" className="w-3.5 h-3.5 text-slate-500" />
              <span>Customer Website</span>
            </button>
          )}

          <button
            onClick={onResetData}
            className="px-3 py-1.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-xs font-semibold text-slate-600 flex items-center gap-1.5 transition"
            title="Reset store to default sample data"
          >
            <Icon name="refresh" className="w-3.5 h-3.5" />
            <span>Reset Demo Data</span>
          </button>

          {onLogout && (
            <button
              onClick={onLogout}
              className="px-3 py-1.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-xs font-bold text-rose-700 flex items-center gap-1.5 transition shadow-sm"
              title="Log out of Admin Back-Office"
            >
              <Icon name="logOut" className="w-3.5 h-3.5" />
              <span>Log Out</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 my-6 print:hidden">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-[11px] font-bold uppercase text-slate-400">Total Jobs</div>
          <div className="text-2xl font-black text-slate-900 mt-1">{totalOrdersCount}</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-[11px] font-bold uppercase text-sky-600">Active In-Progress</div>
          <div className="text-2xl font-black text-sky-600 mt-1">{activeOrdersCount}</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-[11px] font-bold uppercase text-amber-600">Pending Scale Weigh-In</div>
          <div className="text-2xl font-black text-amber-600 mt-1">{pendingWeighCount}</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-[11px] font-bold uppercase text-emerald-600">Total Revenue</div>
          <div className="text-2xl font-black text-emerald-600 mt-1">฿{totalRevenue.toLocaleString()} THB</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm col-span-2 lg:col-span-1">
          <div className="text-[11px] font-bold uppercase text-purple-600">Digital Support Tickets</div>
          <div className="text-2xl font-black text-purple-600 mt-1">{pendingIncidentsCount} Open</div>
        </div>
      </div>

      {/* Nav Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-200 pb-3 mb-6 print:hidden">
        {accessibleTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3.5 py-2 text-xs font-bold rounded-xl transition flex items-center gap-2 border ${
              activeTab === tab.id
                ? 'border-sky-500 text-sky-700 bg-sky-50 shadow-xs ring-2 ring-sky-100'
                : 'border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 bg-white'
            }`}
          >
            <Icon name={tab.icon} className={`w-4 h-4 ${activeTab === tab.id ? 'text-sky-600' : 'text-slate-500'}`} />
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                activeTab === tab.id ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-600 border border-slate-200'
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ACCESS RESTRICTED SCREEN */}
      {!isCurrentTabAllowed && (
        <div className="bg-white rounded-3xl p-10 sm:p-14 text-center border border-slate-200 shadow-sm space-y-4 max-w-xl mx-auto my-8">
          <div className="w-16 h-16 rounded-3xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto text-3xl shadow-sm">
            🔒
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-black text-slate-900">
              Access Restricted
            </h3>
            <p className="text-xs font-bold text-amber-600">
              จำกัดสิทธิ์การเข้าถึงโมดูลนี้
            </p>
          </div>
          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
            Your current role (<strong>{adminUser?.roleName || adminUser?.role || 'Staff'}</strong>) or user account has not been granted access to the <strong className="text-slate-800">"{activeTab}"</strong> module. Please contact a Super Administrator if you require access.
          </p>
          {accessibleTabs.length > 0 && (
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setActiveTab(accessibleTabs[0].id)}
                className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-md shadow-sky-600/20 transition flex items-center gap-2 mx-auto"
              >
                <Icon name={accessibleTabs[0].icon} className="w-4 h-4" />
                <span>Go to Allowed Module: {accessibleTabs[0].label}</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB 1: ORDER PROCESSING */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white p-4 rounded-2xl border border-slate-200">
            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              {/* View Switcher Toggle */}
              <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => setOrdersViewMode('kanban')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    ordersViewMode === 'kanban'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Icon name="kanban" className="w-3.5 h-3.5 text-sky-600" />
                  <span>Kanban Board</span>
                </button>
                <button
                  type="button"
                  onClick={() => setOrdersViewMode('table')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    ordersViewMode === 'table'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Icon name="list" className="w-3.5 h-3.5 text-slate-600" />
                  <span>Table View</span>
                </button>
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500 hidden sm:inline">Status:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-semibold bg-white"
                >
                  <option value="ALL">All Statuses ({orders.length})</option>
                  {Object.keys(ORDER_STATUSES).map((k) => (
                    <option key={k} value={k}>{ORDER_STATUSES[k].label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="w-full sm:w-72">
              <input
                type="text"
                placeholder="Search ID, customer, condo, tag..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="w-full px-3.5 py-1.5 rounded-xl border border-slate-300 text-xs"
              />
            </div>
          </div>

          {/* Kanban Board View */}
          {ordersViewMode === 'kanban' ? (
            <OrderKanban
              orders={filteredOrders}
              onSelectOrder={(order) => setInspectingOrderId(order.id)}
              onOpenInvoice={(order) => setInvoiceModalOrder(order)}
              onUpdateOrderStatus={onUpdateOrderStatus}
              onMarkPaid={(orderId, method) => laundryStore.markOrderPaid(orderId, method)}
            />
          ) : (
            /* Traditional Table View with clickable rows */
            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="py-3.5 px-4">Tracking ID & Date</th>
                      <th className="py-3.5 px-4">Customer & Channel</th>
                      <th className="py-3.5 px-4">Service</th>
                      <th className="py-3.5 px-4">Est. vs Actual KG</th>
                      <th className="py-3.5 px-4">Cashless Payment</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="py-8 text-center text-slate-400">
                          No orders matching the current filter.
                        </td>
                      </tr>
                    ) : (
                      filteredOrders.map((order) => {
                        const meta = ORDER_STATUSES[order.status] || { label: order.status, color: 'bg-slate-100 text-slate-800' };
                        const isPaid = order.paymentStatus === 'PAID';
                        return (
                          <tr
                            key={order.id}
                            onClick={() => setInspectingOrderId(order.id)}
                            className="hover:bg-sky-50/50 cursor-pointer transition"
                            title="Click to view full order details & history"
                          >
                            <td className="py-3.5 px-4">
                              <div className="font-mono font-bold text-slate-900 hover:text-sky-600 transition">{order.id}</div>
                              <div className="text-[10px] text-slate-400">{order.pickupDate}</div>
                              <div className="text-[10px] text-sky-600 font-mono font-semibold">{order.tagNumber}</div>
                            </td>

                            <td className="py-3.5 px-4">
                              <div className="font-bold text-slate-900">{order.customerName}</div>
                              <div className="text-[11px] text-slate-500">{order.condoName}</div>
                              <div className="inline-flex items-center gap-1 text-[10px] uppercase font-bold text-slate-400 mt-0.5">
                                <span>{order.contactChannel}:</span>
                                <span className="font-mono text-slate-600">{order.contactValue}</span>
                              </div>
                            </td>

                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="font-semibold text-slate-800">{order.serviceName}</span>
                                {order.turnaroundSpeed === 'same_day' ? (
                                  <span className="px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 font-extrabold text-[9px] inline-flex items-center gap-0.5">
                                    <span>🚀 Same Day (&lt;18h)</span>
                                  </span>
                                ) : (order.turnaroundSpeed === 'next_day_24h' || order.turnaroundSpeed === 'next_day') ? (
                                  <span className="px-1.5 py-0.5 rounded-full bg-sky-100 text-sky-800 border border-sky-300 font-bold text-[9px] inline-flex items-center gap-0.5">
                                    <span>⚡ Next Day (24h)</span>
                                  </span>
                                ) : (
                                  <span className="px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 font-medium text-[9px] inline-flex items-center gap-0.5">
                                    <span>🕒 Standard (48h)</span>
                                  </span>
                                )}
                              </div>
                              <div className="text-[10px] text-slate-400">Rate: ฿{order.pricePerKg}/KG (Min {order.minWeightAppliedKg || 4}KG)</div>
                            </td>

                            <td className="py-3.5 px-4">
                              <div className="text-slate-600">Est: <strong>{order.estimatedWeightKg} KG</strong></div>
                              <div className="mt-0.5">
                                {order.actualWeightKg ? (
                                  <span className="font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                                    Scale: {order.actualWeightKg} KG
                                  </span>
                                ) : (
                                  <span className="text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded text-[10px] font-semibold border border-amber-200">
                                    Pending scale weigh-in
                                  </span>
                                )}
                              </div>
                            </td>

                            <td className="py-3.5 px-4">
                              <div className="font-black text-slate-900">฿{order.totalPrice}</div>
                              <div className="mt-0.5">
                                {isPaid ? (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                                    <Icon name="check" className="w-2.5 h-2.5" /> PAID (Gateway)
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-bold">
                                    Awaiting Online Pay
                                  </span>
                                )}
                              </div>
                            </td>

                            <td className="py-3.5 px-4">
                              <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border inline-block ${meta.color}`}>
                                {meta.label}
                              </span>
                            </td>

                            <td className="py-3.5 px-4 text-right space-x-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setInspectingOrderId(order.id);
                                }}
                                className="px-3 py-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 text-xs font-bold transition"
                              >
                                View Details
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setInvoiceModalOrder(order);
                                }}
                                className="px-2.5 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition shadow-2xs inline-flex items-center gap-1"
                                title="Create & Send Invoice / Payment Link"
                              >
                                <Icon name="fileText" className="w-3 h-3" />
                                <span>Invoice</span>
                              </button>
                              {!isPaid && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    laundryStore.markOrderPaid(order.id, 'PromptPay QR (Gateway Test)');
                                  }}
                                  className="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold transition"
                                  title="Mark as Paid via Gateway"
                                >
                                  Mark Paid
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB: SALES REPORTING & RECONCILIATION */}
      {activeTab === 'sales-reconciliation' && (
        <SalesReconciliation
          orders={orders}
          services={services}
          adminUser={adminUser}
          onReconcileOrder={(orderId, reconData) => laundryStore.reconcileOrder(orderId, reconData)}
          onBatchReconcileOrders={(orderIds, reconData) => laundryStore.batchReconcileOrders(orderIds, reconData)}
          onMarkPaid={(orderId, method) => laundryStore.markOrderPaid(orderId, method)}
          onUpdateServicePricing={onUpdateServicePricing}
          onNavigateToServices={() => setActiveTab('services-pricing')}
        />
      )}

      {/* TAB 2: SERVICES, LINENS & MENU CATALOG */}
      {activeTab === 'services-pricing' && (
        <div className="max-w-4xl mx-auto space-y-6">
          
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-100 text-sky-800 text-xs font-bold mb-1">
                  <Icon name="layers" className="w-3.5 h-3.5" />
                  <span>Service Menu, Linens & Custom Categories</span>
                </div>
                <h2 className="text-xl font-black text-slate-900">
                  Service Catalog & Pricing Controls
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Manage weight-based laundry (฿/KG), piece-based linens & bedding (฿/piece), custom categories, and turn-around pricing tiers.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleOpenCategoryModal()}
                  className="px-3.5 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition shrink-0"
                >
                  <Icon name="folder" className="w-4 h-4 text-sky-600" />
                  <span>Categories ({categories.length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddServiceModal(true)}
                  className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md transition shrink-0"
                >
                  <Icon name="plus" className="w-4 h-4" />
                  <span>Add Service</span>
                </button>
              </div>
            </div>

            {/* Category Filter Tabs Bar */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              <button
                type="button"
                onClick={() => setSelectedCategoryTab('all')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
                  selectedCategoryTab === 'all'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>All Catalog Items</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20">
                  {services.length}
                </span>
              </button>
              {categories.map((cat) => {
                const count = services.filter(s => (s.categoryId || (s.pricingType === 'piece' ? 'bedding_linens' : 'laundry_by_weight')) === cat.id).length;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategoryTab(cat.id)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
                      selectedCategoryTab === cat.id
                        ? 'bg-sky-600 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <Icon name={cat.icon || 'layers'} className="w-3.5 h-3.5" />
                    <span>{cat.name}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      selectedCategoryTab === cat.id ? 'bg-white/20' : 'bg-slate-200 text-slate-700'
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {pricingSuccessMsg && (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
                <Icon name="check" className="w-4 h-4 text-emerald-600" />
                <span>{pricingSuccessMsg}</span>
              </div>
            )}

            {pricingErrorMsg && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-bold flex items-center gap-2">
                <Icon name="alertCircle" className="w-4 h-4 text-red-600" />
                <span>{pricingErrorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSavePricing} className="space-y-6">
              <div className="space-y-6">
                {(selectedCategoryTab === 'all'
                  ? services
                  : services.filter(s => (s.categoryId || (s.pricingType === 'piece' ? 'bedding_linens' : 'laundry_by_weight')) === selectedCategoryTab)
                ).map((service) => {
                  const draft = serviceDrafts[service.id] || {
                    name: service.name,
                    nameTh: service.nameTh,
                    categoryId: service.categoryId || (service.pricingType === 'piece' ? 'bedding_linens' : 'laundry_by_weight'),
                    pricingType: service.pricingType || 'weight',
                    unit: service.unit || (service.pricingType === 'piece' ? 'piece' : 'KG'),
                    pricePerKg: service.pricePerKg,
                    minWeightKg: service.minWeightKg,
                    turnaroundHours: service.turnaroundHours,
                    description: service.description,
                    popular: service.popular,
                    features: service.features || []
                  };

                  const isPiece = draft.pricingType === 'piece' || draft.unit === 'piece';
                  const unitLabel = isPiece ? (draft.unit || 'piece') : 'KG';

                  return (
                    <div
                      key={service.id}
                      className="p-6 rounded-3xl bg-slate-50 border border-slate-200 shadow-sm space-y-4 relative group hover:border-slate-300 transition"
                    >
                      {/* Top Bar: Name, Category, Pricing Model, Delete */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="w-8 h-8 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-sm">
                            {isPiece ? '🛏️' : '🧺'}
                          </span>
                          <div>
                            <input
                              type="text"
                              value={draft.name}
                              onChange={(e) => handleDraftFieldChange(service.id, 'name', e.target.value)}
                              className="font-extrabold text-slate-900 text-base bg-transparent border-b border-transparent hover:border-slate-300 focus:border-sky-500 focus:bg-white px-1.5 py-0.5 rounded transition"
                              title="Click to edit service English name"
                            />
                            <input
                              type="text"
                              value={draft.nameTh || ''}
                              onChange={(e) => handleDraftFieldChange(service.id, 'nameTh', e.target.value)}
                              placeholder="Thai Name (ชื่อภาษาไทย)"
                              className="text-xs text-sky-600 font-semibold bg-transparent border-b border-transparent hover:border-slate-300 focus:border-sky-500 focus:bg-white px-1.5 py-0.5 rounded ml-1 transition"
                              title="Click to edit service Thai name"
                            />
                          </div>

                          {/* Category Tag Dropdown */}
                          <select
                            value={draft.categoryId || (isPiece ? 'bedding_linens' : 'laundry_by_weight')}
                            onChange={(e) => handleDraftFieldChange(service.id, 'categoryId', e.target.value)}
                            className="text-[11px] font-bold px-2 py-1 rounded-lg border border-slate-300 bg-white text-slate-700"
                            title="Assign service category"
                          >
                            {categories.map((c) => (
                              <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                          </select>

                          {/* Pricing Model Dropdown */}
                          <select
                            value={draft.pricingType || (isPiece ? 'piece' : 'weight')}
                            onChange={(e) => {
                              const newType = e.target.value;
                              handleDraftFieldChange(service.id, 'pricingType', newType);
                              handleDraftFieldChange(service.id, 'unit', newType === 'piece' ? 'piece' : 'KG');
                              if (newType === 'piece' && (parseFloat(draft.minWeightKg) || 4.0) > 1.0) {
                                handleDraftFieldChange(service.id, 'minWeightKg', 1.0);
                              }
                            }}
                            className={`text-[11px] font-bold px-2 py-1 rounded-lg border ${
                              isPiece
                                ? 'bg-indigo-50 text-indigo-800 border-indigo-200'
                                : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            }`}
                            title="Pricing Model: Weight vs Piece"
                          >
                            <option value="weight">🧺 By Weight (KG)</option>
                            <option value="piece">🛏️ By Piece (per item)</option>
                          </select>

                          {draft.popular && (
                            <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full border border-amber-200">
                              Popular
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-auto">
                          <label className="text-xs font-semibold text-slate-600 flex items-center gap-1.5 cursor-pointer bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                            <input
                              type="checkbox"
                              checked={draft.popular}
                              onChange={(e) => handleDraftFieldChange(service.id, 'popular', e.target.checked)}
                              className="w-3.5 h-3.5 text-sky-600 rounded"
                            />
                            <span className="text-[11px]">Popular</span>
                          </label>

                          <span className="text-xs font-mono font-bold bg-white px-2.5 py-1 rounded-lg border border-slate-200 text-slate-500">
                            ID: {service.id}
                          </span>

                          {services.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleDeleteService(service.id, draft.name)}
                              className="text-slate-400 hover:text-red-600 hover:bg-red-50 p-1.5 rounded-lg transition"
                              title="Delete this service"
                            >
                              <Icon name="trash" className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Description */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Service Description
                        </label>
                        <textarea
                          rows="2"
                          value={draft.description}
                          onChange={(e) => handleDraftFieldChange(service.id, 'description', e.target.value)}
                          className="w-full px-3 py-1.5 rounded-xl border border-slate-300 text-xs text-slate-800 bg-white leading-relaxed focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                          placeholder="Describe the laundry procedure, garment types, fold/iron styles..."
                        />
                      </div>

                      {/* 3-Tier Pricing & Weight/Quantity Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 bg-white p-4 rounded-2xl border border-slate-200">
                        {/* Standard 48h Price */}
                        <div>
                          <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center gap-1">
                            <span>🕒 Standard 48h (฿/{unitLabel}) *</span>
                          </label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">฿</span>
                            <input
                              type="number"
                              min="1"
                              max="5000"
                              required
                              value={draft.standardPricePerKg !== undefined ? draft.standardPricePerKg : draft.pricePerKg}
                              onChange={(e) => {
                                handleDraftFieldChange(service.id, 'standardPricePerKg', e.target.value);
                                handleDraftFieldChange(service.id, 'pricePerKg', e.target.value);
                              }}
                              className="w-full pl-7 pr-3 py-2 rounded-xl border border-slate-300 text-sm font-bold text-slate-900 bg-white focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                            />
                          </div>
                          <span className="text-[10px] text-slate-400 mt-0.5 block">Standard ~48h turnaround</span>
                        </div>

                        {/* Next Day 24h Price */}
                        <div>
                          <label className="block text-xs font-bold text-sky-800 mb-1 flex items-center gap-1">
                            <span>⚡ Next Day 24h (฿/{unitLabel}) *</span>
                          </label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sky-500 font-bold text-xs">฿</span>
                            <input
                              type="number"
                              min="1"
                              max="5000"
                              required
                              value={draft.nextDayPricePerKg !== undefined ? draft.nextDayPricePerKg : Math.round((draft.pricePerKg || 65) * 1.3)}
                              onChange={(e) => handleDraftFieldChange(service.id, 'nextDayPricePerKg', e.target.value)}
                              className="w-full pl-7 pr-3 py-2 rounded-xl border border-sky-300 text-sm font-bold text-sky-950 bg-sky-50/40 focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                            />
                          </div>
                          <span className="text-[10px] text-sky-700/80 mt-0.5 block">Next day ~24h delivery</span>
                        </div>

                        {/* Same Day Price */}
                        <div>
                          <label className="block text-xs font-bold text-amber-800 mb-1 flex items-center gap-1">
                            <span>🚀 Same Day (฿/{unitLabel}) *</span>
                          </label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-500 font-bold text-xs">฿</span>
                            <input
                              type="number"
                              min="1"
                              max="5000"
                              required
                              value={draft.sameDayPricePerKg !== undefined ? draft.sameDayPricePerKg : Math.round((draft.pricePerKg || 65) * 1.75)}
                              onChange={(e) => handleDraftFieldChange(service.id, 'sameDayPricePerKg', e.target.value)}
                              className="w-full pl-7 pr-3 py-2 rounded-xl border border-amber-300 text-sm font-bold text-amber-950 bg-amber-50/40 focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                            />
                          </div>
                          <span className="text-[10px] text-amber-700/80 mt-0.5 block">Deliver before 18:00 hrs</span>
                        </div>

                        {/* Minimum Weight or Quantity */}
                        <div>
                          <label className="block text-xs font-bold text-slate-800 mb-1">
                            {isPiece ? `Min Qty (${unitLabel}) *` : 'Min Weight (KG) *'}
                          </label>
                          <div className="relative">
                            <input
                              type="number"
                              min="1"
                              max="50"
                              step={isPiece ? '1' : '0.5'}
                              required
                              value={draft.minWeightKg}
                              onChange={(e) => handleDraftFieldChange(service.id, 'minWeightKg', e.target.value)}
                              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-bold text-slate-900 bg-white focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">{unitLabel}</span>
                          </div>
                          <span className="text-[10px] text-slate-400 mt-0.5 block">{isPiece ? 'Min 1 item' : 'Standard 4.0 KG min'}</span>
                        </div>

                        {/* Turnaround Standard Hours */}
                        <div>
                          <label className="block text-xs font-bold text-slate-800 mb-1">
                            Standard Hours
                          </label>
                          <div className="relative">
                            <input
                              type="number"
                              min="1"
                              max="168"
                              value={draft.turnaroundHours}
                              onChange={(e) => handleDraftFieldChange(service.id, 'turnaroundHours', e.target.value)}
                              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-bold text-slate-900 bg-white focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">hrs</span>
                          </div>
                          <span className="text-[10px] text-slate-400 mt-0.5 block">Default 48h standard</span>
                        </div>
                      </div>

                      {/* Same Day Availability Switch */}
                      <div className="flex items-center justify-between p-3 rounded-xl bg-amber-50/60 border border-amber-200">
                        <label className="flex items-center gap-2.5 cursor-pointer text-xs">
                          <input
                            type="checkbox"
                            checked={draft.sameDayAvailable !== false}
                            onChange={(e) => handleDraftFieldChange(service.id, 'sameDayAvailable', e.target.checked)}
                            className="w-4 h-4 text-amber-600 rounded"
                          />
                          <div>
                            <span className="font-bold text-amber-950 block">🚀 Offer Same Day Express Speed (Delivered Before 18:00 hrs)</span>
                            <span className="text-[11px] text-amber-800/80">When enabled, customers can select Same Day Express in the booking wizard at ฿{draft.sameDayPricePerKg || Math.round((draft.pricePerKg || 65) * 1.75)}/{unitLabel}.</span>
                          </div>
                        </label>
                      </div>

                      {/* INCLUDED IN SERVICE: Bullet Points Sublist Editor */}
                      <div className="bg-white rounded-2xl p-4 border border-slate-200 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                              ✓
                            </div>
                            <h5 className="font-extrabold text-xs text-slate-900 uppercase tracking-wide">
                              Included In Service (Bullet Points Sublist)
                            </h5>
                          </div>
                          <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            {draft.features?.length || 0} bullets active
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500">
                          These bullet points display under <strong>"INCLUDED IN SERVICE:"</strong> on customer cards. Edit any bullet point text directly, click ✕ to delete, or click <strong>+ Add Bullet Point</strong> below.
                        </p>

                        <div className="space-y-2 pt-1">
                          {(draft.features || []).map((feat, featIdx) => (
                            <div key={featIdx} className="flex items-center gap-2">
                              <span className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-200">
                                <Icon name="check" className="w-3.5 h-3.5" />
                              </span>
                              <input
                                type="text"
                                value={feat}
                                onChange={(e) => handleFeatureChange(service.id, featIdx, e.target.value)}
                                placeholder="e.g. Hypoallergenic wash & fragrance-free detergent"
                                className="flex-1 px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-medium text-slate-800 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 bg-white"
                              />
                              <button
                                type="button"
                                onClick={() => handleRemoveFeature(service.id, featIdx)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                                title="Delete this bullet point"
                              >
                                <Icon name="trash" className="w-4 h-4" />
                              </button>
                            </div>
                          ))}

                          <button
                            type="button"
                            onClick={() => handleAddFeature(service.id)}
                            className="mt-2 px-3.5 py-1.5 rounded-xl border border-dashed border-sky-400 text-sky-600 hover:bg-sky-50 text-xs font-bold flex items-center gap-1.5 transition"
                          >
                            <Icon name="plus" className="w-3.5 h-3.5" />
                            <span>+ Add Bullet Point to {draft.name}</span>
                          </button>
                        </div>
                      </div>

                      {/* Card Footer: Minimum Charge & Save Button */}
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-200/80">
                        <div className="text-xs text-slate-600 flex items-center gap-2 flex-wrap">
                          <span>Standard Min: <strong className="text-slate-900 font-black">฿{Math.round((parseFloat(draft.standardPricePerKg || draft.pricePerKg) || 0) * (parseFloat(draft.minWeightKg) || 1.0))} THB</strong></span>
                          <span className="text-slate-400">•</span>
                          <span>Next Day Min: <strong className="text-slate-900 font-black">฿{Math.round((parseFloat(draft.nextDayPricePerKg || draft.pricePerKg) || 0) * (parseFloat(draft.minWeightKg) || 1.0))} THB</strong></span>
                          <span className="text-slate-400">•</span>
                          {draft.sameDayAvailable !== false ? (
                            <span>Same Day Min: <strong className="text-amber-800 font-black">฿{Math.round((parseFloat(draft.sameDayPricePerKg) || Math.round((parseFloat(draft.pricePerKg) || 80) * 1.75)) * (parseFloat(draft.minWeightKg) || 1.0))} THB</strong></span>
                          ) : (
                            <span className="text-slate-400 italic">Same day disabled</span>
                          )}
                        </div>

                        <button
                          type="button"
                          disabled={pricingSaving}
                          onClick={() => handleSaveSingleService(service.id)}
                          className="w-full sm:w-auto px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-bold shadow transition flex items-center justify-center gap-1.5"
                        >
                          <Icon name="check" className="w-3.5 h-3.5 text-emerald-400" />
                          <span>{pricingSaving ? 'Saving...' : `Save ${draft.name} & Sublist`}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Big Global Save Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={pricingSaving}
                  className="w-full py-4 px-6 rounded-2xl bg-sky-600 hover:bg-sky-500 disabled:opacity-60 text-white font-bold text-sm shadow-lg shadow-sky-600/20 transition flex items-center justify-center gap-2"
                >
                  <Icon name="check" className="w-4 h-4" />
                  <span>{pricingSaving ? 'Saving to Database...' : 'Save All Service Prices, Weights & Bullet Sublists'}</span>
                </button>
              </div>
            </form>
          </div>

        </div>
      )}

      {/* TAB 3: 3RD-PARTY CASHLESS GATEWAY CONFIG */}
      {activeTab === 'gateway' && (
        <div className="max-w-3xl mx-auto bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold mb-2">
              <Icon name="receipt" className="w-3.5 h-3.5 text-emerald-600" />
              <span>100% Cashless Gateway Architecture</span>
            </div>
            <h2 className="text-xl font-black text-slate-900">
              3rd-Party Payment Gateway Integration
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              NoName Laundry is strictly cashless. All payments are collected digitally via Thai 3rd-party payment gateways (PromptPay QR, Credit Cards, Mobile Banking).
            </p>
          </div>

          {gatewaySuccessMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
              <Icon name="check" className="w-4 h-4 text-emerald-600" />
              <span>{gatewaySuccessMsg}</span>
            </div>
          )}

          {gatewayErrorMsg && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-bold flex items-center gap-2">
              <Icon name="alertCircle" className="w-4 h-4 text-red-600" />
              <span>{gatewayErrorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSaveGatewaySettings} className="space-y-5 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Active Payment Gateway Provider *
              </label>
              <select
                value={gatewayProvider}
                onChange={(e) => setGatewayProvider(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-bold bg-white text-slate-900"
              >
                <option value="Omise / Opn Payments (Thailand)">Omise / Opn Payments (Recommended for Thailand)</option>
                <option value="Stripe (Thailand)">Stripe Payments (Thailand)</option>
                <option value="2C2P Thailand">2C2P Payment Gateway</option>
                <option value="GB Prime Pay">GB Prime Pay (Thai QR PromptPay)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Registered Merchant Legal Name *
              </label>
              <input
                type="text"
                required
                value={merchantName}
                onChange={(e) => setMerchantName(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 font-semibold"
              />
            </div>

            {/* Payment Methods */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <div className="font-bold text-slate-800 text-xs uppercase tracking-wide">
                Enabled Cashless Methods:
              </div>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={promptpayEnabled}
                  onChange={(e) => setPromptpayEnabled(e.target.checked)}
                  className="w-4 h-4 text-sky-600 rounded"
                />
                <div>
                  <span className="font-bold text-slate-900 block">Thai PromptPay QR (Instant Mobile Scan)</span>
                  <span className="text-[11px] text-slate-500">Generates instant dynamic QR for mobile banking apps (KBANK, SCB, BBL, KTB).</span>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={cardEnabled}
                  onChange={(e) => setCardEnabled(e.target.checked)}
                  className="w-4 h-4 text-sky-600 rounded"
                />
                <div>
                  <span className="font-bold text-slate-900 block">Credit & Debit Cards (Visa, Mastercard, JCB)</span>
                  <span className="text-[11px] text-slate-500">Secure 3D-Secure 2.0 gateway processing with tokenization.</span>
                </div>
              </label>
            </div>

            {/* Strict Cashless Policy Enforcer */}
            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-amber-900 text-xs flex items-start gap-3">
              <Icon name="shieldAlert" className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong>Cashless Policy Active:</strong> Cash on Delivery (COD) is strictly disabled across all customer touchpoints. Couriers do not carry cash pouches.
              </div>
            </div>

            <button
              type="submit"
              disabled={gatewaySaving}
              className="w-full py-3.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold text-xs shadow-md transition"
            >
              {gatewaySaving ? 'Saving to Database...' : 'Save Payment Gateway Settings'}
            </button>
          </form>
        </div>
      )}

      {/* TAB 4: LINE OA & CHANNELS */}
      {activeTab === 'line-oa' && (
        <div className="max-w-3xl mx-auto bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <div className="inline-flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-green-500 text-white flex items-center justify-center font-bold">
                <Icon name="line" className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">
                  LINE Official Account & Contact Configuration
                </h3>
                <p className="text-xs text-slate-500">
                  Configure your business LINE OA ID so customers can add and message your official account with 1 click.
                </p>
              </div>
            </div>
          </div>

          {channelSuccessMsg && (
            <div className="p-3.5 rounded-xl bg-green-50 border border-green-200 text-green-800 text-xs font-bold flex items-center gap-2">
              <Icon name="check" className="w-4 h-4 text-green-600" />
              <span>{channelSuccessMsg}</span>
            </div>
          )}

          {channelErrorMsg && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-bold flex items-center gap-2">
              <Icon name="alertCircle" className="w-4 h-4 text-red-600" />
              <span>{channelErrorMsg}</span>
            </div>
          )}

          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setChannelSaving(true);
              setChannelSuccessMsg('');
              setChannelErrorMsg('');
              try {
                await laundryStore.updateLineOaSettings(adminLineOa.trim(), adminWhatsapp.trim(), adminEmail.trim());
                setChannelSuccessMsg('LINE OA and contact settings saved to Google Cloud PostgreSQL successfully!');
                setTimeout(() => setChannelSuccessMsg(''), 5000);
              } catch (err) {
                console.error('Error saving line OA settings:', err);
                setChannelErrorMsg(`Failed to save contact settings: ${err.message}`);
              } finally {
                setChannelSaving(false);
              }
            }}
            className="space-y-4 text-xs"
          >
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                LINE Official Account ID (with @ symbol) *
              </label>
              <input
                type="text"
                required
                placeholder="@nonamelaundry"
                value={adminLineOa}
                onChange={(e) => setAdminLineOa(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono font-bold bg-white text-green-700 text-sm"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Generated Add-Friend Link: <code className="text-green-800 font-bold">{getLineOaAddFriendUrl(adminLineOa)}</code>
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  WhatsApp Official Phone Number *
                </label>
                <input
                  type="text"
                  required
                  placeholder="+66 94 882 1920"
                  value={adminWhatsapp}
                  onChange={(e) => setAdminWhatsapp(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 font-mono font-bold bg-white text-slate-800"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Customer Support Email *
                </label>
                <input
                  type="email"
                  required
                  placeholder="support@nonamelaundry.com"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 font-mono font-bold bg-white text-slate-800"
                />
              </div>
            </div>

            {/* QR Code Live Preview */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center gap-4">
              <img
                src={getLineQrCodeUrl(adminLineOa)}
                alt="LINE QR Code Preview"
                className="w-24 h-24 rounded-lg border border-slate-300 bg-white"
              />
              <div>
                <div className="font-bold text-slate-800 text-xs">Customer QR Code Preview</div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  This dynamic QR code is displayed to desktop customers on booking completion and on the tracking portal.
                </p>
              </div>
            </div>

            <button
              type="submit"
              disabled={channelSaving}
              className="w-full py-3.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold text-xs shadow-md transition"
            >
              {channelSaving ? 'Saving to Database...' : 'Save LINE OA & Contact Settings'}
            </button>
          </form>

          {/* Google Maps & Geolocation API Configuration */}
          <div className="pt-6 border-t border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 via-emerald-500 to-amber-500 text-white flex items-center justify-center font-bold shadow-sm">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                    <span>Google Maps & Places Geolocation API</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                      {googleMapsApiKey ? 'Custom Google Cloud API' : 'Bangkok Engine Active'}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Powers residence autocomplete, condominium discovery, and Bangkok district mapping in Booking & POS.
                  </p>
                </div>
              </div>
            </div>

            {mapsSuccessMsg && (
              <div className="mb-4 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
                <Icon name="check" className="w-4 h-4 text-emerald-600" />
                <span>{mapsSuccessMsg}</span>
              </div>
            )}

            {mapsErrorMsg && (
              <div className="mb-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2">
                <span className="text-rose-600 font-bold text-sm">⚠️</span>
                <span>{mapsErrorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSaveGoogleMapsSettings} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Google Maps JavaScript / Places API Key (Optional)
                </label>
                <input
                  type="text"
                  placeholder="AIzaSy... (Leave empty to use built-in Bangkok Condos database + Google Embed)"
                  value={googleMapsApiKey}
                  onChange={(e) => setGoogleMapsApiKey(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                />
                <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed">
                  💡 If left empty, our intelligent Bangkok Condominiums Engine covers 120+ top Bangkok high-rises, luxury condominiums, serviced residences, and landmarks across all 11 districts with automatic GPS matching and free Google Map embed previews out-of-the-box.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 space-y-1.5 text-[11px]">
                <div className="font-bold text-slate-800 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  Active Features Powered by Google Maps:
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <span className="text-emerald-600 font-bold">✓</span> Real-time condo autocomplete & instant search
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-emerald-600 font-bold">✓</span> Auto-detect Bangkok district from building
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-emerald-600 font-bold">✓</span> Browser GPS & Geolocation ("Locate Me")
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-emerald-600 font-bold">✓</span> Interactive Google Maps pin & route link
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={mapsSaving}
                className="w-full py-3.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold text-xs shadow-md transition"
              >
                {mapsSaving ? 'Saving Google Maps Settings...' : 'Save Google Maps Settings'}
              </button>
            </form>
          </div>

          {/* Admin Account Security & Password Management */}
          <div className="pt-6 border-t border-slate-200">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold">
                <Icon name="lock" className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">
                  Admin Account & Security
                </h3>
                <p className="text-xs text-slate-500">
                  Update your administrator password to secure POS operations.
                </p>
              </div>
            </div>

            {pwdSuccessMsg && (
              <div className="mb-4 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
                <Icon name="check" className="w-4 h-4 text-emerald-600" />
                <span>{pwdSuccessMsg}</span>
              </div>
            )}

            {pwdErrorMsg && (
              <div className="mb-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2">
                <span className="text-rose-600 font-bold text-sm">⚠️</span>
                <span>{pwdErrorMsg}</span>
              </div>
            )}

            <form onSubmit={handleAdminChangePassword} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Current Admin Password *
                </label>
                <input
                  type="password"
                  required
                  placeholder="Enter current password"
                  value={currentPwd}
                  onChange={(e) => setCurrentPwd(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono bg-white text-slate-800 text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    New Password (min 6 chars) *
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Enter new password"
                    value={newPwd}
                    onChange={(e) => setNewPwd(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono bg-white text-slate-800 text-sm"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Confirm New Password *
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Repeat new password"
                    value={confirmPwd}
                    onChange={(e) => setConfirmPwd(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono bg-white text-slate-800 text-sm"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={pwdLoading}
                className="w-full py-3 px-4 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2"
              >
                {pwdLoading ? (
                  <span>Updating Password in PostgreSQL...</span>
                ) : (
                  <>
                    <Icon name="shield" className="w-4 h-4" />
                    <span>Update Admin Password</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TAB 5: ONLINE INCIDENTS & TICKETS */}
      {activeTab === 'incidents' && (
        <div className="space-y-4">
          <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200 flex items-center gap-3 text-xs text-amber-900">
            <Icon name="phoneOff" className="w-5 h-5 text-amber-700 shrink-0" />
            <span>
              <strong>Reminder for Staff:</strong> All customer queries are strictly handled online via <strong>WhatsApp, LINE, or Email</strong>. Do NOT place voice phone calls.
            </span>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="divide-y divide-slate-100">
              {incidents.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs">
                  No active incidents or support tickets reported.
                </div>
              ) : (
                incidents.map((inc) => (
                  <div key={inc.id} className="p-5 hover:bg-slate-50 transition space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono font-bold text-slate-900 text-xs bg-slate-100 px-2 py-0.5 rounded border border-slate-200">{inc.id}</span>
                        <span className="text-slate-400">•</span>
                        <span className="font-bold text-slate-800 text-xs">Order: {inc.orderId}</span>
                        {inc.category && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-800 border border-sky-200">
                            {inc.category}
                          </span>
                        )}
                        {inc.severity && (
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            inc.severity === 'critical' ? 'bg-rose-100 text-rose-800 border border-rose-300' :
                            inc.severity === 'urgent' ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                            'bg-slate-100 text-slate-700 border border-slate-200'
                          }`}>
                            {inc.severity.toUpperCase()} URGENCY
                          </span>
                        )}
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          inc.status === 'resolved' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-amber-100 text-amber-800 border border-amber-200'
                        }`}>
                          {inc.status}
                        </span>
                      </div>

                      <div className="text-[11px] text-slate-400 font-mono">
                        {inc.createdAt ? inc.createdAt.substring(0, 16).replace('T', ' ') : ''}
                      </div>
                    </div>

                    {/* Affected Garment / Item Pill */}
                    {inc.affectedItem && (
                      <div className="flex items-center gap-2 text-xs bg-slate-50 p-2 rounded-xl border border-slate-200 text-slate-700">
                        <Icon name="tag" className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                        <span>Affected Item / Garment: <strong className="text-slate-900">{inc.affectedItem}</strong></span>
                      </div>
                    )}

                    <div>
                      <h4 className="text-sm font-extrabold text-slate-900">{inc.subject}</h4>
                      <p className="text-xs text-slate-600 mt-1 bg-slate-50 p-3 rounded-xl border border-slate-200 leading-relaxed">
                        "{inc.message}"
                      </p>
                    </div>

                    {/* Attached Photo Evidence Thumbnail */}
                    {inc.imageUrl && (
                      <div className="p-3 bg-white rounded-xl border border-slate-200">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-1">
                            <Icon name="camera" className="w-3 h-3 text-sky-600" />
                            <span>Customer Photo Evidence</span>
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setIncidentLightboxImg(inc.imageUrl);
                              setIncidentLightboxTitle(`Evidence: ${inc.id} - ${inc.subject}`);
                            }}
                            className="text-[11px] text-sky-600 hover:text-sky-800 font-bold flex items-center gap-1"
                          >
                            <Icon name="zoomIn" className="w-3 h-3" />
                            <span>View Full Resolution</span>
                          </button>
                        </div>
                        <div
                          onClick={() => {
                            setIncidentLightboxImg(inc.imageUrl);
                            setIncidentLightboxTitle(`Evidence: ${inc.id} - ${inc.subject}`);
                          }}
                          className="relative group w-32 h-24 sm:w-44 sm:h-32 rounded-xl overflow-hidden cursor-pointer border border-slate-300 bg-slate-900 shadow-2xs hover:shadow-md transition"
                          title="Click to view full photo"
                        >
                          <img
                            src={inc.imageUrl}
                            alt={`Evidence for ${inc.id}`}
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                          />
                          <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1">
                            <Icon name="zoomIn" className="w-4 h-4" />
                            <span>Inspect</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {inc.response && (
                      <div className="text-xs text-emerald-800 bg-emerald-50 p-3 rounded-xl border border-emerald-200">
                        <strong className="block mb-0.5 text-emerald-900">Staff Response Log:</strong>
                        {inc.response}
                      </div>
                    )}

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-slate-500">Contact:</span>
                        <span className="font-bold text-slate-800">{inc.customerName} ({inc.contact})</span>
                      </div>

                      <div className="flex items-center gap-2">
                        {inc.channel === 'whatsapp' && (
                          <a
                            href={`${CONTACT_CHANNELS.whatsapp.url}Regarding%20ticket%20${inc.id}%20for%20order%20${inc.orderId}:%20`}
                            target="_blank"
                            rel="noreferrer"
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold inline-flex items-center gap-1 shadow-sm"
                          >
                            <Icon name="whatsapp" className="w-3.5 h-3.5" />
                            <span>Reply via WhatsApp</span>
                          </a>
                        )}

                        {inc.channel === 'line' && (
                          <a
                            href={getLineOaAddFriendUrl(adminLineOa)}
                            target="_blank"
                            rel="noreferrer"
                            className="px-3 py-1.5 rounded-lg bg-green-600 hover:bg-green-500 text-white text-xs font-bold inline-flex items-center gap-1 shadow-sm"
                          >
                            <Icon name="line" className="w-3.5 h-3.5" />
                            <span>Reply via LINE</span>
                          </a>
                        )}

                        {inc.status !== 'resolved' && (
                          <button
                            onClick={() => {
                              const note = prompt('Enter staff resolution summary note:') || 'Issue investigated and resolved via online chat.';
                              onResolveIncident(inc.id, note);
                            }}
                            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition"
                          >
                            Mark as Resolved
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: MANUAL POS ORDER */}
      {activeTab === 'new-pos' && (
        <div className="max-w-2xl mx-auto bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
          <div>
            <h2 className="text-lg font-black text-slate-900">Create Walk-in / Chat Order</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Log an order for customers messaging directly on WhatsApp or LINE. Cashless billing only.
            </p>
          </div>

          {manualSuccessMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
              {manualSuccessMsg}
            </div>
          )}

          <form onSubmit={handleCreateManualOrder} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Customer Name *</label>
              <input
                type="text"
                required
                value={manualName}
                onChange={(e) => setManualName(e.target.value)}
                placeholder="Customer Full Name"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Channel *</label>
                <select
                  value={manualChannel}
                  onChange={(e) => setManualChannel(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                >
                  <option value="line">LINE</option>
                  <option value="whatsapp">WhatsApp</option>
                  <option value="email">Email</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Contact Handle / Phone *</label>
                <input
                  type="text"
                  required
                  value={manualContact}
                  onChange={(e) => setManualContact(e.target.value)}
                  placeholder="@lineid or +66..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Service Tier *</label>
                <select
                  value={manualServiceId}
                  onChange={(e) => setManualServiceId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                >
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Turnaround Speed *</label>
                <select
                  value={manualSpeed}
                  onChange={(e) => setManualSpeed(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-semibold"
                >
                  {(() => {
                    const selSrv = services.find(s => s.id === manualServiceId) || services[0];
                    const isPiece = selSrv?.pricingType === 'piece' || selSrv?.unit === 'piece';
                    const unitLbl = isPiece ? (selSrv?.unit || 'piece') : 'KG';
                    const stdP = selSrv?.standardPricePerKg || selSrv?.pricePerKg || 65;
                    const nextP = selSrv?.nextDayPricePerKg || Math.round(stdP * 1.3);
                    const sameP = selSrv?.sameDayPricePerKg || Math.round(stdP * 1.75);
                    return (
                      <>
                        <option value="standard_48h">🕒 Standard 48h (฿{stdP}/{unitLbl})</option>
                        <option value="next_day_24h">⚡ Next Day 24h (฿{nextP}/{unitLbl})</option>
                        {selSrv?.sameDayAvailable !== false && (
                          <option value="same_day">🚀 Same Day (&lt;18:00) (฿{sameP}/{unitLbl})</option>
                        )}
                      </>
                    );
                  })()}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {isManualPiece ? `Quantity (${selManualSrv?.unit || 'pieces'}) *` : 'Weight Estimate (KG) *'}
                </label>
                <input
                  type="number"
                  step={isManualPiece ? '1' : '0.1'}
                  min="1"
                  required
                  value={manualWeight}
                  onChange={(e) => setManualWeight(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 font-bold"
                />
              </div>
            </div>

            <div className="space-y-3">
              {/* City Selection */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Service City *</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setManualCity('Bangkok');
                      const defaultDist = BANGKOK_DISTRICTS[0];
                      const subList = BANGKOK_DISTRICTS_TO_SUBDISTRICTS[defaultDist] || [];
                      const defaultSub = subList[0];
                      setManualDistrict(defaultDist);
                      setManualSubdistrict(defaultSub ? defaultSub.name : '');
                      setManualPostalCode(defaultSub ? defaultSub.code : (DISTRICT_TO_POSTAL_CODE[defaultDist] || '10110'));
                    }}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                      manualCity === 'Bangkok'
                        ? 'border-sky-500 bg-sky-50 text-sky-900 shadow-xs'
                        : 'border-slate-200 text-slate-600 bg-white hover:border-slate-300'
                    }`}
                  >
                    <span>🏙️</span>
                    <span>Bangkok</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setManualCity('Pattaya');
                      const firstPty = PATTAYA_SUBDISTRICTS_LIST[0];
                      setManualDistrict(firstPty.district);
                      setManualSubdistrict(firstPty.name);
                      setManualPostalCode(firstPty.code);
                    }}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                      manualCity === 'Pattaya'
                        ? 'border-amber-500 bg-amber-50 text-amber-900 shadow-xs'
                        : 'border-slate-200 text-slate-600 bg-white hover:border-slate-300'
                    }`}
                  >
                    <span>🏖️</span>
                    <span>Pattaya</span>
                  </button>
                </div>
              </div>

              {manualCity === 'Bangkok' ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">District *</label>
                    <select
                      value={manualDistrict}
                      onChange={(e) => {
                        const d = e.target.value;
                        setManualDistrict(d);
                        const subList = BANGKOK_DISTRICTS_TO_SUBDISTRICTS[d] || [];
                        if (subList.length > 0) {
                          setManualSubdistrict(subList[0].name);
                          setManualPostalCode(subList[0].code);
                        } else if (DISTRICT_TO_POSTAL_CODE[d]) {
                          setManualPostalCode(DISTRICT_TO_POSTAL_CODE[d]);
                        }
                      }}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs"
                    >
                      {BANGKOK_DISTRICTS.map((d, i) => (
                        <option key={i} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Sub-district (Khwaeng) *</label>
                    <select
                      value={manualSubdistrict}
                      onChange={(e) => {
                        const s = e.target.value;
                        setManualSubdistrict(s);
                        const subList = BANGKOK_DISTRICTS_TO_SUBDISTRICTS[manualDistrict] || [];
                        const found = subList.find(item => item.name === s);
                        if (found) setManualPostalCode(found.code);
                      }}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-semibold"
                    >
                      {(BANGKOK_DISTRICTS_TO_SUBDISTRICTS[manualDistrict] || []).map((sub, i) => (
                        <option key={i} value={sub.name}>
                          {sub.name} (฿{sub.fee})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block font-bold text-slate-700">Postal Code *</label>
                      <span className="text-[10px] font-bold text-sky-600 font-mono">
                        {manualDeliveryFeeResult.isFree ? 'FREE' : `฿${manualDeliveryFeeResult.fee}`}
                      </span>
                    </div>
                    <input
                      type="text"
                      maxLength="5"
                      required
                      placeholder="e.g. 10110"
                      value={manualPostalCode}
                      onChange={(e) => setManualPostalCode(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono font-bold text-xs"
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Pattaya Zone / Sub-district *</label>
                    <select
                      value={manualSubdistrict}
                      onChange={(e) => {
                        const name = e.target.value;
                        setManualSubdistrict(name);
                        const found = PATTAYA_SUBDISTRICTS_LIST.find(p => p.name === name);
                        if (found) {
                          setManualDistrict(found.district);
                          setManualPostalCode(found.code);
                        }
                      }}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-semibold"
                    >
                      {PATTAYA_SUBDISTRICTS_LIST.map((zone, i) => (
                        <option key={i} value={zone.name}>
                          {zone.name} ({zone.district}) — ฿{zone.fee}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block font-bold text-slate-700">Postal Code *</label>
                      <span className="text-[10px] font-bold text-amber-600 font-mono">
                        {manualDeliveryFeeResult.isFree ? 'FREE' : `฿${manualDeliveryFeeResult.fee}`}
                      </span>
                    </div>
                    <input
                      type="text"
                      maxLength="5"
                      required
                      placeholder="e.g. 20150"
                      value={manualPostalCode}
                      onChange={(e) => setManualPostalCode(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono font-bold text-xs"
                    />
                  </div>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-bold text-slate-700">
                    {manualCity === 'Pattaya' ? 'Hotel / Condominium / Villa / House Address *' : 'Building / Condominium / House / Address *'}
                  </label>
                  <span className="text-[10px] font-semibold text-sky-600">Google Maps Autocomplete</span>
                </div>
                <GoogleMapsCondoAutocomplete
                  value={manualCondo}
                  city={manualCity}
                  onChange={(val, autoMatch) => {
                    setManualCondo(val);
                    if (autoMatch) {
                      applyManualLocationUpdate(autoMatch);
                    }
                  }}
                  onSelectPlace={(place) => {
                    applyManualLocationUpdate(place);
                  }}
                  apiKey={googleMapsApiKey}
                  placeholder={manualCity === 'Pattaya' ? 'Search hotel, condo, villa, house or address...' : 'Search building, condo, house, villa, hotel or address...'}
                  required
                />
              </div>

              {/* Order Cost Preview */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-500 block">Service Subtotal: ฿{manualSubtotal} THB</span>
                  <span className="text-[11px] text-slate-600">
                    Pickup & Delivery ({manualCity} · {manualSubdistrict || manualDistrict}):{' '}
                    <strong className={manualDeliveryFeeResult.isFree ? 'text-emerald-600' : 'text-slate-800'}>
                      {manualDeliveryFeeResult.isFree ? 'FREE PROMO' : `฿${manualDeliveryFeeResult.fee} THB`}
                    </strong>
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Estimated Total</span>
                  <span className="text-base font-black text-emerald-600 font-mono">฿{manualGrandTotal} THB</span>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition"
            >
              Generate POS Order
            </button>
          </form>
        </div>
      )}

      {/* TAB: BANGKOK POSTAL CODES & DELIVERY RATES */}
      {activeTab === 'postal-rates' && (
        <PostalCodeManager />
      )}

      {/* TAB: USER MANAGEMENT (STAFF & CLIENTS) */}
      {activeTab === 'users' && (
        <UserManagement
          adminUser={adminUser}
          onSelectCustomer={(cust) => {
            setActiveTab('crm');
          }}
          onCreateManualOrder={onCreateManualOrder}
          onNavigateToTab={(tabId) => setActiveTab(tabId)}
        />
      )}

      {/* TAB 7: CUSTOMER CRM */}
      {activeTab === 'crm' && (
        <CustomerCRM
          onSelectOrder={(order) => setInspectingOrderId(order.id)}
          onCreateManualOrder={onCreateManualOrder}
        />
      )}

      {/* TAB 8: FAQ MANAGEMENT */}
      {activeTab === 'faq' && (
        <FaqManager />
      )}

      {/* ADD NEW SERVICE MODAL */}
      {showAddServiceModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-black text-slate-900">Add New Laundry Service</h3>
                <p className="text-xs text-slate-500">Configure new service by KG for Bangkok customers</p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddServiceModal(false)}
                className="p-1 text-slate-400 hover:text-slate-800"
              >
                <Icon name="x" className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddNewService} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Service Name (English) *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Bedding & Comforter Wash"
                    value={newServiceName}
                    onChange={(e) => setNewServiceName(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Thai Name (ชื่อภาษาไทย)</label>
                  <input
                    type="text"
                    placeholder="e.g. ซักผ้านวมและเครื่องนอน"
                    value={newServiceNameTh}
                    onChange={(e) => setNewServiceNameTh(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              {/* Category & Pricing Model Selectors */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Menu Category *</label>
                  <select
                    value={newServiceCategoryId}
                    onChange={(e) => {
                      const cid = e.target.value;
                      setNewServiceCategoryId(cid);
                      const catObj = categories.find(c => c.id === cid);
                      if (catObj?.pricingType) {
                        setNewServicePricingType(catObj.pricingType);
                        setNewServiceUnit(catObj.pricingType === 'piece' ? 'piece' : 'KG');
                        setNewServiceMinWeight(catObj.pricingType === 'piece' ? '1.0' : '4.0');
                      }
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-bold"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Pricing Model *</label>
                  <select
                    value={newServicePricingType}
                    onChange={(e) => {
                      const pt = e.target.value;
                      setNewServicePricingType(pt);
                      setNewServiceUnit(pt === 'piece' ? 'piece' : 'KG');
                      setNewServiceMinWeight(pt === 'piece' ? '1.0' : '4.0');
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-bold text-sky-900"
                  >
                    <option value="weight">🧺 By Weight (KG)</option>
                    <option value="piece">🛏️ By Piece (per item)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Billing Unit *</label>
                  <input
                    type="text"
                    required
                    placeholder="KG, piece, set..."
                    value={newServiceUnit}
                    onChange={(e) => setNewServiceUnit(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    🕒 Standard 48h (฿/{newServicePricingType === 'piece' ? (newServiceUnit || 'piece') : 'KG'}) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newServicePrice}
                    onChange={(e) => setNewServicePrice(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-sky-800 mb-1">
                    ⚡ Next Day 24h (฿/{newServicePricingType === 'piece' ? (newServiceUnit || 'piece') : 'KG'}) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newServiceNextDayPrice}
                    onChange={(e) => setNewServiceNextDayPrice(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-sky-300 font-bold bg-sky-50/40 text-sky-950"
                  />
                </div>

                <div>
                  <label className="block font-bold text-amber-800 mb-1">
                    🚀 Same Day (฿/{newServicePricingType === 'piece' ? (newServiceUnit || 'piece') : 'KG'}) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newServiceSameDayPrice}
                    onChange={(e) => setNewServiceSameDayPrice(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-amber-300 font-bold bg-amber-50/40 text-amber-950"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {newServicePricingType === 'piece' ? `Min Qty (${newServiceUnit || 'piece'}) *` : 'Min Weight (KG) *'}
                  </label>
                  <input
                    type="number"
                    min="1"
                    step={newServicePricingType === 'piece' ? '1' : '0.5'}
                    required
                    value={newServiceMinWeight}
                    onChange={(e) => setNewServiceMinWeight(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Turnaround (Hrs)</label>
                  <input
                    type="number"
                    min="1"
                    value={newServiceTurnaround}
                    onChange={(e) => setNewServiceTurnaround(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              {/* Same Day Available toggle */}
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newServiceSameDayAvailable}
                    onChange={(e) => setNewServiceSameDayAvailable(e.target.checked)}
                    className="w-4 h-4 text-amber-600 rounded"
                  />
                  <div>
                    <span className="font-bold text-amber-900 block">🚀 Enable Same Day Express Speed (Delivered Before 18:00)</span>
                    <span className="text-[11px] text-amber-700">Allow customers to choose Same Day turnaround for this service at ฿{newServiceSameDayPrice}/KG.</span>
                  </div>
                </label>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Service Description *</label>
                <textarea
                  rows="2"
                  required
                  placeholder="Describe items accepted, wash method, and packaging..."
                  value={newServiceDesc}
                  onChange={(e) => setNewServiceDesc(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300"
                />
              </div>

              {/* Bullet Points Sublist for New Service */}
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="block font-bold text-slate-800">
                    Included in Service (Bullet Points Sublist)
                  </label>
                  <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full">
                    {newServiceFeatures.length} bullets
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Custom bullet items displayed with checkmarks on the storefront card:
                </p>

                <div className="space-y-2">
                  {newServiceFeatures.map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-md bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                        <Icon name="check" className="w-3 h-3" />
                      </span>
                      <input
                        type="text"
                        value={feat}
                        onChange={(e) => handleNewServiceFeatureChange(idx, e.target.value)}
                        placeholder="e.g. Steam sanitized & hypo-allergenic fold"
                        className="flex-1 px-3 py-1.5 rounded-lg border border-slate-300 text-xs bg-white"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveNewServiceFeature(idx)}
                        className="p-1 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50"
                        title="Remove bullet"
                      >
                        <Icon name="x" className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={handleAddNewServiceFeature}
                    className="mt-1 px-3 py-1 rounded-lg border border-dashed border-sky-400 text-sky-600 hover:bg-sky-50 text-xs font-bold flex items-center gap-1"
                  >
                    <Icon name="plus" className="w-3 h-3" />
                    <span>+ Add Bullet Item</span>
                  </button>
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={newServicePopular}
                  onChange={(e) => setNewServicePopular(e.target.checked)}
                  className="w-4 h-4 text-sky-600 rounded"
                />
                <span className="font-semibold text-slate-700">Display "Popular Choice" badge</span>
              </label>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddServiceModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold shadow-md"
                >
                  Add Service to Store
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CATEGORY MANAGEMENT MODAL */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold">
                  <Icon name="folder" className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">Service Categories Manager</h3>
                  <p className="text-xs text-slate-500">Create, rename, and manage service categories for Bangkok laundry & linens</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowCategoryModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-800 rounded-xl hover:bg-slate-100 transition"
              >
                <Icon name="x" className="w-5 h-5" />
              </button>
            </div>

            {/* List of Existing Categories */}
            <div className="space-y-2">
              <div className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                Active Categories ({categories.length})
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-56 overflow-y-auto pr-1">
                {categories.map((cat) => {
                  const count = services.filter(s => (s.categoryId || (s.pricingType === 'piece' ? 'bedding_linens' : 'laundry_by_weight')) === cat.id).length;
                  const isEditingThis = editingCategory?.id === cat.id;

                  return (
                    <div
                      key={cat.id}
                      className={`p-3 rounded-2xl border transition flex items-center justify-between gap-2 ${
                        isEditingThis
                          ? 'bg-sky-50 border-sky-400 ring-2 ring-sky-200'
                          : 'bg-slate-50 border-slate-200 hover:bg-slate-100/80'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="w-8 h-8 rounded-xl bg-white border border-slate-200 text-sky-700 flex items-center justify-center font-bold shrink-0">
                          <Icon name={cat.icon || 'layers'} className="w-4 h-4" />
                        </span>
                        <div className="min-w-0">
                          <div className="font-extrabold text-xs text-slate-900 truncate flex items-center gap-1.5">
                            <span>{cat.name}</span>
                            <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                              cat.pricingType === 'piece'
                                ? 'bg-indigo-100 text-indigo-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}>
                              {cat.pricingType === 'piece' ? 'Piece' : 'Weight'}
                            </span>
                          </div>
                          {cat.nameTh && (
                            <div className="text-[10px] text-sky-700 truncate">{cat.nameTh}</div>
                          )}
                          <div className="text-[10px] text-slate-400">
                            {count} {count === 1 ? 'service' : 'services'} linked
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleOpenCategoryModal(cat)}
                          className="px-2 py-1 rounded-lg text-xs font-bold text-sky-700 bg-sky-100/60 hover:bg-sky-100 transition"
                          title="Edit this category"
                        >
                          Edit
                        </button>
                        {categories.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleDeleteCategory(cat.id, cat.name)}
                            className="p-1 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                            title="Delete category"
                          >
                            <Icon name="trash" className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Create or Edit Category Form */}
            <form onSubmit={handleSaveCategory} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3 text-xs">
              <div className="flex items-center justify-between pb-1 border-b border-slate-200">
                <span className="font-extrabold text-slate-800">
                  {editingCategory ? `Edit Category: "${editingCategory.name}"` : '+ Add New Service Category'}
                </span>
                {editingCategory && (
                  <button
                    type="button"
                    onClick={() => handleOpenCategoryModal(null)}
                    className="text-[11px] text-slate-500 hover:text-slate-800 font-bold"
                  >
                    Reset / Create New Instead
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category Name (English) *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Delicates & Silk Wash"
                    value={catFormName}
                    onChange={(e) => setCatFormName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Thai Name (ชื่อหมวดหมู่)</label>
                  <input
                    type="text"
                    placeholder="e.g. ซักผ้าไหมและผ้าถนอมพิเศษ"
                    value={catFormNameTh}
                    onChange={(e) => setCatFormNameTh(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Default Pricing Model</label>
                  <select
                    value={catFormPricingType}
                    onChange={(e) => setCatFormPricingType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-bold"
                  >
                    <option value="piece">🛏️ By Piece / Linen (per item)</option>
                    <option value="weight">🧺 By Weight (KG)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Display Icon</label>
                  <select
                    value={catFormIcon}
                    onChange={(e) => setCatFormIcon(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-bold"
                  >
                    <option value="layers">Layers / Linens</option>
                    <option value="bed">Bed / Bedding</option>
                    <option value="tag">Tag / Specialty</option>
                    <option value="folder">Folder / General</option>
                    <option value="scale">Scale / Weight</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Category Description</label>
                <input
                  type="text"
                  placeholder="e.g. Hotel-grade duvet covers, silk linens, and heavy comforters..."
                  value={catFormDesc}
                  onChange={(e) => setCatFormDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCategoryModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-200 font-bold"
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold shadow-md transition"
                >
                  {editingCategory ? 'Save Category Changes' : '+ Add Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ORDER DETAILS & FULL LIFECYCLE MANAGEMENT MODAL */}
      {inspectingOrder && (
        <OrderDetailsModal
          order={inspectingOrder}
          services={services}
          onClose={() => setInspectingOrderId(null)}
          onUpdateOrder={async (orderId, newStatus, note, actualWeightKg, tagNumber, serviceUpdates) => {
            if (onUpdateOrderStatus) {
              await onUpdateOrderStatus(orderId, newStatus, note, actualWeightKg, tagNumber, serviceUpdates);
            } else {
              await laundryStore.updateOrderStatus(orderId, newStatus, note, actualWeightKg, tagNumber, serviceUpdates);
            }
          }}
          onMarkPaid={(orderId, method) => laundryStore.markOrderPaid(orderId, method)}
        />
      )}

      {/* Incident Photo Evidence Lightbox Modal */}
      <IncidentImageLightbox
        isOpen={Boolean(incidentLightboxImg)}
        onClose={() => setIncidentLightboxImg(null)}
        imageUrl={incidentLightboxImg}
        title={incidentLightboxTitle}
        caption="High-resolution evidence inspection for ticket investigation."
      />

      {/* Standalone Tax Invoice & Cashless Payment Request Modal */}
      {invoiceModalOrder && (
        <InvoiceModal
          order={invoiceModalOrder}
          onClose={() => setInvoiceModalOrder(null)}
          onMarkPaid={(orderId, method) => {
            laundryStore.markOrderPaid(orderId, method);
            setInvoiceModalOrder(null);
          }}
        />
      )}

    </div>
  );
}
