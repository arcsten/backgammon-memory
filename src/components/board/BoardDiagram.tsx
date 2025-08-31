import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Rect, Polygon, Circle, Text as SvgText, G } from 'react-native-svg';

import { colors } from '@/utils/theme';
import type { BoardPosition } from '@/types';

interface BoardDiagramProps {
  position?: BoardPosition | null;
  style?: any;
  size?: 'small' | 'medium' | 'large';
}

const BoardDiagram: React.FC<BoardDiagramProps> = ({
  position,
  style,
  size = 'medium',
}) => {
  const dimensions = {
    small: { width: 200, height: 150 },
    medium: { width: 300, height: 225 },
    large: { width: 400, height: 300 },
  };

  const { width, height } = dimensions[size];
  const pointWidth = width / 14; // 24 points + 2 for bar
  const pointHeight = height * 0.4;

  // Mock position data if none provided
  const mockPoints = Array.from({ length: 24 }, (_, i) => ({
    number: i + 1,
    pieces: i % 6 === 0 ? [
      { color: i < 12 ? 'white' : 'red', id: `${i}-1` },
      { color: i < 12 ? 'white' : 'red', id: `${i}-2` },
    ] : [],
  }));

  const points = position?.points || mockPoints;

  const renderPoint = (pointNumber: number, isTop: boolean) => {
    const point = points.find(p => p.number === pointNumber);
    const pieces = point?.pieces || [];
    
    const x = ((pointNumber - 1) % 12) * pointWidth + (pointNumber > 12 ? pointWidth : 0);
    const y = isTop ? 0 : height - pointHeight;
    
    // Point triangle
    const trianglePoints = isTop
      ? `${x},${y} ${x + pointWidth},${y} ${x + pointWidth/2},${y + pointHeight}`
      : `${x},${y + pointHeight} ${x + pointWidth},${y + pointHeight} ${x + pointWidth/2},${y}`;

    // Point color (alternating dark/light)
    const pointColor = (pointNumber % 2 === 0) ? colors.boardBrown : '#8B4513';

    return (
      <G key={`point-${pointNumber}`}>
        {/* Point triangle */}
        <Polygon
          points={trianglePoints}
          fill={pointColor}
          stroke={colors.border}
          strokeWidth="0.5"
        />
        
        {/* Point number */}
        <SvgText
          x={x + pointWidth/2}
          y={isTop ? y + pointHeight - 5 : y + 15}
          fontSize="10"
          fill={colors.text}
          textAnchor="middle"
        >
          {pointNumber}
        </SvgText>
        
        {/* Pieces */}
        {pieces.slice(0, 5).map((piece, index) => {
          const pieceX = x + pointWidth/2;
          const pieceY = isTop 
            ? y + pointHeight - 15 - (index * 12)
            : y + 15 + (index * 12);
          
          return (
            <Circle
              key={piece.id}
              cx={pieceX}
              cy={pieceY}
              r="6"
              fill={piece.color === 'white' ? colors.pieceWhite : colors.pieceRed}
              stroke={colors.black}
              strokeWidth="0.5"
            />
          );
        })}
        
        {/* Overflow indicator */}
        {pieces.length > 5 && (
          <SvgText
            x={x + pointWidth/2}
            y={isTop ? y + pointHeight - 15 - (4 * 12) : y + 15 + (4 * 12)}
            fontSize="8"
            fill={colors.text}
            textAnchor="middle"
          >
            +{pieces.length - 5}
          </SvgText>
        )}
      </G>
    );
  };

  const renderBar = () => {
    const barX = 6 * pointWidth;
    const barWhite = position?.bar?.white || 0;
    const barRed = position?.bar?.red || 0;

    return (
      <G key="bar">
        {/* Bar area */}
        <Rect
          x={barX}
          y={0}
          width={pointWidth}
          height={height}
          fill={colors.surface}
          stroke={colors.border}
          strokeWidth="1"
        />
        
        {/* White pieces on bar */}
        {Array.from({ length: Math.min(barWhite, 8) }, (_, i) => (
          <Circle
            key={`bar-white-${i}`}
            cx={barX + pointWidth/2}
            cy={height/2 - 40 + (i * 10)}
            r="6"
            fill={colors.pieceWhite}
            stroke={colors.black}
            strokeWidth="0.5"
          />
        ))}
        
        {/* Red pieces on bar */}
        {Array.from({ length: Math.min(barRed, 8) }, (_, i) => (
          <Circle
            key={`bar-red-${i}`}
            cx={barX + pointWidth/2}
            cy={height/2 + 40 - (i * 10)}
            r="6"
            fill={colors.pieceRed}
            stroke={colors.black}
            strokeWidth="0.5"
          />
        ))}
        
        {/* Bar overflow indicators */}
        {barWhite > 8 && (
          <SvgText
            x={barX + pointWidth/2}
            y={height/2 - 40 + (7 * 10)}
            fontSize="8"
            fill={colors.text}
            textAnchor="middle"
          >
            +{barWhite - 8}
          </SvgText>
        )}
        
        {barRed > 8 && (
          <SvgText
            x={barX + pointWidth/2}
            y={height/2 + 40 - (7 * 10)}
            fontSize="8"
            fill={colors.text}
            textAnchor="middle"
          >
            +{barRed - 8}
          </SvgText>
        )}
      </G>
    );
  };

  return (
    <View style={[styles.container, style]}>
      <Svg width={width} height={height} style={styles.svg}>
        {/* Board background */}
        <Rect
          width={width}
          height={height}
          fill={colors.background}
          stroke={colors.border}
          strokeWidth="2"
        />
        
        {/* Top points (13-24) */}
        {Array.from({ length: 12 }, (_, i) => renderPoint(24 - i, true))}
        
        {/* Bottom points (1-12) */}
        {Array.from({ length: 12 }, (_, i) => renderPoint(i + 1, false))}
        
        {/* Bar */}
        {renderBar()}
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  svg: {
    backgroundColor: colors.surface,
  },
});

export default BoardDiagram;

