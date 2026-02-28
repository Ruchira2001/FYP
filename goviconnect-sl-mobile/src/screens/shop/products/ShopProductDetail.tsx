import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '../../../components';
import { COLORS, SHADOW } from '../../../utils/constants';
import { Product } from './ShopProducts';

const ShopProductDetail: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    const route = useRoute<any>();
    const product: Product = route.params?.product;

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

    const availConfig = getAvailabilityConfig(product.availability);

    return (
        <View style={styles.container}>
            <Header
                title="Product Details"
                showBack
                onBackPress={() => navigation.goBack()}
            />

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Product Hero */}
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

                {/* Price & Stock Card */}
                <View style={styles.card}>
                    <View style={styles.priceRow}>
                        <View>
                            <Text style={styles.priceLabel}>Price</Text>
                            <Text style={styles.priceValue}>Rs. {product.price.toLocaleString()}</Text>
                            <Text style={styles.priceUnit}>per {product.unit}</Text>
                        </View>
                        <View style={styles.stockSection}>
                            <Text style={styles.stockLabel}>Available Stock</Text>
                            <Text style={[
                                styles.stockValue,
                                { color: product.stock < 10 ? COLORS.error : COLORS.success }
                            ]}>
                                {product.stock} units
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Description */}
                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Description</Text>
                    <Text style={styles.descriptionText}>{product.description}</Text>
                </View>

                {/* Target Info */}
                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Target Information</Text>

                    <View style={styles.infoRow}>
                        <Ionicons name="bug-outline" size={18} color={COLORS.error} />
                        <View style={styles.infoContent}>
                            <Text style={styles.infoLabel}>Target Diseases / Pests</Text>
                            <Text style={styles.infoValue}>{product.targetDisease}</Text>
                        </View>
                    </View>

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

                    <View style={styles.infoRow}>
                        <Ionicons name="flask-outline" size={18} color={COLORS.info} />
                        <View style={styles.infoContent}>
                            <Text style={styles.infoLabel}>Active Ingredient</Text>
                            <Text style={styles.infoValue}>{product.activeIngredient}</Text>
                        </View>
                    </View>

                    <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
                        <Ionicons name="eyedrop-outline" size={18} color={COLORS.secondary[600]} />
                        <View style={styles.infoContent}>
                            <Text style={styles.infoLabel}>Recommended Dosage</Text>
                            <Text style={styles.infoValue}>{product.dosage}</Text>
                        </View>
                    </View>
                </View>

                {/* Manufacturer */}
                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Manufacturer</Text>
                    <View style={styles.manufacturerRow}>
                        <View style={styles.manufacturerIcon}>
                            <Ionicons name="business-outline" size={20} color={COLORS.primary[600]} />
                        </View>
                        <Text style={styles.manufacturerText}>{product.manufacturer}</Text>
                    </View>
                </View>

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

                <View style={{ height: 32 }} />
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.neutral[50],
    },
    scrollView: {
        flex: 1,
    },
    errorContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    errorText: {
        fontSize: 16,
        color: COLORS.neutral[400],
        marginTop: 12,
    },
    // ===== Hero =====
    heroSection: {
        alignItems: 'center',
        paddingVertical: 24,
        backgroundColor: '#ffffff',
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        marginBottom: 16,
        ...SHADOW.sm,
    },
    heroIcon: {
        width: 96,
        height: 96,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    heroEmoji: {
        fontSize: 48,
    },
    availabilityBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 50,
        marginBottom: 12,
    },
    availabilityText: {
        fontSize: 13,
        fontWeight: '600',
        marginLeft: 6,
    },
    heroTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: COLORS.neutral[800],
        textAlign: 'center',
        marginBottom: 4,
    },
    heroCategory: {
        fontSize: 15,
        color: COLORS.neutral[500],
    },
    // ===== Card =====
    card: {
        backgroundColor: '#ffffff',
        borderRadius: 16,
        padding: 16,
        marginHorizontal: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: COLORS.neutral[100],
        ...SHADOW.sm,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.neutral[800],
        marginBottom: 12,
    },
    // ===== Price =====
    priceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    priceLabel: {
        fontSize: 13,
        color: COLORS.neutral[500],
    },
    priceValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.neutral[800],
    },
    priceUnit: {
        fontSize: 12,
        color: COLORS.neutral[400],
    },
    stockSection: {
        alignItems: 'flex-end',
    },
    stockLabel: {
        fontSize: 13,
        color: COLORS.neutral[500],
    },
    stockValue: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    // ===== Description =====
    descriptionText: {
        fontSize: 14,
        color: COLORS.neutral[600],
        lineHeight: 22,
    },
    // ===== Info =====
    infoRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.neutral[100],
    },
    infoContent: {
        flex: 1,
        marginLeft: 12,
    },
    infoLabel: {
        fontSize: 13,
        color: COLORS.neutral[500],
        marginBottom: 4,
    },
    infoValue: {
        fontSize: 15,
        color: COLORS.neutral[800],
        fontWeight: '500',
    },
    cropChips: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    cropChip: {
        backgroundColor: COLORS.primary[50],
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 50,
        marginRight: 6,
        marginBottom: 4,
    },
    cropChipText: {
        fontSize: 12,
        color: COLORS.primary[700],
        fontWeight: '500',
    },
    // ===== Manufacturer =====
    manufacturerRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    manufacturerIcon: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: COLORS.primary[50],
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    manufacturerText: {
        fontSize: 15,
        fontWeight: '500',
        color: COLORS.neutral[800],
    },
    // ===== Safety =====
    safetyRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    safetyTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: COLORS.warning,
        marginLeft: 8,
    },
    safetyText: {
        fontSize: 13,
        color: COLORS.neutral[700],
        lineHeight: 20,
    },

});

export default ShopProductDetail;
