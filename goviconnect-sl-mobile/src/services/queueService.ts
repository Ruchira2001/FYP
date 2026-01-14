import { getItem, setItem, STORAGE_KEYS } from './storage';
import { getIsConnected, addConnectionListener } from './netinfo';

export type QueuedActionType =
    | 'analyze_crop'
    | 'predict_price'
    | 'book_meeting'
    | 'send_message'
    | 'save_item';

export interface QueuedAction {
    id: string;
    type: QueuedActionType;
    data: any;
    createdAt: string;
    synced: boolean;
    syncedAt?: string;
    retryCount: number;
}

class QueueService {
    private isProcessing = false;
    private unsubscribe: (() => void) | null = null;

    constructor() {
        // Listen for connection changes
        this.unsubscribe = addConnectionListener((status) => {
            if (status === 'syncing' || status === 'updated') {
                this.processQueue();
            }
        });
    }

    async addToQueue(type: QueuedActionType, data: any): Promise<string> {
        const id = `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        const action: QueuedAction = {
            id,
            type,
            data,
            createdAt: new Date().toISOString(),
            synced: false,
            retryCount: 0,
        };

        const queue = await this.getQueue();
        queue.push(action);
        await this.saveQueue(queue);

        // Try to process immediately if online
        if (getIsConnected()) {
            this.processQueue();
        }

        return id;
    }

    async getQueue(): Promise<QueuedAction[]> {
        const queue = await getItem<QueuedAction[]>(STORAGE_KEYS.QUEUED_ACTIONS);
        return queue || [];
    }

    async getPendingActions(): Promise<QueuedAction[]> {
        const queue = await this.getQueue();
        return queue.filter(action => !action.synced);
    }

    async getSyncedActions(): Promise<QueuedAction[]> {
        const queue = await this.getQueue();
        return queue.filter(action => action.synced);
    }

    private async saveQueue(queue: QueuedAction[]): Promise<void> {
        await setItem(STORAGE_KEYS.QUEUED_ACTIONS, queue);
    }

    async processQueue(): Promise<void> {
        if (this.isProcessing || !getIsConnected()) {
            return;
        }

        this.isProcessing = true;

        try {
            const queue = await this.getQueue();
            const pending = queue.filter(action => !action.synced);

            for (const action of pending) {
                try {
                    // Simulate API call
                    await this.processAction(action);

                    // Mark as synced
                    action.synced = true;
                    action.syncedAt = new Date().toISOString();
                } catch (error) {
                    console.error(`Failed to process action ${action.id}:`, error);
                    action.retryCount += 1;

                    // Remove if too many retries
                    if (action.retryCount >= 3) {
                        console.log(`Removing action ${action.id} after 3 failed retries`);
                    }
                }
            }

            // Filter out failed actions and save
            const updatedQueue = queue.filter(a => a.retryCount < 3);
            await this.saveQueue(updatedQueue);
        } finally {
            this.isProcessing = false;
        }
    }

    private async processAction(action: QueuedAction): Promise<void> {
        // Simulate network request delay
        await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));

        // In a real app, this would make API calls based on action type
        switch (action.type) {
            case 'analyze_crop':
                console.log('Syncing crop analysis:', action.data);
                break;
            case 'predict_price':
                console.log('Syncing price prediction:', action.data);
                break;
            case 'book_meeting':
                console.log('Syncing meeting booking:', action.data);
                break;
            case 'send_message':
                console.log('Syncing message:', action.data);
                break;
            case 'save_item':
                console.log('Syncing saved item:', action.data);
                break;
            default:
                console.log('Unknown action type:', action.type);
        }
    }

    async clearSyncedActions(): Promise<void> {
        const queue = await this.getQueue();
        const pending = queue.filter(action => !action.synced);
        await this.saveQueue(pending);
    }

    async clearAll(): Promise<void> {
        await this.saveQueue([]);
    }

    async getActionById(id: string): Promise<QueuedAction | undefined> {
        const queue = await this.getQueue();
        return queue.find(action => action.id === id);
    }

    destroy(): void {
        if (this.unsubscribe) {
            this.unsubscribe();
        }
    }
}

// Singleton instance
export const queueService = new QueueService();

// Helper hook
import { useState, useEffect } from 'react';

export const useQueuedActions = () => {
    const [pendingCount, setPendingCount] = useState(0);
    const [pending, setPending] = useState<QueuedAction[]>([]);

    useEffect(() => {
        const loadQueue = async () => {
            const actions = await queueService.getPendingActions();
            setPending(actions);
            setPendingCount(actions.length);
        };

        loadQueue();

        // Refresh periodically
        const interval = setInterval(loadQueue, 5000);

        return () => clearInterval(interval);
    }, []);

    return { pendingCount, pending };
};
