const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

function getApiBaseUrl() {
  return '/api';
}

function saveTokens(tokenResponse) {
  const normalized = tokenResponse?.accessToken
    ? tokenResponse
    : tokenResponse?.data?.accessToken
      ? tokenResponse.data
      : tokenResponse?.data
        ? tokenResponse.data
        : null;

  if (!normalized?.accessToken) {
    throw new Error('로그인 응답에 accessToken이 없습니다.');
  }

  localStorage.setItem(ACCESS_TOKEN_KEY, normalized.accessToken);

  if (normalized.refreshToken) {
    localStorage.setItem(REFRESH_TOKEN_KEY, normalized.refreshToken);
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

  const tokenPayload = parsedBody?.data ?? parsedBody;
  console.log('login response body', parsedBody);
  console.log('token payload', tokenPayload);
  saveTokens(tokenPayload);
  localStorage.setItem('loginUserEmail', email);
  console.log('saved access token', localStorage.getItem('accessToken'));

  return tokenPayload;
}
