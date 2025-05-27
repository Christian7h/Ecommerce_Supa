import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useWebpay } from '../hooks/useWebpay';
import { CheckCircle, XCircle, Loader, Download } from 'lucide-react';
import { getOrder } from '../lib/supabase';
import { downloadInvoice } from '../lib/invoiceGenerator';

interface Order {
  id: string;
  status: string;
  total: number;
  created_at: string;
  shipping_address: {
    name?: string;
    email?: string;
    address?: string;
    city?: string;
    postal_code?: string;
    phone?: string;
  };
  order_items?: {
    id: string;
    quantity: number;
    price: number;
    products?: {
      name: string;
      images?: string[];
    };
  }[];
}

interface WebpayTransactionData {
  response_code: number;
  authorization_code: string;
  amount: number;
  buy_order: string;
  session_id: string;
  card_detail?: {
    card_number: string;
  };
  transaction_date: string;
}

interface PaymentResult {
  success: boolean;
  message: string;
  transactionData?: WebpayTransactionData;
}

const PaymentSuccessPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { confirmTransaction, loading } = useWebpay();
  const [result, setResult] = useState<PaymentResult | null>(null);
  const [hasProcessed, setHasProcessed] = useState(false);
  const [orderData, setOrderData] = useState<Order | null>(null);
  const [loadingInvoice, setLoadingInvoice] = useState(false);useEffect(() => {
    const token = searchParams.get('token_ws');
    
    if (!token) {
      setResult({
        success: false,
        message: 'Token de transacción no encontrado'
      });
      return;
    }

    // Evitar múltiples ejecuciones
    if (hasProcessed) {
      return;
    }

    setHasProcessed(true);

    const processPayment = async () => {
      try {
        console.log('Procesando pago con token:', token);
        const transactionData = await confirmTransaction(token);
          if (transactionData.response_code === 0) {
          setResult({
            success: true,
            message: 'Pago procesado exitosamente',
            transactionData
          });
          
          // Cargar datos de la orden para la factura
          try {
            const order = await getOrder(transactionData.buy_order);
            setOrderData(order);
          } catch (error) {
            console.error('Error al cargar orden para factura:', error);
          }
        } else {
          setResult({
            success: false,
            message: 'El pago fue rechazado. Por favor, intenta nuevamente.'
          });
        }
      } catch (error) {
        console.error('Error en processPayment:', error);
        setResult({
          success: false,
          message: error instanceof Error ? error.message : 'Error al procesar el pago'
        });
      }
    };    processPayment();
  }, [searchParams, hasProcessed, confirmTransaction]);

  const handleDownloadInvoice = async () => {
    if (!orderData || !result?.transactionData) return;
    
    setLoadingInvoice(true);
    try {
      downloadInvoice(orderData, orderData.order_items);
    } catch (error) {
      console.error('Error al generar factura:', error);
    } finally {
      setLoadingInvoice(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader className="animate-spin h-12 w-12 text-indigo-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Procesando tu pago...
          </h2>
          <p className="text-gray-600">
            Por favor espera mientras confirmamos tu transacción.
          </p>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader className="animate-spin h-12 w-12 text-indigo-600 mx-auto mb-4" />
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          {result.success ? (
            <>
              <CheckCircle className="mx-auto h-24 w-24 text-green-500 mb-6" />
              <h2 className="text-3xl font-extrabold text-gray-900 mb-4">
                ¡Pago Exitoso!
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                {result.message}
              </p>
              
              {result.transactionData && (
                <div className="bg-white rounded-lg shadow p-6 mb-8">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Detalles de la Transacción
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Monto:</span>
                      <span className="font-medium">${result.transactionData.amount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Orden:</span>
                      <span className="font-medium">{result.transactionData.buy_order}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Autorización:</span>
                      <span className="font-medium">{result.transactionData.authorization_code}</span>
                    </div>
                    {result.transactionData.card_detail && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Tarjeta:</span>
                        <span className="font-medium">****{result.transactionData.card_detail.card_number}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-500">Fecha:</span>
                      <span className="font-medium">
                        {new Date(result.transactionData.transaction_date).toLocaleString('es-CL')}
                      </span>
                    </div>
                  </div>
                </div>              )}
              
              <div className="space-y-3">
                {orderData && (
                  <button
                    onClick={handleDownloadInvoice}
                    disabled={loadingInvoice}
                    className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                  >
                    {loadingInvoice ? (
                      <Loader className="animate-spin h-4 w-4 mr-2" />
                    ) : (
                      <Download className="h-4 w-4 mr-2" />
                    )}
                    {loadingInvoice ? 'Generando...' : 'Descargar Factura'}
                  </button>
                )}
                <button
                  onClick={() => navigate('/orders')}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Ver mis pedidos
                </button>
                <button
                  onClick={() => navigate('/products')}
                  className="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Seguir comprando
                </button>
              </div>
            </>
          ) : (
            <>
              <XCircle className="mx-auto h-24 w-24 text-red-500 mb-6" />
              <h2 className="text-3xl font-extrabold text-gray-900 mb-4">
                Error en el Pago
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                {result.message}
              </p>
              
              <div className="space-y-3">
                <button
                  onClick={() => navigate('/checkout')}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Intentar nuevamente
                </button>
                <button
                  onClick={() => navigate('/cart')}
                  className="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Volver al carrito
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;
