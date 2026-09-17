import React, { useState, useEffect } from 'react';
import { Icon } from './Icons.jsx';
import { ORDER_STATUSES, BANGKOK_DISTRICTS, TIME_SLOTS } from '../data/servicesData.js';
import { CONTACT_CHANNELS, getLineOaAddFriendUrl, getLineQrCodeUrl, generatePromptPayQrUrl, laundryStore } from '../store.js';
import { OrderKanban } from './OrderKanban.jsx';
import { OrderDetailsModal } from './OrderDetailsModal.jsx';

export function AdminPOS({
  adminUser,
  onLogout,
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

  // Service Full Drafts State (Pricing, Min Weight, Description, Features Sublist)
  const buildInitialDrafts = (srvList) =>
    (srvList || []).reduce((acc, s) => {
      acc[s.id] = {
        name: s.name || '',
        nameTh: s.nameTh || '',
        pricePerKg: s.pricePerKg !== undefined ? s.pricePerKg : 80,
        minWeightKg: s.minWeightKg !== undefined ? s.minWeightKg : 4.0,
        turnaroundHours: s.turnaroundHours !== undefined ? s.turnaroundHours : 24,
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
  const [newServicePrice, setNewServicePrice] = useState('85');
  const [newServiceMinWeight, setNewServiceMinWeight] = useState('4.0');
  const [newServiceTurnaround, setNewServiceTurnaround] = useState('24');
  const [newServiceDesc, setNewServiceDesc] = useState('');
  const [newServicePopular, setNewServicePopular] = useState(false);
  const [newServiceFeatures, setNewServiceFeatures] = useState([
    'Hypoallergenic wash & gentle fabric care',
    'Care label inspection & sorting',
    'Certified digital scale intake weighing',
    'Sealed protective packaging'
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
    }
  }, [settings]);

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
  const [manualDistrict, setManualDistrict] = useState(BANGKOK_DISTRICTS[0]);
  const [manualCondo, setManualCondo] = useState('');
  const [manualWeight, setManualWeight] = useState('4.0');
  const [manualSuccessMsg, setManualSuccessMsg] = useState('');

  // Stats Calculations
  const totalOrdersCount = orders.length;
  const activeOrdersCount = orders.filter(o => o.status !== 'DELIVERED' && o.status !== 'CANCELLED').length;
  const pendingWeighCount = orders.filter(o => o.status === 'PICKED_UP' || (o.status !== 'DELIVERED' && !o.actualWeightKg)).length;
  const totalRevenue = orders.reduce((sum, o) => sum + (Number(o.totalPrice) || 0), 0);
  const pendingIncidentsCount = incidents.filter(i => i.status === 'pending').length;

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

  const handleSaveSingleService = async (serviceId) => {
    const draft = serviceDrafts[serviceId];
    if (!draft) return;
    setPricingSaving(true);
    setPricingSuccessMsg('');
    setPricingErrorMsg('');
    try {
      const cleanFeatures = (draft.features || []).map(f => typeof f === 'string' ? f.trim() : '').filter(Boolean);
      const payload = {
        name: draft.name,
        nameTh: draft.nameTh,
        pricePerKg: parseFloat(draft.pricePerKg) || 0,
        minWeightKg: Math.max(1, parseFloat(draft.minWeightKg) || 4.0),
        turnaroundHours: parseInt(draft.turnaroundHours) || 24,
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
        const cleanFeatures = (draft.features || []).map(f => typeof f === 'string' ? f.trim() : '').filter(Boolean);
        return {
          id: srvId,
          name: draft.name,
          nameTh: draft.nameTh,
          pricePerKg: parseFloat(draft.pricePerKg) || 0,
          minWeightKg: Math.max(1, parseFloat(draft.minWeightKg) || 4.0),
          turnaroundHours: parseInt(draft.turnaroundHours) || 24,
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

    const cleanFeatures = newServiceFeatures.map(f => typeof f === 'string' ? f.trim() : '').filter(Boolean);

    const added = laundryStore.addService({
      name: newServiceName.trim(),
      nameTh: newServiceNameTh.trim() || newServiceName.trim(),
      pricePerKg: parseFloat(newServicePrice) || 80,
      minWeightKg: parseFloat(newServiceMinWeight) || 4.0,
      turnaroundHours: parseInt(newServiceTurnaround) || 24,
      description: newServiceDesc.trim() || 'Professional laundry service by weight across Bangkok.',
      popular: newServicePopular,
      features: cleanFeatures.length > 0 ? cleanFeatures : [
        'Premium wash & conditioning',
        'Certified digital scale intake',
        'Dust-free protective packaging',
        'Direct Bangkok condo delivery'
      ]
    });

    setShowAddServiceModal(false);
    setNewServiceName('');
    setNewServiceNameTh('');
    setNewServiceDesc('');
    setNewServiceFeatures([
      'Hypoallergenic wash & gentle fabric care',
      'Care label inspection & sorting',
      'Certified digital scale intake weighing',
      'Sealed protective packaging'
    ]);
    setPricingSuccessMsg(`New service "${added.name}" created with custom bullet points sublist! It is now live on the storefront.`);
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
      district: manualDistrict,
      condoName: manualCondo.trim(),
      roomNumber: 'Lobby Juristic',
      leaveWithJuristic: true,
      estimatedWeightKg: parseFloat(manualWeight) || 4.0,
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
    const matchesStatus = statusFilter === 'ALL' || order.status === statusFilter;
    const matchesSearch = !searchFilter.trim() ||
      order.id.toLowerCase().includes(searchFilter.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchFilter.toLowerCase()) ||
      order.condoName.toLowerCase().includes(searchFilter.toLowerCase()) ||
      order.tagNumber.toLowerCase().includes(searchFilter.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
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
            <div className="px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>Logged in: <strong>{adminUser.username}</strong></span>
            </div>
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
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 my-6">
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
      <div className="flex border-b border-slate-200 mb-6 space-x-1 overflow-x-auto">
        {[
          { id: 'orders', label: 'Order Processing & Tracking', icon: 'package', count: orders.length },
          { id: 'services-pricing', label: 'Services & Minimum Weights', icon: 'scale', count: services.length },
          { id: 'gateway', label: 'Cashless Payment Gateway', icon: 'receipt' },
          { id: 'line-oa', label: 'LINE OA & Contact Channels', icon: 'line' },
          { id: 'incidents', label: 'Online Support & Incidents', icon: 'messageSquare', count: pendingIncidentsCount },
          { id: 'new-pos', label: 'Manual POS Order', icon: 'send' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-3 text-xs font-bold rounded-t-xl transition whitespace-nowrap flex items-center gap-2 border-b-2 ${
              activeTab === tab.id
                ? 'border-sky-600 text-sky-600 bg-sky-50/50'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Icon name={tab.icon} className="w-4 h-4" />
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono ${
                activeTab === tab.id ? 'bg-sky-600 text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

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
                              <div className="font-semibold text-slate-800">{order.serviceName}</div>
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

      {/* TAB 2: SERVICES & MINIMUM WEIGHT CONFIGURATION */}
      {activeTab === 'services-pricing' && (
        <div className="max-w-4xl mx-auto space-y-6">
          
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-100 text-sky-800 text-xs font-bold mb-1">
                  <Icon name="scale" className="w-3.5 h-3.5" />
                  <span>Configured Services & Minimum Weights</span>
                </div>
                <h2 className="text-xl font-black text-slate-900">
                  Service Catalog & Price Controls
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Default minimum weight for all services is set at <strong>4.0 KG</strong>. You can adjust prices, change minimum weights, or add new services.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowAddServiceModal(true)}
                className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md transition shrink-0"
              >
                <span>+ Add New Service</span>
              </button>
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
                {services.map((service) => {
                  const draft = serviceDrafts[service.id] || {
                    name: service.name,
                    nameTh: service.nameTh,
                    pricePerKg: service.pricePerKg,
                    minWeightKg: service.minWeightKg,
                    turnaroundHours: service.turnaroundHours,
                    description: service.description,
                    popular: service.popular,
                    features: service.features || []
                  };

                  return (
                    <div
                      key={service.id}
                      className="p-6 rounded-3xl bg-slate-50 border border-slate-200 shadow-sm space-y-4 relative group hover:border-slate-300 transition"
                    >
                      {/* Top Bar: Name, Tag, Popular, Delete */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="w-8 h-8 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-sm">
                            🧺
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
                              value={draft.nameTh}
                              onChange={(e) => handleDraftFieldChange(service.id, 'nameTh', e.target.value)}
                              placeholder="Thai Name (ชื่อภาษาไทย)"
                              className="text-xs text-sky-600 font-semibold bg-transparent border-b border-transparent hover:border-slate-300 focus:border-sky-500 focus:bg-white px-1.5 py-0.5 rounded ml-1 transition"
                              title="Click to edit service Thai name"
                            />
                          </div>
                          {draft.popular && (
                            <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full border border-amber-200">
                              Popular Badge Active
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

                      {/* Pricing, Min Weight & Turnaround Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Price per KG (THB) *
                          </label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">฿</span>
                            <input
                              type="number"
                              min="1"
                              max="1000"
                              required
                              value={draft.pricePerKg}
                              onChange={(e) => handleDraftFieldChange(service.id, 'pricePerKg', e.target.value)}
                              className="w-full pl-7 pr-3 py-2 rounded-xl border border-slate-300 text-sm font-bold text-slate-900 bg-white"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Minimum Weight (KG) *
                          </label>
                          <div className="relative">
                            <input
                              type="number"
                              min="1.0"
                              max="50"
                              step="0.5"
                              required
                              value={draft.minWeightKg}
                              onChange={(e) => handleDraftFieldChange(service.id, 'minWeightKg', e.target.value)}
                              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-bold text-slate-900 bg-white"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">KG</span>
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Turnaround Time (Hours)
                          </label>
                          <div className="relative">
                            <input
                              type="number"
                              min="1"
                              max="168"
                              value={draft.turnaroundHours}
                              onChange={(e) => handleDraftFieldChange(service.id, 'turnaroundHours', e.target.value)}
                              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-bold text-slate-900 bg-white"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">hrs</span>
                          </div>
                        </div>
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
                        <div className="text-xs text-slate-600 flex items-center gap-2">
                          <span>Min order charge: <strong className="text-slate-900 font-black">฿{Math.round((parseFloat(draft.pricePerKg) || 0) * (parseFloat(draft.minWeightKg) || 4.0))} THB</strong></span>
                          <span className="text-slate-400">•</span>
                          <span className="text-slate-500">{draft.turnaroundHours}h turnaround</span>
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
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-900 text-xs">{inc.id}</span>
                        <span className="text-slate-400">•</span>
                        <span className="font-bold text-slate-800 text-xs">Order: {inc.orderId}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          inc.status === 'resolved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {inc.status}
                        </span>
                      </div>

                      <div className="text-[11px] text-slate-400 font-mono">
                        {inc.createdAt ? inc.createdAt.substring(0, 16).replace('T', ' ') : ''}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-extrabold text-slate-900">{inc.subject}</h4>
                      <p className="text-xs text-slate-600 mt-1 bg-slate-50 p-3 rounded-xl border border-slate-200">
                        "{inc.message}"
                      </p>
                    </div>

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

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Service Tier *</label>
                <select
                  value={manualServiceId}
                  onChange={(e) => setManualServiceId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                >
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>{s.name} (฿{s.pricePerKg}/kg, min {s.minWeightKg}kg)</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Weight Estimate (KG) *</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={manualWeight}
                  onChange={(e) => setManualWeight(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Bangkok District *</label>
                <select
                  value={manualDistrict}
                  onChange={(e) => setManualDistrict(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                >
                  {BANGKOK_DISTRICTS.map((d, i) => (
                    <option key={i} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Condominium Name *</label>
                <input
                  type="text"
                  required
                  value={manualCondo}
                  onChange={(e) => setManualCondo(e.target.value)}
                  placeholder="e.g. Rhythm Asoke"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300"
                />
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

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Price / KG (฿) *</label>
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
                  <label className="block font-bold text-slate-700 mb-1">Min Weight (KG) *</label>
                  <input
                    type="number"
                    min="1"
                    step="0.5"
                    required
                    value={newServiceMinWeight}
                    onChange={(e) => setNewServiceMinWeight(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Turnaround (Hours)</label>
                  <input
                    type="number"
                    min="1"
                    value={newServiceTurnaround}
                    onChange={(e) => setNewServiceTurnaround(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>
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

      {/* ORDER DETAILS & FULL LIFECYCLE MANAGEMENT MODAL */}
      {inspectingOrder && (
        <OrderDetailsModal
          order={inspectingOrder}
          onClose={() => setInspectingOrderId(null)}
          onUpdateOrder={async (orderId, newStatus, note, actualWeightKg, tagNumber) => {
            if (onUpdateOrderStatus) {
              await onUpdateOrderStatus(orderId, newStatus, note, actualWeightKg, tagNumber);
            } else {
              await laundryStore.updateOrderStatus(orderId, newStatus, note, actualWeightKg, tagNumber);
            }
          }}
          onMarkPaid={(orderId, method) => laundryStore.markOrderPaid(orderId, method)}
        />
      )}

    </div>
  );
}
