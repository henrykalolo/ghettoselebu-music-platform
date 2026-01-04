import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add JWT token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh/`, {
            refresh: refreshToken,
          });
          
          const { access } = response.data;
          localStorage.setItem('access_token', access);
          
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, logout user
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export interface Artist {
  id: number;
  name: string;
  slug: string;
  bio: string;
  image: string | null;
  created_at: string;
}

export interface Genre {
  id: number;
  name: string;
  slug: string;
}

export interface Track {
  id: number;
  title: string;
  slug: string;
  artist: Artist;
  album?: Album;
  genre?: Genre;
  featuring_artists: Artist[];
  track_number?: number;
  duration?: string;
  audio_file?: string;
  file_size: string;
  bitrate: string;
  format: string;
  is_explicit: boolean;
  download_count: number;
  created_at: string;
}

export interface Album {
  id: number;
  title: string;
  slug: string;
  artist: Artist;
  genre?: Genre;
  release_date?: string;
  cover_art?: string;
  description: string;
  is_explicit: boolean;
  bitrate: string;
  format: string;
  download_count: number;
  tracks_count: number;
  created_at: string;
}

export interface Mixtape {
  id: number;
  title: string;
  slug: string;
  artist: Artist;
  cover_art?: string;
  description: string;
  release_date?: string;
  download_count: number;
  created_at: string;
}

export interface Compilation {
  id: number;
  title: string;
  slug: string;
  subtitle: string;
  cover_art?: string;
  description: string;
  is_best_of_month: boolean;
  month?: string;
  is_top_hits: boolean;
  year?: number;
  download_count: number;
  tracks_count: number;
  created_at: string;
}

export interface Playlist {
  id: number;
  name: string;
  description: string;
  user: number;
  tracks: Track[];
  is_public: boolean;
  cover_art: string;
  created_at: string;
  updated_at: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  date_joined: string;
  // Optional flags for privilege checks
  is_staff?: boolean;
  is_superuser?: boolean;
  is_active?: boolean;
}

export interface UserProfile {
  id: number;
  user: User;
  bio: string;
  profile_image?: string;
  avatar?: string;
  is_artist: boolean;
  followers_count: number;
  following_count: number;
  is_following: boolean;
  favorite_tracks: Track[];
  favorite_albums: Album[];
  download_history: Track[];
  created_at: string;
  updated_at: string;
}

export interface LoginResponse {
  access: string;
  refresh: string;
  user: User;
  profile: UserProfile;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  password_confirm: string;
  first_name?: string;
  last_name?: string;
}

// Authentication API
export const authAPI = {
  login: (username: string, password: string) =>
    api.post<LoginResponse>('/auth/login/', { username, password }),
  
  register: (userData: RegisterData) =>
    api.post<LoginResponse>('/auth/register/', userData),
  
  getProfile: () =>
    api.get<UserProfile>('/auth/profile/'),
  
  updateProfile: (userData: Partial<User>) =>
    api.put<UserProfile>('/auth/profile/update/', userData),
  
  refreshToken: (refresh: string) =>
    api.post('/auth/refresh/', { refresh }),
  
  addFavoriteTrack: (trackId: number) =>
    api.post(`/auth/favorites/tracks/add/${trackId}/`),
  
  removeFavoriteTrack: (trackId: number) =>
    api.post(`/auth/favorites/tracks/remove/${trackId}/`),
  
  addFavoriteAlbum: (albumId: number) =>
    api.post(`/auth/favorites/albums/add/${albumId}/`),
  
  removeFavoriteAlbum: (albumId: number) =>
    api.post(`/auth/favorites/albums/remove/${albumId}/`),
  
  addDownloadHistory: (trackId: number) =>
    api.post(`/auth/download-history/add/${trackId}/`),
  
  logout: async () => {
    try {
      await api.post('/auth/logout/', {});
    } catch (error) {
      console.error('Backend logout error:', error);
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    }
  },
};

export const apiService = {
  // Genres
  getGenres: () => api.get<PaginatedResponse<Genre>>('/genres/'),
  
  // Playlist API methods
  getPlaylists: () => api.get<PaginatedResponse<Playlist>>('/playlists/'),
  getPlaylist: (id: number) => api.get<Playlist>(`/playlists/${id}/`),
  createPlaylist: (data: any) => api.post<Playlist>('/playlists/', data),
  updatePlaylist: (id: number, data: any) => api.put<Playlist>(`/playlists/${id}/`, data),
  deletePlaylist: (id: number) => api.delete(`/playlists/${id}/`),
  addTrackToPlaylist: (playlistId: number, trackId: number) => api.post(`/playlists/${playlistId}/tracks/${trackId}/`),
  removeTrackFromPlaylist: (playlistId: number, trackId: number) => api.delete(`/playlists/${playlistId}/tracks/${trackId}/`),
  duplicatePlaylist: (id: number) => api.post(`/playlists/${id}/duplicate/`),
  
  // Artists
  getArtists: (params?: any) => api.get<PaginatedResponse<Artist>>('/artists/', { params }),
  getArtist: (slug: string) => api.get<Artist>(`/artists/${slug}/`),
  getArtistAlbums: (slug: string) => api.get<Album[]>(`/artists/${slug}/albums/`),
  getArtistTracks: (slug: string) => api.get<Track[]>(`/artists/${slug}/tracks/`),
  getArtistMixtapes: (slug: string) => api.get<Mixtape[]>(`/artists/${slug}/mixtapes/`),
  
  // Tracks
  getTracks: (params?: any) => api.get<PaginatedResponse<Track>>('/tracks/', { params }),
  getTrack: (slug: string) => api.get<Track>(`/tracks/${slug}/`),
  getLatestTracks: () => api.get<Track[]>('/tracks/latest/'),
  getTopTracks: () => api.get<Track[]>('/tracks/top_downloads/'),
  downloadTrack: async (slug: string) => {
    const response = await api.post(`/tracks/${slug}/download/`, {}, { responseType: 'blob' });
    const blob = new Blob([response.data], { type: 'audio/mpeg' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${slug}.mp3`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },
  
  // Albums
  getAlbums: (params?: any) => api.get<PaginatedResponse<Album>>('/albums/', { params }),
  getAlbum: (slug: string) => api.get<Album>(`/albums/${slug}/`),
  getLatestAlbums: () => api.get<Album[]>('/albums/latest/'),
  downloadAlbum: (slug: string) => api.post(`/albums/${slug}/download/`),
  
  // Mixtapes
  getMixtapes: (params?: any) => api.get<PaginatedResponse<Mixtape>>('/mixtapes/', { params }),
  getMixtape: (slug: string) => api.get<Mixtape>(`/mixtapes/${slug}/`),
  downloadMixtape: (slug: string) => api.post(`/mixtapes/${slug}/download/`),
  
  // Compilations
  getCompilations: (params?: any) => api.get<PaginatedResponse<Compilation>>('/compilations/', { params }),
  getCompilation: (slug: string) => api.get<Compilation>(`/compilations/${slug}/`),
  getBestOfMonth: (month?: string) => api.get<Compilation[]>('/compilations/best_of_month/', { params: { month } }),
  getTopHits: (year?: number) => api.get<Compilation[]>('/compilations/top_hits/', { params: { year } }),
  downloadCompilation: (slug: string) => api.post(`/compilations/${slug}/download/`),

  // Featured Content API
  featuredAPI: {
    getFeaturedTracks: (params?: any) => api.get('/featured/tracks/', { params }),
    getFeaturedAlbums: (params?: any) => api.get('/featured/albums/', { params }),
    getFeaturedMixtapes: (params?: any) => api.get('/featured/mixtapes/', { params }),
    getFeaturedAll: (params?: any) => api.get('/featured/', { params }),
    getTrendingNow: () => api.get('/featured/trending/'),
    getTopArtists: (params?: any) => api.get('/featured/artists/', { params }),
    getFeaturedStats: () => api.get('/featured/stats/'),
  },

  // Notification API
  notificationsAPI: {
    getNotifications: (params?: any) => api.get('/notifications/', { params }),
    getNotificationCounts: () => api.get('/notifications/counts/'),
    markAsRead: (notificationId: number) => api.post(`/notifications/${notificationId}/read/`),
    markAllAsRead: () => api.post('/notifications/mark-all-read/'),
    deleteNotification: (notificationId: number) => api.delete(`/notifications/${notificationId}/`),
    clearAll: () => api.delete('/notifications/clear/'),
    createTest: () => api.post('/notifications/test/'),
    getSettings: () => api.get('/notifications/settings/'),
    updateSettings: (settings: any) => api.post('/notifications/settings/update/', settings),
  },

  // Audio Processing API
  audioAPI: {
    uploadAndProcessTrack: (formData: FormData) => {
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      };
      return api.post('/tracks/upload-process/', formData, config);
    },
    getProcessingStatus: (trackId: number) => 
      api.get(`/tracks/${trackId}/processing-status/`),
    reprocessTrack: (trackId: number) => 
      api.post(`/tracks/${trackId}/reprocess/`),
  },

  // Social Features API
  socialAPI: {
    // User Profiles
    getProfile: (id: number) => api.get<UserProfile>(`/profiles/${id}/`),
    updateProfile: (data: Partial<UserProfile>) => api.patch<UserProfile>('/profiles/me/', data),
    uploadAvatar: (formData: FormData) => {
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      };
      return api.post('/profiles/upload_avatar/', formData, config);
    },
    followUser: (id: number) => api.post(`/profiles/${id}/follow/`),
    unfollowUser: (id: number) => api.post(`/profiles/${id}/unfollow/`),
    getFollowers: (id: number) => api.get<UserProfile[]>(`/profiles/${id}/followers/`),
    getFollowing: (id: number) => api.get<UserProfile[]>(`/profiles/${id}/following/`),
    
    // Likes
    toggleLike: (contentType: string, objectId: number) => 
      api.post('/likes/toggle/', { content_type: contentType, object_id: objectId }),
    getLikes: (contentType: string, objectId: number) => 
      api.get('/likes/', { params: { content_type: contentType, object_id: objectId } }),
    
    // Comments
    getComments: (contentType: string, objectId: number) => 
      api.get('/comments/', { params: { content_type: contentType, object_id: objectId } }),
    addComment: (contentType: string, objectId: number, text: string, parentId?: number) => 
      api.post('/comments/add/', { 
        content_type: contentType, 
        object_id: objectId, 
        text, 
        parent: parentId 
      }),
    
    // Shares
    createShare: (contentType: string, objectId: number, caption?: string) => 
      api.post('/shares/', { content_type: contentType, object_id: objectId, caption }),
    getShares: () => api.get('/shares/'),
    
    // Feed
    getTimeline: () => api.get('/feed/timeline/'),
    
    // Trending
    getTrending: () => api.get('/trending/weekly/'),
    getFeatured: () => api.get('/trending/featured/'),
  },
};

export default api;
