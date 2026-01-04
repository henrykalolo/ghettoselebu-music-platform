import React, { useState, useEffect } from 'react';
import { TrendingUp, Music, Users, Calendar } from 'lucide-react';
import { apiService } from '../services/api';
import { Track, Album, Mixtape } from '../services/api';

interface TrendingItem {
  id: number;
  content_type: string;
  object_id: number;
  score: number;
  period_start: string;
  period_end: string;
  is_featured: boolean;
  content?: Track | Album | Mixtape;
}

const Trending: React.FC = () => {
  const [trendingItems, setTrendingItems] = useState<TrendingItem[]>([]);
  const [featuredItems, setFeaturedItems] = useState<TrendingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'weekly' | 'featured'>('weekly');

  useEffect(() => {
    fetchTrending();
    fetchFeatured();
  }, []);

  const fetchTrending = async () => {
    try {
      const response = await apiService.socialAPI.getTrending();
      setTrendingItems(response.data);
    } catch (error) {
      console.error('Error fetching trending:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFeatured = async () => {
    try {
      const response = await apiService.socialAPI.getFeatured();
      setFeaturedItems(response.data);
    } catch (error) {
      console.error('Error fetching featured:', error);
    }
  };

  const renderContent = (item: TrendingItem) => {
    if (!item.content) return null;

    const Content = () => {
      switch (item.content_type) {
        case 'track':
          const track = item.content as Track;
          return (
            <div className="flex items-center space-x-4 p-4 bg-gray-800 rounded-lg">
              <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center">
                <Music className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold">{track.title}</h4>
                <p className="text-sm text-gray-400">{track.artist.name}</p>
                {track.duration && (
                  <p className="text-xs text-gray-500">{track.duration}</p>
                )}
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold text-purple-400">{item.score.toFixed(1)}</span>
                <p className="text-xs text-gray-400">trending score</p>
              </div>
            </div>
          );

        case 'album':
          const album = item.content as Album;
          return (
            <div className="flex items-center space-x-4 p-4 bg-gray-800 rounded-lg">
              <img
                src={album.cover_art || '/default-album.png'}
                alt={album.title}
                className="w-16 h-16 rounded"
              />
              <div className="flex-1">
                <h4 className="font-semibold">{album.title}</h4>
                <p className="text-sm text-gray-400">{album.artist.name}</p>
                <p className="text-xs text-gray-500">{album.tracks_count} tracks</p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold text-purple-400">{item.score.toFixed(1)}</span>
                <p className="text-xs text-gray-400">trending score</p>
              </div>
            </div>
          );

        case 'mixtape':
          const mixtape = item.content as Mixtape;
          return (
            <div className="flex items-center space-x-4 p-4 bg-gray-800 rounded-lg">
              <img
                src={mixtape.cover_art || '/default-mixtape.png'}
                alt={mixtape.title}
                className="w-16 h-16 rounded"
              />
              <div className="flex-1">
                <h4 className="font-semibold">{mixtape.title}</h4>
                <p className="text-sm text-gray-400">{mixtape.artist.name}</p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold text-purple-400">{item.score.toFixed(1)}</span>
                <p className="text-xs text-gray-400">trending score</p>
              </div>
            </div>
          );

        default:
          return null;
      }
    };

    return <Content />;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  const currentItems = activeTab === 'weekly' ? trendingItems : featuredItems;

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold flex items-center">
            <TrendingUp className="w-8 h-8 mr-3 text-purple-400" />
            Trending Music
          </h1>
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveTab('weekly')}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                activeTab === 'weekly'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              This Week
            </button>
            <button
              onClick={() => setActiveTab('featured')}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                activeTab === 'featured'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              Featured
            </button>
          </div>
        </div>

        {currentItems.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <TrendingUp className="w-16 h-16 mx-auto mb-4 text-gray-500" />
            <p className="text-xl mb-2">No trending music available</p>
            <p>Check back later for the hottest tracks!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {currentItems.map((item) => (
              <div key={item.id} className="bg-gray-900 rounded-lg p-6 hover:bg-gray-800 transition-colors">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-1 bg-purple-600 text-white text-xs rounded-full">
                      {item.content_type.toUpperCase()}
                    </span>
                    {item.is_featured && (
                      <span className="px-2 py-1 bg-yellow-600 text-white text-xs rounded-full">
                        FEATURED
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-400">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    {new Date(item.period_start).toLocaleDateString()} - {new Date(item.period_end).toLocaleDateString()}
                  </div>
                </div>
                
                {renderContent(item)}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Trending;
