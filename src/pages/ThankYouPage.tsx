import React, { useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle, Mail, Calendar, ArrowRight, User } from 'lucide-react';

const ThankYouPage = () => {
  const [searchParams] = useSearchParams();
  const type = searchParams.get('type') || 'registration';
  const email = searchParams.get('email') || '';
  const name = searchParams.get('name') || '';

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const getContent = () => {
    switch (type) {
      case 'registration':
        return {
          title: 'Welcome to Mechinweb!',
          subtitle: 'Your account is ready!',
          message: 'Thank you for joining Mechinweb! Your account has been created and you can now log in to access our services.',
          icon: User,
          gradient: 'from-green-500 to-emerald-600',
          actions: [
            {
              label: 'Go to Login',
              href: '/client/login',
              primary: true,
              icon: ArrowRight
            }
          ]
        };
      case 'payment':
        return {
          title: 'Payment Successful!',
          subtitle: 'Your order has been confirmed',
          message: 'Thank you for your purchase. We\'ve received your payment and will begin working on your service immediately. You\'ll receive email updates about your order progress.',
          icon: CheckCircle,
          gradient: 'from-blue-500 to-indigo-600',
          actions: [
            {
              label: 'View Dashboard',
              href: '/client/dashboard',
              primary: true,
              icon: Calendar
            },
            {
              label: 'Download Invoice',
              href: '/client/invoices',
              primary: false,
              icon: ArrowRight
            }
          ]
        };
      default:
        return {
          title: 'Thank You!',
          subtitle: 'Action completed successfully',
          message: 'Thank you for using Mechinweb services.',
          icon: CheckCircle,
          gradient: 'from-cyan-500 to-blue-600',
          actions: [
            {
              label: 'Go Home',
              href: '/',
              primary: true,
              icon: ArrowRight
            }
          ]
        };
    }
  };

  const content = getContent();
  const IconComponent = content.icon;

  return (
    <div className="min-h-screen bg-gray-900 pt-20">
      <section className="py-20 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative overflow-hidden">
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
          <div className="max-w-2xl mx-auto text-center">
            <div className="animate-bounce mb-8">
              <div className={`p-6 bg-gradient-to-r ${content.gradient} rounded-full inline-block shadow-2xl`}>
                <IconComponent className="h-16 w-16 text-white" />
              </div>
            </div>
            
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6">
              {content.title}
            </h1>
            
            <h2 className="text-xl text-gray-300 mb-8">
              {content.subtitle}
            </h2>
            
            <p className="text-lg text-gray-400 mb-12 leading-relaxed max-w-xl mx-auto">
              {content.message}
            </p>

            {name && (
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 mb-8">
                <p className="text-white text-lg">
                  Welcome, <span className="font-bold text-cyan-400">{name}</span>!
                </p>
                {email && (
                  <p className="text-gray-300 text-sm mt-2">
                    {type === 'registration' ? 'Please check your email to verify your account' : `Confirmation sent to: ${email}`}
                  </p>
                )}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {content.actions.map((action, index) => {
                const ActionIcon = action.icon;
                return action.href.startsWith('http') || action.href.startsWith('mailto:') ? (
                  <a
                    key={index}
                    href={action.href}
                    target={action.href.startsWith('http') ? '_blank' : '_self'}
                    rel={action.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                    className={`inline-flex items-center space-x-2 px-8 py-4 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg ${
                      action.primary
                        ? `bg-gradient-to-r ${content.gradient} text-white hover:shadow-xl`
                        : 'border-2 border-white text-white hover:bg-white hover:text-gray-900'
                    }`}
                  >
                    <ActionIcon className="h-5 w-5" />
                    <span>{action.label}</span>
                  </a>
                ) : (
                  <Link
                    key={index}
                    to={action.href}
                    className={`inline-flex items-center space-x-2 px-8 py-4 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg ${
                      action.primary
                        ? `bg-gradient-to-r ${content.gradient} text-white hover:shadow-xl`
                        : 'border-2 border-white text-white hover:bg-white hover:text-gray-900'
                    }`}
                  >
                    <ActionIcon className="h-5 w-5" />
                    <span>{action.label}</span>
                  </Link>
                );
              })}
            </div>

            {type === 'registration' && (
              <div className="mt-12 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 rounded-2xl p-6 border border-cyan-500/20">
                <h3 className="text-xl font-bold text-white mb-4">What's Next?</h3>
                <div className="grid md:grid-cols-3 gap-4 text-sm">
                  <div className="text-center">
                    <div className="w-8 h-8 bg-cyan-500 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-white font-bold">1</span>
                    </div>
                    <p className="text-white font-medium">Login</p>
                    <p className="text-gray-400">Access your account</p>
                  </div>
                  <div className="text-center">
                    <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-white font-bold">2</span>
                    </div>
                    <p className="text-white font-medium">Dashboard</p>
                    <p className="text-gray-400">View your client dashboard</p>
                  </div>
                  <div className="text-center">
                    <div className="w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-white font-bold">3</span>
                    </div>
                    <p className="text-white font-medium">Browse Services</p>
                    <p className="text-gray-400">Choose from our IT services</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default ThankYouPage;