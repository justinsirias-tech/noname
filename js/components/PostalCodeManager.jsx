import React, { useState, useEffect } from 'react';
import { Icon } from './Icons.jsx';
import { laundryStore } from '../store.js';
import { DEFAULT_BANGKOK_POSTAL_CODES, DEFAULT_DELIVERY_CONFIG } from '../data/postalCodesData.js';

export function PostalCodeManager() {
  const [rates, setRates] = useState(laundryStore.getPostalCodeRates());
  const [config, setConfig] = useState(laundryStore.getDeliveryConfig());
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL'); // 'ALL', 'ACTIVE', 'INACTIVE'
  
  // Quick Inline Edit State
  const [editingCode, setEditingCode] = useState(null);
  const [editFee, setEditFee] = useState('');
  const [editFreeAbove, setEditFreeAbove] = useState('');

  // Add New Postal Code Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newCode, setNewCode] = useState('');
  const [newDistrict, setNewDistrict] = useState('');
  const [newAreas, setNewAreas] = useState('');
  const [newFee, setNewFee] = useState('50');
  const [newFreeAbove, setNewFreeAbove] = useState('600');
  const [newIsActive, setNewIsActive] = useState(true);

  // Edit Modal State (Full Details)
  const [editingModalItem, setEditingModalItem] = useState(null);

  // Global Config Edit State
  const [fallbackFee, setFallbackFee] = useState(config.defaultFallbackFee || 80);
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
      setFallbackFee(cfg.defaultFallbackFee || 80);
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
  const handleQuickSaveFee = async (code) => {
    if (!editFee || isNaN(Number(editFee))) {
      showToast('Please enter a valid numeric delivery fee.', true);
      return;
    }
    try {
      await laundryStore.updatePostalCodeRate(code, {
        fee: Math.max(0, Number(editFee)),
        freeDeliveryAbove: editFreeAbove !== '' ? Math.max(0, Number(editFreeAbove)) : undefined
      });
      setEditingCode(null);
      showToast(`Postal code ${code} delivery fee updated to ฿${editFee}`);
    } catch (err) {
      showToast(err.message, true);
    }
  };

  // Toggle Active/Inactive
  const handleToggleActive = async (code) => {
    try {
      const newStatus = await laundryStore.togglePostalCodeActive(code);
      showToast(`Postal code ${code} is now ${newStatus ? 'ACTIVE' : 'INACTIVE'}`);
    } catch (err) {
      showToast(err.message, true);
    }
  };

  // Delete Postal Code
  const handleDeleteRate = async (code) => {
    if (!confirm(`Are you sure you want to delete delivery charges for Bangkok Postal Code ${code}?`)) {
      return;
    }
    try {
      await laundryStore.deletePostalCodeRate(code);
      showToast(`Postal code ${code} deleted.`);
    } catch (err) {
      showToast(err.message, true);
    }
  };

  // Save Add New Postal Code
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!newCode.trim()) {
      showToast('Please enter a 5-digit Bangkok postal code.', true);
      return;
    }
    try {
      await laundryStore.addPostalCodeRate({
        code: newCode.trim(),
        district: newDistrict.trim() || 'Bangkok Central',
        areas: newAreas.trim() || 'Central Bangkok residences',
        fee: Number(newFee) || 50,
        freeDeliveryAbove: Number(newFreeAbove) || 600,
        isActive: newIsActive
      });
      setIsAddModalOpen(false);
      setNewCode('');
      setNewDistrict('');
      setNewAreas('');
      setNewFee('50');
      setNewFreeAbove('600');
      showToast(`Postal code ${newCode.trim()} successfully added to delivery rates!`);
    } catch (err) {
      showToast(err.message, true);
    }
  };

  // Save Full Edit Modal
  const handleFullEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingModalItem) return;
    try {
      await laundryStore.updatePostalCodeRate(editingModalItem.code, {
        district: editingModalItem.district.trim(),
        areas: editingModalItem.areas.trim(),
        fee: Number(editingModalItem.fee) || 0,
        freeDeliveryAbove: Number(editingModalItem.freeDeliveryAbove) || 0,
        isActive: editingModalItem.isActive
      });
      setEditingModalItem(null);
      showToast(`Postal code ${editingModalItem.code} details saved successfully.`);
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
        defaultFallbackFee: Number(fallbackFee) || 80,
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
    if (!confirm('Reset all Bangkok postal code delivery fees to standard recommended rates? Any custom additions will be restored.')) {
      return;
    }
    try {
      await laundryStore.resetPostalCodeRates();
      showToast('All postal code delivery fees reset to standard Bangkok rates.');
    } catch (err) {
      showToast(err.message, true);
    }
  };

  // Filtering
  const filteredRates = rates.filter(r => {
    const matchesStatus = 
      filterStatus === 'ALL' ||
      (filterStatus === 'ACTIVE' && r.isActive !== false) ||
      (filterStatus === 'INACTIVE' && r.isActive === false);
    
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch = 
      !q ||
      r.code.includes(q) ||
      r.district.toLowerCase().includes(q) ||
      (r.areas && r.areas.toLowerCase().includes(q));

    return matchesStatus && matchesSearch;
  });

  const activeCount = rates.filter(r => r.isActive !== false).length;
  const fees = rates.map(r => Number(r.fee)).filter(n => !isNaN(n));
  const minFee = fees.length > 0 ? Math.min(...fees) : 50;
  const maxFee = fees.length > 0 ? Math.max(...fees) : 90;
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
              <span>🚚 Bangkok Logistics & Postal Zones</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              Fixed Delivery Rates by Postal Code
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-2xl leading-relaxed">
              Manage fixed pickup & delivery charges for each Bangkok postal code. Charges are automatically calculated during customer booking and on POS orders based on the residence postal code.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-5 py-3 rounded-2xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs shadow-lg shadow-sky-500/30 transition flex items-center gap-2"
            >
              <Icon name="plus" className="w-4 h-4" />
              <span>Add Postal Code</span>
            </button>
            <button
              onClick={handleResetDefaults}
              title="Reset to standard Bangkok rates"
              className="px-4 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs border border-slate-700 transition"
            >
              Reset Defaults
            </button>
          </div>
        </div>

        {/* Metric Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-800 text-xs">
          <div className="bg-slate-800/60 backdrop-blur rounded-2xl p-3 border border-slate-700/60">
            <span className="text-slate-400 block text-[11px]">Active Postal Codes</span>
            <span className="text-xl font-black text-white mt-1 block">
              {activeCount} <span className="text-xs font-normal text-slate-400">/ {rates.length}</span>
            </span>
          </div>
          <div className="bg-slate-800/60 backdrop-blur rounded-2xl p-3 border border-slate-700/60">
            <span className="text-slate-400 block text-[11px]">Delivery Fee Range</span>
            <span className="text-xl font-black text-sky-400 mt-1 block">
              ฿{minFee} – ฿{maxFee}
            </span>
          </div>
          <div className="bg-slate-800/60 backdrop-blur rounded-2xl p-3 border border-slate-700/60">
            <span className="text-slate-400 block text-[11px]">Average Zone Fee</span>
            <span className="text-xl font-black text-emerald-400 mt-1 block">
              ฿{avgFee}
            </span>
          </div>
          <div className="bg-slate-800/60 backdrop-blur rounded-2xl p-3 border border-slate-700/60">
            <span className="text-slate-400 block text-[11px]">Unlisted Fallback Fee</span>
            <span className="text-xl font-black text-amber-400 mt-1 block">
              ฿{fallbackFee}
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
                Global Delivery Policy & Fallback Settings
              </h3>
              <p className="text-xs text-slate-500">
                Rules applied when a postal code is not explicitly listed or qualifies for promotion.
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
              placeholder="80"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-bold text-slate-900 focus:ring-2 focus:ring-sky-500"
            />
            <p className="text-[10px] text-slate-400 mt-1">
              Charged for any Bangkok postal code not listed in the table below.
            </p>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Storewide Free Delivery Threshold (THB)
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
              Orders with service subtotal at or above this amount receive free delivery.
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
                  Enable Free Delivery threshold
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

      {/* Postal Codes Table Card */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-4">
        {/* Controls Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-2">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <span className="absolute left-3.5 top-3 text-slate-400">
              <Icon name="search" className="w-4 h-4" />
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search postal code (e.g. 10110), district, or condo area..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
            />
          </div>

          {/* Filter Status Pills */}
          <div className="flex items-center gap-1.5 self-start sm:self-auto bg-slate-100 p-1 rounded-xl text-xs font-bold text-slate-600">
            <button
              type="button"
              onClick={() => setFilterStatus('ALL')}
              className={`px-3 py-1.5 rounded-lg transition ${filterStatus === 'ALL' ? 'bg-white shadow-xs text-slate-900' : 'hover:text-slate-900'}`}
            >
              All ({rates.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterStatus('ACTIVE')}
              className={`px-3 py-1.5 rounded-lg transition ${filterStatus === 'ACTIVE' ? 'bg-white shadow-xs text-emerald-700' : 'hover:text-emerald-700'}`}
            >
              Active ({activeCount})
            </button>
            <button
              type="button"
              onClick={() => setFilterStatus('INACTIVE')}
              className={`px-3 py-1.5 rounded-lg transition ${filterStatus === 'INACTIVE' ? 'bg-white shadow-xs text-rose-700' : 'hover:text-rose-700'}`}
            >
              Inactive ({rates.length - activeCount})
            </button>
          </div>
        </div>

        {/* Rates Table */}
        <div className="overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">Postal Code</th>
                <th className="py-3.5 px-4">Bangkok District / Zone</th>
                <th className="py-3.5 px-4">Coverage Areas & Landmarks</th>
                <th className="py-3.5 px-4">Fixed Delivery Fee</th>
                <th className="py-3.5 px-4">Free Delivery Above</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRates.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400">
                    No postal codes match your search criteria.
                  </td>
                </tr>
              ) : (
                filteredRates.map((item) => {
                  const isInlineEditing = editingCode === item.code;
                  return (
                    <tr 
                      key={item.code} 
                      className={`hover:bg-slate-50/80 transition ${item.isActive === false ? 'opacity-60 bg-slate-50/50' : ''}`}
                    >
                      {/* Postal Code */}
                      <td className="py-3.5 px-4 font-mono font-black text-sm text-slate-900">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200">
                          {item.code}
                        </span>
                      </td>

                      {/* District */}
                      <td className="py-3.5 px-4 font-bold text-slate-800">
                        {item.district}
                      </td>

                      {/* Areas */}
                      <td className="py-3.5 px-4 text-slate-500 max-w-xs truncate" title={item.areas}>
                        {item.areas || 'Central Bangkok'}
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
                                if (e.key === 'Enter') handleQuickSaveFee(item.code);
                                else if (e.key === 'Escape') setEditingCode(null);
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => handleQuickSaveFee(item.code)}
                              className="p-1 rounded-md bg-emerald-600 text-white hover:bg-emerald-500"
                              title="Save"
                            >
                              <Icon name="check" className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingCode(null)}
                              className="p-1 rounded-md bg-slate-200 text-slate-600 hover:bg-slate-300"
                              title="Cancel"
                            >
                              <Icon name="close" className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div 
                            onClick={() => {
                              setEditingCode(item.code);
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
                          onClick={() => handleToggleActive(item.code)}
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
                            onClick={() => handleDeleteRate(item.code)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                            title="Delete postal code rate"
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

      {/* Add New Postal Code Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200 animate-slideUp">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <div>
                <h3 className="text-lg font-black text-slate-900">
                  Add Bangkok Postal Code
                </h3>
                <p className="text-xs text-slate-500">
                  Set fixed pickup & delivery rate for a Bangkok postal code.
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
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Bangkok Postal Code (5-digit) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 10110, 10260"
                  pattern="[0-9]{5}"
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value.replace(/[^0-9]/g, ''))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono font-bold text-sm"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Bangkok District / Zone Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Watthana / Khlong Toei"
                  value={newDistrict}
                  onChange={(e) => setNewDistrict(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Key Neighborhoods & Condominium Areas
                </label>
                <input
                  type="text"
                  placeholder="e.g. Thonglor, Ekkamai, Phrom Phong, Asoke"
                  value={newAreas}
                  onChange={(e) => setNewAreas(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300"
                />
              </div>

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
                  Add Postal Code
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
                  Edit Delivery Rate — {editingModalItem.code}
                </h3>
                <p className="text-xs text-slate-500">
                  Update postal zone district name, fee, and coverage areas.
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
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Bangkok District / Zone Name *
                </label>
                <input
                  type="text"
                  required
                  value={editingModalItem.district}
                  onChange={(e) => setEditingModalItem({ ...editingModalItem, district: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Coverage Areas & Condominiums
                </label>
                <input
                  type="text"
                  value={editingModalItem.areas}
                  onChange={(e) => setEditingModalItem({ ...editingModalItem, areas: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300"
                />
              </div>

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
