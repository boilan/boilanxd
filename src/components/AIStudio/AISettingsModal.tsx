import React, { useState } from 'react';
import { X, Sparkles, Check } from 'lucide-react';
import { ChatSettings } from '../../types/ai';

interface AISettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: ChatSettings;
  onSaveSettings: (settings: ChatSettings) => void;
  onClearHistory?: () => void;
  configuredProviders?: Record<string, boolean>;
}

export const AISettingsModal: React.FC<AISettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
}) => {
  const [systemPrompt, setSystemPrompt] = useState<string>(settings.systemPrompt);
  const [savedNotification, setSavedNotification] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveSettings({
      ...settings,
      systemPrompt,
    });
    setSavedNotification(true);
    setTimeout(() => {
      setSavedNotification(false);
      onClose();
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg rounded-2xl bg-[#0f141f] border border-white/10 p-6 shadow-2xl text-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.08] mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-white text-base">Instrucción del sistema</h3>
              <p className="text-xs text-slate-400">Personaliza el comportamiento contextual del asistente</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-1 cursor-pointer"
            title="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* System Prompt only */}
        <div className="space-y-2 text-xs">
          <label className="block font-medium text-slate-200">
            System Prompt
          </label>
          <textarea
            value={systemPrompt}
            onChange={(e) => setSystemPrompt(e.target.value)}
            rows={5}
            placeholder="Define el rol y comportamiento del modelo..."
            className="w-full rounded-xl bg-[#080a0f] border border-white/10 p-3.5 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 leading-relaxed text-xs"
          />
          <span className="text-[11px] text-slate-500 block">
            Se enviará como instrucción contextual inicial en cada consulta.
          </span>
        </div>

        {/* Modal Footer Actions */}
        <div className="mt-6 pt-4 border-t border-white/[0.08] flex justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-xs font-medium text-slate-300 transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-medium text-white transition-colors shadow-md cursor-pointer"
          >
            {savedNotification ? (
              <>
                <Check className="w-3.5 h-3.5 text-white" />
                <span>Guardado</span>
              </>
            ) : (
              <span>Guardar instrucción</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
