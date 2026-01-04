import os
import tempfile
from django.utils import timezone
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.core.files.uploadedfile import UploadedFile
from music.models import Track, Artist, Album, Genre
from .serializers import TrackSerializer
from audio_utils import AudioProcessor
import logging

logger = logging.getLogger(__name__)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def upload_and_process_track(request):
    """
    Upload and process audio track with metadata extraction and site branding
    """
    try:
        audio_file = request.FILES.get('audio_file')
        if not audio_file:
            return Response(
                {'error': 'No audio file provided'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validate file type
        allowed_types = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/flac', 'audio/ogg']
        if audio_file.content_type not in allowed_types:
            return Response(
                {'error': 'Invalid file type. Please upload MP3, WAV, FLAC, or OGG files.'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get form data
        title = request.POST.get('title', '')
        artist_id = request.POST.get('artist')
        album_id = request.POST.get('album')
        genre_id = request.POST.get('genre')
        track_number = request.POST.get('track_number')
        is_explicit = request.POST.get('is_explicit', 'false').lower() == 'true'
        
        # Validate required fields
        if not title or not artist_id:
            return Response(
                {'error': 'Title and artist are required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get artist
        try:
            artist = Artist.objects.get(id=artist_id)
        except Artist.DoesNotExist:
            return Response(
                {'error': 'Artist not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Get album if provided
        album = None
        if album_id:
            try:
                album = Album.objects.get(id=album_id)
            except Album.DoesNotExist:
                return Response(
                    {'error': 'Album not found'}, 
                    status=status.HTTP_404_NOT_FOUND
                )
        
        # Get genre if provided
        genre = None
        if genre_id:
            try:
                genre = Genre.objects.get(id=genre_id)
            except Genre.DoesNotExist:
                return Response(
                    {'error': 'Genre not found'}, 
                    status=status.HTTP_404_NOT_FOUND
                )
        
        # Initialize audio processor
        processor = AudioProcessor()
        
        # Save uploaded file temporarily
        with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(audio_file.name)[1]) as temp_file:
            for chunk in audio_file.chunks():
                temp_file.write(chunk)
            temp_file_path = temp_file.name
        
        try:
            # Extract metadata from uploaded file
            extracted_metadata = processor.extract_metadata(temp_file_path)
            
            # Process audio file with site branding
            processed_file_path = processor.embed_metadata(
                temp_file_path, 
                {'title': title, 'album': album.title if album else ''},
                {'name': artist.name}
            )
            
            # Optimize for streaming
            optimized_file_path = processor.optimize_for_streaming(processed_file_path)
            
            # Create track record
            track = Track.objects.create(
                title=title,
                artist=artist,
                album=album,
                genre=genre,
                track_number=int(track_number) if track_number else None,
                is_explicit=is_explicit,
                original_filename=audio_file.name,
                extracted_title=extracted_metadata.get('title', ''),
                extracted_artist=extracted_metadata.get('artist', ''),
                extracted_album=extracted_metadata.get('album', ''),
                extracted_year=str(extracted_metadata.get('year', '')),
                extracted_genre=extracted_metadata.get('genre', ''),
                extracted_track_number=str(extracted_metadata.get('track_number', '')),
                is_processed=True,
                processed_at=timezone.now(),
                has_site_branding=True,
                is_optimized=True
            )
            
            # Save processed audio files
            with open(processed_file_path, 'rb') as f:
                track.audio_file.save(f"processed_{audio_file.name}", UploadedFile(f))
            
            with open(optimized_file_path, 'rb') as f:
                track.optimized_file.save(f"optimized_{audio_file.name}", UploadedFile(f))
            
            # Set file size and duration
            audio_info = processor.get_audio_info(optimized_file_path)
            track.file_size = f"{audio_info.get('file_size', 0)} bytes"
            track.duration = timezone.timedelta(seconds=audio_info.get('duration_seconds', 0))
            track.save()
            
            # Clean up temporary files
            os.unlink(temp_file_path)
            if processed_file_path != temp_file_path:
                os.unlink(processed_file_path)
            if optimized_file_path != processed_file_path:
                os.unlink(optimized_file_path)
            
            # Return serialized track data
            serializer = TrackSerializer(track, context={'request': request})
            return Response({
                'message': 'Track uploaded and processed successfully',
                'track': serializer.data,
                'extracted_metadata': extracted_metadata,
                'processing_info': {
                    'is_processed': track.is_processed,
                    'has_site_branding': track.has_site_branding,
                    'is_optimized': track.is_optimized,
                    'processed_at': track.processed_at
                }
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            logger.error(f"Error processing audio file: {e}")
            # Clean up temporary file on error
            if os.path.exists(temp_file_path):
                os.unlink(temp_file_path)
            return Response(
                {'error': f'Error processing audio file: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
            
    except Exception as e:
        logger.error(f"Error in upload_and_process_track: {e}")
        return Response(
            {'error': f'Server error: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_audio_processing_status(request, track_id):
    """
    Get processing status for a track
    """
    try:
        track = Track.objects.get(id=track_id)
        return Response({
            'is_processed': track.is_processed,
            'has_site_branding': track.has_site_branding,
            'is_optimized': track.is_optimized,
            'processed_at': track.processed_at,
            'original_filename': track.original_filename,
            'extracted_metadata': {
                'title': track.extracted_title,
                'artist': track.extracted_artist,
                'album': track.extracted_album,
                'year': track.extracted_year,
                'genre': track.extracted_genre,
                'track_number': track.extracted_track_number
            }
        })
    except Track.DoesNotExist:
        return Response(
            {'error': 'Track not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def reprocess_track(request, track_id):
    """
    Re-process an existing track with updated settings
    """
    try:
        track = Track.objects.get(id=track_id)
        
        if not track.audio_file:
            return Response(
                {'error': 'No audio file found for this track'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Initialize processor
        processor = AudioProcessor()
        
        # Get current audio file path
        audio_file_path = track.audio_file.path
        
        # Re-process the file
        processed_file_path = processor.embed_metadata(
            audio_file_path,
            {'title': track.title, 'album': track.album.title if track.album else ''},
            {'name': track.artist.name}
        )
        
        # Update track
        track.is_processed = True
        track.processed_at = timezone.now()
        track.has_site_branding = True
        track.save()
        
        # Clean up
        if processed_file_path != audio_file_path:
            os.unlink(processed_file_path)
        
        return Response({
            'message': 'Track reprocessed successfully',
            'is_processed': track.is_processed,
            'processed_at': track.processed_at
        })
        
    except Track.DoesNotExist:
        return Response(
            {'error': 'Track not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        logger.error(f"Error reprocessing track: {e}")
        return Response(
            {'error': f'Error reprocessing track: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
