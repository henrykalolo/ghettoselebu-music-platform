import pytest
import os
import sys

# Add the backend directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Set Django settings module
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ghettoselebu.settings')

import django
django.setup()

from django.contrib.auth.models import User
from rest_framework.test import APIClient
from music.models import Genre, Artist, Album, Track, UserProfile
from mixer.backend.django import mixer


@pytest.fixture
def api_client():
    """API client fixture for testing"""
    return APIClient()


@pytest.fixture
def authenticated_client(api_client):
    """Authenticated API client fixture"""
    user = User.objects.create_user(
        username='testuser',
        email='test@example.com',
        password='testpass123'
    )
    UserProfile.objects.create(user=user)
    api_client.force_authenticate(user=user)
    return api_client, user


@pytest.fixture
def test_genre():
    """Create a test genre"""
    return mixer.blend(Genre, name='Test Genre', slug='test-genre')


@pytest.fixture
def test_artist():
    """Create a test artist"""
    return mixer.blend(Artist, name='Test Artist', slug='test-artist')


@pytest.fixture
def test_album(test_artist, test_genre):
    """Create a test album"""
    return mixer.blend(
        Album,
        artist=test_artist,
        genre=test_genre,
        title='Test Album',
        slug='test-album'
    )


@pytest.fixture
def test_track(test_artist, test_album, test_genre):
    """Create a test track"""
    return mixer.blend(
        Track,
        title='Test Track',
        slug='test-track',
        artist=test_artist,
        album=test_album,
        genre=test_genre,
        duration=180
    )


@pytest.fixture
def sample_audio_file(tmp_path):
    """Create a sample audio file for testing"""
    audio_file = tmp_path / "test_audio.mp3"
    # Create a minimal MP3 file header for testing
    audio_file.write_bytes(b'\x00\x00\x00\x20\x66\x74\x79\x70\x69\x73\x6F\x6D\x00\x00\x02\x00\x69\x73\x6F\x6D\x69\x73\x6F\x32\x6D\x70\x34\x31\x00\x00\x00\x00')
    return audio_file


@pytest.fixture
def multiple_genres():
    """Create multiple test genres"""
    genres = []
    genre_names = ['Hip-Hop', 'Rap', 'R&B', 'Jazz', 'Rock']
    for name in genre_names:
        genre = mixer.blend(Genre, name=name, slug=name.lower().replace('&', 'r'))
        genres.append(genre)
    return genres


@pytest.fixture
def multiple_artists():
    """Create multiple test artists"""
    artists = []
    artist_names = ['Drake', 'Kendrick Lamar', 'J. Cole', 'The Weeknd', 'Travis Scott']
    for name in artist_names:
        artist = mixer.blend(Artist, name=name, slug=name.lower().replace(' ', '-'))
        artists.append(artist)
    return artists
