📱 SuppleScan

A supplement verification & tracking app built with React Native, Expo, and Firebase

SuppleScan helps users quickly verify supplement products by scanning barcodes and retrieving trusted product information. The app provides secure authentication, a clean and intuitive UI, and real-time data storage using Firebase.

🚀 Features
🔒 User Authentication
- Email/password sign-up & login
- Firebase Authentication with secure session handling

📸 Barcode Scanning
- Real-time scanning powered by Expo’s camera API
- Fast and accurate detection for UPC barcodes
- Auto-fetches supplement information from Firestore

📦 Product Verification
- Displays verified supplement details
- Flags unknown or unverified products
- Product search & history (if included in your version)

☁️ Real-Time Cloud Integration
- Firebase Firestore for storing product metadata
- Real-time syncing across authenticated devices
- Safe reads and writes with Firestore security rules

🎨 Polished Mobile UI
- Built with React Native & Expo
- Responsive layout and clean component architecture
- Consistent color palette + user-friendly navigation

🛠️ Tech Stack
Frontend:
- React Native
- Expo
- JavaScript / TypeScript (if applicable)
Backend:
- Firebase Authentication
- Firebase Firestore
- Firebase Storage (if used for images)
Additional Tools:
- Expo Barcode Scanner
- React Navigation
- Git & GitHub for version control

🔧 Installation & Setup
Make sure you have Node.js, Git, and Expo CLI installed.

# Clone the repository
git clone https://github.com/mahip16/SuppleScan.git
cd SuppleScan

# Install dependencies
npm install

# Start the Expo development server
npx expo start


Open the app using:
- Expo Go on iOS/Android
- Or an emulator/simulator

📘 How It Works
1. User signs in using Firebase Authentication
2. Scan a supplement using the barcode scanner
3. SuppleScan checks Firestore for a matching UPC
4. If found → displays product details
5. If not found → flags as unknown or prompts admin verification
6. Users can view previously scanned products (if implemented)

🧪 Future Enhancements
- Product ingredient breakdown
- AI-powered supplement safety checker
- User dashboards & health tracking
- Dark mode
- Admin console for adding new supplements

👤 Author
Mahi Patel
Computer Science @ Toronto Metropolitan University
GitHub: github.com/mahip16
LinkedIn: www.linkedin.com/in/mahiptl 
