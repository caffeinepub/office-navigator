import { useCallback, useState } from "react";

export interface JournalEntry {
  id: string;
  title: string;
  body: string;
  timestamp: number;
}

const STORAGE_KEY = "wc_journal";

function load(): JournalEntry[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function save(items: JournalEntry[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function useJournal() {
  const [entries, setEntries] = useState<JournalEntry[]>(load);

  const addEntry = useCallback((title: string, body: string) => {
    const next: JournalEntry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      title,
      body,
      timestamp: Date.now(),
    };
    setEntries((prev) => {
      const updated = [next, ...prev];
      save(updated);
      return updated;
    });
  }, []);

  const deleteEntry = useCallback((id: string) => {
    setEntries((prev) => {
      const updated = prev.filter((e) => e.id !== id);
      save(updated);
      return updated;
    });
  }, []);

  return { entries, addEntry, deleteEntry };
}
