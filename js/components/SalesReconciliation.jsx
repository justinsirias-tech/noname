import React, { useState, useMemo } from 'react';
import { Icon } from './Icons.jsx';
import { ORDER_STATUSES } from '../data/servicesData.js';
import { laundryStore } from '../store.js';

export function SalesReconciliation({
  orders = [],
  services = [],
  adminUser,
  onReconcileOrder,
  onBatchReconcileOrders,
  onMarkPaid,
  onUpdateServicePricing,
  onNavigateToServices
}) {
  // Date Presets & Custom Range
  const [datePreset, setDatePreset] = useState('ALL'); // 'TODAY', 'YESTERDAY', 'THIS_WEEK', 'THIS_MONTH', 'LAST_MONTH', 'ALL', 'CUSTOM'
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  // Status & Attribute Filters
  const [paymentFilter, setPaymentFilter] = useState('ALL'); // 'ALL', 'PAID', 'PENDING'
  const [reconciliationFilter, setReconciliationFilter] = useState('ALL'); // 'ALL', 'UNRECONCILED', 'RECONCILED', 'DISCREPANCY'
  const [methodFilter, setMethodFilter] = useState('ALL'); // 'ALL', 'PromptPay QR', 'Credit Card (Gateway)', 'Bank Transfer', 'Cash'
  const [searchQuery, setSearchQuery] = useState('');

  // Service Analysis Chart Metric
  const [serviceChartMetric, setServiceChartMetric] = useState('revenue'); // 'revenue', 'volume', 'weight', 'speedMix'

  // Batch Selection State
  const [selectedOrderIds, setSelectedOrderIds] = useState([]);
  const [batchBankRef, setBatchBankRef] = useState('PromptPay Settlement');
  const [batchNotes, setBatchNotes] = useState('');
  const [isBatchSaving, setIsBatchSaving] = useState(false);

  // Single Order Audit Modal State
  const [auditingOrder, setAuditingOrder] = useState(null);
  const [modalStatus, setModalStatus] = useState('RECONCILED');
  const [modalBankRef, setModalBankRef] = useState('');
  const [modalNotes, setModalNotes] = useState('');
  const [isModalSaving, setIsModalSaving] = useState(false);

  // Feedback Alerts
  const [feedbackMsg, setFeedbackMsg] = useState('');

  const showFeedback = (msg) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(''), 4000);
  };

  // Helper date calculators
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - (now.getDay() === 0 ? 6 : now.getDay() - 1));
  const startOfWeekStr = startOfWeek.toISOString().split('T')[0];

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfMonthStr = startOfMonth.toISOString().split('T')[0];

  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const startOfLastMonthStr = startOfLastMonth.toISOString().split('T')[0];
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
  const endOfLastMonthStr = endOfLastMonth.toISOString().split('T')[0];

  // Human-readable reporting period label
  const periodLabel = useMemo(() => {
    if (datePreset === 'ALL') return 'All Historical Transactions';
    if (datePreset === 'TODAY') return `Today (${todayStr})`;
    if (datePreset === 'YESTERDAY') return `Yesterday (${yesterdayStr})`;
    if (datePreset === 'THIS_WEEK') return `This Week (Since ${startOfWeekStr})`;
    if (datePreset === 'THIS_MONTH') return `This Month (${startOfMonthStr} to ${todayStr})`;
    if (datePreset === 'LAST_MONTH') return `Last Month (${startOfLastMonthStr} to ${endOfLastMonthStr})`;
    if (datePreset === 'CUSTOM') return `Custom Period: ${customStartDate || 'Earliest'} to ${customEndDate || 'Latest'}`;
    return datePreset;
  }, [datePreset, todayStr, yesterdayStr, startOfWeekStr, startOfMonthStr, startOfLastMonthStr, endOfLastMonthStr, customStartDate, customEndDate]);

  // 1. Filtered Orders Computation
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const orderDateStr = (order.createdAt ? order.createdAt.split('T')[0] : (order.pickupDate || ''));

      // Date Filtering
      if (datePreset === 'TODAY' && orderDateStr !== todayStr) return false;
      if (datePreset === 'YESTERDAY' && orderDateStr !== yesterdayStr) return false;
      if (datePreset === 'THIS_WEEK' && orderDateStr < startOfWeekStr) return false;
      if (datePreset === 'THIS_MONTH' && orderDateStr < startOfMonthStr) return false;
      if (datePreset === 'LAST_MONTH' && (orderDateStr < startOfLastMonthStr || orderDateStr > endOfLastMonthStr)) return false;
      if (datePreset === 'CUSTOM') {
        if (customStartDate && orderDateStr < customStartDate) return false;
        if (customEndDate && orderDateStr > customEndDate) return false;
      }

      // Payment Status Filter
      if (paymentFilter !== 'ALL') {
        if (paymentFilter === 'PAID' && order.paymentStatus !== 'PAID') return false;
        if (paymentFilter === 'PENDING' && order.paymentStatus === 'PAID') return false;
      }

      // Reconciliation Status Filter
      const reconStatus = order.reconciliationStatus || 'UNRECONCILED';
      if (reconciliationFilter !== 'ALL' && reconStatus !== reconciliationFilter) {
        return false;
      }

      // Payment Method Filter
      if (methodFilter !== 'ALL') {
        const orderMethod = order.paymentMethod || 'PromptPay QR';
        if (!orderMethod.toLowerCase().includes(methodFilter.toLowerCase())) {
          return false;
        }
      }

      // Search Query Filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const idMatch = (order.id || '').toLowerCase().includes(q);
        const nameMatch = (order.customerName || '').toLowerCase().includes(q);
        const condoMatch = (order.condoName || '').toLowerCase().includes(q);
        const payRefMatch = (order.paymentRef || '').toLowerCase().includes(q);
        const bankRefMatch = (order.bankAccountRef || '').toLowerCase().includes(q);
        const tagMatch = (order.tagNumber || '').toLowerCase().includes(q);
        if (!idMatch && !nameMatch && !condoMatch && !payRefMatch && !bankRefMatch && !tagMatch) {
          return false;
        }
      }

      return true;
    });
  }, [
    orders,
    datePreset,
    customStartDate,
    customEndDate,
    paymentFilter,
    reconciliationFilter,
    methodFilter,
    searchQuery,
    todayStr,
    yesterdayStr,
    startOfWeekStr,
    startOfMonthStr,
    startOfLastMonthStr,
    endOfLastMonthStr
  ]);

  // 2. Financial Metrics Aggregation
  const metrics = useMemo(() => {
    let grossRevenue = 0;
    let collectedRevenue = 0;
    let pendingReceivables = 0;
    let reconciledAmount = 0;
    let unreconciledAmount = 0;
    let discrepancyCount = 0;
    let paidCount = 0;
    let reconciledCount = 0;

    const methodBreakdown = {
      'PromptPay QR': 0,
      'Credit Card': 0,
      'Bank Transfer': 0,
      'Other / Cash': 0
    };

    filteredOrders.forEach(o => {
      const price = Number(o.totalPrice) || 0;
      grossRevenue += price;

      if (o.paymentStatus === 'PAID') {
        collectedRevenue += price;
        paidCount++;

        const method = o.paymentMethod || 'PromptPay QR';
        if (method.toLowerCase().includes('promptpay')) {
          methodBreakdown['PromptPay QR'] += price;
        } else if (method.toLowerCase().includes('card')) {
          methodBreakdown['Credit Card'] += price;
        } else if (method.toLowerCase().includes('bank') || method.toLowerCase().includes('transfer')) {
          methodBreakdown['Bank Transfer'] += price;
        } else {
          methodBreakdown['Other / Cash'] += price;
        }

        const isReconciled = o.reconciliationStatus === 'RECONCILED';
        if (isReconciled) {
          reconciledAmount += price;
          reconciledCount++;
        } else {
          unreconciledAmount += price;
        }
      } else {
        pendingReceivables += price;
      }

      if (o.reconciliationStatus === 'DISCREPANCY') {
        discrepancyCount++;
      }
    });

    const reconciliationRate = collectedRevenue > 0 ? Math.round((reconciledAmount / collectedRevenue) * 100) : 0;

    return {
      grossRevenue,
      collectedRevenue,
      pendingReceivables,
      reconciledAmount,
      unreconciledAmount,
      reconciliationRate,
      paidCount,
      reconciledCount,
      discrepancyCount,
      methodBreakdown
    };
  }, [filteredOrders]);

  // 3. Detailed Services Analytics & Pricing Elasticity Computation
  const servicesAnalysis = useMemo(() => {
    const srvMap = {};

    // Initialize all catalog services
    (services || []).forEach(s => {
      srvMap[s.id] = {
        id: s.id,
        name: s.name,
        nameTh: s.nameTh || '',
        standardPricePerKg: Number(s.standardPricePerKg || s.pricePerKg || 65),
        nextDayPricePerKg: Number(s.nextDayPricePerKg || Math.round((s.pricePerKg || 65) * 1.3)),
        sameDayPricePerKg: Number(s.sameDayPricePerKg || Math.round((s.pricePerKg || 65) * 1.75)),
        minWeightKg: Number(s.minWeightKg || 4.0),
        popular: Boolean(s.popular),
        ordersCount: 0,
        paidOrdersCount: 0,
        totalRevenue: 0,
        collectedRevenue: 0,
        totalWeightKg: 0,
        speedCount: {
          standard: 0,
          nextDay: 0,
          sameDay: 0
        },
        speedRevenue: {
          standard: 0,
          nextDay: 0,
          sameDay: 0
        }
      };
    });

    // Aggregate filtered orders into services
    filteredOrders.forEach(order => {
      let srvId = order.serviceId;
      if (!srvId || !srvMap[srvId]) {
        const match = Object.values(srvMap).find(
          s => s.name.toLowerCase() === (order.serviceName || '').toLowerCase()
        );
        srvId = match ? match.id : (order.serviceId || 'unknown');
      }

      if (!srvMap[srvId]) {
        srvMap[srvId] = {
          id: srvId,
          name: order.serviceName || 'Custom Service',
          nameTh: '',
          standardPricePerKg: Number(order.pricePerKg || 65),
          nextDayPricePerKg: Number(order.pricePerKg ? Math.round(order.pricePerKg * 1.3) : 85),
          sameDayPricePerKg: Number(order.pricePerKg ? Math.round(order.pricePerKg * 1.75) : 115),
          minWeightKg: Number(order.minWeightAppliedKg || 4.0),
          popular: false,
          ordersCount: 0,
          paidOrdersCount: 0,
          totalRevenue: 0,
          collectedRevenue: 0,
          totalWeightKg: 0,
          speedCount: { standard: 0, nextDay: 0, sameDay: 0 },
          speedRevenue: { standard: 0, nextDay: 0, sameDay: 0 }
        };
      }

      const s = srvMap[srvId];
      const rev = Number(order.totalPrice) || 0;
      const wt = Number(order.actualWeightKg !== null ? order.actualWeightKg : (order.estimatedWeightKg || s.minWeightKg || 4.0));
      const spd = order.turnaroundSpeed || 'standard_48h';

      s.ordersCount++;
      s.totalRevenue += rev;
      s.totalWeightKg += wt;

      if (order.paymentStatus === 'PAID') {
        s.paidOrdersCount++;
        s.collectedRevenue += rev;
      }

      if (spd === 'same_day') {
        s.speedCount.sameDay++;
        s.speedRevenue.sameDay += rev;
      } else if (spd === 'next_day' || spd === 'next_day_24h') {
        s.speedCount.nextDay++;
        s.speedRevenue.nextDay += rev;
      } else {
        s.speedCount.standard++;
        s.speedRevenue.standard += rev;
      }
    });

    const totalGross = metrics.grossRevenue || 1;
    const totalOrders = filteredOrders.length || 1;

    const list = Object.values(srvMap).map(s => {
      const avgWeight = s.ordersCount > 0 ? (s.totalWeightKg / s.ordersCount) : 0;
      const aov = s.ordersCount > 0 ? (s.totalRevenue / s.ordersCount) : 0;
      const effectiveYield = s.totalWeightKg > 0 ? (s.totalRevenue / s.totalWeightKg) : s.standardPricePerKg;
      const revenueShare = (s.totalRevenue / totalGross) * 100;
      const volumeShare = (s.ordersCount / totalOrders) * 100;
      const expressCount = s.speedCount.nextDay + s.speedCount.sameDay;
      const expressAdoptionRate = s.ordersCount > 0 ? Math.round((expressCount / s.ordersCount) * 100) : 0;

      // Automated pricing elasticity insight
      let insight = '';
      let insightBadge = 'Opportunity';
      let insightBadgeColor = 'bg-blue-50 text-blue-700 border-blue-200';

      if (s.ordersCount === 0) {
        insight = 'Zero bookings in this period. Review storefront positioning or run promotional bundle.';
        insightBadge = 'Inactive';
        insightBadgeColor = 'bg-slate-50 text-slate-500 border-slate-200';
      } else if (expressAdoptionRate >= 40) {
        insight = `${expressAdoptionRate}% express adoption. Customers prioritize speed; opportunity to increase Same-Day rate by +฿10-15/KG.`;
        insightBadge = 'High Express Margin';
        insightBadgeColor = 'bg-purple-50 text-purple-700 border-purple-200';
      } else if (avgWeight < s.minWeightKg) {
        insight = `Average bag is ${avgWeight.toFixed(1)} KG (under ${s.minWeightKg} KG floor). Minimum weight enforcement protects baseline profitability.`;
        insightBadge = 'Floor Protected';
        insightBadgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';
      } else if (revenueShare >= 35) {
        insight = `Core flagship revenue engine (${revenueShare.toFixed(1)}% of total). Strong customer elasticity; test +฿5/KG margin increment.`;
        insightBadge = 'Top Revenue Driver';
        insightBadgeColor = 'bg-amber-50 text-amber-800 border-amber-300';
      } else {
        insight = `Healthy volume with ฿${Math.round(aov)} AOV. Current rate is competitive across Bangkok.`;
        insightBadge = 'Balanced';
        insightBadgeColor = 'bg-sky-50 text-sky-700 border-sky-200';
      }

      return {
        ...s,
        avgWeight,
        aov,
        effectiveYield,
        revenueShare,
        volumeShare,
        expressAdoptionRate,
        insight,
        insightBadge,
        insightBadgeColor
      };
    });

    // Sort by revenue descending
    list.sort((a, b) => b.totalRevenue - a.totalRevenue);

    const topSellerByRevenue = list.length > 0 && list[0].ordersCount > 0 ? list[0] : null;
    const topSellerByVolume = [...list].sort((a, b) => b.ordersCount - a.ordersCount)[0];

    // Maximum values for chart bar scaling
    const maxRevenue = Math.max(...list.map(s => s.totalRevenue), 1);
    const maxOrders = Math.max(...list.map(s => s.ordersCount), 1);
    const maxWeight = Math.max(...list.map(s => s.totalWeightKg), 1);
    const maxAov = Math.max(...list.map(s => s.aov), 1);

    return {
      list,
      topSellerByRevenue,
      topSellerByVolume: (topSellerByVolume && topSellerByVolume.ordersCount > 0) ? topSellerByVolume : null,
      maxRevenue,
      maxOrders,
      maxWeight,
      maxAov
    };
  }, [services, filteredOrders, metrics.grossRevenue]);

  // Handle Multi-Select Checkboxes
  const handleToggleSelectAll = () => {
    if (selectedOrderIds.length === filteredOrders.length) {
      setSelectedOrderIds([]);
    } else {
      setSelectedOrderIds(filteredOrders.map(o => o.id));
    }
  };

  const handleToggleSelectOrder = (id) => {
    setSelectedOrderIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  // Execute Batch Reconcile
  const handleExecuteBatchReconcile = async () => {
    if (selectedOrderIds.length === 0) return;
    setIsBatchSaving(true);
    try {
      if (onBatchReconcileOrders) {
        await onBatchReconcileOrders(selectedOrderIds, {
          reconciliationStatus: 'RECONCILED',
          bankAccountRef: batchBankRef.trim() || 'PromptPay Settlement Batch',
          notes: batchNotes.trim() || 'Bulk reconciled by staff in accounting audit workstation.',
          reconciledBy: adminUser?.username || 'admin'
        });
      }
      showFeedback(`Successfully reconciled ${selectedOrderIds.length} transactions.`);
      setSelectedOrderIds([]);
    } catch (err) {
      alert('Error during batch reconciliation: ' + err.message);
    } finally {
      setIsBatchSaving(false);
    }
  };

  // Open Modal for Single Order Audit
  const handleOpenAuditModal = (order) => {
    setAuditingOrder(order);
    setModalStatus(order.reconciliationStatus || (order.paymentStatus === 'PAID' ? 'RECONCILED' : 'UNRECONCILED'));
    setModalBankRef(order.bankAccountRef || (order.paymentMethod ? `${order.paymentMethod} Batch` : 'PromptPay Settlement'));
    setModalNotes(order.reconciliationNotes || '');
  };

  // Save Single Order Audit
  const handleSaveSingleAudit = async (e) => {
    if (e) e.preventDefault();
    if (!auditingOrder) return;
    setIsModalSaving(true);
    try {
      if (onReconcileOrder) {
        await onReconcileOrder(auditingOrder.id, {
          reconciliationStatus: modalStatus,
          bankAccountRef: modalBankRef.trim(),
          reconciliationNotes: modalNotes.trim(),
          reconciledBy: adminUser?.username || 'admin'
        });
      }
      showFeedback(`Order #${auditingOrder.id} status updated to ${modalStatus}.`);
      setAuditingOrder(null);
    } catch (err) {
      alert('Error updating reconciliation: ' + err.message);
    } finally {
      setIsModalSaving(false);
    }
  };

  // Export to CSV / Excel
  const handleExportCSV = () => {
    if (filteredOrders.length === 0) {
      alert('No transactions to export for the selected filter.');
      return;
    }

    const headers = [
      'Order ID',
      'Created Date',
      'Pickup Date',
      'Customer Name',
      'Contact Channel',
      'Contact Info',
      'Condo / Building',
      'Room Number',
      'Bangkok District',
      'Service Name',
      'Turnaround Speed',
      'Est Weight (KG)',
      'Scale Intake Weight (KG)',
      'Rate Per KG (THB)',
      'Total Amount (THB)',
      'Payment Status',
      'Payment Method',
      'Payment Ref / Txn ID',
      'Reconciliation Status',
      'Reconciled At',
      'Reconciled By',
      'Bank Account / Settlement Ref',
      'Reconciliation Notes'
    ];

    const escapeCsv = (val) => {
      if (val === null || val === undefined) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const rows = filteredOrders.map(o => [
      escapeCsv(o.id),
      escapeCsv(o.createdAt ? o.createdAt.replace('T', ' ').substring(0, 19) : ''),
      escapeCsv(o.pickupDate || ''),
      escapeCsv(o.customerName),
      escapeCsv(o.contactChannel),
      escapeCsv(o.contactValue),
      escapeCsv(o.condoName),
      escapeCsv(o.roomNumber),
      escapeCsv(o.district),
      escapeCsv(o.serviceName),
      escapeCsv(o.turnaroundSpeed),
      escapeCsv(o.estimatedWeightKg),
      escapeCsv(o.actualWeightKg !== null ? o.actualWeightKg : 'Pending'),
      escapeCsv(o.pricePerKg),
      escapeCsv(o.totalPrice),
      escapeCsv(o.paymentStatus),
      escapeCsv(o.paymentMethod || 'Awaiting Payment'),
      escapeCsv(o.paymentRef || ''),
      escapeCsv(o.reconciliationStatus || 'UNRECONCILED'),
      escapeCsv(o.reconciledAt ? o.reconciledAt.replace('T', ' ').substring(0, 19) : ''),
      escapeCsv(o.reconciledBy || ''),
      escapeCsv(o.bankAccountRef || ''),
      escapeCsv(o.reconciliationNotes || '')
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `noname_laundry_sales_reconciliation_${todayStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Print Accounting Summary Statement
  const handlePrintStatement = () => {
    window.print();
  };

  return (
    <div>
      {/* SCREEN INTERACTIVE WORKSTATION (HIDDEN DURING PRINT) */}
      <div className="space-y-6 print:hidden">

      {/* Top Banner & Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold mb-2">
            <Icon name="calculator" className="w-3.5 h-3.5 text-emerald-700" />
            <span>Accounting & Revenue Audit</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Sales Reporting & Transaction Reconciliation
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit cashless revenue, analyze top selling services, evaluate pricing elasticity, and reconcile bank settlements.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 print:hidden">
          <button
            type="button"
            onClick={handleExportCSV}
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition active:scale-95"
            title="Export filtered records to spreadsheet"
          >
            <Icon name="download" className="w-4 h-4 text-emerald-400" />
            <span>Export to CSV / Excel</span>
          </button>

          <button
            type="button"
            onClick={handlePrintStatement}
            className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition active:scale-95 border border-slate-200"
            title="Print formal accounting summary statement"
          >
            <Icon name="printer" className="w-4 h-4 text-slate-600" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {feedbackMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 shadow-xs animate-fade-in">
          <Icon name="checkCircle2" className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* EXECUTIVE KPI SUMMARY CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Gross Sales */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-bold uppercase text-slate-500 flex items-center justify-between">
            <span>Gross Sales</span>
            <Icon name="dollarSign" className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
            ฿{metrics.grossRevenue.toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            {filteredOrders.length} bookings filtered
          </div>
        </div>

        {/* Collected / Paid */}
        <div className="bg-white p-4 rounded-2xl border border-emerald-200 bg-gradient-to-br from-white to-emerald-50/40 shadow-xs">
          <div className="text-[11px] font-bold uppercase text-emerald-700 flex items-center justify-between">
            <span>Settled / Paid</span>
            <Icon name="badgeCheck" className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-700 mt-1">
            ฿{metrics.collectedRevenue.toLocaleString()}
          </div>
          <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">
            {metrics.paidCount} cashless payments
          </div>
        </div>

        {/* Pending Receivables */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-bold uppercase text-amber-600 flex items-center justify-between">
            <span>Pending Receivables</span>
            <Icon name="clock" className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-amber-700 mt-1">
            ฿{metrics.pendingReceivables.toLocaleString()}
          </div>
          <div className="text-[10px] text-amber-600 font-semibold mt-0.5">
            {filteredOrders.length - metrics.paidCount} unpaid orders
          </div>
        </div>

        {/* Reconciled Revenue */}
        <div className="bg-white p-4 rounded-2xl border border-sky-200 bg-gradient-to-br from-white to-sky-50/40 shadow-xs">
          <div className="text-[11px] font-bold uppercase text-sky-700 flex items-center justify-between">
            <span>Reconciled</span>
            <Icon name="checkCircle2" className="w-3.5 h-3.5 text-sky-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-sky-800 mt-1">
            ฿{metrics.reconciledAmount.toLocaleString()}
          </div>
          <div className="text-[10px] text-sky-600 font-semibold mt-0.5">
            {metrics.reconciliationRate}% verified against bank
          </div>
        </div>

        {/* Unreconciled Pending */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-bold uppercase text-orange-600 flex items-center justify-between">
            <span>Unreconciled Paid</span>
            <Icon name="alertTriangle" className="w-3.5 h-3.5 text-orange-500" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-orange-700 mt-1">
            ฿{metrics.unreconciledAmount.toLocaleString()}
          </div>
          <div className="text-[10px] text-orange-600 font-semibold mt-0.5">
            {metrics.paidCount - metrics.reconciledCount} awaiting audit verification
          </div>
        </div>

        {/* Discrepancies */}
        <div className={`p-4 rounded-2xl border shadow-xs ${
          metrics.discrepancyCount > 0 ? 'bg-rose-50 border-rose-300' : 'bg-white border-slate-200'
        }`}>
          <div className="text-[11px] font-bold uppercase text-rose-700 flex items-center justify-between">
            <span>Discrepancies</span>
            <Icon name="alertCircle" className="w-3.5 h-3.5 text-rose-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-rose-700 mt-1">
            {metrics.discrepancyCount}
          </div>
          <div className="text-[10px] text-rose-600 font-semibold mt-0.5">
            {metrics.discrepancyCount > 0 ? 'Requires accountant audit' : 'Zero discrepancies'}
          </div>
        </div>
      </div>

      {/* TOP SELLING SERVICES & PRICING ELASTICITY WORKSTATION */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
        
        {/* Header & Chart Metric Mode Switcher */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-800 text-[10px] font-black uppercase tracking-wider">
                Product Analytics & Pricing Matrix
              </span>
              {servicesAnalysis.topSellerByRevenue && (
                <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold flex items-center gap-1">
                  <span>🏆 #1 Top Seller: {servicesAnalysis.topSellerByRevenue.name}</span>
                </span>
              )}
            </div>
            <h3 className="text-lg font-black text-slate-900 tracking-tight mt-1 flex items-center gap-2">
              <span>Top Selling Services & Pricing Elasticity Analysis</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Review customer service adoption, evaluate average intake weight per order, and fine-tune rates to maximize margin.
            </p>
          </div>

          {/* Metric Selector Buttons */}
          <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200 text-xs">
            {[
              { id: 'revenue', label: '฿ Revenue', icon: 'dollarSign' },
              { id: 'volume', label: '📦 Orders', icon: 'package' },
              { id: 'weight', label: '⚖ Total KG', icon: 'scale' },
              { id: 'speedMix', label: '⚡ Express Speed Mix', icon: 'clock' }
            ].map(m => (
              <button
                key={m.id}
                type="button"
                onClick={() => setServiceChartMetric(m.id)}
                className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 ${
                  serviceChartMetric === m.id
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Icon name={m.icon} className="w-3.5 h-3.5" />
                <span>{m.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* TOP SELLER SPOTLIGHT CARDS */}
        {servicesAnalysis.topSellerByRevenue && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 p-4 rounded-2xl bg-gradient-to-r from-sky-50 via-slate-50 to-indigo-50/40 border border-sky-200">
            <div>
              <span className="text-[10px] font-bold text-sky-700 uppercase tracking-wider block">#1 Top Revenue Driver</span>
              <div className="text-base font-black text-slate-900 mt-0.5 truncate">{servicesAnalysis.topSellerByRevenue.name}</div>
              <div className="text-xs font-bold text-sky-800 font-mono mt-0.5">
                ฿{servicesAnalysis.topSellerByRevenue.totalRevenue.toLocaleString()} THB ({servicesAnalysis.topSellerByRevenue.revenueShare.toFixed(1)}% of total)
              </div>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Average Order Value (AOV)</span>
              <div className="text-base font-black text-slate-900 mt-0.5 font-mono">
                ฿{Math.round(servicesAnalysis.topSellerByRevenue.aov).toLocaleString()} THB
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">
                Realized yield: ฿{servicesAnalysis.topSellerByRevenue.effectiveYield.toFixed(1)} / KG
              </div>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Intake Scale Weight</span>
              <div className="text-base font-black text-slate-900 mt-0.5 font-mono">
                {servicesAnalysis.topSellerByRevenue.totalWeightKg.toFixed(1)} KG total
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">
                Avg {servicesAnalysis.topSellerByRevenue.avgWeight.toFixed(1)} KG / bag (Min floor: {servicesAnalysis.topSellerByRevenue.minWeightKg} KG)
              </div>
            </div>

            <div className="flex flex-col justify-between">
              <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wider block">Express Adoption</span>
              <div className="text-sm font-black text-purple-800">
                {servicesAnalysis.topSellerByRevenue.expressAdoptionRate}% chose Next-Day / Same-Day
              </div>
              <button
                type="button"
                onClick={() => handleOpenPricingModal(servicesAnalysis.topSellerByRevenue)}
                className="mt-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs"
              >
                <Icon name="scale" className="w-3.5 h-3.5 text-amber-400" />
                <span>Adjust {servicesAnalysis.topSellerByRevenue.name} Price</span>
              </button>
            </div>
          </div>
        )}

        {/* VISUAL CHART BARS */}
        <div className="space-y-4 pt-1">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 px-1">
            <span>Service Performance Comparison ({servicesAnalysis.list.length} services)</span>
            {serviceChartMetric === 'speedMix' ? (
              <div className="flex items-center gap-3 text-[11px]">
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-slate-600 inline-block" /> Standard 48h</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-sky-500 inline-block" /> Next-Day 24h</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" /> Same-Day Express</span>
              </div>
            ) : (
              <span className="font-mono text-[11px]">Sorted by Gross Revenue</span>
            )}
          </div>

          <div className="space-y-3">
            {servicesAnalysis.list.map((srv, idx) => {
              let barPercent = 0;
              let barLabel = '';
              let subLabel = '';

              if (serviceChartMetric === 'revenue') {
                barPercent = servicesAnalysis.maxRevenue > 0 ? (srv.totalRevenue / servicesAnalysis.maxRevenue) * 100 : 0;
                barLabel = `฿${srv.totalRevenue.toLocaleString()} THB`;
                subLabel = `${srv.revenueShare.toFixed(1)}% of total sales • ${srv.ordersCount} orders`;
              } else if (serviceChartMetric === 'volume') {
                barPercent = servicesAnalysis.maxOrders > 0 ? (srv.ordersCount / servicesAnalysis.maxOrders) * 100 : 0;
                barLabel = `${srv.ordersCount} bookings`;
                subLabel = `${srv.volumeShare.toFixed(1)}% share • Avg ฿${Math.round(srv.aov)}/order`;
              } else if (serviceChartMetric === 'weight') {
                barPercent = servicesAnalysis.maxWeight > 0 ? (srv.totalWeightKg / servicesAnalysis.maxWeight) * 100 : 0;
                barLabel = `${srv.totalWeightKg.toFixed(1)} KG`;
                subLabel = `Avg ${srv.avgWeight.toFixed(1)} KG/bag • Min: ${srv.minWeightKg} KG`;
              }

              // Speed mix proportions
              const stdPct = srv.ordersCount > 0 ? (srv.speedCount.standard / srv.ordersCount) * 100 : 0;
              const nextPct = srv.ordersCount > 0 ? (srv.speedCount.nextDay / srv.ordersCount) * 100 : 0;
              const samePct = srv.ordersCount > 0 ? (srv.speedCount.sameDay / srv.ordersCount) * 100 : 0;

              return (
                <div key={srv.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 hover:border-sky-300 transition space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-xs">
                    <div className="flex items-center gap-2">
                      <span className={`w-6 h-6 rounded-lg font-mono font-black text-xs flex items-center justify-center ${
                        idx === 0 ? 'bg-amber-400 text-amber-950 shadow-xs' : 'bg-slate-200 text-slate-700'
                      }`}>
                        #{idx + 1}
                      </span>
                      <span className="font-bold text-slate-900 text-sm">{srv.name}</span>
                      {srv.nameTh && <span className="text-slate-400 font-normal">({srv.nameTh})</span>}
                      {srv.popular && (
                        <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                          Popular
                        </span>
                      )}
                      <span className="text-[11px] font-mono text-slate-500 font-semibold">
                        Base: ฿{srv.standardPricePerKg}/KG • Min {srv.minWeightKg}KG
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xs font-black text-slate-900 font-mono">{barLabel}</span>
                    </div>
                  </div>

                  {/* Visual Bar */}
                  {serviceChartMetric === 'speedMix' ? (
                    <div className="w-full bg-slate-200 h-4 rounded-full overflow-hidden flex">
                      <div
                        className="bg-slate-700 h-full transition-all"
                        style={{ width: `${stdPct}%` }}
                        title={`Standard 48h: ${srv.speedCount.standard} (${stdPct.toFixed(0)}%)`}
                      />
                      <div
                        className="bg-sky-500 h-full transition-all"
                        style={{ width: `${nextPct}%` }}
                        title={`Next Day 24h: ${srv.speedCount.nextDay} (${nextPct.toFixed(0)}%)`}
                      />
                      <div
                        className="bg-amber-500 h-full transition-all"
                        style={{ width: `${samePct}%` }}
                        title={`Same Day: ${srv.speedCount.sameDay} (${samePct.toFixed(0)}%)`}
                      />
                    </div>
                  ) : (
                    <div className="w-full bg-slate-200 h-3.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          idx === 0
                            ? 'bg-gradient-to-r from-sky-600 to-indigo-600'
                            : 'bg-gradient-to-r from-slate-600 to-slate-800'
                        }`}
                        style={{ width: `${Math.max(barPercent, 2)}%` }}
                      />
                    </div>
                  )}

                  <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-500 pt-0.5">
                    <span>{subLabel}</span>
                    <span className="font-medium text-slate-700">
                      Standard: <strong>{srv.speedCount.standard}</strong> • Next-Day: <strong>{srv.speedCount.nextDay}</strong> • Same-Day: <strong>{srv.speedCount.sameDay}</strong>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* DETAILED PRICING ELASTICITY & MARGIN OPTIMIZATION TABLE */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-black uppercase text-slate-800 tracking-wider flex items-center gap-1.5">
              <Icon name="scale" className="w-4 h-4 text-sky-600" />
              <span>Service Sales Performance, Weight Yield & Analytics</span>
            </h4>
            <span className="text-[11px] text-slate-500">
              Detailed breakdown of gross revenue, certified intake weight, order volume, and turnaround speed adoption
            </span>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-xs">
            <table className="w-full text-left text-xs bg-white">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200 text-[10px]">
                <tr>
                  <th className="py-3 px-4">Service</th>
                  <th className="py-3 px-3">Current Rates</th>
                  <th className="py-3 px-3 text-right">Revenue (Share)</th>
                  <th className="py-3 px-3 text-right">Volume (AOV)</th>
                  <th className="py-3 px-3 text-right">Weight (Avg Bag)</th>
                  <th className="py-3 px-3 text-right">Effective Yield</th>
                  <th className="py-3 px-4">Pricing Strategy & Margin Recommendation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {servicesAnalysis.list.map((srv, idx) => (
                  <tr key={srv.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-400 font-mono text-[10px]">#{idx + 1}</span>
                        <span>{srv.name}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-normal">{srv.nameTh}</div>
                    </td>

                    <td className="py-3.5 px-3 font-mono text-[11px]">
                      <div>Std: <strong>฿{srv.standardPricePerKg}</strong>/KG</div>
                      <div className="text-[10px] text-slate-500">24h: ฿{srv.nextDayPricePerKg} | Same: ฿{srv.sameDayPricePerKg}</div>
                      <div className="text-[10px] text-sky-700 font-semibold">Min: {srv.minWeightKg} KG floor</div>
                    </td>

                    <td className="py-3.5 px-3 text-right">
                      <div className="font-black text-slate-900 font-mono text-sm">฿{srv.totalRevenue.toLocaleString()}</div>
                      <div className="text-[10px] text-slate-500">{srv.revenueShare.toFixed(1)}% of total</div>
                    </td>

                    <td className="py-3.5 px-3 text-right">
                      <div className="font-bold text-slate-800">{srv.ordersCount} orders</div>
                      <div className="text-[10px] text-slate-500 font-mono">฿{Math.round(srv.aov)} AOV</div>
                    </td>

                    <td className="py-3.5 px-3 text-right">
                      <div className="font-bold text-slate-800 font-mono">{srv.totalWeightKg.toFixed(1)} KG</div>
                      <div className="text-[10px] text-slate-500 font-mono">Avg {srv.avgWeight.toFixed(1)} KG</div>
                    </td>

                    <td className="py-3.5 px-3 text-right">
                      <div className="font-black text-emerald-700 font-mono">
                        ฿{srv.effectiveYield.toFixed(1)} / KG
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {srv.effectiveYield > srv.standardPricePerKg ? '+฿' + (srv.effectiveYield - srv.standardPricePerKg).toFixed(1) + ' min floor lift' : 'At standard rate'}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 max-w-sm">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black border uppercase tracking-wider ${srv.insightBadgeColor}`}>
                          {srv.insightBadge}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 leading-snug">
                        {srv.insight}
                      </p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* PAYMENT METHOD DISTRIBUTION & RECONCILIATION PROGRESS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Payment Channels Distribution */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black uppercase text-slate-800 tracking-wider flex items-center gap-1.5">
              <Icon name="pieChart" className="w-4 h-4 text-sky-600" />
              <span>Cashless Revenue by Payment Method</span>
            </h3>
            <span className="text-[11px] font-mono font-bold text-slate-500">
              Total: ฿{metrics.collectedRevenue.toLocaleString()} THB
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
            {Object.entries(metrics.methodBreakdown).map(([method, amount]) => {
              const pct = metrics.collectedRevenue > 0 ? Math.round((amount / metrics.collectedRevenue) * 100) : 0;
              return (
                <div key={method} className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-[11px] font-bold text-slate-600 truncate">{method}</div>
                  <div className="text-base font-black text-slate-900 mt-0.5">฿{amount.toLocaleString()}</div>
                  <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1">
                    <span>{pct}% share</span>
                  </div>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mt-1.5">
                    <div className="bg-sky-600 h-full rounded-full transition-all" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Reconciliation Progress Meter */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase text-slate-800 tracking-wider flex items-center gap-1.5">
                <Icon name="badgeCheck" className="w-4 h-4 text-emerald-600" />
                <span>Audit Reconciliation Meter</span>
              </h3>
              <span className="text-xs font-black font-mono text-emerald-700">{metrics.reconciliationRate}%</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Percentage of collected cashless revenue matched with bank deposits and gateway reports.
            </p>
          </div>

          <div className="space-y-2 pt-4">
            <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden border border-slate-200">
              <div
                className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full rounded-full transition-all"
                style={{ width: `${metrics.reconciliationRate}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] font-bold text-slate-500">
              <span>Reconciled: ฿{metrics.reconciledAmount.toLocaleString()}</span>
              <span>Pending: ฿{metrics.unreconciledAmount.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* INTERACTIVE AUDIT TOOLBAR & DATE PRESETS */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-4 print:hidden">
        
        {/* Date Presets Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-bold text-slate-400 mr-1 flex items-center gap-1">
              <Icon name="calendar" className="w-3.5 h-3.5" />
              <span>Period:</span>
            </span>
            {[
              { id: 'ALL', label: 'All Time' },
              { id: 'TODAY', label: 'Today' },
              { id: 'YESTERDAY', label: 'Yesterday' },
              { id: 'THIS_WEEK', label: 'This Week' },
              { id: 'THIS_MONTH', label: 'This Month' },
              { id: 'LAST_MONTH', label: 'Last Month' },
              { id: 'CUSTOM', label: 'Custom Range...' }
            ].map(preset => (
              <button
                key={preset.id}
                type="button"
                onClick={() => setDatePreset(preset.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  datePreset === preset.id
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>

          {datePreset === 'CUSTOM' && (
            <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-200 text-xs">
              <label className="text-[10px] font-bold text-slate-500 uppercase">From:</label>
              <input
                type="date"
                value={customStartDate}
                onChange={e => setCustomStartDate(e.target.value)}
                className="px-2 py-1 rounded-lg border border-slate-300 text-xs font-bold bg-white"
              />
              <label className="text-[10px] font-bold text-slate-500 uppercase">To:</label>
              <input
                type="date"
                value={customEndDate}
                onChange={e => setCustomEndDate(e.target.value)}
                className="px-2 py-1 rounded-lg border border-slate-300 text-xs font-bold bg-white"
              />
            </div>
          )}
        </div>

        {/* Dropdown Filters & Live Search */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Payment Status Filter */}
          <div>
            <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">
              Payment Status
            </label>
            <select
              value={paymentFilter}
              onChange={e => setPaymentFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold bg-white"
            >
              <option value="ALL">All Payment Statuses ({orders.length})</option>
              <option value="PAID">Paid (Gateway / QR)</option>
              <option value="PENDING">Awaiting Online Pay</option>
            </select>
          </div>

          {/* Reconciliation Status Filter */}
          <div>
            <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">
              Reconciliation Status
            </label>
            <select
              value={reconciliationFilter}
              onChange={e => setReconciliationFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold bg-white"
            >
              <option value="ALL">All Audit Statuses</option>
              <option value="UNRECONCILED">Unreconciled / Pending Verification</option>
              <option value="RECONCILED">Reconciled & Matched</option>
              <option value="DISCREPANCY">Discrepancy / Attention Needed</option>
            </select>
          </div>

          {/* Payment Method Filter */}
          <div>
            <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">
              Payment Method
            </label>
            <select
              value={methodFilter}
              onChange={e => setMethodFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold bg-white"
            >
              <option value="ALL">All Payment Methods</option>
              <option value="PromptPay">PromptPay QR</option>
              <option value="Card">Credit Card (Omise / Opn)</option>
              <option value="Bank">Direct Bank Transfer</option>
              <option value="Cash">Cash / Other</option>
            </select>
          </div>

          {/* Search Box */}
          <div>
            <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">
              Search Transactions
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="ID, customer, condo, ref #..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-300 text-xs font-medium"
              />
              <Icon name="search" className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            </div>
          </div>
        </div>

      </div>

      {/* BATCH RECONCILIATION FLOATING / ACTION BAR */}
      {selectedOrderIds.length > 0 && (
        <div className="p-4 rounded-2xl bg-sky-900 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-3 animate-fade-in print:hidden">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <div>
              <span className="font-bold text-sm">
                {selectedOrderIds.length} orders selected for batch reconciliation
              </span>
              <span className="text-xs text-sky-200 ml-2">
                (Total: ฿{filteredOrders
                  .filter(o => selectedOrderIds.includes(o.id))
                  .reduce((sum, o) => sum + (Number(o.totalPrice) || 0), 0)
                  .toLocaleString()} THB)
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <input
              type="text"
              placeholder="Bank/Batch Ref (e.g. BBL-Settlement)"
              value={batchBankRef}
              onChange={e => setBatchBankRef(e.target.value)}
              className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-900 bg-white border border-transparent focus:border-emerald-400"
            />
            <button
              type="button"
              disabled={isBatchSaving}
              onClick={handleExecuteBatchReconcile}
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-bold shadow-md transition disabled:opacity-50"
            >
              {isBatchSaving ? 'Reconciling...' : 'Mark Reconciled'}
            </button>
            <button
              type="button"
              onClick={() => setSelectedOrderIds([])}
              className="px-3 py-2 rounded-xl bg-sky-800 hover:bg-sky-700 text-xs font-semibold text-sky-200"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* RECONCILIATION AUDIT TRANSACTION TABLE */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4 w-10 text-center print:hidden">
                  <input
                    type="checkbox"
                    checked={filteredOrders.length > 0 && selectedOrderIds.length === filteredOrders.length}
                    onChange={handleToggleSelectAll}
                    className="rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                  />
                </th>
                <th className="py-3.5 px-4">Tracking ID & Date</th>
                <th className="py-3.5 px-4">Customer & Condo</th>
                <th className="py-3.5 px-4">Service & Scale Intake</th>
                <th className="py-3.5 px-4">Payment & Gateway Ref</th>
                <th className="py-3.5 px-4">Reconciliation Status</th>
                <th className="py-3.5 px-4">Bank Statement / Batch Ref</th>
                <th className="py-3.5 px-4 text-right print:hidden">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-slate-400">
                    No transactions match the selected filters or date period.
                  </td>
                </tr>
              ) : (
                filteredOrders.map(order => {
                  const isPaid = order.paymentStatus === 'PAID';
                  const reconStatus = order.reconciliationStatus || 'UNRECONCILED';
                  const isSelected = selectedOrderIds.includes(order.id);

                  let reconBadgeColor = 'bg-amber-100 text-amber-800 border-amber-300';
                  let reconIcon = 'clock';
                  if (reconStatus === 'RECONCILED') {
                    reconBadgeColor = 'bg-emerald-100 text-emerald-800 border-emerald-300';
                    reconIcon = 'checkCircle2';
                  } else if (reconStatus === 'DISCREPANCY') {
                    reconBadgeColor = 'bg-rose-100 text-rose-800 border-rose-300';
                    reconIcon = 'alertTriangle';
                  }

                  return (
                    <tr
                      key={order.id}
                      className={`hover:bg-slate-50/80 transition ${isSelected ? 'bg-sky-50/40' : ''}`}
                    >
                      <td className="py-3.5 px-4 text-center print:hidden">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelectOrder(order.id)}
                          className="rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                        />
                      </td>

                      {/* ID & Date */}
                      <td className="py-3.5 px-4">
                        <div className="font-mono font-bold text-slate-900">{order.id}</div>
                        <div className="text-[10px] text-slate-400">
                          {order.createdAt ? order.createdAt.replace('T', ' ').substring(0, 16) : order.pickupDate}
                        </div>
                        <div className="text-[10px] font-mono text-sky-600">{order.tagNumber}</div>
                      </td>

                      {/* Customer & Condo */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{order.customerName}</div>
                        <div className="text-[11px] text-slate-500 truncate max-w-xs">{order.condoName || 'Bangkok Residence'}</div>
                        <div className="text-[10px] text-slate-400 uppercase font-mono">{order.contactChannel}</div>
                      </td>

                      {/* Service & Weight */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800">{order.serviceName}</div>
                        <div className="text-[10px] text-slate-500">
                          Scale: <strong>{order.actualWeightKg !== null ? `${order.actualWeightKg} KG` : 'Pending weigh-in'}</strong>
                        </div>
                        <div className="text-[10px] text-slate-400">฿{order.pricePerKg}/KG (Min {order.minWeightAppliedKg || 4}KG)</div>
                      </td>

                      {/* Payment & Amount */}
                      <td className="py-3.5 px-4">
                        <div className="font-black text-slate-900 text-sm">฿{order.totalPrice} THB</div>
                        <div className="mt-0.5">
                          {isPaid ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                              <Icon name="check" className="w-2.5 h-2.5 text-emerald-700" />
                              <span>PAID ({order.paymentMethod || 'PromptPay'})</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                              <span>Awaiting Online Pay</span>
                            </span>
                          )}
                        </div>
                        {order.paymentRef && (
                          <div className="text-[10px] font-mono text-slate-400 mt-0.5 truncate max-w-[140px]">
                            Ref: {order.paymentRef}
                          </div>
                        )}
                      </td>

                      {/* Reconciliation Status */}
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black border ${reconBadgeColor}`}>
                          <Icon name={reconIcon} className="w-3 h-3" />
                          <span>{reconStatus}</span>
                        </span>
                        {order.reconciledAt && (
                          <div className="text-[10px] text-slate-400 mt-1">
                            Audited: {order.reconciledAt.replace('T', ' ').substring(0, 16)} by {order.reconciledBy || 'admin'}
                          </div>
                        )}
                      </td>

                      {/* Bank Statement Ref / Batch */}
                      <td className="py-3.5 px-4">
                        <div className="font-mono text-xs font-semibold text-slate-700">
                          {order.bankAccountRef || <span className="text-slate-300 italic">None assigned</span>}
                        </div>
                        {order.reconciliationNotes && (
                          <div className="text-[10px] text-slate-500 italic truncate max-w-xs mt-0.5">
                            "{order.reconciliationNotes}"
                          </div>
                        )}
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-right space-x-1.5 print:hidden">
                        <button
                          type="button"
                          onClick={() => handleOpenAuditModal(order)}
                          className="px-3 py-1.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 text-xs font-bold transition shadow-2xs"
                        >
                          Audit / Reconcile
                        </button>
                        {!isPaid && (
                          <button
                            type="button"
                            onClick={() => onMarkPaid && onMarkPaid(order.id, 'PromptPay QR (Gateway Test)')}
                            className="px-2.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold transition"
                            title="Mark transaction paid"
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

      {/* RECONCILIATION AUDIT MODAL */}
      {auditingOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-5 animate-scale-up">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="font-mono text-xs font-bold text-sky-600">{auditingOrder.id}</span>
                <h3 className="text-base font-black text-slate-900">
                  Transaction Audit & Reconciliation
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setAuditingOrder(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-800"
              >
                <Icon name="x" className="w-5 h-5" />
              </button>
            </div>

            {/* Order Overview Snapshot */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500 font-bold">Customer:</span>
                <span className="font-bold text-slate-900">{auditingOrder.customerName} ({auditingOrder.condoName || 'N/A'})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-bold">Service & Weight:</span>
                <span className="text-slate-800">{auditingOrder.serviceName} • {auditingOrder.actualWeightKg ? `${auditingOrder.actualWeightKg} KG (Scale)` : `${auditingOrder.estimatedWeightKg} KG (Est)`}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-bold">Invoice Total:</span>
                <span className="font-black text-slate-900 text-sm">฿{auditingOrder.totalPrice} THB</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-bold">Payment Status:</span>
                <span className={`font-bold ${auditingOrder.paymentStatus === 'PAID' ? 'text-emerald-700' : 'text-amber-700'}`}>
                  {auditingOrder.paymentStatus === 'PAID' ? `PAID via ${auditingOrder.paymentMethod || 'Gateway'}` : 'Awaiting Payment'}
                </span>
              </div>
              {auditingOrder.paymentRef && (
                <div className="flex justify-between font-mono text-[11px]">
                  <span className="text-slate-500">Gateway Slip Ref:</span>
                  <span className="text-sky-700 font-bold">{auditingOrder.paymentRef}</span>
                </div>
              )}
            </div>

            {/* Audit Form */}
            <form onSubmit={handleSaveSingleAudit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">
                  Reconciliation Classification
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'RECONCILED', label: 'Reconciled', desc: 'Matched statement', color: 'border-emerald-500 bg-emerald-50 text-emerald-800' },
                    { id: 'UNRECONCILED', label: 'Unreconciled', desc: 'Pending verification', color: 'border-amber-500 bg-amber-50 text-amber-800' },
                    { id: 'DISCREPANCY', label: 'Discrepancy', desc: 'Amount/Slip mismatch', color: 'border-rose-500 bg-rose-50 text-rose-800' }
                  ].map(opt => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setModalStatus(opt.id)}
                      className={`p-2.5 rounded-xl border text-center transition ${
                        modalStatus === opt.id
                          ? `${opt.color} ring-2 ring-offset-1 font-black`
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <div className="text-xs font-bold">{opt.label}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{opt.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Bank Statement Line / Settlement Batch Reference #
                </label>
                <input
                  type="text"
                  placeholder="e.g. BBL-PromptPay-2026-09-23 or Omise Payout #TR-8812"
                  value={modalBankRef}
                  onChange={e => setModalBankRef(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono font-bold bg-white text-xs"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Reference ID matching your Kasikorn, Bangkok Bank, or Omise gateway payout transfer report.
                </p>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Internal Accounting / Auditor Notes
                </label>
                <textarea
                  rows="3"
                  placeholder="e.g. Matched to Bangkok Bank statement line item #42. Received ฿380 on 2026-09-23."
                  value={modalNotes}
                  onChange={e => setModalNotes(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setAuditingOrder(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isModalSaving}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white shadow-md disabled:opacity-50"
                >
                  {isModalSaving ? 'Saving Audit...' : 'Save Audit Record'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>

      {/* =========================================================================
          DEDICATED EXECUTIVE PRINT REPORT (RENDERED ONLY WHEN PRINTING)
          ========================================================================= */}
      <div className="hidden print:block print-document space-y-5 text-slate-900 bg-white leading-normal p-1">
        
        {/* Formal Header / Letterhead */}
        <div className="border-b-2 border-slate-900 pb-3 flex justify-between items-start">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xl font-black tracking-tight text-slate-900 uppercase">
                NoName Laundry Bangkok
              </span>
            </div>
            <div className="text-[11px] font-bold text-slate-700">
              Commercial Laundry & Garment Care • 100% Digital Scale By-The-KG
            </div>
            <div className="text-[10px] text-slate-500 leading-tight">
              Sukhumvit / Asok Central Processing Facility • Bangkok 10110, Thailand<br />
              Tax ID: 0105562098412 • VAT Registered • Accounts & Finance Dept<br />
              Audit Inquiries: billing@nonamelaundry.com • LINE OA: @nonamelaundry
            </div>
          </div>

          <div className="text-right space-y-1">
            <div className="inline-block px-2.5 py-1 bg-slate-900 text-white font-mono text-[9px] font-black tracking-wider uppercase rounded">
              OFFICIAL FINANCIAL STATEMENT
            </div>
            <h1 className="text-sm font-black text-slate-900 uppercase tracking-tight mt-1">
              Sales & Transaction Audit Report
            </h1>
            <div className="text-[9.5px] text-slate-600 font-mono space-y-0.5">
              <div>Ref: <strong className="text-slate-900">NNL-AUD-{todayStr.replace(/-/g, '')}-{filteredOrders.length}</strong></div>
              <div>Date: <strong className="text-slate-900">{new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</strong> ({new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })})</div>
              <div>Period: <strong className="text-slate-900">{periodLabel}</strong></div>
              <div>Auditor: <strong className="text-slate-900">{adminUser?.username || 'admin'}</strong> • Currency: <strong>THB (฿)</strong></div>
            </div>
          </div>
        </div>

        {/* 1. Executive Financial Summary Grid */}
        <div className="space-y-1.5 print-avoid-break">
          <div className="text-[11px] font-black uppercase tracking-wider text-slate-800 border-b border-slate-300 pb-1">
            1. Executive Financial Summary
          </div>
          <div className="grid grid-cols-6 gap-2">
            <div className="p-2 rounded border border-slate-300 bg-slate-50">
              <div className="text-[8.5px] font-bold uppercase text-slate-500">Gross Sales</div>
              <div className="text-sm font-black text-slate-900 font-mono mt-0.5">
                ฿{metrics.grossRevenue.toLocaleString()}
              </div>
              <div className="text-[8.5px] text-slate-500">{filteredOrders.length} bookings</div>
            </div>

            <div className="p-2 rounded border border-slate-300 bg-slate-50">
              <div className="text-[8.5px] font-bold uppercase text-slate-500">Settled (Paid)</div>
              <div className="text-sm font-black text-slate-900 font-mono mt-0.5">
                ฿{metrics.collectedRevenue.toLocaleString()}
              </div>
              <div className="text-[8.5px] text-slate-500">{metrics.paidCount} cashless</div>
            </div>

            <div className="p-2 rounded border border-slate-300 bg-slate-50">
              <div className="text-[8.5px] font-bold uppercase text-slate-500">Receivables</div>
              <div className="text-sm font-black text-slate-900 font-mono mt-0.5">
                ฿{metrics.pendingReceivables.toLocaleString()}
              </div>
              <div className="text-[8.5px] text-slate-500">{filteredOrders.length - metrics.paidCount} unpaid</div>
            </div>

            <div className="p-2 rounded border border-slate-300 bg-slate-50">
              <div className="text-[8.5px] font-bold uppercase text-slate-500">Reconciled</div>
              <div className="text-sm font-black text-slate-900 font-mono mt-0.5">
                ฿{metrics.reconciledAmount.toLocaleString()}
              </div>
              <div className="text-[8.5px] text-slate-500">{metrics.reconciliationRate}% matched</div>
            </div>

            <div className="p-2 rounded border border-slate-300 bg-slate-50">
              <div className="text-[8.5px] font-bold uppercase text-slate-500">Unreconciled</div>
              <div className="text-sm font-black text-slate-900 font-mono mt-0.5">
                ฿{metrics.unreconciledAmount.toLocaleString()}
              </div>
              <div className="text-[8.5px] text-slate-500">{metrics.paidCount - metrics.reconciledCount} pending</div>
            </div>

            <div className="p-2 rounded border border-slate-300 bg-slate-50">
              <div className="text-[8.5px] font-bold uppercase text-slate-500">Discrepancies</div>
              <div className="text-sm font-black text-slate-900 font-mono mt-0.5">
                {metrics.discrepancyCount}
              </div>
              <div className="text-[8.5px] text-slate-500">Audit flags</div>
            </div>
          </div>
        </div>

        {/* 2. Cashless Settlement Breakdown by Channel */}
        <div className="space-y-1.5 print-avoid-break">
          <div className="text-[11px] font-black uppercase tracking-wider text-slate-800 border-b border-slate-300 pb-1">
            2. Cashless Settlement Channels
          </div>
          <table className="w-full text-left text-[9.5px] border border-slate-300">
            <thead className="bg-slate-100 text-slate-700 font-bold uppercase border-b border-slate-300">
              <tr>
                <th className="py-1 px-3">Payment Channel</th>
                <th className="py-1 px-3 text-right">Settled Amount (฿)</th>
                <th className="py-1 px-3 text-right">Share of Cashless</th>
                <th className="py-1 px-3">Gateway Settlement Routing</th>
                <th className="py-1 px-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {Object.entries(metrics.methodBreakdown).map(([method, amount]) => {
                const pct = metrics.collectedRevenue > 0
                  ? ((amount / metrics.collectedRevenue) * 100).toFixed(1)
                  : '0.0';
                return (
                  <tr key={method}>
                    <td className="py-1 px-3 font-bold text-slate-900">{method}</td>
                    <td className="py-1 px-3 text-right font-mono font-bold">฿{amount.toLocaleString()}</td>
                    <td className="py-1 px-3 text-right font-mono">{pct}%</td>
                    <td className="py-1 px-3 text-slate-600">
                      {method.includes('PromptPay') ? 'Bangkok Bank QR Merchant Settlement' :
                       method.includes('Credit') ? 'Omise Gateway Automated Payout' :
                       method.includes('Bank') ? 'Direct Corporate Account Transfer' : 'Direct Cash / Slip Verification'}
                    </td>
                    <td className="py-1 px-3 text-center font-bold text-slate-700">
                      {amount > 0 ? 'ACTIVE' : 'NO VOLUME'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* 3. Top Selling Service & Service Performance Matrix */}
        <div className="space-y-1.5 print-avoid-break">
          <div className="flex justify-between items-center border-b border-slate-300 pb-1">
            <div className="text-[11px] font-black uppercase tracking-wider text-slate-800">
              3. Service Performance & Certified Intake Weight Matrix
            </div>
            {servicesAnalysis.topSellerByRevenue && (
              <div className="text-[9.5px] font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-300">
                🏆 Top Seller: {servicesAnalysis.topSellerByRevenue.name} (฿{servicesAnalysis.topSellerByRevenue.totalRevenue.toLocaleString()} • {servicesAnalysis.topSellerByRevenue.revenueShare.toFixed(1)}% Share)
              </div>
            )}
          </div>
          <table className="w-full text-left text-[9.5px] border border-slate-300">
            <thead className="bg-slate-100 text-slate-700 font-bold uppercase border-b border-slate-300">
              <tr>
                <th className="py-1 px-2">#</th>
                <th className="py-1 px-3">Service Name</th>
                <th className="py-1 px-2 text-right">Standard Rate</th>
                <th className="py-1 px-2 text-right">Orders</th>
                <th className="py-1 px-2 text-right">Total Weight</th>
                <th className="py-1 px-2 text-right">Avg Bag</th>
                <th className="py-1 px-3 text-right">Gross Sales (฿)</th>
                <th className="py-1 px-2 text-right">Share (%)</th>
                <th className="py-1 px-2 text-right">Realized Yield</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {servicesAnalysis.list.map((srv, idx) => (
                <tr key={srv.id}>
                  <td className="py-1 px-2 font-mono text-slate-500">#{idx + 1}</td>
                  <td className="py-1 px-3 font-bold text-slate-900">
                    {srv.name} <span className="font-normal text-slate-500">({srv.nameTh})</span>
                  </td>
                  <td className="py-1 px-2 text-right font-mono">฿{srv.standardPricePerKg}/KG</td>
                  <td className="py-1 px-2 text-right font-bold">{srv.ordersCount}</td>
                  <td className="py-1 px-2 text-right font-mono">{srv.totalWeightKg.toFixed(1)} KG</td>
                  <td className="py-1 px-2 text-right font-mono">{srv.avgWeight.toFixed(1)} KG</td>
                  <td className="py-1 px-3 text-right font-mono font-bold">฿{srv.totalRevenue.toLocaleString()}</td>
                  <td className="py-1 px-2 text-right font-mono">{srv.revenueShare.toFixed(1)}%</td>
                  <td className="py-1 px-2 text-right font-mono font-bold text-slate-900">
                    ฿{srv.effectiveYield.toFixed(1)}/KG
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 4. Detailed Transaction Audit Ledger */}
        <div className="space-y-1.5">
          <div className="text-[11px] font-black uppercase tracking-wider text-slate-800 border-b border-slate-300 pb-1 flex justify-between items-center">
            <span>4. Detailed Transaction Audit Ledger ({filteredOrders.length} Records)</span>
            <span className="text-[9px] font-normal text-slate-500">
              Verified against central facility digital scales and bank gateway records
            </span>
          </div>
          <table className="w-full text-left text-[9px] border border-slate-300">
            <thead className="bg-slate-100 text-slate-700 font-bold uppercase border-b border-slate-300">
              <tr>
                <th className="py-1 px-2">Order ID / Tag</th>
                <th className="py-1 px-2">Date</th>
                <th className="py-1 px-3">Customer & Condo</th>
                <th className="py-1 px-2">Service</th>
                <th className="py-1 px-2 text-right">Scale KG</th>
                <th className="py-1 px-2 text-right">Total (฿)</th>
                <th className="py-1 px-2">Method</th>
                <th className="py-1 px-2 text-center">Audit Status</th>
                <th className="py-1 px-2">Statement / Batch Ref</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="9" className="py-4 text-center text-slate-400 italic">
                    No transactions found for the selected reporting period.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const reconStatus = order.reconciliationStatus || 'UNRECONCILED';
                  const datePart = (order.createdAt ? order.createdAt.split('T')[0] : (order.pickupDate || ''));
                  return (
                    <tr key={order.id} className="leading-tight">
                      <td className="py-1 px-2 font-mono font-bold text-slate-900">
                        {order.id}
                        {order.tagNumber && <span className="block text-[8px] text-slate-500 font-normal">#{order.tagNumber}</span>}
                      </td>
                      <td className="py-1 px-2 font-mono text-slate-600 whitespace-nowrap">{datePart}</td>
                      <td className="py-1 px-3 font-semibold text-slate-800">
                        {order.customerName}
                        {order.condoName && <span className="block text-[8px] text-slate-500 font-normal">{order.condoName} {order.roomNumber ? `• Rm ${order.roomNumber}` : ''}</span>}
                      </td>
                      <td className="py-1 px-2 text-slate-700">{order.serviceName || 'Wash & Fold'}</td>
                      <td className="py-1 px-2 text-right font-mono font-bold">
                        {order.weighedWeightKg ? `${order.weighedWeightKg} KG` : `${order.estimatedWeightKg || 4.0} KG (Est)`}
                      </td>
                      <td className="py-1 px-2 text-right font-mono font-black text-slate-900 whitespace-nowrap">
                        ฿{Number(order.totalPrice || 0).toLocaleString()}
                      </td>
                      <td className="py-1 px-2 text-slate-600 whitespace-nowrap">
                        {order.paymentMethod || 'PromptPay QR'}
                      </td>
                      <td className="py-1 px-2 text-center font-mono font-bold text-[8px]">
                        <span className={`inline-block px-1.5 py-0.5 rounded border ${
                          reconStatus === 'RECONCILED'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : reconStatus === 'DISCREPANCY'
                            ? 'bg-rose-50 text-rose-800 border-rose-300'
                            : 'bg-amber-50 text-amber-800 border-amber-300'
                        }`}>
                          {reconStatus}
                        </span>
                      </td>
                      <td className="py-1 px-2 font-mono text-[8px] text-slate-600 truncate max-w-[120px]">
                        {order.bankAccountRef || order.paymentRef || '—'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
            {filteredOrders.length > 0 && (
              <tfoot className="bg-slate-100 font-bold border-t-2 border-slate-300 text-[9.5px]">
                <tr>
                  <td colSpan="4" className="py-1.5 px-3 text-right uppercase text-slate-700">
                    Grand Totals ({filteredOrders.length} Bookings):
                  </td>
                  <td className="py-1.5 px-2 text-right font-mono">
                    {filteredOrders.reduce((sum, o) => sum + (Number(o.weighedWeightKg) || Number(o.estimatedWeightKg) || 4), 0).toFixed(1)} KG
                  </td>
                  <td className="py-1.5 px-2 text-right font-mono font-black text-slate-900">
                    ฿{metrics.grossRevenue.toLocaleString()}
                  </td>
                  <td colSpan="3" className="py-1.5 px-2 text-slate-600 text-[8.5px]">
                    Reconciled: ฿{metrics.reconciledAmount.toLocaleString()} ({metrics.reconciliationRate}%) • Receivables: ฿{metrics.pendingReceivables.toLocaleString()}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>

        {/* 5. Official Sign-off & Audit Certification */}
        <div className="pt-3 border-t-2 border-slate-900 space-y-3 print-avoid-break">
          <div className="grid grid-cols-2 gap-6 text-[9.5px]">
            <div className="border border-slate-300 p-2.5 rounded space-y-2">
              <div className="font-bold uppercase text-slate-700 tracking-wider">
                Prepared & Reconciled By (Operations / Accounts):
              </div>
              <div className="pt-5 border-b border-slate-400"></div>
              <div className="flex justify-between text-slate-600 font-mono text-[8.5px]">
                <span>Name: <strong>{adminUser?.username || 'Staff Auditor'}</strong></span>
                <span>Date: ____________________</span>
              </div>
              <div className="text-[8.5px] text-slate-400">
                Operations Supervisor / Digital Scale Audit Officer
              </div>
            </div>

            <div className="border border-slate-300 p-2.5 rounded space-y-2">
              <div className="font-bold uppercase text-slate-700 tracking-wider">
                Audited & Approved By (Management / Controller):
              </div>
              <div className="pt-5 border-b border-slate-400"></div>
              <div className="flex justify-between text-slate-600 font-mono text-[8.5px]">
                <span>Name: _______________________________</span>
                <span>Date: ____________________</span>
              </div>
              <div className="text-[8.5px] text-slate-400">
                Managing Director / Chief Financial Officer
              </div>
            </div>
          </div>

          <div className="text-center text-[8.5px] text-slate-400 pt-1.5 border-t border-slate-200">
            CONFIDENTIAL FINANCIAL DOCUMENT • NONAME LAUNDRY BANGKOK • ALL WEIGHTS DERIVED FROM CERTIFIED CENTRAL SCALES • STRICTLY FOR FINANCIAL & TAX AUDIT PURPOSES
          </div>
        </div>

      </div>
    </div>
  );
}

