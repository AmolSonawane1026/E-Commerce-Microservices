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
  FaCamera,
  FaBoxOpen,
  FaChevronRight,
  FaCalendarAlt,
  FaSignOutAlt
} from 'react-icons/fa';
import { authService } from '@/lib/services/authService';
import { orderService } from '@/lib/services/orderService';
import { useStore } from '@/lib/store/useStore';
import toast from 'react-hot-toast';

export default function Profile() {
  const router = useRouter();
  const { user, isAuthenticated, setUser, initAuth } = useStore();
  const [isClient, setIsClient] = useState(false);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState(null);

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

  // Fetch orders when orders tab is active
  useEffect(() => {
    const fetchOrders = async () => {
      if (activeTab === 'orders' && isAuthenticated) {
        setOrdersLoading(true);
        setOrdersError(null);
        try {
          const response = await orderService.getMyOrders();
          setOrders(response.data || []);
        } catch (error) {
          console.error('Error fetching orders:', error);
          setOrdersError(error.response?.data?.message || 'Failed to fetch orders');
        } finally {
          setOrdersLoading(false);
        }
      }
    };

    fetchOrders();
  }, [activeTab, isAuthenticated]);

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

  // Helper functions for formatting
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(price);
  };

  const getStatusColor = (status) => {
    const s = status?.toLowerCase();
    switch(s) {
        case 'delivered': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
        case 'processing': return 'bg-blue-50 text-blue-700 border-blue-100';
        case 'cancelled': return 'bg-red-50 text-red-700 border-red-100';
        case 'shipped': return 'bg-indigo-50 text-indigo-700 border-indigo-100';
        default: return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

  if (!isClient || !user) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-slate-200 border-t-slate-900 mb-4"></div>
        <p className="text-slate-500 text-sm font-medium animate-pulse">Loading profile...</p>
      </div>
    );
  }

  const tabs = [
    { id: 'profile', name: 'Profile Settings', icon: FaUser },
    { id: 'orders', name: 'Order History', icon: FaShoppingBag },
    { id: 'wishlist', name: 'My Wishlist', icon: FaHeart },
  ];

  return (
    <div className="min-h-screen bg-slate-50/50 font-sans pb-20 selection:bg-slate-900 selection:text-white">
      
      {/* Header Banner */}
      <div className="bg-slate-900 h-80 relative overflow-hidden">
         {/* Abstract geometric pattern overlay */}
         <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>
         <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>
         <div className="absolute top-0 right-0 p-12 opacity-20">
            <svg width="400" height="400" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                <path fill="#FFFFFF" d="M44.7,-76.4C58.9,-69.2,71.8,-59.1,81.6,-46.6C91.4,-34.1,98.1,-19.2,95.8,-4.9C93.5,9.3,82.1,22.9,71.4,34.8C60.7,46.7,50.6,56.9,39.1,64.3C27.6,71.7,14.7,76.3,0.9,74.7C-12.8,73.1,-26.8,65.3,-39.9,56.9C-53,48.5,-65.2,39.5,-73.6,27.8C-82,16.1,-86.6,1.7,-84.3,-11.5C-82,-24.7,-72.8,-36.7,-61.6,-45.5C-50.4,-54.3,-37.2,-59.9,-24.4,-68.2C-11.6,-76.5,0.8,-87.5,14.7,-89.2C28.6,-90.9,44,-83.3,44.7,-76.4Z" transform="translate(100 100)" />
            </svg>
         </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-32 relative z-10">
        
        {/* Profile Card */}
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 p-6 sm:p-10 mb-8 backdrop-blur-xl">
          <div className="flex flex-col md:flex-row items-center md:items-end gap-8">
            
            {/* Avatar */}
            <div className="relative group shrink-0">
              <div className="w-36 h-36 rounded-full border-[6px] border-white shadow-2xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center overflow-hidden">
                 {user.profile?.avatar ? (
                     <img src={user.profile.avatar} alt="Profile" className="w-full h-full object-cover" />
                 ) : (
                     <span className="text-5xl font-bold text-slate-300 select-none">
                        {profileData.firstName?.[0]}{profileData.lastName?.[0]}
                     </span>
                 )}
              </div>
              <button className="absolute bottom-2 right-2 bg-slate-900 text-white p-3 rounded-full shadow-lg hover:scale-110 hover:bg-black transition-all cursor-pointer border-4 border-white">
                <FaCamera size={14} />
              </button>
            </div>

            {/* Info */}
            <div className="text-center md:text-left flex-1 pb-3 w-full">
               <div className="flex flex-col md:flex-row md:items-center justify-between w-full gap-4">
                   <div>
                       <h1 className="text-4xl font-extrabold text-slate-900 mb-2 tracking-tight">
                         {profileData.firstName} {profileData.lastName}
                       </h1>
                       <div className="flex flex-wrap justify-center md:justify-start gap-x-6 gap-y-2 text-sm font-medium text-slate-500">
                          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-50 border border-slate-100">
                             <FaEnvelope className="text-slate-400" />
                             {user.email}
                          </div>
                          {profileData.phone && (
                            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-50 border border-slate-100">
                                <FaPhone className="text-slate-400" />
                                {profileData.phone}
                            </div>
                          )}
                       </div>
                   </div>

                   {/* Actions */}
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => editing ? handleSave() : setEditing(true)}
                            disabled={loading}
                            className={`px-8 py-3 rounded-full font-bold text-sm flex items-center gap-2 transition-all shadow-sm ${
                                editing 
                                ? 'bg-slate-900 text-white hover:bg-black hover:shadow-lg hover:shadow-slate-900/20' 
                                : 'bg-white border-2 border-slate-100 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                            }`}
                        >
                            {loading ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent"></div>
                            ) : editing ? (
                                <> <FaSave size={14} /> Save Changes </>
                            ) : (
                                <> <FaEdit size={14} /> Edit Profile </>
                            )}
                        </button>
                    </div>
               </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Sidebar Navigation */}
            <div className="lg:col-span-3 space-y-6 lg:sticky lg:top-8">
                <nav className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden p-2">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl text-sm font-bold transition-all duration-200 mb-1 last:mb-0 ${
                                activeTab === tab.id
                                ? 'bg-slate-900 text-white shadow-md shadow-slate-900/20'
                                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                            }`}
                        >
                            <div className="flex items-center gap-4">
                                <tab.icon size={16} className={activeTab === tab.id ? 'text-slate-300' : 'text-slate-400'} />
                                {tab.name}
                            </div>
                            {activeTab === tab.id && <FaChevronRight size={12} className="opacity-50" />}
                        </button>
                    ))}
                </nav>

                {/* Account Summary */}
                <div className="bg-slate-900 rounded-3xl shadow-lg p-6 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full -mr-10 -mt-10 blur-2xl"></div>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-6">Overview</h3>
                    <div className="space-y-5 relative z-10">
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-slate-300">Total Orders</span>
                            <span className="font-bold text-xl">{orders.length}</span>
                        </div>
                        <div className="w-full h-px bg-slate-800"></div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-slate-300">Wishlist</span>
                            <span className="font-bold text-xl">0</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="lg:col-span-9">
                
                {/* --- PROFILE TAB --- */}
                {activeTab === 'profile' && (
                    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 sm:p-10 animate-fade-in-up">
                        <div className="flex items-center gap-4 mb-10 pb-6 border-b border-slate-100">
                            <div className="p-3 bg-slate-50 rounded-2xl text-slate-900">
                                <FaUser size={20} />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-slate-900">Personal Information</h2>
                                <p className="text-slate-500 text-sm mt-1">Manage your personal details and address.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                             <div className="group">
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">First Name</label>
                                <input
                                    type="text"
                                    name="firstName"
                                    disabled={!editing}
                                    value={profileData.firstName}
                                    onChange={handleInputChange}
                                    className={`w-full px-5 py-4 rounded-xl text-sm font-medium transition-all outline-none ${
                                        editing 
                                        ? 'bg-white border-2 border-slate-200 focus:border-slate-900 focus:ring-4 focus:ring-slate-100' 
                                        : 'bg-slate-50 border-2 border-transparent text-slate-600'
                                    }`}
                                />
                             </div>
                             <div className="group">
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Last Name</label>
                                <input
                                    type="text"
                                    name="lastName"
                                    disabled={!editing}
                                    value={profileData.lastName}
                                    onChange={handleInputChange}
                                    className={`w-full px-5 py-4 rounded-xl text-sm font-medium transition-all outline-none ${
                                        editing 
                                        ? 'bg-white border-2 border-slate-200 focus:border-slate-900 focus:ring-4 focus:ring-slate-100' 
                                        : 'bg-slate-50 border-2 border-transparent text-slate-600'
                                    }`}
                                />
                             </div>
                             <div className="group">
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Email Address</label>
                                <div className="relative">
                                    <input
                                        type="email"
                                        disabled
                                        value={user.email}
                                        className="w-full px-5 py-4 pl-12 rounded-xl border-2 border-transparent bg-slate-50 text-slate-500 font-medium cursor-not-allowed"
                                    />
                                    <FaEnvelope className="absolute left-5 top-5 text-slate-400" />
                                </div>
                             </div>
                             <div className="group">
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Phone Number</label>
                                <div className="relative">
                                    <input
                                        type="tel"
                                        name="phone"
                                        disabled={!editing}
                                        value={profileData.phone}
                                        onChange={handleInputChange}
                                        className={`w-full px-5 py-4 pl-12 rounded-xl text-sm font-medium transition-all outline-none ${
                                            editing 
                                            ? 'bg-white border-2 border-slate-200 focus:border-slate-900 focus:ring-4 focus:ring-slate-100' 
                                            : 'bg-slate-50 border-2 border-transparent text-slate-600'
                                        }`}
                                    />
                                    <FaPhone className="absolute left-5 top-5 text-slate-400" />
                                </div>
                             </div>
                        </div>

                        <div className="flex items-center gap-4 mb-8 pt-6">
                            <div className="p-3 bg-slate-50 rounded-2xl text-slate-900">
                                <FaMapMarkerAlt size={20} />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-slate-900">Shipping Address</h2>
                                <p className="text-slate-500 text-sm mt-1">Where should we send your orders?</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2 group">
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Street Address</label>
                                <input
                                    type="text"
                                    name="address.street"
                                    disabled={!editing}
                                    value={profileData.address.street}
                                    onChange={handleInputChange}
                                    className={`w-full px-5 py-4 rounded-xl text-sm font-medium transition-all outline-none ${
                                        editing 
                                        ? 'bg-white border-2 border-slate-200 focus:border-slate-900 focus:ring-4 focus:ring-slate-100' 
                                        : 'bg-slate-50 border-2 border-transparent text-slate-600'
                                    }`}
                                />
                            </div>
                            <div className="group">
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">City</label>
                                <input
                                    type="text"
                                    name="address.city"
                                    disabled={!editing}
                                    value={profileData.address.city}
                                    onChange={handleInputChange}
                                    className={`w-full px-5 py-4 rounded-xl text-sm font-medium transition-all outline-none ${
                                        editing 
                                        ? 'bg-white border-2 border-slate-200 focus:border-slate-900 focus:ring-4 focus:ring-slate-100' 
                                        : 'bg-slate-50 border-2 border-transparent text-slate-600'
                                    }`}
                                />
                            </div>
                            <div className="group">
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">State / Province</label>
                                <input
                                    type="text"
                                    name="address.state"
                                    disabled={!editing}
                                    value={profileData.address.state}
                                    onChange={handleInputChange}
                                    className={`w-full px-5 py-4 rounded-xl text-sm font-medium transition-all outline-none ${
                                        editing 
                                        ? 'bg-white border-2 border-slate-200 focus:border-slate-900 focus:ring-4 focus:ring-slate-100' 
                                        : 'bg-slate-50 border-2 border-transparent text-slate-600'
                                    }`}
                                />
                            </div>
                            <div className="group">
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Postal / Zip Code</label>
                                <input
                                    type="text"
                                    name="address.zipCode"
                                    disabled={!editing}
                                    value={profileData.address.zipCode}
                                    onChange={handleInputChange}
                                    className={`w-full px-5 py-4 rounded-xl text-sm font-medium transition-all outline-none ${
                                        editing 
                                        ? 'bg-white border-2 border-slate-200 focus:border-slate-900 focus:ring-4 focus:ring-slate-100' 
                                        : 'bg-slate-50 border-2 border-transparent text-slate-600'
                                    }`}
                                />
                            </div>
                            <div className="group">
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Country</label>
                                <input
                                    type="text"
                                    name="address.country"
                                    disabled={!editing}
                                    value={profileData.address.country}
                                    onChange={handleInputChange}
                                    className={`w-full px-5 py-4 rounded-xl text-sm font-medium transition-all outline-none ${
                                        editing 
                                        ? 'bg-white border-2 border-slate-200 focus:border-slate-900 focus:ring-4 focus:ring-slate-100' 
                                        : 'bg-slate-50 border-2 border-transparent text-slate-600'
                                    }`}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* --- ORDERS TAB --- */}
                {activeTab === 'orders' && (
                    <div className="space-y-6 animate-fade-in-up">
                        {ordersLoading ? (
                            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-20 flex justify-center">
                                <div className="animate-spin rounded-full h-10 w-10 border-4 border-slate-100 border-t-slate-900"></div>
                            </div>
                        ) : ordersError ? (
                            <div className="bg-white rounded-3xl shadow-sm border border-red-100 p-10 text-center">
                                <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <FaBoxOpen className="text-red-400 text-2xl" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 mb-2">Something went wrong</h3>
                                <p className="text-red-500 mb-6 text-sm">{ordersError}</p>
                                <button onClick={() => setActiveTab('orders')} className="text-sm font-bold text-slate-900 underline hover:text-black">Try Again</button>
                            </div>
                        ) : orders.length === 0 ? (
                            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-20 text-center">
                                <div className="bg-slate-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                                    <FaBoxOpen className="text-slate-300 text-4xl" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-2">No Orders Yet</h3>
                                <p className="text-slate-500 mb-8 max-w-sm mx-auto">Looks like you haven't placed any orders yet. Explore our collection and find something you love.</p>
                                <button
                                    onClick={() => router.push('/products')}
                                    className="px-8 py-3 bg-slate-900 text-white rounded-full font-bold hover:bg-black hover:shadow-lg transition-all"
                                >
                                    Start Shopping
                                </button>
                            </div>
                        ) : (
                            orders.map((order) => (
                                <div 
                                    key={order._id}
                                    onClick={() => router.push(`/orders/${order._id}`)}
                                    className="bg-white rounded-3xl border border-slate-100 p-6 sm:p-8 hover:shadow-xl hover:shadow-slate-200/50 hover:border-slate-200 transition-all cursor-pointer group"
                                >
                                    <div className="flex flex-col sm:flex-row justify-between items-start mb-6 gap-6">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-4 mb-2">
                                                <h3 className="font-bold text-lg text-slate-900">#{order._id.slice(-8).toUpperCase()}</h3>
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold border capitalize flex items-center gap-1.5 ${getStatusColor(order.status)}`}>
                                                    <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60"></span>
                                                    {order.status.replace('_', ' ')}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                                                <FaCalendarAlt size={12} className="text-slate-400" />
                                                <span>{formatDate(order.createdAt)}</span>
                                            </div>
                                        </div>
                                        <div className="text-left sm:text-right">
                                            <span className="block text-2xl font-bold text-slate-900 tracking-tight">{formatPrice(order.totalAmount)}</span>
                                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">{order.items?.length || 0} items</span>
                                        </div>
                                    </div>

                                    {/* Order Preview Images */}
                                    <div className="flex items-center justify-between mt-6 pt-6 border-t border-slate-50">
                                        <div className="flex -space-x-4 overflow-hidden py-1 pl-1">
                                            {order.items?.slice(0, 4).map((item, idx) => (
                                                <div key={idx} className="w-12 h-12 rounded-full border-[3px] border-white bg-slate-100 overflow-hidden shadow-sm relative hover:scale-110 hover:z-10 transition-transform duration-200">
                                                    {/* Placeholder if no image, normally item.image */}
                                                    <div className="w-full h-full flex items-center justify-center bg-slate-200 text-slate-400 text-[9px] font-bold">IMG</div>
                                                </div>
                                            ))}
                                            {order.items?.length > 4 && (
                                                <div className="w-12 h-12 rounded-full border-[3px] border-white bg-slate-900 flex items-center justify-center text-xs font-bold text-white shadow-sm z-10">
                                                    +{order.items.length - 4}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2 text-slate-900 text-sm font-bold group-hover:translate-x-2 transition-transform">
                                            View Details <FaChevronRight size={10} className="text-slate-400" />
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {/* --- WISHLIST TAB --- */}
                {activeTab === 'wishlist' && (
                    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-20 text-center animate-fade-in-up">
                        <div className="bg-rose-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                            <FaHeart className="text-rose-400 text-4xl" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">Your Wishlist is Empty</h3>
                        <p className="text-slate-500 mb-8 max-w-sm mx-auto">Heart items while you shop to save them here for later.</p>
                        <button
                            onClick={() => router.push('/products')}
                            className="px-8 py-3 bg-slate-900 text-white rounded-full font-bold hover:bg-black hover:shadow-lg transition-all"
                        >
                            Explore Products
                        </button>
                    </div>
                )}
            </div>
        </div>
      </div>
      
      <style jsx global>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
}