import Cookies from 'js-cookie';

export const setAuthToken = (token: string, refreshToken?: string) => {
  Cookies.set('token', token, { expires: 7, path: '/' });

  if (refreshToken) {
    Cookies.set('refresh_token', refreshToken, { expires: 30, path: '/' });
  }
};

export const removeAuthToken = () => {
  Cookies.remove('token', { path: '/' });
  Cookies.remove('refresh_token', { path: '/' });
};

export const getRefreshToken = (): string | undefined => {
  if (typeof window === 'undefined') return undefined;
  return Cookies.get('refresh_token');
};

export const isAuthenticated = (): boolean => {
  if (typeof window === 'undefined') return false;
  return !!Cookies.get('token');
};