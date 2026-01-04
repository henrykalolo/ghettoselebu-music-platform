import pytest
from django.contrib.auth.models import User
from music.models import Genre, Artist, Album, Track, UserProfile, Follow, Like, Comment, Share


@pytest.mark.django_db
@pytest.mark.unit
class TestGenreModel:
    """Test Genre model"""
    
    def test_genre_creation(self):
        """Test creating a genre"""
        genre = Genre.objects.create(name='Hip-Hop', slug='hip-hop')
        assert genre.name == 'Hip-Hop'
        assert genre.slug == 'hip-hop'
        assert str(genre) == 'Hip-Hop'
    
    def test_genre_slug_auto_generation(self):
        """Test slug auto-generation"""
        genre = Genre.objects.create(name='R&B Music')
        assert genre.slug == 'rb-music'


@pytest.mark.django_db
@pytest.mark.unit
class TestArtistModel:
    """Test Artist model"""
    
    def test_artist_creation(self):
        """Test creating an artist"""
        artist = Artist.objects.create(
            name='Test Artist',
            slug='test-artist',
            bio='Test bio'
        )
        assert artist.name == 'Test Artist'
        assert artist.slug == 'test-artist'
        assert artist.bio == 'Test bio'
        assert not artist.is_verified
        assert str(artist) == 'Test Artist'
    
    def test_artist_followers_count(self, test_artist):
        """Test followers count property"""
        assert test_artist.followers_count == 0
        
        # Create followers
        user1 = User.objects.create_user('user1', 'user1@example.com', 'pass')
        user2 = User.objects.create_user('user2', 'user2@example.com', 'pass')
        profile1 = UserProfile.objects.create(user=user1)
        profile2 = UserProfile.objects.create(user=user2)
        
        # Create artist user profile
        artist_user = User.objects.create_user('artist', 'artist@example.com', 'pass')
        artist_profile = UserProfile.objects.create(user=artist_user)
        test_artist.user = artist_user
        test_artist.save()
        
        # Follow the artist
        Follow.objects.create(follower=profile1, following=artist_profile)
        Follow.objects.create(follower=profile2, following=artist_profile)
        
        assert test_artist.followers_count == 2


@pytest.mark.django_db
@pytest.mark.unit
class TestAlbumModel:
    """Test Album model"""
    
    def test_album_creation(self, test_artist, test_genre):
        """Test creating an album"""
        album = Album.objects.create(
            title='Test Album',
            slug='test-album',
            artist=test_artist,
            genre=test_genre
        )
        assert album.title == 'Test Album'
        assert album.artist == test_artist
        assert album.genre == test_genre
        assert str(album) == 'Test Album'
    
    def test_album_tracks_count(self, test_album):
        """Test tracks count property"""
        assert test_album.tracks_count == 0
        
        # Add tracks
        Track.objects.create(
            title='Track 1',
            slug='track-1',
            artist=test_album.artist,
            album=test_album,
            duration=180
        )
        Track.objects.create(
            title='Track 2',
            slug='track-2',
            artist=test_album.artist,
            album=test_album,
            duration=200
        )
        
        assert test_album.tracks_count == 2


@pytest.mark.django_db
@pytest.mark.unit
class TestTrackModel:
    """Test Track model"""
    
    def test_track_creation(self, test_artist, test_album, test_genre):
        """Test creating a track"""
        track = Track.objects.create(
            title='Test Track',
            slug='test-track',
            artist=test_artist,
            album=test_album,
            genre=test_genre,
            duration=180
        )
        assert track.title == 'Test Track'
        assert track.artist == test_artist
        assert track.album == test_album
        assert track.duration == 180
        assert str(track) == 'Test Track'
    
    def test_track_likes_count(self, test_track):
        """Test likes count property"""
        assert test_track.likes_count == 0
        
        # Create users and likes
        user1 = User.objects.create_user('user1', 'user1@example.com', 'pass')
        user2 = User.objects.create_user('user2', 'user2@example.com', 'pass')
        
        Like.objects.create(user=user1, content_type=test_track.get_content_type(), object_id=test_track.id)
        Like.objects.create(user=user2, content_type=test_track.get_content_type(), object_id=test_track.id)
        
        assert test_track.likes_count == 2
    
    def test_track_comments_count(self, test_track):
        """Test comments count property"""
        assert test_track.comments_count == 0
        
        # Create user and comments
        user = User.objects.create_user('user1', 'user1@example.com', 'pass')
        profile = UserProfile.objects.create(user=user)
        
        Comment.objects.create(user=profile, text='Great track!', content_object=test_track)
        Comment.objects.create(user=profile, text='Love it!', content_object=test_track)
        
        assert test_track.comments_count == 2


@pytest.mark.django_db
@pytest.mark.unit
class TestUserProfileModel:
    """Test UserProfile model"""
    
    def test_user_profile_creation(self):
        """Test creating a user profile"""
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
        assert profile.user == user
        assert profile.bio == 'Test bio'
        assert profile.is_artist
        assert str(profile) == 'testuser'
    
    def test_profile_followers_count(self):
        """Test followers count property"""
        user1 = User.objects.create_user('user1', 'user1@example.com', 'pass')
        user2 = User.objects.create_user('user2', 'user2@example.com', 'pass')
        user3 = User.objects.create_user('user3', 'user3@example.com', 'pass')
        
        profile1 = UserProfile.objects.create(user=user1)
        profile2 = UserProfile.objects.create(user=user2)
        profile3 = UserProfile.objects.create(user=user3)
        
        # profile1 follows profile2
        Follow.objects.create(follower=profile1, following=profile2)
        # profile3 follows profile2
        Follow.objects.create(follower=profile3, following=profile2)
        
        assert profile2.followers_count == 2
        assert profile2.following_count == 0
        assert profile1.following_count == 1
    
    def test_profile_is_following(self):
        """Test is_following method"""
        user1 = User.objects.create_user('user1', 'user1@example.com', 'pass')
        user2 = User.objects.create_user('user2', 'user2@example.com', 'pass')
        
        profile1 = UserProfile.objects.create(user=user1)
        profile2 = UserProfile.objects.create(user=user2)
        
        # Initially not following
        assert not profile1.is_following(profile2)
        assert not profile2.is_following(profile1)
        
        # Create follow relationship
        Follow.objects.create(follower=profile1, following=profile2)
        
        assert profile1.is_following(profile2)
        assert not profile2.is_following(profile1)


@pytest.mark.django_db
@pytest.mark.unit
class TestFollowModel:
    """Test Follow model"""
    
    def test_follow_creation(self):
        """Test creating a follow relationship"""
        user1 = User.objects.create_user('user1', 'user1@example.com', 'pass')
        user2 = User.objects.create_user('user2', 'user2@example.com', 'pass')
        
        follower = UserProfile.objects.create(user=user1)
        following = UserProfile.objects.create(user=user2)
        
        follow = Follow.objects.create(follower=follower, following=following)
        
        assert follow.follower == follower
        assert follow.following == following
        assert str(follow) == f'{follower} follows {following}'
    
    def test_self_follow_prevention(self):
        """Test that users cannot follow themselves"""
        user = User.objects.create_user('user1', 'user1@example.com', 'pass')
        profile = UserProfile.objects.create(user=user)
        
        # This should be prevented at model/view level
        # For testing, we'll just check the relationship doesn't make logical sense
        with pytest.raises(Exception):
            Follow.objects.create(follower=profile, following=profile)


@pytest.mark.django_db
@pytest.mark.unit
class TestLikeModel:
    """Test Like model"""
    
    def test_like_creation(self, test_track):
        """Test creating a like"""
        user = User.objects.create_user('user1', 'user1@example.com', 'pass')
        profile = UserProfile.objects.create(user=user)
        
        like = Like.objects.create(
            user=user,
            content_type=test_track.get_content_type(),
            object_id=test_track.id
        )
        
        assert like.user == user
        assert like.content_object == test_track
        assert str(like) == f'{user} likes {test_track}'
    
    def test_unique_like_constraint(self, test_track):
        """Test that users can only like something once"""
        user = User.objects.create_user('user1', 'user1@example.com', 'pass')
        
        Like.objects.create(
            user=user,
            content_type=test_track.get_content_type(),
            object_id=test_track.id
        )
        
        # Second like should raise an exception (unique constraint)
        with pytest.raises(Exception):
            Like.objects.create(
                user=user,
                content_type=test_track.get_content_type(),
                object_id=test_track.id
            )


@pytest.mark.django_db
@pytest.mark.unit
class TestCommentModel:
    """Test Comment model"""
    
    def test_comment_creation(self, test_track):
        """Test creating a comment"""
        user = User.objects.create_user('user1', 'user1@example.com', 'pass')
        profile = UserProfile.objects.create(user=user)
        
        comment = Comment.objects.create(
            user=profile,
            text='Great track!',
            content_object=test_track
        )
        
        assert comment.user == profile
        assert comment.text == 'Great track!'
        assert comment.content_object == test_track
        assert comment.parent is None
        assert str(comment) == f'Comment by {user} on {test_track}'
    
    def test_comment_reply(self, test_track):
        """Test creating a reply to a comment"""
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
        
        assert reply.parent == parent_comment
        assert parent_comment.replies.count() == 1
        assert reply in parent_comment.replies.all()


@pytest.mark.django_db
@pytest.mark.unit
class TestShareModel:
    """Test Share model"""
    
    def test_share_creation(self, test_track):
        """Test creating a share"""
        user = User.objects.create_user('user1', 'user1@example.com', 'pass')
        profile = UserProfile.objects.create(user=user)
        
        share = Share.objects.create(
            user=profile,
            content_object=test_track,
            caption='Check out this track!'
        )
        
        assert share.user == profile
        assert share.content_object == test_track
        assert share.caption == 'Check out this track!'
        assert str(share) == f'{user} shared {test_track}'
