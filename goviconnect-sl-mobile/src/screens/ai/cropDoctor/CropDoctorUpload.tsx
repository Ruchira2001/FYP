import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, Alert, StyleSheet, ScrollView } from 'react-native';
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
        <View style={styles.container}>
            <Header
                title={t('ai.crop_doctor')}
                showBack
                onBackPress={() => navigation.goBack()}
            />

            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                {/* Image Preview/Upload Area */}
                {selectedImage ? (
                    <View style={styles.imageContainer}>
                        <Image
                            source={{ uri: selectedImage }}
                            style={styles.image}
                            resizeMode="cover"
                        />
                        <TouchableOpacity
                            onPress={() => setSelectedImage(null)}
                            style={styles.closeButton}
                        >
                            <Ionicons name="close" size={24} color="white" />
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View style={styles.uploadPlaceholder}>
                        <Ionicons name="leaf" size={64} color={COLORS.neutral[300]} />
                        <Text style={styles.uploadText}>
                            {t('ai.upload_image')}
                        </Text>
                    </View>
                )}

                {/* Upload Buttons */}
                <View style={styles.uploadButtonsContainer}>
                    <TouchableOpacity
                        onPress={() => pickImage(true)}
                        style={styles.pickButton}
                    >
                        <Ionicons name="camera" size={28} color={COLORS.primary[600]} />
                        <Text style={styles.pickButtonText}>
                            {t('ai.take_photo')}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => pickImage(false)}
                        style={[styles.pickButton, styles.galleryButton]}
                    >
                        <Ionicons name="images" size={28} color={COLORS.secondary[600]} />
                        <Text style={styles.galleryButtonText}>
                            {t('ai.choose_gallery')}
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Tips */}
                <View style={styles.tipsContainer}>
                    <Text style={styles.tipsTitle}>Tips for best results:</Text>
                    <View style={styles.tipItem}>
                        <Ionicons name="leaf" size={16} color={COLORS.primary[600]} style={{ marginTop: 2 }} />
                        <Text style={styles.tipText}>
                            <Text style={{ fontWeight: '700' }}>Supported crops: </Text>
                            Rice (Brown Spot, Leaf Blast) and Tomato (Bacterial Spot, Early Blight, Late Blight)
                        </Text>
                    </View>
                    <View style={styles.tipItem}>
                        <Ionicons name="checkmark-circle" size={16} color={COLORS.info} style={{ marginTop: 2 }} />
                        <Text style={styles.tipText}>Take a clear, focused photo of the affected leaf or fruit</Text>
                    </View>
                    <View style={styles.tipItem}>
                        <Ionicons name="checkmark-circle" size={16} color={COLORS.info} style={{ marginTop: 2 }} />
                        <Text style={styles.tipText}>Ensure good lighting — avoid dark or blurry photos</Text>
                    </View>
                    <View style={styles.tipItem}>
                        <Ionicons name="checkmark-circle" size={16} color={COLORS.info} style={{ marginTop: 2 }} />
                        <Text style={styles.tipText}>Fill the frame with the diseased area for best accuracy</Text>
                    </View>
                </View>

                {/* Analyze Button */}
                <View style={styles.analyzeButtonContainer}>
                    <PrimaryButton
                        title={t('ai.analyze')}
                        onPress={handleAnalyze}
                        disabled={!selectedImage}
                        icon="scan"
                        fullWidth
                        size="lg"
                    />
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.neutral[50],
    },
    content: {
        padding: 16,
        paddingBottom: 32,
    },
    imageContainer: {
        position: 'relative',
        borderRadius: 16,
        overflow: 'hidden',
    },
    image: {
        width: '100%',
        height: 288,
        borderRadius: 16,
    },
    closeButton: {
        position: 'absolute',
        top: 12,
        right: 12,
        width: 40,
        height: 40,
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    uploadPlaceholder: {
        width: '100%',
        height: 288,
        backgroundColor: COLORS.neutral[100],
        borderRadius: 16,
        borderWidth: 2,
        borderColor: COLORS.neutral[300],
        borderStyle: 'dashed',
        alignItems: 'center',
        justifyContent: 'center',
    },
    uploadText: {
        color: COLORS.neutral[400],
        marginTop: 16,
        textAlign: 'center',
        paddingHorizontal: 32,
    },
    uploadButtonsContainer: {
        flexDirection: 'row',
        marginTop: 24,
    },
    pickButton: {
        flex: 1,
        marginRight: 8,
        backgroundColor: COLORS.primary[100],
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
    },
    galleryButton: {
        backgroundColor: COLORS.secondary[100],
        marginRight: 0,
        marginLeft: 8,
    },
    pickButtonText: {
        color: COLORS.primary[700],
        fontWeight: '500',
        marginTop: 8,
    },
    galleryButtonText: {
        color: COLORS.secondary[700],
        fontWeight: '500',
        marginTop: 8,
    },
    tipsContainer: {
        backgroundColor: '#eff6ff',
        borderRadius: 12,
        padding: 16,
        marginTop: 24,
    },
    tipsTitle: {
        color: '#1e40af',
        fontWeight: '600',
        marginBottom: 8,
    },
    tipItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 4,
    },
    tipText: {
        color: '#1d4ed8',
        fontSize: 14,
        marginLeft: 8,
        flex: 1,
    },
    analyzeButtonContainer: {
        marginTop: 24,
    },
});

export default CropDoctorUpload;
