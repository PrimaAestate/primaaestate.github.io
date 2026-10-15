import APPS from "./apps.json";
import { gh, type GhEnv } from "./github";

interface Env extends GhEnv {
  ALLOWED_ORIGINS: string;
  GITHUB_OWNER: string;
  GITHUB_REPO: string;
  GITHUB_APP_SLUG: string;
  PUBLIC_BASE_URL: string;
  TURNSTILE_SECRET: string;
  SUBMIT_LIMIT: RateLimit;
  STATUS_LIMIT: RateLimit;
}

const LIMITS = {
  summaryMax: 120,
  descMin: 10,
  descMax: 5000,
  versionMax: 40,
  bodyBytes: 64 * 1024,
  statusIds: 20,
};

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

async function handleSubmit(req: Request, env: Env): Promise<Response> {
  const ip = req.headers.get("CF-Connecting-IP") || "";
  const { success } = await env.SUBMIT_LIMIT.limit({ key: `submit:${ip}` });
  if (!success) throw new HttpError(429, "rate_limited");

  const len = Number(req.headers.get("Content-Length") || 0);
  if (len > LIMITS.bodyBytes) throw new HttpError(413, "too_large");
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

  // Attachments were removed (no R2). To re-add: see worker/README.md.

  const body = [
    sanitize(description),
    "",
    "---",
    `**App:** ${appName}${version ? ` · **Version:** ${sanitize(version)}` : ""}`,
    "",
    "<sub>Submitted via the feedback form on primaaestate.cloud.</sub>",
  ].join("\n");

  const res = await gh(env, `/repos/${env.GITHUB_OWNER}/${env.GITHUB_REPO}/issues`, {
    method: "POST",
    body: JSON.stringify({ title: `[${appName}] ${sanitize(summary)}`, body }),
  });
  if (!res.ok) {
    console.error("create issue failed", res.status);
    throw new HttpError(502, "upstream");
  }
  const issue = (await res.json()) as { number: number; html_url: string };

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
      if (i.pull_request || i.user?.type !== "Bot" || i.user?.login !== `${env.GITHUB_APP_SLUG}[bot]`) return null;
      return { number: i.number, title: i.title, state: i.state, state_reason: i.state_reason, comments: i.comments, created_at: i.created_at, updated_at: i.updated_at, closed_at: i.closed_at, url: i.html_url };
    }),
  );
  const resp = json({ issues: issues.filter(Boolean) }, 200, { "Cache-Control": "public, max-age=60" });
  ctx.waitUntil(cache.put(cacheKey, resp.clone()));
  return resp;
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
        res = await handleSubmit(req, env);
      } else if (req.method === "GET" && url.pathname === "/status") {
        res = await handleStatus(req, url, env, ctx);
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
