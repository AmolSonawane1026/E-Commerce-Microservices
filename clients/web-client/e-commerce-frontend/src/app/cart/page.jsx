'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { FaTrash, FaMinus, FaPlus, FaShoppingBag, FaArrowRight, FaLock, FaShieldAlt } from 'react-icons/fa';
import { useStore } from '@/lib/store/useStore';
import toast from 'react-hot-toast';

export default function Cart() {
  const router = useRouter();
  const { cart, removeFromCart, updateCartQuantity, clearCart, isAuthenticated, initCart, initAuth } = useStore();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    initCart();
    initAuth();
  }, [initCart, initAuth]);

  const calculateTotal = () => {
    return cart.reduce((total, item) => {
      const price = item.discountPrice || item.price;
      return total + (price * item.quantity);
    }, 0);
  };

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity < 1) return;
    updateCartQuantity(productId, newQuantity);
    toast.success('Quantity updated');
  };

  const handleRemove = (productId, productName) => {
    removeFromCart(productId);
    toast.success(`${productName} removed from cart`);
  };

  const handleClearCart = () => {
    if (confirm('Are you sure you want to clear your cart?')) {
      clearCart();
      toast.success('Cart cleared');
    }
  };

  const handleCheckout = () => {
    if (!isAuthenticated) {
      toast.error('Please login to checkout');
      router.push('/auth/login');
      return;
    }

    if (cart.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    router.push('/checkout');
  };

  if (!isClient) {
    return null;
  }

  // --- Empty State UI ---
  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="text-center max-w-md mx-auto">
          <div className="bg-gray-50 h-32 w-32 rounded-full flex items-center justify-center mx-auto mb-6">
            <FaShoppingBag className="text-gray-300 text-5xl" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Your cart is empty</h2>
          <p className="text-gray-500 mb-8 text-lg">Looks like you haven't added anything to your cart yet.</p>
          <Link
            href="/products"
            className="inline-flex items-center justify-center bg-slate-900 hover:bg-slate-800 text-white font-semibold px-8 py-4 rounded-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
          >
            Start Shopping
            <FaArrowRight className="ml-2" size={14} />
          </Link>
        </div>
      </div>
    );
  }

  const subtotal = calculateTotal();
  const tax = Math.round(subtotal * 0.18);
  const shipping = subtotal >= 500 ? 0 : 50;
  const total = subtotal + tax + shipping;

  return (
    <div className="min-h-screen bg-gray-50 py-12 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-10 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">Shopping Cart</h1>
            <p className="text-gray-500 mt-2">{cart.length} items in your bag</p>
          </div>
          <button
            onClick={handleClearCart}
            className="text-sm font-semibold text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 px-4 py-2 rounded-full transition-colors"
          >
            Clear Cart
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Cart Items Column */}
          <div className="lg:col-span-8 space-y-6">
            {cart.map((item) => {
              const price = item.discountPrice || item.price;
              return (
                <div key={item._id} className="group bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
                  <div className="flex gap-6">
                    
                    {/* Product Image */}
                    <div className="relative w-24 h-24 sm:w-32 sm:h-32 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0 border border-gray-100">
                      {item.images && item.images[0] ? (
                        <Image
                          src={item.images[0].url}
                          alt={item.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                          sizes="(max-width: 768px) 96px, 128px"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-gray-300 text-xs">
                          No Image
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div className="flex justify-between items-start">
                        <div>
                          <Link href={`/products/${item._id}`}>
                            <h3 className="font-bold text-lg text-gray-900 hover:text-blue-600 transition-colors line-clamp-1">
                              {item.name}
                            </h3>
                          </Link>
                          <p className="text-sm text-gray-500 mt-1 capitalize">{item.category}</p>
                        </div>
                        
                        {/* Remove Button (Desktop) */}
                        <button
                          onClick={() => handleRemove(item._id, item.name)}
                          className="hidden sm:block text-gray-400 hover:text-red-500 transition-colors p-1"
                          title="Remove item"
                        >
                          <FaTrash size={16} />
                        </button>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mt-4">
                        
                        {/* Price Block */}
                        <div className="flex items-baseline gap-2">
                          <span className="text-xl font-bold text-gray-900">
                            ₹{price.toLocaleString('en-IN')}
                          </span>
                          {item.discountPrice && item.discountPrice < item.price && (
                            <span className="text-sm text-gray-400 line-through">
                              ₹{item.price.toLocaleString('en-IN')}
                            </span>
                          )}
                        </div>

                        {/* Controls */}
                        <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4">
                           {/* Quantity */}
                           <div className="flex items-center bg-gray-50 rounded-full border border-gray-200">
                              <button
                                onClick={() => handleQuantityChange(item._id, item.quantity - 1)}
                                className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-black transition disabled:opacity-50"
                                disabled={item.quantity <= 1}
                              >
                                <FaMinus size={10} />
                              </button>
                              <span className="w-8 text-center text-sm font-bold text-gray-900">{item.quantity}</span>
                              <button
                                onClick={() => handleQuantityChange(item._id, item.quantity + 1)}
                                className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-black transition"
                              >
                                <FaPlus size={10} />
                              </button>
                           </div>

                           {/* Remove Button (Mobile) */}
                           <button
                            onClick={() => handleRemove(item._id, item.name)}
                            className="sm:hidden text-gray-400 hover:text-red-500"
                           >
                             <FaTrash size={16} />
                           </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Order Summary Column */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-medium text-gray-900">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Tax (18% GST)</span>
                  <span className="font-medium text-gray-900">₹{tax.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className="font-medium">
                    {shipping === 0 ? (
                      <span className="text-green-600 font-bold text-sm bg-green-50 px-2 py-0.5 rounded-full">FREE</span>
                    ) : (
                      `₹${shipping}`
                    )}
                  </span>
                </div>

                {subtotal < 500 && (
                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm flex items-start gap-2">
                    <span className="text-xl">🚚</span>
                    <p className="text-blue-800">
                      Add <span className="font-bold">₹{(500 - subtotal).toLocaleString('en-IN')}</span> more to qualify for <span className="font-bold">Free Shipping</span>.
                    </p>
                  </div>
                )}
              </div>

              <div className="border-t border-gray-100 pt-6 mb-8">
                <div className="flex justify-between items-end">
                  <span className="text-lg font-bold text-gray-900">Total</span>
                  <div className="text-right">
                    <span className="text-3xl font-extrabold text-gray-900">
                      ₹{total.toLocaleString('en-IN')}
                    </span>
                    <p className="text-xs text-gray-400 mt-1">Inclusive of all taxes</p>
                  </div>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                className="w-full bg-slate-900 hover:bg-black text-white font-bold py-4 rounded-xl mb-4 transition-all duration-300 shadow-lg shadow-gray-900/10 hover:shadow-gray-900/20 active:scale-95 flex items-center justify-center gap-2"
              >
                Proceed to Checkout
                <FaArrowRight size={14} />
              </button>
              
              <Link
                href="/products"
                className="block text-center text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors"
              >
                or Continue Shopping
              </Link>

              {/* Trust Indicators */}
              <div className="mt-8 pt-6 border-t border-gray-100 grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <FaLock className="text-green-500" />
                  <span>Secure Checkout</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <FaShieldAlt className="text-blue-500" />
                  <span>Buyer Protection</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}