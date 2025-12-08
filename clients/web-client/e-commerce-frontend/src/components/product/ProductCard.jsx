'use client';

import Link from 'next/link';
import Image from 'next/image';
import { FaShoppingCart, FaStar, FaHeart } from 'react-icons/fa';
import { useStore } from '@/lib/store/useStore';
import toast from 'react-hot-toast';

export default function ProductCard({ product }) {
  const { addToCart, isAuthenticated } = useStore();

  const handleAddToCart = (e) => {
    e.preventDefault(); // Prevent Link navigation
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart');
      return;
    }
    addToCart(product);
    toast.success('Added to cart!');
  };

  const price = product.discountPrice || product.price;
  const hasDiscount = product.discountPrice && product.discountPrice < product.price;

  return (
    <Link href={`/products/${product._id}`} className="block h-full">
      <div className="group relative bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 h-full flex flex-col">
        
        {/* Image Container */}
        <div className="relative aspect-[4/5] bg-gray-50 overflow-hidden">
          {product.images && product.images[0] ? (
            <Image
              src={product.images[0].url}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-300 bg-gray-50">
              <span className="text-sm">No Image</span>
            </div>
          )}

          {/* Overlay Gradient (Subtle shadow for better text visibility if needed) */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Wishlist Icon (Visual Flair) */}
          <button className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full text-gray-400 hover:text-red-500 hover:bg-white shadow-sm opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 z-10">
            <FaHeart size={16} />
          </button>

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {hasDiscount && (
              <span className="bg-rose-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm tracking-wide uppercase">
                {product.discountPercentage}% OFF
              </span>
            )}
            {product.isFeatured && (
              <span className="bg-amber-400 text-amber-900 text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm tracking-wide uppercase">
                Featured
              </span>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col flex-grow">
          {/* Category/Brand Tag */}
          <div className="mb-2">
             <span className="text-[10px] font-bold tracking-wider text-blue-600 uppercase bg-blue-50 px-2 py-1 rounded-md">
                {product.category}
             </span>
          </div>

          {/* Title */}
          <h3 className="font-bold text-gray-800 text-base mb-2 line-clamp-2 leading-tight group-hover:text-blue-600 transition-colors">
            {product.name}
          </h3>

          {/* Rating */}
          <div className="flex items-center mb-4">
            <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                    <FaStar key={i} size={12} className={i < Math.round(product.ratings.average) ? "fill-current" : "text-gray-200"} />
                ))}
            </div>
            <span className="text-xs text-gray-400 ml-2 font-medium">
              ({product.ratings.count} reviews)
            </span>
          </div>

          <div className="mt-auto">
            {/* Price Row */}
            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-xl font-extrabold text-slate-900">
                ₹{price.toLocaleString('en-IN')}
              </span>
              {hasDiscount && (
                <span className="text-sm text-gray-400 line-through font-medium">
                  ₹{product.price.toLocaleString('en-IN')}
                </span>
              )}
            </div>

            {/* Action Button */}
            {product.stockStatus === 'In Stock' ? (
              <button
                onClick={handleAddToCart}
                className="w-full bg-slate-900 hover:bg-blue-600 text-white font-medium py-2.5 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-slate-900/10 hover:shadow-blue-600/20 active:scale-95"
              >
                <FaShoppingCart size={14} />
                <span>Add to Cart</span>
              </button>
            ) : (
              <div className="w-full bg-gray-100 text-gray-400 font-medium py-2.5 rounded-xl flex items-center justify-center cursor-not-allowed">
                Out of Stock
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}