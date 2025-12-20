# 📦 SuppleScan

**A mobile app that verifies supplement products by scanning barcodes and providing safety insights.**

---

## 📖 Overview

SuppleScan helps fitness enthusiasts and health-conscious individuals make informed decisions about dietary supplements. By simply scanning a product's barcode, users can instantly view detailed ingredient breakdowns, safety scores, allergen warnings, and personalized recommendations. The app tracks your supplement history and saves your favorites, making it easy to stay on top of your health routine.

---

## ✨ Features

### 🔐 Authentication
- Email and password signup/login with Firebase
- Guest mode available
- Secure session management

### 📷 Barcode Scanning
- Real-time camera barcode detection
- Supports UPC, EAN, Code128, and QR codes
- Flash toggle for low-light environments

### 🧴 Product Analysis
- Fetches data from Open Food Facts API
- Safety score (0-10 scale) with color-coded ratings: 🟢 Safe / 🟡 Caution / 🔴 Avoid
- Detailed ingredient breakdown with safety info
- Allergen detection (dairy, soy, gluten, nuts, eggs, shellfish)
- Caffeine content warnings

### 📊 Dashboard & Tracking
- View total scans and statistics
- Daily supplement tips
- Personalized health alerts
- Recent scan history

### 📜 History & Favorites
- Search and filter scan history
- Add personal notes to scans
- Save favorites for quick access
- Pull-to-refresh sync

### 👤 Profile
- Account management
- App information and settings
- Sign in/out functionality

---

## 🗂️ Screens

- **Home** – Dashboard with stats and quick actions
- **Scanner** – Camera barcode scanner
- **History** – Past scans with search and filters
- **Profile** – User settings and app info
- **Favourites** – Saved supplements
- **Supplement Details** – Product analysis and safety breakdown

---

## 📁 Project Structure

```
supplescan/
├── .expo/
├── api/
│   └── openFoodFactsAPI.js
├── app/
│   └── Screens/
│       ├── FavouritesScreen.jsx
│       ├── FirebaseTestScreen.jsx
│       ├── HistoryScreen.jsx
│       ├── HomeScreen.jsx
│       ├── Login.jsx
│       ├── MainTabs.jsx
│       ├── ProfileScreen.jsx
│       ├── ScannerScreen.jsx
│       ├── SignUpScreen.jsx
│       ├── SplashScreen.jsx
│       ├── SupplementDetailsScreen.jsx
│       ├── WelcomeScreen.jsx
│       ├── index.jsx
│       └── test.jsx
├── assets/
│   └── icon.png
├── firebase/
│   ├── auth.js
│   ├── FirebaseConfig.js
│   └── firestore.js
├── node_modules/
├── .gitignore
├── app.json
├── metro.config.js
├── package-lock.json
├── package.json
└── README.md
```

---

## 🛠️ Tech Stack

| Component | Technology |
|-----------|-----------|
| **Framework** | React Native + Expo |
| **Language** | JavaScript |
| **Navigation** | React Navigation |
| **Backend** | Firebase (Auth + Firestore) |
| **Camera** | Expo Camera API |
| **Data Source** | Open Food Facts API |

---

## 🔧 How It Works

1. User creates account or continues as guest
2. User scans a supplement barcode with camera
3. App fetches product data from Open Food Facts API
4. App analyzes ingredients using built-in safety database
5. App displays safety score, ingredient breakdown, and warnings
6. Scan saved to user's history in Firestore
7. User can add to favorites or add notes

---

## 📥 Setup / Installation

### Prerequisites
- Node.js (v16+)
- Expo CLI: `npm install -g expo-cli`

### Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/mahip16/SuppleScan.git
   cd SuppleScan
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Firebase**
   - Create project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Authentication (Email/Password)
   - Create Firestore Database
   - Add config to `firebase/FirebaseConfig.js`

4. **Run the app**
   ```bash
   npx expo start
   ```

5. **Open on device**
   - Scan QR code with Expo Go app
   - Or press `i` (iOS) / `a` (Android)

---

## 🚀 Future Improvements

- AI-powered ingredient explanations
- Supplement comparison tool
- Alternative product recommendations
- Dosage tracking
- Dark mode
- Offline mode with cached data
- Export history as PDF/CSV
- Multi-language support
- Integration with fitness apps

---

## ⚠️ Disclaimer

**This app is for informational purposes only and does not provide medical advice.**

Always consult a qualified healthcare professional before starting any supplement regimen. Individual results may vary. Product data is sourced from Open Food Facts and accuracy may vary.

---

## 👤 Author

**Mahi Patel**  
Computer Science @ Toronto Metropolitan University

🔗 GitHub: [@mahip16](https://github.com/mahip16)

---

## 🙏 Acknowledgments

- [Open Food Facts](https://world.openfoodfacts.org/) – Product database
- [Expo](https://expo.dev/) – Development framework
- [Firebase](https://firebase.google.com/) – Backend services

---

**Version 1.0.0** | Built with ❤️ for fitness enthusiasts
