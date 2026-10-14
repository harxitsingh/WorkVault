import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { dealService } from "../../services/dealService";
import { paymentService } from "../../services/paymentService";
import { userService } from "../../services/userService";
import {
  formatCurrency,
  formatDate,
  getStatusColor,
  getStatusLabel,
} from "../../utils/formatters";
import {
  Package,
  CheckCircle,
  Clock,
  Wallet,
  Star,
  ChevronRight,
  TrendingUp,
  ArrowRight,
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
import LoadingSpinner from "../../components/common/LoadingSpinner";
import toast from "react-hot-toast";
import { getImageUrl, handleImageError } from "../../utils/imageHelper";

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
          setDeals(dealData);
          setTransactions(transactionData);
          setRecentReviews(reviewData.slice(0, 3));
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
      <div className="flex justify-center items-center py-20">
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
  const stats = {
    activeOrders,
    completedOrders,
    amountHeld,
    releasedEarnings,
    averageRating: user?.rating || 0,
  };
  const recentDeals = deals.slice(0, 5).map((deal) => ({
    ...deal,
    serviceTitle: deal.service?.title || deal.title || "Untitled deal",
    clientName: deal.clientName || "Client",
    createdAt: deal.createdAt,
    amount: Number(deal.amount || 0),
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

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-slate-200 rounded-lg shadow-lg">
          <p className="text-slate-600 mb-1">{label}</p>
          <p className="font-semibold text-indigo-600">
            {formatCurrency(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Welcome back, {user?.name || "Freelancer"}
        </h1>
        <p className="text-slate-500">
          Here's your freelancing activity overview.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
              <Package size={20} />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium">
                Active Orders
              </p>
              <p className="text-xl font-bold text-slate-900">
                {stats.activeOrders}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
              <CheckCircle size={20} />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium">Completed</p>
              <p className="text-xl font-bold text-slate-900">
                {stats.completedOrders}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-amber-100 text-amber-600 rounded-lg">
              <Clock size={20} />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium">Amount Held</p>
              <p className="text-xl font-bold text-slate-900">
                {formatCurrency(stats.amountHeld)}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 text-green-600 rounded-lg">
              <Wallet size={20} />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium">Released</p>
              <p className="text-xl font-bold text-slate-900">
                {formatCurrency(stats.releasedEarnings)}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-yellow-100 text-yellow-600 rounded-lg">
              <Star size={20} />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium">Avg Rating</p>
              <p className="text-xl font-bold text-slate-900">
                {stats.averageRating}
              </p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-slate-900">
              Monthly Earnings
            </h2>
            <div className="flex items-center text-sm text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
              <TrendingUp size={16} className="mr-1" />
              <span>+12%</span>
            </div>
          </div>
          <div className="h-64">
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
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#e2e8f0"
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b" }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b" }}
                  tickFormatter={(value) => `₹${value / 1000}k`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="earnings"
                  stroke="#4f46e5"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorEarnings)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-slate-900">
              Completed Orders
            </h2>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={completedOrdersData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#e2e8f0"
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b" }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b" }}
                />
                <Tooltip cursor={{ fill: "#f8fafc" }} />
                <Bar dataKey="orders" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-slate-900">Recent Orders</h2>
            <Link
              to="/freelancer/deals"
              className="text-indigo-600 hover:text-indigo-700 text-sm font-medium flex items-center"
            >
              View All <ArrowRight size={16} className="ml-1" />
            </Link>
          </div>
          <Card>
            <div className="divide-y divide-slate-200">
              {recentDeals.length > 0 ? (
                recentDeals.map((deal) => (
                  <div
                    key={deal.id}
                    className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden">
                        <img
                          src={getImageUrl(deal.clientAvatar, 'avatar')}
                          alt={deal.clientName || 'Client'}
                          onError={(e) => handleImageError(e, 'avatar')}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900 truncate max-w-50 sm:max-w-xs">
                          {deal.serviceTitle}
                        </p>
                        <div className="flex items-center text-sm text-slate-500 space-x-2">
                          <span>{deal.clientName}</span>
                          <span>&bull;</span>
                          <span>{formatDate(deal.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right hidden sm:block">
                        <p className="font-semibold text-slate-900">
                          {formatCurrency(deal.amount)}
                        </p>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(deal.status)}`}
                        >
                          {getStatusLabel(deal.status)}
                        </span>
                      </div>
                      <Link
                        to={`/freelancer/deals/${deal.id}`}
                        className="text-slate-400 hover:text-indigo-600"
                      >
                        <ChevronRight size={20} />
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-slate-500">
                  No recent orders.
                </div>
              )}
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-slate-900">Recent Reviews</h2>
            <Link
              to="/freelancer/reviews"
              className="text-indigo-600 hover:text-indigo-700 text-sm font-medium flex items-center"
            >
              View All <ArrowRight size={16} className="ml-1" />
            </Link>
          </div>
          <div className="space-y-4">
            {recentReviews.length > 0 ? (
              recentReviews.map((review) => (
                <Card key={review.id} className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-sm font-bold text-slate-600">
                        {review.reviewerName?.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">
                          {review.reviewerName}
                        </p>
                        <p className="text-xs text-slate-500">
                          {formatDate(review.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center text-yellow-400">
                      <Star size={14} fill="currentColor" />
                      <span className="ml-1 text-sm font-medium text-slate-700">
                        {review.rating}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 line-clamp-2">
                    {review.comment}
                  </p>
                </Card>
              ))
            ) : (
              <Card className="p-6 text-center text-slate-500">
                No reviews yet.
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FreelancerDashboard;
