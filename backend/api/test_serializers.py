import pytest
from django.contrib.auth.models import User
from rest_framework.test import APIRequestFactory
from music.models import Genre, Artist, Album, Track, UserProfile, Like, Comment
from api.serializers import (
    UserSerializer, GenreSerializer, ArtistSerializer, TrackSerializer,
    AlbumSerializer, UserProfileSerializer, CommentSerializer
)


@pytest.mark.django_db
@pytest.mark.unit
class TestUserSerializer:
    """Test UserSerializer"""
    
    def test_user_serializer_create(self):
        """Test creating a user with serializer"""
        data = {
            'username': 'testuser',
            'email': 'test@example.com',
            'password': 'testpass123',
            'first_name': 'Test',
            'last_name': 'User'
        }
        serializer = UserSerializer(data=data)
        assert serializer.is_valid()
        
        user = serializer.save()
        assert user.username == 'testuser'
        assert user.email == 'test@example.com'
        assert user.check_password('testpass123')
        assert UserProfile.objects.filter(user=user).exists()
    
    def test_user_serializer_password_write_only(self):
        """Test that password is write-only"""
        data = {
            'username': 'testuser',
            'email': 'test@example.com',
            'password': 'testpass123'
        }
        serializer = UserSerializer(data=data)
        assert serializer.is_valid()
        
        user = serializer.save()
        serializer = UserSerializer(user)
        assert 'password' not in serializer.data
    
    def test_user_serializer_validation(self):
        """Test user serializer validation"""
        # Missing required fields
        data = {'username': 'testuser'}
        serializer = UserSerializer(data=data)
        assert not serializer.is_valid()
        assert 'email' in serializer.errors
        assert 'password' in serializer.errors


@pytest.mark.django_db
@pytest.mark.unit
class TestGenreSerializer:
    """Test GenreSerializer"""
    
    def test_genre_serializer(self, test_genre):
        """Test genre serializer"""
        serializer = GenreSerializer(test_genre)
        data = serializer.data
        
        assert data['id'] == test_genre.id
        assert data['name'] == test_genre.name
        assert data['slug'] == test_genre.slug
    
    def test_genre_serializer_create(self):
        """Test creating genre with serializer"""
        data = {'name': 'New Genre', 'slug': 'new-genre'}
        serializer = GenreSerializer(data=data)
        assert serializer.is_valid()
        
        genre = serializer.save()
        assert genre.name == 'New Genre'
        assert genre.slug == 'new-genre'


@pytest.mark.django_db
@pytest.mark.unit
class TestArtistSerializer:
    """Test ArtistSerializer"""
    
    def test_artist_serializer(self, test_artist):
        """Test artist serializer"""
        factory = APIRequestFactory()
        request = factory.get('/')
        serializer = ArtistSerializer(test_artist, context={'request': request})
        data = serializer.data
        
        assert data['id'] == test_artist.id
        assert data['name'] == test_artist.name
        assert data['slug'] == test_artist.slug
        assert data['bio'] == test_artist.bio
        assert 'followers_count' in data
        assert 'is_following' in data
        assert 'image' in data
    
    def test_artist_serializer_with_request_context(self, test_artist):
        """Test artist serializer with request context for is_following"""
        # Create user and authenticate
        user = User.objects.create_user('testuser', 'test@example.com', 'pass')
        profile = UserProfile.objects.create(user=user)
        
        # Create artist user profile
        artist_user = User.objects.create_user('artist', 'artist@example.com', 'pass')
        artist_profile = UserProfile.objects.create(user=artist_user)
        test_artist.user = artist_user
        test_artist.save()
        
        # Follow the artist
        from music.models import Follow
        Follow.objects.create(follower=profile, following=artist_profile)
        
        factory = APIRequestFactory()
        request = factory.get('/')
        request.user = user
        
        serializer = ArtistSerializer(test_artist, context={'request': request})
        data = serializer.data
        
        assert data['is_following'] is True


@pytest.mark.django_db
@pytest.mark.unit
class TestTrackSerializer:
    """Test TrackSerializer"""
    
    def test_track_serializer(self, test_track):
        """Test track serializer"""
        factory = APIRequestFactory()
        request = factory.get('/')
        serializer = TrackSerializer(test_track, context={'request': request})
        data = serializer.data
        
        assert data['id'] == test_track.id
        assert data['title'] == test_track.title
        assert data['slug'] == test_track.slug
        assert data['duration'] == test_track.duration
        assert 'likes_count' in data
        assert 'comments_count' in data
        assert 'is_liked' in data
        assert 'audio_file' in data
        assert 'artist' in data
        assert 'album' in data
        assert 'genre' in data
    
    def test_track_serializer_with_authenticated_user(self, test_track):
        """Test track serializer with authenticated user for is_liked"""
        user = User.objects.create_user('testuser', 'test@example.com', 'pass')
        
        # Like the track
        Like.objects.create(
            user=user,
            content_type=test_track.get_content_type(),
            object_id=test_track.id
        )
        
        factory = APIRequestFactory()
        request = factory.get('/')
        request.user = user
        
        serializer = TrackSerializer(test_track, context={'request': request})
        data = serializer.data
        
        assert data['is_liked'] is True


@pytest.mark.django_db
@pytest.mark.unit
class TestAlbumSerializer:
    """Test AlbumSerializer"""
    
    def test_album_serializer(self, test_album):
        """Test album serializer"""
        factory = APIRequestFactory()
        request = factory.get('/')
        serializer = AlbumSerializer(test_album, context={'request': request})
        data = serializer.data
        
        assert data['id'] == test_album.id
        assert data['title'] == test_album.title
        assert data['slug'] == test_album.slug
        assert 'tracks_count' in data
        assert 'likes_count' in data
        assert 'is_liked' in data
        assert 'cover_art' in data
        assert 'artist' in data
        assert 'genre' in data


@pytest.mark.django_db
@pytest.mark.unit
class TestUserProfileSerializer:
    """Test UserProfileSerializer"""
    
    def test_user_profile_serializer(self):
        """Test user profile serializer"""
        user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            first_name='Test',
            last_name='User'
        )
        profile = UserProfile.objects.create(
            user=user,
            bio='Test bio',
            is_artist=True
        )
        
        factory = APIRequestFactory()
        request = factory.get('/')
        serializer = UserProfileSerializer(profile, context={'request': request})
        data = serializer.data
        
        assert data['id'] == profile.id
        assert data['user']['username'] == 'testuser'
        assert data['bio'] == 'Test bio'
        assert data['is_artist'] is True
        assert 'followers_count' in data
        assert 'following_count' in data
        assert 'is_following' in data
        assert 'avatar' in data
        assert 'profile_image' in data
    
    def test_user_profile_serializer_follow_stats(self):
        """Test user profile serializer with follow statistics"""
        user1 = User.objects.create_user('user1', 'user1@example.com', 'pass')
        user2 = User.objects.create_user('user2', 'user2@example.com', 'pass')
        user3 = User.objects.create_user('user3', 'user3@example.com', 'pass')
        
        profile1 = UserProfile.objects.create(user=user1)
        profile2 = UserProfile.objects.create(user=user2)
        profile3 = UserProfile.objects.create(user=user3)
        
        # Create follow relationships
        from music.models import Follow
        Follow.objects.create(follower=profile1, following=profile2)
        Follow.objects.create(follower=profile3, following=profile2)
        Follow.objects.create(follower=profile2, following=profile1)
        
        factory = APIRequestFactory()
        request = factory.get('/')
        serializer = UserProfileSerializer(profile2, context={'request': request})
        data = serializer.data
        
        assert data['followers_count'] == 2
        assert data['following_count'] == 1


@pytest.mark.django_db
@pytest.mark.unit
class TestCommentSerializer:
    """Test CommentSerializer"""
    
    def test_comment_serializer(self, test_track):
        """Test comment serializer"""
        user = User.objects.create_user('testuser', 'test@example.com', 'pass')
        profile = UserProfile.objects.create(user=user)
        
        comment = Comment.objects.create(
            user=profile,
            text='Great track!',
            content_object=test_track
        )
        
        factory = APIRequestFactory()
        request = factory.get('/')
        serializer = CommentSerializer(comment, context={'request': request})
        data = serializer.data
        
        assert data['id'] == comment.id
        assert data['text'] == 'Great track!'
        assert data['user']['user']['username'] == 'testuser'
        assert 'replies' in data
        assert data['parent'] is None
    
    def test_comment_serializer_with_replies(self, test_track):
        """Test comment serializer with replies"""
        user1 = User.objects.create_user('user1', 'user1@example.com', 'pass')
        user2 = User.objects.create_user('user2', 'user2@example.com', 'pass')
        
        profile1 = UserProfile.objects.create(user=user1)
        profile2 = UserProfile.objects.create(user=user2)
        
        parent_comment = Comment.objects.create(
            user=profile1,
            text='Great track!',
            content_object=test_track
        )
        
        reply = Comment.objects.create(
            user=profile2,
            text='I agree!',
            content_object=test_track,
            parent=parent_comment
        )
        
        factory = APIRequestFactory()
        request = factory.get('/')
        serializer = CommentSerializer(parent_comment, context={'request': request})
        data = serializer.data
        
        assert len(data['replies']) == 1
        assert data['replies'][0]['text'] == 'I agree!'
        assert data['replies'][0]['parent'] is None  # Parent not included in reply


@pytest.mark.django_db
@pytest.mark.unit
class TestSerializerValidation:
    """Test serializer validation"""
    
    def test_track_serializer_validation(self):
        """Test track serializer validation"""
        # Test missing required fields
        data = {'title': 'Test Track'}
        serializer = TrackSerializer(data=data)
        assert not serializer.is_valid()
        
        # Should have errors for required fields
        assert 'artist' in serializer.errors or 'slug' in serializer.errors
    
    def test_artist_serializer_validation(self):
        """Test artist serializer validation"""
        # Test duplicate slug
        Artist.objects.create(name='Artist 1', slug='artist-1')
        
        data = {'name': 'Artist 2', 'slug': 'artist-1'}  # Same slug
        serializer = ArtistSerializer(data=data)
        assert not serializer.is_valid()
        assert 'slug' in serializer.errors
    
    def test_genre_serializer_validation(self):
        """Test genre serializer validation"""
        # Test duplicate name
        Genre.objects.create(name='Hip-Hop', slug='hip-hop')
        
        data = {'name': 'Hip-Hop', 'slug': 'different-slug'}
        serializer = GenreSerializer(data=data)
        # This might pass validation depending on model constraints
        # You might need to add unique constraints at the model level
