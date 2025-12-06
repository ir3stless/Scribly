import "./style.css";

const STORAGE_KEY = "quick_notes_list";

type Note = {
  id: number;
  text: string;
  createdAt: string; // ISO string
};

// Grab elements
const noteInput = document.getElementById("note-input") as
  | HTMLTextAreaElement
  | null;
const addNoteBtn = document.getElementById("add-note-btn") as
  | HTMLButtonElement
  | null;
const clearAllBtn = document.getElementById("clear-all-btn") as
  | HTMLButtonElement
  | null;
const notesList = document.getElementById("notes-list") as HTMLUListElement | null;

// Basic sanity check
if (!noteInput || !addNoteBtn || !clearAllBtn || !notesList) {
  throw new Error("Quick Notes: DOM elements not found. Check index.html IDs.");
}

/**
 * Wrap chrome.storage.sync.get in a Promise for async/await.
 */
function getNotes(): Promise<Note[]> {
  return new Promise((resolve) => {
    chrome.storage.sync.get(STORAGE_KEY, (result) => {
      const notes = (result[STORAGE_KEY] as Note[] | undefined) ?? [];
      resolve(notes);
    });
  });
}

/**
 * Wrap chrome.storage.sync.set in a Promise.
 */
function saveNotes(notes: Note[]): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.sync.set({ [STORAGE_KEY]: notes }, () => {
      resolve();
    });
  });
}

/**
 * Format an ISO date string into a short, human-friendly string.
 */
function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString();
}

function renderEmpty() {
  const container = document.querySelector(".list") as HTMLElement;
  const prev = container.querySelector(".empty");
  if (prev) prev.remove();

  const empty = document.createElement("div");
  empty.className = "empty";
  empty.innerHTML = `
    <img class="empty-logo" src="/scribly-logo.png" alt="Scribly" width="36" height="36" />
    <div class="empty-title">No notes yet</div>
    <div class="empty-sub">Start by writing something above.</div>
  `;
  container.appendChild(empty);
}

/**
 * Render notes into the list element.
 */
function renderNotes(notes: Note[]): void {
  notesList!.innerHTML = "";

  // remove any previous empty state if we do have notes
  const listContainer = document.querySelector(".list") as HTMLElement;
  const prevEmpty = listContainer.querySelector(".empty");
  if (prevEmpty) prevEmpty.remove();

  if (notes.length === 0) {
    const li = document.createElement("li");
    li.textContent = "No notes yet.";
    li.style.fontSize = "12px";
    li.style.color = "#888";
    notesList!.appendChild(li);
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
      renderNotes(filtered);
    });

    li.appendChild(textDiv);
    li.appendChild(metaDiv);
    li.appendChild(deleteBtn);
    notesList!.appendChild(li);
  }
}

/**
 * Initialize: load notes on popup open.
 */
async function init() {
  const notes = await getNotes();
  renderNotes(notes);
}

init().catch((err) => {
  console.error("Quick Notes init error:", err);
});

// Add note on button click
addNoteBtn.addEventListener("click", async () => {
  const text = noteInput!.value.trim();
  if (!text) return;

  const current = await getNotes();

  const newNote: Note = {
    id: Date.now(),
    text,
    createdAt: new Date().toISOString()
  };

  const updated = [newNote, ...current]; // newest at top
  await saveNotes(updated);

  noteInput!.value = "";
  renderNotes(updated);
});

// Ctrl+Enter (or Cmd+Enter) to add from textarea
noteInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
    event.preventDefault();
    addNoteBtn.click();
  }
});

// Clear all notes
clearAllBtn.addEventListener("click", async () => {
  const confirmed = window.confirm("Clear all notes?");
  if (!confirmed) return;

  await saveNotes([]);
  renderNotes([]);
});