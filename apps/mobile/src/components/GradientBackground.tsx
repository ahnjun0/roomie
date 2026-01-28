import React from 'react';
import { StyleSheet, View, ViewProps } from 'react-native';
import Svg, { Defs, Rect, LinearGradient, Stop } from 'react-native-svg';
import { colors } from '../constants/theme';

interface Props extends ViewProps {
  children?: React.ReactNode;
}

export function GradientBackground({ children, style, ...props }: Props) {
  return (
    <View style={[styles.container, style]} {...props}>
      <View style={StyleSheet.absoluteFill}>
        <Svg height="100%" width="100%">
          <Defs>
            <LinearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={colors.primaryLight} stopOpacity="1" />
              <Stop offset="1" stopColor={colors.primaryDark} stopOpacity="1" />
            </LinearGradient>
          </Defs>
          <Rect x="0" y="0" width="100%" height="100%" fill="url(#grad)" />
        </Svg>
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primaryDark, // Fallback
  },
});
