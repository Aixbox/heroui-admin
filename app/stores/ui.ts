import { create } from "zustand";

export type Locale = "zh" | "en";

interface UiState {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

function applyLocale(locale: Locale) {
  if (typeof document !== "undefined") {
    document.documentElement.lang = locale === "zh" ? "zh-CN" : "en";
  }
}

export const useUiStore = create<UiState>((set) => ({
  locale: "zh",
  setLocale: (locale) => {
    applyLocale(locale);
    try {
      localStorage.setItem("acme.locale", locale);
    } catch {
      // 隐私模式下 localStorage 可能不可用，忽略即可
    }
    set({ locale });
  },
}));
