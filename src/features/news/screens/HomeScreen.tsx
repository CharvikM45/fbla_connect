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
import { setNews, markAsRead, NewsItem, addNewsItem } from '../newsSlice';
import { colors, spacing, typography, borderRadius, shadows } from '../../../shared/theme';
import { fetchStateNews } from '../../../shared/services/newsService';
import { useNavigation } from '@react-navigation/native';
import { ResourcesStackParamList, MainTabParamList } from '../../../shared/navigation/types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

const { width } = Dimensions.get('window');

// Demo news data
const demoNews: NewsItem[] = [
    {
        id: '1',
        title: 'State Leadership Conference Registration Now Open!',
        content: 'Register now for the 2026 State Leadership Conference...',
        summary: 'Early bird registration ends February 15. Don\'t miss your chance to compete!',
        level: 'state',
        stateId: 'NE',
        category: 'deadline',
        authorId: 'admin',
        authorName: 'Nebraska FBLA',
        authorRole: 'State Association',
        publishedAt: new Date().toISOString(),
        isPinned: true,
        priority: 'high',
        tags: ['SLC', 'Registration', 'Competition'],
        relatedEventIds: [],
        isRead: true,
        isSaved: false,
    },
    {
        id: '1-GA',
        title: 'Georgia SLC 2026: Ignite Your Future',
        content: 'Registration for Georgia FBLA State Leadership Conference is officially open!',
        summary: 'Join thousands of Georgia members in Atlanta this March.',
        level: 'state',
        stateId: 'GA',
        category: 'deadline',
        authorId: 'admin',
        authorName: 'Georgia FBLA',
        authorRole: 'State Association',
        publishedAt: new Date().toISOString(),
        isPinned: true,
        priority: 'high',
        tags: ['GA SLC', 'Atlanta', 'Competition'],
        relatedEventIds: [],
        isRead: true,
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
        isRead: true,
        isSaved: false,
    },
    {
        id: '2b',
        title: 'National Leadership Conference 2026 Announced',
        content: 'Join us in Orlando, Florida for NLC 2026...',
        summary: 'Early registration opens March 1st. Book your hotel now for the best rates!',
        level: 'national',
        category: 'announcement',
        authorId: 'admin',
        authorName: 'FBLA National',
        authorRole: 'National Headquarters',
        publishedAt: new Date(Date.now() - 43200000).toISOString(),
        isPinned: false,
        priority: 'high',
        tags: ['NLC', 'Conference'],
        relatedEventIds: [],
        isRead: true,
        isSaved: false,
    },
    {
        id: '3',
        title: 'Chapter Meeting This Thursday',
        content: 'Join us for our weekly chapter meeting...',
        summary: 'This week: Competition prep workshop and officer elections preview',
        level: 'chapter',
        chapterId: 'Lincoln FBLA',
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
    {
        id: '4',
        title: 'Middle Georgia Regional Workshop',
        content: 'Attention chapters in the Middle Georgia region...',
        summary: 'Final call for regional workshop registrations.',
        level: 'state',
        stateId: 'GA',
        category: 'event',
        authorId: 'admin',
        authorName: 'Georgia FBLA',
        authorRole: 'State Association',
        publishedAt: new Date(Date.now() - 43200000).toISOString(),
        isPinned: false,
        priority: 'normal',
        tags: ['Regional', 'Georgia'],
        relatedEventIds: [],
        isRead: true,
        isSaved: false,
    },
];

export default function HomeScreen() {
    const dispatch = useAppDispatch();
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    const user = useAppSelector(state => state.auth.user);
    const profile = useAppSelector(state => state.profile.profile);
    const { news, unreadCount } = useAppSelector(state => state.news);
    const [refreshing, setRefreshing] = useState(false);

    // Filter news based on user's location
    const filteredNews = React.useMemo(() => {
        if (!user) return news;

        return news.filter(item => {
            // Always show national news
            if (item.level === 'national') return true;

            // Filter state news
            if (item.level === 'state') {
                return item.stateId === user.state;
            }

            // Filter chapter news
            if (item.level === 'chapter') {
                return item.chapterId === user.chapterName;
            }

            return false;
        });
    }, [news, user]);

    useEffect(() => {
        dispatch(setNews(demoNews));

        // Fetch real-time state news if user has a state
        if (user?.state) {
            fetchStateNews(user.state).then(stateNews => {
                stateNews.forEach(item => {
                    // Avoid duplicates if needed, for simplicity just add
                    dispatch(addNewsItem(item as NewsItem));
                });
            });
        }
    }, [user?.state]);

    const onRefresh = async () => {
        setRefreshing(true);
        if (user?.state) {
            const stateNews = await fetchStateNews(user.state);
            dispatch(setNews([...demoNews, ...(stateNews as NewsItem[])]));
        }
        setRefreshing(false);
    };

    const handleNewsPress = (newsId: string) => {
        dispatch(markAsRead(newsId));
        // Navigate to detail (would be implemented)
    };

    const handleQuickAction = (label: string) => {
        switch (label) {
            case 'Ask AI':
                navigation.navigate('AI');
                break;
            case 'Events':
                navigation.navigate('Calendar');
                break;
            case 'Resources':
                navigation.navigate('Resources');
                break;
            case 'Compete':
                navigation.navigate('Calendar');
                break;
            case 'Network':
                navigation.navigate('Profile');
                break;
        }
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
                            <QuickAction icon="chatbubbles" label="Ask AI" color={colors.primary[600]} onPress={() => handleQuickAction('Ask AI')} />
                            <QuickAction icon="calendar" label="Events" color={colors.secondary[500]} onPress={() => handleQuickAction('Events')} />
                            <QuickAction icon="document-text" label="Resources" color={colors.success.main} onPress={() => handleQuickAction('Resources')} />
                            <QuickAction
                                icon="trophy"
                                label="Compete"
                                color={colors.warning.main}
                                onPress={() => navigation.navigate('Resources', { screen: 'CompetitiveEvents' })}
                            />
                            <QuickAction icon="people" label="Network" color={colors.info.main} onPress={() => handleQuickAction('Network')} />
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

                    {filteredNews.map((item) => (
                        <NewsCard key={item.id} item={item} onPress={() => handleNewsPress(item.id)} />
                    ))}
                </View>

                {/* Social Feed Preview */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Chapter Social</Text>
                    <TouchableOpacity onPress={() => navigation.navigate('SocialHub')}>
                        <Card style={styles.socialCard}>
                            <Card.Content>
                                <View style={styles.socialHeader}>
                                    <Ionicons name="logo-instagram" size={24} color="#E1306C" />
                                    <Text style={styles.socialHandle}>
                                        @{user?.chapterName?.toLowerCase().replace(/\s+/g, '') || 'chapter'}
                                    </Text>
                                    <Text style={styles.socialTime}>Live Feed</Text>
                                </View>
                                <Text style={styles.socialContent}>
                                    Tap to view the latest updates from your state and chapter on social media. 📸
                                </Text>
                            </Card.Content>
                        </Card>
                    </TouchableOpacity>
                </View>

                <View style={{ height: 100 }} />
            </ScrollView>
        </View>
    );
}

function QuickAction({ icon, label, color, onPress }: { icon: string; label: string; color: string; onPress?: () => void }) {
    return (
        <TouchableOpacity style={styles.actionButton} onPress={onPress}>
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
        // height: 24,
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
