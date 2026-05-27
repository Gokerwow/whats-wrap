<script lang="ts">
  import { onMount } from "svelte";
  import { invoke } from "@tauri-apps/api/core";
  import { open } from "@tauri-apps/plugin-dialog";
  import type { FormEventHandler } from "svelte/elements";

  let saveTimer: ReturnType<typeof setTimeout>;
  let sidebarWidth = $state(260);
  let wallpaperStatus = $state("");
  let isDragging = $state(false);

  let activeSection = $state<string>("");

  let urlValue = $state("");
  let localFile = $state("");
  let compressImage = $state(true);

  // Color States
  let accentColor = $state("");
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

  function toggleSection(section: string) {
    activeSection = activeSection === section ? "" : section;
  }

  async function changeWallpaper(event: Event) {
    event.preventDefault();
    wallpaperStatus = "Changing...";
    try {
      if (localFile) {
        await invoke("set_chat_wallpaper_local", {
          filePath: localFile,
          compressImage: compressImage,
          saveToConfig: true,
        });
      } else if (urlValue) {
        await invoke("set_chat_wallpaper", {
          wallpaperUrl: urlValue,
          compressImage: compressImage,
          saveToConfig: true,
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

  async function selectLocalFile() {
    const selectedPath = await open({
      filters: [{ name: "Image", extensions: ["png", "jpeg", "jpg"] }],
    });
    if (selectedPath) {
      localFile = selectedPath;
    }
  }

  // Color Handlers
  function createColorHandler(
    setter: (val: string) => void,
    invokeCmd: string,
  ): FormEventHandler<HTMLInputElement> {
    return async (event) => {
      const currentColor = event.currentTarget.value;
      setter(currentColor);
      try {
        await invoke(invokeCmd, { color: currentColor, saveToConfig: false });
      } catch (e) {
        console.error(e);
      }

      clearTimeout(saveTimer);
      saveTimer = setTimeout(async () => {
        try {
          await invoke(invokeCmd, { color: currentColor, saveToConfig: true });
        } catch (e) {
          console.error(e);
        }
      }, 500);
    };
  }

  const applyAccentColor = createColorHandler(
    (v) => (accentColor = v),
    "set_accent_color",
  );
  const applyContentDeemphasized = createColorHandler(
    (v) => (contentDeemphasized = v),
    "set_content_deemphasized",
  );
  const applyBubbleSurfaceIncoming = createColorHandler(
    (v) => (bubbleSurfaceIncoming = v),
    "set_bubble_surface_incoming",
  );
  const applyBubbleSurfaceOutgoing = createColorHandler(
    (v) => (bubbleSurfaceOutgoing = v),
    "set_bubble_surface_outgoing",
  );
  const applyChatSurfaceComposer = createColorHandler(
    (v) => (chatSurfaceComposer = v),
    "set_chat_surface_composer",
  );
  const applySurfaceHighlight = createColorHandler(
    (v) => (surfaceHighlight = v),
    "set_surface_highlight",
  );
  const applySurfaceDefault = createColorHandler(
    (v) => (surfaceDefault = v),
    "set_surface_default",
  );
  const applyPersistentAlwaysBranded = createColorHandler(
    (v) => (persistentAlwaysBranded = v),
    "set_persistent_always_branded",
  );
  const applyContentDefault = createColorHandler(
    (v) => (contentDefault = v),
    "set_content_default",
  );
  const applySurfaceEmphasized = createColorHandler(
    (v) => (surfaceEmphasized = v),
    "set_surface_emphasized",
  );
  const applyMessagePrimary = createColorHandler(
    (v) => (messagePrimary = v),
    "set_message_primary",
  );
  const applyContentRead = createColorHandler(
    (v) => (contentRead = v),
    "set_content_read",
  );
  const applyContentOnAccent = createColorHandler(
    (v) => (contentOnAccent = v),
    "set_content_on_accent",
  );
  const applyComponentsActiveListRow = createColorHandler(
    (v) => (componentsActiveListRow = v),
    "set_components_active_list_row",
  );
  const applyBackgroundDefault = createColorHandler(
    (v) => (backgroundDefault = v),
    "set_background_default",
  );
  const applyChatBackgroundWallpaper = createColorHandler(
    (v) => (chatBackgroundWallpaper = v),
    "set_chat_background_wallpaper",
  );

  // Defaults & Resets

  const DEFAULTS = {
    accentColor: "",
    contentDeemphasized: "",
    bubbleSurfaceIncoming: "",
    bubbleSurfaceOutgoing: "",
    chatSurfaceComposer: "",
    surfaceHighlight: "",
    surfaceDefault: "",
    persistentAlwaysBranded: "",
    contentDefault: "",
    surfaceEmphasized: "",
    messagePrimary: "",
    contentRead: "",
    contentOnAccent: "",
    componentsActiveListRow: "",
    backgroundDefault: "",
    chatBackgroundWallpaper: "",
  } as const;

  async function resetAllColors() {
    accentColor = DEFAULTS.accentColor;
    contentDeemphasized = DEFAULTS.contentDeemphasized;
    bubbleSurfaceIncoming = DEFAULTS.bubbleSurfaceIncoming;
    bubbleSurfaceOutgoing = DEFAULTS.bubbleSurfaceOutgoing;
    chatSurfaceComposer = DEFAULTS.chatSurfaceComposer;
    surfaceHighlight = DEFAULTS.surfaceHighlight;
    surfaceDefault = DEFAULTS.surfaceDefault;
    persistentAlwaysBranded = DEFAULTS.persistentAlwaysBranded;
    contentDefault = DEFAULTS.contentDefault;
    surfaceEmphasized = DEFAULTS.surfaceEmphasized;
    messagePrimary = DEFAULTS.messagePrimary;
    contentRead = DEFAULTS.contentRead;
    contentOnAccent = DEFAULTS.contentOnAccent;
    componentsActiveListRow = DEFAULTS.componentsActiveListRow;
    backgroundDefault = DEFAULTS.backgroundDefault;
    chatBackgroundWallpaper = DEFAULTS.chatBackgroundWallpaper;
    try {
      await invoke("reset_all_colors");
    } catch (e) {
      console.error(e);
    }
  }

  async function resetEverything() {
    await resetAllColors();
    urlValue = "";
    localFile = "";
    try {
      await invoke("reset_everything");
    } catch (e) {
      console.error(e);
    }
  }

  onMount(async () => {
    try {
      const config = await invoke<any>("get_config_for_frontend");
      accentColor = config.main_color ?? "";
      contentDeemphasized = config.content_deemphasized ?? "";
      bubbleSurfaceIncoming = config.bubble_surface_incoming ?? "";
      bubbleSurfaceOutgoing = config.bubble_surface_outgoing ?? "";
      chatSurfaceComposer = config.chat_surface_composer ?? "";
      surfaceHighlight = config.surface_highlight ?? "";
      surfaceDefault = config.surface_default ?? "";
      persistentAlwaysBranded = config.persistent_always_branded ?? "";
      contentDefault = config.content_default ?? "";
      surfaceEmphasized = config.surface_emphasized ?? "";
      messagePrimary = config.message_primary ?? "";
      contentRead = config.content_read ?? "";
      contentOnAccent = config.content_on_accent ?? "";
      componentsActiveListRow = config.components_active_list_row ?? "";
      backgroundDefault = config.background_default ?? "";
      chatBackgroundWallpaper = config.chat_background_wallpaper ?? "";
      searchContainerFix = (config.search_container_fix ?? "as-is") as
        | "as-is"
        | "fixed";
    } catch (e) {
      console.error("Failed to load color config:", e);
    }
  });
</script>

{#snippet colorSetting(
  label: string,
  hint: string,
  colorValue: string,
  applyFn: FormEventHandler<HTMLInputElement>,
  resetCmd: string,
  setter: (val: string) => void,
)}
  <div class="setting-group">
    <span class="setting-label"
      >{label} <span class="setting-hint">{hint}</span></span
    >
    <div class="color-picker-wrapper">
      <input
        type="color"
        class="color-input"
        value={colorValue}
        oninput={applyFn}
      />
      <span class="color-value">{colorValue || "Default"}</span>
      <button
        type="button"
        class="btn-color-reset"
        title="Reset to default"
        onclick={async () => {
          setter("");
          try {
            await invoke(resetCmd);
          } catch (e) {
            console.error(e);
          }
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="11"
          height="11"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
          stroke-linecap="round"
          stroke-linejoin="round"
          ><polyline points="1 4 1 10 7 10"></polyline><path
            d="M3.51 15a9 9 0 1 0 .49-4.5"
          ></path></svg
        >
      </button>
    </div>
  </div>
{/snippet}

<div class="layout">
  <aside
    class="sidebar {sidebarWidth < 140 ? 'collapsed' : ''}"
    style="width: {sidebarWidth}px;"
  >
    <div class="sidebar-header">
      <div class="app-identity">
        <button
          class="app-icon-btn"
          type="button"
          title="Wrap It App"
          onclick={async () => {
            sidebarWidth = sidebarWidth > 140 ? 70 : 260;
            await invoke("resize_sidebar", { newWidth: sidebarWidth });
          }}
        >
          <img
            src="/favicon.png"
            width="20"
            height="20"
            alt="icon"
            class="app-icon-img"
          />
        </button>
        <span class="app-name">Wrap It App</span>
      </div>
      <div class="search-bar disabled-search">
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
        <span class="search-placeholder">Search… (Coming Soon)</span>
        <span class="search-kbd">⌘K</span>
      </div>
    </div>

    <nav class="sidebar-nav">
      <section class="nav-section">
        <span class="section-label">WhatsApp Tweaks</span>

        <button
          class="nav-btn accordion-toggle {activeSection === 'presets'
            ? 'active'
            : ''}"
          onclick={() => toggleSection("presets")}
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
              ><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"
              ></path><path d="M3 3v5h5"></path></svg
            >
            <span class="nav-text">Presets & Resets</span>
          </div>
          <svg
            class="chevron-icon {activeSection === 'presets' ? 'open' : ''}"
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
        {#if activeSection === "presets"}
          <div class="accordion-content">
            <button
              type="button"
              class="btn-danger-text w-full"
              onclick={resetEverything}
            >
              Reset Everything to Default
            </button>
            <button
              type="button"
              class="btn-danger-text w-full"
              onclick={resetAllColors}
            >
              Reset All Colors to Default
            </button>
          </div>
        {/if}

        <button
          class="nav-btn accordion-toggle {activeSection === 'globalColors'
            ? 'active'
            : ''}"
          onclick={() => toggleSection("globalColors")}
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
              ><circle cx="12" cy="12" r="10"></circle><path
                d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"
              ></path><path d="M2 12h20"></path></svg
            >
            <span class="nav-text">Global Colors</span>
          </div>
          <svg
            class="chevron-icon {activeSection === 'globalColors'
              ? 'open'
              : ''}"
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
        {#if activeSection === "globalColors"}
          <div class="accordion-content">
            {@render colorSetting(
              "Accent Color",
              "--WDS-accent",
              accentColor,
              applyAccentColor,
              "reset_main_color",
              (v) => (accentColor = v),
            )}
            {@render colorSetting(
              "Chat List Background",
              "--background-default",
              backgroundDefault,
              applyBackgroundDefault,
              "reset_background_default",
              (v) => (backgroundDefault = v),
            )}
            {@render colorSetting(
              "Headers & Chat List Bars",
              "--WDS-surface-default",
              surfaceDefault,
              applySurfaceDefault,
              "reset_surface_default",
              (v) => (surfaceDefault = v),
            )}
            {@render colorSetting(
              "Right Sidebar Background",
              "--WDS-surface-emphasized",
              surfaceEmphasized,
              applySurfaceEmphasized,
              "reset_surface_emphasized",
              (v) => (surfaceEmphasized = v),
            )}
            {@render colorSetting(
              "Active / Highlight State",
              "--WDS-surface-highlight",
              surfaceHighlight,
              applySurfaceHighlight,
              "reset_surface_highlight",
              (v) => (surfaceHighlight = v),
            )}
            {@render colorSetting(
              "Right Sidebar Active Row",
              "--WDS-components-active-list-row",
              componentsActiveListRow,
              applyComponentsActiveListRow,
              "reset_components_active_list_row",
              (v) => (componentsActiveListRow = v),
            )}
          </div>
        {/if}

        <button
          class="nav-btn accordion-toggle {activeSection === 'chatBubbles'
            ? 'active'
            : ''}"
          onclick={() => toggleSection("chatBubbles")}
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
              ><path
                d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
              ></path></svg
            >
            <span class="nav-text">Chat Bubbles</span>
          </div>
          <svg
            class="chevron-icon {activeSection === 'chatBubbles' ? 'open' : ''}"
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
        {#if activeSection === "chatBubbles"}
          <div class="accordion-content">
            {@render colorSetting(
              "Incoming Bubble",
              "--WDS-systems-bubble-surface-incoming",
              bubbleSurfaceIncoming,
              applyBubbleSurfaceIncoming,
              "reset_bubble_surface_incoming",
              (v) => (bubbleSurfaceIncoming = v),
            )}
            {@render colorSetting(
              "Outgoing Bubble",
              "--WDS-systems-bubble-surface-outgoing",
              bubbleSurfaceOutgoing,
              applyBubbleSurfaceOutgoing,
              "reset_bubble_surface_outgoing",
              (v) => (bubbleSurfaceOutgoing = v),
            )}
            {@render colorSetting(
              "Bubble Text Color",
              "--message-primary",
              messagePrimary,
              applyMessagePrimary,
              "reset_message_primary",
              (v) => (messagePrimary = v),
            )}
            {@render colorSetting(
              "Read Checkmark",
              "--WDS-content-read",
              contentRead,
              applyContentRead,
              "reset_content_read",
              (v) => (contentRead = v),
            )}
          </div>
        {/if}

        <button
          class="nav-btn accordion-toggle {activeSection === 'textBadges'
            ? 'active'
            : ''}"
          onclick={() => toggleSection("textBadges")}
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
              ><path d="M4 7V4h16v3"></path><path d="M9 20h6"></path><path
                d="M12 4v16"
              ></path></svg
            >
            <span class="nav-text">Text & Badges</span>
          </div>
          <svg
            class="chevron-icon {activeSection === 'textBadges' ? 'open' : ''}"
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
        {#if activeSection === "textBadges"}
          <div class="accordion-content">
            {@render colorSetting(
              "Chat Title Text",
              "--WDS-content-default",
              contentDefault,
              applyContentDefault,
              "reset_content_default",
              (v) => (contentDefault = v),
            )}
            {@render colorSetting(
              "Sidebar Secondary Text",
              "--WDS-content-deemphasized",
              contentDeemphasized,
              applyContentDeemphasized,
              "reset_content_deemphasized",
              (v) => (contentDeemphasized = v),
            )}
            {@render colorSetting(
              "Unread Count Badge",
              "--WDS-persistent-always-branded",
              persistentAlwaysBranded,
              applyPersistentAlwaysBranded,
              "reset_persistent_always_branded",
              (v) => (persistentAlwaysBranded = v),
            )}
            {@render colorSetting(
              "Unread Count Text",
              "--WDS-content-on-accent",
              contentOnAccent,
              applyContentOnAccent,
              "reset_content_on_accent",
              (v) => (contentOnAccent = v),
            )}
          </div>
        {/if}

        <button
          class="nav-btn accordion-toggle {activeSection === 'wallpaper'
            ? 'active'
            : ''}"
          onclick={() => toggleSection("wallpaper")}
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
              ><rect x="3" y="3" width="18" height="18" rx="2" ry="2"
              ></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline
                points="21 15 16 10 5 21"
              ></polyline></svg
            >
            <span class="nav-text">Background & Wallpaper</span>
          </div>
          <svg
            class="chevron-icon {activeSection === 'wallpaper' ? 'open' : ''}"
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
        {#if activeSection === "wallpaper"}
          <div class="accordion-content">
            {@render colorSetting(
              "Message Composer Input",
              "--WDS-systems-chat-surface-composer",
              chatSurfaceComposer,
              applyChatSurfaceComposer,
              "reset_chat_surface_composer",
              (v) => (chatSurfaceComposer = v),
            )}
            {@render colorSetting(
              "Chat Background Color",
              "--WDS-systems-chat-background-wallpaper",
              chatBackgroundWallpaper,
              applyChatBackgroundWallpaper,
              "reset_chat_background_wallpaper",
              (v) => (chatBackgroundWallpaper = v),
            )}

            <div class="setting-group" style="margin-top: 12px;">
              <span class="setting-label">Custom Image Wallpaper</span>
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
              {#if wallpaperStatus}
                <p class="status-msg">{wallpaperStatus}</p>
              {/if}
            </div>
          </div>
        {/if}

        <button
          class="nav-btn accordion-toggle {activeSection === 'fixes'
            ? 'active'
            : ''}"
          onclick={() => toggleSection("fixes")}
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
              ><path
                d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"
              ></path></svg
            >
            <span class="nav-text">Layout Fixes</span>
          </div>
          <svg
            class="chevron-icon {activeSection === 'fixes' ? 'open' : ''}"
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
        {#if activeSection === "fixes"}
          <div class="accordion-content">
            <div class="setting-group">
              <span class="setting-label">Search Container Gap</span>
              <div class="segment-control">
                <button
                  class="segment-btn {searchContainerFix === 'as-is'
                    ? 'active'
                    : ''}"
                  onclick={() => (searchContainerFix = "as-is")}>As-is</button
                >
                <button
                  class="segment-btn {searchContainerFix === 'fixed'
                    ? 'active'
                    : ''}"
                  onclick={() => (searchContainerFix = "fixed")}>Fixed</button
                >
              </div>
            </div>
          </div>
        {/if}
      </section>
    </nav>

    <div class="sidebar-footer">
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
  /* Keep all your original base CSS styles here ... */
  @import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap");

  :root {
    --bg-main: #09090b;
    --bg-sidebar: #18181b;
    --bg-surface: #27272a;
    --bg-hover: #3f3f46;
    --text-primary: #fafafa;
    --text-secondary: #a1a1aa;
    --text-muted: #71717a;
    --accent: #10b981;
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

  .sidebar {
    position: relative;
    height: 100vh;
    background-color: var(--bg-sidebar);
    display: flex;
    flex-direction: column;
    border-right: 1px solid var(--border);
    transition: width 0.1s ease;
  }

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
  .app-icon-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    background: var(--bg-surface);
    border: 1px solid var(--border);
    border-radius: 8px;
    flex-shrink: 0;
    cursor: pointer;
    padding: 0;
    transition:
      background 0.15s,
      border-color 0.15s,
      transform 0.1s,
      box-shadow 0.15s;
  }
  .app-icon-btn:hover {
    background: var(--bg-hover);
    border-color: var(--border-hover);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
  }
  .app-icon-btn:active {
    transform: scale(0.92);
    background: var(--bg-main);
    box-shadow: none;
  }
  .app-icon-img {
    display: block;
    border-radius: 4px;
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

  .disabled-search {
    opacity: 0.5;
    cursor: not-allowed;
  }
  .disabled-search:hover {
    border-color: transparent;
    color: var(--text-muted);
  }

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
    background: var(--bg-surface);
  }

  .chevron-icon {
    transition: transform 0.2s;
    flex-shrink: 0;
  }
  .chevron-icon.open {
    transform: rotate(180deg);
  }

  /* ── New Accordion Styles ── */
  .accordion-content {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 6px;
    padding: 12px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    margin: 4px 0 8px 0;
    border: 1px solid var(--border);
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
    transition:
      opacity 0.15s,
      color 0.15s;
    flex-shrink: 0;
  }
  .btn-color-reset:hover {
    opacity: 1;
    color: var(--danger);
  }
  .color-input {
    -webkit-appearance: none;
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

  .segment-control {
    display: flex;
    background: var(--bg-main);
    border-radius: 6px;
    padding: 2px;
    border: 1px solid var(--border);
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

  .sidebar-footer {
    padding: 16px;
    border-top: 1px solid var(--border);
    display: flex;
    align-items: center;
    gap: 12px;
    overflow: hidden;
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

  .sidebar.collapsed .app-name,
  .sidebar.collapsed .search-placeholder,
  .sidebar.collapsed .search-kbd,
  .sidebar.collapsed .section-label,
  .sidebar.collapsed .nav-text,
  .sidebar.collapsed .chevron-icon,
  .sidebar.collapsed .footer-text,
  .sidebar.collapsed .accordion-content {
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
</style>
