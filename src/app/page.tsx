import Link from 'next/link';
import { ArrowRight, BarChart3, FileText, TrendingUp, Shield, Users } from 'lucide-react';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export default async function HomePage() {
  const session = await getServerSession(authOptions);
  
  if (session) {
    redirect('/dashboard');
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <BarChart3 className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-2xl font-bold text-gray-900">LCM Analytics</span>
            </div>
            <nav className="hidden md:flex space-x-8">
              <Link href="/dashboard/upload" className="text-gray-600 hover:text-gray-900">
                Upload
              </Link>
              <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">
                Dashboard
              </Link>
              <Link href="/analysis" className="text-gray-600 hover:text-gray-900">
                Analysis
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl">
            Real Estate Intelligence
            <span className="block text-blue-600">Platform</span>
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Transform structured data into actionable analytical insights for real estate decision-making.
            Analyze portfolio health, optimize occupancy, and make data-driven investment decisions.
          </p>
            <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
              <div className="rounded-md shadow">
                <Link
                  href="/auth/signin"
                  className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10"
                >
                  Sign In
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </div>
              <div className="mt-3 rounded-md shadow sm:mt-0 sm:ml-3">
                <Link
                  href="/auth/signup"
                  className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10"
                >
                  Sign Up
                </Link>
              </div>
            </div>
        </div>

        {/* Features Section */}
        <div className="mt-20">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">Core Features</h2>
            <p className="mt-4 text-lg text-gray-600">
              Comprehensive real estate analytics across five key modules
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {/* Portfolio Analysis */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <BarChart3 className="h-8 w-8 text-blue-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Portfolio Analysis</h3>
                  <p className="text-sm text-gray-500">Comprehensive portfolio health scoring and risk assessment</p>
                </div>
              </div>
            </div>

            {/* Lease Analysis */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FileText className="h-8 w-8 text-green-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Lease Analysis</h3>
                  <p className="text-sm text-gray-500">Lease expiry tracking and renewal optimization</p>
                </div>
              </div>
            </div>

            {/* Predictive Modelling */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <TrendingUp className="h-8 w-8 text-purple-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Predictive Modelling</h3>
                  <p className="text-sm text-gray-500">Occupancy and revenue forecasting</p>
                </div>
              </div>
            </div>

            {/* Transactions */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Shield className="h-8 w-8 text-orange-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Transactions</h3>
                  <p className="text-sm text-gray-500">Deal flow and performance metrics</p>
                </div>
              </div>
            </div>

            {/* Occupancy */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Users className="h-8 w-8 text-red-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Occupancy</h3>
                  <p className="text-sm text-gray-500">Space utilization and efficiency metrics</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-20 bg-blue-600 rounded-lg shadow-lg">
          <div className="px-6 py-12 sm:px-12 text-center">
            <h2 className="text-3xl font-bold text-white">Ready to Get Started?</h2>
            <p className="mt-4 text-lg text-blue-100">
              Upload your data and start analyzing your real estate portfolio today.
            </p>
            <div className="mt-8">
              <Link
                href="/dashboard/upload"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-white hover:bg-gray-50"
              >
                Upload Your Data
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-gray-500">
              © 2024 LCM Analytics. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
