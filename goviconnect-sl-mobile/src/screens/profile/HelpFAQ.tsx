import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
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
        <View style={styles.container}>
            <Header
                title={t('profile.help_faq')}
                showBack
                onBackPress={() => navigation.goBack()}
            />

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.scrollContent}>
                    {/* Contact Support */}
                    <TouchableOpacity style={styles.supportCard}>
                        <View style={styles.supportIconContainer}>
                            <Ionicons name="headset" size={24} color="white" />
                        </View>
                        <View style={styles.supportTextContainer}>
                            <Text style={styles.supportTitle}>Contact Support</Text>
                            <Text style={styles.supportSubtitle}>Get help from our team</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={24} color="white" />
                    </TouchableOpacity>

                    {/* FAQs */}
                    <Text style={styles.sectionTitle}>
                        Frequently Asked Questions
                    </Text>

                    {faqs.map((faq) => (
                        <TouchableOpacity
                            key={faq.id}
                            onPress={() => toggleExpand(faq.id)}
                            style={styles.faqCard}
                        >
                            <View style={styles.faqHeader}>
                                <View style={styles.questionContainer}>
                                    <Text style={styles.questionText}>
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
                                <View style={styles.faqAnswerContainer}>
                                    <Text style={styles.answerText}>
                                        {i18n.language === 'si' ? faq.answerSi : faq.answer}
                                    </Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    ))}

                    {/* Additional Help */}
                    <View style={styles.infoBox}>
                        <Ionicons name="information-circle" size={24} color={COLORS.info} />
                        <View style={styles.infoTextContainer}>
                            <Text style={styles.infoText}>
                                Can't find what you're looking for? Contact our support team for personalized assistance.
                            </Text>
                        </View>
                    </View>

                    <View style={styles.bottomSpacer} />
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.neutral[50], // neutral-50
    },
    content: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
    },
    supportCard: {
        backgroundColor: COLORS.primary[500],
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        flexDirection: 'row',
        alignItems: 'center',
    },
    supportIconContainer: {
        width: 48,
        height: 48,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    supportTextContainer: {
        flex: 1,
    },
    supportTitle: {
        color: '#ffffff',
        fontWeight: '600',
        fontSize: 18,
    },
    supportSubtitle: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 14,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: COLORS.neutral[800],
        marginBottom: 12,
    },
    faqCard: {
        backgroundColor: '#ffffff',
        borderRadius: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: COLORS.neutral[100],
        overflow: 'hidden',
    },
    faqHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
    },
    questionContainer: {
        flex: 1,
    },
    questionText: {
        fontSize: 16,
        fontWeight: '500',
        color: COLORS.neutral[800],
    },
    faqAnswerContainer: {
        paddingHorizontal: 16,
        paddingBottom: 16,
        paddingTop: 0,
        borderTopWidth: 1,
        borderTopColor: COLORS.neutral[100],
    },
    answerText: {
        fontSize: 14,
        color: COLORS.neutral[600],
        lineHeight: 20,
        marginTop: 12,
    },
    infoBox: {
        backgroundColor: '#eff6ff', // blue-50
        borderRadius: 12,
        padding: 16,
        marginTop: 16,
        flexDirection: 'row',
        alignItems: 'center',
    },
    infoTextContainer: {
        flex: 1,
        marginLeft: 12,
    },
    infoText: {
        fontSize: 14,
        color: '#1d4ed8', // blue-700
    },
    bottomSpacer: {
        height: 32,
    },
});

export default HelpFAQ;
