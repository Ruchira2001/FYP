import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../utils/constants';

interface PrimaryButtonProps {
    title: string;
    onPress: () => void;
    loading?: boolean;
    disabled?: boolean;
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    icon?: keyof typeof Ionicons.glyphMap;
    iconPosition?: 'left' | 'right';
    fullWidth?: boolean;
    className?: string;
}

const PrimaryButton: React.FC<PrimaryButtonProps> = ({
    title,
    onPress,
    loading = false,
    disabled = false,
    variant = 'primary',
    size = 'md',
    icon,
    iconPosition = 'left',
    fullWidth = false,
    className = '',
}) => {
    const getBackgroundColor = () => {
        if (disabled) return 'bg-neutral-200';
        switch (variant) {
            case 'primary':
                return 'bg-primary-500';
            case 'secondary':
                return 'bg-secondary-500';
            case 'outline':
                return 'bg-transparent border-2 border-primary-500';
            case 'ghost':
                return 'bg-transparent';
            default:
                return 'bg-primary-500';
        }
    };

    const getTextColor = () => {
        if (disabled) return 'text-neutral-400';
        switch (variant) {
            case 'primary':
            case 'secondary':
                return 'text-white';
            case 'outline':
            case 'ghost':
                return 'text-primary-600';
            default:
                return 'text-white';
        }
    };

    const getPadding = () => {
        switch (size) {
            case 'sm':
                return 'px-4 py-2';
            case 'md':
                return 'px-6 py-3';
            case 'lg':
                return 'px-8 py-4';
            default:
                return 'px-6 py-3';
        }
    };

    const getTextSize = () => {
        switch (size) {
            case 'sm':
                return 'text-sm';
            case 'md':
                return 'text-base';
            case 'lg':
                return 'text-lg';
            default:
                return 'text-base';
        }
    };

    const getIconSize = () => {
        switch (size) {
            case 'sm':
                return 16;
            case 'md':
                return 20;
            case 'lg':
                return 24;
            default:
                return 20;
        }
    };

    const getIconColor = () => {
        if (disabled) return COLORS.neutral[400];
        switch (variant) {
            case 'primary':
            case 'secondary':
                return COLORS.white;
            case 'outline':
            case 'ghost':
                return COLORS.primary[600];
            default:
                return COLORS.white;
        }
    };

    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={disabled || loading}
            activeOpacity={0.8}
            className={`
        ${getBackgroundColor()}
        ${getPadding()}
        rounded-xl
        flex-row
        items-center
        justify-center
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
            style={{
                shadowColor: variant === 'primary' && !disabled ? COLORS.primary[500] : 'transparent',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: variant === 'primary' && !disabled ? 4 : 0,
            }}
        >
            {loading ? (
                <ActivityIndicator
                    size="small"
                    color={variant === 'outline' || variant === 'ghost' ? COLORS.primary[500] : COLORS.white}
                />
            ) : (
                <View className="flex-row items-center">
                    {icon && iconPosition === 'left' && (
                        <Ionicons
                            name={icon}
                            size={getIconSize()}
                            color={getIconColor()}
                            style={{ marginRight: 8 }}
                        />
                    )}
                    <Text className={`${getTextColor()} ${getTextSize()} font-semibold`}>
                        {title}
                    </Text>
                    {icon && iconPosition === 'right' && (
                        <Ionicons
                            name={icon}
                            size={getIconSize()}
                            color={getIconColor()}
                            style={{ marginLeft: 8 }}
                        />
                    )}
                </View>
            )}
        </TouchableOpacity>
    );
};

export default PrimaryButton;
