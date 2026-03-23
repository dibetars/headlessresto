export type UserRole = 'super_admin' | 'restaurant_admin' | 'owner' | 'admin' | 'manager' | 'kitchen' | 'waiter' | 'cashier';

export interface Restaurant {
  id: string;
  name: string;
  slug: string;
  stripe_account_id?: string;
  plan: string;
  created_at: string;
}

export interface Location {
  id: string;
  restaurant_id: string;
  name: string;
  address: string;
  timezone: string;
  is_active: boolean;
}

export interface User {
  id: string;
  restaurant_id: string;
  location_id?: string;
  role: UserRole;
  name: string;
  email: string;
  hourly_rate?: number;
}

export interface Menu {
  id: string;
  restaurant_id: string;
  location_id?: string;
  name: string;
  is_active: boolean;
}

export interface Order {
  id: string;
  location_id: string;
  restaurant_id: string;
  type: 'dine_in' | 'takeaway' | 'delivery';
  status: 'pending' | 'preparing' | 'ready' | 'served' | 'completed' | 'cancelled';
  total: number;
  payment_method?: 'cash' | 'card' | 'wallet';
  payment_status?: 'pending' | 'paid' | 'failed' | 'refunded';
  table_id?: string;
  table_number?: string;
  stripe_payment_intent_id?: string;
  uber_delivery_id?: string;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  menu_item_id: string;
  quantity: number;
  price: number;
  notes?: string;
  menu_items?: MenuItem;
}

export interface MenuItem {
  id: string;
  restaurant_id: string;
  name: string;
  description?: string;
  price: number;
  category: string;
  image_url?: string;
  is_available: boolean;
}

export interface Table {
  id: string;
  restaurant_id: string;
  location_id: string;
  table_number: string;
  capacity: number;
  status: 'available' | 'occupied' | 'reserved' | 'cleaning';
}

export interface StaffMember {
  id: string;
  user_id: string;
  org_id: string;
  role: UserRole;
  full_name: string;
  email: string;
  joined_at: string;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  brand_assets?: Record<string, unknown>;
  created_at: string;
}

export interface InventoryItem {
  id: string;
  org_id: string;
  name: string;
  quantity: number;
  unit: string;
  reorder_level?: number;
  created_at: string;
}

export interface Reservation {
  id: string;
  org_id: string;
  guest_name: string;
  guest_email?: string;
  guest_phone?: string;
  party_size: number;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'seated' | 'completed';
  notes?: string;
  created_at: string;
}

export interface DeliveryOrder {
  id: string;
  order_id: string;
  delivery_id: string;
  status: string;
  tracking_url?: string;
  driver?: {
    name: string;
    phone?: string;
    rating?: number;
    vehicle?: string;
  };
  created_at: string;
  updated_at?: string;
}
