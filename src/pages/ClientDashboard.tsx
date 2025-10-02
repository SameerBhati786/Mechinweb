import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { ArrowLeft, User, Mail, Phone, Building, CreditCard, FileText, ShoppingCart, Calendar } from 'lucide-react';
import { supabase } from '../lib/supabase';

const ClientDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [clientData, setClientData] = useState({
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+1 (555) 123-4567',
    company: 'Tech Solutions Inc.'
  });

  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/client-login');
        return;
      }
      setUser(user);
      
      // Load user profile data
      const { data: profile } = await supabase
        .from('clients')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (profile) {
        setClientData({
          name: profile.name,
          email: profile.email,
          phone: profile.phone || '',
          company: profile.company || '',
        });
      }
    };

    checkAuth();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const services = [
    {
      id: 'email-migration',
      name: 'Email Migration & Setup',
      price: 299,
      description: 'Professional email migration with zero downtime'
    },
    {
      id: 'email-security',
      name: 'Domain & Email Security',
      price: 199,
      description: 'SPF, DKIM, DMARC setup and configuration'
    },
    {
      id: 'ssl-setup',
      name: 'SSL & HTTPS Setup',
      price: 149,
      description: 'SSL certificate installation and renewal'
    },
    {
      id: 'cloud-management',
      name: 'Cloud Suite Management',
      price: 399,
      description: 'Google Workspace & Microsoft 365 administration'
    }
  ];

  const orders = [
    {
      id: 'ORD-001',
      service: 'Email Migration & Setup',
      status: 'Completed',
      date: '2024-01-15',
      amount: 299
    },
    {
      id: 'ORD-002',
      service: 'SSL & HTTPS Setup',
      status: 'In Progress',
      date: '2024-01-20',
      amount: 149
    }
  ];

  const invoices = [
    {
      id: 'INV-001',
      service: 'Email Migration & Setup',
      status: 'Paid',
      date: '2024-01-15',
      amount: 299
    },
    {
      id: 'INV-002',
      service: 'SSL & HTTPS Setup',
      status: 'Pending',
      date: '2024-01-20',
      amount: 149
    }
  ];

  return (
    <div className="min-h-screen bg-gray-900 pt-20">
      {/* Back to Home */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link 
          to="/"
          className="inline-flex items-center space-x-2 text-cyan-400 hover:text-cyan-300 transition-colors duration-300"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back to Home</span>
        </Link>
      </div>

      {/* Dashboard Header */}
      <section className="py-8 bg-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">Client Dashboard</h1>
              <p className="text-gray-400 mt-2">Welcome back, {clientData.name}</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-400">Account Status</p>
                <span className="inline-block px-3 py-1 bg-green-500 text-white text-sm rounded-full">Active</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Dashboard Content */}
      <section className="py-12 bg-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-gray-900 rounded-2xl p-6 border border-gray-700">
                <nav className="space-y-2">
                  <button
                    onClick={() => setActiveTab('overview')}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-colors duration-300 ${
                      activeTab === 'overview' ? 'bg-cyan-500 text-white' : 'text-gray-300 hover:bg-gray-800'
                    }`}
                  >
                    Overview
                  </button>
                  <button
                    onClick={() => setActiveTab('services')}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-colors duration-300 ${
                      activeTab === 'services' ? 'bg-cyan-500 text-white' : 'text-gray-300 hover:bg-gray-800'
                    }`}
                  >
                    Buy Services
                  </button>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-colors duration-300 ${
                      activeTab === 'orders' ? 'bg-cyan-500 text-white' : 'text-gray-300 hover:bg-gray-800'
                    }`}
                  >
                    My Orders
                  </button>
                  <button
                    onClick={() => setActiveTab('invoices')}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-colors duration-300 ${
                      activeTab === 'invoices' ? 'bg-cyan-500 text-white' : 'text-gray-300 hover:bg-gray-800'
                    }`}
                  >
                    Invoices
                  </button>
                  <button
                    onClick={() => setActiveTab('profile')}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-colors duration-300 ${
                      activeTab === 'profile' ? 'bg-cyan-500 text-white' : 'text-gray-300 hover:bg-gray-800'
                    }`}
                  >
                    Profile
                  </button>
                </nav>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div className="space-y-8">
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="bg-gray-900 rounded-2xl p-6 border border-gray-700">
                      <div className="flex items-center space-x-4">
                        <div className="p-3 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg">
                          <ShoppingCart className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <p className="text-gray-400 text-sm">Total Orders</p>
                          <p className="text-2xl font-bold text-white">2</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gray-900 rounded-2xl p-6 border border-gray-700">
                      <div className="flex items-center space-x-4">
                        <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg">
                          <CreditCard className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <p className="text-gray-400 text-sm">Total Spent</p>
                          <p className="text-2xl font-bold text-white">$448</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gray-900 rounded-2xl p-6 border border-gray-700">
                      <div className="flex items-center space-x-4">
                        <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg">
                          <FileText className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <p className="text-gray-400 text-sm">Invoices</p>
                          <p className="text-2xl font-bold text-white">2</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-900 rounded-2xl p-6 border border-gray-700">
                    <h3 className="text-xl font-bold text-white mb-4">Recent Activity</h3>
                    <div className="space-y-4">
                      {orders.map((order) => (
                        <div key={order.id} className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-semibold text-white">{order.service}</p>
                            <p className="text-sm text-gray-400">{order.date}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-white">${order.amount}</p>
                            <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                              order.status === 'Completed' ? 'bg-green-500 text-white' : 'bg-yellow-500 text-black'
                            }`}>
                              {order.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Services Tab */}
              {activeTab === 'services' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-white">Available Services</h2>
                  <div className="grid md:grid-cols-2 gap-6">
                    {services.map((service) => (
                      <div key={service.id} className="bg-gray-900 rounded-2xl p-6 border border-gray-700">
                        <h3 className="text-xl font-bold text-white mb-2">{service.name}</h3>
                        <p className="text-gray-400 mb-4">{service.description}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-2xl font-bold text-cyan-400">${service.price}</span>
                          <Link
                            to={`/client/purchase/${service.id}`}
                            className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:from-cyan-600 hover:to-blue-700 transition-all duration-300"
                          >
                            Purchase
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Orders Tab */}
              {activeTab === 'orders' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-white">My Orders</h2>
                  <div className="bg-gray-900 rounded-2xl border border-gray-700 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-800">
                          <tr>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Order ID</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Service</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Date</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Amount</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                          {orders.map((order) => (
                            <tr key={order.id}>
                              <td className="px-6 py-4 text-sm text-white">{order.id}</td>
                              <td className="px-6 py-4 text-sm text-white">{order.service}</td>
                              <td className="px-6 py-4 text-sm text-gray-400">{order.date}</td>
                              <td className="px-6 py-4 text-sm text-white">${order.amount}</td>
                              <td className="px-6 py-4">
                                <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                                  order.status === 'Completed' ? 'bg-green-500 text-white' : 'bg-yellow-500 text-black'
                                }`}>
                                  {order.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* Invoices Tab */}
              {activeTab === 'invoices' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-white">Invoices</h2>
                  <div className="bg-gray-900 rounded-2xl border border-gray-700 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-800">
                          <tr>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Invoice ID</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Service</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Date</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Amount</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Status</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                          {invoices.map((invoice) => (
                            <tr key={invoice.id}>
                              <td className="px-6 py-4 text-sm text-white">{invoice.id}</td>
                              <td className="px-6 py-4 text-sm text-white">{invoice.service}</td>
                              <td className="px-6 py-4 text-sm text-gray-400">{invoice.date}</td>
                              <td className="px-6 py-4 text-sm text-white">${invoice.amount}</td>
                              <td className="px-6 py-4">
                                <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                                  invoice.status === 'Paid' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                                }`}>
                                  {invoice.status}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <Link
                                  to={`/client/invoice/${invoice.id}`}
                                  className="text-cyan-400 hover:text-cyan-300 text-sm font-semibold"
                                >
                                  View
                                </Link>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-white">Profile Settings</h2>
                  <div className="bg-gray-900 rounded-2xl p-6 border border-gray-700">
                    <form className="space-y-6">
                      {/* Profile Picture Section */}
                      <div className="flex items-center space-x-6">
                        <div className="relative">
                          <div className="w-20 h-20 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-full flex items-center justify-center">
                            <User className="w-10 h-10 text-white" />
                          </div>
                          <button className="absolute -bottom-2 -right-2 bg-cyan-500 hover:bg-cyan-600 text-white p-2 rounded-full transition-colors duration-300">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                          </button>
                        </div>
                        <div>
                          <h4 className="text-white font-semibold">Profile Picture</h4>
                          <p className="text-gray-400 text-sm">Upload a new profile picture</p>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                              type="text"
                              value={clientData.name}
                              className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                              type="email"
                              value={clientData.email}
                              className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
                            />
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">Phone</label>
                          <div className="relative">
                            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                              type="tel"
                              value={clientData.phone}
                              className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">Company</label>
                          <div className="relative">
                            <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                              type="text"
                              value={clientData.company}
                              className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Password Change Section */}
                      <div className="border-t border-gray-700 pt-6">
                        <h4 className="text-white font-semibold mb-4">Change Password</h4>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-gray-300 mb-2">Current Password</label>
                            <input type="password" className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-cyan-500 focus:outline-none" />
                          </div>
                          <div className="grid md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-gray-300 mb-2">New Password</label>
                              <input type="password" className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-cyan-500 focus:outline-none" />
                            </div>
                            <div>
                              <label className="block text-gray-300 mb-2">Confirm New Password</label>
                              <input type="password" className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-cyan-500 focus:outline-none" />
                            </div>
                          </div>
                          <button className="bg-cyan-500 hover:bg-cyan-600 text-white px-6 py-2 rounded-lg transition-colors duration-300">
                            Update Password
                          </button>
                        </div>
                      </div>

                      {/* Payment Methods Section */}
                      <div className="border-t border-gray-700 pt-6">
                        <h4 className="text-white font-semibold mb-4">Payment Methods</h4>
                        <div className="space-y-4">
                          {/* Existing Payment Methods */}
                          <div className="bg-gray-700 rounded-lg p-4 flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className="w-12 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded flex items-center justify-center">
                                <span className="text-white text-xs font-bold">VISA</span>
                              </div>
                              <div>
                                <p className="text-white font-medium">•••• •••• •••• 4242</p>
                                <p className="text-gray-400 text-sm">Expires 12/25</p>
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              <button className="text-cyan-400 hover:text-cyan-300 text-sm">Edit</button>
                              <button className="text-red-400 hover:text-red-300 text-sm">Remove</button>
                            </div>
                          </div>
                          
                          {/* Add New Payment Method */}
                          <button className="w-full border-2 border-dashed border-gray-600 hover:border-cyan-500 text-gray-400 hover:text-cyan-400 py-4 rounded-lg transition-colors duration-300 flex items-center justify-center space-x-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            <span>Add New Payment Method</span>
                          </button>
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-cyan-600 hover:to-blue-700 transition-all duration-300"
                      >
                        Save Changes
                      </button>
                    </form>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ClientDashboard;