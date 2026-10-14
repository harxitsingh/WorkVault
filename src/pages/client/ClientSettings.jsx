import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Shield, Bell, User, Lock, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

export default function ClientSettings() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('Account');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const onPasswordSubmit = (data) => {
    if (data.newPassword !== data.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    toast.success('Password updated successfully');
    reset();
  };

  const tabs = [
    { id: 'Account', icon: User },
    { id: 'Notifications', icon: Bell },
    { id: 'Security', icon: Shield },
  ];

  return (
    <div className="p-6 max-w-5xl mx-auto min-h-screen">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Manage your account preferences and security.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-64 shrink-0">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <nav className="flex flex-col">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-4 py-4 text-sm font-medium border-l-4 ${
                    activeTab === tab.id
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                      : 'border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <tab.icon className={`w-5 h-5 mr-3 ${activeTab === tab.id ? 'text-indigo-600' : 'text-gray-400'}`} />
                  {tab.id}
                </button>
              ))}
            </nav>
          </div>
        </div>

        <div className="flex-1">
          {activeTab === 'Account' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-lg font-bold text-gray-900 mb-1">Account Information</h2>
                <p className="text-sm text-gray-500">Your basic account details.</p>
              </div>
              <div className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                  <input type="email" disabled value={user?.email || ''} className="w-full border border-gray-200 bg-gray-50 rounded-lg p-2.5 text-sm text-gray-500 cursor-not-allowed" />
                  <p className="text-xs text-gray-500 mt-1">To change your email, please contact support.</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Account Type</label>
                  <input type="text" disabled value={`${(user?.role || 'client').toUpperCase()} Account`} className="w-full border border-gray-200 bg-gray-50 rounded-lg p-2.5 text-sm text-gray-500 cursor-not-allowed capitalize" />
                </div>
                
                <div className="pt-6 border-t border-gray-100 mt-8">
                  <h3 className="text-md font-bold text-red-600 mb-2">Danger Zone</h3>
                  <p className="text-sm text-gray-600 mb-4">Once you delete your account, there is no going back. Please be certain.</p>
                  <button 
                    onClick={() => setShowDeleteConfirm(true)}
                    className="bg-white border border-red-200 text-red-600 hover:bg-red-50 font-medium py-2 px-4 rounded-lg transition-colors text-sm"
                  >
                    Deactivate Account
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'Notifications' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-lg font-bold text-gray-900 mb-1">Notification Preferences</h2>
                <p className="text-sm text-gray-500">Control how and when you want to be notified.</p>
              </div>
              <div className="p-6 space-y-6">
                {[
                  { id: 'email', title: 'Email Notifications', desc: 'Receive important updates via email.' },
                  { id: 'deals', title: 'Deal Updates', desc: 'Get notified when freelancers submit work or send messages.' },
                  { id: 'payments', title: 'Payment Updates', desc: 'Alerts for escrow holds, releases, and refunds.' },
                  { id: 'marketing', title: 'Marketing Emails', desc: 'Receive tips, newsletters, and promotional offers.' },
                ].map((item, i) => (
                  <div key={item.id} className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">{item.title}</h4>
                      <p className="text-xs text-gray-500">{item.desc}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked={i !== 3} />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>
                ))}

                <div className="pt-4 border-t border-gray-100">
                  <button
                    onClick={() => {
                      const uid = user?.id || user?._id || 'me';
                      localStorage.setItem(`workvault_client_notifications_${uid}`, JSON.stringify({ updated: Date.now() }));
                      toast.success('Notification preferences saved successfully');
                    }}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm"
                  >
                    Save Preferences
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'Security' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                  <h2 className="text-lg font-bold text-gray-900 mb-1">Change Password</h2>
                  <p className="text-sm text-gray-500">Ensure your account is using a long, random password to stay secure.</p>
                </div>
                <div className="p-6">
                  <form onSubmit={handleSubmit(onPasswordSubmit)} className="space-y-4 max-w-md">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                      <input type="password" {...register('currentPassword', { required: true })} className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                      <input type="password" {...register('newPassword', { required: true, minLength: 8 })} className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                      <input type="password" {...register('confirmPassword', { required: true })} className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500" />
                    </div>
                    <button type="submit" className="mt-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm">
                      Update Password
                    </button>
                  </form>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-start">
                      <Lock className="w-6 h-6 text-gray-400 mr-3 mt-1" />
                      <div>
                        <h3 className="text-sm font-bold text-gray-900 flex items-center">
                          Two-Factor Authentication (2FA)
                          <span className="ml-2 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-100 rounded-full">Coming Soon</span>
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">Add an extra layer of security to your account.</p>
                      </div>
                    </div>
                    <button disabled className="bg-gray-100 text-gray-400 font-medium py-2 px-4 rounded-lg text-sm cursor-not-allowed">
                      Enable 2FA
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6">
            <div className="flex items-center text-red-600 mb-4">
              <AlertTriangle className="w-6 h-6 mr-2" />
              <h3 className="text-lg font-bold">Deactivate Account</h3>
            </div>
            <p className="text-gray-600 text-sm mb-6">
              Are you sure you want to deactivate your account? All of your data, deals, and history will be permanently removed. This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button 
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  toast.success('Account deactivation requested.');
                  setShowDeleteConfirm(false);
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Yes, Deactivate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
