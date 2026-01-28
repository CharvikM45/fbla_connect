import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { Modal, Portal, Text, TextInput, Button, HelperText, SegmentedButtons } from 'react-native-paper';
import { colors, spacing, borderRadius } from '../../../shared/theme';
import { Ionicons } from '@expo/vector-icons';
import { useMutation } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { useAppSelector } from '../../../shared/hooks/useRedux';

interface AddMeetingModalProps {
    visible: boolean;
    onDismiss: () => void;
    onSuccess: () => void;
}

export default function AddMeetingModal({ visible, onDismiss, onSuccess }: AddMeetingModalProps) {
    const user = useAppSelector(state => state.auth.user);
    const createMeeting = useMutation(api.meetings.createMeeting);

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [date, setDate] = useState(''); // YYYY-MM-DD
    const [time, setTime] = useState(''); // HH:MM
    const [location, setLocation] = useState('');
    const [type, setType] = useState('General');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async () => {
        if (!title || !date || !time || !location) {
            setError('Please fill in all required fields.');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // Combine date and time to ISO string
            const dateTimeString = `${date}T${time}:00`;
            const meetingDate = new Date(dateTimeString);

            if (isNaN(meetingDate.getTime())) {
                throw new Error("Invalid date or time format. Use YYYY-MM-DD and HH:MM.");
            }

            await createMeeting({
                title,
                description,
                date: meetingDate.toISOString(),
                location,
                chapterId: user?.chapterName || "lincoln-high", // Fallback for safety
                type: type as "General" | "Officer" | "Committee",
            });

            // Reset form
            setTitle('');
            setDescription('');
            setDate('');
            setTime('');
            setLocation('');
            setType('General');

            onSuccess();
            onDismiss();
        } catch (err) {
            console.error(err);
            setError(err instanceof Error ? err.message : 'Failed to schedule meeting.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Portal>
            <Modal
                visible={visible}
                onDismiss={onDismiss}
                contentContainerStyle={styles.container}
            >
                <View style={styles.header}>
                    <Text style={styles.title}>Schedule Meeting</Text>
                    <TouchableOpacity onPress={onDismiss}>
                        <Ionicons name="close" size={24} color={colors.neutral[500]} />
                    </TouchableOpacity>
                </View>

                <ScrollView style={styles.form} contentContainerStyle={styles.formContent}>
                    <TextInput
                        mode="outlined"
                        label="Meeting Title *"
                        value={title}
                        onChangeText={setTitle}
                        style={styles.input}
                        activeOutlineColor={colors.primary[600]}
                    />

                    <TextInput
                        mode="outlined"
                        label="Description"
                        value={description}
                        onChangeText={setDescription}
                        multiline
                        numberOfLines={3}
                        style={styles.input}
                        activeOutlineColor={colors.primary[600]}
                    />

                    <View style={styles.row}>
                        <View style={{ flex: 1, marginRight: 8 }}>
                            <TextInput
                                mode="outlined"
                                label="Date (YYYY-MM-DD) *"
                                value={date}
                                onChangeText={setDate}
                                placeholder="2026-02-15"
                                style={styles.input}
                                activeOutlineColor={colors.primary[600]}
                            />
                        </View>
                        <View style={{ flex: 1, marginLeft: 8 }}>
                            <TextInput
                                mode="outlined"
                                label="Time (24h) *"
                                value={time}
                                onChangeText={setTime}
                                placeholder="14:30"
                                style={styles.input}
                                activeOutlineColor={colors.primary[600]}
                            />
                        </View>
                    </View>

                    <TextInput
                        mode="outlined"
                        label="Location *"
                        value={location}
                        onChangeText={setLocation}
                        placeholder="Room 304 / Zoom"
                        style={styles.input}
                        activeOutlineColor={colors.primary[600]}
                    />

                    <Text style={styles.label}>Meeting Type</Text>
                    <SegmentedButtons
                        value={type}
                        onValueChange={setType}
                        buttons={[
                            { value: 'General', label: 'General' },
                            { value: 'Officer', label: 'Officer' },
                            { value: 'Committee', label: 'Committee' },
                        ]}
                        style={styles.segmented}
                        density="small"
                        theme={{ colors: { secondaryContainer: colors.primary[100] } }}
                    />

                    {error && (
                        <HelperText type="error" visible={!!error}>
                            {error}
                        </HelperText>
                    )}

                    <Button
                        mode="contained"
                        onPress={handleSubmit}
                        loading={loading}
                        disabled={loading}
                        style={styles.submitBtn}
                        contentStyle={{ height: 50 }}
                    >
                        Schedule Meeting
                    </Button>
                </ScrollView>
            </Modal>
        </Portal>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'white',
        margin: 20,
        borderRadius: borderRadius.lg,
        maxHeight: '80%',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: colors.neutral[100],
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.neutral[900],
    },
    form: {
        maxHeight: 500,
    },
    formContent: {
        padding: spacing.lg,
    },
    input: {
        marginBottom: spacing.md,
        backgroundColor: '#FFFFFF',
    },
    row: {
        flexDirection: 'row',
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.neutral[700],
        marginBottom: 8,
        marginTop: 4,
    },
    segmented: {
        marginBottom: spacing.lg,
    },
    submitBtn: {
        marginTop: spacing.sm,
        backgroundColor: colors.primary[600],
        borderRadius: borderRadius.md,
    },
});
