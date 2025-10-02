import React, { useState, useEffect } from 'react';
import { getExchangeRate, formatCurrency, convertCurrency, getPreferredCurrency, detectUserLocation, refreshExchangeRates } from '../utils/currency';
import { Globe, RefreshCw } from 'lucide-react';

interface CurrencyToggleProps {
  usdAmount: number;
  onCurrencyChange?: (currency: string, amount: number) => void;
  className?: string;
  showAutoDetect?: boolean;
  showRefresh?: boolean;
}

const CurrencyToggle: React.FC<CurrencyToggleProps> = ({ 
  usdAmount, 
  onCurrencyChange,
  className = '',
  showAutoDetect = true,
  showRefresh = false
}) => {
  const [currency, setCurrency] = useState<string>('USD');
  const [convertedAmount, setConvertedAmount] = useState<number>(usdAmount);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [detectedCountry, setDetectedCountry] = useState<string>('');
  const [exchangeRate, setExchangeRate] = useState<number>(1);

  const supportedCurrencies = [
    { code: 'USD', name: 'US Dollar', symbol: '$', flag: '🇺🇸' },
    { code: 'INR', name: 'Indian Rupee', symbol: '₹', flag: '🇮🇳' },
    { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', flag: '🇦🇺' },
    { code: 'EUR', name: 'Euro', symbol: '€', flag: '🇪🇺' },
    { code: 'GBP', name: 'British Pound', symbol: '£', flag: '🇬🇧' },
    { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', flag: '🇨🇦' }
  ];

  useEffect(() => {
    const initializeCurrency = async () => {
      setLoading(true);
      try {
        // Get user's preferred currency (auto-detected or saved)
        const preferredCurrency = await getPreferredCurrency();
        console.log('Preferred currency:', preferredCurrency);
        
        // Get location for display
        const location = await detectUserLocation();
        setDetectedCountry(location.country_name);
        
        // Get exchange rate and convert amount
        const rate = await getExchangeRate(preferredCurrency);
        setExchangeRate(rate);
        
        const converted = await convertCurrency(usdAmount, 'USD', preferredCurrency);
        
        setCurrency(preferredCurrency);
        setConvertedAmount(converted);
        
        console.log(`Currency conversion: $${usdAmount} USD = ${converted} ${preferredCurrency} (rate: ${rate})`);
        
        // Notify parent component
        onCurrencyChange?.(preferredCurrency, converted);
      } catch (error) {
        console.error('Error initializing currency:', error);
        // Fallback to USD
        setCurrency('USD');
        setConvertedAmount(usdAmount);
        setExchangeRate(1);
        onCurrencyChange?.('USD', usdAmount);
      } finally {
        setLoading(false);
      }
    };

    initializeCurrency();
  }, [usdAmount]);

  const handleCurrencyChange = async (newCurrency: string) => {
    setLoading(true);
    try {
      console.log(`Changing currency to: ${newCurrency}`);
      
      const rate = await getExchangeRate(newCurrency);
      setExchangeRate(rate);
      
      const converted = await convertCurrency(usdAmount, 'USD', newCurrency);
      
      setCurrency(newCurrency);
      setConvertedAmount(converted);
      
      console.log(`Manual currency change: $${usdAmount} USD = ${converted} ${newCurrency} (rate: ${rate})`);
      
      onCurrencyChange?.(newCurrency, converted);
    } catch (error) {
      console.error('Error converting currency:', error);
      // Keep current values on error
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshRates = async () => {
    setRefreshing(true);
    try {
      console.log('Refreshing exchange rates...');
      const freshRates = await refreshExchangeRates();
      
      // Recalculate current conversion with fresh rates
      const rate = freshRates[currency] || 1;
      setExchangeRate(rate);
      
      const converted = await convertCurrency(usdAmount, 'USD', currency);
      setConvertedAmount(converted);
      
      console.log('Exchange rates refreshed successfully');
      onCurrencyChange?.(currency, converted);
    } catch (error) {
      console.error('Error refreshing rates:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const currentCurrencyInfo = supportedCurrencies.find(c => c.code === currency) || supportedCurrencies[0];

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Auto-detection info */}
      {showAutoDetect && detectedCountry && (
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-sm text-gray-400">
            <Globe className="w-4 h-4" />
            <span>Auto-detected: {detectedCountry}</span>
          </div>
          {showRefresh && (
            <button
              onClick={handleRefreshRates}
              disabled={refreshing}
              className="flex items-center space-x-1 text-xs text-cyan-400 hover:text-cyan-300 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3 h-3 ${refreshing ? 'animate-spin' : ''}`} />
              <span>Refresh Rates</span>
            </button>
          )}
        </div>
      )}

      {/* Currency selector */}
      <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
        <div className="flex items-center space-x-2">
          <span className="text-gray-400 text-sm">Currency:</span>
          <div className="relative">
            <select
              value={currency}
              onChange={(e) => handleCurrencyChange(e.target.value)}
              disabled={loading}
              className="appearance-none bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent cursor-pointer pr-8 disabled:opacity-50"
            >
              {supportedCurrencies.map((curr) => (
                <option key={curr.code} value={curr.code}>
                  {curr.flag} {curr.code} - {curr.name}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="text-2xl font-bold text-cyan-400">
            {loading ? (
              <div className="animate-pulse">...</div>
            ) : (
              formatCurrency(convertedAmount, currency)
            )}
          </span>
          {currency !== 'USD' && !loading && (
            <div className="text-right">
              <div className="text-xs text-gray-400">
                ${usdAmount} USD
              </div>
              <div className="text-xs text-gray-500">
                Rate: {exchangeRate.toFixed(4)}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Debug info (only in development) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="text-xs text-gray-500 bg-gray-800/30 p-2 rounded">
          Debug: {currency} rate = {exchangeRate}, converted = {convertedAmount}
        </div>
      )}
    </div>
  );
};

export default CurrencyToggle;