// FBLA Connect - Interests Screen (Onboarding)
import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Text, Button, Chip } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '../../../shared/navigation/types';
import { useAppDispatch } from '../../../shared/hooks/useRedux';
import { updateProfile } from '../../profile/profileSlice';
import { colors, spacing, typography, borderRadius } from '../../../shared/theme';
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";

type Props = {
    navigation: NativeStackNavigationProp<OnboardingStackParamList, 'Interests'>;
};

const interestOptions = [
    { id: 'accounting', label: 'Accounting', icon: '💰' },
    { id: 'business-mgmt', label: 'Business Management', icon: '📊' },
    { id: 'marketing', label: 'Marketing', icon: '📱' },
    { id: 'technology', label: 'Technology', icon: '💻' },
    { id: 'finance', label: 'Finance', icon: '💳' },
    { id: 'entrepreneurship', label: 'Entrepreneurship', icon: '🚀' },
    { id: 'economics', label: 'Economics', icon: '📈' },
    { id: 'public-speaking', label: 'Public Speaking', icon: '🎤' },
    { id: 'hospitality', label: 'Hospitality', icon: '🏨' },
    { id: 'healthcare', label: 'Healthcare', icon: '🏥' },
    { id: 'leadership', label: 'Leadership', icon: '👑' },
    { id: 'community-service', label: 'Community Service', icon: '🤝' },
];

const eventOptions = [
    { id: 'accounting-i', label: 'Accounting I' },
    { id: 'business-comm', label: 'Business Communication' },
    { id: 'coding-prog', label: 'Coding & Programming' },
    { id: 'mobile-app-dev', label: 'Mobile Application Development' },
    { id: 'public-speaking', label: 'Public Speaking' },
    { id: 'website-design', label: 'Website Design' },
    { id: 'social-media', label: 'Social Media Strategies' },
    { id: 'marketing', label: 'Marketing' },
    { id: 'entrepreneurship', label: 'Entrepreneurship' },
    { id: 'graphic-design', label: 'Graphic Design' },
    { id: 'intro-business', label: 'Introduction to Business' },
    { id: 'sports-mgmt', label: 'Sports & Entertainment Management' },
];

export default function InterestsScreen({ navigation }: Props) {
    const dispatch = useAppDispatch();
    const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
    const [selectedEvents, setSelectedEvents] = useState<string[]>([]);

    const toggleInterest = (id: string) => {
        setSelectedInterests(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const toggleEvent = (id: string) => {
        setSelectedEvents(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const updateConvexUser = useMutation(api.users.updateUser);

    const handleContinue = async () => {
        const interestLabels = selectedInterests.map(
            id => interestOptions.find(i => i.id === id)?.label || id
        );

        try {
            await updateConvexUser({
                interests: interestLabels
            });
            dispatch(updateProfile({ interests: interestLabels }));
            navigation.navigate('Notifications');
        } catch (error) {
            console.error("Failed to update interests in Convex:", error);
            dispatch(updateProfile({ interests: interestLabels }));
            navigation.navigate('Notifications');
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView style={styles.content}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Ionicons name="arrow-back" size={24} color={colors.neutral[900]} />
                    </TouchableOpacity>
                    <Text style={styles.stepText}>Step 3 of 5</Text>
                    <Text style={styles.title}>Your Interests</Text>
                    <Text style={styles.subtitle}>
                        Select topics and events you're interested in
                    </Text>
                </View>

                {/* Interests Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Business Interests</Text>
                    <View style={styles.chipContainer}>
                        {interestOptions.map(interest => (
                            <Chip
                                key={interest.id}
                                selected={selectedInterests.includes(interest.id)}
                                onPress={() => toggleInterest(interest.id)}
                                style={[
                                    styles.chip,
                                    selectedInterests.includes(interest.id) && styles.chipSelected,
                                ]}
                                textStyle={[
                                    styles.chipText,
                                    selectedInterests.includes(interest.id) && styles.chipTextSelected,
                                ]}
                                showSelectedCheck={false}
                            >
                                {interest.icon} {interest.label}
                            </Chip>
                        ))}
                    </View>
                </View>

                {/* Events Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Competitive Events</Text>
                    <View style={styles.chipContainer}>
                        {eventOptions.map(event => (
                            <Chip
                                key={event.id}
                                selected={selectedEvents.includes(event.id)}
                                onPress={() => toggleEvent(event.id)}
                                style={[
                                    styles.chip,
                                    selectedEvents.includes(event.id) && styles.chipSelected,
                                ]}
                                textStyle={[
                                    styles.chipText,
                                    selectedEvents.includes(event.id) && styles.chipTextSelected,
                                ]}
                                showSelectedCheck={false}
                            >
                                {event.label}
                            </Chip>
                        ))}
                    </View>
                </View>
            </ScrollView>

            {/* Footer */}
            <View style={styles.footer}>
                <Text style={styles.selectionCount}>
                    {selectedInterests.length + selectedEvents.length} selected
                </Text>
                <Button
                    mode="contained"
                    onPress={handleContinue}
                    disabled={selectedInterests.length === 0}
                    style={styles.continueButton}
                    contentStyle={styles.buttonContent}
                    labelStyle={styles.buttonLabel}
                >
                    Continue
                </Button>
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
    section: {
        marginBottom: spacing.xl,
    },
    sectionTitle: {
        fontSize: typography.fontSize.lg,
        fontWeight: '600',
        color: colors.neutral[800],
        marginBottom: spacing.md,
    },
    chipContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.sm,
    },
    chip: {
        marginBottom: spacing.xs,
        backgroundColor: colors.neutral[100],
        borderWidth: 1,
        borderColor: colors.neutral[200],
    },
    chipSelected: {
        backgroundColor: colors.primary[100],
        borderColor: colors.primary[600],
    },
    chipText: {
        color: colors.neutral[700],
        fontSize: typography.fontSize.sm,
    },
    chipTextSelected: {
        color: colors.primary[700],
        fontWeight: '500',
    },
    footer: {
        padding: spacing.lg,
        paddingBottom: spacing.xl,
        borderTopWidth: 1,
        borderTopColor: colors.neutral[100],
    },
    selectionCount: {
        textAlign: 'center',
        color: colors.neutral[500],
        fontSize: typography.fontSize.sm,
        marginBottom: spacing.md,
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
