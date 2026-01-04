from rest_framework import serializers
from music.models import Notification, Track, Album, Mixtape
from django.contrib.contenttypes.models import ContentType

class NotificationSerializer(serializers.ModelSerializer):
    related_object = serializers.SerializerMethodField()
    
    class Meta:
        model = Notification
        fields = [
            'id', 'type', 'title', 'message', 'related_object', 
            'related_object_type', 'related_object_id', 'is_read', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']
    
    def get_related_object(self, obj):
        """Get related object details"""
        if obj.related_object_type and obj.related_object_id:
            try:
                content_type = obj.related_object_type
                model_class = content_type.model_class()
                
                if model_class == Track:
                    track = Track.objects.get(id=obj.related_object_id)
                    return {
                        'type': 'track',
                        'id': track.id,
                        'title': track.title,
                        'artist': track.artist.name,
                        'slug': track.slug
                    }
                elif model_class == Album:
                    album = Album.objects.get(id=obj.related_object_id)
                    return {
                        'type': 'album',
                        'id': album.id,
                        'title': album.title,
                        'artist': album.artist.name,
                        'slug': album.slug
                    }
                elif model_class == Mixtape:
                    mixtape = Mixtape.objects.get(id=obj.related_object_id)
                    return {
                        'type': 'mixtape',
                        'id': mixtape.id,
                        'title': mixtape.title,
                        'artist': mixtape.artist.name,
                        'slug': mixtape.slug
                    }
            except Exception:
                pass
        
        return None

class NotificationCountSerializer(serializers.Serializer):
    total = serializers.IntegerField()
    unread = serializers.IntegerField()
    social = serializers.IntegerField()
    milestones = serializers.IntegerField()
    system = serializers.IntegerField()

class NotificationSettingsSerializer(serializers.Serializer):
    social_notifications = serializers.BooleanField(default=True)
    milestone_notifications = serializers.BooleanField(default=True)
    system_notifications = serializers.BooleanField(default=True)
    like_notifications = serializers.BooleanField(default=True)
    comment_notifications = serializers.BooleanField(default=True)
    follow_notifications = serializers.BooleanField(default=True)
