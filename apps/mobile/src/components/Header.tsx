import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../contexts';
import { spacing, fontSize, fontWeight } from '../constants/theme';

interface HeaderProps {
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
  rightAction?: {
    label: string;
    onPress: () => void;
  };
}

export function Header({ title, showBack, onBack, rightAction }: HeaderProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top, backgroundColor: colors.background, borderColor: colors.border },
      ]}>
      <View style={styles.content}>
        <View style={styles.leftSection}>
          {showBack && (
            <TouchableOpacity onPress={onBack} style={styles.backButton}>
              <Text style={[styles.backIcon, { color: colors.text.primary }]}>←</Text>
            </TouchableOpacity>
          )}
        </View>
        {title && (
          <Text style={[styles.title, { color: colors.text.primary }]} numberOfLines={1}>
            {title}
          </Text>
        )}
        <View style={styles.rightSection}>
          {rightAction && (
            <TouchableOpacity onPress={rightAction.onPress}>
              <Text style={[styles.rightActionText, { color: colors.primary }]}>
                {rightAction.label}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 56,
    paddingHorizontal: spacing.md,
  },
  leftSection: {
    width: 60,
    alignItems: 'flex-start',
  },
  rightSection: {
    width: 60,
    alignItems: 'flex-end',
  },
  backButton: {
    padding: spacing.xs,
  },
  backIcon: {
    fontSize: fontSize.xxl,
  },
  title: {
    flex: 1,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    textAlign: 'center',
  },
  rightActionText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
  },
});
