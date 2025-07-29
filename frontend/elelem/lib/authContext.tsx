"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { jwtDecode } from "jwt-decode";

interface DecodedToken {
  exp: number;
  sub: string;
  // Add other fields as needed
}

interface AuthContextType {
  isAuthenticated: boolean;
  token: string | null;
  isLoading: boolean;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Check for existing token on app load
        const storedToken = localStorage.getItem("token");
        if (storedToken) {
          try {
            // Decode token to check expiration
            const decoded: DecodedToken = jwtDecode(storedToken);
            const currentTime = Date.now() / 1000;
            
            // Check if token is expired (add 5 second buffer)
            if (decoded.exp <= currentTime + 5) {
              // Token expired or about to expire, remove it
              localStorage.removeItem("token");
              setToken(null);
              setIsAuthenticated(false);
            } else {
              // Token is valid, set auth state
              setToken(storedToken);
              setIsAuthenticated(true);
            }
          } catch (error) {
            // Invalid token, remove it
            console.error("Invalid token", error);
            localStorage.removeItem("token");
            setToken(null);
            setIsAuthenticated(false);
          }
        } else {
          // No token found
          setToken(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
        setToken(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = (newToken: string) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, token, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
