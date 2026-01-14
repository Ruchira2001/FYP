import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../utils/constants';

interface ToastProps {
    visible: boolean;
    message: string;
    type?: 'success' | 'error' | 'warning' | 'info';
    duration?: number;
    onDismiss: () => void;
    action?: {
        label: string;
        onPress: () => void;
    };
}

const Toast: React.FC<ToastProps> = ({
    visible,
    message,
    type = 'info',
    duration = 3000,
    onDismiss,
    action,
}) => {
    const translateY = useRef(new Animated.Value(100)).current;
    const opacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            Animated.parallel([
                Animated.spring(translateY, {
                    toValue: 0,
                    useNativeDriver: true,
                    tension: 100,
                    friction: 8,
                }),
                Animated.timing(opacity, {
                    toValue: 1,
                    duration: 200,
                    useNativeDriver: true,
                }),
            ]).start();

            const timer = setTimeout(() => {
                hideToast();
            }, duration);

            return () => clearTimeout(timer);
        }
    }, [visible]);

    const hideToast = () => {
        Animated.parallel([
            Animated.timing(translateY, {
                toValue: 100,
                duration: 200,
                useNativeDriver: true,
            }),
            Animated.timing(opacity, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }),
        ]).start(() => {
            onDismiss();
        });
    };

    const getConfig = () => {
        switch (type) {
            case 'success':
                return {
                    icon: 'checkmark-circle' as const,
                    bgColor: COLORS.success,
                    iconColor: COLORS.white,
                };
            case 'error':
                return {
                    icon: 'close-circle' as const,
                    bgColor: COLORS.error,
                    iconColor: COLORS.white,
                };
            case 'warning':
                return {
                    icon: 'warning' as const,
                    bgColor: COLORS.warning,
                    iconColor: COLORS.white,
                };
            case 'info':
            default:
                return {
                    icon: 'information-circle' as const,
                    bgColor: COLORS.info,
                    iconColor: COLORS.white,
                };
        }
    };

    if (!visible) return null;

    const config = getConfig();

    return (
        <Animated.View
            className="absolute bottom-6 left-4 right-4 z-50"
            style={{
                transform: [{ translateY }],
                opacity,
            }}
        >
            <View
                className="flex-row items-center px-4 py-3 rounded-xl"
                style={{
                    backgroundColor: config.bgColor,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.2,
                    shadowRadius: 8,
                    elevation: 6,
                }}
            >
                <Ionicons name={config.icon} size={22} color={config.iconColor} />

                <Text className="flex-1 text-white text-sm font-medium ml-3" numberOfLines={2}>
                    {message}
                </Text>

                {action && (
                    <TouchableOpacity
                        onPress={() => {
                            action.onPress();
                            hideToast();
                        }}
                        className="ml-2 px-3 py-1 bg-white/20 rounded-lg"
                    >
                        <Text className="text-white text-sm font-semibold">
                            {action.label}
                        </Text>
                    </TouchableOpacity>
                )}

                <TouchableOpacity onPress={hideToast} className="ml-2 p-1">
                    <Ionicons name="close" size={18} color={COLORS.white} />
                </TouchableOpacity>
            </View>
        </Animated.View>
    );
};

export default Toast;
