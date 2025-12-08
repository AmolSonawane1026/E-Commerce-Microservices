'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  FaShoppingBag,
  FaMapMarkerAlt,
  FaCreditCard,
  FaTruck,
  FaCheckCircle,
  FaClock,
  FaTimes,
  FaBoxOpen,
  FaCalendarAlt,
  FaChevronLeft
} from 'react-icons/fa';
import { useStore } from '@/lib/store/useStore';
import { orderService } from '@/lib/services/orderService';
import toast from 'react-hot-toast';

export default function OrderDetails() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated, initAuth, clearCart } = useStore();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    initAuth();
  }, [initAuth]);

  useEffect(() => {
    if (isClient && !isAuthenticated) {
      router.push('/auth/login');
    } else if (isClient && isAuthenticated && params.id) {
      fetchOrder();
    }
  }, [isClient, isAuthenticated, params.id, router]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const response = await orderService.getOrderById(params.id);
      setOrder(response.data.order);

      // Clear cart after successfully viewing order
      clearCart();
    } catch (error) {
      console.error('Error fetching order:', error);
      toast.error('Failed to load order details');
      router.push('/orders');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!confirm('Are you sure you want to cancel this order?')) return;

    setCancelling(true);
    try {
      await orderService.cancelOrder(params.id, 'Cancelled by customer');
      toast.success('Order cancelled successfully');
      fetchOrder(); // Refresh order data
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to cancel order');
    } finally {
      setCancelling(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'pending': 'bg-amber-50 text-amber-700 border-amber-200',
      'payment_pending': 'bg-orange-50 text-orange-700 border-orange-200',
      'paid': 'bg-blue-50 text-blue-700 border-blue-200',
      'confirmed': 'bg-indigo-50 text-indigo-700 border-indigo-200',
      'processing': 'bg-sky-50 text-sky-700 border-sky-200',
      'packed': 'bg-purple-50 text-purple-700 border-purple-200',
      'shipped': 'bg-violet-50 text-violet-700 border-violet-200',
      'out_for_delivery': 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200',
      'delivered': 'bg-emerald-50 text-emerald-700 border-emerald-200',
      'cancelled': 'bg-red-50 text-red-700 border-red-200',
      'returned': 'bg-orange-50 text-orange-700 border-orange-200',
      'refunded': 'bg-gray-50 text-gray-700 border-gray-200',
    };
    return colors[status] || 'bg-gray-50 text-gray-700 border-gray-200';
  };

  const getStatusIcon = (status) => {
    if (status === 'delivered') return <FaCheckCircle />;
    if (status === 'cancelled') return <FaTimes />;
    if (status === 'shipped' || status === 'out_for_delivery') return <FaTruck />;
    return <FaClock />;
  };

  const canCancelOrder = (status) => {
    return ['pending', 'payment_pending', 'confirmed'].includes(status);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!isClient || loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-200 border-t-slate-900 mb-4"></div>
        <p className="text-gray-500 animate-pulse">Loading order details...</p>
      </div>
    );
  }

  if (!order) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Navigation & Title */}
        <div className="mb-8">
          <button 
            onClick={() => router.push('/orders')}
            className="flex items-center text-sm text-gray-500 hover:text-gray-900 mb-4 transition-colors"
          >
            <FaChevronLeft className="mr-2" size={12} /> Back to Orders
          </button>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-baseline gap-3">
                Order #{order.orderNumber}
              </h1>
              <div className="flex items-center text-gray-500 mt-2 text-sm">
                <FaCalendarAlt className="mr-2" size={14} />
                <span>Placed on {formatDate(order.createdAt)}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className={`px-4 py-2 rounded-full text-sm font-bold border flex items-center gap-2 shadow-sm ${getStatusColor(order.status)}`}>
                {getStatusIcon(order.status)}
                <span className="uppercase tracking-wide text-xs">{order.status.replace('_', ' ')}</span>
              </span>
              
              {canCancelOrder(order.status) && (
                <button
                  onClick={handleCancelOrder}
                  disabled={cancelling}
                  className="px-4 py-2 bg-white border border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 rounded-full font-semibold text-sm disabled:opacity-50 transition-all shadow-sm"
                >
                  {cancelling ? 'Cancelling...' : 'Cancel Order'}
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Content (Left) */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Order Items */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/50 flex items-center gap-2">
                <FaShoppingBag className="text-gray-400" />
                <h2 className="font-bold text-gray-900">Order Items</h2>
                <span className="bg-gray-200 text-gray-600 text-xs px-2 py-0.5 rounded-full font-bold ml-auto">{order.items.length} Items</span>
              </div>
              
              <div className="p-6 space-y-6">
                {order.items.map((item) => (
                  <div key={item._id} className="flex gap-4 group">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0 border border-gray-100 group-hover:border-gray-200 transition-colors">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                          <FaBoxOpen size={24} />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 flex flex-col justify-center">
                      <div className="flex justify-between items-start gap-4">
                        <div>
                            <h3 className="font-bold text-gray-900 text-lg leading-tight">{item.name}</h3>
                            <p className="text-sm text-gray-500 mt-1">Qty: {item.quantity} × ₹{item.price.toLocaleString('en-IN')}</p>
                        </div>
                        <div className="text-right">
                            <p className="font-bold text-gray-900 text-lg">
                                ₹{item.subtotal.toLocaleString('en-IN')}
                            </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Timeline */}
            {order.timeline && order.timeline.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/50 flex items-center gap-2">
                  <FaClock className="text-gray-400" />
                  <h2 className="font-bold text-gray-900">Tracking History</h2>
                </div>
                
                <div className="p-6">
                  <div className="relative pl-4 border-l-2 border-gray-100 space-y-8 ml-2">
                    {order.timeline.map((event, index) => (
                      <div key={index} className="relative">
                        <div className={`absolute -left-[21px] top-1.5 w-3 h-3 rounded-full border-2 ${index === 0 ? 'bg-blue-600 border-blue-600 ring-4 ring-blue-50' : 'bg-white border-gray-300'}`}></div>
                        <div>
                            <p className={`font-semibold ${index === 0 ? 'text-gray-900' : 'text-gray-600'}`}>{event.message}</p>
                            <p className="text-xs text-gray-400 mt-1">{formatDate(event.timestamp)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            {/* Tracking Info Block */}
            {order.trackingInfo?.trackingNumber && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                 <div>
                    <h3 className="font-bold text-blue-900 flex items-center gap-2">
                        <FaTruck /> Tracking Information
                    </h3>
                    <div className="mt-2 text-sm text-blue-800">
                        <p><span className="opacity-70">Carrier:</span> <span className="font-semibold">{order.trackingInfo.carrier}</span></p>
                        <p><span className="opacity-70">Number:</span> <span className="font-mono">{order.trackingInfo.trackingNumber}</span></p>
                    </div>
                 </div>
                 {order.trackingInfo.trackingUrl && (
                    <a
                      href={order.trackingInfo.trackingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-6 py-2 bg-white text-blue-700 font-semibold rounded-lg shadow-sm border border-blue-100 hover:bg-blue-50 transition-colors text-sm"
                    >
                      Track Shipment
                    </a>
                  )}
              </div>
            )}
          </div>

          {/* Sidebar (Right) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Payment Summary */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-6">
              <h2 className="font-bold text-gray-900 mb-6 text-lg">Order Summary</h2>
              
              <div className="space-y-3 pb-6 border-b border-gray-100 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-medium text-gray-900">₹{order.subtotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Tax</span>
                  <span className="font-medium text-gray-900">₹{order.tax.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className="font-medium text-gray-900">
                    {order.shippingCharges === 0 ? <span className="text-green-600">Free</span> : `₹${order.shippingCharges.toLocaleString('en-IN')}`}
                  </span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-₹{order.discount.toLocaleString('en-IN')}</span>
                  </div>
                )}
              </div>
              
              <div className="pt-4 flex justify-between items-end">
                <span className="font-bold text-gray-900">Total Amount</span>
                <span className="font-extrabold text-2xl text-gray-900">₹{order.totalAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-2 mb-4 text-gray-400">
                <FaMapMarkerAlt />
                <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wider">Shipping Address</h3>
              </div>
              
              <div className="text-sm text-gray-600 leading-relaxed">
                <p className="font-bold text-gray-900 text-base mb-1">
                  {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                </p>
                <p>{order.shippingAddress.street}</p>
                <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}</p>
                <p>{order.shippingAddress.country}</p>
                <div className="mt-3 pt-3 border-t border-gray-50 space-y-1">
                    <p><span className="font-medium text-gray-900">Phone:</span> {order.shippingAddress.phone}</p>
                    {order.shippingAddress.email && (
                        <p><span className="font-medium text-gray-900">Email:</span> {order.shippingAddress.email}</p>
                    )}
                </div>
              </div>
            </div>

            {/* Payment Details */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-2 mb-4 text-gray-400">
                <FaCreditCard />
                <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wider">Payment Info</h3>
              </div>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                    <span className="text-gray-500">Method</span>
                    <span className="font-semibold text-gray-900 capitalize">
                        {order.paymentInfo.method === 'cod' ? 'Cash on Delivery' : order.paymentInfo.method}
                    </span>
                </div>
                
                <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                    <span className="text-gray-500">Status</span>
                    <span className={`font-bold capitalize px-2 py-0.5 rounded text-xs ${
                        order.paymentInfo.status === 'succeeded' ? 'bg-green-100 text-green-700' :
                        order.paymentInfo.status === 'failed' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                        {order.paymentInfo.status}
                    </span>
                </div>

                {order.paymentInfo.paidAt && (
                   <div className="text-xs text-gray-400 text-center mt-2">
                      Paid on {formatDate(order.paymentInfo.paidAt)}
                   </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}