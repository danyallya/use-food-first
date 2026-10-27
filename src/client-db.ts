import Dexie, { type Table } from 'dexie';
import type { FoodItem, FoodItemDraft } from './domain/food-item';

export type OutboxItem = { id: string; payload: unknown; createdAt: number; attempts: number; lastError?: string };
export type FoodItemDraftRecord = FoodItemDraft & { id: 'active'; updatedAt: number };

export class LocalDatabase extends Dexie {
  outbox!: Table<OutboxItem, string>;
  foodItems!: Table<FoodItem, string>;
  drafts!: Table<FoodItemDraftRecord, string>;

  constructor() {
    super('idea-use-food-first');
    this.version(1).stores({ outbox: 'id,createdAt,attempts' });
    this.version(2).stores({
      outbox: 'id,createdAt,attempts',
      foodItems: 'id,status,createdAt,date',
      drafts: 'id,updatedAt',
    });
  }
}

export const localDatabase=new LocalDatabase();
