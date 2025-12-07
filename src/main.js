import "./style.css";
const STORAGE_KEY = "quick_notes_list";
// Grab elements
const noteInput = document.getElementById("note-input");
const addNoteBtn = document.getElementById("add-note-btn");
const clearAllBtn = document.getElementById("clear-all-btn");
const notesList = document.getElementById("notes-list");
// Basic sanity check (kept)
if (!noteInput || !addNoteBtn || !clearAllBtn || !notesList) {
    throw new Error("Quick Notes: DOM elements not found. Check index.html IDs.");
}
// Wrap chrome.storage.sync.get in a promise for async/await
function getNotes() {
    return new Promise((resolve) => {
        // tiny hardening: provide default [] so result always has STORAGE_KEY
        chrome.storage.sync.get({ [STORAGE_KEY]: [] }, (result) => {
            const notes = result[STORAGE_KEY] ?? [];
            resolve(notes);
        });
    });
}
// Wrap chrome.storage.sync.set in a Promise.
function saveNotes(notes) {
    return new Promise((resolve) => {
        chrome.storage.sync.set({ [STORAGE_KEY]: notes }, () => {
            resolve();
        });
    });
}
function animateOnce(el, cls) {
    el.classList.add(cls);
    const off = () => el.classList.remove(cls);
    el.addEventListener("animationend", off, { once: true });
}
function formatTimestamp(iso) {
    const d = new Date(iso);
    return d.toLocaleString();
}
function renderEmpty() {
    const container = document.querySelector(".list");
    const prev = container.querySelector(".empty");
    if (prev)
        prev.remove();
    const empty = document.createElement("div");
    empty.className = "empty";
    empty.innerHTML = `
    <img class="empty-logo" src="/scribly-logo.png" alt="Scribly" width="36" height="36" />
    <div class="empty-title">No notes yet</div>
    <div class="empty-sub">Start by writing something above.</div>
  `;
    container.appendChild(empty);
}
// Render notes into the list element.
function renderNotes(notes) {
    notesList.innerHTML = "";
    // remove any previous empty state if we do have notes
    const listContainer = document.querySelector(".list");
    const prevEmpty = listContainer.querySelector(".empty");
    if (prevEmpty)
        prevEmpty.remove();
    if (notes.length === 0) {
        const li = document.createElement("li");
        li.textContent = "No notes yet.";
        li.style.fontSize = "12px";
        li.style.color = "#888";
        li.classList.add("fade-up");
        notesList.appendChild(li);
        return;
    }
    for (const note of notes) {
        const li = document.createElement("li");
        li.className = "note-item";
        const textDiv = document.createElement("div");
        textDiv.className = "note-text";
        textDiv.textContent = note.text;
        const metaDiv = document.createElement("div");
        metaDiv.className = "note-meta";
        metaDiv.textContent = formatTimestamp(note.createdAt);
        const deleteBtn = document.createElement("button");
        deleteBtn.className = "note-delete";
        deleteBtn.textContent = "×";
        deleteBtn.title = "Delete note";
        deleteBtn.addEventListener("click", async () => {
            const current = await getNotes();
            const filtered = current.filter((n) => n.id !== note.id);
            await saveNotes(filtered);
            // animate out, then re-render
            li.classList.add("fade-out");
            li.addEventListener("animationend", () => renderNotes(filtered), { once: true });
        });
        li.append(textDiv, metaDiv, deleteBtn);
        notesList.appendChild(li);
        // entrance animation
        animateOnce(li, "pop-in");
    }
}
// Initialize: load notes on popup open.
async function init() {
    const notes = await getNotes();
    renderNotes(notes);
}
init().catch((err) => {
    console.error("Quick Notes init error:", err);
});
// basic... so basic
addNoteBtn.addEventListener("click", async () => {
    const text = noteInput.value.trim();
    if (!text)
        return;
    const current = await getNotes();
    const newNote = {
        id: Date.now(),
        text,
        createdAt: new Date().toISOString(),
    };
    const updated = [newNote, ...current];
    await saveNotes(updated);
    noteInput.value = "";
    renderNotes(updated);
    const listWrap = notesList?.parentElement; // or linksList?.parentElement
    if (listWrap)
        animateOnce(listWrap, "flash-list");
    // uh.. animations!
    const first = notesList?.querySelector(".note-item");
    if (first)
        animateOnce(first, "pop-in-strong");
    if (notesList)
        animateOnce(notesList.parentElement, "flash-list");
});
// Ctrl+Enter (or Cmd+Enter) to add from textarea
noteInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
        event.preventDefault();
        addNoteBtn.click();
    }
});
// Clear all user notes cause we love destruction
clearAllBtn.addEventListener("click", async () => {
    const confirmed = window.confirm("Clear all notes?");
    if (!confirmed)
        return;
    await saveNotes([]);
    renderNotes([]);
    if (notesList)
        animateOnce(notesList, "flash-list");
});
const LINK_KEY = "scribly_links_v1";
function getLinks() {
    return new Promise((resolve) => {
        chrome.storage.sync.get({ [LINK_KEY]: [] }, (r) => {
            const v = r[LINK_KEY];
            resolve(Array.isArray(v) ? v : []);
        });
    });
}
function saveLinks(v) {
    return new Promise((resolve) => chrome.storage.sync.set({ [LINK_KEY]: v }, () => resolve()));
}
const domainFrom = (u) => {
    try {
        return new URL(u).hostname.replace(/^www\./, "");
    }
    catch {
        return "";
    }
};
const faviconFor = (u) => `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domainFrom(u))}&sz=64`;
// Links UI (guarded)
const linkUrl = document.getElementById("link-url");
const linkTitle = document.getElementById("link-title");
const addLinkBtn = document.getElementById("add-link-btn");
const linksList = document.getElementById("links-list");
function renderLinks(items) {
    if (!linksList)
        return;
    linksList.innerHTML = "";
    if (!items.length) {
        const empty = document.createElement("div");
        empty.className = "empty";
        empty.innerHTML = `
      <img class="empty-logo" src="/scribly-logo.png" width="36" height="36" alt="Scribly" />
      <div class="empty-title">No links yet</div>
      <div class="empty-sub">Paste a URL and hit Save.</div>`;
        linksList.appendChild(empty);
        return;
    }
    const sorted = [...items].sort((a, b) => Number(b.favorite) - Number(a.favorite) || b.id - a.id);
    for (const it of sorted) {
        const li = document.createElement("li");
        li.className = "link-item";
        li.innerHTML = `
      <img class="favicon" alt="" src="${faviconFor(it.url)}" />
      <div class="link-main">
        <div class="link-title">
          <a href="${it.url}" target="_blank" rel="noopener noreferrer">${it.title || it.url}</a>
        </div>
        <div class="link-domain">${it.domain}</div>
      </div>
      <div class="link-actions">
        <button class="link-fav" title="Favorite">${it.favorite ? "★" : "☆"}</button>
        <button class="link-del" title="Remove">×</button>
      </div>
    `;
        // Favorite toggle
        const favBtn = li.querySelector(".link-fav");
        if (it.favorite)
            favBtn.classList.add("active");
        favBtn.onclick = async () => {
            const cur = await getLinks();
            const up = cur.map(x => x.id === it.id ? { ...x, favorite: !x.favorite } : x);
            await saveLinks(up);
            renderLinks(up);
            animateOnce(linksList, "flash-list");
        };
        // Delete link
        const delBtn = li.querySelector(".link-del");
        delBtn.onclick = async () => {
            const cur = await getLinks();
            const up = cur.filter(x => x.id !== it.id);
            await saveLinks(up);
            // smooth collapse + re-render
            li.classList.add("fade-out");
            li.addEventListener("animationend", () => renderLinks(up), { once: true });
        };
        linksList.appendChild(li);
        // subtle entrance for each item
        animateOnce(li, "pop-in");
    }
}
(async () => {
    // Only wire Links if those elements exist
    if (linkUrl && addLinkBtn && linksList) {
        renderLinks(await getLinks());
        addLinkBtn.onclick = async () => {
            const first = linksList?.querySelector(".link-item");
            if (first)
                animateOnce(first, "pop-in-strong");
            const url = linkUrl.value.trim();
            const title = linkTitle?.value.trim();
            if (!/^https?:\/\//i.test(url)) {
                alert("Please include http(s)://");
                return;
            }
            const cur = await getLinks();
            const item = {
                id: Date.now(),
                url,
                title: title || undefined,
                domain: domainFrom(url),
                favorite: false,
                createdAt: new Date().toISOString(),
            };
            const updated = [item, ...cur];
            await saveLinks(updated);
            linkUrl.value = "";
            if (linkTitle)
                linkTitle.value = "";
            renderLinks(updated);
            const listWrap = notesList?.parentElement; // or linksList?.parentElement
            if (listWrap)
                animateOnce(listWrap, "flash-list");
        };
        linkUrl.addEventListener("keydown", (e) => {
            if (e.key === "Enter")
                addLinkBtn.click();
        });
    }
})().catch((e) => console.warn("Links init skipped or failed:", e));
// Tabs (guarded)
const tabNotes = document.getElementById("tab-notes");
const tabLinks = document.getElementById("tab-links");
const panelNotes = document.getElementById("panel-notes");
const panelLinks = document.getElementById("panel-links");
function switchTab(which) {
    if (!tabNotes || !tabLinks || !panelNotes || !panelLinks)
        return;
    tabNotes.classList.toggle("active", which === "notes");
    tabLinks.classList.toggle("active", which === "links");
    panelNotes.classList.toggle("active", which === "notes");
    panelLinks.classList.toggle("active", which === "links");
}
tabNotes?.addEventListener("click", () => switchTab("notes"));
tabLinks?.addEventListener("click", () => switchTab("links"));
