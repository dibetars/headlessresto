import { ApiClient } from './client';
import type { MenuItem, StockItem } from '@restaurantos/shared';

export class KitchenClient {
  constructor(private api: ApiClient) {}

  getMenuItems(category?: string) {
    const qs = category ? `?category=${encodeURIComponent(category)}` : '';
    return this.api.get<MenuItem[]>(`/kitchen/menu-items${qs}`);
  }

  createMenuItem(data: any) {
    return this.api.post<MenuItem>('/kitchen/menu-items', data);
  }

  updateMenuItem(id: string, data: any) {
    return this.api.patch<MenuItem>(`/kitchen/menu-items/${id}`, data);
  }

  toggleAvailability(id: string) {
    return this.api.patch<MenuItem>(`/kitchen/menu-items/${id}/toggle`);
  }

  deleteMenuItem(id: string) {
    return this.api.delete(`/kitchen/menu-items/${id}`);
  }

  getDailyMenu(date?: string) {
    const qs = date ? `?date=${date}` : '';
    return this.api.get<any>(`/kitchen/daily-menu${qs}`);
  }

  createDailyMenu(data: { date: string; item_ids: string[]; specials?: any[] }) {
    return this.api.post<any>('/kitchen/daily-menu', data);
  }

  publishDailyMenu(id: string) {
    return this.api.patch<any>(`/kitchen/daily-menu/${id}/publish`);
  }

  getStock() {
    return this.api.get<StockItem[]>('/kitchen/stock');
  }

  getLowStockAlerts() {
    return this.api.get<StockItem[]>('/kitchen/stock/low');
  }

  recordStockMovement(stockItemId: string, data: { quantity_change: number; reason: string }) {
    return this.api.post<any>(`/kitchen/stock/${stockItemId}/movement`, data);
  }
}
