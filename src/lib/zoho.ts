// Enhanced Zoho Invoice/Books integration with real-time updates
import { supabase } from './supabase';

export interface ZohoCustomer {
  contact_id: string;
  contact_name: string;
  company_name?: string;
  email: string;
  phone?: string;
}

export interface ZohoInvoice {
  invoice_id: string;
  invoice_number: string;
  customer_id: string;
  total: number;
  status: string;
  date: string;
  due_date: string;
  payment_url?: string;
}

export interface ZohoPayment {
  payment_id: string;
  invoice_id: string;
  amount: number;
  date: string;
  payment_mode: string;
}

export interface ZohoServiceItem {
  serviceId: string;
  serviceName: string;
  packageType: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  addOns: Array<{
    id: string;
    name: string;
    price: number;
  }>;
}

export class ZohoService {
  private static async callZohoFunction(endpoint: string, data?: any): Promise<any> {
    try {
      console.log('Calling Zoho function:', endpoint, data ? 'with data' : 'no data');
      
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/zoho-integration${endpoint}`, {
        method: data ? 'POST' : 'GET',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json'
        },
        body: data ? JSON.stringify(data) : undefined
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Zoho function error:', response.status, errorText);
        throw new Error(`Zoho API call failed: ${response.status} ${errorText}`);
      }

      const result = await response.json();
      console.log('Zoho function result:', result);
      return result;
    } catch (error) {
      console.error('Error calling Zoho function:', error);
      throw error;
    }
  }

  static async createCustomer(customerData: {
    name: string;
    email: string;
    phone?: string;
    company?: string;
  }): Promise<ZohoCustomer> {
    return await this.callZohoFunction('/customers', customerData);
  }

  static async createInvoice(invoiceData: {
    customerId: string;
    serviceItems: ZohoServiceItem[];
    currency: string;
    notes?: string;
  }): Promise<ZohoInvoice> {
    return await this.callZohoFunction('/invoices', invoiceData);
  }

  static async recordPayment(paymentData: {
    invoiceId: string;
    amount: number;
    paymentMode: string;
    reference?: string;
  }): Promise<ZohoPayment> {
    return await this.callZohoFunction('/payments', paymentData);
  }

  static async getInvoiceDetails(invoiceId: string): Promise<ZohoInvoice> {
    return await this.callZohoFunction(`/invoices/${invoiceId}`);
  }

  static async getInvoiceStatus(invoiceId: string): Promise<{ status: string; payment_date?: string }> {
    const invoice = await this.getInvoiceDetails(invoiceId);
    return {
      status: invoice.status,
      payment_date: invoice.status === 'paid' ? new Date().toISOString() : undefined
    };
  }

  static async getCustomerInvoices(customerId: string): Promise<ZohoInvoice[]> {
    return await this.callZohoFunction(`/customers/${customerId}/invoices`);
  }

  // Real-time integration methods
  static async syncOrderStatus(orderId: string): Promise<void> {
    try {
      const { data: order } = await supabase
        .from('orders')
        .select('zoho_invoice_id')
        .eq('id', orderId)
        .single();

      if (order?.zoho_invoice_id) {
        const invoiceStatus = await this.getInvoiceStatus(order.zoho_invoice_id);
        
        // Update order status in real-time
        await supabase
          .from('orders')
          .update({
            status: invoiceStatus.status === 'paid' ? 'paid' : 'pending',
            updated_at: new Date().toISOString()
          })
          .eq('id', orderId);
      }
    } catch (error) {
      console.error('Error syncing order status:', error);
    }
  }

  static async createInvoiceFromOrder(
    orderId: string,
    serviceItems: ZohoServiceItem[],
    currency: string
  ): Promise<ZohoInvoice> {
    try {
      console.log(`Creating Zoho invoice for order ${orderId} in ${currency}`);
      
      // Get order and client data
      const { data: order } = await supabase
        .from('orders')
        .select(`
          *,
          clients (name, email, phone, company)
        `)
        .eq('id', orderId)
        .single();

      if (!order) throw new Error('Order not found');

      // Create or get customer in Zoho
      const customer = await this.createCustomer({
        name: order.clients.name,
        email: order.clients.email,
        phone: order.clients.phone,
        company: order.clients.company
      });

      // Create invoice in Zoho
      const invoice = await this.createInvoice({
        customerId: customer.contact_id,
        serviceItems,
        currency,
        notes: `Order ID: ${orderId}\nCurrency: ${currency}\nService delivery within 24-48 hours`
      });

      console.log(`Zoho invoice created: ${invoice.invoice_id} for ${currency}`);
      
      // Update order with Zoho IDs
      await supabase
        .from('orders')
        .update({
          zoho_invoice_id: invoice.invoice_id,
          zoho_customer_id: customer.contact_id,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      return invoice;
    } catch (error) {
      console.error('Error creating invoice from order:', error);
      throw error;
    }
  }

  // Webhook handler for real-time updates from Zoho
  static async handleZohoWebhook(webhookData: any): Promise<void> {
    try {
      const { event_type, data } = webhookData;
      
      if (event_type === 'invoice_payment_received') {
        const invoiceId = data.invoice_id;
        
        // Update order status
        await supabase
          .from('orders')
          .update({
            status: 'paid',
            updated_at: new Date().toISOString()
          })
          .eq('zoho_invoice_id', invoiceId);

        // Create invoice record
        const { data: order } = await supabase
          .from('orders')
          .select('*')
          .eq('zoho_invoice_id', invoiceId)
          .single();

        if (order) {
          await supabase
            .from('invoices')
            .insert([{
              order_id: order.id,
              client_id: order.client_id,
              invoice_number: data.invoice_number,
              amount_usd: order.amount_usd,
              amount_inr: order.amount_inr,
              currency: order.currency,
              total_amount: data.total,
              status: 'paid',
              due_date: new Date().toISOString()
            }]);
        }
      }
    } catch (error) {
      console.error('Error handling Zoho webhook:', error);
    }
  }
}