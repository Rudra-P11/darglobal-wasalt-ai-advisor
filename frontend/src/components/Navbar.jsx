import React from 'react';
import { 
  Building2, 
  RotateCcw, 
  SlidersHorizontal, 
  Sun, 
  Moon, 
  Layers, 
  BarChart3, 
  Sparkles,
  ExternalLink
} from 'lucide-react';

export default function Navbar({
  theme,
  setTheme,
  onReset,
  onOpenExplorer,
  onOpenAnalytics,
  onOpenSettings,
  activeTab,
  setActiveTab,
  totalProperties = 21,
}) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-[var(--border-color)] bg-[var(--bg-main)]/90 backdrop-blur-md transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand & Identity */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[var(--text-primary)] text-[var(--bg-main)] flex items-center justify-center font-medium text-sm tracking-tight shadow-sm">
            DG
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-base font-semibold tracking-tight text-[var(--text-primary)]">
              DarGlobal
            </span>
            <span className="text-xs font-normal text-[var(--text-muted)]">×</span>
            <span className="text-base font-semibold tracking-tight text-[var(--text-primary)]">
              Wasalt
            </span>
          </div>
        </div>

        {/* Central Navigation Pills */}
        <nav className="hidden md:flex items-center gap-1 bg-[var(--bg-secondary)] p-1 rounded-full border border-[var(--border-color)]">
          <button
            onClick={() => setActiveTab('chat')}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-150 flex items-center gap-1.5 ${
              activeTab === 'chat'
                ? 'bg-[var(--bg-card)] text-[var(--text-primary)] shadow-sm'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-[var(--accent)]" />
            Advisory Chat
          </button>
          
          <button
            onClick={onOpenExplorer}
            className="px-4 py-1.5 rounded-full text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all duration-150 flex items-center gap-1.5"
          >
            <Layers className="w-3.5 h-3.5" />
            Curated Portfolio ({totalProperties})
          </button>

          <button
            onClick={onOpenAnalytics}
            className="px-4 py-1.5 rounded-full text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all duration-150 flex items-center gap-1.5"
          >
            <BarChart3 className="w-3.5 h-3.5" />
            Market Insights
          </button>
        </nav>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Mobile Explorer Shortcut */}
          <button
            onClick={onOpenExplorer}
            className="md:hidden p-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-colors"
            title="Browse Portfolio"
          >
            <Layers className="w-4 h-4" />
          </button>

          {/* Reset Dialog */}
          <button
            onClick={onReset}
            className="p-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-colors duration-150"
            title="Reset Conversation"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Theme Switcher */}
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-colors duration-150"
            title={theme === 'dark' ? 'Switch to Warm Light theme' : 'Switch to Midnight Dark theme'}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Settings */}
          <button
            onClick={onOpenSettings}
            className="p-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-colors duration-150"
            title="Model & Key Settings"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>

      </div>
    </header>
  );
}
