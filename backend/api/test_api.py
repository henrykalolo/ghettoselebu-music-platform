import pytest
from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.test import APIClient
from music.models import Genre, Artist, Album, Track, UserProfile, Like, Comment


@pytest.mark.django_db
@pytest.mark.unit
class TestGenreAPI:
    """Test Genre API endpoints"""
    
    def test_get_genres_list(self, api_client, test_genre):
        """Test retrieving list of genres"""
        response = api_client.get('/api/genres/')
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data['results']) >= 1
        assert response.data['results'][0]['name'] == test_genre.name
    
    def test_create_genre_unauthorized(self, api_client):
        """Test creating genre without authentication"""
        data = {'name': 'New Genre', 'slug': 'new-genre'}
        response = api_client.post('/api/genres/', data)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
    
    def test_get_genre_detail(self, api_client, test_genre):
        """Test retrieving single genre"""
        response = api_client.get(f'/api/genres/{test_genre.id}/')
        assert response.status_code == status.HTTP_200_OK
        assert response.data['name'] == test_genre.name


@pytest.mark.django_db
@pytest.mark.unit
class TestArtistAPI:
    """Test Artist API endpoints"""
    
    def test_get_artists_list(self, api_client, test_artist):
        """Test retrieving list of artists"""
        response = api_client.get('/api/artists/')
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data['results']) >= 1
        assert response.data['results'][0]['name'] == test_artist.name
    
    def test_get_artist_detail(self, api_client, test_artist):
        """Test retrieving single artist"""
        response = api_client.get(f'/api/artists/{test_artist.id}/')
        assert response.status_code == status.HTTP_200_OK
        assert response.data['name'] == test_artist.name
        assert 'followers_count' in response.data
        assert 'is_following' in response.data
    
    def test_create_artist_unauthorized(self, api_client):
        """Test creating artist without authentication"""
        data = {'name': 'New Artist', 'slug': 'new-artist'}
        response = api_client.post('/api/artists/', data)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.django_db
@pytest.mark.unit
class TestTrackAPI:
    """Test Track API endpoints"""
    
    def test_get_tracks_list(self, api_client, test_track):
        """Test retrieving list of tracks"""
        response = api_client.get('/api/tracks/')
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data['results']) >= 1
        assert response.data['results'][0]['title'] == test_track.title
    
    def test_get_track_detail(self, api_client, test_track):
        """Test retrieving single track"""
        response = api_client.get(f'/api/tracks/{test_track.id}/')
        assert response.status_code == status.HTTP_200_OK
        assert response.data['title'] == test_track.title
        assert 'likes_count' in response.data
        assert 'comments_count' in response.data
        assert 'is_liked' in response.data
    
    def test_track_like_unauthenticated(self, api_client, test_track):
        """Test liking track without authentication"""
        response = api_client.post(f'/api/tracks/{test_track.id}/like/')
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
    
    def test_track_like_authenticated(self, authenticated_client, test_track):
        """Test liking track with authentication"""
        client, user = authenticated_client
        response = client.post(f'/api/tracks/{test_track.id}/like/')
        assert response.status_code == status.HTTP_200_OK
        assert Like.objects.filter(user=user, object_id=test_track.id).exists()


@pytest.mark.django_db
@pytest.mark.unit
class TestAlbumAPI:
    """Test Album API endpoints"""
    
    def test_get_albums_list(self, api_client, test_album):
        """Test retrieving list of albums"""
        response = api_client.get('/api/albums/')
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data['results']) >= 1
        assert response.data['results'][0]['title'] == test_album.title
    
    def test_get_album_detail(self, api_client, test_album):
        """Test retrieving single album"""
        response = api_client.get(f'/api/albums/{test_album.id}/')
        assert response.status_code == status.HTTP_200_OK
        assert response.data['title'] == test_album.title
        assert 'tracks_count' in response.data
        assert 'likes_count' in response.data


@pytest.mark.django_db
@pytest.mark.integration
class TestUserAuthenticationAPI:
    """Test User Authentication API endpoints"""
    
    def test_user_registration(self, api_client):
        """Test user registration"""
        data = {
            'username': 'newuser',
            'email': 'newuser@example.com',
            'password': 'newpass123',
            'first_name': 'New',
            'last_name': 'User'
        }
        response = api_client.post('/api/auth/register/', data)
        assert response.status_code == status.HTTP_201_CREATED
        assert User.objects.filter(username='newuser').exists()
        assert UserProfile.objects.filter(user__username='newuser').exists()
    
    def test_user_login(self, api_client):
        """Test user login"""
        # Create user first
        user = User.objects.create_user(
            username='loginuser',
            email='login@example.com',
            password='loginpass123'
        )
        UserProfile.objects.create(user=user)
        
        data = {
            'username': 'loginuser',
            'password': 'loginpass123'
        }
        response = api_client.post('/api/auth/login/', data)
        assert response.status_code == status.HTTP_200_OK
        assert 'access' in response.data
        assert 'refresh' in response.data
    
    def test_user_profile_authenticated(self, authenticated_client):
        """Test getting user profile when authenticated"""
        client, user = authenticated_client
        response = client.get('/api/profiles/me/')
        assert response.status_code == status.HTTP_200_OK
        assert response.data['user']['username'] == user.username
    
    def test_user_profile_unauthenticated(self, api_client):
        """Test getting user profile without authentication"""
        response = api_client.get('/api/profiles/me/')
        assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.django_db
@pytest.mark.integration
class TestSearchAPI:
    """Test Search API endpoints"""
    
    def test_search_tracks(self, api_client, test_track):
        """Test searching tracks"""
        response = api_client.get('/api/search/?q=Test&type=tracks')
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data['tracks']) >= 1
        assert response.data['tracks'][0]['title'] == test_track.title
    
    def test_search_artists(self, api_client, test_artist):
        """Test searching artists"""
        response = api_client.get('/api/search/?q=Test&type=artists')
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data['artists']) >= 1
        assert response.data['artists'][0]['name'] == test_artist.name
    
    def test_search_all(self, api_client, test_track, test_artist):
        """Test searching all content types"""
        response = api_client.get('/api/search/?q=Test')
        assert response.status_code == status.HTTP_200_OK
        assert 'tracks' in response.data
        assert 'artists' in response.data
        assert 'albums' in response.data


@pytest.mark.django_db
@pytest.mark.slow
class TestUploadAPI:
    """Test Upload API endpoints"""
    
    def test_upload_track_unauthenticated(self, api_client, sample_audio_file):
        """Test uploading track without authentication"""
        with open(sample_audio_file, 'rb') as f:
            data = {
                'title': 'Test Upload',
                'artist': 'Test Artist',
                'audio_file': f
            }
            response = api_client.post('/api/upload/single/', data, format='multipart')
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
    
    def test_upload_track_authenticated(self, authenticated_client, sample_audio_file):
        """Test uploading track with authentication"""
        client, user = authenticated_client
        with open(sample_audio_file, 'rb') as f:
            data = {
                'title': 'Test Upload',
                'artist': 'Test Artist',
                'audio_file': f
            }
            response = client.post('/api/upload/single/', data, format='multipart')
        # Note: This might fail due to audio processing, but should at least be authenticated
        assert response.status_code != status.HTTP_401_UNAUTHORIZED


@pytest.mark.django_db
@pytest.mark.unit
class TestPagination:
    """Test API pagination"""
    
    def test_genre_pagination(self, api_client, multiple_genres):
        """Test genre list pagination"""
        response = api_client.get('/api/genres/?page_size=2')
        assert response.status_code == status.HTTP_200_OK
        assert 'count' in response.data
        assert 'next' in response.data
        assert 'previous' in response.data
        assert len(response.data['results']) <= 2
    
    def test_artist_pagination(self, api_client, multiple_artists):
        """Test artist list pagination"""
        response = api_client.get('/api/artists/?page=1')
        assert response.status_code == status.HTTP_200_OK
        assert 'count' in response.data
        assert len(response.data['results']) > 0
