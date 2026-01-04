import type {NetworkListItem} from "@/modules/network/types/NetworkListItem.ts";
import {Button, DrawerPlugin, Loading, Tag, Tabs, TabPanel} from "tdesign-vue-next";
import type {INetworkServer} from "@/modules/network/INetworkServer";
import type {NetworkDetail} from "@/modules/network/types/NetworkDetail";
import {useNetworkServerStore} from "@/store";
import {getNetworkListItem, setNetworkListItem} from "../components/detail";
import MessageUtil from "@/util/model/MessageUtil";
import {createWindows} from "@/lib/windows";
import {
  ChevronLeftIcon,
  ImageIcon,
  LayersIcon,
  LocationIcon,
  PlayIcon,
  RefreshIcon,
  TimeIcon,
  TranslateIcon,
  VideoIcon,
  CalendarIcon
} from "tdesign-icons-vue-next";

export async function openNetworkDetail(clientId: string, item: NetworkListItem) {

  setNetworkListItem(item);

  const client = shallowRef<INetworkServer>();
  const detail = ref<NetworkDetail>();
  const loading = ref(false);
  const error = ref("");
  const chapterTabId = ref("");

  const stripHtml = (html: string): string => {
    return html
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .replace(/&nbsp;/g, " ")
      .trim();
  };

  const contentText = computed(() => {
    const raw = detail.value?.content || "";
    return stripHtml(raw);
  });

  const loadDetail = async () => {
    loading.value = true;
    error.value = "";
    detail.value = undefined;

    try {
      const c = await useNetworkServerStore().getServerClient(clientId);
      client.value = c;

      detail.value = await c.getDetail(getNetworkListItem());

      if (detail.value?.chapters?.length) {
        chapterTabId.value = detail.value.chapters[0]?.id || "";
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : "加载详情失败";
      MessageUtil.error("加载详情失败", e);
    } finally {
      loading.value = false;
    }
  };

  const openPlayer = async () => {
    if (!detail.value || !client.value) return;

    createWindows("network", {
      title: detail.value.title,
      serverId: clientId,
      mediaId: detail.value.id,
      itemId: detail.value.id,
      item: detail.value
    })

  };

  const goToDetail = (item: NetworkListItem) => {
    setNetworkListItem(item);
    openNetworkDetail(clientId, item);
  };

  loadDetail();

  const plugin = DrawerPlugin({
    header: false,
    className: 'no-padding',
    closeOnOverlayClick: false,
    closeBtn: false,
    closeOnEscKeydown: false,
    footer: false,
    size: '100%',
    default: () => (
      <div class="h-full w-full overflow-auto">
        <div
          class="min-h-full w-full bg-gradient-to-br from-slate-50 via-fuchsia-50 to-cyan-50 text-slate-900 dark:from-slate-950 dark:via-fuchsia-950 dark:to-cyan-950 dark:text-slate-50"
        >
          {loading.value ? (
            <div class="min-h-[60vh] w-full flex items-center justify-center">
              <Loading size="large" text="加载中..."/>
            </div>
          ) : error.value ? (
            <div class="min-h-[60vh] w-full flex items-center justify-center px-4">
              <div
                class="max-w-xl rounded-2xl border border-white/30 bg-white/70 p-6 shadow-xl backdrop-blur dark:border-white/10 dark:bg-black/30"
              >
                <div class="text-xl font-semibold">加载失败</div>
                <div class="mt-2 text-sm text-slate-600 dark:text-slate-300">{error.value}</div>
                <div class="mt-5 flex gap-3">
                  <Button theme="primary" onClick={loadDetail}>重试</Button>
                  <Button theme="default" variant="outline" onClick={() => plugin.destroy?.()}>返回</Button>
                </div>
              </div>
            </div>
          ) : detail.value ? (
            <div class="relative">
              <div class="absolute inset-0 overflow-hidden">
                {detail.value.cover ? (
                  <img
                    src={detail.value.cover}
                    alt={detail.value.title}
                    class="h-full w-full object-cover opacity-20 blur-sm scale-110"
                  />
                ) : null}
                <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"/>
                <div
                  class="abs-24 rounded-full bg-gradient-to-r from-indigo-500/25 via-fuchsia-500/25 to-cyan-500/25 blur-3xl"/>
                <div
                  class="absolute right-10 top-20 h-72 w-72 rounded-full bg-gradient-to-br from-amber-400/20 to-rose-500/20 blur-3xl"/>
              </div>

              <div
                class="sticky top-0 z-20 border-b border-white/20 bg-white/55 backdrop-blur dark:border-white/10 dark:bg-black/25"
              >
                <div class="mx-auto max-w-7xl px-4 lg:px-8 py-3 flex items-center gap-3">
                  <Button theme="default" variant="outline" shape="circle" onClick={() => plugin.destroy?.()}>
                    <ChevronLeftIcon/>
                  </Button>
                  <div class="min-w-0 flex-1">
                    <div class="truncate text-sm text-slate-600 dark:text-slate-300">
                      网络影视详情
                    </div>
                    <div class="truncate text-lg font-semibold">{detail.value.title || '未命名'}</div>
                  </div>
                  <Button theme="primary" class="shadow-lg" onClick={openPlayer}>{{
                    icon: () => <PlayIcon/>,
                    default: () => <span>播放</span>
                  }}</Button>
                  <Button theme="default" variant="outline" onClick={loadDetail}>{{
                    icon: () => <RefreshIcon/>,
                    default: () => <span>刷新</span>
                  }}</Button>
                </div>
              </div>

              <div class="relative z-10 mx-auto max-w-7xl px-4 lg:px-8 py-6">
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                  <div class="lg:col-span-1">
                    <div class="sticky top-24">
                      <div
                        class="relative overflow-hidden rounded-2xl border border-white/25 bg-white/10 shadow-2xl backdrop-blur dark:border-white/10"
                      >
                        <div class="relative aspect-[2/3] w-full overflow-hidden">
                          {detail.value.cover ? (
                            <img
                              src={detail.value.cover}
                              alt={detail.value.title}
                              class="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                              loading="lazy"
                            />
                          ) : (
                            <div
                              class="h-full w-full bg-gradient-to-br from-indigo-500/40 via-fuchsia-500/30 to-cyan-500/40 flex items-center justify-center"
                            >
                              <ImageIcon class="text-5xl text-white/60"/>
                            </div>
                          )}
                          <div class="absolute inset-0 bg-gradient-to-t from-black/65 via-black/25 to-transparent"/>
                          <div class="absolute inset-0 flex items-center justify-center">
                            <Button theme="primary" shape="circle" size="large" class="shadow-xl" onClick={openPlayer}>
                              <PlayIcon/>
                            </Button>
                          </div>

                          <div class="absolute left-3 top-3 flex gap-2">
                            <Tag theme="primary" variant="light" shape="round" class="border-0 bg-white/20 text-white">
                              {detail.value.type === 'Movie' ? '电影' : '剧集'}
                            </Tag>
                            {detail.value.remark ? (
                              <Tag
                                theme="success"
                                variant="light"
                                shape="round"
                                class="border-0 bg-white/20 text-white"
                              >
                                {detail.value.remark}
                              </Tag>
                            ) : null}
                          </div>

                          <div class="absolute bottom-3 left-3 right-3 flex flex-wrap gap-2">
                            {detail.value.releaseYear ? (
                              <Tag
                                theme="default"
                                variant="light"
                                shape="round"
                              >
                                <CalendarIcon/>
                                {detail.value.releaseYear}
                              </Tag>
                            ) : null}
                            {detail.value.region ? (
                              <Tag
                                theme="default"
                                variant="light"
                                shape="round"
                              >
                                <LocationIcon/>
                                {detail.value.region}
                              </Tag>
                            ) : null}
                            {detail.value.language ? (
                              <Tag
                                theme="default"
                                variant="light"
                                shape="round"
                              >
                                <TranslateIcon/>
                                {detail.value.language}
                              </Tag>
                            ) : null}
                          </div>
                        </div>

                        <div class="p-4">
                            <div class="text-base font-semibold leading-snug">{detail.value.title || '未命名'}</div>
                            {detail.value.subtitle ? (
                              <div class="mt-1 text-sm text-white/70">{detail.value.subtitle}</div>
                            ) : null}
                            <div class="mt-4 grid grid-cols-2 gap-3">
                              <Button theme="primary" block class="shadow-lg" onClick={openPlayer}>{{
                                icon: () => <PlayIcon/>,
                                default: () => <span>播放</span>
                              }}
                              </Button>
                              <Button theme="default" variant="outline" block onClick={loadDetail}>{{
                                icon: () => <RefreshIcon/>,
                                default: () => <span>刷新</span>
                              }}</Button>
                            </div>
                          </div>
                      </div>

                      <div
                        class="mt-5 rounded-2xl border border-white/25 bg-white/10 p-4 shadow-xl backdrop-blur dark:border-white/10"
                      >
                        <div class="flex items-center justify-between">
                          <div class="text-sm font-semibold">基础信息</div>
                          <div class="text-xs text-white/70">ID: {detail.value.id}</div>
                        </div>
                        <div class="mt-3 grid grid-cols-2 gap-3 text-sm text-white/80">
                          <div class="flex items-center gap-2">
                            <TimeIcon class="text-white/70"/>
                            <span>{detail.value.duration || '未知时长'}</span>
                          </div>
                          <div class="flex items-center gap-2">
                            <VideoIcon class="text-white/70"/>
                            <span>{detail.value.total ? `${detail.value.total}集` : '未知集数'}</span>
                          </div>
                          <div class="flex items-center gap-2">
                            <CalendarIcon class="text-white/70"/>
                            <span>{detail.value.releaseDate || '未知上映'}</span>
                          </div>
                          <div class="flex items-center gap-2">
                            <LayersIcon class="text-white/70"/>
                            <span>{detail.value.chapters?.length ? `${detail.value.chapters.length}个播放源` : '无播放源'}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="lg:col-span-2">
                    <div
                      class="rounded-2xl border border-white/25 bg-white/10 p-6 shadow-xl backdrop-blur dark:border-white/10">
                      <div class="flex flex-wrap items-end gap-3">
                        <div class="text-3xl lg:text-4xl font-bold">{detail.value.title || '未命名'}</div>
                        {detail.value.subtitle ? (
                          <div class="text-base text-white/75">{detail.value.subtitle}</div>
                        ) : null}
                      </div>

                      {detail.value.types?.length ? (
                        <div class="mt-4 flex flex-wrap gap-2">
                          {detail.value.types.map((t) => (
                            <Tag
                              key={t}
                              theme="primary"
                              variant="light"
                              shape="round"
                            >
                              {t}
                            </Tag>
                          ))}
                        </div>
                      ) : null}

                      <div class="mt-6 rounded-xl bg-black/20 p-5">
                        <div class="text-sm font-semibold text-white/90">简介</div>
                        <div class="mt-2 text-sm leading-relaxed text-white/80 whitespace-pre-wrap">
                          {contentText.value || '暂无简介'}
                        </div>
                      </div>

                      <div class="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                        {detail.value.actors?.length ? (
                          <div class="rounded-xl bg-black/20 p-4">
                            <div class="text-sm font-semibold text-white/90">主演</div>
                            <div class="mt-2 flex flex-wrap gap-2">
                              {detail.value.actors.slice(0, 12).map((name) => (
                                <span
                                  key={name}
                                  class="rounded-full bg-white/15 px-3 py-1 text-xs text-white/90"
                                >
                                  {name}
                                </span>
                              ))}
                            </div>
                          </div>
                        ) : null}

                        {detail.value.directors?.length ? (
                          <div class="rounded-xl bg-black/20 p-4">
                            <div class="text-sm font-semibold text-white/90">导演</div>
                            <div class="mt-2 flex flex-wrap gap-2">
                              {detail.value.directors.slice(0, 12).map((name) => (
                                <span
                                  key={name}
                                  class="rounded-full bg-white/15 px-3 py-1 text-xs text-white/90"
                                >
                                  {name}
                                </span>
                              ))}
                            </div>
                          </div>
                        ) : null}

                        {detail.value.writers?.length ? (
                          <div class="rounded-xl bg-black/20 p-4">
                            <div class="text-sm font-semibold text-white/90">编剧</div>
                            <div class="mt-2 flex flex-wrap gap-2">
                              {detail.value.writers.slice(0, 12).map((name) => (
                                <span
                                  key={name}
                                  class="rounded-full bg-white/15 px-3 py-1 text-xs text-white/90"
                                >
                                  {name}
                                </span>
                              ))}
                            </div>
                          </div>
                        ) : null}
                      </div>
                    </div>

                    {detail.value.chapters?.length ? (
                      <div
                        class="mt-6 rounded-2xl border border-white/25 bg-white/10 p-6 shadow-xl backdrop-blur dark:border-white/10"
                      >
                        <div class="flex items-center justify-between gap-3">
                          <div class="text-base font-semibold">剧集列表</div>
                          <Button theme="primary" variant="text" onClick={openPlayer}>在播放器中观看</Button>
                        </div>

                        <div class="mt-4">
                          <Tabs value={chapterTabId.value} size="medium">
                            {detail.value.chapters.map((chapter) => (
                              <TabPanel
                                key={chapter.id}
                                label={chapter.name}
                                value={chapter.id}
                              >
                                <div class="mt-4 grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                                  {chapter.items.map((item, idx) => (
                                    <Button
                                      key={item.url}
                                      theme="default"
                                      variant="outline"
                                      size="small"
                                      class="truncate"
                                      onClick={openPlayer}
                                    >
                                      {item.name || idx + 1}
                                    </Button>
                                  ))}
                                </div>
                              </TabPanel>
                            ))}
                          </Tabs>
                        </div>
                      </div>
                    ) : null}

                    {detail.value.recommends?.length ? (
                      <div
                        class="mt-6 rounded-2xl border border-white/25 bg-white/10 p-6 shadow-xl backdrop-blur dark:border-white/10"
                      >
                        <div class="flex items-center justify-between gap-3">
                          <div class="text-base font-semibold">相关推荐</div>
                          <div class="text-xs text-white/70">共 {detail.value.recommends.length} 部</div>
                        </div>

                        <div class="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          {detail.value.recommends.slice(0, 9).map((item) => (
                            <div
                              key={item.id}
                              class="group cursor-pointer overflow-hidden rounded-xl border border-white/20 bg-black/20 transition hover:bg-black/30"
                              onClick={() => goToDetail(item)}
                            >
                              <div class="flex gap-4 p-4">
                                {item.cover ? (
                                  <img
                                    src={item.cover}
                                    alt={item.title}
                                    class="h-24 w-16 flex-none rounded-lg object-cover"
                                    loading="lazy"
                                  />
                                ) : (
                                  <div
                                    class="h-24 w-16 flex-none rounded-lg bg-gradient-to-br from-indigo-500/40 via-fuchsia-500/30 to-cyan-500/40"
                                  />
                                )}
                                <div class="min-w-0 flex-1">
                                  <div class="truncate text-sm font-semibold">{item.title}</div>
                                  <div class="mt-1 truncate text-xs text-white/70">
                                    {item.releaseYear || item.releaseDate || '未知年份'}
                                  </div>
                                  {item.types?.length ? (
                                    <div class="mt-2 flex flex-wrap gap-1">
                                      {item.types.slice(0, 3).map((t) => (
                                        <Tag
                                          key={t}
                                          theme="primary"
                                          size="small"
                                          shape="round"
                                          variant="light"
                                          class="border-0 bg-white/15 text-white"
                                        >
                                          {t}
                                        </Tag>
                                      ))}
                                    </div>
                                  ) : null}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    )
  })
}