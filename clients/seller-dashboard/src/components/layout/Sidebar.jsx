'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  FaHome, 
  FaBox, 
  FaShoppingCart, 
  FaChartLine, 
  FaCog,
  FaSignOutAlt,
  FaPlus
} from 'react-icons/fa';
import { useStore } from '@/lib/store/useStore';

export default function Sidebar() {
  const pathname = usePathname();
  const { logout } = useStore();

  const navigation = [
    { name: 'Dashboard', href: '/', icon: FaHome },
    { name: 'Products', href: '/products', icon: FaBox },
    { name: 'Add Product', href: '/products/new', icon: FaPlus },
    { name: 'Orders', href: '/orders', icon: FaShoppingCart },
    { name: 'Analytics', href: '/analytics', icon: FaChartLine },
    { name: 'Settings', href: '/settings', icon: FaCog },
  ];

  const isActive = (href) => pathname === href;

  return (
    <div className="h-screen w-64 bg-gray-900 text-white fixed left-0 top-0 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-800">
        <h1 className="text-2xl font-bold">🏪 Seller Hub</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4">
        <ul className="space-y-2">
          {navigation.map((item) => (
            <li key={item.name}>
              <Link
                href={item.href}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
                  isActive(item.href)
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <item.icon className="text-xl" />
                <span className="font-medium">{item.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-gray-800">
        <button
          onClick={logout}
          className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition w-full"
        >
          <FaSignOutAlt className="text-xl" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
}

