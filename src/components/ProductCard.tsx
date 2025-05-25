import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Heart } from 'lucide-react';
import { useCartStore, CartItem } from '../store/cartStore';

interface ProductProps {
  id: string;
  name: string;
  price: number;
  salePrice?: number | null;
  imageUrl: string;
  category?: string;
  isNew?: boolean;
}

const ProductCard: React.FC<ProductProps> = ({
  id,
  name,
  price,
  salePrice,
  imageUrl,
  category,
  isNew = false,
}) => {
  const { addItem } = useCartStore();
  
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const item: CartItem = {
      id,
      name,
      price: salePrice || price,
      image: imageUrl,
      quantity: 1,
    };
    
    addItem(item);
  };
  
  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price);
  
  const formattedSalePrice = salePrice
    ? new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(salePrice)
    : null;

  return (
    <Link to={`/products/${id}`} className="group">
      <div className="product-card rounded-lg overflow-hidden bg-white">
        <div className="relative aspect-[3/4] overflow-hidden">
          {/* Product image */}
          <img
            src={imageUrl}
            alt={name}
            className="w-full h-full object-cover object-center transform group-hover:scale-105 transition-transform duration-500"
          />
          
          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-2">
            {isNew && (
              <span className="bg-black text-white text-xs py-1 px-2 rounded">
                NEW
              </span>
            )}
            {salePrice && (
              <span className="bg-accent text-white text-xs py-1 px-2 rounded">
                SALE
              </span>
            )}
          </div>
          
          {/* Quick action buttons */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/30">
            <button
              onClick={handleAddToCart}
              className="btn-primary mr-2 p-2 rounded-full"
              aria-label="Add to cart"
            >
              <ShoppingBag size={20} />
            </button>
            <button
              className="bg-white text-black p-2 rounded-full hover:bg-gray-200 transition-colors"
              aria-label="Add to wishlist"
            >
              <Heart size={20} />
            </button>
          </div>
        </div>
        
        <div className="p-4">
          {category && (
            <span className="text-gray-500 text-sm uppercase tracking-wide">
              {category}
            </span>
          )}
          <h3 className="font-medium text-gray-900 mt-1 group-hover:text-accent transition-colors">
            {name}
          </h3>
          <div className="mt-2 flex items-center">
            {salePrice ? (
              <>
                <span className="text-accent font-medium">{formattedSalePrice}</span>
                <span className="ml-2 text-gray-500 line-through text-sm">
                  {formattedPrice}
                </span>
              </>
            ) : (
              <span className="font-medium">{formattedPrice}</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;