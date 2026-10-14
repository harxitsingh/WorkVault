import React, { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../context/AuthContext';
import { userService } from '../../services/userService';
import { statsService } from '../../services/statsService';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { MapPin, Calendar, Star, Edit, CheckCircle, Clock, Link as LinkIcon, Camera, X } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
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

  const memberYear = user?.createdAt ? new Date(user.createdAt).getFullYear() : 2025;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Profile Header */}
      <Card className="overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-indigo-500 to-purple-600"></div>
        <div className="px-6 pb-6 relative">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between -mt-12 sm:-mt-16 mb-4 sm:mb-0">
            <div className="flex flex-col sm:flex-row items-center sm:items-end space-y-4 sm:space-y-0 sm:space-x-4">
              <div className="relative group">
                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-white bg-white overflow-hidden shadow-md relative">
                  <img
                    src={avatarPreview || getImageUrl(user?.avatar || user?.profileImage, 'avatar')}
                    alt={user?.name || 'User'}
                    onError={(e) => handleImageError(e, 'avatar')}
                    className="w-full h-full object-cover"
                  />
                  {uploadingAvatar && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-xs font-semibold">
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
                  className="absolute bottom-0 right-0 p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-lg border-2 border-white transition-transform hover:scale-110"
                  title="Change profile photo"
                >
                  <Camera size={16} />
                </button>
              </div>

              {avatarPreview && (
                <div className="flex items-center gap-2 mt-2 sm:mt-0">
                  <button
                    type="button"
                    onClick={handleSaveAvatar}
                    disabled={uploadingAvatar}
                    className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm"
                  >
                    {uploadingAvatar ? 'Uploading...' : 'Save Photo'}
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
              
              <div className="text-center sm:text-left pb-2">
                <h1 className="text-2xl font-bold text-slate-900">{user?.name || 'Freelancer'}</h1>
                <p className="text-slate-600 font-medium">{user?.title || 'Professional Freelancer'}</p>
                
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mt-2 text-sm text-slate-500">
                  <div className="flex items-center">
                    <MapPin size={16} className="mr-1" />
                    {user?.location || 'India'}
                  </div>
                  <div className="flex items-center">
                    <Calendar size={16} className="mr-1" />
                    Member since {memberYear}
                  </div>
                  <div className="flex items-center text-yellow-500">
                    <Star size={16} fill="currentColor" className="mr-1" />
                    <span className="font-medium text-slate-700">{user?.rating || '5.0'}</span>
                    <span className="text-slate-500 ml-1">({myReviews.length})</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-4 sm:mt-0 pb-2 flex justify-center">
              {!isEditing && (
                <Button variant="outline" onClick={() => setIsEditing(true)} className="flex items-center gap-2">
                  <Edit size={16} />
                  Edit Profile
                </Button>
              )}
            </div>
          </div>
        </div>
      </Card>

      {isEditing ? (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Card className="p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Edit Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name *</label>
                <input
                  {...register("name", { required: 'Name is required' })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Professional Title</label>
                <input
                  {...register("title")}
                  placeholder="e.g. Senior Full-Stack Developer"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Bio / About Me</label>
                <textarea
                  {...register("bio")}
                  rows="4"
                  placeholder="Describe your background and expertise..."
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-y"
                ></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Location</label>
                <input
                  {...register("location")}
                  placeholder="e.g. Bengaluru, India"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Portfolio URL</label>
                <input
                  {...register("portfolioUrl")}
                  placeholder="https://yourportfolio.com"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Skills</label>
                <div className="border border-slate-300 rounded-lg p-2 bg-white flex flex-wrap gap-2">
                  {skills.map((skill, index) => (
                    <span key={index} className="bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-md text-sm flex items-center">
                      {skill}
                      <button type="button" onClick={() => removeTag(index)} className="ml-1.5 hover:text-indigo-900">
                        <X size={14} />
                      </button>
                    </span>
                  ))}
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleAddTag}
                    placeholder="Type a skill and press Enter"
                    className="flex-1 outline-none min-w-[150px] p-1"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <Button type="button" variant="outline" onClick={() => { reset(); setIsEditing(false); }}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </Card>
        </form>
      ) : (
        <div className="space-y-6">
          {trustMetrics && <TrustMetricsCard metrics={trustMetrics} />}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="md:col-span-1 space-y-6">
            {/* Stats */}
            <Card className="p-6">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Stats</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                  <span className="text-slate-600 flex items-center"><CheckCircle size={16} className="mr-2 text-emerald-500" /> Completed</span>
                  <span className="font-bold text-slate-900">{user?.completedProjects || 0}</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                  <span className="text-slate-600 flex items-center"><Clock size={16} className="mr-2 text-blue-500" /> Services</span>
                  <span className="font-bold text-slate-900">{myServices.length}</span>
                </div>
                {user?.portfolioUrl && (
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 flex items-center"><LinkIcon size={16} className="mr-2 text-slate-400" /> Web</span>
                    <a href={user.portfolioUrl} target="_blank" rel="noopener noreferrer" className="font-medium text-indigo-600 hover:underline truncate max-w-[120px]">
                      {user.portfolioUrl.replace(/^https?:\/\//, '')}
                    </a>
                  </div>
                )}
              </div>
            </Card>

            {/* Skills */}
            <Card className="p-6">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {skills.length > 0 ? (
                  skills.map((skill, index) => (
                    <span key={index} className="px-3 py-1 bg-slate-100 text-slate-700 text-sm rounded-full font-medium">
                      {skill}
                    </span>
                  ))
                ) : (
                  <p className="text-sm text-slate-400">No skills listed yet.</p>
                )}
              </div>
            </Card>
          </div>

          {/* Right Column */}
          <div className="md:col-span-2 space-y-6">
            {/* About */}
            <Card className="p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-3">About Me</h3>
              <p className="text-slate-600 leading-relaxed whitespace-pre-line">
                {user?.bio || 'No bio provided yet. Click "Edit Profile" to share details about your experience.'}
              </p>
            </Card>

            {/* Services */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-slate-900">My Services</h3>
                <Link to="/freelancer/services" className="text-sm text-indigo-600 font-medium hover:underline">Manage All</Link>
              </div>
              {myServices.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {myServices.slice(0, 4).map(service => (
                    <Card key={service.id || service._id} className="overflow-hidden">
                      <div className="h-32 bg-slate-200">
                        <img
                          src={getImageUrl(service.image, 'service')}
                          alt={service.title}
                          onError={(e) => handleImageError(e, 'service')}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-4">
                        <Link to={`/services/${service.id || service._id}`} className="hover:text-indigo-600">
                          <h4 className="font-bold text-slate-900 mb-2 line-clamp-2">{service.title}</h4>
                        </Link>
                        <div className="flex justify-between items-center mt-3">
                          <div className="flex items-center text-sm text-yellow-500">
                            <Star size={14} fill="currentColor" className="mr-1" />
                            <span className="font-medium">{service.rating || '5.0'}</span>
                            <span className="text-slate-400 ml-1">({service.reviewsCount || service.reviewCount || 0})</span>
                          </div>
                          <span className="font-bold text-slate-900">{formatCurrency(service.price)}</span>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="p-6 text-center text-slate-500">
                  <p>You haven't created any services yet.</p>
                  <Link to="/freelancer/services/new" className="text-indigo-600 text-sm font-medium mt-2 inline-block">
                    + Create your first service
                  </Link>
                </Card>
              )}
            </div>

            {/* Reviews */}
            {myReviews.length > 0 && (
              <Card className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold text-slate-900">Recent Reviews</h3>
                  <Link to="/freelancer/reviews" className="text-sm text-indigo-600 font-medium hover:underline">View All</Link>
                </div>
                <div className="space-y-6">
                  {myReviews.slice(0, 3).map(review => (
                    <div key={review.id || review._id} className="border-b border-slate-100 last:border-0 pb-6 last:pb-0">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600">
                            {review.reviewerName ? review.reviewerName.charAt(0) : 'C'}
                          </div>
                          <div>
                            <h4 className="font-medium text-slate-900">{review.reviewerName || 'Client'}</h4>
                            <p className="text-xs text-slate-500">{formatDate(review.createdAt)}</p>
                          </div>
                        </div>
                        <div className="flex space-x-0.5 text-yellow-400">
                          {Array.from({length: 5}).map((_, i) => (
                            <Star key={i} size={14} fill={i < review.rating ? "currentColor" : "none"} className={i >= review.rating ? "text-slate-300" : ""} />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-slate-700 mt-3">{review.comment}</p>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        </div>
        </div>
      )}
    </div>
  );
};

export default FreelancerProfile;
