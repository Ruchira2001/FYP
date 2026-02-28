import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Header, EmptyState, Chip } from '../../../components';
import { COLORS, SHADOW } from '../../../utils/constants';
import { expertDashboardAPI } from '../../../services/api';

const DISTRICT_FILTERS = ['All', 'Kandy', 'Matale', 'Kurunegala', 'Anuradhapura', 'Nuwara Eliya'];

interface Farmer {
    id: string;
    name: string;
    district: string;
    crops: string[];
    lastActive: string;
    status: string;
}

const FarmerDirectory: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    const [searchQuery, setSearchQuery] = useState('');
    const [activeDistrict, setActiveDistrict] = useState('All');
    const [farmers, setFarmers] = useState<Farmer[]>([]);

    useEffect(() => {
        loadFarmers();
    }, []);

    const loadFarmers = async () => {
        try {
            const res = await expertDashboardAPI.getFarmerDirectory();
            const data = Array.isArray(res.data.data) ? res.data.data : [];
            setFarmers(data.map((f: any) => ({
                id: f._id || f.id,
                name: f.name || 'Farmer',
                district: f.district || '',
                crops: f.crops || [],
                lastActive: f.lastActive || f.updatedAt || '',
                status: f.status || 'active',
            })));
        } catch (e) {
            console.error('Failed to load farmers:', e);
        }
    };

    const filteredFarmers = farmers.filter(farmer => {
        const matchesSearch = farmer.name.toLowerCase().includes(searchQuery.toLowerCase())
            || farmer.crops.some(c => c.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesDistrict = activeDistrict === 'All' || farmer.district === activeDistrict;
        return matchesSearch && matchesDistrict;
    });

    const renderFarmer = ({ item }: { item: Farmer }) => (
        <TouchableOpacity style={styles.farmerCard} activeOpacity={0.7}>
            {/* Avatar */}
            <View style={styles.avatarContainer}>
                <View style={styles.avatar}>
                    <Text style={{ fontSize: 22 }}>👨‍🌾</Text>
                </View>
                <View style={[
                    styles.statusDot,
                    { backgroundColor: item.status === 'active' ? COLORS.success : COLORS.neutral[300] },
                ]} />
            </View>

            <View style={styles.farmerInfo}>
                <View style={styles.nameRow}>
                    <Text style={styles.farmerName}>{item.name}</Text>
                    <Ionicons name="chevron-forward" size={18} color={COLORS.neutral[300]} />
                </View>

                <View style={styles.detailRow}>
                    <Ionicons name="location-outline" size={14} color={COLORS.neutral[400]} />
                    <Text style={styles.detailText}>{item.district}</Text>
                </View>

                <View style={styles.cropChips}>
                    {item.crops.map((crop, idx) => (
                        <View key={idx} style={styles.cropChip}>
                            <Text style={styles.cropChipText}>{crop}</Text>
                        </View>
                    ))}
                </View>

                {/* Quick Actions */}
                <View style={styles.quickActions}>
                    <TouchableOpacity style={styles.quickAction}>
                        <Ionicons name="chatbubble-outline" size={16} color={COLORS.primary[500]} />
                        <Text style={styles.quickActionText}>Chat</Text>
                    </TouchableOpacity>
                    <View style={styles.actionDivider} />
                    <TouchableOpacity style={styles.quickAction}>
                        <Ionicons name="calendar-outline" size={16} color={COLORS.info} />
                        <Text style={[styles.quickActionText, { color: COLORS.info }]}>Meeting</Text>
                    </TouchableOpacity>
                    <View style={styles.actionDivider} />
                    <TouchableOpacity style={styles.quickAction}>
                        <Ionicons name="document-text-outline" size={16} color={COLORS.secondary[500]} />
                        <Text style={[styles.quickActionText, { color: COLORS.secondary[500] }]}>History</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <Header
                title="Farmer Directory"
                showBack
                onBackPress={() => navigation.goBack()}
            />

            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color={COLORS.neutral[400]} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search farmers or crops..."
                    placeholderTextColor={COLORS.neutral[400]}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
                {searchQuery.length > 0 && (
                    <TouchableOpacity onPress={() => setSearchQuery('')}>
                        <Ionicons name="close-circle" size={20} color={COLORS.neutral[300]} />
                    </TouchableOpacity>
                )}
            </View>

            {/* District Filters */}
            <View style={styles.filtersContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersContent}>
                    {DISTRICT_FILTERS.map(district => (
                        <Chip
                            key={district}
                            label={district}
                            selected={activeDistrict === district}
                            onPress={() => setActiveDistrict(district)}
                            variant="outline"
                            size="sm"
                            style={{ marginRight: 8 }}
                        />
                    ))}
                </ScrollView>
            </View>

            {/* Count */}
            <View style={styles.countBar}>
                <Text style={styles.countText}>
                    {filteredFarmers.length} farmer{filteredFarmers.length !== 1 ? 's' : ''} found
                </Text>
            </View>

            {/* Farmer List */}
            {filteredFarmers.length > 0 ? (
                <FlatList
                    data={filteredFarmers}
                    renderItem={renderFarmer}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                />
            ) : (
                <EmptyState
                    icon="people-outline"
                    title="No farmers found"
                    description="Try adjusting your search or filters."
                    variant="search"
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.neutral[50],
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        marginHorizontal: 16,
        marginTop: 12,
        paddingHorizontal: 14,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: COLORS.neutral[200],
        height: 44,
    },
    searchInput: {
        flex: 1,
        fontSize: 14,
        color: COLORS.neutral[800],
        marginLeft: 8,
    },
    filtersContainer: {
        paddingVertical: 12,
    },
    filtersContent: {
        paddingHorizontal: 16,
    },
    countBar: {
        paddingHorizontal: 16,
        paddingBottom: 8,
    },
    countText: {
        fontSize: 13,
        color: COLORS.neutral[400],
    },
    listContent: {
        padding: 16,
        paddingTop: 0,
        paddingBottom: 24,
    },
    farmerCard: {
        backgroundColor: '#ffffff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: COLORS.neutral[100],
        flexDirection: 'row',
        ...SHADOW.sm,
    },
    avatarContainer: {
        position: 'relative',
        marginRight: 12,
    },
    avatar: {
        width: 52,
        height: 52,
        borderRadius: 26,
        backgroundColor: COLORS.primary[50],
        alignItems: 'center',
        justifyContent: 'center',
    },
    statusDot: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 14,
        height: 14,
        borderRadius: 7,
        borderWidth: 2,
        borderColor: '#ffffff',
    },
    farmerInfo: {
        flex: 1,
    },
    nameRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    farmerName: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.neutral[800],
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 2,
        marginBottom: 8,
    },
    detailText: {
        fontSize: 13,
        color: COLORS.neutral[400],
        marginLeft: 4,
    },
    cropChips: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 10,
    },
    cropChip: {
        backgroundColor: COLORS.primary[50],
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 50,
        marginRight: 6,
        marginBottom: 4,
    },
    cropChipText: {
        fontSize: 11,
        color: COLORS.primary[700],
        fontWeight: '500',
    },
    quickActions: {
        flexDirection: 'row',
        borderTopWidth: 1,
        borderTopColor: COLORS.neutral[100],
        paddingTop: 10,
    },
    quickAction: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    quickActionText: {
        fontSize: 12,
        fontWeight: '500',
        color: COLORS.primary[500],
        marginLeft: 4,
    },
    actionDivider: {
        width: 1,
        height: 16,
        backgroundColor: COLORS.neutral[200],
    },
});

export default FarmerDirectory;
