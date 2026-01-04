import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { User, UserProfile } from '../services/api';

interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: { user: User; profile: UserProfile } }
  | { type: 'LOGIN_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'REGISTER_START' }
  | { type: 'REGISTER_SUCCESS'; payload: { user: User; profile: UserProfile } }
  | { type: 'REGISTER_FAILURE'; payload: string }
  | { type: 'LOAD_PROFILE_SUCCESS'; payload: UserProfile }
  | { type: 'CLEAR_ERROR' };

const initialState: AuthState = {
  user: null,
  profile: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOGIN_START':
    case 'REGISTER_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    
    case 'LOGIN_SUCCESS':
    case 'REGISTER_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        profile: action.payload.profile,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    
    case 'LOGIN_FAILURE':
    case 'REGISTER_FAILURE':
      return {
        ...state,
        user: null,
        profile: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };
    
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        profile: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    
    case 'LOAD_PROFILE_SUCCESS':
      return {
        ...state,
        profile: action.payload,
        error: null,
      };
    
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    
    default:
      return state;
  }
};

interface AuthContextType {
  state: AuthState;
  dispatch: React.Dispatch<AuthAction>;
  login: (username: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      // Validate token and load user profile
      loadUserProfile();
    }
  }, []);

  const loadUserProfile = async () => {
    try {
      const { authAPI } = await import('../services/api');
      const response = await authAPI.getProfile();
      dispatch({ type: 'LOAD_PROFILE_SUCCESS', payload: response.data });
      dispatch({ type: 'LOGIN_SUCCESS', payload: { user: response.data.user, profile: response.data } });
    } catch (error) {
      console.error('Failed to load user profile:', error);
      // Token is invalid, clear it
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    }
  };

  const login = async (username: string, password: string) => {
    dispatch({ type: 'LOGIN_START' });
    
    try {
      const { authAPI } = await import('../services/api');
      const response = await authAPI.login(username, password);
      
      const { access, refresh, user, profile } = response.data;
      
      // Store tokens
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      
      dispatch({ type: 'LOGIN_SUCCESS', payload: { user, profile } });
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'Login failed';
      dispatch({ type: 'LOGIN_FAILURE', payload: errorMessage });
      throw error;
    }
  };

  const register = async (userData: any) => {
    dispatch({ type: 'REGISTER_START' });
    
    try {
      const { authAPI } = await import('../services/api');
      const response = await authAPI.register(userData);
      
      const { access, refresh, user, profile } = response.data;
      
      // Store tokens
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      
      dispatch({ type: 'REGISTER_SUCCESS', payload: { user, profile } });
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'Registration failed';
      dispatch({ type: 'REGISTER_FAILURE', payload: errorMessage });
      throw error;
    }
  };

  const logout = async () => {
    try {
      const { authAPI } = await import('../services/api');
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      dispatch({ type: 'LOGOUT' });
    }
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const value: AuthContextType = {
    state,
    dispatch,
    login,
    register,
    logout,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
