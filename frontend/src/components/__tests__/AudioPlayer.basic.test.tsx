import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import AudioPlayer from '../AudioPlayer';

// Mock HTMLAudioElement to prevent actual audio playback
const mockAudioElement = {
  play: jest.fn().mockResolvedValue(undefined),
  pause: jest.fn(),
  load: jest.fn(),
  currentTime: 0,
  duration: 0,
  volume: 0.7,
  muted: false,
  paused: true,
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
};

Object.defineProperty(window, 'Audio', {
  writable: true,
  value: jest.fn().mockImplementation(() => mockAudioElement),
});

describe('AudioPlayer Basic Tests', () => {
  const mockTrack = {
    id: 1,
    title: 'Test Track',
    slug: 'test-track',
    artist: { 
      id: 1, 
      name: 'Test Artist', 
      slug: 'test-artist',
      bio: '',
      image: null,
      created_at: '2024-01-01T00:00:00Z'
    },
    album: { 
      id: 1, 
      title: 'Test Album', 
      slug: 'test-album',
      artist: { id: 1, name: 'Test Artist', slug: 'test-artist', bio: '', image: null, created_at: '2024-01-01T00:00:00Z' },
      description: '',
      is_explicit: false,
      bitrate: '320',
      format: 'mp3',
      download_count: 0,
      tracks_count: 1,
      created_at: '2024-01-01T00:00:00Z'
    },
    genre: { id: 1, name: 'Hip-Hop', slug: 'hip-hop' },
    featuring_artists: [],
    track_number: 1,
    duration: '3:00',
    audio_file: 'http://example.com/test.mp3',
    file_size: '5000000',
    bitrate: '320',
    format: 'mp3',
    is_explicit: false,
    download_count: 0,
    created_at: '2024-01-01T00:00:00Z'
  };

  const defaultProps = {
    track: mockTrack,
    isPlaying: false,
    onPlayPause: jest.fn(),
    onNext: jest.fn(),
    onPrevious: jest.fn(),
    onTrackEnd: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders audio player with track information', () => {
    render(<AudioPlayer {...defaultProps} />);
    
    expect(screen.getByText('Test Track')).toBeInTheDocument();
    expect(screen.getByText('Test Artist')).toBeInTheDocument();
    // Album might not be displayed in the main player UI
  });

  test('renders audio element with correct src', () => {
    render(<AudioPlayer {...defaultProps} />);
    
    // Look for the audio element by tag name
    const audioElement = document.querySelector('audio');
    expect(audioElement).toBeInTheDocument();
    expect(audioElement).toHaveAttribute('src', 'http://example.com/test.mp3');
  });

  test('renders control buttons', () => {
    render(<AudioPlayer {...defaultProps} />);
    
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
    
    // Should have previous, play/pause, next, and volume buttons
    expect(buttons.length).toBeGreaterThanOrEqual(4);
  });

  test('renders progress bar', () => {
    render(<AudioPlayer {...defaultProps} />);
    
    // Look for progress bar elements
    const progressBar = document.querySelector('[class*="bg-gray-700"]');
    expect(progressBar).toBeInTheDocument();
  });

  test('renders volume controls', () => {
    render(<AudioPlayer {...defaultProps} />);
    
    // Look for volume slider
    const volumeSlider = document.querySelector('input[type="range"]');
    expect(volumeSlider).toBeInTheDocument();
  });

  test('handles null track gracefully', () => {
    render(<AudioPlayer {...defaultProps} track={null} />);
    
    expect(screen.queryByText('Test Track')).not.toBeInTheDocument();
    expect(screen.queryByText('Test Artist')).not.toBeInTheDocument();
    expect(screen.queryByText('Test Album')).not.toBeInTheDocument();
  });

  test('displays time information', () => {
    render(<AudioPlayer {...defaultProps} />);
    
    // Should display current time and duration - check for any time elements
    const timeElements = screen.getAllByText('0:00');
    expect(timeElements.length).toBeGreaterThan(0);
  });
});
