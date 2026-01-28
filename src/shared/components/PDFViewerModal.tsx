import React, { useState, useEffect } from 'react';
import {
    View,
    StyleSheet,
    Modal,
    TouchableOpacity,
    SafeAreaView,
    ActivityIndicator,
    Dimensions,
    Platform,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { Text } from 'react-native-paper';
import { colors, spacing, borderRadius } from '../theme';

interface PDFViewerModalProps {
    visible: boolean;
    url: string | null;
    title?: string;
    onClose: () => void;
}

export default function PDFViewerModal({ visible, url, title = 'PDF Viewer', onClose }: PDFViewerModalProps) {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);

    useEffect(() => {
        if (visible && url) {
            setIsLoading(true);
            setError(null);
            // For PDFs, we can use the URL directly with Google Docs Viewer or display directly
            // Using direct PDF URL works best in WebView
            setPdfUrl(url);
        }
    }, [visible, url]);

    if (!url) return null;

    // Create a PDF viewer URL - using Google Docs Viewer as fallback for better compatibility
    const viewerUrl = Platform.OS === 'ios' 
        ? url // iOS WebView handles PDFs natively
        : `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`;

    const handleLoadStart = () => {
        setIsLoading(true);
        setError(null);
    };

    const handleLoadEnd = () => {
        setIsLoading(false);
    };

    const handleError = (syntheticEvent: any) => {
        const { nativeEvent } = syntheticEvent;
        console.error('PDF Load Error:', nativeEvent);
        setIsLoading(false);
        setError('Failed to load PDF. Please check your connection.');
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={onClose}
        >
            <SafeAreaView style={styles.container}>
                {/* Enhanced Header */}
                <View style={styles.header}>
                    <View style={styles.headerLeft}>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Ionicons name="close" size={24} color={colors.neutral[700]} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.headerCenter}>
                        <View style={styles.titleRow}>
                            <Ionicons name="document-text" size={20} color={colors.primary[600]} style={styles.titleIcon} />
                            <Text style={styles.title} numberOfLines={1}>{title}</Text>
                        </View>
                        {url && (
                            <Text style={styles.url} numberOfLines={1}>
                                {url.replace(/^https?:\/\//, '').split('/').pop() || 'PDF Document'}
                            </Text>
                        )}
                    </View>

                    <View style={styles.headerRight}>
                        <TouchableOpacity style={styles.actionButton}>
                            <Ionicons name="share-outline" size={20} color={colors.primary[600]} />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* PDF Viewer */}
                <View style={styles.viewerContainer}>
                    {error ? (
                        <View style={styles.errorContainer}>
                            <Ionicons name="alert-circle-outline" size={64} color={colors.error.main} />
                            <Text style={styles.errorText}>{error}</Text>
                            <TouchableOpacity style={styles.retryButton} onPress={() => setPdfUrl(url)}>
                                <Text style={styles.retryText}>Retry</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <>
                            <WebView
                                source={{ uri: pdfUrl || url }}
                                onLoadStart={handleLoadStart}
                                onLoadEnd={handleLoadEnd}
                                onError={handleError}
                                style={styles.webView}
                                startInLoadingState={true}
                                scalesPageToFit={true}
                                javaScriptEnabled={true}
                                domStorageEnabled={true}
                                renderLoading={() => (
                                    <View style={styles.loadingContainer}>
                                        <ActivityIndicator size="large" color={colors.primary[600]} />
                                        <Text style={styles.loadingText}>Loading PDF...</Text>
                                    </View>
                                )}
                            />
                            {isLoading && (
                                <View style={styles.loadingOverlay}>
                                    <ActivityIndicator size="large" color={colors.primary[600]} />
                                    <Text style={styles.loadingText}>Loading PDF...</Text>
                                </View>
                            )}
                        </>
                    )}
                </View>
            </SafeAreaView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.neutral[100],
        backgroundColor: '#FFFFFF',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
    },
    headerLeft: {
        width: 44,
        alignItems: 'flex-start',
    },
    headerCenter: {
        flex: 1,
        alignItems: 'center',
        paddingHorizontal: spacing.sm,
    },
    headerRight: {
        width: 44,
        alignItems: 'flex-end',
    },
    closeButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.neutral[50],
        justifyContent: 'center',
        alignItems: 'center',
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    titleIcon: {
        marginRight: 8,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.neutral[900],
        letterSpacing: -0.3,
    },
    url: {
        fontSize: 11,
        color: colors.neutral[500],
        fontWeight: '500',
    },
    actionButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.primary[50],
        justifyContent: 'center',
        alignItems: 'center',
    },
    viewerContainer: {
        flex: 1,
        position: 'relative',
        backgroundColor: colors.neutral[50],
    },
    webView: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    loadingContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
    },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
    },
    loadingText: {
        marginTop: spacing.md,
        fontSize: 14,
        color: colors.neutral[600],
        fontWeight: '500',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.xl,
    },
    errorText: {
        marginTop: spacing.md,
        fontSize: 16,
        color: colors.neutral[700],
        textAlign: 'center',
        marginBottom: spacing.lg,
    },
    retryButton: {
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        backgroundColor: colors.primary[600],
        borderRadius: borderRadius.md,
    },
    retryText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
});
