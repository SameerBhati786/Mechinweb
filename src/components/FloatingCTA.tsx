import React from 'react';
import { MessageCircle } from 'lucide-react';

const FloatingCTA: React.FC = () => {
  return (
    <div className="fixed bottom-6 right-6 z-50">      
      {/* Contact Button */}
      <a
        href="#contact"
        className="bg-cyan-500 hover:bg-cyan-600 text-white p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110 group"
        aria-label="Contact us"
      >
        <MessageCircle className="w-6 h-6 group-hover:animate-pulse" />
      </a>
    </div>
  );
};

export default FloatingCTA;