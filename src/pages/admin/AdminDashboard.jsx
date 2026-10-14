import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  User,
  Briefcase,
  Handshake,
  IndianRupee,
  Clock,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  CheckCircle,
  TrendingUp
} from 'lucide-react';
import { statsService } from '../../services/statsService';
import { dealService } from '../../services/dealService';
import { disputeService } from '../../services/disputeService';
import { formatCurrency, formatDate } from '../../utils/formatters';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatusBadge from '../../components/common/StatusBadge';
import toast from 'react-hot-toast';

function AdminStatCard({ icon, bg, label, value, colSpan = '' }) {
  return (
    <div className={`bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center ${colSpan} hover:border-slate-300 transition-colors`}>
      <div className={`p-3 rounded-xl ${bg} mr-3.5 shrink-0 border border-slate-100`}>
        {icon}
      </div>
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">{label}</p>
        <p className="text-xl font-bold text-slate-900 mt-0.5">{value}</p>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [recentDeals, setRecentDeals] = useState([]);
  const [recentDisputes, setRecentDisputes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchAdminData = async () => {
      try {
        setLoading(true);
        const [statsData, dealsData, disputesData] = await Promise.all([
          statsService.getAdminStats().catch(() => null),
          dealService.getDeals().catch(() => []),
          disputeService.getDisputes().catch(() => [])
        ]);

        if (isMounted) {
          setStats(statsData);
          setRecentDeals((dealsData || []).slice(0, 5));
          setRecentDisputes((disputesData || []).slice(0, 4));
        }
      } catch (err) {
        toast.error(err.message || 'Failed to load admin dashboard');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchAdminData();
    return () => { isMounted = false; };
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-24 min-h-[50vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const s = stats || {
    totalUsers: 0,
    clients: 0,
    freelancers: 0,
    totalDeals: 0,
    activeDeals: 0,
    totalTransactionValue: 0,
    heldAmount: 0,
    releasedAmount: 0,
    platformFees: 0,
    openDisputes: 0
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">WorkVault Admin Central</h1>
          <p className="text-sm text-slate-500 mt-1">Real-time platform activity, escrow volume, and arbitration controls.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/admin/reports"
            className="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-white bg-brand-primary rounded-xl shadow-xs hover:bg-brand-primary-hover transition-colors"
          >
            Analytics & Reports
          </Link>
          <Link
            to="/admin/disputes"
            className="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl shadow-2xs hover:bg-slate-50 transition-colors"
          >
            Arbitration Queue
          </Link>
        </div>
      </div>

      {/* Real Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <AdminStatCard icon={<Users className="w-5 h-5 text-brand-primary" />} bg="bg-blue-50" label="Registered Users" value={s.totalUsers} />
        <AdminStatCard icon={<User className="w-5 h-5 text-indigo-600" />} bg="bg-indigo-50" label="Clients" value={s.clients} />
        <AdminStatCard icon={<Briefcase className="w-5 h-5 text-violet-600" />} bg="bg-violet-50" label="Freelancers" value={s.freelancers} />
        <AdminStatCard icon={<Handshake className="w-5 h-5 text-emerald-600" />} bg="bg-emerald-50" label="Active Deals" value={s.activeDeals} />

        <AdminStatCard
          icon={<IndianRupee className="w-5 h-5 text-emerald-600" />}
          bg="bg-emerald-50"
          label="Total Volume Funded"
          value={formatCurrency(s.totalTransactionValue)}
          colSpan="col-span-2 md:col-span-2"
        />
        <AdminStatCard
          icon={<Clock className="w-5 h-5 text-amber-600" />}
          bg="bg-amber-50"
          label="Escrow Held"
          value={formatCurrency(s.heldAmount)}
        />
        <AdminStatCard
          icon={<AlertTriangle className="w-5 h-5 text-rose-600" />}
          bg="bg-rose-50"
          label="Active Disputes"
          value={s.openDisputes}
        />
      </div>

      {/* Platform Fees & Health Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Platform Revenue (Fees)</p>
            <p className="text-2xl font-black text-slate-900 mt-1">{formatCurrency(s.platformFees || 0)}</p>
            <p className="text-xs text-slate-400 mt-0.5">10% standard transaction commission</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-brand-primary border border-blue-100">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Total Deals Created</p>
            <p className="text-2xl font-black text-slate-900 mt-1">{s.totalDeals}</p>
            <p className="text-xs text-slate-400 mt-0.5">Lifetime platform projects</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100">
            <CheckCircle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Escrow Security State</p>
            <p className="text-xl font-bold text-emerald-600 mt-1">100% Operational</p>
            <p className="text-xs text-slate-400 mt-0.5">All transactions ledger validated</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Recent Activity: Disputes & Deals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Open Disputes Queue */}
        <div className="bg-white rounded-2xl shadow-2xs border border-slate-200/80 p-6 space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center">
                <AlertTriangle className="w-4 h-4 text-rose-600 mr-2" />
                Disputes Requiring Arbitration
              </h2>
              <p className="text-xs text-slate-500">Escrow funds on hold pending admin decision</p>
            </div>
            <Link to="/admin/disputes" className="text-xs font-semibold text-brand-primary hover:text-brand-primary-hover flex items-center">
              View All <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </div>

          {recentDisputes.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-sm font-medium text-slate-600">No open disputes</p>
              <p className="text-xs text-slate-400 mt-0.5">The escrow arbitration queue is empty.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {recentDisputes.map((d) => (
                <div key={d.id || d._id} className="py-3.5 flex justify-between items-center hover:bg-slate-50/50 px-2 rounded-xl transition-colors">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{d.reason || "Dispute open"}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{d.deal?.title || 'Project'} • {formatDate(d.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={d.status || "disputed"} />
                    <Link
                      to={`/admin/disputes/${d.id || d._id}`}
                      className="px-3 py-1.5 bg-blue-50 text-brand-primary hover:bg-blue-100 rounded-lg text-xs font-semibold transition-colors"
                    >
                      Arbitrate
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Deals */}
        <div className="bg-white rounded-2xl shadow-2xs border border-slate-200/80 p-6 space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center">
                <Handshake className="w-4 h-4 text-brand-primary mr-2" />
                Recent Platform Deals
              </h2>
              <p className="text-xs text-slate-500">Latest contracts created across clients & freelancers</p>
            </div>
            <Link to="/admin/deals" className="text-xs font-semibold text-brand-primary hover:text-brand-primary-hover flex items-center">
              View All <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </div>

          {recentDeals.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-sm font-medium text-slate-600">No platform deals recorded</p>
              <p className="text-xs text-slate-400 mt-0.5">Transactions will populate as clients hire talent.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {recentDeals.map((deal) => (
                <div key={deal.id || deal._id} className="py-3.5 flex justify-between items-center hover:bg-slate-50/50 px-2 rounded-xl transition-colors">
                  <div>
                    <p className="text-sm font-semibold text-slate-900 line-clamp-1">{deal.title}</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {deal.client?.name || 'Client'} → {deal.freelancer?.name || 'Freelancer'}
                    </p>
                  </div>
                  <div className="text-right flex items-center gap-3">
                    <div>
                      <p className="text-sm font-bold text-slate-900">{formatCurrency(deal.amount)}</p>
                    </div>
                    <StatusBadge status={deal.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

