import {DrawerPlugin, Button, Card} from "tdesign-vue-next";
import {open} from '@tauri-apps/plugin-dialog';
import {basename} from '@tauri-apps/api/path';
import MessageUtil from "@/util/model/MessageUtil.ts";
import {saveTransactions} from "./BookkeepingService.ts";
import {parseAlipayToTransaction, readAlipayCsv} from "@/pages/app/bookkeeping/utils/AlipayUtil.ts";
import {LogoAlipayIcon, LogoWechatpayIcon, DeleteIcon} from "tdesign-icons-vue-next";
import {useSql} from "@/lib/sql.ts";
import type {AnalysisTransactionCore} from "@/entity/analysis/AnalysisTransaction.ts";
import type {AnalysisSessionSourceType} from "@/entity/analysis/AnalysisSession.ts";
import {parseWeChatPayToTransaction} from "@/pages/app/bookkeeping/utils/WechatPayUtil.ts";

interface AddSessionItem {
  name: string;
  path: string;
  type: 'alipay' | 'wechat';
}

export function openAddSession(onSuccess?: () => void) {
  const uploading = ref(false);
  const items = ref(new Array<AddSessionItem>());

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

      if (items.value.some(item => item.path === path)) {
        return MessageUtil.warning("该文件已存在");
      }

      items.value.push({path, type: 'alipay', name: await basename(path)});

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
        ],
      });
      if (!path) return;

      if (items.value.some(item => item.path === path)) {
        return MessageUtil.warning("该文件已存在");
      }

      items.value.push({path, type: 'wechat', name: await basename(path)});

    } catch (e) {
      MessageUtil.error("账单上传失败", e);
    } finally {
      uploading.value = false;
    }
  };

  const handleDeleteItem = (index: number) => {
    items.value.splice(index, 1);
  };

  const handleConfirm = async () => {
    if (uploading.value) return MessageUtil.warning("正在上传中，请稍候");
    if (items.value.length === 0) {
      plugin.destroy?.();
      return;
    }
    try {
      uploading.value = true;
      MessageUtil.info("开始导入")
      let type: AnalysisSessionSourceType | undefined = undefined;
      const tran = new Array<AnalysisTransactionCore>();
      for (const item of items.value) {
        if (item.type === 'wechat') {
          if (!type) type = 'wechat';
          else if (type === 'alipay') type = 'mixin';
          const data = await parseWeChatPayToTransaction(item.path);
          tran.push(...data);
        } else if (item.type === 'alipay') {
          if (!type) type = 'alipay';
          else if (type === 'wechat') type = 'mixin';
          const text = await readAlipayCsv(item.path);
          const data = parseAlipayToTransaction(text);
          tran.push(...data);
        }
      }
      if (!type) type = 'mixin';
      const filename = type === 'mixin' ? `mixin_record_${type}.csv` : `${type}_record.csv`;
      await useSql().beginTransaction(async () => {
        await saveTransactions(filename, type!, tran);
      });
      MessageUtil.success("账单上传成功");
      onSuccess?.();
      plugin.destroy?.();
    } catch (e) {
      MessageUtil.error("账单上传失败", e);
      console.error(e);
    } finally {
      uploading.value = false;
    }
  }

  const plugin = DrawerPlugin({
    header: "新增账单",
    size: "900px",
    confirmBtn: "导入",
    onConfirm: handleConfirm,
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
              </div>
            </div>
            <Button
              variant="outline"
              disabled={uploading.value}
              onClick={handleAlipaySelect}
            >
              {uploading.value ? '上传中...' : '选择 CSV 文件'}
            </Button>
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
            <Button
              variant="outline"
              disabled={uploading.value}
              onClick={handleWechatSelect}
            >
              {uploading.value ? '上传中...' : '选择 CSV/XLSX 文件'}
            </Button>
          </Card>
        </div>

        {items.value.length > 0 && (
          <div class="mt-4">
            <div class="text-base font-medium mb-3">已选择的文件</div>
            <div class="flex flex-col gap-2">
              {items.value.map((e, index) => (
                <div
                  class="flex items-center justify-between p-3 bg-[var(--td-bg-color-container)] rounded-lg hover:bg-[var(--td-bg-color-container-hover)] transition-colors">
                  <div class="flex items-center gap-2 flex-1 min-w-0">
                    {e.type === 'alipay' ? (
                      <LogoAlipayIcon class="color-#1777FF flex-shrink-0"/>
                    ) : (
                      <LogoWechatpayIcon class="color-#07c160 flex-shrink-0"/>
                    )}
                    <span class="truncate text-sm">{e.name}</span>
                  </div>
                  <Button
                    theme="danger"
                    variant="text"
                    size="small"
                    icon={() => h(DeleteIcon)}
                    onClick={() => handleDeleteItem(index)}
                    class="flex-shrink-0"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  });
}
