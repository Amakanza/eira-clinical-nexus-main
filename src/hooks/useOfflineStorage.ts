
import { useState, useEffect } from 'react';

interface OfflineStorageConfig {
  dbName: string;
  version: number;
  stores: {
    name: string;
    keyPath: string;
    indexes?: { name: string; keyPath: string; unique?: boolean }[];
  }[];
}

export const useOfflineStorage = (config: OfflineStorageConfig) => {
  const [db, setDb] = useState<IDBDatabase | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncQueue, setSyncQueue] = useState<any[]>([]);

  useEffect(() => {
    const initDB = async () => {
      return new Promise<IDBDatabase>((resolve, reject) => {
        const request = indexedDB.open(config.dbName, config.version);
        
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
        
        request.onupgradeneeded = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          
          config.stores.forEach(store => {
            if (!db.objectStoreNames.contains(store.name)) {
              const objectStore = db.createObjectStore(store.name, { keyPath: store.keyPath });
              
              store.indexes?.forEach(index => {
                objectStore.createIndex(index.name, index.keyPath, { unique: index.unique });
              });
            }
          });
        };
      });
    };

    initDB().then(setDb).catch(console.error);

    // Online/offline event listeners
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [config]);

  const saveToStore = async (storeName: string, data: any) => {
    if (!db) return null;
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(data);
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  };

  const getFromStore = async (storeName: string, key: any) => {
    if (!db) return null;
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(key);
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  };

  const getAllFromStore = async (storeName: string) => {
    if (!db) return [];
    
    return new Promise<any[]>((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  };

  const deleteFromStore = async (storeName: string, key: any) => {
    if (!db) return;
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(key);
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  };

  const addToSyncQueue = (action: any) => {
    setSyncQueue(prev => [...prev, { ...action, timestamp: Date.now() }]);
  };

  const processSyncQueue = async () => {
    if (!isOnline || syncQueue.length === 0) return;
    
    console.log('Processing sync queue:', syncQueue);
    // Here you would implement the actual sync logic with your backend API
    
    // For now, just clear the queue
    setSyncQueue([]);
  };

  useEffect(() => {
    if (isOnline) {
      processSyncQueue();
    }
  }, [isOnline]);

  return {
    db,
    isOnline,
    syncQueue,
    saveToStore,
    getFromStore,
    getAllFromStore,
    deleteFromStore,
    addToSyncQueue
  };
};
