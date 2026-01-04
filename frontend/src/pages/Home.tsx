import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PlayIcon, DownloadIcon, TrendingUpIcon } from 'lucide-react';
import { apiService, Track, Album, Artist, Compilation } from '../services/api';

const Home: React.FC = () => {
  const [latestTracks, setLatestTracks] = useState<Track[]>([]);
  const [latestAlbums, setLatestAlbums] = useState<Album[]>([]);
  const [topArtists, setTopArtists] = useState<Artist[]>([]);
  const [bestOfMonth, setBestOfMonth] = useState<Compilation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tracksRes, albumsRes, artistsRes, compilationsRes] = await Promise.all([
          apiService.getLatestTracks(),
          apiService.getLatestAlbums(),
          apiService.getArtists({ ordering: '-created_at', page_size: 6 }),
          apiService.getBestOfMonth()
        ]);

        setLatestTracks(tracksRes.data);
        setLatestAlbums(albumsRes.data);
        setTopArtists(artistsRes.data.results);
        setBestOfMonth(compilationsRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-red-600 to-red-800 rounded-2xl p-8 md:p-12">
        <div className="relative z-10">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            Ghettoselebu
          </h1>
          <p className="text-xl text-red-100 mb-8 max-w-2xl">
            High-Quality Music Downloads at Your Fingertips. Discover the latest tracks, top 100 hits, mixtapes, and exclusive albums.
          </p>
          <div className="flex space-x-4">
            <Link
              to="/tracks"
              className="bg-white text-red-600 px-6 py-3 rounded-lg font-semibold hover:bg-red-50 transition"
            >
              Browse Tracks
            </Link>
            <Link
              to="/albums"
              className="bg-red-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-800 transition"
            >
              Browse Albums
            </Link>
          </div>
        </div>
      </section>

      {/* Latest Tracks */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Latest Tracks</h2>
          <Link to="/tracks" className="text-red-500 hover:text-red-400">
            View All →
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {latestTracks.slice(0, 6).map((track) => (
            <div key={track.id} className="bg-gray-900 rounded-lg p-4 hover:bg-gray-800 transition">
              <div className="flex items-center space-x-4">
                <div className="bg-red-600 p-3 rounded-lg">
                  <PlayIcon className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-white">{track.title}</h3>
                  <p className="text-gray-400">{track.artist.name}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-xs text-gray-500">{track.bitrate}</span>
                    {track.is_explicit && (
                      <span className="text-xs bg-red-600 text-white px-2 py-1 rounded">E</span>
                    )}
                  </div>
                </div>
                <button className="text-gray-400 hover:text-white">
                  <DownloadIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Latest Albums */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Latest Albums</h2>
          <Link to="/albums" className="text-red-500 hover:text-red-400">
            View All →
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {latestAlbums.slice(0, 8).map((album) => (
            <Link key={album.id} to={`/albums/${album.slug}`} className="group">
              <div className="bg-gray-900 rounded-lg overflow-hidden hover:bg-gray-800 transition">
                <div className="aspect-square bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center">
                  <PlayIcon className="h-12 w-12 text-white opacity-50" />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-white truncate">{album.title}</h3>
                  <p className="text-gray-400 truncate">{album.artist.name}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-gray-500">{album.tracks_count} tracks</span>
                    {album.is_explicit && (
                      <span className="text-xs bg-red-600 text-white px-2 py-1 rounded">E</span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Top Artists */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Top Artists</h2>
          <Link to="/artists" className="text-red-500 hover:text-red-400">
            View All →
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {topArtists.map((artist) => (
            <Link key={artist.id} to={`/artists/${artist.slug}`} className="group">
              <div className="text-center">
                <div className="aspect-square bg-gradient-to-br from-red-600 to-red-800 rounded-full flex items-center justify-center mb-2 group-hover:scale-105 transition">
                  <span className="text-2xl font-bold text-white">
                    {artist.name.charAt(0)}
                  </span>
                </div>
                <p className="text-sm text-white truncate">{artist.name}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Best of Month */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center">
            <TrendingUpIcon className="h-6 w-6 mr-2 text-red-500" />
            Best of Month
          </h2>
          <Link to="/compilations" className="text-red-500 hover:text-red-400">
            View All →
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {bestOfMonth.slice(0, 4).map((compilation) => (
            <Link key={compilation.id} to={`/compilations/${compilation.slug}`} className="group">
              <div className="bg-gray-900 rounded-lg p-6 hover:bg-gray-800 transition">
                <div className="flex items-center space-x-4">
                  <div className="bg-gradient-to-br from-red-600 to-red-800 p-4 rounded-lg">
                    <TrendingUpIcon className="h-8 w-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-white text-lg">{compilation.title}</h3>
                    <p className="text-gray-400">{compilation.subtitle}</p>
                    <p className="text-sm text-gray-500 mt-1">{compilation.tracks_count} tracks</p>
                  </div>
                  <div className="text-red-500">
                    <TrendingUpIcon className="h-6 w-6" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
