// FBLA Connect - AI Intro Screen (Onboarding)
import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '../../../shared/navigation/types';
import { useAppDispatch } from '../../../shared/hooks/useRedux';
import { completeOnboarding } from '../authSlice';
import { colors, spacing, typography, borderRadius } from '../../../shared/theme';

type Props = {
    navigation: NativeStackNavigationProp<OnboardingStackParamList, 'AIIntro'>;
};

const aiFeatures = [
    {
        icon: 'chatbubbles',
        title: 'Smart Assistant',
        description: 'Get instant answers about FBLA events, guidelines, and resources',
    },
    {
        icon: 'calendar',
        title: 'Competition Planner',
        description: 'Personalized prep timelines and task checklists for your events',
    },
    {
        icon: 'sparkles-outline',
        title: 'Recommendations',
        description: 'Discover events and resources tailored to your interests',
    },
    {
        icon: 'document-text',
        title: 'Document Summaries',
        description: 'Complex guidelines explained in student-friendly language',
    },
];

export default function AIIntroScreen({ navigation }: Props) {
    const dispatch = useAppDispatch();

    const handleGetStarted = () => {
        dispatch(completeOnboarding());
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Ionicons name="arrow-back" size={24} color={colors.neutral[900]} />
                    </TouchableOpacity>
                    <Text style={styles.stepText}>Step 5 of 5</Text>
                    <Text style={styles.title}>Meet Your AI Assistant</Text>
                    <Text style={styles.subtitle}>
                        Powered by AI to help you succeed in FBLA
                    </Text>
                </View>

                {/* AI Icon */}
                <View style={styles.aiIconContainer}>
                    <LinearGradient
                        colors={[colors.primary[500], colors.primary[700]]}
                        style={styles.aiIcon}
                    >
                        <Ionicons name="sparkles-outline" size={48} color="#FFFFFF" />
                    </LinearGradient>
                </View>

                {/* Features */}
                <View style={styles.featuresContainer}>
                    {aiFeatures.map((feature, index) => (
                        <View key={index} style={styles.featureCard}>
                            <View style={styles.featureIcon}>
                                <Ionicons
                                    name={feature.icon as any}
                                    size={22}
                                    color={colors.primary[600]}
                                />
                            </View>
                            <View style={styles.featureInfo}>
                                <Text style={styles.featureTitle}>{feature.title}</Text>
                                <Text style={styles.featureDescription}>{feature.description}</Text>
                            </View>
                        </View>
                    ))}
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <Button
                        mode="contained"
                        onPress={handleGetStarted}
                        style={styles.continueButton}
                        contentStyle={styles.buttonContent}
                        labelStyle={styles.buttonLabel}
                    >
                        Get Started 🚀
                    </Button>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    content: {
        flex: 1,
        paddingHorizontal: spacing.lg,
    },
    header: {
        paddingTop: spacing.md,
        paddingBottom: spacing.lg,
    },
    backButton: {
        marginBottom: spacing.lg,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.neutral[100],
        justifyContent: 'center',
        alignItems: 'center',
    },
    stepText: {
        fontSize: typography.fontSize.sm,
        color: colors.primary[600],
        fontWeight: '600',
        marginBottom: spacing.sm,
    },
    title: {
        fontSize: typography.fontSize.xxxl,
        fontWeight: 'bold',
        color: colors.neutral[900],
        marginBottom: spacing.sm,
    },
    subtitle: {
        fontSize: typography.fontSize.md,
        color: colors.neutral[500],
    },
    aiIconContainer: {
        alignItems: 'center',
        marginVertical: spacing.xl,
    },
    aiIcon: {
        width: 100,
        height: 100,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
    },
    featuresContainer: {
        flex: 1,
    },
    featureCard: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: spacing.lg,
    },
    featureIcon: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: colors.primary[50],
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.md,
    },
    featureInfo: {
        flex: 1,
    },
    featureTitle: {
        fontSize: typography.fontSize.md,
        fontWeight: '600',
        color: colors.neutral[900],
        marginBottom: 4,
    },
    featureDescription: {
        fontSize: typography.fontSize.sm,
        color: colors.neutral[500],
        lineHeight: 20,
    },
    footer: {
        paddingVertical: spacing.xl,
    },
    continueButton: {
        borderRadius: borderRadius.lg,
    },
    buttonContent: {
        paddingVertical: spacing.sm,
    },
    buttonLabel: {
        fontSize: typography.fontSize.md,
        fontWeight: '600',
    },
});
