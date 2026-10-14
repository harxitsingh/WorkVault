import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Shield, Bell, User, Lock, AlertTriangle, KeyRound, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { userService } from '../../services/userService';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';

export default function ClientSettings() {
  const { user, updateUserState } = useAuth();
  const [activeTab, setActiveTab] = useState('Account');
  const [isSaving, setIsSaving] = useState(false);

  const userId = user?.id || user?._id || 'me';

  const [notificationPrefs, setNotificationPrefs] = useState(() => {
    try {
      const saved = localStorage.getItem(`workvault_client_notifications_${userId}`);
      if (saved) return JSON.parse(saved);
    } catch {
      // Use defaults
    }
    return {
      emailUpdates: true,
      dealActivity: true,
      escrowAlerts: true,
      marketing: false
    };
  });

  const handleSaveNotifications = async () => {
    setIsSaving(true);
    try {
      localStorage.setItem(`workvault_client_notifications_${userId}`, JSON.stringify(notificationPrefs));
      const updatedUser = await userService.updateUser(userId, {
        settings: {
          ...(user?.settings || {}),
          clientNotifications: notificationPrefs
        }
      });
      updateUserState(updatedUser);
      toast.success('Notification preferences saved successfully');
    } catch (err) {
      toast.success('Notification preferences saved locally');
    } finally {
      setIsSaving(false);
    }
  };

  const tabs = [
    { id: 'Account', icon: User, label: 'Account Overview' },
    { id: 'Notifications', icon: Bell, label: 'Notification Triggers' },
    { id: 'Security', icon: Shield, label: 'Security & Access' },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Client Settings</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">Manage preferences, alert configurations, and escrow policies.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Navigation Tabs */}
        <div className="w-full md:w-60 shrink-0">
          <Card className="p-2 border border-slate-200/90 shadow-2xs">
            <nav className="flex flex-col space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center px-3.5 py-2.5 text-xs font-semibold rounded-xl transition-colors ${
                      isActive
                        ? 'bg-[#2F5BEA] text-white shadow-2xs'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-2.5 shrink-0" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </Card>
        </div>

        {/* Tab Content Panels */}
        <div className="flex-1 min-w-0">
          {activeTab === 'Account' && (
            <Card className="p-6 border border-slate-200/90 shadow-sm space-y-6">
              <div className="border-b border-slate-100 pb-3">
                <h2 className="text-sm font-bold text-slate-900">Account Identity</h2>
                <p className="text-xs text-slate-500">Core user parameters associated with your WorkVault client profile.</p>
              </div>

              <div className="space-y-4 max-w-lg">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                  <input 
                    type="email" 
                    disabled 
                    value={user?.email || ''} 
                    className="w-full border border-slate-200 bg-slate-50 rounded-xl p-2.5 text-xs text-slate-500 cursor-not-allowed" 
                  />
                  <p className="text-[11px] text-slate-400 mt-1">Verified authentication identifier.</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Active Account Type</label>
                  <input 
                    type="text" 
                    disabled 
                    value="Client (Escrow Buyer)" 
                    className="w-full border border-slate-200 bg-slate-50 rounded-xl p-2.5 text-xs text-slate-500 cursor-not-allowed" 
                  />
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100">
                <h3 className="text-xs font-bold uppercase tracking-wider text-rose-600 mb-1">Account Closure</h3>
                <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                  To protect open escrow funds and active milestone records, account deactivation requires zero unsettled balance reconciliation. Contact support to request closure.
                </p>
                <button 
                  disabled
                  className="bg-slate-100 border border-slate-200 text-slate-400 font-medium py-2 px-3.5 rounded-xl text-xs cursor-not-allowed"
                >
                  Deactivate Account (Disabled)
                </button>
              </div>
            </Card>
          )}

          {activeTab === 'Notifications' && (
            <Card className="p-6 border border-slate-200/90 shadow-sm space-y-6">
              <div className="border-b border-slate-100 pb-3">
                <h2 className="text-sm font-bold text-slate-900">Notification Triggers</h2>
                <p className="text-xs text-slate-500">Configure which event alerts you wish to receive during active deal operations.</p>
              </div>

              <div className="space-y-4">
                <label className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                  <div>
                    <h4 className="text-xs font-semibold text-slate-900">Email Milestone Updates</h4>
                    <p className="text-[11px] text-slate-500">Receive an email whenever a freelancer submits milestone deliverables</p>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={notificationPrefs.emailUpdates} 
                    onChange={(e) => setNotificationPrefs({ ...notificationPrefs, emailUpdates: e.target.checked })}
                    className="h-4 w-4 text-[#2F5BEA] rounded-md border-slate-300 focus:ring-[#2F5BEA]" 
                  />
                </label>

                <label className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                  <div>
                    <h4 className="text-xs font-semibold text-slate-900">Escrow Transaction Alerts</h4>
                    <p className="text-[11px] text-slate-500">Receive confirmation alerts when escrow funds are held, released, or refunded</p>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={notificationPrefs.escrowAlerts} 
                    onChange={(e) => setNotificationPrefs({ ...notificationPrefs, escrowAlerts: e.target.checked })}
                    className="h-4 w-4 text-[#2F5BEA] rounded-md border-slate-300 focus:ring-[#2F5BEA]" 
                  />
                </label>

                <label className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                  <div>
                    <h4 className="text-xs font-semibold text-slate-900">Deal Chat Messages</h4>
                    <p className="text-[11px] text-slate-500">Alerts when messages or revisions are posted on active deals</p>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={notificationPrefs.dealActivity} 
                    onChange={(e) => setNotificationPrefs({ ...notificationPrefs, dealActivity: e.target.checked })}
                    className="h-4 w-4 text-[#2F5BEA] rounded-md border-slate-300 focus:ring-[#2F5BEA]" 
                  />
                </label>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <Button 
                  variant="primary" 
                  size="sm" 
                  onClick={handleSaveNotifications}
                  isLoading={isSaving}
                >
                  Save Notification Preferences
                </Button>
              </div>
            </Card>
          )}

          {activeTab === 'Security' && (
            <div className="space-y-6">
              <Card className="p-6 border border-slate-200/90 shadow-sm space-y-4">
                <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 text-slate-900 font-bold text-sm">
                  <KeyRound className="h-4.5 w-4.5 text-[#2F5BEA]" />
                  <span>Credential Management</span>
                </div>
                
                <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200 text-xs text-blue-900 space-y-2">
                  <p className="font-semibold text-blue-950">Password Policy Notice</p>
                  <p className="leading-relaxed">
                    Automated self-service password reset is not configured on this development server. If you require credential rotation for test accounts, please contact the local system administrator at <span className="font-mono font-semibold">admin@workvault.local</span>.
                  </p>
                </div>

                <div className="pt-2">
                  <h4 className="text-xs font-semibold text-slate-700 mb-1">Active Authentication Method</h4>
                  <p className="text-xs text-slate-500">JSON Web Token (JWT) Bearer Authentication with 24-hour expiration.</p>
                </div>
              </Card>

              <Card className="p-6 border border-slate-200/90 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-slate-100 text-slate-500">
                      <Lock size={18} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 flex items-center gap-2">
                        <span>Two-Factor Authentication (2FA)</span>
                        <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                          Unavailable
                        </span>
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">TOTP/SMS hardware 2FA is planned for production release.</p>
                    </div>
                  </div>
                  <button 
                    disabled 
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed"
                  >
                    Configure
                  </button>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
