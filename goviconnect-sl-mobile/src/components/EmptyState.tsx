import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../utils/constants';
import PrimaryButton from './PrimaryButton';

interface EmptyStateProps {
    icon?: keyof typeof Ionicons.glyphMap;
    title: string;
    description?: string;
    actionLabel?: string;
    onAction?: () => void;
    variant?: 'default' | 'offline' | 'error' | 'search';
}

const EmptyState: React.FC<EmptyStateProps> = ({
    icon,
    title,
    description,
    actionLabel,
    onAction,
    variant = 'default',
}) => {
    const getConfig = () => {
        switch (variant) {
            case 'offline':
                return {
                    icon: 'cloud-offline-outline' as const,
                    color: COLORS.warning,
                    bgColor: '#fef3c7',
                };
            case 'error':
                return {
                    icon: 'alert-circle-outline' as const,
                    color: COLORS.error,
                    bgColor: '#fee2e2',
                };
            case 'search':
                return {
                    icon: 'search-outline' as const,
                    color: COLORS.neutral[400],
                    bgColor: COLORS.neutral[100],
                };
            default:
                return {
                    icon: 'folder-open-outline' as const,
                    color: COLORS.neutral[400],
                    bgColor: COLORS.neutral[100],
                };
        }
    };

    const config = getConfig();
    const displayIcon = icon || config.icon;

    return (
        <View className="flex-1 items-center justify-center px-8 py-12">
            <View
                className="w-20 h-20 rounded-full items-center justify-center mb-4"
                style={{ backgroundColor: config.bgColor }}
            >
                <Ionicons name={displayIcon} size={40} color={config.color} />
            </View>

            <Text className="text-lg font-semibold text-neutral-700 text-center mb-2">
                {title}
            </Text>

            {description && (
                <Text className="text-sm text-neutral-500 text-center mb-6 max-w-xs">
                    {description}
                </Text>
            )}

            {actionLabel && onAction && (
                <PrimaryButton
                    title={actionLabel}
                    onPress={onAction}
                    variant="primary"
                    size="md"
                />
            )}
        </View>
    );
};

export default EmptyState;
