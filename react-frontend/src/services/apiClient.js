const ACCESS_TOKEN_KEY = 'accessToken';

export class ApiError extends Error {
  constructor(response, body) {
    super(body?.message || `API 요청에 실패했습니다. (${response.status})`);
    this.name = 'ApiError';
    this.status = response.status;
    this.code = body?.code;
    this.body = body;
  }
}

async function parseBody(response) {
  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export async function apiRequest(path, options = {}) {
  const { auth = true, headers, ...fetchOptions } = options;
  const requestHeaders = new Headers(headers);
  const token = localStorage.getItem(ACCESS_TOKEN_KEY);

  if (auth && token) {
    requestHeaders.set('Authorization', `Bearer ${token}`);
  }

  if (fetchOptions.body && !(fetchOptions.body instanceof FormData)) {
    requestHeaders.set('Content-Type', 'application/json');
  }

  let response;
  try {
    response = await fetch(path, { ...fetchOptions, headers: requestHeaders });
  } catch {
    throw new Error('서버와 통신할 수 없습니다. 잠시 후 다시 시도해주세요.');
  }

  const body = await parseBody(response);

  if (!response.ok) {
    if (response.status === 401 && auth) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      window.dispatchEvent(new Event('auth:unauthorized'));
    }
    throw new ApiError(response, body);
  }

  return body;
}
