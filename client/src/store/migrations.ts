import type { AppState } from '@/types';

export const CURRENT_VERSION = 1;

type Migration = (state: any) => any;

const migrations: Record<number, Migration> = {
  1: (state: any) => {
    // Initial version - no migration needed
    return state;
  },
  // Add future migrations here:
  // 2: (state: any) => { ... },
};

export function migrateState(state: any): AppState {
  const version = state.version || 0;

  if (version === CURRENT_VERSION) {
    return state as AppState;
  }

  let migratedState = { ...state };

  // Apply migrations sequentially
  for (let v = version + 1; v <= CURRENT_VERSION; v++) {
    const migration = migrations[v];
    if (migration) {
      console.log(`Migrating state from version ${v - 1} to ${v}`);
      migratedState = migration(migratedState);
      migratedState.version = v;
    }
  }

  return migratedState as AppState;
}
