import React, { useState, useEffect } from 'react';
import { User, Settings, Camera, Save, X, Users, UserCheck, Heart, Calendar } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { apiService, UserProfile, authAPI } from '../services/api';
import FollowingList from '../components/FollowingList';
import FollowersList from '../components/FollowersList';

interface FormData {
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  bio: string;
  is_artist: boolean;
}

const UserSettings: React.FC = () => {
  const { state } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'following' | 'followers' | 'activity'>('profile');
  const [formData, setFormData] = useState<FormData>({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    bio: '',
    is_artist: false
  });

  useEffect(() => {
    if (state.user) {
      fetchProfile();
    }
  }, [state.user]);

  const fetchProfile = async () => {
    try {
      const response = await authAPI.getProfile();
      setProfile(response.data);
      setFormData({
        username: response.data.user.username,
        email: response.data.user.email,
        first_name: response.data.user.first_name,
        last_name: response.data.user.last_name,
        bio: response.data.bio || '',
        is_artist: response.data.is_artist || false
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const getAvatarUrl = (avatar?: string, profileImage?: string) => {
    // If avatar exists, use it
    if (avatar) {
      return avatar;
    }
    // Fallback to profile_image
    if (profileImage) {
      return profileImage;
    }
    // Fallback to default avatar
    return '/default-avatar.png';
  };

  const handleAvatarUpload = async () => {
    if (!avatarPreview) return;
    
    setSaving(true);
    try {
      const formData = new FormData();
      
      // Convert base64 to blob
      const response = await fetch(avatarPreview!);
      const blob = await response.blob();
      formData.append('avatar', blob, 'avatar.jpg');
      
      await apiService.socialAPI.uploadAvatar(formData);
      await fetchProfile(); // Refresh profile data
      setAvatarPreview(null);
      alert('Avatar updated successfully!');
    } catch (error) {
      console.error('Error uploading avatar:', error);
      alert('Failed to upload avatar');
    } finally {
      setSaving(false);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      // Update user info
      await authAPI.updateProfile({
        username: formData.username,
        email: formData.email,
        first_name: formData.first_name,
        last_name: formData.last_name,
      });
      
      // Update profile info
      await apiService.socialAPI.updateProfile({
        bio: formData.bio,
        is_artist: formData.is_artist
      });
      
      await fetchProfile(); // Refresh profile data
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev: FormData) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-8">User Settings</h1>
        
        {/* Tab Navigation */}
        <div className="border-b border-gray-800 mb-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('profile')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'profile'
                  ? 'border-purple-500 text-white'
                  : 'border-transparent text-gray-400 hover:text-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Settings className="w-4 h-4" />
                Profile Settings
              </div>
            </button>
            
            <button
              onClick={() => setActiveTab('following')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'following'
                  ? 'border-purple-500 text-white'
                  : 'border-transparent text-gray-400 hover:text-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <UserCheck className="w-4 h-4" />
                Following ({profile?.following_count || 0})
              </div>
            </button>
            
            <button
              onClick={() => setActiveTab('followers')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'followers'
                  ? 'border-purple-500 text-white'
                  : 'border-transparent text-gray-400 hover:text-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4" />
                Followers ({profile?.followers_count || 0})
              </div>
            </button>
            
            <button
              onClick={() => setActiveTab('activity')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'activity'
                  ? 'border-purple-500 text-white'
                  : 'border-transparent text-gray-400 hover:text-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4" />
                Activity
              </div>
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'profile' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Avatar Upload */}
            <div className="lg:col-span-1">
              <div className="bg-gray-900 rounded-lg p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center">
                  <Camera className="w-5 h-5 mr-2" />
                  Profile Picture
                </h2>
                
                <div className="flex flex-col items-center space-y-4">
                  {/* Current Avatar */}
                  <div className="relative">
                    <img
                      src={getAvatarUrl(profile?.avatar, profile?.profile_image)}
                      alt="Profile"
                      className="w-32 h-32 rounded-full object-cover"
                    />
                    {avatarPreview && (
                      <button
                        onClick={() => setAvatarPreview(null)}
                        className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Upload Button */}
                  <div className="w-full">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                      id="avatar-upload"
                    />
                    <label
                      htmlFor="avatar-upload"
                      className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors cursor-pointer text-center"
                    >
                      Upload New Avatar
                    </label>
                  </div>

                  {/* Save Avatar Button */}
                  {avatarPreview && (
                    <button
                      onClick={handleAvatarUpload}
                      disabled={saving}
                      className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {saving ? 'Saving...' : 'Save Avatar'}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Profile Information */}
            <div className="lg:col-span-2">
              <div className="bg-gray-900 rounded-lg p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center">
                  <Settings className="w-5 h-5 mr-2" />
                  Profile Information
                </h2>
                
                <form onSubmit={handleProfileUpdate} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium mb-2">Username</label>
                      <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleInputChange}
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Email</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium mb-2">First Name</label>
                      <input
                        type="text"
                        name="first_name"
                        value={formData.first_name}
                        onChange={handleInputChange}
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Last Name</label>
                      <input
                        type="text"
                        name="last_name"
                        value={formData.last_name}
                        onChange={handleInputChange}
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Bio</label>
                    <textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleInputChange}
                      rows={4}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Tell us about yourself..."
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="is_artist"
                      checked={formData.is_artist}
                      onChange={(e) => setFormData((prev: FormData) => ({
                        ...prev,
                        is_artist: e.target.checked
                      }))}
                      className="w-4 h-4 text-purple-600 bg-gray-800 border-gray-700 rounded focus:ring-purple-500"
                    />
                    <label className="ml-2 text-sm">
                      I am an artist and want to upload music
                    </label>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={saving}
                      className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {saving ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                          Saving...
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <Save className="w-4 h-4 mr-2" />
                          Save Changes
                        </div>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'following' && (
          <FollowingList />
        )}

        {activeTab === 'followers' && (
          <FollowersList />
        )}

        {activeTab === 'activity' && (
          <div className="bg-gray-900 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              Recent Activity
            </h2>
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-500" />
              <h3 className="text-xl font-semibold text-white mb-2">Activity tracking coming soon</h3>
              <p className="text-gray-400">
                Your recent likes, comments, and listens will appear here
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserSettings;
