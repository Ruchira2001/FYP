import React, { useRef, useState } from 'react';
import { View, Text, Dimensions, TouchableOpacity, StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    useAnimatedScrollHandler,
    interpolate,
    Extrapolation,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { COLORS } from '../../utils/constants';
import { PrimaryButton } from '../../components';

const { width } = Dimensions.get('window');

interface OnboardingSlide {
    id: string;
    icon: keyof typeof Ionicons.glyphMap;
    titleKey: string;
    descKey: string;
    color: string;
}

const slides: OnboardingSlide[] = [
    {
        id: '1',
        icon: 'leaf',
        titleKey: 'onboarding.slide1_title',
        descKey: 'onboarding.slide1_desc',
        color: COLORS.primary[500],
    },
    {
        id: '2',
        icon: 'book',
        titleKey: 'onboarding.slide2_title',
        descKey: 'onboarding.slide2_desc',
        color: COLORS.info,
    },
    {
        id: '3',
        icon: 'people',
        titleKey: 'onboarding.slide3_title',
        descKey: 'onboarding.slide3_desc',
        color: COLORS.secondary[500],
    },
];

// Pagination Dot Component
const PaginationDot: React.FC<{ index: number; scrollX: Animated.SharedValue<number> }> = ({ index, scrollX }) => {
    const dotStyle = useAnimatedStyle(() => {
        const inputRange = [(index - 1) * width, index * width, (index + 1) * width];
        const dotWidth = interpolate(
            scrollX.value,
            inputRange,
            [8, 24, 8],
            Extrapolation.CLAMP
        );
        const opacity = interpolate(
            scrollX.value,
            inputRange,
            [0.3, 1, 0.3],
            Extrapolation.CLAMP
        );
        return {
            width: dotWidth,
            opacity,
        };
    });

    return (
        <Animated.View
            className="h-2 rounded-full bg-primary-500 mx-1"
            style={dotStyle}
        />
    );
};

const Onboarding: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    const { t } = useTranslation();
    const scrollRef = useRef<Animated.ScrollView>(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const scrollX = useSharedValue(0);

    const scrollHandler = useAnimatedScrollHandler({
        onScroll: (event) => {
            scrollX.value = event.contentOffset.x;
        },
    });

    const handleNext = () => {
        if (currentIndex < slides.length - 1) {
            scrollRef.current?.scrollTo({ x: (currentIndex + 1) * width, animated: true });
            setCurrentIndex(currentIndex + 1);
        } else {
            navigation.replace('LanguageSelect');
        }
    };

    const handleSkip = () => {
        navigation.replace('LanguageSelect');
    };

    const renderSlide = (slide: OnboardingSlide) => {
        return (
            <View key={slide.id} style={{ width }} className="items-center justify-center px-8">
                <View
                    className="w-40 h-40 rounded-full items-center justify-center mb-10"
                    style={{ backgroundColor: slide.color + '20' }}
                >
                    <View
                        className="w-28 h-28 rounded-full items-center justify-center"
                        style={{ backgroundColor: slide.color + '40' }}
                    >
                        <Ionicons name={slide.icon} size={56} color={slide.color} />
                    </View>
                </View>

                <Text className="text-2xl font-bold text-neutral-800 text-center mb-4">
                    {t(slide.titleKey)}
                </Text>

                <Text className="text-base text-neutral-500 text-center leading-6">
                    {t(slide.descKey)}
                </Text>
            </View>
        );
    };

    return (
        <View className="flex-1 bg-white">
            <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

            {/* Skip Button */}
            <View className="absolute top-12 right-6 z-10">
                <TouchableOpacity onPress={handleSkip} className="py-2 px-4">
                    <Text className="text-primary-600 font-medium">{t('common.skip')}</Text>
                </TouchableOpacity>
            </View>

            {/* Slides */}
            <Animated.ScrollView
                ref={scrollRef}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={scrollHandler}
                scrollEventThrottle={16}
                onMomentumScrollEnd={(e) => {
                    const index = Math.round(e.nativeEvent.contentOffset.x / width);
                    setCurrentIndex(index);
                }}
                className="flex-1 pt-20"
            >
                {slides.map((slide) => renderSlide(slide))}
            </Animated.ScrollView>

            {/* Bottom Section */}
            <View className="px-8 pb-12">
                {/* Pagination Dots */}
                <View className="flex-row justify-center mb-8">
                    {slides.map((_, index) => (
                        <PaginationDot key={index} index={index} scrollX={scrollX} />
                    ))}
                </View>

                {/* Next/Get Started Button */}
                <PrimaryButton
                    title={currentIndex === slides.length - 1 ? t('onboarding.get_started') : t('common.next')}
                    onPress={handleNext}
                    icon={currentIndex === slides.length - 1 ? 'arrow-forward' : 'chevron-forward'}
                    iconPosition="right"
                    fullWidth
                    size="lg"
                />
            </View>
        </View>
    );
};

export default Onboarding;
