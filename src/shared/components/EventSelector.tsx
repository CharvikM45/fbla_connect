import React, { useState, useMemo } from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    TextInput,
    Animated,
} from 'react-native';
import { Text, Chip, Searchbar, Divider } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography } from '../theme';

interface Event {
    id: string;
    title: string;
    category: string;
}

interface EventSelectorProps {
    allEvents: Event[];
    selectedEvents: string[];
    onToggleEvent: (id: string) => void;
    onSelect?: (id: string) => void;
    placeholder?: string;
}

export default function EventSelector({
    allEvents,
    selectedEvents,
    onToggleEvent,
    onSelect,
    placeholder = "Search events...",
}: EventSelectorProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [isFocused, setIsFocused] = useState(false);

    const filteredEvents = useMemo(() => {
        if (!searchQuery) return [];
        return allEvents.filter(event =>
            !selectedEvents.includes(event.id) &&
            (event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                event.category.toLowerCase().includes(searchQuery.toLowerCase()))
        ).slice(0, 5);
    }, [searchQuery, allEvents, selectedEvents]);

    const handleSelectEvent = (id: string) => {
        onToggleEvent(id);
        if (onSelect) onSelect(id);
        setSearchQuery('');
    };

    const selectedEventObjects = useMemo(() => {
        return selectedEvents.map(id => allEvents.find(e => e.id === id)).filter(Boolean) as Event[];
    }, [selectedEvents, allEvents]);

    return (
        <View style={styles.container}>
            <View style={[styles.inputContainer, isFocused && styles.inputContainerFocused]}>
                <Ionicons name="search" size={20} color={colors.neutral[400]} style={styles.searchIcon} />
                <TextInput
                    style={styles.input}
                    placeholder={placeholder}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setTimeout(() => setIsFocused(false), 200)}
                    placeholderTextColor={colors.neutral[400]}
                />
                {searchQuery.length > 0 && (
                    <TouchableOpacity onPress={() => setSearchQuery('')}>
                        <Ionicons name="close-circle" size={20} color={colors.neutral[400]} />
                    </TouchableOpacity>
                )}
            </View>

            {/* Suggestions Dropdown */}
            {searchQuery.length > 0 && filteredEvents.length > 0 && (
                <View style={styles.suggestionsContainer}>
                    {filteredEvents.map((event) => (
                        <TouchableOpacity
                            key={event.id}
                            style={styles.suggestionItem}
                            onPress={() => handleSelectEvent(event.id)}
                        >
                            <View>
                                <Text style={styles.suggestionTitle}>{event.title}</Text>
                                <Text style={styles.suggestionCategory}>{event.category}</Text>
                            </View>
                            <Ionicons name="add-circle-outline" size={20} color={colors.primary[600]} />
                        </TouchableOpacity>
                    ))}
                </View>
            )}

            {/* Selected Events Chips */}
            <View style={styles.chipsContainer}>
                {selectedEventObjects.map((event) => (
                    <Chip
                        key={event.id}
                        onClose={() => onToggleEvent(event.id)}
                        style={styles.chip}
                        textStyle={styles.chipText}
                        closeIcon={() => <Ionicons name="close-circle" size={16} color="#FFFFFF" />}
                    >
                        {event.title}
                    </Chip>
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.neutral[50],
        borderRadius: 16,
        paddingHorizontal: spacing.md,
        height: 56,
        borderWidth: 1,
        borderColor: colors.neutral[200],
    },
    inputContainerFocused: {
        borderColor: colors.primary[500],
        backgroundColor: '#FFFFFF',
        elevation: 4,
        shadowColor: colors.primary[500],
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    searchIcon: {
        marginRight: spacing.sm,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: colors.neutral[900],
        fontWeight: '500',
    },
    suggestionsContainer: {
        marginTop: spacing.xs,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: colors.neutral[100],
        zIndex: 1000,
    },
    suggestionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.neutral[50],
    },
    suggestionTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: colors.neutral[800],
    },
    suggestionCategory: {
        fontSize: 12,
        color: colors.neutral[500],
        marginTop: 2,
    },
    chipsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: spacing.md,
        gap: spacing.sm,
    },
    chip: {
        backgroundColor: colors.primary[600],
        borderRadius: 12,
    },
    chipText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: 'bold',
    },
});
