import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { Header, PrimaryButton, InputField, AppNotify } from '../../../components';
import { COLORS } from '../../../utils/constants';
import { useShop } from '../../../context/ShopContext';
import { userAPI } from '../../../services/api';

const LOCATIONS = [
    'Colombo', 'Gampaha', 'Kalutara', 'Kandy', 'Matale', 'Nuwara Eliya',
    'Galle', 'Matara', 'Hambantota', 'Jaffna', 'Kurunegala', 'Puttalam',
    'Anuradhapura', 'Polonnaruwa', 'Badulla', 'Ratnapura', 'Kegalle',
];

const SHOP_TYPES: Array<'Individual' | 'Business' | 'Exporter'> = ['Individual', 'Business', 'Exporter'];

const ShopEditProfile: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    const { t } = useTranslation();
    const { shop, updateShop } = useShop();

    const [name, setName] = useState(shop?.name || '');
    const [email, setEmail] = useState(shop?.email || '');
    const [location, setLocation] = useState(shop?.location || '');
    const [shopType, setShopType] = useState<'Individual' | 'Business' | 'Exporter'>(shop?.type || 'Business');
    const [isLoading, setIsLoading] = useState(false);
    const [showLocationPicker, setShowLocationPicker] = useState(false);

    const handleSave = async () => {
        if (!name.trim()) {
            AppNotify.toast('Shop name is required.', 'error');
            return;
        }

        setIsLoading(true);
        try {
            const res = await userAPI.updateShopProfile({
                name: name.trim(),
                email,
                location,
                type: shopType,
            });

            // Update context so profile page reflects the new data immediately
            const updated = res.data.user;
            updateShop({
                name: updated.name,
                email: updated.email || '',
                location: updated.location || '',
                type: updated.type || shopType,
            });

            AppNotify.toast('Profile updated successfully!', 'success');
            navigation.goBack();
        } catch (error) {
            AppNotify.toast('Failed to update profile.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Header
                title={t('profile.edit_profile')}
                showBack
                onBackPress={() => navigation.goBack()}
            />

            <ScrollView
                style={styles.content}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                <View style={styles.scrollContent}>
                    {/* Avatar Section */}
                    <View style={styles.avatarSection}>
                        <View style={styles.avatarContainer}>
                            <Text style={styles.avatarText}>🏪</Text>
                        </View>
                        <TouchableOpacity>
                            <Text style={styles.changePhotoText}>
                                {t('profile.change_photo')}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Shop Information */}
                    <View style={styles.formCard}>
                        <Text style={styles.sectionTitle}>Shop Information</Text>

                        <InputField
                            label="Shop Name"
                            placeholder="Enter shop name"
                            value={name}
                            onChangeText={setName}
                            icon="storefront-outline"
                        />

                        <InputField
                            label={t('auth.email')}
                            placeholder="email@example.com"
                            value={email}
                            onChangeText={setEmail}
                            icon="mail-outline"
                            keyboardType="email-address"
                        />

                        {/* Location Picker */}
                        <View style={styles.pickerContainer}>
                            <Text style={styles.label}>Location</Text>
                            <TouchableOpacity
                                onPress={() => setShowLocationPicker(!showLocationPicker)}
                                style={styles.pickerButton}
                            >
                                <Ionicons name="location-outline" size={20} color={COLORS.neutral[400]} style={styles.pickerIcon} />
                                <Text style={[styles.pickerText, location ? styles.pickerTextActive : styles.pickerTextPlaceholder]}>
                                    {location || 'Select location'}
                                </Text>
                                <Ionicons
                                    name={showLocationPicker ? 'chevron-up' : 'chevron-down'}
                                    size={20}
                                    color={COLORS.neutral[400]}
                                />
                            </TouchableOpacity>

                            {showLocationPicker && (
                                <View style={styles.pickerDropdown}>
                                    <ScrollView nestedScrollEnabled style={styles.pickerScrollView}>
                                        {LOCATIONS.map((loc) => (
                                            <TouchableOpacity
                                                key={loc}
                                                onPress={() => {
                                                    setLocation(loc);
                                                    setShowLocationPicker(false);
                                                }}
                                                style={[
                                                    styles.pickerItem,
                                                    location === loc && styles.pickerItemActive
                                                ]}
                                            >
                                                <Text style={[
                                                    styles.pickerItemText,
                                                    location === loc ? styles.pickerItemTextActive : styles.pickerItemTextInactive
                                                ]}>
                                                    {loc}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </ScrollView>
                                </View>
                            )}
                        </View>
                    </View>

                    {/* Shop Type */}
                    <View style={styles.formCard}>
                        <Text style={styles.sectionTitle}>Shop Type</Text>
                        <View style={styles.typeChips}>
                            {SHOP_TYPES.map((type) => {
                                const isSelected = shopType === type;
                                return (
                                    <TouchableOpacity
                                        key={type}
                                        onPress={() => setShopType(type)}
                                        style={[
                                            styles.typeChip,
                                            isSelected && styles.typeChipSelected,
                                        ]}
                                    >
                                        <Ionicons
                                            name={isSelected ? 'checkmark-circle' : 'ellipse-outline'}
                                            size={18}
                                            color={isSelected ? '#ffffff' : COLORS.primary[600]}
                                        />
                                        <Text style={[
                                            styles.typeChipText,
                                            isSelected && styles.typeChipTextSelected,
                                        ]}>
                                            {type}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </View>
                </View>
            </ScrollView>

            {/* Save Button */}
            <View style={styles.footer}>
                <PrimaryButton
                    title={t('common.save')}
                    onPress={handleSave}
                    loading={isLoading}
                    fullWidth
                    size="lg"
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.neutral[50],
    },
    content: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
    },
    // ===== Avatar =====
    avatarSection: {
        alignItems: 'center',
        marginBottom: 24,
    },
    avatarContainer: {
        width: 96,
        height: 96,
        backgroundColor: COLORS.primary[100],
        borderRadius: 48,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    avatarText: {
        fontSize: 48,
    },
    changePhotoText: {
        color: COLORS.primary[600],
        fontWeight: '500',
    },
    // ===== Form =====
    formCard: {
        backgroundColor: '#ffffff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: COLORS.neutral[800],
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        color: COLORS.neutral[700],
        marginBottom: 6,
    },
    // ===== Picker =====
    pickerContainer: {
        marginBottom: 16,
    },
    pickerButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderWidth: 2,
        borderColor: COLORS.neutral[200],
    },
    pickerIcon: {
        marginRight: 10,
    },
    pickerText: {
        flex: 1,
        fontSize: 16,
    },
    pickerTextActive: {
        color: COLORS.neutral[800],
    },
    pickerTextPlaceholder: {
        color: COLORS.neutral[400],
    },
    pickerDropdown: {
        backgroundColor: '#ffffff',
        borderWidth: 1,
        borderColor: COLORS.neutral[200],
        borderRadius: 12,
        marginTop: 8,
        maxHeight: 192,
    },
    pickerScrollView: {
        maxHeight: 192,
    },
    pickerItem: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.neutral[100],
    },
    pickerItemActive: {
        backgroundColor: COLORS.primary[50],
    },
    pickerItemText: {
        fontSize: 16,
    },
    pickerItemTextActive: {
        color: COLORS.primary[600],
        fontWeight: '500',
    },
    pickerItemTextInactive: {
        color: COLORS.neutral[700],
    },
    // ===== Type Chips =====
    typeChips: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    typeChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.primary[50],
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 50,
        marginRight: 10,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: COLORS.primary[200],
    },
    typeChipSelected: {
        backgroundColor: COLORS.primary[600],
        borderColor: COLORS.primary[600],
    },
    typeChipText: {
        fontSize: 14,
        color: COLORS.primary[700],
        fontWeight: '500',
        marginLeft: 8,
    },
    typeChipTextSelected: {
        color: '#ffffff',
    },
    // ===== Footer =====
    footer: {
        padding: 16,
        backgroundColor: '#ffffff',
        borderTopWidth: 1,
        borderTopColor: COLORS.neutral[100],
    },
});

export default ShopEditProfile;
