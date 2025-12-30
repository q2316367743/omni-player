/**
 * @type {Map<string, BrowserWindow.WindowInstance>}
 */
const windowMap = new Map();

/**
 * 执行指定命令
 * @param cmd {string} 命令
 * @param args {Record<string, any>} 参数
 */
module.exports = async (cmd, args) => {
  if (cmd === 'plugin:webview|create_webview_window') {
    const {options} = args;
    const browserWindow = utools.createBrowserWindow(options.url, {
      ...options,
      webPreferences: {
        preload: '../inject.js',
        devTools: utools.isDev(),
      },
      backgroundColor: options.transparent ? '#00000000' : undefined,
    }, () => {
      // 触发事件
    });
    windowMap.set(options.label, browserWindow);
  }
}