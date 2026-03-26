# SuppleScan 🔬

> **Know exactly what you're putting in your body.**

A full-stack mobile application that empowers fitness enthusiasts and health-conscious individuals to make informed decisions about dietary supplements, instantly, by scanning a barcode.

[![React Native](https://img.shields.io/badge/React_Native-Expo-20232A?style=flat&logo=react)](https://expo.dev/)
[![Firebase](https://img.shields.io/badge/Firebase-Auth_%2B_Firestore-FFCA28?style=flat&logo=firebase)](https://firebase.google.com/)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=flat&logo=javascript)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Open Food Facts](https://img.shields.io/badge/API-Open_Food_Facts-336791?style=flat)](https://world.openfoodfacts.org/)
[![EAS Update](https://img.shields.io/badge/EAS-Deployed-4630EB?style=flat&logo=expo)](https://expo.dev/accounts/mahiptl/projects/SuppleScan/updates/18c400b2-c164-41c4-8cb2-2f2b26d00651)

<img src="assets/demo.gif" width="300"/>


---

## 🚀 Live Demo

**Deployed via Expo EAS** - try it on your device right now:

1. Download [Expo Go](https://expo.dev/go) on your iOS or Android device
2. Open this link on your phone: [**Launch SuppleScan**](https://expo.dev/accounts/mahiptl/projects/SuppleScan/updates/18c400b2-c164-41c4-8cb2-2f2b26d00651)
3. Tap "Open in Expo Go"

---

## The Problem

The supplement industry is a $167 billion market with minimal consumer transparency. Labels are confusing, ingredient lists are long, and hidden allergens are dangerous. Most people scan a barcode at the grocery store and have no idea what they're actually buying.

SuppleScan changes that in under 3 seconds.

---

## What It Does

Point your camera at any supplement barcode. SuppleScan cross-references the product against a live ingredient safety database and returns an instant analysis, safety score, allergen flags, caffeine warnings, and a full ingredient breakdown, all before you leave the store aisle.

---

## Features

### Authentication
- Email/password signup and login via Firebase Auth
- Guest mode for frictionless first-time use
- Persistent session management across app restarts

### Real-Time Barcode Scanning
- Live camera feed with real-time barcode detection
- Supports UPC, EAN, Code128, and QR code formats
- Flash toggle for low-light scanning environments

### Intelligent Product Analysis
- Live product data fetched from the Open Food Facts API (1M+ products)
- Proprietary safety scoring algorithm, 0 to 10 scale with color-coded ratings
  - 🟢 **Safe** - clean ingredients, no flags
  - 🟡 **Caution** - review recommended
  - 🔴 **Avoid** - significant concerns detected
- Full ingredient-by-ingredient breakdown with individual safety notes
- Allergen detection across 6 major categories: dairy, soy, gluten, nuts, eggs, shellfish
- Caffeine content analysis with consumption warnings

### Personal Dashboard
- Lifetime scan counter and usage statistics
- Daily supplement health tips
- Personalized alerts based on your scan history
- Recent scan activity feed

### History & Favorites
- Full searchable scan history with filtering
- Add personal notes to any past scan
- One-tap save to Favorites for quick re-access
- Pull-to-refresh sync across sessions

### User Profile
- Account management and preferences
- App settings and information

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Framework | React Native + Expo | Cross-platform mobile (iOS + Android) |
| Language | JavaScript (ES6+) | Application logic |
| Navigation | React Navigation | Screen routing and tab management |
| Auth | Firebase Authentication | Secure user accounts and sessions |
| Database | Cloud Firestore | Real-time NoSQL data persistence |
| Camera | Expo Camera API | Barcode scanning and flash control |
| External API | Open Food Facts API | Product and ingredient data |

---

## Architecture

```
supplescan/
├── api/
│   └── openFoodFactsAPI.js       # API integration layer
├── app/
│   └── Screens/
│       ├── HomeScreen.jsx         # Dashboard + stats
│       ├── ScannerScreen.jsx      # Camera + barcode detection
│       ├── SupplementDetailsScreen.jsx  # Safety analysis results
│       ├── HistoryScreen.jsx      # Scan history + search
│       ├── FavouritesScreen.jsx   # Saved supplements
│       ├── ProfileScreen.jsx      # User settings
│       ├── Login.jsx              # Authentication
│       ├── SignUpScreen.jsx       # User registration
│       └── MainTabs.jsx           # Tab navigation controller
├── firebase/
│   ├── FirebaseConfig.js          # Project configuration
│   ├── auth.js                    # Auth service layer
│   └── firestore.js               # Database service layer
└── assets/
    └── icon.png
```

---

## Getting Started

### Prerequisites
- Node.js v16+
- Expo CLI: `npm install -g expo-cli`
- Expo Go app on your iOS or Android device
- A Firebase project (free tier is sufficient)

### Installation

```bash
# Clone the repository
git clone https://github.com/mahip16/supplement-verification-app.git
cd supplement-verification-app

# Install dependencies
npm install
```

### Firebase Setup

1. Create a project at [Firebase Console](https://console.firebase.google.com/)
2. Enable **Authentication** → Email/Password provider
3. Create a **Firestore Database** in production mode
4. Copy your config object into `firebase/FirebaseConfig.js`:

```js
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};
```

### Run the App

```bash
npx expo start
```

Scan the QR code with Expo Go, or press `i` for iOS simulator / `a` for Android emulator.

---

## How It Works

```
User scans barcode
        ↓
Expo Camera detects barcode value
        ↓
App calls Open Food Facts API with barcode
        ↓
Ingredient list extracted from API response
        ↓
Safety algorithm scores each ingredient
        ↓
Aggregate score + allergen flags computed
        ↓
Results displayed with full breakdown
        ↓
Scan saved to user's Firestore history
```

---

## Roadmap

- [ ] AI-powered natural language ingredient explanations
- [ ] Side-by-side supplement comparison tool
- [ ] Alternative product recommendations for flagged items
- [ ] Daily dosage tracking and reminders
- [ ] Dark mode
- [ ] Offline mode with cached product data
- [ ] Export history as PDF or CSV
- [ ] Multi-language support
- [ ] Integration with Apple Health and Google Fit

---

## Disclaimer

SuppleScan is for **informational purposes only** and does not constitute medical advice. Always consult a qualified healthcare professional before beginning any supplement regimen. Product data is sourced from Open Food Facts — accuracy may vary by product.

---

## Author

**Mahi Patel**
Computer Science @ Toronto Metropolitan University

[GitHub](https://github.com/mahip16) · [LinkedIn](https://linkedin.com/in/mahip16)

---

## Acknowledgments

- [Open Food Facts](https://world.openfoodfacts.org/) — open-source product database
- [Expo](https://expo.dev/) — React Native development platform
- [Firebase](https://firebase.google.com/) — backend infrastructure

---

*Built to solve a real problem. Scan smarter.*
