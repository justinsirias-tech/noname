import React, { useState, useEffect } from 'react';
import { Icon } from './Icons.jsx';
import { laundryStore } from '../store.js';
import { DEFAULT_ALL_DELIVERY_ZONES, DEFAULT_DELIVERY_CONFIG, SERVICE_CITIES } from '../data/postalCodesData.js';

export function PostalCodeManager() {
  const [rates, setRates] = useState(laundryStore.getPostalCodeRates());
  const [config, setConfig] = useState(laundryStore.getDeliveryConfig());
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL'); // 'ALL', 'ACTIVE', 'INACTIVE'
  const [selectedCityTab, setSelectedCityTab] = useState('ALL'); // 'ALL', 'Bangkok', 'Pattaya'
  
  // Quick Inline Edit State
  const [editingId, setEditingId] = useState(null);
  const [editFee, setEditFee] = useState('');
  const [editFreeAbove, setEditFreeAbove] = useState('');

  // Add New Zone Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newCity, setNewCity] = useState('Bangkok');
  const [newSubdistrict, setNewSubdistrict] = useState('');
  const [newSubdistrictTh, setNewSubdistrictTh] = useState('');
  const [newDistrict, setNewDistrict] = useState('');
  const [newDistrictTh, setNewDistrictTh] = useState('');
  const [newCode, setNewCode] = useState('');
  const [newAreas, setNewAreas] = useState('');
  const [newFee, setNewFee] = useState('50');
  const [newFreeAbove, setNewFreeAbove] = useState('600');
  const [newIsActive, setNewIsActive] = useState(true);

  // Edit Modal State (Full Details)
  const [editingModalItem, setEditingModalItem] = useState(null);

  // Global Config Edit State
  const [fallbackFee, setFallbackFee] = useState(config.defaultFallbackFee || 70);
  const [freeThreshold, setFreeThreshold] = useState(config.storeWideFreeDeliveryThreshold || 600);
  const [freeEnabled, setFreeEnabled] = useState(config.freeDeliveryEnabled !== false);

  // Feedback messages
  const [toastMsg, setToastMsg] = useState('');
  const [toastError, setToastError] = useState('');
  const [isSavingGlobal, setIsSavingGlobal] = useState(false);

  useEffect(() => {
    const unsubscribe = laundryStore.subscribe(() => {
      setRates(laundryStore.getPostalCodeRates());
      const cfg = laundryStore.getDeliveryConfig();
      setConfig(cfg);
      setFallbackFee(cfg.defaultFallbackFee || 70);
      setFreeThreshold(cfg.storeWideFreeDeliveryThreshold || 600);
      setFreeEnabled(cfg.freeDeliveryEnabled !== false);
    });
    return () => unsubscribe();
  }, []);

  const showToast = (msg, isErr = false) => {
    if (isErr) {
      setToastError(msg);
      setTimeout(() => setToastError(''), 4000);
    } else {
      setToastMsg(msg);
      setTimeout(() => setToastMsg(''), 3500);
    }
  };

  // Inline Fee Quick Save
  const handleQuickSaveFee = async (item) => {
    if (!editFee || isNaN(Number(editFee))) {
      showToast('Please enter a valid numeric delivery fee.', true);
      return;
    }
    const targetKey = item.id || item.code;
    try {
      await laundryStore.updatePostalCodeRate(targetKey, {
        fee: Math.max(0, Number(editFee)),
        freeDeliveryAbove: editFreeAbove !== '' ? Math.max(0, Number(editFreeAbove)) : undefined
      });
      setEditingId(null);
      showToast(`${item.subdistrict || item.district} (${item.city}) delivery fee updated to ฿${editFee}`);
    } catch (err) {
      showToast(err.message, true);
    }
  };

  // Toggle Active/Inactive
  const handleToggleActive = async (item) => {
    const targetKey = item.id || item.code;
    try {
      const newStatus = await laundryStore.togglePostalCodeActive(targetKey);
      showToast(`${item.subdistrict || item.district} (${item.city}) is now ${newStatus ? 'ACTIVE' : 'INACTIVE'}`);
    } catch (err) {
      showToast(err.message, true);
    }
  };

  // Delete Zone Rate
  const handleDeleteRate = async (item) => {
    const targetKey = item.id || item.code;
    if (!confirm(`Are you sure you want to delete delivery charges for ${item.city} - ${item.subdistrict || item.district} (${item.code})?`)) {
      return;
    }
    try {
      await laundryStore.deletePostalCodeRate(targetKey);
      showToast(`${item.subdistrict || item.district} deleted.`);
    } catch (err) {
      showToast(err.message, true);
    }
  };

  // Save Add New Delivery Zone
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!newCode.trim()) {
      showToast('Please enter a 5-digit postal code.', true);
      return;
    }
    if (!newSubdistrict.trim()) {
      showToast('Please enter the sub-district (Khwaeng / Tambon) name.', true);
      return;
    }
    try {
      await laundryStore.addPostalCodeRate({
        city: newCity,
        subdistrict: newSubdistrict.trim(),
        subdistrictTh: newSubdistrictTh.trim(),
        district: newDistrict.trim() || (newCity === 'Pattaya' ? 'Bang Lamung' : 'Bangkok'),
        districtTh: newDistrictTh.trim(),
        code: newCode.trim(),
        areas: newAreas.trim() || `${newSubdistrict.trim()} residences`,
        fee: Number(newFee) || 50,
        freeDeliveryAbove: Number(newFreeAbove) || 600,
        isActive: newIsActive
      });
      setIsAddModalOpen(false);
      setNewSubdistrict('');
      setNewSubdistrictTh('');
      setNewDistrict('');
      setNewDistrictTh('');
      setNewCode('');
      setNewAreas('');
      setNewFee('50');
      setNewFreeAbove('600');
      showToast(`Sub-district ${newSubdistrict.trim()} (${newCity}) successfully added to delivery rates!`);
    } catch (err) {
      showToast(err.message, true);
    }
  };

  // Save Full Edit Modal
  const handleFullEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingModalItem) return;
    const targetKey = editingModalItem.id || editingModalItem.code;
    try {
      await laundryStore.updatePostalCodeRate(targetKey, {
        city: editingModalItem.city || 'Bangkok',
        subdistrict: (editingModalItem.subdistrict || '').trim(),
        subdistrictTh: (editingModalItem.subdistrictTh || '').trim(),
        district: (editingModalItem.district || '').trim(),
        districtTh: (editingModalItem.districtTh || '').trim(),
        code: (editingModalItem.code || '').trim(),
        areas: (editingModalItem.areas || '').trim(),
        fee: Number(editingModalItem.fee) || 0,
        freeDeliveryAbove: Number(editingModalItem.freeDeliveryAbove) || 0,
        isActive: editingModalItem.isActive
      });
      setEditingModalItem(null);
      showToast(`Delivery zone ${editingModalItem.subdistrict || editingModalItem.district} (${editingModalItem.city}) saved.`);
    } catch (err) {
      showToast(err.message, true);
    }
  };

  // Save Global Configuration
  const handleSaveGlobalConfig = async (e) => {
    e.preventDefault();
    setIsSavingGlobal(true);
    try {
      await laundryStore.updateDeliveryConfig({
        defaultFallbackFee: Number(fallbackFee) || 70,
        storeWideFreeDeliveryThreshold: Number(freeThreshold) || 600,
        freeDeliveryEnabled: Boolean(freeEnabled)
      });
      showToast('Global delivery fee policy saved and synchronized!');
    } catch (err) {
      showToast(err.message, true);
    } finally {
      setIsSavingGlobal(false);
    }
  };

  // Reset to Defaults
  const handleResetDefaults = async () => {
    if (!confirm('Reset all Bangkok & Pattaya sub-district delivery fees to standard recommended rates? Custom additions will be restored.')) {
      return;
    }
    try {
      await laundryStore.resetPostalCodeRates();
      showToast('All delivery fees reset to standard Bangkok and Pattaya sub-district rates.');
    } catch (err) {
      showToast(err.message, true);
    }
  };

  // City-specific Counts
  const bangkokCount = rates.filter(r => (r.city || 'Bangkok') === 'Bangkok').length;
  const pattayaCount = rates.filter(r => r.city === 'Pattaya').length;
  const activeCount = rates.filter(r => r.isActive !== false).length;

  // Filtering
  const filteredRates = rates.filter(r => {
    const itemCity = r.city || 'Bangkok';
    const matchesCity = 
      selectedCityTab === 'ALL' || 
      itemCity.toLowerCase() === selectedCityTab.toLowerCase();

    const matchesStatus = 
      filterStatus === 'ALL' ||
      (filterStatus === 'ACTIVE' && r.isActive !== false) ||
      (filterStatus === 'INACTIVE' && r.isActive === false);
    
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch = 
      !q ||
      (r.code && r.code.includes(q)) ||
      (r.subdistrict && r.subdistrict.toLowerCase().includes(q)) ||
      (r.subdistrictTh && r.subdistrictTh.toLowerCase().includes(q)) ||
      (r.district && r.district.toLowerCase().includes(q)) ||
      (r.districtTh && r.districtTh.toLowerCase().includes(q)) ||
      (r.city && r.city.toLowerCase().includes(q)) ||
      (r.areas && r.areas.toLowerCase().includes(q));

    return matchesCity && matchesStatus && matchesSearch;
  });

  const fees = rates.map(r => Number(r.fee)).filter(n => !isNaN(n));
  const minFee = fees.length > 0 ? Math.min(...fees) : 50;
  const maxFee = fees.length > 0 ? Math.max(...fees) : 100;
  const avgFee = fees.length > 0 ? Math.round(fees.reduce((a, b) => a + b, 0) / fees.length) : 60;

  return (
    <div className="space-y-6">
      {/* Toast Notifications */}
      {toastMsg && (
        <div className="fixed top-5 right-5 z-50 p-4 bg-emerald-900 text-white rounded-2xl shadow-2xl flex items-center gap-2.5 text-xs font-bold border border-emerald-700 animate-fadeIn">
          <Icon name="check" className="w-4 h-4 text-emerald-300" />
          <span>{toastMsg}</span>
        </div>
      )}
      {toastError && (
        <div className="fixed top-5 right-5 z-50 p-4 bg-rose-900 text-white rounded-2xl shadow-2xl flex items-center gap-2.5 text-xs font-bold border border-rose-700 animate-fadeIn">
          <span className="text-sm">⚠️</span>
          <span>{toastError}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/20 border border-sky-400/30 text-sky-300 text-xs font-bold mb-3">
              <span>🚚 Bangkok & Pattaya Sub-district Delivery</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              Sub-district Delivery Rates Manager
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-2xl leading-relaxed">
              Configure pickup & delivery fees charged per sub-district (Khwaeng) in Bangkok and dedicated zones across Pattaya. Automatically calculated during customer checkout and manual POS order creation.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-5 py-3 rounded-2xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs shadow-lg shadow-sky-500/30 transition flex items-center gap-2"
            >
              <Icon name="plus" className="w-4 h-4" />
              <span>Add Sub-district</span>
            </button>
            <button
              onClick={handleResetDefaults}
              title="Reset all rates to standard defaults"
              className="px-4 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs border border-slate-700 transition"
            >
              Reset Defaults
            </button>
          </div>
        </div>

        {/* Metric Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-800 text-xs">
          <div className="bg-slate-800/60 backdrop-blur rounded-2xl p-3 border border-slate-700/60">
            <span className="text-slate-400 block text-[11px]">🏙️ Bangkok Sub-districts</span>
            <span className="text-xl font-black text-sky-400 mt-1 block">
              {bangkokCount} <span className="text-xs font-normal text-slate-400">Khwaeng</span>
            </span>
          </div>
          <div className="bg-slate-800/60 backdrop-blur rounded-2xl p-3 border border-slate-700/60">
            <span className="text-slate-400 block text-[11px]">🏖️ Pattaya Zones</span>
            <span className="text-xl font-black text-amber-400 mt-1 block">
              {pattayaCount} <span className="text-xs font-normal text-slate-400">Tambon / Areas</span>
            </span>
          </div>
          <div className="bg-slate-800/60 backdrop-blur rounded-2xl p-3 border border-slate-700/60">
            <span className="text-slate-400 block text-[11px]">Active Coverage</span>
            <span className="text-xl font-black text-emerald-400 mt-1 block">
              {activeCount} <span className="text-xs font-normal text-slate-400">/ {rates.length}</span>
            </span>
          </div>
          <div className="bg-slate-800/60 backdrop-blur rounded-2xl p-3 border border-slate-700/60">
            <span className="text-slate-400 block text-[11px]">Fee Range & Avg</span>
            <span className="text-xl font-black text-white mt-1 block">
              ฿{minFee}–฿{maxFee} <span className="text-xs font-normal text-slate-400">(avg ฿{avgFee})</span>
            </span>
          </div>
        </div>
      </div>

      {/* Global Delivery Policy Card */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center font-bold">
              ⚙️
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900">
                Global Free Delivery & Fallback Policy
              </h3>
              <p className="text-xs text-slate-500">
                Rules applied when a residence is not explicitly mapped or qualifies for order threshold promotions.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSaveGlobalConfig} className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Fallback Delivery Fee (THB) *
            </label>
            <input
              type="number"
              min="0"
              required
              value={fallbackFee}
              onChange={(e) => setFallbackFee(e.target.value)}
              placeholder="70"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-bold text-slate-900 focus:ring-2 focus:ring-sky-500"
            />
            <p className="text-[10px] text-slate-400 mt-1">
              Charged for unlisted addresses or peripheral areas.
            </p>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Free Delivery Threshold (THB)
            </label>
            <input
              type="number"
              min="0"
              value={freeThreshold}
              onChange={(e) => setFreeThreshold(e.target.value)}
              placeholder="600"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-bold text-slate-900 focus:ring-2 focus:ring-sky-500"
            />
            <p className="text-[10px] text-slate-400 mt-1">
              Orders at or above this amount automatically receive free delivery.
            </p>
          </div>

          <div className="flex flex-col justify-between">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Free Delivery Promotion
              </label>
              <label className="flex items-center gap-2 mt-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={freeEnabled}
                  onChange={(e) => setFreeEnabled(e.target.checked)}
                  className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500 border-slate-300"
                />
                <span className="font-semibold text-slate-800">
                  Enable Free Delivery promo threshold
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isSavingGlobal}
              className="mt-3 sm:mt-0 w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold transition disabled:opacity-50"
            >
              {isSavingGlobal ? 'Saving...' : 'Save Global Policy'}
            </button>
          </div>
        </form>
      </div>

      {/* Postal Codes & Sub-districts Table Card */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-4">
        {/* City Filter Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSelectedCityTab('ALL')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                selectedCityTab === 'ALL'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <span>All Coverage Zones</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${selectedCityTab === 'ALL' ? 'bg-slate-800 text-slate-300' : 'bg-slate-200 text-slate-700'}`}>
                {rates.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedCityTab('Bangkok')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                selectedCityTab === 'Bangkok'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'bg-sky-50 text-sky-700 hover:bg-sky-100'
              }`}
            >
              <span>🏙️ Bangkok Sub-districts</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${selectedCityTab === 'Bangkok' ? 'bg-sky-700 text-sky-200' : 'bg-sky-200 text-sky-800'}`}>
                {bangkokCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedCityTab('Pattaya')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                selectedCityTab === 'Pattaya'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
              }`}
            >
              <span>🏖️ Pattaya Zones</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${selectedCityTab === 'Pattaya' ? 'bg-amber-700 text-amber-200' : 'bg-amber-200 text-amber-800'}`}>
                {pattayaCount}
              </span>
            </button>
          </div>

          {/* Filter Status Pills */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-bold text-slate-600">
            <button
              type="button"
              onClick={() => setFilterStatus('ALL')}
              className={`px-3 py-1.5 rounded-lg transition ${filterStatus === 'ALL' ? 'bg-white shadow-xs text-slate-900' : 'hover:text-slate-900'}`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setFilterStatus('ACTIVE')}
              className={`px-3 py-1.5 rounded-lg transition ${filterStatus === 'ACTIVE' ? 'bg-white shadow-xs text-emerald-700' : 'hover:text-emerald-700'}`}
            >
              Active
            </button>
            <button
              type="button"
              onClick={() => setFilterStatus('INACTIVE')}
              className={`px-3 py-1.5 rounded-lg transition ${filterStatus === 'INACTIVE' ? 'bg-white shadow-xs text-rose-700' : 'hover:text-rose-700'}`}
            >
              Inactive
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-md">
          <span className="absolute left-3.5 top-3 text-slate-400">
            <Icon name="search" className="w-4 h-4" />
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search sub-district (e.g. Khlong Toei Nuea, Wongamat), district, or postal code..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-sky-500 focus:border-sky-500 shadow-2xs"
          />
        </div>

        {/* Rates Table */}
        <div className="overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">City</th>
                <th className="py-3.5 px-4">Sub-district (Khwaeng / Tambon)</th>
                <th className="py-3.5 px-4">District / Area</th>
                <th className="py-3.5 px-4">Postal Code</th>
                <th className="py-3.5 px-4">Coverage Landmarks & Condos</th>
                <th className="py-3.5 px-4">Fixed Delivery Fee</th>
                <th className="py-3.5 px-4">Free Delivery Above</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRates.length === 0 ? (
                <tr>
                  <td colSpan="9" className="py-12 text-center text-slate-400">
                    No sub-districts match your search criteria.
                  </td>
                </tr>
              ) : (
                filteredRates.map((item) => {
                  const itemKey = item.id || item.code;
                  const isInlineEditing = editingId === itemKey;
                  const isPattaya = (item.city || '').toLowerCase() === 'pattaya';

                  return (
                    <tr 
                      key={itemKey} 
                      className={`hover:bg-slate-50/80 transition ${item.isActive === false ? 'opacity-60 bg-slate-50/50' : ''}`}
                    >
                      {/* City Badge */}
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                          isPattaya 
                            ? 'bg-amber-50 text-amber-800 border-amber-200' 
                            : 'bg-sky-50 text-sky-800 border-sky-200'
                        }`}>
                          <span>{isPattaya ? '🏖️' : '🏙️'}</span>
                          <span>{item.city || 'Bangkok'}</span>
                        </span>
                      </td>

                      {/* Sub-district Name */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">
                          {item.subdistrict || item.district}
                        </div>
                        {item.subdistrictTh && (
                          <div className="text-[11px] text-slate-400">
                            {item.subdistrictTh}
                          </div>
                        )}
                      </td>

                      {/* District */}
                      <td className="py-3.5 px-4 font-medium text-slate-700">
                        {item.district}
                      </td>

                      {/* Postal Code */}
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200">
                          {item.code}
                        </span>
                      </td>

                      {/* Areas */}
                      <td className="py-3.5 px-4 text-slate-500 max-w-xs truncate" title={item.areas}>
                        {item.areas || `${item.subdistrict || item.district} residences`}
                      </td>

                      {/* Fixed Fee */}
                      <td className="py-3.5 px-4">
                        {isInlineEditing ? (
                          <div className="flex items-center gap-1.5">
                            <span className="text-slate-400">฿</span>
                            <input
                              type="number"
                              min="0"
                              value={editFee}
                              onChange={(e) => setEditFee(e.target.value)}
                              className="w-16 px-2 py-1 rounded-lg border border-sky-400 font-bold text-slate-900 text-xs"
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleQuickSaveFee(item);
                                else if (e.key === 'Escape') setEditingId(null);
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => handleQuickSaveFee(item)}
                              className="p-1 rounded-md bg-emerald-600 text-white hover:bg-emerald-500"
                              title="Save"
                            >
                              <Icon name="check" className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingId(null)}
                              className="p-1 rounded-md bg-slate-200 text-slate-600 hover:bg-slate-300"
                              title="Cancel"
                            >
                              <Icon name="close" className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div 
                            onClick={() => {
                              setEditingId(itemKey);
                              setEditFee(item.fee);
                              setEditFreeAbove(item.freeDeliveryAbove || '');
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-sky-50 text-sky-900 font-extrabold cursor-pointer hover:bg-sky-100 border border-sky-200 transition"
                            title="Click to quickly edit fee"
                          >
                            <span>฿{item.fee}</span>
                            <span className="text-[10px] text-sky-500 font-normal">✎</span>
                          </div>
                        )}
                      </td>

                      {/* Free Delivery Above */}
                      <td className="py-3.5 px-4 text-slate-600 font-medium">
                        {item.freeDeliveryAbove ? (
                          <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 font-semibold text-[11px]">
                            Orders ≥ ฿{item.freeDeliveryAbove}
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>

                      {/* Status Toggle */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleActive(item)}
                          className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition ${
                            item.isActive !== false
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : 'bg-slate-200 text-slate-600 border border-slate-300'
                          }`}
                        >
                          {item.isActive !== false ? 'Active' : 'Paused'}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setEditingModalItem({ ...item })}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition"
                            title="Edit full details"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteRate(item)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                            title="Delete sub-district rate"
                          >
                            <Icon name="trash" className="w-3.5 h-3.5" />
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

      {/* Add New Sub-district Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200 animate-slideUp">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <div>
                <h3 className="text-lg font-black text-slate-900">
                  Add Delivery Sub-district
                </h3>
                <p className="text-xs text-slate-500">
                  Set fixed pickup & delivery rate for Bangkok Khwaeng or Pattaya zone.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <Icon name="close" className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
              {/* City Selection */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  City / Service Area *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setNewCity('Bangkok');
                      if (!newCode) setNewCode('10110');
                    }}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                      newCity === 'Bangkok'
                        ? 'border-sky-500 bg-sky-50 text-sky-900'
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    <span>🏙️</span>
                    <span>Bangkok</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setNewCity('Pattaya');
                      if (!newCode || newCode.startsWith('10')) setNewCode('20150');
                    }}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                      newCity === 'Pattaya'
                        ? 'border-amber-500 bg-amber-50 text-amber-900'
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    <span>🏖️</span>
                    <span>Pattaya</span>
                  </button>
                </div>
              </div>

              {/* Subdistrict Name EN & TH */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Sub-district (EN) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={newCity === 'Pattaya' ? 'e.g. Jomtien Beach' : 'e.g. Khlong Toei Nuea'}
                    value={newSubdistrict}
                    onChange={(e) => setNewSubdistrict(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Sub-district (Thai)
                  </label>
                  <input
                    type="text"
                    placeholder={newCity === 'Pattaya' ? 'หาดจอมเทียน' : 'คลองเตยเหนือ'}
                    value={newSubdistrictTh}
                    onChange={(e) => setNewSubdistrictTh(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              {/* District & Postal Code */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    District (Khet/Amphoe) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={newCity === 'Pattaya' ? 'Bang Lamung / Sattahip' : 'Watthana / Khlong Toei'}
                    value={newDistrict}
                    onChange={(e) => setNewDistrict(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Postal Code (5-digit) *
                  </label>
                  <input
                    type="text"
                    required
                    pattern="[0-9]{5}"
                    placeholder={newCity === 'Pattaya' ? '20150' : '10110'}
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value.replace(/[^0-9]/g, ''))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono font-bold"
                  />
                </div>
              </div>

              {/* Areas & Landmarks */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Key Condos, Hotels & Landmarks
                </label>
                <input
                  type="text"
                  placeholder="e.g. Asoke, Sukhumvit 21–39, Terminal 21, Thappraya Road"
                  value={newAreas}
                  onChange={(e) => setNewAreas(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300"
                />
              </div>

              {/* Fee and Free Delivery Threshold */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Fixed Delivery Fee (THB) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    placeholder="50"
                    value={newFee}
                    onChange={(e) => setNewFee(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Free Delivery Threshold (THB)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="600"
                    value={newFreeAbove}
                    onChange={(e) => setNewFreeAbove(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 cursor-pointer mt-1">
                  <input
                    type="checkbox"
                    checked={newIsActive}
                    onChange={(e) => setNewIsActive(e.target.checked)}
                    className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500 border-slate-300"
                  />
                  <span className="font-semibold text-slate-800">
                    Active for customer pickup & delivery
                  </span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-600 font-bold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold shadow-md transition"
                >
                  Add Sub-district
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Full Modal */}
      {editingModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200 animate-slideUp">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <div>
                <h3 className="text-lg font-black text-slate-900">
                  Edit Delivery Zone — {editingModalItem.subdistrict || editingModalItem.district}
                </h3>
                <p className="text-xs text-slate-500">
                  Update {editingModalItem.city} sub-district name, district, postal code, and delivery fee.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingModalItem(null)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <Icon name="close" className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFullEditSubmit} className="space-y-4 text-xs">
              {/* City Selection */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  City / Service Area *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingModalItem({ ...editingModalItem, city: 'Bangkok' })}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                      editingModalItem.city === 'Bangkok'
                        ? 'border-sky-500 bg-sky-50 text-sky-900'
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    <span>🏙️</span>
                    <span>Bangkok</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingModalItem({ ...editingModalItem, city: 'Pattaya' })}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                      editingModalItem.city === 'Pattaya'
                        ? 'border-amber-500 bg-amber-50 text-amber-900'
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    <span>🏖️</span>
                    <span>Pattaya</span>
                  </button>
                </div>
              </div>

              {/* Subdistrict Name EN & TH */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Sub-district (EN) *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingModalItem.subdistrict || ''}
                    onChange={(e) => setEditingModalItem({ ...editingModalItem, subdistrict: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Sub-district (Thai)
                  </label>
                  <input
                    type="text"
                    value={editingModalItem.subdistrictTh || ''}
                    onChange={(e) => setEditingModalItem({ ...editingModalItem, subdistrictTh: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              {/* District & Postal Code */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    District (Khet/Amphoe) *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingModalItem.district || ''}
                    onChange={(e) => setEditingModalItem({ ...editingModalItem, district: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Postal Code (5-digit) *
                  </label>
                  <input
                    type="text"
                    required
                    pattern="[0-9]{5}"
                    value={editingModalItem.code || ''}
                    onChange={(e) => setEditingModalItem({ ...editingModalItem, code: e.target.value.replace(/[^0-9]/g, '') })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono font-bold"
                  />
                </div>
              </div>

              {/* Coverage Areas */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Coverage Landmarks & Condominiums
                </label>
                <input
                  type="text"
                  value={editingModalItem.areas || ''}
                  onChange={(e) => setEditingModalItem({ ...editingModalItem, areas: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300"
                />
              </div>

              {/* Fixed Fee & Free Delivery Threshold */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Fixed Delivery Fee (THB) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={editingModalItem.fee}
                    onChange={(e) => setEditingModalItem({ ...editingModalItem, fee: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Free Delivery Threshold (THB)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={editingModalItem.freeDeliveryAbove || ''}
                    onChange={(e) => setEditingModalItem({ ...editingModalItem, freeDeliveryAbove: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 cursor-pointer mt-1">
                  <input
                    type="checkbox"
                    checked={editingModalItem.isActive !== false}
                    onChange={(e) => setEditingModalItem({ ...editingModalItem, isActive: e.target.checked })}
                    className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500 border-slate-300"
                  />
                  <span className="font-semibold text-slate-800">
                    Active for customer pickup & delivery
                  </span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingModalItem(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-600 font-bold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold shadow-md transition"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
