import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ActivityIndicator,
    TouchableOpacity,
} from 'react-native';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
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
    // farmer
    if (code === 0) return 'Great day for field work & harvesting!';
    if (code <= 3) return 'Good day for harvesting!';
    if (code <= 48) return 'Watch out for crop diseases in fog';
    if (code <= 57) return 'Light rain – protect your harvest';
    if (code <= 67) return 'Protect your crops from heavy rain';
    if (code <= 82) return 'Avoid spraying pesticides today';
    return 'Stay indoors and protect your crops!';
}

// ─── Open-Meteo fetch ─────────────────────────────────────────────────────────

interface WeatherData {
    temperature: number;
    weatherCode: number;
    humidity: number;
    windSpeed: number;
    locationName: string;
}

async function fetchWeather(lat: number, lon: number): Promise<WeatherData> {
    // 1. Weather from Open-Meteo (free, no API key)
    const weatherUrl =
        `https://api.open-meteo.com/v1/forecast` +
        `?latitude=${lat}&longitude=${lon}` +
        `&current=temperature_2m,weather_code,relative_humidity_2m,wind_speed_10m`;

    const weatherRes = await fetch(weatherUrl);
    if (!weatherRes.ok) throw new Error('Weather fetch failed');
    const weatherJson = await weatherRes.json();
    const current = weatherJson.current;

    // 2. Reverse geocode with Nominatim (free, no API key)
    let locationName = 'Your Location';
    try {
        const geoUrl =
            `https://nominatim.openstreetmap.org/reverse` +
            `?format=json&lat=${lat}&lon=${lon}&zoom=10`;
        const geoRes = await fetch(geoUrl, {
            headers: { 'Accept-Language': 'en' },
        });
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
    } catch {
        // reverse geocode is best-effort
    }

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
    /** Fallback district/location name from user profile */
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
            // If reverse geocode gave a generic result, use the profile fallback
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
    }, [load]);

    // ── Loading ────────────────────────────────────────────────────────────────
    if (loading) {
        return (
            <View style={styles.card}>
                <ActivityIndicator size="small" color={COLORS.primary[500]} />
                <Text style={styles.loadingText}>Fetching weather…</Text>
            </View>
        );
    }

    // ── Permission denied ──────────────────────────────────────────────────────
    if (permissionDenied) {
        return (
            <View style={styles.card}>
                <Ionicons name="location-off-outline" size={28} color={COLORS.neutral[400]} />
                <View style={styles.errorContent}>
                    <Text style={styles.errorTitle}>Location access denied</Text>
                    <Text style={styles.errorSubtitle}>
                        Enable location permission to see real-time weather
                    </Text>
                </View>
            </View>
        );
    }

    // ── Fetch error ────────────────────────────────────────────────────────────
    if (error || !weather) {
        return (
            <TouchableOpacity style={styles.card} onPress={load} activeOpacity={0.8}>
                <Ionicons name="cloud-offline-outline" size={28} color={COLORS.neutral[400]} />
                <View style={styles.errorContent}>
                    <Text style={styles.errorTitle}>Couldn't load weather</Text>
                    <Text style={styles.errorSubtitle}>Tap to retry</Text>
                </View>
            </TouchableOpacity>
        );
    }

    // ── Success ────────────────────────────────────────────────────────────────
    const { condition, icon, color } = getWeatherInfo(weather.weatherCode);
    const advice = getFarmingAdvice(weather.weatherCode, role);

    return (
        <View style={styles.card}>
            {/* Left: info */}
            <View style={styles.info}>
                {/* Location row */}
                <View style={styles.locationRow}>
                    <Ionicons name="location" size={14} color={COLORS.neutral[500]} />
                    <Text style={styles.locationText} numberOfLines={1}>
                        {weather.locationName}
                    </Text>
                </View>

                {/* Temperature + condition */}
                <View style={styles.mainRow}>
                    <Text style={styles.temp}>{weather.temperature}°C</Text>
                    <Text style={styles.condition}>{condition}</Text>
                </View>

                {/* Extra details */}
                <View style={styles.detailRow}>
                    <View style={styles.detailItem}>
                        <Ionicons name="water-outline" size={12} color={COLORS.neutral[400]} />
                        <Text style={styles.detailText}>{weather.humidity}%</Text>
                    </View>
                    <View style={styles.detailItem}>
                        <Ionicons name="speedometer-outline" size={12} color={COLORS.neutral[400]} />
                        <Text style={styles.detailText}>{weather.windSpeed} km/h</Text>
                    </View>
                </View>

                {/* Advice badge */}
                <View style={[styles.adviceBadge, { backgroundColor: color + '20' }]}>
                    <Text style={[styles.adviceText, { color }]} numberOfLines={1}>
                        {advice}
                    </Text>
                </View>
            </View>

            {/* Right: icon + refresh */}
            <View style={styles.iconColumn}>
                <Ionicons name={icon} size={60} color={color} />
                <TouchableOpacity onPress={load} style={styles.refreshBtn} activeOpacity={0.7}>
                    <Ionicons name="refresh-outline" size={14} color={COLORS.neutral[400]} />
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
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
    info: {
        flex: 1,
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    locationText: {
        fontSize: 13,
        color: COLORS.neutral[500],
        marginLeft: 3,
        fontWeight: '500',
        flexShrink: 1,
    },
    mainRow: {
        marginBottom: 6,
    },
    temp: {
        fontSize: 32,
        fontWeight: 'bold',
        color: COLORS.neutral[800],
        lineHeight: 38,
    },
    condition: {
        fontSize: 15,
        color: COLORS.neutral[600],
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
        color: COLORS.neutral[400],
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
    },
    iconColumn: {
        alignItems: 'center',
        marginLeft: 12,
    },
    refreshBtn: {
        marginTop: 6,
        padding: 4,
    },
});

export default WeatherCard;
