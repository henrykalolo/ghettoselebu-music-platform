import React, { useState, useEffect } from 'react';
import { 
  UsersIcon, 
  SearchIcon, 
  EditIcon, 
  TrashIcon, 
  ShieldIcon, 
  BanIcon, 
  CheckIcon, 
  XIcon,
  UserPlusIcon,
  MailIcon,
  CalendarIcon,
  DownloadIcon,
  ActivityIcon,
  BarChart3Icon,
  FilterIcon,
  EyeIcon,
  EyeOffIcon
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  isStaff: boolean;
  is_superuser: boolean;
  is_active: boolean;
  dateJoined: string;
  lastLogin: string;
  downloadCount: number;
  playlistCount: number;
  favoriteCount: number;
}

interface UserStats {
  totalUsers: number;
  activeUsers: number;
  newUsersToday: number;
  totalPlaylists: number;
  totalTracks: number;
  totalDownloads: number;
}

const AdminUserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const { state: authState } = useAuth();

  useEffect(() => {
    if (authState.isAuthenticated && authState.user?.is_superuser) {
      fetchUsers();
      fetchUserStats();
    }
  }, [authState.isAuthenticated, authState.user?.is_superuser]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      // Mock users - in real app, fetch from API
      const mockUsers: User[] = [
        {
          id: 1,
          username: 'admin',
          email: 'admin@ghettoselebu.com',
          first_name: 'Admin',
          last_name: 'User',
          isStaff: true,
          is_superuser: true,
          is_active: true,
          dateJoined: '2024-01-01',
          lastLogin: '2024-01-15 14:30',
          downloadCount: 145,
          playlistCount: 12,
          favoriteCount: 89
        },
        {
          id: 2,
          username: 'djcoolbeats',
          email: 'dj@ghettoselebu.com',
          first_name: 'DJ',
          last_name: 'Cool Beats',
          isStaff: false,
          is_superuser: false,
          is_active: true,
          dateJoined: '2024-02-15',
          lastLogin: '2024-01-15 09:45',
          downloadCount: 234,
          playlistCount: 8,
          favoriteCount: 45
        },
        {
          id: 3,
          username: 'musiclover',
          email: 'user@ghettoselebu.com',
          first_name: 'Music',
          last_name: 'Lover',
          isStaff: false,
          is_superuser: false,
          is_active: false,
          dateJoined: '2024-03-01',
          lastLogin: '2023-12-25 16:20',
          downloadCount: 567,
          playlistCount: 23,
          favoriteCount: 234
        }
      ];
      
      setUsers(mockUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserStats = async () => {
    try {
      // Mock stats - in real app, fetch from API
      const mockStats: UserStats = {
        totalUsers: 1247,
        activeUsers: 892,
        newUsersToday: 23,
        totalPlaylists: 456,
        totalTracks: 12450,
        totalDownloads: 45678
      };
      
      setUserStats(mockStats);
    } catch (error) {
      console.error('Error fetching user stats:', error);
    }
  };

  const handleUserAction = async (action: string, userId: number) => {
    try {
      switch (action) {
        case 'toggleActive':
          setUsers(prev => 
            prev.map(user => 
              user.id === userId ? { ...user, is_active: !user.is_active } : user
            )
          );
          break;
        case 'toggleStaff':
          setUsers(prev => 
            prev.map(user => 
              user.id === userId ? { ...user, isStaff: !user.isStaff } : user
            )
          );
          break;
        case 'toggleSuperuser':
          setUsers(prev => 
            prev.map(user => 
              user.id === userId ? { ...user, is_superuser: !user.is_superuser } : user
            )
          );
          break;
        case 'delete':
          setUsers(prev => prev.filter(user => user.id !== userId));
          if (selectedUser?.id === userId) {
            setSelectedUser(null);
          }
          break;
      }
    } catch (error) {
      console.error('Error performing user action:', error);
    }
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setShowUserModal(true);
  };

  const handleSaveUser = async () => {
    if (!editingUser) return;
    
    try {
      // Mock save - in real app, make API call
      console.log('Saving user:', editingUser);
      
      setUsers(prev => 
        prev.map(user => 
          user.id === editingUser.id ? editingUser : user
        )
      );
      
      setEditingUser(null);
      setShowUserModal(false);
    } catch (error) {
      console.error('Error saving user:', error);
    }
  };

  const filteredUsers = users.filter(user => 
    user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.last_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'text-green-400' : 'text-gray-400';
  };

  const getRoleBadge = (isStaff: boolean, is_superuser: boolean) => {
    if (is_superuser) {
      return 'bg-purple-600 text-white text-xs px-2 py-1 rounded-full';
    } else if (isStaff) {
      return 'bg-blue-600 text-white text-xs px-2 py-1 rounded-full';
    }
    return 'bg-gray-600 text-white text-xs px-2 py-1 rounded-full';
  };

  if (!authState.isAuthenticated) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
        <div className="text-center">
          <ShieldIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Admin Access Required</h2>
          <p className="text-gray-400 mb-6">You need administrator privileges to access this area.</p>
          <button
            onClick={() => window.location.href = '/login'}
            className="bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  const isSuperuser = authState.user?.is_superuser;

  if (!isSuperuser) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
        <div className="text-center">
          <ShieldIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Superuser Access Required</h2>
          <p className="text-gray-400 mb-6">You need superuser privileges to access this area.</p>
          <button
            onClick={() => window.location.href = '/login'}
            className="bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center">
            <div className="flex items-center">
              <ShieldIcon className="h-8 w-8 text-red-500" />
              <h1 className="text-2xl font-bold text-white">Admin User Management</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-400">Manage users, roles, and permissions</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* User Stats */}
          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">User Statistics</h2>
              <BarChart3Icon className="h-5 w-5 text-gray-400" />
            </div>

            {userStats ? (
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">{userStats.totalUsers}</div>
                  <div className="text-gray-400">Total Users</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">{userStats.activeUsers}</div>
                  <div className="text-gray-400">Active Users</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">{userStats.newUsersToday}</div>
                  <div className="text-gray-400">New Today</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">{userStats.totalPlaylists}</div>
                  <div className="text-gray-400">Total Playlists</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">{userStats.totalTracks}</div>
                  <div className="text-gray-400">Total Tracks</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">{userStats.totalDownloads}</div>
                  <div className="text-gray-400">Total Downloads</div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <BarChart3Icon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400">Unable to load user statistics</p>
              </div>
            )}
          </div>
        </div>

        {/* User Management */}
        <div className="lg:col-span-2">
          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">User Management</h2>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="text-gray-400 hover:text-white transition-colors text-sm"
                >
                  <FilterIcon className="h-4 w-4" />
                  {showFilters ? 'Hide Filters' : 'Show Filters'}
                </button>
                <button
                  onClick={() => {
                    const newUser = {
                      id: Date.now(),
                      username: `user${Date.now()}`,
                      email: `user${Date.now()}@example.com`,
                      first_name: 'New',
                      last_name: 'User',
                      isStaff: false,
                      is_superuser: false,
                      is_active: true,
                      dateJoined: new Date().toISOString(),
                      lastLogin: new Date().toISOString(),
                      downloadCount: 0,
                      playlistCount: 0,
                      favoriteCount: 0
                    };
                    setUsers(prev => [newUser, ...prev]);
                  }}
                  className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors"
                >
                  <UserPlusIcon className="h-4 w-4" />
                  Add User
                </button>
              </div>
            </div>

            {/* Search Bar */}
            <div className="mb-4">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search users..."
                  className="w-full px-4 py-2 pr-10 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                <button
                  onClick={() => {
                    const newUser = {
                      id: Date.now(),
                      username: `user${Date.now()}`,
                      email: `user${Date.now()}@example.com`,
                      first_name: 'New',
                      last_name: 'User',
                      isStaff: false,
                      is_superuser: false,
                      is_active: true,
                      dateJoined: new Date().toISOString(),
                      lastLogin: new Date().toISOString(),
                      downloadCount: 0,
                      playlistCount: 0,
                      favoriteCount: 0
                    };
                    setUsers(prev => [newUser, ...prev]);
                  }}
                  className="absolute right-3 top-3 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                >
                  <SearchIcon className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Filters */}
            {showFilters && (
              <div className="mb-4 p-4 bg-gray-800 rounded-lg border border-gray-700">
                <h3 className="text-lg font-semibold text-white mb-4">Active Filters</h3>
                <div className="grid grid-cols-2 gap-4">
                  <label className="flex items-center space-x-2">
                    <span className="text-gray-300">Show Active Only</span>
                    <input
                      type="checkbox"
                      checked={filteredUsers.every(user => user.is_active)}
                      onChange={(e) => {
                        const showActiveOnly = e.target.checked;
                        setUsers(prev => showActiveOnly ? prev.filter(user => user.is_active) : prev);
                      }}
                      className="h-4 w-4 text-red-600 bg-gray-700 border-gray-600 rounded focus:ring-2 focus:ring-red-500"
                    />
                  </label>
                  <label className="flex items-center space-x-2">
                    <span className="text-gray-300">Show Staff Only</span>
                    <input
                      type="checkbox"
                      checked={filteredUsers.every(user => user.isStaff)}
                      onChange={(e) => {
                        const showStaffOnly = e.target.checked;
                        setUsers(prev => showStaffOnly ? prev.filter(user => user.isStaff) : prev);
                      }}
                      className="h-4 w-4 text-red-600 bg-gray-700 border-gray-600 rounded focus:ring-2 focus:ring-red-500"
                    />
                  </label>
                  <label className="flex items-center space-x-2">
                    <span className="text-gray-300">Show Superusers Only</span>
                    <input
                      type="checkbox"
                      checked={filteredUsers.every(user => user.is_superuser)}
                      onChange={(e) => {
                        const showSuperusersOnly = e.target.checked;
                        setUsers(prev => showSuperusersOnly ? prev.filter(user => user.is_superuser) : prev);
                      }}
                      className="h-4 w-4 text-red-600 bg-gray-700 border-gray-600 rounded focus:ring-2 focus:ring-red-500"
                    />
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Users List */}
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {loading ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-8">
                <UsersIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400">No users found</p>
                <p className="text-gray-500 text-sm">Try adjusting your search or filters</p>
              </div>
            ) : (
              filteredUsers.map((user) => (
                <div key={user.id} className="bg-gray-800 rounded-lg p-4 border border-gray-800 hover:bg-gray-700 transition-colors">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          user.is_active ? 'bg-green-500' : 'bg-gray-600'
                        }`}>
                          <div className="text-white text-xs font-bold">ON</div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-300">{user.username}</span>
                          {getRoleBadge(user.isStaff, user.is_superuser)}
                        </div>
                      </div>
                      <div className="text-xs text-gray-500">
                        {user.email}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">
                        Joined: {new Date(user.dateJoined).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-500">
                        Last Login: {new Date(user.lastLogin).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="text-right space-x-2">
                      <button
                        onClick={() => handleEditUser(user)}
                        className="text-gray-400 hover:text-white transition-colors"
                        title="Edit user"
                      >
                        <EditIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleUserAction('toggleActive', user.id)}
                        className={`${user.is_active ? 'text-gray-400' : 'text-green-400'} hover:text-white transition-colors`}
                        title={user.is_active ? 'Deactivate User' : 'Activate User'}
                      >
                        <EyeIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleUserAction('delete', user.id)}
                        className="text-gray-400 hover:text-red-400 transition-colors"
                        title="Delete user"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-sm text-gray-400">
                    <div>Downloads: {user.downloadCount}</div>
                    <div>Playlists: {user.playlistCount}</div>
                    <div>Favorites: {user.favoriteCount}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminUserManagement;
