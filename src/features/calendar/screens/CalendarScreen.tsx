// FBLA Connect - Calendar Screen
import React, { useState, useEffect } from 'react';
import {
    View,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Dimensions,
} from 'react-native';
import { Text, Card, Chip, FAB, Portal, Modal, Button } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useAppSelector, useAppDispatch } from '../../../shared/hooks/useRedux';
import { setEvents, toggleRSVP, CalendarEvent, EventType, EventLevel } from '../calendarSlice';
import { colors, spacing, typography, borderRadius, shadows } from '../../../shared/theme';

const { width } = Dimensions.get('window');

// Demo events
const demoEvents: CalendarEvent[] = [
    {
        id: '1',
        title: 'Weekly Chapter Meeting',
        description: 'Regular chapter meeting with competition prep workshop',
        type: 'meeting',
        level: 'chapter',
        location: 'Room 204',
        startDate: new Date(Date.now() + 86400000 * 2).toISOString(),
        endDate: new Date(Date.now() + 86400000 * 2 + 3600000).toISOString(),
        allDay: false,
        reminderEnabled: true,
        isRSVPed: true,
        organizer: 'Lincoln FBLA',
        tags: ['Meeting', 'Competition Prep'],
    },
    {
        id: '2',
        title: 'District Leadership Conference',
        description: 'Compete in preliminary rounds at the district level',
        type: 'competition',
        level: 'district',
        location: 'Lincoln East High School',
        startDate: new Date(Date.now() + 86400000 * 14).toISOString(),
        endDate: new Date(Date.now() + 86400000 * 14 + 28800000).toISOString(),
        allDay: true,
        reminderEnabled: true,
        registrationDeadline: new Date(Date.now() + 86400000 * 7).toISOString(),
        isRSVPed: false,
        organizer: 'Nebraska FBLA',
        tags: ['Competition', 'DLC'],
    },
    {
        id: '3',
        title: 'State Leadership Conference',
        description: 'Annual state conference with competitions and networking',
        type: 'conference',
        level: 'state',
        location: 'Omaha Marriott Downtown',
        startDate: new Date(Date.now() + 86400000 * 45).toISOString(),
        endDate: new Date(Date.now() + 86400000 * 47).toISOString(),
        allDay: true,
        reminderEnabled: true,
        registrationDeadline: new Date(Date.now() + 86400000 * 30).toISOString(),
        registrationUrl: 'https://nebraskafbla.org/slc',
        isRSVPed: false,
        organizer: 'Nebraska FBLA',
        tags: ['SLC', 'Competition', 'Networking'],
    },
    {
        id: '4',
        title: 'Officer Application Deadline',
        description: 'Submit your application for chapter officer positions',
        type: 'deadline',
        level: 'chapter',
        startDate: new Date(Date.now() + 86400000 * 10).toISOString(),
        endDate: new Date(Date.now() + 86400000 * 10).toISOString(),
        allDay: true,
        reminderEnabled: true,
        isRSVPed: false,
        organizer: 'Lincoln FBLA',
        tags: ['Officer', 'Deadline'],
    },
];

export default function CalendarScreen() {
    const dispatch = useAppDispatch();
    const { events } = useAppSelector(state => state.calendar);
    const [selectedFilter, setSelectedFilter] = useState<EventType | 'all'>('all');
    const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
    const [showEventModal, setShowEventModal] = useState(false);

    useEffect(() => {
        dispatch(setEvents(demoEvents));
    }, []);

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
            competition: colors.secondary[600],
            conference: colors.info.main,
            deadline: colors.error.main,
            workshop: colors.success.main,
            social: colors.warning.main,
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

    return (
        <View style={styles.container}>
            {/* Filter Chips */}
            <View style={styles.filterContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={styles.filterRow}>
                        {(['all', 'meeting', 'competition', 'conference', 'deadline'] as const).map((filter) => (
                            <Chip
                                key={filter}
                                selected={selectedFilter === filter}
                                onPress={() => setSelectedFilter(filter)}
                                style={[
                                    styles.filterChip,
                                    selectedFilter === filter && styles.filterChipSelected,
                                ]}
                                textStyle={[
                                    styles.filterChipText,
                                    selectedFilter === filter && styles.filterChipTextSelected,
                                ]}
                            >
                                {filter === 'all' ? 'All Events' : filter.charAt(0).toUpperCase() + filter.slice(1)}
                            </Chip>
                        ))}
                    </View>
                </ScrollView>
            </View>

            {/* Events List */}
            <ScrollView style={styles.eventsList}>
                <Text style={styles.upcomingTitle}>Upcoming Events</Text>

                {filteredEvents.map((event) => (
                    <TouchableOpacity
                        key={event.id}
                        onPress={() => {
                            setSelectedEvent(event);
                            setShowEventModal(true);
                        }}
                    >
                        <Card style={styles.eventCard}>
                            <Card.Content style={styles.eventContent}>
                                <View
                                    style={[
                                        styles.eventTypeIndicator,
                                        { backgroundColor: getTypeColor(event.type) },
                                    ]}
                                />
                                <View style={styles.eventInfo}>
                                    <View style={styles.eventHeader}>
                                        <Chip
                                            style={[
                                                styles.levelChip,
                                                { backgroundColor: getTypeColor(event.type) + '20' },
                                            ]}
                                            textStyle={[
                                                styles.levelChipText,
                                                { color: getTypeColor(event.type) },
                                            ]}
                                        >
                                            {event.level.charAt(0).toUpperCase() + event.level.slice(1)}
                                        </Chip>
                                        {event.isRSVPed && (
                                            <View style={styles.rsvpBadge}>
                                                <Ionicons name="checkmark-circle" size={16} color={colors.success.main} />
                                                <Text style={styles.rsvpText}>RSVPed</Text>
                                            </View>
                                        )}
                                    </View>

                                    <Text style={styles.eventTitle}>{event.title}</Text>

                                    <View style={styles.eventDetails}>
                                        <View style={styles.eventDetail}>
                                            <Ionicons name="calendar-outline" size={14} color={colors.neutral[500]} />
                                            <Text style={styles.eventDetailText}>{formatDate(event.startDate)}</Text>
                                        </View>
                                        {!event.allDay && (
                                            <View style={styles.eventDetail}>
                                                <Ionicons name="time-outline" size={14} color={colors.neutral[500]} />
                                                <Text style={styles.eventDetailText}>{formatTime(event.startDate)}</Text>
                                            </View>
                                        )}
                                        {event.location && (
                                            <View style={styles.eventDetail}>
                                                <Ionicons name="location-outline" size={14} color={colors.neutral[500]} />
                                                <Text style={styles.eventDetailText}>{event.location}</Text>
                                            </View>
                                        )}
                                    </View>

                                    {event.registrationDeadline && new Date(event.registrationDeadline) > new Date() && (
                                        <View style={styles.deadlineWarning}>
                                            <Ionicons name="warning" size={14} color={colors.warning.dark} />
                                            <Text style={styles.deadlineText}>
                                                Register by {formatDate(event.registrationDeadline)}
                                            </Text>
                                        </View>
                                    )}
                                </View>

                                <View style={styles.eventIcon}>
                                    <View style={[styles.iconCircle, { backgroundColor: getTypeColor(event.type) + '20' }]}>
                                        <Ionicons
                                            name={getTypeIcon(event.type) as any}
                                            size={20}
                                            color={getTypeColor(event.type)}
                                        />
                                    </View>
                                </View>
                            </Card.Content>
                        </Card>
                    </TouchableOpacity>
                ))}

                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Event Detail Modal */}
            <Portal>
                <Modal
                    visible={showEventModal}
                    onDismiss={() => setShowEventModal(false)}
                    contentContainerStyle={styles.modal}
                >
                    {selectedEvent && (
                        <View>
                            <View style={styles.modalHeader}>
                                <View style={[styles.modalIcon, { backgroundColor: getTypeColor(selectedEvent.type) }]}>
                                    <Ionicons
                                        name={getTypeIcon(selectedEvent.type) as any}
                                        size={24}
                                        color="#FFFFFF"
                                    />
                                </View>
                                <Text style={styles.modalTitle}>{selectedEvent.title}</Text>
                            </View>

                            <Text style={styles.modalDescription}>{selectedEvent.description}</Text>

                            <View style={styles.modalDetails}>
                                <View style={styles.modalDetailRow}>
                                    <Ionicons name="calendar" size={18} color={colors.neutral[500]} />
                                    <Text style={styles.modalDetailText}>{formatDate(selectedEvent.startDate)}</Text>
                                </View>
                                {!selectedEvent.allDay && (
                                    <View style={styles.modalDetailRow}>
                                        <Ionicons name="time" size={18} color={colors.neutral[500]} />
                                        <Text style={styles.modalDetailText}>{formatTime(selectedEvent.startDate)}</Text>
                                    </View>
                                )}
                                {selectedEvent.location && (
                                    <View style={styles.modalDetailRow}>
                                        <Ionicons name="location" size={18} color={colors.neutral[500]} />
                                        <Text style={styles.modalDetailText}>{selectedEvent.location}</Text>
                                    </View>
                                )}
                            </View>

                            <View style={styles.modalActions}>
                                <Button
                                    mode={selectedEvent.isRSVPed ? 'outlined' : 'contained'}
                                    onPress={() => handleRSVP(selectedEvent.id)}
                                    style={styles.rsvpButton}
                                >
                                    {selectedEvent.isRSVPed ? 'Cancel RSVP' : 'RSVP'}
                                </Button>
                                <Button
                                    mode="outlined"
                                    onPress={() => setShowEventModal(false)}
                                >
                                    Close
                                </Button>
                            </View>
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
    filterContainer: {
        backgroundColor: '#FFFFFF',
        paddingVertical: spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: colors.neutral[100],
    },
    filterRow: {
        flexDirection: 'row',
        paddingHorizontal: spacing.md,
        gap: spacing.sm,
    },
    filterChip: {
        backgroundColor: colors.neutral[100],
    },
    filterChipSelected: {
        backgroundColor: colors.primary[600],
    },
    filterChipText: {
        color: colors.neutral[600],
    },
    filterChipTextSelected: {
        color: '#FFFFFF',
    },
    eventsList: {
        flex: 1,
        padding: spacing.md,
    },
    upcomingTitle: {
        fontSize: typography.fontSize.lg,
        fontWeight: '600',
        color: colors.neutral[800],
        marginBottom: spacing.md,
    },
    eventCard: {
        marginBottom: spacing.md,
        borderRadius: borderRadius.lg,
        backgroundColor: '#FFFFFF',
        overflow: 'hidden',
    },
    eventContent: {
        flexDirection: 'row',
        padding: 0,
    },
    eventTypeIndicator: {
        width: 4,
        alignSelf: 'stretch',
    },
    eventInfo: {
        flex: 1,
        padding: spacing.md,
    },
    eventHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    levelChip: {
        height: 24,
    },
    levelChipText: {
        fontSize: typography.fontSize.xs,
        fontWeight: '600',
    },
    rsvpBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: spacing.sm,
    },
    rsvpText: {
        fontSize: typography.fontSize.xs,
        color: colors.success.main,
        marginLeft: 4,
        fontWeight: '500',
    },
    eventTitle: {
        fontSize: typography.fontSize.md,
        fontWeight: '600',
        color: colors.neutral[900],
        marginBottom: spacing.sm,
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
        fontSize: typography.fontSize.sm,
        color: colors.neutral[500],
        marginLeft: 4,
    },
    deadlineWarning: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: spacing.sm,
        backgroundColor: colors.warning.light,
        padding: spacing.sm,
        borderRadius: borderRadius.sm,
    },
    deadlineText: {
        fontSize: typography.fontSize.xs,
        color: colors.warning.dark,
        marginLeft: 4,
        fontWeight: '500',
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
    modal: {
        backgroundColor: '#FFFFFF',
        margin: spacing.lg,
        borderRadius: borderRadius.xl,
        padding: spacing.lg,
    },
    modalHeader: {
        alignItems: 'center',
        marginBottom: spacing.lg,
    },
    modalIcon: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    modalTitle: {
        fontSize: typography.fontSize.xl,
        fontWeight: 'bold',
        color: colors.neutral[900],
        textAlign: 'center',
    },
    modalDescription: {
        fontSize: typography.fontSize.md,
        color: colors.neutral[600],
        lineHeight: 24,
        marginBottom: spacing.lg,
    },
    modalDetails: {
        marginBottom: spacing.lg,
    },
    modalDetailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    modalDetailText: {
        fontSize: typography.fontSize.md,
        color: colors.neutral[700],
        marginLeft: spacing.sm,
    },
    modalActions: {
        flexDirection: 'row',
        gap: spacing.md,
    },
    rsvpButton: {
        flex: 1,
    },
});
