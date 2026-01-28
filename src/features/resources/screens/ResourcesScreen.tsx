// FBLA Connect - Resources Screen
import React, { useState, useEffect } from 'react';
import {
    View,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Dimensions,
} from 'react-native';
import { Text, Searchbar, IconButton, ProgressBar, Card } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { MotiView } from 'moti';
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
import PDFViewerModal from '../../../shared/components/PDFViewerModal';
import { colors, spacing, typography, borderRadius } from '../../../shared/theme';

const { width } = Dimensions.get('window');

const realResources: Resource[] = [
    {
        id: 'res-guidelines-26',
        title: '2025-2026 Competitive Events Guidelines',
        description: 'The official comprehensive guide for all High School competitive events, including rules and format.',
        type: 'pdf',
        category: 'guidelines',
        url: 'https://www.fbla.org/wp-content/uploads/2024/08/2025-2026-Competitive-Events-Guidelines.pdf',
        fileSize: 3200000,
        lastUpdated: '2024-08-15T00:00:00Z',
        tags: ['Competition', 'Guidelines', 'Official', '2025-2026'],
        relatedEvents: [],
        isFavorite: false,
        isDownloaded: false,
    },
    {
        id: 'res-dress-code',
        title: 'FBLA Professional Dress Code',
        description: 'Official National FBLA guidelines for professional attire at conferences and competitions.',
        type: 'pdf',
        category: 'dress-code',
        url: 'https://www.fbla.org/wp-content/uploads/2023/07/FBLA-Dress-Code.pdf',
        fileSize: 450000,
        lastUpdated: '2023-07-01T00:00:00Z',
        tags: ['Dress Code', 'Professional', 'Etiquette'],
        relatedEvents: [],
        isFavorite: true,
        isDownloaded: false,
    },
    {
        id: 'res-format-guide',
        title: 'Format Guide & Sample Documents',
        description: 'Standardized formatting for business reports, letters, and production events.',
        type: 'pdf',
        category: 'guidelines',
        url: 'https://www.fbla.org/wp-content/uploads/2023/08/2023-24-Format-Guide.pdf',
        fileSize: 1200000,
        lastUpdated: '2023-08-01T00:00:00Z',
        tags: ['Formatting', 'Reports', 'Production'],
        relatedEvents: [],
        isFavorite: false,
        isDownloaded: false,
    },
    {
        id: 'res-general-rubric',
        title: 'General Presentation Rubric',
        description: 'The standard rubric used for most individual and team presentation events.',
        type: 'pdf',
        category: 'rubrics',
        url: 'https://www.fbla.org/wp-content/uploads/2024/08/2025-2026-Competitive-Events-Guidelines.pdf',
        fileSize: 500000,
        lastUpdated: '2024-08-01T00:00:00Z',
        tags: ['Rubric', 'Presentation', 'Judging'],
        relatedEvents: [],
        isFavorite: false,
        isDownloaded: false,
    }
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
    const { resources, searchQuery, downloadProgress } = useAppSelector(state => state.resources);
    const [selectedCategory, setSelectedCategory] = useState<ResourceCategory | 'all'>('all');
    const [browserUrl, setBrowserUrl] = useState<string | null>(null);

    useEffect(() => {
        dispatch(setResources(realResources));
    }, []);

    const filteredResources = (resources.length > 0 ? resources : realResources).filter(resource => {
        const matchesSearch = resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            resource.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            resource.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesCategory = selectedCategory === 'all' || resource.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const handleDownload = async (resourceId: string) => {
        for (let i = 0; i <= 100; i += 10) {
            dispatch(setDownloadProgress({ resourceId, progress: i }));
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        dispatch(markAsDownloaded({ resourceId, localPath: `/local/${resourceId}.pdf` }));
    };

    const handleOpenResource = (resource: Resource) => {
        if (resource.type === 'pdf') {
            setBrowserUrl(resource.url);
        } else {
            // For non-PDF resources, use InAppBrowserModal or Linking
            setBrowserUrl(resource.url);
        }
    };

    return (
        <View style={styles.container}>
            {/* Enhanced Header */}
            <View style={styles.headerContainer}>
                <View style={styles.headerGradient}>
                    <Text style={styles.headerTitle}>Resources</Text>
                    <Text style={styles.headerSubtitle}>FBLA Documents & Guidelines</Text>
                </View>
                <View style={styles.searchContainer}>
                    <View style={styles.searchWrapper}>
                        <Searchbar
                            placeholder="Search rubrics, dress code..."
                            onChangeText={text => dispatch(setSearchQuery(text))}
                            value={searchQuery}
                            style={styles.searchbar}
                            inputStyle={styles.searchInput}
                            iconColor={colors.neutral[400]}
                            placeholderTextColor={colors.neutral[400]}
                        />
                    </View>
                </View>
            </View>

            {/* Quick Access to Competitions */}
            <MotiView
                from={{ opacity: 0, translateY: -20 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ type: 'spring', damping: 12 }}
            >
                <TouchableOpacity
                    onPress={() => navigation.navigate('CompetitiveEvents')}
                    activeOpacity={0.8}
                >
                    <Card style={styles.competeCard}>
                        <View style={styles.competeContent}>
                            <View>
                                <Text style={styles.competeTitle}>Competition Hub</Text>
                                <Text style={styles.competeSubtitle}>Rubrics & Study Resources</Text>
                            </View>
                            <View style={styles.trophyIcon}>
                                <Ionicons name="ribbon" size={28} color="#FFFFFF" />
                            </View>
                        </View>
                    </Card>
                </TouchableOpacity>
            </MotiView>

            {/* Category Filters */}
            <View style={styles.filterContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
                    {categoryFilters.map(filter => (
                        <TouchableOpacity key={filter.id} onPress={() => setSelectedCategory(filter.id)}>
                            <View
                                style={[
                                    styles.filterChip,
                                    selectedCategory === filter.id ? styles.filterChipSelected : styles.filterChipUnselected
                                ]}
                            >
                                <Ionicons
                                    name={filter.icon as any}
                                    size={16}
                                    color={selectedCategory === filter.id ? '#FFFFFF' : colors.neutral[500]}
                                    style={{ marginRight: 6 }}
                                />
                                <Text style={[styles.filterLabel, selectedCategory === filter.id && styles.filterLabelSelected]}>
                                    {filter.label}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* Resources List */}
            <ScrollView style={styles.resourcesList} showsVerticalScrollIndicator={false}>
                {filteredResources.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Ionicons name="search-outline" size={48} color={colors.neutral[200]} />
                        <Text style={styles.emptyText}>No documentation found</Text>
                    </View>
                ) : (
                    filteredResources.map((resource, index) => (
                        <MotiView
                            key={resource.id}
                            from={{ opacity: 0, translateY: 20 }}
                            animate={{ opacity: 1, translateY: 0 }}
                            transition={{ delay: index * 50 }}
                        >
                            <ResourceCard
                                resource={resource}
                                downloadProgress={downloadProgress[resource.id]}
                                onDownload={() => handleDownload(resource.id)}
                                onToggleFavorite={() => dispatch(toggleFavorite(resource.id))}
                                onPress={() => handleOpenResource(resource)}
                            />
                        </MotiView>
                    ))
                )}
                <View style={{ height: 120 }} />
            </ScrollView>
            {/* PDF Viewer Modal */}
            {browserUrl && (
                <PDFViewerModal
                    visible={!!browserUrl}
                    url={browserUrl}
                    onClose={() => setBrowserUrl(null)}
                    title={filteredResources.find(r => r.url === browserUrl)?.title || "PDF Document"}
                />
            )}
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
    onPress: (resource: Resource) => void;
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
        <TouchableOpacity onPress={() => onPress(resource)} activeOpacity={0.8}>
            <Card style={styles.resourceCard}>
                <Card.Content style={styles.resourceContent}>
                    <View style={styles.resourceIcon}>
                        <Ionicons
                            name={getTypeIcon(resource.type) as any}
                            size={24}
                            color={resource.category === 'dress-code' ? colors.secondary[500] : colors.primary[600]}
                        />
                    </View>

                    <View style={styles.resourceInfo}>
                        <Text style={styles.resourceTitle} numberOfLines={1}>
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
                                    <Ionicons name="shield-checkmark" size={10} color={colors.primary[600]} />
                                    <Text style={styles.downloadedText}>Offline Available</Text>
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
                            iconColor={resource.isFavorite ? '#EC4899' : colors.neutral[300]}
                            size={22}
                            onPress={onToggleFavorite}
                        />
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
    headerContainer: {
        backgroundColor: colors.primary[600],
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        paddingBottom: spacing.md,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    headerGradient: {
        paddingTop: spacing.xl * 1.5,
        paddingHorizontal: spacing.lg,
        paddingBottom: spacing.md,
    },
    headerTitle: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#FFFFFF',
        letterSpacing: -0.5,
        marginBottom: 4,
    },
    headerSubtitle: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.9)',
        fontWeight: '500',
    },
    searchContainer: {
        paddingHorizontal: spacing.md,
        marginTop: spacing.sm,
    },
    header: {
        padding: spacing.md,
    },
    searchWrapper: {
        borderRadius: borderRadius.lg,
        backgroundColor: '#FFFFFF',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    searchbar: {
        elevation: 0,
        backgroundColor: 'transparent',
    },
    searchInput: {
        fontSize: 14,
        color: colors.neutral[900],
    },
    filterContainer: {
        paddingBottom: spacing.sm,
        marginTop: spacing.sm,
    },
    filterRow: {
        paddingHorizontal: spacing.md,
        gap: spacing.sm,
    },
    filterChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    filterChipUnselected: {
        backgroundColor: '#FFFFFF',
        elevation: 2,
    },
    filterChipSelected: {
        backgroundColor: colors.primary[600],
        elevation: 4,
    },
    filterLabel: {
        fontSize: 12,
        color: colors.neutral[600],
        fontWeight: '700',
    },
    filterLabelSelected: {
        color: '#FFFFFF',
    },
    resourcesList: {
        flex: 1,
        padding: spacing.md,
    },
    resourceCard: {
        marginBottom: spacing.sm,
        borderRadius: 20,
        backgroundColor: '#FFFFFF',
        elevation: 2,
    },
    resourceContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    resourceIcon: {
        width: 48,
        height: 48,
        borderRadius: 14,
        backgroundColor: colors.primary[50], // We can dynamicize this
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.md,
    },
    resourceInfo: {
        flex: 1,
    },
    resourceTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.neutral[900],
        marginBottom: 2,
    },
    resourceDescription: {
        fontSize: 12,
        color: colors.neutral[500],
        lineHeight: 18,
        marginBottom: 4,
    },
    resourceMeta: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    resourceSize: {
        fontSize: 10,
        color: colors.neutral[400],
        fontWeight: '600',
    },
    downloadedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: spacing.sm,
        backgroundColor: colors.primary[50],
        paddingHorizontal: 6,
        paddingVertical: 1,
        borderRadius: 4,
    },
    downloadedText: {
        fontSize: 9,
        color: colors.primary[600],
        marginLeft: 4,
        fontWeight: '800',
        textTransform: 'uppercase',
    },
    progressBar: {
        marginTop: 6,
        height: 3,
        borderRadius: 2,
    },
    resourceActions: {
        marginLeft: spacing.xs,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 100,
    },
    emptyText: {
        fontSize: 14,
        color: colors.neutral[400],
        marginTop: spacing.md,
    },
    competeCard: {
        marginHorizontal: spacing.md,
        borderRadius: 24,
        backgroundColor: colors.primary[600],
        elevation: 4,
        marginBottom: spacing.md,
    },
    competeContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: spacing.lg,
    },
    competeTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    competeSubtitle: {
        fontSize: 13,
        color: 'rgba(255, 255, 255, 0.8)',
        marginTop: 2,
    },
    trophyIcon: {
        width: 52,
        height: 52,
        borderRadius: 16,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
});
