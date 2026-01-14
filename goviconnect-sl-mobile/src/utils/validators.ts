// Validation utilities

export const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

export const validatePhone = (phone: string): boolean => {
    // Sri Lankan phone number format
    const phoneRegex = /^(?:\+94|0)?[0-9]{9,10}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
};

export const validatePassword = (password: string): {
    valid: boolean;
    errors: string[];
} => {
    const errors: string[] = [];

    if (password.length < 6) {
        errors.push('Password must be at least 6 characters');
    }
    if (!/[A-Z]/.test(password)) {
        errors.push('Password must contain at least one uppercase letter');
    }
    if (!/[0-9]/.test(password)) {
        errors.push('Password must contain at least one number');
    }

    return {
        valid: errors.length === 0,
        errors,
    };
};

export const validateRequired = (value: string): boolean => {
    return value.trim().length > 0;
};

export const validateMinLength = (value: string, minLength: number): boolean => {
    return value.trim().length >= minLength;
};

export const validateMaxLength = (value: string, maxLength: number): boolean => {
    return value.trim().length <= maxLength;
};

export const validateNumber = (value: string): boolean => {
    return !isNaN(parseFloat(value)) && isFinite(parseFloat(value));
};

export const validatePositiveNumber = (value: string): boolean => {
    const num = parseFloat(value);
    return !isNaN(num) && isFinite(num) && num > 0;
};

// Format utilities
export const formatDate = (dateString: string, locale: string = 'en'): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString(locale === 'si' ? 'si-LK' : 'en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
};

export const formatTime = (dateString: string, locale: string = 'en'): string => {
    const date = new Date(dateString);
    return date.toLocaleTimeString(locale === 'si' ? 'si-LK' : 'en-US', {
        hour: '2-digit',
        minute: '2-digit',
    });
};

export const formatDateTime = (dateString: string, locale: string = 'en'): string => {
    return `${formatDate(dateString, locale)} ${formatTime(dateString, locale)}`;
};

export const formatCurrency = (amount: number, locale: string = 'en'): string => {
    return new Intl.NumberFormat(locale === 'si' ? 'si-LK' : 'en-US', {
        style: 'currency',
        currency: 'LKR',
        minimumFractionDigits: 0,
    }).format(amount);
};

export const formatNumber = (num: number, locale: string = 'en'): string => {
    return new Intl.NumberFormat(locale === 'si' ? 'si-LK' : 'en-US').format(num);
};

export const getRelativeTime = (dateString: string, locale: string = 'en'): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (locale === 'si') {
        if (diffMins < 1) return 'දැන්';
        if (diffMins < 60) return `මිනිත්තු ${diffMins}කට පෙර`;
        if (diffHours < 24) return `පැය ${diffHours}කට පෙර`;
        if (diffDays < 7) return `දින ${diffDays}කට පෙර`;
        return formatDate(dateString, locale);
    }

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return formatDate(dateString, locale);
};

// Generate unique ID
export const generateId = (): string => {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Truncate text
export const truncateText = (text: string, maxLength: number): string => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
};

// Capitalize first letter
export const capitalize = (text: string): string => {
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};
