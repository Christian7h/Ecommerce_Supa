import React from 'react';
import ProductCard from './ProductCard';

// Sample data type for products (replace with your actual data types)
interface Product {
  id: string;
  name: string;
  price: number;
  salePrice?: number | null;
  images: string[];
  category?: {
    name: string;
  };
  isNew?: boolean;
}

interface ProductGridProps {
  products: Product[];
  loading?: boolean;
}

const ProductGrid: React.FC<ProductGridProps> = ({ products, loading = false }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="animate-pulse">
            <div className="bg-gray-200 aspect-[3/4] rounded-lg"></div>
            <div className="mt-4 bg-gray-200 h-4 rounded"></div>
            <div className="mt-2 bg-gray-200 h-4 w-1/2 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">No products found.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          id={product.id}
          name={product.name}
          price={product.price}
          salePrice={product.salePrice}
          imageUrl={product.images[0]}
          category={product.category?.name}
          isNew={product.isNew}
        />
      ))}
    </div>
  );
};

export default ProductGrid;