import React from 'react';
import { FlatList, FlatListProps, ViewStyle } from 'react-native';
import { MotiView } from 'moti';

interface StaggeredListProps<T> extends FlatListProps<T> {
    staggerDuration?: number;
    animationType?: 'fade' | 'slide' | 'scale';
}

/**
 * A wrapper for FlatList that animates items in with a springy staggered effect.
 * Inspired by Anime.js and modern SaaS landing pages.
 */
export function StaggeredList<T>({
    staggerDuration = 100,
    animationType = 'slide',
    renderItem,
    ...props
}: StaggeredListProps<T>) {

    const animatedRenderItem = (info: any) => {
        const { index } = info;

        return (
            <MotiView
                from={{
                    opacity: 0,
                    translateY: animationType === 'slide' ? 20 : 0,
                    scale: animationType === 'scale' ? 0.9 : 1,
                }}
                animate={{
                    opacity: 1,
                    translateY: 0,
                    scale: 1,
                }}
                transition={{
                    type: 'spring',
                    delay: index * staggerDuration,
                    damping: 15,
                    stiffness: 100,
                }}
            >
                {renderItem ? renderItem(info) : null}
            </MotiView>
        );
    };

    return (
        <FlatList
            {...props}
            renderItem={animatedRenderItem}
        />
    );
}
