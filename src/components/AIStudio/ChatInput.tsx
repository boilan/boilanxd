import React, { useRef, useEffect, useState } from 'react';
import { ArrowUp, Square, Sparkles, Image as ImageIcon, X, Eye } from 'lucide-react';
import { ChatImageAttachment } from '../../types/ai';

interface ChatInputProps {
  input: string;
  setInput: (value: string) => void;
  onSubmit: (content: string, image?: ChatImageAttachment) => void;
  isGenerating: boolean;
  onCancel: () => void;
  selectedModelName: string;
  showStarters?: boolean;
  isMultimodal?: boolean;
  onSwitchToMultimodal?: () => void;
}

const STARTER_PROMPTS = [
  'Explica la teoría de la relatividad general de Einstein de forma intuitiva.',
  'Escribe un script en Node.js para procesar archivos CSV de forma eficiente.',
  'Compara las arquitecturas de LLMs basadas en Transformers vs State Space Models.',
  '¿Cuáles son las mejores prácticas para diseñar una arquitectura web moderna?',
];

export const ChatInput: React.FC<ChatInputProps> = ({
  input,
  setInput,
  onSubmit,
  isGenerating,
  onCancel,
  selectedModelName,
  showStarters = false,
  isMultimodal = false,
  onSwitchToMultimodal,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [attachedImage, setAttachedImage] = useState<ChatImageAttachment | null>(null);

  // Auto-resize textarea height based on content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isGenerating && (input.trim() || attachedImage)) {
        onSubmit(input.trim(), attachedImage || undefined);
        setAttachedImage(null);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isGenerating) {
      onCancel();
    } else if (input.trim() || attachedImage) {
      onSubmit(input.trim(), attachedImage || undefined);
      setAttachedImage(null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona un archivo de imagen válido (PNG, JPG, WEBP, GIF).');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('La imagen no debe superar los 10 MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1] || '';
      setAttachedImage({
        dataUrl: result,
        mimeType: file.type,
        base64,
        name: file.name,
        size: file.size,
      });
    };
    reader.readAsDataURL(file);

    // Reset input value so same file can be re-selected if deleted
    e.target.value = '';
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4 pb-4">
      {/* Starter Prompts when conversation is empty */}
      {showStarters && !attachedImage && (
        <div className="mb-4">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-2.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Sugerencias para comenzar:</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {STARTER_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => onSubmit(prompt)}
                className="text-left p-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.06] hover:border-emerald-500/30 text-xs text-slate-300 transition-all cursor-pointer group"
              >
                <p className="line-clamp-2 group-hover:text-white transition-colors">
                  {prompt}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Attached Image Preview Thumbnail Box */}
      {attachedImage && (
        <div className="mb-2.5 p-2 rounded-xl bg-[#0f141f] border border-white/10 flex items-center justify-between gap-3 animate-fade-in">
          <div className="flex items-center gap-3 min-w-0">
            <img
              src={attachedImage.dataUrl}
              alt="Miniatura"
              className="w-12 h-12 rounded-lg object-cover border border-white/10 shrink-0"
            />
            <div className="min-w-0">
              <p className="text-xs font-medium text-white truncate max-w-[200px] sm:max-w-xs">
                {attachedImage.name || 'Foto adjunta'}
              </p>
              <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                <span>{((attachedImage.size || 0) / 1024).toFixed(0)} KB</span>
                <span aria-hidden="true">·</span>
                {isMultimodal ? (
                  <span className="text-emerald-400 font-medium">Modelo multimodal activo</span>
                ) : (
                  <span className="text-amber-400 font-medium">Requiere modelo de visión</span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {!isMultimodal && onSwitchToMultimodal && (
              <button
                type="button"
                onClick={onSwitchToMultimodal}
                className="px-2 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-[11px] font-medium transition-colors cursor-pointer"
              >
                Usar Gemini (Visión)
              </button>
            )}
            <button
              type="button"
              onClick={() => setAttachedImage(null)}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-white/[0.08] rounded-lg transition-colors cursor-pointer"
              title="Quitar foto"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Input Form */}
      <form
        onSubmit={handleSubmit}
        className="relative rounded-2xl bg-[#0f141f] border border-white/10 focus-within:border-emerald-500/50 shadow-xl transition-all"
      >
        <div className="flex items-center pl-3 pr-14">
          {/* Upload Photo Button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className={`p-2 rounded-xl transition-colors cursor-pointer shrink-0 ${
              attachedImage
                ? 'text-emerald-400 bg-emerald-500/10'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.06]'
            }`}
            title="Subir foto o imagen para análisis"
          >
            <ImageIcon className="w-4 h-4" />
          </button>

          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              attachedImage
                ? 'Escribe una pregunta sobre la imagen...'
                : `Escribe un mensaje para ${selectedModelName}...`
            }
            rows={1}
            className="w-full bg-transparent px-3 py-3.5 text-sm text-white placeholder-slate-500 focus:outline-none resize-none max-h-48 overflow-y-auto leading-relaxed"
          />
        </div>

        {/* Action Button: Send or Abort */}
        <div className="absolute right-2.5 bottom-2.5">
          {isGenerating ? (
            <button
              type="button"
              onClick={onCancel}
              className="w-8 h-8 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 flex items-center justify-center transition-colors cursor-pointer"
              title="Detener generación"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={!input.trim() && !attachedImage}
              className="w-8 h-8 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-30 disabled:hover:bg-emerald-600 text-white flex items-center justify-center transition-colors cursor-pointer shadow-md disabled:cursor-not-allowed"
              title="Enviar mensaje (Enter)"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          )}
        </div>
      </form>

      <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 px-1">
        <div className="flex items-center gap-1.5">
          <span>Presiona <kbd className="px-1 py-0.5 rounded bg-white/[0.05] border border-white/10 font-mono text-[10px]">Enter</kbd> para enviar</span>
          {isMultimodal && (
            <span className="text-emerald-400/80 flex items-center gap-1 font-mono text-[10px]">
              <Eye className="w-3 h-3 inline" />
              <span>Visión habilitada</span>
            </span>
          )}
        </div>
        <span className="font-mono">{selectedModelName}</span>
      </div>
    </div>
  );
};
