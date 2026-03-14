import { useEffect, useState } from 'react';
import { View, Text, ScrollView, RefreshControl, StyleSheet } from 'react-native';
import { supabase } from '../../lib/supabase';

export default function NotificationsScreen() {
  const [alerts, setAlerts] = useState<{ id: string; message: string; time: string; type: string }[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  async function load() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    const { data: m } = await supabase.from('org_memberships').select('location_id')
      .eq('user_id', session.user.id).eq('is_active', true).limit(1).single();
    if (!m?.location_id) return;

    const notifications: typeof alerts = [];

    // Low stock alerts
    const { data: lowStock } = await supabase.from('stock_items')
      .select('id, name, quantity, unit, reorder_threshold')
      .eq('location_id', m.location_id)
      .not('reorder_threshold', 'is', null);

    (lowStock || [])
      .filter((i) => i.quantity <= i.reorder_threshold)
      .forEach((i) => notifications.push({
        id: `stock-${i.id}`,
        message: `Low stock: ${i.name} (${i.quantity} ${i.unit} remaining)`,
        time: 'Now',
        type: 'warning',
      }));

    // Pending orders
    const { count: pending } = await supabase.from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('location_id', m.location_id).eq('status', 'pending');

    if (pending && pending > 0) {
      notifications.push({ id: 'pending-orders', message: `${pending} order${pending > 1 ? 's' : ''} waiting for confirmation`, time: 'Now', type: 'info' });
    }

    setAlerts(notifications);
  }

  useEffect(() => { load(); }, []);

  const iconForType = (type: string) => type === 'warning' ? '⚠️' : type === 'error' ? '🚨' : 'ℹ️';

  return (
    <ScrollView style={styles.container} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await load(); setRefreshing(false); }} />}>
      <Text style={styles.title}>Alerts</Text>
      {alerts.length === 0 && <Text style={styles.empty}>No alerts — all good! 🎉</Text>}
      {alerts.map((alert) => (
        <View key={alert.id} style={[styles.card, alert.type === 'warning' && styles.cardWarning]}>
          <Text style={styles.icon}>{iconForType(alert.type)}</Text>
          <View style={styles.cardBody}>
            <Text style={styles.message}>{alert.message}</Text>
            <Text style={styles.time}>{alert.time}</Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb', padding: 16 },
  title: { fontSize: 22, fontWeight: '700', color: '#111827', marginTop: 8, marginBottom: 16 },
  empty: { textAlign: 'center', color: '#9ca3af', marginTop: 40, fontSize: 15 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 10, flexDirection: 'row', gap: 12, borderWidth: 1, borderColor: '#f3f4f6' },
  cardWarning: { borderColor: '#fde68a', backgroundColor: '#fffbeb' },
  icon: { fontSize: 22, marginTop: 2 },
  cardBody: { flex: 1 },
  message: { fontSize: 14, color: '#111827', lineHeight: 20 },
  time: { fontSize: 12, color: '#9ca3af', marginTop: 4 },
});
