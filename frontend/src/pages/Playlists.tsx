import React, { useState, useEffect } from 'react';
import { PlusIcon, MusicIcon, PlayIcon, HeartIcon, ShareIcon, MoreVerticalIcon, TrashIcon, CopyIcon } from 'lucide-react';
import { apiService, Playlist } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { usePlayer } from '../contexts/PlayerContext';

const Playlists: React.FC = () => {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPlaylist, setNewPlaylist] = useState({ name: '', description: '', is_public: false });
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);
  
  const { state: authState } = useAuth();
  const { playTrack, setQueue } = usePlayer();

  useEffect(() => {
    fetchPlaylists();
  }, []);

  const fetchPlaylists = async () => {
    try {
      setLoading(true);
      const response = await apiService.getPlaylists();
      setPlaylists(response.data.results || response.data);
    } catch (error) {
      console.error('Error fetching playlists:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePlaylist = async () => {
    if (!authState.isAuthenticated) return;
    
    try {
      const response = await apiService.createPlaylist(newPlaylist);
      setPlaylists([response.data, ...playlists]);
      setShowCreateModal(false);
      setNewPlaylist({ name: '', description: '', is_public: false });
    } catch (error) {
      console.error('Error creating playlist:', error);
    }
  };

  const handleDeletePlaylist = async (playlistId: number) => {
    if (!authState.isAuthenticated) return;
    
    try {
      await apiService.deletePlaylist(playlistId);
      setPlaylists(playlists.filter(p => p.id !== playlistId));
      if (selectedPlaylist?.id === playlistId) {
        setSelectedPlaylist(null);
      }
    } catch (error) {
      console.error('Error deleting playlist:', error);
    }
  };

  const handleAddTrackToPlaylist = async (playlistId: number, trackId: number) => {
    if (!authState.isAuthenticated) return;
    
    try {
      await apiService.addTrackToPlaylist(playlistId, trackId);
      // Refresh the selected playlist if it's the one we're adding to
      if (selectedPlaylist?.id === playlistId) {
        const response = await apiService.getPlaylist(playlistId);
        setSelectedPlaylist(response.data);
      }
    } catch (error) {
      console.error('Error adding track to playlist:', error);
    }
  };

  const handleRemoveTrackFromPlaylist = async (playlistId: number, trackId: number) => {
    if (!authState.isAuthenticated) return;
    
    try {
      await apiService.removeTrackFromPlaylist(playlistId, trackId);
      // Refresh the selected playlist if it's the one we're removing from
      if (selectedPlaylist?.id === playlistId) {
        const response = await apiService.getPlaylist(playlistId);
        setSelectedPlaylist(response.data);
      }
    } catch (error) {
      console.error('Error removing track from playlist:', error);
    }
  };

  const handleDuplicatePlaylist = async (playlistId: number) => {
    if (!authState.isAuthenticated) return;
    
    try {
      const response = await apiService.duplicatePlaylist(playlistId);
      setPlaylists([response.data, ...playlists]);
    } catch (error) {
      console.error('Error duplicating playlist:', error);
    }
  };

  const handlePlayPlaylist = (playlist: Playlist) => {
    if (playlist.tracks && playlist.tracks.length > 0) {
      setQueue(playlist.tracks);
      playTrack(playlist.tracks[0]);
    }
  };

  const handleSharePlaylist = (playlist: Playlist) => {
    const shareUrl = `${window.location.origin}/playlist/${playlist.id}`;
    if (navigator.share) {
      navigator.share({
        title: playlist.name,
        text: `Check out my playlist "${playlist.name}" on Ghettoselebu!`,
        url: shareUrl
      });
    } else {
        navigator.clipboard.writeText(shareUrl);
        alert('Playlist link copied to clipboard!');
    }
  };

  const handlePlayTrack = (track: any) => {
    playTrack(track);
  };

  if (!authState.isAuthenticated) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
        <div className="text-center">
          <MusicIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Sign in to manage playlists</h2>
          <p className="text-gray-400 mb-6">Please log in to create and manage your music playlists</p>
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
            <h1 className="text-2xl font-bold text-white">My Playlists</h1>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center gap-2"
            >
              <PlusIcon className="h-5 w-5" />
              Create Playlist
            </button>
          </div>
        </div>
      </div>

      {/* Create Playlist Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Create New Playlist</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <MoreVerticalIcon className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleCreatePlaylist(); }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Playlist Name</label>
                  <input
                    type="text"
                    value={newPlaylist.name}
                    onChange={(e) => setNewPlaylist({ ...newPlaylist, name: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Enter playlist name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                  <textarea
                    value={newPlaylist.description}
                    onChange={(e) => setNewPlaylist({ ...newPlaylist, description: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    rows={3}
                    placeholder="Enter playlist description (optional)"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_public"
                    checked={newPlaylist.is_public}
                    onChange={(e) => setNewPlaylist({ ...newPlaylist, is_public: e.target.checked })}
                    className="h-4 w-4 text-red-600 bg-gray-800 border-gray-700 rounded focus:ring-red-500 focus:ring-2"
                  />
                  <label htmlFor="is_public" className="ml-2 text-sm font-medium text-gray-300">
                    Make this playlist public
                  </label>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                  >
                    Create Playlist
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Playlists Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
          </div>
        ) : playlists.length === 0 ? (
          <div className="text-center py-16">
            <MusicIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No playlists yet</h3>
            <p className="text-gray-400 mb-6">Create your first playlist to start organizing your music</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors"
            >
              Create Your First Playlist
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {playlists.map((playlist) => (
              <div key={playlist.id} className="bg-gray-900 rounded-lg p-6 hover:bg-gray-800 transition-all duration-300 group">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">{playlist.name}</h3>
                    {playlist.is_public && (
                      <span className="bg-green-600 text-xs px-2 py-1 rounded-full text-white">Public</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handlePlayPlaylist(playlist)}
                      className="bg-red-600 text-white p-2 rounded-lg hover:bg-red-700 transition-colors"
                      title="Play playlist"
                    >
                      <PlayIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setSelectedPlaylist(playlist)}
                      className="bg-gray-700 text-white p-2 rounded-lg hover:bg-gray-600 transition-colors"
                      title="View details"
                    >
                      <MoreVerticalIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleSharePlaylist(playlist)}
                      className="bg-gray-700 text-white p-2 rounded-lg hover:bg-gray-600 transition-colors"
                      title="Share playlist"
                    >
                      <ShareIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDuplicatePlaylist(playlist.id)}
                      className="bg-gray-700 text-white p-2 rounded-lg hover:bg-gray-600 transition-colors"
                      title="Duplicate playlist"
                    >
                      <CopyIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeletePlaylist(playlist.id)}
                      className="bg-red-600 text-white p-2 rounded-lg hover:bg-red-700 transition-colors"
                      title="Delete playlist"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <p className="text-gray-400 text-sm mb-3 line-clamp-2">{playlist.description || 'No description'}</p>
                
                <div className="flex items-center justify-between text-sm text-gray-400">
                  <span>{playlist.tracks.length} tracks</span>
                  <span>• Created {new Date(playlist.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Playlist Detail Modal */}
      {selectedPlaylist && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">{selectedPlaylist.name}</h2>
              <button
                onClick={() => setSelectedPlaylist(null)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <MoreVerticalIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Actions</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => handlePlayPlaylist(selectedPlaylist)}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                  >
                    <PlayIcon className="h-4 w-4" />
                    Play All
                  </button>
                  <button
                    onClick={() => handleSharePlaylist(selectedPlaylist)}
                    className="bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2"
                  >
                    <ShareIcon className="h-4 w-4" />
                    Share
                  </button>
                  <button
                    onClick={() => handleDuplicatePlaylist(selectedPlaylist.id)}
                    className="bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2"
                  >
                    <CopyIcon className="h-4 w-4" />
                    Duplicate
                  </button>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Tracks ({selectedPlaylist.tracks.length})</h3>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {selectedPlaylist.tracks.map((track, index) => (
                    <div key={track.id} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors">
                      <div className="flex items-center space-x-3 flex-1">
                        <span className="text-white font-medium">{index + 1}. {track.title}</span>
                        <span className="text-gray-400 text-sm">{track.artist.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handlePlayTrack(track)}
                          className="bg-red-600 text-white p-2 rounded-lg hover:bg-red-700 transition-colors"
                          title="Play track"
                        >
                          <PlayIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleRemoveTrackFromPlaylist(selectedPlaylist.id, track.id)}
                          className="text-red-400 hover:text-red-300 transition-colors p-2"
                          title="Remove from playlist"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Playlists;
