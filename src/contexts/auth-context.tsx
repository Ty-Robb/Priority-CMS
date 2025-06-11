
"use client";

import type { ReactNode } from 'react';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface AuthContextType {
  isLoggedIn: boolean;
  login: (token?: string) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Check for a token in localStorage to maintain session
    try {
      const token = localStorage.getItem('authToken');
      if (token) {
        setIsLoggedIn(true);
      }
    } catch (error) {
      console.error("Error accessing localStorage:", error);
      // Proceed without being logged in if localStorage is inaccessible
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (!isLoading) {
      if (!isLoggedIn && pathname.startsWith('/dashboard')) {
        router.push('/login');
      }
      if (isLoggedIn && (pathname === '/login' || pathname === '/signup')) {
        router.push('/dashboard');
      }
    }
  }, [isLoggedIn, isLoading, pathname, router]);

  const login = (token?: string) => {
    try {
      if (token) {
        localStorage.setItem('authToken', token);
      }
      setIsLoggedIn(true);
      // Redirection is now handled by the useEffect above
    } catch (error) {
      console.error("Failed to set auth token in localStorage or update login state:", error);
      // Potentially inform user if this critical step fails
    }
  };

  const logout = () => {
    try {
      localStorage.removeItem('authToken');
    } catch (error) {
      console.error("Error removing authToken from localStorage:", error);
    }
    setIsLoggedIn(false);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, login, logout, isLoading }}>
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

