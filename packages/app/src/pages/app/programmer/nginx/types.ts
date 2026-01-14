export interface LogLevel {
  path: string
  level: string
}

export interface AccessLog {
  path: string
  format: string
  custom_format: string
  preview?: string
}

export interface Location {
  path: string
  proxy_type: 'none' | 'reverse' | 'fastcgi'
  proxy_pass?: string
  proxy_set_host?: string
  proxy_set_real_ip?: string
  proxy_set_xff?: string
  proxy_timeout?: number
  proxy_websocket?: boolean
  fastcgi_pass?: string
  fastcgi_param?: string
  alias?: string
  try_files?: string
  rewrite?: string
}

export interface Server {
  listen: string
  server_name: string[]
  server_name_str: string
  root: string
  index: string
  access_log: AccessLog
  locations: Location[]
}

export interface UpstreamServer {
  address: string
  weight: number
  max_fails: number
  fail_timeout: number
  backup: boolean
  down: boolean
}

export interface Upstream {
  name: string
  lb_method: string
  servers: UpstreamServer[]
}

export interface HttpConfig {
  mime_types: string
  default_type: string
  sendfile: boolean
  tcp_nopush: boolean
  tcp_nodelay: boolean
  keepalive_timeout: number
  gzip: boolean
  gzip_http_version: string
  gzip_comp_level: number
  gzip_types: string
  servers: Server[]
  upstreams: Upstream[]
}

export interface EventsConfig {
  worker_connections: number
  use: string
  multi_accept: boolean
}

export interface NginxConfig {
  worker_processes: number
  error_log: LogLevel
  pid: string
  events: EventsConfig
  http: HttpConfig
}
