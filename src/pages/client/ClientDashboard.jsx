import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Briefcase,
  CheckCircle,
  Clock,
  IndianRupee,
  ChevronRight,
  TrendingUp,
  FolderOpen
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { useAuth } from "../../context/AuthContext";
import { dealService } from "../../services/dealService";
import { paymentService } from "../../services/paymentService";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import StatusBadge from "../../components/common/StatusBadge";
import EmptyState from "../../components/common/EmptyState";
import { formatCurrency, formatDate } from "../../utils/formatters";
import toast from "react-hot-toast";

export default function ClientDashboard() {
  const { user } = useAuth();
  const [deals, setDeals] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const loadDashboard = async () => {
      try {
        const [dealData, transactionData] = await Promise.all([
          dealService.getDeals(),
          paymentService.getTransactions(),
        ]);
        if (active) {
          setDeals(dealData || []);
          setTransactions(transactionData || []);
        }
      } catch (error) {
        if (active)
          toast.error(error.message || "Failed to load dashboard data");
      } finally {
        if (active) setLoading(false);
      }
    };
    loadDashboard();
    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-24 min-h-[50vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const activeStatuses = [
    "CREATED",
    "FUNDED",
    "IN_PROGRESS",
    "SUBMITTED",
    "APPROVED",
    "active",
    "pending",
  ];
  const completedStatuses = ["RELEASED", "completed"];
  const activeDeals = deals.filter((deal) =>
    activeStatuses.includes(deal.status),
  );
  const completedDeals = deals.filter((deal) =>
    completedStatuses.includes(deal.status),
  );
  const heldAmount = transactions
    .filter((transaction) => ["HELD", "held"].includes(transaction.status))
    .reduce((total, transaction) => total + Number(transaction.amount || 0), 0);
  const releasedAmount = transactions
    .filter((transaction) =>
      ["RELEASED", "released"].includes(transaction.status),
    )
  .reduce((total, transaction) => total + Number(transaction.amount || 0), 0);

  const stats = [
    {
      name: "Active Deals",
      value: activeDeals.length,
      icon: Briefcase,
      color: "bg-blue-50 text-brand-primary border-blue-100",
    },
    {
      name: "Completed Deals",
      value: completedDeals.length,
      icon: CheckCircle,
      color: "bg-emerald-50 text-emerald-600 border-emerald-100",
    },
    {
      name: "Escrow Held",
      value: formatCurrency(heldAmount),
      icon: Clock,
      color: "bg-amber-50 text-amber-600 border-amber-100",
    },
    {
      name: "Total Released",
      value: formatCurrency(releasedAmount),
      icon: IndianRupee,
      color: "bg-indigo-50 text-indigo-600 border-indigo-100",
    },
  ];

  const monthlySpending = transactions
    .reduce((months, transaction) => {
      const month = transaction.createdAt
        ? new Date(transaction.createdAt).toLocaleString("en-IN", {
            month: "short",
          })
        : "Other";
      const entry = months.find((item) => item.month === month);
      if (entry) entry.amount += Number(transaction.amount || 0);
      else months.push({ month, amount: Number(transaction.amount || 0) });
      return months;
    }, [])
    .slice(-6);

  const dealStatusData = Object.entries(
    deals.reduce((counts, deal) => {
      counts[deal.status] = (counts[deal.status] || 0) + 1;
      return counts;
    }, {}),
  ).map(([name, count]) => ({ name, count }));

  const recentDeals = deals.slice(0, 5).map((deal) => ({
    id: deal.id || deal._id,
    service: deal.service?.title || deal.title || "Untitled deal",
    freelancer: deal.freelancer?.name || deal.freelancerName || "Freelancer",
    date: deal.createdAt ? formatDate(deal.createdAt) : "",
    amount: deal.amount || 0,
    status: deal.status,
  }));

  const activities = recentDeals.map((deal) => ({
    id: deal.id,
    text: `Deal "${deal.service}" is ${deal.status}`,
    time: deal.date || "Recently",
  }));

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Welcome back, {user?.name || "Client"}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Monitor your ongoing project milestones, escrow deposits, and contracts.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/marketplace"
            className="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-white bg-brand-primary rounded-xl shadow-xs hover:bg-brand-primary-hover transition-colors"
          >
            Find Freelancers
          </Link>
          <Link
            to="/client/deals"
            className="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl shadow-2xs hover:bg-slate-50 transition-colors"
          >
            My Deals
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div
            key={i}
            className="bg-white p-5 rounded-2xl shadow-2xs border border-slate-200/80 flex items-center space-x-4 hover:border-slate-300 transition-colors"
          >
            <div className={`p-3.5 rounded-xl border ${stat.color} shrink-0`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{stat.name}</p>
              <p className="text-xl font-bold text-slate-900 mt-0.5">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-2xs border border-slate-200/80">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Monthly Spending
              </h2>
              <p className="text-xs text-slate-500">Historical escrow releases</p>
            </div>
            <TrendingUp className="w-4 h-4 text-slate-400" />
          </div>
          <div className="h-64">
            {monthlySpending.length === 0 ? (
              <div className="h-full flex items-center justify-center text-sm text-slate-400">
                No recorded payment transactions yet.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlySpending}>
                  <defs>
                    <linearGradient id="clientColorAmount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2F5BEA" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#2F5BEA" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="month"
                    stroke="#94a3b8"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#94a3b8"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `₹${value >= 1000 ? `${value / 1000}k` : value}`}
                  />
                  <RechartsTooltip
                    formatter={(value) => [`₹ ${Number(value).toLocaleString("en-IN")}`, "Amount"]}
                  />
                  <Area
                    type="monotone"
                    dataKey="amount"
                    stroke="#2F5BEA"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#clientColorAmount)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-2xs border border-slate-200/80">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Deal Status Breakdown
              </h2>
              <p className="text-xs text-slate-500">Deals by operational phase</p>
            </div>
            <Briefcase className="w-4 h-4 text-slate-400" />
          </div>
          <div className="h-64">
            {dealStatusData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-sm text-slate-400">
                No deals initiated yet.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={dealStatusData}
                  margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="name"
                    stroke="#94a3b8"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#94a3b8"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />
                  <RechartsTooltip />
                  <Bar dataKey="count" fill="#2F5BEA" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Recent Deals Table and Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-2xs border border-slate-200/80 overflow-hidden">
          <div className="p-5 border-b border-slate-200/80 flex justify-between items-center bg-slate-50/50">
            <div>
              <h2 className="text-base font-bold text-slate-900">Recent Deals</h2>
              <p className="text-xs text-slate-500">Latest active contracts and milestones</p>
            </div>
            <Link
              to="/client/deals"
              className="text-brand-primary text-xs font-semibold hover:text-brand-primary-hover flex items-center"
            >
              View All Deals <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
            </Link>
          </div>
          {recentDeals.length === 0 ? (
            <div className="p-8">
              <EmptyState
                icon={FolderOpen}
                title="No active deals found"
                description="Explore talent across the marketplace and create your first protected escrow deal."
                action={
                  <Link
                    to="/marketplace"
                    className="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-white bg-brand-primary rounded-xl hover:bg-brand-primary-hover"
                  >
                    Browse Services
                  </Link>
                }
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/80 text-slate-500 text-[11px] font-semibold uppercase tracking-wider border-b border-slate-200/80">
                    <th className="py-3 px-4">Service</th>
                    <th className="py-3 px-4">Freelancer</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentDeals.map((deal) => (
                    <tr key={deal.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-sm text-slate-900 line-clamp-1">
                          {deal.service}
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">{deal.date}</p>
                      </td>
                      <td className="py-3.5 px-4 text-sm text-slate-700">
                        {deal.freelancer}
                      </td>
                      <td className="py-3.5 px-4 text-sm font-semibold text-slate-900">
                        {formatCurrency(deal.amount)}
                      </td>
                      <td className="py-3.5 px-4">
                        <StatusBadge status={deal.status} />
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Link
                          to={`/client/deals/${deal.id}`}
                          className="inline-flex items-center text-xs font-semibold text-brand-primary hover:text-brand-primary-hover hover:underline"
                        >
                          View Details
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-2xs border border-slate-200/80 flex flex-col">
          <div className="p-5 border-b border-slate-200/80 bg-slate-50/50">
            <h2 className="text-base font-bold text-slate-900">Recent Activity</h2>
            <p className="text-xs text-slate-500">Timeline of updates on your projects</p>
          </div>
          <div className="p-5 flex-1">
            {activities.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-400 py-10">
                No recent activity recorded.
              </div>
            ) : (
              <div className="space-y-4">
                {activities.map((activity, index) => (
                  <div key={activity.id || index} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="w-2.5 h-2.5 rounded-full bg-brand-primary mt-1.5 ring-4 ring-blue-50"></div>
                      {index !== activities.length - 1 && (
                        <div className="w-px flex-1 bg-slate-200 my-1"></div>
                      )}
                    </div>
                    <div className="pb-2">
                      <p className="text-xs font-medium text-slate-800">{activity.text}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {activity.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
