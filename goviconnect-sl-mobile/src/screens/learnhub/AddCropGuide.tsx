import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, Alert, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { Header, PrimaryButton, InputField, EmptyState, Chip } from '../../components';
import { COLORS } from '../../utils/constants';
import { learnhubAPI } from '../../services/api';

// Type definitions for the form
type GuideForm = {
    id?: string;
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
    videoLink: string;
    status: 'pending' | 'approved' | 'rejected';
    submittedAt: string;
};

const AddCropGuide: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    const { t } = useTranslation();

    const [viewMode, setViewMode] = useState<'list' | 'form'>('list');
    const [history, setHistory] = useState<GuideForm[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadGuideHistory();
    }, []);

    const loadGuideHistory = async () => {
        try {
            const res = await learnhubAPI.getUserGuides();
            const data = Array.isArray(res.data.data) ? res.data.data : [];
            setHistory(data.map((g: any) => ({
                id: g._id || g.id,
                name: g.name || '',
                scientificName: g.scientificName || '',
                category: g.category || '',
                description: g.description || '',
                climate: g.climate || '',
                soil: g.soil || '',
                season: g.season || '',
                diseases: g.diseases || '',
                treatments: g.treatments || '',
                practices: g.practices || '',
                videoLink: g.videoLink || '',
                status: g.status || 'pending',
                submittedAt: g.submittedAt || g.createdAt || '',
            })));
        } catch (e) {
            console.error('Failed to load guide history:', e);
        }
    };

    // Form State
    const [formData, setFormData] = useState<GuideForm>({
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
        videoLink: '',
        status: 'pending',
        submittedAt: '',
    });

    const resetForm = () => {
        setFormData({
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
            videoLink: '',
            status: 'pending',
            submittedAt: '',
        });
    };

    const handleAddNew = () => {
        resetForm();
        setViewMode('form');
    };

    const handleEdit = (item: GuideForm) => {
        setFormData({ ...item });
        setViewMode('form');
    };

    const handleDelete = (id: string) => {
        Alert.alert(
            t('common.delete'),
            'Are you sure you want to delete this guide?',
            [
                { text: t('common.cancel'), style: 'cancel' },
                {
                    text: t('common.delete'),
                    style: 'destructive',
                    onPress: () => {
                        setHistory(prev => prev.filter(item => item.id !== id));
                    }
                }
            ]
        );
    };

    const handleSubmit = async () => {
        if (!formData.name || !formData.description) {
            Alert.alert(t('common.error'), 'Please fill in at least the Crop Name and Description.');
            return;
        }

        setLoading(true);
        try {
            if (formData.id) {
                // Update existing
                await learnhubAPI.updateUserGuide(formData.id, formData);
                Alert.alert(t('common.success'), 'Guide updated successfully.');
            } else {
                // Add new
                await learnhubAPI.submitUserGuide(formData);
                Alert.alert(t('common.success'), 'New guide submitted successfully.');
            }
            await loadGuideHistory();
            setViewMode('list');
        } catch (error) {
            console.error('Failed to submit guide:', error);
            Alert.alert(t('common.error'), 'Failed to submit guide.');
        } finally {
            setLoading(false);
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

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.formContainer}>
                    <View style={styles.infoBox}>
                        <Ionicons name="information-circle-outline" size={24} color={COLORS.info} />
                        <Text style={styles.infoText}>
                            Fill in the details below. Tabs like Diseases and Treatments are included in the sections.
                        </Text>
                    </View>

                    <Text style={styles.sectionTitle}>Overview</Text>

                    <InputField
                        label="Crop Name"
                        placeholder="e.g., Red Onion"
                        value={formData.name}
                        onChangeText={(text) => setFormData({ ...formData, name: text })}
                        icon="leaf-outline"
                    />

                    <InputField
                        label="Scientific Name"
                        placeholder="e.g., Allium cepa"
                        value={formData.scientificName}
                        onChangeText={(text) => setFormData({ ...formData, scientificName: text })}
                        icon="flask-outline"
                    />

                    <InputField
                        label="Category"
                        placeholder="e.g., Vegetable, Fruit"
                        value={formData.category}
                        onChangeText={(text) => setFormData({ ...formData, category: text })}
                        icon="grid-outline"
                    />

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Description</Text>
                        <TextInput
                            style={styles.textArea}
                            placeholder="Brief overview..."
                            value={formData.description}
                            onChangeText={(text) => setFormData({ ...formData, description: text })}
                            multiline
                            numberOfLines={4}
                            textAlignVertical="top"
                        />
                    </View>

                    <View style={styles.row}>
                        <View style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}>
                            <Text style={styles.label}>Climate</Text>
                            <TextInput
                                style={styles.textInput}
                                placeholder="Warm/Cool"
                                value={formData.climate}
                                onChangeText={(text) => setFormData({ ...formData, climate: text })}
                            />
                        </View>
                        <View style={[styles.inputContainer, { flex: 1, marginLeft: 8 }]}>
                            <Text style={styles.label}>Soil Type</Text>
                            <TextInput
                                style={styles.textInput}
                                placeholder="Loamy/Sandy"
                                value={formData.soil}
                                onChangeText={(text) => setFormData({ ...formData, soil: text })}
                            />
                        </View>
                    </View>

                    <Text style={[styles.sectionTitle, { marginTop: 16 }]}>Details & Care</Text>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Diseases (Comma separated)</Text>
                        <TextInput
                            style={styles.textArea}
                            placeholder="e.g. Blight, Rot..."
                            value={formData.diseases}
                            onChangeText={(text) => setFormData({ ...formData, diseases: text })}
                            multiline
                            numberOfLines={2}
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Treatments & Prevention</Text>
                        <TextInput
                            style={styles.textArea}
                            placeholder="Describe treatments..."
                            value={formData.treatments}
                            onChangeText={(text) => setFormData({ ...formData, treatments: text })}
                            multiline
                            numberOfLines={3}
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Best Practices</Text>
                        <TextInput
                            style={styles.textArea}
                            placeholder="Describe pest practices..."
                            value={formData.practices}
                            onChangeText={(text) => setFormData({ ...formData, practices: text })}
                            multiline
                            numberOfLines={3}
                        />
                    </View>

                    <Text style={[styles.sectionTitle, { marginTop: 16 }]}>Media</Text>
                    <InputField
                        label="Video Link (Optional)"
                        placeholder="https://youtube.com/..."
                        value={formData.videoLink}
                        onChangeText={(text) => setFormData({ ...formData, videoLink: text })}
                        icon="videocam-outline"
                    />
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
                            <Text style={styles.submitButtonText}>Saving...</Text>
                        ) : (
                            <Text style={styles.submitButtonText}>
                                {formData.id ? 'Update Guide' : 'Submit Guide'}
                            </Text>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
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
    // Form Styles
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
});

export default AddCropGuide;
