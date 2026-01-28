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
import { MotiView } from 'moti';
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ProfileStackParamList } from '../../../shared/navigation/types';

const { width } = Dimensions.get('window');

// Demo badges
const demoBadges = [
    { id: '1', name: 'First Meeting', icon: '🎉', description: 'Attended your first chapter meeting', rarity: 'common' },
    { id: '2', name: 'Early Bird', icon: '🌅', description: 'Arrived early to an event', rarity: 'common' },
    { id: '3', name: 'Competitor', icon: '🏆', description: 'Participated in a competitive event', rarity: 'uncommon' },
    { id: '4', name: 'Team Player', icon: '🤝', description: 'Collaborated on a team event', rarity: 'uncommon' },
];

type NavigationProp = NativeStackNavigationProp<ProfileStackParamList>;

export default function ProfileScreen() {
    const dispatch = useAppDispatch();
    const navigation = useNavigation<NavigationProp>();
    const reduxUser = useAppSelector(state => state.auth.user);
    const reduxProfile = useAppSelector(state => state.profile.profile);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showNotificationsModal, setShowNotificationsModal] = useState(false);
    const [showPrivacyModal, setShowPrivacyModal] = useState(false);
    const [showHelpModal, setShowHelpModal] = useState(false);
    const [showAllBadgesModal, setShowAllBadgesModal] = useState(false);

    // Convex Queries
    const convexUser = useQuery(api.users.currentUser);
    const convexProfile = useQuery(api.profiles.getCurrentUserProfile);
    const user = convexUser || reduxUser;

    const profile = convexProfile && convexUser ? {
        totalXP: convexProfile.totalXP || 0,
        level: convexProfile.level || 1,
        badges: convexProfile.badges || [],
        interests: convexUser.interests || [],
        bio: convexUser.bio || '',
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

    const updateConvexUser = useMutation(api.users.updateUser);

    const handleSaveProfile = async () => {
        try {
            await updateConvexUser({
                displayName: editForm.displayName,
                bio: editForm.bio,
            });
            setShowEditModal(false);
        } catch (error) {
            console.error('Failed to update profile in Convex:', error);
            setShowEditModal(false);
        }
    };

    return (
        <View style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Profile Header */}
                <View style={styles.header}>
                    <View style={styles.avatarRow}>
                        <View style={styles.avatarContainer}>
                            <Avatar.Text
                                size={90}
                                label={user?.displayName?.charAt(0) || 'U'}
                                style={styles.avatar}
                                color="#FFFFFF"
                            />
                            <View style={styles.levelBadge}>
                                <Text style={styles.levelText}>Lv {profile?.level || 1}</Text>
                            </View>
                        </View>
                        <View style={styles.headerInfo}>
                            <Text style={styles.userName}>{user?.displayName || 'FBLA Member'}</Text>
                            <Text style={styles.userRole}>
                                {user?.role === 'officer' ? 'Chapter Officer' :
                                    user?.role === 'adviser' ? 'Adviser' : 'FBLA Member'}
                            </Text>
                            {user?.chapterName && (
                                <View style={styles.chapterTag}>
                                    <Ionicons name="people" size={12} color="rgba(255,255,255,0.7)" />
                                    <Text style={styles.chapterText}>{user.chapterName}</Text>
                                </View>
                            )}
                        </View>
                    </View>
                </View>

                {/* Progress Card */}
                <View style={styles.xpCardContainer}>
                    <Card style={styles.xpCard}>
                        <Card.Content>
                            <View style={styles.xpHeader}>
                                <Text style={styles.xpTitle}>Journey Progress</Text>
                                <Text style={styles.xpValue}>{profile?.totalXP || 0} XP</Text>
                            </View>
                            <View style={styles.progressBarContainer}>
                                <View style={[styles.progressBarFill, { width: `${xpProgress * 100}%` }]} />
                            </View>
                            <Text style={styles.xpSubtext}>
                                {xpToNextLevel - currentLevelXP} XP to Level {(profile?.level || 1) + 1}
                            </Text>
                        </Card.Content>
                    </Card>
                </View>

                {/* Stats */}
                <View style={styles.statsContainer}>
                    <StatCard icon="trophy" value={profile?.competitiveEvents.length || 0} label="Events" color={colors.primary[600]} />
                    <StatCard icon="ribbon" value={demoBadges.length} label="Badges" color={colors.secondary[500]} />
                    <StatCard icon="flame" value={3} label="Streak" color={colors.warning.main} />
                </View>

                {/* Badges Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Achievements</Text>
                        <TouchableOpacity onPress={() => setShowAllBadgesModal(true)}>
                            <Text style={styles.seeAllText}>See All</Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.badgesRow}>
                        {demoBadges.map((badge, index) => (
                            <View key={badge.id} style={styles.badgeItem}>
                                <View style={styles.badgeCircle}>
                                    <Text style={styles.badgeEmoji}>{badge.icon}</Text>
                                </View>
                                <Text style={styles.badgeName} numberOfLines={1}>{badge.name}</Text>
                            </View>
                        ))}
                        <TouchableOpacity style={styles.moreBadges} onPress={() => setShowAllBadgesModal(true)}>
                            <Ionicons name="add" size={24} color={colors.neutral[400]} />
                        </TouchableOpacity>
                    </ScrollView>
                </View>

                {/* Interests */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Interests & Topics</Text>
                    <View style={styles.interestsContainer}>
                        {(profile?.interests || ['Business', 'Technology', 'Leadership']).map((interest: string, index: number) => (
                            <View key={index} style={styles.interestChip}>
                                <Text style={styles.interestChipText}>{interest}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Account Actions */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Account Settings</Text>
                    <Card style={styles.menuCard}>
                        <TouchableOpacity style={styles.menuItem} onPress={() => setShowEditModal(true)}>
                            <View style={styles.menuItemLeft}>
                                <View style={[styles.menuIconContainer, { backgroundColor: colors.primary[50] }]}>
                                    <Ionicons name="person-outline" size={20} color={colors.primary[600]} />
                                </View>
                                <Text style={styles.menuItemText}>Edit Profile</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={18} color={colors.neutral[300]} />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.menuItem} onPress={() => setShowNotificationsModal(true)}>
                            <View style={styles.menuItemLeft}>
                                <View style={[styles.menuIconContainer, { backgroundColor: '#F0F9FF' }]}>
                                    <Ionicons name="notifications-outline" size={20} color="#0EA5E9" />
                                </View>
                                <Text style={styles.menuItemText}>Notifications</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={18} color={colors.neutral[300]} />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.menuItem} onPress={() => setShowPrivacyModal(true)}>
                            <View style={styles.menuItemLeft}>
                                <View style={[styles.menuIconContainer, { backgroundColor: '#FDF2F8' }]}>
                                    <Ionicons name="shield-checkmark-outline" size={20} color="#EC4899" />
                                </View>
                                <Text style={styles.menuItemText}>Privacy</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={18} color={colors.neutral[300]} />
                        </TouchableOpacity>

                        {user?.role === 'adviser' && (
                            <>
                                <TouchableOpacity
                                    style={styles.menuItem}
                                    onPress={() => navigation.navigate('AdvisorDashboard')}
                                >
                                    <View style={styles.menuItemLeft}>
                                        <View style={[styles.menuIconContainer, { backgroundColor: colors.primary[50] }]}>
                                            <Ionicons name="grid-outline" size={20} color={colors.primary[600]} />
                                        </View>
                                        <Text style={styles.menuItemText}>Advisor Dashboard</Text>
                                    </View>
                                    <Ionicons name="chevron-forward" size={18} color={colors.neutral[300]} />
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.menuItem}
                                    onPress={() => navigation.navigate('ChapterManagement')}
                                >
                                    <View style={styles.menuItemLeft}>
                                        <View style={[styles.menuIconContainer, { backgroundColor: colors.primary[50] }]}>
                                            <Ionicons name="people-outline" size={20} color={colors.primary[600]} />
                                        </View>
                                        <Text style={styles.menuItemText}>Manage Chapter</Text>
                                    </View>
                                    <Ionicons name="chevron-forward" size={18} color={colors.neutral[300]} />
                                </TouchableOpacity>
                            </>
                        )}

                        <TouchableOpacity style={[styles.menuItem, { borderBottomWidth: 0 }]} onPress={() => setShowLogoutModal(true)}>
                            <View style={styles.menuItemLeft}>
                                <View style={[styles.menuIconContainer, { backgroundColor: colors.error.light + '20' }]}>
                                    <Ionicons name="log-out-outline" size={20} color={colors.error.main} />
                                </View>
                                <Text style={[styles.menuItemText, { color: colors.error.main }]}>Log Out</Text>
                            </View>
                        </TouchableOpacity>
                    </Card>
                </View>

                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Modals are kept similar but styled for light theme */}
            <Portal>
                {/* Logout Modal */}
                <Modal visible={showLogoutModal} onDismiss={() => setShowLogoutModal(false)} contentContainerStyle={styles.modal}>
                    <Text style={styles.modalTitle}>Log Out</Text>
                    <Text style={styles.modalText}>Are you sure you want to log out?</Text>
                    <View style={styles.modalActions}>
                        <Button mode="outlined" onPress={() => setShowLogoutModal(false)} style={styles.modalButton}>Cancel</Button>
                        <Button mode="contained" onPress={handleLogout} buttonColor={colors.error.main} style={styles.modalButton}>Log Out</Button>
                    </View>
                </Modal>
                {/* Edit Profile Modal */}
                <Modal visible={showEditModal} onDismiss={() => setShowEditModal(false)} contentContainerStyle={styles.modal}>
                    <Text style={styles.modalTitle}>Edit Profile</Text>
                    <View style={styles.formGroup}>
                        <Text style={styles.formLabel}>Display Name</Text>
                        <TextInput
                            style={styles.textInput}
                            value={editForm.displayName}
                            onChangeText={(text) => setEditForm({ ...editForm, displayName: text })}
                        />
                    </View>
                    <View style={styles.formGroup}>
                        <Text style={styles.formLabel}>Bio</Text>
                        <TextInput
                            style={[styles.textInput, styles.textArea]}
                            value={editForm.bio}
                            onChangeText={(text) => setEditForm({ ...editForm, bio: text })}
                            multiline
                            numberOfLines={3}
                        />
                    </View>
                    <View style={styles.modalActions}>
                        <Button mode="outlined" onPress={() => setShowEditModal(false)} style={styles.modalButton}>Cancel</Button>
                        <Button mode="contained" onPress={handleSaveProfile} style={styles.modalButton}>Save</Button>
                    </View>
                </Modal>
            </Portal>
        </View>
    );
}

function StatCard({ icon, value, label, color }: { icon: string; value: number; label: string; color: string }) {
    return (
        <Card style={styles.statCard}>
            <Card.Content style={styles.statContent}>
                <View style={[styles.statIconContainer, { backgroundColor: color + '15' }]}>
                    <Ionicons name={icon as any} size={20} color={color} />
                </View>
                <Text style={styles.statValue}>{value}</Text>
                <Text style={styles.statLabel}>{label}</Text>
            </Card.Content>
        </Card>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.neutral[50],
    },
    header: {
        backgroundColor: colors.primary[600],
        paddingTop: spacing.xl * 2,
        paddingBottom: spacing.xxl,
        paddingHorizontal: spacing.lg,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    avatarRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatarContainer: {
        position: 'relative',
    },
    avatar: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderWidth: 3,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    levelBadge: {
        position: 'absolute',
        bottom: -4,
        right: -4,
        backgroundColor: colors.secondary[500],
        paddingHorizontal: 8,
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
    headerInfo: {
        marginLeft: spacing.lg,
        flex: 1,
    },
    userName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    userRole: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.8)',
        marginTop: 2,
    },
    chapterTag: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 6,
        backgroundColor: 'rgba(255,255,255,0.1)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20,
        alignSelf: 'flex-start',
    },
    chapterText: {
        fontSize: 11,
        color: '#FFFFFF',
        marginLeft: 4,
        fontWeight: '600',
    },
    xpCardContainer: {
        marginHorizontal: spacing.md,
        marginTop: -spacing.xl,
    },
    xpCard: {
        borderRadius: 20,
        elevation: 4,
        backgroundColor: '#FFFFFF',
    },
    xpHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    xpTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        color: colors.neutral[400],
        textTransform: 'uppercase',
    },
    xpValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.neutral[900],
    },
    progressBarContainer: {
        height: 8,
        backgroundColor: colors.neutral[100],
        borderRadius: 4,
        overflow: 'hidden',
        marginBottom: spacing.xs,
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: colors.primary[600],
    },
    xpSubtext: {
        fontSize: 11,
        color: colors.neutral[400],
        textAlign: 'center',
    },
    statsContainer: {
        flexDirection: 'row',
        padding: spacing.md,
        gap: spacing.sm,
    },
    statCard: {
        flex: 1,
        borderRadius: 15,
        backgroundColor: '#FFFFFF',
        elevation: 2,
    },
    statContent: {
        alignItems: 'center',
        padding: spacing.sm,
    },
    statIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    statValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.neutral[900],
    },
    statLabel: {
        fontSize: 10,
        color: colors.neutral[500],
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    section: {
        paddingHorizontal: spacing.md,
        marginBottom: spacing.lg,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.neutral[900],
    },
    seeAllText: {
        fontSize: 13,
        color: colors.primary[600],
        fontWeight: 'bold',
    },
    badgesRow: {
        gap: spacing.md,
    },
    badgeItem: {
        alignItems: 'center',
        width: 60,
    },
    badgeCircle: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 2,
        marginBottom: 6,
    },
    badgeEmoji: {
        fontSize: 24,
    },
    badgeName: {
        fontSize: 10,
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
        borderWidth: 1,
        borderColor: colors.neutral[200],
        borderStyle: 'dashed',
    },
    interestsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.xs,
    },
    interestChip: {
        backgroundColor: colors.primary[50],
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    interestChipText: {
        color: colors.primary[700],
        fontSize: 12,
        fontWeight: '600',
    },
    menuCard: {
        borderRadius: 20,
        backgroundColor: '#FFFFFF',
        elevation: 2,
        overflow: 'hidden',
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: colors.neutral[50],
    },
    menuItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    menuIconContainer: {
        width: 36,
        height: 36,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.md,
    },
    menuItemText: {
        fontSize: 15,
        fontWeight: '600',
        color: colors.neutral[800],
    },
    modal: {
        backgroundColor: '#FFFFFF',
        margin: 20,
        padding: spacing.lg,
        borderRadius: 20,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: spacing.sm,
        textAlign: 'center',
    },
    modalText: {
        fontSize: 15,
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
        fontSize: 14,
        fontWeight: 'bold',
        color: colors.neutral[700],
        marginBottom: 6,
    },
    textInput: {
        backgroundColor: colors.neutral[50],
        borderWidth: 1,
        borderColor: colors.neutral[200],
        borderRadius: 10,
        padding: spacing.md,
        fontSize: 15,
    },
    textArea: {
        height: 80,
        textAlignVertical: 'top',
    },
});
