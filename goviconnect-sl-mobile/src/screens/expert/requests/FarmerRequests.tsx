import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { Header, EmptyState, Chip } from '../../../components';
import { COLORS, SHADOW } from '../../../utils/constants';
import { getRelativeTime } from '../../../utils/validators';
import { expertDashboardAPI } from '../../../services/api';

const REQUEST_FILTERS = ['All', 'Pending', 'In Review', 'Completed'];

const FarmerRequests: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    const { i18n } = useTranslation();

    const [activeFilter, setActiveFilter] = useState('All');
    const [requests, setRequests] = useState<any[]>([]);

    React.useEffect(() => {
        loadRequests();
    }, []);

    const loadRequests = async () => {
        try {
            const res = await expertDashboardAPI.getFarmerRequests();
            const data = Array.isArray(res.data.data) ? res.data.data : [];
            setRequests(data);
        } catch (e) {
            console.error('Failed to load requests:', e);
        }
    };

    const filteredRequests = requests.filter(req => {
        if (activeFilter === 'Pending') return req.status === 'pending';
        if (activeFilter === 'In Review') return req.status === 'in_review';
        if (activeFilter === 'Completed') return req.status === 'completed';
        return true;
    });

    const getStatusConfig = (status: string) => {
        switch (status) {
            case 'pending':
                return { label: 'Pending', color: COLORS.warning, bgColor: '#fef3c7', icon: 'time' as const };
            case 'in_review':
                return { label: 'In Review', color: COLORS.info, bgColor: '#dbeafe', icon: 'eye' as const };
            case 'completed':
                return { label: 'Completed', color: COLORS.success, bgColor: '#dcfce7', icon: 'checkmark-circle' as const };
            default:
                return { label: 'Unknown', color: COLORS.neutral[400], bgColor: COLORS.neutral[100], icon: 'help' as const };
        }
    };

    const getPriorityConfig = (priority: string) => {
        switch (priority) {
            case 'high':
                return { label: 'High', color: COLORS.error };
            case 'medium':
                return { label: 'Medium', color: COLORS.warning };
            case 'low':
                return { label: 'Low', color: COLORS.success };
            default:
                return { label: 'Normal', color: COLORS.neutral[400] };
        }
    };

    const getTypeIcon = (type: string): keyof typeof Ionicons.glyphMap => {
        return type === 'diagnosis' ? 'medical' : 'chatbubble-ellipses';
    };

    const renderRequest = ({ item }: { item: typeof expertData.farmerRequests[0] }) => {
        const statusConfig = getStatusConfig(item.status);
        const priorityConfig = getPriorityConfig(item.priority);

        return (
            <TouchableOpacity style={styles.requestCard} activeOpacity={0.7}>
                {/* Header Row */}
                <View style={styles.cardHeader}>
                    <View style={[styles.statusBadge, { backgroundColor: statusConfig.bgColor }]}>
                        <Ionicons name={statusConfig.icon} size={12} color={statusConfig.color} />
                        <Text style={[styles.statusText, { color: statusConfig.color }]}>{statusConfig.label}</Text>
                    </View>
                    <View style={styles.priorityDot}>
                        <View style={[styles.dot, { backgroundColor: priorityConfig.color }]} />
                        <Text style={[styles.priorityText, { color: priorityConfig.color }]}>
                            {priorityConfig.label}
                        </Text>
                    </View>
                </View>

                {/* Content */}
                <View style={styles.requestContent}>
                    <View style={[styles.typeIcon, {
                        backgroundColor: item.type === 'diagnosis' ? '#fee2e2' : COLORS.primary[50]
                    }]}>
                        <Ionicons
                            name={getTypeIcon(item.type)}
                            size={22}
                            color={item.type === 'diagnosis' ? COLORS.error : COLORS.primary[600]}
                        />
                    </View>
                    <View style={styles.contentInfo}>
                        <Text style={styles.requestTitle}>{item.title}</Text>
                        <Text style={styles.requestDescription} numberOfLines={2}>
                            {item.description}
                        </Text>
                    </View>
                </View>

                {/* Farmer & Crop Info */}
                <View style={styles.infoRow}>
                    <View style={styles.infoChip}>
                        <Ionicons name="person-outline" size={12} color={COLORS.neutral[500]} />
                        <Text style={styles.infoChipText}>{item.farmerName}</Text>
                    </View>
                    <View style={styles.infoChip}>
                        <Ionicons name="location-outline" size={12} color={COLORS.neutral[500]} />
                        <Text style={styles.infoChipText}>{item.farmerDistrict}</Text>
                    </View>
                    <View style={[styles.infoChip, { backgroundColor: COLORS.primary[50] }]}>
                        <Ionicons name="leaf-outline" size={12} color={COLORS.primary[600]} />
                        <Text style={[styles.infoChipText, { color: COLORS.primary[700] }]}>{item.cropName}</Text>
                    </View>
                </View>

                {/* Footer */}
                <View style={styles.cardFooter}>
                    <Text style={styles.timeText}>
                        {getRelativeTime(item.createdAt, i18n.language)}
                    </Text>
                    {item.status === 'pending' && (
                        <TouchableOpacity style={styles.respondButton}>
                            <Text style={styles.respondButtonText}>Respond</Text>
                            <Ionicons name="arrow-forward" size={14} color={COLORS.primary[600]} />
                        </TouchableOpacity>
                    )}
                    {item.imageUri && (
                        <View style={styles.hasImageBadge}>
                            <Ionicons name="image-outline" size={12} color={COLORS.neutral[400]} />
                            <Text style={styles.hasImageText}>Has Photo</Text>
                        </View>
                    )}
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <Header
                title="Farmer Requests"
                showBack
                onBackPress={() => navigation.goBack()}
            />

            {/* Stats Summary */}
            <View style={styles.statsSummary}>
                <View style={styles.summaryItem}>
                    <Text style={[styles.summaryValue, { color: COLORS.warning }]}>
                        {requests.filter(r => r.status === 'pending').length}
                    </Text>
                    <Text style={styles.summaryLabel}>Pending</Text>
                </View>
                <View style={styles.summaryDivider} />
                <View style={styles.summaryItem}>
                    <Text style={[styles.summaryValue, { color: COLORS.info }]}>
                        {requests.filter(r => r.status === 'in_review').length}
                    </Text>
                    <Text style={styles.summaryLabel}>In Review</Text>
                </View>
                <View style={styles.summaryDivider} />
                <View style={styles.summaryItem}>
                    <Text style={[styles.summaryValue, { color: COLORS.success }]}>
                        {requests.filter(r => r.status === 'completed').length}
                    </Text>
                    <Text style={styles.summaryLabel}>Completed</Text>
                </View>
            </View>

            {/* Filters */}
            <View style={styles.filtersContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersContent}>
                    {REQUEST_FILTERS.map(filter => (
                        <Chip
                            key={filter}
                            label={filter}
                            selected={activeFilter === filter}
                            onPress={() => setActiveFilter(filter)}
                            variant="outline"
                            size="sm"
                            style={{ marginRight: 8 }}
                        />
                    ))}
                </ScrollView>
            </View>

            {/* Requests List */}
            {filteredRequests.length > 0 ? (
                <FlatList
                    data={filteredRequests}
                    renderItem={renderRequest}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                />
            ) : (
                <EmptyState
                    icon="clipboard-outline"
                    title="No requests found"
                    description="All caught up! Check back later for new requests."
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
    statsSummary: {
        flexDirection: 'row',
        backgroundColor: '#ffffff',
        marginHorizontal: 16,
        marginTop: 12,
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: COLORS.neutral[100],
        ...SHADOW.sm,
    },
    summaryItem: {
        flex: 1,
        alignItems: 'center',
    },
    summaryValue: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    summaryLabel: {
        fontSize: 11,
        color: COLORS.neutral[400],
        marginTop: 2,
    },
    summaryDivider: {
        width: 1,
        height: 36,
        backgroundColor: COLORS.neutral[200],
    },
    filtersContainer: {
        paddingVertical: 12,
    },
    filtersContent: {
        paddingHorizontal: 16,
    },
    listContent: {
        padding: 16,
        paddingTop: 0,
        paddingBottom: 24,
    },
    requestCard: {
        backgroundColor: '#ffffff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: COLORS.neutral[100],
        ...SHADOW.sm,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 50,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '500',
        marginLeft: 4,
    },
    priorityDot: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 4,
    },
    priorityText: {
        fontSize: 12,
        fontWeight: '500',
    },
    requestContent: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    typeIcon: {
        width: 44,
        height: 44,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    contentInfo: {
        flex: 1,
    },
    requestTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: COLORS.neutral[800],
        marginBottom: 4,
    },
    requestDescription: {
        fontSize: 13,
        color: COLORS.neutral[500],
        lineHeight: 18,
    },
    infoRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 10,
    },
    infoChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.neutral[50],
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 50,
        marginRight: 6,
        marginBottom: 4,
    },
    infoChipText: {
        fontSize: 11,
        color: COLORS.neutral[600],
        marginLeft: 4,
        fontWeight: '500',
    },
    cardFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: COLORS.neutral[100],
    },
    timeText: {
        fontSize: 12,
        color: COLORS.neutral[400],
    },
    respondButton: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    respondButtonText: {
        fontSize: 13,
        fontWeight: '600',
        color: COLORS.primary[600],
        marginRight: 4,
    },
    hasImageBadge: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    hasImageText: {
        fontSize: 11,
        color: COLORS.neutral[400],
        marginLeft: 4,
    },
});

export default FarmerRequests;
