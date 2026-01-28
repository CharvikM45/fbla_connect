import React from 'react';
import { View, StyleSheet, ViewStyle, Platform, StyleProp } from 'react-native';
import { colors, glows } from '../theme';

interface GlowViewProps {
    children?: React.ReactNode;
    color?: keyof typeof glows;
    intensity?: number;
    style?: StyleProp<ViewStyle>;
}

/**
 * A component that adds a premium neon glow effect around its children.
 * Inspired by ContentCore and Spline aesthetics.
 */
export const GlowView: React.FC<GlowViewProps> = ({
    children,
    color = 'blue',
    intensity = 1,
    style
}) => {
    const glowStyle = glows[color];

    return (
        <View style={[styles.container, style]}>
            <View style={[
                styles.glowLayer,
                {
                    shadowColor: glowStyle.shadowColor,
                    shadowOpacity: (glowStyle.shadowOpacity as number) * intensity,
                    shadowRadius: (glowStyle.shadowRadius as number) * intensity,
                    // For Android, we use a slightly transparent background to simulate glow via elevation
                    backgroundColor: Platform.OS === 'android' ? `${glowStyle.shadowColor}20` : 'transparent',
                    elevation: (glowStyle.elevation as number) * intensity,
                }
            ]} />
            {children}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
    },
    glowLayer: {
        position: 'absolute',
        top: '10%',
        left: '10%',
        right: '10%',
        bottom: '10%',
        borderRadius: 999,
        zIndex: -1,
    },
});
