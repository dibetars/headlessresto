export interface DashboardStat {
  label: string;
  value: string;
  change: string;
  icon: string;
  color: 'brand-blue' | 'brand-orange';
  urgent?: boolean;
}

export interface Restaurant {
  id: string;
  name: string;
  owner: string;
  status: 'active' | 'pending' | 'suspended';
  location: string;
  joinedDate: string;
  revenue: string;
}

export interface Subscription {
  id: string;
  restaurantName: string;
  plan: 'Basic' | 'Pro' | 'Enterprise';
  status: 'active' | 'past_due' | 'canceled';
  amount: string;
  nextBilling: string;
}

export interface RevenueRecord {
  id: string;
  date: string;
  amount: number;
  type: 'subscription' | 'fee' | 'payout';
  status: 'completed' | 'pending' | 'failed';
}

export const mockStats: DashboardStat[] = [
  { label: 'Total Platform MRR', value: '$42,850', change: '+8.2%', icon: '📈', color: 'brand-blue' },
  { label: 'Active Establishments', value: '156', change: '+12 this month', icon: '🏪', color: 'brand-orange' },
  { label: 'Pending Approvals', value: '4', change: 'Requires review', icon: '⏳', urgent: true, color: 'brand-orange' },
  { label: 'Avg. Revenue/Resto', value: '$2,450', change: '+15.4%', icon: '📊', color: 'brand-blue' },
];

export const mockRestaurants: Restaurant[] = [
  { id: '1', name: 'The Golden Fork', owner: 'Marco Rossi', status: 'active', location: 'New York, NY', joinedDate: '2025-11-12', revenue: '$12,400' },
  { id: '2', name: 'Sushi Zen', owner: 'Aki Tanaka', status: 'active', location: 'San Francisco, CA', joinedDate: '2026-01-05', revenue: '$8,900' },
  { id: '3', name: 'Burger Theory', owner: 'John Doe', status: 'pending', location: 'Chicago, IL', joinedDate: '2026-03-15', revenue: '$0' },
  { id: '4', name: 'Pasta la Vista', owner: 'Lucia Bianchi', status: 'active', location: 'Miami, FL', joinedDate: '2025-08-20', revenue: '$15,200' },
  { id: '5', name: 'Taco Haven', owner: 'Carlos Gomez', status: 'suspended', location: 'Austin, TX', joinedDate: '2025-12-01', revenue: '$4,100' },
];

export const mockSubscriptions: Subscription[] = [
  { id: 'sub_1', restaurantName: 'The Golden Fork', plan: 'Pro', status: 'active', amount: '$199/mo', nextBilling: '2026-04-12' },
  { id: 'sub_2', restaurantName: 'Sushi Zen', plan: 'Basic', status: 'active', amount: '$99/mo', nextBilling: '2026-04-05' },
  { id: 'sub_3', restaurantName: 'Pasta la Vista', plan: 'Enterprise', status: 'active', amount: '$499/mo', nextBilling: '2026-04-20' },
  { id: 'sub_4', restaurantName: 'Taco Haven', plan: 'Pro', status: 'past_due', amount: '$199/mo', nextBilling: '2026-03-01' },
];

export const mockRevenue: RevenueRecord[] = [
  { id: 'rev_1', date: '2026-03-17', amount: 199.00, type: 'subscription', status: 'completed' },
  { id: 'rev_2', date: '2026-03-16', amount: 499.00, type: 'subscription', status: 'completed' },
  { id: 'rev_3', date: '2026-03-16', amount: -1200.00, type: 'payout', status: 'pending' },
  { id: 'rev_4', date: '2026-03-15', amount: 99.00, type: 'subscription', status: 'completed' },
  { id: 'rev_5', date: '2026-03-14', amount: 199.00, type: 'subscription', status: 'failed' },
];

export const mockChartData = [
  { month: 'Oct', revenue: 28000, restaurants: 120 },
  { month: 'Nov', revenue: 32000, restaurants: 128 },
  { month: 'Dec', revenue: 31000, restaurants: 132 },
  { month: 'Jan', revenue: 38000, restaurants: 140 },
  { month: 'Feb', revenue: 41000, restaurants: 148 },
  { month: 'Mar', revenue: 42850, restaurants: 156 },
];
