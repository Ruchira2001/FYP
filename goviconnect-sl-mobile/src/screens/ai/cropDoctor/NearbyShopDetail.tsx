import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Linking,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '../../../components';
import { shopAPI } from '../../../services/api';
import { COLORS } from '../../../utils/constants';

const NearbyShopDetail: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    const route = useRoute<any>();
    const shopId: string = route.params?.shopId;
    const userLocation = route.params?.userLocation;

    const [loading, setLoading] = useState(true);
    const [shop, setShop] = useState<any>(null);

    useEffect(() => {
        const load = async () => {
            try {
                const lat = userLocation?.latitude;
                const lng = userLocation?.longitude;

                if (typeof lat !== 'number' || typeof lng !== 'number') {
                    setShop(null);
                    return;
                }

                const res = await shopAPI.getNearbyShopDetails(shopId, { lat, lng });
                setShop(res.data?.data || null);
            } catch (e) {
                console.error('Failed to load shop details:', e);
                setShop(null);
            } finally {
                setLoading(false);
            }
        };

        load();
    }, [shopId, userLocation?.latitude, userLocation?.longitude]);

    const openPhone = () => {
        if (!shop?.phone) return;
        Linking.openURL(`tel:${shop.phone}`).catch(() => {});
    };

    const openMaps = () => {
        if (typeof shop?.latitude !== 'number' || typeof shop?.longitude !== 'number') return;
        const query = `${shop.latitude},${shop.longitude}`;
        Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${query}`).catch(() => {});
    };

    if (loading) {
        return (
            <View style={styles.container}>
                <Header title="Shop Details" showBack onBackPress={() => navigation.goBack()} />
                <View style={styles.loadingWrap}>
                    <ActivityIndicator size="large" color={COLORS.primary[600]} />
                    <Text style={styles.loadingText}>Loading shop details...</Text>
                </View>
            </View>
        );
    }

    if (!shop) {
        return (
            <View style={styles.container}>
                <Header title="Shop Details" showBack onBackPress={() => navigation.goBack()} />
                <View style={styles.loadingWrap}>
                    <Ionicons name="alert-circle-outline" size={40} color={COLORS.warning} />
                    <Text style={styles.loadingText}>Shop details are unavailable right now.</Text>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Header title={shop.name || 'Shop Details'} showBack onBackPress={() => navigation.goBack()} />

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.card}>
                    <Text style={styles.shopName}>{shop.name}</Text>
                    <Text style={styles.metaText}>{shop.type || 'Agro Shop'}</Text>
                    <Text style={styles.metaText}>{shop.location || 'Sri Lanka'}</Text>
                    {shop.address ? <Text style={styles.metaText}>{shop.address}</Text> : null}
                    <Text style={styles.distanceText}>{shop.distanceKm} km away</Text>
                    {shop.coordinatesApproximated ? (
                        <Text style={styles.approxText}>Location is approximate based on district center.</Text>
                    ) : null}
                </View>

                <View style={styles.actionsRow}>
                    <TouchableOpacity style={styles.actionButton} onPress={openMaps}>
                        <Ionicons name="navigate-outline" size={16} color={COLORS.primary[700]} />
                        <Text style={styles.actionText}>Directions</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionButton} onPress={openPhone} disabled={!shop.phone}>
                        <Ionicons name="call-outline" size={16} color={COLORS.primary[700]} />
                        <Text style={styles.actionText}>{shop.phone ? 'Call Shop' : 'No Phone'}</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Available Chemicals & Products</Text>
                    {Array.isArray(shop.products) && shop.products.length > 0 ? (
                        shop.products.map((product: any) => (
                            <View key={product._id || product.id || product.name} style={styles.productRow}>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.productName}>{product.name}</Text>
                                    <Text style={styles.productMeta}>{product.category || 'General'}</Text>
                                    {product.activeIngredient ? (
                                        <Text style={styles.productMeta}>Active: {product.activeIngredient}</Text>
                                    ) : null}
                                    {product.targetDisease ? (
                                        <Text style={styles.productMeta}>Target: {product.targetDisease}</Text>
                                    ) : null}
                                </View>
                                <View style={styles.priceWrap}>
                                    <Text style={styles.priceText}>Rs {Number(product.price || 0).toFixed(2)}</Text>
                                    <Text style={styles.stockText}>{product.stock || 0} in stock</Text>
                                </View>
                            </View>
                        ))
                    ) : (
                        <Text style={styles.emptyText}>No in-stock products found for this shop.</Text>
                    )}
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.neutral[50],
    },
    loadingWrap: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 20,
    },
    loadingText: {
        marginTop: 8,
        color: COLORS.neutral[500],
        textAlign: 'center',
    },
    content: {
        padding: 16,
        paddingBottom: 24,
    },
    card: {
        backgroundColor: '#ffffff',
        borderRadius: 14,
        borderWidth: 1,
        borderColor: COLORS.neutral[100],
        padding: 14,
        marginBottom: 12,
    },
    shopName: {
        fontSize: 20,
        fontWeight: '800',
        color: COLORS.neutral[800],
    },
    metaText: {
        marginTop: 3,
        color: COLORS.neutral[500],
    },
    distanceText: {
        marginTop: 8,
        color: COLORS.primary[700],
        fontWeight: '700',
    },
    approxText: {
        marginTop: 4,
        color: COLORS.warning,
        fontSize: 12,
    },
    actionsRow: {
        flexDirection: 'row',
        marginBottom: 12,
    },
    actionButton: {
        flex: 1,
        marginRight: 8,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.primary[50],
        borderRadius: 10,
        paddingVertical: 10,
    },
    actionText: {
        marginLeft: 6,
        color: COLORS.primary[700],
        fontWeight: '700',
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.neutral[800],
        marginBottom: 8,
    },
    productRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        borderTopWidth: 1,
        borderTopColor: COLORS.neutral[100],
    },
    productName: {
        fontWeight: '700',
        color: COLORS.neutral[700],
    },
    productMeta: {
        marginTop: 2,
        color: COLORS.neutral[500],
        fontSize: 12,
    },
    priceWrap: {
        alignItems: 'flex-end',
        marginLeft: 10,
    },
    priceText: {
        color: COLORS.success,
        fontWeight: '800',
        fontSize: 13,
    },
    stockText: {
        marginTop: 2,
        fontSize: 11,
        color: COLORS.neutral[500],
    },
    emptyText: {
        color: COLORS.neutral[500],
    },
});

export default NearbyShopDetail;
