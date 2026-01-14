import NetInfo, { NetInfoState, NetInfoSubscription } from '@react-native-community/netinfo';
import { useState, useEffect, useCallback } from 'react';

export type ConnectionStatus = 'offline' | 'syncing' | 'updated';

let connectionStatus: ConnectionStatus = 'updated';
let isConnected = true;
let listeners: ((status: ConnectionStatus) => void)[] = [];

// Initialize NetInfo monitoring
let subscription: NetInfoSubscription | null = null;

export const initNetInfo = () => {
    if (subscription) return;

    subscription = NetInfo.addEventListener((state: NetInfoState) => {
        const wasConnected = isConnected;
        isConnected = state.isConnected ?? false;

        if (!isConnected) {
            connectionStatus = 'offline';
        } else if (!wasConnected && isConnected) {
            // Just came online - start syncing
            connectionStatus = 'syncing';
            // Simulate sync completion after 2 seconds
            setTimeout(() => {
                connectionStatus = 'updated';
                notifyListeners();
            }, 2000);
        } else {
            connectionStatus = 'updated';
        }

        notifyListeners();
    });
};

export const stopNetInfo = () => {
    if (subscription) {
        subscription();
        subscription = null;
    }
};

const notifyListeners = () => {
    listeners.forEach(listener => listener(connectionStatus));
};

export const addConnectionListener = (listener: (status: ConnectionStatus) => void) => {
    listeners.push(listener);
    return () => {
        listeners = listeners.filter(l => l !== listener);
    };
};

export const getConnectionStatus = (): ConnectionStatus => connectionStatus;

export const getIsConnected = (): boolean => isConnected;

// Check current network state
export const checkNetworkState = async (): Promise<NetInfoState> => {
    return await NetInfo.fetch();
};

// Custom hook for connection status
export const useConnectionStatus = () => {
    const [status, setStatus] = useState<ConnectionStatus>(connectionStatus);
    const [connected, setConnected] = useState<boolean>(isConnected);

    useEffect(() => {
        const unsubscribe = addConnectionListener((newStatus) => {
            setStatus(newStatus);
            setConnected(newStatus !== 'offline');
        });

        // Initialize
        initNetInfo();

        return () => {
            unsubscribe();
        };
    }, []);

    const refresh = useCallback(async () => {
        const state = await checkNetworkState();
        const newConnected = state.isConnected ?? false;
        setConnected(newConnected);
        setStatus(newConnected ? 'updated' : 'offline');
    }, []);

    return { status, isConnected: connected, refresh };
};

// Simulate connection for testing
export const simulateOffline = () => {
    isConnected = false;
    connectionStatus = 'offline';
    notifyListeners();
};

export const simulateOnline = () => {
    isConnected = true;
    connectionStatus = 'syncing';
    notifyListeners();

    setTimeout(() => {
        connectionStatus = 'updated';
        notifyListeners();
    }, 2000);
};
