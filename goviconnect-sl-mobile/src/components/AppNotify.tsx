/**
 * AppNotify — global styled toast & confirm dialog system.
 *
 * Usage (anywhere in the app, no context needed):
 *
 *   import { AppNotify } from '../components';
 *
 *   AppNotify.toast('Profile saved!', 'success');
 *   AppNotify.toast('Something went wrong.', 'error');
 *
 *   AppNotify.confirm('Log out?', 'You will be signed out.', () => doLogout());
 *   AppNotify.confirm('Delete Guide?', 'This cannot be undone.', () => deleteIt(), {
 *       confirmLabel: 'Delete',
 *       destructive: true,
 *   });
 *
 * Place <AppNotifyHost /> once at the root of the app (inside App.tsx).
 */

import React, { useEffect, useRef, useState } from 'react';
import {
    Animated,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../utils/constants';

// ─── Types ────────────────────────────────────────────────────────────────────

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastItem {
    id: number;
    message: string;
    type: ToastType;
}

interface ConfirmOptions {
    title: string;
    message: string;
    onConfirm: () => void;
    confirmLabel?: string;
    destructive?: boolean;
    onCancel?: () => void;
}

// ─── Singleton refs (wired in AppNotifyHost) ─────────────────────────────────

let _addToast: ((msg: string, type: ToastType) => void) | null = null;
let _showConfirm: ((opts: ConfirmOptions) => void) | null = null;
let _toastIdCounter = 0;

// ─── Public API ───────────────────────────────────────────────────────────────

export const AppNotify = {
    toast(message: string, type: ToastType = 'info') {
        _addToast?.(message, type);
    },
    confirm(
        title: string,
        message: string,
        onConfirm: () => void,
        opts?: { confirmLabel?: string; destructive?: boolean; onCancel?: () => void }
    ) {
        _showConfirm?.({ title, message, onConfirm, ...opts });
    },
};

// ─── Toast config ─────────────────────────────────────────────────────────────

const TOAST_CONFIG: Record<ToastType, { bg: string; icon: keyof typeof Ionicons.glyphMap; iconColor: string; label: string }> = {
    success: { bg: COLORS.primary[600],  icon: 'checkmark-circle',     iconColor: '#fff', label: 'Success' },
    error:   { bg: '#dc2626',            icon: 'close-circle',          iconColor: '#fff', label: 'Error'   },
    warning: { bg: '#d97706',            icon: 'warning',               iconColor: '#fff', label: 'Warning' },
    info:    { bg: COLORS.info,          icon: 'information-circle',    iconColor: '#fff', label: 'Info'    },
};

// ─── Single animated toast item ───────────────────────────────────────────────

const ToastItem: React.FC<{ item: ToastItem; onDone: (id: number) => void }> = ({ item, onDone }) => {
    const translateY = useRef(new Animated.Value(80)).current;
    const opacity    = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Slide in
        Animated.parallel([
            Animated.spring(translateY, { toValue: 0, useNativeDriver: true, tension: 120, friction: 8 }),
            Animated.timing(opacity,    { toValue: 1, duration: 220, useNativeDriver: true }),
        ]).start();

        // Auto-dismiss after 3 s
        const t = setTimeout(() => dismiss(), 3200);
        return () => clearTimeout(t);
    }, []);

    const dismiss = () => {
        Animated.parallel([
            Animated.timing(translateY, { toValue: 80, duration: 200, useNativeDriver: true }),
            Animated.timing(opacity,    { toValue: 0,  duration: 200, useNativeDriver: true }),
        ]).start(() => onDone(item.id));
    };

    const cfg = TOAST_CONFIG[item.type];

    return (
        <Animated.View style={[styles.toastRow, { transform: [{ translateY }], opacity }]}>
            <View style={[styles.toast, { backgroundColor: cfg.bg }]}>
                {/* Colored left accent strip */}
                <View style={[styles.toastAccent, { backgroundColor: 'rgba(255,255,255,0.25)' }]} />

                <Ionicons name={cfg.icon} size={22} color={cfg.iconColor} style={{ marginLeft: 6 }} />

                <View style={styles.toastTextBlock}>
                    <Text style={styles.toastLabel}>{cfg.label}</Text>
                    <Text style={styles.toastMsg} numberOfLines={3}>{item.message}</Text>
                </View>

                <TouchableOpacity onPress={dismiss} style={styles.toastClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <Ionicons name="close" size={18} color="rgba(255,255,255,0.85)" />
                </TouchableOpacity>
            </View>
        </Animated.View>
    );
};

// ─── AppNotifyHost — place once at the app root ───────────────────────────────

export const AppNotifyHost: React.FC = () => {
    const [toasts, setToasts]       = useState<ToastItem[]>([]);
    const [confirm, setConfirm]     = useState<ConfirmOptions | null>(null);
    const confirmAnim               = useRef(new Animated.Value(0)).current;

    // Wire singletons
    useEffect(() => {
        _addToast = (message, type) => {
            const id = ++_toastIdCounter;
            setToasts(prev => [...prev, { id, message, type }]);
        };
        _showConfirm = (opts) => {
            setConfirm(opts);
            confirmAnim.setValue(0);
            Animated.spring(confirmAnim, { toValue: 1, useNativeDriver: true, tension: 120, friction: 9 }).start();
        };
        return () => { _addToast = null; _showConfirm = null; };
    }, []);

    const removeToast = (id: number) => setToasts(prev => prev.filter(t => t.id !== id));

    const closeConfirm = (cb?: () => void) => {
        Animated.timing(confirmAnim, { toValue: 0, duration: 180, useNativeDriver: true }).start(() => {
            setConfirm(null);
            cb?.();
        });
    };

    const isDestructive = confirm?.destructive ?? false;

    return (
        <>
            {/* ── Toast stack (bottom of screen) ── */}
            <View style={styles.toastContainer} pointerEvents="box-none">
                {toasts.map(item => (
                    <ToastItem key={item.id} item={item} onDone={removeToast} />
                ))}
            </View>

            {/* ── Confirm dialog (modal) ── */}
            <Modal
                visible={!!confirm}
                transparent
                animationType="fade"
                statusBarTranslucent
                onRequestClose={() => closeConfirm(confirm?.onCancel)}
            >
                <View style={styles.dialogBackdrop}>
                    <Animated.View
                        style={[
                            styles.dialog,
                            {
                                transform: [{ scale: confirmAnim.interpolate({ inputRange: [0, 1], outputRange: [0.88, 1] }) }],
                                opacity: confirmAnim,
                            },
                        ]}
                    >
                        {/* Icon header */}
                        <View style={[
                            styles.dialogIconBox,
                            { backgroundColor: isDestructive ? '#fee2e2' : COLORS.primary[50] },
                        ]}>
                            <Ionicons
                                name={isDestructive ? 'trash-outline' : 'help-circle-outline'}
                                size={32}
                                color={isDestructive ? '#dc2626' : COLORS.primary[600]}
                            />
                        </View>

                        <Text style={styles.dialogTitle}>{confirm?.title}</Text>
                        <Text style={styles.dialogMessage}>{confirm?.message}</Text>

                        {/* Buttons */}
                        <View style={styles.dialogButtons}>
                            <TouchableOpacity
                                style={styles.dialogCancelBtn}
                                onPress={() => closeConfirm(confirm?.onCancel)}
                                activeOpacity={0.75}
                            >
                                <Text style={styles.dialogCancelText}>Cancel</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[
                                    styles.dialogConfirmBtn,
                                    { backgroundColor: isDestructive ? '#dc2626' : COLORS.primary[600] },
                                ]}
                                onPress={() => closeConfirm(confirm?.onConfirm)}
                                activeOpacity={0.8}
                            >
                                <Text style={styles.dialogConfirmText}>
                                    {confirm?.confirmLabel ?? (isDestructive ? 'Delete' : 'Confirm')}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </Animated.View>
                </View>
            </Modal>
        </>
    );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    /* Toast */
    toastContainer: {
        position: 'absolute',
        bottom: 90,
        left: 16,
        right: 16,
        zIndex: 9999,
        gap: 8,
    },
    toastRow: {
        width: '100%',
    },
    toast: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 14,
        paddingVertical: 12,
        paddingRight: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.22,
        shadowRadius: 10,
        elevation: 8,
        overflow: 'hidden',
    },
    toastAccent: {
        width: 4,
        alignSelf: 'stretch',
        marginRight: 10,
    },
    toastTextBlock: {
        flex: 1,
        marginLeft: 8,
    },
    toastLabel: {
        fontSize: 11,
        fontWeight: '700',
        color: 'rgba(255,255,255,0.8)',
        textTransform: 'uppercase',
        letterSpacing: 0.6,
        marginBottom: 1,
    },
    toastMsg: {
        fontSize: 13,
        fontWeight: '500',
        color: '#ffffff',
        lineHeight: 18,
    },
    toastClose: {
        padding: 2,
        marginLeft: 8,
    },

    /* Confirm dialog */
    dialogBackdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 28,
    },
    dialog: {
        backgroundColor: '#ffffff',
        borderRadius: 24,
        padding: 28,
        width: '100%',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.25,
        shadowRadius: 24,
        elevation: 12,
    },
    dialogIconBox: {
        width: 68,
        height: 68,
        borderRadius: 34,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    dialogTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.neutral[800],
        marginBottom: 8,
        textAlign: 'center',
    },
    dialogMessage: {
        fontSize: 14,
        color: COLORS.neutral[500],
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 24,
    },
    dialogButtons: {
        flexDirection: 'row',
        gap: 12,
        width: '100%',
    },
    dialogCancelBtn: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        backgroundColor: COLORS.neutral[100],
        borderWidth: 1,
        borderColor: COLORS.neutral[200],
    },
    dialogCancelText: {
        fontSize: 15,
        fontWeight: '600',
        color: COLORS.neutral[600],
    },
    dialogConfirmBtn: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
    },
    dialogConfirmText: {
        fontSize: 15,
        fontWeight: '700',
        color: '#ffffff',
    },
});
