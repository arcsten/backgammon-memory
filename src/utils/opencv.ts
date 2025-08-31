// OpenCV processing pipeline for backgammon board analysis
import type { BoardDetection, PieceDetection, BoardPosition, Point2D, Point } from '@/types';

// Note: This is a placeholder implementation
// In a real app, you would use react-native-opencv-tutorial for actual CV processing

export class BackgammonCV {
  private static instance: BackgammonCV;

  static getInstance(): BackgammonCV {
    if (!BackgammonCV.instance) {
      BackgammonCV.instance = new BackgammonCV();
    }
    return BackgammonCV.instance;
  }

  /**
   * Step 1: Image Preprocessing
   * - Gaussian blur → reduce noise
   * - Edge detection (Canny) → find board outline
   * - Perspective correction → straighten board
   */
  async preprocessImage(imageUri: string): Promise<string> {
    // TODO: Implement with OpenCV
    // 1. Load image
    // 2. Apply Gaussian blur (kernel size 5x5)
    // 3. Convert to grayscale
    // 4. Apply Canny edge detection (threshold 50-150)
    console.log('Preprocessing image:', imageUri);
    return imageUri; // Return processed image URI
  }

  /**
   * Step 2: Board Detection
   * - Contour detection → find rectangular board
   * - Corner detection → identify 4 board corners
   * - Homography transform → normalize perspective
   */
  async detectBoard(imageUri: string): Promise<BoardDetection> {
    // TODO: Implement with OpenCV
    // 1. Find contours
    // 2. Filter for rectangular shapes
    // 3. Find largest rectangle (likely the board)
    // 4. Extract corner points
    // 5. Calculate confidence based on geometry

    // Mock implementation
    const mockCorners: Point2D[] = [
      { x: 50, y: 100 },
      { x: 350, y: 100 },
      { x: 350, y: 250 },
      { x: 50, y: 250 },
    ];

    return {
      corners: mockCorners,
      confidence: 0.85,
      boardRect: { x: 50, y: 100, width: 300, height: 150 },
      isValid: true,
    };
  }

  /**
   * Step 3: Point Segmentation
   * - Template matching → locate 24 triangular points
   * - Grid mapping → create coordinate system
   * - Region of interest → extract each point area
   */
  async segmentPoints(imageUri: string, boardDetection: BoardDetection): Promise<Point2D[]> {
    // TODO: Implement with OpenCV
    // 1. Apply homography to normalize board perspective
    // 2. Create template for triangular points
    // 3. Match template across board
    // 4. Create 24-point grid mapping
    // 5. Extract ROI for each point

    // Mock implementation - 24 points in backgammon layout
    const points: Point2D[] = [];
    const { boardRect } = boardDetection;
    const pointWidth = boardRect.width / 14; // 12 points + 2 for bar sections

    // Bottom points (1-12)
    for (let i = 0; i < 12; i++) {
      points.push({
        x: boardRect.x + (i < 6 ? i : i + 2) * pointWidth + pointWidth / 2,
        y: boardRect.y + boardRect.height * 0.8,
      });
    }

    // Top points (13-24)
    for (let i = 0; i < 12; i++) {
      points.push({
        x: boardRect.x + (i < 6 ? 6 - i - 1 : 14 - i - 1) * pointWidth + pointWidth / 2,
        y: boardRect.y + boardRect.height * 0.2,
      });
    }

    return points;
  }

  /**
   * Step 4: Piece Recognition
   * - Color space conversion (HSV) → better color separation
   * - Color thresholding → separate white/red pieces
   * - Circle detection (HoughCircles) → count round pieces
   * - Contour analysis → verify piece shapes
   */
  async detectPieces(imageUri: string, pointLocations: Point2D[]): Promise<PieceDetection[]> {
    // TODO: Implement with OpenCV
    // 1. Convert to HSV color space
    // 2. Define color ranges for white and red pieces
    // 3. Apply color thresholding
    // 4. Use HoughCircles to detect circular shapes
    // 5. Analyze contours for piece validation
    // 6. Map pieces to nearest point locations

    // Mock implementation
    const pieces: PieceDetection[] = [];
    
    // Add some mock pieces
    pointLocations.forEach((point, index) => {
      if (index % 4 === 0) { // Mock: every 4th point has pieces
        const pieceCount = Math.floor(Math.random() * 5) + 1;
        for (let i = 0; i < pieceCount; i++) {
          pieces.push({
            position: {
              x: point.x + (Math.random() - 0.5) * 10,
              y: point.y + i * 15,
            },
            color: index < 12 ? 'white' : 'red',
            confidence: 0.8 + Math.random() * 0.2,
            pointNumber: index + 1,
          });
        }
      }
    });

    return pieces;
  }

  /**
   * Step 5: Position Extraction
   * - Geometric mapping → pieces to board positions
   * - Validation → check legal backgammon rules
   * - Position ID generation → standard format
   */
  async extractPosition(pieces: PieceDetection[]): Promise<BoardPosition> {
    // TODO: Implement position parsing
    // 1. Group pieces by point number
    // 2. Count pieces per point and color
    // 3. Validate total piece count (15 per color)
    // 4. Check for legal position
    // 5. Generate position ID in standard format

    // Mock implementation
    const points = Array.from({ length: 24 }, (_, i) => ({
      number: i + 1,
      pieces: pieces
        .filter(p => p.pointNumber === i + 1)
        .map((p, idx) => ({
          color: p.color,
          id: `${i + 1}-${idx}`,
        })),
    }));

    return {
      id: this.generatePositionId(points),
      points,
      bar: { white: 0, red: 0 },
      bearOff: { white: 0, red: 0 },
      toMove: 'white',
      timestamp: new Date(),
    };
  }

  /**
   * Generate a position ID in standard backgammon format
   */
  private generatePositionId(points: any[]): string {
    // TODO: Implement proper position ID generation
    // This should create a standard format like GNU Backgammon position IDs
    
    // Mock implementation
    const timestamp = Date.now().toString(36);
    return `BG${timestamp}`;
  }

  /**
   * Complete pipeline: process image and extract board position
   */
  async processImage(imageUri: string): Promise<{
    position: BoardPosition;
    detection: BoardDetection;
    confidence: number;
  }> {
    try {
      // Step 1: Preprocess image
      const processedImage = await this.preprocessImage(imageUri);
      
      // Step 2: Detect board
      const boardDetection = await this.detectBoard(processedImage);
      
      if (!boardDetection.isValid) {
        throw new Error('Board not detected');
      }
      
      // Step 3: Segment points
      const pointLocations = await this.segmentPoints(processedImage, boardDetection);
      
      // Step 4: Detect pieces
      const pieces = await this.detectPieces(processedImage, pointLocations);
      
      // Step 5: Extract position
      const position = await this.extractPosition(pieces);
      
      // Calculate overall confidence
      const confidence = boardDetection.confidence * 0.4 + 
                        (pieces.reduce((sum, p) => sum + p.confidence, 0) / pieces.length) * 0.6;
      
      return {
        position,
        detection: boardDetection,
        confidence: Math.min(confidence, 1.0),
      };
      
    } catch (error) {
      console.error('Error processing image:', error);
      throw error;
    }
  }
}

export const backgammonCV = BackgammonCV.getInstance();

// Lightweight helpers for initial analysis
export const extractMockPosition = (): BoardPosition => {
  const points: Point[] = Array.from({ length: 24 }, (_, i) => ({ number: i + 1, pieces: [] }));
  const push = (pt: number, n: number, color: 'white' | 'red') => {
    for (let i = 0; i < n; i++) points[pt - 1].pieces.push({ color, id: `${color}-${pt}-${i}` });
  };
  push(1, 2, 'white');
  push(6, 5, 'red');
  push(8, 3, 'red');
  push(12, 5, 'white');
  push(13, 5, 'red');
  push(17, 3, 'white');
  push(19, 5, 'white');
  push(24, 2, 'red');
  return {
    id: Date.now().toString(),
    points,
    bar: { white: 0, red: 0 },
    bearOff: { white: 0, red: 0 },
    toMove: 'white',
    timestamp: new Date(),
  };
};

export const computePositionId = (position: BoardPosition): string => {
  const counts = position.points
    .map(p => `${p.pieces.filter(x => x.color === 'white').length}-${p.pieces.filter(x => x.color === 'red').length}`)
    .join('.');
  return `BM:${counts}`;
};

export const heuristicEvaluate = (position: BoardPosition) => {
  const whiteTotal = position.points.reduce((s, p) => s + p.pieces.filter(x => x.color === 'white').length, 0) + position.bar.white;
  const redTotal = position.points.reduce((s, p) => s + p.pieces.filter(x => x.color === 'red').length, 0) + position.bar.red;
  const diff = redTotal - whiteTotal; // positive favors white
  const evaluation = Math.max(-2, Math.min(2, diff / 15));
  return {
    positionId: computePositionId(position),
    winningChances: {
      win: Math.max(5, Math.min(95, 50 + evaluation * 20)),
      gammon: 10,
      backgammon: 2,
    },
    evaluation,
    bestMoves: [],
    confidence: 0.5,
  } as const;
};

export const generateRandomPosition = (): BoardPosition => {
  // Generate a simple legal-like random position: no point contains both colors,
  // each color has exactly 15 checkers, max 5 per point, no bar/bearoff.
  const remainingWhite = { value: 15 };
  const remainingRed = { value: 15 };
  const countsW = new Array<number>(24).fill(0);
  const countsR = new Array<number>(24).fill(0);
  const allPoints = Array.from({ length: 24 }, (_, i) => i);
  const perPointCap = 10; // allow stacks >5; UI shows "+N" beyond 5
  // Shuffle helper
  const shuffle = (arr: number[]) => {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  };
  const distribute = (counts: number[], pool: number[], remainingRef: { value: number }) => {
    // Round-robin add 1 up to 5 per point until remaining is 0
    const seq = [...pool];
    shuffle(seq);
    while (remainingRef.value > 0) {
      let progressed = false;
      for (let idx = 0; idx < seq.length && remainingRef.value > 0; idx++) {
        const p = seq[idx];
        if (counts[p] < perPointCap) {
          counts[p] += 1;
          remainingRef.value -= 1;
          progressed = true;
        }
      }
      if (!progressed) break; // all full (5)
    }
  };

  // Choose distinct point sets
  const pool = [...allPoints];
  shuffle(pool);
  const whiteSetSize = Math.max(3, Math.min(8, 3 + Math.floor(Math.random() * 6))); // 3..8
  const whiteSet = pool.splice(0, whiteSetSize);
  const redSetSize = Math.max(3, Math.min(8, 3 + Math.floor(Math.random() * 6)));
  const redSet = pool.splice(0, Math.min(redSetSize, pool.length));
  // Ensure enough capacity; if not, borrow from remaining pool
  if (redSet.length * perPointCap < remainingRed.value) {
    while (pool.length > 0 && redSet.length * perPointCap < remainingRed.value) redSet.push(pool.shift()!);
  }
  if (whiteSet.length * perPointCap < remainingWhite.value) {
    while (pool.length > 0 && whiteSet.length * perPointCap < remainingWhite.value) whiteSet.push(pool.shift()!);
  }

  distribute(countsW, whiteSet, remainingWhite);
  distribute(countsR, redSet, remainingRed);

  // Random bars and bear-offs within remaining caps
  const toMove = Math.random() > 0.5 ? 'white' : 'red';
  const randCap = (max: number) => (max <= 0 ? 0 : Math.floor(Math.random() * (max + 1)));
  const barW = randCap(Math.min(3, remainingWhite.value));
  remainingWhite.value -= barW;
  const barR = randCap(Math.min(3, remainingRed.value));
  remainingRed.value -= barR;
  const bearW = randCap(Math.min(6, remainingWhite.value));
  remainingWhite.value -= bearW;
  const bearR = randCap(Math.min(6, remainingRed.value));
  remainingRed.value -= bearR;

  const points: Point[] = Array.from({ length: 24 }, (_, i) => ({ number: i + 1, pieces: [] }));
  for (let i = 0; i < 24; i++) {
    for (let k = 0; k < countsW[i]; k++) points[i].pieces.push({ color: 'white', id: `w-${i}-${k}` });
    for (let k = 0; k < countsR[i]; k++) points[i].pieces.push({ color: 'red', id: `r-${i}-${k}` });
  }

  return {
    id: `rand-${Date.now()}`,
    points,
    bar: { white: barW, red: barR },
    bearOff: { white: bearW, red: bearR },
    toMove,
    timestamp: new Date(),
  };
};

