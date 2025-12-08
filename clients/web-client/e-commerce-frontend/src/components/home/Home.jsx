'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import ProductCard from '@/components/product/ProductCard';
import { productService } from '@/lib/services/productService';
import toast from 'react-hot-toast';

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch featured products
      const productsResponse = await productService.getAllProducts({ 
        isFeatured: true, 
        limit: 8 
      });
      setFeaturedProducts(productsResponse.data || []);

      // Fetch categories
      const categoriesResponse = await productService.getCategories();
      setCategories(categoriesResponse.data.categories || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  // Helper to get a gradient for categories (purely for UI aesthetics)
  const getGradient = (index) => {
    const gradients = [
      'from-rose-100 to-teal-100',
      'from-blue-100 to-indigo-100',
      'from-amber-100 to-orange-100',
      'from-emerald-100 to-green-100',
      'from-purple-100 to-pink-100'
    ];
    return gradients[index % gradients.length];
  };

  return (
    <div className="min-h-screen bg-white font-sans selection:bg-blue-100 selection:text-blue-900">
      
      {/* --- HERO SECTION --- */}
      <section className="relative isolate overflow-hidden bg-gray-900 py-24 sm:py-32 lg:pb-40">
        {/* Background Art */}
        <div className="absolute inset-0 -z-10 transform-gpu overflow-hidden blur-3xl" aria-hidden="true">
          <div className="aspect-[1108/632] w-[69.25rem] bg-gradient-to-r from-[#80caff] to-[#4f46e5] opacity-20" 
               style={{ clipPath: 'polygon(73.6% 51.7%, 91.7% 11.8%, 100% 46.4%, 97.4% 82.2%, 92.5% 84.9%, 75.7% 64%, 55.3% 47.5%, 46.5% 49.4%, 45% 62.9%, 50.3% 87.2%, 21.3% 64.1%, 0.1% 100%, 5.4% 51.1%, 21.4% 63.9%, 58.9% 0.2%, 73.6% 51.7%)' }}>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="hidden sm:mb-8 sm:flex sm:justify-center">
              <div className="relative rounded-full px-3 py-1 text-sm leading-6 text-gray-400 ring-1 ring-white/10 hover:ring-white/20">
                Announcing our next round of funding. <Link href="/products" className="font-semibold text-white"><span className="absolute inset-0" aria-hidden="true"></span>Read more <span aria-hidden="true">&rarr;</span></Link>
              </div>
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl mb-6">
              Style that speaks <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
                without words.
              </span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-300">
              Curated collections for the modern lifestyle. Experience quality, comfort, and elegance in every product we offer.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link
                href="/products"
                className="rounded-full bg-white px-8 py-3.5 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white transition-all duration-300 hover:scale-105"
              >
                Start Shopping
              </Link>
              <Link href="/products?sort=newest" className="text-sm font-semibold leading-6 text-white group">
                View Arrivals <span aria-hidden="true" className="inline-block transition-transform group-hover:translate-x-1">→</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* --- CATEGORIES SECTION --- */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Collections</h2>
              <p className="mt-2 text-lg text-gray-600">Explore items by category</p>
            </div>
            <Link href="/products" className="hidden md:block text-sm font-semibold text-blue-600 hover:text-blue-500">
              Browse all categories &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-5 md:gap-8">
            {categories.map((category, idx) => (
              <Link
                key={category}
                href={`/products?category=${category}`}
                className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl bg-gradient-to-b ${getGradient(idx)} p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 aspect-[4/5]`}
              >
                <div className="absolute right-0 top-0 h-32 w-32 translate-x-8 translate-y-[-10px] opacity-10 group-hover:opacity-20 transition-opacity">
                  <div className="text-9xl">📦</div>
                </div>
                
                <div className="relative z-10 mt-auto">
                  <span className="mb-2 block h-1 w-8 bg-gray-900 rounded-full"></span>
                  <h3 className="text-xl font-bold text-gray-900 capitalize leading-tight">
                    {category}
                  </h3>
                  <p className="mt-1 text-sm text-gray-600 opacity-0 transform translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                    View Collection
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* --- FEATURED PRODUCTS SECTION --- */}
      <section className="bg-gray-50 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Trending Now</h2>
            <p className="mt-4 text-lg text-gray-600">
              Our most popular products, highly rated by customers like you.
            </p>
          </div>

          {loading ? (
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl shadow-sm overflow-hidden p-4 space-y-4 animate-pulse">
                  <div className="bg-gray-200 h-64 rounded-lg w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : featuredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
              {featuredProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-gray-300">
              <div className="text-4xl mb-4">🔍</div>
              <p className="text-gray-500 font-medium">No trending products found at the moment.</p>
            </div>
          )}

          <div className="mt-16 text-center">
            <Link
              href="/products"
              className="inline-block rounded-md border border-gray-300 bg-white px-8 py-3 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-50 hover:text-blue-600 transition-colors"
            >
              Shop All Products
            </Link>
          </div>
        </div>
      </section>

      {/* --- FEATURES / TRUST SIGNALS --- */}
      <section className="bg-gray-900 text-white py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-y-12 sm:grid-cols-2 sm:gap-x-6 lg:grid-cols-3 lg:gap-x-8">
            
            <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:gap-4 lg:flex-col lg:items-start lg:gap-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/20">
                <span className="text-2xl">🚚</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold leading-8 text-white">Free Shipping</h3>
                <p className="mt-2 text-base leading-7 text-gray-400">
                  On all domestic orders over ₹500. We ensure your package arrives safely and on time.
                </p>
              </div>
            </div>

            <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:gap-4 lg:flex-col lg:items-start lg:gap-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/20">
                <span className="text-2xl">🛡️</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold leading-8 text-white">Secure Payment</h3>
                <p className="mt-2 text-base leading-7 text-gray-400">
                  We use industry-standard encryption to ensure your payment details are 100% safe.
                </p>
              </div>
            </div>

            <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:gap-4 lg:flex-col lg:items-start lg:gap-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/20">
                <span className="text-2xl">↩️</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold leading-8 text-white">Easy Returns</h3>
                <p className="mt-2 text-base leading-7 text-gray-400">
                  Not perfect? Return it within 7 days for a full refund or exchange, no questions asked.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}