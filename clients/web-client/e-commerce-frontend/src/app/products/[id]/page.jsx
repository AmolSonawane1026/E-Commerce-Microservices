'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { FaStar, FaShoppingCart, FaHeart, FaTruck } from 'react-icons/fa';
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading product...</p>
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm text-gray-600">
          <span className="hover:text-blue-600 cursor-pointer" onClick={() => router.push('/')}>Home</span>
          {' / '}
          <span className="hover:text-blue-600 cursor-pointer" onClick={() => router.push('/products')}>Products</span>
          {' / '}
          <span className="text-gray-900">{product.name}</span>
        </nav>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Images Section */}
            <div>
              {/* Main Image */}
              <div className="relative h-96 bg-gray-100 rounded-lg overflow-hidden mb-4">
                {product.images && product.images[selectedImage] ? (
                  <Image
                    src={product.images[selectedImage].url}
                    alt={product.name}
                    fill
                    className="object-contain"
                    priority
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    No Image Available
                  </div>
                )}
              </div>

              {/* Thumbnail Images */}
              {product.images && product.images.length > 1 && (
                <div className="grid grid-cols-5 gap-2">
                  {product.images.map((image, index) => (
                    <div
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`relative h-20 bg-gray-100 rounded-lg overflow-hidden cursor-pointer border-2 ${
                        selectedImage === index ? 'border-blue-600' : 'border-transparent'
                      }`}
                    >
                      <Image
                        src={image.url}
                        alt={`${product.name} - ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info Section */}
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
                
                {/* Rating */}
                <div className="flex items-center space-x-2 mb-4">
                  <div className="flex items-center">
                    <FaStar className="text-yellow-400 mr-1" />
                    <span className="font-semibold">{product.ratings.average.toFixed(1)}</span>
                  </div>
                  <span className="text-gray-500">({product.ratings.count} reviews)</span>
                </div>

                {/* Category & Brand */}
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm">
                    {product.category}
                  </span>
                  {product.brand && (
                    <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
                      {product.brand}
                    </span>
                  )}
                </div>
              </div>

              {/* Price */}
              <div className="border-t border-b border-gray-200 py-4">
                <div className="flex items-baseline space-x-3">
                  <span className="text-4xl font-bold text-green-600">
                    ₹{price.toLocaleString('en-IN')}
                  </span>
                  {hasDiscount && (
                    <>
                      <span className="text-xl text-gray-500 line-through">
                        ₹{product.price.toLocaleString('en-IN')}
                      </span>
                      <span className="bg-red-500 text-white px-2 py-1 rounded text-sm font-semibold">
                        {product.discountPercentage}% OFF
                      </span>
                    </>
                  )}
                </div>
                <p className="text-sm text-gray-600 mt-2">Inclusive of all taxes</p>
              </div>

              {/* Stock Status */}
              <div>
                <span className={`inline-block px-4 py-2 rounded-lg font-semibold ${
                  product.stockStatus === 'In Stock' 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-red-100 text-red-700'
                }`}>
                  {product.stockStatus}
                </span>
              </div>

              {/* Quantity Selector */}
              {product.stockStatus === 'In Stock' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantity
                  </label>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg"
                    >
                      -
                    </button>
                    <span className="text-xl font-semibold w-12 text-center">{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(product.inventory.quantity, quantity + 1))}
                      className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg"
                    >
                      +
                    </button>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              {product.stockStatus === 'In Stock' && (
                <div className="flex space-x-4">
                  <button
                    onClick={handleAddToCart}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg flex items-center justify-center space-x-2"
                  >
                    <FaShoppingCart />
                    <span>Add to Cart</span>
                  </button>
                  
                  <button className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-6 rounded-lg">
                    <FaHeart />
                  </button>
                </div>
              )}

              {/* Delivery Info */}
              <div className="bg-blue-50 p-4 rounded-lg flex items-start space-x-3">
                <FaTruck className="text-blue-600 text-2xl mt-1" />
                <div>
                  <p className="font-semibold text-gray-900">Free Delivery</p>
                  <p className="text-sm text-gray-600">On orders above ₹500</p>
                </div>
              </div>

              {/* Product Description */}
              <div>
                <h2 className="text-xl font-semibold mb-3">Description</h2>
                <p className="text-gray-700 leading-relaxed">{product.description}</p>
              </div>

              {/* Specifications */}
              {product.specifications && Object.keys(product.specifications).length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold mb-3">Specifications</h2>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <dl className="space-y-2">
                      {Object.entries(product.specifications).map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <dt className="text-gray-600">{key}:</dt>
                          <dd className="text-gray-900 font-medium">{value}</dd>
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

