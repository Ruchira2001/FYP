import React from 'react';
import { View, Text, TouchableOpacity, StatusBar, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useConnectionStatus } from '../services/netinfo';
import { COLORS } from '../utils/constants';

interface HeaderProps {
    title?: string;
    showBack?: boolean;
    onBackPress?: () => void;
    showLanguage?: boolean;
    showNotifications?: boolean;
    showChats?: boolean;
    onLanguagePress?: () => void;
    onNotificationsPress?: () => void;
    onChatsPress?: () => void;
    showCursiveTitle?: boolean;
    rightContent?: React.ReactNode;
    notificationCount?: number;
    chatUnreadCount?: number;
}

const Header: React.FC<HeaderProps> = ({
    title,
    showBack = false,
    onBackPress,
    showLanguage = false,
    showNotifications = false,
    showChats = false,
    onLanguagePress,
    onNotificationsPress,
    onChatsPress,
    showCursiveTitle = false,
    rightContent,
    notificationCount = 0,
    chatUnreadCount = 0,
}) => {
    const { t } = useTranslation();
    const { status } = useConnectionStatus();

    const getStatusColor = () => {
        switch (status) {
            case 'offline':
                return COLORS.error;
            case 'syncing':
                return COLORS.warning;
            default:
                return COLORS.success;
        }
    };

    const getStatusText = () => {
        switch (status) {
            case 'offline':
                return t('common.offline');
            case 'syncing':
                return t('common.syncing');
            default:
                return '';
        }
    };

    return (
        <SafeAreaView style={styles.safeArea} edges={['top']}>
            <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
            <View style={styles.container}>
                {/* Left Section */}
                <View style={styles.leftSection}>
                    {showBack && (
                        <TouchableOpacity
                            onPress={onBackPress}
                            style={styles.backButton}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                            <Ionicons name="arrow-back" size={24} color={COLORS.neutral[700]} />
                        </TouchableOpacity>
                    )}

                    {showCursiveTitle ? (
                        <View style={styles.logoContainer}>
                            <Ionicons name="leaf" size={24} color={COLORS.primary[600]} style={{ marginRight: 6 }} />
                            <Text style={styles.cursiveTitle}>
                                {t('common.app_name')}
                            </Text>
                        </View>
                    ) : (
                        title && (
                            <Text style={styles.title} numberOfLines={1}>
                                {title}
                            </Text>
                        )
                    )}
                </View>

                {/* Connection Status Indicator */}
                {status !== 'updated' && (
                    <View
                        style={[
                            styles.statusContainer,
                            { backgroundColor: getStatusColor() + '20' }
                        ]}
                    >
                        <View
                            style={[
                                styles.statusDot,
                                { backgroundColor: getStatusColor() }
                            ]}
                        />
                        <Text style={[styles.statusText, { color: getStatusColor() }]}>
                            {getStatusText()}
                        </Text>
                    </View>
                )}

                {/* Right Section */}
                <View style={styles.rightSection}>
                    {rightContent}

                    {showLanguage && (
                        <TouchableOpacity
                            onPress={onLanguagePress}
                            style={styles.iconButton}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                            <Ionicons name="language" size={22} color={COLORS.neutral[600]} />
                        </TouchableOpacity>
                    )}

                    {showNotifications && (
                        <TouchableOpacity
                            onPress={onNotificationsPress}
                            style={styles.iconButton}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                            <Ionicons name="notifications-outline" size={22} color={COLORS.neutral[600]} />
                            {notificationCount > 0 && (
                                <View style={styles.badge}>
                                    <Text style={styles.badgeText}>
                                        {notificationCount > 9 ? '9+' : notificationCount}
                                    </Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    )}

                    {showChats && (
                        <TouchableOpacity
                            onPress={onChatsPress}
                            style={styles.iconButton}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                            <Ionicons name="chatbubbles-outline" size={22} color={COLORS.neutral[600]} />
                            {chatUnreadCount > 0 && (
                                <View style={styles.badge}>
                                    <Text style={styles.badgeText}>
                                        {chatUnreadCount > 9 ? '9+' : chatUnreadCount}
                                    </Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        backgroundColor: '#ffffff',
    },
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.neutral[100],
    },
    leftSection: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    backButton: {
        marginRight: 12,
        padding: 4,
    },
    logoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    cursiveTitle: {
        fontSize: 26,
        color: COLORS.primary[600],
        fontFamily: 'IrishGrover_400Regular',
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
        color: COLORS.neutral[800],
    },
    statusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 50,
        marginRight: 8,
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 4,
    },
    statusText: {
        fontSize: 12,
    },
    rightSection: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconButton: {
        padding: 8,
        marginLeft: 4,
        position: 'relative',
    },
    badge: {
        position: 'absolute',
        top: 0,
        right: 0,
        backgroundColor: COLORS.error,
        borderRadius: 9,
        minWidth: 18,
        height: 18,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1.5,
        borderColor: '#ffffff',
    },
    badgeText: {
        color: '#ffffff',
        fontSize: 10,
        fontWeight: 'bold',
    },
});

export default Header;
