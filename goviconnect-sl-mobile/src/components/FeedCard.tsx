import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
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
            className="bg-white rounded-2xl border border-neutral-100 overflow-hidden mb-4"
            style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 8,
                elevation: 2,
            }}
        >
            {/* Image (if available and not in lite mode) */}
            {image && !liteMode && (
                <View className="h-40 bg-neutral-100">
                    <Image
                        source={{ uri: image }}
                        className="w-full h-full"
                        resizeMode="cover"
                    />
                </View>
            )}

            {/* Lite mode image placeholder */}
            {image && liteMode && (
                <TouchableOpacity
                    className="h-20 bg-neutral-100 items-center justify-center"
                    onPress={onPress}
                >
                    <Ionicons name="image-outline" size={24} color={COLORS.neutral[400]} />
                    <Text className="text-neutral-400 text-xs mt-1">Tap to load image</Text>
                </TouchableOpacity>
            )}

            <View className="p-4">
                {/* Type Badge */}
                <View className="flex-row items-center mb-2">
                    <View
                        className="flex-row items-center px-2 py-1 rounded-full mr-2"
                        style={{ backgroundColor: config.bgColor }}
                    >
                        <Ionicons name={config.icon} size={14} color={config.color} />
                        <Text className="text-xs font-medium ml-1" style={{ color: config.color }}>
                            {config.label}
                        </Text>
                    </View>
                    {timestamp && (
                        <Text className="text-xs text-neutral-400">
                            {getRelativeTime(timestamp, i18n.language)}
                        </Text>
                    )}
                </View>

                {/* Title */}
                <Text className="text-base font-semibold text-neutral-800 mb-1" numberOfLines={2}>
                    {title}
                </Text>

                {/* Content */}
                <Text className="text-sm text-neutral-500" numberOfLines={2}>
                    {content}
                </Text>

                {/* Progress Bar (for saved/continue type) */}
                {type === 'saved' && progress !== undefined && (
                    <View className="mt-3">
                        <View className="flex-row justify-between mb-1">
                            <Text className="text-xs text-neutral-400">Progress</Text>
                            <Text className="text-xs text-primary-600 font-medium">{progress}%</Text>
                        </View>
                        <View className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                            <View
                                className="h-full bg-primary-500 rounded-full"
                                style={{ width: `${progress}%` }}
                            />
                        </View>
                    </View>
                )}

                {/* Action Arrow */}
                <View className="flex-row justify-end mt-2">
                    <Ionicons name="chevron-forward" size={20} color={COLORS.neutral[400]} />
                </View>
            </View>
        </TouchableOpacity>
    );
};

export default FeedCard;
