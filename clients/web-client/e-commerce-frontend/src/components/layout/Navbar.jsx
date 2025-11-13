'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaShoppingCart, FaUser, FaSearch, FaHeart, FaBars, FaTimes } from 'react-icons/fa';
import { useStore } from '@/lib/store/useStore';

export default function Navbar() {
  const router = useRouter();
  const { user, isAuthenticated, logout, cart, initAuth, initCart } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    initAuth();
    initCart();
  }, [initAuth, initCart]);

  const cartItemsCount = cart.reduce((count, item) => count + item.quantity, 0);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${searchQuery}`);
      setSearchQuery('');
    }
  };

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
  };

  if (!isClient) {
    return null;
  }

  return (
    <nav className="bg-gray-900 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold flex items-center hover:text-blue-400 transition">
            🛒 E-Shop
          </Link>

          {/* Desktop Search */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-8">
            <input
              type="search"
              placeholder="Search products..."
              className="w-full px-4 py-2 rounded-l-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-r-lg transition"
            >
              <FaSearch />
            </button>
          </form>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            <Link href="/products" className="hover:text-blue-400 transition">
              Products
            </Link>

            {isAuthenticated ? (
              <>
                <Link href="/cart" className="relative hover:text-blue-400 transition">
                  <FaShoppingCart size={22} />
                  {cartItemsCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {cartItemsCount}
                    </span>
                  )}
                </Link>

                <Link href="/wishlist" className="hover:text-blue-400 transition">
                  <FaHeart size={20} />
                </Link>

                <div className="relative group">
                  <button className="flex items-center space-x-2 hover:text-blue-400 transition">
                    <FaUser />
                    <span>{user?.profile?.firstName || user?.email}</span>
                  </button>
                  
                  <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                    <Link href="/profile" className="block px-4 py-2 hover:bg-gray-700 rounded-t-lg">
                      My Profile
                    </Link>
                    <Link href="/orders" className="block px-4 py-2 hover:bg-gray-700">
                      My Orders
                    </Link>
                    <hr className="border-gray-700" />
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 hover:bg-gray-700 rounded-b-lg"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="hover:text-blue-400 transition">
                  Login
                </Link>
                <Link
                  href="/auth/register"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-2xl"
          >
            {mobileMenuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>

        {/* Mobile Search */}
        <form onSubmit={handleSearch} className="md:hidden pb-4 flex">
          <input
            type="search"
            placeholder="Search products..."
            className="w-full px-4 py-2 rounded-l-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-r-lg transition"
          >
            <FaSearch />
          </button>
        </form>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-gray-800 border-t border-gray-700">
          <div className="px-4 py-2 space-y-2">
            <Link
              href="/products"
              className="block py-2 hover:text-blue-400 transition"
              onClick={() => setMobileMenuOpen(false)}
            >
              Products
            </Link>

            {isAuthenticated ? (
              <>
                <Link
                  href="/cart"
                  className="flex items-center justify-between py-2 hover:text-blue-400 transition"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span>Cart</span>
                  {cartItemsCount > 0 && (
                    <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {cartItemsCount}
                    </span>
                  )}
                </Link>

                <Link
                  href="/profile"
                  className="block py-2 hover:text-blue-400 transition"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  My Profile
                </Link>

                <Link
                  href="/orders"
                  className="block py-2 hover:text-blue-400 transition"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  My Orders
                </Link>

                <button
                  onClick={handleLogout}
                  className="block w-full text-left py-2 hover:text-blue-400 transition"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="block py-2 hover:text-blue-400 transition"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  href="/auth/register"
                  className="block py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-center transition"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

