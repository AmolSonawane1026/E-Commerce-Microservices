'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  FaUser, 
  FaEdit, 
  FaSave, 
  FaShoppingBag, 
  FaHeart, 
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
  FaCamera
} from 'react-icons/fa';
import { authService } from '@/lib/services/authService';
import { useStore } from '@/lib/store/useStore';
import toast from 'react-hot-toast';

export default function Profile() {
  const router = useRouter();
  const { user, isAuthenticated, setUser, initAuth } = useStore();
  const [isClient, setIsClient] = useState(false);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'India'
    }
  });

  useEffect(() => {
    setIsClient(true);
    initAuth();
  }, [initAuth]);

  useEffect(() => {
    if (isClient && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isClient, isAuthenticated, router]);

  useEffect(() => {
    if (user) {
      setProfileData({
        firstName: user.profile?.firstName || '',
        lastName: user.profile?.lastName || '',
        phone: user.profile?.phone || '',
        address: {
          street: user.profile?.address?.street || '',
          city: user.profile?.address?.city || '',
          state: user.profile?.address?.state || '',
          zipCode: user.profile?.address?.zipCode || '',
          country: user.profile?.address?.country || 'India'
        }
      });
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setProfileData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setProfileData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSave = async () => {
    setLoading(true);

    try {
      const response = await authService.updateProfile({ profile: profileData });
      
      if (response.success) {
        setUser(response.data.user);
        toast.success('Profile updated successfully!');
        setEditing(false);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (!isClient || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const tabs = [
    { id: 'profile', name: 'Profile', icon: FaUser },
    { id: 'orders', name: 'My Orders', icon: FaShoppingBag },
    { id: 'wishlist', name: 'Wishlist', icon: FaHeart },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Header Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden mb-8 transform transition-all duration-300 hover:shadow-3xl">
          {/* Cover Image with Gradient */}
          <div className="h-48 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 relative">
            <div className="absolute inset-0 bg-black bg-opacity-20"></div>
            <div className="absolute inset-0 bg-pattern opacity-10"></div>
          </div>

          {/* Profile Content */}
          <div className="relative px-6 pb-6">
            {/* Avatar */}
            <div className="flex flex-col sm:flex-row items-center sm:items-end -mt-20 mb-4">
              <div className="relative group">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-400 to-purple-600 p-1 shadow-2xl">
                  <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                    <FaUser className="text-6xl text-transparent bg-clip-text bg-gradient-to-br from-blue-600 to-purple-600" />
                  </div>
                </div>
                <button className="absolute bottom-0 right-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-3 rounded-full shadow-lg hover:scale-110 transition-transform">
                  <FaCamera className="text-sm" />
                </button>
              </div>

              <div className="mt-4 sm:mt-0 sm:ml-6 text-center sm:text-left flex-1">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {profileData.firstName} {profileData.lastName}
                </h1>
                <div className="flex flex-wrap gap-4 mt-2 justify-center sm:justify-start">
                  <div className="flex items-center text-gray-600">
                    <FaEnvelope className="mr-2 text-blue-500" />
                    <span className="text-sm">{user.email}</span>
                  </div>
                  {profileData.phone && (
                    <div className="flex items-center text-gray-600">
                      <FaPhone className="mr-2 text-green-500" />
                      <span className="text-sm">{profileData.phone}</span>
                    </div>
                  )}
                </div>

                {/* Stats */}
                <div className="flex gap-6 mt-4 justify-center sm:justify-start">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">0</p>
                    <p className="text-xs text-gray-500">Orders</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-600">0</p>
                    <p className="text-xs text-gray-500">Wishlist</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-pink-600">0</p>
                    <p className="text-xs text-gray-500">Reviews</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 sm:mt-0">
                <button
                  onClick={() => editing ? handleSave() : setEditing(true)}
                  disabled={loading}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 flex items-center space-x-2"
                >
                  {editing ? (
                    <>
                      {loading ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      ) : (
                        <FaSave />
                      )}
                      <span>{loading ? 'Saving...' : 'Save Changes'}</span>
                    </>
                  ) : (
                    <>
                      <FaEdit />
                      <span>Edit Profile</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 mt-6">
              <nav className="flex space-x-8">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <tab.icon />
                    <span>{tab.name}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {activeTab === 'profile' && (
            <div className="space-y-8 animate-fadeIn">
              {/* Personal Information */}
              <div>
                <div className="flex items-center mb-6">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mr-3">
                    <FaUser className="text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Personal Information</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      First Name
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      disabled={!editing}
                      className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 font-medium ${
                        editing 
                          ? 'border-blue-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 bg-white text-gray-900' 
                          : 'border-gray-200 bg-gray-50 text-gray-700'
                      } outline-none`}
                      value={profileData.firstName}
                      onChange={handleInputChange}
                      placeholder="Enter first name"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Last Name
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      disabled={!editing}
                      className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 font-medium ${
                        editing 
                          ? 'border-blue-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 bg-white text-gray-900' 
                          : 'border-gray-200 bg-gray-50 text-gray-700'
                      } outline-none`}
                      value={profileData.lastName}
                      onChange={handleInputChange}
                      placeholder="Enter last name"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Email Address
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        disabled
                        className="w-full px-4 py-3 pl-11 rounded-xl border-2 border-gray-200 bg-gray-50 text-gray-600 font-medium"
                        value={user.email}
                      />
                      <FaEnvelope className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Phone Number
                    </label>
                    <div className="relative">
                      <input
                        type="tel"
                        name="phone"
                        disabled={!editing}
                        className={`w-full px-4 py-3 pl-11 rounded-xl border-2 transition-all duration-200 font-medium ${
                          editing 
                            ? 'border-blue-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 bg-white text-gray-900' 
                            : 'border-gray-200 bg-gray-50 text-gray-700'
                        } outline-none`}
                        value={profileData.phone}
                        onChange={handleInputChange}
                        placeholder="+91 98765 43210"
                      />
                      <FaPhone className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Address Information */}
              <div>
                <div className="flex items-center mb-6">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center mr-3">
                    <FaMapMarkerAlt className="text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Address Information</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2 space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Street Address
                    </label>
                    <input
                      type="text"
                      name="address.street"
                      disabled={!editing}
                      className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 font-medium ${
                        editing 
                          ? 'border-blue-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 bg-white text-gray-900' 
                          : 'border-gray-200 bg-gray-50 text-gray-700'
                      } outline-none`}
                      value={profileData.address.street}
                      onChange={handleInputChange}
                      placeholder="123 Main Street, Apartment 4B"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      City
                    </label>
                    <input
                      type="text"
                      name="address.city"
                      disabled={!editing}
                      className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 font-medium ${
                        editing 
                          ? 'border-blue-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 bg-white text-gray-900' 
                          : 'border-gray-200 bg-gray-50 text-gray-700'
                      } outline-none`}
                      value={profileData.address.city}
                      onChange={handleInputChange}
                      placeholder="Mumbai"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      State
                    </label>
                    <input
                      type="text"
                      name="address.state"
                      disabled={!editing}
                      className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 font-medium ${
                        editing 
                          ? 'border-blue-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 bg-white text-gray-900' 
                          : 'border-gray-200 bg-gray-50 text-gray-700'
                      } outline-none`}
                      value={profileData.address.state}
                      onChange={handleInputChange}
                      placeholder="Maharashtra"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Zip Code
                    </label>
                    <input
                      type="text"
                      name="address.zipCode"
                      disabled={!editing}
                      className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 font-medium ${
                        editing 
                          ? 'border-blue-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 bg-white text-gray-900' 
                          : 'border-gray-200 bg-gray-50 text-gray-700'
                      } outline-none`}
                      value={profileData.address.zipCode}
                      onChange={handleInputChange}
                      placeholder="400001"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Country
                    </label>
                    <input
                      type="text"
                      name="address.country"
                      disabled={!editing}
                      className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 font-medium ${
                        editing 
                          ? 'border-blue-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 bg-white text-gray-900' 
                          : 'border-gray-200 bg-gray-50 text-gray-700'
                      } outline-none`}
                      value={profileData.address.country}
                      onChange={handleInputChange}
                      placeholder="India"
                    />
                  </div>
                </div>
              </div>

              {editing && (
                <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                  <button
                    onClick={() => setEditing(false)}
                    className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={loading}
                    className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50"
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="text-center py-12 animate-fadeIn">
              <FaShoppingBag className="text-6xl text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No Orders Yet</h3>
              <p className="text-gray-500 mb-6">Start shopping to see your orders here!</p>
              <button
                onClick={() => router.push('/products')}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                Start Shopping
              </button>
            </div>
          )}

          {activeTab === 'wishlist' && (
            <div className="text-center py-12 animate-fadeIn">
              <FaHeart className="text-6xl text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">Your Wishlist is Empty</h3>
              <p className="text-gray-500 mb-6">Add products to your wishlist to save them for later!</p>
              <button
                onClick={() => router.push('/products')}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                Browse Products
              </button>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }

        .bg-pattern {
          background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
        }
      `}</style>
    </div>
  );
}
