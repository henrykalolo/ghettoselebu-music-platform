import React from 'react';
import Feed from '../components/Feed';

const FeedPage: React.FC = () => {
  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-8">Social Feed</h1>
        <Feed />
      </div>
    </div>
  );
};

export default FeedPage;
