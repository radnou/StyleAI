import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { Animated } from 'react-native';

interface TabLabelProps {
  text: string;
  focused: boolean;
  color: string;
  animated?: boolean;
}

/**
 * Tab Label Component
 * Renders labels for bottom tab navigation
 */
export function TabLabel({ text, focused, color, animated = false }: TabLabelProps) {
  // Create animated scale value
  const scaleValue = React.useRef(new Animated.Value(1)).current;
  const opacityValue = React.useRef(new Animated.Value(focused ? 1 : 0.7)).current;

  // Animate label when focused
  React.useEffect(() => {
    if (animated) {
      Animated.parallel([
        Animated.spring(scaleValue, {
          toValue: focused ? 1.05 : 1,
          useNativeDriver: true,
        }),
        Animated.timing(opacityValue, {
          toValue: focused ? 1 : 0.7,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [focused, animated, scaleValue, opacityValue]);

  return (
    <Animated.Text
      style={[
        styles.label,
        {
          color,
          fontWeight: focused ? '600' : '400',
          opacity: animated ? opacityValue : (focused ? 1 : 0.7),
          transform: animated ? [{ scale: scaleValue }] : [],
        },
      ]}
    >
      {text}
    </Animated.Text>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 2,
  },
});