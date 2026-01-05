import {type NginxConfig} from '../types'

export function addServer(config: NginxConfig): void {
  config.http.servers.push({
    listen: '80',
    server_name: [],
    server_name_str: '',
    root: '/var/www/html',
    index: 'index.html index.htm',
    access_log: {
      path: '/var/log/nginx/access.log',
      format: 'combined',
      custom_format: ''
    },
    locations: []
  })
}

export function removeServer(config: NginxConfig, index: number): void {
  config.http.servers.splice(index, 1)
}

export function updateServerName(config: NginxConfig, index: number, value: string): void {
  if (config.http.servers[index]) {
    config.http.servers[index].server_name = value.split(' ').filter(n => n.trim())
  }
}

export function addLocation(config: NginxConfig, serverIndex: number): void {
  const server = config.http.servers[serverIndex]
  if (!server) return

  server.locations.push({
    path: '/',
    proxy_type: 'none',
    proxy_pass: '',
    proxy_set_host: '$host',
    proxy_set_real_ip: '$remote_addr',
    proxy_set_xff: '$proxy_add_x_forwarded_for',
    proxy_timeout: 60,
    proxy_websocket: false,
    fastcgi_pass: '',
    fastcgi_param: '',
    alias: '',
    try_files: '$uri $uri/ =404',
    rewrite: ''
  })
}

export function removeLocation(config: NginxConfig, serverIndex: number, locationIndex: number): void {
  const server = config.http.servers[serverIndex]
  if (!server) return
  server.locations.splice(locationIndex, 1)
}

export function addUpstream(config: NginxConfig): void {
  config.http.upstreams.push({
    name: 'backend',
    lb_method: '',
    servers: [
      {
        address: '127.0.0.1:8080',
        weight: 1,
        max_fails: 1,
        fail_timeout: 10,
        backup: false,
        down: false
      }
    ]
  })
}

export function removeUpstream(config: NginxConfig, index: number): void {
  config.http.upstreams.splice(index, 1)
}

export function addUpstreamServer(config: NginxConfig, upstreamIndex: number): void {
  const upstream = config.http.upstreams[upstreamIndex]
  if (!upstream) return

  upstream.servers.push({
    address: '127.0.0.1:8080',
    weight: 1,
    max_fails: 1,
    fail_timeout: 10,
    backup: false,
    down: false
  })
}

export function removeUpstreamServer(config: NginxConfig, upstreamIndex: number, serverIndex: number): void {
  const upstream = config.http.upstreams[upstreamIndex]
  if (!upstream) return
  upstream.servers.splice(serverIndex, 1)
}
