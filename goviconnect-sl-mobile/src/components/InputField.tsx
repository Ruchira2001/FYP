import React from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../utils/constants';

interface InputFieldProps {
    label?: string;
    placeholder?: string;
    value: string;
    onChangeText: (text: string) => void;
    secureTextEntry?: boolean;
    keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
    autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
    error?: string;
    icon?: keyof typeof Ionicons.glyphMap;
    rightIcon?: keyof typeof Ionicons.glyphMap;
    onRightIconPress?: () => void;
    multiline?: boolean;
    numberOfLines?: number;
    editable?: boolean;
    maxLength?: number;
}

const InputField: React.FC<InputFieldProps> = ({
    label,
    placeholder,
    value,
    onChangeText,
    secureTextEntry = false,
    keyboardType = 'default',
    autoCapitalize = 'none',
    error,
    icon,
    rightIcon,
    onRightIconPress,
    multiline = false,
    numberOfLines = 1,
    editable = true,
    maxLength,
}) => {
    const [isFocused, setIsFocused] = React.useState(false);

    const getBorderColor = () => {
        if (error) return COLORS.error;
        if (isFocused) return COLORS.primary[500];
        return COLORS.neutral[200];
    };

    return (
        <View className="mb-4">
            {label && (
                <Text className="text-sm font-medium text-neutral-700 mb-1.5">
                    {label}
                </Text>
            )}

            <View
                className={`
          flex-row items-center
          bg-white
          rounded-xl
          px-4
          border-2
          ${multiline ? 'py-3' : 'py-0'}
        `}
                style={{ borderColor: getBorderColor() }}
            >
                {icon && (
                    <Ionicons
                        name={icon}
                        size={20}
                        color={isFocused ? COLORS.primary[500] : COLORS.neutral[400]}
                        style={{ marginRight: 10 }}
                    />
                )}

                <TextInput
                    className={`
            flex-1
            text-base
            text-neutral-800
            ${multiline ? '' : 'py-3'}
          `}
                    placeholder={placeholder}
                    placeholderTextColor={COLORS.neutral[400]}
                    value={value}
                    onChangeText={onChangeText}
                    secureTextEntry={secureTextEntry}
                    keyboardType={keyboardType}
                    autoCapitalize={autoCapitalize}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    multiline={multiline}
                    numberOfLines={numberOfLines}
                    editable={editable}
                    maxLength={maxLength}
                    textAlignVertical={multiline ? 'top' : 'center'}
                    style={{ minHeight: multiline ? numberOfLines * 24 : undefined }}
                />

                {rightIcon && (
                    <TouchableOpacity onPress={onRightIconPress}>
                        <Ionicons
                            name={rightIcon}
                            size={20}
                            color={COLORS.neutral[400]}
                        />
                    </TouchableOpacity>
                )}
            </View>

            {error && (
                <View className="flex-row items-center mt-1.5">
                    <Ionicons name="alert-circle" size={14} color={COLORS.error} />
                    <Text className="text-xs text-red-500 ml-1">{error}</Text>
                </View>
            )}
        </View>
    );
};

export default InputField;
