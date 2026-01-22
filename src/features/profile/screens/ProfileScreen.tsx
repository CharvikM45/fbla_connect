// FBLA Connect - Profile Screen
import React, { useState } from 'react';
import {
    View,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Dimensions,
} from 'react-native';
import { Text, Avatar, Card, Button, ProgressBar, Chip, Portal, Modal } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useAppSelector, useAppDispatch } from '../../../shared/hooks/useRedux';
import { logout } from '../../auth/authSlice';
import { colors, spacing, typography, borderRadius, shadows } from '../../../shared/theme';

const { width } = Dimensions.get('window');

// Demo badges
const demoBadges = [
    { id: '1', name: 'First Meeting', icon: '🎉', description: 'Attended your first chapter meeting', rarity: 'common' },
    { id: '2', name: 'Early Bird', icon: '🌅', description: 'Arrived early to an event', rarity: 'common' },
    { id: '3', name: 'Competitor', icon: '🏆', description: 'Participated in a competitive event', rarity: 'uncommon' },
    { id: '4', name: 'Team Player', icon: '🤝', description: 'Collaborated on a team event', rarity: 'uncommon' },
];

export default function ProfileScreen() {
    const dispatch = useAppDispatch();
    const user = useAppSelector(state => state.auth.user);
    const profile = useAppSelector(state => state.profile.profile);
    const [showLogoutModal, setShowLogoutModal] = useState(false);

    const xpToNextLevel = 1000;
    const currentLevelXP = (profile?.totalXP || 0) % xpToNextLevel;
    const xpProgress = currentLevelXP / xpToNextLevel;

    const handleLogout = () => {
        dispatch(logout());
        setShowLogoutModal(false);
    };

    return (
        <View style={styles.container}>
            <ScrollView>
                {/* Profile Header */}
                <View style={styles.header}>
                    <View style={styles.avatarContainer}>
                        <Avatar.Text
                            size={80}
                            label={user?.displayName?.charAt(0) || 'U'}
                            style={styles.avatar}
                        />
                        <View style={styles.levelBadge}>
                            <Text style={styles.levelText}>Lv {profile?.level || 1}</Text>
                        </View>
                    </View>

                    <Text style={styles.userName}>{user?.displayName || 'FBLA Member'}</Text>
                    <Text style={styles.userRole}>
                        {user?.role === 'officer' ? '⭐ Chapter Officer' :
                            user?.role === 'adviser' ? '👨‍🏫 Adviser' : '👤 Member'}
                    </Text>

                    {user?.chapterName && (
                        <View style={styles.chapterInfo}>
                            <Ionicons name="people" size={14} color={colors.neutral[500]} />
                            <Text style={styles.chapterText}>{user.chapterName}</Text>
                        </View>
                    )}
                </View>

                {/* XP Progress */}
                <Card style={styles.xpCard}>
                    <Card.Content>
                        <View style={styles.xpHeader}>
                            <Text style={styles.xpTitle}>Experience Points</Text>
                            <Text style={styles.xpValue}>{profile?.totalXP || 0} XP</Text>
                        </View>
                        <ProgressBar
                            progress={xpProgress}
                            color={colors.primary[600]}
                            style={styles.xpBar}
                        />
                        <Text style={styles.xpSubtext}>
                            {xpToNextLevel - currentLevelXP} XP to Level {(profile?.level || 1) + 1}
                        </Text>
                    </Card.Content>
                </Card>

                {/* Stats */}
                <View style={styles.statsContainer}>
                    <StatCard icon="trophy" value={profile?.competitiveEvents.length || 0} label="Events" color={colors.secondary[500]} />
                    <StatCard icon="ribbon" value={demoBadges.length} label="Badges" color={colors.primary[600]} />
                    <StatCard icon="flame" value={3} label="Streak" color={colors.warning.main} />
                </View>

                {/* Badges Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Badges</Text>
                        <TouchableOpacity>
                            <Text style={styles.seeAllText}>See All</Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <View style={styles.badgesRow}>
                            {demoBadges.map(badge => (
                                <View key={badge.id} style={styles.badgeItem}>
                                    <View style={[styles.badgeIcon, getRarityStyle(badge.rarity)]}>
                                        <Text style={styles.badgeEmoji}>{badge.icon}</Text>
                                    </View>
                                    <Text style={styles.badgeName} numberOfLines={1}>{badge.name}</Text>
                                </View>
                            ))}
                            <View style={styles.moreBadges}>
                                <Ionicons name="add" size={24} color={colors.neutral[400]} />
                                <Text style={styles.moreBadgesText}>12 more</Text>
                            </View>
                        </View>
                    </ScrollView>
                </View>

                {/* Interests */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Interests</Text>
                    <View style={styles.interestsContainer}>
                        {(profile?.interests || ['Business', 'Technology', 'Leadership']).map((interest, index) => (
                            <Chip key={index} style={styles.interestChip} textStyle={styles.interestChipText}>
                                {interest}
                            </Chip>
                        ))}
                    </View>
                </View>

                {/* Account Actions */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Account</Text>

                    <TouchableOpacity style={styles.menuItem}>
                        <View style={styles.menuItemLeft}>
                            <Ionicons name="person-outline" size={22} color={colors.neutral[600]} />
                            <Text style={styles.menuItemText}>Edit Profile</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={colors.neutral[400]} />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuItem}>
                        <View style={styles.menuItemLeft}>
                            <Ionicons name="notifications-outline" size={22} color={colors.neutral[600]} />
                            <Text style={styles.menuItemText}>Notifications</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={colors.neutral[400]} />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuItem}>
                        <View style={styles.menuItemLeft}>
                            <Ionicons name="shield-checkmark-outline" size={22} color={colors.neutral[600]} />
                            <Text style={styles.menuItemText}>Privacy</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={colors.neutral[400]} />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuItem}>
                        <View style={styles.menuItemLeft}>
                            <Ionicons name="help-circle-outline" size={22} color={colors.neutral[600]} />
                            <Text style={styles.menuItemText}>Help & Support</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={colors.neutral[400]} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.menuItem, styles.logoutItem]}
                        onPress={() => setShowLogoutModal(true)}
                    >
                        <View style={styles.menuItemLeft}>
                            <Ionicons name="log-out-outline" size={22} color={colors.error.main} />
                            <Text style={styles.logoutText}>Log Out</Text>
                        </View>
                    </TouchableOpacity>
                </View>

                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Logout Confirmation Modal */}
            <Portal>
                <Modal
                    visible={showLogoutModal}
                    onDismiss={() => setShowLogoutModal(false)}
                    contentContainerStyle={styles.modal}
                >
                    <Text style={styles.modalTitle}>Log Out?</Text>
                    <Text style={styles.modalText}>
                        Are you sure you want to log out of FBLA Connect?
                    </Text>
                    <View style={styles.modalActions}>
                        <Button
                            mode="outlined"
                            onPress={() => setShowLogoutModal(false)}
                            style={styles.modalButton}
                        >
                            Cancel
                        </Button>
                        <Button
                            mode="contained"
                            onPress={handleLogout}
                            buttonColor={colors.error.main}
                            style={styles.modalButton}
                        >
                            Log Out
                        </Button>
                    </View>
                </Modal>
            </Portal>
        </View>
    );
}

function StatCard({ icon, value, label, color }: { icon: string; value: number; label: string; color: string }) {
    return (
        <View style={styles.statCard}>
            <View style={[styles.statIconContainer, { backgroundColor: color + '20' }]}>
                <Ionicons name={icon as any} size={20} color={color} />
            </View>
            <Text style={styles.statValue}>{value}</Text>
            <Text style={styles.statLabel}>{label}</Text>
        </View>
    );
}

function getRarityStyle(rarity: string) {
    switch (rarity) {
        case 'common': return { backgroundColor: colors.neutral[200] };
        case 'uncommon': return { backgroundColor: colors.success.light };
        case 'rare': return { backgroundColor: colors.info.light };
        case 'epic': return { backgroundColor: '#E8D5FF' };
        case 'legendary': return { backgroundColor: colors.secondary[100] };
        default: return { backgroundColor: colors.neutral[200] };
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.neutral[50],
    },
    header: {
        backgroundColor: colors.primary[600],
        paddingTop: spacing.xl,
        paddingBottom: spacing.xxl,
        alignItems: 'center',
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
    },
    avatarContainer: {
        position: 'relative',
        marginBottom: spacing.md,
    },
    avatar: {
        backgroundColor: colors.secondary[500],
    },
    levelBadge: {
        position: 'absolute',
        bottom: -4,
        right: -4,
        backgroundColor: colors.secondary[500],
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        borderWidth: 3,
        borderColor: colors.primary[600],
    },
    levelText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    userName: {
        fontSize: typography.fontSize.xxl,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 4,
    },
    userRole: {
        fontSize: typography.fontSize.md,
        color: 'rgba(255, 255, 255, 0.9)',
        marginBottom: spacing.sm,
    },
    chapterInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
        borderRadius: borderRadius.full,
    },
    chapterText: {
        fontSize: typography.fontSize.sm,
        color: '#FFFFFF',
        marginLeft: spacing.xs,
    },
    xpCard: {
        margin: spacing.md,
        marginTop: -spacing.xl,
        borderRadius: borderRadius.lg,
        backgroundColor: '#FFFFFF',
        ...shadows.md,
    },
    xpHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    xpTitle: {
        fontSize: typography.fontSize.md,
        fontWeight: '600',
        color: colors.neutral[800],
    },
    xpValue: {
        fontSize: typography.fontSize.lg,
        fontWeight: 'bold',
        color: colors.primary[600],
    },
    xpBar: {
        height: 8,
        borderRadius: 4,
        backgroundColor: colors.neutral[200],
    },
    xpSubtext: {
        fontSize: typography.fontSize.sm,
        color: colors.neutral[500],
        marginTop: spacing.sm,
        textAlign: 'center',
    },
    statsContainer: {
        flexDirection: 'row',
        paddingHorizontal: spacing.md,
        gap: spacing.md,
    },
    statCard: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        padding: spacing.md,
        borderRadius: borderRadius.lg,
        alignItems: 'center',
        ...shadows.sm,
    },
    statIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    statValue: {
        fontSize: typography.fontSize.xl,
        fontWeight: 'bold',
        color: colors.neutral[900],
    },
    statLabel: {
        fontSize: typography.fontSize.xs,
        color: colors.neutral[500],
    },
    section: {
        padding: spacing.md,
        paddingTop: spacing.lg,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    sectionTitle: {
        fontSize: typography.fontSize.lg,
        fontWeight: '600',
        color: colors.neutral[800],
        marginBottom: spacing.md,
    },
    seeAllText: {
        fontSize: typography.fontSize.sm,
        color: colors.primary[600],
        fontWeight: '500',
    },
    badgesRow: {
        flexDirection: 'row',
        gap: spacing.md,
    },
    badgeItem: {
        alignItems: 'center',
        width: 70,
    },
    badgeIcon: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.xs,
    },
    badgeEmoji: {
        fontSize: 28,
    },
    badgeName: {
        fontSize: typography.fontSize.xs,
        color: colors.neutral[600],
        textAlign: 'center',
    },
    moreBadges: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: colors.neutral[100],
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderStyle: 'dashed',
        borderColor: colors.neutral[300],
    },
    moreBadgesText: {
        fontSize: 10,
        color: colors.neutral[400],
    },
    interestsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.sm,
    },
    interestChip: {
        backgroundColor: colors.primary[50],
    },
    interestChipText: {
        color: colors.primary[700],
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#FFFFFF',
        padding: spacing.md,
        borderRadius: borderRadius.md,
        marginBottom: spacing.sm,
    },
    menuItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    menuItemText: {
        fontSize: typography.fontSize.md,
        color: colors.neutral[700],
        marginLeft: spacing.md,
    },
    logoutItem: {
        marginTop: spacing.md,
    },
    logoutText: {
        fontSize: typography.fontSize.md,
        color: colors.error.main,
        marginLeft: spacing.md,
    },
    modal: {
        backgroundColor: '#FFFFFF',
        margin: spacing.lg,
        borderRadius: borderRadius.xl,
        padding: spacing.lg,
    },
    modalTitle: {
        fontSize: typography.fontSize.xl,
        fontWeight: 'bold',
        color: colors.neutral[900],
        marginBottom: spacing.sm,
        textAlign: 'center',
    },
    modalText: {
        fontSize: typography.fontSize.md,
        color: colors.neutral[600],
        textAlign: 'center',
        marginBottom: spacing.lg,
    },
    modalActions: {
        flexDirection: 'row',
        gap: spacing.md,
    },
    modalButton: {
        flex: 1,
    },
});
