import React, { useState, useMemo } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, FlatList, Platform, Image } from 'react-native';
import { Text, Button, Chip, Searchbar, Divider } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '../../../shared/navigation/types';
import { useAppDispatch } from '../../../shared/hooks/useRedux';
import { updateProfile } from '../../profile/profileSlice';
import { colors, spacing, typography, borderRadius, gradients } from '../../../shared/theme';
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import competitiveEventsData from '../../../assets/data/competitive_events.json';
import { GlassCard } from '../../../shared/components/GlassCard';
import { GlowView } from '../../../shared/components/GlowView';

type Props = {
    navigation: NativeStackNavigationProp<OnboardingStackParamList, 'Interests'>;
};

const interestSubsets = [
    {
        title: 'Technology',
        icon: '💻',
        image: require('../../../../.gemini/antigravity/brain/544463c5-344b-4ad5-b6b8-29889db63c70/premium_3d_tech_icon_1769545078307.png'),
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
        image: require('../../../../.gemini/antigravity/brain/544463c5-344b-4ad5-b6b8-29889db63c70/premium_3d_finance_icon_1769545091058.png'),
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
        image: require('../../../../.gemini/antigravity/brain/544463c5-344b-4ad5-b6b8-29889db63c70/premium_3d_feature_networking_1769545065045.png'),
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
        image: require('../../../../.gemini/antigravity/brain/544463c5-344b-4ad5-b6b8-29889db63c70/premium_3d_healthcare_icon_abstract_1769545105043.png'),
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
                <GlowView color="blue" intensity={1.5} style={styles.headerGlow}>
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
                </GlowView>

                {/* Interests Subsets */}
                {interestSubsets.map((subset, index) => (
                    <GlassCard key={index} style={styles.sectionCard}>
                        <View style={styles.sectionHeader}>
                            <Image source={subset.image} style={styles.sectionImage} />
                            <View>
                                <Text style={styles.sectionTitle}>{subset.title}</Text>
                                <Text style={[styles.sectionSubtitle, { marginBottom: 0 }]}>Explore {subset.title} topics</Text>
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
                    </GlassCard>
                ))}

                {/* Events Section */}
                <GlassCard style={[styles.sectionCard, { marginBottom: 120 }]}>
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
                        {filteredEvents.slice(0, 10).map(event => (
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
                                    color={selectedEvents.includes(event.id) ? colors.primary[600] : colors.neutral[400]}
                                />
                            </TouchableOpacity>
                        ))}
                    </View>
                </GlassCard>
            </ScrollView>

            {/* Premium Footer */}
            <View style={styles.footer}>
                <Divider style={{ marginBottom: spacing.md, opacity: 0.5 }} />
                <View style={styles.footerContent}>
                    <View>
                        <Text style={styles.footerLabel}>SELECTIONS</Text>
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
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.neutral[900], // Dark theme for premium feel
    },
    content: {
        flex: 1,
        paddingHorizontal: spacing.md,
    },
    headerGlow: {
        width: '100%',
        marginBottom: spacing.lg,
    },
    header: {
        paddingTop: spacing.xl,
        paddingBottom: spacing.md,
        alignItems: 'center',
    },
    backButton: {
        position: 'absolute',
        top: spacing.xl,
        left: 0,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    stepText: {
        fontSize: typography.fontSize.xs,
        color: colors.primary[400],
        fontWeight: '800',
        textTransform: 'uppercase',
        letterSpacing: 1.5,
        marginBottom: spacing.xs,
    },
    title: {
        fontSize: typography.fontSize.xxxl,
        fontWeight: '900',
        color: '#FFFFFF',
        textAlign: 'center',
    },
    subtitle: {
        fontSize: typography.fontSize.md,
        color: colors.neutral[400],
        textAlign: 'center',
        marginTop: spacing.xs,
    },
    sectionCard: {
        marginBottom: spacing.lg,
        padding: spacing.md,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.lg,
    },
    sectionImage: {
        width: 60,
        height: 60,
        borderRadius: 12,
        marginRight: spacing.md,
    },
    sectionTitle: {
        fontSize: typography.fontSize.xl,
        fontWeight: '800',
        color: '#FFFFFF',
    },
    sectionSubtitle: {
        fontSize: typography.fontSize.xs,
        color: colors.neutral[500],
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    chipContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.sm,
    },
    chip: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderColor: 'rgba(255,255,255,0.1)',
    },
    chipSelected: {
        backgroundColor: colors.primary[600],
        borderColor: colors.primary[400],
    },
    chipText: {
        color: colors.neutral[300],
    },
    chipTextSelected: {
        color: '#FFFFFF',
        fontWeight: '700',
    },
    searchBar: {
        backgroundColor: 'rgba(0,0,0,0.2)',
        borderRadius: borderRadius.lg,
        marginVertical: spacing.md,
    },
    searchBarInput: {
        color: '#FFFFFF',
    },
    eventsContainer: {
        gap: spacing.xs,
    },
    eventCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.md,
        borderRadius: borderRadius.md,
        backgroundColor: 'rgba(255,255,255,0.03)',
    },
    eventCardSelected: {
        backgroundColor: 'rgba(29, 82, 188, 0.2)',
        borderWidth: 1,
        borderColor: colors.primary[500],
    },
    eventInfo: {
        flex: 1,
    },
    eventTitle: {
        fontSize: typography.fontSize.md,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    eventTitleSelected: {
        color: colors.primary[300],
    },
    eventCategory: {
        fontSize: typography.fontSize.xs,
        color: colors.neutral[500],
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(24, 24, 27, 0.95)',
        padding: spacing.lg,
        paddingBottom: Platform.OS === 'ios' ? spacing.xxl : spacing.xl,
    },
    footerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    footerLabel: {
        fontSize: 10,
        color: colors.neutral[500],
        fontWeight: '900',
        letterSpacing: 1,
    },
    selectionCount: {
        color: '#FFFFFF',
        fontSize: typography.fontSize.sm,
        fontWeight: '700',
    },
    continueButton: {
        borderRadius: borderRadius.full,
        paddingHorizontal: spacing.lg,
    },
    buttonContent: {
        height: 50,
    },
    buttonLabel: {
        fontSize: typography.fontSize.md,
        fontWeight: '800',
    },
});
