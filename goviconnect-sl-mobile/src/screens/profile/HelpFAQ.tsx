import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '../../components';
import { COLORS } from '../../utils/constants';

interface FAQItem {
    id: string;
    question: string;
    questionSi: string;
    answer: string;
    answerSi: string;
}

const faqs: FAQItem[] = [
    {
        id: '1',
        question: 'How do I use the AI Crop Doctor?',
        questionSi: 'AI බෝග වෛද්‍ය භාවිතා කරන්නේ කෙසේද?',
        answer: 'Simply take a photo of the affected plant part using the camera or select from gallery. Our AI will analyze the image and provide a diagnosis with treatment suggestions.',
        answerSi: 'කැමරාව භාවිතයෙන් බලපෑමට ලක් වූ ශාක කොටසේ ඡායාරූපයක් ගන්න හෝ ගැලරියෙන් තෝරන්න. අපගේ AI රූපය විශ්ලේෂණය කර ප්‍රතිකාර යෝජනා සමඟ රෝග විනිශ්චයක් ලබා දෙනු ඇත.',
    },
    {
        id: '2',
        question: 'Can I use the app offline?',
        questionSi: 'මට යෙදුම ඔෆ්ලයින් ලෙස භාවිතා කළ හැකිද?',
        answer: 'Yes! You can save LearnHub guides for offline reading. AI analysis requests will be queued and processed when you come back online.',
        answerSi: 'ඔව්! ඔබට ඔෆ්ලයින් කියවීම සඳහා ඉගෙනුම් මධ්‍යස්ථාන මාර්ගෝපදේශ සුරැකිය හැක. AI විශ්ලේෂණ ඉල්ලීම් පෝලිමට එකතු කර ඔබ නැවත ඔන්ලයින් වූ විට සකසනු ලැබේ.',
    },
    {
        id: '3',
        question: 'How do I book a meeting with an expert?',
        questionSi: 'විශේෂඥයෙකු සමඟ රැස්වීමක් වෙන්කරවාගන්නේ කෙසේද?',
        answer: 'You can book meetings through the Meetings tab or by using the "Book Expert Meeting" button in any chat conversation with an expert.',
        answerSi: 'ඔබට රැස්වීම් ටැබය හරහා හෝ විශේෂඥයෙකු සමඟ ඕනෑම කතාබස් සංවාදයක "විශේෂඥ රැස්වීමක් වෙන්කරවාගන්න" බොත්තම භාවිතයෙන් රැස්වීම් වෙන්කරවාගත හැක.',
    },
    {
        id: '4',
        question: 'How accurate are the price predictions?',
        questionSi: 'මිල පුරෝකථන කොතරම් නිවැරදිද?',
        answer: 'Our price predictions are based on historical market data, seasonal trends, and regional factors. While we strive for accuracy, actual prices may vary. Use predictions as a guide.',
        answerSi: 'අපගේ මිල පුරෝකථන ඓතිහාසික වෙළඳපොළ දත්ත, සෘතුමය ප්‍රවණතා සහ ප්‍රාදේශීය සාධක මත පදනම් වේ. අපි නිරවද්‍යතාවය සඳහා උත්සාහ කරන අතර, සැබෑ මිල වෙනස් විය හැක. පුරෝකථන මාර්ගෝපදේශයක් ලෙස භාවිතා කරන්න.',
    },
    {
        id: '5',
        question: 'How do I change the app language?',
        questionSi: 'යෙදුම් භාෂාව වෙනස් කරන්නේ කෙසේද?',
        answer: 'Go to Profile > Settings > Language and select your preferred language. The app supports Sinhala and English.',
        answerSi: 'පැතිකඩ > සැකසුම් > භාෂාව වෙත ගොස් ඔබ කැමති භාෂාව තෝරන්න. යෙදුම සිංහල සහ ඉංග්‍රීසි සඳහා සහාය දක්වයි.',
    },
];

const HelpFAQ: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    const { t, i18n } = useTranslation();
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const toggleExpand = (id: string) => {
        setExpandedId(expandedId === id ? null : id);
    };

    return (
        <View className="flex-1 bg-neutral-50">
            <Header
                title={t('profile.help_faq')}
                showBack
                onBackPress={() => navigation.goBack()}
            />

            <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
                {/* Contact Support */}
                <TouchableOpacity className="bg-primary-500 rounded-xl p-4 mb-4 flex-row items-center">
                    <View className="w-12 h-12 bg-white/20 rounded-xl items-center justify-center mr-3">
                        <Ionicons name="headset" size={24} color="white" />
                    </View>
                    <View className="flex-1">
                        <Text className="text-white font-semibold text-lg">Contact Support</Text>
                        <Text className="text-white/80 text-sm">Get help from our team</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={24} color="white" />
                </TouchableOpacity>

                {/* FAQs */}
                <Text className="text-lg font-semibold text-neutral-800 mb-3">
                    Frequently Asked Questions
                </Text>

                {faqs.map((faq) => (
                    <TouchableOpacity
                        key={faq.id}
                        onPress={() => toggleExpand(faq.id)}
                        className="bg-white rounded-xl mb-3 border border-neutral-100 overflow-hidden"
                    >
                        <View className="flex-row items-center p-4">
                            <View className="flex-1">
                                <Text className="text-base font-medium text-neutral-800">
                                    {i18n.language === 'si' ? faq.questionSi : faq.question}
                                </Text>
                            </View>
                            <Ionicons
                                name={expandedId === faq.id ? 'chevron-up' : 'chevron-down'}
                                size={20}
                                color={COLORS.neutral[400]}
                            />
                        </View>

                        {expandedId === faq.id && (
                            <View className="px-4 pb-4 pt-0 border-t border-neutral-100">
                                <Text className="text-sm text-neutral-600 leading-5 mt-3">
                                    {i18n.language === 'si' ? faq.answerSi : faq.answer}
                                </Text>
                            </View>
                        )}
                    </TouchableOpacity>
                ))}

                {/* Additional Help */}
                <View className="bg-blue-50 rounded-xl p-4 mt-4 flex-row items-center">
                    <Ionicons name="information-circle" size={24} color={COLORS.info} />
                    <View className="flex-1 ml-3">
                        <Text className="text-sm text-blue-700">
                            Can't find what you're looking for? Contact our support team for personalized assistance.
                        </Text>
                    </View>
                </View>

                <View className="h-8" />
            </ScrollView>
        </View>
    );
};

export default HelpFAQ;
