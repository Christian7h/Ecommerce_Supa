import { useState, useCallback } from 'react';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';
import { createCompleteOrder, updateOrderStatus, OrderData } from '../lib/supabase';

interface ShippingAddress {
  name: string;
  email: string;
  address: string;
  city: string;
  postal_code: string;
}

interface WebpayResponse {
  url: string;
  token: string;
}

interface WebpayConfirmResponse {
  response_code: number;
  authorization_code: string;
  amount: number;
  buy_order: string;
  session_id: string;
  card_detail: {
    card_number: string;
  };
  transaction_date: string;
}

export const useWebpay = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentOrderId, setCurrentOrderId] = useState<string | null>(null);
  const { user } = useAuthStore();
  const { items: cartItems, totalPrice, clearCart } = useCartStore();

  const createTransaction = async (shippingData: ShippingAddress): Promise<void> => {
    if (!user) {
      throw new Error('Usuario no autenticado');
    }

    if (cartItems.length === 0) {
      throw new Error('El carrito está vacío');
    }

    setLoading(true);
    setError(null);

    try {
      const total = totalPrice();

      // Crear la orden en la base de datos
      const orderData: OrderData = {
        user_id: user.id,
        total,
        shipping_address: shippingData,
        status: 'pending'
      };      const orderId = await createCompleteOrder(orderData, cartItems);
      setCurrentOrderId(orderId);

      // Crear transacción en Webpay
      const response = await fetch('http://localhost:3000/api/create-transaction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: Math.round(total), // Webpay requiere enteros
          orderId // Enviar el ID de la orden para referencia
        }),
      });

      if (!response.ok) {
        throw new Error('Error al crear la transacción con Webpay');
      }

      const webpayData: WebpayResponse = await response.json();      // Guardar el token en la orden para referencia futura
      await updateOrderStatus(orderId, 'processing', webpayData.token);

      // Crear formulario para enviar a Webpay con POST
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = webpayData.url;
      
      const tokenInput = document.createElement('input');
      tokenInput.type = 'hidden';
      tokenInput.name = 'TBK_TOKEN';
      tokenInput.value = webpayData.token;
      
      form.appendChild(tokenInput);
      document.body.appendChild(form);
      form.submit();
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };
  const confirmTransaction = useCallback(async (token: string): Promise<WebpayConfirmResponse> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:3000/api/confirm-transaction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      if (!response.ok) {
        throw new Error('Error al confirmar la transacción');
      }

      const confirmData: WebpayConfirmResponse = await response.json();      // Verificar si el pago fue exitoso
      if (confirmData.response_code === 0) {
        // Pago exitoso - limpiar carrito
        clearCart();
        
        // Actualizar el estado de la orden si tenemos el buy_order
        if (confirmData.buy_order) {
          try {
            await updateOrderStatus(confirmData.buy_order, 'completed', token);
          } catch (updateError) {
            console.warn('No se pudo actualizar el estado de la orden:', updateError);
          }
        }
      } else {
        // Pago fallido
        throw new Error('El pago fue rechazado');
      }

      return confirmData;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [clearCart]);
  return {
    createTransaction,
    confirmTransaction,
    loading,
    error,
    currentOrderId,
    clearError: () => setError(null)
  };
};
