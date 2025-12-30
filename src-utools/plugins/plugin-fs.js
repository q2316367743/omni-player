const fs = require('node:fs/promises');

/**
 * 读取文件并返回 ArrayBuffer
 * @param {string} filePath - 文件路径
 * @returns {Promise<ArrayBuffer>}
 */
async function readFileAsArrayBuffer(filePath) {
  try {
    const buffer = await fs.readFile(filePath);
    // Buffer 可以直接通过 .buffer 属性获取 ArrayBuffer
    // 注意：需处理 Buffer 的偏移和长度（避免共享底层内存问题）
    return buffer.buffer.slice(
      buffer.byteOffset,
      buffer.byteOffset + buffer.byteLength
    );
  } catch (err) {
    throw new Error(`读取文件失败: ${err.message}`);
  }
}

/**
 * 执行指定命令
 * @param cmd {string} 命令
 * @param args {ArrayBuffer | Uint8Array} 参数
 * @param options {Record<string, any>} 选项
 */
module.exports = async (cmd, args, options) => {
  if (cmd === 'plugin:fs|read_text_file') {
    const {path} = args;
    return await readFileAsArrayBuffer(path[0]);
  } else if (cmd === 'plugin:fs|write_text_file') {
    return await fs.writeFile(
      options.path,
      Buffer.from(args instanceof Uint8Array ? args : new Uint8Array(args)),
      {
        encoding: 'utf-8'
      });
  }
}