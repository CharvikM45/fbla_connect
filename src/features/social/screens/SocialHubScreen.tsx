// FBLA Connect - Social Hub Screen
import React, { useState } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import { Text, IconButton, SegmentedButtons } from 'react-native-paper';
import { useAppSelector } from '../../../shared/hooks/useRedux';
import { colors, spacing } from '../../../shared/theme';

export default function SocialHubScreen() {
    const user = useAppSelector(state => state.auth.user);
    const [platform, setPlatform] = useState('instagram');

    const STATE_HANDLES: Record<string, string> = {
        'GA': 'georgiafbla',
        'FL': 'floridafbla',
        'TX': 'texasfbla',
        'CA': 'cafbla',
        'NE': 'nebraskafbla',
        'NY': 'nysfbla',
        'PA': 'pafbla',
        'NJ': 'njfbla',
        // Fallback or generic
        'default': 'fbla_national'
    };

    const handle = STATE_HANDLES[user?.state || 'default'] || STATE_HANDLES['default'];

    const getUrl = () => {
        if (platform === 'instagram') {
            return `https://www.instagram.com/${handle}/`;
        } else {
            return `https://twitter.com/${handle}`;
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <SegmentedButtons
                    value={platform}
                    onValueChange={setPlatform}
                    buttons={[
                        { value: 'instagram', label: 'Instagram', icon: 'instagram' },
                        { value: 'twitter', label: 'X / Twitter', icon: 'twitter' },
                    ]}
                    style={styles.segmented}
                />
            </View>

            <WebView
                source={{ uri: getUrl() }}
                style={styles.webview}
                startInLoadingState={true}
                renderLoading={() => (
                    <View style={styles.loading}>
                        <ActivityIndicator size="large" color={colors.primary[600]} />
                        <Text style={styles.loadingText}>Loading Feed...</Text>
                    </View>
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    header: {
        padding: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.neutral[100],
    },
    segmented: {
        marginHorizontal: spacing.sm,
    },
    webview: {
        flex: 1,
    },
    loading: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
    },
    loadingText: {
        marginTop: spacing.md,
        color: colors.neutral[500],
    }
});
