/**
 * NearbyShopsMap.web.tsx — web-only version.
 * react-native-maps is a native-only library; Metro picks this file automatically
 * for web builds. Shows a plain list of nearby shops instead of a map.
 */
import React, { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    Linking,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { Header } from '../../../components';
import { shopAPI } from '../../../services/api';
import { COLORS } from '../../../utils/constants';

type NearbyShop = {
    id: string;
    name: string;
    phone: string;
    location: string;
    address: string;
    latitude: number;
    longitude: number;
    distanceKm: number;
    totalProducts: number;
    categories: string[];
    coordinatesApproximated?: boolean;
};

type RouteParams = {
    diseaseName?: string;
};

const NearbyShopsMap: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    const route = useRoute<any>();
    const params: RouteParams = route.params || {};

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [shops, setShops] = useState<NearbyShop[]>([]);
    const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);

    const loadNearbyShops = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setError('Location permission is required to show nearby agro shops.');
                setShops([]);
                return;
            }
            const current = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.Balanced,
            });
            const lat = current.coords.latitude;
            const lng = current.coords.longitude;
            setUserLocation({ latitude: lat, longitude: lng });

            const res = await shopAPI.getNearbyShops({ lat, lng, radiusKm: 500 });
            const data = Array.isArray(res.data?.data) ? res.data.data : [];
            setShops(data);
        } catch (e) {
            console.error('Failed to load nearby shops:', e);
            setError('Unable to load nearby shops right now. Please try again.');
            setShops([]);
        } finally {
            setLoading(false);
        }
    }, [params.diseaseName]);

    useFocusEffect(
        useCallback(() => {
            loadNearbyShops();
        }, [loadNearbyShops])
    );

    const openExternalMap = (shop: NearbyShop) => {
        const label = encodeURIComponent(shop.name);
        const latLng = `${shop.latitude},${shop.longitude}`;
        const url = `https://www.google.com/maps/search/?api=1&query=${latLng}(${label})`;
        Linking.openURL(url).catch(() => {});
    };

    return (
        <View style={styles.container}>
            <Header
                title="Nearby Agro Shops"
                showBack
                onBackPress={() => navigation.goBack()}
            />

            {loading ? (
                <View style={styles.centeredState}>
                    <ActivityIndicator size="large" color={COLORS.primary[600]} />
                    <Text style={styles.stateText}>Finding nearby shops...</Text>
                </View>
            ) : error ? (
                <View style={styles.centeredState}>
                    <Ionicons name="location-outline" size={40} color={COLORS.warning} />
                    <Text style={styles.stateTitle}>Location Needed</Text>
                    <Text style={styles.stateText}>{error}</Text>
                    <TouchableOpacity onPress={loadNearbyShops} style={styles.retryButton}>
                        <Text style={styles.retryButtonText}>Try Again</Text>
                    </TouchableOpacity>
                </View>
            ) : shops.length === 0 ? (
                <View style={styles.centeredState}>
                    <Ionicons name="storefront-outline" size={48} color={COLORS.neutral[300]} />
                    <Text style={styles.stateTitle}>No shops found</Text>
                    <Text style={styles.stateText}>No agro shops found near your location.</Text>
                </View>
            ) : (
                <ScrollView contentContainerStyle={styles.listContent}>
                    {/* Web notice banner */}
                    <View style={styles.webBanner}>
                        <Ionicons name="information-circle-outline" size={16} color={COLORS.primary[700]} />
                        <Text style={styles.webBannerText}>
                            Map view is not available on web. Showing {shops.length} shop(s) near you as a list.
                        </Text>
                    </View>

                    {shops.map((shop) => (
                        <View key={shop.id} style={styles.shopCard}>
                            <View style={styles.shopHeader}>
                                <View style={styles.shopTitleRow}>
                                    <Ionicons name="storefront-outline" size={18} color={COLORS.primary[600]} />
                                    <Text style={styles.shopName}>{shop.name}</Text>
                                </View>
                                <View style={styles.distanceBadge}>
                                    <Text style={styles.distanceText}>{shop.distanceKm} km</Text>
                                </View>
                            </View>

                            <Text style={styles.shopAddress}>
                                {shop.location || shop.address || 'Sri Lanka'}
                            </Text>

                            {shop.categories?.length > 0 && (
                                <Text style={styles.shopMeta}>
                                    {shop.categories.slice(0, 3).join(' · ')}
                                </Text>
                            )}

                            <Text style={styles.shopMeta}>{shop.totalProducts} products available</Text>

                            <View style={styles.shopActions}>
                                <TouchableOpacity
                                    style={styles.mapButton}
                                    onPress={() => openExternalMap(shop)}
                                >
                                    <Ionicons name="navigate-outline" size={14} color={COLORS.primary[700]} />
                                    <Text style={styles.mapButtonText}>Open in Maps</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.detailButton}
                                    onPress={() =>
                                        navigation.navigate('NearbyShopDetail', {
                                            shopId: shop.id,
                                            userLocation,
                                            diseaseName: params.diseaseName,
                                        })
                                    }
                                >
                                    <Text style={styles.detailButtonText}>View Details</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    ))}
                </ScrollView>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.neutral[50],
    },
    centeredState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 24,
    },
    stateTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.neutral[800],
        marginTop: 12,
    },
    stateText: {
        marginTop: 8,
        textAlign: 'center',
        color: COLORS.neutral[500],
    },
    retryButton: {
        marginTop: 16,
        backgroundColor: COLORS.primary[600],
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 10,
    },
    retryButtonText: {
        color: '#ffffff',
        fontWeight: '700',
    },
    listContent: {
        padding: 16,
        gap: 12,
    },
    webBanner: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 8,
        backgroundColor: COLORS.primary[50],
        borderRadius: 10,
        padding: 12,
        marginBottom: 4,
    },
    webBannerText: {
        flex: 1,
        fontSize: 13,
        color: COLORS.primary[700],
        lineHeight: 18,
    },
    shopCard: {
        backgroundColor: '#ffffff',
        borderRadius: 14,
        padding: 14,
        borderWidth: 1,
        borderColor: COLORS.neutral[100],
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
        elevation: 2,
    },
    shopHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 6,
    },
    shopTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        flex: 1,
    },
    shopName: {
        fontSize: 15,
        fontWeight: '700',
        color: COLORS.neutral[800],
        flexShrink: 1,
    },
    distanceBadge: {
        backgroundColor: COLORS.primary[50],
        borderRadius: 8,
        paddingHorizontal: 8,
        paddingVertical: 3,
    },
    distanceText: {
        fontSize: 12,
        color: COLORS.primary[700],
        fontWeight: '600',
    },
    shopAddress: {
        fontSize: 13,
        color: COLORS.neutral[600],
        marginBottom: 4,
    },
    shopMeta: {
        fontSize: 12,
        color: COLORS.neutral[400],
        marginBottom: 2,
    },
    shopActions: {
        flexDirection: 'row',
        gap: 8,
        marginTop: 10,
    },
    mapButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 12,
        paddingVertical: 7,
        borderRadius: 8,
        backgroundColor: COLORS.primary[50],
    },
    mapButtonText: {
        color: COLORS.primary[700],
        fontWeight: '600',
        fontSize: 13,
    },
    detailButton: {
        paddingHorizontal: 14,
        paddingVertical: 7,
        borderRadius: 8,
        backgroundColor: (COLORS.success as string) + '20',
    },
    detailButtonText: {
        color: COLORS.success,
        fontWeight: '700',
        fontSize: 13,
    },
});

export default NearbyShopsMap;
