import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Order } from '../../types';
import { Colors } from '../../constants/colors';
import { useCartStore } from '../../store/cartStore';

export default function OrdersScreen() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const addItem = useCartStore((state) => state.addItem);

  const loadOrders = async () => {
    try {
      setIsLoading(true);
      const ordersJson = await AsyncStorage.getItem('orders');
      if (ordersJson) {
        const parsedOrders: Order[] = JSON.parse(ordersJson);
        setOrders(parsedOrders);
      } else {
        setOrders([]);
      }
    } catch (error) {
      console.error('Error al cargar pedidos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadOrders();
    }, [])
  );

  const handleRepeatOrder = (order: Order) => {
    // Add all items from the order to the cart
    order.items.forEach((item) => {
      for (let i = 0; i < item.quantity; i++) {
        addItem(item.product);
      }
    });

    if (Platform.OS === 'web') {
      window.alert('¡Productos agregados al carrito!');
      router.push('/(tabs)/cart');
    } else {
      Alert.alert(
        '¡Pedido repetido!',
        'Los productos han sido agregados a tu carrito.',
        [
          { text: 'Seguir viendo', style: 'cancel' },
          { text: 'Ir al carrito', onPress: () => router.push('/(tabs)/cart') },
        ]
      );
    }
  };

  const getStatusBadgeStyle = (status: Order['status']) => {
    switch (status) {
      case 'preparando':
        return {
          container: styles.badgePreparing,
          text: styles.badgeTextPreparing,
          label: 'Preparando',
          icon: 'flame-outline' as const,
        };
      case 'entregado':
        return {
          container: styles.badgeDelivered,
          text: styles.badgeTextDelivered,
          label: 'Entregado',
          icon: 'checkmark-circle-outline' as const,
        };
      case 'pendiente':
      default:
        return {
          container: styles.badgePending,
          text: styles.badgeTextPending,
          label: 'Pendiente',
          icon: 'time-outline' as const,
        };
    }
  };

  const renderOrderCard = ({ item }: { item: Order }) => {
    const badge = getStatusBadgeStyle(item.status);

    return (
      <View style={styles.orderCard}>
        <View style={styles.cardHeader}>
          <View style={styles.idGroup}>
            <Text style={styles.orderNumber}>{item.id}</Text>
            <Text style={styles.orderDate}>{item.date}</Text>
          </View>
          
          <View style={[styles.statusBadge, badge.container]}>
            <Ionicons name={badge.icon} size={12} color={StyleSheet.flatten(badge.text).color} />
            <Text style={[styles.badgeTextBase, badge.text]}>{badge.label}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.itemsList}>
          {item.items.map((cartItem, idx) => (
            <View key={idx} style={styles.itemRow}>
              <Text style={styles.itemName}>
                {cartItem.quantity}x {cartItem.product.name}
              </Text>
              <Text style={styles.itemCategory}>{cartItem.product.category}</Text>
            </View>
          ))}
        </View>

        <View style={styles.divider} />

        <View style={styles.cardFooter}>
          <View style={styles.footerLeftInfo}>
            <View style={styles.addressContainer}>
              <Ionicons name="location-outline" size={13} color={Colors.textSecondary} />
              <Text style={styles.addressText} numberOfLines={1}>
                {item.address}
              </Text>
            </View>
            <Text style={styles.totalPrice}>
              S/ {item.total.toFixed(2)}
            </Text>
          </View>
          
          <Pressable
            style={({ pressed }) => [styles.repeatButton, pressed && styles.repeatButtonPressed]}
            onPress={() => handleRepeatOrder(item)}
          >
            <Ionicons name="refresh" size={14} color={Colors.primary} />
            <Text style={styles.repeatButtonText}>Repetir</Text>
          </Pressable>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeContainer} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mis Pedidos</Text>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Cargando tus pedidos...</Text>
        </View>
      ) : orders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconContainer}>
            <Ionicons name="receipt-outline" size={80} color={Colors.primary} />
          </View>
          <Text style={styles.emptyTitle}>Aún no tienes pedidos</Text>
          <Text style={styles.emptySubtitle}>
            ¿Tienes hambre? Realiza tu primera compra y dale seguimiento aquí mismo.
          </Text>
          <Pressable
            style={({ pressed }) => [styles.exploreButton, pressed && styles.exploreButtonPressed]}
            onPress={() => router.push('/')}
          >
            <Text style={styles.exploreButtonText}>Ver Menú Completo</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id}
          renderItem={renderOrderCard}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
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
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 24,
  },
  orderCard: {
    backgroundColor: '#FFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    marginBottom: 16,
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  idGroup: {
    gap: 2,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.text,
  },
  orderDate: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    gap: 4,
  },
  badgeTextBase: {
    fontSize: 11,
    fontWeight: '700',
  },
  badgePending: {
    backgroundColor: Colors.infoLight,
  },
  badgeTextPending: {
    color: Colors.info,
  },
  badgePreparing: {
    backgroundColor: Colors.warningLight,
  },
  badgeTextPreparing: {
    color: Colors.warning,
  },
  badgeDelivered: {
    backgroundColor: Colors.successLight,
  },
  badgeTextDelivered: {
    color: Colors.success,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 12,
  },
  itemsList: {
    gap: 8,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemName: {
    fontSize: 13,
    color: Colors.text,
    fontWeight: '600',
  },
  itemCategory: {
    fontSize: 10,
    color: Colors.textSecondary,
    fontWeight: '600',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    textTransform: 'uppercase',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  footerLeftInfo: {
    flex: 1,
    marginRight: 12,
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 6,
  },
  addressText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  totalPrice: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.text,
  },
  repeatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.primaryTint,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.primaryMuted,
  },
  repeatButtonPressed: {
    backgroundColor: Colors.primaryMuted,
  },
  repeatButtonText: {
    color: Colors.primary,
    fontSize: 13,
    fontWeight: '700',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
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
});