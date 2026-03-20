export type MenuItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl?: string;
};

export type MenuCategory = {
  id: string;
  name: string;
};

export type Order = {
  id: string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled';
  createdAt: string;
};

export type OrderItem = {
  id: string;
  menuItemId: string;
  quantity: number;
  price: number;
};

export type Customer = {
  id: string;
  name: string;
  email: string;
  phone: string;
  orderHistory: Order[];
};
