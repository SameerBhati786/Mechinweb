import React, { useEffect, useState } from 'react';
import { Lock, ArrowRight, Shield, CheckCircle, Globe, Zap, Home } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getPreferredCurrency, convertCurrency, formatCurrency } from '../utils/currency';

const SSLSetupPage = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [currency, setCurrency] = useState('USD');
  const [convertedPrices, setConvertedPrices] = useState({
    free: 7,
    single: 10,
    multi: 25,
    wildcard: 55
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setIsVisible(true);
    window.scrollTo(0, 0);
    
    const initializePricing = async () => {
      try {
        const preferredCurrency = await getPreferredCurrency();
        let freePrice, singlePrice, multiPrice, wildcardPrice;
        
        if (preferredCurrency === 'USD') {
          freePrice = 7;
          singlePrice = 10;
          multiPrice = 25;
          wildcardPrice = 55;
        } else {
          [freePrice, singlePrice, multiPrice, wildcardPrice] = await Promise.all([
            convertCurrency(7, 'USD', preferredCurrency),
            convertCurrency(10, 'USD', preferredCurrency),
            convertCurrency(25, 'USD', preferredCurrency),
            convertCurrency(55, 'USD', preferredCurrency)
          ]);
        }
        
        setCurrency(preferredCurrency);
        setConvertedPrices({
          free: freePrice,
          single: singlePrice,
          multi: multiPrice,
          wildcard: wildcardPrice
        });
        
        console.log(`SSL Setup: Free $7 USD = ${formatCurrency(freePrice, preferredCurrency)}`);
      } catch (error) {
        console.error('Error converting SSL pricing:', error);
      } finally {
        setLoading(false);
      }
    };
    
    initializePricing();
  }, []);

  const sslTypes = [
    {
      icon: Globe,
      title: "Domain Validation (DV)",
      description: "Basic SSL certificate for single domains with quick validation",
      features: ["Single domain protection", "Quick issuance", "Basic encryption", "Ideal for blogs & personal sites"]
    },
    {
      icon: Shield,
      title: "Organization Validation (OV)",
      description: "Enhanced SSL with organization verification for business websites",
      features: ["Organization verification", "Enhanced trust", "Business validation", "Professional websites"]
    },
    {
      icon: Zap,
      title: "Extended Validation (EV)",
      description: "Premium SSL with green address bar for maximum trust",
      features: ["Highest trust level", "Green address bar", "Company verification", "E-commerce sites"]
    }
  ];

  const benefits = [
    "Encrypt data transmission between server and browser",
    "Improve search engine rankings (SEO boost)",
    "Build customer trust with security indicators",
    "Comply with data protection regulations",
    "Prevent browser security warnings",
    "Enable secure online transactions"
  ];

  const faqs = [
    {
      question: "What do I need to provide for SSL installation?",
      answer: "Option 1: If you have a PAID SSL certificate - provide us the certificate files or purchase confirmation link, and we'll handle the installation. Option 2: For FREE SSL certificates (Let's Encrypt) - we handle everything including certificate generation. You'll need to provide hosting control panel access (cPanel/Plesk) in both cases."
    },
    {
      question: "What hosting control panel access do you need?",
      answer: "We need temporary admin access to your hosting control panel (cPanel, Plesk, or similar) to install and configure the SSL certificate. This includes username, password, and control panel URL. We'll guide you through creating temporary access if needed."
    },
    {
      question: "How long does SSL installation take?",
      answer: "Basic SSL installation typically takes 2-4 hours. Multi-domain setups may take longer depending on the number of domains and complexity of the configuration."
    },
    {
      question: "Will my website have any downtime?",
      answer: "SSL installation typically requires minimal downtime (5-10 minutes) for the final configuration. We schedule installations during low-traffic periods to minimize impact. We'll coordinate the timing with you in advance."
    }
  ];

  return (
    <div className="min-h-screen bg-gray-900 pt-20">
      {/* Back to Home */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link 
          to="/"
          className="inline-flex items-center space-x-2 text-cyan-400 hover:text-cyan-300 transition-colors duration-300"
        >
          <Home className="h-5 w-5" />
          <span>Back to Home</span>
        </Link>
      </div>

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-green-900 via-blue-900 to-purple-900 relative overflow-hidden">
        <div className="absolute inset-0">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute bg-white/20 rounded-full animate-float"
              style={{
                width: `${Math.random() * 3 + 1}px`,
                height: `${Math.random() * 3 + 1}px`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${3 + Math.random() * 4}s`
              }}
            />
          ))}
        </div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className={`max-w-4xl mx-auto text-center transition-all duration-1000 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}>
            <div className="p-4 bg-gradient-to-r from-green-500 to-blue-600 rounded-2xl inline-block mb-8 shadow-2xl">
              <Lock className="h-16 w-16 text-white" />
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
              Secure SSL & <span className="bg-gradient-to-r from-green-300 to-blue-300 bg-clip-text text-transparent">HTTPS Setup</span>
            </h1>
            
            <p className="text-xl text-green-100 mb-8 leading-relaxed">
              Professional SSL certificate installation and renewal services to secure your website 
              and build customer trust with encrypted connections.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/#quote"
                className="bg-white text-green-600 font-semibold px-8 py-4 rounded-full hover:bg-green-50 transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                Get SSL Quote
              </Link>
              <Link 
                to="/#contact"
                className="border-2 border-white text-white font-semibold px-8 py-4 rounded-full hover:bg-white hover:text-green-600 transition-all duration-300 transform hover:scale-105"
              >
                Contact Expert
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* SSL Types */}
      <section className="py-20 bg-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
                SSL Certificate <span className="bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">Types</span>
              </h2>
              <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                Choose the right SSL certificate type for your website's security needs
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {sslTypes.map((ssl, index) => {
                const IconComponent = ssl.icon;
                return (
                  <div key={index} className="bg-gray-900 rounded-2xl p-8 border border-gray-700 hover:border-green-500 transition-all duration-300 transform hover:-translate-y-2">
                    <div className="p-4 bg-gradient-to-r from-green-500 to-blue-600 rounded-xl inline-block mb-6">
                      <IconComponent className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-4">{ssl.title}</h3>
                    <p className="text-gray-400 mb-6 leading-relaxed">{ssl.description}</p>
                    
                    <div className="space-y-2">
                      {ssl.features.map((feature, featureIndex) => (
                        <div key={featureIndex} className="flex items-center space-x-2 text-sm">
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                          <span className="text-gray-400">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
                  Why SSL Certificates <span className="bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">Matter</span>
                </h2>
                <p className="text-xl text-gray-400 mb-8 leading-relaxed">
                  SSL certificates are essential for website security, user trust, and search engine optimization. 
                  They encrypt data transmission and provide visual security indicators.
                </p>
                
                <div className="space-y-4">
                  {benefits.map((benefit, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-300">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-cyan-500/20">
                <h3 className="text-2xl font-bold text-white mb-6">Service Pricing</h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-gray-700/50 rounded-xl p-6 border border-green-500/50">
                    <h4 className="text-lg font-semibold text-white mb-2">Free SSL</h4>
                    <p className="text-gray-400 text-sm mb-4">Let's Encrypt certificate</p>
                    <div className="text-2xl font-bold text-green-400 mb-2">
                      {loading ? '...' : formatCurrency(convertedPrices.free, currency)}
                    </div>
                    {currency !== 'USD' && !loading && (
                      <div className="text-xs text-gray-400 mb-4">$7 USD</div>
                    )}
                    <ul className="space-y-2 text-sm text-gray-300">
                      <li>✓ Free SSL certificate</li>
                      <li>✓ Installation & setup</li>
                      <li>✓ Auto-renewal</li>
                      <li>✓ Processing fee only</li>
                    </ul>
                  </div>
                  <div className="bg-gray-700/50 rounded-xl p-6 border border-cyan-500/50">
                    <h4 className="text-lg font-semibold text-white mb-2">Single Domain</h4>
                    <p className="text-gray-400 text-sm mb-4">Client-provided certificate</p>
                    <div className="text-2xl font-bold text-cyan-400 mb-2">
                      {loading ? '...' : formatCurrency(convertedPrices.single, currency)}
                    </div>
                    {currency !== 'USD' && !loading && (
                      <div className="text-xs text-gray-400 mb-4">$10 USD</div>
                    )}
                    <ul className="space-y-2 text-sm text-gray-300">
                      <li>✓ Professional installation</li>
                      <li>✓ Configuration & testing</li>
                      <li>✓ Security validation</li>
                      <li>✓ Priority support</li>
                    </ul>
                  </div>
                  <div className="bg-gray-700/50 rounded-xl p-6 border border-purple-500/50 relative">
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-cyan-500 to-purple-600 text-white px-4 py-1 rounded-full text-xs font-semibold">
                      Popular
                    </div>
                    <h4 className="text-lg font-semibold text-white mb-2">Multi-Domain</h4>
                    <p className="text-gray-400 text-sm mb-4">Up to 5 domains</p>
                    <div className="text-2xl font-bold text-purple-400 mb-2">
                      {loading ? '...' : formatCurrency(convertedPrices.multi, currency)}
                    </div>
                    {currency !== 'USD' && !loading && (
                      <div className="text-xs text-gray-400 mb-4">$25 USD</div>
                    )}
                    <ul className="space-y-2 text-sm text-gray-300">
                      <li>✓ Up to 5 domains</li>
                      <li>✓ Client-provided certificate</li>
                      <li>✓ Complete configuration</li>
                      <li>✓ Advanced support</li>
                    </ul>
                  </div>
                  <div className="bg-gray-700/50 rounded-xl p-6 border border-yellow-500/50">
                    <h4 className="text-lg font-semibold text-white mb-2">Wildcard SSL</h4>
                    <p className="text-gray-400 text-sm mb-4">Unlimited subdomains</p>
                    <div className="text-2xl font-bold text-yellow-400 mb-2">
                      {loading ? '...' : formatCurrency(convertedPrices.wildcard, currency)}
                    </div>
                    {currency !== 'USD' && !loading && (
                      <div className="text-xs text-gray-400 mb-4">$55 USD</div>
                    )}
                    <ul className="space-y-2 text-sm text-gray-300">
                      <li>✓ Wildcard certificate</li>
                      <li>✓ Unlimited subdomains</li>
                      <li>✓ Premium installation</li>
                      <li>✓ 24/7 support</li>
                    </ul>
                  </div>
                </div>
                
                <div className="mt-8 p-6 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl border border-blue-500/20">
                  <h4 className="text-lg font-semibold text-white mb-3">SSL Certificate Procurement Service</h4>
                  <p className="text-gray-400 mb-4">Need us to purchase the SSL certificate for you? We can procure certificates from trusted CAs like Sectigo, Comodo, and PositiveSSL.</p>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <p className="text-white font-semibold">Single Domain</p>
                      <p className="text-cyan-400 font-bold">+$5 procurement fee</p>
                    </div>
                    <div className="text-center">
                      <p className="text-white font-semibold">Multi-Domain</p>
                      <p className="text-purple-400 font-bold">+$5 procurement fee</p>
                    </div>
                    <div className="text-center">
                      <p className="text-white font-semibold">Wildcard</p>
                      <p className="text-yellow-400 font-bold">+$5 procurement fee</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQs Section */}
      <section className="py-20 bg-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
                Frequently Asked <span className="bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">Questions</span>
              </h2>
              <p className="text-xl text-gray-400">
                Common questions about our SSL setup service
              </p>
            </div>

            <div className="space-y-6">
              {faqs.map((faq, index) => (
                <div key={index} className="bg-gray-900 rounded-2xl p-6 border border-gray-700">
                  <h3 className="text-lg font-bold text-white mb-3">{faq.question}</h3>
                  <p className="text-gray-400 leading-relaxed">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-green-600 to-blue-600">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
              Secure Your Website Today
            </h2>
            <p className="text-xl text-green-100 mb-8">
              Get professional SSL certificate installation with ongoing support and monitoring
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/#contact"
                className="bg-white text-green-600 font-semibold px-8 py-4 rounded-full hover:bg-green-50 transition-all duration-300 transform hover:scale-105 shadow-lg inline-flex items-center justify-center space-x-2"
              >
                <span>Contact Us</span>
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SSLSetupPage;