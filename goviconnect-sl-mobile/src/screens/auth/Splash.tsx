import React, { useEffect } from 'react';
import { View, Text, StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withSequence,
    withDelay,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../utils/constants';

const Splash: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();

    const logoScale = useSharedValue(0.5);
    const logoOpacity = useSharedValue(0);
    const textOpacity = useSharedValue(0);
    const textTranslateY = useSharedValue(20);

    useEffect(() => {
        // Animate logo
        logoScale.value = withSequence(
            withTiming(1.1, { duration: 600 }),
            withTiming(1, { duration: 200 })
        );
        logoOpacity.value = withTiming(1, { duration: 500 });

        // Animate text
        textOpacity.value = withDelay(400, withTiming(1, { duration: 500 }));
        textTranslateY.value = withDelay(400, withTiming(0, { duration: 500 }));

        // Navigate after animation
        const timer = setTimeout(() => {
            navigation.replace('Onboarding');
        }, 2500);

        return () => clearTimeout(timer);
    }, [navigation]);

    const logoAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: logoScale.value }],
        opacity: logoOpacity.value,
    }));

    const textAnimatedStyle = useAnimatedStyle(() => ({
        opacity: textOpacity.value,
        transform: [{ translateY: textTranslateY.value }],
    }));

    return (
        <View className="flex-1 bg-primary-500 items-center justify-center">
            <StatusBar barStyle="light-content" backgroundColor={COLORS.primary[500]} />

            {/* Logo Container */}
            <Animated.View
                style={logoAnimatedStyle}
                className="items-center"
            >
                <View
                    className="w-28 h-28 bg-white rounded-3xl items-center justify-center mb-6"
                    style={{
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 8 },
                        shadowOpacity: 0.2,
                        shadowRadius: 16,
                        elevation: 10,
                    }}
                >
                    <Ionicons name="leaf" size={60} color={COLORS.primary[500]} />
                </View>
            </Animated.View>

            {/* App Name */}
            <Animated.View style={textAnimatedStyle} className="items-center">
                <Text className="text-4xl font-bold text-white mb-2">
                    Goviconnect SL
                </Text>
                <Text className="text-white/80 text-base">
                    ගොවිකොනෙක්ට් SL
                </Text>
            </Animated.View>

            {/* Loading indicator */}
            <Animated.View style={textAnimatedStyle} className="absolute bottom-16">
                <View className="flex-row items-center">
                    <View className="w-2 h-2 bg-white/50 rounded-full mx-1" />
                    <View className="w-2 h-2 bg-white/70 rounded-full mx-1" />
                    <View className="w-2 h-2 bg-white rounded-full mx-1" />
                </View>
            </Animated.View>
        </View>
    );
};

export default Splash;
