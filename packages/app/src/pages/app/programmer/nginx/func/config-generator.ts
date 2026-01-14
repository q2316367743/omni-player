import {type NginxConfig} from '../types'

export function generateNginxConfig(config: NginxConfig): string {
  const lines: string[] = []

  lines.push('worker_processes ' + config.worker_processes + ';')
  lines.push('')
  lines.push('error_log ' + config.error_log.path + ' ' + config.error_log.level + ';')
  lines.push('pid ' + config.pid + ';')
  lines.push('')

  lines.push('events {')
  lines.push('    worker_connections ' + config.events.worker_connections + ';')
  if (config.events.use) {
    lines.push('    use ' + config.events.use + ';')
  }
  if (config.events.multi_accept) {
    lines.push('    multi_accept on;')
  }
  lines.push('}')
  lines.push('')

  lines.push('http {')
  lines.push('    include ' + config.http.mime_types + ';')
  lines.push('    default_type ' + config.http.default_type + ';')
  lines.push('')

  if (config.http.sendfile) {
    lines.push('    sendfile on;')
  } else {
    lines.push('    sendfile off;')
  }

  if (config.http.tcp_nopush) {
    lines.push('    tcp_nopush on;')
  } else {
    lines.push('    tcp_nopush off;')
  }

  if (config.http.tcp_nodelay) {
    lines.push('    tcp_nodelay on;')
  } else {
    lines.push('    tcp_nodelay off;')
  }

  lines.push('    keepalive_timeout ' + config.http.keepalive_timeout + ';')
  lines.push('')

  if (config.http.gzip) {
    lines.push('    gzip on;')
    lines.push('    gzip_http_version ' + config.http.gzip_http_version + ';')
    lines.push('    gzip_comp_level ' + config.http.gzip_comp_level + ';')
    lines.push('    gzip_types ' + config.http.gzip_types + ';')
    lines.push('')
  }

  config.http.upstreams.forEach(upstream => {
    lines.push('    upstream ' + upstream.name + ' {')
    if (upstream.lb_method) {
      lines.push('        ' + upstream.lb_method + ';')
    }
    upstream.servers.forEach(server => {
      let serverLine = '        server ' + server.address
      const params: string[] = []
      if (server.weight !== 1) params.push('weight=' + server.weight)
      if (server.max_fails !== 1) params.push('max_fails=' + server.max_fails)
      if (server.fail_timeout !== 10) params.push('fail_timeout=' + server.fail_timeout)
      if (server.backup) params.push('backup')
      if (server.down) params.push('down')
      if (params.length > 0) {
        serverLine += ' ' + params.join(' ')
      }
      serverLine += ';'
      lines.push(serverLine)
    })
    lines.push('    }')
    lines.push('')
  })

  config.http.servers.forEach(server => {
    lines.push('    server {')
    lines.push('        listen ' + server.listen + ';')
    if (server.server_name.length > 0) {
      lines.push('        server_name ' + server.server_name.join(' ') + ';')
    }
    if (server.root) {
      lines.push('        root ' + server.root + ';')
    }
    if (server.index) {
      lines.push('        index ' + server.index + ';')
    }
    if (server.access_log.path) {
      if (server.access_log.custom_format) {
        lines.push('        access_log ' + server.access_log.path + ' custom_format;')
      } else if (server.access_log.format) {
        lines.push('        access_log ' + server.access_log.path + ' ' + server.access_log.format + ';')
      } else {
        lines.push('        access_log ' + server.access_log.path + ';')
      }
    }
    lines.push('')

    server.locations.forEach(location => {
      lines.push('        location ' + location.path + ' {')

      if (location.proxy_type === 'reverse' && location.proxy_pass) {
        lines.push('            proxy_pass ' + location.proxy_pass + ';')
        if (location.proxy_set_host) {
          lines.push('            proxy_set_header Host ' + location.proxy_set_host + ';')
        }
        if (location.proxy_set_real_ip) {
          lines.push('            proxy_set_header X-Real-IP ' + location.proxy_set_real_ip + ';')
        }
        if (location.proxy_set_xff) {
          lines.push('            proxy_set_header X-Forwarded-For ' + location.proxy_set_xff + ';')
        }
        if (location.proxy_timeout) {
          lines.push('            proxy_connect_timeout ' + location.proxy_timeout + ';')
          lines.push('            proxy_send_timeout ' + location.proxy_timeout + ';')
          lines.push('            proxy_read_timeout ' + location.proxy_timeout + ';')
        }
        if (location.proxy_websocket) {
          lines.push('            proxy_http_version 1.1;')
          lines.push('            proxy_set_header Upgrade $http_upgrade;')
          lines.push('            proxy_set_header Connection "upgrade";')
        }
      }

      if (location.proxy_type === 'fastcgi' && location.fastcgi_pass) {
        lines.push('            fastcgi_pass ' + location.fastcgi_pass + ';')
        if (location.fastcgi_param) {
          const params = location.fastcgi_param.split('\n').filter(p => p.trim())
          params.forEach(param => {
            lines.push('            fastcgi_param ' + param.trim() + ';')
          })
        }
      }

      if (location.alias) {
        lines.push('            alias ' + location.alias + ';')
      }
      if (location.try_files) {
        lines.push('            try_files ' + location.try_files + ';')
      }
      if (location.rewrite) {
        const rewrites = location.rewrite.split('\n').filter(r => r.trim())
        rewrites.forEach(rewrite => {
          lines.push('            rewrite ' + rewrite.trim() + ';')
        })
      }

      lines.push('        }')
      lines.push('')
    })

    lines.push('    }')
    lines.push('')
  })

  lines.push('}')

  return lines.join('\n')
}
