import React, { useState, useEffect, useRef } from 'react';
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';

const Testimonials = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
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

  const testimonials = [
    {
      name: "Sarah Johnson",
      position: "CEO, TechStart Solutions",
      company: "TechStart Solutions",
      avatar: "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150&h=150",
      rating: 5,
      text: "Mechinweb transformed our email system migration from a nightmare into a seamless experience. Their attention to detail and technical expertise is unmatched. We had zero downtime and all our data was perfectly preserved."
    },
    {
      name: "Michael Chen",
      position: "IT Director, Global Dynamics",
      company: "Global Dynamics",
      avatar: "https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150",
      rating: 5,
      text: "The DNS troubleshooting service saved us thousands in potential lost revenue. The team quickly identified and resolved our email authentication issues. Professional, fast, and reliable - exactly what we needed."
    },
    {
      name: "Emily Rodriguez",
      position: "Operations Manager, Creative Agency Pro",
      company: "Creative Agency Pro",
      avatar: "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150",
      rating: 5,
      text: "Outstanding cloud migration service! They moved our entire Google Workspace to Microsoft 365 without any data loss. The communication throughout the process was excellent, and they delivered ahead of schedule."
    },
    {
      name: "David Thompson",
      position: "Founder, E-commerce Plus",
      company: "E-commerce Plus",
      avatar: "https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150&h=150",
      rating: 5,
      text: "Mechinweb's SSL certificate installation and hosting support have been invaluable. They not only set everything up perfectly but also provided ongoing monitoring and maintenance. Highly recommended!"
    },
    {
      name: "Lisa Park",
      position: "CTO, FinTech Innovations",
      company: "FinTech Innovations",
      avatar: "https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=150&h=150",
      rating: 5,
      text: "The level of security expertise and attention to detail in their DMARC and SPF setup was impressive. Our email deliverability improved dramatically, and we haven't had any security issues since."
    }
  ];

  const nextTestimonial = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === testimonials.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevTestimonial = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? testimonials.length - 1 : prevIndex - 1
    );
  };

  useEffect(() => {
    const timer = setInterval(nextTestimonial, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section id="reviews" ref={sectionRef} className="py-20 bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 scroll-mt-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className={`text-center mb-16 transition-all duration-1000 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
              What Our <span className="bg-gradient-to-r from-blue-300 to-indigo-300 bg-clip-text text-transparent">Clients Say</span>
            </h2>
            <p className="text-xl text-blue-200 max-w-3xl mx-auto leading-relaxed">
              Don't just take our word for it. Here's what our clients have to say about our services.
            </p>
          </div>

          {/* Testimonial Carousel */}
          <div className={`relative transition-all duration-1000 delay-300 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}>
            <div className="relative bg-white/10 backdrop-blur-lg rounded-2xl p-8 sm:p-12 shadow-2xl border border-white/20">
              {/* Quote Icon */}
              <Quote className="h-12 w-12 text-blue-300 mb-6 mx-auto" />
              
              {/* Testimonial Content */}
              <div className="text-center mb-8">
                <p className="text-lg sm:text-xl text-white leading-relaxed mb-8 max-w-4xl mx-auto">
                  "{testimonials[currentIndex].text}"
                </p>
                
                {/* Stars */}
                <div className="flex justify-center space-x-1 mb-6">
                  {[...Array(testimonials[currentIndex].rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                
                {/* Author Info */}
                <div className="flex items-center justify-center space-x-4">
                  <img
                    src={testimonials[currentIndex].avatar}
                    alt={testimonials[currentIndex].name}
                    className="w-16 h-16 rounded-full border-3 border-white/30"
                  />
                  <div className="text-left">
                    <h4 className="text-lg font-bold text-white">{testimonials[currentIndex].name}</h4>
                    <p className="text-blue-200">{testimonials[currentIndex].position}</p>
                    <p className="text-blue-300 text-sm">{testimonials[currentIndex].company}</p>
                  </div>
                </div>
              </div>

              {/* Navigation Buttons */}
              <div className="flex justify-center space-x-4">
                <button
                  onClick={prevTestimonial}
                  className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-all duration-200 backdrop-blur-sm"
                >
                  <ChevronLeft className="h-6 w-6 text-white" />
                </button>
                <button
                  onClick={nextTestimonial}
                  className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-all duration-200 backdrop-blur-sm"
                >
                  <ChevronRight className="h-6 w-6 text-white" />
                </button>
              </div>

              {/* Dots Indicator */}
              <div className="flex justify-center space-x-2 mt-6">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      index === currentIndex ? 'bg-blue-300' : 'bg-white/30 hover:bg-white/50'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className={`grid grid-cols-2 lg:grid-cols-4 gap-8 mt-16 transition-all duration-1000 delay-500 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}>
            {[
              { number: "50+", label: "Happy Clients" },
              { number: "4.9/5", label: "Average Rating" },
              { number: "100%", label: "Success Rate" },
              { number: "24h", label: "Response Time" }
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-white mb-2">{stat.number}</div>
                <div className="text-blue-200 text-sm sm:text-base">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;