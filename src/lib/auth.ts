import Cookies from 'js-cookie';

export const setAuthToken = (token: string) => {
  Cookies.set('token', token, { expires: 7, path: '/' });
  localStorage.setItem('token', token);
};

export const removeAuthToken = () => {
  Cookies.remove('token', { path: '/' });
  localStorage.removeItem('token');
};

export const isAuthenticated = (): boolean => {
  if (typeof window === 'undefined') return false;
  return !!Cookies.get('token') || !!localStorage.getItem('token');
};