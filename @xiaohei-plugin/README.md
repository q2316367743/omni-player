# 小黑插件

## plugin.json属性

- identifier: 插件标识符，需要唯一，建议域名+插件名
- name: 插件名称
- version: 插件版本
- description: 插件描述
- author: 插件作者
- homepage: 插件主页
- main: 插件入口文件
- window: 窗口设置
  - width: 窗口宽度
  - height: 窗口高度
  - title: 窗口标题
  - icon: 窗口图标
  - minWidth: 最小宽度
  - minHeight: 最小高度
  - maxWidth: 最大宽度
  - maxHeight: 最大高度
  - resizable: 是否可resize
  - singleton: 是否单例
- permissions: 权限设置
  - fs: 文件系统权限
  - net: 网络权限
  - clipboard: 剪贴板权限
- development: 开发者设置
  - main: 开发入口
- require: 必要的
  - version: 最小的软件版本
- lifeCycle: 生命周期
  - install: 安装时执行
  - uninstall: 卸载插件时需要执行的
  - update: 更新插件时需要执行的
