import React, { useState, useMemo } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, FlatList, Platform, KeyboardAvoidingView } from 'react-native';
import { Text, Button, Chip, Searchbar, Divider, Card } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '../../../shared/navigation/types';
import { useAppDispatch, useAppSelector } from '../../../shared/hooks/useRedux';
import { updateProfile } from '../../profile/profileSlice';
import { colors, spacing, typography, borderRadius, shadows } from '../../../shared/theme';
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import competitiveEventsData from '../../../assets/data/competitive_events.json';
import { MotiView } from 'moti';
import { interestSubsets } from '../../../shared/constants/interests';
import EventSelector from '../../../shared/components/EventSelector';

type Props = {
    navigation: NativeStackNavigationProp<OnboardingStackParamList, 'Interests'>;
};


export default function InterestsScreen({ navigation }: Props) {
    const dispatch = useAppDispatch();
    const user = useAppSelector(state => state.auth.user);
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
    const addXP = useMutation(api.profiles.addXP);

    const handleContinue = async () => {
        const interestLabels = selectedInterests.map(id => {
            for (const subset of interestSubsets) {
                const item = subset.items.find(i => i.id === id);
                if (item) return item.label;
            }
            return id;
        });

        const eventTitles = selectedEvents.map(id =>
            competitiveEventsData.find(e => e.id === id)?.title || id
        );

        try {
            await updateConvexUser({
                interests: [...interestLabels, ...eventTitles]
            });
            dispatch(updateProfile({
                interests: interestLabels,
                competitiveEvents: selectedEvents.map(id => {
                    const e = competitiveEventsData.find(ev => ev.id === id);
                    return {
                        id,
                        name: e?.title || id,
                        category: e?.category || 'General',
                        year: new Date().getFullYear().toString()
                    };
                })
            }));
            navigation.navigate('Notifications');
        } catch (error) {
            console.error("Failed to update interests in Convex:", error);
            navigation.navigate('Notifications');
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
            >
                <ScrollView
                    style={styles.content}
                    contentContainerStyle={{ paddingBottom: 140 }}
                    nestedScrollEnabled={true}
                    showsVerticalScrollIndicator={false}
                >
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
                            Select topics and competitive events
                        </Text>
                    </View>

                    {/* Interests Subsets */}
                    {interestSubsets.map((subset, index) => (
                        <Card key={index} style={styles.sectionCard}>
                            <Card.Content>
                                <View style={styles.sectionHeader}>
                                    <View style={[styles.sectionIcon, { backgroundColor: subset.color + '15' }]}>
                                        <Ionicons name={subset.icon as any} size={28} color={subset.color} />
                                    </View>
                                    <View>
                                        <Text style={styles.sectionTitle}>{subset.title}</Text>
                                        <Text style={styles.sectionSubtitle}>Select topics that interest you</Text>
                                    </View>
                                </View>
                                <View style={styles.chipContainer}>
                                    {subset.items.map(item => (
                                        <Chip
                                            key={item.id}
                                            selected={selectedInterests.includes(item.id)}
                                            onPress={() => toggleInterest(item.id)}
                                            style={[
                                                styles.chip,
                                                selectedInterests.includes(item.id) && styles.chipSelected,
                                            ]}
                                            textStyle={[
                                                styles.chipText,
                                                selectedInterests.includes(item.id) && styles.chipTextSelected,
                                            ]}
                                            showSelectedCheck={false}
                                        >
                                            {item.label}
                                        </Chip>
                                    ))}
                                </View>
                            </Card.Content>
                        </Card>
                    ))}

                    {/* Events Section */}
                    <Card style={[styles.sectionCard, { marginBottom: 120 }]}>
                        <Card.Content>
                            <View style={styles.sectionHeader}>
                                <View style={[styles.sectionIcon, { backgroundColor: colors.primary[50] }]}>
                                    <Ionicons name="trophy" size={28} color={colors.primary[600]} />
                                </View>
                                <View>
                                    <Text style={styles.sectionTitle}>Event Discovery</Text>
                                    <Text style={styles.sectionSubtitle}>Search and select FBLA competitive events</Text>
                                </View>
                            </View>

                            <EventSelector
                                allEvents={competitiveEventsData}
                                selectedEvents={selectedEvents}
                                onToggleEvent={toggleEvent}
                                onSelect={() => {
                                    if (user?.id) {
                                        addXP({ amount: 20, userId: user.id as any });
                                    }
                                }}
                                placeholder="Type an event name..."
                            />
                        </Card.Content>
                    </Card>
                </ScrollView>
            </KeyboardAvoidingView>

            <View style={styles.footer}>
                <Divider style={{ marginBottom: spacing.md }} />
                <View style={styles.footerContent}>
                    <View>
                        <Text style={styles.footerLabel}>SELECTIONS</Text>
                        <Text style={styles.selectionCount}>
                            {selectedInterests.length + selectedEvents.length} selected
                        </Text>
                    </View>
                    <Button
                        mode="contained"
                        onPress={handleContinue}
                        disabled={selectedInterests.length === 0 && selectedEvents.length === 0}
                        style={styles.continueButton}
                        contentStyle={styles.buttonContent}
                        labelStyle={styles.buttonLabel}
                    >
                        Continue
                    </Button>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.neutral[50],
    },
    content: {
        flex: 1,
        paddingHorizontal: spacing.md,
    },
    header: {
        paddingTop: spacing.md,
        paddingBottom: spacing.lg,
    },
    backButton: {
        marginBottom: spacing.md,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 2,
    },
    stepText: {
        fontSize: typography.fontSize.sm,
        color: colors.primary[600],
        fontWeight: 'bold',
        marginBottom: spacing.xs,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: colors.neutral[900],
    },
    subtitle: {
        fontSize: 15,
        color: colors.neutral[500],
        marginTop: 4,
    },
    sectionCard: {
        marginBottom: spacing.md,
        borderRadius: 20,
        backgroundColor: '#FFFFFF',
        elevation: 2,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    sectionIcon: {
        width: 52,
        height: 52,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.md,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.neutral[900],
    },
    sectionSubtitle: {
        fontSize: 12,
        color: colors.neutral[500],
    },
    chipContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.xs,
    },
    chip: {
        backgroundColor: colors.neutral[50],
        marginBottom: spacing.xs,
    },
    chipSelected: {
        backgroundColor: colors.primary[600],
    },
    chipText: {
        color: colors.neutral[600],
        fontSize: 13,
    },
    chipTextSelected: {
        color: '#FFFFFF',
        fontWeight: 'bold',
    },
    searchBar: {
        backgroundColor: colors.neutral[50],
        borderRadius: 12,
        marginVertical: spacing.md,
        elevation: 0,
        borderWidth: 1,
        borderColor: colors.neutral[100],
    },
    searchBarInput: {
        fontSize: 14,
    },
    eventsContainer: {
        gap: spacing.sm,
    },
    eventCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.md,
        borderRadius: 12,
        backgroundColor: colors.neutral[50],
        borderWidth: 1,
        borderColor: 'transparent',
    },
    eventCardSelected: {
        backgroundColor: colors.primary[50],
        borderColor: colors.primary[200],
    },
    eventInfo: {
        flex: 1,
    },
    eventTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: colors.neutral[800],
    },
    eventTitleSelected: {
        color: colors.primary[700],
    },
    eventCategory: {
        fontSize: 12,
        color: colors.neutral[500],
        marginTop: 2,
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#FFFFFF',
        padding: spacing.lg,
        paddingBottom: Platform.OS === 'ios' ? spacing.xl * 1.5 : spacing.lg,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
    },
    footerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    footerLabel: {
        fontSize: 10,
        color: colors.neutral[400],
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    selectionCount: {
        color: colors.neutral[900],
        fontSize: 14,
        fontWeight: 'bold',
    },
    continueButton: {
        borderRadius: 15,
        paddingHorizontal: spacing.lg,
    },
    buttonContent: {
        height: 50,
    },
    buttonLabel: {
        fontSize: 16,
        fontWeight: 'bold',
    },
});
