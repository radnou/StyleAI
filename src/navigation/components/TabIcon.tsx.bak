import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Animated } from 'react-native';

interface TabIconProps {
  name: string;
  focused: boolean;
  color: string;
  size: number;
  badge?: string;
  animated?: boolean;
}

/**
 * Tab Icon Component
 * Renders icons for bottom tab navigation
 */
export function TabIcon({ name, focused, color, size, badge, animated = false }: TabIconProps) {
  // Create animated scale value
  const scaleValue = React.useRef(new Animated.Value(1)).current;

  // Animate icon when focused
  React.useEffect(() => {
    if (animated) {
      Animated.spring(scaleValue, {
        toValue: focused ? 1.2 : 1,
        useNativeDriver: true,
      }).start();
    }
  }, [focused, animated, scaleValue]);

  // Icon mapping (in a real app, you'd use actual icon libraries like react-native-vector-icons)
  const getIconComponent = () => {
    const iconStyle = {
      color,
      fontSize: size,
      textAlign: 'center' as const,
    };

    switch (name) {
      case 'home':
        return <Text style={iconStyle}>🏠</Text>;
      case 'wardrobe':
        return <Text style={iconStyle}>👗</Text>;
      case 'styling':
        return <Text style={iconStyle}>✨</Text>;
      case 'profile':
        return <Text style={iconStyle}>👤</Text>;
      default:
        return <Text style={iconStyle}>📱</Text>;
    }
  };

  return (
    <Animated.View 
      style={[
        styles.iconContainer,
        animated && { transform: [{ scale: scaleValue }] },
      ]}
    >
      {getIconComponent()}
      {badge && (
        <View style={styles.badgeContainer}>
          <Text style={styles.badgeText}>{badge}</Text>
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    width: 24,
    height: 24,
  },
  badgeContainer: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#FF3B30',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
});