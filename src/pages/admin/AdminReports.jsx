import React, { useState, useEffect } from 'react';
import { 
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { FileSpreadsheet, AlertCircle, PieChart as PieIcon, BarChart2, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminService } from '../../services/adminService';
import { statsService } from '../../services/statsService';
import { formatCurrency, formatDate } from '../../utils/formatters';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';

// Safe CSV cell escaping with formula injection protection
const escapeCsvCell = (val) => {
  if (val === null || val === undefined) return '""';
  let str = String(val).replace(/"/g, '""');
  // Neutralize formula injection in Excel/Calc: prefix =, +, -, @, tab, or carriage return with single quote
  if (/^[=+\-@\t\r]/.test(str)) {
    str = "'" + str;
  }
  return `"${str}"`;
};

export default function AdminReports() {
  const [loading, setLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [adminStats, setAdminStats] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [deals, setDeals] = useState([]);
  const [services, setServices] = useState([]);
  const [monthlyVolumeData, setMonthlyVolumeData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [roleData, setRoleData] = useState([]);
  const [dealStatusData, setDealStatusData] = useState([]);

  useEffect(() => {
    let isMounted = true;
    const fetchReportsData = async () => {
      try {
        setLoading(true);
        const [statsRes, txsRes, dealsRes, servsRes, usersRes] = await Promise.all([
          statsService.getAdminStats().catch(() => null),
          adminService.getTransactions().catch(() => []),
          adminService.getDeals().catch(() => []),
          adminService.getServices().catch(() => []),
          adminService.getUsers().catch(() => [])
        ]);

        if (!isMounted) return;

        setAdminStats(statsRes);
        setTransactions(txsRes || []);
        setDeals(dealsRes || []);
        setServices(servsRes || []);

        // 1. Calculate Real Monthly Transaction Volume
        const monthMap = {};
        (txsRes || []).forEach(tx => {
          if (!tx.createdAt) return;
          const d = new Date(tx.createdAt);
          const key = d.toLocaleString('en-US', { month: 'short', year: '2-digit' });
          if (!monthMap[key]) {
            monthMap[key] = { month: key, volume: 0, count: 0, sortDate: d.getTime() };
          }
          monthMap[key].volume += (tx.amount || 0);
          monthMap[key].count += 1;
        });

        const sortedMonths = Object.values(monthMap).sort((a, b) => a.sortDate - b.sortDate);
        setMonthlyVolumeData(sortedMonths);

        // 2. Calculate Real Category Distribution from published services
        const catMap = {};
        (servsRes || []).forEach(s => {
          const cat = s.category || 'Uncategorized';
          catMap[cat] = (catMap[cat] || 0) + 1;
        });
        const categoriesList = Object.keys(catMap).map(name => ({
          name,
          count: catMap[name]
        })).sort((a, b) => b.count - a.count);
        setCategoryData(categoriesList);

        // 3. User Role Composition
        const clientsCount = statsRes?.clients ?? (usersRes || []).filter(u => u.role === 'client').length;
        const freelancersCount = statsRes?.freelancers ?? (usersRes || []).filter(u => u.role === 'freelancer').length;
        const adminsCount = (usersRes || []).filter(u => u.role === 'admin').length;

        setRoleData([
          { name: 'Clients', value: clientsCount, color: '#2F5BEA' },
          { name: 'Freelancers', value: freelancersCount, color: '#10B981' },
          { name: 'Admins', value: adminsCount, color: '#8B5CF6' }
        ].filter(r => r.value > 0));

        // 4. Deal Status Distribution
        const statusMap = {};
        (dealsRes || []).forEach(d => {
          const s = (d.status || 'OTHER').toUpperCase();
          statusMap[s] = (statusMap[s] || 0) + 1;
        });
        const statusList = Object.keys(statusMap).map(status => ({
          status: status.replace('_', ' '),
          count: statusMap[status]
        }));
        setDealStatusData(statusList);

      } catch (err) {
        console.error('Failed to load admin analytics:', err);
        toast.error('Failed to load platform analytics');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchReportsData();
    return () => { isMounted = false; };
  }, []);

  // Professional CSV Export with UTF-8 BOM and Formula-Injection Protection
  const handleExportCSV = () => {
    if (transactions.length === 0 && deals.length === 0) {
      return toast.error('No transaction or deal records available for export.');
    }

    try {
      setIsExporting(true);

      const rows = [];
      // Section 1: Platform Overview
      rows.push(['WORKVAULT PLATFORM FINANCIAL & METRICS REPORT']);
      rows.push(['Generated At', new Date().toISOString()]);
      rows.push(['Total Transaction Volume', adminStats?.totalTransactionValue ?? 0]);
      rows.push(['Settled Escrow Released', adminStats?.releasedAmount ?? 0]);
      rows.push(['Escrow Currently Held', adminStats?.heldAmount ?? 0]);
      rows.push(['Platform Fee Earnings', adminStats?.platformFees ?? 0]);
      rows.push(['Total Users', adminStats?.totalUsers ?? 0]);
      rows.push(['Active Deals', adminStats?.activeDeals ?? 0]);
      rows.push(['Open Disputes', adminStats?.openDisputes ?? 0]);
      rows.push([]);

      // Section 2: Detailed Transaction Ledger
      rows.push(['TRANSACTIONS AUDIT LEDGER']);
      rows.push([
        'Transaction ID',
        'Date',
        'Type',
        'Status',
        'Amount (INR)',
        'Sender / Client',
        'Recipient / Freelancer',
        'Deal Title'
      ]);

      transactions.forEach(tx => {
        rows.push([
          tx.id || tx._id || '',
          tx.createdAt ? formatDate(tx.createdAt) : '',
          tx.type || 'PAYMENT',
          tx.status || '',
          tx.amount || 0,
          tx.client?.name || tx.sender?.name || '',
          tx.freelancer?.name || tx.recipient?.name || '',
          tx.deal?.title || tx.description || ''
        ]);
      });

      // Format as CSV text with quote escaping & formula injection sanitation
      const csvContent = rows
        .map(row => row.map(escapeCsvCell).join(','))
        .join('\r\n');

      // Prepend UTF-8 Byte Order Mark (BOM) so Excel respects UTF-8 encoding
      const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `workvault-admin-report-${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success('Platform audit CSV report downloaded successfully.');
    } catch (err) {
      console.error('Export failed:', err);
      toast.error('Failed to export CSV statement');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Reports & Platform Intelligence</h1>
          <p className="text-sm text-slate-500 mt-1">Live database ledger metrics, volume aggregation, and regulatory export.</p>
        </div>
        <Button 
          variant="primary"
          onClick={handleExportCSV}
          disabled={isExporting || (transactions.length === 0 && deals.length === 0)}
          className="gap-2 text-xs font-bold"
        >
          <FileSpreadsheet className="w-4 h-4" />
          {isExporting ? 'Generating Report...' : 'Export Platform CSV'}
        </Button>
      </div>

      {loading ? (
        <div className="py-24 flex justify-center items-center">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <>
          {/* Summary Metric Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="p-5 border border-slate-200 shadow-xs">
              <span className="text-xs uppercase font-bold text-slate-400 tracking-wider block mb-1">
                Settled Escrow Volume
              </span>
              <span className="text-2xl font-black text-slate-900">
                {formatCurrency(adminStats?.releasedAmount || 0)}
              </span>
              <span className="text-[11px] text-slate-500 mt-1 block">Successfully disbursed</span>
            </Card>

            <Card className="p-5 border border-slate-200 shadow-xs">
              <span className="text-xs uppercase font-bold text-slate-400 tracking-wider block mb-1">
                Escrow Held in Trust
              </span>
              <span className="text-2xl font-black text-slate-900">
                {formatCurrency(adminStats?.heldAmount || 0)}
              </span>
              <span className="text-[11px] text-amber-600 font-semibold mt-1 block">Active milestone locks</span>
            </Card>

            <Card className="p-5 border border-slate-200 shadow-xs">
              <span className="text-xs uppercase font-bold text-slate-400 tracking-wider block mb-1">
                Platform Fees Earned
              </span>
              <span className="text-2xl font-black text-slate-900">
                {formatCurrency(adminStats?.platformFees || 0)}
              </span>
              <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">Commission revenue</span>
            </Card>

            <Card className="p-5 border border-slate-200 shadow-xs">
              <span className="text-xs uppercase font-bold text-slate-400 tracking-wider block mb-1">
                Total Registered Users
              </span>
              <span className="text-2xl font-black text-slate-900">
                {adminStats?.totalUsers || 0}
              </span>
              <span className="text-[11px] text-slate-500 mt-1 block">
                {adminStats?.clients || 0} clients, {adminStats?.freelancers || 0} freelancers
              </span>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chart 1: Real Monthly Escrow Volume */}
            <Card className="p-6 border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  Monthly Transaction Volume (INR)
                </h2>
                <span className="text-xs text-slate-400 font-medium">From ledger records</span>
              </div>
              {monthlyVolumeData.length === 0 ? (
                <div className="h-64 flex flex-col justify-center items-center text-center text-slate-400">
                  <AlertCircle className="w-8 h-8 text-slate-300 mb-2" />
                  <p className="text-xs font-semibold">No recorded transaction volume yet</p>
                </div>
              ) : (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={monthlyVolumeData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                      <YAxis axisLine={false} tickLine={false} tickFormatter={(val) => `₹${val >= 1000 ? `${(val/1000).toFixed(0)}k` : val}`} tick={{ fill: '#64748b', fontSize: 11 }} />
                      <Tooltip formatter={(value) => [formatCurrency(value), 'Volume']} />
                      <Area type="monotone" dataKey="volume" stroke="#2F5BEA" fill="#2F5BEA" fillOpacity={0.15} strokeWidth={2.5} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </Card>

            {/* Chart 2: User Role Composition */}
            <Card className="p-6 border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <PieIcon className="w-4 h-4 text-primary" />
                  User Role Distribution
                </h2>
                <span className="text-xs text-slate-400 font-medium">Live accounts</span>
              </div>
              {roleData.length === 0 ? (
                <div className="h-64 flex flex-col justify-center items-center text-center text-slate-400">
                  <AlertCircle className="w-8 h-8 text-slate-300 mb-2" />
                  <p className="text-xs font-semibold">No registered user data</p>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={roleData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={85}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {roleData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value, name) => [`${value} accounts`, name]} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </Card>

            {/* Chart 3: Active Deals Status */}
            <Card className="p-6 border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <BarChart2 className="w-4 h-4 text-primary" />
                  Deals by Lifecycle State
                </h2>
                <span className="text-xs text-slate-400 font-medium">Total: {deals.length} deals</span>
              </div>
              {dealStatusData.length === 0 ? (
                <div className="h-64 flex flex-col justify-center items-center text-center text-slate-400">
                  <AlertCircle className="w-8 h-8 text-slate-300 mb-2" />
                  <p className="text-xs font-semibold">No deals created yet</p>
                </div>
              ) : (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dealStatusData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="status" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10 }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                      <Tooltip formatter={(val) => [`${val} deals`, 'Count']} />
                      <Bar dataKey="count" fill="#10B981" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </Card>

            {/* Chart 4: Service Offerings by Category */}
            <Card className="p-6 border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <BarChart2 className="w-4 h-4 text-primary" />
                  Service Listings by Category
                </h2>
                <span className="text-xs text-slate-400 font-medium">Total: {services.length} listings</span>
              </div>
              {categoryData.length === 0 ? (
                <div className="h-64 flex flex-col justify-center items-center text-center text-slate-400">
                  <AlertCircle className="w-8 h-8 text-slate-300 mb-2" />
                  <p className="text-xs font-semibold">No services published yet</p>
                </div>
              ) : (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={categoryData} layout="vertical" margin={{ left: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                      <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                      <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#1e293b', fontSize: 11, fontWeight: 600 }} />
                      <Tooltip formatter={(val) => [`${val} listings`, 'Count']} />
                      <Bar dataKey="count" fill="#F5A524" radius={[0, 6, 6, 0]} barSize={20} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
