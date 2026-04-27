import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, Alert, FlatList, Image, ActivityIndicator, Modal } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { SpeechAPI, useSpeechEvent, isSpeechAvailable } from '../../utils/speechRecognition';
import { Header, PrimaryButton, InputField, EmptyState, Chip } from '../../components';
import { COLORS } from '../../utils/constants';
import { learnhubAPI, feedAPI } from '../../services/api';

// Type definitions for the form
type GuideForm = {
    id?: string;
    cropId?: string;
    name: string;
    scientificName: string;
    category: string;
    description: string;
    climate: string;
    soil: string;
    season: string;
    diseases: string;
    treatments: string;
    practices: string;
    videoLinks: string[];
    videoUrls: string[];
    images: string[];
    status: 'pending' | 'approved' | 'rejected';
    submittedAt: string;
};

const CATEGORIES = ['Vegetable', 'Fruit', 'Grain', 'Spice', 'Legume', 'Herb', 'Root Crop', 'Other'];
const CLIMATES = ['Tropical', 'Subtropical', 'Temperate', 'Cool', 'Warm', 'Dry', 'Humid'];
const SOIL_TYPES = ['Loamy', 'Sandy', 'Clay', 'Silty', 'Peaty', 'Sandy Loam', 'Red Earth', 'Alluvial'];

const AddCropGuide: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    const { t } = useTranslation();

    const [viewMode, setViewMode] = useState<'list' | 'form'>('list');
    const [editingGuideId, setEditingGuideId] = useState<string | null>(null);
    const [history, setHistory] = useState<GuideForm[]>([]);
    const [loading, setLoading] = useState(false);
    // Local image URIs picked from gallery (not yet uploaded)
    const [localImages, setLocalImages] = useState<string[]>([]);
    const [uploadingImages, setUploadingImages] = useState(false);
    // Local video URIs picked from device (not yet uploaded)
    const [localVideos, setLocalVideos] = useState<string[]>([]);
    const [uploadingVideos, setUploadingVideos] = useState(false);
    // Video link input buffer
    const [videoLinkInput, setVideoLinkInput] = useState('');
    // Crop picker state
    const [crops, setCrops] = useState<any[]>([]);
    const [cropPickerVisible, setCropPickerVisible] = useState(false);
    const [cropSearch, setCropSearch] = useState('');
    // Voice typing state
    const [voiceLang, setVoiceLang] = useState<'en-US' | 'si-LK'>('en-US');
    const [voiceField, setVoiceField] = useState<keyof GuideForm | null>(null);
    const [voiceListening, setVoiceListening] = useState(false);

    // Voice recognition events (safe — no-op in Expo Go, works in dev builds)
    useSpeechEvent('result', (event) => {
        if (event.results && event.results.length > 0) {
            const transcript = event.results[0]?.transcript || '';
            if (transcript && voiceField) {
                setFormData(prev => {
                    const current = (prev[voiceField] as string) || '';
                    return { ...prev, [voiceField]: current ? current + ' ' + transcript : transcript };
                });
            }
        }
        setVoiceListening(false);
        setVoiceField(null);
    });

    useSpeechEvent('error', () => {
        setVoiceListening(false);
        setVoiceField(null);
    });

    useSpeechEvent('end', () => {
        setVoiceListening(false);
    });

    const startVoice = async (field: keyof GuideForm) => {
        if (!isSpeechAvailable()) {
            Alert.alert(
                'Voice Typing Unavailable',
                'Voice typing requires a development build. You can still type manually or use your keyboard\'s built-in microphone button.',
            );
            return;
        }
        if (voiceListening) {
            SpeechAPI.stop();
            setVoiceListening(false);
            setVoiceField(null);
            return;
        }
        try {
            const { granted } = await SpeechAPI.requestPermissionsAsync();
            if (!granted) {
                Alert.alert('Permission Required', 'Microphone access is needed for voice typing.');
                return;
            }
            setVoiceField(field);
            setVoiceListening(true);
            SpeechAPI.start({ lang: voiceLang, interimResults: false, continuous: false });
        } catch (e) {
            setVoiceListening(false);
            setVoiceField(null);
            Alert.alert('Voice Error', 'Could not start voice recognition. Please try again.');
        }
    };

    useEffect(() => {
        loadGuideHistory();
        feedAPI.getCrops()
            .then((r: any) => setCrops(Array.isArray(r.data.data) ? r.data.data : []))
            .catch(() => {});
    }, []);

    const loadGuideHistory = async () => {
        try {
            const res = await learnhubAPI.getUserGuides();
            const data = Array.isArray(res.data.data) ? res.data.data : [];
            setHistory(data.map((g: any) => ({
                id: g._id || g.id,
                cropId: g.cropId || '',
                name: g.name || g.title || '',
                scientificName: g.scientificName || '',
                category: g.category || '',
                description: g.description || '',
                climate: g.climate || '',
                soil: g.soil || '',
                season: g.season || '',
                diseases: g.diseases || '',
                treatments: g.treatments || '',
                practices: g.practices || '',
                videoLinks: Array.isArray(g.videoLinks) ? g.videoLinks : (g.videoLink ? [g.videoLink] : []),
                videoUrls: Array.isArray(g.videoUrls) ? g.videoUrls : [],
                images: Array.isArray(g.images) ? g.images : (g.imageUrl ? [g.imageUrl] : []),
                status: g.status || 'pending',
                submittedAt: g.submittedAt || g.createdAt || '',
            })));
        } catch (e) {
            console.error('Failed to load guide history:', e);
        }
    };

    // Form State
    const [formData, setFormData] = useState<GuideForm>({
        cropId: '',
        name: '',
        scientificName: '',
        category: '',
        description: '',
        climate: '',
        soil: '',
        season: '',
        diseases: '',
        treatments: '',
        practices: '',
        videoLinks: [],
        videoUrls: [],
        images: [],
        status: 'pending',
        submittedAt: '',
    });

    const resetForm = () => {
        setEditingGuideId(null);
        setFormData({
            cropId: '',
            name: '',
            scientificName: '',
            category: '',
            description: '',
            climate: '',
            soil: '',
            season: '',
            diseases: '',
            treatments: '',
            practices: '',
            videoLinks: [],
            videoUrls: [],
            images: [],
            status: 'pending',
            submittedAt: '',
        });
        setLocalImages([]);
        setLocalVideos([]);
        setVideoLinkInput('');
    };

    const handleAddNew = () => {
        resetForm();
        setViewMode('form');
    };

    const handleEdit = (item: GuideForm) => {
        setEditingGuideId(item.id || null);
        setFormData({ ...item, id: item.id });
        setLocalImages(item.images || []);
        // Already-uploaded video URLs go into localVideos display list
        setLocalVideos(item.videoUrls || []);
        setVideoLinkInput('');
        setViewMode('form');
    };

    // Chip selector helper
    const SelectChips = ({ label, options, value, onSelect }: {
        label: string;
        options: string[];
        value: string;
        onSelect: (v: string) => void;
    }) => (
        <View style={styles.inputContainer}>
            <Text style={styles.label}>{label}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
                {options.map(opt => (
                    <TouchableOpacity
                        key={opt}
                        onPress={() => onSelect(value === opt ? '' : opt)}
                        style={[styles.chip, value === opt && styles.chipActive]}
                    >
                        <Text style={[styles.chipText, value === opt && styles.chipTextActive]}>{opt}</Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );

    const handleDelete = (id: string) => {
        Alert.alert(
            t('common.delete'),
            'Are you sure you want to delete this guide?',
            [
                { text: t('common.cancel'), style: 'cancel' },
                {
                    text: t('common.delete'),
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await learnhubAPI.deleteUserGuide(id);
                            setHistory(prev => prev.filter(item => item.id !== id));
                        } catch {
                            setHistory(prev => prev.filter(item => item.id !== id));
                        }
                    }
                }
            ]
        );
    };

    const pickImages = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission needed', 'Please allow access to your photo library to add images.');
            return;
        }
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsMultipleSelection: true,
            quality: 0.7,
            selectionLimit: 5,
        });
        if (!result.canceled) {
            const newUris = result.assets.map(a => a.uri);
            setLocalImages(prev => [...prev, ...newUris].slice(0, 5));
        }
    };

    const removeImage = (index: number) => {
        setLocalImages(prev => prev.filter((_, i) => i !== index));
    };

    const pickVideos = async () => {
        const totalVideos = localVideos.length;
        if (totalVideos >= 5) {
            Alert.alert('Limit reached', 'You can upload up to 5 videos.');
            return;
        }
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission needed', 'Please allow access to your photo library to add videos.');
            return;
        }
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Videos,
            allowsMultipleSelection: true,
            selectionLimit: 5 - totalVideos,
            quality: 1,
        });
        if (!result.canceled) {
            const newUris = result.assets.map(a => a.uri);
            setLocalVideos(prev => [...prev, ...newUris].slice(0, 5));
        }
    };

    const removeLocalVideo = (index: number) => {
        setLocalVideos(prev => prev.filter((_, i) => i !== index));
    };

    const addVideoLink = () => {
        const url = videoLinkInput.trim();
        if (!url) return;
        if (!(url.startsWith('http://') || url.startsWith('https://'))) {
            Alert.alert('Invalid URL', 'Please enter a valid URL starting with http:// or https://');
            return;
        }
        if ((formData.videoLinks || []).length >= 5) {
            Alert.alert('Limit reached', 'You can add up to 5 video links.');
            return;
        }
        setFormData(prev => ({ ...prev, videoLinks: [...(prev.videoLinks || []), url] }));
        setVideoLinkInput('');
    };

    const removeVideoLink = (index: number) => {
        setFormData(prev => ({ ...prev, videoLinks: prev.videoLinks.filter((_, i) => i !== index) }));
    };

    const mapCropCategory = (cat: string): string => {
        const map: Record<string, string> = {
            vegetables: 'Vegetable', fruits: 'Fruit', tea: 'Herb', paddy: 'Grain', spices: 'Spice',
        };
        return map[cat?.toLowerCase()] || (cat ? cat.charAt(0).toUpperCase() + cat.slice(1) : '');
    };

    const handleSubmit = async () => {
        if (!formData.name?.trim() || !formData.description?.trim()) {
            Alert.alert(t('common.error'), 'Please fill in at least the Crop Name and Description.');
            return;
        }

        setLoading(true);
        try {
            // 1. Upload new local images while preserving only currently-selected existing ones
            let uploadedImageUrls: string[] = localImages.filter((uri) => uri.startsWith('http'));
            const newLocalImages = localImages.filter(uri => !uri.startsWith('http'));
            if (newLocalImages.length > 0) {
                try {
                    setUploadingImages(true);
                    const imgFormData = new FormData();
                    newLocalImages.forEach((uri, index) => {
                        const ext = uri.split('.').pop()?.split('?')[0] || 'jpg';
                        imgFormData.append('images', {
                            uri,
                            type: `image/${ext.toLowerCase()}`,
                            name: `guide_image_${index}.${ext}`,
                        } as any);
                    });
                    const uploadRes = await learnhubAPI.uploadGuideImages(imgFormData);
                    uploadedImageUrls = [...uploadedImageUrls, ...(uploadRes.data.urls || [])];
                } catch (uploadError: any) {
                    const uploadMessage = uploadError?.response?.data?.message || 'Image upload failed. Saving guide without new images.';
                    Alert.alert('Upload Warning', uploadMessage);
                } finally {
                    setUploadingImages(false);
                }
            }

            // 2. Upload new local videos while preserving only currently-selected existing ones
            let uploadedVideoUrls: string[] = localVideos.filter(uri => uri.startsWith('http'));
            const newLocalVideos = localVideos.filter(uri => !uri.startsWith('http'));
            if (newLocalVideos.length > 0) {
                try {
                    setUploadingVideos(true);
                    const vidFormData = new FormData();
                    newLocalVideos.forEach((uri, index) => {
                        const ext = uri.split('.').pop()?.split('?')[0] || 'mp4';
                        vidFormData.append('videos', {
                            uri,
                            type: `video/${ext.toLowerCase()}`,
                            name: `guide_video_${index}.${ext}`,
                        } as any);
                    });
                    const vidRes = await learnhubAPI.uploadGuideVideos(vidFormData);
                    uploadedVideoUrls = [...uploadedVideoUrls, ...(vidRes.data.urls || [])];
                } catch (uploadError: any) {
                    const uploadMessage = uploadError?.response?.data?.message || 'Video upload failed. Saving guide without new videos.';
                    Alert.alert('Upload Warning', uploadMessage);
                } finally {
                    setUploadingVideos(false);
                }
            }

            const payload = {
                cropId: formData.cropId,
                name: formData.name,
                scientificName: formData.scientificName,
                category: formData.category,
                description: formData.description,
                climate: formData.climate,
                soil: formData.soil,
                season: formData.season,
                diseases: formData.diseases,
                treatments: formData.treatments,
                practices: formData.practices,
                videoLinks: formData.videoLinks,
                videoUrls: uploadedVideoUrls,
                images: uploadedImageUrls,
            };

            if (editingGuideId) {
                await learnhubAPI.updateUserGuide(editingGuideId, payload);
                resetForm();
                await loadGuideHistory();
                setViewMode('list');
                Alert.alert('✅ Updated!', 'Your guide has been updated successfully.');
            } else {
                await learnhubAPI.submitUserGuide(payload);
                resetForm();
                await loadGuideHistory();
                setViewMode('list');
                Alert.alert('✅ Guide Submitted!', 'Your crop guide has been submitted and is pending review. You can see it in My Guides.');
            }
        } catch (error: any) {
            console.error('Failed to submit guide:', error);
            const apiMessage = error?.response?.data?.message;
            Alert.alert(t('common.error'), apiMessage || 'Failed to submit guide. Please try again.');
        } finally {
            setLoading(false);
            setUploadingImages(false);
            setUploadingVideos(false);
        }
    };

    const renderHistoryItem = ({ item }: { item: GuideForm }) => (
        <View style={styles.historyCard}>
            <View style={styles.historyHeader}>
                <View style={styles.iconPlaceholder}>
                    <Text style={{ fontSize: 24 }}>🌿</Text>
                </View>
                <View style={styles.historyInfo}>
                    <Text style={styles.historyTitle}>{item.name}</Text>
                    <Text style={styles.historyDate}>{item.submittedAt}</Text>
                </View>
                <View style={[
                    styles.statusBadge,
                    item.status === 'approved' ? styles.statusApproved :
                        item.status === 'rejected' ? styles.statusRejected : styles.statusPending
                ]}>
                    <Text style={[
                        styles.statusText,
                        item.status === 'approved' ? styles.textApproved :
                            item.status === 'rejected' ? styles.textRejected : styles.textPending
                    ]}>
                        {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                    </Text>
                </View>
            </View>

            <View style={styles.historyActions}>
                <TouchableOpacity onPress={() => handleEdit(item)} style={styles.actionBtn}>
                    <Ionicons name="pencil" size={18} color={COLORS.primary[600]} />
                    <Text style={styles.actionBtnText}>Edit</Text>
                </TouchableOpacity>
                <View style={styles.divider} />
                <TouchableOpacity onPress={() => handleDelete(item.id!)} style={styles.actionBtn}>
                    <Ionicons name="trash" size={18} color={COLORS.error} />
                    <Text style={[styles.actionBtnText, { color: COLORS.error }]}>Delete</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    if (viewMode === 'list') {
        return (
            <View style={styles.container}>
                <Header
                    title="My Crop Guides"
                    showBack
                    onBackPress={() => navigation.goBack()}
                />

                <View style={styles.listContent}>
                    <FlatList
                        data={history}
                        renderItem={renderHistoryItem}
                        keyExtractor={item => item.id!}
                        contentContainerStyle={{ padding: 16 }}
                        ListEmptyComponent={
                            <EmptyState
                                icon="document-text-outline"
                                title="No Guides Added"
                                description="You haven't submitted any crop guides yet."
                            />
                        }
                    />
                </View>

                <View style={styles.fabContainer}>
                    <TouchableOpacity
                        style={styles.fab}
                        onPress={handleAddNew}
                    >
                        <Ionicons name="add" size={30} color="#ffffff" />
                        <Text style={styles.fabText}>Add New Guide</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    // Form View
    return (
        <View style={styles.container}>
            <Header
                title={formData.id ? "Edit Guide" : "New Crop Guide"}
                showBack
                onBackPress={() => setViewMode('list')}
            />

            {voiceListening && (
                <View style={styles.voiceHintBanner}>
                    <ActivityIndicator size="small" color="#ffffff" style={{ marginRight: 8 }} />
                    <Text style={styles.voiceHintText}>
                        Listening in {voiceLang === 'en-US' ? 'English' : 'Sinhala'}... Tap mic to stop
                    </Text>
                </View>
            )}

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.formContainer}>
                    <View style={styles.infoBox}>
                        <Ionicons name="information-circle-outline" size={24} color={COLORS.info} />
                        <Text style={styles.infoText}>
                            Fill in the details below. Tabs like Diseases and Treatments are included in the sections.
                        </Text>
                    </View>

                    {/* Voice language toggle */}
                    <View style={styles.langToggleRow}>
                        <Ionicons name="mic-outline" size={16} color={COLORS.neutral[500]} style={{ marginRight: 8 }} />
                        <Text style={styles.langToggleLabel}>Voice language:</Text>
                        <TouchableOpacity
                            onPress={() => setVoiceLang('en-US')}
                            style={[styles.langBtn, voiceLang === 'en-US' && styles.langBtnActive]}
                        >
                            <Text style={[styles.langBtnText, voiceLang === 'en-US' && styles.langBtnTextActive]}>EN</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => setVoiceLang('si-LK')}
                            style={[styles.langBtn, voiceLang === 'si-LK' && styles.langBtnActive]}
                        >
                            <Text style={[styles.langBtnText, voiceLang === 'si-LK' && styles.langBtnTextActive]}>සිං</Text>
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.sectionTitle}>Overview</Text>

                    <InputField
                        label="Crop Name *"
                        placeholder="e.g., Red Onion"
                        value={formData.name}
                        onChangeText={(text) => setFormData({ ...formData, name: text })}
                        icon="leaf-outline"
                        rightIcon="chevron-down"
                        onRightIconPress={() => { setCropSearch(''); setCropPickerVisible(true); }}
                    />
                    {crops.find(c => c.name === formData.name)?.nameSi ? (
                        <Text style={[styles.cropSelectedHint, { marginTop: -10, marginBottom: 12 }]}>
                            {crops.find(c => c.name === formData.name)?.nameSi}
                        </Text>
                    ) : (
                        <TouchableOpacity
                            onPress={() => { setCropSearch(''); setCropPickerVisible(true); }}
                            style={{ marginTop: -10, marginBottom: 12 }}
                        >
                            <Text style={styles.cropPickerHint}>🌿 Tap to select from crop list</Text>
                        </TouchableOpacity>
                    )}

                    {/* Scientific Name (auto-filled, manually editable, no voice) */}
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Scientific Name</Text>
                        <TextInput
                            style={styles.textInput}
                            placeholder="Auto-filled from crop selection"
                            placeholderTextColor={COLORS.neutral[400]}
                            value={formData.scientificName}
                            onChangeText={(text) => setFormData({ ...formData, scientificName: text })}
                        />
                    </View>

                    <SelectChips
                        label="Category"
                        options={CATEGORIES}
                        value={formData.category}
                        onSelect={(v) => setFormData({ ...formData, category: v })}
                    />

                    <View style={styles.inputContainer}>
                        <View style={styles.labelRow}>
                            <Text style={styles.label}>Description</Text>
                            <TouchableOpacity onPress={() => startVoice('description')} style={[styles.micBtn, voiceField === 'description' && styles.micBtnActive]}>
                                <Ionicons name={voiceField === 'description' ? 'mic' : 'mic-outline'} size={16} color={voiceField === 'description' ? '#ffffff' : COLORS.primary[500]} />
                            </TouchableOpacity>
                        </View>
                        <TextInput
                            style={styles.textArea}
                            placeholder="Brief overview..."
                            placeholderTextColor={COLORS.neutral[400]}
                            value={formData.description}
                            onChangeText={(text) => setFormData({ ...formData, description: text })}
                            multiline
                            numberOfLines={4}
                            textAlignVertical="top"
                        />
                    </View>

                    <SelectChips
                        label="Climate"
                        options={CLIMATES}
                        value={formData.climate}
                        onSelect={(v) => setFormData({ ...formData, climate: v })}
                    />

                    <SelectChips
                        label="Soil Type"
                        options={SOIL_TYPES}
                        value={formData.soil}
                        onSelect={(v) => setFormData({ ...formData, soil: v })}
                    />

                    <Text style={[styles.sectionTitle, { marginTop: 16 }]}>Details & Care</Text>

                    <View style={styles.inputContainer}>
                        <View style={styles.labelRow}>
                            <Text style={styles.label}>Diseases (Comma separated)</Text>
                            <TouchableOpacity onPress={() => startVoice('diseases')} style={[styles.micBtn, voiceField === 'diseases' && styles.micBtnActive]}>
                                <Ionicons name={voiceField === 'diseases' ? 'mic' : 'mic-outline'} size={16} color={voiceField === 'diseases' ? '#ffffff' : COLORS.primary[500]} />
                            </TouchableOpacity>
                        </View>
                        <TextInput
                            style={styles.textArea}
                            placeholder="e.g. Blight, Rot..."
                            placeholderTextColor={COLORS.neutral[400]}
                            value={formData.diseases}
                            onChangeText={(text) => setFormData({ ...formData, diseases: text })}
                            multiline
                            numberOfLines={2}
                            textAlignVertical="top"
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <View style={styles.labelRow}>
                            <Text style={styles.label}>Treatments & Prevention</Text>
                            <TouchableOpacity onPress={() => startVoice('treatments')} style={[styles.micBtn, voiceField === 'treatments' && styles.micBtnActive]}>
                                <Ionicons name={voiceField === 'treatments' ? 'mic' : 'mic-outline'} size={16} color={voiceField === 'treatments' ? '#ffffff' : COLORS.primary[500]} />
                            </TouchableOpacity>
                        </View>
                        <TextInput
                            style={styles.textArea}
                            placeholder="Describe treatments..."
                            placeholderTextColor={COLORS.neutral[400]}
                            value={formData.treatments}
                            onChangeText={(text) => setFormData({ ...formData, treatments: text })}
                            multiline
                            numberOfLines={3}
                            textAlignVertical="top"
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <View style={styles.labelRow}>
                            <Text style={styles.label}>Best Practices</Text>
                            <TouchableOpacity onPress={() => startVoice('practices')} style={[styles.micBtn, voiceField === 'practices' && styles.micBtnActive]}>
                                <Ionicons name={voiceField === 'practices' ? 'mic' : 'mic-outline'} size={16} color={voiceField === 'practices' ? '#ffffff' : COLORS.primary[500]} />
                            </TouchableOpacity>
                        </View>
                        <TextInput
                            style={styles.textArea}
                            placeholder="Describe best practices..."
                            placeholderTextColor={COLORS.neutral[400]}
                            value={formData.practices}
                            onChangeText={(text) => setFormData({ ...formData, practices: text })}
                            multiline
                            numberOfLines={3}
                            textAlignVertical="top"
                        />
                    </View>

                    <Text style={[styles.sectionTitle, { marginTop: 16 }]}>Media</Text>

                    {/* Image picker grid */}
                    <Text style={styles.label}>Photos (up to 5)</Text>
                    <View style={styles.imageGrid}>
                        {localImages.map((uri, index) => (
                            <View key={uri + index} style={styles.imageTile}>
                                <Image source={{ uri }} style={styles.imageTileImg} />
                                <TouchableOpacity
                                    style={styles.imageTileRemove}
                                    onPress={() => removeImage(index)}
                                >
                                    <Ionicons name="close-circle" size={20} color="#ef4444" />
                                </TouchableOpacity>
                            </View>
                        ))}
                        {localImages.length < 5 && (
                            <TouchableOpacity style={styles.addImageTile} onPress={pickImages}>
                                <Ionicons name="add" size={28} color={COLORS.primary[500]} />
                                <Text style={styles.addImageText}>Add Photo</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                    <Text style={styles.mediaHint}>
                        {localImages.length}/5 photos selected
                    </Text>

                    {/* Video files from device */}
                    <Text style={styles.label}>Videos from Device (up to 5)</Text>
                    <View style={styles.imageGrid}>
                        {localVideos.map((uri, index) => (
                            <View key={uri + index} style={styles.imageTile}>
                                <View style={styles.videoTileThumb}>
                                    <Ionicons name="videocam" size={28} color="#ffffff" />
                                    {uri.startsWith('http') ? (
                                        <Text style={styles.videoTileLabel} numberOfLines={1}>Uploaded</Text>
                                    ) : (
                                        <Text style={styles.videoTileLabel} numberOfLines={1}>
                                            {uri.split('/').pop()?.substring(0, 12) || 'Video'}
                                        </Text>
                                    )}
                                </View>
                                <TouchableOpacity
                                    style={styles.imageTileRemove}
                                    onPress={() => removeLocalVideo(index)}
                                >
                                    <Ionicons name="close-circle" size={20} color="#ef4444" />
                                </TouchableOpacity>
                            </View>
                        ))}
                        {localVideos.length < 5 && (
                            <TouchableOpacity style={styles.addVideoTile} onPress={pickVideos}>
                                <Ionicons name="add-circle-outline" size={28} color={COLORS.primary[500]} />
                                <Text style={styles.addImageText}>Add Video</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                    <Text style={styles.mediaHint}>
                        {localVideos.length}/5 videos selected
                    </Text>

                    {/* Video links */}
                    <Text style={styles.label}>Video Links (YouTube / URLs, up to 5)</Text>
                    {(formData.videoLinks || []).map((link, index) => (
                        <View key={index} style={styles.videoLinkRow}>
                            <Ionicons name="logo-youtube" size={18} color="#ef4444" style={{ marginRight: 8 }} />
                            <Text style={styles.videoLinkText} numberOfLines={1}>{link}</Text>
                            <TouchableOpacity onPress={() => removeVideoLink(index)} style={styles.videoLinkRemove}>
                                <Ionicons name="close-circle" size={18} color={COLORS.neutral[400]} />
                            </TouchableOpacity>
                        </View>
                    ))}
                    {(formData.videoLinks || []).length < 5 && (
                        <View style={styles.videoLinkInputRow}>
                            <TextInput
                                style={styles.videoLinkInput}
                                placeholder="https://youtube.com/watch?v=..."
                                placeholderTextColor={COLORS.neutral[400]}
                                value={videoLinkInput}
                                onChangeText={setVideoLinkInput}
                                autoCapitalize="none"
                                keyboardType="url"
                            />
                            <TouchableOpacity
                                style={[styles.videoAddBtn, !videoLinkInput.trim() && { opacity: 0.4 }]}
                                onPress={addVideoLink}
                                disabled={!videoLinkInput.trim()}
                            >
                                <Ionicons name="add" size={20} color="#ffffff" />
                            </TouchableOpacity>
                        </View>
                    )}
                    <Text style={styles.mediaHint}>
                        {(formData.videoLinks || []).length}/5 video links added
                    </Text>
                </View>
            </ScrollView>

            <View style={styles.footer}>
                <View style={styles.footerBtnContainer}>
                    <TouchableOpacity
                        style={styles.cancelButton}
                        onPress={() => setViewMode('list')}
                    >
                        <Text style={styles.cancelButtonText}>Cancel</Text>
                    </TouchableOpacity>

                    <View style={{ width: 12 }} />

                    <TouchableOpacity
                        style={styles.submitButton}
                        onPress={handleSubmit}
                        disabled={loading}
                    >
                        {loading ? (
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <ActivityIndicator size="small" color="#ffffff" style={{ marginRight: 8 }} />
                                <Text style={styles.submitButtonText}>
                                    {uploadingVideos ? 'Uploading videos...' : uploadingImages ? 'Uploading images...' : 'Saving...'}
                                </Text>
                            </View>
                        ) : (
                            <Text style={styles.submitButtonText}>
                                {editingGuideId ? 'Update Guide' : 'Submit Guide'}
                            </Text>
                        )}
                    </TouchableOpacity>
                </View>
            </View>

            {/* Crop Picker Modal */}
            <Modal
                visible={cropPickerVisible}
                animationType="slide"
                transparent
                onRequestClose={() => { setCropPickerVisible(false); setCropSearch(''); }}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Select Crop</Text>
                            <TouchableOpacity onPress={() => { setCropPickerVisible(false); setCropSearch(''); }}>
                                <Ionicons name="close" size={24} color={COLORS.neutral[700]} />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.modalSearchBar}>
                            <Ionicons name="search-outline" size={18} color={COLORS.neutral[400]} />
                            <TextInput
                                style={styles.modalSearchInput}
                                placeholder="Search crop..."
                                placeholderTextColor={COLORS.neutral[400]}
                                value={cropSearch}
                                onChangeText={setCropSearch}
                                autoFocus
                            />
                        </View>
                        <FlatList
                            data={crops.filter(c =>
                                cropSearch === '' ||
                                c.name.toLowerCase().includes(cropSearch.toLowerCase()) ||
                                (c.nameSi || '').includes(cropSearch)
                            )}
                            keyExtractor={item => item.cropId || item._id || item.name}
                            keyboardShouldPersistTaps="handled"
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={styles.cropPickerItem}
                                    onPress={() => {
                                        setFormData(prev => ({
                                            ...prev,
                                            cropId: item.cropId || item._id || '',
                                            name: item.name,
                                            scientificName: item.scientificName || prev.scientificName,
                                            category: item.category ? mapCropCategory(item.category) : prev.category,
                                        }));
                                        setCropPickerVisible(false);
                                        setCropSearch('');
                                    }}
                                >
                                    <Text style={{ fontSize: 26, marginRight: 14 }}>{item.icon || '🌱'}</Text>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.cropPickerName}>{item.name}</Text>
                                        {item.nameSi ? <Text style={styles.cropPickerNameSi}>{item.nameSi}</Text> : null}
                                        {item.scientificName ? (
                                            <Text style={styles.cropPickerSci}>{item.scientificName}</Text>
                                        ) : null}
                                    </View>
                                    {formData.name === item.name && (
                                        <Ionicons name="checkmark-circle" size={22} color={COLORS.primary[500]} />
                                    )}
                                </TouchableOpacity>
                            )}
                            ListEmptyComponent={
                                <View style={{ padding: 24, alignItems: 'center' }}>
                                    <Text style={{ color: COLORS.neutral[400] }}>No crops found. Type your crop name above.</Text>
                                </View>
                            }
                        />
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.neutral[50],
    },
    listContent: {
        flex: 1,
    },
    fabContainer: {
        position: 'absolute',
        bottom: 24,
        right: 24,
    },
    fab: {
        backgroundColor: COLORS.primary[600],
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 30,
        shadowColor: COLORS.primary[600],
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    fabText: {
        color: '#ffffff',
        fontWeight: 'bold',
        marginLeft: 8,
        fontSize: 16,
    },
    historyCard: {
        backgroundColor: '#ffffff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: COLORS.neutral[100],
    },
    historyHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    iconPlaceholder: {
        width: 48,
        height: 48,
        backgroundColor: COLORS.primary[50],
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    historyInfo: {
        flex: 1,
    },
    historyTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.neutral[800],
    },
    historyDate: {
        fontSize: 12,
        color: COLORS.neutral[400],
        marginTop: 2,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusApproved: { backgroundColor: '#dcfce7' }, // green-100
    statusPending: { backgroundColor: '#fef9c3' }, // yellow-100
    statusRejected: { backgroundColor: '#fee2e2' }, // red-100
    statusText: { fontSize: 10, fontWeight: '600', textTransform: 'uppercase' },
    textApproved: { color: '#166534' },
    textPending: { color: '#854d0e' },
    textRejected: { color: '#991b1b' },
    historyActions: {
        flexDirection: 'row',
        borderTopWidth: 1,
        borderTopColor: COLORS.neutral[100],
        paddingTop: 12,
    },
    actionBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    actionBtnText: {
        marginLeft: 6,
        fontSize: 14,
        fontWeight: '500',
        color: COLORS.primary[600],
    },
    divider: {
        width: 1,
        height: '100%',
        backgroundColor: COLORS.neutral[200],
    },
    actionBtnDisabled: {
        opacity: 0.5,
    },
    // Form Styles
    actionBtnTextDisabled: {
        color: COLORS.neutral[400],
    },
    content: {
        flex: 1,
    },
    formContainer: {
        padding: 16,
    },
    infoBox: {
        flexDirection: 'row',
        backgroundColor: '#eff6ff',
        padding: 16,
        borderRadius: 12,
        marginBottom: 24,
    },
    infoText: {
        flex: 1,
        marginLeft: 12,
        color: '#1e40af',
        fontSize: 14,
        lineHeight: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: COLORS.neutral[800],
        marginBottom: 16,
    },
    inputContainer: {
        marginBottom: 16,
    },
    row: {
        flexDirection: 'row',
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        color: COLORS.neutral[700],
        marginBottom: 8,
    },
    textInput: {
        backgroundColor: '#ffffff',
        borderWidth: 1,
        borderColor: COLORS.neutral[200],
        borderRadius: 12,
        padding: 12,
        fontSize: 16,
        color: COLORS.neutral[800],
    },
    textArea: {
        backgroundColor: '#ffffff',
        borderWidth: 1,
        borderColor: COLORS.neutral[200],
        borderRadius: 12,
        padding: 12,
        fontSize: 16,
        color: COLORS.neutral[800],
        minHeight: 80,
    },
    footer: {
        padding: 16,
        backgroundColor: '#ffffff',
        borderTopWidth: 1,
        borderTopColor: COLORS.neutral[100],
    },
    footerBtnContainer: {
        flexDirection: 'row',
    },
    cancelButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: COLORS.neutral[300],
        alignItems: 'center',
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.neutral[600],
    },
    submitButton: {
        flex: 2,
        backgroundColor: COLORS.primary[600],
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
    },
    submitButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#ffffff',
    },
    // Image grid for media section
    imageGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 8,
    },
    imageTile: {
        width: 90,
        height: 90,
        marginRight: 8,
        marginBottom: 8,
        borderRadius: 10,
        overflow: 'visible',
        position: 'relative',
    },
    imageTileImg: {
        width: 90,
        height: 90,
        borderRadius: 10,
        backgroundColor: COLORS.neutral[200],
    },
    imageTileRemove: {
        position: 'absolute',
        top: -6,
        right: -6,
        backgroundColor: '#ffffff',
        borderRadius: 10,
    },
    addImageTile: {
        width: 90,
        height: 90,
        marginRight: 8,
        marginBottom: 8,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: COLORS.primary[300],
        borderStyle: 'dashed',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.primary[50],
    },
    addVideoTile: {
        width: 90,
        height: 90,
        marginRight: 8,
        marginBottom: 8,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: COLORS.primary[300],
        borderStyle: 'dashed',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fdf4ff',
    },
    videoTileThumb: {
        width: 90,
        height: 90,
        borderRadius: 10,
        backgroundColor: '#1f2937',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 6,
    },
    videoTileLabel: {
        fontSize: 10,
        color: 'rgba(255,255,255,0.7)',
        marginTop: 4,
        textAlign: 'center',
    },
    addImageText: {
        fontSize: 11,
        color: COLORS.primary[500],
        marginTop: 4,
        fontWeight: '500',
    },
    mediaHint: {
        fontSize: 12,
        color: COLORS.neutral[400],
        marginBottom: 16,
    },
    // Chip selectors
    chipsRow: {
        flexDirection: 'row',
        paddingVertical: 4,
        gap: 8,
    },
    chip: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1.5,
        borderColor: COLORS.neutral[200],
        backgroundColor: '#ffffff',
        marginRight: 8,
    },
    chipActive: {
        borderColor: COLORS.primary[500],
        backgroundColor: COLORS.primary[500],
    },
    chipText: {
        fontSize: 13,
        color: COLORS.neutral[600],
        fontWeight: '500',
    },
    chipTextActive: {
        color: '#ffffff',
        fontWeight: '600',
    },
    // Video link management
    videoLinkRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        borderWidth: 1,
        borderColor: COLORS.neutral[200],
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 10,
        marginBottom: 8,
    },
    videoLinkText: {
        flex: 1,
        fontSize: 13,
        color: COLORS.neutral[700],
    },
    videoLinkRemove: {
        marginLeft: 8,
    },
    videoLinkInputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    videoLinkInput: {
        flex: 1,
        backgroundColor: '#ffffff',
        borderWidth: 1,
        borderColor: COLORS.neutral[200],
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 14,
        color: COLORS.neutral[800],
        marginRight: 8,
    },
    videoAddBtn: {
        width: 42,
        height: 42,
        borderRadius: 10,
        backgroundColor: COLORS.primary[500],
        alignItems: 'center',
        justifyContent: 'center',
    },
    // Voice & Crop picker styles
    labelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    micBtn: {
        padding: 6,
        borderRadius: 8,
        backgroundColor: COLORS.primary[50],
    },
    micBtnActive: {
        backgroundColor: COLORS.primary[500],
    },
    voiceHintBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#dc2626',
        paddingHorizontal: 16,
        paddingVertical: 10,
    },
    voiceHintText: {
        color: '#ffffff',
        fontSize: 13,
        fontWeight: '500',
        flex: 1,
    },
    langToggleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.neutral[50],
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 8,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: COLORS.neutral[200],
    },
    langToggleLabel: {
        fontSize: 13,
        color: COLORS.neutral[600],
        flex: 1,
    },
    langBtn: {
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: COLORS.neutral[300],
        marginLeft: 6,
        backgroundColor: '#ffffff',
    },
    langBtnActive: {
        backgroundColor: COLORS.primary[500],
        borderColor: COLORS.primary[500],
    },
    langBtnText: {
        fontSize: 13,
        fontWeight: '600',
        color: COLORS.neutral[600],
    },
    langBtnTextActive: {
        color: '#ffffff',
    },
    // Modal styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContainer: {
        backgroundColor: '#ffffff',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        maxHeight: '80%',
        paddingBottom: 20,
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.neutral[100],
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.neutral[800],
    },
    modalSearchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.neutral[50],
        margin: 16,
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderWidth: 1,
        borderColor: COLORS.neutral[200],
    },
    modalSearchInput: {
        flex: 1,
        marginLeft: 8,
        fontSize: 15,
        color: COLORS.neutral[800],
    },
    cropPickerItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.neutral[50],
    },
    cropPickerName: {
        fontSize: 15,
        fontWeight: '600',
        color: COLORS.neutral[800],
    },
    cropPickerNameSi: {
        fontSize: 13,
        color: COLORS.neutral[500],
        marginTop: 2,
    },
    cropPickerSci: {
        fontSize: 12,
        color: COLORS.primary[600],
        fontStyle: 'italic',
        marginTop: 2,
    },
});

export default AddCropGuide;
