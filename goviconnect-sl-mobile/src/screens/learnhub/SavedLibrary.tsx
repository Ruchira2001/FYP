import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { Header, CropCard, EmptyState } from '../../components';
import { learnhubAPI } from '../../services/api';
import { COLORS } from '../../utils/constants';

const SavedLibrary: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    const { t, i18n } = useTranslation();
    const [savedItems, setSavedItems] = useState<any[]>([]);

    useEffect(() => {
        loadSavedItems();
    }, []);

    const loadSavedItems = async () => {
        try {
            const res = await learnhubAPI.getSavedGuides();
            const items = Array.isArray(res.data.data) ? res.data.data : [];
            setSavedItems(items);
        } catch (e) {
            console.error('Failed to load saved items:', e);
        }
    };

    const renderItem = ({ item }: { item: any }) => (
        <View style={styles.itemContainer}>
            <CropCard
                id={item._id || item.id}
                name={item.name || item.title || ''}
                nameSi={item.nameSi || item.titleSi || ''}
                category={item.category || ''}
                thumbnail={item.images?.[0]}
                onPress={() => navigation.navigate('FarmerGuideDetails', { guide: item })}
                isSaved={true}
                isDownloaded={false}
                locale={i18n.language}
                size="lg"
            />
        </View>
    );

    return (
        <View style={styles.container}>
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
                    contentContainerStyle={styles.listContent}
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

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.neutral[50], // Use neutral[50] for background
    },
    listContent: {
        padding: 16,
    },
    itemContainer: {
        marginBottom: 12, // Add spacing between items
    },
});

export default SavedLibrary;
