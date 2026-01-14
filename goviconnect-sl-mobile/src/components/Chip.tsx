import React from 'react';
import { TouchableOpacity, Text, View } from 'react-native';
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
}) => {
    const getSizeStyles = () => {
        switch (size) {
            case 'sm':
                return {
                    padding: 'px-2 py-1',
                    textSize: 'text-xs',
                    iconSize: 12,
                };
            case 'md':
                return {
                    padding: 'px-3 py-1.5',
                    textSize: 'text-sm',
                    iconSize: 14,
                };
            case 'lg':
                return {
                    padding: 'px-4 py-2',
                    textSize: 'text-base',
                    iconSize: 16,
                };
            default:
                return {
                    padding: 'px-3 py-1.5',
                    textSize: 'text-sm',
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
            return variant === 'outline' ? color : COLORS.white;
        }
        return COLORS.neutral[600];
    };

    const styles = getSizeStyles();

    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={disabled || !onPress}
            activeOpacity={0.7}
            className={`
        ${styles.padding}
        rounded-full
        flex-row
        items-center
        justify-center
        mr-2
        mb-2
      `}
            style={{
                backgroundColor: getBackgroundColor(),
                borderWidth: variant === 'outline' || selected ? 1.5 : 0,
                borderColor: getBorderColor(),
            }}
        >
            {emoji && (
                <Text className="mr-1" style={{ fontSize: styles.iconSize + 2 }}>
                    {emoji}
                </Text>
            )}

            {icon && !emoji && (
                <Ionicons
                    name={icon}
                    size={styles.iconSize}
                    color={getTextColor()}
                    style={{ marginRight: 4 }}
                />
            )}

            <Text
                className={`${styles.textSize} font-medium`}
                style={{ color: getTextColor() }}
            >
                {label}
            </Text>
        </TouchableOpacity>
    );
};

export default Chip;
