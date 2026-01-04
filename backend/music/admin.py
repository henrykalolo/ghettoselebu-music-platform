from django.contrib import admin
from music.models import Artist, Genre, Album, Track, Mixtape, Compilation, UserProfile
from django.contrib.auth.models import User


@admin.register(Artist)
class ArtistAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug', 'created_at', 'updated_at']
    list_filter = ['created_at']
    search_fields = ['name', 'bio']
    prepopulated_fields = {'slug': ('name',)}
    ordering = ['-created_at']


@admin.register(Genre)
class GenreAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug']
    search_fields = ['name']
    prepopulated_fields = {'slug': ('name',)}
    ordering = ['name']


class TrackInline(admin.TabularInline):
    model = Track
    extra = 0
    fields = ['title', 'track_number', 'duration', 'is_explicit', 'download_count']


@admin.register(Album)
class AlbumAdmin(admin.ModelAdmin):
    list_display = ['title', 'artist', 'release_date', 'is_explicit', 'download_count', 'created_at']
    list_filter = ['release_date', 'is_explicit', 'genre', 'created_at']
    search_fields = ['title', 'artist__name', 'description']
    prepopulated_fields = {'slug': ('title',)}
    inlines = [TrackInline]
    ordering = ['-download_count', '-created_at']


@admin.register(Track)
class TrackAdmin(admin.ModelAdmin):
    list_display = ['title', 'artist', 'album', 'is_explicit', 'download_count', 'created_at']
    list_filter = ['is_explicit', 'genre', 'created_at']
    search_fields = ['title', 'artist__name']
    prepopulated_fields = {'slug': ('title',)}
    filter_horizontal = ['featuring_artists']
    ordering = ['-download_count', '-created_at']


@admin.register(Mixtape)
class MixtapeAdmin(admin.ModelAdmin):
    list_display = ['title', 'artist', 'release_date', 'download_count', 'created_at']
    list_filter = ['release_date', 'created_at']
    search_fields = ['title', 'artist__name', 'description']
    prepopulated_fields = {'slug': ('title',)}
    ordering = ['-download_count', '-created_at']


class TrackInline(admin.TabularInline):
    model = Compilation.tracks.through
    extra = 0


@admin.register(Compilation)
class CompilationAdmin(admin.ModelAdmin):
    list_display = ['title', 'is_best_of_month', 'month', 'is_top_hits', 'year', 'download_count', 'created_at']
    list_filter = ['is_best_of_month', 'is_top_hits', 'year', 'created_at']
    search_fields = ['title', 'subtitle', 'description']
    prepopulated_fields = {'slug': ('title',)}
    filter_horizontal = ['tracks']
    exclude = ('tracks',)
    inlines = [TrackInline]
    ordering = ['-download_count', '-created_at']


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'created_at', 'updated_at']
    list_filter = ['created_at', 'updated_at']
    search_fields = ['user__username', 'user__email']
    filter_horizontal = ['favorite_tracks', 'favorite_albums', 'download_history']
    ordering = ['-created_at']
