import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  Pressable,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useCartStore } from '../../store/cartStore';
import { Colors } from '../../constants/colors';

const DELIVERY_FEE = 5.0;

export default function CartScreen() {
  const items = useCartStore((state) => state.items);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const clearCart = useCartStore((state) => state.clearCart);
  const total = useCartStore((state) => state.total);

  const subtotal = total();
  const totalAmount = subtotal + DELIVERY_FEE;

  const handleCheckout = () => {
    router.push('/checkout');
  };

  const handleClearCart = () => {
    if (Platform.OS === 'web') {
      if (window.confirm('¿Estás seguro de que deseas vaciar tu carrito?')) {
        clearCart();
      }
    } else {
      Alert.alert(
        'Vaciar carrito',
        '¿Estás seguro de que deseas vaciar tu carrito?',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Vaciar', onPress: clearCart, style: 'destructive' },
        ]
      );
    }
  };

  const renderCartItem = ({ item }: { item: typeof items[0] }) => {
    const { product, quantity } = item;

    return (
      <View style={styles.cardItem}>
        <Image source={{ uri: product.image }} style={styles.productImage} />
        
        <View style={styles.infoContainer}>
          <Text style={styles.productName} numberOfLines={1}>
            {product.name}
          </Text>
          <Text style={styles.productCategory}>{product.category}</Text>
          <Text style={styles.productPrice}>S/ {(product.price * quantity).toFixed(2)}</Text>
        </View>

        <View style={styles.controlColumn}>
          <Pressable
            style={({ pressed }) => [styles.deleteButton, pressed && styles.deleteButtonPressed]}
            onPress={() => removeItem(product.id)}
            hitSlop={8}
          >
            <Ionicons name="trash-outline" size={18} color={Colors.error} />
          </Pressable>

          <View style={styles.quantitySelector}>
            <Pressable
              style={({ pressed }) => [styles.qtyButton, pressed && styles.qtyButtonPressed]}
              onPress={() => updateQuantity(product.id, quantity - 1)}
            >
              <Ionicons name="remove" size={14} color={Colors.text} />
            </Pressable>
            
            <Text style={styles.qtyText}>{quantity}</Text>

            <Pressable
              style={({ pressed }) => [styles.qtyButton, pressed && styles.qtyButtonPressed]}
              onPress={() => updateQuantity(product.id, quantity + 1)}
            >
              <Ionicons name="add" size={14} color={Colors.text} />
            </Pressable>
          </View>
        </View>
      </View>
    );
  };

  if (items.length === 0) {
    return (
      <SafeAreaView style={styles.safeContainer}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Mi Carrito</Text>
        </View>

        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconContainer}>
            <Ionicons name="basket-outline" size={80} color={Colors.primary} />
          </View>
          <Text style={styles.emptyTitle}>Tu carrito está vacío</Text>
          <Text style={styles.emptySubtitle}>
            Parece que aún no has agregado nada a tu carrito. ¡Echa un vistazo a nuestro menú!
          </Text>
          <Pressable
            style={({ pressed }) => [styles.exploreButton, pressed && styles.exploreButtonPressed]}
            onPress={() => router.push('/(tabs)')}
          >
            <Text style={styles.exploreButtonText}>Explorar Menú</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeContainer} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Mi Carrito</Text>
          <Text style={styles.itemCountText}>
            {items.reduce((sum, i) => sum + i.quantity, 0)} items
          </Text>
        </View>
        <Pressable 
          onPress={handleClearCart}
          style={({ pressed }) => [styles.clearButton, pressed && styles.clearButtonPressed]}
        >
          <Ionicons name="trash-bin-outline" size={16} color={Colors.error} />
          <Text style={styles.clearButtonText}>Vaciar</Text>
        </Pressable>
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => item.product.id}
        renderItem={renderCartItem}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />

      <View style={styles.footerContainer}>
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>S/ {subtotal.toFixed(2)}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Costo de envío</Text>
            <Text style={styles.summaryValue}>S/ {DELIVERY_FEE.toFixed(2)}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>S/ {totalAmount.toFixed(2)}</Text>
          </View>
        </View>

        <Pressable
          style={({ pressed }) => [styles.checkoutButton, pressed && styles.checkoutButtonPressed]}
          onPress={handleCheckout}
        >
          <Text style={styles.checkoutButtonText}>Proceder al pago</Text>
          <Ionicons name="arrow-forward" size={18} color="#FFF" style={styles.arrowIcon} />
        </Pressable>
      </View>
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
  itemCountText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '600',
    marginTop: 2,
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.errorLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  clearButtonPressed: {
    opacity: 0.8,
  },
  clearButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.error,
  },
  listContainer: {
    padding: 16,
    paddingBottom: 24,
  },
  cardItem: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 6,
      },
      android: { elevation: 2 },
    }),
  },
  productImage: {
    width: 68,
    height: 68,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
  },
  infoContainer: {
    flex: 1,
    marginLeft: 14,
    justifyContent: 'center',
  },
  productName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 2,
  },
  productCategory: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.primary,
  },
  controlColumn: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 68,
  },
  deleteButton: {
    padding: 4,
    backgroundColor: Colors.errorLight,
    borderRadius: 8,
  },
  deleteButtonPressed: {
    opacity: 0.6,
  },
  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    height: 30,
    backgroundColor: '#F9FAFB',
  },
  qtyButton: {
    width: 26,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyButtonPressed: {
    backgroundColor: '#E5E7EB',
  },
  qtyText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.text,
    minWidth: 18,
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    backgroundColor: Colors.background,
  },
  emptyIconContainer: {
    backgroundColor: '#FFF',
    width: 130,
    height: 130,
    borderRadius: 65,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
      },
      android: { elevation: 3 },
    }),
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 28,
  },
  exploreButton: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  exploreButtonPressed: {
    backgroundColor: Colors.primaryDark,
  },
  exploreButtonText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '700',
  },
  footerContainer: {
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 24 : 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
      },
      android: { elevation: 8 },
    }),
  },
  summaryCard: {
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 8,
  },
  totalLabel: {
    fontSize: 16,
    color: Colors.text,
    fontWeight: '700',
  },
  totalValue: {
    fontSize: 18,
    color: Colors.primary,
    fontWeight: '800',
  },
  checkoutButton: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  checkoutButtonPressed: {
    backgroundColor: Colors.primaryDark,
  },
  checkoutButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  arrowIcon: {
    marginTop: 1,
  },
});