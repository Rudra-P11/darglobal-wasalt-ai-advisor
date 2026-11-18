import React, { useState, useEffect, useRef } from 'react';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import MessageItem from './components/MessageItem';
import ChatComposer from './components/ChatComposer';
import PortfolioDrawer from './components/PortfolioDrawer';
import MarketAnalyticsModal from './components/MarketAnalyticsModal';
import SettingsModal from './components/SettingsModal';
import ImageModal from './components/ImageModal';
import { Loader2, Sparkles, Building2 } from 'lucide-react';

const DEFAULT_MODELS = [
  { id: "meta-llama/llama-3.1-8b-instruct", name: "Meta Llama 3.1 8B (Recommended)" },
  { id: "meta-llama/llama-3.2-3b-instruct", name: "Meta Llama 3.2 3B (Fast & Compact)" },
  { id: "meta-llama/llama-3.2-1b-instruct", name: "Meta Llama 3.2 1B (Ultra Lightweight)" },
  { id: "openrouter/free", name: "OpenRouter Free Router (Auto Best Free)" },
  { id: "nvidia/nemotron-3.5-lightning:free", name: "NVIDIA Nemotron 3.5 Lightning (Free)" },
  { id: "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free", name: "NVIDIA Nemotron 30B Reasoning (Free)" },
  { id: "cohere/north-mini-code:free", name: "Cohere North Mini (Free)" },
  { id: "google/gemma-4-31b-it:free", name: "Google Gemma 31B (Free Tier)" },
];

export default function App() {
  // Theme state: defaults to warm light theme as per guide
  const [theme, setTheme] = useState(() => localStorage.getItem('theme_preference') || 'light');
  
  // Navigation active tab
  const [activeTab, setActiveTab] = useState('chat');

  // Messages & Conversation State
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(() => 'session_' + Math.random().toString(36).substring(2, 9));

  // Modals & Drawers
  const [showExplorer, setShowExplorer] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [previewImage, setPreviewImage] = useState(null); // { url, title }

  // Settings State
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('openrouter_key') || '');
  const [selectedModel, setSelectedModel] = useState(() => localStorage.getItem('selected_model') || DEFAULT_MODELS[0].id);

  // Property Catalog
  const [properties, setProperties] = useState([]);
  const [healthInfo, setHealthInfo] = useState({ total_properties: 21, status: 'online' });

  const messagesEndRef = useRef(null);

  // Apply dark mode class to <html>
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme_preference', theme);
  }, [theme]);

  // Initial data loading
  useEffect(() => {
    fetch('/api/health')
      .then(res => res.json())
      .then(data => setHealthInfo(data))
      .catch(err => console.log('Health check note:', err));

    fetch('/api/properties')
      .then(res => res.json())
      .then(data => {
        if (data.properties) {
          setProperties(data.properties);
        }
      })
      .catch(err => console.log('Properties load note:', err));
  }, []);

  // Smooth scroll to bottom on message updates
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSaveSettings = (newKey, newModel) => {
    setApiKey(newKey);
    setSelectedModel(newModel);
    localStorage.setItem('openrouter_key', newKey);
    localStorage.setItem('selected_model', newModel);
  };

  const handleResetSession = async () => {
    try {
      await fetch('/api/reset-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId })
      });
    } catch (e) {
      console.log('Reset session error:', e);
    }
    setMessages([]);
    setSessionId('session_' + Math.random().toString(36).substring(2, 9));
  };

  const handleSendMessage = async (textToSend) => {
    const queryText = (typeof textToSend === 'string' ? textToSend : input).trim();
    if (!queryText || isLoading) return;

    const userMessage = {
      id: 'msg_' + Date.now(),
      sender: 'user',
      text: queryText,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const payload = {
        query: queryText,
        session_id: sessionId,
        model_name: selectedModel,
      };
      if (apiKey.trim()) {
        payload.api_key = apiKey.trim();
      }

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`API returned HTTP ${response.status}`);
      }

      const data = await response.json();

      const assistantMessage = {
        id: 'msg_' + Date.now(),
        sender: 'assistant',
        text: data.answer,
        citations: data.citations || [],
        suggested_followups: data.suggested_followups || [],
        model: data.model_used || selectedModel,
        timestamp: new Date().toISOString(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      console.error('Chat error:', err);
      const errorMessage = {
        id: 'msg_' + Date.now(),
        sender: 'assistant',
        text: "I encountered a momentary connection interruption. Please ensure the server is running or check your OpenRouter API key in Settings.",
        citations: [],
        suggested_followups: ["Tell me about DarGlobal's projects in Dubai and Oman."],
        model: selectedModel,
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-main)] text-[var(--text-primary)] transition-colors duration-200">
      
      {/* Apple / Claude Minimalist Top Navigation */}
      <Navbar
        theme={theme}
        setTheme={setTheme}
        onReset={handleResetSession}
        onOpenExplorer={() => setShowExplorer(true)}
        onOpenAnalytics={() => setShowAnalytics(true)}
        onOpenSettings={() => setShowSettings(true)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        totalProperties={properties.length || healthInfo.total_properties || 21}
      />

      {/* Main Conversation Container */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 flex flex-col">
        {messages.length === 0 ? (
          <HeroSection 
            onSelectPrompt={(prompt) => handleSendMessage(prompt)} 
          />
        ) : (
          <div className="flex-1 space-y-2">
            {messages.map((msg) => (
              <MessageItem
                key={msg.id}
                message={msg}
                onSelectFollowup={(followup) => handleSendMessage(followup)}
                onOpenImage={(url, title) => setPreviewImage({ url, title })}
              />
            ))}

            {/* Subtle Loading Indicator */}
            {isLoading && (
              <div className="mb-6 flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                <div className="w-5 h-5 rounded-full bg-[var(--accent-subtle)] text-[var(--accent)] flex items-center justify-center">
                  <Sparkles className="w-3 h-3 animate-spin" />
                </div>
                <span>Analyzing portfolio records & formulating advisory response…</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </main>

      {/* Bottom Floating Composer */}
      <ChatComposer
        input={input}
        setInput={setInput}
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage(input);
        }}
        isLoading={isLoading}
        selectedModel={selectedModel}
      />

      {/* Slide-out Curated Portfolio Drawer */}
      <PortfolioDrawer
        isOpen={showExplorer}
        onClose={() => setShowExplorer(false)}
        properties={properties}
        onSelectProperty={(query) => handleSendMessage(query)}
        onOpenImage={(url, title) => setPreviewImage({ url, title })}
      />

      {/* Market Analytics Modal */}
      <MarketAnalyticsModal
        isOpen={showAnalytics}
        onClose={() => setShowAnalytics(false)}
        onAskQuestion={(query) => handleSendMessage(query)}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        apiKey={apiKey}
        selectedModel={selectedModel}
        onSave={handleSaveSettings}
        models={DEFAULT_MODELS}
      />

      {/* Image Lightbox Modal */}
      <ImageModal
        isOpen={!!previewImage}
        onClose={() => setPreviewImage(null)}
        imageUrl={previewImage?.url}
        title={previewImage?.title}
      />

    </div>
  );
}
