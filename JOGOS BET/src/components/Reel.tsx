'use client';

import { useEffect, useRef, useState } from 'react';
import { Symbol } from './Symbol';
import { SymbolData, SymbolState } from '@/types/game';

interface ReelProps {
  column: SymbolData[];
  isSpinning: boolean;
  isStopping: boolean;
  finalSymbols: SymbolData[];
  onStopComplete: () => void;
  symbolSize: number;
}

const VISIBLE_ROWS = 5;
const BUFFER_ROWS = 3;
const TOTAL_STRIP_LENGTH = VISIBLE_ROWS + BUFFER_ROWS * 2;

export function Reel({ column, isSpinning, isStopping, finalSymbols, onStopComplete, symbolSize = 64 }: ReelProps) {
  const reelRef = useRef<HTMLDivElement>(null);
  const [strip, setStrip] = useState<SymbolData[]>([]);
  const [translateY, setTranslateY] = useState(0);
  const [transition, setTransition] = useState('none');
  const animationFrameRef = useRef<number>();
  const spinStartRef = useRef<number>();
  const finalPositionRef = useRef<number>(0);

  const generateStrip = (symbols: SymbolData[], isFinal = false): SymbolData[] => {
    const stripSymbols: SymbolData[] = [];
    const source = isFinal ? finalSymbols : symbols;
    
    for (let i = 0; i < BUFFER_ROWS; i++) {
      const idx = (source.length - BUFFER_ROWS + i) % source.length;
      stripSymbols.push({ ...source[idx], state: 'idle' as SymbolState });
    }
    
    source.forEach(s => stripSymbols.push({ ...s, state: isFinal ? s.state : 'spinning' as SymbolState }));
    
    for (let i = 0; i < BUFFER_ROWS; i++) {
      const idx = i % source.length;
      stripSymbols.push({ ...source[idx], state: 'idle' as SymbolState });
    }
    
    return stripSymbols;
  };

  useEffect(() => {
    if (isSpinning && !isStopping) {
      setStrip(generateStrip(column));
      setTransition('none');
      setTranslateY(0);
      
      spinStartRef.current = performance.now();
      animateSpin();
    } else if (isStopping) {
      setStrip(generateStrip(column, true));
      const targetY = -BUFFER_ROWS * symbolSize;
      finalPositionRef.current = targetY;
      
      setTransition(`transform 0.45s cubic-bezier(0.34, 1.56, 0.64, 1)`);
      setTranslateY(targetY);
    } else {
      setStrip(generateStrip(finalSymbols, true));
      setTransition('none');
      setTranslateY(-BUFFER_ROWS * symbolSize);
    }
  }, [isSpinning, isStopping, column, finalSymbols, symbolSize]);

  const animateSpin = () => {
    const now = performance.now();
    const elapsed = now - (spinStartRef.current || now);
    const speed = 1800; // pixels per second
    const distance = (elapsed / 1000) * speed;
    const rowHeight = symbolSize;
    const cycleLength = VISIBLE_ROWS * rowHeight;
    
    const currentY = -(distance % cycleLength) - BUFFER_ROWS * rowHeight;
    setTranslateY(currentY);
    
    animationFrameRef.current = requestAnimationFrame(animateSpin);
  };

  useEffect(() => {
    if (isStopping) {
      const timer = setTimeout(() => {
        onStopComplete();
      }, 450);
      return () => clearTimeout(timer);
    }
  }, [isStopping, onStopComplete]);

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <div
      className="slot-reel relative overflow-hidden"
      style={{ 
        width: symbolSize, 
        height: VISIBLE_ROWS * symbolSize,
        perspective: '1000px'
      }}
    >
      <div
        ref={reelRef}
        className="flex flex-col"
        style={{
          transform: `translateY(${translateY}px)`,
          transition: transition,
          willChange: 'transform',
        }}
      >
        {strip.map((symbol, index) => (
          <Symbol
            key={`strip-${index}`}
            data={symbol}
            size={symbolSize}
          />
        ))}
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-bg-primary)] via-transparent to-[var(--color-bg-primary)] pointer-events-none z-10" />
    </div>
  );
}