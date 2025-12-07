import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { create, getNumericDate } from "https://deno.land/x/djwt@v3.0.1/mod.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Test email for development
const TEST_EMAIL = 'gabunorman@gmail.com';
const TEST_NAME = 'Test Recipient';

// Convert PKCS#1 RSA private key to CryptoKey
async function importRSAPrivateKey(pemKey: string): Promise<CryptoKey> {
  // Handle escaped newlines and clean up the key
  const formattedKey = pemKey.replace(/\\n/g, '\n').trim();
  
  // Check if it's PKCS#1 format
  const isPKCS1 = formattedKey.includes('BEGIN RSA PRIVATE KEY');
  
  let keyData: ArrayBuffer;
  
  if (isPKCS1) {
    // Extract the base64 content from PKCS#1 PEM
    const pemContents = formattedKey
      .replace('-----BEGIN RSA PRIVATE KEY-----', '')
      .replace('-----END RSA PRIVATE KEY-----', '')
      .replace(/\s/g, '');
    
    const binaryString = atob(pemContents);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    // PKCS#1 to PKCS#8 conversion
    // PKCS#8 wraps the PKCS#1 key with algorithm identifier
    const pkcs8Header = new Uint8Array([
      0x30, 0x82, 0x00, 0x00, // SEQUENCE, length placeholder
      0x02, 0x01, 0x00,       // INTEGER version = 0
      0x30, 0x0d,             // SEQUENCE
      0x06, 0x09,             // OID
      0x2a, 0x86, 0x48, 0x86, 0xf7, 0x0d, 0x01, 0x01, 0x01, // rsaEncryption OID
      0x05, 0x00,             // NULL
      0x04, 0x82, 0x00, 0x00  // OCTET STRING, length placeholder
    ]);
    
    // Calculate lengths
    const keyLength = bytes.length;
    const totalLength = pkcs8Header.length + keyLength - 4; // -4 for the length placeholders
    
    // Create PKCS#8 key
    const pkcs8Key = new Uint8Array(pkcs8Header.length + keyLength);
    pkcs8Key.set(pkcs8Header);
    pkcs8Key.set(bytes, pkcs8Header.length);
    
    // Fix lengths in the header
    const innerLength = keyLength;
    pkcs8Key[pkcs8Header.length - 2] = (innerLength >> 8) & 0xff;
    pkcs8Key[pkcs8Header.length - 1] = innerLength & 0xff;
    
    const outerLength = pkcs8Key.length - 4;
    pkcs8Key[2] = (outerLength >> 8) & 0xff;
    pkcs8Key[3] = outerLength & 0xff;
    
    keyData = pkcs8Key.buffer;
  } else {
    // PKCS#8 format
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

// DocuSign JWT authentication helper
async function getDocuSignAccessToken() {
  const integrationKey = Deno.env.get('DOCUSIGN_INTEGRATION_KEY');
  const rsaPrivateKey = Deno.env.get('DOCUSIGN_RSA_PRIVATE_KEY');
  const userId = Deno.env.get('DOCUSIGN_USER_ID');
  
  if (!integrationKey || !rsaPrivateKey || !userId) {
    throw new Error('DocuSign credentials not configured');
  }

  console.log('Importing RSA private key...');
  
  const privateKey = await importRSAPrivateKey(rsaPrivateKey);

  console.log('Creating JWT token...');
  
  const now = Math.floor(Date.now() / 1000);

  // Create JWT using djwt
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

  console.log('JWT token created, exchanging for access token...');

  // Exchange JWT for access token
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
    console.error('DocuSign token error:', errorText);
    
    // Check for consent_required error
    if (errorText.includes('consent_required')) {
      const consentUrl = `https://account-d.docusign.com/oauth/auth?response_type=code&scope=signature%20impersonation&client_id=${integrationKey}&redirect_uri=https://www.docusign.com`;
      throw new Error(`DocuSign consent required. Please visit this URL to grant consent: ${consentUrl}`);
    }
    
    throw new Error(`Failed to get DocuSign access token: ${errorText}`);
  }

  const tokenData = await tokenResponse.json();
  console.log('Access token obtained successfully');
  return tokenData.access_token;
}

// Fetch intent registration data
async function fetchIntentData(supabase: any, intentId: string) {
  const { data, error } = await supabase
    .from('intent_registrations')
    .select(`
      *,
      entities (
        name,
        entity_type,
        registration_number,
        email,
        phone,
        postal_address,
        province,
        district,
        contact_person,
        contact_person_email,
        contact_person_phone
      ),
      prescribed_activities (
        category_number,
        category_type,
        sub_category,
        activity_description,
        level
      )
    `)
    .eq('id', intentId)
    .single();

  if (error) {
    console.error('Error fetching intent data:', error);
    throw new Error('Failed to fetch intent registration data');
  }

  return data;
}

// Fill template placeholders with intent data
function fillTemplatePlaceholders(templateContent: string, intentData: any): string {
  const entity = intentData.entities || {};
  const activity = intentData.prescribed_activities || {};
  
  // Format date helper
  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Create replacement map for all possible placeholders
  const replacements: Record<string, string> = {
    // Entity details
    '[Entity Name]': entity.name || 'N/A',
    '[Company Name]': entity.name || 'N/A',
    '[Applicant Name]': entity.name || 'N/A',
    '[Entity Type]': entity.entity_type || 'N/A',
    '[Registration Number]': entity.registration_number || 'N/A',
    '[Entity Email]': entity.email || 'N/A',
    '[Entity Phone]': entity.phone || 'N/A',
    '[Postal Address]': entity.postal_address || 'N/A',
    '[Province]': intentData.province || entity.province || 'N/A',
    '[District]': intentData.district || entity.district || 'N/A',
    '[LLG]': intentData.llg || 'N/A',
    '[Contact Person]': entity.contact_person || 'N/A',
    '[Contact Email]': entity.contact_person_email || 'N/A',
    '[Contact Phone]': entity.contact_person_phone || 'N/A',
    
    // Activity details
    '[Activity Name]': activity.activity_description || 'N/A',
    '[Activity Category]': activity.category_type || 'N/A',
    '[Activity Description]': activity.activity_description || intentData.activity_description || 'N/A',
    '[Activity Level]': intentData.activity_level || activity.level?.toString() || 'N/A',
    '[Prescribed Activity]': activity.category_number ? `${activity.category_number}: ${activity.activity_description}` : 'N/A',
    
    // Project details
    '[Project Description]': intentData.activity_description || 'N/A',
    '[Project Site Address]': intentData.project_site_address || 'N/A',
    '[Project Site Description]': intentData.project_site_description || 'N/A',
    '[Total Area]': intentData.total_area_sqkm ? `${intentData.total_area_sqkm} sq km` : 'N/A',
    '[Estimated Cost]': intentData.estimated_cost_kina ? `K ${intentData.estimated_cost_kina.toLocaleString()}` : 'N/A',
    '[Commencement Date]': formatDate(intentData.commencement_date),
    '[Completion Date]': formatDate(intentData.completion_date),
    '[Start Date]': formatDate(intentData.commencement_date),
    '[End Date]': formatDate(intentData.completion_date),
    
    // Location details
    '[Latitude]': intentData.latitude?.toString() || 'N/A',
    '[Longitude]': intentData.longitude?.toString() || 'N/A',
    '[Coordinates]': intentData.latitude && intentData.longitude 
      ? `${intentData.latitude}, ${intentData.longitude}` : 'N/A',
    
    // Additional details
    '[Site Ownership]': intentData.site_ownership_details || 'N/A',
    '[Landowner Status]': intentData.landowner_negotiation_status || 'N/A',
    '[Preparatory Work]': intentData.preparatory_work_description || 'N/A',
    '[Government Agreement]': intentData.government_agreement || 'N/A',
    '[Departments Approached]': intentData.departments_approached || 'N/A',
    '[Approvals Required]': intentData.approvals_required || 'N/A',
    
    // Review details
    '[Status]': intentData.status || 'N/A',
    '[Review Notes]': intentData.review_notes || 'N/A',
    '[MD Decision]': intentData.md_decision || 'N/A',
    '[MD Notes]': intentData.md_decision_notes || 'N/A',
    
    // Dates
    '[Submission Date]': formatDate(intentData.created_at),
    '[Current Date]': formatDate(new Date().toISOString()),
    '[Date]': formatDate(new Date().toISOString()),
    '[Today]': formatDate(new Date().toISOString()),
  };

  let filledContent = templateContent;
  
  // Replace all placeholders
  for (const [placeholder, value] of Object.entries(replacements)) {
    filledContent = filledContent.replaceAll(placeholder, value);
  }
  
  return filledContent;
}

// Download file from Supabase storage
async function downloadFile(supabase: any, filePath: string): Promise<Uint8Array> {
  const { data, error } = await supabase.storage
    .from('documents')
    .download(filePath);

  if (error) {
    console.error('Error downloading file:', error);
    throw new Error(`Failed to download file: ${error.message}`);
  }

  const arrayBuffer = await data.arrayBuffer();
  return new Uint8Array(arrayBuffer);
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { documentPath, signerEmail, signerName, intentId, documentName } = await req.json();

    console.log('DocuSign request received:', { documentPath, signerEmail: TEST_EMAIL, signerName: TEST_NAME, intentId, documentName });

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const accountId = Deno.env.get('DOCUSIGN_ACCOUNT_ID');
    if (!accountId) {
      throw new Error('DocuSign account ID not configured');
    }

    // Fetch intent registration data
    let intentData = null;
    if (intentId) {
      console.log('Fetching intent data for:', intentId);
      intentData = await fetchIntentData(supabase, intentId);
      console.log('Intent data fetched:', intentData?.id);
    }

    // Get access token
    const accessToken = await getDocuSignAccessToken();
    console.log('DocuSign access token obtained');

    // Prepare document content
    let documentBase64: string;
    let fileExtension = 'pdf';
    
    if (documentPath) {
      console.log('Downloading template from:', documentPath);
      
      // Download the uploaded template
      const fileData = await downloadFile(supabase, documentPath);
      
      // Check file type
      const isTextBased = documentPath.endsWith('.txt') || documentPath.endsWith('.html') || documentPath.endsWith('.htm');
      
      if (isTextBased && intentData) {
        // For text-based templates, fill in placeholders
        const decoder = new TextDecoder();
        let templateContent = decoder.decode(fileData);
        templateContent = fillTemplatePlaceholders(templateContent, intentData);
        
        // Convert filled text to PDF-ready format (HTML)
        const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; font-size: 12pt; line-height: 1.6; padding: 40px; }
    h1 { color: #2c3e50; }
    .header { text-align: center; margin-bottom: 30px; }
    .section { margin-bottom: 20px; }
    .label { font-weight: bold; }
  </style>
</head>
<body>
  <div class="header">
    <h1>CONSERVATION AND ENVIRONMENT PROTECTION AUTHORITY</h1>
    <h2>Intent Registration Approval Letter</h2>
  </div>
  <pre style="white-space: pre-wrap; font-family: Arial, sans-serif;">${templateContent}</pre>
</body>
</html>`;
        
        documentBase64 = btoa(unescape(encodeURIComponent(htmlContent)));
        fileExtension = 'html';
      } else if (documentPath.endsWith('.pdf')) {
        // For PDF files, use as-is
        let binaryString = '';
        for (let i = 0; i < fileData.length; i++) {
          binaryString += String.fromCharCode(fileData[i]);
        }
        documentBase64 = btoa(binaryString);
        fileExtension = 'pdf';
      } else {
        // For other files (Word docs, etc.), convert to base64 and send as-is
        let binaryString = '';
        for (let i = 0; i < fileData.length; i++) {
          binaryString += String.fromCharCode(fileData[i]);
        }
        documentBase64 = btoa(binaryString);
        
        // Determine file extension
        if (documentPath.endsWith('.docx')) fileExtension = 'docx';
        else if (documentPath.endsWith('.doc')) fileExtension = 'doc';
        else fileExtension = 'pdf';
      }
    } else {
      // Generate a default document with intent data if no template uploaded
      const entity = intentData?.entities || {};
      const activity = intentData?.prescribed_activities || {};
      
      const defaultContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; font-size: 12pt; line-height: 1.6; padding: 40px; max-width: 800px; margin: 0 auto; }
    h1 { color: #1a5f2a; text-align: center; }
    h2 { color: #2c3e50; border-bottom: 2px solid #1a5f2a; padding-bottom: 10px; }
    .header { text-align: center; margin-bottom: 30px; border-bottom: 3px solid #1a5f2a; padding-bottom: 20px; }
    .logo { font-size: 24px; font-weight: bold; color: #1a5f2a; }
    .section { margin-bottom: 25px; background: #f9f9f9; padding: 15px; border-radius: 5px; }
    .field { margin: 8px 0; }
    .label { font-weight: bold; color: #333; }
    .value { color: #555; }
    .signature-area { margin-top: 50px; border-top: 1px solid #ccc; padding-top: 30px; }
    .date { text-align: right; margin-bottom: 20px; }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">CONSERVATION AND ENVIRONMENT PROTECTION AUTHORITY</div>
    <h1>Intent Registration Approval Letter</h1>
  </div>
  
  <div class="date">
    <strong>Date:</strong> ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
  </div>

  <div class="section">
    <h2>Applicant Details</h2>
    <div class="field"><span class="label">Entity Name:</span> <span class="value">${entity.name || 'N/A'}</span></div>
    <div class="field"><span class="label">Entity Type:</span> <span class="value">${entity.entity_type || 'N/A'}</span></div>
    <div class="field"><span class="label">Registration Number:</span> <span class="value">${entity.registration_number || 'N/A'}</span></div>
    <div class="field"><span class="label">Contact Person:</span> <span class="value">${entity.contact_person || 'N/A'}</span></div>
    <div class="field"><span class="label">Email:</span> <span class="value">${entity.email || 'N/A'}</span></div>
    <div class="field"><span class="label">Phone:</span> <span class="value">${entity.phone || 'N/A'}</span></div>
  </div>

  <div class="section">
    <h2>Activity Details</h2>
    <div class="field"><span class="label">Prescribed Activity:</span> <span class="value">${activity.category_number ? activity.category_number + ': ' + activity.activity_description : 'N/A'}</span></div>
    <div class="field"><span class="label">Category:</span> <span class="value">${activity.category_type || 'N/A'}</span></div>
    <div class="field"><span class="label">Activity Level:</span> <span class="value">${intentData?.activity_level || activity.level || 'N/A'}</span></div>
    <div class="field"><span class="label">Description:</span> <span class="value">${intentData?.activity_description || 'N/A'}</span></div>
  </div>

  <div class="section">
    <h2>Project Location</h2>
    <div class="field"><span class="label">Province:</span> <span class="value">${intentData?.province || 'N/A'}</span></div>
    <div class="field"><span class="label">District:</span> <span class="value">${intentData?.district || 'N/A'}</span></div>
    <div class="field"><span class="label">LLG:</span> <span class="value">${intentData?.llg || 'N/A'}</span></div>
    <div class="field"><span class="label">Site Address:</span> <span class="value">${intentData?.project_site_address || 'N/A'}</span></div>
    <div class="field"><span class="label">Total Area:</span> <span class="value">${intentData?.total_area_sqkm ? intentData.total_area_sqkm + ' sq km' : 'N/A'}</span></div>
  </div>

  <div class="section">
    <h2>Project Timeline</h2>
    <div class="field"><span class="label">Commencement Date:</span> <span class="value">${intentData?.commencement_date ? new Date(intentData.commencement_date).toLocaleDateString() : 'N/A'}</span></div>
    <div class="field"><span class="label">Completion Date:</span> <span class="value">${intentData?.completion_date ? new Date(intentData.completion_date).toLocaleDateString() : 'N/A'}</span></div>
    <div class="field"><span class="label">Estimated Cost:</span> <span class="value">${intentData?.estimated_cost_kina ? 'K ' + intentData.estimated_cost_kina.toLocaleString() : 'N/A'}</span></div>
  </div>

  <div class="section">
    <h2>Decision</h2>
    <div class="field"><span class="label">Status:</span> <span class="value">${intentData?.status || 'Pending'}</span></div>
    <div class="field"><span class="label">MD Decision:</span> <span class="value">${intentData?.md_decision || 'Pending'}</span></div>
    <div class="field"><span class="label">Decision Notes:</span> <span class="value">${intentData?.md_decision_notes || 'N/A'}</span></div>
  </div>

  <div class="signature-area">
    <p>This document requires the signature of the Managing Director to confirm the approval of the above intent registration.</p>
    <br><br>
    <p>_______________________________</p>
    <p><strong>Managing Director</strong></p>
    <p>Conservation and Environment Protection Authority</p>
  </div>
</body>
</html>`;

      documentBase64 = btoa(unescape(encodeURIComponent(defaultContent)));
      fileExtension = 'html';
    }

    // Create envelope with the document - using TEST EMAIL for testing
    const envelopeDefinition = {
      emailSubject: `Please sign: ${documentName || 'Intent Registration Approval Letter'}`,
      documents: [
        {
          documentBase64,
          name: documentName || 'Intent Registration Approval Letter',
          fileExtension,
          documentId: '1',
        }
      ],
      recipients: {
        signers: [
          {
            email: TEST_EMAIL, // Using test email
            name: TEST_NAME,   // Using test name
            recipientId: '1',
            routingOrder: '1',
            tabs: {
              signHereTabs: [
                {
                  documentId: '1',
                  pageNumber: '1',
                  anchorString: '/sig1/',
                  anchorUnits: 'pixels',
                  anchorXOffset: '0',
                  anchorYOffset: '0',
                },
                {
                  documentId: '1',
                  pageNumber: '1',
                  xPosition: '100',
                  yPosition: '600',
                }
              ],
              dateSignedTabs: [
                {
                  documentId: '1',
                  pageNumber: '1',
                  xPosition: '300',
                  yPosition: '600',
                }
              ]
            }
          }
        ]
      },
      status: 'sent'
    };

    console.log('Creating DocuSign envelope for:', TEST_EMAIL);

    // Create envelope via DocuSign API
    const envelopeResponse = await fetch(
      `https://demo.docusign.net/restapi/v2.1/accounts/${accountId}/envelopes`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(envelopeDefinition),
      }
    );

    if (!envelopeResponse.ok) {
      const errorText = await envelopeResponse.text();
      console.error('DocuSign envelope error:', errorText);
      throw new Error(`Failed to create DocuSign envelope: ${errorText}`);
    }

    const envelopeData = await envelopeResponse.json();
    console.log('DocuSign envelope created:', envelopeData);

    // Store the envelope ID directly on the intent_registration for webhook lookup
    if (intentId && envelopeData.envelopeId) {
      // Store envelope ID directly on intent_registrations for reliable webhook lookup
      const { error: updateError } = await supabase
        .from('intent_registrations')
        .update({
          docusign_envelope_id: envelopeData.envelopeId,
          updated_at: new Date().toISOString()
        })
        .eq('id', intentId);

      if (updateError) {
        console.error('Error storing envelope ID on intent:', updateError);
        // Still continue - the envelope was created successfully
      } else {
        console.log(`Stored envelope ID ${envelopeData.envelopeId} on intent ${intentId}`);
      }

      // Also try to update directorate_approvals if a record exists
      await supabase
        .from('directorate_approvals')
        .update({
          docusign_envelope_id: envelopeData.envelopeId,
          updated_at: new Date().toISOString()
        })
        .eq('intent_registration_id', intentId);
    }

    return new Response(
      JSON.stringify({
        success: true,
        envelopeId: envelopeData.envelopeId,
        status: envelopeData.status,
        message: `Document sent to ${TEST_EMAIL} for signature (TEST MODE)`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('DocuSign error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to send document for signature';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
