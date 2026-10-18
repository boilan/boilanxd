import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  Plus,
  Sliders,
  Bot,
  ShieldCheck,
  Eye,
} from 'lucide-react';
import {
  ProviderId,
  ChatMessage as ChatMessageType,
  ChatSettings,
  ChatImageAttachment,
  PROVIDERS_CONFIG,
} from '../../types/ai';
import { ProviderSelector } from './ProviderSelector';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { AISettingsModal } from './AISettingsModal';

const DEFAULT_SETTINGS: ChatSettings = {
  systemPrompt: 'Eres un asistente de inteligencia artificial altamente capacitado, conciso, analítico y preciso. Responde con claridad en español.',
  temperature: 0.7,
  maxTokens: 2048,
  customKeys: {},
};

interface AIStudioAppProps {
  onBackToMenu?: () => void;
  standalone?: boolean;
}

export const AIStudioApp: React.FC<AIStudioAppProps> = ({
  onBackToMenu,
}) => {
  const [selectedProviderId, setSelectedProviderId] = useState<ProviderId>('gemini');
  const [selectedModelId, setSelectedModelId] = useState<string>('gemini-3.8-flash');
  const [messages, setMessages] = useState<ChatMessageType[]>(() => {
    try {
      const saved = localStorage.getItem('ai_studio_messages');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [settings, setSettings] = useState<ChatSettings>(() => {
    try {
      const saved = localStorage.getItem('ai_studio_settings');
      return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const abortControllerRef = useRef<AbortController | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Sync settings and messages to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('ai_studio_settings', JSON.stringify(settings));
    } catch {
      // ignore
    }
  }, [settings]);

  useEffect(() => {
    try {
      localStorage.setItem('ai_studio_messages', JSON.stringify(messages));
    } catch {
      // ignore
    }
  }, [messages]);

  // Current provider & model info
  const currentProvider = PROVIDERS_CONFIG.find((p) => p.id === selectedProviderId) || PROVIDERS_CONFIG[0];
  const currentModel = currentProvider.models.find((m) => m.id === selectedModelId) || currentProvider.models[0];
  const isMultimodal = Boolean(currentProvider.isMultimodal && (currentModel.isMultimodal !== false));

  // Scroll to bottom on new messages
  useEffect(() => {
    if (isGenerating || messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isGenerating]);

  const handleProviderSelect = (provId: ProviderId, modId: string) => {
    setSelectedProviderId(provId);
    setSelectedModelId(modId);
  };

  const handleSendMessage = async (userPrompt: string, image?: ChatImageAttachment) => {
    if ((!userPrompt.trim() && !image) || isGenerating) return;

    const userMessage: ChatMessageType = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: userPrompt.trim(),
      createdAt: Date.now(),
      image,
    };

    const assistantPlaceholderId = `msg-${Date.now() + 1}`;
    const assistantMessage: ChatMessageType = {
      id: assistantPlaceholderId,
      role: 'assistant',
      content: '',
      createdAt: Date.now(),
      model: currentModel.name,
      provider: selectedProviderId,
      isStreaming: true,
    };

    setMessages((prev) => [...prev, userMessage, assistantMessage]);
    setInput('');
    setIsGenerating(true);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    // Build chat history payload
    const historyPayload = messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));
    historyPayload.push({ role: 'user', content: userPrompt.trim() });

    try {
      const response = await fetch('/api/chat?stream=true', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          provider: selectedProviderId,
          model: selectedModelId,
          messages: historyPayload,
          systemPrompt: settings.systemPrompt,
          temperature: settings.temperature,
          maxTokens: settings.maxTokens,
          image,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        let errData = 'Error al contactar con el proveedor de IA.';
        try {
          const parsed = await response.json();
          errData = parsed.error || errData;
        } catch {
          // ignore
        }
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantPlaceholderId
              ? { ...m, isStreaming: false, error: errData }
              : m
          )
        );
        setIsGenerating(false);
        return;
      }

      if (!response.body) {
        throw new Error('La respuesta no incluye un canal de flujo.');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let accumulatedText = '';
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith(':')) continue;

          if (trimmed.startsWith('data: ')) {
            const dataStr = trimmed.slice(6);
            if (dataStr === '[DONE]') {
              continue;
            }

            try {
              const data = JSON.parse(dataStr);
              if (data.error) {
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantPlaceholderId
                      ? { ...m, isStreaming: false, error: data.error }
                      : m
                  )
                );
                setIsGenerating(false);
                return;
              }

              if (data.text) {
                accumulatedText += data.text;
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantPlaceholderId
                      ? { ...m, content: accumulatedText }
                      : m
                  )
                );
              }
            } catch {
              // Ignore partial JSON chunks
            }
          }
        }
      }

      // Mark generation complete
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantPlaceholderId
            ? { ...m, isStreaming: false, content: accumulatedText || 'Respuesta completada.' }
            : m
        )
      );
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantPlaceholderId
              ? { ...m, isStreaming: false }
              : m
          )
        );
      } else {
        const errMsg = err instanceof Error ? err.message : 'Error de conexión con el servidor.';
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantPlaceholderId
              ? { ...m, isStreaming: false, error: errMsg }
              : m
          )
        );
      }
    } finally {
      setIsGenerating(false);
      abortControllerRef.current = null;
    }
  };

  const handleCancel = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsGenerating(false);
  };

  const handleRegenerate = () => {
    if (messages.length < 2 || isGenerating) return;
    const lastUserMessage = [...messages].reverse().find((m) => m.role === 'user');
    if (!lastUserMessage) return;

    // Remove the last assistant message
    setMessages((prev) => {
      const copy = [...prev];
      if (copy[copy.length - 1].role === 'assistant') {
        copy.pop();
      }
      return copy;
    });

    handleSendMessage(lastUserMessage.content, lastUserMessage.image);
  };

  const handleNewChat = () => {
    if (isGenerating) handleCancel();
    setMessages([]);
    localStorage.removeItem('ai_studio_messages');
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] w-full bg-[#080a0f] text-slate-100 overflow-hidden relative">
      {/* Top AI Studio Header Bar */}
      <div className="h-12 px-4 border-b border-white/[0.08] bg-[#0c1017] flex items-center justify-between z-30 select-none">
        <div className="flex items-center gap-3">
          {onBackToMenu && (
            <button
              onClick={onBackToMenu}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-slate-300 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer text-xs"
              title="Volver al menú de aplicaciones"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="font-medium hidden sm:inline">Menú</span>
            </button>
          )}

          {onBackToMenu && <div className="h-3.5 w-px bg-white/10 hidden sm:block" />}

          {/* Model and Provider Selector */}
          <ProviderSelector
            selectedProviderId={selectedProviderId}
            selectedModelId={selectedModelId}
            onSelect={handleProviderSelect}
          />
        </div>

        {/* Right Tools: New Chat & System Prompt Settings */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleNewChat}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium text-slate-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] transition-colors cursor-pointer"
            title="Iniciar nueva conversación"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Nueva conversación</span>
          </button>

          <button
            onClick={() => setIsSettingsOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium text-slate-400 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] transition-colors cursor-pointer"
            title="Personalizar System Prompt"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span className="hidden sm:inline text-slate-300">System Prompt</span>
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center p-6 text-center max-w-lg mx-auto">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4 shadow-xl">
              <Bot className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-semibold text-white tracking-tight mb-2">
              AI Studio
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed mb-6">
              Plataforma de inteligencia artificial con soporte multimodelo y visión para análisis de fotos. Escribe tu consulta o adjunta una imagen.
            </p>

            <div className="flex items-center gap-3 text-[11px] text-emerald-400/90 font-mono">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Backend seguro</span>
              </span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span className="flex items-center gap-1">
                <Eye className="w-3.5 h-3.5" />
                <span>Subida de fotos</span>
              </span>
            </div>
          </div>
        ) : (
          <div className="py-4 space-y-1">
            {messages.map((message) => (
              <ChatMessage
                key={message.id}
                message={message}
                isStreaming={message.isStreaming}
                onRegenerate={
                  message.role === 'assistant' ? handleRegenerate : undefined
                }
              />
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Bottom Bar with Photo Upload */}
      <div className="border-t border-white/[0.06] bg-[#090c12]/95 backdrop-blur-md pt-3">
        <ChatInput
          input={input}
          setInput={setInput}
          onSubmit={handleSendMessage}
          isGenerating={isGenerating}
          onCancel={handleCancel}
          selectedModelName={currentModel.name}
          showStarters={messages.length === 0}
          isMultimodal={isMultimodal}
          onSwitchToMultimodal={() => handleProviderSelect('gemini', 'gemini-3.8-flash')}
        />
      </div>

      {/* Settings Modal (System Prompt only) */}
      <AISettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSaveSettings={setSettings}
      />
    </div>
  );
};
