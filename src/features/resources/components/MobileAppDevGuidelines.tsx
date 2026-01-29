import React, { useMemo } from 'react';
import { View, StyleSheet, ScrollView, Image, TouchableOpacity, useWindowDimensions, Dimensions } from 'react-native';
import { Text, Portal, Modal } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from '../../../shared/theme';

interface Props {
    visible: boolean;
    onClose: () => void;
    mode: 'guidelines' | 'rubric';
}

// Pre-define images outside for better bundling stability
const GUIDELINE_IMAGES = [
    require('../../../assets/images/mad_guidelines/p1.png'),
    require('../../../assets/images/mad_guidelines/p2.png'),
    require('../../../assets/images/mad_guidelines/p3.png'),
    require('../../../assets/images/mad_guidelines/p4.png'),
    require('../../../assets/images/mad_guidelines/p5.png'),
];

const RUBRIC_IMAGES = [
    require('../../../assets/images/mad_guidelines/p7.png'),
    require('../../../assets/images/mad_guidelines/p8.png'),
];

// Preload all images for instant access
const ALL_IMAGES = [...GUIDELINE_IMAGES, ...RUBRIC_IMAGES];
ALL_IMAGES.forEach(img => {
    try {
        const asset = Image.resolveAssetSource(img);
        if (asset && asset.uri) {
            Image.prefetch(asset.uri).catch(() => { });
        }
    } catch (e) { }
});

function MobileAppDevGuidelines({ visible, onClose, mode }: Props) {
    const { width: windowWidth, height: windowHeight } = useWindowDimensions();

    // Fallback dimensions if context isn't ready
    const width = windowWidth || Dimensions.get('window').width;
    const height = windowHeight || Dimensions.get('window').height;

    const IMAGE_WIDTH = width - 40;
    const ASPECT_RATIO = 1.294;
    const IMAGE_HEIGHT = IMAGE_WIDTH * ASPECT_RATIO;

    const activeImages = mode === 'guidelines' ? GUIDELINE_IMAGES : RUBRIC_IMAGES;

    return (
        <Portal>
            <Modal
                visible={visible}
                onDismiss={onClose}
                contentContainerStyle={[
                    styles.modalContainer,
                    { height: height * 0.85, width: width * 0.95 }
                ]}
            >
                <View style={styles.content}>
                    <View style={styles.header}>
                        <View style={styles.headerText}>
                            <Text style={styles.title}>{mode === 'guidelines' ? 'Event Guidelines' : 'Rating Sheets (Rubric)'}</Text>
                            <Text style={styles.subtitle}>Mobile Application Development</Text>
                        </View>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Ionicons name="close" size={24} color={colors.neutral[900]} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView
                        style={styles.scrollContainer}
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={true}
                        removeClippedSubviews={false} // Ensure all images render
                    >
                        {activeImages.map((img, index) => (
                            <View key={`mad-${mode}-${index}`} style={styles.imageWrapper}>
                                <View style={styles.pageIndicator}>
                                    <Text style={styles.pageIndicatorText}>
                                        {mode === 'guidelines' ? `Page ${index + 1}` : `Rubric Page ${index === 0 ? 7 : 8}`}
                                    </Text>
                                </View>
                                <View style={[styles.imageContainer, { width: IMAGE_WIDTH, height: IMAGE_HEIGHT, backgroundColor: '#f9f9f9' }]}>
                                    <Image
                                        source={img}
                                        style={styles.image}
                                        resizeMode="contain"
                                        fadeDuration={0}
                                    />
                                </View>
                            </View>
                        ))}
                        <View style={{ height: 40 }} />
                    </ScrollView>
                </View>
            </Modal>
        </Portal>
    );
}

const styles = StyleSheet.create({
    modalContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        overflow: 'hidden',
        alignSelf: 'center',
    },
    content: {
        flex: 1,
        overflow: 'hidden',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: colors.neutral[100],
        backgroundColor: '#FFFFFF',
    },
    headerText: {
        flex: 1,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.neutral[900],
    },
    subtitle: {
        fontSize: 13,
        color: colors.primary[600],
        fontWeight: '600',
    },
    closeButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: colors.neutral[50],
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollContainer: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    scrollContent: {
        paddingHorizontal: 10,
        paddingVertical: 20,
        alignItems: 'center',
    },
    imageWrapper: {
        marginBottom: 24,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: colors.neutral[100],
    },
    pageIndicator: {
        padding: 10,
        backgroundColor: colors.neutral[50],
        borderBottomWidth: 1,
        borderBottomColor: colors.neutral[100],
        alignItems: 'center',
    },
    pageIndicatorText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: colors.neutral[500],
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    imageContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    image: {
        width: '100%',
        height: '100%',
    },
});

export default React.memo(MobileAppDevGuidelines);
