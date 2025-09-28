import React from 'react';

interface LiquidGlassProps {
  children: React.ReactNode;
  className?: string;
}

export const LiquidGlass = ({ children, className = '' }: LiquidGlassProps) => {
  return (
    <div
      className={`
        relative rounded-2xl
        bg-white/5 backdrop-blur-xl
        border border-white/10
        shadow-[0_0_30px_rgba(0,240,255,0.1)]
        overflow-hidden
        ${className}
      `}
    >
      <div className="absolute inset-0 opacity-30">
        <div 
          className="absolute top-0 left-0 w-full h-full"
          style={{
            background: `
              radial-gradient(circle at 20% 30%, rgba(0, 240, 255, 0.15) 0%, transparent 40%),
              radial-gradient(circle at 80% 70%, rgba(0, 240, 255, 0.1) 0%, transparent 50%)
            `,
          }}
        />
      </div>
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};