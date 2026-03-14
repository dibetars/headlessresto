import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{
      tabBarActiveTintColor: '#ea580c',
      tabBarInactiveTintColor: '#9ca3af',
      tabBarStyle: { borderTopColor: '#f3f4f6' },
      headerStyle: { backgroundColor: '#fff' },
      headerTitleStyle: { fontWeight: '700' },
    }}>
      <Tabs.Screen name="dashboard" options={{
        title: 'Dashboard',
        tabBarIcon: ({ color, size }) => <Ionicons name="bar-chart-outline" size={size} color={color} />,
      }} />
      <Tabs.Screen name="attendance" options={{
        title: 'Attendance',
        tabBarIcon: ({ color, size }) => <Ionicons name="time-outline" size={size} color={color} />,
      }} />
      <Tabs.Screen name="deliveries" options={{
        title: 'Deliveries',
        tabBarIcon: ({ color, size }) => <Ionicons name="car-outline" size={size} color={color} />,
      }} />
      <Tabs.Screen name="notifications" options={{
        title: 'Alerts',
        tabBarIcon: ({ color, size }) => <Ionicons name="notifications-outline" size={size} color={color} />,
      }} />
    </Tabs>
  );
}
