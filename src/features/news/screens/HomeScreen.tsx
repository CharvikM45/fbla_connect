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
import { Text, Avatar, Badge, Card } from 'react-native-paper';
import { MotiView } from 'moti';
import { Ionicons } from '@expo/vector-icons';
import { useAppSelector, useAppDispatch } from '../../../shared/hooks/useRedux';
import { setNews, markAsRead, NewsItem } from '../newsSlice';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { colors, spacing, typography, borderRadius } from '../../../shared/theme';
import AddAnnouncementModal from '../components/AddAnnouncementModal';
import AddMeetingModal from '../../calendar/components/AddMeetingModal';
const { width } = Dimensions.get('window');

const demoNews: NewsItem[] = [
    {
        id: '1',
        title: 'National Leadership Conference 2025',
        content: 'Registration is now open for the 2025 NLC in Anaheim, California!',
        summary: 'Registration is now open for the 2025 NLC in Anaheim, California!',
        level: 'national',
        category: 'announcement',
        authorId: 'admin',
        authorName: 'FBLA National',
        authorRole: 'National Staff',
        publishedAt: new Date().toISOString(),
        isPinned: true,
        priority: 'high',
        tags: ['NLC', 'Conference'],
        relatedEventIds: [],
        isRead: false,
        isSaved: false,
    },
    {
        id: '2',
        title: 'State Business Leadership Conference',
        content: 'Check out the competitive events schedule for SBLC.',
        summary: 'Check out the competitive events schedule for SBLC.',
        level: 'state',
        category: 'event',
        authorId: 'state_admin',
        authorName: 'State FBLA',
        authorRole: 'State Director',
        publishedAt: new Date().toISOString(),
        isPinned: false,
        priority: 'normal',
        tags: ['SBLC', 'Competition'],
        relatedEventIds: [],
        stateId: 'GA',
        isRead: false,
        isSaved: false,
    }
];

export default function HomeScreen() {
    const dispatch = useAppDispatch();
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    const user = useAppSelector(state => state.auth.user);
    const profile = useAppSelector(state => state.profile.profile);
    const { unreadCount } = useAppSelector(state => state.news);
    const [refreshing, setRefreshing] = useState(false);
    const [showAddAnnouncementModal, setShowAddAnnouncementModal] = useState(false);
    const [showAddMeetingModal, setShowAddMeetingModal] = useState(false);

    // Convex Query for real-time news
    const liveNews = useQuery(api.news.getFilteredNews, {
        stateId: user?.state,
        chapterId: user?.chapterName
    });

    const news = React.useMemo((): NewsItem[] => {
        if (liveNews && liveNews.length > 0) {
            return liveNews.map((item: any) => ({
                id: item._id,
                title: item.title,
                content: item.content,
                summary: item.summary,
                level: item.level as NewsItem['level'],
                category: item.category as NewsItem['category'],
                authorId: item.authorId || 'admin',
                authorName: item.authorName,
                authorRole: item.authorRole || 'Staff',
                publishedAt: item.publishedAt,
                isPinned: item.isPinned || false,
                priority: (item.priority || 'normal') as NewsItem['priority'],
                tags: item.tags || [],
                relatedEventIds: item.relatedEventIds || [],
                isRead: false,
                isSaved: false,
                imageUrl: item.imageUrl
            }));
        }

        if (!user) return demoNews;
        return demoNews.filter((item: NewsItem) => {
            if (item.level === 'national') return true;
            if (item.level === 'state') return item.stateId === user.state;
            if (item.level === 'chapter') return item.chapterId === user.chapterName;
            return false;
        });
    }, [liveNews, user]);

    useEffect(() => {
        dispatch(setNews(news));
    }, [news]);

    const onRefresh = async () => {
        setRefreshing(true);
        setTimeout(() => setRefreshing(false), 1000);
    };

    const handleQuickAction = (label: string) => {
        switch (label) {
            case 'Ask AI': navigation.navigate('AI'); break;
            case 'Events': navigation.navigate('Calendar'); break;
            case 'Resources': navigation.navigate('Resources'); break;
            case 'Compete': navigation.navigate('Resources', { screen: 'CompetitiveEvents' }); break;
            case 'Network': navigation.navigate('Profile'); break;
        }
    };

    return (
        <View style={styles.container}>
            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary[600]} />
                }
            >
                {/* Welcome Section */}
                <View style={styles.welcomeSection}>
                    <MotiView
                        from={{ opacity: 0, translateY: -20 }}
                        animate={{ opacity: 1, translateY: 0 }}
                        transition={{ type: 'spring', damping: 12 }}
                    >
                        <View style={styles.welcomeHeader}>
                            <View>
                                <Text style={styles.welcomeText}>Welcome back,</Text>
                                <Text style={styles.userName}>{user?.displayName?.split(' ')[0] || 'Member'}!</Text>
                            </View>
                            <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
                                <View style={styles.avatarContainer}>
                                    <Avatar.Text
                                        size={56}
                                        label={user?.displayName?.charAt(0) || 'U'}
                                        style={styles.avatar}
                                    />
                                    {profile && (
                                        <View style={styles.levelBadge}>
                                            <Text style={styles.levelText}>Lv{profile.level}</Text>
                                        </View>
                                    )}
                                </View>
                            </TouchableOpacity>
                        </View>

                        <Card style={styles.statsCard}>
                            <Card.Content>
                                <View style={styles.statsRow}>
                                    <View style={styles.statItem}>
                                        <Text style={styles.statValue}>{profile?.totalXP || 0}</Text>
                                        <Text style={styles.statLabel}>XP Points</Text>
                                    </View>
                                    <View style={styles.statDivider} />
                                    <View style={styles.statItem}>
                                        <Text style={styles.statValue}>{profile?.badges?.length || 0}</Text>
                                        <Text style={styles.statLabel}>Badges</Text>
                                    </View>
                                    <View style={styles.statDivider} />
                                    <View style={styles.statItem}>
                                        <Text style={styles.statValue}>3</Text>
                                        <Text style={styles.statLabel}>Events</Text>
                                    </View>
                                </View>
                            </Card.Content>
                        </Card>
                    </MotiView>
                </View>

                {/* Quick Actions */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Quick Actions</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <View style={styles.actionsRow}>
                            <QuickAction icon="sparkles-outline" label="Ask AI" color="#8B5CF6" onPress={() => handleQuickAction('Ask AI')} />
                            <QuickAction icon="calendar" label="Events" color="#3B82F6" onPress={() => handleQuickAction('Events')} />
                            <QuickAction icon="library-outline" label="Resources" color="#10B981" onPress={() => handleQuickAction('Resources')} />
                            <QuickAction icon="trophy" label="Compete" color="#F59E0B" onPress={() => handleQuickAction('Compete')} />
                            <QuickAction icon="people" label="Network" color="#EC4899" onPress={() => handleQuickAction('Network')} />
                        </View>
                    </ScrollView>
                </View>

                {/* News Feed */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>News Feed</Text>
                        <View style={styles.sectionHeaderRight}>
                            {(user?.role === 'adviser' || user?.role === 'officer') && (
                                <TouchableOpacity
                                    style={styles.addAnnouncementBtn}
                                    onPress={() => {
                                        if (user?.role === 'adviser') {
                                            setShowAddAnnouncementModal(true);
                                        } else {
                                            setShowAddMeetingModal(true);
                                        }
                                    }}
                                >
                                    <Ionicons name="add-circle" size={20} color={colors.primary[600]} />
                                    <Text style={styles.addAnnouncementText}>Create</Text>
                                </TouchableOpacity>
                            )}
                            {unreadCount > 0 && (
                                <Badge style={styles.unreadBadge}>{unreadCount}</Badge>
                            )}
                        </View>
                    </View>

                    {news.map((item, index) => (
                        <MotiView
                            key={item.id}
                            from={{ opacity: 0, translateY: 30 }}
                            animate={{ opacity: 1, translateY: 0 }}
                            transition={{ type: 'spring', damping: 15, delay: index * 100 }}
                        >
                            <NewsCard item={item} onPress={() => dispatch(markAsRead(item.id))} />
                        </MotiView>
                    ))}
                </View>

                <View style={{ height: 120 }} />
            </ScrollView>

            {/* Add Announcement Modal */}
            <AddAnnouncementModal
                visible={showAddAnnouncementModal}
                onDismiss={() => setShowAddAnnouncementModal(false)}
                onSuccess={() => {
                    // Refetch handled automatically by Convex
                    setShowAddAnnouncementModal(false);
                }}
            />

            {/* Add Meeting Modal */}
            <AddMeetingModal
                visible={showAddMeetingModal}
                onDismiss={() => setShowAddMeetingModal(false)}
                onSuccess={() => {
                    setShowAddMeetingModal(false);
                }}
            />
        </View>
    );
}

function QuickAction({ icon, label, color, onPress }: { icon: string; label: string; color: string; onPress?: () => void }) {
    return (
        <TouchableOpacity style={styles.actionButton} onPress={onPress} activeOpacity={0.7}>
            <View style={[styles.actionIconContainer, { backgroundColor: color + '15' }]}>
                <Ionicons name={icon as any} size={28} color={color} />
            </View>
            <Text style={styles.actionLabel}>{label}</Text>
        </TouchableOpacity>
    );
}

function NewsCard({ item, onPress }: { item: NewsItem; onPress: () => void }) {
    const getLevelColor = () => {
        switch (item.level) {
            case 'national': return colors.primary[600];
            case 'state': return '#FBBF24';
            case 'chapter': return '#34D399';
            default: return colors.neutral[400];
        }
    };

    return (
        <TouchableOpacity onPress={onPress} style={{ marginBottom: spacing.md }} activeOpacity={0.8}>
            <Card style={[styles.newsCard, item.isPinned && styles.newsCardPinned]}>
                <Card.Content>
                    {item.isPinned && (
                        <View style={styles.pinnedBadge}>
                            <Ionicons name="pin" size={12} color="#FBBF24" />
                            <Text style={styles.pinnedText}>PINNED</Text>
                        </View>
                    )}
                    <View style={styles.newsHeader}>
                        <View style={[styles.levelBadgeMini, { backgroundColor: getLevelColor() + '15' }]}>
                            <Text style={[styles.levelTextMini, { color: getLevelColor() }]}>
                                {item.level.toUpperCase()}
                            </Text>
                        </View>
                        {!item.isRead && <View style={styles.unreadDot} />}
                    </View>
                    <Text style={styles.newsTitle}>{item.title}</Text>
                    <Text style={styles.newsSummary}>{item.summary}</Text>

                    <View style={styles.newsFooter}>
                        <View style={styles.authorInfo}>
                            <Avatar.Text size={20} label={item.authorName?.charAt(0) || 'F'} style={styles.authorAvatar} />
                            <Text style={styles.newsAuthor}>{item.authorName}</Text>
                        </View>
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
    welcomeSection: {
        paddingTop: spacing.xl,
        paddingHorizontal: spacing.md,
        paddingBottom: spacing.lg,
        backgroundColor: colors.primary[600],
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    welcomeHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.xl,
    },
    welcomeText: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.8)',
        fontWeight: '500',
    },
    userName: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    avatarContainer: {
        position: 'relative',
    },
    avatar: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    levelBadge: {
        position: 'absolute',
        bottom: -2,
        right: -2,
        backgroundColor: colors.secondary[500],
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: colors.primary[600],
    },
    levelText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    statsCard: {
        borderRadius: 20,
        elevation: 4,
        backgroundColor: '#FFFFFF',
    },
    statsRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    statValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.neutral[900],
    },
    statLabel: {
        fontSize: 10,
        color: colors.neutral[500],
        fontWeight: '600',
        textTransform: 'uppercase',
        marginTop: 4,
    },
    statDivider: {
        width: 1,
        height: 30,
        backgroundColor: colors.neutral[200],
    },
    section: {
        paddingHorizontal: spacing.md,
        marginTop: spacing.xl,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: spacing.md,
    },
    sectionHeaderRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    addAnnouncementBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.primary[50],
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 10,
        gap: 4,
    },
    addAnnouncementText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: colors.primary[600],
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.neutral[900],
    },
    unreadBadge: {
        backgroundColor: colors.primary[600],
    },
    actionsRow: {
        flexDirection: 'row',
        gap: spacing.md,
        paddingBottom: spacing.sm,
    },
    actionButton: {
        alignItems: 'center',
        width: 76,
    },
    actionIconContainer: {
        width: 60,
        height: 60,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.xs,
    },
    actionLabel: {
        fontSize: 11,
        color: colors.neutral[600],
        fontWeight: '600',
        textAlign: 'center',
    },
    newsCard: {
        borderRadius: 20,
        elevation: 2,
        backgroundColor: '#FFFFFF',
    },
    newsCardPinned: {
        borderColor: colors.secondary[200],
        borderWidth: 1,
    },
    pinnedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    pinnedText: {
        fontSize: 10,
        color: colors.secondary[600],
        marginLeft: 4,
        fontWeight: 'bold',
    },
    newsHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    levelBadgeMini: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
    },
    levelTextMini: {
        fontSize: 10,
        fontWeight: 'bold',
    },
    unreadDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: colors.primary[600],
    },
    newsTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.neutral[900],
        marginBottom: 6,
    },
    newsSummary: {
        fontSize: 14,
        color: colors.neutral[600],
        lineHeight: 20,
        marginBottom: 12,
    },
    newsFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: colors.neutral[100],
        paddingTop: 10,
    },
    authorInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    authorAvatar: {
        backgroundColor: colors.primary[100],
        marginRight: 6,
    },
    newsAuthor: {
        fontSize: 12,
        color: colors.neutral[700],
        fontWeight: '600',
    },
    newsTime: {
        fontSize: 11,
        color: colors.neutral[400],
    },
});
