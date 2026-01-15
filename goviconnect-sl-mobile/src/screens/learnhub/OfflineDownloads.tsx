import React, { useState, useEffect } from 'react';
import { View, FlatList, TouchableOpacity, Text, Alert, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { Header, EmptyState } from '../../components';
import { COLORS } from '../../utils/constants';
import { getSavedLearnHub, SavedLearnHubItem } from '../../services/storage';
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
                        // In real app, would remove download logic
                        // For now we just reload what's there (mock behavior)
                        await loadDownloads();
                    }
                },
            ]
        );
    };

    const renderItem = ({ item }: { item: SavedLearnHubItem }) => {
        const crop = cropsData.crops.find(c => c.id === item.id);

        return (
            <View style={styles.itemContainer}>
                <View
                    style={[
                        styles.iconContainer,
                        { backgroundColor: (crop?.color || COLORS.primary[500]) + '20' }
                    ]}
                >
                    <Text style={styles.icon}>{crop?.icon || '🌱'}</Text>
                </View>

                <View style={styles.textContainer}>
                    <Text style={styles.title}>
                        {i18n.language === 'si' ? item.titleSi : item.title}
                    </Text>
                    <Text style={styles.subtitle}>{item.category}</Text>
                </View>

                <TouchableOpacity
                    onPress={() => handleRemoveDownload(item)}
                    style={styles.deleteButton}
                >
                    <Ionicons name="trash-outline" size={20} color={COLORS.error} />
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <Header
                title={t('learnhub.offline_downloads')}
                showBack
                onBackPress={() => navigation.goBack()}
            />

            {downloads.length > 0 ? (
                <>
                    <View style={styles.statusBanner}>
                        <View style={styles.statusContent}>
                            <Ionicons name="cloud-done" size={24} color={COLORS.success} />
                            <Text style={styles.statusText}>
                                {downloads.length} items available offline
                            </Text>
                        </View>
                    </View>

                    <FlatList
                        data={downloads}
                        renderItem={renderItem}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={styles.listContent}
                        showsVerticalScrollIndicator={false}
                    />
                </>
            ) : (
                <EmptyState
                    icon="cloud-download-outline"
                    title={t('learnhub.no_downloads')}
                    description="Download guides to access them without internet"
                    actionLabel={t('learnhub.title')}
                    onAction={() => navigation.navigate('LearnHubTab' as any)} // Cast just to be safe if types mismatch
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
    statusBanner: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#f0fdf4', // green-50
        marginHorizontal: 16,
        marginTop: 16,
        borderRadius: 12,
    },
    statusContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statusText: {
        color: '#15803d', // green-700
        fontWeight: '500',
        marginLeft: 8,
    },
    listContent: {
        padding: 16,
    },
    itemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: COLORS.neutral[100],
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    icon: {
        fontSize: 24,
    },
    textContainer: {
        flex: 1,
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.neutral[800],
    },
    subtitle: {
        fontSize: 12,
        color: COLORS.neutral[400],
        textTransform: 'capitalize',
    },
    deleteButton: {
        padding: 8,
    },
});

export default OfflineDownloads;
