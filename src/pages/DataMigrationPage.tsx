import React, { useEffect, useState } from 'react';
import { Database, ArrowRight, Shield, Clock, CheckCircle, FileText, Home } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getPreferredCurrency, convertCurrency, formatCurrency } from '../utils/currency';

const DataMigrationPage = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [currency, setCurrency] = useState('USD');
  const [convertedPrice, setConvertedPrice] = useState(5);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setIsVisible(true);
    window.scrollTo(0, 0);
    
    const initializePricing = async () => {
      try {
        const preferredCurrency = await getPreferredCurrency();
        const converted = preferredCurrency === 'USD' 
          ? 5 
          : await convertCurrency(5, 'USD', preferredCurrency);
        
        setCurrency(preferredCurrency);
        setConvertedPrice(converted);
        
        console.log(`Data Migration: $5 USD = ${formatCurrency(converted, preferredCurrency)}`);
      } catch (error) {
        console.error('Error converting data migration pricing:', error);
      } finally {
        setLoading(false);
      }
    };
    
    initializePricing();
  }, []);

  const migrationTypes = [
    {
      icon: FileText,
      title: "Microsoft Teams Data",
      description: "Complete migration of Teams conversations, files, and channel data",
      features: ["Chat history", "File attachments", "Channel structure", "User permissions"]
    },
    {
      icon: Database,
      title: "SharePoint & OneDrive",
      description: "Secure transfer of documents, libraries, and site collections",
      features: ["Document libraries", "Site collections", "Metadata preservation", "Version history"]
    },
    {
      icon: Shield,
      title: "Google Drive Migration",
      description: "Seamless migration from Google Drive to Microsoft or vice versa",
      features: ["File structure", "Sharing permissions", "Folder organization", "Collaboration settings"]
    }
  ];

  const process = [
    {
      step: "Assessment",
      description: "Analyze your current data structure and migration requirements"
    },
    {
      step: "Planning",
      description: "Create detailed migration strategy with timeline and risk mitigation"
    },
    {
      step: "Pre-Migration",
      description: "Set up target environment and prepare migration tools"
    },
    {
      step: "Migration",
      description: "Execute secure data transfer with real-time monitoring"
    },
    {
      step: "Validation",
      description: "Verify data integrity and completeness post-migration"
    },
    {
      step: "Go-Live",
      description: "Switch to new system with user training and support"
    }
  ];

  const faqs = [
    {
      question: "What access credentials do I need to provide?",
      answer: "You'll need admin access to both SOURCE and DESTINATION platforms. For Microsoft: Office 365 admin credentials. For Google: Google Workspace admin access. We need read/write permissions to transfer data securely. All credentials are handled securely and deleted after migration."
    },
    {
      question: "Do I need to set up the destination platform first?",
      answer: "Yes, your destination platform (Google Workspace, Microsoft 365, etc.) should be set up and ready before migration. We can help you choose the right plan and configure the destination if needed as part of our service."
    },
    {
      question: "What data can be migrated?",
      answer: "We can migrate: Teams conversations and files, SharePoint document libraries, OneDrive files and folders, Google Drive files and sharing permissions, email data, calendar events, and contacts. We preserve folder structures and sharing permissions."
    },
    {
      question: "How do you ensure data security during migration?",
      answer: "We use enterprise-grade encryption, secure API connections, and follow strict data handling protocols. All data transfers are logged and verified. We provide detailed migration reports and maintain audit trails throughout the process."
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
      <section className="py-20 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 relative overflow-hidden">
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
            <div className="p-4 bg-gradient-to-r from-indigo-500 to-pink-600 rounded-2xl inline-block mb-8 shadow-2xl">
              <Database className="h-16 w-16 text-white" />
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
              Cloud Data <span className="bg-gradient-to-r from-indigo-300 to-pink-300 bg-clip-text text-transparent">Migration</span>
            </h1>
            
            <p className="text-xl text-indigo-100 mb-8 leading-relaxed">
              Per drive/site/Teams chat migration between Microsoft Teams, SharePoint, OneDrive, and Google Drive 
              with complete integrity preservation and minimal business disruption.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/#quote"
                className="bg-white text-indigo-600 font-semibold px-8 py-4 rounded-full hover:bg-indigo-50 transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                Get Migration Quote
              </Link>
              <Link 
                to="/#contact"
                className="border-2 border-white text-white font-semibold px-8 py-4 rounded-full hover:bg-white hover:text-indigo-600 transition-all duration-300 transform hover:scale-105"
              >
                Consult Expert
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Migration Types */}
      <section className="py-20 bg-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
                Data Migration <span className="bg-gradient-to-r from-indigo-400 to-pink-400 bg-clip-text text-transparent">Services</span>
              </h2>
              <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                Per-item data migration solutions for all major cloud platforms
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {migrationTypes.map((migration, index) => {
                const IconComponent = migration.icon;
                return (
                  <div key={index} className="bg-gray-900 rounded-2xl p-8 border border-gray-700 hover:border-indigo-500 transition-all duration-300 transform hover:-translate-y-2">
                    <div className="p-4 bg-gradient-to-r from-indigo-500 to-pink-600 rounded-xl inline-block mb-6">
                      <IconComponent className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-4">{migration.title}</h3>
                    <p className="text-gray-400 mb-6 leading-relaxed">{migration.description}</p>
                    
                    <div className="space-y-2">
                      {migration.features.map((feature, featureIndex) => (
                        <div key={featureIndex} className="flex items-center space-x-2 text-sm">
                          <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>
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

      {/* Migration Process */}
      <section className="py-20 bg-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
                Migration <span className="bg-gradient-to-r from-indigo-400 to-pink-400 bg-clip-text text-transparent">Process</span>
              </h2>
              <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                Our proven 6-step process ensures secure and successful data migration
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {process.map((step, index) => (
                <div key={index} className="bg-gray-800 rounded-2xl p-6 border border-gray-700 hover:border-indigo-500 transition-all duration-300 transform hover:-translate-y-2">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-pink-600 rounded-full flex items-center justify-center text-white font-bold">
                      {index + 1}
                    </div>
                    <h3 className="text-lg font-bold text-white">{step.step}</h3>
                  </div>
                  <p className="text-gray-400 leading-relaxed">{step.description}</p>
                </div>
              ))}
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
                  Why Choose Our <span className="bg-gradient-to-r from-indigo-400 to-pink-400 bg-clip-text text-transparent">Migration Service</span>
                </h2>
                <p className="text-xl text-gray-400 mb-8 leading-relaxed">
                  Professional per-item data migration ensures zero data loss, maintains file integrity, 
                  and preserves user permissions and sharing settings. Pay only for what you migrate.
                </p>
                
                <div className="space-y-4">
                  {[
                    "100% data integrity guarantee",
                    "Minimal business disruption",
                    "Preserve file permissions and sharing",
                    "Maintain folder structure and organization",
                    "Real-time migration monitoring",
                    "Post-migration validation and support"
                  ].map((benefit, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-300">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="bg-gray-900 rounded-2xl p-8 border border-gray-700">
                <div className="flex items-center space-x-3 mb-6">
                  <Shield className="h-8 w-8 text-indigo-500" />
                  <h3 className="text-xl font-bold text-white">Per User Migration</h3>
                </div>
                <p className="text-gray-400 text-sm mb-6">Microsoft Teams, SharePoint, OneDrive, Google Drive</p>
                
                <div className="text-center mb-6">
                  <div className="text-4xl font-bold text-cyan-400 mb-2">
                    {loading ? '...' : formatCurrency(convertedPrice, currency)}
                    <span className="text-lg text-gray-400">/user</span>
                  </div>
                  {currency !== 'USD' && !loading && (
                    <div className="text-sm text-gray-400">$5 USD</div>
                  )}
                </div>
                
                <ul className="space-y-2 text-sm text-gray-300">
                  <li>✓ Microsoft Teams chat migration</li>
                  <li>✓ SharePoint site migration</li>
                  <li>✓ OneDrive migration</li>
                  <li>✓ Google Drive migration</li>
                </ul>
                
                <div className="mt-6 pt-4 border-t border-gray-600">
                  <div className="flex items-center space-x-2 text-xs text-gray-400">
                    <Shield className="h-4 w-4 text-indigo-500" />
                    <span>Enterprise-grade security & compliance</span>
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
                Frequently Asked <span className="bg-gradient-to-r from-indigo-400 to-pink-400 bg-clip-text text-transparent">Questions</span>
              </h2>
              <p className="text-xl text-gray-400">
                Common questions about our data migration service
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
      <section className="py-20 bg-gradient-to-r from-indigo-600 to-pink-600">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
              Ready to Migrate Your Data?
            </h2>
            <p className="text-xl text-indigo-100 mb-8">
              Get a comprehensive migration plan with timeline and cost estimate
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/#contact"
                className="bg-white text-indigo-600 font-semibold px-8 py-4 rounded-full hover:bg-indigo-50 transition-all duration-300 transform hover:scale-105 shadow-lg inline-flex items-center justify-center space-x-2"
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

export default DataMigrationPage;