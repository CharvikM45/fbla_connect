// FBLA Connect - Profile Screen
import React, { useState } from 'react';
import {
    View,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Dimensions,
    TextInput,
} from 'react-native';
import { Text, Avatar, Card, Button, ProgressBar, Chip, Portal, Modal, Switch } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useAppSelector, useAppDispatch } from '../../../shared/hooks/useRedux';
import { logout } from '../../auth/authSlice';
import { colors, spacing, typography, borderRadius, shadows } from '../../../shared/theme';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    useAnimatedSensor,
    SensorType,
    interpolate
} from 'react-native-reanimated';
import { View as MotiView } from 'moti';
import { AnimatedButton } from '../../../shared/components/AnimatedButton';
import { LinearGradient } from 'expo-linear-gradient';

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";

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
    const reduxUser = useAppSelector(state => state.auth.user);
    const reduxProfile = useAppSelector(state => state.profile.profile);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showNotificationsModal, setShowNotificationsModal] = useState(false);
    const [showPrivacyModal, setShowPrivacyModal] = useState(false);
    const [showHelpModal, setShowHelpModal] = useState(false);
    const [showAllBadgesModal, setShowAllBadgesModal] = useState(false);

    // Convex Query
    const convexUser = useQuery(api.users.currentUser);
    const user = convexUser || reduxUser;
    // For simplicity, we assume profile is linked or fetched separately if needed, 
    // but here we use the user object which contains profile fields in our schema
    const profile = convexUser ? {
        totalXP: (convexUser as any).totalXP || 0,
        level: (convexUser as any).level || 1,
        badges: (convexUser as any).badges || [],
        interests: (convexUser as any).interests || [],
        bio: (convexUser as any).bio || '',
        competitiveEvents: [],
    } : reduxProfile;

    // Edit form state
    const [editForm, setEditForm] = useState({
        displayName: user?.displayName || '',
        bio: profile?.bio || '',
    });

    // Settings state
    const [notificationSettings, setNotificationSettings] = useState({
        eventReminders: true,
        newsUpdates: true,
        competitionAlerts: true,
        chapterAnnouncements: true,
    });

    const [privacySettings, setPrivacySettings] = useState({
        profileVisibility: 'public',
        showEmail: false,
        showChapter: true,
    });

    const xpToNextLevel = 1000;
    const currentLevelXP = (profile?.totalXP || 0) % xpToNextLevel;
    const xpProgress = currentLevelXP / xpToNextLevel;

    const handleLogout = () => {
        dispatch(logout());
        setShowLogoutModal(false);
    };

    const handleSaveProfile = () => {
        // TODO: Dispatch action to update profile in Redux
        console.log('Saving profile:', editForm);
        setShowEditModal(false);
    };

    const tiltX = useSharedValue(0);
    const tiltY = useSharedValue(0);

    const animatedTiltStyle = useAnimatedStyle(() => {
        return {
            transform: [
                { perspective: 1000 },
                { rotateX: `${tiltX.value * 10}deg` },
                { rotateY: `${tiltY.value * 10}deg` },
                { scale: withSpring(1.02) }
            ],
        };
    });

    const handleTilt = (event: any) => {
        const { locationX, locationY } = event.nativeEvent;
        const centerX = width / 2;
        const centerY = 100; // Approx middle of card
        tiltX.value = withSpring((locationY - centerY) / 100);
        tiltY.value = withSpring((centerX - locationX) / 100);
    };

    const resetTilt = () => {
        tiltX.value = withSpring(0);
        tiltY.value = withSpring(0);
    };

    return (
        <View style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Profile Header with Lava Gradient */}
                <MotiView
                    from={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: 'timing', duration: 800 }}
                >
                    <LinearGradient
                        colors={[colors.primary[600], colors.secondary[600], colors.primary[700]]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.header}
                    >
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
                                <Ionicons name="people" size={14} color="#FFFFFF" />
                                <Text style={styles.chapterText}>{user.chapterName}</Text>
                            </View>
                        )}
                    </LinearGradient>
                </MotiView>

                {/* 3D XP Card */}
                <Animated.View
                    style={[styles.xpCardContainer, animatedTiltStyle]}
                    onTouchMove={handleTilt}
                    onTouchEnd={resetTilt}
                >
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
                </Animated.View>

                {/* Stats */}
                <View style={styles.statsContainer}>
                    <StatCard icon="trophy" value={profile?.competitiveEvents.length || 0} label="Events" color={colors.secondary[500]} delay={100} />
                    <StatCard icon="ribbon" value={demoBadges.length} label="Badges" color={colors.primary[600]} delay={200} />
                    <StatCard icon="flame" value={3} label="Streak" color={colors.warning.main} delay={300} />
                </View>

                {/* Badges Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Badges</Text>
                        <TouchableOpacity onPress={() => setShowAllBadgesModal(true)}>
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
                        {(profile?.interests || ['Business', 'Technology', 'Leadership']).map((interest: string, index: number) => (
                            <Chip key={index} style={styles.interestChip} textStyle={styles.interestChipText}>
                                {interest}
                            </Chip>
                        ))}
                    </View>
                </View>

                {/* Account Actions */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Account</Text>

                    <TouchableOpacity style={styles.menuItem} onPress={() => setShowEditModal(true)}>
                        <View style={styles.menuItemLeft}>
                            <Ionicons name="person-outline" size={22} color={colors.neutral[600]} />
                            <Text style={styles.menuItemText}>Edit Profile</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={colors.neutral[400]} />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuItem} onPress={() => setShowNotificationsModal(true)}>
                        <View style={styles.menuItemLeft}>
                            <Ionicons name="notifications-outline" size={22} color={colors.neutral[600]} />
                            <Text style={styles.menuItemText}>Notifications</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={colors.neutral[400]} />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuItem} onPress={() => setShowPrivacyModal(true)}>
                        <View style={styles.menuItemLeft}>
                            <Ionicons name="shield-checkmark-outline" size={22} color={colors.neutral[600]} />
                            <Text style={styles.menuItemText}>Privacy</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={colors.neutral[400]} />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuItem} onPress={() => setShowHelpModal(true)}>
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

                {/* Edit Profile Modal */}
                <Modal
                    visible={showEditModal}
                    onDismiss={() => setShowEditModal(false)}
                    contentContainerStyle={styles.modal}
                >
                    <Text style={styles.modalTitle}>Edit Profile</Text>
                    <View style={styles.formGroup}>
                        <Text style={styles.formLabel}>Display Name</Text>
                        <TextInput
                            style={styles.textInput}
                            value={editForm.displayName}
                            onChangeText={(text) => setEditForm({ ...editForm, displayName: text })}
                            placeholder="Enter your name"
                        />
                    </View>
                    <View style={styles.formGroup}>
                        <Text style={styles.formLabel}>Bio</Text>
                        <TextInput
                            style={[styles.textInput, styles.textArea]}
                            value={editForm.bio}
                            onChangeText={(text) => setEditForm({ ...editForm, bio: text })}
                            placeholder="Tell us about yourself"
                            multiline
                            numberOfLines={4}
                        />
                    </View>
                    <View style={styles.modalActions}>
                        <Button
                            mode="outlined"
                            onPress={() => setShowEditModal(false)}
                            style={styles.modalButton}
                        >
                            Cancel
                        </Button>
                        <Button
                            mode="contained"
                            onPress={handleSaveProfile}
                            style={styles.modalButton}
                        >
                            Save
                        </Button>
                    </View>
                </Modal>

                {/* Notifications Settings Modal */}
                <Modal
                    visible={showNotificationsModal}
                    onDismiss={() => setShowNotificationsModal(false)}
                    contentContainerStyle={styles.modal}
                >
                    <Text style={styles.modalTitle}>Notification Settings</Text>
                    <View style={styles.settingItem}>
                        <Text style={styles.settingLabel}>Event Reminders</Text>
                        <Switch
                            value={notificationSettings.eventReminders}
                            onValueChange={(value) => setNotificationSettings({ ...notificationSettings, eventReminders: value })}
                        />
                    </View>
                    <View style={styles.settingItem}>
                        <Text style={styles.settingLabel}>News Updates</Text>
                        <Switch
                            value={notificationSettings.newsUpdates}
                            onValueChange={(value) => setNotificationSettings({ ...notificationSettings, newsUpdates: value })}
                        />
                    </View>
                    <View style={styles.settingItem}>
                        <Text style={styles.settingLabel}>Competition Alerts</Text>
                        <Switch
                            value={notificationSettings.competitionAlerts}
                            onValueChange={(value) => setNotificationSettings({ ...notificationSettings, competitionAlerts: value })}
                        />
                    </View>
                    <View style={styles.settingItem}>
                        <Text style={styles.settingLabel}>Chapter Announcements</Text>
                        <Switch
                            value={notificationSettings.chapterAnnouncements}
                            onValueChange={(value) => setNotificationSettings({ ...notificationSettings, chapterAnnouncements: value })}
                        />
                    </View>
                    <Button
                        mode="contained"
                        onPress={() => setShowNotificationsModal(false)}
                        style={{ marginTop: spacing.md }}
                    >
                        Done
                    </Button>
                </Modal>

                {/* Privacy Settings Modal */}
                <Modal
                    visible={showPrivacyModal}
                    onDismiss={() => setShowPrivacyModal(false)}
                    contentContainerStyle={styles.modal}
                >
                    <Text style={styles.modalTitle}>Privacy Settings</Text>
                    <View style={styles.settingItem}>
                        <Text style={styles.settingLabel}>Show Email</Text>
                        <Switch
                            value={privacySettings.showEmail}
                            onValueChange={(value) => setPrivacySettings({ ...privacySettings, showEmail: value })}
                        />
                    </View>
                    <View style={styles.settingItem}>
                        <Text style={styles.settingLabel}>Show Chapter</Text>
                        <Switch
                            value={privacySettings.showChapter}
                            onValueChange={(value) => setPrivacySettings({ ...privacySettings, showChapter: value })}
                        />
                    </View>
                    <View style={styles.formGroup}>
                        <Text style={styles.formLabel}>Profile Visibility</Text>
                        <Text style={styles.settingSubtext}>
                            Current: {privacySettings.profileVisibility === 'public' ? 'Public' : privacySettings.profileVisibility === 'chapter' ? 'Chapter Only' : 'Private'}
                        </Text>
                    </View>
                    <Button
                        mode="contained"
                        onPress={() => setShowPrivacyModal(false)}
                        style={{ marginTop: spacing.md }}
                    >
                        Done
                    </Button>
                </Modal>

                {/* Help & Support Modal */}
                <Modal
                    visible={showHelpModal}
                    onDismiss={() => setShowHelpModal(false)}
                    contentContainerStyle={styles.modal}
                >
                    <Text style={styles.modalTitle}>Help & Support</Text>
                    <TouchableOpacity style={styles.helpItem}>
                        <Ionicons name="document-text-outline" size={20} color={colors.primary[600]} />
                        <Text style={styles.helpText}>FAQ</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.helpItem}>
                        <Ionicons name="mail-outline" size={20} color={colors.primary[600]} />
                        <Text style={styles.helpText}>Contact Support</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.helpItem}>
                        <Ionicons name="information-circle-outline" size={20} color={colors.primary[600]} />
                        <Text style={styles.helpText}>About FBLA Connect</Text>
                    </TouchableOpacity>
                    <View style={styles.versionInfo}>
                        <Text style={styles.versionText}>Version 1.0.0</Text>
                    </View>
                    <Button
                        mode="contained"
                        onPress={() => setShowHelpModal(false)}
                        style={{ marginTop: spacing.md }}
                    >
                        Close
                    </Button>
                </Modal>

                {/* All Badges Modal */}
                <Modal
                    visible={showAllBadgesModal}
                    onDismiss={() => setShowAllBadgesModal(false)}
                    contentContainerStyle={styles.modal}
                >
                    <Text style={styles.modalTitle}>All Badges</Text>
                    <ScrollView style={styles.badgesGrid}>
                        <View style={styles.badgesGridContainer}>
                            {demoBadges.map(badge => (
                                <View key={badge.id} style={styles.badgeGridItem}>
                                    <View style={[styles.badgeIcon, getRarityStyle(badge.rarity)]}>
                                        <Text style={styles.badgeEmoji}>{badge.icon}</Text>
                                    </View>
                                    <Text style={styles.badgeName} numberOfLines={2}>{badge.name}</Text>
                                    <Text style={styles.badgeDescription} numberOfLines={2}>{badge.description}</Text>
                                </View>
                            ))}
                        </View>
                    </ScrollView>
                    <Button
                        mode="contained"
                        onPress={() => setShowAllBadgesModal(false)}
                        style={{ marginTop: spacing.md }}
                    >
                        Close
                    </Button>
                </Modal>
            </Portal>
        </View>
    );
}

function StatCard({ icon, value, label, color, delay = 0 }: { icon: string; value: number; label: string; color: string; delay?: number }) {
    return (
        <MotiView
            from={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', delay }}
            style={styles.statCard}
        >
            <View style={[styles.statIconContainer, { backgroundColor: color + '20' }]}>
                <Ionicons name={icon as any} size={20} color={color} />
            </View>
            <Text style={styles.statValue}>{value}</Text>
            <Text style={styles.statLabel}>{label}</Text>
        </MotiView>
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
        paddingTop: spacing.xl,
        paddingBottom: spacing.xxl,
        alignItems: 'center',
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        overflow: 'hidden',
    },
    avatarContainer: {
        position: 'relative',
        marginBottom: spacing.md,
    },
    avatar: {
        backgroundColor: '#FFFFFF',
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
    xpCardContainer: {
        margin: spacing.md,
        marginTop: -spacing.xl,
        zIndex: 10,
    },
    xpCard: {
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
    formGroup: {
        marginBottom: spacing.md,
    },
    formLabel: {
        fontSize: typography.fontSize.sm,
        fontWeight: '600',
        color: colors.neutral[700],
        marginBottom: spacing.xs,
    },
    textInput: {
        borderWidth: 1,
        borderColor: colors.neutral[300],
        borderRadius: borderRadius.md,
        padding: spacing.md,
        fontSize: typography.fontSize.md,
        color: colors.neutral[900],
        backgroundColor: '#FFFFFF',
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    settingItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.neutral[100],
    },
    settingLabel: {
        fontSize: typography.fontSize.md,
        color: colors.neutral[700],
    },
    settingSubtext: {
        fontSize: typography.fontSize.sm,
        color: colors.neutral[500],
        marginTop: spacing.xs,
    },
    helpItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.neutral[100],
    },
    helpText: {
        fontSize: typography.fontSize.md,
        color: colors.neutral[700],
        marginLeft: spacing.md,
    },
    versionInfo: {
        marginTop: spacing.lg,
        alignItems: 'center',
    },
    versionText: {
        fontSize: typography.fontSize.sm,
        color: colors.neutral[400],
    },
    badgesGrid: {
        maxHeight: 400,
    },
    badgesGridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.md,
    },
    badgeGridItem: {
        width: '45%',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    badgeDescription: {
        fontSize: 10,
        color: colors.neutral[500],
        textAlign: 'center',
        marginTop: spacing.xs,
    },
});
