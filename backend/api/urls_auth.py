from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from api import views as api_views
from api.views_auth import (
    CustomTokenObtainPairView, register, logout, profile, update_profile,
    add_favorite_track, remove_favorite_track, add_favorite_album, remove_favorite_album,
    add_download_history
)

urlpatterns = [
    # Authentication endpoints
    path('auth/login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/register/', register, name='register'),
    path('auth/logout/', logout, name='logout'),
    path('auth/profile/', profile, name='profile'),
    path('auth/profile/update/', update_profile, name='update_profile'),
    
    # Favorites endpoints
    path('auth/favorites/tracks/add/<int:track_id>/', add_favorite_track, name='add_favorite_track'),
    path('auth/favorites/tracks/remove/<int:track_id>/', remove_favorite_track, name='remove_favorite_track'),
    path('auth/favorites/albums/add/<int:album_id>/', add_favorite_album, name='add_favorite_album'),
    path('auth/favorites/albums/remove/<int:album_id>/', remove_favorite_album, name='remove_favorite_album'),
    
    # Download history
    path('auth/download-history/add/<int:track_id>/', add_download_history, name='add_download_history'),
    
    # Music endpoints
    path('genres/', api_views.GenreViewSet.as_view({'get': 'list'})),
    path('artists/', api_views.ArtistViewSet.as_view({'get': 'list'})),
    path('artists/<slug>/', api_views.ArtistViewSet.as_view({'get': 'retrieve'})),
    path('artists/<slug>/albums/', api_views.ArtistViewSet.as_view({'get': 'albums'})),
    path('artists/<slug>/tracks/', api_views.ArtistViewSet.as_view({'get': 'tracks'})),
    path('artists/<slug>/mixtapes/', api_views.ArtistViewSet.as_view({'get': 'mixtapes'})),
    
    path('tracks/', api_views.TrackViewSet.as_view({'get': 'list'})),
    path('tracks/<slug>/', api_views.TrackViewSet.as_view({'get': 'retrieve'})),
    path('tracks/<slug>/download/', api_views.TrackViewSet.as_view({'post': 'download'})),
    path('tracks/latest/', api_views.TrackViewSet.as_view({'get': 'latest'})),
    path('tracks/top-downloads/', api_views.TrackViewSet.as_view({'get': 'top_downloads'})),
    
    path('albums/', api_views.AlbumViewSet.as_view({'get': 'list'})),
    path('albums/<slug>/', api_views.AlbumViewSet.as_view({'get': 'retrieve'})),
    path('albums/<slug>/download/', api_views.AlbumViewSet.as_view({'post': 'download'})),
    path('albums/latest/', api_views.AlbumViewSet.as_view({'get': 'latest'})),
    
    path('mixtapes/', api_views.MixtapeViewSet.as_view({'get': 'list'})),
    path('mixtapes/<slug>/', api_views.MixtapeViewSet.as_view({'get': 'retrieve'})),
    path('mixtapes/<slug>/download/', api_views.MixtapeViewSet.as_view({'post': 'download'})),
    
    path('compilations/', api_views.CompilationViewSet.as_view({'get': 'list'})),
    path('compilations/<slug>/', api_views.CompilationViewSet.as_view({'get': 'retrieve'})),
    path('compilations/<slug>/download/', api_views.CompilationViewSet.as_view({'post': 'download'})),
    path('compilations/best-of-month/', api_views.CompilationViewSet.as_view({'get': 'best_of_month'})),
    path('compilations/top-hits/', api_views.CompilationViewSet.as_view({'get': 'top_hits'})),
]
