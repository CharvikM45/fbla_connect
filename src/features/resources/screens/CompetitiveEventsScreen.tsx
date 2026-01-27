// FBLA Connect - Competitive Events Screen
import React, { useState, useMemo } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { Text, Searchbar, Chip, Card, IconButton, Portal, Modal, Button, List } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius, shadows } from '../../../shared/theme';

// Import dataset
import COMPETITIVE_EVENTS from '../../../assets/data/competitive_events.json';

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";

interface CompetitiveEvent {
    id: string;
    title: string;
    category: string;
    division: string;
    description?: string;
    linkUrl?: string;
}

export default function CompetitiveEventsScreen() {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string | 'All'>('All');
    const [selectedEvent, setSelectedEvent] = useState<CompetitiveEvent | null>(null);
    const [showModal, setShowModal] = useState(false);

    // Convex Query
    const liveEvents = useQuery(api.competitive_events.getEvents, {
        category: selectedCategory,
        search: searchQuery
    });

    const categories = useMemo(() => {
        const cats = new Set(COMPETITIVE_EVENTS.map((e: any) => e.category));
        return ['All', ...Array.from(cats)];
    }, []);

    const filteredEvents = useMemo((): CompetitiveEvent[] => {
        if (liveEvents && liveEvents.length > 0) {
            return liveEvents.map((e: any) => ({
                id: e._id || e.id,
                title: e.title,
                category: e.category,
                division: e.division,
                description: e.description,
                linkUrl: e.linkUrl
            }));
        }

        // Fallback to local filtering
        return COMPETITIVE_EVENTS.filter((event: CompetitiveEvent) => {
            const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                event.description?.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory = selectedCategory === 'All' || event.category === selectedCategory;
            return matchesSearch && matchesCategory;
        });
    }, [liveEvents, searchQuery, selectedCategory]);

    const handleOpenLink = () => {
        if (selectedEvent?.linkUrl) {
            import('react-native').then(({ Linking }) => {
                Linking.openURL(selectedEvent.linkUrl!);
            });
        }
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Searchbar
                    placeholder="Search events..."
                    onChangeText={setSearchQuery}
                    value={searchQuery}
                    style={styles.searchbar}
                    inputStyle={styles.searchInput}
                    iconColor={colors.neutral[500]}
                />
            </View>

            {/* Category selection */}
            <View style={styles.filterContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
                    {categories.map(cat => (
                        <Chip
                            key={cat}
                            selected={selectedCategory === cat}
                            onPress={() => setSelectedCategory(cat)}
                            style={[styles.chip, selectedCategory === cat && styles.chipSelected]}
                            textStyle={[styles.chipText, selectedCategory === cat && styles.chipTextSelected]}
                            ellipsizeMode="tail"
                        >
                            {cat}
                        </Chip>
                    ))}
                </ScrollView>
            </View>

            {/* Event List */}
            <FlatList
                data={filteredEvents}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                renderItem={({ item }) => (
                    <TouchableOpacity onPress={() => { setSelectedEvent(item); setShowModal(true); }} activeOpacity={0.7}>
                        <Card style={styles.eventCard} mode="contained">
                            <Card.Content style={styles.cardContent}>
                                <View style={styles.eventIcon}>
                                    <Ionicons name="trophy-outline" size={24} color={colors.primary[600]} />
                                </View>
                                <View style={styles.eventInfo}>
                                    <Text style={styles.eventTitle}>{item.title}</Text>
                                    <Text style={styles.eventCategory}>{item.category} • {item.division}</Text>
                                </View>
                                <IconButton icon="chevron-right" size={20} iconColor={colors.neutral[400]} />
                            </Card.Content>
                        </Card>
                    </TouchableOpacity>
                )}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Ionicons name="search-outline" size={48} color={colors.neutral[300]} />
                        <Text style={styles.emptyText}>No events found matching your criteria</Text>
                    </View>
                }
            />

            {/* Event Detail Modal */}
            <Portal>
                <Modal
                    visible={showModal}
                    onDismiss={() => setShowModal(false)}
                    contentContainerStyle={styles.modal}
                >
                    {selectedEvent && (
                        <View style={styles.modalContent}>
                            <View style={styles.modalHeader}>
                                <View style={styles.modalIconContainer}>
                                    <Ionicons name="ribbon" size={32} color={colors.secondary[500]} />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.modalTitle}>{selectedEvent.title}</Text>
                                    <View style={styles.modalMeta}>
                                        <Chip compact style={styles.modalChip} textStyle={styles.modalChipText}>{selectedEvent.category}</Chip>
                                        <Chip compact style={styles.modalChip} textStyle={styles.modalChipText}>{selectedEvent.division}</Chip>
                                    </View>
                                </View>
                            </View>

                            <Text style={styles.sectionHeader}>Description</Text>
                            <Text style={styles.modalDescription}>
                                {selectedEvent.description || "Refer to the official FBLA Competitive Events guidelines for detailed requirements and scoring rubrics for this event."}
                            </Text>

                            <List.Section style={styles.resourceSection}>
                                <List.Subheader style={styles.sectionHeader}>Resources</List.Subheader>
                                <List.Item
                                    title="View Official Guidelines"
                                    description="Opens official FBLA portal"
                                    left={props => <View style={[styles.resourceIcon, { backgroundColor: colors.error.light }]}><Ionicons name="document-text" size={20} color={colors.error.main} /></View>}
                                    onPress={handleOpenLink}
                                    style={styles.resourceItem}
                                    titleStyle={styles.resourceTitle}
                                />
                                <List.Item
                                    title="Competitive Event Prep"
                                    description="Study guides & materials"
                                    left={props => <View style={[styles.resourceIcon, { backgroundColor: colors.primary[50] }]}><Ionicons name="school" size={20} color={colors.primary[600]} /></View>}
                                    onPress={() => { }}
                                    style={styles.resourceItem}
                                    titleStyle={styles.resourceTitle}
                                />
                            </List.Section>

                            <Button
                                mode="contained"
                                style={styles.modalButton}
                                contentStyle={{ height: 48 }}
                                labelStyle={{ fontSize: 16, fontWeight: '600' }}
                                onPress={() => setShowModal(false)}
                            >
                                Close
                            </Button>
                        </View>
                    )}
                </Modal>
            </Portal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.neutral[50],
    },
    header: {
        padding: spacing.md,
        backgroundColor: '#FFFFFF',
    },
    searchbar: {
        elevation: 0,
        backgroundColor: colors.neutral[100],
        borderRadius: borderRadius.lg,
    },
    filterContainer: {
        backgroundColor: '#FFFFFF',
        paddingBottom: spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: colors.neutral[100],
    },
    filterRow: {
        paddingHorizontal: spacing.md,
        gap: spacing.sm,
    },
    chip: {
        backgroundColor: colors.neutral[100],
    },
    chipSelected: {
        backgroundColor: colors.primary[600],
    },
    chipText: {
        color: colors.neutral[600],
        fontSize: 12,
    },
    chipTextSelected: {
        color: '#FFFFFF',
    },
    listContent: {
        padding: spacing.md,
        paddingBottom: 100,
    },
    eventCard: {
        marginBottom: spacing.sm,
        backgroundColor: '#FFFFFF',
        borderRadius: borderRadius.md,
    },
    cardContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    eventIcon: {
        width: 40,
        height: 40,
        borderRadius: 8,
        backgroundColor: colors.primary[50],
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.md,
    },
    eventInfo: {
        flex: 1,
    },
    eventTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.neutral[900],
    },
    eventCategory: {
        fontSize: 12,
        color: colors.neutral[500],
        marginTop: 2,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 100,
    },
    emptyText: {
        marginTop: spacing.md,
        color: colors.neutral[400],
        textAlign: 'center',
    },
    modal: {
        backgroundColor: 'transparent',
        margin: spacing.lg,
    },
    modalContent: {
        backgroundColor: '#FFFFFF',
        borderRadius: borderRadius.xl,
        overflow: 'hidden',
        // Start Shadow
        shadowColor: colors.neutral[900],
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.25,
        shadowRadius: 20,
        elevation: 10,
        // End Shadow
    },
    modalHeader: {
        flexDirection: 'row',
        padding: spacing.lg,
        backgroundColor: colors.primary[50],
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: colors.neutral[100],
    },
    modalIconContainer: {
        width: 56,
        height: 56,
        borderRadius: 16,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.md,
        // Remove individual shadow here as it's flat inside the modal header
        borderWidth: 1,
        borderColor: colors.neutral[100],
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.neutral[900],
        marginBottom: 4,
    },
    modalMeta: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.xs,
    },
    modalChip: {
        backgroundColor: '#FFFFFF',
        height: 24,
    },
    modalChipText: {
        fontSize: 10,
        color: colors.neutral[600],
    },
    sectionHeader: {
        color: colors.neutral[400],
        fontSize: 12,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginTop: spacing.lg,
        marginBottom: spacing.xs,
        paddingHorizontal: spacing.lg,
    },
    modalDescription: {
        fontSize: 15,
        color: colors.neutral[700],
        lineHeight: 22,
        paddingHorizontal: spacing.lg,
    },
    resourceSection: {
        marginTop: spacing.sm,
    },
    resourceItem: {
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.sm,
    },
    resourceIcon: {
        width: 36,
        height: 36,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.sm,
    },
    resourceTitle: {
        fontSize: 15,
        fontWeight: '500',
        color: colors.primary[600],
    },
    modalButton: {
        margin: spacing.lg,
        borderRadius: borderRadius.lg,
        backgroundColor: colors.primary[700],
    },
});
