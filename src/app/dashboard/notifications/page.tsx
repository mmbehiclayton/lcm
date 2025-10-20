'use client';

import { useState } from 'react';
import { Bell, Check, X, Filter, Search, Archive, Trash2 } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function DashboardNotificationsPage() {
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: 'New analysis completed',
      message: 'Portfolio analysis for Q1 2024 is ready for review. Key insights include improved occupancy rates and ROI optimization opportunities.',
      type: 'success',
      time: '2 hours ago',
      unread: true,
      category: 'Analysis'
    },
    {
      id: 2,
      title: 'Data upload successful',
      message: 'Your property data has been processed successfully. 5 properties were imported and validated.',
      type: 'info',
      time: '1 day ago',
      unread: true,
      category: 'Data'
    },
    {
      id: 3,
      title: 'System maintenance scheduled',
      message: 'Scheduled maintenance will occur on Sunday at 2AM EST. The system will be unavailable for approximately 2 hours.',
      type: 'warning',
      time: '3 days ago',
      unread: false,
      category: 'System'
    },
    {
      id: 4,
      title: 'Report generated',
      message: 'Monthly portfolio summary report has been generated and is available for download.',
      type: 'info',
      time: '1 week ago',
      unread: false,
      category: 'Reports'
    },
    {
      id: 5,
      title: 'Security alert',
      message: 'Unusual login activity detected from a new location (Seattle, WA). Please verify this was you.',
      type: 'warning',
      time: '1 week ago',
      unread: false,
      category: 'Security'
    },
    {
      id: 6,
      title: 'Property update',
      message: 'Lease renewal for Downtown Office Tower has been completed. New terms are now active.',
      type: 'success',
      time: '2 weeks ago',
      unread: false,
      category: 'Properties'
    }
  ]);

  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || 
                         (filter === 'unread' && notification.unread) ||
                         (filter === 'category' && notification.category.toLowerCase() === filter);
    return matchesSearch && matchesFilter;
  });

  const markAsRead = (id: number) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, unread: false }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, unread: false }))
    );
  };

  const deleteNotification = (id: number) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'success':
        return '✅';
      case 'warning':
        return '⚠️';
      case 'error':
        return '❌';
      default:
        return 'ℹ️';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'border-l-green-500 bg-green-50';
      case 'warning':
        return 'border-l-yellow-500 bg-yellow-50';
      case 'error':
        return 'border-l-red-500 bg-red-50';
      default:
        return 'border-l-blue-500 bg-blue-50';
    }
  };

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <DashboardLayout>
      <div>
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
              <p className="mt-2 text-gray-600">Stay updated with your portfolio activities and system alerts</p>
            </div>
            <div className="flex space-x-3">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Mark all as read
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Bell className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Notifications</p>
                <p className="text-2xl font-semibold text-gray-900">{notifications.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center">
                  <div className="h-2 w-2 bg-red-600 rounded-full"></div>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Unread</p>
                <p className="text-2xl font-semibold text-gray-900">{unreadCount}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                  <div className="h-2 w-2 bg-green-600 rounded-full"></div>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Read</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {notifications.length - unreadCount}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center">
                  <div className="h-2 w-2 bg-yellow-600 rounded-full"></div>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">This Week</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {notifications.filter(n => {
                    const notificationDate = new Date(n.time);
                    const weekAgo = new Date();
                    weekAgo.setDate(weekAgo.getDate() - 7);
                    return notificationDate > weekAgo;
                  }).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search notifications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="flex gap-4">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Notifications</option>
                <option value="unread">Unread Only</option>
                <option value="analysis">Analysis</option>
                <option value="data">Data</option>
                <option value="system">System</option>
                <option value="reports">Reports</option>
                <option value="security">Security</option>
                <option value="properties">Properties</option>
              </select>
            </div>
          </div>
        </div>

        {/* Notifications List */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Recent Notifications</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-6 border-l-4 ${getTypeColor(notification.type)} ${
                  notification.unread ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center">
                      <span className="text-lg mr-3">{getTypeIcon(notification.type)}</span>
                      <div className="flex-1">
                        <div className="flex items-center">
                          <h4 className="text-sm font-medium text-gray-900">
                            {notification.title}
                          </h4>
                          {notification.unread && (
                            <span className="ml-2 h-2 w-2 bg-blue-600 rounded-full"></span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {notification.message}
                        </p>
                        <div className="flex items-center mt-2 space-x-4">
                          <span className="text-xs text-gray-500">{notification.time}</span>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            {notification.category}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    {notification.unread && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className="p-1 text-gray-400 hover:text-gray-600"
                        title="Mark as read"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      onClick={() => deleteNotification(notification.id)}
                      className="p-1 text-gray-400 hover:text-red-600"
                      title="Delete notification"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {filteredNotifications.length === 0 && (
            <div className="text-center py-12">
              <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications found</h3>
              <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
