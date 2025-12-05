import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log('stripe-webhook called, method:', req.method);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeSecretKey) {
      console.error('Stripe is not configured');
      throw new Error('Stripe is not configured');
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
    });

    const body = await req.json();
    const { sessionId } = body;
    
    console.log('Request body:', JSON.stringify(body));
    
    if (!sessionId) {
      console.error('Session ID is required');
      throw new Error('Session ID is required');
    }

    console.log('Verifying payment for session:', sessionId);

    // Retrieve the checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    console.log('Session retrieved, payment_status:', session.payment_status);

    if (session.payment_status !== 'paid') {
      console.log('Payment not completed, status:', session.payment_status);
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Payment not completed',
          status: session.payment_status 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      );
    }

    // Get invoice details from metadata
    const invoiceId = session.metadata?.invoice_id;
    const invoiceNumber = session.metadata?.invoice_number;
    const amountPaid = session.amount_total ? session.amount_total / 100 : 0;

    console.log('Payment verified for invoice:', invoiceNumber, 'Amount:', amountPaid);

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get the receipt URL from payment intent
    let receiptUrl = null;
    if (session.payment_intent) {
      try {
        const paymentIntent = await stripe.paymentIntents.retrieve(session.payment_intent as string, {
          expand: ['latest_charge']
        });
        const charge = paymentIntent.latest_charge as Stripe.Charge;
        receiptUrl = charge?.receipt_url || null;
        console.log('Receipt URL retrieved:', receiptUrl);
      } catch (e) {
        console.log('Could not retrieve receipt URL:', e);
      }
    }

    // Update the financial transaction if it exists
    const { data: txData, error: updateError } = await supabase
      .from('financial_transactions')
      .update({
        status: 'paid',
        paid_date: new Date().toISOString(),
        payment_method: 'stripe',
        payment_reference: session.payment_intent as string,
      })
      .eq('transaction_number', invoiceNumber)
      .select();

    if (updateError) {
      console.log('Note: Could not update financial_transactions:', updateError.message);
    } else {
      console.log('Financial transaction updated:', txData);
    }

    // Update the invoices table with receipt URL and status
    const { data: invData, error: invoiceUpdateError } = await supabase
      .from('invoices')
      .update({
        status: 'paid',
        payment_status: 'paid',
        paid_date: new Date().toISOString(),
        document_path: receiptUrl,
      })
      .eq('invoice_number', invoiceNumber)
      .select();

    if (invoiceUpdateError) {
      console.log('Note: Could not update invoices:', invoiceUpdateError.message);
    } else {
      console.log('Invoice updated:', invData);
    }

    const responseData = { 
      success: true, 
      message: 'Payment verified successfully',
      invoiceId,
      invoiceNumber,
      amountPaid,
      paymentIntent: session.payment_intent,
      receiptUrl,
      customerEmail: session.customer_details?.email
    };
    
    console.log('Returning success response:', JSON.stringify(responseData));

    return new Response(
      JSON.stringify(responseData),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error: unknown) {
    console.error('Error verifying payment:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to verify payment';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    );
  }
});
