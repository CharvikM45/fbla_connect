import React, { useState, useMemo } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, FlatList, Platform } from 'react-native';
import { Text, Button, Chip, Searchbar, Divider, Card } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '../../../shared/navigation/types';
import { useAppDispatch } from '../../../shared/hooks/useRedux';
import { updateProfile } from '../../profile/profileSlice';
import { colors, spacing, typography, borderRadius, shadows } from '../../../shared/theme';
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import competitiveEventsData from '../../../assets/data/competitive_events.json';
import { MotiView } from 'moti';

type Props = {
    navigation: NativeStackNavigationProp<OnboardingStackParamList, 'Interests'>;
};

const interestSubsets = [
    {
        title: 'Technology',
        icon: 'code-working',
        color: '#6366F1',
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
        icon: 'cash',
        color: '#10B981',
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
        icon: 'stats-chart',
        color: '#F59E0B',
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
        icon: 'medkit',
        color: '#EF4444',
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
            <ScrollView style={styles.content} nestedScrollEnabled={true} showsVerticalScrollIndicator={false}>
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
                        <Text style={styles.sectionTitle}>Event Discovery</Text>
                        <Text style={styles.sectionSubtitle}>
                            Search and select FBLA events
                        </Text>

                        <Searchbar
                            placeholder="Search events..."
                            onChangeText={setSearchQuery}
                            value={searchQuery}
                            style={styles.searchBar}
                            inputStyle={styles.searchBarInput}
                            iconColor={colors.primary[600]}
                            placeholderTextColor={colors.neutral[400]}
                        />

                        <View style={styles.eventsContainer}>
                            {filteredEvents.slice(0, 8).map(event => (
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
                            ))}
                        </View>
                    </Card.Content>
                </Card>
            </ScrollView>

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
