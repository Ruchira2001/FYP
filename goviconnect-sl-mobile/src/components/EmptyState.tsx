import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
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
        <View style={styles.container}>
            <View
                style={[
                    styles.iconContainer,
                    { backgroundColor: config.bgColor }
                ]}
            >
                <Ionicons name={displayIcon} size={40} color={config.color} />
            </View>

            <Text style={styles.title}>
                {title}
            </Text>

            {description && (
                <Text style={styles.description}>
                    {description}
                </Text>
            )}

            {actionLabel && onAction && (
                <View style={styles.buttonContainer}>
                    <PrimaryButton
                        title={actionLabel}
                        onPress={onAction}
                        variant="primary"
                        size="md"
                    />
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 32,
        paddingVertical: 48,
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
        color: COLORS.neutral[700],
        textAlign: 'center',
        marginBottom: 8,
    },
    description: {
        fontSize: 14,
        color: COLORS.neutral[500],
        textAlign: 'center',
        marginBottom: 24,
        maxWidth: 250,
    },
    buttonContainer: {
        marginTop: 8,
    },
});

export default EmptyState;
