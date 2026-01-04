import React from 'react';
import Featured from '../components/Featured';

const FeaturedPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Featured />
      </div>
    </div>
  );
};

export default FeaturedPage;
