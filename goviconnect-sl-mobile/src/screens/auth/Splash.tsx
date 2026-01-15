import React, { useEffect, useRef } from 'react';
import { View, Text, StatusBar, Animated } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../utils/constants';

const Splash: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();

    const logoScale = useRef(new Animated.Value(0.5)).current;
    const logoOpacity = useRef(new Animated.Value(0)).current;
    const textOpacity = useRef(new Animated.Value(0)).current;
    const textTranslateY = useRef(new Animated.Value(20)).current;

    useEffect(() => {
        // Animate logo
        Animated.parallel([
            Animated.sequence([
                Animated.timing(logoScale, {
                    toValue: 1.1,
                    duration: 600,
                    useNativeDriver: true,
                }),
                Animated.timing(logoScale, {
                    toValue: 1,
                    duration: 200,
                    useNativeDriver: true,
                }),
            ]),
            Animated.timing(logoOpacity, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
            }),
        ]).start();

        // Animate text with delay
        setTimeout(() => {
            Animated.parallel([
                Animated.timing(textOpacity, {
                    toValue: 1,
                    duration: 500,
                    useNativeDriver: true,
                }),
                Animated.timing(textTranslateY, {
                    toValue: 0,
                    duration: 500,
                    useNativeDriver: true,
                }),
            ]).start();
        }, 400);

        // Navigate after animation
        const timer = setTimeout(() => {
            navigation.replace('Onboarding');
        }, 2500);

        return () => clearTimeout(timer);
    }, [navigation]);

    return (
        <View style={{ flex: 1, backgroundColor: COLORS.primary[500], alignItems: 'center', justifyContent: 'center' }}>
            <StatusBar barStyle="light-content" backgroundColor={COLORS.primary[500]} />

            {/* Logo Container */}
            <Animated.View
                style={{
                    transform: [{ scale: logoScale }],
                    opacity: logoOpacity,
                    alignItems: 'center',
                }}
            >
                <View
                    style={{
                        width: 112,
                        height: 112,
                        backgroundColor: '#ffffff',
                        borderRadius: 24,
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: 24,
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
            <Animated.View
                style={{
                    opacity: textOpacity,
                    transform: [{ translateY: textTranslateY }],
                    alignItems: 'center',
                }}
            >
                <Text style={{ fontSize: 36, fontWeight: 'bold', color: '#ffffff', marginBottom: 8 }}>
                    Goviconnect SL
                </Text>
                <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 16 }}>
                    ගොවිකොනෙක්ට් SL
                </Text>
            </Animated.View>

            {/* Loading indicator */}
            <Animated.View
                style={{
                    opacity: textOpacity,
                    position: 'absolute',
                    bottom: 64,
                    flexDirection: 'row',
                    alignItems: 'center',
                }}
            >
                <View style={{ width: 8, height: 8, backgroundColor: 'rgba(255,255,255,0.5)', borderRadius: 4, marginHorizontal: 4 }} />
                <View style={{ width: 8, height: 8, backgroundColor: 'rgba(255,255,255,0.7)', borderRadius: 4, marginHorizontal: 4 }} />
                <View style={{ width: 8, height: 8, backgroundColor: '#ffffff', borderRadius: 4, marginHorizontal: 4 }} />
            </Animated.View>
        </View>
    );
};

export default Splash;
