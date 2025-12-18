import {LocalName} from "@/global/LocalName";
import type { Ref, ComputedRef } from "vue";

export type ColorModeType = "auto" | "light" | "dark";

interface ColorModeResult {
  colorMode: Ref<ColorModeType>;
  isDark: ComputedRef<boolean>;
}

function isDarkColors(): boolean {
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false;
}

let _colorMode: Ref<ColorModeType> | null = null;
let _isDark: ComputedRef<boolean> | null = null;
let _initialized = false;

export const useColorMode = (): ColorModeResult => {
  if (!_colorMode || !_isDark) {
    const storage = useLocalStorage<ColorModeType | number>(LocalName.KEY_THEME, "auto");
    if (typeof storage.value === "number") {
      const map: Record<number, ColorModeType> = { 1: "light", 2: "dark", 3: "auto" };
      storage.value = map[storage.value] || "auto";
    }
    _colorMode = storage as Ref<ColorModeType>;
    _isDark = computed(() => {
      if (_colorMode!.value === "dark") {
        return true;
      } else if (_colorMode!.value === "light") {
        return false;
      }
      return isDarkColors();
    });

    function renderColorMode() {
      const htmlElement = document.documentElement;
      const mode = _colorMode!.value;

      if (mode === "light") {
        htmlElement.setAttribute("theme-mode", "light");
        htmlElement.classList.remove("dark");
        htmlElement.classList.add("light");
      } else if (mode === "dark") {
        htmlElement.setAttribute("theme-mode", "dark");
        htmlElement.classList.remove("light");
        htmlElement.classList.add("dark");
      } else {
        const val = isDarkColors() ? "dark" : "light";
        htmlElement.setAttribute("theme-mode", val);
        htmlElement.classList.remove(val === "dark" ? "light" : "dark");
        htmlElement.classList.add(val);
      }
    }

    if (!_initialized) {
      const mql = window.matchMedia?.("(prefers-color-scheme: dark)");
      mql?.addEventListener?.("change", renderColorMode);
      renderColorMode();
      watch(_colorMode, () => renderColorMode());
      _initialized = true;
    }
  }
  return { colorMode: _colorMode!, isDark: _isDark! };
};
