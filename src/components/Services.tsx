import React, { useRef, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle, Star, Zap, Shield, Clock } from 'lucide-react';
import { ServiceManager } from '../lib/services';
import { getPreferredCurrency, formatCurrency, convertCurrency } from '../utils/currency';
import PaymentErrorBoundary from './PaymentErrorBoundary';

const Services: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userCurrency, setUserCurrency] = useState('USD');
  const [convertedPricing, setConvertedPricing] = useState<{ [serviceId: string]: any }>({});
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const initializeServices = async () => {
      try {
        // Get user's preferred currency
        const currency = await getPreferredCurrency();
        setUserCurrency(currency);
        
        // Load services from database
        const servicesData = await ServiceManager.getAllServices();
        setServices(servicesData);
        
        // Convert pricing if needed
        if (currency !== 'USD') {
          const conversions: { [serviceId: string]: any } = {};
          
          for (const service of servicesData) {
            if (service.pricing) {
              const servicePricing: any = {};
              for (const [tier, price] of Object.entries(service.pricing)) {
                if (price && typeof price === 'number') {
                  servicePricing[tier] = await convertCurrency(price, 'USD', currency);
                }
              }
              conversions[service.id] = servicePricing;
            }
          }

          setConvertedPricing(conversions);
        }
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };

    initializeServices();
  }, []);

  const getServicePrice = (service: any, tier: string) => {
    if (userCurrency === 'USD') {
      return service.pricing?.[tier] || 0;
    }
    return convertedPricing[service.id]?.[tier] || service.pricing?.[tier] || 0;
  };

  const getLowestPrice = (service: any) => {
    const pricing = userCurrency === 'USD' ? service.pricing : convertedPricing[service.id];
    if (!pricing) return 0;
    
    const prices = Object.values(pricing).filter(price => price && price > 0);
    return Math.min(...(prices as number[]));
  };

  return (
    <PaymentErrorBoundary>
      <section id="services" ref={sectionRef} className="py-20 bg-gray-900 relative overflow-hidden scroll-mt-20">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5"></div>
        <div className="absolute top-20 right-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        
        <div className="container mx-auto px-6 relative z-10">
          <div className={`text-center mb-16 transition-all duration-1000 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Professional IT
              <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent"> Services</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Comprehensive cloud solutions, email management, and technical support 
              designed to streamline your business operations.
            </p>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
              <p className="text-white">Loading services...</p>
            </div>
          ) : (
            <div className={`grid md:grid-cols-2 lg:grid-cols-3 gap-8 transition-all duration-1000 delay-300 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}>
              {services.map((service, index) => (
                <div
                  key={service.id}
                  className="group bg-gray-800/50 backdrop-blur-sm rounded-2xl overflow-hidden border border-gray-700/50 hover:border-cyan-500/50 transition-all duration-500 transform hover:scale-105 hover:shadow-2xl hover:shadow-cyan-500/20"
                >
                  {/* Service Header */}
                  <div className="p-6 border-b border-gray-700/50">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-xl">
                        <Zap className="h-6 w-6 text-white" />
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-400">Starting from</div>
                        <div className="text-xl font-bold text-cyan-400">
                          {formatCurrency(getLowestPrice(service), userCurrency)}
                        </div>
                      </div>
                    </div>
                    
                    <h3 className="text-xl font-bold text-white mb-3 group-hover:text-cyan-400 transition-colors duration-300">
                      {service.name}
                    </h3>
                    
                    <p className="text-gray-300 mb-4 leading-relaxed">
                      {service.description}
                    </p>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-400">
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 text-yellow-400" />
                        <span>4.9/5</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4 text-green-400" />
                        <span>24-48h delivery</span>
                      </div>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="p-6">
                    <h4 className="text-white font-semibold mb-3">Key Features:</h4>
                    <div className="space-y-2 mb-6">
                      {(service.features?.basic || []).slice(0, 3).map((feature: string, featureIndex: number) => (
                        <div key={featureIndex} className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-400 flex-shrink-0" />
                          <span className="text-gray-300 text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>
                    
                    <Link
                      to={`/services/${service.id}`}
                      className="group/btn w-full bg-gradient-to-r from-cyan-500 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-cyan-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl inline-flex items-center justify-center space-x-2"
                    >
                      <span>Learn More</span>
                      <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform duration-300" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* CTA Section */}
          <div className={`text-center mt-16 transition-all duration-1000 delay-500 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}>
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-cyan-500/20 max-w-2xl mx-auto">
              <h3 className="text-2xl font-bold text-white mb-4">
                Need a Custom Solution?
              </h3>
              <p className="text-gray-300 mb-6">
                Can't find exactly what you're looking for? We offer custom IT solutions 
                tailored to your specific business requirements.
              </p>
              <Link
                to="#contact"
                className="bg-gradient-to-r from-cyan-500 to-purple-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-cyan-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl inline-flex items-center space-x-2"
              >
                <span>Get Custom Quote</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </PaymentErrorBoundary>
  );
};

export default Services;