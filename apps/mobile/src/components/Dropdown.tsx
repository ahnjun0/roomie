import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
} from 'react-native';
import { useTheme } from '../contexts';
import { spacing, borderRadius, fontSize, fontWeight } from '../constants/theme';

interface DropdownOption {
  value: string;
  label: string;
}

interface DropdownProps {
  label?: string;
  placeholder?: string;
  options: readonly DropdownOption[] | DropdownOption[];
  value: string | null;
  onChange: (value: string) => void;
}

export function Dropdown({
  label,
  placeholder = '선택하세요',
  options,
  value,
  onChange,
}: DropdownProps) {
  const { colors } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const selectedOption = options.find(opt => opt.value === value);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <View style={styles.container}>
      {label && (
        <Text style={[styles.label, { color: colors.text.secondary }]}>{label}</Text>
      )}
      <TouchableOpacity
        style={[
          styles.trigger,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
        onPress={() => setIsOpen(true)}
        activeOpacity={0.7}>
        <Text
          style={[
            styles.triggerText,
            { color: selectedOption ? colors.text.primary : colors.text.tertiary },
          ]}>
          {selectedOption?.label || placeholder}
        </Text>
        <Text style={[styles.arrow, { color: colors.text.tertiary }]}>▼</Text>
      </TouchableOpacity>

      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}>
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setIsOpen(false)}>
          <View style={[styles.dropdown, { backgroundColor: colors.card }]}>
            <FlatList
              data={options}
              keyExtractor={item => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.option,
                    { borderColor: colors.border },
                    item.value === value && { backgroundColor: colors.surface },
                  ]}
                  onPress={() => handleSelect(item.value)}>
                  <Text
                    style={[
                      styles.optionText,
                      { color: colors.text.primary },
                      item.value === value && { color: colors.primary },
                    ]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    marginBottom: spacing.xs,
  },
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderWidth: 1,
    borderRadius: borderRadius.md,
  },
  triggerText: {
    fontSize: fontSize.md,
  },
  arrow: {
    fontSize: fontSize.xs,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  dropdown: {
    borderRadius: borderRadius.lg,
    maxHeight: 300,
    overflow: 'hidden',
  },
  option: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  optionText: {
    fontSize: fontSize.md,
  },
});
