# Feedback Worker

Cloudflare Worker behind the feedback form (`/Feedback` on primaaestate.cloud and yujinpan.github.io).
It creates **public** issues in [PrimaAestate/feedback](https://github.com/PrimaAestate/feedback) through a GitHub App,
so no token is ever shipped to the browser.

| Route | |
|---|---|
| `POST /feedback` | multipart form: `app`, `summary?`, `description`, `cf-turnstile-response`, `website` (honeypot) → `{ ok, number, url }` |
| `GET /status?ids=1,2` | state of up to 20 issues **created by this App** (cached 60 s) |
| `GET /apps` | allowed app list (`src/apps.json`, keep in sync with `docs/data/apps.json`) |

Checks: CORS/Origin allowlist (`ALLOWED_ORIGINS`), Turnstile siteverify, per-IP Rate Limiting binding (3/min submit, 30/min status),
app allowlist, description 10–5000 chars, summary ≤120, request body ≤64 KB.
User text is stripped of `@mentions` and raw HTML. No email or other personal data is collected; the owner is notified by GitHub's own issue notifications.

## Notes

- If `GITHUB_APP_INSTALLATION_ID` is missing or rejected (404), the Worker looks up the App's installation on `GITHUB_OWNER` itself.
- `/status` only returns issues authored by `${GITHUB_APP_SLUG}[bot]`.

## Setup

```sh
cd worker && npm i
npx wrangler secret put TURNSTILE_SECRET            # Turnstile widget "primaaestate-feedback"
npx wrangler secret put GITHUB_APP_ID
npx wrangler secret put GITHUB_APP_INSTALLATION_ID
npx wrangler secret put GITHUB_APP_PRIVATE_KEY < app.private-key.pem   # PKCS#1 or PKCS#8 PEM
npx wrangler deploy                                  # custom domain feedback.primaaestate.cloud
```

Local dev: put the same names in `worker/.dev.vars` (git-ignored); `GITHUB_API=http://127.0.0.1:PORT` points at a mock.
Turnstile test secret `1x0000000000000000000000000000000AA` always passes.

## Attachments (removed for now)

Attachments were dropped because R2 is not enabled. The full implementation (type allowlist + magic bytes,
≤3 files / 5 MB each, random R2 keys, `GET /a/<key>/<name>` with sandboxed CSP, file picker in `Feedback.vue`)
is in commit `e4dba91` (branch feat/feedback-worker) of this repo's history. To re-add: enable R2, create the bucket, restore `storeFiles` /
`handleAttachment` / `TYPES` and the `r2_buckets` binding, raise `LIMITS.bodyBytes`, and restore the form's file input.
