# Goviconnect SL Mobile App

A comprehensive mobile application for Sri Lankan farmers, built with React Native, Expo, TypeScript, and NativeWind.

![Goviconnect SL](https://img.shields.io/badge/Goviconnect-SL-22c55e?style=for-the-badge&logo=leaf&logoColor=white)
![React Native](https://img.shields.io/badge/React_Native-0.74-61DAFB?style=flat-square&logo=react)
![Expo](https://img.shields.io/badge/Expo-51-000020?style=flat-square&logo=expo)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-3178C6?style=flat-square&logo=typescript)

## 📱 Features

### 🏠 Home Screen
- Cursive app title in header
- Quick action cards for AI tools, LearnHub, and Meetings
- My Crops chips with quick navigation
- Feed showing tips, guides, and meeting reminders
- Notification and chat icons with unread badges
- Language toggle button

### 📚 LearnHub
- Searchable crop library with category filters
- Detailed crop guides with:
  - Overview (climate, soil, season info)
  - Common diseases with severity indicators
  - Treatment methods
  - Best practices
  - Media (videos and images)
- Save guides to library
- Download for offline access
- Bilingual content (English/Sinhala)

### 🤖 AI Tools

#### Crop Doctor
- Take photo or select from gallery
- AI-powered disease detection
- Diagnosis results with:
  - Disease name
  - Confidence score
  - Treatment tips
  - Prevention tips
- Save results for future reference
- Share with expert via chat
- Diagnosis history

#### Price Prediction
- Multi-step form with:
  - Crop selection
  - Land size input with unit selection
  - Optional details (district, season)
- Price range estimation (low to high)
- Market analysis summary
- Save and share predictions
- Prediction history

### 👥 Expert Meetings
- Browse upcoming expert sessions
- View meeting details (expert, time, attendees)
- Join meeting functionality
- Set meeting reminders
- Book meetings from chat conversations
- View all my meetings (pending, confirmed, completed)

### 👤 Profile
- User profile with crop badges
- Quick shortcuts to:
  - Saved LearnHub items
  - Diagnosis history
  - Prediction history
  - My meetings
- Settings:
  - Language toggle (English/Sinhala)
  - Lite Mode (data saver)
  - Offline downloads management
  - Push notifications toggle
- Help & FAQ with expandable sections
- Logout functionality

### 💬 Chat with Experts
- Chat list with online status
- Real-time messaging UI
- Quick actions to attach:
  - Diagnosis results
  - Price predictions
- "Book Expert Meeting" CTA button
- Message sync status indicators

### 🔔 Notifications
- Multiple notification types (meetings, tips, chats, guides)
- Filter by all/unread
- Deep linking to relevant screens

### 🌐 Bilingual Support
- Full English and Sinhala translations
- Language persistence across sessions
- RTL-friendly components

### 📴 Offline Capabilities
- Save LearnHub content for offline reading
- Queue AI requests when offline
- Automatic sync when back online
- Offline status indicator in header

### 🔋 Lite Mode (Data Saver)
- Lazy load images
- Reduced data usage
- Image placeholders with tap-to-load

## 🛠️ Tech Stack

- **Framework**: React Native with Expo SDK 51
- **Language**: TypeScript
- **Styling**: NativeWind (Tailwind CSS for React Native)
- **Navigation**: React Navigation 6 (Bottom Tabs + Native Stack)
- **State Management**: React Context + Hooks
- **Internationalization**: i18next + react-i18next
- **Local Storage**: AsyncStorage
- **Network**: @react-native-community/netinfo
- **Icons**: @expo/vector-icons (Ionicons)
- **Animations**: React Native Reanimated
- **Image Picker**: expo-image-picker

## 📁 Project Structure

```
goviconnect-sl-mobile/
├── App.tsx                    # Main app entry point
├── package.json               # Dependencies
├── tailwind.config.js         # Tailwind/NativeWind config
├── babel.config.js            # Babel config
├── tsconfig.json              # TypeScript config
├── app.json                   # Expo config
├── global.css                 # Global Tailwind styles
├── nativewind-env.d.ts        # NativeWind types
└── src/
    ├── assets/
    │   ├── fonts/             # Custom fonts
    │   └── images/            # Static images
    ├── components/            # Reusable UI components
    │   ├── Header.tsx
    │   ├── PrimaryButton.tsx
    │   ├── ActionCard.tsx
    │   ├── FeedCard.tsx
    │   ├── Chip.tsx
    │   ├── CropCard.tsx
    │   ├── EmptyState.tsx
    │   ├── Toast.tsx
    │   ├── InputField.tsx
    │   └── index.ts
    ├── context/               # React Context providers
    │   ├── AppContext.tsx
    │   └── index.ts
    ├── data/                  # Mock data files
    │   ├── crops.json
    │   ├── learnhub.json
    │   ├── meetings.json
    │   ├── experts.json
    │   ├── tips.json
    │   ├── chats.json
    │   └── mockAiResponses.json
    ├── hooks/                 # Custom hooks
    ├── i18n/                  # Internationalization
    │   ├── index.ts
    │   ├── en.json            # English translations
    │   └── si.json            # Sinhala translations
    ├── navigation/            # Navigation setup
    │   ├── RootNavigator.tsx
    │   ├── TabNavigator.tsx
    │   └── index.ts
    ├── screens/               # App screens
    │   ├── auth/
    │   │   ├── Splash.tsx
    │   │   ├── Onboarding.tsx
    │   │   ├── LanguageSelect.tsx
    │   │   ├── Login.tsx
    │   │   ├── Register.tsx
    │   │   └── ForgotPassword.tsx
    │   ├── home/
    │   │   └── Home.tsx
    │   ├── learnhub/
    │   │   ├── LearnHub.tsx
    │   │   ├── CropDetails.tsx
    │   │   ├── SavedLibrary.tsx
    │   │   └── OfflineDownloads.tsx
    │   ├── ai/
    │   │   ├── AIHome.tsx
    │   │   ├── cropDoctor/
    │   │   │   ├── CropDoctorUpload.tsx
    │   │   │   ├── CropDoctorResult.tsx
    │   │   │   └── DiagnosisHistory.tsx
    │   │   └── pricePrediction/
    │   │       ├── PriceForm.tsx
    │   │       ├── PriceResult.tsx
    │   │       └── PredictionHistory.tsx
    │   ├── meetings/
    │   │   ├── Meetings.tsx
    │   │   ├── MeetingDetails.tsx
    │   │   └── MyMeetings.tsx
    │   ├── profile/
    │   │   ├── Profile.tsx
    │   │   ├── Settings.tsx
    │   │   └── HelpFAQ.tsx
    │   ├── notifications/
    │   │   └── Notifications.tsx
    │   └── chats/
    │       ├── ChatsList.tsx
    │       ├── ChatDetail.tsx
    │       └── BookMeetingFromChat.tsx
    ├── services/              # API and storage services
    │   ├── storage.ts         # AsyncStorage wrapper
    │   ├── netinfo.ts         # Network status service
    │   ├── queueService.ts    # Offline queue service
    │   └── mockApi.ts         # Mock API responses
    └── utils/                 # Utility functions
        ├── constants.ts       # App constants (colors, etc.)
        └── validators.ts      # Validation helpers
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Expo CLI (`npm install -g expo-cli`)
- Expo Go app on your mobile device (for testing)

### Installation

1. **Clone the repository** (or navigate to the project folder):
   ```bash
   cd goviconnect-sl-mobile
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run start
   ```
   or
   ```bash
   npx expo start
   ```

4. **Run on your device**:
   - Scan the QR code with Expo Go (Android) or Camera app (iOS)
   - Or press `a` for Android emulator / `i` for iOS simulator

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run start` | Start Expo development server |
| `npm run android` | Start on Android emulator |
| `npm run ios` | Start on iOS simulator |
| `npm run web` | Start web version |

## 🎨 Design System

### Colors

| Color | Hex | Usage |
|-------|-----|-------|
| Primary (Leaf Green) | `#22c55e` | Main actions, highlights |
| Secondary (Amber) | `#f59e0b` | Secondary actions |
| Success | `#22c55e` | Success states |
| Warning | `#f59e0b` | Warning states |
| Error | `#ef4444` | Error states |
| Info | `#3b82f6` | Information |

### Components

- **Header**: Consistent header with back button, title, and action icons
- **PrimaryButton**: Main action button with variants (primary, secondary, outline, ghost)
- **ActionCard**: Card with icon for quick actions
- **FeedCard**: Card for feed items (tips, guides, meetings)
- **Chip**: Selection chips for categories and crops
- **CropCard**: Card displaying crop information
- **EmptyState**: Empty state placeholder with action
- **Toast**: Notification toast with auto-dismiss
- **InputField**: Text input with label, icon, and error state

## 🌍 Internationalization

The app supports two languages:
- **English (en)** - Default
- **Sinhala (si)** - සිංහල

Language can be changed from:
1. Language selection screen (first launch)
2. Settings screen
3. Language icon in home header

All translations are stored in `src/i18n/en.json` and `src/i18n/si.json`.

## 📴 Offline Mode

The app is designed to work offline:

1. **LearnHub Content**: Download guides for offline reading
2. **AI Requests**: Queued when offline, processed when online
3. **Messages**: Queued for sending when connection restored
4. **Status Indicator**: Header shows connection status

## 🤝 Mock Data

Since this is a frontend-only implementation, all API calls use mock data:

- `src/services/mockApi.ts` - Simulated API responses
- `src/data/*.json` - Static mock data files

To integrate with a real backend:
1. Replace `mockApi.ts` functions with actual API calls
2. Update storage service to sync with backend
3. Implement proper authentication flow

## 📝 Notes

- This is a **frontend-only** implementation with simulated backend responses
- All data is stored locally using AsyncStorage
- AI analysis and price predictions use mock responses
- For production, integrate with actual backend APIs

## 📄 License

This project is for educational purposes as part of a Final Year Project (FYP).

---

**Built with ❤️ for Sri Lankan farmers**
