import React from 'react';
import { StyleSheet, TouchableOpacity, ViewProps, ViewStyle } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withSequence,
    withTiming,
    interpolate,
    Extrapolation
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

interface Props extends ViewProps {
    onPress?: () => void;
    children: React.ReactNode;
    style?: ViewStyle;
    activeOpacity?: number;
    hapticIntensity?: 'light' | 'medium' | 'heavy';
    scaleTo?: number;
}

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

export const AnimatedButton: React.FC<Props> = ({
    onPress,
    children,
    style,
    hapticIntensity = 'light',
    scaleTo = 0.96,
    ...props
}) => {
    const scale = useSharedValue(1);
    const opacity = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: scale.value }],
            opacity: opacity.value,
        };
    });

    const handlePressIn = () => {
        scale.value = withSpring(scaleTo, { damping: 10, stiffness: 200 });
        // Trigger subtle haptic on press (Cursify vibe)
        if (hapticIntensity === 'light') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        if (hapticIntensity === 'medium') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        if (hapticIntensity === 'heavy') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    };

    const handlePressOut = () => {
        scale.value = withSpring(1, { damping: 10, stiffness: 200 });
    };

    return (
        <AnimatedTouchableOpacity
            activeOpacity={1}
            onPress={onPress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            style={[style, animatedStyle]}
            {...props}
        >
            {children}
        </AnimatedTouchableOpacity>
    );
};
