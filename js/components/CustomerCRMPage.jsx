import React, { useState, useEffect } from 'react';
import { Icon } from './Icons.jsx';
import { 
  BANGKOK_DISTRICTS, 
  GENDER_OPTIONS, 
  CUSTOMER_TIERS, 
  DETERGENT_OPTIONS, 
  WATER_TEMP_OPTIONS, 
  STARCH_OPTIONS, 
  PACKAGING_OPTIONS, 
  CHURN_STATUS_CONFIG,
  ORDER_STATUSES 
} from '../data/servicesData.js';
import { laundryStore, getLineOaMessageUrl, CONTACT_CHANNELS } from '../store.js';

export function CustomerCRMPage({
  adminUser,
  onLogout,
  onBackToPOS,
  onBackToStorefront,
  onCreateManualOrder
}) {
  const [customers, setCustomers] = useState(() => laundryStore.getEnrichedCustomers());
  const [searchQuery, setSearchQuery] = useState('');
  const [genderFilter, setGenderFilter] = useState('ALL');
  const [tierFilter, setTierFilter] = useState('ALL');
  const [churnFilter, setChurnFilter] = useState('ALL');
  const [featureFilter, setFeatureFilter] = useState('ALL'); // 'ALL', 'whatsapp', 'tax', 'active_orders', 'has_issues'
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'cards'

  // Selected Customer for Full Dossier Modal
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const selectedCustomer = customers.find(c => c.id === selectedCustomerId) || null;
  const [activeDossierTab, setActiveDossierTab] = useState('profile'); // 'profile', 'garment_care', 'transactions', 'issues', 'analytics'

  // Add Customer Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newFullName, setNewFullName] = useState('');
  const [newNickName, setNewNickName] = useState('');
  const [newGender, setNewGender] = useState('Rather not say');
  const [newDob, setNewDob] = useState('');
  const [newMobile, setNewMobile] = useState('');
  const [newIsWhatsApp, setNewIsWhatsApp] = useState(true);
  const [newEmail, setNewEmail] = useState('');
  const [newLineId, setNewLineId] = useState('');
  const [newPin, setNewPin] = useState('123456');
  const [newTier, setNewTier] = useState('Regular');
  const [newNotes, setNewNotes] = useState('');

  // Initial Address for new customer
  const [newAddrLabel, setNewAddrLabel] = useState('Home Condo');
  const [newAddrText, setNewAddrText] = useState('');
  const [newAddrRoom, setNewAddrRoom] = useState('');
  const [newAddrDistrict, setNewAddrDistrict] = useState(BANGKOK_DISTRICTS[0]);
  const [newAddrJuristic, setNewAddrJuristic] = useState(true);

  // Initial Company Tax for new customer
  const [newRequireTax, setNewRequireTax] = useState(false);
  const [newCompanyName, setNewCompanyName] = useState('');
  const [newTaxId, setNewTaxId] = useState('');
  const [newBranch, setNewBranch] = useState('Head Office (สำนักงานใหญ่)');
  const [newCompanyAddress, setNewCompanyAddress] = useState('');

  // Inline Add Address Form inside Dossier
  const [showAddAddressForm, setShowAddAddressForm] = useState(false);
  const [inlineAddrLabel, setInlineAddrLabel] = useState('Office / Studio');
  const [inlineAddrText, setInlineAddrText] = useState('');
  const [inlineAddrRoom, setInlineAddrRoom] = useState('');
  const [inlineAddrDistrict, setInlineAddrDistrict] = useState(BANGKOK_DISTRICTS[0]);
  const [inlineAddrJuristic, setInlineAddrJuristic] = useState(false);
  const [inlineAddrPrimary, setInlineAddrPrimary] = useState(false);

  // Garment Care Edit State
  const [careDetergent, setCareDetergent] = useState('');
  const [careWaterTemp, setCareWaterTemp] = useState('');
  const [careSoftener, setCareSoftener] = useState('');
  const [careStarch, setCareStarch] = useState('');
  const [carePackaging, setCarePackaging] = useState('');
  const [careAlerts, setCareAlerts] = useState('');

  // Delivery Access Edit State
  const [deliveryAccessCode, setDeliveryAccessCode] = useState('');
  const [deliveryTimeslot, setDeliveryTimeslot] = useState('');
  const [deliveryGuardNotes, setDeliveryGuardNotes] = useState('');

  // Sync Care & Delivery edit states when selected customer changes
  useEffect(() => {
    if (selectedCustomer) {
      setCareDetergent(selectedCustomer.garmentPreferences?.detergent || DETERGENT_OPTIONS[0]);
      setCareWaterTemp(selectedCustomer.garmentPreferences?.waterTemp || WATER_TEMP_OPTIONS[0]);
      setCareSoftener(selectedCustomer.garmentPreferences?.fabricSoftener || 'Plant-Based Gentle Softener');
      setCareStarch(selectedCustomer.garmentPreferences?.starch || STARCH_OPTIONS[0]);
      setCarePackaging(selectedCustomer.garmentPreferences?.packaging || PACKAGING_OPTIONS[0]);
      setCareAlerts(selectedCustomer.garmentPreferences?.specialFabricAlerts || '');

      setDeliveryAccessCode(selectedCustomer.deliveryAccess?.condoAccessCode || '');
      setDeliveryTimeslot(selectedCustomer.deliveryAccess?.preferredTimeslot || '09:00 - 11:00 (Morning)');
      setDeliveryGuardNotes(selectedCustomer.deliveryAccess?.guardInstructions || '');
    }
  }, [selectedCustomerId]);

  // Log Issue Modal
  const [showLogIssueModal, setShowLogIssueModal] = useState(false);
  const [issueSubject, setIssueSubject] = useState('');
  const [issueMessage, setIssueMessage] = useState('');
  const [issueChannel, setIssueChannel] = useState('whatsapp');
  const [issueOrderId, setIssueOrderId] = useState('');

  // OTP Simulator Modal
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpTargetCustomer, setOtpTargetCustomer] = useState(null);
  const [otpChannel, setOtpChannel] = useState('whatsapp');
  const [otpGeneratedData, setOtpGeneratedData] = useState(null);
  const [otpEnteredCode, setOtpEnteredCode] = useState('');
  const [otpFeedbackMsg, setOtpFeedbackMsg] = useState('');

  // PIN Change Modal
  const [showPinModal, setShowPinModal] = useState(false);
  const [newPinCodeInput, setNewPinCodeInput] = useState('');
  const [pinFeedbackMsg, setPinFeedbackMsg] = useState('');

  // Loyalty Points Adjustment Modal
  const [showPointsModal, setShowPointsModal] = useState(false);
  const [pointsDeltaInput, setPointsDeltaInput] = useState('100');
  const [pointsReasonInput, setPointsReasonInput] = useState('VIP loyalty bonus');

  // Quick Order for Customer Modal
  const [showQuickOrderModal, setShowQuickOrderModal] = useState(false);
  const [quickServiceId, setQuickServiceId] = useState('wash_iron_fold');
  const [quickWeightKg, setQuickWeightKg] = useState('4.5');
  const [quickSpecialInstructions, setQuickSpecialInstructions] = useState('');

  // Staff Note Input
  const [newStaffNoteText, setNewStaffNoteText] = useState('');

  // Toast Banner
  const [toastMsg, setToastMsg] = useState('');
  const triggerToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3500);
  };

  // Re-sync from store
  const refreshCustomers = () => {
    setCustomers(laundryStore.getEnrichedCustomers());
  };

  useEffect(() => {
    return laundryStore.subscribe(() => {
      refreshCustomers();
    });
  }, []);

  // Calculate age from DOB
  const calculateAge = (dobString) => {
    if (!dobString) return null;
    const birthDate = new Date(dobString);
    if (isNaN(birthDate.getTime())) return null;
    const diffMs = Date.now() - birthDate.getTime();
    const ageDt = new Date(diffMs);
    return Math.abs(ageDt.getUTCFullYear() - 1970);
  };

  // KPI Calculations across entire database
  const totalCustomersCount = customers.length;
  const verifiedCount = customers.filter(c => c.isVerified).length;
  const corporateCount = customers.filter(c => c.tier === 'Corporate' || c.companyTax?.required).length;
  const totalLifetimeSpendAll = customers.reduce((sum, c) => sum + (c.lifetimeSpend || 0), 0);
  const totalLifetimeKgAll = customers.reduce((sum, c) => sum + (c.lifetimeKg || 0), 0);
  const activeOrdersCount = customers.reduce((sum, c) => sum + (c.activeOrders?.length || 0), 0);
  const averageLtv = totalCustomersCount > 0 ? Math.round(totalLifetimeSpendAll / totalCustomersCount) : 0;

  // Filtered Customer Directory
  const filteredCustomers = customers.filter(c => {
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch = !q ||
      (c.fullName && c.fullName.toLowerCase().includes(q)) ||
      (c.nickName && c.nickName.toLowerCase().includes(q)) ||
      (c.mobileNumber && c.mobileNumber.toLowerCase().includes(q)) ||
      (c.lineId && c.lineId.toLowerCase().includes(q)) ||
      (c.email && c.email.toLowerCase().includes(q)) ||
      (c.companyTax?.taxId && c.companyTax.taxId.includes(q)) ||
      (c.companyTax?.companyName && c.companyTax.companyName.toLowerCase().includes(q)) ||
      (c.addresses || []).some(a => (a.address && a.address.toLowerCase().includes(q)) || (a.label && a.label.toLowerCase().includes(q)) || (a.district && a.district.toLowerCase().includes(q)));

    const matchesGender = genderFilter === 'ALL' || c.gender === genderFilter;
    const matchesTier = tierFilter === 'ALL' || c.tier === tierFilter;
    const matchesChurn = churnFilter === 'ALL' || c.churnStatus === churnFilter;

    let matchesFeature = true;
    if (featureFilter === 'whatsapp') matchesFeature = Boolean(c.isWhatsApp);
    if (featureFilter === 'tax') matchesFeature = Boolean(c.companyTax?.required);
    if (featureFilter === 'active_orders') matchesFeature = (c.activeOrders?.length || 0) > 0;
    if (featureFilter === 'has_issues') matchesFeature = (c.incidents?.length || 0) > 0;

    return matchesSearch && matchesGender && matchesTier && matchesChurn && matchesFeature;
  });

  // Handlers
  const handleSaveGarmentPreferences = (e) => {
    e.preventDefault();
    if (!selectedCustomer) return;

    laundryStore.updateCustomerPreferences(
      selectedCustomer.id,
      {
        detergent: careDetergent,
        waterTemp: careWaterTemp,
        fabricSoftener: careSoftener,
        starch: careStarch,
        packaging: carePackaging,
        specialFabricAlerts: careAlerts
      },
      {
        condoAccessCode: deliveryAccessCode,
        preferredTimeslot: deliveryTimeslot,
        guardInstructions: deliveryGuardNotes
      }
    );
    triggerToast('Garment care & delivery access preferences updated!');
  };

  const handleAdjustPointsSubmit = (e) => {
    e.preventDefault();
    if (!selectedCustomer) return;
    const delta = parseInt(pointsDeltaInput, 10);
    if (isNaN(delta)) return;

    laundryStore.adjustLoyaltyPoints(selectedCustomer.id, delta, pointsReasonInput.trim() || 'Staff adjustment');
    setShowPointsModal(false);
    triggerToast(`Adjusted loyalty points (${delta > 0 ? '+' : ''}${delta} pts)`);
  };

  const handleCreateQuickOrder = (e) => {
    e.preventDefault();
    if (!selectedCustomer) return;

    const primaryAddr = selectedCustomer.primaryAddress || selectedCustomer.addresses?.[0];
    const weight = parseFloat(quickWeightKg) || 4.0;

    const orderPayload = {
      customerName: selectedCustomer.fullName,
      nickName: selectedCustomer.nickName || '',
      contactChannel: selectedCustomer.isWhatsApp ? 'whatsapp' : (selectedCustomer.lineId ? 'line' : 'email'),
      contactValue: selectedCustomer.mobileNumber || selectedCustomer.lineId || selectedCustomer.email,
      email: selectedCustomer.email || `${selectedCustomer.fullName.toLowerCase().replace(/\s+/g, '')}@customer.local`,
      serviceId: quickServiceId,
      district: primaryAddr?.district || BANGKOK_DISTRICTS[0],
      condoName: primaryAddr?.label || primaryAddr?.address || 'Bangkok Residence',
      roomNumber: primaryAddr?.roomNumber || 'Lobby Reception',
      leaveWithJuristic: primaryAddr?.leaveWithJuristic ?? true,
      estimatedWeightKg: weight,
      pickupDate: new Date().toISOString().split('T')[0],
      pickupTime: selectedCustomer.deliveryAccess?.preferredTimeslot || '09:00 - 11:00 (Morning)',
      specialInstructions: `${quickSpecialInstructions ? quickSpecialInstructions + ' | ' : ''}Care prefs: ${careDetergent}, ${careStarch}. Guard instructions: ${deliveryGuardNotes}`
    };

    if (onCreateManualOrder) {
      onCreateManualOrder(orderPayload);
    } else {
      laundryStore.createOrder(orderPayload);
    }

    setShowQuickOrderModal(false);
    triggerToast(`Order logged for ${selectedCustomer.fullName}!`);
  };

  const handleExportSingleJson = (cust) => {
    const jsonStr = laundryStore.exportCustomerJson(cust.id);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `noname-crm-${cust.id}-${cust.fullName.replace(/\s+/g, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
    triggerToast(`Exported customer dossier for ${cust.fullName}`);
  };

  const handleExportAllCsv = () => {
    const csvContent = laundryStore.exportAllCustomersCsv();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `noname-customers-master-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    triggerToast('Exported complete customer master directory (CSV)');
  };

  const handleCreateCustomerSubmit = (e) => {
    e.preventDefault();
    if (!newFullName.trim() || !newMobile.trim()) {
      alert('Please provide at least a Full Name and Mobile Number.');
      return;
    }

    const created = laundryStore.createCustomer({
      fullName: newFullName.trim(),
      nickName: newNickName.trim(),
      gender: newGender,
      dateOfBirth: newDob,
      mobileNumber: newMobile.trim(),
      isWhatsApp: newIsWhatsApp,
      email: newEmail.trim(),
      lineId: newLineId.trim(),
      pinCode: newPin.trim() || '123456',
      tier: newTier,
      notes: newNotes.trim(),
      companyTax: {
        required: newRequireTax,
        companyName: newCompanyName.trim(),
        taxId: newTaxId.trim(),
        branch: newBranch.trim(),
        companyAddress: newCompanyAddress.trim()
      },
      addressLabel: newAddrLabel.trim() || 'Home',
      address: newAddrText.trim() || 'Bangkok',
      district: newAddrDistrict,
      roomNumber: newAddrRoom.trim(),
      leaveWithJuristic: newAddrJuristic
    });

    setShowAddModal(false);
    triggerToast(`Customer ${created.fullName} registered successfully!`);
    setSelectedCustomerId(created.id);
  };

  const handleInlineAddAddress = (e) => {
    e.preventDefault();
    if (!selectedCustomer || !inlineAddrText.trim()) return;

    laundryStore.addCustomerAddress(selectedCustomer.id, {
      label: inlineAddrLabel.trim() || 'Additional Address',
      address: inlineAddrText.trim(),
      district: inlineAddrDistrict,
      roomNumber: inlineAddrRoom.trim(),
      leaveWithJuristic: inlineAddrJuristic,
      isPrimary: inlineAddrPrimary
    });

    setShowAddAddressForm(false);
    setInlineAddrText('');
    setInlineAddrRoom('');
    triggerToast('Delivery address added to profile!');
  };

  const handleAddStaffNote = (e) => {
    e.preventDefault();
    if (!selectedCustomer || !newStaffNoteText.trim()) return;

    laundryStore.addCustomerNote(selectedCustomer.id, newStaffNoteText.trim());
    setNewStaffNoteText('');
    triggerToast('Staff note recorded on customer record.');
  };

  const handleLogIssueSubmit = (e) => {
    e.preventDefault();
    if (!selectedCustomer || !issueSubject.trim() || !issueMessage.trim()) return;

    laundryStore.createIncident({
      orderId: issueOrderId.trim() || null,
      customerName: selectedCustomer.fullName,
      channel: issueChannel,
      contact: selectedCustomer.mobileNumber || selectedCustomer.lineId || selectedCustomer.email,
      subject: issueSubject.trim(),
      message: issueMessage.trim()
    });

    setShowLogIssueModal(false);
    setIssueSubject('');
    setIssueMessage('');
    triggerToast('Issue / ticket recorded in customer dossier.');
  };

  const handleTriggerOtp = (cust, channel) => {
    setOtpTargetCustomer(cust);
    setOtpChannel(channel);
    const contact = channel === 'whatsapp' || channel === 'sms' ? cust.mobileNumber : cust.email;
    if (!contact) {
      alert(`Customer does not have a registered ${channel === 'whatsapp' ? 'WhatsApp phone' : channel.toUpperCase()} contact.`);
      return;
    }
    const result = laundryStore.generateOtp(channel, contact);
    setOtpGeneratedData(result);
    setOtpEnteredCode('');
    setOtpFeedbackMsg('');
    setShowOtpModal(true);
  };

  const handleVerifyOtpSubmit = (e) => {
    e.preventDefault();
    if (!otpTargetCustomer || !otpEnteredCode.trim()) return;
    const contact = otpChannel === 'whatsapp' || otpChannel === 'sms' ? otpTargetCustomer.mobileNumber : otpTargetCustomer.email;
    const res = laundryStore.verifyOtp(otpChannel, contact, otpEnteredCode.trim());
    if (res.success) {
      setOtpFeedbackMsg('✓ OTP verified successfully! Account status is now Verified.');
      triggerToast(`${otpTargetCustomer.fullName} successfully verified via ${otpChannel.toUpperCase()}`);
      setTimeout(() => setShowOtpModal(false), 1600);
    } else {
      setOtpFeedbackMsg(res.error || 'Verification code failed.');
    }
  };

  const handleUpdatePinSubmit = (e) => {
    e.preventDefault();
    if (!selectedCustomer) return;
    if (!/^\d{6}$/.test(newPinCodeInput)) {
      setPinFeedbackMsg('PIN must be exactly 6 numeric digits (0-9).');
      return;
    }
    try {
      laundryStore.setCustomerPin(selectedCustomer.id, newPinCodeInput);
      setPinFeedbackMsg('✓ 6-Digit PIN successfully updated!');
      triggerToast('6-digit access PIN saved.');
      setTimeout(() => {
        setShowPinModal(false);
        setPinFeedbackMsg('');
        setNewPinCodeInput('');
      }, 1200);
    } catch (err) {
      setPinFeedbackMsg(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-['Plus_Jakarta_Sans',sans-serif]">
      
      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed top-6 right-6 z-50 animate-bounce">
          <div className="bg-emerald-500 text-slate-950 font-extrabold px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2 text-xs border border-emerald-400">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-950 animate-ping" />
            <span>{toastMsg}</span>
          </div>
        </div>
      )}

      {/* Top Standalone Header Bar */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-30 px-4 sm:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500 via-indigo-500 to-purple-600 flex items-center justify-center text-white text-xl shadow-lg shadow-indigo-500/20">
              👥
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg sm:text-xl tracking-tight text-white">
                  NoName<span className="text-sky-400">CRM</span>
                </span>
                <span className="px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 text-[10px] font-mono font-bold border border-indigo-500/30">
                  ENTERPRISE EDITION
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-800/60">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Multi-Year Database
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Customer Lifetime Dossiers, Garment Care Profiles, Thai e-Tax & Multi-Address Logistics
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {onBackToPOS && (
              <button
                onClick={onBackToPOS}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-slate-700 flex items-center gap-1.5 transition"
                title="Switch to Order Processing & Kanban POS"
              >
                <Icon name="package" className="w-3.5 h-3.5 text-sky-400" />
                <span>Order POS</span>
              </button>
            )}

            {onBackToStorefront && (
              <button
                onClick={onBackToStorefront}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-slate-700 flex items-center gap-1.5 transition"
                title="View Public Storefront"
              >
                <span>Storefront</span>
                <Icon name="chevronRight" className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              onClick={handleExportAllCsv}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-emerald-400 border border-emerald-900/60 flex items-center gap-1.5 transition"
              title="Download full customer database for accounting and auditing"
            >
              <Icon name="receipt" className="w-3.5 h-3.5 text-emerald-400" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 flex items-center gap-1.5 transition transform hover:-translate-y-0.5"
            >
              <Icon name="userPlus" className="w-3.5 h-3.5" />
              <span>+ New Customer</span>
            </button>

            {onLogout && (
              <button
                onClick={onLogout}
                className="p-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 border border-rose-800/40 transition"
                title="Log out of CRM"
              >
                <Icon name="logOut" className="w-4 h-4" />
              </button>
            )}
          </div>

        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* Executive Multi-Year KPIs */}
        <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 flex flex-col justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Accounts</span>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl sm:text-3xl font-black text-white">{totalCustomersCount}</span>
              <span className="text-[10px] text-indigo-400 font-semibold bg-indigo-950/80 px-2 py-0.5 rounded-full border border-indigo-800/50">
                Active CRM
              </span>
            </div>
          </div>

          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 flex flex-col justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Lifetime Revenue</span>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl sm:text-3xl font-black text-emerald-400">฿{totalLifetimeSpendAll.toLocaleString()}</span>
              <span className="text-[10px] text-emerald-300 font-mono">THB</span>
            </div>
          </div>

          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 flex flex-col justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total KG Cleaned</span>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl sm:text-3xl font-black text-sky-400">{totalLifetimeKgAll.toFixed(1)}</span>
              <span className="text-[10px] text-sky-300 font-bold">KG</span>
            </div>
          </div>

          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 flex flex-col justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Avg Lifetime Value</span>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl sm:text-3xl font-black text-purple-300">฿{averageLtv.toLocaleString()}</span>
              <span className="text-[10px] text-purple-400 font-bold">/ Cust</span>
            </div>
          </div>

          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 flex flex-col justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Corporate & e-Tax</span>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl sm:text-3xl font-black text-amber-300">{corporateCount}</span>
              <span className="text-[10px] text-amber-400 font-bold bg-amber-950/80 px-2 py-0.5 rounded-full border border-amber-800/50">
                13-Digit ID
              </span>
            </div>
          </div>

          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 flex flex-col justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Active In Laundry</span>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl sm:text-3xl font-black text-cyan-300">{activeOrdersCount}</span>
              <span className="text-[10px] text-cyan-400 font-bold bg-cyan-950/80 px-2 py-0.5 rounded-full border border-cyan-800/50">
                Live Jobs
              </span>
            </div>
          </div>

        </section>

        {/* Search, Filters, and Controls Toolbar */}
        <section className="bg-slate-800/90 border border-slate-700 rounded-3xl p-5 sm:p-6 space-y-4 shadow-xl">
          
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            
            {/* Search Input */}
            <div className="relative flex-1 max-w-xl">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Icon name="search" className="w-4 h-4" />
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by Name, Nickname, Phone, LINE OA, Condo, 13-digit Tax ID..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white"
                >
                  <Icon name="x" className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* View Mode Switcher */}
            <div className="flex items-center gap-2 self-end lg:self-auto">
              <span className="text-xs text-slate-400 font-semibold hidden sm:inline">View:</span>
              <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-700">
                <button
                  onClick={() => setViewMode('table')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
                    viewMode === 'table' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Icon name="list" className="w-3.5 h-3.5" />
                  <span>Table</span>
                </button>
                <button
                  onClick={() => setViewMode('cards')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
                    viewMode === 'cards' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Icon name="kanban" className="w-3.5 h-3.5" />
                  <span>Dossier Cards</span>
                </button>
              </div>
            </div>

          </div>

          {/* Filter Pills Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-700/60 text-xs">
            
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Tier / Account Type
              </label>
              <select
                value={tierFilter}
                onChange={(e) => setTierFilter(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 font-semibold focus:outline-none focus:ring-1 focus:ring-sky-500"
              >
                <option value="ALL">All Tiers ({customers.length})</option>
                {Object.keys(CUSTOMER_TIERS).map(k => (
                  <option key={k} value={k}>{CUSTOMER_TIERS[k].label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Multi-Year Churn Risk
              </label>
              <select
                value={churnFilter}
                onChange={(e) => setChurnFilter(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 font-semibold focus:outline-none focus:ring-1 focus:ring-sky-500"
              >
                <option value="ALL">All Activity Statuses</option>
                {Object.keys(CHURN_STATUS_CONFIG).map(k => (
                  <option key={k} value={k}>{CHURN_STATUS_CONFIG[k].label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Gender
              </label>
              <select
                value={genderFilter}
                onChange={(e) => setGenderFilter(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 font-semibold focus:outline-none focus:ring-1 focus:ring-sky-500"
              >
                <option value="ALL">All Genders</option>
                {GENDER_OPTIONS.map(g => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Special Filters
              </label>
              <select
                value={featureFilter}
                onChange={(e) => setFeatureFilter(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 font-semibold focus:outline-none focus:ring-1 focus:ring-sky-500"
              >
                <option value="ALL">Show All Profiles</option>
                <option value="whatsapp">🟢 WhatsApp Users</option>
                <option value="tax">🏢 Requires Thai Tax Invoice</option>
                <option value="active_orders">🧺 Has Active Orders</option>
                <option value="has_issues">💬 Open Support Tickets</option>
              </select>
            </div>

          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-700/40">
            <span>Showing <strong>{filteredCustomers.length}</strong> of <strong>{customers.length}</strong> customer dossiers</span>
            {(searchQuery || genderFilter !== 'ALL' || tierFilter !== 'ALL' || churnFilter !== 'ALL' || featureFilter !== 'ALL') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setGenderFilter('ALL');
                  setTierFilter('ALL');
                  setChurnFilter('ALL');
                  setFeatureFilter('ALL');
                }}
                className="text-sky-400 hover:text-sky-300 font-semibold underline"
              >
                Reset all filters
              </button>
            )}
          </div>

        </section>

        {/* Directory View: Table or Cards */}
        {filteredCustomers.length === 0 ? (
          <div className="bg-slate-800/50 border border-slate-700 rounded-3xl p-12 text-center space-y-3">
            <span className="text-4xl">🔍</span>
            <h3 className="text-lg font-bold text-white">No Customer Profiles Found</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              No customers match your search query or active filter settings. Try adjusting filters or create a new customer record.
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-md"
            >
              + Register New Customer
            </button>
          </div>
        ) : viewMode === 'table' ? (
          
          /* Table View */
          <div className="bg-slate-800/90 border border-slate-700 rounded-3xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-900/90 text-slate-400 font-bold border-b border-slate-700">
                    <th className="py-3.5 px-4">Customer</th>
                    <th className="py-3.5 px-4">Tenure & Churn</th>
                    <th className="py-3.5 px-4">Contact & WhatsApp</th>
                    <th className="py-3.5 px-4">Primary Address (Google Maps)</th>
                    <th className="py-3.5 px-4 text-right">LTV Spend</th>
                    <th className="py-3.5 px-4 text-center">Lifetime KG</th>
                    <th className="py-3.5 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/60">
                  {filteredCustomers.map(c => {
                    const primaryAddr = c.primaryAddress || c.addresses?.[0];
                    const churnConfig = CHURN_STATUS_CONFIG[c.churnStatus] || CHURN_STATUS_CONFIG.NEW;
                    const tierConfig = CUSTOMER_TIERS[c.tier] || CUSTOMER_TIERS.Regular;

                    return (
                      <tr 
                        key={c.id} 
                        className="hover:bg-slate-750/50 transition cursor-pointer group"
                        onClick={() => setSelectedCustomerId(c.id)}
                      >
                        {/* Customer Column */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-600 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-md">
                              {c.fullName.charAt(0)}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-extrabold text-white group-hover:text-sky-400 transition">
                                  {c.fullName}
                                </span>
                                {c.nickName && (
                                  <span className="text-[11px] text-slate-400 font-medium">
                                    "{c.nickName}"
                                  </span>
                                )}
                                {c.isVerified && (
                                  <span className="text-emerald-400" title="Verified Customer">
                                    <Icon name="shieldCheck" className="w-3.5 h-3.5" />
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${tierConfig.color}`}>
                                  {tierConfig.label}
                                </span>
                                {c.companyTax?.required && (
                                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-amber-950/70 text-amber-300 border border-amber-800/60">
                                    Tax ID
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Tenure & Churn */}
                        <td className="py-3.5 px-4">
                          <div className="space-y-1">
                            <span className="text-xs font-semibold text-slate-300 block">
                              {c.tenureText}
                            </span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border inline-block ${churnConfig.color}`}>
                              {churnConfig.label}
                            </span>
                          </div>
                        </td>

                        {/* Contact */}
                        <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-slate-200 font-semibold">{c.mobileNumber || 'No phone'}</span>
                              {c.isWhatsApp && (
                                <a
                                  href={`https://wa.me/${c.mobileNumber?.replace(/[^0-9]/g, '')}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="p-1 rounded bg-emerald-950 text-emerald-400 hover:bg-emerald-900 transition"
                                  title="Open WhatsApp Chat"
                                >
                                  <Icon name="whatsapp" className="w-3.5 h-3.5" />
                                </a>
                              )}
                            </div>
                            {c.lineId && (
                              <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                                <Icon name="line" className="w-3 h-3 text-green-400" />
                                <span>{c.lineId}</span>
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Primary Address */}
                        <td className="py-3.5 px-4">
                          {primaryAddr ? (
                            <div className="space-y-0.5 max-w-xs">
                              <div className="font-bold text-slate-200 truncate">
                                {primaryAddr.label} {primaryAddr.roomNumber ? `(Unit ${primaryAddr.roomNumber})` : ''}
                              </div>
                              <div className="text-[11px] text-slate-400 truncate">
                                {primaryAddr.district}
                              </div>
                              <a
                                href={primaryAddr.googleMapsUrl}
                                target="_blank"
                                rel="noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="inline-flex items-center gap-1 text-[10px] text-sky-400 hover:text-sky-300 underline font-semibold"
                              >
                                <Icon name="navigation" className="w-2.5 h-2.5" />
                                <span>Google Maps</span>
                              </a>
                            </div>
                          ) : (
                            <span className="text-slate-500 italic">No address on file</span>
                          )}
                        </td>

                        {/* LTV Spend */}
                        <td className="py-3.5 px-4 text-right">
                          <span className="font-black text-sm text-emerald-400">
                            ฿{(c.lifetimeSpend || 0).toLocaleString()}
                          </span>
                          <span className="text-[10px] text-slate-400 block font-mono">
                            {c.totalOrders || 0} orders
                          </span>
                        </td>

                        {/* Lifetime KG */}
                        <td className="py-3.5 px-4 text-center">
                          <span className="font-bold text-sky-400">
                            {(c.lifetimeKg || 0).toFixed(1)} KG
                          </span>
                          <span className="text-[10px] text-slate-400 block">
                            {c.loyaltyPoints || 0} pts
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => setSelectedCustomerId(c.id)}
                              className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[11px] shadow-sm transition"
                              title="Inspect Full Customer Dossier"
                            >
                              Dossier
                            </button>
                            <button
                              onClick={() => handleExportSingleJson(c)}
                              className="p-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 transition"
                              title="Export Customer JSON Dossier"
                            >
                              <Icon name="receipt" className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>

                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

        ) : (

          /* Card Dossier View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCustomers.map(c => {
              const primaryAddr = c.primaryAddress || c.addresses?.[0];
              const churnConfig = CHURN_STATUS_CONFIG[c.churnStatus] || CHURN_STATUS_CONFIG.NEW;
              const tierConfig = CUSTOMER_TIERS[c.tier] || CUSTOMER_TIERS.Regular;

              return (
                <div
                  key={c.id}
                  onClick={() => setSelectedCustomerId(c.id)}
                  className="bg-slate-800/90 border border-slate-700 hover:border-slate-600 rounded-3xl p-5 space-y-4 shadow-xl transition cursor-pointer group flex flex-col justify-between"
                >
                  <div>
                    {/* Card Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-sky-600 to-indigo-600 text-white font-black text-sm flex items-center justify-center shadow-lg">
                          {c.fullName.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-extrabold text-white text-sm group-hover:text-sky-400 transition">
                            {c.fullName} {c.nickName ? `("${c.nickName}")` : ''}
                          </h4>
                          <span className="text-[11px] text-slate-400">
                            Customer for <strong>{c.tenureText}</strong>
                          </span>
                        </div>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${tierConfig.color}`}>
                        {tierConfig.label}
                      </span>
                    </div>

                    {/* Metrics Badge Row */}
                    <div className="grid grid-cols-3 gap-2 my-3 p-2.5 rounded-2xl bg-slate-900/80 border border-slate-700/60 text-center">
                      <div>
                        <span className="text-[10px] text-slate-400 block font-semibold">LTV Spend</span>
                        <span className="text-xs font-black text-emerald-400">฿{(c.lifetimeSpend || 0).toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block font-semibold">Total Cleaned</span>
                        <span className="text-xs font-bold text-sky-400">{(c.lifetimeKg || 0).toFixed(1)} KG</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block font-semibold">Loyalty</span>
                        <span className="text-xs font-bold text-purple-400">{c.loyaltyPoints || 0} pts</span>
                      </div>
                    </div>

                    {/* Quick Garment Care Highlights */}
                    <div className="space-y-1.5 text-[11px] text-slate-300">
                      <div className="flex items-center gap-1.5 text-slate-400">
                        <Icon name="scale" className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                        <span className="truncate">Care: <strong>{c.garmentPreferences?.detergent}</strong></span>
                      </div>
                      {primaryAddr && (
                        <div className="flex items-center gap-1.5 text-slate-400">
                          <Icon name="mapPin" className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                          <span className="truncate">{primaryAddr.label} ({primaryAddr.district})</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card Bottom Bar */}
                  <div className="pt-3 border-t border-slate-700/80 flex items-center justify-between">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${churnConfig.color}`}>
                      {churnConfig.label}
                    </span>
                    <button
                      type="button"
                      className="text-xs font-bold text-indigo-400 group-hover:text-indigo-300 flex items-center gap-1"
                    >
                      <span>Open Dossier</span>
                      <Icon name="chevronRight" className="w-3 h-3" />
                    </button>
                  </div>

                </div>
              );
            })}
          </div>

        )}

      </main>

      {/* ========================================================== */}
      {/* FULL CUSTOMER DOSSIER MODAL */}
      {/* ========================================================== */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-fadeIn">
            
            {/* Dossier Header */}
            <div className="p-6 border-b border-slate-800 bg-slate-950/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 text-white font-black text-lg flex items-center justify-center shadow-lg">
                  {selectedCustomer.fullName.charAt(0)}
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-xl font-black text-white">
                      {selectedCustomer.fullName}
                    </h3>
                    {selectedCustomer.nickName && (
                      <span className="px-2 py-0.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-bold border border-slate-700">
                        Nickname: {selectedCustomer.nickName}
                      </span>
                    )}
                    <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${CUSTOMER_TIERS[selectedCustomer.tier]?.color || 'bg-slate-800 text-white'}`}>
                      {CUSTOMER_TIERS[selectedCustomer.tier]?.label || selectedCustomer.tier}
                    </span>
                    {selectedCustomer.isVerified && (
                      <span className="text-xs text-emerald-400 font-bold flex items-center gap-1 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-800/60">
                        <Icon name="shieldCheck" className="w-3.5 h-3.5" />
                        <span>Verified Account</span>
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-1 flex flex-wrap items-center gap-3">
                    <span>ID: <strong className="font-mono text-slate-300">{selectedCustomer.id}</strong></span>
                    <span>•</span>
                    <span>Tenure: <strong className="text-indigo-400">{selectedCustomer.tenureText}</strong> (Since {new Date(selectedCustomer.memberSince).toLocaleDateString()})</span>
                    <span>•</span>
                    <span>Age: <strong>{calculateAge(selectedCustomer.dateOfBirth) ? `${calculateAge(selectedCustomer.dateOfBirth)} yrs` : 'N/A'}</strong> ({selectedCustomer.gender})</span>
                  </p>
                </div>
              </div>

              {/* Dossier Quick Action Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowQuickOrderModal(true)}
                  className="px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-md flex items-center gap-1.5 transition"
                >
                  <Icon name="send" className="w-3 h-3" />
                  <span>+ Quick Order</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleExportSingleJson(selectedCustomer)}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 flex items-center gap-1 transition"
                  title="Export Customer Profile (JSON)"
                >
                  <Icon name="receipt" className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Export JSON</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowPointsModal(true)}
                  className="px-2.5 py-1.5 rounded-xl bg-purple-950/60 hover:bg-purple-900/60 text-purple-300 text-xs font-bold border border-purple-800/60 flex items-center gap-1 transition"
                  title="Adjust Loyalty Points Balance"
                >
                  <span>⭐ {selectedCustomer.loyaltyPoints || 0} pts</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedCustomerId(null)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  <Icon name="x" className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Dossier Tabs Navigation */}
            <div className="flex border-b border-slate-800 px-6 space-x-2 bg-slate-950/40 overflow-x-auto text-xs">
              {[
                { id: 'profile', label: 'Identity & Addresses', icon: 'userCheck' },
                { id: 'garment_care', label: 'Garment Care & Delivery Access', icon: 'scale' },
                { id: 'transactions', label: 'Orders & Multi-Year Ledger', icon: 'package', count: selectedCustomer.orders?.length },
                { id: 'issues', label: 'Incident Tickets & Notes', icon: 'messageSquare', count: selectedCustomer.incidents?.length },
                { id: 'analytics', label: 'Multi-Year LTV Intelligence', icon: 'history' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveDossierTab(tab.id)}
                  className={`py-3 px-3.5 font-bold transition flex items-center gap-2 border-b-2 whitespace-nowrap ${
                    activeDossierTab === tab.id
                      ? 'border-sky-500 text-sky-400 bg-sky-950/20'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Icon name={tab.icon} className="w-4 h-4" />
                  <span>{tab.label}</span>
                  {tab.count !== undefined && tab.count > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full bg-slate-800 text-[10px] text-slate-300">
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Dossier Content Area */}
            <div className="p-6 overflow-y-auto flex-1 space-y-6 text-xs">
              
              {/* TAB 1: IDENTITY & ADDRESSES */}
              {activeDossierTab === 'profile' && (
                <div className="space-y-6">
                  
                  {/* Digital Channels & Security Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    
                    {/* Contact Channels */}
                    <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/80 space-y-3">
                      <h4 className="font-extrabold text-white text-xs uppercase tracking-wider flex items-center justify-between">
                        <span>Digital Contact Channels</span>
                        {selectedCustomer.isWhatsApp && (
                          <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-800">
                            WhatsApp Verified
                          </span>
                        )}
                      </h4>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between py-1 border-b border-slate-700/50">
                          <span className="text-slate-400">Mobile Number:</span>
                          <div className="flex items-center gap-2 font-semibold">
                            <span className="font-mono text-white">{selectedCustomer.mobileNumber || 'N/A'}</span>
                            {selectedCustomer.isWhatsApp && (
                              <a
                                href={`https://wa.me/${selectedCustomer.mobileNumber?.replace(/[^0-9]/g, '')}`}
                                target="_blank"
                                rel="noreferrer"
                                className="px-2 py-0.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold flex items-center gap-1"
                              >
                                <Icon name="whatsapp" className="w-3 h-3" />
                                <span>Chat</span>
                              </a>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center justify-between py-1 border-b border-slate-700/50">
                          <span className="text-slate-400">LINE Official ID:</span>
                          <div className="flex items-center gap-2 font-semibold">
                            <span className="text-green-400">{selectedCustomer.lineId || 'N/A'}</span>
                            {selectedCustomer.lineId && (
                              <a
                                href={getLineOaMessageUrl(`Hi ${selectedCustomer.fullName}, checking in from NoName Laundry!`, laundryStore.settings?.lineOaId || '@nonamelaundry')}
                                target="_blank"
                                rel="noreferrer"
                                className="px-2 py-0.5 rounded bg-green-600 hover:bg-green-500 text-white text-[10px] font-bold flex items-center gap-1"
                              >
                                <Icon name="line" className="w-3 h-3" />
                                <span>LINE OA</span>
                              </a>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center justify-between py-1">
                          <span className="text-slate-400">Email (Receipts):</span>
                          <span className="text-slate-200 font-semibold">{selectedCustomer.email || 'N/A'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Account Security & Quick Access */}
                    <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/80 space-y-3">
                      <h4 className="font-extrabold text-white text-xs uppercase tracking-wider flex items-center justify-between">
                        <span>Security & Quick Access PIN</span>
                        <span className="text-[10px] text-sky-400 font-mono">6-Digit PIN</span>
                      </h4>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between py-1 border-b border-slate-700/50">
                          <span className="text-slate-400">Verification Status:</span>
                          <span className="font-bold text-emerald-400">
                            {selectedCustomer.isVerified ? `✓ Verified (${selectedCustomer.verifiedVia?.toUpperCase() || 'MANUAL'})` : '⚠️ Unverified'}
                          </span>
                        </div>

                        <div className="flex items-center justify-between py-1 border-b border-slate-700/50">
                          <span className="text-slate-400">Account Access PIN:</span>
                          <div className="flex items-center gap-2">
                            <span className="font-mono bg-slate-900 px-2 py-0.5 rounded text-sky-400 font-bold">
                              {selectedCustomer.pinCode ? '••••••' : 'Not Set'}
                            </span>
                            <button
                              onClick={() => {
                                setNewPinCodeInput(selectedCustomer.pinCode || '123456');
                                setShowPinModal(true);
                              }}
                              className="text-xs text-sky-400 hover:underline font-bold"
                            >
                              Reset PIN
                            </button>
                          </div>
                        </div>

                        <div className="pt-1 flex gap-2">
                          <button
                            onClick={() => handleTriggerOtp(selectedCustomer, 'whatsapp')}
                            className="flex-1 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-bold text-[11px] transition"
                          >
                            Verify via WhatsApp
                          </button>
                          <button
                            onClick={() => handleTriggerOtp(selectedCustomer, 'sms')}
                            className="flex-1 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-bold text-[11px] transition"
                          >
                            Verify via SMS
                          </button>
                        </div>
                      </div>
                    </div>

                  </div>

                  {/* Multiple Delivery Addresses */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-extrabold text-white text-xs uppercase tracking-wider flex items-center gap-2">
                        <Icon name="navigation" className="w-4 h-4 text-sky-400" />
                        <span>Saved Bangkok Delivery Locations ({selectedCustomer.addresses?.length || 0})</span>
                      </h4>
                      <button
                        type="button"
                        onClick={() => setShowAddAddressForm(!showAddAddressForm)}
                        className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-400 text-xs font-bold border border-slate-700 transition"
                      >
                        {showAddAddressForm ? 'Cancel' : '+ Add Address'}
                      </button>
                    </div>

                    {/* Inline Add Address Form */}
                    {showAddAddressForm && (
                      <form onSubmit={handleInlineAddAddress} className="bg-slate-800 p-4 rounded-2xl border border-sky-500/40 space-y-3">
                        <h5 className="font-bold text-white text-xs">Add New Bangkok Delivery Location</h5>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <label className="block text-slate-400 mb-1">Label (e.g. Studio, Office)</label>
                            <input
                              type="text"
                              required
                              value={inlineAddrLabel}
                              onChange={(e) => setInlineAddrLabel(e.target.value)}
                              className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                            />
                          </div>
                          <div className="sm:col-span-2">
                            <label className="block text-slate-400 mb-1">Condo Name / Street Address</label>
                            <input
                              type="text"
                              required
                              value={inlineAddrText}
                              onChange={(e) => setInlineAddrText(e.target.value)}
                              placeholder="e.g. Ashton Asoke, Sukhumvit 21"
                              className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-slate-400 mb-1">Bangkok District</label>
                            <select
                              value={inlineAddrDistrict}
                              onChange={(e) => setInlineAddrDistrict(e.target.value)}
                              className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                            >
                              {BANGKOK_DISTRICTS.map(d => (
                                <option key={d} value={d}>{d}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-slate-400 mb-1">Room / Unit / Floor</label>
                            <input
                              type="text"
                              value={inlineAddrRoom}
                              onChange={(e) => setInlineAddrRoom(e.target.value)}
                              placeholder="e.g. Floor 14, Room 1402"
                              className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                            />
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
                          <div className="flex items-center gap-4">
                            <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                              <input
                                type="checkbox"
                                checked={inlineAddrJuristic}
                                onChange={(e) => setInlineAddrJuristic(e.target.checked)}
                                className="w-4 h-4 rounded text-sky-600"
                              />
                              <span>Leave at Juristic Lobby</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                              <input
                                type="checkbox"
                                checked={inlineAddrPrimary}
                                onChange={(e) => setInlineAddrPrimary(e.target.checked)}
                                className="w-4 h-4 rounded text-sky-600"
                              />
                              <span>Set as Primary</span>
                            </label>
                          </div>
                          <button
                            type="submit"
                            className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-md"
                          >
                            Save Address
                          </button>
                        </div>
                      </form>
                    )}

                    {/* Address Cards Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {(selectedCustomer.addresses || []).map(addr => (
                        <div
                          key={addr.id}
                          className={`p-3.5 rounded-2xl border ${
                            addr.isPrimary ? 'bg-slate-800/80 border-sky-500/60' : 'bg-slate-800/40 border-slate-700/60'
                          } space-y-2`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-white text-xs">{addr.label}</span>
                              {addr.isPrimary && (
                                <span className="px-1.5 py-0.5 rounded bg-sky-950 text-sky-400 text-[10px] font-bold border border-sky-800">
                                  Primary
                                </span>
                              )}
                            </div>
                            <a
                              href={addr.googleMapsUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="px-2 py-0.5 rounded bg-slate-700 hover:bg-slate-600 text-[10px] font-bold text-sky-400 flex items-center gap-1"
                              title="Open in Google Maps"
                            >
                              <Icon name="navigation" className="w-2.5 h-2.5" />
                              <span>Google Maps</span>
                            </a>
                          </div>

                          <p className="text-slate-300 text-xs">{addr.address}</p>
                          <div className="text-[11px] text-slate-400 flex flex-wrap items-center gap-2">
                            <span>District: <strong>{addr.district}</strong></span>
                            {addr.roomNumber && <span>• Unit: <strong>{addr.roomNumber}</strong></span>}
                          </div>

                          <div className="pt-1 flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-700/50">
                            <span>{addr.leaveWithJuristic ? '✓ Juristic Drop-Off Allowed' : '⚠️ Must Hand To Customer'}</span>
                            {!addr.isPrimary && (
                              <button
                                onClick={() => laundryStore.updateCustomerAddress(selectedCustomer.id, addr.id, { isPrimary: true })}
                                className="text-sky-400 hover:underline font-semibold"
                              >
                                Set as Primary
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Thai Corporate Tax & Invoicing Profile */}
                  <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/80 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-extrabold text-white text-xs uppercase tracking-wider flex items-center gap-2">
                        <Icon name="building2" className="w-4 h-4 text-amber-400" />
                        <span>Thai Corporate Tax Invoice (e-Tax Receipt / ใบกำกับภาษี)</span>
                      </h4>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        selectedCustomer.companyTax?.required 
                          ? 'bg-amber-950 text-amber-300 border-amber-800' 
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}>
                        {selectedCustomer.companyTax?.required ? 'Tax Invoicing Active' : 'Personal / Non-Tax'}
                      </span>
                    </div>

                    {selectedCustomer.companyTax?.required ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div>
                          <span className="text-slate-400 block mb-0.5">Company Legal Name (ชื่อบริษัท):</span>
                          <span className="font-bold text-white">{selectedCustomer.companyTax.companyName || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block mb-0.5">13-Digit Tax ID (เลขประจำตัวผู้เสียภาษี):</span>
                          <span className="font-mono font-bold text-amber-300">{selectedCustomer.companyTax.taxId || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block mb-0.5">Branch / Head Office (สาขา):</span>
                          <span className="text-slate-200">{selectedCustomer.companyTax.branch || 'Head Office (สำนักงานใหญ่)'}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block mb-0.5">Company Registered Address:</span>
                          <span className="text-slate-200">{selectedCustomer.companyTax.companyAddress || 'Same as primary condo'}</span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-slate-400 text-xs">
                        This customer has not requested official corporate tax deduction receipts. All services are billed under standard consumer e-receipts.
                      </p>
                    )}
                  </div>

                </div>
              )}

              {/* TAB 2: GARMENT CARE & LAUNDRY PREFERENCES */}
              {activeDossierTab === 'garment_care' && (
                <form onSubmit={handleSaveGarmentPreferences} className="space-y-6">
                  
                  <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700/80 flex items-start gap-3">
                    <span className="text-2xl">🧺</span>
                    <div>
                      <h4 className="font-bold text-white text-xs">Custom Garment Care Specifications</h4>
                      <p className="text-[11px] text-slate-400">
                        Preserve these settings across all future pickup orders. Certified intake scales and central wash technicians strictly honor these profiles.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    
                    {/* Detergent Selection */}
                    <div>
                      <label className="block text-slate-300 font-bold mb-1">
                        Detergent Formulation *
                      </label>
                      <select
                        value={careDetergent}
                        onChange={(e) => setCareDetergent(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-sky-500"
                      >
                        {DETERGENT_OPTIONS.map(d => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                    </div>

                    {/* Water Temperature */}
                    <div>
                      <label className="block text-slate-300 font-bold mb-1">
                        Water Temperature Wash Cycle *
                      </label>
                      <select
                        value={careWaterTemp}
                        onChange={(e) => setCareWaterTemp(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-sky-500"
                      >
                        {WATER_TEMP_OPTIONS.map(w => (
                          <option key={w} value={w}>{w}</option>
                        ))}
                      </select>
                    </div>

                    {/* Ironing Starch */}
                    <div>
                      <label className="block text-slate-300 font-bold mb-1">
                        Ironing & Starch Level *
                      </label>
                      <select
                        value={careStarch}
                        onChange={(e) => setCareStarch(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-sky-500"
                      >
                        {STARCH_OPTIONS.map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>

                    {/* Packaging & Presentation */}
                    <div>
                      <label className="block text-slate-300 font-bold mb-1">
                        Packaging & Wardrobe Presentation *
                      </label>
                      <select
                        value={carePackaging}
                        onChange={(e) => setCarePackaging(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-sky-500"
                      >
                        {PACKAGING_OPTIONS.map(p => (
                          <option key={p} value={p}>{p}</option>
                        ))}
                      </select>
                    </div>

                  </div>

                  {/* Fabric Softener & Special Allergy Alerts */}
                  <div className="space-y-3">
                    <div>
                      <label className="block text-slate-300 font-bold mb-1">
                        Fabric Softener / Conditioner
                      </label>
                      <input
                        type="text"
                        value={careSoftener}
                        onChange={(e) => setCareSoftener(e.target.value)}
                        placeholder="e.g. Zero Softener for Gym/Athletic wear or Gentle Lavender"
                        className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 font-bold mb-1">
                        Special Fabric Warnings & Allergen Alerts (Perpetual Note)
                      </label>
                      <textarea
                        rows="2"
                        value={careAlerts}
                        onChange={(e) => setCareAlerts(e.target.value)}
                        placeholder="e.g. Mulberry silk items present. Check for pet hair and use gentle lint roller. Dry clean only for wool coats."
                        className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                      />
                    </div>
                  </div>

                  {/* Delivery Access & Juristic Notes */}
                  <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/80 space-y-3">
                    <h4 className="font-extrabold text-white text-xs uppercase tracking-wider">
                      Bangkok Condominium Access & Courier Logistics
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-400 mb-1">Condo Keycard / Intercom Code</label>
                        <input
                          type="text"
                          value={deliveryAccessCode}
                          onChange={(e) => setDeliveryAccessCode(e.target.value)}
                          placeholder="e.g. Intercom #2209 or Keycard in Juristic Box"
                          className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-1">Preferred Time Window</label>
                        <input
                          type="text"
                          value={deliveryTimeslot}
                          onChange={(e) => setDeliveryTimeslot(e.target.value)}
                          placeholder="e.g. Morning 09:00 - 11:00 or Evening"
                          className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-400 mb-1">Security Guard & Concierge Instructions</label>
                      <input
                        type="text"
                        value={deliveryGuardNotes}
                        onChange={(e) => setDeliveryGuardNotes(e.target.value)}
                        placeholder="e.g. Tell guard you are delivering to Tower A, leave with Juristic staff K. Somchai."
                        className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-lg shadow-sky-600/30 transition transform hover:-translate-y-0.5"
                    >
                      Save Garment Care & Delivery Profile
                    </button>
                  </div>

                </form>
              )}

              {/* TAB 3: TRANSACTIONS & MULTI-YEAR LEDGER */}
              {activeDossierTab === 'transactions' && (
                <div className="space-y-4">
                  
                  <div className="flex items-center justify-between">
                    <h4 className="font-extrabold text-white text-xs uppercase tracking-wider">
                      Orders & Cashless Transactions ({selectedCustomer.orders?.length || 0})
                    </h4>
                    <button
                      type="button"
                      onClick={() => setShowQuickOrderModal(true)}
                      className="px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-md flex items-center gap-1"
                    >
                      <span>+ Create POS Order</span>
                    </button>
                  </div>

                  {(!selectedCustomer.orders || selectedCustomer.orders.length === 0) ? (
                    <div className="p-8 text-center bg-slate-800/40 rounded-2xl border border-slate-700 text-slate-400">
                      No order transactions found for this customer profile yet.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {selectedCustomer.orders.map(order => {
                        const statusObj = ORDER_STATUSES[order.status] || { label: order.status, color: 'bg-slate-700 text-white' };
                        const isLive = order.status !== 'DELIVERED' && order.status !== 'CANCELLED';

                        return (
                          <div
                            key={order.id}
                            className={`p-4 rounded-2xl border ${
                              isLive ? 'bg-slate-800 border-sky-500/60 shadow-md' : 'bg-slate-800/50 border-slate-700/60'
                            } flex flex-col sm:flex-row sm:items-center justify-between gap-3`}
                          >
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-bold text-white text-sm">{order.id}</span>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusObj.color}`}>
                                  {statusObj.label}
                                </span>
                                {order.paymentStatus === 'PAID' ? (
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
                                    PAID ({order.paymentMethod || 'PromptPay'})
                                  </span>
                                ) : (
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-800">
                                    UNPAID
                                  </span>
                                )}
                              </div>

                              <div className="text-slate-300 text-xs">
                                <strong>{order.serviceName || order.serviceId}</strong> • {order.condoName} ({order.district})
                              </div>

                              <div className="text-[11px] text-slate-400 flex flex-wrap items-center gap-3">
                                <span>Pickup: <strong>{order.pickupDate} ({order.pickupTime})</strong></span>
                                <span>•</span>
                                <span>Intake Scale: <strong>{order.actualWeightKg ? `${order.actualWeightKg} KG` : `${order.estimatedWeightKg} KG (Est.)`}</strong></span>
                                {order.paymentRef && <span>• Ref: <strong className="font-mono">{order.paymentRef}</strong></span>}
                              </div>
                            </div>

                            <div className="sm:text-right shrink-0">
                              <span className="text-base font-black text-emerald-400 block">
                                ฿{order.totalPrice} THB
                              </span>
                              <span className="text-[10px] text-slate-400 block">
                                Rate: ฿{order.pricePerKg || 65}/KG
                              </span>
                            </div>

                          </div>
                        );
                      })}
                    </div>
                  )}

                </div>
              )}

              {/* TAB 4: ISSUES & STAFF NOTES */}
              {activeDossierTab === 'issues' && (
                <div className="space-y-6">
                  
                  <div className="flex items-center justify-between">
                    <h4 className="font-extrabold text-white text-xs uppercase tracking-wider">
                      Reported Issues, Tickets & Chat Inquiries ({selectedCustomer.incidents?.length || 0})
                    </h4>
                    <button
                      type="button"
                      onClick={() => setShowLogIssueModal(true)}
                      className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md"
                    >
                      + Log New Ticket
                    </button>
                  </div>

                  {(!selectedCustomer.incidents || selectedCustomer.incidents.length === 0) ? (
                    <div className="p-6 text-center bg-slate-800/40 rounded-2xl border border-slate-700 text-slate-400">
                      No issues or tickets recorded for this customer.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {selectedCustomer.incidents.map(inc => (
                        <div key={inc.id} className="bg-slate-800/70 p-4 rounded-2xl border border-slate-700 space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-white">{inc.id}</span>
                              <span className="font-semibold text-slate-200">{inc.subject || 'Special Inquiry'}</span>
                            </div>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                              inc.status === 'resolved' 
                                ? 'bg-emerald-950 text-emerald-300 border-emerald-800' 
                                : 'bg-amber-950 text-amber-300 border-amber-800'
                            }`}>
                              {inc.status === 'resolved' ? '✓ Resolved' : '⏳ Pending'}
                            </span>
                          </div>

                          <p className="text-slate-300 text-xs bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                            "{inc.message}"
                          </p>

                          {inc.response && (
                            <div className="text-emerald-400 text-xs bg-emerald-950/40 p-2.5 rounded-xl border border-emerald-900/40">
                              <strong>Staff Resolution:</strong> {inc.response}
                            </div>
                          )}

                          <div className="text-[10px] text-slate-500">
                            Channel: {inc.channel?.toUpperCase() || 'ONLINE'} • Logged: {new Date(inc.createdAt).toLocaleString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Staff Internal Notes Ledger */}
                  <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700 space-y-3">
                    <h4 className="font-extrabold text-white text-xs uppercase tracking-wider">
                      Staff Internal Dossier Notes
                    </h4>
                    
                    <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-slate-300 whitespace-pre-wrap font-mono text-[11px] max-h-40 overflow-y-auto">
                      {selectedCustomer.notes || 'No staff notes recorded yet.'}
                    </div>

                    <form onSubmit={handleAddStaffNote} className="flex gap-2">
                      <input
                        type="text"
                        value={newStaffNoteText}
                        onChange={(e) => setNewStaffNoteText(e.target.value)}
                        placeholder="Add staff note (e.g. Customer prefers lavender, confirmed comforter dimensions)..."
                        className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs"
                      >
                        Append Note
                      </button>
                    </form>
                  </div>

                </div>
              )}

              {/* TAB 5: MULTI-YEAR LTV ANALYTICS */}
              {activeDossierTab === 'analytics' && (
                <div className="space-y-6">
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700 text-center">
                      <span className="text-[11px] text-slate-400 font-bold block mb-1">Lifetime Spend</span>
                      <span className="text-2xl font-black text-emerald-400">฿{(selectedCustomer.lifetimeSpend || 0).toLocaleString()}</span>
                      <span className="text-[10px] text-slate-500 block mt-1">THB Processed</span>
                    </div>

                    <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700 text-center">
                      <span className="text-[11px] text-slate-400 font-bold block mb-1">Total Cleaned Weight</span>
                      <span className="text-2xl font-black text-sky-400">{(selectedCustomer.lifetimeKg || 0).toFixed(1)} KG</span>
                      <span className="text-[10px] text-slate-500 block mt-1">Verified Central Scale</span>
                    </div>

                    <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700 text-center">
                      <span className="text-[11px] text-slate-400 font-bold block mb-1">Average Order Value</span>
                      <span className="text-2xl font-black text-purple-400">฿{selectedCustomer.averageOrderValue || 0}</span>
                      <span className="text-[10px] text-slate-500 block mt-1">THB / Booking</span>
                    </div>
                  </div>

                  <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700 space-y-3">
                    <h4 className="font-extrabold text-white text-xs uppercase tracking-wider">
                      Customer Retention & Multi-Year Loyalty Profile
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
                        <span className="text-slate-400 block mb-1">Loyalty Points Balance:</span>
                        <div className="flex items-center justify-between">
                          <span className="text-xl font-black text-amber-400">{selectedCustomer.loyaltyPoints || 0} Points</span>
                          <button
                            onClick={() => setShowPointsModal(true)}
                            className="text-xs text-sky-400 hover:underline font-bold"
                          >
                            Grant / Redeem
                          </button>
                        </div>
                        <span className="text-[10px] text-slate-500 block mt-1">1 point awarded per ฿10 spent</span>
                      </div>

                      <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
                        <span className="text-slate-400 block mb-1">Favorite Laundry Service:</span>
                        <span className="text-sm font-black text-white">{selectedCustomer.favoriteService}</span>
                        <span className="text-[10px] text-slate-500 block mt-1">Most frequently booked service</span>
                      </div>

                      <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
                        <span className="text-slate-400 block mb-1">Activity & Churn Status:</span>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full border inline-block ${CHURN_STATUS_CONFIG[selectedCustomer.churnStatus]?.color || 'bg-slate-800 text-white'}`}>
                          {CHURN_STATUS_CONFIG[selectedCustomer.churnStatus]?.label || selectedCustomer.churnStatus}
                        </span>
                        <span className="text-[10px] text-slate-500 block mt-1">Last active: {selectedCustomer.daysSinceActive} days ago</span>
                      </div>

                      <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
                        <span className="text-slate-400 block mb-1">Customer Tenure:</span>
                        <span className="text-sm font-black text-indigo-400">{selectedCustomer.tenureText}</span>
                        <span className="text-[10px] text-slate-500 block mt-1">First registered: {new Date(selectedCustomer.memberSince).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Regulatory & PDPA Compliance */}
                  <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-900/50 text-indigo-300 text-xs flex items-start gap-3">
                    <Icon name="shieldCheck" className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white block mb-0.5">Thailand PDPA Compliance & Multi-Year Archival</strong>
                      <span>
                        Customer data is encrypted and retained in compliance with Thai Personal Data Protection Act (PDPA B.E. 2562). Customers can request full data export or account closure anytime.
                      </span>
                    </div>
                  </div>

                </div>
              )}

            </div>

            {/* Dossier Modal Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">
                Created on {new Date(selectedCustomer.createdAt).toLocaleDateString()} • NoName Laundry Bangkok Operations
              </span>
              <button
                type="button"
                onClick={() => setSelectedCustomerId(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs"
              >
                Close Dossier
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* QUICK ORDER FOR CUSTOMER MODAL */}
      {/* ========================================================== */}
      {showQuickOrderModal && selectedCustomer && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h4 className="font-black text-white text-base">Quick Order: {selectedCustomer.fullName}</h4>
                <p className="text-[11px] text-slate-400">Pre-filled with customer garment care & address</p>
              </div>
              <button onClick={() => setShowQuickOrderModal(false)} className="text-slate-400 hover:text-white">
                <Icon name="x" className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateQuickOrder} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1">Service Type</label>
                <select
                  value={quickServiceId}
                  onChange={(e) => setQuickServiceId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                >
                  <option value="wash_fold">Wash / Fold (฿65/KG)</option>
                  <option value="wash_iron_fold">Wash / Iron / Fold (฿95/KG)</option>
                  <option value="wash_iron_hang">Wash / Iron / Hang (฿120/KG)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Estimated Laundry Weight (KG)</label>
                <input
                  type="number"
                  step="0.5"
                  min="4.0"
                  required
                  value={quickWeightKg}
                  onChange={(e) => setQuickWeightKg(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Delivery Destination</label>
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300">
                  {selectedCustomer.primaryAddress?.label || 'Primary Condo'}: {selectedCustomer.primaryAddress?.address || 'Bangkok'}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Additional Instructions</label>
                <input
                  type="text"
                  value={quickSpecialInstructions}
                  onChange={(e) => setQuickSpecialInstructions(e.target.value)}
                  placeholder="e.g. 2 extra duvet covers in blue bag"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowQuickOrderModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold shadow-md"
                >
                  Dispatch Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* ADJUST LOYALTY POINTS MODAL */}
      {/* ========================================================== */}
      {showPointsModal && selectedCustomer && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h4 className="font-bold text-white text-sm">Loyalty Points: {selectedCustomer.fullName}</h4>
              <button onClick={() => setShowPointsModal(false)} className="text-slate-400 hover:text-white">
                <Icon name="x" className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAdjustPointsSubmit} className="space-y-3 text-xs">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-center">
                <span className="text-slate-400 text-[11px] block">Current Balance</span>
                <span className="text-2xl font-black text-amber-400">{selectedCustomer.loyaltyPoints || 0} pts</span>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Points Delta (+ or -)</label>
                <input
                  type="number"
                  required
                  value={pointsDeltaInput}
                  onChange={(e) => setPointsDeltaInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Reason / Description</label>
                <input
                  type="text"
                  required
                  value={pointsReasonInput}
                  onChange={(e) => setPointsReasonInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowPointsModal(false)}
                  className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold"
                >
                  Apply Points
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* 6-DIGIT PIN RESET MODAL */}
      {/* ========================================================== */}
      {showPinModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h4 className="font-bold text-white text-sm">Configure 6-Digit PIN</h4>
              <button onClick={() => setShowPinModal(false)} className="text-slate-400 hover:text-white">
                <Icon name="x" className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdatePinSubmit} className="space-y-3 text-xs">
              <p className="text-slate-400 text-[11px]">
                Enter a 6-digit numeric access PIN for rapid customer verification without OTP.
              </p>

              <div>
                <label className="block font-bold text-slate-300 mb-1">6-Digit PIN *</label>
                <input
                  type="password"
                  maxLength="6"
                  required
                  value={newPinCodeInput}
                  onChange={(e) => setNewPinCodeInput(e.target.value)}
                  placeholder="123456"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-center text-lg tracking-widest"
                />
              </div>

              {pinFeedbackMsg && (
                <div className={`p-2 rounded-xl text-center text-xs font-bold ${
                  pinFeedbackMsg.startsWith('✓') ? 'text-emerald-400 bg-emerald-950/60' : 'text-rose-400 bg-rose-950/60'
                }`}>
                  {pinFeedbackMsg}
                </div>
              )}

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowPinModal(false)}
                  className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold"
                >
                  Save PIN
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* OTP SIMULATOR MODAL */}
      {/* ========================================================== */}
      {showOtpModal && otpTargetCustomer && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h4 className="font-bold text-white text-sm">OTP Verification Simulator</h4>
                <p className="text-[10px] text-slate-400">Via {otpChannel.toUpperCase()}</p>
              </div>
              <button onClick={() => setShowOtpModal(false)} className="text-slate-400 hover:text-white">
                <Icon name="x" className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleVerifyOtpSubmit} className="space-y-3 text-xs">
              {otpGeneratedData && (
                <div className="p-3 bg-slate-950 rounded-2xl border border-sky-500/40 text-center space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Simulated Inbound OTP</span>
                  <div className="font-mono text-2xl font-black text-sky-400 tracking-widest">
                    {otpGeneratedData.code}
                  </div>
                  <span className="text-[10px] text-slate-500 block">Sent to {otpGeneratedData.contact}</span>
                </div>
              )}

              <div>
                <label className="block text-slate-300 font-bold mb-1">Enter Verification Code</label>
                <input
                  type="text"
                  maxLength="6"
                  required
                  value={otpEnteredCode}
                  onChange={(e) => setOtpEnteredCode(e.target.value)}
                  placeholder="Enter 6-digit OTP"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-center tracking-widest text-base"
                />
              </div>

              {otpFeedbackMsg && (
                <div className={`p-2 rounded-xl text-center text-xs font-bold ${
                  otpFeedbackMsg.startsWith('✓') ? 'text-emerald-400 bg-emerald-950/60' : 'text-rose-400 bg-rose-950/60'
                }`}>
                  {otpFeedbackMsg}
                </div>
              )}

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowOtpModal(false)}
                  className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                >
                  Verify Code
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* LOG ISSUE / TICKET MODAL */}
      {/* ========================================================== */}
      {showLogIssueModal && selectedCustomer && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h4 className="font-bold text-white text-sm">Log Issue: {selectedCustomer.fullName}</h4>
                <p className="text-[10px] text-slate-400">Record chat interaction or special complaint</p>
              </div>
              <button onClick={() => setShowLogIssueModal(false)} className="text-slate-400 hover:text-white">
                <Icon name="x" className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleLogIssueSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Inbound Channel</label>
                <select
                  value={issueChannel}
                  onChange={(e) => setIssueChannel(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                >
                  <option value="whatsapp">WhatsApp Chat</option>
                  <option value="line">LINE Official Account</option>
                  <option value="email">Email Support</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Subject / Item Concerned</label>
                <input
                  type="text"
                  required
                  value={issueSubject}
                  onChange={(e) => setIssueSubject(e.target.value)}
                  placeholder="e.g. Special starch request or missing belt"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Related Order ID (Optional)</label>
                <input
                  type="text"
                  value={issueOrderId}
                  onChange={(e) => setIssueOrderId(e.target.value)}
                  placeholder="e.g. NNL-8491-BK"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Customer Inquiry / Details</label>
                <textarea
                  rows="3"
                  required
                  value={issueMessage}
                  onChange={(e) => setIssueMessage(e.target.value)}
                  placeholder="Describe inquiry or feedback from customer..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowLogIssueModal(false)}
                  className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold"
                >
                  Save Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* REGISTER NEW CUSTOMER MODAL */}
      {/* ========================================================== */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h4 className="font-black text-white text-base">Register New Customer Profile</h4>
                <p className="text-[11px] text-slate-400">Initialize identity, delivery address & company tax record</p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <Icon name="x" className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomerSubmit} className="p-6 overflow-y-auto flex-1 space-y-4 text-xs">
              
              {/* Identity Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={newFullName}
                    onChange={(e) => setNewFullName(e.target.value)}
                    placeholder="e.g. Alex Thorne"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Nickname (ชื่อเล่น)</label>
                  <input
                    type="text"
                    value={newNickName}
                    onChange={(e) => setNewNickName(e.target.value)}
                    placeholder="e.g. Alex / Som"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Gender</label>
                  <select
                    value={newGender}
                    onChange={(e) => setNewGender(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                  >
                    {GENDER_OPTIONS.map(g => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={newDob}
                    onChange={(e) => setNewDob(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Customer Tier</label>
                  <select
                    value={newTier}
                    onChange={(e) => setNewTier(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                  >
                    {Object.keys(CUSTOMER_TIERS).map(t => (
                      <option key={t} value={t}>{CUSTOMER_TIERS[t].label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Contact Channels */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-800">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Mobile Phone *</label>
                  <input
                    type="text"
                    required
                    value={newMobile}
                    onChange={(e) => setNewMobile(e.target.value)}
                    placeholder="+66 81 234 5678"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                  />
                  <label className="flex items-center gap-2 cursor-pointer mt-1.5 text-[11px] text-emerald-400">
                    <input
                      type="checkbox"
                      checked={newIsWhatsApp}
                      onChange={(e) => setNewIsWhatsApp(e.target.checked)}
                      className="w-3.5 h-3.5 rounded text-emerald-500"
                    />
                    <span>Number is registered on WhatsApp</span>
                  </label>
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">LINE ID</label>
                  <input
                    type="text"
                    value={newLineId}
                    onChange={(e) => setNewLineId(e.target.value)}
                    placeholder="@lineid or phone"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Email Address</label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="alex@domain.com"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">6-Digit Access PIN</label>
                  <input
                    type="password"
                    maxLength="6"
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value)}
                    placeholder="123456"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-center tracking-widest"
                  />
                </div>
              </div>

              {/* Primary Address */}
              <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 space-y-3">
                <h5 className="font-bold text-white text-xs">Primary Bangkok Address</h5>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1">Label</label>
                    <input
                      type="text"
                      value={newAddrLabel}
                      onChange={(e) => setNewAddrLabel(e.target.value)}
                      placeholder="e.g. Home Condo"
                      className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-slate-400 mb-1">Address / Condo Name *</label>
                    <input
                      type="text"
                      required
                      value={newAddrText}
                      onChange={(e) => setNewAddrText(e.target.value)}
                      placeholder="e.g. The Estelle Phrom Phong, 8 Sukhumvit 26"
                      className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1">Bangkok District *</label>
                    <select
                      value={newAddrDistrict}
                      onChange={(e) => setNewAddrDistrict(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
                    >
                      {BANGKOK_DISTRICTS.map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Room / Unit</label>
                    <input
                      type="text"
                      value={newAddrRoom}
                      onChange={(e) => setNewAddrRoom(e.target.value)}
                      placeholder="e.g. Tower A, Room 1804"
                      className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Company Tax Toggle */}
              <div className="pt-2 border-t border-slate-800">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-white text-xs">
                  <input
                    type="checkbox"
                    checked={newRequireTax}
                    onChange={(e) => setNewRequireTax(e.target.checked)}
                    className="w-4 h-4 rounded text-sky-600"
                  />
                  <span>Corporate Client: Requires Thai e-Tax / Tax Receipt</span>
                </label>

                {newRequireTax && (
                  <div className="mt-3 p-3.5 bg-slate-950/60 rounded-2xl border border-slate-800 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-400 mb-1">Company Name *</label>
                        <input
                          type="text"
                          required={newRequireTax}
                          value={newCompanyName}
                          onChange={(e) => setNewCompanyName(e.target.value)}
                          placeholder="e.g. Thorne Design Co., Ltd."
                          className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-1">13-Digit Tax ID *</label>
                        <input
                          type="text"
                          maxLength="13"
                          required={newRequireTax}
                          value={newTaxId}
                          onChange={(e) => setNewTaxId(e.target.value)}
                          placeholder="0105562019284"
                          className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold shadow-md"
                >
                  Create Customer Record
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
