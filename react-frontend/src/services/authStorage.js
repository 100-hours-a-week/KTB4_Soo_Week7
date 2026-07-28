const AUTH_STORAGE_KEYS = [
  'accessToken',
  'refreshToken',
  'loginUserEmail',
  'loginUserNickname',
];

export function clearAuthStorage() {
  AUTH_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key));
}
