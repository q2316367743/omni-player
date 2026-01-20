// 访问网络，urlStr为url字符串，返回类型String?
// java.ajax(urlStr: String)
// 
// 并发访问网络，urlList为url数组，返回StrResponse?的数组，若要获取body，需使用.body()
// java.ajaxAll(urlList: Array<String>): Array<StrResponse?>
// 
// 访问网络，urlStr为url字符串，返回Response<String>，已废弃
// java.connect(urlStr: String)
// 
// 文件下载，content为十六进制字符串，url用于生成文件名，返回String文件相对路径
// 
// java.downloadFile(content: String, url: String)
// 
// 实现重定向拦截，返回[Connection.Response](https://jsoup.org/apidocs/org/jsoup/Connection.Response.html)
// java.get(url: String, headers: Map<String, String>)
// 
// java.post(urlStr: String, body: String, headers: Map<String, String>)
// 
// 实现cookie读取，返回String
// java.getCookie(tag: String, key: String?)
// 
// base64解码，返回类型String
// java.base64Decode(str: String)
// 
// java.base64Decode(str: String, flags: Int)
// 
// base64解码，返回类型ByteArray?
// java.base64DecodeToByteArray(str: String?)
// 
// java.base64DecodeToByteArray(str: String?, flags: Int)
// 
// base64编码，返回类型String?
// java.base64Encode(str: String)
// 
// java.base64Encode(str: String, flags: Int)
// 
// 
// md5编码，返回类型String?
// 
// java.md5Encode(str: String)
// 
// java.md5Encode16(str: String)
// 
// 格式化时间戳，返回类型String
// java.timeFormat(timestamp: Long)
// 
// java.timeFormat(time: String)
// 
// utf8编码转gbk编码，返回String
// java.utf8ToGbk(str: String)
// 
// 实现字符串的URI编码，enc为编码格式，返回String
// java.encodeURI(str: String) //默认enc="UTF-8"
// 
// java.encodeURI(str: String, enc: String)
// 
// html格式化，返回String
// java.htmlFormat(str: String)
// 
// 获取本地文件,path为文件的相对路径,返回File
// java.getFile(path: String)
// 
// 读取本地文件，返回ByteArray?
// java.readFile(path: String)
// 
// 读取本地文本文件，charsetName为编码格式
// java.readTxtFile(path: String)  //自动识别charsetName不一定准，乱码时请手动指定
// 
// java.readTxtFile(path: String, charsetName: String)
// 
// 删除文件或文件夹
// deleteFile(path: String)
// 
// zip文件解压，zipPath为压缩文件路径，返回String解压相对路径，会删除原文件只保留解压后的文件
// java.unzipFile(zipPath: String)
// 
// 文件夹内所有文本文件读取，返回内容String，会删除文件夹
// java.getTxtInFolder(unzipPath: String)
// 
// 获取网络zip文件中的数据，url为zip文件链接，path为所需获取文件在zip内的路径，返回文件数据String
// java.getZipStringContent(url: String, path: String)
// 
// 获取网络zip文件中的数据，url为zip文件链接，path为所需获取文件在zip内的路径，返回文件数据ByteArray?
// java.getZipByteArrayContent(url: String, path: String)
// 
// 解析字体,返回字体解析类QueryTTF?
// java.queryBase64TTF(base64: String?)
// 
// str支持url,本地文件,base64,自动判断,自动缓存,返回字体解析类QueryTTF?
// java.queryTTF(str: String?)
// 
// text为包含错误字体的内容，font1为错误的字体，font2为正确的字体，返回字体对应的字
// java.replaceFont(text: String,font1: QueryTTF?,font2: QueryTTF?)
// 
// 输出调试日志
// java.log(msg: String)
// 
// AES解码为ByteArray?,str为传入的AES加密数据，key为AES解密key，transformation为AES加密方式，iv为ECB模式的偏移向量
// java.aesDecodeToByteArray(str: String, key: String, transformation: String, iv: String)
// 
// AES解码为String?,str为传入的AES加密数据，key为AES解密key，transformation为AES加密方式，iv为ECB模式的偏移向量
// java.aesDecodeToString(str: String, key: String, transformation: String, iv: String)
// 
// 已经base64的AES解码为ByteArray?,str为Base64编码数据，key为AES解密key，transformation为AES加密方式，iv为ECB模式的偏移向量
// java.aesBase64DecodeToByteArray(str: String, key: String, transformation: String, iv: String)
// 
// 已经base64的AES解码为String?,str为Base64编码数据，key为AES解密key，transformation为AES加密方式，iv为ECB模式的偏移向量
// java.aesBase64DecodeToString(str: String, key: String, transformation: String, iv: String)
// 
// 加密aes为ByteArray?，data为传入的原始数据，key为AES解密key，transformation为AES加密方式，iv为ECB模式的偏移向量
// java.aesEncodeToByteArray(data: String, key: String, transformation: String, iv: String)
// 
// 加密aes为String?，data为传入的原始数据，key为AES解密key，transformation为AES加密方式，iv为ECB模式的偏移向量
// java.aesEncodeToString(data: String, key: String, transformation: String, iv: String)
// 
// 加密aes后Base64化的ByteArray?，data为传入的原始数据，key为AES解密key，transformation为AES加密方式，iv为ECB模式的偏移向量
// java.aesEncodeToBase64ByteArray(data: String, key: String, transformation: String, iv: String)
// 
// 加密aes后Base64化的String?，data为传入的原始数据，key为AES解密key，transformation为AES加密方式，iv为ECB模式的偏移向量
// java.aesEncodeToBase64String(data: String, key: String, transformation: String, iv: String)
// 
// /**************以下部分方法由于JAVA不支持参数默认值，调用时不能省略***************/
// 
// 设置需解析的内容content和baseUrl，返回类型AnalyzeRule
// java.setContent(content: Any?, baseUrl: String? = this.baseUrl)
// 
// 输入规则rule和URL标志isUrl获取文本列表，返回类型List<String>?
// java.getStringList(rule: String, isUrl: Boolean = false)
// 
// 输入规则rule和URL标志isUrl获取文本，返回类型String
// java.getString(ruleStr: String?, isUrl: Boolean = false)
// 
// 输入规则ruleStr获取节点列表，返回类型List<Any>
// java.getElements(ruleStr: String)

import type {ParserEngine} from "./types";

export async function buildJava(engines: Array<ParserEngine>): Promise<{}> {
  console.log('engines', engines)
  return {};
}