from django.db import models
from django.contrib.auth.models import User


class Playlist(models.Model):
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='playlists')
    tracks = models.ManyToManyField('Track', related_name='playlists', blank=True)
    is_public = models.BooleanField(default=False)
    cover_art = models.ImageField(upload_to='playlist_covers/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} by {self.user.username}"

    class Meta:
        ordering = ['-created_at']
