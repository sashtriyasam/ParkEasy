import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { StyleSheet, View } from 'react-native';
import { colors } from '../../../constants/colors';

const TAB_BAR_RADIUS = 32;

interface TabIconProps {
  name: any;
  outlineName: any;
  size: number;
  color: string;
  focused: boolean;
}

const TabIcon = ({ name, outlineName, size, color, focused }: TabIconProps) => (
  <View style={[styles.iconContainer, focused ? styles.activeIconContainer : null]}>
    <Ionicons name={focused ? name : outlineName} size={size} color={color} />
    {focused && <View style={styles.activeGlow} />}
  </View>
);

export default function ProviderTabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          position: 'absolute',
          bottom: 24,
          left: 20,
          right: 20,
          height: 64,
          borderRadius: TAB_BAR_RADIUS,
          backgroundColor: 'transparent',
          borderTopWidth: 0,
          elevation: 0,
          paddingBottom: 0,
        },
        tabBarBackground: () => (
          <View style={styles.tabBarBackgroundContainer}>
            <BlurView 
              intensity={25} 
              tint="dark" 
              style={[StyleSheet.absoluteFill, styles.tabBarBlur]} 
            />
            <View style={styles.tabBarBorder} />
          </View>
        ),
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarAccessibilityLabel: 'Terminal Dashboard',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="stats-chart" outlineName="stats-chart-outline" size={22} color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="facilities"
        options={{
          title: 'Facilities',
          tabBarAccessibilityLabel: 'Facility Management',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="business" outlineName="business-outline" size={22} color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="scan"
        options={{
          title: 'Scanner',
          tabBarAccessibilityLabel: 'Security Scanner',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="barcode" outlineName="barcode-outline" size={24} color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="bookings"
        options={{
          title: 'Activity',
          tabBarAccessibilityLabel: 'Activity Ledger',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="journal" outlineName="journal-outline" size={22} color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarAccessibilityLabel: 'Provider Identity',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="person-circle" outlineName="person-circle-outline" size={24} color={color} focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBarBackgroundContainer: {
    flex: 1,
    borderRadius: TAB_BAR_RADIUS,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 8,
  },
  tabBarBlur: {
    borderRadius: TAB_BAR_RADIUS,
  },
  tabBarBorder: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: TAB_BAR_RADIUS,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeGlow: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primaryGlow,
    zIndex: -1,
  }
});

