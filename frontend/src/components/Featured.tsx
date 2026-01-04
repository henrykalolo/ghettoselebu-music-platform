import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  TrendingUp, 
  Music, 
  Album as AlbumIcon, 
  Radio, 
  Users, 
  Play, 
  Download, 
  Heart,
  Clock,
  Star,
  ChevronRight,
  BarChart3
} from 'lucide-react';
import { apiService } from '../services/api';
import { Track, Album, Mixtape, Artist } from '../services/api';

interface FeaturedContent {
  tracks: Track[];
  albums: Album[];
  mixtapes: Mixtape[];
  period: string;
  total_tracks: number;
  total_albums: number;
  total_mixtapes: number;
}

interface FeaturedStats {
  tracks: {
    total_tracks: number;
    total_downloads: number;
    avg_downloads: number;
    max_downloads: number;
    total_likes: number;
  };
  albums: {
    total_albums: number;
    total_tracks: number;
    avg_tracks_per_album: number;
  };
  mixtapes: {
    total_mixtapes: number;
    total_tracks: number;
    avg_tracks_per_mixtape: number;
  };
  artists: {
    total_artists: number;
    artists_with_content: number;
  };
}

const Featured: React.FC = () => {
  const [featuredContent, setFeaturedContent] = useState<FeaturedContent | null>(null);
  const [topArtists, setTopArtists] = useState<Artist[]>([]);
  const [stats, setStats] = useState<FeaturedStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'tracks' | 'albums' | 'mixtapes' | 'artists'>('all');
  const [timePeriod, setTimePeriod] = useState<'all' | 'week' | 'month' | 'year'>('all');

  useEffect(() => {
    fetchFeaturedContent();
    fetchTopArtists();
    fetchStats();
  }, [timePeriod]);

  const fetchFeaturedContent = async () => {
    try {
      const response = await apiService.get('/featured/', { 
        params: { period: timePeriod, limit: 10 } 
      });
      setFeaturedContent(response.data);
    } catch (error) {
      console.error('Error fetching featured content:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTopArtists = async () => {
    try {
      const response = await apiService.get('/featured/artists/', { 
        params: { period: timePeriod, limit: 10 } 
      });
      setTopArtists(response.data.artists);
    } catch (error) {
      console.error('Error fetching top artists:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await apiService.get('/featured/stats/');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const getPeriodLabel = (period: string) => {
    switch (period) {
      case 'week': return 'This Week';
      case 'month': return 'This Month';
      case 'year': return 'This Year';
      default: return 'All Time';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center">
            <TrendingUp className="w-8 h-8 mr-3 text-purple-500" />
            Featured Content
          </h1>
          <p className="text-gray-400 mt-2">
            Discover the most popular tracks, albums, and mixtapes on Ghettoselebu
          </p>
        </div>
        
        {/* Time Period Selector */}
        <div className="flex space-x-2">
          {(['all', 'week', 'month', 'year'] as const).map((period) => (
            <button
              key={period}
              onClick={() => setTimePeriod(period)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                timePeriod === period
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              {getPeriodLabel(period)}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-gray-900 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Tracks</p>
                <p className="text-2xl font-bold text-white">{stats.tracks.total_tracks}</p>
                <p className="text-green-400 text-sm">{formatNumber(stats.tracks.total_downloads)} downloads</p>
              </div>
              <Music className="w-8 h-8 text-purple-500" />
            </div>
          </div>
          
          <div className="bg-gray-900 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Albums</p>
                <p className="text-2xl font-bold text-white">{stats.albums.total_albums}</p>
                <p className="text-blue-400 text-sm">{stats.albums.avg_tracks_per_album?.toFixed(1)} tracks avg</p>
              </div>
              <AlbumIcon className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-gray-900 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Mixtapes</p>
                <p className="text-2xl font-bold text-white">{stats.mixtapes.total_mixtapes}</p>
                <p className="text-yellow-400 text-sm">{stats.mixtapes.avg_tracks_per_mixtape?.toFixed(1)} tracks avg</p>
              </div>
              <Radio className="w-8 h-8 text-yellow-500" />
            </div>
          </div>
          
          <div className="bg-gray-900 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Active Artists</p>
                <p className="text-2xl font-bold text-white">{stats.artists.artists_with_content}</p>
                <p className="text-green-400 text-sm">{stats.artists.total_artists} total</p>
              </div>
              <Users className="w-8 h-8 text-green-500" />
            </div>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="border-b border-gray-800">
        <nav className="flex space-x-8">
          {[
            { key: 'all', label: 'All Content', icon: BarChart3 },
            { key: 'tracks', label: 'Top Tracks', icon: Music },
            { key: 'albums', label: 'Top Albums', icon: AlbumIcon },
            { key: 'mixtapes', label: 'Top Mixtapes', icon: Radio },
            { key: 'artists', label: 'Top Artists', icon: Users }
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors flex items-center space-x-2 ${
                activeTab === key
                  ? 'border-purple-500 text-white'
                  : 'border-transparent text-gray-400 hover:text-gray-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'all' && featuredContent && (
        <div className="space-y-8">
          {/* Top Tracks */}
          <div>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center">
              <Music className="w-5 h-5 mr-2" />
              Top Tracks ({getPeriodLabel(timePeriod)})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {featuredContent.tracks.map((track, index) => (
                <Link
                  key={track.id}
                  to={`/tracks/${track.slug}`}
                  className="bg-gray-900 rounded-lg p-4 hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="text-2xl font-bold text-purple-500">#{index + 1}</div>
                    <div className="flex-1">
                      <h3 className="text-white font-semibold">{track.title}</h3>
                      <p className="text-gray-400 text-sm">{track.artist.name}</p>
                      <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                        <span className="flex items-center">
                          <Download className="w-3 h-3 mr-1" />
                          {formatNumber(track.download_count)}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Top Albums */}
          <div>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center">
              <AlbumIcon className="w-5 h-5 mr-2" />
              Top Albums ({getPeriodLabel(timePeriod)})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {featuredContent.albums.map((album, index) => (
                <Link
                  key={album.id}
                  to={`/albums/${album.slug}`}
                  className="bg-gray-900 rounded-lg p-4 hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="text-2xl font-bold text-blue-500">#{index + 1}</div>
                    <div className="flex-1">
                      <h3 className="text-white font-semibold">{album.title}</h3>
                      <p className="text-gray-400 text-sm">{album.artist.name}</p>
                      <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                        <span className="flex items-center">
                          <Music className="w-3 h-3 mr-1" />
                          {album.tracks_count} tracks
                        </span>
                        <span className="flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {album.release_date ? new Date(album.release_date).getFullYear() : 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Top Mixtapes */}
          <div>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center">
              <Radio className="w-5 h-5 mr-2" />
              Top Mixtapes ({getPeriodLabel(timePeriod)})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {featuredContent.mixtapes.map((mixtape, index) => (
                <Link
                  key={mixtape.id}
                  to={`/mixtapes/${mixtape.slug}`}
                  className="bg-gray-900 rounded-lg p-4 hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="text-2xl font-bold text-yellow-500">#{index + 1}</div>
                    <div className="flex-1">
                      <h3 className="text-white font-semibold">{mixtape.title}</h3>
                      <p className="text-gray-400 text-sm">{mixtape.artist.name}</p>
                      <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                        <span className="flex items-center">
                          <Download className="w-3 h-3 mr-1" />
                          {formatNumber(mixtape.download_count)}
                        </span>
                        <span className="flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {mixtape.release_date ? new Date(mixtape.release_date).getFullYear() : 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'tracks' && featuredContent && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {featuredContent.tracks.map((track, index) => (
            <Link
              key={track.id}
              to={`/tracks/${track.slug}`}
              className="bg-gray-900 rounded-lg p-4 hover:bg-gray-800 transition-colors"
            >
              <div className="flex items-center space-x-4">
                <div className="text-2xl font-bold text-purple-500">#{index + 1}</div>
                <div className="flex-1">
                  <h3 className="text-white font-semibold">{track.title}</h3>
                  <p className="text-gray-400 text-sm">{track.artist.name}</p>
                  <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                    <span className="flex items-center">
                      <Download className="w-3 h-3 mr-1" />
                      {formatNumber(track.download_count)}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {activeTab === 'albums' && featuredContent && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {featuredContent.albums.map((album, index) => (
            <Link
              key={album.id}
              to={`/albums/${album.slug}`}
              className="bg-gray-900 rounded-lg p-4 hover:bg-gray-800 transition-colors"
            >
              <div className="flex items-center space-x-4">
                <div className="text-2xl font-bold text-blue-500">#{index + 1}</div>
                <div className="flex-1">
                  <h3 className="text-white font-semibold">{album.title}</h3>
                  <p className="text-gray-400 text-sm">{album.artist.name}</p>
                  <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                    <span className="flex items-center">
                      <Music className="w-3 h-3 mr-1" />
                      {album.tracks_count} tracks
                    </span>
                    <span className="flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      {album.release_date ? new Date(album.release_date).getFullYear() : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {activeTab === 'mixtapes' && featuredContent && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {featuredContent.mixtapes.map((mixtape, index) => (
            <Link
              key={mixtape.id}
              to={`/mixtapes/${mixtape.slug}`}
              className="bg-gray-900 rounded-lg p-4 hover:bg-gray-800 transition-colors"
            >
              <div className="flex items-center space-x-4">
                <div className="text-2xl font-bold text-yellow-500">#{index + 1}</div>
                <div className="flex-1">
                  <h3 className="text-white font-semibold">{mixtape.title}</h3>
                  <p className="text-gray-400 text-sm">{mixtape.artist.name}</p>
                  <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                    <span className="flex items-center">
                      <Download className="w-3 h-3 mr-1" />
                      {formatNumber(mixtape.download_count)}
                    </span>
                    <span className="flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      {mixtape.release_date ? new Date(mixtape.release_date).getFullYear() : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {activeTab === 'artists' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {topArtists.map((artist, index) => (
            <Link
              key={artist.id}
              to={`/artists/${artist.slug}`}
              className="bg-gray-900 rounded-lg p-4 hover:bg-gray-800 transition-colors"
            >
              <div className="flex items-center space-x-4">
                <div className="text-2xl font-bold text-green-500">#{index + 1}</div>
                <div className="flex-1">
                  <h3 className="text-white font-semibold">{artist.name}</h3>
                  <p className="text-gray-400 text-sm">{artist.bio}</p>
                  <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                    <span className="flex items-center">
                      <Users className="w-3 h-3 mr-1" />
                      Artist
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* View More Link */}
      <div className="text-center">
        <Link
          to={`/featured/${activeTab}`}
          className="inline-flex items-center space-x-2 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
        >
          <span>View More {activeTab === 'all' ? 'Featured Content' : activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</span>
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};

export default Featured;
