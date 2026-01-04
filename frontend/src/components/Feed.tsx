import React, { useState, useEffect } from 'react';
import { Heart, MessageCircle, Share2, Play, MoreHorizontal } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';

interface FeedItem {
  id: number;
  user: {
    user: {
      username: string;
    };
    profile_image?: string;
  };
  content_type: string;
  object_id: number;
  content?: {
    id: number;
    title: string;
    artist?: {
      name: string;
      image?: string;
    };
    cover_art?: string;
    audio_file?: string;
    duration?: string;
    likes_count: number;
    comments_count: number;
    is_liked: boolean;
  };
  created_at: string;
}

const Feed: React.FC = () => {
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { state } = useAuth();

  useEffect(() => {
    fetchFeed();
  }, []);

  const fetchFeed = async () => {
    try {
      const response = await apiService.socialAPI.getTimeline();
      setFeedItems(response.data);
    } catch (error) {
      console.error('Error fetching feed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (contentType: string, objectId: number) => {
    if (!state.user) return;
    
    try {
      await apiService.socialAPI.toggleLike(contentType, objectId);
      
      // Update the local state
      setFeedItems(prevItems => 
        prevItems.map(item => {
          if (item.content && item.content.id === objectId) {
            return {
              ...item,
              content: {
                ...item.content,
                is_liked: !item.content.is_liked,
                likes_count: item.content.is_liked 
                  ? item.content.likes_count - 1 
                  : item.content.likes_count + 1
              }
            };
          }
          return item;
        })
      );
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleShare = async (contentType: string, objectId: number) => {
    if (!state.user) return;
    
    try {
      await apiService.socialAPI.createShare(contentType, objectId, 'Check this out!');
      alert('Shared successfully!');
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const formatDuration = (duration: string) => {
    if (!duration) return '--:--';
    const match = duration.match(/(\d+):(\d+):(\d+)/);
    if (match) {
      const [, hours, minutes, seconds] = match;
      return hours === '00' ? `${minutes}:${seconds}` : `${hours}:${minutes}:${seconds}`;
    }
    return duration;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold mb-6">Your Feed</h2>
      
      {feedItems.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p>No items in your feed yet.</p>
          <p className="mt-2">Follow some artists to see their updates here!</p>
        </div>
      ) : (
        feedItems.map((item) => (
          <div key={item.id} className="bg-gray-900 rounded-lg p-6 hover:bg-gray-800 transition-colors">
            {/* User info */}
            <div className="flex items-center mb-4">
              <img
                src={item.user.profile_image || '/default-avatar.png'}
                alt={item.user.user.username}
                className="w-10 h-10 rounded-full mr-3"
              />
              <div>
                <p className="font-semibold">{item.user.user.username}</p>
                <p className="text-sm text-gray-400">
                  {new Date(item.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Content */}
            {item.content && (
              <div className="mb-4">
                {item.content_type === 'track' && (
                  <div className="flex items-center space-x-4 p-4 bg-gray-800 rounded-lg">
                    <button className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center hover:bg-purple-700 transition-colors">
                      <Play className="w-5 h-5 text-white ml-1" />
                    </button>
                    <div className="flex-1">
                      <h4 className="font-semibold">{item.content.title}</h4>
                      <p className="text-sm text-gray-400">{item.content.artist?.name}</p>
                    </div>
                    {item.content.duration && (
                      <span className="text-sm text-gray-400">
                        {formatDuration(item.content.duration)}
                      </span>
                    )}
                  </div>
                )}

                {item.content_type === 'album' && (
                  <div className="flex items-center space-x-4 p-4 bg-gray-800 rounded-lg">
                    <img
                      src={item.content.cover_art || '/default-album.png'}
                      alt={item.content.title}
                      className="w-16 h-16 rounded"
                    />
                    <div className="flex-1">
                      <h4 className="font-semibold">{item.content.title}</h4>
                      <p className="text-sm text-gray-400">{item.content.artist?.name}</p>
                    </div>
                  </div>
                )}

                {item.content_type === 'mixtape' && (
                  <div className="flex items-center space-x-4 p-4 bg-gray-800 rounded-lg">
                    <img
                      src={item.content.cover_art || '/default-mixtape.png'}
                      alt={item.content.title}
                      className="w-16 h-16 rounded"
                    />
                    <div className="flex-1">
                      <h4 className="font-semibold">{item.content.title}</h4>
                      <p className="text-sm text-gray-400">{item.content.artist?.name}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center space-x-6">
              <button
                onClick={() => item.content && handleLike(item.content_type, item.content.id)}
                className={`flex items-center space-x-2 hover:text-purple-400 transition-colors ${
                  item.content?.is_liked ? 'text-purple-500' : 'text-gray-400'
                }`}
              >
                <Heart className={`w-5 h-5 ${item.content?.is_liked ? 'fill-current' : ''}`} />
                <span>{item.content?.likes_count || 0}</span>
              </button>

              <button className="flex items-center space-x-2 text-gray-400 hover:text-purple-400 transition-colors">
                <MessageCircle className="w-5 h-5" />
                <span>{item.content?.comments_count || 0}</span>
              </button>

              <button
                onClick={() => item.content && handleShare(item.content_type, item.content.id)}
                className="flex items-center space-x-2 text-gray-400 hover:text-purple-400 transition-colors"
              >
                <Share2 className="w-5 h-5" />
                <span>Share</span>
              </button>

              <button className="text-gray-400 hover:text-purple-400 transition-colors">
                <MoreHorizontal className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default Feed;
