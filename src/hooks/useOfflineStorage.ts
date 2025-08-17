// src/hooks/useOfflineStorage.ts
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { mapPatientToDb } from "@/dbMappers/patient";
import { mapNoteToDb } from "@/dbMappers/clinicNote";

interface OfflineStorageConfig {
  dbName: string;
  version: number;
  stores: {
    name: string;
    keyPath: string;
    indexes?: { name: string; keyPath: string; unique?: boolean }[];
  }[];
}

type SyncAction =
  | { type: "CREATE_PATIENT"; data: any }
  | { type: "UPDATE_PATIENT"; data: any }
  | { type: "ARCHIVE_PATIENT"; data: { id: string } }
  | { type: "UNARCHIVE_PATIENT"; data: { id: string } }
  | { type: "CREATE_NOTE"; data: { patientId: string; noteType: string; content: string; noteDate?: string } }
  | { type: "UPDATE_NOTE"; data: { id: string; patientId: string; noteType: string; content: string; noteDate?: string } }
  | { type: "DELETE_NOTE"; data: { id: string } };

export const useOfflineStorage = (config: OfflineStorageConfig) => {
  const [db, setDb] = useState<IDBDatabase | null>(null);
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [syncQueue, setSyncQueue] = useState<Array<SyncAction & { timestamp: number }>>([]);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const initDB = async () => {
      return new Promise<IDBDatabase>((resolve, reject) => {
        const request = indexedDB.open(config.dbName, config.version);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);

        request.onupgradeneeded = (event) => {
          const database = (event.target as IDBOpenDBRequest).result;

          config.stores.forEach((store) => {
            if (!database.objectStoreNames.contains(store.name)) {
              const objectStore = database.createObjectStore(store.name, { keyPath: store.keyPath });

              store.indexes?.forEach((index) => {
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

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [config]);

  const saveToStore = async (storeName: string, data: any) => {
    if (!db) return null;

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], "readwrite");
      const store = transaction.objectStore(storeName);
      const request = store.put(data);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  };

  const getFromStore = async (storeName: string, key: any) => {
    if (!db) return null;

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], "readonly");
      const store = transaction.objectStore(storeName);
      const request = store.get(key);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  };

  const getAllFromStore = async (storeName: string) => {
    if (!db) return [];

    return new Promise<any[]>((resolve, reject) => {
      const transaction = db.transaction([storeName], "readonly");
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  };

  const deleteFromStore = async (storeName: string, key: any) => {
    if (!db) return;

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], "readwrite");
      const store = transaction.objectStore(storeName);
      const request = store.delete(key);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  };

  const addToSyncQueue = (action: SyncAction) => {
    setSyncQueue((prev) => [...prev, { ...action, timestamp: Date.now() }]);
  };

  const processOne = async (action: SyncAction) => {
    switch (action.type) {
      /** -------- Patients -------- */
      case "CREATE_PATIENT": {
        const row = mapPatientToDb(action.data);
        const { error } = await supabase.from("patients").insert(row);
        if (error) throw error;
        return;
      }
      case "UPDATE_PATIENT": {
        const row = mapPatientToDb(action.data);
        const { error } = await supabase.from("patients").update(row).eq("id", action.data.id);
        if (error) throw error;
        return;
      }
      case "ARCHIVE_PATIENT": {
        const { error } = await supabase.from("patients").update({ is_archived: true }).eq("id", action.data.id);
        if (error) throw error;
        return;
      }
      case "UNARCHIVE_PATIENT": {
        const { error } = await supabase.from("patients").update({ is_archived: false }).eq("id", action.data.id);
        if (error) throw error;
        return;
      }

      /** -------- Clinical Notes -------- */
      case "CREATE_NOTE": {
        const row = mapNoteToDb(action.data);
        const { error } = await supabase.from("clinical_notes").insert(row);
        // NOTE: requires authenticated session so default author_id = auth.uid() works
        if (error) throw error;
        return;
      }
      case "UPDATE_NOTE": {
        const row = mapNoteToDb(action.data);
        const { error } = await supabase.from("clinical_notes").update(row).eq("id", action.data.id);
        if (error) throw error;
        return;
      }
      case "DELETE_NOTE": {
        const { error } = await supabase.from("clinical_notes").delete().eq("id", action.data.id);
        if (error) throw error;
        return;
      }

      default:
        console.warn("Unknown sync action:", (action as any).type);
        return;
    }
  };

  const processSyncQueue = async () => {
    if (!isOnline || isSyncing || syncQueue.length === 0) return;

    setIsSyncing(true);
    try {
      // process FIFO
      for (const action of syncQueue) {
        await processOne(action);
      }
      setSyncQueue([]);
      if (syncQueue.length > 0) {
        toast({
          title: "Synced with server",
          description: `Queued ${syncQueue.length} changes were synchronized.`,
        });
      }
    } catch (error: any) {
      console.error("Sync failed:", error);
      toast({
        title: "Sync failed",
        description: error?.message ?? "An error occurred while syncing. Will retry shortly.",
        variant: "destructive",
      });
      // Retry with small backoff
      setTimeout(processSyncQueue, 5000 + Math.floor(Math.random() * 2000));
    } finally {
      setIsSyncing(false);
    }
  };

  // Try to sync whenever we come online or when the queue changes
  useEffect(() => {
    if (isOnline) processSyncQueue();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOnline, syncQueue.length]);

  return {
    db,
    isOnline,
    syncQueue,
    saveToStore,
    getFromStore,
    getAllFromStore,
    deleteFromStore,
    addToSyncQueue,
  };
};
