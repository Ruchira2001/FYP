import React, { useState, useEffect } from 'react';
import { View, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { Header, CropCard, EmptyState } from '../../components';
import { getSavedLearnHub, removeLearnHubItem, SavedLearnHubItem } from '../../services/storage';
import cropsData from '../../data/crops.json';

const SavedLibrary: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    const { t, i18n } = useTranslation();
    const [savedItems, setSavedItems] = useState<SavedLearnHubItem[]>([]);

    useEffect(() => {
        loadSavedItems();
    }, []);

    const loadSavedItems = async () => {
        const items = await getSavedLearnHub();
        setSavedItems(items);
    };

    const renderItem = ({ item }: { item: SavedLearnHubItem }) => {
        const crop = cropsData.crops.find(c => c.id === item.id);

        return (
            <CropCard
                id={item.id}
                name={item.title}
                nameSi={item.titleSi}
                category={item.category}
                emoji={crop?.icon || '🌱'}
                color={crop?.color}
                onPress={() => navigation.navigate('CropDetails', { cropId: item.id })}
                isSaved={true}
                isDownloaded={item.isDownloaded}
                locale={i18n.language}
                size="lg"
            />
        );
    };

    return (
        <View className="flex-1 bg-neutral-50">
            <Header
                title={t('learnhub.saved_library')}
                showBack
                onBackPress={() => navigation.goBack()}
            />

            {savedItems.length > 0 ? (
                <FlatList
                    data={savedItems}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={{ padding: 16 }}
                    showsVerticalScrollIndicator={false}
                />
            ) : (
                <EmptyState
                    icon="bookmark-outline"
                    title={t('learnhub.no_saved')}
                    description="Save guides to access them quickly later"
                    actionLabel={t('learnhub.title')}
                    onAction={() => navigation.goBack()}
                />
            )}
        </View>
    );
};

export default SavedLibrary;
