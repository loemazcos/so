import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const DEVICE_ID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const THREAD_IDS = ["sanghyuk", "donghyun", "jaehyun", "seongho"];
const CALENDAR_KINDS = ["school", "festival", "club", "exam", "council", "personal"];
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const TIME_PATTERN = /^\d{2}:\d{2}$/;

class BadRequest extends Error {}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function requireText(value: unknown, min: number, max: number): string {
  if (typeof value !== "string") throw new BadRequest();
  const text = value.trim();
  if (text.length < min || text.length > max) throw new BadRequest();
  return text;
}

function optionalText(value: unknown, max: number): string | null {
  if (value === null || value === undefined || value === "") return null;
  return requireText(value, 1, max);
}

function optionalTime(value: unknown): string | null {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value !== "string" || !TIME_PATTERN.test(value)) throw new BadRequest();
  return value;
}

function requireDate(value: unknown): string {
  if (typeof value !== "string" || !DATE_PATTERN.test(value)) throw new BadRequest();
  const parsed = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== value) throw new BadRequest();
  return value;
}

async function loadState(supabase: ReturnType<typeof createClient>, deviceId: string) {
  const [dm, calendar, run] = await Promise.all([
    supabase
      .from("dm_messages")
      .select("thread_id, sender, body, created_at")
      .eq("device_id", deviceId)
      .order("created_at", { ascending: true }),
    supabase
      .from("calendar_events")
      .select("id, title, event_date, start_time, end_time, place, memo, kind, status, status_note")
      .eq("device_id", deviceId)
      .order("event_date", { ascending: true })
      .order("start_time", { ascending: true, nullsFirst: true }),
    supabase.from("game_state").select("run").eq("device_id", deviceId).maybeSingle(),
  ]);
  if (dm.error || calendar.error || run.error) throw new Error("load failed");
  return {
    dmMessages: dm.data ?? [],
    calendarEvents: calendar.data ?? [],
    gameState: run.data?.run ?? null,
  };
}

async function saveState(supabase: ReturnType<typeof createClient>, deviceId: string, payload: Record<string, unknown>) {
  const run = payload.run;
  if (typeof run !== "object" || run === null || Array.isArray(run)) throw new BadRequest();
  if (JSON.stringify(run).length > 100_000) throw new BadRequest();
  const { error } = await supabase
    .from("game_state")
    .upsert({ device_id: deviceId, run, updated_at: new Date().toISOString() });
  if (error) throw new Error("save failed");
  return { ok: true };
}

async function sendDm(supabase: ReturnType<typeof createClient>, deviceId: string, payload: Record<string, unknown>) {
  const threadId = typeof payload.threadId === "string" ? payload.threadId : "";
  if (!THREAD_IDS.includes(threadId)) throw new BadRequest();
  const body = requireText(payload.body, 1, 300);
  const { error } = await supabase
    .from("dm_messages")
    .insert({ device_id: deviceId, thread_id: threadId, sender: "me", body });
  if (error) throw new Error("insert failed");
  return { ok: true };
}

async function saveCalendarEvent(
  supabase: ReturnType<typeof createClient>,
  deviceId: string,
  payload: Record<string, unknown>,
) {
  const kind = typeof payload.kind === "string" ? payload.kind : "";
  if (!CALENDAR_KINDS.includes(kind)) throw new BadRequest();
  const { error } = await supabase.from("calendar_events").insert({
    device_id: deviceId,
    title: requireText(payload.title, 1, 40),
    event_date: requireDate(payload.event_date),
    start_time: optionalTime(payload.start_time),
    end_time: optionalTime(payload.end_time),
    place: optionalText(payload.place, 40),
    memo: optionalText(payload.memo, 200),
    kind,
    status: "scheduled",
  });
  if (error) throw new Error("insert failed");
  return { ok: true };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const deviceId = typeof body?.deviceId === "string" ? body.deviceId : "";
    if (!DEVICE_ID_PATTERN.test(deviceId)) {
      return json({ error: "잘못된 요청이에요." }, 400);
    }

    const payload = body?.payload && typeof body.payload === "object" ? body.payload : {};
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    switch (body?.action) {
      case "load":
        return json(await loadState(supabase, deviceId));
      case "sendDm":
        return json(await sendDm(supabase, deviceId, payload));
      case "saveCalendarEvent":
        return json(await saveCalendarEvent(supabase, deviceId, payload));
      case "saveState":
        return json(await saveState(supabase, deviceId, payload));
      default:
        return json({ error: "잘못된 요청이에요." }, 400);
    }
  } catch (error) {
    if (error instanceof BadRequest) {
      return json({ error: "잘못된 요청이에요." }, 400);
    }
    return json({ error: "요청을 처리하지 못했어요." }, 500);
  }
});
