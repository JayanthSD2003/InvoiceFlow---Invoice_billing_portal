import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const AuthContext = createContext(null);
const API_BASE = 'http://localhost/invoice-billing-portal/backend/routes/api.php';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const parseJson = useCallback(async (response) => {
    const text = await response.text();
    try {
      return text ? JSON.parse(text) : {};
    } catch {
      throw new Error(`Invalid server response: ${text}`);
    }
  }, []);

  const register = useCallback(async ({ full_name, email, phone, password }) => {
    const response = await fetch(`${API_BASE}?route=register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        full_name,
        email,
        phone,
        password,
      }),
    });

    const data = await parseJson(response);

    if (!response.ok || data.success === false) {
      throw new Error(data.message || 'Registration failed');
    }

    return data;
  }, [parseJson]);

  const login = useCallback(async ({ email, password }) => {
    const response = await fetch(`${API_BASE}?route=login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    });

    const data = await parseJson(response);

    if (!response.ok || data.success === false) {
      throw new Error(data.message || 'Login failed');
    }

    setUser(data.data?.user || null);
    return data;
  }, [parseJson]);

  const fetchMe = useCallback(async () => {
    const response = await fetch(`${API_BASE}?route=me`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      credentials: 'include',
    });

    const data = await parseJson(response);

    if (!response.ok || data.success === false) {
      setUser(null);
      return null;
    }

    const resolvedUser = data.data?.user || null;
    setUser(resolvedUser);
    return resolvedUser;
  }, [parseJson]);

  const logout = useCallback(async () => {
    try {
      await fetch(`${API_BASE}?route=logout`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
        },
        credentials: 'include',
      });
    } finally {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      try {
        await fetchMe();
      } finally {
        setAuthLoading(false);
      }
    };

    init();
  }, [fetchMe]);

  const value = useMemo(
    () => ({
      user,
      authLoading,
      isAuthenticated: !!user,
      register,
      login,
      logout,
      fetchMe,
    }),
    [user, authLoading, register, login, logout, fetchMe]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuthContext must be used within AuthProvider');
  }

  return context;
}
