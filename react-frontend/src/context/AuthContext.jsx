import { useEffect, useMemo, useState } from 'react';
import { AuthContext } from './auth-context';

export function AuthProvider({ children }) {
  const [accessToken, setAccessToken] = useState(() => localStorage.getItem('accessToken'));

  useEffect(() => {
    const handleUnauthorized = () => setAccessToken(null);
    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, []);

  const value = useMemo(() => ({
    isLoggedIn: Boolean(accessToken),
    completeLogin(tokenPayload, email) {
      localStorage.setItem('accessToken', tokenPayload.accessToken);
      if (tokenPayload.refreshToken) {
        localStorage.setItem('refreshToken', tokenPayload.refreshToken);
      }
      localStorage.setItem('loginUserEmail', email);
      setAccessToken(tokenPayload.accessToken);
    },
    logout() {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('loginUserEmail');
      localStorage.removeItem('loginUserNickname');
      setAccessToken(null);
    },
  }), [accessToken]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
