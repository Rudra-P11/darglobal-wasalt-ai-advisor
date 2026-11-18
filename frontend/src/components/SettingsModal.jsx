import React, { useState } from 'react';
import { X, Key, Cpu, ShieldCheck, Check } from 'lucide-react';

export default function SettingsModal({
  isOpen,
  onClose,
  apiKey,
  selectedModel,
  onSave,
  models = [],
}) {
  const [tempKey, setTempKey] = useState(apiKey);
  const [tempModel, setTempModel] = useState(selectedModel);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(tempKey, tempModel);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-[var(--bg-main)] border border-[var(--border-color)] shadow-2xl p-6 sm:p-7">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[var(--border-color)]">
          <h2 className="text-lg font-semibold tracking-tight text-[var(--text-primary)]">
            Intelligence Settings
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-5 space-y-4">
          
          {/* Model Selector */}
          <div>
            <label className="block text-xs font-medium text-[var(--text-primary)] mb-1.5">
              LLM Reasoning Engine
            </label>
            <div className="relative">
              <select
                value={tempModel}
                onChange={(e) => setTempModel(e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] transition-colors cursor-pointer"
              >
                {models.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
            <p className="text-[11px] text-[var(--text-muted)] mt-1.5">
              Connected via OpenRouter with native RAG groundings.
            </p>
          </div>

          {/* OpenRouter API Key Override */}
          <div>
            <label className="block text-xs font-medium text-[var(--text-primary)] mb-1.5 flex items-center justify-between">
              <span>OpenRouter API Key Override (Optional)</span>
              <span className="text-[10px] text-[var(--text-muted)]">Encrypted Locally</span>
            </label>
            <div className="relative">
              <input
                type="password"
                placeholder="sk-or-v1-..."
                value={tempKey}
                onChange={(e) => setTempKey(e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] text-sm font-mono text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] transition-colors"
              />
            </div>
            <p className="text-[11px] text-[var(--text-muted)] mt-1.5">
              Leave blank to use the pre-configured server environment key.
            </p>
          </div>

          {/* Security Notice */}
          <div className="p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] flex items-start gap-2.5 text-xs text-[var(--text-secondary)]">
            <ShieldCheck className="w-4 h-4 text-[var(--success)] shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              Anti-hallucination guardrails active. Answers cite scraped DarGlobal and Wasalt canonical data.
            </p>
          </div>

        </div>

        {/* Action Buttons */}
        <div className="mt-6 pt-4 border-t border-[var(--border-color)] flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="h-10 px-4 rounded-xl border border-[var(--border-color)] text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="h-10 px-5 rounded-xl bg-[var(--text-primary)] text-[var(--bg-main)] text-xs font-medium hover:opacity-90 transition-opacity"
          >
            Save Configuration
          </button>
        </div>

      </div>
    </div>
  );
}
