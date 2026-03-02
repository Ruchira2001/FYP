import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '../../../components';
import { COLORS, SHADOW } from '../../../utils/constants';
import { Ionicons } from '@expo/vector-icons';
import { shopAPI } from '../../../services/api';

interface Order {
    id: string;
    supplier: string;
    items: string;
    total: number;
    status: string;
    date: string;
}

const getStatusColor = (status: string) => {
    switch (status) {
        case 'Pending': return COLORS.warning;
        case 'Processing': return COLORS.info;
        case 'Delivered': return COLORS.success;
        case 'Cancelled': return COLORS.error;
        default: return COLORS.neutral[500];
    }
};

const ShopOrders: React.FC = () => {
    const [orders, setOrders] = useState<Order[]>([]);

    useEffect(() => {
        loadOrders();
    }, []);

    const loadOrders = async () => {
        try {
            const res = await shopAPI.getOrders();
            const data = Array.isArray(res.data.data) ? res.data.data : [];
            setOrders(data.map((o: any) => ({
                id: o._id || o.id || '',
                supplier: o.supplier?.name || o.supplier || '',
                items: o.items?.map((i: any) => `${i.name} (${i.quantity})`).join(', ') || o.items || '',
                total: o.total || 0,
                status: o.status || 'Pending',
                date: o.createdAt ? new Date(o.createdAt).toLocaleDateString() : '',
            })));
        } catch (e) {
            console.error('Failed to load orders:', e);
        }
    };

    const renderOrder = ({ item }: { item: Order }) => (
        <TouchableOpacity style={styles.card}>
            <View style={styles.cardHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={[styles.iconContainer, { backgroundColor: COLORS.primary[50] }]}>
                        <Ionicons name="receipt-outline" size={20} color={COLORS.primary[600]} />
                    </View>
                    <View style={{ marginLeft: 12 }}>
                        <Text style={styles.supplierName}>{item.supplier}</Text>
                        <Text style={styles.orderId}>#{item.id}</Text>
                    </View>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
                    <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>{item.status}</Text>
                </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.cardBody}>
                <Text style={styles.itemsText} numberOfLines={2}>{item.items}</Text>
                <View style={styles.footerRow}>
                    <Text style={styles.dateText}>{item.date}</Text>
                    <Text style={styles.totalText}>Rs. {(item.total ?? 0).toLocaleString()}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <Header title="My Orders" showNotifications />
            <FlatList
                data={orders}
                renderItem={renderOrder}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    listContent: {
        padding: 16,
    },
    card: {
        backgroundColor: '#ffffff',
        borderRadius: 16,
        marginBottom: 16,
        padding: 16,
        ...SHADOW.sm,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    supplierName: {
        fontSize: 15,
        fontWeight: 'bold',
        color: COLORS.neutral[800],
    },
    orderId: {
        fontSize: 12,
        color: COLORS.neutral[500],
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        fontSize: 12,
        fontWeight: 'bold',
    },
    divider: {
        height: 1,
        backgroundColor: COLORS.neutral[100],
        marginVertical: 12,
    },
    cardBody: {

    },
    itemsText: {
        fontSize: 14,
        color: COLORS.neutral[600],
        marginBottom: 12,
        lineHeight: 20,
    },
    footerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    dateText: {
        fontSize: 12,
        color: COLORS.neutral[400],
    },
    totalText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.neutral[900],
    },
});

export default ShopOrders;
