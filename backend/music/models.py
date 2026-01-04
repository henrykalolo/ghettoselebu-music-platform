from django.db import models
from django.contrib.auth.models import User
from django.urls import reverse
from django.template.defaultfilters import slugify
from django.conf import settings
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType


class Artist(models.Model):
    name = models.CharField(max_length=200, unique=True)
    slug = models.SlugField(max_length=200, unique=True, blank=True)
    bio = models.TextField(blank=True)
    image = models.ImageField(upload_to='artists/', blank=True, null=True)
    user = models.OneToOneField(User, on_delete=models.CASCADE, null=True, blank=True, related_name='artist_profile')
    is_verified = models.BooleanField(default=False)
    followers_count = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name

    def get_absolute_url(self):
        return reverse('artist-detail', kwargs={'slug': self.slug})


class Genre(models.Model):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=100, unique=True, blank=True)

    class Meta:
        ordering = ['name']

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class Album(models.Model):
    title = models.CharField(max_length=300)
    slug = models.SlugField(max_length=300, unique=True, blank=True)
    artist = models.ForeignKey(Artist, on_delete=models.CASCADE, related_name='albums')
    genre = models.ForeignKey(Genre, on_delete=models.SET_NULL, null=True, blank=True)
    release_date = models.DateField(null=True, blank=True)
    cover_art = models.ImageField(upload_to='albums/', blank=True, null=True)
    description = models.TextField(blank=True)
    is_explicit = models.BooleanField(default=False)
    bitrate = models.CharField(max_length=10, default='320KBPS')
    format = models.CharField(max_length=10, default='MP3')
    download_count = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(f"{self.artist.name}-{self.title}")
            unique_slug = base_slug
            counter = 1
            while Album.objects.filter(slug=unique_slug).exists():
                unique_slug = f"{base_slug}-{counter}"
                counter += 1
            self.slug = unique_slug
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.artist.name} - {self.title}"

    def get_absolute_url(self):
        return reverse('album-detail', kwargs={'slug': self.slug})


class Track(models.Model):
    title = models.CharField(max_length=300)
    slug = models.SlugField(max_length=300, unique=True, blank=True)
    artist = models.ForeignKey(Artist, on_delete=models.CASCADE, related_name='tracks')
    album = models.ForeignKey(Album, on_delete=models.CASCADE, related_name='tracks', null=True, blank=True)
    genre = models.ForeignKey(Genre, on_delete=models.SET_NULL, null=True, blank=True)
    featuring_artists = models.ManyToManyField(Artist, blank=True, related_name='featured_tracks')
    track_number = models.PositiveIntegerField(null=True, blank=True)
    duration = models.DurationField(null=True, blank=True)
    audio_file = models.FileField(upload_to='tracks/', blank=True, null=True)
    file_size = models.CharField(max_length=20, blank=True)
    bitrate = models.CharField(max_length=10, default='320KBPS')
    format = models.CharField(max_length=10, default='MP3')
    is_explicit = models.BooleanField(default=False)
    
    original_filename = models.CharField(max_length=500, blank=True)
    extracted_title = models.CharField(max_length=300, blank=True)
    extracted_artist = models.CharField(max_length=300, blank=True)
    extracted_album = models.CharField(max_length=300, blank=True)
    extracted_year = models.CharField(max_length=10, blank=True)
    extracted_genre = models.CharField(max_length=100, blank=True)
    extracted_track_number = models.CharField(max_length=10, blank=True)
    
    is_processed = models.BooleanField(default=False)
    processed_at = models.DateTimeField(null=True, blank=True)
    has_site_branding = models.BooleanField(default=False)
    
    is_optimized = models.BooleanField(default=False)
    optimized_file = models.FileField(upload_to='tracks/optimized/', blank=True, null=True)
    
    download_count = models.PositiveIntegerField(default=0)
    likes_count = models.PositiveIntegerField(default=0)
    comments_count = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(f"{self.artist.name}-{self.title}")
            unique_slug = base_slug
            counter = 1
            while Track.objects.filter(slug=unique_slug).exists():
                unique_slug = f"{base_slug}-{counter}"
                counter += 1
            self.slug = unique_slug
        super().save(*args, **kwargs)

    def __str__(self):
        featuring = f" (feat. {', '.join([artist.name for artist in self.featuring_artists.all()])})" if self.featuring_artists.exists() else ""
        return f"{self.artist.name} - {self.title}{featuring}"

    def get_absolute_url(self):
        return reverse('track-detail', kwargs={'slug': self.slug})


class Mixtape(models.Model):
    title = models.CharField(max_length=300)
    slug = models.SlugField(max_length=300, unique=True, blank=True)
    artist = models.ForeignKey(Artist, on_delete=models.CASCADE, related_name='mixtapes')
    cover_art = models.ImageField(upload_to='mixtapes/', blank=True, null=True)
    description = models.TextField(blank=True)
    release_date = models.DateField(null=True, blank=True)
    download_count = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(f"{self.artist.name}-{self.title}")
            unique_slug = base_slug
            counter = 1
            while Mixtape.objects.filter(slug=unique_slug).exists():
                unique_slug = f"{base_slug}-{counter}"
                counter += 1
            self.slug = unique_slug
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.artist.name} - {self.title}"

    def get_absolute_url(self):
        return reverse('mixtape-detail', kwargs={'slug': self.slug})


class Compilation(models.Model):
    title = models.CharField(max_length=300)
    slug = models.SlugField(max_length=300, unique=True, blank=True)
    subtitle = models.CharField(max_length=300, blank=True)
    cover_art = models.ImageField(upload_to='compilations/', blank=True, null=True)
    description = models.TextField(blank=True)
    tracks = models.ManyToManyField(Track, related_name='compilations')
    is_best_of_month = models.BooleanField(default=False)
    month = models.DateField(null=True, blank=True)
    is_top_hits = models.BooleanField(default=False)
    year = models.PositiveIntegerField(null=True, blank=True)
    download_count = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title

    def get_absolute_url(self):
        return reverse('compilation-detail', kwargs={'slug': self.slug})


class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    bio = models.TextField(max_length=500, blank=True)
    profile_image = models.ImageField(upload_to='profiles/', blank=True, null=True)
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)
    is_artist = models.BooleanField(default=False)
    favorite_tracks = models.ManyToManyField(Track, blank=True, related_name='favorited_by')
    favorite_albums = models.ManyToManyField(Album, blank=True, related_name='favorited_by')
    download_history = models.ManyToManyField(Track, blank=True, related_name='downloaded_by')
    following = models.ManyToManyField('self', symmetrical=False, blank=True, related_name='followers')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username}'s Profile"

    def follow_user(self, user_profile):
        if user_profile != self:
            self.following.add(user_profile)
            return True
        return False

    def unfollow_user(self, user_profile):
        self.following.remove(user_profile)
        return True

    def is_following(self, user_profile):
        return self.following.filter(pk=user_profile.pk).exists()


class Follow(models.Model):
    follower = models.ForeignKey(User, on_delete=models.CASCADE, related_name='following_relations')
    following = models.ForeignKey(User, on_delete=models.CASCADE, related_name='follower_relations')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('follower', 'following')
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.follower.username} follows {self.following.username}"


class Like(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = models.PositiveIntegerField()
    content_object = GenericForeignKey('content_type', 'object_id')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'content_type', 'object_id')
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username} likes {self.content_object}"


class Comment(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = models.PositiveIntegerField()
    content_object = GenericForeignKey('content_type', 'object_id')
    text = models.TextField()
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='replies')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Comment by {self.user.username} on {self.content_object}"


class Share(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = models.PositiveIntegerField()
    content_object = GenericForeignKey('content_type', 'object_id')
    caption = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username} shared {self.content_object}"


class FeedItem(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='feed_items')
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = models.PositiveIntegerField()
    content_object = GenericForeignKey('content_type', 'object_id')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', '-created_at']),
            models.Index(fields=['-created_at']),
        ]

    def __str__(self):
        return f"Feed item for {self.user.username}: {self.content_object}"


class TrendingMusic(models.Model):
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = models.PositiveIntegerField()
    content_object = GenericForeignKey('content_type', 'object_id')
    score = models.FloatField(default=0.0)
    period_start = models.DateTimeField()
    period_end = models.DateTimeField()
    is_featured = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-score', '-created_at']
        unique_together = ('content_type', 'object_id', 'period_start', 'period_end')

    def __str__(self):
        return f"Trending: {self.content_object}"


class Notification(models.Model):
    NOTIFICATION_TYPES = [
        ('social', 'Social'),
        ('milestone', 'Milestone'),
        ('system', 'System'),
        ('like', 'Like'),
        ('comment', 'Comment'),
        ('share', 'Share'),
        ('follow', 'Follow'),
        ('mention', 'Mention'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    type = models.CharField(max_length=20, choices=NOTIFICATION_TYPES)
    title = models.CharField(max_length=200)
    message = models.TextField()
    related_object_type = models.ForeignKey(ContentType, on_delete=models.CASCADE, null=True, blank=True)
    related_object_id = models.PositiveIntegerField(null=True, blank=True)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', '-created_at']),
            models.Index(fields=['user', 'is_read']),
            models.Index(fields=['type', '-created_at']),
        ]
    
    def __str__(self):
        return f"{self.user.username} - {self.title}"


from .models_playlists import Playlist
