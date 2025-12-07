import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Create Supabase client for database queries
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch database schema and sample data for context
    const [
      { data: entities, count: entityCount },
      { data: permits, count: permitCount },
      { data: intents, count: intentCount },
      { data: recentPermits },
      { data: recentIntents },
      { data: pendingApprovals },
    ] = await Promise.all([
      supabase.from("entities").select("*", { count: "exact", head: true }),
      supabase.from("permit_applications").select("*", { count: "exact", head: true }),
      supabase.from("intent_registrations").select("*", { count: "exact", head: true }),
      supabase.from("permit_applications").select("id, status, permit_type, entity_name, created_at, province").order("created_at", { ascending: false }).limit(50),
      supabase.from("intent_registrations").select("id, status, activity_level, province, created_at").order("created_at", { ascending: false }).limit(50),
      supabase.from("directorate_approvals").select("*").eq("approval_status", "pending"),
    ]);

    // Get status distribution for permits
    const { data: permitsByStatus } = await supabase
      .from("permit_applications")
      .select("status")
      .not("status", "is", null);

    // Get permits by province
    const { data: permitsByProvince } = await supabase
      .from("permit_applications")
      .select("province")
      .not("province", "is", null);

    // Get permits by type
    const { data: permitsByType } = await supabase
      .from("permit_applications")
      .select("permit_type")
      .not("permit_type", "is", null);

    // Aggregate statistics
    const statusCounts: Record<string, number> = {};
    permitsByStatus?.forEach((p) => {
      statusCounts[p.status] = (statusCounts[p.status] || 0) + 1;
    });

    const provinceCounts: Record<string, number> = {};
    permitsByProvince?.forEach((p) => {
      if (p.province) {
        provinceCounts[p.province] = (provinceCounts[p.province] || 0) + 1;
      }
    });

    const typeCounts: Record<string, number> = {};
    permitsByType?.forEach((p) => {
      if (p.permit_type) {
        typeCounts[p.permit_type] = (typeCounts[p.permit_type] || 0) + 1;
      }
    });

    const systemPrompt = `You are an AI analytics assistant for the Conservation & Environment Protection Authority (CEPA) of Papua New Guinea's permit management system. You have access to the following real-time database statistics:

DATABASE SUMMARY:
- Total Entities: ${entityCount || 0}
- Total Permit Applications: ${permitCount || 0}
- Total Intent Registrations: ${intentCount || 0}
- Pending Director Approvals: ${pendingApprovals?.length || 0}

PERMIT STATUS DISTRIBUTION:
${JSON.stringify(statusCounts, null, 2)}

PERMITS BY PROVINCE:
${JSON.stringify(provinceCounts, null, 2)}

PERMITS BY TYPE:
${JSON.stringify(typeCounts, null, 2)}

RECENT PERMIT APPLICATIONS (Last 50):
${JSON.stringify(recentPermits, null, 2)}

RECENT INTENT REGISTRATIONS (Last 50):
${JSON.stringify(recentIntents, null, 2)}

When responding:
1. Provide clear, concise analytics insights
2. When presenting data, format it appropriately for visualization
3. If asked for charts or tables, provide data in JSON format with a "visualization" field:
   - For tables: { "type": "table", "headers": [...], "rows": [[...], [...]] }
   - For charts: { "type": "chart", "chartType": "bar|pie|line", "data": [...], "labels": [...] }
4. Always include an "analysis" field with your interpretation of the data
5. Be helpful and proactive in suggesting related insights
6. Format your response as JSON with these fields: { "analysis": "...", "visualization": {...} }`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: query },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("AI gateway error");
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content;

    // Try to parse as JSON, otherwise return as plain text
    let parsedContent;
    try {
      // Extract JSON from markdown code blocks if present
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
      const jsonStr = jsonMatch ? jsonMatch[1].trim() : content;
      parsedContent = JSON.parse(jsonStr);
    } catch {
      parsedContent = { analysis: content, visualization: null };
    }

    return new Response(JSON.stringify(parsedContent), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("AI Analytics error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
