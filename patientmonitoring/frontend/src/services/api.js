const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

async function request(method, path, body) {
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };
  if (body !== undefined) opts.body = JSON.stringify(body);

  let res;
  try {
    res = await fetch(BASE_URL + path, opts);
  } catch {
    throw new Error('Cannot connect to backend. Check server and API URL.');
  }

  if (!res.ok) {
    const text = await res.text();
    let details = text;
    try {
      const json = JSON.parse(text);
      details = json.message || json.error || text;
    } catch {
      // Keep raw text if body is not JSON.
    }
    throw new Error(`${method} ${path} failed (${res.status})${details ? `: ${details}` : ''}`);
  }

  const contentType = res.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return res.json();
  }
  return res.text();
}

const api = {
  get:    (path)        => request('GET',    path),
  post:   (path, body)  => request('POST',   path, body),
  put:    (path, body)  => request('PUT',    path, body),
  delete: (path)        => request('DELETE', path),
};

export default api;
