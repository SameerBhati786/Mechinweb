import React, { useState, useRef, useEffect } from 'react';
import { Mail, Phone, MapPin, MessageCircle, Send, Clock, CheckCircle } from 'lucide-react';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      alert('Please fill in all required fields.');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Send email via Netlify function with enhanced error handling
      console.log('Submitting contact form...');
      
      const response = await fetch('/.netlify/functions/sendEmail', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'contact_form',
          name: formData.name,
          email: formData.email,
          subject: formData.subject,
          message: formData.message,
          timestamp: new Date().toISOString()
        })
      });

      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Response error:', errorText);
        
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { error: errorText };
        }
        
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }
      
      const responseData = await response.json();
      console.log('Email sent successfully:', responseData);
      
      setIsSubmitted(true);
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Show user-friendly error message
      let errorMessage = 'There was an error sending your message. ';
      
      if (error.message.includes('credentials')) {
        errorMessage += 'Email service is temporarily unavailable. ';
      } else if (error.message.includes('timeout')) {
        errorMessage += 'Request timed out. ';
      } else {
        errorMessage += `${error.message}. `;
      }
      
      errorMessage += 'Please try again or contact us directly at contact@mechinweb.com.';
      
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    {
      icon: Mail,
      title: "Email Us",
      content: "contact@mechinweb.com",
      description: "Send us an email and we'll respond within 24 hours",
      action: "mailto:contact@mechinweb.com"
    },
    {
      icon: MessageCircle,
      title: "WhatsApp",
      content: "+1 (555) 123-4567",
      description: "Message us directly for instant support",
      action: "https://wa.me/15551234567"
    }
  ];

  if (isSubmitted) {
    return (
      <section id="contact" className="py-20 bg-gradient-to-br from-green-50 via-blue-50 to-indigo-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <div className="bg-white rounded-3xl shadow-2xl p-12 border border-green-200">
              <div className="animate-bounce mb-8">
                <CheckCircle className="h-20 w-20 text-green-500 mx-auto" />
              </div>
              <h2 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-6">
                Message Received!
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                Thank you for contacting us. We've received your message and will get back to you within 24 hours.
              </p>
              
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 mb-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Need immediate assistance?</h3>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a
                    href="https://wa.me/15551234567?text=Hi%20Mechinweb,%20I%20just%20sent%20a%20contact%20message."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-green-500 text-white px-6 py-3 rounded-full font-semibold hover:bg-green-600 transition-all duration-300 transform hover:scale-105"
                  >
                    WhatsApp Chat
                  </a>
                  <a
                    href="tel:+15551234567"
                    className="bg-blue-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-blue-700 transition-all duration-300 transform hover:scale-105"
                  >
                    Call Now
                  </a>
                </div>
              </div>

              <button
                onClick={() => window.location.href = '#home'}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-full font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105"
              >
                Back to Home
              </button>
              
              <p className="text-sm text-gray-500 mt-6">
                A confirmation email has been sent to your inbox.
                </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="contact" ref={sectionRef} className="py-20 bg-gray-800 scroll-mt-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className={`text-center mb-16 transition-all duration-1000 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
              Get In <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">Touch</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
              Ready to start your next IT project? We're here to help. Reach out to us 
              and let's discuss how we can solve your technical challenges.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-12">
            {/* Contact Information */}
            <div className={`lg:col-span-1 space-y-8 transition-all duration-1000 delay-200 ${
              isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'
            }`}>
              <div>
                <h3 className="text-2xl font-bold text-white mb-6">Contact Information</h3>
                <p className="text-gray-400 mb-8 leading-relaxed">
                  Choose the method that works best for you. We're available to discuss 
                  your project requirements and provide expert guidance.
                </p>
              </div>

              {contactInfo.map((item, index) => {
                const IconComponent = item.icon;
                return (
                  <a
                    key={index}
                    href={item.action}
                    target={item.action.startsWith('http') ? '_blank' : '_self'}
                    rel={item.action.startsWith('http') ? 'noopener noreferrer' : undefined}
                    className="block bg-gray-900 rounded-2xl p-6 hover:shadow-lg hover:shadow-cyan-500/20 transition-all duration-300 transform hover:-translate-y-1 border border-gray-700"
                  >
                    <div className="flex items-start space-x-4">
                      <div className="p-3 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-lg">
                        <IconComponent className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-white mb-1">{item.title}</h4>
                        <p className="text-cyan-400 font-medium mb-2">{item.content}</p>
                        <p className="text-sm text-gray-400">{item.description}</p>
                      </div>
                    </div>
                  </a>
                );
              })}

              {/* Business Hours */}
              <div className="bg-gray-900 rounded-2xl p-6 border border-gray-700">
                <div className="flex items-center space-x-3 mb-4">
                  <Clock className="h-6 w-6 text-cyan-400" />
                  <h4 className="text-lg font-semibold text-white">Business Hours</h4>
                </div>
                <div className="space-y-2 text-gray-400">
                  <div className="flex justify-between">
                    <span>Monday - Friday</span>
                    <span className="font-medium">9:00 AM - 6:00 PM EST</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Saturday</span>
                    <span className="font-medium">10:00 AM - 4:00 PM EST</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sunday</span>
                    <span className="font-medium">Closed</span>
                  </div>
                </div>
                <p className="text-sm text-cyan-400 mt-4">
                  * Emergency support available 24/7 for existing clients
                </p>
              </div>
            </div>

            {/* Contact Form */}
            <div className={`lg:col-span-2 transition-all duration-1000 delay-400 ${
              isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'
            }`}>
              <div className="bg-gray-900 rounded-2xl shadow-2xl p-6 sm:p-8 lg:p-12 border border-gray-700">
                <h3 className="text-xl lg:text-2xl font-bold text-white mb-6 lg:mb-8">Send Us a Message</h3>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-semibold text-gray-300 mb-2">
                        Your Name *
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200 text-base"
                        placeholder="Your full name"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-semibold text-gray-300 mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200 text-base"
                        placeholder="your.email@example.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-sm font-semibold text-gray-300 mb-2">
                      Subject *
                    </label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      required
                      value={formData.subject}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200 text-base"
                      placeholder="What's this regarding?"
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-semibold text-gray-300 mb-2">
                      Message *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      required
                      rows={4}
                      value={formData.message}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200 resize-none text-base"
                      placeholder="Tell us about your project or question..."
                    />
                  </div>

                  <div className="text-center">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={`inline-flex items-center space-x-2 px-6 lg:px-8 py-3 lg:py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl w-full sm:w-auto justify-center ${
                        isSubmitting ? 'opacity-75 cursor-not-allowed' : 'hover:from-blue-700 hover:to-indigo-700'
                      }`}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          <span>Sending Message...</span>
                        </>
                      ) : (
                        <>
                          <Send className="h-5 w-5" />
                          <span>Send Message</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="text-center">
                    <p className="text-xs lg:text-sm text-gray-500">
                      * We'll respond within 24 hours. For urgent matters, contact us directly.
                    </p>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;