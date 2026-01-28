// FBLA Connect - Welcome Screen
import React from 'react';
import {
    View,
    StyleSheet,
    Dimensions,
    TouchableOpacity,
    Platform,
} from 'react-native';
import { Text, Button } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../../shared/navigation/types';
import { colors, spacing, typography, shadows } from '../../../shared/theme';
import { MotiView, MotiText } from 'moti';
import { Ionicons } from '@expo/vector-icons';

type Props = {
    navigation: NativeStackNavigationProp<AuthStackParamList, 'Welcome'>;
};

const { height, width } = Dimensions.get('window');

export default function WelcomeScreen({ navigation }: Props) {
    return (
        <View style={styles.container}>
            {/* Background Sophisticated Gradient */}
            <LinearGradient
                colors={['#0A192F', '#112240', '#0A192F']}
                style={StyleSheet.absoluteFill}
            />

            {/* Decorative Vector Elements (Non-AI, geometric) */}
            <View style={styles.decorContainer} pointerEvents="none">
                <View style={[styles.circle, { top: -100, left: -50, backgroundColor: colors.primary[600] + '20' }]} />
                <View style={[styles.circle, { bottom: -50, right: -50, width: 300, height: 300, backgroundColor: colors.secondary[500] + '10' }]} />
            </View>

            <SafeAreaView style={styles.safeArea}>
                <View style={styles.content}>
                    {/* Brand Section */}
                    <MotiView
                        from={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1000, type: 'timing' }}
                        style={styles.brandContainer}
                    >
                        <View style={styles.logoBadge}>
                            <Ionicons name="compass-outline" size={40} color={colors.secondary[400]} />
                        </View>
                        <Text style={styles.brandTitle}>FBLA<Text style={{ color: colors.secondary[400] }}> CONNECT</Text></Text>
                    </MotiView>

                    {/* Hero Text Section */}
                    <View style={styles.heroTextContainer}>
                        <MotiText
                            from={{ opacity: 0, translateY: 30 }}
                            animate={{ opacity: 1, translateY: 0 }}
                            transition={{ delay: 300, type: 'spring' }}
                            style={styles.heroTitle}
                        >
                            Design the Future.
                        </MotiText>
                        <MotiText
                            from={{ opacity: 0, translateY: 30 }}
                            animate={{ opacity: 1, translateY: 0 }}
                            transition={{ delay: 500, type: 'spring' }}
                            style={styles.heroSubtitle}
                        >
                            The premier platform for member engagement, competition prep, and chapter success.
                        </MotiText>
                    </View>

                    {/* Action Cards / Highlights (Replacement for the old grid) */}
                    <View style={styles.highlightsContainer}>
                        <HighlightItem
                            icon="trophy-outline"
                            title="Competition Ready"
                            desc="Real-time rubrics & study guides"
                            delay={700}
                        />
                        <HighlightItem
                            icon="people-outline"
                            title="Chapter Hub"
                            desc="Meeting updates & officer tools"
                            delay={900}
                        />
                    </View>

                    <View style={{ flex: 1 }} />

                    {/* Button Section */}
                    <MotiView
                        from={{ opacity: 0, translateY: 50 }}
                        animate={{ opacity: 1, translateY: 0 }}
                        transition={{ delay: 1100, type: 'spring' }}
                        style={styles.buttonSection}
                    >
                        <TouchableOpacity
                            onPress={() => navigation.navigate('SignUp')}
                            style={styles.primaryButton}
                            activeOpacity={0.8}
                        >
                            <LinearGradient
                                colors={[colors.secondary[500], colors.secondary[700]]}
                                style={styles.primaryButtonGradient}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                            >
                                <Text style={styles.primaryButtonText}>Create Account</Text>
                                <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
                            </LinearGradient>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => navigation.navigate('Login')}
                            style={styles.secondaryButton}
                        >
                            <Text style={styles.secondaryButtonText}>
                                Already have an account? <Text style={styles.loginText}>Sign In</Text>
                            </Text>
                        </TouchableOpacity>
                    </MotiView>

                    <View style={styles.footer}>
                        <Text style={styles.footerText}>Official Nebraska FBLA Resource Hub</Text>
                    </View>
                </View>
            </SafeAreaView>
        </View>
    );
}

function HighlightItem({ icon, title, desc, delay }: { icon: string; title: string; desc: string; delay: number }) {
    return (
        <MotiView
            from={{ opacity: 0, translateX: -20 }}
            animate={{ opacity: 1, translateX: 0 }}
            transition={{ delay, type: 'spring' }}
            style={styles.highlightItem}
        >
            <View style={styles.highlightIcon}>
                <Ionicons name={icon as any} size={24} color={colors.secondary[400]} />
            </View>
            <View>
                <Text style={styles.highlightTitle}>{title}</Text>
                <Text style={styles.highlightDesc}>{desc}</Text>
            </View>
        </MotiView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0A192F',
    },
    safeArea: {
        flex: 1,
    },
    content: {
        flex: 1,
        paddingHorizontal: spacing.xl,
        paddingTop: spacing.xl,
    },
    decorContainer: {
        ...StyleSheet.absoluteFillObject,
        overflow: 'hidden',
    },
    circle: {
        position: 'absolute',
        width: 250,
        height: 250,
        borderRadius: 125,
    },
    brandContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.xxl,
    },
    logoBadge: {
        width: 56,
        height: 56,
        borderRadius: 16,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.md,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    brandTitle: {
        fontSize: 18,
        fontWeight: '900',
        color: '#FFFFFF',
        letterSpacing: 2,
    },
    heroTextContainer: {
        marginBottom: spacing.xxl,
    },
    heroTitle: {
        fontSize: 48,
        fontWeight: '900',
        color: '#FFFFFF',
        lineHeight: 56,
        marginBottom: spacing.md,
        letterSpacing: -1,
    },
    heroSubtitle: {
        fontSize: 18,
        color: 'rgba(255, 255, 255, 0.6)',
        lineHeight: 28,
        fontWeight: '500',
    },
    highlightsContainer: {
        gap: spacing.lg,
    },
    highlightItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        padding: spacing.md,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
    },
    highlightIcon: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: 'rgba(100, 255, 218, 0.1)', // Teal tint
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.md,
    },
    highlightTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 2,
    },
    highlightDesc: {
        fontSize: 13,
        color: 'rgba(255, 255, 255, 0.4)',
    },
    buttonSection: {
        marginBottom: spacing.xxl,
    },
    primaryButton: {
        width: '100%',
        height: 64,
        borderRadius: 20,
        overflow: 'hidden',
        marginBottom: spacing.md,
        ...shadows.md,
    },
    primaryButtonGradient: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: spacing.sm,
    },
    primaryButtonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    secondaryButton: {
        width: '100%',
        paddingVertical: spacing.md,
        alignItems: 'center',
    },
    secondaryButtonText: {
        color: 'rgba(255, 255, 255, 0.5)',
        fontSize: 15,
    },
    loginText: {
        color: colors.secondary[400],
        fontWeight: 'bold',
    },
    footer: {
        alignItems: 'center',
        paddingBottom: spacing.md,
    },
    footerText: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.3)',
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
});
