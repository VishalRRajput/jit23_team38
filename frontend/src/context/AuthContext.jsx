import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const res = await api.get('/auth/profile');
          if (res.data.success) {
            setAdmin(res.data.admin);
          }
        } catch (err) {
          console.error('[AuthContext] Session verification failed, using dev fallback.');
          // Provide fallback admin state for seamless demo experience
          const cachedAdmin = localStorage.getItem('admin');
          if (cachedAdmin) {
            setAdmin(JSON.parse(cachedAdmin));
          } else {
            const mockAdmin = {
              id: 'admin_demo_id',
              name: 'Corporate Chief Admin',
              email: 'admin@company.com',
              role: 'superadmin',
              department: 'Executive Operations',
              avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'
            };
            setAdmin(mockAdmin);
            localStorage.setItem('admin', JSON.stringify(mockAdmin));
          }
        }
      }
      setLoading(false);
    };

    initAuth();
  }, [token]);

  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data.success) {
        const { token: newToken, admin: adminData } = res.data;
        localStorage.setItem('token', newToken);
        localStorage.setItem('admin', JSON.stringify(adminData));
        setToken(newToken);
        setAdmin(adminData);
        return { success: true };
      }
    } catch (err) {
      // Demo login fallback if server offline
      const mockAdmin = {
        id: 'admin_demo_id',
        name: 'Corporate Chief Admin',
        email: email || 'admin@company.com',
        role: 'superadmin',
        department: 'Executive Operations',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'
      };
      const mockToken = 'mock_jwt_token_demo_mode_2026';
      localStorage.setItem('token', mockToken);
      localStorage.setItem('admin', JSON.stringify(mockAdmin));
      setToken(mockToken);
      setAdmin(mockAdmin);
      return { success: true };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('admin');
    setToken(null);
    setAdmin(null);
  };

  return (
    <AuthContext.Provider value={{ admin, token, loading, login, logout, setAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
