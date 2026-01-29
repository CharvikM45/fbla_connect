// FBLA Connect - Advisor Dashboard Screen
import React from 'react';
import {
    View,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
} from 'react-native';
import { Text, Card, Avatar, ActivityIndicator } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useAppSelector } from '../../../shared/hooks/useRedux';
import { colors, spacing, borderRadius } from '../../../shared/theme';
import { useQuery } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ProfileStackParamList } from '../../../shared/navigation/types';
import AddAnnouncementModal from '../../news/components/AddAnnouncementModal';
import AddMeetingModal from '../../calendar/components/AddMeetingModal';
import { Portal, Modal, Button } from 'react-native-paper';

type NavigationProp = NativeStackNavigationProp<ProfileStackParamList>;

export default function AdvisorDashboardScreen() {
    const navigation = useNavigation<NavigationProp>();
    const user = useAppSelector(state => state.auth.user);
    const chapterId = user?.chapterName || '';

    const chapterMembers = useQuery(api.users.getChapterMembers);

    const meetings = useQuery(api.meetings.getMeetings, {
        chapterId: chapterId,
    });

    const announcements = useQuery(api.news.getFilteredNews, {
        chapterId: chapterId,
        stateId: user?.state || '',
    });

    const eventsStatus = useQuery(api.users.getChapterEventsStatus);

    const [showMeetingModal, setShowMeetingModal] = React.useState(false);
    const [showAnnouncementModal, setShowAnnouncementModal] = React.useState(false);
    const [showStatsModal, setShowStatsModal] = React.useState(false);

    const [socialLinks, setSocialLinks] = React.useState({
        instagram: '',
        facebook: '',
        groupme: '',
        twitter: '',
    });

    if (!user || (user.role !== 'adviser' && user.role !== 'officer')) {
        return (
            <View style={styles.container}>
                <View style={styles.errorContainer}>
                    <Ionicons name="lock-closed" size={48} color={colors.error.main} />
                    <Text style={styles.errorText}>Access Denied</Text>
                    <Text style={styles.errorSubtext}>Only advisors and officers can access this page.</Text>
                </View>
            </View>
        );
    }

    const chapterAnnouncements = announcements?.filter(a => (a as any).level === 'chapter') || [];
    const nationalStateNews = announcements?.filter(a => (a as any).level === 'national' || (a as any).level === 'state') || [];
    const totalMembers = chapterMembers?.length || 0;
    const totalOfficers = chapterMembers?.filter(m => (m as any).role === 'officer').length || 0;
    const totalMeetings = meetings?.length || 0;
    const upcomingMeetings = meetings?.filter(m => new Date((m as any).date) >= new Date()).length || 0;

    const quickActions = [
        {
            id: 'create-meeting',
            title: 'Schedule Meeting',
            icon: 'calendar',
            color: colors.primary[600],
            onPress: () => {
                setShowMeetingModal(true);
            },
        },
        ...(user.role === 'adviser' ? [{
            id: 'create-announcement',
            title: 'Create Announcement',
            icon: 'megaphone-outline',
            color: colors.secondary[500],
            onPress: () => {
                setShowAnnouncementModal(true);
            },
        }] : []),
        {
            id: 'manage-members',
            title: 'Manage Members',
            icon: 'people',
            color: '#10B981',
            onPress: () => navigation.navigate('ChapterManagement'),
        },
        {
            id: 'view-stats',
            title: 'Chapter Stats',
            icon: 'bar-chart-outline',
            color: '#8B5CF6',
            onPress: () => {
                setShowStatsModal(true);
            },
        },
    ];

    if (chapterMembers === undefined || meetings === undefined || announcements === undefined) {
        return (
            <View style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary[600]} />
                    <Text style={styles.loadingText}>Loading dashboard...</Text>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.greeting}>Welcome back,</Text>
                        <Text style={styles.name}>{user.displayName}</Text>
                        <Text style={styles.chapterName}>{user.role === 'adviser' ? 'Advisor' : 'Officer'} • {user.chapterName || 'Your Chapter'}</Text>
                    </View>
                    <Avatar.Text
                        size={64}
                        label={user.displayName?.charAt(0) || 'A'}
                        style={styles.avatar}
                    />
                </View>

                {/* Stats Cards */}
                <View style={styles.statsContainer}>
                    <Card style={styles.statCard}>
                        <Card.Content style={styles.statContent}>
                            <Ionicons name="people" size={24} color={colors.primary[600]} />
                            <Text style={styles.statValue}>{totalMembers}</Text>
                            <Text style={styles.statLabel}>Members</Text>
                        </Card.Content>
                    </Card>
                    <Card style={styles.statCard}>
                        <Card.Content style={styles.statContent}>
                            <Ionicons name="star" size={24} color={colors.secondary[500]} />
                            <Text style={styles.statValue}>{totalOfficers}</Text>
                            <Text style={styles.statLabel}>Officers</Text>
                        </Card.Content>
                    </Card>
                    <Card style={styles.statCard}>
                        <Card.Content style={styles.statContent}>
                            <Ionicons name="calendar" size={24} color="#10B981" />
                            <Text style={styles.statValue}>{upcomingMeetings}</Text>
                            <Text style={styles.statLabel}>Upcoming</Text>
                        </Card.Content>
                    </Card>
                    <Card style={styles.statCard}>
                        <Card.Content style={styles.statContent}>
                            <Ionicons name="megaphone-outline" size={24} color="#8B5CF6" />
                            <Text style={styles.statValue}>{chapterAnnouncements.length}</Text>
                            <Text style={styles.statLabel}>Announcements</Text>
                        </Card.Content>
                    </Card>
                </View>

                {/* Quick Actions */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Quick Actions</Text>
                    <View style={styles.actionsGrid}>
                        {quickActions.map((action) => (
                            <TouchableOpacity
                                key={action.id}
                                style={styles.actionCard}
                                onPress={action.onPress}
                                activeOpacity={0.7}
                            >
                                <View style={[styles.actionIconContainer, { backgroundColor: action.color + '15' }]}>
                                    <Ionicons name={action.icon as any} size={28} color={action.color} />
                                </View>
                                <Text style={styles.actionTitle}>{action.title}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Competitive Events Snapshot */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Competitive Events</Text>
                        <TouchableOpacity onPress={() => navigation.getParent()?.navigate('Resources')}>
                            <Text style={styles.seeAllText}>Manage</Text>
                        </TouchableOpacity>
                    </View>
                    {eventsStatus && eventsStatus.length > 0 ? (
                        <View style={styles.eventsGrid}>
                            {eventsStatus.slice(0, 4).map((event: any, index: number) => (
                                <View key={index} style={styles.eventMiniCard}>
                                    <View style={styles.eventCountBadge}>
                                        <Text style={styles.eventCountText}>{event.count}</Text>
                                    </View>
                                    <Text style={styles.eventMiniTitle} numberOfLines={1}>{event.title}</Text>
                                </View>
                            ))}
                        </View>
                    ) : (
                        <Card style={styles.emptyCardMini}>
                            <Card.Content style={styles.emptyContentMini}>
                                <Text style={styles.emptyTextMini}>No student registrations yet</Text>
                            </Card.Content>
                        </Card>
                    )}
                </View>

                {/* National & State Updates */}
                {nationalStateNews.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Organization Updates</Text>
                        {nationalStateNews.slice(0, 2).map((item: any, index: number) => (
                            <TouchableOpacity key={item._id} activeOpacity={0.8} style={styles.newsItem}>
                                <View style={[
                                    styles.newsLevelTag,
                                    { backgroundColor: item.level === 'national' ? colors.primary[100] : colors.secondary[100] }
                                ]}>
                                    <Text style={[
                                        styles.newsLevelText,
                                        { color: item.level === 'national' ? colors.primary[700] : colors.secondary[700] }
                                    ]}>
                                        {item.level.toUpperCase()}
                                    </Text>
                                </View>
                                <View style={styles.newsTextContent}>
                                    <Text style={styles.newsItemTitle} numberOfLines={1}>{item.title}</Text>
                                    <Text style={styles.newsItemDate}>
                                        {new Date(item.publishedAt).toLocaleDateString()}
                                    </Text>
                                </View>
                                <Ionicons name="chevron-forward" size={16} color={colors.neutral[400]} />
                            </TouchableOpacity>
                        ))}
                    </View>
                )}

                {/* Useful Resources */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Advisor Resources</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.resourcesRow}>
                        <ResourceLink icon="book-outline" label="Chapter Guide" color="#3B82F6" />
                        <ResourceLink icon="document-text-outline" label="CE Guidelines" color="#10B981" />
                        <ResourceLink icon="briefcase-outline" label="Career Path" color="#F59E0B" />
                        <ResourceLink icon="ribbon-outline" label="Awards" color="#EC4899" />
                    </ScrollView>
                </View>

                {/* Chapter Social Hub */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Chapter Social Hub</Text>
                        <Text style={styles.seeAllText}>Hub</Text>
                    </View>
                    <Card style={styles.socialCard}>
                        <Card.Content>
                            <Text style={styles.socialDesc}>Connect your chapter's social media to keep members engaged across platforms.</Text>
                            <View style={styles.socialGrid}>
                                <SocialItem
                                    icon="logo-instagram"
                                    name="Instagram"
                                    color="#E1306C"
                                    connected={!!socialLinks.instagram}
                                    onConnect={() => setSocialLinks({ ...socialLinks, instagram: '@fbla_chapter' })}
                                />
                                <SocialItem
                                    icon="logo-facebook"
                                    name="Facebook"
                                    color="#1877F2"
                                    connected={!!socialLinks.facebook}
                                    onConnect={() => setSocialLinks({ ...socialLinks, facebook: 'fbla_chapter' })}
                                />
                                <SocialItem
                                    icon="chatbubbles-outline"
                                    name="GroupMe"
                                    color="#00AFF0"
                                    connected={!!socialLinks.groupme}
                                    onConnect={() => setSocialLinks({ ...socialLinks, groupme: 'ChapterChat' })}
                                />
                                <SocialItem
                                    icon="logo-twitter"
                                    name="X / Twitter"
                                    color="#000000"
                                    connected={!!socialLinks.twitter}
                                    onConnect={() => setSocialLinks({ ...socialLinks, twitter: '@fbla_chapter' })}
                                />
                            </View>
                        </Card.Content>
                    </Card>
                </View>

                {/* Recent Activity */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Recent Activity</Text>
                        <TouchableOpacity onPress={() => navigation.getParent()?.navigate('Events')}>
                            <Text style={styles.seeAllText}>See All</Text>
                        </TouchableOpacity>
                    </View>

                    {upcomingMeetings === 0 && chapterAnnouncements.length === 0 ? (
                        <Card style={styles.emptyCard}>
                            <Card.Content style={styles.emptyContent}>
                                <Ionicons name="time-outline" size={48} color={colors.neutral[300]} />
                                <Text style={styles.emptyText}>No recent activity</Text>
                                <Text style={styles.emptySubtext}>
                                    Create a meeting or announcement to get started
                                </Text>
                            </Card.Content>
                        </Card>
                    ) : (
                        <>
                            {meetings && meetings.length > 0 && (
                                <Card style={styles.activityCard}>
                                    <Card.Content>
                                        <View style={styles.activityRow}>
                                            <View style={[styles.activityIcon, { backgroundColor: colors.primary[100] }]}>
                                                <Ionicons name="calendar" size={20} color={colors.primary[600]} />
                                            </View>
                                            <View style={styles.activityInfo}>
                                                <Text style={styles.activityTitle}>
                                                    {meetings[0].title}
                                                </Text>
                                                <Text style={styles.activitySubtext}>
                                                    {new Date(meetings[0].date).toLocaleDateString()} • {meetings[0].location}
                                                </Text>
                                            </View>
                                        </View>
                                    </Card.Content>
                                </Card>
                            )}

                            {chapterAnnouncements.length > 0 && (
                                <Card style={styles.activityCard}>
                                    <Card.Content>
                                        <View style={styles.activityRow}>
                                            <View style={[styles.activityIcon, { backgroundColor: colors.secondary[100] }]}>
                                                <Ionicons name="megaphone-outline" size={20} color={colors.secondary[500]} />
                                            </View>
                                            <View style={styles.activityInfo}>
                                                <Text style={styles.activityTitle}>
                                                    {chapterAnnouncements[0].title}
                                                </Text>
                                                <Text style={styles.activitySubtext}>
                                                    Published {new Date(chapterAnnouncements[0].publishedAt).toLocaleDateString()}
                                                </Text>
                                            </View>
                                        </View>
                                    </Card.Content>
                                </Card>
                            )}
                        </>
                    )}
                </View>

                <View style={{ height: 100 }} />
            </ScrollView>

            <AddMeetingModal
                visible={showMeetingModal}
                onDismiss={() => setShowMeetingModal(false)}
                onSuccess={() => setShowMeetingModal(false)}
            />

            <AddAnnouncementModal
                visible={showAnnouncementModal}
                onDismiss={() => setShowAnnouncementModal(false)}
                onSuccess={() => setShowAnnouncementModal(false)}
            />

            {/* Stats Modal */}
            <Portal>
                <Modal
                    visible={showStatsModal}
                    onDismiss={() => setShowStatsModal(false)}
                    contentContainerStyle={styles.statsModal}
                >
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Chapter Stats</Text>
                        <TouchableOpacity onPress={() => setShowStatsModal(false)}>
                            <Ionicons name="close" size={24} color={colors.neutral[500]} />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.statsList}>
                        <View style={styles.statDetailRow}>
                            <Text style={styles.statDetailLabel}>Total Members</Text>
                            <Text style={styles.statDetailValue}>{totalMembers}</Text>
                        </View>
                        <View style={styles.statDetailRow}>
                            <Text style={styles.statDetailLabel}>Chapter Officers</Text>
                            <Text style={styles.statDetailValue}>{totalOfficers}</Text>
                        </View>
                        <View style={styles.statDetailRow}>
                            <Text style={styles.statDetailLabel}>Scheduled Meetings</Text>
                            <Text style={styles.statDetailValue}>{totalMeetings}</Text>
                        </View>
                        <View style={styles.statDetailRow}>
                            <Text style={styles.statDetailLabel}>Active Announcements</Text>
                            <Text style={styles.statDetailValue}>{chapterAnnouncements.length}</Text>
                        </View>
                    </View>
                    <Button
                        mode="contained"
                        onPress={() => setShowStatsModal(false)}
                        style={styles.closeBtn}
                    >
                        Close
                    </Button>
                </Modal>
            </Portal>
        </View>
    );
}

function ResourceLink({ icon, label, color }: { icon: string, label: string, color: string }) {
    return (
        <TouchableOpacity style={styles.resourceCard}>
            <View style={[styles.resourceIcon, { backgroundColor: color + '15' }]}>
                <Ionicons name={icon as any} size={24} color={color} />
            </View>
            <Text style={styles.resourceLabel}>{label}</Text>
        </TouchableOpacity>
    );
}

function SocialItem({ icon, name, color, connected, onConnect }: { icon: string, name: string, color: string, connected: boolean, onConnect: () => void }) {
    return (
        <View style={styles.socialItem}>
            <View style={[styles.socialIconContainer, { backgroundColor: color + '15' }]}>
                <Ionicons name={icon as any} size={24} color={color} />
            </View>
            <View style={styles.socialInfo}>
                <Text style={styles.socialName}>{name}</Text>
                <Text style={styles.socialStatus}>{connected ? 'Connected' : 'Not Linked'}</Text>
            </View>
            <TouchableOpacity
                style={[styles.connectBtn, connected && styles.connectedBtn]}
                onPress={onConnect}
            >
                <Text style={[styles.connectBtnText, connected && styles.connectedBtnText]}>
                    {connected ? 'Manage' : 'Connect'}
                </Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.neutral[50],
    },
    scrollView: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: spacing.lg,
        backgroundColor: colors.primary[600],
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    greeting: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.8)',
        marginBottom: 4,
    },
    name: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 4,
    },
    chapterName: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.9)',
    },
    avatar: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    statsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        padding: spacing.md,
        gap: spacing.sm,
        marginTop: -spacing.xl,
    },
    statCard: {
        width: '47%',
        borderRadius: borderRadius.lg,
        backgroundColor: '#FFFFFF',
        elevation: 2,
    },
    statContent: {
        alignItems: 'center',
        padding: spacing.md,
    },
    statValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.neutral[900],
        marginTop: spacing.xs,
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        color: colors.neutral[600],
        fontWeight: '600',
    },
    section: {
        paddingHorizontal: spacing.md,
        marginTop: spacing.lg,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.neutral[900],
    },
    seeAllText: {
        fontSize: 14,
        color: colors.primary[600],
        fontWeight: '600',
    },
    actionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.md,
    },
    actionCard: {
        width: '47%',
        backgroundColor: '#FFFFFF',
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        alignItems: 'center',
        elevation: 1,
    },
    actionIconContainer: {
        width: 56,
        height: 56,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    actionTitle: {
        fontSize: 13,
        fontWeight: '600',
        color: colors.neutral[800],
        textAlign: 'center',
    },
    activityCard: {
        marginBottom: spacing.md,
        borderRadius: borderRadius.lg,
        backgroundColor: '#FFFFFF',
        elevation: 1,
    },
    activityRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    activityIcon: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.md,
    },
    activityInfo: {
        flex: 1,
    },
    activityTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: colors.neutral[900],
        marginBottom: 4,
    },
    activitySubtext: {
        fontSize: 13,
        color: colors.neutral[600],
    },
    emptyCard: {
        borderRadius: borderRadius.lg,
        backgroundColor: '#FFFFFF',
        elevation: 1,
    },
    emptyContent: {
        alignItems: 'center',
        paddingVertical: spacing.xl,
    },
    emptyText: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.neutral[400],
        marginTop: spacing.md,
    },
    emptySubtext: {
        fontSize: 13,
        color: colors.neutral[400],
        textAlign: 'center',
        marginTop: spacing.xs,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: spacing.md,
        fontSize: 14,
        color: colors.neutral[600],
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.xl,
    },
    errorText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.error.main,
        marginTop: spacing.md,
    },
    errorSubtext: {
        fontSize: 14,
        color: colors.neutral[600],
        textAlign: 'center',
        marginTop: spacing.xs,
    },
    statsModal: {
        backgroundColor: 'white',
        margin: 20,
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.lg,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.neutral[900],
    },
    statsList: {
        gap: spacing.md,
        marginBottom: spacing.xl,
    },
    statDetailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: colors.neutral[100],
    },
    statDetailLabel: {
        fontSize: 16,
        color: colors.neutral[600],
    },
    statDetailValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.primary[600],
    },
    closeBtn: {
        backgroundColor: colors.primary[600],
        borderRadius: borderRadius.md,
    },
    eventsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.sm,
    },
    eventMiniCard: {
        width: '48%',
        backgroundColor: '#FFFFFF',
        borderRadius: borderRadius.md,
        padding: spacing.sm,
        flexDirection: 'row',
        alignItems: 'center',
        elevation: 1,
    },
    eventCountBadge: {
        backgroundColor: colors.primary[100],
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.sm,
    },
    eventCountText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: colors.primary[700],
    },
    eventMiniTitle: {
        fontSize: 12,
        fontWeight: '600',
        color: colors.neutral[800],
        flex: 1,
    },
    emptyCardMini: {
        backgroundColor: 'rgba(255,255,255,0.5)',
        borderStyle: 'dashed',
        borderWidth: 1,
        borderColor: colors.neutral[200],
        elevation: 0,
    },
    emptyContentMini: {
        alignItems: 'center',
        paddingVertical: spacing.md,
    },
    emptyTextMini: {
        fontSize: 12,
        color: colors.neutral[400],
        fontStyle: 'italic',
    },
    newsItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        padding: spacing.md,
        borderRadius: borderRadius.md,
        marginBottom: spacing.sm,
        elevation: 1,
    },
    newsLevelTag: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
        marginRight: spacing.md,
    },
    newsLevelText: {
        fontSize: 10,
        fontWeight: 'bold',
    },
    newsTextContent: {
        flex: 1,
    },
    newsItemTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.neutral[900],
        marginBottom: 2,
    },
    newsItemDate: {
        fontSize: 11,
        color: colors.neutral[500],
    },
    resourcesRow: {
        paddingVertical: spacing.xs,
        gap: spacing.md,
    },
    resourceCard: {
        width: 100,
        alignItems: 'center',
    },
    resourceIcon: {
        width: 48,
        height: 48,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    resourceLabel: {
        fontSize: 12,
        color: colors.neutral[700],
        fontWeight: '500',
        textAlign: 'center',
    },
    socialCard: {
        borderRadius: borderRadius.lg,
        backgroundColor: '#FFFFFF',
        elevation: 1,
    },
    socialDesc: {
        fontSize: 13,
        color: colors.neutral[500],
        marginBottom: spacing.lg,
        lineHeight: 18,
    },
    socialGrid: {
        gap: spacing.md,
    },
    socialItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.xs,
    },
    socialIconContainer: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.md,
    },
    socialInfo: {
        flex: 1,
    },
    socialName: {
        fontSize: 15,
        fontWeight: 'bold',
        color: colors.neutral[800],
    },
    socialStatus: {
        fontSize: 12,
        color: colors.neutral[400],
    },
    connectBtn: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        backgroundColor: colors.primary[50],
    },
    connectBtnText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: colors.primary[600],
    },
    connectedBtn: {
        backgroundColor: colors.neutral[100],
    },
    connectedBtnText: {
        color: colors.neutral[600],
    },
});
