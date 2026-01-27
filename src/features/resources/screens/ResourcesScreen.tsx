// FBLA Connect - Resources Screen
import React, { useState, useEffect } from 'react';
import {
    View,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput as RNTextInput,
} from 'react-native';
import { Text, Card, Chip, Searchbar, IconButton, ProgressBar } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAppSelector, useAppDispatch } from '../../../shared/hooks/useRedux';
import {
    setResources,
    toggleFavorite,
    setSearchQuery,
    addToRecentlyViewed,
    setDownloadProgress,
    markAsDownloaded,
    Resource,
    ResourceCategory,
} from '../resourcesSlice';
import { colors, spacing, typography, borderRadius, shadows } from '../../../shared/theme';

// Demo resources
const demoResources: Resource[] = [
    {
        id: '1',
        title: '2025-2026 Competitive Events Guidelines',
        description: 'Complete guide for all FBLA competitive events',
        type: 'pdf',
        category: 'guidelines',
        url: 'https://fbla.org/guidelines.pdf',
        fileSize: 2500000,
        lastUpdated: new Date().toISOString(),
        tags: ['Competition', 'Guidelines', 'Official'],
        relatedEvents: ['mobile-app-dev', 'coding-prog'],
        isFavorite: false,
        isDownloaded: false,
    },
    {
        id: '2',
        title: 'Mobile Application Development Rubric',
        description: 'Scoring rubric for Mobile App Dev competition',
        type: 'pdf',
        category: 'rubrics',
        url: 'https://fbla.org/mad-rubric.pdf',
        fileSize: 500000,
        lastUpdated: new Date().toISOString(),
        tags: ['Mobile App Dev', 'Rubric', 'Scoring'],
        relatedEvents: ['mobile-app-dev'],
        isFavorite: true,
        isDownloaded: true,
    },
    {
        id: '3',
        title: 'Professional Dress Code',
        description: 'FBLA dress code requirements for competitions',
        type: 'pdf',
        category: 'dress-code',
        url: 'https://fbla.org/dress-code.pdf',
        fileSize: 300000,
        lastUpdated: new Date().toISOString(),
        tags: ['Dress Code', 'Professional', 'Competition'],
        relatedEvents: [],
        isFavorite: false,
        isDownloaded: false,
    },
    {
        id: '4',
        title: 'FBLA Code of Conduct',
        description: 'Member code of conduct and ethics guidelines',
        type: 'pdf',
        category: 'code-of-conduct',
        url: 'https://fbla.org/code-of-conduct.pdf',
        fileSize: 200000,
        lastUpdated: new Date().toISOString(),
        tags: ['Ethics', 'Conduct', 'Rules'],
        relatedEvents: [],
        isFavorite: false,
        isDownloaded: false,
    },
    {
        id: '5',
        title: 'Introduction to Business Study Guide',
        description: 'Study materials for Intro to Business event',
        type: 'pdf',
        category: 'study-materials',
        url: 'https://fbla.org/itb-study.pdf',
        fileSize: 1500000,
        lastUpdated: new Date().toISOString(),
        tags: ['Study Guide', 'Intro to Business'],
        relatedEvents: ['intro-business'],
        isFavorite: false,
        isDownloaded: false,
    },
];

const categoryFilters: { id: ResourceCategory | 'all'; label: string; icon: string }[] = [
    { id: 'all', label: 'All', icon: 'apps' },
    { id: 'guidelines', label: 'Guidelines', icon: 'document-text' },
    { id: 'rubrics', label: 'Rubrics', icon: 'list' },
    { id: 'study-materials', label: 'Study', icon: 'school' },
    { id: 'dress-code', label: 'Dress Code', icon: 'shirt' },
];

export default function ResourcesScreen({ navigation }: any) {
    const dispatch = useAppDispatch();
    const { resources, searchQuery, downloadProgress, favorites } = useAppSelector(
        state => state.resources
    );
    const [selectedCategory, setSelectedCategory] = useState<ResourceCategory | 'all'>('all');

    useEffect(() => {
        dispatch(setResources(demoResources));
    }, []);

    const filteredResources = resources.filter(resource => {
        const matchesSearch = resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            resource.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            resource.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

        const matchesCategory = selectedCategory === 'all' || resource.category === selectedCategory;

        return matchesSearch && matchesCategory;
    });

    const handleDownload = async (resourceId: string) => {
        // Simulate download progress
        for (let i = 0; i <= 100; i += 10) {
            dispatch(setDownloadProgress({ resourceId, progress: i }));
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        dispatch(markAsDownloaded({ resourceId, localPath: `/local/${resourceId}.pdf` }));
    };

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    const getCategoryIcon = (category: ResourceCategory) => {
        const icons: Record<ResourceCategory, string> = {
            guidelines: 'document-text',
            rubrics: 'list',
            'dress-code': 'shirt',
            'code-of-conduct': 'shield-checkmark',
            'study-materials': 'school',
            forms: 'clipboard',
            other: 'folder',
        };
        return icons[category] || 'document';
    };

    return (
        <View style={styles.container}>
            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <Searchbar
                    placeholder="Search resources..."
                    onChangeText={text => dispatch(setSearchQuery(text))}
                    value={searchQuery}
                    style={styles.searchbar}
                    inputStyle={styles.searchInput}
                />
            </View>

            {/* Quick Access to Competitions */}
            <TouchableOpacity
                style={styles.competeCard}
                onPress={() => navigation.navigate('CompetitiveEvents')}
            >
                <LinearGradient
                    colors={[colors.primary[600], colors.primary[800]]}
                    style={styles.competeGradient}
                >
                    <View style={styles.competeContent}>
                        <View>
                            <Text style={styles.competeTitle}>Competitive Events</Text>
                            <Text style={styles.competeSubtitle}>Browse 2025-26 guidelines</Text>
                        </View>
                        <Ionicons name="trophy" size={32} color="#FFFFFF" opacity={0.8} />
                    </View>
                </LinearGradient>
            </TouchableOpacity>

            {/* Category Filters */}
            <View style={styles.filterContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={styles.filterRow}>
                        {categoryFilters.map(filter => (
                            <TouchableOpacity
                                key={filter.id}
                                style={[
                                    styles.filterButton,
                                    selectedCategory === filter.id && styles.filterButtonSelected,
                                ]}
                                onPress={() => setSelectedCategory(filter.id)}
                            >
                                <Ionicons
                                    name={filter.icon as any}
                                    size={18}
                                    color={selectedCategory === filter.id ? '#FFFFFF' : colors.neutral[600]}
                                />
                                <Text
                                    style={[
                                        styles.filterLabel,
                                        selectedCategory === filter.id && styles.filterLabelSelected,
                                    ]}
                                >
                                    {filter.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </ScrollView>
            </View>

            {/* Resources List */}
            <ScrollView style={styles.resourcesList}>
                {filteredResources.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Ionicons name="search" size={48} color={colors.neutral[300]} />
                        <Text style={styles.emptyText}>No resources found</Text>
                    </View>
                ) : (
                    filteredResources.map(resource => (
                        <ResourceCard
                            key={resource.id}
                            resource={resource}
                            downloadProgress={downloadProgress[resource.id]}
                            onDownload={() => handleDownload(resource.id)}
                            onToggleFavorite={() => dispatch(toggleFavorite(resource.id))}
                            onPress={() => dispatch(addToRecentlyViewed(resource.id))}
                        />
                    ))
                )}
                <View style={{ height: 100 }} />
            </ScrollView>
        </View>
    );
}

function ResourceCard({
    resource,
    downloadProgress,
    onDownload,
    onToggleFavorite,
    onPress,
}: {
    resource: Resource;
    downloadProgress?: number;
    onDownload: () => void;
    onToggleFavorite: () => void;
    onPress: () => void;
}) {
    const formatFileSize = (bytes?: number) => {
        if (!bytes) return '';
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'pdf': return 'document-text';
            case 'video': return 'play-circle';
            case 'link': return 'link';
            default: return 'document';
        }
    };

    return (
        <TouchableOpacity onPress={onPress}>
            <Card style={styles.resourceCard}>
                <Card.Content style={styles.resourceContent}>
                    <View style={styles.resourceIcon}>
                        <Ionicons
                            name={getTypeIcon(resource.type) as any}
                            size={24}
                            color={colors.primary[600]}
                        />
                    </View>

                    <View style={styles.resourceInfo}>
                        <Text style={styles.resourceTitle} numberOfLines={2}>
                            {resource.title}
                        </Text>
                        <Text style={styles.resourceDescription} numberOfLines={2}>
                            {resource.description}
                        </Text>

                        <View style={styles.resourceMeta}>
                            <Text style={styles.resourceSize}>
                                {formatFileSize(resource.fileSize)}
                            </Text>
                            {resource.isDownloaded && (
                                <View style={styles.downloadedBadge}>
                                    <Ionicons name="cloud-done" size={12} color={colors.success.main} />
                                    <Text style={styles.downloadedText}>Offline</Text>
                                </View>
                            )}
                        </View>

                        {downloadProgress !== undefined && downloadProgress < 100 && (
                            <ProgressBar
                                progress={downloadProgress / 100}
                                color={colors.primary[600]}
                                style={styles.progressBar}
                            />
                        )}
                    </View>

                    <View style={styles.resourceActions}>
                        <IconButton
                            icon={resource.isFavorite ? 'heart' : 'heart-outline'}
                            iconColor={resource.isFavorite ? colors.error.main : colors.neutral[400]}
                            size={20}
                            onPress={onToggleFavorite}
                        />
                        {!resource.isDownloaded && (
                            <IconButton
                                icon="download"
                                iconColor={colors.primary[600]}
                                size={20}
                                onPress={onDownload}
                            />
                        )}
                    </View>
                </Card.Content>
            </Card>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.neutral[50],
    },
    searchContainer: {
        padding: spacing.md,
        backgroundColor: '#FFFFFF',
    },
    searchbar: {
        borderRadius: borderRadius.lg,
        backgroundColor: colors.neutral[100],
        elevation: 0,
    },
    searchInput: {
        fontSize: typography.fontSize.md,
    },
    filterContainer: {
        backgroundColor: '#FFFFFF',
        paddingBottom: spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: colors.neutral[100],
    },
    filterRow: {
        flexDirection: 'row',
        paddingHorizontal: spacing.md,
        gap: spacing.sm,
    },
    filterButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.full,
        backgroundColor: colors.neutral[100],
        gap: spacing.xs,
    },
    filterButtonSelected: {
        backgroundColor: colors.primary[600],
    },
    filterLabel: {
        fontSize: typography.fontSize.sm,
        color: colors.neutral[600],
        fontWeight: '500',
    },
    filterLabelSelected: {
        color: '#FFFFFF',
    },
    resourcesList: {
        flex: 1,
        padding: spacing.md,
    },
    resourceCard: {
        marginBottom: spacing.md,
        borderRadius: borderRadius.lg,
        backgroundColor: '#FFFFFF',
    },
    resourceContent: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    resourceIcon: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: colors.primary[50],
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.md,
    },
    resourceInfo: {
        flex: 1,
    },
    resourceTitle: {
        fontSize: typography.fontSize.md,
        fontWeight: '600',
        color: colors.neutral[900],
        marginBottom: 4,
    },
    resourceDescription: {
        fontSize: typography.fontSize.sm,
        color: colors.neutral[500],
        lineHeight: 20,
        marginBottom: spacing.sm,
    },
    resourceMeta: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    resourceSize: {
        fontSize: typography.fontSize.xs,
        color: colors.neutral[400],
    },
    downloadedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: spacing.sm,
        backgroundColor: colors.success.light,
        paddingHorizontal: spacing.sm,
        paddingVertical: 2,
        borderRadius: borderRadius.full,
    },
    downloadedText: {
        fontSize: typography.fontSize.xs,
        color: colors.success.dark,
        marginLeft: 4,
    },
    progressBar: {
        marginTop: spacing.sm,
        borderRadius: 2,
    },
    resourceActions: {
        flexDirection: 'column',
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: spacing.xxl,
    },
    emptyText: {
        fontSize: typography.fontSize.md,
        color: colors.neutral[400],
        marginTop: spacing.md,
    },
    competeCard: {
        marginHorizontal: spacing.md,
        marginBottom: spacing.md,
        borderRadius: borderRadius.lg,
        overflow: 'hidden',
        ...shadows.md,
    },
    competeGradient: {
        padding: spacing.lg,
    },
    competeContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    competeTitle: {
        fontSize: typography.fontSize.lg,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    competeSubtitle: {
        fontSize: typography.fontSize.sm,
        color: 'rgba(255, 255, 255, 0.8)',
    },
});
