
import { useState, useEffect } from 'react';

const DB_NAME = 'DigitalDwellingDB';
const DB_VERSION = 3;
const STORE_NAME = 'kv';

const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event: any) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = (event: any) => resolve(event.target.result);
    request.onerror = (event: any) => reject(event.target.error);
  });
};

/**
 * A custom hook that works like useLocalStorage but uses IndexedDB 
 * to handle much larger data quotas (hundreds of MBs) for base64 images.
 */
export function useStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void, boolean] {
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [isReady, setIsReady] = useState(false);

  // Initialize from IndexedDB
  useEffect(() => {
    let isMounted = true;

    openDB().then(db => {
      if (!isMounted) return;
      try {
        const transaction = db.transaction(STORE_NAME, 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const getRequest = store.get(key);

        getRequest.onsuccess = () => {
          if (isMounted) {
            if (getRequest.result !== undefined) {
              setStoredValue(getRequest.result);
            }
            setIsReady(true);
          }
        };

        getRequest.onerror = () => {
          if (isMounted) setIsReady(true);
        };
      } catch (err) {
        console.error("IndexedDB read error:", err);
        if (isMounted) setIsReady(true);
      }
    }).catch(err => {
      console.error("Failed to open IndexedDB:", err);
      if (isMounted) setIsReady(true);
    });

    return () => {
      isMounted = false;
    };
  }, [key]);

  // Save to IndexedDB whenever storedValue changes
  useEffect(() => {
    if (!isReady) return;

    openDB().then(db => {
      try {
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        store.put(storedValue, key);
      } catch (err) {
        console.error("Failed to save to IndexedDB (DataCloneError or NotFoundError possible):", err);
      }
    }).catch(err => {
      console.error("Failed to open IndexedDB for saving:", err);
    });
  }, [key, storedValue, isReady]);

  return [storedValue, setStoredValue, isReady];
}
