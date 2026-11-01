import { createClient } from "npm:@supabase/supabase-js@2";
import {
  BACKUP_LINES,
  BLOCKED_REPLY,
  BLOCKED_TOPIC_PATTERN,
  COMMON_RULES,
  PERSONAS,
  REVEALABLE_CLUES,
} from "./personas.ts";
import { callbacks } from "./callbacks.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const DEVICE_ID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MINUTE_LIMIT = 6;
const DAY_LIMIT = 80;
const DAY_MINUTES = 1440;
const CALLBACK_KEYS = Object.keys(callbacks) as (keyof typeof callbacks)[];

const REPLY_TOOL = {
  name: "reply",
  description: "지금 대화하는 인물의 답장을 말풍선 단위로 보낸다. 반드시 이 도구로만 답한다.",
  input_schema: {
    type: "object",
    properties: {
      messages: {
        type: "array",
        minItems: 1,
        maxItems: 3,
        items: {
          type: "object",
          properties: {
            text: { type: "string", maxLength: 120 },
            delay_min: { type: "integer", minimum: 0, maximum: 180 },
            unsend_after_min: { type: ["integer", "null"], minimum: 1, maximum: 30 },
            typing_cycles: { type: "integer", minimum: 0, maximum: 3 },
          },
          required: ["text", "delay_min", "unsend_after_min", "typing_cycles"],
        },
      },
      effects: {
        type: "object",
        properties: {
          trust: { type: "integer", minimum: -8, maximum: 8 },
          courage: { type: "integer", minimum: -8, maximum: 8 },
          rumor: { type: "integer", minimum: -5, maximum: 10 },
        },
        required: ["trust", "courage", "rumor"],
      },
      reveal: { type: "array", items: { type: "string" } },
      read_now: { type: "boolean" },
      mood: { type: "string", enum: ["shy", "calm", "tease", "cold", "warm"] },
    },
    required: ["messages", "effects", "reveal", "read_now", "mood"],
  },
};

type Turn = { from: "me" | "them"; text: string };
type RunState = {
  t: number;
  battery: number;
  mind: number;
  rumor: number;
  clues: string[];
  morning?: { erasedThrice: boolean; dndNight: boolean };
};
type ReplyMessage = { text: string; delay_min: number; unsend_after_min: number | null; typing_cycles: number };
type Reply = {
  messages: ReplyMessage[];
  effects: { trust: number; courage: number; rumor: number };
  reveal: string[];
  read_now: boolean;
  mood: string;
};

const ZERO_EFFECTS = { trust: 0, courage: 0, rumor: 0 };

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function isTurn(value: unknown): value is Turn {
  if (!value || typeof value !== "object") return false;
  const turn = value as Record<string, unknown>;
  return (turn.from === "me" || turn.from === "them") &&
    typeof turn.text === "string" && turn.text.trim().length >= 1 && turn.text.length <= 300;
}

function toAnthropicMessages(history: Turn[]) {
  const messages: { role: "user" | "assistant"; content: string }[] = [];
  for (const turn of history) {
    const role = turn.from === "me" ? "user" : "assistant";
    const last = messages[messages.length - 1];
    if (last && last.role === role) {
      last.content += `\n${turn.text}`;
    } else {
      messages.push({ role, content: turn.text });
    }
  }
  while (messages.length && messages[0].role === "assistant") messages.shift();
  return messages;
}

function cleanText(raw: string) {
  return raw
    .replace(/\p{Extended_Pictographic}/gu, "")
    .replace(/\^\^|ㅠㅠ+|ㅜㅜ+/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .trim()
    .slice(0, 120);
}

function clampInt(value: unknown, min: number, max: number): number | null {
  if (typeof value !== "number" || !Number.isFinite(value)) return null;
  return Math.min(max, Math.max(min, Math.round(value)));
}

function parseReply(input: unknown, threadId: string, run: RunState): Reply | null {
  if (!input || typeof input !== "object") return null;
  const raw = input as Record<string, unknown>;
  if (!Array.isArray(raw.messages) || raw.messages.length < 1 || raw.messages.length > 3) return null;

  const messages: ReplyMessage[] = [];
  for (const item of raw.messages) {
    if (!item || typeof item !== "object") return null;
    const m = item as Record<string, unknown>;
    const text = typeof m.text === "string" ? cleanText(m.text) : "";
    const delay = clampInt(m.delay_min, 0, 180);
    const typing = clampInt(m.typing_cycles, 0, 3);
    const unsend = m.unsend_after_min === null ? null : clampInt(m.unsend_after_min, 1, 30);
    if (!text || delay === null || typing === null || (m.unsend_after_min !== null && unsend === null)) return null;
    messages.push({ text, delay_min: delay, unsend_after_min: unsend, typing_cycles: typing });
  }

  const effects = raw.effects && typeof raw.effects === "object" ? raw.effects as Record<string, unknown> : {};
  const trust = clampInt(effects.trust, -8, 8);
  const courage = clampInt(effects.courage, -8, 8);
  const rumor = clampInt(effects.rumor, -5, 10);
  if (trust === null || courage === null || rumor === null) return null;

  const allowed = (REVEALABLE_CLUES[threadId] ?? []).filter((id) => run.clues.includes(id));
  const reveal = Array.isArray(raw.reveal)
    ? raw.reveal.filter((id): id is string => typeof id === "string" && allowed.includes(id))
    : [];

  return {
    messages,
    effects: { trust, courage, rumor },
    reveal,
    read_now: raw.read_now === true,
    mood: typeof raw.mood === "string" ? raw.mood : "calm",
  };
}

function bandOf(value: number, low: number, high: number) {
  if (value < low) return "낮음";
  if (value < high) return "보통";
  return "높음";
}

function stateBlock(run: RunState, threadId: string) {
  const day = Math.floor(run.t / DAY_MINUTES);
  const minute = run.t % DAY_MINUTES;
  const date = new Date(Date.UTC(2026, 9, 13 + day)).toISOString().slice(0, 10);
  const hh = String(Math.floor(minute / 60)).padStart(2, "0");
  const mm = String(minute % 60).padStart(2, "0");
  const revealOk = (REVEALABLE_CLUES[threadId] ?? []).filter((id) => run.clues.includes(id));
  return `<state>
날짜: ${date} (D${day + 1})
시각: ${hh}:${mm}
배터리: ${Math.round(run.battery)}%
상대 마음: ${bandOf(run.mind, 30, 70)}
소문 수준: ${bandOf(run.rumor, 20, 50)}
revealOk: ${JSON.stringify(revealOk)}
</state>`;
}

function backupReply(threadId: string) {
  const lines = BACKUP_LINES[threadId] ?? [];
  const text = lines[Math.floor(Math.random() * lines.length)] ?? "…";
  return {
    messages: [{ text, delay_min: 0, unsend_after_min: null, typing_cycles: 0 }],
    effects: ZERO_EFFECTS,
    reveal: [],
    read_now: false,
    mood: "calm",
  };
}

async function loadRun(supabase: ReturnType<typeof createClient>, deviceId: string): Promise<RunState | null> {
  const { data, error } = await supabase.from("game_state").select("run").eq("device_id", deviceId).maybeSingle();
  if (error) throw new Error("state failed");
  const run = data?.run;
  if (!run || typeof run.t !== "number") return null;
  return run as RunState;
}

async function consumeRateLimit(supabase: ReturnType<typeof createClient>, key: string, windowStart: string, limit: number) {
  const { data, error } = await supabase.rpc("consume_rate_limit", { p_key: key, p_window: windowStart, p_limit: limit });
  if (error) throw error;
  return data === true;
}

async function isWithinLimits(supabase: ReturnType<typeof createClient>, deviceId: string) {
  const now = Date.now();
  const minuteStart = new Date(Math.floor(now / 60000) * 60000).toISOString();
  const dayStart = new Date(Math.floor(now / 86400000) * 86400000).toISOString();
  const globalCap = Number(Deno.env.get("GLOBAL_DAILY_CAP")) || 3000;
  return (await consumeRateLimit(supabase, `minute:${deviceId}`, minuteStart, MINUTE_LIMIT)) &&
    (await consumeRateLimit(supabase, `day:${deviceId}`, dayStart, DAY_LIMIT)) &&
    (await consumeRateLimit(supabase, "global", dayStart, globalCap));
}

async function requestClaudeReply(history: Turn[], system: string): Promise<unknown | null> {
  const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
  if (!apiKey) return null;
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: Deno.env.get("ANTHROPIC_MODEL") ?? "claude-haiku-5-5",
      max_tokens: 600,
      system,
      messages: toAnthropicMessages(history),
      tools: [REPLY_TOOL],
      tool_choice: { type: "tool", name: "reply" },
    }),
  });
  if (!response.ok) return null;
  const data = await response.json();
  const block = Array.isArray(data?.content)
    ? data.content.find((item: { type?: string; name?: string }) => item.type === "tool_use" && item.name === "reply")
    : undefined;
  return block?.input ?? null;
}

async function insertThemMessages(
  supabase: ReturnType<typeof createClient>,
  deviceId: string,
  threadId: string,
  now: number,
  messages: ReplyMessage[],
) {
  let offset = 0;
  const rows = messages.map((m) => {
    offset += m.delay_min;
    return {
      device_id: deviceId,
      thread_id: threadId,
      sender: "them",
      body: m.text,
      status: "delivered",
      deliver_at: now + offset,
      unsend_after_min: m.unsend_after_min,
      typing_cycles: m.typing_cycles,
    };
  });
  const { error } = await supabase.from("dm_messages").insert(rows);
  if (error) throw new Error("insert failed");
}

async function markMyMessagesRead(supabase: ReturnType<typeof createClient>, deviceId: string, threadId: string, now: number) {
  const { error } = await supabase
    .from("dm_messages")
    .update({ status: "read", read_at: now })
    .eq("device_id", deviceId)
    .eq("thread_id", threadId)
    .eq("sender", "me")
    .eq("status", "sent")
    .lte("deliver_at", now);
  if (error) throw new Error("update failed");
}

async function deliverCallback(supabase: ReturnType<typeof createClient>, deviceId: string, key: string, run: RunState) {
  const callback = callbacks[key as keyof typeof callbacks];
  const eligible = run.morning?.[key as keyof typeof run.morning] === true;
  if (!eligible) return { delivered: false };

  const { data, error } = await supabase
    .from("dm_messages")
    .select("id")
    .eq("device_id", deviceId)
    .eq("thread_id", "sanghyuk")
    .eq("sender", "them")
    .eq("body", callback.text)
    .limit(1);
  if (error) throw new Error("load failed");
  if ((data ?? []).length > 0) return { delivered: false };

  const { error: insertError } = await supabase.from("dm_messages").insert({
    device_id: deviceId,
    thread_id: "sanghyuk",
    sender: "them",
    body: callback.text,
    status: "delivered",
    deliver_at: run.t,
  });
  if (insertError) throw new Error("insert failed");
  return { delivered: true, text: callback.text, mindDelta: callback.mindDelta };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const deviceId = typeof body?.deviceId === "string" ? body.deviceId : "";
    const threadId = typeof body?.threadId === "string" ? body.threadId : "";
    const history: unknown = body?.history;

    if (!DEVICE_ID_PATTERN.test(deviceId)) {
      return json({ error: "잘못된 요청이에요." }, 400);
    }

    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    if (typeof body?.callback === "string") {
      if (!CALLBACK_KEYS.includes(body.callback)) return json({ error: "잘못된 요청이에요." }, 400);
      const run = await loadRun(supabase, deviceId);
      if (!run) return json({ error: "게임 상태를 찾을 수 없어요." }, 409);
      return json(await deliverCallback(supabase, deviceId, body.callback, run));
    }

    if (!PERSONAS[threadId] || !Array.isArray(history) || history.length < 1 || history.length > 30) {
      return json({ error: "잘못된 요청이에요." }, 400);
    }
    if (!history.every(isTurn)) {
      return json({ error: "잘못된 요청이에요." }, 400);
    }
    const turns = history as Turn[];
    const lastTurn = turns[turns.length - 1];
    if (lastTurn.from !== "me") {
      return json({ error: "잘못된 요청이에요." }, 400);
    }

    const run = await loadRun(supabase, deviceId);
    if (!run) return json({ error: "게임 상태를 찾을 수 없어요." }, 409);

    if (!(await isWithinLimits(supabase, deviceId))) {
      return json({ error: "요청이 너무 많아요. 잠시 후 다시 보내 주세요." }, 429);
    }

    if (BLOCKED_TOPIC_PATTERN.test(lastTurn.text)) {
      const reply: Reply = {
        messages: [{ text: BLOCKED_REPLY, delay_min: 0, unsend_after_min: null, typing_cycles: 0 }],
        effects: ZERO_EFFECTS,
        reveal: [],
        read_now: false,
        mood: "cold",
      };
      await insertThemMessages(supabase, deviceId, threadId, run.t, reply.messages);
      return json({ ...reply, fallback: false });
    }

    const system = `${PERSONAS[threadId]}\n\n${COMMON_RULES}\n\n${stateBlock(run, threadId)}\n\n반드시 reply 도구를 한 번 호출해 답한다.`;
    const toolInput = await requestClaudeReply(turns, system).catch(() => null);
    const parsed = toolInput ? parseReply(toolInput, threadId, run) : null;

    const reply: Reply & { fallback: boolean } = parsed
      ? { ...parsed, fallback: false }
      : { ...backupReply(threadId), fallback: true };

    await insertThemMessages(supabase, deviceId, threadId, run.t, reply.messages);
    if (reply.read_now) await markMyMessagesRead(supabase, deviceId, threadId, run.t);

    return json(reply);
  } catch {
    return json({ error: "요청을 처리하지 못했어요." }, 500);
  }
});
