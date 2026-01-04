import React, { useState, useEffect } from 'react';
import { 
  BellIcon, 
  XIcon, 
  CheckIcon, 
  AlertTriangleIcon,
  InfoIcon,
  MusicIcon,
  DownloadIcon,
  HeartIcon,
  UserIcon,
  CalendarIcon,
  ClockIcon
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface Notification {
  id: number;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
  actionText?: string;
}

interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  downloadAlerts: boolean;
  newReleases: boolean;
  favoriteAlerts: boolean;
  weeklyDigest: boolean;
}

const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [settings, setSettings] = useState<NotificationSettings>({
    emailNotifications: true,
    pushNotifications: true,
    downloadAlerts: true,
    newReleases: true,
    favoriteAlerts: true,
    weeklyDigest: false
  });
  const [showSettings, setShowSettings] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const { state: authState } = useAuth();

  useEffect(() => {
    if (authState.isAuthenticated) {
      fetchNotifications();
    }
  }, [authState.isAuthenticated]);

  const fetchNotifications = async () => {
    try {
      // Mock notifications - in real app, fetch from API
      const mockNotifications: Notification[] = [
        {
          id: 1,
          type: 'success',
          title: 'Upload Complete',
          message: 'Your track "Summer Vibes" has been successfully uploaded and is now available.',
          timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
          read: false,
          actionUrl: '/upload'
        },
        {
          id: 2,
          type: 'info',
          title: 'New Release',
          message: 'DJ Cool Beats just released "Night Drive" - check it out!',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
          read: false,
          actionUrl: '/albums/night-drive'
        },
        {
          id: 3,
          type: 'warning',
          title: 'Storage Warning',
          message: 'You are approaching your storage limit. Consider upgrading your plan.',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
          read: false
        },
        {
          id: 4,
          type: 'error',
          title: 'Upload Failed',
          message: 'Failed to upload "Urban Dreams". Please check the file format and try again.',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
          read: false
        }
      ];
      
      setNotifications(mockNotifications);
      setUnreadCount(mockNotifications.filter(n => !n.read).length);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const markAsRead = (id: number) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
    setUnreadCount(0);
  };

  const deleteNotification = (id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  const handleSettingChange = (key: keyof NotificationSettings, value: boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckIcon className="h-5 w-5 text-green-400" />;
      case 'warning':
        return <AlertTriangleIcon className="h-5 w-5 text-yellow-400" />;
      case 'error':
        return <AlertTriangleIcon className="h-5 w-5 text-red-400" />;
      case 'info':
        return <InfoIcon className="h-5 w-5 text-blue-400" />;
      default:
        return <BellIcon className="h-5 w-5 text-gray-400" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'border-green-600 bg-green-900';
      case 'warning':
        return 'border-yellow-600 bg-yellow-900';
      case 'error':
        return 'border-red-600 bg-red-900';
      case 'info':
        return 'border-blue-600 bg-blue-900';
      default:
        return 'border-gray-600 bg-gray-900';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 1) {
      return 'Just now';
    } else if (diffMins < 60) {
      return `${diffMins} minutes ago`;
    } else if (diffMins < 1440) {
      return `${Math.floor(diffMins / 60)} hours ago`;
    } else {
      return `${Math.floor(diffMins / 1440)} days ago`;
    }
  };

  if (!authState.isAuthenticated) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
        <div className="text-center">
          <BellIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Sign in to view notifications</h2>
          <p className="text-gray-400 mb-6">Please log in to access your notifications and activity updates</p>
          <button
            onClick={() => window.location.href = '/login'}
            className="bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors"
          >
            Sign In
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
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <BellIcon className="h-8 w-8 text-red-500" />
              <h1 className="text-2xl font-bold text-white">Notifications</h1>
              {unreadCount > 0 && (
                <span className="bg-red-600 text-white text-xs px-2 py-1 rounded-full ml-2">
                  {unreadCount}
                </span>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-400">Manage your notifications and alerts</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Notifications List */}
          <div className="lg:col-span-2">
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">Recent Notifications</h2>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={markAllAsRead}
                    className="text-gray-400 hover:text-white transition-colors text-sm"
                    disabled={unreadCount === 0}
                  >
                    Mark All as Read
                  </button>
                  <button
                    onClick={clearAllNotifications}
                    className="text-gray-400 hover:text-white transition-colors text-sm"
                  >
                    Clear All
                  </button>
                </div>
              </div>

              {/* Notifications */}
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="text-center py-8">
                    <BellIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-400">No notifications yet</p>
                    <p className="text-gray-500 text-sm">You'll see your activity and alerts here</p>
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <div 
                      key={notification.id} 
                      className={`p-4 rounded-lg border transition-all cursor-pointer ${
                        notification.read ? 'bg-gray-800 border-gray-700' : getNotificationColor(notification.type)
                      }`}
                      onClick={() => markAsRead(notification.id)}
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          notification.read ? 'bg-gray-600' : getNotificationColor(notification.type)
                        }`}>
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className={`font-semibold ${
                              notification.read ? 'text-gray-400' : 'text-white'
                            }`}>
                              {notification.title}
                            </h3>
                            {!notification.read && (
                              <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                            )}
                          </div>
                          <div className="text-xs text-gray-500">
                            {formatTimestamp(notification.timestamp)}
                          </div>
                        </div>
                        <button
                          onClick={(e) => { e.stopPropagation(); deleteNotification(notification.id); }}
                          className="text-gray-400 hover:text-red-400 transition-colors"
                        >
                          <XIcon className="h-4 w-4" />
                        </button>
                      </div>
                      <p className={`text-sm ${
                        notification.read ? 'text-gray-500' : 'text-gray-300'
                      }`}>
                        {notification.message}
                      </p>
                      {notification.actionUrl && (
                        <button
                          onClick={(e) => { e.stopPropagation(); if (notification.actionUrl) window.location.href = notification.actionUrl; }}
                          className={`mt-2 px-3 py-1 rounded text-sm font-medium transition-colors ${
                            notification.read ? 'bg-gray-700 text-gray-300' : getNotificationColor(notification.type) + ' text-white'
                          }`}
                        >
                          {notification.actionText || 'View Details'}
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Notification Settings */}
          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Notification Settings</h2>
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                {showSettings ? 'Hide Settings' : 'Show Settings'}
              </button>
            </div>

            {showSettings && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white mb-4">Alert Preferences</h3>
                
                <div className="space-y-3">
                  <label className="flex items-center justify-between">
                    <span className="text-gray-300">Email Notifications</span>
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={settings.emailNotifications}
                        onChange={(e) => handleSettingChange('emailNotifications', e.target.checked)}
                        className="h-4 w-4 text-red-600 bg-gray-700 border-gray-600 rounded focus:ring-2 focus:ring-red-500"
                      />
                      <div className={`absolute left-0 w-8 h-4 rounded-full transition-colors ${
                        settings.emailNotifications ? 'bg-green-600' : 'bg-gray-600'
                      }`}></div>
                    </div>
                  </label>

                  <label className="flex items-center justify-between">
                    <span className="text-gray-300">Push Notifications</span>
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={settings.pushNotifications}
                        onChange={(e) => handleSettingChange('pushNotifications', e.target.checked)}
                        className="h-4 w-4 text-red-600 bg-gray-700 border-gray-600 rounded focus:ring-2 focus:ring-red-500"
                      />
                      <div className={`absolute left-0 w-8 h-4 rounded-full transition-colors ${
                        settings.pushNotifications ? 'bg-green-600' : 'bg-gray-600'
                      }`}></div>
                    </div>
                  </label>

                  <label className="flex items-center justify-between">
                    <span className="text-gray-300">Download Alerts</span>
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={settings.downloadAlerts}
                        onChange={(e) => handleSettingChange('downloadAlerts', e.target.checked)}
                        className="h-4 w-4 text-red-600 bg-gray-700 border-gray-600 rounded focus:ring-2 focus:ring-red-500"
                      />
                      <div className={`absolute left-0 w-8 h-4 rounded-full transition-colors ${
                        settings.downloadAlerts ? 'bg-green-600' : 'bg-gray-600'
                      }`}></div>
                    </div>
                  </label>

                  <label className="flex items-center justify-between">
                    <span className="text-gray-300">New Release Alerts</span>
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={settings.newReleases}
                        onChange={(e) => handleSettingChange('newReleases', e.target.checked)}
                        className="h-4 w-4 text-red-600 bg-gray-700 border-gray-600 rounded focus:ring-2 focus:ring-red-500"
                      />
                      <div className={`absolute left-0 w-8 h-4 rounded-full transition-colors ${
                        settings.newReleases ? 'bg-green-600' : 'bg-gray-600'
                      }`}></div>
                    </div>
                  </label>

                  <label className="flex items-center justify-between">
                    <span className="text-gray-300">Favorite Alerts</span>
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={settings.favoriteAlerts}
                        onChange={(e) => handleSettingChange('favoriteAlerts', e.target.checked)}
                        className="h-4 w-4 text-red-600 bg-gray-700 border-gray-600 rounded focus:ring-2 focus:ring-red-500"
                      />
                      <div className={`absolute left-0 w-8 h-4 rounded-full transition-colors ${
                        settings.favoriteAlerts ? 'bg-green-600' : 'bg-gray-600'
                      }`}></div>
                    </div>
                  </label>

                  <label className="flex items-center justify-between">
                    <span className="text-gray-300">Weekly Digest</span>
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={settings.weeklyDigest}
                        onChange={(e) => handleSettingChange('weeklyDigest', e.target.checked)}
                        className="h-4 w-4 text-red-600 bg-gray-700 border-gray-600 rounded focus:ring-2 focus:ring-red-500"
                      />
                      <div className={`absolute left-0 w-8 h-4 rounded-full transition-colors ${
                        settings.weeklyDigest ? 'bg-green-600' : 'bg-gray-600'
                      }`}></div>
                    </div>
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notifications;
