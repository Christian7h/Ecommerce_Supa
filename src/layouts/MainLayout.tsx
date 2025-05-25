import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useAuthStore } from '../store/authStore';

const MainLayout: React.FC = () => {
  const { initialize } = useAuthStore();
  
  useEffect(() => {
    // Initialize authentication state
    initialize();
  }, [initialize]);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow pt-20">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;