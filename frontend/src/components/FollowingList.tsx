import React, { useState, useEffect } from 'react';
import { Users, UserPlus, UserMinus, Search, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';

interface UserProfile {
  id: number;
  user: {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
    email: string;
  };
  bio: string;
  avatar?: string;
  profile_image?: string;
  is_artist: boolean;
  followers_count: number;
  following_count: number;
  is_following: boolean;
  created_at: string;
}

const FollowingList: React.FC = () => {
  const { state } = useAuth();
  const [following, setFollowing] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  useEffect(() => {
    if (state.user) {
      fetchFollowing();
    }
  }, [state.user]);

  const fetchFollowing = async () => {
    try {
      const response = await apiService.socialAPI.getFollowing(state.profile?.id || 0);
      setFollowing(response.data);
    } catch (error) {
      console.error('Error fetching following:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnfollow = async (userId: number) => {
    setActionLoading(userId);
    try {
      await apiService.socialAPI.unfollowUser(userId);
      // Remove from following list
      setFollowing(prev => prev.filter(user => user.id !== userId));
    } catch (error) {
      console.error('Error unfollowing user:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const filteredFollowing = following.filter(user => 
    user.user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.user.last_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getAvatarUrl = (avatar?: string, profileImage?: string) => {
    if (avatar) return avatar;
    if (profileImage) return profileImage;
    return '/default-avatar.png';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center">
            <Users className="w-6 h-6 mr-2" />
            Following ({following.length})
          </h2>
          <p className="text-gray-400 mt-1">People you're following</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search following..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        />
      </div>

      {/* Following List */}
      {filteredFollowing.length === 0 ? (
        <div className="text-center py-12">
          <Users className="w-16 h-16 mx-auto mb-4 text-gray-500" />
          <h3 className="text-xl font-semibold text-white mb-2">
            {searchTerm ? 'No matching users found' : "You're not following anyone yet"}
          </h3>
          <p className="text-gray-400">
            {searchTerm 
              ? 'Try adjusting your search terms' 
              : 'Start following users to see them here'
            }
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredFollowing.map((user) => (
            <div key={user.id} className="bg-gray-800 rounded-lg p-4 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {/* Avatar */}
                <img
                  src={getAvatarUrl(user.avatar, user.profile_image)}
                  alt={user.user.username}
                  className="w-12 h-12 rounded-full object-cover"
                />
                
                {/* User Info */}
                <div>
                  <h3 className="text-white font-semibold">
                    {user.user.first_name && user.user.last_name 
                      ? `${user.user.first_name} ${user.user.last_name}`
                      : user.user.username
                    }
                  </h3>
                  <p className="text-gray-400 text-sm">@{user.user.username}</p>
                  <div className="flex items-center space-x-4 mt-1">
                    {user.is_artist && (
                      <span className="text-xs bg-purple-600 text-white px-2 py-1 rounded">
                        Artist
                      </span>
                    )}
                    <span className="text-xs text-gray-500">
                      {user.followers_count} followers
                    </span>
                  </div>
                  {user.bio && (
                    <p className="text-gray-400 text-sm mt-2 line-clamp-2">
                      {user.bio}
                    </p>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleUnfollow(user.id)}
                  disabled={actionLoading === user.id}
                  className="flex items-center space-x-1 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {actionLoading === user.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <UserMinus className="w-4 h-4" />
                  )}
                  <span className="text-sm">Unfollow</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FollowingList;
