import os
import tempfile
from mutagen import File
from mutagen.id3 import ID3, TIT2, TPE1, TALB, TDRC, TCON, TRCK
from mutagen.mp3 import MP3
from mutagen.flac import FLAC
from pydub import AudioSegment
from django.conf import settings
from django.utils import timezone
from tts_utils import SiteAnnouncementGenerator
import logging

logger = logging.getLogger(__name__)

class AudioProcessor:
    def __init__(self):
        self.site_name = "Ghettoselebu"
        self.site_tagline = "Your Music Platform"
        self.announcement_generator = SiteAnnouncementGenerator()
        
    def extract_metadata(self, file_path):
        """Extract metadata from audio file"""
        try:
            audio_file = File(file_path)
            if audio_file is None:
                return {}
            
            metadata = {}
            
            # Common metadata fields
            if hasattr(audio_file, 'get'):
                metadata['title'] = audio_file.get('TIT2', [''])[0] if audio_file.get('TIT2') else ''
                metadata['artist'] = audio_file.get('TPE1', [''])[0] if audio_file.get('TPE1') else ''
                metadata['album'] = audio_file.get('TALB', [''])[0] if audio_file.get('TALB') else ''
                metadata['year'] = audio_file.get('TDRC', [''])[0] if audio_file.get('TDRC') else ''
                metadata['genre'] = audio_file.get('TCON', [''])[0] if audio_file.get('TCON') else ''
                metadata['track_number'] = audio_file.get('TRCK', [''])[0] if audio_file.get('TRCK') else ''
            
            # For FLAC files
            if isinstance(audio_file, FLAC):
                metadata['title'] = audio_file.get('title', [''])[0] if audio_file.get('title') else ''
                metadata['artist'] = audio_file.get('artist', [''])[0] if audio_file.get('artist') else ''
                metadata['album'] = audio_file.get('album', [''])[0] if audio_file.get('album') else ''
                metadata['year'] = audio_file.get('date', [''])[0] if audio_file.get('date') else ''
                metadata['genre'] = audio_file.get('genre', [''])[0] if audio_file.get('genre') else ''
                metadata['track_number'] = audio_file.get('tracknumber', [''])[0] if audio_file.get('tracknumber') else ''
            
            # Get file info
            metadata['duration'] = getattr(audio_file.info, 'length', 0)
            metadata['bitrate'] = getattr(audio_file.info, 'bitrate', 0)
            metadata['file_size'] = os.path.getsize(file_path)
            
            return metadata
            
        except Exception as e:
            logger.error(f"Error extracting metadata: {e}")
            return {}
    
    def create_site_announcement(self):
        """Create audio announcement with female voice"""
        try:
            # Use the TTS utility to create announcement
            announcement_path = self.announcement_generator.create_announcement(voice_type='female')
            
            if announcement_path and os.path.exists(announcement_path):
                announcement = AudioSegment.from_file(announcement_path)
                # Clean up temporary file
                os.unlink(announcement_path)
                return announcement
            else:
                # Fallback to simple tone
                return AudioSegment.sine(440, duration=1000)
            
        except Exception as e:
            logger.error(f"Error creating site announcement: {e}")
            return AudioSegment.sine(440, duration=1000)
    
    def embed_metadata(self, file_path, track_data, artist_data=None):
        """Embed metadata and site branding into audio file"""
        try:
            # Load the audio file
            audio = AudioSegment.from_file(file_path)
            
            # Create site announcement
            announcement = self.create_site_announcement()
            if announcement:
                # Add announcement at the beginning
                audio = announcement + audio
            
            # Create temporary file for processing
            with tempfile.NamedTemporaryFile(suffix='.mp3', delete=False) as temp_file:
                temp_path = temp_file.name
                
                # Export processed audio
                audio.export(temp_path, format='mp3', bitrate='320k')
                
                # Add metadata to the processed file
                self._add_id3_tags(temp_path, track_data, artist_data)
                
                return temp_path
                
        except Exception as e:
            logger.error(f"Error embedding metadata: {e}")
            return file_path
    
    def _add_id3_tags(self, file_path, track_data, artist_data=None):
        """Add ID3 tags to MP3 file"""
        try:
            audio = MP3(file_path)
            
            # Create ID3 tag if it doesn't exist
            if audio.tags is None:
                audio.add_tags()
            
            # Add track metadata
            if track_data.get('title'):
                audio.tags['TIT2'] = TIT2(encoding=3, text=track_data['title'])
            
            if artist_data and artist_data.get('name'):
                audio.tags['TPE1'] = TPE1(encoding=3, text=artist_data['name'])
            
            if track_data.get('album'):
                audio.tags['TALB'] = TALB(encoding=3, text=track_data['album'])
            
            # Add site branding
            audio.tags['TXXX:BRAND'] = f"{self.site_name} - {self.site_tagline}"
            audio.tags['TXXX:SOURCE'] = self.site_name
            audio.tags['TXXX:UPLOAD_DATE'] = str(timezone.now().date())
            audio.tags['TXXX:PROCESSED_BY'] = f"{self.site_name} Audio Processor v1.0"
            
            # Add encoding info
            audio.tags['TENC'] = f"{self.site_name} Encoder v1.0"
            
            # Add processing timestamp
            audio.tags['TXXX:PROCESSED_AT'] = str(timezone.now())
            
            audio.save()
            
        except Exception as e:
            logger.error(f"Error adding ID3 tags: {e}")
    
    def get_audio_info(self, file_path):
        """Get detailed audio file information"""
        try:
            audio = AudioSegment.from_file(file_path)
            
            return {
                'duration_seconds': len(audio) / 1000.0,
                'channels': audio.channels,
                'frame_rate': audio.frame_rate,
                'sample_width': audio.sample_width,
                'frame_count': audio.frame_count(),
                'file_size': os.path.getsize(file_path)
            }
            
        except Exception as e:
            logger.error(f"Error getting audio info: {e}")
            return {}
    
    def optimize_for_streaming(self, file_path):
        """Optimize audio file for streaming"""
        try:
            audio = AudioSegment.from_file(file_path)
            
            # Normalize audio
            audio = audio.normalize()
            
            # Convert to standard format for streaming
            optimized_audio = audio.set_frame_rate(44100).set_channels(2)
            
            # Create temporary file
            with tempfile.NamedTemporaryFile(suffix='.mp3', delete=False) as temp_file:
                temp_path = temp_file.name
                optimized_audio.export(temp_path, format='mp3', bitrate='192k')
                
                return temp_path
                
        except Exception as e:
            logger.error(f"Error optimizing audio: {e}")
            return file_path
    
    def add_crossfade(self, file_path, fade_duration=2000):
        """Add crossfade effect to the beginning and end"""
        try:
            audio = AudioSegment.from_file(file_path)
            
            # Add fade in at beginning
            audio = audio.fade_in(fade_duration)
            
            # Add fade out at end
            audio = audio.fade_out(fade_duration)
            
            # Export to temporary file
            with tempfile.NamedTemporaryFile(suffix='.mp3', delete=False) as temp_file:
                temp_path = temp_file.name
                audio.export(temp_path, format='mp3', bitrate='320k')
                
                return temp_path
                
        except Exception as e:
            logger.error(f"Error adding crossfade: {e}")
            return file_path
