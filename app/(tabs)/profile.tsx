import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
  ScrollView,
  TextInput,
  Alert,
  Button,
} from 'react-native';
import * as Sentry from '@sentry/react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuthStore } from '../../store/authStore';
import { Colors } from '../../constants/colors';

export default function ProfileScreen() {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const logout = useAuthStore((state) => state.logout);
  const updateUser = useAuthStore((state) => state.updateUser);

  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [addressInput, setAddressInput] = useState(user?.address || '');

  const handleLogout = () => {
    if (Platform.OS === 'web') {
      if (window.confirm('¿Estás seguro de que deseas cerrar sesión?')) {
        logout();
      }
    } else {
      Alert.alert(
        'Cerrar sesión',
        '¿Estás seguro de que deseas cerrar sesión?',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Salir', onPress: logout, style: 'destructive' },
        ]
      );
    }
  };

  const saveAddress = () => {
    updateUser({ address: addressInput });
    setIsEditingAddress(false);
  };

  // Paso 2 del laboratorio: Simular un Error
  const simulateError = () => {
    try {
      throw new Error("Simulated error for FoodApp - Lab 04");
    } catch (error) {
      Sentry.captureException(error);
      alert("¡Error capturado en FoodApp y enviado a Sentry!");
    }
  };

  // Paso 3 del laboratorio: Enviar Logs Personalizados
  const sendCustomLogs = () => {
    Sentry.logger.info("FoodApp: El usuario ingresó a la sección de pruebas");
    Sentry.logger.error("FoodApp Error Log: Intento manual de registro de log");
    alert("Logs de FoodApp enviados.");
  };

  // Paso 4: Configurar Métricas y Trazas (Versión final sin errores)
  const handlePerformanceAndMetrics = () => {
    // Usamos startSpan, que es el reemplazo moderno de startTransaction
    Sentry.startSpan({ name: "User Login" }, () => {

      // Registramos las métricas usando 'as any' para evitar que TypeScript se queje
      Sentry.metrics.count("button_clicks", 1, { button: "try" } as any);

      Sentry.metrics.count("button_buy", 1, { button: "buy", screen: "home" } as any);

      // Gauge para medir el tamaño de cola
      Sentry.metrics.gauge("queue_size", 15);
    });

    alert("Métricas y trazas enviadas correctamente.");
  };

  if (!isAuthenticated || !user) {
    return (
      <SafeAreaView style={styles.safeContainer}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Mi Perfil</Text>
        </View>
        <View style={styles.unauthContainer}>
          <View style={styles.unauthIconWrapper}>
            <Ionicons name="person-circle-outline" size={100} color={Colors.textTertiary} />
          </View>
          <Text style={styles.unauthTitle}>Inicia sesión</Text>
          <Text style={styles.unauthSubtitle}>
            Accede a tu historial de pedidos, guarda tu dirección y más.
          </Text>
          <Pressable
            style={styles.primaryButton}
            onPress={() => router.push('/login')}
          >
            <Text style={styles.primaryButtonText}>Iniciar sesión / Registrarse</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeContainer} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mi Perfil</Text>
        <Pressable onPress={handleLogout} style={styles.logoutHeaderBtn}>
          <Ionicons name="log-out-outline" size={20} color={Colors.error} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* User Card */}
        <View style={styles.userCard}>
          <View style={styles.avatarLarge}>
            <Text style={styles.avatarLargeText}>{user.name.charAt(0).toUpperCase()}</Text>
          </View>
          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.userEmail}>{user.email}</Text>
          <View style={styles.userPhoneBadge}>
            <Ionicons name="call" size={12} color={Colors.textSecondary} />
            <Text style={styles.userPhoneText}>{user.phone}</Text>
          </View>
        </View>

        {/* Address Section */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionHeaderLeft}>
              <View style={[styles.sectionIconWrapper, { backgroundColor: Colors.primaryTint }]}>
                <Ionicons name="location" size={18} color={Colors.primary} />
              </View>
              <Text style={styles.sectionTitle}>Dirección principal</Text>
            </View>
            {!isEditingAddress && (
              <Pressable onPress={() => { setAddressInput(user.address || ''); setIsEditingAddress(true); }}>
                <Text style={styles.editLink}>Editar</Text>
              </Pressable>
            )}
          </View>

          {isEditingAddress ? (
            <View style={styles.addressEditContainer}>
              <TextInput
                style={styles.addressInput}
                value={addressInput}
                onChangeText={setAddressInput}
                placeholder="Ingresa tu dirección de entrega"
                autoFocus
              />
              <View style={styles.addressEditActions}>
                <Pressable style={styles.cancelAddressBtn} onPress={() => setIsEditingAddress(false)}>
                  <Text style={styles.cancelAddressText}>Cancelar</Text>
                </Pressable>
                <Pressable style={styles.saveAddressBtn} onPress={saveAddress}>
                  <Text style={styles.saveAddressText}>Guardar</Text>
                </Pressable>
              </View>
            </View>
          ) : (
            <Text style={styles.addressDisplay}>
              {user.address ? user.address : 'No has configurado una dirección aún.'}
            </Text>
          )}
        </View>

        {/* Settings Links */}
        <View style={styles.linksContainer}>
          <Pressable style={styles.linkRow} onPress={() => router.push('/(tabs)/orders')}>
            <View style={styles.linkLeft}>
              <View style={[styles.linkIconWrapper, { backgroundColor: Colors.infoLight }]}>
                <Ionicons name="receipt-outline" size={18} color={Colors.info} />
              </View>
              <Text style={styles.linkText}>Mis Pedidos</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.textTertiary} />
          </Pressable>

          <View style={styles.divider} />

          <Pressable style={styles.linkRow}>
            <View style={styles.linkLeft}>
              <View style={[styles.linkIconWrapper, { backgroundColor: Colors.warningLight }]}>
                <Ionicons name="help-buoy-outline" size={18} color={Colors.warning} />
              </View>
              <Text style={styles.linkText}>Ayuda y Soporte</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.textTertiary} />
          </Pressable>

          <View style={styles.divider} />

          <Pressable style={styles.linkRow}>
            <View style={styles.linkLeft}>
              <View style={[styles.linkIconWrapper, { backgroundColor: Colors.successLight }]}>
                <Ionicons name="information-circle-outline" size={18} color={Colors.success} />
              </View>
              <Text style={styles.linkText}>Sobre Nosotros</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.textTertiary} />
          </Pressable>
        </View>

        <Text style={styles.versionText}>FoodApp v1.0.0</Text>

        {/* ---------------- SECCIÓN DE PRUEBAS SENTRY ---------------- */}
        <View style={styles.sentryBox}>
          <Text style={styles.sentryTitle}>🔬 Panel de Control Sentry (Lab 04)</Text>

          <View style={styles.btnSpace}>
            <Button title="1. Simular Excepción" onPress={simulateError} color="#ff4d4f" />
          </View>

          <View style={styles.btnSpace}>
            <Button title="2. Enviar Logs" onPress={sendCustomLogs} color="#1890ff" />
          </View>

          <View style={styles.btnSpace}>
            <Button title="3. Enviar Métricas/Trazas" onPress={handlePerformanceAndMetrics} color="#52c41a" />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: '#FFF',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.text,
  },
  logoutHeaderBtn: {
    padding: 8,
    marginRight: -8,
  },
  unauthContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  unauthIconWrapper: {
    marginBottom: 16,
  },
  unauthTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 8,
  },
  unauthSubtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    height: 52,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '700',
  },
  scrollContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  userCard: {
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 24,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
      },
      android: { elevation: 2 },
    }),
  },
  avatarLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 4,
    borderColor: Colors.primaryTint,
  },
  avatarLargeText: {
    color: '#FFF',
    fontSize: 32,
    fontWeight: '800',
  },
  userName: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  userPhoneBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceSubtle,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  userPhoneText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  sectionCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  sectionIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  editLink: {
    color: Colors.primary,
    fontSize: 13,
    fontWeight: '600',
  },
  addressDisplay: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  addressEditContainer: {
    gap: 12,
  },
  addressInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: Colors.text,
    backgroundColor: Colors.surfaceSubtle,
    outlineStyle: 'none',
  } as any,
  addressEditActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  cancelAddressBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  cancelAddressText: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  saveAddressBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  saveAddressText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
  },
  linksContainer: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 24,
  },
  linkRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
  },
  linkLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  linkIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  linkText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginLeft: 60,
  },
  versionText: {
    textAlign: 'center',
    fontSize: 12,
    color: Colors.textTertiary,
    fontWeight: '500',
  },
  sentryBox: {
    marginTop: 30,
    padding: 15,
    backgroundColor: '#eee',
    borderRadius: 10,
    width: '100%',
  },
  sentryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
    color: '#333',
  },
  btnSpace: {
    marginBottom: 12,
  },
});