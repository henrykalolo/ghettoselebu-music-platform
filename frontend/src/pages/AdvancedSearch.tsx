import React, { useState, useEffect } from 'react';
import { 
  SearchIcon, 
  FilterIcon, 
  XIcon, 
  SlidersHorizontalIcon,
  MusicIcon,
  ClockIcon,
  TrendingUpIcon,
  CalendarIcon,
  UserIcon,
  StarIcon,
  DownloadIcon
} from 'lucide-react';
import { apiService, Track, Album, Artist, Genre } from '../services/api';

interface SearchFilters {
  query: string;
  genre: string;
  artist: string;
  album: string;
  year: string;
  duration: string;
  explicit: boolean;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

interface SearchResult {
  id: number;
  type: 'track' | 'album' | 'artist';
  title: string;
  artist?: string | Artist;
  album?: string | Album;
  genre?: string;
  duration?: string;
  explicit?: boolean;
  downloads?: number;
  release_date?: string;
}

const AdvancedSearch: React.FC = () => {
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    genre: '',
    artist: '',
    album: '',
    year: '',
    duration: '',
    explicit: false,
    sortBy: 'relevance',
    sortOrder: 'desc'
  });
  
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  useEffect(() => {
    fetchGenres();
  }, []);

  useEffect(() => {
    if (filters.query.length > 2) {
      fetchSuggestions();
    } else {
      setSuggestions([]);
    }
  }, [filters.query]);

  const fetchGenres = async () => {
    try {
      const response = await apiService.getGenres();
      setGenres(response.data.results || []);
    } catch (error) {
      console.error('Error fetching genres:', error);
    }
  };

  const fetchSuggestions = async () => {
    try {
      // Mock suggestions - in real app, fetch from API
      const mockSuggestions = [
        'Summer Vibes 2024',
        'Night Drive',
        'Urban Dreams',
        'Chill Beats',
        'Midnight Jazz',
        'Electronic Paradise'
      ];
      setSuggestions(mockSuggestions.slice(0, 5));
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    }
  };

  const handleSearch = async () => {
    if (!filters.query.trim()) return;
    
    setLoading(true);
    try {
      // In a real app, you would make API calls
      const mockResults: SearchResult[] = [
        {
          id: 1,
          type: 'track',
          title: filters.query,
          artist: 'DJ Cool Beats',
          genre: 'Hip-Hop',
          duration: '3:45',
          explicit: false,
          downloads: 1234
        },
        {
          id: 2,
          type: 'album',
          title: `${filters.query} Album`,
          artist: 'Various Artists',
          genre: 'Electronic',
          release_date: '2024-01-15',
          downloads: 567
        },
        {
          id: 3,
          type: 'artist',
          title: filters.query,
          genre: 'Hip-Hop',
          downloads: 2345
        }
      ];
      
      setResults(mockResults);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: keyof SearchFilters, value: string | boolean) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      query: '',
      genre: '',
      artist: '',
      album: '',
      year: '',
      duration: '',
      explicit: false,
      sortBy: 'relevance',
      sortOrder: 'desc'
    });
    setResults([]);
  };

  const applyFilters = () => {
    setShowFilters(false);
    handleSearch();
  };

  const formatDuration = (duration: string) => {
    if (!duration) return '';
    const [minutes, seconds] = duration.split(':').map(Number);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getTrendIcon = (downloads?: number) => {
    if (!downloads) return null;
    return <TrendingUpIcon className="h-4 w-4 text-green-400" />;
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'track':
        return <MusicIcon className="h-4 w-4 text-red-500" />;
      case 'album':
        return <div className="w-4 h-4 bg-purple-600 rounded flex items-center justify-center">
          <div className="text-white text-xs font-bold">ALB</div>
        </div>;
      case 'artist':
        return <UserIcon className="h-4 w-4 text-blue-500" />;
      default:
        return <MusicIcon className="h-4 w-4 text-gray-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center">
            <SearchIcon className="h-8 w-8 text-red-500" />
            <h1 className="text-2xl font-bold text-white">Advanced Search</h1>
          </div>
        </div>
      </div>

      {/* Search Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <input
                type="text"
                value={filters.query}
                onChange={(e) => handleFilterChange('query', e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Search for tracks, albums, artists..."
                className="w-full px-4 py-3 pr-12 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <button
                onClick={handleSearch}
                className="absolute right-3 top-3 bg-red-600 text-white px-4 py-3 rounded-lg hover:bg-red-700 transition-colors"
              >
                <SearchIcon className="h-5 w-5" />
              </button>
            </div>

            {/* Suggestions */}
            {suggestions.length > 0 && (
              <div className="absolute right-16 top-12 w-64 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-10">
                <div className="py-2">
                  <div className="text-xs text-gray-500 mb-2">Suggestions</div>
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleFilterChange('query', suggestion)}
                      className="block w-full text-left px-3 py-2 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Filter Toggle */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
            >
              <FilterIcon className="h-5 w-5" />
              <span>{showFilters ? 'Hide Filters' : 'Show Filters'}</span>
              <SlidersHorizontalIcon className="h-5 w-5" />
            </button>
            {filters.query && (
              <button
                onClick={clearFilters}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <XIcon className="h-5 w-5" />
                Clear
              </button>
            )}
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4">Advanced Filters</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Genre Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Genre</label>
                  <select
                    value={filters.genre}
                    onChange={(e) => handleFilterChange('genre', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="">All Genres</option>
                    {genres.map(genre => (
                      <option key={genre.id} value={genre.name}>{genre.name}</option>
                    ))}
                  </select>
                </div>

                {/* Artist Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Artist</label>
                  <input
                    type="text"
                    value={filters.artist}
                    onChange={(e) => handleFilterChange('artist', e.target.value)}
                    placeholder="Artist name..."
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                {/* Album Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Album</label>
                  <input
                    type="text"
                    value={filters.album}
                    onChange={(e) => handleFilterChange('album', e.target.value)}
                    placeholder="Album title..."
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                {/* Year Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Year</label>
                  <input
                    type="text"
                    value={filters.year}
                    onChange={(e) => handleFilterChange('year', e.target.value)}
                    placeholder="Release year..."
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                {/* Duration Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Duration</label>
                  <select
                    value={filters.duration}
                    onChange={(e) => handleFilterChange('duration', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="">Any Duration</option>
                    <option value="0:2">Under 2 min</option>
                    <option value="2:3">2-3 min</option>
                    <option value="3:5">3-5 min</option>
                    <option value="5:10">5-10 min</option>
                    <option value="10:">Over 10 min</option>
                  </select>
                </div>

                {/* Explicit Filter */}
                <div>
                  <label className="flex items-center space-x-2 text-sm font-medium text-gray-300 mb-2">
                    <input
                      type="checkbox"
                      checked={filters.explicit}
                      onChange={(e) => handleFilterChange('explicit', e.target.checked)}
                      className="h-4 w-4 text-red-600 bg-gray-700 border-gray-600 rounded focus:ring-2 focus:ring-red-500"
                    />
                    <span>Explicit Content Only</span>
                  </label>
                </div>

                {/* Sort Options */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Sort By</label>
                  <select
                    value={filters.sortBy}
                    onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="relevance">Relevance</option>
                    <option value="title">Title</option>
                    <option value="artist">Artist</option>
                    <option value="release_date">Release Date</option>
                    <option value="downloads">Downloads</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Order</label>
                  <select
                    value={filters.sortOrder}
                    onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="desc">Descending</option>
                    <option value="asc">Ascending</option>
                  </select>
                </div>
              </div>

              {/* Apply Filters Button */}
              <div className="md:col-span-2 mt-4">
                <button
                  onClick={applyFilters}
                  className="w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
          </div>
        )}

        {/* Search Results */}
        {results.length > 0 && (
          <div className="mt-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Search Results ({results.length})</h2>
              <div className="text-gray-400">
                {filters.query && `for "${filters.query}"`}
                {filters.genre && ` in ${filters.genre}`}
                {filters.artist && ` by ${filters.artist}`}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {results.map((result) => (
                <div key={result.id} className="bg-gray-900 rounded-lg p-4 border border-gray-800 hover:bg-gray-800 transition-colors">
                  <div className="flex items-start space-x-3">
                    <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center">
                      {getTypeIcon(result.type)}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white mb-1">{result.title}</h3>
                      <div className="text-sm text-gray-400 space-y-1">
                        {result.artist && <p>by {typeof result.artist === 'string' ? result.artist : result.artist.name}</p>}
                        {result.album && <p>from {typeof result.album === 'string' ? result.album : result.album.title}</p>}
                        {result.genre && <p>Genre: {result.genre}</p>}
                        {result.duration && <p>Duration: {formatDuration(result.duration)}</p>}
                        {result.explicit && <p className="text-red-400">Explicit Content</p>}
                        {result.release_date && (
                          <div className="flex items-center space-x-1">
                            <CalendarIcon className="h-4 w-4 text-gray-400" />
                            <span>{new Date(result.release_date).toLocaleDateString()}</span>
                          </div>
                        )}
                        {result.downloads && (
                          <div className="flex items-center space-x-1">
                            <DownloadIcon className="h-4 w-4 text-gray-400" />
                            <span>{result.downloads.toLocaleString()} downloads</span>
                            {getTrendIcon(result.downloads)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdvancedSearch;
