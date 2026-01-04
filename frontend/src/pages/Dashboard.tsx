import React, { useState, useEffect } from 'react';
import { 
  MusicIcon, 
  DownloadIcon, 
  HeartIcon, 
  TrendingUpIcon, 
  CalendarIcon, 
  ClockIcon, 
  PlayIcon, 
  UserIcon,
  BarChart3Icon,
  ActivityIcon
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';

interface DashboardStats {
  totalTracks: number;
  totalAlbums: number;
  totalArtists: number;
  totalPlaylists: number;
  totalDownloads: number;
  favoriteTracks: number;
  favoriteAlbums: number;
  recentActivity: Array<{
    id: number;
    type: string;
    description: string;
    timestamp: string;
  }>;
  topTracks: Array<{
    id: number;
    title: string;
    artist: string;
    downloads: number;
    trend: 'up' | 'down' | 'stable';
  }>;
  topArtists: Array<{
    id: number;
    name: string;
    downloads: number;
    trackCount: number;
  }>;
  listeningStats: {
    totalMinutes: number;
    averageSessionLength: number;
    mostActiveDay: string;
    favoriteGenre: string;
  };
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('week');
  
  const { state: authState } = useAuth();

  useEffect(() => {
    if (authState.isAuthenticated) {
      fetchDashboardStats();
    }
  }, [authState.isAuthenticated, timeRange]);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      
      // In a real app, you would fetch this from your API
      // For now, we'll use mock data
      const mockStats: DashboardStats = {
        totalTracks: 1247,
        totalAlbums: 342,
        totalArtists: 89,
        totalPlaylists: 23,
        totalDownloads: 15678,
        favoriteTracks: 89,
        favoriteAlbums: 45,
        recentActivity: [
          {
            id: 1,
            type: 'download',
            description: 'Downloaded "Summer Vibes 2024"',
            timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString()
          },
          {
            id: 2,
            type: 'playlist',
            description: 'Created "Chill Beats" playlist',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString()
          },
          {
            id: 3,
            type: 'favorite',
            description: 'Added "Midnight Jazz" to favorites',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString()
          }
        ],
        topTracks: [
          {
            id: 1,
            title: 'Summer Vibes 2024',
            artist: 'DJ Cool Beats',
            downloads: 2341,
            trend: 'up'
          },
          {
            id: 2,
            title: 'Night Drive',
            artist: 'Synthwave Master',
            downloads: 1892,
            trend: 'up'
          },
          {
            id: 3,
            title: 'Urban Dreams',
            artist: 'City Lights',
            downloads: 1567,
            trend: 'down'
          }
        ],
        topArtists: [
          {
            id: 1,
            name: 'DJ Cool Beats',
            downloads: 8934,
            trackCount: 45
          },
          {
            id: 2,
            name: 'Synthwave Master',
            downloads: 6789,
            trackCount: 32
          },
          {
            id: 3,
            name: 'City Lights',
            downloads: 5234,
            trackCount: 28
          }
        ],
        listeningStats: {
          totalMinutes: 12450,
          averageSessionLength: 45,
          mostActiveDay: 'Friday',
          favoriteGenre: 'Hip-Hop'
        }
      };
      
      setStats(mockStats);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <TrendingUpIcon className="h-4 w-4 text-green-400" />;
      case 'down':
        return <TrendingUpIcon className="h-4 w-4 text-red-400 transform rotate-180" />;
      default:
        return <ActivityIcon className="h-4 w-4 text-gray-400" />;
    }
  };

  if (!authState.isAuthenticated) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
        <div className="text-center">
          <UserIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Sign in to view your dashboard</h2>
          <p className="text-gray-400 mb-6">Please log in to access your music statistics and activity</p>
          <button
            onClick={() => window.location.href = '/login'}
            className="bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <UserIcon className="h-8 w-8 text-red-500" />
              <h1 className="text-2xl font-bold text-white">My Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-400">Welcome back, {authState.user?.username}!</span>
            </div>
          </div>
        </div>
      </div>

      {/* Time Range Selector */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Statistics Overview</h2>
          <div className="flex bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setTimeRange('week')}
              className={`px-4 py-2 rounded-l-lg font-medium transition-colors ${
                timeRange === 'week' ? 'bg-red-600 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setTimeRange('month')}
              className={`px-4 py-2 rounded-r-lg font-medium transition-colors ${
                timeRange === 'month' ? 'bg-red-600 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              Month
            </button>
            <button
              onClick={() => setTimeRange('year')}
              className={`px-4 py-2 rounded-r-lg font-medium transition-colors ${
                timeRange === 'year' ? 'bg-red-600 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              Year
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
          </div>
        ) : stats ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total Stats */}
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Library Overview</h3>
                <BarChart3Icon className="h-5 w-5 text-gray-400" />
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Total Tracks</span>
                  <span className="text-2xl font-bold text-white">{formatNumber(stats.totalTracks)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Total Albums</span>
                  <span className="text-2xl font-bold text-white">{formatNumber(stats.totalAlbums)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Total Artists</span>
                  <span className="text-2xl font-bold text-white">{formatNumber(stats.totalArtists)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Total Playlists</span>
                  <span className="text-2xl font-bold text-white">{stats.totalPlaylists}</span>
                </div>
              </div>
            </div>

            {/* Favorites */}
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Favorites</h3>
                <HeartIcon className="h-5 w-5 text-red-500" />
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Favorite Tracks</span>
                  <span className="text-2xl font-bold text-white">{formatNumber(stats.favoriteTracks)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Favorite Albums</span>
                  <span className="text-2xl font-bold text-white">{formatNumber(stats.favoriteAlbums)}</span>
                </div>
              </div>
            </div>

            {/* Listening Stats */}
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Listening Stats</h3>
                <ClockIcon className="h-5 w-5 text-gray-400" />
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Total Listening Time</span>
                  <span className="text-2xl font-bold text-white">{formatTime(stats.listeningStats.totalMinutes)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Avg Session Length</span>
                  <span className="text-2xl font-bold text-white">{formatTime(stats.listeningStats.averageSessionLength)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Most Active Day</span>
                  <span className="text-2xl font-bold text-white">{stats.listeningStats.mostActiveDay}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Favorite Genre</span>
                  <span className="text-2xl font-bold text-white">{stats.listeningStats.favoriteGenre}</span>
                </div>
              </div>
            </div>

            {/* Top Tracks */}
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800 lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Top Tracks</h3>
                <TrendingUpIcon className="h-5 w-5 text-gray-400" />
              </div>
              <div className="space-y-3">
                {stats.topTracks.map((track, index) => (
                  <div key={track.id} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                    <div className="flex-1">
                      <div className="text-white font-medium">{track.title}</div>
                      <div className="text-gray-400 text-sm">{track.artist}</div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl font-bold text-white">{formatNumber(track.downloads)}</span>
                      {getTrendIcon(track.trend)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Artists */}
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800 lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Top Artists</h3>
                <UserIcon className="h-5 w-5 text-gray-400" />
              </div>
              <div className="space-y-3">
                {stats.topArtists.map((artist, index) => (
                  <div key={artist.id} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                    <div className="flex-1">
                      <div className="text-white font-medium">{artist.name}</div>
                      <div className="text-gray-400 text-sm">{artist.trackCount} tracks</div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl font-bold text-white">{formatNumber(artist.downloads)}</span>
                      <DownloadIcon className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800 lg:col-span-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
                <CalendarIcon className="h-5 w-5 text-gray-400" />
              </div>
              <div className="space-y-3">
                {stats.recentActivity.map((activity, index) => (
                  <div key={activity.id} className="flex items-start space-x-3 p-3 bg-gray-800 rounded-lg">
                    <div className={`w-2 h-2 rounded-full flex items-center justify-center ${
                      activity.type === 'download' ? 'bg-blue-600' :
                      activity.type === 'playlist' ? 'bg-green-600' :
                      'bg-purple-600'
                    }`}>
                      {activity.type === 'download' && <DownloadIcon className="h-3 w-3 text-white" />}
                      {activity.type === 'playlist' && <PlayIcon className="h-3 w-3 text-white" />}
                      {activity.type === 'favorite' && <HeartIcon className="h-3 w-3 text-white" />}
                    </div>
                    <div className="flex-1">
                      <div className="text-white font-medium">{activity.description}</div>
                      <div className="text-gray-400 text-sm">
                        {new Date(activity.timestamp).toLocaleDateString()} • {new Date(activity.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-16">
            <BarChart3Icon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Data Available</h3>
            <p className="text-gray-400">Unable to load dashboard statistics. Please try again later.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
