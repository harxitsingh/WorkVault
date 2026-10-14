import React, { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { MapPin, Mail, Phone, Calendar, Briefcase, Edit2, X, Camera, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { userService } from '../../services/userService';
import { statsService } from '../../services/statsService';
import { getImageUrl, handleImageError } from '../../utils/imageHelper';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';

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

  const memberYear = user?.createdAt ? new Date(user.createdAt).getFullYear() : 2026;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Profile Header Card */}
      <Card className="overflow-hidden border border-slate-200/90 shadow-sm p-0">
        <div className="h-32 bg-gradient-to-r from-[#0E1525] via-[#162036] to-[#1E3794]"></div>
        <div className="px-6 pb-6 relative">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end -mt-12 mb-4 gap-4">
            <div className="flex items-center sm:items-end gap-4">
              <div className="relative group">
                <div className="w-24 h-24 rounded-full bg-white p-1 border-2 border-white shadow-md relative overflow-hidden">
                  <img
                    src={avatarPreview || getImageUrl(user?.avatar || user?.profileImage, 'avatar')}
                    alt={user?.name || 'User'}
                    onError={(e) => handleImageError(e, 'avatar')}
                    className="w-full h-full rounded-full object-cover"
                  />
                  {uploadingAvatar && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-[11px] font-bold rounded-full">
                      Uploading...
                    </div>
                  )}
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  aria-label="Upload profile image"
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingAvatar}
                  aria-label="Change profile photo"
                  className="absolute bottom-0 right-0 p-2 bg-[#2F5BEA] hover:bg-[#2446BD] text-white rounded-full shadow-md border-2 border-white transition-transform hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2F5BEA]"
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
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-2xs transition-colors"
                  >
                    {uploadingAvatar ? 'Saving...' : 'Save Photo'}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelAvatar}
                    disabled={uploadingAvatar}
                    className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>

            {!isEditing && (
              <Button 
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
                icon={<Edit2 className="w-3.5 h-3.5" />}
              >
                Edit Profile
              </Button>
            )}
          </div>
          
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
              <span>{user?.name || 'Client Profile'}</span>
              <CheckCircle2 className="w-5 h-5 text-[#2F5BEA]" />
            </h1>
            <div className="flex flex-wrap items-center mt-2 text-xs text-slate-500 gap-4">
              <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-[#2F5BEA] font-semibold capitalize border border-blue-200/80">
                {user?.role || 'Client'} Account
              </span>
              <span className="flex items-center"><MapPin className="w-3.5 h-3.5 mr-1 text-slate-400" /> {user?.location || 'India'}</span>
              <span className="flex items-center"><Calendar className="w-3.5 h-3.5 mr-1 text-slate-400" /> Member since {memberYear}</span>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {isEditing ? (
            <Card className="p-6 border border-slate-200/90 shadow-sm">
              <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-3">
                <h2 className="text-base font-bold text-slate-900">Edit Client Profile</h2>
                <button 
                  onClick={() => setIsEditing(false)} 
                  className="text-slate-400 hover:text-slate-600 p-1"
                  aria-label="Cancel editing"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
                    <input
                      {...register('name', { required: 'Name is required' })}
                      className="w-full border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-[#2F5BEA] focus:outline-none"
                    />
                    {errors.name && <p className="text-rose-500 text-xs mt-1">{errors.name.message}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Company / Organization</label>
                    <input
                      {...register('company')}
                      placeholder="e.g. Acme Corp"
                      className="w-full border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-[#2F5BEA] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address (Read-only)</label>
                    <input
                      {...register('email')}
                      type="email"
                      disabled
                      className="w-full border border-slate-200 bg-slate-50 rounded-lg p-2.5 text-xs text-slate-400 cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
                    <input
                      {...register('phone')}
                      placeholder="+91 98765 43210"
                      className="w-full border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-[#2F5BEA] focus:outline-none"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Location</label>
                    <input
                      {...register('location')}
                      placeholder="e.g. Mumbai, India"
                      className="w-full border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-[#2F5BEA] focus:outline-none"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">About / Bio</label>
                    <textarea
                      {...register('bio')}
                      rows={3}
                      placeholder="Brief description about yourself or your organization..."
                      className="w-full border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-[#2F5BEA] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100">
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={() => setIsEditing(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    variant="primary" 
                    size="sm"
                    isLoading={isSaving}
                  >
                    Save Changes
                  </Button>
                </div>
              </form>
            </Card>
          ) : (
            <Card className="p-6 border border-slate-200/90 shadow-sm space-y-6">
              <div>
                <h2 className="text-base font-bold text-slate-900 mb-2">About Client</h2>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                  {user?.bio || 'No biography provided yet. Click "Edit Profile" to add details about your company and hiring needs.'}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-slate-100 text-slate-600">
                    <Mail size={16} />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-400">Email</p>
                    <p className="text-xs font-medium text-slate-800">{user?.email || 'Not provided'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-slate-100 text-slate-600">
                    <Phone size={16} />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-400">Phone</p>
                    <p className="text-xs font-medium text-slate-800">{user?.phone || 'Not provided'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-slate-100 text-slate-600">
                    <Briefcase size={16} />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-400">Company</p>
                    <p className="text-xs font-medium text-slate-800">{user?.company || 'Individual Client'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-slate-100 text-slate-600">
                    <MapPin size={16} />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-400">Location</p>
                    <p className="text-xs font-medium text-slate-800">{user?.location || 'India'}</p>
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Right Info Card */}
        <div className="space-y-4">
          <Card className="p-5 border border-slate-200/90 shadow-2xs">
            <h3 className="font-bold text-sm text-slate-900 mb-2">Escrow Protection Active</h3>
            <p className="text-xs text-slate-500 leading-relaxed mb-4">
              Your client account is protected by WorkVault milestone escrow. Payments are held in secure ledger status until you approve project deliveries.
            </p>
            <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-200 text-xs font-medium text-[#2F5BEA]">
              100% Satisfaction Guarantee
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
