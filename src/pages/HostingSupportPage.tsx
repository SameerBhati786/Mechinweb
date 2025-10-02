import React, { useEffect, useState } from 'react';
import { Settings, ArrowRight, Server, Zap, Shield, Monitor, Home } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getPreferredCurrency, convertCurrency, formatCurrency } from '../utils/currency';

const HostingSupportPage = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [currency, setCurrency] = useState('USD');
  const [convertedPrices, setConvertedPrices] = useState({
    basic: 15,
    standard: 25,
    enterprise: 55
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setIsVisible(true);
    window.scrollTo(0, 0);
    
    const initializePricing = async () => {
      try {
        const preferredCurrency = await getPreferredCurrency();
        let basicPrice, standardPrice, enterprisePrice;
        
        if (preferredCurrency === 'USD') {
          basicPrice = 15;
          standardPrice = 25;
          enterprisePrice = 55;
        } else {
          [basicPrice, standardPrice, enterprisePrice] = await Promise.all([
            convertCurrency(15, 'USD', preferredCurrency),
            convertCurrency(25, 'USD', preferredCurrency),
            convertCurrency(55, 'USD', preferredCurrency)
          ]);
        }
        
        setCurrency(preferredCurrency);
        setConvertedPrices({
          basic: basicPrice,
          standard: standardPrice,
          enterprise: enterprisePrice
        });
        
        console.log(`Hosting Support: Basic $15 USD = ${formatCurrency(basicPrice, preferredCurrency)}`);
      } catch (error) {
        console.error('Error converting hosting support pricing:', error);
      } finally {
        setLoading(false);
      }
    };
    
    initializePricing();
  }, []);

  const controlPanels = [
    {
      name: "cPanel",
      description: "Complete cPanel management, optimization, and troubleshooting services",
      features: ["Account management", "Email setup", "Database optimization", "Security hardening"]
    },
    {
      name: "Plesk",
      description: "Professional Plesk administration and performance tuning",
      features: ["Server configuration", "Extension management", "Backup solutions", "SSL management"]
    }
  ];

  const services = [
    {
      icon: Server,
      title: "Server Management",
      description: "Complete server administration and maintenance for optimal performance"
    },
    {
      icon: Zap,
      title: "Performance Optimization",
      description: "Speed optimization and resource management for better user experience"
    },
    {
      icon: Shield,
      title: "Security Hardening",
      description: "Advanced security configuration and malware protection setup"
    },
    {
      icon: Monitor,
      title: "24/7 Monitoring",
      description: "Continuous monitoring with proactive issue detection and resolution"
    }
  ];

  const supportAreas = [
    "Control panel configuration and optimization",
    "Email server setup and troubleshooting",
    "Database performance tuning",
    "SSL certificate installation and management",
    "Backup and disaster recovery setup",
    "Security scanning and malware removal",
    "DNS configuration and troubleshooting",
    "Website migration and deployment"
  ];

  const faqs = [
    {
      question: "What hosting control panel access do you need?",
      answer: "We need temporary admin access to your hosting control panel (cPanel, Plesk, DirectAdmin, etc.). This includes the control panel URL, username, and password. We can work with temporary access or guide you through creating a temporary admin account for security."
    },
    {
      question: "Do you work with all hosting providers?",
      answer: "Yes, we work with all major hosting providers including shared hosting, VPS, dedicated servers, and cloud hosting. Whether you're using GoDaddy, Bluehost, SiteGround, or any other provider, we can help optimize your hosting environment."
    },
    {
      question: "What if my website is currently down?",
      answer: "We offer emergency support for website downtime. Contact us immediately and we'll prioritize your case. We typically respond to emergency situations within 15 minutes and can resolve most critical issues within 1-2 hours."
    },
    {
      question: "Can you help with website migration between hosts?",
      answer: "Absolutely! We handle complete website migrations including files, databases, email accounts, and DNS configuration. We ensure zero data loss and minimal downtime during the migration process."
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
      <section className="py-20 bg-gradient-to-br from-orange-900 via-red-900 to-purple-900 relative overflow-hidden">
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
            <div className="p-4 bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl inline-block mb-8 shadow-2xl">
              <Settings className="h-16 w-16 text-white" />
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
              Hosting & Control Panel <span className="bg-gradient-to-r from-orange-300 to-red-300 bg-clip-text text-transparent">Support</span>
            </h1>
            
            <p className="text-xl text-orange-100 mb-8 leading-relaxed">
              Professional troubleshooting and optimization for Plesk and cPanel hosting environments. 
              Keep your websites running smoothly with expert support and maintenance.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/#quote"
                className="bg-white text-orange-600 font-semibold px-8 py-4 rounded-full hover:bg-orange-50 transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                Get Support Quote
              </Link>
              <Link 
                to="/#contact"
                className="border-2 border-white text-white font-semibold px-8 py-4 rounded-full hover:bg-white hover:text-orange-600 transition-all duration-300 transform hover:scale-105"
              >
                Emergency Support
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Control Panels */}
      <section className="py-20 bg-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
                Supported <span className="bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">Control Panels</span>
              </h2>
              <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                Expert support for the most popular web hosting control panels
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {controlPanels.map((panel, index) => (
                <div key={index} className="bg-gray-900 rounded-2xl p-8 border border-gray-700 hover:border-orange-500 transition-all duration-300 transform hover:-translate-y-2">
                  <h3 className="text-2xl font-bold text-white mb-4">{panel.name}</h3>
                  <p className="text-gray-400 mb-6 leading-relaxed">{panel.description}</p>
                  
                  <div className="space-y-2">
                    {panel.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center space-x-2 text-sm">
                        <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
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

      {/* Services */}
      <section className="py-20 bg-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
                Support <span className="bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">Services</span>
              </h2>
              <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                Comprehensive hosting support to keep your websites and applications running smoothly
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {services.map((service, index) => {
                const IconComponent = service.icon;
                return (
                  <div key={index} className="bg-gray-800 rounded-2xl p-6 border border-gray-700 hover:border-orange-500 transition-all duration-300 transform hover:-translate-y-2 text-center">
                    <div className="p-4 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl inline-block mb-6">
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

      {/* Support Areas */}
      <section className="py-20 bg-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
                  What We <span className="bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">Support</span>
                </h2>
                <p className="text-xl text-gray-400 mb-8 leading-relaxed">
                  From basic troubleshooting to advanced server optimization, 
                  we provide comprehensive hosting support services.
                </p>
                
                <div className="grid md:grid-cols-2 gap-4">
                  {supportAreas.map((area, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-gray-300 text-sm">{area}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="bg-gray-900 rounded-2xl p-8 border border-gray-700">
                <h3 className="text-xl font-bold text-white mb-6">Emergency Support Available</h3>
                <p className="text-gray-400 mb-6">
                  Website down? Server issues? We provide emergency support to get your 
                  hosting environment back online quickly.
                </p>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-white font-semibold">24/7 Emergency Response</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                    <span className="text-gray-300">Average response time: 15 minutes</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span className="text-gray-300">Critical issue resolution: 1-2 hours</span>
                  </div>
                </div>
                
                <div className="mt-6 p-4 bg-gradient-to-r from-orange-600 to-red-600 rounded-lg">
                  <p className="text-white font-semibold text-center">
                    Need immediate help? Contact us now!
                  </p>
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
                Frequently Asked <span className="bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">Questions</span>
              </h2>
              <p className="text-xl text-gray-400">
                Common questions about our hosting support service
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
      <section className="py-20 bg-gradient-to-r from-orange-600 to-red-600">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
              Get Professional Hosting Support
            </h2>
            <p className="text-xl text-orange-100 mb-8">
              Don't let hosting issues slow down your business. Get expert support today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/#contact"
                className="bg-white text-orange-600 font-semibold px-8 py-4 rounded-full hover:bg-orange-50 transition-all duration-300 transform hover:scale-105 shadow-lg inline-flex items-center justify-center space-x-2"
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

export default HostingSupportPage;