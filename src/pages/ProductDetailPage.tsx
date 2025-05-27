import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ShoppingBag, 
  Heart, 
  Share2, 
  ChevronLeft, 
  ChevronRight,
  Star,
  StarHalf,
  Truck,
  RotateCw,
  Minus,
  Plus
} from 'lucide-react';
import { useCartStore, CartItem } from '../store/cartStore';
import { getProduct, getProducts } from '../lib/supabase';
import ProductGrid from '../components/ProductGrid';

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<any>(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentImage, setCurrentImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('');
  const { addItem } = useCartStore();
  
  useEffect(() => {
    const loadProduct = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const productData = await getProduct(id);
        setProduct(productData);
        
        // Reset state when product changes
        setCurrentImage(0);
        setQuantity(1);
        setSelectedSize('');
        
        // Load related products
        if (productData?.category_id) {
          const related = await getProducts(productData.category_id, 4);
          // Filter out current product
          setRelatedProducts(related.filter(p => p.id !== id));
        }
      } catch (error) {
        console.error('Error loading product:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadProduct();
  }, [id]);
  
  const handleAddToCart = () => {
    if (!product) return;
    
    const item: CartItem = {
      id: product.id,
      name: product.name,
      price: product.sale_price || product.price,
      image: product.images[0],
      quantity,
    };
    
    addItem(item);
  };
  
  const nextImage = () => {
    if (!product) return;
    setCurrentImage((prev) => (prev + 1) % product.images.length);
  };
  
  const prevImage = () => {
    if (!product) return;
    setCurrentImage((prev) => (prev - 1 + product.images.length) % product.images.length);
  };
  
  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };
  
  const increaseQuantity = () => {
    if (quantity < product?.stock) {
      setQuantity(quantity + 1);
    }
  };
  
  if (loading) {
    return (
      <div className="container-custom py-16">
        <div className="flex flex-col md:flex-row gap-12 animate-pulse">
          <div className="md:w-1/2">
            <div className="bg-gray-200 aspect-square rounded-lg"></div>
          </div>
          <div className="md:w-1/2">
            <div className="h-8 bg-gray-200 rounded mb-4 w-3/4"></div>
            <div className="h-6 bg-gray-200 rounded mb-6 w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded mb-2 w-full"></div>
            <div className="h-4 bg-gray-200 rounded mb-2 w-full"></div>
            <div className="h-4 bg-gray-200 rounded mb-8 w-3/4"></div>
            <div className="h-10 bg-gray-200 rounded mb-6 w-1/3"></div>
            <div className="h-12 bg-gray-200 rounded w-full"></div>
          </div>
        </div>
      </div>
    );
  }
  
  if (!product) {
    return (
      <div className="container-custom py-16 text-center">
        <h2 className="text-2xl font-bold mb-4">Product Not Found</h2>
        <p className="mb-6">The product you're looking for doesn't exist or has been removed.</p>
        <Link to="/products" className="btn-primary">
          Browse Products
        </Link>
      </div>
    );
  }
  
  const formattedPrice = new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
  }).format(product.price);
  
  const formattedSalePrice = product.sale_price
    ? new Intl.NumberFormat('es-CL', {
        style: 'currency',
        currency: 'CLP',
      }).format(product.sale_price)
    : null;
  
  // Mock data for sizes - would come from the product in a real app
  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  const rating = 4.5; // Mock rating

  return (
    <div className="fade-in">
      <div className="container-custom py-16">
        {/* Breadcrumbs */}
        <div className="mb-8">
          <nav className="flex" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-3">
              <li className="inline-flex items-center">
                <Link to="/" className="text-gray-600 hover:text-gray-900">Home</Link>
              </li>
              <li>
                <div className="flex items-center">
                  <span className="mx-2 text-gray-400">/</span>
                  <Link to="/products" className="text-gray-600 hover:text-gray-900">Products</Link>
                </div>
              </li>
              <li>
                <div className="flex items-center">
                  <span className="mx-2 text-gray-400">/</span>
                  <span className="text-gray-500">{product.name}</span>
                </div>
              </li>
            </ol>
          </nav>
        </div>
        
        <div className="flex flex-col md:flex-row gap-12">
          {/* Product Images */}
          <div className="md:w-1/2">
            <div className="relative aspect-square overflow-hidden rounded-lg mb-4">
              <img
                src={product.images[currentImage]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              
              {product.images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/70 p-2 rounded-full hover:bg-white/90 transition-colors"
                    aria-label="Previous image"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/70 p-2 rounded-full hover:bg-white/90 transition-colors"
                    aria-label="Next image"
                  >
                    <ChevronRight size={20} />
                  </button>
                </>
              )}
              
              {product.sale_price && (
                <span className="absolute top-4 left-4 bg-accent text-white text-sm font-medium px-2 py-1 rounded">
                  SALE
                </span>
              )}
            </div>
            
            {/* Thumbnail Images */}
            {product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImage(index)}
                    className={`w-20 h-20 flex-shrink-0 rounded-md overflow-hidden border-2 ${
                      currentImage === index ? 'border-black' : 'border-transparent'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {/* Product Details */}
          <div className="md:w-1/2">
            <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
            
            {/* Rating */}
            <div className="flex items-center mb-4">
              <div className="flex text-yellow-400 mr-2">
                {[...Array(Math.floor(rating))].map((_, i) => (
                  <Star key={i} size={18} fill="currentColor" />
                ))}
                {rating % 1 !== 0 && <StarHalf size={18} fill="currentColor" />}
              </div>
              <span className="text-gray-600">{rating} (24 reviews)</span>
            </div>
            
            {/* Price */}
            <div className="mb-6">
              {product.sale_price ? (
                <div className="flex items-center">
                  <span className="text-2xl font-bold text-accent mr-2">
                    {formattedSalePrice}
                  </span>
                  <span className="text-gray-500 line-through">
                    {formattedPrice}
                  </span>
                </div>
              ) : (
                <span className="text-2xl font-bold">{formattedPrice}</span>
              )}
            </div>
            
            {/* Description */}
            <div className="mb-8">
              <p className="text-gray-700 leading-relaxed">
                {product.description || 'No description available for this product.'}
              </p>
            </div>
            
            {/* Size Selection */}
            <div className="mb-6">
              <label className="block text-gray-700 font-medium mb-2">
                Select Size
              </label>
              <div className="flex flex-wrap gap-2">
                {sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`w-12 h-12 flex items-center justify-center border rounded-md transition-colors ${
                      selectedSize === size
                        ? 'border-black bg-black text-white'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Quantity */}
            <div className="mb-8">
              <label className="block text-gray-700 font-medium mb-2">
                Quantity
              </label>
              <div className="flex items-center">
                <button
                  onClick={decreaseQuantity}
                  className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-l-md"
                  disabled={quantity <= 1}
                >
                  <Minus size={16} />
                </button>
                <input
                  type="number"
                  min="1"
                  max={product.stock}
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  className="w-16 h-10 border-y border-gray-300 text-center [-moz-appearance:_textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <button
                  onClick={increaseQuantity}
                  className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-r-md"
                  disabled={quantity >= product.stock}
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>
            
            {/* Add to Cart */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <button
                onClick={handleAddToCart}
                className="btn-primary py-3 px-6 flex-1 flex items-center justify-center"
                disabled={product.stock <= 0}
              >
                <ShoppingBag size={20} className="mr-2" />
                {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
              </button>
              <button
                className="btn-secondary py-3 px-6"
                aria-label="Add to Wishlist"
              >
                <Heart size={20} />
              </button>
              <button
                className="btn-secondary py-3 px-6"
                aria-label="Share"
              >
                <Share2 size={20} />
              </button>
            </div>
            
            {/* Additional Info */}
            <div className="border-t border-gray-200 pt-6 space-y-4">
              <div className="flex items-start">
                <Truck size={20} className="mr-3 text-gray-600 mt-0.5" />
                <div>
                  <h4 className="font-medium">Free Shipping</h4>
                  <p className="text-sm text-gray-600">Free standard shipping on orders over $100</p>
                </div>
              </div>
              <div className="flex items-start">
                <RotateCw size={20} className="mr-3 text-gray-600 mt-0.5" />
                <div>
                  <h4 className="font-medium">Easy Returns</h4>
                  <p className="text-sm text-gray-600">60-day return policy for unworn items</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="mt-20">
            <h2 className="text-2xl font-bold mb-8">You May Also Like</h2>
            <ProductGrid products={relatedProducts} />
          </section>
        )}
      </div>
    </div>
  );
};

export default ProductDetailPage;