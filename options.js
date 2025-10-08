const extensionApi = typeof browser !== "undefined" ? browser : chrome;

const FALLBACK_PRESETS = {
  midnight: {
    label: "午夜黑",
    description: "高对比深色主题，适合暗室与 OLED 显示器。",
    colors: {
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
    }
  },
  graphite: {
    label: "石墨灰",
    description: "低对比柔和灰阶，保留深色氛围但减轻亮度。",
    colors: {
      frame: "#101014",
      frame_inactive: "#171720",
      tab_background_text: "#f6f7fb",
      tab_selected: "#202027",
      tab_loading: "#7dd3fc",
      tab_line: "#7dd3fc",
      toolbar: "#1b1b22",
      toolbar_text: "#f6f7fb",
      toolbar_field: "#23232b",
      toolbar_field_text: "#f6f7fb",
      toolbar_field_border: "#30303a",
      toolbar_field_border_focus: "#60a5fa",
      toolbar_vertical_separator: "#2f2f37",
      toolbar_top_separator: "#0b0f18",
      bookmark_text: "#f6f7fb",
      sidebar: "#171720",
      sidebar_text: "#f6f7fb",
      sidebar_highlight: "#252634",
      sidebar_highlight_text: "#f6f7fb",
      popup: "#1a1a22",
      popup_text: "#f6f7fb",
      popup_border: "#2f2f38"
    }
  },
  aurora: {
    label: "极光蓝",
    description: "在深色底下加入蓝绿点缀，增加层次感。",
    colors: {
      frame: "#081018",
      frame_inactive: "#111922",
      tab_background_text: "#f6f7fb",
      tab_selected: "#112030",
      tab_loading: "#38bdf8",
      tab_line: "#38bdf8",
      toolbar: "#0d1723",
      toolbar_text: "#f6f7fb",
      toolbar_field: "#132031",
      toolbar_field_text: "#f6f7fb",
      toolbar_field_border: "#1d2f45",
      toolbar_field_border_focus: "#38bdf8",
      toolbar_vertical_separator: "#1f2f45",
      toolbar_top_separator: "#060b12",
      bookmark_text: "#f6f7fb",
      sidebar: "#0b1622",
      sidebar_text: "#f6f7fb",
      sidebar_highlight: "#1e3a54",
      sidebar_highlight_text: "#f6f7fb",
      popup: "#0e1a27",
      popup_text: "#f6f7fb",
      popup_border: "#1d3146"
    }
  }
};

const COLOR_FIELDS = [
  { key: "frame", label: "浏览器框架（frame）" },
  { key: "toolbar", label: "工具列背景（toolbar）" },
  { key: "toolbar_text", label: "工具列文字（toolbar_text）" },
  { key: "tab_selected", label: "作用中分页（tab_selected）" },
  { key: "tab_background_text", label: "分页文字（tab_background_text）" },
  { key: "tab_line", label: "分页强调线（tab_line）" },
  { key: "toolbar_field", label: "网址列背景（toolbar_field）" },
  { key: "toolbar_field_text", label: "网址列文字（toolbar_field_text）" },
  { key: "sidebar", label: "侧边栏背景（sidebar）" },
  { key: "sidebar_text", label: "侧边栏文字（sidebar_text）" },
  { key: "popup", label: "弹出视窗背景（popup）" },
  { key: "popup_text", label: "弹出视窗文字（popup_text）" }
];

const state = {
  presets: {},
  defaultPreset: "midnight",
  colors: {},
  preset: "midnight"
};

let saveTimeoutId = null;

function cloneColors(payload) {
  return JSON.parse(JSON.stringify(payload));
}

function normalizeColors(colors) {
  const baseline = state.presets[state.defaultPreset]?.colors || FALLBACK_PRESETS.midnight.colors;
  return {
    ...baseline,
    ...(colors || {})
  };
}

function choosePreset(presetKey) {
  const preset = state.presets[presetKey];
  if (!preset) {
    return;
  }

  state.preset = presetKey;
  state.colors = normalizeColors(cloneColors(preset.colors));
  updateColorInputs();
  updatePresetSelection();
  updatePreview();
  queueSave();
}

function updatePresetSelection() {
  const buttons = document.querySelectorAll(".preset-button");
  buttons.forEach((button) => {
    const isActive = button.dataset.preset === state.preset;
    button.classList.toggle("selected", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
}

function updateColorInputs() {
  COLOR_FIELDS.forEach(({ key }) => {
    const input = document.querySelector(`input[data-key="${key}"]`);
    if (input && state.colors[key]) {
      input.value = state.colors[key];
    }
  });
}

function updatePreview() {
  const preview = document.getElementById("preview");
  if (!preview) {
    return;
  }

  const colors = normalizeColors(state.colors);
  preview.style.setProperty("--toolbar-bg", colors.toolbar);
  preview.style.setProperty("--toolbar-text", colors.toolbar_text);
  preview.style.setProperty("--tab-active", colors.tab_selected);
  preview.style.setProperty("--tab-line", colors.tab_line);
  preview.style.setProperty("--toolbar-field", colors.toolbar_field);
  preview.style.setProperty("--toolbar-field-text", colors.toolbar_field_text);
  preview.style.setProperty("--toolbar-field-border", colors.toolbar_field_border || "#282830");
  preview.style.setProperty("--sidebar-bg", colors.sidebar);
  preview.style.setProperty("--sidebar-text", colors.sidebar_text);
  preview.style.setProperty("--sidebar-highlight", colors.sidebar_highlight || colors.tab_selected);
  preview.style.setProperty(
    "--sidebar-highlight-text",
    colors.sidebar_highlight_text || colors.sidebar_text || "#f6f7fb"
  );
  preview.style.setProperty("--popup-bg", colors.popup);
  preview.style.setProperty("--popup-text", colors.popup_text);
  preview.style.setProperty("--popup-border", colors.popup_border || "#2b2b33");
}

function queueSave() {
  if (saveTimeoutId) {
    clearTimeout(saveTimeoutId);
  }

  saveTimeoutId = setTimeout(() => {
    saveTimeoutId = null;
    persistTheme();
  }, 200);
}

async function persistTheme() {
  const colors = normalizeColors(state.colors);
  const payload = {
    preset: state.presets[state.preset] ? state.preset : "custom",
    colors: cloneColors(colors)
  };

  try {
    await extensionApi.storage.local.set({ themeConfig: payload });
    await extensionApi.runtime.sendMessage({ type: "apply-theme", colors: payload.colors });
  } catch (error) {
    console.error("[options] Failed to persist theme:", error);
  }
}

function renderPresetButtons() {
  const container = document.getElementById("preset-list");
  container.textContent = "";

  Object.entries(state.presets).forEach(([key, preset]) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "preset-button";
    button.dataset.preset = key;
    button.setAttribute("role", "listitem");

    const swatch = document.createElement("div");
    swatch.className = "swatch";
    const sampleKeys = ["frame", "tab_selected", "tab_line", "popup"];
    sampleKeys.forEach((sampleKey) => {
      const span = document.createElement("span");
      span.style.background = preset.colors[sampleKey] || "#111827";
      swatch.appendChild(span);
    });

    const title = document.createElement("strong");
    title.textContent = preset.label;

    const description = document.createElement("em");
    description.textContent = preset.description;

    button.appendChild(swatch);
    button.appendChild(title);
    button.appendChild(description);

    button.addEventListener("click", () => choosePreset(key));
    container.appendChild(button);
  });

  updatePresetSelection();
}

function renderColorFields() {
  const wrapper = document.getElementById("color-fields");
  wrapper.textContent = "";

  COLOR_FIELDS.forEach(({ key, label }) => {
    const field = document.createElement("div");
    field.className = "field";

    const labelEl = document.createElement("label");
    labelEl.setAttribute("for", `color-${key}`);
    labelEl.textContent = label;

    const input = document.createElement("input");
    input.type = "color";
    input.id = `color-${key}`;
    input.dataset.key = key;
    input.value = state.colors[key] || "#000000";

    input.addEventListener("input", (event) => {
      const value = event.target.value;
      if (!/^#[0-9a-f]{6}$/i.test(value)) {
        return;
      }
      state.colors[key] = value.toLowerCase();
      state.preset = "custom";
      updatePresetSelection();
      updatePreview();
      queueSave();
    });

    field.appendChild(labelEl);
    field.appendChild(input);
    wrapper.appendChild(field);
  });
}

async function loadInitialState() {
  let response;
  try {
    response = await extensionApi.runtime.sendMessage({ type: "get-presets" });
  } catch (error) {
    console.warn("[options] Failed to load presets from background, fallback to local copy.", error);
  }

  state.presets = response?.presets || FALLBACK_PRESETS;
  state.defaultPreset = response?.defaultPreset || "midnight";

  const stored = await extensionApi.storage.local.get("themeConfig").catch(() => ({}));
  const storedConfig = stored.themeConfig;

  if (storedConfig) {
    state.preset = state.presets[storedConfig.preset] ? storedConfig.preset : "custom";
    state.colors = normalizeColors(cloneColors(storedConfig.colors));
  } else {
    state.preset = state.defaultPreset;
    state.colors = normalizeColors(cloneColors(state.presets[state.defaultPreset].colors));
  }
}

function bindActions() {
  const resetButton = document.getElementById("reset-button");
  resetButton?.addEventListener("click", () => {
    choosePreset(state.defaultPreset);
  });

  const applyButton = document.getElementById("apply-button");
  applyButton?.addEventListener("click", () => {
    persistTheme();
  });
}

async function init() {
  if (!extensionApi?.storage || !extensionApi.runtime) {
    console.error("[options] Browser 扩展 API 不可用。");
    return;
  }

  await loadInitialState();
  renderPresetButtons();
  renderColorFields();
  updateColorInputs();
  updatePreview();
  bindActions();
}

document.addEventListener("DOMContentLoaded", () => {
  init();
});
