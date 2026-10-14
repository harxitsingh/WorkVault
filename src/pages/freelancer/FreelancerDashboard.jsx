import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { dealService } from "../../services/dealService";
import { paymentService } from "../../services/paymentService";
import { userService } from "../../services/userService";
import { formatCurrency, formatDate } from "../../utils/formatters";
import {
  Package,
  CheckCircle,
  Clock,
  Wallet,
  Star,
  ChevronRight,
  TrendingUp,
  ArrowRight,
  PlusCircle,
  FolderOpen
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import Card from "../../components/common/Card";
import StatusBadge from "../../components/common/StatusBadge";
import Avatar from "../../components/common/Avatar";
import EmptyState from "../../components/common/EmptyState";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import toast from "react-hot-toast";

const ChartTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-slate-200 rounded-xl shadow-lg">
        <p className="text-xs text-slate-500 mb-1">{label}</p>
        <p className="text-sm font-bold text-brand-primary">
          {formatCurrency(payload[0].value)}
        </p>
      </div>
    );
  }
  return null;
};

const FreelancerDashboard = () => {
  const { user } = useAuth();
  const [deals, setDeals] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [recentReviews, setRecentReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const loadDashboard = async () => {
      try {
        const userId = user?.id || user?._id;
        const [dealData, transactionData, reviewData] = await Promise.all([
          dealService.getDeals(),
          paymentService.getTransactions(),
          userId ? userService.getUserReviews(userId) : Promise.resolve([]),
        ]);
        if (active) {
          setDeals(dealData || []);
          setTransactions(transactionData || []);
          setRecentReviews((reviewData || []).slice(0, 3));
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
  }, [user]);

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
  const activeOrders = deals.filter((deal) =>
    activeStatuses.includes(deal.status),
  ).length;
  const completedOrders = deals.filter((deal) =>
    completedStatuses.includes(deal.status),
  ).length;
  const amountHeld = transactions
    .filter((transaction) => ["HELD", "held"].includes(transaction.status))
    .reduce((total, transaction) => total + Number(transaction.amount || 0), 0);
  const releasedEarnings = transactions
    .filter((transaction) =>
      ["RELEASED", "released"].includes(transaction.status),
    )
    .reduce((total, transaction) => total + Number(transaction.amount || 0), 0);

  const stats = [
    {
      label: "Active Orders",
      value: activeOrders,
      icon: Package,
      color: "bg-blue-50 text-brand-primary border-blue-100",
    },
    {
      label: "Completed",
      value: completedOrders,
      icon: CheckCircle,
      color: "bg-emerald-50 text-emerald-600 border-emerald-100",
    },
    {
      label: "Escrow Held",
      value: formatCurrency(amountHeld),
      icon: Clock,
      color: "bg-amber-50 text-amber-600 border-amber-100",
    },
    {
      label: "Released Earnings",
      value: formatCurrency(releasedEarnings),
      icon: Wallet,
      color: "bg-indigo-50 text-indigo-600 border-indigo-100",
    },
    {
      label: "Client Rating",
      value: user?.rating ? `${Number(user.rating).toFixed(1)} ★` : "New",
      icon: Star,
      color: "bg-amber-50 text-brand-accent border-amber-100",
    },
  ];

  const recentDeals = deals.slice(0, 5).map((deal) => ({
    id: deal.id || deal._id,
    serviceTitle: deal.service?.title || deal.title || "Untitled deal",
    clientName: deal.client?.name || deal.clientName || "Client",
    clientAvatar: deal.client?.avatar || deal.clientAvatar,
    createdAt: deal.createdAt,
    amount: Number(deal.amount || 0),
    status: deal.status,
  }));

  const monthlyEarningsData = transactions
    .reduce((months, transaction) => {
      if (!["RELEASED", "released"].includes(transaction.status)) return months;
      const name = transaction.createdAt
        ? new Date(transaction.createdAt).toLocaleString("en-IN", {
            month: "short",
          })
        : "Other";
      const entry = months.find((item) => item.name === name);
      if (entry) entry.earnings += Number(transaction.amount || 0);
      else months.push({ name, earnings: Number(transaction.amount || 0) });
      return months;
    }, [])
    .slice(-6);

  const completedOrdersData = deals
    .reduce((months, deal) => {
      if (!completedStatuses.includes(deal.status)) return months;
      const name = deal.createdAt
        ? new Date(deal.createdAt).toLocaleString("en-IN", { month: "short" })
        : "Other";
      const entry = months.find((item) => item.name === name);
      if (entry) entry.orders += 1;
      else months.push({ name, orders: 1 });
      return months;
    }, [])
    .slice(-6);

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Welcome back, {user?.name || "Freelancer"}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Track client deliveries, escrow milestones, and incoming earnings.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/freelancer/services/create"
            className="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-white bg-brand-primary rounded-xl shadow-xs hover:bg-brand-primary-hover transition-colors"
          >
            <PlusCircle className="w-4 h-4 mr-2" />
            Create Service
          </Link>
          <Link
            to="/freelancer/deals"
            className="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl shadow-2xs hover:bg-slate-50 transition-colors"
          >
            Active Orders
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {stats.map((stat, i) => (
          <div
            key={i}
            className="bg-white p-4.5 rounded-2xl shadow-2xs border border-slate-200/80 flex items-center space-x-3.5 hover:border-slate-300 transition-colors"
          >
            <div className={`p-2.5 rounded-xl border ${stat.color} shrink-0`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                {stat.label}
              </p>
              <p className="text-lg font-bold text-slate-900 mt-0.5">
                {stat.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 rounded-2xl shadow-2xs">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Monthly Earnings
              </h2>
              <p className="text-xs text-slate-500">Released escrow payouts</p>
            </div>
            <TrendingUp className="w-4 h-4 text-slate-400" />
          </div>
          <div className="h-64">
            {monthlyEarningsData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No released payouts recorded yet.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyEarningsData}>
                  <defs>
                    <linearGradient
                      id="colorEarnings"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#2F5BEA" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#2F5BEA" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#f1f5f9"
                  />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#94a3b8", fontSize: 11 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#94a3b8", fontSize: 11 }}
                    tickFormatter={(value) => `₹${value >= 1000 ? `${value / 1000}k` : value}`}
                  />
                  <Tooltip content={<ChartTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="earnings"
                    stroke="#2F5BEA"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorEarnings)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        <Card className="p-6 rounded-2xl shadow-2xs">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Completed Deliveries
              </h2>
              <p className="text-xs text-slate-500">Successfully closed contracts</p>
            </div>
            <CheckCircle className="w-4 h-4 text-slate-400" />
          </div>
          <div className="h-64">
            {completedOrdersData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No completed orders recorded yet.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={completedOrdersData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#f1f5f9"
                  />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#94a3b8", fontSize: 11 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#94a3b8", fontSize: 11 }}
                  />
                  <Tooltip cursor={{ fill: "#f8fafc" }} />
                  <Bar dataKey="orders" fill="#10b981" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>
      </div>

      {/* Orders and Reviews */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-base font-bold text-slate-900">Recent Orders</h2>
              <p className="text-xs text-slate-500">Active contracts needing delivery or review</p>
            </div>
            <Link
              to="/freelancer/deals"
              className="text-brand-primary hover:text-brand-primary-hover text-xs font-semibold flex items-center"
            >
              View All <ArrowRight size={14} className="ml-1" />
            </Link>
          </div>
          <Card className="overflow-hidden rounded-2xl shadow-2xs">
            <div className="divide-y divide-slate-100">
              {recentDeals.length > 0 ? (
                recentDeals.map((deal) => (
                  <div
                    key={deal.id}
                    className="p-4 flex items-center justify-between hover:bg-slate-50/70 transition-colors"
                  >
                    <div className="flex items-center space-x-3.5">
                      <Avatar
                        src={deal.clientAvatar}
                        name={deal.clientName}
                        size="md"
                      />
                      <div>
                        <p className="font-semibold text-sm text-slate-900 truncate max-w-xs">
                          {deal.serviceTitle}
                        </p>
                        <div className="flex items-center text-xs text-slate-400 space-x-2 mt-0.5">
                          <span>{deal.clientName}</span>
                          <span>&bull;</span>
                          <span>{formatDate(deal.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right hidden sm:block">
                        <p className="font-bold text-sm text-slate-900">
                          {formatCurrency(deal.amount)}
                        </p>
                        <div className="mt-0.5">
                          <StatusBadge status={deal.status} />
                        </div>
                      </div>
                      <Link
                        to={`/freelancer/deals/${deal.id}`}
                        className="p-1.5 text-slate-400 hover:text-brand-primary hover:bg-slate-100 rounded-lg transition-colors"
                      >
                        <ChevronRight size={18} />
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8">
                  <EmptyState
                    icon={FolderOpen}
                    title="No client orders yet"
                    description="Create high-quality marketplace listings to start receiving client deals."
                    action={
                      <Link
                        to="/freelancer/services/create"
                        className="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-white bg-brand-primary rounded-xl hover:bg-brand-primary-hover"
                      >
                        List a New Service
                      </Link>
                    }
                  />
                </div>
              )}
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-base font-bold text-slate-900">Recent Reviews</h2>
              <p className="text-xs text-slate-500">Client satisfaction feedback</p>
            </div>
            <Link
              to="/freelancer/reviews"
              className="text-brand-primary hover:text-brand-primary-hover text-xs font-semibold flex items-center"
            >
              View All <ArrowRight size={14} className="ml-1" />
            </Link>
          </div>
          <div className="space-y-3">
            {recentReviews.length > 0 ? (
              recentReviews.map((review) => (
                <Card key={review.id || review._id} className="p-4 rounded-2xl shadow-2xs">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center space-x-2.5">
                      <Avatar
                        name={review.reviewerName || "Client"}
                        size="sm"
                      />
                      <div>
                        <p className="text-xs font-bold text-slate-900">
                          {review.reviewerName || "Client"}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          {formatDate(review.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center text-brand-accent text-xs font-semibold">
                      <Star size={13} fill="currentColor" className="mr-1" />
                      <span>{review.rating}</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 line-clamp-2 mt-1">
                    {review.comment}
                  </p>
                </Card>
              ))
            ) : (
              <Card className="p-8 text-center text-xs text-slate-400 rounded-2xl shadow-2xs">
                No client reviews received yet.
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FreelancerDashboard;

