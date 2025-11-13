'use client';

import Link from 'next/link';
import Image from 'next/image';
import { FaShoppingCart, FaStar, FaHeart } from 'react-icons/fa';
import { useStore } from '@/lib/store/useStore';
import toast from 'react-hot-toast';

export default function ProductCard({ product }) {
  const { addToCart, isAuthenticated } = useStore();

  const handleAddToCart = (e) => {
    e.preventDefault();
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
    <Link href={`/products/${product._id}`}>
      <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden h-full flex flex-col">
        {/* Image Container */}
        <div className="relative h-48 bg-gray-100">
          {product.images && product.images[0] ? (
            <Image
              src={product.images[0].url}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              No Image
            </div>
          )}
          
          {/* Badges */}
          {hasDiscount && (
            <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
              {product.discountPercentage}% OFF
            </div>
          )}

          {product.isFeatured && (
            <div className="absolute top-2 left-2 bg-yellow-400 text-gray-900 text-xs px-2 py-1 rounded font-semibold">
              Featured
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col flex-grow">
          <h3 className="font-semibold text-gray-800 text-sm mb-2 line-clamp-2 min-h-[2.5rem]">
            {product.name}
          </h3>
          
          {/* Category & Brand */}
          <div className="flex flex-wrap gap-2 mb-2">
            <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">
              {product.category}
            </span>
            {product.brand && (
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                {product.brand}
              </span>
            )}
          </div>

          {/* Rating */}
          <div className="flex items-center mb-2">
            <FaStar className="text-yellow-400 mr-1" size={14} />
            <span className="text-sm text-gray-600">
              {product.ratings.average.toFixed(1)} ({product.ratings.count})
            </span>
          </div>

          {/* Price */}
          <div className="mb-3">
            <div className="text-2xl font-bold text-green-600">
              ₹{price.toLocaleString('en-IN')}
            </div>
            {hasDiscount && (
              <div className="text-sm text-gray-500 line-through">
                ₹{product.price.toLocaleString('en-IN')}
              </div>
            )}
          </div>

          {/* Stock & Add to Cart */}
          <div className="mt-auto flex items-center justify-between">
            <span className={`text-xs font-semibold ${
              product.stockStatus === 'In Stock' ? 'text-green-600' : 'text-red-600'
            }`}>
              {product.stockStatus}
            </span>
            
            {product.stockStatus === 'In Stock' && (
              <button
                onClick={handleAddToCart}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm flex items-center space-x-2 transition"
              >
                <FaShoppingCart />
                <span>Add</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

