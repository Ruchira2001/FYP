import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../utils/constants';

interface ChipProps {
    label: string;
    selected?: boolean;
    onPress?: () => void;
    icon?: keyof typeof Ionicons.glyphMap;
    emoji?: string;
    size?: 'sm' | 'md' | 'lg';
    variant?: 'default' | 'outline' | 'filled';
    color?: string;
    disabled?: boolean;
    style?: any;
}

const Chip: React.FC<ChipProps> = ({
    label,
    selected = false,
    onPress,
    icon,
    emoji,
    size = 'md',
    variant = 'default',
    color = COLORS.primary[500],
    disabled = false,
    style,
}) => {
    const getSizeStyles = () => {
        switch (size) {
            case 'sm':
                return {
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                    fontSize: 12,
                    iconSize: 12,
                };
            case 'md':
                return {
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    fontSize: 14,
                    iconSize: 14,
                };
            case 'lg':
                return {
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    fontSize: 16,
                    iconSize: 16,
                };
            default:
                return {
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    fontSize: 14,
                    iconSize: 14,
                };
        }
    };

    const getBackgroundColor = () => {
        if (disabled) return COLORS.neutral[100];
        if (selected) {
            return variant === 'outline' ? `${color}15` : color;
        }
        return variant === 'filled' ? COLORS.neutral[100] : 'transparent';
    };

    const getBorderColor = () => {
        if (disabled) return COLORS.neutral[200];
        if (selected) return color;
        return variant === 'outline' ? COLORS.neutral[300] : 'transparent';
    };

    const getTextColor = () => {
        if (disabled) return COLORS.neutral[400];
        if (selected) {
            return variant === 'outline' ? color : '#ffffff';
        }
        return COLORS.neutral[600];
    };

    const sizeStyles = getSizeStyles();

    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={disabled || !onPress}
            activeOpacity={0.7}
            style={[
                styles.chip,
                {
                    paddingHorizontal: sizeStyles.paddingHorizontal,
                    paddingVertical: sizeStyles.paddingVertical,
                    backgroundColor: getBackgroundColor(),
                    borderWidth: variant === 'outline' || selected ? 1.5 : 0,
                    borderColor: getBorderColor(),
                },
                style,
            ]}
        >
            {emoji && (
                <Text style={[styles.emoji, { fontSize: sizeStyles.iconSize + 2 }]}>
                    {emoji}
                </Text>
            )}

            {icon && !emoji && (
                <Ionicons
                    name={icon}
                    size={sizeStyles.iconSize}
                    color={getTextColor()}
                    style={styles.icon}
                />
            )}

            <Text
                style={[
                    styles.label,
                    { fontSize: sizeStyles.fontSize, color: getTextColor() },
                ]}
            >
                {label}
            </Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    chip: {
        borderRadius: 50,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 8,
        marginBottom: 8,
    },
    emoji: {
        marginRight: 4,
    },
    icon: {
        marginRight: 4,
    },
    label: {
        fontWeight: '500',
    },
});

export default Chip;
