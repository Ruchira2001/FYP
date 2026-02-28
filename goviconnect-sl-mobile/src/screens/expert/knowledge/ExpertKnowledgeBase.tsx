import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Header, EmptyState, Chip } from '../../../components';
import { COLORS, SHADOW } from '../../../utils/constants';
import { expertDashboardAPI } from '../../../services/api';

const CATEGORIES = ['All', 'Diseases', 'Pest Control', 'Fertilizers', 'Irrigation', 'Harvest'];

interface GuideItem {
    id: string;
    title: string;
    category: string;
    description: string;
    author: string;
    isExpertContributed: boolean;
    likes: number;
    views: number;
    createdAt: string;
    icon: string;
}

const ExpertKnowledgeBase: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('All');
    const [showMyContributions, setShowMyContributions] = useState(false);
    const [guides, setGuides] = useState<GuideItem[]>([]);

    useEffect(() => {
        loadGuides();
    }, []);

    const loadGuides = async () => {
        try {
            const res = await expertDashboardAPI.getKnowledgeBase();
            const data = Array.isArray(res.data.data) ? res.data.data : [];
            setGuides(data.map((g: any) => ({
                id: g._id || g.id,
                title: g.title || '',
                category: g.category || 'Diseases',
                description: g.description || '',
                author: g.author?.name || g.author || '',
                isExpertContributed: g.isExpertContributed || false,
                likes: g.likes || 0,
                views: g.views || 0,
                createdAt: g.createdAt || '',
                icon: g.icon || 'leaf',
            })));
        } catch (e) {
            console.error('Failed to load knowledge base:', e);
        }
    };

    const filteredGuides = guides.filter(guide => {
        const matchesSearch = guide.title.toLowerCase().includes(searchQuery.toLowerCase())
            || guide.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = activeCategory === 'All' || guide.category === activeCategory;
        const matchesContribution = !showMyContributions || guide.isExpertContributed;
        return matchesSearch && matchesCategory && matchesContribution;
    });

    const getCategoryIcon = (category: string): keyof typeof Ionicons.glyphMap => {
        switch (category) {
            case 'Diseases': return 'leaf';
            case 'Pest Control': return 'bug';
            case 'Fertilizers': return 'flask';
            case 'Irrigation': return 'water';
            case 'Harvest': return 'nutrition';
            default: return 'library';
        }
    };

    const getCategoryColor = (category: string): string => {
        switch (category) {
            case 'Diseases': return COLORS.error;
            case 'Pest Control': return COLORS.warning;
            case 'Fertilizers': return COLORS.success;
            case 'Irrigation': return COLORS.info;
            case 'Harvest': return COLORS.secondary[500];
            default: return COLORS.primary[500];
        }
    };

    const renderGuide = ({ item }: { item: GuideItem }) => (
        <TouchableOpacity style={styles.guideCard} activeOpacity={0.7}>
            <View style={styles.guideHeader}>
                <View style={[styles.guideIcon, { backgroundColor: getCategoryColor(item.category) + '15' }]}>
                    <Ionicons
                        name={getCategoryIcon(item.category)}
                        size={22}
                        color={getCategoryColor(item.category)}
                    />
                </View>
                <View style={styles.guideHeaderContent}>
                    <View style={[styles.categoryTag, { backgroundColor: getCategoryColor(item.category) + '15' }]}>
                        <Text style={[styles.categoryTagText, { color: getCategoryColor(item.category) }]}>
                            {item.category}
                        </Text>
                    </View>
                    {item.isExpertContributed && (
                        <View style={styles.contributedBadge}>
                            <Ionicons name="shield-checkmark" size={10} color={COLORS.primary[600]} />
                            <Text style={styles.contributedText}>Your Contribution</Text>
                        </View>
                    )}
                </View>
            </View>

            <Text style={styles.guideTitle}>{item.title}</Text>
            <Text style={styles.guideDescription} numberOfLines={2}>{item.description}</Text>

            <View style={styles.guideFooter}>
                <View style={styles.guideStats}>
                    <View style={styles.guideStat}>
                        <Ionicons name="heart" size={14} color={COLORS.error} />
                        <Text style={styles.guideStatText}>{item.likes}</Text>
                    </View>
                    <View style={styles.guideStat}>
                        <Ionicons name="eye" size={14} color={COLORS.neutral[400]} />
                        <Text style={styles.guideStatText}>{item.views}</Text>
                    </View>
                </View>
                <View style={styles.editButton}>
                    {item.isExpertContributed && (
                        <TouchableOpacity style={styles.editLink}>
                            <Ionicons name="create-outline" size={16} color={COLORS.primary[600]} />
                            <Text style={styles.editLinkText}>Edit</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <Header
                title="Knowledge Base"
                showBack
                onBackPress={() => navigation.goBack()}
                rightContent={
                    <TouchableOpacity style={styles.addGuideButton}>
                        <Ionicons name="add" size={20} color={COLORS.primary[600]} />
                    </TouchableOpacity>
                }
            />

            {/* Search */}
            <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color={COLORS.neutral[400]} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search guides..."
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

            {/* Toggle & Categories */}
            <View style={styles.toggleRow}>
                <TouchableOpacity
                    style={[styles.myContribToggle, showMyContributions && styles.myContribToggleActive]}
                    onPress={() => setShowMyContributions(!showMyContributions)}
                >
                    <Ionicons
                        name="shield-checkmark"
                        size={14}
                        color={showMyContributions ? '#ffffff' : COLORS.primary[600]}
                    />
                    <Text style={[
                        styles.myContribText,
                        showMyContributions && styles.myContribTextActive,
                    ]}>My Contributions</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.filtersContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersContent}>
                    {CATEGORIES.map(cat => (
                        <Chip
                            key={cat}
                            label={cat}
                            selected={activeCategory === cat}
                            onPress={() => setActiveCategory(cat)}
                            variant="outline"
                            size="sm"
                            style={{ marginRight: 8 }}
                        />
                    ))}
                </ScrollView>
            </View>

            {/* Guides List */}
            {filteredGuides.length > 0 ? (
                <FlatList
                    data={filteredGuides}
                    renderItem={renderGuide}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                />
            ) : (
                <EmptyState
                    icon="library-outline"
                    title="No guides found"
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
    addGuideButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: COLORS.primary[50],
        borderWidth: 1,
        borderColor: COLORS.primary[200],
        alignItems: 'center',
        justifyContent: 'center',
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
    toggleRow: {
        paddingHorizontal: 16,
        paddingTop: 12,
    },
    myContribToggle: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 50,
        backgroundColor: COLORS.primary[50],
        borderWidth: 1,
        borderColor: COLORS.primary[200],
    },
    myContribToggleActive: {
        backgroundColor: COLORS.primary[500],
        borderColor: COLORS.primary[500],
    },
    myContribText: {
        fontSize: 12,
        fontWeight: '500',
        color: COLORS.primary[600],
        marginLeft: 4,
    },
    myContribTextActive: {
        color: '#ffffff',
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
    guideCard: {
        backgroundColor: '#ffffff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: COLORS.neutral[100],
        ...SHADOW.sm,
    },
    guideHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 10,
    },
    guideIcon: {
        width: 44,
        height: 44,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    guideHeaderContent: {
        flex: 1,
    },
    categoryTag: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 50,
        alignSelf: 'flex-start',
        marginBottom: 4,
    },
    categoryTagText: {
        fontSize: 11,
        fontWeight: '500',
    },
    contributedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    contributedText: {
        fontSize: 11,
        color: COLORS.primary[600],
        fontWeight: '500',
        marginLeft: 4,
    },
    guideTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.neutral[800],
        marginBottom: 4,
    },
    guideDescription: {
        fontSize: 13,
        color: COLORS.neutral[500],
        lineHeight: 18,
        marginBottom: 12,
    },
    guideFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: COLORS.neutral[100],
    },
    guideStats: {
        flexDirection: 'row',
    },
    guideStat: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 16,
    },
    guideStatText: {
        fontSize: 12,
        color: COLORS.neutral[500],
        marginLeft: 4,
        fontWeight: '500',
    },
    editButton: {},
    editLink: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    editLinkText: {
        fontSize: 12,
        color: COLORS.primary[600],
        fontWeight: '500',
        marginLeft: 4,
    },
});

export default ExpertKnowledgeBase;
