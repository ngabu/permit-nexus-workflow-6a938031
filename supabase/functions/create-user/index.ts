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
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    console.log("Creating admin client...");
    
    // Create admin client with service role key
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Get the authorization header to verify the calling user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.log("No authorization header provided");
      return new Response(
        JSON.stringify({ error: "No authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create a client to verify the calling user
    const supabaseClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });

    // Get the calling user
    console.log("Verifying calling user...");
    const { data: { user: callingUser }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !callingUser) {
      console.log("User verification failed:", userError?.message);
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Calling user ID:", callingUser.id);

    // Check if the calling user is admin or super_admin
    const { data: callingProfile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("user_type")
      .eq("user_id", callingUser.id)
      .single();

    if (profileError || !callingProfile) {
      console.log("Profile fetch error:", profileError?.message);
      return new Response(
        JSON.stringify({ error: "Could not verify user permissions" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Calling user type:", callingProfile.user_type);

    if (callingProfile.user_type !== "admin" && callingProfile.user_type !== "super_admin") {
      console.log("User is not admin or super_admin");
      return new Response(
        JSON.stringify({ error: "Only admins can create users" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse the request body
    const body = await req.json();
    const { email, password, first_name, last_name, user_type, staff_unit, staff_position, phone } = body;
    
    console.log("Creating user with email:", email);

    if (!email || !password) {
      return new Response(
        JSON.stringify({ error: "Email and password are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create the user using admin API
    console.log("Calling auth.admin.createUser...");
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        first_name: first_name || "",
        last_name: last_name || "",
      },
    });

    if (createError) {
      console.error("Error creating user:", createError.message, createError);
      return new Response(
        JSON.stringify({ error: createError.message }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("User created successfully, ID:", newUser.user.id);

    // Wait a moment for the trigger to create the profile
    await new Promise(resolve => setTimeout(resolve, 500));

    // Update the profile with additional information
    console.log("Updating profile...");
    const { error: updateError } = await supabaseAdmin
      .from("profiles")
      .update({
        first_name: first_name || null,
        last_name: last_name || null,
        user_type: user_type || "staff",
        staff_unit: staff_unit || null,
        staff_position: staff_position || null,
        phone: phone || null,
      })
      .eq("user_id", newUser.user.id);

    if (updateError) {
      console.error("Error updating profile:", updateError.message, updateError);
      // User was created but profile update failed - still return success with warning
      return new Response(
        JSON.stringify({ 
          user: newUser.user, 
          message: "User created successfully",
          warning: "Profile update may have failed: " + updateError.message
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Profile updated successfully");

    return new Response(
      JSON.stringify({ user: newUser.user, message: "User created successfully" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Unexpected error:", error);
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
