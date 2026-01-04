import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PlayIcon, DownloadIcon, MusicIcon, CalendarIcon, TrendingUpIcon, HeartIcon } from 'lucide-react';
import { apiService, Artist, Track, Album, Mixtape } from '../services/api';
import { usePlayer } from '../contexts/PlayerContext';
import { useAuth } from '../contexts/AuthContext';

const ArtistDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [artist, setArtist] = useState<Artist | null>(null);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [mixtapes, setMixtapes] = useState<Mixtape[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'albums' | 'tracks' | 'mixtapes'>('albums');
  
  const { playTrack } = usePlayer();
  const { state: authState } = useAuth();

  useEffect(() => {
    const fetchArtistData = async () => {
      if (!slug) return;
      
      try {
        setLoading(true);
        const [artistRes, albumsRes, tracksRes, mixtapesRes] = await Promise.all([
          apiService.getArtist(slug),
          apiService.getArtistAlbums(slug),
          apiService.getArtistTracks(slug),
          apiService.getArtistMixtapes(slug),
        ]);

        setArtist(artistRes.data);
        setAlbums(albumsRes.data);
        setTracks(tracksRes.data);
        setMixtapes(mixtapesRes.data);
      } catch (error) {
        console.error('Error fetching artist data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchArtistData();
  }, [slug]);

  const handlePlayTrack = (track: Track) => {
    playTrack(track);
  };

  const handleDownload = async (itemSlug: string, type: 'track' | 'album' | 'mixtape') => {
    try {
      switch (type) {
        case 'track':
          await apiService.downloadTrack(itemSlug);
          break;
        case 'album':
          await apiService.downloadAlbum(itemSlug);
          break;
        case 'mixtape':
          await apiService.downloadMixtape(itemSlug);
          break;
      }
    } catch (error) {
      console.error('Error downloading:', error);
    }
  };

  const handleAddFavorite = async (itemId: number, type: 'track' | 'album') => {
    if (!authState.isAuthenticated) return;
    
    try {
      const { authAPI } = await import('../services/api');
      if (type === 'track') {
        await authAPI.addFavoriteTrack(itemId);
      } else {
        await authAPI.addFavoriteAlbum(itemId);
      }
    } catch (error) {
      console.error('Error adding favorite:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (!artist) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400 text-lg">Artist not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Artist Header */}
        <div className="bg-gradient-to-r from-red-600 to-red-800 rounded-lg p-8 mb-8">
          <div className="flex items-center space-x-6">
            <div className="bg-white bg-opacity-20 p-6 rounded-full">
              <MusicIcon className="h-16 w-16 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-white mb-2">{artist.name}</h1>
              <p className="text-red-100 text-lg mb-4">{artist.bio}</p>
              <div className="flex items-center space-x-6 text-red-100">
                <span>{albums.length} Albums</span>
                <span>{tracks.length} Tracks</span>
                <span>{mixtapes.length} Mixtapes</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-gray-900 rounded-lg p-1 mb-8">
          <div className="flex space-x-1">
            <button
              onClick={() => setActiveTab('albums')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'albums'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              Albums ({albums.length})
            </button>
            <button
              onClick={() => setActiveTab('tracks')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'tracks'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              Tracks ({tracks.length})
            </button>
            <button
              onClick={() => setActiveTab('mixtapes')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'mixtapes'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              Mixtapes ({mixtapes.length})
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'albums' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {albums.map((album) => (
              <div key={album.id} className="bg-gray-900 rounded-lg overflow-hidden hover:bg-gray-800 transition-all duration-300 group">
                <div className="aspect-square bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center relative">
                  <MusicIcon className="h-16 w-16 text-white opacity-50" />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                    <DownloadIcon className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-all duration-300" />
                  </div>
                  {album.is_explicit && (
                    <div className="absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-1 rounded">
                      E
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-white text-lg truncate mb-1">{album.title}</h3>
                  <p className="text-gray-400 truncate mb-2">{album.artist.name}</p>
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                    <span>{album.tracks_count} tracks</span>
                    <span>{album.bitrate}</span>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleDownload(album.slug, 'album')}
                      className="flex-1 bg-red-600 text-white px-3 py-2 rounded hover:bg-red-700 transition-colors text-sm"
                    >
                      Download
                    </button>
                    {authState.isAuthenticated && (
                      <button
                        onClick={() => handleAddFavorite(album.id, 'album')}
                        className="text-gray-400 hover:text-red-400 transition-colors p-2"
                      >
                        <HeartIcon className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'tracks' && (
          <div className="space-y-4">
            {tracks.map((track, index) => (
              <div key={track.id} className="bg-gray-900 rounded-lg p-4 hover:bg-gray-800 transition-all duration-300">
                <div className="flex items-center space-x-4">
                  <div className="text-gray-500 font-medium w-8 text-center">
                    {index + 1}
                  </div>
                  <button
                    onClick={() => handlePlayTrack(track)}
                    className="bg-red-600 p-3 rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <PlayIcon className="h-5 w-5 text-white" />
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold text-white truncate">{track.title}</h3>
                      {track.is_explicit && (
                        <span className="bg-red-600 text-white text-xs px-2 py-1 rounded flex-shrink-0">E</span>
                      )}
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-400 mt-1">
                      {track.album && (
                        <>
                          <Link to={`/albums/${track.album.slug}`} className="hover:text-white transition-colors">
                            {track.album.title}
                          </Link>
                          <span>•</span>
                        </>
                      )}
                      <span>{track.bitrate}</span>
                      {track.duration && (
                        <>
                          <span>•</span>
                          <span>{track.duration}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="text-sm text-gray-500">
                      <TrendingUpIcon className="h-3 w-3 mr-1 inline" />
                      {track.download_count}
                    </div>
                    <button
                      onClick={() => handleDownload(track.slug, 'track')}
                      className="text-gray-400 hover:text-white transition-colors p-2"
                    >
                      <DownloadIcon className="h-5 w-5" />
                    </button>
                    {authState.isAuthenticated && (
                      <button
                        onClick={() => handleAddFavorite(track.id, 'track')}
                        className="text-gray-400 hover:text-red-400 transition-colors p-2"
                      >
                        <HeartIcon className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'mixtapes' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mixtapes.map((mixtape) => (
              <div key={mixtape.id} className="bg-gray-900 rounded-lg overflow-hidden hover:bg-gray-800 transition-all duration-300">
                <div className="aspect-square bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center relative">
                  <MusicIcon className="h-16 w-16 text-white opacity-50" />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                    <DownloadIcon className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-all duration-300" />
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-white text-lg truncate mb-1">{mixtape.title}</h3>
                  <p className="text-gray-400 truncate mb-2">{mixtape.artist.name}</p>
                  {mixtape.description && (
                    <p className="text-gray-500 text-sm mb-3 line-clamp-2">{mixtape.description}</p>
                  )}
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                    <CalendarIcon className="h-3 w-3 mr-1" />
                    <span>{mixtape.release_date ? new Date(mixtape.release_date).getFullYear() : 'N/A'}</span>
                  </div>
                  <button
                    onClick={() => handleDownload(mixtape.slug, 'mixtape')}
                    className="w-full bg-red-600 text-white px-3 py-2 rounded hover:bg-red-700 transition-colors text-sm"
                  >
                    Download Mixtape
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty States */}
        {activeTab === 'albums' && albums.length === 0 && (
          <div className="text-center py-12">
            <MusicIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-400">No albums found</p>
          </div>
        )}
        {activeTab === 'tracks' && tracks.length === 0 && (
          <div className="text-center py-12">
            <MusicIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-400">No tracks found</p>
          </div>
        )}
        {activeTab === 'mixtapes' && mixtapes.length === 0 && (
          <div className="text-center py-12">
            <MusicIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-400">No mixtapes found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ArtistDetail;
