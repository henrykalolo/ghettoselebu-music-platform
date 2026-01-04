import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { PlayIcon, DownloadIcon, CalendarIcon, TrendingUpIcon, MusicIcon } from 'lucide-react';
import { apiService, Artist, Album, Track, Mixtape, Compilation } from '../services/api';

const SearchResults: React.FC = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  
  const [results, setResults] = useState<{
    artists: Artist[];
    albums: Album[];
    tracks: Track[];
    mixtapes: Mixtape[];
    compilations: Compilation[];
  }>({
    artists: [],
    albums: [],
    tracks: [],
    mixtapes: [],
    compilations: []
  });
  
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'tracks' | 'albums' | 'artists' | 'mixtapes' | 'compilations'>('all');

  useEffect(() => {
    const searchAllContent = async () => {
      if (!query.trim()) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const [artistsRes, albumsRes, tracksRes, mixtapesRes, compilationsRes] = await Promise.all([
          apiService.getArtists({ search: query, page_size: 20 }),
          apiService.getAlbums({ search: query, page_size: 20 }),
          apiService.getTracks({ search: query, page_size: 20 }),
          apiService.getMixtapes({ search: query, page_size: 20 }),
          apiService.getCompilations({ search: query, page_size: 20 }),
        ]);

        setResults({
          artists: artistsRes.data.results,
          albums: albumsRes.data.results,
          tracks: tracksRes.data.results,
          mixtapes: mixtapesRes.data.results,
          compilations: compilationsRes.data.results,
        });
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setLoading(false);
      }
    };

    searchAllContent();
  }, [query]);

  const totalResults = Object.values(results).reduce((sum, items) => sum + items.length, 0);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  const tabs = [
    { id: 'all' as const, label: 'All', count: totalResults },
    { id: 'tracks' as const, label: 'Tracks', count: results.tracks.length },
    { id: 'albums' as const, label: 'Albums', count: results.albums.length },
    { id: 'artists' as const, label: 'Artists', count: results.artists.length },
    { id: 'mixtapes' as const, label: 'Mixtapes', count: results.mixtapes.length },
    { id: 'compilations' as const, label: 'Compilations', count: results.compilations.length },
  ];

  const renderTracks = () => (
    <div className="space-y-4">
      {results.tracks.map((track, index) => (
        <div key={track.id} className="bg-gray-900 rounded-lg p-4 hover:bg-gray-800 transition-all duration-300">
          <div className="flex items-center space-x-4">
            <div className="text-gray-500 font-medium w-8 text-center">{index + 1}</div>
            <button className="bg-red-600 p-3 rounded-lg hover:bg-red-700 transition-colors">
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
                <Link to={`/artists/${track.artist.slug}`} className="hover:text-white transition-colors">
                  {track.artist.name}
                </Link>
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
            <button className="text-gray-400 hover:text-white transition-colors p-2">
              <DownloadIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );

  const renderAlbums = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {results.albums.map((album) => (
        <Link key={album.id} to={`/albums/${album.slug}`} className="group">
          <div className="bg-gray-900 rounded-lg overflow-hidden hover:bg-gray-800 transition-all duration-300 hover:scale-105">
            <div className="aspect-square bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center relative">
              <PlayIcon className="h-16 w-16 text-white opacity-50" />
              {album.is_explicit && (
                <div className="absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-1 rounded">
                  E
                </div>
              )}
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-white text-lg truncate mb-1">{album.title}</h3>
              <p className="text-gray-400 truncate mb-2">{album.artist.name}</p>
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>{album.tracks_count} tracks</span>
                <span>{album.bitrate}</span>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );

  const renderArtists = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {results.artists.map((artist) => (
        <Link key={artist.id} to={`/artists/${artist.slug}`} className="group">
          <div className="bg-gray-900 rounded-lg p-6 hover:bg-gray-800 transition-all duration-300">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-br from-red-600 to-red-800 p-4 rounded-full">
                <span className="text-2xl font-bold text-white">{artist.name.charAt(0)}</span>
              </div>
              <div>
                <h3 className="font-semibold text-white text-lg">{artist.name}</h3>
                <p className="text-gray-400 text-sm">{artist.bio}</p>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );

  const renderMixtapes = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {results.mixtapes.map((mixtape) => (
        <div key={mixtape.id} className="bg-gray-900 rounded-lg overflow-hidden hover:bg-gray-800 transition-all duration-300">
          <div className="aspect-square bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
            <PlayIcon className="h-16 w-16 text-white opacity-50" />
          </div>
          <div className="p-4">
            <h3 className="font-semibold text-white text-lg truncate mb-1">{mixtape.title}</h3>
            <p className="text-gray-400 truncate mb-2">{mixtape.artist.name}</p>
            <button className="w-full bg-red-600 text-white px-3 py-2 rounded hover:bg-red-700 transition-colors text-sm">
              Download
            </button>
          </div>
        </div>
      ))}
    </div>
  );

  const renderCompilations = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {results.compilations.map((compilation) => (
        <div key={compilation.id} className="bg-gray-900 rounded-lg overflow-hidden hover:bg-gray-800 transition-all duration-300">
          <div className="aspect-square bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
            <MusicIcon className="h-16 w-16 text-white opacity-50" />
          </div>
          <div className="p-4">
            <h3 className="font-semibold text-white text-lg truncate mb-1">{compilation.title}</h3>
            <p className="text-gray-400 truncate mb-2">{compilation.subtitle}</p>
            <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
              <span>{compilation.tracks_count} tracks</span>
              {compilation.year && <span>{compilation.year}</span>}
            </div>
            <button className="w-full bg-red-600 text-white px-3 py-2 rounded hover:bg-red-700 transition-colors text-sm">
              Download
            </button>
          </div>
        </div>
      ))}
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'tracks': return renderTracks();
      case 'albums': return renderAlbums();
      case 'artists': return renderArtists();
      case 'mixtapes': return renderMixtapes();
      case 'compilations': return renderCompilations();
      default:
        return (
          <div className="space-y-12">
            {results.tracks.length > 0 && (
              <section>
                <h2 className="text-xl font-bold text-white mb-4">Tracks</h2>
                {renderTracks()}
              </section>
            )}
            {results.albums.length > 0 && (
              <section>
                <h2 className="text-xl font-bold text-white mb-4">Albums</h2>
                {renderAlbums()}
              </section>
            )}
            {results.artists.length > 0 && (
              <section>
                <h2 className="text-xl font-bold text-white mb-4">Artists</h2>
                {renderArtists()}
              </section>
            )}
            {results.mixtapes.length > 0 && (
              <section>
                <h2 className="text-xl font-bold text-white mb-4">Mixtapes</h2>
                {renderMixtapes()}
              </section>
            )}
            {results.compilations.length > 0 && (
              <section>
                <h2 className="text-xl font-bold text-white mb-4">Compilations</h2>
                {renderCompilations()}
              </section>
            )}
          </div>
        );
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Search Results</h1>
        <p className="text-gray-400">
          {totalResults} results found for "{query}"
        </p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-8 border-b border-gray-800">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
              activeTab === tab.id
                ? 'text-red-500 border-red-500'
                : 'text-gray-400 border-transparent hover:text-white'
            }`}
          >
            {tab.label} {tab.count > 0 && `(${tab.count})`}
          </button>
        ))}
      </div>

      {/* Content */}
      {totalResults === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-400 text-lg">No results found for "{query}"</p>
          <p className="text-gray-500 mt-2">Try different keywords or check your spelling</p>
        </div>
      ) : (
        renderContent()
      )}
    </div>
  );
};

export default SearchResults;
