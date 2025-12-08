'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaShoppingBag, FaEye, FaBoxOpen, FaCalendarAlt, FaChevronRight } from 'react-icons/fa';
import { useStore } from '@/lib/store/useStore';
import { orderService } from '@/lib/services/orderService';
import toast from 'react-hot-toast';

export default function Orders() {
  const router = useRouter();
  const { isAuthenticated, initAuth } = useStore();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    initAuth();
  }, [initAuth]);

  useEffect(() => {
    if (isClient && !isAuthenticated) {
      router.push('/auth/login');
    } else if (isClient && isAuthenticated) {
      fetchOrders();
    }
  }, [isClient, isAuthenticated, router]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await orderService.getMyOrders();
      setOrders(response.data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'pending': 'bg-amber-100 text-amber-700 border-amber-200',
      'payment_pending': 'bg-orange-100 text-orange-700 border-orange-200',
      'paid': 'bg-indigo-100 text-indigo-700 border-indigo-200',
      'confirmed': 'bg-blue-100 text-blue-700 border-blue-200',
      'processing': 'bg-sky-100 text-sky-700 border-sky-200',
      'shipped': 'bg-purple-100 text-purple-700 border-purple-200',
      'delivered': 'bg-emerald-100 text-emerald-700 border-emerald-200',
      'cancelled': 'bg-red-100 text-red-700 border-red-200',
    };
    return colors[status] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (!isClient || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-200 border-t-blue-600 mb-4"></div>
        <p className="text-gray-500 font-medium animate-pulse">Loading your orders...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-10">
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">Order History</h1>
            <p className="text-gray-500 mt-2">Check the status of your recent orders, manage returns, and discover similar products.</p>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-16 text-center">
            <div className="bg-blue-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                <FaBoxOpen className="text-4xl text-blue-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Orders Yet</h2>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">Looks like you haven't placed any orders yet. Explore our collection and find something you love!</p>
            <Link
              href="/products"
              className="inline-flex items-center justify-center bg-slate-900 hover:bg-slate-800 text-white font-semibold px-8 py-3 rounded-full transition-all duration-300 shadow-lg shadow-gray-900/10 hover:-translate-y-1"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order._id} className="group bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-xl hover:border-blue-200 transition-all duration-300">
                
                {/* Order Header */}
                <div className="bg-gray-50/50 p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span className="font-medium text-gray-900">Order #{order.orderNumber}</span>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                            <FaCalendarAlt size={12} />
                            <span>{formatDate(order.createdAt)}</span>
                        </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 uppercase tracking-wide ${getStatusColor(order.status)}`}>
                      <span className="w-2 h-2 rounded-full bg-current opacity-75"></span>
                      {order.status.replace('_', ' ')}
                    </span>
                    <Link
                      href={`/orders/${order._id}`}
                      className="hidden md:flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                    >
                      View Invoice <FaChevronRight size={10} />
                    </Link>
                  </div>
                </div>

                {/* Order Body */}
                <div className="p-6">
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    
                    {/* Items Preview */}
                    <div className="flex-1 w-full">
                        <div className="flex -space-x-3 overflow-hidden py-1">
                            {order.items.slice(0, 4).map((item, idx) => (
                            <div key={item._id || idx} className="relative inline-block w-14 h-14 rounded-xl border-2 border-white bg-gray-100 shadow-sm overflow-hidden hover:scale-105 transition-transform z-0 hover:z-10">
                                {item.image ? (
                                <img
                                    src={item.image}
                                    alt={item.name}
                                    className="w-full h-full object-cover"
                                />
                                ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-300">
                                    <FaShoppingBag size={14} />
                                </div>
                                )}
                            </div>
                            ))}
                            {order.items.length > 4 && (
                            <div className="relative inline-flex items-center justify-center w-14 h-14 rounded-xl border-2 border-white bg-gray-50 shadow-sm z-0 text-xs font-bold text-gray-500">
                                +{order.items.length - 4}
                            </div>
                            )}
                        </div>
                        <p className="mt-2 text-sm text-gray-500">
                            {order.items.length} {order.items.length === 1 ? 'item' : 'items'} in this order
                        </p>
                    </div>

                    {/* Total & Action */}
                    <div className="flex flex-row md:flex-col items-center md:items-end justify-between w-full md:w-auto gap-1 md:gap-4">
                        <div className="text-left md:text-right">
                            <p className="text-sm text-gray-500 mb-1">Total Amount</p>
                            <span className="text-xl font-bold text-gray-900">
                                ₹{order.totalAmount.toLocaleString('en-IN')}
                            </span>
                        </div>
                        
                        <Link
                            href={`/orders/${order._id}`}
                            className="inline-flex items-center justify-center px-6 py-2.5 border border-gray-300 shadow-sm text-sm font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 hover:text-blue-600 transition-all w-full md:w-auto"
                        >
                            View Details
                        </Link>
                    </div>

                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}