import {DialogPlugin, Input, List, ListItem} from "tdesign-vue-next";
import {ChatDoubleIcon, SearchIcon} from "tdesign-icons-vue-next";
import {debounce} from "es-toolkit";
import './HomeChatSearch.less';
import type {AiChatItem} from "@/entity/app/ai/chat";
import {activeKey, autoHideCollapsed} from "@/pages/app/ai/chat/model.ts";
import {formatDate} from "@/util/lang/FormatUtil.ts";
import {searchAiChatItemService} from "@/services/app/chat";


export function openHomeChatSearch() {
  const keyword = ref('');

  const items = ref(new Array<AiChatItem>());

  const onSearch = debounce(() => {
    searchAiChatItemService(keyword.value).then(data => {
      items.value = data;
    })
  }, 300);

  function onChatClick(data: AiChatItem) {
    activeKey.value = `/home/chat/0/${data.id}`;
    autoHideCollapsed();
    dp.destroy();
  }
  function onChatCreate() {
    activeKey.value = `/home/welcome`;
    autoHideCollapsed();
    dp.destroy();
  }

  const dp = DialogPlugin({
    header: () => <Input v-model={keyword.value} placeholder={"搜索对话"} onChange={onSearch}>{{
      prefixIcon: () => <SearchIcon/>
    }}</Input>,
    footer: false,
    closeOnEscKeydown: false,
    placement: "center",
    default: () => <div>
      <div class="home-chat-search-item"  style={{marginTop: "8px"}} onClick={onChatCreate}>
        <div class="left">
          <ChatDoubleIcon size={'16px'}/>
          <div class="title">新建聊天</div>
        </div>
      </div>
      <List size={"small"} scroll={{ type: 'virtual', rowHeight: 46, bufferSize: 5, threshold: 5 }}>
        {items.value.map((item) => <ListItem key={item.id}>
          <div class="home-chat-search-item" onClick={() => onChatClick(item)}>
            <div class="left">
              <div class="title">{item.name}</div>
            </div>
            <div class="right">
              {formatDate(item.created_at)}
            </div>
          </div>
        </ListItem>)}
      </List>
    </div>
  })
}