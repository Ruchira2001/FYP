import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
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
        <View style={styles.container}>
            {label && (
                <Text style={styles.label}>
                    {label}
                </Text>
            )}

            <View
                style={[
                    styles.inputContainer,
                    { borderColor: getBorderColor() },
                    multiline && styles.inputContainerMultiline,
                ]}
            >
                {icon && (
                    <Ionicons
                        name={icon}
                        size={20}
                        color={isFocused ? COLORS.primary[500] : COLORS.neutral[400]}
                        style={styles.icon}
                    />
                )}

                <TextInput
                    style={[
                        styles.input,
                        !multiline && styles.inputSingleLine,
                    ]}
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
                <View style={styles.errorContainer}>
                    <Ionicons name="alert-circle" size={14} color={COLORS.error} />
                    <Text style={styles.errorText}>{error}</Text>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        color: COLORS.neutral[700],
        marginBottom: 6,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        borderRadius: 12,
        paddingHorizontal: 16,
        borderWidth: 2,
    },
    inputContainerMultiline: {
        paddingVertical: 12,
    },
    icon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: COLORS.neutral[800],
    },
    inputSingleLine: {
        paddingVertical: 12,
    },
    errorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 6,
    },
    errorText: {
        fontSize: 12,
        color: COLORS.error,
        marginLeft: 4,
    },
});

export default InputField;
