import { useEffect } from 'react';
import { Alert } from 'react-native';
import * as Updates from 'expo-updates';

export const useOTAUpdate = () => {
  useEffect(() => {
    async function onFetchUpdateAsync() {
      try {
        const update = await Updates.checkForUpdateAsync();

        if (update.isAvailable) {
          Alert.alert(
            'Update Available',
            'A new version of ParkEasy is available. Would you like to update now?',
            [
              { text: 'Later', style: 'cancel' },
              { 
                text: 'Update Now', 
                onPress: async () => {
                  try {
                    await Updates.fetchUpdateAsync();
                    await Updates.reloadAsync();
                  } catch (error) {
                    Alert.alert('Error', 'Failed to download the update. Please try again later.');
                  }
                } 
              },
            ]
          );
        }
      } catch (error) {
        // You can also add an error log or some custom logic here, 
        // but it's often best to fail silently in background checks
        console.warn('OTA check failed:', error);
      }
    }

    // Only run OTA check in production/preview builds (not during local development)
    if (!__DEV__) {
      onFetchUpdateAsync();
    }
  }, []);
};
