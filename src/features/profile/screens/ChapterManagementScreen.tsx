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
import { useQuery } from 'convex/react';
import { api } from '../../../../convex/_generated/api';

export default function ChapterManagementScreen() {
    const user = useAppSelector(state => state.auth.user);
    const chapterId = user?.chapterName || '';

    const chapterMembers = useQuery(api.users.getChapterMembers, {
        chapterId: chapterId,
    });

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
                    <Text style={styles.title}>Chapter Management</Text>
                    <Text style={styles.subtitle}>{user.chapterName || 'Your Chapter'}</Text>
                </View>

                <View style={styles.statsContainer}>
                    <View style={styles.statCard}>
                        <Text style={styles.statValue}>{chapterMembers.length}</Text>
                        <Text style={styles.statLabel}>Total Members</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statValue}>
                            {chapterMembers.filter(m => m.role === 'officer').length}
                        </Text>
                        <Text style={styles.statLabel}>Officers</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statValue}>
                            {chapterMembers.filter(m => m.role === 'member').length}
                        </Text>
                        <Text style={styles.statLabel}>Members</Text>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Chapter Members</Text>
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
                            <Card key={member._id} style={styles.memberCard}>
                                <Card.Content style={styles.memberContent}>
                                    <View style={styles.memberInfo}>
                                        <Avatar.Text
                                            size={48}
                                            label={member.displayName?.charAt(0) || 'U'}
                                            style={styles.avatar}
                                        />
                                        <View style={styles.memberDetails}>
                                            <Text style={styles.memberName}>{member.displayName}</Text>
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
                                                {member.schoolName && (
                                                    <Text style={styles.schoolName}>{member.schoolName}</Text>
                                                )}
                                            </View>
                                            <View style={styles.emailRow}>
                                                <Ionicons name="mail-outline" size={14} color={colors.neutral[500]} />
                                                <Text style={styles.email}>{member.email}</Text>
                                            </View>
                                        </View>
                                    </View>
                                </Card.Content>
                            </Card>
                        ))
                    )}
                </View>

                <View style={{ height: 100 }} />
            </ScrollView>
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
});
