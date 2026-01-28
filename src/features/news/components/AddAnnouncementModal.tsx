import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Modal, Portal, Text, TextInput, Button, HelperText, SegmentedButtons } from 'react-native-paper';
import { colors, spacing, borderRadius } from '../../../shared/theme';
import { Ionicons } from '@expo/vector-icons';
import { useMutation } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { useAppSelector } from '../../../shared/hooks/useRedux';

interface AddAnnouncementModalProps {
    visible: boolean;
    onDismiss: () => void;
    onSuccess: () => void;
}

export default function AddAnnouncementModal({ visible, onDismiss, onSuccess }: AddAnnouncementModalProps) {
    const user = useAppSelector(state => state.auth.user);
    const createAnnouncement = useMutation(api.news.createAnnouncement);

    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [summary, setSummary] = useState('');
    const [category, setCategory] = useState('announcement');
    const [priority, setPriority] = useState('normal');
    const [tags, setTags] = useState('');
    const [linkUrl, setLinkUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async () => {
        if (!title || !content || !summary) {
            setError('Please fill in all required fields (Title, Content, Summary).');
            return;
        }

        if (!user || user.role !== 'adviser') {
            setError('Only advisors can create announcements.');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const tagsArray = tags
                .split(',')
                .map(tag => tag.trim())
                .filter(tag => tag.length > 0);

            await createAnnouncement({
                title,
                content,
                summary,
                chapterId: user.chapterName || '',
                authorName: user.displayName || 'Advisor',
                category,
                priority: priority as 'normal' | 'high' | 'urgent',
                tags: tagsArray,
                linkUrl: linkUrl || undefined,
            });

            // Reset form
            setTitle('');
            setContent('');
            setSummary('');
            setCategory('announcement');
            setPriority('normal');
            setTags('');
            setLinkUrl('');

            onSuccess();
            onDismiss();
        } catch (err) {
            console.error(err);
            setError(err instanceof Error ? err.message : 'Failed to create announcement.');
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
                    <Text style={styles.title}>Create Announcement</Text>
                    <TouchableOpacity onPress={onDismiss}>
                        <Ionicons name="close" size={24} color={colors.neutral[500]} />
                    </TouchableOpacity>
                </View>

                <ScrollView style={styles.form} contentContainerStyle={styles.formContent}>
                    <TextInput
                        mode="outlined"
                        label="Title *"
                        value={title}
                        onChangeText={setTitle}
                        style={styles.input}
                        activeOutlineColor={colors.primary[600]}
                    />

                    <TextInput
                        mode="outlined"
                        label="Summary *"
                        value={summary}
                        onChangeText={setSummary}
                        multiline
                        numberOfLines={2}
                        style={styles.input}
                        activeOutlineColor={colors.primary[600]}
                        placeholder="Brief summary of the announcement"
                    />

                    <TextInput
                        mode="outlined"
                        label="Content *"
                        value={content}
                        onChangeText={setContent}
                        multiline
                        numberOfLines={6}
                        style={styles.input}
                        activeOutlineColor={colors.primary[600]}
                        placeholder="Full announcement content"
                    />

                    <Text style={styles.label}>Category</Text>
                    <SegmentedButtons
                        value={category}
                        onValueChange={setCategory}
                        buttons={[
                            { value: 'announcement', label: 'Announcement' },
                            { value: 'event', label: 'Event' },
                            { value: 'update', label: 'Update' },
                            { value: 'alert', label: 'Alert' },
                        ]}
                        style={styles.segmented}
                        density="small"
                        theme={{ colors: { secondaryContainer: colors.primary[100] } }}
                    />

                    <Text style={styles.label}>Priority</Text>
                    <SegmentedButtons
                        value={priority}
                        onValueChange={setPriority}
                        buttons={[
                            { value: 'normal', label: 'Normal' },
                            { value: 'high', label: 'High' },
                            { value: 'urgent', label: 'Urgent' },
                        ]}
                        style={styles.segmented}
                        density="small"
                        theme={{ colors: { secondaryContainer: colors.primary[100] } }}
                    />

                    <TextInput
                        mode="outlined"
                        label="Tags (comma-separated)"
                        value={tags}
                        onChangeText={setTags}
                        style={styles.input}
                        activeOutlineColor={colors.primary[600]}
                        placeholder="e.g., Meeting, Competition, Deadline"
                    />

                    <TextInput
                        mode="outlined"
                        label="Link URL (optional)"
                        value={linkUrl}
                        onChangeText={setLinkUrl}
                        style={styles.input}
                        activeOutlineColor={colors.primary[600]}
                        placeholder="https://..."
                        keyboardType="url"
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
                        Publish Announcement
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
        maxHeight: '85%',
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
        maxHeight: 600,
    },
    formContent: {
        padding: spacing.lg,
    },
    input: {
        marginBottom: spacing.md,
        backgroundColor: '#FFFFFF',
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
