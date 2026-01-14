import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../utils/constants';

interface ActionCardProps {
    title: string;
    description?: string;
    icon: keyof typeof Ionicons.glyphMap;
    iconColor?: string;
    iconBgColor?: string;
    onPress: () => void;
    size?: 'sm' | 'md' | 'lg';
    variant?: 'default' | 'gradient';
    badge?: string;
}

const ActionCard: React.FC<ActionCardProps> = ({
    title,
    description,
    icon,
    iconColor = COLORS.primary[600],
    iconBgColor = COLORS.primary[50],
    onPress,
    size = 'md',
    variant = 'default',
    badge,
}) => {
    const getSizeStyles = () => {
        switch (size) {
            case 'sm':
                return {
                    padding: 'p-3',
                    iconSize: 24,
                    iconContainer: 'w-10 h-10',
                    titleSize: 'text-sm',
                    descSize: 'text-xs',
                };
            case 'md':
                return {
                    padding: 'p-4',
                    iconSize: 28,
                    iconContainer: 'w-12 h-12',
                    titleSize: 'text-base',
                    descSize: 'text-sm',
                };
            case 'lg':
                return {
                    padding: 'p-5',
                    iconSize: 32,
                    iconContainer: 'w-14 h-14',
                    titleSize: 'text-lg',
                    descSize: 'text-base',
                };
            default:
                return {
                    padding: 'p-4',
                    iconSize: 28,
                    iconContainer: 'w-12 h-12',
                    titleSize: 'text-base',
                    descSize: 'text-sm',
                };
        }
    };

    const styles = getSizeStyles();

    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.7}
            className={`
        ${styles.padding}
        bg-white
        rounded-2xl
        border
        border-neutral-100
        relative
      `}
            style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 8,
                elevation: 2,
            }}
        >
            {badge && (
                <View className="absolute top-2 right-2 bg-red-500 px-2 py-0.5 rounded-full">
                    <Text className="text-white text-xs font-medium">{badge}</Text>
                </View>
            )}

            <View
                className={`${styles.iconContainer} rounded-xl items-center justify-center mb-3`}
                style={{ backgroundColor: iconBgColor }}
            >
                <Ionicons name={icon} size={styles.iconSize} color={iconColor} />
            </View>

            <Text className={`${styles.titleSize} font-semibold text-neutral-800 mb-1`}>
                {title}
            </Text>

            {description && (
                <Text className={`${styles.descSize} text-neutral-500`} numberOfLines={2}>
                    {description}
                </Text>
            )}
        </TouchableOpacity>
    );
};

export default ActionCard;
