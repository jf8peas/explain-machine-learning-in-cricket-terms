---
layout: ../../layouts/MatchLayout.astro
title: "How This Site Was Built: The Broadcast Tech Stack"
innings: post-game
chapter: how-this-site-was-built
meta: "8 min · meta-architecture"
lede: "Behind every seamless cricket broadcast sits a truck full of cables, telemetry tools, and director monitors. Here is the exact stack, local agent setup, and CI/CD pipeline used to engineer this course."
commentary: "'We aren't paying for the fancy commentary box when we have a perfectly good open-source terminal in the truck.' — Lead Systems Engineer"
codeFile: deploy.yml
codeOut: "build success · 12 static routes generated in 4.2s"
code: |
  # The OpenRouter + Cline + GitHub Actions Loop
  1. Local Dev: Cursor IDE + Cline Extension
  2. Intelligence: Moonshot Kimi K3 via OpenRouter API
  3. Static Engine: Astro 5.0 + Tailwind CSS v4 (Vite)
  4. Pipeline: Automated GitHub Actions CI/CD to Pages
stats:
  - { k: "Orchestration", v: "Cline", s: "local open-source agent" }
  - { k: "LLM Engine", v: "Kimi K3", s: "via OpenRouter API" }
  - { k: "Framework", v: "Astro", s: "zero-JS static output" }
  - { k: "Hosting", v: "GH Pages", s: "automated action deployment" }
---

## 1. The Strategy: Bypassing Paywalls with Open-Source Agents

When building a multi-file architecture, standard AI assistant subscriptions can lock you into rigid monthly quotas. To maintain complete control over costs while accessing top-tier coding models, we built a custom agent setup:

* **Cursor IDE:** Used strictly as our local code editor interface without relying on Cursor Pro subscriptions.
* **Cline Extension:** A free, open-source sidebar agent that runs inside Cursor, granting full autonomous file editing, terminal execution, and multi-file reasoning capabilities.
* **OpenRouter API:** Serves as our universal pay-as-you-go proxy, allowing us to route requests directly to specialized open-weight models at pennies per task.

---

## 2. The Engine: Moonshot Kimi K3

Instead of relying on standard proprietary models, the core architecture and code generation for this project were powered by **Moonshot AI's Kimi K3** (and `kimi-k2.7-code`):

* **Context & Reasoning:** Kimi K3 analyzed our raw HTML mockups (`design/v001/The Playing XI.html`) and extracted layout components automatically.
* **Cost Efficiency:** Running Kimi through OpenRouter costs fraction of a cent per prompt compared to standard enterprise models, taking full advantage of prompt caching.

---

## 3. The Front-End Stack: Astro & Tailwind v4

The site is built using **Astro**, designed for maximum speed and zero client-side JavaScript bloat:

* **File-Based Routing:** Every Markdown file dropped into `src/pages/` automatically converts into an optimized static HTML page.
* **Tailwind CSS v4:** Integrated via `@tailwindcss/vite` inside `astro.config.mjs`, utilizing `@import "tailwindcss";` for modern utility-first styling.
* **Dynamic Base Paths:** Configured with `import.meta.env.BASE_URL` to ensure all asset paths and navigation links stay aligned when hosted under GitHub Pages subpaths.

---

## 4. The Continuous Deployment Pipeline

Publishing to the web is entirely hands-off. Whenever a new chapter is written and checked into Git:

```text
git add . ──> git commit ──> git push