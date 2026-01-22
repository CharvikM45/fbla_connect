// FBLA Connect - Welcome Screen
import React from 'react';
import {
    View,
    StyleSheet,
    Image,
    Dimensions,
    ImageBackground,
} from 'react-native';
import { Text, Button } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../../shared/navigation/types';
import { colors, spacing, typography } from '../../../shared/theme';

type Props = {
    navigation: NativeStackNavigationProp<AuthStackParamList, 'Welcome'>;
};

const { height } = Dimensions.get('window');

export default function WelcomeScreen({ navigation }: Props) {
    return (
        <View style={styles.container}>
            <LinearGradient
                colors={[colors.primary[700], colors.primary[900]]}
                style={styles.gradient}
            >
                <SafeAreaView style={styles.safeArea}>
                    {/* Hero Section */}
                    <View style={styles.heroSection}>
                        <View style={styles.logoContainer}>
                            <View style={styles.logoPlaceholder}>
                                <Text style={styles.logoText}>FBLA</Text>
                            </View>
                        </View>
                        <Text style={styles.title}>FBLA Connect</Text>
                        <Text style={styles.subtitle}>
                            Design the Future of Member Engagement
                        </Text>
                    </View>

                    {/* Features Preview */}
                    <View style={styles.featuresSection}>
                        <View style={styles.featureRow}>
                            <FeatureItem emoji="📅" text="Events & Calendar" />
                            <FeatureItem emoji="📚" text="Resources" />
                        </View>
                        <View style={styles.featureRow}>
                            <FeatureItem emoji="🤖" text="AI Assistant" />
                            <FeatureItem emoji="🏆" text="Achievements" />
                        </View>
                    </View>

                    {/* Action Buttons */}
                    <View style={styles.buttonSection}>
                        <Button
                            mode="contained"
                            onPress={() => navigation.navigate('SignUp')}
                            style={styles.primaryButton}
                            contentStyle={styles.buttonContent}
                            labelStyle={styles.buttonLabel}
                            buttonColor={colors.secondary[500]}
                        >
                            Get Started
                        </Button>
                        <Button
                            mode="outlined"
                            onPress={() => navigation.navigate('Login')}
                            style={styles.secondaryButton}
                            contentStyle={styles.buttonContent}
                            labelStyle={styles.secondaryButtonLabel}
                            textColor="#FFFFFF"
                        >
                            I already have an account
                        </Button>
                    </View>

                    {/* Footer */}
                    <View style={styles.footer}>
                        <Text style={styles.footerText}>
                            Future Business Leaders of America
                        </Text>
                    </View>
                </SafeAreaView>
            </LinearGradient>
        </View>
    );
}

function FeatureItem({ emoji, text }: { emoji: string; text: string }) {
    return (
        <View style={styles.featureItem}>
            <Text style={styles.featureEmoji}>{emoji}</Text>
            <Text style={styles.featureText}>{text}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    gradient: {
        flex: 1,
    },
    safeArea: {
        flex: 1,
        paddingHorizontal: spacing.lg,
    },
    heroSection: {
        flex: 2,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoContainer: {
        marginBottom: spacing.lg,
    },
    logoPlaceholder: {
        width: 100,
        height: 100,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    logoText: {
        fontSize: typography.fontSize.xxl,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    title: {
        fontSize: typography.fontSize.display,
        fontWeight: 'bold',
        color: '#FFFFFF',
        textAlign: 'center',
        marginBottom: spacing.sm,
    },
    subtitle: {
        fontSize: typography.fontSize.lg,
        color: 'rgba(255, 255, 255, 0.85)',
        textAlign: 'center',
        paddingHorizontal: spacing.lg,
    },
    featuresSection: {
        flex: 1,
        justifyContent: 'center',
    },
    featureRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginVertical: spacing.sm,
    },
    featureItem: {
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.lg,
        borderRadius: 12,
        minWidth: 140,
    },
    featureEmoji: {
        fontSize: 28,
        marginBottom: spacing.xs,
    },
    featureText: {
        color: '#FFFFFF',
        fontSize: typography.fontSize.sm,
        fontWeight: '500',
    },
    buttonSection: {
        paddingBottom: spacing.xl,
    },
    primaryButton: {
        borderRadius: 12,
        marginBottom: spacing.md,
    },
    secondaryButton: {
        borderRadius: 12,
        borderColor: 'rgba(255, 255, 255, 0.5)',
        borderWidth: 2,
    },
    buttonContent: {
        paddingVertical: spacing.sm,
    },
    buttonLabel: {
        fontSize: typography.fontSize.lg,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    secondaryButtonLabel: {
        fontSize: typography.fontSize.md,
        fontWeight: '500',
    },
    footer: {
        paddingBottom: spacing.md,
        alignItems: 'center',
    },
    footerText: {
        color: 'rgba(255, 255, 255, 0.6)',
        fontSize: typography.fontSize.sm,
    },
});
