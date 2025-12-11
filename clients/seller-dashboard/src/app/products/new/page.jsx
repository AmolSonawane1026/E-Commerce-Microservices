
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaUpload, FaTimes, FaImage } from 'react-icons/fa';
import { productService } from '@/lib/services/productService';
import toast from 'react-hot-toast';

export default function AddProduct() {
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    discountPrice: '',
    category: '',
    subCategory: '',
    brand: '',
    inventory: {
      quantity: '',
      sku: '',
      warehouse: ''
    },
    specifications: {},
    tags: [],
    isFeatured: false
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await productService.getCategories();
      setCategories(response.data.categories || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length + images.length > 5) {
      toast.error('Maximum 5 images allowed');
      return;
    }

    files.forEach(file => {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Each image must be less than 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        setImages(prev => [...prev, base64String]);
        setImagePreviews(prev => [...prev, URL.createObjectURL(file)]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.description || !formData.price || !formData.category) {
      toast.error('Please fill all required fields');
      return;
    }

    setLoading(true);

    try {
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        discountPrice: formData.discountPrice ? parseFloat(formData.discountPrice) : undefined,
        inventory: {
          quantity: parseInt(formData.inventory.quantity) || 0,
          sku: formData.inventory.sku,
          warehouse: formData.inventory.warehouse
        },
        images: images,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean)
      };

      await productService.createProduct(productData);
      toast.success('Product created successfully!');
      router.push('/products');
    } catch (error) {
      console.error('Error creating product:', error);
      toast.error(error.response?.data?.message || 'Failed to create product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Add New Product</h1>
        <p className="text-gray-600 mt-1">Fill in the details to add a new product to your store</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Basic Information */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Basic Information</h2>
          </div>

          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Name *
            </label>
            <input
              type="text"
              name="name"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Samsung Galaxy S23 Ultra"
              value={formData.name}
              onChange={handleChange}
            />
          </div>

          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              name="description"
              required
              rows="4"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Describe your product in detail..."
              value={formData.description}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category *
            </label>
            <select
              name="category"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={formData.category}
              onChange={handleChange}
            >
              <option value="">Select Category</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sub Category
            </label>
            <input
              type="text"
              name="subCategory"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Smartphones"
              value={formData.subCategory}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Brand
            </label>
            <input
              type="text"
              name="brand"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Samsung"
              value={formData.brand}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags (comma separated)
            </label>
            <input
              type="text"
              name="tags"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., smartphone, 5g, android"
              value={formData.tags}
              onChange={handleChange}
            />
          </div>

          {/* Pricing */}
          <div className="lg:col-span-2 mt-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Pricing</h2>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Price (₹) *
            </label>
            <input
              type="number"
              name="price"
              required
              min="0"
              step="0.01"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="99999"
              value={formData.price}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Discount Price (₹)
            </label>
            <input
              type="number"
              name="discountPrice"
              min="0"
              step="0.01"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="89999"
              value={formData.discountPrice}
              onChange={handleChange}
            />
          </div>

          {/* Inventory */}
          <div className="lg:col-span-2 mt-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Inventory</h2>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quantity *
            </label>
            <input
              type="number"
              name="inventory.quantity"
              required
              min="0"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="100"
              value={formData.inventory.quantity}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              SKU
            </label>
            <input
              type="text"
              name="inventory.sku"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="SAM-S23-001"
              value={formData.inventory.sku}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Warehouse Location
            </label>
            <input
              type="text"
              name="inventory.warehouse"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Mumbai"
              value={formData.inventory.warehouse}
              onChange={handleChange}
            />
          </div>

          {/* Featured */}
          <div className="lg:col-span-2">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                name="isFeatured"
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                checked={formData.isFeatured}
                onChange={handleChange}
              />
              <span className="text-sm font-medium text-gray-700">
                Mark as Featured Product
              </span>
            </label>
          </div>

          {/* Images */}
          <div className="lg:col-span-2 mt-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Product Images</h2>
            <p className="text-sm text-gray-600 mb-4">Upload up to 5 images (max 5MB each)</p>
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
              {imagePreviews.length < 5 && (
                <label className="cursor-pointer flex flex-col items-center">
                  <FaUpload className="text-4xl text-gray-400 mb-2" />
                  <span className="text-sm text-gray-600">Click to upload images</span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                </label>
              )}

              {imagePreviews.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition"
                      >
                        <FaTimes />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="lg:col-span-2 flex justify-end space-x-4 mt-6">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Product'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

