import React, { useEffect, useState } from 'react';
import { ArrowRight, Star, Users, Award } from 'lucide-react';

const Hero = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const scrollToQuote = () => {
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gray-900 pt-20">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-600 via-blue-700 to-purple-800 animate-gradient-x">
        <div className="absolute inset-0 bg-black/30"></div>
        <div className="absolute inset-0">
          {/* Floating particles */}
          {[...Array(100)].map((_, i) => (
            <div
              key={i}
              className="absolute bg-white/40 rounded-full animate-float"
              style={{
                width: `${Math.random() * 4 + 1}px`,
                height: `${Math.random() * 4 + 1}px`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${3 + Math.random() * 4}s`
              }}
            />
          ))}
          
          {/* Geometric shapes */}
          <div className="absolute top-20 left-10 w-20 h-20 border border-white/20 rounded-full animate-spin-slow"></div>
          <div className="absolute bottom-32 right-16 w-16 h-16 bg-gradient-to-r from-blue-400/20 to-indigo-400/20 rounded-lg animate-pulse"></div>
          <div className="absolute top-1/2 left-20 w-12 h-12 border-2 border-white/30 rotate-45 animate-bounce-slow"></div>
        </div>
      </div>

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className={`max-w-4xl mx-auto transition-all duration-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
          {/* Main heading */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-6 leading-tight px-4">
            <span className="block">Your Trusted Partner</span>
            <span className="block bg-gradient-to-r from-cyan-200 to-purple-200 bg-clip-text text-transparent">
              for Seamless IT &amp; Cloud Solutions
            </span>
          </h1>

          {/* Tagline */}
          <p className="text-lg sm:text-xl md:text-2xl text-cyan-100 mb-8 max-w-3xl mx-auto leading-relaxed px-4">
            Professional cloud migrations, DNS troubleshooting, and hosting support 
            for businesses seeking fast, reliable, and expert IT solutions.
          </p>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6 lg:gap-8 mb-10 px-4">
            <div className="flex items-center space-x-2 text-white">
              <Users className="h-5 w-5 text-cyan-300" />
              <span className="text-sm sm:text-base lg:text-lg font-semibold">50+ Happy Clients</span>
            </div>
            <div className="flex items-center space-x-2 text-white">
              <Star className="h-5 w-5 text-yellow-400" />
              <span className="text-sm sm:text-base lg:text-lg font-semibold">4.9/5 Rating</span>
            </div>
            <div className="flex items-center space-x-2 text-white">
              <Award className="h-5 w-5 text-emerald-400" />
              <span className="text-sm sm:text-base lg:text-lg font-semibold">100% Success Rate</span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center px-4">
            <button
              onClick={scrollToQuote}
              className="group relative px-6 sm:px-8 py-3 sm:py-4 bg-white text-cyan-600 font-semibold rounded-full hover:bg-cyan-50 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl w-full sm:w-auto text-center"
            >
              <span className="flex items-center space-x-2">
                <span>Contact Us</span>
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
              </span>
            </button>
            <a
              href="#services"
              className="px-6 sm:px-8 py-3 sm:py-4 border-2 border-white text-white font-semibold rounded-full hover:bg-white hover:text-cyan-600 transition-all duration-300 transform hover:scale-105 w-full sm:w-auto text-center"
            >
              View Services
            </a>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/70 rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;