import type { LinkItem, Note } from "./types";

const NOTE_KEY = "quick_notes_list";
const LINK_KEY = "scribly_links_v1";

export function getNotes(): Promise<Note[]> {
  return new Promise<Note[]>((resolve) => {
    chrome.storage.sync.get({ [NOTE_KEY]: [] }, (result) => {
      const val = result[NOTE_KEY] as unknown;
      resolve(Array.isArray(val) ? (val as Note[]) : []);
    });
  });
}

export function setNotes(v: Note[]): Promise<void> {
  return new Promise<void>((resolve) => {
    chrome.storage.sync.set({ [NOTE_KEY]: v }, () => resolve());
  });
}

export function getLinks(): Promise<LinkItem[]> {
  return new Promise<LinkItem[]>((resolve) => {
    chrome.storage.sync.get({ [LINK_KEY]: [] }, (result) => {
      const val = result[LINK_KEY] as unknown;
      resolve(Array.isArray(val) ? (val as LinkItem[]) : []);
    });
  });
}

export function setLinks(v: LinkItem[]): Promise<void> {
  return new Promise<void>((resolve) => {
    chrome.storage.sync.set({ [LINK_KEY]: v }, () => resolve());
  });
}