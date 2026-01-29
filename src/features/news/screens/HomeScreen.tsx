// FBLA Connect - Home Screen (News Feed)
import React, { useEffect, useState } from 'react';
import {
    View,
    StyleSheet,
    ScrollView,
    RefreshControl,
    TouchableOpacity,
    Dimensions,
    Platform,
} from 'react-native';
import { Text, Avatar, Badge, Card } from 'react-native-paper';
import { MotiView } from 'moti';
import { Ionicons } from '@expo/vector-icons';
import { useAppSelector, useAppDispatch } from '../../../shared/hooks/useRedux';
import { setNews, markAsRead, NewsItem } from '../newsSlice';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { colors, spacing, typography, borderRadius } from '../../../shared/theme';
import AddAnnouncementModal from '../components/AddAnnouncementModal';
import AddMeetingModal from '../../calendar/components/AddMeetingModal';
import * as SecureStore from 'expo-secure-store';
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

    const addXP = useMutation(api.profiles.addXP);
    const [dailyXPClaimed, setDailyXPClaimed] = useState(false);

    // Convex Query for real-time news
    const liveNews = useQuery(api.news.getFilteredNews, {
        stateId: user?.state,
        chapterId: user?.chapterName
    });

    useEffect(() => {
        // Daily Login XP Award
        const checkDailyXP = async () => {
            if (!user) return;
            const lastLoginDate = await SecureStore.getItemAsync('last_login_date');
            const today = new Date().toDateString();

            if (lastLoginDate !== today && !dailyXPClaimed) {
                try {
                    await addXP({ amount: 10, userId: user.id as any });
                    await SecureStore.setItemAsync('last_login_date', today);
                    setDailyXPClaimed(true);
                    console.log('Daily XP Awarded!');
                } catch (error) {
                    console.error('Failed to award daily XP:', error);
                }
            }
        };

        checkDailyXP();
    }, [user, dailyXPClaimed]);

    const handleMarkAsRead = async (newsId: string) => {
        const item = news.find(n => n.id === newsId);
        if (item && !item.isRead && user) {
            dispatch(markAsRead(newsId));
            try {
                await addXP({ amount: 5, userId: user.id as any });
            } catch (error) {
                console.error('Failed to add XP for reading news:', error);
            }
        }
    };

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
                        from={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ type: 'spring', damping: 15 }}
                    >
                        <View style={styles.welcomeHeader}>
                            <View>
                                <Text style={styles.welcomeText}>Welcome back,</Text>
                                <Text style={styles.userName}>{user?.displayName?.split(' ')[0] || 'Member'}!</Text>
                            </View>
                            <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
                                <View style={styles.avatarContainer}>
                                    <Avatar.Text
                                        size={50}
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

                        <View style={styles.statsOverview}>
                            <View style={styles.statMini}>
                                <Text style={styles.statMiniValue}>{profile?.totalXP || 0}</Text>
                                <Text style={styles.statMiniLabel}>XP</Text>
                            </View>
                            <View style={styles.statMiniDivider} />
                            <View style={styles.statMini}>
                                <Text style={styles.statMiniValue}>{profile?.badges?.length || 0}</Text>
                                <Text style={styles.statMiniLabel}>Badges</Text>
                            </View>
                            <View style={styles.statMiniDivider} />
                            <View style={styles.statMini}>
                                <Text style={styles.statMiniValue}>3</Text>
                                <Text style={styles.statMiniLabel}>Events</Text>
                            </View>
                        </View>
                    </MotiView>
                </View>

                {/* Quick Actions Grid */}
                <View style={styles.section}>
                    <View style={styles.quickActionsGrid}>
                        <QuickAction icon="sparkles" label="Ask AI" color="#8B5CF6" onPress={() => handleQuickAction('Ask AI')} />
                        <QuickAction icon="calendar" label="Events" color="#3B82F6" onPress={() => handleQuickAction('Events')} />
                        <QuickAction icon="book" label="Resources" color="#10B981" onPress={() => handleQuickAction('Resources')} />
                        <QuickAction icon="trophy" label="Compete" color="#F59E0B" onPress={() => handleQuickAction('Compete')} />
                    </View>
                </View>

                {/* News Feed */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionSubtitle}>RECENT UPDATES</Text>
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
                                    <Ionicons name="add" size={18} color={colors.primary[600]} />
                                    <Text style={styles.addAnnouncementText}>New</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>

                    {news.map((item, index) => (
                        <MotiView
                            key={item.id}
                            from={{ opacity: 0, translateY: 20 }}
                            animate={{ opacity: 1, translateY: 0 }}
                            transition={{ type: 'timing', duration: 400, delay: index * 50 }}
                        >
                            <NewsCard item={item} onPress={() => handleMarkAsRead(item.id)} />
                        </MotiView>
                    ))}
                </View>

                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Modals remain same */}
            <AddAnnouncementModal
                visible={showAddAnnouncementModal}
                onDismiss={() => setShowAddAnnouncementModal(false)}
                onSuccess={() => setShowAddAnnouncementModal(false)}
            />
            <AddMeetingModal
                visible={showAddMeetingModal}
                onDismiss={() => setShowAddMeetingModal(false)}
                onSuccess={() => setShowAddMeetingModal(false)}
            />
        </View>
    );
}

function QuickAction({ icon, label, color, onPress }: { icon: string; label: string; color: string; onPress?: () => void }) {
    return (
        <TouchableOpacity style={styles.actionButton} onPress={onPress} activeOpacity={0.7}>
            <View style={[styles.actionIconContainer, { backgroundColor: color + '12' }]}>
                <Ionicons name={icon as any} size={24} color={color} />
            </View>
            <Text style={styles.actionLabel}>{label}</Text>
        </TouchableOpacity>
    );
}

function NewsCard({ item, onPress }: { item: NewsItem; onPress: () => void }) {
    const getLevelColor = () => {
        switch (item.level) {
            case 'national': return colors.primary[500];
            case 'state': return '#F59E0B';
            case 'chapter': return '#10B981';
            default: return colors.neutral[400];
        }
    };

    return (
        <TouchableOpacity onPress={onPress} style={{ marginBottom: spacing.md }} activeOpacity={0.8}>
            <Card style={[styles.newsCard, item.isPinned && styles.newsCardPinned]}>
                <Card.Content style={styles.newsCardContent}>
                    <View style={styles.newsCardBody}>
                        <View style={styles.newsMainInfo}>
                            <View style={styles.newsMetaRow}>
                                <View style={[styles.levelBadgeMini, { backgroundColor: getLevelColor() + '12' }]}>
                                    <Text style={[styles.levelTextMini, { color: getLevelColor() }]}>
                                        {item.level.toUpperCase()}
                                    </Text>
                                </View>
                                <Text style={styles.newsTime}>
                                    {new Date(item.publishedAt).toLocaleDateString()}
                                </Text>
                            </View>
                            <Text style={styles.newsTitle} numberOfLines={2}>{item.title}</Text>
                            <Text style={styles.newsSummary} numberOfLines={2}>{item.summary}</Text>
                        </View>
                        {item.imageUrl && (
                            <Avatar.Image size={70} source={{ uri: item.imageUrl }} style={styles.newsImage} />
                        )}
                    </View>

                    <View style={styles.newsFooter}>
                        <View style={styles.authorInfo}>
                            <Avatar.Text size={16} label={item.authorName?.charAt(0) || 'F'} style={styles.authorAvatar} labelStyle={{ fontSize: 8 }} />
                            <Text style={styles.newsAuthor}>{item.authorName}</Text>
                        </View>
                        {!item.isRead && <View style={styles.unreadDot} />}
                    </View>
                </Card.Content>
            </Card>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    scrollView: {
        flex: 1,
    },
    welcomeSection: {
        paddingTop: Platform.OS === 'ios' ? 60 : 40,
        paddingHorizontal: spacing.lg,
        paddingBottom: spacing.lg,
        backgroundColor: colors.primary[600],
        borderBottomLeftRadius: 36,
        borderBottomRightRadius: 36,
        elevation: 10,
        shadowColor: colors.primary[900],
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 20,
    },
    welcomeHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.lg,
    },
    welcomeText: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.7)',
        fontWeight: '500',
        letterSpacing: 0.5,
    },
    userName: {
        fontSize: 28,
        fontWeight: '900',
        color: '#FFFFFF',
        letterSpacing: -0.5,
    },
    avatarContainer: {
        position: 'relative',
    },
    avatar: {
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderWidth: 1.5,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    levelBadge: {
        position: 'absolute',
        bottom: -4,
        right: -4,
        backgroundColor: colors.secondary[500],
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 6,
        borderWidth: 1.5,
        borderColor: colors.primary[600],
    },
    levelText: {
        fontSize: 9,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    statsOverview: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 20,
        paddingVertical: 12,
        paddingHorizontal: 8,
    },
    statMini: {
        flex: 1,
        alignItems: 'center',
    },
    statMiniValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    statMiniLabel: {
        fontSize: 10,
        color: 'rgba(255, 255, 255, 0.6)',
        fontWeight: '700',
        textTransform: 'uppercase',
        marginTop: 2,
    },
    statMiniDivider: {
        width: 1,
        height: 16,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
    },
    section: {
        paddingHorizontal: spacing.lg,
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
    sectionSubtitle: {
        fontSize: 12,
        fontWeight: '800',
        color: colors.neutral[400],
        letterSpacing: 1.5,
    },
    addAnnouncementBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: colors.neutral[100],
        gap: 2,
    },
    addAnnouncementText: {
        fontSize: 11,
        fontWeight: 'bold',
        color: colors.primary[600],
    },
    quickActionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: spacing.md,
    },
    actionButton: {
        width: (width - spacing.lg * 2 - spacing.md) / 2,
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: spacing.md,
        flexDirection: 'row',
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
    },
    actionIconContainer: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.md,
    },
    actionLabel: {
        fontSize: 14,
        color: colors.neutral[800],
        fontWeight: '700',
    },
    newsCard: {
        borderRadius: 24,
        elevation: 3,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.03)',
    },
    newsCardContent: {
        padding: spacing.md,
    },
    newsCardBody: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    newsMainInfo: {
        flex: 1,
        marginRight: spacing.sm,
    },
    newsMetaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        gap: 8,
    },
    levelBadgeMini: {
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 6,
    },
    levelTextMini: {
        fontSize: 9,
        fontWeight: '900',
    },
    newsTime: {
        fontSize: 10,
        color: colors.neutral[400],
        fontWeight: '500',
    },
    newsTitle: {
        fontSize: 16,
        fontWeight: '800',
        color: colors.neutral[900],
        lineHeight: 22,
        marginBottom: 4,
    },
    newsSummary: {
        fontSize: 13,
        color: colors.neutral[500],
        lineHeight: 18,
    },
    newsImage: {
        borderRadius: 16,
        backgroundColor: colors.neutral[100],
    },
    newsFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
    },
    authorInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    authorAvatar: {
        backgroundColor: colors.primary[50],
        marginRight: 6,
    },
    newsAuthor: {
        fontSize: 11,
        color: colors.neutral[600],
        fontWeight: '600',
    },
    unreadDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: colors.primary[500],
    },
    newsCardPinned: {
        borderColor: colors.secondary[300],
        borderWidth: 1.5,
    },
});
