import {openUrl, openPath} from '@tauri-apps/plugin-opener';
import type {ToolItem} from "@/global/PluginList.ts";
import {WebviewWindow} from "@tauri-apps/api/webviewWindow";
import {Command} from '@tauri-apps/plugin-shell';
import {logInfo, logError} from '@/lib/log';


const openPopupPluginInner = async (tool: ToolItem<'inner'>) => {
  const toolId = tool.id;
  if (tool) {
    const ww = new WebviewWindow(`plugin-inner-${toolId}-${Date.now()}`, {
      url: import.meta.env.DEV ? `http://localhost:5123/popup-plugin.html?id=${toolId}` : `./popup-plugin.html?id=${toolId}`,
      title: tool.label,
      width: 1200,
      height: 800,
      minWidth: 1200,
      minHeight: 800,
      resizable: true,
      fullscreen: false,
      transparent: true
    })


    await ww.once('tauri://created', async () => {
      // webview successfully created
      console.log('webview successfully created')
    });
    await ww.once('tauri://error', function (e) {
      // an error happened creating the webview
      console.error('an error happened creating the webview');
      console.error(e);
    });

    await ww.show();
    await ww.setFocus();

  }
}

const openPopupLink = async (tool: ToolItem<'link'>) => {
  const {url, openWith, program} = tool.payload;
  if (openWith === 'default') {
    await openUrl(url);
  } else if (openWith === 'customer') {
    await openUrl(url, program);
  } else if (openWith === 'tauri') {
    const ww = new WebviewWindow(`plugin-link`, {
      url: url,
      title: tool.label,
      width: 1200,
      height: 800,
    });
    await ww.show();
  } else {
    await openUrl(url, openWith);
  }
}

const openPopupExe = async (tool: ToolItem<'exe'>) => {
  const {path} = tool.payload;
  await openPath(path);
}

const openPopupFolder = async (tool: ToolItem<'folder'>) => {
  const {path} = tool.payload;
  await openPath(path);
}

const openPopupFile = async (tool: ToolItem<'file'>) => {
  const {path, openWith} = tool.payload;
  if (openWith) {
    await openPath(path, openWith);
  } else {
    await openPath(path);
  }
}

const openPopupScript = async (tool: ToolItem<'script'>) => {
  const {path, interpreter, cwd} = tool.payload;
  try {
    const interpreterMap: Record<string, string> = {
      'sh': 'exec-sh',
      'bash': 'exec-bash',
      'cmd': 'exec-cmd',
      'powershell': 'exec-powershell',
      'python': 'exec-python',
      'python3': 'exec-python3',
      'node': 'exec-node'
    };
    const commandName = interpreterMap[interpreter] || interpreter;
    const command = Command.create(commandName, [path], {
      cwd: cwd || undefined
    });
    const result = await command.execute();
    logInfo(`Script executed: ${path}, code: ${result.code}`);
  } catch (e) {
    logError(`Script execution failed: ${path}, error: ${e}`);
  }
}

const openPopupCommand = async (tool: ToolItem<'command'>) => {
  const {command: cmd, openWith, cwd} = tool.payload;
  try {
    const platform = (await import('@tauri-apps/plugin-os')).platform();
    let commandName: string;
    let args: string[];
    
    if (openWith) {
      const shellMap: Record<string, string> = {
        'sh': 'exec-sh',
        'bash': 'exec-bash',
        'cmd': 'exec-cmd',
        'powershell': 'exec-powershell'
      };
      commandName = shellMap[openWith] || openWith;
      args = openWith === 'cmd' ? ['/c', cmd] : 
             openWith === 'powershell' ? ['-Command', cmd] : ['-c', cmd];
    } else if (platform === 'windows') {
      commandName = 'exec-cmd';
      args = ['/c', cmd];
    } else {
      commandName = 'exec-sh';
      args = ['-c', cmd];
    }
    
    const command = Command.create(commandName, args, {
      cwd: cwd || undefined
    });
    const result = await command.execute();
    logInfo(`Command executed: ${cmd}, code: ${result.code}`);
  } catch (e) {
    logError(`Command execution failed: ${cmd}, error: ${e}`);
  }
}

const openPopupKeyboard = async (tool: ToolItem<'keyboard'>) => {
  const {key} = tool.payload;
  logInfo(`Keyboard simulation not implemented yet. Key: ${key}`);
}

export const handlePopupToolClick = async (tool: ToolItem) => {
  switch (tool.type) {
    case 'inner': {
      await openPopupPluginInner(tool as ToolItem<'inner'>);
      break;
    }
    case 'link': {
      await openPopupLink(tool as ToolItem<'link'>);
      break;
    }
    case 'exe': {
      await openPopupExe(tool as ToolItem<'exe'>);
      break;
    }
    case 'folder': {
      await openPopupFolder(tool as ToolItem<'folder'>);
      break;
    }
    case 'file': {
      await openPopupFile(tool as ToolItem<'file'>);
      break;
    }
    case 'script': {
      await openPopupScript(tool as ToolItem<'script'>);
      break;
    }
    case 'command': {
      await openPopupCommand(tool as ToolItem<'command'>);
      break;
    }
    case 'keyboard': {
      await openPopupKeyboard(tool as ToolItem<'keyboard'>);
      break;
    }
    case 'plugin': {
      logInfo(`Plugin type not implemented yet. Tool: ${tool.id}`);
      break;
    }
  }
}
