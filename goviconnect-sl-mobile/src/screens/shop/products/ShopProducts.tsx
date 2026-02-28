import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { Header, Chip } from '../../../components';
import { COLORS, SHADOW } from '../../../utils/constants';

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

const PRODUCTS: Product[] = [
    {
        id: '1', name: 'Mancozeb 80% WP', nameSi: 'මැන්කොසෙබ් 80% WP',
        category: 'Fungicides', description: 'Broad-spectrum contact fungicide for control of many fungal diseases in a wide range of crops.',
        targetDisease: 'Leaf Blight, Downy Mildew, Late Blight',
        targetCrops: ['Tomato', 'Potato', 'Paddy', 'Vegetables'],
        dosage: '2.5g per liter of water', price: 450, unit: '500g pack',
        emoji: '🧪', stock: 45, availability: 'in_stock',
        manufacturer: 'CIC Agri Business', activeIngredient: 'Mancozeb',
    },
    {
        id: '2', name: 'Chlorpyrifos 20 EC', nameSi: 'ක්ලෝපිරිෆෝස් 20 EC',
        category: 'Insecticides', description: 'Organophosphorus insecticide effective against sucking and chewing insects.',
        targetDisease: 'Thrips, Aphids, Stem Borer, Leaf Miner',
        targetCrops: ['Paddy', 'Chili', 'Vegetables', 'Fruits'],
        dosage: '2ml per liter of water', price: 680, unit: '500ml bottle',
        emoji: '🐛', stock: 12, availability: 'low_stock',
        manufacturer: 'Hayleys Agriculture', activeIngredient: 'Chlorpyrifos',
    },
    {
        id: '3', name: 'Glyphosate 36 SL', nameSi: 'ග්ලයිෆොසේට් 36 SL',
        category: 'Herbicides', description: 'Non-selective systemic herbicide for weed control in plantation crops and non-crop areas.',
        targetDisease: 'Broadleaf Weeds, Grasses',
        targetCrops: ['Tea', 'Rubber', 'Coconut'],
        dosage: '10ml per liter of water', price: 750, unit: '1L bottle',
        emoji: '🌿', stock: 30, availability: 'in_stock',
        manufacturer: 'Lanka Phosphate', activeIngredient: 'Glyphosate',
    },
    {
        id: '4', name: 'NPK 15-15-15', nameSi: 'NPK 15-15-15',
        category: 'Fertilizers', description: 'Balanced compound fertilizer for general crop nutrition and healthy growth.',
        targetDisease: 'Nutrient Deficiency',
        targetCrops: ['All Crops'],
        dosage: '200g per plant (basal application)', price: 3200, unit: '50kg bag',
        emoji: '🪴', stock: 8, availability: 'low_stock',
        manufacturer: 'CIC Agri Business', activeIngredient: 'Nitrogen, Phosphorus, Potassium',
    },
    {
        id: '5', name: 'Carbendazim 50% WP', nameSi: 'කාබෙන්ඩසිම් 50% WP',
        category: 'Fungicides', description: 'Systemic fungicide for controlling a wide range of fungal diseases.',
        targetDisease: 'Powdery Mildew, Anthracnose, Scab',
        targetCrops: ['Mango', 'Chili', 'Paddy', 'Beans'],
        dosage: '1g per liter of water', price: 520, unit: '250g pack',
        emoji: '🔬', stock: 22, availability: 'in_stock',
        manufacturer: 'Hayleys Agriculture', activeIngredient: 'Carbendazim',
    },
    {
        id: '6', name: 'Imidacloprid 17.8 SL', nameSi: 'ඉමිඩැක්ලෝපිරිඩ් 17.8 SL',
        category: 'Insecticides', description: 'Neonicotinoid systemic insecticide for sucking pest control.',
        targetDisease: 'Brown Plant Hopper, Whitefly, Aphids',
        targetCrops: ['Paddy', 'Cotton', 'Vegetables'],
        dosage: '0.5ml per liter of water', price: 890, unit: '250ml bottle',
        emoji: '🦗', stock: 0, availability: 'out_of_stock',
        manufacturer: 'CIC Agri Business', activeIngredient: 'Imidacloprid',
    },
    {
        id: '7', name: 'Trichoderma Viride', nameSi: 'ට්‍රයිකොඩර්මා විරිඩේ',
        category: 'Bio Products', description: 'Biological fungicide containing Trichoderma viride for environmentally friendly disease management.',
        targetDisease: 'Root Rot, Wilt, Damping Off',
        targetCrops: ['Vegetables', 'Fruits', 'Nursery Plants'],
        dosage: '5g per liter of water (soil drench)', price: 380, unit: '100g pack',
        emoji: '🌱', stock: 35, availability: 'in_stock',
        manufacturer: 'Dept. of Agriculture', activeIngredient: 'Trichoderma viride',
    },
    {
        id: '8', name: 'Urea 46%', nameSi: 'යූරියා 46%',
        category: 'Fertilizers', description: 'High nitrogen fertilizer for promoting vegetative growth in crops.',
        targetDisease: 'Nitrogen Deficiency',
        targetCrops: ['Paddy', 'Vegetables', 'Tea'],
        dosage: '150g per plant (top dressing)', price: 2800, unit: '50kg bag',
        emoji: '💧', stock: 15, availability: 'in_stock',
        manufacturer: 'Lanka Phosphate', activeIngredient: 'Nitrogen (46%)',
    },
];

const ShopProducts: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    const { t, i18n } = useTranslation();
    const [activeFilter, setActiveFilter] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');

    const filteredProducts = PRODUCTS.filter(p => {
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
                        <Text style={styles.priceText}>Rs. {item.price.toLocaleString()}</Text>
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

export { PRODUCTS };
export default ShopProducts;
