/**
 * Safe wrapper around expo-speech-recognition.
 *
 * expo-speech-recognition requires a native dev/production build.
 * It CANNOT run in Expo Go because the native binary is not bundled there.
 * Calling require('expo-speech-recognition') in Expo Go crashes the app at the
 * module-registry level, before any JS try/catch can intercept it.
 *
 * Fix: detect Expo Go at runtime via expo-constants (always available) and
 * completely skip the require. All exported helpers become safe no-ops in Expo Go.
 * In dev/production builds the real native module is used.
 */
import { useEffect, useRef } from 'react';
import Constants from 'expo-constants';

// 'storeClient' = Expo Go; 'bare' = dev build; 'standalone' = production build
const IS_EXPO_GO: boolean = Constants.executionEnvironment === 'storeClient';

// ---------------------------------------------------------------------------
// Lazy loader – only runs when we KNOW the native module is present
// ---------------------------------------------------------------------------
let _nativeMod: any = null;
let _loadDone = false;

function loadMod(): any {
    if (_loadDone) return _nativeMod;
    _loadDone = true;

    if (IS_EXPO_GO) return null; // skip entirely – module does not exist in Expo Go

    try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const pkg = require('expo-speech-recognition');
        _nativeMod = pkg?.ExpoSpeechRecognitionModule ?? null;
    } catch (e) {
        console.warn('expo-speech-recognition: failed to load native module', e);
        _nativeMod = null;
    }
    return _nativeMod;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------
export function isSpeechAvailable(): boolean {
    return !IS_EXPO_GO && loadMod() !== null;
}

export const SpeechAPI = {
    async requestPermissionsAsync(): Promise<{ granted: boolean }> {
        const mod = loadMod();
        if (!mod) return { granted: false };
        try {
            return await mod.requestPermissionsAsync();
        } catch {
            return { granted: false };
        }
    },

    start(opts: { lang?: string; interimResults?: boolean; continuous?: boolean }): void {
        const mod = loadMod();
        if (!mod) return;
        try { mod.start(opts); } catch (e) { console.warn('SpeechAPI.start:', e); }
    },

    stop(): void {
        const mod = loadMod();
        if (!mod) return;
        try { mod.stop(); } catch { /* ignore */ }
    },
};

// ---------------------------------------------------------------------------
// Event hook – mirrors useSpeechRecognitionEvent but safe in Expo Go
// ---------------------------------------------------------------------------
type SpeechEventName = 'result' | 'error' | 'end' | 'start';

export function useSpeechEvent(event: SpeechEventName, handler: (e: any) => void): void {
    const handlerRef = useRef(handler);
    handlerRef.current = handler;

    useEffect(() => {
        if (IS_EXPO_GO) return; // no-op in Expo Go

        const mod = loadMod();
        if (!mod || typeof mod.addListener !== 'function') return;

        let sub: { remove(): void } | undefined;
        try {
            sub = mod.addListener(event, (e: any) => handlerRef.current(e));
        } catch (err) {
            console.warn('useSpeechEvent subscribe error:', err);
        }
        return () => { try { sub?.remove(); } catch { /* ignore */ } };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [event]);
}

