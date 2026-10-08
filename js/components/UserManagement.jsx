import React, { useState, useEffect } from 'react';
import { Icon } from './Icons.jsx';
import { laundryStore } from '../store.js';
import { useTranslation } from '../i18n.jsx';

export function UserManagement({
  adminUser,
  onSelectCustomer,
  onCreateManualOrder,
  onNavigateToTab
}) {
  const { language } = useTranslation();
  const isTh = language === 'th';

  // Sub-tabs: 'staff' (Admin & Back-Office Users) vs 'customers' (Client Accounts)
  const [activeSubTab, setActiveSubTab] = useState('staff');

  // Staff state
  const [staffUsers, setStaffUsers] = useState([]);
  const [staffLoading, setStaffLoading] = useState(true);
  const [staffError, setStaffError] = useState('');
  const [staffSearch, setStaffSearch] = useState('');
  const [staffRoleFilter, setStaffRoleFilter] = useState('ALL');
  const [staffStatusFilter, setStaffStatusFilter] = useState('ALL');

  // Modals for Staff
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);
  const [showEditStaffModal, setShowEditStaffModal] = useState(false);
  const [showResetPwdModal, setShowResetPwdModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedStaffUser, setSelectedStaffUser] = useState(null);

  // Add Staff Form fields
  const [newUsername, setNewUsername] = useState('');
  const [newFullName, setNewFullName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newRole, setNewRole] = useState('staff');
  const [newStatus, setNewStatus] = useState('active');
  const [newPassword, setNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [addStaffSubmitting, setAddStaffSubmitting] = useState(false);
  const [addStaffError, setAddStaffError] = useState('');

  // Edit Staff Form fields
  const [editFullName, setEditFullName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editRole, setEditRole] = useState('staff');
  const [editStatus, setEditStatus] = useState('active');
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editError, setEditError] = useState('');

  // Reset Password fields
  const [resetPwdInput, setResetPwdInput] = useState('');
  const [resetPwdSubmitting, setResetPwdSubmitting] = useState(false);
  const [resetPwdError, setResetPwdError] = useState('');
  const [resetPwdSuccess, setResetPwdSuccess] = useState('');

  // Self change password
  const [currentMyPwd, setCurrentMyPwd] = useState('');
  const [newMyPwd, setNewMyPwd] = useState('');
  const [confirmMyPwd, setConfirmMyPwd] = useState('');
  const [myPwdLoading, setMyPwdLoading] = useState(false);
  const [myPwdMsg, setMyPwdMsg] = useState({ text: '', type: '' });

  // Customer sub-tab state
  const [customers, setCustomers] = useState(() => laundryStore.getEnrichedCustomers ? laundryStore.getEnrichedCustomers() : (laundryStore.customers || []));
  const [customerSearch, setCustomerSearch] = useState('');
  const [customerTierFilter, setCustomerTierFilter] = useState('ALL');

  // Load Staff users from API
  const fetchStaffUsers = async () => {
    setStaffLoading(true);
    setStaffError('');
    try {
      const headers = laundryStore.getAdminAuthHeaders();
      const res = await fetch('/api/admin/users', { headers });
      if (!res.ok) {
        throw new Error(`HTTP error ${res.status}`);
      }
      const data = await res.json();
      if (data && data.users) {
        setStaffUsers(data.users);
      }
    } catch (err) {
      console.warn('Could not fetch /api/admin/users from server:', err.message);
      // Fallback local list
      setStaffUsers([
        {
          id: 1,
          username: adminUser?.username || 'admin',
          fullName: 'Master Administrator',
          email: 'admin@nonamelaundry.com',
          phone: '+66 81 234 5678',
          role: 'super_admin',
          status: 'active',
          createdAt: new Date().toISOString()
        },
        {
          id: 2,
          username: 'sukhumvit_mgr',
          fullName: 'Somchai Prasert (Sukhumvit Branch Manager)',
          email: 'manager.sukhumvit@nonamelaundry.com',
          phone: '+66 89 876 5432',
          role: 'manager',
          status: 'active',
          createdAt: new Date(Date.now() - 86400000 * 7).toISOString()
        },
        {
          id: 3,
          username: 'pos_operator1',
          fullName: 'Anong Srisawat (POS Cashier & Intake)',
          email: 'staff.asoke@nonamelaundry.com',
          phone: '+66 82 345 6789',
          role: 'staff',
          status: 'active',
          createdAt: new Date(Date.now() - 86400000 * 14).toISOString()
        },
        {
          id: 4,
          username: 'rider_sompong',
          fullName: 'Sompong Jaidee (Bangkok Express Rider)',
          email: 'rider.bkk@nonamelaundry.com',
          phone: '+66 91 123 4567',
          role: 'rider',
          status: 'active',
          createdAt: new Date(Date.now() - 86400000 * 20).toISOString()
        }
      ]);
    } finally {
      setStaffLoading(false);
    }
  };

  useEffect(() => {
    fetchStaffUsers();
  }, []);

  // Sync customer state with store
  useEffect(() => {
    const updateCusts = () => {
      setCustomers(laundryStore.getEnrichedCustomers ? laundryStore.getEnrichedCustomers() : (laundryStore.customers || []));
    };
    const unsubscribe = laundryStore.subscribe ? laundryStore.subscribe(updateCusts) : () => {};
    return () => unsubscribe();
  }, []);

  // Handle Add Staff
  const handleAddStaffSubmit = async (e) => {
    e.preventDefault();
    setAddStaffError('');
    if (!newUsername.trim()) {
      setAddStaffError(isTh ? 'กรุณากรอกชื่อผู้ใช้ (Username)' : 'Username is required');
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setAddStaffError(isTh ? 'รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร' : 'Password must be at least 6 characters');
      return;
    }

    setAddStaffSubmitting(true);
    try {
      const headers = laundryStore.getAdminAuthHeaders();
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          username: newUsername.trim(),
          fullName: newFullName.trim() || newUsername.trim(),
          email: newEmail.trim(),
          phone: newPhone.trim(),
          role: newRole,
          status: newStatus,
          password: newPassword
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to create user');
      }

      // Add to list
      setStaffUsers(prev => [...prev, data.user]);
      setShowAddStaffModal(false);
      setNewUsername('');
      setNewFullName('');
      setNewEmail('');
      setNewPhone('');
      setNewRole('staff');
      setNewStatus('active');
      setNewPassword('');
    } catch (err) {
      setAddStaffError(err.message || 'Error creating user');
    } finally {
      setAddStaffSubmitting(false);
    }
  };

  // Open Edit Modal
  const openEditStaff = (user) => {
    setSelectedStaffUser(user);
    setEditFullName(user.fullName || user.username);
    setEditEmail(user.email || '');
    setEditPhone(user.phone || '');
    setEditRole(user.role || 'staff');
    setEditStatus(user.status || 'active');
    setEditError('');
    setShowEditStaffModal(true);
  };

  // Handle Edit Submit
  const handleEditStaffSubmit = async (e) => {
    e.preventDefault();
    if (!selectedStaffUser) return;
    setEditError('');
    setEditSubmitting(true);

    try {
      const headers = laundryStore.getAdminAuthHeaders();
      const res = await fetch(`/api/admin/users/${selectedStaffUser.id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          fullName: editFullName.trim(),
          email: editEmail.trim(),
          phone: editPhone.trim(),
          role: editRole,
          status: editStatus
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to update user');
      }

      setStaffUsers(prev => prev.map(u => u.id === selectedStaffUser.id ? { ...u, ...data.user } : u));
      setShowEditStaffModal(false);
    } catch (err) {
      setEditError(err.message || 'Error updating user');
    } finally {
      setEditSubmitting(false);
    }
  };

  // Open Reset Password Modal
  const openResetPwd = (user) => {
    setSelectedStaffUser(user);
    setResetPwdInput('');
    setResetPwdError('');
    setResetPwdSuccess('');
    setShowResetPwdModal(true);
  };

  // Handle Reset Password Submit
  const handleResetPwdSubmit = async (e) => {
    e.preventDefault();
    if (!selectedStaffUser) return;
    if (!resetPwdInput || resetPwdInput.length < 6) {
      setResetPwdError(isTh ? 'รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 6 ตัวอักษร' : 'New password must be at least 6 characters');
      return;
    }

    setResetPwdSubmitting(true);
    setResetPwdError('');
    try {
      const headers = laundryStore.getAdminAuthHeaders();
      const res = await fetch(`/api/admin/users/${selectedStaffUser.id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          password: resetPwdInput
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to reset password');
      }

      setResetPwdSuccess(isTh ? 'รีเซ็ตรหัสผ่านเรียบร้อยแล้ว!' : 'Password reset successfully!');
      setTimeout(() => {
        setShowResetPwdModal(false);
        setResetPwdSuccess('');
      }, 1500);
    } catch (err) {
      setResetPwdError(err.message || 'Error resetting password');
    } finally {
      setResetPwdSubmitting(false);
    }
  };

  // Open Delete Modal
  const openDeleteModal = (user) => {
    setSelectedStaffUser(user);
    setShowDeleteModal(true);
  };

  // Confirm Delete
  const handleConfirmDelete = async () => {
    if (!selectedStaffUser) return;
    try {
      const headers = laundryStore.getAdminAuthHeaders();
      const res = await fetch(`/api/admin/users/${selectedStaffUser.id}`, {
        method: 'DELETE',
        headers
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to delete user');
      }

      setStaffUsers(prev => prev.filter(u => u.id !== selectedStaffUser.id));
      setShowDeleteModal(false);
    } catch (err) {
      alert(err.message || 'Failed to delete user');
    }
  };

  // Toggle user active status quickly
  const handleToggleStatus = async (user) => {
    const nextStatus = user.status === 'active' ? 'suspended' : 'active';
    try {
      const headers = laundryStore.getAdminAuthHeaders();
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ status: nextStatus })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setStaffUsers(prev => prev.map(u => u.id === user.id ? { ...u, status: nextStatus } : u));
      }
    } catch (err) {
      console.warn('Status toggle error:', err);
    }
  };

  // Self Admin Change Password
  const handleSelfChangePassword = async (e) => {
    e.preventDefault();
    setMyPwdMsg({ text: '', type: '' });

    if (newMyPwd !== confirmMyPwd) {
      setMyPwdMsg({ text: isTh ? 'รหัสผ่านใหม่ทั้งสองช่องไม่ตรงกัน' : 'New passwords do not match.', type: 'error' });
      return;
    }
    if (newMyPwd.length < 6) {
      setMyPwdMsg({ text: isTh ? 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร' : 'New password must be at least 6 characters.', type: 'error' });
      return;
    }

    setMyPwdLoading(true);
    try {
      const headers = laundryStore.getAdminAuthHeaders();
      const res = await fetch('/api/admin/change-password', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          currentPassword: currentMyPwd,
          newPassword: newMyPwd
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to update password');
      }

      setMyPwdMsg({
        text: isTh ? 'เปลี่ยนรหัสผ่านของคุณเรียบร้อยแล้ว!' : 'Your password was updated successfully!',
        type: 'success'
      });
      setCurrentMyPwd('');
      setNewMyPwd('');
      setConfirmMyPwd('');
    } catch (err) {
      setMyPwdMsg({ text: err.message || 'Error updating password', type: 'error' });
    } finally {
      setMyPwdLoading(false);
    }
  };

  // Role helper badge
  const getRoleBadge = (role) => {
    switch (role) {
      case 'super_admin':
      case 'admin':
        return {
          label: isTh ? 'ผู้ดูแลระบบสูงสุด' : 'Super Admin',
          color: 'bg-purple-100 text-purple-800 border-purple-200',
          icon: 'shield'
        };
      case 'manager':
        return {
          label: isTh ? 'ผู้จัดการสาขา' : 'Store Manager',
          color: 'bg-sky-100 text-sky-800 border-sky-200',
          icon: 'layers'
        };
      case 'staff':
      case 'operator':
        return {
          label: isTh ? 'พนักงานประจำจุด' : 'Operations / Cashier',
          color: 'bg-teal-100 text-teal-800 border-teal-200',
          icon: 'receipt'
        };
      case 'rider':
      case 'driver':
        return {
          label: isTh ? 'พนักงานจัดส่ง / ไรเดอร์' : 'Express Rider',
          color: 'bg-amber-100 text-amber-800 border-amber-200',
          icon: 'truck'
        };
      default:
        return {
          label: role,
          color: 'bg-slate-100 text-slate-800 border-slate-200',
          icon: 'user'
        };
    }
  };

  // Filtered staff
  const filteredStaff = staffUsers.filter(u => {
    const matchesSearch = !staffSearch ||
      (u.username && u.username.toLowerCase().includes(staffSearch.toLowerCase())) ||
      (u.fullName && u.fullName.toLowerCase().includes(staffSearch.toLowerCase())) ||
      (u.email && u.email.toLowerCase().includes(staffSearch.toLowerCase())) ||
      (u.phone && u.phone.includes(staffSearch));

    const matchesRole = staffRoleFilter === 'ALL' || u.role === staffRoleFilter;
    const matchesStatus = staffStatusFilter === 'ALL' || u.status === staffStatusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  // Filtered customers
  const filteredCustomers = customers.filter(c => {
    const matchesSearch = !customerSearch ||
      (c.fullName && c.fullName.toLowerCase().includes(customerSearch.toLowerCase())) ||
      (c.nickName && c.nickName.toLowerCase().includes(customerSearch.toLowerCase())) ||
      (c.mobileNumber && c.mobileNumber.includes(customerSearch)) ||
      (c.lineId && c.lineId.toLowerCase().includes(customerSearch.toLowerCase())) ||
      (c.addresses && c.addresses.some(a => (a.addressLine || '').toLowerCase().includes(customerSearch.toLowerCase())));

    const matchesTier = customerTierFilter === 'ALL' || c.tier === customerTierFilter;

    return matchesSearch && matchesTier;
  });

  // Count stats
  const adminCount = staffUsers.filter(u => u.role === 'admin' || u.role === 'super_admin').length;
  const managerCount = staffUsers.filter(u => u.role === 'manager').length;
  const staffCount = staffUsers.filter(u => u.role === 'staff' || u.role === 'operator').length;
  const riderCount = staffUsers.filter(u => u.role === 'rider' || u.role === 'driver').length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-lg bg-sky-100 text-sky-700 text-[11px] font-bold uppercase tracking-wider">
              {isTh ? 'ระบบจัดการสิทธิ์และผู้ใช้งาน' : 'User & Access Control'}
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span className="text-xs font-semibold text-slate-500">
              {staffUsers.length} {isTh ? 'บัญชีเจ้าหน้าที่' : 'Staff Accounts'} • {customers.length} {isTh ? 'บัญชีลูกค้า' : 'Client Accounts'}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
            {isTh ? 'การจัดการผู้ใช้งาน (User Management)' : 'User Management'}
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            {isTh
              ? 'จัดการบัญชีเจ้าหน้าที่ (ผู้ดูแลระบบ, ผู้จัดการร้าน, พนักงานแคชเชียร์, ไรเดอร์) กำหนดบทบาท และตรวจสอบบัญชีลูกค้าที่ลงทะเบียนในระบบ'
              : 'Manage back-office team accounts (Super Admins, Store Managers, POS Staff, Delivery Riders) and oversee registered client accounts with role permissions and security controls.'}
          </p>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-2">
          {activeSubTab === 'staff' ? (
            <button
              onClick={() => {
                setAddStaffError('');
                setShowAddStaffModal(true);
              }}
              className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-md shadow-sky-600/20 flex items-center gap-2 transition"
            >
              <Icon name="userPlus" className="w-4 h-4" />
              <span>{isTh ? '+ เพิ่มเจ้าหน้าที่ใหม่' : '+ Add New Staff User'}</span>
            </button>
          ) : (
            <button
              onClick={() => {
                if (onNavigateToTab) onNavigateToTab('crm');
              }}
              className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-md flex items-center gap-2 transition"
            >
              <Icon name="users" className="w-4 h-4" />
              <span>{isTh ? 'เปิดดู CRM ลูกค้าแบบละเอียด' : 'Open Full Customer CRM'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Sub-Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveSubTab('staff')}
          className={`px-4 py-2.5 text-xs font-bold rounded-xl transition flex items-center gap-2 ${
            activeSubTab === 'staff'
              ? 'bg-sky-600 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Icon name="shield" className="w-4 h-4" />
          <span>{isTh ? 'ทีมงานและเจ้าหน้าที่ (Admin & Staff)' : 'Staff & Admin Accounts'}</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
            activeSubTab === 'staff' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
          }`}>
            {staffUsers.length}
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('customers')}
          className={`px-4 py-2.5 text-xs font-bold rounded-xl transition flex items-center gap-2 ${
            activeSubTab === 'customers'
              ? 'bg-sky-600 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Icon name="users" className="w-4 h-4" />
          <span>{isTh ? 'บัญชีลูกค้า (Registered Customers)' : 'Customer Accounts'}</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
            activeSubTab === 'customers' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
          }`}>
            {customers.length}
          </span>
        </button>
      </div>

      {/* ==================== SUB-TAB 1: STAFF & ADMIN USERS ==================== */}
      {activeSubTab === 'staff' && (
        <div className="space-y-6">
          {/* KPI Role Chips */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-lg">
                👑
              </div>
              <div>
                <div className="text-[11px] font-bold uppercase text-slate-400">
                  {isTh ? 'ผู้ดูแลระบบ' : 'Super Admins'}
                </div>
                <div className="text-xl font-black text-slate-900">{adminCount}</div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold text-lg">
                🏬
              </div>
              <div>
                <div className="text-[11px] font-bold uppercase text-slate-400">
                  {isTh ? 'ผู้จัดการร้าน' : 'Store Managers'}
                </div>
                <div className="text-xl font-black text-slate-900">{managerCount}</div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold text-lg">
                👔
              </div>
              <div>
                <div className="text-[11px] font-bold uppercase text-slate-400">
                  {isTh ? 'พนักงานหน้าร้าน' : 'Operations Staff'}
                </div>
                <div className="text-xl font-black text-slate-900">{staffCount}</div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-lg">
                🛵
              </div>
              <div>
                <div className="text-[11px] font-bold uppercase text-slate-400">
                  {isTh ? 'พนักงานขับรถ' : 'Express Riders'}
                </div>
                <div className="text-xl font-black text-slate-900">{riderCount}</div>
              </div>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Icon name="search" className="w-4 h-4" />
              </span>
              <input
                type="text"
                placeholder={isTh ? 'ค้นหาชื่อ, อีเมล, ชื่อผู้ใช้, เบอร์โทร...' : 'Search by name, email, username, phone...'}
                value={staffSearch}
                onChange={(e) => setStaffSearch(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={staffRoleFilter}
                onChange={(e) => setStaffRoleFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold bg-white text-slate-700"
              >
                <option value="ALL">{isTh ? 'ทุกลำดับขั้น (All Roles)' : 'All Roles'}</option>
                <option value="super_admin">{isTh ? '👑 ผู้ดูแลระบบสูงสุด (Super Admin)' : '👑 Super Admin'}</option>
                <option value="manager">{isTh ? '🏬 ผู้จัดการสาขา (Store Manager)' : '🏬 Store Manager'}</option>
                <option value="staff">{isTh ? '👔 พนักงานหน้าร้าน (Operations)' : '👔 Operations Staff'}</option>
                <option value="rider">{isTh ? '🛵 ไรเดอร์ส่งผ้า (Express Rider)' : '🛵 Express Rider'}</option>
              </select>

              <select
                value={staffStatusFilter}
                onChange={(e) => setStaffStatusFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold bg-white text-slate-700"
              >
                <option value="ALL">{isTh ? 'ทุกสถานะ (All Status)' : 'All Status'}</option>
                <option value="active">{isTh ? '🟢 ใช้งานได้ (Active)' : '🟢 Active'}</option>
                <option value="suspended">{isTh ? '🔴 ระงับชั่วคราว (Suspended)' : '🔴 Suspended'}</option>
              </select>
            </div>
          </div>

          {/* Staff Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase text-slate-500 tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">{isTh ? 'ผู้ใช้งาน / เจ้าหน้าที่' : 'User / Staff Member'}</th>
                    <th className="py-3.5 px-4">{isTh ? 'บทบาท / สิทธิ์' : 'Role & Permissions'}</th>
                    <th className="py-3.5 px-4">{isTh ? 'ข้อมูลติดต่อ' : 'Contact Channels'}</th>
                    <th className="py-3.5 px-4">{isTh ? 'สถานะบัญชี' : 'Account Status'}</th>
                    <th className="py-3.5 px-4 text-right">{isTh ? 'การจัดการ' : 'Actions'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {staffLoading ? (
                    <tr>
                      <td colSpan="5" className="text-center py-8 text-slate-400">
                        <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-sky-600 mb-2"></div>
                        <div>{isTh ? 'กำลังโหลดข้อมูลผู้ใช้งาน...' : 'Loading staff accounts...'}</div>
                      </td>
                    </tr>
                  ) : filteredStaff.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="text-center py-8 text-slate-400">
                        {isTh ? 'ไม่พบข้อมูลผู้ใช้งานที่ตรงกับเงื่อนไข' : 'No staff members found matching your search.'}
                      </td>
                    </tr>
                  ) : (
                    filteredStaff.map((user) => {
                      const badge = getRoleBadge(user.role);
                      const isCurrentAdmin = adminUser && (adminUser.username === user.username || adminUser.id === user.id);

                      return (
                        <tr key={user.id} className="hover:bg-slate-50/70 transition">
                          {/* User Info */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                                {(user.fullName || user.username || 'U').charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                                  <span>{user.fullName || user.username}</span>
                                  {isCurrentAdmin && (
                                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                                      {isTh ? 'คุณ (You)' : 'You'}
                                    </span>
                                  )}
                                </div>
                                <div className="text-[11px] text-slate-400 font-mono">
                                  @{user.username}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Role Badge */}
                          <td className="py-3.5 px-4">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold border ${badge.color}`}>
                              <Icon name={badge.icon} className="w-3.5 h-3.5" />
                              <span>{badge.label}</span>
                            </span>
                          </td>

                          {/* Contact Info */}
                          <td className="py-3.5 px-4">
                            <div className="space-y-0.5">
                              {user.email && (
                                <div className="flex items-center gap-1.5 text-slate-700">
                                  <Icon name="mail" className="w-3.5 h-3.5 text-slate-400" />
                                  <span>{user.email}</span>
                                </div>
                              )}
                              {user.phone && (
                                <div className="flex items-center gap-1.5 text-slate-700 font-mono text-[11px]">
                                  <Icon name="whatsapp" className="w-3.5 h-3.5 text-emerald-500" />
                                  <span>{user.phone}</span>
                                </div>
                              )}
                              {!user.email && !user.phone && (
                                <span className="text-slate-400 italic text-[11px]">-</span>
                              )}
                            </div>
                          </td>

                          {/* Status */}
                          <td className="py-3.5 px-4">
                            <button
                              onClick={() => handleToggleStatus(user)}
                              disabled={isCurrentAdmin}
                              title={isCurrentAdmin ? 'Cannot suspend your own account' : 'Click to toggle status'}
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border transition ${
                                user.status === 'active'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                  : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                              } ${isCurrentAdmin ? 'cursor-default opacity-80' : 'cursor-pointer'}`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${user.status === 'active' ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                              <span>{user.status === 'active' ? (isTh ? 'ใช้งานปกติ' : 'Active') : (isTh ? 'ระงับชั่วคราว' : 'Suspended')}</span>
                            </button>
                          </td>

                          {/* Action Buttons */}
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => openEditStaff(user)}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-sky-600 hover:bg-sky-50 transition border border-transparent hover:border-sky-200"
                                title={isTh ? 'แก้ไขข้อมูล' : 'Edit User Profile'}
                              >
                                <Icon name="edit" className="w-4 h-4" />
                              </button>

                              <button
                                onClick={() => openResetPwd(user)}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 transition border border-transparent hover:border-amber-200"
                                title={isTh ? 'รีเซ็ตรหัสผ่าน' : 'Reset Password'}
                              >
                                <Icon name="lock" className="w-4 h-4" />
                              </button>

                              <button
                                onClick={() => openDeleteModal(user)}
                                disabled={isCurrentAdmin}
                                className={`p-1.5 rounded-lg transition border border-transparent ${
                                  isCurrentAdmin
                                    ? 'text-slate-300 cursor-not-allowed'
                                    : 'text-slate-500 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200'
                                }`}
                                title={isCurrentAdmin ? 'Cannot delete own account' : (isTh ? 'ลบบัญชี' : 'Delete User')}
                              >
                                <Icon name="trash" className="w-4 h-4" />
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

          {/* Quick Admin Self Password Change Card */}
          <div className="bg-slate-50 rounded-3xl p-6 border border-slate-200 shadow-xs">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold">
                <Icon name="lock" className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900">
                  {isTh ? 'เปลี่ยนรหัสผ่านผู้ดูแลระบบของคุณ (My Password)' : 'My Admin Account Security & Password'}
                </h3>
                <p className="text-xs text-slate-500">
                  {isTh
                    ? 'เปลี่ยนรหัสผ่านสำหรับบัญชีที่คุณกำลังใช้งานเพื่อความปลอดภัยสูงสุด'
                    : 'Update your personal administrator login password.'}
                </p>
              </div>
            </div>

            {myPwdMsg.text && (
              <div className={`p-3 rounded-xl mb-4 text-xs font-bold border ${
                myPwdMsg.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border-rose-200'
              }`}>
                {myPwdMsg.text}
              </div>
            )}

            <form onSubmit={handleSelfChangePassword} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  {isTh ? 'รหัสผ่านปัจจุบัน *' : 'Current Password *'}
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={currentMyPwd}
                  onChange={(e) => setCurrentMyPwd(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  {isTh ? 'รหัสผ่านใหม่ *' : 'New Password *'}
                </label>
                <input
                  type="password"
                  required
                  placeholder="Min 6 chars"
                  value={newMyPwd}
                  onChange={(e) => setNewMyPwd(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  {isTh ? 'ยืนยันรหัสผ่านใหม่ *' : 'Confirm New Password *'}
                </label>
                <input
                  type="password"
                  required
                  placeholder="Re-type new password"
                  value={confirmMyPwd}
                  onChange={(e) => setConfirmMyPwd(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white font-mono"
                />
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  disabled={myPwdLoading}
                  className="w-full py-2 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold text-xs shadow-md transition"
                >
                  {myPwdLoading ? (isTh ? 'กำลังบันทึก...' : 'Saving...') : (isTh ? 'อัปเดตรหัสผ่าน' : 'Update My Password')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== SUB-TAB 2: CUSTOMER ACCOUNTS ==================== */}
      {activeSubTab === 'customers' && (
        <div className="space-y-6">
          {/* Customer KPI Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold text-lg">
                👥
              </div>
              <div>
                <div className="text-[11px] font-bold uppercase text-slate-400">
                  {isTh ? 'ลูกค้าทั้งหมด' : 'Total Clients'}
                </div>
                <div className="text-xl font-black text-slate-900">{customers.length}</div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-lg">
                ⭐
              </div>
              <div>
                <div className="text-[11px] font-bold uppercase text-slate-400">
                  {isTh ? 'สมาชิก VIP' : 'VIP Members'}
                </div>
                <div className="text-xl font-black text-slate-900">
                  {customers.filter(c => c.tier === 'VIP' || c.tier === 'Gold').length}
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-lg">
                🧺
              </div>
              <div>
                <div className="text-[11px] font-bold uppercase text-slate-400">
                  {isTh ? 'ยอดสั่งรวมทั้งหมด' : 'Total Orders'}
                </div>
                <div className="text-xl font-black text-slate-900">
                  {customers.reduce((acc, c) => acc + (c.orderCount || 0), 0)}
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-lg">
                🏙️
              </div>
              <div>
                <div className="text-[11px] font-bold uppercase text-slate-400">
                  {isTh ? 'คอนโดที่ใช้บริการ' : 'Active Condos'}
                </div>
                <div className="text-xl font-black text-slate-900">
                  {new Set(customers.flatMap(c => (c.addresses || []).map(a => a.condoName || a.district)).filter(Boolean)).size || '12+'}
                </div>
              </div>
            </div>
          </div>

          {/* Customer Search & Filters */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Icon name="search" className="w-4 h-4" />
              </span>
              <input
                type="text"
                placeholder={isTh ? 'ค้นหาชื่อลูกค้า, เบอร์โทร, LINE ID, คอนโด...' : 'Search by name, phone, LINE ID, condo...'}
                value={customerSearch}
                onChange={(e) => setCustomerSearch(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={customerTierFilter}
                onChange={(e) => setCustomerTierFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold bg-white text-slate-700"
              >
                <option value="ALL">{isTh ? 'ทุกระดับสมาชิก (All Tiers)' : 'All Membership Tiers'}</option>
                <option value="VIP">⭐ VIP</option>
                <option value="Gold">🥇 Gold Member</option>
                <option value="Silver">🥈 Silver Member</option>
                <option value="Regular">Standard Member</option>
              </select>

              <button
                onClick={() => {
                  if (onNavigateToTab) onNavigateToTab('crm');
                }}
                className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center gap-1.5"
              >
                <Icon name="externalLink" className="w-3.5 h-3.5" />
                <span>{isTh ? 'ดู Customer CRM เต็มรูปแบบ' : 'Open Full CRM'}</span>
              </button>
            </div>
          </div>

          {/* Customer Accounts Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase text-slate-500 tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">{isTh ? 'ลูกค้า' : 'Customer Client'}</th>
                    <th className="py-3.5 px-4">{isTh ? 'เบอร์โทร & ช่องทาง' : 'Contact & Channels'}</th>
                    <th className="py-3.5 px-4">{isTh ? 'ที่อยู่ / คอนโด' : 'Condo / Delivery Address'}</th>
                    <th className="py-3.5 px-4">{isTh ? 'ระดับสมาชิก' : 'Tier'}</th>
                    <th className="py-3.5 px-4">{isTh ? 'ประวัติคำสั่งซื้อ' : 'Orders & Spend'}</th>
                    <th className="py-3.5 px-4 text-right">{isTh ? 'การจัดการ' : 'Actions'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredCustomers.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center py-8 text-slate-400">
                        {isTh ? 'ไม่พบข้อมูลลูกค้าที่ตรงกับเงื่อนไข' : 'No customers found matching your search.'}
                      </td>
                    </tr>
                  ) : (
                    filteredCustomers.map((c) => {
                      const primaryAddr = c.addresses?.find(a => a.isPrimary) || c.addresses?.[0];

                      return (
                        <tr key={c.id} className="hover:bg-slate-50/70 transition">
                          {/* Name & ID */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs">
                                {(c.fullName || 'C').charAt(0)}
                              </div>
                              <div>
                                <div className="font-bold text-slate-900">
                                  {c.fullName}
                                  {c.nickName && <span className="text-slate-400 font-normal ml-1">({c.nickName})</span>}
                                </div>
                                <div className="text-[10px] text-slate-400 font-mono">
                                  ID: {c.id}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Phone & LINE */}
                          <td className="py-3.5 px-4">
                            <div className="space-y-0.5">
                              <div className="font-mono text-slate-800 flex items-center gap-1.5">
                                <span>{c.mobileNumber}</span>
                                {c.isWhatsApp && (
                                  <span className="px-1 py-0.2 rounded text-[9px] font-bold bg-emerald-100 text-emerald-700">
                                    WA
                                  </span>
                                )}
                              </div>
                              {c.lineId && (
                                <div className="text-[11px] text-emerald-600 flex items-center gap-1">
                                  <span>LINE: {c.lineId}</span>
                                </div>
                              )}
                            </div>
                          </td>

                          {/* Address / Condo */}
                          <td className="py-3.5 px-4 max-w-xs truncate">
                            {primaryAddr ? (
                              <div>
                                <div className="font-bold text-slate-800 text-[11px] truncate">
                                  {primaryAddr.condoName || primaryAddr.addressLine || 'Bangkok Residence'}
                                </div>
                                <div className="text-[10px] text-slate-400">
                                  {primaryAddr.roomNumber ? `Room ${primaryAddr.roomNumber} • ` : ''}
                                  {primaryAddr.district || 'Bangkok'}
                                </div>
                              </div>
                            ) : (
                              <span className="text-slate-400 italic text-[11px]">{isTh ? 'ยังไม่มีที่อยู่' : 'No address set'}</span>
                            )}
                          </td>

                          {/* Tier */}
                          <td className="py-3.5 px-4">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              c.tier === 'VIP' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                              c.tier === 'Gold' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
                              'bg-slate-100 text-slate-700 border border-slate-200'
                            }`}>
                              {c.tier || 'Regular'}
                            </span>
                          </td>

                          {/* Orders & Spend */}
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-slate-900">
                              {c.orderCount || 0} {isTh ? 'ออเดอร์' : 'orders'}
                            </div>
                            <div className="text-[11px] text-emerald-600 font-bold">
                              ฿{(c.totalSpent || 0).toLocaleString()} THB
                            </div>
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {onCreateManualOrder && (
                                <button
                                  onClick={() => onCreateManualOrder(c)}
                                  className="px-2.5 py-1 rounded-lg bg-sky-50 text-sky-700 hover:bg-sky-100 text-[11px] font-bold border border-sky-200 transition"
                                  title={isTh ? 'สร้างออเดอร์ POS' : 'Create POS Order'}
                                >
                                  + Order
                                </button>
                              )}

                              <button
                                onClick={() => {
                                  if (onSelectCustomer) {
                                    onSelectCustomer(c);
                                  } else if (onNavigateToTab) {
                                    onNavigateToTab('crm');
                                  }
                                }}
                                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold transition"
                                title={isTh ? 'เปิดดูข้อมูลลูกค้า' : 'View CRM Profile'}
                              >
                                {isTh ? 'ดูโปรไฟล์' : 'View CRM'}
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
        </div>
      )}

      {/* ==================== MODAL: ADD NEW STAFF USER ==================== */}
      {showAddStaffModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-black text-slate-900">
                  {isTh ? 'เพิ่มเจ้าหน้าที่ใหม่' : 'Add New Staff User'}
                </h3>
                <p className="text-xs text-slate-500">
                  {isTh ? 'กำหนดข้อมูลการเข้าสู่ระบบและสิทธิ์การใช้งาน' : 'Configure back-office credentials and permissions'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddStaffModal(false)}
                className="p-1 text-slate-400 hover:text-slate-800"
              >
                <Icon name="x" className="w-5 h-5" />
              </button>
            </div>

            {addStaffError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold">
                ⚠️ {addStaffError}
              </div>
            )}

            <form onSubmit={handleAddStaffSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {isTh ? 'ชื่อผู้ใช้ (Username) *' : 'Username *'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. staff_sukhumvit"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {isTh ? 'ชื่อ-นามสกุล *' : 'Full Name *'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Somchai Prasert"
                    value={newFullName}
                    onChange={(e) => setNewFullName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {isTh ? 'อีเมล' : 'Email Address'}
                  </label>
                  <input
                    type="email"
                    placeholder="staff@nonamelaundry.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {isTh ? 'เบอร์โทรศัพท์' : 'Phone Number'}
                  </label>
                  <input
                    type="text"
                    placeholder="+66 81 234 5678"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {isTh ? 'บทบาท / สิทธิ์ *' : 'Role & Permissions *'}
                  </label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-bold text-slate-800"
                  >
                    <option value="super_admin">👑 Super Admin (Full Control)</option>
                    <option value="manager">🏬 Store Manager</option>
                    <option value="staff">👔 Operations / Cashier</option>
                    <option value="rider">🛵 Express Delivery Rider</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {isTh ? 'สถานะบัญชี *' : 'Initial Status *'}
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-bold"
                  >
                    <option value="active">🟢 Active (ใช้งานได้ทันที)</option>
                    <option value="suspended">🔴 Suspended (ระงับชั่วคราว)</option>
                  </select>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-bold text-slate-700">
                    {isTh ? 'รหัสผ่านเริ่มต้น * (อย่างน้อย 6 ตัว)' : 'Initial Password * (min 6 chars)'}
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const randomPass = 'Pass' + Math.floor(100000 + Math.random() * 900000);
                      setNewPassword(randomPass);
                      setShowNewPassword(true);
                    }}
                    className="text-[10px] text-sky-600 font-bold hover:underline"
                  >
                    🎲 {isTh ? 'สร้างรหัสสุ่ม' : 'Generate'}
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    placeholder="Enter or generate password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                  >
                    <Icon name={showNewPassword ? 'eyeOff' : 'eye'} className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddStaffModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition"
                >
                  {isTh ? 'ยกเลิก' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={addStaffSubmitting}
                  className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white font-bold shadow-md shadow-sky-600/20 transition"
                >
                  {addStaffSubmitting ? (isTh ? 'กำลังบันทึก...' : 'Creating...') : (isTh ? 'สร้างบัญชี' : 'Create User')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== MODAL: EDIT STAFF USER ==================== */}
      {showEditStaffModal && selectedStaffUser && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-black text-slate-900">
                  {isTh ? 'แก้ไขข้อมูลเจ้าหน้าที่' : 'Edit Staff Profile'}
                </h3>
                <p className="text-xs text-slate-500 font-mono">
                  @{selectedStaffUser.username}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowEditStaffModal(false)}
                className="p-1 text-slate-400 hover:text-slate-800"
              >
                <Icon name="x" className="w-5 h-5" />
              </button>
            </div>

            {editError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold">
                ⚠️ {editError}
              </div>
            )}

            <form onSubmit={handleEditStaffSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {isTh ? 'ชื่อ-นามสกุล *' : 'Full Name *'}
                </label>
                <input
                  type="text"
                  required
                  value={editFullName}
                  onChange={(e) => setEditFullName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {isTh ? 'อีเมล' : 'Email Address'}
                  </label>
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {isTh ? 'เบอร์โทรศัพท์' : 'Phone Number'}
                  </label>
                  <input
                    type="text"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {isTh ? 'บทบาท / สิทธิ์ *' : 'Role & Permissions *'}
                  </label>
                  <select
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-bold text-slate-800"
                  >
                    <option value="super_admin">👑 Super Admin</option>
                    <option value="manager">🏬 Store Manager</option>
                    <option value="staff">👔 Operations / Cashier</option>
                    <option value="rider">🛵 Express Delivery Rider</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {isTh ? 'สถานะบัญชี *' : 'Account Status *'}
                  </label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-bold"
                  >
                    <option value="active">🟢 Active</option>
                    <option value="suspended">🔴 Suspended</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowEditStaffModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition"
                >
                  {isTh ? 'ยกเลิก' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={editSubmitting}
                  className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white font-bold shadow-md shadow-sky-600/20 transition"
                >
                  {editSubmitting ? (isTh ? 'กำลังบันทึก...' : 'Saving...') : (isTh ? 'บันทึกการแก้ไข' : 'Save Changes')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== MODAL: RESET PASSWORD ==================== */}
      {showResetPwdModal && selectedStaffUser && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-black text-slate-900">
                  {isTh ? 'รีเซ็ตรหัสผ่าน' : 'Reset Staff Password'}
                </h3>
                <p className="text-xs text-slate-500">
                  {isTh ? 'สำหรับ' : 'For'}: <strong className="text-slate-800">@{selectedStaffUser.username}</strong>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowResetPwdModal(false)}
                className="p-1 text-slate-400 hover:text-slate-800"
              >
                <Icon name="x" className="w-5 h-5" />
              </button>
            </div>

            {resetPwdError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold">
                ⚠️ {resetPwdError}
              </div>
            )}

            {resetPwdSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
                ✅ {resetPwdSuccess}
              </div>
            )}

            <form onSubmit={handleResetPwdSubmit} className="space-y-3.5 text-xs">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-bold text-slate-700">
                    {isTh ? 'รหัสผ่านใหม่ *' : 'New Password *'}
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const randomPass = 'Reset' + Math.floor(100000 + Math.random() * 900000);
                      setResetPwdInput(randomPass);
                    }}
                    className="text-[10px] text-sky-600 font-bold hover:underline"
                  >
                    🎲 {isTh ? 'สร้างรหัสสุ่ม' : 'Generate'}
                  </button>
                </div>
                <input
                  type="text"
                  required
                  placeholder="Min 6 characters"
                  value={resetPwdInput}
                  onChange={(e) => setResetPwdInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowResetPwdModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition"
                >
                  {isTh ? 'ยกเลิก' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={resetPwdSubmitting}
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-bold shadow-md shadow-amber-600/20 transition"
                >
                  {resetPwdSubmitting ? (isTh ? 'กำลังบันทึก...' : 'Resetting...') : (isTh ? 'ยืนยันรหัสผ่านใหม่' : 'Set New Password')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== MODAL: DELETE CONFIRMATION ==================== */}
      {showDeleteModal && selectedStaffUser && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto text-xl font-bold">
              ⚠️
            </div>

            <div className="text-center">
              <h3 className="text-base font-black text-slate-900">
                {isTh ? 'ยืนยันการลบบัญชีผู้ใช้?' : 'Delete Staff Account?'}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {isTh
                  ? `คุณต้องการลบบัญชี @${selectedStaffUser.username} (${selectedStaffUser.fullName}) หรือไม่? การกระทำนี้ไม่สามารถเรียกคืนได้`
                  : `Are you sure you want to delete @${selectedStaffUser.username} (${selectedStaffUser.fullName})? This action cannot be undone.`}
              </p>
            </div>

            <div className="pt-2 flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="w-1/2 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition"
              >
                {isTh ? 'ยกเลิก' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="w-1/2 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md shadow-rose-600/20 transition"
              >
                {isTh ? 'ยืนยันการลบ' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
