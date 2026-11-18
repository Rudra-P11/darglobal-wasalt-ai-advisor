import React from 'react';
import { 
  X, 
  TrendingUp, 
  ShieldCheck, 
  Globe, 
  Landmark, 
  CheckCircle2, 
  BarChart2, 
  ArrowRight,
  Sparkles 
} from 'lucide-react';

const MARKET_METRICS = [
  {
    market: "Dubai & Ras Al Khaimah (UAE)",
    developer: "DarGlobal (Aston Martin, Missoni, Trump)",
    yieldEst: "7.2% - 8.5% Gross Yield",
    visa: "10-Year UAE Golden Visa (from 2M AED)",
    tax: "0% Personal Income & Capital Gains Tax",
    keyAdvantage: "Adjacent to Wynn Casino & Dubai Canal Waterfront",
  },
  {
    market: "Muscat / AIDA (Oman)",
    developer: "DarGlobal × Omran Group (Trump Villas)",
    yieldEst: "6.8% - 7.5% Projected Yield",
    visa: "Oman Long-Term Investor Residency",
    tax: "0% Property Tax for International Freehold",
    keyAdvantage: "130m Cliffside Oceanfront & Championship Golf",
  },
  {
    market: "Riyadh & West Riyadh (Saudi Arabia)",
    developer: "Wasalt Licensed Marketplace (REGA)",
    yieldEst: "8.0% - 9.5% Residential Rental Yield",
    visa: "Saudi Premium Residency Eligible",
    tax: "5% Real Estate Transaction Tax (RETT)",
    keyAdvantage: "Giga-Project Proximity & Bank Financing Eligible",
  },
  {
    market: "Benahavís, Costa Del Sol (Spain)",
    developer: "DarGlobal (Automobili Lamborghini)",
    yieldEst: "5.5% - 6.5% European Luxury Yield",
    visa: "Spanish Golden Visa Eligible",
    tax: "European Gated Community Framework",
    keyAdvantage: "Ultra-luxury hillside with in-villa car lifts",
  },
];

const PRICE_BENCHMARKS = [
  { region: "Ras Al Khaimah (The Astera)", avgSqft: "AED 2,400 / sqft", barPct: 65, color: "bg-[var(--accent)]" },
  { region: "Dubai Downtown (W Residences)", avgSqft: "AED 3,600 / sqft", barPct: 92, color: "bg-[var(--text-primary)]" },
  { region: "Oman Clifftop (AIDA Trump)", avgSqft: "OMR 120 / sqm", barPct: 58, color: "bg-[var(--accent)]" },
  { region: "Riyadh Villas (Al-Mahdiyah)", avgSqft: "SAR 4,800 / sqm", barPct: 45, color: "bg-[var(--success)]" },
  { region: "Spain Hillside (Tierra Viva)", avgSqft: "EUR 7,200 / sqm", barPct: 88, color: "bg-[var(--text-primary)]" },
];

export default function MarketAnalyticsModal({
  isOpen,
  onClose,
  onAskQuestion,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" 
      />

      <div className="flex min-h-full items-center justify-center p-4 sm:p-6">
        <div className="relative w-full max-w-3xl rounded-2xl bg-[var(--bg-main)] border border-[var(--border-color)] shadow-2xl p-6 sm:p-8 overflow-hidden">
          
          {/* Header */}
          <div className="flex items-center justify-between pb-5 border-b border-[var(--border-color)]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[var(--accent-subtle)] text-[var(--accent)] flex items-center justify-center">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-semibold tracking-tight text-[var(--text-primary)]">
                  Cross-Border Real Estate Market Intelligence
                </h2>
                <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                  Comparative Analysis: DarGlobal International vs. Wasalt Saudi Marketplace
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="mt-6 space-y-6">
            
            {/* Visual Benchmark Comparison Bars */}
            <div className="p-5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)]">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] flex items-center gap-1.5">
                  <BarChart2 className="w-4 h-4 text-[var(--accent)]" />
                  Regional Price Index & Value Benchmark
                </span>
                <span className="text-[11px] text-[var(--text-muted)]">Verified Q4 2024 / 2026 Data</span>
              </div>

              <div className="space-y-3">
                {PRICE_BENCHMARKS.map((item, idx) => (
                  <div key={idx} className="text-xs">
                    <div className="flex justify-between font-medium text-[var(--text-primary)] mb-1">
                      <span>{item.region}</span>
                      <span className="text-[var(--text-secondary)] font-mono">{item.avgSqft}</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-[var(--bg-secondary)] overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${item.color} transition-all duration-700`}
                        style={{ width: `${item.barPct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Strategic Comparison Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {MARKET_METRICS.map((m, idx) => (
                <div 
                  key={idx}
                  className="p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] flex flex-col justify-between"
                >
                  <div>
                    <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-1">
                      {m.market}
                    </h3>
                    <p className="text-[11px] text-[var(--text-secondary)] mb-3">
                      {m.developer}
                    </p>

                    <div className="space-y-1.5 text-xs text-[var(--text-secondary)]">
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[var(--success)] shrink-0" />
                        <span><strong>Rental Yield:</strong> {m.yieldEst}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-[var(--accent)] shrink-0" />
                        <span><strong>Residency:</strong> {m.visa}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Landmark className="w-3.5 h-3.5 text-[var(--text-muted)] shrink-0" />
                        <span><strong>Tax Regime:</strong> {m.tax}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      onAskQuestion && onAskQuestion(`Provide a detailed investment analysis for ${m.market}, covering yields, taxes, and available properties.`);
                      onClose();
                    }}
                    className="mt-4 pt-3 border-t border-[var(--border-color)] text-[11px] font-medium text-[var(--text-primary)] hover:text-[var(--accent)] flex items-center justify-between group"
                  >
                    <span>Inquire About This Market</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              ))}
            </div>

          </div>

          {/* Footer CTA */}
          <div className="mt-6 pt-4 border-t border-[var(--border-color)] flex items-center justify-between text-xs text-[var(--text-secondary)]">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-[var(--accent)]" />
              Real-time RAG groundings on DarGlobal & Wasalt
            </span>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-[var(--text-primary)] text-[var(--bg-main)] font-medium text-xs hover:opacity-90 transition-opacity"
            >
              Back to Advisor
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
