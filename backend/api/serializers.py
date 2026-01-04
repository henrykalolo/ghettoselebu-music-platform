from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.contenttypes.models import ContentType
from music.models import (
    Artist, Album, Track, Mixtape, Genre, UserProfile, 
    Follow, Like, Comment, Share, FeedItem, TrendingMusic, Compilation
)


class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'password']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User.objects.create_user(**validated_data)
        user.set_password(password)
        user.save()
        UserProfile.objects.create(user=user)
        return user


class GenreSerializer(serializers.ModelSerializer):
    class Meta:
        model = Genre
        fields = ['id', 'name', 'slug']


class ArtistSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    followers_count = serializers.ReadOnlyField()
    is_following = serializers.SerializerMethodField()
    image = serializers.SerializerMethodField()
    
    class Meta:
        model = Artist
        fields = [
            'id', 'name', 'slug', 'bio', 'image', 'user', 'is_verified',
            'followers_count', 'is_following', 'created_at', 'updated_at'
        ]

    def get_image(self, obj):
        if obj.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None

    def get_is_following(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated and obj.user:
            try:
                current_profile = request.user.userprofile
                return current_profile.is_following(obj.user.userprofile)
            except UserProfile.DoesNotExist:
                return False
        return False


class ArtistDetailSerializer(ArtistSerializer):
    albums = serializers.SerializerMethodField()
    tracks = serializers.SerializerMethodField()
    mixtapes = serializers.SerializerMethodField()

    class Meta(ArtistSerializer.Meta):
        fields = ArtistSerializer.Meta.fields + ['albums', 'tracks', 'mixtapes']

    def get_albums(self, obj):
        return AlbumSerializer(obj.albums.all()[:10], many=True, context=self.context).data

    def get_tracks(self, obj):
        return TrackSerializer(obj.tracks.all()[:10], many=True, context=self.context).data

    def get_mixtapes(self, obj):
        return MixtapeSerializer(obj.mixtapes.all()[:10], many=True, context=self.context).data


class TrackSerializer(serializers.ModelSerializer):
    artist = ArtistSerializer(read_only=True)
    featuring_artists = ArtistSerializer(many=True, read_only=True)
    genre = GenreSerializer(read_only=True)
    album = serializers.StringRelatedField(read_only=True)
    likes_count = serializers.SerializerMethodField()
    comments_count = serializers.SerializerMethodField()
    is_liked = serializers.SerializerMethodField()
    audio_file = serializers.SerializerMethodField()
    optimized_file = serializers.SerializerMethodField()

    class Meta:
        model = Track
        fields = [
            'id', 'title', 'slug', 'artist', 'album', 'genre', 'featuring_artists',
            'track_number', 'duration', 'audio_file', 'optimized_file', 'file_size', 'bitrate',
            'format', 'is_explicit', 'download_count', 'likes_count',
            'comments_count', 'is_liked', 'created_at', 'updated_at',
            # Metadata fields
            'original_filename', 'extracted_title', 'extracted_artist', 'extracted_album',
            'extracted_year', 'extracted_genre', 'extracted_track_number',
            # Processing info
            'is_processed', 'processed_at', 'has_site_branding', 'is_optimized'
        ]

    def get_audio_file(self, obj):
        if obj.audio_file:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.audio_file.url)
            return obj.audio_file.url
        return None

    def get_optimized_file(self, obj):
        if obj.optimized_file:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.optimized_file.url)
            return obj.optimized_file.url
        return None

    def get_likes_count(self, obj):
        return Like.objects.filter(
            content_type=ContentType.objects.get_for_model(Track),
            object_id=obj.id
        ).count()

    def get_comments_count(self, obj):
        return Comment.objects.filter(
            content_type=ContentType.objects.get_for_model(Track),
            object_id=obj.id
        ).count()

    def get_is_liked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return Like.objects.filter(
                user=request.user,
                content_type=ContentType.objects.get_for_model(Track),
                object_id=obj.id
            ).exists()
        return False


class TrackDetailSerializer(TrackSerializer):
    album_details = serializers.SerializerMethodField()

    class Meta(TrackSerializer.Meta):
        fields = TrackSerializer.Meta.fields + ['album_details']

    def get_album_details(self, obj):
        if obj.album:
            return AlbumSerializer(obj.album, context=self.context).data
        return None


class AlbumSerializer(serializers.ModelSerializer):
    artist = ArtistSerializer(read_only=True)
    genre = GenreSerializer(read_only=True)
    tracks_count = serializers.SerializerMethodField()
    likes_count = serializers.SerializerMethodField()
    comments_count = serializers.SerializerMethodField()
    is_liked = serializers.SerializerMethodField()
    cover_art = serializers.SerializerMethodField()

    class Meta:
        model = Album
        fields = [
            'id', 'title', 'slug', 'artist', 'genre', 'release_date',
            'cover_art', 'description', 'is_explicit', 'bitrate', 'format',
            'download_count', 'tracks_count', 'likes_count', 'comments_count',
            'is_liked', 'created_at', 'updated_at'
        ]

    def get_cover_art(self, obj):
        if obj.cover_art:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.cover_art.url)
            return obj.cover_art.url
        return None

    def get_tracks_count(self, obj):
        return obj.tracks.count()

    def get_likes_count(self, obj):
        return Like.objects.filter(
            content_type=ContentType.objects.get_for_model(Album),
            object_id=obj.id
        ).count()

    def get_comments_count(self, obj):
        return Comment.objects.filter(
            content_type=ContentType.objects.get_for_model(Album),
            object_id=obj.id
        ).count()

    def get_is_liked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return Like.objects.filter(
                user=request.user,
                content_type=ContentType.objects.get_for_model(Album),
                object_id=obj.id
            ).exists()
        return False


class AlbumDetailSerializer(AlbumSerializer):
    tracks = TrackSerializer(many=True, read_only=True)

    class Meta(AlbumSerializer.Meta):
        fields = AlbumSerializer.Meta.fields + ['tracks']


class MixtapeSerializer(serializers.ModelSerializer):
    artist = ArtistSerializer(read_only=True)
    likes_count = serializers.SerializerMethodField()
    comments_count = serializers.SerializerMethodField()
    is_liked = serializers.SerializerMethodField()
    
    class Meta:
        model = Mixtape
        fields = [
            'id', 'title', 'slug', 'artist', 'cover_art', 'description',
            'release_date', 'download_count', 'likes_count', 'comments_count',
            'is_liked', 'created_at', 'updated_at'
        ]

    def get_likes_count(self, obj):
        return Like.objects.filter(
            content_type=ContentType.objects.get_for_model(Mixtape),
            object_id=obj.id
        ).count()

    def get_comments_count(self, obj):
        return Comment.objects.filter(
            content_type=ContentType.objects.get_for_model(Mixtape),
            object_id=obj.id
        ).count()

    def get_is_liked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return Like.objects.filter(
                user=request.user,
                content_type=ContentType.objects.get_for_model(Mixtape),
                object_id=obj.id
            ).exists()
        return False


class MixtapeDetailSerializer(MixtapeSerializer):
    tracks = TrackSerializer(many=True, read_only=True)

    class Meta(MixtapeSerializer.Meta):
        fields = MixtapeSerializer.Meta.fields + ['tracks']


class CompilationSerializer(serializers.ModelSerializer):
    tracks_count = serializers.SerializerMethodField()

    class Meta:
        model = Compilation
        fields = [
            'id', 'title', 'slug', 'subtitle', 'cover_art', 'description',
            'is_best_of_month', 'month', 'is_top_hits', 'year',
            'download_count', 'tracks_count', 'created_at'
        ]

    def get_tracks_count(self, obj):
        return obj.tracks.count()


class CompilationDetailSerializer(CompilationSerializer):
    tracks = TrackSerializer(many=True, read_only=True)

    class Meta(CompilationSerializer.Meta):
        fields = CompilationSerializer.Meta.fields + ['tracks']


class UserProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    followers_count = serializers.SerializerMethodField()
    following_count = serializers.SerializerMethodField()
    is_following = serializers.SerializerMethodField()
    favorite_tracks = TrackSerializer(many=True, read_only=True)
    favorite_albums = AlbumSerializer(many=True, read_only=True)
    download_history = TrackSerializer(many=True, read_only=True)
    avatar = serializers.SerializerMethodField()
    profile_image = serializers.SerializerMethodField()
    
    class Meta:
        model = UserProfile
        fields = [
            'id', 'user', 'bio', 'profile_image', 'avatar', 'is_artist',
            'followers_count', 'following_count', 'is_following',
            'favorite_tracks', 'favorite_albums', 'download_history',
            'created_at', 'updated_at'
        ]

    def get_avatar(self, obj):
        if obj.avatar:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.avatar.url)
            return obj.avatar.url
        return None

    def get_profile_image(self, obj):
        if obj.profile_image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.profile_image.url)
            return obj.profile_image.url
        return None

    def get_followers_count(self, obj):
        return obj.followers.count()

    def get_following_count(self, obj):
        return obj.following.count()

    def get_is_following(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            try:
                current_profile = request.user.userprofile
                return current_profile.is_following(obj)
            except UserProfile.DoesNotExist:
                return False
        return False


class CommentSerializer(serializers.ModelSerializer):
    user = UserProfileSerializer(read_only=True)
    replies = serializers.SerializerMethodField()
    
    class Meta:
        model = Comment
        fields = [
            'id', 'user', 'text', 'parent', 'replies',
            'created_at', 'updated_at'
        ]

    def get_replies(self, obj):
        replies = Comment.objects.filter(parent=obj)
        return CommentSerializer(replies, many=True, context=self.context).data


class ShareSerializer(serializers.ModelSerializer):
    user = UserProfileSerializer(read_only=True)
    content_type = serializers.StringRelatedField(read_only=True)
    
    class Meta:
        model = Share
        fields = ['id', 'user', 'content_type', 'object_id', 'caption', 'created_at']


class FeedItemSerializer(serializers.ModelSerializer):
    user = UserProfileSerializer(read_only=True)
    content_type = serializers.StringRelatedField(read_only=True)
    
    class Meta:
        model = FeedItem
        fields = ['id', 'user', 'content_type', 'object_id', 'created_at']


class TrendingMusicSerializer(serializers.ModelSerializer):
    content_type = serializers.StringRelatedField(read_only=True)
    
    class Meta:
        model = TrendingMusic
        fields = [
            'id', 'content_type', 'object_id', 'score', 'period_start',
            'period_end', 'is_featured', 'created_at', 'updated_at'
        ]


class FollowSerializer(serializers.ModelSerializer):
    follower = UserProfileSerializer(read_only=True)
    following = UserProfileSerializer(read_only=True)
    
    class Meta:
        model = Follow
        fields = ['id', 'follower', 'following', 'created_at']
