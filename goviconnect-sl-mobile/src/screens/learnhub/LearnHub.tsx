import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TextInput, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { Header, Chip, CropCard, EmptyState } from '../../components';
import { COLORS, CROP_CATEGORIES } from '../../utils/constants';
import { learnhubAPI, feedAPI } from '../../services/api';

const LearnHub: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    const { t, i18n } = useTranslation();

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [crops, setCrops] = useState<any[]>([]);
    const [savedIds, setSavedIds] = useState<string[]>([]);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [cropsRes, savedRes] = await Promise.all([
                feedAPI.getCrops().catch(() => ({ data: { data: [] } })),
                learnhubAPI.getSavedGuides().catch(() => ({ data: { data: [] } })),
            ]);
            setCrops(Array.isArray(cropsRes.data.data) ? cropsRes.data.data : []);
            const saved = Array.isArray(savedRes.data.data) ? savedRes.data.data : [];
            setSavedIds(saved.map((s: any) => s._id || s.id || s.guideId));
        } catch (e) {
            console.error('LearnHub load error:', e);
        }
    };

    const filteredCrops = crops.filter((crop: any) => {
        const matchesCategory = selectedCategory === 'all' || crop.category === selectedCategory;
        const matchesSearch = searchQuery === '' ||
            (crop.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (crop.nameSi || '').includes(searchQuery);
        return matchesCategory && matchesSearch;
    });

    const renderCropItem = ({ item }: { item: any }) => {
        const isSaved = savedIds.includes(item._id || item.id);
        return (
            <View style={styles.cropCardWrapper}>
                <CropCard
                    id={item._id || item.id}
                    name={item.name || ''}
                    nameSi={item.nameSi || ''}
                    category={item.category || ''}
                    emoji={item.icon || '🌱'}
                    color={item.color || '#22c55e'}
                    onPress={() => navigation.navigate('CropDetails', { cropId: item._id || item.id })}
                    isSaved={isSaved}
                    isDownloaded={false}
                    locale={i18n.language}
                    size="md"
                />
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <Header title={t('learnhub.title')} showBack onBackPress={() => navigation.goBack()} />

            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <View style={styles.searchBar}>
                    <Ionicons name="search" size={20} color={COLORS.neutral[400]} />
                    <TextInput
                        style={styles.searchInput}
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
            <View style={styles.categoriesContainer}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.categoriesContent}
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
            </View>

            {/* Quick Links */}
            <View style={styles.quickLinksContainer}>
                <TouchableOpacity
                    onPress={() => navigation.navigate('SavedLibrary')}
                    style={[styles.quickLink, { backgroundColor: COLORS.primary[50], marginRight: 12 }]}
                >
                    <Ionicons name="bookmark" size={18} color={COLORS.primary[600]} />
                    <Text style={[styles.quickLinkText, { color: COLORS.primary[700] }]}>
                        {t('learnhub.saved_library')}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => navigation.navigate('OfflineDownloads')}
                    style={[styles.quickLink, { backgroundColor: '#f0fdf4' }]}
                >
                    <Ionicons name="cloud-download" size={18} color={COLORS.success} />
                    <Text style={[styles.quickLinkText, { color: '#15803d' }]}>
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
                    contentContainerStyle={styles.listContent}
                    columnWrapperStyle={styles.columnWrapper}
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

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.neutral[50],
    },
    searchContainer: {
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderWidth: 1,
        borderColor: COLORS.neutral[200],
    },
    searchInput: {
        flex: 1,
        marginLeft: 12,
        fontSize: 16,
        color: COLORS.neutral[800],
    },
    categoriesContainer: {
        marginBottom: 8,
    },
    categoriesContent: {
        paddingHorizontal: 16,
        paddingBottom: 8,
    },
    quickLinksContainer: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    quickLink: {
        flex: 1,
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    quickLinkText: {
        fontWeight: '500',
        marginLeft: 8,
        fontSize: 14,
    },
    listContent: {
        padding: 16,
    },
    columnWrapper: {
        justifyContent: 'space-between',
    },
    cropCardWrapper: {
        width: '48%',
        marginBottom: 16,
    },
});

export default LearnHub;
