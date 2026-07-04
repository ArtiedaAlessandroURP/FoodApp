# 🍔 FoodApp

Aplicación móvil de food delivery desarrollada con **React Native + Expo**.
Proyecto Final — IF-1103 Sistemas Móviles y Plataformas Menores · Universidad Ricardo Palma · 2026-1

**Modalidad:** Opción 2 — Catálogo de proyectos (#5 App de E-commerce), adaptado al dominio de comida a domicilio.

**Autor:** Alessandro Artieda Santos — Código 202120465

---

## 📱 Funcionalidades

- **Autenticación**: registro y login con validaciones, sesión persistente (AsyncStorage)
- **Catálogo**: búsqueda, filtro por categorías, carrusel de promociones
- **Carrito de compras**: estado global reactivo (Zustand)
- **Checkout**: dirección con mapa (geocodificación real vía API de OpenStreetMap)
- **Pasarela de pago simulada**: formulario de tarjeta con validación de Luhn, resultado aleatorio aprobado/rechazado
- **Historial de pedidos** y **perfil de usuario**
- **Diseño responsivo**: se adapta a teléfono, tablet y navegador web

## 🛠️ Tecnologías

| Tecnología | Uso |
|---|---|
| Expo + React Native | Framework base multiplataforma (Android / iOS / Web) |
| TypeScript | Tipado estático |
| expo-router | Navegación basada en archivos |
| zustand | Estado global (auth, carrito) |
| @react-native-async-storage/async-storage | Persistencia local |
| Nominatim API (OpenStreetMap) | Geocodificación de direcciones |
| @expo/vector-icons | Iconografía |

## 🚀 Instalación

Requisitos previos: [Node.js](https://nodejs.org/) (v18+) y npm instalados.

```bash
# 1. Clonar el repositorio
git clone <URL-del-repositorio>
cd FoodApp

# 2. Instalar dependencias
npm install

# 3. Iniciar el proyecto
npx expo start
```

## ▶️ Cómo correrlo

Con el servidor de Expo corriendo (`npx expo start`), tienes estas opciones:

| Plataforma | Cómo abrirlo |
|---|---|
| **Web** | Presiona `w` en la terminal, o `npx expo start --web` |
| **Android (emulador)** | Abre un emulador desde Android Studio y presiona `a` |
| **Celular físico** | Instala la app **Expo Go**, escanea el código QR que aparece en la terminal |

## 📂 Estructura del proyecto

```
app/
  (tabs)/index.tsx        → Inicio (catálogo, búsqueda, promos)
  (tabs)/cart.tsx         → Carrito de compras
  (tabs)/orders.tsx       → Historial de pedidos
  (tabs)/profile.tsx      → Perfil de usuario
  product/[id].tsx        → Detalle de producto (ruta dinámica)
  checkout.tsx            → Dirección, pago y confirmación
  login.tsx / register.tsx→ Autenticación
  _layout.tsx             → Layout raíz + marco responsivo (web)

store/                    → authStore.ts, cartStore.ts (Zustand)
components/ui/            → ProductCard, MapPreview, PaymentGatewayModal
hooks/                    → useResponsive.ts
types/                    → index.ts (Product, CartItem, Order, User)
constants/                → colors.ts (paleta de diseño)
data/                     → products.ts (catálogo local)
```

## 💳 Pasarela de pago — modo prueba

El pago con tarjeta es una simulación (no procesa dinero real). Para probarlo:

- Usa cualquier número de tarjeta válido según el algoritmo de Luhn, por ejemplo: `4242 4242 4242 4242`
- Fecha de vencimiento: cualquier mes/año **futuro** (ej. `12/27`)
- CVV: cualquier número de 3 a 4 dígitos

El resultado (aprobado o rechazado) se genera de forma aleatoria (90% de aprobación) para simular el comportamiento real de una pasarela bancaria.

## 📸 Screenshots

> _Agregar aquí capturas de pantalla de: Inicio, Detalle de producto, Carrito, Checkout, Pasarela de pago, Historial de pedidos._

| Inicio | Carrito | Checkout |
|---|---|---|
| _(captura)_ | _(captura)_ | _(captura)_ |

## 👤 Autor

Alessandro Artieda Santos — Universidad Ricardo Palma — 2026-1
