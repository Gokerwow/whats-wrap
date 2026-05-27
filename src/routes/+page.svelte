<script lang="ts">
  import { onMount } from "svelte";
  import { invoke } from "@tauri-apps/api/core";
  import { open } from "@tauri-apps/plugin-dialog";
  import type { FormEventHandler } from "svelte/elements";

  let saveTimer: ReturnType<typeof setTimeout>;

  let sidebarWidth = $state(260); // Slightly wider default for the new design
  let wallpaperStatus = $state("");
  let isDragging = $state(false);
  let isChanging = $state(true); // Default open to show the new menu
  let urlValue = $state("");
  let localFile = $state("");
  let compressImage = $state(true);
  let accentColor = $state(""); // Default WhatsApp Green
  let contentDeemphasized = $state("");
  let bubbleSurfaceIncoming = $state("");
  let bubbleSurfaceOutgoing = $state("");
  let chatSurfaceComposer = $state("");
  let surfaceHighlight = $state("");
  let surfaceDefault = $state("");
  let persistentAlwaysBranded = $state("");
  let contentDefault = $state("");
  let surfaceEmphasized = $state("");
  let messagePrimary = $state("");
  let contentRead = $state("");
  let contentOnAccent = $state("");
  let componentsActiveListRow = $state("");
  let backgroundDefault = $state("");
  let chatBackgroundWallpaper = $state("");
  let searchContainerFix = $state<"as-is" | "fixed">("as-is");

  async function changeWallpaper(event: Event) {
    event.preventDefault();
    wallpaperStatus = "Changing...";
    try {
      if (localFile) {
        await invoke("set_chat_wallpaper_local", {
          filePath: localFile,
          compressImage: compressImage,
          saveToConfig: true
        });
      } else if (urlValue) {
        await invoke("set_chat_wallpaper", {
          wallpaperUrl: urlValue,
          compressImage: compressImage,
          saveToConfig: true
        });
      }
      wallpaperStatus = "Wallpaper changed!";
    } catch (e) {
      console.error("Tauri Invoke Error:", e);
      wallpaperStatus = `Failed: ${e}`;
    } finally {
      localFile = "";
      urlValue = "";
    }
    setTimeout(() => (wallpaperStatus = ""), 3000);
  }

  async function resetWallpaper() {
    wallpaperStatus = "Changing...";
    try {
      await invoke("reset_wallpaper_default");
      wallpaperStatus = "Wallpaper changed!";
    } catch (e) {
      console.error("Tauri Invoke Error:", e);
      wallpaperStatus = `Failed: ${e}`;
    }
    setTimeout(() => (wallpaperStatus = ""), 3000);
  }

  function startResize() {
    isDragging = true;
    window.addEventListener("mousemove", resize);
    window.addEventListener("mouseup", stopResize);
  }

  function resize(event: { clientX: number }) {
    if (!isDragging) return;
    if (event.clientX > 70 && event.clientX < 500) {
      sidebarWidth = event.clientX;
      invoke("resize_sidebar", { newWidth: sidebarWidth });
    }
  }

  function stopResize() {
    isDragging = false;
    window.removeEventListener("mousemove", resize);
    window.removeEventListener("mouseup", stopResize);
  }

  function handleChangeWallpaperClick() {
    isChanging = !isChanging;
  }

  async function selectLocalFile() {
    const selectedPath = await open({
      filters: [
        {
          name: "Image",
          extensions: ["png", "jpeg", "jpg"],
        },
      ],
    });

    if (selectedPath) {
      localFile = selectedPath;
      console.log("localFile: ", localFile);
    }
  }

  const applyAccentColor: FormEventHandler<HTMLInputElement> = async (event) => {
    const currentColor = event.currentTarget.value;
    accentColor = currentColor;

    try {
      await invoke("set_accent_color", { color: currentColor, saveToConfig: false });
    } catch (e) {
      console.error("Tauri Live Preview Error:", e);
    }

    clearTimeout(saveTimer);
    
    saveTimer = setTimeout(async () => {
      try {
        console.log("💾 User stopped moving the mouse! Writing to config.json...");
        await invoke("set_accent_color", { color: currentColor, saveToConfig: true });
      } catch (e) {
        console.error("Tauri Disk Save Error:", e);
      }
    }, 500);
  };

  const applyContentDeemphasized: FormEventHandler<HTMLInputElement> = async (event) => {
    const currentColor = event.currentTarget.value;
    contentDeemphasized = currentColor;
    try {
      await invoke("set_content_deemphasized", { color: currentColor, saveToConfig: false });
    } catch (e) { console.error(e); }
    clearTimeout(saveTimer);
    saveTimer = setTimeout(async () => {
      try { await invoke("set_content_deemphasized", { color: currentColor, saveToConfig: true }); }
      catch (e) { console.error(e); }
    }, 500);
  };

  const applyBubbleSurfaceIncoming: FormEventHandler<HTMLInputElement> = async (event) => {
    const currentColor = event.currentTarget.value;
    bubbleSurfaceIncoming = currentColor;
    try {
      await invoke("set_bubble_surface_incoming", { color: currentColor, saveToConfig: false });
    } catch (e) { console.error(e); }
    clearTimeout(saveTimer);
    saveTimer = setTimeout(async () => {
      try { await invoke("set_bubble_surface_incoming", { color: currentColor, saveToConfig: true }); }
      catch (e) { console.error(e); }
    }, 500);
  };

  const applyBubbleSurfaceOutgoing: FormEventHandler<HTMLInputElement> = async (event) => {
    const currentColor = event.currentTarget.value;
    bubbleSurfaceOutgoing = currentColor;
    try {
      await invoke("set_bubble_surface_outgoing", { color: currentColor, saveToConfig: false });
    } catch (e) { console.error(e); }
    clearTimeout(saveTimer);
    saveTimer = setTimeout(async () => {
      try { await invoke("set_bubble_surface_outgoing", { color: currentColor, saveToConfig: true }); }
      catch (e) { console.error(e); }
    }, 500);
  };

  const applyChatSurfaceComposer: FormEventHandler<HTMLInputElement> = async (event) => {
    const currentColor = event.currentTarget.value;
    chatSurfaceComposer = currentColor;
    try {
      await invoke("set_chat_surface_composer", { color: currentColor, saveToConfig: false });
    } catch (e) { console.error(e); }
    clearTimeout(saveTimer);
    saveTimer = setTimeout(async () => {
      try { await invoke("set_chat_surface_composer", { color: currentColor, saveToConfig: true }); }
      catch (e) { console.error(e); }
    }, 500);
  };

  const applySurfaceHighlight: FormEventHandler<HTMLInputElement> = async (event) => {
    const currentColor = event.currentTarget.value;
    surfaceHighlight = currentColor;
    try {
      await invoke("set_surface_highlight", { color: currentColor, saveToConfig: false });
    } catch (e) { console.error(e); }
    clearTimeout(saveTimer);
    saveTimer = setTimeout(async () => {
      try { await invoke("set_surface_highlight", { color: currentColor, saveToConfig: true }); }
      catch (e) { console.error(e); }
    }, 500);
  };

  const applySurfaceDefault: FormEventHandler<HTMLInputElement> = async (event) => {
    const currentColor = event.currentTarget.value;
    surfaceDefault = currentColor;
    try {
      await invoke("set_surface_default", { color: currentColor, saveToConfig: false });
    } catch (e) { console.error(e); }
    clearTimeout(saveTimer);
    saveTimer = setTimeout(async () => {
      try { await invoke("set_surface_default", { color: currentColor, saveToConfig: true }); }
      catch (e) { console.error(e); }
    }, 500);
  };

  const applyPersistentAlwaysBranded: FormEventHandler<HTMLInputElement> = async (event) => {
    const currentColor = event.currentTarget.value;
    persistentAlwaysBranded = currentColor;
    try {
      await invoke("set_persistent_always_branded", { color: currentColor, saveToConfig: false });
    } catch (e) { console.error(e); }
    clearTimeout(saveTimer);
    saveTimer = setTimeout(async () => {
      try { await invoke("set_persistent_always_branded", { color: currentColor, saveToConfig: true }); }
      catch (e) { console.error(e); }
    }, 500);
  };

  const applyContentDefault: FormEventHandler<HTMLInputElement> = async (event) => {
    const currentColor = event.currentTarget.value;
    contentDefault = currentColor;
    try {
      await invoke("set_content_default", { color: currentColor, saveToConfig: false });
    } catch (e) { console.error(e); }
    clearTimeout(saveTimer);
    saveTimer = setTimeout(async () => {
      try { await invoke("set_content_default", { color: currentColor, saveToConfig: true }); }
      catch (e) { console.error(e); }
    }, 500);
  };

  const applySurfaceEmphasized: FormEventHandler<HTMLInputElement> = async (event) => {
    const currentColor = event.currentTarget.value;
    surfaceEmphasized = currentColor;
    try {
      await invoke("set_surface_emphasized", { color: currentColor, saveToConfig: false });
    } catch (e) { console.error(e); }
    clearTimeout(saveTimer);
    saveTimer = setTimeout(async () => {
      try { await invoke("set_surface_emphasized", { color: currentColor, saveToConfig: true }); }
      catch (e) { console.error(e); }
    }, 500);
  };

  const applyMessagePrimary: FormEventHandler<HTMLInputElement> = async (event) => {
    const currentColor = event.currentTarget.value;
    messagePrimary = currentColor;
    try {
      await invoke("set_message_primary", { color: currentColor, saveToConfig: false });
    } catch (e) { console.error(e); }
    clearTimeout(saveTimer);
    saveTimer = setTimeout(async () => {
      try { await invoke("set_message_primary", { color: currentColor, saveToConfig: true }); }
      catch (e) { console.error(e); }
    }, 500);
  };

  const applyContentRead: FormEventHandler<HTMLInputElement> = async (event) => {
    const currentColor = event.currentTarget.value;
    contentRead = currentColor;
    try {
      await invoke("set_content_read", { color: currentColor, saveToConfig: false });
    } catch (e) { console.error(e); }
    clearTimeout(saveTimer);
    saveTimer = setTimeout(async () => {
      try { await invoke("set_content_read", { color: currentColor, saveToConfig: true }); }
      catch (e) { console.error(e); }
    }, 500);
  };

  const applyContentOnAccent: FormEventHandler<HTMLInputElement> = async (event) => {
    const currentColor = event.currentTarget.value;
    contentOnAccent = currentColor;
    try {
      await invoke("set_content_on_accent", { color: currentColor, saveToConfig: false });
    } catch (e) { console.error(e); }
    clearTimeout(saveTimer);
    saveTimer = setTimeout(async () => {
      try { await invoke("set_content_on_accent", { color: currentColor, saveToConfig: true }); }
      catch (e) { console.error(e); }
    }, 500);
  };

  const applyComponentsActiveListRow: FormEventHandler<HTMLInputElement> = async (event) => {
    const currentColor = event.currentTarget.value;
    componentsActiveListRow = currentColor;
    try {
      await invoke("set_components_active_list_row", { color: currentColor, saveToConfig: false });
    } catch (e) { console.error(e); }
    clearTimeout(saveTimer);
    saveTimer = setTimeout(async () => {
      try { await invoke("set_components_active_list_row", { color: currentColor, saveToConfig: true }); }
      catch (e) { console.error(e); }
    }, 500);
  };

  const applyBackgroundDefault: FormEventHandler<HTMLInputElement> = async (event) => {
    const currentColor = event.currentTarget.value;
    backgroundDefault = currentColor;
    try {
      await invoke("set_background_default", { color: currentColor, saveToConfig: false });
    } catch (e) { console.error(e); }
    clearTimeout(saveTimer);
    saveTimer = setTimeout(async () => {
      try { await invoke("set_background_default", { color: currentColor, saveToConfig: true }); }
      catch (e) { console.error(e); }
    }, 500);
  };

  const applyChatBackgroundWallpaper: FormEventHandler<HTMLInputElement> = async (event) => {
    const currentColor = event.currentTarget.value;
    chatBackgroundWallpaper = currentColor;
    try {
      await invoke("set_chat_background_wallpaper", { color: currentColor, saveToConfig: false });
    } catch (e) { console.error(e); }
    clearTimeout(saveTimer);
    saveTimer = setTimeout(async () => {
      try { await invoke("set_chat_background_wallpaper", { color: currentColor, saveToConfig: true }); }
      catch (e) { console.error(e); }
    }, 500);
  };

  // ── Defaults ─────────────────────────────────────────────────────────────
  // Empty string = don't override, let WhatsApp's own stylesheet show through.
  const DEFAULTS = {
    accentColor:              "",
    contentDeemphasized:      "",
    bubbleSurfaceIncoming:    "",
    bubbleSurfaceOutgoing:    "",
    chatSurfaceComposer:      "",
    surfaceHighlight:         "",
    surfaceDefault:           "",
    persistentAlwaysBranded:  "",
    contentDefault:           "",
    surfaceEmphasized:        "",
    messagePrimary:           "",
    contentRead:              "",
    contentOnAccent:          "",
    componentsActiveListRow:  "",
    backgroundDefault:        "",
    chatBackgroundWallpaper:  "",
  } as const;

  async function resetAllColors() {
    accentColor             = DEFAULTS.accentColor;
    contentDeemphasized     = DEFAULTS.contentDeemphasized;
    bubbleSurfaceIncoming   = DEFAULTS.bubbleSurfaceIncoming;
    bubbleSurfaceOutgoing   = DEFAULTS.bubbleSurfaceOutgoing;
    chatSurfaceComposer     = DEFAULTS.chatSurfaceComposer;
    surfaceHighlight        = DEFAULTS.surfaceHighlight;
    surfaceDefault          = DEFAULTS.surfaceDefault;
    persistentAlwaysBranded = DEFAULTS.persistentAlwaysBranded;
    contentDefault          = DEFAULTS.contentDefault;
    surfaceEmphasized       = DEFAULTS.surfaceEmphasized;
    messagePrimary          = DEFAULTS.messagePrimary;
    contentRead             = DEFAULTS.contentRead;
    contentOnAccent         = DEFAULTS.contentOnAccent;
    componentsActiveListRow = DEFAULTS.componentsActiveListRow;
    backgroundDefault       = DEFAULTS.backgroundDefault;
    chatBackgroundWallpaper = DEFAULTS.chatBackgroundWallpaper;

    try {
      await invoke("reset_all_colors");
    } catch (e) {
      console.error("Failed to reset colors:", e);
    }
  }

  async function resetEverything() {
    // Reset state vars
    accentColor             = DEFAULTS.accentColor;
    contentDeemphasized     = DEFAULTS.contentDeemphasized;
    bubbleSurfaceIncoming   = DEFAULTS.bubbleSurfaceIncoming;
    bubbleSurfaceOutgoing   = DEFAULTS.bubbleSurfaceOutgoing;
    chatSurfaceComposer     = DEFAULTS.chatSurfaceComposer;
    surfaceHighlight        = DEFAULTS.surfaceHighlight;
    surfaceDefault          = DEFAULTS.surfaceDefault;
    persistentAlwaysBranded = DEFAULTS.persistentAlwaysBranded;
    contentDefault          = DEFAULTS.contentDefault;
    surfaceEmphasized       = DEFAULTS.surfaceEmphasized;
    messagePrimary          = DEFAULTS.messagePrimary;
    contentRead             = DEFAULTS.contentRead;
    contentOnAccent         = DEFAULTS.contentOnAccent;
    componentsActiveListRow = DEFAULTS.componentsActiveListRow;
    backgroundDefault       = DEFAULTS.backgroundDefault;
    chatBackgroundWallpaper = DEFAULTS.chatBackgroundWallpaper;
    urlValue                = "";
    localFile               = "";

    try {
      await invoke("reset_everything");
    } catch (e) {
      console.error("Failed to reset everything:", e);
    }
  }
  onMount(async () => {
    try {
      const config = await invoke<{
        main_color:                 string | null;
        content_deemphasized:       string | null;
        bubble_surface_incoming:    string | null;
        bubble_surface_outgoing:    string | null;
        chat_surface_composer:      string | null;
        surface_highlight:          string | null;
        surface_default:            string | null;
        persistent_always_branded:  string | null;
        content_default:            string | null;
        surface_emphasized:         string | null;
        message_primary:            string | null;
        content_read:               string | null;
        content_on_accent:          string | null;
        components_active_list_row: string | null;
        background_default:         string | null;
        chat_background_wallpaper:  string | null;
        search_container_fix:       string | null;
      }>("get_config_for_frontend");

      accentColor             = config.main_color                 ?? "";
      contentDeemphasized     = config.content_deemphasized       ?? "";
      bubbleSurfaceIncoming   = config.bubble_surface_incoming    ?? "";
      bubbleSurfaceOutgoing   = config.bubble_surface_outgoing    ?? "";
      chatSurfaceComposer     = config.chat_surface_composer      ?? "";
      surfaceHighlight        = config.surface_highlight          ?? "";
      surfaceDefault          = config.surface_default            ?? "";
      persistentAlwaysBranded = config.persistent_always_branded  ?? "";
      contentDefault          = config.content_default            ?? "";
      surfaceEmphasized       = config.surface_emphasized         ?? "";
      messagePrimary          = config.message_primary            ?? "";
      contentRead             = config.content_read               ?? "";
      contentOnAccent         = config.content_on_accent          ?? "";
      componentsActiveListRow = config.components_active_list_row ?? "";
      backgroundDefault       = config.background_default         ?? "";
      chatBackgroundWallpaper = config.chat_background_wallpaper  ?? "";
      searchContainerFix      = (config.search_container_fix      ?? "as-is") as "as-is" | "fixed";
    } catch (e) {
      console.error("Failed to load color config:", e);
    }
  });
</script>

<div class="layout">
  <aside
    class="sidebar {sidebarWidth < 140 ? 'collapsed' : ''}"
    style="width: {sidebarWidth}px;"
  >
    <div class="sidebar-header">
      <div class="app-identity">
        <div class="app-icon">
        <!-- Todo: CHANGE THE ICON -->
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
            ><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg
          >
        </div>
        <span class="app-name">Wrap It App</span>
      </div>
      <div class="search-bar">
        <svg
          class="search-icon"
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          ><circle cx="11" cy="11" r="8" /><line
            x1="21"
            y1="21"
            x2="16.65"
            y2="16.65"
          /></svg
        >
        <span class="search-placeholder">Quick search…</span>
        <span class="search-kbd">⌘K</span>
      </div>
    </div>

    <nav class="sidebar-nav">
      <section class="nav-section">
        <span class="section-label">WhatsApp Tweaks</span>

        <button
          class="nav-btn dropdown-toggle {isChanging ? 'active' : ''}"
          onclick={handleChangeWallpaperClick}
        >
          <div class="btn-content">
            <svg
              class="nav-icon"
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              ><circle cx="12" cy="12" r="3"></circle><path
                d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"
              ></path></svg
            >
            <span class="nav-text">Appearance</span>
          </div>
          <svg
            class="chevron-icon {isChanging ? 'open' : ''}"
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            ><polyline points="6 9 12 15 18 9"></polyline></svg
          >
        </button>

        {#if isChanging}
          <div class="dropdown-menu">

            <!-- ── Reset Everything ── -->
            <div class="action-row" style="margin-top: 0; margin-bottom: 0;">
              <button
                type="button"
                class="btn-danger-text w-full"
                onclick={resetEverything}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 4 1 10 7 10"></polyline><path d="M3.51 15a9 9 0 1 0 .49-4.5"></path></svg>
                Reset Everything to Default
              </button>
            </div>

            <!-- ── Colors ── -->
            <div class="settings-section-title">Colors</div>

            <div class="action-row" style="margin-top: 0; margin-bottom: 2px;">
              <button
                type="button"
                class="btn-danger-text w-full"
                onclick={resetAllColors}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 4 1 10 7 10"></polyline><path d="M3.51 15a9 9 0 1 0 .49-4.5"></path></svg>
                Reset All Colors to Default
              </button>
            </div>

            <div class="setting-group">
              <span class="setting-label">Accent Color <span class="setting-hint">--WDS-accent</span></span>
              <div class="color-picker-wrapper">
                <input type="color" class="color-input" oninput={applyAccentColor} />
                <span class="color-value">{accentColor}</span>
              
                <button type="button" class="btn-color-reset" title="Reset to default" onclick={async () => { accentColor = ''; try { await invoke('reset_main_color'); } catch(e) { console.error(e); } }}><svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 4 1 10 7 10"></polyline><path d="M3.51 15a9 9 0 1 0 .49-4.5"></path></svg></button>
              </div>
            </div>

            <div class="setting-group">
              <span class="setting-label">Chat List Background <span class="setting-hint">--background-default</span></span>
              <div class="color-picker-wrapper">
                <input type="color" class="color-input" bind:value={backgroundDefault} oninput={applyBackgroundDefault} />
                <span class="color-value">{backgroundDefault}</span>
              
                <button type="button" class="btn-color-reset" title="Reset to default" onclick={async () => { backgroundDefault = ''; try { await invoke('reset_background_default'); } catch(e) { console.error(e); } }}><svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 4 1 10 7 10"></polyline><path d="M3.51 15a9 9 0 1 0 .49-4.5"></path></svg></button>
              </div>
            </div>

            <div class="setting-group">
              <span class="setting-label">Headers & Chat List Bars <span class="setting-hint">--WDS-surface-default</span></span>
              <div class="color-picker-wrapper">
                <input type="color" class="color-input" bind:value={surfaceDefault} oninput={applySurfaceDefault} />
                <span class="color-value">{surfaceDefault}</span>
              
                <button type="button" class="btn-color-reset" title="Reset to default" onclick={async () => { surfaceDefault = ''; try { await invoke('reset_surface_default'); } catch(e) { console.error(e); } }}><svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 4 1 10 7 10"></polyline><path d="M3.51 15a9 9 0 1 0 .49-4.5"></path></svg></button>
              </div>
            </div>

            <div class="setting-group">
              <span class="setting-label">Right Sidebar Background <span class="setting-hint">--WDS-surface-emphasized</span></span>
              <div class="color-picker-wrapper">
                <input type="color" class="color-input" bind:value={surfaceEmphasized} oninput={applySurfaceEmphasized} />
                <span class="color-value">{surfaceEmphasized}</span>
              
                <button type="button" class="btn-color-reset" title="Reset to default" onclick={async () => { surfaceEmphasized = ''; try { await invoke('reset_surface_emphasized'); } catch(e) { console.error(e); } }}><svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 4 1 10 7 10"></polyline><path d="M3.51 15a9 9 0 1 0 .49-4.5"></path></svg></button>
              </div>
            </div>

            <div class="setting-group">
              <span class="setting-label">Active / Highlight State <span class="setting-hint">--WDS-surface-highlight</span></span>
              <div class="color-picker-wrapper">
                <input type="color" class="color-input" bind:value={surfaceHighlight} oninput={applySurfaceHighlight} />
                <span class="color-value">{surfaceHighlight}</span>
              
                <button type="button" class="btn-color-reset" title="Reset to default" onclick={async () => { surfaceHighlight = ''; try { await invoke('reset_surface_highlight'); } catch(e) { console.error(e); } }}><svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 4 1 10 7 10"></polyline><path d="M3.51 15a9 9 0 1 0 .49-4.5"></path></svg></button>
              </div>
            </div>

            <div class="setting-group">
              <span class="setting-label">Right Sidebar Active Row <span class="setting-hint">--WDS-components-active-list-row</span></span>
              <div class="color-picker-wrapper">
                <input type="color" class="color-input" bind:value={componentsActiveListRow} oninput={applyComponentsActiveListRow} />
                <span class="color-value">{componentsActiveListRow}</span>
              
                <button type="button" class="btn-color-reset" title="Reset to default" onclick={async () => { componentsActiveListRow = ''; try { await invoke('reset_components_active_list_row'); } catch(e) { console.error(e); } }}><svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 4 1 10 7 10"></polyline><path d="M3.51 15a9 9 0 1 0 .49-4.5"></path></svg></button>
              </div>
            </div>

            <!-- ── Bubbles ── -->
            <div class="settings-section-title">Chat Bubbles</div>

            <div class="setting-group">
              <span class="setting-label">Incoming Bubble Background <span class="setting-hint">--WDS-systems-bubble-surface-incoming</span></span>
              <div class="color-picker-wrapper">
                <input type="color" class="color-input" bind:value={bubbleSurfaceIncoming} oninput={applyBubbleSurfaceIncoming} />
                <span class="color-value">{bubbleSurfaceIncoming}</span>
              
                <button type="button" class="btn-color-reset" title="Reset to default" onclick={async () => { bubbleSurfaceIncoming = ''; try { await invoke('reset_bubble_surface_incoming'); } catch(e) { console.error(e); } }}><svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 4 1 10 7 10"></polyline><path d="M3.51 15a9 9 0 1 0 .49-4.5"></path></svg></button>
              </div>
            </div>

            <div class="setting-group">
              <span class="setting-label">Outgoing Bubble Background <span class="setting-hint">--WDS-systems-bubble-surface-outgoing</span></span>
              <div class="color-picker-wrapper">
                <input type="color" class="color-input" bind:value={bubbleSurfaceOutgoing} oninput={applyBubbleSurfaceOutgoing} />
                <span class="color-value">{bubbleSurfaceOutgoing}</span>
              
                <button type="button" class="btn-color-reset" title="Reset to default" onclick={async () => { bubbleSurfaceOutgoing = ''; try { await invoke('reset_bubble_surface_outgoing'); } catch(e) { console.error(e); } }}><svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 4 1 10 7 10"></polyline><path d="M3.51 15a9 9 0 1 0 .49-4.5"></path></svg></button>
              </div>
            </div>

            <div class="setting-group">
              <span class="setting-label">Bubble Text Color <span class="setting-hint">--message-primary</span></span>
              <div class="color-picker-wrapper">
                <input type="color" class="color-input" bind:value={messagePrimary} oninput={applyMessagePrimary} />
                <span class="color-value">{messagePrimary}</span>
              
                <button type="button" class="btn-color-reset" title="Reset to default" onclick={async () => { messagePrimary = ''; try { await invoke('reset_message_primary'); } catch(e) { console.error(e); } }}><svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 4 1 10 7 10"></polyline><path d="M3.51 15a9 9 0 1 0 .49-4.5"></path></svg></button>
              </div>
            </div>

            <div class="setting-group">
              <span class="setting-label">Read Checkmark Color <span class="setting-hint">--WDS-content-read</span></span>
              <div class="color-picker-wrapper">
                <input type="color" class="color-input" bind:value={contentRead} oninput={applyContentRead} />
                <span class="color-value">{contentRead}</span>
              
                <button type="button" class="btn-color-reset" title="Reset to default" onclick={async () => { contentRead = ''; try { await invoke('reset_content_read'); } catch(e) { console.error(e); } }}><svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 4 1 10 7 10"></polyline><path d="M3.51 15a9 9 0 1 0 .49-4.5"></path></svg></button>
              </div>
            </div>

            <!-- ── Text ── -->
            <div class="settings-section-title">Text</div>

            <div class="setting-group">
              <span class="setting-label">Chat Title Text <span class="setting-hint">--WDS-content-default</span></span>
              <div class="color-picker-wrapper">
                <input type="color" class="color-input" bind:value={contentDefault} oninput={applyContentDefault} />
                <span class="color-value">{contentDefault}</span>
              
                <button type="button" class="btn-color-reset" title="Reset to default" onclick={async () => { contentDefault = ''; try { await invoke('reset_content_default'); } catch(e) { console.error(e); } }}><svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 4 1 10 7 10"></polyline><path d="M3.51 15a9 9 0 1 0 .49-4.5"></path></svg></button>
              </div>
            </div>

            <div class="setting-group">
              <span class="setting-label">Sidebar Secondary Text <span class="setting-hint">--WDS-content-deemphasized</span></span>
              <div class="color-picker-wrapper">
                <input type="color" class="color-input" bind:value={contentDeemphasized} oninput={applyContentDeemphasized} />
                <span class="color-value">{contentDeemphasized}</span>
              
                <button type="button" class="btn-color-reset" title="Reset to default" onclick={async () => { contentDeemphasized = ''; try { await invoke('reset_content_deemphasized'); } catch(e) { console.error(e); } }}><svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 4 1 10 7 10"></polyline><path d="M3.51 15a9 9 0 1 0 .49-4.5"></path></svg></button>
              </div>
            </div>

            <!-- ── Badges ── -->
            <div class="settings-section-title">Badges</div>

            <div class="setting-group">
              <span class="setting-label">Unread Count Badge <span class="setting-hint">--WDS-persistent-always-branded</span></span>
              <div class="color-picker-wrapper">
                <input type="color" class="color-input" bind:value={persistentAlwaysBranded} oninput={applyPersistentAlwaysBranded} />
                <span class="color-value">{persistentAlwaysBranded}</span>
              
                <button type="button" class="btn-color-reset" title="Reset to default" onclick={async () => { persistentAlwaysBranded = ''; try { await invoke('reset_persistent_always_branded'); } catch(e) { console.error(e); } }}><svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 4 1 10 7 10"></polyline><path d="M3.51 15a9 9 0 1 0 .49-4.5"></path></svg></button>
              </div>
            </div>

            <div class="setting-group">
              <span class="setting-label">Unread Count Text <span class="setting-hint">--WDS-content-on-accent</span></span>
              <div class="color-picker-wrapper">
                <input type="color" class="color-input" bind:value={contentOnAccent} oninput={applyContentOnAccent} />
                <span class="color-value">{contentOnAccent}</span>
              
                <button type="button" class="btn-color-reset" title="Reset to default" onclick={async () => { contentOnAccent = ''; try { await invoke('reset_content_on_accent'); } catch(e) { console.error(e); } }}><svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 4 1 10 7 10"></polyline><path d="M3.51 15a9 9 0 1 0 .49-4.5"></path></svg></button>
              </div>
            </div>

            <!-- ── Chat Background ── -->
            <div class="settings-section-title">Chat Background</div>

            <div class="setting-group">
              <span class="setting-label">Message Composer Input <span class="setting-hint">--WDS-systems-chat-surface-composer</span></span>
              <div class="color-picker-wrapper">
                <input type="color" class="color-input" bind:value={chatSurfaceComposer} oninput={applyChatSurfaceComposer} />
                <span class="color-value">{chatSurfaceComposer}</span>
              
                <button type="button" class="btn-color-reset" title="Reset to default" onclick={async () => { chatSurfaceComposer = ''; try { await invoke('reset_chat_surface_composer'); } catch(e) { console.error(e); } }}><svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 4 1 10 7 10"></polyline><path d="M3.51 15a9 9 0 1 0 .49-4.5"></path></svg></button>
              </div>
            </div>

            <div class="setting-group">
              <span class="setting-label">Chat Background Color <span class="setting-hint">--WDS-systems-chat-background-wallpaper</span></span>
              <div class="color-picker-wrapper">
                <input type="color" class="color-input" bind:value={chatBackgroundWallpaper} oninput={applyChatBackgroundWallpaper} />
                <span class="color-value">{chatBackgroundWallpaper}</span>
              
                <button type="button" class="btn-color-reset" title="Reset to default" onclick={async () => { chatBackgroundWallpaper = ''; try { await invoke('reset_chat_background_wallpaper'); } catch(e) { console.error(e); } }}><svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 4 1 10 7 10"></polyline><path d="M3.51 15a9 9 0 1 0 .49-4.5"></path></svg></button>
              </div>
            </div>

            <!-- ── Fixes ── -->
            <div class="settings-section-title">Fixes</div>

            <div class="setting-group">
              <span class="setting-label">Search Container Gap <span class="setting-hint">chat-list-search-container</span></span>
              <div class="segment-control">
                <button
                  class="segment-btn {searchContainerFix === 'as-is' ? 'active' : ''}"
                  onclick={() => (searchContainerFix = "as-is")}
                >As-is</button>
                <button
                  class="segment-btn {searchContainerFix === 'fixed' ? 'active' : ''}"
                  onclick={() => (searchContainerFix = "fixed")}
                >Fixed</button>
              </div>
            </div>

            <!-- ── Wallpaper ── -->
            <div class="settings-section-title">Wallpaper</div>

            <div class="setting-group">
              <span class="setting-label">Chat Wallpaper</span>

              <form onsubmit={changeWallpaper} class="wallpaper-form">
                <input
                  type="text"
                  class="input-field"
                  placeholder="Paste image URL…"
                  bind:value={urlValue}
                />

                <div class="file-browse-row">
                  <button
                    type="button"
                    class="btn-outline"
                    onclick={selectLocalFile}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      ><path
                        d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"
                      /><polyline points="17 8 12 3 7 8" /><line
                        x1="12"
                        y1="3"
                        x2="12"
                        y2="15"
                      /></svg
                    >
                    Local File
                  </button>
                  {#if localFile}
                    <span class="file-name" title={localFile}
                      >{localFile.split(/[/\\]/).pop()}</span
                    >
                  {/if}
                </div>

                <button
                  type="button"
                  class="toggle-row"
                  onclick={() => (compressImage = !compressImage)}
                  style="background: none; border: none; width: 100%; padding: 0;"
                >
                  <span class="toggle-label">Compress Image</span>
                  <div class="switch {compressImage ? 'active' : ''}">
                    <div class="switch-thumb"></div>
                  </div>
                </button>

                {#if !compressImage}
                  <div class="warning-box">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      ><path
                        d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
                      /><line x1="12" y1="9" x2="12" y2="13" /><line
                        x1="12"
                        y1="17"
                        x2="12.01"
                        y2="17"
                      /></svg
                    >
                    Turning off compression may cause lag.
                  </div>
                {/if}

                <div class="action-row">
                  <button type="submit" class="btn-primary w-full"
                    >Apply Wallpaper</button
                  >
                  <button
                    type="button"
                    class="btn-danger-text w-full"
                    onclick={resetWallpaper}>Reset Wallpaper to Default</button
                  >
                </div>
              </form>
            </div>

            {#if wallpaperStatus}
              <p class="status-msg">{wallpaperStatus}</p>
            {/if}
          </div>
        {/if}
      </section>
    </nav>

    <div class="sidebar-footer">
      <div class="footer-avatar">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          ><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle
            cx="12"
            cy="7"
            r="4"
          ></circle></svg
        >
      </div>
      <div class="footer-text">
        <p class="footer-title">Wrap It App Client</p>
        <p class="footer-sub">v1.0.0-beta</p>
      </div>
    </div>

    <div class="resizer" onmousedown={startResize}></div>
  </aside>

  <main class="main-content"></main>
</div>

<style>
  /* ── Open Source Modern Theme: Zinc / Neutral ── */
  @import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap");

  :root {
    --bg-main: #09090b;
    --bg-sidebar: #18181b;
    --bg-surface: #27272a;
    --bg-hover: #3f3f46;

    --text-primary: #fafafa;
    --text-secondary: #a1a1aa;
    --text-muted: #71717a;

    --accent: #10b981; /* Default to WhatsApp Green */
    --accent-hover: #059669;
    --danger: #ef4444;

    --border: #27272a;
    --border-hover: #3f3f46;

    font-family: "Inter", sans-serif;
    font-size: 13px;
    color: var(--text-primary);
    user-select: none;
    -webkit-user-select: none;
  }

  :global(body) {
    margin: 0;
    padding: 0;
    overflow: hidden;
    background-color: var(--bg-main);
  }

  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  .layout {
    display: flex;
    height: 100vh;
    width: 100vw;
  }

  .main-content {
    flex: 1;
    background-color: var(--bg-main);
  }

  /* ── Sidebar Base ── */
  .sidebar {
    position: relative;
    height: 100vh;
    background-color: var(--bg-sidebar);
    display: flex;
    flex-direction: column;
    border-right: 1px solid var(--border);
    transition: width 0.1s ease;
  }

  /* ── Header ── */
  .sidebar-header {
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    border-bottom: 1px solid var(--border);
  }

  .app-identity {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .app-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    background: var(--bg-surface);
    border: 1px solid var(--border);
    border-radius: 6px;
    color: var(--text-primary);
    flex-shrink: 0;
  }

  .app-name {
    font-weight: 600;
    font-size: 14px;
    white-space: nowrap;
  }

  .search-bar {
    display: flex;
    align-items: center;
    gap: 8px;
    background: var(--bg-surface);
    border: 1px solid transparent;
    padding: 6px 10px;
    border-radius: 6px;
    color: var(--text-muted);
    font-size: 12px;
    transition: all 0.2s;
    cursor: pointer;
  }

  .search-bar:hover {
    border-color: var(--border-hover);
    color: var(--text-secondary);
  }

  .search-icon {
    flex-shrink: 0;
  }
  .search-placeholder {
    white-space: nowrap;
  }

  .search-kbd {
    margin-left: auto;
    font-size: 10px;
    font-family: "JetBrains Mono", monospace;
    background: var(--bg-hover);
    padding: 2px 4px;
    border-radius: 4px;
  }

  /* ── Navigation & Sections ── */
  .sidebar-nav {
    flex: 1;
    overflow-y: auto;
    padding: 16px 12px;
    scrollbar-width: thin;
    scrollbar-color: var(--border) transparent;
  }

  .section-label {
    font-size: 11px;
    font-weight: 600;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: 8px;
    display: block;
    padding-left: 8px;
    white-space: nowrap;
  }

  /* ── Dropdown Buttons ── */
  .nav-btn {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    background: transparent;
    border: none;
    padding: 8px;
    border-radius: 6px;
    color: var(--text-secondary);
    font-family: inherit;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition:
      background 0.15s,
      color 0.15s;
  }

  .nav-btn .btn-content {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .nav-btn:hover {
    background: var(--bg-surface);
    color: var(--text-primary);
  }

  .nav-btn.active {
    color: var(--text-primary);
  }

  .chevron-icon {
    transition: transform 0.2s;
    flex-shrink: 0;
  }
  .chevron-icon.open {
    transform: rotate(180deg);
  }

  /* ── Dropdown Menu Details ── */
  .dropdown-menu {
    background: var(--bg-surface);
    border: 1px solid var(--border);
    border-radius: 8px;
    margin-top: 4px;
    padding: 12px;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .setting-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .setting-label {
    font-size: 11px;
    font-weight: 500;
    color: var(--text-secondary);
  }

  /* Controls */
  .color-picker {
    display: flex;
    gap: 8px;
  }

  .color-swatch {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    border: 2px solid var(--bg-surface);
    cursor: pointer;
    transition:
      transform 0.1s,
      border-color 0.1s;
    padding: 0;
  }
  .color-swatch:hover {
    transform: scale(1.1);
  }
  .color-swatch:focus {
    border-color: var(--text-primary);
    outline: none;
  }

  .segment-control {
    display: flex;
    background: var(--bg-main);
    border-radius: 6px;
    padding: 2px;
  }

  .segment-btn {
    flex: 1;
    background: transparent;
    border: none;
    color: var(--text-muted);
    padding: 6px;
    font-size: 12px;
    border-radius: 4px;
    cursor: pointer;
  }
  .segment-btn.active {
    background: var(--bg-surface);
    color: var(--text-primary);
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  }

  .wallpaper-form {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .input-field {
    background: var(--bg-main);
    border: 1px solid var(--border);
    padding: 8px;
    border-radius: 6px;
    color: var(--text-primary);
    font-size: 12px;
    width: 100%;
    outline: none;
    font-family: inherit;
  }
  .input-field:focus {
    border-color: var(--accent);
  }

  .file-browse-row {
    display: flex;
    align-items: center;
    gap: 8px;
    overflow: hidden;
  }
  .file-name {
    font-size: 11px;
    font-family: "JetBrains Mono", monospace;
    color: var(--accent);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  /* Toggle Switch */
  .toggle-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: pointer;
    font-family: inherit;
  }
  .toggle-label {
    font-size: 12px;
    color: var(--text-secondary);
  }
  .switch {
    width: 32px;
    height: 18px;
    background: var(--bg-main);
    border-radius: 10px;
    position: relative;
    transition: background 0.2s;
    border: 1px solid var(--border);
  }
  .switch.active {
    background: var(--accent);
    border-color: var(--accent);
  }
  .switch-thumb {
    width: 12px;
    height: 12px;
    background: var(--text-primary);
    border-radius: 50%;
    position: absolute;
    top: 2px;
    left: 2px;
    transition: transform 0.2s;
  }
  .switch.active .switch-thumb {
    transform: translateX(14px);
    background: #000;
  }

  .warning-box {
    background: rgba(239, 68, 68, 0.1);
    border: 1px solid rgba(239, 68, 68, 0.2);
    color: #fca5a5;
    padding: 6px 8px;
    border-radius: 6px;
    font-size: 11px;
    display: flex;
    gap: 6px;
    align-items: center;
    margin-top: 4px;
  }

  .status-msg {
    font-size: 11px;
    font-family: "JetBrains Mono", monospace;
    color: var(--accent);
    margin: 0;
    text-align: center;
  }

  /* Action Buttons */
  .action-row {
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin-top: 4px;
  }

  .btn-outline,
  .btn-primary,
  .btn-danger-text {
    border: none;
    border-radius: 6px;
    padding: 8px;
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    font-family: inherit;
  }
  .w-full {
    width: 100%;
  }

  .btn-outline {
    background: var(--bg-main);
    border: 1px solid var(--border);
    color: var(--text-primary);
  }
  .btn-outline:hover {
    background: var(--bg-hover);
  }

  .btn-primary {
    background: var(--text-primary);
    color: var(--bg-main);
  }
  .btn-primary:hover {
    background: #e4e4e7;
  }

  .btn-danger-text {
    background: transparent;
    color: var(--danger);
  }
  .btn-danger-text:hover {
    background: rgba(239, 68, 68, 0.1);
  }

  /* ── Footer ── */
  .sidebar-footer {
    padding: 16px;
    border-top: 1px solid var(--border);
    display: flex;
    align-items: center;
    gap: 12px;
    overflow: hidden;
  }

  .footer-avatar {
    width: 32px;
    height: 32px;
    background: var(--bg-surface);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-secondary);
    flex-shrink: 0;
  }

  .footer-text {
    display: flex;
    flex-direction: column;
  }
  .footer-title {
    margin: 0;
    font-size: 13px;
    font-weight: 500;
    white-space: nowrap;
  }
  .footer-sub {
    margin: 0;
    font-size: 11px;
    color: var(--text-muted);
    white-space: nowrap;
  }

  /* ── Resizer ── */
  .resizer {
    width: 6px;
    height: 100%;
    position: absolute;
    right: -3px;
    top: 0;
    cursor: col-resize;
    z-index: 20;
  }
  .resizer:hover {
    background: rgba(255, 255, 255, 0.05);
  }

  /* ── Collapsed State ── */
  .sidebar.collapsed .app-name,
  .sidebar.collapsed .search-placeholder,
  .sidebar.collapsed .search-kbd,
  .sidebar.collapsed .section-label,
  .sidebar.collapsed .nav-text,
  .sidebar.collapsed .chevron-icon,
  .sidebar.collapsed .footer-text,
  .sidebar.collapsed .dropdown-menu {
    display: none;
  }

  .sidebar.collapsed .sidebar-header {
    padding: 16px 8px;
  }

  .sidebar.collapsed .app-identity {
    justify-content: center;
  }

  .sidebar.collapsed .search-bar {
    justify-content: center;
    padding: 8px;
    border-radius: 8px;
  }

  .sidebar.collapsed .nav-btn {
    justify-content: center;
    padding: 10px;
  }

  .sidebar.collapsed .btn-content {
    justify-content: center;
  }

  .sidebar.collapsed .sidebar-footer {
    justify-content: center;
    padding: 16px 0;
  }

  /* ── Settings section titles ── */
  .settings-section-title {
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--text-muted);
    padding: 4px 0 2px;
    border-bottom: 1px solid var(--border);
    margin-bottom: -4px;
  }

  .setting-hint {
    font-family: "JetBrains Mono", monospace;
    font-size: 9px;
    color: var(--text-muted);
    font-weight: 400;
    opacity: 0.7;
  }

  .color-picker-wrapper {
    display: flex;
    align-items: center;
    gap: 10px;
    background: var(--bg-main);
    border: 1px solid var(--border);
    padding: 6px 8px;
    border-radius: 6px;
  }

  .btn-color-reset {
    margin-left: auto;
    background: none;
    border: none;
    padding: 2px;
    cursor: pointer;
    color: var(--text-muted);
    display: flex;
    align-items: center;
    border-radius: 3px;
    opacity: 0.5;
    transition: opacity 0.15s, color 0.15s;
    flex-shrink: 0;
  }
  .btn-color-reset:hover {
    opacity: 1;
    color: var(--danger);
  }

  .color-input {
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
    width: 24px;
    height: 24px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    padding: 0;
    background: transparent;
  }

  .color-input::-webkit-color-swatch-wrapper {
    padding: 0;
  }

  .color-input::-webkit-color-swatch {
    border: 1px solid var(--border);
    border-radius: 4px;
  }

  .color-value {
    font-family: "JetBrains Mono", monospace;
    font-size: 12px;
    color: var(--text-secondary);
    text-transform: uppercase;
  }
</style>