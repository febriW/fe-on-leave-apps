import axios from 'axios';
import Cookies from 'js-cookie';

const API_BASE_URL = 'http://localhost:3000';

export const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = Cookies.get('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = Cookies.get('refresh_token');
        if (!refreshToken) throw new Error("No refresh token available");

        const res = await axios.post(`${API_BASE_URL}/auth/refresh`, { 
          refresh_token: refreshToken 
        });

        if (res.status === 200 || res.status === 201) {
          const { access_token, refresh_token } = res.data.data;
          setTokens(access_token, refresh_token);
          originalRequest.headers.Authorization = `Bearer ${access_token}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        clearTokens();
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export const getErrorMessage = (err: any, fallback: string) => {
  return err.response?.data?.message || err.response?.data?.error || fallback;
};

export const setTokens = (accessToken: string, refreshToken: string) => {
  localStorage.setItem('access_token', accessToken);
  localStorage.setItem('refresh_token', refreshToken);
  Cookies.set('access_token', accessToken, { expires: 1/12, path: '/' });
  Cookies.set('refresh_token', refreshToken, { expires: 7, path: '/' });
};

export const clearTokens = () => {
  localStorage.clear();
  Cookies.remove('access_token', { path: '/' });
  Cookies.remove('refresh_token', { path: '/' });
};

export const decodeToken = (token: string) => {
  try {
    return JSON.parse(window.atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
  } catch { return null; }
};