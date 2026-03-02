import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { Header, Chip } from '../../../components';
import { COLORS, SHADOW } from '../../../utils/constants';
import { shopAPI } from '../../../services/api';

const CATEGORIES = ['All', 'Fungicides', 'Insecticides', 'Herbicides', 'Fertilizers', 'Bio Products'];

export interface Product {
    id: string;
    name: string;
    nameSi: string;
    category: string;
    description: string;
    targetDisease: string;
    targetCrops: string[];
    dosage: string;
    price: number;
    unit: string;
    emoji: string;
    stock: number;
    availability: 'in_stock' | 'low_stock' | 'out_of_stock';
    manufacturer: string;
    activeIngredient: string;
}

const ShopProducts: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    const { t, i18n } = useTranslation();
    const [activeFilter, setActiveFilter] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [products, setProducts] = useState<Product[]>([]);

    useEffect(() => {
        loadProducts();
    }, []);

    const loadProducts = async () => {
        try {
            const res = await shopAPI.getProducts();
            const data = Array.isArray(res.data.data) ? res.data.data : [];
            setProducts(data.map((p: any) => ({
                id: p._id || p.id,
                name: p.name || '',
                nameSi: p.nameSi || '',
                category: p.category || '',
                description: p.description || '',
                targetDisease: p.targetDisease || '',
                targetCrops: p.targetCrops || [],
                dosage: p.dosage || '',
                price: p.price || 0,
                unit: p.unit || '',
                emoji: p.emoji || '🧪',
                stock: p.stock || 0,
                availability: p.availability || (p.stock > 10 ? 'in_stock' : p.stock > 0 ? 'low_stock' : 'out_of_stock'),
                manufacturer: p.manufacturer || '',
                activeIngredient: p.activeIngredient || '',
            })));
        } catch (e) {
            console.error('Failed to load products:', e);
        }
    };

    const filteredProducts = products.filter(p => {
        const matchesCategory = activeFilter === 'All' || p.category === activeFilter;
        const matchesSearch = !searchQuery ||
            p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.targetDisease.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.activeIngredient.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const getAvailabilityConfig = (availability: string) => {
        switch (availability) {
            case 'in_stock':
                return { label: 'In Stock', color: COLORS.success, bgColor: '#dcfce7', icon: 'checkmark-circle' as const };
            case 'low_stock':
                return { label: 'Low Stock', color: COLORS.warning, bgColor: '#fef3c7', icon: 'warning' as const };
            case 'out_of_stock':
                return { label: 'Out of Stock', color: COLORS.error, bgColor: '#fee2e2', icon: 'close-circle' as const };
            default:
                return { label: 'Unknown', color: COLORS.neutral[400], bgColor: COLORS.neutral[100], icon: 'help' as const };
        }
    };

    const renderProduct = ({ item }: { item: Product }) => {
        const availConfig = getAvailabilityConfig(item.availability);

        return (
            <TouchableOpacity
                style={styles.productCard}
                activeOpacity={0.7}
                onPress={() => navigation.navigate('ShopProductDetail', { product: item })}
            >
                {/* Header */}
                <View style={styles.cardHeader}>
                    <View style={[styles.categoryBadge, { backgroundColor: COLORS.primary[50] }]}>
                        <Text style={[styles.categoryText, { color: COLORS.primary[700] }]}>{item.category}</Text>
                    </View>
                    <View style={[styles.availabilityBadge, { backgroundColor: availConfig.bgColor }]}>
                        <Ionicons name={availConfig.icon} size={12} color={availConfig.color} />
                        <Text style={[styles.availabilityText, { color: availConfig.color }]}>{availConfig.label}</Text>
                    </View>
                </View>

                {/* Content */}
                <View style={styles.contentRow}>
                    <View style={[styles.productIconContainer, { backgroundColor: COLORS.primary[50] }]}>
                        <Text style={styles.productEmoji}>{item.emoji}</Text>
                    </View>
                    <View style={styles.productInfo}>
                        <Text style={styles.productName}>{item.name}</Text>
                        <Text style={styles.productTarget} numberOfLines={1}>
                            For: {item.targetDisease}
                        </Text>
                        <View style={styles.cropTags}>
                            {item.targetCrops.slice(0, 3).map((crop, idx) => (
                                <View key={idx} style={styles.cropTag}>
                                    <Text style={styles.cropTagText}>{crop}</Text>
                                </View>
                            ))}
                            {item.targetCrops.length > 3 && (
                                <Text style={styles.moreCrops}>+{item.targetCrops.length - 3}</Text>
                            )}
                        </View>
                    </View>
                </View>

                {/* Footer */}
                <View style={styles.cardFooter}>
                    <View>
                        <Text style={styles.priceText}>Rs. {(item.price ?? 0).toLocaleString()}</Text>
                        <Text style={styles.unitText}>{item.unit}</Text>
                    </View>
                    <View style={styles.stockInfo}>
                        <Text style={[styles.stockCount, { color: item.stock < 10 ? COLORS.error : COLORS.success }]}>
                            {item.stock} units
                        </Text>
                    </View>
                    <TouchableOpacity style={styles.viewButton}>
                        <Text style={styles.viewButtonText}>Details</Text>
                        <Ionicons name="arrow-forward" size={14} color={COLORS.primary[600]} />
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <Header
                title="Agricultural Products"
                showBack
                onBackPress={() => navigation.goBack()}
            />

            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color={COLORS.neutral[400]} style={styles.searchIcon} />
                <TextInput
                    placeholder="Search chemicals, diseases..."
                    placeholderTextColor={COLORS.neutral[400]}
                    style={styles.searchInput}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
                {searchQuery ? (
                    <TouchableOpacity onPress={() => setSearchQuery('')}>
                        <Ionicons name="close-circle" size={20} color={COLORS.neutral[400]} />
                    </TouchableOpacity>
                ) : null}
            </View>

            {/* Filters */}
            <View style={styles.filtersContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersContent}>
                    {CATEGORIES.map(cat => (
                        <Chip
                            key={cat}
                            label={cat}
                            selected={activeFilter === cat}
                            onPress={() => setActiveFilter(cat)}
                            variant="outline"
                            size="sm"
                            style={{ marginRight: 8 }}
                        />
                    ))}
                </ScrollView>
            </View>

            {/* Results count */}
            <View style={styles.resultsRow}>
                <Text style={styles.resultsText}>{filteredProducts.length} products found</Text>
            </View>

            {/* Products List */}
            <FlatList
                data={filteredProducts}
                renderItem={renderProduct}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.neutral[50],
    },
    // ===== Search =====
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 16,
        marginTop: 12,
        backgroundColor: '#ffffff',
        borderRadius: 12,
        paddingHorizontal: 14,
        borderWidth: 1,
        borderColor: COLORS.neutral[200],
    },
    searchIcon: {
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        height: 44,
        fontSize: 15,
        color: COLORS.neutral[800],
    },
    // ===== Filters =====
    filtersContainer: {
        paddingVertical: 12,
    },
    filtersContent: {
        paddingHorizontal: 16,
    },
    // ===== Results =====
    resultsRow: {
        paddingHorizontal: 16,
        marginBottom: 8,
    },
    resultsText: {
        fontSize: 13,
        color: COLORS.neutral[500],
        fontWeight: '500',
    },
    // ===== List =====
    listContent: {
        padding: 16,
        paddingTop: 0,
        paddingBottom: 24,
    },
    // ===== Product Card =====
    productCard: {
        backgroundColor: '#ffffff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: COLORS.neutral[100],
        ...SHADOW.sm,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    categoryBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 50,
    },
    categoryText: {
        fontSize: 12,
        fontWeight: '500',
    },
    availabilityBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 50,
    },
    availabilityText: {
        fontSize: 12,
        fontWeight: '500',
        marginLeft: 4,
    },
    // ===== Content =====
    contentRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    productIconContainer: {
        width: 52,
        height: 52,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    productEmoji: {
        fontSize: 28,
    },
    productInfo: {
        flex: 1,
    },
    productName: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.neutral[800],
        marginBottom: 4,
    },
    productTarget: {
        fontSize: 13,
        color: COLORS.neutral[500],
        marginBottom: 8,
    },
    cropTags: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
    },
    cropTag: {
        backgroundColor: COLORS.neutral[50],
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 50,
        marginRight: 6,
        marginBottom: 4,
    },
    cropTagText: {
        fontSize: 11,
        color: COLORS.neutral[600],
        fontWeight: '500',
    },
    moreCrops: {
        fontSize: 11,
        color: COLORS.primary[600],
        fontWeight: '500',
    },
    // ===== Footer =====
    cardFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: COLORS.neutral[100],
    },
    priceText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.neutral[800],
    },
    unitText: {
        fontSize: 11,
        color: COLORS.neutral[400],
    },
    stockInfo: {
        alignItems: 'center',
    },
    stockCount: {
        fontSize: 13,
        fontWeight: '600',
    },
    viewButton: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    viewButtonText: {
        fontSize: 13,
        fontWeight: '600',
        color: COLORS.primary[600],
        marginRight: 4,
    },
});

export default ShopProducts;
