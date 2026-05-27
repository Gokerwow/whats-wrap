// preload.js
(function() {
    console.log("WhatsWrap Core Engine Interceptor Active!");

    const originalWindowOpen = window.open;

    window.open = function(url, target, features) {
        if (url && url.startsWith('http') && !url.includes('web.whatsapp.com')) {
            console.log("Intercepting link via window.open override:", url);

            // Construct the explicit payload structure Tauri's native layer maps to your Rust handler
            const tauriPayload = {
                cmd: "force_open_in_browser", // Matches the Rust fn name
                callback: 0,
                error: 0,
                url: url                      // Matches the Rust 'url: String' parameter name
            };

            if (window.chrome && window.chrome.webview) {
                // Windows (WebView2)
                window.chrome.webview.postMessage(tauriPayload);
            } else if (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.ipc) {
                // macOS / Linux (WebKit)
                window.webkit.messageHandlers.ipc.postMessage(tauriPayload);
            } else {
                console.error("Native platform messaging channel is missing.");
            }

            return { close: () => {}, focus: () => {}, blur: () => {} };
        }

        return originalWindowOpen.call(window, url, target, features);
    };
})();

