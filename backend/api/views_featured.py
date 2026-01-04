from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.db.models import Q, Count, Avg, Sum
from django.utils import timezone
from datetime import timedelta
from music.models import Track, Album, Mixtape, TrendingMusic
from .serializers import TrackSerializer, AlbumSerializer, MixtapeSerializer
import logging

logger = logging.getLogger(__name__)

@api_view(['GET'])
@permission_classes([AllowAny])
def get_featured_tracks(request):
    """Get featured tracks based on plays and downloads"""
    try:
        # Get query parameters
        time_period = request.query_params.get('period', 'all')  # all, week, month, year
        limit = int(request.query_params.get('limit', 20))
        
        # Calculate date range
        now = timezone.now()
        if time_period == 'week':
            start_date = now - timedelta(days=7)
        elif time_period == 'month':
            start_date = now - timedelta(days=30)
        elif time_period == 'year':
            start_date = now - timedelta(days=365)
        else:
            start_date = None
        
        # Build queryset
        queryset = Track.objects.filter(
            audio_file__isnull=False
        ).select_related('artist', 'genre', 'album').prefetch_related('featuring_artists')
        
        # Apply time filter if specified
        if start_date:
            queryset = queryset.filter(created_at__gte=start_date)
        
        # Calculate popularity score (downloads + plays)
        # Using download_count as a proxy for both downloads and plays
        queryset = queryset.annotate(
            popularity_score=Sum('download_count') + Count('likes')
        ).order_by('-popularity_score', '-created_at')
        
        # Limit results
        tracks = queryset[:limit]
        
        # Serialize
        serializer = TrackSerializer(tracks, many=True, context={'request': request})
        
        return Response({
            'tracks': serializer.data,
            'period': time_period,
            'total': len(serializer.data)
        })
        
    except Exception as e:
        logger.error(f"Error getting featured tracks: {e}")
        return Response(
            {'error': 'Failed to get featured tracks'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
@permission_classes([AllowAny])
def get_featured_albums(request):
    """Get featured albums based on plays and downloads"""
    try:
        # Get query parameters
        time_period = request.query_params.get('period', 'all')
        limit = int(request.query_params.get('limit', 20))
        
        # Calculate date range
        now = timezone.now()
        if time_period == 'week':
            start_date = now - timedelta(days=7)
        elif time_period == 'month':
            start_date = now - timedelta(days=30)
        elif time_period == 'year':
            start_date = now - timedelta(days=365)
        else:
            start_date = None
        
        # Build queryset
        queryset = Album.objects.filter(
            cover_art__isnull=False
        ).select_related('artist').prefetch_related('tracks')
        
        # Apply time filter if specified
        if start_date:
            queryset = queryset.filter(created_at__gte=start_date)
        
        # Calculate popularity score based on track downloads
        queryset = queryset.annotate(
            total_downloads=Sum('tracks__download_count'),
            total_likes=Count('tracks__likes'),
            track_count=Count('tracks'),
            popularity_score=Sum('tracks__download_count') + Count('tracks__likes')
        ).filter(
            total_downloads__isnull=False
        ).order_by('-popularity_score', '-created_at')
        
        # Limit results
        albums = queryset[:limit]
        
        # Serialize
        serializer = AlbumSerializer(albums, many=True, context={'request': request})
        
        return Response({
            'albums': serializer.data,
            'period': time_period,
            'total': len(serializer.data)
        })
        
    except Exception as e:
        logger.error(f"Error getting featured albums: {e}")
        return Response(
            {'error': 'Failed to get featured albums'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
@permission_classes([AllowAny])
def get_featured_mixtapes(request):
    """Get featured mixtapes based on plays and downloads"""
    try:
        # Get query parameters
        time_period = request.query_params.get('period', 'all')
        limit = int(request.query_params.get('limit', 20))
        
        # Calculate date range
        now = timezone.now()
        if time_period == 'week':
            start_date = now - timedelta(days=7)
        elif time_period == 'month':
            start_date = now - timedelta(days=30)
        elif time_period == 'year':
            start_date = now - timedelta(days=365)
        else:
            start_date = None
        
        # Build queryset
        queryset = Mixtape.objects.filter(
            cover_art__isnull=False
        ).select_related('artist').prefetch_related('tracks')
        
        # Apply time filter if specified
        if start_date:
            queryset = queryset.filter(created_at__gte=start_date)
        
        # Calculate popularity score based on track downloads
        queryset = queryset.annotate(
            total_downloads=Sum('tracks__download_count'),
            total_likes=Count('tracks__likes'),
            track_count=Count('tracks'),
            popularity_score=Sum('tracks__download_count') + Count('tracks__likes')
        ).filter(
            total_downloads__isnull=False
        ).order_by('-popularity_score', '-created_at')
        
        # Limit results
        mixtapes = queryset[:limit]
        
        # Serialize
        serializer = MixtapeSerializer(mixtapes, many=True, context={'request': request})
        
        return Response({
            'mixtapes': serializer.data,
            'period': time_period,
            'total': len(serializer.data)
        })
        
    except Exception as e:
        logger.error(f"Error getting featured mixtapes: {e}")
        return Response(
            {'error': 'Failed to get featured mixtapes'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
@permission_classes([AllowAny])
def get_featured_all(request):
    """Get all featured content (tracks, albums, mixtapes)"""
    try:
        # Get query parameters
        time_period = request.query_params.get('period', 'all')
        limit = int(request.query_params.get('limit', 10))
        
        # Get featured content
        tracks_response = get_featured_tracks(request._request)
        albums_response = get_featured_albums(request._request)
        mixtapes_response = get_featured_mixtapes(request._request)
        
        # Extract data
        tracks = tracks_response.data.get('tracks', [])[:limit]
        albums = albums_response.data.get('albums', [])[:limit]
        mixtapes = mixtapes_response.data.get('mixtapes', [])[:limit]
        
        return Response({
            'tracks': tracks,
            'albums': albums,
            'mixtapes': mixtapes,
            'period': time_period,
            'total_tracks': len(tracks),
            'total_albums': len(albums),
            'total_mixtapes': len(mixtapes)
        })
        
    except Exception as e:
        logger.error(f"Error getting featured content: {e}")
        return Response(
            {'error': 'Failed to get featured content'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
@permission_classes([AllowAny])
def get_trending_now(request):
    """Get currently trending content"""
    try:
        # Get trending music from TrendingMusic model
        now = timezone.now()
        trending = TrendingMusic.objects.filter(
            period_start__lte=now,
            period_end__gte=now
        ).select_related('content_type').order_by('-score')
        
        # Group by content type
        tracks = []
        albums = []
        mixtapes = []
        
        for item in trending:
            content_object = item.content_object
            if content_object:
                if isinstance(content_object, Track):
                    tracks.append(content_object)
                elif isinstance(content_object, Album):
                    albums.append(content_object)
                elif isinstance(content_object, Mixtape):
                    mixtapes.append(content_object)
        
        # Serialize
        track_serializer = TrackSerializer(tracks[:10], many=True, context={'request': request})
        album_serializer = AlbumSerializer(albums[:10], many=True, context={'request': request})
        mixtape_serializer = MixtapeSerializer(mixtapes[:10], many=True, context={'request': request})
        
        return Response({
            'tracks': track_serializer.data,
            'albums': album_serializer.data,
            'mixtapes': mixtape_serializer.data,
            'updated_at': now
        })
        
    except Exception as e:
        logger.error(f"Error getting trending content: {e}")
        return Response(
            {'error': 'Failed to get trending content'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
@permission_classes([AllowAny])
def get_top_artists(request):
    """Get top artists based on total plays and downloads"""
    try:
        # Get query parameters
        time_period = request.query_params.get('period', 'all')
        limit = int(request.query_params.get('limit', 20))
        
        # Calculate date range
        now = timezone.now()
        if time_period == 'week':
            start_date = now - timedelta(days=7)
        elif time_period == 'month':
            start_date = now - timedelta(days=30)
        elif time_period == 'year':
            start_date = now - timedelta(days=365)
        else:
            start_date = None
        
        # Build queryset
        from music.models import Artist
        queryset = Artist.objects.all().prefetch_related('tracks', 'albums', 'mixtapes')
        
        # Apply time filter if specified
        if start_date:
            queryset = queryset.filter(
                Q(tracks__created_at__gte=start_date) |
                Q(albums__created_at__gte=start_date) |
                Q(mixtapes__created_at__gte=start_date)
            ).distinct()
        
        # Calculate popularity score
        queryset = queryset.annotate(
            total_track_downloads=Sum('tracks__download_count'),
            total_album_downloads=Sum('albums__tracks__download_count'),
            total_mixtape_downloads=Sum('mixtapes__tracks__download_count'),
            total_likes=Count('tracks__likes') + Count('albums__tracks__likes') + Count('mixtapes__tracks__likes'),
            total_content=Count('tracks') + Count('albums') + Count('mixtapes'),
            popularity_score=Sum('tracks__download_count') + Sum('albums__tracks__download_count') + Sum('mixtapes__tracks__download_count') + Count('tracks__likes') + Count('albums__tracks__likes') + Count('mixtapes__tracks__likes')
        ).filter(
            total_content__gt=0
        ).order_by('-popularity_score', 'name')
        
        # Limit results
        artists = queryset[:limit]
        
        # Serialize
        from .serializers import ArtistSerializer
        serializer = ArtistSerializer(artists, many=True, context={'request': request})
        
        return Response({
            'artists': serializer.data,
            'period': time_period,
            'total': len(serializer.data)
        })
        
    except Exception as e:
        logger.error(f"Error getting top artists: {e}")
        return Response(
            {'error': 'Failed to get top artists'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
@permission_classes([AllowAny])
def get_featured_stats(request):
    """Get statistics about featured content"""
    try:
        from django.db.models import Sum, Count, Avg, Max
        
        # Track stats
        track_stats = Track.objects.filter(
            audio_file__isnull=False
        ).aggregate(
            total_tracks=Count('id'),
            total_downloads=Sum('download_count'),
            avg_downloads=Avg('download_count'),
            max_downloads=Max('download_count'),
            total_likes=Count('likes')
        )
        
        # Album stats
        album_stats = Album.objects.filter(
            cover_art__isnull=False
        ).aggregate(
            total_albums=Count('id'),
            total_tracks=Count('tracks'),
            avg_tracks_per_album=Avg('tracks')
        )
        
        # Mixtape stats
        mixtape_stats = Mixtape.objects.filter(
            cover_art__isnull=False
        ).aggregate(
            total_mixtapes=Count('id'),
            total_tracks=Count('tracks'),
            avg_tracks_per_mixtape=Avg('tracks')
        )
        
        # Artist stats
        from music.models import Artist
        artist_stats = Artist.objects.aggregate(
            total_artists=Count('id'),
            artists_with_content=Count('id', filter=Q(tracks__isnull=False) | Q(albums__isnull=False) | Q(mixtapes__isnull=False))
        )
        
        return Response({
            'tracks': track_stats,
            'albums': album_stats,
            'mixtapes': mixtape_stats,
            'artists': artist_stats,
            'updated_at': timezone.now()
        })
        
    except Exception as e:
        logger.error(f"Error getting featured stats: {e}")
        return Response(
            {'error': 'Failed to get featured stats'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
