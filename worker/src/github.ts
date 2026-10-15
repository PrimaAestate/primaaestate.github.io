// GitHub App auth: RS256 JWT -> installation token (cached in isolate memory ~50 min).
export interface GhEnv {
  GITHUB_APP_ID: string;
  GITHUB_APP_INSTALLATION_ID: string;
  GITHUB_APP_PRIVATE_KEY: string;
  GITHUB_API?: string;
}

let cached: { token: string; exp: number } | null = null;

const b64url = (buf: ArrayBuffer | Uint8Array) => {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  let s = "";
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
};
const b64urlStr = (s: string) => b64url(new TextEncoder().encode(s));

function derLen(n: number): number[] {
  if (n < 0x80) return [n];
  const out: number[] = [];
  while (n > 0) {
    out.unshift(n & 0xff);
    n >>= 8;
  }
  return [0x80 | out.length, ...out];
}

function pkcs1ToPkcs8(pkcs1: Uint8Array): Uint8Array<ArrayBuffer> {
  const algId = [0x30, 0x0d, 0x06, 0x09, 0x2a, 0x86, 0x48, 0x86, 0xf7, 0x0d, 0x01, 0x01, 0x01, 0x05, 0x00];
  const version = [0x02, 0x01, 0x00];
  const octet = [0x04, ...derLen(pkcs1.length)];
  const inner = version.length + algId.length + octet.length + pkcs1.length;
  return new Uint8Array([0x30, ...derLen(inner), ...version, ...algId, ...octet, ...pkcs1]);
}

async function importKey(pem: string): Promise<CryptoKey> {
  const isPkcs1 = pem.includes("BEGIN RSA PRIVATE KEY");
  const body = pem.replace(/-----[^-]+-----/g, "").replace(/\\n/g, "").replace(/\s+/g, "");
  let der: Uint8Array<ArrayBuffer> = Uint8Array.from(atob(body), (c) => c.charCodeAt(0));
  if (isPkcs1) der = pkcs1ToPkcs8(der);
  return crypto.subtle.importKey(
    "pkcs8",
    der,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"],
  );
}

async function appJwt(env: GhEnv): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const head = b64urlStr(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const payload = b64urlStr(JSON.stringify({ iat: now - 60, exp: now + 540, iss: env.GITHUB_APP_ID }));
  const key = await importKey(env.GITHUB_APP_PRIVATE_KEY);
  const sig = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    key,
    new TextEncoder().encode(`${head}.${payload}`),
  );
  return `${head}.${payload}.${b64url(sig)}`;
}

const api = (env: GhEnv) => env.GITHUB_API || "https://api.github.com";
const headers = (token: string) => ({
  Authorization: `Bearer ${token}`,
  Accept: "application/vnd.github+json",
  "X-GitHub-Api-Version": "2022-11-28",
  "User-Agent": "primaaestate-feedback-worker",
});

let installationId: string | null = null;

// Installation id comes from GITHUB_APP_INSTALLATION_ID; if it is missing or wrong (404),
// fall back to looking up the App's installation on GITHUB_OWNER.
async function findInstallation(env: GhEnv & { GITHUB_OWNER?: string }, jwt: string): Promise<string> {
  const r = await fetch(`${api(env)}/app/installations`, { headers: headers(jwt) });
  if (!r.ok) throw new Error(`list installations: HTTP ${r.status}`);
  const list = (await r.json()) as { id: number; account: { login: string } }[];
  const hit = list.find((i) => !env.GITHUB_OWNER || i.account.login.toLowerCase() === env.GITHUB_OWNER.toLowerCase()) ;
  if (!hit) throw new Error("no installation for owner");
  return String(hit.id);
}

export async function installationToken(env: GhEnv & { GITHUB_OWNER?: string }): Promise<string> {
  if (cached && cached.exp - Date.now() > 10 * 60 * 1000) return cached.token;
  const jwt = await appJwt(env);
  const mint = (id: string) =>
    fetch(`${api(env)}/app/installations/${id}/access_tokens`, { method: "POST", headers: headers(jwt) });
  let id = installationId || String(env.GITHUB_APP_INSTALLATION_ID || "").trim();
  let res = id ? await mint(id) : null;
  if (!res || res.status === 404) {
    if (res) console.warn("installation id rejected (404); looking it up");
    id = await findInstallation(env, jwt);
    res = await mint(id);
  }
  if (!res.ok) throw new Error(`installation token: HTTP ${res.status}`);
  installationId = id;
  const j = (await res.json()) as { token: string; expires_at: string };
  cached = { token: j.token, exp: Date.parse(j.expires_at) };
  return j.token;
}

export async function gh(env: GhEnv, path: string, init: RequestInit = {}): Promise<Response> {
  const token = await installationToken(env);
  return fetch(`${api(env)}${path}`, {
    ...init,
    headers: { ...headers(token), ...(init.headers || {}) },
  });
}
