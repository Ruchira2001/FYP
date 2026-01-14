import React, { useState, useEffect } from 'react';
import { View, FlatList, TouchableOpacity, Text, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { Header, CropCard, EmptyState } from '../../components';
import { COLORS } from '../../utils/constants';
import { getSavedLearnHub, removeLearnHubItem, SavedLearnHubItem } from '../../services/storage';
import cropsData from '../../data/crops.json';

const OfflineDownloads: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    const { t, i18n } = useTranslation();
    const [downloads, setDownloads] = useState<SavedLearnHubItem[]>([]);

    useEffect(() => {
        loadDownloads();
    }, []);

    const loadDownloads = async () => {
        const items = await getSavedLearnHub();
        setDownloads(items.filter(item => item.isDownloaded));
    };

    const handleRemoveDownload = (item: SavedLearnHubItem) => {
        Alert.alert(
            t('learnhub.remove_download'),
            `Remove ${item.title} from offline downloads?`,
            [
                { text: t('common.cancel'), style: 'cancel' },
                {
                    text: t('common.confirm'),
                    style: 'destructive',
                    onPress: async () => {
                        // In real app, would remove download
                        await loadDownloads();
                    }
                },
            ]
        );
    };

    const renderItem = ({ item }: { item: SavedLearnHubItem }) => {
        const crop = cropsData.crops.find(c => c.id === item.id);

        return (
            <View className="flex-row items-center bg-white rounded-xl p-4 mb-3 border border-neutral-100">
                <View
                    className="w-12 h-12 rounded-xl items-center justify-center mr-3"
                    style={{ backgroundColor: (crop?.color || COLORS.primary[500]) + '20' }}
                >
                    <Text className="text-2xl">{crop?.icon || '🌱'}</Text>
                </View>

                <View className="flex-1">
                    <Text className="text-base font-semibold text-neutral-800">
                        {i18n.language === 'si' ? item.titleSi : item.title}
                    </Text>
                    <Text className="text-xs text-neutral-400 capitalize">{item.category}</Text>
                </View>

                <TouchableOpacity
                    onPress={() => handleRemoveDownload(item)}
                    className="p-2"
                >
                    <Ionicons name="trash-outline" size={20} color={COLORS.error} />
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <View className="flex-1 bg-neutral-50">
            <Header
                title={t('learnhub.offline_downloads')}
                showBack
                onBackPress={() => navigation.goBack()}
            />

            {downloads.length > 0 ? (
                <>
                    <View className="flex-row items-center justify-between px-4 py-3 bg-green-50 mx-4 mt-4 rounded-xl">
                        <View className="flex-row items-center">
                            <Ionicons name="cloud-done" size={24} color={COLORS.success} />
                            <Text className="text-green-700 font-medium ml-2">
                                {downloads.length} items available offline
                            </Text>
                        </View>
                    </View>

                    <FlatList
                        data={downloads}
                        renderItem={renderItem}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={{ padding: 16 }}
                        showsVerticalScrollIndicator={false}
                    />
                </>
            ) : (
                <EmptyState
                    icon="cloud-download-outline"
                    title={t('learnhub.no_downloads')}
                    description="Download guides to access them without internet"
                    actionLabel={t('learnhub.title')}
                    onAction={() => navigation.navigate('LearnHub')}
                />
            )}
        </View>
    );
};

export default OfflineDownloads;
