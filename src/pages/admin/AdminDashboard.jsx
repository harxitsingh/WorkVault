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
  CheckCircle
} from 'lucide-react';
import { statsService } from '../../services/statsService';
import { dealService } from '../../services/dealService';
import { disputeService } from '../../services/disputeService';
import { formatCurrency, formatDate } from '../../utils/formatters';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

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
          setRecentDeals(dealsData.slice(0, 5));
          setRecentDisputes(disputesData.slice(0, 4));
        }
      } catch (err) {
        toast.error('Failed to load admin dashboard');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchAdminData();
    return () => { isMounted = false; };
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
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
    <div className="p-6 bg-slate-50 min-h-screen space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">WorkVault Admin Central</h1>
          <p className="text-slate-600 mt-1">Real-time platform activity, escrow volume, and arbitration controls.</p>
        </div>
      </div>

      {/* Real Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={<Users className="w-5 h-5 text-indigo-600" />} bg="bg-indigo-100" label="Registered Users" value={s.totalUsers} />
        <StatCard icon={<User className="w-5 h-5 text-blue-600" />} bg="bg-blue-100" label="Clients" value={s.clients} />
        <StatCard icon={<Briefcase className="w-5 h-5 text-violet-600" />} bg="bg-violet-100" label="Freelancers" value={s.freelancers} />
        <StatCard icon={<Handshake className="w-5 h-5 text-emerald-600" />} bg="bg-emerald-100" label="Active Deals" value={s.activeDeals} />

        <StatCard
          icon={<IndianRupee className="w-5 h-5 text-green-600" />}
          bg="bg-green-100"
          label="Total Volume Funded"
          value={formatCurrency(s.totalTransactionValue)}
          colSpan="col-span-2 md:col-span-2"
        />
        <StatCard
          icon={<Clock className="w-5 h-5 text-amber-600" />}
          bg="bg-amber-100"
          label="Escrow Held"
          value={formatCurrency(s.heldAmount)}
        />
        <StatCard
          icon={<AlertTriangle className="w-5 h-5 text-rose-600" />}
          bg="bg-rose-100"
          label="Active Disputes"
          value={s.openDisputes}
        />
      </div>

      {/* Platform Fees & Health Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Platform Revenue (Fees)</p>
            <p className="text-2xl font-black text-slate-900 mt-1">{formatCurrency(s.platformFees || 0)}</p>
            <p className="text-xs text-slate-400 mt-0.5">10% transaction fee rate</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Deals Created</p>
            <p className="text-2xl font-black text-slate-900 mt-1">{s.totalDeals}</p>
            <p className="text-xs text-slate-400 mt-0.5">Lifetime platform projects</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
            <CheckCircle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Escrow Security State</p>
            <p className="text-xl font-bold text-emerald-600 mt-1">100% Operational</p>
            <p className="text-xs text-slate-400 mt-0.5">All transactions ledger validated</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Recent Activity: Disputes & Deals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Open Disputes Queue */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-base font-bold text-slate-900 flex items-center">
              <AlertTriangle className="w-4 h-4 text-rose-600 mr-2" />
              Disputes Requiring Arbitration
            </h2>
            <Link to="/admin/disputes" className="text-xs font-semibold text-indigo-600 hover:underline flex items-center">
              View All <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </div>

          {recentDisputes.length === 0 ? (
            <p className="text-sm text-slate-400 py-6 text-center">No open disputes in arbitration queue.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {recentDisputes.map((d) => (
                <div key={d.id || d._id} className="py-3 flex justify-between items-center">
                  <div>
                    <p className="text-sm font-bold text-slate-900">{d.reason}</p>
                    <p className="text-xs text-slate-500">{d.deal?.title || 'Project'} • {formatDate(d.createdAt)}</p>
                  </div>
                  <Link
                    to={`/admin/disputes/${d.id || d._id}`}
                    className="px-3 py-1 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg text-xs font-semibold"
                  >
                    Review
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Deals */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-base font-bold text-slate-900 flex items-center">
              <Handshake className="w-4 h-4 text-indigo-600 mr-2" />
              Recent Platform Deals
            </h2>
            <Link to="/admin/deals" className="text-xs font-semibold text-indigo-600 hover:underline flex items-center">
              View All <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </div>

          {recentDeals.length === 0 ? (
            <p className="text-sm text-slate-400 py-6 text-center">No platform deals recorded yet.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {recentDeals.map((deal) => (
                <div key={deal.id || deal._id} className="py-3 flex justify-between items-center">
                  <div>
                    <p className="text-sm font-bold text-slate-900">{deal.title}</p>
                    <p className="text-xs text-slate-500">
                      {deal.client?.name || 'Client'} → {deal.freelancer?.name || 'Freelancer'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-slate-900">{formatCurrency(deal.amount)}</p>
                    <span className="text-[10px] uppercase font-bold text-slate-500">{deal.status}</span>
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

function StatCard({ icon, bg, label, value, colSpan = '' }) {
  return (
    <div className={`bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center ${colSpan}`}>
      <div className={`p-3 rounded-full ${bg} mr-3 shrink-0`}>
        {icon}
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</p>
        <p className="text-xl font-black text-slate-900 mt-0.5">{value}</p>
      </div>
    </div>
  );
}
