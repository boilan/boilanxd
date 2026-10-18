import React, { useState, useMemo } from 'react';
import { marked } from 'marked';
import { Bot, User, Copy, Check, RotateCcw, AlertTriangle } from 'lucide-react';
import { ChatMessage as ChatMessageType } from '../../types/ai';

interface ChatMessageProps {
  message: ChatMessageType;
  onRegenerate?: () => void;
  isStreaming?: boolean;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  onRegenerate,
  isStreaming,
}) => {
  const [copied, setCopied] = useState(false);
  const isAssistant = message.role === 'assistant';

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Parse markdown content safely with custom code blocks
  const renderedHtml = useMemo(() => {
    if (!message.content) return '';
    try {
      const customRenderer = {
        code({ text, lang }: { text: string; lang?: string }) {
          const language = (lang || 'código').toLowerCase();
          const escaped = text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
          const encoded = encodeURIComponent(text);
          return `<div class="my-3 rounded-xl overflow-hidden border border-white/10 bg-[#0c1017]">
            <div class="flex items-center justify-between px-3.5 py-1.5 bg-white/[0.04] border-b border-white/[0.06] text-[11px] font-mono text-slate-400">
              <span class="text-emerald-400 font-medium">${language}</span>
              <button onclick="navigator.clipboard.writeText(decodeURIComponent('${encoded}')); this.innerText='¡Copiado!'; setTimeout(() => this.innerText='Copiar', 2000)" class="hover:text-white transition-colors cursor-pointer text-[10px] px-2 py-0.5 rounded bg-white/[0.06] hover:bg-white/[0.12]">Copiar</button>
            </div>
            <pre class="p-3.5 text-xs font-mono text-slate-200 overflow-x-auto leading-relaxed selection:bg-emerald-500/30"><code>${escaped}</code></pre>
          </div>`;
        },
      };

      marked.use({ renderer: customRenderer });

      return marked.parse(message.content, {
        breaks: true,
        gfm: true,
      }) as string;
    } catch {
      return message.content;
    }
  }, [message.content]);

  return (
    <div
      className={`group w-full py-4 px-4 sm:px-6 transition-colors ${
        isAssistant
          ? 'bg-[#0b0e14]/50 border-y border-white/[0.03]'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-3xl mx-auto flex gap-4">
        {/* Avatar */}
        <div className="shrink-0 pt-0.5">
          {isAssistant ? (
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shadow-sm">
              <Bot className="w-4 h-4" />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-lg bg-white/[0.06] border border-white/10 text-slate-300 flex items-center justify-center shadow-sm">
              <User className="w-4 h-4" />
            </div>
          )}
        </div>

        {/* Content body */}
        <div className="flex-1 min-w-0">
          {/* Header line: Role and Model metadata */}
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-2 text-xs">
              <span className="font-semibold text-white">
                {isAssistant ? 'AI Studio' : 'Tú'}
              </span>
              {isAssistant && message.model && (
                <>
                  <span aria-hidden="true" className="text-slate-600">·</span>
                  <span className="font-mono text-[11px] text-emerald-400/80">
                    {message.model}
                  </span>
                </>
              )}
            </div>

            {/* Action buttons (copy, regenerate) */}
            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
              <button
                onClick={handleCopyMessage}
                className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/[0.08] transition-colors"
                title="Copiar texto"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
              {isAssistant && onRegenerate && (
                <button
                  onClick={onRegenerate}
                  className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/[0.08] transition-colors"
                  title="Regenerar respuesta"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Attached Image if present */}
          {message.image && (
            <div className="mb-3">
              <img
                src={message.image.dataUrl}
                alt={message.image.name || 'Imagen adjunta'}
                className="max-h-60 max-w-sm rounded-xl border border-white/10 object-cover shadow-lg"
              />
            </div>
          )}

          {/* Error Message if present */}
          {message.error ? (
            <div className="mt-2 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs flex items-start gap-3">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium">{message.error}</p>
                {onRegenerate && (
                  <button
                    onClick={onRegenerate}
                    className="mt-2 text-[11px] text-red-200 hover:text-white underline cursor-pointer"
                  >
                    Reintentar generación
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* Rendered Markdown or raw text */
            <div className="relative text-sm text-slate-200 leading-relaxed font-normal">
              <div
                className="prose prose-invert max-w-none prose-p:my-2 prose-pre:my-3 prose-pre:bg-[#12161f] prose-pre:border prose-pre:border-white/10 prose-pre:rounded-xl prose-code:font-mono prose-code:text-emerald-300 prose-code:text-xs prose-ul:my-2 prose-ol:my-2 prose-li:my-0.5"
                dangerouslySetInnerHTML={{ __html: renderedHtml }}
              />

              {/* Streaming typing cursor */}
              {isStreaming && (
                <span className="inline-block w-2 h-4 bg-emerald-400 ml-1 translate-y-0.5 animate-pulse" />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
