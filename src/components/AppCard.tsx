import React, { useRef, useState } from 'react';
import { Cloud, Film, Sparkles, Layout, ShieldCheck } from 'lucide-react';
import { AppDefinition, LaunchMode } from '../types/app';

interface AppCardProps {
  app: AppDefinition;
  onLaunch: (app: AppDefinition, mode: LaunchMode) => void;
}

export const AppCard: React.FC<AppCardProps> = ({ app, onLaunch }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const getIcon = () => {
    switch (app.id) {
      case 'cloud-app':
        return <Cloud className="w-6 h-6 text-cyan-400" />;
      case 'cinera':
        return <Film className="w-6 h-6 text-amber-400" />;
      case 'ai-studio':
        return <Sparkles className="w-6 h-6 text-emerald-400" />;
    }
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative rounded-2xl bg-[#0f131a]/90 border border-white/[0.08] hover:border-white/[0.18] transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-lg hover:shadow-2xl hover:shadow-black/50"
    >
      {/* Dynamic mouse spotlight highlight */}
      {isHovered && (
        <div
          className="pointer-events-none absolute -inset-px opacity-100 transition-opacity duration-300 rounded-2xl"
          style={{
            background: `radial-gradient(400px circle at ${mousePos.x}px ${mousePos.y}px, rgba(255, 255, 255, 0.06), transparent 80%)`,
          }}
        />
      )}

      {/* Top ambient color bleed */}
      <div className={`absolute top-0 inset-x-0 h-28 bg-gradient-to-b ${app.accentColor} opacity-50 group-hover:opacity-80 transition-opacity`} />

      {/* Card Content */}
      <div className="relative p-6 sm:p-7 z-10 flex flex-col flex-1">
        {/* Header row: Icon & category metadata */}
        <div className="flex items-start justify-between mb-5">
          <div className="w-12 h-12 rounded-xl bg-white/[0.05] border border-white/[0.1] flex items-center justify-center backdrop-blur-sm group-hover:scale-105 transition-transform duration-200">
            {getIcon()}
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>{app.category}</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono text-[11px] text-slate-500">{app.badge}</span>
          </div>
        </div>

        {/* Title & Tagline */}
        <div className="mb-3">
          <h3 className="text-xl font-semibold text-white tracking-tight group-hover:text-emerald-400 transition-colors">
            {app.name}
          </h3>
          <p className="text-xs text-emerald-400/90 font-medium mt-1">
            {app.tagline}
          </p>
        </div>

        {/* Description */}
        <p className="text-sm text-slate-300/90 leading-relaxed mb-6 flex-1">
          {app.description}
        </p>

        {/* Unboxed Features text line */}
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-slate-400 pb-6 border-b border-white/[0.06]">
          {app.features.map((feat, idx) => (
            <React.Fragment key={feat}>
              <span>{feat}</span>
              {idx < app.features.length - 1 && <span aria-hidden="true" className="text-slate-600">·</span>}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Launch Actions */}
      <div className="relative z-10 p-4 sm:px-7 bg-white/[0.02] border-t border-white/[0.04] flex flex-col sm:flex-row gap-2">
        {/* Mode A: In-App */}
        <button
          onClick={() => onLaunch(app, 'in-app')}
          aria-label={`Abrir ${app.name} en marco`}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.06] hover:bg-emerald-500/20 hover:text-emerald-300 text-slate-200 text-xs font-medium border border-white/[0.08] hover:border-emerald-500/30 transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
        >
          <Layout className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-400" />
          <span>Abrir en marco</span>
        </button>

        {/* Mode B: about:blank Cloak */}
        <button
          onClick={() => onLaunch(app, 'about-blank')}
          aria-label={`Abrir ${app.name} en pestaña discreta`}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] text-slate-300 hover:text-white text-xs font-medium border border-white/[0.06] transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
          title="Abrir en pestaña discreta con about:blank"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
          <span>Pestaña discreta</span>
        </button>
      </div>
    </div>
  );
};
