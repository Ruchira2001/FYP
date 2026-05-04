import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Modal, TextInput } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Header, PrimaryButton, AppNotify } from '../../../components';
import { COLORS, SHADOW } from '../../../utils/constants';
import { shopAPI } from '../../../services/api';
import { Product } from './ShopProducts';

const PRODUCT_CATEGORIES = ['Fungicides', 'Insecticides', 'Herbicides', 'Fertilizers', 'Bio Products'];
const PRODUCT_EMOJIS = ['🧪', '🌿', '🍃', '🌱', '💧', '🛡️', '🐛', '🧴', '⚗️', '🌾', '🍅', '🥔', '🌶️', '🥬', '🌻', '📦'];

const ShopProductDetail: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    const route = useRoute<any>();
    const routeProduct: Product | undefined = route.params?.product;
    const productId: string | undefined = route.params?.productId;
    const [product, setProduct] = useState<Product | null>(routeProduct || null);
    const [loadingProduct, setLoadingProduct] = useState(!routeProduct && !!productId);

    // Edit modal
    const [showEditModal, setShowEditModal] = useState(false);
    const [form, setForm] = useState({
        name: product?.name || '',
        category: product?.category || '',
        description: product?.description || '',
        emoji: product?.emoji || '🧪',
        price: String(product?.price || ''),
        unit: product?.unit || '',
        stock: String(product?.stock || 0),
        targetDisease: product?.targetDisease || '',
        targetCrops: (product?.targetCrops || []).join(', '),
        activeIngredient: product?.activeIngredient || '',
        dosage: product?.dosage || '',
        manufacturer: product?.manufacturer || '',
    });
    const [formLoading, setFormLoading] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [showCategoryPicker, setShowCategoryPicker] = useState(false);

    const mapProduct = (p: any): Product => {
        const stock = p.stock || 0;
        const availability: Product['availability'] =
            p.availability === 'In Stock' || p.availability === 'in_stock'
                ? 'in_stock'
                : p.availability === 'Low Stock' || p.availability === 'low_stock'
                    ? 'low_stock'
                    : p.availability === 'Out of Stock' || p.availability === 'out_of_stock'
                        ? 'out_of_stock'
                        : stock > 10 ? 'in_stock' : stock > 0 ? 'low_stock' : 'out_of_stock';

        return {
            id: p._id || p.id,
            name: p.name || '',
            nameSi: p.nameSi || '',
            category: p.category || '',
            description: p.description || '',
            targetDisease: p.targetDisease || '',
            targetCrops: Array.isArray(p.targetCrops) ? p.targetCrops : [],
            dosage: p.dosage || '',
            price: p.price || 0,
            unit: p.unit || '',
            emoji: p.emoji || 'ðŸ§ª',
            stock,
            availability,
            manufacturer: p.manufacturer || '',
            activeIngredient: p.activeIngredient || '',
        };
    };

    useEffect(() => {
        if (!productId || product) return;

        const loadProduct = async () => {
            try {
                setLoadingProduct(true);
                const res = await shopAPI.getProductById(productId);
                const nextProduct = mapProduct(res.data.data || res.data);
                setProduct(nextProduct);
                setForm({
                    name: nextProduct.name,
                    category: nextProduct.category,
                    description: nextProduct.description,
                    emoji: nextProduct.emoji,
                    price: String(nextProduct.price || ''),
                    unit: nextProduct.unit,
                    stock: String(nextProduct.stock || 0),
                    targetDisease: nextProduct.targetDisease,
                    targetCrops: nextProduct.targetCrops.join(', '),
                    activeIngredient: nextProduct.activeIngredient,
                    dosage: nextProduct.dosage,
                    manufacturer: nextProduct.manufacturer,
                });
            } catch {
                setProduct(null);
            } finally {
                setLoadingProduct(false);
            }
        };

        loadProduct();
    }, [productId, product]);

    if (loadingProduct) {
        return (
            <View style={styles.container}>
                <Header title="Product Details" showBack onBackPress={() => navigation.goBack()} />
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>Loading product...</Text>
                </View>
            </View>
        );
    }

    if (!product) {
        return (
            <View style={styles.container}>
                <Header title="Product Details" showBack onBackPress={() => navigation.goBack()} />
                <View style={styles.errorContainer}>
                    <Ionicons name="alert-circle-outline" size={64} color={COLORS.neutral[300]} />
                    <Text style={styles.errorText}>Product not found</Text>
                </View>
            </View>
        );
    }

    const getAvailabilityConfig = (availability: string) => {
        switch (availability) {
            case 'in_stock': return { label: 'In Stock', color: COLORS.success, bgColor: '#dcfce7', icon: 'checkmark-circle' as const };
            case 'low_stock': return { label: 'Low Stock', color: COLORS.warning, bgColor: '#fef3c7', icon: 'warning' as const };
            case 'out_of_stock': return { label: 'Out of Stock', color: COLORS.error, bgColor: '#fee2e2', icon: 'close-circle' as const };
            default: return { label: 'Unknown', color: COLORS.neutral[400], bgColor: COLORS.neutral[100], icon: 'help' as const };
        }
    };

    const availConfig = getAvailabilityConfig(product.availability);

    const handleEditSubmit = async () => {
        if (!form.name.trim()) { AppNotify.toast('Product name is required.', 'error'); return; }
        const priceNum = parseFloat(form.price);
        if (isNaN(priceNum) || priceNum < 0) { AppNotify.toast('Please enter a valid price.', 'error'); return; }
        const stockNum = parseInt(form.stock);
        if (isNaN(stockNum) || stockNum < 0) { AppNotify.toast('Please enter a valid stock quantity.', 'error'); return; }

        setFormLoading(true);
        try {
            await shopAPI.updateProduct(product.id, {
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
            });
            AppNotify.toast('Product updated successfully!', 'success');
            setShowEditModal(false);
            navigation.goBack();
        } catch (e: any) {
            AppNotify.toast(e?.response?.data?.message || 'Failed to update product.', 'error');
        } finally {
            setFormLoading(false);
        }
    };

    const handleDelete = () => {
        AppNotify.confirm(
            'Delete Product',
            `Delete "${product.name}"? This cannot be undone.`,
            async () => {
                try {
                    await shopAPI.deleteProduct(product.id);
                    AppNotify.toast('Product deleted.', 'success');
                    navigation.goBack();
                } catch (e: any) {
                    AppNotify.toast(e?.response?.data?.message || 'Failed to delete product.', 'error');
                }
            },
            { confirmLabel: 'Delete', destructive: true }
        );
    };

    const renderEditModal = () => (
        <Modal visible={showEditModal} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowEditModal(false)}>
            <View style={styles.modalContainer}>
                <View style={styles.modalHeader}>
                    <TouchableOpacity onPress={() => setShowEditModal(false)} style={styles.modalCloseBtn}>
                        <Ionicons name="close" size={24} color={COLORS.neutral[600]} />
                    </TouchableOpacity>
                    <Text style={styles.modalTitle}>Edit Product</Text>
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
                        <TextInput style={styles.formInput} placeholder="Product name" placeholderTextColor={COLORS.neutral[400]} value={form.name} onChangeText={text => setForm(prev => ({ ...prev, name: text }))} />
                    </View>

                    {/* Description */}
                    <View style={styles.formGroup}>
                        <Text style={styles.formLabel}>Description</Text>
                        <TextInput style={[styles.formInput, styles.formTextarea]} placeholder="Product description..." placeholderTextColor={COLORS.neutral[400]} value={form.description} onChangeText={text => setForm(prev => ({ ...prev, description: text }))} multiline numberOfLines={3} textAlignVertical="top" />
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
                        <TextInput style={styles.formInput} placeholder="e.g. Rice, Potato" placeholderTextColor={COLORS.neutral[400]} value={form.targetCrops} onChangeText={text => setForm(prev => ({ ...prev, targetCrops: text }))} />
                    </View>

                    {/* Active Ingredient */}
                    <View style={styles.formGroup}>
                        <Text style={styles.formLabel}>Active Ingredient</Text>
                        <TextInput style={styles.formInput} placeholder="e.g. Mancozeb 80%" placeholderTextColor={COLORS.neutral[400]} value={form.activeIngredient} onChangeText={text => setForm(prev => ({ ...prev, activeIngredient: text }))} />
                    </View>

                    {/* Dosage */}
                    <View style={styles.formGroup}>
                        <Text style={styles.formLabel}>Recommended Dosage</Text>
                        <TextInput style={styles.formInput} placeholder="e.g. 2g per liter" placeholderTextColor={COLORS.neutral[400]} value={form.dosage} onChangeText={text => setForm(prev => ({ ...prev, dosage: text }))} />
                    </View>

                    {/* Manufacturer */}
                    <View style={styles.formGroup}>
                        <Text style={styles.formLabel}>Manufacturer</Text>
                        <TextInput style={styles.formInput} placeholder="e.g. Syngenta" placeholderTextColor={COLORS.neutral[400]} value={form.manufacturer} onChangeText={text => setForm(prev => ({ ...prev, manufacturer: text }))} />
                    </View>

                    <View style={{ height: 16 }} />
                </ScrollView>

                <View style={styles.modalFooter}>
                    <PrimaryButton title={formLoading ? 'Saving...' : 'Save Changes'} onPress={handleEditSubmit} icon="save" fullWidth />
                </View>
            </View>
        </Modal>
    );

    return (
        <View style={styles.container}>
            <Header
                title="Product Details"
                showBack
                onBackPress={() => navigation.goBack()}
                rightContent={
                    <TouchableOpacity style={styles.editHeaderBtn} onPress={() => setShowEditModal(true)}>
                        <Ionicons name="pencil-outline" size={18} color={COLORS.primary[600]} />
                        <Text style={styles.editHeaderBtnText}>Edit</Text>
                    </TouchableOpacity>
                }
            />

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Hero */}
                <View style={styles.heroSection}>
                    <View style={[styles.heroIcon, { backgroundColor: COLORS.primary[50] }]}>
                        <Text style={styles.heroEmoji}>{product.emoji}</Text>
                    </View>
                    <View style={[styles.availabilityBadge, { backgroundColor: availConfig.bgColor }]}>
                        <Ionicons name={availConfig.icon} size={14} color={availConfig.color} />
                        <Text style={[styles.availabilityText, { color: availConfig.color }]}>{availConfig.label}</Text>
                    </View>
                    <Text style={styles.heroTitle}>{product.name}</Text>
                    <Text style={styles.heroCategory}>{product.category}</Text>
                </View>

                {/* Price & Stock */}
                <View style={styles.card}>
                    <View style={styles.priceRow}>
                        <View>
                            <Text style={styles.priceLabel}>Price</Text>
                            <Text style={styles.priceValue}>Rs. {(product.price ?? 0).toLocaleString()}</Text>
                            {!!product.unit && <Text style={styles.priceUnit}>per {product.unit}</Text>}
                        </View>
                        <View style={styles.stockSection}>
                            <Text style={styles.stockLabel}>Available Stock</Text>
                            <Text style={[styles.stockValue, { color: product.stock <= 0 ? COLORS.error : product.stock < 10 ? COLORS.warning : COLORS.success }]}>
                                {product.stock} units
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Description */}
                {!!product.description && (
                    <View style={styles.card}>
                        <Text style={styles.sectionTitle}>Description</Text>
                        <Text style={styles.descriptionText}>{product.description}</Text>
                    </View>
                )}

                {/* Target Info */}
                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Target Information</Text>
                    {!!product.targetDisease && (
                        <View style={styles.infoRow}>
                            <Ionicons name="bug-outline" size={18} color={COLORS.error} />
                            <View style={styles.infoContent}>
                                <Text style={styles.infoLabel}>Target Diseases / Pests</Text>
                                <Text style={styles.infoValue}>{product.targetDisease}</Text>
                            </View>
                        </View>
                    )}
                    {product.targetCrops.length > 0 && (
                        <View style={styles.infoRow}>
                            <Ionicons name="leaf-outline" size={18} color={COLORS.primary[600]} />
                            <View style={styles.infoContent}>
                                <Text style={styles.infoLabel}>Suitable Crops</Text>
                                <View style={styles.cropChips}>
                                    {product.targetCrops.map((crop, idx) => (
                                        <View key={idx} style={styles.cropChip}>
                                            <Text style={styles.cropChipText}>{crop}</Text>
                                        </View>
                                    ))}
                                </View>
                            </View>
                        </View>
                    )}
                    {!!product.activeIngredient && (
                        <View style={styles.infoRow}>
                            <Ionicons name="flask-outline" size={18} color={COLORS.info} />
                            <View style={styles.infoContent}>
                                <Text style={styles.infoLabel}>Active Ingredient</Text>
                                <Text style={styles.infoValue}>{product.activeIngredient}</Text>
                            </View>
                        </View>
                    )}
                    {!!product.dosage && (
                        <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
                            <Ionicons name="eyedrop-outline" size={18} color={COLORS.secondary[600]} />
                            <View style={styles.infoContent}>
                                <Text style={styles.infoLabel}>Recommended Dosage</Text>
                                <Text style={styles.infoValue}>{product.dosage}</Text>
                            </View>
                        </View>
                    )}
                </View>

                {/* Manufacturer */}
                {!!product.manufacturer && (
                    <View style={styles.card}>
                        <Text style={styles.sectionTitle}>Manufacturer</Text>
                        <View style={styles.manufacturerRow}>
                            <View style={styles.manufacturerIcon}>
                                <Ionicons name="business-outline" size={20} color={COLORS.primary[600]} />
                            </View>
                            <Text style={styles.manufacturerText}>{product.manufacturer}</Text>
                        </View>
                    </View>
                )}

                {/* Safety Notice */}
                <View style={[styles.card, { backgroundColor: '#fef3c7', borderColor: '#fde68a' }]}>
                    <View style={styles.safetyRow}>
                        <Ionicons name="warning" size={20} color={COLORS.warning} />
                        <Text style={styles.safetyTitle}>Safety Notice</Text>
                    </View>
                    <Text style={styles.safetyText}>
                        Always read the label before use. Wear protective equipment during application. Follow recommended dosage. Keep away from children and animals.
                    </Text>
                </View>

                <View style={{ height: 16 }} />
            </ScrollView>

            {/* Footer actions */}
            <View style={styles.footerActions}>
                <TouchableOpacity style={styles.editFooterBtn} onPress={() => setShowEditModal(true)}>
                    <Ionicons name="pencil-outline" size={18} color={COLORS.info} />
                    <Text style={styles.editFooterBtnText}>Edit Product</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.deleteFooterBtn} onPress={handleDelete}>
                    <Ionicons name="trash-outline" size={18} color={COLORS.error} />
                    <Text style={styles.deleteFooterBtnText}>Delete</Text>
                </TouchableOpacity>
            </View>

            {renderEditModal()}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.neutral[50] },
    scrollView: { flex: 1 },
    errorContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    errorText: { fontSize: 16, color: COLORS.neutral[400], marginTop: 12 },
    editHeaderBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.neutral[100], borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, gap: 4 },
    editHeaderBtnText: { fontSize: 13, fontWeight: '600', color: COLORS.primary[600] },
    // Hero
    heroSection: { alignItems: 'center', paddingVertical: 24, backgroundColor: '#fff', borderBottomLeftRadius: 24, borderBottomRightRadius: 24, marginBottom: 16, ...SHADOW.sm },
    heroIcon: { width: 96, height: 96, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
    heroEmoji: { fontSize: 48 },
    availabilityBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 50, marginBottom: 12, gap: 6 },
    availabilityText: { fontSize: 13, fontWeight: '600' },
    heroTitle: { fontSize: 22, fontWeight: '700', color: COLORS.neutral[800], textAlign: 'center', marginBottom: 4 },
    heroCategory: { fontSize: 15, color: COLORS.neutral[500] },
    // Card
    card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginHorizontal: 16, marginBottom: 12, borderWidth: 1, borderColor: COLORS.neutral[100], ...SHADOW.sm },
    sectionTitle: { fontSize: 16, fontWeight: '600', color: COLORS.neutral[800], marginBottom: 12 },
    // Price
    priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    priceLabel: { fontSize: 13, color: COLORS.neutral[500] },
    priceValue: { fontSize: 24, fontWeight: 'bold', color: COLORS.neutral[800] },
    priceUnit: { fontSize: 12, color: COLORS.neutral[400] },
    stockSection: { alignItems: 'flex-end' },
    stockLabel: { fontSize: 13, color: COLORS.neutral[500] },
    stockValue: { fontSize: 20, fontWeight: 'bold' },
    descriptionText: { fontSize: 14, color: COLORS.neutral[600], lineHeight: 22 },
    // Info
    infoRow: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: COLORS.neutral[100] },
    infoContent: { flex: 1, marginLeft: 12 },
    infoLabel: { fontSize: 13, color: COLORS.neutral[500], marginBottom: 4 },
    infoValue: { fontSize: 15, color: COLORS.neutral[800], fontWeight: '500' },
    cropChips: { flexDirection: 'row', flexWrap: 'wrap' },
    cropChip: { backgroundColor: COLORS.primary[50], paddingHorizontal: 10, paddingVertical: 4, borderRadius: 50, marginRight: 6, marginBottom: 4 },
    cropChipText: { fontSize: 12, color: COLORS.primary[700], fontWeight: '500' },
    // Manufacturer
    manufacturerRow: { flexDirection: 'row', alignItems: 'center' },
    manufacturerIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: COLORS.primary[50], alignItems: 'center', justifyContent: 'center', marginRight: 12 },
    manufacturerText: { fontSize: 15, fontWeight: '500', color: COLORS.neutral[800] },
    // Safety
    safetyRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
    safetyTitle: { fontSize: 15, fontWeight: '600', color: COLORS.warning, marginLeft: 8 },
    safetyText: { fontSize: 13, color: COLORS.neutral[700], lineHeight: 20 },
    // Footer actions
    footerActions: { flexDirection: 'row', gap: 12, padding: 16, borderTopWidth: 1, borderTopColor: COLORS.neutral[100], backgroundColor: '#fff' },
    editFooterBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#dbeafe', borderRadius: 12, paddingVertical: 13 },
    editFooterBtnText: { fontSize: 15, fontWeight: '700', color: COLORS.info },
    deleteFooterBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#fee2e2', borderRadius: 12, paddingVertical: 13, paddingHorizontal: 20 },
    deleteFooterBtnText: { fontSize: 15, fontWeight: '700', color: COLORS.error },
    // Modal
    modalContainer: { flex: 1, backgroundColor: '#fff' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: COLORS.neutral[100] },
    modalCloseBtn: { width: 40, alignItems: 'flex-start' },
    modalTitle: { fontSize: 17, fontWeight: '700', color: COLORS.neutral[800] },
    modalContent: { flex: 1, padding: 16 },
    modalFooter: { padding: 16, borderTopWidth: 1, borderTopColor: COLORS.neutral[100] },
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

export default ShopProductDetail;
