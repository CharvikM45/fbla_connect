// FBLA Connect - Social Feed Screen
import React, { useState } from 'react';
import {
    View,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Linking,
    RefreshControl,
} from 'react-native';
import { Text, Card, Chip, Avatar, IconButton } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../../../shared/theme';

interface SocialPost {
    id: string;
    platform: 'instagram' | 'twitter' | 'facebook';
    handle: string;
    content: string;
    imageUrl?: string;
    likes: number;
    comments: number;
    timestamp: string;
    url: string;
}

const demoPosts: SocialPost[] = [
    {
        id: '1',
        platform: 'instagram',
        handle: '@lincolnfbla',
        content: 'Great turnout at today\'s competition prep workshop! 📚 Our members are getting ready for SLC! #FBLA #FutureBusiness #LeadershipMatters',
        likes: 47,
        comments: 8,
        timestamp: '2 hours ago',
        url: 'https://instagram.com/p/example1',
    },
    {
        id: '2',
        platform: 'twitter',
        handle: '@NebraskaFBLA',
        content: '🏆 Congratulations to all district winners! See you at SLC in Omaha! Registration deadline: March 1st. #FBLA #NebraskaSLC',
        likes: 124,
        comments: 15,
        timestamp: '5 hours ago',
        url: 'https://twitter.com/NebraskaFBLA/status/example2',
    },
    {
        id: '3',
        platform: 'instagram',
        handle: '@lincolnfbla',
        content: 'Officer elections coming up next month! Interested in leading our chapter? Applications open now! 🌟 #StudentLeadership #FBLA',
        likes: 35,
        comments: 12,
        timestamp: '1 day ago',
        url: 'https://instagram.com/p/example3',
    },
    {
        id: '4',
        platform: 'facebook',
        handle: 'FBLA-PBL',
        content: 'The National Leadership Conference 2026 will be held in Anaheim, CA! Early bird registration opens soon. Start planning your trip to NLC! 🎉',
        likes: 892,
        comments: 156,
        timestamp: '2 days ago',
        url: 'https://facebook.com/fblapbl/posts/example4',
    },
];

const getPlatformIcon = (platform: string) => {
    switch (platform) {
        case 'instagram': return 'logo-instagram';
        case 'twitter': return 'logo-twitter';
        case 'facebook': return 'logo-facebook';
        default: return 'globe';
    }
};

const getPlatformColor = (platform: string) => {
    switch (platform) {
        case 'instagram': return '#E1306C';
        case 'twitter': return '#1DA1F2';
        case 'facebook': return '#4267B2';
        default: return colors.neutral[500];
    }
};

export default function SocialFeedScreen() {
    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = () => {
        setRefreshing(true);
        setTimeout(() => setRefreshing(false), 1000);
    };

    const openSocialPost = async (url: string) => {
        try {
            await Linking.openURL(url);
        } catch (error) {
            console.error('Could not open URL:', error);
        }
    };

    return (
        <View style={styles.container}>
            {/* Platform Filter */}
            <View style={styles.filterContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={styles.filterRow}>
                        <Chip
                            selected
                            style={styles.filterChipSelected}
                            textStyle={styles.filterChipTextSelected}
                        >
                            All Channels
                        </Chip>
                        <TouchableOpacity style={styles.platformFilter}>
                            <Ionicons name="logo-instagram" size={18} color="#E1306C" />
                            <Text style={styles.platformLabel}>Instagram</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.platformFilter}>
                            <Ionicons name="logo-twitter" size={18} color="#1DA1F2" />
                            <Text style={styles.platformLabel}>Twitter/X</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.platformFilter}>
                            <Ionicons name="logo-facebook" size={18} color="#4267B2" />
                            <Text style={styles.platformLabel}>Facebook</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </View>

            {/* Posts Feed */}
            <ScrollView
                style={styles.feedContainer}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                {demoPosts.map(post => (
                    <SocialPostCard
                        key={post.id}
                        post={post}
                        onPress={() => openSocialPost(post.url)}
                    />
                ))}
                <View style={{ height: 100 }} />
            </ScrollView>
        </View>
    );
}

function SocialPostCard({
    post,
    onPress,
}: {
    post: SocialPost;
    onPress: () => void;
}) {
    return (
        <TouchableOpacity onPress={onPress}>
            <Card style={styles.postCard}>
                <Card.Content>
                    {/* Header */}
                    <View style={styles.postHeader}>
                        <View style={styles.platformIconContainer}>
                            <Ionicons
                                name={getPlatformIcon(post.platform) as any}
                                size={20}
                                color={getPlatformColor(post.platform)}
                            />
                        </View>
                        <View style={styles.postMeta}>
                            <Text style={styles.postHandle}>{post.handle}</Text>
                            <Text style={styles.postTime}>{post.timestamp}</Text>
                        </View>
                        <IconButton
                            icon="open-outline"
                            size={18}
                            iconColor={colors.neutral[400]}
                            onPress={onPress}
                        />
                    </View>

                    {/* Content */}
                    <Text style={styles.postContent}>{post.content}</Text>

                    {/* Engagement */}
                    <View style={styles.engagementRow}>
                        <View style={styles.engagementItem}>
                            <Ionicons name="heart-outline" size={16} color={colors.neutral[500]} />
                            <Text style={styles.engagementText}>{post.likes}</Text>
                        </View>
                        <View style={styles.engagementItem}>
                            <Ionicons name="chatbubble-outline" size={16} color={colors.neutral[500]} />
                            <Text style={styles.engagementText}>{post.comments}</Text>
                        </View>
                        <View style={styles.engagementItem}>
                            <Ionicons name="share-outline" size={16} color={colors.neutral[500]} />
                            <Text style={styles.engagementText}>Share</Text>
                        </View>
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
        alignItems: 'center',
    },
    filterChipSelected: {
        backgroundColor: colors.primary[600],
    },
    filterChipTextSelected: {
        color: '#FFFFFF',
    },
    platformFilter: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.neutral[100],
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.full,
        gap: spacing.xs,
    },
    platformLabel: {
        fontSize: typography.fontSize.sm,
        color: colors.neutral[700],
        fontWeight: '500',
    },
    feedContainer: {
        flex: 1,
        padding: spacing.md,
    },
    postCard: {
        marginBottom: spacing.md,
        borderRadius: borderRadius.lg,
        backgroundColor: '#FFFFFF',
    },
    postHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    platformIconContainer: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: colors.neutral[100],
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.sm,
    },
    postMeta: {
        flex: 1,
    },
    postHandle: {
        fontSize: typography.fontSize.md,
        fontWeight: '600',
        color: colors.neutral[900],
    },
    postTime: {
        fontSize: typography.fontSize.xs,
        color: colors.neutral[500],
    },
    postContent: {
        fontSize: typography.fontSize.md,
        color: colors.neutral[800],
        lineHeight: 24,
        marginBottom: spacing.md,
    },
    engagementRow: {
        flexDirection: 'row',
        borderTopWidth: 1,
        borderTopColor: colors.neutral[100],
        paddingTop: spacing.sm,
        gap: spacing.lg,
    },
    engagementItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
    },
    engagementText: {
        fontSize: typography.fontSize.sm,
        color: colors.neutral[500],
    },
});
