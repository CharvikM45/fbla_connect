// FBLA Connect - Login Screen
import React, { useState } from 'react';
import {
    View,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    TouchableOpacity,
} from 'react-native';
import { Text, TextInput, Button, HelperText } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../../shared/navigation/types';
import { useAppDispatch, useAppSelector } from '../../../shared/hooks/useRedux';
import { loginSuccess, completeOnboarding } from '../authSlice';
import { setProfile } from '../../profile/profileSlice';
import { colors, spacing, typography, borderRadius } from '../../../shared/theme';
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";

type Props = {
    navigation: NativeStackNavigationProp<AuthStackParamList, 'Login'>;
};

export default function LoginScreen({ navigation }: Props) {
    const dispatch = useAppDispatch();
    const { isLoading, error } = useAppSelector(state => state.auth);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');

    const validateEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const storeUser = useMutation(api.users.storeUser);

    const handleLogin = async () => {
        let isValid = true;

        if (!email) {
            setEmailError('Email is required');
            isValid = false;
        } else if (!validateEmail(email)) {
            setEmailError('Please enter a valid email');
            isValid = false;
        } else {
            setEmailError('');
        }

        if (!password) {
            setPasswordError('Password is required');
            isValid = false;
        } else if (password.length < 6) {
            setPasswordError('Password must be at least 6 characters');
            isValid = false;
        } else {
            setPasswordError('');
        }

        if (isValid) {
            try {
                // In a real app, we would authenticate with Clerk/Firebase first
                // Here we call storeUser to get/create the profile in Convex
                const userData = await storeUser({
                    email: email,
                    displayName: email.split('@')[0], // Fallback if name not found
                    role: 'member',
                });

                // Since Convex storeUser returns user details or we fetch them:
                // For this demo/setup, we assume the mutation returns what we need or we fetch it
                const loggedInUser = {
                    id: (userData as any)._id || 'new-user',
                    email: email,
                    displayName: (userData as any).displayName || email.split('@')[0],
                    role: (userData as any).role || 'member',
                    schoolName: (userData as any).schoolName,
                    chapterName: (userData as any).chapterName,
                    state: (userData as any).state,
                    createdAt: (userData as any).createdAt || new Date().toISOString(),
                };

                dispatch(loginSuccess(loggedInUser));

                // Initialize profile state
                dispatch(setProfile({
                    userId: loggedInUser.id,
                    gradeLevel: 11,
                    graduationYear: 2027,
                    interests: (userData as any).interests || ['Business', 'Technology', 'Leadership'],
                    careerGoals: ['Entrepreneurship', 'Marketing'],
                    officerRoles: [],
                    competitiveEvents: [],
                    badges: [],
                    totalXP: (userData as any).totalXP || 0,
                    level: (userData as any).level || 1,
                    contactPreferences: { email: true, push: true, sms: false },
                    privacySettings: { showProfile: true, showBadges: true, showEvents: true },
                }));

                dispatch(completeOnboarding());
            } catch (err) {
                console.error("Login failed:", err);
            }
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Header */}
                    <View style={styles.header}>
                        <TouchableOpacity
                            style={styles.backButton}
                            onPress={() => navigation.goBack()}
                        >
                            <Ionicons name="arrow-back" size={24} color={colors.neutral[900]} />
                        </TouchableOpacity>
                        <Text style={styles.title}>Welcome Back</Text>
                        <Text style={styles.subtitle}>
                            Sign in to continue your FBLA journey
                        </Text>
                    </View>

                    {/* Form */}
                    <View style={styles.form}>
                        <TextInput
                            label="Email"
                            value={email}
                            onChangeText={setEmail}
                            mode="outlined"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoComplete="email"
                            style={styles.input}
                            outlineColor={colors.neutral[300]}
                            activeOutlineColor={colors.primary[600]}
                            error={!!emailError}
                            left={<TextInput.Icon icon="email-outline" />}
                        />
                        {emailError ? (
                            <HelperText type="error" visible={!!emailError}>
                                {emailError}
                            </HelperText>
                        ) : null}

                        <TextInput
                            label="Password"
                            value={password}
                            onChangeText={setPassword}
                            mode="outlined"
                            secureTextEntry={!showPassword}
                            style={styles.input}
                            outlineColor={colors.neutral[300]}
                            activeOutlineColor={colors.primary[600]}
                            error={!!passwordError}
                            left={<TextInput.Icon icon="lock-outline" />}
                            right={
                                <TextInput.Icon
                                    icon={showPassword ? 'eye-off' : 'eye'}
                                    onPress={() => setShowPassword(!showPassword)}
                                />
                            }
                        />
                        {passwordError ? (
                            <HelperText type="error" visible={!!passwordError}>
                                {passwordError}
                            </HelperText>
                        ) : null}

                        <TouchableOpacity style={styles.forgotPassword}>
                            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                        </TouchableOpacity>

                        {error ? (
                            <View style={styles.errorContainer}>
                                <Text style={styles.errorText}>{error}</Text>
                            </View>
                        ) : null}

                        <Button
                            mode="contained"
                            onPress={handleLogin}
                            loading={isLoading}
                            disabled={isLoading}
                            style={styles.loginButton}
                            contentStyle={styles.buttonContent}
                            labelStyle={styles.buttonLabel}
                        >
                            Sign In
                        </Button>

                        <View style={styles.divider}>
                            <View style={styles.dividerLine} />
                            <Text style={styles.dividerText}>or</Text>
                            <View style={styles.dividerLine} />
                        </View>

                        <Button
                            mode="outlined"
                            onPress={() => { }}
                            style={styles.socialButton}
                            contentStyle={styles.buttonContent}
                            icon="google"
                        >
                            Continue with Google
                        </Button>
                    </View>

                    {/* Footer */}
                    <View style={styles.footer}>
                        <Text style={styles.footerText}>Don't have an account? </Text>
                        <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
                            <Text style={styles.signUpLink}>Sign Up</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: spacing.lg,
    },
    header: {
        paddingTop: spacing.md,
        paddingBottom: spacing.xl,
    },
    backButton: {
        marginBottom: spacing.lg,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.neutral[100],
        justifyContent: 'center',
        alignItems: 'center',
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
    form: {
        flex: 1,
    },
    input: {
        marginBottom: spacing.sm,
        backgroundColor: '#FFFFFF',
    },
    forgotPassword: {
        alignSelf: 'flex-end',
        marginBottom: spacing.lg,
    },
    forgotPasswordText: {
        color: colors.primary[600],
        fontSize: typography.fontSize.sm,
        fontWeight: '500',
    },
    errorContainer: {
        backgroundColor: colors.error.light,
        padding: spacing.md,
        borderRadius: borderRadius.md,
        marginBottom: spacing.md,
    },
    errorText: {
        color: colors.error.dark,
        fontSize: typography.fontSize.sm,
    },
    loginButton: {
        borderRadius: borderRadius.lg,
        marginBottom: spacing.lg,
    },
    buttonContent: {
        paddingVertical: spacing.sm,
    },
    buttonLabel: {
        fontSize: typography.fontSize.md,
        fontWeight: '600',
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.lg,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: colors.neutral[200],
    },
    dividerText: {
        marginHorizontal: spacing.md,
        color: colors.neutral[500],
        fontSize: typography.fontSize.sm,
    },
    socialButton: {
        borderRadius: borderRadius.lg,
        borderColor: colors.neutral[300],
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        paddingVertical: spacing.xl,
    },
    footerText: {
        color: colors.neutral[500],
        fontSize: typography.fontSize.md,
    },
    signUpLink: {
        color: colors.primary[600],
        fontSize: typography.fontSize.md,
        fontWeight: '600',
    },
});
