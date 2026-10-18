import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, RotateCcw, ExternalLink, ShieldAlert, ArrowUpRight } from 'lucide-react';
import { AppDefinition } from '../types/app';
import { openInAboutBlank } from '../utils/cloaker';

interface InAppViewerProps {
  app: AppDefinition;
  onBackToMenu: () => void;
  onOpenBlockedModal?: () => void;
}

export const InAppViewer: React.FC<InAppViewerProps> = ({
  app,
  onBackToMenu,
  onOpenBlockedModal,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);
  const [showIframeNotice, setShowIframeNotice] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    setIsLoading(true);
    setShowIframeNotice(false);

    // Timeout to notify user if iframe takes long or might be blocked by CSP
    const timer = setTimeout(() => {
      setShowIframeNotice(true);
    }, 4500);

    return () => clearTimeout(timer);
  }, [app.url, reloadKey]);

  const handleReload = () => {
    setIsLoading(true);
    setReloadKey((k) => k + 1);
  };

  const handleLaunchAboutBlank = () => {
    const res = openInAboutBlank(app.url, 'Home - clases', app.name);
    if (res.blocked && onOpenBlockedModal) {
      onOpenBlockedModal();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] w-full bg-[#080a0f] overflow-hidden">
      {/* Top minimal control toolbar */}
      <div className="h-11 px-4 border-b border-white/[0.08] bg-[#0c1017] flex items-center justify-between text-xs select-none">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToMenu}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-slate-300 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
            title="Volver al menú de aplicaciones"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="font-medium">Menú</span>
          </button>

          <div className="h-3.5 w-px bg-white/10" />

          <div className="flex items-center gap-2">
            <span className="font-semibold text-white tracking-tight">{app.name}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
          </div>
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          {/* Reload button */}
          <button
            onClick={handleReload}
            className="flex items-center gap-1 px-2.5 py-1 rounded-md text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
            title="Recargar marco de aplicación"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-emerald-400' : ''}`} />
            <span className="hidden sm:inline">Recargar</span>
          </button>

          {/* Open in about:blank */}
          <button
            onClick={handleLaunchAboutBlank}
            className="flex items-center gap-1 px-2.5 py-1 rounded-md text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors cursor-pointer"
            title="Abrir en pestaña discreta about:blank"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Pestaña discreta</span>
          </button>
        </div>
      </div>

      {/* Frame Container */}
      <div className="relative flex-1 w-full h-full bg-[#05070a]">
        {/* Loading overlay */}
        {isLoading && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#080a0f] text-slate-400">
            <div className="w-8 h-8 rounded-full border-2 border-emerald-500/20 border-t-emerald-500 animate-spin mb-3" />
            <span className="text-xs font-medium tracking-wide">Cargando {app.name}...</span>
            <span className="text-[11px] text-slate-500 mt-1">Conexión en curso</span>
          </div>
        )}

        {/* Security fallback notice (shown if iframe might be blocked or user needs alternative) */}
        {showIframeNotice && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30 max-w-lg w-[92%] px-4 py-3 rounded-xl bg-[#0f141f]/95 border border-white/10 shadow-2xl backdrop-blur-md flex items-center justify-between gap-3 text-xs text-slate-300 animate-fade-in">
            <div className="flex items-center gap-2.5">
              <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                ¿El marco tarda en responder? Puedes alternar a la pestaña discreta.
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleLaunchAboutBlank}
                className="px-2.5 py-1 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-medium transition-colors cursor-pointer"
              >
                Pestaña discreta
              </button>
              <button
                onClick={() => setShowIframeNotice(false)}
                className="p-1 text-slate-400 hover:text-white transition-colors cursor-pointer ml-1"
                title="Cerrar aviso"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Embedded Iframe occupying 100% without margins */}
        <iframe
          key={reloadKey}
          ref={iframeRef}
          src={app.url}
          title={app.name}
          className="w-full h-full border-0 block"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
          allowFullScreen
          onLoad={() => setIsLoading(false)}
        />
      </div>
    </div>
  );
};
