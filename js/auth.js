const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

function getAccessToken() {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
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

function clearAuth() {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem('loginUserEmail');
    localStorage.removeItem('loginUserNickname');
}

function createAuthHeaders(headers = {}) {
    const authHeaders = new Headers(headers);
    const accessToken = getAccessToken();

    if (accessToken) {
        authHeaders.set('Authorization', `Bearer ${accessToken}`);
    }

    return authHeaders;
}

function authFetch(url, options = {}) {
    return fetch(url, {
        ...options,
        headers: createAuthHeaders(options.headers)
    }).then(response => {
        if (response.status === 401) {
            clearAuth();
            window.location.href = '../login/index.html';
        }

        return response;
    });
}

document.querySelectorAll('a[href="../login/index.html"]').forEach(logoutLink => {
    if (logoutLink.textContent.trim() === '로그아웃') {
        logoutLink.addEventListener('click', clearAuth);
    }
});
