import React, { useState, useMemo } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, Keyboard } from 'react-native';
import { Text, TextInput, Button, Card, Divider } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '../../../shared/navigation/types';
import { useAppDispatch } from '../../../shared/hooks/useRedux';
import { updateUser } from '../authSlice';
import { colors, spacing, typography, borderRadius } from '../../../shared/theme';
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";

// Import scraped data
const CHAPTER_DATA = require('../../../assets/data/chapters_dataset.json') as Chapter[];

interface Chapter {
    name: string;
    location: string;
    state: string;
    advisor: string;
}

type Props = {
    navigation: NativeStackNavigationProp<OnboardingStackParamList, 'SchoolInfo'>;
};

export default function SchoolInfoScreen({ navigation }: Props) {
    const dispatch = useAppDispatch();
    const [searchQuery, setSearchQuery] = useState('');
    const [schoolName, setSchoolName] = useState('');
    const [chapterName, setChapterName] = useState('');
    const [state, setState] = useState('');
    const [showResults, setShowResults] = useState(false);
    const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);

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
        setSelectedChapter(chapter);
        setSchoolName(chapter.name);
        setChapterName(chapter.name); // Default chapter name to school name
        setState(chapter.location?.split(',')[1]?.trim() || chapter.state || '');
        setSearchQuery(chapter.name);
        setShowResults(false);
        Keyboard.dismiss();
    };

    const handleClearSelection = () => {
        setSelectedChapter(null);
        setSchoolName('');
        setChapterName('');
        setState('');
        setSearchQuery('');
    };

    const updateConvexUser = useMutation(api.users.updateUser);

    const handleContinue = async () => {
        try {
            await updateConvexUser({
                schoolName,
                chapterName,
                state
            });
            dispatch(updateUser({ schoolName, chapterName, state }));
            navigation.navigate('Interests');
        } catch (error) {
            console.error("Failed to update user in Convex:", error);
            // Fallback to local state if DB update fails
            dispatch(updateUser({ schoolName, chapterName, state }));
            navigation.navigate('Interests');
        }
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
                    <Text style={styles.label}>Search for your Chapter</Text>
                    <TextInput
                        label="School or City"
                        value={searchQuery}
                        onChangeText={(text: string) => {
                            setSearchQuery(text);
                            setShowResults(true);
                        }}
                        mode="outlined"
                        style={styles.input}
                        outlineColor={colors.neutral[300]}
                        activeOutlineColor={colors.primary[600]}
                        left={<TextInput.Icon icon="magnify" />}
                        right={searchQuery ? <TextInput.Icon icon="close" onPress={handleClearSelection} /> : null}
                        placeholder="Search schools..."
                    />

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

                    {!showResults && selectedChapter && (
                        <View style={styles.selectionInfo}>
                            <Divider style={styles.divider} />

                            <TextInput
                                label="School Name"
                                value={schoolName}
                                onChangeText={setSchoolName}
                                mode="outlined"
                                style={styles.input}
                                outlineColor={colors.neutral[300]}
                                activeOutlineColor={colors.primary[600]}
                                left={<TextInput.Icon icon="school-outline" />}
                                editable={false}
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
                                editable={false}
                            />
                        </View>
                    )}

                    {!selectedChapter && !showResults && (
                        <View style={styles.manualEntry}>
                            <Text style={styles.manualText}>Can't find your chapter? Try searching for the city or enter details manually above.</Text>
                        </View>
                    )}
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
    label: {
        fontSize: typography.fontSize.sm,
        fontWeight: '600',
        color: colors.neutral[700],
        marginBottom: spacing.xs,
        marginTop: spacing.md,
    },
    input: {
        marginBottom: spacing.md,
        backgroundColor: '#FFFFFF',
    },
    resultsContainer: {
        marginTop: spacing.xs,
        marginBottom: spacing.lg,
    },
    resultCard: {
        marginBottom: spacing.sm,
        backgroundColor: colors.neutral[50],
        borderRadius: borderRadius.md,
        borderWidth: 1,
        borderColor: colors.neutral[200],
    },
    resultContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: spacing.sm,
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
        marginTop: spacing.md,
    },
    divider: {
        marginBottom: spacing.lg,
        backgroundColor: colors.neutral[200],
    },
    manualEntry: {
        padding: spacing.md,
        backgroundColor: colors.primary[50],
        borderRadius: borderRadius.md,
        marginTop: spacing.lg,
    },
    manualText: {
        fontSize: typography.fontSize.sm,
        color: colors.primary[600],
        lineHeight: 20,
        textAlign: 'center',
    },
    footer: {
        padding: spacing.lg,
        paddingBottom: spacing.xl,
    },
    continueButton: {
        borderRadius: borderRadius.lg,
        backgroundColor: colors.primary[600],
    },
    buttonContent: {
        paddingVertical: spacing.sm,
    },
    buttonLabel: {
        fontSize: typography.fontSize.md,
        fontWeight: '600',
        color: '#FFFFFF',
    },
});
