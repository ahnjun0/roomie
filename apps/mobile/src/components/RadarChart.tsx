import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Polygon, Line, Circle, Text as SvgText } from 'react-native-svg';
import { useTheme } from '../contexts';
import { fontSize } from '../constants/theme';

interface RadarChartData {
  label: string;
  myValue: number;
  otherValue: number;
}

interface RadarChartProps {
  data: RadarChartData[];
  size?: number;
}

export function RadarChart({ data, size = 250 }: RadarChartProps) {
  const { colors } = useTheme();
  const myStroke = 'rgba(59, 130, 246, 1)';
  const myFill = 'rgba(59, 130, 246, 0.3)';
  const otherStroke = 'rgba(239, 68, 68, 1)';
  const otherFill = 'rgba(239, 68, 68, 0.3)';
  const center = size / 2;
  const radius = (size / 2) * 0.7;
  const levels = 5;

  // 방어 코드: 데이터가 없거나 비어있으면 렌더링하지 않음
  if (!data || data.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={{ color: colors.text.secondary }}>데이터를 불러오는 중...</Text>
      </View>
    );
  }

  const angleStep = (2 * Math.PI) / data.length;

  const getPoint = (value: number, index: number) => {
    const angle = index * angleStep - Math.PI / 2;
    const r = (value / 5) * radius;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
    };
  };

  const getLabelPoint = (index: number) => {
    const angle = index * angleStep - Math.PI / 2;
    const r = radius + 25;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
    };
  };

  const myPoints = data.map((d, i) => getPoint(d.myValue, i));
  const otherPoints = data.map((d, i) => getPoint(d.otherValue, i));

  const myPolygonPoints = myPoints.map(p => `${p.x},${p.y}`).join(' ');
  const otherPolygonPoints = otherPoints.map(p => `${p.x},${p.y}`).join(' ');

  return (
    <View style={styles.container}>
      <Svg width={size} height={size}>
        {/* Background circles */}
        {Array.from({ length: levels }).map((_, i) => (
          <Circle
            key={i}
            cx={center}
            cy={center}
            r={(radius * (i + 1)) / levels}
            fill="none"
            stroke={colors.border}
            strokeWidth={1}
            opacity={0.5}
          />
        ))}

        {/* Axis lines */}
        {data.map((_, i) => {
          const endPoint = getPoint(5, i);
          return (
            <Line
              key={i}
              x1={center}
              y1={center}
              x2={endPoint.x}
              y2={endPoint.y}
              stroke={colors.border}
              strokeWidth={1}
              opacity={0.5}
            />
          );
        })}

        {/* Other user's polygon */}
        <Polygon
          points={otherPolygonPoints}
          fill={otherFill}
          stroke={otherStroke}
          strokeWidth={2}
        />

        {/* My polygon */}
        <Polygon
          points={myPolygonPoints}
          fill={myFill}
          stroke={myStroke}
          strokeWidth={2}
        />

        {/* Data points */}
        {myPoints.map((point, i) => (
          <Circle
            key={`my-${i}`}
            cx={point.x}
            cy={point.y}
            r={4}
            fill={myStroke}
          />
        ))}

        {/* Labels */}
        {data.map((d, i) => {
          const labelPoint = getLabelPoint(i);
          return (
            <SvgText
              key={i}
              x={labelPoint.x}
              y={labelPoint.y}
              fill={colors.text.primary}
              fontSize={fontSize.xs}
              textAnchor="middle"
              alignmentBaseline="middle">
              {d.label}
            </SvgText>
          );
        })}
      </Svg>
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: myStroke }]} />
          <Text style={[styles.legendText, { color: colors.text.primary }]}>나</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: otherStroke }]} />
          <Text style={[styles.legendText, { color: colors.text.primary }]}>상대방</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    marginTop: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: fontSize.sm,
  },
});
