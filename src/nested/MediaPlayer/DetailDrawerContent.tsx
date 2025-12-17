import type { FunctionalComponent } from 'vue';
import type { MediaDetail } from '@/modules/media/types/detail/MediaDetail.ts';
import { Paragraph, Tag } from 'tdesign-vue-next';

export type DetailDrawerContentProps = {
  detail: MediaDetail;
  timeText: string;
  durationText: string;
};

function typeLabel(type: MediaDetail['type']) {
  if (type === 'Movie') return '电影';
  if (type === 'Series') return '剧集';
  return type;
}

const DetailDrawerContent: FunctionalComponent<DetailDrawerContentProps> = (props) => {
  const d = props.detail;

  return (
    <div class="p-4">
      <div class="flex gap-4">
        <div class="w-28 shrink-0">
          {d.posterUrl ? (
            <img src={d.posterUrl} class="w-28 h-40 object-cover rounded-xl" />
          ) : (
            <div class="w-28 h-40 rounded-xl bg-gradient-to-br from-indigo-500/35 via-fuchsia-500/25 to-cyan-500/35" />
          )}
        </div>
        <div class="min-w-0 flex-1">
          <div class="text-base font-semibold leading-snug">{d.name}</div>
          <div class="mt-2 flex flex-wrap gap-2">
            <Tag theme="primary" variant="light" shape="round">
              {typeLabel(d.type)}
            </Tag>
            {d.year ? (
              <Tag theme="primary" variant="light" shape="round">
                {d.year}
              </Tag>
            ) : null}
            {typeof d.rating === 'number' ? (
              <Tag theme="success" variant="light" shape="round">
                {d.rating.toFixed(1)}
              </Tag>
            ) : null}
          </div>
          <div class="mt-3 grid grid-cols-2 gap-2 text-xs text-white/75">
            <div class="rounded-lg bg-black/10 p-2">
              <div class="text-white/60">当前进度</div>
              <div class="mt-1 font-mono tabular-nums">{props.timeText}</div>
            </div>
            <div class="rounded-lg bg-black/10 p-2">
              <div class="text-white/60">总时长</div>
              <div class="mt-1 font-mono tabular-nums">{props.durationText}</div>
            </div>
          </div>
        </div>
      </div>

      <div class="mt-4">
        <div class="text-sm font-semibold">简介</div>
        <div class="mt-2 text-sm text-white/80 leading-relaxed">
          <Paragraph ellipsis={{ row: 6, expandable: true, collapsible: true }}>{d.overview || '暂无简介'}</Paragraph>
        </div>
      </div>

      {d.genres?.length ? (
        <div class="mt-4">
          <div class="text-sm font-semibold">标签</div>
          <div class="mt-2 flex flex-wrap gap-2">
            {d.genres.map((g) => (
              <Tag key={g} theme="primary" variant="light" shape="round">
                {g}
              </Tag>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default DetailDrawerContent;

