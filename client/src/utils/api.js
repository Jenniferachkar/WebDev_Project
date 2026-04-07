const baseUrl = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '')

function buildUrl(path) {
  if (/^https?:\/\//.test(path)) {
    return path
  }

  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${baseUrl}${normalizedPath}`
}

async function request(method, path, body) {
  const response = await fetch(
    buildUrl(path),
    {
      method,
      credentials: 'include',
      ...(body && method !== 'GET'
        ? {
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
          }
        : {}),
    },
  )

  const contentType = response.headers.get('content-type') || ''
  const payload = contentType.includes('application/json')
    ? await response.json()
    : await response.text()

  if (!response.ok) {
    const message = typeof payload === 'object'
      ? payload.error || payload.message || `HTTP ${response.status}`
      : payload || `HTTP ${response.status}`

    const error = new Error(message)
    error.status = response.status
    error.payload = payload
    throw error
  }

  return payload
}

export const api = {
  get(path) {
    return request('GET', path)
  },
  post(path, body) {
    return request('POST', path, body)
  },
  put(path, body) {
    return request('PUT', path, body)
  },
  delete(path) {
    return request('DELETE', path)
  },
}
