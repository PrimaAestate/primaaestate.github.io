import APPS from "./apps.json";
import { gh, type GhEnv } from "./github";

interface Env extends GhEnv {
  ALLOWED_ORIGINS: string;
  GITHUB_OWNER: string;
  GITHUB_REPO: string;
  PUBLIC_BASE_URL: string;
  NOTIFY_TO: string;
  NOTIFY_FROM: string;
  TURNSTILE_SECRET: string;
  ATTACHMENTS: R2Bucket;
  SUBMIT_LIMIT: RateLimit;
  STATUS_LIMIT: RateLimit;
  EMAIL?: SendEmail; // optional: Email Service send binding
}

const LIMITS = {
  summaryMax: 120,
  descMin: 10,
  descMax: 5000,
  versionMax: 40,
  emailMax: 254,
  files: 3,
  fileBytes: 5 * 1024 * 1024,
  totalBytes: 10 * 1024 * 1024,
  statusIds: 20,
};

// extension -> mime + magic-bytes check
const TYPES: Record<string, { mime: string; magic?: (b: Uint8Array) => boolean; inline: boolean }> = {
  png: { mime: "image/png", inline: true, magic: (b) => b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47 },
  jpg: { mime: "image/jpeg", inline: true, magic: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  jpeg: { mime: "image/jpeg", inline: true, magic: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  gif: { mime: "image/gif", inline: true, magic: (b) => b[0] === 0x47 && b[1] === 0x49 && b[2] === 0x46 },
  webp: { mime: "image/webp", inline: true, magic: (b) => ascii(b, 0, 4) === "RIFF" && ascii(b, 8, 12) === "WEBP" },
  heic: { mime: "image/heic", inline: false, magic: (b) => ascii(b, 4, 8) === "ftyp" },
  txt: { mime: "text/plain; charset=utf-8", inline: false },
  log: { mime: "text/plain; charset=utf-8", inline: false },
  zip: { mime: "application/zip", inline: false, magic: (b) => b[0] === 0x50 && b[1] === 0x4b && b[2] === 0x03 && b[3] === 0x04 },
};
const ascii = (b: Uint8Array, s: number, e: number) => String.fromCharCode(...b.slice(s, e));

const APP_BY_SLUG = new Map(APPS.map((a) => [a.slug, a.name]));

class HttpError extends Error {
  constructor(public status: number, public code: string, message?: string) {
    super(message || code);
  }
}

function cors(req: Request, env: Env): Record<string, string> {
  const origin = req.headers.get("Origin") || "";
  const allowed = env.ALLOWED_ORIGINS.split(",").map((s) => s.trim());
  const ok = allowed.includes(origin) || /^http:\/\/localhost:\d+$/.test(origin) && env.GITHUB_API !== undefined;
  return ok
    ? { "Access-Control-Allow-Origin": origin, "Access-Control-Allow-Methods": "GET, POST, OPTIONS", "Access-Control-Allow-Headers": "Content-Type", "Access-Control-Max-Age": "86400", Vary: "Origin" }
    : { Vary: "Origin" };
}

const json = (data: unknown, status = 200, extra: Record<string, string> = {}) =>
  new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json; charset=utf-8", ...extra } });

// Neutralize @mentions and stray HTML so user text can't ping people or inject markup.
const sanitize = (s: string) => s.replace(/\r\n?/g, "\n").replace(/@(?=[\w-])/g, "@\u200b").replace(/</g, "&lt;");
const oneLine = (s: string) => s.replace(/\s+/g, " ").trim();

async function verifyTurnstile(token: string, ip: string, env: Env): Promise<boolean> {
  if (!token || token.length > 2048) return false;
  const body = new FormData();
  body.append("secret", env.TURNSTILE_SECRET);
  body.append("response", token);
  if (ip) body.append("remoteip", ip);
  body.append("idempotency_key", crypto.randomUUID());
  const r = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", body });
  const j = (await r.json()) as { success: boolean; hostname?: string };
  return j.success === true;
}

interface Stored { url: string; name: string; size: number; type: string }

async function storeFiles(files: File[], env: Env): Promise<Stored[]> {
  if (files.length > LIMITS.files) throw new HttpError(400, "too_many_files");
  let total = 0;
  const prepared: { key: string; name: string; data: ArrayBuffer; t: (typeof TYPES)[string]; ext: string }[] = [];
  for (const f of files) {
    if (f.size === 0) continue;
    if (f.size > LIMITS.fileBytes) throw new HttpError(400, "file_too_large");
    total += f.size;
    if (total > LIMITS.totalBytes) throw new HttpError(400, "files_too_large");
    const ext = (f.name.split(".").pop() || "").toLowerCase();
    const t = TYPES[ext];
    if (!t) throw new HttpError(400, "file_type");
    const data = await f.arrayBuffer();
    const head = new Uint8Array(data.slice(0, 16));
    if (t.magic && !t.magic(head)) throw new HttpError(400, "file_type");
    if (!t.magic) {
      try { new TextDecoder("utf-8", { fatal: true, ignoreBOM: false }).decode(data); } catch { throw new HttpError(400, "file_type"); }
    }
    const safeName = f.name.replace(/[^\w.\-]+/g, "_").slice(-80) || `file.${ext}`;
    const id = crypto.randomUUID().replace(/-/g, "") + crypto.randomUUID().replace(/-/g, "").slice(0, 8);
    prepared.push({ key: `${id}/${safeName}`, name: safeName, data, t, ext });
  }
  const out: Stored[] = [];
  for (const p of prepared) {
    await env.ATTACHMENTS.put(p.key, p.data, { httpMetadata: { contentType: p.t.mime } });
    out.push({ url: `${env.PUBLIC_BASE_URL}/a/${p.key}`, name: p.name, size: p.data.byteLength, type: p.ext });
  }
  return out;
}

async function handleSubmit(req: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
  const ip = req.headers.get("CF-Connecting-IP") || "";
  const { success } = await env.SUBMIT_LIMIT.limit({ key: `submit:${ip}` });
  if (!success) throw new HttpError(429, "rate_limited");

  const len = Number(req.headers.get("Content-Length") || 0);
  if (len > LIMITS.totalBytes + 256 * 1024) throw new HttpError(413, "files_too_large");
  const ct = req.headers.get("Content-Type") || "";
  if (!ct.includes("multipart/form-data")) throw new HttpError(415, "bad_content_type");
  const form = await req.formData();
  const str = (k: string) => (typeof form.get(k) === "string" ? (form.get(k) as string) : "");

  if (str("website")) return json({ ok: true, number: 0 }); // honeypot: pretend success

  if (!(await verifyTurnstile(str("cf-turnstile-response"), ip, env))) throw new HttpError(403, "captcha");

  const app = str("app").trim();
  const appName = APP_BY_SLUG.get(app);
  if (!appName) throw new HttpError(400, "app");
  const description = str("description").trim();
  if (description.length < LIMITS.descMin || description.length > LIMITS.descMax) throw new HttpError(400, "description");
  let summary = oneLine(str("summary"));
  if (summary.length > LIMITS.summaryMax) throw new HttpError(400, "summary");
  if (!summary) summary = oneLine(description).slice(0, 80) + (oneLine(description).length > 80 ? "…" : "");
  const version = oneLine(str("version")).slice(0, LIMITS.versionMax);
  const email = str("email").trim();
  if (email && (email.length > LIMITS.emailMax || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))) throw new HttpError(400, "email");

  const files = form.getAll("files").filter((f): f is File => typeof f !== "string");
  const stored = await storeFiles(files, env);

  const body = [
    sanitize(description),
    "",
    "---",
    `**App:** ${appName}${version ? ` · **Version:** ${sanitize(version)}` : ""}`,
    stored.length
      ? "**Attachments:**\n" + stored.map((s) => (TYPES[s.type].inline ? `- ![${s.name}](${s.url})` : `- [${s.name}](${s.url}) (${Math.ceil(s.size / 1024)} KB)`)).join("\n")
      : "",
    "",
    "<sub>Submitted via the feedback form on primaaestate.cloud.</sub>",
  ].filter((l) => l !== null).join("\n");

  const res = await gh(env, `/repos/${env.GITHUB_OWNER}/${env.GITHUB_REPO}/issues`, {
    method: "POST",
    body: JSON.stringify({ title: `[${appName}] ${sanitize(summary)}`, body }),
  });
  if (!res.ok) {
    console.error("create issue failed", res.status);
    throw new HttpError(502, "upstream");
  }
  const issue = (await res.json()) as { number: number; html_url: string };

  if (env.EMAIL) {
    ctx.waitUntil(
      env.EMAIL.send({
        from: { email: env.NOTIFY_FROM, name: "Prima Aestate Feedback" },
        to: env.NOTIFY_TO,
        ...(email ? { replyTo: email } : {}),
        subject: `Feedback #${issue.number}: [${appName}] ${summary}`,
        text: [
          `New feedback #${issue.number}: ${issue.html_url}`,
          `App: ${appName}${version ? ` ${version}` : ""}`,
          `Contact email: ${email || "(not provided)"}`,
          `Country: ${(req as any).cf?.country || "?"}`,
          `Page: ${req.headers.get("Referer") || "?"}`,
          `User-Agent: ${req.headers.get("User-Agent") || "?"}`,
          "",
          description,
          "",
          ...stored.map((s) => `Attachment: ${s.url}`),
        ].join("\n"),
      }).then(() => {}, (e: any) => console.error("notify email failed", e?.code, e?.message)),
    );
  }
  return json({ ok: true, number: issue.number, url: issue.html_url });
}

async function handleStatus(req: Request, url: URL, env: Env, ctx: ExecutionContext): Promise<Response> {
  const ip = req.headers.get("CF-Connecting-IP") || "";
  const { success } = await env.STATUS_LIMIT.limit({ key: `status:${ip}` });
  if (!success) throw new HttpError(429, "rate_limited");
  const ids = [...new Set((url.searchParams.get("ids") || "").split(",").map((s) => s.trim()).filter((s) => /^\d{1,7}$/.test(s)))]
    .slice(0, LIMITS.statusIds).sort((a, b) => +a - +b);
  if (!ids.length) throw new HttpError(400, "ids");

  const cache = caches.default;
  const cacheKey = new Request(`${env.PUBLIC_BASE_URL}/status?ids=${ids.join(",")}`);
  const hit = await cache.match(cacheKey);
  if (hit) return new Response(hit.body, hit);

  const issues = await Promise.all(
    ids.map(async (n) => {
      const r = await gh(env, `/repos/${env.GITHUB_OWNER}/${env.GITHUB_REPO}/issues/${n}`);
      if (!r.ok) return null;
      const i = (await r.json()) as any;
      // only expose issues this App created (not arbitrary repo issues / PRs)
      if (i.pull_request || !i.performed_via_github_app || String(i.performed_via_github_app.id) !== String(env.GITHUB_APP_ID)) return null;
      return { number: i.number, title: i.title, state: i.state, state_reason: i.state_reason, comments: i.comments, created_at: i.created_at, updated_at: i.updated_at, closed_at: i.closed_at, url: i.html_url };
    }),
  );
  const resp = json({ issues: issues.filter(Boolean) }, 200, { "Cache-Control": "public, max-age=60" });
  ctx.waitUntil(cache.put(cacheKey, resp.clone()));
  return resp;
}

async function handleAttachment(path: string, env: Env): Promise<Response> {
  const key = path.slice(3);
  if (!/^[a-f0-9]{40}\/[\w.\-]{1,80}$/.test(key)) return new Response("Not found", { status: 404 });
  const obj = await env.ATTACHMENTS.get(key);
  if (!obj) return new Response("Not found", { status: 404 });
  const ext = (key.split(".").pop() || "").toLowerCase();
  const t = TYPES[ext];
  const h = new Headers();
  h.set("Content-Type", t?.mime || "application/octet-stream");
  h.set("Content-Disposition", `${t?.inline ? "inline" : "attachment"}; filename="${key.split("/")[1]}"`);
  h.set("X-Content-Type-Options", "nosniff");
  h.set("Content-Security-Policy", "default-src 'none'; img-src 'self'; sandbox");
  h.set("Cache-Control", "public, max-age=31536000, immutable");
  h.set("ETag", obj.httpEtag);
  return new Response(obj.body, { headers: h });
}

export default {
  async fetch(req, env, ctx): Promise<Response> {
    const url = new URL(req.url);
    const c = cors(req, env);
    if (req.method === "OPTIONS") return new Response(null, { status: c["Access-Control-Allow-Origin"] ? 204 : 403, headers: c });
    try {
      let res: Response;
      if (req.method === "POST" && url.pathname === "/feedback") {
        if (!c["Access-Control-Allow-Origin"]) throw new HttpError(403, "origin");
        res = await handleSubmit(req, env, ctx);
      } else if (req.method === "GET" && url.pathname === "/status") {
        res = await handleStatus(req, url, env, ctx);
      } else if (req.method === "GET" && url.pathname.startsWith("/a/")) {
        return handleAttachment(url.pathname, env);
      } else if (req.method === "GET" && url.pathname === "/apps") {
        res = json(APPS, 200, { "Cache-Control": "public, max-age=3600" });
      } else {
        res = json({ ok: false, error: "not_found" }, 404);
      }
      const out = new Response(res.body, res);
      for (const [k, v] of Object.entries(c)) out.headers.set(k, v);
      return out;
    } catch (e) {
      const status = e instanceof HttpError ? e.status : 500;
      const code = e instanceof HttpError ? e.code : "internal";
      if (!(e instanceof HttpError)) console.error("unhandled", (e as Error)?.message);
      return json({ ok: false, error: code }, status, c);
    }
  },
} satisfies ExportedHandler<Env>;
