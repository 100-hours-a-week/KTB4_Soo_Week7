import { authFetch } from './auth.js';
import { parseResponseBody } from './utils.js';

export class ApiError extends Error {
    constructor(response, body) {
        super(body?.message || `API 요청에 실패했습니다. (${response.status})`);
        this.name = 'ApiError';
        this.status = response.status;
        this.code = body?.code;
        this.body = body;
    }
}

async function request(fetcher, url, options) {
    const response = await fetcher(url, options);
    const body = await parseResponseBody(response);

    if (!response.ok) {
        throw new ApiError(response, body);
    }

    return body;
}

export function apiFetch(url, options = {}) {
    return request(authFetch, url, options);
}

export function publicApiFetch(url, options = {}) {
    return request(fetch, url, options);
}

export function handleApiError(error, showServerError, networkMessage = '서버와 통신 중 오류가 발생했습니다.') {
    if (error instanceof ApiError) {
        showServerError(error.code, error.message);
        return;
    }

    console.error('통신 에러 발생:', error);
    alert(networkMessage);
}
