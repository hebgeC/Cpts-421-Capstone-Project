# TRM.org Site Analysis

## Site Chart: trm.org (Tacoma Rescue Mission)

**Root platform:** `trm.org` → 301 redirects to `https://www.trm.org/` — **WordPress 7.1.2**, confirmed via `x-redirect-by: WordPress` header, `<meta name="generator" content="WordPress 7.1.2">`, and a live `/wp-json/` REST API. Server stack: **nginx**, WP Rocket caching (`x-rocket-nginx-serving-static`), fronted by a cache layer.

**Detected WP plugins/theme:**
- Theme: `trm-2022` (custom)
- **Elementor 4.2.3 + Elementor Pro 3.11.7** (page builder)
- **WooCommerce 11.0.1** (likely powers a small donation/merch checkout)
- **The Events Calendar** — exposes its own REST API: `https://www.trm.org/wp-json/tribe/events/v1/` ← **relevant to the app**, this is a cleaner data source than scraping HTML for events
- Jetpack, Form Maker, Forms for Campaign Monitor, ShareThis, Responsive Lightbox, Sticky Header Effects, Top Bar

### Site Tree

```
trm.org (WordPress)
│
├── About/
│   ├── /about/ , /stories/ , /inthenews/ , /leadership/
│   ├── /partners/ , /report/ (impact report)
│
├── What We Do/
│   ├── /what-we-do/, /emergency-services/, /recovery/, /graduation/
│   ├── /climbteam/, /employment-education/, /culinaryarts/
│   ├── /housing/, /veterans/, /youth/
│   ├── /streetoutreach/, /sandr/ (search & rescue)
│
├── Get Involved/
│   ├── /volunteer/  ──► EXTERNAL: rescue-mission.volunteerhub.com
│   ├── /inkind/ (donate items)
│   │       ├── EXTERNAL: Amazon Wishlist (a.co/606Ab7Z)
│   │       └── EXTERNAL: Formsite forms (fs27.formsite.com) — car donation, drive signup, receipt request
│   ├── /corporate/, /church/, /bridges/ (prayer team)
│   ├── /internship/, /communityservice/
│   ├── /events/  (The Events Calendar plugin; also has REST API + iCal/Google/Outlook feeds)
│
├── Donate/
│   └── /donate/  ──► EXTERNAL: support.trm.org (separate app, NOT WordPress)
│
├── Careers/
│   └── /careers/  ──► EXTERNAL: recruiting.paylocity.com (Paylocity ATS)
│
├── Contact/
│   └── /contact/, /needhelp/, /need-help/
│
├── Affiliate orgs (separate WordPress installs, same WP 7.1.2 version — likely same host/agency):
│   ├── missionthrifttacoma.org — WordPress 7.1.2 + Elementor 4.3.2
│   └── gnvlife.org (Good Neighbor Village) — WordPress 7.1.2
│
└── Social: Facebook, Twitter/X, Instagram (TacomaMission)
```

### External systems (not WordPress) and what they run on

| Site | Purpose | Platform / OS fingerprint |
|---|---|---|
| **rescue-mission.volunteerhub.com** | Volunteer sign-up/scheduling (linked from `/volunteer/`) | **VolunteerHub** (owned by Bloomerang). Headers show `Microsoft-IIS/10.0`, `X-AspNetMvc-Version: 5.3`, `X-AspNet-Version: 4.0.30319` → **Windows Server / IIS / ASP.NET (.NET Framework 4.0)**. Auth redirects to `id.bettergood.com` (Bloomerang's shared OpenID Connect identity provider) |
| **support.trm.org** | Donation portal ("Donor Portal Login") | **Fundraise Up** — inferred from CSP allowlist (`*.fundraiseup.com`, `stripe.com`, `paypal.com`, `hcaptcha.com`, `pay.google.com`). Served via **Cloudflare** (`server: cloudflare`), not WordPress. Payment processors behind it: Stripe, PayPal, Google Pay |
| **recruiting.paylocity.com** | Job applications (linked from `/careers/`) | **Paylocity Recruiting** SaaS (vendor-hosted ATS, no useful OS fingerprint to report — it's a locked-down third-party product) |
| **fs27.formsite.com** | Car donation form, drive signup, receipt request | **Formsite** SaaS form builder |
| **a.co / amazon.com** | Wishlist for in-kind donations | Amazon (irrelevant to fingerprint — fully proprietary) |
| **missionthrifttacoma.org** | Thrift store affiliate site | WordPress 7.1.2, same core version as trm.org |
| **gnvlife.org** | Good Neighbor Village affiliate | WordPress 7.1.2 |

### Why this matters for the app build

- `wp-json/tribe/events/v1/` on `www.trm.org` is a real REST endpoint that can be hit directly for events — this lines up with the `wpController.js`/`wpRoutes.js` and "event fetching" work already in the backend. General WP content (pages/posts) is also available at `www.trm.org/wp-json/wp/v2/`.
- **Volunteer sign-up (VolunteerHub) is a separate closed SaaS on IIS/.NET** — there's no public open REST API exposed here (it required a login/OpenID redirect), so the app almost certainly can't pull volunteer data directly; it would need to deep-link out to `rescue-mission.volunteerhub.com`, same as the website does.
- **Donations go through `support.trm.org` (Fundraise Up)**, not through WordPress/WooCommerce despite WooCommerce being installed on trm.org — so donation flows in the app should also deep-link to `support.trm.org`, not try to process anything itself.

---

## Mobile Rendering & WordPress Permissions Q&A

**Context:** Donating and volunteer signups go through external websites (VolunteerHub, Fundraise Up) and will look "scaled funny" embedded in a mobile app — accepted as a tradeoff. This section covers the rest of the content (About, Programs, Stories, Careers, Events, etc.).

### 1. Do the web pages need special handling to look right on the mobile app?

Elementor-built themes (like `trm-2022`) already ship responsive CSS breakpoints — the pages reflow for phone-width viewports in any browser, including a WebView. Before asking anyone for anything, check: open a couple of the pages that would be embedded (`/volunteer/`, `/about/`, `/donate/`) in Chrome DevTools' device toolbar at ~390px width. If they look reasonable, there's nothing to fix server-side — a WebView showing the live page will look like a normal mobile site because WordPress is already serving one.

### A. Do you even need permissions?

Depends on how the content is pulled into the app — two real options:

1. **WebView pointing at the live page** (`https://www.trm.org/about/` etc., rendered in-app) — this is just "the mobile-responsive website in a frame." Zero WordPress permissions needed, since nothing about WordPress is being changed; it's just displaying what it already outputs to any phone browser. The one thing this can't fix is their header/nav/footer chrome looking redundant inside an app (since the app already has its own nav) — a cosmetic tradeoff of the WebView approach, not something permissions would solve.

2. **REST API + native rendering** (`wp-json/wp/v2/pages` → grab the `content.rendered` HTML → render it in a native component with a custom stylesheet) — this is what the app is already doing for articles. Also zero WordPress permissions needed, since this is just reading public JSON and styling it entirely on the app side. This is the better fit for anything besides donate/volunteer, since it gives full control of layout instead of inheriting the site's chrome.

**Bottom line:** no permissions needed for either normal path. Permissions only become necessary if WordPress itself needs to detect "this request is from the app" and change its output (e.g., serve a stripped-down template with no header/footer/nav when it sees a special user-agent or `?app=1` param). That's a server-side behavior change, not something achievable from the app side alone.

### B. If server-side changes are wanted anyway, what to ask for

Ask whoever manages hosting/WP now for:

- **Role needed:** WordPress **Administrator** on trm.org (not just Editor — Editor can't install plugins or edit theme code, only content).
- **What would actually be touched:**
  - `wp-content/themes/trm-2022/functions.php` — to add a conditional check (user-agent sniff or a custom request header/param the app sends) that either (a) serves a different/minimal template, or (b) registers extra clean fields on the REST API response (e.g., content with nav/footer stripped, via `register_rest_field`).
  - A specific template file per content type if a dedicated "app" template is wanted (e.g., `page-app.php` or a template part with no header/footer include) — same theme directory.
  - Optionally, **plugin install access** if a pre-built solution is preferred instead of hand-editing `functions.php` (e.g., a "headless WordPress" or "REST API custom fields" plugin).
- **Also worth asking for regardless:** a **staging/dev copy of the site** (many hosts like WP Engine/Kinsta provide this by default) so any theme edits get tested before touching production — this matters more than the permission level itself, since editing `functions.php` directly on a live site with no rollback is the actual risk, not the access grant.

**Recommendation:** skip the server-side (B) route entirely unless actual visual problems turn up in step one. Pulling raw content via the REST API and styling it in-app sidesteps the whole permissions question and gives more control anyway.
