import React, { useState } from 'react';
import { Save, Shield, Globe, Bell, Settings } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success('Settings saved successfully!');
    }, 800);
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Platform Settings</h1>
        <p className="text-slate-600">Configure global platform behavior and rules.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row overflow-hidden min-h-[600px]">
        {/* Sidebar Tabs */}
        <div className="w-full md:w-64 bg-slate-50 border-r border-slate-200 p-4">
          <nav className="space-y-1">
            <TabButton active={activeTab === 'general'} onClick={() => setActiveTab('general')} icon={<Settings className="w-4 h-4"/>} label="General" />
            <TabButton active={activeTab === 'platform'} onClick={() => setActiveTab('platform')} icon={<Globe className="w-4 h-4"/>} label="Platform Rules" />
            <TabButton active={activeTab === 'security'} onClick={() => setActiveTab('security')} icon={<Shield className="w-4 h-4"/>} label="Security" />
            <TabButton active={activeTab === 'notifications'} onClick={() => setActiveTab('notifications')} icon={<Bell className="w-4 h-4"/>} label="Notifications" />
          </nav>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-8">
          <form onSubmit={handleSave}>
            {activeTab === 'general' && (
              <div className="max-w-2xl space-y-6">
                <h2 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-4">General Settings</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Platform Name</label>
                    <input type="text" defaultValue="WorkVault" readOnly className="w-full px-4 py-2 bg-slate-100 border border-slate-300 rounded-lg text-slate-500 cursor-not-allowed" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Platform Fee Percentage (%)</label>
                    <input type="number" defaultValue="10" className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
                    <p className="mt-1 text-xs text-slate-500">This fee is deducted from the freelancer's earnings on successful deals.</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Primary Currency</label>
                    <input type="text" defaultValue="INR (₹)" readOnly className="w-full px-4 py-2 bg-slate-100 border border-slate-300 rounded-lg text-slate-500 cursor-not-allowed" />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'platform' && (
              <div className="max-w-2xl space-y-6">
                <h2 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-4">Platform Rules</h2>
                
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                    <div>
                      <div className="font-medium text-slate-900">Maintenance Mode</div>
                      <div className="text-sm text-slate-500">Temporarily disable platform access for users.</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                    <div>
                      <div className="font-medium text-slate-900">Allow New Registrations</div>
                      <div className="text-sm text-slate-500">Enable or disable new user signups.</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Max File Upload Size (MB)</label>
                    <input type="number" defaultValue="50" className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="max-w-2xl space-y-6">
                <h2 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-4">Security</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Session Timeout (minutes)</label>
                    <input type="number" defaultValue="120" className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                    <div>
                      <div className="font-medium text-slate-900">Strict Password Requirements</div>
                      <div className="text-sm text-slate-500">Require uppercase, number, and special character.</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>

                  <div className="pt-6 border-t border-slate-100">
                    <h3 className="font-medium text-slate-900 mb-4">Change Admin Password</h3>
                    <div className="space-y-4">
                      <input type="password" placeholder="Current Password" className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
                      <input type="password" placeholder="New Password" className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
                      <input type="password" placeholder="Confirm New Password" className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="max-w-2xl space-y-6">
                <h2 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-4">Notifications</h2>
                
                <div className="space-y-4">
                  {[
                    { title: 'New User Registrations', desc: 'Get emailed when a new user signs up.' },
                    { title: 'New Disputes', desc: 'Alert immediately when a dispute is opened.', on: true },
                    { title: 'Large Transactions', desc: 'Alert for transactions over ₹1,00,000.', on: true },
                    { title: 'System Alerts', desc: 'Critical system and server alerts.', on: true }
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                      <div>
                        <div className="font-medium text-slate-900">{item.title}</div>
                        <div className="text-sm text-slate-500">{item.desc}</div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" defaultChecked={item.on} className="sr-only peer" />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-8 pt-6 border-t border-slate-200">
              <button 
                type="submit" 
                disabled={loading}
                className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2 disabled:opacity-70"
              >
                {loading ? 'Saving...' : <><Save className="w-4 h-4" /> Save Changes</>}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function TabButton({ active, onClick, icon, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
        active 
          ? 'bg-indigo-50 text-indigo-700' 
          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
      }`}
    >
      {icon} {label}
    </button>
  );
}
