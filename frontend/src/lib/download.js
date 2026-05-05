export async function downloadWithAuth(url, filename) {
  // Build absolute URL if a relative path is provided
  const isAbsolute = /^(https?:)?\/\//i.test(url)
  const base = (typeof process !== 'undefined' && process.env && process.env.API_URL) || 'http://localhost:5000/api'
  const fullUrl = isAbsolute ? url : `${base}${url.startsWith('/') ? '' : '/'}${url}`

  const token = localStorage.getItem('token')
  const res = await fetch(fullUrl, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      Accept: 'application/pdf',
    },
  })
  if (!res.ok) {
    // Try to surface server error message if available
    let message = `Failed to download (HTTP ${res.status})`
    try {
      const contentType = res.headers.get('content-type') || ''
      if (contentType.includes('application/json')) {
        const j = await res.json()
        message = j.message || message
      } else {
        const text = await res.text()
        if (text) message = text
      }
    } catch {}
    throw new Error(message)
  }

  const blob = await res.blob()
  const blobUrl = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = blobUrl
  if (filename) a.download = filename
  a.target = '_blank'
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(blobUrl)
}
