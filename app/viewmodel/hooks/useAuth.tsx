import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api, setApiToken } from '../helper/api';
import { User, LoginResponse } from '@/app/model/auth';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = "@eletrotime:token";
const USER_KEY = "@eletrotime:user";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load stored auth session on startup
  useEffect(() => {
    async function loadStoredData() {
      try {
        const storedToken = await AsyncStorage.getItem(TOKEN_KEY);
        const storedUser = await AsyncStorage.getItem(USER_KEY);

        if (storedToken && storedUser) {
          setToken(storedToken);
          setApiToken(storedToken);
          setUser(JSON.parse(storedUser));
        }
      } catch (e) {
        console.error("Failed to load stored auth session:", e);
      } finally {
        setIsLoading(false);
      }
    }

    loadStoredData();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response: LoginResponse = await api.post("/api/auth/login/", {
        email,
        password
      });

      if (response && response.access) {
        const userObj: User = {
          id: response.id,
          username: response.username,
          email: response.email,
          nome: response.nome,
          sobrenome: response.sobrenome,
          role: response.role
        };

        setToken(response.access);
        setApiToken(response.access);
        setUser(userObj);

        // Persist session
        await AsyncStorage.setItem(TOKEN_KEY, response.access);
        await AsyncStorage.setItem(USER_KEY, JSON.stringify(userObj));
      } else {
        throw new Error("Resposta de login inválida do servidor.");
      }
    } catch (e: any) {
      const msg = e.message || "Erro desconhecido ao fazer login.";
      setError(msg);
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      setToken(null);
      setApiToken(null);
      setUser(null);
      await AsyncStorage.removeItem(TOKEN_KEY);
      await AsyncStorage.removeItem(USER_KEY);
    } catch (e) {
      console.error("Failed to clear stored auth session:", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        logout,
        error,
        clearError
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
