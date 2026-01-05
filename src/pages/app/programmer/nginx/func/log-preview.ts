import type { Server } from '../types'

export function previewLogFormat(server: Server): void {
  const template = server.access_log.custom_format
  if (!template) {
    server.access_log.preview = ''
    return
  }

  const sampleData: Record<string, string> = {
    '$remote_addr': '192.168.1.100',
    '$remote_user': 'john',
    '$time_local': '[05/Jan/2026:10:30:45 +0800]',
    '$request': 'GET /api/users HTTP/1.1',
    '$status': '200',
    '$body_bytes_sent': '1234',
    '$http_referer': 'https://example.com',
    '$http_user_agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    '$http_x_forwarded_for': '192.168.1.100',
    '$request_time': '0.123',
    '$upstream_response_time': '0.098',
    '$scheme': 'https',
    '$host': 'example.com',
    '$uri': '/api/users',
    '$request_uri': '/api/users?id=123',
    '$document_root': '/var/www/html',
    '$filename': '/var/www/html/index.html'
  }

  let preview = template
  Object.keys(sampleData).forEach(key => {
    const value = sampleData[key]
    if (value !== undefined) {
      preview = preview.replace(new RegExp(key.replace('$', '\\$'), 'g'), value)
    }
  })

  server.access_log.preview = preview
}
