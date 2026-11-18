import React, { useRef, useEffect } from 'react';
import { ArrowUp, Sparkles, Loader2 } from 'lucide-react';

export default function ChatComposer({
  input,
  setInput,
  onSubmit,
  isLoading,
  selectedModel,
}) {
  const textareaRef = useRef(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  }, [input]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (input.trim() && !isLoading) {
        onSubmit(e);
      }
    }
  };

  return (
    <div className="sticky bottom-0 z-30 w-full bg-gradient-to-t from-[var(--bg-main)] via-[var(--bg-main)] to-transparent pt-6 pb-5">
      <div className="max-w-3xl mx-auto px-4">
        
        {/* Composer Box */}
        <form
          onSubmit={onSubmit}
          className="relative rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] shadow-[0_2px_12px_rgba(0,0,0,0.04)] focus-within:border-[var(--accent)] transition-all duration-200 p-2 sm:p-2.5 flex items-end gap-2"
        >
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about Dubai branded penthouses, Oman cliffside villas, Riyadh plots..."
            disabled={isLoading}
            className="flex-1 max-h-40 bg-transparent text-[15px] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none resize-none px-3 py-1.5 leading-relaxed font-normal"
          />

          {/* Send Action */}
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="w-9 h-9 rounded-xl bg-[var(--text-primary)] text-[var(--bg-main)] flex items-center justify-center shrink-0 disabled:opacity-20 hover:opacity-90 active:scale-95 transition-all duration-150 cursor-pointer disabled:cursor-not-allowed shadow-sm"
            title="Send Message"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin text-[var(--bg-main)]" />
            ) : (
              <ArrowUp className="w-4 h-4 stroke-[2.5]" />
            )}
          </button>
        </form>

        {/* Understated Disclaimer */}
        <div className="mt-2 text-center text-[11px] text-[var(--text-muted)] flex items-center justify-center gap-2">
          <span>Grounded on verified DarGlobal & Wasalt records</span>
          <span>•</span>
          <span className="font-mono">{selectedModel.split('/').pop()}</span>
        </div>

      </div>
    </div>
  );
}
