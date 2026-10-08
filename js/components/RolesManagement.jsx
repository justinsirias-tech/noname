import React, { useState, useEffect } from 'react';
import { Icon } from './Icons.jsx';
import { laundryStore } from '../store.js';
import { useTranslation } from '../i18n.jsx';
import { BACKOFFICE_FEATURES, ALL_FEATURE_IDS, DEFAULT_SYSTEM_ROLES } from '../data/adminFeatures.js';

export function RolesManagement({
  adminUser,
  staffUsers = [],
  onRolesUpdated
}) {
  const { language } = useTranslation();
  const isTh = language === 'th';

  const [roles, setRoles] = useState(DEFAULT_SYSTEM_ROLES);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  // Modals
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' | 'edit'
  const [selectedRole, setSelectedRole] = useState(null);

  // Form Fields
  const [formId, setFormId] = useState('');
  const [formName, setFormName] = useState('');
  const [formNameTh, setFormNameTh] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formDescTh, setFormDescTh] = useState('');
  const [formColor, setFormColor] = useState('indigo');
  const [formPermissions, setFormPermissions] = useState([]);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Delete Confirm Modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState(null);
  const [deleteError, setDeleteError] = useState('');
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  // Fetch Roles from Backend
  const fetchRoles = async () => {
    setLoading(true);
    setError('');
    try {
      const headers = laundryStore.getAdminAuthHeaders();
      const res = await fetch('/api/admin/roles', { headers });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const data = await res.json();
      if (data && data.roles) {
        setRoles(data.roles);
        if (onRolesUpdated) onRolesUpdated(data.roles);
      }
    } catch (err) {
      console.warn('Could not fetch roles from server, using defaults:', err.message);
      setRoles(DEFAULT_SYSTEM_ROLES);
      if (onRolesUpdated) onRolesUpdated(DEFAULT_SYSTEM_ROLES);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  // Open Create Role Modal
  const openCreateModal = () => {
    setModalMode('create');
    setSelectedRole(null);
    setFormId('');
    setFormName('');
    setFormNameTh('');
    setFormDesc('');
    setFormDescTh('');
    setFormColor('indigo');
    setFormPermissions(['orders', 'new-pos', 'crm']);
    setFormError('');
    setShowModal(true);
  };

  // Open Edit Role Modal
  const openEditModal = (role) => {
    setModalMode('edit');
    setSelectedRole(role);
    setFormId(role.id);
    setFormName(role.name || '');
    setFormNameTh(role.nameTh || role.name || '');
    setFormDesc(role.description || '');
    setFormDescTh(role.descriptionTh || role.description || '');
    setFormColor(role.color || 'indigo');
    setFormPermissions(Array.isArray(role.permissions) ? [...role.permissions] : []);
    setFormError('');
    setShowModal(true);
  };

  // Duplicate Role
  const handleDuplicateRole = (role) => {
    setModalMode('create');
    setSelectedRole(null);
    setFormId(`${role.id}_copy`);
    setFormName(`${role.name} (Copy)`);
    setFormNameTh(`${role.nameTh || role.name} (สำเนา)`);
    setFormDesc(role.description || '');
    setFormDescTh(role.descriptionTh || '');
    setFormColor(role.color || 'indigo');
    setFormPermissions(Array.isArray(role.permissions) ? [...role.permissions] : []);
    setFormError('');
    setShowModal(true);
  };

  // Toggle permission in form
  const handleTogglePermission = (featId) => {
    setFormPermissions(prev => {
      if (prev.includes(featId)) {
        return prev.filter(p => p !== featId);
      } else {
        return [...prev, featId];
      }
    });
  };

  // Quick Select Helpers
  const handleSelectAll = () => {
    setFormPermissions([...ALL_FEATURE_IDS]);
  };

  const handleClearAll = () => {
    setFormPermissions([]);
  };

  const handleSelectPreset = (preset) => {
    if (preset === 'operations') {
      setFormPermissions(['orders', 'new-pos', 'crm', 'incidents']);
    } else if (preset === 'finance') {
      setFormPermissions(['orders', 'sales-reconciliation', 'gateway']);
    } else if (preset === 'management') {
      setFormPermissions(['orders', 'sales-reconciliation', 'crm', 'faq', 'services-pricing', 'postal-rates', 'incidents', 'new-pos']);
    }
  };

  // Handle Form Submit
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formName.trim()) {
      setFormError(isTh ? 'กรุณาระบุชื่อบทบาท (Role Name)' : 'Role name is required');
      return;
    }

    if (modalMode === 'create' && !formId.trim()) {
      setFormError(isTh ? 'กรุณาระบุรหัสระบุบทบาท (Role ID/Slug)' : 'Role Identifier is required');
      return;
    }

    if (formPermissions.length === 0) {
      setFormError(isTh ? 'กรุณาเลือกสิทธิ์เข้าถึงฟังก์ชันอย่างน้อย 1 รายการ' : 'Please select at least 1 feature permission');
      return;
    }

    setFormSubmitting(true);
    try {
      const headers = laundryStore.getAdminAuthHeaders();
      const url = modalMode === 'create' ? '/api/admin/roles' : `/api/admin/roles/${selectedRole.id}`;
      const method = modalMode === 'create' ? 'POST' : 'PUT';

      const payload = {
        name: formName.trim(),
        nameTh: (formNameTh || formName).trim(),
        description: formDesc.trim(),
        descriptionTh: (formDescTh || formDesc).trim(),
        color: formColor,
        permissions: formPermissions
      };

      if (modalMode === 'create') {
        payload.id = formId.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_');
      }

      const res = await fetch(url, {
        method,
        headers,
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to save role');
      }

      await fetchRoles();
      setShowModal(false);
    } catch (err) {
      setFormError(err.message || 'Error saving role');
    } finally {
      setFormSubmitting(false);
    }
  };

  // Delete Role Confirm
  const openDeleteConfirm = (role) => {
    setRoleToDelete(role);
    setDeleteError('');
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!roleToDelete) return;
    setDeleteSubmitting(true);
    setDeleteError('');

    try {
      const headers = laundryStore.getAdminAuthHeaders();
      const res = await fetch(`/api/admin/roles/${roleToDelete.id}`, {
        method: 'DELETE',
        headers
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to delete role');
      }

      await fetchRoles();
      setShowDeleteModal(false);
      setRoleToDelete(null);
    } catch (err) {
      setDeleteError(err.message || 'Error deleting role');
    } finally {
      setDeleteSubmitting(false);
    }
  };

  // Color helper
  const getColorClasses = (colorName) => {
    switch (colorName) {
      case 'purple':
        return { bg: 'bg-purple-50 text-purple-700 border-purple-200', dot: 'bg-purple-500' };
      case 'sky':
        return { bg: 'bg-sky-50 text-sky-700 border-sky-200', dot: 'bg-sky-500' };
      case 'teal':
        return { bg: 'bg-teal-50 text-teal-700 border-teal-200', dot: 'bg-teal-500' };
      case 'amber':
        return { bg: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500' };
      case 'emerald':
        return { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' };
      case 'rose':
        return { bg: 'bg-rose-50 text-rose-700 border-rose-200', dot: 'bg-rose-500' };
      default:
        return { bg: 'bg-indigo-50 text-indigo-700 border-indigo-200', dot: 'bg-indigo-500' };
    }
  };

  // Filtered Roles
  const filteredRoles = roles.filter(r => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      (r.name && r.name.toLowerCase().includes(q)) ||
      (r.nameTh && r.nameTh.toLowerCase().includes(q)) ||
      (r.id && r.id.toLowerCase().includes(q)) ||
      (r.description && r.description.toLowerCase().includes(q))
    );
  });

  const systemRolesCount = roles.filter(r => r.isSystem || r.id === 'super_admin').length;
  const customRolesCount = roles.length - systemRolesCount;

  return (
    <div className="space-y-6">
      {/* Top Banner & KPI Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-lg bg-indigo-100 text-indigo-700 text-[11px] font-bold uppercase tracking-wider">
              {isTh ? 'ระบบสิทธิ์การเข้าถึงแบบกำหนดเอง' : 'Role-Based Access Control'}
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span className="text-xs font-semibold text-slate-500">
              {roles.length} {isTh ? 'บทบาทในระบบ' : 'Total Roles'} ({customRolesCount} {isTh ? 'สร้างเอง' : 'Custom'})
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
            {isTh ? 'บทบาทและสิทธิ์การใช้งาน (Custom Roles & Feature Access)' : 'Custom Roles & Feature Permissions'}
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            {isTh
              ? 'สร้างบทบาทเฉพาะของร้านคุณ และกำหนดว่าแต่ละบทบาทหรือพนักงานแต่ละคนสามารถเข้าใช้งานฟังก์ชันใดในระบบหลังบ้านได้บ้าง'
              : 'Define custom staff roles and configure exactly which back-office features (Orders, POS, CRM, Financials, Settings) each role can access.'}
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/20 flex items-center gap-2 transition shrink-0"
        >
          <Icon name="plus" className="w-4 h-4" />
          <span>{isTh ? '+ สร้างบทบาทใหม่ (Custom Role)' : '+ Create Custom Role'}</span>
        </button>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-lg">
            🔑
          </div>
          <div>
            <div className="text-[11px] font-bold uppercase text-slate-400">
              {isTh ? 'บทบาททั้งหมด' : 'Total Roles'}
            </div>
            <div className="text-xl font-black text-slate-900">{roles.length}</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-lg">
            🛡️
          </div>
          <div>
            <div className="text-[11px] font-bold uppercase text-slate-400">
              {isTh ? 'บทบาทระบบ' : 'System Roles'}
            </div>
            <div className="text-xl font-black text-slate-900">{systemRolesCount}</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-lg">
            ✨
          </div>
          <div>
            <div className="text-[11px] font-bold uppercase text-slate-400">
              {isTh ? 'บทบาทกำหนดเอง' : 'Custom Roles'}
            </div>
            <div className="text-xl font-black text-emerald-700">{customRolesCount}</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold text-lg">
            👥
          </div>
          <div>
            <div className="text-[11px] font-bold uppercase text-slate-400">
              {isTh ? 'บัญชีพนักงาน' : 'Active Staff'}
            </div>
            <div className="text-xl font-black text-slate-900">{staffUsers.length}</div>
          </div>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Icon name="search" className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder={isTh ? 'ค้นหาบทบาท หรือคำอธิบาย...' : 'Search roles or features...'}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-slate-50/50"
          />
        </div>

        <div className="text-xs font-semibold text-slate-500">
          {isTh ? 'แสดง' : 'Showing'} {filteredRoles.length} {isTh ? 'บทบาท' : 'roles'}
        </div>
      </div>

      {/* Roles Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {loading ? (
          <div className="col-span-full py-12 text-center text-slate-400">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-2"></div>
            <div>{isTh ? 'กำลังโหลดบทบาทสิทธิ์...' : 'Loading roles and permissions...'}</div>
          </div>
        ) : filteredRoles.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-400 bg-white rounded-3xl border border-slate-200">
            <p className="text-sm font-bold text-slate-600">
              {isTh ? 'ไม่พบบทบาทที่ตรงกับการค้นหา' : 'No roles found matching your search.'}
            </p>
          </div>
        ) : (
          filteredRoles.map((role) => {
            const isSystem = role.isSystem || role.id === 'super_admin';
            const rolePerms = Array.isArray(role.permissions) ? role.permissions : [];
            const roleUsers = staffUsers.filter(u => u.role === role.id);
            const colorMeta = getColorClasses(role.color);

            return (
              <div
                key={role.id}
                className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs hover:shadow-md transition flex flex-col justify-between space-y-4"
              >
                <div>
                  {/* Top Bar: Badge, Key, Actions */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className={`px-2.5 py-1 rounded-xl text-xs font-black border flex items-center gap-1.5 ${colorMeta.bg}`}>
                        <span className={`w-2 h-2 rounded-full ${colorMeta.dot}`}></span>
                        <span>{isTh && role.nameTh ? role.nameTh : role.name}</span>
                      </div>

                      {isSystem ? (
                        <span className="px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 text-[10px] font-bold border border-purple-200 flex items-center gap-1">
                          <Icon name="lock" className="w-3 h-3" />
                          <span>{isTh ? 'บทบาทระบบ' : 'System'}</span>
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-200 flex items-center gap-1">
                          <Icon name="sparkles" className="w-3 h-3" />
                          <span>{isTh ? 'กำหนดเอง' : 'Custom'}</span>
                        </span>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleDuplicateRole(role)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition border border-transparent"
                        title={isTh ? 'คัดลอกบทบาทนี้' : 'Duplicate Role Template'}
                      >
                        <Icon name="copy" className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => openEditModal(role)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition border border-transparent hover:border-indigo-200"
                        title={isTh ? 'แก้ไขบทบาทและฟังก์ชัน' : 'Edit Role & Features'}
                      >
                        <Icon name="edit" className="w-4 h-4" />
                      </button>

                      {!isSystem && (
                        <button
                          onClick={() => openDeleteConfirm(role)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition border border-transparent hover:border-rose-200"
                          title={isTh ? 'ลบบทบาทนี้' : 'Delete Custom Role'}
                        >
                          <Icon name="trash" className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Role ID & Name Subtitle */}
                  <div className="mt-2.5 flex items-center gap-2">
                    <span className="text-[11px] font-mono text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                      ID: {role.id}
                    </span>
                    {isTh && role.nameTh && role.name !== role.nameTh && (
                      <span className="text-xs text-slate-500">
                        ({role.name})
                      </span>
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-600 mt-2 line-clamp-2">
                    {isTh && role.descriptionTh ? role.descriptionTh : role.description}
                  </p>

                  {/* Assigned Members */}
                  <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-medium">
                      {isTh ? 'ผู้ใช้งานที่ได้รับบทบาทนี้:' : 'Assigned Team Members:'}
                    </span>
                    <span className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-lg">
                      {roleUsers.length} {isTh ? 'คน' : 'user(s)'}
                    </span>
                  </div>
                </div>

                {/* Granted Feature Badges */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
                    <span>{isTh ? 'ฟังก์ชันที่เข้าถึงได้' : 'Accessible Features'}</span>
                    <span className="text-indigo-600 font-mono">
                      {role.id === 'super_admin' ? '11/11' : `${rolePerms.length}/${ALL_FEATURE_IDS.length}`}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {role.id === 'super_admin' ? (
                      <span className="px-2 py-1 rounded-lg bg-purple-50 text-purple-800 border border-purple-200 text-[11px] font-bold flex items-center gap-1.5">
                        <Icon name="check" className="w-3 h-3 text-purple-600" />
                        <span>{isTh ? 'เข้าถึงได้ทุกฟังก์ชัน (Full Unrestricted Access)' : 'Full Unrestricted Access (All 11 Features)'}</span>
                      </span>
                    ) : (
                      BACKOFFICE_FEATURES.map(feat => {
                        const isGranted = rolePerms.includes(feat.id);
                        if (!isGranted) return null;
                        return (
                          <span
                            key={feat.id}
                            className="px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1"
                            title={isTh ? feat.descriptionTh : feat.description}
                          >
                            <Icon name={feat.icon} className="w-3 h-3 text-slate-500" />
                            <span>{isTh ? feat.labelTh : feat.label}</span>
                          </span>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ==================== MODAL: CREATE / EDIT ROLE ==================== */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-100 space-y-4 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
              <div>
                <h3 className="text-base font-black text-slate-900">
                  {modalMode === 'create'
                    ? (isTh ? 'สร้างบทบาทใหม่ (Create Custom Role)' : 'Create Custom Role')
                    : (isTh ? `แก้ไขบทบาท: ${formName}` : `Edit Role: ${formName}`)}
                </h3>
                <p className="text-xs text-slate-500">
                  {isTh
                    ? 'กำหนดชื่อบทบาท สีประจำบทบาท และเลือกฟังก์ชันที่อนุญาตให้เข้าใช้งาน'
                    : 'Configure role name, badge color, and permitted back-office features.'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="p-1 text-slate-400 hover:text-slate-800"
              >
                <Icon name="x" className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold shrink-0">
                ⚠️ {formError}
              </div>
            )}

            {/* Modal Form Scroll Area */}
            <form onSubmit={handleFormSubmit} className="space-y-4 overflow-y-auto pr-1 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {isTh ? 'ชื่อบทบาท (English) *' : 'Role Name (English) *'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Quality Inspector, Night Cashier"
                    value={formName}
                    onChange={(e) => {
                      setFormName(e.target.value);
                      if (modalMode === 'create' && !formId) {
                        setFormId(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '_'));
                      }
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {isTh ? 'ชื่อบทบาทภาษาไทย (Thai Name)' : 'Role Name (Thai)'}
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. เจ้าหน้าที่ตรวจสอบผ้า, แคชเชียร์กะดึก"
                    value={formNameTh}
                    onChange={(e) => setFormNameTh(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {isTh ? 'รหัสระบุบทบาท (Role ID/Slug) *' : 'Role Identifier (Slug) *'}
                  </label>
                  <input
                    type="text"
                    required
                    disabled={modalMode === 'edit'}
                    placeholder="e.g. night_cashier"
                    value={formId}
                    onChange={(e) => setFormId(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '_'))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono disabled:bg-slate-100 disabled:text-slate-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {isTh ? 'สีธีมประจำบทบาท' : 'Badge Color Theme'}
                  </label>
                  <select
                    value={formColor}
                    onChange={(e) => setFormColor(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-bold"
                  >
                    <option value="indigo">🟣 Indigo (ค่าเริ่มต้น)</option>
                    <option value="sky">🔵 Sky Blue</option>
                    <option value="teal">🟢 Teal Operations</option>
                    <option value="emerald">🌿 Emerald Finance</option>
                    <option value="amber">🟠 Amber Logistics</option>
                    <option value="purple">👑 Royal Purple</option>
                    <option value="rose">🔴 Rose Alert</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {isTh ? 'คำอธิบายหน้าที่ความรับผิดชอบ' : 'Role Description'}
                </label>
                <textarea
                  rows="2"
                  placeholder="e.g. Responsible for inspecting garments, weighing loads, and resolving stain issues..."
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                ></textarea>
              </div>

              {/* Feature Permissions Checkbox Matrix */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <label className="block font-black text-slate-900 text-sm">
                      {isTh ? 'กำหนดสิทธิ์การเข้าถึงฟังก์ชัน (Feature Permissions) *' : 'Feature Access Permissions *'}
                    </label>
                    <p className="text-[11px] text-slate-500">
                      {isTh
                        ? `เลือกฟังก์ชันที่ต้องการให้บทบาทนี้เข้าถึงได้ (เลือกแล้ว ${formPermissions.length} จาก 11 รายการ)`
                        : `Check the features this role is authorized to access (${formPermissions.length} of 11 selected)`}
                    </p>
                  </div>

                  {/* Preset Buttons */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    <button
                      type="button"
                      onClick={handleSelectAll}
                      className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold"
                    >
                      {isTh ? 'เลือกทั้งหมด' : 'Select All'}
                    </button>
                    <button
                      type="button"
                      onClick={handleClearAll}
                      className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold"
                    >
                      {isTh ? 'ล้างทั้งหมด' : 'Clear All'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSelectPreset('operations')}
                      className="px-2 py-1 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-700 text-[10px] font-bold"
                    >
                      {isTh ? 'ชุดหน้าร้าน' : 'Operations Preset'}
                    </button>
                  </div>
                </div>

                {/* Feature Checklist Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  {BACKOFFICE_FEATURES.map((feat) => {
                    const isChecked = formPermissions.includes(feat.id);
                    return (
                      <div
                        key={feat.id}
                        onClick={() => handleTogglePermission(feat.id)}
                        className={`p-3 rounded-2xl border transition cursor-pointer flex items-start gap-3 ${
                          isChecked
                            ? 'bg-indigo-50/70 border-indigo-300 ring-1 ring-indigo-200'
                            : 'bg-white border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}} // handled by wrapper
                          className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 font-bold text-slate-900 text-xs">
                            <Icon name={feat.icon} className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                            <span className="truncate">{isTh ? feat.labelTh : feat.label}</span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5 leading-snug line-clamp-2">
                            {isTh ? feat.descriptionTh : feat.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Modal Actions */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition"
                >
                  {isTh ? 'ยกเลิก' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold shadow-md shadow-indigo-600/20 transition flex items-center gap-2"
                >
                  {formSubmitting && <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                  <span>{formSubmitting ? (isTh ? 'กำลังบันทึก...' : 'Saving...') : (isTh ? 'บันทึกบทบาท' : 'Save Role')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== MODAL: DELETE ROLE CONFIRMATION ==================== */}
      {showDeleteModal && roleToDelete && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 space-y-4 text-center">
            <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto">
              <Icon name="trash" className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-base font-black text-slate-900">
                {isTh ? 'ยืนยันการลบบทบาท' : 'Confirm Delete Role'}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {isTh
                  ? `คุณต้องการลบบทบาท "${roleToDelete.name}" (@${roleToDelete.id}) หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้`
                  : `Are you sure you want to delete the role "${roleToDelete.name}" (@${roleToDelete.id})? This action cannot be undone.`}
              </p>
            </div>

            {deleteError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold text-left">
                ⚠️ {deleteError}
              </div>
            )}

            <div className="pt-2 flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition text-xs"
              >
                {isTh ? 'ยกเลิก' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={deleteSubmitting}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold shadow-md shadow-rose-600/20 transition text-xs"
              >
                {deleteSubmitting ? (isTh ? 'กำลังลบ...' : 'Deleting...') : (isTh ? 'ยืนยันลบ' : 'Confirm Delete')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
