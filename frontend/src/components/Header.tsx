import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  SearchIcon, 
  MenuIcon
} from 'lucide-react';
import { apiService, Artist, Album, Track, Mixtape, Compilation } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import Notifications from './Notifications';

interface HeaderProps {
  onToggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const { state } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{
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
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const searchContent = async () => {
      if (searchQuery.trim() === '') {
        setSearchResults({
          artists: [],
          albums: [],
          tracks: [],
          mixtapes: [],
          compilations: []
        });
        return;
      }

      setIsSearching(true);
      try {
        const [artistsRes, albumsRes, tracksRes, mixtapesRes, compilationsRes] = await Promise.all([
          apiService.getArtists({ search: searchQuery, page_size: 3 }),
          apiService.getAlbums({ search: searchQuery, page_size: 3 }),
          apiService.getTracks({ search: searchQuery, page_size: 5 }),
          apiService.getMixtapes({ search: searchQuery, page_size: 3 }),
          apiService.getCompilations({ search: searchQuery, page_size: 3 }),
        ]);

        setSearchResults({
          artists: artistsRes.data.results,
          albums: albumsRes.data.results,
          tracks: tracksRes.data.results,
          mixtapes: mixtapesRes.data.results,
          compilations: compilationsRes.data.results,
        });
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setIsSearching(false);
      }
    };

    const timeoutId = setTimeout(searchContent, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setShowResults(false);
    }
  };

  const hasResults = Object.values(searchResults).some(results => results.length > 0);

  return (
    <header className="bg-gray-900 border-b border-gray-800 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Mobile menu toggle */}
          <button
            onClick={onToggleSidebar}
            className="lg:hidden text-gray-400 hover:text-white p-2"
          >
            <MenuIcon className="h-6 w-6" />
          </button>

          {/* Search */}
          <div className="flex-1 max-w-xl mx-4" ref={searchRef}>
            <form onSubmit={handleSearch}>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search artists, albums, tracks..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowResults(true);
                  }}
                  onFocus={() => setShowResults(true)}
                  className="w-full bg-gray-800 text-white px-4 py-2 pr-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                />
                <button type="submit" className="absolute right-3 top-2.5">
                  <SearchIcon className="h-5 w-5 text-gray-400" />
                </button>
              </div>
            </form>

            {/* Search Results Dropdown */}
            {showResults && searchQuery && (
              <div className="absolute top-full mt-2 w-full bg-gray-800 border border-gray-700 rounded-lg shadow-xl max-h-96 overflow-y-auto">
                {isSearching ? (
                  <div className="p-4 text-center text-gray-400">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-600 mx-auto"></div>
                  </div>
                ) : hasResults ? (
                  <div className="py-2">
                    {/* Tracks */}
                    {searchResults.tracks.length > 0 && (
                      <div className="mb-2">
                        <div className="px-4 py-1 text-xs font-semibold text-gray-500 uppercase">Tracks</div>
                        {searchResults.tracks.map((track) => (
                          <Link
                            key={track.id}
                            to={`/tracks/${track.slug}`}
                            className="block px-4 py-2 hover:bg-gray-700 transition-colors"
                            onClick={() => setShowResults(false)}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="text-white text-sm">{track.title}</div>
                                <div className="text-gray-400 text-xs">{track.artist.name}</div>
                              </div>
                              {track.is_explicit && (
                                <span className="bg-red-600 text-white text-xs px-2 py-1 rounded">E</span>
                              )}
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}

                    {/* Artists */}
                    {searchResults.artists.length > 0 && (
                      <div className="mb-2">
                        <div className="px-4 py-1 text-xs font-semibold text-gray-500 uppercase">Artists</div>
                        {searchResults.artists.map((artist) => (
                          <Link
                            key={artist.id}
                            to={`/artists/${artist.slug}`}
                            className="block px-4 py-2 hover:bg-gray-700 transition-colors"
                            onClick={() => setShowResults(false)}
                          >
                            <div className="text-white text-sm">{artist.name}</div>
                          </Link>
                        ))}
                      </div>
                    )}

                    {/* Albums */}
                    {searchResults.albums.length > 0 && (
                      <div className="mb-2">
                        <div className="px-4 py-1 text-xs font-semibold text-gray-500 uppercase">Albums</div>
                        {searchResults.albums.map((album) => (
                          <Link
                            key={album.id}
                            to={`/albums/${album.slug}`}
                            className="block px-4 py-2 hover:bg-gray-700 transition-colors"
                            onClick={() => setShowResults(false)}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="text-white text-sm">{album.title}</div>
                                <div className="text-gray-400 text-xs">{album.artist.name}</div>
                              </div>
                              {album.is_explicit && (
                                <span className="bg-red-600 text-white text-xs px-2 py-1 rounded">E</span>
                              )}
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}

                    {/* Mixtapes */}
                    {searchResults.mixtapes.length > 0 && (
                      <div className="mb-2">
                        <div className="px-4 py-1 text-xs font-semibold text-gray-500 uppercase">Mixtapes</div>
                        {searchResults.mixtapes.map((mixtape) => (
                          <Link
                            key={mixtape.id}
                            to={`/mixtapes/${mixtape.slug}`}
                            className="block px-4 py-2 hover:bg-gray-700 transition-colors"
                            onClick={() => setShowResults(false)}
                          >
                            <div className="text-white text-sm">{mixtape.title}</div>
                            <div className="text-gray-400 text-xs">{mixtape.artist.name}</div>
                          </Link>
                        ))}
                      </div>
                    )}

                    {/* Compilations */}
                    {searchResults.compilations.length > 0 && (
                      <div className="mb-2">
                        <div className="px-4 py-1 text-xs font-semibold text-gray-500 uppercase">Compilations</div>
                        {searchResults.compilations.map((compilation) => (
                          <Link
                            key={compilation.id}
                            to={`/compilations/${compilation.slug}`}
                            className="block px-4 py-2 hover:bg-gray-700 transition-colors"
                            onClick={() => setShowResults(false)}
                          >
                            <div className="text-white text-sm">{compilation.title}</div>
                            <div className="text-gray-400 text-xs">{compilation.subtitle} • Compilation</div>
                          </Link>
                        ))}
                      </div>
                    )}

                    {/* View All Results */}
                    <div className="border-t border-gray-700 px-4 py-2">
                      <button
                        onClick={handleSearch}
                        className="text-red-500 hover:text-red-400 text-sm font-medium w-full text-left"
                      >
                        View all results for "{searchQuery}"
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 text-center text-gray-400">
                    No results found for "{searchQuery}"
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Notifications */}
          {state.isAuthenticated && <Notifications />}

          {/* Spacer for balance */}
          <div className="w-12 lg:hidden"></div>
        </div>
      </div>
    </header>
  );
};

export default Header;
