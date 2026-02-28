import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { login as apiLogin, getMe } from '../services/api';

interface Admin {
  _id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

interface AuthCtx {
  admin: Admin | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthCtx>({} as AuthCtx);

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('admin_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      getMe()
        .then((r) => setAdmin(r.data.data))
        .catch(() => {
          localStorage.removeItem('admin_token');
          setToken(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (email: string, password: string) => {
    const res = await apiLogin(email, password);
    const { token: t, admin: a } = res.data.data;
    localStorage.setItem('admin_token', t);
    setToken(t);
    setAdmin(a);
  };

  const logout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    setToken(null);
    setAdmin(null);
  };

  return (
    <AuthContext.Provider value={{ admin, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
