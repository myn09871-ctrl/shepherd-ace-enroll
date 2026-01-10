import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

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
    const gmailPassword = Deno.env.get("GMAIL_APP_PASSWORD");

    if (!gmailPassword) {
      throw new Error("Email configuration missing. Please configure GMAIL_APP_PASSWORD.");
    }

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

    if (application.status === "enrolled") {
      throw new Error("This application has already been processed");
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
    let isNewParent = !existingParent;

    // 5. If no existing parent, create auth user
    if (!userId) {
      // Generate temp password
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

    // 8. Send welcome email via Gmail SMTP
    let emailSent = false;
    let emailError = "";

    try {
      const client = new SMTPClient({
        connection: {
          hostname: "smtp.gmail.com",
          port: 587,
          tls: true,
          auth: {
            username: "info.goodshepherdschoolgh@gmail.com",
            password: gmailPassword,
          },
        },
      });

      const studentName = `${application.student_first_name} ${application.student_surname}`;
      const portalUrl = "https://goodshepherdgh.lovable.app/portal/login";

      const emailBody = isNewParent
        ? `Dear ${application.guardian1_full_name},

Welcome to Good Shepherd International School!

We are pleased to inform you that ${studentName}'s enrollment has been approved.

STUDENT DETAILS:
Student ID: ${studentId}
Name: ${studentName}
Class: ${application.program_level}
Academic Year: ${year}/${year + 1}

PARENT PORTAL LOGIN:
Email: ${portalEmail}
Temporary Password: ${tempPassword}
Portal URL: ${portalUrl}

Please log in to the Parent Portal to view your child's academic progress, announcements, and more.

For security, we recommend changing your password after your first login.

If you have any questions, please contact us at info.goodshepherdschoolgh@gmail.com

Best regards,
Good Shepherd International School
Admissions Office`
        : `Dear ${application.guardian1_full_name},

Welcome to Good Shepherd International School!

We are pleased to inform you that ${studentName} has been enrolled successfully.

STUDENT DETAILS:
Student ID: ${studentId}
Name: ${studentName}
Class: ${application.program_level}
Academic Year: ${year}/${year + 1}

Since you already have a Parent Portal account, ${studentName} has been linked to your existing account. You can now view all your children's information from the same portal login.

Portal URL: ${portalUrl}

If you have any questions, please contact us at info.goodshepherdschoolgh@gmail.com

Best regards,
Good Shepherd International School
Admissions Office`;

      await client.send({
        from: "Good Shepherd International School <info.goodshepherdschoolgh@gmail.com>",
        to: portalEmail,
        subject: `Welcome to Good Shepherd International School - ${studentName} Enrollment Confirmed`,
        content: emailBody,
      });

      await client.close();
      emailSent = true;

      // Log the sent email
      await supabase.from("sent_emails").insert({
        recipient_email: portalEmail,
        recipient_type: "parent",
        subject: `Welcome - ${studentName} Enrollment Confirmed`,
        body: emailBody,
        application_id: applicationId,
      });

    } catch (mailErr) {
      console.error("Email send error:", mailErr);
      emailError = mailErr instanceof Error ? mailErr.message : "Failed to send email";
    }

    // Return success with portal info
    return new Response(
      JSON.stringify({
        success: true,
        studentId,
        studentName: `${application.student_first_name} ${application.student_surname}`,
        portalEmail,
        tempPassword: isNewParent ? tempPassword : null,
        isNewParent,
        emailSent,
        emailError: emailError || null,
        message: isNewParent
          ? "New parent portal created successfully"
          : "Student linked to existing parent account",
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
