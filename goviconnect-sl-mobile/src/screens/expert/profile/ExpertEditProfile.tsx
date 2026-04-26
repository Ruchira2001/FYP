import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { Header, PrimaryButton, InputField } from '../../../components';
import { COLORS } from '../../../utils/constants';
import { useExpert } from '../../../context/ExpertContext';
import { userAPI } from '../../../services/api';

const DISTRICTS = [
    'Colombo', 'Gampaha', 'Kalutara', 'Kandy', 'Matale', 'Nuwara Eliya',
    'Galle', 'Matara', 'Hambantota', 'Jaffna', 'Kilinochchi', 'Mannar',
    'Vavuniya', 'Mullaitivu', 'Batticaloa', 'Ampara', 'Trincomalee',
    'Kurunegala', 'Puttalam', 'Anuradhapura', 'Polonnaruwa', 'Badulla',
    'Monaragala', 'Ratnapura', 'Kegalle'
];

const SPECIALIZATIONS = [
    'Vegetables', 'Fruits', 'Paddy', 'Tea', 'Rubber', 'Coconut',
    'Spices', 'Floriculture', 'Mushrooms', 'Organic Farming',
    'Soil Science', 'Plant Pathology', 'Entomology', 'Post-Harvest',
];

const ExpertEditProfile: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    const { t, i18n } = useTranslation();
    const { expert, updateExpert } = useExpert();

    const [name, setName] = useState(expert?.name || '');
    const [phone, setPhone] = useState(expert?.phone || '');
    const [district, setDistrict] = useState(expert?.district || '');
    const [specialty, setSpecialty] = useState(expert?.specialty || '');
    const [selectedSpecializations, setSelectedSpecializations] = useState<string[]>(
        expert?.specializations || []
    );
    const [isLoading, setIsLoading] = useState(false);
    const [showDistrictPicker, setShowDistrictPicker] = useState(false);

    const toggleSpecialization = (spec: string) => {
        if (selectedSpecializations.includes(spec)) {
            setSelectedSpecializations(selectedSpecializations.filter(s => s !== spec));
        } else {
            setSelectedSpecializations([...selectedSpecializations, spec]);
        }
    };

    const handleSave = async () => {
        if (!name.trim()) {
            Alert.alert(t('common.error'), 'Name is required');
            return;
        }

        setIsLoading(true);
        try {
            const res = await userAPI.updateExpertProfile({
                name: name.trim(),
                phone,
                district,
                specialty,
                specializations: selectedSpecializations,
            });

            // Update context so profile page reflects the new data immediately
            const updated = res.data.user;
            updateExpert({
                name: updated.name,
                phone: updated.phone || '',
                district: updated.district || '',
                specialty: updated.specialty || '',
                specializations: updated.specializations || [],
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
                        <View style={styles.avatarWrapper}>
                            <View style={styles.avatarContainer}>
                                <Text style={styles.avatarText}>👨‍⚕️</Text>
                            </View>
                            <View style={styles.verifiedBadge}>
                                <Ionicons name="shield-checkmark" size={12} color="#ffffff" />
                            </View>
                        </View>
                        <TouchableOpacity>
                            <Text style={styles.changePhotoText}>
                                {t('profile.change_photo')}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Personal Information */}
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
                            placeholder={expert?.email || 'email@example.com'}
                            value={expert?.email || ''}
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

                    {/* Professional Information */}
                    <View style={styles.formCard}>
                        <Text style={styles.sectionTitle}>
                            Professional Information
                        </Text>

                        <InputField
                            label="Specialty"
                            placeholder="e.g. Plant Pathology"
                            value={specialty}
                            onChangeText={setSpecialty}
                            icon="ribbon-outline"
                        />

                        {/* Qualifications (read-only display) */}
                        {expert?.qualifications && expert.qualifications.length > 0 && (
                            <View style={styles.qualificationsContainer}>
                                <Text style={styles.label}>Qualifications</Text>
                                {expert.qualifications.map((qual, idx) => (
                                    <View key={idx} style={styles.qualificationItem}>
                                        <Ionicons name="school" size={16} color={COLORS.secondary[600]} />
                                        <Text style={styles.qualificationText}>{qual}</Text>
                                    </View>
                                ))}
                            </View>
                        )}
                    </View>

                    {/* Specializations */}
                    <View style={styles.formCard}>
                        <Text style={styles.sectionTitle}>
                            Specializations
                        </Text>
                        <Text style={styles.sectionSubtitle}>
                            Select your areas of expertise
                        </Text>

                        <View style={styles.chipsContainer}>
                            {SPECIALIZATIONS.map((spec) => {
                                const isSelected = selectedSpecializations.includes(spec);
                                return (
                                    <TouchableOpacity
                                        key={spec}
                                        onPress={() => toggleSpecialization(spec)}
                                        style={[
                                            styles.specChip,
                                            isSelected && styles.specChipSelected,
                                        ]}
                                    >
                                        <Ionicons
                                            name={isSelected ? 'checkmark-circle' : 'add-circle-outline'}
                                            size={16}
                                            color={isSelected ? '#ffffff' : COLORS.primary[600]}
                                        />
                                        <Text
                                            style={[
                                                styles.specChipText,
                                                isSelected && styles.specChipTextSelected,
                                            ]}
                                        >
                                            {spec}
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
    avatarWrapper: {
        position: 'relative',
        marginBottom: 12,
    },
    avatarContainer: {
        width: 96,
        height: 96,
        backgroundColor: COLORS.primary[100],
        borderRadius: 48,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: {
        fontSize: 48,
    },
    verifiedBadge: {
        position: 'absolute',
        bottom: 0,
        right: -2,
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: COLORS.primary[500],
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 3,
        borderColor: COLORS.neutral[50],
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
    sectionSubtitle: {
        fontSize: 14,
        color: COLORS.neutral[500],
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        color: COLORS.neutral[700],
        marginBottom: 6,
    },
    // ===== District Picker =====
    districtContainer: {
        marginBottom: 16,
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
    // ===== Qualifications =====
    qualificationsContainer: {
        marginBottom: 8,
    },
    qualificationItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 12,
        backgroundColor: COLORS.neutral[50],
        borderRadius: 10,
        marginBottom: 6,
    },
    qualificationText: {
        fontSize: 14,
        color: COLORS.neutral[700],
        marginLeft: 10,
    },
    // ===== Specialization Chips =====
    chipsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    specChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.primary[50],
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 50,
        marginRight: 8,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: COLORS.primary[200],
    },
    specChipSelected: {
        backgroundColor: COLORS.primary[600],
        borderColor: COLORS.primary[600],
    },
    specChipText: {
        fontSize: 13,
        color: COLORS.primary[700],
        fontWeight: '500',
        marginLeft: 6,
    },
    specChipTextSelected: {
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

export default ExpertEditProfile;
