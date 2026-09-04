import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // ---- 1. Authenticate the caller -------------------------------------
    const authHeader = req.headers.get("Authorization") ?? "";
    if (!authHeader.startsWith("Bearer ")) {
      return json({ success: false, error: "Missing authorization" }, 401);
    }

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData?.user) {
      return json({ success: false, error: "Invalid session" }, 401);
    }
    const userId = userData.user.id;

    // ---- 2. Validate payload --------------------------------------------
    const body = await req.json().catch(() => null);
    if (!body) return json({ success: false, error: "Invalid JSON body" }, 400);

    const {
      student_id,
      class_name,
      academic_year,
      term,
      conduct = null,
      attitude = null,
      interest = null,
      attendance_present = null,
      attendance_total = null,
      form_teacher_remark = null,
      promoted_to = null,
      next_term_begins = null,
    } = body as Record<string, unknown>;

    const isStr = (v: unknown) => typeof v === "string" && v.trim().length > 0;
    if (!isStr(student_id) || !isStr(class_name) || !isStr(academic_year) || !isStr(term)) {
      return json(
        { success: false, error: "student_id, class_name, academic_year and term are required" },
        400,
      );
    }

    const admin = createClient(supabaseUrl, serviceRoleKey);

    // ---- 3. Verify the caller is an active teacher of this class ---------
    const { data: profile } = await admin
      .from("teacher_profiles")
      .select("id, full_name")
      .eq("user_id", userId)
      .maybeSingle();

    if (!profile) {
      return json({ success: false, error: "Not a teacher account" }, 403);
    }

    const { data: assignment } = await admin
      .from("class_teachers")
      .select("id")
      .eq("teacher_id", profile.id)
      .eq("class_name", class_name)
      .eq("is_active", true)
      .maybeSingle();

    if (!assignment) {
      return json(
        { success: false, error: `You are not assigned to ${class_name}` },
        403,
      );
    }

    // ---- 4. Class roster (and confirm the student belongs to it) --------
    const { data: roster, error: rosterErr } = await admin
      .from("students")
      .select("id")
      .eq("current_class", class_name)
      .eq("status", "active");

    if (rosterErr) throw rosterErr;
    const rosterIds = (roster ?? []).map((s) => s.id);

    if (!rosterIds.includes(student_id as string)) {
      return json(
        { success: false, error: "That learner is not on this class roster" },
        403,
      );
    }

    // ---- 5. Aggregate grades for the whole class ------------------------
    const { data: gradeRows, error: gradesErr } = await admin
      .from("grades")
      .select("student_id, total_score")
      .in("student_id", rosterIds)
      .eq("academic_year", academic_year)
      .eq("term", term);

    if (gradesErr) throw gradesErr;

    const perStudent = new Map<string, { sum: number; count: number }>();
    for (const row of gradeRows ?? []) {
      if (row.total_score === null || row.total_score === undefined) continue;
      const agg = perStudent.get(row.student_id) ?? { sum: 0, count: 0 };
      agg.sum += Number(row.total_score);
      agg.count += 1;
      perStudent.set(row.student_id, agg);
    }

    const target = perStudent.get(student_id as string);
    if (!target || target.count === 0) {
      return json(
        { success: false, error: "No scores recorded for this learner this term" },
        400,
      );
    }

    const round1 = (n: number) => Math.round(n * 10) / 10;

    const averages = [...perStudent.entries()].map(([id, a]) => ({
      id,
      average: a.sum / a.count,
    }));

    const learnerAverage = round1(target.sum / target.count);
    const classAverage = round1(
      averages.reduce((acc, a) => acc + a.average, 0) / averages.length,
    );

    const ranked = [...averages].sort((a, b) => b.average - a.average);
    const position =
      ranked.findIndex((r) => r.id === student_id) + 1 || null;

    // ---- 6. Upsert and publish ------------------------------------------
    const payload = {
      student_id,
      academic_year,
      term,
      class_name,
      number_on_roll: rosterIds.length,
      attendance_present:
        attendance_present === null || attendance_present === ""
          ? null
          : Number(attendance_present),
      attendance_total:
        attendance_total === null || attendance_total === ""
          ? null
          : Number(attendance_total),
      conduct: conduct || null,
      attitude: attitude || null,
      interest: interest || null,
      form_teacher_name: profile.full_name,
      form_teacher_remark: form_teacher_remark || null,
      promoted_to: promoted_to || null,
      next_term_begins: next_term_begins || null,
      cumulated_score: round1(target.sum),
      max_possible_score: target.count * 100,
      learner_average: learnerAverage,
      class_average: classAverage,
      position_in_class: position,
      is_published: true,
    };

    const { data: saved, error: upsertErr } = await admin
      .from("report_cards")
      .upsert(payload, { onConflict: "student_id,academic_year,term" })
      .select()
      .single();

    if (upsertErr) {
      console.error("Upsert error:", upsertErr);
      return json({ success: false, error: upsertErr.message }, 500);
    }

    return json({ success: true, report_card: saved });
  } catch (err) {
    console.error("publish-report-card error:", err);
    return json({ success: false, error: (err as Error).message }, 500);
  }
});
