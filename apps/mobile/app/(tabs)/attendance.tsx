import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import * as Location from 'expo-location';
import { supabase } from '../../lib/supabase';

type AttendanceType = 'clock_in' | 'clock_out' | 'break_start' | 'break_end';

export default function AttendanceScreen() {
  const [lastLog, setLastLog] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [locationId, setLocationId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => { load(); }, []);

  async function load() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    setUserId(session.user.id);
    const { data: m } = await supabase.from('org_memberships').select('location_id')
      .eq('user_id', session.user.id).eq('is_active', true).limit(1).single();
    if (!m?.location_id) return;
    setLocationId(m.location_id);

    const { data } = await supabase.from('attendance_logs').select('*')
      .eq('user_id', session.user.id).eq('location_id', m.location_id)
      .gte('logged_at', `${today}T00:00:00Z`).order('logged_at', { ascending: false }).limit(1).maybeSingle();
    setLastLog(data);
  }

  async function logAttendance(type: AttendanceType) {
    if (!locationId || !userId) return;
    setLoading(true);
    try {
      let lat: number | null = null;
      let lng: number | null = null;
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        lat = loc.coords.latitude;
        lng = loc.coords.longitude;
      }

      const { error } = await supabase.from('attendance_logs').insert({
        user_id: userId, location_id: locationId, type,
        lat, lng, source: 'mobile',
      });
      if (error) throw error;
      await load();
      Alert.alert('Done', `${type.replace('_', ' ')} recorded.`);
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  }

  const isClockedIn = lastLog?.type === 'clock_in' || lastLog?.type === 'break_end';
  const isOnBreak = lastLog?.type === 'break_start';

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Attendance</Text>
      <Text style={styles.date}>{new Date().toLocaleDateString()}</Text>

      <View style={styles.statusCard}>
        <View style={[styles.dot, { backgroundColor: isClockedIn ? '#22c55e' : isOnBreak ? '#f59e0b' : '#e5e7eb' }]} />
        <Text style={styles.statusText}>
          {isClockedIn ? 'Clocked in' : isOnBreak ? 'On break' : 'Not clocked in'}
        </Text>
        {lastLog && (
          <Text style={styles.statusTime}>
            Since {new Date(lastLog.logged_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        )}
      </View>

      <View style={styles.buttons}>
        {!isClockedIn && !isOnBreak && (
          <BigButton label="Clock In" color="#22c55e" disabled={loading} onPress={() => logAttendance('clock_in')} />
        )}
        {isClockedIn && (
          <>
            <BigButton label="Start Break" color="#f59e0b" disabled={loading} onPress={() => logAttendance('break_start')} />
            <BigButton label="Clock Out" color="#ef4444" disabled={loading} onPress={() => logAttendance('clock_out')} />
          </>
        )}
        {isOnBreak && (
          <BigButton label="End Break" color="#3b82f6" disabled={loading} onPress={() => logAttendance('break_end')} />
        )}
      </View>
    </ScrollView>
  );
}

function BigButton({ label, color, disabled, onPress }: { label: string; color: string; disabled: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity style={[styles.bigBtn, { backgroundColor: color, opacity: disabled ? 0.5 : 1 }]} onPress={onPress} disabled={disabled}>
      <Text style={styles.bigBtnText}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb', padding: 16 },
  title: { fontSize: 22, fontWeight: '700', color: '#111827', marginTop: 8, marginBottom: 4 },
  date: { fontSize: 14, color: '#6b7280', marginBottom: 20 },
  statusCard: { backgroundColor: '#fff', borderRadius: 16, padding: 20, flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 24, borderWidth: 1, borderColor: '#f3f4f6' },
  dot: { width: 12, height: 12, borderRadius: 6 },
  statusText: { fontSize: 16, fontWeight: '600', color: '#111827', flex: 1 },
  statusTime: { fontSize: 13, color: '#6b7280' },
  buttons: { gap: 12 },
  bigBtn: { borderRadius: 16, paddingVertical: 20, alignItems: 'center' },
  bigBtnText: { color: '#fff', fontSize: 18, fontWeight: '700' },
});
