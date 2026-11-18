import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { 
  Building2, 
  User, 
  Copy, 
  Check, 
  ExternalLink, 
  MapPin, 
  Tag, 
  Sparkles, 
  ChevronRight,
  Maximize2,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Layers
} from 'lucide-react';

export default function MessageItem({
  message,
  onSelectFollowup,
  onOpenImage,
}) {
  const [copied, setCopied] = useState(false);
  const isUser = message.sender === 'user';

  const handleCopy = () => {
    navigator.clipboard.writeText(message.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isUser) {
    return (
      <div className="flex justify-end mb-6">
        <div className="max-w-[85%] sm:max-w-xl bg-[var(--text-primary)] text-[var(--bg-card)] px-5 py-3.5 rounded-2xl rounded-br-sm shadow-sm">
          <p className="text-[15px] leading-relaxed whitespace-pre-wrap font-normal">
            {message.text}
          </p>
        </div>
      </div>
    );
  }

  const citations = message.citations || [];
  const followups = message.suggested_followups || [];

  // Filter valid photos from citations
  const visualCards = citations.filter(c => c.image_url || (c.images && c.images.length > 0));

  return (
    <div className="mb-10 text-[var(--text-primary)]">
      
      {/* Advisor Header Bar */}
      <div className="flex items-center justify-between mb-3 text-xs text-[var(--text-secondary)]">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-[var(--accent-subtle)] text-[var(--accent)] flex items-center justify-center">
            <Sparkles className="w-3 h-3" />
          </div>
          <span className="font-medium text-[var(--text-primary)]">Real Estate Advisor</span>
          {message.model && (
            <span className="px-2 py-0.5 rounded-full bg-[var(--bg-secondary)] text-[var(--text-muted)] text-[10px] border border-[var(--border-color)]">
              {message.model.split('/').pop()}
            </span>
          )}
        </div>

        <button
          onClick={handleCopy}
          className="flex items-center gap-1 p-1 px-2 rounded-md hover:bg-[var(--bg-secondary)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors duration-150"
          title="Copy Response"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-[var(--success)]" /> : <Copy className="w-3.5 h-3.5" />}
          <span className="text-[11px]">{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>

      {/* Main Markdown Response Card */}
      <div className="p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-[0_1px_4px_rgba(0,0,0,0.02)] mb-4">
        <div className="markdown-content text-[15px] text-[var(--text-primary)]">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {message.text}
          </ReactMarkdown>
        </div>
      </div>

      {/* Visual Photography Showcase Grid (If properties are cited) */}
      {visualCards.length > 0 && (
        <div className="mb-5">
          <div className="flex items-center justify-between mb-2.5 px-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-[var(--accent)]" />
              Verified Architectural Photography ({visualCards.length})
            </span>
            <span className="text-[11px] text-[var(--text-muted)]">
              Official CDN captures
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {visualCards.slice(0, 3).map((item, idx) => {
              const photo = item.image_url || (item.images && item.images[0]);
              return (
                <div
                  key={idx}
                  className="group relative rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] overflow-hidden shadow-sm hover:border-[var(--text-primary)]/40 transition-all duration-200"
                >
                  {/* Photo Container */}
                  <div 
                    onClick={() => onOpenImage && onOpenImage(photo, item.title)}
                    className="relative aspect-[16/10] bg-[var(--bg-secondary)] overflow-hidden cursor-zoom-in"
                  >
                    <img
                      src={photo}
                      alt={item.title}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
                    
                    {/* Platform Tag */}
                    <div className="absolute top-2.5 left-2.5">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-black/60 text-white backdrop-blur-md">
                        {item.platform}
                      </span>
                    </div>

                    {/* Expand Action */}
                    <div className="absolute top-2.5 right-2.5 w-6 h-6 rounded-full bg-black/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Maximize2 className="w-3 h-3" />
                    </div>

                    {/* Bottom Title & Location */}
                    <div className="absolute bottom-2.5 left-2.5 right-2.5 text-white">
                      <p className="text-xs font-semibold leading-tight drop-shadow-sm truncate">
                        {item.title}
                      </p>
                      <p className="text-[10px] text-zinc-300 drop-shadow-sm truncate flex items-center gap-1 mt-0.5">
                        <MapPin className="w-2.5 h-2.5 text-[var(--accent)]" />
                        {item.location}
                      </p>
                    </div>
                  </div>

                  {/* Property Card Specs Footer */}
                  <div className="p-3 bg-[var(--bg-card)] flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[10px] text-[var(--text-muted)] block">Indicative Rate</span>
                      <span className="font-semibold text-[var(--text-primary)] text-xs">
                        {item.price}
                      </span>
                    </div>
                    {item.url && (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-medium text-[var(--accent)] hover:text-[var(--accent-hover)] transition-colors"
                      >
                        Official Page
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Comparative Analytics Strip (When 2 or more properties are cited) */}
      {citations.length >= 2 && (
        <div className="p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] mb-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold tracking-tight text-[var(--text-primary)] flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-[var(--accent)]" />
              Comparative Portfolio Overview
            </span>
            <span className="text-[11px] text-[var(--text-muted)]">
              {citations.length} Properties Analyzed
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {citations.slice(0, 4).map((c, i) => (
              <div 
                key={i} 
                className="p-2.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] flex items-center justify-between"
              >
                <div className="min-w-0 pr-2">
                  <p className="font-medium text-[var(--text-primary)] truncate text-xs">
                    {c.title}
                  </p>
                  <p className="text-[10px] text-[var(--text-muted)] truncate">
                    {c.location}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-[var(--accent-subtle)] text-[var(--accent)]">
                    {c.price.length > 15 ? c.price.slice(0, 15) + '…' : c.price}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Strategic Highlights Footer */}
          <div className="mt-3 pt-3 border-t border-[var(--border-color)]/60 flex flex-wrap items-center gap-4 text-[11px] text-[var(--text-secondary)]">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-[var(--success)]" />
              0% Property Tax in UAE / Oman / KSA
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-[var(--success)]" />
              10-Year Golden Visa & REGA Licensed
            </span>
          </div>
        </div>
      )}

      {/* Suggested Follow-up Inquiries */}
      {followups.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[11px] font-medium text-[var(--text-muted)] mr-1">
            Explore Next:
          </span>
          {followups.map((q, idx) => (
            <button
              key={idx}
              onClick={() => onSelectFollowup(q)}
              className="text-xs px-3 py-1.5 rounded-full border border-[var(--border-color)] bg-[var(--bg-card)] hover:border-[var(--text-primary)]/40 hover:bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all duration-150 flex items-center gap-1 text-left"
            >
              <span>{q}</span>
              <ChevronRight className="w-3 h-3 shrink-0 text-[var(--text-muted)]" />
            </button>
          ))}
        </div>
      )}

    </div>
  );
}
