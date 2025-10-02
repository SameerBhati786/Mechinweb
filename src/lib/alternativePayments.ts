// Alternative payment methods when Zoho is unavailable
import { supabase } from './supabase';

export interface AlternativePaymentMethod {
  id: string;
  name: string;
  description: string;
  available: boolean;
  handler: (orderData: any) => Promise<string>;
}

export class AlternativePaymentService {
  
  // Email-based payment method
  static async createEmailPayment(orderData: {
    serviceId: string;
    serviceName: string;
    packageType: string;
    amount: number;
    currency: string;
    clientEmail: string;
    clientName: string;
  }): Promise<string> {
    try {
      // Create order in database
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Authentication required');

      const { data: order, error } = await supabase
        .from('orders')
        .insert([{
          client_id: user.id,
          service_id: orderData.serviceId,
          package_type: orderData.packageType,
          amount_usd: orderData.currency === 'USD' ? orderData.amount : orderData.amount / 83.25,
          amount_inr: orderData.currency === 'INR' ? orderData.amount : orderData.amount * 83.25,
          amount_aud: orderData.currency === 'AUD' ? orderData.amount : orderData.amount * 1.52,
          currency: orderData.currency,
          status: 'pending',
          payment_gateway: 'email'
        }])
        .select()
        .single();

      if (error) throw error;

      // Generate email payment URL
      const subject = encodeURIComponent(`Payment for ${orderData.serviceName} - Order ${order.id}`);
      const body = encodeURIComponent(`
Dear Mechinweb Team,

I would like to proceed with payment for my order:

Order ID: ${order.id}
Service: ${orderData.serviceName}
Package: ${orderData.packageType}
Amount: ${orderData.amount} ${orderData.currency}
Client: ${orderData.clientName}
Email: ${orderData.clientEmail}

Please send me payment instructions.

Best regards,
${orderData.clientName}
      `);

      return `mailto:contact@mechinweb.com?subject=${subject}&body=${body}`;
    } catch (error) {
      console.error('Email payment creation failed:', error);
      throw error;
    }
  }

  // Bank transfer payment method
  static async createBankTransferPayment(orderData: any): Promise<string> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Authentication required');

      const { data: order, error } = await supabase
        .from('orders')
        .insert([{
          client_id: user.id,
          service_id: orderData.serviceId,
          package_type: orderData.packageType,
          amount_usd: orderData.currency === 'USD' ? orderData.amount : orderData.amount / 83.25,
          amount_inr: orderData.currency === 'INR' ? orderData.amount : orderData.amount * 83.25,
          amount_aud: orderData.currency === 'AUD' ? orderData.amount : orderData.amount * 1.52,
          currency: orderData.currency,
          status: 'pending',
          payment_gateway: 'bank_transfer'
        }])
        .select()
        .single();

      if (error) throw error;

      // Redirect to bank transfer instructions page
      return `/payment/bank-transfer?order_id=${order.id}`;
    } catch (error) {
      console.error('Bank transfer payment creation failed:', error);
      throw error;
    }
  }

  // Get available payment methods based on system status
  static async getAvailablePaymentMethods(): Promise<AlternativePaymentMethod[]> {
    const methods: AlternativePaymentMethod[] = [
      {
        id: 'zoho',
        name: 'Zoho Invoice',
        description: 'Secure online payment via Zoho',
        available: false,
        handler: async () => { throw new Error('Zoho unavailable'); }
      },
      {
        id: 'email',
        name: 'Email Payment Request',
        description: 'Request payment instructions via email',
        available: true,
        handler: this.createEmailPayment
      },
      {
        id: 'bank_transfer',
        name: 'Bank Transfer',
        description: 'Direct bank transfer with instructions',
        available: true,
        handler: this.createBankTransferPayment
      }
    ];

    // Test Zoho availability
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/zoho-integration`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        methods[0].available = result.success;
      }
    } catch (error) {
      console.log('Zoho integration test failed, using alternatives');
    }

    return methods;
  }

  // Create payment with fallback methods
  static async createPaymentWithFallback(orderData: any): Promise<string> {
    const methods = await this.getAvailablePaymentMethods();
    
    // Try Zoho first
    const zohoMethod = methods.find(m => m.id === 'zoho' && m.available);
    if (zohoMethod) {
      try {
        return await zohoMethod.handler(orderData);
      } catch (error) {
        console.log('Zoho payment failed, trying alternatives...');
      }
    }

    // Fallback to email payment
    const emailMethod = methods.find(m => m.id === 'email');
    if (emailMethod) {
      return await emailMethod.handler(orderData);
    }

    throw new Error('No payment methods available');
  }
}