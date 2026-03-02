import React, { useState } from 'react';
import { View, Text, ScrollView, Alert, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { Header, PrimaryButton, InputField } from '../../components';
import { COLORS } from '../../utils/constants';
import { meetingAPI } from '../../services/api';
import { queueService } from '../../services/queueService';
import { useConnectionStatus } from '../../services/netinfo';
import { generateId } from '../../utils/validators';

type ParamList = {
    BookMeetingFromChat: {
        chatId: string;
        expertId: string;
        expertName: string;
    };
};

const BookMeetingFromChat: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    const route = useRoute<RouteProp<ParamList, 'BookMeetingFromChat'>>();
    const { expertId, expertName } = route.params;
    const { t, i18n } = useTranslation();
    const { isConnected } = useConnectionStatus();

    const [topic, setTopic] = useState('');
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);
    const [booked, setBooked] = useState(false);

    const handleBookMeeting = async () => {
        if (!topic.trim()) {
            Alert.alert('Error', 'Please enter a topic for the meeting');
            return;
        }

        setLoading(true);

        try {
            // Book meeting via API
            await meetingAPI.bookMeeting({
                expertId,
                dateTime: new Date(Date.now() + 86400000 * 2).toISOString(),
                duration: 30,
                topic: topic.trim(),
            });

            setBooked(true);
        } catch (error) {
            console.error('Booking error:', error);
            Alert.alert('Error', 'Failed to book meeting. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (booked) {
        return (
            <SafeAreaView style={styles.successContainer}>
                <View style={styles.successContent}>
                    <View style={styles.successIcon}>
                        <Ionicons name="checkmark-circle" size={64} color={COLORS.success} />
                    </View>

                    <Text style={styles.successTitle}>
                        {t('meetings.meeting_booked')}
                    </Text>

                    <Text style={styles.successMessage}>
                        Your meeting request with {expertName} has been sent. You will be notified when it's confirmed.
                    </Text>

                    <View style={styles.successActions}>
                        <PrimaryButton
                            title={t('meetings.my_meetings')}
                            onPress={() => navigation.navigate('MeetingsTab', { screen: 'MyMeetings' })}
                            fullWidth
                            size="lg"
                        />

                        <View style={{ marginTop: 12 }}>
                            <PrimaryButton
                                title="Back to Chat"
                                onPress={() => navigation.goBack()}
                                variant="ghost"
                                fullWidth
                            />
                        </View>
                    </View>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <View style={styles.container}>
            <Header
                title={t('meetings.book_meeting')}
                showBack
                onBackPress={() => navigation.goBack()}
            />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={styles.keyboardView}
            >
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Expert Info */}
                    <View style={styles.expertCard}>
                        <View style={styles.expertAvatarContainer}>
                            <Ionicons name="person" size={28} color="white" />
                        </View>
                        <View>
                            <Text style={styles.expertLabel}>{t('meetings.expert')}</Text>
                            <Text style={styles.expertName}>{expertName}</Text>
                        </View>
                    </View>

                    {/* Form */}
                    <View style={styles.formContainer}>
                        <InputField
                            label={t('meetings.topic')}
                            placeholder="e.g., Tomato disease consultation"
                            value={topic}
                            onChangeText={setTopic}
                            icon="chatbubble-outline"
                        />

                        <InputField
                            label={t('meetings.notes')}
                            placeholder="Add any additional details..."
                            value={notes}
                            onChangeText={setNotes}
                            icon="document-text-outline"
                            multiline
                            numberOfLines={4}
                        />

                        {/* Info */}
                        <View style={styles.infoBox}>
                            <View style={styles.infoRow}>
                                <Ionicons name="information-circle" size={20} color={COLORS.info} style={styles.infoIcon} />
                                <View style={styles.infoTextContainer}>
                                    <Text style={styles.infoTitle}>Meeting Request</Text>
                                    <Text style={styles.infoDescription}>
                                        The expert will confirm the meeting time based on their availability.
                                        You'll receive a notification once confirmed.
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </View>
                </ScrollView>

                {/* Book Button */}
                <View style={styles.footer}>
                    <PrimaryButton
                        title={t('meetings.book_meeting')}
                        onPress={handleBookMeeting}
                        loading={loading}
                        disabled={!topic.trim()}
                        icon="calendar"
                        fullWidth
                        size="lg"
                    />
                </View>
            </KeyboardAvoidingView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.neutral[50],
    },
    keyboardView: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
    },
    expertCard: {
        backgroundColor: COLORS.primary[600],
        borderRadius: 16,
        padding: 20,
        marginBottom: 24,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: COLORS.primary[600],
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    expertAvatarContainer: {
        width: 56,
        height: 56,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    expertLabel: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 12,
        fontWeight: '500',
        textTransform: 'uppercase',
        marginBottom: 4,
    },
    expertName: {
        color: '#ffffff',
        fontSize: 20,
        fontWeight: 'bold',
    },
    formContainer: {
        gap: 16,
    },
    infoBox: {
        backgroundColor: '#eff6ff', // blue-50
        borderRadius: 16,
        padding: 16,
        marginTop: 8,
        borderWidth: 1,
        borderColor: '#dbeafe', // blue-100
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    infoIcon: {
        marginTop: 2,
    },
    infoTextContainer: {
        flex: 1,
        marginLeft: 12,
    },
    infoTitle: {
        color: '#1e40af', // blue-800
        fontWeight: '600',
        marginBottom: 4,
        fontSize: 14,
    },
    infoDescription: {
        color: '#1d4ed8', // blue-700
        fontSize: 13,
        lineHeight: 18,
    },
    footer: {
        padding: 16,
        backgroundColor: '#ffffff',
        borderTopWidth: 1,
        borderTopColor: COLORS.neutral[100],
    },
    successContainer: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    successContent: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 24,
    },
    successIcon: {
        width: 96,
        height: 96,
        backgroundColor: '#dcfce7', // green-100
        borderRadius: 48,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
    },
    successTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.neutral[800],
        marginBottom: 12,
        textAlign: 'center',
    },
    successMessage: {
        fontSize: 16,
        color: COLORS.neutral[500],
        textAlign: 'center',
        marginBottom: 32,
        lineHeight: 24,
    },
    successActions: {
        width: '100%',
    },
});

export default BookMeetingFromChat;
