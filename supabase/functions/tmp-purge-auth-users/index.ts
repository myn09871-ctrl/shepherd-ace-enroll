import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const IDS = [
  "10890468-2bc5-40a4-a7f2-a708320d6404",
  "964335ad-4755-40ff-b112-95c118d62cfe",
  "e15dcdf1-2ce5-4fd4-9acf-9e7f14181718",
];

Deno.serve(async () => {
  const admin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );
  const results: Record<string, string> = {};
  for (const id of IDS) {
    const { error } = await admin.auth.admin.deleteUser(id);
    results[id] = error ? `ERROR: ${error.message}` : "deleted";
  }
  const { data } = await admin.auth.admin.listUsers({ page: 1, perPage: 200 });
  return new Response(
    JSON.stringify({ results, remaining: data?.users.map((u) => ({ id: u.id, email: u.email })) }, null, 2),
    { headers: { "Content-Type": "application/json" } },
  );
});
