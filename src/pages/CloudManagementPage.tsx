import React, { useEffect, useState } from 'react';
import { Cloud, ArrowRight, Users, Settings, Shield, Zap, Home } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getPreferredCurrency, convertCurrency, formatCurrency } from '../utils/currency';

const CloudManagementPage = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [currency, setCurrency] = useState('USD');
  const [convertedPrices, setConvertedPrices] = useState({
    setup: 25,
    incident: 5
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setIsVisible(true);
    window.scrollTo(0, 0);
    
    const initializePricing = async () => {
      try {
        const preferredCurrency = await getPreferredCurrency();
        let setupPrice, incidentPrice;
        
        if (preferredCurrency === 'USD') {
          setupPrice = 25;
          incidentPrice = 5;
        } else {
          [setupPrice, incidentPrice] = await Promise.all([
            convertCurrency(25, 'USD', preferredCurrency),
            convertCurrency(5, 'USD', preferredCurrency)
          ]);
        }
        
        setCurrency(preferredCurrency);
        setConvertedPrices({
          setup: setupPrice,
          incident: incidentPrice
        });
        
        console.log(`Cloud Management: Setup $25 USD = ${formatCurrency(setupPrice, preferredCurrency)}, Incident $5 USD = ${formatCurrency(incidentPrice, preferredCurrency)}`);
      } catch (error) {
        console.error('Error converting cloud management pricing:', error);
      } finally {
        setLoading(false);
      }
    };
    
    initializePricing();
  }, []);

  const platforms = [
    {
      name: "Google Workspace",
      description: "Complete administration and optimization of your Google Workspace environment",
      features: ["User management", "Security configuration", "App integration", "Storage optimization"]
    },
    {
      name: "Microsoft 365",
      description: "Expert management of your Microsoft 365 suite for maximum productivity",
      features: ["Teams setup", "SharePoint configuration", "Exchange management", "Security policies"]
    }
  ];

  const services = [
    {
      icon: Users,
      title: "User Management",
      description: "Streamlined user provisioning, role assignment, and access control"
    },
    {
      icon: Shield,
      title: "Security Configuration",
      description: "Advanced security settings, MFA setup, and compliance management"
    },
    {
      icon: Settings,
      title: "System Integration",
      description: "Seamless integration with third-party applications and services"
    },
    {
      icon: Zap,
      title: "Performance Optimization",
      description: "Fine-tuning for optimal performance and user experience"
    }
  ];

  const faqs = [
    {
      question: "What credentials do I need to provide for cloud management?",
      answer: "You'll need to provide admin access to your Google Workspace or Microsoft 365 admin console. This includes admin username, password, and any necessary 2FA codes. We'll guide you through creating temporary admin access if needed for security."
    },
    {
      question: "Do I need existing Google Workspace or Microsoft 365 accounts?",
      answer: "Yes, you should have active Google Workspace or Microsoft 365 subscriptions. If you don't have these yet, we can help you choose the right plan and set up new accounts as part of our service."
    },
    {
      question: "What's included in ongoing cloud management?",
      answer: "Our management includes user provisioning, security configuration, app integrations, storage optimization, policy management, and ongoing support. We handle the technical aspects so you can focus on your business."
    },
    {
      question: "Can you help migrate between Google Workspace and Microsoft 365?",
      answer: "Absolutely! We specialize in migrations between cloud platforms. This service combines our cloud management expertise with our data migration capabilities for a seamless transition."
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
      <section className="py-20 bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 relative overflow-hidden">
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
            <div className="p-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl inline-block mb-8 shadow-2xl">
              <Cloud className="h-16 w-16 text-white" />
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
              Cloud Productivity <span className="bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent">Suite Management</span>
            </h1>
            
            <p className="text-xl text-blue-100 mb-8 leading-relaxed">
              Expert administration and optimization of Google Workspace and Microsoft 365 environments 
              to maximize your team's productivity and collaboration.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/#quote"
                className="bg-white text-blue-600 font-semibold px-8 py-4 rounded-full hover:bg-blue-50 transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                Get Management Quote
              </Link>
              <Link 
                to="/#contact"
                className="border-2 border-white text-white font-semibold px-8 py-4 rounded-full hover:bg-white hover:text-blue-600 transition-all duration-300 transform hover:scale-105"
              >
                Consult Expert
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Platforms Section */}
      <section className="py-20 bg-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
                Supported <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Platforms</span>
              </h2>
              <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                Professional management services for leading cloud productivity suites
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {platforms.map((platform, index) => (
                <div key={index} className="bg-gray-900 rounded-2xl p-8 border border-gray-700 hover:border-blue-500 transition-all duration-300 transform hover:-translate-y-2">
                  <h3 className="text-2xl font-bold text-white mb-4">{platform.name}</h3>
                  <p className="text-gray-400 mb-6 leading-relaxed">{platform.description}</p>
                  
                  <div className="space-y-2">
                    {platform.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center space-x-2 text-sm">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                        <span className="text-gray-400">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
                Management <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Services</span>
              </h2>
              <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                Comprehensive cloud suite administration to optimize your business operations
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {services.map((service, index) => {
                const IconComponent = service.icon;
                return (
                  <div key={index} className="bg-gray-800 rounded-2xl p-6 border border-gray-700 hover:border-blue-500 transition-all duration-300 transform hover:-translate-y-2 text-center">
                    <div className="p-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl inline-block mb-6">
                      <IconComponent className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-3">{service.title}</h3>
                    <p className="text-gray-400 text-sm leading-relaxed">{service.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
                  Why Professional <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Management</span>
                </h2>
                <p className="text-xl text-gray-400 mb-8 leading-relaxed">
                  Proper cloud suite management ensures optimal performance, security, and user adoption 
                  while reducing administrative overhead and maximizing ROI.
                </p>
                
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold">1</span>
                    </div>
                    <div>
                      <h4 className="text-white font-semibold mb-2">Initial Assessment</h4>
                      <p className="text-gray-400">Comprehensive audit of your current setup and requirements</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold">2</span>
                    </div>
                    <div>
                      <h4 className="text-white font-semibold mb-2">Optimization & Configuration</h4>
                      <p className="text-gray-400">Fine-tune settings for optimal performance and security</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold">3</span>
                    </div>
                    <div>
                      <h4 className="text-white font-semibold mb-2">Ongoing Support</h4>
                      <p className="text-gray-400">Continuous monitoring and maintenance for peak performance</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-cyan-500/20">
                <h3 className="text-2xl font-bold text-white mb-6">Service Pricing</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-gray-700/50 rounded-xl p-6 border border-gray-600 hover:border-cyan-500/50 transition-all duration-300">
                    <h4 className="text-lg font-semibold text-white mb-2">One-time Setup</h4>
                    <p className="text-gray-400 text-sm mb-4">One-time configuration</p>
                    <div className="text-2xl font-bold text-cyan-400 mb-2">
                      {loading ? '...' : formatCurrency(convertedPrices.setup, currency)}
                    </div>
                    {currency !== 'USD' && !loading && (
                      <div className="text-xs text-gray-400 mb-4">$25 USD</div>
                    )}
                    <ul className="space-y-2 text-sm text-gray-300">
                      <li>✓ Initial setup & configuration</li>
                      <li>✓ User account creation</li>
                      <li>✓ Basic troubleshooting</li>
                      <li>✓ Documentation provided</li>
                    </ul>
                  </div>
                  <div className="bg-gray-700/50 rounded-xl p-6 border border-purple-500/50">
                    <h4 className="text-lg font-semibold text-white mb-2">Per Incident Support</h4>
                    <p className="text-gray-400 text-sm mb-4">Additional troubleshooting</p>
                    <div className="text-2xl font-bold text-purple-400 mb-2">
                      {loading ? '...' : formatCurrency(convertedPrices.incident, currency)}
                      <span className="text-sm text-gray-400">/incident</span>
                    </div>
                    {currency !== 'USD' && !loading && (
                      <div className="text-xs text-gray-400 mb-4">$5 USD</div>
                    )}
                    <ul className="space-y-2 text-sm text-gray-300">
                      <li>✓ Additional troubleshooting</li>
                      <li>✓ Configuration changes</li>
                      <li>✓ User support</li>
                      <li>✓ Quick resolution</li>
                    </ul>
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
                Frequently Asked <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Questions</span>
              </h2>
              <p className="text-xl text-gray-400">
                Common questions about our cloud management service
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
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
              Transform Your Cloud Productivity
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Get expert cloud suite management and unlock your team's full potential
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/#contact"
                className="bg-white text-blue-600 font-semibold px-8 py-4 rounded-full hover:bg-blue-50 transition-all duration-300 transform hover:scale-105 shadow-lg inline-flex items-center justify-center space-x-2"
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

export default CloudManagementPage;