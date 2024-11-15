import { useEffect, useState } from 'react';
import { ActivityIndicator, View, Modal } from 'react-native';
import * as Font from 'expo-font';
import { Stack } from 'expo-router';
import * as colors from '@/constants/Colors';
import useSio from '@/hooks/useSio';

export default function RootLayout() {
  const { socket, isConnected: isSocketConnected } = useSio();
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        await Font.loadAsync({
          "Courier Prime": require('@/assets/fonts/CourierPrime-Regular.ttf'),
          "Courier Prime Bold": require('@/assets/fonts/CourierPrime-Bold.ttf'),
        });
        setFontsLoaded(true);
      } catch (error) {
        console.error('Font loading error:', error);
      }
    })();
  }, []);

  return (
    <>
      <Stack screenOptions={{ headerShown: false }} />
      {
        !fontsLoaded || !isSocketConnected ? (
          <Modal>
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.BACKGROUND }}>
              <ActivityIndicator size="large" color={colors.PRIMARY} />
            </View>
          </Modal>
        ) : null
      }
    </>
  )
}
