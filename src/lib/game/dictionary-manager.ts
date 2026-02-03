import { BloomFilter } from "bloom-filters";

const DB_NAME = "motz-game-db";
const STORE_NAME = "dictionary-store";
const DB_VERSION = 1;

interface DictionaryMeta {
  version: number;
  errorRate: number;
  size: number;
}

export class DictionaryManager {
  private static instance: DictionaryManager;
  private filter: BloomFilter | null = null;
  private initPromise: Promise<void> | null = null;

  private constructor() {}

  public static getInstance(): DictionaryManager {
    if (!DictionaryManager.instance) {
      DictionaryManager.instance = new DictionaryManager();
    }
    return DictionaryManager.instance;
  }

  // For testing purposes only
  public resetForTests() {
    this.filter = null;
    this.initPromise = null;
  }

  public getFilter(): BloomFilter | null {
    return this.filter;
  }

  public async init(): Promise<void> {
    if (this.filter) return;
    if (this.initPromise) return this.initPromise;

    this.initPromise = this.initializeLogic().catch((err) => {
      this.initPromise = null; // Reset on error to allow retry
      throw err;
    });
    return this.initPromise;
  }

  private async initializeLogic(): Promise<void> {
    try {
      // 1. Open IDB (if available)
      let db: IDBDatabase | null = null;
      try {
        db = await this.openDB();
      } catch (e) {
        console.warn(
          "[Dictionary] IndexedDB unavailable, falling back to network/memory",e
        );
      }

      // 2. Fetch remote meta (fast) to check version
      // We do this first to know if we need to update
      let remoteMeta: DictionaryMeta | null = null;
      try {
        const remoteMetaRes = await fetch(
          "/assets/dictionary/dictionary-meta.json",
        );
        if (remoteMetaRes.ok) {
          remoteMeta = await remoteMetaRes.json();
        }
      } catch (e) {
        console.warn(
          "[Dictionary] Failed to fetch metadata, checking cache fallback...", e
        );
      }

      // 3. Check cached meta
      let cachedMeta: DictionaryMeta | undefined;
      if (db) {
        try {
          cachedMeta = await this.getFromDB<DictionaryMeta>(db, "meta");
        } catch (e) {
          /* ignore */
          console.warn(
            "[Dictionary] Failed to load meta from IDB, falling back to network",e
          );
        }
      }

      // 4. Decide source
      let useCache = false;

      if (cachedMeta) {
        if (remoteMeta) {
          // If we have both, compare versions
          if (cachedMeta.version === remoteMeta.version) {
            useCache = true;
          } else {
            console.log(
              `[Dictionary] New version available (${remoteMeta.version} > ${cachedMeta.version})`,
            );
          }
        } else {
          // If network failed but we have cache, use cache (Offline mode)
          console.log(
            "[Dictionary] Offline or meta unreachable, using cached version",
          );
          useCache = true;
        }
      }

      if (useCache && db) {
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const cachedJson = await this.getFromDB<any>(db, "json");
          if (cachedJson) {
            this.filter = BloomFilter.fromJSON(cachedJson);
            console.log("[Dictionary] Loaded from IndexedDB cache");
            return;
          }
        } catch (e) {
          console.warn(
            "[Dictionary] Failed to load JSON from IDB despite meta match",e
          );
        }
      }

      // 5. Fetch full dictionary (if outdated, missing, or cache load failed)
      console.log("[Dictionary] Fetching full dictionary from network...");
      const dictRes = await fetch("/assets/dictionary/dictionary.json");
      if (!dictRes.ok)
        throw new Error(`Failed to fetch dictionary: ${dictRes.statusText}`);
      const dictJson = await dictRes.json();

      // 6. Save to IDB (Background)
      if (db) {
        this.putToDB(db, "json", dictJson).catch((e) =>
          console.error("[Dictionary] Failed to save JSON to IDB", e),
        );
        if (remoteMeta) {
          this.putToDB(db, "meta", remoteMeta).catch((e) =>
            console.error("[Dictionary] Failed to save Meta to IDB", e),
          );
        }
      }

      // 7. Hydrate
      this.filter = BloomFilter.fromJSON(dictJson);
      console.log("[Dictionary] Loaded from Network and updated cache");
    } catch (error) {
      console.error("[Dictionary] Initialization failed", error);
      throw error;
    }
  }

  // --- IDB Helpers ---

  private openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      if (typeof indexedDB === "undefined") {
        reject(new Error("IndexedDB not supported"));
        return;
      }
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  private getFromDB<T>(db: IDBDatabase, key: string): Promise<T | undefined> {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], "readonly");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(key);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private putToDB(db: IDBDatabase, key: string, value: any): Promise<void> {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(value, key);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
}
