import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, View, StyleSheet } from 'react-native';
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
    style?: any;
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
    style,
}) => {
    const getBackgroundColor = () => {
        if (disabled) return COLORS.neutral[200];
        switch (variant) {
            case 'primary':
                return COLORS.primary[500];
            case 'secondary':
                return COLORS.secondary[500];
            case 'outline':
            case 'ghost':
                return 'transparent';
            default:
                return COLORS.primary[500];
        }
    };

    const getTextColor = () => {
        if (disabled) return COLORS.neutral[400];
        switch (variant) {
            case 'primary':
            case 'secondary':
                return '#ffffff';
            case 'outline':
            case 'ghost':
                return COLORS.primary[600];
            default:
                return '#ffffff';
        }
    };

    const getPadding = () => {
        switch (size) {
            case 'sm':
                return { paddingHorizontal: 16, paddingVertical: 8 };
            case 'md':
                return { paddingHorizontal: 24, paddingVertical: 12 };
            case 'lg':
                return { paddingHorizontal: 32, paddingVertical: 16 };
            default:
                return { paddingHorizontal: 24, paddingVertical: 12 };
        }
    };

    const getTextSize = () => {
        switch (size) {
            case 'sm':
                return 14;
            case 'md':
                return 16;
            case 'lg':
                return 18;
            default:
                return 16;
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

    const getBorderStyle = () => {
        if (variant === 'outline') {
            return {
                borderWidth: 2,
                borderColor: disabled ? COLORS.neutral[300] : COLORS.primary[500],
            };
        }
        return {};
    };

    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={disabled || loading}
            activeOpacity={0.8}
            style={[
                styles.button,
                {
                    backgroundColor: getBackgroundColor(),
                    ...getPadding(),
                    ...getBorderStyle(),
                    width: fullWidth ? '100%' : undefined,
                    shadowColor: variant === 'primary' && !disabled ? COLORS.primary[500] : 'transparent',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                    elevation: variant === 'primary' && !disabled ? 4 : 0,
                },
                style,
            ]}
        >
            {loading ? (
                <ActivityIndicator
                    size="small"
                    color={variant === 'outline' || variant === 'ghost' ? COLORS.primary[500] : '#ffffff'}
                />
            ) : (
                <View style={styles.content}>
                    {icon && iconPosition === 'left' && (
                        <Ionicons
                            name={icon}
                            size={getIconSize()}
                            color={getTextColor()}
                            style={{ marginRight: 8 }}
                        />
                    )}
                    <Text style={[styles.text, { color: getTextColor(), fontSize: getTextSize() }]}>
                        {title}
                    </Text>
                    {icon && iconPosition === 'right' && (
                        <Ionicons
                            name={icon}
                            size={getIconSize()}
                            color={getTextColor()}
                            style={{ marginLeft: 8 }}
                        />
                    )}
                </View>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    text: {
        fontWeight: '600',
    },
});

export default PrimaryButton;
