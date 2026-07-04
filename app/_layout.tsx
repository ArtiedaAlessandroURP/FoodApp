import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { View, StyleSheet, Platform } from 'react-native';
import { useAuthStore } from '../store/authStore';
import { useResponsive, MAX_APP_WIDTH } from '../hooks/useResponsive';

export default function RootLayout() {
  const loadSession = useAuthStore((state) => state.loadSession);
  const { isWideScreen } = useResponsive();

  useEffect(() => {
    loadSession();
  }, []);

  const navigator = (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="product/[id]" options={{ presentation: 'card' }} />
      <Stack.Screen name="checkout" options={{ presentation: 'modal' }} />
      <Stack.Screen name="login" options={{ presentation: 'modal' }} />
      <Stack.Screen name="register" options={{ presentation: 'modal' }} />
    </Stack>
  );

  // En web, cuando la ventana es más ancha que un teléfono (tablet, iPad, desktop),
  // centramos la app dentro de un "marco" de ancho fijo tipo celular, en vez de
  // estirar el diseño mobile a lo ancho. Así se ve igual de bien en cualquier tamaño.
  if (!isWideScreen) {
    return navigator;
  }

  return (
    <View style={styles.webBackdrop}>
      <View style={styles.phoneFrame}>{navigator}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  webBackdrop: {
    flex: 1,
    backgroundColor: '#E7E7E7',
    alignItems: 'center',
    justifyContent: 'center',
    ...(Platform.OS === 'web' ? ({ minHeight: '100vh' } as any) : {}),
  },
  phoneFrame: {
    width: MAX_APP_WIDTH,
    maxWidth: '100%',
    height: '100%',
    maxHeight: 900,
    overflow: 'hidden',
    borderRadius: 28,
    backgroundColor: '#FAFAF8',
    ...Platform.select({
      web: {
        boxShadow: '0 24px 70px rgba(0,0,0,0.22)',
      } as any,
    }),
  },
});