import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
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
                    padding: 12,
                    iconSize: 24,
                    iconContainer: 40,
                    titleSize: 14,
                    descSize: 12,
                };
            case 'md':
                return {
                    padding: 16,
                    iconSize: 28,
                    iconContainer: 48,
                    titleSize: 16,
                    descSize: 14,
                };
            case 'lg':
                return {
                    padding: 20,
                    iconSize: 32,
                    iconContainer: 56,
                    titleSize: 18,
                    descSize: 16,
                };
            default:
                return {
                    padding: 16,
                    iconSize: 28,
                    iconContainer: 48,
                    titleSize: 16,
                    descSize: 14,
                };
        }
    };

    const sizeStyles = getSizeStyles();

    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.7}
            style={[
                styles.card,
                { padding: sizeStyles.padding }
            ]}
        >
            {badge && (
                <View style={styles.badge}>
                    <Text style={styles.badgeText}>{badge}</Text>
                </View>
            )}

            <View
                style={[
                    styles.iconContainer,
                    {
                        width: sizeStyles.iconContainer,
                        height: sizeStyles.iconContainer,
                        backgroundColor: iconBgColor
                    }
                ]}
            >
                <Ionicons name={icon} size={sizeStyles.iconSize} color={iconColor} />
            </View>

            <Text
                style={[
                    styles.title,
                    { fontSize: sizeStyles.titleSize }
                ]}
            >
                {title}
            </Text>

            {description && (
                <Text
                    style={[
                        styles.description,
                        { fontSize: sizeStyles.descSize }
                    ]}
                    numberOfLines={2}
                >
                    {description}
                </Text>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#ffffff',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: COLORS.neutral[100],
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    badge: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: COLORS.error,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 12,
    },
    badgeText: {
        color: '#ffffff',
        fontSize: 12,
        fontWeight: '500',
    },
    iconContainer: {
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    title: {
        fontWeight: '600',
        color: COLORS.neutral[800],
        marginBottom: 4,
    },
    description: {
        color: COLORS.neutral[500],
    },
});

export default ActionCard;
