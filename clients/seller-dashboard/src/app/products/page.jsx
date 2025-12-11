'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FaPlus, FaEdit, FaTrash, FaEye, FaSearch } from 'react-icons/fa';
import { productService } from '@/lib/services/productService';
import toast from 'react-hot-toast';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await productService.getMyProducts({ limit: 100 });
      setProducts(response.data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await productService.getCategories();
      setCategories(response.data.categories || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;

    try {
      await productService.deleteProduct(id);
      toast.success('Product deleted successfully');
      fetchProducts();
    } catch (error) {
      toast.error('Failed to delete product');
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !filterCategory || product.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Products</h1>
          <p className="text-gray-600 mt-1">{products.length} products in your store</p>
        </div>
        <Link
          href="/products/new"
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg flex items-center space-x-2 transition"
        >
          <FaPlus />
          <span>Add Product</span>
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading products...</p>
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Product</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Category</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Price</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Stock</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr key={product._id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-3">
                        {product.images && product.images[0] ? (
                          <img
                            src={product.images[0].url}
                            alt={product.name}
                            className="w-14 h-14 rounded object-cover"
                          />
                        ) : (
                          <div className="w-14 h-14 bg-gray-200 rounded flex items-center justify-center">
                            <span className="text-gray-400 text-xs">No img</span>
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-gray-900">{product.name}</p>
                          <p className="text-sm text-gray-500">{product.brand}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-700">{product.category}</td>
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-semibold text-gray-900">
                          ₹{(product.discountPrice || product.price).toLocaleString('en-IN')}
                        </p>
                        {product.discountPrice && product.discountPrice < product.price && (
                          <p className="text-xs text-gray-500 line-through">
                            ₹{product.price.toLocaleString('en-IN')}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`font-semibold ${
                        product.inventory.quantity > product.inventory.lowStockAlert
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}>
                        {product.inventory.quantity}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        product.isActive 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {product.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <Link
                          href={`/products/${product._id}`}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                          title="View"
                        >
                          <FaEye />
                        </Link>
                        <Link
                          href={`/products/edit/${product._id}`}
                          className="p-2 text-green-600 hover:bg-green-50 rounded"
                          title="Edit"
                        >
                          <FaEdit />
                        </Link>
                        <button
                          onClick={() => handleDelete(product._id, product.name)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded"
                          title="Delete"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <p className="text-gray-500 mb-4">
              {searchQuery || filterCategory ? 'No products match your filters' : 'No products yet'}
            </p>
            <Link
              href="/products/new"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg"
            >
              Add Your First Product
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

