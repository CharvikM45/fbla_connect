import React from 'react';
import { View, StyleSheet, ViewStyle, Platform, StyleProp } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, borderRadius, shadows, gradients } from '../theme';

interface GlassCardProps {
    children: React.ReactNode;
    style?: StyleProp<ViewStyle>;
    intensity?: number;
    accentColor?: string;
    onPress?: () => void;
}

/**
 * A premium card component with glassmorphism effects.
 * Inspired by Spline and ContentCore.
 */
export const GlassCard: React.FC<GlassCardProps> = ({
    children,
    style,
    intensity = 20,
    accentColor,
}) => {
    const isDark = true; // For now, we'll favor the "premium dark" look as requested

    return (
        <View style={[styles.container, shadows.md, style]}>
            {Platform.OS === 'ios' ? (
                <BlurView intensity={intensity} tint={isDark ? 'dark' : 'light'} style={styles.blurContainer}>
                    <LinearGradient
                        colors={isDark ? gradients.darkSurface : gradients.surface}
                        style={styles.gradient}
                    >
                        {accentColor && <View style={[styles.accent, { backgroundColor: accentColor }]} />}
                        {children}
                    </LinearGradient>
                </BlurView>
            ) : (
                // Fallback for Android which has limited blur support in some versions
                <View style={[
                    styles.fallbackContainer,
                    { backgroundColor: isDark ? 'rgba(39, 39, 42, 0.85)' : 'rgba(255, 255, 255, 0.85)' }
                ]}>
                    <LinearGradient
                        colors={isDark ? gradients.darkSurface : gradients.surface}
                        style={styles.gradient}
                    >
                        {accentColor && <View style={[styles.accent, { backgroundColor: accentColor }]} />}
                        {children}
                    </LinearGradient>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        borderRadius: borderRadius.xl,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.15)',
    },
    blurContainer: {
        flex: 1,
    },
    fallbackContainer: {
        flex: 1,
    },
    gradient: {
        padding: 16,
        flex: 1,
    },
    accent: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 3,
        opacity: 0.8,
    },
});
