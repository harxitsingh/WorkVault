import React, { useState } from 'react';
import { Save, Shield, Globe, Bell, Settings } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../../components/common/Button';

function TabButton({ active, onClick, icon, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-center px-3.5 py-2.5 text-xs font-semibold rounded-xl transition-colors ${
        active 
          ? 'bg-[#2F5BEA] text-white shadow-2xs' 
          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
      }`}
    >
      <span className="mr-2.5 shrink-0">{icon}</span>
      <span>{label}</span>
    </button>
  );
}

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(false);

  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('workvault_admin_settings');
      if (saved) return JSON.parse(saved);
    } catch {
      // Use defaults
    }
    return {
      platformFee: 10,
      maintenanceMode: false,
      allowRegistrations: true,
      maxUploadSize: 50,
      sessionTimeout: 120,
      strictPassword: true,
      notifyNewUsers: true,
      notifyNewDisputes: true,
      notifyLargeTx: true,
      notifySystemAlerts: true
    };
  });

  const handleSave = (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      localStorage.setItem('workvault_admin_settings', JSON.stringify(settings));
      setLoading(false);
      toast.success('Platform settings saved successfully');
    } catch (err) {
      setLoading(false);
      toast.error(err.message || 'Failed to save settings');
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Platform Configuration</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">Manage global marketplace rules, fees, and operational parameters.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/90 flex flex-col md:flex-row overflow-hidden min-h-[500px]">
        {/* Sidebar Tabs */}
        <div className="w-full md:w-60 bg-slate-50/70 border-r border-slate-200/80 p-4">
          <nav className="space-y-1">
            <TabButton active={activeTab === 'general'} onClick={() => setActiveTab('general')} icon={<Settings className="w-4 h-4"/>} label="General" />
            <TabButton active={activeTab === 'platform'} onClick={() => setActiveTab('platform')} icon={<Globe className="w-4 h-4"/>} label="Platform Rules" />
            <TabButton active={activeTab === 'security'} onClick={() => setActiveTab('security')} icon={<Shield className="w-4 h-4"/>} label="Security Policy" />
            <TabButton active={activeTab === 'notifications'} onClick={() => setActiveTab('notifications')} icon={<Bell className="w-4 h-4"/>} label="System Alerts" />
          </nav>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-6 sm:p-8">
          <form onSubmit={handleSave} className="space-y-6">
            {activeTab === 'general' && (
              <div className="max-w-2xl space-y-5">
                <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">General Platform Configuration</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Platform Name</label>
                    <input 
                      type="text" 
                      value="WorkVault" 
                      disabled 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-500 cursor-not-allowed" 
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Escrow Protocol</label>
                    <input 
                      type="text" 
                      value="Verifiable Milestone Escrow v1.0" 
                      disabled 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-500 cursor-not-allowed" 
                    />
                  </div>

                  <div>
                    <label htmlFor="admin_platform_fee" className="block text-xs font-semibold text-slate-700 mb-1">Default Platform Fee (%)</label>
                    <input 
                      id="admin_platform_fee"
                      type="number" 
                      min="0"
                      max="30"
                      value={settings.platformFee} 
                      onChange={(e) => setSettings({ ...settings, platformFee: Number(e.target.value) })}
                      className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2F5BEA]" 
                    />
                    <p className="text-[11px] text-slate-400 mt-1">Platform fee applied during milestone release calculations.</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'platform' && (
              <div className="max-w-2xl space-y-5">
                <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">Marketplace Operations</h2>
                <div className="space-y-3">
                  <label className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                    <div>
                      <span className="text-xs font-semibold text-slate-900 block">Allow New User Registrations</span>
                      <span className="text-[11px] text-slate-500">Enable public account creation for clients and freelancers</span>
                    </div>
                    <input 
                      type="checkbox" 
                      checked={settings.allowRegistrations} 
                      onChange={(e) => setSettings({ ...settings, allowRegistrations: e.target.checked })}
                      className="h-4 w-4 text-[#2F5BEA] rounded-md border-slate-300 focus:ring-[#2F5BEA]" 
                    />
                  </label>

                  <label className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                    <div>
                      <span className="text-xs font-semibold text-slate-900 block">Maintenance Mode</span>
                      <span className="text-[11px] text-slate-500">Restrict access while scheduled maintenance is in progress</span>
                    </div>
                    <input 
                      type="checkbox" 
                      checked={settings.maintenanceMode} 
                      onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
                      className="h-4 w-4 text-[#2F5BEA] rounded-md border-slate-300 focus:ring-[#2F5BEA]" 
                    />
                  </label>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="max-w-2xl space-y-5">
                <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">Security & Session Policies</h2>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="admin_session_timeout" className="block text-xs font-semibold text-slate-700 mb-1">Session Timeout (Minutes)</label>
                    <input 
                      id="admin_session_timeout"
                      type="number" 
                      value={settings.sessionTimeout} 
                      onChange={(e) => setSettings({ ...settings, sessionTimeout: Number(e.target.value) })}
                      className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2F5BEA]" 
                    />
                  </div>

                  <div>
                    <label htmlFor="admin_max_upload" className="block text-xs font-semibold text-slate-700 mb-1">Max Upload File Size (MB)</label>
                    <input 
                      id="admin_max_upload"
                      type="number" 
                      value={settings.maxUploadSize} 
                      onChange={(e) => setSettings({ ...settings, maxUploadSize: Number(e.target.value) })}
                      className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2F5BEA]" 
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="max-w-2xl space-y-5">
                <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">Admin Notification Triggers</h2>
                <div className="space-y-3">
                  <label className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                    <div>
                      <span className="text-xs font-semibold text-slate-900 block">Dispute Escalation Alerts</span>
                      <span className="text-[11px] text-slate-500">Alert admin when a client or freelancer files a formal dispute</span>
                    </div>
                    <input 
                      type="checkbox" 
                      checked={settings.notifyNewDisputes} 
                      onChange={(e) => setSettings({ ...settings, notifyNewDisputes: e.target.checked })}
                      className="h-4 w-4 text-[#2F5BEA] rounded-md border-slate-300 focus:ring-[#2F5BEA]" 
                    />
                  </label>

                  <label className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                    <div>
                      <span className="text-xs font-semibold text-slate-900 block">High-Value Escrow Transactions</span>
                      <span className="text-[11px] text-slate-500">Flag milestone payments exceeding threshold amounts</span>
                    </div>
                    <input 
                      type="checkbox" 
                      checked={settings.notifyLargeTx} 
                      onChange={(e) => setSettings({ ...settings, notifyLargeTx: e.target.checked })}
                      className="h-4 w-4 text-[#2F5BEA] rounded-md border-slate-300 focus:ring-[#2F5BEA]" 
                    />
                  </label>
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <Button type="submit" variant="primary" size="sm" isLoading={loading} icon={<Save size={14} />}>
                Save Platform Settings
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
