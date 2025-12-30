window.exports = {
  "launch": {
    mode: "none",
    args: {
      enter: (action) => {
        utools.createBrowserWindow(
          utools.isDev() ? './test.html' : 'dist/index.html',
          {
            width: 1200,
            height: 800,
            minWidth: 1200,
            minHeight: 800,
            webPreferences: {
              preload: '../inject.js',
              devTools: utools.isDev(),
              zoomFactor: 1
            }
          },
          () => {
            console.log("窗口创建成功")
          }
        )
      }
    }
  }
}
