import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ActivityIndicator,
    TouchableOpacity,
    Animated,
    Easing,
    Modal,
    SafeAreaView,
    Platform,
} from 'react-native';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import MapView, { Marker, MapPressEvent, Region } from 'react-native-maps';
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

// ─── Animated weather backgrounds ─────────────────────────────────────────────

type WeatherBg = 'clear' | 'cloudy' | 'foggy' | 'drizzle' | 'rainy' | 'snowy' | 'storm';

function getWeatherBg(code: number): WeatherBg {
    if (code === 0)   return 'clear';
    if (code <= 3)    return 'cloudy';
    if (code <= 48)   return 'foggy';
    if (code <= 57)   return 'drizzle';
    if (code <= 77)   return code >= 70 ? 'snowy' : 'rainy';
    if (code <= 82)   return 'rainy';
    return 'storm';
}

const BG_GRADIENTS: Record<WeatherBg, [string, string, string]> = {
    clear:   ['#0ea5e9', '#0284c7', '#075985'],   // bright sky blue
    cloudy:  ['#475569', '#334155', '#1e293b'],   // slate
    foggy:   ['#6b7280', '#4b5563', '#374151'],   // grey mist
    drizzle: ['#1e3a5f', '#1a4a7a', '#0d1f3f'],   // cool navy
    rainy:   ['#0f172a', '#1e3a5f', '#0c1a2e'],   // deep rainy night
    snowy:   ['#bfdbfe', '#93c5fd', '#60a5fa'],   // light icy blue
    storm:   ['#020617', '#0f172a', '#030712'],   // near black storm
};

const CARD_H = 150;

// ─────────────────────────────────────────────────────
// RAIN / DRIZZLE / STORM  (wind-aware)
// ─────────────────────────────────────────────────────
interface RainProps {
    windSpeed: number;   // km/h – drives slant angle
    intensity: 'light' | 'moderate' | 'heavy';
    color?: string;
}

const RainLayer: React.FC<RainProps> = ({ windSpeed, intensity, color = 'rgba(147,210,255,0.6)' }) => {
    const count    = intensity === 'light' ? 12 : intensity === 'moderate' ? 22 : 36;
    const dropH    = intensity === 'light' ? 14 : intensity === 'moderate' ? 20 : 28;
    const dropW    = intensity === 'light' ? 1  : intensity === 'moderate' ? 1.5 : 2;
    const speedMs  = intensity === 'light' ? 900 : intensity === 'moderate' ? 650 : 450;

    // Wind slant: 0 km/h → 0°, 40+ km/h → ~35°
    const slantX   = Math.min(windSpeed / 40, 1) * 35; // px horizontal offset over CARD_H

    const anims = useRef(
        Array.from({ length: count }, () => new Animated.Value(Math.random()))
    ).current;

    // Random positions seeded once
    const cols = useRef(
        Array.from({ length: count }, () => Math.random() * 110 - 5) // -5% to 105%
    ).current;
    const delays = useRef(
        Array.from({ length: count }, (_, i) => (i / count) * speedMs)
    ).current;
    const speeds = useRef(
        Array.from({ length: count }, () => speedMs * (0.85 + Math.random() * 0.3))
    ).current;

    useEffect(() => {
        const loops = anims.map((anim, i) => {
            anim.setValue(delays[i] / speeds[i]); // stagger start positions
            return Animated.loop(
                Animated.timing(anim, {
                    toValue: 1,
                    duration: speeds[i],
                    easing: Easing.linear,
                    useNativeDriver: true,
                })
            );
        });
        loops.forEach(l => l.start());
        return () => loops.forEach(l => l.stop());
    }, []);

    return (
        <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
            {anims.map((anim, i) => {
                const tY = anim.interpolate({
                    inputRange:  [0, 1],
                    outputRange: [-dropH - 10, CARD_H + dropH],
                });
                const tX = anim.interpolate({
                    inputRange:  [0, 1],
                    outputRange: [0, slantX],
                });
                return (
                    <Animated.View
                        key={i}
                        style={{
                            position: 'absolute',
                            left: `${cols[i]}%` as any,
                            top: 0,
                            width: dropW,
                            height: dropH,
                            borderRadius: dropW,
                            backgroundColor: color,
                            transform: [{ translateY: tY }, { translateX: tX }],
                        }}
                    />
                );
            })}
        </View>
    );
};

// ─────────────────────────────────────────────────────
// SNOW FLAKES (wind-aware sway)
// ─────────────────────────────────────────────────────
interface SnowProps { windSpeed: number; }

const SnowLayer: React.FC<SnowProps> = ({ windSpeed }) => {
    const count = 20;
    const fallAnims = useRef(
        Array.from({ length: count }, () => new Animated.Value(Math.random()))
    ).current;
    const swayAnims = useRef(
        Array.from({ length: count }, () => new Animated.Value(0))
    ).current;

    const cols  = useRef(Array.from({ length: count }, () => Math.random() * 100)).current;
    const sizes = useRef(Array.from({ length: count }, () => 4 + Math.random() * 5)).current;
    const speeds = useRef(Array.from({ length: count }, () => 2500 + Math.random() * 2000)).current;

    // wind sway amplitude
    const swayAmp = Math.min(windSpeed / 2, 20);

    useEffect(() => {
        const fallLoops = fallAnims.map((anim, i) =>
            Animated.loop(
                Animated.timing(anim, {
                    toValue: 1,
                    duration: speeds[i],
                    easing: Easing.linear,
                    useNativeDriver: true,
                })
            )
        );
        const swayLoops = swayAnims.map((anim, i) =>
            Animated.loop(
                Animated.sequence([
                    Animated.timing(anim, { toValue: 1,  duration: 1200 + i * 80, useNativeDriver: true }),
                    Animated.timing(anim, { toValue: -1, duration: 1200 + i * 80, useNativeDriver: true }),
                ])
            )
        );
        [...fallLoops, ...swayLoops].forEach(l => l.start());
        return () => [...fallLoops, ...swayLoops].forEach(l => l.stop());
    }, []);

    return (
        <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
            {fallAnims.map((fallAnim, i) => {
                const tY = fallAnim.interpolate({ inputRange: [0, 1], outputRange: [-10, CARD_H + 10] });
                const tX = swayAnims[i].interpolate({ inputRange: [-1, 1], outputRange: [-swayAmp, swayAmp] });
                return (
                    <Animated.View
                        key={i}
                        style={{
                            position: 'absolute',
                            left: `${cols[i]}%` as any,
                            top: 0,
                            width: sizes[i],
                            height: sizes[i],
                            borderRadius: sizes[i] / 2,
                            backgroundColor: 'rgba(255,255,255,0.82)',
                            transform: [{ translateY: tY }, { translateX: tX }],
                        }}
                    />
                );
            })}
        </View>
    );
};

// ─────────────────────────────────────────────────────
// SUN RAYS  (rotating rays + warm glow)
// ─────────────────────────────────────────────────────
const SunRays: React.FC = () => {
    const rotate  = useRef(new Animated.Value(0)).current;
    const glow    = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.loop(
            Animated.timing(rotate, { toValue: 1, duration: 18000, easing: Easing.linear, useNativeDriver: true })
        ).start();
        Animated.loop(
            Animated.sequence([
                Animated.timing(glow, { toValue: 1, duration: 2000, useNativeDriver: true }),
                Animated.timing(glow, { toValue: 0, duration: 2000, useNativeDriver: true }),
            ])
        ).start();
    }, []);

    const RAY_COUNT = 10;
    const CARD_W    = 400; // generous over-estimate
    const sunX      = CARD_W * 0.78;
    const sunY      = CARD_H * 0.25;
    const rayLen    = 80;

    return (
        <View style={StyleSheet.absoluteFillObject} pointerEvents="none" >
            {/* Rotating rays */}
            <Animated.View
                style={{
                    position: 'absolute',
                    left: sunX,
                    top: sunY,
                    width: 0,
                    height: 0,
                    transform: [{ rotate: rotate.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] }) }],
                }}
            >
                {Array.from({ length: RAY_COUNT }).map((_, i) => {
                    const angle = (i / RAY_COUNT) * 2 * Math.PI;
                    const x2 = Math.cos(angle) * rayLen;
                    const y2 = Math.sin(angle) * rayLen;
                    return (
                        <View
                            key={i}
                            style={{
                                position: 'absolute',
                                width: Math.abs(x2) || 1,
                                height: 2,
                                backgroundColor: 'rgba(253,224,71,0.35)',
                                left: 0,
                                top: 0,
                                transform: [
                                    { rotate: `${(i / RAY_COUNT) * 360}deg` },
                                    { translateX: rayLen / 2 },
                                ],
                                borderRadius: 1,
                            }}
                        />
                    );
                })}
            </Animated.View>
            {/* Sun disc */}
            <Animated.View
                style={{
                    position: 'absolute',
                    left: sunX - 22,
                    top:  sunY - 22,
                    width: 44,
                    height: 44,
                    borderRadius: 22,
                    backgroundColor: '#fde047',
                    opacity: glow.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1.0] }),
                    shadowColor: '#fde047',
                    shadowOffset: { width: 0, height: 0 },
                    shadowOpacity: 0.9,
                    shadowRadius: 20,
                    elevation: 10,
                }}
            />
            {/* Warm glow halo */}
            <Animated.View
                style={{
                    position: 'absolute',
                    left: sunX - 55,
                    top:  sunY - 55,
                    width: 110,
                    height: 110,
                    borderRadius: 55,
                    backgroundColor: '#fbbf24',
                    opacity: glow.interpolate({ inputRange: [0, 1], outputRange: [0.08, 0.22] }),
                }}
            />
        </View>
    );
};

// ─────────────────────────────────────────────────────
// CLOUD PUFFS  (drifting, wind-speed driven)
// ─────────────────────────────────────────────────────
interface CloudProps { windSpeed: number; dark?: boolean; }

const CloudPuffs: React.FC<CloudProps> = ({ windSpeed, dark = false }) => {
    const count  = 3;
    const baseMs = Math.max(6000 - windSpeed * 80, 2500); // faster at high wind
    const anims  = useRef(Array.from({ length: count }, (_, i) => new Animated.Value(i / count))).current;

    useEffect(() => {
        const loops = anims.map((anim, i) =>
            Animated.loop(
                Animated.timing(anim, {
                    toValue: 1,
                    duration: baseMs * (0.9 + i * 0.15),
                    easing: Easing.linear,
                    useNativeDriver: true,
                })
            )
        );
        loops.forEach(l => l.start());
        return () => loops.forEach(l => l.stop());
    }, [baseMs]);

    const CARD_W = 400;
    const cloudW = [110, 80, 95];
    const tops   = [12, 40, 20];
    const opas   = dark ? [0.18, 0.12, 0.15] : [0.28, 0.20, 0.24];
    const col    = dark ? '#1e293b' : '#e2e8f0';

    return (
        <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
            {anims.map((anim, i) => (
                <Animated.View
                    key={i}
                    style={{
                        position: 'absolute',
                        top: tops[i],
                        width: cloudW[i],
                        height: cloudW[i] * 0.55,
                        borderRadius: cloudW[i] * 0.3,
                        backgroundColor: col,
                        opacity: opas[i],
                        transform: [{
                            translateX: anim.interpolate({
                                inputRange:  [0, 1],
                                outputRange: [-cloudW[i], CARD_W + cloudW[i]],
                            }),
                        }],
                    }}
                />
            ))}
        </View>
    );
};

// ─────────────────────────────────────────────────────
// FOG  (multi-layer mist at different speeds)
// ─────────────────────────────────────────────────────
interface FogProps { windSpeed: number; }

const FogLayers: React.FC<FogProps> = ({ windSpeed }) => {
    const baseMs = Math.max(7000 - windSpeed * 60, 2800);
    const layers = [
        { opa: 0.22, top: 0,     ms: baseMs },
        { opa: 0.15, top: 40,    ms: baseMs * 1.3 },
        { opa: 0.18, top: 80,    ms: baseMs * 0.7 },
    ];
    const anims = useRef(layers.map((_, i) => new Animated.Value(i % 2 === 0 ? 0 : 1))).current;

    useEffect(() => {
        const loops = anims.map((anim, i) =>
            Animated.loop(
                Animated.sequence([
                    Animated.timing(anim, { toValue: 1,  duration: layers[i].ms, easing: Easing.linear, useNativeDriver: true }),
                    Animated.timing(anim, { toValue: 0, duration: layers[i].ms, easing: Easing.linear, useNativeDriver: true }),
                ])
            )
        );
        loops.forEach(l => l.start());
        return () => loops.forEach(l => l.stop());
    }, []);

    return (
        <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
            {layers.map((layer, i) => (
                <Animated.View
                    key={i}
                    style={{
                        position: 'absolute',
                        left: 0, right: 0,
                        top: layer.top,
                        height: 55,
                        backgroundColor: 'rgba(200,210,220,1)',
                        opacity: anims[i].interpolate({
                            inputRange:  [0, 0.5, 1],
                            outputRange: [layer.opa * 0.4, layer.opa, layer.opa * 0.4],
                        }),
                        transform: [{
                            translateX: anims[i].interpolate({
                                inputRange:  [0, 1],
                                outputRange: [-30, 30],
                            }),
                        }],
                    }}
                />
            ))}
        </View>
    );
};

// ─────────────────────────────────────────────────────
// LIGHTNING FLASH
// ─────────────────────────────────────────────────────
const LightningFlash: React.FC = () => {
    const flash = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        let timeout: ReturnType<typeof setTimeout>;
        const doFlash = () => {
            Animated.sequence([
                Animated.timing(flash, { toValue: 0.85, duration: 40,  useNativeDriver: true }),
                Animated.timing(flash, { toValue: 0,    duration: 80,  useNativeDriver: true }),
                Animated.timing(flash, { toValue: 0.5,  duration: 40,  useNativeDriver: true }),
                Animated.timing(flash, { toValue: 0,    duration: 200, useNativeDriver: true }),
            ]).start(() => {
                timeout = setTimeout(doFlash, 2500 + Math.random() * 5000);
            });
        };
        timeout = setTimeout(doFlash, 800 + Math.random() * 1500);
        return () => clearTimeout(timeout);
    }, []);

    return (
        <Animated.View
            pointerEvents="none"
            style={[StyleSheet.absoluteFillObject, { backgroundColor: '#dbeafe', opacity: flash }]}
        />
    );
};

// ─────────────────────────────────────────────────────
// MASTER WEATHER ANIMATION — receives live wind + code
// ─────────────────────────────────────────────────────
interface WeatherAnimProps { bg: WeatherBg; windSpeed: number; }

const WeatherAnimation: React.FC<WeatherAnimProps> = ({ bg, windSpeed }) => {
    switch (bg) {
        case 'clear':
            return <><SunRays /><CloudPuffs windSpeed={windSpeed} /></>;
        case 'cloudy':
            return <CloudPuffs windSpeed={windSpeed} dark />;
        case 'foggy':
            return <><FogLayers windSpeed={windSpeed} /><CloudPuffs windSpeed={windSpeed} dark /></>;
        case 'drizzle':
            return (
                <>
                    <RainLayer windSpeed={windSpeed} intensity="light" color="rgba(186,230,253,0.5)" />
                    <CloudPuffs windSpeed={windSpeed} dark />
                </>
            );
        case 'rainy':
            return (
                <>
                    <RainLayer windSpeed={windSpeed} intensity="moderate" color="rgba(147,197,253,0.65)" />
                    <CloudPuffs windSpeed={windSpeed} dark />
                </>
            );
        case 'snowy':
            return (
                <>
                    <SnowLayer windSpeed={windSpeed} />
                    <CloudPuffs windSpeed={windSpeed} />
                </>
            );
        case 'storm':
            return (
                <>
                    <RainLayer windSpeed={windSpeed} intensity="heavy" color="rgba(147,197,253,0.75)" />
                    <CloudPuffs windSpeed={windSpeed} dark />
                    <LightningFlash />
                </>
            );
        default:
            return null;
    }
};

// ─── Map Location Picker Modal ────────────────────────────────────────────────

interface LatLng { latitude: number; longitude: number; }

interface MapPickerProps {
    visible: boolean;
    initial: LatLng;
    onConfirm: (coord: LatLng) => void;
    onClose: () => void;
}

const MapPicker: React.FC<MapPickerProps> = ({ visible, initial, onConfirm, onClose }) => {
    const [pin, setPin] = useState<LatLng>(initial);
    const [region, setRegion] = useState<Region>({
        latitude:       initial.latitude,
        longitude:      initial.longitude,
        latitudeDelta:  0.15,
        longitudeDelta: 0.15,
    });

    // Reset pin when modal opens with new initial coords
    useEffect(() => {
        if (visible) {
            setPin(initial);
            setRegion({
                latitude:       initial.latitude,
                longitude:      initial.longitude,
                latitudeDelta:  0.15,
                longitudeDelta: 0.15,
            });
        }
    }, [visible, initial.latitude, initial.longitude]);

    const handleMapPress = (e: MapPressEvent) => {
        setPin(e.nativeEvent.coordinate);
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            onRequestClose={onClose}
        >
            <SafeAreaView style={mapStyles.container}>
                {/* Header */}
                <View style={mapStyles.header}>
                    <TouchableOpacity onPress={onClose} style={mapStyles.headerBtn} activeOpacity={0.7}>
                        <Ionicons name="close" size={22} color={COLORS.neutral[700]} />
                    </TouchableOpacity>
                    <Text style={mapStyles.headerTitle}>Select Location</Text>
                    <TouchableOpacity
                        onPress={() => onConfirm(pin)}
                        style={mapStyles.confirmBtn}
                        activeOpacity={0.85}
                    >
                        <Text style={mapStyles.confirmText}>Confirm</Text>
                    </TouchableOpacity>
                </View>

                {/* Hint */}
                <View style={mapStyles.hint}>
                    <Ionicons name="information-circle-outline" size={14} color={COLORS.neutral[500]} />
                    <Text style={mapStyles.hintText}>Tap anywhere on the map to move the pin</Text>
                </View>

                {/* Map */}
                <MapView
                    style={mapStyles.map}
                    region={region}
                    onRegionChangeComplete={setRegion}
                    onPress={handleMapPress}
                    showsUserLocation
                    showsMyLocationButton
                    toolbarEnabled={false}
                >
                    <Marker
                        coordinate={pin}
                        draggable
                        onDragEnd={e => setPin(e.nativeEvent.coordinate)}
                        pinColor={COLORS.primary[600]}
                    />
                </MapView>

                {/* Coordinates display */}
                <View style={mapStyles.coordBar}>
                    <Ionicons name="location" size={14} color={COLORS.primary[600]} />
                    <Text style={mapStyles.coordText}>
                        {pin.latitude.toFixed(4)}°, {pin.longitude.toFixed(4)}°
                    </Text>
                </View>
            </SafeAreaView>
        </Modal>
    );
};

const mapStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.neutral[100],
    },
    headerBtn: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.neutral[800],
    },
    confirmBtn: {
        backgroundColor: COLORS.primary[600],
        paddingHorizontal: 16,
        paddingVertical: 7,
        borderRadius: 20,
    },
    confirmText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 14,
    },
    hint: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: COLORS.neutral[50],
    },
    hintText: {
        fontSize: 12,
        color: COLORS.neutral[500],
    },
    map: {
        flex: 1,
    },
    coordBar: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderTopWidth: 1,
        borderTopColor: COLORS.neutral[100],
        backgroundColor: '#fff',
    },
    coordText: {
        fontSize: 13,
        color: COLORS.neutral[600],
        fontVariant: ['tabular-nums'],
    },
});

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
    const [mapOpen, setMapOpen] = useState(false);
    const [pickedCoord, setPickedCoord] = useState<LatLng | null>(null);

    // Persists the user's map-picked coord across renders & re-calls of load()
    const customCoordRef = useRef<LatLng | null>(null);

    const load = useCallback(async () => {
        setLoading(true);
        setError(false);
        setPermissionDenied(false);
        try {
            let coords: LatLng;

            if (customCoordRef.current) {
                // User previously picked a location on the map — always honour it
                coords = customCoordRef.current;
            } else {
                // Fall back to device GPS
                const { status } = await Location.requestForegroundPermissionsAsync();
                if (status !== 'granted') {
                    setPermissionDenied(true);
                    setLoading(false);
                    return;
                }
                const loc = await Location.getCurrentPositionAsync({
                    accuracy: Location.Accuracy.Balanced,
                });
                coords = { latitude: loc.coords.latitude, longitude: loc.coords.longitude };
                setPickedCoord(coords);
            }

            const data = await fetchWeather(coords.latitude, coords.longitude);

            // Use profile fallback name only when GPS is used and geocoding failed
            if (data.locationName === 'Your Location' && fallbackLocation && !customCoordRef.current) {
                data.locationName = fallbackLocation;
            }

            setWeather(data);
        } catch {
            setError(true);
        } finally {
            setLoading(false);
        }
    }, [fallbackLocation]);

    const handleMapConfirm = async (coord: LatLng) => {
        setMapOpen(false);
        // Store in ref BEFORE calling load() so it is always read correctly
        customCoordRef.current = coord;
        setPickedCoord(coord);
        await load();
    };

    // Only run once on mount — not every time load() identity changes
    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

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
    const bg = getWeatherBg(weather.weatherCode);
    // Default map center: Sri Lanka if no coord yet
    const mapCenter: LatLng = pickedCoord ?? { latitude: 7.8731, longitude: 80.7718 };

    return (
        <View style={styles.card}>
            {/* Animated gradient background */}
            <LinearGradient
                colors={BG_GRADIENTS[bg]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFillObject}
            />

            {/* Weather-specific animated overlay */}
            <WeatherAnimation bg={bg} windSpeed={weather.windSpeed} />

            {/* Dark overlay — lighter for clear/snowy, darker for storm */}
            <View
                style={[
                    styles.bgOverlay,
                    bg === 'clear'  && { backgroundColor: 'rgba(0,20,60,0.22)' },
                    bg === 'snowy'  && { backgroundColor: 'rgba(10,30,60,0.25)' },
                    bg === 'storm'  && { backgroundColor: 'rgba(0,0,0,0.50)' },
                ]}
                pointerEvents="none"
            />

            {/* Card content */}
            <View style={styles.cardContent}>
                {/* Left: info */}
                <View style={styles.info}>
                    {/* Location row — tap to open map picker */}
                    <TouchableOpacity
                        style={styles.locationRow}
                        onPress={() => setMapOpen(true)}
                        activeOpacity={0.75}
                    >
                        <Ionicons name="location" size={14} color="rgba(255,255,255,0.8)" />
                        <Text style={styles.locationText} numberOfLines={1}>
                            {weather.locationName}
                        </Text>
                        <Ionicons name="chevron-down" size={12} color="rgba(255,255,255,0.6)" style={{ marginLeft: 2 }} />
                    </TouchableOpacity>

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
                    <TouchableOpacity onPress={load} style={styles.refreshBtn} activeOpacity={0.7}>
                        <Ionicons name="refresh-outline" size={14} color="rgba(255,255,255,0.7)" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Map picker modal */}
            <MapPicker
                visible={mapOpen}
                initial={mapCenter}
                onConfirm={handleMapConfirm}
                onClose={() => setMapOpen(false)}
            />
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
    refreshBtn: {
        padding: 4,
    },
});

export default WeatherCard;
