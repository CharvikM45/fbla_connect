import React, { useState, useMemo } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, FlatList, Dimensions, Linking } from 'react-native';
import { Text, Searchbar, IconButton, Portal, Modal, List, Card, ActivityIndicator } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius, shadows } from '../../../shared/theme';
import InAppBrowserModal from '../../../shared/components/InAppBrowserModal';
import { MotiView } from 'moti';

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";

interface StudyLink {
    title: string;
    url: string;
}

interface CompetitiveEvent {
    id: string;
    title: string;
    category: string;
    division: string;
    description?: string;
    linkUrl?: string;
    pdfUrl?: string;
    competitionTypes?: string[];
    requirements?: string;
    studyLinks?: StudyLink[];
}

export default function CompetitiveEventsScreen() {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string | 'All'>('All');
    const [selectedEvent, setSelectedEvent] = useState<CompetitiveEvent | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [browserUrl, setBrowserUrl] = useState<string | null>(null);

    // Convex Query
    const liveEvents = useQuery(api.competitive_events.getEvents, {
        category: selectedCategory === 'All' ? undefined : selectedCategory,
        search: searchQuery || undefined
    });

    const categories = useMemo(() => {
        // We could fetch these from Convex too, but for speed we'll hardcode common ones
        return ['All', 'Objective Test', 'Presentation', 'Production', 'Role Play', 'Interview'];
    }, []);

    const filteredEvents = useMemo((): CompetitiveEvent[] => {
        const sourceEvents = (liveEvents && liveEvents.length > 0) ? liveEvents : [];

        // Filter by category and search
        let filtered = sourceEvents.map((e: any) => ({
            id: e._id || e.id,
            title: e.title,
            category: e.category,
            division: e.division,
            description: e.description,
            linkUrl: e.linkUrl || 'https://www.fbla.org/competitive-events/',
            pdfUrl: e.pdfUrl,
            competitionTypes: e.competitionTypes,
            requirements: e.requirements,
            studyLinks: e.studyLinks
        }));

        if (selectedCategory !== 'All') {
            filtered = filtered.filter(e => e.category === selectedCategory);
        }

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(e =>
                e.title.toLowerCase().includes(query) ||
                (e.description && e.description.toLowerCase().includes(query))
            );
        }

        return filtered;
    }, [liveEvents, selectedCategory, searchQuery]);

    const handleOpenLink = (url?: string) => {
        if (url) {
            setBrowserUrl(url);
        }
    };

    return (
        <View style={styles.container}>

            {/* We need to restructure the return to allow the Modal to be at the top level */}
            {/* But since we just need the Portal for the Browser Modal, we can add it here */}
            <InAppBrowserModal
                visible={!!browserUrl}
                url={browserUrl}
                onClose={() => setBrowserUrl(null)}
                title="Event Resource"
            />

            {/* Header */}
            <View style={styles.header}>
                <View style={styles.searchWrapper}>
                    <Searchbar
                        placeholder="Search 70+ events..."
                        onChangeText={setSearchQuery}
                        value={searchQuery}
                        style={styles.searchbar}
                        inputStyle={styles.searchInput}
                        iconColor={colors.primary[600]}
                        placeholderTextColor={colors.neutral[400]}
                    />
                </View>
            </View>

            {/* Category selection */}
            <View style={styles.filterContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
                    {categories.map(cat => (
                        <TouchableOpacity
                            key={cat}
                            onPress={() => setSelectedCategory(cat)}
                        >
                            <View
                                style={[
                                    styles.chip,
                                    selectedCategory === cat ? styles.chipSelected : styles.chipUnselected
                                ]}
                            >
                                <Text style={[styles.chipText, selectedCategory === cat && styles.chipTextSelected]}>
                                    {cat}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* Event List */}
            <FlatList
                data={filteredEvents}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                renderItem={({ item, index }) => (
                    <MotiView
                        from={{ opacity: 0, translateY: 20 }}
                        animate={{ opacity: 1, translateY: 0 }}
                        transition={{ delay: index * 50 }}
                    >
                        <TouchableOpacity onPress={() => { setSelectedEvent(item); setShowModal(true); }} activeOpacity={0.7}>
                            <Card style={styles.eventCard}>
                                <Card.Content style={styles.cardContent}>
                                    <View style={styles.cardHeader}>
                                        <View style={styles.eventIcon}>
                                            <Ionicons name="trophy" size={20} color={colors.secondary[500]} />
                                        </View>
                                        <View style={styles.eventInfo}>
                                            <Text style={styles.eventTitle}>{item.title}</Text>
                                            <Text style={styles.eventCategory}>{item.category} • {item.division}</Text>
                                        </View>
                                        <Ionicons name="chevron-forward" size={20} color={colors.neutral[300]} />
                                    </View>
                                </Card.Content>
                            </Card>
                        </TouchableOpacity>
                    </MotiView>
                )}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        {/* Only show loading if we don't have fallback events yet, which shouldn't happen with our logic */}
                        <ActivityIndicator color={colors.primary[600]} />
                        <Text style={styles.emptyText}>Loading competitive events...</Text>
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
                        <Card style={styles.modalContent}>
                            <ScrollView style={{ maxHeight: Dimensions.get('window').height * 0.8 }} showsVerticalScrollIndicator={false}>
                                <View style={styles.modalHeader}>
                                    <TouchableOpacity style={styles.closeIcon} onPress={() => setShowModal(false)}>
                                        <Ionicons name="close" size={24} color={colors.neutral[400]} />
                                    </TouchableOpacity>
                                    <View style={styles.modalIconContainer}>
                                        <Ionicons name="ribbon" size={40} color={colors.secondary[500]} />
                                    </View>
                                    <Text style={styles.modalTitle}>{selectedEvent.title}</Text>
                                    <View style={styles.modalMeta}>
                                        <View style={styles.modalChip}>
                                            <Text style={styles.modalChipText}>{selectedEvent.category}</Text>
                                        </View>
                                        <View style={styles.modalChip}>
                                            <Text style={styles.modalChipText}>{selectedEvent.division}</Text>
                                        </View>
                                    </View>
                                </View>

                                <View style={styles.modalBody}>
                                    {/* Overview Section */}
                                    <View style={styles.section}>
                                        <Text style={styles.sectionTitle}>Overview</Text>
                                        <Text style={styles.sectionText}>
                                            {selectedEvent.description || "Refer to the official FBLA Competitive Events guidelines for detailed requirements and scoring rubrics for this event."}
                                        </Text>
                                    </View>

                                    {/* Requirements Section */}
                                    {selectedEvent.requirements && (
                                        <View style={styles.section}>
                                            <Text style={styles.sectionTitle}>Key Requirements</Text>
                                            <View style={styles.reqCard}>
                                                <Ionicons name="information-circle" size={20} color={colors.primary[600]} style={{ marginRight: 10 }} />
                                                <Text style={styles.reqText}>{selectedEvent.requirements}</Text>
                                            </View>
                                        </View>
                                    )}

                                    {/* Rubrics & Guidelines Section */}
                                    <View style={styles.section}>
                                        <Text style={styles.sectionTitle}>Official Rubrics & Tools</Text>
                                        <TouchableOpacity
                                            style={styles.resourceAction}
                                            onPress={() => handleOpenLink(selectedEvent.pdfUrl || 'https://www.fbla.org/wp-content/uploads/2024/08/2025-2026-Competitive-Events-Guidelines.pdf')}
                                        >
                                            <View style={styles.resourceActionIcon}>
                                                <Ionicons name="document-text" size={22} color={colors.error.main} />
                                            </View>
                                            <View style={{ flex: 1 }}>
                                                <Text style={styles.resourceActionTitle}>View Rubrics (PDF)</Text>
                                                <Text style={styles.resourceActionDesc}>Standard national evaluation criteria</Text>
                                            </View>
                                            <Ionicons name="chevron-forward" size={18} color={colors.neutral[300]} />
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            style={styles.resourceAction}
                                            onPress={() => handleOpenLink(selectedEvent.linkUrl)}
                                        >
                                            <View style={styles.resourceActionIcon}>
                                                <Ionicons name="flash" size={22} color={colors.secondary[500]} />
                                            </View>
                                            <View style={{ flex: 1 }}>
                                                <Text style={styles.resourceActionTitle}>Event Summary</Text>
                                                <Text style={styles.resourceActionDesc}>Live updates and national portal</Text>
                                            </View>
                                            <Ionicons name="open-outline" size={18} color={colors.neutral[300]} />
                                        </TouchableOpacity>
                                    </View>

                                    {/* Study Resources Section */}
                                    <View style={styles.section}>
                                        <Text style={styles.sectionTitle}>Study Resources</Text>
                                        {selectedEvent.studyLinks && selectedEvent.studyLinks.length > 0 ? (
                                            selectedEvent.studyLinks.map((link, idx) => (
                                                <TouchableOpacity
                                                    key={idx}
                                                    style={styles.studyLink}
                                                    onPress={() => handleOpenLink(link.url)}
                                                >
                                                    <View style={styles.studyLinkIcon}>
                                                        <Ionicons name="school" size={18} color={colors.primary[600]} />
                                                    </View>
                                                    <Text style={styles.studyLinkText}>{link.title}</Text>
                                                    <Ionicons name="arrow-forward" size={14} color={colors.primary[600]} />
                                                </TouchableOpacity>
                                            ))
                                        ) : (
                                            <Text style={styles.noStudyText}>Check the Resources tab for general study guides and sample tests.</Text>
                                        )}
                                    </View>
                                </View>
                            </ScrollView>

                            <View style={styles.modalFooter}>
                                <TouchableOpacity
                                    style={styles.modalActionBtn}
                                    onPress={() => setShowModal(false)}
                                >
                                    <Text style={styles.modalActionBtnText}>Got it!</Text>
                                </TouchableOpacity>
                            </View>
                        </Card>
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
    },
    searchWrapper: {
        borderRadius: 20,
        backgroundColor: '#FFFFFF',
        elevation: 6,
        shadowColor: colors.primary[600],
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
    },
    searchbar: {
        elevation: 0,
        backgroundColor: 'transparent',
    },
    searchInput: {
        fontSize: 15,
        color: colors.neutral[900],
        fontWeight: '500',
    },
    filterContainer: {
        paddingBottom: spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: colors.neutral[100],
    },
    filterRow: {
        paddingHorizontal: spacing.md,
        gap: spacing.sm,
    },
    chip: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
    },
    chipUnselected: {
        backgroundColor: '#FFFFFF',
        elevation: 2,
    },
    chipSelected: {
        backgroundColor: colors.primary[600],
        elevation: 4,
    },
    chipText: {
        color: colors.neutral[600],
        fontSize: 13,
        fontWeight: 'bold',
    },
    chipTextSelected: {
        color: '#FFFFFF',
    },
    listContent: {
        padding: spacing.md,
        paddingBottom: 120,
    },
    eventCard: {
        marginBottom: spacing.sm,
        borderRadius: 20,
        backgroundColor: '#FFFFFF',
        elevation: 2,
        borderWidth: 1,
        borderColor: colors.neutral[100],
    },
    cardContent: {
        paddingVertical: spacing.md,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    eventIcon: {
        width: 44,
        height: 44,
        borderRadius: 14,
        backgroundColor: colors.secondary[50],
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.md,
    },
    eventInfo: {
        flex: 1,
    },
    eventTitle: {
        fontSize: 16,
        fontWeight: '900',
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
        fontSize: 14,
    },
    modal: {
        margin: 20,
    },
    modalContent: {
        borderRadius: 30,
        overflow: 'hidden',
        backgroundColor: '#FFFFFF',
    },
    modalHeader: {
        alignItems: 'center',
        padding: spacing.xl,
        backgroundColor: colors.neutral[50],
    },
    closeIcon: {
        position: 'absolute',
        top: 20,
        right: 20,
        zIndex: 1,
    },
    modalIconContainer: {
        width: 80,
        height: 80,
        borderRadius: 24,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.md,
        elevation: 4,
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: '900',
        color: colors.neutral[900],
        textAlign: 'center',
        marginBottom: 12,
    },
    modalMeta: {
        flexDirection: 'row',
        gap: spacing.sm,
    },
    modalChip: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        backgroundColor: colors.primary[50],
    },
    modalChipText: {
        fontSize: 11,
        color: colors.primary[700],
        fontWeight: 'bold',
    },
    modalBody: {
        padding: spacing.xl,
    },
    section: {
        marginBottom: spacing.xl,
    },
    sectionTitle: {
        fontSize: 13,
        fontWeight: '900',
        color: colors.neutral[400],
        textTransform: 'uppercase',
        letterSpacing: 1.5,
        marginBottom: spacing.md,
    },
    sectionText: {
        fontSize: 15,
        color: colors.neutral[700],
        lineHeight: 24,
    },
    reqCard: {
        flexDirection: 'row',
        backgroundColor: colors.primary[50],
        padding: spacing.md,
        borderRadius: 15,
        alignItems: 'center',
    },
    reqText: {
        flex: 1,
        fontSize: 14,
        color: colors.primary[800],
        lineHeight: 20,
        fontWeight: '500',
    },
    resourceAction: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        padding: spacing.md,
        borderRadius: 16,
        marginBottom: spacing.sm,
        borderWidth: 1,
        borderColor: colors.neutral[100],
        elevation: 2,
    },
    resourceActionIcon: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: colors.neutral[50],
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.md,
    },
    resourceActionTitle: {
        fontSize: 15,
        fontWeight: 'bold',
        color: colors.neutral[900],
    },
    resourceActionDesc: {
        fontSize: 11,
        color: colors.neutral[500],
        marginTop: 2,
    },
    studyLink: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: colors.neutral[100],
    },
    studyLinkIcon: {
        marginRight: 12,
    },
    studyLinkText: {
        flex: 1,
        fontSize: 14,
        color: colors.primary[600],
        fontWeight: '600',
    },
    noStudyText: {
        fontSize: 14,
        color: colors.neutral[400],
        fontStyle: 'italic',
    },
    modalFooter: {
        padding: spacing.lg,
        borderTopWidth: 1,
        borderTopColor: colors.neutral[50],
    },
    modalActionBtn: {
        height: 56,
        backgroundColor: colors.primary[600],
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 8,
        shadowColor: colors.primary[600],
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
    },
    modalActionBtnText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
});
