import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
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
        <SafeAreaView className="bg-white">
            <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
            <View className="flex-row items-center justify-between px-4 py-3 border-b border-neutral-100">
                {/* Left Section */}
                <View className="flex-row items-center flex-1">
                    {showBack && (
                        <TouchableOpacity
                            onPress={onBackPress}
                            className="mr-3 p-1"
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                            <Ionicons name="arrow-back" size={24} color={COLORS.neutral[700]} />
                        </TouchableOpacity>
                    )}

                    {showCursiveTitle ? (
                        <Text className="text-2xl font-bold text-primary-600" style={{ fontFamily: 'cursive' }}>
                            {t('common.app_name')}
                        </Text>
                    ) : (
                        title && (
                            <Text className="text-lg font-semibold text-neutral-800" numberOfLines={1}>
                                {title}
                            </Text>
                        )
                    )}
                </View>

                {/* Connection Status Indicator */}
                {status !== 'updated' && (
                    <View
                        className="flex-row items-center px-2 py-1 rounded-full mr-2"
                        style={{ backgroundColor: getStatusColor() + '20' }}
                    >
                        <View
                            className="w-2 h-2 rounded-full mr-1"
                            style={{ backgroundColor: getStatusColor() }}
                        />
                        <Text className="text-xs" style={{ color: getStatusColor() }}>
                            {getStatusText()}
                        </Text>
                    </View>
                )}

                {/* Right Section */}
                <View className="flex-row items-center">
                    {rightContent}

                    {showLanguage && (
                        <TouchableOpacity
                            onPress={onLanguagePress}
                            className="p-2 ml-1"
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                            <Ionicons name="language" size={22} color={COLORS.neutral[600]} />
                        </TouchableOpacity>
                    )}

                    {showNotifications && (
                        <TouchableOpacity
                            onPress={onNotificationsPress}
                            className="p-2 ml-1 relative"
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                            <Ionicons name="notifications-outline" size={22} color={COLORS.neutral[600]} />
                            {notificationCount > 0 && (
                                <View className="absolute -top-1 -right-1 bg-red-500 rounded-full min-w-[18px] h-[18px] items-center justify-center">
                                    <Text className="text-white text-xs font-bold">
                                        {notificationCount > 9 ? '9+' : notificationCount}
                                    </Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    )}

                    {showChats && (
                        <TouchableOpacity
                            onPress={onChatsPress}
                            className="p-2 ml-1 relative"
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                            <Ionicons name="chatbubbles-outline" size={22} color={COLORS.neutral[600]} />
                            {chatUnreadCount > 0 && (
                                <View className="absolute -top-1 -right-1 bg-red-500 rounded-full min-w-[18px] h-[18px] items-center justify-center">
                                    <Text className="text-white text-xs font-bold">
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

export default Header;
