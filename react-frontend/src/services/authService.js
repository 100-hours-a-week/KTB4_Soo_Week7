const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

function getApiBaseUrl() {
  return '/api';
}

function saveTokens(tokenResponse) {
  if (!tokenResponse?.accessToken) {
    throw new Error('로그인 응답에 accessToken이 없습니다.');
  }

  localStorage.setItem(ACCESS_TOKEN_KEY, tokenResponse.accessToken);

  if (tokenResponse.refreshToken) {
    localStorage.setItem(REFRESH_TOKEN_KEY, tokenResponse.refreshToken);
  }
}

export async function login({ email, password }) {
  const response = await fetch(`${getApiBaseUrl()}/api/v1/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  const text = await response.text();
  const parsedBody = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const errorCode = parsedBody?.code || 'LOGIN_FAILED';
    const errorMessage = parsedBody?.message || '로그인에 실패했습니다.';
    throw { code: errorCode, message: errorMessage };
  }

  saveTokens(parsedBody?.data);
  localStorage.setItem('loginUserEmail', email);

  return parsedBody?.data;
}
