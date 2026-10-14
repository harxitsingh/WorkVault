import React from 'react';
import { 
  AreaChart, Area, LineChart, Line, BarChart, Bar, 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { Download } from 'lucide-react';

const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

const revenueData = [
  { month: 'Jan', revenue: 450000 }, { month: 'Feb', revenue: 520000 },
  { month: 'Mar', revenue: 680000 }, { month: 'Apr', revenue: 750000 },
  { month: 'May', revenue: 890000 }, { month: 'Jun', revenue: 1050000 },
];

const registrationData = [
  { month: 'Jan', clients: 120, freelancers: 200 },
  { month: 'Feb', clients: 150, freelancers: 250 },
  { month: 'Mar', clients: 200, freelancers: 300 },
  { month: 'Apr', clients: 250, freelancers: 400 },
  { month: 'May', clients: 300, freelancers: 500 },
  { month: 'Jun', clients: 400, freelancers: 600 },
];

const dealCompletionData = [
  { month: 'Jan', completed: 85, total: 100 },
  { month: 'Feb', completed: 110, total: 130 },
  { month: 'Mar', completed: 140, total: 170 },
  { month: 'Apr', completed: 180, total: 200 },
  { month: 'May', completed: 210, total: 240 },
  { month: 'Jun', completed: 260, total: 290 },
];

const categoryData = [
  { name: 'Web Dev', count: 450 },
  { name: 'Design', count: 320 },
  { name: 'Writing', count: 210 },
  { name: 'Marketing', count: 180 },
  { name: 'Mobile Dev', count: 150 },
];

export default function AdminReports() {
  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Reports & Analytics</h1>
          <p className="text-slate-600">In-depth platform performance metrics.</p>
        </div>
        <div className="flex gap-4">
          <select className="px-4 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm">
            <option>Last 6 Months</option>
            <option>This Year</option>
            <option>Last Year</option>
          </select>
          <button className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg font-medium text-sm flex items-center gap-2 hover:bg-slate-50 shadow-sm">
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Revenue (YTD)', value: formatCurrency(4340000) },
          { label: 'Avg Deal Value', value: formatCurrency(35000) },
          { label: 'Completion Rate', value: '88.5%' },
          { label: 'User Retention', value: '74.2%' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
            <div className="text-sm font-medium text-slate-500 mb-1">{stat.label}</div>
            <div className="text-xl font-bold text-slate-900">{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Revenue Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h2 className="font-bold text-slate-900 mb-6">Platform Revenue (INR)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
              <YAxis axisLine={false} tickLine={false} tickFormatter={(val) => `₹${val/1000}k`} tick={{fill: '#64748b'}} />
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Area type="monotone" dataKey="revenue" stroke="#4f46e5" fill="#e0e7ff" strokeWidth={3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* User Registration */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h2 className="font-bold text-slate-900 mb-6">User Registration Trend</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={registrationData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="freelancers" name="Freelancers" stroke="#8b5cf6" strokeWidth={3} dot={false} />
              <Line type="monotone" dataKey="clients" name="Clients" stroke="#0ea5e9" strokeWidth={3} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        {/* Deal Completion */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h2 className="font-bold text-slate-900 mb-6">Deal Completion Rate</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dealCompletionData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
              <Tooltip />
              <Legend />
              <Bar dataKey="total" name="Total Deals" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
              <Bar dataKey="completed" name="Completed Deals" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Categories Distribution */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h2 className="font-bold text-slate-900 mb-6">Services by Category</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={categoryData} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
              <XAxis type="number" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
              <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#1e293b', fontWeight: 500}} />
              <Tooltip />
              <Bar dataKey="count" fill="#f59e0b" radius={[0, 4, 4, 0]} barSize={24} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
