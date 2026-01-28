// FBLA Connect - Calendar Screen
import React, { useState, useEffect } from 'react';
import {
    View,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Dimensions,
} from 'react-native';
import { Text, Card, Chip, Portal, Modal, Button, ActivityIndicator } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useAppSelector, useAppDispatch } from '../../../shared/hooks/useRedux';
import { setEvents, toggleRSVP, CalendarEvent, EventType, EventLevel } from '../calendarSlice';
import { colors, spacing, typography, borderRadius, shadows } from '../../../shared/theme';
import { MotiView } from 'moti';
import AddMeetingModal from '../components/AddMeetingModal';

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";

const { width } = Dimensions.get('window');

export default function CalendarScreen() {
    const dispatch = useAppDispatch();
    const user = useAppSelector(state => state.auth.user);
    const [selectedFilter, setSelectedFilter] = useState<EventType | 'all'>('all');
    const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
    const [showEventModal, setShowEventModal] = useState(false);
    const [showAddMeetingModal, setShowAddMeetingModal] = useState(false);

    // Convex Queries
    const liveConferences = useQuery(api.conferences.getConferences, {
        stateId: user?.state || "NE" // Default to NE for Nebraska focus
    });

    const liveMeetings = useQuery(api.meetings.getMeetings, {
        chapterId: user?.chapterName || "lincoln-high" // Fallback for demo
    });

    const events = React.useMemo((): CalendarEvent[] => {
        // Use live data if available, otherwise empty
        const sourceConferences = (liveConferences && liveConferences.length > 0)
            ? liveConferences
            : [];

        const confMapped: CalendarEvent[] = sourceConferences.map((conf: any) => ({
            id: conf._id || conf.id,
            title: conf.name,
            description: `${conf.level} level ${conf.type} conference.`,
            type: 'conference',
            level: conf.level.toLowerCase() as EventLevel,
            location: conf.location,
            startDate: new Date(conf.date).toISOString(),
            endDate: new Date(conf.endDate || conf.date).toISOString(),
            allDay: true,
            reminderEnabled: true,
            isRSVPed: false,
            organizer: conf.level === 'National' ? 'FBLA National' : `${conf.stateId || 'State'} FBLA`,
            tags: [conf.type, conf.level],
        }));

        const meetingMapped: CalendarEvent[] = (liveMeetings || []).map((meeting: any) => ({
            id: meeting._id,
            title: meeting.title,
            description: meeting.description,
            type: 'meeting',
            level: 'chapter',
            location: meeting.location,
            startDate: meeting.date,
            endDate: new Date(new Date(meeting.date).getTime() + 3600000).toISOString(),
            allDay: false,
            reminderEnabled: true,
            isRSVPed: false,
            organizer: `${user?.chapterName || 'Your'} Chapter`,
            tags: ['Chapter', meeting.type],
        }));

        return [...meetingMapped, ...confMapped].sort((a, b) =>
            new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
        );
    }, [liveConferences, liveMeetings, user?.chapterName, user?.state]);

    useEffect(() => {
        if (events.length > 0) {
            dispatch(setEvents(events));
        }
    }, [events]);

    const filteredEvents = selectedFilter === 'all'
        ? events
        : events.filter(e => e.type === selectedFilter);

    const handleRSVP = (eventId: string) => {
        dispatch(toggleRSVP(eventId));
    };

    const getTypeIcon = (type: EventType) => {
        const icons: Record<EventType, string> = {
            meeting: 'people',
            competition: 'trophy',
            conference: 'business',
            deadline: 'alarm',
            workshop: 'school',
            social: 'happy',
            service: 'heart',
            other: 'ellipsis-horizontal',
        };
        return icons[type] || 'calendar';
    };

    const getTypeColor = (type: EventType) => {
        const colorsMap: Record<EventType, string> = {
            meeting: colors.primary[600],
            competition: colors.secondary[500],
            conference: '#8B5CF6',
            deadline: '#EF4444',
            workshop: '#10B981',
            social: '#F472B6',
            service: '#E91E63',
            other: colors.neutral[500],
        };
        return colorsMap[type] || colors.neutral[500];
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    };

    const isAdvisor = user?.role === 'officer' || user?.role === 'adviser';

    return (
        <View style={styles.container}>
            {/* Header / Tabs */}
            <View style={styles.filterContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={styles.filterRow}>
                        {(['all', 'meeting', 'conference', 'competition'] as const).map((filter) => (
                            <TouchableOpacity
                                key={filter}
                                onPress={() => setSelectedFilter(filter)}
                            >
                                <View
                                    style={[
                                        styles.filterChip,
                                        selectedFilter === filter ? styles.filterChipSelected : styles.filterChipUnselected,
                                    ]}
                                >
                                    <Text style={[
                                        styles.filterChipText,
                                        selectedFilter === filter && styles.filterChipTextSelected,
                                    ]}>
                                        {filter === 'all' ? 'All Events' : filter === 'conference' ? 'Conferences' : filter.charAt(0).toUpperCase() + filter.slice(1)}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                </ScrollView>
            </View>

            {/* Events List */}
            <ScrollView style={styles.eventsList} showsVerticalScrollIndicator={false}>
                {events.length === 0 ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator color={colors.primary[600]} />
                    </View>
                ) : (
                    <>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.upcomingTitle}>
                                {selectedFilter === 'meeting' ? 'Chapter Meetings' :
                                    selectedFilter === 'conference' ? 'FBLA Conferences' :
                                        'Your Schedule'}
                            </Text>
                            {isAdvisor && selectedFilter === 'meeting' && (
                                <TouchableOpacity
                                    style={styles.addMeetingBtn}
                                    onPress={() => setShowAddMeetingModal(true)}
                                >
                                    <Ionicons name="add" size={18} color={colors.primary[600]} />
                                    <Text style={styles.addMeetingText}>Add Meeting</Text>
                                </TouchableOpacity>
                            )}
                        </View>

                        {filteredEvents.length === 0 ? (
                            <View style={styles.emptyState}>
                                <Ionicons name="calendar-clear-outline" size={64} color={colors.neutral[200]} />
                                <Text style={styles.emptyStateTitle}>
                                    {selectedFilter === 'meeting' ? "No meetings scheduled" : "Nothing scheduled here"}
                                </Text>
                                <Text style={styles.emptyStateDesc}>
                                    {selectedFilter === 'meeting'
                                        ? "No meetings have been added by your advisor yet."
                                        : "Check back later for updates from FBLA National and Nebraska."}
                                </Text>
                            </View>
                        ) : (
                            filteredEvents.map((event, index) => (
                                <MotiView
                                    key={event.id}
                                    from={{ opacity: 0, translateY: 20 }}
                                    animate={{ opacity: 1, translateY: 0 }}
                                    transition={{ delay: index * 50 }}
                                >
                                    <TouchableOpacity
                                        onPress={() => {
                                            setSelectedEvent(event);
                                            setShowEventModal(true);
                                        }}
                                    >
                                        <Card style={styles.eventCard}>
                                            <View style={styles.eventContent}>
                                                <View
                                                    style={[
                                                        styles.eventTypeIndicator,
                                                        { backgroundColor: getTypeColor(event.type) },
                                                    ]}
                                                />
                                                <View style={styles.eventInfo}>
                                                    <View style={styles.eventHeader}>
                                                        <View style={[styles.levelBadge, { backgroundColor: getTypeColor(event.type) + '15' }]}>
                                                            <Text style={[styles.levelText, { color: getTypeColor(event.type) }]}>
                                                                {event.level.toUpperCase()}
                                                            </Text>
                                                        </View>
                                                        {event.isRSVPed && (
                                                            <View style={styles.rsvpBadge}>
                                                                <Ionicons name="checkmark-circle" size={14} color={colors.secondary[500]} />
                                                                <Text style={styles.rsvpText}>Going</Text>
                                                            </View>
                                                        )}
                                                    </View>

                                                    <Text style={styles.eventTitle}>{event.title}</Text>

                                                    <View style={styles.eventDetails}>
                                                        <View style={styles.eventDetail}>
                                                            <Ionicons name="calendar-outline" size={14} color={colors.neutral[400]} />
                                                            <Text style={styles.eventDetailText}>{formatDate(event.startDate)}</Text>
                                                        </View>
                                                        {!event.allDay && (
                                                            <View style={styles.eventDetail}>
                                                                <Ionicons name="time-outline" size={14} color={colors.neutral[400]} />
                                                                <Text style={styles.eventDetailText}>{formatTime(event.startDate)}</Text>
                                                            </View>
                                                        )}
                                                    </View>
                                                </View>

                                                <View style={styles.eventIcon}>
                                                    <View style={[styles.iconCircle, { backgroundColor: getTypeColor(event.type) + '10' }]}>
                                                        <Ionicons
                                                            name={getTypeIcon(event.type) as any}
                                                            size={20}
                                                            color={getTypeColor(event.type)}
                                                        />
                                                    </View>
                                                </View>
                                            </View>
                                        </Card>
                                    </TouchableOpacity>
                                </MotiView>
                            ))
                        )}
                    </>
                )}
                <View style={{ height: 120 }} />
            </ScrollView>

            {/* Event Detail Modal */}
            <Portal>
                <Modal
                    visible={showEventModal}
                    onDismiss={() => setShowEventModal(false)}
                    contentContainerStyle={styles.modalContainer}
                >
                    {selectedEvent && (
                        <Card style={styles.modalContent}>
                            <View style={styles.modalHeader}>
                                <View style={[styles.modalIcon, { backgroundColor: getTypeColor(selectedEvent.type) }]}>
                                    <Ionicons
                                        name={getTypeIcon(selectedEvent.type) as any}
                                        size={32}
                                        color="#FFFFFF"
                                    />
                                </View>
                                <Text style={styles.modalTitle}>{selectedEvent.title}</Text>
                                <View style={[styles.levelBadge, { backgroundColor: getTypeColor(selectedEvent.type) + '15', alignSelf: 'center' }]}>
                                    <Text style={[styles.levelText, { color: getTypeColor(selectedEvent.type) }]}>
                                        {selectedEvent.level.toUpperCase()}
                                    </Text>
                                </View>
                            </View>

                            <Text style={styles.modalDescription}>{selectedEvent.description}</Text>

                            <View style={styles.modalDetails}>
                                <View style={styles.modalDetailRow}>
                                    <Ionicons name="calendar" size={18} color={colors.primary[600]} />
                                    <Text style={styles.modalDetailText}>{formatDate(selectedEvent.startDate)}</Text>
                                </View>
                                {!selectedEvent.allDay && (
                                    <View style={styles.modalDetailRow}>
                                        <Ionicons name="time" size={18} color={colors.primary[600]} />
                                        <Text style={styles.modalDetailText}>{formatTime(selectedEvent.startDate)}</Text>
                                    </View>
                                ) || <View style={styles.modalDetailRow}><Ionicons name="time" size={18} color={colors.primary[600]} /><Text style={styles.modalDetailText}>All Day</Text></View>}
                                {selectedEvent.location && (
                                    <View style={styles.modalDetailRow}>
                                        <Ionicons name="location" size={18} color={colors.primary[600]} />
                                        <Text style={styles.modalDetailText}>{selectedEvent.location}</Text>
                                    </View>
                                )}
                            </View>

                            <View style={styles.modalActions}>
                                <TouchableOpacity
                                    style={[styles.rsvpButton, { backgroundColor: selectedEvent.isRSVPed ? colors.neutral[100] : colors.primary[600] }]}
                                    onPress={() => handleRSVP(selectedEvent.id)}
                                >
                                    <Text style={[styles.rsvpButtonText, { color: selectedEvent.isRSVPed ? colors.neutral[700] : '#FFFFFF' }]}>
                                        {selectedEvent.isRSVPed ? 'Cancel RSVP' : 'RSVP Now'}
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.closeButton}
                                    onPress={() => setShowEventModal(false)}
                                >
                                    <Text style={styles.closeButtonText}>Close</Text>
                                </TouchableOpacity>
                            </View>
                        </Card>
                    )}
                </Modal>
            </Portal>

            {/* Advisor Add Meeting Modal */}
            <AddMeetingModal
                visible={showAddMeetingModal}
                onDismiss={() => setShowAddMeetingModal(false)}
                onSuccess={() => {
                    // Refetch handled automatically by Convex
                    setShowAddMeetingModal(false);
                }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.neutral[50],
    },
    filterContainer: {
        paddingVertical: spacing.md,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: colors.neutral[100],
    },
    filterRow: {
        flexDirection: 'row',
        paddingHorizontal: spacing.md,
        gap: spacing.sm,
    },
    filterChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    filterChipUnselected: {
        backgroundColor: colors.neutral[50],
    },
    filterChipSelected: {
        backgroundColor: colors.primary[600],
        elevation: 2,
    },
    filterChipText: {
        color: colors.neutral[600],
        fontWeight: '700',
        fontSize: 13,
    },
    filterChipTextSelected: {
        color: '#FFFFFF',
    },
    eventsList: {
        flex: 1,
        padding: spacing.md,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.lg,
    },
    upcomingTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.neutral[900],
        letterSpacing: -0.5,
    },
    addMeetingBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.primary[50],
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 10,
        gap: 4,
    },
    addMeetingText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: colors.primary[600],
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 100,
    },
    eventCard: {
        marginBottom: spacing.md,
        borderRadius: 20,
        backgroundColor: '#FFFFFF',
        elevation: 2,
        overflow: 'hidden',
    },
    eventContent: {
        flexDirection: 'row',
    },
    eventTypeIndicator: {
        width: 6,
        alignSelf: 'stretch',
    },
    eventInfo: {
        flex: 1,
        padding: spacing.md,
    },
    eventHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    levelBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
    },
    levelText: {
        fontSize: 10,
        fontWeight: 'bold',
    },
    rsvpBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: spacing.sm,
    },
    rsvpText: {
        fontSize: 10,
        color: colors.secondary[600],
        marginLeft: 4,
        fontWeight: 'bold',
    },
    eventTitle: {
        fontSize: 17,
        fontWeight: 'bold',
        color: colors.neutral[900],
        marginBottom: 8,
    },
    eventDetails: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.md,
    },
    eventDetail: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    eventDetailText: {
        fontSize: 12,
        color: colors.neutral[500],
        marginLeft: 4,
    },
    eventIcon: {
        padding: spacing.md,
        justifyContent: 'center',
    },
    iconCircle: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
        paddingHorizontal: spacing.xl,
    },
    emptyStateTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.neutral[400],
        marginTop: spacing.md,
    },
    emptyStateDesc: {
        fontSize: 14,
        color: colors.neutral[400],
        textAlign: 'center',
        marginTop: 8,
        lineHeight: 20,
    },
    modalContainer: {
        margin: 20,
    },
    modalContent: {
        borderRadius: 30,
        padding: spacing.xl,
        backgroundColor: '#FFFFFF',
    },
    modalHeader: {
        alignItems: 'center',
        marginBottom: spacing.xl,
    },
    modalIcon: {
        width: 70,
        height: 70,
        borderRadius: 35,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.md,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: colors.neutral[900],
        textAlign: 'center',
        marginBottom: 8,
    },
    modalDescription: {
        fontSize: 15,
        color: colors.neutral[600],
        lineHeight: 22,
        marginBottom: spacing.xl,
        textAlign: 'center',
    },
    modalDetails: {
        marginBottom: spacing.xl,
    },
    modalDetailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.md,
        backgroundColor: colors.neutral[50],
        padding: spacing.md,
        borderRadius: 15,
    },
    modalDetailText: {
        fontSize: 15,
        color: colors.neutral[800],
        marginLeft: spacing.md,
        fontWeight: '600',
    },
    modalActions: {
        gap: spacing.md,
    },
    rsvpButton: {
        height: 54,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 2,
    },
    rsvpButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    closeButton: {
        height: 54,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    closeButtonText: {
        fontSize: 16,
        color: colors.neutral[500],
        fontWeight: '600',
    },
});
