# Security policy

## Scope and threat model

Cosmos Explorer is a static, no-login astronomy reference. It has no account, server-side user profile, API key, or intended collection of personal information. The main risks addressed here are script injection through URL query/hash input, unintended third-party requests, unsafe framing/object embedding, and privacy leakage through referrer headers. Catalog and attribution data are curated, trusted application content; the application uses `innerHTML` for that content and does **not** claim to sanitize arbitrary HTML. Do not insert API/user supplied text into those templates.

The local policy blocks inline JavaScript, plugins and base URL changes; removes remote font requests; and restricts fetchable resources to the same origin (with data images). `style-src 'unsafe-inline'` remains necessary for existing trusted inline style attributes and JavaScript-set styles. CSP is defense in depth, not a sanitizer or a security boundary for a compromised same-origin file.

## Reporting

Private vulnerability reporting was enabled and verified through GitHub on 2026-11-05. Use [Report a vulnerability](https://github.com/nvndy27/Cosmos-Explorer-Demo/security/advisories/new) for sensitive findings. If the option becomes unavailable, ask the owner through an already known private channel; do not publish exploit details in an issue. Do not send credentials, access tokens, personal information, or private user data in a report.

GitHub documentation: [Privately reporting a security vulnerability](https://docs.github.com/en/code-security/how-tos/report-and-fix-vulnerabilities/report-privately).
