'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { FaTrash, FaMinus, FaPlus, FaShoppingBag } from 'react-icons/fa';
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

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaShoppingBag className="text-gray-300 text-6xl mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
          <p className="text-gray-600 mb-6">Add some products to get started!</p>
          <Link
            href="/products"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition"
          >
            Continue Shopping
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
          <button
            onClick={handleClearCart}
            className="text-red-600 hover:text-red-700 font-semibold text-sm"
          >
            Clear Cart
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item) => {
              const price = item.discountPrice || item.price;
              return (
                <div key={item._id} className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition">
                  <div className="flex items-center space-x-4">
                    {/* Product Image */}
                    <div className="relative w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      {item.images && item.images[0] ? (
                        <Image
                          src={item.images[0].url}
                          alt={item.name}
                          fill
                          className="object-cover"
                          sizes="96px"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-gray-400 text-xs">
                          No Image
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <Link href={`/products/${item._id}`}>
                        <h3 className="font-semibold text-gray-900 hover:text-blue-600 mb-1 truncate">
                          {item.name}
                        </h3>
                      </Link>
                      <p className="text-sm text-gray-600 mb-2">{item.category}</p>
                      <div className="flex items-center space-x-2">
                        <span className="text-lg font-bold text-green-600">
                          ₹{price.toLocaleString('en-IN')}
                        </span>
                        {item.discountPrice && item.discountPrice < item.price && (
                          <span className="text-sm text-gray-500 line-through">
                            ₹{item.price.toLocaleString('en-IN')}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => handleQuantityChange(item._id, item.quantity - 1)}
                        className="p-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition"
                        disabled={item.quantity <= 1}
                      >
                        <FaMinus size={12} className={item.quantity <= 1 ? 'text-gray-400' : 'text-gray-700'} />
                      </button>
                      <span className="font-semibold text-lg w-8 text-center">{item.quantity}</span>
                      <button
                        onClick={() => handleQuantityChange(item._id, item.quantity + 1)}
                        className="p-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition"
                      >
                        <FaPlus size={12} className="text-gray-700" />
                      </button>
                    </div>

                    {/* Item Total */}
                    <div className="text-right hidden sm:block">
                      <p className="text-lg font-bold text-gray-900">
                        ₹{(price * item.quantity).toLocaleString('en-IN')}
                      </p>
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => handleRemove(item._id, item.name)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                      title="Remove from cart"
                    >
                      <FaTrash />
                    </button>
                  </div>

                  {/* Mobile Item Total */}
                  <div className="sm:hidden mt-3 pt-3 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Item Total:</span>
                      <span className="text-lg font-bold text-gray-900">
                        ₹{(price * item.quantity).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-20">
              <h2 className="text-xl font-bold mb-4">Order Summary</h2>
              
              <div className="space-y-3 mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal ({cart.length} items)</span>
                  <span className="font-semibold">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax (18% GST)</span>
                  <span className="font-semibold">₹{tax.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-semibold">
                    {shipping === 0 ? (
                      <span className="text-green-600">FREE</span>
                    ) : (
                      `₹${shipping}`
                    )}
                  </span>
                </div>
                {subtotal < 500 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-sm text-blue-700">
                      💡 Add ₹{(500 - subtotal).toLocaleString('en-IN')} more for free shipping!
                    </p>
                  </div>
                )}
              </div>

              <div className="border-t border-gray-200 pt-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold">Total</span>
                  <span className="text-2xl font-bold text-green-600">
                    ₹{total.toLocaleString('en-IN')}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">Inclusive of all taxes</p>
              </div>

              <button
                onClick={handleCheckout}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg mb-3 transition shadow-lg hover:shadow-xl"
              >
                Proceed to Checkout
              </button>
              
              <Link
                href="/products"
                className="block text-center text-blue-600 hover:text-blue-700 font-semibold"
              >
                Continue Shopping
              </Link>

              {/* Trust Badges */}
              <div className="mt-6 pt-6 border-t border-gray-200 space-y-2">
                <div className="flex items-center text-sm text-gray-600">
                  <span className="mr-2">🔒</span>
                  <span>Secure checkout</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <span className="mr-2">↩️</span>
                  <span>Easy 7-day returns</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <span className="mr-2">🚚</span>
                  <span>Fast delivery</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
