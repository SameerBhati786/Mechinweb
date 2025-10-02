import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, User, LogOut, ChevronDown } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isServicesOpen, setIsServicesOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check for user session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    // Handle scroll effect
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
    setIsMenuOpen(false);
  };

  const scrollToSection = (sectionId: string) => {
    // Close menus first
    setIsMenuOpen(false);
    setIsServicesOpen(false);
    
    // If we're not on the home page, navigate there first
    if (window.location.pathname !== '/') {
      navigate('/', { replace: true });
      // Wait for navigation to complete, then scroll
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else {
      // We're already on home page, just scroll
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const services = [
    { name: 'Email Migration & Setup', link: '/services/email-migration' },
    { name: 'Email Deliverability', link: '/services/email-deliverability' },
    { name: 'SSL & HTTPS Setup', link: '/services/ssl-setup' },
    { name: 'Cloud Suite Management', link: '/services/cloud-management' },
    { name: 'Cloud Data Migration', link: '/services/data-migration' },
    { name: 'Hosting & Control Panel Support', link: '/services/hosting-support' },
    { name: 'Acronis Account Setup', link: '/services/acronis-setup' },
    { name: 'Per Incident Support', link: '/services/per-incident-support' }
  ];

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
      isScrolled 
        ? 'bg-gray-900/98 backdrop-blur-xl shadow-2xl border-b border-gray-700/50' 
        : 'bg-gray-900/90 backdrop-blur-lg shadow-lg border-b border-gray-800/30'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-5">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <span className="text-white font-bold text-xl">M</span>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">MechinWeb</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <button
              onClick={() => scrollToSection('home')}
              className="text-gray-300 hover:text-cyan-400 transition-all duration-300 font-medium relative group py-2 text-sm lg:text-base"
            >
              Home
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-cyan-500 to-blue-600 transition-all duration-300 group-hover:w-full"></span>
            </button>
            
            {/* Services Dropdown */}
            <div 
              className="relative"
              onMouseEnter={() => setIsServicesOpen(true)}
              onMouseLeave={() => setIsServicesOpen(false)}
            >
              <button className="text-gray-300 hover:text-cyan-400 transition-all duration-300 font-medium relative group py-2 flex items-center space-x-1 text-sm lg:text-base">
                <span>Services</span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isServicesOpen ? 'rotate-180' : ''}`} />
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-cyan-500 to-blue-600 transition-all duration-300 group-hover:w-full"></span>
              </button>
              
              {/* Services Dropdown Menu */}
              <div className={`absolute top-full left-0 mt-2 w-80 lg:w-96 bg-gray-900/98 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-700/50 transition-all duration-300 ${
                isServicesOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2'
              }`}>
                <div className="p-4">
                  <div className="grid gap-2">
                    {services.map((service, index) => (
                      <Link
                        key={index}
                        to={service.link}
                        className="flex items-center space-x-3 p-3 rounded-xl hover:bg-gray-800/50 transition-all duration-200 group"
                        onClick={() => setIsServicesOpen(false)}
                      >
                        <div className="w-2 h-2 bg-cyan-500 rounded-full group-hover:scale-150 transition-transform duration-200"></div>
                        <span className="text-gray-300 group-hover:text-cyan-400 transition-colors duration-200 font-medium text-sm">
                          {service.name}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => scrollToSection('about')}
              className="text-gray-300 hover:text-cyan-400 transition-all duration-300 font-medium relative group py-2 text-sm lg:text-base"
            >
              About
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-cyan-500 to-blue-600 transition-all duration-300 group-hover:w-full"></span>
            </button>
            <button
              onClick={() => scrollToSection('contact')}
              className="text-gray-300 hover:text-cyan-400 transition-all duration-300 font-medium relative group py-2 text-sm lg:text-base"
            >
              Contact
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-cyan-500 to-blue-600 transition-all duration-300 group-hover:w-full"></span>
            </button>
          </nav>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-6">
            {user ? (
              <div className="flex items-center space-x-5">
                <Link
                  to="/client/dashboard"
                  className="flex items-center space-x-2 text-gray-300 hover:text-cyan-400 transition-all duration-300 font-medium px-4 py-2 rounded-lg hover:bg-gray-800/50"
                >
                  <User className="w-4 h-4" />
                  <span>Dashboard</span>
                </Link>
                <button
                  onClick={handleSignOut}
                  className="flex items-center space-x-2 text-gray-300 hover:text-red-400 transition-all duration-300 font-medium px-4 py-2 rounded-lg hover:bg-red-900/20"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <>
                <Link
                  to="/client/login"
                  className="text-gray-300 hover:text-cyan-400 transition-all duration-300 font-medium px-3 lg:px-4 py-2 rounded-lg hover:bg-gray-800/50 text-sm lg:text-base"
                >
                  Login
                </Link>
                <Link
                  to="/client/register"
                  className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-4 lg:px-8 py-2 lg:py-3 rounded-xl hover:from-cyan-600 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-2xl font-semibold transform hover:scale-105 text-sm lg:text-base"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-3 rounded-xl hover:bg-gray-800/50 transition-all duration-300"
          >
            {isMenuOpen ? (
              <X className="w-6 h-6 text-gray-300" />
            ) : (
              <Menu className="w-6 h-6 text-gray-300" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-700/50 bg-gray-900/98 backdrop-blur-xl">
            <div className="flex flex-col space-y-2">
              <button
                onClick={() => scrollToSection('home')}
                className="text-left text-gray-300 hover:text-cyan-400 transition-all duration-300 py-3 px-4 rounded-lg hover:bg-gray-800/50 font-medium text-base"
              >
                Home
              </button>
              
              {/* Mobile Services Menu */}
              <div>
                <button
                  onClick={() => setIsServicesOpen(!isServicesOpen)}
                  className="w-full text-left text-gray-300 hover:text-cyan-400 transition-all duration-300 py-3 px-4 rounded-lg hover:bg-gray-800/50 font-medium flex items-center justify-between text-base"
                >
                  <span>Services</span>
                  <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isServicesOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {isServicesOpen && (
                  <div className="ml-4 mt-2 space-y-1 max-h-64 overflow-y-auto">
                    {services.map((service, index) => (
                      <Link
                        key={index}
                        to={service.link}
                        className="block text-gray-400 hover:text-cyan-400 transition-all duration-300 py-2 px-4 rounded-lg hover:bg-gray-800/30 text-sm leading-relaxed"
                        onClick={() => {
                          setIsMenuOpen(false);
                          setIsServicesOpen(false);
                        }}
                      >
                        {service.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
              
              <button
                onClick={() => scrollToSection('about')}
                className="text-left text-gray-300 hover:text-cyan-400 transition-all duration-300 py-3 px-4 rounded-lg hover:bg-gray-800/50 font-medium text-base"
              >
                About
              </button>
              <button
                onClick={() => scrollToSection('contact')}
                className="text-left text-gray-300 hover:text-cyan-400 transition-all duration-300 py-3 px-4 rounded-lg hover:bg-gray-800/50 font-medium text-base"
              >
                Contact
              </button>
              
              <div className="pt-6 border-t border-gray-700/50 mt-4">
                {user ? (
                  <div className="flex flex-col space-y-2">
                    <Link
                      to="/client/dashboard"
                      className="flex items-center space-x-2 text-gray-300 hover:text-cyan-400 transition-all duration-300 py-3 px-4 rounded-lg hover:bg-gray-800/50 font-medium text-base"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <User className="w-4 h-4" />
                      <span>Dashboard</span>
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="flex items-center space-x-2 text-gray-300 hover:text-red-400 transition-all duration-300 py-3 px-4 rounded-lg hover:bg-red-900/20 text-left font-medium text-base"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col space-y-2">
                    <Link
                      to="/client/login"
                      className="text-gray-300 hover:text-cyan-400 transition-all duration-300 py-3 px-4 rounded-lg hover:bg-gray-800/50 font-medium text-base"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Login
                    </Link>
                    <Link
                      to="/client/register"
                      className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-6 py-3 rounded-xl hover:from-cyan-600 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-2xl text-center font-semibold text-base"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Sign Up
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}