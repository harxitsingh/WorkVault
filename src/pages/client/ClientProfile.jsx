import React, { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { MapPin, Mail, Phone, Calendar, Briefcase, Star, Edit2, X, Camera } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { userService } from '../../services/userService';
import { statsService } from '../../services/statsService';
import { getImageUrl, handleImageError } from '../../utils/imageHelper';

export default function ClientProfile() {
  const { user, updateUserState } = useAuth();
  const fileInputRef = useRef(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      location: user?.location || '',
      company: user?.company || '',
      bio: user?.bio || ''
    }
  });

  useEffect(() => {
    if (user) {
      reset({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        location: user.location || '',
        company: user.company || '',
        bio: user.bio || ''
      });
    }
  }, [user, reset]);

  const onSubmit = async (data) => {
    setIsSaving(true);
    try {
      const userId = user?.id || user?._id || 'me';
      const updatedUser = await userService.updateUser(userId, {
        name: data.name,
        phone: data.phone,
        location: data.location,
        company: data.company,
        bio: data.bio
      });
      updateUserState(updatedUser);
      toast.success('Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Only JPG, PNG, and WEBP image formats are supported.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be 5MB or less.');
      return;
    }

    if (avatarPreview) {
      URL.revokeObjectURL(avatarPreview);
    }

    setSelectedFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleCancelAvatar = () => {
    if (avatarPreview) {
      URL.revokeObjectURL(avatarPreview);
    }
    setAvatarPreview(null);
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSaveAvatar = async () => {
    if (!selectedFile) return;
    setUploadingAvatar(true);
    try {
      const uploadRes = await statsService.uploadFile(selectedFile, 'avatar');
      const newUrl = uploadRes.url || uploadRes.fileUrl;
      const userId = user?.id || user?._id || 'me';
      const updatedUser = await userService.updateUser(userId, {
        avatar: newUrl,
        profileImage: newUrl
      });
      updateUserState(updatedUser);
      toast.success('Profile photo updated successfully!');
      handleCancelAvatar();
    } catch (err) {
      toast.error(err.message || 'Failed to upload photo');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  const memberYear = user?.createdAt ? new Date(user.createdAt).getFullYear() : 2025;

  return (
    <div className="p-6 max-w-5xl mx-auto min-h-screen">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
        <div className="h-32 bg-gradient-to-r from-indigo-500 to-purple-600"></div>
        <div className="px-6 pb-6 relative">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end -mt-12 mb-4 gap-4">
            <div className="flex items-center sm:items-end gap-4">
              <div className="relative group">
                <div className="w-24 h-24 rounded-full bg-white p-1 border border-gray-200 shadow-md relative overflow-hidden">
                  <img
                    src={avatarPreview || getImageUrl(user?.avatar || user?.profileImage, 'avatar')}
                    alt={user?.name || 'User'}
                    onError={(e) => handleImageError(e, 'avatar')}
                    className="w-full h-full rounded-full object-cover"
                  />
                  {uploadingAvatar && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-xs font-semibold rounded-full">
                      Saving...
                    </div>
                  )}
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingAvatar}
                  className="absolute bottom-0 right-0 p-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-md border-2 border-white transition-transform hover:scale-110"
                  title="Change profile photo"
                >
                  <Camera size={14} />
                </button>
              </div>

              {avatarPreview && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSaveAvatar}
                    disabled={uploadingAvatar}
                    className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm"
                  >
                    {uploadingAvatar ? 'Saving...' : 'Save Photo'}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelAvatar}
                    disabled={uploadingAvatar}
                    className="px-3 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold rounded-lg"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>

            {!isEditing && (
              <button 
                onClick={() => setIsEditing(true)}
                className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium py-2 px-4 rounded-lg flex items-center transition-colors"
              >
                <Edit2 className="w-4 h-4 mr-2" /> Edit Profile
              </button>
            )}
          </div>
          
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{user?.name || 'User Profile'}</h1>
            <div className="flex flex-wrap items-center mt-2 text-sm text-gray-600 gap-4">
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 font-medium text-xs capitalize">
                {user?.role || 'Client'}
              </span>
              <span className="flex items-center"><MapPin className="w-4 h-4 mr-1 text-gray-400" /> {user?.location || 'India'}</span>
              <span className="flex items-center"><Calendar className="w-4 h-4 mr-1 text-gray-400" /> Member since {memberYear}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {isEditing ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
                <h2 className="text-lg font-bold text-gray-900">Edit Profile</h2>
                <button onClick={() => setIsEditing(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                    <input
                      {...register('name', { required: 'Name is required' })}
                      className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500"
                    />
                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Company (Optional)</label>
                    <input
                      {...register('company')}
                      placeholder="e.g. Acme Corp"
                      className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                    <input
                      {...register('email')}
                      type="email"
                      disabled
                      className="w-full border border-gray-200 bg-gray-50 rounded-lg p-2.5 text-sm text-gray-500 cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                    <input
                      {...register('phone')}
                      placeholder="+91 98765 43210"
                      className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                    <input
                      {...register('location')}
                      placeholder="e.g. Mumbai, India"
                      className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bio / About</label>
                    <textarea
                      {...register('bio')}
                      rows="4"
                      placeholder="Tell freelancers about yourself..."
                      className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500"
                    ></textarea>
                  </div>
                </div>
                <div className="flex justify-end space-x-3 pt-4 mt-4 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => { reset(); setIsEditing(false); }}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-sm font-medium text-white shadow-sm disabled:opacity-50"
                  >
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
              <h2 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-100 pb-2">About</h2>
              <p className="text-gray-700 mb-6 text-sm leading-relaxed">
                {user?.bio || 'No bio provided yet. Click "Edit Profile" to share details about your business and hiring needs.'}
              </p>
              
              <h2 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-100 pb-2">Contact Information</h2>
              <div className="space-y-3">
                <div className="flex items-center text-sm">
                  <Mail className="w-4 h-4 text-gray-400 mr-3" />
                  <span className="text-gray-900">{user?.email}</span>
                </div>
                {user?.phone && (
                  <div className="flex items-center text-sm">
                    <Phone className="w-4 h-4 text-gray-400 mr-3" />
                    <span className="text-gray-900">{user.phone}</span>
                  </div>
                )}
                {user?.company && (
                  <div className="flex items-center text-sm">
                    <Briefcase className="w-4 h-4 text-gray-400 mr-3" />
                    <span className="text-gray-900">{user.company}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Account Overview</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Role</span>
                <span className="font-bold text-gray-900 capitalize">{user?.role || 'Client'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Completed Projects</span>
                <span className="font-bold text-gray-900">{user?.completedProjects || 0}</span>
              </div>
              <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                <span className="text-sm text-gray-600">Rating</span>
                <span className="font-bold text-indigo-600">{user?.rating || 5.0} ★</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
