import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Save, Bell, Lock, Globe, CreditCard, KeyRound, ShieldCheck } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { userService } from '../../services/userService';

const FreelancerSettings = () => {
  const { user, updateUserState } = useAuth();
  const [activeTab, setActiveTab] = useState('notifications');
  const [isSaving, setIsSaving] = useState(false);

  const userId = user?.id || user?._id || 'me';
  const savedLocal = (() => {
    try {
      return JSON.parse(localStorage.getItem(`workvault_freelancer_settings_${userId}`)) || {};
    } catch {
      return {};
    }
  })();

  const { register, handleSubmit } = useForm({
    defaultValues: user?.settings?.freelancer || savedLocal || {
      emailNotifications: {
        newOrders: true,
        messages: true,
        payments: true,
        reminders: true
      },
      visibility: {
        profilePublic: true,
        availableForWork: true
      }
    }
  });

  const onSubmit = async (data) => {
    setIsSaving(true);
    try {
      const updatedUser = await userService.updateUser(userId, {
        settings: {
          ...(user?.settings || {}),
          freelancer: data
        }
      });
      updateUserState(updatedUser);
      localStorage.setItem(`workvault_freelancer_settings_${userId}`, JSON.stringify(data));
      toast.success('Freelancer settings saved successfully');
    } catch (error) {
      localStorage.setItem(`workvault_freelancer_settings_${userId}`, JSON.stringify(data));
      toast.success('Freelancer settings saved locally');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Freelancer Settings</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">Manage work availability, order alerts, and payout preferences.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Navigation Sidebar */}
        <div className="w-full md:w-60 space-y-1 shrink-0">
          <Card className="p-2 border border-slate-200/90 shadow-2xs">
            <nav className="flex flex-col space-y-1">
              {[
                { id: 'notifications', label: 'Order Notifications', icon: Bell },
                { id: 'privacy', label: 'Profile Visibility', icon: Globe },
                { id: 'payments', label: 'Payout Protocol', icon: CreditCard },
                { id: 'security', label: 'Security & Access', icon: Lock }
              ].map(tab => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center px-3.5 py-2.5 text-xs font-semibold rounded-xl transition-colors ${
                      isActive 
                        ? 'bg-[#2F5BEA] text-white shadow-2xs' 
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <Icon size={16} className="mr-2.5 shrink-0" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </Card>
        </div>

        {/* Content Area */}
        <div className="flex-1 min-w-0">
          <form onSubmit={handleSubmit(onSubmit)}>
            
            {activeTab === 'notifications' && (
              <Card className="p-6 border border-slate-200/90 shadow-sm space-y-6">
                <div>
                  <h2 className="text-sm font-bold text-slate-900 mb-1">Email Order Notifications</h2>
                  <p className="text-xs text-slate-500 mb-4">Choose which project lifecycle events trigger instant notifications.</p>
                  
                  <div className="space-y-3">
                    <label className="flex items-start p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                      <input 
                        type="checkbox" 
                        {...register("emailNotifications.newOrders")} 
                        className="mt-0.5 mr-3 w-4 h-4 text-[#2F5BEA] rounded border-slate-300 focus:ring-[#2F5BEA]" 
                      />
                      <div>
                        <span className="block text-xs font-semibold text-slate-800">New Deal Invitations</span>
                        <span className="block text-[11px] text-slate-500">Alert me when a client starts a deal for one of my services.</span>
                      </div>
                    </label>

                    <label className="flex items-start p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                      <input 
                        type="checkbox" 
                        {...register("emailNotifications.payments")} 
                        className="mt-0.5 mr-3 w-4 h-4 text-[#2F5BEA] rounded border-slate-300 focus:ring-[#2F5BEA]" 
                      />
                      <div>
                        <span className="block text-xs font-semibold text-slate-800">Escrow Milestone Funding & Release</span>
                        <span className="block text-[11px] text-slate-500">Alert me when funds are confirmed held or approved for payout.</span>
                      </div>
                    </label>

                    <label className="flex items-start p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                      <input 
                        type="checkbox" 
                        {...register("emailNotifications.reminders")} 
                        className="mt-0.5 mr-3 w-4 h-4 text-[#2F5BEA] rounded border-slate-300 focus:ring-[#2F5BEA]" 
                      />
                      <div>
                        <span className="block text-xs font-semibold text-slate-800">Milestone Deadline Reminders</span>
                        <span className="block text-[11px] text-slate-500">Receive reminders 48 hours before an agreed delivery deadline.</span>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-end">
                  <Button type="submit" variant="primary" size="sm" isLoading={isSaving} icon={<Save size={14} />}>
                    Save Preferences
                  </Button>
                </div>
              </Card>
            )}

            {activeTab === 'privacy' && (
              <Card className="p-6 border border-slate-200/90 shadow-sm space-y-6">
                <div>
                  <h2 className="text-sm font-bold text-slate-900 mb-1">Marketplace Visibility</h2>
                  <p className="text-xs text-slate-500 mb-4">Control how your talent card and listings appear in public search results.</p>
                  
                  <div className="space-y-3">
                    <label className="flex items-start p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                      <input 
                        type="checkbox" 
                        {...register("visibility.profilePublic")} 
                        className="mt-0.5 mr-3 w-4 h-4 text-[#2F5BEA] rounded border-slate-300 focus:ring-[#2F5BEA]" 
                      />
                      <div>
                        <span className="block text-xs font-semibold text-slate-800">Show Profile in Marketplace Search</span>
                        <span className="block text-[11px] text-slate-500">Allow prospective clients to find your services and profile on WorkVault.</span>
                      </div>
                    </label>

                    <label className="flex items-start p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                      <input 
                        type="checkbox" 
                        {...register("visibility.availableForWork")} 
                        className="mt-0.5 mr-3 w-4 h-4 text-[#2F5BEA] rounded border-slate-300 focus:ring-[#2F5BEA]" 
                      />
                      <div>
                        <span className="block text-xs font-semibold text-slate-800">Available for Immediate Orders</span>
                        <span className="block text-[11px] text-slate-500">Displays "Open for Work" badge on all active service cards.</span>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-end">
                  <Button type="submit" variant="primary" size="sm" isLoading={isSaving} icon={<Save size={14} />}>
                    Save Visibility
                  </Button>
                </div>
              </Card>
            )}

            {activeTab === 'payments' && (
              <Card className="p-6 border border-slate-200/90 shadow-sm space-y-5">
                <div className="border-b border-slate-100 pb-3">
                  <h2 className="text-sm font-bold text-slate-900">Escrow Payout Routing</h2>
                  <p className="text-xs text-slate-500">Payment settlement protocol for completed and released deals.</p>
                </div>

                <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200 text-xs text-blue-900 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-blue-950">
                    <ShieldCheck className="h-4 w-4 text-[#2F5BEA]" />
                    <span>Verifiable Escrow Ledger Integration</span>
                  </div>
                  <p className="leading-relaxed">
                    Released escrow balances are credited to your WorkVault balance upon client sign-off. Payouts are reconciled via Stripe Connect or local bank settlement upon verification.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-800">Direct Bank Transfer (NEFT/RTGS)</p>
                    <p className="text-[11px] text-slate-500">Settlements processed within 1-2 business days post release.</p>
                  </div>
                  <span className="px-2.5 py-1 text-[10px] font-bold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Active Ledger
                  </span>
                </div>
              </Card>
            )}

            {activeTab === 'security' && (
              <div className="space-y-4">
                <Card className="p-6 border border-slate-200/90 shadow-sm space-y-4">
                  <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 text-slate-900 font-bold text-sm">
                    <KeyRound className="h-4.5 w-4.5 text-[#2F5BEA]" />
                    <span>Credential Management</span>
                  </div>
                  
                  <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200 text-xs text-blue-900 space-y-2">
                    <p className="font-semibold text-blue-950">Password Policy Notice</p>
                    <p className="leading-relaxed">
                      Self-service password rotation is not active on this development instance. If you need to reset passwords for test accounts, please contact the local administrator at <span className="font-mono font-semibold">admin@workvault.local</span>.
                    </p>
                  </div>
                </Card>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default FreelancerSettings;
