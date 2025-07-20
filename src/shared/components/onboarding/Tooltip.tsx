import React, { useState, useRef, useEffect } from 'react';
import { YStack, XStack, Text, Button, Card } from 'tamagui';
import { TouchableOpacity, Dimensions, Platform } from 'react-native';
import Animated, { 
  FadeIn, 
  FadeOut, 
  SlideInUp, 
  SlideOutDown,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  runOnUI
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

const AnimatedCard = Animated.createAnimatedComponent(Card);
const AnimatedYStack = Animated.createAnimatedComponent(YStack);

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export type TooltipPosition = 'top' | 'bottom' | 'left' | 'right' | 'auto';

export interface TooltipProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  content: string;
  position?: TooltipPosition;
  targetRef?: React.RefObject<any>;
  showArrow?: boolean;
  dismissOnTouchOutside?: boolean;
  dismissOnBackPress?: boolean;
  maxWidth?: number;
  offset?: number;
  children?: React.ReactNode;
  actionButton?: {
    text: string;
    onPress: () => void;
  };
}

/**
 * Composant Tooltip contextuel
 */
export function Tooltip({
  visible,
  onClose,
  title,
  content,
  position = 'auto',
  targetRef,
  showArrow = true,
  dismissOnTouchOutside = true,
  dismissOnBackPress = true,
  maxWidth = 300,
  offset = 12,
  children,
  actionButton,
}: TooltipProps) {
  const [tooltipPosition, setTooltipPosition] = useState<TooltipPosition>(position);
  const [tooltipCoords, setTooltipCoords] = useState({ x: 0, y: 0 });
  const overlayOpacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      calculatePosition();
      overlayOpacity.value = withTiming(1, { duration: 200 });
    } else {
      overlayOpacity.value = withTiming(0, { duration: 200 });
    }
  }, [visible, targetRef]);

  const calculatePosition = () => {
    if (!targetRef?.current) return;

    targetRef.current.measure((x: number, y: number, width: number, height: number, pageX: number, pageY: number) => {
      let finalPosition = position;
      let tooltipX = pageX;
      let tooltipY = pageY;

      // Auto-positioning logic
      if (position === 'auto') {
        const spaceTop = pageY;
        const spaceBottom = screenHeight - (pageY + height);
        const spaceLeft = pageX;
        const spaceRight = screenWidth - (pageX + width);

        if (spaceBottom > 150) {
          finalPosition = 'bottom';
        } else if (spaceTop > 150) {
          finalPosition = 'top';
        } else if (spaceRight > maxWidth + 20) {
          finalPosition = 'right';
        } else if (spaceLeft > maxWidth + 20) {
          finalPosition = 'left';
        } else {
          finalPosition = 'bottom'; // fallback
        }
      }

      // Calculate final coordinates
      switch (finalPosition) {
        case 'top':
          tooltipX = pageX + width / 2;
          tooltipY = pageY - offset;
          break;
        case 'bottom':
          tooltipX = pageX + width / 2;
          tooltipY = pageY + height + offset;
          break;
        case 'left':
          tooltipX = pageX - offset;
          tooltipY = pageY + height / 2;
          break;
        case 'right':
          tooltipX = pageX + width + offset;
          tooltipY = pageY + height / 2;
          break;
      }

      // Ensure tooltip stays within screen bounds
      if (finalPosition === 'top' || finalPosition === 'bottom') {
        tooltipX = Math.max(20, Math.min(tooltipX, screenWidth - maxWidth - 20));
      } else {
        tooltipY = Math.max(20, Math.min(tooltipY, screenHeight - 200));
      }

      setTooltipPosition(finalPosition);
      setTooltipCoords({ x: tooltipX, y: tooltipY });
    });
  };

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  const getArrowIcon = () => {
    switch (tooltipPosition) {
      case 'top': return ArrowDown;
      case 'bottom': return ArrowUp;
      case 'left': return ArrowRight;
      case 'right': return ArrowLeft;
      default: return ArrowUp;
    }
  };

  const ArrowIcon = getArrowIcon();

  if (!visible) return null;

  return (
    <>
      {/* Overlay */}
      <Animated.View
        style={[
          {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.3)',
            zIndex: 1000,
          },
          overlayStyle,
        ]}
      >
        <TouchableOpacity
          style={{ flex: 1 }}
          activeOpacity={1}
          onPress={dismissOnTouchOutside ? onClose : undefined}
        />
      </Animated.View>

      {/* Tooltip */}
      <AnimatedCard
        entering={SlideInUp.duration(300)}
        exiting={SlideOutDown.duration(200)}
        position="absolute"
        left={tooltipCoords.x}
        top={tooltipCoords.y}
        maxWidth={maxWidth}
        backgroundColor="$backgroundStrong"
        borderWidth={1}
        borderColor="$borderColor"
        borderRadius="$4"
        padding="$4"
        shadowColor="$shadowColor"
        shadowOffset={{ width: 0, height: 2 }}
        shadowOpacity={0.25}
        shadowRadius={8}
        elevation={5}
        zIndex={1001}
        style={{
          transform: [
            { 
              translateX: tooltipPosition === 'top' || tooltipPosition === 'bottom' 
                ? -maxWidth / 2 
                : tooltipPosition === 'left' 
                  ? -maxWidth 
                  : 0 
            },
            { 
              translateY: tooltipPosition === 'left' || tooltipPosition === 'right' 
                ? -50 
                : tooltipPosition === 'top' 
                  ? -100 
                  : 0 
            },
          ],
        }}
      >
        <YStack gap="$3">
          {/* Header */}
          <XStack alignItems="flex-start" justifyContent="space-between">
            <YStack flex={1} gap="$2">
              {title && (
                <Text fontSize="$4" fontWeight="600" color="$color12">
                  {title}
                </Text>
              )}
              <Text fontSize="$3" color="$color11" lineHeight="$4">
                {content}
              </Text>
            </YStack>
            
            <TouchableOpacity onPress={onClose}>
              <YStack
                width={24}
                height={24}
                alignItems="center"
                justifyContent="center"
                marginLeft="$2"
              >
                <Ionicons name="close" size={16} color="$color10" />
              </YStack>
            </TouchableOpacity>
          </XStack>

          {/* Custom content */}
          {children && (
            <YStack>
              {children}
            </YStack>
          )}

          {/* Action button */}
          {actionButton && (
            <Button
              size="$3"
              onPress={actionButton.onPress}
              backgroundColor="$blue10"
            >
              <Text color="white" fontSize="$3" fontWeight="600">
                {actionButton.text}
              </Text>
            </Button>
          )}

          {/* Arrow indicator */}
          {showArrow && (
            <YStack
              position="absolute"
              alignItems="center"
              justifyContent="center"
              {...(tooltipPosition === 'top' && {
                bottom: -8,
                left: '50%',
                marginLeft: -8,
              })}
              {...(tooltipPosition === 'bottom' && {
                top: -8,
                left: '50%',
                marginLeft: -8,
              })}
              {...(tooltipPosition === 'left' && {
                right: -8,
                top: '50%',
                marginTop: -8,
              })}
              {...(tooltipPosition === 'right' && {
                left: -8,
                top: '50%',
                marginTop: -8,
              })}
            >
              <ArrowIcon size={16} color="$borderColor" />
            </YStack>
          )}
        </YStack>
      </AnimatedCard>
    </>
  );
}

/**
 * Hook pour gérer l'état des tooltips
 */
export function useTooltip() {
  const [visibleTooltips, setVisibleTooltips] = useState<Set<string>>(new Set());

  const showTooltip = (id: string) => {
    setVisibleTooltips(prev => new Set(prev).add(id));
  };

  const hideTooltip = (id: string) => {
    setVisibleTooltips(prev => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
  };

  const hideAllTooltips = () => {
    setVisibleTooltips(new Set());
  };

  const isTooltipVisible = (id: string) => {
    return visibleTooltips.has(id);
  };

  return {
    showTooltip,
    hideTooltip,
    hideAllTooltips,
    isTooltipVisible,
    visibleTooltips,
  };
}

/**
 * Composant Tooltip avec trigger intégré
 */
export function TooltipTrigger({
  tooltip,
  children,
  triggerOnPress = true,
  triggerOnLongPress = false,
}: {
  tooltip: Omit<TooltipProps, 'visible' | 'onClose' | 'targetRef'>;
  children: React.ReactNode;
  triggerOnPress?: boolean;
  triggerOnLongPress?: boolean;
}) {
  const [visible, setVisible] = useState(false);
  const targetRef = useRef<any>(null);

  return (
    <>
      <TouchableOpacity
        ref={targetRef}
        onPress={triggerOnPress ? () => setVisible(true) : undefined}
        onLongPress={triggerOnLongPress ? () => setVisible(true) : undefined}
        activeOpacity={0.7}
      >
        {children}
      </TouchableOpacity>
      
      <Tooltip
        {...tooltip}
        visible={visible}
        onClose={() => setVisible(false)}
        targetRef={targetRef}
      />
    </>
  );
}

export default Tooltip;