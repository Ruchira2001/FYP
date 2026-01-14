import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Header, PrimaryButton } from '../../../components';
import { COLORS } from '../../../utils/constants';

const CropDoctorUpload: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    const { t } = useTranslation();
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    const pickImage = async (useCamera: boolean) => {
        let permissionResult;

        if (useCamera) {
            permissionResult = await ImagePicker.requestCameraPermissionsAsync();
        } else {
            permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        }

        if (!permissionResult.granted) {
            Alert.alert('Permission Required', 'Please grant camera/gallery permission to use this feature.');
            return;
        }

        let result;
        if (useCamera) {
            result = await ImagePicker.launchCameraAsync({
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.8,
            });
        } else {
            result = await ImagePicker.launchImageLibraryAsync({
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.8,
            });
        }

        if (!result.canceled && result.assets[0]) {
            setSelectedImage(result.assets[0].uri);
        }
    };

    const handleAnalyze = () => {
        if (selectedImage) {
            navigation.navigate('CropDoctorResult', { imageUri: selectedImage });
        }
    };

    return (
        <View className="flex-1 bg-neutral-50">
            <Header
                title={t('ai.crop_doctor')}
                showBack
                onBackPress={() => navigation.goBack()}
            />

            <View className="flex-1 p-4">
                {/* Image Preview/Upload Area */}
                {selectedImage ? (
                    <View className="relative">
                        <Image
                            source={{ uri: selectedImage }}
                            className="w-full h-72 rounded-2xl"
                            resizeMode="cover"
                        />
                        <TouchableOpacity
                            onPress={() => setSelectedImage(null)}
                            className="absolute top-3 right-3 w-10 h-10 bg-black/50 rounded-full items-center justify-center"
                        >
                            <Ionicons name="close" size={24} color="white" />
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View className="w-full h-72 bg-neutral-100 rounded-2xl border-2 border-dashed border-neutral-300 items-center justify-center">
                        <Ionicons name="leaf" size={64} color={COLORS.neutral[300]} />
                        <Text className="text-neutral-400 mt-4 text-center px-8">
                            {t('ai.upload_image')}
                        </Text>
                    </View>
                )}

                {/* Upload Buttons */}
                <View className="flex-row mt-6">
                    <TouchableOpacity
                        onPress={() => pickImage(true)}
                        className="flex-1 mr-2 bg-primary-100 rounded-xl py-4 items-center"
                    >
                        <Ionicons name="camera" size={28} color={COLORS.primary[600]} />
                        <Text className="text-primary-700 font-medium mt-2">
                            {t('ai.take_photo')}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => pickImage(false)}
                        className="flex-1 bg-secondary-100 rounded-xl py-4 items-center"
                    >
                        <Ionicons name="images" size={28} color={COLORS.secondary[600]} />
                        <Text className="text-secondary-700 font-medium mt-2">
                            {t('ai.choose_gallery')}
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Tips */}
                <View className="bg-blue-50 rounded-xl p-4 mt-6">
                    <Text className="text-blue-800 font-semibold mb-2">Tips for best results:</Text>
                    <View className="flex-row items-start mb-1">
                        <Ionicons name="checkmark-circle" size={16} color={COLORS.info} style={{ marginTop: 2 }} />
                        <Text className="text-blue-700 text-sm ml-2 flex-1">Take a clear, focused photo of the affected area</Text>
                    </View>
                    <View className="flex-row items-start mb-1">
                        <Ionicons name="checkmark-circle" size={16} color={COLORS.info} style={{ marginTop: 2 }} />
                        <Text className="text-blue-700 text-sm ml-2 flex-1">Ensure good lighting conditions</Text>
                    </View>
                    <View className="flex-row items-start">
                        <Ionicons name="checkmark-circle" size={16} color={COLORS.info} style={{ marginTop: 2 }} />
                        <Text className="text-blue-700 text-sm ml-2 flex-1">Include both healthy and affected parts if possible</Text>
                    </View>
                </View>

                {/* Analyze Button */}
                <View className="mt-auto pb-4">
                    <PrimaryButton
                        title={t('ai.analyze')}
                        onPress={handleAnalyze}
                        disabled={!selectedImage}
                        icon="scan"
                        fullWidth
                        size="lg"
                    />
                </View>
            </View>
        </View>
    );
};

export default CropDoctorUpload;
