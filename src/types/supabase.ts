export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          image_url: string | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          image_url?: string | null
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          image_url?: string | null
          created_at?: string
          updated_at?: string | null
        }
      }
      products: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          price: number
          sale_price: number | null
          stock: number
          images: string[]
          category_id: string
          featured: boolean
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          price: number
          sale_price?: number | null
          stock: number
          images: string[]
          category_id: string
          featured?: boolean
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          price?: number
          sale_price?: number | null
          stock?: number
          images?: string[]
          category_id?: string
          featured?: boolean
          created_at?: string
          updated_at?: string | null
        }
      }
      orders: {
        Row: {
          id: string
          user_id: string
          status: string
          total: number
          created_at: string
          updated_at: string | null
          shipping_address: Json | null
          payment_intent: string | null
        }
        Insert: {
          id?: string
          user_id: string
          status: string
          total: number
          created_at?: string
          updated_at?: string | null
          shipping_address?: Json | null
          payment_intent?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          status?: string
          total?: number
          created_at?: string
          updated_at?: string | null
          shipping_address?: Json | null
          payment_intent?: string | null
        }
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          product_id: string
          quantity: number
          price: number
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          product_id: string
          quantity: number
          price: number
          created_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          product_id?: string
          quantity?: number
          price?: number
          created_at?: string
        }
      }
      site_settings: {
        Row: {
          id: string
          key: string
          value: Json
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          key: string
          value: Json
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          key?: string
          value?: Json
          created_at?: string
          updated_at?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}