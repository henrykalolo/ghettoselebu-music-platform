import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import AudioPlayer from '../AudioPlayer';
import { Track } from '../../services/api';

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

describe('AudioPlayer', () => {
  const mockTrack: Track = {
    id: 1,
    title: 'Test Track',
    slug: 'test-track',
    artist: { id: 1, name: 'Test Artist', slug: 'test-artist' },
    album: { id: 1, title: 'Test Album', slug: 'test-album' },
    genre: { id: 1, name: 'Hip-Hop', slug: 'hip-hop' },
    track_number: 1,
    duration: 180,
    audio_file: 'http://example.com/test.mp3',
    optimized_file: null,
    file_size: 5000000,
    bitrate: 320,
    format: 'mp3',
    is_explicit: false,
    download_count: 0,
    likes_count: 10,
    comments_count: 5,
    is_liked: false,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    original_filename: 'test.mp3',
    extracted_title: 'Test Track',
    extracted_artist: 'Test Artist',
    extracted_album: 'Test Album',
    extracted_year: '2024',
    extracted_genre: 'Hip-Hop',
    extracted_track_number: '1',
    is_processed: true,
    processed_at: '2024-01-01T00:00:00Z',
    has_site_branding: false,
    is_optimized: false,
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
    mockAudioElement.currentTime = 0;
    mockAudioElement.duration = 0;
    mockAudioElement.paused = true;
  });

  test('renders audio player with track information', () => {
    render(<AudioPlayer {...defaultProps} />);
    
    expect(screen.getByText('Test Track')).toBeInTheDocument();
    expect(screen.getByText('Test Artist')).toBeInTheDocument();
    expect(screen.getByText('Test Album')).toBeInTheDocument();
  });

  test('shows play button when not playing', () => {
    render(<AudioPlayer {...defaultProps} isPlaying={false} />);
    
    const playButton = screen.getByRole('button', { name: /play/i });
    expect(playButton).toBeInTheDocument();
  });

  test('shows pause button when playing', () => {
    render(<AudioPlayer {...defaultProps} isPlaying={true} />);
    
    const pauseButton = screen.getByRole('button', { name: /pause/i });
    expect(pauseButton).toBeInTheDocument();
  });

  test('calls onPlayPause when play/pause button is clicked', () => {
    const mockOnPlayPause = jest.fn();
    render(<AudioPlayer {...defaultProps} onPlayPause={mockOnPlayPause} />);
    
    const playButton = screen.getByRole('button', { name: /play/i });
    fireEvent.click(playButton);
    
    expect(mockOnPlayPause).toHaveBeenCalledTimes(1);
  });

  test('calls onNext when next button is clicked', () => {
    const mockOnNext = jest.fn();
    render(<AudioPlayer {...defaultProps} onNext={mockOnNext} />);
    
    const nextButton = screen.getByRole('button', { name: /next/i });
    fireEvent.click(nextButton);
    
    expect(mockOnNext).toHaveBeenCalledTimes(1);
  });

  test('calls onPrevious when previous button is clicked', () => {
    const mockOnPrevious = jest.fn();
    render(<AudioPlayer {...defaultProps} onPrevious={mockOnPrevious} />);
    
    const previousButton = screen.getByRole('button', { name: /previous/i });
    fireEvent.click(previousButton);
    
    expect(mockOnPrevious).toHaveBeenCalledTimes(1);
  });

  test('displays volume controls', () => {
    render(<AudioPlayer {...defaultProps} />);
    
    const volumeButton = screen.getByRole('button', { name: /volume/i });
    const volumeSlider = screen.getByRole('slider', { name: /volume/i });
    
    expect(volumeButton).toBeInTheDocument();
    expect(volumeSlider).toBeInTheDocument();
  });

  test('toggles mute when volume button is clicked', () => {
    render(<AudioPlayer {...defaultProps} />);
    
    const volumeButton = screen.getByRole('button', { name: /volume/i });
    fireEvent.click(volumeButton);
    
    expect(mockAudioElement.muted).toBe(true);
  });

  test('updates volume when slider is changed', () => {
    render(<AudioPlayer {...defaultProps} />);
    
    const volumeSlider = screen.getByRole('slider', { name: /volume/i });
    fireEvent.change(volumeSlider, { target: { value: '0.5' } });
    
    expect(mockAudioElement.volume).toBe(0.5);
  });

  test('displays progress bar', () => {
    render(<AudioPlayer {...defaultProps} />);
    
    const progressBar = screen.getByRole('slider', { name: /progress/i });
    expect(progressBar).toBeInTheDocument();
  });

  test('updates current time when audio plays', async () => {
    mockAudioElement.currentTime = 30;
    mockAudioElement.duration = 180;
    
    // Mock the time update event
    const timeUpdateEvent = new Event('timeupdate');
    
    render(<AudioPlayer {...defaultProps} />);
    
    // Simulate time update
    const audioElement = screen.getByTestId('audio-element') as HTMLAudioElement;
    fireEvent(audioElement, timeUpdateEvent);
    
    await waitFor(() => {
      expect(screen.getByText(/0:30/)).toBeInTheDocument();
      expect(screen.getByText(/3:00/)).toBeInTheDocument();
    });
  });

  test('seeks when progress bar is clicked', () => {
    render(<AudioPlayer {...defaultProps} />);
    
    const progressBar = screen.getByRole('slider', { name: /progress/i });
    fireEvent.change(progressBar, { target: { value: '60' } });
    
    expect(mockAudioElement.currentTime).toBe(60);
  });

  test('calls onTrackEnd when audio ends', async () => {
    const mockOnTrackEnd = jest.fn();
    
    render(<AudioPlayer {...defaultProps} onTrackEnd={mockOnTrackEnd} />);
    
    // Mock the ended event
    const endedEvent = new Event('ended');
    const audioElement = screen.getByTestId('audio-element') as HTMLAudioElement;
    fireEvent(audioElement, endedEvent);
    
    await waitFor(() => {
      expect(mockOnTrackEnd).toHaveBeenCalledTimes(1);
    });
  });

  test('handles null track gracefully', () => {
    render(<AudioPlayer {...defaultProps} track={null} />);
    
    expect(screen.queryByText('Test Track')).not.toBeInTheDocument();
    expect(screen.getByText('No track selected')).toBeInTheDocument();
  });

  test('shows loading state', () => {
    render(<AudioPlayer {...defaultProps} />);
    
    // Simulate loading state
    const loadStartEvent = new Event('loadstart');
    const audioElement = screen.getByTestId('audio-element') as HTMLAudioElement;
    fireEvent(audioElement, loadStartEvent);
    
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  test('formats time correctly', () => {
    mockAudioElement.currentTime = 125; // 2:05
    mockAudioElement.duration = 245; // 4:05
    
    const timeUpdateEvent = new Event('timeupdate');
    
    render(<AudioPlayer {...defaultProps} />);
    
    const audioElement = screen.getByTestId('audio-element') as HTMLAudioElement;
    fireEvent(audioElement, timeUpdateEvent);
    
    expect(screen.getByText(/2:05/)).toBeInTheDocument();
    expect(screen.getByText(/4:05/)).toBeInTheDocument();
  });
});
