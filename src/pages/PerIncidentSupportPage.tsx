import React, { useEffect, useState } from 'react';
import { Wrench, ArrowRight, CheckCircle, Clock, Users, Home } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getPreferredCurrency, convertCurrency, formatCurrency } from '../utils/currency';

const PerIncidentSupportPage = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [currency, setCurrency] = useState('USD');
  const [convertedPrice, setConvertedPrice] = useState(20);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setIsVisible(true);
    window.scrollTo(0, 0);
    
    const initializePricing = async () => {
      try {
        const preferredCurrency = await getPreferredCurrency();
        const converted = preferredCurrency === 'USD' 
          ? 20 
          : await convertCurrency(20, 'USD', preferredCurrency);
        
        setCurrency(preferredCurrency);
        setConvertedPrice(converted);
        
        console.log(`Per Incident Support: $20 USD = ${formatCurrency(converted, preferredCurrency)}`);
      } catch (error) {
        console.error('Error converting per incident support pricing:', error);
      } finally {
        setLoading(false);
      }
    };
    
    initializePricing();
  }, []);

  const supportTypes = [
    {
      icon: Users,
      title: "Google Workspace Issues",
      description: "Troubleshoot Gmail, Drive, Calendar, and other Google Workspace problems",
      examples: ["Email delivery issues", "Drive sync problems", "Calendar sharing", "User access issues"]
    },
    {
      icon: Users,
      title: "Microsoft 365 Issues",
      description: "Resolve Outlook, Teams, SharePoint, and OneDrive technical problems",
      examples: ["Outlook configuration", "Teams connectivity", "SharePoint permissions", "OneDrive sync"]
    },
    {
      icon: Wrench,
      title: "SSL Certificate Issues",
      description: "Fix SSL certificate problems, renewal issues, and HTTPS configuration",
      examples: ["Certificate errors", "Mixed content warnings", "Renewal failures", "Browser warnings"]
    },
    {
      icon: Clock,
      title: "Acronis Backup Issues",
      description: "Resolve Acronis backup failures, configuration problems, and recovery issues",
      examples: ["Backup failures", "Restore problems", "Configuration errors", "Performance issues"]
    }
  ];

  const commonIssues = [
    "Email not sending or receiving properly",
    "Cloud storage sync problems",
    "SSL certificate warnings or errors",
    "Backup system failures or errors",
    "User access and permission issues",
    "Configuration and setup problems",
    "Performance optimization needs",
    "Security-related troubleshooting"
  ];

  const process = [
    {
      step: "01",
      title: "Issue Assessment",
      description: "We quickly analyze your specific problem and identify the root cause"
    },
    {
      step: "02",
      title: "Solution Planning",
      description: "Create a targeted action plan to resolve your issue efficiently"
    },
    {
      step: "03",
      title: "Implementation",
      description: "Execute the solution with minimal disruption to your operations"
    },
    {
      step: "04",
      title: "Verification",
      description: "Test and verify that the issue is completely resolved"
    },
    {
      step: "05",
      title: "Documentation",
      description: "Provide documentation and recommendations to prevent future issues"
    }
  ];

  const faqs = [
    {
      question: "What types of issues do you handle?",
      answer: "We handle a wide range of IT issues including Google Workspace problems, Microsoft 365 issues, SSL certificate errors, Acronis backup failures, email delivery problems, and general configuration issues. If you're unsure, contact us and we'll let you know if we can help."
    },
    {
      question: "How quickly can you resolve my issue?",
      answer: "Most common issues are resolved within 2-4 hours. Complex problems may take up to 24 hours. We provide regular updates throughout the resolution process and will give you an estimated timeline after initial assessment."
    },
    {
      question: "What information do I need to provide?",
      answer: "Please provide: 1) Detailed description of the issue 2) Any error messages you're seeing 3) When the problem started 4) What you were trying to do when it occurred 5) Relevant login credentials (handled securely) 6) Screenshots if applicable"
    },
    {
      question: "Do you provide ongoing support after fixing the issue?",
      answer: "Each incident includes 7 days of follow-up support to ensure the issue doesn't recur. For ongoing support needs, we recommend our monthly support packages or additional per-incident purchases."
    },
    {
      question: "What if you can't fix my issue?",
      answer: "If we determine that your issue cannot be resolved or is outside our expertise, we'll provide a full refund and recommend alternative solutions or specialists who can help."
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
              <Wrench className="h-16 w-16 text-white" />
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
              Per Incident <span className="bg-gradient-to-r from-orange-300 to-red-300 bg-clip-text text-transparent">Support</span>
            </h1>
            
            <p className="text-xl text-orange-100 mb-8 leading-relaxed">
              Quick resolution for specific IT issues across Google Workspace, Microsoft 365, 
              SSL certificates, Acronis backup, and other technical problems.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/client/purchase/per-incident-support"
                className="bg-white text-orange-600 font-semibold px-8 py-4 rounded-full hover:bg-orange-50 transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                Get Support Now
              </Link>
              <Link 
                to="/#contact"
                className="border-2 border-white text-white font-semibold px-8 py-4 rounded-full hover:bg-white hover:text-orange-600 transition-all duration-300 transform hover:scale-105"
              >
                Describe Your Issue
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Support Types */}
      <section className="py-20 bg-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
                What We <span className="bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">Support</span>
              </h2>
              <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                Expert troubleshooting for common IT issues across all major platforms
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {supportTypes.map((support, index) => {
                const IconComponent = support.icon;
                return (
                  <div key={index} className="bg-gray-900 rounded-2xl p-8 border border-gray-700 hover:border-orange-500 transition-all duration-300 transform hover:-translate-y-2">
                    <div className="p-4 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl inline-block mb-6">
                      <IconComponent className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-4">{support.title}</h3>
                    <p className="text-gray-400 mb-6 leading-relaxed">{support.description}</p>
                    
                    <div className="space-y-2">
                      <h4 className="text-white font-semibold text-sm mb-3">Common Issues:</h4>
                      {support.examples.map((example, exampleIndex) => (
                        <div key={exampleIndex} className="flex items-center space-x-2 text-sm">
                          <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
                          <span className="text-gray-400">{example}</span>
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

      {/* Process Section */}
      <section className="py-20 bg-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
                Our Support <span className="bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">Process</span>
              </h2>
              <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                A proven 5-step process for quick and effective issue resolution
              </p>
            </div>

            <div className="space-y-8">
              {process.map((step, index) => (
                <div key={index} className="flex items-start space-x-6 bg-gray-800 rounded-2xl p-8 border border-gray-700 hover:border-orange-500 transition-all duration-300">
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                      {step.step}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
                    <p className="text-gray-400 leading-relaxed">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Common Issues & Pricing */}
      <section className="py-20 bg-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
                  Common Issues We <span className="bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">Resolve</span>
                </h2>
                <p className="text-xl text-gray-400 mb-8 leading-relaxed">
                  From simple configuration problems to complex technical issues, 
                  we provide expert solutions for all your IT challenges.
                </p>
                
                <div className="grid md:grid-cols-2 gap-4">
                  {commonIssues.map((issue, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-300 text-sm">{issue}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-cyan-500/20">
                <h3 className="text-2xl font-bold text-white mb-6">Service Pricing</h3>
                <div className="max-w-md mx-auto">
                  <div className="bg-gray-700/50 rounded-xl p-8 border border-orange-500/50 text-center">
                    <h4 className="text-2xl font-semibold text-white mb-2">Per Incident Support</h4>
                    <p className="text-gray-400 text-sm mb-6">One-time issue resolution</p>
                    <div className="text-4xl font-bold text-orange-400 mb-2">
                      {loading ? '...' : formatCurrency(convertedPrice, currency)}
                    </div>
                    {currency !== 'USD' && !loading && (
                      <div className="text-sm text-gray-400 mb-6">$20 USD</div>
                    )}
                    <ul className="space-y-3 text-sm text-gray-300 text-left">
                      <li>✓ Expert troubleshooting</li>
                      <li>✓ Quick issue resolution</li>
                      <li>✓ 7-day follow-up support</li>
                      <li>✓ Documentation provided</li>
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
                Frequently Asked <span className="bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">Questions</span>
              </h2>
              <p className="text-xl text-gray-400">
                Everything you need to know about our per incident support service
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
              Get Your Issue Resolved Today
            </h2>
            <p className="text-xl text-orange-100 mb-8">
              Don't let technical problems slow down your business. Get expert help now.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/client/purchase/per-incident-support"
                className="bg-white text-orange-600 font-semibold px-8 py-4 rounded-full hover:bg-orange-50 transition-all duration-300 transform hover:scale-105 shadow-lg inline-flex items-center justify-center space-x-2"
              >
                <span>Purchase Support</span>
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PerIncidentSupportPage;