import { useState } from 'react';
import { TOKEN_KEY } from '../api/client';

export function useAuth() {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));

  function saveToken(t: string) {
    localStorage.setItem(TOKEN_KEY, t);
    setToken(t);
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
  }

  return { token, saveToken, logout, isAuthenticated: !!token };
}
