import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../utils/constants';

interface CropCardProps {
    id: string;
    name: string;
    nameSi: string;
    category: string;
    icon?: string;
    emoji?: string;
    color?: string;
    thumbnail?: string;
    onPress: () => void;
    isSaved?: boolean;
    isDownloaded?: boolean;
    showStatus?: boolean;
    size?: 'sm' | 'md' | 'lg';
    locale?: string;
}

const CropCard: React.FC<CropCardProps> = ({
    id,
    name,
    nameSi,
    category,
    icon,
    emoji,
    color = COLORS.primary[500],
    thumbnail,
    onPress,
    isSaved = false,
    isDownloaded = false,
    showStatus = true,
    size = 'md',
    locale = 'en',
}) => {
    const displayName = locale === 'si' ? nameSi : name;

    const getSizeStyles = () => {
        switch (size) {
            case 'sm':
                return {
                    card: 'w-24',
                    iconSize: 32,
                    iconContainer: 'w-12 h-12',
                    textSize: 'text-xs',
                };
            case 'md':
                return {
                    card: 'w-36',
                    iconSize: 40,
                    iconContainer: 'w-16 h-16',
                    textSize: 'text-sm',
                };
            case 'lg':
                return {
                    card: 'w-full',
                    iconSize: 48,
                    iconContainer: 'w-20 h-20',
                    textSize: 'text-base',
                };
            default:
                return {
                    card: 'w-36',
                    iconSize: 40,
                    iconContainer: 'w-16 h-16',
                    textSize: 'text-sm',
                };
        }
    };

    const styles = getSizeStyles();

    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.7}
            className={`
        ${size !== 'lg' ? styles.card : ''}
        bg-white
        rounded-2xl
        p-4
        mr-3
        mb-3
        border
        border-neutral-100
        ${size === 'lg' ? 'flex-row items-center' : 'items-center'}
      `}
            style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 8,
                elevation: 2,
            }}
        >
            {/* Icon/Emoji Container */}
            <View
                className={`${styles.iconContainer} rounded-2xl items-center justify-center ${size === 'lg' ? 'mr-4' : 'mb-3'}`}
                style={{ backgroundColor: `${color}15` }}
            >
                {thumbnail ? (
                    <Image
                        source={{ uri: thumbnail }}
                        className="w-full h-full rounded-2xl"
                        resizeMode="cover"
                    />
                ) : emoji ? (
                    <Text style={{ fontSize: styles.iconSize }}>{emoji}</Text>
                ) : (
                    <Ionicons name="leaf" size={styles.iconSize} color={color} />
                )}
            </View>

            {/* Content */}
            <View className={size === 'lg' ? 'flex-1' : 'items-center'}>
                <Text
                    className={`${styles.textSize} font-semibold text-neutral-800 ${size !== 'lg' ? 'text-center' : ''}`}
                    numberOfLines={size === 'lg' ? 1 : 2}
                >
                    {displayName}
                </Text>

                {size === 'lg' && (
                    <Text className="text-xs text-neutral-400 capitalize mt-0.5">
                        {category}
                    </Text>
                )}
            </View>

            {/* Status Icons */}
            {showStatus && (isSaved || isDownloaded) && (
                <View className={`flex-row ${size === 'lg' ? '' : 'absolute top-2 right-2'}`}>
                    {isSaved && (
                        <View className="w-5 h-5 rounded-full bg-primary-100 items-center justify-center mr-1">
                            <Ionicons name="bookmark" size={12} color={COLORS.primary[600]} />
                        </View>
                    )}
                    {isDownloaded && (
                        <View className="w-5 h-5 rounded-full bg-green-100 items-center justify-center">
                            <Ionicons name="cloud-download" size={12} color={COLORS.success} />
                        </View>
                    )}
                </View>
            )}

            {/* Arrow for large cards */}
            {size === 'lg' && (
                <Ionicons name="chevron-forward" size={20} color={COLORS.neutral[400]} />
            )}
        </TouchableOpacity>
    );
};

export default CropCard;
