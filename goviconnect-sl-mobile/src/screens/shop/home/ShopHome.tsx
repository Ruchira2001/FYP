import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput, ScrollView, StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useShop } from '../../../context/ShopContext';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOW } from '../../../utils/constants';
import cropsData from '../../../data/crops.json';

const CATEGORIES = ['All', 'Vegetables', 'Fruits', 'Spices', 'Bulk Deals', 'Organic'];

const ShopHome: React.FC = () => {
    const navigation = useNavigation();
    const { logout } = useShop();
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');

    // Generate mock listings from crops data
    const listings = cropsData.crops.slice(0, 10).map((crop, index) => ({
        id: `listing-${index}`,
        crop,
        price: Math.floor(Math.random() * 200) + 50,
        quantity: Math.floor(Math.random() * 500) + 100, // Higher quantities for wholesale
        farmer: ['Green Valley Farms', 'Hill Country Co-op', 'Lanka Spices Ltd', 'Organic Roots'][index % 4], // Business names
        location: ['Kandy', 'Nuwara Eliya', 'Dambulla', 'Colombo'][index % 4],
        rating: (4 + Math.random()).toFixed(1),
        minOrder: Math.floor(Math.random() * 20) + 5, // Min order logic
    }));

    const renderHeader = () => (
        <View style={styles.header}>
            <View style={styles.headerTop}>
                <View>
                    <Text style={styles.greeting}>Good Morning,</Text>
                    <Text style={styles.username}>Colombo Shop</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <TouchableOpacity style={styles.notificationBtn}>
                        <Ionicons name="notifications-outline" size={24} color={COLORS.neutral[800]} />
                        <View style={styles.notificationBadge} />
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.notificationBtn, { marginLeft: 8 }]} onPress={logout}>
                        <Ionicons name="log-out-outline" size={24} color={COLORS.error} />
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color={COLORS.neutral[400]} style={styles.searchIcon} />
                <TextInput
                    placeholder="Search wholesale produce..."
                    placeholderTextColor={COLORS.neutral[400]}
                    style={styles.searchInput}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
                <TouchableOpacity style={styles.filterBtn}>
                    <Ionicons name="options-outline" size={20} color="#ffffff" />
                </TouchableOpacity>
            </View>

            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoriesContainer}
            >
                {CATEGORIES.map((cat, index) => (
                    <TouchableOpacity
                        key={index}
                        style={[
                            styles.categoryChip,
                            selectedCategory === cat && styles.categoryChipActive
                        ]}
                        onPress={() => setSelectedCategory(cat)}
                    >
                        <Text style={[
                            styles.categoryText,
                            selectedCategory === cat && styles.categoryTextActive
                        ]}>
                            {cat}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );

    const renderListing = ({ item }: { item: typeof listings[0] }) => (
        <TouchableOpacity style={styles.card} activeOpacity={0.9}>
            <View style={[styles.imagePlaceholder, { backgroundColor: item.crop.color + '20' }]}>
                <Text style={styles.cardIcon}>{item.crop.icon}</Text>
                <View style={styles.priceTag}>
                    <Text style={styles.priceText}>Rs. {item.price}/kg</Text>
                </View>
            </View>

            <View style={styles.cardContent}>
                <View style={styles.cardHeader}>
                    <Text style={styles.cropName} numberOfLines={1}>{item.crop.name}</Text>
                    <View style={styles.ratingContainer}>
                        <Ionicons name="star" size={12} color="#fbbf24" />
                        <Text style={styles.ratingText}>{item.rating}</Text>
                    </View>
                </View>

                <Text style={styles.farmerName} numberOfLines={1}>Supplier: {item.farmer}</Text>

                <View style={styles.locationRow}>
                    <Text style={styles.stockText} numberOfLines={1}>Min: {item.minOrder}kg • Stock: {item.quantity}kg</Text>
                </View>

                <View style={[styles.locationRow, { marginTop: 4 }]}>
                    <Ionicons name="location-outline" size={12} color={COLORS.neutral[400]} />
                    <Text style={styles.locationText}>{item.location}</Text>
                </View>
            </View>

            <TouchableOpacity style={styles.addBtn}>
                <Ionicons name="cart-outline" size={20} color="#ffffff" />
            </TouchableOpacity>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
            <FlatList
                data={listings}
                renderItem={renderListing}
                keyExtractor={item => item.id}
                numColumns={2}
                columnWrapperStyle={styles.columnWrapper}
                contentContainerStyle={styles.listContent}
                ListHeaderComponent={renderHeader}
                showsVerticalScrollIndicator={false}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fafafa',
    },
    header: {
        paddingHorizontal: 20,
        paddingTop: 10,
        backgroundColor: '#ffffff',
        paddingBottom: 20,
        marginBottom: 10,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        ...SHADOW.sm,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    greeting: {
        fontSize: 14,
        color: COLORS.neutral[500],
    },
    username: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.neutral[800],
    },
    notificationBtn: {
        padding: 8,
        position: 'relative',
    },
    notificationBadge: {
        position: 'absolute',
        top: 8,
        right: 8,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: COLORS.error,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    searchInput: {
        flex: 1,
        height: 48,
        backgroundColor: COLORS.neutral[50],
        borderRadius: 12,
        paddingHorizontal: 40,
        fontSize: 15,
        color: COLORS.neutral[800],
        borderWidth: 1,
        borderColor: COLORS.neutral[200],
    },
    searchIcon: {
        position: 'absolute',
        left: 12,
        zIndex: 1,
    },
    filterBtn: {
        width: 48,
        height: 48,
        backgroundColor: COLORS.info,
        borderRadius: 12,
        marginLeft: 12,
        alignItems: 'center',
        justifyContent: 'center',
        ...SHADOW.sm,
    },
    categoriesContainer: {
        paddingRight: 20,
    },
    categoryChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: COLORS.neutral[50],
        marginRight: 8,
        borderWidth: 1,
        borderColor: COLORS.neutral[200],
    },
    categoryChipActive: {
        backgroundColor: COLORS.info,
        borderColor: COLORS.info,
    },
    categoryText: {
        fontSize: 13,
        fontWeight: '600',
        color: COLORS.neutral[500],
    },
    categoryTextActive: {
        color: '#ffffff',
    },
    listContent: {
        paddingHorizontal: 12,
        paddingBottom: 20,
    },
    columnWrapper: {
        justifyContent: 'space-between',
        paddingHorizontal: 8,
    },
    card: {
        width: '48%',
        backgroundColor: '#ffffff',
        borderRadius: 16,
        marginBottom: 16,
        ...SHADOW.md,
        overflow: 'hidden',
    },
    imagePlaceholder: {
        height: 120,
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    cardIcon: {
        fontSize: 48,
    },
    priceTag: {
        position: 'absolute',
        bottom: 8,
        right: 8,
        backgroundColor: 'rgba(255,255,255,0.9)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    priceText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: COLORS.neutral[900],
    },
    cardContent: {
        padding: 12,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 4,
    },
    cropName: {
        fontSize: 15,
        fontWeight: 'bold',
        color: COLORS.neutral[800],
        flex: 1,
        marginRight: 4,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    ratingText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: COLORS.neutral[600],
        marginLeft: 2,
    },
    farmerName: {
        fontSize: 12,
        color: COLORS.neutral[500],
        marginBottom: 6,
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    locationText: {
        fontSize: 11,
        color: COLORS.neutral[400],
        marginLeft: 2,
        marginRight: 6,
    },
    stockText: {
        fontSize: 11,
        color: COLORS.success,
        fontWeight: '500',
    },
    addBtn: {
        position: 'absolute',
        bottom: 12,
        right: 12,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: COLORS.info, // Branding
        alignItems: 'center',
        justifyContent: 'center',
        ...SHADOW.sm,
    },
});

export default ShopHome;
