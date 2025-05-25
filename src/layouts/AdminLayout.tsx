import React, { useEffect } from 'react';
import { Outlet, Navigate, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Tag, 
  Package, 
  Settings,
  LogOut,
  Menu,
  X,
  Palette
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';

const AdminLayout: React.FC = () => {
  const { user, initialize, logout } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const location = useLocation();
  
  useEffect(() => {
    initialize();
  }, [initialize]);
  
  // Close sidebar when route changes on mobile
  useEffect(() => {
    setSidebarOpen(false);
  }, [location]);
  
  // Redirect if not authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  // Verificar si el usuario es admin
  const userRole = user.role || 'customer';
  if (userRole !== 'admin') {
    return <Navigate to="/" replace />;
  }
  
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  
  const NavItem = ({ to, icon: Icon, label }: { to: string; icon: React.ElementType; label: string }) => {
    const isActive = location.pathname === to;
    
    return (
      <Link
        to={to}
        className={`flex items-center p-3 rounded-lg transition-colors ${
          isActive 
            ? 'bg-gray-800 text-white' 
            : 'text-gray-300 hover:bg-gray-800 hover:text-white'
        }`}
      >
        <Icon size={20} className="mr-3" />
        <span>{label}</span>
      </Link>
    );
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Mobile sidebar toggle */}
      <div className="fixed top-4 left-4 z-50 md:hidden">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-md bg-gray-900 text-white"
          aria-label="Toggle Sidebar"
        >
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
      
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-gray-900 transform transition-transform duration-300 ease-in-out md:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-center h-16 bg-gray-800">
            <span className="text-xl font-bold text-white">Admin Dashboard</span>
          </div>
          
          <nav className="flex-1 px-2 py-4 space-y-2 overflow-y-auto">
            <NavItem to="/admin" icon={LayoutDashboard} label="Dashboard" />
            <NavItem to="/admin/products" icon={ShoppingBag} label="Products" />
            <NavItem to="/admin/categories" icon={Tag} label="Categories" />
            <NavItem to="/admin/orders" icon={Package} label="Orders" />
            <NavItem to="/admin/settings" icon={Settings} label="Ajustes del Sitio" />
            <NavItem to="/admin/customization" icon={Palette} label="Personalización" />
          </nav>
          
          <div className="p-4 border-t border-gray-800">
            <button
              onClick={logout}
              className="flex items-center w-full p-2 text-gray-300 rounded-md hover:bg-gray-800 hover:text-white transition-colors"
            >
              <LogOut size={20} className="mr-3" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>
      
      {/* Main content */}
      <div className={`flex-1 overflow-x-hidden overflow-y-auto md:ml-64`}>
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;