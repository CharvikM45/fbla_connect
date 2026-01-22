// FBLA Connect - Notifications Screen (Onboarding)
import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Button, Switch } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '../../../shared/navigation/types';
import { useAppDispatch } from '../../../shared/hooks/useRedux';
import { updateProfile } from '../../profile/profileSlice';
import { colors, spacing, typography, borderRadius } from '../../../shared/theme';

type Props = {
    navigation: NativeStackNavigationProp<OnboardingStackParamList, 'Notifications'>;
};

export default function NotificationsScreen({ navigation }: Props) {
    const dispatch = useAppDispatch();

    const [settings, setSettings] = useState({
        events: true,
        deadlines: true,
        announcements: true,
        social: false,
    });

    const handleContinue = () => {
        dispatch(updateProfile({
            contactPreferences: {
                push: settings.events || settings.deadlines || settings.announcements,
                email: true,
                sms: false,
            },
        }));
        navigation.navigate('AIIntro');
    };

    const toggleSetting = (key: keyof typeof settings) => {
        setSettings(prev => ({ ...prev, [key]: !prev[key] }));
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
                    <Text style={styles.stepText}>Step 4 of 5</Text>
                    <Text style={styles.title}>Stay Updated</Text>
                    <Text style={styles.subtitle}>
                        Choose which notifications you'd like to receive
                    </Text>
                </View>

                {/* Notification Options */}
                <View style={styles.optionsContainer}>
                    <NotificationOption
                        icon="calendar"
                        title="Event Reminders"
                        description="Get notified about upcoming events and meetings"
                        value={settings.events}
                        onToggle={() => toggleSetting('events')}
                    />

                    <NotificationOption
                        icon="alarm"
                        title="Deadline Alerts"
                        description="Never miss a registration or submission deadline"
                        value={settings.deadlines}
                        onToggle={() => toggleSetting('deadlines')}
                    />

                    <NotificationOption
                        icon="megaphone"
                        title="Announcements"
                        description="Important news from your chapter and FBLA"
                        value={settings.announcements}
                        onToggle={() => toggleSetting('announcements')}
                    />

                    <NotificationOption
                        icon="share-social"
                        title="Social Activity"
                        description="Updates on chapter social posts and activities"
                        value={settings.social}
                        onToggle={() => toggleSetting('social')}
                    />
                </View>

                {/* Info Card */}
                <View style={styles.infoCard}>
                    <Ionicons name="information-circle" size={20} color={colors.info.main} />
                    <Text style={styles.infoText}>
                        You can change notification preferences anytime in Settings
                    </Text>
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <Button
                        mode="contained"
                        onPress={handleContinue}
                        style={styles.continueButton}
                        contentStyle={styles.buttonContent}
                        labelStyle={styles.buttonLabel}
                    >
                        Continue
                    </Button>
                    <TouchableOpacity onPress={handleContinue}>
                        <Text style={styles.skipText}>Skip for now</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
}

function NotificationOption({
    icon,
    title,
    description,
    value,
    onToggle,
}: {
    icon: string;
    title: string;
    description: string;
    value: boolean;
    onToggle: () => void;
}) {
    return (
        <View style={styles.optionCard}>
            <View style={styles.optionIcon}>
                <Ionicons name={icon as any} size={24} color={colors.primary[600]} />
            </View>
            <View style={styles.optionInfo}>
                <Text style={styles.optionTitle}>{title}</Text>
                <Text style={styles.optionDescription}>{description}</Text>
            </View>
            <Switch value={value} onValueChange={onToggle} color={colors.primary[600]} />
        </View>
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
        paddingBottom: spacing.xl,
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
    optionsContainer: {
        flex: 1,
    },
    optionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.neutral[100],
    },
    optionIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: colors.primary[50],
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.md,
    },
    optionInfo: {
        flex: 1,
        marginRight: spacing.md,
    },
    optionTitle: {
        fontSize: typography.fontSize.md,
        fontWeight: '600',
        color: colors.neutral[900],
        marginBottom: 2,
    },
    optionDescription: {
        fontSize: typography.fontSize.sm,
        color: colors.neutral[500],
    },
    infoCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.info.light,
        padding: spacing.md,
        borderRadius: borderRadius.md,
        marginTop: spacing.lg,
    },
    infoText: {
        flex: 1,
        marginLeft: spacing.sm,
        fontSize: typography.fontSize.sm,
        color: colors.info.dark,
    },
    footer: {
        paddingVertical: spacing.xl,
        alignItems: 'center',
    },
    continueButton: {
        borderRadius: borderRadius.lg,
        width: '100%',
        marginBottom: spacing.md,
    },
    buttonContent: {
        paddingVertical: spacing.sm,
    },
    buttonLabel: {
        fontSize: typography.fontSize.md,
        fontWeight: '600',
    },
    skipText: {
        color: colors.neutral[500],
        fontSize: typography.fontSize.md,
    },
});
