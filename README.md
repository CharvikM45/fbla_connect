# FBLA Connect

> **Design the Future of Member Engagement** — A competition-ready mobile application for FBLA Mobile Application Development 2025-2026

![FBLA Connect](https://img.shields.io/badge/FBLA-Connect-blue)
![React Native](https://img.shields.io/badge/React%20Native-Expo-green)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![License](https://img.shields.io/badge/License-MIT-yellow)

## 📱 Overview

FBLA Connect is a comprehensive mobile application designed to revolutionize member engagement for Future Business Leaders of America. The app helps students stay connected, informed, and engaged with FBLA, its events, and its broader community.

### Key Features

- **👤 Member Profiles** - Secure accounts with role-based access (Member, Officer, Adviser)
- **📅 Event Calendar** - Global and chapter calendars with smart reminders
- **📚 Resources Library** - FBLA documents with offline caching
- **📰 News Feed** - Personalized announcements and updates
- **📱 Social Integration** - Aggregated chapter social media feeds
- **🤖 AI Assistant** - Smart chatbot for FBLA questions and recommendations
- **🏆 Gamification** - Badges, XP, levels, and leaderboards

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (Mac) or Android Studio/Emulator

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/fbla-connect.git
cd fbla-connect

# Install dependencies
npm install

# Start the development server
npm start
```

### Running the App

```bash
# iOS Simulator
npm run ios

# Android Emulator
npm run android

# Web Browser
npm run web
```

## 📁 Project Structure

```
fbla-connect/
├── App.tsx                 # Main app entry point
├── app.json               # Expo configuration
├── src/
│   ├── features/          # Feature modules
│   │   ├── auth/          # Authentication
│   │   ├── profile/       # User profiles
│   │   ├── calendar/      # Events & calendar
│   │   ├── resources/     # Document library
│   │   ├── news/          # News feed
│   │   ├── social/        # Social integration
│   │   ├── ai/            # AI features
│   │   │   ├── assistant/ # Chatbot
│   │   │   ├── planner/   # Competition planner
│   │   │   └── summarizer/# Document summaries
│   │   ├── gamification/  # Badges & XP
│   │   └── chapter/       # Officer tools
│   └── shared/
│       ├── components/    # Reusable UI
│       ├── hooks/         # Custom hooks
│       ├── navigation/    # Navigation config
│       ├── theme/         # Design system
│       └── store.ts       # Redux store
└── assets/                # Images, fonts
```

## 🛠 Technology Stack

| Category | Technology |
|----------|------------|
| Framework | React Native + Expo |
| Language | TypeScript |
| State Management | Redux Toolkit |
| Navigation | React Navigation 6 |
| UI Components | React Native Paper |
| Storage | AsyncStorage + SQLite |
| Authentication | Firebase Auth (planned) |
| AI | OpenAI API (planned) |

## 📋 Competition Compliance

This app addresses all requirements from the 2025-2026 FBLA Mobile Application Development guidelines:

- ✅ Member profiles with secure login
- ✅ Event calendar with reminders
- ✅ Access to FBLA resources and documents
- ✅ News feed with announcements
- ✅ Social media integration
- ✅ Smartphone deployable (iOS & Android)
- ✅ Runs standalone with no errors
- ✅ Documentation and copyright compliance

## 🎨 Design System

The app uses a custom design system with FBLA brand colors:

- **Primary**: FBLA Blue (`#2563EB`)
- **Secondary**: FBLA Gold (`#F59E0B`)
- **Typography**: System fonts with consistent sizing
- **Accessibility**: WCAG AA compliant color contrast

## 📄 Third-Party Libraries

| Library | License | Purpose |
|---------|---------|---------|
| React Navigation | MIT | Navigation |
| Redux Toolkit | MIT | State management |
| React Native Paper | MIT | UI components |
| Expo | MIT | Development platform |
| React Native Vector Icons | MIT | Icons |

## 👥 Team

- **Developer**: [Your Name]
- **School**: [Your School]
- **Chapter**: [Your Chapter]

## 📝 License

This project is created for educational purposes as part of the FBLA Mobile Application Development competition.

---

*Future Business Leaders of America® is a registered trademark. This app is a student project and not officially affiliated with FBLA-PBL, Inc.*
