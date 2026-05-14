import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (savedToken && savedUser) {
      try {
        const payloadBase64 = savedToken.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
        const decodedPayload = JSON.parse(atob(payloadBase64));
        const exp = decodedPayload.exp;
        
        if (exp && Date.now() >= exp * 1000) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        } else {
          setToken(savedToken);
          setUser(JSON.parse(savedUser));
        }
      } catch (e) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
  }, []);

  useEffect(() => {
    if (!token) return;
    
    const interval = setInterval(() => {
      try {
        const payloadBase64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
        const decodedPayload = JSON.parse(atob(payloadBase64));
        const exp = decodedPayload.exp;
        
        if (exp && Date.now() >= exp * 1000) {
          logout();
          window.location.href = '/auth'; // Force redirection
        }
      } catch (e) {
        logout();
      }
    }, 60000); // Check every minute
    
    return () => clearInterval(interval);
  }, [token]);

  const login = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
