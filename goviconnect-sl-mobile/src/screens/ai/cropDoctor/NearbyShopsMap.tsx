import React, { useCallback, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Linking,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import MapView, { Callout, Marker } from 'react-native-maps';
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

            const res = await shopAPI.getNearbyShops({
                lat,
                lng,
                radiusKm: 60,
            });

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

    const initialRegion = useMemo(() => {
        if (userLocation) {
            return {
                latitude: userLocation.latitude,
                longitude: userLocation.longitude,
                latitudeDelta: 0.5,
                longitudeDelta: 0.5,
            };
        }

        if (shops.length > 0) {
            return {
                latitude: shops[0].latitude,
                longitude: shops[0].longitude,
                latitudeDelta: 0.6,
                longitudeDelta: 0.6,
            };
        }

        return {
            latitude: 7.8731,
            longitude: 80.7718,
            latitudeDelta: 2,
            longitudeDelta: 2,
        };
    }, [shops, userLocation]);

    const openExternalMap = (shop: NearbyShop) => {
        const label = encodeURIComponent(shop.name);
        const latLng = `${shop.latitude},${shop.longitude}`;
        const url = Platform.select({
            ios: `http://maps.apple.com/?ll=${latLng}&q=${label}`,
            android: `geo:${latLng}?q=${latLng}(${label})`,
            default: `https://www.google.com/maps/search/?api=1&query=${latLng}`,
        });

        if (url) {
            Linking.openURL(url).catch(() => {});
        }
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
            ) : (
                <>
                    <MapView style={styles.map} initialRegion={initialRegion}>
                        {userLocation ? (
                            <Marker
                                coordinate={{
                                    latitude: userLocation.latitude,
                                    longitude: userLocation.longitude,
                                }}
                                pinColor={COLORS.primary[600]}
                                title="Your Location"
                            />
                        ) : null}

                        {shops.map((shop) => (
                            <Marker
                                key={shop.id}
                                coordinate={{ latitude: shop.latitude, longitude: shop.longitude }}
                                pinColor={COLORS.success}
                                title={shop.name}
                                description={`${shop.distanceKm} km away`}
                            >
                                <Callout onPress={() => navigation.navigate('NearbyShopDetail', { shopId: shop.id, userLocation })}>
                                    <View style={styles.callout}>
                                        <Text style={styles.calloutTitle}>{shop.name}</Text>
                                        <Text style={styles.calloutLine}>{shop.location || shop.address || 'Sri Lanka'}</Text>
                                        <Text style={styles.calloutLine}>{shop.distanceKm} km away</Text>
                                        <Text style={styles.calloutHint}>Tap for shop details</Text>
                                    </View>
                                </Callout>
                            </Marker>
                        ))}
                    </MapView>

                    <View style={styles.bottomCard}>
                        <Text style={styles.bottomTitle}>{shops.length} shop(s) found near you</Text>
                        {shops.slice(0, 3).map((shop) => (
                            <View key={shop.id} style={styles.shopRow}>
                                <View style={styles.shopInfo}>
                                    <Text style={styles.shopName}>{shop.name}</Text>
                                    <Text style={styles.shopMeta}>{shop.distanceKm} km • {shop.totalProducts} products</Text>
                                </View>
                                <TouchableOpacity style={styles.mapButton} onPress={() => openExternalMap(shop)}>
                                    <Ionicons name="navigate-outline" size={16} color={COLORS.primary[700]} />
                                    <Text style={styles.mapButtonText}>Map</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.detailButton} onPress={() => navigation.navigate('NearbyShopDetail', { shopId: shop.id, userLocation })}>
                                    <Text style={styles.detailButtonText}>Details</Text>
                                </TouchableOpacity>
                            </View>
                        ))}
                    </View>
                </>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.neutral[50],
    },
    map: {
        flex: 1,
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
    callout: {
        minWidth: 180,
        padding: 4,
    },
    calloutTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: COLORS.neutral[800],
    },
    calloutLine: {
        fontSize: 12,
        color: COLORS.neutral[500],
        marginTop: 2,
    },
    calloutHint: {
        fontSize: 11,
        color: COLORS.primary[600],
        marginTop: 6,
        fontWeight: '600',
    },
    bottomCard: {
        backgroundColor: '#ffffff',
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        borderWidth: 1,
        borderColor: COLORS.neutral[100],
        padding: 14,
        maxHeight: 220,
    },
    bottomTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: COLORS.neutral[800],
        marginBottom: 8,
    },
    shopRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        borderTopWidth: 1,
        borderTopColor: COLORS.neutral[100],
    },
    shopInfo: {
        flex: 1,
        marginRight: 8,
    },
    shopName: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.neutral[800],
    },
    shopMeta: {
        marginTop: 2,
        fontSize: 12,
        color: COLORS.neutral[500],
    },
    mapButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 6,
        borderRadius: 8,
        backgroundColor: COLORS.primary[50],
        marginRight: 8,
    },
    mapButtonText: {
        marginLeft: 4,
        color: COLORS.primary[700],
        fontWeight: '600',
        fontSize: 12,
    },
    detailButton: {
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
        backgroundColor: COLORS.success + '20',
    },
    detailButtonText: {
        color: COLORS.success,
        fontWeight: '700',
        fontSize: 12,
    },
});

export default NearbyShopsMap;
