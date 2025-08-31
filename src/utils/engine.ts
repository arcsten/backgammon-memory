import type { BoardPosition, PositionAnalysis } from '@/types';

// JSI binding (to be implemented natively)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const globalAny = global as any;

type EngineJSI = {
  init: (modelPath?: string) => boolean;
  evaluatePosition: (encoded: string) => PositionAnalysis;
};

const nativeEngine: EngineJSI | null = globalAny?.WildBGEngine ?? null;

export const encodeForEngine = (position: BoardPosition): string => {
  // Simple encoding: counts per point white-red; bar/bearoff appended
  const body = position.points
    .map((p) => `${p.pieces.filter(x => x.color === 'white').length},${p.pieces.filter(x => x.color === 'red').length}`)
    .join(';');
  return `BM|${body}|bar:${position.bar.white},${position.bar.red}|bear:${position.bearOff.white},${position.bearOff.red}|turn:${position.toMove}`;
};

export const Engine = {
  isNativeAvailable(): boolean {
    return !!nativeEngine;
  },

  init(modelPath?: string): boolean {
    try {
      return nativeEngine ? nativeEngine.init(modelPath) : true;
    } catch (e) {
      console.warn('Engine init failed, using JS fallback', e);
      return false;
    }
  },

  async evaluate(position: BoardPosition): Promise<PositionAnalysis> {
    const encoded = encodeForEngine(position);
    try {
      if (nativeEngine) {
        return nativeEngine.evaluatePosition(encoded);
      }
    } catch (e) {
      console.warn('Native engine evaluate failed, using JS fallback', e);
    }
    // JS fallback: lightweight heuristic (same as current)
    const whiteTotal = position.points.reduce((s, p) => s + p.pieces.filter(x => x.color === 'white').length, 0) + position.bar.white;
    const redTotal = position.points.reduce((s, p) => s + p.pieces.filter(x => x.color === 'red').length, 0) + position.bar.red;
    const diff = redTotal - whiteTotal;
    const evaluation = Math.max(-2, Math.min(2, diff / 15));
    return {
      positionId: encoded,
      winningChances: {
        win: Math.max(5, Math.min(95, 50 + evaluation * 20)),
        gammon: 10,
        backgammon: 2,
      },
      evaluation,
      bestMoves: [],
      confidence: 0.5,
    };
  },
};

export default Engine;


