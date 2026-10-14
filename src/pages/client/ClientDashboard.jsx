import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Briefcase,
  CheckCircle,
  Clock,
  IndianRupee,
  ChevronRight,
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
          setDeals(dealData);
          setTransactions(transactionData);
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
      color: "bg-indigo-500",
    },
    {
      name: "Completed Deals",
      value: completedDeals.length,
      icon: CheckCircle,
      color: "bg-emerald-500",
    },
    {
      name: "Amount Held",
      value: `₹ ${heldAmount.toLocaleString("en-IN")}`,
      icon: Clock,
      color: "bg-amber-500",
    },
    {
      name: "Amount Released",
      value: `₹ ${releasedAmount.toLocaleString("en-IN")}`,
      icon: IndianRupee,
      color: "bg-green-500",
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
    ...deal,
    service: deal.service?.title || deal.title || "Untitled deal",
    freelancer: deal.freelancerName || "Freelancer",
    date: deal.createdAt
      ? new Date(deal.createdAt).toLocaleDateString("en-IN")
      : "",
    displayStatus: deal.status,
  }));

  const activities = recentDeals.map((deal) => ({
    id: deal.id,
    text: `Deal "${deal.service}" is ${deal.status}`,
    time: deal.date || "Recently",
  }));

  const getStatusBadge = (status) => {
    const styles = {
      "In Progress": "bg-blue-100 text-blue-800",
      Submitted: "bg-amber-100 text-amber-800",
      Completed: "bg-emerald-100 text-emerald-800",
      "Payment Held": "bg-indigo-100 text-indigo-800",
    };
    return (
      <span
        className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status] || "bg-gray-100 text-gray-800"}`}
      >
        {status}
      </span>
    );
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.name || "Client"}
        </h1>
        <p className="text-gray-600 mt-1">
          Here's what's happening with your deals.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, i) => (
          <div
            key={i}
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4"
          >
            <div className={`p-3 rounded-lg text-white ${stat.color}`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">{stat.name}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            Monthly Spending (INR)
          </h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlySpending}>
                <defs>
                  <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#e5e7eb"
                />
                <XAxis
                  dataKey="month"
                  stroke="#6b7280"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#6b7280"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `₹${value / 1000}k`}
                />
                <RechartsTooltip
                  formatter={(value) => [`₹ ${value}`, "Amount"]}
                />
                <Area
                  type="monotone"
                  dataKey="amount"
                  stroke="#6366f1"
                  fillOpacity={1}
                  fill="url(#colorAmount)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            Deal Status Breakdown
          </h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={dealStatusData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#e5e7eb"
                />
                <XAxis
                  dataKey="name"
                  stroke="#6b7280"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#6b7280"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <RechartsTooltip />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-lg font-bold text-gray-900">Recent Deals</h2>
            <Link
              to="/client/deals"
              className="text-indigo-600 text-sm font-medium hover:text-indigo-700 flex items-center"
            >
              View All Deals <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                  <th className="p-4 font-medium">Service</th>
                  <th className="p-4 font-medium">Freelancer</th>
                  <th className="p-4 font-medium">Amount</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentDeals.map((deal) => (
                  <tr key={deal.id} className="hover:bg-gray-50">
                    <td className="p-4">
                      <p className="font-medium text-gray-900">
                        {deal.service}
                      </p>
                      <p className="text-xs text-gray-500">{deal.date}</p>
                    </td>
                    <td className="p-4 text-sm text-gray-700">
                      {deal.freelancer}
                    </td>
                    <td className="p-4 text-sm font-medium text-gray-900">
                      ₹ {deal.amount.toLocaleString("en-IN")}
                    </td>
                    <td className="p-4">
                      {getStatusBadge(deal.displayStatus)}
                    </td>
                    <td className="p-4">
                      <Link
                        to={`/client/deals/${deal.id}`}
                        className="text-indigo-600 text-sm font-medium hover:underline"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-900">Recent Activity</h2>
          </div>
          <div className="p-6">
            <div className="space-y-6">
              {activities.map((activity, index) => (
                <div key={activity.id} className="flex">
                  <div className="flex flex-col items-center mr-4">
                    <div className="w-2 h-2 rounded-full bg-indigo-500 mt-2"></div>
                    {index !== activities.length - 1 && (
                      <div className="w-px h-full bg-gray-200 mt-2"></div>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-gray-900">{activity.text}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
