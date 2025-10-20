'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  BarChart3, 
  FileText, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  TrendingUp,
  User as UserIcon,
  DollarSign,
  Building2,
  Upload
} from 'lucide-react';
import { signOut } from 'next-auth/react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

        // Dashboard and five core LCM modules
        const mainNavigation = [
          { name: 'Dashboard', href: '/dashboard', icon: BarChart3 },
          { name: 'Portfolio Analysis', href: '/dashboard/portfolio', icon: TrendingUp },
          { name: 'Lease Analysis', href: '/dashboard/modules/lease-analysis', icon: FileText },
          { name: 'Predictive Modelling', href: '/dashboard/modules/predictive-modelling', icon: BarChart3 },
          { name: 'Transactions', href: '/dashboard/modules/transactions', icon: DollarSign },
          { name: 'Occupancy', href: '/dashboard/modules/occupancy', icon: Building2 },
        ];


  const isActive = (href: string) => pathname === href;

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-gray-600 bg-opacity-75 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 flex-shrink-0">
            <div className="flex items-center">
              <BarChart3 className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">LCM Analytics</span>
            </div>
            <button
              onClick={onClose}
              className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

                {/* Navigation - Scrollable */}
                <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                  {/* Main Navigation */}
                  <div className="space-y-1">
                    {mainNavigation.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.name}
                          href={item.href}
                          onClick={onClose}
                          className={`
                            group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors
                            ${isActive(item.href)
                              ? 'bg-blue-100 text-blue-700'
                              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                            }
                          `}
                        >
                          <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
                          {item.name}
                        </Link>
                      );
                    })}
                  </div>

                </nav>

          {/* User section */}
          <div className="border-t border-gray-200 p-4 flex-shrink-0">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
                  <span className="text-sm font-medium text-white">TU</span>
                </div>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-gray-900">Test User</p>
                <p className="text-xs text-gray-500">test@example.com</p>
              </div>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: '/auth/signin' })}
              className="mt-3 w-full flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-md transition-colors"
            >
              <LogOut className="mr-3 h-5 w-5" />
              Sign out
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
