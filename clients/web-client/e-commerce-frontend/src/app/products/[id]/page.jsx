'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { FaStar, FaShoppingCart, FaHeart, FaTruck, FaShieldAlt, FaUndo } from 'react-icons/fa';
import { productService } from '@/lib/services/productService';
import { useStore } from '@/lib/store/useStore';
import toast from 'react-hot-toast';

export default function ProductDetails() {
  const params = useParams();
  const router = useRouter();
  const { addToCart, isAuthenticated } = useStore();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    if (params.id) {
      fetchProduct();
    }
  }, [params.id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await productService.getProductById(params.id);
      setProduct(response.data.product);
    } catch (error) {
      console.error('Error fetching product:', error);
      toast.error('Failed to load product');
      router.push('/products');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart');
      router.push('/auth/login');
      return;
    }
    addToCart(product, quantity);
    toast.success(`${quantity} item(s) added to cart!`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-200 border-t-slate-900"></div>
          <p className="mt-4 text-slate-500 font-medium animate-pulse">Loading details...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return null;
  }

  const price = product.discountPrice || product.price;
  const hasDiscount = product.discountPrice && product.discountPrice < product.price;

  return (
    <div className="min-h-screen bg-white font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Breadcrumb - Minimalist */}
        <nav className="flex items-center text-sm text-gray-500 mb-8 overflow-x-auto whitespace-nowrap">
          <span className="hover:text-black cursor-pointer transition-colors" onClick={() => router.push('/')}>Home</span>
          <span className="mx-2 text-gray-300">/</span>
          <span className="hover:text-black cursor-pointer transition-colors" onClick={() => router.push('/products')}>Products</span>
          <span className="mx-2 text-gray-300">/</span>
          <span className="text-black font-medium">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Left Column: Images (Sticky on Desktop) */}
          <div className="lg:col-span-7">
            <div className="sticky top-24 space-y-6">
              {/* Main Image Stage */}
              <div className="relative aspect-[4/3] bg-gray-50 rounded-3xl overflow-hidden border border-gray-100 shadow-sm group">
                {product.images && product.images[selectedImage] ? (
                  <Image
                    src={product.images[selectedImage].url}
                    alt={product.name}
                    fill
                    className="object-contain p-8 transition-transform duration-500 group-hover:scale-105"
                    priority
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-300">
                    No Image Available
                  </div>
                )}
                
                {/* Badges Overlay */}
                <div className="absolute top-4 left-4 flex gap-2">
                    {product.stockStatus === 'Out of Stock' && (
                        <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">Sold Out</span>
                    )}
                    {hasDiscount && (
                        <span className="bg-black text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                            {product.discountPercentage}% OFF
                        </span>
                    )}
                </div>
              </div>

              {/* Thumbnails */}
              {product.images && product.images.length > 1 && (
                <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                  {product.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`relative w-24 h-24 flex-shrink-0 bg-gray-50 rounded-2xl overflow-hidden border-2 transition-all duration-200 ${
                        selectedImage === index 
                          ? 'border-black ring-1 ring-black ring-offset-2' 
                          : 'border-transparent hover:border-gray-300'
                      }`}
                    >
                      <Image
                        src={image.url}
                        alt={`${product.name} - ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Product Info */}
          <div className="lg:col-span-5">
            <div className="flex flex-col h-full">
              
              {/* Header Info */}
              <div className="mb-6 border-b border-gray-100 pb-6">
                <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs font-bold tracking-wider text-blue-600 uppercase bg-blue-50 px-2.5 py-1 rounded-lg">
                        {product.category}
                    </span>
                    {product.brand && (
                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {product.brand}
                        </span>
                    )}
                </div>

                <h1 className="text-3xl lg:text-4xl font-extrabold text-gray-900 tracking-tight mb-4 leading-tight">
                    {product.name}
                </h1>

                <div className="flex items-center gap-4">
                    <div className="flex items-center bg-yellow-50 px-2 py-1 rounded-lg">
                        <FaStar className="text-yellow-400 mr-1" size={14} />
                        <span className="font-bold text-gray-900 text-sm">{product.ratings.average.toFixed(1)}</span>
                    </div>
                    <span className="text-sm text-gray-400">|</span>
                    <a href="#reviews" className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline">
                        {product.ratings.count} Verified Reviews
                    </a>
                </div>
              </div>

              {/* Price Block */}
              <div className="mb-8">
                <div className="flex items-baseline gap-3">
                  <span className="text-4xl lg:text-5xl font-extrabold text-gray-900">
                    ₹{price.toLocaleString('en-IN')}
                  </span>
                  {hasDiscount && (
                    <span className="text-xl text-gray-400 line-through font-medium">
                      ₹{product.price.toLocaleString('en-IN')}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-2">Inclusive of all taxes. Free shipping on this item.</p>
              </div>

              {/* Description Snippet */}
              <div className="mb-8">
                <p className="text-gray-600 leading-relaxed text-base">
                    {product.description}
                </p>
              </div>

              {/* Controls */}
              {product.stockStatus === 'In Stock' && (
                <div className="bg-gray-50 p-6 rounded-3xl mb-8 border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <span className="font-bold text-gray-900">Quantity</span>
                        <div className="flex items-center bg-white rounded-full border border-gray-200 shadow-sm">
                            <button 
                                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                className="w-10 h-10 flex items-center justify-center text-gray-500 hover:bg-gray-50 rounded-l-full transition"
                            >
                                -
                            </button>
                            <span className="w-12 text-center font-bold text-gray-900">{quantity}</span>
                            <button 
                                onClick={() => setQuantity(Math.min(product.inventory.quantity, quantity + 1))}
                                className="w-10 h-10 flex items-center justify-center text-gray-500 hover:bg-gray-50 rounded-r-full transition"
                            >
                                +
                            </button>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={handleAddToCart}
                            className="flex-1 bg-gray-900 hover:bg-black text-white font-bold py-4 px-6 rounded-xl shadow-lg shadow-gray-900/10 hover:shadow-gray-900/20 transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2"
                        >
                            <FaShoppingCart size={18} />
                            <span>Add to Cart</span>
                        </button>
                        <button className="p-4 bg-white border border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-100 hover:bg-red-50 rounded-xl transition-all duration-200">
                            <FaHeart size={20} />
                        </button>
                    </div>
                </div>
              )}

              {/* Trust Signals */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                    <FaTruck className="text-blue-600 mt-1" />
                    <div>
                        <p className="font-bold text-xs text-gray-900 uppercase">Free Delivery</p>
                        <p className="text-xs text-gray-500">Orders over ₹500</p>
                    </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                    <FaUndo className="text-blue-600 mt-1" />
                    <div>
                        <p className="font-bold text-xs text-gray-900 uppercase">Easy Returns</p>
                        <p className="text-xs text-gray-500">7 Day Policy</p>
                    </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                    <FaShieldAlt className="text-blue-600 mt-1" />
                    <div>
                        <p className="font-bold text-xs text-gray-900 uppercase">Warranty</p>
                        <p className="text-xs text-gray-500">1 Year Brand</p>
                    </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                    <FaStar className="text-blue-600 mt-1" />
                    <div>
                        <p className="font-bold text-xs text-gray-900 uppercase">Top Rated</p>
                        <p className="text-xs text-gray-500">4.5+ Rating</p>
                    </div>
                </div>
              </div>

              {/* Specifications */}
              {product.specifications && Object.keys(product.specifications).length > 0 && (
                <div className="mt-auto">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Product Specifications</h3>
                    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
                        <dl className="divide-y divide-gray-100">
                            {Object.entries(product.specifications).map(([key, value], idx) => (
                            <div key={key} className={`grid grid-cols-3 gap-4 px-6 py-4 ${idx % 2 === 0 ? 'bg-gray-50/50' : 'bg-white'}`}>
                                <dt className="text-sm font-medium text-gray-500">{key}</dt>
                                <dd className="text-sm font-semibold text-gray-900 col-span-2 text-right">{value}</dd>
                            </div>
                            ))}
                        </dl>
                    </div>
                </div>
              )}
              
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}