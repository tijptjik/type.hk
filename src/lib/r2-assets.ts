// Public generated assets live under this site's prefix in tjikos-assets.
// Registry/index metadata remains part of the static site.
export function assetKey(pathname: string): string | null {
  if (
    /^\/(?:os-previews|project-previews|os-icons|rose-punk-icons)\/[^/].*/.test(pathname) ||
    /^\/rose-punk-releases\/\d+\.\d+\.\d+(?:-[\w.-]+)?\/.+/.test(pathname) ||
    /^\/run-particles\.(gif|webp)$/.test(pathname)
  ) {
    return `typehk${pathname}`
  }
  return null
}

function objectHeaders(object: R2Object): Headers {
  const headers = new Headers()
  object.writeHttpMetadata(headers)
  headers.set('ETag', object.httpEtag)
  headers.set('Last-Modified', object.uploaded.toUTCString())
  headers.set('Accept-Ranges', 'bytes')
  headers.set('X-Content-Type-Options', 'nosniff')
  if (!headers.has('Cache-Control')) headers.set('Cache-Control', 'public, max-age=300')
  return headers
}

export async function assetResponse(request: Request, bucket: R2Bucket, key: string): Promise<Response> {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    return new Response('Method not allowed', { status: 405, headers: { Allow: 'GET, HEAD' } })
  }
  // HEAD ignores Range. R2 reads are streamed, including video byte ranges.
  const head = await bucket.head(key)
  if (!head) return new Response('Asset not found', { status: 404 })
  const headers = objectHeaders(head)
  const match = request.headers.get('If-None-Match')
  const modified = request.headers.get('If-Modified-Since')
  if (
    (match && (match === '*' || match.split(',').some(tag => tag.trim().replace(/^W\//, '') === head.httpEtag))) ||
    (!match && modified && head.uploaded.getTime() < Date.parse(modified) + 1000)
  ) {
    return new Response(null, { status: 304, headers })
  }
  if (request.method === 'HEAD') {
    headers.set('Content-Length', String(head.size))
    return new Response(null, { headers })
  }
  const rangeHeader = request.headers.get('Range')
  const ifRange = request.headers.get('If-Range')
  const allowRange = !ifRange || ifRange === head.httpEtag ||
    head.uploaded.getTime() < Date.parse(ifRange) + 1000
  let range: { offset: number; length: number } | undefined
  if (rangeHeader && allowRange) {
    const parts = /^bytes=(\d*)-(\d*)$/.exec(rangeHeader)
    // Ignore malformed/multiple ranges; serve a full representation.
    if (parts && (parts[1] || parts[2])) {
      const suffix = parts[1] === ''
      const start = suffix ? Math.max(0, head.size - Number(parts[2])) : Number(parts[1])
      const end = suffix || parts[2] === '' ? head.size - 1 : Math.min(Number(parts[2]), head.size - 1)
      if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start > end || start >= head.size) {
        headers.set('Content-Range', `bytes */${head.size}`)
        return new Response(null, { status: 416, headers })
      }
      range = { offset: start, length: end - start + 1 }
    }
  }
  // Pin the body to the metadata version. A concurrent replacement is retried
  // by the client, never served with stale range/length/ETag headers.
  const object = await bucket.get(key, { onlyIf: { etagMatches: head.etag }, ...(range ? { range } : {}) })
  if (!object || !('body' in object)) {
    return new Response('Asset changed; retry request', { status: 503, headers: { 'Retry-After': '1' } })
  }
  headers.set('Content-Length', String(range?.length ?? head.size))
  if (range) headers.set('Content-Range', `bytes ${range.offset}-${range.offset + range.length - 1}/${head.size}`)
  return new Response(object.body, { status: range ? 206 : 200, headers })
}
