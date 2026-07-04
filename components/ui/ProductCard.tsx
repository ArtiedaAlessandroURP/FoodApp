import React from 'react';
import { View, Text, Image, StyleSheet, Pressable, Platform } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Product } from '../../types';
import { useCartStore } from '../../store/cartStore';
import { Colors } from '../../constants/colors';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem);
  const items = useCartStore((state) => state.items);
  
  // Verificar si el producto ya está en el carrito y obtener la cantidad
  const cartItem = items.find((i) => i.product.id === product.id);
  const qtyInCart = cartItem ? cartItem.quantity : 0;

  const handlePress = () => {
    router.push(`/product/${product.id}`);
  };

  const handleAddToCart = (e: any) => {
    if (e && e.stopPropagation) {
      e.stopPropagation();
    }
    addItem(product);
  };

  return (
    <Pressable
      style={({ pressed }) => [
        styles.cardContainer,
        pressed && styles.cardPressed,
      ]}
      onPress={handlePress}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: product.image }}
          style={styles.image}
          resizeMode="cover"
        />
        
        {/* Badge (Nuevo/Popular) */}
        {product.badge && (
          <View style={[styles.badge, product.badge === 'nuevo' ? styles.badgeNew : styles.badgePopular]}>
            <Text style={styles.badgeText}>{product.badge === 'nuevo' ? 'NUEVO' : 'POPULAR'}</Text>
          </View>
        )}

        <View style={styles.timeBadge}>
          <Ionicons name="time-outline" size={12} color="#FFF" />
          <Text style={styles.timeText}>{product.preparationTime} min</Text>
        </View>
      </View>

      <View style={styles.infoContainer}>
        <View style={styles.ratingRow}>
          <Text style={styles.categoryText}>{product.category}</Text>
          <View style={styles.ratingBadge}>
            <Ionicons name="star" size={12} color="#FFB000" />
            <Text style={styles.ratingText}>{product.rating}</Text>
          </View>
        </View>

        <Text style={styles.nameText} numberOfLines={1}>
          {product.name}
        </Text>

        <Text style={styles.descriptionText} numberOfLines={2}>
          {product.description}
        </Text>

        <View style={styles.footerRow}>
          <Text style={styles.priceText}>
            S/ {product.price.toFixed(2)}
          </Text>
          <Pressable
            style={({ pressed }) => [
              styles.addButton,
              pressed && styles.addButtonPressed,
              qtyInCart > 0 && styles.addButtonActive
            ]}
            onPress={handleAddToCart}
            hitSlop={8}
          >
            {qtyInCart > 0 ? (
              <Text style={styles.qtyBadgeText}>{qtyInCart}</Text>
            ) : (
              <Ionicons name="add" size={20} color="#FFF" />
            )}
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: Colors.card,
    borderRadius: 18,
    overflow: 'hidden',
    marginBottom: 16,
    flex: 1,
    marginHorizontal: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Platform.select({
      ios: {
        shadowColor: '#1A1A1A',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
      web: {
        shadowColor: '#1A1A1A',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        cursor: 'pointer',
      },
    }),
  },
  cardPressed: {
    opacity: Platform.OS === 'ios' ? 0.9 : 1,
    transform: [{ scale: 0.98 }],
  },
  imageContainer: {
    position: 'relative',
    height: 130,
    width: '100%',
    backgroundColor: '#F3F4F6',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  badge: {
    position: 'absolute',
    top: 8,
    left: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeNew: {
    backgroundColor: Colors.success,
  },
  badgePopular: {
    backgroundColor: Colors.warning,
  },
  badgeText: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  timeBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(26, 26, 26, 0.75)',
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '600',
  },
  infoContainer: {
    padding: 12,
    flex: 1,
    justifyContent: 'space-between',
  },
  ratingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  categoryText: {
    color: Colors.textSecondary,
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8E6',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    gap: 2,
  },
  ratingText: {
    color: '#FF9E00',
    fontSize: 11,
    fontWeight: '700',
  },
  nameText: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  descriptionText: {
    color: Colors.textSecondary,
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 10,
    height: 32,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  priceText: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: '800',
  },
  addButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      web: {
        transition: 'all 0.2s ease',
      },
    }),
  },
  addButtonActive: {
    backgroundColor: Colors.primaryDark,
  },
  addButtonPressed: {
    transform: [{ scale: 0.95 }],
  },
  qtyBadgeText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '800',
  },
});
