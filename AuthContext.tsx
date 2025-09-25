import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { authService } from '../services/authService';

// Auth state interface
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Auth actions
type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: User }
  | { type: 'AUTH_FAIL' }
  | { type: 'LOGOUT' };

// Auth context interface
interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role?: 'admin' | 'voter') => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

// Initial state
const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
};

// Auth reducer
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        isLoading: true,
      };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
      };
    case 'AUTH_FAIL':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
      };
    default:
      return state;
  }
};

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider component
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Login function
  const login = async (email: string, password: string): Promise<void> => {
    try {
      dispatch({ type: 'AUTH_START' });
      const { token, user } = await authService.login({ email, password });
      authService.storeAuthData(token, user);
      dispatch({ type: 'AUTH_SUCCESS', payload: user });
    } catch (error) {
      dispatch({ type: 'AUTH_FAIL' });
      throw error;
    }
  };

  // Register function
  const register = async (
    name: string,
    email: string,
    password: string,
    role: 'admin' | 'voter' = 'voter'
  ): Promise<void> => {
    try {
      dispatch({ type: 'AUTH_START' });
      const { token, user } = await authService.register({ name, email, password, role });
      authService.storeAuthData(token, user);
      dispatch({ type: 'AUTH_SUCCESS', payload: user });
    } catch (error) {
      dispatch({ type: 'AUTH_FAIL' });
      throw error;
    }
  };

  // Logout function
  const logout = (): void => {
    authService.logout();
    dispatch({ type: 'LOGOUT' });
  };

  // Check authentication status
  const checkAuth = async (): Promise<void> => {
    try {
      if (authService.isAuthenticated()) {
        const storedUser = authService.getStoredUser();
        if (storedUser) {
          // Verify token is still valid by making a request
          try {
            await authService.getCurrentUser();
            dispatch({ type: 'AUTH_SUCCESS', payload: storedUser });
          } catch (tokenError) {
            // Token expired or invalid, clear auth data
            console.log('Token verification failed, logging out');
            authService.logout();
            dispatch({ type: 'AUTH_FAIL' });
          }
        } else {
          dispatch({ type: 'AUTH_FAIL' });
        }
      } else {
        dispatch({ type: 'AUTH_FAIL' });
      }
    } catch (error) {
      console.error('Auth check error:', error);
      authService.logout();
      dispatch({ type: 'AUTH_FAIL' });
    }
  };

  // Check auth on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const contextValue: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    checkAuth,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};