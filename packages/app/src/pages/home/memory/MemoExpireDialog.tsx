import {DialogPlugin, Form, FormItem, DatePicker, InputNumber} from "tdesign-vue-next";
import type {DateValue} from "tdesign-vue-next";
import {setExpireTime as setEmotionExpireTime, extendExpireTime as extendEmotionExpireTime} from "@/services/memo/layer/MemoLayerEmotionService.ts";
import {setExpireTime as setCognitiveExpireTime, extendExpireTime as extendCognitiveExpireTime} from "@/services/memo/layer/MemoLayerCognitiveService.ts";
import {setExpireTime as setBehaviorExpireTime, extendExpireTime as extendBehaviorExpireTime} from "@/services/memo/layer/MemoLayerBehaviorService.ts";
import {setExpireTime as setPersonaExpireTime, extendExpireTime as extendPersonaExpireTime} from "@/services/memo/layer/MemoLayerPersonaService.ts";
import MessageUtil from "@/util/model/MessageUtil.ts";

export function openSetExpireDialog(id: string, currentExpireAt: number, isExpired: boolean, createdAt: number, onUpdate: () => void, layer: 'emotion' | 'cognitive' | 'behavior' | 'persona' = 'emotion') {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  const nowStr = now.toISOString().slice(0, 16);
  
  const createdDate = new Date(createdAt);
  createdDate.setMinutes(createdDate.getMinutes() - createdDate.getTimezoneOffset());
  const createdStr = createdDate.toISOString().slice(0, 16);
  
  const data = ref({
    expireAt: isExpired ? nowStr : new Date(currentExpireAt).toISOString().slice(0, 16)
  });

  const setExpireTimeMap = {
    emotion: setEmotionExpireTime,
    cognitive: setCognitiveExpireTime,
    behavior: setBehaviorExpireTime,
    persona: setPersonaExpireTime
  };

  const dp = DialogPlugin({
    header: isExpired ? '设置过期时间' : '设为过期',
    default: () => (<Form>
      <FormItem label={'过期时间'} labelAlign={'top'}>
        <DatePicker
          v-model={data.value.expireAt}
          enableTimePicker={true}
          format={'YYYY-MM-DD HH:mm'}
          disableDate={(date: DateValue) => {
            const selectedDate = new Date(date as string);
            selectedDate.setMinutes(selectedDate.getMinutes() - selectedDate.getTimezoneOffset());
            const selectedDateStr = selectedDate.toISOString().slice(0, 16);
            
            if (isExpired) {
              return selectedDateStr < nowStr;
            } else {
              return selectedDateStr < createdStr || selectedDateStr > nowStr;
            }
          }}
        />
      </FormItem>
    </Form>),
    confirmBtn: '确定',
    onConfirm() {
      const expireAt = new Date(data.value.expireAt).getTime();
      setExpireTimeMap[layer](id, expireAt)
        .then(() => {
          onUpdate()
          dp.destroy()
          MessageUtil.success(isExpired ? "过期时间设置成功" : "已设为过期")
        })
        .catch(e => {
          MessageUtil.error("操作失败", e)
        })
    }
  })
}

export function openExtendExpireDialog(id: string, onUpdate: () => void, layer: 'emotion' | 'cognitive' | 'behavior' | 'persona' = 'emotion') {
  const data = ref({
    days: 7
  });

  const extendExpireTimeMap = {
    emotion: extendEmotionExpireTime,
    cognitive: extendCognitiveExpireTime,
    behavior: extendBehaviorExpireTime,
    persona: extendPersonaExpireTime
  };

  const dp = DialogPlugin({
    header: '延长过期时间',
    default: () => (<Form>
      <FormItem label={'延长天数'} labelAlign={'top'}>
        <InputNumber
          v-model={data.value.days}
          min={1}
          max={365}
          step={1}
        />
      </FormItem>
    </Form>),
    confirmBtn: '确定',
    onConfirm() {
      extendExpireTimeMap[layer](id, data.value.days)
        .then(() => {
          onUpdate()
          dp.destroy()
          MessageUtil.success("过期时间延长成功")
        })
        .catch(e => {
          MessageUtil.error("操作失败", e)
        })
    }
  })
}
