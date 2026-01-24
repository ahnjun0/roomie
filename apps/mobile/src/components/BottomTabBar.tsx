import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useTheme } from '../contexts';
import { spacing, fontSize, fontWeight, colors as themeColors } from '../constants/theme';

interface TabItem {
  key: string;
  label: string;
  icon: string;
}

interface BottomTabBarProps {
  tabs: TabItem[];
  activeTab: string;
  onTabPress: (key: string) => void;
}

export function BottomTabBar({ tabs, activeTab, onTabPress }: BottomTabBarProps) {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.border }]}>
      {tabs.map(tab => {
        const isActive = activeTab === tab.key;
        return (
          <TouchableOpacity
            key={tab.key}
            style={styles.tab}
            onPress={() => onTabPress(tab.key)}
            activeOpacity={0.7}>
            <Text
              style={[
                styles.icon,
                { color: isActive ? themeColors.primary : colors.text.tertiary },
              ]}>
              {tab.icon}
            </Text>
            <Text
              style={[
                styles.label,
                { color: isActive ? themeColors.primary : colors.text.tertiary },
                isActive && styles.labelActive,
              ]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderTopWidth: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  icon: {
    fontSize: 24,
    marginBottom: spacing.xs,
  },
  label: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.regular,
  },
  labelActive: {
    fontWeight: fontWeight.medium,
  },
});
