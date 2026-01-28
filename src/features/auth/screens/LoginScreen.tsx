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
import { loginSuccess, completeOnboarding, loginFailure, setLoading } from '../authSlice';
import { setProfile } from '../../profile/profileSlice';
import { colors, spacing, typography, borderRadius } from '../../../shared/theme';
import { useMutation, useConvex } from "convex/react";
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
    const convex = useConvex();
    const getUserByEmail = async (args: { email: string }) => {
        return await convex.query(api.users.getUserByEmail, args);
    };

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
                dispatch(setLoading(true));

                // Check if user exists
                // We cast api.users to any to avoid TS errors if codegen hasn't finished indexing the new query
                const existingUser = await getUserByEmail({ email });

                if (!existingUser) {
                    dispatch(loginFailure('Account not found. Please sign up.'));
                    return;
                }

                // Call storeUser to get/update the profile in Convex
                await storeUser({
                    email: email,
                    displayName: existingUser.displayName || email.split('@')[0],
                    role: existingUser.role,
                    schoolName: existingUser.schoolName,
                    chapterName: existingUser.chapterName,
                    state: existingUser.state,
                });

                // Fetch the updated user data
                const updatedUser = await getUserByEmail({ email });
                
                if (!updatedUser) {
                    dispatch(loginFailure('Failed to retrieve user data.'));
                    return;
                }

                const loggedInUser = {
                    id: updatedUser._id,
                    email: updatedUser.email,
                    displayName: updatedUser.displayName,
                    role: updatedUser.role,
                    schoolName: updatedUser.schoolName,
                    chapterName: updatedUser.chapterName,
                    state: updatedUser.state,
                    createdAt: updatedUser.createdAt,
                };

                dispatch(loginSuccess(loggedInUser));

                // Initialize profile state - profile data will be loaded from Convex
                // The ProfileScreen will fetch profile data using useQuery
                dispatch(setProfile({
                    userId: loggedInUser.id,
                    gradeLevel: 11,
                    graduationYear: 2027,
                    interests: updatedUser.interests || ['Business', 'Technology', 'Leadership'],
                    careerGoals: ['Entrepreneurship', 'Marketing'],
                    officerRoles: [],
                    competitiveEvents: [],
                    badges: [],
                    totalXP: 0, // Will be loaded from Convex profile
                    level: 1, // Will be loaded from Convex profile
                    contactPreferences: updatedUser.contactPreferences || { email: true, push: true, sms: false },
                    privacySettings: { showProfile: true, showBadges: true, showEvents: true },
                }));

                dispatch(completeOnboarding());
            } catch (err) {
                console.error("Login failed:", err);
                // Handle Convex errors (like rate limits or network issues)
                dispatch(loginFailure(err instanceof Error ? err.message : 'Login failed'));
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
