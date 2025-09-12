import { type Dispatch, type SetStateAction, useEffect, useState } from "react";

const openDB = async (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open("persistentStateDB", 1);
    request.onupgradeneeded = () => {
      request.result.createObjectStore("state");
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

const getFromDB = async <T>(key: string): Promise<T | null> => {
  const db = await openDB();
  return new Promise<T | null>((resolve, reject) => {
    const tx = db.transaction("state", "readonly");
    const store = tx.objectStore("state");
    const req = store.get(key);
    req.onsuccess = () => resolve(req.result ?? null);
    req.onerror = () => reject(req.error);
  });
};

const setToDB = async <T>(key: string, value: T): Promise<void> => {
  const db = await openDB();
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction("state", "readwrite");
    const store = tx.objectStore("state");
    const req = store.put(value, key);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
};

/**
 * Hook equivalent to useState but keeps the value in IndexedDB (async)
 * resetValue function is provided to reset the value to the default value
 *
 * Security remark: The value can be accessed by any user of the browser
 *
 * @param defaultValue Used if no value is stored in IndexedDB
 * @param stateKey Unique key identifying the value in IndexedDB
 */
export const usePersistentState = <T>(
  defaultValue: T,
  stateKey: string
): [T, Dispatch<SetStateAction<T>>, () => void] => {
  const [value, setValue] = useState<T>(defaultValue);

  useEffect(() => {
    (async () => {
      const storedValue = await getFromDB<T>(stateKey);
      if (storedValue !== null) setValue(storedValue);
    })();
    // Only run on mount
  }, [stateKey]);

  useEffect(() => {
    (async () => {
      await setToDB(stateKey, value);
    })();
  }, [value, stateKey]);

  const resetValue = (): void => {
    setValue(defaultValue);
  };

  return [value, setValue, resetValue];
};
