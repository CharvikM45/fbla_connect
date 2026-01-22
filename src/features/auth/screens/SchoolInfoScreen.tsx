// FBLA Connect - School Info Screen (Onboarding)
import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Text, TextInput, Button } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '../../../shared/navigation/types';
import { useAppDispatch } from '../../../shared/hooks/useRedux';
import { updateUser } from '../authSlice';
import { colors, spacing, typography, borderRadius } from '../../../shared/theme';

type Props = {
    navigation: NativeStackNavigationProp<OnboardingStackParamList, 'SchoolInfo'>;
};

export default function SchoolInfoScreen({ navigation }: Props) {
    const dispatch = useAppDispatch();
    const [schoolName, setSchoolName] = useState('');
    const [chapterName, setChapterName] = useState('');
    const [state, setState] = useState('');

    const handleContinue = () => {
        dispatch(updateUser({ schoolName, chapterName, state }));
        navigation.navigate('Interests');
    };

    const isValid = schoolName.trim() && chapterName.trim() && state.trim();

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView style={styles.content}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Ionicons name="arrow-back" size={24} color={colors.neutral[900]} />
                    </TouchableOpacity>
                    <Text style={styles.stepText}>Step 2 of 5</Text>
                    <Text style={styles.title}>Your Chapter</Text>
                    <Text style={styles.subtitle}>
                        Tell us about your school and FBLA chapter
                    </Text>
                </View>

                {/* Form */}
                <View style={styles.form}>
                    <TextInput
                        label="School Name"
                        value={schoolName}
                        onChangeText={setSchoolName}
                        mode="outlined"
                        style={styles.input}
                        outlineColor={colors.neutral[300]}
                        activeOutlineColor={colors.primary[600]}
                        left={<TextInput.Icon icon="school-outline" />}
                    />

                    <TextInput
                        label="Chapter Name"
                        value={chapterName}
                        onChangeText={setChapterName}
                        mode="outlined"
                        style={styles.input}
                        outlineColor={colors.neutral[300]}
                        activeOutlineColor={colors.primary[600]}
                        placeholder="e.g., Lincoln FBLA"
                        left={<TextInput.Icon icon="account-group-outline" />}
                    />

                    <TextInput
                        label="State"
                        value={state}
                        onChangeText={setState}
                        mode="outlined"
                        style={styles.input}
                        outlineColor={colors.neutral[300]}
                        activeOutlineColor={colors.primary[600]}
                        placeholder="e.g., Nebraska"
                        left={<TextInput.Icon icon="map-marker-outline" />}
                    />
                </View>
            </ScrollView>

            {/* Footer */}
            <View style={styles.footer}>
                <Button
                    mode="contained"
                    onPress={handleContinue}
                    disabled={!isValid}
                    style={styles.continueButton}
                    contentStyle={styles.buttonContent}
                    labelStyle={styles.buttonLabel}
                >
                    Continue
                </Button>
            </View>
        </SafeAreaView>
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
    form: {
        flex: 1,
    },
    input: {
        marginBottom: spacing.md,
        backgroundColor: '#FFFFFF',
    },
    footer: {
        padding: spacing.lg,
        paddingBottom: spacing.xl,
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
});
