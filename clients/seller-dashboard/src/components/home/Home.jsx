'use client';

import { useEffect, useState } from 'react';
import { FaBox, FaShoppingCart, FaDollarSign, FaChartLine } from 'react-icons/fa';
import { productService } from '@/lib/services/productService';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    activeProducts: 0,
    totalOrders: 0,
    revenue: 0
  });
  const [recentProducts, setRecentProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await productService.getMyProducts({ limit: 5, sort: '-createdAt' });
      
      setRecentProducts(response.data || []);
      setStats({
        totalProducts: response.pagination?.totalItems || 0,
        activeProducts: response.data?.filter(p => p.isActive).length || 0,
        totalOrders: 0, // Will be implemented with order service
        revenue: 0 // Will be calculated from orders
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Products',
      value: stats.totalProducts,
      icon: FaBox,
      color: 'bg-blue-500',
      change: '+12%'
    },
    {
      title: 'Active Products',
      value: stats.activeProducts,
      icon: FaChartLine,
      color: 'bg-green-500',
      change: '+8%'
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders,
      icon: FaShoppingCart,
      color: 'bg-purple-500',
      change: '+23%'
    },
    {
      title: 'Revenue',
      value: `₹${stats.revenue.toLocaleString('en-IN')}`,
      icon: FaDollarSign,
      color: 'bg-yellow-500',
      change: '+15%'
    }
  ];

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Overview of your store performance</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="text-white text-2xl" />
              </div>
              <span className="text-green-500 text-sm font-semibold">
                {stat.change}
              </span>
            </div>
            <h3 className="text-gray-600 text-sm font-medium mb-1">{stat.title}</h3>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Recent Products */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">Recent Products</h2>
          <a href="/products" className="text-blue-600 hover:text-blue-700 font-semibold text-sm">
            View All →
          </a>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse flex space-x-4">
                <div className="bg-gray-200 h-16 w-16 rounded"></div>
                <div className="flex-1 space-y-2">
                  <div className="bg-gray-200 h-4 rounded w-3/4"></div>
                  <div className="bg-gray-200 h-4 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : recentProducts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Product</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Category</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Price</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Stock</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentProducts.map((product) => (
                  <tr key={product._id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-3">
                        {product.images && product.images[0] ? (
                          <img
                            src={product.images[0].url}
                            alt={product.name}
                            className="w-12 h-12 rounded object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                            <FaBox className="text-gray-400" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-gray-900">{product.name}</p>
                          <p className="text-sm text-gray-500">{product.brand}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-700">{product.category}</td>
                    <td className="py-3 px-4 font-semibold text-gray-900">
                      ₹{(product.discountPrice || product.price).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4 text-gray-700">{product.inventory.quantity}</td>
                    <td className="py-3 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        product.isActive 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {product.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <FaBox className="text-gray-300 text-5xl mx-auto mb-4" />
            <p className="text-gray-500">No products yet... Start by adding your first product!</p>
            <a
              href="/products/new"
              className="inline-block mt-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg"
            >
              Add Product
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
