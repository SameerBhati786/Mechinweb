import React, { useRef, useEffect, useState } from 'react';
import { CheckCircle, Target, Zap, Shield } from 'lucide-react';

const About = () => {
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

  const features = [
    {
      icon: Target,
      title: "Precision & Expertise",
      description: "Every solution is tailored to your specific needs with meticulous attention to detail."
    },
    {
      icon: Zap,
      title: "Fast Turnaround",
      description: "Quick response times and efficient project delivery without compromising quality."
    },
    {
      icon: Shield,
      title: "Secure & Reliable",
      description: "Enterprise-grade security practices and proven methodologies for all services."
    }
  ];

  return (
    <section id="about" ref={sectionRef} className="py-20 bg-gray-800 scroll-mt-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className={`text-center mb-16 transition-all duration-1000 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
              About <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">Mechinweb</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
              Mechinweb is a specialized freelance IT services provider dedicated to helping businesses 
              and individuals navigate the complexities of cloud technology, email systems, and web hosting 
              with confidence and ease.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Content */}
            <div className={`transition-all duration-1000 delay-300 ${
              isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'
            }`}>
              <h3 className="text-2xl sm:text-3xl font-bold text-white mb-6">
                Why Choose Mechinweb?
              </h3>
              <p className="text-lg text-gray-400 mb-8 leading-relaxed">
                With years of experience in IT infrastructure and cloud technologies, 
                we provide professional solutions that eliminate technical headaches 
                and keep your business running smoothly.
              </p>

              <div className="space-y-4">
                {[
                  "Expert cloud migration and data transfer",
                  "DNS and email security troubleshooting",
                  "SSL certificate installation and renewal",
                  "24/7 support and consultation",
                  "Competitive pricing with no hidden fees"
                ].map((item, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-300">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Features Grid */}
            <div className={`space-y-6 transition-all duration-1000 delay-500 ${
              isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'
            }`}>
              {features.map((feature, index) => {
                const IconComponent = feature.icon;
                return (
                  <div key={index} className="bg-gray-900 rounded-2xl p-6 shadow-lg hover:shadow-2xl hover:shadow-cyan-500/20 transition-all duration-500 transform hover:-translate-y-2 hover:scale-105 border border-gray-700 group">
                    <div className="flex items-start space-x-4">
                      <div className="p-3 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-lg group-hover:scale-110 transition-transform duration-300">
                        <IconComponent className="h-6 w-6 text-white group-hover:animate-pulse" />
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-white mb-2 group-hover:text-cyan-400 transition-colors duration-300">{feature.title}</h4>
                        <p className="text-gray-400 leading-relaxed">{feature.description}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;