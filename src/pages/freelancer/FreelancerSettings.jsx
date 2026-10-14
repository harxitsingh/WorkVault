import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Save, Bell, Lock, Globe, CreditCard } from 'lucide-react';
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
    } catch (e) {
      return {};
    }
  })();

  const { register, handleSubmit } = useForm({
    defaultValues: user?.settings?.freelancer || savedLocal || {
      emailNotifications: {
        newOrders: true,
        messages: true,
        payments: true,
        marketing: false,
        reminders: true
      },
      pushNotifications: {
        newOrders: true,
        messages: true
      },
      visibility: {
        profilePublic: true,
        showEarnings: false,
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
      toast.success('Settings saved successfully');
    } catch (error) {
      // Fallback save to localStorage
      localStorage.setItem(`workvault_freelancer_settings_${userId}`, JSON.stringify(data));
      toast.success('Settings saved successfully');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-500">Manage your account preferences and notifications.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar */}
        <div className="w-full md:w-64 space-y-1 shrink-0">
          <button
            onClick={() => setActiveTab('notifications')}
            className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
              activeTab === 'notifications' 
                ? 'bg-indigo-50 text-indigo-700' 
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <Bell size={18} className="mr-3" />
            Notifications
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
              activeTab === 'security' 
                ? 'bg-indigo-50 text-indigo-700' 
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <Lock size={18} className="mr-3" />
            Password & Security
          </button>
          <button
            onClick={() => setActiveTab('privacy')}
            className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
              activeTab === 'privacy' 
                ? 'bg-indigo-50 text-indigo-700' 
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <Globe size={18} className="mr-3" />
            Privacy & Visibility
          </button>
          <button
            onClick={() => setActiveTab('payments')}
            className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
              activeTab === 'payments' 
                ? 'bg-indigo-50 text-indigo-700' 
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <CreditCard size={18} className="mr-3" />
            Withdrawal Methods
          </button>
        </div>

        {/* Content */}
        <div className="flex-1">
          <form onSubmit={handleSubmit(onSubmit)}>
            
            {activeTab === 'notifications' && (
              <Card className="p-6 space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 mb-4">Email Notifications</h2>
                  <div className="space-y-4">
                    <label className="flex items-start">
                      <input type="checkbox" {...register("emailNotifications.newOrders")} className="mt-1 mr-3 w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500" />
                      <div>
                        <span className="block text-sm font-medium text-slate-700">New Orders</span>
                        <span className="block text-xs text-slate-500">Get notified when a client places a new order.</span>
                      </div>
                    </label>
                    <label className="flex items-start">
                      <input type="checkbox" {...register("emailNotifications.messages")} className="mt-1 mr-3 w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500" />
                      <div>
                        <span className="block text-sm font-medium text-slate-700">Messages</span>
                        <span className="block text-xs text-slate-500">Get notified when you receive a message from a client.</span>
                      </div>
                    </label>
                    <label className="flex items-start">
                      <input type="checkbox" {...register("emailNotifications.payments")} className="mt-1 mr-3 w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500" />
                      <div>
                        <span className="block text-sm font-medium text-slate-700">Payments & Escrow</span>
                        <span className="block text-xs text-slate-500">Get notified when funds are released or withdrawn.</span>
                      </div>
                    </label>
                    <label className="flex items-start">
                      <input type="checkbox" {...register("emailNotifications.reminders")} className="mt-1 mr-3 w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500" />
                      <div>
                        <span className="block text-sm font-medium text-slate-700">Delivery Reminders</span>
                        <span className="block text-xs text-slate-500">Get reminders when an order deadline is approaching.</span>
                      </div>
                    </label>
                  </div>
                </div>
              </Card>
            )}

            {activeTab === 'security' && (
              <Card className="p-6 space-y-6">
                <h2 className="text-lg font-bold text-slate-900 mb-4">Change Password</h2>
                <div className="space-y-4 max-w-md">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Current Password</label>
                    <input type="password" placeholder="••••••••" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">New Password</label>
                    <input type="password" placeholder="••••••••" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Confirm New Password</label>
                    <input type="password" placeholder="••••••••" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
                  </div>
                </div>
              </Card>
            )}

            {activeTab === 'privacy' && (
              <Card className="p-6 space-y-6">
                <h2 className="text-lg font-bold text-slate-900 mb-4">Visibility Settings</h2>
                <div className="space-y-4">
                  <label className="flex items-center justify-between">
                    <div>
                      <span className="block text-sm font-medium text-slate-700">Public Profile</span>
                      <span className="block text-xs text-slate-500">Allow clients to find your profile in search results.</span>
                    </div>
                    <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                      <input type="checkbox" {...register("visibility.profilePublic")} className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer border-indigo-500 bg-indigo-500 right-0" />
                      <label className="toggle-label block overflow-hidden h-5 rounded-full bg-indigo-500 cursor-pointer"></label>
                    </div>
                  </label>
                  
                  <label className="flex items-center justify-between">
                    <div>
                      <span className="block text-sm font-medium text-slate-700">Available for Work</span>
                      <span className="block text-xs text-slate-500">Show a badge indicating you are currently taking new orders.</span>
                    </div>
                    <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                      <input type="checkbox" {...register("visibility.availableForWork")} className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer border-indigo-500 bg-indigo-500 right-0" />
                      <label className="toggle-label block overflow-hidden h-5 rounded-full bg-indigo-500 cursor-pointer"></label>
                    </div>
                  </label>
                  
                  <label className="flex items-center justify-between">
                    <div>
                      <span className="block text-sm font-medium text-slate-700">Show Earnings</span>
                      <span className="block text-xs text-slate-500">Display your total earnings on your public profile.</span>
                    </div>
                    <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                      <input type="checkbox" {...register("visibility.showEarnings")} className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer border-slate-300 bg-slate-300 right-0" style={{ right: 'auto', left: 0 }} />
                      <label className="toggle-label block overflow-hidden h-5 rounded-full bg-slate-300 cursor-pointer"></label>
                    </div>
                  </label>
                </div>
              </Card>
            )}

            {activeTab === 'payments' && (
              <Card className="p-6 space-y-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-bold text-slate-900">Withdrawal Methods</h2>
                  <Button variant="outline" size="sm">+ Add Method</Button>
                </div>
                
                <div className="border border-slate-200 rounded-lg p-4 flex items-center justify-between bg-slate-50">
                  <div className="flex items-center">
                    <div className="w-12 h-8 bg-white border border-slate-200 rounded flex items-center justify-center font-bold text-slate-700 mr-4">
                      Bank
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">HDFC Bank **** 1234</p>
                      <p className="text-xs text-slate-500">Default &bull; Takes 1-3 business days</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700 hover:bg-red-50">Remove</Button>
                </div>
              </Card>
            )}

            {activeTab !== 'payments' && (
              <div className="mt-6 flex justify-end">
                <Button type="submit" className="flex items-center gap-2" disabled={isSaving}>
                  <Save size={16} />
                  {isSaving ? 'Saving...' : 'Save Settings'}
                </Button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default FreelancerSettings;
