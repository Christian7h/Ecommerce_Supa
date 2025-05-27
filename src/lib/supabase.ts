import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';
import type { CartItem } from '../store/cartStore';

// These would typically come from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Create a single supabase client for interacting with your database
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

export const getProducts = async (
  categoryId?: string, 
  limit = 10, 
  page = 1,
  sortBy = 'created_at',
  order: 'asc' | 'desc' = 'desc'
) => {
  const startIndex = (page - 1) * limit;
  
  let query = supabase
    .from('products')
    .select(`
      *,
      categories(*)
    `)
    .order(sortBy, { ascending: order === 'asc' })
    .range(startIndex, startIndex + limit - 1);
  
  if (categoryId) {
    query = query.eq('category_id', categoryId);
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
  
  return data;
};

export const getProduct = async (id: string) => {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      categories(*)
    `)
    .eq('id', id)
    .single();
  
  if (error) {
    console.error('Error fetching product:', error);
    throw error;
  }
  
  return data;
};

export const getCategories = async () => {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name');
  
  if (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
  
  return data;
};

// Interfaces para órdenes
export interface OrderData {
  user_id: string;
  total: number;
  shipping_address: {
    name: string;
    email: string;
    address: string;
    city: string;
    postal_code: string;
  };
  status?: string;
  payment_intent?: string;
}

export interface OrderItemData {
  order_id: string;
  product_id: string;
  quantity: number;
  price: number;
}

// Crear una nueva orden
export const createOrder = async (orderData: OrderData): Promise<string> => {
  const { data, error } = await supabase
    .from('orders')
    .insert([orderData])
    .select('id')
    .single();

  if (error) {
    console.error('Error creating order:', error);
    throw error;
  }

  return data.id;
};

// Crear items de la orden
export const createOrderItems = async (orderItems: OrderItemData[]) => {
  const { data, error } = await supabase
    .from('order_items')
    .insert(orderItems)
    .select();

  if (error) {
    console.error('Error creating order items:', error);
    throw error;
  }

  return data;
};

// Actualizar el estado de la orden
export const updateOrderStatus = async (orderId: string, status: string, paymentIntent?: string) => {
  const updateData: { status: string; payment_intent?: string } = { status };
  if (paymentIntent) {
    updateData.payment_intent = paymentIntent;
  }

  const { data, error } = await supabase
    .from('orders')
    .update(updateData)
    .eq('id', orderId)
    .select()
    .single();

  if (error) {
    console.error('Error updating order status:', error);
    throw error;
  }

  return data;
};

// Obtener orden por ID
export const getOrder = async (orderId: string) => {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      order_items (
        *,
        products (*)
      )
    `)
    .eq('id', orderId)
    .single();

  if (error) {
    console.error('Error fetching order:', error);
    throw error;
  }

  return data;
};

// Crear orden completa con items
export const createCompleteOrder = async (
  orderData: OrderData,
  cartItems: CartItem[]
): Promise<string> => {
  try {
    // Crear la orden
    const orderId = await createOrder(orderData);

    // Crear los items de la orden
    const orderItems: OrderItemData[] = cartItems.map(item => ({
      order_id: orderId,
      product_id: item.id,
      quantity: item.quantity,
      price: item.sale_price || item.price
    }));

    await createOrderItems(orderItems);

    return orderId;
  } catch (error) {
    console.error('Error creating complete order:', error);
    throw error;
  }
};

// Obtener órdenes del usuario
export const getUserOrders = async (userId: string) => {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      order_items (
        *,
        products (*)
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching user orders:', error);
    throw error;
  }

  return data;
};

// Obtener todas las órdenes (admin) - Versión simplificada temporalmente
export const getAllOrders = async () => {
  try {
    console.log('Attempting to fetch orders...');
    
    // Consulta muy simple primero, solo órdenes sin joins
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching orders (simple query):', error);
      throw error;
    }

    console.log('Orders fetched successfully:', data?.length || 0);
    return data;
  } catch (error) {
    console.error('Error in getAllOrders:', error);
    throw error;
  }
};

// Función de debug para verificar órdenes sin RLS
export const debugOrders = async () => {
  console.log('Debug: Fetching orders directly...');
  
  // Intentar con diferentes consultas
  const queries = [
    () => supabase.from('orders').select('*'),
    () => supabase.from('orders').select('id, user_id, status, total, created_at'),
    () => supabase.rpc('get_all_orders_admin') // Si tienes una función RPC
  ];

  for (let i = 0; i < queries.length; i++) {
    try {
      console.log(`Debug query ${i + 1}:`, queries[i].toString());
      const { data, error, count } = await queries[i]();
      console.log(`Query ${i + 1} result:`, { data, error, count });
      
      if (data) {
        return data;
      }
    } catch (err) {
      console.log(`Query ${i + 1} failed:`, err);
    }
  }
  
  return [];
};