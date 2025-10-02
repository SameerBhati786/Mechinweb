// Enhanced Payment Service with comprehensive error handling and Zoho integration fixes
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
  transaction_id: string;
}

export interface PaymentError {
  code: string;
  message: string;
  details?: any;
  retryable: boolean;
}

export class EnhancedPaymentService {
  private static logger = ProductionLogger.getInstance();
  private static readonly MAX_RETRIES = 3;
  private static readonly RETRY_DELAY = 1000; // 1 second

  // Enhanced logging with structured data
  private static log(level: 'info' | 'error' | 'warn', message: string, data?: any) {
    this.logger.log(level, `EnhancedPaymentService: ${message}`, data);
  }

  // Comprehensive payment intent creation with retry logic
  static async createPaymentIntent(
    serviceIdentifier: string,
    packageType: string,
    totalPrice: number,
    currency: string,
    quantity: number = 1
  ): Promise<PaymentIntent> {
    const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    for (let attempt = 1; attempt <= this.MAX_RETRIES; attempt++) {
      try {
        this.log('info', `Payment intent creation attempt ${attempt}/${this.MAX_RETRIES}`, {
          transactionId,
          serviceIdentifier,
          packageType,
          totalPrice,
          currency,
          quantity,
          attempt
        });

        return await this.createPaymentIntentAttempt(
          serviceIdentifier,
          packageType,
          totalPrice,
          currency,
          quantity,
          transactionId
        );
      } catch (error) {
        this.log('error', `Payment intent attempt ${attempt} failed`, {
          transactionId,
          attempt,
          error: error.message,
          retryable: this.isRetryableError(error)
        });

        // If this is the last attempt or error is not retryable, throw
        if (attempt === this.MAX_RETRIES || !this.isRetryableError(error)) {
          await this.logPaymentFailure(transactionId, error.message);
          throw this.enhanceError(error, transactionId);
        }

        // Wait before retry with exponential backoff
        await this.delay(this.RETRY_DELAY * Math.pow(2, attempt - 1));
      }
    }

    throw new Error('Payment creation failed after all retries');
  }

  // Core payment intent creation logic
  private static async createPaymentIntentAttempt(
    serviceIdentifier: string,
    packageType: string,
    totalPrice: number,
    currency: string,
    quantity: number,
    transactionId: string
  ): Promise<PaymentIntent> {
    // Step 1: Validate user authentication
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new PaymentError('AUTH_REQUIRED', 'Authentication required. Please log in to continue.');
    }

    if (!user.email_confirmed_at) {
      throw new PaymentError('EMAIL_NOT_VERIFIED', 'Email verification required. Please verify your email before making purchases.');
    }

    this.log('info', 'User authentication validated', { 
      transactionId, 
      userId: user.id, 
      emailVerified: !!user.email_confirmed_at 
    });

    // Step 2: Resolve service with enhanced error handling
    const serviceId = await this.resolveServiceWithFallback(serviceIdentifier);
    if (!serviceId) {
      throw new PaymentError('SERVICE_NOT_FOUND', `Service not found: ${serviceIdentifier}. Please check the service ID and try again.`);
    }

    // Step 3: Get service data with validation
    const service = await ServiceManager.getServiceById(serviceId);
    if (!service) {
      throw new PaymentError('SERVICE_DATA_MISSING', `Service data not found for ID: ${serviceId}`);
    }

    // Validate package type
    if (!service.pricing || !service.pricing[packageType as keyof typeof service.pricing]) {
      throw new PaymentError('INVALID_PACKAGE', `Package type "${packageType}" not available for ${service.name}`);
    }

    // Step 4: Get client profile with validation
    const { data: clientProfile, error: clientError } = await supabase
      .from('clients')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (clientError) {
      throw new PaymentError('CLIENT_PROFILE_ERROR', 'Failed to load client profile. Please try again.');
    }

    if (!clientProfile) {
      throw new PaymentError('CLIENT_PROFILE_MISSING', 'Client profile not found. Please complete your profile setup.');
    }

    // Step 5: Calculate currency amounts
    const amounts = await this.calculateCurrencyAmounts(totalPrice, currency);

    // Step 6: Create order with enhanced error handling
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

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([orderData])
      .select()
      .single();

    if (orderError) {
      this.log('error', 'Order creation failed', { transactionId, orderError });
      throw new PaymentError('ORDER_CREATION_FAILED', `Failed to create order: ${orderError.message}`);
    }

    // Step 7: Create Zoho invoice with enhanced error handling
    const zohoResult = await this.createZohoInvoiceWithRetry(order, service, clientProfile, quantity, transactionId);

    // Step 8: Update order with Zoho details
    await supabase
      .from('orders')
      .update({
        zoho_invoice_id: zohoResult.invoice_id,
        zoho_customer_id: zohoResult.customer_id,
        updated_at: new Date().toISOString()
      })
      .eq('id', order.id);

    this.log('info', 'Payment intent created successfully', {
      transactionId,
      orderId: order.id,
      invoiceId: zohoResult.invoice_id
    });

    return {
      ...zohoResult,
      transaction_id: transactionId
    };
  }

  // Enhanced service resolution with multiple fallback strategies
  private static async resolveServiceWithFallback(serviceIdentifier: string): Promise<string | null> {
    try {
      // Strategy 1: Direct UUID validation
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (uuidRegex.test(serviceIdentifier)) {
        const { data } = await supabase
          .from('services')
          .select('id')
          .eq('id', serviceIdentifier)
          .maybeSingle();
        
        if (data) return serviceIdentifier;
      }

      // Strategy 2: Name-based resolution
      const { data: nameMatch } = await supabase
        .from('services')
        .select('id')
        .ilike('name', `%${serviceIdentifier}%`)
        .limit(1)
        .maybeSingle();
      
      if (nameMatch) return nameMatch.id;

      // Strategy 3: Category-based resolution
      const { data: categoryMatch } = await supabase
        .from('services')
        .select('id')
        .ilike('category', `%${serviceIdentifier}%`)
        .limit(1)
        .maybeSingle();
      
      if (categoryMatch) return categoryMatch.id;

      // Strategy 4: Fuzzy matching
      const { data: fuzzyMatch } = await supabase
        .from('services')
        .select('id, name')
        .limit(10);
      
      if (fuzzyMatch) {
        const match = fuzzyMatch.find(service => 
          service.name.toLowerCase().includes(serviceIdentifier.toLowerCase()) ||
          serviceIdentifier.toLowerCase().includes(service.name.toLowerCase())
        );
        
        if (match) return match.id;
      }

      return null;
    } catch (error) {
      this.log('error', 'Service resolution failed', { serviceIdentifier, error: error.message });
      return null;
    }
  }

  // Enhanced Zoho invoice creation with comprehensive error handling
  private static async createZohoInvoiceWithRetry(
    order: any,
    service: any,
    client: any,
    quantity: number,
    transactionId: string
  ): Promise<PaymentIntent> {
    for (let attempt = 1; attempt <= this.MAX_RETRIES; attempt++) {
      try {
        this.log('info', `Zoho invoice creation attempt ${attempt}`, {
          transactionId,
          orderId: order.id,
          attempt
        });

        return await this.createZohoInvoiceAttempt(order, service, client, quantity, transactionId);
      } catch (error) {
        this.log('error', `Zoho invoice attempt ${attempt} failed`, {
          transactionId,
          attempt,
          error: error.message
        });

        if (attempt === this.MAX_RETRIES) {
          throw error;
        }

        await this.delay(this.RETRY_DELAY * attempt);
      }
    }

    throw new Error('Zoho invoice creation failed after all retries');
  }

  // Core Zoho invoice creation
  private static async createZohoInvoiceAttempt(
    order: any,
    service: any,
    client: any,
    quantity: number,
    transactionId: string
  ): Promise<PaymentIntent> {
    // Check if Zoho integration is available
    const zohoHealthCheck = await this.checkZohoHealth();
    if (!zohoHealthCheck.healthy) {
      throw new PaymentError('ZOHO_UNAVAILABLE', `Zoho integration unavailable: ${zohoHealthCheck.error}`);
    }

    // Prepare customer data
    const customerData = {
      name: client.name,
      email: client.email,
      phone: client.phone || '',
      company: client.company || ''
    };

    // Calculate unit price
    const unitPrice = order.currency === 'USD' ? order.amount_usd : 
                    order.currency === 'INR' ? order.amount_inr : order.amount_aud;

    // Prepare service items
    const serviceItems = [{
      serviceId: service.id,
      serviceName: service.name,
      packageType: order.package_type,
      quantity: quantity,
      unitPrice: unitPrice / quantity,
      totalPrice: unitPrice,
      addOns: []
    }];

    // Call Zoho integration with enhanced error handling
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
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { error: errorText };
      }

      // Handle specific Zoho errors
      if (response.status === 500 && errorData.error?.includes('Missing Zoho configuration')) {
        throw new PaymentError('ZOHO_CONFIG_MISSING', 'Payment system configuration error. Please contact support.');
      }

      if (response.status === 401) {
        throw new PaymentError('ZOHO_AUTH_FAILED', 'Payment gateway authentication failed. Please try again.');
      }

      throw new PaymentError('ZOHO_API_ERROR', `Payment gateway error: ${errorData.error || errorText}`);
    }

    const result = await response.json();
    
    if (!result.success) {
      throw new PaymentError('ZOHO_INTEGRATION_FAILED', result.error || 'Zoho integration failed');
    }

    return {
      invoice_id: result.invoice.invoice_id,
      invoice_number: result.invoice.invoice_number,
      payment_url: result.invoice.payment_url,
      total: result.invoice.total,
      status: result.invoice.status,
      customer_id: result.customer.contact_id,
      transaction_id: transactionId
    };
  }

  // Check Zoho integration health
  private static async checkZohoHealth(): Promise<{ healthy: boolean; error?: string }> {
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/zoho-integration`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        return { healthy: false, error: `HTTP ${response.status}` };
      }

      const result = await response.json();
      return { healthy: result.success, error: result.error };
    } catch (error) {
      return { healthy: false, error: error.message };
    }
  }

  // Enhanced currency calculation with fallback rates
  private static async calculateCurrencyAmounts(amount: number, currency: string) {
    try {
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
      this.log('error', 'Currency conversion failed, using fallback rates', { error: error.message });
      
      // Fallback rates
      const rates = { USD: 1, INR: 83.25, AUD: 1.52 };
      let usd = amount;
      let inr = amount;
      let aud = amount;

      if (currency === 'USD') {
        inr = amount * rates.INR;
        aud = amount * rates.AUD;
      } else if (currency === 'INR') {
        usd = amount / rates.INR;
        aud = (amount / rates.INR) * rates.AUD;
      } else if (currency === 'AUD') {
        usd = amount / rates.AUD;
        inr = (amount / rates.AUD) * rates.INR;
      }

      return {
        usd: parseFloat(usd.toFixed(2)),
        inr: parseFloat(inr.toFixed(2)),
        aud: parseFloat(aud.toFixed(2))
      };
    }
  }

  // Error classification for retry logic
  private static isRetryableError(error: any): boolean {
    const retryableErrors = [
      'NETWORK_ERROR',
      'TIMEOUT',
      'ZOHO_TEMPORARY_ERROR',
      'DATABASE_TIMEOUT',
      'RATE_LIMIT'
    ];

    return retryableErrors.some(code => 
      error.code === code || 
      error.message?.includes('timeout') ||
      error.message?.includes('network') ||
      error.message?.includes('temporary')
    );
  }

  // Enhanced error with context
  private static enhanceError(error: any, transactionId: string): PaymentError {
    const enhancedError = new PaymentError(
      error.code || 'PAYMENT_ERROR',
      error.message || 'Payment creation failed',
      { transactionId, originalError: error },
      this.isRetryableError(error)
    );

    return enhancedError;
  }

  // Log payment failure for audit
  private static async logPaymentFailure(transactionId: string, errorMessage: string): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      await supabase
        .from('purchase_audit_log')
        .insert([{
          client_id: user?.id || null,
          action: 'payment_creation_failed',
          details: {
            transaction_id: transactionId,
            error_message: errorMessage,
            timestamp: new Date().toISOString(),
            user_agent: navigator.userAgent,
            url: window.location.href
          },
          success: false,
          error_message: errorMessage
        }]);
    } catch (logError) {
      console.error('Failed to log payment failure:', logError);
    }
  }

  // Utility delay function
  private static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Alternative payment method using direct database approach
  static async createDirectPayment(
    serviceId: string,
    packageType: string,
    amount: number,
    currency: string
  ): Promise<{ orderId: string; paymentUrl: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Authentication required');

      // Create order directly
      const { data: order, error } = await supabase
        .from('orders')
        .insert([{
          client_id: user.id,
          service_id: serviceId,
          package_type: packageType,
          amount_usd: currency === 'USD' ? amount : amount / 83.25, // Fallback conversion
          amount_inr: currency === 'INR' ? amount : amount * 83.25,
          amount_aud: currency === 'AUD' ? amount : amount * 1.52,
          currency: currency,
          status: 'pending',
          payment_gateway: 'direct'
        }])
        .select()
        .single();

      if (error) throw error;

      // Generate simple payment URL
      const paymentUrl = `mailto:contact@mechinweb.com?subject=Payment for Order ${order.id}&body=Please process payment for order ${order.id} - Amount: ${amount} ${currency}`;

      return {
        orderId: order.id,
        paymentUrl
      };
    } catch (error) {
      this.log('error', 'Direct payment creation failed', { error: error.message });
      throw error;
    }
  }

  // System health check
  static async performSystemHealthCheck(): Promise<{
    database: boolean;
    zoho: boolean;
    services: boolean;
    overall: boolean;
    issues: string[];
  }> {
    const issues: string[] = [];
    let database = false;
    let zoho = false;
    let services = false;

    // Test database
    try {
      const { error } = await supabase.from('services').select('count(*)').limit(1);
      database = !error;
      if (error) issues.push(`Database: ${error.message}`);
    } catch (error) {
      issues.push(`Database connection failed: ${error.message}`);
    }

    // Test Zoho
    try {
      const zohoHealth = await this.checkZohoHealth();
      zoho = zohoHealth.healthy;
      if (!zoho) issues.push(`Zoho: ${zohoHealth.error}`);
    } catch (error) {
      issues.push(`Zoho integration failed: ${error.message}`);
    }

    // Test services
    try {
      const servicesList = await ServiceManager.getAllServices();
      services = servicesList.length > 0;
      if (!services) issues.push('No services found in database');
    } catch (error) {
      issues.push(`Services loading failed: ${error.message}`);
    }

    const overall = database && services; // Zoho is optional for basic functionality

    return { database, zoho, services, overall, issues };
  }
}

// Custom PaymentError class
class PaymentError extends Error {
  constructor(
    public code: string,
    message: string,
    public details?: any,
    public retryable: boolean = false
  ) {
    super(message);
    this.name = 'PaymentError';
  }
}