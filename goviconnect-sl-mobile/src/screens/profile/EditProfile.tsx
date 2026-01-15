import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { Header, PrimaryButton, InputField, Chip } from '../../components';
import { COLORS } from '../../utils/constants';
import { useApp } from '../../context';
import { saveUser, saveMyCrops, User } from '../../services/storage';
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
    const { user } = useApp();

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
            const updatedUser: User = {
                ...user!,
                name: name.trim(),
                phone: phone.trim(),
                district: district,
                crops: selectedCrops,
            };

            await saveUser(updatedUser);
            await saveMyCrops(selectedCrops);

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
        <View className="flex-1 bg-neutral-50">
            <Header
                title={t('profile.edit_profile')}
                showBack
                onBackPress={() => navigation.goBack()}
            />

            <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                <View className="p-4">
                    {/* Avatar Section */}
                    <View className="items-center mb-6">
                        <View className="w-24 h-24 bg-primary-100 rounded-full items-center justify-center mb-3">
                            <Text className="text-5xl">👨‍🌾</Text>
                        </View>
                        <TouchableOpacity>
                            <Text className="text-primary-600 font-medium">
                                {t('profile.change_photo')}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Form */}
                    <View className="bg-white rounded-2xl p-4 mb-4">
                        <Text className="text-lg font-semibold text-neutral-800 mb-4">
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
                        <View className="mb-4">
                            <Text className="text-sm font-medium text-neutral-700 mb-1.5">
                                {t('auth.district')}
                            </Text>
                            <TouchableOpacity
                                onPress={() => setShowDistrictPicker(!showDistrictPicker)}
                                className="flex-row items-center bg-white rounded-xl px-4 py-3 border-2 border-neutral-200"
                            >
                                <Ionicons name="location-outline" size={20} color={COLORS.neutral[400]} style={{ marginRight: 10 }} />
                                <Text className={`flex-1 text-base ${district ? 'text-neutral-800' : 'text-neutral-400'}`}>
                                    {district || 'Select your district'}
                                </Text>
                                <Ionicons
                                    name={showDistrictPicker ? 'chevron-up' : 'chevron-down'}
                                    size={20}
                                    color={COLORS.neutral[400]}
                                />
                            </TouchableOpacity>

                            {showDistrictPicker && (
                                <View className="bg-white border border-neutral-200 rounded-xl mt-2 max-h-48">
                                    <ScrollView nestedScrollEnabled>
                                        {DISTRICTS.map((d) => (
                                            <TouchableOpacity
                                                key={d}
                                                onPress={() => {
                                                    setDistrict(d);
                                                    setShowDistrictPicker(false);
                                                }}
                                                className={`px-4 py-3 border-b border-neutral-100 ${district === d ? 'bg-primary-50' : ''}`}
                                            >
                                                <Text className={`text-base ${district === d ? 'text-primary-600 font-medium' : 'text-neutral-700'}`}>
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
                    <View className="bg-white rounded-2xl p-4 mb-4">
                        <Text className="text-lg font-semibold text-neutral-800 mb-2">
                            {t('profile.my_crops_label')}
                        </Text>
                        <Text className="text-sm text-neutral-500 mb-4">
                            Select the crops you grow
                        </Text>

                        <View className="flex-row flex-wrap">
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
            <View className="p-4 bg-white border-t border-neutral-100">
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

export default EditProfile;
