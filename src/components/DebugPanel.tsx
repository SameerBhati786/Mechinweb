import React, { useState } from 'react';
import { Bug, Play, CheckCircle, XCircle, AlertTriangle, RefreshCw } from 'lucide-react';
import { DebugService } from '../utils/debug';

const DebugPanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<any>(null);

  const runDiagnostic = async () => {
    setIsRunning(true);
    setResults(null);
    
    try {
      const diagnosticResults = await DebugService.runFullDiagnostic();
      setResults(diagnosticResults);
    } catch (error) {
      setResults({ error: error.message });
    } finally {
      setIsRunning(false);
    }
  };

  const testServiceResolution = async () => {
    setIsRunning(true);
    try {
      const testResults = await DebugService.testServiceResolution('email-migration');
      console.log('Service resolution test:', testResults);
      alert('Service resolution test completed. Check console for details.');
    } catch (error) {
      console.error('Service resolution test failed:', error);
      alert(`Service resolution test failed: ${error.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  // Only show in development
  if (import.meta.env.PROD) {
    return null;
  }

  return (
    <div className="fixed bottom-20 right-6 z-50">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-red-500 hover:bg-red-600 text-white p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110"
          title="Debug Panel"
        >
          <Bug className="w-5 h-5" />
        </button>
      ) : (
        <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-96 max-h-96 overflow-y-auto shadow-2xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-bold flex items-center">
              <Bug className="w-5 h-5 mr-2" />
              Debug Panel
            </h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-white"
            >
              ×
            </button>
          </div>
          
          <div className="space-y-3">
            <button
              onClick={runDiagnostic}
              disabled={isRunning}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center space-x-2"
            >
              {isRunning ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
              <span>{isRunning ? 'Running...' : 'Full Diagnostic'}</span>
            </button>
            
            <button
              onClick={testServiceResolution}
              disabled={isRunning}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Test Service Resolution
            </button>
          </div>
          
          {results && (
            <div className="mt-4 p-3 bg-gray-800 rounded-lg">
              <h4 className="text-white font-semibold mb-2">Results:</h4>
              <div className="text-xs text-gray-300 space-y-1">
                {results.error ? (
                  <div className="flex items-center text-red-400">
                    <XCircle className="w-3 h-3 mr-1" />
                    <span>Error: {results.error}</span>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center text-green-400">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      <span>Database: OK</span>
                    </div>
                    <div className="flex items-center text-green-400">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      <span>Services: {results.services ? 'OK' : 'Failed'}</span>
                    </div>
                    <div className="flex items-center text-green-400">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      <span>Zoho: {results.zoho?.success ? 'OK' : 'Failed'}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DebugPanel;