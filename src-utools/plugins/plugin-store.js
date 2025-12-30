const {basename} = require('node:path');
const {ipcRenderer} = require('electron');

/**
 * 执行指定命令
 * @param cmd {string} 命令
 * @param args {Record<string, any>} 参数
 */
module.exports = async (cmd, args) => {
  if (cmd === 'plugin:store|load' || cmd === 'plugin:store|get_store') {
    const {path} = args;
    const prefix = basename(path);
    return prefix.replace(".json", "");
  } else if (cmd === 'plugin:store|set') {
    const {rid, key, value} = args;
    const _id = `${rid}:${key}`;
    const old = await utools.db.promises.get(_id);
    await utools.db.promises.put({
      _id: rid + ":" + key,
      _rev: old?._rev,
      value
    })
  } else if (cmd === 'plugin:store|get') {
    const {rid, key} = args;
    const _id = `${rid}:${key}`;
    const old = await utools.db.promises.get(_id);
    console.log([old?.value, !!old])
    return [old?.value, !!old];
  } else if (cmd === 'plugin:store|has') {
    const {rid, key} = args;
    const _id = `${rid}:${key}`;
    return !!await utools.db.promises.get(_id);
  } else if (cmd === 'plugin:store|delete') {
    await utools.db.promises.remove(args.rid + ":" + args.key);
    return Promise.resolve(true);
  } else if (cmd === 'plugin:store|save') {
    return Promise.resolve();
  }
}