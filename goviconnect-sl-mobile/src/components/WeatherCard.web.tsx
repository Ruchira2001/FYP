/**
 * WeatherCard.web.tsx — web-only version.
 * react-native-maps is a native-only library; this file is the web twin
 * (Metro automatically picks *.web.* over the base file on web builds).
 * The map-picker feature is replaced with a simple location display.
 */
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ActivityIndicator,
    TouchableOpacity,
    Animated,
    Easing,
} from 'react-native';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../utils/constants';

// ─── WMO weather code helpers ─────────────────────────────────────────────────

interface WeatherInfo {
    condition: string;
    icon: keyof typeof Ionicons.glyphMap;
    color: string;
}

function getWeatherInfo(code: number): WeatherInfo {
    if (code === 0) return { condition: 'Clear Sky', icon: 'sunny', color: '#f59e0b' };
    if (code <= 3) return { condition: 'Partly Cloudy', icon: 'partly-sunny', color: '#f59e0b' };
    if (code <= 48) return { condition: 'Foggy', icon: 'cloud', color: '#6b7280' };
    if (code <= 57) return { condition: 'Light Drizzle', icon: 'rainy-outline', color: '#60a5fa' };
    if (code <= 67) return { condition: 'Rainy', icon: 'rainy', color: '#3b82f6' };
    if (code <= 77) return { condition: 'Snowy', icon: 'snow', color: '#93c5fd' };
    if (code <= 82) return { condition: 'Rain Showers', icon: 'rainy', color: '#2563eb' };
    if (code <= 99) return { condition: 'Thunderstorm', icon: 'thunderstorm', color: '#1d4ed8' };
    return { condition: 'Cloudy', icon: 'cloud', color: '#6b7280' };
}

function getFarmingAdvice(code: number, role: 'farmer' | 'expert'): string {
    if (role === 'expert') {
        if (code === 0) return 'Perfect conditions for field visits';
        if (code <= 3) return 'Good day for farmer consultations';
        if (code <= 48) return 'Monitor moisture-related crop diseases';
        if (code <= 57) return 'Advise farmers on light rain protocols';
        if (code <= 67) return 'Advise on drainage & disease prevention';
        if (code <= 82) return 'Check drainage in farmer fields';
        return 'Alert farmers about storm risks';
    }
    if (code === 0) return 'Great day for field work & harvesting!';
    if (code <= 3) return 'Good day for harvesting!';
    if (code <= 48) return 'Watch out for crop diseases in fog';
    if (code <= 57) return 'Light rain – protect your harvest';
    if (code <= 67) return 'Protect your crops from heavy rain';
    if (code <= 82) return 'Avoid spraying pesticides today';
    return 'Stay indoors and protect your crops!';
}

type WeatherBg = 'clear' | 'cloudy' | 'foggy' | 'drizzle' | 'rainy' | 'snowy' | 'storm';

function getWeatherBg(code: number): WeatherBg {
    if (code === 0) return 'clear';
    if (code <= 3) return 'cloudy';
    if (code <= 48) return 'foggy';
    if (code <= 57) return 'drizzle';
    if (code <= 77) return code >= 70 ? 'snowy' : 'rainy';
    if (code <= 82) return 'rainy';
    return 'storm';
}

const BG_GRADIENTS: Record<WeatherBg, [string, string, string]> = {
    clear:   ['#0ea5e9', '#0284c7', '#075985'],
    cloudy:  ['#475569', '#334155', '#1e293b'],
    foggy:   ['#6b7280', '#4b5563', '#374151'],
    drizzle: ['#1e3a5f', '#1a4a7a', '#0d1f3f'],
    rainy:   ['#0f172a', '#1e3a5f', '#0c1a2e'],
    snowy:   ['#bfdbfe', '#93c5fd', '#60a5fa'],
    storm:   ['#020617', '#0f172a', '#030712'],
};

// ─── Open-Meteo fetch ─────────────────────────────────────────────────────────

interface WeatherData {
    temperature: number;
    weatherCode: number;
    humidity: number;
    windSpeed: number;
    locationName: string;
}

async function fetchWeather(lat: number, lon: number): Promise<WeatherData> {
    const weatherUrl =
        `https://api.open-meteo.com/v1/forecast` +
        `?latitude=${lat}&longitude=${lon}` +
        `&current=temperature_2m,weather_code,relative_humidity_2m,wind_speed_10m`;

    const weatherRes = await fetch(weatherUrl);
    if (!weatherRes.ok) throw new Error('Weather fetch failed');
    const weatherJson = await weatherRes.json();
    const current = weatherJson.current;

    let locationName = 'Your Location';
    try {
        const geoUrl =
            `https://nominatim.openstreetmap.org/reverse` +
            `?format=json&lat=${lat}&lon=${lon}&zoom=10`;
        const geoRes = await fetch(geoUrl, { headers: { 'Accept-Language': 'en' } });
        if (geoRes.ok) {
            const geoJson = await geoRes.json();
            locationName =
                geoJson.address?.county ||
                geoJson.address?.city ||
                geoJson.address?.town ||
                geoJson.address?.village ||
                geoJson.address?.state ||
                'Sri Lanka';
        }
    } catch { /* best-effort */ }

    return {
        temperature: Math.round(current.temperature_2m),
        weatherCode: current.weather_code,
        humidity: Math.round(current.relative_humidity_2m),
        windSpeed: Math.round(current.wind_speed_10m),
        locationName,
    };
}

// ─── Component ────────────────────────────────────────────────────────────────

interface WeatherCardProps {
    role?: 'farmer' | 'expert';
    fallbackLocation?: string;
}

const WeatherCard: React.FC<WeatherCardProps> = ({
    role = 'farmer',
    fallbackLocation,
}) => {
    const [weather, setWeather] = useState<WeatherData | null>(null);
    const [loading, setLoading] = useState(true);
    const [permissionDenied, setPermissionDenied] = useState(false);
    const [error, setError] = useState(false);

    const load = useCallback(async () => {
        setLoading(true);
        setError(false);
        setPermissionDenied(false);
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setPermissionDenied(true);
                setLoading(false);
                return;
            }
            const loc = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.Balanced,
            });
            const data = await fetchWeather(loc.coords.latitude, loc.coords.longitude);
            if (data.locationName === 'Your Location' && fallbackLocation) {
                data.locationName = fallbackLocation;
            }
            setWeather(data);
        } catch {
            setError(true);
        } finally {
            setLoading(false);
        }
    }, [fallbackLocation]);

    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (loading) {
        return (
            <View style={styles.cardPlain}>
                <ActivityIndicator size="small" color={COLORS.primary[500]} />
                <Text style={styles.loadingText}>Fetching weather…</Text>
            </View>
        );
    }

    if (permissionDenied) {
        return (
            <View style={styles.cardPlain}>
                <Ionicons name="location-outline" size={28} color={COLORS.neutral[400]} />
                <View style={styles.errorContent}>
                    <Text style={styles.errorTitle}>Location access denied</Text>
                    <Text style={styles.errorSubtitle}>Enable location permission to see real-time weather</Text>
                </View>
            </View>
        );
    }

    if (error || !weather) {
        return (
            <TouchableOpacity style={styles.cardPlain} onPress={load} activeOpacity={0.8}>
                <Ionicons name="cloud-offline-outline" size={28} color={COLORS.neutral[400]} />
                <View style={styles.errorContent}>
                    <Text style={styles.errorTitle}>Couldn't load weather</Text>
                    <Text style={styles.errorSubtitle}>Tap to retry</Text>
                </View>
            </TouchableOpacity>
        );
    }

    const { condition, icon, color } = getWeatherInfo(weather.weatherCode);
    const advice = getFarmingAdvice(weather.weatherCode, role);
    const bg = getWeatherBg(weather.weatherCode);

    return (
        <View style={styles.card}>
            <LinearGradient
                colors={BG_GRADIENTS[bg]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFillObject}
            />
            <View style={styles.bgOverlay} pointerEvents="none" />

            <View style={styles.cardContent}>
                <View style={styles.info}>
                    {/* Location row — map picker not available on web */}
                    <View style={styles.locationRow}>
                        <Ionicons name="location" size={14} color="rgba(255,255,255,0.8)" />
                        <Text style={styles.locationText} numberOfLines={1}>
                            {weather.locationName}
                        </Text>
                    </View>

                    <View style={styles.mainRow}>
                        <Text style={styles.temp}>{weather.temperature}°C</Text>
                        <Text style={styles.condition}>{condition}</Text>
                    </View>

                    <View style={styles.detailRow}>
                        <View style={styles.detailItem}>
                            <Ionicons name="water-outline" size={12} color="rgba(255,255,255,0.7)" />
                            <Text style={styles.detailText}>{weather.humidity}%</Text>
                        </View>
                        <View style={styles.detailItem}>
                            <Ionicons name="speedometer-outline" size={12} color="rgba(255,255,255,0.7)" />
                            <Text style={styles.detailText}>{weather.windSpeed} km/h</Text>
                        </View>
                    </View>

                    <View style={[styles.adviceBadge, { backgroundColor: color + '40' }]}>
                        <Text style={styles.adviceText} numberOfLines={1}>{advice}</Text>
                    </View>
                </View>

                <View style={styles.iconColumn}>
                    <Ionicons name={icon} size={60} color={color} />
                    <TouchableOpacity onPress={load} style={styles.refreshBtn} activeOpacity={0.7}>
                        <Ionicons name="refresh-outline" size={14} color="rgba(255,255,255,0.7)" />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        borderRadius: 20,
        overflow: 'hidden',
        minHeight: 130,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.12)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.18,
        shadowRadius: 10,
        elevation: 5,
        backgroundColor: COLORS.primary[700],
    },
    bgOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 22, 8, 0.54)',
    },
    cardContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 20,
    },
    cardPlain: {
        backgroundColor: '#ffffff',
        borderRadius: 20,
        padding: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: COLORS.neutral[100],
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    loadingText: {
        marginLeft: 10,
        fontSize: 14,
        color: COLORS.neutral[500],
    },
    errorContent: {
        marginLeft: 12,
        flex: 1,
    },
    errorTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.neutral[700],
    },
    errorSubtitle: {
        fontSize: 12,
        color: COLORS.neutral[400],
        marginTop: 2,
    },
    info: { flex: 1 },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    locationText: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.85)',
        marginLeft: 3,
        fontWeight: '500',
        flexShrink: 1,
    },
    mainRow: { marginBottom: 6 },
    temp: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#ffffff',
        lineHeight: 38,
    },
    condition: {
        fontSize: 15,
        color: 'rgba(255,255,255,0.85)',
        fontWeight: '500',
    },
    detailRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 8,
    },
    detailItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
    },
    detailText: {
        fontSize: 11,
        color: 'rgba(255,255,255,0.75)',
    },
    adviceBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    adviceText: {
        fontSize: 11,
        fontWeight: '600',
        color: '#ffffff',
    },
    iconColumn: {
        alignItems: 'center',
        marginLeft: 12,
        gap: 6,
    },
    refreshBtn: { padding: 4 },
});

export default WeatherCard;
