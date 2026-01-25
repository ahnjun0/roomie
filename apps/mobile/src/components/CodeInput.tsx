import React, { useRef, useState } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  NativeSyntheticEvent,
  TextInputKeyPressEventData,
} from 'react-native';
import { useTheme } from '../contexts';
import { spacing, borderRadius, fontSize, fontWeight } from '../constants/theme';

interface CodeInputProps {
  length?: number;
  onComplete: (code: string) => void;
  error?: boolean;
}

export function CodeInput({ length = 6, onComplete, error }: CodeInputProps) {
  const { colors } = useTheme();
  const [code, setCode] = useState<string[]>(Array(length).fill(''));
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  const handleChange = (text: string, index: number) => {
    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);

    if (text && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    if (newCode.every(c => c !== '')) {
      onComplete(newCode.join(''));
    }
  };

  const handleKeyPress = (
    e: NativeSyntheticEvent<TextInputKeyPressEventData>,
    index: number,
  ) => {
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
      const newCode = [...code];
      newCode[index - 1] = '';
      setCode(newCode);
    }
  };

  return (
    <View style={styles.container}>
      {Array(length)
        .fill(0)
        .map((_, index) => (
          <TextInput
            key={index}
            ref={ref => (inputRefs.current[index] = ref)}
            style={[
              styles.input,
              {
                backgroundColor: colors.surface,
                borderColor: error
                  ? colors.error
                  : focusedIndex === index
                  ? colors.primary
                  : colors.border,
                color: colors.text.primary,
              },
            ]}
            value={code[index]}
            onChangeText={text => handleChange(text.slice(-1), index)}
            onKeyPress={e => handleKeyPress(e, index)}
            onFocus={() => setFocusedIndex(index)}
            onBlur={() => setFocusedIndex(null)}
            keyboardType="number-pad"
            maxLength={1}
            textAlign="center"
          />
        ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.md,
  },
  input: {
    width: 48,
    height: 56,
    borderWidth: 2,
    borderRadius: borderRadius.lg,
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
  },
});
