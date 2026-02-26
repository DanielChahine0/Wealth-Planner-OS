import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex flex-col items-center justify-center px-4">
      <div className="max-w-2xl text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-1.5 text-blue-300 text-xs font-medium mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
          AI-Powered Wealth Planning
        </div>

        {/* Headline */}
        <h1 className="text-5xl font-bold text-white leading-tight mb-4">
          Your Financial Future,
          <br />
          <span className="text-blue-400">Simulated &amp; Optimized</span>
        </h1>
        <p className="text-lg text-slate-400 mb-10 max-w-xl mx-auto">
          Run 10,000 Monte Carlo scenarios on your wealth plan, identify fragilities,
          and get ranked AI strategy recommendations — in under 5 seconds.
        </p>

        {/* CTA */}
        <Link
          href="/onboarding"
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold px-8 py-4 rounded-xl text-base transition-colors shadow-lg shadow-blue-600/25"
        >
          Build My Plan
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>

        {/* Features */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-16 text-left">
          {[
            {
              icon: "📊",
              title: "Monte Carlo Engine",
              desc: "10,000 probabilistic scenarios model your portfolio across bull markets, crashes, and everything between.",
            },
            {
              icon: "⚡",
              title: "Risk Fragility Score",
              desc: "VaR, CVaR, and goal misalignment analysis surfaces hidden vulnerabilities in your plan.",
            },
            {
              icon: "🤖",
              title: "AI Strategy Advisor",
              desc: "Claude generates ranked, personalized recommendations tailored to your exact financial profile.",
            },
          ].map((f) => (
            <div key={f.title} className="bg-white/5 border border-white/10 rounded-xl p-4">
              <div className="text-2xl mb-2">{f.icon}</div>
              <div className="text-sm font-semibold text-white mb-1">{f.title}</div>
              <div className="text-xs text-slate-400 leading-relaxed">{f.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
