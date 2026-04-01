import { Stack } from 'expo-router';
import { View } from 'react-native';
import { colors } from '../../constants/colors';
import { StatusBar } from 'expo-status-bar';

export default function AuthLayout() {
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style="light" />
      <Stack screenOptions={{ 
        headerShown: false,
        contentStyle: { backgroundColor: 'transparent' },
        animation: 'slide_from_right'
      }}>
        <Stack.Screen name="login" />
        <Stack.Screen name="signup" />
      </Stack>
    </View>
  );
}

