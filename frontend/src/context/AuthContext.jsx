import React, { createContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('transit_token'));
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode(token);
        
        // Check expiration
        const currentTime = Date.now() / 1000;
        if (decoded.exp < currentTime) {
          logout();
        } else {
          setUser({
            email: decoded.sub,
            name: decoded.name,
            role: decoded.role
          });
          setIsAuthenticated(true);
        }
      } catch (err) {
        console.error('Invalid token', err);
        logout();
      }
    } else {
      setUser(null);
      setIsAuthenticated(false);
    }
    setLoading(false);
  }, [token]);

  const login = async (email, password) => {
    try {
      const response = await axios.post('http://localhost:8080/api/auth/login', {
        email,
        password
      });

      // API Response: { success: true, message: "...", data: { token: "..." } }
      const responseData = response.data;
      if (responseData.success && responseData.data && responseData.data.token) {
        const jwtToken = responseData.data.token;
        localStorage.setItem('transit_token', jwtToken);
        setToken(jwtToken);
        return { success: true };
      } else {
        return { success: false, message: responseData.message || 'Login failed' };
      }
    } catch (error) {
      const errMsg = error.response?.data?.message || 'Invalid email or password';
      return { success: false, message: errMsg };
    }
  };

  const logout = () => {
    localStorage.removeItem('transit_token');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{
      token,
      user,
      isAuthenticated,
      loading,
      login,
      logout
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
