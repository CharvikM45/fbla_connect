// FBLA Connect - Role Selection Screen (Onboarding)
import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Button, TextInput, HelperText, Portal, Modal } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '../../../shared/navigation/types';
import { useAppDispatch } from '../../../shared/hooks/useRedux';
import { updateUser, UserRole } from '../authSlice';
import { colors, spacing, typography, borderRadius, shadows } from '../../../shared/theme';
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";

type Props = {
    navigation: NativeStackNavigationProp<OnboardingStackParamList, 'RoleSelection'>;
};

const roles: { id: UserRole; title: string; description: string; icon: string }[] = [
    {
        id: 'member',
        title: 'Member',
        description: 'Active FBLA member participating in chapter activities and competitions',
        icon: 'person',
    },
    {
        id: 'officer',
        title: 'Chapter Officer',
        description: 'Holding a leadership position in your chapter',
        icon: 'people',
    },
    {
        id: 'adviser',
        title: 'Advisor',
        description: 'Faculty advisor supporting an FBLA chapter',
        icon: 'school',
    },
];

export default function RoleSelectionScreen({ navigation }: Props) {
    const dispatch = useAppDispatch();
    const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
    const [accessCode, setAccessCode] = useState('');
    const [showAccessCodeModal, setShowAccessCodeModal] = useState(false);
    const [accessCodeError, setAccessCodeError] = useState('');

    const ADVISOR_CODE = 'FBLA2026';

    const updateConvexUser = useMutation(api.users.updateUser);

    const handleRoleSelect = (roleId: UserRole) => {
        setSelectedRole(roleId);
        setAccessCodeError(''); // Clear previous errors
    };

    const handleContinue = async () => {
        if (!selectedRole) return;

        if (selectedRole === 'adviser') {
            if (accessCode !== ADVISOR_CODE) {
                setShowAccessCodeModal(true);
                return;
            }
        }

        proceedWithRoleUpdate();
    };

    const verifyAccessCode = () => {
        if (accessCode === ADVISOR_CODE) {
            setShowAccessCodeModal(false);
            proceedWithRoleUpdate();
        } else {
            setAccessCodeError('Invalid Access Code. Please contact FBLA National Center.');
        }
    };

    const proceedWithRoleUpdate = async () => {
        try {
            await updateConvexUser({
                role: selectedRole!
            });
            dispatch(updateUser({ role: selectedRole! }));
            navigation.navigate('SchoolInfo');
        } catch (error) {
            console.error("Failed to update role in Convex:", error);
            // Even if backend fails, proceed locally for onboarding flow if needed, 
            // but ideally we want to ensure backend sync.
            dispatch(updateUser({ role: selectedRole! }));
            navigation.navigate('SchoolInfo');
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.stepText}>Step 1 of 5</Text>
                    <Text style={styles.title}>What's your role?</Text>
                    <Text style={styles.subtitle}>
                        This helps us personalize your FBLA experience
                    </Text>
                </View>

                {/* Role Options */}
                <View style={styles.rolesContainer}>
                    {roles.map((role) => (
                        <TouchableOpacity
                            key={role.id}
                            style={[
                                styles.roleCard,
                                selectedRole === role.id && styles.roleCardSelected,
                            ]}
                            onPress={() => handleRoleSelect(role.id)}
                            activeOpacity={0.7}
                        >
                            <View
                                style={[
                                    styles.roleIcon,
                                    selectedRole === role.id && styles.roleIconSelected,
                                ]}
                            >
                                <Ionicons
                                    name={role.icon as any}
                                    size={28}
                                    color={selectedRole === role.id ? '#FFFFFF' : colors.primary[600]}
                                />
                            </View>
                            <View style={styles.roleInfo}>
                                <Text
                                    style={[
                                        styles.roleTitle,
                                        selectedRole === role.id && styles.roleTitleSelected,
                                    ]}
                                >
                                    {role.title}
                                </Text>
                                <Text style={styles.roleDescription}>{role.description}</Text>
                            </View>
                            {selectedRole === role.id && (
                                <Ionicons
                                    name="checkmark-circle"
                                    size={24}
                                    color={colors.primary[600]}
                                />
                            )}
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Continue Button */}
                <View style={styles.footer}>
                    <Button
                        mode="contained"
                        onPress={handleContinue}
                        disabled={!selectedRole}
                        style={styles.continueButton}
                        contentStyle={styles.buttonContent}
                        labelStyle={styles.buttonLabel}
                    >
                        Continue
                    </Button>
                </View>
            </View>

            <Portal>
                <Modal
                    visible={showAccessCodeModal}
                    onDismiss={() => setShowAccessCodeModal(false)}
                    contentContainerStyle={styles.modal}
                >
                    <Text style={styles.modalTitle}>Advisor Verification</Text>
                    <Text style={styles.modalText}>
                        To ensure security, please enter the Advisor Access Code provided by FBLA.
                    </Text>

                    <TextInput
                        mode="outlined"
                        label="Access Code"
                        value={accessCode}
                        onChangeText={(text) => {
                            setAccessCode(text);
                            setAccessCodeError('');
                        }}
                        secureTextEntry
                        style={styles.input}
                        activeOutlineColor={colors.primary[600]}
                        error={!!accessCodeError}
                    />
                    {accessCodeError ? (
                        <HelperText type="error">
                            {accessCodeError}
                        </HelperText>
                    ) : null}

                    <Button
                        mode="contained"
                        onPress={verifyAccessCode}
                        style={styles.modalButton}
                    >
                        Verify & Continue
                    </Button>
                </Modal>
            </Portal>
        </SafeAreaView >
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    content: {
        flex: 1,
        paddingHorizontal: spacing.lg,
    },
    header: {
        paddingTop: spacing.xl,
        paddingBottom: spacing.xl,
    },
    stepText: {
        fontSize: typography.fontSize.sm,
        color: colors.primary[600],
        fontWeight: '600',
        marginBottom: spacing.sm,
    },
    title: {
        fontSize: typography.fontSize.xxxl,
        fontWeight: 'bold',
        color: colors.neutral[900],
        marginBottom: spacing.sm,
    },
    subtitle: {
        fontSize: typography.fontSize.md,
        color: colors.neutral[500],
    },
    rolesContainer: {
        flex: 1,
    },
    roleCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.md,
        borderRadius: borderRadius.lg,
        borderWidth: 2,
        borderColor: colors.neutral[200],
        marginBottom: spacing.md,
        backgroundColor: '#FFFFFF',
    },
    roleCardSelected: {
        borderColor: colors.primary[600],
        backgroundColor: colors.primary[50],
    },
    roleIcon: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: colors.primary[100],
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.md,
    },
    roleIconSelected: {
        backgroundColor: colors.primary[600],
    },
    roleInfo: {
        flex: 1,
    },
    roleTitle: {
        fontSize: typography.fontSize.lg,
        fontWeight: '600',
        color: colors.neutral[900],
        marginBottom: spacing.xs,
    },
    roleTitleSelected: {
        color: colors.primary[700],
    },
    roleDescription: {
        fontSize: typography.fontSize.sm,
        color: colors.neutral[500],
        lineHeight: 20,
    },
    footer: {
        paddingVertical: spacing.xl,
    },
    continueButton: {
        borderRadius: borderRadius.lg,
    },
    buttonContent: {
        paddingVertical: spacing.sm,
    },
    buttonLabel: {
        fontSize: typography.fontSize.md,
        fontWeight: '600',
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
        marginBottom: spacing.md,
        color: colors.neutral[900],
    },
    modalText: {
        marginBottom: spacing.md,
        color: colors.neutral[600],
        lineHeight: 20,
    },
    input: {
        marginBottom: spacing.xs,
        backgroundColor: 'white',
    },
    modalButton: {
        marginTop: spacing.md,
        borderRadius: borderRadius.md,
        backgroundColor: colors.primary[600],
    },
});
