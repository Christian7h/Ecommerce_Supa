import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Filter, 
  SlidersHorizontal, 
  ChevronDown, 
  X,
  ChevronUp
} from 'lucide-react';
import ProductGrid from '../components/ProductGrid';
import { getProducts, getCategories } from '../lib/supabase';

const ProductsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterOpen, setFilterOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<{ [key: string]: string | null }>({
    category: searchParams.get('category'),
    sort: searchParams.get('sort') || 'newest',
    priceRange: searchParams.get('priceRange'),
  });
  
  // Category filter from URL
  const categoryParam = searchParams.get('category');
  
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Load categories for filter
        const categoriesData = await getCategories();
        setCategories(categoriesData);
        
        // Determine sort parameters
        let sortField = 'created_at';
        let sortOrder: 'asc' | 'desc' = 'desc';
        
        if (activeFilters.sort === 'price-low') {
          sortField = 'price';
          sortOrder = 'asc';
        } else if (activeFilters.sort === 'price-high') {
          sortField = 'price';
          sortOrder = 'desc';
        } else if (activeFilters.sort === 'name') {
          sortField = 'name';
          sortOrder = 'asc';
        }
        
        // Load products with filters
        const productsData = await getProducts(
          activeFilters.category || undefined,
          20,
          1,
          sortField,
          sortOrder
        );
        
        setProducts(productsData);
      } catch (error) {
        console.error('Error loading products:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [activeFilters]);
  
  const toggleFilter = () => {
    setFilterOpen(!filterOpen);
  };
  
  const applyFilter = (type: string, value: string | null) => {
    const newFilters = { ...activeFilters, [type]: value };
    setActiveFilters(newFilters);
    
    // Update URL params
    const newSearchParams = new URLSearchParams();
    
    Object.entries(newFilters).forEach(([key, val]) => {
      if (val) newSearchParams.set(key, val);
    });
    
    setSearchParams(newSearchParams);
  };
  
  const clearFilters = () => {
    setActiveFilters({
      category: null,
      sort: 'newest',
      priceRange: null,
    });
    setSearchParams(new URLSearchParams());
  };
  
  const isCategorySelected = (id: string) => activeFilters.category === id;
  
  const getCategoryLabel = () => {
    if (!activeFilters.category) return 'All Categories';
    
    const category = categories.find(cat => cat.id === activeFilters.category);
    return category ? category.name : 'All Categories';
  };
  
  const getSortLabel = () => {
    switch (activeFilters.sort) {
      case 'newest':
        return 'Newest';
      case 'price-low':
        return 'Price: Low to High';
      case 'price-high':
        return 'Price: High to Low';
      case 'name':
        return 'Name: A-Z';
      default:
        return 'Newest';
    }
  };
  
  const [expandedSections, setExpandedSections] = useState({
    categories: true,
    price: true,
  });
  
  const toggleSection = (section: string) => {
    setExpandedSections({
      ...expandedSections,
      [section]: !expandedSections[section],
    });
  };

  return (
    <div className="fade-in">
      <div className="bg-gray-100 py-8">
        <div className="container-custom">
          <h1 className="text-4xl font-bold mb-4">
            {categoryParam 
              ? `${categoryParam.charAt(0).toUpperCase() + categoryParam.slice(1)}'s Collection` 
              : 'All Products'}
          </h1>
          <p className="text-gray-600 mb-6">
            {categoryParam
              ? `Browse our latest ${categoryParam}'s products`
              : 'Browse our entire collection of products'}
          </p>
          
          {/* Mobile Filter Controls */}
          <div className="md:hidden flex items-center justify-between mb-6">
            <button
              onClick={toggleFilter}
              className="flex items-center px-4 py-2 border border-gray-300 rounded-md bg-white"
            >
              <Filter size={18} className="mr-2" />
              Filters
            </button>
            
            <div className="relative group">
              <button className="flex items-center px-4 py-2 border border-gray-300 rounded-md bg-white">
                <SlidersHorizontal size={18} className="mr-2" />
                {getSortLabel()}
              </button>
              
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg z-10 invisible group-hover:visible">
                <div className="py-1">
                  <button
                    onClick={() => applyFilter('sort', 'newest')}
                    className={`block w-full text-left px-4 py-2 text-sm ${
                      activeFilters.sort === 'newest' ? 'bg-gray-100 font-medium' : ''
                    }`}
                  >
                    Newest
                  </button>
                  <button
                    onClick={() => applyFilter('sort', 'price-low')}
                    className={`block w-full text-left px-4 py-2 text-sm ${
                      activeFilters.sort === 'price-low' ? 'bg-gray-100 font-medium' : ''
                    }`}
                  >
                    Price: Low to High
                  </button>
                  <button
                    onClick={() => applyFilter('sort', 'price-high')}
                    className={`block w-full text-left px-4 py-2 text-sm ${
                      activeFilters.sort === 'price-high' ? 'bg-gray-100 font-medium' : ''
                    }`}
                  >
                    Price: High to Low
                  </button>
                  <button
                    onClick={() => applyFilter('sort', 'name')}
                    className={`block w-full text-left px-4 py-2 text-sm ${
                      activeFilters.sort === 'name' ? 'bg-gray-100 font-medium' : ''
                    }`}
                  >
                    Name: A-Z
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="container-custom py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar Filters - Desktop */}
          <aside className="hidden md:block w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold">Filters</h2>
                <button 
                  onClick={clearFilters} 
                  className="text-sm text-gray-500 hover:text-black"
                >
                  Clear All
                </button>
              </div>
              
              {/* Categories */}
              <div className="mb-6 border-b pb-6">
                <div 
                  className="flex justify-between items-center mb-4 cursor-pointer"
                  onClick={() => toggleSection('categories')}
                >
                  <h3 className="font-medium">Categories</h3>
                  {expandedSections.categories ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </div>
                
                {expandedSections.categories && (
                  <div className="space-y-2">
                    <button
                      onClick={() => applyFilter('category', null)}
                      className={`block w-full text-left py-1 ${
                        !activeFilters.category ? 'font-medium' : 'text-gray-600'
                      }`}
                    >
                      All Categories
                    </button>
                    {categories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => applyFilter('category', category.id)}
                        className={`block w-full text-left py-1 ${
                          isCategorySelected(category.id) ? 'font-medium' : 'text-gray-600'
                        }`}
                      >
                        {category.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Price Range */}
              <div className="mb-6 border-b pb-6">
                <div 
                  className="flex justify-between items-center mb-4 cursor-pointer"
                  onClick={() => toggleSection('price')}
                >
                  <h3 className="font-medium">Price Range</h3>
                  {expandedSections.price ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </div>
                
                {expandedSections.price && (
                  <div className="space-y-2">
                    <button
                      onClick={() => applyFilter('priceRange', null)}
                      className={`block w-full text-left py-1 ${
                        !activeFilters.priceRange ? 'font-medium' : 'text-gray-600'
                      }`}
                    >
                      All Prices
                    </button>
                    <button
                      onClick={() => applyFilter('priceRange', 'under-50')}
                      className={`block w-full text-left py-1 ${
                        activeFilters.priceRange === 'under-50' ? 'font-medium' : 'text-gray-600'
                      }`}
                    >
                      Under $50
                    </button>
                    <button
                      onClick={() => applyFilter('priceRange', '50-100')}
                      className={`block w-full text-left py-1 ${
                        activeFilters.priceRange === '50-100' ? 'font-medium' : 'text-gray-600'
                      }`}
                    >
                      $50 - $100
                    </button>
                    <button
                      onClick={() => applyFilter('priceRange', '100-200')}
                      className={`block w-full text-left py-1 ${
                        activeFilters.priceRange === '100-200' ? 'font-medium' : 'text-gray-600'
                      }`}
                    >
                      $100 - $200
                    </button>
                    <button
                      onClick={() => applyFilter('priceRange', 'over-200')}
                      className={`block w-full text-left py-1 ${
                        activeFilters.priceRange === 'over-200' ? 'font-medium' : 'text-gray-600'
                      }`}
                    >
                      Over $200
                    </button>
                  </div>
                )}
              </div>
            </div>
          </aside>
          
          {/* Mobile Filter Drawer */}
          <div 
            className={`fixed inset-0 bg-black/50 z-50 md:hidden transition-opacity duration-300 ${
              filterOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
            onClick={toggleFilter}
          ></div>
          
          <div 
            className={`fixed inset-y-0 left-0 w-80 bg-white z-50 transform transition-transform duration-300 ease-in-out md:hidden ${
              filterOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
          >
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-lg font-semibold">Filters</h2>
              <button onClick={toggleFilter}>
                <X size={24} />
              </button>
            </div>
            
            <div className="p-4 overflow-y-auto h-full pb-32">
              {/* Categories */}
              <div className="mb-6 border-b pb-6">
                <h3 className="font-medium mb-4">Categories</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      applyFilter('category', null);
                      toggleFilter();
                    }}
                    className={`block w-full text-left py-1 ${
                      !activeFilters.category ? 'font-medium' : 'text-gray-600'
                    }`}
                  >
                    All Categories
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => {
                        applyFilter('category', category.id);
                        toggleFilter();
                      }}
                      className={`block w-full text-left py-1 ${
                        isCategorySelected(category.id) ? 'font-medium' : 'text-gray-600'
                      }`}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Price Range */}
              <div className="mb-6 border-b pb-6">
                <h3 className="font-medium mb-4">Price Range</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      applyFilter('priceRange', null);
                      toggleFilter();
                    }}
                    className={`block w-full text-left py-1 ${
                      !activeFilters.priceRange ? 'font-medium' : 'text-gray-600'
                    }`}
                  >
                    All Prices
                  </button>
                  <button
                    onClick={() => {
                      applyFilter('priceRange', 'under-50');
                      toggleFilter();
                    }}
                    className={`block w-full text-left py-1 ${
                      activeFilters.priceRange === 'under-50' ? 'font-medium' : 'text-gray-600'
                    }`}
                  >
                    Under $50
                  </button>
                  <button
                    onClick={() => {
                      applyFilter('priceRange', '50-100');
                      toggleFilter();
                    }}
                    className={`block w-full text-left py-1 ${
                      activeFilters.priceRange === '50-100' ? 'font-medium' : 'text-gray-600'
                    }`}
                  >
                    $50 - $100
                  </button>
                  <button
                    onClick={() => {
                      applyFilter('priceRange', '100-200');
                      toggleFilter();
                    }}
                    className={`block w-full text-left py-1 ${
                      activeFilters.priceRange === '100-200' ? 'font-medium' : 'text-gray-600'
                    }`}
                  >
                    $100 - $200
                  </button>
                  <button
                    onClick={() => {
                      applyFilter('priceRange', 'over-200');
                      toggleFilter();
                    }}
                    className={`block w-full text-left py-1 ${
                      activeFilters.priceRange === 'over-200' ? 'font-medium' : 'text-gray-600'
                    }`}
                  >
                    Over $200
                  </button>
                </div>
              </div>
              
              <div className="pt-4">
                <button 
                  onClick={() => {
                    clearFilters();
                    toggleFilter();
                  }}
                  className="w-full py-3 px-4 bg-gray-200 hover:bg-gray-300 rounded-md transition-colors font-medium"
                >
                  Clear All Filters
                </button>
              </div>
            </div>
          </div>
          
          {/* Main Content */}
          <div className="flex-1">
            {/* Desktop Sort Controls */}
            <div className="hidden md:flex justify-between items-center mb-8">
              <div>
                <p className="text-gray-600">
                  {loading ? 'Loading products...' : `${products.length} products found`}
                </p>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className="text-gray-600">Sort by:</span>
                <div className="relative">
                  <select
                    value={activeFilters.sort || 'newest'}
                    onChange={(e) => applyFilter('sort', e.target.value)}
                    className="appearance-none bg-white border border-gray-300 rounded-md py-2 pl-4 pr-10 focus:outline-none focus:ring-black focus:border-black"
                  >
                    <option value="newest">Newest</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="name">Name: A-Z</option>
                  </select>
                  <ChevronDown size={16} className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>
            
            {/* Active Filters */}
            {(activeFilters.category || activeFilters.priceRange) && (
              <div className="flex flex-wrap items-center gap-2 mb-6">
                <span className="text-gray-600">Active filters:</span>
                
                {activeFilters.category && (
                  <button
                    onClick={() => applyFilter('category', null)}
                    className="inline-flex items-center bg-gray-100 rounded-full px-3 py-1 text-sm"
                  >
                    Category: {getCategoryLabel()}
                    <X size={14} className="ml-1" />
                  </button>
                )}
                
                {activeFilters.priceRange && (
                  <button
                    onClick={() => applyFilter('priceRange', null)}
                    className="inline-flex items-center bg-gray-100 rounded-full px-3 py-1 text-sm"
                  >
                    {activeFilters.priceRange === 'under-50' && 'Price: Under $50'}
                    {activeFilters.priceRange === '50-100' && 'Price: $50 - $100'}
                    {activeFilters.priceRange === '100-200' && 'Price: $100 - $200'}
                    {activeFilters.priceRange === 'over-200' && 'Price: Over $200'}
                    <X size={14} className="ml-1" />
                  </button>
                )}
                
                <button
                  onClick={clearFilters}
                  className="text-sm text-gray-500 hover:text-black"
                >
                  Clear all
                </button>
              </div>
            )}
            
            {/* Products Grid */}
            <ProductGrid products={products} loading={loading} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;