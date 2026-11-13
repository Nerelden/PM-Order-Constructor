import React from 'react';

interface RuinaCornerFrameProps {
  color?: string;
  size?: number;
}

export const RuinaCornerFrame: React.FC<RuinaCornerFrameProps> = ({
  color = 'rgba(218, 178, 92, 0.72)',
  size = 12,
}) => {
  const borderStyle = `2px solid ${color}`;
  const sizePx = `${size}px`;

  return (
    <div className="pointer-events-none absolute inset-0 z-20 overflow-hidden" aria-hidden="true">
      {/* Top-Left Corner */}
      <span
        style={{ width: sizePx, height: sizePx, borderTop: borderStyle, borderLeft: borderStyle }}
        className="absolute top-1.5 left-1.5"
      />
      {/* Top-Right Corner */}
      <span
        style={{ width: sizePx, height: sizePx, borderTop: borderStyle, borderRight: borderStyle }}
        className="absolute top-1.5 right-1.5"
      />
      {/* Bottom-Left Corner */}
      <span
        style={{ width: sizePx, height: sizePx, borderBottom: borderStyle, borderLeft: borderStyle }}
        className="absolute bottom-1.5 left-1.5"
      />
      {/* Bottom-Right Corner */}
      <span
        style={{ width: sizePx, height: sizePx, borderBottom: borderStyle, borderRight: borderStyle }}
        className="absolute bottom-1.5 right-1.5"
      />
    </div>
  );
};

interface RuinaDiamondDividerProps {
  label?: string;
  className?: string;
  crimson?: boolean;
}

export const RuinaDiamondDivider: React.FC<RuinaDiamondDividerProps> = ({
  label,
  className = '',
  crimson = false,
}) => {
  const lineColor = crimson
    ? 'from-transparent via-red-700/60 to-red-700/70'
    : 'from-transparent via-[#c9a252]/40 to-[#c9a252]/65';
  const diamondClass = crimson
    ? 'border-red-500/80 bg-red-950/90'
    : 'border-[#d4af37]/80 bg-[#1a1410]';

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`} aria-hidden={!label}>
      <div className={`h-px flex-1 bg-gradient-to-r ${lineColor}`} />
      <span className={`w-2 h-2 rotate-45 border ${diamondClass} flex-shrink-0`} />
      {label && (
        <>
          <span className="text-xs font-cinzel uppercase tracking-widest text-[#d9bc7a] px-1">
            {label}
          </span>
          <span className={`w-2 h-2 rotate-45 border ${diamondClass} flex-shrink-0`} />
        </>
      )}
      <div className={`h-px flex-1 bg-gradient-to-l ${lineColor}`} />
    </div>
  );
};
