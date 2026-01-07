import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CreatePortalRequest {
  applicationId: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { applicationId }: CreatePortalRequest = await req.json();

    if (!applicationId) {
      throw new Error("Application ID is required");
    }

    // 1. Fetch the application
    const { data: application, error: appError } = await supabase
      .from("enrollment_applications")
      .select("*")
      .eq("id", applicationId)
      .single();

    if (appError || !application) {
      throw new Error("Application not found");
    }

    // 2. Generate unique student ID (GSIS-YEAR-XXX)
    const year = new Date().getFullYear();
    const { count } = await supabase
      .from("students")
      .select("*", { count: "exact", head: true })
      .ilike("student_id", `GSIS-${year}-%`);

    const studentNumber = String((count || 0) + 1).padStart(3, "0");
    const studentId = `GSIS-${year}-${studentNumber}`;

    // 3. Create student record
    const { data: student, error: studentError } = await supabase
      .from("students")
      .insert({
        student_id: studentId,
        first_name: application.student_first_name,
        surname: application.student_surname,
        middle_name: application.student_middle_name,
        date_of_birth: application.student_dob,
        gender: application.student_gender,
        nationality: application.student_nationality,
        current_class: application.program_level,
        academic_year: `${year}/${year + 1}`,
        status: "active",
        enrollment_application_id: application.id,
        photo_url: application.student_photo_url,
      })
      .select()
      .single();

    if (studentError) {
      console.error("Student creation error:", studentError);
      throw new Error(`Failed to create student: ${studentError.message}`);
    }

    // 4. Check if parent account exists by email
    const portalEmail = application.portal_email || application.guardian1_email;
    
    const { data: existingParent } = await supabase
      .from("parent_accounts")
      .select("user_id")
      .eq("email", portalEmail)
      .maybeSingle();

    let userId = existingParent?.user_id;
    let tempPassword = "";

    // 5. If no existing parent, create auth user
    if (!userId) {
      // Generate temp password if not provided in application
      tempPassword = application.portal_password_hash || 
        Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-4).toUpperCase();

      const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
        email: portalEmail,
        password: tempPassword,
        email_confirm: true,
      });

      if (authError) {
        console.error("Auth user creation error:", authError);
        throw new Error(`Failed to create auth user: ${authError.message}`);
      }

      userId = authUser.user.id;
    }

    // 6. Create parent account linked to student
    const { error: parentError } = await supabase
      .from("parent_accounts")
      .insert({
        user_id: userId,
        student_id: student.id,
        email: portalEmail,
        parent_name: application.guardian1_full_name,
        relationship: application.guardian1_relationship,
        phone_primary: application.guardian1_phone_primary,
        phone_secondary: application.guardian1_phone_secondary,
        address: application.guardian1_address,
        is_active: true,
        role: "primary",
      });

    if (parentError) {
      console.error("Parent account creation error:", parentError);
      throw new Error(`Failed to create parent account: ${parentError.message}`);
    }

    // 7. Update application status to enrolled
    const { error: updateError } = await supabase
      .from("enrollment_applications")
      .update({ status: "enrolled" })
      .eq("id", applicationId);

    if (updateError) {
      console.error("Application update error:", updateError);
    }

    // Return success with portal info
    return new Response(
      JSON.stringify({
        success: true,
        studentId,
        portalEmail,
        tempPassword: tempPassword || "(existing account)",
        message: existingParent 
          ? "Student linked to existing parent account" 
          : "New parent portal created",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
    console.error("Error:", errorMessage);
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
