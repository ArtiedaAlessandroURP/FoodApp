import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  ScrollView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import { Colors } from '../constants/colors';
import { Order, CartItem } from '../types';
import MapPreview from '../components/ui/MapPreview';
import PaymentGatewayModal from '../components/ui/PaymentGatewayModal';

const DELIVERY_FEE = 5.0;

type PaymentMethod = 'tarjeta' | 'yape_plin' | 'efectivo';

export default function CheckoutScreen() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [address, setAddress] = useState('');
  const [reference, setReference] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('tarjeta');
  const [generatedOrder, setGeneratedOrder] = useState<Order | null>(null);
  const [showGateway, setShowGateway] = useState(false);
  const [paymentDetail, setPaymentDetail] = useState('');

  const items = useCartStore((state) => state.items);
  const total = useCartStore((state) => state.total);
  const clearCart = useCartStore((state) => state.clearCart);
  
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const subtotal = total();
  const totalAmount = subtotal + DELIVERY_FEE;

  const [orderItemsSnapshot] = useState<CartItem[]>([...items]);

  useEffect(() => {
    // Check auth first
    if (!isAuthenticated) {
      router.replace({ pathname: '/login', params: { redirect: '/checkout' } });
      return;
    }

    // Pre-fill address if user has one
    if (user?.address && address === '') {
      setAddress(user.address);
    }
  }, [isAuthenticated, user]);

  const handleNextStep1 = () => {
    if (address.trim() === '') return;
    setStep(2);
  };

  const handleConfirmOrder = async (detail?: string) => {
    try {
      const orderId = `FD-${Math.floor(10000 + Math.random() * 90000)}`;
      const now = new Date();
      const dateString = now.toLocaleDateString('es-PE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });

      const fullAddress = address.trim() + (reference.trim() !== '' ? ` - Ref: ${reference.trim()}` : '');

      const newOrder: Order = {
        id: orderId,
        items: orderItemsSnapshot,
        total: totalAmount,
        date: dateString,
        status: 'pendiente',
        address: fullAddress,
        paymentMethod: paymentMethod,
        paymentDetail: detail,
      };

      const existingOrdersJson = await AsyncStorage.getItem('orders');
      const existingOrders: Order[] = existingOrdersJson ? JSON.parse(existingOrdersJson) : [];
      
      const updatedOrders = [newOrder, ...existingOrders];
      await AsyncStorage.setItem('orders', JSON.stringify(updatedOrders));

      setGeneratedOrder(newOrder);
      clearCart();
      setStep(3);
    } catch (error) {
      console.error('Error al guardar el pedido:', error);
    }
  };

  const handleBackToStart = () => {
    router.replace('/(tabs)');
  };

  const handlePressConfirm = () => {
    if (paymentMethod === 'tarjeta') {
      setShowGateway(true);
      return;
    }
    handleConfirmOrder();
  };

  const handleGatewaySuccess = (last4: string) => {
    setShowGateway(false);
    setPaymentDetail(`Tarjeta terminada en ${last4}`);
    handleConfirmOrder(`Tarjeta terminada en ${last4}`);
  };

  if (!isAuthenticated) return null; // Wait for redirect

  const renderProgressBar = () => {
    return (
      <View style={styles.progressContainer}>
        <View style={styles.stepIndicator}>
          <View
            style={[
              styles.stepCircle,
              step >= 1 && styles.stepCircleActive,
              step > 1 && styles.stepCircleCompleted,
            ]}
          >
            {step > 1 ? (
              <Ionicons name="checkmark" size={16} color="#FFF" />
            ) : (
              <Text style={[styles.stepNumber, step >= 1 && styles.stepNumberActive]}>1</Text>
            )}
          </View>
          <Text style={[styles.stepLabel, step >= 1 && styles.stepLabelActive]}>Dirección</Text>
        </View>

        <View style={[styles.stepLine, step >= 2 && styles.stepLineActive]} />

        <View style={styles.stepIndicator}>
          <View
            style={[
              styles.stepCircle,
              step >= 2 && styles.stepCircleActive,
              step > 2 && styles.stepCircleCompleted,
            ]}
          >
            {step > 2 ? (
              <Ionicons name="checkmark" size={16} color="#FFF" />
            ) : (
              <Text style={[styles.stepNumber, step >= 2 && styles.stepNumberActive]}>2</Text>
            )}
          </View>
          <Text style={[styles.stepLabel, step >= 2 && styles.stepLabelActive]}>Pago</Text>
        </View>

        <View style={[styles.stepLine, step >= 3 && styles.stepLineActive]} />

        <View style={styles.stepIndicator}>
          <View style={[styles.stepCircle, step === 3 && styles.stepCircleActive]}>
            <Text style={[styles.stepNumber, step === 3 && styles.stepNumberActive]}>3</Text>
          </View>
          <Text style={[styles.stepLabel, step === 3 && styles.stepLabelActive]}>Confirmación</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeContainer} edges={['top', 'bottom']}>
      {step < 3 && (
        <View style={styles.header}>
          <Pressable
            style={({ pressed }) => [styles.backButton, pressed && styles.headerButtonPressed]}
            onPress={() => (step === 2 ? setStep(1) : router.back())}
          >
            <Ionicons name="arrow-back" size={24} color={Colors.text} />
          </Pressable>
          <Text style={styles.headerTitle}>Finalizar Pedido</Text>
          <View style={{ width: 40 }} />
        </View>
      )}

      {renderProgressBar()}

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {step === 1 && (
          <View style={styles.contentCard}>
            <Text style={styles.sectionTitle}>¿Dónde entregamos tu pedido?</Text>
            <Text style={styles.sectionSubtitle}>
              Confirma la ubicación para llevarte tu comida bien caliente.
            </Text>

            <View style={styles.mapContainer}>
              <MapPreview address={address} onAddressChange={setAddress} height={200} />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Dirección de entrega *</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="location-outline" size={20} color={Colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  placeholder="Calle, avenida, número"
                  placeholderTextColor={Colors.textSecondary}
                  style={styles.textInput}
                  value={address}
                  onChangeText={setAddress}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Referencia (Opcional)</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="navigate-outline" size={20} color={Colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  placeholder="Ej: Frente al parque"
                  placeholderTextColor={Colors.textSecondary}
                  style={styles.textInput}
                  value={reference}
                  onChangeText={setReference}
                />
              </View>
            </View>

            <View style={styles.miniSummary}>
              <Text style={styles.miniSummaryTitle}>Resumen de pago</Text>
              <View style={styles.miniRow}>
                <Text style={styles.miniLabel}>Total a pagar (con envío):</Text>
                <Text style={styles.miniValue}>S/ {totalAmount.toFixed(2)}</Text>
              </View>
            </View>

            <Pressable
              style={[styles.primaryButton, address.trim() === '' && styles.primaryButtonDisabled]}
              onPress={handleNextStep1}
              disabled={address.trim() === ''}
            >
              <Text style={styles.primaryButtonText}>Continuar al pago</Text>
              <Ionicons name="arrow-forward" size={18} color="#FFF" />
            </Pressable>
          </View>
        )}

        {step === 2 && (
          <View style={styles.contentCard}>
            <Text style={styles.sectionTitle}>Elige tu método de pago</Text>
            <Text style={styles.sectionSubtitle}>
              Selecciona el método de pago que más te acomode.
            </Text>

            <View style={styles.paymentMethodsContainer}>
              <Pressable
                style={[
                  styles.paymentOption,
                  paymentMethod === 'tarjeta' && styles.paymentOptionActive,
                ]}
                onPress={() => setPaymentMethod('tarjeta')}
              >
                <View style={styles.paymentOptionLeft}>
                  <View
                    style={[
                      styles.paymentIconWrapper,
                      paymentMethod === 'tarjeta' && styles.paymentIconWrapperActive,
                    ]}
                  >
                    <Ionicons
                      name="card-outline"
                      size={20}
                      color={paymentMethod === 'tarjeta' ? Colors.primary : Colors.textSecondary}
                    />
                  </View>
                  <Text
                    style={[
                      styles.paymentOptionLabel,
                      paymentMethod === 'tarjeta' && styles.paymentOptionLabelActive,
                    ]}
                  >
                    Tarjeta de Crédito / Débito
                  </Text>
                </View>
                <View
                  style={[
                    styles.radioCircle,
                    paymentMethod === 'tarjeta' && styles.radioCircleActive,
                  ]}
                >
                  {paymentMethod === 'tarjeta' && <View style={styles.radioInnerCircle} />}
                </View>
              </Pressable>

              <Pressable
                style={[
                  styles.paymentOption,
                  paymentMethod === 'yape_plin' && styles.paymentOptionActive,
                ]}
                onPress={() => setPaymentMethod('yape_plin')}
              >
                <View style={styles.paymentOptionLeft}>
                  <View
                    style={[
                      styles.paymentIconWrapper,
                      paymentMethod === 'yape_plin' && styles.paymentIconWrapperActive,
                    ]}
                  >
                    <Ionicons
                      name="qr-code-outline"
                      size={20}
                      color={paymentMethod === 'yape_plin' ? Colors.primary : Colors.textSecondary}
                    />
                  </View>
                  <Text
                    style={[
                      styles.paymentOptionLabel,
                      paymentMethod === 'yape_plin' && styles.paymentOptionLabelActive,
                    ]}
                  >
                    Yape o Plin (QR / Celular)
                  </Text>
                </View>
                <View
                  style={[
                    styles.radioCircle,
                    paymentMethod === 'yape_plin' && styles.radioCircleActive,
                  ]}
                >
                  {paymentMethod === 'yape_plin' && <View style={styles.radioInnerCircle} />}
                </View>
              </Pressable>

              <Pressable
                style={[
                  styles.paymentOption,
                  paymentMethod === 'efectivo' && styles.paymentOptionActive,
                ]}
                onPress={() => setPaymentMethod('efectivo')}
              >
                <View style={styles.paymentOptionLeft}>
                  <View
                    style={[
                      styles.paymentIconWrapper,
                      paymentMethod === 'efectivo' && styles.paymentIconWrapperActive,
                    ]}
                  >
                    <Ionicons
                      name="cash-outline"
                      size={20}
                      color={paymentMethod === 'efectivo' ? Colors.primary : Colors.textSecondary}
                    />
                  </View>
                  <Text
                    style={[
                      styles.paymentOptionLabel,
                      paymentMethod === 'efectivo' && styles.paymentOptionLabelActive,
                    ]}
                  >
                    Efectivo contra entrega
                  </Text>
                </View>
                <View
                  style={[
                    styles.radioCircle,
                    paymentMethod === 'efectivo' && styles.radioCircleActive,
                  ]}
                >
                  {paymentMethod === 'efectivo' && <View style={styles.radioInnerCircle} />}
                </View>
              </Pressable>
            </View>

            <View style={styles.deliverySummaryCard}>
              <View style={styles.deliverySummaryHeader}>
                <Ionicons name="location" size={16} color={Colors.primary} />
                <Text style={styles.deliverySummaryTitle}>Dirección de entrega</Text>
              </View>
              <Text style={styles.deliverySummaryText}>{address}</Text>
              {reference !== '' && (
                <Text style={styles.deliverySummaryRef}>Ref: {reference}</Text>
              )}
            </View>

            <Pressable
              style={({ pressed }) => [styles.primaryButton, pressed && styles.primaryButtonPressed]}
              onPress={handlePressConfirm}
            >
              <Text style={styles.primaryButtonText}>
                {paymentMethod === 'tarjeta'
                  ? `Ir a pagar (S/ ${totalAmount.toFixed(2)})`
                  : `Confirmar Pedido (S/ ${totalAmount.toFixed(2)})`}
              </Text>
              <Ionicons name="checkmark-circle" size={18} color="#FFF" />
            </Pressable>
          </View>
        )}

        {step === 3 && generatedOrder && (
          <View style={styles.successCard}>
            <View style={styles.successIconWrapper}>
              <Ionicons name="checkmark-circle" size={80} color={Colors.success} />
            </View>

            <Text style={styles.successTitle}>¡Pedido Confirmado!</Text>
            <Text style={styles.successSubtitle}>
              Tu pedido ha sido recibido y ya se encuentra en cocina. ¡Prepárate para disfrutar!
            </Text>

            <View style={styles.receiptContainer}>
              <View style={styles.receiptHeader}>
                <Text style={styles.receiptHeaderTitle}>Detalles de tu pedido</Text>
              </View>

              <View style={styles.receiptRow}>
                <Text style={styles.receiptLabel}>Número de Pedido</Text>
                <Text style={styles.receiptValueHighlight}>{generatedOrder.id}</Text>
              </View>

              <View style={styles.receiptRow}>
                <Text style={styles.receiptLabel}>Fecha</Text>
                <Text style={styles.receiptValue}>{generatedOrder.date}</Text>
              </View>

              <View style={styles.receiptRow}>
                <Text style={styles.receiptLabel}>Dirección</Text>
                <Text style={[styles.receiptValue, { flex: 1, textAlign: 'right' }]} numberOfLines={2}>
                  {generatedOrder.address}
                </Text>
              </View>

              <View style={styles.receiptRow}>
                <Text style={styles.receiptLabel}>Método de Pago</Text>
                <Text style={styles.receiptValue}>
                  {generatedOrder.paymentDetail
                    ? generatedOrder.paymentDetail
                    : paymentMethod === 'tarjeta'
                    ? 'Tarjeta bancaria'
                    : paymentMethod === 'yape_plin'
                    ? 'Yape / Plin'
                    : 'Efectivo'}
                </Text>
              </View>

              <View style={styles.receiptDivider} />

              <View style={styles.receiptItemsList}>
                {generatedOrder.items.map((item, idx) => (
                  <View key={idx} style={styles.receiptItemRow}>
                    <Text style={styles.receiptItemName}>
                      {item.quantity}x {item.product.name}
                    </Text>
                    <Text style={styles.receiptItemPrice}>
                      S/ {(item.product.price * item.quantity).toFixed(2)}
                    </Text>
                  </View>
                ))}
              </View>

              <View style={styles.receiptDivider} />

              <View style={styles.receiptTotalRow}>
                <Text style={styles.receiptTotalLabel}>Total Pagado</Text>
                <Text style={styles.receiptTotalValue}>S/ {generatedOrder.total.toFixed(2)}</Text>
              </View>
            </View>

            <Pressable
              style={({ pressed }) => [styles.backHomeButton, pressed && styles.backHomeButtonPressed]}
              onPress={handleBackToStart}
            >
              <Text style={styles.backHomeButtonText}>Volver al inicio</Text>
              <Ionicons name="home-outline" size={16} color="#FFF" />
            </Pressable>
          </View>
        )}
      </ScrollView>

      <PaymentGatewayModal
        visible={showGateway}
        amount={totalAmount}
        onSuccess={handleGatewaySuccess}
        onClose={() => setShowGateway(false)}
      />
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
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: '#FFF',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerButtonPressed: {
    backgroundColor: '#F3F4F6',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.text,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  stepIndicator: {
    alignItems: 'center',
    width: 80,
  },
  stepCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#FFF',
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  stepCircleActive: {
    borderColor: Colors.primary,
    backgroundColor: '#FFF',
  },
  stepCircleCompleted: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary,
  },
  stepNumber: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  stepNumberActive: {
    color: Colors.primary,
  },
  stepLabel: {
    fontSize: 10,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  stepLabelActive: {
    color: Colors.text,
    fontWeight: '700',
  },
  stepLine: {
    width: '12%',
    height: 2,
    backgroundColor: Colors.border,
    marginBottom: 16,
  },
  stepLineActive: {
    backgroundColor: Colors.primary,
  },
  scrollContainer: {
    padding: 20,
    flexGrow: 1,
  },
  contentCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
      },
      android: { elevation: 3 },
    }),
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 6,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
    marginBottom: 16,
  },
  mapContainer: {
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
    backgroundColor: '#F9FAFB',
  },
  inputIcon: {
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: Colors.text,
    outlineStyle: 'none',
  } as any,
  miniSummary: {
    backgroundColor: Colors.primaryMuted,
    borderRadius: 12,
    padding: 12,
    marginVertical: 12,
    borderWidth: 1,
    borderColor: Colors.primaryTint,
  },
  miniSummaryTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primaryDark,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  miniRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  miniLabel: {
    fontSize: 13,
    color: Colors.text,
    fontWeight: '500',
  },
  miniValue: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.primary,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 12,
  },
  primaryButtonPressed: {
    backgroundColor: Colors.primaryDark,
  },
  primaryButtonDisabled: {
    backgroundColor: '#CCCCCC',
    opacity: 0.7,
  },
  primaryButtonText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '700',
  },
  paymentMethodsContainer: {
    gap: 12,
    marginBottom: 20,
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 14,
    padding: 14,
    backgroundColor: '#FFF',
    ...Platform.select({
      web: { cursor: 'pointer' },
    }),
  },
  paymentOptionActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryTint,
  },
  paymentOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  paymentIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  paymentIconWrapperActive: {
    backgroundColor: Colors.primaryMuted,
  },
  paymentOptionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  paymentOptionLabelActive: {
    color: Colors.primary,
    fontWeight: '700',
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleActive: {
    borderColor: Colors.primary,
  },
  radioInnerCircle: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary,
  },
  deliverySummaryCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 14,
    marginBottom: 20,
  },
  deliverySummaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  deliverySummaryTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.text,
    textTransform: 'uppercase',
  },
  deliverySummaryText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500',
    lineHeight: 18,
  },
  deliverySummaryRef: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontStyle: 'italic',
    marginTop: 2,
  },
  successCard: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 24,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
      },
      android: { elevation: 4 },
    }),
  },
  successIconWrapper: {
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 8,
  },
  successSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 24,
    paddingHorizontal: 12,
  },
  receiptContainer: {
    width: '100%',
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    marginBottom: 24,
  },
  receiptHeader: {
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingBottom: 10,
    marginBottom: 12,
  },
  receiptHeaderTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.text,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  receiptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  receiptLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  receiptValue: {
    fontSize: 13,
    color: Colors.text,
    fontWeight: '600',
  },
  receiptValueHighlight: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '800',
  },
  receiptDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 10,
    borderStyle: 'dashed',
  },
  receiptItemsList: {
    gap: 6,
  },
  receiptItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  receiptItemName: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  receiptItemPrice: {
    fontSize: 12,
    color: Colors.text,
    fontWeight: '600',
  },
  receiptTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  receiptTotalLabel: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '700',
  },
  receiptTotalValue: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: '800',
  },
  backHomeButton: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    height: 48,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    width: '100%',
  },
  backHomeButtonPressed: {
    backgroundColor: Colors.primaryDark,
  },
  backHomeButtonText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
