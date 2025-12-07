const NOTE_KEY = "quick_notes_list";
const LINK_KEY = "scribly_links_v1";
export function getNotes() {
    return new Promise((resolve) => {
        chrome.storage.sync.get({ [NOTE_KEY]: [] }, (result) => {
            const val = result[NOTE_KEY];
            resolve(Array.isArray(val) ? val : []);
        });
    });
}
export function setNotes(v) {
    return new Promise((resolve) => {
        chrome.storage.sync.set({ [NOTE_KEY]: v }, () => resolve());
    });
}
export function getLinks() {
    return new Promise((resolve) => {
        chrome.storage.sync.get({ [LINK_KEY]: [] }, (result) => {
            const val = result[LINK_KEY];
            resolve(Array.isArray(val) ? val : []);
        });
    });
}
export function setLinks(v) {
    return new Promise((resolve) => {
        chrome.storage.sync.set({ [LINK_KEY]: v }, () => resolve());
    });
}
