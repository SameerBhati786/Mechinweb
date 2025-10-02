import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Search, 
  Filter, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  ExternalLink,
  Calendar
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { RealtimeService } from '../../lib/realtime';

const OrdersPage = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    setIsVisible(true);
    loadOrders();
    
    // Set up real-time subscription
    const setupRealtimeSubscription = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const unsubscribe = RealtimeService.subscribeToOrders(user.id, () => {
          loadOrders();
        });
        
        return unsubscribe;
      }
    };
    
    let unsubscribe: (() => void) | undefined;
    setupRealtimeSubscription().then((unsub) => {
      unsubscribe = unsub;
    });
    
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  const loadOrders = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          services (
            name,
            description,
            category
          )
        `)
        .eq('client_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'paid':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'cancelled':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'paid':
        return <CheckCircle className="w-4 h-4 text-blue-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'cancelled':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.services?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.package_type?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">My Orders</h1>
            <p className="text-gray-400 text-lg">Track your service orders and their progress</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className={`bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 transition-all duration-1000 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-10 pr-8 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent appearance-none cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className={`transition-all duration-1000 delay-400 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500 mx-auto"></div>
              <p className="text-gray-400 mt-4">Loading orders...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="p-8 text-center">
              <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No Orders Found</h3>
              <p className="text-gray-400">
                {searchTerm || statusFilter !== 'all' 
                  ? 'No orders match your current filters.' 
                  : 'You haven\'t placed any orders yet.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-700/30">
                  <tr>
                    <th className="text-left py-4 px-6 text-gray-300 font-medium">Service</th>
                    <th className="text-left py-4 px-6 text-gray-300 font-medium">Package</th>
                    <th className="text-left py-4 px-6 text-gray-300 font-medium">Amount</th>
                    <th className="text-left py-4 px-6 text-gray-300 font-medium">Status</th>
                    <th className="text-left py-4 px-6 text-gray-300 font-medium">Date</th>
                    <th className="text-left py-4 px-6 text-gray-300 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order, index) => (
                    <tr key={order.id} className="border-t border-gray-700/50 hover:bg-gray-700/20 transition-colors">
                      <td className="py-4 px-6">
                        <div>
                          <p className="text-white font-medium">{order.services?.name || 'Service'}</p>
                          <p className="text-gray-400 text-sm">{order.services?.category}</p>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="px-3 py-1 bg-cyan-500/20 text-cyan-400 rounded-full text-sm font-medium">
                          {order.package_type}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <p className="text-white font-semibold">
                          {order.currency === 'USD' ? '$' : '₹'}{(order.currency === 'USD' ? order.amount_usd : order.amount_inr)?.toFixed(2)}
                        </p>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(order.status)}
                          <span className={`px-3 py-1 rounded-full text-xs border ${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-2 text-gray-400">
                          <Calendar className="w-4 h-4" />
                          <span className="text-sm">{new Date(order.created_at).toLocaleDateString()}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        {order.zoho_invoice_id && (
                          <a
                            href={`https://invoice.zoho.com/invoices/${order.zoho_invoice_id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center space-x-1 text-cyan-400 hover:text-cyan-300 transition-colors"
                          >
                            <span className="text-sm">View Invoice</span>
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Summary Stats */}
      {orders.length > 0 && (
        <div className={`grid md:grid-cols-4 gap-6 transition-all duration-1000 delay-600 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                <Package className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{orders.length}</p>
                <p className="text-gray-400 text-sm">Total Orders</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{orders.filter(o => o.status === 'completed').length}</p>
                <p className="text-gray-400 text-sm">Completed</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{orders.filter(o => o.status === 'pending').length}</p>
                <p className="text-gray-400 text-sm">Pending</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-cyan-500/20 rounded-xl flex items-center justify-center">
                <span className="text-cyan-400 font-bold text-lg">$</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-white">
                  ${orders.filter(o => o.status === 'completed').reduce((sum, o) => sum + (o.amount_usd || 0), 0).toFixed(0)}
                </p>
                <p className="text-gray-400 text-sm">Total Spent</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersPage;