import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Eye, 
  FileText, 
  X,
  Download,
  Truck,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';
import { supabase, getAllOrders } from '../../lib/supabase';
import { downloadInvoice } from '../../lib/invoiceGenerator';

interface Order {
  id: string;
  user_id: string;
  status: string;
  total: number;
  created_at: string;
  shipping_address: {
    name?: string;
    email?: string;
    address?: string;
    street?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    zip?: string;
    phone?: string;
    country?: string;
  };
}

interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price: number;
  product?: {
    name: string;
    images: string[];
  };
}

interface User {
  id: string;
  email: string;
  name?: string;
}

const OrdersAdmin: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [customer, setCustomer] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  useEffect(() => {
    fetchOrders();
  }, []);
  
  const fetchOrders = async () => {
    try {
      setLoading(true);
      console.log('Fetching orders...');
      
      const data = await getAllOrders();
      
      console.log('Orders data:', data);
      
      setOrders(data || []);
      console.log('Orders set:', data?.length || 0, 'orders');
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const openOrderDetails = async (order: Order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
    
    try {
      // Fetch order items with product details
      const { data: items, error: itemsError } = await supabase
        .from('order_items')
        .select(`
          *,
          products (name, images)
        `)
        .eq('order_id', order.id);
      
      if (itemsError) throw itemsError;
      
      setOrderItems(items || []);
      
      // Fetch customer details
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', order.user_id)
        .single();
      
      if (userError && userError.code !== 'PGRST116') {
        // PGRST116 is "row not found" - we'll just set customer to null in that case
        throw userError;
      }
      
      setCustomer(userData || null);
    } catch (error) {
      console.error('Error fetching order details:', error);
    }
  };
  
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
    setOrderItems([]);
    setCustomer(null);
  };
  
  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId);
      
      if (error) throw error;
      
      // Update local state
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status } : order
      ));
      
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status });
      }
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const handleDownloadInvoice = async (order: Order) => {
    try {
      let items = orderItems;
      
      // Si no tenemos items cargados (desde tabla principal), cargarlos
      if (!items || items.length === 0 || order.id !== selectedOrder?.id) {
        const { data: fetchedItems, error } = await supabase
          .from('order_items')
          .select(`
            *,
            products (name, images)
          `)
          .eq('order_id', order.id);
        
        if (error) throw error;
        items = fetchedItems || [];
      }
      
      // Crear objeto con la estructura esperada por el generador de facturas
      const invoiceOrder = {
        ...order,
        order_items: items
      };
      downloadInvoice(invoiceOrder, items);
    } catch (error) {
      console.error('Error al generar factura:', error);
    }
  };
  
  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return <Clock size={16} className="text-yellow-500" />;
      case 'processing':
        return <AlertCircle size={16} className="text-blue-500" />;
      case 'shipped':
        return <Truck size={16} className="text-purple-500" />;
      case 'delivered':
        return <CheckCircle size={16} className="text-green-500" />;
      case 'cancelled':
        return <X size={16} className="text-red-500" />;
      default:
        return <Clock size={16} className="text-gray-500" />;
    }
  };
  
  const getStatusClass = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };
  
  const filteredOrders = orders
    .filter(order => 
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) &&
      (statusFilter === 'all' || order.status.toLowerCase() === statusFilter.toLowerCase())
    );

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Orders</h1>
        <p className="text-gray-600">Manage and process customer orders</p>
      </div>
      
      {/* Filters */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-4 md:flex justify-between items-center">
          <div className="md:w-1/3 mb-4 md:mb-0">
            <div className="relative">
              <input
                type="text"
                placeholder="Search by order ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
          </div>
          
          <div className="flex space-x-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center">
                    Loading orders...
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center">
                    No orders found.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-medium text-blue-600">{order.id}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(order.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.shipping_address?.name || 'Unknown'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatCurrency(order.total)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusClass(order.status)}`}>
                        {getStatusIcon(order.status)}
                        <span className="ml-1">{order.status}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-3">
                        <button
                          onClick={() => openOrderDetails(order)}
                          className="text-blue-600 hover:text-blue-900"
                          title="View Order"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => handleDownloadInvoice(order)}
                          className="text-gray-600 hover:text-gray-900"
                          title="Download Invoice"
                        >
                          <FileText size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Order Details Modal */}
      {isModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black opacity-50" onClick={closeModal}></div>
            
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full z-10 relative">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold">Order Details</h2>
                  <button 
                    onClick={closeModal}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X size={24} />
                  </button>
                </div>
                
                <div className="mb-6 flex flex-col md:flex-row justify-between">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Order Information</h3>
                    <p className="text-gray-600">
                      <span className="font-medium">Order ID:</span> {selectedOrder.id}
                    </p>
                    <p className="text-gray-600">
                      <span className="font-medium">Date:</span> {formatDate(selectedOrder.created_at)}
                    </p>
                    <p className="text-gray-600">
                      <span className="font-medium">Status:</span>
                      <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusClass(selectedOrder.status)}`}>
                        {getStatusIcon(selectedOrder.status)}
                        <span className="ml-1">{selectedOrder.status}</span>
                      </span>
                    </p>
                  </div>
                  
                  <div className="mt-4 md:mt-0">
                    <h3 className="text-lg font-medium mb-2">Customer Information</h3>
                    <p className="text-gray-600">
                      <span className="font-medium">Name:</span> {selectedOrder.shipping_address?.name || 'N/A'}
                    </p>
                    <p className="text-gray-600">
                      <span className="font-medium">Email:</span> {customer?.email || 'N/A'}
                    </p>
                    <p className="text-gray-600">
                      <span className="font-medium">Phone:</span> {selectedOrder.shipping_address?.phone || 'N/A'}
                    </p>
                  </div>
                </div>
                
                <div className="mb-6">
                  <h3 className="text-lg font-medium mb-2">Shipping Address</h3>
                  <p className="text-gray-600">
                    {selectedOrder.shipping_address?.street || 'N/A'},<br />
                    {selectedOrder.shipping_address?.city || 'N/A'}, {selectedOrder.shipping_address?.state || 'N/A'} {selectedOrder.shipping_address?.zip || 'N/A'},<br />
                    {selectedOrder.shipping_address?.country || 'N/A'}
                  </p>
                </div>
                
                <div className="mb-6">
                  <h3 className="text-lg font-medium mb-3">Order Items</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Product
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Price
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Quantity
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Total
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {orderItems.map((item) => (
                          <tr key={item.id}>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="h-10 w-10 flex-shrink-0">
                                  <img
                                    className="h-10 w-10 rounded-md object-cover"
                                    src={item.product?.images?.[0] || 'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg'}
                                    alt={item.product?.name || 'Product'}
                                  />
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">
                                    {item.product?.name || `Product #${item.product_id}`}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                              {formatCurrency(item.price)}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                              {item.quantity}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                              {formatCurrency(item.price * item.quantity)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="bg-gray-50">
                          <td colSpan={3} className="px-4 py-3 text-sm font-medium text-right">
                            Total
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-bold text-gray-900">
                            {formatCurrency(selectedOrder.total)}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-3 mb-6">
                  <button
                    onClick={() => updateOrderStatus(selectedOrder.id, 'Processing')}
                    className={`px-3 py-1.5 rounded text-sm font-medium ${
                      selectedOrder.status === 'Processing' 
                        ? 'bg-blue-200 text-blue-800' 
                        : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                    }`}
                    disabled={selectedOrder.status === 'Processing'}
                  >
                    Mark as Processing
                  </button>
                  <button
                    onClick={() => updateOrderStatus(selectedOrder.id, 'Shipped')}
                    className={`px-3 py-1.5 rounded text-sm font-medium ${
                      selectedOrder.status === 'Shipped' 
                        ? 'bg-purple-200 text-purple-800' 
                        : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                    }`}
                    disabled={selectedOrder.status === 'Shipped'}
                  >
                    Mark as Shipped
                  </button>
                  <button
                    onClick={() => updateOrderStatus(selectedOrder.id, 'Delivered')}
                    className={`px-3 py-1.5 rounded text-sm font-medium ${
                      selectedOrder.status === 'Delivered' 
                        ? 'bg-green-200 text-green-800' 
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                    }`}
                    disabled={selectedOrder.status === 'Delivered'}
                  >
                    Mark as Delivered
                  </button>
                  <button
                    onClick={() => updateOrderStatus(selectedOrder.id, 'Cancelled')}
                    className={`px-3 py-1.5 rounded text-sm font-medium ${
                      selectedOrder.status === 'Cancelled' 
                        ? 'bg-red-200 text-red-800' 
                        : 'bg-red-100 text-red-700 hover:bg-red-200'
                    }`}
                    disabled={selectedOrder.status === 'Cancelled'}
                  >
                    Cancel Order
                  </button>
                </div>
                
                <div className="flex justify-between">
                  <button
                    onClick={closeModal}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => handleDownloadInvoice(selectedOrder)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
                  >
                    <Download size={16} className="mr-2" />
                    Download Invoice
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersAdmin;