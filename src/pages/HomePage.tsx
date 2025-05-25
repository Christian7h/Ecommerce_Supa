import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import ProductGrid from '../components/ProductGrid';
import { getProducts } from '../lib/supabase';

const HomePage: React.FC = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const heroSlides = [
    {
      id: 1,
      title: "ULTRABOOST LIGHT",
      subtitle: "Experience our lightest Ultraboost ever",
      image: "https://images.pexels.com/photos/2385477/pexels-photo-2385477.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
      ctaText: "Shop Now",
      ctaLink: "/products?category=running"
    },
    {
      id: 2,
      title: "FOOTBALL COLLECTION",
      subtitle: "Gear up for the game with our latest football collection",
      image: "https://images.pexels.com/photos/274506/pexels-photo-274506.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
      ctaText: "Explore",
      ctaLink: "/products?category=football"
    },
    {
      id: 3,
      title: "ORIGINALS",
      subtitle: "Classic styles reimagined for today",
      image: "https://images.pexels.com/photos/6112015/pexels-photo-6112015.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
      ctaText: "View Collection",
      ctaLink: "/products?category=originals"
    }
  ];
  
  const categories = [
    {
      id: "men",
      name: "Men",
      image: "https://images.pexels.com/photos/7500307/pexels-photo-7500307.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
    },
    {
      id: "women",
      name: "Women",
      image: "https://images.pexels.com/photos/2885726/pexels-photo-2885726.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
    },
    {
      id: "kids",
      name: "Kids",
      image: "https://images.pexels.com/photos/8365688/pexels-photo-8365688.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
    }
  ];
  
  useEffect(() => {
    const loadFeaturedProducts = async () => {
      try {
        setLoading(true);
        // This would typically fetch products with a featured flag
        const products = await getProducts(undefined, 8);
        setFeaturedProducts(products);
      } catch (error) {
        console.error('Error loading featured products:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadFeaturedProducts();
    
    // Hero slider interval
    const slideInterval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    
    return () => clearInterval(slideInterval);
  }, []);
  
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  };
  
  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  return (
    <div className="fade-in">
      {/* Hero Slider */}
      <section className="relative h-screen max-h-[800px] overflow-hidden">
        <div className="relative h-full">
          {heroSlides.map((slide, index) => (
            <div 
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                index === currentSlide ? 'opacity-100' : 'opacity-0 pointer-events-none'
              }`}
            >
              <div className="absolute inset-0 bg-black/30 z-10"></div>
              <img 
                src={slide.image} 
                alt={slide.title} 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 z-20 flex items-center justify-center text-center">
                <div className="container-custom">
                  <h1 className="text-white text-5xl md:text-7xl font-bold mb-4">{slide.title}</h1>
                  <p className="text-white text-xl md:text-2xl mb-8">{slide.subtitle}</p>
                  <Link 
                    to={slide.ctaLink}
                    className="btn-primary text-base px-8 py-3"
                  >
                    {slide.ctaText}
                  </Link>
                </div>
              </div>
            </div>
          ))}
          
          {/* Slider controls */}
          <button 
            className="absolute left-4 top-1/2 transform -translate-y-1/2 z-30 bg-white/20 backdrop-blur-sm p-2 rounded-full text-white hover:bg-white/40 transition-colors"
            onClick={prevSlide}
            aria-label="Previous slide"
          >
            <ChevronLeft size={24} />
          </button>
          <button 
            className="absolute right-4 top-1/2 transform -translate-y-1/2 z-30 bg-white/20 backdrop-blur-sm p-2 rounded-full text-white hover:bg-white/40 transition-colors"
            onClick={nextSlide}
            aria-label="Next slide"
          >
            <ChevronRight size={24} />
          </button>
          
          {/* Indicators */}
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-30 flex space-x-3">
            {heroSlides.map((_, index) => (
              <button
                key={index}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === currentSlide ? 'bg-white' : 'bg-white/50'
                }`}
                onClick={() => setCurrentSlide(index)}
                aria-label={`Go to slide ${index + 1}`}
              ></button>
            ))}
          </div>
        </div>
      </section>
      
      {/* Categories */}
      <section className="py-16 bg-white">
        <div className="container-custom">
          <h2 className="text-3xl font-bold mb-10 text-center">Shop By Category</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {categories.map((category) => (
              <Link 
                key={category.id}
                to={`/products?category=${category.id}`} 
                className="group relative overflow-hidden rounded-lg aspect-[4/5]"
              >
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors z-10"></div>
                <img 
                  src={category.image} 
                  alt={category.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 flex items-center justify-center z-20">
                  <h3 className="text-white text-3xl font-bold">{category.name}</h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
      
      {/* Featured Products */}
      <section className="py-16 bg-gray-50">
        <div className="container-custom">
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-3xl font-bold">Featured Products</h2>
            <Link 
              to="/products" 
              className="flex items-center text-black hover:text-accent transition-colors"
            >
              View All <ArrowRight size={20} className="ml-1" />
            </Link>
          </div>
          
          <ProductGrid products={featuredProducts} loading={loading} />
        </div>
      </section>
      
      {/* Promotion Banner */}
      <section className="py-16 bg-black text-white">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-8 md:mb-0">
              <h2 className="text-4xl font-bold mb-4">JOIN OUR MEMBERSHIP PROGRAM</h2>
              <p className="text-lg mb-6">
                Get exclusive access to new products, special offers, and events. 
                Members receive free shipping on all orders.
              </p>
              <Link to="/register" className="btn bg-white text-black hover:bg-gray-200 py-3 px-8">
                Join Now
              </Link>
            </div>
            <div className="md:w-1/2 md:pl-12">
              <img 
                src="https://images.pexels.com/photos/2385477/pexels-photo-2385477.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" 
                alt="Membership Program" 
                className="w-full h-80 object-cover rounded-lg"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;