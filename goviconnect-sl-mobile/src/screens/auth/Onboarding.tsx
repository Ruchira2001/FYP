import React, { useRef, useState } from 'react';
import { View, Text, Dimensions, TouchableOpacity, StatusBar, ScrollView, NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
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

// Simple Pagination Dot Component
const PaginationDot: React.FC<{ isActive: boolean }> = ({ isActive }) => {
    return (
        <View
            style={{
                width: isActive ? 24 : 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: COLORS.primary[500],
                marginHorizontal: 4,
                opacity: isActive ? 1 : 0.3,
            }}
        />
    );
};

const Onboarding: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    const { t } = useTranslation();
    const scrollRef = useRef<ScrollView>(null);
    const [currentIndex, setCurrentIndex] = useState(0);

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

    const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
        const index = Math.round(e.nativeEvent.contentOffset.x / width);
        if (index !== currentIndex) {
            setCurrentIndex(index);
        }
    };

    const renderSlide = (slide: OnboardingSlide) => {
        return (
            <View key={slide.id} style={{ width, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 }}>
                <View
                    style={{
                        width: 160,
                        height: 160,
                        borderRadius: 80,
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: 40,
                        backgroundColor: slide.color + '20',
                    }}
                >
                    <View
                        style={{
                            width: 112,
                            height: 112,
                            borderRadius: 56,
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: slide.color + '40',
                        }}
                    >
                        <Ionicons name={slide.icon} size={56} color={slide.color} />
                    </View>
                </View>

                <Text style={{ fontSize: 24, fontWeight: 'bold', color: COLORS.neutral[800], textAlign: 'center', marginBottom: 16 }}>
                    {t(slide.titleKey)}
                </Text>

                <Text style={{ fontSize: 16, color: COLORS.neutral[500], textAlign: 'center', lineHeight: 24 }}>
                    {t(slide.descKey)}
                </Text>
            </View>
        );
    };

    return (
        <View style={{ flex: 1, backgroundColor: '#ffffff' }}>
            <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

            {/* Skip Button */}
            <View style={{ position: 'absolute', top: 48, right: 24, zIndex: 10 }}>
                <TouchableOpacity onPress={handleSkip} style={{ paddingVertical: 8, paddingHorizontal: 16 }}>
                    <Text style={{ color: COLORS.primary[600], fontWeight: '500' }}>{t('common.skip')}</Text>
                </TouchableOpacity>
            </View>

            {/* Slides */}
            <ScrollView
                ref={scrollRef}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={handleScroll}
                scrollEventThrottle={16}
                style={{ flex: 1, paddingTop: 80 }}
            >
                {slides.map((slide) => renderSlide(slide))}
            </ScrollView>

            {/* Bottom Section */}
            <View style={{ paddingHorizontal: 32, paddingBottom: 48 }}>
                {/* Pagination Dots */}
                <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 32 }}>
                    {slides.map((_, index) => (
                        <PaginationDot key={index} isActive={index === currentIndex} />
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
