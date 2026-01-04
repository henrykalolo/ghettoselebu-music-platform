import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PlayIcon, DownloadIcon, ClockIcon, TrendingUpIcon, HeartIcon } from 'lucide-react';
import { apiService, Track } from '../services/api';
import { usePlayer } from '../contexts/PlayerContext';
import { useAuth } from '../contexts/AuthContext';

const Tracks: React.FC = () => {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [filterExplicit, setFilterExplicit] = useState<'all' | 'explicit' | 'clean'>('all');
  
  const { playTrack, state } = usePlayer();
  const { state: authState } = useAuth();

  useEffect(() => {
    const fetchTracks = async () => {
      try {
        const params: any = {
          ordering: `-${sortBy}`,
          search: searchTerm,
        };
        
        if (filterExplicit === 'explicit') {
          params.is_explicit = true;
        } else if (filterExplicit === 'clean') {
          params.is_explicit = false;
        }

        const response = await apiService.getTracks(params);
        setTracks(response.data.results);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching tracks:', error);
        setLoading(false);
      }
    };

    fetchTracks();
  }, [searchTerm, sortBy, filterExplicit]);

  const handleDownload = async (trackSlug: string, trackId: number) => {
    try {
      await apiService.downloadTrack(trackSlug);
      
      // Add to download history if authenticated
      if (authState.isAuthenticated) {
        const { authAPI } = await import('../services/api');
        await authAPI.addDownloadHistory(trackId);
      }
      
      // Update download count in UI
      setTracks(tracks.map(track => 
        track.slug === trackSlug 
          ? { ...track, download_count: track.download_count + 1 }
          : track
      ));
    } catch (error) {
      console.error('Error downloading track:', error);
    }
  };

  const handleAddFavorite = async (trackId: number) => {
    if (!authState.isAuthenticated) return;
    
    try {
      console.log('Adding favorite track:', trackId);
      const { authAPI } = await import('../services/api');
      await authAPI.addFavoriteTrack(trackId);
      console.log('Successfully added favorite track');
      // Refresh user profile to update favorites
      const { authAPI: auth } = await import('../services/api');
      const profileResponse = await auth.getProfile();
      // Update auth context with new profile data
      // This would need to be implemented in the AuthContext
    } catch (error) {
      console.error('Error adding favorite:', error);
    }
  };

  const handleRemoveFavorite = async (trackId: number) => {
    if (!authState.isAuthenticated) return;
    
    try {
      console.log('Removing favorite track:', trackId);
      const { authAPI } = await import('../services/api');
      await authAPI.removeFavoriteTrack(trackId);
      console.log('Successfully removed favorite track');
      // Refresh user profile to update favorites
      const { authAPI: auth } = await import('../services/api');
      const profileResponse = await auth.getProfile();
      // Update auth context with new profile data
    } catch (error) {
      console.error('Error removing favorite:', error);
    }
  };

  const isFavorite = (trackId: number) => {
    const isFav = authState.profile?.favorite_tracks?.some(track => track.id === trackId) || false;
    console.log('Track', trackId, 'is favorite:', isFav, 'favorite tracks:', authState.profile?.favorite_tracks);
    return isFav;
  };

  const handlePlayTrack = (track: Track) => {
    playTrack(track);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold text-white">Tracks</h1>
        
        <div className="flex flex-wrap gap-4 w-full lg:w-auto">
          <input
            type="text"
            placeholder="Search tracks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 flex-1 lg:flex-initial"
          />
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
          >
            <option value="created_at">Latest</option>
            <option value="download_count">Most Downloaded</option>
            <option value="title">Title</option>
            <option value="artist__name">Artist</option>
          </select>
          
          <select
            value={filterExplicit}
            onChange={(e) => setFilterExplicit(e.target.value as 'all' | 'explicit' | 'clean')}
            className="px-4 py-2 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
          >
            <option value="all">All</option>
            <option value="explicit">Explicit</option>
            <option value="clean">Clean</option>
          </select>
        </div>
      </div>

      <div className="space-y-4">
        {tracks.map((track, index) => (
          <div key={track.id} className="bg-gray-900 rounded-lg p-4 hover:bg-gray-800 transition-all duration-300 group">
            <div className="flex items-center space-x-4">
              {/* Track Number */}
              <div className="text-gray-500 font-medium w-8 text-center">
                {index + 1}
              </div>
              
              {/* Play Button */}
              <button 
                onClick={() => handlePlayTrack(track)}
                className={`p-3 rounded-lg transition-colors ${
                  state.currentTrack?.id === track.id && state.isPlaying
                    ? 'bg-red-700 hover:bg-red-800'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                <PlayIcon className="h-5 w-5 text-white" />
              </button>
              
              {/* Track Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <h3 className="font-semibold text-white truncate">{track.title}</h3>
                  {track.is_explicit && (
                    <span className="bg-red-600 text-white text-xs px-2 py-1 rounded flex-shrink-0">E</span>
                  )}
                  {state.currentTrack?.id === track.id && state.isPlaying && (
                    <span className="bg-green-600 text-white text-xs px-2 py-1 rounded flex-shrink-0 animate-pulse">
                      NOW PLAYING
                    </span>
                  )}
                </div>
                
                <div className="flex items-center space-x-4 text-sm text-gray-400 mt-1">
                  <Link to={`/artists/${track.artist.slug}`} className="hover:text-white transition-colors">
                    {track.artist.name}
                  </Link>
                  
                  {track.featuring_artists.length > 0 && (
                    <>
                      <span>•</span>
                      <span>
                        feat. {track.featuring_artists.map(artist => artist.name).join(', ')}
                      </span>
                    </>
                  )}
                  
                  {track.album && (
                    <>
                      <span>•</span>
                      <Link to={`/albums/${track.album.slug}`} className="hover:text-white transition-colors">
                        {track.album.title}
                      </Link>
                    </>
                  )}
                </div>
              </div>
              
              {/* Track Metadata */}
              <div className="hidden md:flex items-center space-x-4 text-sm text-gray-500">
                {track.duration && (
                  <div className="flex items-center">
                    <ClockIcon className="h-3 w-3 mr-1" />
                    {track.duration}
                  </div>
                )}
                
                <div className="flex items-center">
                  <TrendingUpIcon className="h-3 w-3 mr-1" />
                  {track.download_count.toLocaleString()}
                </div>
                
                <span>{track.bitrate}</span>
              </div>
              
              {/* Download Button */}
              <button 
                onClick={() => handleDownload(track.slug, track.id)}
                className="text-gray-400 hover:text-white transition-colors p-2"
                title="Download"
              >
                <DownloadIcon className="h-5 w-5" />
              </button>
              
              {/* Favorites Button */}
              {authState.isAuthenticated && (
                <button
                  onClick={() => isFavorite(track.id) ? handleRemoveFavorite(track.id) : handleAddFavorite(track.id)}
                  className={`transition-colors p-2 ${
                    isFavorite(track.id) 
                      ? 'text-red-400 hover:text-red-300' 
                      : 'text-gray-400 hover:text-red-400'
                  }`}
                  title={isFavorite(track.id) ? 'Remove from favorites' : 'Add to favorites'}
                >
                  <HeartIcon className={`h-4 w-4 ${isFavorite(track.id) ? 'fill-current' : ''}`} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {tracks.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-400 text-lg">No tracks found</p>
          <p className="text-gray-500 mt-2">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );
};

export default Tracks;
