// FBLA Connect - Competitive Events Screen
import React, { useState, useMemo } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { Text, Searchbar, Chip, Card, IconButton, Portal, Modal, Button, List } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius, shadows } from '../../../shared/theme';

// Import dataset
import COMPETITIVE_EVENTS from '../../../assets/data/competitive_events.json';

interface CompetitiveEvent {
    id: string;
    title: string;
    category: string;
    division: string;
    description?: string;
}

export default function CompetitiveEventsScreen() {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string | 'All'>('All');
    const [selectedEvent, setSelectedEvent] = useState<CompetitiveEvent | null>(null);
    const [showModal, setShowModal] = useState(false);

    const categories = useMemo(() => {
        const cats = new Set(COMPETITIVE_EVENTS.map(e => e.category));
        return ['All', ...Array.from(cats)];
    }, []);

    const filteredEvents = useMemo(() => {
        return COMPETITIVE_EVENTS.filter(event => {
            const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                event.description?.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory = selectedCategory === 'All' || event.category === selectedCategory;
            return matchesSearch && matchesCategory;
        });
    }, [searchQuery, selectedCategory]);

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Searchbar
                    placeholder="Search events..."
                    onChangeText={setSearchQuery}
                    value={searchQuery}
                    style={styles.searchbar}
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
                    <TouchableOpacity onPress={() => { setSelectedEvent(item); setShowModal(true); }}>
                        <Card style={styles.eventCard}>
                            <Card.Content style={styles.cardContent}>
                                <View style={styles.eventIcon}>
                                    <Ionicons name="document-text-outline" size={24} color={colors.primary[600]} />
                                </View>
                                <View style={styles.eventInfo}>
                                    <Text style={styles.eventTitle}>{item.title}</Text>
                                    <Text style={styles.eventCategory}>{item.category} • {item.division}</Text>
                                </View>
                                <IconButton icon="chevron-right" size={20} />
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
                        <View>
                            <Text style={styles.modalTitle}>{selectedEvent.title}</Text>
                            <View style={styles.modalMeta}>
                                <Chip compact style={styles.modalChip}>{selectedEvent.category}</Chip>
                                <Chip compact style={styles.modalChip}>{selectedEvent.division}</Chip>
                            </View>
                            <Text style={styles.modalDescription}>
                                {selectedEvent.description || "Refer to the official FBLA Competitive Events guidelines for detailed requirements and scoring rubrics for this event."}
                            </Text>

                            <List.Section>
                                <List.Subheader>Resources</List.Subheader>
                                <List.Item
                                    title="View Official Guidelines"
                                    left={props => <List.Icon {...props} icon="file-pdf-box" color={colors.error.main} />}
                                    onPress={() => { }}
                                />
                                <List.Item
                                    title="Competitive Event Prep"
                                    left={props => <List.Icon {...props} icon="brain" color={colors.primary[600]} />}
                                    onPress={() => { }}
                                />
                            </List.Section>

                            <Button
                                mode="contained"
                                style={styles.modalButton}
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
        backgroundColor: '#FFFFFF',
        margin: spacing.lg,
        padding: spacing.lg,
        borderRadius: borderRadius.xl,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.neutral[900],
        marginBottom: spacing.sm,
    },
    modalMeta: {
        flexDirection: 'row',
        gap: spacing.sm,
        marginBottom: spacing.md,
    },
    modalChip: {
        backgroundColor: colors.neutral[100],
    },
    modalDescription: {
        fontSize: 14,
        color: colors.neutral[600],
        lineHeight: 20,
        marginBottom: spacing.lg,
    },
    modalButton: {
        marginTop: spacing.md,
        borderRadius: borderRadius.md,
    }
});
