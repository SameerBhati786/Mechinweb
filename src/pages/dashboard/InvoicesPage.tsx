import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Search, 
  Download, 
  Eye,
  Calendar,
  DollarSign,
  Filter,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { RealtimeService } from '../../lib/realtime';

const InvoicesPage = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setIsVisible(true);
    initializeInvoices();
  }, []);

  const initializeInvoices = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await loadInvoices(user.id);
        
        // Set up real-time subscription
        const unsubscribe = RealtimeService.subscribeToInvoices(user.id, (payload) => {
          loadInvoices(user.id);
          
          // Show notification for new invoices
          if (payload.eventType === 'INSERT') {
            RealtimeService.showNotification(
              'New Invoice',
              `Invoice ${payload.new.invoice_number} has been generated.`,
              'info'
            );
          }
          
          // Show notification for payment updates
          if (payload.eventType === 'UPDATE' && payload.new.status !== payload.old?.status) {
            if (payload.new.status === 'paid') {
              RealtimeService.showNotification(
                'Payment Confirmed',
                `Invoice ${payload.new.invoice_number} has been paid.`,
                'success'
              );
            }
          }
        });

        // Cleanup on unmount
        return () => {
          unsubscribe();
        };
      }
    } catch (error) {
      console.error('Error loading invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadInvoices = async (userId: string) => {
    try {
      const { data } = await supabase
        .from('invoices')
        .select(`
          *,
          orders (
            services (name, description)
          )
        `)
        .eq('client_id', userId)
        .order('created_at', { ascending: false });
      
      setInvoices(data || []);
    } catch (error) {
      console.error('Error loading invoices:', error);
    }
  };

  const statusOptions = [
    { value: 'all', label: 'All Invoices', count: invoices.length },
    { value: 'paid', label: 'Paid', count: invoices.filter(i => i.status === 'paid').length },
    { value: 'sent', label: 'Sent', count: invoices.filter(i => i.status === 'sent').length },
    { value: 'overdue', label: 'Overdue', count: invoices.filter(i => i.status === 'overdue').length }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'sent':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'overdue':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'sent':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'overdue':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = (invoice.invoice_number || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalAmount = invoices.reduce((sum, invoice) => sum + (invoice.total_amount || 0), 0);
  const paidAmount = invoices.filter(i => i.status === 'paid').reduce((sum, invoice) => sum + (invoice.total_amount || 0), 0);
  const outstandingAmount = invoices.filter(i => i.status !== 'paid').reduce((sum, invoice) => sum + (invoice.total_amount || 0), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Invoices</h1>
            <p className="text-gray-400 text-lg">View and manage your billing history</p>
          </div>
          <div className="mt-4 md:mt-0">
            <button className="bg-gradient-to-r from-cyan-500 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-cyan-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 inline-flex items-center space-x-2">
              <Download className="w-4 h-4" />
              <span>Download All</span>
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className={`grid md:grid-cols-3 gap-6 transition-all duration-1000 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-500/20 rounded-xl">
              <DollarSign className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Total Invoiced</p>
              <p className="text-2xl font-bold text-white">${totalAmount.toFixed(2)}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-green-500/20 rounded-xl">
              <CheckCircle className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Paid</p>
              <p className="text-2xl font-bold text-white">${paidAmount.toFixed(2)}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-yellow-500/20 rounded-xl">
              <Clock className="w-6 h-6 text-yellow-400" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Outstanding</p>
              <p className="text-2xl font-bold text-white">${outstandingAmount.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className={`transition-all duration-1000 delay-400 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search invoices..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <div className="flex flex-wrap gap-2">
            {statusOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setStatusFilter(option.value)}
                className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                  statusFilter === option.value
                    ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white'
                    : 'bg-gray-800/50 text-gray-400 hover:text-white hover:bg-gray-700/50'
                }`}
              >
                {option.label} ({option.count})
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Invoices Table */}
      <div className={`transition-all duration-1000 delay-600 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700/50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Invoice</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Service</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Date</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Due Date</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Amount</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700/50">
                {filteredInvoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-gray-700/30 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-white font-medium">{invoice.invoice_number}</p>
                        <p className="text-gray-400 text-sm">{invoice.id.slice(0, 8)}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-white">{invoice.orders?.services?.name || 'Service'}</td>
                    <td className="px-6 py-4 text-gray-300">{new Date(invoice.created_at).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      <span className={`text-sm ${
                        new Date(invoice.due_date) < new Date() && invoice.status !== 'paid' ? 'text-red-400' : 'text-gray-300'
                      }`}>
                        {new Date(invoice.due_date).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-white font-semibold">${(invoice.total_amount || 0).toFixed(2)}</p>
                        <p className="text-gray-400 text-sm">+${(invoice.tax_amount || 0).toFixed(2)} tax</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(invoice.status)}
                        <span className={`px-3 py-1 rounded-full text-xs border ${getStatusColor(invoice.status)}`}>
                          {invoice.status}
                        </span>
                      </div>
                      {invoice.status === 'paid' && (
                        <p className="text-gray-400 text-xs mt-1">Paid: {new Date(invoice.updated_at).toLocaleDateString()}</p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <Link
                          to={`/invoice/${invoice.id}`}
                          className="p-2 text-gray-400 hover:text-cyan-400 transition-colors"
                          title="View Invoice"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <button
                          className="p-2 text-gray-400 hover:text-green-400 transition-colors"
                          title="Download PDF"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        {invoice.status !== 'paid' && (
                          <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg text-xs font-medium transition-colors">
                            Pay Now
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {filteredInvoices.length === 0 && (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">No invoices found</h3>
          <p className="text-gray-400 mb-6">
            {searchTerm || statusFilter !== 'all' 
              ? 'Try adjusting your search or filter criteria'
              : 'You don\'t have any invoices yet'
            }
          </p>
          <Link
            to="/client/services"
            className="bg-gradient-to-r from-cyan-500 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-cyan-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 inline-flex items-center space-x-2"
          >
            <FileText className="w-4 h-4" />
            <span>Purchase Service</span>
          </Link>
        </div>
      )}
    </div>
  );
};

export default InvoicesPage;