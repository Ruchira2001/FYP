import React, { useEffect, useRef, useState } from 'react';
import {
    View,
    Text,
    StatusBar,
    Animated,
    Easing,
    StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Svg, {
    Circle,
    Ellipse,
    Line,
    Path,
    Defs,
    LinearGradient as SvgLinearGradient,
    Stop,
} from 'react-native-svg';
import { COLORS } from '../../utils/constants';
import { useApp } from '../../context';

const GLOBE_SIZE = 220;
const BRAND_NAME = 'goviconnect';
const CHAR_INTERVAL_MS = 85;

const GlobeSvg: React.FC<{ size: number }> = ({ size }) => (
    <Svg width={size} height={size} viewBox="0 0 200 200">
        <Defs>
            <SvgLinearGradient id="globeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <Stop offset="0%" stopColor="#86efac" />
                <Stop offset="100%" stopColor="#16a34a" />
            </SvgLinearGradient>
        </Defs>
        <Circle cx="100" cy="100" r="90" fill="none" stroke="url(#globeGrad)" strokeWidth="3" />
        <Ellipse cx="100" cy="100" rx="90" ry="30" fill="none" stroke="#4ade80" strokeWidth="2" />
        <Ellipse cx="100" cy="100" rx="90" ry="60" fill="none" stroke="#4ade80" strokeWidth="1.5" />
        <Line x1="10" y1="100" x2="190" y2="100" stroke="#4ade80" strokeWidth="2" />
        <Ellipse cx="100" cy="100" rx="30" ry="90" fill="none" stroke="#4ade80" strokeWidth="2" />
        <Ellipse cx="100" cy="100" rx="60" ry="90" fill="none" stroke="#4ade80" strokeWidth="1.5" />
        <Line x1="100" y1="10" x2="100" y2="190" stroke="#4ade80" strokeWidth="2" />
        {[
            [100, 10], [100, 190], [10, 100], [190, 100],
            [55, 30], [145, 30], [55, 170], [145, 170],
            [30, 65], [170, 65], [30, 135], [170, 135],
            [100, 100],
        ].map(([cx, cy], i) => (
            <Circle key={i} cx={cx} cy={cy} r="5" fill="#16a34a" />
        ))}
        <Path d="M100,10 C95,5 90,8 93,13 C96,18 103,15 100,10Z" fill="#bbf7d0" />
        <Path d="M55,30 C50,25 45,28 48,33 C51,38 58,35 55,30Z" fill="#bbf7d0" />
        <Path d="M145,30 C140,25 135,28 138,33 C141,38 148,35 145,30Z" fill="#bbf7d0" />
        <Path d="M30,65 C25,60 20,63 23,68 C26,73 33,70 30,65Z" fill="#bbf7d0" />
        <Path d="M170,135 C165,130 160,133 163,138 C166,143 173,140 170,135Z" fill="#bbf7d0" />
    </Svg>
);

const Splash: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    const { hasCompletedOnboarding } = useApp();

    const rotateAnim = useRef(new Animated.Value(0)).current;
    const logoOpacity = useRef(new Animated.Value(0)).current;
    const logoScale = useRef(new Animated.Value(0.4)).current;
    const slOpacity = useRef(new Animated.Value(0)).current;
    const dotsOpacity = useRef(new Animated.Value(0)).current;
    const [typedChars, setTypedChars] = useState('');

    useEffect(() => {
        Animated.loop(
            Animated.timing(rotateAnim, {
                toValue: 1,
                duration: 2600,
                easing: Easing.linear,
                useNativeDriver: true,
            })
        ).start();

        Animated.parallel([
            Animated.timing(logoOpacity, {
                toValue: 1,
                duration: 600,
                useNativeDriver: true,
            }),
            Animated.spring(logoScale, {
                toValue: 1,
                friction: 5,
                tension: 80,
                useNativeDriver: true,
            }),
        ]).start(() => {
            let idx = 0;
            const timer = setInterval(() => {
                idx += 1;
                setTypedChars(BRAND_NAME.slice(0, idx));
                if (idx >= BRAND_NAME.length) {
                    clearInterval(timer);
                    Animated.timing(slOpacity, {
                        toValue: 1,
                        duration: 300,
                        useNativeDriver: true,
                    }).start();
                    Animated.timing(dotsOpacity, {
                        toValue: 1,
                        duration: 400,
                        useNativeDriver: true,
                    }).start();
                }
            }, CHAR_INTERVAL_MS);
        });

        const navTimer = setTimeout(() => {
            navigation.replace(hasCompletedOnboarding ? 'RoleSelection' : 'Onboarding');
        }, 4000);

        return () => clearTimeout(navTimer);
    }, [hasCompletedOnboarding, navigation]);

    const spin = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

            <Animated.View
                style={{
                    alignItems: 'center',
                    opacity: logoOpacity,
                    transform: [{ scale: logoScale }],
                }}
            >
                {/* Globe rotates */}
                <Animated.View style={{ transform: [{ rotate: spin }] }}>
                    <GlobeSvg size={GLOBE_SIZE} />
                </Animated.View>

                {/* "goviconnect SL" text below globe */}
                <View style={styles.textRow}>
                    <Text style={styles.brandText}>{typedChars}</Text>
                    <Animated.Text style={[styles.superscript, { opacity: slOpacity }]}>
                        SL
                    </Animated.Text>
                </View>
            </Animated.View>

            {/* Loading dots */}
            <Animated.View style={[styles.dotsRow, { opacity: dotsOpacity }]}>
                <View style={[styles.dot, { backgroundColor: COLORS.primary[300] }]} />
                <View style={[styles.dot, { backgroundColor: COLORS.primary[400] }]} />
                <View style={[styles.dot, { backgroundColor: COLORS.primary[500] }]} />
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    textRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginTop: 10,
    },
    brandText: {
        fontFamily: 'Apricots',
        fontSize: 46,
        color: '#16a34a',
        includeFontPadding: false,
        letterSpacing: 3,
    },
    superscript: {
        fontSize: 14,
        fontWeight: '700',
        color: '#374151',
        marginTop: 6,
        marginLeft: 4,
    },
    dotsRow: {
        position: 'absolute',
        bottom: 60,
        flexDirection: 'row',
        alignItems: 'center',
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginHorizontal: 5,
    },
});

export default Splash;