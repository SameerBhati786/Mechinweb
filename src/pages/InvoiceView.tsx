import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Download, Printer, Mail } from 'lucide-react';

const InvoiceView = () => {
  const { invoiceId } = useParams();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from('invoices')
          .select(`
            *,
            orders (
              *,
              services (
                name,
                description,
                category
              )
            ),
            clients (
              name,
              email,
              company
            )
          `)
          .eq('id', invoiceId)
          .eq('client_id', user.id)
          .single();

        if (error) throw error;
        setInvoice(data);
      } catch (error) {
        console.error('Error fetching invoice:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInvoice();
  }, [invoiceId]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // In real app, generate PDF
    alert('PDF download functionality would be implemented here');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
          <h1 className="text-2xl font-bold text-white mb-4">Loading Invoice...</h1>
        </div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="min-h-screen bg-gray-900 pt-20 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Invoice Not Found</h1>
          <p className="text-gray-400 mb-8">The requested invoice could not be found.</p>
          <Link 
            to="/client/dashboard"
            className="inline-flex items-center space-x-2 px-6 py-3 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors"
          >
            <span>Back to Dashboard</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 pt-20">
      {/* Back to Dashboard */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 print:hidden">
        <div className="flex items-center justify-between">
          <Link 
            to="/client/dashboard"
            className="inline-flex items-center space-x-2 text-cyan-400 hover:text-cyan-300 transition-colors duration-300"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Dashboard</span>
          </Link>
          
          <div className="flex space-x-4">
            <button
              onClick={handlePrint}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors duration-300"
            >
              <Printer className="h-4 w-4" />
              <span>Print</span>
            </button>
            <button
              onClick={handleDownload}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors duration-300"
            >
              <Download className="h-4 w-4" />
              <span>Download PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* Invoice */}
      <section className="py-12 bg-gray-800 print:bg-white print:py-0">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-2xl print:shadow-none print:rounded-none">
              {/* Invoice Header */}
              <div className="p-8 border-b border-gray-200">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">Mechinweb</h1>
                    <p className="text-gray-600">IT Solutions & Cloud Services</p>
                  </div>
                  <div className="text-right">
                    <h2 className="text-2xl font-bold text-gray-900">INVOICE</h2>
                    <p className="text-gray-600">{invoice.invoice_number}</p>
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">From:</h3>
                    <div className="text-gray-600">
                      <p>Mechinweb</p>
                      <p>contact@mechinweb.com</p>
                      <p>+1 (555) 123-4567</p>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Bill To:</h3>
                    <div className="text-gray-600">
                      <p className="font-semibold">{invoice.clients?.name}</p>
                      {invoice.clients?.company && <p>{invoice.clients?.company}</p>}
                      <p>{invoice.clients?.email}</p>
                    </div>
                  </div>
                </div>
                
                <div className="grid md:grid-cols-3 gap-8 mt-8">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-1">Invoice Date:</h3>
                    <p className="text-gray-600">{new Date(invoice.created_at).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-1">Due Date:</h3>
                    <p className="text-gray-600">{new Date(invoice.due_date).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-1">Status:</h3>
                    <span className={`inline-block px-3 py-1 text-sm rounded-full ${
                      invoice.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {invoice.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Invoice Items */}
              <div className="p-8">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-4 text-sm font-semibold text-gray-900">Service</th>
                      <th className="text-center py-4 text-sm font-semibold text-gray-900">Qty</th>
                      <th className="text-right py-4 text-sm font-semibold text-gray-900">Price</th>
                      <th className="text-right py-4 text-sm font-semibold text-gray-900">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-100">
                      <td className="py-4">
                        <div>
                          <p className="font-semibold text-gray-900">{invoice.orders?.services?.name}</p>
                          <p className="text-sm text-gray-600">{invoice.orders?.services?.description}</p>
                          <p className="text-sm text-gray-500">{invoice.orders?.package_type} Package</p>
                        </div>
                      </td>
                      <td className="text-center py-4 text-gray-600">1</td>
                      <td className="text-right py-4 text-gray-600">
                        {invoice.currency === 'USD' ? '$' : '₹'}{(invoice.currency === 'USD' ? invoice.amount_usd : invoice.amount_inr)?.toFixed(2)}
                      </td>
                      <td className="text-right py-4 text-gray-900 font-semibold">
                        {invoice.currency === 'USD' ? '$' : '₹'}{(invoice.currency === 'USD' ? invoice.amount_usd : invoice.amount_inr)?.toFixed(2)}
                      </td>
                    </tr>
                  </tbody>
                </table>
                
                {/* Totals */}
                <div className="mt-8 flex justify-end">
                  <div className="w-64">
                    <div className="flex justify-between py-2">
                      <span className="text-gray-600">Subtotal:</span>
                      <span className="text-gray-900">
                        {invoice.currency === 'USD' ? '$' : '₹'}{(invoice.currency === 'USD' ? invoice.amount_usd : invoice.amount_inr)?.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-gray-600">Tax:</span>
                      <span className="text-gray-900">
                        {invoice.currency === 'USD' ? '$' : '₹'}{(invoice.tax_amount || 0).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-t border-gray-200 font-bold text-lg">
                      <span className="text-gray-900">Total:</span>
                      <span className="text-gray-900">
                        {invoice.currency === 'USD' ? '$' : '₹'}{(invoice.total_amount || 0).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Payment Info */}
                <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">Payment Information:</h3>
                  <p className="text-sm text-gray-600">Payment Method: Zoho Invoice</p>
                  <p className="text-sm text-gray-600">Status: {invoice.status}</p>
                </div>
                
                {/* Notes */}
                <div className="mt-8">
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">Notes:</h3>
                  <p className="text-sm text-gray-600">Thank you for choosing Mechinweb for your IT services.</p>
                </div>
              </div>
              
              {/* Footer */}
              <div className="p-8 border-t border-gray-200 bg-gray-50">
                <div className="text-center text-sm text-gray-600">
                  <p>Thank you for choosing Mechinweb for your IT services!</p>
                  <p className="mt-2">For questions about this invoice, contact us at contact@mechinweb.com</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default InvoiceView;