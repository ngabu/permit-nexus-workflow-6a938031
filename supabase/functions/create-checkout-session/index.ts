import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface InvoiceItem {
  quantity: number;
  itemCode: string;
  description: string;
  unitPrice: number;
  disc: number;
  totalPrice: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeSecretKey) {
      throw new Error('Stripe is not configured');
    }

    const { 
      invoiceId, 
      invoiceNumber,
      invoiceDate,
      currency,
      clientName,
      clientAddress,
      items,
      subtotal,
      freight,
      gst,
      totalInc,
      paidToDate,
      balanceDue,
      successUrl,
      cancelUrl 
    } = await req.json();

    console.log('Creating checkout session for invoice:', invoiceNumber, 'balance due:', balanceDue);

    if (!invoiceId || !balanceDue || !successUrl || !cancelUrl) {
      throw new Error('Missing required fields');
    }

    // Stripe supports limited currencies - default to USD if currency not supported
    const stripeCurrency = (currency || 'usd').toLowerCase();

    // Build form params with multiple line items
    const params = new URLSearchParams();
    params.append('payment_method_types[0]', 'card');
    params.append('mode', 'payment');
    params.append('success_url', `${successUrl}?session_id={CHECKOUT_SESSION_ID}&invoice_id=${invoiceId}&invoice_number=${invoiceNumber}`);
    params.append('cancel_url', `${cancelUrl}?invoice_id=${invoiceId}`);
    
    // Metadata
    params.append('metadata[invoice_id]', invoiceId);
    params.append('metadata[invoice_number]', invoiceNumber || '');
    params.append('metadata[client_name]', clientName || '');
    params.append('metadata[invoice_date]', invoiceDate || '');

    let lineIndex = 0;

    // Add each invoice item as a separate line item
    if (items && Array.isArray(items) && items.length > 0) {
      for (const item of items as InvoiceItem[]) {
        const itemAmount = Math.round(item.totalPrice * 100); // Convert to cents
        if (itemAmount > 0) {
          params.append(`line_items[${lineIndex}][price_data][currency]`, stripeCurrency);
          params.append(`line_items[${lineIndex}][price_data][product_data][name]`, item.description);
          params.append(`line_items[${lineIndex}][price_data][product_data][description]`, `Item Code: ${item.itemCode} | Unit Price: K${item.unitPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}`);
          params.append(`line_items[${lineIndex}][price_data][unit_amount]`, itemAmount.toString());
          params.append(`line_items[${lineIndex}][quantity]`, item.quantity.toString());
          lineIndex++;
        }
      }
    }

    // Add freight as a line item if applicable
    if (freight && freight > 0) {
      const freightAmount = Math.round(freight * 100);
      params.append(`line_items[${lineIndex}][price_data][currency]`, stripeCurrency);
      params.append(`line_items[${lineIndex}][price_data][product_data][name]`, 'Freight');
      params.append(`line_items[${lineIndex}][price_data][product_data][description]`, 'Shipping and handling charges');
      params.append(`line_items[${lineIndex}][price_data][unit_amount]`, freightAmount.toString());
      params.append(`line_items[${lineIndex}][quantity]`, '1');
      lineIndex++;
    }

    // Add GST as a line item if applicable
    if (gst && gst > 0) {
      const gstAmount = Math.round(gst * 100);
      params.append(`line_items[${lineIndex}][price_data][currency]`, stripeCurrency);
      params.append(`line_items[${lineIndex}][price_data][product_data][name]`, 'GST (10%)');
      params.append(`line_items[${lineIndex}][price_data][product_data][description]`, 'Goods and Services Tax');
      params.append(`line_items[${lineIndex}][price_data][unit_amount]`, gstAmount.toString());
      params.append(`line_items[${lineIndex}][quantity]`, '1');
      lineIndex++;
    }

    // If there's already paid amount, add a discount/credit line item
    if (paidToDate && paidToDate > 0) {
      // We'll handle this via a coupon or just note in the description
      // For now, the balanceDue should already reflect this
    }

    // Fallback: if no line items were added, create a single summary line item
    if (lineIndex === 0) {
      const amountInCents = Math.round(balanceDue * 100);
      params.append(`line_items[0][price_data][currency]`, stripeCurrency);
      params.append(`line_items[0][price_data][product_data][name]`, `Invoice ${invoiceNumber}`);
      params.append(`line_items[0][price_data][product_data][description]`, `Payment for CEPA Invoice ${invoiceNumber} - ${clientName || 'Customer'}`);
      params.append(`line_items[0][price_data][unit_amount]`, amountInCents.toString());
      params.append(`line_items[0][quantity]`, '1');
    }

    // Add custom text with invoice details
    if (clientName) {
      params.append('payment_intent_data[description]', `Invoice ${invoiceNumber} - ${clientName}`);
      params.append('custom_text[submit][message]', `Invoice #${invoiceNumber}\nClient: ${clientName}${clientAddress ? `\n${clientAddress}` : ''}\nBalance Due: K${balanceDue.toLocaleString('en-US', { minimumFractionDigits: 2 })}`);
    }

    // Use native fetch instead of Stripe SDK
    const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${stripeSecretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params,
    });

    const session = await response.json();

    if (!response.ok) {
      console.error('Stripe error:', session);
      throw new Error(session.error?.message || 'Failed to create checkout session');
    }

    console.log('Checkout session created:', session.id, 'with', lineIndex, 'line items');

    return new Response(
      JSON.stringify({ sessionId: session.id, url: session.url }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error: unknown) {
    console.error('Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to create checkout session';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
});
