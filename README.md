# Goviconnect SL

> **Empowering Sri Lankan Agriculture Through Technology**

A modern agri-tech platform connecting Sri Lankan farmers with AI-powered crop disease diagnosis, agricultural experts, knowledge resources, and agricultural supplies.

## 🌿 Project Overview

Goviconnect SL consists of three main components:

1. **Mobile App (React Native)** - For Farmers and Agricultural Experts
2. **Admin Dashboard (Web)** - For system administrators
3. **Backend API** - Shared services (to be implemented)

## 🎨 Design System

### Color Palette

| Color | Hex | Usage |
|-------|-----|-------|
| Leaf Green (Primary) | `#4CAF50` | Primary actions, active states |
| Forest Green (Secondary) | `#1B5E20` | Headers, accents |
| Sunrise Gold (Accent) | `#FFB300` | Highlights, ratings |
| Off-White (Background) | `#F7F8FA` | Page backgrounds |
| White | `#FFFFFF` | Cards, surfaces |
| Text Primary | `#1A1A1A` | Main text |
| Text Secondary | `#6B7280` | Descriptions |

### Typography

- **English**: Inter / Poppins (Google Fonts)
- **Sinhala**: Noto Sans Sinhala
- **Spacing**: 8px grid system
- **Border Radius**: 16px (rounded corners)

### Design Principles

- Premium minimal aesthetic
- Glassmorphism accents
- Soft shadows and gradients
- Nature-inspired, calm vibe
- Mobile-first, accessible
- Sinhala + English bilingual support

## 📱 Mobile App Features

### Farmer Features
- AI Crop Doctor (disease diagnosis via camera)
- Knowledge Hub (articles, guides, videos)
- Expert Meetings (video consultations)
- Agricultural Shop (seeds, fertilizers, tools)
- Profile & Settings

### Expert Features
- Farmer Request Management
- Video Consultations
- Response History
- Expert Profile

## 💻 Admin Dashboard Features

- Dashboard Overview with KPIs
- User Management
- Expert Management & Approvals
- Shop & Product Management
- Knowledge Content Management
- Meeting Scheduling
- AI Diagnosis Logs
- Reports & Analytics
- System Settings

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- React Native CLI (for mobile)
- Expo CLI (optional, for easier mobile development)

### Mobile App

```bash
cd mobile
npm install
npm start
```

### Admin Dashboard

```bash
cd admin
npm install
npm run dev
```

## 📁 Project Structure

```
goviconnect-sl/
├── mobile/                # React Native mobile app
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── screens/       # App screens
│   │   ├── navigation/    # Navigation config
│   │   ├── theme/         # Design tokens
│   │   ├── i18n/          # Translations
│   │   └── utils/         # Helpers
│   └── assets/            # Images, fonts
├── admin/                 # Web admin dashboard
│   ├── src/
│   │   ├── components/    # UI components
│   │   ├── pages/         # Dashboard pages
│   │   ├── styles/        # CSS / design tokens
│   │   └── utils/         # Helpers
│   └── public/            # Static assets
└── docs/                  # Documentation
    └── design/            # UI mockups
```

## 🌍 Internationalization

The app supports:
- **English** (default)
- **සිංහල** (Sinhala)

Language can be toggled from the app settings.

## 📄 License

© 2024 Goviconnect SL. All rights reserved.

---

*Designed with ❤️ for Sri Lankan farmers*
