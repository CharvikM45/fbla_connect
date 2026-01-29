// FBLA Connect - Chapter Management Screen
import React from 'react';
import {
    View,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
} from 'react-native';
import { Text, Card, Avatar, ActivityIndicator } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useAppSelector } from '../../../shared/hooks/useRedux';
import { colors, spacing, borderRadius } from '../../../shared/theme';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { Button, TextInput, Portal, Modal, Dialog } from 'react-native-paper';

export default function ChapterManagementScreen() {
    const user = useAppSelector(state => state.auth.user);
    const chapterId = user?.chapterName || '';

    const chapterMembers = useQuery(api.users.getChapterMembers);

    const removeMember = useMutation(api.users.removeMemberFromChapter);
    const addMember = useMutation(api.users.addMemberToChapter);
    const updateRole = useMutation(api.users.updateUserRole);
    const seedMembers = useMutation(api.init.seedChapterMembers);

    const [showAddModal, setShowAddModal] = React.useState(false);
    const [emailToAdd, setEmailToAdd] = React.useState('');
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [addError, setAddError] = React.useState<string | null>(null);

    const [memberToRemove, setMemberToRemove] = React.useState<any>(null);
    const [showConfirmDelete, setShowConfirmDelete] = React.useState(false);

    const [selectedStudent, setSelectedStudent] = React.useState<any>(null);
    const [showDetailModal, setShowDetailModal] = React.useState(false);
    const [isUpdatingRole, setIsUpdatingRole] = React.useState(false);

    const handleAddMember = async () => {
        if (!emailToAdd) return;
        setIsSubmitting(true);
        setAddError(null);
        try {
            await addMember({
                email: emailToAdd,
                chapterName: user!.chapterName || '',
                schoolName: user!.schoolName || '',
                state: user!.state || '',
            });
            setEmailToAdd('');
            setShowAddModal(false);
        } catch (error) {
            setAddError(error instanceof Error ? error.message : 'Failed to add member');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleRemoveMember = async () => {
        if (!memberToRemove) return;
        try {
            await removeMember({ userId: memberToRemove._id });
            setShowConfirmDelete(false);
            setMemberToRemove(null);
        } catch (error) {
            console.error("Failed to remove member:", error);
        }
    };

    const handleSeedData = async () => {
        try {
            await seedMembers({
                chapterName: user!.chapterName || '',
                schoolName: user!.schoolName || '',
                state: user!.state || '',
            });
        } catch (error) {
            console.error("Failed to seed data:", error);
        }
    };

    const handleUpdateRole = async (newRole: 'member' | 'officer') => {
        if (!selectedStudent) return;
        setIsUpdatingRole(true);
        try {
            await updateRole({
                userId: selectedStudent._id,
                role: newRole,
            });
            setSelectedStudent({ ...selectedStudent, role: newRole });
        } catch (error) {
            console.error("Failed to update role:", error);
        } finally {
            setIsUpdatingRole(false);
        }
    };

    if (!user || user.role !== 'adviser') {
        return (
            <View style={styles.container}>
                <View style={styles.errorContainer}>
                    <Ionicons name="lock-closed" size={48} color={colors.error.main} />
                    <Text style={styles.errorText}>Access Denied</Text>
                    <Text style={styles.errorSubtext}>Only advisors can access this page.</Text>
                </View>
            </View>
        );
    }

    if (chapterMembers === undefined) {
        return (
            <View style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary[600]} />
                    <Text style={styles.loadingText}>Loading chapter members...</Text>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                <View style={styles.header}>
                    <View style={styles.headerTop}>
                        <View>
                            <Text style={styles.title}>Chapter Management</Text>
                            <Text style={styles.subtitle}>{user.chapterName || 'Your Chapter'}</Text>
                        </View>
                        <View style={styles.headerActions}>
                            <TouchableOpacity
                                style={styles.headerActionButton}
                                onPress={handleSeedData}
                            >
                                <Ionicons name="flask-outline" size={24} color="#FFFFFF" />
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.addButton}
                                onPress={() => setShowAddModal(true)}
                            >
                                <Ionicons name="person-add" size={24} color="#FFFFFF" />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                <View style={styles.statsContainer}>
                    <View style={styles.statCard}>
                        <Text style={styles.statValue}>{chapterMembers?.length || 0}</Text>
                        <Text style={styles.statLabel}>Total Members</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statValue}>
                            {chapterMembers?.filter((m: any) => m.role === 'officer').length || 0}
                        </Text>
                        <Text style={styles.statLabel}>Officers</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statValue}>
                            {chapterMembers?.filter((m: any) => m.role === 'member').length || 0}
                        </Text>
                        <Text style={styles.statLabel}>Members</Text>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Member List</Text>
                    {chapterMembers.length === 0 ? (
                        <View style={styles.emptyState}>
                            <Ionicons name="people-outline" size={48} color={colors.neutral[300]} />
                            <Text style={styles.emptyText}>No members found</Text>
                            <Text style={styles.emptySubtext}>
                                Members will appear here once they join your chapter.
                            </Text>
                        </View>
                    ) : (
                        chapterMembers.map((member: any) => (
                            <TouchableOpacity
                                key={member._id}
                                activeOpacity={0.7}
                                onPress={() => {
                                    setSelectedStudent(member);
                                    setShowDetailModal(true);
                                }}
                            >
                                <Card style={styles.memberCard}>
                                    <Card.Content style={styles.memberContent}>
                                        <View style={styles.memberInfo}>
                                            <Avatar.Text
                                                size={48}
                                                label={member.displayName?.charAt(0) || 'U'}
                                                style={styles.avatar}
                                            />
                                            <View style={styles.memberDetails}>
                                                <View style={styles.nameRow}>
                                                    <Text style={styles.memberName}>{member.displayName}</Text>
                                                    {member.role !== 'adviser' && (
                                                        <TouchableOpacity
                                                            onPress={() => {
                                                                setMemberToRemove(member);
                                                                setShowConfirmDelete(true);
                                                            }}
                                                        >
                                                            <Ionicons name="trash-outline" size={20} color={colors.error.main} />
                                                        </TouchableOpacity>
                                                    )}
                                                </View>
                                                <View style={styles.memberMeta}>
                                                    <View style={[
                                                        styles.roleBadge,
                                                        {
                                                            backgroundColor:
                                                                member.role === 'adviser' ? colors.primary[100] :
                                                                    member.role === 'officer' ? colors.secondary[100] :
                                                                        colors.neutral[100]
                                                        }
                                                    ]}>
                                                        <Text style={[
                                                            styles.roleText,
                                                            {
                                                                color:
                                                                    member.role === 'adviser' ? colors.primary[700] :
                                                                        member.role === 'officer' ? colors.secondary[700] :
                                                                            colors.neutral[700]
                                                            }
                                                        ]}>
                                                            {member.role === 'adviser' ? 'Adviser' :
                                                                member.role === 'officer' ? 'Officer' : 'Member'}
                                                        </Text>
                                                    </View>
                                                    <View style={styles.xpBadge}>
                                                        <Ionicons name="sparkles" size={12} color={colors.secondary[600]} />
                                                        <Text style={styles.xpText}>{member.totalXP || 0} XP</Text>
                                                    </View>
                                                </View>
                                                <View style={styles.emailRow}>
                                                    <Ionicons name="mail-outline" size={14} color={colors.neutral[500]} />
                                                    <Text style={styles.email}>{member.email}</Text>
                                                </View>
                                            </View>
                                        </View>
                                    </Card.Content>
                                </Card>
                            </TouchableOpacity>
                        ))
                    )}
                </View>

                <View style={{ height: 100 }} />
            </ScrollView>

            <Portal>
                {/* Add Member Modal */}
                <Modal
                    visible={showAddModal}
                    onDismiss={() => setShowAddModal(false)}
                    contentContainerStyle={styles.modal}
                >
                    <Text style={styles.modalTitle}>Add Member</Text>
                    <Text style={styles.modalSubtext}>
                        Enter the email address of the student you want to add to your chapter.
                    </Text>
                    <TextInput
                        mode="outlined"
                        label="Student Email"
                        value={emailToAdd}
                        onChangeText={setEmailToAdd}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        style={styles.input}
                        activeOutlineColor={colors.primary[600]}
                        error={!!addError}
                    />
                    {addError ? (
                        <Text style={styles.errorTextSmall}>{addError}</Text>
                    ) : null}
                    <View style={styles.modalActions}>
                        <Button
                            mode="outlined"
                            onPress={() => setShowAddModal(false)}
                            style={styles.modalButton}
                        >
                            Cancel
                        </Button>
                        <Button
                            mode="contained"
                            onPress={handleAddMember}
                            loading={isSubmitting}
                            disabled={isSubmitting || !emailToAdd}
                            style={styles.modalButton}
                        >
                            Add
                        </Button>
                    </View>
                </Modal>

                {/* Student Detail Modal */}
                <Modal
                    visible={showDetailModal}
                    onDismiss={() => setShowDetailModal(false)}
                    contentContainerStyle={styles.modal}
                >
                    {selectedStudent && (
                        <>
                            <View style={styles.detailHeader}>
                                <Avatar.Text
                                    size={64}
                                    label={selectedStudent.displayName?.charAt(0) || 'U'}
                                    style={styles.avatarLarge}
                                />
                                <View style={styles.detailTitleContainer}>
                                    <Text style={styles.detailName}>{selectedStudent.displayName}</Text>
                                    <Text style={styles.detailEmail}>{selectedStudent.email}</Text>
                                </View>
                            </View>

                            <View style={styles.detailStats}>
                                <View style={styles.detailStatItem}>
                                    <Text style={styles.detailStatValue}>{selectedStudent.totalXP || 0}</Text>
                                    <Text style={styles.detailStatLabel}>Total XP</Text>
                                </View>
                                <View style={styles.detailStatDivider} />
                                <View style={styles.detailStatItem}>
                                    <Text style={styles.detailStatValue}>{selectedStudent.level || 1}</Text>
                                    <Text style={styles.detailStatLabel}>Level</Text>
                                </View>
                            </View>

                            <View style={styles.detailSection}>
                                <Text style={styles.detailSectionTitle}>Competitive Events</Text>
                                <View style={styles.eventsList}>
                                    {selectedStudent.competitiveEvents && selectedStudent.competitiveEvents.length > 0 ? (
                                        selectedStudent.competitiveEvents.map((event: string, idx: number) => (
                                            <View key={idx} style={styles.eventBadge}>
                                                <Text style={styles.eventBadgeText}>{event}</Text>
                                            </View>
                                        ))
                                    ) : (
                                        <Text style={styles.noEventsText}>No events selected</Text>
                                    )}
                                </View>
                            </View>

                            <View style={styles.detailSection}>
                                <Text style={styles.detailSectionTitle}>Manage Role</Text>
                                <View style={styles.roleToggle}>
                                    <TouchableOpacity
                                        style={[
                                            styles.roleOption,
                                            selectedStudent.role === 'member' && styles.roleOptionSelected
                                        ]}
                                        onPress={() => handleUpdateRole('member')}
                                        disabled={isUpdatingRole}
                                    >
                                        <Text style={[
                                            styles.roleOptionText,
                                            selectedStudent.role === 'member' && styles.roleOptionTextSelected
                                        ]}>Member</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[
                                            styles.roleOption,
                                            selectedStudent.role === 'officer' && styles.roleOptionSelected
                                        ]}
                                        onPress={() => handleUpdateRole('officer')}
                                        disabled={isUpdatingRole}
                                    >
                                        <Text style={[
                                            styles.roleOptionText,
                                            selectedStudent.role === 'officer' && styles.roleOptionTextSelected
                                        ]}>Officer</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <Button
                                mode="contained"
                                onPress={() => setShowDetailModal(false)}
                                style={styles.closeModalButton}
                            >
                                Close
                            </Button>
                        </>
                    )}
                </Modal>

                {/* Confirm Removal Dialog */}
                <Dialog
                    visible={showConfirmDelete}
                    onDismiss={() => setShowConfirmDelete(false)}
                    style={styles.dialog}
                >
                    <Dialog.Title>Remove Member?</Dialog.Title>
                    <Dialog.Content>
                        <Text style={styles.dialogText}>
                            Are you sure you want to remove {memberToRemove?.displayName} from your chapter?
                        </Text>
                    </Dialog.Content>
                    <Dialog.Actions>
                        <Button onPress={() => setShowConfirmDelete(false)}>Cancel</Button>
                        <Button
                            textColor={colors.error.main}
                            onPress={handleRemoveMember}
                        >
                            Remove
                        </Button>
                    </Dialog.Actions>
                </Dialog>
            </Portal>
        </View>
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
    header: {
        backgroundColor: colors.primary[600],
        paddingTop: spacing.xl * 2,
        paddingBottom: spacing.xl,
        paddingHorizontal: spacing.lg,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: spacing.xs,
    },
    subtitle: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.9)',
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerActions: {
        flexDirection: 'row',
        gap: spacing.sm,
    },
    headerActionButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    addButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    statsContainer: {
        flexDirection: 'row',
        padding: spacing.md,
        gap: spacing.sm,
        marginTop: -spacing.xl,
    },
    statCard: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        alignItems: 'center',
        elevation: 2,
    },
    statValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.primary[600],
        marginBottom: spacing.xs,
    },
    statLabel: {
        fontSize: 12,
        color: colors.neutral[600],
        fontWeight: '600',
        textTransform: 'uppercase',
    },
    section: {
        paddingHorizontal: spacing.md,
        marginTop: spacing.lg,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.neutral[900],
        marginBottom: spacing.md,
    },
    memberCard: {
        marginBottom: spacing.md,
        borderRadius: borderRadius.lg,
        backgroundColor: '#FFFFFF',
        elevation: 1,
    },
    memberContent: {
        padding: spacing.md,
    },
    memberInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        backgroundColor: colors.primary[100],
    },
    memberDetails: {
        flex: 1,
        marginLeft: spacing.md,
    },
    memberName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.neutral[900],
    },
    nameRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.xs,
    },
    memberMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: spacing.xs,
        marginBottom: spacing.xs,
    },
    roleBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    roleText: {
        fontSize: 11,
        fontWeight: 'bold',
    },
    xpBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        backgroundColor: colors.secondary[50],
        gap: 4,
    },
    xpText: {
        fontSize: 11,
        fontWeight: 'bold',
        color: colors.secondary[700],
    },
    schoolName: {
        fontSize: 12,
        color: colors.neutral[600],
    },
    emailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: spacing.xs,
    },
    email: {
        fontSize: 13,
        color: colors.neutral[600],
        marginLeft: 4,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.xxl * 2,
        paddingHorizontal: spacing.xl,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.neutral[400],
        marginTop: spacing.md,
    },
    emptySubtext: {
        fontSize: 14,
        color: colors.neutral[400],
        textAlign: 'center',
        marginTop: spacing.xs,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: spacing.md,
        fontSize: 14,
        color: colors.neutral[600],
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.xl,
    },
    errorText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.error.main,
        marginTop: spacing.md,
    },
    errorSubtext: {
        fontSize: 14,
        color: colors.neutral[600],
        textAlign: 'center',
        marginTop: spacing.xs,
    },
    modal: {
        backgroundColor: 'white',
        padding: spacing.xl,
        margin: spacing.xl,
        borderRadius: borderRadius.lg,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: spacing.sm,
        color: colors.neutral[900],
    },
    modalSubtext: {
        fontSize: 14,
        color: colors.neutral[600],
        marginBottom: spacing.lg,
        lineHeight: 20,
    },
    input: {
        marginBottom: spacing.md,
        backgroundColor: '#FFFFFF',
    },
    errorTextSmall: {
        color: colors.error.main,
        fontSize: 12,
        marginBottom: spacing.md,
    },
    modalActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: spacing.md,
    },
    modalButton: {
        borderRadius: borderRadius.md,
    },
    dialog: {
        backgroundColor: 'white',
        borderRadius: borderRadius.lg,
    },
    dialogText: {
        fontSize: 16,
        color: colors.neutral[700],
        lineHeight: 24,
    },
    detailHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.lg,
    },
    avatarLarge: {
        backgroundColor: colors.primary[100],
    },
    detailTitleContainer: {
        marginLeft: spacing.md,
        flex: 1,
    },
    detailName: {
        fontSize: 22,
        fontWeight: 'bold',
        color: colors.neutral[900],
    },
    detailEmail: {
        fontSize: 14,
        color: colors.neutral[600],
        marginTop: 2,
    },
    detailStats: {
        flexDirection: 'row',
        backgroundColor: colors.neutral[100],
        borderRadius: borderRadius.md,
        padding: spacing.md,
        marginBottom: spacing.lg,
    },
    detailStatItem: {
        flex: 1,
        alignItems: 'center',
    },
    detailStatValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.primary[600],
    },
    detailStatLabel: {
        fontSize: 12,
        color: colors.neutral[600],
        fontWeight: '600',
    },
    detailStatDivider: {
        width: 1,
        backgroundColor: colors.neutral[300],
    },
    detailSection: {
        marginBottom: spacing.lg,
    },
    detailSectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.neutral[800],
        marginBottom: spacing.sm,
    },
    eventsList: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.xs,
    },
    eventBadge: {
        backgroundColor: colors.secondary[50],
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.secondary[100],
    },
    eventBadgeText: {
        fontSize: 12,
        color: colors.secondary[700],
        fontWeight: '500',
    },
    noEventsText: {
        color: colors.neutral[400],
        fontStyle: 'italic',
    },
    roleToggle: {
        flexDirection: 'row',
        backgroundColor: colors.neutral[100],
        borderRadius: borderRadius.md,
        padding: 4,
    },
    roleOption: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: borderRadius.sm,
    },
    roleOptionSelected: {
        backgroundColor: '#FFFFFF',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    roleOptionText: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.neutral[500],
    },
    roleOptionTextSelected: {
        color: colors.primary[600],
    },
    closeModalButton: {
        marginTop: spacing.sm,
        backgroundColor: colors.primary[600],
    },
});
