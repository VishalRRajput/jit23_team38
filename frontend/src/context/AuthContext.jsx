import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        // If it's a demo token, load cached admin directly
        if (storedToken === 'mock_jwt_token_demo_mode_2026') {
          const cached = localStorage.getItem('admin');
          if (cached) {
            try {
              setAdmin(JSON.parse(cached));
              setToken(storedToken);
              setLoading(false);
              return;
            } catch (e) {}
          }
        }

        try {
          const res = await api.get('/auth/profile');
          if (res.data && res.data.success && res.data.admin) {
            setAdmin(res.data.admin);
            setToken(storedToken);
          } else {
            throw new Error('Invalid session');
          }
        } catch (err) {
          console.warn('[AuthContext] Session expired or invalid. Please sign in.');
          localStorage.removeItem('token');
          localStorage.removeItem('admin');
          setToken(null);
          setAdmin(null);
        }
      } else {
        setToken(null);
        setAdmin(null);
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data && res.data.success) {
        const { token: newToken, admin: adminData } = res.data;
        localStorage.setItem('token', newToken);
        localStorage.setItem('admin', JSON.stringify(adminData));
        setToken(newToken);
        setAdmin(adminData);
        return { success: true };
      }
      return { success: false, message: res.data?.message || 'Login failed' };
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        return { success: false, message: err.response.data.message };
      }
      return { success: false, message: 'Backend unreachable. Ensure server is online or use 1-Click Demo Login.' };
    }
  };

  const register = async (name, email, password, department = 'Management') => {
    try {
      const res = await api.post('/auth/register', { name, email, password, department });
      if (res.data && res.data.success) {
        const { token: newToken, admin: adminData } = res.data;
        localStorage.setItem('token', newToken);
        localStorage.setItem('admin', JSON.stringify(adminData));
        setToken(newToken);
        setAdmin(adminData);
        return { success: true };
      }
      return { success: false, message: res.data?.message || 'Registration failed' };
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        return { success: false, message: err.response.data.message };
      }
      return { success: false, message: 'Backend unreachable. Ensure server is online.' };
    }
  };

  const loginDemo = (role = 'superadmin') => {
    const isSuper = role === 'superadmin';
    const mockAdmin = {
      id: isSuper ? 'admin_demo_super' : 'admin_demo_sec',
      name: isSuper ? 'Corporate Chief Admin' : 'Security Command Officer',
      email: isSuper ? 'admin@company.com' : 'security@company.com',
      role: isSuper ? 'superadmin' : 'operator',
      department: isSuper ? 'Executive Operations' : 'Campus Security',
      avatar: isSuper
        ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'
        : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200'
    };
    const mockToken = 'mock_jwt_token_demo_mode_2026';
    localStorage.setItem('token', mockToken);
    localStorage.setItem('admin', JSON.stringify(mockAdmin));
    setToken(mockToken);
    setAdmin(mockAdmin);
    return { success: true };
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('admin');
    setToken(null);
    setAdmin(null);
  };

  return (
    <AuthContext.Provider value={{ admin, token, loading, login, register, loginDemo, logout, setAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
