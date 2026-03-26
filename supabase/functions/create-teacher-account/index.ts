import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const { email, password, full_name, phone, assigned_classes } = await req.json();

    if (!email || !password || !full_name) {
      return new Response(JSON.stringify({ success: false, error: "Missing required fields" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 1. Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (authError) {
      console.error("Auth error:", authError);
      return new Response(JSON.stringify({ success: false, error: authError.message }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = authData.user.id;

    // 2. Insert teacher role
    const { error: roleError } = await supabase
      .from("user_roles")
      .insert({ user_id: userId, role: "teacher" });

    if (roleError) {
      console.error("Role error:", roleError);
      await supabase.auth.admin.deleteUser(userId);
      return new Response(JSON.stringify({ success: false, error: "Failed to assign teacher role" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 3. Insert teacher profile
    const { data: profileData, error: profileError } = await supabase
      .from("teacher_profiles")
      .insert({ user_id: userId, full_name, phone: phone || null })
      .select()
      .single();

    if (profileError) {
      console.error("Profile error:", profileError);
      return new Response(JSON.stringify({ success: false, error: "Failed to create teacher profile" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 4. Assign classes if provided
    if (assigned_classes && assigned_classes.length > 0) {
      const classRecords = assigned_classes.map((c: { class_name: string; academic_year: string }) => ({
        teacher_id: profileData.id,
        class_name: c.class_name,
        academic_year: c.academic_year,
      }));

      const { error: classError } = await supabase.from("class_teachers").insert(classRecords);
      if (classError) console.error("Class assignment error:", classError);
    }

    return new Response(JSON.stringify({
      success: true,
      teacher: { id: profileData.id, user_id: userId, email, full_name },
    }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(JSON.stringify({ success: false, error: "Internal server error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
