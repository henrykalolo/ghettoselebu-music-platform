from rest_framework import serializers
from music.models import Playlist, Track
from api.serializers import TrackSerializer


class PlaylistSerializer(serializers.ModelSerializer):
    tracks = TrackSerializer(many=True, read_only=True)
    
    class Meta:
        model = Playlist
        fields = ['id', 'name', 'description', 'user', 'tracks', 'is_public', 'cover_art', 'created_at', 'updated_at']
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']


class PlaylistCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Playlist
        fields = ['name', 'description', 'is_public', 'cover_art']


class PlaylistDetailSerializer(PlaylistSerializer):
    pass
