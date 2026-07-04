import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Pressable,
  ScrollView,
  Platform,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { products } from '../../data/products';
import { useCartStore } from '../../store/cartStore';
import { Colors } from '../../constants/colors';
import ProductCard from '../../components/ui/ProductCard';
import { useResponsive } from '../../hooks/useResponsive';

export default function ProductDetailScreen() {
  const { appWidth } = useResponsive();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showToast, setShowToast] = useState(false);
  
  const addItem = useCartStore((state) => state.addItem);
  const items = useCartStore((state) => state.items);

  const product = products.find((p) => p.id === id);

  const qtyInCart = useMemo(() => {
    const item = items.find((i) => i.product.id === id);
    return item ? item.quantity : 0;
  }, [items, id]);

  const relatedProducts = useMemo(() => {
    if (!product) return [];
    return products
      .filter((p) => p.category === product.category && p.id !== product.id)
      .slice(0, 4); // Show up to 4 related products
  }, [product]);

  if (!product) {
    return (
      <SafeAreaView style={styles.safeContainer}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={Colors.text} />
          </Pressable>
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={60} color={Colors.error} />
          <Text style={styles.errorText}>Producto no encontrado</Text>
          <Pressable style={styles.errorBtn} onPress={() => router.push('/')}>
            <Text style={styles.errorBtnText}>Volver al menú</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addItem(product);
    }
    
    // Show toast instead of immediate back
    setShowToast(true);
    setQuantity(1); // Reset quantity selector
    
    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };

  const handleGoToCart = () => {
    router.push('/(tabs)/cart');
  };

  return (
    <SafeAreaView style={styles.safeContainer} edges={['top', 'bottom']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Header absolute icons */}
        <View style={styles.headerOverlay}>
          <Pressable
            style={({ pressed }) => [styles.iconButton, pressed && styles.iconButtonPressed]}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={Colors.text} />
          </Pressable>
          
          <Pressable
            style={({ pressed }) => [styles.iconButton, pressed && styles.iconButtonPressed]}
            onPress={() => setIsFavorite(!isFavorite)}
          >
            <Ionicons
              name={isFavorite ? 'heart' : 'heart-outline'}
              size={24}
              color={isFavorite ? Colors.error : Colors.text}
            />
          </Pressable>
        </View>

        {/* Hero Image */}
        <View style={styles.imageWrapper}>
          <Image
            source={{ uri: product.image }}
            style={styles.image}
            resizeMode="cover"
          />
          <View style={styles.imageGradient} />
        </View>

        {/* Content */}
        <View style={styles.detailsContainer}>
          {/* Badges row */}
          <View style={styles.badgesRow}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryBadgeText}>{product.category}</Text>
            </View>
            
            <View style={styles.ratingBadge}>
              <Ionicons name="star" size={14} color="#FFB000" />
              <Text style={styles.ratingText}>{product.rating}</Text>
            </View>
            
            <View style={styles.timeBadge}>
              <Ionicons name="time-outline" size={14} color={Colors.textSecondary} />
              <Text style={styles.timeText}>{product.preparationTime} min</Text>
            </View>
          </View>

          {/* Title & Price */}
          <View style={styles.titleRow}>
            <Text style={styles.productName}>{product.name}</Text>
            <Text style={styles.productPrice}>S/ {product.price.toFixed(2)}</Text>
          </View>

          {/* Description */}
          <Text style={styles.sectionTitle}>Descripción</Text>
          <Text style={styles.descriptionText}>{product.description}</Text>
          
          {/* Ingredients (Mock) */}
          <View style={styles.ingredientsSection}>
            <Text style={styles.sectionTitle}>Ingredientes principales</Text>
            <View style={styles.ingredientsRow}>
              {['Tomate', 'Queso', 'Albahaca'].map((ing, i) => (
                <View key={i} style={styles.ingredientPill}>
                  <Text style={styles.ingredientText}>{ing}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <View style={styles.relatedSection}>
              <Text style={styles.sectionTitle}>También te podría gustar</Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.relatedScroll}
              >
                {relatedProducts.map((p) => (
                  <View key={p.id} style={[styles.relatedCardWrapper, { width: appWidth * 0.45 }]}>
                    <ProductCard product={p} />
                  </View>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Bottom spacer for absolute footer */}
          <View style={{ height: 100 }} />
        </View>
      </ScrollView>

      {/* Floating Action Footer */}
      <View style={styles.footer}>
        <View style={styles.quantitySelector}>
          <Pressable
            style={({ pressed }) => [styles.qtyBtn, pressed && styles.qtyBtnPressed]}
            onPress={() => setQuantity(Math.max(1, quantity - 1))}
          >
            <Ionicons name="remove" size={20} color={Colors.text} />
          </Pressable>
          <Text style={styles.qtyText}>{quantity}</Text>
          <Pressable
            style={({ pressed }) => [styles.qtyBtn, pressed && styles.qtyBtnPressed]}
            onPress={() => setQuantity(quantity + 1)}
          >
            <Ionicons name="add" size={20} color={Colors.text} />
          </Pressable>
        </View>

        <Pressable
          style={({ pressed }) => [styles.addToCartBtn, pressed && styles.addToCartBtnPressed]}
          onPress={handleAddToCart}
        >
          <Text style={styles.addToCartText}>Agregar (S/ {(product.price * quantity).toFixed(2)})</Text>
          {qtyInCart > 0 && (
            <View style={styles.qtyInCartBadge}>
              <Text style={styles.qtyInCartText}>{qtyInCart}</Text>
            </View>
          )}
        </Pressable>
      </View>

      {/* Success Toast */}
      {showToast && (
        <View style={styles.toastContainer}>
          <View style={styles.toastContent}>
            <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
            <Text style={styles.toastText}>¡Agregado al carrito!</Text>
          </View>
          <Pressable style={styles.toastAction} onPress={handleGoToCart}>
            <Text style={styles.toastActionText}>Ver carrito</Text>
          </Pressable>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  scrollContent: {
    flexGrow: 1,
  },
  headerOverlay: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 10,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: { elevation: 2 },
      web: { cursor: 'pointer' },
    }),
  },
  iconButtonPressed: {
    backgroundColor: '#E5E7EB',
  },
  imageWrapper: {
    width: '100%',
    height: 300,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 40,
    backgroundColor: '#FFF',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  detailsContainer: {
    backgroundColor: '#FFF',
    marginTop: -30,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  badgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  categoryBadge: {
    backgroundColor: Colors.primaryTint,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryBadgeText: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFF8E6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  ratingText: {
    color: '#FF9E00',
    fontSize: 13,
    fontWeight: '700',
  },
  timeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.surfaceSubtle,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  timeText: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
    gap: 16,
  },
  productName: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.text,
    flex: 1,
    lineHeight: 28,
  },
  productPrice: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.primary,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 22,
    marginBottom: 24,
  },
  ingredientsSection: {
    marginBottom: 28,
  },
  ingredientsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  ingredientPill: {
    backgroundColor: Colors.surfaceSubtle,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  ingredientText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  relatedSection: {
    marginTop: 8,
  },
  relatedScroll: {
    paddingVertical: 12,
    marginHorizontal: -8,
  },
  relatedCardWrapper: {
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 32 : 16,
    flexDirection: 'row',
    gap: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
      },
      android: { elevation: 10 },
    }),
  },
  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surfaceSubtle,
    borderRadius: 16,
    width: 120,
    height: 54,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  qtyBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    backgroundColor: '#FFF',
  },
  qtyBtnPressed: {
    backgroundColor: '#E5E7EB',
  },
  qtyText: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.text,
  },
  addToCartBtn: {
    flex: 1,
    backgroundColor: Colors.primary,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  addToCartBtnPressed: {
    backgroundColor: Colors.primaryDark,
  },
  addToCartText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  qtyInCartBadge: {
    backgroundColor: '#FFF',
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyInCartText: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: '800',
  },
  toastContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    left: 20,
    right: 20,
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 100,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: { elevation: 6 },
    }),
  },
  toastContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  toastText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  toastAction: {
    backgroundColor: '#333',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  toastActionText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginTop: 16,
    marginBottom: 24,
  },
  errorBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  errorBtnText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
