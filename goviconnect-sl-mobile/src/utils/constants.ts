// App Constants

export const COLORS = {
    primary: {
        50: '#f0fdf4',
        100: '#dcfce7',
        200: '#bbf7d0',
        300: '#86efac',
        400: '#4ade80',
        500: '#22c55e',
        600: '#16a34a',
        700: '#15803d',
        800: '#166534',
        900: '#14532d',
    },
    secondary: {
        50: '#faf5ff',
        100: '#f3e8ff',
        200: '#e9d5ff',
        300: '#d8b4fe',
        400: '#c084fc',
        500: '#a855f7',
        600: '#9333ea',
        700: '#7e22ce',
        800: '#6b21a8',
        900: '#581c87',
    },
    neutral: {
        50: '#fafafa',
        100: '#f5f5f5',
        200: '#e5e5e5',
        300: '#d4d4d4',
        400: '#a3a3a3',
        500: '#737373',
        600: '#525252',
        700: '#404040',
        800: '#262626',
        900: '#171717',
    },
    success: '#22c55e',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
    white: '#ffffff',
    black: '#000000',
};

export const SPACING = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
};

export const FONT_SIZES = {
    xs: 10,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 18,
    xxl: 24,
    xxxl: 32,
};

export const BORDER_RADIUS = {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    xxl: 20,
    full: 9999,
};

export const SHADOW = {
    sm: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    md: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    lg: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 5,
    },
};

export const CROP_CATEGORIES = [
    { id: 'all', nameEn: 'All', nameSi: 'සියල්ල' },
    { id: 'vegetables', nameEn: 'Vegetables', nameSi: 'එළවළු' },
    { id: 'fruits', nameEn: 'Fruits', nameSi: 'පළතුරු' },
    { id: 'tea', nameEn: 'Tea', nameSi: 'තේ' },
    { id: 'paddy', nameEn: 'Paddy', nameSi: 'වී' },
    { id: 'spices', nameEn: 'Spices', nameSi: 'කුළුබඩු' },
];

// Categories that match AddCropGuide form — used for filtering guides in LearnHub
export const GUIDE_CATEGORIES = [
    { id: 'all', nameEn: 'All', nameSi: 'සියල්ල' },
    { id: 'Vegetable', nameEn: 'Vegetable', nameSi: 'එළවළු' },
    { id: 'Fruit', nameEn: 'Fruit', nameSi: 'පළතුරු' },
    { id: 'Grain', nameEn: 'Grain', nameSi: 'ධාන්‍ය' },
    { id: 'Spice', nameEn: 'Spice', nameSi: 'කුළුබඩු' },
    { id: 'Legume', nameEn: 'Legume', nameSi: 'රනිල' },
    { id: 'Herb', nameEn: 'Herb', nameSi: 'ඖෂධ පැළෑටි' },
    { id: 'Root Crop', nameEn: 'Root Crop', nameSi: 'මූල ශාක' },
    { id: 'Other', nameEn: 'Other', nameSi: 'අනෙකුත්' },
];

export const LAND_UNITS = [
    { id: 'acres', nameEn: 'Acres', nameSi: 'අක්කර' },
    { id: 'hectares', nameEn: 'Hectares', nameSi: 'හෙක්ටයාර' },
    { id: 'perches', nameEn: 'Perches', nameSi: 'පර්චස්' },
];

export const MEETING_STATUSES = {
    pending: { color: COLORS.warning, label: 'Pending', labelSi: 'පොරොත්තුවෙන්' },
    confirmed: { color: COLORS.success, label: 'Confirmed', labelSi: 'තහවුරු කර ඇත' },
    completed: { color: COLORS.info, label: 'Completed', labelSi: 'සම්පූර්ණ විය' },
    cancelled: { color: COLORS.error, label: 'Cancelled', labelSi: 'අවලංගු විය' },
};

export const NOTIFICATION_TYPES: Record<string, { icon: string; color: string }> = {
    meeting: { icon: 'calendar', color: COLORS.primary[500] },
    tip: { icon: 'bulb-outline', color: COLORS.warning },
    guide: { icon: 'book-outline', color: COLORS.info },
    chat: { icon: 'chatbubble-outline', color: COLORS.secondary[500] },
    system: { icon: 'information-circle-outline', color: COLORS.neutral[500] },
};

export const APP_VERSION = '1.0.0';
