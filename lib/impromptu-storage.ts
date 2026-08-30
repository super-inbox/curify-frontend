// lib/impromptu-storage.ts
//
// Local persistence for /tools/impromptu-speech-practice.
//
// The tool uploads nothing, so "keep my work" can only mean the user's own
// browser. Two different stores, because the two things being kept are not
// alike:
//
//   * the drawn topic — a short string, localStorage, no privacy weight
//   * the recorded take — a video of the user's face, which needs IndexedDB
//     (localStorage cannot hold a Blob) and needs to be said out loud on the
//     page, because silently writing webcam footage to someone's disk is not
//     a thing to do quietly. The page copy states it and offers a delete.
//
// Every function here swallows its own failures. IndexedDB is unavailable in
// some private-browsing modes and can refuse a write on quota; none of that is
// a reason to break a recording that is already sitting playable in memory.

const DB_NAME = "curify-impromptu";
const DB_VERSION = 1;
const STORE = "takes";
const TAKE_KEY = "latest";
const TOPIC_KEY = "curify.impromptu.topic";
const MIC_KEY = "curify.impromptu.micId";

// Webcam video of a person should not linger indefinitely because they once
// tried a practice tool. Anything older than this is dropped on read.
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

export type StoredTake = {
  blob: Blob;
  topicId: string | null;
  mimeType: string;
  noSound: boolean;
  createdAt: number;
};

function openDb(): Promise<IDBDatabase | null> {
  return new Promise((resolve) => {
    try {
      if (typeof indexedDB === "undefined") return resolve(null);
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = () => {
        if (!req.result.objectStoreNames.contains(STORE)) {
          req.result.createObjectStore(STORE);
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(null);
      req.onblocked = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

/** Returns false if the take could not be persisted — the caller should say so
 *  rather than let the user believe a reload is safe. */
export async function saveTake(take: StoredTake): Promise<boolean> {
  const db = await openDb();
  if (!db) return false;
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE, "readwrite");
      tx.objectStore(STORE).put(take, TAKE_KEY);
      tx.oncomplete = () => { db.close(); resolve(true); };
      // Most likely a quota refusal on a long take.
      tx.onerror = () => { db.close(); resolve(false); };
      tx.onabort = () => { db.close(); resolve(false); };
    } catch {
      db.close();
      resolve(false);
    }
  });
}

export async function loadTake(): Promise<StoredTake | null> {
  const db = await openDb();
  if (!db) return null;
  const take = await new Promise<StoredTake | null>((resolve) => {
    try {
      const req = db.transaction(STORE, "readonly").objectStore(STORE).get(TAKE_KEY);
      req.onsuccess = () => resolve((req.result as StoredTake) ?? null);
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
  db.close();
  if (!take?.blob) return null;
  if (Date.now() - (take.createdAt ?? 0) > MAX_AGE_MS) {
    void clearTake();
    return null;
  }
  return take;
}

export async function clearTake(): Promise<void> {
  const db = await openDb();
  if (!db) return;
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE, "readwrite");
      tx.objectStore(STORE).delete(TAKE_KEY);
      tx.oncomplete = () => { db.close(); resolve(); };
      tx.onerror = () => { db.close(); resolve(); };
    } catch {
      db.close();
      resolve();
    }
  });
}

export function saveTopicId(id: string | null) {
  try {
    if (id) localStorage.setItem(TOPIC_KEY, id);
    else localStorage.removeItem(TOPIC_KEY);
  } catch {
    // Storage disabled — the tool works fine without it.
  }
}

export function loadTopicId(): string | null {
  try {
    return localStorage.getItem(TOPIC_KEY);
  } catch {
    return null;
  }
}

/**
 * Chosen microphone. Worth persisting because the browser's default is often
 * wrong in a way the user cannot see: a conferencing app installs a virtual
 * loopback device ("Microsoft Teams Audio Device", "ZoomAudioDevice",
 * BlackHole) which wins the default slot and carries no microphone audio at
 * all. Having picked a real input once, nobody should have to do it again.
 */
export function saveMicId(id: string | null) {
  try {
    if (id) localStorage.setItem(MIC_KEY, id);
    else localStorage.removeItem(MIC_KEY);
  } catch {
    // Storage disabled — the picker still works, it just will not be remembered.
  }
}

export function loadMicId(): string | null {
  try {
    return localStorage.getItem(MIC_KEY);
  } catch {
    return null;
  }
}
