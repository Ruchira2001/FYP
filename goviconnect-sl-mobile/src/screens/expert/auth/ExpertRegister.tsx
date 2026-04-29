import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Header, InputField, AppNotify } from '../../../components';
import { COLORS } from '../../../utils/constants';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'react-native';
import { expertsAPI, authAPI } from '../../../services/api';
import { useApp } from '../../../context';

const ExpertRegister: React.FC = () => {
    const navigation = useNavigation();
    const { refreshUser } = useApp();
    const [loading, setLoading] = useState(false);
    
    const [form, setForm] = useState({
        specialty: '',
        yearsExperience: '',
        qualifications: '',
        bio: '',
    });
    const [selectedImages, setSelectedImages] = useState<string[]>([]);

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsMultipleSelection: true,
            quality: 0.7,
        });

        if (!result.canceled) {
            setSelectedImages([...selectedImages, ...result.assets.map(a => a.uri)]);
        }
    };

    const removeImage = (index: number) => {
        setSelectedImages(selectedImages.filter((_, i) => i !== index));
    };

    const handleRegister = async () => {
        if (!form.specialty || !form.yearsExperience) {
            AppNotify.toast('Please fill in specialty and years of experience.', 'error');
            return;
        }

        setLoading(true);
        try {
            const response = await expertsAPI.registerAsExpert({
                ...form,
                qualifications: form.qualifications ? form.qualifications.split(',').map(q => q.trim()) : [],
                qualificationImages: selectedImages,
            });

            if (response.data.success) {
                console.log('Registration success response:', response.data);
                
                try {
                    // Refresh user data using the new centralized helper
                    await refreshUser();
                } catch (refreshErr) {
                    console.error('Final refresh error:', refreshErr);
                }

                AppNotify.toast('You are now registered as an expert!', 'success');
                navigation.goBack();
            }
        } catch (error: any) {
            console.error('Expert registration error:', error);
            AppNotify.toast(error.response?.data?.message || 'Failed to register as expert', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Header title="Become an Expert" showBack onBackPress={() => navigation.goBack()} />
            
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.infoBox}>
                    <Ionicons name="information-circle-outline" size={24} color={COLORS.primary[600]} />
                    <Text style={styles.infoText}>
                        Your basic information (Name, District, Phone) will be automatically linked from your farmer account.
                    </Text>
                </View>

                <InputField
                    label="Specialty (e.g. Rice Cultivation, Pest Management)"
                    value={form.specialty}
                    onChangeText={(text) => setForm({ ...form, specialty: text })}
                    placeholder="Rice, Vegetables, Soil Science..."
                />

                <InputField
                    label="Years of Experience"
                    value={form.yearsExperience}
                    onChangeText={(text) => setForm({ ...form, yearsExperience: text })}
                    keyboardType="numeric"
                    placeholder="e.g. 5"
                />

                <InputField
                    label="Qualifications (Comma separated)"
                    value={form.qualifications}
                    onChangeText={(text) => setForm({ ...form, qualifications: text })}
                    placeholder="BSc Agriculture, Certified Organic Farmer..."
                    multiline
                />

                <InputField
                    label="Brief Bio"
                    value={form.bio}
                    onChangeText={(text) => setForm({ ...form, bio: text })}
                    placeholder="Tell farmers about your expertise..."
                    multiline
                />

                <View style={styles.uploadSection}>
                    <Text style={styles.uploadLabel}>Upload Qualifications / Certificates</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.imageGrid}>
                        <TouchableOpacity style={styles.addButton} onPress={pickImage}>
                            <Ionicons name="camera-outline" size={24} color={COLORS.neutral[400]} />
                            <Text style={styles.addButtonText}>Add Photo</Text>
                        </TouchableOpacity>
                        
                        {selectedImages.map((uri, index) => (
                            <View key={index} style={styles.imageWrapper}>
                                <Image source={{ uri }} style={styles.previewImage} />
                                <TouchableOpacity style={styles.removeBtn} onPress={() => removeImage(index)}>
                                    <Ionicons name="close-circle" size={20} color={COLORS.error} />
                                </TouchableOpacity>
                            </View>
                        ))}
                    </ScrollView>
                </View>

                <TouchableOpacity 
                    style={[styles.submitButton, loading && styles.disabledButton]} 
                    onPress={handleRegister}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.submitButtonText}>Submit Application</Text>
                    )}
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    scrollContent: { padding: 20 },
    infoBox: {
        flexDirection: 'row',
        backgroundColor: COLORS.primary[50],
        padding: 16,
        borderRadius: 12,
        marginBottom: 24,
        alignItems: 'center',
        gap: 12,
    },
    infoText: {
        flex: 1,
        fontSize: 13,
        color: COLORS.primary[700],
        lineHeight: 18,
    },
    submitButton: {
        backgroundColor: COLORS.primary[600],
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 20,
    },
    disabledButton: {
        backgroundColor: COLORS.neutral[300],
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    uploadSection: {
        marginTop: 20,
    },
    uploadLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.neutral[700],
        marginBottom: 12,
    },
    imageGrid: {
        flexDirection: 'row',
        gap: 12,
        paddingBottom: 8,
    },
    addButton: {
        width: 100,
        height: 100,
        borderRadius: 12,
        borderWidth: 1,
        borderStyle: 'dashed',
        borderColor: COLORS.neutral[300],
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.neutral[50],
    },
    addButtonText: {
        fontSize: 12,
        color: COLORS.neutral[500],
        marginTop: 4,
    },
    imageWrapper: {
        position: 'relative',
    },
    previewImage: {
        width: 100,
        height: 100,
        borderRadius: 12,
    },
    removeBtn: {
        position: 'absolute',
        top: -5,
        right: -5,
        backgroundColor: '#fff',
        borderRadius: 10,
    },
});

export default ExpertRegister;
