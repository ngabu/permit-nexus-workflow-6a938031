import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { create, getNumericDate } from "https://deno.land/x/djwt@v3.0.1/mod.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Convert PKCS#1 RSA private key to CryptoKey
async function importRSAPrivateKey(pemKey: string): Promise<CryptoKey> {
  const formattedKey = pemKey.replace(/\\n/g, '\n').trim();
  const isPKCS1 = formattedKey.includes('BEGIN RSA PRIVATE KEY');
  
  let keyData: ArrayBuffer;
  
  if (isPKCS1) {
    const pemContents = formattedKey
      .replace('-----BEGIN RSA PRIVATE KEY-----', '')
      .replace('-----END RSA PRIVATE KEY-----', '')
      .replace(/\s/g, '');
    
    const binaryString = atob(pemContents);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    const pkcs8Header = new Uint8Array([
      0x30, 0x82, 0x00, 0x00,
      0x02, 0x01, 0x00,
      0x30, 0x0d,
      0x06, 0x09,
      0x2a, 0x86, 0x48, 0x86, 0xf7, 0x0d, 0x01, 0x01, 0x01,
      0x05, 0x00,
      0x04, 0x82, 0x00, 0x00
    ]);
    
    const keyLength = bytes.length;
    const pkcs8Key = new Uint8Array(pkcs8Header.length + keyLength);
    pkcs8Key.set(pkcs8Header);
    pkcs8Key.set(bytes, pkcs8Header.length);
    
    const innerLength = keyLength;
    pkcs8Key[pkcs8Header.length - 2] = (innerLength >> 8) & 0xff;
    pkcs8Key[pkcs8Header.length - 1] = innerLength & 0xff;
    
    const outerLength = pkcs8Key.length - 4;
    pkcs8Key[2] = (outerLength >> 8) & 0xff;
    pkcs8Key[3] = outerLength & 0xff;
    
    keyData = pkcs8Key.buffer;
  } else {
    const pemContents = formattedKey
      .replace('-----BEGIN PRIVATE KEY-----', '')
      .replace('-----END PRIVATE KEY-----', '')
      .replace(/\s/g, '');
    
    const binaryString = atob(pemContents);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    keyData = bytes.buffer;
  }
  
  return await crypto.subtle.importKey(
    'pkcs8',
    keyData,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign']
  );
}

// Get DocuSign access token
async function getDocuSignAccessToken() {
  const integrationKey = Deno.env.get('DOCUSIGN_INTEGRATION_KEY');
  const rsaPrivateKey = Deno.env.get('DOCUSIGN_RSA_PRIVATE_KEY');
  const userId = Deno.env.get('DOCUSIGN_USER_ID');
  
  if (!integrationKey || !rsaPrivateKey || !userId) {
    throw new Error('DocuSign credentials not configured');
  }

  const privateKey = await importRSAPrivateKey(rsaPrivateKey);
  const now = Math.floor(Date.now() / 1000);

  const jwt = await create(
    { alg: 'RS256', typ: 'JWT' },
    {
      iss: integrationKey,
      sub: userId,
      aud: 'account-d.docusign.com',
      iat: now,
      exp: now + 3600,
      scope: 'signature impersonation'
    },
    privateKey
  );

  const tokenResponse = await fetch('https://account-d.docusign.com/oauth/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  });

  if (!tokenResponse.ok) {
    const errorText = await tokenResponse.text();
    throw new Error(`Failed to get DocuSign access token: ${errorText}`);
  }

  const tokenData = await tokenResponse.json();
  return tokenData.access_token;
}

// Download signed document from DocuSign
async function downloadSignedDocument(accountId: string, envelopeId: string, accessToken: string): Promise<Uint8Array> {
  console.log(`Downloading signed document for envelope: ${envelopeId}`);
  
  const response = await fetch(
    `https://demo.docusign.net/restapi/v2.1/accounts/${accountId}/envelopes/${envelopeId}/documents/combined`,
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Error downloading document:', errorText);
    throw new Error(`Failed to download signed document: ${errorText}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return new Uint8Array(arrayBuffer);
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Handle GET requests (DocuSign verification/testing)
  if (req.method === 'GET') {
    console.log('DocuSign webhook verification GET request received');
    return new Response(JSON.stringify({ 
      status: 'ok', 
      message: 'DocuSign webhook endpoint is active' 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    // Read body as text first to handle empty bodies
    const bodyText = await req.text();
    
    if (!bodyText || bodyText.trim() === '') {
      console.log('Empty body received - likely a test ping');
      return new Response(JSON.stringify({ 
        status: 'ok', 
        message: 'Webhook endpoint active - no payload received' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const payload = JSON.parse(bodyText);
    console.log('DocuSign webhook received:', JSON.stringify(payload, null, 2));

    // DocuSign sends envelope status in the webhook
    const event = payload.event || payload.status;
    const envelopeId = payload.envelopeId || payload.data?.envelopeId;

    // Check for completed/signed status
    if (event !== 'envelope-completed' && payload.status !== 'completed') {
      console.log(`Ignoring event: ${event}, status: ${payload.status}`);
      return new Response(JSON.stringify({ message: 'Event ignored' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!envelopeId) {
      console.error('No envelope ID in webhook payload');
      return new Response(JSON.stringify({ error: 'No envelope ID' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Processing completed envelope: ${envelopeId}`);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const accountId = Deno.env.get('DOCUSIGN_ACCOUNT_ID');
    if (!accountId) {
      throw new Error('DocuSign account ID not configured');
    }

    // Find the intent registration with this envelope ID
    // First check intent_registrations directly (primary lookup)
    const { data: intentData, error: intentError } = await supabase
      .from('intent_registrations')
      .select('id')
      .eq('docusign_envelope_id', envelopeId)
      .maybeSingle();

    let intentId: string | null = null;

    if (intentData?.id) {
      intentId = intentData.id;
      console.log(`Found intent ID from intent_registrations: ${intentId}`);
    } else {
      // Fallback: check directorate_approvals for the envelope ID
      const { data: approvalData, error: approvalError } = await supabase
        .from('directorate_approvals')
        .select('intent_registration_id')
        .eq('docusign_envelope_id', envelopeId)
        .maybeSingle();

      if (approvalData?.intent_registration_id) {
        intentId = approvalData.intent_registration_id;
        console.log(`Found intent ID from directorate_approvals: ${intentId}`);
      } else {
        console.log('Could not find intent registration for envelope ID:', envelopeId);
        if (intentError) console.log('Intent query error:', intentError);
        if (approvalError) console.log('Approval query error:', approvalError);
      }
    }

    // Get access token and download signed document
    const accessToken = await getDocuSignAccessToken();
    console.log('Got DocuSign access token');

    const signedDocumentData = await downloadSignedDocument(accountId, envelopeId, accessToken);
    console.log(`Downloaded signed document: ${signedDocumentData.length} bytes`);

    // Upload to Supabase storage
    const timestamp = Date.now();
    const storagePath = intentId 
      ? `${intentId}/signed-documents/${timestamp}-signed-approval-letter.pdf`
      : `signed-documents/${envelopeId}/${timestamp}-signed-document.pdf`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('documents')
      .upload(storagePath, signedDocumentData, {
        contentType: 'application/pdf',
        upsert: true,
      });

    if (uploadError) {
      console.error('Error uploading signed document:', uploadError);
      throw new Error(`Failed to upload signed document: ${uploadError.message}`);
    }

    console.log(`Uploaded signed document to: ${storagePath}`);

    // Update intent registration with signed document path
    if (intentId) {
      const { error: updateError } = await supabase
        .from('intent_registrations')
        .update({
          signed_document_path: storagePath,
          updated_at: new Date().toISOString(),
        })
        .eq('id', intentId);

      if (updateError) {
        console.error('Error updating intent registration:', updateError);
        throw new Error(`Failed to update intent registration: ${updateError.message}`);
      }

      console.log(`Updated intent registration ${intentId} with signed document path`);

      // Also update the directorate_approvals record
      await supabase
        .from('directorate_approvals')
        .update({
          letter_signed: true,
          letter_signed_at: new Date().toISOString(),
        })
        .eq('docusign_envelope_id', envelopeId);
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Signed document processed successfully',
      storagePath 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error processing DocuSign webhook:', error);
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
