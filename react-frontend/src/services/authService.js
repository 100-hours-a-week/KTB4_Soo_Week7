import { apiRequest } from './apiClient';

export async function login({ email, password }) {
  const body = await apiRequest('/api/v1/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
    auth: false,
  });

  const tokenPayload = body?.data ?? body;
  if (!tokenPayload?.accessToken) {
    throw new Error('로그인 응답에 accessToken이 없습니다.');
  }

  return tokenPayload;
}
