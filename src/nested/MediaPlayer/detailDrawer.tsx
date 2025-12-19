import {Button, DrawerPlugin, Loading, Paragraph, Tag, Tooltip} from 'tdesign-vue-next';
import type {IMediaServer} from "@/modules/media/IMediaServer.ts";
import type {WindowPayload} from "@/lib/windows.ts";
import {getCurrentWindow} from '@tauri-apps/api/window';
import type {MediaDetail} from '@/modules/media/types/detail/MediaDetail.ts';
import type {MediaEpisodeItem} from '@/modules/media/types/detail/MediaEpisode.ts';
import type {MediaSeason, MediaSeasonItem} from '@/modules/media/types/detail/MediaSeason.ts';
import {InfoCircleIcon, PlayCircleIcon} from "tdesign-icons-vue-next";
import MessageUtil from "@/util/model/MessageUtil.ts";


function typeLabel(type: MediaDetail['type']) {
  if (type === 'Movie') return '电影';
  if (type === 'Series') return '剧集';
  return type;
}

function formatDuration(seconds?: number) {
  if (typeof seconds !== 'number' || seconds <= 0) return '';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}小时${m}分钟`;
  return `${m}分钟`;
}

function formatDurationMs(ms?: number) {
  if (typeof ms !== 'number' || ms <= 0) return '';
  return formatDuration(Math.floor(ms / 1000));
}

function seasonLabel(s: MediaSeasonItem, idx: number) {
  if (typeof s.indexNumber === 'number') {
    const n = String(Math.max(0, s.indexNumber)).padStart(2, '0');
    return `S${n}`;
  }
  if (s.name) return s.name;
  return `第${idx + 1}季`;
}


export async function openDetailDrawer(client: IMediaServer, payload: WindowPayload) {

  const detail = await client.getItem(payload.mediaId);

  const activeItemId = ref(payload.itemId);

  const season = shallowRef<MediaSeason>();
  const selectedSeasonId = ref('');
  const seasonLoading = ref(false);
  const seasonError = ref<string>();

  const episodeCacheMap = reactive<Record<string, MediaEpisodeItem[]>>({});
  const episodeLoadingMap = reactive<Record<string, boolean>>({});
  const episodeErrorMap = reactive<Record<string, string>>({});

  const loadEpisodesBySeasonId = async (seasonId: string) => {
    if (!seasonId) return;
    if (episodeLoadingMap[seasonId]) return;
    episodeLoadingMap[seasonId] = true;
    episodeErrorMap[seasonId] = '';

    try {
      const res = await client.getItemEpisode(detail.id, seasonId);
      episodeCacheMap[seasonId] = res.items || [];
    } catch (e) {
      episodeErrorMap[seasonId] = e instanceof Error ? e.message : '加载剧集失败';
    } finally {
      episodeLoadingMap[seasonId] = false;
    }
  };

  const switchEpisode = async (ep: MediaEpisodeItem) => {
    if (activeItemId.value === ep.id) return;
    activeItemId.value = ep.id;

    const title = `${detail.name} - ${ep.name}`;
    const nextPayload: WindowPayload = {
      ...payload,
      title,
      itemId: ep.id,
    };

    await getCurrentWindow().emit('init', nextPayload);
  };

  const seriesReady = computed(() => detail.type === 'Series');

  (async () => {
    if (detail.type !== 'Series') return;
    seasonLoading.value = true;
    seasonError.value = undefined;

    try {
      const res = await client.getItemSeason(detail.id);
      season.value = res;
      const firstSeasonId = res.items?.[0]?.id || '';
      selectedSeasonId.value = firstSeasonId;
      if (firstSeasonId) {
        await loadEpisodesBySeasonId(firstSeasonId);
      }
      void (async () => {
        const ids = (res.items || []).map((s) => s.id).filter(Boolean);
        for (const id of ids) {
          if (!episodeCacheMap[id]?.length) {
            await loadEpisodesBySeasonId(id);
          }
        }
      })();
    } catch (e) {
      throw e;
    } finally {
      seasonLoading.value = false;
    }
  })().catch(e => MessageUtil.error("初始化剧集信息失败", e));

  watch(selectedSeasonId, (id) => {
    if (!id) return;
    if (episodeCacheMap[id]?.length) return;
    void loadEpisodesBySeasonId(id);
  });

  DrawerPlugin({
    size: '420px',
    placement: 'right',
    header: false,
    closeBtn: false,
    footer: false,
    style: {
      padding: 0
    },

    default: () => (
      <div class="h-full overflow-auto bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
        <div class="p-4">
          <div class="flex gap-4">
            <div class="w-28 shrink-0">
              {detail.posterUrl ? (
                <img src={detail.posterUrl} alt={detail.name} class="w-28 h-40 object-cover rounded-2xl shadow-xl"/>
              ) : (
                <div class="w-28 h-40 rounded-2xl bg-gradient-to-br from-blue-500/35 via-purple-500/25 to-cyan-500/35"/>
              )}
            </div>
            <div class="min-w-0 flex-1">
              <div class="text-base font-semibold leading-snug">{detail.name}</div>
              {detail.originalTitle && detail.originalTitle !== detail.name ? (
                <div class="mt-1 text-xs text-white/65 truncate">{detail.originalTitle}</div>
              ) : null}

              <div class="mt-2 flex flex-wrap gap-2">
                <Tag theme="primary" variant="light" shape="round" class="border-0 bg-white/15 text-white">
                  {typeLabel(detail.type)}
                </Tag>
                {detail.year ? (
                  <Tag theme="default" variant="light" shape="round" class="border-0 bg-black/30 text-white">
                    <span class="tabular-nums">{detail.year}</span>
                  </Tag>
                ) : null}
                {typeof detail.rating === 'number' ? (
                  <Tag theme="success" variant="light" shape="round" class="border-0 bg-black/30 text-white">
                    <span class="tabular-nums">{detail.rating.toFixed(1)}</span>
                  </Tag>
                ) : null}
                {detail.runtimeSeconds ? (
                  <Tag theme="default" variant="light" shape="round" class="border-0 bg-black/30 text-white">
                    {formatDuration(detail.runtimeSeconds)}
                  </Tag>
                ) : null}
              </div>

              {detail.userState?.playbackPositionSeconds && detail.runtimeSeconds ? (
                <div class="mt-3 rounded-xl bg-white/10 p-3 backdrop-blur">
                  <div class="flex items-center justify-between text-xs text-white/70">
                    <div>观看进度</div>
                    <div class="tabular-nums">
                      {Math.min(
                        100,
                        Math.floor((detail.userState.playbackPositionSeconds / detail.runtimeSeconds) * 100),
                      )}
                      %
                    </div>
                  </div>
                  <div class="mt-2 h-2 rounded-full bg-white/15 overflow-hidden">
                    <div
                      class="h-full bg-gradient-to-r from-green-500 to-blue-500"
                      style={{
                        width: `${Math.min(
                          100,
                          (detail.userState.playbackPositionSeconds / detail.runtimeSeconds) * 100,
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          <div class="mt-4 rounded-2xl border border-white/10 bg-white/8 p-4 backdrop-blur">
            <div class="flex items-center gap-2 text-sm font-semibold">
              <InfoCircleIcon/>
              <span>简介</span>
            </div>
            <div class="mt-2 text-sm text-white/75 leading-relaxed">
              <Paragraph ellipsis={{row: 6, expandable: true, collapsible: true}}>
                {detail.overview || '暂无简介'}
              </Paragraph>
            </div>
          </div>

          {detail.genres?.length ? (
            <div class="mt-4 rounded-2xl border border-white/10 bg-white/8 p-4 backdrop-blur">
              <div class="text-sm font-semibold">类型</div>
              <div class="mt-2 flex flex-wrap gap-2">
                {detail.genres.map((g) => (
                  <Tag key={g} theme="primary" variant="light" shape="round" class="border-0 bg-white/12 text-white">
                    {g}
                  </Tag>
                ))}
              </div>
            </div>
          ) : null}

          {seriesReady.value ? (
            <div class="mt-4 rounded-2xl border border-white/10 bg-white/8 p-4 backdrop-blur">
              <div class="flex items-center justify-between gap-3">
                <div class="text-sm font-semibold">剧集</div>
                <div class="text-xs text-white/60">
                  当前播放：<span class="font-mono">{activeItemId.value.slice(0, 8)}</span>
                </div>
              </div>

              {seasonLoading.value ? (
                <div class="flex items-center justify-center py-8">
                  <Loading text="加载季信息..."/>
                </div>
              ) : seasonError.value ? (
                <div class="py-6 text-center text-sm text-red-200">{seasonError.value}</div>
              ) : (season.value?.items || []).length ? (
                <div class="mt-3">
                  <div class="flex gap-2 overflow-x-auto pb-2">
                    {(season.value?.items || []).map((s, idx) => {
                      const active = selectedSeasonId.value === s.id;
                      return (
                        <Button
                          key={s.id}
                          size="small"
                          theme={active ? 'primary' : 'default'}
                          variant={active ? 'base' : 'outline'}
                          class="shrink-0"
                          onClick={() => {
                            selectedSeasonId.value = s.id;
                          }}
                        >
                          {seasonLabel(s, idx)}
                        </Button>
                      );
                    })}
                  </div>

                  {selectedSeasonId.value ? (
                    <div class="mt-3">
                      {episodeLoadingMap[selectedSeasonId.value] ? (
                        <div class="flex items-center justify-center py-8">
                          <Loading text="加载剧集..."/>
                        </div>
                      ) : episodeErrorMap[selectedSeasonId.value] ? (
                        <div class="py-6 text-center text-sm text-red-200">
                          {episodeErrorMap[selectedSeasonId.value]}
                        </div>
                      ) : (episodeCacheMap[selectedSeasonId.value] || []).length ? (
                        <div class="grid grid-cols-4 gap-2">
                          {(episodeCacheMap[selectedSeasonId.value] || []).map((ep, idx) => {
                            const isPlaying = activeItemId.value === ep.id;
                            const played = ep.userData?.played === true;
                            const progressText =
                              typeof ep.userData?.playbackPositionMs === 'number' && ep.userData.playbackPositionMs > 0
                                ? formatDurationMs(ep.userData.playbackPositionMs)
                                : '';

                            return (
                              <Tooltip key={ep.id} content={ep.name} placement="top">
                                <Button
                                  theme={isPlaying ? 'primary' : played ? 'default' : 'primary'}
                                  variant={isPlaying ? 'base' : 'outline'}
                                  size="small"
                                  class={[
                                    'truncate',
                                    isPlaying ? 'shadow-lg shadow-blue-500/20' : '',
                                  ]}
                                  onClick={() => switchEpisode(ep)}
                                >
                                <span class="inline-flex items-center gap-1 min-w-0">
                                  {isPlaying ? <PlayCircleIcon/> : null}
                                  <span class="tabular-nums">{ep.indexNumber ?? idx + 1}</span>
                                  {progressText ? (
                                    <span class="text-[10px] text-white/60 truncate">{progressText}</span>
                                  ) : null}
                                </span>
                                </Button>
                              </Tooltip>
                            );
                          })}
                        </div>
                      ) : (
                        <div class="py-6 text-center text-sm text-white/60">暂无剧集</div>
                      )}
                    </div>
                  ) : (
                    <div class="py-6 text-center text-sm text-white/60">暂无剧集</div>
                  )}
                </div>
              ) : (
                <div class="py-6 text-center text-sm text-white/60">暂无剧集</div>
              )}
            </div>
          ) : null}
        </div>
      </div>
    ),
  });

}
