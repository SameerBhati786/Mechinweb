import React, { useEffect, useState } from 'react';
import { Shield, ArrowRight, Database, Clock, CheckCircle, HardDrive, Home } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getPreferredCurrency, convertCurrency, formatCurrency } from '../utils/currency';

const AcronisSetupPage = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [currency, setCurrency] = useState('USD');
  const [convertedPrice, setConvertedPrice] = useState(25);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setIsVisible(true);
    window.scrollTo(0, 0);
    
    const initializePricing = async () => {
      try {
        const preferredCurrency = await getPreferredCurrency();
        const converted = preferredCurrency === 'USD' 
          ? 25 
          : await convertCurrency(25, 'USD', preferredCurrency);
        
        setCurrency(preferredCurrency);
        setConvertedPrice(converted);
        
        console.log(`Acronis Setup: $25 USD = ${formatCurrency(converted, preferredCurrency)}`);
      } catch (error) {
        console.error('Error converting Acronis pricing:', error);
      } finally {
        setLoading(false);
      }
    };
    
    initializePricing();
  }, []);

  const features = [
    {
      icon: Database,
      title: "Complete Data Protection",
      description: "Full system backup including files, applications, and system settings"
    },
    {
      icon: Shield,
      title: "Advanced Security",
      description: "AI-powered anti-malware protection and blockchain data authentication"
    },
    {
      icon: Clock,
      title: "Automated Backups",
      description: "Scheduled backups with flexible retention policies and versioning"
    }
  ];

  const benefits = [
    "Professional Acronis account setup and configuration",
    "Multi-device backup solution implementation",
    "Automated backup scheduling and monitoring",
    "Disaster recovery planning and testing",
    "Data encryption and security configuration",
    "24/7 backup monitoring and alerts"
  ];

  const faqs = [
    {
      question: "What information do I need to provide?",
      answer: "We'll need your business email address, the devices you want to backup, and your preferred backup schedule. We'll handle the rest of the setup process."
    },
    {
      question: "Do I need to purchase Acronis licenses separately?",
      answer: "Yes, Acronis licenses are purchased separately. We can help you choose the right plan and handle the setup once you have your licenses."
    },
    {
      question: "How long does the setup process take?",
      answer: "Basic setup typically takes 2-4 hours, while enterprise configurations may take 1-2 business days depending on complexity."
    },
    {
      question: "What devices are supported?",
      answer: "Acronis supports Windows, Mac, Linux, iOS, and Android devices, as well as virtual machines and cloud workloads."
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
              <HardDrive className="h-16 w-16 text-white" />
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
              Acronis Account Setup <span className="bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent">(Data Backup & Recovery)</span>
            </h1>
            
            <p className="text-xl text-blue-100 mb-8 leading-relaxed">
              Professional Acronis backup solution setup and configuration for comprehensive 
              data protection and disaster recovery planning.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/#contact"
                className="bg-white text-blue-600 font-semibold px-8 py-4 rounded-full hover:bg-blue-50 transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                Get Setup Quote
              </Link>
              <Link 
                to="/client/purchase/acronis-setup"
                className="border-2 border-white text-white font-semibold px-8 py-4 rounded-full hover:bg-white hover:text-blue-600 transition-all duration-300 transform hover:scale-105"
              >
                Purchase Now
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
                Acronis Backup <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Features</span>
              </h2>
              <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                Enterprise-grade backup and recovery solution with advanced security features
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {features.map((feature, index) => {
                const IconComponent = feature.icon;
                return (
                  <div key={index} className="bg-gray-900 rounded-2xl p-8 border border-gray-700 hover:border-blue-500 transition-all duration-300 transform hover:-translate-y-2">
                    <div className="p-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl inline-block mb-6">
                      <IconComponent className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-4">{feature.title}</h3>
                    <p className="text-gray-400 leading-relaxed">{feature.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Benefits & Pricing */}
      <section className="py-20 bg-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
                  Professional Acronis <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Setup</span>
                </h2>
                <p className="text-xl text-gray-400 mb-8 leading-relaxed">
                  Our experts will configure your Acronis backup solution for optimal performance, 
                  security, and reliability across all your devices and systems.
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
                <div className="max-w-md mx-auto">
                  <div className="bg-gray-700/50 rounded-xl p-8 border border-cyan-500/50 text-center">
                    <h4 className="text-2xl font-semibold text-white mb-2">Complete Setup</h4>
                    <p className="text-gray-400 text-sm mb-6">One-time Acronis backup solution setup</p>
                    <div className="text-4xl font-bold text-cyan-400 mb-2">
                      {loading ? '...' : formatCurrency(convertedPrice, currency)}
                    </div>
                    {currency !== 'USD' && !loading && (
                      <div className="text-sm text-gray-400 mb-6">$25 USD</div>
                    )}
                    <ul className="space-y-3 text-sm text-gray-300 text-left">
                      <li>✓ Acronis account creation</li>
                      <li>✓ Complete configuration</li>
                      <li>✓ Multi-device setup</li>
                      <li>✓ Training and support</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-20 bg-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
                Frequently Asked <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Questions</span>
              </h2>
              <p className="text-xl text-gray-400">
                Everything you need to know about our Acronis setup service
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
              Protect Your Data Today
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Get professional Acronis backup setup and ensure your data is always protected
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

export default AcronisSetupPage;