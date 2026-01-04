import React, { useState, useEffect } from 'react';
import { Bell, BellRing, Check, X, Settings, Users, TrendingUp, Music, Heart, MessageCircle, Share2, UserPlus, Calendar } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';

interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  related_object?: {
    type: string;
    id: number;
    title: string;
    artist: string;
    slug: string;
  };
  is_read: boolean;
  created_at: string;
}

interface NotificationCounts {
  total: number;
  unread: number;
  social: number;
  milestones: number;
  system: number;
}

const Notifications: React.FC = () => {
  const { state } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [counts, setCounts] = useState<NotificationCounts>({
    total: 0,
    unread: 0,
    social: 0,
    milestones: 0,
    system: 0
  });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread' | 'social' | 'milestones' | 'system'>('all');
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    if (state.user) {
      fetchNotifications();
      fetchCounts();
    }
  }, [state.user, filter]);

  const fetchNotifications = async () => {
    try {
      const params = filter !== 'all' ? { type: filter } : {};
      const response = await apiService.notificationsAPI.getNotifications(params);
      setNotifications(response.data.results || response.data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCounts = async () => {
    try {
      const response = await apiService.notificationsAPI.getNotificationCounts();
      setCounts(response.data);
    } catch (error) {
      console.error('Error fetching notification counts:', error);
    }
  };

  const markAsRead = async (notificationId: number) => {
    try {
      await apiService.notificationsAPI.markAsRead(notificationId);
      setNotifications(prev => prev.map(n => 
        n.id === notificationId ? { ...n, is_read: true } : n
      ));
      fetchCounts();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await apiService.notificationsAPI.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      fetchCounts();
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const deleteNotification = async (notificationId: number) => {
    try {
      await apiService.notificationsAPI.deleteNotification(notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      fetchCounts();
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const clearAllNotifications = async () => {
    try {
      await apiService.notificationsAPI.clearAll();
      setNotifications([]);
      fetchCounts();
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  };

  const createTestNotification = async () => {
    try {
      await apiService.notificationsAPI.createTest();
      fetchNotifications();
      fetchCounts();
    } catch (error) {
      console.error('Error creating test notification:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'social':
      case 'follow':
        return <UserPlus className="w-5 h-5 text-blue-400" />;
      case 'milestone':
        return <TrendingUp className="w-5 h-5 text-green-400" />;
      case 'system':
        return <Settings className="w-5 h-5 text-gray-400" />;
      case 'like':
        return <Heart className="w-5 h-5 text-red-400" />;
      case 'comment':
        return <MessageCircle className="w-5 h-5 text-purple-400" />;
      case 'share':
        return <Share2 className="w-5 h-5 text-yellow-400" />;
      default:
        return <Bell className="w-5 h-5 text-gray-400" />;
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.is_read;
    if (filter === 'social') return ['social', 'follow'].includes(n.type);
    if (filter === 'milestones') return n.type === 'milestone';
    if (filter === 'system') return n.type === 'system';
    return true;
  });

  if (showDropdown) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
        <div className="bg-gray-900 rounded-lg w-full max-w-4xl max-h-[80vh] overflow-hidden">
          <div className="p-6 border-b border-gray-800">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white flex items-center">
                <Bell className="w-6 h-6 mr-2" />
                Notifications ({counts.unread})
              </h2>
              <button
                onClick={() => setShowDropdown(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          <div className="p-6">
            {/* Filter Tabs */}
            <div className="flex space-x-2 mb-6 overflow-x-auto">
              {[
                { key: 'all', label: 'All', count: counts.total },
                { key: 'unread', label: 'Unread', count: counts.unread },
                { key: 'social', label: 'Social', count: counts.social },
                { key: 'milestones', label: 'Milestones', count: counts.milestones },
                { key: 'system', label: 'System', count: counts.system }
              ].map(({ key, label, count }) => (
                <button
                  key={key}
                  onClick={() => setFilter(key as any)}
                  className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                    filter === key
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-800 text-gray-400 hover:text-white'
                  }`}
                >
                  {label} ({count})
                </button>
              ))}
            </div>

            {/* Actions */}
            <div className="flex justify-between items-center mb-6">
              <div className="flex space-x-2">
                {counts.unread > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-sm bg-purple-600 text-white px-3 py-1 rounded hover:bg-purple-700"
                  >
                    Mark All Read
                  </button>
                )}
                <button
                  onClick={createTestNotification}
                  className="text-sm bg-gray-700 text-white px-3 py-1 rounded hover:bg-gray-600"
                >
                  Test Notification
                </button>
              </div>
              {notifications.length > 0 && (
                <button
                  onClick={clearAllNotifications}
                  className="text-sm bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                >
                  Clear All
                </button>
              )}
            </div>

            {/* Notifications List */}
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="text-center py-12">
                <Bell className="w-16 h-16 mx-auto mb-4 text-gray-500" />
                <h3 className="text-xl font-semibold text-white mb-2">No notifications</h3>
                <p className="text-gray-400">
                  {filter === 'unread' ? 'No unread notifications' : 'No notifications to show'}
                </p>
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {filteredNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`bg-gray-800 rounded-lg p-4 border ${
                      !notification.is_read ? 'border-purple-500' : 'border-gray-700'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1">
                        <div className="mt-1">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1">
                          <h4 className="text-white font-semibold">{notification.title}</h4>
                          <p className="text-gray-300 text-sm mt-1">{notification.message}</p>
                          {notification.related_object && (
                            <div className="mt-2 text-sm text-gray-400">
                              Related to: {notification.related_object.title} by {notification.related_object.artist}
                            </div>
                          )}
                          <p className="text-gray-500 text-xs mt-2">
                            {formatTimeAgo(notification.created_at)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        {!notification.is_read && (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className="text-green-400 hover:text-green-300"
                            title="Mark as read"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => deleteNotification(notification.id)}
                          className="text-red-400 hover:text-red-300"
                          title="Delete"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(true)}
        className="relative p-2 text-gray-400 hover:text-white transition-colors"
      >
        {counts.unread > 0 ? (
          <BellRing className="w-6 h-6" />
        ) : (
          <Bell className="w-6 h-6" />
        )}
        {counts.unread > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {counts.unread > 9 ? '9+' : counts.unread}
          </span>
        )}
      </button>
    </div>
  );
};

export default Notifications;
