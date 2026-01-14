import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TextInput, FlatList, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { Header, Chip, CropCard, EmptyState } from '../../components';
import { COLORS, CROP_CATEGORIES } from '../../utils/constants';
import cropsData from '../../data/crops.json';
import learnhubData from '../../data/learnhub.json';
import { getSavedLearnHub, SavedLearnHubItem } from '../../services/storage';

const LearnHub: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    const { t, i18n } = useTranslation();

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [savedItems, setSavedItems] = useState<SavedLearnHubItem[]>([]);

    useEffect(() => {
        loadSavedItems();
    }, []);

    const loadSavedItems = async () => {
        const items = await getSavedLearnHub();
        setSavedItems(items);
    };

    const filteredCrops = cropsData.crops.filter((crop) => {
        const matchesCategory = selectedCategory === 'all' || crop.category === selectedCategory;
        const matchesSearch = searchQuery === '' ||
            crop.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            crop.nameSi.includes(searchQuery);
        return matchesCategory && matchesSearch;
    });

    const guides = learnhubData.guides.filter((guide) => {
        const matchesCategory = selectedCategory === 'all' || guide.category === selectedCategory;
        const matchesSearch = searchQuery === '' ||
            guide.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            guide.titleSi.includes(searchQuery);
        return matchesCategory && matchesSearch;
    });

    const renderCropItem = ({ item }: { item: typeof cropsData.crops[0] }) => {
        const isSaved = savedItems.some(s => s.id === item.id);
        const isDownloaded = savedItems.some(s => s.id === item.id && s.isDownloaded);

        return (
            <CropCard
                id={item.id}
                name={item.name}
                nameSi={item.nameSi}
                category={item.category}
                emoji={item.icon}
                color={item.color}
                onPress={() => navigation.navigate('CropDetails', { cropId: item.id })}
                isSaved={isSaved}
                isDownloaded={isDownloaded}
                locale={i18n.language}
                size="md"
            />
        );
    };

    return (
        <View className="flex-1 bg-neutral-50">
            <Header title={t('learnhub.title')} />

            {/* Search Bar */}
            <View className="px-4 py-3">
                <View className="flex-row items-center bg-white rounded-xl px-4 py-3 border border-neutral-200">
                    <Ionicons name="search" size={20} color={COLORS.neutral[400]} />
                    <TextInput
                        className="flex-1 ml-3 text-base text-neutral-800"
                        placeholder={t('learnhub.search_placeholder')}
                        placeholderTextColor={COLORS.neutral[400]}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                            <Ionicons name="close-circle" size={20} color={COLORS.neutral[400]} />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* Category Chips */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 8 }}
            >
                {CROP_CATEGORIES.map((category) => (
                    <Chip
                        key={category.id}
                        label={i18n.language === 'si' ? category.nameSi : category.nameEn}
                        selected={selectedCategory === category.id}
                        onPress={() => setSelectedCategory(category.id)}
                        variant="outline"
                        size="md"
                    />
                ))}
            </ScrollView>

            {/* Quick Links */}
            <View className="flex-row px-4 py-2 space-x-3">
                <TouchableOpacity
                    onPress={() => navigation.navigate('SavedLibrary')}
                    className="flex-1 bg-primary-50 rounded-xl py-3 px-4 flex-row items-center mr-2"
                >
                    <Ionicons name="bookmark" size={18} color={COLORS.primary[600]} />
                    <Text className="text-primary-700 font-medium ml-2 text-sm">
                        {t('learnhub.saved_library')}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => navigation.navigate('OfflineDownloads')}
                    className="flex-1 bg-green-50 rounded-xl py-3 px-4 flex-row items-center"
                >
                    <Ionicons name="cloud-download" size={18} color={COLORS.success} />
                    <Text className="text-green-700 font-medium ml-2 text-sm">
                        {t('learnhub.offline_downloads')}
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Crop Grid */}
            {filteredCrops.length > 0 ? (
                <FlatList
                    data={filteredCrops}
                    renderItem={renderCropItem}
                    keyExtractor={(item) => item.id}
                    numColumns={2}
                    contentContainerStyle={{ padding: 16 }}
                    columnWrapperStyle={{ justifyContent: 'space-between' }}
                    showsVerticalScrollIndicator={false}
                />
            ) : (
                <EmptyState
                    variant="search"
                    title={t('empty_states.no_results')}
                    description={t('empty_states.no_results_desc')}
                />
            )}
        </View>
    );
};

export default LearnHub;
