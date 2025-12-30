const sql = require('./plugins/plugin-sql');
const path = require('./plugins/plugin-path');
const opener = require('./plugins/plugin-opener');
const dialog = require('./plugins/plugin-dialog');
const fs = require('./plugins/plugin-fs');
const store = require('./plugins/plugin-store');


window.__TAURI_INTERNALS__ = {
  /**
   * 执行指定命令
   * @param cmd {string} 命令
   * @param args {Record<string, any> | ArrayBuffer | Uint8Array} 参数
   * @param options {{}} 选项
   */
  invoke: (cmd, args, options) => {
    if (cmd.startsWith('plugin:sql')) {
      return sql(cmd, args);
    } else if (cmd.startsWith("plugin:path")) {
      return path(cmd, args);
    } else if (cmd.startsWith("plugin:store")) {
      return store(cmd, args);
    } else if (cmd.startsWith("plugin:fs")) {
      return fs(cmd, args, options);
    } else if (cmd.startsWith("plugin:opener")) {
      return opener(cmd, args);
    } else if (cmd.startsWith("plugin:dialog")) {
      return dialog(cmd, args);
    } else if (cmd === 'plugin:log|log') {
      // 插件日志
      const {
        // Trace|Debug|Info|Warn|Error
        level,
        message,
        location,
      } = args;
      const msg = `[${location}] ${message}`;
      if (level === 2) console.debug(msg);
      else if (level === 3) console.info(msg);
      else if (level === 4) console.warn(msg);
      else if (level === 5) console.error(msg);
      else console.trace(msg);
    }
  }
}

window.__TAURI_OS_PLUGIN_INTERNALS__ = {
  // 'linux', 'macos', 'ios', 'freebsd', 'dragonfly', 'netbsd', 'openbsd', 'solaris', 'android', 'windows'
  platform: () => {
    if (utools.isLinux()) return 'linux';
    if (utools.isMacOS()) return 'macos';
    if (utools.isWindows()) return 'windows';
    return 'unknown';
  }
}

window.isTauri = false;