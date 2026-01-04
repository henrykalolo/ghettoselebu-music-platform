import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  MusicIcon, 
  UserIcon, 
  LogOutIcon, 
  BarChart3Icon,
  HomeIcon,
  DiscIcon,
  RadioIcon,
  ListMusicIcon,
  List,
  XIcon,
  UsersIcon,
  TrendingUpIcon,
  SettingsIcon,
  Upload,
  Star
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle }) => {
  const { state, logout } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    logout();
  };

  const navigationItems = [
    { path: '/', label: 'Home', icon: HomeIcon },
    { path: '/artists', label: 'Artists', icon: UserIcon },
    { path: '/albums', label: 'Albums', icon: DiscIcon },
    { path: '/tracks', label: 'Tracks', icon: MusicIcon },
    { path: '/mixtapes', label: 'Mixtapes', icon: RadioIcon },
    { path: '/compilations', label: 'Compilations', icon: ListMusicIcon },
    { path: '/playlists', label: 'Playlists', icon: List },
    { path: '/featured', label: 'Featured', icon: Star },
    { path: '/feed', label: 'Social Feed', icon: UsersIcon },
    { path: '/trending', label: 'Trending', icon: TrendingUpIcon },
    { path: '/music-upload', label: 'Upload Music', icon: Upload },
    { path: '/settings', label: 'Settings', icon: SettingsIcon },
    { path: '/dashboard', label: 'Dashboard', icon: BarChart3Icon },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 h-full bg-gray-900 border-r border-gray-800 z-50
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:z-auto
        w-64 flex flex-col
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <Link to="/" className="flex items-center space-x-2">
            <MusicIcon className="h-8 w-8 text-red-600" />
            <span className="text-xl font-bold text-white">Ghettoselebu</span>
          </Link>
          <button
            onClick={onToggle}
            className="lg:hidden text-gray-400 hover:text-white"
          >
            <XIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`
                  flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                  ${isActive(item.path) 
                    ? 'bg-red-600 text-white' 
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }
                `}
                onClick={() => onToggle()}
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-gray-800">
          {state.isAuthenticated ? (
            <div className="space-y-2">
              <div className="flex items-center space-x-3 px-3 py-2">
                <UserIcon className="h-5 w-5 text-gray-400" />
                <span className="text-sm text-gray-300">{state.user?.username}</span>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
              >
                <LogOutIcon className="h-5 w-5" />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <Link
                to="/login"
                className="block w-full text-center text-gray-300 hover:text-white px-3 py-2 text-sm font-medium border border-gray-600 rounded-lg hover:bg-gray-800 transition-colors"
                onClick={() => onToggle()}
              >
                Login
              </Link>
              <Link
                to="/register"
                className="block w-full text-center bg-red-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
                onClick={() => onToggle()}
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Sidebar;
