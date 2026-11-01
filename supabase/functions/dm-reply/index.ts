import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const COMMON_RULES = `
- 한국어 반말로 말한다. 고등학생끼리의 실제 카톡처럼 자연스럽게 말한다.
- 한 번에 1~2문장만 쓴다. 긴 설명, 인사말, 감탄사 나열, 요약을 하지 않는다.
- 상대가 방금 한 말에 바로 반응한다. 질문에는 답하고, 묻지 않은 이야기는 꺼내지 않는다.
- 이모지, ^^, ㅠㅠ, ㅜㅜ는 절대 쓰지 않는다. ㅋㅋ는 어울릴 때만 짧게 쓴다.
- 모르는 사실은 지어내지 않는다. 모르면 모른다고 말한다.
- 지금 일정은 2026년 5월 말 축제 준비 기간이다. 장소와 시간은 이 설정을 벗어나지 않는다.
`;

const PERSONAS: Record<string, { prompt: string }> = {
  sanghyuk: {
    prompt: `너는 "상혁"이다. 가온고 1학년 3반이고 탁구부에 있다. 헬스장에 자주 가서 말수가 적고 담담하다.
- 상대(태산)에게 호감이 있지만 먼저 고백하거나 감정을 과하게 드러내지 않는다.
- 태산이 "누가 나를 보고 있었던 것 같다"고 했던 과거 상담 얘기는 먼저 꺼내지 않는다. 태산이 물으면 "지금은 자세히 말하기 어려워, 조금만 기다려 줄래" 식으로 답한다.
- 탁구부 복식 조는 상혁과 태산이 한 조로 발표되었다.
- 상혁은 메시지를 짧게 끊어서 보내는 편이다.` + COMMON_RULES,
  },
  donghyun: {
    prompt: `너는 "동현"이다. 1학년 3반이고 말이 많고 장난기가 많다. 상혁을 "형"이라고 부른다.
- 급식, 간식, 학교 소식 얘기를 좋아한다. 가끔 장난으로 놀리지만 상대가 불편해 보이면 바로 물러난다.
- 상혁 형이 최근 병원에 다녀왔다는 얘기를 알고 있다. 자세한 병명은 모른다.
- 탁구부 2조는 동현과 성호다. 지난 대회에서 졌다.` + COMMON_RULES,
  },
  jaehyun: {
    prompt: `너는 "재현"이다. 학생회 소속이고 축제 운영과 보컬 파트 준비를 함께 맡고 있다. 말투가 차분하고 정돈되어 있다.
- 회의 자료, 부스 배치, 공연 순서, 리허설 시간 얘기를 정확하게 한다.
- 축제 밴드 리허설은 5월 28일 18시부터 19시 30분까지 강당 무대에서 한다. 공연은 5월 29일 오후 3시다.
- 학생회 회의는 5월 27일이다. 말끝을 흐리지 않고 필요한 것만 말한다.` + COMMON_RULES,
  },
  seongho: {
    prompt: `너는 "성호"다. 학생회 소속으로 야간 정문 순찰을 맡고 있다. 말이 짧고 무뚝뚝하다.
- 정문 조명이 자주 나간다는 얘기를 자주 한다. 조명 점검은 5월 28일 19시에 정문 앞에서 한다.
- 동현과 같은 탁구부 2조다.
- 말을 길게 하지 않고 용건만 말한다.` + COMMON_RULES,
  },
};

type Turn = { from: "me" | "them"; text: string };

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

function cleanReply(raw: string) {
  return raw
    .replace(/\p{Extended_Pictographic}/gu, "")
    .replace(/\^\^|ㅠㅠ+|ㅜㅜ+/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .trim()
    .slice(0, 300);
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const threadId = typeof body?.threadId === "string" ? body.threadId : "";
    const history: unknown = body?.history;

    if (!PERSONAS[threadId] || !Array.isArray(history) || history.length < 1 || history.length > 30) {
      return json({ error: "잘못된 요청이에요." }, 400);
    }
    if (!history.every(isTurn)) {
      return json({ error: "잘못된 요청이에요." }, 400);
    }
    const turns = history as Turn[];
    if (turns[turns.length - 1].from !== "me") {
      return json({ error: "잘못된 요청이에요." }, 400);
    }

    const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
    if (!apiKey) {
      return json({ error: "AI 답장 설정이 아직 연결되지 않았어요." }, 500);
    }

    const aiResponse = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5",
        max_tokens: 300,
        system: PERSONAS[threadId].prompt,
        messages: toAnthropicMessages(turns),
      }),
    });
    if (!aiResponse.ok) {
      return json({ error: "답장을 만들지 못했어요. 잠시 후 다시 보내 주세요." }, 502);
    }

    const data = await aiResponse.json();
    const block = Array.isArray(data?.content) ? data.content.find((item: { type?: string }) => item.type === "text") : undefined;
    const reply = typeof block?.text === "string" ? cleanReply(block.text) : "";
    if (!reply) {
      return json({ error: "답장을 만들지 못했어요. 잠시 후 다시 보내 주세요." }, 502);
    }

    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { error } = await supabase.from("dm_messages").insert({ thread_id: threadId, sender: "them", body: reply });
    if (error) {
      return json({ error: "답장을 저장하지 못했어요." }, 500);
    }

    return json({ reply });
  } catch {
    return json({ error: "요청을 처리하지 못했어요." }, 500);
  }
});
