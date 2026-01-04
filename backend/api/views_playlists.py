from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.contrib.auth.models import User
from music.models import Playlist, Track
from api.serializers_playlists import PlaylistSerializer, PlaylistCreateSerializer, PlaylistDetailSerializer
from api.permissions import IsOwnerOrReadOnly


class PlaylistViewSet(viewsets.ModelViewSet):
    serializer_class = PlaylistSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        if self.request.user.is_authenticated:
            return Playlist.objects.filter(user=self.request.user)
        return Playlist.objects.filter(is_public=True)
    
    def retrieve(self, request, pk=None):
        playlist = get_object_or_404(Playlist.objects.select_related('tracks').prefetch_related('tracks__artist'), pk=pk)
        serializer = PlaylistDetailSerializer(playlist)
        
        # Check if user can access this playlist
        if not playlist.is_public and playlist.user != request.user:
            return Response({'error': 'You do not have permission to view this playlist'}, 
                          status=status.HTTP_403_FORBIDDEN)
        
        return Response(serializer.data)
    
    def create(self, request):
        serializer = PlaylistCreateSerializer(data=request.data)
        if serializer.is_valid():
            playlist = serializer.save(user=request.user)
            return Response(PlaylistSerializer(playlist).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def update(self, request, pk=None):
        playlist = get_object_or_404(Playlist.objects, pk=pk, user=request.user)
        serializer = PlaylistSerializer(playlist, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(PlaylistSerializer(playlist).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def destroy(self, request, pk=None):
        playlist = get_object_or_404(Playlist.objects, pk=pk, user=request.user)
        playlist.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    
    @action(detail=True, methods=['post'])
    def add_track(self, request, pk=None):
        playlist = get_object_or_404(Playlist.objects, pk=pk, user=request.user)
        track_id = request.data.get('track_id')
        
        try:
            track = Track.objects.get(id=track_id)
            playlist.tracks.add(track)
            return Response({'message': 'Track added to playlist successfully'}, 
                          status=status.HTTP_200_OK)
        except Track.DoesNotExist:
            return Response({'error': 'Track not found'}, 
                          status=status.HTTP_404_NOT_FOUND)
    
    @action(detail=True, methods=['post'])
    def remove_track(self, request, pk=None):
        playlist = get_object_or_404(Playlist.objects, pk=pk, user=request.user)
        track_id = request.data.get('track_id')
        
        try:
            track = Track.objects.get(id=track_id)
            playlist.tracks.remove(track)
            return Response({'message': 'Track removed from playlist successfully'}, 
                          status=status.HTTP_200_OK)
        except Track.DoesNotExist:
            return Response({'error': 'Track not found'}, 
                          status=status.HTTP_404_NOT_FOUND)
    
    @action(detail=True, methods=['post'])
    def duplicate(self, request, pk=None):
        playlist = get_object_or_404(Playlist.objects, pk=pk, user=request.user)
        
        # Create a new playlist with same tracks
        new_playlist = Playlist.objects.create(
            user=request.user,
            name=f"{playlist.name} (Copy)",
            description=playlist.description,
            is_public=False,
            tracks=playlist.tracks.all()
        )
        
        serializer = PlaylistSerializer(new_playlist)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
