import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  Modal,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';

interface PaymentGatewayModalProps {
  visible: boolean;
  amount: number;
  onSuccess: (last4: string) => void;
  onClose: () => void;
}

type GatewayStatus = 'form' | 'processing' | 'success' | 'error';

const DECLINE_REASONS = [
  'Fondos insuficientes',
  'Tarjeta declinada por el banco emisor',
  'Error de conexión con el banco',
  'La tarjeta ha expirado',
];

// Detecta la marca según el prefijo (uso puramente visual/demo)
function detectBrand(cardNumber: string): 'visa' | 'mastercard' | 'desconocida' {
  const digits = cardNumber.replace(/\s/g, '');
  if (/^4/.test(digits)) return 'visa';
  if (/^5[1-5]/.test(digits)) return 'mastercard';
  return 'desconocida';
}

// Algoritmo de Luhn para validar que el número de tarjeta sea consistente
function isValidLuhn(cardNumber: string): boolean {
  const digits = cardNumber.replace(/\s/g, '');
  if (digits.length < 13 || digits.length > 19) return false;

  let sum = 0;
  let shouldDouble = false;

  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = parseInt(digits[i], 10);
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }

  return sum % 10 === 0;
}

function formatCardNumber(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 19);
  return digits.replace(/(\d{4})(?=\d)/g, '$1 ');
}

function formatExpiry(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

function isValidExpiry(expiry: string): boolean {
  const match = expiry.match(/^(\d{2})\/(\d{2})$/);
  if (!match) return false;
  const month = parseInt(match[1], 10);
  const year = parseInt(match[2], 10) + 2000;
  if (month < 1 || month > 12) return false;

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  if (year < currentYear) return false;
  if (year === currentYear && month < currentMonth) return false;
  return true;
}

export default function PaymentGatewayModal({
  visible,
  amount,
  onSuccess,
  onClose,
}: PaymentGatewayModalProps) {
  const [status, setStatus] = useState<GatewayStatus>('form');
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [declineReason, setDeclineReason] = useState('');

  const brand = detectBrand(cardNumber);

  const resetForm = () => {
    setStatus('form');
    setCardNumber('');
    setCardName('');
    setExpiry('');
    setCvv('');
    setErrors({});
    setDeclineReason('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!isValidLuhn(cardNumber)) {
      newErrors.cardNumber = 'Número de tarjeta inválido';
    }
    if (cardName.trim().length < 3) {
      newErrors.cardName = 'Ingresa el nombre del titular';
    }
    if (!isValidExpiry(expiry)) {
      newErrors.expiry = 'Fecha inválida o vencida';
    }
    if (cvv.length < 3) {
      newErrors.cvv = 'CVV inválido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePay = () => {
    if (!validate()) return;

    setStatus('processing');

    // Simula la latencia de una pasarela real
    setTimeout(() => {
      const approved = Math.random() < 0.9; // 90% de éxito

      if (approved) {
        setStatus('success');
        const last4 = cardNumber.replace(/\s/g, '').slice(-4);
        setTimeout(() => {
          onSuccess(last4);
          resetForm();
        }, 1100);
      } else {
        const reason = DECLINE_REASONS[Math.floor(Math.random() * DECLINE_REASONS.length)];
        setDeclineReason(reason);
        setStatus('error');
      }
    }, 1800);
  };

  const handleRetry = () => {
    setStatus('form');
    setDeclineReason('');
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          {status === 'form' && (
            <>
              <View style={styles.sheetHeader}>
                <View style={styles.sheetHeaderLeft}>
                  <Ionicons name="lock-closed" size={16} color={Colors.textSecondary} />
                  <Text style={styles.sheetTitle}>Pago seguro simulado</Text>
                </View>
                <Pressable onPress={handleClose} style={styles.closeButton}>
                  <Ionicons name="close" size={22} color={Colors.textSecondary} />
                </Pressable>
              </View>

              <Text style={styles.amountLabel}>Monto a cobrar</Text>
              <Text style={styles.amountValue}>S/ {amount.toFixed(2)}</Text>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Número de tarjeta</Text>
                <View style={[styles.inputContainer, errors.cardNumber && styles.inputContainerError]}>
                  <Ionicons
                    name={brand === 'visa' || brand === 'mastercard' ? 'card' : 'card-outline'}
                    size={20}
                    color={Colors.textSecondary}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    placeholder="4242 4242 4242 4242"
                    placeholderTextColor={Colors.textTertiary}
                    style={styles.textInput}
                    value={cardNumber}
                    onChangeText={(v) => setCardNumber(formatCardNumber(v))}
                    keyboardType="number-pad"
                    maxLength={23}
                  />
                </View>
                {errors.cardNumber && <Text style={styles.errorText}>{errors.cardNumber}</Text>}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Nombre del titular</Text>
                <View style={[styles.inputContainer, errors.cardName && styles.inputContainerError]}>
                  <Ionicons name="person-outline" size={20} color={Colors.textSecondary} style={styles.inputIcon} />
                  <TextInput
                    placeholder="Como aparece en la tarjeta"
                    placeholderTextColor={Colors.textTertiary}
                    style={styles.textInput}
                    value={cardName}
                    onChangeText={setCardName}
                    autoCapitalize="words"
                  />
                </View>
                {errors.cardName && <Text style={styles.errorText}>{errors.cardName}</Text>}
              </View>

              <View style={styles.row}>
                <View style={[styles.inputGroup, styles.rowItem]}>
                  <Text style={styles.inputLabel}>Vencimiento</Text>
                  <View style={[styles.inputContainer, errors.expiry && styles.inputContainerError]}>
                    <TextInput
                      placeholder="MM/AA"
                      placeholderTextColor={Colors.textTertiary}
                      style={styles.textInput}
                      value={expiry}
                      onChangeText={(v) => setExpiry(formatExpiry(v))}
                      keyboardType="number-pad"
                      maxLength={5}
                    />
                  </View>
                  {errors.expiry && <Text style={styles.errorText}>{errors.expiry}</Text>}
                </View>

                <View style={[styles.inputGroup, styles.rowItem]}>
                  <Text style={styles.inputLabel}>CVV</Text>
                  <View style={[styles.inputContainer, errors.cvv && styles.inputContainerError]}>
                    <TextInput
                      placeholder="123"
                      placeholderTextColor={Colors.textTertiary}
                      style={styles.textInput}
                      value={cvv}
                      onChangeText={(v) => setCvv(v.replace(/\D/g, '').slice(0, 4))}
                      keyboardType="number-pad"
                      maxLength={4}
                      secureTextEntry
                    />
                  </View>
                  {errors.cvv && <Text style={styles.errorText}>{errors.cvv}</Text>}
                </View>
              </View>

              <Text style={styles.testHint}>
                Modo prueba: usa cualquier número que pase la validación (ej. 4242 4242 4242 4242).
                El resultado del pago se simula de forma aleatoria.
              </Text>

              <Pressable
                style={({ pressed }) => [styles.payButton, pressed && styles.payButtonPressed]}
                onPress={handlePay}
              >
                <Ionicons name="lock-closed" size={16} color="#FFF" />
                <Text style={styles.payButtonText}>Pagar S/ {amount.toFixed(2)}</Text>
              </Pressable>
            </>
          )}

          {status === 'processing' && (
            <View style={styles.statusContainer}>
              <ActivityIndicator size="large" color={Colors.primary} />
              <Text style={styles.statusTitle}>Procesando pago...</Text>
              <Text style={styles.statusSubtitle}>Estamos confirmando con tu banco</Text>
            </View>
          )}

          {status === 'success' && (
            <View style={styles.statusContainer}>
              <Ionicons name="checkmark-circle" size={64} color={Colors.success} />
              <Text style={styles.statusTitle}>¡Pago aprobado!</Text>
              <Text style={styles.statusSubtitle}>
                Tarjeta terminada en {cardNumber.replace(/\s/g, '').slice(-4)}
              </Text>
            </View>
          )}

          {status === 'error' && (
            <View style={styles.statusContainer}>
              <Ionicons name="close-circle" size={64} color={Colors.error} />
              <Text style={styles.statusTitle}>Pago rechazado</Text>
              <Text style={styles.statusSubtitle}>{declineReason}</Text>

              <Pressable
                style={({ pressed }) => [styles.payButton, styles.retryButton, pressed && styles.payButtonPressed]}
                onPress={handleRetry}
              >
                <Ionicons name="refresh" size={16} color="#FFF" />
                <Text style={styles.payButtonText}>Intentar con otra tarjeta</Text>
              </Pressable>

              <Pressable onPress={handleClose} style={styles.cancelLink}>
                <Text style={styles.cancelLinkText}>Cancelar</Text>
              </Pressable>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 32,
    ...Platform.select({
      web: { maxWidth: 480, width: '100%', alignSelf: 'center', borderRadius: 24, marginBottom: 20 },
    }),
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sheetHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sheetTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
  },
  closeButton: {
    padding: 4,
  },
  amountLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  amountValue: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 6,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
    backgroundColor: Colors.surfaceSubtle,
  },
  inputContainerError: {
    borderColor: Colors.error,
  },
  inputIcon: {
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    color: Colors.text,
    height: '100%',
  },
  errorText: {
    fontSize: 11,
    color: Colors.error,
    marginTop: 4,
    fontWeight: '500',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  rowItem: {
    flex: 1,
  },
  testHint: {
    fontSize: 11,
    color: Colors.textTertiary,
    fontStyle: 'italic',
    marginBottom: 16,
    lineHeight: 15,
  },
  payButton: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  payButtonPressed: {
    backgroundColor: Colors.primaryDark,
  },
  payButtonText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '700',
  },
  statusContainer: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 10,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.text,
    marginTop: 8,
  },
  statusSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 12,
    width: '100%',
  },
  cancelLink: {
    marginTop: 12,
    padding: 8,
  },
  cancelLinkText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
});
