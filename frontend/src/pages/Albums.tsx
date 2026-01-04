import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PlayIcon, DownloadIcon, CalendarIcon } from 'lucide-react';
import { apiService, Album } from '../services/api';

const Albums: React.FC = () => {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('created_at');

  useEffect(() => {
    const fetchAlbums = async () => {
      try {
        const params = {
          ordering: `-${sortBy}`,
          search: searchTerm,
        };
        const response = await apiService.getAlbums(params);
        setAlbums(response.data.results);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching albums:', error);
        setLoading(false);
      }
    };

    fetchAlbums();
  }, [searchTerm, sortBy]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-4 md:mb-0">Albums</h1>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <input
            type="text"
            placeholder="Search albums..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
          />
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
          >
            <option value="created_at">Latest</option>
            <option value="download_count">Most Downloaded</option>
            <option value="title">Title</option>
            <option value="release_date">Release Date</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {albums.map((album) => (
          <Link key={album.id} to={`/albums/${album.slug}`} className="group">
            <div className="bg-gray-900 rounded-lg overflow-hidden hover:bg-gray-800 transition-all duration-300 hover:scale-105">
              {/* Album Cover */}
              <div className="aspect-square bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center relative">
                <PlayIcon className="h-16 w-16 text-white opacity-50" />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                  <DownloadIcon className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-all duration-300" />
                </div>
                {album.is_explicit && (
                  <div className="absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-1 rounded">
                    E
                  </div>
                )}
              </div>
              
              {/* Album Info */}
              <div className="p-4">
                <h3 className="font-semibold text-white text-lg truncate mb-1">{album.title}</h3>
                <p className="text-gray-400 truncate mb-2">{album.artist.name}</p>
                
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center space-x-3">
                    <span>{album.tracks_count} tracks</span>
                    <span>•</span>
                    <span>{album.bitrate}</span>
                  </div>
                  
                  {album.release_date && (
                    <div className="flex items-center">
                      <CalendarIcon className="h-3 w-3 mr-1" />
                      <span>{new Date(album.release_date).getFullYear()}</span>
                    </div>
                  )}
                </div>
                
                {album.download_count > 0 && (
                  <div className="mt-2 text-xs text-gray-500">
                    {album.download_count.toLocaleString()} downloads
                  </div>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {albums.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-400 text-lg">No albums found</p>
          <p className="text-gray-500 mt-2">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );
};

export default Albums;
