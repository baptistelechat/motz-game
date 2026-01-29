import { BloomFilter } from "bloom-filters";

const DB_NAME = "motz-game-themes-db";
const STORE_NAME = "themes-store";
const DB_VERSION = 1;

export class ThemeManager {
  private static instance: ThemeManager;
  private filters: Map<string, BloomFilter> = new Map();
  private loadingPromises: Map<string, Promise<void>> = new Map();

  private constructor() {}

  public static getInstance(): ThemeManager {
    if (!ThemeManager.instance) {
      ThemeManager.instance = new ThemeManager();
    }
    return ThemeManager.instance;
  }

  public async loadTheme(slug: string): Promise<void> {
    if (this.filters.has(slug)) return;
    if (this.loadingPromises.has(slug)) return this.loadingPromises.get(slug);

    const promise = this.loadThemeLogic(slug)
      .then((filter) => {
        if (filter) {
          this.filters.set(slug, filter);
        }
        this.loadingPromises.delete(slug);
      })
      .catch((err) => {
        this.loadingPromises.delete(slug);
        throw err;
      });

    this.loadingPromises.set(slug, promise);
    return promise;
  }

  private async loadThemeLogic(slug: string): Promise<BloomFilter | null> {
    // 1. Try IDB
    try {
      const db = await this.openDB();
      const cached = await this.getFromDB(db, slug);
      if (cached) {
        console.log(`[ThemeManager] Loaded ${slug} from IDB`);
        return BloomFilter.fromJSON(cached);
      }
    } catch (e) {
      console.warn(`[ThemeManager] IDB failed for ${slug}`, e);
    }

    // 2. Fetch Network
    try {
      console.log(`[ThemeManager] Fetching ${slug} from network...`);
      const res = await fetch(`/assets/themes/${slug}.json`);
      if (!res.ok) {
        if (res.status === 404) return null;
        throw new Error(`Failed to fetch theme ${slug}`);
      }
      const json = await res.json();

      // 3. Cache in IDB
      try {
        const db = await this.openDB();
        await this.putToDB(db, slug, json);
      } catch (e) {
        console.warn(`[ThemeManager] Failed to cache ${slug}`, e);
      }

      return BloomFilter.fromJSON(json);
    } catch (e) {
      console.error(`Error loading theme ${slug}`, e);
      return null;
    }
  }

  public getFilter(slug: string): BloomFilter | undefined {
    return this.filters.get(slug);
  }

  // IDB Helpers
  private openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      if (typeof window === "undefined" || !window.indexedDB) {
        return reject(new Error("IndexedDB not available"));
      }
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private getFromDB(db: IDBDatabase, key: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(key);
      req.onerror = () => reject(req.error);
      req.onsuccess = () => resolve(req.result);
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private putToDB(db: IDBDatabase, key: string, val: any): Promise<void> {
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(val, key);
      req.onerror = () => reject(req.error);
      req.onsuccess = () => resolve();
    });
  }
}
