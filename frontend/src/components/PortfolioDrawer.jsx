import React, { useState } from 'react';
import { 
  X, 
  Search, 
  MapPin, 
  ExternalLink, 
  Building2, 
  Filter,
  CheckCircle2,
  Maximize2
} from 'lucide-react';

export default function PortfolioDrawer({
  isOpen,
  onClose,
  properties = [],
  onSelectProperty,
  onOpenImage,
}) {
  const [search, setSearch] = useState('');
  const [platformFilter, setPlatformFilter] = useState('all');
  const [countryFilter, setCountryFilter] = useState('all');

  if (!isOpen) return null;

  const filtered = properties.filter(p => {
    const matchesSearch = 
      p.title?.toLowerCase().includes(search.toLowerCase()) ||
      p.location?.toLowerCase().includes(search.toLowerCase()) ||
      p.description?.toLowerCase().includes(search.toLowerCase());
    
    const matchesPlatform = 
      platformFilter === 'all' || 
      p.source_platform?.toLowerCase() === platformFilter.toLowerCase();

    const matchesCountry = 
      countryFilter === 'all' || 
      p.country?.toLowerCase().includes(countryFilter.toLowerCase());

    return matchesSearch && matchesPlatform && matchesCountry;
  });

  const countries = ['all', 'UAE', 'Oman', 'Saudi Arabia', 'Spain', 'UK'];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" 
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-2xl bg-[var(--bg-main)] border-l border-[var(--border-color)] shadow-2xl flex flex-col">
          
          {/* Header */}
          <div className="p-6 border-b border-[var(--border-color)] flex items-center justify-between bg-[var(--bg-card)]">
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-[var(--text-primary)]">
                Curated Real Estate Portfolio
              </h2>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                {properties.length} Verified Properties across DarGlobal & Wasalt
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search & Filters */}
          <div className="p-4 border-b border-[var(--border-color)] bg-[var(--bg-secondary)] space-y-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
              <input
                type="text"
                placeholder="Search developments, locations, or brands..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] transition-colors"
              />
            </div>

            {/* Platform & Country Pills */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] p-0.5 text-xs">
                {['all', 'DarGlobal', 'Wasalt'].map(p => (
                  <button
                    key={p}
                    onClick={() => setPlatformFilter(p)}
                    className={`px-3 py-1 rounded-md capitalize font-medium transition-colors ${
                      platformFilter === p
                        ? 'bg-[var(--text-primary)] text-[var(--bg-card)]'
                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-1">
                {countries.map(c => (
                  <button
                    key={c}
                    onClick={() => setCountryFilter(c)}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                      countryFilter === c
                        ? 'border-[var(--accent)] bg-[var(--accent-subtle)] text-[var(--accent)]'
                        : 'border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-secondary)] hover:border-[var(--text-primary)]/30'
                    }`}
                  >
                    {c === 'all' ? 'All Regions' : c}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Property List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {filtered.length === 0 ? (
              <div className="text-center py-12 text-sm text-[var(--text-muted)]">
                No properties match your active filter criteria.
              </div>
            ) : (
              filtered.map((item) => {
                const photo = item.image_url || (item.images && item.images[0]);
                return (
                  <div
                    key={item.id}
                    className="group rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-4 hover:border-[var(--text-primary)]/40 hover:shadow-sm transition-all duration-200"
                  >
                    <div className="flex flex-col sm:flex-row gap-4">
                      
                      {/* Photo Thumbnail */}
                      {photo && (
                        <div 
                          onClick={() => onOpenImage && onOpenImage(photo, item.title)}
                          className="sm:w-44 h-32 rounded-xl bg-[var(--bg-secondary)] overflow-hidden shrink-0 relative cursor-zoom-in"
                        >
                          <img
                            src={photo}
                            alt={item.title}
                            loading="lazy"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-black/60 text-white backdrop-blur-md">
                            {item.source_platform}
                          </div>
                        </div>
                      )}

                      {/* Content details */}
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h3 className="text-sm font-semibold text-[var(--text-primary)] tracking-tight">
                              {item.title}
                            </h3>
                            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-[var(--accent-subtle)] text-[var(--accent)] shrink-0">
                              {item.price}
                            </span>
                          </div>

                          <p className="text-xs text-[var(--text-secondary)] flex items-center gap-1 mb-2">
                            <MapPin className="w-3 h-3 text-[var(--accent)] shrink-0" />
                            {item.location}
                          </p>

                          <p className="text-xs text-[var(--text-secondary)] line-clamp-2 leading-relaxed mb-3">
                            {item.description}
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-between pt-2 border-t border-[var(--border-color)] text-xs">
                          <button
                            onClick={() => {
                              onSelectProperty && onSelectProperty(`Tell me in detail about ${item.title} located in ${item.location}.`);
                              onClose();
                            }}
                            className="text-[11px] font-medium text-[var(--text-primary)] hover:underline"
                          >
                            Ask AI Advisor →
                          </button>

                          {item.source_url && (
                            <a
                              href={item.source_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[11px] font-medium text-[var(--accent)] hover:text-[var(--accent-hover)]"
                            >
                              Official Website
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>

                      </div>

                    </div>
                  </div>
                );
              })
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
