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
    // JS fallback: lightweight heuristic using pip counts and distribution
    const countColor = (color: 'white' | 'red') =>
      position.points.reduce((s, p) => s + p.pieces.filter(x => x.color === color).length, 0);
    const whiteTotal = countColor('white') + position.bar.white;
    const redTotal = countColor('red') + position.bar.red;

    // Pip counts: white moves towards point 1, red towards point 24
    const whitePips = position.points.reduce((sum, p) =>
      sum + (p.number) * p.pieces.filter(x => x.color === 'white').length, 0);
    const redPips = position.points.reduce((sum, p) =>
      sum + (25 - p.number) * p.pieces.filter(x => x.color === 'red').length, 0);

    // Blot penalty: points with exactly one checker
    const whiteBlots = position.points.filter(p => p.pieces.filter(x => x.color === 'white').length === 1).length;
    const redBlots = position.points.filter(p => p.pieces.filter(x => x.color === 'red').length === 1).length;

    // Normalize advantages (lower pips better)
    const pipAdv = (redPips - whitePips) / 60; // scale to roughly [-5,5] early game
    const blotAdv = (redBlots - whiteBlots) * 0.2;
    const materialAdv = (whiteTotal - redTotal) * 0.3;
    let evaluation = pipAdv + blotAdv + materialAdv;
    evaluation = Math.max(-3, Math.min(3, evaluation));
    return {
      positionId: encoded,
      winningChances: {
        win: Math.max(5, Math.min(95, 50 + evaluation * 8)),
        gammon: Math.max(0, Math.min(30, 12 + evaluation * 2)),
        backgammon: Math.max(0, Math.min(10, 2 + evaluation * 0.8)),
      },
      evaluation,
      bestMoves: [],
      confidence: 0.5,
    };
  },
};

export default Engine;


