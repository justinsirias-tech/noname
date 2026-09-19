import React, { useState, useEffect } from 'react';
import { Icon } from './Icons.jsx';
import { BANGKOK_DISTRICTS, GENDER_OPTIONS, CUSTOMER_TIERS } from '../data/servicesData.js';
import { laundryStore, getLineOaMessageUrl, CONTACT_CHANNELS } from '../store.js';

export function CustomerCRM({
  onSelectOrder,
  onCreateManualOrder
}) {
  // Store enriched customers
  const [customers, setCustomers] = useState(() => laundryStore.getEnrichedCustomers());
  const [searchQuery, setSearchQuery] = useState('');
  const [genderFilter, setGenderFilter] = useState('ALL');
  const [tierFilter, setTierFilter] = useState('ALL');
  const [featureFilter, setFeatureFilter] = useState('ALL'); // 'ALL', 'whatsapp', 'tax', 'active_orders', 'has_issues'
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'cards'

  // Selected Customer for Detailed Drawer / Modal
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [activeCustomerTab, setActiveCustomerTab] = useState('profile'); // 'profile', 'transactions', 'issues'

  // Add Customer Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newFullName, setNewFullName] = useState('');
  const [newNickName, setNewNickName] = useState('');
  const [newGender, setNewGender] = useState('Rather not say');
  const [newDob, setNewDob] = useState('');
  const [newMobile, setNewMobile] = useState('+66 ');
  const [newIsWhatsApp, setNewIsWhatsApp] = useState(true);
  const [newSecondaryMobile, setNewSecondaryMobile] = useState('');
  const [newIsSecondaryWhatsApp, setNewIsSecondaryWhatsApp] = useState(true);
  const [newEmail, setNewEmail] = useState('');
  const [newLineId, setNewLineId] = useState('');

  // Edit Phone Numbers Modal inside Customer Detail
  const [showEditPhonesModal, setShowEditPhonesModal] = useState(false);
  const [editThaiMobile, setEditThaiMobile] = useState('');
  const [editIsWhatsAppThai, setEditIsWhatsAppThai] = useState(true);
  const [editIntlMobile, setEditIntlMobile] = useState('');
  const [editIsWhatsAppIntl, setEditIsWhatsAppIntl] = useState(true);
  const [newPin, setNewPin] = useState('123456');
  const [newTier, setNewTier] = useState('Regular');
  const [newNotes, setNewNotes] = useState('');
  
  // New Customer Initial Address
  const [newAddrLabel, setNewAddrLabel] = useState('Home Condo');
  const [newAddrText, setNewAddrText] = useState('');
  const [newAddrRoom, setNewAddrRoom] = useState('');
  const [newAddrDistrict, setNewAddrDistrict] = useState(BANGKOK_DISTRICTS[0]);
  const [newAddrJuristic, setNewAddrJuristic] = useState(true);

  // New Customer Company Tax
  const [newRequireTax, setNewRequireTax] = useState(false);
  const [newCompanyName, setNewCompanyName] = useState('');
  const [newTaxId, setNewTaxId] = useState('');
  const [newBranch, setNewBranch] = useState('Head Office (สำนักงานใหญ่)');
  const [newCompanyAddress, setNewCompanyAddress] = useState('');

  // Inline Add Address State inside Customer Detail
  const [showAddAddressForm, setShowAddAddressForm] = useState(false);
  const [inlineAddrLabel, setInlineAddrLabel] = useState('Office / Studio');
  const [inlineAddrText, setInlineAddrText] = useState('');
  const [inlineAddrRoom, setInlineAddrRoom] = useState('');
  const [inlineAddrDistrict, setInlineAddrDistrict] = useState(BANGKOK_DISTRICTS[0]);
  const [inlineAddrJuristic, setInlineAddrJuristic] = useState(false);
  const [inlineAddrPrimary, setInlineAddrPrimary] = useState(false);

  // Staff Note Input inside Customer Detail
  const [newStaffNoteText, setNewStaffNoteText] = useState('');

  // Log Issue / Ticket Modal inside Customer Detail
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

  // PIN Change / Reset State
  const [showPinModal, setShowPinModal] = useState(false);
  const [newPinCodeInput, setNewPinCodeInput] = useState('');
  const [pinFeedbackMsg, setPinFeedbackMsg] = useState('');

  // Notification Banner
  const [crmToast, setCrmToast] = useState('');
  const showToast = (msg) => {
    setCrmToast(msg);
    setTimeout(() => setCrmToast(''), 3500);
  };

  // Re-sync customers from store
  const refreshCustomers = () => {
    const refreshed = laundryStore.getEnrichedCustomers();
    setCustomers(refreshed);
    if (selectedCustomer) {
      const updatedSelected = refreshed.find(c => c.id === selectedCustomer.id);
      if (updatedSelected) setSelectedCustomer(updatedSelected);
    }
  };

  useEffect(() => {
    return laundryStore.subscribe(() => {
      refreshCustomers();
    });
  }, []);

  // System-wide ESC Key listener to close open profile or modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' || e.key === 'Esc') {
        if (showEditPhonesModal) {
          setShowEditPhonesModal(false);
        } else if (showPinModal) {
          setShowPinModal(false);
        } else if (showOtpModal) {
          setShowOtpModal(false);
        } else if (showLogIssueModal) {
          setShowLogIssueModal(false);
        } else if (showAddAddressForm) {
          setShowAddAddressForm(false);
        } else if (showAddModal) {
          setShowAddModal(false);
        } else if (selectedCustomer) {
          setSelectedCustomer(null);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showEditPhonesModal, showPinModal, showOtpModal, showLogIssueModal, showAddAddressForm, showAddModal, selectedCustomer]);

  // Calculate Age from Date of Birth
  const calculateAge = (dobString) => {
    if (!dobString) return null;
    const birthDate = new Date(dobString);
    if (isNaN(birthDate.getTime())) return null;
    const diffMs = Date.now() - birthDate.getTime();
    const ageDt = new Date(diffMs);
    return Math.abs(ageDt.getUTCFullYear() - 1970);
  };

  // KPI Calculations
  const totalCustomers = customers.length;
  const verifiedCount = customers.filter(c => c.isVerified).length;
  const corporateCount = customers.filter(c => c.companyTax?.required).length;
  const activeOrdersCount = customers.reduce((sum, c) => sum + (c.activeOrders?.length || 0), 0);
  const totalRevenueAll = customers.reduce((sum, c) => sum + (c.totalSpend || 0), 0);

  // Filtered and Searched Customer List
  const filteredCustomers = customers.filter(c => {
    // Search query matches Full Name, Nickname, Mobile, LINE, Email, Condo, Tax ID
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch = !q ||
      (c.fullName && c.fullName.toLowerCase().includes(q)) ||
      (c.nickName && c.nickName.toLowerCase().includes(q)) ||
      (c.mobileNumber && c.mobileNumber.toLowerCase().includes(q)) ||
      (c.lineId && c.lineId.toLowerCase().includes(q)) ||
      (c.email && c.email.toLowerCase().includes(q)) ||
      (c.companyTax?.taxId && c.companyTax.taxId.includes(q)) ||
      (c.companyTax?.companyName && c.companyTax.companyName.toLowerCase().includes(q)) ||
      (c.addresses || []).some(a => (a.address && a.address.toLowerCase().includes(q)) || (a.label && a.label.toLowerCase().includes(q)));

    // Gender Filter
    const matchesGender = genderFilter === 'ALL' || c.gender === genderFilter;

    // Tier Filter
    const matchesTier = tierFilter === 'ALL' || c.tier === tierFilter;

    // Feature Filter
    let matchesFeature = true;
    if (featureFilter === 'whatsapp') matchesFeature = Boolean(c.isWhatsApp);
    if (featureFilter === 'tax') matchesFeature = Boolean(c.companyTax?.required);
    if (featureFilter === 'active_orders') matchesFeature = (c.activeOrders?.length || 0) > 0;
    if (featureFilter === 'has_issues') matchesFeature = (c.incidents?.length || 0) > 0;

    return matchesSearch && matchesGender && matchesTier && matchesFeature;
  });

  // Handle Add Customer Submit
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
      secondaryMobile: newSecondaryMobile.trim(),
      isSecondaryWhatsApp: newIsSecondaryWhatsApp,
      email: newEmail.trim().toLowerCase(),
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
      addresses: [
        {
          id: 'ADDR-' + Math.floor(100 + Math.random() * 900),
          label: newAddrLabel.trim() || 'Home',
          address: newAddrText.trim() || `${newAddrDistrict}, Bangkok`,
          district: newAddrDistrict,
          roomNumber: newAddrRoom.trim(),
          googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(newAddrText.trim() || newAddrDistrict)}`,
          leaveWithJuristic: newAddrJuristic,
          isPrimary: true
        }
      ]
    });

    refreshCustomers();
    setShowAddModal(false);
    showToast(`Customer "${created.fullName}" registered successfully!`);

    // Reset Form
    setNewFullName('');
    setNewNickName('');
    setNewMobile('+66 ');
    setNewIsWhatsApp(true);
    setNewSecondaryMobile('');
    setNewIsSecondaryWhatsApp(true);
    setNewEmail('');
    setNewLineId('');
    setNewAddrText('');
    setNewAddrRoom('');
    setNewRequireTax(false);
    setNewCompanyName('');
    setNewTaxId('');
  };

  // Open & Save Phone Numbers Edit Modal
  const handleOpenEditPhones = (cust) => {
    setEditThaiMobile(cust.mobileNumber || '+66 ');
    setEditIsWhatsAppThai(cust.isWhatsApp !== undefined ? cust.isWhatsApp : true);
    setEditIntlMobile(cust.secondaryMobile || '');
    setEditIsWhatsAppIntl(cust.isSecondaryWhatsApp !== undefined ? cust.isSecondaryWhatsApp : true);
    setShowEditPhonesModal(true);
  };

  const handleSaveEditedPhones = (e) => {
    e.preventDefault();
    if (!selectedCustomer) return;

    laundryStore.updateCustomer(selectedCustomer.id, {
      mobileNumber: editThaiMobile.trim(),
      isWhatsApp: editIsWhatsAppThai,
      secondaryMobile: editIntlMobile.trim(),
      isSecondaryWhatsApp: editIsWhatsAppIntl
    });

    refreshCustomers();
    setShowEditPhonesModal(false);
    showToast('Customer phone numbers and WhatsApp preferences updated!');
  };

  // Handle Inline Add Address
  const handleAddInlineAddress = (e) => {
    e.preventDefault();
    if (!selectedCustomer || !inlineAddrText.trim()) return;

    laundryStore.addCustomerAddress(selectedCustomer.id, {
      label: inlineAddrLabel.trim() || 'Address',
      address: inlineAddrText.trim(),
      district: inlineAddrDistrict,
      roomNumber: inlineAddrRoom.trim(),
      googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(inlineAddrText.trim() + ' ' + inlineAddrDistrict)}`,
      leaveWithJuristic: inlineAddrJuristic,
      isPrimary: inlineAddrPrimary
    });

    refreshCustomers();
    setShowAddAddressForm(false);
    setInlineAddrText('');
    setInlineAddrRoom('');
    showToast('New address added to customer profile!');
  };

  // Handle Delete Address
  const handleDeleteAddress = (addressId) => {
    if (!selectedCustomer) return;
    if (selectedCustomer.addresses.length <= 1) {
      alert('A customer must have at least one saved address.');
      return;
    }
    if (confirm('Delete this delivery address from the customer profile?')) {
      laundryStore.deleteCustomerAddress(selectedCustomer.id, addressId);
      refreshCustomers();
      showToast('Address deleted.');
    }
  };

  // Handle Set Primary Address
  const handleSetPrimaryAddress = (addressId) => {
    if (!selectedCustomer) return;
    laundryStore.updateCustomerAddress(selectedCustomer.id, addressId, { isPrimary: true });
    refreshCustomers();
    showToast('Primary address updated!');
  };

  // Handle Add Staff Note
  const handleAddStaffNote = (e) => {
    e.preventDefault();
    if (!selectedCustomer || !newStaffNoteText.trim()) return;

    laundryStore.addCustomerNote(selectedCustomer.id, newStaffNoteText.trim());
    refreshCustomers();
    setNewStaffNoteText('');
    showToast('Staff note recorded to customer CRM.');
  };

  // Handle Log Issue / Incident
  const handleLogIssueSubmit = (e) => {
    e.preventDefault();
    if (!selectedCustomer || !issueSubject.trim() || !issueMessage.trim()) return;

    laundryStore.createIncident({
      orderId: issueOrderId || selectedCustomer.activeOrders?.[0]?.id || 'GENERAL_INQUIRY',
      customerName: selectedCustomer.fullName,
      channel: issueChannel,
      contact: issueChannel === 'whatsapp' ? selectedCustomer.mobileNumber : (selectedCustomer.lineId || selectedCustomer.email),
      subject: issueSubject.trim(),
      message: issueMessage.trim()
    });

    refreshCustomers();
    setShowLogIssueModal(false);
    setIssueSubject('');
    setIssueMessage('');
    showToast('Customer issue ticket recorded into history.');
  };

  // Handle Change PIN
  const handleSavePin = (e) => {
    e.preventDefault();
    if (!selectedCustomer || !/^\d{6}$/.test(newPinCodeInput)) {
      setPinFeedbackMsg('PIN must be exactly 6 numeric digits.');
      return;
    }

    laundryStore.setCustomerPin(selectedCustomer.id, newPinCodeInput);
    refreshCustomers();
    setPinFeedbackMsg('6-digit PIN updated successfully!');
    setTimeout(() => {
      setShowPinModal(false);
      setPinFeedbackMsg('');
      setNewPinCodeInput('');
      showToast('Customer 6-digit access PIN saved.');
    }, 1200);
  };

  // Handle Trigger OTP
  const handleOpenOtpSimulator = (customer) => {
    setOtpTargetCustomer(customer);
    const targetContact = customer.isWhatsApp && customer.mobileNumber ? customer.mobileNumber : (customer.mobileNumber || customer.email);
    const defaultChannel = customer.isWhatsApp ? 'whatsapp' : (customer.mobileNumber ? 'sms' : 'email');
    setOtpChannel(defaultChannel);
    const generated = laundryStore.generateOtp(defaultChannel, targetContact);
    setOtpGeneratedData(generated);
    setOtpEnteredCode('');
    setOtpFeedbackMsg('');
    setShowOtpModal(true);
  };

  // Handle Verify OTP in simulator
  const handleVerifyOtpSubmit = (e) => {
    e.preventDefault();
    if (!otpTargetCustomer || !otpEnteredCode.trim()) return;

    const targetContact = otpChannel === 'email' ? otpTargetCustomer.email : otpTargetCustomer.mobileNumber;
    const result = laundryStore.verifyOtp(otpChannel, targetContact, otpEnteredCode.trim());

    if (result.success) {
      setOtpFeedbackMsg('✅ OTP Verified Successfully! Customer account authenticated.');
      refreshCustomers();
      setTimeout(() => {
        setShowOtpModal(false);
        setOtpFeedbackMsg('');
        showToast(`Customer "${otpTargetCustomer.fullName}" verified via ${otpChannel.toUpperCase()}!`);
      }, 1500);
    } else {
      setOtpFeedbackMsg(`❌ ${result.error || 'Invalid OTP code.'}`);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner & KPI Summary */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-sky-950 text-white p-6 sm:p-8 rounded-3xl shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 -mt-10 -mr-10 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/20 text-sky-300 text-xs font-bold border border-sky-500/30 mb-2">
              <Icon name="users" className="w-3.5 h-3.5" />
              <span>Customer Relationship Management (CRM)</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              Customer Profiles & Intelligence
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              Track customer profiles, Google Map condo addresses, WhatsApp/SMS/Email OTP verifications, 6-digit PINs, company tax IDs, live transactions, and historical support incidents.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-xs font-bold shadow-lg shadow-sky-500/30 flex items-center gap-1.5 transition transform hover:-translate-y-0.5"
            >
              <Icon name="userPlus" className="w-4 h-4" />
              <span>+ Register Customer</span>
            </button>
          </div>
        </div>

        {/* 4 KPI Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-700/60">
          <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/10">
            <div className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider">Total Customers</div>
            <div className="text-2xl font-black text-white mt-1">{totalCustomers}</div>
            <div className="text-[10px] text-emerald-400 mt-0.5">● Bangkok Registered</div>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/10">
            <div className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider">Verified Accounts</div>
            <div className="text-2xl font-black text-sky-400 mt-1">{verifiedCount}</div>
            <div className="text-[10px] text-sky-300 mt-0.5">OTP WhatsApp / SMS / Email</div>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/10">
            <div className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider">Company Tax Clients</div>
            <div className="text-2xl font-black text-amber-400 mt-1">{corporateCount}</div>
            <div className="text-[10px] text-amber-300 mt-0.5">Tax Invoice / Receipt Required</div>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/10">
            <div className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider">Total CRM Revenue</div>
            <div className="text-2xl font-black text-emerald-400 mt-1">฿{totalRevenueAll.toLocaleString()}</div>
            <div className="text-[10px] text-emerald-300 mt-0.5">{activeOrdersCount} active orders in progress</div>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {crmToast && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 shadow-sm animate-fade-in">
          <Icon name="checkCircle" className="w-4 h-4 text-emerald-600" />
          <span>{crmToast}</span>
        </div>
      )}

      {/* Search & Filter Controls */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          
          {/* Search Box */}
          <div className="relative w-full md:w-96">
            <Icon name="search" className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, nickname, mobile, LINE ID, condo, tax ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:border-sky-500 focus:ring-1 focus:ring-sky-500 bg-slate-50/50"
            />
          </div>

          {/* Quick Filters */}
          <div className="flex items-center gap-2 flex-wrap w-full md:w-auto">
            {/* Gender Filter */}
            <select
              value={genderFilter}
              onChange={(e) => setGenderFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold bg-white text-slate-700"
            >
              <option value="ALL">All Genders</option>
              {GENDER_OPTIONS.map(g => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>

            {/* Tier Filter */}
            <select
              value={tierFilter}
              onChange={(e) => setTierFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold bg-white text-slate-700"
            >
              <option value="ALL">All Tiers</option>
              {Object.keys(CUSTOMER_TIERS).map(k => (
                <option key={k} value={k}>{CUSTOMER_TIERS[k].label}</option>
              ))}
            </select>

            {/* Special Feature Filter */}
            <select
              value={featureFilter}
              onChange={(e) => setFeatureFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold bg-white text-slate-700"
            >
              <option value="ALL">All Features</option>
              <option value="whatsapp">💬 WhatsApp Users</option>
              <option value="tax">🏢 Company Tax Receipt</option>
              <option value="active_orders">🧺 Has Active Orders</option>
              <option value="has_issues">⚠️ Has Reported Issues</option>
            </select>

            {/* View Toggle */}
            <div className="inline-flex rounded-xl border border-slate-200 bg-slate-100 p-0.5">
              <button
                onClick={() => setViewMode('table')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${viewMode === 'table' ? 'bg-white shadow text-slate-900' : 'text-slate-600 hover:text-slate-900'}`}
                title="Table view"
              >
                <Icon name="list" className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Table</span>
              </button>
              <button
                onClick={() => setViewMode('cards')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${viewMode === 'cards' ? 'bg-white shadow text-slate-900' : 'text-slate-600 hover:text-slate-900'}`}
                title="Card grid view"
              >
                <Icon name="kanban" className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Cards</span>
              </button>
            </div>

          </div>
        </div>

        {/* Results count */}
        <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-100">
          <span>Showing <strong>{filteredCustomers.length}</strong> of {customers.length} registered customers</span>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-sky-600 hover:underline font-semibold"
            >
              Clear search
            </button>
          )}
        </div>
      </div>

      {/* CUSTOMER DIRECTORY VIEW: TABLE */}
      {viewMode === 'table' && (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-xs table-auto">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-2.5 sm:px-3">Customer</th>
                  <th className="py-3 px-2.5 sm:px-3">Contact</th>
                  <th className="py-3 px-2.5 sm:px-3">Address</th>
                  <th className="py-3 px-2.5 sm:px-3">Tax / Invoice</th>
                  <th className="py-3 px-2.5 sm:px-3">Spend & Orders</th>
                  <th className="py-3 px-2.5 sm:px-3">Status</th>
                  <th className="py-3 px-2.5 sm:px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCustomers.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-10 text-center text-slate-400">
                      No customers match the current filter. Click "+ Register Customer" to add one.
                    </td>
                  </tr>
                ) : (
                  filteredCustomers.map(cust => {
                    const primaryAddr = cust.primaryAddress;
                    const tierInfo = CUSTOMER_TIERS[cust.tier] || CUSTOMER_TIERS.Regular;
                    const hasActiveOrder = (cust.activeOrders?.length || 0) > 0;
                    const hasOpenIssues = (cust.openIncidentsCount || 0) > 0;

                    return (
                      <tr key={cust.id} className="hover:bg-slate-50/70 transition">
                        
                        {/* Customer & Nickname */}
                        <td className="py-3 px-2.5 sm:px-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-100 to-indigo-100 text-sky-800 font-bold text-xs flex items-center justify-center shrink-0 border border-sky-200">
                              {cust.nickName ? cust.nickName.substring(0, 2).toUpperCase() : cust.fullName.substring(0, 2).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="font-extrabold text-slate-900 text-xs truncate max-w-[130px] sm:max-w-[160px]">{cust.fullName}</span>
                                {cust.nickName && (
                                  <span className="px-1.5 py-0.2 rounded-md bg-sky-50 text-sky-700 font-bold text-[10px] border border-sky-200 shrink-0">
                                    "{cust.nickName}"
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-0.5">
                                <span>{cust.id}</span>
                                <span>•</span>
                                <span className="capitalize">{cust.gender}</span>
                                {cust.dateOfBirth && (
                                  <>
                                    <span>•</span>
                                    <span>{calculateAge(cust.dateOfBirth)}y</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Contact & WhatsApp */}
                        <td className="py-3 px-2.5 sm:px-3">
                          <div className="space-y-0.5 min-w-0">
                            {/* Thai Mobile */}
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono font-semibold text-slate-800 text-xs">{cust.mobileNumber || 'No Thai phone'}</span>
                              {cust.isWhatsApp && (
                                <span className="px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[9px] shrink-0" title="Default Thai mobile is on WhatsApp">
                                  WA
                                </span>
                              )}
                            </div>

                            {/* Secondary International Mobile */}
                            {cust.secondaryMobile && (
                              <div className="flex items-center gap-1 text-[11px]">
                                <span className="font-mono text-indigo-700 truncate max-w-[130px]" title={`International: ${cust.secondaryMobile}`}>
                                  🌐 {cust.secondaryMobile}
                                </span>
                                {cust.isSecondaryWhatsApp && (
                                  <span className="px-1 py-0.2 rounded-full bg-teal-100 text-teal-800 font-bold text-[8px] shrink-0" title="International number is on WhatsApp">
                                    WA-Intl
                                  </span>
                                )}
                              </div>
                            )}

                            {/* LINE & Email */}
                            <div className="flex items-center gap-1.5 text-[10px] text-slate-500 truncate max-w-[160px]">
                              {cust.lineId && (
                                <span className="text-green-700 font-medium shrink-0">LINE: {cust.lineId}</span>
                              )}
                              {cust.lineId && cust.email && <span>•</span>}
                              {cust.email && (
                                <span className="text-slate-400 truncate" title={cust.email}>{cust.email}</span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Delivery Addresses */}
                        <td className="py-3 px-2.5 sm:px-3">
                          {primaryAddr ? (
                            <div className="max-w-[150px] xl:max-w-[200px]">
                              <div className="font-semibold text-slate-800 truncate flex items-center gap-1 text-xs" title={primaryAddr.label || primaryAddr.address}>
                                <Icon name="mapPin" className="w-3 h-3 text-sky-600 shrink-0" />
                                <span className="truncate">{primaryAddr.label || primaryAddr.address}</span>
                              </div>
                              <div className="text-[10px] text-slate-500 truncate" title={`${primaryAddr.roomNumber ? primaryAddr.roomNumber + ', ' : ''}${primaryAddr.district}`}>
                                {primaryAddr.roomNumber ? `${primaryAddr.roomNumber}, ` : ''}{primaryAddr.district}
                              </div>
                              {cust.addresses?.length > 1 && (
                                <div className="text-[9px] text-sky-600 font-bold">
                                  +{cust.addresses.length - 1} more
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-slate-400 italic text-[11px]">No address</span>
                          )}
                        </td>

                        {/* Company Tax ID */}
                        <td className="py-3 px-2.5 sm:px-3">
                          {cust.companyTax?.required ? (
                            <div className="space-y-0.5 max-w-[130px]">
                              <span className="inline-block px-1.5 py-0.2 rounded bg-amber-50 text-amber-900 border border-amber-200 font-bold text-[9px]">
                                Tax Invoice
                              </span>
                              <div className="font-mono text-[10px] text-slate-700 truncate">{cust.companyTax.taxId || 'Pending ID'}</div>
                              <div className="text-[10px] text-slate-500 truncate" title={cust.companyTax.companyName}>{cust.companyTax.companyName}</div>
                            </div>
                          ) : (
                            <span className="text-slate-400 text-xs">Individual</span>
                          )}
                        </td>

                        {/* Lifetime Spend & KG */}
                        <td className="py-3 px-2.5 sm:px-3 whitespace-nowrap">
                          <div className="font-black text-slate-900 text-xs">
                            ฿{(cust.totalSpend || 0).toLocaleString()} THB
                          </div>
                          <div className="text-[10px] text-slate-500 mt-0.5">
                            {cust.totalOrders || 0} ord • {cust.totalKg || 0} kg
                          </div>
                        </td>

                        {/* Live Status */}
                        <td className="py-3 px-2.5 sm:px-3">
                          <div className="space-y-1">
                            <span className={`inline-block px-2 py-0.2 rounded-full text-[9px] font-bold border ${tierInfo.color}`}>
                              {cust.tier || 'Regular'}
                            </span>
                            
                            {hasActiveOrder && (
                              <div className="flex items-center gap-1 text-[9px] font-bold text-sky-700 bg-sky-50 px-1.5 py-0.2 rounded border border-sky-200 whitespace-nowrap">
                                <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse shrink-0" />
                                <span>{cust.activeOrders.length} In-Prog</span>
                              </div>
                            )}

                            {hasOpenIssues && (
                              <div className="flex items-center gap-1 text-[9px] font-bold text-amber-800 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200 whitespace-nowrap">
                                <Icon name="alertTriangle" className="w-2.5 h-2.5 text-amber-600 shrink-0" />
                                <span>{cust.openIncidentsCount} Ticket</span>
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-2.5 sm:px-3 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* WhatsApp Button - Routes to WhatsApp-verified mobile (Intl or Thai) */}
                            {(() => {
                              const waPhone = (cust.isSecondaryWhatsApp && cust.secondaryMobile)
                                ? cust.secondaryMobile
                                : (cust.isWhatsApp && cust.mobileNumber ? cust.mobileNumber : (cust.secondaryMobile || cust.mobileNumber));
                              const cleanPhone = waPhone ? waPhone.replace(/[^0-9]/g, '') : '';
                              const isIntl = cust.isSecondaryWhatsApp && cust.secondaryMobile;

                              if (cleanPhone) {
                                return (
                                  <a
                                    href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(`Hello K. ${cust.nickName || cust.fullName}, this is NoName Laundry Bangkok.`)}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl flex items-center justify-center text-emerald-600 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition shrink-0"
                                    title={isIntl ? `Chat on WhatsApp (International: ${cust.secondaryMobile})` : `Chat on WhatsApp (${cust.mobileNumber})`}
                                  >
                                    <Icon name="whatsapp" className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                  </a>
                                );
                              }
                              return (
                                <div
                                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl flex items-center justify-center text-slate-300 bg-slate-50 border border-slate-200 shrink-0 cursor-not-allowed"
                                  title="No mobile number registered"
                                >
                                  <Icon name="whatsapp" className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                </div>
                              );
                            })()}

                            {/* LINE Button - Always present and identically sized */}
                            <a
                              href={getLineOaMessageUrl(`Order inquiry for K. ${cust.nickName || cust.fullName}${cust.lineId ? ` (LINE: ${cust.lineId})` : ''}`)}
                              target="_blank"
                              rel="noreferrer"
                              className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl flex items-center justify-center text-green-700 bg-green-50 hover:bg-green-100 border border-green-200 transition shrink-0"
                              title={cust.lineId ? `Open LINE OA Chat (${cust.lineId})` : "Open LINE OA Chat"}
                            >
                              <Icon name="line" className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            </a>

                            {/* View Profile Button */}
                            <button
                              onClick={() => {
                                setSelectedCustomer(cust);
                                setActiveCustomerTab('profile');
                              }}
                              className="px-2.5 py-1.5 rounded-lg sm:rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-sm transition whitespace-nowrap"
                            >
                              View Profile
                            </button>
                          </div>
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

      {/* CUSTOMER DIRECTORY VIEW: CARDS */}
      {viewMode === 'cards' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCustomers.map(cust => {
            const primaryAddr = cust.primaryAddress;
            const tierInfo = CUSTOMER_TIERS[cust.tier] || CUSTOMER_TIERS.Regular;
            return (
              <div
                key={cust.id}
                className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-11 h-11 rounded-2xl bg-sky-100 text-sky-800 font-black text-sm flex items-center justify-center border border-sky-200">
                        {cust.nickName ? cust.nickName.substring(0, 2).toUpperCase() : cust.fullName.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-extrabold text-slate-900 text-sm">{cust.fullName}</h4>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          {cust.nickName && (
                            <span className="px-1.5 py-0.2 rounded bg-sky-50 text-sky-700 font-bold text-[10px] border border-sky-200">
                              "{cust.nickName}"
                            </span>
                          )}
                          <span className={`px-2 py-0.2 rounded-full text-[9px] font-bold border ${tierInfo.color}`}>
                            {cust.tier}
                          </span>
                        </div>
                      </div>
                    </div>

                    <span className="font-mono text-[10px] text-slate-400">{cust.id}</span>
                  </div>

                  {/* Contact Info */}
                  <div className="mt-3 p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-medium">Mobile:</span>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-slate-800">{cust.mobileNumber}</span>
                        {cust.isWhatsApp && (
                          <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[9px]">
                            WhatsApp
                          </span>
                        )}
                      </div>
                    </div>

                    {cust.lineId && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 font-medium">LINE:</span>
                        <span className="font-bold text-green-700">{cust.lineId}</span>
                      </div>
                    )}

                    {primaryAddr && (
                      <div className="flex items-start justify-between gap-2 pt-1 border-t border-slate-200/60 text-[11px]">
                        <span className="text-slate-500">Primary:</span>
                        <span className="font-semibold text-slate-800 text-right truncate">
                          {primaryAddr.label} ({primaryAddr.roomNumber || primaryAddr.district})
                        </span>
                      </div>
                    )}

                    {cust.companyTax?.required && (
                      <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 text-[10px]">
                        <span className="text-amber-700 font-bold">Tax ID:</span>
                        <span className="font-mono font-bold text-slate-800">{cust.companyTax.taxId}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Footer: Metrics & Action */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-black text-slate-900">฿{(cust.totalSpend || 0).toLocaleString()} THB</div>
                    <div className="text-[10px] text-slate-500">{cust.totalOrders || 0} orders • {cust.totalKg || 0} KG</div>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedCustomer(cust);
                      setActiveCustomerTab('profile');
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition shadow-sm"
                  >
                    View Details
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* COMPREHENSIVE CUSTOMER DETAIL DRAWER / MODAL */}
      {/* ========================================================================= */}
      {selectedCustomer && (
        <div 
          className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setSelectedCustomer(null)}
        >
          <div 
            className="bg-white rounded-3xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 max-h-[92vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            
            {/* Top Modal Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-600 via-sky-500 to-teal-400 text-white font-black text-lg flex items-center justify-center shadow-md">
                  {selectedCustomer.nickName ? selectedCustomer.nickName.substring(0, 2).toUpperCase() : selectedCustomer.fullName.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-xl font-black text-slate-900 tracking-tight">
                      {selectedCustomer.fullName}
                    </h3>
                    {selectedCustomer.nickName && (
                      <span className="px-2 py-0.5 rounded-lg bg-sky-50 text-sky-700 font-bold text-xs border border-sky-200">
                        Nickname: "{selectedCustomer.nickName}"
                      </span>
                    )}
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-200">
                      {selectedCustomer.tier || 'Regular'}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-600">{selectedCustomer.id}</span>
                    <span>•</span>
                    <span>Gender: <strong>{selectedCustomer.gender}</strong></span>
                    {selectedCustomer.dateOfBirth && (
                      <>
                        <span>•</span>
                        <span>DOB: <strong>{selectedCustomer.dateOfBirth}</strong> ({calculateAge(selectedCustomer.dateOfBirth)} years old)</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons & Close */}
              <div className="flex items-center gap-2 self-end sm:self-auto flex-wrap">
                {/* Primary Thai WhatsApp */}
                {selectedCustomer.isWhatsApp && selectedCustomer.mobileNumber && (
                  <a
                    href={`https://wa.me/${selectedCustomer.mobileNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hello K. ${selectedCustomer.nickName || selectedCustomer.fullName}, this is NoName Laundry Bangkok.`)}`}
                    target="_blank"
                    rel="noreferrer"
                    title={`Open WhatsApp to Thai Mobile (${selectedCustomer.mobileNumber})`}
                    className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs border border-emerald-300 flex items-center gap-1.5 transition shadow-sm"
                  >
                    <Icon name="whatsapp" className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{selectedCustomer.isSecondaryWhatsApp && selectedCustomer.secondaryMobile ? 'WA (Thai)' : 'WhatsApp'}</span>
                  </a>
                )}

                {/* Secondary International WhatsApp */}
                {selectedCustomer.isSecondaryWhatsApp && selectedCustomer.secondaryMobile && (
                  <a
                    href={`https://wa.me/${selectedCustomer.secondaryMobile.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hello K. ${selectedCustomer.nickName || selectedCustomer.fullName}, this is NoName Laundry Bangkok.`)}`}
                    target="_blank"
                    rel="noreferrer"
                    title={`Open WhatsApp to International Number (${selectedCustomer.secondaryMobile})`}
                    className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs border border-emerald-300 flex items-center gap-1.5 transition shadow-sm"
                  >
                    <Icon name="whatsapp" className="w-3.5 h-3.5 text-emerald-600" />
                    <span>WA (Intl)</span>
                  </a>
                )}

                {selectedCustomer.lineId && (
                  <a
                    href={getLineOaMessageUrl(`Order update for K. ${selectedCustomer.nickName || selectedCustomer.fullName}`)}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-xl bg-green-50 hover:bg-green-100 text-green-800 font-bold text-xs border border-green-300 flex items-center gap-1.5 transition shadow-sm"
                  >
                    <Icon name="line" className="w-3.5 h-3.5 text-green-600" />
                    <span>LINE</span>
                  </a>
                )}

                <button
                  onClick={() => setSelectedCustomer(null)}
                  className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition ml-1 flex items-center gap-1.5"
                  title="Close Profile (Esc)"
                >
                  <span className="hidden sm:inline text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 border border-slate-200">ESC</span>
                  <Icon name="x" className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Navigation Sub-Tabs */}
            <div className="flex border-b border-slate-200 space-x-2">
              {[
                { id: 'profile', label: 'Profile, Addresses & Tax', icon: 'user' },
                { id: 'transactions', label: `Transactions & Orders (${selectedCustomer.orders?.length || 0})`, icon: 'receipt' },
                { id: 'issues', label: `Reported Issues & Tickets (${selectedCustomer.incidents?.length || 0})`, icon: 'alertCircle' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveCustomerTab(tab.id)}
                  className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition flex items-center gap-2 border-b-2 ${
                    activeCustomerTab === tab.id
                      ? 'border-sky-600 text-sky-600 bg-sky-50/50'
                      : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Icon name={tab.icon} className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* TAB 1: PROFILE, MULTIPLE ADDRESSES & COMPANY TAX */}
            {activeCustomerTab === 'profile' && (
              <div className="space-y-6 text-xs">
                
                {/* 1. Basic & Contact Grid */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3.5">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <h4 className="font-extrabold text-slate-900 uppercase tracking-wide text-xs flex items-center gap-2">
                      <Icon name="user" className="w-4 h-4 text-sky-600" />
                      <span>Customer Identity & Contact Information</span>
                    </h4>

                    <button
                      onClick={() => handleOpenEditPhones(selectedCustomer)}
                      className="px-3 py-1 rounded-xl bg-white hover:bg-sky-50 text-sky-700 hover:text-sky-900 font-bold text-xs border border-slate-300 shadow-sm flex items-center gap-1.5 transition"
                    >
                      <span>✏️</span>
                      <span>Edit Phone Numbers & WhatsApp</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                    <div>
                      <span className="text-slate-400 font-semibold block">Full Legal Name:</span>
                      <span className="font-bold text-slate-900 text-sm">{selectedCustomer.fullName}</span>
                    </div>

                    <div>
                      <span className="text-slate-400 font-semibold block">Preferred Nickname:</span>
                      <span className="font-bold text-sky-700 text-sm">{selectedCustomer.nickName || 'Not specified'}</span>
                    </div>

                    <div>
                      <span className="text-slate-400 font-semibold block">Gender:</span>
                      <span className="font-bold text-slate-800 text-sm">{selectedCustomer.gender}</span>
                    </div>

                    <div>
                      <span className="text-slate-400 font-semibold block">Email Address:</span>
                      <span className="font-semibold text-slate-800">{selectedCustomer.email || 'None'}</span>
                    </div>

                    <div>
                      <span className="text-slate-400 font-semibold block">LINE OA / ID:</span>
                      <span className="font-bold text-green-700 font-mono">{selectedCustomer.lineId || 'None'}</span>
                    </div>

                    <div>
                      <span className="text-slate-400 font-semibold block">Tier & Profile ID:</span>
                      <span className="font-mono font-bold text-slate-700">{selectedCustomer.tier || 'Regular'} • {selectedCustomer.id}</span>
                    </div>
                  </div>

                  {/* Dual Phone Numbers & WhatsApp Verification Panel */}
                  <div className="pt-2 border-t border-slate-200">
                    <span className="text-[11px] font-extrabold text-slate-600 uppercase tracking-wider block mb-2">
                      Dual Mobile Numbers & WhatsApp Connectivity
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Thai Primary Mobile */}
                      <div className="p-3 bg-white rounded-xl border border-slate-200 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
                              <span>🇹🇭</span>
                              <span>Primary Thai Mobile</span>
                            </span>
                            {selectedCustomer.isWhatsApp ? (
                              <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-black flex items-center gap-1">
                                <Icon name="whatsapp" className="w-3 h-3 text-emerald-600" />
                                <span>WhatsApp OK</span>
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-500 text-[10px] font-bold">
                                SMS Only
                              </span>
                            )}
                          </div>
                          <div className="font-mono font-black text-slate-900 text-sm mt-1">
                            {selectedCustomer.mobileNumber || 'Not set'}
                          </div>
                        </div>

                        {selectedCustomer.mobileNumber && (
                          <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                            <a
                              href={`https://wa.me/${selectedCustomer.mobileNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hello K. ${selectedCustomer.nickName || selectedCustomer.fullName}, this is NoName Laundry Bangkok.`)}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-emerald-700 hover:text-emerald-900 font-bold flex items-center gap-1 transition"
                            >
                              <Icon name="whatsapp" className="w-3.5 h-3.5 text-emerald-600" />
                              <span>{selectedCustomer.isWhatsApp ? 'Open WhatsApp Chat' : 'Check on WhatsApp'} ↗</span>
                            </a>
                            <span className="text-slate-400 text-[10px]">Default Local</span>
                          </div>
                        )}
                      </div>

                      {/* International Secondary Mobile */}
                      <div className="p-3 bg-white rounded-xl border border-slate-200 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
                              <span>🌐</span>
                              <span>International Mobile (Country Code)</span>
                            </span>
                            {selectedCustomer.secondaryMobile ? (
                              selectedCustomer.isSecondaryWhatsApp ? (
                                <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-black flex items-center gap-1">
                                  <Icon name="whatsapp" className="w-3 h-3 text-emerald-600" />
                                  <span>WhatsApp OK</span>
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-500 text-[10px] font-bold">
                                  SMS / Voice
                                </span>
                              )
                            ) : (
                              <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-700 text-[10px] font-bold">
                                None Registered
                              </span>
                            )}
                          </div>
                          <div className="font-mono font-black text-slate-900 text-sm mt-1">
                            {selectedCustomer.secondaryMobile || (
                              <span className="text-slate-400 font-sans font-normal text-xs italic">No international number on file</span>
                            )}
                          </div>
                        </div>

                        <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                          {selectedCustomer.secondaryMobile ? (
                            <a
                              href={`https://wa.me/${selectedCustomer.secondaryMobile.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hello K. ${selectedCustomer.nickName || selectedCustomer.fullName}, this is NoName Laundry Bangkok.`)}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-emerald-700 hover:text-emerald-900 font-bold flex items-center gap-1 transition"
                            >
                              <Icon name="whatsapp" className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Check / Test on WhatsApp ↗</span>
                            </a>
                          ) : (
                            <button
                              onClick={() => handleOpenEditPhones(selectedCustomer)}
                              className="text-sky-600 hover:text-sky-800 font-bold text-[11px] underline"
                            >
                              + Register Intl WhatsApp Number
                            </button>
                          )}
                          <span className="text-slate-400 text-[10px]">Roaming/Expats</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Security, OTP Verification & 6-Digit PIN */}
                <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-extrabold text-slate-900 uppercase tracking-wide text-xs flex items-center gap-2">
                      <Icon name="shieldCheck" className="w-4 h-4 text-emerald-600" />
                      <span>Security, OTP Verification & 6-Digit PIN</span>
                    </h4>

                    <button
                      onClick={() => handleOpenOtpSimulator(selectedCustomer)}
                      className="px-3 py-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-800 font-bold text-xs border border-sky-200 flex items-center gap-1.5"
                    >
                      <Icon name="smartphone" className="w-3.5 h-3.5 text-sky-600" />
                      <span>Simulate OTP Verification</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                      <div>
                        <span className="text-slate-500 font-medium block">Verification Status:</span>
                        {selectedCustomer.isVerified ? (
                          <span className="font-bold text-emerald-700 flex items-center gap-1 mt-0.5">
                            <Icon name="checkCircle" className="w-4 h-4 text-emerald-600" />
                            <span>Verified via {selectedCustomer.verifiedVia?.toUpperCase() || 'WHATSAPP'}</span>
                          </span>
                        ) : (
                          <span className="font-bold text-amber-700 flex items-center gap-1 mt-0.5">
                            <Icon name="alertTriangle" className="w-4 h-4 text-amber-600" />
                            <span>Unverified Account</span>
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                      <div>
                        <span className="text-slate-500 font-medium block">6-Digit Quick PIN Access:</span>
                        <span className="font-mono font-bold text-slate-900 text-sm mt-0.5 block">
                          {selectedCustomer.pinCode ? `•••••• (${selectedCustomer.pinCode})` : 'No PIN configured'}
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          setNewPinCodeInput(selectedCustomer.pinCode || '');
                          setShowPinModal(true);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs"
                      >
                        Change PIN
                      </button>
                    </div>
                  </div>
                </div>

                {/* 3. MULTIPLE DELIVERY ADDRESSES (Powered by Google Maps) */}
                <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-extrabold text-slate-900 uppercase tracking-wide text-xs flex items-center gap-2">
                        <Icon name="mapPin" className="w-4 h-4 text-sky-600" />
                        <span>Saved Delivery Locations ({selectedCustomer.addresses?.length || 0})</span>
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Customers can save multiple Bangkok condo/office locations with Google Maps navigation links.
                      </p>
                    </div>

                    <button
                      onClick={() => setShowAddAddressForm(!showAddAddressForm)}
                      className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 transition"
                    >
                      <Icon name="plus" className="w-3.5 h-3.5" />
                      <span>+ Add New Address</span>
                    </button>
                  </div>

                  {/* Inline Add Address Form */}
                  {showAddAddressForm && (
                    <form onSubmit={handleAddInlineAddress} className="p-4 rounded-2xl bg-sky-50/70 border border-sky-200 space-y-3 mt-2">
                      <div className="font-bold text-sky-900 text-xs flex items-center justify-between">
                        <span>Add New Delivery Location</span>
                        <button type="button" onClick={() => setShowAddAddressForm(false)} className="text-slate-400 hover:text-slate-700">✕</button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">Address Label *</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Home Condo, Office, Studio"
                            value={inlineAddrLabel}
                            onChange={(e) => setInlineAddrLabel(e.target.value)}
                            className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-slate-700 mb-1">Bangkok District *</label>
                          <select
                            value={inlineAddrDistrict}
                            onChange={(e) => setInlineAddrDistrict(e.target.value)}
                            className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white"
                          >
                            {BANGKOK_DISTRICTS.map(d => (
                              <option key={d} value={d}>{d}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="sm:col-span-2">
                          <label className="block font-bold text-slate-700 mb-1">Building / Condo / Street Address (Google Maps query) *</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Ashton Silom, 162 Silom Rd"
                            value={inlineAddrText}
                            onChange={(e) => setInlineAddrText(e.target.value)}
                            className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-slate-700 mb-1">Room / Unit No</label>
                          <input
                            type="text"
                            placeholder="e.g. Room 2209, Tower B"
                            value={inlineAddrRoom}
                            onChange={(e) => setInlineAddrRoom(e.target.value)}
                            className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white"
                          />
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                        <div className="flex items-center gap-4">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={inlineAddrJuristic}
                              onChange={(e) => setInlineAddrJuristic(e.target.checked)}
                              className="w-4 h-4 text-sky-600 rounded"
                            />
                            <span className="font-semibold text-slate-700">Allow Juristic Office drop-off</span>
                          </label>

                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={inlineAddrPrimary}
                              onChange={(e) => setInlineAddrPrimary(e.target.checked)}
                              className="w-4 h-4 text-sky-600 rounded"
                            />
                            <span className="font-semibold text-slate-700">Set as Primary Address</span>
                          </label>
                        </div>

                        <button
                          type="submit"
                          className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold"
                        >
                          Save Address to Profile
                        </button>
                      </div>
                    </form>
                  )}

                  {/* List of Addresses */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    {(selectedCustomer.addresses || []).map((addr, idx) => (
                      <div
                        key={addr.id || idx}
                        className={`p-3.5 rounded-2xl border transition ${
                          addr.isPrimary
                            ? 'bg-sky-50/60 border-sky-300 ring-1 ring-sky-300'
                            : 'bg-slate-50 border-slate-200'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 text-xs">{addr.label}</span>
                            {addr.isPrimary && (
                              <span className="px-2 py-0.2 rounded-full bg-sky-600 text-white font-bold text-[9px]">
                                Primary
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-1">
                            {!addr.isPrimary && (
                              <button
                                type="button"
                                onClick={() => handleSetPrimaryAddress(addr.id)}
                                className="text-[10px] text-sky-600 hover:underline font-bold"
                              >
                                Set Primary
                              </button>
                            )}
                            {selectedCustomer.addresses.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleDeleteAddress(addr.id)}
                                className="text-slate-400 hover:text-red-600 p-1"
                                title="Delete address"
                              >
                                <Icon name="trash" className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>

                        <div className="mt-2 text-slate-700 text-xs font-medium">
                          {addr.address}
                        </div>

                        <div className="mt-1 text-slate-500 text-[11px] flex items-center gap-2">
                          <span>Room: <strong>{addr.roomNumber || 'Not specified'}</strong></span>
                          <span>•</span>
                          <span>{addr.district}</span>
                        </div>

                        <div className="mt-2 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                          <span className={addr.leaveWithJuristic ? 'text-emerald-700 font-semibold' : 'text-slate-500'}>
                            {addr.leaveWithJuristic ? '✓ Juristic Drop-Off Allowed' : 'Direct Handover Only'}
                          </span>

                          <a
                            href={addr.googleMapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addr.address + ' ' + addr.district)}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-sky-600 hover:text-sky-800 font-bold"
                          >
                            <Icon name="navigation" className="w-3 h-3 text-sky-600" />
                            <span>Google Maps</span>
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 4. COMPANY TAX RECEIPT / INVOICE INFO */}
                <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-3">
                  <h4 className="font-extrabold text-slate-900 uppercase tracking-wide text-xs flex items-center gap-2">
                    <Icon name="building2" className="w-4 h-4 text-amber-600" />
                    <span>Company Tax Invoice & Receipt Details (ใบกำกับภาษีเต็มรูปแบบ)</span>
                  </h4>

                  {selectedCustomer.companyTax?.required ? (
                    <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-amber-900 text-sm">
                          {selectedCustomer.companyTax.companyName || 'Unnamed Company'}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-amber-200 text-amber-900 font-bold text-[10px]">
                          Tax Invoice Required
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1 text-slate-800">
                        <div>
                          <span className="text-slate-500 font-medium">13-digit Tax ID:</span>
                          <span className="font-mono font-bold ml-1.5 text-slate-900">{selectedCustomer.companyTax.taxId}</span>
                        </div>

                        <div>
                          <span className="text-slate-500 font-medium">Branch:</span>
                          <span className="font-semibold ml-1.5">{selectedCustomer.companyTax.branch || 'Head Office'}</span>
                        </div>

                        <div className="sm:col-span-2">
                          <span className="text-slate-500 font-medium block">Registered Billing Address:</span>
                          <span className="font-medium text-slate-900">{selectedCustomer.companyTax.companyAddress || 'Same as primary condo'}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 rounded-xl bg-slate-50 text-slate-500 flex items-center justify-between">
                      <span>Customer has not requested company tax receipts. Standard digital payment receipt issued.</span>
                    </div>
                  )}
                </div>

                {/* 5. Internal Staff Notes */}
                <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-3">
                  <h4 className="font-extrabold text-slate-900 uppercase tracking-wide text-xs flex items-center gap-2">
                    <Icon name="edit" className="w-4 h-4 text-slate-600" />
                    <span>Internal Staff Notes & Special Instructions</span>
                  </h4>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 whitespace-pre-line font-medium leading-relaxed">
                    {selectedCustomer.notes || 'No internal notes on file.'}
                  </div>

                  <form onSubmit={handleAddStaffNote} className="flex gap-2 pt-1">
                    <input
                      type="text"
                      placeholder="Add a new internal staff note..."
                      value={newStaffNoteText}
                      onChange={(e) => setNewStaffNoteText(e.target.value)}
                      className="flex-1 px-3 py-1.5 rounded-xl border border-slate-300 text-xs bg-white"
                    />
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold"
                    >
                      Add Note
                    </button>
                  </form>
                </div>

              </div>
            )}

            {/* TAB 2: TRANSACTIONS & ORDERS (Current & Past) */}
            {activeCustomerTab === 'transactions' && (
              <div className="space-y-6 text-xs">
                
                {/* Summary bar */}
                <div className="grid grid-cols-3 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <div>
                    <span className="text-slate-500 font-medium">Total Orders:</span>
                    <div className="text-xl font-black text-slate-900 mt-0.5">{selectedCustomer.orders?.length || 0}</div>
                  </div>

                  <div>
                    <span className="text-slate-500 font-medium">Total Weight Processed:</span>
                    <div className="text-xl font-black text-sky-600 mt-0.5">{selectedCustomer.totalKg || 0} KG</div>
                  </div>

                  <div>
                    <span className="text-slate-500 font-medium">Total Paid Revenue:</span>
                    <div className="text-xl font-black text-emerald-600 mt-0.5">฿{(selectedCustomer.totalSpend || 0).toLocaleString()} THB</div>
                  </div>
                </div>

                {/* Active Orders Section */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-extrabold text-slate-900 uppercase tracking-wide text-xs flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-sky-500 animate-pulse" />
                      <span>Active Current Orders ({selectedCustomer.activeOrders?.length || 0})</span>
                    </h4>
                  </div>

                  {(!selectedCustomer.activeOrders || selectedCustomer.activeOrders.length === 0) ? (
                    <div className="p-4 rounded-2xl bg-slate-50 text-slate-400 text-center">
                      No active orders in progress for this customer.
                    </div>
                  ) : (
                    selectedCustomer.activeOrders.map(order => (
                      <div key={order.id} className="p-4 rounded-2xl border-2 border-sky-300 bg-sky-50/40 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-sky-700">{order.id}</span>
                            <span className="font-bold text-slate-900">• {order.serviceName}</span>
                          </div>
                          <span className="px-2.5 py-0.5 rounded-full bg-sky-600 text-white font-bold text-[10px]">
                            {order.status.replace(/_/g, ' ')}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] pt-1 text-slate-700">
                          <div>Est Weight: <strong>{order.estimatedWeightKg} KG</strong></div>
                          <div>Actual Scale: <strong>{order.actualWeightKg !== null ? `${order.actualWeightKg} KG` : 'Pending weigh-in'}</strong></div>
                          <div>Amount: <strong>฿{order.totalPrice} THB</strong></div>
                          <div>Tag: <span className="font-mono font-bold text-sky-800">{order.tagNumber || 'PENDING'}</span></div>
                        </div>

                        <div className="text-[11px] text-slate-500 pt-1 border-t border-sky-200/60 flex items-center justify-between">
                          <span>Pickup: {order.pickupDate} ({order.pickupTime})</span>
                          <span>Condo: {order.condoName || order.district}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Past Orders Section */}
                <div className="space-y-3 pt-2">
                  <h4 className="font-extrabold text-slate-900 uppercase tracking-wide text-xs flex items-center gap-2">
                    <Icon name="history" className="w-4 h-4 text-slate-500" />
                    <span>Past Delivered Order History ({selectedCustomer.pastOrders?.length || 0})</span>
                  </h4>

                  {(!selectedCustomer.pastOrders || selectedCustomer.pastOrders.length === 0) ? (
                    <div className="p-4 rounded-2xl bg-slate-50 text-slate-400 text-center">
                      No completed past orders recorded yet.
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden">
                      {selectedCustomer.pastOrders.map(order => (
                        <div key={order.id} className="p-3.5 bg-white hover:bg-slate-50 transition flex items-center justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-slate-900">{order.id}</span>
                              <span className="text-slate-600 font-semibold">• {order.serviceName}</span>
                              <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                {order.status}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-500 mt-0.5">
                              Delivered on: {order.deliveryDate || order.pickupDate} • Billed: {order.actualWeightKg || order.estimatedWeightKg} KG
                            </div>
                          </div>

                          <div className="text-right">
                            <div className="font-black text-slate-900 text-sm">฿{order.totalPrice} THB</div>
                            <span className="text-[10px] text-slate-400">Cashless Paid</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* TAB 3: PAST ISSUES & INCIDENTS HISTORY */}
            {activeCustomerTab === 'issues' && (
              <div className="space-y-4 text-xs">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-extrabold text-slate-900 uppercase tracking-wide text-xs flex items-center gap-2">
                      <Icon name="alertCircle" className="w-4 h-4 text-amber-600" />
                      <span>Reported Incident & Special Request History ({selectedCustomer.incidents?.length || 0})</span>
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      All online support tickets, special garment requests, and complaints filed by this customer.
                    </p>
                  </div>

                  <button
                    onClick={() => setShowLogIssueModal(true)}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm"
                  >
                    <Icon name="plus" className="w-3.5 h-3.5" />
                    <span>+ Log New Issue / Ticket</span>
                  </button>
                </div>

                {/* Issue List */}
                {(!selectedCustomer.incidents || selectedCustomer.incidents.length === 0) ? (
                  <div className="p-8 rounded-2xl bg-slate-50 text-slate-400 text-center">
                    No issues, complaints, or garment requests recorded for this customer.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedCustomer.incidents.map(inc => (
                      <div
                        key={inc.id}
                        className={`p-4 rounded-2xl border transition space-y-2 ${
                          inc.status === 'pending'
                            ? 'bg-amber-50/60 border-amber-300'
                            : 'bg-white border-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-slate-900">{inc.id}</span>
                            <span className="font-bold text-slate-800">{inc.subject}</span>
                          </div>

                          <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                            inc.status === 'pending'
                              ? 'bg-amber-100 text-amber-900 border border-amber-300'
                              : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                          }`}>
                            {inc.status.toUpperCase()}
                          </span>
                        </div>

                        <div className="p-3 bg-slate-50/90 rounded-xl text-slate-700 leading-relaxed">
                          <span className="font-bold text-slate-500 block text-[10px] uppercase">Customer Message:</span>
                          "{inc.message}"
                        </div>

                        {inc.response ? (
                          <div className="p-3 bg-emerald-50/90 border border-emerald-200 rounded-xl text-emerald-900 leading-relaxed">
                            <span className="font-bold text-emerald-700 block text-[10px] uppercase">Staff Online Response:</span>
                            "{inc.response}"
                          </div>
                        ) : (
                          <div className="text-[11px] text-amber-700 italic">
                            Awaiting staff response via {inc.channel?.toUpperCase() || 'ONLINE CHAT'}.
                          </div>
                        )}

                        <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-100 flex items-center justify-between">
                          <span>Channel: <strong>{(inc.channel || 'chat').toUpperCase()}</strong> • {inc.contact}</span>
                          <span>Logged: {inc.createdAt ? inc.createdAt.substring(0, 16) : 'Recently'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* REGISTER NEW CUSTOMER MODAL */}
      {/* ========================================================================= */}
      {showAddModal && (
        <div 
          className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setShowAddModal(false)}
        >
          <div 
            className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-5 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-black text-slate-900">Register New Customer</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Save customer profile, multiple Google Maps addresses, WhatsApp status, and company tax invoice details.
                </p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 flex items-center gap-1"
                title="Close (Esc)"
              >
                <span className="hidden sm:inline text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 border border-slate-200">ESC</span>
                <Icon name="x" className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomerSubmit} className="space-y-4 text-xs">
              
              {/* Personal Details */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">Full Name (ชื่อ-นามสกุล) *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Alex Thorne / ศิริพร ธนากา"
                    value={newFullName}
                    onChange={(e) => setNewFullName(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nickname (ชื่อเล่น)</label>
                  <input
                    type="text"
                    placeholder="e.g. Alex / ส้ม"
                    value={newNickName}
                    onChange={(e) => setNewNickName(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Gender</label>
                  <select
                    value={newGender}
                    onChange={(e) => setNewGender(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                  >
                    {GENDER_OPTIONS.map(g => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Date of Birth (DOB)</label>
                  <input
                    type="date"
                    value={newDob}
                    onChange={(e) => setNewDob(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Customer Tier</label>
                  <select
                    value={newTier}
                    onChange={(e) => setNewTier(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-bold"
                  >
                    {Object.keys(CUSTOMER_TIERS).map(k => (
                      <option key={k} value={k}>{CUSTOMER_TIERS[k].label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Contact Information */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="font-bold text-slate-800 uppercase tracking-wide text-xs">
                  Contact Channels & Dual Phone Numbers
                </div>

                {/* Dual Phone Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 p-3 bg-white rounded-xl border border-slate-200">
                  {/* Thai Default Mobile */}
                  <div>
                    <label className="block font-bold text-slate-700 mb-1 flex items-center justify-between">
                      <span>🇹🇭 Default Thai Mobile *</span>
                      <span className="text-[10px] text-slate-400 font-normal">Local +66</span>
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+66 8X XXX XXXX"
                      value={newMobile}
                      onChange={(e) => setNewMobile(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 font-mono font-bold bg-white"
                    />
                    <label className="flex items-center gap-2 cursor-pointer mt-1.5">
                      <input
                        type="checkbox"
                        checked={newIsWhatsApp}
                        onChange={(e) => setNewIsWhatsApp(e.target.checked)}
                        className="w-4 h-4 text-emerald-600 rounded"
                      />
                      <span className="font-bold text-emerald-800 text-[11px]">Thai number has WhatsApp</span>
                    </label>
                  </div>

                  {/* International Mobile */}
                  <div>
                    <label className="block font-bold text-slate-700 mb-1 flex items-center justify-between">
                      <span>🌐 International Mobile (Optional)</span>
                      <span className="text-[10px] text-slate-400 font-normal">With Country Code</span>
                    </label>
                    <input
                      type="tel"
                      placeholder="e.g. +1 (415) 890-1234 or +44 ..."
                      value={newSecondaryMobile}
                      onChange={(e) => setNewSecondaryMobile(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 font-mono font-bold bg-white"
                    />
                    
                    {/* Quick Country Code Pills */}
                    <div className="flex items-center gap-1 mt-1.5 flex-wrap">
                      <span className="text-[10px] text-slate-400 font-medium">Quick Prefix:</span>
                      {[
                        { code: '+1 ', label: '🇺🇸 +1' },
                        { code: '+44 ', label: '🇬🇧 +44' },
                        { code: '+65 ', label: '🇸🇬 +65' },
                        { code: '+81 ', label: '🇯🇵 +81' },
                        { code: '+61 ', label: '🇦🇺 +61' },
                        { code: '+33 ', label: '🇫🇷 +33' },
                        { code: '+49 ', label: '🇩🇪 +49' }
                      ].map(country => (
                        <button
                          key={country.code}
                          type="button"
                          onClick={() => setNewSecondaryMobile(country.code)}
                          className="px-1.5 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 text-[10px] font-mono transition"
                        >
                          {country.label}
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center justify-between gap-2 mt-2 flex-wrap">
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={newIsSecondaryWhatsApp}
                          onChange={(e) => setNewIsSecondaryWhatsApp(e.target.checked)}
                          className="w-4 h-4 text-emerald-600 rounded"
                        />
                        <span className="font-bold text-emerald-800 text-[11px]">Intl number has WhatsApp</span>
                      </label>

                      {newSecondaryMobile.replace(/[^0-9]/g, '').length >= 6 && (
                        <a
                          href={`https://wa.me/${newSecondaryMobile.replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-emerald-700 hover:text-emerald-900 font-bold text-[11px] underline flex items-center gap-1"
                        >
                          <span>📱 Check WhatsApp</span>
                          <span>↗</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {/* Other contact channels */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">LINE ID</label>
                    <input
                      type="text"
                      placeholder="e.g. @nonamelaundry or line_id"
                      value={newLineId}
                      onChange={(e) => setNewLineId(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Email Address</label>
                    <input
                      type="email"
                      placeholder="customer@email.com"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Initial 6-Digit PIN (Quick Access)</label>
                    <input
                      type="text"
                      maxLength={6}
                      placeholder="123456"
                      value={newPin}
                      onChange={(e) => setNewPin(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 font-mono font-bold bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Initial Delivery Address */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="font-bold text-slate-800 uppercase tracking-wide text-xs">
                  Initial Bangkok Delivery Location (Google Maps Address)
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Address Label</label>
                    <input
                      type="text"
                      placeholder="e.g. Home Condo"
                      value={newAddrLabel}
                      onChange={(e) => setNewAddrLabel(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-bold text-slate-700 mb-1">Condo / Building / Street Address *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. The Estelle Phrom Phong, 8 Sukhumvit 26"
                      value={newAddrText}
                      onChange={(e) => setNewAddrText(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Room / Unit No</label>
                    <input
                      type="text"
                      placeholder="e.g. Tower A, Room 1804"
                      value={newAddrRoom}
                      onChange={(e) => setNewAddrRoom(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-bold text-slate-700 mb-1">Bangkok District</label>
                    <select
                      value={newAddrDistrict}
                      onChange={(e) => setNewAddrDistrict(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                    >
                      {BANGKOK_DISTRICTS.map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <label className="flex items-center gap-2 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={newAddrJuristic}
                    onChange={(e) => setNewAddrJuristic(e.target.checked)}
                    className="w-4 h-4 text-sky-600 rounded"
                  />
                  <span className="font-semibold text-slate-700">Allow Juristic Office / Reception desk drop-off</span>
                </label>
              </div>

              {/* Company Tax Invoice Option */}
              <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-3">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-amber-900 text-xs">
                  <input
                    type="checkbox"
                    checked={newRequireTax}
                    onChange={(e) => setNewRequireTax(e.target.checked)}
                    className="w-4 h-4 text-amber-600 rounded"
                  />
                  <span>Customer requires Company Tax Receipt / Full Tax Invoice (ใบกำกับภาษี)</span>
                </label>

                {newRequireTax && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Company Legal Name *</label>
                      <input
                        type="text"
                        required={newRequireTax}
                        placeholder="Company Name Co., Ltd."
                        value={newCompanyName}
                        onChange={(e) => setNewCompanyName(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">13-digit Tax ID *</label>
                      <input
                        type="text"
                        maxLength={13}
                        required={newRequireTax}
                        placeholder="e.g. 0105562019284"
                        value={newTaxId}
                        onChange={(e) => setNewTaxId(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white font-mono"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Branch Name / Code</label>
                      <input
                        type="text"
                        placeholder="Head Office (สำนักงานใหญ่)"
                        value={newBranch}
                        onChange={(e) => setNewBranch(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Company Registered Address</label>
                      <input
                        type="text"
                        placeholder="Tax Billing Address"
                        value={newCompanyAddress}
                        onChange={(e) => setNewCompanyAddress(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Initial Staff Notes & Garment Care Preferences</label>
                <textarea
                  rows="2"
                  placeholder="e.g. Hypoallergenic only, extra starch on shirts..."
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-300"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold shadow-md"
                >
                  Save Customer to CRM
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* OTP VERIFICATION SIMULATOR MODAL */}
      {/* ========================================================================= */}
      {showOtpModal && otpTargetCustomer && (
        <div 
          className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setShowOtpModal(false)}
        >
          <div 
            className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center">
                  <Icon name="smartphone" className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">OTP Verification Flow</h3>
                  <p className="text-[11px] text-slate-500">Verify customer mobile or email</p>
                </div>
              </div>
              <button onClick={() => setShowOtpModal(false)} className="text-slate-400 hover:text-slate-700 p-1 flex items-center gap-1" title="Close (Esc)">
                <span className="text-[10px] font-mono font-bold px-1 rounded bg-slate-100 text-slate-500 border border-slate-200">ESC</span>
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-500 font-medium">Customer:</span>
                <div className="font-bold text-slate-900 text-sm">{otpTargetCustomer.fullName} ({otpTargetCustomer.nickName || 'No nickname'})</div>
              </div>

              {/* Select Channel */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Select OTP Delivery Channel:</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setOtpChannel('whatsapp');
                      const gen = laundryStore.generateOtp('whatsapp', otpTargetCustomer.mobileNumber);
                      setOtpGeneratedData(gen);
                    }}
                    className={`py-2 px-2 rounded-xl text-xs font-bold border transition ${
                      otpChannel === 'whatsapp' ? 'bg-emerald-50 border-emerald-500 text-emerald-800' : 'bg-white border-slate-200 text-slate-700'
                    }`}
                  >
                    💬 WhatsApp
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setOtpChannel('sms');
                      const gen = laundryStore.generateOtp('sms', otpTargetCustomer.mobileNumber);
                      setOtpGeneratedData(gen);
                    }}
                    className={`py-2 px-2 rounded-xl text-xs font-bold border transition ${
                      otpChannel === 'sms' ? 'bg-sky-50 border-sky-500 text-sky-800' : 'bg-white border-slate-200 text-slate-700'
                    }`}
                  >
                    📱 SMS
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setOtpChannel('email');
                      const gen = laundryStore.generateOtp('email', otpTargetCustomer.email || 'customer@email.com');
                      setOtpGeneratedData(gen);
                    }}
                    className={`py-2 px-2 rounded-xl text-xs font-bold border transition ${
                      otpChannel === 'email' ? 'bg-indigo-50 border-indigo-500 text-indigo-800' : 'bg-white border-slate-200 text-slate-700'
                    }`}
                  >
                    ✉️ Email
                  </button>
                </div>
              </div>

              {/* Simulated Delivery Code Banner */}
              {otpGeneratedData && (
                <div className="p-3.5 rounded-2xl bg-slate-900 text-white space-y-1">
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>Dispatched via <strong>{otpChannel.toUpperCase()}</strong>:</span>
                    <span className="text-emerald-400 font-mono">Expires in 5:00</span>
                  </div>
                  <div className="text-center py-1">
                    <div className="text-xs text-slate-400">One-Time Verification Password:</div>
                    <div className="text-2xl font-mono font-black text-sky-400 tracking-widest mt-0.5">
                      {otpGeneratedData.code}
                    </div>
                  </div>
                  <div className="text-[10px] text-slate-400 text-center">
                    To: {otpGeneratedData.contact}
                  </div>
                </div>
              )}

              {/* Verification Code Input */}
              <form onSubmit={handleVerifyOtpSubmit} className="space-y-3 pt-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Enter 6-Digit Code:</label>
                  <input
                    type="text"
                    maxLength={6}
                    required
                    placeholder="e.g. 123456"
                    value={otpEnteredCode}
                    onChange={(e) => setOtpEnteredCode(e.target.value)}
                    className="w-full text-center tracking-widest font-mono text-xl py-2 rounded-xl border border-slate-300 font-black"
                  />
                </div>

                {otpFeedbackMsg && (
                  <div className="p-2.5 rounded-xl bg-slate-100 text-center font-bold text-xs">
                    {otpFeedbackMsg}
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold shadow"
                >
                  Verify & Authenticate Customer
                </button>
              </form>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6-DIGIT PIN CHANGE MODAL */}
      {/* ========================================================================= */}
      {showPinModal && selectedCustomer && (
        <div 
          className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setShowPinModal(false)}
        >
          <div 
            className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-black text-slate-900 text-sm">Update 6-Digit Quick Access PIN</h3>
              <button onClick={() => setShowPinModal(false)} className="text-slate-400 hover:text-slate-700 flex items-center gap-1" title="Close (Esc)">
                <span className="text-[10px] font-mono font-bold px-1 rounded bg-slate-100 text-slate-500 border border-slate-200">ESC</span>
                ✕
              </button>
            </div>

            <form onSubmit={handleSavePin} className="space-y-3 text-xs">
              <p className="text-slate-500">
                Set a 6-digit numeric PIN so K. {selectedCustomer.nickName || selectedCustomer.fullName} can access their account quickly without requesting an OTP each time.
              </p>

              <div>
                <label className="block font-bold text-slate-700 mb-1">New 6-Digit PIN *</label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  placeholder="e.g. 654321"
                  value={newPinCodeInput}
                  onChange={(e) => setNewPinCodeInput(e.target.value)}
                  className="w-full text-center font-mono text-xl py-2 rounded-xl border border-slate-300 font-bold"
                />
              </div>

              {pinFeedbackMsg && (
                <div className="p-2 rounded-lg bg-sky-50 text-sky-800 text-center font-bold">
                  {pinFeedbackMsg}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold"
              >
                Save 6-Digit PIN
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* LOG NEW ISSUE / INCIDENT MODAL */}
      {/* ========================================================================= */}
      {showLogIssueModal && selectedCustomer && (
        <div 
          className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setShowLogIssueModal(false)}
        >
          <div 
            className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-black text-slate-900 text-base">Record Customer Issue / Request</h3>
              <button onClick={() => setShowLogIssueModal(false)} className="text-slate-400 hover:text-slate-700 flex items-center gap-1" title="Close (Esc)">
                <span className="text-[10px] font-mono font-bold px-1 rounded bg-slate-100 text-slate-500 border border-slate-200">ESC</span>
                ✕
              </button>
            </div>

            <form onSubmit={handleLogIssueSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Source Channel *</label>
                <select
                  value={issueChannel}
                  onChange={(e) => setIssueChannel(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                >
                  <option value="whatsapp">WhatsApp Inquiry</option>
                  <option value="line">LINE Official Account</option>
                  <option value="email">Email Support</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Subject / Category *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Special care: delicate linen wash / Delivery timing inquiry"
                  value={issueSubject}
                  onChange={(e) => setIssueSubject(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Related Order ID (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. NNL-8491-BK"
                  value={issueOrderId}
                  onChange={(e) => setIssueOrderId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Customer Message / Inquiry *</label>
                <textarea
                  rows="3"
                  required
                  placeholder="Paste or summarize customer's message from chat..."
                  value={issueMessage}
                  onChange={(e) => setIssueMessage(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowLogIssueModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold shadow"
                >
                  Record to Ticket History
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* EDIT PHONE NUMBERS & WHATSAPP VERIFICATION MODAL */}
      {/* ========================================================================= */}
      {showEditPhonesModal && selectedCustomer && (
        <div 
          className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setShowEditPhonesModal(false)}
        >
          <div 
            className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h3 className="font-black text-slate-900 text-base">Edit Phone Numbers & WhatsApp</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Customer: <strong className="text-slate-800">{selectedCustomer.fullName}</strong> {selectedCustomer.nickName && `(${selectedCustomer.nickName})`}
                </p>
              </div>
              <button 
                onClick={() => setShowEditPhonesModal(false)} 
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 flex items-center gap-1" 
                title="Close (Esc)"
              >
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 border border-slate-200">ESC</span>
                <Icon name="x" className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditedPhones} className="space-y-4 text-xs">
              {/* Thai Primary Mobile */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-800 flex items-center gap-1">
                    <span>🇹🇭</span>
                    <span>Primary Thai Mobile *</span>
                  </label>
                  <span className="text-[10px] font-mono text-slate-400">Default Local</span>
                </div>
                <input
                  type="tel"
                  required
                  placeholder="+66 8X XXX XXXX"
                  value={editThaiMobile}
                  onChange={(e) => setEditThaiMobile(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 font-mono font-bold bg-white"
                />
                <div className="flex items-center justify-between gap-2 pt-1 flex-wrap">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editIsWhatsAppThai}
                      onChange={(e) => setEditIsWhatsAppThai(e.target.checked)}
                      className="w-4 h-4 text-emerald-600 rounded"
                    />
                    <span className="font-bold text-emerald-800 text-[11px]">Number is registered on WhatsApp</span>
                  </label>

                  {editThaiMobile.replace(/[^0-9]/g, '').length >= 6 && (
                    <a
                      href={`https://wa.me/${editThaiMobile.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-emerald-700 hover:text-emerald-900 font-bold text-[11px] underline flex items-center gap-1"
                    >
                      <Icon name="whatsapp" className="w-3 h-3 text-emerald-600" />
                      <span>Test Link ↗</span>
                    </a>
                  )}
                </div>
              </div>

              {/* International Secondary Mobile */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-800 flex items-center gap-1">
                    <span>🌐</span>
                    <span>International Mobile (Country Code)</span>
                  </label>
                  <span className="text-[10px] text-slate-400">Expats / Roaming</span>
                </div>
                <input
                  type="tel"
                  placeholder="e.g. +1 (415) 890-1234 or +44 ..."
                  value={editIntlMobile}
                  onChange={(e) => setEditIntlMobile(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 font-mono font-bold bg-white"
                />

                {/* Country Code Helper Pills */}
                <div className="flex items-center gap-1 flex-wrap">
                  <span className="text-[10px] text-slate-400 font-medium">Quick Prefix:</span>
                  {[
                    { code: '+1 ', label: '🇺🇸 +1' },
                    { code: '+44 ', label: '🇬🇧 +44' },
                    { code: '+65 ', label: '🇸🇬 +65' },
                    { code: '+81 ', label: '🇯🇵 +81' },
                    { code: '+61 ', label: '🇦🇺 +61' },
                    { code: '+33 ', label: '🇫🇷 +33' },
                    { code: '+49 ', label: '🇩🇪 +49' }
                  ].map(country => (
                    <button
                      key={country.code}
                      type="button"
                      onClick={() => setEditIntlMobile(country.code)}
                      className="px-1.5 py-0.5 rounded bg-white hover:bg-slate-200 border border-slate-200 text-slate-600 text-[10px] font-mono transition"
                    >
                      {country.label}
                    </button>
                  ))}
                </div>

                <div className="flex items-center justify-between gap-2 pt-1 flex-wrap">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editIsWhatsAppIntl}
                      onChange={(e) => setEditIsWhatsAppIntl(e.target.checked)}
                      className="w-4 h-4 text-emerald-600 rounded"
                    />
                    <span className="font-bold text-emerald-800 text-[11px]">Number is registered on WhatsApp</span>
                  </label>

                  {editIntlMobile.replace(/[^0-9]/g, '').length >= 6 && (
                    <a
                      href={`https://wa.me/${editIntlMobile.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-emerald-700 hover:text-emerald-900 font-bold text-[11px] underline flex items-center gap-1"
                    >
                      <Icon name="whatsapp" className="w-3 h-3 text-emerald-600" />
                      <span>Test Link ↗</span>
                    </a>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowEditPhonesModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold shadow"
                >
                  Save Phone Numbers
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
