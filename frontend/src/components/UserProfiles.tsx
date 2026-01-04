import React, { useState, useEffect } from 'react';
import { UserPlus, UserMinus, MapPin, Calendar, Users, Music } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { apiService, UserProfile as UserProfileType } from '../services/api';

interface UserProfilesProps {
  userId?: number;
}

const UserProfiles: React.FC<UserProfilesProps> = ({ userId }) => {
  const [profile, setProfile] = useState<UserProfileType | null>(null);
  const [loading, setLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState(false);
  const { state } = useAuth();

  useEffect(() => {
    if (userId) {
      fetchUserProfile(userId);
    }
  }, [userId]);

  const fetchUserProfile = async (id: number) => {
    try {
      const response = await apiService.socialAPI.getProfile(id);
      setProfile(response.data);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async () => {
    if (!profile || !state.user) return;
    
    setFollowLoading(true);
    try {
      await apiService.socialAPI.followUser(profile.id);
      // Update the local state
      setProfile(prev => prev ? {
        ...prev,
        is_following: true,
        followers_count: prev.followers_count + 1
      } : null);
    } catch (error) {
      console.error('Error following user:', error);
    } finally {
      setFollowLoading(false);
    }
  };

  const handleUnfollow = async () => {
    if (!profile || !state.user) return;
    
    setFollowLoading(true);
    try {
      await apiService.socialAPI.unfollowUser(profile.id);
      // Update the local state
      setProfile(prev => prev ? {
        ...prev,
        is_following: false,
        followers_count: prev.followers_count - 1
      } : null);
    } catch (error) {
      console.error('Error unfollowing user:', error);
    } finally {
      setFollowLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-12 text-gray-400">
        <p>User profile not found.</p>
      </div>
    );
  }

  const isOwnProfile = state.user?.id === profile.user.id;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Profile Header */}
      <div className="bg-gray-900 rounded-lg p-8 mb-6">
        <div className="flex items-start space-x-6">
          <img
            src={profile.profile_image || '/default-avatar.png'}
            alt={profile.user.username}
            className="w-32 h-32 rounded-full"
          />
          
          <div className="flex-1">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold mb-2">{profile.user.username}</h1>
                <div className="flex items-center space-x-6 text-gray-400">
                  <span className="flex items-center">
                    <Users className="w-4 h-4 mr-1" />
                    {profile.followers_count} followers
                  </span>
                  <span className="flex items-center">
                    <Users className="w-4 h-4 mr-1" />
                    {profile.following_count} following
                  </span>
                  {profile.is_artist && (
                    <span className="flex items-center text-purple-400">
                      <Music className="w-4 h-4 mr-1" />
                      Artist
                    </span>
                  )}
                </div>
              </div>
              
              {!isOwnProfile && (
                <button
                  onClick={profile.is_following ? handleUnfollow : handleFollow}
                  disabled={followLoading}
                  className={`px-6 py-2 rounded-full font-semibold transition-colors ${
                    profile.is_following
                      ? 'bg-gray-700 hover:bg-gray-600 text-white'
                      : 'bg-purple-600 hover:bg-purple-700 text-white'
                  } ${followLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {followLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mx-auto"></div>
                  ) : profile.is_following ? (
                    <span className="flex items-center">
                      <UserMinus className="w-4 h-4 mr-2" />
                      Unfollow
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <UserPlus className="w-4 h-4 mr-2" />
                      Follow
                    </span>
                  )}
                </button>
              )}
            </div>
            
            {profile.bio && (
              <p className="text-gray-300 mb-4">{profile.bio}</p>
            )}
            
            <div className="flex items-center space-x-4 text-sm text-gray-400">
              <span className="flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                Joined {new Date(profile.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Content Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Favorite Tracks */}
        <div className="lg:col-span-2">
          <div className="bg-gray-900 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">Favorite Tracks</h2>
            {profile.favorite_tracks.length === 0 ? (
              <p className="text-gray-400">No favorite tracks yet.</p>
            ) : (
              <div className="space-y-3">
                {profile.favorite_tracks.map((track) => (
                  <div key={track.id} className="flex items-center space-x-4 p-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors">
                    <button className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center hover:bg-purple-700 transition-colors">
                      <div className="w-0 h-0 border-t-4 border-t-transparent border-l-6 border-l-white border-b-4 border-b-transparent ml-1"></div>
                    </button>
                    <div className="flex-1">
                      <h4 className="font-semibold">{track.title}</h4>
                      <p className="text-sm text-gray-400">{track.artist.name}</p>
                    </div>
                    {track.duration && (
                      <span className="text-sm text-gray-400">{track.duration}</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Favorite Albums */}
          <div className="bg-gray-900 rounded-lg p-6">
            <h3 className="text-lg font-bold mb-4">Favorite Albums</h3>
            {profile.favorite_albums.length === 0 ? (
              <p className="text-gray-400 text-sm">No favorite albums yet.</p>
            ) : (
              <div className="space-y-3">
                {profile.favorite_albums.slice(0, 5).map((album) => (
                  <div key={album.id} className="flex items-center space-x-3">
                    <img
                      src={album.cover_art || '/default-album.png'}
                      alt={album.title}
                      className="w-12 h-12 rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold truncate">{album.title}</h4>
                      <p className="text-sm text-gray-400 truncate">{album.artist.name}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Download History */}
          <div className="bg-gray-900 rounded-lg p-6">
            <h3 className="text-lg font-bold mb-4">Recent Downloads</h3>
            {profile.download_history.length === 0 ? (
              <p className="text-gray-400 text-sm">No downloads yet.</p>
            ) : (
              <div className="space-y-3">
                {profile.download_history.slice(0, 5).map((track) => (
                  <div key={track.id} className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-700 rounded flex items-center justify-center">
                      <Music className="w-5 h-5 text-gray-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold truncate">{track.title}</h4>
                      <p className="text-sm text-gray-400 truncate">{track.artist.name}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfiles;
