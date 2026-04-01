import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { StyleSheet, View, Platform, Text } from 'react-native';
import { colors } from '../../constants/colors';

export default function CustomerLayout() {
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
          borderRadius: 32,
          backgroundColor: 'transparent',
          borderTopWidth: 0,
          elevation: 0,
          paddingBottom: 0,
        },
        tabBarBackground: () => (
          <View style={styles.tabBarBackgroundContainer}>
            {Platform.OS === 'ios' ? (
              <BlurView 
                intensity={25} 
                tint="dark" 
                style={[StyleSheet.absoluteFill, styles.tabBarBlur]} 
              />
            ) : (
              <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(10, 15, 30, 0.95)' }]} />
            )}
            <View style={styles.tabBarBorder} />
          </View>
        ),
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarLabelStyle: {
          display: 'none', // Uber-style clean minimalist icons
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <View style={focused && styles.activeIconContainer}>
              <Ionicons name={focused ? "map" : "map-outline"} size={24} color={color} />
              {focused && <View style={styles.activeGlow} />}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Search',
          tabBarIcon: ({ color, focused }) => (
            <View style={focused && styles.activeIconContainer}>
              <Ionicons name={focused ? "search" : "search-outline"} size={24} color={color} />
              {focused && <View style={styles.activeGlow} />}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="tickets"
        options={{
          title: 'Tickets',
          tabBarIcon: ({ color, focused }) => (
            <View style={focused && styles.activeIconContainer}>
              <Ionicons name={focused ? "ticket" : "ticket-outline"} size={24} color={color} />
              {focused && <View style={styles.activeGlow} />}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="passes"
        options={{
          title: 'Passes',
          tabBarIcon: ({ color, focused }) => (
            <View style={focused && styles.activeIconContainer}>
              <Ionicons name={focused ? "card" : "card-outline"} size={24} color={color} />
              {focused && <View style={styles.activeGlow} />}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <View style={focused && styles.activeIconContainer}>
              <Ionicons name={focused ? "person" : "person-outline"} size={24} color={color} />
              {focused && <View style={styles.activeGlow} />}
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBarBackgroundContainer: {
    flex: 1,
    borderRadius: 32,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    ...colors.shadows.glass,
  },
  tabBarBlur: {
    borderRadius: 32,
  },
  tabBarBorder: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
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

