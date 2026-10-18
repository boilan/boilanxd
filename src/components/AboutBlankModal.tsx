import React from 'react';
import { AlertCircle, X, ExternalLink } from 'lucide-react';
import { AppDefinition } from '../types/app';
import { openInAboutBlank } from '../utils/cloaker';

interface AboutBlankModalProps {
  app: AppDefinition | null;
  isOpen: boolean;
  onClose: () => void;
}

export const AboutBlankModal: React.FC<AboutBlankModalProps> = ({
  app,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !app) return null;

  const handleRetry = () => {
    const targetUrl = app.isExternal
      ? app.url
      : `${window.location.origin}?app=ai-studio`;
    openInAboutBlank(targetUrl, 'Home - clases', app.name);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md rounded-2xl bg-[#0f141f] border border-white/10 p-6 shadow-2xl text-slate-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
          title="Cerrar"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-semibold text-white text-base">Ventana emergente bloqueada</h4>
            <p className="text-xs text-slate-400">El navegador restringió la nueva pestaña automática</p>
          </div>
        </div>

        <p className="text-sm text-slate-300 leading-relaxed mb-6">
          Para abrir <span className="font-medium text-white">{app.name}</span> en una pestaña discreta con título <span className="font-mono text-emerald-400">Home - clases</span>, haz clic en el siguiente botón para autorizar la acción.
        </p>

        <div className="flex gap-3">
          <button
            onClick={handleRetry}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm transition-colors cursor-pointer shadow-lg shadow-emerald-950/40"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Autorizar y abrir</span>
          </button>
          <button
            onClick={onClose}
            className="py-2.5 px-4 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 font-medium text-sm transition-colors cursor-pointer"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};
