// FBLA Connect - Sign Up Screen
import React, { useState } from 'react';
import {
    View,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    TouchableOpacity,
} from 'react-native';
import { Text, TextInput, Button, HelperText, Checkbox } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../../shared/navigation/types';
import { useAppDispatch, useAppSelector } from '../../../shared/hooks/useRedux';
import { loginSuccess } from '../authSlice';
import { colors, spacing, typography, borderRadius } from '../../../shared/theme';
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";

type Props = {
    navigation: NativeStackNavigationProp<AuthStackParamList, 'SignUp'>;
};

export default function SignUpScreen({ navigation }: Props) {
    const dispatch = useAppDispatch();
    const { isLoading } = useAppSelector(state => state.auth);

    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [agreeToTerms, setAgreeToTerms] = useState(false);

    const [errors, setErrors] = useState({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
        terms: '',
    });

    const validateForm = () => {
        const newErrors = {
            fullName: '',
            email: '',
            password: '',
            confirmPassword: '',
            terms: '',
        };
        let isValid = true;

        if (!fullName.trim()) {
            newErrors.fullName = 'Full name is required';
            isValid = false;
        }

        if (!email) {
            newErrors.email = 'Email is required';
            isValid = false;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            newErrors.email = 'Please enter a valid email';
            isValid = false;
        }

        if (!password) {
            newErrors.password = 'Password is required';
            isValid = false;
        } else if (password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters';
            isValid = false;
        } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
            newErrors.password = 'Password must include uppercase, lowercase, and number';
            isValid = false;
        }

        if (password !== confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
            isValid = false;
        }

        if (!agreeToTerms) {
            newErrors.terms = 'You must agree to the terms and conditions';
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const storeUser = useMutation(api.users.storeUser);

    const handleSignUp = async () => {
        if (validateForm()) {
            try {
                // Store user in Convex DB
                const userId = await storeUser({
                    email: email,
                    displayName: fullName,
                    role: 'member',
                });

                // Update Redux state
                const newUser = {
                    id: userId,
                    email: email,
                    displayName: fullName,
                    role: 'member' as const,
                    createdAt: new Date().toISOString(),
                };

                dispatch(loginSuccess(newUser));
                // Will automatically navigate since isAuthenticated becomes true
            } catch (error) {
                console.error("Failed to store user in database:", error);
                setErrors(prev => ({ ...prev, terms: 'Failed to create account in database. Please try again.' }));
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
                        <Text style={styles.title}>Create Account</Text>
                        <Text style={styles.subtitle}>
                            Join thousands of FBLA members
                        </Text>
                    </View>

                    {/* Progress indicator */}
                    <View style={styles.progressContainer}>
                        <View style={[styles.progressDot, styles.progressDotActive]} />
                        <View style={styles.progressLine} />
                        <View style={styles.progressDot} />
                        <View style={styles.progressLine} />
                        <View style={styles.progressDot} />
                    </View>

                    {/* Form */}
                    <View style={styles.form}>
                        <TextInput
                            label="Full Name"
                            value={fullName}
                            onChangeText={setFullName}
                            mode="outlined"
                            autoComplete="name"
                            style={styles.input}
                            outlineColor={colors.neutral[300]}
                            activeOutlineColor={colors.primary[600]}
                            error={!!errors.fullName}
                            left={<TextInput.Icon icon="account-outline" />}
                        />
                        {errors.fullName ? (
                            <HelperText type="error">{errors.fullName}</HelperText>
                        ) : null}

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
                            error={!!errors.email}
                            left={<TextInput.Icon icon="email-outline" />}
                        />
                        {errors.email ? (
                            <HelperText type="error">{errors.email}</HelperText>
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
                            error={!!errors.password}
                            textContentType="oneTimeCode"
                            autoComplete="off"
                            left={<TextInput.Icon icon="lock-outline" />}
                            right={
                                <TextInput.Icon
                                    icon={showPassword ? 'eye-off' : 'eye'}
                                    onPress={() => setShowPassword(!showPassword)}
                                />
                            }
                        />
                        {errors.password ? (
                            <HelperText type="error">{errors.password}</HelperText>
                        ) : null}

                        <TextInput
                            label="Confirm Password"
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            mode="outlined"
                            secureTextEntry={!showPassword}
                            style={styles.input}
                            outlineColor={colors.neutral[300]}
                            activeOutlineColor={colors.primary[600]}
                            error={!!errors.confirmPassword}
                            textContentType="oneTimeCode"
                            autoComplete="off"
                            left={<TextInput.Icon icon="lock-check-outline" />}
                        />
                        {errors.confirmPassword ? (
                            <HelperText type="error">{errors.confirmPassword}</HelperText>
                        ) : null}

                        <View style={styles.termsContainer}>
                            <View style={styles.checkboxWrapper}>
                                <Checkbox
                                    status={agreeToTerms ? 'checked' : 'unchecked'}
                                    onPress={() => setAgreeToTerms(!agreeToTerms)}
                                    color={colors.primary[600]}
                                />
                            </View>
                            <Text style={styles.termsText}>
                                I agree to the{' '}
                                <Text style={styles.termsLink}>Terms of Service</Text>
                                {' '}and{' '}
                                <Text style={styles.termsLink}>Privacy Policy</Text>
                            </Text>
                        </View>
                        {errors.terms ? (
                            <HelperText type="error">{errors.terms}</HelperText>
                        ) : null}

                        <Button
                            mode="contained"
                            onPress={handleSignUp}
                            loading={isLoading}
                            disabled={isLoading}
                            style={styles.signUpButton}
                            contentStyle={styles.buttonContent}
                            labelStyle={styles.buttonLabel}
                        >
                            Create Account
                        </Button>
                    </View>

                    {/* Footer */}
                    <View style={styles.footer}>
                        <Text style={styles.footerText}>Already have an account? </Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                            <Text style={styles.loginLink}>Sign In</Text>
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
        paddingBottom: spacing.lg,
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
    progressContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.xl,
    },
    progressDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: colors.neutral[200],
    },
    progressDotActive: {
        backgroundColor: colors.primary[600],
        width: 14,
        height: 14,
        borderRadius: 7,
    },
    progressLine: {
        width: 40,
        height: 2,
        backgroundColor: colors.neutral[200],
        marginHorizontal: spacing.xs,
    },
    form: {
        flex: 1,
    },
    input: {
        marginBottom: spacing.sm,
        backgroundColor: '#FFFFFF',
    },
    termsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.md,
        marginTop: spacing.sm,
    },
    checkboxWrapper: {
        borderWidth: 0.5,
        borderColor: colors.neutral[300],
        borderRadius: borderRadius.sm,
        padding: 0,
    },
    termsText: {
        flex: 1,
        fontSize: typography.fontSize.sm,
        color: colors.neutral[600],
        marginLeft: spacing.xs,
    },
    termsLink: {
        color: colors.primary[600],
        fontWeight: '500',
    },
    signUpButton: {
        borderRadius: borderRadius.lg,
        marginTop: spacing.md,
    },
    buttonContent: {
        paddingVertical: spacing.sm,
    },
    buttonLabel: {
        fontSize: typography.fontSize.md,
        fontWeight: '600',
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
    loginLink: {
        color: colors.primary[600],
        fontSize: typography.fontSize.md,
        fontWeight: '600',
    },
});
