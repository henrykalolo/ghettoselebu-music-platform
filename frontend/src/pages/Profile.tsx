import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { UserIcon, MusicIcon, DownloadIcon, HeartIcon, ClockIcon, CalendarIcon, SettingsIcon, PlayIcon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { apiService, Track, Album } from '../services/api';
import { usePlayer } from '../contexts/PlayerContext';

const Profile: React.FC = () => {
  const { state: authState, logout } = useAuth();
  const { playTrack } = usePlayer();
  const [activeTab, setActiveTab] = useState<'favorites' | 'history' | 'settings'>('favorites');
  
  const [stats, setStats] = useState({
    totalTracks: 0,
    totalAlbums: 0,
    totalDownloads: 0,
    joinDate: '',
  });

  useEffect(() => {
    if (authState.profile) {
      setStats({
        totalTracks: authState.profile.favorite_tracks.length,
        totalAlbums: authState.profile.favorite_albums.length,
        totalDownloads: authState.profile.download_history.length,
        joinDate: new Date(authState.profile.created_at).toLocaleDateString(),
      });
    }
  }, [authState.profile]);

  const handlePlayTrack = (track: Track) => {
    playTrack(track);
  };

  const handleAddFavorite = async (trackId: number, isAlbum: boolean) => {
    try {
      const { authAPI } = await import('../services/api');
      if (isAlbum) {
        await authAPI.addFavoriteAlbum(trackId);
      } else {
        await authAPI.addFavoriteTrack(trackId);
      }
      // Refresh profile to get updated favorites
    } catch (error) {
      console.error('Failed to add favorite:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      // Redirect to login page after successful logout
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleRemoveFavorite = async (trackId: number, isAlbum: boolean) => {
    try {
      const { authAPI } = await import('../services/api');
      if (isAlbum) {
        await authAPI.removeFavoriteAlbum(trackId);
      } else {
        await authAPI.removeFavoriteTrack(trackId);
      }
      // Refresh profile to get updated favorites
    } catch (error) {
      console.error('Failed to remove favorite:', error);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleDateString();
  };

  const formatDuration = (durationString?: string) => {
    if (!durationString) return '0:00';
    return durationString;
  };

  if (!authState.isAuthenticated) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
        <div className="text-center">
          <UserIcon className="h-16 w-16 text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold text-white mb-4">Please log in to view your profile</h2>
          <button
            onClick={() => window.location.href = '/login'}
            className="bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <div className="bg-gray-900 rounded-lg p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-br from-red-600 to-red-800 p-4 rounded-full">
                <UserIcon className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">{authState.user?.username}</h1>
                <p className="text-gray-400">{authState.user?.email}</p>
                <p className="text-sm text-gray-500">Member since {formatDate(authState.user?.date_joined)}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
              title="Logout"
            >
              <SettingsIcon className="h-4 w-4" />
              <span>Logout</span>
            </button>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-gray-800 rounded-lg p-4 text-center">
              <MusicIcon className="h-6 w-6 text-red-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{stats.totalTracks}</div>
              <div className="text-sm text-gray-400">Favorite Tracks</div>
            </div>
            <div className="bg-gray-800 rounded-lg p-4 text-center">
              <MusicIcon className="h-6 w-6 text-red-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{stats.totalAlbums}</div>
              <div className="text-sm text-gray-400">Favorite Albums</div>
            </div>
            <div className="bg-gray-800 rounded-lg p-4 text-center">
              <DownloadIcon className="h-6 w-6 text-red-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{stats.totalDownloads}</div>
              <div className="text-sm text-gray-400">Downloads</div>
            </div>
            <div className="bg-gray-800 rounded-lg p-4 text-center">
              <CalendarIcon className="h-6 w-6 text-red-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{stats.joinDate}</div>
              <div className="text-sm text-gray-400">Member Since</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-gray-900 rounded-lg p-1 mb-8">
          <div className="flex space-x-1">
            <button
              onClick={() => setActiveTab('favorites')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'favorites'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              Favorites
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'history'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              History
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'settings'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              Settings
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'favorites' && (
          <div className="space-y-8">
            {/* Favorite Tracks */}
            <div>
              <h2 className="text-xl font-bold text-white mb-4">Favorite Tracks</h2>
              {authState.profile?.favorite_tracks.length === 0 ? (
                <div className="text-center py-12">
                  <MusicIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-400">No favorite tracks yet</p>
                  <p className="text-gray-500 text-sm">Start adding tracks to your favorites to see them here</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {authState.profile?.favorite_tracks.map((track) => (
                    <div key={track.id} className="bg-gray-900 rounded-lg p-4 hover:bg-gray-800 transition-all duration-300 group">
                      <div className="flex items-center space-x-4">
                        <button
                          onClick={() => handlePlayTrack(track)}
                          className="bg-red-600 p-2 rounded-lg hover:bg-red-700 transition-colors"
                        >
                          <PlayIcon className="h-4 w-4 text-white" />
                        </button>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-white truncate">{track.title}</h4>
                          <p className="text-gray-400 text-sm truncate">{track.artist.name}</p>
                        </div>
                        <button
                          onClick={() => handleRemoveFavorite(track.id, false)}
                          className="text-red-400 hover:text-red-300 transition-colors"
                        >
                          <HeartIcon className="h-4 w-4 fill-current" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Favorite Albums */}
            <div>
              <h2 className="text-xl font-bold text-white mb-4">Favorite Albums</h2>
              {authState.profile?.favorite_albums.length === 0 ? (
                <div className="text-center py-12">
                  <MusicIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-400">No favorite albums yet</p>
                  <p className="text-gray-500 text-sm">Start adding albums to your favorites to see them here</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {authState.profile?.favorite_albums.map((album) => (
                    <div key={album.id} className="bg-gray-900 rounded-lg overflow-hidden hover:bg-gray-800 transition-all duration-300 group">
                      <div className="aspect-square bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                        <MusicIcon className="h-16 w-16 text-white opacity-50" />
                      </div>
                      <div className="p-4">
                        <h4 className="font-semibold text-white truncate">{album.title}</h4>
                        <p className="text-gray-400 text-sm truncate">{album.artist.name}</p>
                        <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                          <span>{album.tracks_count} tracks</span>
                          <span>{album.bitrate}</span>
                        </div>
                        <button
                          onClick={() => handleRemoveFavorite(album.id, true)}
                          className="text-red-400 hover:text-red-300 transition-colors"
                        >
                          <HeartIcon className="h-4 w-4 fill-current" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-8">
            <h2 className="text-xl font-bold text-white mb-4">Download History</h2>
            {authState.profile?.download_history.length === 0 ? (
              <div className="text-center py-12">
                <DownloadIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400">No download history yet</p>
                <p className="text-gray-500 text-sm">Your downloaded tracks will appear here</p>
              </div>
            ) : (
              <div className="space-y-4">
                {authState.profile?.download_history.map((track, index) => (
                  <div key={track.id} className="bg-gray-900 rounded-lg p-4 hover:bg-gray-800 transition-all duration-300">
                    <div className="flex items-center space-x-4">
                      <div className="text-gray-500 font-medium w-8 text-center">
                        {index + 1}
                      </div>
                      <button
                        onClick={() => handlePlayTrack(track)}
                        className="bg-red-600 p-2 rounded-lg hover:bg-red-700 transition-colors"
                      >
                        <PlayIcon className="h-4 w-4 text-white" />
                      </button>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-white truncate">{track.title}</h4>
                        <p className="text-gray-400 text-sm truncate">{track.artist.name}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <ClockIcon className="h-3 w-3 mr-1" />
                          <span>{formatDuration(track.duration)}</span>
                          <DownloadIcon className="h-3 w-3 mr-1" />
                          <span>{track.download_count}</span>
                        </div>
                      </div>
                      <div className="text-gray-400 hover:text-white transition-colors">
                        <DownloadIcon className="h-4 w-4" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-8">
            <h2 className="text-xl font-bold text-white mb-4">Account Settings</h2>
            <div className="bg-gray-900 rounded-lg p-6">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Username</label>
                  <input
                    type="text"
                    value={authState.user?.username}
                    disabled
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                  <input
                    type="email"
                    value={authState.user?.email}
                    disabled
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-400"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">First Name</label>
                    <input
                      type="text"
                      value={authState.user?.first_name || ''}
                      disabled
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-400"
                    />
                  </div>
                  <div>
                    <label className="block text sm font-medium text-gray-300 mb-2">Last Name</label>
                    <input
                      type="text"
                      value={authState.user?.last_name || ''}
                      disabled
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-400"
                    />
                  </div>
                </div>
                <div className="pt-4 border-t border-gray-700">
                  <button className="bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors">
                    Update Profile
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-gray-900 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Preferences</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Email notifications</span>
                  <button className="bg-gray-700 relative inline-flex h-6 w-11 items-center rounded-full bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-2">
                    <span className="text-gray-400">Off</span>
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Download notifications</span>
                  <button className="bg-gray-700 relative inline-flex h-6 w-11 items-center rounded-full bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-2">
                    <span className="text-gray-400">Off</span>
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Show explicit content</span>
                  <button className="bg-gray-700 relative inline-flex h-6 w-11 items-center rounded-full bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-2">
                    <span className="text-gray-400">Off</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
