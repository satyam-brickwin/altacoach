'use client';

import React, { useState } from 'react';
import { addTestBusinesses } from '../action';

export default function TestDataPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  
  const handleAddTestData = async () => {
    setLoading(true);
    try {
      const response = await addTestBusinesses();
      setResult(response);
    } catch (error) {
      setResult({ success: false, error: String(error) });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Admin Test Data Tool</h1>
      
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow mb-6">
        <h2 className="text-xl font-semibold mb-4">Add Test Businesses</h2>
        <p className="mb-4">
          Click the button below to add test businesses with different statuses to the database.
          This will create:
        </p>
        <ul className="list-disc pl-5 mb-4">
          <li>A business with "PENDING" status</li>
          <li>A business with "SUSPENDED" status</li>
          <li>Associated users for each business</li>
        </ul>
        
        <button 
          onClick={handleAddTestData}
          disabled={loading}
          className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
        >
          {loading ? 'Adding Test Data...' : 'Add Test Data'}
        </button>
      </div>
      
      {result && (
        <div className={`p-4 rounded-lg mb-4 ${result.success ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'}`}>
          <h3 className="font-bold">{result.success ? 'Success!' : 'Error'}</h3>
          {result.success ? (
            <div className="mt-2">
              <p>Test businesses added successfully.</p>
              <div className="mt-2">
                <p className="font-semibold">Business counts:</p>
                <ul className="list-disc pl-5">
                  <li>Active: {result.counts.active}</li>
                  <li>Pending: {result.counts.pending}</li>
                  <li>Suspended: {result.counts.suspended}</li>
                </ul>
              </div>
            </div>
          ) : (
            <p>{result.error}</p>
          )}
        </div>
      )}
      
      <div className="mt-6">
        <a href="/admin" className="text-purple-600 hover:underline">
          ← Back to Admin Dashboard
        </a>
      </div>
    </div>
  );
} 