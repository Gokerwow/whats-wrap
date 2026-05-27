# Wrap It App

Wrap It App is a desktop wrapper for WhatsApp Web built with Tauri and Svelte. It provides extended customization options for the user interface, including custom color themes, chat bubble adjustments, and background modifications, while maintaining a low resource footprint compared to standard web clients.

## Features

- **UI Customization:** Override default interface colors including backgrounds, accent colors, and sidebars.
- **Chat Bubbles:** Modify incoming and outgoing message bubbles, text colors, and read-receipt indicators.
- **Custom Backgrounds:** Set the chat wallpaper using an image URL or a local file (includes an image compression toggle).
- **Layout Adjustments:** Apply CSS fixes to adjust specific UI elements, such as the search container layout.
- **Lightweight:** Utilizes Tauri's Rust-based backend for reduced memory usage.

## Tech Stack

- **Frontend:** Svelte 5, TypeScript, Vite
- **Backend:** Tauri v2 (Rust)
- **Package Manager:** Bun

## Getting Started

### Prerequisites

Ensure you have the following installed on your system:
- [Bun](https://bun.sh/)
- [Rust](https://www.rust-lang.org/tools/install)
- OS-specific build tools for Tauri (refer to the [Tauri v2 Prerequisites](https://v2.tauri.app/start/prerequisites/))

### Installation

1. Clone the repository:
 ```bash
 git clone [https://github.com/gokerwow/whats-wrap.git](https://github.com/gokerwow/whats-wrap.git)
 cd whats-wrap
```

2. Install dependencies:
```bash
bun install

```



### Development

Run the development server. This will start the Vite frontend and open the Tauri application window:

```bash
bun tauri dev

```

### Build

To compile the application into a standalone executable for your operating system:

```bash
bun tauri build

```

The compiled binaries will be located in the `src-tauri/target/release` directory.

## Roadmap

* [ ] Global search functionality (Ctrl+K / Cmd+K)
* [ ] Custom notification sounds
* [ ] Theme profile import/export

## Disclaimer

Wrap It App is an unofficial, third-party project built for personal use. It is not affiliated with, authorized, maintained, sponsored, or endorsed by WhatsApp, Meta Platforms, Inc., or any of their affiliates. Users are responsible for complying with WhatsApp's standard terms of service.
