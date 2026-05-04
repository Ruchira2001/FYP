import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ActivityIndicator,
    TouchableOpacity,
    Animated,
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

// ─── Agriculture background images per weather condition ─────────────────────

const WEATHER_IMAGES: Record<string, string[]> = {
    clear: [
        'https://images.pexels.com/photos/974314/pexels-photo-974314.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/2382665/pexels-photo-2382665.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/1084540/pexels-photo-1084540.jpeg?auto=compress&cs=tinysrgb&w=800',
    ],
    cloudy: [
        'https://images.pexels.com/photos/247599/pexels-photo-247599.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/1486785/pexels-photo-1486785.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/461940/pexels-photo-461940.jpeg?auto=compress&cs=tinysrgb&w=800',
    ],
    foggy: [
        'https://images.pexels.com/photos/1179229/pexels-photo-1179229.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/235621/pexels-photo-235621.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/247599/pexels-photo-247599.jpeg?auto=compress&cs=tinysrgb&w=800',
    ],
    rainy: [
        'https://images.pexels.com/photos/1118873/pexels-photo-1118873.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/1105019/pexels-photo-1105019.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/459501/pexels-photo-459501.jpeg?auto=compress&cs=tinysrgb&w=800',
    ],
    storm: [
        'https://images.pexels.com/photos/1430770/pexels-photo-1430770.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/1118873/pexels-photo-1118873.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/2382665/pexels-photo-2382665.jpeg?auto=compress&cs=tinysrgb&w=800',
    ],
};

function getWeatherImageSet(code: number): string[] {
    if (code === 0) return WEATHER_IMAGES.clear;
    if (code <= 3) return WEATHER_IMAGES.cloudy;
    if (code <= 48) return WEATHER_IMAGES.foggy;
    if (code <= 82) return WEATHER_IMAGES.rainy;
    return WEATHER_IMAGES.storm;
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
    const [bgIndex, setBgIndex] = useState(0);
    const bgFade = useRef(new Animated.Value(1)).current;

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

    // Auto-cycle background images every 5 seconds with a fade transition
    useEffect(() => {
        if (!weather) return;
        const images = getWeatherImageSet(weather.weatherCode);
        setBgIndex(0);
        bgFade.setValue(1);
        const timer = setInterval(() => {
            Animated.timing(bgFade, { toValue: 0.1, duration: 700, useNativeDriver: true }).start(() => {
                setBgIndex(prev => (prev + 1) % images.length);
                Animated.timing(bgFade, { toValue: 1, duration: 700, useNativeDriver: true }).start();
            });
        }, 5000);
        return () => clearInterval(timer);
    }, [weather]);

    // ── Loading ────────────────────────────────────────────────────────────────
    if (loading) {
        return (
            <View style={styles.cardPlain}>
                <ActivityIndicator size="small" color={COLORS.primary[500]} />
                <Text style={styles.loadingText}>Fetching weather…</Text>
            </View>
        );
    }

    // ── Permission denied ──────────────────────────────────────────────────────
    if (permissionDenied) {
        return (
            <View style={styles.cardPlain}>
                <Ionicons name="location-outline" size={28} color={COLORS.neutral[400]} />
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
            <TouchableOpacity style={styles.cardPlain} onPress={load} activeOpacity={0.8}>
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
    const bgImages = getWeatherImageSet(weather.weatherCode);

    return (
        <View style={styles.card}>
            {/* Animated agriculture background image */}
            <Animated.Image
                source={{ uri: bgImages[bgIndex] }}
                style={[StyleSheet.absoluteFillObject, { opacity: bgFade }]}
                resizeMode="cover"
            />

            {/* Dark overlay for text readability */}
            <View style={styles.bgOverlay} pointerEvents="none" />

            {/* Card content */}
            <View style={styles.cardContent}>
                {/* Left: info */}
                <View style={styles.info}>
                    {/* Location row */}
                    <View style={styles.locationRow}>
                        <Ionicons name="location" size={14} color="rgba(255,255,255,0.8)" />
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
                            <Ionicons name="water-outline" size={12} color="rgba(255,255,255,0.7)" />
                            <Text style={styles.detailText}>{weather.humidity}%</Text>
                        </View>
                        <View style={styles.detailItem}>
                            <Ionicons name="speedometer-outline" size={12} color="rgba(255,255,255,0.7)" />
                            <Text style={styles.detailText}>{weather.windSpeed} km/h</Text>
                        </View>
                    </View>

                    {/* Advice badge */}
                    <View style={[styles.adviceBadge, { backgroundColor: color + '40' }]}>
                        <Text style={styles.adviceText} numberOfLines={1}>
                            {advice}
                        </Text>
                    </View>
                </View>

                {/* Right: weather icon + dot indicators + refresh */}
                <View style={styles.iconColumn}>
                    <Ionicons name={icon} size={60} color={color} />
                    <View style={styles.dotRow}>
                        {bgImages.map((_, i) => (
                            <View key={i} style={[styles.dot, i === bgIndex && styles.dotActive]} />
                        ))}
                    </View>
                    <TouchableOpacity onPress={load} style={styles.refreshBtn} activeOpacity={0.7}>
                        <Ionicons name="refresh-outline" size={14} color="rgba(255,255,255,0.7)" />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    // Image-background card (success state)
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
        backgroundColor: COLORS.primary[700], // fallback while image loads
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
    // Plain white card (loading / error states)
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
        color: 'rgba(255,255,255,0.85)',
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
    dotRow: {
        flexDirection: 'row',
        gap: 4,
        alignItems: 'center',
    },
    dot: {
        width: 5,
        height: 5,
        borderRadius: 3,
        backgroundColor: 'rgba(255,255,255,0.35)',
    },
    dotActive: {
        backgroundColor: '#ffffff',
        width: 10,
    },
    refreshBtn: {
        padding: 4,
    },
});

export default WeatherCard;
