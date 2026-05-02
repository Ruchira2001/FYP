import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage Keys
export const STORAGE_KEYS = {
    LANGUAGE: '@goviconnect_language',
    SETTINGS: '@goviconnect_settings',
    USER: '@goviconnect_user',
    SAVED_LEARNHUB: '@goviconnect_saved_learnhub',
    OFFLINE_DOWNLOADS: '@goviconnect_offline_downloads',
    DIAGNOSIS_HISTORY: '@goviconnect_diagnosis_history',
    PREDICTION_HISTORY: '@goviconnect_prediction_history',
    MY_MEETINGS: '@goviconnect_my_meetings',
    CHATS: '@goviconnect_chats',
    MESSAGES: '@goviconnect_messages',
    QUEUED_ACTIONS: '@goviconnect_queued_actions',
    NOTIFICATIONS: '@goviconnect_notifications',
    ONBOARDING_COMPLETE: '@goviconnect_onboarding_complete',
    AUTH_TOKEN: '@goviconnect_auth_token',
    MY_CROPS: '@goviconnect_my_crops',
};

// Generic storage functions
export const setItem = async <T>(key: string, value: T): Promise<void> => {
    try {
        const jsonValue = JSON.stringify(value);
        await AsyncStorage.setItem(key, jsonValue);
    } catch (error) {
        console.error(`Error saving ${key}:`, error);
        throw error;
    }
};

export const getItem = async <T>(key: string): Promise<T | null> => {
    try {
        const jsonValue = await AsyncStorage.getItem(key);
        return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (error) {
        console.error(`Error reading ${key}:`, error);
        return null;
    }
};

export const removeItem = async (key: string): Promise<void> => {
    try {
        await AsyncStorage.removeItem(key);
    } catch (error) {
        console.error(`Error removing ${key}:`, error);
    }
};

export const clearAll = async (): Promise<void> => {
    try {
        await AsyncStorage.clear();
    } catch (error) {
        console.error('Error clearing storage:', error);
    }
};

// Settings
export interface AppSettings {
    liteMode: boolean;
    notifications: boolean;
    language: string;
}

export const defaultSettings: AppSettings = {
    liteMode: false,
    notifications: true,
    language: 'en',
};

export const getSettings = async (): Promise<AppSettings> => {
    const settings = await getItem<AppSettings>(STORAGE_KEYS.SETTINGS);
    return settings || defaultSettings;
};

export const saveSettings = async (settings: AppSettings): Promise<void> => {
    await setItem(STORAGE_KEYS.SETTINGS, settings);
};

// User
export interface User {
    id: string;
    name: string;
    email: string;
    phone: string;
    district: string;
    crops: string[];
    avatar?: string;
    expertId?: string;
}

export const getUser = async (): Promise<User | null> => {
    return await getItem<User>(STORAGE_KEYS.USER);
};

export const saveUser = async (user: User): Promise<void> => {
    await setItem(STORAGE_KEYS.USER, user);
};

// Saved LearnHub Items
export interface SavedLearnHubItem {
    id: string;
    title: string;
    titleSi: string;
    category: string;
    savedAt: string;
    isDownloaded: boolean;
    data?: any; // Full guide data for offline access
}

export const getSavedLearnHub = async (): Promise<SavedLearnHubItem[]> => {
    const items = await getItem<SavedLearnHubItem[]>(STORAGE_KEYS.SAVED_LEARNHUB);
    return items || [];
};

export const saveLearnHubItem = async (item: SavedLearnHubItem): Promise<void> => {
    const items = await getSavedLearnHub();
    const exists = items.find(i => i.id === item.id);
    if (!exists) {
        items.push(item);
        await setItem(STORAGE_KEYS.SAVED_LEARNHUB, items);
    }
};

const getUserScopedStorageKey = async (baseKey: string): Promise<string> => {
    const user = await getUser();
    const userId = user?.id?.trim();
    return userId ? `${baseKey}:${userId}` : baseKey;
};

const getScopedHistory = async <T>(baseKey: string): Promise<T[]> => {
    const scopedKey = await getUserScopedStorageKey(baseKey);
    const scopedHistory = await getItem<T[]>(scopedKey);

    if (scopedHistory) {
        return scopedHistory;
    }

    // One-time fallback for users upgrading from older global keys.
    if (scopedKey !== baseKey) {
        const legacyHistory = await getItem<T[]>(baseKey);
        if (legacyHistory && legacyHistory.length > 0) {
            await setItem(scopedKey, legacyHistory);
            return legacyHistory;
        }
    }

    return [];
};

const saveScopedHistory = async <T>(baseKey: string, history: T[]): Promise<void> => {
    const scopedKey = await getUserScopedStorageKey(baseKey);
    await setItem(scopedKey, history);
};

export const removeLearnHubItem = async (id: string): Promise<void> => {
    const items = await getSavedLearnHub();
    const filtered = items.filter(i => i.id !== id);
    await setItem(STORAGE_KEYS.SAVED_LEARNHUB, filtered);
};

// Diagnosis History
export interface DiagnosisResult {
    id: string;
    imageUri: string;
    diseaseName: string;
    diseaseNameSi: string;
    confidence: number;
    treatments: string[];
    treatmentsSi: string[];
    preventionTips: string[];
    preventionTipsSi: string[];
    recommendedChemicals?: string[];
    recommendedChemicalsSi?: string[];
    createdAt: string;
    synced: boolean;
}

export const getDiagnosisHistory = async (): Promise<DiagnosisResult[]> => {
    return await getScopedHistory<DiagnosisResult>(STORAGE_KEYS.DIAGNOSIS_HISTORY);
};

export const saveDiagnosisResult = async (result: DiagnosisResult): Promise<void> => {
    const history = await getDiagnosisHistory();
    history.unshift(result);
    await saveScopedHistory(STORAGE_KEYS.DIAGNOSIS_HISTORY, history);
};

// Prediction History
export interface PredictionResult {
    id: string;
    crop: string;
    cropSi: string;
    variety?: string;
    landSize: number;
    landUnit: string;
    district?: string;
    season?: string;
    expectedYield?: string;
    priceLow: number;
    priceHigh: number;
    summary: string;
    summarySi: string;
    createdAt: string;
    synced: boolean;
}

export const getPredictionHistory = async (): Promise<PredictionResult[]> => {
    return await getScopedHistory<PredictionResult>(STORAGE_KEYS.PREDICTION_HISTORY);
};

export const savePredictionResult = async (result: PredictionResult): Promise<void> => {
    const history = await getPredictionHistory();
    history.unshift(result);
    await saveScopedHistory(STORAGE_KEYS.PREDICTION_HISTORY, history);
};

// Meetings
export interface Meeting {
    id: string;
    expertId: string;
    expertName: string;
    expertAvatar?: string;
    topic: string;
    topicSi: string;
    dateTime: string;
    duration: number;
    status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
    notes?: string;
    meetingLink?: string;
    reminderSet: boolean;
    source: 'scheduled' | 'chat_booking';
}

export const getMyMeetings = async (): Promise<Meeting[]> => {
    const meetings = await getItem<Meeting[]>(STORAGE_KEYS.MY_MEETINGS);
    return meetings || [];
};

export const saveMeeting = async (meeting: Meeting): Promise<void> => {
    const meetings = await getMyMeetings();
    meetings.push(meeting);
    await setItem(STORAGE_KEYS.MY_MEETINGS, meetings);
};

export const updateMeeting = async (id: string, updates: Partial<Meeting>): Promise<void> => {
    const meetings = await getMyMeetings();
    const index = meetings.findIndex(m => m.id === id);
    if (index !== -1) {
        meetings[index] = { ...meetings[index], ...updates };
        await setItem(STORAGE_KEYS.MY_MEETINGS, meetings);
    }
};

// Chats
export interface Chat {
    id: string;
    expertId: string;
    expertName: string;
    expertAvatar?: string;
    lastMessage: string;
    lastMessageTime: string;
    unreadCount: number;
}

export interface Message {
    id: string;
    chatId: string;
    senderId: string;
    senderType: 'user' | 'expert';
    content: string;
    type: 'text' | 'image' | 'diagnosis' | 'prediction';
    attachmentData?: any;
    timestamp: string;
    synced: boolean;
}

export const getChats = async (): Promise<Chat[]> => {
    const chats = await getItem<Chat[]>(STORAGE_KEYS.CHATS);
    return chats || [];
};

export const getMessages = async (chatId: string): Promise<Message[]> => {
    const allMessages = await getItem<Record<string, Message[]>>(STORAGE_KEYS.MESSAGES);
    return allMessages?.[chatId] || [];
};

export const saveMessage = async (message: Message): Promise<void> => {
    const allMessages = await getItem<Record<string, Message[]>>(STORAGE_KEYS.MESSAGES) || {};
    if (!allMessages[message.chatId]) {
        allMessages[message.chatId] = [];
    }
    allMessages[message.chatId].push(message);
    await setItem(STORAGE_KEYS.MESSAGES, allMessages);
};

// Notifications
export interface Notification {
    id: string;
    type: 'meeting' | 'tip' | 'guide' | 'chat' | 'system';
    title: string;
    titleSi: string;
    body: string;
    bodySi: string;
    read: boolean;
    createdAt: string;
    data?: any;
}

export const getNotifications = async (): Promise<Notification[]> => {
    const notifications = await getItem<Notification[]>(STORAGE_KEYS.NOTIFICATIONS);
    return notifications || [];
};

export const saveNotification = async (notification: Notification): Promise<void> => {
    const notifications = await getNotifications();
    notifications.unshift(notification);
    await setItem(STORAGE_KEYS.NOTIFICATIONS, notifications);
};

export const markNotificationRead = async (id: string): Promise<void> => {
    const notifications = await getNotifications();
    const index = notifications.findIndex(n => n.id === id);
    if (index !== -1) {
        notifications[index].read = true;
        await setItem(STORAGE_KEYS.NOTIFICATIONS, notifications);
    }
};

// Onboarding
export const isOnboardingComplete = async (): Promise<boolean> => {
    const complete = await getItem<boolean>(STORAGE_KEYS.ONBOARDING_COMPLETE);
    return complete === true;
};

export const setOnboardingComplete = async (): Promise<void> => {
    await setItem(STORAGE_KEYS.ONBOARDING_COMPLETE, true);
};

// Auth
export const isLoggedIn = async (): Promise<boolean> => {
    const token = await getItem<string>(STORAGE_KEYS.AUTH_TOKEN);
    return !!token;
};

export const setAuthToken = async (token: string): Promise<void> => {
    await setItem(STORAGE_KEYS.AUTH_TOKEN, token);
};

export const logout = async (): Promise<void> => {
    await removeItem(STORAGE_KEYS.AUTH_TOKEN);
    await removeItem(STORAGE_KEYS.USER);
};

// My Crops
export const getMyCrops = async (): Promise<string[]> => {
    const crops = await getItem<string[]>(STORAGE_KEYS.MY_CROPS);
    return crops || ['tea', 'paddy', 'tomato', 'chili'];
};

export const saveMyCrops = async (crops: string[]): Promise<void> => {
    await setItem(STORAGE_KEYS.MY_CROPS, crops);
};
