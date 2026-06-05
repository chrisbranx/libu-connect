const API_URL = '/api/v1';

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('accessToken');
  const config = {
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...options.headers },
    ...options,
  };
  if (config.body && typeof config.body === 'object' && !(config.body instanceof FormData)) {
    config.body = JSON.stringify(config.body);
  }

  const res = await fetch(`${API_URL}${endpoint}`, config);

  if (res.status === 401) {
    const refreshed = await refreshToken();
    if (refreshed) {
      const newToken = localStorage.getItem('accessToken');
      config.headers.Authorization = `Bearer ${newToken}`;
      const retryRes = await fetch(`${API_URL}${endpoint}`, config);
      return handleResponse(retryRes);
    }
    localStorage.removeItem('accessToken');
    window.location.href = '/login';
    throw new Error('Session expired');
  }

  return handleResponse(res);
}

async function handleResponse(res) {
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Something went wrong');
  return data;
}

async function refreshToken() {
  try {
    const res = await fetch(`${API_URL}/auth/refresh`, { method: 'POST', credentials: 'include' });
    if (!res.ok) return false;
    const data = await res.json();
    localStorage.setItem('accessToken', data.data.accessToken);
    return true;
  } catch { return false; }
}

export const api = {
  get: (url) => request(url, { method: 'GET' }),
  post: (url, body) => request(url, { method: 'POST', body }),
  put: (url, body) => request(url, { method: 'PUT', body }),
  delete: (url) => request(url, { method: 'DELETE' }),
  upload: (url, formData) => request(url, { method: 'POST', body: formData, headers: {} }),
};