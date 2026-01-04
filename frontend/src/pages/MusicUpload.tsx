import React, { useState, useEffect } from 'react';
import { Upload, Music, Disc, Radio, Save, Plus, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';
import api from '../services/api';

interface TrackFormData {
  title: string;
  artist: number;
  album?: number;
  genre?: number;
  featuring_artists: number[];
  track_number?: number;
  duration?: string;
  audio_file?: File;
  file_size?: string;
  bitrate?: string;
  format?: string;
  is_explicit: boolean;
}

interface AlbumFormData {
  title: string;
  artist: number;
  genre?: number;
  release_date?: string;
  cover_art?: File;
  description: string;
  is_explicit: boolean;
  bitrate?: string;
  format?: string;
  tracks: TrackFormData[];
}

interface MixtapeFormData {
  title: string;
  artist: number;
  cover_art?: File;
  description: string;
  release_date?: string;
  tracks: TrackFormData[];
}

interface FormData {
  title: string;
  description: string;
  is_explicit: boolean;
  artist?: number;
  genre?: number;
  release_date?: string;
  cover_art?: File;
  audio_file?: File;
  tracks: TrackFormData[];
  track_number?: number;
}

const MusicUpload: React.FC = () => {
  const { state } = useAuth();
  const [uploadType, setUploadType] = useState<'track' | 'album' | 'mixtape'>('track');
  const [loading, setLoading] = useState(false);
  const [artists, setArtists] = useState<any[]>([]);
  const [genres, setGenres] = useState<any[]>([]);
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    is_explicit: false,
    tracks: []
  });

  useEffect(() => {
    if (state.user) {
      fetchArtists();
      fetchGenres();
    }
  }, [state.user]);

  const fetchArtists = async () => {
    try {
      const response = await apiService.getArtists();
      setArtists(response.data.results);
    } catch (error) {
      console.error('Error fetching artists:', error);
    }
  };

  const fetchGenres = async () => {
    try {
      const response = await apiService.getGenres();
      setGenres(response.data.results);
    } catch (error) {
      console.error('Error fetching genres:', error);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: string) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev: FormData) => ({
        ...prev,
        [type]: file
      }));
    }
  };

  const handleTrackFileUpload = (index: number, file: File) => {
    setFormData((prev: FormData) => ({
      ...prev,
      tracks: prev.tracks.map((track: TrackFormData, i: number) => 
        i === index ? { ...track, audio_file: file } : track
      )
    }));
  };

  const addTrack = () => {
    setFormData((prev: FormData) => ({
      ...prev,
      tracks: [...prev.tracks, {
        title: '',
        artist: state.user?.id || 1,
        featuring_artists: [],
        track_number: prev.tracks.length + 1,
        is_explicit: false
      }]
    }));
  };

  const removeTrack = (index: number) => {
    setFormData((prev: FormData) => ({
      ...prev,
      tracks: prev.tracks.filter((_: TrackFormData, i: number) => i !== index)
    }));
  };

  const updateTrack = (index: number, field: string, value: any) => {
    setFormData((prev: FormData) => ({
      ...prev,
      tracks: prev.tracks.map((track: TrackFormData, i: number) => 
        i === index ? { ...track, [field]: value } : track
      )
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      
      // Add basic fields
      formDataToSend.append('title', formData.title);
      formDataToSend.append('is_explicit', formData.is_explicit.toString());
      
      // Add artist
      formDataToSend.append('artist', (formData.artist || state.user?.id || 1).toString());
      
      // Add genre if available
      if (formData.genre) {
        formDataToSend.append('genre', formData.genre.toString());
      }
      
      // Add album/mixtape specific fields
      if (uploadType === 'album' || uploadType === 'mixtape') {
        if (formData.cover_art) {
          formDataToSend.append('cover_art', formData.cover_art);
        }
        
        if (formData.release_date) {
          formDataToSend.append('release_date', formData.release_date);
        }
        
        if (formData.description) {
          formDataToSend.append('description', formData.description);
        }
      } else {
        // Single track - add audio file
        if (formData.audio_file) {
          formDataToSend.append('audio_file', formData.audio_file);
        }
      }
      
      // Add track number if available
      if (formData.track_number) {
        formDataToSend.append('track_number', formData.track_number.toString());
      }

      let response;
      if (uploadType === 'track') {
        // Use the new audio processing API for single tracks
        response = await apiService.audioAPI.uploadAndProcessTrack(formDataToSend);
      } else if (uploadType === 'album') {
        response = await api.post('/albums/', formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        response = await api.post('/mixtapes/', formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      if (uploadType === 'track') {
        // Show processing info for tracks
        const processingInfo = response.data.processing_info;
        alert(`${uploadType.charAt(0).toUpperCase() + uploadType.slice(1)} uploaded and processed successfully!\n\nProcessing Details:\n- Metadata extracted: ${processingInfo.extracted_metadata ? 'Yes' : 'No'}\n- Site branding added: ${processingInfo.has_site_branding ? 'Yes' : 'No'}\n- Optimized for streaming: ${processingInfo.is_optimized ? 'Yes' : 'No'}`);
      } else {
        alert(`${uploadType.charAt(0).toUpperCase() + uploadType.slice(1)} uploaded successfully!`);
      }
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        is_explicit: false,
        tracks: []
      });
      
    } catch (error) {
      console.error('Error uploading:', error);
      alert('Failed to upload. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-8">Upload Music</h1>
        
        {/* Upload Type Selection */}
        <div className="flex space-x-4 mb-8">
          <button
            onClick={() => setUploadType('track')}
            className={`flex items-center px-6 py-3 rounded-lg font-semibold transition-colors ${
              uploadType === 'track'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            <Music className="w-5 h-5 mr-2" />
            Single Track
          </button>
          <button
            onClick={() => setUploadType('album')}
            className={`flex items-center px-6 py-3 rounded-lg font-semibold transition-colors ${
              uploadType === 'album'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            <Disc className="w-5 h-5 mr-2" />
            Album
          </button>
          <button
            onClick={() => setUploadType('mixtape')}
            className={`flex items-center px-6 py-3 rounded-lg font-semibold transition-colors ${
              uploadType === 'mixtape'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            <Radio className="w-5 h-5 mr-2" />
            Mixtape
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="bg-gray-900 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">Basic Information</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  {uploadType === 'track' ? 'Track Title' : uploadType === 'album' ? 'Album Title' : 'Mixtape Title'}
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData((prev: FormData) => ({ ...prev, title: e.target.value }))}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>

              {(uploadType === 'album' || uploadType === 'mixtape') && (
                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData((prev: FormData) => ({ ...prev, description: e.target.value }))}
                    rows={4}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Describe your album or mixtape..."
                  />
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Artist</label>
                  <select
                    value={formData.artist || ''}
                    onChange={(e) => setFormData((prev: FormData) => ({ ...prev, artist: parseInt(e.target.value) }))}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">Select Artist</option>
                    {artists.map(artist => (
                      <option key={artist.id} value={artist.id}>
                        {artist.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Genre</label>
                  <select
                    value={formData.genre || ''}
                    onChange={(e) => setFormData((prev: FormData) => ({ ...prev, genre: parseInt(e.target.value) }))}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">Select Genre</option>
                    {genres.map(genre => (
                      <option key={genre.id} value={genre.id}>
                        {genre.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {(uploadType === 'album' || uploadType === 'mixtape') && (
                <div>
                  <label className="block text-sm font-medium mb-2">Release Date</label>
                  <input
                    type="date"
                    value={formData.release_date || ''}
                    onChange={(e) => setFormData((prev: FormData) => ({ ...prev, release_date: e.target.value }))}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              )}

              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.is_explicit}
                  onChange={(e) => setFormData((prev: FormData) => ({ ...prev, is_explicit: e.target.checked }))}
                  className="w-4 h-4 text-purple-600 bg-gray-800 border-gray-700 rounded focus:ring-purple-500"
                />
                <label className="ml-2 text-sm">
                  Contains explicit content
                </label>
              </div>
            </div>
          </div>

          {/* File Upload */}
          <div className="bg-gray-900 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">File Upload</h2>
            
            {uploadType === 'track' ? (
              <div>
                <label className="block text-sm font-medium mb-2">Audio File</label>
                <div className="border-2 border-dashed border-gray-700 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={(e) => handleFileUpload(e, 'audio_file')}
                    className="hidden"
                    id="audio-upload"
                  />
                  <label htmlFor="audio-upload" className="cursor-pointer">
                    <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-400">Click to upload audio file</p>
                    <p className="text-sm text-gray-500 mt-2">MP3, WAV, FLAC (Max 100MB)</p>
                  </label>
                  {formData.audio_file && (
                    <p className="mt-4 text-green-400">
                      Selected: {formData.audio_file.name}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium mb-2">Cover Art</label>
                <div className="border-2 border-dashed border-gray-700 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, 'cover_art')}
                    className="hidden"
                    id="cover-upload"
                  />
                  <label htmlFor="cover-upload" className="cursor-pointer">
                    <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-400">Click to upload cover art</p>
                    <p className="text-sm text-gray-500 mt-2">JPG, PNG (Max 10MB)</p>
                  </label>
                  {formData.cover_art && (
                    <p className="mt-4 text-green-400">
                      Selected: {formData.cover_art.name}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Tracks for Albums/Mixtapes */}
          {(uploadType === 'album' || uploadType === 'mixtape') && (
            <div className="bg-gray-900 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Tracks</h2>
                <button
                  type="button"
                  onClick={addTrack}
                  className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Track
                </button>
              </div>
              
              {formData.tracks.length === 0 ? (
                <p className="text-gray-400 text-center py-8">No tracks added yet. Click "Add Track" to get started.</p>
              ) : (
                <div className="space-y-4">
                  {formData.tracks.map((track: any, index: number) => (
                    <div key={index} className="bg-gray-800 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold">Track {index + 1}</h3>
                        <button
                          type="button"
                          onClick={() => removeTrack(index)}
                          className="text-red-400 hover:text-red-300 transition-colors"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">Title</label>
                          <input
                            type="text"
                            value={track.title}
                            onChange={(e) => updateTrack(index, 'title', e.target.value)}
                            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            placeholder="Track title"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium mb-2">Track Number</label>
                          <input
                            type="number"
                            value={track.track_number}
                            onChange={(e) => updateTrack(index, 'track_number', parseInt(e.target.value))}
                            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            min="1"
                          />
                        </div>
                      </div>
                      
                      <div className="mt-4">
                        <label className="block text-sm font-medium mb-2">Audio File</label>
                        <div className="border-2 border-dashed border-gray-600 rounded-lg p-4 text-center">
                          <input
                            type="file"
                            accept="audio/*"
                            onChange={(e) => e.target.files?.[0] && handleTrackFileUpload(index, e.target.files[0])}
                            className="hidden"
                            id={`track-audio-${index}`}
                          />
                          <label htmlFor={`track-audio-${index}`} className="cursor-pointer">
                            <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                            <p className="text-gray-400 text-sm">Click to upload audio file</p>
                          </label>
                          {track.audio_file && (
                            <p className="mt-2 text-green-400 text-sm">
                              {track.audio_file.name}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center px-8 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                  Uploading...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5 mr-2" />
                  Upload {uploadType.charAt(0).toUpperCase() + uploadType.slice(1)}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MusicUpload;
