import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { Track } from '../services/api';

interface PlayerState {
  currentTrack: Track | null;
  isPlaying: boolean;
  queue: Track[];
  currentIndex: number;
  volume: number;
  isMuted: boolean;
  repeat: 'none' | 'one' | 'all';
  shuffle: boolean;
}

type PlayerAction =
  | { type: 'SET_TRACK'; payload: Track }
  | { type: 'PLAY_PAUSE' }
  | { type: 'NEXT_TRACK' }
  | { type: 'PREVIOUS_TRACK' }
  | { type: 'SET_QUEUE'; payload: Track[] }
  | { type: 'SET_VOLUME'; payload: number }
  | { type: 'TOGGLE_MUTE' }
  | { type: 'SET_REPEAT'; payload: 'none' | 'one' | 'all' }
  | { type: 'TOGGLE_SHUFFLE' }
  | { type: 'CLEAR_QUEUE' };

const initialState: PlayerState = {
  currentTrack: null,
  isPlaying: false,
  queue: [],
  currentIndex: 0,
  volume: 0.7,
  isMuted: false,
  repeat: 'none',
  shuffle: false,
};

const playerReducer = (state: PlayerState, action: PlayerAction): PlayerState => {
  switch (action.type) {
    case 'SET_TRACK':
      return {
        ...state,
        currentTrack: action.payload,
        isPlaying: true,
        currentIndex: state.queue.findIndex(track => track.id === action.payload.id),
      };
    
    case 'PLAY_PAUSE':
      return {
        ...state,
        isPlaying: !state.isPlaying,
      };
    
    case 'NEXT_TRACK':
      if (state.queue.length === 0) return state;
      
      let nextIndex;
      if (state.shuffle) {
        nextIndex = Math.floor(Math.random() * state.queue.length);
      } else {
        nextIndex = (state.currentIndex + 1) % state.queue.length;
      }
      
      return {
        ...state,
        currentTrack: state.queue[nextIndex],
        currentIndex: nextIndex,
        isPlaying: true,
      };
    
    case 'PREVIOUS_TRACK':
      if (state.queue.length === 0) return state;
      
      const prevIndex = state.currentIndex === 0 ? state.queue.length - 1 : state.currentIndex - 1;
      
      return {
        ...state,
        currentTrack: state.queue[prevIndex],
        currentIndex: prevIndex,
        isPlaying: true,
      };
    
    case 'SET_QUEUE':
      return {
        ...state,
        queue: action.payload,
        currentIndex: 0,
        currentTrack: action.payload.length > 0 ? action.payload[0] : null,
        isPlaying: action.payload.length > 0,
      };
    
    case 'SET_VOLUME':
      return {
        ...state,
        volume: action.payload,
      };
    
    case 'TOGGLE_MUTE':
      return {
        ...state,
        isMuted: !state.isMuted,
      };
    
    case 'SET_REPEAT':
      return {
        ...state,
        repeat: action.payload,
      };
    
    case 'TOGGLE_SHUFFLE':
      return {
        ...state,
        shuffle: !state.shuffle,
      };
    
    case 'CLEAR_QUEUE':
      return {
        ...state,
        queue: [],
        currentTrack: null,
        isPlaying: false,
        currentIndex: 0,
      };
    
    default:
      return state;
  }
};

interface PlayerContextType {
  state: PlayerState;
  dispatch: React.Dispatch<PlayerAction>;
  playTrack: (track: Track) => void;
  playPause: () => void;
  nextTrack: () => void;
  previousTrack: () => void;
  setQueue: (tracks: Track[]) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  setRepeat: (repeat: 'none' | 'one' | 'all') => void;
  toggleShuffle: () => void;
  clearQueue: () => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
};

interface PlayerProviderProps {
  children: ReactNode;
}

export const PlayerProvider: React.FC<PlayerProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(playerReducer, initialState);

  const playTrack = (track: Track) => {
    dispatch({ type: 'SET_TRACK', payload: track });
  };

  const playPause = () => {
    dispatch({ type: 'PLAY_PAUSE' });
  };

  const nextTrack = () => {
    dispatch({ type: 'NEXT_TRACK' });
  };

  const previousTrack = () => {
    dispatch({ type: 'PREVIOUS_TRACK' });
  };

  const setQueue = (tracks: Track[]) => {
    dispatch({ type: 'SET_QUEUE', payload: tracks });
  };

  const setVolume = (volume: number) => {
    dispatch({ type: 'SET_VOLUME', payload: volume });
  };

  const toggleMute = () => {
    dispatch({ type: 'TOGGLE_MUTE' });
  };

  const setRepeat = (repeat: 'none' | 'one' | 'all') => {
    dispatch({ type: 'SET_REPEAT', payload: repeat });
  };

  const toggleShuffle = () => {
    dispatch({ type: 'TOGGLE_SHUFFLE' });
  };

  const clearQueue = () => {
    dispatch({ type: 'CLEAR_QUEUE' });
  };

  const value: PlayerContextType = {
    state,
    dispatch,
    playTrack,
    playPause,
    nextTrack,
    previousTrack,
    setQueue,
    setVolume,
    toggleMute,
    setRepeat,
    toggleShuffle,
    clearQueue,
  };

  return (
    <PlayerContext.Provider value={value}>
      {children}
    </PlayerContext.Provider>
  );
};

export default PlayerContext;
