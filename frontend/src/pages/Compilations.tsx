import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PlayIcon, DownloadIcon, CalendarIcon, TrendingUpIcon, AwardIcon, MusicIcon } from 'lucide-react';
import { apiService, Compilation } from '../services/api';

const Compilations: React.FC = () => {
  const [compilations, setCompilations] = useState<Compilation[]>([]);
  const [bestOfMonth, setBestOfMonth] = useState<Compilation[]>([]);
  const [topHits, setTopHits] = useState<Compilation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [filter, setFilter] = useState<'all' | 'best_of_month' | 'top_hits'>('all');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const params: any = {
          ordering: `-${sortBy}`,
          search: searchTerm,
        };

        if (filter === 'best_of_month') {
          params.is_best_of_month = true;
        } else if (filter === 'top_hits') {
          params.is_top_hits = true;
        }

        const [compilationsRes, bestOfMonthRes, topHitsRes] = await Promise.all([
          apiService.getCompilations(params),
          apiService.getBestOfMonth(),
          apiService.getTopHits(),
        ]);

        setCompilations(compilationsRes.data.results);
        setBestOfMonth(bestOfMonthRes.data);
        setTopHits(topHitsRes.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching compilations:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, [searchTerm, sortBy, filter]);

  const handleDownload = async (compilationSlug: string) => {
    try {
      await apiService.downloadCompilation(compilationSlug);
      // Update download count in UI
      setCompilations(compilations.map(compilation => 
        compilation.slug === compilationSlug 
          ? { ...compilation, download_count: compilation.download_count + 1 }
          : compilation
      ));
    } catch (error) {
      console.error('Error downloading compilation:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  const displayCompilations = filter === 'best_of_month' ? bestOfMonth : 
                           filter === 'top_hits' ? topHits : 
                           compilations;

  return (
    <div>
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold text-white">Compilations</h1>
        
        <div className="flex flex-wrap gap-4 w-full lg:w-auto">
          <input
            type="text"
            placeholder="Search compilations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 flex-1 lg:flex-initial"
          />
          
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as 'all' | 'best_of_month' | 'top_hits')}
            className="px-4 py-2 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
          >
            <option value="all">All</option>
            <option value="best_of_month">Best of Month</option>
            <option value="top_hits">Top Hits</option>
          </select>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
          >
            <option value="created_at">Latest</option>
            <option value="download_count">Most Downloaded</option>
            <option value="title">Title</option>
            <option value="year">Year</option>
          </select>
        </div>
      </div>

      {/* Featured Sections */}
      {filter === 'all' && (
        <div className="space-y-12 mb-12">
          {/* Best of Month */}
          {bestOfMonth.length > 0 && (
            <section>
              <div className="flex items-center mb-6">
                <AwardIcon className="h-6 w-6 text-yellow-500 mr-2" />
                <h2 className="text-2xl font-bold text-white">Best of Month</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {bestOfMonth.slice(0, 3).map((compilation) => (
                  <Link key={compilation.id} to={`/compilations/${compilation.slug}`} className="group">
                    <div className="bg-gradient-to-r from-yellow-600 to-orange-600 rounded-lg p-6 hover:from-yellow-700 hover:to-orange-700 transition-all duration-300">
                      <div className="flex items-center justify-between mb-4">
                        <AwardIcon className="h-8 w-8 text-white" />
                        <span className="bg-white bg-opacity-20 text-white text-xs px-2 py-1 rounded">
                          {compilation.month && new Date(compilation.month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                        </span>
                      </div>
                      <h3 className="font-bold text-white text-lg mb-2">{compilation.title}</h3>
                      <p className="text-yellow-100 text-sm mb-3">{compilation.subtitle}</p>
                      <div className="flex items-center justify-between text-white text-sm">
                        <span>{compilation.tracks_count} tracks</span>
                        <span>{compilation.download_count.toLocaleString()} downloads</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Top Hits */}
          {topHits.length > 0 && (
            <section>
              <div className="flex items-center mb-6">
                <TrendingUpIcon className="h-6 w-6 text-green-500 mr-2" />
                <h2 className="text-2xl font-bold text-white">Top Hits</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {topHits.slice(0, 3).map((compilation) => (
                  <Link key={compilation.id} to={`/compilations/${compilation.slug}`} className="group">
                    <div className="bg-gradient-to-r from-green-600 to-teal-600 rounded-lg p-6 hover:from-green-700 hover:to-teal-700 transition-all duration-300">
                      <div className="flex items-center justify-between mb-4">
                        <TrendingUpIcon className="h-8 w-8 text-white" />
                        <span className="bg-white bg-opacity-20 text-white text-xs px-2 py-1 rounded">
                          {compilation.year}
                        </span>
                      </div>
                      <h3 className="font-bold text-white text-lg mb-2">{compilation.title}</h3>
                      <p className="text-green-100 text-sm mb-3">{compilation.subtitle}</p>
                      <div className="flex items-center justify-between text-white text-sm">
                        <span>{compilation.tracks_count} tracks</span>
                        <span>{compilation.download_count.toLocaleString()} downloads</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      {/* All Compilations */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayCompilations.map((compilation) => (
          <div key={compilation.id} className="bg-gray-900 rounded-lg overflow-hidden hover:bg-gray-800 transition-all duration-300 group">
            {/* Compilation Cover */}
            <div className="aspect-square bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center relative">
              {compilation.is_best_of_month ? (
                <AwardIcon className="h-16 w-16 text-white opacity-50" />
              ) : compilation.is_top_hits ? (
                <TrendingUpIcon className="h-16 w-16 text-white opacity-50" />
              ) : (
                <MusicIcon className="h-16 w-16 text-white opacity-50" />
              )}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                <DownloadIcon className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-all duration-300" />
              </div>
              
              {/* Badges */}
              <div className="absolute top-2 right-2 flex flex-col space-y-1">
                {compilation.is_best_of_month && (
                  <span className="bg-yellow-600 text-white text-xs px-2 py-1 rounded">Best of Month</span>
                )}
                {compilation.is_top_hits && (
                  <span className="bg-green-600 text-white text-xs px-2 py-1 rounded">Top Hits</span>
                )}
              </div>
            </div>
            
            {/* Compilation Info */}
            <div className="p-4">
              <h3 className="font-semibold text-white text-lg truncate mb-1">{compilation.title}</h3>
              {compilation.subtitle && (
                <p className="text-gray-400 truncate mb-2">{compilation.subtitle}</p>
              )}
              
              {compilation.description && (
                <p className="text-gray-500 text-sm mb-3 line-clamp-2">{compilation.description}</p>
              )}
              
              <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                <div className="flex items-center space-x-3">
                  <span>{compilation.tracks_count} tracks</span>
                  {compilation.year && (
                    <span>• {compilation.year}</span>
                  )}
                </div>
                
                <div className="flex items-center">
                  <TrendingUpIcon className="h-3 w-3 mr-1" />
                  <span>{compilation.download_count.toLocaleString()}</span>
                </div>
              </div>
              
              <button
                onClick={() => handleDownload(compilation.slug)}
                className="w-full bg-red-600 text-white px-3 py-2 rounded hover:bg-red-700 transition-colors text-sm"
              >
                Download Compilation
              </button>
            </div>
          </div>
        ))}
      </div>

      {displayCompilations.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-400 text-lg">No compilations found</p>
          <p className="text-gray-500 mt-2">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );
};

export default Compilations;
