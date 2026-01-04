from rest_framework import serializers, viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.contrib.auth.models import User
from django.core.files.storage import default_storage
from music.models import Track, Album, Artist, Genre
from api.serializers import TrackSerializer, AlbumSerializer, ArtistSerializer
from api.permissions import IsOwnerOrReadOnly


class FileUploadSerializer(serializers.ModelSerializer):
    file = serializers.FileField()
    title = serializers.CharField(max_length=200)
    artist = serializers.CharField(max_length=200)
    album = serializers.CharField(max_length=200, required=False, allow_blank=True)
    genre = serializers.CharField(max_length=100, required=False, allow_blank=True)
    track_number = serializers.IntegerField(required=False, allow_null=True)
    duration = serializers.CharField(max_length=10, required=False, allow_blank=True)
    bitrate = serializers.CharField(max_length=20, required=False, allow_blank=True)
    is_explicit = serializers.BooleanField(required=False, default=False)
    
    class Meta:
        model = Track
        fields = [
            'file', 'title', 'artist', 'album', 'genre', 'track_number', 
            'duration', 'bitrate', 'is_explicit'
        ]
    
    def create(self, validated_data):
        file = validated_data.pop('file')
        
        # Get or create artist
        artist_name = validated_data.get('artist', '')
        artist, _ = Artist.objects.get_or_create(name=artist_name)
        
        # Get or create album
        album_name = validated_data.get('album', '')
        album = None
        if album_name:
            album, _ = Album.objects.get_or_create(name=album_name, artist=artist)
        
        # Get or create genre
        genre_name = validated_data.get('genre', '')
        genre = None
        if genre_name:
            genre, _ = Genre.objects.get_or_create(name=genre_name)
        
        # Create track with uploaded file
        track = Track.objects.create(
            title=validated_data['title'],
            artist=artist,
            album=album,
            genre=genre,
            track_number=validated_data.get('track_number'),
            duration=validated_data.get('duration'),
            bitrate=validated_data.get('bitrate') or '320KBPS',
            format=validated_data.get('format') or 'MP3',
            file_size=validated_data.get('file_size') or 'Unknown',
            is_explicit=validated_data.get('is_explicit', False),
            audio_file=file
        )
        
        return track


class FileUploadViewSet(viewsets.ModelViewSet):
    serializer_class = FileUploadSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            track = serializer.save()
            return Response(TrackSerializer(track).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class BulkFileUploadSerializer(serializers.Serializer):
    files = serializers.ListField(child=serializers.FileField())
    
    def create(self, validated_data):
        tracks = []
        
        for file in validated_data['files']:
            # Create basic track data from file
            track_data = {
                'file': file,
                'title': file.name.replace('.mp3', '').replace('.wav', ''),
                'artist': 'Unknown Artist',
                'album': '',
                'genre': ''
            }
            
            serializer = FileUploadSerializer(data=track_data)
            if serializer.is_valid():
                track = serializer.save()
                tracks.append(track)
        
        return {'tracks': TrackSerializer(tracks, many=True).data}


class BulkFileUploadViewSet(viewsets.ModelViewSet):
    serializer_class = BulkFileUploadSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            result = serializer.save()
            return Response(result, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
