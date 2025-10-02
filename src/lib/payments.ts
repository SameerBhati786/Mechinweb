// FIXED: Enhanced Payment service with production-ready error handling and comprehensive logging
import { supabase } from './supabase';
import { ServiceManager } from './services';
import { ProductionLogger } from './productionLogger';

export interface PaymentIntent {
  invoice_id: string;
  invoice_number: string;
  payment_url: string;
  total: number;
  status: string;
  customer_id: string;
  transaction_id: string; // NEW: Added for tracking
}

export interface OrderData {
  id: string;
  client_id: string;
  service_id: string;
  package_type: string;
  amount_usd: number;
  amount_inr: number;
  amount_aud: number;
  currency: string;
  status: string;
  zoho_invoice_id?: string;
  zoho_customer_id?: string;
  transaction_id?: string; // NEW: Added for tracking
}

export class PaymentService {
  private static logger = ProductionLogger.getInstance();

  // Enhanced logging for production debugging
  private static log(level: 'info' | 'error' | 'warn', message: string, data?: any) {
    this.logger.log(level, `PaymentService: ${message}`, data);
  }

  // FIXED: Create payment intent with comprehensive error handling and transaction tracking
  static async createPaymentIntent(
    serviceIdentifier: string,
    packageType: string,
    totalPrice: number,
    currency: string,
    quantity: number = 1
  ): Promise<PaymentIntent> {
    const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    try {
      this.log('info', 'Creating payment intent', {
        transactionId,
        serviceIdentifier,
        packageType,
        totalPrice,
        currency,
        quantity
      });

      // Step 1: Validate user authentication
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        this.log('error', 'User authentication failed', { transactionId, userError });
        throw new Error('Authentication required. Please log in to continue.');
      }

      // Verify email is confirmed
      if (!user.email_confirmed_at) {
        this.log('error', 'User email not verified', { transactionId, userId: user.id });
        throw new Error('Email verification required. Please verify your email before making purchases.');
      }

      this.log('info', 'User authenticated successfully', { 
        transactionId, 
        userId: user.id, 
        email: user.email,
        emailVerified: !!user.email_confirmed_at
      });

      // Step 2: Resolve service ID with enhanced validation
      const serviceId = await ServiceManager.resolveServiceId(serviceIdentifier);
      if (!serviceId) {
        this.log('error', 'Service resolution failed', { 
          transactionId, 
          serviceIdentifier,
          availableServices: await this.getAvailableServiceIds()
        });
        throw new Error(`Service not found: ${serviceIdentifier}. Please check the service ID and try again.`);
      }

      this.log('info', 'Service resolved successfully', { 
        transactionId,
        originalId: serviceIdentifier, 
        resolvedId: serviceId 
      });

      // Step 3: Get and validate service details
      const service = await ServiceManager.getServiceById(serviceId);
      if (!service) {
        this.log('error', 'Service data not found', { transactionId, serviceId });
        throw new Error(`Service data not found for ID: ${serviceId}`);
      }

      // Validate service has pricing for the requested package
      if (!service.pricing || !service.pricing[packageType as keyof typeof service.pricing]) {
        this.log('error', 'Invalid package type for service', { 
          transactionId, 
          serviceId, 
          packageType, 
          availablePackages: Object.keys(service.pricing || {})
        });
        throw new Error(`Package type "${packageType}" not available for ${service.name}`);
      }

      this.log('info', 'Service data validated', { 
        transactionId,
        serviceName: service.name, 
        category: service.category,
        packageType,
        packagePrice: service.pricing[packageType as keyof typeof service.pricing]
      });

      // Step 4: Get and validate client profile
      const { data: clientProfile, error: clientError } = await supabase
        .from('clients')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (clientError) {
        this.log('error', 'Client profile fetch failed', { transactionId, clientError });
        throw new Error('Failed to load client profile. Please try again.');
      }

      if (!clientProfile) {
        this.log('error', 'Client profile not found', { transactionId, userId: user.id });
        throw new Error('Client profile not found. Please complete your profile setup.');
      }

      this.log('info', 'Client profile loaded', { 
        transactionId,
        clientName: clientProfile.name, 
        clientEmail: clientProfile.email,
        emailVerified: clientProfile.email_verified
      });

      // Step 5: Calculate amounts for different currencies
      const amounts = await this.calculateCurrencyAmounts(totalPrice, currency);
      this.log('info', 'Currency amounts calculated', { transactionId, amounts });

      // Step 6: Create order in database with transaction tracking
      const orderData = {
        client_id: user.id,
        service_id: serviceId,
        package_type: packageType,
        amount_usd: amounts.usd,
        amount_inr: amounts.inr,
        amount_aud: amounts.aud,
        currency: currency,
        status: 'pending',
        payment_gateway: 'zoho'
      };

      this.log('info', 'Creating order in database', { transactionId, orderData });

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([orderData])
        .select()
        .single();

      if (orderError) {
        this.log('error', 'Order creation failed', { transactionId, orderError });
        throw new Error(`Failed to create order: ${orderError.message}`);
      }

      this.log('info', 'Order created successfully', { transactionId, orderId: order.id });

      // Step 7: Create Zoho customer and invoice with enhanced error handling
      const zohoResult = await this.createZohoInvoice(order, service, clientProfile, quantity, transactionId);
      this.log('info', 'Zoho invoice created successfully', { transactionId, zohoResult });

      // Step 8: Update order with Zoho details and transaction ID
      const { error: updateError } = await supabase
        .from('orders')
        .update({
          zoho_invoice_id: zohoResult.invoice_id,
          zoho_customer_id: zohoResult.customer_id,
          updated_at: new Date().toISOString()
        })
        .eq('id', order.id);

      if (updateError) {
        this.log('error', 'Order update failed', { transactionId, updateError });
        // Don't throw here as the order was created successfully
      }

      // Step 9: Log successful payment intent creation
      await this.logPaymentAttempt(transactionId, order.id, 'payment_intent_created', true);

      this.log('info', 'Payment intent created successfully', {
        transactionId,
        orderId: order.id,
        invoiceId: zohoResult.invoice_id,
        paymentUrl: zohoResult.payment_url
      });

      return {
        ...zohoResult,
        transaction_id: transactionId
      };
    } catch (error) {
      // Log failed payment attempt
      await this.logPaymentAttempt(transactionId, null, 'payment_intent_failed', false, error.message);
      
      this.log('error', 'Payment intent creation failed', {
        transactionId,
        serviceIdentifier,
        error: error.message,
        stack: error.stack
      });
      throw error;
    }
  }

  // FIXED: Enhanced Zoho invoice creation with better error handling
  private static async createZohoInvoice(
    order: any, 
    service: ServiceData, 
    client: any, 
    quantity: number,
    transactionId: string
  ): Promise<PaymentIntent> {
    try {
      this.log('info', 'Creating Zoho invoice', {
        transactionId,
        orderId: order.id,
        serviceName: service.name,
        clientEmail: client.email
      });

      // Prepare customer data for Zoho
      const customerData = {
        name: client.name,
        email: client.email,
        phone: client.phone || '',
        company: client.company || ''
      };

      // Calculate unit price based on currency
      const unitPrice = order.currency === 'USD' ? order.amount_usd : 
                      order.currency === 'INR' ? order.amount_inr : order.amount_aud;

      // Prepare service items for Zoho
      const serviceItems = [{
        serviceId: service.id,
        serviceName: service.name,
        packageType: order.package_type,
        quantity: quantity,
        unitPrice: unitPrice / quantity, // Ensure unit price is correct
        totalPrice: unitPrice,
        addOns: [] // Empty for now, can be extended later
      }];

      this.log('info', 'Zoho request data prepared', {
        transactionId,
        customerData: { ...customerData, phone: customerData.phone ? '[REDACTED]' : null },
        serviceItems: serviceItems.map(item => ({
          serviceName: item.serviceName,
          packageType: item.packageType,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice
        })),
        currency: order.currency
      });

      // Call Zoho integration function with enhanced error handling
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/zoho-integration`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          customerData,
          serviceItems,
          currency: order.currency,
          notes: `Order ID: ${order.id}\nTransaction ID: ${transactionId}\nService: ${service.name}\nPackage: ${order.package_type}\nQuantity: ${quantity}`
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        this.log('error', 'Zoho integration API error', {
          transactionId,
          status: response.status,
          statusText: response.statusText,
          error: errorText
        });
        throw new Error(`Zoho integration failed: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        this.log('error', 'Zoho integration returned error', { transactionId, result });
        throw new Error(result.error || 'Zoho integration failed');
      }

      this.log('info', 'Zoho invoice created successfully', {
        transactionId,
        invoiceId: result.invoice.invoice_id,
        customerId: result.customer.contact_id,
        paymentUrl: result.invoice.payment_url
      });

      return {
        invoice_id: result.invoice.invoice_id,
        invoice_number: result.invoice.invoice_number,
        payment_url: result.invoice.payment_url,
        total: result.invoice.total,
        status: result.invoice.status,
        customer_id: result.customer.contact_id,
        transaction_id: transactionId
      };
    } catch (error) {
      this.log('error', 'Zoho invoice creation failed', {
        transactionId,
        orderId: order.id,
        error: error.message,
        stack: error.stack
      });
      throw error;
    }
  }

  // NEW: Payment attempt logging for audit trail
  private static async logPaymentAttempt(
    transactionId: string,
    orderId: string | null,
    action: string,
    success: boolean,
    errorMessage?: string
  ): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      await supabase
        .from('purchase_audit_log')
        .insert([{
          client_id: user?.id || null,
          service_id: null, // Will be updated when we have the service ID
          action,
          details: {
            transaction_id: transactionId,
            order_id: orderId,
            timestamp: new Date().toISOString(),
            user_agent: navigator.userAgent,
            url: window.location.href
          },
          success,
          error_message: errorMessage || null
        }]);
    } catch (error) {
      console.error('Failed to log payment attempt:', error);
      // Don't throw - logging failure shouldn't break payment flow
    }
  }

  // NEW: Get available service IDs for debugging
  private static async getAvailableServiceIds(): Promise<string[]> {
    try {
      const { data } = await supabase
        .from('services')
        .select('id, name')
        .limit(10);
      
      return (data || []).map(service => `${service.id} (${service.name})`);
    } catch (error) {
      return ['Unable to fetch service IDs'];
    }
  }

  // Calculate amounts in different currencies with error handling
  private static async calculateCurrencyAmounts(amount: number, currency: string) {
    try {
      // Import currency utilities
      const { convertCurrency } = await import('../utils/currency');
      
      let usd = amount;
      let inr = amount;
      let aud = amount;

      if (currency === 'USD') {
        inr = await convertCurrency(amount, 'USD', 'INR');
        aud = await convertCurrency(amount, 'USD', 'AUD');
      } else if (currency === 'INR') {
        usd = await convertCurrency(amount, 'INR', 'USD');
        aud = await convertCurrency(amount, 'INR', 'AUD');
      } else if (currency === 'AUD') {
        usd = await convertCurrency(amount, 'AUD', 'USD');
        inr = await convertCurrency(amount, 'AUD', 'INR');
      }

      return {
        usd: parseFloat(usd.toFixed(2)),
        inr: parseFloat(inr.toFixed(2)),
        aud: parseFloat(aud.toFixed(2))
      };
    } catch (error) {
      this.log('error', 'Currency conversion failed', { error: error.message, amount, currency });
      // Fallback to original amount for all currencies
      return { usd: amount, inr: amount, aud: amount };
    }
  }

  // FIXED: Enhanced user orders retrieval
  static async getUserOrders(): Promise<OrderData[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          services (name, description, category)
        `)
        .eq('client_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        this.log('error', 'Error fetching user orders', { userId: user.id, error });
        throw error;
      }

      this.log('info', 'User orders retrieved successfully', { 
        userId: user.id, 
        ordersCount: data?.length || 0 
      });

      return data || [];
    } catch (error) {
      this.log('error', 'Error fetching user orders', { error: error.message });
      throw error;
    }
  }

  // FIXED: Enhanced user invoices retrieval
  static async getUserInvoices(): Promise<any[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('invoices')
        .select(`
          *,
          orders (
            services (name, description)
          )
        `)
        .eq('client_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        this.log('error', 'Error fetching user invoices', { userId: user.id, error });
        throw error;
      }

      this.log('info', 'User invoices retrieved successfully', { 
        userId: user.id, 
        invoicesCount: data?.length || 0 
      });

      return data || [];
    } catch (error) {
      this.log('error', 'Error fetching user invoices', { error: error.message });
      throw error;
    }
  }

  // FIXED: Enhanced payment system health check
  static async performHealthCheck(): Promise<{ healthy: boolean; issues: string[] }> {
    const issues: string[] = [];

    try {
      // Test service resolution
      try {
        // Get an actual service ID from the database for testing
        const { data: testService } = await supabase
          .from('services')
          .select('id')
          .limit(1)
          .single();
        
        if (testService) {
          const resolvedId = await ServiceManager.resolveServiceId(testService.id);
          if (!resolvedId) {
            issues.push('Service resolution system not working');
          }
        } else {
          issues.push('No services found in database for testing');
        }
      } catch (error) {
        issues.push(`Service resolution test failed: ${error.message}`);
      }

      // Test database connectivity
      const { error: dbError } = await supabase
        .from('orders')
        .select('id')
        .limit(1);
      
      if (dbError) {
        issues.push(`Database connectivity issue: ${dbError.message}`);
      }

      this.log('info', 'Payment system health check completed', {
        issuesCount: issues.length,
        issues
      });

    } catch (error) {
      issues.push(`Health check failed: ${error.message}`);
      this.log('error', 'Payment system health check failed', { error: error.message });
    }

    return {
      healthy: issues.length === 0,
      issues
    };
  }

  // Sync order status with Zoho
  static async syncOrderStatus(orderId: string): Promise<void> {
    try {
      this.log('info', 'Syncing order status with Zoho', { orderId });

      const { data: order } = await supabase
        .from('orders')
        .select('zoho_invoice_id')
        .eq('id', orderId)
        .single();

      if (order?.zoho_invoice_id) {
        // Call Zoho to get invoice status
        const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/zoho-integration/invoices/${order.zoho_invoice_id}`, {
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
          }
        });

        if (response.ok) {
          const invoiceData = await response.json();
          const newStatus = invoiceData.status === 'paid' ? 'paid' : 'pending';
          
          await supabase
            .from('orders')
            .update({
              status: newStatus,
              updated_at: new Date().toISOString()
            })
            .eq('id', orderId);

          this.log('info', 'Order status synced successfully', { orderId, newStatus });
        }
      }
    } catch (error) {
      this.log('error', 'Error syncing order status', { orderId, error: error.message });
    }
  }
}