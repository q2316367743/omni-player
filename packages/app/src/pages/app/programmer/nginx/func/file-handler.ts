import { open, save } from '@tauri-apps/plugin-dialog'
import { readTextFile, writeTextFile } from '@tauri-apps/plugin-fs'
import { type NginxConfig } from '../types'
import MessageUtil from "@/util/model/MessageUtil.ts";

export async function importNginxConfig(config: NginxConfig): Promise<void> {
  try {
    const selected = await open({
      multiple: false,
      filters: [
        {
          name: 'Nginx Config',
          extensions: ['conf', 'txt']
        }
      ]
    })

    if (selected) {
      const content = await readTextFile(selected)
      parseNginxConfig(content, config)
      MessageUtil.success('配置导入成功')
    }
  } catch (error) {
    MessageUtil.error('配置导入失败: ' + (error as Error).message)
  }
}

export async function exportNginxConfig(configContent: string): Promise<void> {
  try {
    const filePath = await save({
      filters: [
        {
          name: 'Nginx Config',
          extensions: ['conf']
        }
      ],
      defaultPath: 'nginx.conf'
    })

    if (filePath) {
      await writeTextFile(filePath, configContent)
      MessageUtil.success('配置导出成功')
    }
  } catch (error) {
    MessageUtil.error('配置导出失败: ' + (error as Error).message)
  }
}

function parseNginxConfig(content: string, config: NginxConfig): void {
  const lines = content.split('\n')
  
  lines.forEach(line => {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) return

    if (trimmed.startsWith('worker_processes')) {
      const match = trimmed.match(/worker_processes\s+(\d+)/)
      if (match?.[1]) {
        config.worker_processes = parseInt(match[1])
      }
    } else if (trimmed.startsWith('error_log')) {
      const match = trimmed.match(/error_log\s+(\S+)\s+(\w+)/)
      if (match?.[1] && match?.[2]) {
        config.error_log.path = match[1]
        config.error_log.level = match[2]
      }
    } else if (trimmed.startsWith('pid')) {
      const match = trimmed.match(/pid\s+(\S+)/)
      if (match?.[1]) {
        config.pid = match[1]
      }
    }
  })
}
