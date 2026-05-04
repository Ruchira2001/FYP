import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
    View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput,
    ScrollView, Modal, Animated, ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Header, Chip, PrimaryButton, AppNotify } from '../../../components';
import { COLORS, SHADOW } from '../../../utils/constants';
import { shopAPI } from '../../../services/api';
import { connectSocket, getSocket } from '../../../services/socketService';

const FILTER_CATEGORIES = ['All', 'Fungicides', 'Insecticides', 'Herbicides', 'Fertilizers', 'Bio Products'];
const PRODUCT_CATEGORIES = ['Fungicides', 'Insecticides', 'Herbicides', 'Fertilizers', 'Bio Products'];
const PRODUCT_EMOJIS = ['🧪', '🌿', '🍃', '🌱', '💧', '🛡️', '🐛', '🧴', '⚗️', '🌾', '🍅', '🥔', '🌶️', '🥬', '🌻', '📦'];

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

const normalizeAvailability = (av: string, stock: number): 'in_stock' | 'low_stock' | 'out_of_stock' => {
    if (av === 'In Stock' || av === 'in_stock') return 'in_stock';
    if (av === 'Low Stock' || av === 'low_stock') return 'low_stock';
    if (av === 'Out of Stock' || av === 'out_of_stock') return 'out_of_stock';
    return stock > 10 ? 'in_stock' : stock > 0 ? 'low_stock' : 'out_of_stock';
};

const emptyForm = () => ({
    name: '',
    category: 'Fungicides',
    description: '',
    emoji: '🧪',
    price: '',
    unit: '',
    stock: '0',
    targetDisease: '',
    targetCrops: '',
    activeIngredient: '',
    dosage: '',
    manufacturer: '',
});

const ShopProducts: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();

    const [activeFilter, setActiveFilter] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(false);

    // Add / Edit form
    const [showFormModal, setShowFormModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [form, setForm] = useState(emptyForm());
    const [formLoading, setFormLoading] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [showCategoryPicker, setShowCategoryPicker] = useState(false);

    // Action sheet
    const [actionProduct, setActionProduct] = useState<Product | null>(null);
    const [showActionSheet, setShowActionSheet] = useState(false);
    const actionSheetAnim = useRef(new Animated.Value(300)).current;

    useFocusEffect(
        useCallback(() => {
            loadProducts();
        }, [])
    );

    useEffect(() => {
        let mounted = true;
        
        const refreshProducts = () => {
            if (mounted) loadProducts();
        };

        const subscribe = async () => {
            let s = getSocket() || await connectSocket();
            s?.on('dashboard_updated', refreshProducts);
        };
        
        subscribe();

        return () => {
            mounted = false;
            let s = getSocket();
            s?.off('dashboard_updated', refreshProducts);
        };
    }, []);

    const loadProducts = async () => {
        setLoading(true);
        try {
            const res = await shopAPI.getProducts();
            const data = Array.isArray(res.data.data) ? res.data.data : [];
            setProducts(data.map((p: any, index: number): Product => ({
                id: p._id || p.id || `product-${index}`,
                name: p.name || '',
                nameSi: p.nameSi || '',
                category: p.category || '',
                description: p.description || '',
                targetDisease: p.targetDisease || '',
                targetCrops: Array.isArray(p.targetCrops) ? p.targetCrops : [],
                dosage: p.dosage || '',
                price: p.price || 0,
                unit: p.unit || '',
                emoji: p.emoji || '🧪',
                stock: p.stock || 0,
                availability: normalizeAvailability(p.availability || '', p.stock || 0),
                manufacturer: p.manufacturer || '',
                activeIngredient: p.activeIngredient || '',
            })));
        } catch (e) {
            console.error('Failed to load products:', e);
        } finally {
            setLoading(false);
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

    const getAvailabilityConfig = (av: string) => {
        switch (av) {
            case 'in_stock': return { label: 'In Stock', color: COLORS.success, bgColor: '#dcfce7', icon: 'checkmark-circle' as const };
            case 'low_stock': return { label: 'Low Stock', color: COLORS.warning, bgColor: '#fef3c7', icon: 'warning' as const };
            case 'out_of_stock': return { label: 'Out of Stock', color: COLORS.error, bgColor: '#fee2e2', icon: 'close-circle' as const };
            default: return { label: 'Unknown', color: COLORS.neutral[400], bgColor: COLORS.neutral[100], icon: 'help' as const };
        }
    };

    // -- Form open ------------------------------------------------------------
    const openAddForm = () => {
        setEditingProduct(null);
        setForm(emptyForm());
        setShowEmojiPicker(false);
        setShowCategoryPicker(false);
        setShowFormModal(true);
    };

    const openEditForm = (p: Product) => {
        setEditingProduct(p);
        setForm({
            name: p.name,
            category: p.category,
            description: p.description,
            emoji: p.emoji,
            price: String(p.price),
            unit: p.unit,
            stock: String(p.stock),
            targetDisease: p.targetDisease,
            targetCrops: p.targetCrops.join(', '),
            activeIngredient: p.activeIngredient,
            dosage: p.dosage,
            manufacturer: p.manufacturer,
        });
        setShowEmojiPicker(false);
        setShowCategoryPicker(false);
        setShowFormModal(true);
    };

    // -- Form submit ----------------------------------------------------------
    const handleSubmitForm = async () => {
        if (!form.name.trim()) { AppNotify.toast('Product name is required.', 'error'); return; }
        if (!form.category) { AppNotify.toast('Please select a category.', 'error'); return; }
        const priceNum = parseFloat(form.price);
        if (isNaN(priceNum) || priceNum < 0) { AppNotify.toast('Please enter a valid price.', 'error'); return; }
        const stockNum = parseInt(form.stock);
        if (isNaN(stockNum) || stockNum < 0) { AppNotify.toast('Please enter a valid stock quantity.', 'error'); return; }

        setFormLoading(true);
        try {
            const payload = {
                name: form.name.trim(),
                category: form.category,
                description: form.description.trim(),
                emoji: form.emoji,
                price: priceNum,
                unit: form.unit.trim(),
                stock: stockNum,
                targetDisease: form.targetDisease.trim(),
                targetCrops: form.targetCrops.split(',').map(s => s.trim()).filter(Boolean),
                activeIngredient: form.activeIngredient.trim(),
                dosage: form.dosage.trim(),
                manufacturer: form.manufacturer.trim(),
            };
            if (editingProduct) {
                await shopAPI.updateProduct(editingProduct.id, payload);
                AppNotify.toast('Product updated successfully!', 'success');
            } else {
                await shopAPI.addProductData(payload);
                AppNotify.toast('Product added successfully!', 'success');
            }
            setShowFormModal(false);
            setEditingProduct(null);
            loadProducts();
        } catch (e: any) {
            AppNotify.toast(e?.response?.data?.message || 'Failed to save product.', 'error');
        } finally {
            setFormLoading(false);
        }
    };

    // -- Delete ---------------------------------------------------------------
    const handleDelete = (p: Product) => {
        closeActionSheet();
        setTimeout(() => {
            AppNotify.confirm(
                'Delete Product',
                `Delete "${p.name}"? This cannot be undone.`,
                async () => {
                    try {
                        await shopAPI.deleteProduct(p.id);
                        AppNotify.toast('Product deleted.', 'success');
                        loadProducts();
                    } catch (e: any) {
                        AppNotify.toast(e?.response?.data?.message || 'Failed to delete product.', 'error');
                    }
                },
                { confirmLabel: 'Delete', destructive: true }
            );
        }, 300);
    };

    // -- Action sheet ---------------------------------------------------------
    const openActionSheet = (p: Product) => {
        setActionProduct(p);
        setShowActionSheet(true);
        Animated.spring(actionSheetAnim, { toValue: 0, useNativeDriver: true, tension: 65, friction: 11 }).start();
    };
    const closeActionSheet = () => {
        Animated.timing(actionSheetAnim, { toValue: 300, useNativeDriver: true, duration: 220 }).start(() => {
            setShowActionSheet(false);
            setActionProduct(null);
        });
    };

    // -- Renders --------------------------------------------------------------
    const renderProductCard = ({ item }: { item: Product }) => {
        const availConfig = getAvailabilityConfig(item.availability);
        return (
            <TouchableOpacity
                style={styles.productCard}
                activeOpacity={0.7}
                onPress={() => navigation.navigate('ShopProductDetail', { product: item })}
            >
                <View style={styles.cardHeader}>
                    <View style={[styles.categoryBadge, { backgroundColor: COLORS.primary[50] }]}>
                        <Text style={[styles.categoryText, { color: COLORS.primary[700] }]}>{item.category}</Text>
                    </View>
                    <View style={styles.cardHeaderRight}>
                        <View style={[styles.availabilityBadge, { backgroundColor: availConfig.bgColor }]}>
                            <Ionicons name={availConfig.icon} size={12} color={availConfig.color} />
                            <Text style={[styles.availabilityText, { color: availConfig.color }]}>{availConfig.label}</Text>
                        </View>
                        <TouchableOpacity style={styles.moreBtn} onPress={() => openActionSheet(item)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                            <Ionicons name="ellipsis-vertical" size={18} color={COLORS.neutral[500]} />
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.contentRow}>
                    <View style={[styles.productIconContainer, { backgroundColor: COLORS.primary[50] }]}>
                        <Text style={styles.productEmoji}>{item.emoji}</Text>
                    </View>
                    <View style={styles.productInfo}>
                        <Text style={styles.productName}>{item.name}</Text>
                        {!!item.targetDisease && <Text style={styles.productTarget} numberOfLines={1}>For: {item.targetDisease}</Text>}
                        <View style={styles.cropTags}>
                            {item.targetCrops.slice(0, 3).map((crop, idx) => (
                                <View key={idx} style={styles.cropTag}>
                                    <Text style={styles.cropTagText}>{crop}</Text>
                                </View>
                            ))}
                            {item.targetCrops.length > 3 && <Text style={styles.moreCrops}>+{item.targetCrops.length - 3}</Text>}
                        </View>
                    </View>
                </View>

                <View style={styles.cardFooter}>
                    <View>
                        <Text style={styles.priceText}>Rs. {(item.price ?? 0).toLocaleString()}</Text>
                        {!!item.unit && <Text style={styles.unitText}>per {item.unit}</Text>}
                    </View>
                    <View style={styles.stockInfo}>
                        <Text style={[styles.stockCount, { color: item.stock <= 0 ? COLORS.error : item.stock < 10 ? COLORS.warning : COLORS.success }]}>
                            {item.stock}
                        </Text>
                        <Text style={styles.stockLabel}>units</Text>
                    </View>
                    <View style={styles.cardActions}>
                        <TouchableOpacity style={styles.editCardBtn} onPress={() => openEditForm(item)}>
                            <Ionicons name="pencil-outline" size={14} color={COLORS.info} />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.viewButton} onPress={() => navigation.navigate('ShopProductDetail', { product: item })}>
                            <Text style={styles.viewButtonText}>Details</Text>
                            <Ionicons name="arrow-forward" size={14} color={COLORS.primary[600]} />
                        </TouchableOpacity>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    const renderFormModal = () => (
        <Modal visible={showFormModal} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowFormModal(false)}>
            <View style={styles.modalContainer}>
                <View style={styles.modalHeader}>
                    <TouchableOpacity onPress={() => setShowFormModal(false)} style={styles.modalCloseBtn}>
                        <Ionicons name="close" size={24} color={COLORS.neutral[600]} />
                    </TouchableOpacity>
                    <Text style={styles.modalTitle}>{editingProduct ? 'Edit Product' : 'Add New Product'}</Text>
                    <View style={{ width: 40 }} />
                </View>

                <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                    {/* Emoji */}
                    <View style={styles.formGroup}>
                        <Text style={styles.formLabel}>Product Icon</Text>
                        <TouchableOpacity style={styles.emojiPickerBtn} onPress={() => setShowEmojiPicker(v => !v)}>
                            <Text style={styles.selectedEmoji}>{form.emoji}</Text>
                            <Text style={styles.emojiPickerBtnText}>Tap to change</Text>
                            <Ionicons name={showEmojiPicker ? 'chevron-up' : 'chevron-down'} size={16} color={COLORS.neutral[400]} />
                        </TouchableOpacity>
                        {showEmojiPicker && (
                            <View style={styles.emojiGrid}>
                                {PRODUCT_EMOJIS.map((em, index) => (
                                    <TouchableOpacity key={`${em}-${index}`} style={[styles.emojiCell, form.emoji === em && styles.emojiCellSelected]}
                                        onPress={() => { setForm(prev => ({ ...prev, emoji: em })); setShowEmojiPicker(false); }}>
                                        <Text style={styles.emojiCellText}>{em}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}
                    </View>

                    {/* Category */}
                    <View style={styles.formGroup}>
                        <Text style={styles.formLabel}>Category *</Text>
                        <TouchableOpacity style={styles.pickerBtn} onPress={() => setShowCategoryPicker(v => !v)}>
                            <Ionicons name="list-outline" size={18} color={COLORS.primary[500]} />
                            <Text style={styles.pickerBtnText}>{form.category}</Text>
                            <Ionicons name={showCategoryPicker ? 'chevron-up' : 'chevron-down'} size={16} color={COLORS.neutral[400]} />
                        </TouchableOpacity>
                        {showCategoryPicker && (
                            <View style={styles.pickerDropdown}>
                                {PRODUCT_CATEGORIES.map(cat => (
                                    <TouchableOpacity key={cat} style={[styles.pickerOption, form.category === cat && styles.pickerOptionSelected]}
                                        onPress={() => { setForm(prev => ({ ...prev, category: cat })); setShowCategoryPicker(false); }}>
                                        <Text style={[styles.pickerOptionText, form.category === cat && styles.pickerOptionTextSelected]}>{cat}</Text>
                                        {form.category === cat && <Ionicons name="checkmark" size={16} color={COLORS.primary[600]} />}
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}
                    </View>

                    {/* Name */}
                    <View style={styles.formGroup}>
                        <Text style={styles.formLabel}>Product Name *</Text>
                        <TextInput style={styles.formInput} placeholder="e.g. Mancozeb 80 WP" placeholderTextColor={COLORS.neutral[400]} value={form.name} onChangeText={text => setForm(prev => ({ ...prev, name: text }))} />
                    </View>

                    {/* Description */}
                    <View style={styles.formGroup}>
                        <Text style={styles.formLabel}>Description</Text>
                        <TextInput style={[styles.formInput, styles.formTextarea]} placeholder="Describe the product and its uses..." placeholderTextColor={COLORS.neutral[400]} value={form.description} onChangeText={text => setForm(prev => ({ ...prev, description: text }))} multiline numberOfLines={3} textAlignVertical="top" />
                    </View>

                    {/* Price & Unit */}
                    <View style={styles.formRow}>
                        <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
                            <Text style={styles.formLabel}>Price (Rs.) *</Text>
                            <TextInput style={styles.formInput} placeholder="0.00" placeholderTextColor={COLORS.neutral[400]} value={form.price} onChangeText={text => setForm(prev => ({ ...prev, price: text }))} keyboardType="decimal-pad" />
                        </View>
                        <View style={[styles.formGroup, { flex: 1 }]}>
                            <Text style={styles.formLabel}>Unit</Text>
                            <TextInput style={styles.formInput} placeholder="e.g. 1kg" placeholderTextColor={COLORS.neutral[400]} value={form.unit} onChangeText={text => setForm(prev => ({ ...prev, unit: text }))} />
                        </View>
                    </View>

                    {/* Stock */}
                    <View style={styles.formGroup}>
                        <Text style={styles.formLabel}>Stock Quantity *</Text>
                        <TextInput style={styles.formInput} placeholder="0" placeholderTextColor={COLORS.neutral[400]} value={form.stock} onChangeText={text => setForm(prev => ({ ...prev, stock: text }))} keyboardType="number-pad" />
                    </View>

                    {/* Target Disease */}
                    <View style={styles.formGroup}>
                        <Text style={styles.formLabel}>Target Disease / Pest</Text>
                        <TextInput style={styles.formInput} placeholder="e.g. Blight, Aphids" placeholderTextColor={COLORS.neutral[400]} value={form.targetDisease} onChangeText={text => setForm(prev => ({ ...prev, targetDisease: text }))} />
                    </View>

                    {/* Target Crops */}
                    <View style={styles.formGroup}>
                        <Text style={styles.formLabel}>Target Crops (comma separated)</Text>
                        <TextInput style={styles.formInput} placeholder="e.g. Rice, Potato, Tomato" placeholderTextColor={COLORS.neutral[400]} value={form.targetCrops} onChangeText={text => setForm(prev => ({ ...prev, targetCrops: text }))} />
                    </View>

                    {/* Active Ingredient */}
                    <View style={styles.formGroup}>
                        <Text style={styles.formLabel}>Active Ingredient</Text>
                        <TextInput style={styles.formInput} placeholder="e.g. Mancozeb 80%" placeholderTextColor={COLORS.neutral[400]} value={form.activeIngredient} onChangeText={text => setForm(prev => ({ ...prev, activeIngredient: text }))} />
                    </View>

                    {/* Dosage */}
                    <View style={styles.formGroup}>
                        <Text style={styles.formLabel}>Recommended Dosage</Text>
                        <TextInput style={styles.formInput} placeholder="e.g. 2g per liter of water" placeholderTextColor={COLORS.neutral[400]} value={form.dosage} onChangeText={text => setForm(prev => ({ ...prev, dosage: text }))} />
                    </View>

                    {/* Manufacturer */}
                    <View style={styles.formGroup}>
                        <Text style={styles.formLabel}>Manufacturer</Text>
                        <TextInput style={styles.formInput} placeholder="e.g. Syngenta" placeholderTextColor={COLORS.neutral[400]} value={form.manufacturer} onChangeText={text => setForm(prev => ({ ...prev, manufacturer: text }))} />
                    </View>

                    <View style={{ height: 16 }} />
                </ScrollView>

                <View style={styles.modalFooter}>
                    <PrimaryButton
                        title={formLoading ? 'Saving...' : (editingProduct ? 'Save Changes' : 'Add Product')}
                        onPress={handleSubmitForm}
                        icon={editingProduct ? 'save' : 'add-circle'}
                        fullWidth
                    />
                </View>
            </View>
        </Modal>
    );

    const renderActionSheet = () => (
        <Modal visible={showActionSheet} transparent animationType="none" onRequestClose={closeActionSheet}>
            <TouchableOpacity style={styles.actionSheetOverlay} activeOpacity={1} onPress={closeActionSheet} />
            <Animated.View style={[styles.actionSheet, { transform: [{ translateY: actionSheetAnim }] }]}>
                <View style={styles.actionSheetHandle} />
                {actionProduct && <Text style={styles.actionSheetTitle} numberOfLines={1}>{actionProduct.name}</Text>}

                <TouchableOpacity style={styles.actionSheetItem} onPress={() => { closeActionSheet(); if (actionProduct) setTimeout(() => navigation.navigate('ShopProductDetail', { product: actionProduct }), 300); }}>
                    <View style={[styles.actionSheetIcon, { backgroundColor: COLORS.primary[50] }]}><Ionicons name="eye-outline" size={20} color={COLORS.primary[600]} /></View>
                    <Text style={styles.actionSheetLabel}>View Details</Text>
                    <Ionicons name="chevron-forward" size={18} color={COLORS.neutral[300]} />
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionSheetItem} onPress={() => { closeActionSheet(); if (actionProduct) setTimeout(() => openEditForm(actionProduct), 300); }}>
                    <View style={[styles.actionSheetIcon, { backgroundColor: '#dbeafe' }]}><Ionicons name="pencil-outline" size={20} color={COLORS.info} /></View>
                    <Text style={styles.actionSheetLabel}>Edit Product</Text>
                    <Ionicons name="chevron-forward" size={18} color={COLORS.neutral[300]} />
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionSheetItem} onPress={() => actionProduct && handleDelete(actionProduct)}>
                    <View style={[styles.actionSheetIcon, { backgroundColor: '#fee2e2' }]}><Ionicons name="trash-outline" size={20} color={COLORS.error} /></View>
                    <Text style={[styles.actionSheetLabel, { color: COLORS.error }]}>Delete Product</Text>
                    <Ionicons name="chevron-forward" size={18} color={COLORS.neutral[300]} />
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionSheetCancel} onPress={closeActionSheet}>
                    <Text style={styles.actionSheetCancelText}>Cancel</Text>
                </TouchableOpacity>
            </Animated.View>
        </Modal>
    );

    return (
        <View style={styles.container}>
            <Header
                title="My Products"
                showBack
                onBackPress={() => navigation.goBack()}
                rightContent={
                    <TouchableOpacity style={styles.addButton} onPress={openAddForm}>
                        <Ionicons name="add" size={22} color="#ffffff" />
                    </TouchableOpacity>
                }
            />

            <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color={COLORS.neutral[400]} style={styles.searchIcon} />
                <TextInput placeholder="Search products, diseases..." placeholderTextColor={COLORS.neutral[400]} style={styles.searchInput} value={searchQuery} onChangeText={setSearchQuery} />
                {!!searchQuery && <TouchableOpacity onPress={() => setSearchQuery('')}><Ionicons name="close-circle" size={20} color={COLORS.neutral[400]} /></TouchableOpacity>}
            </View>

            <View style={styles.filtersContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersContent}>
                    {FILTER_CATEGORIES.map(cat => (
                        <Chip key={cat} label={cat} selected={activeFilter === cat} onPress={() => setActiveFilter(cat)} variant="outline" size="sm" style={{ marginRight: 8 }} />
                    ))}
                </ScrollView>
            </View>

            <View style={styles.resultsRow}>
                <Text style={styles.resultsText}>{filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} found</Text>
                {loading && <ActivityIndicator size="small" color={COLORS.primary[500]} />}
            </View>

            <FlatList
                data={filteredProducts}
                renderItem={renderProductCard}
                keyExtractor={(item, index) => item.id || `${item.name}-${index}`}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    !loading ? (
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyEmoji}>??</Text>
                            <Text style={styles.emptyTitle}>No products yet</Text>
                            <Text style={styles.emptyText}>Tap the + button to add your first product</Text>
                            <TouchableOpacity style={styles.emptyAddBtn} onPress={openAddForm}>
                                <Ionicons name="add-circle-outline" size={18} color="#fff" />
                                <Text style={styles.emptyAddBtnText}>Add Product</Text>
                            </TouchableOpacity>
                        </View>
                    ) : null
                }
            />

            {renderFormModal()}
            {renderActionSheet()}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.neutral[50] },
    addButton: { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.primary[600], alignItems: 'center', justifyContent: 'center', ...SHADOW.sm },
    searchContainer: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, marginTop: 12, backgroundColor: '#fff', borderRadius: 12, paddingHorizontal: 14, borderWidth: 1, borderColor: COLORS.neutral[200] },
    searchIcon: { marginRight: 10 },
    searchInput: { flex: 1, height: 44, fontSize: 15, color: COLORS.neutral[800] },
    filtersContainer: { paddingVertical: 12 },
    filtersContent: { paddingHorizontal: 16 },
    resultsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, marginBottom: 8 },
    resultsText: { fontSize: 13, color: COLORS.neutral[500], fontWeight: '500' },
    listContent: { padding: 16, paddingTop: 0, paddingBottom: 32 },
    // Product card
    productCard: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: COLORS.neutral[100], ...SHADOW.sm },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    cardHeaderRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    categoryBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 50 },
    categoryText: { fontSize: 12, fontWeight: '500' },
    availabilityBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 50, gap: 4 },
    availabilityText: { fontSize: 12, fontWeight: '500' },
    moreBtn: { padding: 2 },
    contentRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
    productIconContainer: { width: 56, height: 56, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
    productEmoji: { fontSize: 28 },
    productInfo: { flex: 1 },
    productName: { fontSize: 16, fontWeight: '700', color: COLORS.neutral[800], marginBottom: 4 },
    productTarget: { fontSize: 13, color: COLORS.neutral[500], marginBottom: 6 },
    cropTags: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
    cropTag: { backgroundColor: COLORS.primary[50], paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
    cropTagText: { fontSize: 11, color: COLORS.primary[700], fontWeight: '500' },
    moreCrops: { fontSize: 12, color: COLORS.neutral[400], alignSelf: 'center' },
    cardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: COLORS.neutral[100], paddingTop: 10 },
    priceText: { fontSize: 16, fontWeight: '700', color: COLORS.neutral[800] },
    unitText: { fontSize: 11, color: COLORS.neutral[400] },
    stockInfo: { alignItems: 'center' },
    stockCount: { fontSize: 16, fontWeight: '700' },
    stockLabel: { fontSize: 10, color: COLORS.neutral[400] },
    cardActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    editCardBtn: { width: 34, height: 34, borderRadius: 10, backgroundColor: '#dbeafe', alignItems: 'center', justifyContent: 'center' },
    viewButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.primary[50], paddingHorizontal: 12, paddingVertical: 7, borderRadius: 8, gap: 4 },
    viewButtonText: { fontSize: 13, color: COLORS.primary[600], fontWeight: '600' },
    // Empty state
    emptyContainer: { alignItems: 'center', paddingTop: 48, paddingHorizontal: 32 },
    emptyEmoji: { fontSize: 48, marginBottom: 12 },
    emptyTitle: { fontSize: 18, fontWeight: '700', color: COLORS.neutral[700], marginBottom: 6 },
    emptyText: { fontSize: 14, color: COLORS.neutral[400], textAlign: 'center', marginBottom: 20 },
    emptyAddBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: COLORS.primary[600], paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12, ...SHADOW.sm },
    emptyAddBtnText: { fontSize: 14, fontWeight: '700', color: '#fff' },
    // Action sheet
    actionSheetOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)' },
    actionSheet: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingBottom: 32, paddingTop: 12, paddingHorizontal: 16, ...SHADOW.md },
    actionSheetHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: COLORS.neutral[200], alignSelf: 'center', marginBottom: 14 },
    actionSheetTitle: { fontSize: 14, fontWeight: '700', color: COLORS.neutral[700], marginBottom: 12, paddingHorizontal: 4 },
    actionSheetItem: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 12, borderRadius: 12 },
    actionSheetIcon: { width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    actionSheetLabel: { flex: 1, fontSize: 15, fontWeight: '500', color: COLORS.neutral[800] },
    actionSheetCancel: { marginTop: 8, paddingVertical: 14, borderRadius: 14, backgroundColor: COLORS.neutral[100], alignItems: 'center' },
    actionSheetCancelText: { fontSize: 15, fontWeight: '700', color: COLORS.neutral[600] },
    // Modal shared
    modalContainer: { flex: 1, backgroundColor: '#fff' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: COLORS.neutral[100] },
    modalCloseBtn: { width: 40, alignItems: 'flex-start' },
    modalTitle: { fontSize: 17, fontWeight: '700', color: COLORS.neutral[800] },
    modalContent: { flex: 1, padding: 16 },
    modalFooter: { padding: 16, borderTopWidth: 1, borderTopColor: COLORS.neutral[100] },
    // Form
    formGroup: { marginBottom: 18 },
    formRow: { flexDirection: 'row' },
    formLabel: { fontSize: 12, fontWeight: '700', color: COLORS.neutral[500], letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 8 },
    formInput: { backgroundColor: COLORS.neutral[50], borderRadius: 12, padding: 14, fontSize: 14, color: COLORS.neutral[800], borderWidth: 1, borderColor: COLORS.neutral[200] },
    formTextarea: { minHeight: 80 },
    emojiPickerBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.neutral[50], borderRadius: 12, padding: 14, borderWidth: 1, borderColor: COLORS.neutral[200], gap: 10 },
    selectedEmoji: { fontSize: 28 },
    emojiPickerBtnText: { flex: 1, fontSize: 14, color: COLORS.neutral[500] },
    emojiGrid: { marginTop: 8, flexDirection: 'row', flexWrap: 'wrap', backgroundColor: COLORS.neutral[50], borderRadius: 12, padding: 8, borderWidth: 1, borderColor: COLORS.neutral[200] },
    emojiCell: { width: '12.5%', aspectRatio: 1, alignItems: 'center', justifyContent: 'center', borderRadius: 8 },
    emojiCellSelected: { backgroundColor: COLORS.primary[100] },
    emojiCellText: { fontSize: 22 },
    pickerBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.neutral[50], borderRadius: 12, padding: 14, borderWidth: 1, borderColor: COLORS.neutral[200], gap: 8 },
    pickerBtnText: { flex: 1, fontSize: 14, color: COLORS.neutral[800] },
    pickerDropdown: { marginTop: 4, backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: COLORS.neutral[200], overflow: 'hidden' },
    pickerOption: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: COLORS.neutral[100] },
    pickerOptionSelected: { backgroundColor: COLORS.primary[50] },
    pickerOptionText: { fontSize: 14, color: COLORS.neutral[700] },
    pickerOptionTextSelected: { color: COLORS.primary[600], fontWeight: '600' },
});

export default ShopProducts;
