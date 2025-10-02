import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  CreditCard, 
  Package, 
  FileText, 
  User, 
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  Search
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { RealtimeService } from '../../lib/realtime';
import RealtimeNotifications from '../RealtimeNotifications';

const DashboardLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState(3);
  const [realtimeConnected, setRealtimeConnected] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/client/login');
        return;
      }
      
      // Check if email is verified
      if (!user.email_confirmed_at) {
        navigate('/client/verify-email', {
          state: {
            email: user.email,
            userData: { name: user.user_metadata?.name || 'User' }
          }
        });
        return;
      }
      
      // Check if client profile exists
      const { data: clientProfile } = await supabase
        .from('clients')
        .select('id')
        .eq('id', user.id)
        .maybeSingle();
      
      if (!clientProfile) {
        // Create client profile for verified user
        await supabase
          .from('clients')
          .insert([{
            id: user.id,
            name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
            email: user.email,
            email_verified: true,
            email_verified_at: user.email_confirmed_at
          }]);
      }
      
      setUser(user);
      
      // Set up real-time connection status monitoring
      const channel = supabase.channel('connection-status');
      
      channel.subscribe((status) => {
        setRealtimeConnected(status === 'SUBSCRIBED');
      });
      
      return () => {
        channel.unsubscribe();
      };
    };

    checkAuth();
    
    // Cleanup real-time subscriptions on unmount
    return () => {
      RealtimeService.unsubscribeAll();
    };
  }, [navigate]);

  const handleLogout = async () => {
    RealtimeService.unsubscribeAll();
    await supabase.auth.signOut();
    navigate('/');
  };

  const sidebarItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/client/dashboard', active: location.pathname === '/client/dashboard' },
    { icon: ShoppingCart, label: 'Purchase Services', path: '/client/services', active: location.pathname === '/client/services' },
    { icon: Package, label: 'My Orders', path: '/client/orders', active: location.pathname === '/client/orders' },
    { icon: FileText, label: 'Invoices', path: '/client/invoices', active: location.pathname === '/client/invoices' },
    { icon: User, label: 'Profile', path: '/client/profile', active: location.pathname === '/client/profile' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-900/95 backdrop-blur-xl border-r border-gray-700/50 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between p-6 border-b border-gray-700/50">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">M</span>
              </div>
              <div>
                <h2 className="text-white font-bold text-lg">Mechinweb</h2>
                <p className="text-gray-400 text-xs">Client Dashboard</p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {sidebarItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <button
                  key={item.path}
                  onClick={() => {
                    navigate(item.path);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                    item.active
                      ? 'bg-gradient-to-r from-cyan-500/20 to-purple-600/20 text-cyan-400 border border-cyan-500/30'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                  }`}
                >
                  <IconComponent className={`w-5 h-5 ${item.active ? 'text-cyan-400' : 'group-hover:text-cyan-400'} transition-colors`} />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* User section */}
          <div className="p-4 border-t border-gray-700/50">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium truncate">
                  {user?.user_metadata?.name || user?.email?.split('@')[0] || 'User'}
                </p>
                <p className="text-gray-400 text-sm truncate">Premium Client</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 px-4 py-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-200"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm">Sign Out</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="bg-gray-800/50 backdrop-blur-xl border-b border-gray-700/50 sticky top-0 z-30">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-gray-400 hover:text-white transition-colors"
              >
                <Menu className="w-6 h-6" />
              </button>
              <div className="hidden md:block">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search services, orders..."
                    className="pl-10 pr-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent w-64"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <RealtimeNotifications />
              
              {/* Real-time connection indicator */}
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${realtimeConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                <span className="text-xs text-gray-400 hidden sm:block">
                  {realtimeConnected ? 'Live' : 'Offline'}
                </span>
              </div>
              
              <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;