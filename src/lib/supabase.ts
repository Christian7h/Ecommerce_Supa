import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';

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