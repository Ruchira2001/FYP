import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../utils/constants';
import { getRelativeTime } from '../utils/validators';
import { useTranslation } from 'react-i18next';

interface FeedCardProps {
    type: 'tip' | 'guide' | 'meeting' | 'saved';
    title: string;
    content: string;
    timestamp?: string;
    image?: string;
    progress?: number;
    onPress: () => void;
    liteMode?: boolean;
}

const FeedCard: React.FC<FeedCardProps> = ({
    type,
    title,
    content,
    timestamp,
    image,
    progress,
    onPress,
    liteMode = false,
}) => {
    const { i18n } = useTranslation();

    const getTypeConfig = () => {
        switch (type) {
            case 'tip':
                return {
                    icon: 'bulb-outline' as const,
                    color: COLORS.warning,
                    bgColor: '#fef3c7',
                    label: 'Tip',
                };
            case 'guide':
                return {
                    icon: 'book-outline' as const,
                    color: COLORS.info,
                    bgColor: '#dbeafe',
                    label: 'Guide',
                };
            case 'meeting':
                return {
                    icon: 'calendar-outline' as const,
                    color: COLORS.primary[600],
                    bgColor: COLORS.primary[50],
                    label: 'Meeting',
                };
            case 'saved':
                return {
                    icon: 'bookmark-outline' as const,
                    color: COLORS.secondary[600],
                    bgColor: COLORS.secondary[50],
                    label: 'Continue',
                };
            default:
                return {
                    icon: 'information-circle-outline' as const,
                    color: COLORS.neutral[600],
                    bgColor: COLORS.neutral[100],
                    label: 'Update',
                };
        }
    };

    const config = getTypeConfig();

    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.7}
            style={styles.card}
        >
            {/* Image (if available and not in lite mode) */}
            {image && !liteMode && (
                <View style={styles.imageContainer}>
                    <Image
                        source={{ uri: image }}
                        style={styles.image}
                        resizeMode="cover"
                    />
                </View>
            )}

            {/* Lite mode image placeholder */}
            {image && liteMode && (
                <TouchableOpacity
                    style={styles.placeholderContainer}
                    onPress={onPress}
                >
                    <Ionicons name="image-outline" size={24} color={COLORS.neutral[400]} />
                    <Text style={styles.placeholderText}>Tap to load image</Text>
                </TouchableOpacity>
            )}

            <View style={styles.content}>
                {/* Type Badge */}
                <View style={styles.header}>
                    <View
                        style={[
                            styles.badge,
                            { backgroundColor: config.bgColor }
                        ]}
                    >
                        <Ionicons name={config.icon} size={14} color={config.color} />
                        <Text style={[styles.badgeText, { color: config.color }]}>
                            {config.label}
                        </Text>
                    </View>
                    {timestamp && (
                        <Text style={styles.timestamp}>
                            {getRelativeTime(timestamp, i18n.language)}
                        </Text>
                    )}
                </View>

                {/* Title */}
                <Text style={styles.title} numberOfLines={2}>
                    {title}
                </Text>

                {/* Content */}
                <Text style={styles.description} numberOfLines={2}>
                    {content}
                </Text>

                {/* Progress Bar (for saved/continue type) */}
                {type === 'saved' && progress !== undefined && (
                    <View style={styles.progressContainer}>
                        <View style={styles.progressHeader}>
                            <Text style={styles.progressLabel}>Progress</Text>
                            <Text style={styles.progressValue}>{progress}%</Text>
                        </View>
                        <View style={styles.progressBarBg}>
                            <View
                                style={[
                                    styles.progressBarFill,
                                    { width: `${progress}%` }
                                ]}
                            />
                        </View>
                    </View>
                )}

                {/* Action Arrow */}
                <View style={styles.footer}>
                    <Ionicons name="chevron-forward" size={20} color={COLORS.neutral[400]} />
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#ffffff',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: COLORS.neutral[100],
        overflow: 'hidden',
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    imageContainer: {
        height: 160,
        backgroundColor: COLORS.neutral[100],
    },
    image: {
        width: '100%',
        height: '100%',
    },
    placeholderContainer: {
        height: 80,
        backgroundColor: COLORS.neutral[100],
        alignItems: 'center',
        justifyContent: 'center',
    },
    placeholderText: {
        color: COLORS.neutral[400],
        fontSize: 12,
        marginTop: 4,
    },
    content: {
        padding: 16,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 50,
        marginRight: 8,
    },
    badgeText: {
        fontSize: 12,
        fontWeight: '500',
        marginLeft: 4,
    },
    timestamp: {
        fontSize: 12,
        color: COLORS.neutral[400],
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.neutral[800],
        marginBottom: 4,
    },
    description: {
        fontSize: 14,
        color: COLORS.neutral[500],
    },
    progressContainer: {
        marginTop: 12,
    },
    progressHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    progressLabel: {
        fontSize: 12,
        color: COLORS.neutral[400],
    },
    progressValue: {
        fontSize: 12,
        color: COLORS.primary[600],
        fontWeight: '500',
    },
    progressBarBg: {
        height: 8,
        backgroundColor: COLORS.neutral[100],
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: COLORS.primary[500],
        borderRadius: 4,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 8,
    },
});

export default FeedCard;
