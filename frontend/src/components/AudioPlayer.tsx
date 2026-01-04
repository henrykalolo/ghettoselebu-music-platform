import React, { useState, useRef, useEffect } from 'react';
import { PlayIcon, PauseIcon, SkipBackIcon, SkipForwardIcon, Volume2Icon, VolumeXIcon } from 'lucide-react';
import { Track } from '../services/api';

interface AudioPlayerProps {
  track: Track | null;
  onTrackEnd?: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
  isPlaying: boolean;
  onPlayPause: () => void;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({
  track,
  onTrackEnd,
  onNext,
  onPrevious,
  isPlaying,
  onPlayPause,
}) => {
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      setIsLoading(false);
    };

    const handleEnded = () => {
      setCurrentTime(0);
      onTrackEnd?.();
    };

    const handleLoadStart = () => {
      setIsLoading(true);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('loadstart', handleLoadStart);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('loadstart', handleLoadStart);
    };
  }, [onTrackEnd]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      setIsLoading(true);
      audio.play().catch(error => {
        console.error('Error playing audio:', error);
        setIsLoading(false);
        // Handle specific errors
        if (error.name === 'NotAllowedError') {
          console.error('Autoplay was prevented by the browser');
        } else if (error.name === 'NotFoundError') {
          console.error('Audio file not found');
        } else if (error.name === 'NotReadableError') {
          console.error('Audio file is not readable or corrupted');
        }
      });
    } else {
      audio.pause();
    }
  }, [isPlaying, track?.audio_file]); // Add track.audio_file to dependencies

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // Reset audio state when track changes
    if (track?.audio_file) {
      console.log('Loading audio file:', track.audio_file);
      audio.src = track.audio_file;
      audio.load(); // Start loading the new audio
    } else {
      console.log('No audio file available for track:', track?.title);
      audio.src = '';
    }
    
    setCurrentTime(0);
    setDuration(0);
    setIsLoading(false);
  }, [track?.audio_file, track?.id]); // Depend on both audio_file and track id

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    const progressBar = progressBarRef.current;
    if (!audio || !progressBar) return;

    const rect = progressBar.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const newTime = percent * duration;
    
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    setIsMuted(false);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  if (!track) {
    return (
      <div className="bg-gray-900 border-t border-gray-800 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center text-gray-400">
            <span>No track selected</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 border-t border-gray-800 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center space-x-4">
          {/* Track Info */}
          <div className="flex items-center space-x-3 min-w-0 flex-1">
            <div className="bg-gradient-to-br from-red-600 to-red-800 w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0">
              <PlayIcon className="h-6 w-6 text-white" />
            </div>
            <div className="min-w-0">
              <h4 className="text-white font-medium truncate">{track.title}</h4>
              <p className="text-gray-400 text-sm truncate">{track.artist.name}</p>
              {/* Debug info */}
              <p className="text-gray-500 text-xs">Audio: {track.audio_file ? 'Available' : 'Missing'}</p>
              <p className="text-gray-500 text-xs truncate">URL: {track.audio_file || 'None'}</p>
            </div>
          </div>

          {/* Player Controls */}
          <div className="flex items-center space-x-4">
            <button
              onClick={onPrevious}
              className="text-gray-400 hover:text-white transition-colors"
              disabled={!onPrevious}
            >
              <SkipBackIcon className="h-5 w-5" />
            </button>
            
            <button
              onClick={onPlayPause}
              className="bg-red-600 text-white p-3 rounded-full hover:bg-red-700 transition-colors"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : isPlaying ? (
                <PauseIcon className="h-5 w-5" />
              ) : (
                <PlayIcon className="h-5 w-5" />
              )}
            </button>
            
            <button
              onClick={onNext}
              className="text-gray-400 hover:text-white transition-colors"
              disabled={!onNext}
            >
              <SkipForwardIcon className="h-5 w-5" />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="flex items-center space-x-3 flex-1 max-w-md">
            <span className="text-gray-400 text-xs w-10 text-right">
              {formatTime(currentTime)}
            </span>
            <div
              ref={progressBarRef}
              className="flex-1 bg-gray-700 rounded-full h-2 cursor-pointer relative"
              onClick={handleProgressClick}
            >
              <div
                className="bg-red-600 h-full rounded-full relative"
                style={{ width: `${progressPercent}%` }}
              >
                <div className="absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full"></div>
              </div>
            </div>
            <span className="text-gray-400 text-xs w-10">
              {formatTime(duration)}
            </span>
          </div>

          {/* Volume Control */}
          <div className="flex items-center space-x-2">
            <button
              onClick={toggleMute}
              className="text-gray-400 hover:text-white transition-colors"
            >
              {isMuted || volume === 0 ? (
                <VolumeXIcon className="h-5 w-5" />
              ) : (
                <Volume2Icon className="h-5 w-5" />
              )}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className="w-20 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #dc2626 0%, #dc2626 ${isMuted ? 0 : volume * 100}%, #374151 ${isMuted ? 0 : volume * 100}%, #374151 100%)`
              }}
            />
          </div>
        </div>
      </div>

      {/* Hidden Audio Element */}
      <audio
        ref={audioRef}
        preload="metadata"
        onPlay={() => {
          console.log('Audio started playing');
          setIsLoading(false);
        }}
        onError={(e) => {
          console.error('Audio error:', e);
          console.error('Audio error details:', {
            error: e.currentTarget.error,
            networkState: e.currentTarget.networkState,
            readyState: e.currentTarget.readyState,
            currentSrc: e.currentTarget.currentSrc
          });
          setIsLoading(false);
        }}
        onLoadedData={() => {
          console.log('Audio data loaded successfully');
        }}
        onCanPlay={() => {
          console.log('Audio can play');
          setIsLoading(false);
        }}
        onTimeUpdate={() => {
          console.log('Time update:', audioRef.current?.currentTime);
          setCurrentTime(audioRef.current?.currentTime || 0);
        }}
        onLoadedMetadata={() => {
          console.log('Metadata loaded, duration:', audioRef.current?.duration);
          setDuration(audioRef.current?.duration || 0);
          setIsLoading(false);
        }}
      />
    </div>
  );
};

export default AudioPlayer;
