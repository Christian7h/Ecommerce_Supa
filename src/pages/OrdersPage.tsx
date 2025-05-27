import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { getUserOrders } from '../lib/supabase';
import { Package, Calendar, DollarSign, Truck } from 'lucide-react';

interface Order {
  id: string;
  status: string;
  total: number;
  created_at: string;
  shipping_address: any;
  order_items: Array<{
    id: string;
    quantity: number;
    price: number;
    products: {
      id: string;
      name: string;
      images: string[];
    };
  }>;
}

const OrdersPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchOrders = async () => {
      try {
        setLoading(true);
        const userOrders = await getUserOrders(user.id);
        setOrders(userOrders as Order[]);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar las órdenes');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user, navigate]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completado';
      case 'processing':
        return 'Procesando';
      case 'pending':
        return 'Pendiente';
      case 'cancelled':
        return 'Cancelado';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando órdenes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-600">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-2 text-sm text-red-600 hover:text-red-500"
            >
              Intentar nuevamente
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Mis Órdenes</h1>
        <p className="mt-2 text-gray-600">
          Revisa el estado de tus pedidos y su historial de compras.
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-12">
          <Package className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No hay órdenes</h3>
          <p className="mt-1 text-sm text-gray-500">
            Aún no has realizado ninguna compra.
          </p>
          <div className="mt-6">
            <button
              onClick={() => navigate('/products')}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <Package className="-ml-1 mr-2 h-5 w-5" />
              Comenzar a comprar
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.id} className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Orden #{order.id.slice(-8)}
                      </p>
                      <p className="text-sm text-gray-500 flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {new Date(order.created_at).toLocaleDateString('es-CL')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                        order.status
                      )}`}
                    >
                      <Truck className="h-3 w-3 mr-1" />
                      {getStatusText(order.status)}
                    </span>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900 flex items-center">
                        <DollarSign className="h-4 w-4" />
                        {order.total.toLocaleString('es-CL', {
                          style: 'currency',
                          currency: 'CLP',
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="px-6 py-4">
                <div className="space-y-4">
                  {order.order_items.map((item) => (
                    <div key={item.id} className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <img
                          src={item.products.images[0] || 'https://via.placeholder.com/64'}
                          alt={item.products.name}
                          className="h-16 w-16 object-cover rounded-md"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {item.products.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          Cantidad: {item.quantity}
                        </p>
                      </div>
                      <div className="flex-shrink-0">
                        <p className="text-sm font-medium text-gray-900">
                          {(item.price * item.quantity).toLocaleString('es-CL', {
                            style: 'currency',
                            currency: 'CLP',
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {order.shipping_address && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">
                      Dirección de Envío
                    </h4>
                    <div className="text-sm text-gray-600">
                      <p>{order.shipping_address.name}</p>
                      <p>{order.shipping_address.address}</p>
                      <p>
                        {order.shipping_address.city}, {order.shipping_address.postal_code}
                      </p>
                      <p>{order.shipping_address.email}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
