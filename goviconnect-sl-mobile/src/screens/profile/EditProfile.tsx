import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { Header, PrimaryButton, InputField, Chip } from '../../components';
import { COLORS } from '../../utils/constants';
import { useApp } from '../../context';
import { userAPI } from '../../services/api';
import cropsData from '../../data/crops.json';

const DISTRICTS = [
    'Colombo', 'Gampaha', 'Kalutara', 'Kandy', 'Matale', 'Nuwara Eliya',
    'Galle', 'Matara', 'Hambantota', 'Jaffna', 'Kilinochchi', 'Mannar',
    'Vavuniya', 'Mullaitivu', 'Batticaloa', 'Ampara', 'Trincomalee',
    'Kurunegala', 'Puttalam', 'Anuradhapura', 'Polonnaruwa', 'Badulla',
    'Monaragala', 'Ratnapura', 'Kegalle'
];

const EditProfile: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    const { t, i18n } = useTranslation();
    const { user, updateUser } = useApp();

    const [name, setName] = useState(user?.name || '');
    const [phone, setPhone] = useState(user?.phone || '');
    const [district, setDistrict] = useState(user?.district || '');
    const [selectedCrops, setSelectedCrops] = useState<string[]>(user?.crops || []);
    const [isLoading, setIsLoading] = useState(false);
    const [showDistrictPicker, setShowDistrictPicker] = useState(false);

    const getCropDisplay = (cropId: string) => {
        const crop = cropsData.crops.find(c => c.id === cropId);
        return {
            name: i18n.language === 'si' ? crop?.nameSi : crop?.name,
            icon: crop?.icon,
        };
    };

    const toggleCrop = (cropId: string) => {
        if (selectedCrops.includes(cropId)) {
            setSelectedCrops(selectedCrops.filter(c => c !== cropId));
        } else {
            setSelectedCrops([...selectedCrops, cropId]);
        }
    };

    const handleSave = async () => {
        if (!name.trim()) {
            Alert.alert(t('common.error'), 'Name is required');
            return;
        }

        setIsLoading(true);
        try {
            const res = await userAPI.updateFarmerProfile({
                name: name.trim(),
                phone: phone.trim(),
                district: district,
                crops: selectedCrops,
            });

            // Update context so profile page reflects the new data immediately
            const updated = res.data.user;
            updateUser({
                name: updated.name,
                phone: updated.phone || '',
                district: updated.district || '',
                crops: updated.crops || [],
            });

            Alert.alert(t('common.success'), 'Profile updated successfully', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } catch (error) {
            console.error('Error saving profile:', error);
            Alert.alert(t('common.error'), 'Failed to update profile');
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
                            <Text style={styles.avatarText}>👨‍🌾</Text>
                        </View>
                        <TouchableOpacity>
                            <Text style={styles.changePhotoText}>
                                {t('profile.change_photo')}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Form */}
                    <View style={styles.formCard}>
                        <Text style={styles.sectionTitle}>
                            {t('profile.personal_info')}
                        </Text>

                        <InputField
                            label={t('auth.full_name')}
                            placeholder="Enter your name"
                            value={name}
                            onChangeText={setName}
                            icon="person-outline"
                        />

                        <InputField
                            label={t('auth.email')}
                            placeholder={user?.email || 'email@example.com'}
                            value={user?.email || ''}
                            onChangeText={() => { }}
                            icon="mail-outline"
                            editable={false}
                        />

                        <InputField
                            label={t('auth.phone')}
                            placeholder="077 123 4567"
                            value={phone}
                            onChangeText={setPhone}
                            keyboardType="phone-pad"
                            icon="call-outline"
                        />

                        {/* District Picker */}
                        <View style={styles.districtContainer}>
                            <Text style={styles.label}>
                                {t('auth.district')}
                            </Text>
                            <TouchableOpacity
                                onPress={() => setShowDistrictPicker(!showDistrictPicker)}
                                style={styles.districtButton}
                            >
                                <Ionicons name="location-outline" size={20} color={COLORS.neutral[400]} style={styles.districtIcon} />
                                <Text style={[styles.districtText, district ? styles.districtTextActive : styles.districtTextPlaceholder]}>
                                    {district || 'Select your district'}
                                </Text>
                                <Ionicons
                                    name={showDistrictPicker ? 'chevron-up' : 'chevron-down'}
                                    size={20}
                                    color={COLORS.neutral[400]}
                                />
                            </TouchableOpacity>

                            {showDistrictPicker && (
                                <View style={styles.districtPicker}>
                                    <ScrollView nestedScrollEnabled style={styles.districtScrollView}>
                                        {DISTRICTS.map((d) => (
                                            <TouchableOpacity
                                                key={d}
                                                onPress={() => {
                                                    setDistrict(d);
                                                    setShowDistrictPicker(false);
                                                }}
                                                style={[
                                                    styles.districtItem,
                                                    district === d && styles.districtItemActive
                                                ]}
                                            >
                                                <Text style={[
                                                    styles.districtItemText,
                                                    district === d ? styles.districtItemTextActive : styles.districtItemTextInactive
                                                ]}>
                                                    {d}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </ScrollView>
                                </View>
                            )}
                        </View>
                    </View>

                    {/* My Crops */}
                    <View style={styles.formCard}>
                        <Text style={styles.sectionTitle}>
                            {t('profile.my_crops_label')}
                        </Text>
                        <Text style={styles.sectionSubtitle}>
                            Select the crops you grow
                        </Text>

                        <View style={styles.chipsContainer}>
                            {cropsData.crops.map((crop) => {
                                const { name: cropName, icon } = getCropDisplay(crop.id);
                                const isSelected = selectedCrops.includes(crop.id);

                                return (
                                    <Chip
                                        key={crop.id}
                                        label={cropName || crop.name}
                                        emoji={icon}
                                        selected={isSelected}
                                        onPress={() => toggleCrop(crop.id)}
                                        variant="outline"
                                        size="md"
                                    />
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
        backgroundColor: COLORS.neutral[50], // neutral-50
    },
    content: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
    },
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
    districtContainer: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        color: COLORS.neutral[700],
        marginBottom: 6,
    },
    districtButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderWidth: 2,
        borderColor: COLORS.neutral[200],
    },
    districtIcon: {
        marginRight: 10,
    },
    districtText: {
        flex: 1,
        fontSize: 16,
    },
    districtTextActive: {
        color: COLORS.neutral[800],
    },
    districtTextPlaceholder: {
        color: COLORS.neutral[400],
    },
    districtPicker: {
        backgroundColor: '#ffffff',
        borderWidth: 1,
        borderColor: COLORS.neutral[200],
        borderRadius: 12,
        marginTop: 8,
        maxHeight: 192,
    },
    districtScrollView: {
        maxHeight: 192,
    },
    districtItem: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.neutral[100],
    },
    districtItemActive: {
        backgroundColor: COLORS.primary[50],
    },
    districtItemText: {
        fontSize: 16,
    },
    districtItemTextActive: {
        color: COLORS.primary[600],
        fontWeight: '500',
    },
    districtItemTextInactive: {
        color: COLORS.neutral[700],
    },
    sectionSubtitle: {
        fontSize: 14,
        color: COLORS.neutral[500],
        marginBottom: 16,
    },
    chipsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    footer: {
        padding: 16,
        backgroundColor: '#ffffff',
        borderTopWidth: 1,
        borderTopColor: COLORS.neutral[100],
    },
});

export default EditProfile;
