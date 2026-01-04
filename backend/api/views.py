from rest_framework import viewsets, status, filters, permissions
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.generics import CreateAPIView, RetrieveUpdateAPIView
from django_filters.rest_framework import DjangoFilterBackend
from django.shortcuts import get_object_or_404
from django.conf import settings
from django.http import FileResponse
from django.contrib.contenttypes.models import ContentType
from django.utils import timezone
from datetime import timedelta
from django.contrib.auth.models import User
import os
from music.models import (
    Artist, Genre, Album, Track, Mixtape, Compilation, UserProfile, 
    Follow, Like, Comment, Share, FeedItem, TrendingMusic
)
from api.serializers import (
    ArtistSerializer, ArtistDetailSerializer, GenreSerializer,
    AlbumSerializer, AlbumDetailSerializer, TrackSerializer, TrackDetailSerializer,
    MixtapeSerializer, MixtapeDetailSerializer, CompilationSerializer, CompilationDetailSerializer,
    UserSerializer, UserProfileSerializer, CommentSerializer, ShareSerializer,
    FeedItemSerializer, TrendingMusicSerializer, FollowSerializer
)


class GenreViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Genre.objects.all()
    serializer_class = GenreSerializer
    lookup_field = 'slug'


class ArtistViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Artist.objects.all()
    serializer_class = ArtistSerializer
    lookup_field = 'slug'
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'bio']
    ordering_fields = ['name', 'created_at']
    ordering = ['name']

    def retrieve(self, request, slug=None):
        artist = get_object_or_404(Artist, slug=slug)
        serializer = ArtistDetailSerializer(artist)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def albums(self, request, slug=None):
        artist = get_object_or_404(Artist, slug=slug)
        albums = artist.albums.all()
        serializer = AlbumSerializer(albums, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def tracks(self, request, slug=None):
        artist = get_object_or_404(Artist, slug=slug)
        tracks = artist.tracks.all()
        serializer = TrackSerializer(tracks, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def mixtapes(self, request, slug=None):
        artist = get_object_or_404(Artist, slug=slug)
        mixtapes = artist.mixtapes.all()
        serializer = MixtapeSerializer(mixtapes, many=True)
        return Response(serializer.data)


class TrackViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Track.objects.all()
    serializer_class = TrackSerializer
    lookup_field = 'slug'
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'artist__name']
    filterset_fields = ['artist', 'album', 'genre', 'is_explicit']
    ordering_fields = ['title', 'created_at', 'download_count']
    ordering = ['-created_at']

    def retrieve(self, request, slug=None):
        track = get_object_or_404(Track, slug=slug)
        serializer = TrackDetailSerializer(track)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def download(self, request, slug=None):
        track = get_object_or_404(Track, slug=slug)
        track.download_count += 1
        track.save()
        
        if track.audio_file:
            # Return the audio file for download
            file_path = os.path.join(settings.MEDIA_ROOT, track.audio_file.name)
            if os.path.exists(file_path):
                response = FileResponse(open(file_path, 'rb'), content_type='audio/mpeg')
                response['Content-Disposition'] = f'attachment; filename="{os.path.basename(track.audio_file.name)}"'
                return response
        
        return Response({'download_count': track.download_count})

    @action(detail=False, methods=['get'])
    def latest(self, request):
        latest_tracks = self.queryset[:20]
        serializer = self.get_serializer(latest_tracks, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def top_downloads(self, request):
        top_tracks = self.queryset.order_by('-download_count')[:50]
        serializer = self.get_serializer(top_tracks, many=True)
        return Response(serializer.data)


class AlbumViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Album.objects.all()
    serializer_class = AlbumSerializer
    lookup_field = 'slug'
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'artist__name']
    filterset_fields = ['artist', 'genre', 'is_explicit']
    ordering_fields = ['title', 'release_date', 'created_at', 'download_count']
    ordering = ['-created_at']

    def retrieve(self, request, slug=None):
        album = get_object_or_404(Album, slug=slug)
        serializer = AlbumDetailSerializer(album)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def download(self, request, slug=None):
        album = get_object_or_404(Album, slug=slug)
        album.download_count += 1
        album.save()
        return Response({'download_count': album.download_count})

    @action(detail=False, methods=['get'])
    def latest(self, request):
        latest_albums = self.queryset[:20]
        serializer = self.get_serializer(latest_albums, many=True)
        return Response(serializer.data)


class MixtapeViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Mixtape.objects.all()
    serializer_class = MixtapeSerializer
    lookup_field = 'slug'
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'artist__name']
    filterset_fields = ['artist']
    ordering_fields = ['title', 'release_date', 'created_at', 'download_count']
    ordering = ['-created_at']

    def retrieve(self, request, slug=None):
        mixtape = get_object_or_404(Mixtape, slug=slug)
        serializer = MixtapeDetailSerializer(mixtape)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def download(self, request, slug=None):
        mixtape = get_object_or_404(Mixtape, slug=slug)
        mixtape.download_count += 1
        mixtape.save()
        return Response({'download_count': mixtape.download_count})


class CompilationViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Compilation.objects.all()
    serializer_class = CompilationSerializer
    lookup_field = 'slug'
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'subtitle']
    filterset_fields = ['is_best_of_month', 'is_top_hits', 'year']
    ordering_fields = ['title', 'created_at', 'download_count']
    ordering = ['-created_at']

    def retrieve(self, request, slug=None):
        compilation = get_object_or_404(Compilation, slug=slug)
        serializer = CompilationDetailSerializer(compilation)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def download(self, request, slug=None):
        compilation = get_object_or_404(Compilation, slug=slug)
        compilation.download_count += 1
        compilation.save()
        return Response({'download_count': compilation.download_count})

    @action(detail=False, methods=['get'])
    def best_of_month(self, request):
        month = request.query_params.get('month', None)
        if month:
            compilations = self.queryset.filter(is_best_of_month=True, month__startswith=month)
        else:
            compilations = self.queryset.filter(is_best_of_month=True)
        serializer = self.get_serializer(compilations, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def top_hits(self, request):
        year = request.query_params.get('year', None)
        if year:
            compilations = self.queryset.filter(is_top_hits=True, year=year)
        else:
            compilations = self.queryset.filter(is_top_hits=True)
        serializer = self.get_serializer(compilations, many=True)
        return Response(serializer.data)


class UserCreateView(CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.AllowAny]


class UserProfileViewSet(viewsets.ModelViewSet):
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return UserProfile.objects.all()

    def get_object(self):
        return self.request.user.userprofile

    @action(detail=False, methods=['get', 'patch'])
    def me(self, request):
        profile = request.user.userprofile
        if request.method == 'GET':
            serializer = self.get_serializer(profile)
            return Response(serializer.data)
        elif request.method == 'PATCH':
            serializer = self.get_serializer(profile, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def upload_avatar(self, request):
        profile = request.user.userprofile
        if 'avatar' in request.FILES:
            profile.avatar = request.FILES['avatar']
            profile.save()
            serializer = self.get_serializer(profile)
            return Response(serializer.data)
        return Response({'error': 'No avatar file provided'}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def follow(self, request, pk=None):
        to_follow = get_object_or_404(UserProfile, pk=pk)
        if to_follow == request.user.userprofile:
            return Response({'error': 'Cannot follow yourself'}, status=status.HTTP_400_BAD_REQUEST)
        
        if request.user.userprofile.follow_user(to_follow):
            Follow.objects.get_or_create(
                follower=request.user,
                following=to_follow.user
            )
            return Response({'status': 'following'})
        return Response({'error': 'Already following'}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def unfollow(self, request, pk=None):
        to_unfollow = get_object_or_404(UserProfile, pk=pk)
        request.user.userprofile.unfollow_user(to_unfollow)
        Follow.objects.filter(
            follower=request.user,
            following=to_unfollow.user
        ).delete()
        return Response({'status': 'unfollowed'})

    @action(detail=True, methods=['get'])
    def followers(self, request, pk=None):
        profile = get_object_or_404(UserProfile, pk=pk)
        followers = profile.followers.all()
        serializer = UserProfileSerializer(followers, many=True, context={'request': request})
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def following(self, request, pk=None):
        profile = get_object_or_404(UserProfile, pk=pk)
        following = profile.following.all()
        serializer = UserProfileSerializer(following, many=True, context={'request': request})
        return Response(serializer.data)


class LikeViewSet(viewsets.ModelViewSet):
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Like.objects.filter(user=self.request.user)

    @action(detail=False, methods=['post'])
    def toggle(self, request):
        content_type = request.data.get('content_type')
        object_id = request.data.get('object_id')
        
        try:
            content_type_obj = ContentType.objects.get(model=content_type.lower())
            model_class = content_type_obj.model_class()
            obj = model_class.objects.get(pk=object_id)
            
            like, created = Like.objects.get_or_create(
                user=request.user,
                content_type=content_type_obj,
                object_id=object_id
            )
            
            if not created:
                like.delete()
                return Response({'status': 'unliked'})
            else:
                return Response({'status': 'liked'})
                
        except (ContentType.DoesNotExist, model_class.DoesNotExist):
            return Response({'error': 'Invalid content type or object'}, status=status.HTTP_400_BAD_REQUEST)


class CommentViewSet(viewsets.ModelViewSet):
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        content_type = self.request.query_params.get('content_type')
        object_id = self.request.query_params.get('object_id')
        
        if content_type and object_id:
            try:
                content_type_obj = ContentType.objects.get(model=content_type.lower())
                return Comment.objects.filter(
                    content_type=content_type_obj,
                    object_id=object_id,
                    parent=None
                ).order_by('-created_at')
            except ContentType.DoesNotExist:
                return Comment.objects.none()
        
        return Comment.objects.filter(user=self.request.user).order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['post'])
    def add(self, request):
        content_type = request.data.get('content_type')
        object_id = request.data.get('object_id')
        text = request.data.get('text')
        parent_id = request.data.get('parent', None)
        
        try:
            content_type_obj = ContentType.objects.get(model=content_type.lower())
            parent = Comment.objects.get(pk=parent_id) if parent_id else None
            
            comment = Comment.objects.create(
                user=request.user,
                content_type=content_type_obj,
                object_id=object_id,
                text=text,
                parent=parent
            )
            
            serializer = self.get_serializer(comment)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
            
        except (ContentType.DoesNotExist, Comment.DoesNotExist):
            return Response({'error': 'Invalid content type or parent comment'}, status=status.HTTP_400_BAD_REQUEST)


class ShareViewSet(viewsets.ModelViewSet):
    serializer_class = ShareSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Share.objects.filter(user=self.request.user).order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
        
        # Create feed item
        content_type = serializer.validated_data['content_type']
        object_id = serializer.validated_data['object_id']
        
        FeedItem.objects.create(
            user=self.request.user,
            content_type=content_type,
            object_id=object_id
        )


class FeedViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = FeedItemSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Get feed from followed users
        following_profiles = self.request.user.userprofile.following.all()
        following_users = [profile.user for profile in following_profiles]
        
        return FeedItem.objects.filter(
            user__in=following_users
        ).order_by('-created_at')

    @action(detail=False, methods=['get'])
    def timeline(self, request):
        feed_items = self.get_queryset()[:50]
        
        # Serialize with actual content objects
        result = []
        for item in feed_items:
            data = FeedItemSerializer(item).data
            # Add the actual content object based on content type
            if item.content_object:
                if item.content_type.model == 'track':
                    data['content'] = TrackSerializer(item.content_object, context={'request': request}).data
                elif item.content_type.model == 'album':
                    data['content'] = AlbumSerializer(item.content_object, context={'request': request}).data
                elif item.content_type.model == 'mixtape':
                    data['content'] = MixtapeSerializer(item.content_object, context={'request': request}).data
            result.append(data)
        
        return Response(result)


class TrendingViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = TrendingMusicSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        now = timezone.now()
        week_ago = now - timedelta(days=7)
        
        return TrendingMusic.objects.filter(
            period_start__lte=now,
            period_end__gte=now
        ).order_by('-score')

    @action(detail=False, methods=['get'])
    def weekly(self, request):
        trending = self.get_queryset()[:20]
        serializer = self.get_serializer(trending, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def featured(self, request):
        featured = self.get_queryset().filter(is_featured=True)[:10]
        serializer = self.get_serializer(featured, many=True)
        return Response(serializer.data)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def upload_music(request):
    """Handle music upload for artists"""
    if not request.user.userprofile.is_artist:
        return Response({'error': 'Only artists can upload music'}, status=status.HTTP_403_FORBIDDEN)
    
    upload_type = request.data.get('type')  # 'track', 'album', 'mixtape'
    
    if upload_type == 'track':
        # Handle single track upload
        data = {
            'title': request.data.get('title'),
            'artist': request.user.userprofile.artist.id,
            'genre': request.data.get('genre'),
            'audio_file': request.FILES.get('audio_file'),
            'is_explicit': request.data.get('is_explicit', False)
        }
        
        serializer = TrackSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    elif upload_type == 'album':
        # Handle album upload
        # Implementation for album upload
        pass
    
    elif upload_type == 'mixtape':
        # Handle mixtape upload
        # Implementation for mixtape upload
        pass
    
    return Response({'error': 'Invalid upload type'}, status=status.HTTP_400_BAD_REQUEST)
