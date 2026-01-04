import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PlayIcon, DownloadIcon, CalendarIcon, TrendingUpIcon } from 'lucide-react';
import { apiService, Mixtape } from '../services/api';

const Mixtapes: React.FC = () => {
  const [mixtapes, setMixtapes] = useState<Mixtape[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('created_at');

  useEffect(() => {
    const fetchMixtapes = async () => {
      try {
        const params = {
          ordering: `-${sortBy}`,
          search: searchTerm,
        };
        const response = await apiService.getMixtapes(params);
        setMixtapes(response.data.results);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching mixtapes:', error);
        setLoading(false);
      }
    };

    fetchMixtapes();
  }, [searchTerm, sortBy]);

  const handleDownload = async (mixtapeSlug: string) => {
    try {
      await apiService.downloadMixtape(mixtapeSlug);
      // Update download count in UI
      setMixtapes(mixtapes.map(mixtape => 
        mixtape.slug === mixtapeSlug 
          ? { ...mixtape, download_count: mixtape.download_count + 1 }
          : mixtape
      ));
    } catch (error) {
      console.error('Error downloading mixtape:', error);
    }
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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-4 md:mb-0">Mixtapes</h1>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <input
            type="text"
            placeholder="Search mixtapes..."
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mixtapes.map((mixtape) => (
          <div key={mixtape.id} className="bg-gray-900 rounded-lg overflow-hidden hover:bg-gray-800 transition-all duration-300 group">
            {/* Mixtape Cover */}
            <div className="aspect-square bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center relative">
              <PlayIcon className="h-16 w-16 text-white opacity-50" />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                <DownloadIcon className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-all duration-300" />
              </div>
            </div>
            
            {/* Mixtape Info */}
            <div className="p-4">
              <h3 className="font-semibold text-white text-lg truncate mb-1">{mixtape.title}</h3>
              <p className="text-gray-400 truncate mb-2">{mixtape.artist.name}</p>
              
              {mixtape.description && (
                <p className="text-gray-500 text-sm mb-3 line-clamp-2">{mixtape.description}</p>
              )}
              
              <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                <div className="flex items-center space-x-3">
                  {mixtape.release_date && (
                    <div className="flex items-center">
                      <CalendarIcon className="h-3 w-3 mr-1" />
                      <span>{new Date(mixtape.release_date).getFullYear()}</span>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center">
                  <TrendingUpIcon className="h-3 w-3 mr-1" />
                  <span>{mixtape.download_count.toLocaleString()}</span>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <Link
                  to={`/artists/${mixtape.artist.slug}`}
                  className="flex-1 bg-gray-800 text-white px-3 py-2 rounded text-center hover:bg-gray-700 transition-colors text-sm"
                >
                  View Artist
                </Link>
                
                <button
                  onClick={() => handleDownload(mixtape.slug)}
                  className="flex-1 bg-red-600 text-white px-3 py-2 rounded hover:bg-red-700 transition-colors text-sm"
                >
                  Download
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {mixtapes.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-400 text-lg">No mixtapes found</p>
          <p className="text-gray-500 mt-2">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );
};

export default Mixtapes;
