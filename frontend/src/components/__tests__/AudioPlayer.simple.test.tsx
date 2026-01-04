import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import AudioPlayer from '../AudioPlayer';

// Mock HTMLAudioElement
const mockAudioElement = {
  play: jest.fn(),
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

// Mock the audio element creation
Object.defineProperty(window, 'Audio', {
  writable: true,
  value: jest.fn().mockImplementation(() => mockAudioElement),
});

describe('AudioPlayer Simple Tests', () => {
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
    expect(screen.getByText('Test Album')).toBeInTheDocument();
  });

  test('shows play button when not playing', () => {
    render(<AudioPlayer {...defaultProps} isPlaying={false} />);
    
    // Look for the play button by its SVG icon
    const playButton = screen.getByTestId('play-button') || 
                      document.querySelector('button svg.lucide-play');
    expect(playButton).toBeInTheDocument();
  });

  test('shows pause button when playing', () => {
    render(<AudioPlayer {...defaultProps} isPlaying={true} />);
    
    // Look for the pause button by its SVG icon
    const pauseButton = screen.getByTestId('pause-button') || 
                       document.querySelector('button svg.lucide-pause');
    expect(pauseButton).toBeInTheDocument();
  });

  test('calls onPlayPause when play/pause button is clicked', () => {
    const mockOnPlayPause = jest.fn();
    render(<AudioPlayer {...defaultProps} onPlayPause={mockOnPlayPause} />);
    
    // Find any button in the player controls
    const buttons = screen.getAllByRole('button');
    const playPauseButton = buttons.find(button => 
      button.querySelector('svg.lucide-play, svg.lucide-pause')
    );
    
    expect(playPauseButton).toBeInTheDocument();
    fireEvent.click(playPauseButton!);
    
    expect(mockOnPlayPause).toHaveBeenCalledTimes(1);
  });

  test('handles null track gracefully', () => {
    render(<AudioPlayer {...defaultProps} track={null} />);
    
    expect(screen.queryByText('Test Track')).not.toBeInTheDocument();
  });
});
