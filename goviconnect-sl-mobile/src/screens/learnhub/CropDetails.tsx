import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { Header, PrimaryButton, Chip } from '../../components';
import { COLORS } from '../../utils/constants';
import {
    saveLearnHubItem,
    removeLearnHubItem,
    getSavedLearnHub,
    SavedLearnHubItem,
} from '../../services/storage';
import learnhubData from '../../data/learnhub.json';
import cropsData from '../../data/crops.json';

type ParamList = {
    CropDetails: { cropId: string };
};

type Tab = 'overview' | 'diseases' | 'treatment' | 'practices' | 'media';

const CropDetails: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    const route = useRoute<RouteProp<ParamList, 'CropDetails'>>();
    const { cropId } = route.params;
    const { t, i18n } = useTranslation();

    const [activeTab, setActiveTab] = useState<Tab>('overview');
    const [isSaved, setIsSaved] = useState(false);
    const [isDownloaded, setIsDownloaded] = useState(false);

    const guide = learnhubData.guides.find(g => g.cropId === cropId);
    const crop = cropsData.crops.find(c => c.id === cropId);

    useEffect(() => {
        checkSavedStatus();
    }, []);

    const checkSavedStatus = async () => {
        const saved = await getSavedLearnHub();
        const item = saved.find(s => s.id === cropId);
        if (item) {
            setIsSaved(true);
            setIsDownloaded(item.isDownloaded);
        }
    };

    const handleSave = async () => {
        if (isSaved) {
            await removeLearnHubItem(cropId);
            setIsSaved(false);
            setIsDownloaded(false);
        } else {
            const item: SavedLearnHubItem = {
                id: cropId,
                title: guide?.title || crop?.name || '',
                titleSi: guide?.titleSi || crop?.nameSi || '',
                category: crop?.category || '',
                savedAt: new Date().toISOString(),
                isDownloaded: false,
            };
            await saveLearnHubItem(item);
            setIsSaved(true);
        }
    };

    const handleDownload = async () => {
        // Simulate download
        setIsDownloaded(!isDownloaded);
        const saved = await getSavedLearnHub();
        const item = saved.find(s => s.id === cropId);
        if (item) {
            item.isDownloaded = !isDownloaded;
            await saveLearnHubItem(item);
        }
    };

    const tabs: { id: Tab; labelKey: string }[] = [
        { id: 'overview', labelKey: 'learnhub.overview' },
        { id: 'diseases', labelKey: 'learnhub.diseases' },
        { id: 'treatment', labelKey: 'learnhub.treatment' },
        { id: 'practices', labelKey: 'learnhub.best_practices' },
        { id: 'media', labelKey: 'learnhub.media' },
    ];

    const renderOverview = () => (
        <View className="p-4">
            <Text className="text-base text-neutral-700 leading-6 mb-4">
                {i18n.language === 'si' ? guide?.overview.contentSi : guide?.overview.content}
            </Text>

            <View className="flex-row flex-wrap">
                <View className="w-1/2 mb-4">
                    <Text className="text-xs text-neutral-400 uppercase mb-1">Climate</Text>
                    <Text className="text-sm text-neutral-700 font-medium">
                        {i18n.language === 'si' ? guide?.overview.climateSi : guide?.overview.climate}
                    </Text>
                </View>

                <View className="w-1/2 mb-4">
                    <Text className="text-xs text-neutral-400 uppercase mb-1">Soil</Text>
                    <Text className="text-sm text-neutral-700 font-medium">
                        {i18n.language === 'si' ? guide?.overview.soilSi : guide?.overview.soil}
                    </Text>
                </View>

                <View className="w-full">
                    <Text className="text-xs text-neutral-400 uppercase mb-1">Season</Text>
                    <Text className="text-sm text-neutral-700 font-medium">
                        {i18n.language === 'si' ? guide?.overview.seasonSi : guide?.overview.season}
                    </Text>
                </View>
            </View>
        </View>
    );

    const renderDiseases = () => (
        <View className="p-4">
            {guide?.diseases.map((disease, index) => (
                <View
                    key={index}
                    className="bg-white rounded-xl p-4 mb-3 border border-neutral-100"
                    style={{
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 1 },
                        shadowOpacity: 0.05,
                        shadowRadius: 4,
                        elevation: 1,
                    }}
                >
                    <View className="flex-row items-center justify-between mb-2">
                        <Text className="text-base font-semibold text-neutral-800">
                            {i18n.language === 'si' ? disease.nameSi : disease.name}
                        </Text>
                        <View className={`px-2 py-1 rounded-full ${disease.severity === 'critical' ? 'bg-red-100' :
                                disease.severity === 'high' ? 'bg-orange-100' : 'bg-yellow-100'
                            }`}>
                            <Text className={`text-xs font-medium ${disease.severity === 'critical' ? 'text-red-600' :
                                    disease.severity === 'high' ? 'text-orange-600' : 'text-yellow-600'
                                }`}>
                                {disease.severity}
                            </Text>
                        </View>
                    </View>
                    <Text className="text-sm text-neutral-600">
                        {i18n.language === 'si' ? disease.symptomsSi : disease.symptoms}
                    </Text>
                </View>
            ))}
        </View>
    );

    const renderTreatment = () => (
        <View className="p-4">
            {guide?.treatments.map((treatment, index) => (
                <View key={index} className="mb-4">
                    <Text className="text-base font-semibold text-neutral-800 mb-2">
                        {treatment.disease}
                    </Text>
                    {(i18n.language === 'si' ? treatment.methodsSi : treatment.methods).map((method, mIndex) => (
                        <View key={mIndex} className="flex-row items-start mb-2">
                            <Ionicons name="checkmark-circle" size={18} color={COLORS.success} style={{ marginTop: 2 }} />
                            <Text className="flex-1 ml-2 text-sm text-neutral-700">{method}</Text>
                        </View>
                    ))}
                </View>
            ))}
        </View>
    );

    const renderPractices = () => (
        <View className="p-4">
            {guide?.bestPractices.map((practice, index) => (
                <View
                    key={index}
                    className="bg-primary-50 rounded-xl p-4 mb-3"
                >
                    <Text className="text-base font-semibold text-primary-800 mb-2">
                        {i18n.language === 'si' ? practice.titleSi : practice.title}
                    </Text>
                    <Text className="text-sm text-primary-700">
                        {i18n.language === 'si' ? practice.contentSi : practice.content}
                    </Text>
                </View>
            ))}
        </View>
    );

    const renderMedia = () => (
        <View className="p-4">
            <Text className="text-sm text-neutral-500 mb-4">
                Videos and images related to {crop?.name} cultivation.
            </Text>

            {guide?.media.videos.map((video, index) => (
                <TouchableOpacity
                    key={index}
                    className="bg-neutral-100 rounded-xl h-40 mb-3 items-center justify-center"
                >
                    <Ionicons name="play-circle" size={48} color={COLORS.neutral[400]} />
                    <Text className="text-neutral-500 mt-2">{video}</Text>
                </TouchableOpacity>
            ))}

            <View className="flex-row flex-wrap -mx-1 mt-2">
                {guide?.media.images.map((image, index) => (
                    <View key={index} className="w-1/3 p-1">
                        <View className="bg-neutral-200 rounded-lg aspect-square items-center justify-center">
                            <Ionicons name="image" size={24} color={COLORS.neutral[400]} />
                        </View>
                    </View>
                ))}
            </View>
        </View>
    );

    return (
        <View className="flex-1 bg-neutral-50">
            <Header
                title={i18n.language === 'si' ? guide?.titleSi || crop?.nameSi : guide?.title || crop?.name}
                showBack
                onBackPress={() => navigation.goBack()}
            />

            {/* Hero Section */}
            <View
                className="mx-4 mt-4 rounded-2xl p-6 items-center"
                style={{ backgroundColor: crop?.color + '20' }}
            >
                <Text className="text-5xl mb-3">{crop?.icon}</Text>
                <Text className="text-xl font-bold" style={{ color: crop?.color }}>
                    {i18n.language === 'si' ? crop?.nameSi : crop?.name}
                </Text>
            </View>

            {/* Action Buttons */}
            <View className="flex-row px-4 py-4">
                <TouchableOpacity
                    onPress={handleSave}
                    className={`flex-1 mr-2 py-3 rounded-xl flex-row items-center justify-center ${isSaved ? 'bg-primary-500' : 'bg-white border border-neutral-200'
                        }`}
                >
                    <Ionicons
                        name={isSaved ? 'bookmark' : 'bookmark-outline'}
                        size={18}
                        color={isSaved ? 'white' : COLORS.neutral[600]}
                    />
                    <Text className={`ml-2 font-medium ${isSaved ? 'text-white' : 'text-neutral-700'}`}>
                        {isSaved ? t('learnhub.saved') : t('learnhub.save')}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={handleDownload}
                    className={`flex-1 py-3 rounded-xl flex-row items-center justify-center ${isDownloaded ? 'bg-green-500' : 'bg-white border border-neutral-200'
                        }`}
                >
                    <Ionicons
                        name={isDownloaded ? 'cloud-done' : 'cloud-download-outline'}
                        size={18}
                        color={isDownloaded ? 'white' : COLORS.neutral[600]}
                    />
                    <Text className={`ml-2 font-medium ${isDownloaded ? 'text-white' : 'text-neutral-700'}`}>
                        {isDownloaded ? t('learnhub.downloaded') : t('learnhub.download')}
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Tabs */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 16 }}
            >
                {tabs.map((tab) => (
                    <TouchableOpacity
                        key={tab.id}
                        onPress={() => setActiveTab(tab.id)}
                        className={`px-4 py-2 mr-2 rounded-full ${activeTab === tab.id ? 'bg-primary-500' : 'bg-neutral-200'
                            }`}
                    >
                        <Text className={`text-sm font-medium ${activeTab === tab.id ? 'text-white' : 'text-neutral-600'
                            }`}>
                            {t(tab.labelKey)}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {/* Tab Content */}
            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                {activeTab === 'overview' && renderOverview()}
                {activeTab === 'diseases' && renderDiseases()}
                {activeTab === 'treatment' && renderTreatment()}
                {activeTab === 'practices' && renderPractices()}
                {activeTab === 'media' && renderMedia()}
                <View className="h-6" />
            </ScrollView>
        </View>
    );
};

export default CropDetails;
