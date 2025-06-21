// frontend/src/components/ConnectionTest.js
import React, { useState, useEffect } from 'react';

const ConnectionTest = () => {
  const [status, setStatus] = useState('Testing connection...');
  const [details, setDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const testConnection = async () => {
      setIsLoading(true);
      try {
        // Test backend health endpoint - Updated to port 5000
        const healthResponse = await fetch('http://localhost:5000/health');
        const healthData = await healthResponse.json();
        
        // Test inventory endpoint - Updated to port 5000
        const inventoryResponse = await fetch('http://localhost:5000/api/inventory', {
          headers: {
            'Content-Type': 'application/json',
            // Add auth token if available
            ...(localStorage.getItem('authToken') && {
              'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            })
          }
        });
        
        let inventoryData = null;
        if (inventoryResponse.ok) {
          inventoryData = await inventoryResponse.json();
        } else {
          // If 401, it means auth is working but we need to login
          if (inventoryResponse.status === 401) {
            inventoryData = { error: '401 Unauthorized - Authentication required' };
          } else {
            inventoryData = { error: `${inventoryResponse.status} ${inventoryResponse.statusText}` };
          }
        }
        
        setStatus('✅ Backend connection successful!');
        setDetails({
          health: healthData,
          inventory: inventoryData,
          apiUrl: process.env.REACT_APP_API_URL,
          backendPort: '5000', // Updated port
          frontendPort: window.location.port || '3000'
        });
      } catch (error) {
        setStatus(`❌ Connection failed: ${error.message}`);
        setDetails({ 
          error: error.message,
          apiUrl: process.env.REACT_APP_API_URL,
          suggestions: [
            'Check if backend is running on port 5000',
            'Verify REACT_APP_API_URL in .env file',
            'Check for CORS issues in browser console',
            'Ensure backend has CORS enabled for localhost:3000'
          ]
        });
      } finally {
        setIsLoading(false);
      }
    };

    testConnection();
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4">Backend Connection Test</h2>
        
        <div className="mb-4 p-4 rounded-lg bg-gray-50">
          <div className="flex items-center mb-2">
            {isLoading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-2"></div>
            ) : null}
            <span className="text-lg font-medium">{status}</span>
          </div>
        </div>

        {details && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-800 mb-2">Configuration</h3>
                <ul className="text-sm space-y-1">
                  <li><strong>API URL:</strong> {details.apiUrl || 'Not set'}</li>
                  <li><strong>Backend Port:</strong> {details.backendPort}</li>
                  <li><strong>Frontend Port:</strong> {details.frontendPort}</li>
                </ul>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-semibold text-green-800 mb-2">Health Check</h3>
                {details.health ? (
                  <p className="text-sm text-green-700">✅ Backend is responding</p>
                ) : (
                  <p className="text-sm text-red-700">❌ Backend not responding</p>
                )}
              </div>
            </div>

            {details.inventory && (
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h3 className="font-semibold text-yellow-800 mb-2">Inventory API</h3>
                {details.inventory.error ? (
                  <div>
                    <p className="text-sm text-yellow-700 mb-2">⚠️ {details.inventory.error}</p>
                    {details.inventory.error.includes('401') && (
                      <p className="text-xs text-yellow-600">
                        This is normal if authentication is required. You'll need to login first.
                      </p>
                    )}
                  </div>
                ) : (
                  <div>
                    <p className="text-sm text-green-700 mb-2">✅ Inventory API accessible</p>
                    {details.inventory.data && (
                      <p className="text-xs text-green-600">
                        Found {details.inventory.data.length || 0} inventory items
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            {details.suggestions && (
              <div className="bg-red-50 p-4 rounded-lg">
                <h3 className="font-semibold text-red-800 mb-2">Troubleshooting Suggestions</h3>
                <ul className="text-sm text-red-700 space-y-1">
                  {details.suggestions.map((suggestion, index) => (
                    <li key={index}>• {suggestion}</li>
                  ))}
                </ul>
              </div>
            )}

            <details className="mt-4">
              <summary className="cursor-pointer font-medium text-gray-700 hover:text-gray-900">
                Show Technical Details
              </summary>
              <pre className="mt-2 p-4 bg-gray-100 rounded-lg text-xs overflow-auto">
                {JSON.stringify(details, null, 2)}
              </pre>
            </details>
          </div>
        )}

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-blue-800 mb-2">Quick Actions</h3>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => window.location.reload()}
              className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
            >
              Retry Test
            </button>
            <a
              href="http://localhost:5000/health"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
            >
              Open Backend Health
            </a>
            <a
              href="http://localhost:5000/api/inventory"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1 bg-purple-600 text-white rounded text-sm hover:bg-purple-700"
            >
              Open Inventory API
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConnectionTest;