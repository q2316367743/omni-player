import {DrawerPlugin, Button, Card} from "tdesign-vue-next";
import {open} from '@tauri-apps/plugin-dialog';
import {readTextFile} from '@tauri-apps/plugin-fs';
import MessageUtil from "@/util/model/MessageUtil.ts";
import {parseWechatCSV, saveTransactions} from "./BookkeepingService.ts";
import {parseAlipayToTransaction, readAlipayCsv} from "@/pages/app/bookkeeping/utils/AlipayUtil.ts";
import {LogoAlipayIcon, LogoWechatpayIcon} from "tdesign-icons-vue-next";
import {useSql} from "@/lib/sql.ts";

export function openAddSession(onSuccess?: () => void) {
  const uploading = ref(false);

  const handleAlipaySelect = async () => {
    try {
      const path = await open({
        multiple: false,
        title: '选择支付宝账单文件',
        filters: [
          {
            name: 'CSV',
            extensions: ['csv']
          }
        ]
      });
      if (!path) return;

      uploading.value = true;
      const text = await readAlipayCsv(path);
      const data = parseAlipayToTransaction(text);
      const filename = path.split('/').pop() || 'alipay_record.csv';
      await useSql().beginTransaction(async () => {
        await saveTransactions(filename, 'alipay', data);
      })

      MessageUtil.success("账单上传成功");
      plugin.destroy?.();
      onSuccess?.();
    } catch (e) {
      MessageUtil.error("账单上传失败", e);
    } finally {
      uploading.value = false;
    }
  };

  const handleWechatSelect = async () => {
    try {
      const path = await open({
        multiple: false,
        title: '选择微信账单文件',
        filters: [
          {
            name: 'CSV/XLSX',
            extensions: ['csv', 'xlsx']
          }
        ]
      });
      if (!path) return;

      uploading.value = true;
      const text = await readTextFile(path);
      const data = parseWechatCSV(text);
      const filename = path.split('/').pop() || 'wechat_record.csv';
      await useSql().beginTransaction(async () => {
        await saveTransactions(filename, 'wechat', data);
      });

      MessageUtil.success("账单上传成功");
      plugin.destroy?.();
      onSuccess?.();
    } catch (e) {
      MessageUtil.error("账单上传失败", e);
    } finally {
      uploading.value = false;
    }
  };

  const plugin = DrawerPlugin({
    header: "新增账单",
    footer: false,
    size: "900px",
    default: () => (
      <div class="p-4">
        <div class="grid grid-cols-2 gap-4">
          <Card>
            <div class="mb-4">
              <div class="text-lg font-medium mb-2" style="color: #1677ff;line-height: 28px">
                <LogoAlipayIcon class={'color-white bg-#1777FF p-3px'}
                                style={{borderRadius: 'var(--td-radius-medium)'}}/>
                <span class={'ml-8px h-28px'}>支付宝账单</span>
              </div>
              <div class="flex flex-col gap-1">
                <div class="text-sm text-[var(--td-text-color-secondary)] leading-relaxed pl-3 relative">
                  <span class="absolute left-0 top-2 w-1 h-1 rounded-full bg-[var(--td-text-color-placeholder)]"></span>
                  打开支付宝 App -&gt; 我的 -&gt; 账单
                </div>
                <div class="text-sm text-[var(--td-text-color-secondary)] leading-relaxed pl-3 relative">
                  <span class="absolute left-0 top-2 w-1 h-1 rounded-full bg-[var(--td-text-color-placeholder)]"></span>
                  右上角 ... -&gt; 开具交易流水证明 -&gt; 用于个人对账 -&gt; 申请
                </div>
                <div class="text-sm text-[var(--td-text-color-secondary)] leading-relaxed pl-3 relative">
                  <span class="absolute left-0 top-2 w-1 h-1 rounded-full bg-[var(--td-text-color-placeholder)]"></span>
                  自定义时间范围（最长为一年） -&gt; 填写邮箱 -&gt; 下载账单
                </div>
                <div class="text-sm text-[var(--td-text-color-secondary)] leading-relaxed pl-3 relative">
                  <span class="absolute left-0 top-2 w-1 h-1 rounded-full bg-[var(--td-text-color-placeholder)]"></span>
                  申请记录中找到解压密码 -&gt; 解压下载的文件，获取 CSV 文件
                </div>
                <div class="text-sm text-[var(--td-text-color-secondary)] leading-relaxed pl-3 relative">
                  <span class="absolute left-0 top-2 w-1 h-1 rounded-full bg-[var(--td-text-color-placeholder)]"></span>
                  按年份重命名为【alipay_record_2024.csv】格式
                </div>
              </div>
            </div>
            <div class="flex flex-col gap-2">
              <Button
                variant="outline"
                disabled={uploading.value}
                onClick={handleAlipaySelect}
              >
                {uploading.value ? '上传中...' : '选择 CSV 文件'}
              </Button>
            </div>
          </Card>

          <Card>
            <div class="mb-4">
              <div class="text-lg font-medium mb-2" style="color: #07c160">
                <LogoWechatpayIcon/>
                <span class={'ml-8px'}>微信账单</span>
              </div>
              <div class="flex flex-col gap-1">
                <div class="text-sm text-[var(--td-text-color-secondary)] leading-relaxed pl-3 relative">
                  <span class="absolute left-0 top-2 w-1 h-1 rounded-full bg-[var(--td-text-color-placeholder)]"></span>
                  打开微信 App -&gt; 我 -&gt; 服务 -&gt; 钱包 -&gt; 账单
                </div>
                <div class="text-sm text-[var(--td-text-color-secondary)] leading-relaxed pl-3 relative">
                  <span class="absolute left-0 top-2 w-1 h-1 rounded-full bg-[var(--td-text-color-placeholder)]"></span>
                  点击右上角 [...] -&gt; 账单下载 -&gt; 用于个人对账
                </div>
                <div class="text-sm text-[var(--td-text-color-secondary)] leading-relaxed pl-3 relative">
                  <span class="absolute left-0 top-2 w-1 h-1 rounded-full bg-[var(--td-text-color-placeholder)]"></span>
                  选择接收方式（微信/邮箱）、账单时间 -&gt; 下一步
                </div>
                <div class="text-sm text-[var(--td-text-color-secondary)] leading-relaxed pl-3 relative">
                  <span class="absolute left-0 top-2 w-1 h-1 rounded-full bg-[var(--td-text-color-placeholder)]"></span>
                  方式一（推荐）：刷脸验证 -&gt; 微信消息直接下载 XLSX 文件
                </div>
                <div class="text-sm text-[var(--td-text-color-secondary)] leading-relaxed pl-3 relative">
                  <span class="absolute left-0 top-2 w-1 h-1 rounded-full bg-[var(--td-text-color-placeholder)]"></span>
                  方式二：输入邮箱 -&gt; 刷脸 -&gt; 邮箱接收 (密码在微信消息中)
                </div>
              </div>
            </div>
            <div class="flex flex-col gap-2">
              <Button
                variant="outline"
                disabled={uploading.value}
                onClick={handleWechatSelect}
              >
                {uploading.value ? '上传中...' : '选择 CSV/XLSX 文件'}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    )
  });
}
