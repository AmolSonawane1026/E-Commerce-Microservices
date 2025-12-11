'use client';

import { useEffect } from 'react';
import { FaBell, FaUser } from 'react-icons/fa';
import { useStore } from '@/lib/store/useStore';

export default function Header() {
  const { user, initAuth } = useStore();

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  return (
    <header className="h-16 bg-white border-b border-gray-200 fixed top-0 left-64 right-0 z-10">
      <div className="h-full px-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">
            Welcome back, {user?.profile?.firstName || 'Seller'}!
          </h2>
        </div>

        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <button className="relative p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100">
            <FaBell className="text-xl" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* Profile */}
          <div className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-100 cursor-pointer">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <FaUser className="text-white text-sm" />
            </div>
            <div className="text-sm">
              <p className="font-medium text-gray-900">
                {user?.profile?.firstName} {user?.profile?.lastName}
              </p>
              <p className="text-gray-500 text-xs">{user?.email}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

