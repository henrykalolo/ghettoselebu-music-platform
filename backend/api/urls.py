from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from api.views import (
    GenreViewSet, ArtistViewSet, TrackViewSet, 
    AlbumViewSet, MixtapeViewSet, CompilationViewSet,
    UserCreateView, UserProfileViewSet, LikeViewSet, CommentViewSet,
    ShareViewSet, FeedViewSet, TrendingViewSet, upload_music
)
from api.views_auth import (
    CustomTokenObtainPairView, register, logout, profile, update_profile,
    add_favorite_track, remove_favorite_track, add_favorite_album, remove_favorite_album,
    add_download_history
)
from api.views_audio import upload_and_process_track, get_audio_processing_status, reprocess_track
from api.views_upload import FileUploadViewSet, BulkFileUploadViewSet
from api.views_notifications import (
    get_notifications, get_notification_counts, mark_notification_read,
    mark_all_notifications_read, delete_notification, clear_all_notifications,
    create_test_notification, get_notification_settings, update_notification_settings
)
from api.views_featured import (
    get_featured_tracks, get_featured_albums, get_featured_mixtapes,
    get_featured_all, get_trending_now, get_top_artists, get_featured_stats
)
from api.views_playlists import PlaylistViewSet

router = DefaultRouter()
router.register(r'genres', GenreViewSet)
router.register(r'artists', ArtistViewSet)
router.register(r'tracks', TrackViewSet)
router.register(r'albums', AlbumViewSet)
router.register(r'mixtapes', MixtapeViewSet)
router.register(r'compilations', CompilationViewSet)
router.register(r'profiles', UserProfileViewSet, basename='userprofile')
router.register(r'likes', LikeViewSet, basename='like')
router.register(r'comments', CommentViewSet, basename='comment')
router.register(r'shares', ShareViewSet, basename='share')
router.register(r'feed', FeedViewSet, basename='feed')
router.register(r'trending', TrendingViewSet, basename='trending')
router.register(r'playlists', PlaylistViewSet, basename='playlist')
router.register(r'upload/single', FileUploadViewSet, basename='file-upload')
router.register(r'upload/bulk', BulkFileUploadViewSet, basename='bulk-upload')

urlpatterns = [
    path('', include(router.urls)),
    path('auth/register/', UserCreateView.as_view(), name='user-register'),
    path('auth/', include([
        path('login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
        path('refresh/', TokenRefreshView.as_view(), name='token_refresh'),
        path('register/', register, name='register'),
        path('logout/', logout, name='logout'),
        path('profile/', profile, name='profile'),
        path('profile/update/', update_profile, name='update_profile'),
        path('favorites/tracks/add/<int:track_id>/', add_favorite_track, name='add_favorite_track'),
        path('favorites/tracks/remove/<int:track_id>/', remove_favorite_track, name='remove_favorite_track'),
        path('favorites/albums/add/<int:album_id>/', add_favorite_album, name='add_favorite_album'),
        path('favorites/albums/remove/<int:album_id>/', remove_favorite_album, name='remove_favorite_album'),
        path('download-history/add/<int:track_id>/', add_download_history, name='add_download_history'),
    ])),
    path('upload/music/', upload_music, name='upload_music'),
    # Audio processing endpoints
    path('tracks/upload-process/', upload_and_process_track, name='upload_process_track'),
    path('tracks/<int:track_id>/processing-status/', get_audio_processing_status, name='track_processing_status'),
    path('tracks/<int:track_id>/reprocess/', reprocess_track, name='reprocess_track'),
    # Notification endpoints
    path('notifications/', get_notifications, name='get_notifications'),
    path('notifications/counts/', get_notification_counts, name='get_notification_counts'),
    path('notifications/<int:notification_id>/read/', mark_notification_read, name='mark_notification_read'),
    path('notifications/mark-all-read/', mark_all_notifications_read, name='mark_all_notifications_read'),
    path('notifications/<int:notification_id>/', delete_notification, name='delete_notification'),
    path('notifications/clear/', clear_all_notifications, name='clear_all_notifications'),
    path('notifications/test/', create_test_notification, name='create_test_notification'),
    path('notifications/settings/', get_notification_settings, name='get_notification_settings'),
    path('notifications/settings/update/', update_notification_settings, name='update_notification_settings'),
    # Featured content endpoints
    path('featured/tracks/', get_featured_tracks, name='get_featured_tracks'),
    path('featured/albums/', get_featured_albums, name='get_featured_albums'),
    path('featured/mixtapes/', get_featured_mixtapes, name='get_featured_mixtapes'),
    path('featured/', get_featured_all, name='get_featured_all'),
    path('featured/trending/', get_trending_now, name='get_trending_now'),
    path('featured/artists/', get_top_artists, name='get_top_artists'),
    path('featured/stats/', get_featured_stats, name='get_featured_stats'),
]
