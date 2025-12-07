export type Note = { id: number; text: string; createdAt: string };

export type LinkItem = {
  id: number;
  url: string;
  title?: string;
  domain: string;
  favorite: boolean;
  createdAt: string;
};