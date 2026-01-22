// FBLA Connect - Home Screen (News Feed)
import React, { useEffect, useState } from 'react';
import {
    View,
    StyleSheet,
    ScrollView,
    RefreshControl,
    TouchableOpacity,
    Dimensions,
} from 'react-native';
import { Text, Card, Chip, Avatar, Badge, FAB } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAppSelector, useAppDispatch } from '../../../shared/hooks/useRedux';
import { setNews, markAsRead, NewsItem } from '../newsSlice';
import { colors, spacing, typography, borderRadius, shadows } from '../../../shared/theme';

const { width } = Dimensions.get('window');

// Demo news data
const demoNews: NewsItem[] = [
    {
        id: '1',
        title: 'State Leadership Conference Registration Now Open!',
        content: 'Register now for the 2026 State Leadership Conference...',
        summary: 'Early bird registration ends February 15. Don\'t miss your chance to compete!',
        level: 'state',
        category: 'deadline',
        authorId: 'admin',
        authorName: 'Nebraska FBLA',
        authorRole: 'State Association',
        publishedAt: new Date().toISOString(),
        isPinned: true,
        priority: 'high',
        tags: ['SLC', 'Registration', 'Competition'],
        relatedEventIds: [],
        isRead: false,
        isSaved: false,
    },
    {
        id: '2',
        title: 'Mobile App Development Competition Update',
        content: 'Important updates for Mobile App Dev competitors...',
        summary: 'New guidelines released for 2025-2026 theme: "Design the Future of Member Engagement"',
        level: 'national',
        category: 'announcement',
        authorId: 'admin',
        authorName: 'FBLA National',
        authorRole: 'National Headquarters',
        publishedAt: new Date(Date.now() - 86400000).toISOString(),
        isPinned: false,
        priority: 'normal',
        tags: ['Mobile App Dev', 'Guidelines'],
        relatedEventIds: [],
        isRead: false,
        isSaved: false,
    },
    {
        id: '3',
        title: 'Chapter Meeting This Thursday',
        content: 'Join us for our weekly chapter meeting...',
        summary: 'This week: Competition prep workshop and officer elections preview',
        level: 'chapter',
        category: 'event',
        authorId: 'officer',
        authorName: 'Lincoln FBLA',
        authorRole: 'Chapter',
        publishedAt: new Date(Date.now() - 172800000).toISOString(),
        isPinned: false,
        priority: 'normal',
        tags: ['Meeting', 'Competition Prep'],
        relatedEventIds: ['event-1'],
        isRead: true,
        isSaved: false,
    },
];

export default function HomeScreen() {
    const dispatch = useAppDispatch();
    const user = useAppSelector(state => state.auth.user);
    const profile = useAppSelector(state => state.profile.profile);
    const { news, unreadCount } = useAppSelector(state => state.news);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        dispatch(setNews(demoNews));
    }, []);

    const onRefresh = async () => {
        setRefreshing(true);
        // Simulate API call
        setTimeout(() => {
            setRefreshing(false);
        }, 1000);
    };

    const handleNewsPress = (newsId: string) => {
        dispatch(markAsRead(newsId));
        // Navigate to detail (would be implemented)
    };

    return (
        <View style={styles.container}>
            <ScrollView
                style={styles.scrollView}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                {/* Welcome Card */}
                <View style={styles.welcomeCard}>
                    <View style={styles.welcomeHeader}>
                        <View>
                            <Text style={styles.welcomeText}>Welcome back,</Text>
                            <Text style={styles.userName}>{user?.displayName?.split(' ')[0] || 'Member'}!</Text>
                        </View>
                        <View style={styles.avatarContainer}>
                            <Avatar.Text
                                size={48}
                                label={user?.displayName?.charAt(0) || 'U'}
                                style={styles.avatar}
                            />
                            {profile && (
                                <View style={styles.levelBadge}>
                                    <Text style={styles.levelText}>Lv{profile.level}</Text>
                                </View>
                            )}
                        </View>
                    </View>

                    {/* Quick Stats */}
                    <View style={styles.statsRow}>
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{profile?.totalXP || 0}</Text>
                            <Text style={styles.statLabel}>XP</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{profile?.badges.length || 0}</Text>
                            <Text style={styles.statLabel}>Badges</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>3</Text>
                            <Text style={styles.statLabel}>Events</Text>
                        </View>
                    </View>
                </View>

                {/* Quick Actions */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Quick Actions</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <View style={styles.actionsRow}>
                            <QuickAction icon="chatbubbles" label="Ask AI" color={colors.primary[600]} />
                            <QuickAction icon="calendar" label="Events" color={colors.secondary[500]} />
                            <QuickAction icon="document-text" label="Resources" color={colors.success.main} />
                            <QuickAction icon="trophy" label="Compete" color={colors.warning.main} />
                            <QuickAction icon="people" label="Network" color={colors.info.main} />
                        </View>
                    </ScrollView>
                </View>

                {/* News Feed */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>News & Updates</Text>
                        {unreadCount > 0 && (
                            <Badge style={styles.unreadBadge}>{unreadCount}</Badge>
                        )}
                    </View>

                    {news.map((item) => (
                        <NewsCard key={item.id} item={item} onPress={() => handleNewsPress(item.id)} />
                    ))}
                </View>

                {/* Social Feed Preview */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Chapter Social</Text>
                    <Card style={styles.socialCard}>
                        <Card.Content>
                            <View style={styles.socialHeader}>
                                <Ionicons name="logo-instagram" size={24} color="#E1306C" />
                                <Text style={styles.socialHandle}>@lincolnfbla</Text>
                                <Text style={styles.socialTime}>2h ago</Text>
                            </View>
                            <Text style={styles.socialContent}>
                                Great turnout at today's competition prep workshop! 📚 #FBLA #FutureBusiness
                            </Text>
                        </Card.Content>
                    </Card>
                </View>

                <View style={{ height: 100 }} />
            </ScrollView>
        </View>
    );
}

function QuickAction({ icon, label, color }: { icon: string; label: string; color: string }) {
    return (
        <TouchableOpacity style={styles.actionButton}>
            <View style={[styles.actionIcon, { backgroundColor: color + '20' }]}>
                <Ionicons name={icon as any} size={24} color={color} />
            </View>
            <Text style={styles.actionLabel}>{label}</Text>
        </TouchableOpacity>
    );
}

function NewsCard({ item, onPress }: { item: NewsItem; onPress: () => void }) {
    const getLevelColor = () => {
        switch (item.level) {
            case 'national': return colors.primary[600];
            case 'state': return colors.secondary[600];
            case 'chapter': return colors.success.main;
            default: return colors.neutral[500];
        }
    };

    return (
        <TouchableOpacity onPress={onPress}>
            <Card style={[styles.newsCard, item.isPinned && styles.newsCardPinned]}>
                <Card.Content>
                    {item.isPinned && (
                        <View style={styles.pinnedBadge}>
                            <Ionicons name="pin" size={12} color={colors.warning.dark} />
                            <Text style={styles.pinnedText}>Pinned</Text>
                        </View>
                    )}
                    <View style={styles.newsHeader}>
                        <Chip
                            style={[styles.levelChip, { backgroundColor: getLevelColor() + '20' }]}
                            textStyle={[styles.levelChipText, { color: getLevelColor() }]}
                        >
                            {item.level.charAt(0).toUpperCase() + item.level.slice(1)}
                        </Chip>
                        {!item.isRead && <View style={styles.unreadDot} />}
                    </View>
                    <Text style={styles.newsTitle}>{item.title}</Text>
                    <Text style={styles.newsSummary}>{item.summary}</Text>
                    <View style={styles.newsFooter}>
                        <Text style={styles.newsAuthor}>{item.authorName}</Text>
                        <Text style={styles.newsTime}>
                            {new Date(item.publishedAt).toLocaleDateString()}
                        </Text>
                    </View>
                </Card.Content>
            </Card>
        </TouchableOpacity>
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
    welcomeCard: {
        backgroundColor: colors.primary[600],
        margin: spacing.md,
        borderRadius: borderRadius.xl,
        padding: spacing.lg,
        ...shadows.lg,
    },
    welcomeHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.lg,
    },
    welcomeText: {
        fontSize: typography.fontSize.md,
        color: 'rgba(255, 255, 255, 0.8)',
    },
    userName: {
        fontSize: typography.fontSize.xxl,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    avatarContainer: {
        position: 'relative',
    },
    avatar: {
        backgroundColor: colors.secondary[500],
    },
    levelBadge: {
        position: 'absolute',
        bottom: -4,
        right: -4,
        backgroundColor: colors.secondary[500],
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: colors.primary[600],
    },
    levelText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    statsRow: {
        flexDirection: 'row',
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        borderRadius: borderRadius.lg,
        padding: spacing.md,
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    statValue: {
        fontSize: typography.fontSize.xl,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    statLabel: {
        fontSize: typography.fontSize.xs,
        color: 'rgba(255, 255, 255, 0.7)',
        marginTop: 2,
    },
    statDivider: {
        width: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        marginHorizontal: spacing.sm,
    },
    section: {
        paddingHorizontal: spacing.md,
        marginBottom: spacing.lg,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    sectionTitle: {
        fontSize: typography.fontSize.lg,
        fontWeight: '600',
        color: colors.neutral[800],
        marginBottom: spacing.md,
    },
    unreadBadge: {
        marginLeft: spacing.sm,
        marginBottom: spacing.md,
        backgroundColor: colors.error.main,
    },
    actionsRow: {
        flexDirection: 'row',
        gap: spacing.md,
        paddingRight: spacing.md,
    },
    actionButton: {
        alignItems: 'center',
        width: 70,
    },
    actionIcon: {
        width: 56,
        height: 56,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.xs,
    },
    actionLabel: {
        fontSize: typography.fontSize.xs,
        color: colors.neutral[600],
        fontWeight: '500',
    },
    newsCard: {
        marginBottom: spacing.md,
        borderRadius: borderRadius.lg,
        backgroundColor: '#FFFFFF',
    },
    newsCardPinned: {
        borderLeftWidth: 4,
        borderLeftColor: colors.warning.main,
    },
    pinnedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    pinnedText: {
        fontSize: typography.fontSize.xs,
        color: colors.warning.dark,
        marginLeft: 4,
        fontWeight: '500',
    },
    newsHeader: {
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
    unreadDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: colors.primary[600],
        marginLeft: spacing.sm,
    },
    newsTitle: {
        fontSize: typography.fontSize.md,
        fontWeight: '600',
        color: colors.neutral[900],
        marginBottom: spacing.xs,
    },
    newsSummary: {
        fontSize: typography.fontSize.sm,
        color: colors.neutral[600],
        lineHeight: 20,
        marginBottom: spacing.sm,
    },
    newsFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    newsAuthor: {
        fontSize: typography.fontSize.xs,
        color: colors.neutral[500],
        fontWeight: '500',
    },
    newsTime: {
        fontSize: typography.fontSize.xs,
        color: colors.neutral[400],
    },
    socialCard: {
        borderRadius: borderRadius.lg,
        backgroundColor: '#FFFFFF',
    },
    socialHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    socialHandle: {
        fontSize: typography.fontSize.sm,
        fontWeight: '600',
        color: colors.neutral[800],
        marginLeft: spacing.sm,
        flex: 1,
    },
    socialTime: {
        fontSize: typography.fontSize.xs,
        color: colors.neutral[400],
    },
    socialContent: {
        fontSize: typography.fontSize.sm,
        color: colors.neutral[700],
        lineHeight: 22,
    },
});
