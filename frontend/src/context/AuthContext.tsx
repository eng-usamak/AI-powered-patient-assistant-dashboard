import React, { useState } from 'react';
import { AuthContext, type AuthState, type AuthContextValue, type User } from './authContextConfig';

const STORAGE_KEY = 'teraleads_auth';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
    const [state, setState] = useState<AuthState>(() => {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          try {
            return JSON.parse(raw) as AuthState;
          } catch {
            // ignore parse errors
          }
        }
        return { user: null, token: null };
      });
    

    const login = (user: User, token: string) => {
        const newState = { user, token };
        setState(newState);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
    };

    const logout = () => {
        setState({ user: null, token: null });
        localStorage.removeItem(STORAGE_KEY);
    };

    const value: AuthContextValue = {
        ...state,
        login,
        logout,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
