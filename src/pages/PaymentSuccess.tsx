import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, Download, MessageCircle, Calendar, Mail } from 'lucide-react';

const PaymentSuccess = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
    
    // Redirect to thank you page with payment type
    const searchParams = new URLSearchParams(window.location.search);
    const orderId = searchParams.get('order_id');
    const amount = searchParams.get('amount');
    
    if (orderId) {
      window.location.href = `/thank-you?type=payment&order_id=${orderId}&amount=${amount}`;
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 pt-20">
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
          <div className="max-w-2xl mx-auto text-center">
            <div className="animate-bounce mb-8">
              <CheckCircle className="h-24 w-24 text-green-400 mx-auto" />
            </div>
            
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6">
              Payment Successful!
            </h1>
            
            <p className="text-xl text-green-100 mb-8">
              Thank you for your purchase. Your order has been confirmed and we'll begin working on your service immediately.
            </p>

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 mb-8">
              <h2 className="text-2xl font-bold text-white mb-6">What happens next?</h2>
              
              <div className="grid md:grid-cols-2 gap-6 text-left">
                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg flex-shrink-0">
                    <span className="text-white font-bold">1</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Order Confirmation</h3>
                    <p className="text-green-100">You'll receive an email confirmation with order details and invoice.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg flex-shrink-0">
                    <span className="text-white font-bold">2</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Project Kickoff</h3>
                    <p className="text-green-100">Our team will contact you within 24 hours to begin the project.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg flex-shrink-0">
                    <span className="text-white font-bold">3</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Service Delivery</h3>
                    <p className="text-green-100">We'll complete your service according to the agreed timeline.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg flex-shrink-0">
                    <span className="text-white font-bold">4</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Ongoing Support</h3>
                    <p className="text-green-100">Receive post-delivery support as included in your package.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/client/dashboard"
                className="bg-white text-green-600 font-semibold px-8 py-4 rounded-full hover:bg-green-50 transition-all duration-300 transform hover:scale-105 shadow-lg inline-flex items-center justify-center space-x-2"
              >
                <span>View Dashboard</span>
              </Link>
              
              <Link
                to="/client/invoice/latest"
                className="border-2 border-white text-white font-semibold px-8 py-4 rounded-full hover:bg-white hover:text-green-600 transition-all duration-300 transform hover:scale-105 inline-flex items-center justify-center space-x-2"
              >
                <Download className="h-5 w-5" />
                <span>Download Invoice</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-gray-900 rounded-2xl p-8 border border-gray-700">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-white mb-4">Need Immediate Assistance?</h2>
                <p className="text-gray-400">
                  Our team is ready to help you get started with your new service.
                </p>
              </div>
              
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="p-4 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl inline-block mb-4">
                    <Mail className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">Email Support</h3>
                  <p className="text-gray-400 mb-4">Get support via email</p>
                  <a
                    href="mailto:contact@mechinweb.com"
                    className="bg-green-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-600 transition-all duration-300"
                  >
                    Email Now
                  </a>
                </div>
                
                <div className="text-center">
                  <div className="p-4 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl inline-block mb-4">
                    <Calendar className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">Schedule Call</h3>
                  <p className="text-gray-400 mb-4">Book a consultation call</p>
                  <button className="bg-blue-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-600 transition-all duration-300">
                    Schedule
                  </button>
                </div>
                
                <div className="text-center">
                  <div className="p-4 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl inline-block mb-4">
                    <CheckCircle className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">Project Status</h3>
                  <p className="text-gray-400 mb-4">Track your service progress</p>
                  <Link
                    to="/client/dashboard"
                    className="bg-purple-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-purple-600 transition-all duration-300"
                  >
                    View Status
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PaymentSuccess;