import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { AmbientBackground } from './components/AmbientBackground';
import { AppCard } from './components/AppCard';
import { InAppViewer } from './components/InAppViewer';
import { AboutBlankModal } from './components/AboutBlankModal';
import { AIStudioApp } from './components/AIStudio/AIStudioApp';
import { APPS, AppDefinition, LaunchMode } from './types/app';
import { openInAboutBlank } from './utils/cloaker';
import { Shield, Sparkles, Layers, Terminal } from 'lucide-react';

export default function App() {
  const [currentApp, setCurrentApp] = useState<AppDefinition | null>(null);
  const [viewMode, setViewMode] = useState<'launcher' | 'in-app'>('launcher');
  const [blockedModalApp, setBlockedModalApp] = useState<AppDefinition | null>(null);
  const [isStandaloneAI, setIsStandaloneAI] = useState(false);

  // Check URL query parameters (for standalone about:blank launcher)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('app') === 'ai-studio') {
      setIsStandaloneAI(true);
      const aiApp = APPS.find((a) => a.id === 'ai-studio');
      if (aiApp) {
        setCurrentApp(aiApp);
        setViewMode('in-app');
      }
    }
  }, []);

  const handleLaunch = (app: AppDefinition, mode: LaunchMode) => {
    if (mode === 'in-app') {
      setCurrentApp(app);
      setViewMode('in-app');
    } else if (mode === 'about-blank') {
      const targetUrl = app.isExternal
        ? app.url
        : `${window.location.origin}?app=ai-studio`;

      const result = openInAboutBlank(targetUrl, 'Home - clases', app.name);
      if (result.blocked) {
        setBlockedModalApp(app);
      }
    }
  };

  const handleNavigateHome = () => {
    if (isStandaloneAI) {
      window.location.href = window.location.origin;
      return;
    }
    setCurrentApp(null);
    setViewMode('launcher');
  };

  return (
    <div className="min-h-screen bg-[#080a0f] text-slate-100 flex flex-col relative selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Fluid ambient motion background */}
      <AmbientBackground />

      {/* Top Header */}
      <Header
        currentApp={currentApp}
        onNavigateHome={handleNavigateHome}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col z-10">
        {viewMode === 'in-app' && currentApp ? (
          currentApp.id === 'ai-studio' ? (
            <AIStudioApp
              onBackToMenu={handleNavigateHome}
              standalone={isStandaloneAI}
            />
          ) : (
            <InAppViewer
              app={currentApp}
              onBackToMenu={handleNavigateHome}
              onOpenBlockedModal={() => setBlockedModalApp(currentApp)}
            />
          )
        ) : (
          /* Launcher View */
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-16 w-full flex-1 flex flex-col justify-between">
            {/* Hero Section */}
            <div className="max-w-2xl mb-12 sm:mb-16">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-emerald-400 font-mono mb-3">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>Portal de Acceso Centralizado</span>
                </div>
                <span aria-hidden="true" className="text-slate-600 hidden sm:inline">·</span>
                <span>Modos A / B Habilitados</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-white mb-4 leading-[1.15]">
                Lanzador de aplicaciones <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
                  y modelos inteligentes
                </span>
              </h1>

              <p className="text-sm sm:text-base text-slate-300/90 leading-relaxed">
                Accede de forma rápida y minimalista a tus aplicaciones web. Visualiza las herramientas integradas en marco interno o lánzalas en pestaña discreta camuflada como <strong className="text-white font-medium">Home - clases</strong>.
              </p>
            </div>

            {/* The 3 App Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
              {APPS.map((app) => (
                <AppCard
                  key={app.id}
                  app={app}
                  onLaunch={handleLaunch}
                />
              ))}
            </div>

            {/* Features and Privacy Banner */}
            <div className="pt-8 border-t border-white/[0.06] flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-400">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-slate-500">
                <span className="text-slate-400 font-medium">Capacidades del portal:</span>
                <span>Modo A (Marco embebido)</span>
                <span aria-hidden="true">·</span>
                <span>Modo B (about:blank container)</span>
                <span aria-hidden="true">·</span>
                <span>IA con streaming server-side</span>
              </div>

              <div className="flex items-center gap-2 text-slate-400">
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                <span>Seguridad de API keys en servidor</span>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Popup blocked recovery modal */}
      <AboutBlankModal
        app={blockedModalApp}
        isOpen={Boolean(blockedModalApp)}
        onClose={() => setBlockedModalApp(null)}
      />
    </div>
  );
}
