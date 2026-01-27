import React, { useState, useMemo } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, FlatList, Platform } from 'react-native';
import { Text, Button, Chip, Searchbar, Divider } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '../../../shared/navigation/types';
import { useAppDispatch } from '../../../shared/hooks/useRedux';
import { updateProfile } from '../../profile/profileSlice';
import { colors, spacing, typography, borderRadius } from '../../../shared/theme';
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import competitiveEventsData from '../../../assets/data/competitive_events.json';

type Props = {
    navigation: NativeStackNavigationProp<OnboardingStackParamList, 'Interests'>;
};

const interestSubsets = [
    {
        title: 'Technology',
        icon: '💻',
        items: [
            { id: 'coding', label: 'Coding' },
            { id: 'web-dev', label: 'Web Development' },
            { id: 'mobile-dev', label: 'Mobile Apps' },
            { id: 'cybersecurity', label: 'Cybersecurity' },
            { id: 'data-science', label: 'Data Science' },
        ]
    },
    {
        title: 'Finance & Accounting',
        icon: '💰',
        items: [
            { id: 'accounting', label: 'Accounting' },
            { id: 'personal-finance', label: 'Personal Finance' },
            { id: 'banking', label: 'Banking' },
            { id: 'economics', label: 'Economics' },
            { id: 'investments', label: 'Investments' },
        ]
    },
    {
        title: 'Management & Marketing',
        icon: '📊',
        items: [
            { id: 'business-mgmt', label: 'Business Mgmt' },
            { id: 'marketing', label: 'Marketing' },
            { id: 'entrepreneurship', label: 'Entrepreneurship' },
            { id: 'hospitality', label: 'Hospitality' },
            { id: 'sports-mgmt', label: 'Sports Mgmt' },
        ]
    },
    {
        title: 'Healthcare & Other',
        icon: '🏥',
        items: [
            { id: 'healthcare', label: 'Healthcare Admin' },
            { id: 'human-resources', label: 'Human Resources' },
            { id: 'journalism', label: 'Journalism' },
            { id: 'public-speaking', label: 'Public Speaking' },
            { id: 'leadership', label: 'Leadership' },
        ]
    },
];

export default function InterestsScreen({ navigation }: Props) {
    const dispatch = useAppDispatch();
    const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
    const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState('');

    const filteredEvents = useMemo(() => {
        if (!searchQuery) return competitiveEventsData;
        return competitiveEventsData.filter(event =>
            event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            event.category.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [searchQuery]);

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
            <ScrollView style={styles.content} nestedScrollEnabled={true}>
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
                    <View key={index} style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionEmoji}>{subset.icon}</Text>
                            <Text style={styles.sectionTitle}>{subset.title}</Text>
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
                        {index < interestSubsets.length - 1 && <Divider style={styles.divider} />}
                    </View>
                ))}

                {/* Events Section */}
                <View style={[styles.section, { marginBottom: 100 }]}>
                    <Text style={styles.sectionTitle}>Event Discovery</Text>
                    <Text style={styles.sectionSubtitle}>
                        Search and select competitive events you're interested in
                    </Text>

                    <Searchbar
                        placeholder="Search events..."
                        onChangeText={setSearchQuery}
                        value={searchQuery}
                        style={styles.searchBar}
                        inputStyle={styles.searchBarInput}
                        iconColor={colors.primary[600]}
                    />

                    <View style={styles.eventsContainer}>
                        {filteredEvents.length > 0 ? (
                            filteredEvents.map(event => (
                                <TouchableOpacity
                                    key={event.id}
                                    style={[
                                        styles.eventCard,
                                        selectedEvents.includes(event.id) && styles.eventCardSelected
                                    ]}
                                    onPress={() => toggleEvent(event.id)}
                                >
                                    <View style={styles.eventInfo}>
                                        <Text style={[
                                            styles.eventTitle,
                                            selectedEvents.includes(event.id) && styles.eventTitleSelected
                                        ]}>
                                            {event.title}
                                        </Text>
                                        <Text style={styles.eventCategory}>{event.category}</Text>
                                    </View>
                                    <Ionicons
                                        name={selectedEvents.includes(event.id) ? "checkbox" : "square-outline"}
                                        size={24}
                                        color={selectedEvents.includes(event.id) ? colors.primary[600] : colors.neutral[300]}
                                    />
                                </TouchableOpacity>
                            ))
                        ) : (
                            <Text style={styles.noResults}>No events found matching "{searchQuery}"</Text>
                        )}
                    </View>
                </View>
            </ScrollView>

            {/* Footer */}
            <View style={styles.footer}>
                <View style={styles.footerStats}>
                    <Text style={styles.selectionCount}>
                        {selectedInterests.length} Topics • {selectedEvents.length} Events
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
        marginBottom: spacing.lg,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    sectionEmoji: {
        fontSize: 20,
        marginRight: spacing.sm,
    },
    sectionTitle: {
        fontSize: typography.fontSize.lg,
        fontWeight: '700',
        color: colors.neutral[800],
    },
    sectionSubtitle: {
        fontSize: typography.fontSize.sm,
        color: colors.neutral[500],
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
        fontWeight: '600',
    },
    divider: {
        marginTop: spacing.lg,
        height: 1,
        backgroundColor: colors.neutral[100],
    },
    searchBar: {
        marginBottom: spacing.md,
        backgroundColor: colors.neutral[100],
        borderRadius: borderRadius.md,
        elevation: 0,
        borderWidth: 1,
        borderColor: colors.neutral[200],
    },
    searchBarInput: {
        fontSize: typography.fontSize.md,
    },
    eventsContainer: {
        gap: spacing.sm,
    },
    eventCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: spacing.md,
        borderRadius: borderRadius.md,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: colors.neutral[200],
    },
    eventCardSelected: {
        borderColor: colors.primary[500],
        backgroundColor: colors.primary[50],
    },
    eventInfo: {
        flex: 1,
        marginRight: spacing.md,
    },
    eventTitle: {
        fontSize: typography.fontSize.md,
        fontWeight: '600',
        color: colors.neutral[800],
        marginBottom: 2,
    },
    eventTitleSelected: {
        color: colors.primary[800],
    },
    eventCategory: {
        fontSize: typography.fontSize.xs,
        color: colors.neutral[500],
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    noResults: {
        textAlign: 'center',
        marginTop: spacing.xl,
        color: colors.neutral[400],
        fontSize: typography.fontSize.md,
        fontStyle: 'italic',
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#FFFFFF',
        padding: spacing.lg,
        paddingBottom: Platform.OS === 'ios' ? spacing.xl + 10 : spacing.xl,
        borderTopWidth: 1,
        borderTopColor: colors.neutral[100],
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
    },
    footerStats: {
        marginBottom: spacing.md,
    },
    selectionCount: {
        textAlign: 'center',
        color: colors.neutral[600],
        fontSize: typography.fontSize.sm,
        fontWeight: '500',
    },
    continueButton: {
        borderRadius: borderRadius.lg,
        backgroundColor: colors.primary[600],
    },
    buttonContent: {
        paddingVertical: spacing.sm,
    },
    buttonLabel: {
        fontSize: typography.fontSize.md,
        fontWeight: '700',
        color: '#FFFFFF',
    },
});
