import type { MediaDetail } from '@/modules/media/types/detail/MediaDetail.ts';
import { DrawerPlugin } from 'tdesign-vue-next';
import DetailDrawerContent from './DetailDrawerContent';

export function openDetailDrawer(options: {
  detail: MediaDetail;
  timeText: string;
  durationText: string;
}) {
  const { detail, timeText, durationText } = options;

  const plugin = DrawerPlugin({
    size: '420px',
    placement: 'right',
    header: detail.name,
    closeBtn: true,
    footer: false,
    default: () => <DetailDrawerContent detail={detail} timeText={timeText} durationText={durationText} />,
    onClose: () => plugin.destroy?.(),
  });

  return plugin;
}

