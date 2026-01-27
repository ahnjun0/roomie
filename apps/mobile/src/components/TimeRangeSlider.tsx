import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  PanResponder,
  LayoutChangeEvent,
} from 'react-native';
import { useTheme } from '../contexts';
import { spacing, borderRadius, fontSize, fontWeight, colors as themeColors } from '../constants/theme';

interface TimeRangeSliderProps {
  startValue: number;
  endValue: number;
  min: number;
  max: number;
  onValuesChange: (start: number, end: number) => void;
  formatValue: (value: number) => string;
}

export function TimeRangeSlider({
  startValue,
  endValue,
  min,
  max,
  onValuesChange,
  formatValue,
}: TimeRangeSliderProps) {
  const { colors } = useTheme();
  const [width, setWidth] = useState(0);
  
  // Internal state for smooth dragging
  const [localStart, setLocalStart] = useState(startValue);
  const [localEnd, setLocalEnd] = useState(endValue);

  // Refs to hold mutable values for PanResponder to avoid stale closures
  const startValRef = useRef(startValue);
  const endValRef = useRef(endValue);
  const widthRef = useRef(0);

  // Update local state and refs when props change (external update)
  useEffect(() => {
    setLocalStart(startValue);
    setLocalEnd(endValue);
    startValRef.current = startValue;
    endValRef.current = endValue;
  }, [startValue, endValue]);

  // We need a ref to store the value at the start of the gesture
  const initialGestureValue = useRef(0);

  const panStart = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        initialGestureValue.current = startValRef.current;
      },
      onPanResponderMove: (_, gestureState) => {
        if (widthRef.current === 0) return;
        const initialPos = ((initialGestureValue.current - min) / (max - min)) * widthRef.current;
        const newPos = initialPos + gestureState.dx;
        let newValue = (newPos / widthRef.current) * (max - min) + min;
        newValue = Math.max(min, Math.min(max, Math.round(newValue)));

        if (newValue < endValRef.current) {
          startValRef.current = newValue;
          setLocalStart(newValue);
          onValuesChange(newValue, endValRef.current);
        }
      },
      onPanResponderRelease: () => {
        onValuesChange(startValRef.current, endValRef.current);
      },
    })
  ).current;

  const panEnd = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        initialGestureValue.current = endValRef.current;
      },
      onPanResponderMove: (_, gestureState) => {
        if (widthRef.current === 0) return;
        const initialPos = ((initialGestureValue.current - min) / (max - min)) * widthRef.current;
        const newPos = initialPos + gestureState.dx;
        let newValue = (newPos / widthRef.current) * (max - min) + min;
        newValue = Math.max(min, Math.min(max, Math.round(newValue)));

        if (newValue > startValRef.current) {
          endValRef.current = newValue;
          setLocalEnd(newValue);
          onValuesChange(startValRef.current, newValue);
        }
      },
      onPanResponderRelease: () => {
        onValuesChange(startValRef.current, endValRef.current);
      },
    })
  ).current;

  const onLayout = (event: LayoutChangeEvent) => {
    const w = event.nativeEvent.layout.width;
    setWidth(w);
    widthRef.current = w;
  };

  // Render calculation
  // Use local state for rendering to ensure smooth updates
  const startPos = width > 0 ? ((localStart - min) / (max - min)) * width : 0;
  const endPos = width > 0 ? ((localEnd - min) / (max - min)) * width : 0;
  const barWidth = Math.max(0, endPos - startPos);
  const duration = localEnd - localStart;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.timeDisplay}>
          <Text style={[styles.timeText, { color: colors.text.primary }]}>
            {formatValue(localStart)}
          </Text>
          <Text style={[styles.arrow, { color: colors.text.tertiary }]}>→</Text>
          <Text style={[styles.timeText, { color: colors.text.primary }]}>
            {formatValue(localEnd)}
          </Text>
        </View>
        <View style={[styles.durationBadge, { backgroundColor: themeColors.primary + '20' }]}>
          <Text style={[styles.durationText, { color: themeColors.primary }]}>
            {duration}시간
          </Text>
        </View>
      </View>

      <View style={styles.sliderContainer} onLayout={onLayout}>
        {/* Track Background */}
        <View style={[styles.track, { backgroundColor: colors.border }]} />
        
        {/* Active Range Bar */}
        <View
          style={[
            styles.activeTrack,
            {
              backgroundColor: themeColors.primary,
              left: startPos,
              width: barWidth,
            },
          ]}
        />

        {/* Start Thumb */}
        <View
          style={[
            styles.thumb,
            {
              backgroundColor: themeColors.primary,
              borderColor: colors.background.light,
              transform: [{ translateX: startPos - 12 }], // Center thumb (width/2)
            },
          ]}
          {...panStart.panHandlers}
        >
          <View style={styles.thumbIcon} />
        </View>

        {/* End Thumb */}
        <View
          style={[
            styles.thumb,
            {
              backgroundColor: themeColors.primary,
              borderColor: colors.background.light,
              transform: [{ translateX: endPos - 12 }],
            },
          ]}
          {...panEnd.panHandlers}
        >
          <View style={styles.thumbIcon} />
        </View>
        
        {/* Ticks/Labels below */}
        <View style={styles.ticksContainer}>
           <Text style={[styles.tickText, { color: colors.text.tertiary }]}>4PM</Text>
           <Text style={[styles.tickText, { color: colors.text.tertiary }]}>10PM</Text>
           <Text style={[styles.tickText, { color: colors.text.tertiary }]}>4AM</Text>
           <Text style={[styles.tickText, { color: colors.text.tertiary }]}>10AM</Text>
           <Text style={[styles.tickText, { color: colors.text.tertiary }]}>4PM</Text>
        </View>
      </View>
      
      <Text style={[styles.hint, { color: colors.text.tertiary }]}>
        핸들을 드래그하여 수면 시간을 조절하세요
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.md,
  },
  header: {
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: spacing.xl,
    gap: spacing.sm,
  },
  timeDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  timeText: {
    fontSize: 28,
    fontWeight: fontWeight.bold,
  },
  arrow: {
    fontSize: 24,
    fontWeight: fontWeight.light,
  },
  durationBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
  },
  durationText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
  },
  sliderContainer: {
    height: 40,
    justifyContent: 'center',
    marginHorizontal: 12, // thumb half width
  },
  track: {
    height: 8,
    borderRadius: 4,
    width: '100%',
    position: 'absolute',
  },
  activeTrack: {
    height: 8,
    borderRadius: 4,
    position: 'absolute',
  },
  thumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 3,
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 1,
  },
  thumbIcon: {
    width: 2,
    height: 8,
    backgroundColor: 'white',
    borderRadius: 1,
  },
  ticksContainer: {
    position: 'absolute',
    top: 30,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  tickText: {
    fontSize: 10,
    fontWeight: fontWeight.bold,
  },
  hint: {
    textAlign: 'center',
    fontSize: fontSize.xs,
    marginTop: spacing.xl,
  }
});