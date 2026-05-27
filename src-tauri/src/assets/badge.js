window.addEventListener('DOMContentLoaded', () => {
    const titleNode = document.querySelector('title');

    if (titleNode) {
        const observer = new MutationObserver(() => {
            const titleText = document.title;
            const match = titleText.match(/^\((\d+)\)/);
            const unreadCount = match ? parseInt(match[1], 10) : 0;

            console.log(`Unread count updated: ${unreadCount}`);

            if (window.__TAURI_INTERNALS__) {
                // Tauri strictly expects the payload to be a stringified JSON value!
                window.__TAURI_INTERNALS__.invoke('plugin:event|emit', {
                    event: 'badge-update',
                    payload: JSON.stringify(unreadCount) 
                })
                .then(() => console.log("🔥 Event successfully fired to Rust!"))
                .catch(err => console.error("Event failed:", err));
            }
        });

        observer.observe(titleNode, {
            characterData: true,
            childList: true,
            subtree: true
        });
    }
});