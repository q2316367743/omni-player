<template>
  <div class="p-8px overflow-auto">
    <t-card>
      <t-form :data="userSetting">
        <t-form-item label="头像" label-align="top">
          <div class="flex items-center gap-16px">
            <XhAvatar v-model="userSetting.avatar" :size="80" :folder="'setting/user'" :editable="true"/>
            <div class="flex flex-col gap-8px">
              <span class="text-12px text-gray-500">点击头像可上传图片</span>
              <t-input v-model="userSetting.avatar" placeholder="请输入头像URL" style="width: 300px"/>
            </div>
          </div>
        </t-form-item>

        <t-form-item label="昵称" label-align="top">
          <t-input v-model="userSetting.nickname" placeholder="请输入昵称"/>
        </t-form-item>

        <t-form-item label="性别" label-align="top">
          <t-radio-group v-model="userSetting.gender">
            <t-radio value="male">男</t-radio>
            <t-radio value="female">女</t-radio>
            <t-radio value="neutral">中性</t-radio>
            <t-radio value="unknown">未知</t-radio>
          </t-radio-group>
        </t-form-item>

        <t-form-item label="出生日期" label-align="top">
          <t-date-picker v-model="birthdayValue" enable-time-picker format="YYYY-MM-DD HH:mm" placeholder="请选择出生日期"/>
        </t-form-item>

        <t-form-item label="职业" label-align="top">
          <t-input v-model="userSetting.occupation" placeholder="请输入职业"/>
        </t-form-item>

        <t-form-item label="所在城市" label-align="top">
          <t-input v-model="userSetting.city" placeholder="请输入所在城市"/>
        </t-form-item>

        <t-form-item label="老家" label-align="top">
          <t-input v-model="userSetting.home" placeholder="请输入籍贯/户籍所在地"/>
        </t-form-item>

        <t-form-item label="兴趣爱好" label-align="top" help="回车新增">
          <t-tag-input v-model="userSetting.hobbies" placeholder="输入兴趣后按回车添加"/>
        </t-form-item>

        <t-form-item label="个人简介" label-align="top">
          <t-textarea v-model="userSetting.bio" :autosize="{minRows: 4, maxRows: 8}" placeholder="请输入个人简介"/>
        </t-form-item>
      </t-form>
    </t-card>
  </div>
</template>

<script lang="ts" setup>
import {storeToRefs} from "pinia";
import {useSettingStore} from "@/store/GlobalSettingStore.ts";

const {userSetting} = storeToRefs(useSettingStore());

const birthdayValue = computed({
  get: () => {
    if (!userSetting.value.birthday) return undefined;
    return new Date(userSetting.value.birthday);
  },
  set: (val) => {
    if (!val) {
      userSetting.value.birthday = 0;
      return;
    }
    const date = val instanceof Date ? val : new Date(val);
    userSetting.value.birthday = date.getTime();
  }
});
</script>

<style scoped lang="less">

</style>
