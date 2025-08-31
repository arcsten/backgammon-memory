import React from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import Svg, { Rect, Polygon, Circle, Text as SvgText, G } from 'react-native-svg';

import { colors, spacing } from '@/utils/theme';
import type { BoardPosition } from '@/types';

interface BoardDiagramProps {
  position?: BoardPosition | null;
  style?: any;
  width?: number;
}

const BoardDiagram: React.FC<BoardDiagramProps> = ({
  position,
  style,
  width: preferredWidth,
}) => {
  const { width: screenWidth } = useWindowDimensions();
  const width = Math.min(preferredWidth || screenWidth - spacing.lg * 2, 560);
  const height = Math.round(width * 0.62);
  const gutter = 6; // side and middle gutters
  const barWidth = 12;
  const playAreaWidth = width - gutter * 2 - barWidth; // two halves + bar
  const halfWidth = playAreaWidth / 2;
  const pointWidth = halfWidth / 6; // 6 points per side half
  const pointHeight = height * 0.42;

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
    // Determine half and column within half according to standard layout
    let baseX = gutter;
    let column = 0; // 0..5 within a half

    if (isTop) {
      if (pointNumber >= 19 && pointNumber <= 24) {
        // Top-left half: left→right = 24..19
        baseX = gutter;
        column = 24 - pointNumber; // 24->0 ... 19->5
      } else {
        // Top-right half: left→right = 18..13
        baseX = gutter + halfWidth + barWidth;
        column = 18 - pointNumber; // 18->0 ... 13->5
      }
    } else {
      if (pointNumber >= 1 && pointNumber <= 6) {
        // Bottom-left half: left→right = 1..6
        baseX = gutter;
        column = pointNumber - 1; // 1->0 ... 6->5
      } else {
        // Bottom-right half: left→right = 7..12
        baseX = gutter + halfWidth + barWidth;
        column = pointNumber - 7; // 7->0 ... 12->5
      }
    }

    const x = baseX + column * pointWidth;
    const y = isTop ? 0 : height - pointHeight;
    
    // Point triangle
    const trianglePoints = isTop
      ? `${x},${y} ${x + pointWidth},${y} ${x + pointWidth/2},${y + pointHeight}`
      : `${x},${y + pointHeight} ${x + pointWidth},${y + pointHeight} ${x + pointWidth/2},${y}`;

    // Point color (alternating dark/light)
    const isDark = (column % 2) === 0;
    const pointColor = isDark ? '#7B3F00' : '#A05A2C';

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
    const barX = gutter + halfWidth;
    const barWhite = position?.bar?.white || 0;
    const barRed = position?.bar?.red || 0;

    return (
      <G key="bar">
        {/* Bar area */}
        <Rect
          x={barX}
          y={0}
          width={barWidth}
          height={height}
          fill={colors.background}
          stroke={colors.border}
          strokeWidth="1"
        />
        
        {/* White pieces on bar */}
        {Array.from({ length: Math.min(barWhite, 8) }, (_, i) => (
          <Circle
            key={`bar-white-${i}`}
            cx={barX + barWidth/2}
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
            cx={barX + barWidth/2}
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
            x={barX + barWidth/2}
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
            x={barX + barWidth/2}
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
          fill={colors.surface}
          stroke={colors.border}
          strokeWidth="2"
        />

        {/* Middle separator */}
        <Rect
          x={gutter + halfWidth}
          y={0}
          width={barWidth}
          height={height}
          fill={colors.surface}
          stroke={colors.border}
          strokeWidth="1"
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

