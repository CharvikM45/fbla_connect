
import React from 'react';
import { View, StyleSheet, Modal, TouchableOpacity, SafeAreaView, ActivityIndicator, Dimensions } from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { Text } from 'react-native-paper';
import { colors, spacing } from '../theme';

interface InAppBrowserModalProps {
    visible: boolean;
    url: string | null;
    onClose: () => void;
    title?: string;
}

export default function InAppBrowserModal({ visible, url, onClose, title = 'Browser' }: InAppBrowserModalProps) {
    const [isLoading, setIsLoading] = React.useState(true);

    if (!url) return null;

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={onClose}
        >
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                        <Text style={styles.closeText}>Done</Text>
                    </TouchableOpacity>

                    <View style={styles.titleContainer}>
                        <Text style={styles.title} numberOfLines={1}>{title}</Text>
                        <Text style={styles.url} numberOfLines={1}>{url.replace(/^https?:\/\//, '')}</Text>
                    </View>

                    <View style={styles.placeholder} />
                </View>

                <View style={styles.webViewContainer}>
                    <WebView
                        source={{ uri: url }}
                        onLoadStart={() => setIsLoading(true)}
                        onLoadEnd={() => setIsLoading(false)}
                        style={styles.webView}
                    />
                    {isLoading && (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color={colors.primary[600]} />
                        </View>
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
        paddingVertical: spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: colors.neutral[100],
        backgroundColor: '#FFFFFF',
    },
    closeButton: {
        padding: spacing.xs,
        minWidth: 60,
    },
    closeText: {
        color: colors.primary[600],
        fontSize: 17,
        fontWeight: '600',
    },
    titleContainer: {
        flex: 1,
        alignItems: 'center',
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.neutral[900],
        marginBottom: 2,
    },
    url: {
        fontSize: 12,
        color: colors.neutral[500],
    },
    placeholder: {
        minWidth: 60,
    },
    webViewContainer: {
        flex: 1,
        position: 'relative',
    },
    webView: {
        flex: 1,
    },
    loadingContainer: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
    },
});
