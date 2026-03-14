import { useEffect, useState } from 'react';
import { View, Text, ScrollView, RefreshControl, TouchableOpacity, Linking, StyleSheet } from 'react-native';
import { supabase } from '../../lib/supabase';

const STATUS_COLOR: Record<string, string> = {
  pending: '#9ca3af', driver_assigned: '#f59e0b', picked_up: '#3b82f6',
  in_transit: '#8b5cf6', delivered: '#22c55e', cancelled: '#ef4444', failed: '#ef4444',
};

export default function DeliveriesScreen() {
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  async function load() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    const { data: m } = await supabase.from('org_memberships').select('location_id')
      .eq('user_id', session.user.id).eq('is_active', true).limit(1).single();
    if (!m?.location_id) return;

    const { data } = await supabase.from('deliveries')
      .select('*, orders!inner(customer_name, customer_phone, total_cents, location_id)')
      .eq('orders.location_id', m.location_id)
      .not('status', 'in', '(delivered,cancelled,failed)')
      .order('created_at', { ascending: false });
    setDeliveries(data || []);
  }

  useEffect(() => { load(); }, []);

  return (
    <ScrollView style={styles.container} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await load(); setRefreshing(false); }} />}>
      <Text style={styles.title}>Active Deliveries</Text>
      {deliveries.length === 0 && <Text style={styles.empty}>No active deliveries.</Text>}
      {deliveries.map((d) => (
        <View key={d.id} style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.customerName}>{(d.orders as any)?.customer_name || 'Customer'}</Text>
            <View style={[styles.badge, { backgroundColor: STATUS_COLOR[d.status] + '22' }]}>
              <Text style={[styles.badgeText, { color: STATUS_COLOR[d.status] }]}>
                {d.status.replace('_', ' ')}
              </Text>
            </View>
          </View>
          <Text style={styles.address}>📍 {d.dropoff_address}</Text>
          {d.driver_name && <Text style={styles.driver}>🚗 {d.driver_name} · {d.driver_phone}</Text>}
          {d.estimated_delivery_at && (
            <Text style={styles.eta}>ETA: {new Date(d.estimated_delivery_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
          )}
          {d.tracking_url && (
            <TouchableOpacity onPress={() => Linking.openURL(d.tracking_url)}>
              <Text style={styles.trackLink}>View tracking →</Text>
            </TouchableOpacity>
          )}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb', padding: 16 },
  title: { fontSize: 22, fontWeight: '700', color: '#111827', marginTop: 8, marginBottom: 16 },
  empty: { textAlign: 'center', color: '#9ca3af', marginTop: 40, fontSize: 15 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#f3f4f6' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  customerName: { fontSize: 16, fontWeight: '600', color: '#111827' },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeText: { fontSize: 12, fontWeight: '600', textTransform: 'capitalize' },
  address: { fontSize: 14, color: '#4b5563', marginBottom: 4 },
  driver: { fontSize: 13, color: '#6b7280', marginBottom: 4 },
  eta: { fontSize: 13, color: '#6b7280', marginBottom: 4 },
  trackLink: { fontSize: 13, color: '#ea580c', fontWeight: '600', marginTop: 4 },
});
