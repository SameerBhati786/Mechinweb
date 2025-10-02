import React, { useEffect, useState } from 'react';
import { Shield, ArrowRight, CheckCircle, Clock, Mail, Users, Home } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getPreferredCurrency, convertCurrency, formatCurrency } from '../utils/currency';

const EmailSecurityPage = () => {
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
        
        console.log(`Email Deliverability: $25 USD = ${formatCurrency(converted, preferredCurrency)}`);
      } catch (error) {
        console.error('Error converting email deliverability pricing:', error);
      } finally {
        setLoading(false);
      }
    };
    
    initializePricing();
  }, []);

  const features = [
    {
      icon: Shield,
      title: "Advanced Security",
      description: "Enterprise-grade email security with spam filtering and threat protection"
    },
    {
      icon: Mail,
      title: "Deliverability Optimization",
      description: "Ensure your emails reach the inbox with proper authentication and reputation management"
    },
    {
      icon: Users,
      title: "Domain Protection",
      description: "Protect your domain reputation and prevent email spoofing attacks"
    }
  ];

  const securityProcess = [
    {
      step: "01",
      title: "Domain Analysis",
      description: "We analyze your current email setup and identify security vulnerabilities"
    },
    {
      step: "02",
      title: "Security Configuration",
      description: "Configure SPF, DKIM, and DMARC records for optimal deliverability"
    },
    {
      step: "03",
      title: "Monitoring Setup",
      description: "Implement monitoring tools to track email performance and security"
    },
    {
      step: "04",
      title: "Testing & Validation",
      description: "Comprehensive testing to ensure all security measures are working correctly"
    },
    {
      step: "05",
      title: "Ongoing Support",
      description: "Continuous monitoring and support to maintain optimal email security"
    }
  ];

  const faqs = [
    {
      question: "What does email deliverability service include?",
      answer: "Our email deliverability service includes SPF, DKIM, and DMARC configuration, domain reputation monitoring, spam filter optimization, and ongoing deliverability monitoring to ensure your emails reach the inbox."
    },
    {
      question: "How long does the setup take?",
      answer: "Email deliverability setup typically takes 24-48 hours to complete. This includes DNS configuration, testing, and validation of all security measures."
    },
    {
      question: "Will this affect my current email setup?",
      answer: "No, our deliverability improvements work alongside your existing email setup. We only add security records and monitoring without disrupting your current email flow."
    },
    {
      question: "Do you provide ongoing monitoring?",
      answer: "Yes, our service includes ongoing monitoring of your email deliverability and domain reputation. We'll alert you to any issues and provide recommendations for improvement."
    },
    {
      question: "What if my emails are still going to spam?",
      answer: "We provide comprehensive analysis and recommendations to improve your sender reputation. This may include content optimization, list hygiene, and additional authentication measures."
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
      <section className="py-20 bg-gradient-to-br from-cyan-900 via-blue-900 to-purple-900 relative overflow-hidden">
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
            <div className="p-4 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl inline-block mb-8 shadow-2xl">
              <Shield className="h-16 w-16 text-white" />
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
              Email <span className="bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent">Deliverability</span>
            </h1>
            
            <p className="text-xl text-cyan-100 mb-8 leading-relaxed">
              Ensure your emails reach the inbox with professional email security and deliverability optimization. 
              Protect your domain reputation and maximize email performance.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => window.location.href = '/#quote'}
                className="bg-white text-cyan-600 font-semibold px-8 py-4 rounded-full hover:bg-cyan-50 transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                Get Free Quote
              </button>
              <Link 
                to="/#contact"
                className="border-2 border-white text-white font-semibold px-8 py-4 rounded-full hover:bg-white hover:text-cyan-600 transition-all duration-300 transform hover:scale-105"
              >
                Contact Us
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
                Why Choose Our <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">Email Deliverability Service</span>
              </h2>
              <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                Professional email security and deliverability optimization for maximum inbox placement
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {features.map((feature, index) => {
                const IconComponent = feature.icon;
                return (
                  <div key={index} className="bg-gray-900 rounded-2xl p-8 border border-gray-700 hover:border-cyan-500 transition-all duration-300 transform hover:-translate-y-2">
                    <div className="p-4 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl inline-block mb-6">
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

      {/* Process Section */}
      <section className="py-20 bg-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
                Our <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">Setup Process</span>
              </h2>
              <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                A proven 5-step process that ensures optimal email deliverability and security
              </p>
            </div>

            <div className="space-y-8">
              {securityProcess.map((process, index) => (
                <div key={index} className="flex items-start space-x-6 bg-gray-800 rounded-2xl p-8 border border-gray-700 hover:border-cyan-500 transition-all duration-300">
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                      {process.step}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-3">{process.title}</h3>
                    <p className="text-gray-400 leading-relaxed">{process.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
                Simple <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">Pricing</span>
              </h2>
              <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                One-time setup for complete email deliverability optimization
              </p>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-cyan-500/20">
              <div className="max-w-md mx-auto">
                <div className="bg-gray-700/50 rounded-xl p-8 border border-cyan-500/50 text-center">
                  <h4 className="text-2xl font-semibold text-white mb-2">Email Deliverability Setup</h4>
                  <p className="text-gray-400 text-sm mb-6">Complete email security and deliverability optimization</p>
                  
                  <div className="text-4xl font-bold text-cyan-400 mb-2">
                    {loading ? (
                      <div className="animate-pulse">...</div>
                    ) : (
                      formatCurrency(convertedPrice, currency)
                    )}
                    <span className="text-lg text-gray-400">/setup</span>
                  </div>
                  
                  {currency !== 'USD' && !loading && (
                    <div className="text-sm text-gray-400 mb-6">$25 USD</div>
                  )}
                  
                  <ul className="space-y-3 text-sm text-gray-300 text-left">
                    <li>✓ SPF, DKIM, DMARC configuration</li>
                    <li>✓ Domain reputation monitoring</li>
                    <li>✓ Spam filter optimization</li>
                    <li>✓ Deliverability testing</li>
                    <li>✓ 30-day support included</li>
                  </ul>
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
                Frequently Asked <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">Questions</span>
              </h2>
              <p className="text-xl text-gray-400">
                Everything you need to know about our email deliverability service
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
      <section className="py-20 bg-gradient-to-r from-cyan-600 to-blue-600">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
              Ready to Improve Your Email Deliverability?
            </h2>
            <p className="text-xl text-cyan-100 mb-8">
              Get professional email security setup and ensure your emails reach the inbox
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/#contact"
                className="bg-white text-cyan-600 font-semibold px-8 py-4 rounded-full hover:bg-cyan-50 transition-all duration-300 transform hover:scale-105 shadow-lg inline-flex items-center justify-center space-x-2"
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

export default EmailSecurityPage;