import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import AudioPlayer from './components/AudioPlayer';
import { PlayerProvider, usePlayer } from './contexts/PlayerContext';
import { AuthProvider } from './contexts/AuthContext';
import Home from './pages/Home';
import Artists from './pages/Artists';
import Albums from './pages/Albums';
import Tracks from './pages/Tracks';
import Mixtapes from './pages/Mixtapes';
import Compilations from './pages/Compilations';
import ArtistDetail from './pages/ArtistDetail';
import AlbumDetail from './pages/AlbumDetail';
import TrackDetail from './pages/TrackDetail';
import SearchResults from './pages/SearchResults';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Playlists from './pages/Playlists';
import FileUpload from './pages/FileUpload';
import Dashboard from './pages/Dashboard';
import AdvancedSearch from './pages/AdvancedSearch';
import Notifications from './pages/Notifications';
import AdminUserManagement from './pages/AdminUserManagement';
import AnalyticsAndReporting from './pages/AnalyticsAndReporting';
import FeedPage from './pages/FeedPage';
import Trending from './pages/Trending';
import UserProfiles from './components/UserProfiles';
import FeaturedPage from './pages/Featured';
import UserSettings from './pages/UserSettings';
import MusicUpload from './pages/MusicUpload';
import './App.css';

const AppContent: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { state, playPause, nextTrack, previousTrack } = usePlayer();

  const handleTrackEnd = () => {
    if (state.repeat === 'one') {
      // Replay the same track
      const audio = document.querySelector('audio');
      if (audio) {
        audio.currentTime = 0;
        audio.play();
      }
    } else if (state.repeat === 'all' || state.queue.length > 1) {
      nextTrack();
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="min-h-screen bg-black text-white flex">
      <Sidebar isOpen={isSidebarOpen} onToggle={toggleSidebar} />
      
      <div className="flex-1 flex flex-col lg:ml-0">
        <Header onToggleSidebar={toggleSidebar} />
        
        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/artists" element={<Artists />} />
            <Route path="/artists/:slug" element={<ArtistDetail />} />
            <Route path="/artists/:id/profile" element={<UserProfiles userId={parseInt(':id')} />} />
            <Route path="/albums" element={<Albums />} />
            <Route path="/albums/:slug" element={<AlbumDetail />} />
            <Route path="/tracks" element={<Tracks />} />
            <Route path="/tracks/:slug" element={<TrackDetail />} />
            <Route path="/mixtapes" element={<Mixtapes />} />
            <Route path="/compilations" element={<Compilations />} />
            <Route path="/search" element={<SearchResults />} />
            <Route path="/advanced-search" element={<AdvancedSearch />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/admin-users" element={<AdminUserManagement />} />
            <Route path="/analytics" element={<AnalyticsAndReporting />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/playlists" element={<Playlists />} />
            <Route path="/upload" element={<FileUpload />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/feed" element={<FeedPage />} />
            <Route path="/trending" element={<Trending />} />
            <Route path="/featured" element={<FeaturedPage />} />
            <Route path="/settings" element={<UserSettings />} />
            <Route path="/music-upload" element={<MusicUpload />} />
          </Routes>
        </main>
        
        <AudioPlayer
          track={state.currentTrack}
          isPlaying={state.isPlaying}
          onPlayPause={playPause}
          onNext={state.queue.length > 1 ? nextTrack : undefined}
          onPrevious={state.queue.length > 1 ? previousTrack : undefined}
          onTrackEnd={handleTrackEnd}
        />
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <PlayerProvider>
          <AppContent />
        </PlayerProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
