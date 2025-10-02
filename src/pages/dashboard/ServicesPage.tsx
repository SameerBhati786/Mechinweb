import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Package, 
  Star, 
  Clock, 
  CheckCircle, 
  ArrowRight,
  Globe,
  DollarSign
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { ServiceManager, ServiceData } from '../../lib/services';
import { getPreferredCurrency, formatCurrency, detectUserLocation } from '../../utils/currency';
import ErrorBoundary from '../../components/ErrorBoundary';
export default function ServicesPage() {
  const [services, setServices] = useState<ServiceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [userCurrency, setUserCurrency] = useState('USD');
  const [userLocation, setUserLocation] = useState('');
  const [convertedPricing, setConvertedPricing] = useState<{ [serviceId: string]: any }>({});

  useEffect(() => {
    setIsVisible(true);
    initializeServices();
  }, []);

  const initializeServices = async () => {
    try {
      setLoading(true);
      
      // Get user's preferred currency and location
      const [preferredCurrency, location] = await Promise.all([
        getPreferredCurrency(),
        detectUserLocation()
      ]);
      
      setUserCurrency(preferredCurrency);
      setUserLocation(location.country_name);
      
      // Get services from database
      const servicesData = await ServiceManager.getAllServices();
      console.log('Services loaded from database:', servicesData);
      
      setServices(servicesData);
      
      // Convert pricing to user's currency
      if (preferredCurrency !== 'USD') {
        const conversions: { [serviceId: string]: any } = {};
        
        for (const service of servicesData) {
          if (service.pricing) {
            const servicePricing: any = {};
            for (const [tier, price] of Object.entries(service.pricing)) {
              if (price && typeof price === 'number') {
                servicePricing[tier] = await convertCurrency(price, 'USD', preferredCurrency);
              }
            }
            conversions[service.id] = servicePricing;
          }
        }
        
        setConvertedPricing(conversions);
        console.log('Converted pricing for all services:', conversions);
      }
    } catch (err) {
      console.error('Error initializing services:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch services');
    } finally {
      setLoading(false);
    }
  };

  const handleCurrencyChange = async (newCurrency: string) => {
    setUserCurrency(newCurrency);
    await initializeServices();
  };
  
  const getServicePricing = (service: ServiceData, tier: string) => {
    if (userCurrency === 'USD') {
      return service.pricing?.[tier as keyof typeof service.pricing] || 0;
    }
    return convertedPricing[service.id]?.[tier] || service.pricing?.[tier as keyof typeof service.pricing] || 0;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
          <p className="text-white">Loading services...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6">
        <p className="text-red-400">Error loading services: {error}</p>
        <button 
          onClick={initializeServices}
          className="mt-4 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Available Services</h1>
            <p className="text-gray-400 text-lg">Choose from our professional IT services</p>
          </div>
          
          {/* Location & Currency Info */}
          <div className="mt-4 md:mt-0 bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50">
            <div className="flex items-center space-x-3">
              <Globe className="w-5 h-5 text-cyan-400" />
              <div>
                <p className="text-white font-medium">Showing prices for {userLocation}</p>
                <p className="text-gray-400 text-sm">Currency: {userCurrency}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Currency Selector */}
      <div className={`bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 transition-all duration-1000 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">Currency Preferences</h3>
            <p className="text-gray-400">Prices are automatically shown in your local currency</p>
          </div>
          
          <div className="mt-4 md:mt-0">
            <select
              value={userCurrency}
              onChange={(e) => handleCurrencyChange(e.target.value)}
              className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <option value="USD">🇺🇸 USD - US Dollar</option>
              <option value="INR">🇮🇳 INR - Indian Rupee</option>
              <option value="AUD">🇦🇺 AUD - Australian Dollar</option>
              <option value="EUR">🇪🇺 EUR - Euro</option>
              <option value="GBP">🇬🇧 GBP - British Pound</option>
              <option value="CAD">🇨🇦 CAD - Canadian Dollar</option>
            </select>
          </div>
        </div>
      </div>

      {/* Services Grid */}
      {services.length === 0 ? (
        <div className="text-center py-12">
          <Package className="mx-auto h-16 w-16 text-gray-600 mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No services available</h3>
          <p className="text-gray-400">Services will be available soon.</p>
        </div>
      ) : (
        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 transition-all duration-1000 delay-400 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          {services.map((service, index) => (
            <div 
              key={service.id} 
              className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 hover:border-cyan-500/50 transition-all duration-500 transform hover:scale-105 hover:shadow-2xl hover:shadow-cyan-500/20 overflow-hidden"
            >
              {/* Service Header */}
              <div className="p-6 border-b border-gray-700/50">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors">
                      {service.name}
                    </h3>
                    <p className="text-gray-400 text-sm leading-relaxed">
                      {service.description}
                    </p>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <Package className="h-4 w-4 mr-1" />
                    <span>{service.category}</span>
                  </div>
                </div>
              </div>

              {/* Pricing Tiers */}
              <div className="p-6 space-y-4">
                {Object.entries(service.pricing || {}).map(([tier, price]) => {
                  if (!price || price === 0) return null;
                  
                  const isPopular = tier === 'standard';
                  const currentPrice = getServicePricing(service, tier);
                  
                  return (
                    <div 
                      key={tier} 
                      className={`relative p-4 rounded-xl border-2 transition-all duration-300 ${
                        isPopular 
                          ? 'border-cyan-500/50 bg-cyan-500/10' 
                          : 'border-gray-600/50 bg-gray-700/30 hover:border-gray-500/50'
                      }`}
                    >
                      {isPopular && (
                        <div className="absolute -top-2 left-4 bg-gradient-to-r from-cyan-500 to-purple-600 text-white px-3 py-1 rounded-full text-xs font-bold">
                          POPULAR
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-white capitalize">{tier}</h4>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-cyan-400">
                            {formatCurrency(currentPrice, userCurrency)}
                          </div>
                          {userCurrency !== 'USD' && (
                            <div className="text-xs text-gray-400">
                              ${price} USD
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {service.features[tier as keyof typeof service.features] && (
                        <div className="space-y-2">
                          {service.features[tier as keyof typeof service.features]?.slice(0, 3).map((feature, featureIndex) => (
                            <div key={featureIndex} className="flex items-center text-sm">
                              <CheckCircle className="h-3 w-3 text-green-500 mr-2 flex-shrink-0" />
                              <span className="text-gray-300">{feature}</span>
                            </div>
                          ))}
                          {(service.features[tier as keyof typeof service.features]?.length || 0) > 3 && (
                            <p className="text-xs text-gray-400">
                              +{(service.features[tier as keyof typeof service.features]?.length || 0) - 3} more features
                            </p>
                          )}
                        </div>
                      )}
                      
                      <div className="mt-4 pt-4 border-t border-gray-600/50">
                        <Link
                          to={`/client/purchase/${service.id}?package=${tier}&currency=${userCurrency}`}
                          className={`w-full inline-flex items-center justify-center space-x-2 px-4 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 ${
                            isPopular
                              ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white hover:from-cyan-600 hover:to-purple-700'
                              : 'bg-gray-600 text-white hover:bg-gray-500'
                          }`}
                        >
                          <span>Purchase {tier}</span>
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Service Footer */}
              <div className="p-6 border-t border-gray-700/50 bg-gray-700/20">
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-3 w-3" />
                    <span>Added {new Date(service.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-3 w-3" />
                    <span>Prices in {userCurrency}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Currency Info Footer */}
      <div className={`bg-gradient-to-r from-cyan-500/10 to-purple-500/10 rounded-2xl p-6 border border-cyan-500/20 transition-all duration-1000 delay-600 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <div className="text-center">
          <h3 className="text-xl font-bold text-white mb-2">Multi-Currency Support</h3>
          <p className="text-gray-400 mb-4">
            Prices are automatically displayed in your local currency based on your location ({userLocation}).
            You can change the currency preference using the selector above.
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <div className="flex items-center space-x-2 text-gray-300">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span>Real-time exchange rates</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-300">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              <span>Automatic location detection</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-300">
              <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
              <span>Saved preferences</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}