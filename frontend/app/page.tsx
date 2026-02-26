import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-obsidian relative overflow-hidden">
      {/* Subtle geometric grid overlay */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(200,162,84,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(200,162,84,0.03) 1px, transparent 1px)`,
          backgroundSize: "80px 80px",
        }}
      />

      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-6 max-w-6xl mx-auto animate-reveal">
        <div className="flex items-center gap-3">
          <span className="text-gold text-xs leading-none">◆</span>
          <span className="font-serif text-parchment text-lg tracking-widest">
            WEALTHPLANNER<span className="text-gold">OS</span>
          </span>
        </div>
        <Link
          href="/onboarding"
          className="text-xs text-mist hover:text-parchment border border-rim hover:border-rim-strong px-5 py-2.5 tracking-widest uppercase"
        >
          Get Started →
        </Link>
      </nav>

      {/* Hero */}
      <section className="relative z-10 max-w-6xl mx-auto px-8 pt-16 pb-24">
        <div className="max-w-4xl">
          {/* Eyebrow */}
          <div className="animate-reveal-1 flex items-center gap-4 mb-10">
            <div className="h-px w-12 bg-gold" />
            <span className="text-gold text-xs tracking-[0.25em] uppercase font-mono">
              Monte Carlo · Risk Analysis · AI Strategy
            </span>
          </div>

          {/* Headline */}
          <h1 className="animate-reveal-2 font-serif text-6xl sm:text-7xl lg:text-[5.5rem] text-parchment leading-[1.0] mb-8">
            Your Wealth,
            <br />
            <span className="text-gold-shimmer">Stress-Tested.</span>
          </h1>

          <p className="animate-reveal-3 text-mist text-lg sm:text-xl leading-relaxed max-w-xl mb-12">
            10,000 Monte Carlo simulations model your financial future. AI
            identifies fragilities and delivers ranked strategy. Know what you
            can withstand. Know what to fix.
          </p>

          <div className="animate-reveal-4 flex items-center gap-8">
            <Link
              href="/onboarding"
              className="group inline-flex items-center gap-3 bg-gold hover:bg-gold-bright text-obsidian font-medium text-sm px-8 py-4 tracking-wide"
            >
              Build My Plan
              <svg
                className="w-4 h-4 transition-transform group-hover:translate-x-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
            <span className="text-xs text-dust tracking-wide">
              No account required
            </span>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="rule-gold animate-line mx-8 max-w-6xl lg:mx-auto" />

      {/* Stats */}
      <section className="relative z-10 max-w-6xl mx-auto px-8 py-16">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-8 gap-y-10">
          {[
            { value: "10,000", label: "Simulations per run" },
            { value: "<1s", label: "Compute time" },
            { value: "5", label: "Asset classes modeled" },
            { value: "AI", label: "Strategy advisor" },
          ].map((stat, i) => (
            <div
              key={stat.label}
              className="animate-reveal"
              style={{ animationDelay: `${0.5 + i * 0.1}s` }}
            >
              <div className="font-mono text-4xl sm:text-5xl text-parchment mb-2">
                {stat.value}
              </div>
              <div className="text-xs text-mist tracking-wide">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Divider */}
      <div className="rule-gold mx-8 max-w-6xl lg:mx-auto" />

      {/* Capabilities */}
      <section className="relative z-10 max-w-6xl mx-auto px-8 py-16">
        <div className="flex items-center gap-4 mb-10">
          <span className="text-xs text-gold tracking-[0.25em] uppercase font-mono">
            Capabilities
          </span>
          <div className="h-px flex-1 bg-rim" />
        </div>

        <div className="divide-y divide-rim">
          {[
            {
              num: "01",
              title: "Monte Carlo Engine",
              desc: "10,000 probabilistic paths model your portfolio across bull markets, recessions, and stochastic life events — in under one second.",
              tag: "Simulation",
            },
            {
              num: "02",
              title: "Risk Fragility Score",
              desc: "VaR, CVaR, median max drawdown, and goal misalignment analysis surface the hidden vulnerabilities in your plan before they surface in reality.",
              tag: "Risk Analysis",
            },
            {
              num: "03",
              title: "AI Strategy Advisor",
              desc: "Claude synthesizes your simulation results into ranked, personalized action items — savings, allocation, tax optimization, and more.",
              tag: "AI Strategy",
            },
          ].map((f) => (
            <div
              key={f.title}
              className="group flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-10 py-8 transition-all hover:pl-2"
            >
              <div className="font-mono text-xs text-dust flex-shrink-0 pt-1.5 w-8">
                {f.num}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-serif text-2xl text-parchment">{f.title}</h3>
                  <span className="text-xs font-mono text-gold border border-gold-dim px-2 py-0.5">
                    {f.tag}
                  </span>
                </div>
                <p className="text-mist text-sm leading-relaxed max-w-xl">{f.desc}</p>
              </div>
              <div className="hidden sm:block text-dust group-hover:text-gold transition-colors flex-shrink-0 pt-2">
                <svg
                  className="w-5 h-5 transition-transform group-hover:translate-x-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Divider */}
      <div className="rule-gold mx-8 max-w-6xl lg:mx-auto" />

      {/* Process */}
      <section className="relative z-10 max-w-6xl mx-auto px-8 py-16">
        <div className="flex items-center gap-4 mb-12">
          <span className="text-xs text-gold tracking-[0.25em] uppercase font-mono">
            Process
          </span>
          <div className="h-px flex-1 bg-rim" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-10">
          {[
            {
              step: "01",
              title: "Enter Your Profile",
              desc: "Income, expenses, goals, risk tolerance, asset allocation, and life events.",
            },
            {
              step: "02",
              title: "Run Simulations",
              desc: "10,000 Monte Carlo paths project your wealth trajectory across decades.",
            },
            {
              step: "03",
              title: "Receive Strategy",
              desc: "AI generates ranked action items tailored to your exact simulation results.",
            },
          ].map((item) => (
            <div key={item.step}>
              <div className="font-mono text-5xl text-rim mb-5">{item.step}</div>
              <h3 className="font-serif text-xl text-parchment mb-2">{item.title}</h3>
              <p className="text-xs text-mist leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="relative z-10 max-w-6xl mx-auto px-8 pb-20">
        <div className="bg-surface border border-rim p-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <div className="font-serif text-3xl text-parchment mb-2">
              Ready to stress-test your wealth?
            </div>
            <div className="text-sm text-mist">Free. No sign-up. Results in seconds.</div>
          </div>
          <Link
            href="/onboarding"
            className="group flex-shrink-0 inline-flex items-center gap-3 border border-gold text-gold hover:bg-gold hover:text-obsidian font-medium text-sm px-8 py-4 tracking-wide"
          >
            Get Started
            <svg
              className="w-4 h-4 transition-transform group-hover:translate-x-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-rim py-8 px-8">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-gold text-xs">◆</span>
            <span className="font-serif text-mist text-sm tracking-widest">
              WEALTHPLANNER OS
            </span>
          </div>
          <p className="text-xs text-dust text-center">
            AI-generated analysis is informational only — not financial advice.
          </p>
        </div>
      </footer>
    </main>
  );
}
