import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../../constants/colors';

export default function ProviderTabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          position: 'absolute',
          bottom: 25,
          left: 20,
          right: 20,
          elevation: 5,
          backgroundColor: 'rgba(255, 255, 255, 0.9)', // Glass effect
          borderRadius: 24,
          height: 64,
          paddingBottom: 10,
          paddingTop: 8,
          borderTopColor: 'transparent',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.1,
          shadowRadius: 15,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
          marginBottom: 4,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? "stats-chart" : "stats-chart-outline"} size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="facilities"
        options={{
          title: 'Facilities',
          tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? "business" : "business-outline"} size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="scan"
        options={{
          title: 'Scan',
          tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? "qr-code" : "qr-code-outline"} size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="bookings"
        options={{
          title: 'History',
          tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? "list" : "list-outline"} size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? "person" : "person-outline"} size={22} color={color} />,
        }}
      />
    </Tabs>
  );
}
