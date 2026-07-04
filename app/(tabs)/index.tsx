import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  ScrollView,
  Pressable,
  Platform,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { products, categories } from '../../data/products';
import ProductCard from '../../components/ui/ProductCard';
import { Colors } from '../../constants/colors';
import { Category } from '../../types';
import { useAuthStore } from '../../store/authStore';
import { useResponsive } from '../../hooks/useResponsive';

const PROMOS = [
  {
    id: '1',
    title: '🔥 2x1 en Pizzas',
    subtitle: 'Todos los martes',
    color: Colors.primary,
    bg: Colors.primaryMuted,
  },
  {
    id: '2',
    title: '🚚 Envío Gratis',
    subtitle: 'En pedidos +S/ 50',
    color: '#0284C7',
    bg: Colors.infoLight,
  },
  {
    id: '3',
    title: '🆕 Nuevos Platos',
    subtitle: 'Prueba Tacos al Pastor',
    color: Colors.success,
    bg: Colors.successLight,
  },
];

export default function HomeScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'Todos'>('Todos');
  const user = useAuthStore((state) => state.user);

  // Promo auto-scroll
  const promoScrollRef = useRef<ScrollView>(null);
  const [promoIndex, setPromoIndex] = useState(0);
  const { appWidth } = useResponsive();
  const [carouselWidth, setCarouselWidth] = useState(appWidth);

  useEffect(() => {
    const timer = setInterval(() => {
      setPromoIndex((prev) => {
        const next = (prev + 1) % PROMOS.length;
        promoScrollRef.current?.scrollTo({ x: next * carouselWidth, animated: true });
        return next;
      });
    }, 4000);
    return () => clearInterval(timer);
  }, [carouselWidth]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesCategory =
        selectedCategory === 'Todos' || product.category === selectedCategory;
      const matchesSearch =
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, selectedCategory]);

  const handleCategoryPress = (category: Category | 'Todos') => {
    setSelectedCategory(category);
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      {/* Brand Header */}
      <View style={styles.brandRow}>
        <View style={styles.logoContainer}>
          <View style={styles.logoIcon}>
            <Ionicons name="fast-food" size={24} color="#FFF" />
          </View>
          <Text style={styles.brandName}>Food<Text style={{ color: Colors.primary }}>App</Text></Text>
        </View>
        <Pressable
          style={({ pressed }) => [styles.profileButton, pressed && styles.headerButtonPressed]}
          onPress={() => {
            if (user) {
              router.push('/(tabs)/profile');
            } else {
              router.push('/login');
            }
          }}
        >
          {user ? (
            <View style={styles.avatarMini}>
              <Text style={styles.avatarMiniText}>{user.name.charAt(0).toUpperCase()}</Text>
            </View>
          ) : (
            <Ionicons name="person" size={20} color={Colors.text} />
          )}
        </Pressable>
      </View>

      {/* Tagline */}
      <View style={styles.taglineSection}>
        {user ? (
          <>
            <Text style={styles.taglineText}>Hola, <Text style={styles.taglineHighlightInline}>{user.name.split(' ')[0]}</Text> 👋</Text>
            <Text style={styles.taglineHighlight}>¿Qué pedimos hoy?</Text>
          </>
        ) : (
          <>
            <Text style={styles.taglineText}>¿Qué se te antoja</Text>
            <Text style={styles.taglineHighlight}>comer hoy?</Text>
          </>
        )}
      </View>

      {/* Promo Banner Carousel */}
      <ScrollView
        ref={promoScrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        style={styles.promoScroll}
        scrollEventThrottle={16}
        onLayout={(e) => setCarouselWidth(e.nativeEvent.layout.width)}
      >
        {PROMOS.map((promo) => (
          <View
            key={promo.id}
            style={[styles.promoBanner, { backgroundColor: promo.bg, width: carouselWidth - 32 }]}
          >
            <View style={styles.promoContent}>
              <Text style={[styles.promoTitle, { color: promo.color }]}>{promo.title}</Text>
              <Text style={[styles.promoSubtitle, { color: promo.color }]}>{promo.subtitle}</Text>
            </View>
            <View style={[styles.promoDecoration, { backgroundColor: promo.color }]} />
          </View>
        ))}
      </ScrollView>
      <View style={styles.promoDots}>
        {PROMOS.map((_, i) => (
          <View key={i} style={[styles.dot, promoIndex === i && styles.dotActive]} />
        ))}
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color={Colors.textSecondary} style={styles.searchIcon} />
        <TextInput
          placeholder="Buscar tu plato favorito..."
          placeholderTextColor={Colors.textSecondary}
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <Pressable onPress={clearSearch} style={styles.clearSearchButton}>
            <Ionicons name="close-circle" size={18} color={Colors.textSecondary} />
          </Pressable>
        )}
      </View>

      {/* Categories */}
      <View style={styles.categoriesSection}>
        <Text style={styles.sectionTitle}>Categorías</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesList}
        >
          <Pressable
            style={[
              styles.categoryPill,
              selectedCategory === 'Todos' && styles.categoryPillActive,
            ]}
            onPress={() => handleCategoryPress('Todos')}
          >
            <Ionicons
              name="restaurant-outline"
              size={14}
              color={selectedCategory === 'Todos' ? '#FFF' : Colors.text}
            />
            <Text
              style={[
                styles.categoryText,
                selectedCategory === 'Todos' && styles.categoryTextActive,
              ]}
            >
              Todos
            </Text>
          </Pressable>

          {categories.map((category) => {
            let iconName: any = 'pizza-outline';
            if (category === 'Burgers') iconName = 'fast-food-outline';
            if (category === 'Postres') iconName = 'ice-cream-outline';
            if (category === 'Bebidas') iconName = 'beer-outline';
            if (category === 'Ensaladas') iconName = 'nutrition-outline';

            return (
              <Pressable
                key={category}
                style={[
                  styles.categoryPill,
                  selectedCategory === category && styles.categoryPillActive,
                ]}
                onPress={() => handleCategoryPress(category)}
              >
                <Ionicons
                  name={iconName}
                  size={14}
                  color={selectedCategory === category ? '#FFF' : Colors.text}
                />
                <Text
                  style={[
                    styles.categoryText,
                    selectedCategory === category && styles.categoryTextActive,
                  ]}
                >
                  {category}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* Menu Header */}
      <View style={styles.menuTitleRow}>
        <Text style={styles.sectionTitle}>Nuestro Menú</Text>
        <Text style={styles.resultsCount}>
          {filteredProducts.length} {filteredProducts.length === 1 ? 'plato' : 'platos'}
        </Text>
      </View>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="search-outline" size={64} color={Colors.textSecondary} />
      <Text style={styles.emptyTitle}>No se encontraron platos</Text>
      <Text style={styles.emptySubtitle}>
        Intenta buscar algo diferente o cambia la categoría seleccionada.
      </Text>
      {(searchQuery !== '' || selectedCategory !== 'Todos') && (
        <Pressable
          style={styles.resetButton}
          onPress={() => {
            setSearchQuery('');
            setSelectedCategory('Todos');
          }}
        >
          <Text style={styles.resetButtonText}>Ver todo el menú</Text>
        </Pressable>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.safeContainer} edges={['top']}>
      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ProductCard product={item} />}
        numColumns={2}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={styles.listContainer}
        columnWrapperStyle={styles.columnWrapper}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  listContainer: {
    paddingBottom: 24,
  },
  columnWrapper: {
    paddingHorizontal: 8,
    justifyContent: 'space-between',
  },
  headerContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  brandRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoIcon: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandName: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.text,
    letterSpacing: -0.5,
  },
  profileButton: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: { elevation: 2 },
      web: { cursor: 'pointer' },
    }),
  },
  headerButtonPressed: {
    backgroundColor: '#F3F4F6',
  },
  avatarMini: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarMiniText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '800',
  },
  taglineSection: {
    marginBottom: 20,
  },
  taglineText: {
    fontSize: 26,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  taglineHighlightInline: {
    color: Colors.primary,
    fontWeight: '800',
  },
  taglineHighlight: {
    fontSize: 32,
    color: Colors.text,
    fontWeight: '800',
    marginTop: -2,
  },
  // Promo
  promoScroll: {
    marginBottom: 8,
    marginHorizontal: -16,
  },
  promoBanner: {
    marginHorizontal: 16,
    borderRadius: 18,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
    minHeight: 80,
  },
  promoContent: {
    flex: 1,
    zIndex: 2,
  },
  promoTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 4,
  },
  promoSubtitle: {
    fontSize: 13,
    fontWeight: '600',
    opacity: 0.8,
  },
  promoDecoration: {
    position: 'absolute',
    right: -20,
    top: -20,
    width: 100,
    height: 100,
    borderRadius: 50,
    opacity: 0.1,
  },
  promoDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 20,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.border,
  },
  dotActive: {
    backgroundColor: Colors.primary,
    width: 18,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 16,
    paddingHorizontal: 14,
    height: 52,
    marginBottom: 24,
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
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: Colors.text,
    height: '100%',
    outlineStyle: 'none',
  } as any,
  clearSearchButton: {
    padding: 4,
  },
  categoriesSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 14,
  },
  categoriesList: {
    gap: 8,
    paddingRight: 16,
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 4,
      },
      android: { elevation: 1 },
      web: { cursor: 'pointer' },
    }),
  },
  categoryPillActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  categoryText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text,
  },
  categoryTextActive: {
    color: '#FFF',
  },
  menuTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  resultsCount: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingTop: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  resetButton: {
    backgroundColor: '#FFF',
    borderColor: Colors.primary,
    borderWidth: 1.5,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  resetButtonText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '700',
  },
});