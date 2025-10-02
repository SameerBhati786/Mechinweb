// Zoho Webhook Handler for real-time payment updates
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY
);

// Enhanced logging
const log = (level, message, data = null) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${level.toUpperCase()}: ${message}`, data || '');
};

// Send notification email
const sendNotificationEmail = async (emailData) => {
  try {
    // Call the sendEmail function
    const response = await fetch(`${process.env.URL}/.netlify/functions/sendEmail`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        type: 'payment_confirmation',
        data: emailData
      })
    });

    if (!response.ok) {
      throw new Error(`Email service responded with ${response.status}`);
    }

    log('info', 'Notification email sent successfully');
  } catch (error) {
    log('error', 'Failed to send notification email', error);
    // Don't throw - webhook should still succeed even if email fails
  }
};

// Handle payment received webhook
const handlePaymentReceived = async (webhookData) => {
  try {
    const { invoice_id, invoice_number, total, payment_date } = webhookData.data;
    
    log('info', 'Processing payment received webhook', {
      invoiceId: invoice_id,
      invoiceNumber: invoice_number,
      total
    });

    // Update order status to paid
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .update({
        status: 'paid',
        updated_at: new Date().toISOString()
      })
      .eq('zoho_invoice_id', invoice_id)
      .select('*, clients(*), services(*)')
      .single();

    if (orderError) {
      log('error', 'Failed to update order status', orderError);
      throw orderError;
    }

    if (!order) {
      log('warning', 'No order found for invoice', { invoiceId: invoice_id });
      return;
    }

    log('info', 'Order status updated to paid', { orderId: order.id });

    // Create invoice record
    const { error: invoiceError } = await supabase
      .from('invoices')
      .insert([{
        order_id: order.id,
        client_id: order.client_id,
        invoice_number: invoice_number,
        amount_usd: order.amount_usd,
        amount_inr: order.amount_inr,
        amount_aud: order.amount_aud,
        currency: order.currency,
        total_amount: total,
        status: 'paid',
        due_date: new Date().toISOString()
      }]);

    if (invoiceError) {
      log('error', 'Failed to create invoice record', invoiceError);
    } else {
      log('info', 'Invoice record created successfully');
    }

    // Send notification to client
    const { error: notificationError } = await supabase
      .from('notifications')
      .insert([{
        client_id: order.client_id,
        title: 'Payment Confirmed',
        message: `Payment received for ${order.services?.name}. Your service will begin shortly.`,
        type: 'success',
        read: false
      }]);

    if (notificationError) {
      log('error', 'Failed to create notification', notificationError);
    }

    // Send confirmation email
    if (order.clients) {
      await sendNotificationEmail({
        clientName: order.clients.name,
        clientEmail: order.clients.email,
        serviceName: order.services?.name || 'Service',
        packageType: order.package_type,
        orderId: order.id,
        amount: total
      });
    }

    log('info', 'Payment webhook processed successfully');
  } catch (error) {
    log('error', 'Error processing payment webhook', error);
    throw error;
  }
};

// Handle invoice status change
const handleInvoiceStatusChange = async (webhookData) => {
  try {
    const { invoice_id, status } = webhookData.data;
    
    log('info', 'Processing invoice status change', {
      invoiceId: invoice_id,
      newStatus: status
    });

    // Map Zoho status to our order status
    let orderStatus = 'pending';
    switch (status) {
      case 'paid':
        orderStatus = 'paid';
        break;
      case 'overdue':
        orderStatus = 'pending';
        break;
      case 'cancelled':
        orderStatus = 'cancelled';
        break;
      case 'sent':
        orderStatus = 'pending';
        break;
    }

    // Update order status
    const { error } = await supabase
      .from('orders')
      .update({
        status: orderStatus,
        updated_at: new Date().toISOString()
      })
      .eq('zoho_invoice_id', invoice_id);

    if (error) {
      log('error', 'Failed to update order status', error);
      throw error;
    }

    log('info', 'Order status updated successfully', {
      invoiceId: invoice_id,
      orderStatus
    });
  } catch (error) {
    log('error', 'Error processing status change webhook', error);
    throw error;
  }
};

// Main webhook handler
exports.handler = async (event, context) => {
  const requestId = context.awsRequestId || Date.now().toString();
  
  log('info', 'Zoho webhook received', {
    requestId,
    method: event.httpMethod,
    headers: event.headers
  });

  // Handle CORS
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Zoho-Webhook-Signature',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // Parse webhook data
    const webhookData = JSON.parse(event.body || '{}');
    
    log('info', 'Webhook data parsed', {
      eventType: webhookData.event_type,
      invoiceId: webhookData.data?.invoice_id
    });

    // Validate webhook data
    if (!webhookData.event_type || !webhookData.data) {
      throw new Error('Invalid webhook data structure');
    }

    // Route webhook events
    switch (webhookData.event_type) {
      case 'invoice_payment_received':
        await handlePaymentReceived(webhookData);
        break;
      case 'invoice_status_changed':
        await handleInvoiceStatusChange(webhookData);
        break;
      case 'invoice_created':
        log('info', 'Invoice created webhook received', webhookData.data);
        // Handle if needed
        break;
      default:
        log('warning', 'Unhandled webhook event', { eventType: webhookData.event_type });
    }

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        success: true,
        message: 'Webhook processed successfully',
        requestId,
        eventType: webhookData.event_type
      })
    };

  } catch (error) {
    log('error', 'Webhook processing error', {
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
        timestamp: new Date().toISOString()
      })
    };
  }
};