import {h, render} from "vue";
import {ImageViewer} from "tdesign-vue-next";

export function previewImages(images: string[], startIndex = 0) {
  const list = (images || []).filter(Boolean);
  if (!list.length) return;

  const safeIndex = Math.min(Math.max(startIndex, 0), list.length - 1);
  const container = document.createElement("div");
  document.body.appendChild(container);

  const close = () => {
    render(null, container);
    container.remove();
  };

  render(
    h(ImageViewer, {
      images: list,
      defaultIndex: safeIndex,
      defaultVisible: true,
      closeOnOverlay: true,
      onClose: close,
    }),
    container
  );
}

