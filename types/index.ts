export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: Category;
  rating: number;
  preparationTime: number;
  badge?: 'nuevo' | 'popular';
}

export type Category = 'Pizzas' | 'Burgers' | 'Postres' | 'Bebidas' | 'Ensaladas';

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  date: string;
  status: 'pendiente' | 'preparando' | 'entregado';
  address: string;
  paymentMethod?: 'tarjeta' | 'yape_plin' | 'efectivo';
  paymentDetail?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
}