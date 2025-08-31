// Board Position Types
export interface Point {
  number: number;
  pieces: Piece[];
}

export interface Piece {
  color: 'white' | 'red';
  id: string;
}

export interface BoardPosition {
  id: string;
  points: Point[];
  bar: {
    white: number;
    red: number;
  };
  bearOff: {
    white: number;
    red: number;
  };
  toMove: 'white' | 'red';
  dice?: [number, number];
  timestamp: Date;
}

// Analysis Types
export interface PositionAnalysis {
  positionId: string;
  winningChances: {
    win: number;
    gammon: number;
    backgammon: number;
  };
  evaluation: number;
  bestMoves: Move[];
  confidence: number;
}

export interface Move {
  notation: string;
  from: number;
  to: number;
  evaluation: number;
  winRate: number;
}

// Computer Vision Types
export interface BoardDetection {
  corners: Point2D[];
  confidence: number;
  boardRect: Rect;
  isValid: boolean;
}

export interface Point2D {
  x: number;
  y: number;
}

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface PieceDetection {
  position: Point2D;
  color: 'white' | 'red';
  confidence: number;
  pointNumber: number;
}

// Navigation Types
export type RootTabParamList = {
  Camera: undefined;
  Analysis: { positionId?: string };
  History: undefined;
  Settings: undefined;
};

export type CameraStackParamList = {
  CameraMain: undefined;
  CameraResult: { analysis: PositionAnalysis };
};

// App State Types
export interface AppSettings {
  darkMode: boolean;
  flashEnabled: boolean;
  autoCapture: boolean;
  soundEnabled: boolean;
  hapticFeedback: boolean;
}

export interface HistoryItem extends BoardPosition {
  analysis?: PositionAnalysis;
  imageUri?: string;
}

