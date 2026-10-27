import { describe, expect, test } from 'bun:test'
import { assetKey, assetResponse } from '../src/lib/r2-assets'

const bytes = new TextEncoder().encode('0123456789')
function bucket() {
  const metadata = {
    size: bytes.length,
    etag: 'version-one',
    httpEtag: '"version-one"',
    uploaded: new Date('2026-10-27T00:00:00Z'),
    writeHttpMetadata(headers) { headers.set('Content-Type', 'video/mp4') },
  }
  return {
    async head() { return metadata },
    async get(key, options) {
      const range = options?.range
      const data = range ? bytes.slice(range.offset, range.offset + range.length) : bytes
      return { ...metadata, body: new Blob([data]).stream() }
    },
  }
}
const request = (headers = {}, method = 'GET') => new Request('https://type.hk/os-previews/test.mp4', { method, headers })

describe('R2 generated assets', () => {
  test('keeps registry/index and application routes in static assets', () => {
    expect(assetKey('/rose-punk-releases/registry.json')).toBeNull()
    expect(assetKey('/rose-punk-releases/index.html')).toBeNull()
    expect(assetKey('/themes/rose-punk')).toBeNull()
    expect(assetKey('/contact.vcf')).toBeNull()
    expect(assetKey('/private/secret')).toBeNull()
    expect(assetKey('/rose-punk-releases/0.1.0-rc.1/rose-punk.zip')).toBe('typehk/rose-punk-releases/0.1.0-rc.1/rose-punk.zip')
  })
  test('serves full streaming responses and HEAD metadata', async () => {
    const response = await assetResponse(request(), bucket(), 'key')
    expect(response.status).toBe(200)
    expect(response.headers.get('Content-Type')).toBe('video/mp4')
    expect(await response.text()).toBe('0123456789')
    const head = await assetResponse(request({}, 'HEAD'), bucket(), 'key')
    expect(head.headers.get('Content-Length')).toBe('10')
    expect(await head.text()).toBe('')
  })
  test('supports video seeking, open ranges and suffixes', async () => {
    for (const [range, text, contentRange] of [
      ['bytes=2-5', '2345', 'bytes 2-5/10'],
      ['bytes=7-', '789', 'bytes 7-9/10'],
      ['bytes=-3', '789', 'bytes 7-9/10'],
    ]) {
      const response = await assetResponse(request({ Range: range }), bucket(), 'key')
      expect(response.status).toBe(206)
      expect(response.headers.get('Content-Range')).toBe(contentRange)
      expect(await response.text()).toBe(text)
    }
  })
  test('rejects unsatisfiable ranges and respects If-Range', async () => {
    const invalid = await assetResponse(request({ Range: 'bytes=20-' }), bucket(), 'key')
    expect(invalid.status).toBe(416)
    expect(invalid.headers.get('Content-Range')).toBe('bytes */10')
    const changed = await assetResponse(request({ Range: 'bytes=2-5', 'If-Range': '"old"' }), bucket(), 'key')
    expect(changed.status).toBe(200)
    expect(await changed.text()).toBe('0123456789')
  })
  test('returns 304 for matching ETags and 404 for missing assets', async () => {
    const response = await assetResponse(request({ 'If-None-Match': '"other", W/"version-one"' }), bucket(), 'key')
    expect(response.status).toBe(304)
    expect(await response.text()).toBe('')
    const missing = await assetResponse(request(), { async head() { return null } }, 'key')
    expect(missing.status).toBe(404)
    const post = await assetResponse(request({}, 'POST'), bucket(), 'key')
    expect(post.status).toBe(405)
  })
  test('does not serve stale metadata during a concurrent replacement', async () => {
    const data = bucket()
    data.get = async () => ({ etag: 'changed' })
    const response = await assetResponse(request(), data, 'key')
    expect(response.status).toBe(503)
  })
})
