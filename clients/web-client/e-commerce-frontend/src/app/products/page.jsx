'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import ProductCard from '@/components/product/ProductCard';
import { productService } from '@/lib/services/productService';
import toast from 'react-hot-toast';
import { FaFilter, FaSortAmountDown, FaSearch, FaChevronDown } from 'react-icons/fa';

// Loading fallback component
function ProductsLoading() {
  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <div className="bg-slate-900 text-white py-10 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold tracking-tight">Shop Collection</h1>
          <p className="mt-2 text-slate-400 text-sm">Find the perfect item for your lifestyle.</p>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 h-96 animate-pulse p-4">
              <div className="bg-gray-200 h-48 w-full rounded mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Main products content that uses useSearchParams
function ProductsContent() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    search: searchParams.get('search') || '',
    minPrice: '',
    maxPrice: '',
    sort: '-createdAt',
    page: 1,
    limit: 12
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [filters]);

  const fetchCategories = async () => {
    try {
      const response = await productService.getCategories();
      setCategories(response.data.categories || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = {};

      if (filters.category) params.category = filters.category;
      if (filters.minPrice) params.minPrice = filters.minPrice;
      if (filters.maxPrice) params.maxPrice = filters.maxPrice;
      if (filters.sort) params.sort = filters.sort;
      params.page = filters.page;
      params.limit = filters.limit;

      let response;
      if (filters.search) {
        response = await productService.searchProducts(filters.search, params);
      } else {
        response = await productService.getAllProducts(params);
      }

      setProducts(response.data || []);
      setPagination(response.pagination || {});
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value, page: 1 });
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      search: '',
      minPrice: '',
      maxPrice: '',
      sort: '-createdAt',
      page: 1,
      limit: 12
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      {/* Top Banner Area */}
      <div className="bg-slate-900 text-white py-10 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold tracking-tight">Shop Collection</h1>
          <p className="mt-2 text-slate-400 text-sm">Find the perfect item for your lifestyle.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Main Layout */}
        <div className="flex flex-col lg:flex-row gap-8">

          {/* Mobile Filter Toggle */}
          <div className="lg:hidden flex justify-between items-center bg-white p-4 rounded-lg shadow-sm mb-4 border border-gray-200">
            <span className="font-semibold text-gray-800">{pagination.totalItems || 0} Results</span>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="bg-gray-100 text-gray-800 px-4 py-2 rounded-md flex items-center space-x-2 text-sm font-medium border border-gray-300 hover:bg-gray-200 transition-colors"
            >
              <FaFilter size={12} />
              <span>Filter</span>
            </button>
          </div>

          {/* Filters Sidebar */}
          <aside className={`lg:block ${showFilters ? 'block' : 'hidden'} w-full lg:w-64 shrink-0`}>
            <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 sticky top-4">

              <div className="flex justify-between items-center mb-5 border-b border-gray-100 pb-4">
                <h2 className="text-base font-bold text-gray-900">Filters</h2>
                <button
                  onClick={clearFilters}
                  className="text-xs font-medium text-blue-600 hover:text-blue-800"
                >
                  Clear All
                </button>
              </div>

              {/* Category Filter */}
              <div className="mb-6">
                <h3 className="text-sm font-bold text-gray-900 mb-3">Category</h3>
                <div className="space-y-2">
                  <div className="relative">
                    <select
                      value={filters.category}
                      onChange={(e) => handleFilterChange('category', e.target.value)}
                      className="w-full appearance-none px-3 py-2 bg-white border border-gray-300 rounded-md text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 cursor-pointer shadow-sm"
                    >
                      <option value="">All Categories</option>
                      {categories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                      <FaChevronDown size={10} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Price Range Filter */}
              <div className="mb-6">
                <h3 className="text-sm font-bold text-gray-900 mb-3">Price Range</h3>
                <div className="flex items-center gap-2">
                  <div className="relative w-full">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs">₹</span>
                    <input
                      type="number"
                      placeholder="Min"
                      value={filters.minPrice}
                      onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                      className="w-full pl-6 pr-2 py-2 bg-white border border-gray-300 rounded-md text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                    />
                  </div>
                  <span className="text-gray-400">-</span>
                  <div className="relative w-full">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs">₹</span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={filters.maxPrice}
                      onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                      className="w-full pl-6 pr-2 py-2 bg-white border border-gray-300 rounded-md text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Sort Filter */}
              <div>
                <h3 className="text-sm font-bold text-gray-900 mb-3">Sort By</h3>
                <div className="relative">
                  <select
                    value={filters.sort}
                    onChange={(e) => handleFilterChange('sort', e.target.value)}
                    className="w-full appearance-none px-3 py-2 bg-white border border-gray-300 rounded-md text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 cursor-pointer shadow-sm"
                  >
                    <option value="-createdAt">Newest First</option>
                    <option value="createdAt">Oldest First</option>
                    <option value="price">Price: Low to High</option>
                    <option value="-price">Price: High to Low</option>
                    <option value="-ratings.average">Avg. Customer Review</option>
                    <option value="name">Name: A to Z</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                    <FaSortAmountDown size={10} />
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Products Grid Area */}
          <div className="flex-1">

            {/* Results Bar */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="text-sm text-gray-700">
                {loading ? (
                  <span>Searching...</span>
                ) : (
                  <span>
                    Showing <span className="font-bold text-gray-900">{products.length}</span> results for
                    <span className="font-bold text-gray-900"> "{filters.category || 'All Products'}"</span>
                  </span>
                )}
              </div>

              {/* Active Filters Tags */}
              {filters.search && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">Search:</span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {filters.search}
                    <button onClick={() => handleFilterChange('search', '')} className="ml-1.5 text-blue-600 hover:text-blue-800">×</button>
                  </span>
                </div>
              )}
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 h-96 animate-pulse p-4">
                    <div className="bg-gray-200 h-48 w-full rounded mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : products.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
                  {products.map((product) => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="mt-10 flex justify-center">
                    <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                      <button
                        onClick={() => handleFilterChange('page', filters.page - 1)}
                        disabled={!pagination.hasPrevPage}
                        className="relative inline-flex items-center rounded-l-md px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 focus:z-20 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                      <span className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-900 bg-white border-t border-b border-gray-300 focus:z-20">
                        {pagination.currentPage} / {pagination.totalPages}
                      </span>
                      <button
                        onClick={() => handleFilterChange('page', filters.page + 1)}
                        disabled={!pagination.hasNextPage}
                        className="relative inline-flex items-center rounded-r-md px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 focus:z-20 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </nav>
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 bg-white rounded-lg border border-dashed border-gray-300 text-center">
                <div className="rounded-full bg-gray-100 p-4 mb-4">
                  <FaSearch className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">No products found</h3>
                <p className="mt-1 text-sm text-gray-500 max-w-sm">
                  We couldn't find any products matching your current filters. Try adjusting your search or categories.
                </p>
                <button
                  onClick={clearFilters}
                  className="mt-6 inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Main page component with Suspense boundary
export default function Products() {
  return (
    <Suspense fallback={<ProductsLoading />}>
      <ProductsContent />
    </Suspense>
  );
}