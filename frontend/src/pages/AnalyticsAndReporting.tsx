import React, { useState, useEffect } from 'react';
import { 
  BarChart3Icon, 
  TrendingUpIcon, 
  TrendingDownIcon, 
  DownloadIcon, 
  UsersIcon, 
  CalendarIcon, 
  ClockIcon,
  ActivityIcon,
  EyeIcon,
  FilterIcon,
  RefreshCwIcon,
  FileTextIcon,
  MailIcon,
  ShareIcon,
  CheckIcon,
  AlertTriangleIcon,
  BarChart2Icon,
  PieChartIcon,
  LineChartIcon,
  DollarSignIcon,
  PlayIcon,
  MusicIcon,
  HeadphonesIcon
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface AnalyticsData {
  totalUsers: number;
  activeUsers: number;
  totalTracks: number;
  totalAlbums: number;
  totalPlaylists: number;
  totalDownloads: number;
  totalRevenue: number;
  topGenres: Array<{
    name: string;
    count: number;
    percentage: number;
  }>;
  topTracks: Array<{
    id: number;
    title: string;
    artist: string;
    downloads: number;
    revenue: number;
    trend: 'up' | 'down' | 'stable';
  }>;
  userActivity: Array<{
    date: string;
    activeUsers: number;
    newUsers: number;
    downloads: number;
    uploads: number;
  }>;
  revenueData: Array<{
    date: string;
    revenue: number;
    downloads: number;
    uploads: number;
  }>;
}

interface ReportConfig {
  dateRange: '7d' | '30d' | '90d' | '1y';
  metric: 'users' | 'tracks' | 'downloads' | 'revenue';
  format: 'number' | 'percentage';
}

const AnalyticsAndReporting: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [reportConfig, setReportConfig] = useState<ReportConfig>({
    dateRange: '30d',
    metric: 'users',
    format: 'number'
  });
  const [showFilters, setShowFilters] = useState(false);
  const [exportFormat, setExportFormat] = useState<'csv' | 'pdf' | 'excel'>('csv');

  const { state: authState } = useAuth();

  useEffect(() => {
    if (authState.isAuthenticated && authState.user?.is_superuser) {
      fetchAnalyticsData();
    }
  }, [authState.isAuthenticated, authState.user?.is_superuser]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      // Mock analytics data - in real app, fetch from API
      const mockData: AnalyticsData = {
        totalUsers: 1247,
        activeUsers: 892,
        totalTracks: 12450,
        totalAlbums: 342,
        totalPlaylists: 456,
        totalDownloads: 45678,
        totalRevenue: 15678.50,
        topGenres: [
          { name: 'Hip-Hop', count: 445, percentage: 35.7 },
          { name: 'Electronic', count: 234, percentage: 18.8 },
          { name: 'R&B', count: 189, percentage: 15.2 },
          { name: 'Rap', count: 156, percentage: 12.5 },
          { name: 'Pop', count: 123, percentage: 9.8 },
          { name: 'Rock', count: 89, percentage: 7.1 }
        ],
        topTracks: [
          {
            id: 1,
            title: 'Summer Vibes 2024',
            artist: 'DJ Cool Beats',
            downloads: 2341,
            revenue: 23.41,
            trend: 'up'
          },
          {
            id: 2,
            title: 'Night Drive',
            artist: 'Synthwave Master',
            downloads: 1892,
            revenue: 18.92,
            trend: 'up'
          },
          {
            id: 3,
            title: 'Urban Dreams',
            artist: 'City Lights',
            downloads: 1567,
            revenue: 15.67,
            trend: 'down'
          }
        ],
        userActivity: [
          {
            date: '2024-01-15',
            activeUsers: 892,
            newUsers: 23,
            downloads: 12450,
            uploads: 45
          },
          {
            date: '2024-01-14',
            activeUsers: 856,
            newUsers: 12,
            downloads: 13234,
            uploads: 67
          },
          {
            date: '2024-01-13',
            activeUsers: 823,
            newUsers: 8,
            downloads: 14567,
            uploads: 89
          }
        ],
        revenueData: [
          {
            date: '2024-01-01',
            revenue: 156.78,
            downloads: 12450,
            uploads: 45
          },
          {
            date: '2024-01-02',
            revenue: 234.56,
            downloads: 13234,
            uploads: 67
          },
          {
            date: '2024-01-03',
            revenue: 312.22,
            downloads: 14012,
            uploads: 89
          }
        ]
      };
      
      setAnalyticsData(mockData);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    // Mock export - in real app, make API call
    console.log(`Exporting ${exportFormat.toUpperCase()} report for ${reportConfig.dateRange}...`);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(num);
  };

  const formatPercentage = (num: number) => {
    return `${num.toFixed(1)}%`;
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUpIcon className="h-4 w-4 text-green-400" />;
      case 'down':
        return <TrendingDownIcon className="h-4 w-4 text-red-400" />;
      default:
        return <ActivityIcon className="h-4 w-4 text-gray-400" />;
    }
  };

  if (!authState.isAuthenticated) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
        <div className="text-center">
          <BarChart3Icon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Admin Access Required</h2>
          <p className="text-gray-400 mb-6">You need administrator privileges to access analytics and reporting.</p>
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

  if (!authState.user?.is_superuser) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
        <div className="text-center">
          <BarChart3Icon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Superuser Access Required</h2>
          <p className="text-gray-400 mb-6">You need superuser privileges to access analytics and reporting.</p>
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
              <BarChart3Icon className="h-8 w-8 text-red-500" />
              <h1 className="text-2xl font-bold text-white">Analytics & Reporting</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-400">Monitor platform performance and user engagement</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Overview Cards */}
          <div className="lg:col-span-2">
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">Platform Overview</h2>
                <RefreshCwIcon className="h-5 w-5 text-gray-400" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">{analyticsData?.totalUsers}</div>
                  <div className="text-gray-400">Total Users</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">{analyticsData?.activeUsers}</div>
                  <div className="text-gray-400">Active Users</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">{analyticsData?.totalTracks}</div>
                  <div className="text-gray-400">Total Tracks</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">{analyticsData?.totalAlbums}</div>
                  <div className="text-gray-400">Total Albums</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">{analyticsData?.totalPlaylists}</div>
                  <div className="text-gray-400">Total Playlists</div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">Revenue Overview</h2>
                <DollarSignIcon className="h-5 w-5 text-gray-400" />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Total Revenue</span>
                <span className="text-2xl font-bold text-white">{formatCurrency(analyticsData?.totalRevenue || 0)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">This Month</span>
                <span className="text-2xl font-bold text-white">{formatCurrency(analyticsData?.revenueData?.[0]?.revenue || 0)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Last Month</span>
                <span className="text-2xl font-bold text-white">{formatCurrency(analyticsData?.revenueData?.[1]?.revenue || 0)}</span>
              </div>
            </div>
          </div>

          {/* Top Genres Chart */}
          <div className="lg:col-span-2">
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">Top Genres</h2>
                <PieChartIcon className="h-5 w-5 text-gray-400" />
              </div>
            </div>

            <div className="space-y-3">
              {analyticsData?.topGenres?.map((genre, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-gray-400">{genre.name}</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl font-bold text-white">{genre.count}</span>
                    <span className="text-sm text-gray-400">({formatPercentage(genre.percentage)}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Tracks Table */}
          <div className="lg:col-span-4">
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">Top Tracks</h2>
                <LineChartIcon className="h-5 w-5 text-gray-400" />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm text-gray-300">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="px-4 py-2 text-left">Track</th>
                    <th>Artist</th>
                    <th>Downloads</th>
                    <th>Revenue</th>
                    <th>Trend</th>
                  </tr>
                </thead>
                <tbody>
                  {analyticsData?.topTracks?.map((track, index) => (
                    <tr key={track.id} className="border-b border-gray-700 hover:bg-gray-800">
                      <td className="px-4 py-2">{track.title}</td>
                      <td className="px-4 py-2">{track.artist}</td>
                      <td className="px-4 py-2 text-right">{track.downloads.toLocaleString()}</td>
                      <td className="px-4 py-2 text-right">{formatCurrency(track.revenue)}</td>
                      <td className="px-4 py-2 text-center">{getTrendIcon(track.trend)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* User Activity Chart */}
          <div className="lg:col-span-4">
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">User Activity</h2>
                <ActivityIcon className="h-5 w-5 text-gray-400" />
              </div>
            </div>

            <div className="space-y-3">
              {analyticsData?.userActivity?.map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                  <div className="text-sm text-gray-500">{new Date(activity.date).toLocaleDateString()}</div>
                  <div className="text-sm font-medium text-white">{activity.activeUsers} active</div>
                  <div className="text-sm text-gray-400">
                    <span>{activity.newUsers} new</span> • 
                    <span>{activity.uploads} uploads</span> • 
                    <span>{activity.downloads.toLocaleString()} downloads</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Revenue Chart */}
          <div className="lg:col-span-4">
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">Revenue Trends</h2>
                <BarChart2Icon className="h-5 w-5 text-gray-400" />
              </div>
            </div>

            <div className="space-y-3">
              {analyticsData?.revenueData?.map((data, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                  <span className="text-sm text-gray-500">{new Date(data.date).toLocaleDateString()}</span>
                  <span className="text-sm font-medium text-white">{formatCurrency(data.revenue)}</span>
                  <div className="text-sm text-gray-400">
                    <span>{data.downloads} downloads</span> • 
                    <span>{data.uploads} uploads</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Export Controls */}
          <div className="lg:col-span-4">
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">Export Reports</h2>
                <FileTextIcon className="h-5 w-5 text-gray-400" />
              </div>

              <div className="flex items-center space-x-4 mb-4">
                <select
                  value={reportConfig.dateRange}
                  onChange={(e) => setReportConfig(prev => ({ ...prev, dateRange: e.target.value as ReportConfig['dateRange'] }))}
                  className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="7d">Last 7 Days</option>
                  <option value="30d">Last 30 Days</option>
                </select>
                <select
                  value={exportFormat}
                  onChange={(e) => setExportFormat(e.target.value as 'csv' | 'pdf' | 'excel')}
                  className="px-3 py-2 bg-gray-700 border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="csv">CSV</option>
                  <option value="pdf">PDF</option>
                  <option value="excel">Excel</option>
                </select>
                <button
                  onClick={handleExport}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
                >
                  <DownloadIcon className="h-5 w-5" />
                  <span>Export {exportFormat.toUpperCase()}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsAndReporting;
