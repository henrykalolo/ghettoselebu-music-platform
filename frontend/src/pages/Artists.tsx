import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiService, Artist } from '../services/api';

const Artists: React.FC = () => {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiService.getArtists().then(response => {
      setArtists(response.data.results);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
    </div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-8">Artists</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {artists.map((artist) => (
          <Link key={artist.id} to={`/artists/${artist.slug}`} className="group">
            <div className="bg-gray-900 rounded-lg p-6 hover:bg-gray-800 transition">
              <div className="flex items-center space-x-4">
                <div className="bg-gradient-to-br from-red-600 to-red-800 p-4 rounded-full">
                  <span className="text-2xl font-bold text-white">
                    {artist.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold text-white text-lg">{artist.name}</h3>
                  <p className="text-gray-400">{artist.bio}</p>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Artists;
