import React from 'react';
import { ArrowLeft, Home, Sparkles } from 'lucide-react';
import { AppDefinition } from '../types/app';

interface HeaderProps {
  currentApp: AppDefinition | null;
  onNavigateHome: () => void;
  onSelectApp?: (app: AppDefinition) => void;
}

export const Header: React.FC<HeaderProps> = ({ currentApp, onNavigateHome }) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/[0.06] bg-[#080a0f]/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo & Brand: Inspired by Google Classroom */}
        <div className="flex items-center gap-3">
          <button
            onClick={onNavigateHome}
            className="flex items-center gap-3 text-left group focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-lg p-1"
            title="Volver al menú principal"
          >
            {/* Google Classroom inspired icon */}
            <div className="w-9 h-9 rounded-lg bg-[#137333] border-2 border-[#fbbc04] flex items-center justify-center shadow-sm relative overflow-hidden transition-transform duration-200 group-hover:scale-105">
              <svg
                viewBox="0 0 24 24"
                className="w-5 h-5 text-white"
                fill="currentColor"
                aria-hidden="true"
              >
                <circle cx="12" cy="8" r="2.5" />
                <path d="M7 16 C7 13.2 9.2 12 12 12 C14.8 12 17 13.2 17 16 Z" />
                <circle cx="6" cy="9.5" r="1.8" opacity="0.8" />
                <path d="M2.5 16 C2.5 13.8 4 13 5.8 13 C6.7 13 7.5 13.3 8.1 13.8 C7.4 14.5 7 15.2 7 16 Z" opacity="0.8" />
                <circle cx="18" cy="9.5" r="1.8" opacity="0.8" />
                <path d="M21.5 16 C21.5 13.8 20 13 18.2 13 C17.3 13 16.5 13.3 15.9 13.8 C16.6 14.5 17 15.2 17 16 Z" opacity="0.8" />
              </svg>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-white tracking-tight text-base sm:text-lg">
                  Home - clases
                </span>
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              </div>
              <span className="text-[11px] text-slate-400 hidden sm:block">
                Portal de aplicaciones y herramientas
              </span>
            </div>
          </button>

          {currentApp && (
            <div className="flex items-center gap-2 pl-3 border-l border-white/10 text-xs text-slate-400">
              <span className="text-slate-500 hidden md:inline">Lanzador</span>
              <span className="text-slate-600 hidden md:inline">/</span>
              <span className="text-white font-medium flex items-center gap-1.5">
                {currentApp.name}
              </span>
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {currentApp ? (
            <button
              onClick={onNavigateHome}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 bg-white/[0.04] hover:bg-white/[0.08] hover:text-white border border-white/[0.08] transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Volver al menú</span>
            </button>
          ) : (
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="hidden sm:inline text-slate-500">3 aplicaciones activas</span>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-[11px]">
                <Sparkles className="w-3 h-3" />
                <span>v2.0</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
