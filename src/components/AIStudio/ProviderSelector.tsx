import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Cpu, Eye } from 'lucide-react';
import { PROVIDERS_CONFIG, ProviderId, AIProviderInfo } from '../../types/ai';

interface ProviderSelectorProps {
  selectedProviderId: ProviderId;
  selectedModelId: string;
  onSelect: (providerId: ProviderId, modelId: string) => void;
}

export const ProviderSelector: React.FC<ProviderSelectorProps> = ({
  selectedProviderId,
  selectedModelId,
  onSelect,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentProvider =
    PROVIDERS_CONFIG.find((p) => p.id === selectedProviderId) || PROVIDERS_CONFIG[0];
  const currentModel =
    currentProvider.models.find((m) => m.id === selectedModelId) || currentProvider.models[0];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectModel = (provider: AIProviderInfo, modelId: string) => {
    onSelect(provider.id, modelId);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] hover:border-emerald-500/40 text-xs text-white transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
      >
        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span className="font-semibold text-slate-200">{currentProvider.name}</span>
        <span aria-hidden="true" className="text-slate-600">·</span>
        <span className="font-mono text-[11px] text-emerald-400 truncate max-w-[140px] sm:max-w-[200px]">
          {currentModel?.name || selectedModelId}
        </span>
        <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1" />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 mt-2 w-80 sm:w-96 rounded-2xl bg-[#0f141f] border border-white/10 shadow-2xl z-50 overflow-hidden divide-y divide-white/[0.05] animate-fade-in max-h-[80vh] overflow-y-auto">
          <div className="p-3 bg-white/[0.02]">
            <p className="text-xs font-medium text-white flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-emerald-400" />
              <span>Modelos y proveedores de IA</span>
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Selecciona el motor de razonamiento para tu conversación
            </p>
          </div>

          <div className="p-2 space-y-1">
            {PROVIDERS_CONFIG.map((provider) => {
              const isProviderActive = provider.id === selectedProviderId;

              return (
                <div
                  key={provider.id}
                  className={`rounded-xl p-2.5 transition-colors ${
                    isProviderActive ? 'bg-white/[0.05] border border-white/10' : 'hover:bg-white/[0.02]'
                  }`}
                >
                  {/* Provider Header */}
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs text-white">
                        {provider.name}
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/[0.06] text-slate-400">
                        {provider.badge}
                      </span>
                    </div>

                    {provider.isMultimodal && (
                      <span className="text-[10px] text-emerald-400/90 font-mono flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        <span>Visión</span>
                      </span>
                    )}
                  </div>

                  <p className="text-[11px] text-slate-400 mb-2 leading-relaxed">
                    {provider.description}
                  </p>

                  {/* Models list under this provider */}
                  <div className="grid grid-cols-1 gap-1">
                    {provider.models.map((model) => {
                      const isModelActive =
                        isProviderActive && model.id === selectedModelId;

                      return (
                        <button
                          key={model.id}
                          type="button"
                          onClick={() => handleSelectModel(provider, model.id)}
                          className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between transition-colors cursor-pointer text-xs ${
                            isModelActive
                              ? 'bg-emerald-500/20 text-emerald-300 font-medium'
                              : 'text-slate-300 hover:text-white hover:bg-white/[0.04]'
                          }`}
                        >
                          <div className="flex flex-col">
                            <span className="font-medium text-[11px] flex items-center gap-1.5">
                              {model.name}
                              {model.isMultimodal && (
                                <span className="text-[9px] px-1 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-normal">
                                  Fotos
                                </span>
                              )}
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono">
                              {model.contextWindow} ctx · {model.speedRating}
                            </span>
                          </div>

                          {isModelActive && <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
