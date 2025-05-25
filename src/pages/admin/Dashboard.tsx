import React from 'react';
import { 
  ShoppingBag, 
  Users, 
  DollarSign, 
  Package,
  ArrowUpRight,
  ArrowDownRight,
  BarChart,
  TrendingUp
} from 'lucide-react';

const Dashboard: React.FC = () => {
  // Mock data for dashboard stats
  const stats = [
    {
      title: 'Total Sales',
      value: '$12,489',
      change: '+12%',
      isPositive: true,
      period: 'vs last month',
      icon: DollarSign,
      color: 'bg-green-500',
    },
    {
      title: 'Active Customers',
      value: '854',
      change: '+7.4%',
      isPositive: true,
      period: 'vs last month',
      icon: Users,
      color: 'bg-blue-500',
    },
    {
      title: 'Products',
      value: '325',
      change: '+24',
      isPositive: true,
      period: 'new this month',
      icon: ShoppingBag,
      color: 'bg-purple-500',
    },
    {
      title: 'Pending Orders',
      value: '12',
      change: '-3',
      isPositive: false,
      period: 'vs last week',
      icon: Package,
      color: 'bg-orange-500',
    },
  ];
  
  // Mock recent orders
  const recentOrders = [
    {
      id: 'ORD-001',
      customer: 'John Doe',
      date: '2023-06-15',
      amount: '$145.00',
      status: 'Delivered',
    },
    {
      id: 'ORD-002',
      customer: 'Jane Smith',
      date: '2023-06-14',
      amount: '$289.99',
      status: 'Processing',
    },
    {
      id: 'ORD-003',
      customer: 'Robert Johnson',
      date: '2023-06-14',
      amount: '$79.95',
      status: 'Shipped',
    },
    {
      id: 'ORD-004',
      customer: 'Emily Brown',
      date: '2023-06-13',
      amount: '$324.50',
      status: 'Delivered',
    },
    {
      id: 'ORD-005',
      customer: 'Michael Wilson',
      date: '2023-06-12',
      amount: '$129.00',
      status: 'Pending',
    },
  ];
  
  // Mock top products
  const topProducts = [
    {
      id: 'PROD-001',
      name: 'Ultraboost 22',
      category: 'Running',
      sales: 128,
      revenue: '$25,600',
    },
    {
      id: 'PROD-002',
      name: 'Stan Smith',
      category: 'Originals',
      sales: 96,
      revenue: '$14,400',
    },
    {
      id: 'PROD-003',
      name: 'Tiro Track Jacket',
      category: 'Clothing',
      sales: 84,
      revenue: '$8,400',
    },
    {
      id: 'PROD-004',
      name: 'Predator Edge',
      category: 'Football',
      sales: 72,
      revenue: '$12,960',
    },
    {
      id: 'PROD-005',
      name: 'Classic Backpack',
      category: 'Accessories',
      sales: 65,
      revenue: '$3,250',
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-gray-600">Welcome to your admin dashboard</p>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <div key={stat.title} className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 text-sm">{stat.title}</p>
                <h3 className="text-2xl font-bold mt-1">{stat.value}</h3>
                <div className="flex items-center mt-2">
                  <span className={`flex items-center text-xs ${
                    stat.isPositive ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stat.isPositive ? (
                      <ArrowUpRight size={14} className="mr-1" />
                    ) : (
                      <ArrowDownRight size={14} className="mr-1" />
                    )}
                    {stat.change}
                  </span>
                  <span className="text-gray-500 text-xs ml-1">{stat.period}</span>
                </div>
              </div>
              <div className={`p-3 rounded-lg ${stat.color}`}>
                <stat.icon size={20} className="text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Orders */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold">Recent Orders</h2>
              <button className="text-sm text-blue-600 hover:text-blue-800">View All</button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                      {order.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.customer}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.amount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                        order.status === 'Shipped' ? 'bg-blue-100 text-blue-800' :
                        order.status === 'Processing' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Top Products */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold">Top Selling Products</h2>
              <button className="text-sm text-blue-600 hover:text-blue-800">View All</button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sales
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Revenue
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {topProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {product.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {product.sales} units
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {product.revenue}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      {/* Analytics Overview */}
      <div className="mt-8 bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold">Sales Analytics</h2>
          <div className="flex items-center space-x-2">
            <button className="px-3 py-1 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50">
              Weekly
            </button>
            <button className="px-3 py-1 text-sm border border-gray-300 rounded-md bg-blue-50 text-blue-700 border-blue-300">
              Monthly
            </button>
            <button className="px-3 py-1 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50">
              Yearly
            </button>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-6">
          <div className="flex-1 flex items-center justify-center h-64 bg-gray-100 rounded-lg">
            <div className="text-center">
              <BarChart size={48} className="mx-auto text-gray-400 mb-2" />
              <p className="text-gray-500">Sales chart will display here</p>
            </div>
          </div>
          
          <div className="sm:w-80 space-y-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-500">Monthly Revenue</p>
                  <h4 className="text-lg font-bold mt-1">$24,568</h4>
                </div>
                <div className="bg-green-500 p-2 rounded">
                  <TrendingUp size={16} className="text-white" />
                </div>
              </div>
              <div className="flex items-center mt-2">
                <span className="flex items-center text-xs text-green-600">
                  <ArrowUpRight size={14} className="mr-1" />
                  +8.4%
                </span>
                <span className="text-gray-500 text-xs ml-1">vs last month</span>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-500">Conversion Rate</p>
                  <h4 className="text-lg font-bold mt-1">3.6%</h4>
                </div>
                <div className="bg-red-500 p-2 rounded">
                  <TrendingUp size={16} className="text-white" />
                </div>
              </div>
              <div className="flex items-center mt-2">
                <span className="flex items-center text-xs text-red-600">
                  <ArrowDownRight size={14} className="mr-1" />
                  -1.2%
                </span>
                <span className="text-gray-500 text-xs ml-1">vs last month</span>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-500">Avg. Order Value</p>
                  <h4 className="text-lg font-bold mt-1">$92.40</h4>
                </div>
                <div className="bg-green-500 p-2 rounded">
                  <TrendingUp size={16} className="text-white" />
                </div>
              </div>
              <div className="flex items-center mt-2">
                <span className="flex items-center text-xs text-green-600">
                  <ArrowUpRight size={14} className="mr-1" />
                  +3.1%
                </span>
                <span className="text-gray-500 text-xs ml-1">vs last month</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;