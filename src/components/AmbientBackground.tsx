import React, { useEffect, useState } from 'react';

export const AmbientBackground: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsVisible(!document.hidden);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden z-0"
      aria-hidden="true"
    >
      {/* Base deep dark gradient */}
      <div className="absolute inset-0 bg-[#080a0f] bg-gradient-to-b from-[#0a0d14] via-[#080a0f] to-[#05070a]" />

      {/* Subtle geometric dot grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)`,
          backgroundSize: '36px 36px',
        }}
      />

      {isVisible && (
        <>
          {/* Fluid floating glow orbs with slow CSS transforms */}
          <div
            className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-emerald-600/10 blur-[120px] animate-ambient-1"
          />
          <div
            className="absolute top-1/3 -right-32 w-[32rem] h-[32rem] rounded-full bg-cyan-600/10 blur-[140px] animate-ambient-2"
          />
          <div
            className="absolute -bottom-32 left-1/3 w-[28rem] h-[28rem] rounded-full bg-slate-600/10 blur-[130px] animate-ambient-1"
          />
        </>
      )}

      {/* Top subtle light reflection */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
    </div>
  );
};
