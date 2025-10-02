import { corsHeaders } from '../_shared/cors.ts';

interface ZohoConfig {
  clientId: string;
  clientSecret: string;
  refreshToken: string;
  organizationId: string;
}

interface CustomerData {
  name: string;
  email: string;
  phone?: string;
  company?: string;
}

interface ServiceItem {
  serviceId: string;
  serviceName: string;
  packageType: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface InvoiceRequest {
  customerData: CustomerData;
  serviceItems: ServiceItem[];
  currency: string;
  notes?: string;
}

// Enhanced logging function
const log = (level: string, message: string, data?: any) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ZohoIntegration ${level.toUpperCase()}: ${message}`, data ? JSON.stringify(data, null, 2) : '');
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  const requestId = crypto.randomUUID();
  log('info', 'Zoho integration request received', { 
    requestId, 
    method: req.method, 
    url: req.url 
  });

  try {
    // Validate Zoho configuration
    const zohoConfig: ZohoConfig = {
      clientId: Deno.env.get('ZOHO_CLIENT_ID') || '',
      clientSecret: Deno.env.get('ZOHO_CLIENT_SECRET') || '',
      refreshToken: Deno.env.get('ZOHO_REFRESH_TOKEN') || '',
      organizationId: Deno.env.get('ZOHO_ORGANIZATION_ID') || ''
    };

    log('info', 'Zoho configuration check', {
      requestId,
      hasClientId: !!zohoConfig.clientId,
      hasClientSecret: !!zohoConfig.clientSecret,
      hasRefreshToken: !!zohoConfig.refreshToken,
      hasOrgId: !!zohoConfig.organizationId,
      clientIdLength: zohoConfig.clientId.length,
      orgId: zohoConfig.organizationId
    });

    // Check for missing credentials
    const missing = [];
    if (!zohoConfig.clientId) missing.push('ZOHO_CLIENT_ID');
    if (!zohoConfig.clientSecret) missing.push('ZOHO_CLIENT_SECRET');
    if (!zohoConfig.refreshToken) missing.push('ZOHO_REFRESH_TOKEN');
    if (!zohoConfig.organizationId) missing.push('ZOHO_ORGANIZATION_ID');

    if (missing.length > 0) {
      log('error', 'Missing Zoho credentials', { requestId, missing });
      throw new Error(`Missing Zoho configuration: ${missing.join(', ')}`);
    }

    // Get access token
    const accessToken = await getZohoAccessToken(zohoConfig, requestId);
    log('info', 'Access token obtained', { requestId });

    // Handle different request types
    if (req.method === 'GET') {
      // Test connection
      await testZohoConnection(accessToken, zohoConfig, requestId);
      
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Zoho integration is working correctly',
          timestamp: new Date().toISOString(),
          requestId
        }),
        {
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        }
      );
    }

    if (req.method === 'POST') {
      const requestData: InvoiceRequest = await req.json();
      log('info', 'Processing invoice creation request', { 
        requestId, 
        customerEmail: requestData.customerData?.email,
        serviceItemsCount: requestData.serviceItems?.length,
        currency: requestData.currency
      });

      // Validate request data
      if (!requestData.customerData || !requestData.serviceItems || !requestData.currency) {
        throw new Error('Missing required data: customerData, serviceItems, and currency are required');
      }

      // Create customer
      const customer = await createZohoCustomer(accessToken, zohoConfig, requestData.customerData, requestId);
      log('info', 'Customer processed', { requestId, customerId: customer.contact_id });

      // Create invoice
      const invoice = await createZohoInvoice(accessToken, zohoConfig, customer.contact_id, requestData, requestId);
      log('info', 'Invoice created', { requestId, invoiceId: invoice.invoice_id });

      return new Response(
        JSON.stringify({
          success: true,
          customer,
          invoice,
          requestId,
          timestamp: new Date().toISOString()
        }),
        {
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        }
      );
    }

    throw new Error('Method not allowed');

  } catch (error) {
    log('error', 'Zoho integration error', {
      requestId,
      error: error.message,
      stack: error.stack
    });

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        requestId,
        timestamp: new Date().toISOString(),
        debug: {
          hasZohoClientId: !!Deno.env.get('ZOHO_CLIENT_ID'),
          hasZohoClientSecret: !!Deno.env.get('ZOHO_CLIENT_SECRET'),
          hasZohoRefreshToken: !!Deno.env.get('ZOHO_REFRESH_TOKEN'),
          hasZohoOrgId: !!Deno.env.get('ZOHO_ORGANIZATION_ID'),
          organizationId: Deno.env.get('ZOHO_ORGANIZATION_ID')
        }
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  }
});

async function getZohoAccessToken(config: ZohoConfig, requestId: string): Promise<string> {
  try {
    log('info', 'Requesting Zoho access token', { requestId });
    
    const tokenParams = new URLSearchParams({
      refresh_token: config.refreshToken,
      client_id: config.clientId,
      client_secret: config.clientSecret,
      grant_type: 'refresh_token'
    });

    const response = await fetch('https://accounts.zoho.in/oauth/v2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: tokenParams.toString()
    });

    if (!response.ok) {
      const errorText = await response.text();
      log('error', 'Token request failed', { 
        requestId, 
        status: response.status, 
        error: errorText 
      });
      throw new Error(`Token request failed: ${response.status} ${errorText}`);
    }

    const tokenData = await response.json();
    
    if (!tokenData.access_token) {
      log('error', 'No access token in response', { requestId, tokenData });
      throw new Error('No access token received');
    }

    log('info', 'Access token obtained successfully', { 
      requestId, 
      tokenType: tokenData.token_type,
      expiresIn: tokenData.expires_in 
    });
    
    return tokenData.access_token;
  } catch (error) {
    log('error', 'Failed to get access token', { requestId, error: error.message });
    throw error;
  }
}

async function testZohoConnection(accessToken: string, config: ZohoConfig, requestId: string): Promise<void> {
  try {
    log('info', 'Testing Zoho API connection', { requestId });
    
    const response = await fetch('https://invoice.zoho.in/api/v3/contacts?per_page=1', {
      headers: {
        'Authorization': `Zoho-oauthtoken ${accessToken}`,
        'X-com-zoho-invoice-organizationid': config.organizationId,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      log('error', 'Zoho API test failed', { 
        requestId, 
        status: response.status, 
        error: errorText 
      });
      throw new Error(`Zoho API test failed: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    log('info', 'Zoho API connection successful', { 
      requestId, 
      contactsCount: data.contacts?.length || 0 
    });
  } catch (error) {
    log('error', 'Zoho connection test failed', { requestId, error: error.message });
    throw error;
  }
}

async function createZohoCustomer(
  accessToken: string, 
  config: ZohoConfig, 
  customerData: CustomerData, 
  requestId: string
): Promise<any> {
  try {
    log('info', 'Creating Zoho customer', { 
      requestId, 
      email: customerData.email,
      name: customerData.name 
    });

    const customerPayload = {
      contact_name: customerData.name,
      company_name: customerData.company || '',
      email: customerData.email,
      phone: customerData.phone || ''
    };

    const response = await fetch('https://invoice.zoho.in/api/v3/contacts', {
      method: 'POST',
      headers: {
        'Authorization': `Zoho-oauthtoken ${accessToken}`,
        'X-com-zoho-invoice-organizationid': config.organizationId,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(customerPayload)
    });

    if (!response.ok) {
      // If customer already exists, try to find them
      if (response.status === 400) {
        log('info', 'Customer might already exist, searching', { requestId, email: customerData.email });
        return await findZohoCustomer(accessToken, config, customerData.email, requestId);
      }
      
      const errorText = await response.text();
      log('error', 'Customer creation failed', { 
        requestId, 
        status: response.status, 
        error: errorText 
      });
      throw new Error(`Customer creation failed: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    const customer = data.contact;
    
    log('info', 'Customer created successfully', { 
      requestId, 
      customerId: customer.contact_id,
      customerName: customer.contact_name 
    });

    return customer;
  } catch (error) {
    log('error', 'Error in createZohoCustomer', { requestId, error: error.message });
    throw error;
  }
}

async function findZohoCustomer(
  accessToken: string, 
  config: ZohoConfig, 
  email: string, 
  requestId: string
): Promise<any> {
  try {
    log('info', 'Searching for existing customer', { requestId, email });
    
    const response = await fetch(`https://invoice.zoho.in/api/v3/contacts?email=${encodeURIComponent(email)}`, {
      headers: {
        'Authorization': `Zoho-oauthtoken ${accessToken}`,
        'X-com-zoho-invoice-organizationid': config.organizationId,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      log('error', 'Customer search failed', { requestId, status: response.status, error: errorText });
      throw new Error(`Customer search failed: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    
    if (!data.contacts || data.contacts.length === 0) {
      log('error', 'Customer not found', { requestId, email });
      throw new Error('Customer not found');
    }

    const customer = data.contacts[0];
    log('info', 'Existing customer found', { 
      requestId, 
      customerId: customer.contact_id,
      customerName: customer.contact_name 
    });

    return customer;
  } catch (error) {
    log('error', 'Error in findZohoCustomer', { requestId, error: error.message });
    throw error;
  }
}

async function createZohoInvoice(
  accessToken: string, 
  config: ZohoConfig, 
  customerId: string, 
  invoiceData: InvoiceRequest, 
  requestId: string
): Promise<any> {
  try {
    log('info', 'Creating Zoho invoice', { 
      requestId, 
      customerId, 
      currency: invoiceData.currency,
      itemsCount: invoiceData.serviceItems.length 
    });

    const lineItems = invoiceData.serviceItems.map(item => ({
      name: item.serviceName,
      description: `${item.serviceName} - ${item.packageType} Package (Quantity: ${item.quantity})`,
      rate: item.unitPrice,
      quantity: item.quantity,
      item_total: item.totalPrice
    }));

    const invoicePayload = {
      customer_id: customerId,
      invoice_number: `MW-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      line_items: lineItems,
      notes: invoiceData.notes || 'Thank you for choosing Mechinweb!',
      terms: 'Payment due within 30 days. Service delivery begins upon payment confirmation.',
      currency_code: invoiceData.currency
    };

    log('info', 'Invoice payload prepared', { 
      requestId, 
      invoiceNumber: invoicePayload.invoice_number,
      lineItemsCount: lineItems.length,
      currency: invoicePayload.currency_code 
    });

    const response = await fetch('https://invoice.zoho.in/api/v3/invoices', {
      method: 'POST',
      headers: {
        'Authorization': `Zoho-oauthtoken ${accessToken}`,
        'X-com-zoho-invoice-organizationid': config.organizationId,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(invoicePayload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      log('error', 'Invoice creation failed', { 
        requestId, 
        status: response.status, 
        error: errorText,
        payload: invoicePayload 
      });
      throw new Error(`Invoice creation failed: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    const invoice = data.invoice;

    if (!invoice) {
      log('error', 'No invoice in response', { requestId, responseData: data });
      throw new Error('No invoice data in response');
    }

    log('info', 'Invoice created successfully', { 
      requestId, 
      invoiceId: invoice.invoice_id,
      invoiceNumber: invoice.invoice_number,
      total: invoice.total,
      status: invoice.status 
    });

    // Return invoice with payment URL
    return {
      invoice_id: invoice.invoice_id,
      invoice_number: invoice.invoice_number,
      payment_url: `https://invoice.zoho.in/invoices/${invoice.invoice_id}/payment`,
      total: invoice.total,
      status: invoice.status,
      customer_id: customerId
    };
  } catch (error) {
    log('error', 'Error in createZohoInvoice', { 
      requestId, 
      customerId, 
      error: error.message,
      stack: error.stack 
    });
    throw error;
  }
}