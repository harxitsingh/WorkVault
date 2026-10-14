import React, { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../context/AuthContext';
import { userService } from '../../services/userService';
import { statsService } from '../../services/statsService';
import { formatDate } from '../../utils/formatters';
import { MapPin, Calendar, Star, Edit, CheckCircle, Clock, Link as LinkIcon, Camera, X, Plus } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Avatar from '../../components/common/Avatar';
import ServiceCard from '../../components/marketplace/ServiceCard';
import EmptyState from '../../components/common/EmptyState';
import TrustMetricsCard from '../../components/trust/TrustMetricsCard';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { getImageUrl, handleImageError } from '../../utils/imageHelper';

const FreelancerProfile = () => {
  const { user, updateUserState } = useAuth();
  const fileInputRef = useRef(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [tagInput, setTagInput] = useState('');
  const [skills, setSkills] = useState(user?.skills || []);
  const [myServices, setMyServices] = useState([]);
  const [myReviews, setMyReviews] = useState([]);
  const [trustMetrics, setTrustMetrics] = useState(null);

  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      name: user?.name || '',
      title: user?.title || '',
      bio: user?.bio || '',
      location: user?.location || '',
      portfolioUrl: user?.portfolioUrl || ''
    }
  });

  useEffect(() => {
    if (user) {
      reset({
        name: user.name || '',
        title: user.title || '',
        bio: user.bio || '',
        location: user.location || '',
        portfolioUrl: user.portfolioUrl || ''
      });
      setSkills(user.skills || []);

      const userId = user.id || user._id;
      if (userId) {
        userService.getUserServices(userId)
          .then(data => setMyServices(data || []))
          .catch(() => {});

        userService.getUserReviews(userId)
          .then(data => setMyReviews(data || []))
          .catch(() => {});

        statsService.getTrustMetrics(userId)
          .then(data => setTrustMetrics(data?.metrics || null))
          .catch(() => {});
      }
    }
  }, [user, reset]);

  const handleAddTag = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!skills.includes(tagInput.trim())) {
        setSkills([...skills, tagInput.trim()]);
      }
      setTagInput('');
    }
  };

  const removeTag = (indexToRemove) => {
    setSkills(skills.filter((_, index) => index !== indexToRemove));
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

  const onSubmit = async (data) => {
    setIsSaving(true);
    try {
      const userId = user?.id || user?._id || 'me';
      const updatedUser = await userService.updateUser(userId, {
        name: data.name,
        title: data.title,
        bio: data.bio,
        location: data.location,
        portfolioUrl: data.portfolioUrl,
        skills
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

  const memberYear = user?.createdAt ? new Date(user.createdAt).getFullYear() : 2026;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Profile Header */}
      <Card className="overflow-hidden p-0 border border-slate-200/90 shadow-sm">
        <div className="h-32 bg-gradient-to-r from-[#0E1525] via-[#162036] to-[#1E3794]"></div>
        <div className="px-6 pb-6 relative">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between -mt-12 sm:-mt-16 mb-4 sm:mb-0">
            <div className="flex flex-col sm:flex-row items-center sm:items-end space-y-4 sm:space-y-0 sm:space-x-5">
              <div className="relative group">
                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-white bg-white overflow-hidden shadow-md relative">
                  <img
                    src={avatarPreview || getImageUrl(user?.avatar || user?.profileImage, 'avatar')}
                    alt={user?.name || 'User'}
                    onError={(e) => handleImageError(e, 'avatar')}
                    className="w-full h-full object-cover"
                  />
                  {uploadingAvatar && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-xs font-bold rounded-full">
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
                  className="absolute bottom-0 right-0 p-2 bg-[#2F5BEA] hover:bg-[#2446BD] text-white rounded-full shadow-lg border-2 border-white transition-transform hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2F5BEA]"
                  title="Change profile photo"
                >
                  <Camera size={15} />
                </button>
              </div>

              {avatarPreview && (
                <div className="flex items-center gap-2 mt-2 sm:mt-0">
                  <button
                    type="button"
                    onClick={handleSaveAvatar}
                    disabled={uploadingAvatar}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-2xs transition-colors"
                  >
                    {uploadingAvatar ? 'Uploading...' : 'Save Photo'}
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
              
              <div className="text-center sm:text-left pb-2">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900">{user?.name || 'Freelancer'}</h1>
                <p className="text-slate-600 text-xs sm:text-sm font-medium">{user?.title || 'Professional Freelancer'}</p>
                
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mt-2 text-xs text-slate-500">
                  <div className="flex items-center">
                    <MapPin size={14} className="mr-1 text-slate-400" />
                    {user?.location || 'India'}
                  </div>
                  <div className="flex items-center">
                    <Calendar size={14} className="mr-1 text-slate-400" />
                    Member since {memberYear}
                  </div>
                  <div className="flex items-center text-amber-500 font-semibold">
                    <Star size={14} className="fill-amber-400 text-amber-400 mr-1" />
                    <span>{user?.rating ? Number(user.rating).toFixed(1) : 'New'}</span>
                    <span className="text-slate-400 ml-1">({myReviews.length} reviews)</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-4 sm:mt-0 pb-2 flex justify-center">
              {!isEditing && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setIsEditing(true)} 
                  icon={<Edit size={14} />}
                >
                  Edit Profile
                </Button>
              )}
            </div>
          </div>
        </div>
      </Card>

      {isEditing ? (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Card className="p-6 border border-slate-200/90 shadow-sm">
            <h2 className="text-base font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">Edit Freelancer Profile</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
                <input
                  {...register("name", { required: 'Name is required' })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#2F5BEA] outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Professional Title</label>
                <input
                  {...register("title")}
                  placeholder="e.g. Senior Full-Stack Developer"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#2F5BEA] outline-none"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Bio / About Me</label>
                <textarea
                  {...register("bio")}
                  rows="4"
                  placeholder="Describe your background, skills, and client delivery record..."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#2F5BEA] outline-none resize-y"
                ></textarea>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Location</label>
                <input
                  {...register("location")}
                  placeholder="e.g. Bengaluru, India"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#2F5BEA] outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Portfolio URL</label>
                <input
                  {...register("portfolioUrl")}
                  placeholder="https://yourportfolio.com"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#2F5BEA] outline-none"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Skills & Specializations</label>
                <div className="border border-slate-300 rounded-xl p-2.5 bg-white flex flex-wrap gap-2">
                  {skills.map((skill, index) => (
                    <span key={index} className="bg-blue-50 text-[#2F5BEA] font-semibold px-2.5 py-1 rounded-lg text-xs flex items-center border border-blue-200">
                      {skill}
                      <button type="button" onClick={() => removeTag(index)} className="ml-1.5 text-blue-400 hover:text-blue-700">
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleAddTag}
                    placeholder="Type skill & press Enter"
                    className="flex-1 outline-none min-w-[150px] p-1 text-xs"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2.5 mt-6 pt-4 border-t border-slate-100">
              <Button type="button" variant="outline" size="sm" onClick={() => { reset(); setIsEditing(false); }}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" isLoading={isSaving}>
                Save Changes
              </Button>
            </div>
          </Card>
        </form>
      ) : (
        <div className="space-y-6">
          {trustMetrics && <TrustMetricsCard metrics={trustMetrics} />}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left Column: Stats & Skills */}
            <div className="md:col-span-1 space-y-6">
              <Card className="p-5 border border-slate-200/90 shadow-2xs">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">Performance</h3>
                <div className="space-y-3 text-xs">
                  <div className="flex justify-between items-center pb-2.5 border-b border-slate-100">
                    <span className="text-slate-600 flex items-center"><CheckCircle size={14} className="mr-1.5 text-emerald-500" /> Completed</span>
                    <span className="font-bold text-slate-900">{user?.completedProjects || 0}</span>
                  </div>
                  <div className="flex justify-between items-center pb-2.5 border-b border-slate-100">
                    <span className="text-slate-600 flex items-center"><Clock size={14} className="mr-1.5 text-[#2F5BEA]" /> Active Services</span>
                    <span className="font-bold text-slate-900">{myServices.length}</span>
                  </div>
                  {user?.portfolioUrl && (
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600 flex items-center"><LinkIcon size={14} className="mr-1.5 text-slate-400" /> Web</span>
                      <a href={user.portfolioUrl} target="_blank" rel="noopener noreferrer" className="font-medium text-[#2F5BEA] hover:underline truncate max-w-[120px]">
                        {user.portfolioUrl.replace(/^https?:\/\//, '')}
                      </a>
                    </div>
                  )}
                </div>
              </Card>

              <Card className="p-5 border border-slate-200/90 shadow-2xs">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">Skills</h3>
                <div className="flex flex-wrap gap-1.5">
                  {skills.length > 0 ? (
                    skills.map((skill, index) => (
                      <span key={index} className="px-2.5 py-1 bg-slate-100 text-slate-700 text-xs rounded-lg font-medium border border-slate-200">
                        {skill}
                      </span>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400">No skills added yet.</p>
                  )}
                </div>
              </Card>
            </div>

            {/* Right Column: Bio & Services */}
            <div className="md:col-span-2 space-y-6">
              <Card className="p-6 border border-slate-200/90 shadow-2xs">
                <h3 className="text-sm font-bold text-slate-900 mb-2">About Me</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                  {user?.bio || 'No bio provided yet. Click "Edit Profile" to tell clients about your services.'}
                </p>
              </Card>

              {/* My Services List */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-bold text-slate-900">Published Services ({myServices.length})</h3>
                  <Link to="/freelancer/services/new">
                    <Button variant="outline" size="sm" icon={<Plus size={14} />}>
                      Create Service
                    </Button>
                  </Link>
                </div>

                {myServices.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {myServices.map((service) => (
                      <ServiceCard key={service._id || service.id} service={service} />
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    title="No services published"
                    description="You have not published any service listings yet."
                    action={
                      <Link to="/freelancer/services/new">
                        <Button variant="primary" size="sm">Create First Service</Button>
                      </Link>
                    }
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FreelancerProfile;
