import { getDatabase } from "./sqlite";
import * as Network from "expo-network";
import { getTRPCClient } from "./trpc";

// Define supported mutation types - expandable as needed
export type MutationType = 
  | "dailyEntries.create"
  | "stepEntries.upsert"
  | "cravingEvents.create"
  | "actionPlans.create"
  | "routines.create";

interface QueueItem {
  id: string;
  type: MutationType;
  payload: any;
  created_at: string;
  retry_count: number;
}

/**
 * Add a mutation to the offline queue
 */
export async function addToQueue(type: MutationType, payload: any) {
  const db = getDatabase();
  const id = Math.random().toString(36).substring(2) + Date.now().toString(36);
  
  await db.runAsync(
    "INSERT INTO mutation_queue (id, type, payload) VALUES (?, ?, ?)",
    [id, type, JSON.stringify(payload)]
  );
  
  console.log(`[Offline] Added ${type} to queue`);
  return id;
}

/**
 * Get all queued items
 */
export async function getQueue(): Promise<QueueItem[]> {
  const db = getDatabase();
  const rows = await db.getAllAsync<any>("SELECT * FROM mutation_queue ORDER BY created_at ASC");
  
  return rows.map(row => ({
    ...row,
    payload: JSON.parse(row.payload)
  }));
}

/**
 * Remove item from queue
 */
export async function removeFromQueue(id: string) {
  const db = getDatabase();
  await db.runAsync("DELETE FROM mutation_queue WHERE id = ?", [id]);
}

/**
 * Process the offline queue
 * Replays mutations against the API
 */
export async function processQueue() {
  const networkState = await Network.getNetworkStateAsync();
  if (!networkState.isConnected || !networkState.isInternetReachable) {
    console.log("[Sync] Still offline, skipping processing");
    return;
  }

  const queue = await getQueue();
  if (queue.length === 0) return;

  console.log(`[Sync] Processing ${queue.length} offline items...`);
  const client = getTRPCClient();

  for (const item of queue) {
    try {
      console.log(`[Sync] Replaying ${item.type}...`);
      
      // Map string type to procedure call
      const parts = item.type.split('.');
      // @ts-ignore - Dynamic traversal
      let procedure = client;
      for (const part of parts) {
        // @ts-ignore
        procedure = procedure[part];
      }
      
      // Execute mutation
      // @ts-ignore
      await procedure.mutate(item.payload);
      
      // If successful, remove from queue
      await removeFromQueue(item.id);
      console.log(`[Sync] Successfully synced ${item.id}`);
      
    } catch (error) {
      console.error(`[Sync] Failed to process item ${item.id}:`, error);
      // Future: Implement retry count logic or move to dead letter queue
    }
  }
}

