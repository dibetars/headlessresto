import { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { supabase } from '../../lib/supabase';
import { formatCents } from '@restaurantos/shared';

export default function DashboardScreen() {
  const [stats, setStats] = useState({ orders: 0, revenue: 0, activeStaff: 0, lowStock: 0 });
  const [refreshing, setRefreshing] = useState(false);
  const today = new Date().toISOString().split('T')[0];

  async function load() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    const { data: m } = await supabase.from('org_memberships').select('location_id')
      .eq('user_id', session.user.id).eq('is_active', true).limit(1).single();
    const locId = m?.location_id; if (!locId) return;

    const [{ count: orders }, { data: revData }, { data: stockData }] = await Promise.all([
      supabase.from('orders').select('*', { count: 'exact', head: true })
        .eq('location_id', locId).gte('created_at', `${today}T00:00:00Z`),
      supabase.from('orders').select('total_cents').eq('location_id', locId)
        .in('status', ['completed', 'delivered']).gte('created_at', `${today}T00:00:00Z`),
      supabase.from('stock_items').select('quantity, reorder_threshold').eq('location_id', locId),
    ]);

    const revenue = (revData || []).reduce((s, o) => s + o.total_cents, 0);
    const lowStock = (stockData || []).filter((i) => i.reorder_threshold != null && i.quantity <= i.reorder_threshold).length;

    setStats({ orders: orders || 0, revenue, activeStaff: 0, lowStock });
  }

  useEffect(() => { load(); }, []);

  const cards = [
    { label: "Today's Orders", value: String(stats.orders), color: '#dbeafe' },
    { label: "Today's Revenue", value: formatCents(stats.revenue), color: '#dcfce7' },
    { label: 'Low Stock Alerts', value: String(stats.lowStock), color: stats.lowStock > 0 ? '#fef3c7' : '#f3f4f6' },
  ];

  return (
    <ScrollView style={styles.container} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await load(); setRefreshing(false); }} />}>
      <Text style={styles.title}>Good {new Date().getHours() < 12 ? 'morning' : 'evening'}!</Text>
      <Text style={styles.date}>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</Text>
      <View style={styles.grid}>
        {cards.map((card) => (
          <View key={card.label} style={[styles.card, { backgroundColor: card.color }]}>
            <Text style={styles.cardValue}>{card.value}</Text>
            <Text style={styles.cardLabel}>{card.label}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb', padding: 16 },
  title: { fontSize: 22, fontWeight: '700', color: '#111827', marginTop: 8 },
  date: { fontSize: 14, color: '#6b7280', marginTop: 4, marginBottom: 20 },
  grid: { gap: 12 },
  card: { borderRadius: 16, padding: 20 },
  cardValue: { fontSize: 28, fontWeight: '700', color: '#111827' },
  cardLabel: { fontSize: 13, color: '#6b7280', marginTop: 4 },
});
