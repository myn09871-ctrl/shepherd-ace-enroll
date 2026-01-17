import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import nodemailer from "https://esm.sh/nodemailer@6.9.8";

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

    console.log(`Processing application: ${applicationId}`);

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

    // 2. Check for duplicate - prevent re-processing
    const { data: existingStudent } = await supabase
      .from("students")
      .select("id, student_id")
      .eq("enrollment_application_id", applicationId)
      .maybeSingle();

    if (existingStudent) {
      throw new Error(`This application has already been processed. Student ID: ${existingStudent.student_id}`);
    }

    // 3. Generate unique student ID atomically using database function
    const year = new Date().getFullYear();
    const { data: studentId, error: idError } = await supabase.rpc('generate_student_id');
    
    if (idError || !studentId) {
      console.error("Student ID generation error:", idError);
      throw new Error(`Failed to generate student ID: ${idError?.message || "Unknown error"}`);
    }

    console.log(`Generated student ID: ${studentId}`);

    // 4. Create student record
    let student;
    try {
      const { data: studentData, error: studentError } = await supabase
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
        // Handle duplicate constraint violation gracefully
        if (studentError.code === "23505") {
          throw new Error("A student with this ID already exists. This application may have been processed already.");
        }
        throw new Error(`Failed to create student: ${studentError.message}`);
      }
      student = studentData;
      console.log(`Created student record: ${student.id}`);
    } catch (err) {
      console.error("Student creation error:", err);
      throw err;
    }

    // 5. Check if parent account exists by email
    const portalEmail = application.portal_email || application.guardian1_email;

    const { data: existingParent } = await supabase
      .from("parent_accounts")
      .select("user_id")
      .eq("email", portalEmail)
      .maybeSingle();

    let userId = existingParent?.user_id;
    let tempPassword = "";
    let isNewParent = !existingParent;

    // 6. If no existing parent, create auth user
    if (!userId) {
      // Generate temp password or use saved one
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
      console.log(`Created auth user: ${userId}`);
    }

    // 7. Create parent account linked to student
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

    console.log(`Created parent account for: ${portalEmail}`);

    // 8. Update application status to enrolled AND clear temp password
    const { error: updateError } = await supabase
      .from("enrollment_applications")
      .update({ 
        status: "enrolled",
        portal_password_hash: null  // Clear temp password for security
      })
      .eq("id", applicationId);

    if (updateError) {
      console.error("Application update error:", updateError);
    }

    // 9. Send welcome email via Gmail SMTP using nodemailer with RETRY logic
    let emailSent = false;
    let emailError = "";
    const maxRetries = 3;

    const studentName = `${application.student_first_name} ${application.student_surname}`;
    const portalUrl = "https://shepherd-ace-enroll.lovable.app/portal/login";

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`Email attempt ${attempt}/${maxRetries} to ${portalEmail}`);

        const transporter = nodemailer.createTransport({
          host: "smtp.gmail.com",
          port: 587,
          secure: false,
          auth: {
            user: "info.goodshepherdschoolgh@gmail.com",
            pass: gmailPassword,
          },
          connectionTimeout: 30000,
          greetingTimeout: 30000,
          socketTimeout: 30000,
        });

        const emailBodyText = isNewParent
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

        const emailBodyHtml = isNewParent
          ? `
<!DOCTYPE html>
<html>
<head><style>body{font-family:Arial,sans-serif;line-height:1.6;color:#333;}h1{color:#2c5530;}.details{background:#f5f5f5;padding:15px;border-radius:8px;margin:15px 0;}.cta{display:inline-block;background:#2c5530;color:white!important;padding:12px 24px;text-decoration:none;border-radius:5px;margin:15px 0;}</style></head>
<body>
<h1>Welcome to Good Shepherd International School!</h1>
<p>Dear ${application.guardian1_full_name},</p>
<p>We are pleased to inform you that <strong>${studentName}'s</strong> enrollment has been approved.</p>
<div class="details">
<h3>Student Details</h3>
<p><strong>Student ID:</strong> ${studentId}<br>
<strong>Name:</strong> ${studentName}<br>
<strong>Class:</strong> ${application.program_level}<br>
<strong>Academic Year:</strong> ${year}/${year + 1}</p>
</div>
<div class="details">
<h3>Parent Portal Login</h3>
<p><strong>Email:</strong> ${portalEmail}<br>
<strong>Temporary Password:</strong> ${tempPassword}</p>
</div>
<p><a href="${portalUrl}" class="cta">Login to Parent Portal</a></p>
<p><em>For security, please change your password after your first login.</em></p>
<p>If you have any questions, please contact us at info.goodshepherdschoolgh@gmail.com</p>
<p>Best regards,<br><strong>Good Shepherd International School</strong><br>Admissions Office</p>
</body>
</html>`
          : `
<!DOCTYPE html>
<html>
<head><style>body{font-family:Arial,sans-serif;line-height:1.6;color:#333;}h1{color:#2c5530;}.details{background:#f5f5f5;padding:15px;border-radius:8px;margin:15px 0;}.cta{display:inline-block;background:#2c5530;color:white!important;padding:12px 24px;text-decoration:none;border-radius:5px;margin:15px 0;}</style></head>
<body>
<h1>Welcome to Good Shepherd International School!</h1>
<p>Dear ${application.guardian1_full_name},</p>
<p>We are pleased to inform you that <strong>${studentName}</strong> has been enrolled successfully.</p>
<div class="details">
<h3>Student Details</h3>
<p><strong>Student ID:</strong> ${studentId}<br>
<strong>Name:</strong> ${studentName}<br>
<strong>Class:</strong> ${application.program_level}<br>
<strong>Academic Year:</strong> ${year}/${year + 1}</p>
</div>
<p>Since you already have a Parent Portal account, ${studentName} has been linked to your existing account.</p>
<p><a href="${portalUrl}" class="cta">Login to Parent Portal</a></p>
<p>If you have any questions, please contact us at info.goodshepherdschoolgh@gmail.com</p>
<p>Best regards,<br><strong>Good Shepherd International School</strong><br>Admissions Office</p>
</body>
</html>`;

        await transporter.sendMail({
          from: '"Good Shepherd International School" <info.goodshepherdschoolgh@gmail.com>',
          to: portalEmail,
          subject: `Welcome to Good Shepherd International School - ${studentName} Enrollment Confirmed`,
          text: emailBodyText,
          html: emailBodyHtml,
        });

        emailSent = true;
        console.log(`Email sent successfully to: ${portalEmail}`);

        // Log the successful sent email
        await supabase.from("sent_emails").insert({
          recipient_email: portalEmail,
          recipient_type: "parent",
          subject: `Welcome - ${studentName} Enrollment Confirmed`,
          body: emailBodyText,
          application_id: applicationId,
        });

        break; // Exit retry loop on success
        
      } catch (mailErr) {
        console.error(`Email attempt ${attempt} failed:`, mailErr);
        emailError = mailErr instanceof Error ? mailErr.message : "Failed to send email";
        
        if (attempt < maxRetries) {
          // Exponential backoff before retry
          const delay = 1000 * attempt;
          console.log(`Waiting ${delay}ms before retry...`);
          await new Promise(r => setTimeout(r, delay));
        }
      }
    }

    // Log failed email if all retries exhausted
    if (!emailSent) {
      console.error(`All ${maxRetries} email attempts failed. Last error: ${emailError}`);
      await supabase.from("sent_emails").insert({
        recipient_email: portalEmail,
        recipient_type: "parent",
        subject: `[FAILED] Welcome - ${studentName}`,
        body: `Email failed after ${maxRetries} attempts. Last error: ${emailError}`,
        application_id: applicationId,
      });
    }

    // Return success - NEVER expose tempPassword to frontend
    return new Response(
      JSON.stringify({
        success: true,
        studentId,
        studentName,
        portalEmail,
        isNewParent,
        emailSent,
        emailError: emailSent ? null : emailError,
        message: emailSent
          ? `Portal created and welcome email sent to ${portalEmail}`
          : `Portal created successfully. Email delivery failed after ${maxRetries} attempts - check email logs.`,
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
