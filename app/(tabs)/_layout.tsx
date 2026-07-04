import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useCartStore } from '../../store/cartStore';
import { Colors } from '../../constants/colors';
import { View, Text, Platform } from 'react-native';

export default function TabLayout() {
  const items = useCartStore((state) => state.items);
  const cartItemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textTertiary,
        tabBarStyle: {
          backgroundColor: '#FFF',
          borderTopWidth: 1,
          borderTopColor: Colors.border,
          height: Platform.OS === 'ios' ? 88 : 64,
          paddingBottom: Platform.OS === 'ios' ? 28 : 10,
          paddingTop: 10,
          ...Platform.select({
            ios: {
              shadowColor: '#000',
              shadowOffset: { width: 0, height: -2 },
              shadowOpacity: 0.05,
              shadowRadius: 6,
            },
            android: { elevation: 8 },
            web: {
              shadowColor: '#000',
              shadowOffset: { width: 0, height: -2 },
              shadowOpacity: 0.05,
              shadowRadius: 6,
            },
          }),
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 4,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Inicio',
          tabBarIcon: ({ color, focused }) => (
            <View style={focused ? {
              backgroundColor: Colors.primaryTint,
              padding: 8,
              borderRadius: 12,
              marginTop: -8,
            } : null}>
              <Ionicons
                name={focused ? 'home' : 'home-outline'}
                size={22}
                color={color}
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: 'Pedidos',
          tabBarIcon: ({ color, focused }) => (
            <View style={focused ? {
              backgroundColor: Colors.primaryTint,
              padding: 8,
              borderRadius: 12,
              marginTop: -8,
            } : null}>
              <Ionicons
                name={focused ? 'receipt' : 'receipt-outline'}
                size={22}
                color={color}
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: 'Carrito',
          tabBarIcon: ({ color, focused }) => (
            <View style={{ position: 'relative' }}>
              <View style={focused ? {
                backgroundColor: Colors.primaryTint,
                padding: 8,
                borderRadius: 12,
                marginTop: -8,
              } : null}>
                <Ionicons
                  name={focused ? 'basket' : 'basket-outline'}
                  size={24}
                  color={color}
                />
              </View>
              {cartItemCount > 0 && (
                <View
                  style={{
                    position: 'absolute',
                    top: focused ? -10 : -4,
                    right: focused ? -2 : -6,
                    backgroundColor: Colors.primary,
                    borderRadius: 10,
                    minWidth: 18,
                    height: 18,
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderWidth: 2,
                    borderColor: '#FFF',
                  }}
                >
                  <Text
                    style={{
                      color: 'white',
                      fontSize: 9,
                      fontWeight: '800',
                      paddingHorizontal: 2,
                    }}
                  >
                    {cartItemCount > 99 ? '99+' : cartItemCount}
                  </Text>
                </View>
              )}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color, focused }) => (
            <View style={focused ? {
              backgroundColor: Colors.primaryTint,
              padding: 8,
              borderRadius: 12,
              marginTop: -8,
            } : null}>
              <Ionicons
                name={focused ? 'person' : 'person-outline'}
                size={22}
                color={color}
              />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}