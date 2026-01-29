// FBLA Connect - Profile Screen
import React, { useState, useMemo } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, Dimensions, TextInput, Keyboard, SafeAreaView, Modal as RNModal } from 'react-native';
import { Text, Avatar, Card, Button, ProgressBar, Chip, Portal, Modal, Switch, Divider, List } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useAppSelector, useAppDispatch } from '../../../shared/hooks/useRedux';
import { logout } from '../../auth/authSlice';
import { colors, spacing, typography, borderRadius, shadows, glows, gradients } from '../../../shared/theme';
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
import { GlassCard } from '../../../shared/components/GlassCard';
import { GlowView } from '../../../shared/components/GlowView';
import { StaggeredList } from '../../../shared/components/StaggeredList';
import { Image } from 'react-native';
import { interestSubsets } from '../../../shared/constants/interests';
import EventSelector from '../../../shared/components/EventSelector';

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ProfileStackParamList } from '../../../shared/navigation/types';

type NavigationProp = NativeStackNavigationProp<ProfileStackParamList>;

// Import scraped data
const CHAPTER_DATA = require('../../../assets/data/chapters_dataset.json') as Chapter[];

interface Chapter {
    name: string;
    location: string;
    state: string;
    advisor: string;
}

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

    // Convex Queries
    const convexUser = useQuery(api.users.currentUser);
    const convexProfile = useQuery(api.profiles.getCurrentUserProfile);
    const allEvents = useQuery(api.competitive_events.getEvents, {});
    const updateConvexUser = useMutation(api.users.updateUser);
    const addXP = useMutation(api.profiles.addXP);

    const navigation = useNavigation<NavigationProp>();

    const user = convexUser || reduxUser;

    const profile = (convexProfile && convexUser) ? {
        totalXP: convexProfile.totalXP || 0,
        level: convexProfile.level || 1,
        badges: convexProfile.badges || [],
        interests: convexUser.interests || [],
        bio: convexUser.bio || '',
        competitiveEvents: (convexUser as any).competitiveEvents || [],
    } : reduxProfile;

    // Edit form state
    const [editForm, setEditForm] = useState({
        displayName: user?.displayName || '',
        bio: profile?.bio || '',
        schoolName: (user as any)?.schoolName || '',
        chapterName: (user as any)?.chapterName || '',
        state: (user as any)?.state || '',
        competitiveEvents: (user as any)?.competitiveEvents || [],
        interests: (user as any)?.interests || [],
    });

    // Chapter search state
    const [searchQuery, setSearchQuery] = useState('');
    const [showResults, setShowResults] = useState(false);

    const filteredChapters = useMemo(() => {
        if (searchQuery.length < 3) return [];
        if (!Array.isArray(CHAPTER_DATA)) return [];

        return CHAPTER_DATA.filter((chapter: Chapter) => {
            const name = chapter?.name?.toLowerCase() || '';
            const location = chapter?.location?.toLowerCase() || '';
            const query = searchQuery.toLowerCase();
            return name.includes(query) || location.includes(query);
        }).slice(0, 10); // Limit results for performance
    }, [searchQuery]);

    const handleSelectChapter = (chapter: Chapter) => {
        setEditForm(prev => ({
            ...prev,
            schoolName: chapter.name,
            chapterName: chapter.name,
            state: chapter.location?.split(',')[1]?.trim() || chapter.state || ''
        }));
        setSearchQuery('');
        setShowResults(false);
        Keyboard.dismiss();
    };

    const handleClearChapter = () => {
        setEditForm(prev => ({
            ...prev,
            schoolName: '',
            chapterName: '',
            state: '',
            interests: prev.interests,
            competitiveEvents: prev.competitiveEvents,
        }));
        setSearchQuery('');
    };

    // Initialize form when modal opens
    React.useEffect(() => {
        if (showEditModal && user) {
            setEditForm({
                displayName: user.displayName || '',
                bio: profile?.bio || '',
                schoolName: (user as any)?.schoolName || '',
                chapterName: (user as any)?.chapterName || '',
                state: (user as any)?.state || '',
                competitiveEvents: (user as any)?.competitiveEvents || [],
                interests: (user as any)?.interests || [],
            });
        }
    }, [showEditModal, user, profile]);

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

    const handleSaveProfile = async () => {
        try {
            await updateConvexUser({
                displayName: editForm.displayName,
                // bio: editForm.bio, // Depending on schema
                schoolName: editForm.schoolName,
                chapterName: editForm.chapterName,
                state: editForm.state,
                competitiveEvents: editForm.competitiveEvents,
                interests: editForm.interests,
            });
            setShowEditModal(false);
        } catch (error) {
            console.error("Failed to update profile:", error);
        }
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
                {/* Profile Header with Glow and 3D feel */}
                <MotiView
                    from={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1000 }}
                >
                    <LinearGradient
                        colors={['#F8FAFC', '#FFFFFF']}
                        style={styles.header}
                    >
                        {/* Softened glow for light mode */}
                        <GlowView color="blue" intensity={0.5} style={styles.profileGlow} />

                        <View style={styles.avatarContainer}>
                            <Avatar.Text
                                size={90}
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
                            <View style={styles.chapterInfoCard}>
                                <Ionicons name="people" size={14} color={colors.primary[600]} />
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
                    <View style={styles.xpCardShadow}>
                        <View style={styles.xpCard}>
                            <View style={styles.xpHeader}>
                                <Text style={styles.xpTitle}>Progress</Text>
                                <Text style={styles.xpValue}>{profile?.totalXP || 0} XP</Text>
                            </View>
                            <View style={styles.progressBarContainer}>
                                <View style={[styles.progressBarFill, { width: `${xpProgress * 100}%` }]} />
                            </View>
                            <Text style={styles.xpSubtext}>
                                {xpToNextLevel - currentLevelXP} XP to Level {(profile?.level || 1) + 1}
                            </Text>
                        </View>
                    </View>
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
                        <Text style={styles.sectionTitle}>Achievements</Text>
                        <TouchableOpacity onPress={() => setShowAllBadgesModal(true)}>
                            <Text style={styles.seeAllText}>See All</Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <View style={styles.badgesRow}>
                            {demoBadges.map((badge, index) => (
                                <MotiView
                                    key={badge.id}
                                    from={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ type: 'spring', delay: index * 100 }}
                                >
                                    <View style={styles.badgeItem}>
                                        <View style={[styles.badgeGlass, getRarityStyle(badge.rarity)]}>
                                            <Text style={styles.badgeEmoji}>{badge.icon}</Text>
                                        </View>
                                        <Text style={styles.badgeName} numberOfLines={1}>{badge.name}</Text>
                                    </View>
                                </MotiView>
                            ))}
                            <TouchableOpacity style={styles.moreBadges} onPress={() => setShowAllBadgesModal(true)}>
                                <Ionicons name="add" size={24} color="rgba(255,255,255,0.4)" />
                                <Text style={styles.moreBadgesText}>12 more</Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </View>

                {/* Interests */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Interests & Topics</Text>
                    <View style={styles.interestsContainer}>
                        {(profile?.interests || ['Business', 'Technology', 'Leadership']).map((interest: string, index: number) => (
                            <MotiView
                                key={index}
                                from={{ opacity: 0, translateX: -10 }}
                                animate={{ opacity: 1, translateX: 0 }}
                                transition={{ delay: index * 50 }}
                            >
                                <View style={styles.interestChipCard}>
                                    <Text style={styles.interestChipText}>{interest}</Text>
                                </View>
                            </MotiView>
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

                    {user?.role === 'adviser' && (
                        <>
                            <TouchableOpacity
                                style={styles.menuItem}
                                onPress={() => navigation.navigate('AdvisorDashboard')}
                            >
                                <View style={styles.menuItemLeft}>
                                    <Ionicons name="grid-outline" size={22} color={colors.neutral[600]} />
                                    <Text style={styles.menuItemText}>Advisor Dashboard</Text>
                                </View>
                                <Ionicons name="chevron-forward" size={20} color={colors.neutral[400]} />
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.menuItem}
                                onPress={() => navigation.navigate('ChapterManagement')}
                            >
                                <View style={styles.menuItemLeft}>
                                    <Ionicons name="people-outline" size={22} color={colors.neutral[600]} />
                                    <Text style={styles.menuItemText}>Manage Chapter</Text>
                                </View>
                                <Ionicons name="chevron-forward" size={20} color={colors.neutral[400]} />
                            </TouchableOpacity>
                        </>
                    )}

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
                <RNModal
                    visible={showEditModal}
                    onRequestClose={() => setShowEditModal(false)}
                    animationType="slide"
                >
                    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', padding: spacing.md, borderBottomWidth: 0.5, borderBottomColor: colors.neutral[100] }}>
                            <TouchableOpacity onPress={() => setShowEditModal(false)}>
                                <Ionicons name="close" size={24} color={colors.neutral[900]} />
                            </TouchableOpacity>
                            <Text style={[styles.modalTitle, { marginBottom: 0, flex: 1, marginRight: 24 }]}>Edit Profile</Text>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: spacing.md }}>
                            <List.AccordionGroup>
                                {/* Profile Section */}
                                <List.Accordion
                                    title="Profile Details"
                                    id="profile"
                                    left={props => <List.Icon {...props} icon="account" />}
                                    expanded={true}
                                >
                                    <View style={styles.accordionContent}>
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
                                    </View>
                                </List.Accordion>

                                <Divider style={styles.divider} />

                                {/* High School Chapter Section */}
                                <List.Accordion
                                    title="High School Chapter"
                                    id="chapter"
                                    left={props => <List.Icon {...props} icon="school" />}
                                >
                                    <View style={styles.accordionContent}>
                                        <View style={styles.formGroup}>
                                            <Text style={styles.formLabel}>Search for your Chapter</Text>
                                            <TextInput
                                                style={styles.textInput}
                                                value={searchQuery}
                                                onChangeText={(text) => {
                                                    setSearchQuery(text);
                                                    setShowResults(true);
                                                }}
                                                placeholder="Search school or city..."
                                            />
                                            {searchQuery.length > 0 && (
                                                <TouchableOpacity
                                                    onPress={handleClearChapter}
                                                    style={{ position: 'absolute', right: 10, top: 38 }}
                                                >
                                                    <Ionicons name="close-circle" size={20} color={colors.neutral[400]} />
                                                </TouchableOpacity>
                                            )}
                                        </View>

                                        {/* Search Results */}
                                        {showResults && searchQuery.length >= 3 && (
                                            <View style={styles.resultsContainer}>
                                                {filteredChapters.map((item: Chapter, index: number) => (
                                                    <TouchableOpacity
                                                        key={`${item.name}-${index}`}
                                                        onPress={() => handleSelectChapter(item)}
                                                    >
                                                        <Card style={styles.resultCard}>
                                                            <Card.Content style={styles.resultContent}>
                                                                <View>
                                                                    <Text style={styles.resultName}>{item.name}</Text>
                                                                    <Text style={styles.resultLocation}>{item.location}</Text>
                                                                </View>
                                                                <Ionicons name="add-circle-outline" size={24} color={colors.primary[600]} />
                                                            </Card.Content>
                                                        </Card>
                                                    </TouchableOpacity>
                                                ))}
                                                {filteredChapters.length === 0 && (
                                                    <Text style={styles.noResults}>No chapters found matching "{searchQuery}"</Text>
                                                )}
                                            </View>
                                        )}

                                        {/* Selected Chapter Display */}
                                        {editForm.schoolName ? (
                                            <View style={styles.selectionInfo}>
                                                <View style={styles.formGroup}>
                                                    <Text style={styles.formLabel}>School Name</Text>
                                                    <TextInput
                                                        style={[styles.textInput, { backgroundColor: colors.neutral[100] }]}
                                                        value={editForm.schoolName}
                                                        editable={false}
                                                    />
                                                </View>
                                                <View style={styles.formGroup}>
                                                    <Text style={styles.formLabel}>Chapter Name</Text>
                                                    <TextInput
                                                        style={styles.textInput}
                                                        value={editForm.chapterName}
                                                        onChangeText={(text) => setEditForm(prev => ({ ...prev, chapterName: text }))}
                                                        placeholder="e.g. Lincoln FBLA"
                                                    />
                                                </View>
                                                <View style={styles.formGroup}>
                                                    <Text style={styles.formLabel}>State</Text>
                                                    <TextInput
                                                        style={[styles.textInput, { backgroundColor: colors.neutral[100] }]}
                                                        value={editForm.state}
                                                        editable={false}
                                                    />
                                                </View>
                                            </View>
                                        ) : (
                                            !showResults && (
                                                <View style={styles.manualEntry}>
                                                    <Text style={styles.manualText}>Can't find your chapter? Try searching for the city or enter details manually above.</Text>
                                                </View>
                                            )
                                        )}
                                    </View>
                                </List.Accordion>

                                <Divider style={styles.divider} />

                                {/* Interests & Topics Section */}
                                <List.Accordion
                                    title="Interests & Topics"
                                    id="interests"
                                    left={props => <List.Icon {...props} icon="lightbulb" />}
                                >
                                    <View style={{ paddingHorizontal: 0 }}>
                                        <List.AccordionGroup>
                                            {interestSubsets.map((subset) => (
                                                <List.Accordion
                                                    key={subset.title}
                                                    title={subset.title}
                                                    id={`interest-${subset.title}`}
                                                    left={props => <Ionicons name={subset.icon as any} size={20} color={subset.color} style={{ marginRight: spacing.sm, marginLeft: spacing.xs }} />}
                                                    titleStyle={{ fontSize: 14, fontWeight: '700', color: colors.neutral[700] }}
                                                    style={{ backgroundColor: 'transparent', paddingVertical: 0 }}
                                                >
                                                    <View style={[styles.accordionContent, { paddingTop: 0 }]}>
                                                        <View style={styles.chipContainer}>
                                                            {subset.items.map(item => (
                                                                <Chip
                                                                    key={item.id}
                                                                    selected={editForm.interests.includes(item.label)}
                                                                    onPress={() => {
                                                                        setEditForm(prev => ({
                                                                            ...prev,
                                                                            interests: prev.interests.includes(item.label)
                                                                                ? prev.interests.filter((i: string) => i !== item.label)
                                                                                : [...prev.interests, item.label]
                                                                        }));
                                                                    }}
                                                                    style={[
                                                                        styles.chip,
                                                                        editForm.interests.includes(item.label) && { backgroundColor: subset.color },
                                                                    ]}
                                                                    textStyle={[
                                                                        styles.chipText,
                                                                        editForm.interests.includes(item.label) && { color: '#FFFFFF', fontWeight: 'bold' },
                                                                    ]}
                                                                    showSelectedCheck={false}
                                                                >
                                                                    {item.label}
                                                                </Chip>
                                                            ))}
                                                        </View>
                                                    </View>
                                                </List.Accordion>
                                            ))}
                                        </List.AccordionGroup>
                                    </View>
                                </List.Accordion>

                                <Divider style={styles.divider} />
                                <List.Accordion
                                    title="Competitive Events"
                                    id="events"
                                    left={props => <List.Icon {...props} icon="star" />}
                                >
                                    <View style={styles.accordionContent}>
                                        <Text style={[styles.formLabel, { marginBottom: spacing.md }]}>Select Competitive Events</Text>
                                        <EventSelector
                                            allEvents={allEvents ? allEvents.map((e: any) => ({
                                                id: e._id,
                                                title: e.title,
                                                category: e.category || 'General'
                                            })) : []}
                                            selectedEvents={editForm.competitiveEvents}
                                            onToggleEvent={(id: string) => {
                                                setEditForm(prev => ({
                                                    ...prev,
                                                    competitiveEvents: prev.competitiveEvents.includes(id)
                                                        ? prev.competitiveEvents.filter((eid: string) => eid !== id)
                                                        : [...prev.competitiveEvents, id]
                                                }));
                                            }}
                                            onSelect={() => {
                                                if (reduxUser?.id) {
                                                    addXP({ amount: 20, userId: reduxUser.id as any });
                                                }
                                            }}
                                            placeholder="Search for an event..."
                                        />
                                    </View>
                                </List.Accordion>
                            </List.AccordionGroup>

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
                        </ScrollView>
                    </SafeAreaView>
                </RNModal>

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
        </View >
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
        backgroundColor: '#FFFFFF',
    },
    header: {
        paddingTop: spacing.xl * 2,
        paddingBottom: spacing.xxl,
        alignItems: 'center',
        borderBottomLeftRadius: 40,
        borderBottomRightRadius: 40,
        overflow: 'hidden',
    },
    profileGlow: {
        position: 'absolute',
        top: -50,
        width: '100%',
        height: 200,
        opacity: 0.3,
    },
    avatarContainer: {
        position: 'relative',
        marginBottom: spacing.md,
    },
    avatar: {
        backgroundColor: colors.neutral[100],
        borderWidth: 2,
        borderColor: colors.neutral[200],
    },
    levelBadge: {
        position: 'absolute',
        bottom: -4,
        right: -4,
        backgroundColor: '#F59E0B',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 14,
        borderWidth: 2,
        borderColor: '#FFFFFF',
    },
    levelText: {
        fontSize: 12,
        fontWeight: '900',
        color: '#FFFFFF',
    },
    userName: {
        fontSize: typography.fontSize.xxxl,
        fontWeight: '900',
        color: colors.neutral[900],
        marginBottom: 4,
        letterSpacing: -0.5,
    },
    userRole: {
        fontSize: typography.fontSize.md,
        color: colors.neutral[500],
        fontWeight: '600',
        marginBottom: spacing.md,
    },
    chapterInfoCard: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.xs,
        borderRadius: borderRadius.full,
        backgroundColor: colors.neutral[100],
        borderWidth: 1,
        borderColor: colors.neutral[200],
    },
    chapterText: {
        fontSize: typography.fontSize.sm,
        color: colors.neutral[700],
        marginLeft: spacing.xs,
        fontWeight: '700',
    },
    xpCardContainer: {
        margin: spacing.md,
        marginTop: -spacing.xl * 1.5,
        zIndex: 10,
    },
    xpCardShadow: {
        borderRadius: 24,
        ...shadows.md,
        backgroundColor: '#FFFFFF',
    },
    xpCard: {
        padding: spacing.lg,
        borderRadius: 24,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: colors.neutral[100],
    },
    xpHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    xpTitle: {
        fontSize: typography.fontSize.md,
        fontWeight: '800',
        color: colors.neutral[400],
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    xpValue: {
        fontSize: typography.fontSize.xl,
        fontWeight: '900',
        color: colors.neutral[900],
    },
    progressBarContainer: {
        height: 10,
        backgroundColor: colors.neutral[100],
        borderRadius: 5,
        overflow: 'hidden',
        marginBottom: spacing.sm,
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: colors.primary[500],
        borderRadius: 5,
    },
    xpSubtext: {
        fontSize: typography.fontSize.sm,
        color: colors.neutral[400],
        marginTop: spacing.xs,
        textAlign: 'center',
        fontWeight: '600',
    },
    statsContainer: {
        flexDirection: 'row',
        paddingHorizontal: spacing.md,
        gap: spacing.md,
        marginBottom: spacing.lg,
    },
    statCard: {
        flex: 1,
        alignItems: 'center',
        padding: spacing.md,
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: colors.neutral[100],
        ...shadows.sm,
    },
    statIconContainer: {
        width: 44,
        height: 44,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.xs,
    },
    statValue: {
        fontSize: typography.fontSize.lg,
        fontWeight: '900',
        color: colors.neutral[900],
    },
    statLabel: {
        fontSize: 10,
        color: colors.neutral[500],
        fontWeight: '800',
        textTransform: 'uppercase',
    },
    section: {
        paddingHorizontal: spacing.md,
        marginBottom: spacing.xl,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    sectionTitle: {
        fontSize: typography.fontSize.lg,
        fontWeight: '800',
        color: colors.neutral[900],
        letterSpacing: 0.5,
    },
    seeAllText: {
        fontSize: typography.fontSize.sm,
        color: colors.primary[600],
        fontWeight: '700',
    },
    badgesRow: {
        flexDirection: 'row',
        gap: spacing.md,
        paddingBottom: spacing.sm,
    },
    badgeItem: {
        alignItems: 'center',
        width: 70,
    },
    badgeGlass: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.xs,
        padding: 0,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    badgeEmoji: {
        fontSize: 28,
    },
    badgeName: {
        fontSize: 10,
        color: colors.neutral[600],
        textAlign: 'center',
        fontWeight: '600',
    },
    moreBadges: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: colors.neutral[50],
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderStyle: 'dashed',
        borderColor: colors.neutral[200],
    },
    moreBadgesText: {
        fontSize: 9,
        color: colors.neutral[400],
        fontWeight: '800',
    },
    interestsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.sm,
    },
    interestChipCard: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
        borderRadius: 20,
        backgroundColor: colors.neutral[100],
        borderWidth: 1,
        borderColor: colors.neutral[200],
    },
    interestChipText: {
        color: colors.neutral[700],
        fontSize: 12,
        fontWeight: '700',
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: spacing.lg,
        backgroundColor: colors.neutral[50],
        borderRadius: 20,
        marginBottom: spacing.sm,
        borderWidth: 1,
        borderColor: colors.neutral[100],
    },
    menuItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    menuItemText: {
        fontSize: typography.fontSize.md,
        color: colors.neutral[700],
        marginLeft: spacing.md,
        fontWeight: '600',
    },
    logoutItem: {
        marginTop: spacing.md,
        backgroundColor: '#FFF5F5',
        borderColor: '#FFEBEB',
    },
    logoutText: {
        fontSize: typography.fontSize.md,
        color: colors.error.main,
        marginLeft: spacing.md,
        fontWeight: '700',
    },
    modal: {
        backgroundColor: '#FFFFFF',
        margin: spacing.lg,
        borderRadius: 30,
        padding: spacing.xl,
        borderWidth: 1,
        borderColor: colors.neutral[200],
        ...shadows.lg,
    },
    modalTitle: {
        fontSize: typography.fontSize.xl,
        fontWeight: '900',
        color: colors.neutral[900],
        marginBottom: spacing.md,
        textAlign: 'center',
    },
    modalText: {
        fontSize: typography.fontSize.md,
        color: colors.neutral[600],
        textAlign: 'center',
        marginBottom: spacing.xl,
    },
    modalActions: {
        flexDirection: 'row',
        gap: spacing.md,
    },
    modalButton: {
        flex: 1,
        borderRadius: 15,
    },
    helpItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.md,
        marginBottom: spacing.sm,
        backgroundColor: colors.neutral[50],
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.neutral[100],
    },
    helpText: {
        color: colors.neutral[700],
        marginLeft: spacing.md,
        fontWeight: '600',
    },
    versionInfo: {
        alignItems: 'center',
        marginTop: spacing.md,
    },
    versionText: {
        color: colors.neutral[400],
        fontSize: 12,
    },
    formGroup: {
        marginBottom: spacing.md,
    },
    formLabel: {
        fontSize: typography.fontSize.sm,
        fontWeight: '700',
        color: colors.neutral[400],
        marginBottom: spacing.xs,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    textInput: {
        borderWidth: 0.5,
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
        borderBottomWidth: 0.5,
        borderBottomColor: colors.neutral[100],
    },
    settingLabel: {
        fontSize: typography.fontSize.md,
        color: colors.neutral[700],
        fontWeight: '500',
    },
    settingSubtext: {
        fontSize: typography.fontSize.sm,
        color: colors.neutral[500],
        marginTop: spacing.xs,
    },
    badgesGrid: {
        maxHeight: 400,
        marginTop: spacing.md,
    },
    badgesGridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.md,
        justifyContent: 'center',
    },
    badgeGridItem: {
        width: width * 0.35,
        alignItems: 'center',
        marginBottom: spacing.lg,
    },
    badgeIcon: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    badgeDescription: {
        fontSize: 10,
        color: colors.neutral[500],
        textAlign: 'center',
        marginTop: spacing.xs,
        lineHeight: 14,
    },
    divider: {
        marginBottom: spacing.lg,
        backgroundColor: colors.neutral[200],
    },
    resultsContainer: {
        marginTop: spacing.xs,
        marginBottom: spacing.lg,
    },
    resultCard: {
        marginBottom: spacing.sm,
        backgroundColor: colors.neutral[50],
        borderRadius: borderRadius.md,
        borderWidth: 0.5,
        borderColor: colors.neutral[200],
    },
    resultContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
    },
    resultName: {
        fontSize: typography.fontSize.md,
        fontWeight: 'bold',
        color: colors.neutral[900],
    },
    resultLocation: {
        fontSize: typography.fontSize.sm,
        color: colors.neutral[500],
        marginTop: 2,
    },
    noResults: {
        textAlign: 'center',
        color: colors.neutral[500],
        marginTop: spacing.md,
        fontStyle: 'italic',
    },
    selectionInfo: {
        marginTop: spacing.sm,
    },
    manualEntry: {
        padding: spacing.md,
        backgroundColor: colors.primary[50],
        borderRadius: borderRadius.md,
        marginTop: spacing.md,
        marginBottom: spacing.md,
    },
    manualText: {
        fontSize: typography.fontSize.sm,
        color: colors.primary[600],
        lineHeight: 20,
        textAlign: 'center',
    },
    accordionContent: {
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.sm,
    },
    chipContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.sm,
        marginTop: spacing.sm,
    },
    chip: {
        marginBottom: spacing.xs,
        backgroundColor: colors.neutral[100],
        borderWidth: 1,
        borderColor: colors.neutral[200],
    },
    chipSelected: {
        backgroundColor: colors.primary[100],
        borderColor: colors.primary[600],
    },
    chipText: {
        color: colors.neutral[700],
        fontSize: typography.fontSize.sm,
    },
    chipTextSelected: {
        color: colors.primary[700],
        fontWeight: '500',
    },
});
