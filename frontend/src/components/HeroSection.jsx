import React from 'react';
import { ArrowUpRight, Compass, ShieldCheck, Gem, Sparkles } from 'lucide-react';

const CURATED_INQUIRIES = [
  {
    category: "International Villas",
    label: "Oceanfront Villas in Oman & Lamborghini Villas in Spain",
    query: "Tell me about luxury villas offered by DarGlobal in Oman and Spain, including AIDA and Tierra Viva.",
  },
  {
    category: "Dubai Waterfront",
    label: "Branded Residences & Penthouses in Dubai",
    query: "What branded luxury residences does DarGlobal offer in Dubai Canal and Downtown Dubai?",
  },
  {
    category: "Saudi Arabia (Wasalt)",
    label: "Verified Family Villas & Land Plots in Riyadh",
    query: "Show me verified residential villas and land plots available for sale in Riyadh on Wasalt.",
  },
  {
    category: "Strategic Advisory",
    label: "UAE Golden Visa & 0% Tax Investment Framework",
    query: "How do DarGlobal properties qualify buyers for the 10-year UAE Golden Visa and 0% property tax benefits?",
  },
];

export default function HeroSection({ onSelectPrompt }) {
  return (
    <div className="max-w-3xl mx-auto py-12 sm:py-16 text-center">
      
      {/* Subtle pill tag */}
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-[var(--bg-secondary)] text-[var(--text-secondary)] border border-[var(--border-color)] mb-6">
        <Sparkles className="w-3.5 h-3.5 text-[var(--accent)]" />
        <span>Grounded on Official DarGlobal & Wasalt Real Estate Data</span>
      </div>

      {/* Main display headline */}
      <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-[-0.03em] text-[var(--text-primary)] leading-[1.08] mb-5">
        Global Luxury Residences & Verified Saudi Living.
      </h1>

      {/* Understated subtext */}
      <p className="text-base sm:text-lg text-[var(--text-secondary)] leading-relaxed max-w-2xl mx-auto mb-10 font-normal">
        A bespoke real estate advisor providing verified specifications, high-resolution photography, and pricing across prime Middle Eastern and European developments.
      </p>

      {/* Curated inquiry grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
        {CURATED_INQUIRIES.map((item, idx) => (
          <button
            key={idx}
            onClick={() => onSelectPrompt(item.query)}
            className="group p-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] hover:border-[var(--text-primary)]/40 hover:shadow-[0_2px_8px_rgba(0,0,0,0.03)] transition-all duration-200 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-medium uppercase tracking-wider text-[var(--accent)]">
                {item.category}
              </span>
              <ArrowUpRight className="w-3.5 h-3.5 text-[var(--text-muted)] group-hover:text-[var(--text-primary)] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </div>
            <p className="text-sm font-medium text-[var(--text-primary)] leading-snug">
              {item.label}
            </p>
          </button>
        ))}
      </div>

      {/* Trust markers */}
      <div className="mt-10 pt-8 border-t border-[var(--border-color)] flex flex-wrap items-center justify-center gap-6 text-xs text-[var(--text-muted)]">
        <span className="flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-[var(--success)]" />
          REGA Licensed Marketplace Data
        </span>
        <span className="flex items-center gap-1.5">
          <Gem className="w-4 h-4 text-[var(--accent)]" />
          DarGlobal LSE: DAR Flagship Projects
        </span>
        <span className="flex items-center gap-1.5">
          <Compass className="w-4 h-4 text-[var(--text-secondary)]" />
          Multi-Turn Conversational Memory
        </span>
      </div>

    </div>
  );
}
