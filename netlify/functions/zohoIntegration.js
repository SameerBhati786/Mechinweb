const axios = require('axios');

// Enhanced logging function
const log = (level, message, data = null) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${level.toUpperCase()}: ${message}`, data || '');
};

// Zoho configuration
const ZOHO_CONFIG = {
  clientId: process.env.ZOHO_CLIENT_ID,
  clientSecret: process.env.ZOHO_CLIENT_SECRET,
  refreshToken: process.env.ZOHO_REFRESH_TOKEN,
  organizationId: process.env.ZOHO_ORGANIZATION_ID,
  baseUrl: 'https://invoice.zoho.in/api/v3'
};

// Validate Zoho configuration
const validateZohoConfig = () => {
  const missing = [];
  if (!ZOHO_CONFIG.clientId) missing.push('ZOHO_CLIENT_ID');
  if (!ZOHO_CONFIG.clientSecret) missing.push('ZOHO_CLIENT_SECRET');
  if (!ZOHO_CONFIG.refreshToken) missing.push('ZOHO_REFRESH_TOKEN');
  if (!ZOHO_CONFIG.organizationId) missing.push('ZOHO_ORGANIZATION_ID');

  if (missing.length > 0) {
    throw new Error(`Missing Zoho configuration: ${missing.join(', ')}`);
  }

  log('info', 'Zoho configuration validated', {
    hasClientId: !!ZOHO_CONFIG.clientId,
    hasClientSecret: !!ZOHO_CONFIG.clientSecret,
    hasRefreshToken: !!ZOHO_CONFIG.refreshToken,
    hasOrgId: !!ZOHO_CONFIG.organizationId,
    clientIdLength: ZOHO_CONFIG.clientId?.length,
    orgId: ZOHO_CONFIG.organizationId
  });
};

// Get Zoho access token with enhanced error handling
const getZohoAccessToken = async () => {
  try {
    log('info', 'Requesting Zoho access token...');
    
    const tokenParams = {
      refresh_token: ZOHO_CONFIG.refreshToken,
      client_id: ZOHO_CONFIG.clientId,
      client_secret: ZOHO_CONFIG.clientSecret,
      grant_type: 'refresh_token'
    };

    log('info', 'Token request params prepared', {
      grant_type: 'refresh_token',
      client_id: ZOHO_CONFIG.clientId,
      hasRefreshToken: !!ZOHO_CONFIG.refreshToken,
      hasClientSecret: !!ZOHO_CONFIG.clientSecret
    });

    const response = await axios.post(
      'https://accounts.zoho.in/oauth/v2/token',
      new URLSearchParams(tokenParams).toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        timeout: 15000
      }
    );

    log('info', 'Token response received', {
      status: response.status,
      hasAccessToken: !!response.data.access_token,
      tokenType: response.data.token_type,
      expiresIn: response.data.expires_in,
      scope: response.data.scope
    });

    if (!response.data.access_token) {
      throw new Error('No access token received from Zoho');
    }

    return response.data.access_token;
  } catch (error) {
    log('error', 'Failed to get Zoho access token', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message
    });

    if (error.response?.status === 400) {
      throw new Error('Invalid Zoho credentials. Please check your ZOHO_CLIENT_ID, ZOHO_CLIENT_SECRET, and ZOHO_REFRESH_TOKEN.');
    } else if (error.response?.status === 401) {
      throw new Error('Zoho refresh token expired. Please regenerate your refresh token.');
    }

    throw new Error(`Zoho token request failed: ${error.message}`);
  }
};

// Test Zoho API connection with simpler approach
const testZohoConnection = async (accessToken) => {
  try {
    log('info', 'Testing Zoho API connection with direct contact list...');
    
    // Skip organization validation and go directly to contacts API
    // This is more reliable as some Zoho accounts don't have access to organizations endpoint
    const contactsResponse = await axios.get(
      `${ZOHO_CONFIG.baseUrl}/contacts`,
      {
        headers: {
          'Authorization': `Zoho-oauthtoken ${accessToken}`,
          'X-com-zoho-invoice-organizationid': ZOHO_CONFIG.organizationId,
          'Content-Type': 'application/json'
        },
        params: {
          per_page: 1
        },
        timeout: 15000
      }
    );

    log('info', 'Contacts API test successful', {
      status: contactsResponse.status,
      contactsCount: contactsResponse.data.contacts?.length || 0,
      organizationId: ZOHO_CONFIG.organizationId
    });

    return true;
  } catch (error) {
    log('error', 'Zoho API connection test failed', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message,
      url: error.config?.url,
      organizationId: ZOHO_CONFIG.organizationId
    });

    // Provide specific error messages based on the error code
    if (error.response?.status === 401) {
      const errorCode = error.response?.data?.code;
      if (errorCode === 57) {
        throw new Error(`Zoho API Error 57: Organization ID ${ZOHO_CONFIG.organizationId} is invalid or you don't have access to it. Please verify your ZOHO_ORGANIZATION_ID in Netlify environment variables.`);
      } else {
        throw new Error('Zoho API authorization failed. Please check your refresh token and API permissions.');
      }
    }

    throw error;
  }
};

// Create Zoho customer with enhanced error handling
const createZohoCustomer = async (accessToken, customerData) => {
  try {
    log('info', 'Creating Zoho customer', { email: customerData.email });
    
    const customerPayload = {
      contact_name: customerData.name,
      company_name: customerData.company || '',
      email: customerData.email,
      phone: customerData.phone || ''
    };

    log('info', 'Customer payload prepared', customerPayload);

    const response = await axios.post(
      `${ZOHO_CONFIG.baseUrl}/contacts`,
      customerPayload,
      {
        headers: {
          'Authorization': `Zoho-oauthtoken ${accessToken}`,
          'X-com-zoho-invoice-organizationid': ZOHO_CONFIG.organizationId,
          'Content-Type': 'application/json'
        },
        timeout: 15000
      }
    );

    const customer = response.data.contact;
    log('info', 'Zoho customer created successfully', {
      contactId: customer.contact_id,
      contactName: customer.contact_name,
      email: customer.email
    });

    return {
      contact_id: customer.contact_id,
      contact_name: customer.contact_name,
      email: customer.email,
      company_name: customer.company_name
    };
  } catch (error) {
    log('error', 'Failed to create Zoho customer', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });

    // If customer already exists, try to find them
    if (error.response?.status === 400 && error.response?.data?.message?.includes('already exists')) {
      log('info', 'Customer already exists, searching for existing customer...');
      return await findZohoCustomer(accessToken, customerData.email);
    }

    throw new Error(`Customer creation failed: ${error.response?.data?.message || error.message}`);
  }
};

// Find existing Zoho customer
const findZohoCustomer = async (accessToken, email) => {
  try {
    log('info', 'Searching for existing Zoho customer', { email });
    
    const response = await axios.get(
      `${ZOHO_CONFIG.baseUrl}/contacts`,
      {
        headers: {
          'Authorization': `Zoho-oauthtoken ${accessToken}`,
          'X-com-zoho-invoice-organizationid': ZOHO_CONFIG.organizationId,
          'Content-Type': 'application/json'
        },
        params: {
          email: email
        },
        timeout: 15000
      }
    );

    if (response.data.contacts && response.data.contacts.length > 0) {
      const customer = response.data.contacts[0];
      log('info', 'Found existing Zoho customer', { 
        contactId: customer.contact_id,
        contactName: customer.contact_name 
      });
      return {
        contact_id: customer.contact_id,
        contact_name: customer.contact_name,
        email: customer.email,
        company_name: customer.company_name
      };
    }
    
    throw new Error('Customer not found');
  } catch (error) {
    log('error', 'Failed to find Zoho customer', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    throw new Error(`Customer lookup failed: ${error.message}`);
  }
};

// Create Zoho invoice
const createZohoInvoice = async (accessToken, customerId, invoiceData) => {
  try {
    log('info', 'Creating Zoho invoice', { customerId, currency: invoiceData.currency });
    
    const lineItems = invoiceData.serviceItems.map(item => ({
      name: item.serviceName,
      description: `${item.serviceName} - ${item.packageType} Package (Quantity: ${item.quantity})`,
      rate: item.unitPrice,
      quantity: item.quantity,
      item_total: item.totalPrice
    }));

    const invoicePayload = {
      customer_id: customerId,
      invoice_number: `INV-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      line_items: lineItems,
      notes: invoiceData.notes || 'Thank you for choosing Mechinweb!',
      terms: 'Payment due within 30 days.',
      currency_code: invoiceData.currency || 'USD'
    };

    log('info', 'Invoice payload prepared', {
      invoiceNumber: invoicePayload.invoice_number,
      lineItemsCount: lineItems.length,
      currency: invoicePayload.currency_code,
      customerId: customerId
    });

    const response = await axios.post(
      `${ZOHO_CONFIG.baseUrl}/invoices`,
      invoicePayload,
      {
        headers: {
          'Authorization': `Zoho-oauthtoken ${accessToken}`,
          'X-com-zoho-invoice-organizationid': ZOHO_CONFIG.organizationId,
          'Content-Type': 'application/json'
        },
        timeout: 20000
      }
    );

    const invoice = response.data.invoice;
    log('info', 'Zoho invoice created successfully', {
      invoiceId: invoice.invoice_id,
      invoiceNumber: invoice.invoice_number,
      total: invoice.total,
      status: invoice.status
    });

    return {
      invoice_id: invoice.invoice_id,
      invoice_number: invoice.invoice_number,
      payment_url: `https://invoice.zoho.in/invoices/${invoice.invoice_id}/payment`,
      total: invoice.total,
      status: invoice.status,
      customer_id: customerId
    };
  } catch (error) {
    log('error', 'Failed to create Zoho invoice', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    throw new Error(`Invoice creation failed: ${error.response?.data?.message || error.message}`);
  }
};

// Get invoice status
const getZohoInvoiceStatus = async (accessToken, invoiceId) => {
  try {
    log('info', 'Getting Zoho invoice status', { invoiceId });
    
    const response = await axios.get(
      `${ZOHO_CONFIG.baseUrl}/invoices/${invoiceId}`,
      {
        headers: {
          'Authorization': `Zoho-oauthtoken ${accessToken}`,
          'X-com-zoho-invoice-organizationid': ZOHO_CONFIG.organizationId,
          'Content-Type': 'application/json'
        },
        timeout: 15000
      }
    );

    const invoice = response.data.invoice;
    log('info', 'Invoice status retrieved', {
      invoiceId,
      status: invoice.status,
      total: invoice.total
    });

    return {
      status: invoice.status,
      total: invoice.total,
      payment_date: invoice.last_payment_date
    };
  } catch (error) {
    log('error', 'Failed to get invoice status', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    throw new Error(`Invoice status check failed: ${error.message}`);
  }
};

// Main handler function
exports.handler = async (event, context) => {
  const requestId = context.awsRequestId || Date.now().toString();
  
  log('info', 'Zoho integration function invoked', {
    requestId,
    method: event.httpMethod,
    path: event.path
  });

  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
      },
      body: ''
    };
  }

  try {
    // Validate Zoho configuration
    validateZohoConfig();

    // Get access token
    const accessToken = await getZohoAccessToken();
    log('info', 'Access token obtained successfully');
    
    // For GET requests, just test the connection and return success
    if (event.httpMethod === 'GET') {
      log('info', 'GET request - testing connection only');
      
      // Test with a simple contacts API call instead of organizations
      try {
        await testZohoConnection(accessToken);
        
        return {
          statusCode: 200,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            success: true,
            message: 'Zoho integration is working correctly',
            timestamp: new Date().toISOString(),
            requestId,
            config: {
              hasClientId: !!ZOHO_CONFIG.clientId,
              hasClientSecret: !!ZOHO_CONFIG.clientSecret,
              hasRefreshToken: !!ZOHO_CONFIG.refreshToken,
              hasOrgId: !!ZOHO_CONFIG.organizationId,
              organizationId: ZOHO_CONFIG.organizationId,
              apiConnectionSuccessful: true
            }
          })
        };
      } catch (testError) {
        // If connection test fails, still return the configuration status
        log('warning', 'Connection test failed but credentials are valid', testError);
        
        return {
          statusCode: 200,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            success: false,
            message: 'Zoho credentials are valid but API access failed',
            error: testError.message,
            timestamp: new Date().toISOString(),
            requestId,
            config: {
              hasClientId: !!ZOHO_CONFIG.clientId,
              hasClientSecret: !!ZOHO_CONFIG.clientSecret,
              hasRefreshToken: !!ZOHO_CONFIG.refreshToken,
              hasOrgId: !!ZOHO_CONFIG.organizationId,
              organizationId: ZOHO_CONFIG.organizationId,
              tokenObtained: true,
              apiConnectionFailed: true
            }
          })
        };
      }
    }

    // Parse request for POST requests
    let requestData = {};
    if (event.httpMethod === 'POST' && event.body) {
      try {
        requestData = JSON.parse(event.body);
        log('info', 'Request data parsed successfully', {
          hasCustomerData: !!requestData.customerData,
          hasServiceItems: !!requestData.serviceItems,
          currency: requestData.currency,
          customerEmail: requestData.customerData?.email
        });
      } catch (parseError) {
        log('error', 'Failed to parse request body', parseError);
        throw new Error('Invalid JSON in request body');
      }
    }

    // Handle POST requests for customer and invoice creation
    if (event.httpMethod === 'POST') {
      // Handle customer creation and invoice creation
      if (requestData.customerData && requestData.serviceItems) {
        log('info', 'Processing customer creation and invoice generation');
        
        // Validate required data
        if (!requestData.customerData.email || !requestData.customerData.name) {
          throw new Error('Customer email and name are required');
        }
        
        if (!requestData.serviceItems.length) {
          throw new Error('At least one service item is required');
        }
        
        // Create or find customer
        const customer = await createZohoCustomer(accessToken, requestData.customerData);
        log('info', 'Customer processed successfully', { contactId: customer.contact_id });
        
        // Create invoice
        const invoice = await createZohoInvoice(accessToken, customer.contact_id, {
          serviceItems: requestData.serviceItems,
          currency: requestData.currency || 'USD',
          notes: requestData.notes
        });
        
        log('info', 'Invoice created successfully', { 
          invoiceId: invoice.invoice_id,
          paymentUrl: invoice.payment_url 
        });

        return {
          statusCode: 200,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            success: true,
            customer,
            invoice,
            requestId,
            timestamp: new Date().toISOString()
          })
        };
      }
      
      // Handle customer creation only
      else if (requestData.name && requestData.email) {
        log('info', 'Processing customer creation only');
        const customer = await createZohoCustomer(accessToken, requestData);
        return {
          statusCode: 200,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            success: true,
            customer,
            requestId
          })
        };
      }
      
      else {
        log('error', 'Invalid request data structure', { 
          hasCustomerData: !!requestData.customerData,
          hasServiceItems: !!requestData.serviceItems,
          hasName: !!requestData.name,
          hasEmail: !!requestData.email
        });
        throw new Error('Invalid request data. Expected customerData and serviceItems or customer details.');
      }
    }

    // Invalid method
    return {
      statusCode: 405,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        success: false,
        error: 'Method not allowed',
        requestId
      })
    };

  } catch (error) {
    log('error', 'Zoho integration function error', {
      requestId,
      error: error.message,
      stack: error.stack
    });
    
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        success: false,
        error: error.message,
        requestId,
        timestamp: new Date().toISOString(),
        debug: {
          hasClientId: !!ZOHO_CONFIG.clientId,
          hasClientSecret: !!ZOHO_CONFIG.clientSecret,
          hasRefreshToken: !!ZOHO_CONFIG.refreshToken,
          hasOrgId: !!ZOHO_CONFIG.organizationId,
          organizationId: ZOHO_CONFIG.organizationId
        }
      })
    };
  }
};