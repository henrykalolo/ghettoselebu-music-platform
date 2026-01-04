import React, { useState } from 'react';
import { UploadIcon, MusicIcon, FileAudioIcon, XIcon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface FileUploadData {
  title: string;
  artist: string;
  album: string;
  genre: string;
  track_number?: number;
  duration?: string;
  bitrate?: string;
  is_explicit?: boolean;
}

interface UploadProgress {
  loaded: number;
  total: number;
  current: string;
}

const FileUpload: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({
  loaded: 0,
  total: 0,
  current: ''
});
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResults, setUploadResults] = useState<any[]>([]);
  
  const { state: authState } = useAuth();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    setFiles(selectedFiles);
  };

  const simulateUploadProgress = () => {
    const totalFiles = files.length;
    let currentFile = 0;
    
    const interval = setInterval(() => {
      if (currentFile < totalFiles) {
        currentFile++;
        setUploadProgress({
          loaded: Math.floor((currentFile / totalFiles) * 100),
          total: totalFiles,
          current: `Uploading ${files[currentFile - 1]?.name || 'file'} (${currentFile}/${totalFiles})`
        });
        
        if (currentFile >= totalFiles) {
          clearInterval(interval);
          setIsUploading(false);
          setUploadProgress({ loaded: 100, total: totalFiles, current: 'Upload complete!' });
          
          setTimeout(() => {
            setUploadProgress({ loaded: 0, total: 0, current: '' });
          }, 2000);
        }
      }
    }, 100);
  };

  const handleUpload = async () => {
    if (!authState.isAuthenticated || files.length === 0) return;
    
    setIsUploading(true);
    setUploadResults([]);
    
    const formData = new FormData();
    
    // Add all files to the 'files' field as expected by the backend
    files.forEach(file => {
      formData.append('files', file);
    });
    
    try {
      const response = await fetch('http://localhost:8000/api/upload/bulk/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token') || ''}`,
        },
        body: formData,
      });
      
      if (response.ok) {
        const result = await response.json();
        setUploadResults(result.tracks || []);
        alert(`Successfully uploaded ${result.tracks?.length || 0} tracks!`);
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
      setFiles([]);
      setUploadProgress({ loaded: 0, total: 0, current: '' });
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    if (i < 1) return bytes + ' Bytes';
    if (i < 2) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  if (!authState.isAuthenticated) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
        <div className="text-center">
          <UploadIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">File Upload</h2>
          <p className="text-gray-400 mb-6">Please log in to upload music files</p>
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
              <MusicIcon className="h-8 w-8 text-red-500" />
              <h1 className="text-2xl font-bold text-white">File Upload</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-400">Upload and manage your music content</span>
            </div>
          </div>
        </div>
      </div>

      {/* Upload Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
          <div className="mb-6">
            <div className="flex items-center justify-center w-full">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Select Music Files
              </label>
              <input
                type="file"
                multiple
                accept="audio/*,.mp3,.wav,.flac"
                onChange={handleFileSelect}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white file:mr-4 file:border-red-500 file:border-red-500 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                disabled={isUploading}
              />
            </div>
          </div>

          {/* Upload Button */}
          <div className="flex justify-center mt-6">
            <button
              onClick={handleUpload}
              disabled={isUploading || files.length === 0}
              className="bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {isUploading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-500"></div>
                  <span>Uploading... {uploadProgress.current}</span>
                </>
              ) : (
                <>
                  <UploadIcon className="h-5 w-5" />
                  <span>Upload Files</span>
                </>
              )}
            </button>
          </div>

          {/* Progress Bar */}
          {isUploading && (
            <div className="mt-6">
              <div className="bg-gray-800 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-red-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress.total > 0 ? (uploadProgress.loaded / uploadProgress.total) * 100 : 0}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-sm text-gray-400 mt-2">
                <span>{uploadProgress.current}</span>
                <span>{uploadProgress.loaded}/{uploadProgress.total}</span>
              </div>
            </div>
          )}

          {/* Upload Results */}
          {uploadResults.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-white mb-4">Upload Results</h3>
              <div className="space-y-4">
                {uploadResults.map((track, index) => (
                  <div key={track.id} className="bg-gray-800 rounded-lg p-4 border border-gray-800">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h4 className="text-white font-medium">{track.title}</h4>
                        <p className="text-gray-400 text-sm">by {track.artist} • {track.album}</p>
                      </div>
                      <div className="text-green-400 text-sm">
                        ✓ Uploaded Successfully
                      </div>
                    </div>
                    <div className="text-sm text-gray-400">
                      <span>Track {index + 1}</span> • {track.duration || 'N/A'} • {track.bitrate || 'N/A'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FileUpload;
