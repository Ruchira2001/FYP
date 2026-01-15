import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../utils/constants';

interface CropCardProps {
    id: string;
    name: string;
    nameSi: string;
    category: string;
    icon?: string;
    emoji?: string;
    color?: string;
    thumbnail?: string;
    onPress: () => void;
    isSaved?: boolean;
    isDownloaded?: boolean;
    showStatus?: boolean;
    size?: 'sm' | 'md' | 'lg';
    locale?: string;
}

const CropCard: React.FC<CropCardProps> = ({
    id,
    name,
    nameSi,
    category,
    icon,
    emoji,
    color = COLORS.primary[500],
    thumbnail,
    onPress,
    isSaved = false,
    isDownloaded = false,
    showStatus = true,
    size = 'md',
    locale = 'en',
}) => {
    const displayName = locale === 'si' ? nameSi : name;

    const getSizeStyles = () => {
        switch (size) {
            case 'sm':
                return {
                    width: 96,
                    iconSize: 32,
                    iconContainer: 48,
                    textSize: 12,
                };
            case 'md':
                return {
                    width: '100%', // Flexible width controlled by parent
                    iconSize: 40,
                    iconContainer: 64,
                    textSize: 14,
                };
            case 'lg':
                return {
                    width: '100%',
                    iconSize: 48,
                    iconContainer: 80,
                    textSize: 16,
                };
            default:
                return {
                    width: 144,
                    iconSize: 40,
                    iconContainer: 64,
                    textSize: 14,
                };
        }
    };

    const sizeStyles = getSizeStyles();

    const renderContent = () => {
        if (thumbnail) {
            return (
                <Image
                    source={{ uri: thumbnail }}
                    style={styles.thumbnail}
                    resizeMode="cover"
                />
            );
        }
        if (emoji) {
            return <Text style={{ fontSize: sizeStyles.iconSize }}>{emoji}</Text>;
        }
        return <Ionicons name="leaf" size={sizeStyles.iconSize} color={color} />;
    };

    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.7}
            style={[
                styles.card,
                size === 'lg' ? styles.cardHorizontal : styles.cardVertical,
                /* @ts-ignore */
                size !== 'lg' && size !== 'md' && { width: sizeStyles.width },
                size === 'md' && { width: '100%' }
            ]}
        >
            {/* Icon/Emoji Container */}
            <View
                style={[
                    styles.iconContainer,
                    {
                        width: sizeStyles.iconContainer,
                        height: sizeStyles.iconContainer,
                        backgroundColor: `${color}15`,
                        marginRight: size === 'lg' ? 16 : 0,
                        marginBottom: size === 'lg' ? 0 : 12,
                    }
                ]}
            >
                {renderContent()}
            </View>

            {/* Content */}
            <View style={size === 'lg' ? styles.contentHorizontal : styles.contentVertical}>
                <Text
                    style={[
                        styles.name,
                        { fontSize: sizeStyles.textSize },
                        size !== 'lg' && styles.textCenter
                    ]}
                    numberOfLines={size === 'lg' ? 1 : 2}
                >
                    {displayName}
                </Text>

                {size === 'lg' && (
                    <Text style={styles.category}>
                        {category}
                    </Text>
                )}
            </View>

            {/* Status Icons */}
            {showStatus && (isSaved || isDownloaded) && (
                <View style={[
                    styles.statusContainer,
                    size === 'lg' ? styles.statusStatic : styles.statusAbsolute
                ]}>
                    {isSaved && (
                        <View style={styles.statusIcon}>
                            <Ionicons name="bookmark" size={12} color={COLORS.primary[600]} />
                        </View>
                    )}
                    {isDownloaded && (
                        <View style={[styles.statusIcon, { backgroundColor: '#dcfce7' }]}>
                            <Ionicons name="cloud-download" size={12} color={COLORS.success} />
                        </View>
                    )}
                </View>
            )}

            {/* Arrow for large cards */}
            {size === 'lg' && (
                <Ionicons name="chevron-forward" size={20} color={COLORS.neutral[400]} />
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#ffffff',
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: COLORS.neutral[100],
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    cardVertical: {
        alignItems: 'center',
    },
    cardHorizontal: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        marginBottom: 12,
    },
    iconContainer: {
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    },
    thumbnail: {
        width: '100%',
        height: '100%',
    },
    contentHorizontal: {
        flex: 1,
    },
    contentVertical: {
        alignItems: 'center',
        width: '100%',
    },
    name: {
        fontWeight: '600',
        color: COLORS.neutral[800],
    },
    textCenter: {
        textAlign: 'center',
    },
    category: {
        fontSize: 12,
        color: COLORS.neutral[400],
        textTransform: 'capitalize',
        marginTop: 2,
    },
    statusContainer: {
        flexDirection: 'row',
    },
    statusAbsolute: {
        position: 'absolute',
        top: 8,
        right: 8,
    },
    statusStatic: {
        marginRight: 8,
    },
    statusIcon: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: COLORS.primary[100],
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 4,
    },
});

export default CropCard;
