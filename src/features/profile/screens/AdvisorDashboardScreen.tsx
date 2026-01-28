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

type NavigationProp = NativeStackNavigationProp<ProfileStackParamList>;

export default function AdvisorDashboardScreen() {
    const navigation = useNavigation<NavigationProp>();
    const user = useAppSelector(state => state.auth.user);
    const chapterId = user?.chapterName || '';

    const chapterMembers = useQuery(api.users.getChapterMembers, {
        chapterId: chapterId,
    });

    const meetings = useQuery(api.meetings.getMeetings, {
        chapterId: chapterId,
    });

    const announcements = useQuery(api.news.getFilteredNews, {
        chapterId: chapterId,
    });

    if (!user || user.role !== 'adviser') {
        return (
            <View style={styles.container}>
                <View style={styles.errorContainer}>
                    <Ionicons name="lock-closed" size={48} color={colors.error.main} />
                    <Text style={styles.errorText}>Access Denied</Text>
                    <Text style={styles.errorSubtext}>Only advisors can access this page.</Text>
                </View>
            </View>
        );
    }

    const chapterAnnouncements = announcements?.filter(a => a.level === 'chapter') || [];
    const totalMembers = chapterMembers?.length || 0;
    const totalOfficers = chapterMembers?.filter(m => m.role === 'officer').length || 0;
    const totalMeetings = meetings?.length || 0;
    const upcomingMeetings = meetings?.filter(m => new Date(m.date) >= new Date()).length || 0;

    const quickActions = [
        {
            id: 'create-meeting',
            title: 'Schedule Meeting',
            icon: 'calendar',
            color: colors.primary[600],
            onPress: () => {
                // Navigate to calendar with add meeting modal
                navigation.getParent()?.navigate('Events');
            },
        },
        {
            id: 'create-announcement',
            title: 'Create Announcement',
            icon: 'megaphone-outline',
            color: colors.secondary[500],
            onPress: () => {
                navigation.getParent()?.navigate('Home');
            },
        },
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
                // Could navigate to detailed stats screen
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
                        <Text style={styles.chapterName}>{user.chapterName || 'Your Chapter'}</Text>
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
});
