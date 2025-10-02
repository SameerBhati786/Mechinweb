import React, { useState, useEffect } from 'react';
import { Activity, AlertTriangle, CheckCircle, RefreshCw, Settings } from 'lucide-react';
import { DebugService } from '../utils/debug';

interface SystemHealth {
  overall: 'healthy' | 'warning' | 'critical';
  services: boolean;
  database: boolean;
  zoho: boolean;
  payments: boolean;
  lastCheck: Date;
}

const SystemHealthMonitor: React.FC = () => {
  const [health, setHealth] = useState<SystemHealth>({
    overall: 'warning',
    services: false,
    database: false,
    zoho: false,
    payments: false,
    lastCheck: new Date()
  });
  const [isChecking, setIsChecking] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    // Initial health check
    performHealthCheck();
    
    // Set up periodic health checks (every 5 minutes)
    const interval = setInterval(performHealthCheck, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  const performHealthCheck = async () => {
    setIsChecking(true);
    
    try {
      const diagnostic = await DebugService.runFullDiagnostic();
      
      const newHealth: SystemHealth = {
        services: diagnostic.services?.healthy || false,
        database: diagnostic.database?.healthy || false,
        zoho: diagnostic.zoho?.healthy || false,
        payments: diagnostic.paymentFlow?.healthy || false,
        lastCheck: new Date(),
        overall: 'healthy'
      };
      
      // Determine overall health
      const healthyCount = Object.values(newHealth).filter(v => v === true).length;
      if (healthyCount === 4) {
        newHealth.overall = 'healthy';
      } else if (healthyCount >= 2) {
        newHealth.overall = 'warning';
      } else {
        newHealth.overall = 'critical';
      }
      
      setHealth(newHealth);
    } catch (error) {
      console.error('Health check failed:', error);
      setHealth(prev => ({
        ...prev,
        overall: 'critical',
        lastCheck: new Date()
      }));
    } finally {
      setIsChecking(false);
    }
  };

  const getHealthIcon = () => {
    switch (health.overall) {
      case 'healthy':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'critical':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
    }
  };

  const getHealthColor = () => {
    switch (health.overall) {
      case 'healthy':
        return 'border-green-500/30 bg-green-500/10';
      case 'warning':
        return 'border-yellow-500/30 bg-yellow-500/10';
      case 'critical':
        return 'border-red-500/30 bg-red-500/10';
    }
  };

  // Only show in production for monitoring
  if (import.meta.env.DEV) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className={`bg-gray-900/95 backdrop-blur-xl rounded-xl border ${getHealthColor()} transition-all duration-300 ${
        isExpanded ? 'w-80' : 'w-auto'
      }`}>
        <div className="p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {getHealthIcon()}
              <span className="text-white text-sm font-medium">
                System {health.overall}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={performHealthCheck}
                disabled={isChecking}
                className="text-gray-400 hover:text-white transition-colors"
                title="Refresh health check"
              >
                <RefreshCw className={`w-4 h-4 ${isChecking ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-gray-400 hover:text-white transition-colors"
                title="Toggle details"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          {isExpanded && (
            <div className="mt-4 space-y-2">
              <div className="text-xs text-gray-400 mb-3">
                Last check: {health.lastCheck.toLocaleTimeString()}
              </div>
              
              <div className="space-y-2">
                {[
                  { label: 'Database', status: health.database },
                  { label: 'Services', status: health.services },
                  { label: 'Zoho Integration', status: health.zoho },
                  { label: 'Payment Flow', status: health.payments }
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between">
                    <span className="text-gray-300 text-xs">{item.label}</span>
                    <div className="flex items-center space-x-1">
                      {item.status ? (
                        <CheckCircle className="w-3 h-3 text-green-500" />
                      ) : (
                        <AlertTriangle className="w-3 h-3 text-red-500" />
                      )}
                      <span className={`text-xs ${item.status ? 'text-green-400' : 'text-red-400'}`}>
                        {item.status ? 'OK' : 'FAIL'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              
              {health.overall !== 'healthy' && (
                <div className="mt-3 pt-3 border-t border-gray-700">
                  <button
                    onClick={() => (window as any).debugMechinweb.repairSystem()}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-xs font-medium transition-colors"
                  >
                    Run System Repair
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SystemHealthMonitor;