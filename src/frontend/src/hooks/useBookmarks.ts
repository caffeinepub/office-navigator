import { useCallback, useState } from "react";

export interface Bookmark {
  id: string;
  source: string;
  insight: string;
  timestamp: number;
}

const STORAGE_KEY = "wc_bookmarks";

function load(): Bookmark[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function save(items: Bookmark[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(load);

  const addBookmark = useCallback((source: string, insight: string) => {
    const next: Bookmark = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      source,
      insight,
      timestamp: Date.now(),
    };
    setBookmarks((prev) => {
      const updated = [next, ...prev];
      save(updated);
      return updated;
    });
  }, []);

  const removeBookmark = useCallback((id: string) => {
    setBookmarks((prev) => {
      const updated = prev.filter((b) => b.id !== id);
      save(updated);
      return updated;
    });
  }, []);

  const isBookmarked = useCallback(
    (source: string, insight: string) =>
      bookmarks.some((b) => b.source === source && b.insight === insight),
    [bookmarks],
  );

  const toggleBookmark = useCallback(
    (source: string, insight: string) => {
      const existing = bookmarks.find(
        (b) => b.source === source && b.insight === insight,
      );
      if (existing) {
        setBookmarks((prev) => {
          const updated = prev.filter((b) => b.id !== existing.id);
          save(updated);
          return updated;
        });
      } else {
        const next: Bookmark = {
          id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
          source,
          insight,
          timestamp: Date.now(),
        };
        setBookmarks((prev) => {
          const updated = [next, ...prev];
          save(updated);
          return updated;
        });
      }
    },
    [bookmarks],
  );

  return {
    bookmarks,
    addBookmark,
    removeBookmark,
    isBookmarked,
    toggleBookmark,
  };
}
