import { useWindowDimensions, Platform } from 'react-native';

// Ancho máximo tipo "teléfono" que usamos como referencia en web/tablet/desktop,
// para que el diseño (pensado para mobile) nunca se estire ni se rompa.
export const MAX_APP_WIDTH = 430;

/**
 * Hook responsivo central de la app.
 * - En nativo (Android/iOS reales): devuelve el ancho real del dispositivo.
 * - En web/tablet/desktop: limita el ancho "de diseño" a MAX_APP_WIDTH,
 *   igual que el marco visual aplicado en app/_layout.tsx, para que los
 *   cálculos de layout (carruseles, cards relacionadas, etc.) coincidan
 *   siempre con el espacio realmente visible.
 * Se re-calcula automáticamente si el usuario redimensiona la ventana
 * o cambia el dispositivo simulado en el navegador.
 */
export function useResponsive() {
  const { width, height } = useWindowDimensions();
  const isWeb = Platform.OS === 'web';
  const appWidth = isWeb ? Math.min(width, MAX_APP_WIDTH) : width;
  const isWideScreen = isWeb && width > MAX_APP_WIDTH;

  return {
    windowWidth: width,
    windowHeight: height,
    appWidth,
    isWideScreen,
  };
}
