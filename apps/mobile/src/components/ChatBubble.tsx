import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../contexts';
import { spacing, borderRadius, fontSize, colors as themeColors } from '../constants/theme';

interface ChatBubbleProps {
  message: string;
  timestamp: string;
  isMine: boolean;
}

export function ChatBubble({ message, timestamp, isMine }: ChatBubbleProps) {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, isMine && styles.containerMine]}>
      <View
        style={[
          styles.bubble,
          isMine
            ? { backgroundColor: themeColors.primary }
            : { backgroundColor: colors.surface },
          isMine ? styles.bubbleMine : styles.bubbleOther,
        ]}>
        <Text
          style={[
            styles.message,
            { color: isMine ? '#FFFFFF' : colors.text.primary },
          ]}>
          {message}
        </Text>
      </View>
      <Text
        style={[
          styles.timestamp,
          { color: colors.text.tertiary },
          isMine && styles.timestampMine,
        ]}>
        {timestamp}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'flex-start',
    marginBottom: spacing.md,
    maxWidth: '80%',
  },
  containerMine: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },
  bubble: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
  },
  bubbleMine: {
    borderBottomRightRadius: borderRadius.sm,
  },
  bubbleOther: {
    borderBottomLeftRadius: borderRadius.sm,
  },
  message: {
    fontSize: fontSize.md,
    lineHeight: fontSize.md * 1.4,
  },
  timestamp: {
    fontSize: fontSize.xs,
    marginTop: spacing.xs,
  },
  timestampMine: {
    textAlign: 'right',
  },
});
