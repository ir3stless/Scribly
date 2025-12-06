
<p align="center">
  <img src="./public/scribly-logo.png" alt="Scribly mascot" width="96" height="96">
</p>

<h1 align="center">Scribly</h1>

<p align="center">
  <em>Instant notes. Zero friction.</em>
</p>

<p align="center">
  <a href="https://github.com/ir3stless/Scribly/actions">
    <img src="https://img.shields.io/badge/build-passing-brightgreen" alt="build status">
  </a>
  <img src="https://img.shields.io/badge/extension-Manifest%20V3-4F46E5" alt="Manifest V3">
  <img src="https://img.shields.io/badge/docs-only-blue" alt="docs only">
  <img src="https://img.shields.io/badge/status-WIP-FFC107" alt="status WIP">
</p>

---

Scribly is a tiny notes scratchpad that lives in your browser toolbar (Brave/Chrome/Edge).  
It’s fast, minimal, and private — your notes are stored in the browser using `chrome.storage`.

- 📝 Quick capture in a popup
- 🔄 Sync across devices with `chrome.storage.sync` (or keep local with `chrome.storage.local`)
- ⚡ Zero backend, zero tracking
- 🎯 Built with **Vite + TypeScript**, Manifest V3

---

## ✨ Demo

> Click the extension icon → type a note → **Ctrl/Cmd + Enter** to add.  
> Notes list supports delete, and “Clear all” wipes everything.

---

## 📦 Install (Build Locally)

```bash
git clone https://github.com/ir3stless/Scribly.git
cd Scribly
npm install
npm run build
```

**Load into Brave/Chrome**

1. Open `brave://extensions` (or `chrome://extensions`)
2. Enable **Developer mode**
3. Click **Load unpacked** → select the `dist/` folder

---

## 🗂️ Project structure

```
Scribly/
  public/
    manifest.json
    scribly-logo.png
    icon16.png
    icon48.png
    icon128.png
  src/
    main.ts
    style.css
  index.html
  package.json
  vite.config.ts
  tsconfig*.json
  .gitignore
  README.md
  LICENSE
```

---

## 🔧 Development

```bash
npm run dev
```

- Edit `src/main.ts` and `src/style.css`
- Static assets in `public/` are copied to `dist/` on build
- Popup HTML is `index.html` (Vite entry: `/src/main.ts`)

---

## 🔐 Storage & Privacy

- Default build uses **`chrome.storage.sync`** so your notes can sync with Brave/Chrome profiles.
- If you prefer local-only, switch the two helper calls in `src/main.ts`:
  ```ts
  chrome.storage.local.get(...);
  chrome.storage.local.set(...);
  ```

No analytics. No network calls. No backend.

---

## 🧪 Verify the Build (optional)

If you enabled GitHub Actions, we attach `scribly-dist.zip` + a SHA256 file on each push.

- macOS/Linux:
  ```bash
  shasum -a 256 scribly-dist.zip
  ```
- Windows PowerShell:
  ```powershell
  Get-FileHash .\scribly-dist.zip -Algorithm SHA256
  ```

Compare to `SHA256SUMS.txt` in the build artifacts.

---

## ⚙️ Permissions

```json
{
  "permissions": ["storage"],
  "action": { "default_popup": "index.html" }
}
```

No host permissions. No content scripts.

---

## ⌨️ Shortcuts

- **Ctrl/Cmd + Enter**: Add note from the textarea

---

## 🗺️ Roadmap

- [ ] Search/filter notes
- [ ] Pin/star notes (pinned float to top)
- [ ] Export/import JSON
- [ ] Optional tags

---

## 📝 License

**Source-available for audit. Not open-source.**  
See `LICENSE` for details. In short: you may view/clone this repo for code review and security auditing.  
Use, modification, redistribution, or commercial exploitation is not permitted without prior written consent.

---

## ❤️ Thanks for using Scribly! (:

PS: maybe you could click the star?~
