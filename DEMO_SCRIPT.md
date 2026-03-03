# WealthPlannerOS — Demo Script (2:30)

> **Format:** Screen recording with voiceover. Keep energy up, pace brisk. Show the system *working*, not slides.

---

## HOOK — The Problem (0:00 – 0:20)

**[Screen: Landing page of WealthPlannerOS]**

> "Today, if you want a real financial plan — one that stress-tests your future against job loss, market crashes, and bad timing — you're paying $2,000 to $5,000 for a human advisor. Or you're guessing with a spreadsheet."
>
> "I rebuilt that entire workflow from scratch as an AI-native system. It's called WealthPlannerOS."

**[Click "Build My Plan"]**

---

## ACT 1 — Onboarding: Profile Input (0:20 – 0:50)

**[Screen: Onboarding wizard — Step 1: Profile]**

> "The user fills out a financial profile — age, income, expenses, portfolio value. Nothing unusual here."

**[Fill in: Age 30, retirement 60, $120K income, $70K expenses, $150K portfolio, $20K/yr contributions. Click Next.]**

**[Step 2: Goals]**

> "They set financial goals with target amounts and deadlines — retirement fund, house down payment, whatever matters to them."

**[Add goal: "Retirement" — $2M by 2056, priority: essential. Click Next.]**

**[Step 3: Allocation]**

> "Asset allocation — 60% US equity, 20% international, 15% bonds, 5% REITs."

**[Adjust sliders. Click Next.]**

**[Step 4: Life Events]**

> "And life events — planned or possible. A career change, buying a house, having kids. The system models these deterministically *and* injects stochastic shocks like job loss and medical emergencies on top."

**[Add: "Career change" in 2030, income +$20K. Click Submit.]**

---

## ACT 2 — The Engine: What AI Does (0:50 – 1:30)

**[Screen: Loading states appear in sequence — "Running 10,000 Monte Carlo simulations..." → "Analyzing risk and fragility..." → "Generating AI recommendations..."]**

> "Here's where the system does real work. Three things just happened in under five seconds."

**[Screen: Dashboard loads — fan chart, success gauge, risk panel, strategy cards all visible]**

> "First — 10,000 Monte Carlo simulations ran using geometric Brownian motion, correlated asset returns, inflation, taxes, and stochastic life shocks. All vectorized in NumPy, under one second."

**[Hover over the fan chart showing P10–P90 bands]**

> "Second — a risk engine computed this plan's fragility score, Value-at-Risk, CVaR, max drawdown, and checked every goal against the pessimistic projections to flag misalignment."

**[Point to the Fragility Score and Risk Panel]**

> "Third — all of that context — the full simulation output, risk analysis, and profile — was compressed into a structured prompt and sent to Claude. Claude returned ranked, actionable strategy recommendations — each tagged by category, impact, and whether it requires human review."

**[Point to the Strategy Cards]**

---

## ACT 3 — Human-in-the-Loop & AI Boundary (1:30 – 2:00)

**[Screen: Zoom into a Strategy Card flagged with "HUMAN REVIEW REQUIRED"]**

> "This is the critical design decision. The AI generates strategy — but any recommendation involving insurance, tax optimization, or asset reallocation is flagged for human review. The user must explicitly acknowledge it before acting."

**[Click the acknowledgment checkbox]**

> "The AI tells you *what* to consider and *why*. It does not tell you to execute. That boundary is explicit and non-negotiable — because a wrong insurance decision or aggressive tax strategy can't be undone by a rollback."

**[Scroll to the Behavioral Coaching Panel]**

> "The system also detects cognitive biases — recency bias, loss aversion, concentration risk — and surfaces them as coaching nudges. Not just what to do, but *how you might be thinking about it wrong*."

---

## ACT 4 — What-If Scenarios & AI Chat (2:00 – 2:25)

**[Screen: What-If bar at top of dashboard]**

> "And this — the user types a natural-language what-if question."

**[Type: "What if I retire at 55 instead of 60?" → Click "Run Scenario"]**

> "Claude interprets the question, extracts the parameter change, re-runs the full simulation pipeline, and overlays the new projections on the existing dashboard. Instant second opinion, no advisor call needed."

**[Screen: Dashboard updates with overlaid what-if projections — median shifts, success rate changes]**

**[Click "Advisor" in the nav → Advisor chat page loads]**

> "And for deeper questions, there's a streaming AI advisor chat — full context of the simulation and risk analysis baked into every response."

---

## CLOSE — What This Changes (2:25 – 2:30)

**[Screen: Dashboard overview, pull back]**

> "One person. Five seconds. The same depth of analysis that used to require a $5,000 engagement and two weeks of back-and-forth. That's the workflow, rebuilt."

---

## Recording Tips

- **Resolution:** 1920×1080, browser full-screen, dark mode looks great on the obsidian/gold theme
- **Pre-fill data:** Have the onboarding pre-populated so you're not fumbling with inputs on camera
- **Pace:** ~150 words/minute. The script is ~580 words — fits comfortably in 2:30
- **Key moments to linger on:** The fan chart rendering, the fragility score, the human-review gate checkbox, the what-if overlay
- **Don't rush past the loading states** — they show the 3-stage pipeline and communicate that real computation is happening
