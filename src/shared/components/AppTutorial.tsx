import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Dimensions, Animated } from 'react-native';
import { Text, Card, Button, Portal, Modal } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius, shadows } from '../theme';
import { MotiView, AnimatePresence } from 'moti';

const { width, height } = Dimensions.get('window');

interface TutorialStep {
    title: string;
    description: string;
    icon: string;
}

interface AppTutorialProps {
    visible: boolean;
    onClose: () => void;
    userRole: 'student' | 'officer' | 'adviser' | string;
}

const TUTORIAL_DATA: Record<string, TutorialStep[]> = {
    student: [
        {
            title: "Welcome to FBLA Connect",
            description: "Your all-in-one hub for competition success and chapter engagement.",
            icon: "sparkles",
        },
        {
            title: "Explore Events",
            description: "Find your perfect competition from over 70+ events. View guidelines and rubrics instantly.",
            icon: "trophy",
        },
        {
            title: "AI Power-Ups",
            description: "Use our AI Assistant for practice questions, presentation grading, and FBLA facts.",
            icon: "hardware-chip",
        },
        {
            title: "Earn XP",
            description: "Complete tasks, attend meetings, and climb the leaderboard as you grow.",
            icon: "flash",
        }
    ],
    officer: [
        {
            title: "Officer Dashboard",
            description: "Lead your chapter effectively with powerful management tools.",
            icon: "megaphone",
        },
        {
            title: "Manage Content",
            description: "Keep your members informed by posting news and updating the chapter calendar.",
            icon: "create",
        },
        {
            title: "Track Engagement",
            description: "Monitor member participation and XP rewards for your chapter.",
            icon: "analytics",
        }
    ],
    adviser: [
        {
            title: "Advisor Command Center",
            description: "Oversee your chapter operations and support your student leaders.",
            icon: "school",
        },
        {
            title: "Social Hub",
            description: "Centralize your chapter's Instagram, Facebook, and GroupMe links.",
            icon: "share-social",
        },
        {
            title: "Meeting Manager",
            description: "Easily schedule and manage chapter meetings for all your members.",
            icon: "calendar",
        }
    ]
};

export default function AppTutorial({ visible, onClose, userRole }: AppTutorialProps) {
    const [currentStep, setCurrentStep] = useState(0);
    const roleTutorial = TUTORIAL_DATA[userRole] || TUTORIAL_DATA.student;

    if (!visible) return null;

    const handleNext = () => {
        if (currentStep < roleTutorial.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            onClose();
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const step = roleTutorial[currentStep];

    return (
        <Portal>
            <Modal visible={visible} onDismiss={onClose} contentContainerStyle={styles.modalContainer}>
                <MotiView
                    from={{ opacity: 0, scale: 0.9, translateY: 20 }}
                    animate={{ opacity: 1, scale: 1, translateY: 0 }}
                    style={styles.container}
                >
                    <View style={styles.card}>
                        <View style={styles.progressContainer}>
                            {roleTutorial.map((_, idx) => (
                                <View
                                    key={idx}
                                    style={[
                                        styles.progressBar,
                                        { backgroundColor: idx === currentStep ? colors.primary[600] : colors.neutral[200] }
                                    ]}
                                />
                            ))}
                        </View>

                        <AnimatePresence exitBeforeEnter>
                            <MotiView
                                key={currentStep}
                                from={{ opacity: 0, translateX: 50 }}
                                animate={{ opacity: 1, translateX: 0 }}
                                exit={{ opacity: 0, translateX: -50 }}
                                transition={{ type: 'timing', duration: 300 }}
                                style={styles.content}
                            >
                                <View style={styles.iconCircle}>
                                    <Ionicons name={step.icon as any} size={40} color={colors.primary[600]} />
                                </View>
                                <Text style={styles.title}>{step.title}</Text>
                                <Text style={styles.description}>{step.description}</Text>
                            </MotiView>
                        </AnimatePresence>

                        <View style={styles.footer}>
                            <Button
                                mode="text"
                                onPress={handleBack}
                                disabled={currentStep === 0}
                                textColor={colors.neutral[500]}
                            >
                                Back
                            </Button>
                            <Button
                                mode="contained"
                                onPress={handleNext}
                                style={styles.nextButton}
                                buttonColor={colors.primary[600]}
                            >
                                {currentStep === roleTutorial.length - 1 ? "Start Exploring" : "Next"}
                            </Button>
                        </View>
                    </View>
                </MotiView>
            </Modal>
        </Portal>
    );
}

const styles = StyleSheet.create({
    modalContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.lg,
    },
    container: {
        width: width * 0.85,
        backgroundColor: '#FFFFFF',
        borderRadius: 30,
        overflow: 'hidden',
        ...shadows.lg,
    },
    card: {
        padding: spacing.xl,
    },
    progressContainer: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: spacing.xl,
    },
    progressBar: {
        flex: 1,
        height: 4,
        borderRadius: 2,
    },
    content: {
        alignItems: 'center',
        minHeight: 250,
    },
    iconCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: colors.primary[50],
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.xl,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.neutral[900],
        textAlign: 'center',
        marginBottom: spacing.md,
    },
    description: {
        fontSize: 16,
        color: colors.neutral[600],
        textAlign: 'center',
        lineHeight: 24,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: spacing.xl,
    },
    nextButton: {
        borderRadius: 12,
        paddingHorizontal: spacing.md,
    },
});
