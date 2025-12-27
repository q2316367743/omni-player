window.__TAURI_INTERNALS__ = {
  /**
   * 执行指定命令
   * @param cmd {string} 命令
   * @param args {Record<string, any>} 参数
   * @param options {{}} 选项
   */
  invoke: (cmd, args, options) => {
    if (cmd ==='plugin:log|log') {
      // 插件日志
      const {
        // Trace|Debug|Info|Warn|Error
        level,
        message,
        location,
        file,
        line,
        keyValues
      } = args;
      const msg = `[${file}] [${line}] [${location}] [${keyValues}] ${message}`;
      if (level === 'Debug') console.debug(msg);
      else if (level === 'Info') console.info(msg);
      else if (level === 'Warn') console.warn(msg);
      else if (level === 'Error') console.error(msg);
      else console.trace(msg);
    }
  }
}

window.__TAURI_OS_PLUGIN_INTERNALS__ = {
  // 'linux', 'macos', 'ios', 'freebsd', 'dragonfly', 'netbsd', 'openbsd', 'solaris', 'android', 'windows'
  platform: () => 'macos'
}