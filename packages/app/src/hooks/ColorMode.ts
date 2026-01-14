import {LocalName} from "@/global/LocalName";
import type {Ref, ComputedRef} from "vue";

export type ColorModeType = "auto" | "light" | "dark";

interface ColorModeResult {
  colorMode: Ref<ColorModeType>;
  isDark: ComputedRef<boolean>;
}

function isDarkColors(): boolean {
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false;
}


export const useColorMode = (): ColorModeResult => {
  const colorMode = useLocalStorage<ColorModeType>(LocalName.KEY_THEME, "auto");
  const isDark = ref(isDarkColors());

  function renderColorMode() {

    if (colorMode.value === "auto") {
      isDark.value = isDarkColors();
    } else if (colorMode.value === "light") {
      isDark.value = false;
    } else if (colorMode.value === "dark") {
      isDark.value = true;
    }

    const htmlElement = document.documentElement;

    if (isDark.value) {
      htmlElement.setAttribute("theme-mode", "dark");
      htmlElement.classList.remove("light");
      htmlElement.classList.add("dark");
    } else {
      htmlElement.setAttribute("theme-mode", "light");
      htmlElement.classList.remove("dark");
      htmlElement.classList.add("light");
    }
  }

  watch(colorMode, renderColorMode, {immediate: true});
  const mql = window.matchMedia?.("(prefers-color-scheme: dark)");
  mql?.addEventListener?.("change", renderColorMode);
  return {
    colorMode, isDark: computed({
      get() {
        return isDark.value;
      },
      set(value) {
        colorMode.value = value ? "dark" : "light";
      }
    })
  };
};
