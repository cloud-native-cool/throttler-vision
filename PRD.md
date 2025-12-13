# Product Requirements Document (PRD)
## Cloud API Rate Limit Calculator

---

## 1. Executive Summary

**Product Name:** Throttler-Vision

**Vision:** A sleek, web-native tool that helps developers and platform engineers understand, visualize, and plan around cloud service provider (CSP) API rate limits—before they hit them in production.

**The Problem:** When you're building automation, infrastructure-as-code pipelines, or orchestration tools, you're essentially having a conversation with cloud APIs. Each CSP has different rate limits, quotas, and throttling behaviors—and they're scattered across dozens of documentation pages. Hitting these limits unexpectedly is like running into an invisible wall at full speed.

**The Solution:** A single interface where you can select services, see their limits, calculate theoretical throughput for your use case, and visualize how your planned operations stack up against those constraints.

---

## 2. Goals & Success Metrics

### Primary Goals

| Goal | Description |
|------|-------------|
| **Reduce planning friction** | Developers can answer "will my batch job get throttled?" in under 2 minutes |
| **Single source of truth** | Consolidate rate limit info from AWS, GCP, and Azure in one place |
| **Web-native experience** | Fast, responsive, works offline where possible, no backend required for core calculations |

### Success Metrics (Post-Launch)

- Time to first meaningful result < 30 seconds
- User can calculate limits for 3+ services without page reload
- Rate limit data freshness < 7 days from CSP source

---

## 3. User Personas

### Primary: Platform Engineer (that's you!)

- Building internal tooling that orchestrates cloud resources
- Needs to know: "If I spin up 500 VMs programmatically, will I get throttled?"
- Uses Go SDK primarily, occasionally Python
- Values precision and authoritative sources

### Secondary: SRE / DevOps Engineer

- Debugging why a deployment pipeline is failing intermittently
- Needs quick lookup: "What's the rate limit for EC2 DescribeInstances?"
- Wants to export findings for incident reports

---

## 4. Feature Requirements

### 4.1 Core Features (MVP)

#### F1: Service Selector

**Description:** Multi-select interface for choosing cloud services across providers.

| Attribute | Requirement |
|-----------|-------------|
| Providers | AWS, GCP, Azure (MVP: AWS + GCP) |
| Services | Compute, Database, Storage, Networking (expandable) |
| SDK Context | Filter/display limits relevant to specific SDK (Go, Python, etc.) |
| UX | Searchable, categorized, with provider logos |

**User Flow:**
```
[Select Provider] → [Search/Browse Services] → [Add to Calculation]
```

#### F2: Rate Limit Data Engine

**Description:** The brain that fetches and normalizes rate limit data from official sources.

| Attribute | Requirement |
|-----------|-------------|
| Data Sources | Official CSP documentation, API metadata where available |
| Freshness | Automated refresh weekly, manual refresh on-demand |
| Normalization | Unified schema: `requests/second`, `requests/minute`, `burst capacity`, `quota type` |
| SDK Awareness | Tag limits with SDK-specific behaviors (e.g., Go SDK retry defaults) |

**Think of it like this:** Each CSP speaks a slightly different dialect when describing limits. This engine is the translator that converts everything into a common language.

#### F3: Throughput Calculator

**Description:** Calculate theoretical API call capacity over a user-defined timeframe.

| Input | Example |
|-------|---------|
| Selected services | GCP Compute Engine, AWS RDS |
| Timeframe | 24 hours |
| Operation type | Read vs. Write (different limits often apply) |
| Concurrency model | Single client vs. distributed |

| Output | Format |
|--------|--------|
| Max operations possible | Number + unit |
| Time to complete N operations | Duration |
| Throttling risk assessment | Low / Medium / High with explanation |

#### F4: Visualization Dashboard

**Description:** Graphical representation of limits and calculations.

| Visualization Type | Use Case |
|--------------------|----------|
| **Gauge charts** | "You're planning to use 73% of your hourly quota" |
| **Timeline chart** | Show when throttling would kick in over time |
| **Comparison bars** | Side-by-side service limit comparison |
| **Quota breakdown** | Pie/donut showing quota allocation |

**Design Principles:**
- Dark mode default (we're developers, after all)
- Minimal chrome, maximum data density
- Responsive—works on a laptop during an incident

#### F5: Results Export

**Description:** Get data out in useful formats.

| Format | Use Case |
|--------|----------|
| **Table view** | Quick scanning, copy-paste friendly |
| **JSON** | Programmatic consumption, CI/CD integration |
| **Markdown** | Drop into PR descriptions or runbooks |

---

### 4.2 Enhanced Features (Post-MVP)

| Feature | Description | Priority |
|---------|-------------|----------|
| **Scenario comparison** | "What if I used 10 concurrent workers vs 50?" | High |
| **Quota alerts setup** | Generate CloudWatch/Stackdriver alert configs | Medium |
| **Historical limit changes** | Track when CSPs changed limits | Medium |
| **Team sharing** | Share calculation results via URL | Medium |
| **CLI companion** | `cloudthrottle calc --service=ec2 --ops=1000` | Low |

---

## 5. Technical Architecture

### 5.1 Design Philosophy

> **"The best backend is no backend"** (for the user)

The goal is maximum web-nativeness. Core calculations happen client-side. The only "backend" is a lightweight data service that pre-fetches and normalizes rate limit data.

### 5.2 Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER'S BROWSER                          │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │   UI Layer      │  │  Calc Engine    │  │  Visualization  │  │
│  │   (HTML/CSS/    │  │  (TypeScript/   │  │  (D3.js or      │  │
│  │    TypeScript)  │  │   WASM-Go)      │  │   Chart.js)     │  │
│  └────────┬────────┘  └────────┬────────┘  └────────┬────────┘  │
│           │                    │                    │           │
│           └────────────────────┼────────────────────┘           │
│                                │                                │
│  ┌─────────────────────────────▼─────────────────────────────┐  │
│  │              Local State (IndexedDB / LocalStorage)        │  │
│  │              - Cached rate limit data                      │  │
│  │              - User's saved calculations                   │  │
│  └─────────────────────────────┬─────────────────────────────┘  │
└────────────────────────────────┼────────────────────────────────┘
                                 │
                    ┌────────────▼────────────┐
                    │     CDN / Static Host   │
                    │   (Cloudflare Pages,    │
                    │    Vercel, Netlify)     │
                    └────────────┬────────────┘
                                 │
              ┌──────────────────┼──────────────────┐
              │                  │                  │
              ▼                  ▼                  ▼
    ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
    │  Rate Limit     │ │  AWS Docs/API   │ │  GCP Docs/API   │
    │  Data Service   │ │  (source)       │ │  (source)       │
    │  (Go, optional) │ └─────────────────┘ └─────────────────┘
    └─────────────────┘
```

### 5.3 Technology Stack

| Layer | Technology | Rationale |
|-------|------------|-----------|
| **UI Framework** | **SvelteKit** or **Astro** | Lightweight, fast, great DX. Avoids React bloat. |
| **Styling** | **Tailwind CSS** | Utility-first, easy dark mode, responsive |
| **Visualization** | **D3.js** or **Chart.js** | D3 for custom viz, Chart.js for quick wins |
| **Calculation Engine** | **TypeScript** (primary) + **Go→WASM** (complex calcs) | TS for simplicity, Go/WASM for performance-critical paths or to reuse existing Go logic |
| **Local Storage** | **IndexedDB** (via Dexie.js) | Structured storage for cached data |
| **Data Service** | **Go** (optional microservice) | Fetches, normalizes, caches rate limit data. Deployed as serverless function or container. |
| **Hosting** | **Cloudflare Pages** or **Vercel** | Edge deployment, free tier, great performance |

### 5.4 Data Flow: Rate Limit Ingestion

```
┌─────────────────────────────────────────────────────────────────┐
│                    DATA INGESTION PIPELINE                      │
└─────────────────────────────────────────────────────────────────┘

  ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
  │  CSP Docs    │     │  CSP APIs    │     │  Community   │
  │  (scraped)   │     │  (official)  │     │  Sources     │
  └──────┬───────┘     └──────┬───────┘     └──────┬───────┘
         │                    │                    │
         └────────────────────┼────────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │   Go Ingestion  │
                    │   Service       │
                    │   (scheduled)   │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │   Normalize to  │
                    │   Unified Schema│
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │   JSON Data     │
                    │   (versioned)   │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │   CDN / R2 /    │
                    │   Static Host   │
                    └─────────────────┘
```

### 5.5 Unified Rate Limit Schema

```typescript
interface RateLimitData {
  provider: 'aws' | 'gcp' | 'azure';
  service: string;           // e.g., "compute-engine", "ec2"
  serviceDisplayName: string; // e.g., "Compute Engine", "EC2"
  operation: string;         // e.g., "instances.list", "DescribeInstances"
  
  limits: {
    requestsPerSecond?: number;
    requestsPerMinute?: number;
    requestsPerHour?: number;
    requestsPerDay?: number;
    burstCapacity?: number;
    quotaType: 'hard' | 'soft' | 'adjustable';
  };
  
  sdkBehavior: {
    sdk: 'go' | 'python' | 'java' | 'generic';
    defaultRetryEnabled: boolean;
    defaultMaxRetries?: number;
    exponentialBackoff?: boolean;
  }[];
  
  metadata: {
    sourceUrl: string;       // Link to official docs
    lastVerified: string;    // ISO date
    notes?: string;          // Edge cases, gotchas
  };
}
```

---

## 6. User Interface Wireframes

### 6.1 Main Dashboard Layout

```
┌─────────────────────────────────────────────────────────────────────┐
│  ☁️ CloudThrottle                    [Settings] [Export] [?]        │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  SELECT SERVICES                                      [SDK: Go] │
│  │  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐   │
│  │  │ 🟠 AWS          │ │ 🔵 GCP          │ │ 🟣 Azure        │   │
│  │  └─────────────────┘ └─────────────────┘ └─────────────────┘   │
│  │                                                                 │
│  │  🔍 Search services...                                         │
│  │  ┌─────────────────────────────────────────────────────────┐   │
│  │  │ ☑️  EC2 (DescribeInstances)              1000 req/sec   │   │
│  │  │ ☑️  RDS (DescribeDBInstances)            100 req/sec    │   │
│  │  │ ☑️  GCP Compute (instances.list)         20 req/sec     │   │
│  │  └─────────────────────────────────────────────────────────┘   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌──────────────────────┐  ┌────────────────────────────────────┐  │
│  │  CALCULATE           │  │  VISUALIZATION                      │  │
│  │                      │  │                                      │  │
│  │  Timeframe:          │  │     ┌─────────────────────────┐     │  │
│  │  [24 hours    ▼]     │  │     │    QUOTA USAGE          │     │  │
│  │                      │  │     │    ████████░░░░ 67%     │     │  │
│  │  Operations:         │  │     │                         │     │  │
│  │  [10,000      ]      │  │     │    Time to throttle:    │     │  │
│  │                      │  │     │    ⏱️ 4h 23m             │     │  │
│  │  Concurrency:        │  │     └─────────────────────────┘     │  │
│  │  [5 workers   ]      │  │                                      │  │
│  │                      │  │     [Timeline Chart Here]            │  │
│  │  [🔄 Calculate]      │  │                                      │  │
│  └──────────────────────┘  └────────────────────────────────────┘  │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  RESULTS TABLE                                    [📋 Copy]  │   │
│  │  ┌──────────┬────────────┬──────────┬──────────┬─────────┐  │   │
│  │  │ Service  │ Limit      │ Planned  │ % Used   │ Risk    │  │   │
│  │  ├──────────┼────────────┼──────────┼──────────┼─────────┤  │   │
│  │  │ EC2      │ 86.4M/day  │ 10,000   │ 0.01%    │ 🟢 Low  │  │   │
│  │  │ RDS      │ 8.64M/day  │ 500      │ 0.006%   │ 🟢 Low  │  │   │
│  │  │ GCP CE   │ 1.73M/day  │ 2,000    │ 0.12%    │ 🟢 Low  │  │   │
│  │  └──────────┴────────────┴──────────┴──────────┴─────────┘  │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### 6.2 Visualization Options

```
┌───────────────────────────────────────────────────────────────┐
│  VIEW: [Gauge] [Timeline] [Comparison] [Breakdown]            │
├───────────────────────────────────────────────────────────────┤
│                                                               │
│  TIMELINE VIEW                                                │
│                                                               │
│  Operations ▲                                                 │
│       10k   │                    ╭─────── Throttle threshold  │
│             │         ╭─────────╯                             │
│        5k   │    ╭────╯                                       │
│             │ ╭──╯                                            │
│         0   │─╯                                               │
│             └─────────────────────────────────────────────▶   │
│              0h    6h    12h    18h    24h         Time       │
│                                                               │
│  Legend: ─── Your planned throughput                          │
│          ─ ─ Rate limit ceiling                               │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

---

## 7. Data Sources Strategy

### 7.1 AWS Rate Limits

| Source | Method | Reliability |
|--------|--------|-------------|
| [Service Quotas API](https://docs.aws.amazon.com/servicequotas/latest/userguide/intro.html) | Direct API call | ⭐⭐⭐ High |
| [API Reference Docs](https://docs.aws.amazon.com/AWSEC2/latest/APIReference/throttling.html) | Structured scraping | ⭐⭐ Medium |
| AWS SDK source code (Go) | Parse retry configs | ⭐⭐ Medium |

### 7.2 GCP Rate Limits

| Source | Method | Reliability |
|--------|--------|-------------|
| [Cloud Quotas API](https://cloud.google.com/docs/quotas) | Direct API call | ⭐⭐⭐ High |
| [API Discovery Service](https://developers.google.com/discovery) | Metadata extraction | ⭐⭐⭐ High |
| Per-service docs | Structured scraping | ⭐⭐ Medium |

### 7.3 Data Freshness Approach

```
┌─────────────────────────────────────────────────────────────┐
│                    FRESHNESS STRATEGY                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ⏰ Scheduled Job (Weekly)                                  │
│     │                                                       │
│     ├── Fetch from all sources                              │
│     ├── Compare with previous data                          │
│     ├── Flag changes for review                             │
│     └── Publish new dataset (versioned JSON)                │
│                                                             │
│  🔄 On-Demand Refresh                                       │
│     │                                                       │
│     ├── User clicks "Check for updates"                     │
│     └── Client fetches latest version number                │
│         └── If newer, download and cache                    │
│                                                             │
│  📅 Data Versioning                                         │
│     │                                                       │
│     └── rate-limits-v2024-01-15.json                        │
│         └── Includes: lastUpdated, sourceCommit, changes[]  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 8. Development Phases

### Phase 1: Foundation (Weeks 1-3)

| Task | Deliverable |
|------|-------------|
| Project setup | SvelteKit/Astro scaffold, Tailwind configured |
| Data schema | Finalized TypeScript interfaces |
| Manual data entry | 10 most common services (AWS EC2, RDS, S3; GCP Compute, Storage, BigQuery) |
| Basic UI | Service selector, simple table output |
| Core calculator | TypeScript implementation |

### Phase 2: Visualization & Polish (Weeks 4-5)

| Task | Deliverable |
|------|-------------|
| Charting | Gauge + Timeline visualizations |
| Dark mode | Full theme support |
| Export | JSON + Markdown export |
| Local storage | Cache data in IndexedDB |
| Responsive design | Mobile-friendly layout |

### Phase 3: Data Automation (Weeks 6-8)

| Task | Deliverable |
|------|-------------|
| Go data service | Automated ingestion from AWS/GCP APIs |
| Scheduled jobs | Weekly refresh pipeline |
| SDK-specific data | Go SDK retry/backoff defaults |
| Expand services | 30+ services covered |

### Phase 4: Advanced Features (Weeks 9+)

| Task | Deliverable |
|------|-------------|
| Scenario comparison | Side-by-side "what if" |
| URL sharing | Shareable calculation links |
| Go WASM | Performance optimization for complex calcs |
| Azure support | Third provider |

---

## 9. Non-Functional Requirements

| Requirement | Target | Rationale |
|-------------|--------|-----------|
| **Initial load** | < 2 seconds | First impression matters |
| **Time to interactive** | < 3 seconds | Users should be able to start immediately |
| **Offline capability** | Core features work offline | Useful during incidents when internet may be spotty |
| **Accessibility** | WCAG 2.1 AA | Inclusive design |
| **Browser support** | Chrome, Firefox, Safari (latest 2 versions) | Pragmatic scope |

---

## 10. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| CSP changes rate limit docs/APIs | Medium | High | Version data, show "last verified" dates, allow manual overrides |
| Rate limit data accuracy | Medium | High | Link to source docs, encourage community corrections |
| Scope creep | High | Medium | Strict MVP definition, phase-based delivery |
| CSP doc scraping breaks | Medium | Medium | Prefer APIs, build resilient parsers, alert on failures |

---

## 11. Open Questions

1. **Azure priority?** Should we include Azure in MVP or defer to Phase 4?
   - *Recommendation:* Defer. AWS + GCP covers most users, reduces MVP scope.

2. **User accounts?** Do we want saved calculations across devices?
   - *Recommendation:* Start with URL-based sharing (stateless). Add accounts later if demand exists.

3. **Go WASM complexity?** Is it worth the added build complexity?
   - *Recommendation:* Start with pure TypeScript. Add WASM only if we identify performance bottlenecks or want to share calculation logic with a CLI tool.

4. **Community contributions?** Should we allow users to submit rate limit corrections?
   - *Recommendation:* Yes, via GitHub Issues/PRs on the data repo. Builds trust and improves accuracy.

---

## 12. Success Criteria for MVP Launch

| Criteria | Measurement |
|----------|-------------|
| ✅ User can select services from AWS and GCP | Manual testing |
| ✅ Calculator produces accurate results for 10+ services | Validation against docs |
| ✅ At least 2 visualization types working | Visual inspection |
| ✅ Data is < 7 days old | Automated check |
| ✅ Works offline after first load | Airplane mode test |
| ✅ Export to JSON and Markdown works | Manual testing |
| ✅ Page load < 3 seconds on 3G connection | Lighthouse audit |

---

## Appendix A: Example Calculation Flow

**Scenario:** "I need to list all EC2 instances across 50 AWS accounts every hour for monitoring."

**Inputs:**
- Service: EC2 DescribeInstances
- Operation count: 50 accounts × 1 call = 50 calls/hour
- Timeframe: 1 hour (recurring)

**Calculation:**
```
EC2 DescribeInstances limit: 100 requests/second
Hourly capacity: 100 × 3600 = 360,000 requests/hour
Planned usage: 50 requests/hour
Utilization: 50 / 360,000 = 0.014%
```

**Output:**
```
┌─────────────────────────────────────────────┐
│  ✅ LOW RISK                                │
│                                             │
│  You're planning to use 0.014% of your      │
│  available EC2 DescribeInstances quota.     │
│                                             │
│  Headroom: 359,950 additional calls/hour    │
│  before throttling.                         │
│                                             │
│  💡 Tip: Go SDK has automatic retry with    │
│  exponential backoff enabled by default.    │
└─────────────────────────────────────────────┘
```

---

## Appendix B: Competitive Landscape

| Tool | Strengths | Weaknesses | Our Differentiation |
|------|-----------|------------|---------------------|
| AWS Service Quotas Console | Official, accurate | AWS-only, no calculation | Multi-cloud, calculator |
| GCP Quotas Page | Official, accurate | GCP-only, basic UI | Multi-cloud, visualization |
| Manual doc reading | Always accurate | Time-consuming, error-prone | Automated, normalized |
| Custom spreadsheets | Flexible | Outdated quickly, no viz | Dynamic data, rich viz |

---

**Document Version:** 1.0  
**Last Updated:** December 2024  
**Author:** CloudThrottle Product Team  
**Status:** Draft for Review

---
