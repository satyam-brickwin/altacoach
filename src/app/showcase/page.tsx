'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ShowcasePage() {
  const [activeTab, setActiveTab] = useState('admin');
  const router = useRouter();
  
  // Function to handle sign up button click
  const handleSignUp = () => {
    router.push('/register');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold text-blue-600">
              AltaCoach
            </Link>
            <div className="flex items-center space-x-4">
              <Link
                href="/login"
                className="text-gray-600 hover:text-gray-900 font-medium"
              >
                Sign In
              </Link>
              <button
                onClick={handleSignUp}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Showcase Content */}
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">AltaCoach Dashboard Showcase</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Experience our platform's powerful dashboards designed for different user roles.
              Each dashboard is tailored to provide the specific functionality needed for that role.
            </p>
          </div>

          {/* Dashboard Selector Tabs */}
          <div className="flex justify-center mb-8">
            <div className="bg-white rounded-lg shadow-md p-1 flex">
              <button
                onClick={() => setActiveTab('admin')}
                className={`px-6 py-3 rounded-md font-medium transition-colors ${
                  activeTab === 'admin'
                    ? 'bg-purple-100 text-purple-800'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Admin Dashboard
              </button>
              <button
                onClick={() => setActiveTab('business')}
                className={`px-6 py-3 rounded-md font-medium transition-colors ${
                  activeTab === 'business'
                    ? 'bg-blue-100 text-blue-800'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Business Dashboard
              </button>
              <button
                onClick={() => setActiveTab('staff')}
                className={`px-6 py-3 rounded-md font-medium transition-colors ${
                  activeTab === 'staff'
                    ? 'bg-green-100 text-green-800'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Staff Dashboard
              </button>
            </div>
          </div>

          {/* Dashboard Preview */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
            {/* Dashboard Header */}
            {activeTab === 'admin' && (
              <div className="bg-white border-b border-gray-200 p-4">
                <div className="flex items-center">
                  <span className="text-2xl font-bold text-purple-600">AltaCoach</span>
                  <span className="ml-2 text-sm bg-purple-100 text-purple-800 px-2 py-1 rounded-full">Admin</span>
                </div>
              </div>
            )}
            {activeTab === 'business' && (
              <div className="bg-white border-b border-gray-200 p-4">
                <div className="flex items-center">
                  <span className="text-2xl font-bold text-blue-600">AltaCoach</span>
                  <span className="ml-2 text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full">Business</span>
                </div>
              </div>
            )}
            {activeTab === 'staff' && (
              <div className="bg-white border-b border-gray-200 p-4">
                <div className="flex items-center">
                  <span className="text-2xl font-bold text-green-600">AltaCoach</span>
                  <span className="ml-2 text-sm bg-green-100 text-green-800 px-2 py-1 rounded-full">Staff</span>
                </div>
              </div>
            )}

            {/* Dashboard Content */}
            <div className="p-6">
              {/* Admin Dashboard Preview */}
              {activeTab === 'admin' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Admin Dashboard</h2>
                  <p className="text-gray-600 mb-6">
                    Complete control over your entire AltaCoach platform. Manage businesses, content, and system settings.
                  </p>
                  
                  {/* Stats Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-purple-50 rounded-lg p-4">
                      <div className="flex items-center">
                        <div className="bg-purple-100 p-3 rounded-full">
                          <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                        </div>
                        <div className="ml-4">
                          <h3 className="text-lg font-medium text-gray-900">Businesses</h3>
                          <p className="text-2xl font-bold text-purple-600">34</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="flex items-center">
                        <div className="bg-blue-100 p-3 rounded-full">
                          <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <div className="ml-4">
                          <h3 className="text-lg font-medium text-gray-900">Total Users</h3>
                          <p className="text-2xl font-bold text-blue-600">1,248</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-green-50 rounded-lg p-4">
                      <div className="flex items-center">
                        <div className="bg-green-100 p-3 rounded-full">
                          <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <div className="ml-4">
                          <h3 className="text-lg font-medium text-gray-900">Content Items</h3>
                          <p className="text-2xl font-bold text-green-600">356</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-purple-50 p-4 rounded-lg text-purple-800 text-center">
                    <p className="text-lg font-medium">Admin features include business management, content publishing, analytics, and system settings</p>
                  </div>

                  <div className="flex justify-center mt-8">
                    <Link 
                      href="/register" 
                      className="px-6 py-3 bg-purple-600 text-white font-medium rounded-md hover:bg-purple-700 transition-colors"
                    >
                      Sign Up For Admin Access
                    </Link>
                  </div>
                </div>
              )}

              {/* Business Dashboard Preview */}
              {activeTab === 'business' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Business Dashboard</h2>
                  <p className="text-gray-600 mb-6">
                    Manage your organization's training materials, staff, and access analytics to improve learning outcomes.
                  </p>
                  
                  {/* Stats Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="flex items-center">
                        <div className="bg-blue-100 p-3 rounded-full">
                          <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <div className="ml-4">
                          <h3 className="text-lg font-medium text-gray-900">Staff Members</h3>
                          <p className="text-2xl font-bold text-blue-600">24</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-green-50 rounded-lg p-4">
                      <div className="flex items-center">
                        <div className="bg-green-100 p-3 rounded-full">
                          <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <div className="ml-4">
                          <h3 className="text-lg font-medium text-gray-900">Documents</h3>
                          <p className="text-2xl font-bold text-green-600">18</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-purple-50 rounded-lg p-4">
                      <div className="flex items-center">
                        <div className="bg-purple-100 p-3 rounded-full">
                          <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                          </svg>
                        </div>
                        <div className="ml-4">
                          <h3 className="text-lg font-medium text-gray-900">AI Interactions</h3>
                          <p className="text-2xl font-bold text-purple-600">1,248</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg text-blue-800 text-center">
                    <p className="text-lg font-medium">Business features include staff management, knowledge base maintenance, usage analytics, and training assignment</p>
                  </div>

                  <div className="flex justify-center mt-8">
                    <Link 
                      href="/register" 
                      className="px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Sign Up For Business Access
                    </Link>
                  </div>
                </div>
              )}

              {/* Staff Dashboard Preview */}
              {activeTab === 'staff' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Staff Dashboard</h2>
                  <p className="text-gray-600 mb-6">
                    Access your training materials, track your progress, and get AI-powered assistance when you need it.
                  </p>
                  
                  {/* Stats Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-green-50 rounded-lg p-4">
                      <div className="flex items-center">
                        <div className="bg-green-100 p-3 rounded-full">
                          <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div className="ml-4">
                          <h3 className="text-lg font-medium text-gray-900">Completed Trainings</h3>
                          <p className="text-2xl font-bold text-green-600">4</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-yellow-50 rounded-lg p-4">
                      <div className="flex items-center">
                        <div className="bg-yellow-100 p-3 rounded-full">
                          <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div className="ml-4">
                          <h3 className="text-lg font-medium text-gray-900">In Progress</h3>
                          <p className="text-2xl font-bold text-yellow-600">2</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="flex items-center">
                        <div className="bg-blue-100 p-3 rounded-full">
                          <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                          </svg>
                        </div>
                        <div className="ml-4">
                          <h3 className="text-lg font-medium text-gray-900">AI Interactions</h3>
                          <p className="text-2xl font-bold text-blue-600">28</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg text-green-800 text-center">
                    <p className="text-lg font-medium">Staff features include personal learning dashboard, knowledge base access, and AI assistance</p>
                  </div>

                  <div className="flex justify-center mt-8">
                    <Link 
                      href="/register" 
                      className="px-6 py-3 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 transition-colors"
                    >
                      Sign Up For Staff Access
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Feature List */}
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">Key Features For All Users</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">AI Chat Assistant</h3>
                <p className="text-gray-600">
                  Get instant answers and support from our AI assistant that understands your training materials and company policies.
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Document Chat</h3>
                <p className="text-gray-600">
                  Staff members can upload documents and chat directly with their contents, getting precise answers from training materials.
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Analytics & Insights</h3>
                <p className="text-gray-600">
                  Track engagement, identify knowledge gaps, and measure the impact of your training initiatives with detailed analytics.
                </p>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="mt-16 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Ready to get started?</h2>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Join thousands of organizations that use AltaCoach to improve their training outcomes and employee performance.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                href="/register"
                className="px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors"
              >
                Sign Up Now
              </Link>
              <Link
                href="/contact"
                className="px-6 py-3 bg-white border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-50 transition-colors"
              >
                Contact Sales
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>© {new Date().getFullYear()} AltaCoach. All rights reserved.</p>
          <div className="flex justify-center space-x-6 mt-4">
            <a href="#" className="text-gray-400 hover:text-white">
              Privacy Policy
            </a>
            <a href="#" className="text-gray-400 hover:text-white">
              Terms of Service
            </a>
            <a href="#" className="text-gray-400 hover:text-white">
              Contact Us
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
} 