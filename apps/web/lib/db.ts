import Dexie, { Table } from 'dexie';

export interface PendingOrder {
  id?: number;
  location_id: string;
  type: 'dine_in' | 'takeaway' | 'delivery';
  items: any[];
  total: number;
  created_at: number;
  synced: boolean;
}

export interface MenuCache {
  id: string;
  restaurant_id: string;
  data: any;
  updated_at: number;
}

export class HeadlessRestoDB extends Dexie {
  pending_orders!: Table<PendingOrder>;
  menu_cache!: Table<MenuCache>;

  constructor() {
    super('HeadlessRestoDB');
    this.version(1).stores({
      pending_orders: '++id, location_id, synced',
      menu_cache: 'id, restaurant_id'
    });
  }
}

export const db = new HeadlessRestoDB();
