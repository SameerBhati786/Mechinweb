import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Check, Shield, Clock, Users, Star, Home, AlertTriangle, RefreshCw } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { ServiceManager, ServiceData } from '../lib/services';
import { convertCurrency, formatCurrency, getPreferredCurrency, detectUserLocation } from '../utils/currency';
import { EnhancedPaymentService } from '../lib/paymentFixes';
import PaymentErrorBoundary from './PaymentErrorBoundary';
import QuantitySelector from './QuantitySelector';

export function EnhancedServicePurchase() {
  const { serviceId } = useParams<{ serviceId: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [service, setService] = useState<ServiceData | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<'basic' | 'standard' | 'enterprise'>('basic');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [userCurrency, setUserCurrency] = useState('USD');
  const [userLocation, setUserLocation] = useState('');
  const [convertedPricing, setConvertedPricing] = useState<any>({});
  const [error, setError] = useState<string | null>(null);
  const [resolvedServiceId, setResolvedServiceId] = useState<string | null>(null);
  const [systemHealth, setSystemHealth] = useState<any>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    initializePage();
  }, [serviceId]);

  const initializePage = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Initializing enhanced service purchase page', { serviceId });

      // Check system health first
      const health = await EnhancedPaymentService.performSystemHealthCheck();
      setSystemHealth(health);
      
      if (!health.overall) {
        setError(`System health check failed: ${health.issues.join(', ')}`);
        return;
      }

      // Get current user
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      setUser(currentUser);

      if (!currentUser) {
        console.log('❌ No authenticated user found');
        return;
      }

      if (!currentUser.email_confirmed_at) {
        console.log('❌ User email not verified');
        navigate('/client/verify-email', {
          state: {
            email: currentUser.email,
            userData: { name: currentUser.user_metadata?.name || 'User' }
          }
        });
        return;
      }

      // Detect user currency and location
      const [currency, location] = await Promise.all([
        getPreferredCurrency(),
        detectUserLocation()
      ]);
      
      setUserCurrency(currency);
      setUserLocation(location.country_name);

      // Resolve service ID with enhanced error handling
      if (serviceId) {
        console.log('🔍 Resolving service ID:', serviceId);
        const actualServiceId = await ServiceManager.resolveServiceId(serviceId);
        
        if (!actualServiceId) {
          console.error('❌ Service resolution failed for:', serviceId);
          setError(`Service not found: ${serviceId}. Please check the service ID and try again.`);
          return;
        }
        
        console.log('✅ Service resolved:', { originalId: serviceId, resolvedId: actualServiceId });
        setResolvedServiceId(actualServiceId);

        // Get service data from database
        const serviceData = await ServiceManager.getServiceById(actualServiceId);
        
        if (!serviceData) {
          console.error('❌ Service data not found for:', actualServiceId);
          setError(`Service data not found: ${actualServiceId}`);
          return;
        }

        console.log('✅ Service data loaded:', { 
          serviceName: serviceData.name, 
          category: serviceData.category,
          hasPricing: !!serviceData.pricing 
        });
        setService(serviceData);

        // Convert pricing to user's currency
        if (currency !== 'USD') {
          const pricing = serviceData.pricing || {};
          const conversions: any = {};
          
          for (const [tier, price] of Object.entries(pricing)) {
            if (price && typeof price === 'number') {
              conversions[tier] = await convertCurrency(price, 'USD', currency);
            }
          }

          setConvertedPricing(conversions);
          console.log('✅ Pricing converted to user currency:', { currency, conversions });
        } else {
          setConvertedPricing(serviceData.pricing || {});
        }
      }
    } catch (error) {
      console.error('❌ Page initialization failed:', error);
      setError(`Failed to load service details: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentPrice = () => {
    if (!service) return 0;
    const pricing = userCurrency === 'USD' ? service.pricing : convertedPricing;
    return pricing[selectedPackage] || 0;
  };

  const getTotalPrice = () => {
    return getCurrentPrice() * quantity;
  };

  const handlePurchase = async () => {
    if (!user || !service || !resolvedServiceId) {
      if (!user) {
        navigate('/client/login');
        return;
      }
      setError('Service information missing. Please refresh and try again.');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const totalPrice = getTotalPrice();
      
      console.log('🚀 Starting enhanced payment creation', {
        serviceId: resolvedServiceId,
        selectedPackage,
        totalPrice,
        userCurrency,
        quantity,
        retryCount
      });
      
      // Use enhanced payment service with retry logic
      const paymentIntent = await EnhancedPaymentService.createPaymentIntent(
        resolvedServiceId,
        selectedPackage,
        totalPrice,
        userCurrency,
        quantity
      );

      console.log('✅ Payment intent created successfully:', paymentIntent);

      // Redirect to payment page
      if (paymentIntent.payment_url) {
        console.log('🔄 Redirecting to payment page:', paymentIntent.payment_url);
        window.location.href = paymentIntent.payment_url;
      } else {
        console.log('⚠️ No payment URL, redirecting to success page');
        navigate(`/payment-success?order_id=${paymentIntent.invoice_id}&amount=${totalPrice}`);
      }
    } catch (error) {
      console.error('❌ Enhanced payment creation failed:', error);
      setRetryCount(prev => prev + 1);
      
      // Provide specific error messages based on error type
      if (error.code === 'ZOHO_UNAVAILABLE') {
        setError('Payment system temporarily unavailable. Please try again in a few minutes or contact support.');
      } else if (error.code === 'AUTH_REQUIRED') {
        navigate('/client/login');
        return;
      } else if (error.code === 'EMAIL_NOT_VERIFIED') {
        navigate('/client/verify-email');
        return;
      } else {
        setError(`Payment creation failed: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDirectPayment = async () => {
    if (!user || !service || !resolvedServiceId) return;

    try {
      setIsLoading(true);
      setError(null);
      
      console.log('🔄 Attempting direct payment method');
      
      const result = await EnhancedPaymentService.createDirectPayment(
        resolvedServiceId,
        selectedPackage,
        getTotalPrice(),
        userCurrency
      );

      console.log('✅ Direct payment created:', result);
      
      // Redirect to email payment
      window.location.href = result.paymentUrl;
    } catch (error) {
      console.error('❌ Direct payment failed:', error);
      setError(`Direct payment failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    setError(null);
    setRetryCount(0);
    initializePage();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading service details...</p>
          {systemHealth && !systemHealth.overall && (
            <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-red-400 text-sm">System health issues detected</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="min-h-screen bg-gray-900 pt-20 flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-4">
            {error || 'Service Not Found'}
          </h1>
          <p className="text-gray-400 mb-8">
            {error || 'The requested service could not be found.'}
          </p>
          
          {systemHealth && (
            <div className="mb-6 p-4 bg-gray-800 rounded-lg text-left">
              <h3 className="text-white font-semibold mb-2">System Status:</h3>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Database:</span>
                  <span className={systemHealth.database ? 'text-green-400' : 'text-red-400'}>
                    {systemHealth.database ? 'OK' : 'FAIL'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Services:</span>
                  <span className={systemHealth.services ? 'text-green-400' : 'text-red-400'}>
                    {systemHealth.services ? 'OK' : 'FAIL'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Zoho:</span>
                  <span className={systemHealth.zoho ? 'text-green-400' : 'text-yellow-400'}>
                    {systemHealth.zoho ? 'OK' : 'DEGRADED'}
                  </span>
                </div>
              </div>
            </div>
          )}
          
          <div className="flex flex-col gap-3">
            <button
              onClick={handleRetry}
              className="bg-cyan-500 hover:bg-cyan-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors inline-flex items-center justify-center space-x-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Retry</span>
            </button>
            
            <Link 
              to="/client/services"
              className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Back to Services
            </Link>
            
            {retryCount > 2 && (
              <a
                href="mailto:contact@mechinweb.com?subject=Payment System Error&body=I'm experiencing issues with the payment system. Error: Payment creation failed."
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                Contact Support
              </a>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <PaymentErrorBoundary>
      <div className="min-h-screen bg-gray-900 pt-20">
        {/* Back Navigation */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link 
            to="/client/services"
            className="inline-flex items-center space-x-2 text-cyan-400 hover:text-cyan-300 transition-colors duration-300"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Services</span>
          </Link>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Service Details */}
            <div>
              <h1 className="text-4xl font-bold text-white mb-6">{service.name}</h1>
              <p className="text-gray-300 text-lg mb-8 leading-relaxed">{service.description}</p>

              {/* System Status */}
              {systemHealth && (
                <div className="bg-gray-800/50 rounded-xl p-4 mb-8 border border-gray-700">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${systemHealth.overall ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                      <span className="text-sm text-gray-400">
                        Payment System: {systemHealth.overall ? 'Online' : 'Degraded'}
                      </span>
                    </div>
                    {!systemHealth.zoho && (
                      <span className="text-xs text-yellow-400">Backup payment available</span>
                    )}
                  </div>
                </div>
              )}

              {/* Location Detection */}
              {userLocation && (
                <div className="bg-gray-800/50 rounded-xl p-4 mb-8 border border-gray-700">
                  <div className="flex items-center text-sm text-gray-400">
                    <Shield className="w-4 h-4 mr-2" />
                    <span>Showing prices for {userLocation} in {userCurrency}</span>
                  </div>
                </div>
              )}

              {/* Package Selection */}
              <div className="mb-8">
                <h2 className="text-2xl font-semibold text-white mb-6">Choose Your Package</h2>
                <div className="space-y-4">
                  {Object.entries(service.pricing || {}).map(([packageType, price]) => {
                    if (!price || price === 0) return null;
                    
                    const convertedPrice = userCurrency === 'USD' ? price : convertedPricing[packageType];
                    const isSelected = selectedPackage === packageType;
                    const features = service.features?.[packageType as keyof typeof service.features] || [];
                    
                    return (
                      <div
                        key={packageType}
                        onClick={() => setSelectedPackage(packageType as any)}
                        className={`border-2 rounded-xl p-6 cursor-pointer transition-all duration-300 ${
                          isSelected
                            ? 'border-cyan-500 bg-cyan-500/10'
                            : 'border-gray-700 hover:border-gray-600 bg-gray-800/30'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-4">
                          <h3 className="text-xl font-semibold text-white capitalize">{packageType}</h3>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-cyan-400">
                              {formatCurrency(convertedPrice, userCurrency)}
                            </div>
                            {userCurrency !== 'USD' && (
                              <div className="text-sm text-gray-400">
                                ${price} USD
                              </div>
                            )}
                          </div>
                        </div>
                        <ul className="space-y-2">
                          {features.map((feature, index) => (
                            <li key={index} className="flex items-center text-gray-300">
                              <Check className="w-4 h-4 mr-3 text-green-400 flex-shrink-0" />
                              <span className="text-sm">{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Order Configuration */}
            <div>
              <div className="bg-gray-800/50 rounded-xl p-6 sticky top-8 border border-gray-700">
                <h2 className="text-2xl font-semibold text-white mb-6">Configure Your Order</h2>

                {/* Quantity Selection */}
                {service && (service.name.toLowerCase().includes('migration') || service.name.toLowerCase().includes('incident')) && (
                  <div className="mb-6">
                    <QuantitySelector
                      label={
                        service.name.toLowerCase().includes('email migration') ? 'Number of Mailboxes' :
                        service.name.toLowerCase().includes('data migration') ? 'Number of Users' :
                        'Number of Incidents'
                      }
                      quantity={quantity}
                      onQuantityChange={setQuantity}
                      unitPrice={getCurrentPrice()}
                      currency={userCurrency}
                      min={1}
                      max={service.name.toLowerCase().includes('email migration') ? 1000 : 
                           service.name.toLowerCase().includes('data migration') ? 500 : 10}
                    />
                  </div>
                )}

                {/* Order Summary */}
                <div className="border-t border-gray-700 pt-6">
                  <h3 className="text-xl font-semibold text-white mb-4">Order Summary</h3>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Service:</span>
                      <span className="text-white">{service.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Package:</span>
                      <span className="text-white capitalize">{selectedPackage}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Base Price:</span>
                      <span className="text-white">{formatCurrency(getCurrentPrice(), userCurrency)}</span>
                    </div>
                    {quantity > 1 && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Quantity:</span>
                        <span className="text-white">{quantity}</span>
                      </div>
                    )}
                  </div>

                  <div className="border-t border-gray-700 pt-4 mb-6">
                    <div className="flex justify-between items-center">
                      <span className="text-xl font-semibold text-white">Total:</span>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-cyan-400">
                          {formatCurrency(getTotalPrice(), userCurrency)}
                        </div>
                        {userCurrency !== 'USD' && (
                          <div className="text-sm text-gray-400">
                            (Approx. ${(getTotalPrice() / (userCurrency === 'INR' ? 83.25 : userCurrency === 'AUD' ? 1.52 : 1)).toFixed(2)} USD)
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {error && (
                    <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                      <p className="text-red-400 text-sm">{error}</p>
                      {retryCount > 0 && (
                        <p className="text-gray-400 text-xs mt-2">Retry attempt: {retryCount}</p>
                      )}
                    </div>
                  )}

                  {/* Primary Payment Button */}
                  <button
                    onClick={handlePurchase}
                    disabled={!user || isLoading}
                    className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:transform-none mb-3"
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Processing...</span>
                      </div>
                    ) : user ? (
                      'Proceed to Payment'
                    ) : (
                      'Login to Purchase'
                    )}
                  </button>

                  {/* Alternative Payment Button */}
                  {systemHealth && !systemHealth.zoho && user && (
                    <button
                      onClick={handleDirectPayment}
                      disabled={isLoading}
                      className="w-full bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 mb-3"
                    >
                      {isLoading ? 'Processing...' : 'Alternative Payment Method'}
                    </button>
                  )}

                  {!user && (
                    <p className="text-center text-gray-400 mt-4 text-sm">
                      <Link
                        to="/client/login"
                        className="text-cyan-400 hover:text-cyan-300 underline"
                      >
                        Sign in
                      </Link>
                      {' or '}
                      <Link
                        to="/client/register"
                        className="text-cyan-400 hover:text-cyan-300 underline"
                      >
                        create an account
                      </Link>
                      {' to continue'}
                    </p>
                  )}

                  {/* Retry Options */}
                  {error && retryCount > 0 && (
                    <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                      <p className="text-blue-300 text-sm mb-2">Having trouble? Try these options:</p>
                      <div className="space-y-2">
                        <button
                          onClick={handleRetry}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                        >
                          Refresh & Retry
                        </button>
                        <a
                          href="mailto:contact@mechinweb.com?subject=Payment Issue&body=I'm having trouble with payment processing."
                          className="block w-full bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm transition-colors text-center"
                        >
                          Contact Support
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PaymentErrorBoundary>
  );
}