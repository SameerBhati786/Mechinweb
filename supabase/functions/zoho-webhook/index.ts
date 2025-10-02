import { corsHeaders } from '../_shared/cors.ts';

interface ZohoWebhookPayload {
  event_type: string;
  data: {
    invoice_id: string;
    invoice_number: string;
    customer_id: string;
    total: number;
    status: string;
    payment_date?: string;
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const webhookData: ZohoWebhookPayload = await req.json();
    
    // Handle different webhook events
    switch (webhookData.event_type) {
      case 'invoice_payment_received':
        await handlePaymentReceived(webhookData.data);
        break;
      case 'invoice_created':
        await handleInvoiceCreated(webhookData.data);
        break;
      case 'invoice_status_changed':
        await handleInvoiceStatusChanged(webhookData.data);
        break;
      default:
        console.log('Unhandled webhook event:', webhookData.event_type);
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Webhook processed successfully' }),
      {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );

  } catch (error) {
    console.error('Webhook processing error:', error);
    
    return new Response(
      JSON.stringify({ success: false, error: 'Webhook processing failed' }),
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

async function handlePaymentReceived(data: any) {
  try {
    // Update order status to paid
    const { error: orderError } = await supabase
      .from('orders')
      .update({
        status: 'paid',
        updated_at: new Date().toISOString()
      })
      .eq('zoho_invoice_id', data.invoice_id);

    if (orderError) throw orderError;

    // Get order details for invoice creation
    const { data: order } = await supabase
      .from('orders')
      .select('*')
      .eq('zoho_invoice_id', data.invoice_id)
      .single();

    if (order) {
      // Create invoice record
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

      // Send notification to client
      await supabase
        .from('notifications')
        .insert([{
          client_id: order.client_id,
          title: 'Payment Confirmed',
          message: `Payment received for invoice ${data.invoice_number}. Your service will begin shortly.`,
          type: 'success',
          read: false
        }]);
    }

    console.log('Payment processed successfully for invoice:', data.invoice_id);
  } catch (error) {
    console.error('Error handling payment received:', error);
    throw error;
  }
}

async function handleInvoiceCreated(data: any) {
  try {
    console.log('Invoice created:', data.invoice_id);
    // Additional logic for invoice creation if needed
  } catch (error) {
    console.error('Error handling invoice created:', error);
  }
}

async function handleInvoiceStatusChanged(data: any) {
  try {
    // Update order status based on invoice status
    let orderStatus = 'pending';
    
    switch (data.status) {
      case 'paid':
        orderStatus = 'paid';
        break;
      case 'overdue':
        orderStatus = 'pending';
        break;
      case 'cancelled':
        orderStatus = 'cancelled';
        break;
    }

    await supabase
      .from('orders')
      .update({
        status: orderStatus,
        updated_at: new Date().toISOString()
      })
      .eq('zoho_invoice_id', data.invoice_id);

    console.log('Order status updated for invoice:', data.invoice_id);
  } catch (error) {
    console.error('Error handling invoice status change:', error);
  }
}