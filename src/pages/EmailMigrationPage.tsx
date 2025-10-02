import React, { useEffect, useState } from 'react';
import { Mail, ArrowRight, CheckCircle, Clock, Shield, Users, Home, Cloud, Database, Server, Settings, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getPreferredCurrency, convertCurrency, formatCurrency } from '../utils/currency';

const EmailMigrationPage = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [currency, setCurrency] = useState('USD');
  const [convertedPrice, setConvertedPrice] = useState(4);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setIsVisible(true);
    window.scrollTo(0, 0);
    
    const initializePricing = async () => {
      try {
        const preferredCurrency = await getPreferredCurrency();
        const converted = preferredCurrency === 'USD' 
          ? 4 
          : await convertCurrency(4, 'USD', preferredCurrency);
        
        setCurrency(preferredCurrency);
        setConvertedPrice(converted);
        
        console.log(`Email Migration: $4 USD = ${formatCurrency(converted, preferredCurrency)}`);
      } catch (error) {
        console.error('Error converting email migration pricing:', error);
      } finally {
        setLoading(false);
      }
    };
    
    initializePricing();
  }, []);

  const migrationTypes = [
    {
      icon: Mail,
      title: "Exchange Server to Exchange Online",
      description: "Migrate from on-premises Exchange to Microsoft 365 Exchange Online",
      platforms: ["Exchange 2016/2019", "Exchange Online", "Hybrid configurations"]
    },
    {
      icon: Cloud,
      title: "Exchange Server to Google Workspace",
      description: "Complete migration from Exchange Server to Google Workspace Gmail",
      platforms: ["Exchange Server", "Google Workspace", "G Suite Legacy"]
    },
    {
      icon: Users,
      title: "Microsoft 365 Tenant to Tenant",
      description: "Migrate between different Microsoft 365 tenants during mergers or reorganizations",
      platforms: ["M365 Business", "M365 Enterprise", "Office 365"]
    },
    {
      icon: Database,
      title: "IMAP to Cloud Platforms",
      description: "Migrate from any IMAP-based email system to modern cloud platforms",
      platforms: ["Generic IMAP", "Microsoft 365", "Google Workspace"]
    },
    {
      icon: Shield,
      title: "Google Workspace to Google Workspace",
      description: "Migrate between different Google Workspace organizations or domains",
      platforms: ["G Suite Legacy", "Google Workspace", "Cross-domain migration"]
    },
    {
      icon: Server,
      title: "Zoho Mail to M365/GWS",
      description: "Professional migration from Zoho Mail to Microsoft 365 or Google Workspace",
      platforms: ["Zoho Mail", "Microsoft 365", "Google Workspace"]
    },
    {
      icon: Settings,
      title: "cPanel Email to Cloud",
      description: "Migrate from cPanel-based email hosting to enterprise cloud solutions",
      platforms: ["cPanel Email", "Microsoft 365", "Google Workspace"]
    },
    {
      icon: Globe,
      title: "Cross-Platform Migrations",
      description: "Any-to-any email platform migration with complete data preservation",
      platforms: ["Yahoo Business", "Outlook.com", "Custom SMTP"]
    }
  ];

  const features = [
    {
      icon: Shield,
      title: "Zero Data Loss Guarantee",
      description: "Advanced migration protocols ensure 100% data integrity during transfer"
    },
    {
      icon: Clock,
      title: "Minimal Downtime",
      description: "Strategic migration scheduling to minimize business disruption"
    },
    {
      icon: CheckCircle,
      title: "Complete Data Migration",
      description: "Emails, contacts, calendars, tasks, and folder structures preserved"
    }
  ];

  const migrationProcess = [
    {
      step: "01",
      title: "Assessment & Planning",
      description: "We analyze your current email setup and create a detailed migration strategy"
    },
    {
      step: "02",
      title: "Pre-Migration Setup",
      description: "Configure the new email platform and prepare migration tools"
    },
    {
      step: "03",
      title: "Data Migration",
      description: "Secure transfer of all emails, contacts, and calendar data"
    },
    {
      step: "04",
      title: "Testing & Validation",
      description: "Thorough testing to ensure all data has been migrated correctly"
    },
    {
      step: "05",
      title: "Go-Live & Support",
      description: "Switch to the new system with ongoing support and monitoring"
    }
  ];

  const faqs = [
    {
      question: "What information and credentials do I need to provide?",
      answer: "For email migration, you'll need to provide: 1) Admin credentials for your SOURCE email platform (current email system) 2) Admin credentials for your DESTINATION email platform (new email system) 3) List of all email accounts to be migrated 4) Any specific requirements or custom configurations. We handle all credentials securely and delete them after migration completion."
    },
    {
      question: "How long does the migration process take?",
      answer: "Migration time depends on the amount of data and number of accounts. Basic migrations (up to 10 accounts) typically take 24-48 hours, while larger migrations may take 3-5 business days. We provide regular updates throughout the process."
    },
    {
      question: "Will there be any downtime during migration?",
      answer: "We use advanced migration techniques to minimize downtime. Most migrations can be completed with zero downtime by running both systems in parallel during the transition period."
    },
    {
      question: "What email platforms do you support?",
      answer: "We support all major email platforms including Gmail/Google Workspace, Microsoft 365/Exchange, Yahoo, Outlook.com, cPanel email, Plesk email, and most IMAP/POP3 providers. If you have a specific platform, contact us to confirm compatibility."
    },
    {
      question: "Do I need to purchase anything before the migration?",
      answer: "You should have your destination email platform (like Google Workspace or Microsoft 365) already set up and ready. We'll handle the technical migration process, but the target platform should be prepared in advance."
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
              <Mail className="h-16 w-16 text-white" />
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
              Email Migration & <span className="bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent">Setup</span>
            </h1>
            
            <p className="text-xl text-cyan-100 mb-8 leading-relaxed">
              Seamless email platform transitions with zero data loss and minimal downtime. 
              We handle the technical complexity while you focus on your business.
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

      {/* Migration Types Section */}
      <section className="py-20 bg-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
                Supported <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">Migration Types</span>
              </h2>
              <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                We handle migrations between all major email platforms with complete data integrity
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {migrationTypes.map((migration, index) => {
                const IconComponent = migration.icon;
                return (
                  <div key={index} className="bg-gray-900 rounded-2xl p-6 border border-gray-700 hover:border-cyan-500 transition-all duration-300 transform hover:-translate-y-2">
                    <div className="p-3 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl inline-block mb-4">
                      <IconComponent className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-3">{migration.title}</h3>
                    <p className="text-gray-400 text-sm mb-4 leading-relaxed">{migration.description}</p>
                    
                    <div className="space-y-1">
                      <h4 className="text-white font-semibold text-xs mb-2">Supported Platforms:</h4>
                      {migration.platforms.map((platform, platformIndex) => (
                        <div key={platformIndex} className="flex items-center space-x-2 text-xs">
                          <div className="w-1 h-1 bg-cyan-500 rounded-full"></div>
                          <span className="text-gray-400">{platform}</span>
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

      {/* Features Section */}
      <section className="py-20 bg-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
                Why Choose Our <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">Migration Service</span>
              </h2>
              <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                Professional email migration with enterprise-grade security and reliability
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {features.map((feature, index) => {
                const IconComponent = feature.icon;
                return (
                  <div key={index} className="bg-gray-800 rounded-2xl p-8 border border-gray-700 hover:border-cyan-500 transition-all duration-300 transform hover:-translate-y-2">
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

      {/* Migration Process */}
      <section className="py-20 bg-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
                Our <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">Migration Process</span>
              </h2>
              <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                A proven 5-step process that ensures smooth and secure email migration
              </p>
            </div>

            <div className="space-y-8">
              {migrationProcess.map((process, index) => (
                <div key={index} className="flex items-start space-x-6 bg-gray-900 rounded-2xl p-8 border border-gray-700 hover:border-cyan-500 transition-all duration-300">
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
      <section className="py-20 bg-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
                Transparent <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">Pricing</span>
              </h2>
              <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                Choose the migration package that fits your business needs
              </p>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-cyan-500/20">
              <div className="max-w-md mx-auto">
                <div className="bg-gray-700/50 rounded-xl p-8 border border-cyan-500/50 text-center">
                  <h4 className="text-2xl font-semibold text-white mb-2">Per Mailbox Migration</h4>
                  <p className="text-gray-400 text-sm mb-6">Professional email migration service</p>
                  <div className="text-4xl font-bold text-cyan-400 mb-2">
                    {loading ? '...' : formatCurrency(convertedPrice, currency)}
                    <span className="text-lg text-gray-400">/mailbox</span>
                  </div>
                  {currency !== 'USD' && !loading && (
                    <div className="text-sm text-gray-400 mb-6">$4 USD</div>
                  )}
                  <ul className="space-y-3 text-sm text-gray-300 text-left">
                    <li>✓ Complete mailbox migration</li>
                    <li>✓ Email backup included</li>
                    <li>✓ Zero downtime migration</li>
                    <li>✓ Basic support</li>
                  </ul>
                </div>
              </div>
            </div>
            </div>
          </div>
      </section>

      {/* FAQs Section */}
      <section className="py-20 bg-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
                Frequently Asked <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">Questions</span>
              </h2>
              <p className="text-xl text-gray-400">
                Everything you need to know about our email migration service
              </p>
            </div>

            <div className="space-y-6">
              {faqs.map((faq, index) => (
                <div key={index} className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
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
              Ready to Migrate Your Email System?
            </h2>
            <p className="text-xl text-cyan-100 mb-8">
              Get a free consultation and detailed migration plan tailored to your needs
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

export default EmailMigrationPage;