'use client';

import { FC, memo, useEffect, useRef } from 'react';
import { SymbolState, SymbolData } from '@/types/game';
import { getSymbolAsset } from '@/assets/symbolMap';

interface SymbolProps {
  data: SymbolData;
  size?: number;
  onAnimationEnd?: (symbolId: string) => void;
}

const stateClassMap: Record<SymbolState, string> = {
  idle: '',
  spinning: 'animate-spin',
  stopping: 'animate-stop',
  winning: 'animate-win',
};

export const Symbol: FC<SymbolProps> = memo(function Symbol({ data, size = 64, onAnimationEnd }) {
  const imgRef = useRef<HTMLImageElement>(null);
  const prevStateRef = useRef<SymbolState>(data.state);

  useEffect(() => {
    const img = imgRef.current;
    if (!img) return;

    const handleAnimationEnd = () => {
      if (data.state === 'stopping' && prevStateRef.current === 'spinning') {
        onAnimationEnd?.(data.id);
      }
    };

    img.addEventListener('animationend', handleAnimationEnd);
    return () => img.removeEventListener('animationend', handleAnimationEnd);
  }, [data.state, onAnimationEnd]);

  useEffect(() => {
    prevStateRef.current = data.state;
  }, [data.state]);

  const assetUrl = getSymbolAsset(data.id);
  const isMultiplier = data.id.startsWith('sym_mult_');
  const multiplierValue = data.multiplierValue;
  const baseClass = 'slot-symbol will-change-transform';
  const stateClass = stateClassMap[data.state] || '';
  const winZIndex = data.state === 'winning' ? 'z-20' : '';

  return (
    <div
      className={`relative inline-block ${winZIndex}`}
      style={{ width: size, height: size }}
    >
      <img
        ref={imgRef}
        src={assetUrl}
        alt={data.id}
        className={`${baseClass} ${stateClass}`}
        style={{
          width: size,
          height: size,
          filter: data.state === 'spinning' ? 'blur(8px)' : 'none',
        }}
        loading="lazy"
      />

      {isMultiplier && multiplierValue && (
        <div
          className={`absolute -top-2 -right-2 text-xs font-bold px-1.5 py-0.5 rounded-full
                     bg-gradient-to-r from-yellow-500 to-yellow-600 text-[var(--color-bg-primary)]
                     shadow-[0_0_8px_rgba(255,215,0,0.6)] animate-multiplier-pop`}
          style={{ fontSize: size * 0.18 }}
        >
          {multiplierValue}x
        </div>
      )}

      {data.state === 'winning' && !isMultiplier && (
        <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-yellow-300/30 via-transparent to-yellow-500/30 opacity-0 animate-win-flash pointer-events-none" />
      )}
    </div>
  );
});

Symbol.displayName = 'Symbol';