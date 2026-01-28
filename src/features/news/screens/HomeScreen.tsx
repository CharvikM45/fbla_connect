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
import { Text, Card, Chip, Avatar, Badge } from 'react-native-paper';
import { View as MotiView } from 'moti';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAppSelector, useAppDispatch } from '../../../shared/hooks/useRedux';
import { setNews, markAsRead, NewsItem, addNewsItem } from '../newsSlice';
import { colors, spacing, typography, borderRadius, shadows, gradients } from '../../../shared/theme';
import { fetchStateNews } from '../../../shared/services/newsService';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { AnimatedButton } from '../../../shared/components/AnimatedButton';
import { GlassCard } from '../../../shared/components/GlassCard';
import { GlowView } from '../../../shared/components/GlowView';
import { StaggeredList } from '../../../shared/components/StaggeredList';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

// ... (demoNews stays same)

export default function HomeScreen() {
    const dispatch = useAppDispatch();
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    const user = useAppSelector(state => state.auth.user);
    const profile = useAppSelector(state => state.profile.profile);
    const { unreadCount } = useAppSelector(state => state.news);
    const [refreshing, setRefreshing] = useState(false);

    // Convex Query for real-time news
    const convexNews = useQuery(api.users.currentUser); // Simplified for now to get user context

    // Filter news based on user's location (Keep demo news as fallback)
    const news = React.useMemo((): NewsItem[] => {
        if (!user) return demoNews;
        return demoNews.filter((item: NewsItem) => {
            if (item.level === 'national') return true;
            if (item.level === 'state') return item.stateId === user.state;
            if (item.level === 'chapter') return item.chapterId === user.chapterName;
            return false;
        });
    }, [user]);

    useEffect(() => {
        dispatch(setNews(demoNews));
    }, []);

    const onRefresh = async () => {
        setRefreshing(true);
        setTimeout(() => setRefreshing(false), 1000);
    };

    const handleNewsPress = (newsId: string) => {
        dispatch(markAsRead(newsId));
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
            <LinearGradient colors={['#041333', '#000000']} style={StyleSheet.absoluteFill} />

            <ScrollView
                style={styles.scrollView}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FFFFFF" />
                }
            >
                {/* Header Glow */}
                <GlowView color="blue" intensity={1.2} style={styles.topGlow} />

                {/* Welcome Section */}
                <View style={styles.welcomeSection}>
                    <View style={styles.welcomeHeader}>
                        <View>
                            <Text style={styles.welcomeText}>Welcome back,</Text>
                            <Text style={styles.userName}>{user?.displayName?.split(' ')[0] || 'Member'}!</Text>
                        </View>
                        <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
                            <View style={styles.avatarContainer}>
                                <Avatar.Text
                                    size={52}
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

                    <GlassCard style={styles.statsCard} intensity={10}>
                        <View style={styles.statsRow}>
                            <View style={styles.statItem}>
                                <Text style={styles.statValue}>{profile?.totalXP || 0}</Text>
                                <Text style={styles.statLabel}>XP</Text>
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
                    </GlassCard>
                </View>

                {/* Quick Actions */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Quick Actions</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <View style={styles.actionsRow}>
                            <QuickAction icon="sparkles" label="Ask AI" color="#8B5CF6" onPress={() => handleQuickAction('Ask AI')} />
                            <QuickAction icon="calendar" label="Events" color="#3B82F6" onPress={() => handleQuickAction('Events')} />
                            <QuickAction icon="library" label="Resources" color="#10B981" onPress={() => handleQuickAction('Resources')} />
                            <QuickAction
                                icon="trophy"
                                label="Compete"
                                color="#F59E0B"
                                onPress={() => handleQuickAction('Compete')}
                            />
                            <QuickAction icon="people" label="Network" color="#EC4899" onPress={() => handleQuickAction('Network')} />
                        </View>
                    </ScrollView>
                </View>

                {/* News Feed - Now with StaggeredList implicitly or manually handled */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>News & Updates</Text>
                        {unreadCount > 0 && (
                            <Badge style={styles.unreadBadge}>{unreadCount}</Badge>
                        )}
                    </View>

                    {news.map((item, index) => (
                        <MotiView
                            key={item.id}
                            from={{ opacity: 0, translateY: 20 }}
                            animate={{ opacity: 1, translateY: 0 }}
                            transition={{
                                type: 'spring',
                                damping: 15,
                                stiffness: 100,
                                delay: index * 100,
                            }}
                        >
                            <NewsCard item={item} onPress={() => handleNewsPress(item.id)} />
                        </MotiView>
                    ))}
                </View>

                <View style={{ height: 100 }} />
            </ScrollView>
        </View>
    );
}

function QuickAction({ icon, label, color, onPress }: { icon: string; label: string; color: string; onPress?: () => void }) {
    return (
        <AnimatedButton style={styles.actionButton} onPress={onPress}>
            <GlassCard style={styles.actionGlass} intensity={5}>
                <View style={[styles.actionIcon, { backgroundColor: color + '20' }]}>
                    <Ionicons name={icon as any} size={26} color={color} />
                </View>
            </GlassCard>
            <Text style={styles.actionLabel}>{label}</Text>
        </AnimatedButton>
    );
}

function NewsCard({ item, onPress }: { item: NewsItem; onPress: () => void }) {
    const getLevelColor = () => {
        switch (item.level) {
            case 'national': return '#60A5FA';
            case 'state': return '#FBBF24';
            case 'chapter': return '#34D399';
            default: return '#A1A1AA';
        }
    };

    return (
        <AnimatedButton onPress={onPress} style={{ marginBottom: spacing.md }}>
            <GlassCard style={[styles.newsCard, item.isPinned && styles.newsCardPinned]}>
                {item.isPinned && (
                    <View style={styles.pinnedBadge}>
                        <Ionicons name="pin" size={12} color="#F59E0B" />
                        <Text style={styles.pinnedText}>PINNED</Text>
                    </View>
                )}
                <View style={styles.newsHeader}>
                    <Chip
                        style={[styles.levelChip, { backgroundColor: getLevelColor() + '20' }]}
                        textStyle={[styles.levelChipText, { color: getLevelColor() }]}
                    >
                        {item.level.toUpperCase()}
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
            </GlassCard>
        </AnimatedButton>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000000',
    },
    scrollView: {
        flex: 1,
    },
    topGlow: {
        position: 'absolute',
        top: -100,
        left: 0,
        right: 0,
        height: 300,
        opacity: 0.3,
    },
    welcomeSection: {
        marginTop: spacing.xl,
        paddingHorizontal: spacing.md,
        marginBottom: spacing.lg,
    },
    welcomeHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.lg,
    },
    welcomeText: {
        fontSize: typography.fontSize.md,
        color: 'rgba(255, 255, 255, 0.6)',
        fontWeight: '500',
    },
    userName: {
        fontSize: typography.fontSize.xxxl,
        fontWeight: '900',
        color: '#FFFFFF',
        letterSpacing: -0.5,
    },
    avatarContainer: {
        position: 'relative',
    },
    avatar: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    levelBadge: {
        position: 'absolute',
        bottom: -4,
        right: -4,
        backgroundColor: colors.primary[500],
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#000000',
    },
    levelText: {
        fontSize: 10,
        fontWeight: '900',
        color: '#FFFFFF',
    },
    statsCard: {
        padding: spacing.md,
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
        fontSize: typography.fontSize.xl,
        fontWeight: '900',
        color: '#FFFFFF',
    },
    statLabel: {
        fontSize: 10,
        color: 'rgba(255, 255, 255, 0.4)',
        fontWeight: '800',
        textTransform: 'uppercase',
        marginTop: 2,
    },
    statDivider: {
        width: 1,
        height: 30,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        marginHorizontal: spacing.sm,
    },
    section: {
        paddingHorizontal: spacing.md,
        marginBottom: spacing.xl,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: spacing.md,
    },
    sectionTitle: {
        fontSize: typography.fontSize.lg,
        fontWeight: '800',
        color: '#FFFFFF',
        letterSpacing: 0.5,
        marginBottom: spacing.md,
    },
    unreadBadge: {
        backgroundColor: colors.primary[500],
        fontWeight: 'bold',
    },
    actionsRow: {
        flexDirection: 'row',
        gap: spacing.lg,
        paddingBottom: spacing.sm,
    },
    actionButton: {
        alignItems: 'center',
        width: 80,
    },
    actionGlass: {
        width: 64,
        height: 64,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.sm,
        padding: 0,
    },
    actionIcon: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    actionLabel: {
        fontSize: 11,
        color: 'rgba(255, 255, 255, 0.7)',
        fontWeight: '700',
        textAlign: 'center',
    },
    newsCard: {
        padding: spacing.md,
    },
    newsCardPinned: {
        borderColor: 'rgba(245, 158, 11, 0.3)',
    },
    pinnedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.xs,
    },
    pinnedText: {
        fontSize: 10,
        color: '#F59E0B',
        marginLeft: 4,
        fontWeight: '900',
        letterSpacing: 1,
    },
    newsHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: spacing.sm,
    },
    levelChip: {
        height: 24,
        borderRadius: 6,
    },
    levelChipText: {
        fontSize: 10,
        fontWeight: '900',
    },
    unreadDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: colors.primary[400],
    },
    newsTitle: {
        fontSize: typography.fontSize.md,
        fontWeight: '700',
        color: '#FFFFFF',
        marginBottom: spacing.xs,
    },
    newsSummary: {
        fontSize: typography.fontSize.sm,
        color: 'rgba(255, 255, 255, 0.6)',
        lineHeight: 20,
        marginBottom: spacing.md,
    },
    newsFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderTopWidth: 1,
        borderTopColor: 'rgba(255, 255, 255, 0.05)',
        paddingTop: spacing.sm,
    },
    newsAuthor: {
        fontSize: 11,
        color: 'rgba(255, 255, 255, 0.4)',
        fontWeight: '600',
    },
    newsTime: {
        fontSize: 11,
        color: 'rgba(255, 255, 255, 0.3)',
    },
});
