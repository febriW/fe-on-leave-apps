import axios from 'axios';
import Cookies from 'js-cookie';

const API_BASE_URL = 'http://localhost:3000';

export const api = axios.create({
  baseURL: API_BASE_URL,
});

export const getErrorMessage = (err: any, fallback: string) => {
  return err.response?.data?.message || err.response?.data?.error || fallback;
};

export const decodeToken = (token: string) => {
  try {
    return JSON.parse(window.atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
  } catch {
    return null;
  }
};

export const setTokens = (accessToken: string, refreshToken: string) => {
  localStorage.setItem('access_token', accessToken);
  localStorage.setItem('refresh_token', refreshToken);
  
  Cookies.set('access_token', accessToken, { expires: 1/12 }); // 2 jam
  Cookies.set('refresh_token', refreshToken, { expires: 7 });
};

export const clearTokens = () => {
  localStorage.clear();
  Cookies.remove('access_token');
  Cookies.remove('refresh_token');
};