const DEFAULT_PRESET = "midnight";

const BASE_COLORS = {
  frame: "#0b0b0d",
  frame_inactive: "#111114",
  tab_background_text: "#f6f7fb",
  tab_selected: "#1c1c21",
  tab_loading: "#4c8dff",
  tab_line: "#4c8dff",
  toolbar: "#141419",
  toolbar_text: "#f6f7fb",
  toolbar_field: "#1b1b21",
  toolbar_field_text: "#f6f7fb",
  toolbar_field_border: "#282830",
  toolbar_field_border_focus: "#3b82f6",
  toolbar_vertical_separator: "#2f2f37",
  toolbar_top_separator: "#07070a",
  bookmark_text: "#f6f7fb",
  sidebar: "#101016",
  sidebar_text: "#f6f7fb",
  sidebar_highlight: "#1f2937",
  sidebar_highlight_text: "#f6f7fb",
  popup: "#141419",
  popup_text: "#f6f7fb",
  popup_border: "#2b2b33"
};

const PRESETS = {
  midnight: {
    label: "午夜黑",
    description: "高对比深色主题，适合暗室与 OLED 显示器。",
    colors: {
      ...BASE_COLORS
    }
  },
  graphite: {
    label: "石墨灰",
    description: "低对比柔和灰阶，保留深色氛围但减轻亮度。",
    colors: {
      ...BASE_COLORS,
      frame: "#101014",
      frame_inactive: "#171720",
      tab_selected: "#202027",
      toolbar: "#1b1b22",
      toolbar_field: "#23232b",
      sidebar: "#171720",
      popup: "#1a1a22",
      popup_border: "#2f2f38",
      tab_line: "#7dd3fc",
      tab_loading: "#7dd3fc",
      toolbar_field_border_focus: "#60a5fa"
    }
  },
  aurora: {
    label: "极光蓝",
    description: "在深色底下加入蓝绿点缀，增加层次感。",
    colors: {
      ...BASE_COLORS,
      frame: "#081018",
      frame_inactive: "#111922",
      tab_selected: "#112030",
      toolbar: "#0d1723",
      toolbar_field: "#132031",
      toolbar_field_border: "#1d2f45",
      toolbar_field_border_focus: "#38bdf8",
      tab_line: "#38bdf8",
      tab_loading: "#38bdf8",
      sidebar: "#0b1622",
      sidebar_highlight: "#1e3a54",
      popup: "#0e1a27",
      popup_border: "#1d3146"
    }
  }
};

function cloneColors(colors) {
  return JSON.parse(JSON.stringify(colors));
}

function normalizeColors(colors = {}) {
  return {
    ...BASE_COLORS,
    ...colors
  };
}

async function applyTheme(colors) {
  const normalized = normalizeColors(colors);
  try {
    await browser.theme.update({ colors: normalized });
  } catch (error) {
    console.error("[theme] update failed:", error);
  }
}

async function ensureThemeConfig() {
  const stored = await browser.storage.local.get("themeConfig");
  if (!stored.themeConfig) {
    const fallback = cloneColors(PRESETS[DEFAULT_PRESET].colors);
    await browser.storage.local.set({
      themeConfig: {
        preset: DEFAULT_PRESET,
        colors: fallback
      }
    });
    await applyTheme(fallback);
    return;
  }

  await applyTheme(stored.themeConfig.colors);
}

browser.runtime.onInstalled.addListener(() => {
  ensureThemeConfig();
});

browser.runtime.onStartup.addListener(() => {
  ensureThemeConfig();
});

browser.storage.onChanged.addListener((changes, area) => {
  if (area !== "local" || !changes.themeConfig) {
    return;
  }

  const colors = changes.themeConfig.newValue?.colors;
  if (colors) {
    applyTheme(colors);
  }
});

browser.runtime.onMessage.addListener((message) => {
  if (!message || typeof message !== "object") {
    return;
  }

  if (message.type === "apply-theme" && message.colors) {
    return applyTheme(message.colors);
  }

  if (message.type === "reset-theme") {
    const presetName =
      message.preset && Object.prototype.hasOwnProperty.call(PRESETS, message.preset)
        ? message.preset
        : DEFAULT_PRESET;

    const fallback = cloneColors(PRESETS[presetName].colors);
    return browser.storage.local
      .set({
        themeConfig: {
          preset: presetName,
          colors: fallback
        }
      })
      .then(() => applyTheme(fallback));
  }

  if (message.type === "get-presets") {
    const payload = {};
    for (const [key, value] of Object.entries(PRESETS)) {
      payload[key] = {
        label: value.label,
        description: value.description,
        colors: value.colors
      };
    }

    return Promise.resolve({
      defaultPreset: DEFAULT_PRESET,
      presets: payload
    });
  }

  return undefined;
});
