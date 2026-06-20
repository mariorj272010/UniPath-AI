import { NextResponse } from "next/server";
import http from "node:http";
import knowledge from "@/lib/knowledge.json";
import { normalizeAnalysis, type Profile } from "@/lib/analysis";
import { SYSTEM_PROMPT, buildProfileText, buildUserContent } from "@/lib/prompt";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 800;

const HOST = (process.env.OLLAMA_BASE_URL || "http://localhost:11434").replace(
  /\/v1\/?$/,
  ""
);
const MODEL = process.env.OLLAMA_MODEL || "unipath-cpu";
// Keep the model resident in RAM between requests so users don't pay the
// multi-minute cold-load penalty on every analysis.
const KEEP_ALIVE = "30m";

/** Pull the first balanced JSON object out of a string (handles stray prose). */
function extractJson(text: string): string | null {
  const start = text.indexOf("{");
  if (start === -1) return null;
  let depth = 0;
  let inStr = false;
  let esc = false;
  for (let i = start; i < text.length; i++) {
    const ch = text[i];
    if (inStr) {
      if (esc) esc = false;
      else if (ch === "\\") esc = true;
      else if (ch === '"') inStr = false;
    } else if (ch === '"') inStr = true;
    else if (ch === "{") depth++;
    else if (ch === "}") {
      depth--;
      if (depth === 0) return text.slice(start, i + 1);
    }
  }
  return null;
}

type ChatResult = { status: number; content: string; errorText: string };

/**
 * Call Ollama's /api/chat with streaming, using Node's raw http client.
 *
 * Why not `fetch`? A CPU model can take several minutes before the first token
 * (cold load + prompt eval). Node's global `fetch` (undici) enforces a
 * headers/body timeout that fires long before that and surfaces as a misleading
 * "could not reach" error. `http.request` has no such timeout, and streaming
 * means we start receiving data as soon as the model produces its first token —
 * so generation length can never trip a timeout.
 */
function ollamaChat(payload: object): Promise<ChatResult> {
  return new Promise((resolve, reject) => {
    const u = new URL(`${HOST}/api/chat`);
    const data = JSON.stringify(payload);
    const req = http.request(
      {
        hostname: u.hostname,
        port: u.port || 80,
        path: u.pathname,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(data),
        },
      },
      (res) => {
        const ok = res.statusCode === 200;
        res.setEncoding("utf8");
        let buf = "";
        let content = "";
        let raw = "";
        const consume = (line: string) => {
          const t = line.trim();
          if (!t) return;
          try {
            const o = JSON.parse(t) as { message?: { content?: string } };
            if (o.message?.content) content += o.message.content;
          } catch {
            /* ignore non-JSON keep-alive lines */
          }
        };
        res.on("data", (chunk: string) => {
          if (!ok) {
            raw += chunk; // non-200: collect the error body verbatim
            return;
          }
          buf += chunk;
          let nl: number;
          while ((nl = buf.indexOf("\n")) >= 0) {
            consume(buf.slice(0, nl));
            buf = buf.slice(nl + 1);
          }
        });
        res.on("end", () => {
          if (ok) consume(buf);
          resolve({ status: res.statusCode ?? 0, content, errorText: raw });
        });
      }
    );
    req.on("error", reject);
    req.write(data);
    req.end();
  });
}

export async function POST(req: Request) {
  let profile: Profile;
  try {
    profile = (await req.json()) as Profile;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const profileText = buildProfileText(profile);
  const userContent = buildUserContent(profileText, knowledge);

  let result: ChatResult;
  try {
    result = await ollamaChat({
      model: MODEL,
      stream: true,
      format: "json",
      keep_alive: KEEP_ALIVE,
      options: { temperature: 0.3, num_ctx: 8192 },
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userContent },
      ],
    });
  } catch {
    return NextResponse.json(
      {
        error: `Could not reach the local AI engine at ${HOST}. Make sure Ollama is running (\`ollama serve\`) and the model "${MODEL}" exists (\`ollama list\`).`,
        code: "OLLAMA_UNREACHABLE",
      },
      { status: 503 }
    );
  }

  if (result.status !== 200) {
    return NextResponse.json(
      {
        error: `The AI engine returned an error (HTTP ${result.status}). Verify the model "${MODEL}" is installed. ${result.errorText.slice(0, 300)}`,
        code: "OLLAMA_ERROR",
      },
      { status: 502 }
    );
  }

  const content = result.content;

  let parsed: Record<string, unknown> | null = null;
  try {
    parsed = JSON.parse(content);
  } catch {
    const slice = extractJson(content);
    if (slice) {
      try {
        parsed = JSON.parse(slice);
      } catch {
        parsed = null;
      }
    }
  }

  if (!parsed) {
    return NextResponse.json(
      {
        error: "The AI returned a response we couldn't parse. Please try again.",
        code: "PARSE_ERROR",
        raw: content.slice(0, 1000),
      },
      { status: 502 }
    );
  }

  const analysis = normalizeAnalysis(parsed);
  return NextResponse.json({ analysis });
}

export async function GET() {
  // Lightweight health check used to verify the engine is reachable, and to
  // WARM the model: we fire a tiny generation (fire-and-forget) so the heavy
  // cold-load happens while the user is still filling in the onboarding form,
  // not when they submit it.
  try {
    const r = await fetch(`${HOST}/api/tags`, { cache: "no-store" });
    const ok = r.ok;
    const body = ok ? ((await r.json()) as { models?: { name: string }[] }) : null;
    const hasModel = !!body?.models?.some((m) => m.name.startsWith(MODEL));

    if (ok && hasModel) {
      // Don't await — return the health status immediately while the model loads.
      ollamaChat({
        model: MODEL,
        stream: true,
        keep_alive: KEEP_ALIVE,
        options: { num_ctx: 8192 },
        messages: [{ role: "user", content: "ok" }],
      }).catch(() => {});
    }

    return NextResponse.json({ ok, host: HOST, model: MODEL, hasModel });
  } catch {
    return NextResponse.json({ ok: false, host: HOST, model: MODEL, hasModel: false });
  }
}
