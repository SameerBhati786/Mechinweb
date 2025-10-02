import React, { useState, useEffect } from 'react';
import { 
  CreditCard,
  Shield,
  Calendar,
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

import { PaymentService } from '../../lib/payments';
import { RealtimeService } from '../../lib/realtime';
import { supabase } from '../../lib/supabase';

const PaymentsPage = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [orders, setOrders] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setIsVisible(true);
    initializePaymentData();
  }, []);

  const initializePaymentData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await loadPaymentData(user.id);
        
        // Set up real-time subscriptions
        const unsubscribeOrders = RealtimeService.subscribeToOrders(user.id, () => {
          loadPaymentData(user.id);
        });

        const unsubscribeInvoices = RealtimeService.subscribeToInvoices(user.id, () => {
          loadPaymentData(user.id);
        });

        const unsubscribePayments = RealtimeService.subscribeToPaymentStatus(user.id, (payload) => {
          if (payload.new.status === 'paid') {
            RealtimeService.showNotification(
              'Payment Received',
              'Your payment has been confirmed successfully.',
              'success'
            );
          }
        });

        // Cleanup on unmount
        return () => {
          unsubscribeOrders();
          unsubscribeInvoices();
          unsubscribePayments();
        };
      }
    } catch (error) {
      console.error('Error loading payment data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPaymentData = async (userId: string) => {
    try {
      const [ordersData, invoicesData] = await Promise.all([
        PaymentService.getUserOrders(),
        PaymentService.getUserInvoices()
      ]);
      setOrders(ordersData);
      setInvoices(invoicesData);
    } catch (error) {
      console.error('Error loading payment data:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'overdue':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'due-soon':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'completed':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'overdue':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'due-soon':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Payments & Billing</h1>
            <p className="text-gray-400 text-lg">View your orders and billing history</p>
          </div>
        </div>
      </div>

      {/* Pending Payments Alert */}
      {invoices.filter(inv => inv.status !== 'paid').length > 0 && (
        <div className={`bg-gradient-to-r from-red-500/10 to-orange-500/10 rounded-2xl p-6 border border-red-500/20 transition-all duration-1000 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="flex items-center space-x-3 mb-4">
            <AlertCircle className="w-6 h-6 text-red-400" />
            <h2 className="text-xl font-bold text-white">Pending Payments</h2>
          </div>
          <p className="text-gray-400 mb-4">You have {invoices.filter(inv => inv.status !== 'paid').length} pending payment(s) that require attention.</p>
          <div className="space-y-3">
            {invoices.filter(inv => inv.status !== 'paid').slice(0, 3).map((invoice) => (
              <div key={invoice.id} className="flex items-center justify-between p-4 bg-gray-800/50 rounded-xl">
                <div className="flex items-center space-x-4">
                  {getStatusIcon(invoice.status === 'overdue' ? 'overdue' : 'due-soon')}
                  <div>
                    <p className="text-white font-medium">{invoice.orders?.services?.name || 'Service'}</p>
                    <p className="text-gray-400 text-sm">{invoice.invoice_number} • Due: {new Date(invoice.due_date).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-white font-semibold">
                    {invoice.currency === 'USD' ? '$' : '₹'}{(invoice.total_amount || 0).toFixed(2)}
                  </p>
                  <a
                    href={`https://invoice.zoho.com/invoices/${invoice.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-1 rounded-lg text-sm font-medium transition-colors inline-block"
                  >
                    Pay Now
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Recent Orders */}
        <div className={`lg:col-span-2 transition-all duration-1000 delay-400 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
            <h2 className="text-xl font-bold text-white mb-6">Recent Orders</h2>
            
            <div className="space-y-4">
              {orders.slice(0, 5).map((order) => (
                <div key={order.id} className="flex items-center justify-between p-4 bg-gray-700/30 rounded-xl hover:bg-gray-700/50 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-8 rounded flex items-center justify-center bg-cyan-600 text-white text-xs font-bold">
                      ORD
                    </div>
                    <div>
                      <p className="text-white font-medium">{order.services?.name}</p>
                      <p className="text-gray-400 text-sm">{order.package_type} package</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs border ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-semibold">
                      {order.currency === 'USD' ? '$' : '₹'}{(order.currency === 'USD' ? order.amount_usd : order.amount_inr)?.toFixed(2)}
                    </p>
                    {order.zoho_invoice_id && (
                      <a
                        href={`https://invoice.zoho.com/invoices/${order.zoho_invoice_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1 rounded-lg text-sm font-medium transition-colors inline-block mt-1"
                      >
                        View Invoice
                      </a>
                    )}
                  </div>
                </div>
              ))}
              {orders.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-400">No orders found</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Payment Summary */}
        <div className={`space-y-6 transition-all duration-1000 delay-600 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          {/* Monthly Summary */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
            <h3 className="text-lg font-bold text-white mb-4">This Month</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Total Spent</span>
                <span className="text-2xl font-bold text-white">
                  ${orders.filter(o => o.status === 'completed').reduce((sum, o) => sum + (o.amount_usd || 0), 0)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Pending</span>
                <span className="text-yellow-400 font-semibold">
                  ${orders.filter(o => o.status === 'pending').reduce((sum, o) => sum + (o.amount_usd || 0), 0)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Next Payment</span>
                <span className="text-white font-medium">
                  {orders.find(o => o.status === 'pending') ? 'Pending' : 'None'}
                </span>
              </div>
            </div>
          </div>

          {/* Security Info */}
          <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-2xl p-6 border border-cyan-500/20">
            <div className="flex items-center space-x-3 mb-4">
              <Shield className="w-6 h-6 text-cyan-400" />
              <h3 className="text-lg font-bold text-white">Zoho Secure Billing</h3>
            </div>
            <p className="text-gray-400 text-sm mb-4">
              All payments are processed securely through Zoho Invoice/Books. We never store payment card information.
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-cyan-400" />
                <span className="text-gray-300">Zoho secure processing</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-cyan-400" />
                <span className="text-gray-300">No card data stored</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-cyan-400" />
                <span className="text-gray-300">Real-time payment updates</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Payments */}
      <div className={`transition-all duration-1000 delay-800 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
          <h2 className="text-xl font-bold text-white mb-6">Recent Invoices</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-3 text-gray-400 font-medium">Service</th>
                  <th className="text-left py-3 text-gray-400 font-medium">Date</th>
                  <th className="text-left py-3 text-gray-400 font-medium">Invoice</th>
                  <th className="text-left py-3 text-gray-400 font-medium">Amount</th>
                  <th className="text-left py-3 text-gray-400 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {invoices.slice(0, 5).map((invoice) => (
                  <tr key={invoice.id} className="border-b border-gray-700/50">
                    <td className="py-4">
                      <div>
                        <p className="text-white font-medium">{invoice.orders?.services?.name || 'Service'}</p>
                        <p className="text-gray-400 text-sm">{invoice.invoice_number}</p>
                      </div>
                    </td>
                    <td className="py-4 text-gray-300">{new Date(invoice.created_at).toLocaleDateString()}</td>
                    <td className="py-4">
                      <span className="text-cyan-400 text-sm">Zoho Invoice</span>
                    </td>
                    <td className="py-4 text-white font-semibold">
                      {invoice.currency === 'USD' ? '$' : '₹'}{(invoice.total_amount || 0).toFixed(2)}
                    </td>
                    <td className="py-4">
                      <span className={`px-3 py-1 rounded-full text-xs border ${getStatusColor(invoice.status)}`}>
                        {invoice.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {invoices.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-gray-400">
                      No invoices found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentsPage;